# janmusic/ncm-tinystories-87m-x4-mlx

## Resumen

NCM TinyStories 87M (4x data) in MLX es un generador de texto de 87,4 millones de parámetros entrenado desde cero con Next-Concept Modeling (NCM), una formulación no autorregresiva en la que cada pasada del modelo predice un nivel completo de códigos latentes discretos en paralelo en lugar de un único token. Lo desarrolla el usuario janmusic como artefacto de investigación, con una implementación independiente y no afiliada al trabajo original de Kumbong et al. (arXiv:2610.14162), que define el método. Se distribuye junto al códec congelado de 15,5 millones de valores en el que opera, empaquetado para MLX y orientado a Apple Silicon.

El modelo escribe una historia de grueso a fino: la jerarquía de latentes `1, 8, 16, 24, 32, 40, 52, 64, 76, 92, 108, 128` se rellena en 11 pasadas del generador, frente a las 128 llamadas que necesitaría un modelo autorregresivo para producir 128 tokens. Esa reducción de llamadas es la motivación técnica del enfoque, pero el propio autor advierte que el resultado no es un buen generador de texto: su perplejidad generativa es aproximadamente el doble que la de una línea base autorregresiva de 91,3 millones de parámetros entrenada con los mismos bloques y ventanas.

La relevancia es, por tanto, estrictamente investigadora: sirve para estudiar el equilibrio entre coste de inferencia y calidad en modelos no autorregresivos de decodificación jerárquica, no para despliegues de producción. El contexto es corto (ventanas de 128 tokens), el idioma es solo inglés y la generación es incondicional, sin condicionamiento por prompt.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo con Next-Concept Modeling: 12 bloques, anchura 768, 12 cabezas, atención diagonal por bloques, cabezas de salida atadas al codebook |
| Parametros totales | 87.426.059 en el generador; 15,5 millones de valores en el códec congelado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (ventanas de entrenamiento y muestras de 128 tokens) |
| Tipos de cuantizacion | No disponible (pesos publicados en el formato nativo de ncm-mlx; el entrenamiento se hizo en bf16 con pesos maestros fp32) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | `safetensors` nativo de ncm-mlx (`codec.safetensors`, `generator.safetensors`, `inference.safetensors`), más `spec.json` y `bpe.json`; no es un checkpoint de Transformers ni de `mlx_lm` |

## Arquitectura y entrenamiento

El generador es un transformer de 12 bloques con anchura 768 y 12 cabezas de atención, con atención diagonal por bloques y cabezas de salida atadas al codebook. La jerarquía latente es `1, 8, 16, 24, 32, 40, 52, 64, 76, 92, 108, 128`: el nivel 0 se muestrea de un unigram almacenado y cada una de las 11 pasadas restantes predice un nivel completo de códigos discretos en paralelo. El modelo opera sobre un vocabulario BPE de 8.192 tokens y genera de forma incondicional a partir de un prefijo inicial de un solo token, sin condicionamiento por prompt.

El entrenamiento se realizó en bf16 con pesos maestros en fp32 durante 60.000 actualizaciones con batch de 64, lo que suma 3.840.000 ventanas de 128 tokens (cuatro veces las 960.000 del experimento original), con una corrupción de los códigos de condicionamiento que decae de 0,75 a 0,25. Se ejecutó en una única NVIDIA RTX PRO 6000 durante aproximadamente 6,2 horas con semilla 0; la configuración completa está en `configs/tinystories-ladder-87m-x4-bf16.json` del repositorio de código. El códec es el entrenado para los experimentos de 12M (E21) y nunca se reentrenó ni amplió junto al generador. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto incondicional en inglés: produce aperturas de historia de 128 tokens a partir de un prefijo de un solo token.
- Decodificación jerárquica coarse-to-fine con 11 pasadas del generador por muestra, frente a 128 llamadas de un modelo autorregresivo equivalente.
- Salida intermedia por nivel mediante la opción `--levels`, útil para inspeccionar la decodificación parcial (el autor advierte que no es una traza de razonamiento).
- Ejecución en Apple Silicon sobre Metal, con modo CPU alternativo mediante `--cpu`.
- No soporta tool calling ni function calling.
- No soporta comportamiento de agente ni razonamiento multi-paso.
- No dispone de capacidades multimodales (visión, audio) ni de modo de pensamiento.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Investigación sobre decodificación no autorregresiva: reproducir el experimento de NCM y medir la relación entre número de llamadas al modelo y perplejidad generativa frente a una línea base autorregresiva con los mismos bloques.
- Estudio de representaciones latentes jerárquicas: usar `--levels` para analizar cómo se refina la historia nivel a nivel y qué información aporta cada uno de los 12 niveles de la jerarquía.
- Docencia y divulgación: ilustrar en un curso la diferencia entre generación token a token y generación por conceptos, con un modelo de 87M que cabe en un portátil Apple Silicon.
- Pruebas de infraestructura MLX: validar pipelines de entrenamiento e inferencia en Metal con un modelo pequeño y un formato de pesos propio, sin dependencia de CUDA.
- Experimentos controlados de escalado: comparar esta variante de 87M y 4x datos con la de 50M y con la de 12M del mismo proyecto para estudiar el efecto del tamaño y del presupuesto de datos.
- Reproducción de resultados: verificar las cifras publicadas (perplejidad generativa 24,404 con desviación 0,848 sobre 5 semillas) partiendo de los ficheros y de los SHA-256 del repositorio.
- Generación de datos sintéticos de juguete: producir borradores de frases simples en inglés para pruebas de pipelines, asumiendo la baja calidad del texto y la necesidad de revisión humana.

## Benchmarks y rendimiento

| Métrica | NCM 87,4M (este modelo) | AR baseline 91,3M | Referencia |
|---|---:|---:|---:|
| Perplejidad generativa GPT-2 large, media (DE) sobre 5 semillas, menor es mejor | 24,404 (0,848) | 11,484 (0,341) | Texto real retenido: 8,529; checkpoint TinyStories de Kumbong et al.: 16,259 |
| Ratio NCM sobre AR | 2,13 | 1,00 | No disponible |
| Pérdida limpia con teacher forcing | 1,51620 nats por código | 1,01081 nats por token BPE | No comparable entre sí (objetivos distintos) |
| Llamadas al modelo por muestra de 128 tokens | 11 (más el unigram de nivel 0 almacenado) | 128 | No disponible |

La perplejidad generativa se midió con 1.280 muestras incondicionales por modelo (5 semillas de muestreo × 256), temperatura 1, sin top-k ni top-p, con GPT-2 large (`openai-community/gpt2-large@32b71b1`) sin token BOS y hasta 1.024 tokens. El autor señala que la perplejidad generativa premia texto fluido y repetitivo y no constituye una prueba de calidad.

## Requisitos de hardware

- VRAM estimada: el generador ocupa 349,7 MB y el códec 62,0 MB en el formato publicado, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con más de 1 GB de memoria libre.
- GPU recomendadas: el soporte oficial es MLX sobre Apple Silicon (Metal); el modo `--cpu` funciona sin GPU. No se documenta soporte para CUDA en inferencia.
- Cabe en cualquier GPU consumer actual; el límite práctico no es la memoria sino la disponibilidad de MLX (Apple Silicon, Python 3.12).
- Opciones de despliegue: exclusivamente `ncm_mlx` (versión 0.4.0), mediante `python -m ncm_mlx official generate --task tinystories --weights ncm-87m`. No es compatible con vLLM, llama.cpp, Ollama, TGI ni `mlx_lm`.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento completo (60.000 actualizaciones, batch 64) requirió unas 6,2 horas en una NVIDIA RTX PRO 6000.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Perplejidad generativa | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| NCM TinyStories 87M x4 (este modelo) | 87,4M + códec 15,5M | 128 tokens | No autorregresivo, 11 llamadas por muestra | 24,404 | MIT | HuggingFace, MLX |
| janmusic/ar-tinystories-91m-x4-mlx | 91,3M | 128 tokens | Autorregresivo, 128 llamadas por muestra | 11,484 | No disponible en la información | HuggingFace, MLX |
| Checkpoint TinyStories de Kumbong et al. | No disponible | No disponible | NCM (método original) | 16,259 | No disponible en la información | Publicado por los autores |

El checkpoint de Kumbong et al. obtuvo 16,259 bajo el mismo evaluador, con un presupuesto de entrenamiento mucho mayor según el autor. La comparación de perplejidad entre NCM y AR no está ajustada por cómputo: ambos ven las mismas 3.840.000 ventanas, pero una etapa NCM cuesta más por ventana.

## Limitaciones y advertencias

- No es un generador de texto útil: el ratio de perplejidad frente a la línea base autorregresiva se mantiene por encima de 2 y el texto presenta palabras rotas y frases que pierden el hilo.
- Una sola semilla de entrenamiento: la variante de 12M de la misma receta difiere 2,2 puntos de perplejidad entre dos semillas, y la mejora de 50M a 87M (26,148 a 24,404) es menor que esa diferencia; no existe repetición a este tamaño.
- Precisión y datos cambian a la vez: se entrenó en bf16 con cuatro veces más ventanas que las ejecuciones fp32 anteriores, y la paridad bf16/fp32 solo se comprobó en el generador de 12M con los datos originales.
- Códec congelado: procede de los experimentos de 12M (E21) y nunca se reentrenó ni amplió.
- Cómputo no igualado frente a la línea base autorregresiva.
- Datos sintéticos: TinyStories es prosa generada por GPT-4, con sesgos y distribución propios.
- Muestras cortas e incondicionales de 128 tokens, sin prompt; un único evaluador externo y ninguna valoración humana.
- Contexto muy limitado (128 tokens) e idioma único (inglés), lo que excluye conversaciones multi-turno y documentos largos.
- Riesgo alto de alucinación y de incoherencia factual, agravado por el tamaño y por el dominio sintético.
- Licencia MIT para código y pesos, sin restricciones comerciales declaradas; los datos de entrenamiento (TinyStories V2) están declarados CDLA-Sharing-1.0 por sus autores y no se incluyen en el repositorio.
- No es un checkpoint de Transformers ni de `mlx_lm`: requiere la librería `ncm_mlx` y no puede cargarse en los runners habituales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/janmusic/ncm-tinystories-87m-x4-mlx
- Línea base autorregresiva: https://huggingface.co/janmusic/ar-tinystories-91m-x4-mlx
- Repositorio de código ncm-mlx: https://github.com/janmus1c/ncm-mlx
- Paper del método (Kumbong et al.): https://arxiv.org/abs/2610.14162
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Scorer GPT-2 large: https://huggingface.co/openai-community/gpt2-large
