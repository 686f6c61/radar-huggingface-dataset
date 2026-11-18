# positron-ai/google_gemma-3-4b-it-ingest-best-gptq

## Resumen

`positron-ai/google_gemma-3-4b-it-ingest-best-gptq` es una compilación cuantizada del modelo multimodal `google/gemma-3-4b-it` de Google DeepMind, publicada por Positron AI. Se trata de un derivado que aplica cuantización GPTQ de 4 bits sobre los pesos del modelo original, manteniendo las activaciones sin cuantizar. El objetivo es reducir la huella de memoria del modelo para facilitar su despliegue en GPUs con menos VRAM, sin modificar la arquitectura subyacente.

El modelo base es un transformer denso de aproximadamente 4.300 millones de parámetros con capacidad de procesamiento de imagen y texto (pipeline `image-text-to-text`), orientado a generación de texto conversacional e instrucciones. Esta versión cuantizada conserva la licencia Gemma y todas las restricciones de uso del modelo original.

La relevancia de esta ficha radica en que permite evaluar un artefacto de cuantización de terceros: el autor no publica métricas de calidad (perplejidad, divergencia KL ni precisión), por lo que la decisión de adopción debe basarse en validación propia frente al modelo original en FP16/BF16. El repositorio ocupa 3,9 GB y acumula 972 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 3), multimodal imagen-texto |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GPTQ 4 bits, grupo de 64, simetrica, `desc_act=false`, damp 0,05 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Gemma Terms of Use (licencia `gemma`) |
| Formato de pesos | safetensors (GPTQ), compatible con `transformers` |

## Arquitectura y entrenamiento

El modelo base `google/gemma-3-4b-it` es un transformer denso de la familia Gemma 3, con capacidad de entrada de imagen y texto y salida de texto. Esta compilación no altera la topología: aplica cuantización de solo pesos (weight-only) en precisión de 4 bits con GPTQ, dejando las activaciones sin cuantizar. La configuración declara cuantización simétrica, tamaño de grupo 64 y `desc_act=false`, lo que favorece la compatibilidad con kernels de inferencia estándar a costa de una posible pérdida de precisión frente a variantes con ordenación descendente de activaciones.

El proceso de calibración empleó un conjunto mixto de dominios con 128 muestras y longitud de secuencia 2048, ejecutado con GPTQModel 7.2.0 sobre transformers 5.11.0, torch 2.9.1 y CUDA 12.8. No se documentan detalles sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, fases de RLHF o DPO) ni sobre innovaciones técnicas específicas más allá de la propia cuantización.

## Capacidades

- Generación de texto conversacional con formato de instrucciones (`-it`), adecuada para diálogo multi-turno.
- Procesamiento de entrada multimodal imagen-texto, heredado del modelo base Gemma 3.
- Razonamiento y respuesta a preguntas en lenguaje natural.
- Generación de código y tareas de matemáticas básicas, en línea con las capacidades del modelo base.
- Compatibilidad declarada con Text Generation Inference (`text-generation-inference`) y con endpoints compatibles.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: no disponible en la informacion proporcionada.
- Modo de razonamiento explícito (thinking mode), audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en GPUs de gama media para prototipado: la cuantización de 4 bits reduce el peso de los parámetros a aproximadamente 2,2 GB, lo que permite cargar el modelo en tarjetas con 8 GB de VRAM y dejar margen para el contexto y el procesador de visión.
- Asistentes conversacionales autoalojados: el formato de instrucciones y la ventana de contexto del modelo base lo hacen apto para chatbots de atención interna, siempre que se valide la calidad tras la cuantización.
- Procesamiento de documentos con imagen: al conservar la entrada multimodal, puede extraer información de capturas, formularios escaneados o diagramas en un pipeline de digitalización.
- Generación asistida de código en entornos con recursos limitados: útil para autocompletado y explicación de fragmentos, con verificación posterior obligatoria por el riesgo de degradación numérica.
- Clasificación y resumen de texto en lote: el tamaño reducido permite ejecutar varias instancias en paralelo en un solo servidor para tareas de etiquetado o resumen.
- Evaluación comparativa de cuantizaciones: sirve como artefacto de referencia para medir la pérdida de calidad frente al modelo original en FP16/BF16 antes de adoptar GPTQ en producción.
- Servicio de inferencia con TGI: al declarar compatibilidad con Text Generation Inference, puede integrarse en infraestructuras existentes que ya sirvan modelos con esa pila.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no reporta métricas de rendimiento ni de calidad (ni divergencia KL, ni precisión, ni perplejidad) y que la validación se gestiona internamente en Positron AI. Tampoco se proporcionan cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2 GB solo para pesos en 4 bits; con caché KV, overhead del runtime y procesador de visión, se recomienda un mínimo de 6-8 GB de VRAM para contextos moderados.
- GPU recomendadas: A100, H100 o L40S para servicio concurrente; RTX 4090 y RTX 3090 para desarrollo y despliegues de baja concurrencia.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB y RTX 4070 en adelante; en tarjetas de 8 GB el margen es ajustado y depende de la longitud de contexto.
- Opciones de despliegue: `transformers` con kernels GPTQ, Text Generation Inference (declarado compatible) y servidores compatibles con endpoints. El soporte en llama.cpp u Ollama requeriría conversión a GGUF, no incluida en este repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| positron-ai/google_gemma-3-4b-it-ingest-best-gptq | 4.300 M | no disponible | GPTQ 4 bits | Gemma Terms of Use | Hugging Face, 972 descargas |
| google/gemma-3-4b-it | 4.300 M (aprox.) | no disponible | FP16/BF16 original | Gemma Terms of Use | Hugging Face (modelo oficial) |
| Otras cuantizaciones de gemma-3-4b-it (AWQ, GGUF) | 4.300 M | no disponible | 4 bits / otros | Gemma Terms of Use | Hugging Face, comunidad |

La comparación relevante es frente al modelo base sin cuantizar y frente a otras variantes de cuantización del mismo modelo. No se dispone de datos de rendimiento comparado que permitan afirmar qué artefacto conserva mejor la calidad.

## Limitaciones y advertencias

- No se publican métricas de calidad: la degradación introducida por GPTQ en 4 bits no está cuantificada, por lo que es imprescindible evaluar con un conjunto propio antes de producción.
- `desc_act=false` y grupo de 64 son ajustes conservadores en compatibilidad pero pueden implicar mayor pérdida de precisión que configuraciones alternativas.
- Riesgo de alucinación inherente al modelo base, no mitigado por la cuantización.
- Sesgos conocidos del modelo base: no documentados en la informacion proporcionada.
- Idiomas soportados y comportamiento multilingüe: no disponibles en la informacion proporcionada.
- Restricciones de licencia: el artefacto es un Model Derivative sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy; cualquier redistribución obliga a transmitir las mismas restricciones.
- La model card no documenta la precisión de origen ni el hardware objetivo, lo que dificulta reproducir el proceso de cuantización.
- Al ser un derivado de terceros, no cuenta con el soporte ni las garantías de Google sobre el modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/positron-ai/google_gemma-3-4b-it-ingest-best-gptq
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
