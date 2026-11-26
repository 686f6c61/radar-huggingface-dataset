# omurberaisik/NoTokenLM-Gen-3.5-Focused

## Resumen

NoTokenLM-Gen-3.5-Focused es un modelo de lenguaje de 9 millones de parámetros desarrollado por el usuario omurberaisik dentro de la familia NoTokenLM. Se trata de un transformer decoder-only entrenado desde cero, sin tokenizador: opera directamente sobre bytes UTF-8 (vocabulario de 256 valores), lo que elimina por completo la dependencia de un tokenizer externo y permite codificar y decodificar texto con `str.encode("utf-8")` y `bytes.decode("utf-8")`.

El modelo es una continuación de entrenamiento (fine-tuning por continuación) sobre el checkpoint de NoTokenLM-Gen-3.5, orientada a corregir la principal debilidad de su predecesor: la coherencia a largo plazo. Según la model card, Gen-3.5 producía generaciones plenamente coherentes en aproximadamente el 38-42 % de los casos en una evaluación manual de 100 prompts; tras este entrenamiento focalizado con un dataset exclusivamente de TinyStories, la coherencia medida sobre 200 generaciones y 10 prompts retenidos a temperatura 0.6 asciende a aproximadamente el 86 %.

Es relevante ahora como ejemplo de modelo extremadamente pequeño (9M parámetros) entrenado desde cero con arquitectura moderna (RoPE, RMSNorm, SwiGLU, weight tying) y enfoque tokenizer-free, útil para investigación en eficiencia, experimentación con modelos byte-level y despliegue en hardware muy limitado. No es un modelo de chat ni de instrucciones: está pensado para continuación de texto narrativo simple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (RoPE, RMSNorm, SwiGLU, weight tying), byte-level sin tokenizer |
| Parametros totales | 9.055.440 (9.053.520 en los safetensors del repo; la diferencia son cabeceras auxiliares de deep supervision usadas solo en entrenamiento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el autor no documenta cuantizaciones publicadas; al ser un modelo de 9M, la cuantizacion es innecesaria en la practica) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 9M de parametros con las innovaciones habituales de los LLM modernos trasladadas a escala minima: embeddings rotatorios (RoPE) para la posicion, RMSNorm en lugar de LayerNorm, activacion SwiGLU en las capas feed-forward y weight tying entre la capa de embedding y la de salida. La innovacion principal es la ausencia total de tokenizer: el vocabulario son los 256 bytes UTF-8 posibles, de modo que la entrada y la salida son secuencias de bytes crudos. Durante el entrenamiento se emplearon cabeceras auxiliares de deep supervision que se descartan en el checkpoint publicado.

El entrenamiento original de Gen-3.5 uso una mezcla de datasets (c4, matematicas y datos sinteticos), pero ese mix inyectaba un registro de "problema de palabras" en prompts no relacionados. Para esta version Focused se realizo una continuacion de entrenamiento sobre un dataset mas estrecho y simple, exclusivamente TinyStories, elegido para reforzar el seguimiento del sujeto y la estructura de relato corto. El autor indica que el checkpoint documentado corresponde al paso 45.600 (sesion #9) y que la actualizacion de la model card es del 19 de agosto de 2026. No se especifica el numero total de tokens de entrenamiento ni si hubo RLHF o DPO (no disponible).

## Capacidades

- Generacion de texto narrativo en ingles a nivel de byte, con morfologia de palabras real y formato de dialogo.
- Coherencia multi-frase mejorada: seguimiento consistente de pronombres y sujeto a lo largo de 2-3 frases (she/she, he/he, his/his en los ejemplos del autor).
- Estructura de relato corto simple, proxima al registro de cuentos infantiles (TinyStories).
- Generacion con decodificacion por muestreo (temperatura recomendada 0.5-0.6, top_k 40).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo de instrucciones ni de chat: no ha visto datos con formato QA.
- Sin capacidad aritmetica fiable ni conocimiento factual del mundo.
- Multilingue: no; solo ingles.

## Casos de uso

- Investigacion en modelos tokenizer-free: permite estudiar el comportamiento de modelos byte-level sin la capa de tokenizacion, con un coste computacional minimo y codigo de encode/decode trivial (`str.encode("utf-8")`).
- Experimentacion educativa con arquitecturas transformer modernas: al incorporar RoPE, RMSNorm, SwiGLU y weight tying en solo 9M de parametros, sirve para ensenar y depurar cada componente sin necesidad de GPUs de gama alta.
- Generacion de cuentos infantiles sinteticos: el entrenamiento exclusivo en TinyStories lo hace adecuado para producir narrativa corta y simple en ingles, por ejemplo para aumentar datasets de relatos infantiles.
- Pruebas de pipelines de inferencia en entornos con recursos minimos: cabe en cualquier GPU consumer e incluso en CPU, lo que permite validar integraciones con transformers, vLLM o llama.cpp antes de escalar a modelos mayores.
- Benchmarking de tecnicas de muestreo: su tamano permite ejecutar cientos o miles de generaciones con distintas temperaturas y top_k para comparar metricas de coherencia de forma rapida y barata.
- Prototipado de demos interactivas de continuacion de texto: con el boton "Open in Colab" del repo se puede desplegar una demo sin configuracion ni token de acceso.
- Baseline para comparativas de coherencia a largo plazo: el autor documenta una tasa de coherencia del ~86 % sobre 200 generaciones, lo que ofrece una referencia reproducible para investigacion en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta una evaluacion manual propia de coherencia:

| Evaluacion | Modelo | Generaciones | Prompts | Temperatura | Coherencia |
|---|---|---|---|---|---|
| Coherencia manual (predecesor) | NoTokenLM-Gen-3.5 | 100 | no disponible | no disponible | ~38-42 % |
| Coherencia manual (este modelo) | NoTokenLM-Gen-3.5-Focused | 200 | 10 retenidos | 0.6 | ~86 % |

El autor reporta ademas que aproximadamente 1 de cada 7 generaciones (~14 %) sigue derivando o contradiciendose, con ejemplos explicitos de fallo (p. ej. "The old man was a girl. She was very popular.").

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 para los 9M de parametros (los pesos en safetensors ocupan una fraccion minima; el repo figura como 0.0 GB).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es sobredimensionada; el modelo funciona tambien en CPU sin problema.
- Cabe en cualquier GPU consumer, incluida las integradas, y en Raspberry Pi o entornos similares.
- Opciones de despliegue: transformers con `trust_remote_code=True` (metodo documentado por el autor), y en principio vLLM, llama.cpp u Ollama si se convierte a los formatos correspondientes (no documentado por el autor).
- Latencia y throughput: no disponibles; por el tamano, la latencia sera de milisegundos en GPU y de decenas o cientos de milisegundos por token en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NoTokenLM-Gen-3.5-Focused | 9M | no disponible | Byte-level sin tokenizer, TinyStories | Apache 2.0 | Hugging Face |
| NoTokenLM-Gen-3.5 | ~9M | no disponible | Byte-level sin tokenizer, mix c4/math/synth | Apache 2.0 | Hugging Face |
| TinyStories (modelos de referencia) | 1M-33M | no disponible | Transformer con tokenizer, dataset TinyStories | no disponible | Hugging Face / paper |
| Modelos tipo GPT-2 small | 124M | 1024 | Transformer con tokenizer BPE | MIT | Hugging Face |

La comparativa con TinyStories y GPT-2 small se ofrece como referencia de categoria (modelos pequenos de generacion de texto en ingles); no se dispone de datos de rendimiento comparables publicados en la informacion proporcionada.

## Limitaciones y advertencias

- Coherencia imperfecta: aproximadamente el 14 % de las generaciones siguen derivando o contradiciendose, incluso a nivel de sujeto dentro de la misma frase.
- Alucinacion y sinsentido semantico: frases gramaticalmente correctas pero vacias de significado ("They walked into a big forest with a long direction").
- Sin conocimiento factual ni aritmetica fiable: el checkpoint actual, entrenado solo con TinyStories, trata los prompts con forma de problema matematico como inicios de relato.
- No es un modelo de instrucciones ni de chat: no responde a preguntas; debe usarse con continuacion de texto.
- Solo ingles; sin capacidades multilingues.
- Estilo limitado a narrativa simple de cuentos infantiles; el registro mas literario de Gen-3.5 se ha perdido en este fine-tuning.
- Longitud de contexto no documentada: no se debe asumir una ventana amplia.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no ofrece garantias de calidad para produccion en tareas reales.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor; conviene revisarlo antes de desplegar en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omurberaisik/NoTokenLM-Gen-3.5-Focused
- Modelo predecesor NoTokenLM-Gen-3.5: https://huggingface.co/omurberaisik/NoTokenLM-Gen-3.5
- Dataset TinyStories (referencia del entrenamiento): no disponible en la informacion proporcionada
- Paper o blog tecnico del autor: no disponible en la informacion proporcionada
