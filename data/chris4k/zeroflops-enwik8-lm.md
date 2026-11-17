# Chris4K/zeroflops-enwik8-lm

## Resumen

ZeroFLops enwik8 es una familia de modelos de lenguaje a nivel de caracter (byte) entrenados sobre el corpus enwik8, publicados por el autor Chris4K como parte de la línea de investigación "hard-residual LM" del proyecto ZeroFLops. El modelo no utiliza una softmax densa sobre el vocabulario: en su lugar, cada posición se enruta a través de un conjunto de *expertos* discretos (expertos de n-gramas sobre contextos de bytes de longitud creciente, un experto de palabra y una caché de documento que cuenta los bytes vistos en el documento actual). Solo un experto se activa por posición y su salida es un recuento entero exacto, de ahí el término "zero FLOPs": el coste computacional reside en la contabilidad (conteo), no en multiplicaciones matriciales en coma flotante.

El repositorio contiene tres checkpoints: dos modelos de lenguaje sobre enwik8 (`e8b_cache`, de 86,3 M de parámetros y contexto de 1024; `e8l_cache`, de 39,5 M de parámetros y contexto de 512) y un checkpoint de una línea de investigación distinta (GF(256) Connect Four V7). Los resultados medidos en el split de test estándar de 5 MB de enwik8 sitúan a `e8b_cache` en 1,0270 BPC en evaluación estática y 0,9756 BPC con evaluación dinámica ("aprender mientras se lee"), y a `e8l_cache` en 1,0176 BPC estático y 0,9795 BPC dinámico.

La relevancia actual del modelo es fundamentalmente investigadora: explora una arquitectura alternativa a los transformers densos para modelado de lenguaje a nivel de byte, con un mecanismo de memoria explícito y evaluación dinámica, y publica ablaciones que cuantifican el valor de cada componente de memoria. No es un modelo de propósito general ni está pensado para despliegue en producción conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje a nivel de caracter/byte con enrutamiento "hard-expert" (expertos de n-gramas sobre contextos de bytes, experto de palabra y caché de documento); forward pass discreto basado en recuentos enteros, no en softmax densa |
| Parametros totales | 86,3 M (`e8b_cache`); 39,5 M (`e8l_cache`); 85,3 M (`e8b_alone`); 38,8 M (`e8f_alone`) |
| Parametros activos | No aplica (no es MoE en el sentido convencional; un solo experto se activa por posición) |
| Longitud de contexto | 1024 (`e8b_cache`, `e8b_alone`); 512 (`e8l_cache`, `e8f_alone`) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (entrenado sobre enwik8, corpus de Wikipedia en inglés) |
| Licencia | MIT |
| Formato de pesos | Checkpoints PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El modelo sustituye la softmax densa sobre el vocabulario por un mecanismo de enrutamiento a expertos discretos. Cada posición se procesa mediante uno de los siguientes expertos: expertos de n-gramas sobre contextos de bytes de longitud creciente, un experto de palabra y una caché de documento que acumula los recuentos de bytes observados en el documento en curso. Solo un experto se activa por posición y su salida es un recuento entero exacto; el coste aritmético en coma flotante es mínimo, y el "trabajo" se concentra en la contabilidad de recuentos. El entrenamiento se realizó sobre enwik8 con contextos de 512 o 1024 según el checkpoint, con 200k-400k pasos según el modelo (`e8l_cache` es el más entrenado, con 400k pasos).

La card documenta una ablación que aísla la contribución de cada componente de memoria (medida en BPC de validación sobre `e8l_cache`): memoria tal como se entrenó, 1,0630; sin contextos largos (8+ bytes), 1,1051; sin experto de palabra, 1,0763; sin caché de documento, 1,1612; contextos de bytes solo hasta 2 bytes, 1,1665; recuentos de evidencia a 0, 1,1135; todas las tablas vacías (solo unigramas), 1,2928; sin memoria (uniforme), 6,5112; y memoria de una ventana distinta, 12,8174. Esta última fila es el control clave: alimentar el modelo con memoria de otra ventana resulta catastrófico, lo que indica que el mecanismo lee realmente el documento actual y no actúa como un prior genérico.

## Capacidades

- Modelado de lenguaje a nivel de caracter/byte sobre texto tipo Wikipedia (enwik8).
- Predicción de siguiente byte mediante recuentos discretos enrutados a expertos.
- Evaluación dinámica: el modelo puede dar un pequeño paso de entrenamiento sobre cada ventana después de puntuarla, aprendiendo solo de texto ya evaluado.
- Memoria de documento explícita mediante caché de recuentos de bytes.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües: no documentadas; el corpus de entrenamiento es enwik8 (inglés).

## Casos de uso

- Investigación en modelado de lenguaje a nivel de byte: servir como referencia reproducible para estudiar arquitecturas alternativas a la softmax densa y al transformer convencional, con ablaciones publicadas y comandos de reproducción en el repositorio GitHub.
- Estudio de evaluación dinámica: el checkpoint permite reproducir el protocolo "learning while reading" (un paso de entrenamiento por ventana tras puntuarla) y medir la ganancia en BPC, útil para investigar adaptación en línea sin fuga de información.
- Análisis de mecanismos de memoria: la ablación documentada permite aislar el valor de la caché de documento, los expertos de palabra y los contextos de bytes largos, como base para experimentos de interpretabilidad de memoria.
- Compresión de texto sin pérdidas basada en modelos: con 1,0270 BPC en test, el modelo puede emplearse como modelo de probabilidad para codificación aritmética de texto tipo Wikipedia, sirviendo de comparación frente a compresores clásicos.
- Reproducción de experimentos: los scripts `run_all.py` (etapas `gold`, `e8final`, `dyn`, `--report`) y `download_hf_corpus.py` permiten regenerar datos, entrenar y evaluar, adecuado para cursos o trabajos de replicación.
- Línea base para comparación con transformers pequeños: con 39,5-86,3 M de parámetros y contextos de 512-1024, sirve como referencia de eficiencia computacional en tareas de modelado de byte frente a modelos densos de tamaño comparable.
- Estudio del checkpoint GF(256) Connect Four V7: artefacto de una línea de investigación distinta, útil para quienes sigan el proyecto ZeroFLops y necesiten el binario verificado por hash fuera de GitHub.

## Benchmarks y rendimiento

Resultados medidos en enwik8, split de test estándar de 5 MB. Bits per byte (BPC), menor es mejor.

Evaluación estática:

| Modelo | Params | Contexto | Pasos | Val BPC | Test BPC | Probe |
|---|---|---|---|---|---|---|
| e8b_cache | 86,3 M | 1024 | 250k | 1,0463 | 1,0270 | 56,9% |
| e8l_cache | 39,5 M | 512 | 400k | 1,0350 | 1,0176 | — |
| e8b_alone | 85,3 M | 1024 | 250k | 1,0917 | 1,0750 | 69,2% |
| e8f_alone | 38,8 M | 512 | 200k | 1,1193 | 1,1050 | 63,1% |

Evaluación dinámica ("learning while reading"):

| Modelo | Test BPC | Test con aprendizaje en lectura | Ganancia | Step size |
|---|---|---|---|---|
| e8b_cache | 1,0270 | 0,9756 | 0,0513 | rms 5e-06 |
| e8b_alone | 1,0750 | 0,9990 | 0,0760 | rms 1e-05 |
| e8f_alone | 1,1050 | 1,0481 | 0,0569 | rms 5e-06 |
| e8l_cache | 1,0176 | 0,9804 | 0,0371 | rms 5e-06 |
| e8l_cache | 1,0176 | 0,9795 | 0,0380 | rms 1e-05 |

Referencia publicada citada en la card: Transformer-XL de 277 M con evaluación dinámica alcanza 0,94 BPC sobre el mismo fichero de test.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,6 GB) y los parámetros (39,5-86,3 M), los checkpoints son pequeños y caben holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos unos pocos GB de memoria libre debería bastar, aunque el autor no publica requisitos.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU consumer con memoria suficiente para cargar el checkpoint (no confirmado por el autor).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el flujo previsto es el repositorio GitHub `Ckal/ZeroFLops-paper` con `run_all.py` y los checkpoints `.pt` de PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Test BPC enwik8 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZeroFLops e8b_cache | 86,3 M | 1024 | 1,0270 (estático) / 0,9756 (dinámico) | MIT | Hugging Face + GitHub |
| ZeroFLops e8l_cache | 39,5 M | 512 | 1,0176 (estático) / 0,9795 (dinámico) | MIT | Hugging Face + GitHub |
| Transformer-XL (referencia citada) | 277 M | No disponible | 0,94 (con evaluación dinámica) | No disponible en la información | No disponible en la información |

No se dispone de otros modelos comparables en la información proporcionada; la comparación con Transformer-XL procede de la referencia publicada citada en la model card.

## Limitaciones y advertencias

- Modelo de investigación: no es un modelo de propósito general; está diseñado para modelado de byte sobre enwik8 y evaluación experimental.
- Idiomas: entrenado sobre enwik8 (Wikipedia en inglés); no se documentan capacidades multilingües.
- La columna "probe" es la fracción de posiciones en las que el modelo clasifica primero el movimiento legalmente jugable; es un diagnóstico, no una tasa de victorias.
- El run `e8l_cache` no tiene contrapartida `alone`, por lo que la contribución de su memoria se infiere de la ablación y no se mide directamente sobre ese checkpoint.
- La afirmación de transferencia entre dominios (código / wiki_de / wiki_en) nunca se midió; la etapa de dominio está preparada pero no ejecutada.
- Riesgo de alucinación y sesgos: no documentados; al ser un modelo de recuentos de bytes sobre un corpus concreto, su comportamiento fuera de la distribución de enwik8 no está caracterizado.
- Licencia MIT: permite uso comercial según los términos de la licencia, pero el autor no documenta garantías ni soporte para producción.
- El repositorio incluye un checkpoint de una línea de investigación distinta (GF(256) Connect Four V7) que no debe confundirse con los modelos de lenguaje.
- El paper está en preparación y la citación figura como "TBD".

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chris4K/zeroflops-enwik8-lm
- Repositorio GitHub del proyecto: https://github.com/Ckal/ZeroFLops-paper
- Paper: en preparación (citación TBD en la model card)
