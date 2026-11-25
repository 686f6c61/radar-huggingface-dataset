# FWKV/Myosotis-1-base

## Resumen

Myosotis-1-base es un modelo de lenguaje de 101,86 millones de parámetros desarrollado por FWKV, presentado como el primer lanzamiento de la familia Myosotis. Se construye sobre la arquitectura FWKV, una recurrencia lineal con compuerta de estilo RWKV en la que el decaimiento por canal es un parámetro aprendido y constante, acotado inferiormente a 0,1. Esta decisión de diseño garantiza que la información del pasado decaiga de forma exponencial pero nunca llegue a cero, lo que el autor denomina "contexto efectivo infinito" con memoria de estado de tamaño fijo.

El modelo emplea 13 capas, una dimensión oculta de 768 y un cuello de botella de embedding de 192 dimensiones con pesos atados y factorizados, lo que reduce aproximadamente 15 millones de parámetros respecto a una implementación estándar. El vocabulario es de 50.257 tokens con el tokenizador de GPT-2. Se entrenó en dos etapas sobre unos 2.000 millones de tokens siguiendo la ley de escala de Chinchilla, con una mezcla de datos al estilo SmolLM-Corpus (60 % fineweb-edu-dedup, 25 % cosmopedia-v2 y 15 % python-edu).

Su relevancia actual no reside en el rendimiento en benchmarks, que es modesto, sino en la portabilidad de su inferencia: al usar un decaimiento independiente de los datos (LTI), la recurrencia puede entrenarse con un escaneo asociativo paralelo en PyTorch puro, sin kernels CUDA personalizados, y ejecutarse como una RNN verdadera con memoria constante, lo que permite decodificar a velocidades utilizables en CPU y en hardware sin CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrencia lineal con compuerta de estilo RWKV (FWKV), decaimiento constante por canal |
| Parametros totales | 101.860.800 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens en entrenamiento (packed); contexto efectivo declarado infinito por el decaimiento acotado |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code`) |

Otros datos tecnicos: `d_model` de 768, `d_emb` de 192, 13 capas, expansion FFN de 4x con activacion GELU, vocabulario de 50.257 tokens (tokenizador GPT-2), pesos completamente atados con cabeza de entrada/salida factorizada. Tamano del repositorio: 0,4 GB.

## Arquitectura y entrenamiento

El nucleo del modelo es una recurrencia lineal con estado de tamano fijo que se actualiza mediante `S_t = S_{t-1} * W + k_t * v_t`, donde `W = clamp(sigma(w), 0.1)` es un decaimiento aprendido, constante por canal e independiente de los datos. Al ser un sistema lineal invariante en el tiempo, la recurrencia se puede entrenar con un escaneo asociativo de Hillis-Steele implementado en PyTorch puro, con coste O(log T), sin necesidad de kernels CUDA a medida. Esto contrasta con aproximaciones selectivas como Mamba o RWKV-v5, que renuncian a esa ventaja de portabilidad a cambio de mayor expresividad matematica.

La capa de embedding usa una factorizacion de bajo rango: se almacena una matriz de forma V x d_emb y una proyeccion lineal aprendida que lleva la representacion a d_model antes del primer bloque y la devuelve a d_emb para los logits finales. La cabeza de salida reutiliza la proyeccion transpuesta, lo que permite calcular la entropia cruzada por trozos sin materializar tensores de logits de gran tamano.

El entrenamiento consta de dos etapas. La primera es un preentrenamiento de lenguaje general con unos 2.000 millones de tokens (mezcla 60 % fineweb-edu-dedup, 25 % cosmopedia-v2, 15 % python-edu), optimizador AdamW fusionado, tasa de aprendizaje 1e-4, precision mixta BF16 y checkpointing de gradientes; la perplejidad de validacion al guardar fue de 62,76. La segunda etapa es un ajuste fino exclusivamente sobre datos de chat multiturno, con mascara de perdida que hace que solo los tokens del asistente contribuyan al gradiente, tratando los turnos del usuario como memoria contextual.

## Capacidades

- Generacion de texto autoregresiva en ingles con decodificacion incremental y memoria de estado constante.
- Comprension de codigo basica, derivada del 15 % de python-edu en el corpus de preentrenamiento.
- Razonamiento de sentido comun y respuesta a preguntas de opcion multiple, con rendimiento por debajo de modelos de tamano comparable (ver benchmarks).
- Conversacion multiturno: ajustado con mascara de perdida sobre tokens del asistente, lo que favorece la generacion de respuestas en dialogos.
- Extraccion de caracteristicas: la etiqueta `feature-extraction` aparece en el repositorio, aunque la pipeline declarada es `text-generation`.
- Inferencia en CPU y en hardware sin CUDA gracias a la implementacion en PyTorch puro.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Inferencia en dispositivos de borde y entornos sin GPU: con unos 102 millones de parametros y pesos en BF16 de aproximadamente 0,4 GB, el modelo cabe en Raspberry Pi, mini-PC o telefonos de gama alta y decodifica a unas 14,7 tokens por segundo en CPU con PyTorch puro.
- Prototipado rapido de aplicaciones de chat en cuadernos gratuitos o instancias cloud sin acelerador: la prefill de aproximadamente 1.244,7 tokens por segundo en CPU permite iterar sobre prompts largos sin esperas significativas.
- Generacion de texto en streaming con memoria acotada: al no crecer la cache KV, el consumo de memoria es constante (L x d_model) independientemente de la longitud de la conversacion, lo que simplifica el despliegue en servidores con RAM limitada.
- Educacion e investigacion sobre arquitecturas recurrentes: sirve como referencia reproducible para estudiar recurrencias lineales LTI, escaneo asociativo paralelo y decaimientos acotados sin depender de CUDA.
- Filtrado y clasificacion ligera de texto en ingles: clasificacion de documentos, etiquetado y extraccion de caracteristicas en pipelines de bajo coste donde un modelo mayor no es viable.
- Asistente conversacional de dominio acotado en ingles: para dialogos de soporte simples donde la latencia y el coste por token importan mas que la calidad de razonamiento avanzado.
- Base para ajuste fino experimental: su licencia Apache 2.0 y su tamano permiten reentrenar o adaptar el modelo en una sola GPU de consumo para tareas especificas en ingles.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluacion zero-shot, sin filtro):

| Tarea | Metrica | Valor | Error estandar |
|---|---|---|---|
| arc_challenge | acc | 0,1664 | ± 0,0109 |
| arc_challenge | acc_norm | 0,2159 | ± 0,0120 |
| arc_easy | acc | 0,3864 | ± 0,0100 |
| arc_easy | acc_norm | 0,3434 | ± 0,0097 |
| hellaswag | acc | 0,2621 | ± 0,0044 |
| hellaswag | acc_norm | 0,2579 | ± 0,0044 |
| piqa | acc | 0,5756 | ± 0,0115 |
| piqa | acc_norm | 0,5533 | ± 0,0116 |

El autor reconoce explicitamente que los resultados no son competitivos y atribuye el bajo rendimiento al conjunto de datos de entrenamiento. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas en la informacion disponible.

Rendimiento de inferencia declarado:

| Entorno | Metrica | Valor |
|---|---|---|
| CPU (PyTorch puro) | Decodificacion | ~14,7 tokens/s |
| CPU (PyTorch puro) | Prefill | ~1.244,7 tokens/s |
| GPU (BF16) | Decodificacion | ~130 tokens/s |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en BF16 (101,86 M de parametros); alrededor de 0,2 GB en FP16/INT8 y menos de 0,1 GB en cuantizaciones de 4 bits, aunque no se publican artefactos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria, incluidas RTX 3060, RTX 4090, A100 y H100; el modelo no aprovecha la potencia de las GPU de gama alta por su tamano reducido.
- Cabe holgadamente en GPU de consumo y en CPU; tambien en dispositivos de borde con 1 GB de RAM libre.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via documentada. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF oficiales hace que llama.cpp y Ollama no esten disponibles de forma directa.
- Latencia y throughput: ~130 tokens/s en GPU con BF16 y ~14,7 tokens/s en CPU, con prefill de ~1.244,7 tokens/s en CPU. La memoria es constante durante la generacion al no existir cache KV creciente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| Myosotis-1-base | 101,86 M | 1024 en entrenamiento; efectivo infinito declarado | Recurrencia lineal FWKV (LTI) | Apache 2.0 | Inferencia en CPU sin kernels CUDA; benchmarks debiles |
| SmolLM-135M | 135 M | 2048 | Transformer | Apache 2.0 | Referencia de la mezcla de datos usada; requiere GPU o CPU con mas coste |
| GPT-2 small | 124 M | 1024 | Transformer | MIT | Base historica de 100 M; pesos ampliamente soportados |
| Mamba-130M | 130 M | No disponible | SSM selectivo | Apache 2.0 | Mayor expresividad por gating dependiente de datos, pero requiere kernels CUDA para rendimiento optimo |

La comparacion con SmolLM-135M, GPT-2 small y Mamba-130M se ofrece por categoria y tamano; no se dispone de resultados de benchmarks de esos modelos en la informacion proporcionada para contrastar directamente con Myosotis-1-base.

## Limitaciones y advertencias

- Rendimiento en benchmarks claramente por debajo de lo esperable para su tamano: 38,6 % en arc_easy y 26,2 % en hellaswag en precision simple, lo que limita su uso en tareas que requieran razonamiento fiable.
- El decaimiento no selectivo reduce la expresividad matematica frente a Mamba o RWKV-v5; el propio autor lo senala como limitacion.
- Entrenado solo en ingles; no hay soporte multilingue declarado.
- Ventana de entrenamiento de solo 1024 tokens: el "contexto efectivo infinito" es una propiedad teorica del estado recurrente, no una garantia de calidad en secuencias muy largas.
- Riesgo elevado de alucinacion y de respuestas incoherentes en dominios fuera de la distribucion de entrenamiento, dado el bajo rendimiento observado.
- No se documentan evaluaciones de sesgo, toxicidad ni robustez; se desconoce el comportamiento en produccion con contenido sensible.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no se ofrece garantia ni soporte.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor; conviene auditar el codigo antes de desplegarlo.
- No hay artefactos cuantizados oficiales ni soporte confirmado en motores de inferencia de alto rendimiento, lo que limita el despliegue en produccion a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FWKV/Myosotis-1-base
- Banner del modelo: https://cdn-uploads.huggingface.co/production/uploads/6615494716917dfdc645c44e/j5v2ZbjaxA9owLhm_F0eI.png
