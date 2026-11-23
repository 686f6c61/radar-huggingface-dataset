# Asilarkness/DiffuRefill-1B

## Resumen

DiffuRefill-1B es un modelo de lenguaje de 1.080 millones de parámetros basado en difusión enmascarada (masked diffusion) con atención bidireccional, desarrollado por el usuario Asilarkness. A diferencia de los modelos autorregresivos, que generan un token por pasada, este modelo redacta secuencias completas mediante un proceso de denoising paralelo y, después, dedica unas pocas pasadas adicionales a reescribir únicamente los tokens con menor confianza (confidence-targeted re-infilling). El resultado es una generación de aproximadamente 20 pasadas para una secuencia completa, independientemente de su longitud.

El modelo se encuentra en estado de preentrenamiento, aproximadamente a mitad de camino: paso ~100k de 200k, ~46B tokens efectivos de entrenamiento y ronda de fusión 290. Los pesos publicados son un checkpoint vivo de preentrenamiento, con inglés fluido pero hechos todavía poco fiables, y sin ajuste por instrucciones. El autor recomienda usar `global_ema.pt`, que es el mejor checkpoint en cada ronda.

La relevancia técnica del proyecto reside en su infraestructura de entrenamiento: DiLoCo sobre máquinas efímeras de una sola GPU (RTX PRO 6000 Blackwell, 96 GB) sin interconexión, sincronizadas a través del propio repositorio de Hugging Face. Esto demuestra un patrón de entrenamiento distribuido de bajo coste para modelos de difusión de texto, una alternativa poco explorada frente al paradigma autorregresivo dominante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión enmascarada, 18 bloques, dim 2048, 16 cabezas, SwiGLU 5632, RMSNorm, RoPE, atención bidireccional |
| Parametros totales | 1,08B (embedding atado a la cabeza de salida) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (el repositorio contiene checkpoints `.pt`, incluido `global_ema.pt`) |

## Arquitectura y entrenamiento

El modelo es un transformer de 18 bloques con atención bidireccional, dimensión 2048, 16 cabezas, FFN SwiGLU de 5632 y RMSNorm con RoPE. Usa el tokenizador de `openbmb/MiniCPM4-0.5B` (73.440 tokens, vocabulario ampliado a 73.760 para MASK y PAD). El objetivo es difusión enmascarada absorbente, con pérdida calculada únicamente sobre las posiciones enmascaradas. El muestreo de `t` es uniforme en (0,15, 1) por fila, con enmascaramiento independiente por posición; la mitad de las filas conservan un prefijo limpio de longitud aleatoria, lo que reproduce la forma de la generación con prompt. La atención queda confinada a cada documento empaquetado. En una cuarta parte de las filas se enmascaran nombres y números como spans completos (salient span masking), de modo que el modelo deba recuperarlos en lugar de aprovechar la mitad visible de una entidad de dos tokens.

El entrenamiento se distribuye con DiLoCo sobre 3-5 máquinas efímeras de una sola GPU sin interconexión. Cada worker ejecuta 150 pasos locales de AdamW, publica `ckpt_wNN.pt` y adopta el `global_b.pt` fusionado; el merger promedia los checkpoints de la ronda (media simple acumulada en fp32) y espera como máximo 150 s tras la primera llegada. Se publica una media exponencial de los globales (β 0,9) como `global_ema.pt`. El optimizador es AdamW (0,9, 0,95) con weight decay 0,1, clip 1,0, LR pico 1,5e-4 y decaimiento coseno al 10% en 200k pasos; cada paso de worker cubre 64 × 2048 = 131.072 tokens. Los bloques están compilados con `torch.compile` (17% más rápidos y con menos memoria). Respecto a la mezcla de datos desde el paso ~96,8k: Ultra-FineWeb-L3 Multi-Style + QA sintético 56%, Wikipedia en inglés 15%, FineMath 4+ 8%, Cosmopedia v2 8%, OpenCoder annealing 8% y un corpus propio de Wikipedia reescrita como prosa didáctica 5%. Antes de ese paso el modelo solo vio Ultra-FineWeb.

## Capacidades

- Generación de texto en inglés mediante decodificación paralela por difusión, con aproximadamente 20 pasadas para una secuencia completa.
- Decodificación dirigida por confianza: borrador completo en pocas pasadas paralelas y reescritura posterior de los tokens menos seguros.
- Relleno de huecos (infilling) y reconstrucción de texto parcialmente enmascarado, gracias a la atención bidireccional.
- Capacidad de recuperación de hechos en fase temprana: la sonda de hechos PopQA alcanza 0,560 en elección múltiple (azar 0,25) y 0,083 en coincidencia exacta.
- Capacidad de generación condicionada por prompt, ya que la mitad de las filas de entrenamiento conservan un prefijo limpio.
- No dispone de ajuste por instrucciones ni de modo de razonamiento explícito.
- No se documenta soporte de tool calling, function calling, agentes ni multimodalidad.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Investigación en modelos de difusión de lenguaje: el checkpoint permite reproducir y extender experimentos de decodificación paralela y re-infilling dirigido por confianza, comparando con baselines autorregresivos del mismo tamaño.
- Relleno y edición de texto: la atención bidireccional y el objetivo de difusión enmascarada lo hacen adecuado para completar pasajes con huecos, corregir fragmentos o reconstruir texto parcial, tareas donde un modelo autorregresivo tiene menos margen.
- Estudio de entrenamiento distribuido de bajo coste: el repositorio documenta el esquema DiLoCo con workers efímeros de una sola GPU y fusiones periódicas, útil como referencia para equipos que entrenan sin interconexión dedicada.
- Generación de texto en inglés con latencia acotada por longitud: al requerir un número de pasadas aproximadamente constante, resulta interesante para escenarios donde la longitud de salida es variable y se quiere evitar el coste lineal por token de la decodificación autorregresiva.
- Experimentos de enmascaramiento de spans salientes: el modelo incorpora entrenamiento específico para recuperar nombres y números enmascarados como spans completos, lo que permite evaluar técnicas de recuperación factual.
- Base para ajuste fino posterior: al estar bajo licencia Apache 2.0 y en estado intermedio de preentrenamiento, sirve como punto de partida para experimentos de post-entrenamiento sobre arquitecturas de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks públicos en la informacion disponible. El autor indica explícitamente que en esta fase las puntuaciones quedarían cerca del azar y dirían poco. Las métricas internas reportadas son las siguientes:

| Medida | Descripcion | Ultimo valor |
|---|---|---|
| Held-out CE (EMA) | CE enmascarada en t = 0,3 / 0,6 / 0,9 sobre una porcion fija de Ultra-FineWeb | 2,939 (ronda 287) |
| Held-out CE (global) | La misma medida para el ultimo global fusionado | 2,957 |
| Sonda de hechos, eleccion multiple | 1.050 hechos PopQA con la respuesta enmascarada; la respuesta correcta debe superar a tres distractores de igual longitud (azar 0,25) | 0,560 (antes 0,540) |
| Sonda de hechos, NLL de respuesta | NLL por token de la respuesta correcta enmascarada | 6,08 (antes 6,55) |
| Sonda de hechos, coincidencia exacta (EMA) | Respuesta decodificada token a token y comparada con las respuestas aceptadas de PopQA | 0,083 (antes 0,075) |
| Precision de decodificacion | Decodificacion por confianza del 50% de texto enmascarado en 8 pasadas: precision de token / de par adyacente | 0,653 / 0,453 (ronda 275) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 1,08B parámetros, en fp16 serían aproximadamente 2,2 GB de pesos, y en cuantizaciones de 8 o 4 bits bajaría de forma proporcional, pero el autor no publica cifras ni formatos cuantizados.
- GPU de entrenamiento documentadas: RTX PRO 6000 Blackwell de 96 GB, en flotas de 3-5 máquinas de una sola GPU sin interconexión.
- GPU recomendadas para inferencia: no disponible. Por tamaño, el modelo debería caber en GPUs de consumo con suficiente VRAM, pero no hay validación publicada.
- Opciones de despliegue: no disponible. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI; los pesos se distribuyen como checkpoints `.pt` (`global_ema.pt`), no como safetensors ni GGUF.
- Latencia y throughput: el autor indica que una secuencia completa requiere aproximadamente 20 pasadas, con independencia de su longitud, frente a una pasada por token de un modelo autorregresivo. No se publican medidas de latencia absoluta ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Paradigma | Licencia | Estado |
|---|---|---|---|---|---|
| DiffuRefill-1B | 1,08B | 2048 | Difusion enmascarada con re-infilling | Apache 2.0 | Preentrenamiento (~50%) |
| Modelos autorregresivos de ~1B (p. ej. familia SmolLM) | ~1B | No disponible en la informacion | Autorregresivo | No disponible en la informacion | No disponible |
| Modelos de difusion de texto de escala similar | No disponible | No disponible | Difusion enmascarada | No disponible | No disponible |

No se dispone de datos de benchmarks publicados que permitan una comparacion cuantitativa con alternativas de la misma categoria. La comparacion relevante es cualitativa: frente a un autorregresivo de tamano similar, DiffuRefill-1B intercambia el coste lineal por token por un numero de pasadas aproximadamente constante, a cambio de un estado de entrenamiento mucho mas temprano y sin ajuste por instrucciones.

## Limitaciones y advertencias

- Checkpoint vivo de preentrenamiento a mitad de entrenamiento (paso ~100k de 200k): los hechos son poco fiables y el modelo no esta ajustado por instrucciones.
- No debe usarse en produccion para tareas factuales: la coincidencia exacta en la sonda PopQA es de 0,083.
- Solo soporta ingles segun la model card.
- Contexto limitado a 2048 tokens.
- No se documentan sesgos conocidos, pero al entrenarse sobre corpus web (Ultra-FineWeb, Wikipedia, Cosmopedia) es previsible que herede sesgos de esas fuentes; no hay evaluacion publicada al respecto.
- Riesgo de alucinacion elevado en el estado actual, coherente con la baja puntuacion de la sonda de hechos.
- Licencia Apache 2.0, que permite uso comercial, pero el estado de preentrenamiento hace desaconsejable cualquier despliegue comercial sin post-entrenamiento.
- El repositorio ocupa 2507,6 GB, lo que implica descargas muy pesadas si se quieren todos los checkpoints; conviene descargar solo `global_ema.pt`.
- No se publican formatos cuantizados ni integraciones con frameworks de inferencia habituales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Asilarkness/DiffuRefill-1B
- Dataset Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Tokenizador MiniCPM4-0.5B: https://huggingface.co/openbmb/MiniCPM4-0.5B
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset SmolLM corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset OpenCoder annealing corpus: https://huggingface.co/datasets/OpenCoder-LLM/opc-annealing-corpus
