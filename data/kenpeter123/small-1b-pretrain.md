# kenpeter123/small-1b-pretrain

## Resumen

El modelo `kenpeter123/small-1b-pretrain` es un modelo de lenguaje base (sin ajuste por instrucciones ni chat) de aproximadamente 1.030 millones de parámetros, desarrollado por el usuario kenpeter123 y publicado en Hugging Face bajo licencia Apache-2.0. Se trata de un transformer decoder-only con arquitectura tipo Llama (Transformer++) entrenado desde cero mediante predicción de siguiente token sobre un corpus filtrado por calidad que incluye datos de matemáticas, web, código, datos sintéticos y un conjunto "gold". El tokenizador utilizado es el BPE de SmolLM2-135M, con un vocabulario de 49.152 tokens.

El modelo está pensado como punto de partida para tareas de continuación de preentrenamiento, ajuste supervisado (SFT) o aprendizaje por preferencias (DPO). Al ser una base sin alineamiento, no dispone de plantilla de chat ni capacidades de instrucción directa. Su relevancia radica en ofrecer una arquitectura moderna de 1B con atención con consultas agrupadas (GQA) y SwiGLU, entrenada con una pérdida final de 1.7888, lo que lo convierte en un candidato interesante para experimentación y fine-tuning en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Transformer++, similar a Llama) con GQA, SwiGLU y embeddings sin atar |
| Parametros totales | 1.031.898.624 (~1,03B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (entrenamiento) / 8192 tokens (configuracion) |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con 32 capas, dimension oculta de 1536, 12 cabezas de atencion y 4 cabezas KV (GQA) con dimension de cabeza 128. La capa FFN utiliza activacion SwiGLU con dimension intermedia de 4608. Los embeddings no estan atados (weight tying desactivado), lo que permite una mayor flexibilidad durante el fine-tuning. El tokenizador es el BPE de SmolLM2-135M, con un vocabulario de 49.152 tokens.

El entrenamiento se realizo desde cero con el objetivo de prediccion de siguiente token sobre un conjunto de datos filtrado por calidad y organizado en niveles (math, web, code, synth, reformat y un conjunto "gold"). Se utilizo el optimizador CautiousAdamW en precision bf16 con una programacion de tasa de aprendizaje coseno. La mejor perdida registrada fue de 1.7888 en el paso 66.253, deteniendose el entrenamiento en el paso 68.800. No se aplicaron tecnicas de RLHF ni DPO; el modelo es una base pura sin alineamiento.

## Capacidades

- Generacion de texto en ingles mediante prediccion de siguiente token.
- Modelo base apto para continuacion de preentrenamiento, SFT y DPO.
- Soporte de tool calling: no disponible (requiere fine-tuning posterior).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingues: solo ingles declarado, aunque el tokenizador BPE podria procesar otros idiomas con menor eficacia.
- Capacidades especiales: ninguna (sin vision, audio, ni modo de pensamiento explicito).

## Casos de uso

- Continuacion de preentrenamiento en dominios especificos: el modelo puede ser reentrenado sobre corpus especializados (por ejemplo, textos juridicos o medicos) para adaptar sus representaciones a un vocabulario y estilo concretos, aprovechando su arquitectura moderna y su tamano contenido.
- Ajuste supervisado (SFT) para generacion de codigo: al ser una base, se puede fine-tunear con pares instruccion-respuesta de codigo para crear un asistente de programacion ligero, adecuado para entornos con limitaciones de VRAM.
- Aprendizaje por preferencias (DPO): su naturaleza sin alinear permite aplicar DPO directamente sobre los pesos base, evitando interferencias de un ajuste previo por instrucciones.
- Experimentacion academica: por su tamano y licencia permisiva, es util para estudiar dinamicas de entrenamiento, efectos de GQA o comparativas de arquitecturas en investigacion.
- Prototipado de sistemas de generacion de texto: puede integrarse en pipelines de generacion de texto simple (completado de frases, generacion de contenido) antes de un ajuste posterior.
- Fine-tuning para clasificacion de texto: al ser un modelo base, se puede adaptar con una cabeza de clasificacion para tareas como analisis de sentimiento o deteccion de spam en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de entrenamiento (1.7888), sin comparaciones estandarizadas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2,2 GB (pesos de 1,03B parametros × 2 bytes), mas overhead de activaciones y cache KV, por lo que se recomienda al menos 4 GB de VRAM para secuencias cortas.
- GPU recomendadas: cualquier GPU con 4 GB o mas (por ejemplo, NVIDIA GTX 1650, RTX 3060, RTX 4090) para inferencia basica; para entrenamiento o fine-tuning se recomienda al menos 8-12 GB (RTX 3080, A100, etc.).
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo con al menos 4 GB de VRAM para inferencia en precision media.
- Opciones de despliegue: al ser un modelo base de transformers, puede ejecutarse con la libreria transformers de Hugging Face, vLLM, llama.cpp (si se convierten los pesos a GGUF), o TGI (Text Generation Inference). No se proporcionan cuantizaciones oficiales, por lo que habria que generarlas manualmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados de otros modelos base de tamano similar (por ejemplo, SmolLM2-1.7B, Qwen2.5-1.5B, Gemma-2-2B) para una comparativa cuantitativa fiable. Se puede indicar que comparte caracteristicas arquitectonicas con modelos Llama-like de ~1B, pero no hay informacion suficiente para una tabla comparativa objetiva.

## Limitaciones y advertencias

- Modelo base sin alineamiento: no es util para chat o instrucciones directas; requiere fine-tuning para tareas interactivas.
- Sesgos conocidos: al entrenarse principalmente con datos en ingles y sin filtrado de sesgos explicito, puede reflejar sesgos presentes en el corpus.
- Riesgo de alucinacion: al ser un modelo base, la generacion puede ser incoherente o inventar informacion, especialmente fuera de su dominio de entrenamiento.
- Limitaciones de contexto: el entrenamiento se realizo con secuencias de 2048 tokens; aunque la configuracion soporta 8192, el rendimiento con contextos largos no esta validado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero es recomendable revisar las condiciones de los datos de entrenamiento (no especificados en detalle).
- Para produccion: es necesario un proceso de fine-tuning y evaluacion exhaustiva antes de su despliegue; no se recomienda su uso directo como modelo de generacion final.

## Enlaces

- Pagina del modelo en Hugging Face: https://huggingface.co/kenpeter123/small-1b-pretrain
- Modelo base de referencia (tokenizador): https://huggingface.co/HuggingFaceTB/SmolLM2-135M
