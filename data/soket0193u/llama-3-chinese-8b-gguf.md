# Soket0193u/llama-3-chinese-8b-gguf

## Resumen

Llama-3-Chinese-8B-GGUF es la distribucion cuantizada en formato GGUF del modelo base Llama-3-Chinese-8B, desarrollado por el equipo Chinese-LLaMA-Alpaca-3 (repositorio hfl en Hugging Face, mantenido por ymcui). El modelo parte de la arquitectura Llama 3 de Meta y ha sido adaptado al chino mediante entrenamiento continuado del preentrenamiento, ampliando el vocabulario y el corpus de entrenamiento con datos en chino. Esta publicacion concreta la realiza el usuario Soket0193u como espejo de los pesos cuantizados para su uso con llama.cpp, Ollama y otros motores compatibles con GGUF.

El modelo cuenta con 8.030.261.248 parametros totales y esta pensado como modelo fundacional (foundation model), no como modelo de instrucciones o chat: el propio autor advierte que no es adecuado para conversacion o QA directa sin un ajuste posterior. Su relevancia radica en ofrecer una base solida en chino y en ingles con licencia Apache 2.0, lo que facilita su uso comercial y su adaptacion mediante fine-tuning o LoRA.

La distribucion incluye multiples niveles de cuantizacion (desde Q2_K hasta F16) con metricas de perplejidad publicadas, lo que permite elegir el equilibrio entre calidad y huella de memoria segun el hardware disponible. El repositorio ocupa 59,3 GB e incluye todos los ficheros cuantizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K, Q4_0, Q4_K, Q5_0, Q5_K, Q6_K, Q8_0, F16 |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo original hfl/llama-3-chinese-8b) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura transformer decoder-only de Llama 3, con 8.030 millones de parametros. El proyecto Chinese-LLaMA-Alpaca-3 parte del modelo Llama-3-8B de Meta y aplica un entrenamiento continuado del preentrenamiento sobre corpus en chino, con expansion del vocabulario para mejorar la eficiencia de tokenizacion en ese idioma. No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento, de la composicion del dataset ni de si se aplicaron fases de RLHF o DPO; el autor indica explicitamente que se trata de un modelo fundacional y no de un modelo alineado para conversacion.

La innovacion principal de esta publicacion es la disponibilidad de pesos cuantizados en GGUF con metricas de perplejidad comparativas entre versiones antiguas y nuevas del modelo. Segun la tabla de la model card, la version nueva mejora de forma notable la perplejidad en todas las cuantizaciones: por ejemplo, Q4_K pasa de 7,8897 a 5,3126 y F16 de 7,6389 a 5,1302. Las diferencias entre cuantizaciones son pequenas a partir de Q5, lo que sugiere que Q5_K o Q6_K conservan practicamente la calidad del modelo en F16 con una fraccion del tamano.

## Capacidades

- Generacion de texto en chino e ingles como modelo fundacional.
- Base para ajuste fino supervisado (SFT) y para entrenamiento de adaptadores LoRA; el proyecto publica un modelo LoRA separado.
- Capacidad de continuar texto y completar secuencias, adecuada para tareas de preentrenamiento y adaptacion.
- Soporte de inferencia en llama.cpp, Ollama y otros motores compatibles con GGUF.
- No incluye, por si mismo, modo de razonamiento explicito, vision, audio ni tool calling nativo; requeriria ajuste posterior para esas funciones.
- Capacidades multilingues limitadas a chino e ingles segun la model card.

## Casos de uso

- Ajuste fino para dominio chino: partir de los pesos F16 o Q8_0 para entrenar un modelo especializado en atencion al cliente, documentacion tecnica o analisis legal en chino, aprovechando que el preentrenamiento ya incluye corpus en ese idioma.
- Generacion de texto y completado en aplicaciones editoriales: usar las cuantizaciones Q5_K o Q6_K en servidores modestos para tareas de redaccion asistida o resumen en chino e ingles.
- Base para entrenamiento de adaptadores LoRA: el proyecto publica un modelo LoRA especifico, lo que permite adaptar el modelo a tareas concretas con requisitos de memoria reducidos frente al ajuste completo.
- Despliegue en entornos con CPU: las cuantizaciones Q4_K (4,58 GB) y Q5_K (5,34 GB) permiten ejecutar el modelo en llama.cpp sobre CPU con memoria RAM moderada, util para prototipos y entornos sin GPU.
- Evaluacion comparativa de cuantizaciones: los datos de perplejidad publicados permiten estudiar el impacto de la cuantizacion en la calidad del modelo, un caso de uso de interes para investigacion en eficiencia de inferencia.
- Generacion de datos sinteticos en chino: usar el modelo como generador de corpus para entrenar modelos mas pequenos o para aumentar datasets en ese idioma, con la cautela de revisar la calidad de las salidas.

## Benchmarks y rendimiento

La model card solo publica metricas de perplejidad (PPL, menor es mejor) por nivel de cuantizacion, no resultados de benchmarks como MMLU, HumanEval o GSM8K.

| Cuantizacion | Tamano | PPL (modelo nuevo) |
|---|---|---|
| Q2_K | 2,96 GB | 11,8595 +/- 0,20061 |
| Q3_K | 3,74 GB | 5,7559 +/- 0,09152 |
| Q4_0 | 4,34 GB | 5,5495 +/- 0,08832 |
| Q4_K | 4,58 GB | 5,3126 +/- 0,08500 |
| Q5_0 | 5,21 GB | 5,2222 +/- 0,08317 |
| Q5_K | 5,34 GB | 5,1813 +/- 0,08264 |
| Q6_K | 6,14 GB | 5,1481 +/- 0,08205 |
| Q8_0 | 7,95 GB | 5,1350 +/- 0,08190 |
| F16 | 14,97 GB | 5,1302 +/- 0,08184 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas el overhead del contexto; Q4_K ronda 4,6 GB, Q8_0 unos 8 GB y F16 unos 15 GB.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB) permite ejecutar F16 con contexto amplio; una RTX 4060 Ti de 16 GB cubre Q8_0; GPUs de 8 GB como la RTX 3060 ejecutan Q4_K con holgura.
- Cabe en GPU de consumo: si, en todas las cuantizaciones hasta Q8_0 en tarjetas de 8 GB o mas; F16 requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama y motores compatibles con GGUF; el tag del repositorio indica compatibilidad con endpoints.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Llama-3-Chinese-8B-GGUF (este) | 8,03 B | no disponible | zh, en | Apache 2.0 | GGUF |
| Llama-3-8B (Meta) | 8 B | 8.192 tokens (segun Llama 3) | multilingue | Llama 3 Community License | safetensors, GGUF |
| Llama-3-Chinese-8B (hfl) | 8,03 B | no disponible | zh, en | Apache 2.0 | safetensors |
| Llama-3-Chinese-8B-LoRA (hfl) | 8,03 B | no disponible | zh, en | Apache 2.0 | safetensors (LoRA) |

Los datos de contexto de Llama 3 se incluyen como referencia de la arquitectura base; para el modelo chino no se especifica en la informacion disponible. No se dispone de comparativas de rendimiento con benchmarks estandar.

## Limitaciones y advertencias

- Modelo fundacional: no esta alineado para conversacion ni QA; su uso directo en chat producira respuestas de baja calidad.
- Riesgo de alucinacion: al ser un modelo de preentrenamiento sin RLHF, puede generar contenido factualmente incorrecto sin senales de calibracion.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; el corpus de entrenamiento puede introducir sesgos culturales y linguisticos del chino y del ingles.
- Limitaciones de idioma: solo se declaran chino e ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Llama 3 de Meta tiene su propia licencia comunitaria; conviene verificar la compatibilidad de ambas condiciones antes de un despliegue comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es un espejo de terceros, no la publicacion oficial del equipo hfl; para produccion se recomienda usar los pesos originales de hfl/llama-3-chinese-8b.
- El tamano del repositorio (59,3 GB) incluye todas las cuantizaciones; descargar solo el fichero necesario para evitar consumo innecesario de almacenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Soket0193u/llama-3-chinese-8b-gguf
- Modelo original: https://huggingface.co/hfl/llama-3-chinese-8b
- Modelo LoRA: https://huggingface.co/hfl/llama-3-chinese-8b-lora
- Proyecto GitHub: https://github.com/ymcui/Chinese-LLaMA-Alpaca-3
