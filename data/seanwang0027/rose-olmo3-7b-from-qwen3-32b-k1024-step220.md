# SeanWang0027/rose-olmo3-7b-from-qwen3-32b-k1024-step220

## Resumen

Este modelo es el resultado de un experimento de destilación online ROSE (Reflective Online Self-Evolving) en el que se utilizó un profesor Qwen3-32B para destilar conocimiento de razonamiento matemático en un estudiante Olmo-3-7B-Think-SFT. El autor, SeanWang0027, lo publica explícitamente como un resultado negativo: tras completar una época completa de entrenamiento (220 pasos), el modelo obtiene peores resultados en los benchmarks AIME25 y HMMT25 que el modelo base sin entrenar. La publicación busca que este fallo sea reproducible y verificable por la comunidad.

El entrenamiento emplea destilación cross-tokenizer (el vocabulario del alumno, 100 278 tokens, es completamente distinto del profesor, 151 669 tokens), sobre el dataset DAPO-Math-17k en inglés, con un punto de corte de prefijo K=1024 y un presupuesto de generación del profesor de 1024 tokens. La arquitectura es un transformer denso de 7B parámetros de la familia Olmo 3, con licencia Apache 2.0 y pesos en formato safetensors. El tamaño del repositorio es de 5.0 GB.

La relevancia de este modelo no está en su rendimiento, sino en lo que documenta: un caso de estudio de fallo en destilación online donde la supervisión solo cubre aproximadamente el 6% de la cadena de razonamiento completa, lo que provoca una degradación monótona del rendimiento a lo largo del entrenamiento. El autor incluye un análisis detallado de las causas y propone una solución concreta para experimentos futuros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Olmo 3) |
| Parametros totales | 7B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (Olmo 3 soporta contexto largo; el dato exacto no se publica en la tarjeta) |
| Tipos de cuantizacion | No disponible (repositorio en safetensors, 5.0 GB) |
| Idiomas soportados | Ingles (dataset DAPO-Math-17k en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Olmo-3-7B-Think-SFT, la version con fine-tuning supervisado de la familia Olmo 3 orientada a razonamiento con modo de pensamiento explicito. Es un transformer denso de 7B parametros, sin mezcla de expertos, disenado para razonamiento de contexto largo, llamada a funciones y codigo. El entrenamiento de este modelo concreto es un proceso de destilacion online ROSE con un profesor Qwen3-32B servido mediante vLLM con tensor parallelism de 4 GPUs, y un alumno Olmo-3-7B. El dataset es DAPO-Math-17k (17 000 problemas matematicos en ingles).

La configuracion clave es el modo de corte "prefix" con K=1024: el alumno escribe 1024 tokens que se cortan, y el profesor continua desde ese punto con un presupuesto maximo de 1024 tokens adicionales. La funcion de perdida (cross-entropy) se aplica unicamente sobre los tokens generados por el profesor. El entrenamiento uso 220 pasos (una epoca completa, 14 116 secuencias de 64 de lote) con una tasa de aprendizaje constante de 1e-5, sin warmup, en 9 horas y 2 minutos. Se empleo atencion SDPA sin flash_attn en el entorno de entrenamiento.

La innovacion tecnica relevante es el manejo cross-tokenizer: los IDs del prefijo del alumno se decodifican a texto, se aplica el chat template del profesor, el profesor continua la secuencia, y el resultado se re-codifica con el tokenizador del alumno. El autor verifica que esta ronda de conversion es sin perdidas y que la continuacion del profesor es semanticamente coherente.

## Capacidades

- Razonamiento matematico: el modelo esta entrenado para resolver problemas de matematicas de nivel competitivo (AIME, HMMT) con modo de pensamiento explicito.
- Generacion de cadenas de razonamiento largas: el alumno produce cadenas completas de 16 000 a 18 600 tokens de media.
- Destilacion cross-tokenizer: el modelo es un caso de estudio de como funciona la destilacion entre tokenizers completamente distintos.
- No soporta tool calling ni function calling: no hay evidencia en la tarjeta del modelo de soporte para estas capacidades.
- Capacidades multilingues: no disponibles; el entrenamiento se realizo exclusivamente en ingles.
- Modo thinking: el modelo hereda el modo de pensamiento de Olmo-3-7B-Think-SFT, pero su rendimiento es degradado respecto al base.

## Casos de uso

- Reproduccion de experimentos de destilacion fallida: el autor publica el modelo y el codigo para que otros investigadores puedan reproducir el fallo y verificar las hipotesis sobre las causas de la degradacion.
- Estudio de la cobertura de supervision en destilacion online: el modelo sirve para analizar como el punto de corte K=1024 produce que la perdida solo se aplique al 6% de la cadena de razonamiento, un fenomeno que afecta a cualquier pipeline de destilacion con presupuestos de tokens limitados.
- Ablacion del parametro K en destilacion ROSE: comparando este modelo con otros de la misma familia (como rose-iter-qwen3-1.7b-from-32b-k4096t1024) se puede estudiar como el punto de corte afecta a la calidad de la supervision.
- Evaluacion de estrategias de destilacion cross-tokenizer: el modelo sirve para validar el enfoque de decodificar/re-encodificar entre tokenizadores y verificar que la perdida de informacion en la conversion es nula.
- Benchmark de modelos de razonamiento matematico: se puede usar como punto de comparacion para medir el impacto de tecnicas de destilacion frente al modelo base sin destilar.
- Desarrollo de tecnicas de destilacion online: los resultados de este experimento informan el diseno de futuros pipelines de destilacion, en particular la recomendacion de usar K=8192 y un presupuesto de profesor de 4096 tokens para cubrir el 48-72% de la cadena.

## Benchmarks y rendimiento

El autor reporta resultados de evaluacion con promedio sobre 16 muestras (avg@16), con modo de pensamiento activado, temperatura 0.7, top_p 0.95 y max_new 31744:

| Modelo | AIME25 | HMMT25 |
|---|---|---|
| Qwen3-32B (profesor) | 0.7125 | 0.5042 |
| Olmo-3-7B-Think-SFT (base) | 0.5917 | 0.4167 |
| ROSE 30 pasos | 0.5750 | 0.3854 |
| Este modelo (ROSE 220 pasos) | 0.5583 | 0.3688 |

La tendencia es monotonamente decreciente: una perdida de −0.033 en AIME25 y −0.048 en HMMT25 respecto al base. El autor detalla que el numero de problemas resueltos al menos una vez sube ligeramente (25 a 26 en AIME, 19 a 19 en HMMT) pero el promedio y el pass@1 bajan, lo que indica un aumento de la varianza de las salidas sin una mejora real de la capacidad. La tasa de truncamiento en AIME baja de 0.077 a 0.062, pero sube en HMMT de 0.094 a 0.119.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 7B en BF16 requiere aproximadamente 14 GB de VRAM; con cuantizacion de 4 bits (GGUF) puede reducirse a 4-6 GB.
- GPU recomendadas: una RTX 4090 (24 GB) o una A100 (40/80 GB) para inferencia con BF16 sin cuantizacion. Una RTX 3090 (24 GB) tambien es suficiente.
- Compatibilidad con GPU de consumo: si, una RTX 4060 Ti (16 GB) o RTX 4070 (12 GB) pueden ejecutarlo con cuantizacion de 8 bits o 4 bits.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (para el profesor se uso vLLM con TP4, pero el alumno puede servirse con vLLM en una sola GPU), TGI.
- Latencia y throughput: no se publican datos de latencia en la tarjeta del modelo. El entrenamiento tardo 171 segundos por paso en el entorno descrito (verl 0.7 + vLLM 0.11.0).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AIME25 (avg@16) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ROSE 220 pasos) | 7B | No disponible | 0.5583 | Apache 2.0 | safetensors |
| Olmo-3-7B-Think-SFT (base) | 7B | No disponible | 0.5917 | Apache 2.0 | safetensors |
| Qwen3-32B (profesor) | 32B | No disponible | 0.7125 | Apache 2.0 | safetensors |
| rose-iter-qwen3-1.7b-from-32b-k4096t1024 | 1.7B | No disponible | No publicado | Apache 2.0 | safetensors |

La comparativa principal es contra el propio modelo base sin destilar: el experimento demuestra que la destilacion ROSE con estos parametros degrada el rendimiento. El profesor Qwen3-32B obtiene mejores resultados, como es esperable por su mayor tamano. No hay otros modelos de la misma familia de destilacion ROSE con datos de benchmark publicados en la informacion disponible.

## Limitaciones y advertencias

- El autor declara explicitamente que este es un resultado negativo: el modelo es peor que el base sin entrenar en ambos benchmarks.
- La degradacion es monotona a lo largo del entrenamiento (30 pasos ya muestran perdida, 220 pasos la acentuan), lo que indica que el problema no es falta de entrenamiento sino un diseno defectuoso del pipeline.
- La supervision solo cubre aproximadamente el 6% de la cadena de razonamiento completa (tokens 1024-2048 de una cadena de 16 000-18 600 tokens), por lo que el modelo nunca aprende a converger a la respuesta final.
- El modelo aumenta la varianza de sus salidas (mas problemas resueltos al menos una vez, pero menos problemas resueltos correctamente de forma consistente).
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es util para produccion por su rendimiento degradado.
- Solo entrena en ingles; no hay soporte para otros idiomas.
- El entorno de reproduccion tiene restricciones duras: verl 0.7 solo funciona con vLLM 0.11.0, transformers 4.57.6, y el empaquetado de secuencias requiere flash_attn o `use_remove_padding=False`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SeanWang0027/rose-olmo3-7b-from-qwen3-32b-k1024-step220
- Codigo de reproduccion (rose-opd-implementation): https://huggingface.co/SeanWang0027/rose-opd-implementation
- Dataset de evaluacion (data-dq): https://huggingface.co/SeanWang0027/data-dq
- Modelo relacionado rose-iter-qwen3-1.7b-from-32b-k4096t1024: https://huggingface.co/SeanWang0027/rose-iter-qwen3-1.7b-from-32b-k4096t1024-round1
- Modelo relacionado sciworld-online-rose-qwen3-1p7b-5p5: https://huggingface.co/SeanWang0027/sciworld-online-rose-qwen3-1p7b-5p5
- Paper de Olmo 3 (arXiv 2512.13961): https://arxiv.org/abs/2512.13961
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
