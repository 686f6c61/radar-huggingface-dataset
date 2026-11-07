# GermannM/Kenga-Coder-7B-Z

## Resumen

Kenga-Coder-7B-Z es un ajuste fino mediante PEFT (adaptador LoRA con inicialización QR, denominado Z-BL por el autor) sobre Qwen/Qwen2.5-Coder-7B-Instruct. Lo desarrolla GermannM (identificado en la model card como German Yantaras, con sede en Moscú) y está orientado a generación de código y conversación en ruso e inglés. El modelo incorpora una identidad propia ("Kenga") fijada tanto en los pesos del adaptador como en la plantilla de chat, y se distribuye con cuantizaciones GGUF pensadas para GPUs de gama baja (4-6 GB de VRAM).

El interés técnico principal es su empaquetado: un adaptador entrenado con un esquema de rangos progresivos (8 → 16 → 32) y una pérdida calculada solo sobre los turnos del asistente, junto con cuantizaciones GGUF generadas con matriz de importancia (imatrix) que reducen el peso a 4,36 GB (Q4_K_M) y 3,33 GB (IQ3_M, "Eco-Z"). Esto lo sitúa en la franja de modelos de 7B ejecutables en hardware consumer modesto, como una GTX 1660 o portátiles.

El modelo base aporta una ventana de contexto de 32.768 tokens y un entrenamiento específico para código; el adaptador añade un corpus propio de 8.917 diálogos que incluye reparación de código con marcadores `<FIX>`, gramática interna del proyecto y cobertura de 25 lenguajes de programación. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-7B-Instruct) con adaptador PEFT/LoRA (Z-BL) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-7B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | GGUF Q4_K_M (4,36 GB) e IQ3_M "Eco-Z" (3,33 GB), generadas con imatrix |
| Idiomas soportados | ru, en, multilingual (la model card menciona 25 lenguajes de programación en el corpus) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT en `adapter/`), GGUF, integración con Ollama |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer decoder-only Qwen2.5-Coder-7B-Instruct mediante un adaptador PEFT con una variante de LoRA que el autor denomina Z-BL, definida como ΔW = U · diag(S · mask) · Vᵀ. El adaptador usa inicialización QR y un calendario de rango progresivo de 8 a 16 y finalmente 32. La model card reporta una entropía espectral media del adaptador de 2,9412 sobre un máximo de 3,4657 (aproximadamente el 85 % de uso uniforme del espectro) y un marcador espectral `z_marker` con valor `ddce2488042ab7bb`, que actúa como identificador del artefacto.

El entrenamiento emplea una pérdida calculada únicamente sobre los turnos del asistente (assistant-only loss) y una probabilidad `NO_SYS_P = 0.30` de omitir el mensaje de sistema durante el entrenamiento. El corpus declarado, `train4.jsonl`, contiene 8.917 diálogos con tres componentes identificados: `m53_binding` (vinculación a la identidad Prophet M5.3), `rp1_repair` con marcadores `<FIX>` para reparación de código, y `kenga-grammar` (gramática interna del proyecto), además de ejemplos en 25 lenguajes de programación. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron fases de RLHF o DPO. Las cuantizaciones GGUF se han generado con imatrix, lo que habitualmente reduce la degradación de calidad respecto a cuantizaciones sin matriz de importancia.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con respuestas que el autor describe como directas y breves.
- Generación y reparación de código en los lenguajes cubiertos por el corpus de entrenamiento (25 lenguajes de programación según la model card).
- Reparación de código guiada mediante marcadores `<FIX>` (componente `rp1_repair` del corpus).
- Identidad de modelo fijada en pesos y plantilla de chat: se presenta como "Kenga", creado por GermannM en Moscú.
- Soporte multilingüe parcial: ruso, inglés y etiqueta genérica "multilingual"; no se detalla la cobertura por idioma natural.
- Compatibilidad con endpoints y despliegue en Ollama, según los tags del repositorio (`ollama`, `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada (el modelo base Qwen2.5-Coder-Instruct lo soporta, pero no se confirma que el adaptador lo preserve).
- Modo de razonamiento explícito (thinking), visión o audio: no disponible.

## Casos de uso

- Asistente de código en GPUs de gama baja: con el cuant Q4_K_M (4,36 GB) el modelo cabe en una GTX 1660 de 6 GB y permite autocompletado y generación de funciones en local, sin depender de servicios en la nube.
- Despliegue en portátiles y equipos sin GPU dedicada: el cuant IQ3_M "Eco-Z" (3,33 GB) está pensado para GPUs de 4 GB y ejecución en CPU, lo que facilita entornos de desarrollo portátiles o estaciones de trabajo modestas.
- Reparación automática de código en pipelines: los marcadores `<FIX>` del corpus de entrenamiento permiten plantear tareas de corrección de fragmentos defectuosos dentro de un flujo de integración continua, revisando parches antes de aplicarlos.
- Atención a desarrolladores rusohablantes: al estar entrenado en ruso e inglés, puede explicar errores, generar documentación técnica y responder dudas de API en ruso, un nicho con menos cobertura que el inglés.
- Prototipado rápido con Ollama: la integración directa (`ollama run hf.co/GermannM/Kenga-Coder-7B-Z:Q4_K_M`) permite levantar un servidor local de generación de código en minutos para pruebas internas.
- Generación de scripts en múltiples lenguajes: la cobertura declarada de 25 lenguajes de programación lo hace útil para tareas de traducción entre lenguajes o generación de utilidades en stacks heterogéneos.
- Experimentación en investigación sobre adaptadores: el adaptador PEFT con inicialización QR y rangos progresivos, junto con el pasaporte espectral (`kenga_passport.json`), sirve como caso de estudio reproducible de entrenamiento eficiente de LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5-5 GB con Q4_K_M (peso de 4,36 GB más overhead de contexto) y aproximadamente 3,5-4 GB con IQ3_M (peso de 3,33 GB).
- GPU recomendadas: GTX 1660 (6 GB) para Q4_K_M; GPUs de 4 GB o ejecución en CPU para IQ3_M. No se documentan requisitos para GPUs de datacenter (A100, H100) ni para el adaptador PEFT sin cuantizar, que requeriría cargar el modelo base de 7B en precisión completa o semi.
- Cabe en GPU consumer: sí, en tarjetas de 4-6 GB según el cuantizador elegido; el adaptador PEFT completo en safetensors requiere además el modelo base Qwen2.5-Coder-7B-Instruct.
- Opciones de despliegue: Ollama (vía `hf.co/GermannM/Kenga-Coder-7B-Z:Q4_K_M`), llama.cpp para los GGUF, y PEFT/Transformers para cargar el adaptador sobre el modelo base. vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kenga-Coder-7B-Z | 7,6B | no disponible (base: 32.768) | Apache 2.0 | HF, GGUF, Ollama | Ajuste PEFT de Qwen2.5-Coder-7B-Instruct con identidad propia |
| Qwen2.5-Coder-7B-Instruct | 7,6B | 32.768 | Apache 2.0 | HF, amplia adopción | Modelo base; sin adaptación de identidad ni corpus ruso específico |
| GermannM/Kenga-Coder-7B | 7B (aprox.) | no disponible | Apache 2.0 | HF | Versión previa del mismo autor, sin el adaptador Z-BL |
| GermannM/Kenga-Coder-7B-v2 | 7B (aprox.) | no disponible | Apache 2.0 | HF | Segunda iteración previa del mismo autor |

No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo frente al modelo base ni frente a otras alternativas de 7B.

## Limitaciones y advertencias

- Riesgo de alucinación: como todo modelo generativo de 7B, puede inventar APIs, funciones o sintaxis; no se han publicado evaluaciones de fiabilidad.
- Sesgos e identidad inducida: el modelo incorpora una identidad fija ("Kenga", creada por GermannM en Moscú, con declaración de afinidad por Rusia) tanto en pesos como en la plantilla de chat; esto puede filtrarse en respuestas y dificultar su uso como asistente neutral.
- Cobertura lingüística limitada: el entrenamiento se centra en ruso e inglés; el rendimiento en castellano u otros idiomas naturales no está documentado.
- Contexto: la longitud de contexto efectiva tras el ajuste no se especifica; se asume la del modelo base (32.768 tokens), pero el adaptador no ha sido validado para contextos largos según la información disponible.
- Tool calling no confirmado: aunque el modelo base lo soporta, la model card no indica que el adaptador preserve esta capacidad, por lo que su uso en agentes requiere validación previa.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación sobre el cumplimiento de las condiciones del modelo base más allá de la herencia declarada.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa ni resultados de benchmarks; conviene tratarlo como un artefacto experimental.
- Cuantizaciones de baja precisión (IQ3_M) pueden degradar la calidad en tareas de código complejo; se recomienda Q4_K_M como mínimo para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GermannM/Kenga-Coder-7B-Z
- Versión previa Kenga-Coder-7B: https://huggingface.co/GermannM/Kenga-Coder-7B
- Versión previa Kenga-Coder-7B-v2: https://huggingface.co/GermannM/Kenga-Coder-7B-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
