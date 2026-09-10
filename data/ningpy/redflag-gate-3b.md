# ningpy/redflag-gate-3b

## Resumen

`redflag-gate-3b` es un modelo de extracción de información clínica en formato JSON, desarrollado por el usuario `ningpy` (la model card referencia también la cuenta `peiyan-ning`) y publicado bajo licencia Apache 2.0. No es un modelo conversacional generalista: es un módulo especializado que forma parte de un sistema de detección de banderas rojas médicas compuesto por cinco módulos más un motor de reglas en Python (especificación V20, 59 reglas). Su única tarea es identificar ocho atributos de población del paciente (gates) a partir de texto clínico o mensajes de pacientes, y devolverlos como un objeto JSON.

Técnicamente es un fine-tune con LoRA fusionado sobre `Qwen/Qwen2.5-3B-Instruct`, con 3.085.938.688 parámetros totales (aproximadamente 3,09 mil millones) y un repositorio de 6,2 GB en formato safetensors. El entrenamiento se centró en tres idiomas: inglés (incluyendo la variante Brunei English o *Manglish*), chino y malayo, con especial atención a partículas coloquiales como *lah*, *kah* o *meh* y a préstamos léxicos del malayo y el chino en notas clínicas.

Su relevancia es acotada pero clara: en lugar de intentar un diagnóstico, actúa como capa de normalización determinista que alimenta a un motor de reglas posterior. El autor reporta un F1 de 0,906 y una precisión del 91,9 % para el pipeline completo de cinco módulos más el motor de reglas V46 sobre un conjunto de test independiente de 2246 casos, si bien esa métrica corresponde al sistema completo y no a este módulo aislado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-3B-Instruct) con adaptadores LoRA fusionados en los pesos |
| Parametros totales | 3.085.938.688 (≈3,09 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens de forma nativa, pero la model card no confirma este valor para el fine-tune |
| Tipos de cuantizacion | No se publican cuantizaciones propias; al ser safetensors de transformers admite las conversiones habituales (fp16, bf16, int8, int4) mediante herramientas externas. No hay GGUF publicado |
| Idiomas soportados | en, zh, ms (inglés, chino y malayo, con orientación a Brunei English / Manglish) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-3B-Instruct`, un transformer decoder-only de la familia Qwen2.5 (arquitectura con RoPE, grouped query attention y SwiGLU, según la especificación pública del modelo base). Sobre esa base se aplicó un ajuste LoRA con rango r=32, alpha=64, dropout=0,05, aplicado a los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se realizó durante 2 épocas con tasa de aprendizaje 2e-4, scheduler coseno, warmup del 5 % y batch efectivo de 32. Los adaptadores se fusionaron posteriormente en los pesos del modelo, de modo que el artefacto publicado no requiere cargar LoRA por separado.

El corpus de entrenamiento es multilingüe (inglés, chino y malayo) e incluye explícitamente ruido coloquial: la model card documenta el tratamiento de partículas de *Manglish* (*lah*, *kah*, *meh*, *ah*, *leh*, *lor*, *sia*, *one*) y mapeos léxicos como `anak saya` → `is_child`, `hamil` → `is_pregnant` o `kencing manis` → `has_diabetes`. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO; únicamente se documenta el ajuste supervisado vía LoRA. La innovación técnica del proyecto no reside en el modelo en sí, sino en su integración como módulo de extracción dentro de un sistema de cinco extractores especializados (síntomas, contexto, modificadores, síntomas negados y gates) coordinados por un motor de reglas determinista.

## Capacidades

- Extracción de ocho *gates* de población como salida JSON estructurada: `is_pregnant`, `is_postpartum`, `is_child`, `is_baby`, `is_elderly`, `is_immunocompromised`, `has_diabetes` y `has_asthma`.
- Detección de indicadores naturales, no solo palabras clave: "she's 8 months pregnant", "baby 4 months old" o "grandma fell down" se mapean correctamente a los gates correspondientes.
- Capacidad multilingüe y de mezcla de idiomas en una misma frase (inglés de Brunei, malayo y chino), incluyendo terminología coloquial y préstamos léxicos.
- Manejo de negativas y consultas no clínicas: ante entradas como "what causes headache?" devuelve `{"gates": {}}` en lugar de forzar una extracción.
- Salida de múltiples gates simultáneos cuando el texto lo justifica (por ejemplo, "asthmatic kid wheezing" → `is_child` y `has_asthma`).
- Formato de salida estrictamente JSON, apto para consumo programático directo.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito. Tampoco está diseñado para generar texto libre, resumir ni mantener conversaciones abiertas.

## Casos de uso

- Triaje previo en servicios de urgencias y líneas telefónicas de salud: el módulo marca en una sola pasada si el paciente es embarazada, niño, bebé, anciano o inmunodeprimido, información que condiciona la prioridad y el protocolo a aplicar.
- Preprocesado dentro del pipeline completo de detección de banderas rojas: los gates extraídos alimentan al motor de reglas V20 (59 reglas) junto con las salidas de los módulos de síntomas, contexto, modificadores y síntomas negados.
- Enrutamiento automático de casos pediátricos frente a adultos: la distinción entre `is_child` y `is_baby` permite derivar el caso a protocolos con rangos de dosis y signos vitales distintos sin intervención manual.
- Telemedicina en el sudeste asiático: su soporte de *Manglish*, malayo y chino con partículas coloquiales lo hace utilizable en chats de pacientes reales donde un modelo entrenado solo en inglés estándar fallaría en la tokenización de la jerga.
- Farmacovigilancia y ajuste de dosis: los gates `is_pregnant`, `is_immunocompromised`, `has_diabetes` y `has_asthma` funcionan como precondiciones para reglas de contraindicación antes de sugerir un fármaco.
- Etiquetado retrospectivo de cohortes en investigación clínica: el modelo puede procesar grandes volúmenes de notas para anotar automáticamente subpoblaciones (por ejemplo, todas las gestantes o todos los pacientes asmáticos) antes de un análisis estadístico.
- Filtro de seguridad previo a un LLM generativo: los gates detectados pueden activar respuestas conservadoras o la derivación a un profesional humano en lugar de dejar que un modelo generalista responda directamente.
- Normalización de datos en sistemas de historia clínica electrónica: convierte texto libre heterogéneo en campos booleanos estructurados y consultables.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al **pipeline completo de cinco módulos más el motor de reglas V46**, evaluado sobre un conjunto de test independiente de 2246 casos. No se reportan métricas aisladas de este módulo `gate`.

| Metric | P | R | F1 | Acc |
|---|---|---|---|---|
| PRIMARY (any_matched × labeled_matched) | 0,902 | 0,911 | 0,906 | 91,9 % |
| STRICT matched-only | 0,893 | 0,828 | 0,859 | 91,8 % |
| STRICT m+s | 0,844 | 0,905 | 0,873 | 92,1 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, y los valores anteriores no son comparables directamente con benchmarks de propósito general porque miden la exactitud de coincidencia de banderas rojas clínicas, no conocimiento o razonamiento general.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 6,2 GB en fp16/bf16 (coincide con el tamaño del repositorio), unos 12,4 GB en fp32 y en torno a 1,8-2,5 GB con cuantización de 4 bits. Hay que sumar el espacio para caché KV y activaciones, que depende de la longitud de contexto utilizada.
- GPU recomendadas: cualquier GPU con 8 GB o más para fp16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). En entornos de servidor, A100, H100, L40S o A10G funcionan sin problema, aunque están sobredimensionadas para un modelo de 3B.
- Cabe en GPU de consumo: sí, en fp16 en tarjetas de 8-12 GB y en cuantización de 4 bits en GPUs de 6-8 GB o incluso en CPU con llama.cpp tras convertir a GGUF.
- Opciones de despliegue: transformers (uso documentado por el autor con `AutoModelForCausalLM`), vLLM, TGI (las etiquetas del repositorio incluyen `text-generation-inference` y `endpoints_compatible`, lo que apunta a compatibilidad con HuggingFace Inference Endpoints). Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, algo que el autor no distribuye.
- Latencia y throughput estimados: no disponibles. Al ser una tarea de extracción con `max_new_tokens=200` y decodificación greedy (`do_sample=False`), la latencia será baja en GPU moderna, pero no se publican mediciones.

## Comparativa con modelos similares

No se han identificado modelos directamente comparables en la información disponible: no existe una categoría pública consolidada de "extractor de gates de población clínica" y el autor no publica comparaciones con alternativas. La comparación más razonable es contra su propio modelo base y contra otros instruct de ~3B que podrían usarse para la misma tarea mediante prompting.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ningpy/redflag-gate-3b | 3,09 B | No disponible (base: 32.768 tokens) | F1 0,906 del pipeline completo (no del módulo aislado) | Apache 2.0 | Safetensors, transformers |
| Qwen/Qwen2.5-3B-Instruct (base) | 3,09 B | 32.768 tokens | No comparable: no ejecuta la tarea de extracción de gates sin ajuste | Apache 2.0 | Safetensors, GGUF, múltiples runtimes |
| Otros instruct de ~3B (por ejemplo Llama-3.2-3B-Instruct) | ≈3,2 B | 128.000 tokens | Sin datos comparativos publicados para esta tarea | Licencia comunitaria de Meta | Safetensors, GGUF |

Cualquier comparación cuantitativa con alternativas requeriría evaluar cada modelo sobre el mismo conjunto de 2246 casos, algo que no se ha publicado.

## Limitaciones y advertencias

- Ámbito funcional muy restringido: solo extrae ocho gates de población. No diagnostica, no clasifica gravedad, no identifica síntomas y no mantiene conversaciones.
- Las métricas publicadas (F1 0,906) corresponden al sistema completo de cinco módulos más el motor de reglas, no a este módulo de forma aislada. No se puede atribuir ese rendimiento a `redflag-gate-3b` por sí solo.
- Riesgo de alucinación en la salida JSON: al ser un modelo generativo, puede producir JSON malformado o campos fuera del esquema, por lo que se requiere validación y parseo defensivo en producción.
- Cobertura lingüística limitada a inglés (con variante de Brunei), chino y malayo. No hay soporte declarado de castellano ni de otras lenguas europeas, lo que lo descarta para uso directo en España sin un ajuste adicional.
- Sensibilidad al prompt: el comportamiento depende del system prompt documentado; cambios en su redacción pueden alterar la extracción.
- Riesgo de sesgo derivado del corpus de entrenamiento, orientado a un contexto clínico específico (Brunéi y sudeste asiático) y no documentado en detalle. No se especifica composición demográfica del dataset.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero eso no exime de las obligaciones regulatorias aplicables a software sanitario en la Unión Europea (marcado CE conforme al reglamento MDR, cumplimiento del RGPD para datos de salud y evaluación de impacto).
- Ausencia total de validación externa independiente: el repositorio registra 0 descargas y 0 *likes*, lo que indica que no ha sido reproducido ni auditado por terceros.
- Inconsistencia de identificadores: la ficha de HuggingFace figura bajo `ningpy/redflag-gate-3b`, mientras que la model card y los ejemplos de código usan `peiyan-ning/redflag-gate-3b`. Conviene verificar cuál es el repositorio canónico antes de integrarlo.
- No se publican cuantizaciones GGUF ni versiones optimizadas, lo que obliga a realizar la conversión por cuenta propia si se quiere desplegar en CPU o en hardware muy limitado.
- No debe utilizarse como herramienta de decisión clínica autónoma: está concebido como una capa de extracción dentro de un sistema con revisión humana y motor de reglas determinista.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ningpy/redflag-gate-3b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio del pipeline completo (motor de reglas, post-procesado y código de inferencia de extremo a extremo): https://git.evyd.tech/ai/redflag-detection-2.0
- Módulos hermanos citados en la model card:
  - `peiyan-ning/redflag-symptom-3b` (extracción multi-etiqueta de 83 síntomas)
  - `peiyan-ning/redflag-context-3b` (12 banderas de contexto)
  - `peiyan-ning/redflag-modifier-3b` (inicio, fiebre en grados Celsius, nivel de consciencia)
  - `peiyan-ning/redflag-denied-3b` (síntomas negados en conversaciones multi-turno)
  - `peiyan-ning/redflag-gate-3b` (mismo módulo, identificador alternativo)
- La búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo: los resultados obtenidos eran páginas generales de YouTube, sin relación con el proyecto.
