# PrometheusEXE/DeepSeek-V4-Pro-Qwen3.5-9B-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-GGUF es una cuantizacion en formato GGUF del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un modelo de 9.197.093.888 parametros (aproximadamente 9,2 mil millones) construido sobre la arquitectura Qwen3.5 y destilado a partir de DeepSeek-V4-Pro. Lo publica el usuario PrometheusEXE en Hugging Face bajo licencia Apache 2.0, aunque el acceso esta restringido y requiere aceptar condiciones en la plataforma.

El modelo esta orientado a razonamiento, matematicas, STEM, uso de herramientas (tool calling y function calling) y soporte multilingue en ingles, chino, coreano, japones, espanol y ruso. Segun los tags del repositorio, el entrenamiento combina SFT, RL con GSPO (Group Sequence Policy Optimization) y destilacion desde DeepSeek-V4-Pro, ademas de incluir soporte para MTP (Multi-Token Prediction), lo que puede acelerar la decodificacion.

Es relevante porque traslada capacidades de razonamiento de un modelo grande de DeepSeek a un tamano de 9B desplegable en hardware mas modesto, y se distribuye en GGUF para su uso con llama.cpp, Ollama y motores compatibles con text-generation-inference. La informacion publica disponible es limitada: no hay pipeline declarado, cero descargas y cero likes en el momento de la consulta, y el repo ocupa 85,1 GB, lo que sugiere multiples cuantizaciones incluidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.5 (destilacion de DeepSeek-V4-Pro), con soporte MTP |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (multiples variantes; el repo de 85,1 GB sugiere varias cuantizaciones, pero no se detallan los niveles exactos) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo con libreria transformers declarada; modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo base es Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, una destilacion de DeepSeek-V4-Pro sobre la arquitectura Qwen3.5 con aproximadamente 9,2 mil millones de parametros. Los tags indican un pipeline de entrenamiento en varias fases: SFT (supervised fine-tuning) sobre datasets de destilacion (Jackrong/DeepSeek-V4-Pro-Distilled-200K y Jackrong/DeepSeek-V4-Distill-8000x), seguido de RL con GSPO (Group Sequence Policy Optimization), una variante de optimizacion de politica para modelos de razonamiento. Tambien se declara soporte de MTP (Multi-Token Prediction), tecnica que permite predecir varios tokens por paso y que suele emplearse para acelerar la decodificacion o como mecanismo de decodificacion especulativa.

No se dispone de informacion publica sobre el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni los hiperparametros del RL. La ficha del modelo base en Hugging Face es la fuente principal para esos detalles, y este repositorio es unicamente la version cuantizada en GGUF. No se han publicado innovaciones adicionales de atencion (por ejemplo, atencion lineal o SSM hibrido) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno (tag `conversational`).
- Razonamiento explicito y modo de pensamiento (tags `reasoning`, `distillation`).
- Matematicas y problemas STEM (tags `math`, `stem`).
- Uso de herramientas y function calling (tags `tool-use`, `function-calling`).
- Capacidades multilingues en ingles, chino, coreano, japones, espanol y ruso.
- Soporte de MTP (Multi-Token Prediction) para decodificacion acelerada.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con text-generation-inference.
- Entrenado con RL (GSPO) ademas de SFT, lo que sugiere optimizacion para tareas de razonamiento verificable.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas de algebra, calculo y demostraciones paso a paso, aprovechando su entrenamiento especifico en math y STEM y el modo de razonamiento destilado de DeepSeek-V4-Pro.
- Generacion de codigo con tool calling: integrado en un pipeline de CI/CD o en un IDE, puede invocar funciones (por ejemplo, ejecutar tests, consultar APIs) gracias al soporte declarado de function calling.
- Agentes multi-paso: su combinacion de razonamiento y tool-use permite construir agentes que planifican, llaman herramientas y verifican resultados en tareas de automatizacion.
- Atencion al cliente multilingue: con soporte para espanol, ingles, chino, coreano, japones y ruso, puede gestionar conversaciones multi-turno en varios idiomas desde un unico despliegue.
- Analisis tecnico y documentacion STEM: redaccion de explicaciones tecnicas, resumen de papers y generacion de material didactico en dominios cientificos.
- Despliegue en local o edge: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama en estaciones de trabajo con GPU consumer, lo que facilita prototipos sin infraestructura cloud.
- Evaluacion comparativa de destilaciones: util como modelo de referencia para estudiar como se comporta una destilacion de 9B frente al modelo profesor en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~9,2B en GGUF, las cuantizaciones de 4 bits suelen requerir del orden de 5-6 GB y las de 8 bits en torno a 9-10 GB, pero estos valores son estimaciones genericas y no datos publicados para este modelo.
- GPU recomendadas: no disponible. Por tamano, cabria esperar ejecucion en RTX 3090/4090 (24 GB) con cuantizaciones altas, y en GPUs de 8-12 GB con cuantizaciones de 4 bits, pero no hay confirmacion oficial.
- Cabe en GPU consumer: probablemente si con cuantizaciones de 4 bits en GPUs de 8 GB o mas, segun el tamano tipico de un modelo de 9B en GGUF; no confirmado por el autor.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (declarado en tags), y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponible. El soporte de MTP podria mejorar el throughput, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-GGUF (este) | ~9,2B | no disponible | Apache 2.0 | GGUF | Destilacion de DeepSeek-V4-Pro, acceso restringido |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (base) | ~9,2B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Qwen3.5-9B (familia base) | ~9B | no disponible | no disponible | safetensors/GGUF | Arquitectura base sobre la que se destila |
| DeepSeek-V4-Pro (profesor) | no disponible | no disponible | no disponible | no disponible | Modelo de origen de la destilacion |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargar.
- Informacion publica muy escasa: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado ni benchmarks; la calidad y estabilidad del modelo no estan verificadas por la comunidad.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en matematicas y STEM si no se verifica.
- Sesgos: no se documentan sesgos conocidos ni evaluaciones de seguridad.
- Contexto e idiomas: la longitud de contexto no esta publicada; el soporte multilingue se limita a los seis idiomas declarados (en, zh, ko, ja, es, ru) y no hay garantias fuera de ellos.
- Licencia Apache 2.0: permite uso comercial, pero al ser una destilacion de DeepSeek-V4-Pro conviene revisar las condiciones del modelo profesor y de los datasets de destilacion antes de un despliegue en produccion.
- Cuantizacion: al ser una version GGUF, puede haber perdida de calidad respecto al modelo base en safetensors; no se documentan evaluaciones de degradacion por cuantizacion.
- Fecha de creacion futura (2026-11-17) en los metadatos: conviene verificar la autenticidad y procedencia del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/PrometheusEXE/DeepSeek-V4-Pro-Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Dataset de destilacion 1: https://huggingface.co/datasets/Jackrong/DeepSeek-V4-Pro-Distilled-200K
- Dataset de destilacion 2: https://huggingface.co/datasets/Jackrong/DeepSeek-V4-Distill-8000x
