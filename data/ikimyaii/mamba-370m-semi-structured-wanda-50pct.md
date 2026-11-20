# ikimyaii/Mamba-370M-semi-structured-Wanda-50pct

## Resumen

Mamba-370M-semi-structured-Wanda-50pct es una versión podada del modelo `state-spaces/mamba-370m-hf`, publicado por el usuario `ikimyaii` en Hugging Face. Se trata de un experimento de compresión: parte de un modelo de arquitectura Mamba (state space model, SSM) de aproximadamente 423 millones de parámetros y le aplica una poda one-shot del 50 % de dispersión semi-estructurada mediante el algoritmo Wanda (Pruning by Weights and Activations), sin reentrenamiento posterior. El resultado es un checkpoint que conserva la estructura del modelo original pero con la mitad de los pesos de las capas lineales internas a cero.

El interés de esta ficha es doble. Por un lado, documenta una técnica de compresión aplicada a una arquitectura no transformer, algo poco frecuente en la literatura de poda, que se ha centrado mayoritariamente en modelos tipo transformer. Por otro, sirve como baseline declarado por el propio autor para comparar con otros métodos de poda (los "modelos EHWS" mencionados en la model card). No es un modelo pensado para producción ni para uso general: es un artefacto de investigación con cero descargas y sin licencia declarada.

La relevancia práctica es limitada fuera del ámbito de la experimentación con compresión de modelos. No obstante, para investigadores interesados en poda de SSM, cuantización y eficiencia, ofrece un punto de referencia reproducible con métricas de perplejidad y evaluación zero-shot publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mamba (state space model, SSM selectivo) |
| Parámetros totales | 423.003.136 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en bfloat16 en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es `state-spaces/mamba-370m-hf`, un modelo Mamba de la familia desarrollada por State Space Models (gubernamentalmente asociada a Albert Gu y Tri Dao). Mamba sustituye la atención por un mecanismo de espacio de estados selectivo con complejidad lineal en la longitud de secuencia, lo que permite contextos largos con menor coste computacional que un transformer equivalente. La versión `-hf` es la adaptación del modelo original al formato de `transformers`.

Sobre ese modelo se aplicó una poda one-shot con el código oficial de Wanda (repositorio `locuslab/wanda`, commit `8e8fc87`, rama unstructured, `use_variant=False`). Wanda puntúa cada peso como `|W| * sqrt(||X||)`, es decir, combina la magnitud del peso con la norma de la activación de entrada, y elimina los pesos con menor puntuación. En este caso se podaron todas las capas lineales internas de los bloques (`in_proj`, `x_proj`, `out_proj`), manteniendo densas `dt_proj` (aproximadamente el 2 % de los pesos lineales de cada bloque), `conv1d`, `A_log`, `D`, los embeddings y `lm_head`. La calibración se hizo con 128 secuencias de C4 de 2.048 tokens (semilla 0), podando bloque a bloque en orden y calibrando cada bloque sobre las salidas de los bloques ya podados. La poda se realizó en bfloat16 y tardó 2,1 minutos en una A100 de 40 GB. La dispersión medida en las capas podadas es de 0,4901, coherente con el objetivo del 50 %.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Mamba-370M.
- Modelado de lenguaje y cálculo de perplejidad (WikiText-2 y C4).
- Evaluación zero-shot en tareas de razonamiento y comprensión (ARC, BoolQ, HellaSwag, OpenBookQA, RTE, WinoGrande).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No dispone de modo thinking, visión, audio ni otras capacidades especiales documentadas.

## Casos de uso

- Investigación en poda de modelos SSM: sirve como punto de partida reproducible para comparar técnicas de poda (Wanda, SparseGPT, Magnitude) sobre Mamba, ya que el autor lo declara baseline de sus modelos EHWS.
- Estudio de la degradación por compresión: permite medir cuánto cae la perplejidad y la precisión zero-shot al eliminar el 50 % de los pesos lineales sin reentrenamiento, con métricas publicadas (perplejidad 21,40 en WikiText-2 y 27,10 en C4).
- Evaluación de pipelines de poda sobre arquitecturas no transformer: útil para validar herramientas y drivers de poda que normalmente solo soportan OPT o LLaMA, ya que el autor tuvo que escribir el recorrido de capas específico para Mamba.
- Benchmarking de eficiencia: al tener la mitad de pesos activos en las capas lineales internas, puede usarse para estudiar el ahorro teórico de memoria y cómputo en inferencia con kernels que exploten la dispersión.
- Docencia y divulgación: ejemplo concreto de cómo se aplica Wanda paso a paso (calibración con C4, poda por bloques, conservación de capas críticas como `dt_proj`) sobre un modelo pequeño que cabe en una sola GPU.
- Reproducibilidad de experimentos: el checkpoint permite verificar los resultados del artículo o del repositorio de Wanda sin necesidad de reejecutar la poda, que requiere una A100 y el código oficial.

## Benchmarks y rendimiento

Perplejidad (protocolo de evaluación de ELSA, en bfloat16 porque Mamba desborda en fp16):

| Conjunto | Perplejidad |
|---|---|
| WikiText-2 | 21,40 |
| C4 | 27,10 |

Precisión zero-shot (lm-evaluation-harness):

| Tarea | Precisión |
|---|---|
| arc_challenge | 0,2253 |
| arc_easy | 0,5051 |
| boolq | 0,6196 |
| hellaswag | 0,3348 |
| openbookqa | 0,1820 |
| rte | 0,5271 |
| winogrande | 0,5438 |
| Media | 0,4197 |

No se proporcionan resultados del modelo base sin podar para comparar la degradación, ni resultados de otros modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 0,85 GB solo para pesos (423 M de parámetros × 2 bytes), más overhead de activaciones y caché.
- VRAM estimada en float32: aproximadamente 1,7 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bfloat16; una RTX 3060, RTX 4060 o superior es suficiente. Para la poda original se usó una A100 de 40 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1660, RTX 20xx, 30xx, 40xx) e incluso en CPU para inferencia lenta.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(...)` es el método documentado por el autor. No se documenta soporte en vLLM, llama.cpp, Ollama o TGI; dado que Mamba no es un transformer, el soporte en estos motores es limitado o inexistente.
- Latencia y throughput: no disponibles en la información proporcionada. La poda semi-estructurada no garantiza aceleración real salvo que el kernel de inferencia explote la dispersión, algo que no se documenta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Mamba-370M-semi-structured-Wanda-50pct (este) | 423 M | no disponible | no disponible | Hugging Face, 0 descargas | Poda one-shot al 50 %, sin reentrenamiento |
| state-spaces/mamba-370m-hf (base) | ~370 M | no disponible | no disponible | Hugging Face, oficial | Modelo original sin podar; referencia para medir degradación |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | Hugging Face | Mencionados como comparación en la model card, sin datos públicos en la información proporcionada |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo listo para producción: cero descargas, cero likes y sin documentación de uso más allá de la carga con `transformers`.
- Licencia no declarada: no se puede asumir uso comercial permitido; hay que consultar la licencia del modelo base `state-spaces/mamba-370m-hf` antes de cualquier uso.
- La poda one-shot sin reentrenamiento degrada la calidad respecto al modelo base; no se publican las métricas del base para cuantificar la caída, pero la perplejidad en C4 (27,10) y la media zero-shot (0,4197) son moderadas.
- La dispersión semi-estructurada no garantiza aceleración en inferencia sin kernels específicos; el checkpoint puede ocupar lo mismo en memoria que el modelo denso si no se explota la dispersión.
- Mamba desborda en fp16 según el autor, por lo que debe usarse bfloat16 o float32; esto limita su uso en GPUs antiguas sin soporte bf16 (por ejemplo, GTX 10xx).
- No hay información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos; se heredan los del modelo base, que no están documentados en esta ficha.
- El autor advierte que el recorrido de capas es código nuevo (los drivers oficiales de Wanda solo soportan OPT y LLaMA), lo que introduce un riesgo de error no validado por terceros.
- Longitud de contexto no documentada; no se debe asumir la del modelo base sin verificarla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-370M-semi-structured-Wanda-50pct
- Modelo base: https://huggingface.co/state-spaces/mamba-370m-hf
- Código oficial de Wanda: https://github.com/locuslab/wanda (commit `8e8fc87`)
- Repositorio de Mamba (State Space Models): no disponible en la información proporcionada
- Paper de Wanda: no disponible en la información proporcionada
- Paper de Mamba: no disponible en la información proporcionada
- Demo o espacio de inferencia: no disponible
