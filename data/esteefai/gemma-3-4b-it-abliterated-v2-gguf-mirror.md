# EsteefAi/gemma-3-4b-it-abliterated-v2-GGUF-mirror

## Resumen

Este repositorio no es un modelo nuevo, sino un **espejo (mirror) byte a byte** del fichero `gemma-3-4b-it-abliterated-v2.q6_k.gguf` publicado por mlabonne, que a su vez es una versión "abliterated" (sin la dirección de rechazo en los pesos) de `google/gemma-3-4b-it`. El espejo lo mantiene EsteefAi para que las instalaciones de su herramienta Philibert sigan funcionando si el repositorio original desaparece o se mueve. Por tanto, el trabajo técnico es de mlabonne (abliteration) y de Google (modelo base Gemma 3); el valor de este repo es la disponibilidad y la verificación por SHA-256.

El modelo subyacente es un transformer decoder-only denso de 3.880.263.168 parámetros (3,88 B) con capacidad multimodal de entrada (texto e imagen) y salida de texto, ajustado con instrucciones y con un contexto declarado de 128 000 tokens en la familia Gemma 3. La variante abliterated elimina la dirección de rechazo calculada a partir de pares de peticiones dañinas/inocuas, de modo que el modelo deja de responder con negativas sistemáticas. Es relevante ahora porque permite ejecutar localmente un modelo de ~4 B sin filtrado conversacional en hardware de consumo, algo útil para investigación en seguridad, red-teaming y generación creativa, pero problemático para despliegues comerciales sin evaluación propia.

El único artefacto disponible en este espejo es una cuantización Q6_K de aproximadamente 3,2 GB. No hay safetensors, no hay otras cuantizaciones y no se publican benchmarks ni evaluaciones de la pérdida de capacidad que introduce la abliteration.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, atención con ventana deslizante local/global, multimodal de entrada (texto + imagen) en el modelo base Gemma 3 |
| Parámetros totales | 3.880.263.168 (3,88 B), dato real de safetensors del modelo base |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128 000 tokens en Gemma 3 4B IT (modelo base); no se indica en la model card del espejo |
| Tipos de cuantización | Q6_K únicamente en este espejo; el repo original de mlabonne ofrece más variantes, no detalladas en la información disponible |
| Idiomas soportados | no disponibles en los metadatos del repo; Gemma 3 declara soporte de más de 140 idiomas en el modelo base |
| Licencia | gemma (Gemma Terms of Use, sin cambios) |
| Formato de pesos | GGUF (`gemma-3-4b-it-abliterated-v2.q6_k.gguf`); no hay safetensors en este repo |
| Tamaño del repositorio | 3,2 GB |
| Pipeline | no disponible |
| Etiquetas | gguf, mirror, endpoints_compatible, conversational, region:us |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadatos) | 2026-10-23 |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 3 4B IT: un transformer decoder-only denso con atención agrupada (GQA) y un esquema de atención híbrida que combina capas de ventana deslizante local con capas de atención global, lo que reduce el coste del caché KV en contextos largos. El modelo base es multimodal en la entrada (procesa texto e imágenes) y genera texto. Google lo entrenó con datos mayoritariamente en inglés y lo ajustó con instrucciones y con un proceso de alineación tipo RLHF, seguido de un ajuste específico para seguridad que introduce el comportamiento de rechazo. Sobre este último punto no se aportan en la información disponible cifras de tokens de entrenamiento, composición del dataset ni detalles del proceso de alineación.

La innovación de esta variante es la **abliteration**: se calcula una dirección de rechazo en el espacio de activaciones a partir de pares de prompts dañinos e inocuos, y se ortogonalizan contra ella los pesos de las capas (típicamente las matrices de atención y MLP en las capas medias). Según la model card del repositorio original, la v2 usa una "nueva técnica de abliteration" con mayor precisión al atacar las negativas. El resultado es un modelo con la misma arquitectura y el mismo número de parámetros, pero con el comportamiento de rechazo suprimido; no hay reentrenamiento ni fine-tuning adicional. La conversión a GGUF se hizo con llama.cpp.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat de Gemma 3.
- Razonamiento y respuesta a instrucciones en el rango propio de un modelo de ~4 B.
- Generación de código y explicaciones técnicas a nivel de asistente ligero.
- Aritmética y problemas matemáticos sencillos y de complejidad media; sin modo "thinking" explícito.
- Entrada de imágenes en el modelo base (Gemma 3 es multimodal); la cuantización GGUF Q6_K conserva el proyector de visión solo si el fichero lo incluye, dato no confirmado en la información disponible.
- Multilingüismo heredado de Gemma 3 (más de 140 idiomas declarados por Google); la calidad real en castellano no está evaluada en este repo.
- Respuesta sin negativas sistemáticas ante contenido que el modelo original rechazaría (efecto directo de la abliteration).
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el formato de chat estándar de Gemma 3.

## Casos de uso

- **Investigación en seguridad y red-teaming**: usar la variante abliterated como muestra de control frente a `google/gemma-3-4b-it` para medir cuánto cambia la tasa de negativas, la tasa de contenido dañino y la calidad general tras eliminar la dirección de rechazo. El tamaño de 4 B permite ejecutar cientos de generaciones por hora en una sola GPU de consumo.
- **Evaluación de técnicas de abliteration**: comparar esta v2 con la v1 de mlabonne y con el modelo alineado original usando el mismo prompt set, para cuantificar la fidelidad de la supresión de rechazos y la degradación colateral en tareas neutras.
- **Generación creativa sin fricción**: escritura de ficción, guiones o narrativa con violencia, temas adultos o lenguaje sobrante donde el modelo alineado interrumpe constantemente con negativas. El contexto de 128 K del base permite mantener documentos largos coherentes.
- **Asistente local y privado**: despliegue en un portátil o estación de trabajo con Ollama o llama.cpp para procesar texto sensible que no puede salir a una API externa; los ~3,2 GB del Q6_K caben en GPUs de 8 GB y en CPU con 8-16 GB de RAM.
- **Generación de datos sintéticos para casos límite**: producir ejemplos que los modelos alineados se niegan a generar (insultos, contenido controvertido, jerga) para ampliar datasets de clasificación o de moderación, revisando siempre el resultado antes de usarlo.
- **Prototipado rápido y pruebas de integración**: incluir el modelo en tests de CI o en pipelines de desarrollo que necesitan un LLM pequeño y determinista sin depender de una API de pago; el formato GGUF y la compatibilidad con endpoints facilitan el despliegue en contenedores.
- **Base para fine-tuning ligero**: servir como punto de partida para LoRA/QLoRA sobre dominios concretos cuando no se quiere arrastrar el sesgo de rechazo del modelo original en el dominio objetivo.
- **Sustituto de respaldo en producción de la herramienta Philibert**: caso explícito para el que se creó el espejo, garantizando que `ollama pull hf.co/EsteefAi/gemma-3-4b-it-abliterated-v2-GGUF-mirror:q6_k` siga resolviendo si el repo original cae.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del espejo no incluye ninguna evaluación, y la del repositorio original de mlabonne tampoco aporta cifras en los datos recogidos. Tampoco hay mediciones de la degradación provocada por la abliteration (comparación MMLU, GSM8K o HumanEval frente a `google/gemma-3-4b-it`), ni datos de throughput o latencia.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos Q6_K ocupan aproximadamente 3,2 GB. Con contexto corto (4-8 K tokens) se puede inferir con 4-5 GB de VRAM; para contextos largos hay que sumar el caché KV, que en Gemma 3 se ve reducido por las capas de ventana deslizante pero sigue creciendo con el contexto.
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para uso local; A100 o H100 solo si se sirven muchas peticiones concurrentes o contextos muy largos.
- **¿Cabe en GPU de consumo?**: sí, con holgura en cualquier GPU de 8 GB o más. En 6 GB entra con contexto corto. En CPU funciona con 8-16 GB de RAM a velocidades de pocos tokens por segundo.
- **Opciones de despliegue**: Ollama (la propia model card indica `ollama pull hf.co/EsteefAi/gemma-3-4b-it-abliterated-v2-GGUF-mirror:<quant>`), llama.cpp / llama-cpp-python, LM Studio, koboldcpp. vLLM y TGI admiten GGUF de forma experimental; para servir en producción con concurrencia alta conviene reconvertir a safetensors.
- **Latencia y throughput**: no disponibles. Como referencia cualitativa, un modelo de 4 B en Q6_K sobre una RTX 4090 suele quedar limitado por memoria antes que por cómputo, pero no hay mediciones publicadas para este artefacto concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (espejo Q6_K de Gemma 3 4B IT abliterated v2) | 3,88 B | 128 K (base) | texto + imagen de entrada | Gemma Terms of Use | GGUF Q6_K, 1 fichero, 0 descargas |
| `mlabonne/gemma-3-4b-it-abliterated-v2-GGUF` (original) | 3,88 B | 128 K (base) | texto + imagen de entrada | Gemma Terms of Use | varias cuantizaciones GGUF; cientos de descargas |
| `google/gemma-3-4b-it` (base alineado) | 3,88 B | 128 K | texto + imagen de entrada | Gemma Terms of Use | safetensors y GGUF oficiales |
| Qwen2.5-3B-Instruct | 3,09 B | 32 K | texto | Apache 2.0 | safetensors, GGUF, amplio ecosistema |
| Llama 3.2 3B Instruct | 3,21 B | 128 K | texto | Llama 3.2 Community License | safetensors, GGUF, amplio ecosistema |

No hay datos de rendimiento comparado (MMLU, HumanEval, GSM8K) en la información disponible para este artefacto. En licencia, Gemma Terms of Use es más restrictiva que Apache 2.0 y similar en fricción a la licencia comunitaria de Llama; a diferencia de Qwen2.5, impone obligaciones de uso aceptable y cláusulas de terminación.

## Limitaciones y advertencias

- **Riesgo de seguridad elevado**: la abliteration suprime deliberadamente el comportamiento de rechazo. El modelo puede generar contenido dañino, ilegal o sexual sin filtro. No es apto para aplicaciones de cara al público sin una capa de moderación propia.
- **Abliteration no es selectiva**: la dirección de rechazo se elimina de forma global, lo que típicamente degrada capacidades colaterales (coherencia, seguimiento de instrucciones, calidad en tareas neutras). No hay evaluación publicada del daño en este artefacto concreto; hay que medirlo antes de usarlo en producción.
- **Licencia Gemma Terms of Use**: permite uso comercial con obligaciones (atribución, política de uso aceptable, restricciones sobre usos prohibidos, cláusulas de terminación por incumplimiento). La abliteration no cambia la licencia, y el uso del modelo para generar contenido prohibido por la política de uso de Gemma puede violarla aunque técnicamente el modelo lo permita.
- **Es un espejo, no un modelo mantenido**: 0 descargas, 0 likes, sin pipeline declarado, sin issues ni soporte. Solo contiene un fichero Q6_K; si se necesita otra cuantización hay que ir al repo original.
- **Idiomas y sesgos**: no hay evaluación multilingüe ni de sesgos para esta variante. Gemma 3 está entrenado mayoritariamente en inglés y hereda los sesgos de su corpus; el castellano funciona pero con calidad inferior al inglés.
- **Alucinaciones**: como cualquier modelo de 3,88 B, inventa datos con facilidad, especialmente en contexto largo. El contexto de 128 K es real pero la calidad de recuperación en el extremo de la ventana decae.
- **Cuantización Q6_K**: introduce una pérdida pequeña pero no nula frente a los pesos originales en BF16; para evaluación fina de la abliteration conviene usar el repo en safetensors.
- **Integración con visión**: no está confirmado que el GGUF incluya el proyector multimodal; si el uso requiere entrada de imágenes, verificar el fichero antes de desplegar.
- **Fechas de metadatos anómalas**: la fecha de creación indicada (2026-10-23) no es coherente con el estado actual de la familia Gemma 3; tratarla con cautela.

## Enlaces

- Repositorio espejo en HuggingFace: https://huggingface.co/EsteefAi/gemma-3-4b-it-abliterated-v2-GGUF-mirror
- Repositorio GGUF original de mlabonne: https://huggingface.co/mlabonne/gemma-3-4b-it-abliterated-v2-GGUF
- Modelo abliterated en safetensors (base del GGUF): https://huggingface.co/mlabonne/gemma-3-4b-it-abliterated-v2
- Versión abliterated v1 (GGUF): https://huggingface.co/mlabonne/gemma-3-4b-it-abliterated-GGUF
- Modelo base oficial de Google: https://huggingface.co/google/gemma-3-4b-it
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/gemma-3-4b-it-abliterated-v2.html
- Ficha en AIBase: https://model.aibase.com/models/details/1942769986376568832
- Ficha del modelo base en ModelScope: https://www.modelscope.cn/models/LLM-Research/gemma-3-4b-it
