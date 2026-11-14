# Hygaard/Inkling-2-Small-oQe-3.07bpw-MLX

## Resumen

Inkling-2-Small-oQe-3.07bpw-MLX es una conversión cuantizada del modelo multimodal Inkling-2-Small-MXFP8 de Thinking Machines Lab, publicada por el usuario Hygaard en Hugging Face. Se trata de una cuantización mixta de 2 y 3 bits en formato MLX, diseñada específicamente para que el modelo completo quepa de forma residente en sistemas Apple Silicon con 256 GiB de memoria unificada, sin necesidad de paginar pesos de capas a disco.

El modelo base es un transformer disperso de tipo mixture-of-experts (MoE) con 595.762.352.304 parámetros escalares originales, 48 capas de texto y 384 expertos enrutados por capa con enrutamiento top-8. La conversión preserva la totalidad de las capas, expertos, el codificador de visión en BF16, el sidecar MTP (multi-token prediction) original y el tokenizer y chat template originales.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización agresiva (3,07 bits efectivos por peso) aplicada a un modelo de escala muy grande; por otro, muestra el estado del ecosistema MLX para inferencia local de modelos MoE multimodales en hardware de Apple. La licencia es Apache-2.0, lo que facilita su uso comercial, aunque la evaluación de calidad y visión del autor sigue pendiente según la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) multimodal con 48 capas de texto y 384 expertos enrutados por capa, enrutamiento top-8; incluye codificador de visión y sidecar MTP |
| Parametros totales | 595.762.352.304 parametros escalares originales (incluye MTP) |
| Parametros activos | No disponible (top-8 de 384 expertos por capa; el numero exacto de parametros activos no se indica) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Expertos enrutados: 2/3 bits afines, grupo 128; atencion: 8 bits afines, grupo 128; embeddings y cabeza de salida: 8 bits afines, grupo 64; routers: FP32; normas, convoluciones y controles residuales: BF16/FP32; vision y MTP: BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors MLX (82 shards principales mas `mtp.safetensors`) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal con 48 capas de texto, 384 expertos enrutados por capa y enrutamiento top-8, más un codificador de visión en BF16 y un sidecar de predicción multi-token (MTP) también en BF16. La conversión mantiene intactas todas las capas, expertos y el enrutamiento original; solo cambia la precisión de almacenamiento de los pesos. La atención y los auxiliares de texto se guardan en 8 bits afines con grupo 128, los embeddings y la cabeza de salida en 8 bits con grupo 64, y los routers en FP32.

La cuantización aplica una asignación por proyección de 2 o 3 bits a los expertos, con escalas y sesgos afines en BF16. El mapa por bloque muestra que la mayoría de bloques usan 3 bits en ambas proyecciones (w13 y w2), mientras que varios bloques (6, 18, 19, 24, 25, 26, 30, 42, 43, 44, 45) usan 2 bits en ambas, y los bloques 31 a 33 y 46 combinan 2 y 3 bits. El resultado es un peso efectivo de 3,0732 bits por parámetro incluyendo MTP, y de 3,0359 bits por parámetro solo con los pesos principales. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento: el modelo base es un transformer MoE de texto; la conversión conserva todas las capas y expertos.
- Procesamiento multimodal imagen-texto: el pipeline declarado es `image-text-to-text` y se preserva el codificador de visión y el proyector en BF16.
- Predicción multi-token (MTP): se conserva el sidecar MTP original en BF16, que según las mediciones del autor duplica aproximadamente el throughput de decodificación (de 40,47 a 74,75 tok/s en el perfil probado).
- Enrutamiento top-8 sobre 384 expertos: arquitectura dispersa que activa una fracción reducida de parámetros por token.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, modo thinking o capacidades multilingües específicas en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon de gran memoria: el modelo está pensado para ejecutarse completamente residente en un sistema con 256 GiB de memoria unificada (por ejemplo, un M5 Ultra dedicado), sin paginación de pesos, lo que permite usar un MoE de ~596.000 millones de parámetros en hardware de escritorio de Apple.
- Investigación en cuantización extrema: sirve como referencia práctica para estudiar el impacto de precisiones de 2 y 3 bits en expertos de un MoE grande, con mapas por bloque, CSV de módulos y tensores y fichero de precisión incluidos en el repositorio.
- Evaluación de MTP en producción: al conservar el sidecar MTP, permite medir la ganancia de decodificación especulativa en un modelo multimodal de gran escala; el autor reporta 74,75 tok/s con MTP frente a 40,47 tok/s sin MTP en su perfil de prueba.
- Prototipado de asistentes multimodales: el pipeline image-text-to-text y la preservación del codificador de visión permiten experimentar con tareas de descripción de imágenes, VQA o extracción de información visual en local.
- Docencia y demostraciones: al ser una conversión comunitaria con licencia Apache-2.0 y artefactos de procedencia (SOURCE-NOTICE, CONVERSION.json), es adecuada para talleres sobre cuantización y despliegue MLX.
- Benchmarking de runtimes MLX/oMLX: el modelo requiere un commit concreto de oMLX y sirve para validar cargadores, correcciones de runtime y rendimiento de decodificación en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta mediciones de throughput de decodificación en un M5 Ultra de 256 GiB:

| Perfil de ejecución | Presupuesto total de petición | Decodificación (tok/s) |
|---|---:|---:|
| KV estándar nativo, MTP desactivado | 8K | 40,47 |
| KV estándar nativo, MTP activado | 8K | 74,75 |

Las mediciones se realizaron sobre dos tareas de texto fijas por fila, una sola secuencia y sin reutilización de prefijo. Las cuatro respuestas pasaron las comprobaciones de tarea. El autor indica que las salidas con MTP activado y desactivado difieren y que no se reclama equivalencia exacta de tokens. La evaluación amplia de calidad y visión, así como la validación de instalación limpia y servido HTTP, quedan pendientes según la model card.

## Requisitos de hardware

- VRAM/memoria: 213,142 GiB en total incluyendo MTP; 209,954 GiB solo pesos principales; 3,188 GiB el sidecar MTP. Estas cifras excluyen tokenizer, configuración, KV cache y memoria de runtime.
- Sistema probado: M5 Ultra dedicado con 256 GiB de memoria unificada, con el modelo completamente residente y sin paginación de pesos por capas.
- GPU recomendadas: no se indican GPU NVIDIA; el formato es MLX, específico de Apple Silicon. No hay datos de despliegue en A100, H100 o RTX 4090.
- GPU de consumo: no cabe en ninguna GPU de consumo convencional por el tamaño de los pesos (más de 200 GiB). Requiere un sistema Apple Silicon de gran memoria unificada.
- Opciones de despliegue: runtime MLX mediante oMLX, con el commit `624cff0e23519ba46a4d5ed2802c2c236ad1a9ac` y la corrección de cargador incluida. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 40,47 tok/s sin MTP y 74,75 tok/s con MTP en el perfil de 8K de presupuesto total de petición, medido en M5 Ultra de 256 GiB.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada. La comparación se limita a lo que se puede inferir del propio repositorio:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Small-oQe-3.07bpw-MLX (este) | 595.762.352.304 escalares originales | No disponible | Apache-2.0 | Safetensors MLX (2/3/8 bits) | Conversion comunitaria para 256 GiB Apple Silicon |
| thinkingmachines/Inkling-2-Small-MXFP8 (base) | 595.762.352.304 escalares originales | No disponible | Apache-2.0 | MXFP8 | Modelo base del que se parte |
| Otras alternativas | No disponible | No disponible | No disponible | No disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- La cuantización a 2 y 3 bits en los expertos puede degradar la calidad respecto al modelo base MXFP8; el autor no ha publicado evaluación amplia de calidad ni de visión.
- El rendimiento medido (40,47 y 74,75 tok/s) corresponde a un único sistema M5 Ultra de 256 GiB y a dos tareas de texto fijas; no es extrapolable a otros hardware ni a otras cargas.
- Con MTP activado y desactivado las salidas difieren; no se garantiza equivalencia exacta de tokens entre ambos modos.
- El modelo requiere un commit concreto de oMLX y una corrección de cargador; no se ha validado una instalación limpia ni el servido por HTTP según la model card.
- El tamaño de pesos (más de 200 GiB) impide su uso en GPU de consumo o en sistemas Apple Silicon con menos de 256 GiB si se quiere mantener residente.
- No se dispone de información sobre sesgos, riesgo de alucinación, idiomas soportados ni limitaciones específicas de contexto del modelo base en la información proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero debe conservarse la atribución indicada en `LICENSE`, `SOURCE-NOTICE.md` y `CONVERSION.json`.
- Al ser una conversión comunitaria (Hygaard) y no oficial de Thinking Machines Lab, la procedencia y el soporte dependen del autor de la conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Hygaard/Inkling-2-Small-oQe-3.07bpw-MLX
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8
- Revision del modelo base citada: `086a047e8b7ff2ac902dd52355328ddb66b16914`
- Runtime oMLX (commit requerido): `624cff0e23519ba46a4d5ed2802c2c236ad1a9ac`
- Artefactos de conversion en el repositorio: `MODULES.csv`, `TENSORS.csv`, `PRECISION.json`, `RUNTIME.md`, `LICENSE`, `SOURCE-NOTICE.md`, `CONVERSION.json`
