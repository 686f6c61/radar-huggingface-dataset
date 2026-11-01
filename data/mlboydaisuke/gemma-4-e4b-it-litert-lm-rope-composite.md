# mlboydaisuke/gemma-4-E4B-it-litert-lm-rope-composite

## Resumen

`mlboydaisuke/gemma-4-E4B-it-litert-lm-rope-composite` es un artefacto de prueba derivado de `google/gemma-4-E4B-it`, exportado con la herramienta `litert-torch` (funcion `export_hf`) para el runtime LiteRT-LM de Google AI Edge. No se trata de un modelo entrenado de nuevo ni de una variante oficial: es un fichero `.litertlm` de 8,2 GB generado para reproducir y depurar el problema LiteRT-LM #3913, relacionado con el calculo de embeddings rotatorios (RoPE) en el backend GPU. El autor lo publica como evidencia tecnica, no como sustituto del fichero oficial publicado por `litert-community`.

El modelo subyacente, Gemma 4 E4B en su variante instruct, es un transformer denso de Google con decodificacion autorregresiva, plantilla de chat canonica de Gemma 4 y tokenizador SentencePiece. La exportacion emplea la receta por defecto de `export_hf` (`dynamic_wi8_afp32`), es decir, pesos en int8 con activaciones en fp32, y una cache KV fijada en 8.192 tokens en el momento de la exportacion. El fichero resultante ocupa mas del doble que el oficial (8,2 GB frente a 3,66 GB), lo que refleja el esquema de cuantizacion mas conservador.

Su relevancia es acotada pero util para quien trabaje con LiteRT-LM: documenta con mediciones reproducibles como la implementacion de RoPE como `odml.rope` composite corrige los fallos de copia de secuencias largas que el fichero oficial presenta a partir de la posicion 2.097. Incluye resultados en Apple M4 Max (GPU WebGPU/Metal y CPU XNNPACK) y en un Galaxy S26 con Adreno 840, con 118 casos de copia de numeros de 48 digitos y prompts de hasta 7.993 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4), exportado a LiteRT-LM con RoPE composite |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (cache KV fijada en exportacion con `--cache_length=8192`) |
| Tipos de cuantizacion | Pesos int8, activaciones fp32 en exportacion (`dynamic_wi8_afp32`); en ejecucion, GPU a fp16 por defecto o FLOAT32, CPU via XNNPACK |
| Idiomas soportados | no disponible (heredados de `google/gemma-4-E4B-it`) |
| Licencia | Apache 2.0 (con `license_link` a la licencia de Gemma 4 de Google) |
| Formato de pesos | `.litertlm` (LiteRT-LM), fichero unico de 8.207.753.872 bytes |

## Arquitectura y entrenamiento

El fichero no incorpora entrenamiento propio: es una reexportacion de `google/gemma-4-E4B-it` (revision `ee0ef602`) realizada con `litert-torch` en el commit `0a81bf6` y la opcion `--use_rope_composite=True`, dirigida a LiteRT-LM v0.18.0. La arquitectura subyacente es la de Gemma 4 E4B: transformer denso con atencion multi-cabeza, embeddings rotatorios y soft cap final de logits (`final_logit_softcapping: 30.0`). La exportacion incluye tres grafos: `decode`, `prefill_128` y `prefill_1024`.

La diferencia tecnica clave respecto al fichero oficial es el tratamiento de RoPE: este artefacto contiene 66 composites `odml.rope` en `decode` y 47 en cada grafo de prefill, eliminando el cast de la posicion de INT32 a float y el calculo de SIN/COS dentro del grafo. Ademas, la cache KV queda fija en 8.192 tokens, el tokenizador es identico byte a byte al del repositorio origen y la plantilla de chat es la Canonical Chat Template de Gemma 4 (2026-07-09), con las llamadas `.get('...')` reescritas como `['...']`. El fichero es solo texto: no incluye encoder de vision ni de audio, ni drafter MTP. Una limitacion conocida: el grafo `decode` devuelve la salida de `lm_head` sin el soft cap de logits de Gemma 4 (issue litert-torch#1382, con PR de correccion #1388 sin fusionar a 2026-10-27), lo que no altera la decodificacion greedy pero si las probabilidades cuando se muestrea con top-k superior a 1.

## Capacidades

- Generacion de texto autorregresiva en modo instruct, con la plantilla de chat canonica de Gemma 4.
- Copia y recuperacion de informacion en contextos largos: el artefacto resuelve correctamente 118/118 casos de copia de numeros de 48 digitos con prompts de 237 a 7.993 tokens en Apple M4 Max GPU.
- Razonamiento y generacion de codigo heredados del modelo base Gemma 4 E4B instruct (no verificados de forma independiente en este fichero).
- Ejecucion en GPU via delegado WebGPU (Metal en macOS, Adreno en Android) y en CPU via XNNPACK.
- Ejecucion en movil: probado en Galaxy S26 (SM8850, Adreno 840, 11,7 GB de RAM) con la herramienta `litert_lm_advanced_main` de LiteRT-LM v0.18.1.
- Sin soporte de vision, audio ni tool calling especifico en este fichero (solo seccion de texto, sin encoder multimodal ni drafter MTP).

## Casos de uso

- Depuracion de RoPE en LiteRT-LM: sirve como fichero de referencia para verificar que una implementacion de RoPE composite devuelve los tokens esperados en decodificacion greedy con prompts largos, comparando contra el fichero oficial.
- Validacion de exportaciones `litert-torch`: permite comprobar que `export_hf` con `--use_rope_composite=True` produce grafos coherentes en `decode`, `prefill_128` y `prefill_1024` antes de publicar un artefacto definitivo.
- Pruebas de regresion en CI de LiteRT-LM: los 118 casos de copia con conteos de tokens conocidos (237 a 7.993) permiten montar un test automatizado que detecte roturas en el calculo de posiciones.
- Evaluacion de backend GPU en hardware Apple: con 1.930 tokens/s de prompt y 34,3 tokens/s de decodificacion (medianas sobre 118 casos en M4 Max, MTP desactivado), sirve para comparar el rendimiento del delegado WebGPU frente a CPU XNNPACK.
- Despliegue en Android de referencia: valida el camino GPU con Adreno 840 y 11,7 GB de RAM en un dispositivo de gama alta, util para decidir si un modelo de este tamano es viable en movil.
- Analisis de cuantizacion: al contrastar el fichero int8 con activaciones fp32 (8,2 GB) frente al oficial (3,66 GB), permite medir el impacto de la receta de cuantizacion en calidad y en huella de memoria.
- Estudio del efecto del soft cap de logits: util para reproducir el comportamiento descrito en litert-torch#1382 y evaluar como cambian las probabilidades al muestrear con top-k superior a 1.

## Benchmarks y rendimiento

Los datos publicados no son benchmarks estandar (MMLU, HumanEval, GSM8K), sino pruebas de copia y velocidad registradas por el runner del autor.

| Prueba | this file (GPU fp16) | this file (GPU FLOAT32) | this file (CPU XNNPACK) | stock `gemma-4-E4B-it.litertlm` (GPU fp16) |
|---|---|---|---|---|
| `short` (237-1.639 tok) | 15/15 | – | – | – |
| `baseline` (1.705-2.592 tok) | 42/42 | – | – | – |
| `long` (2.094-3.983 tok) | 25/25 | 25/25 | 25/25 | 0/25 |
| `cross4096` (3.983-4.449 tok) | 30/30 | – | – | – |
| `xl` t6000, t8000 (5.995-7.993 tok) | 6/6 | – | – | – |

Velocidad registrada en Apple M4 Max (medianas sobre 118 casos, MTP desactivado): 1.930 tokens/s de prompt y 34,3 tokens/s de decodificacion. En el fichero oficial, el primer digito incorrecto aparece entre las posiciones 2.097 y 4.001. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el fichero pesa 8,2 GB; en GPU requiere al menos ese espacio mas overhead de cache KV para 8.192 tokens y activaciones fp16.
- GPU probadas: Apple M4 Max (Metal 3, delegado WebGPU) y Adreno 840 en Galaxy S26 (11,7 GB de RAM). No hay datos de A100, H100 ni RTX 4090.
- CPU: ejecucion validada via XNNPACK con resultados identicos a GPU en la prueba `long` (25/25).
- Movil: viable en un dispositivo con 11,7 GB de RAM y GPU Adreno 840; el fichero oficial (3,66 GB) es mas adecuado si el espacio es limitado.
- Despliegue: exclusivamente LiteRT-LM (v0.18.0 en macOS, v0.18.1 en Android). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.litertlm` es propietario del runtime de Google AI Edge.
- Latencia/throughput: 1.930 tok/s de prompt y 34,3 tok/s de decodificacion en M4 Max (medianas, MTP off); sin datos publicados para Android.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este fichero (`gemma-4-E4B-it-litert-lm-rope-composite`) | no disponible (Gemma 4 E4B) | 8.192 tok | `.litertlm`, 8,2 GB | Apache 2.0 | RoPE composite, sin soft cap de logits, solo texto |
| `litert-community/gemma-4-E4B-it-litert-lm` (stock) | no disponible (Gemma 4 E4B) | no disponible en la informacion | `.litertlm`, 3,66 GB | Apache 2.0 | Version oficial; falla copia a partir de posicion 2.097 en GPU fp16 |
| `mlboydaisuke/gemma-4-E2B-it-litert-lm-rope-composite` | no disponible (Gemma 4 E2B) | 32.768 tok | `.litertlm` | Apache 2.0 | Variante E2B del mismo experimento, con y sin flag |
| `google/gemma-4-E4B-it` (modelo fuente) | no disponible | no disponible en la informacion | safetensors (HuggingFace) | Gemma 4 License (via `license_link`) | Modelo original en transformers; incluye cap de logits |

## Limitaciones y advertencias

- No es un modelo oficial ni un sustituto del fichero de `litert-community`: el propio autor lo describe como fichero de prueba para el issue LiteRT-LM #3913.
- El soft cap de logits de Gemma 4 (`30 * tanh(x / 30)`) no esta aplicado en el grafo `decode` (litert-torch#1382, PR #1388 sin fusionar). La decodificacion greedy no se ve afectada, pero el muestreo con top-k superior a 1 parte de logits sin cap y las probabilidades difieren de las del modelo original.
- Cache KV fija en 8.192 tokens: prompt y respuesta deben caber en ese limite; prompts mas largos no son procesables.
- Solo texto: sin encoder de vision ni audio, y sin drafter MTP, por lo que no acelera decodificacion especulativa.
- Compatibilidad limitada a LiteRT-LM v0.18.0 (macOS) y v0.18.1 (Android); no usable en otros runtimes.
- Tamano de 8,2 GB, mas del doble que el fichero oficial, lo que penaliza el despliegue en dispositivos con poca memoria.
- Idiomas soportados no documentados en la informacion disponible; se heredan del modelo base sin verificacion.
- Riesgo de sesgos y alucinaciones heredado de Gemma 4 E4B instruct, no evaluado de forma independiente en este artefacto.
- La licencia declarada es Apache 2.0, pero el `license_link` remite a la licencia de Gemma 4 de Google; conviene revisar las condiciones de uso comercial del modelo base antes de produccion.
- Solo 20 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlboydaisuke/gemma-4-E4B-it-litert-lm-rope-composite
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Fichero oficial LiteRT-LM: https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm
- Variante E2B del mismo experimento: https://huggingface.co/mlboydaisuke/gemma-4-E2B-it-litert-lm-rope-composite
- Issue LiteRT-LM #3913: https://github.com/google-ai-edge/LiteRT-LM/issues/3913
- Commit de litert-torch usado en la exportacion: https://github.com/google-ai-edge/litert-torch/commit/0a81bf6f3243a6f7c846d05d62afeff4008f2542
- Issue litert-torch #1382 (soft cap de logits): https://github.com/google-ai-edge/litert-torch/issues/1382
- PR litert-torch #1388 (correccion del soft cap): https://github.com/google-ai-edge/litert-torch/pull/1388
- Runner y casos de prueba: https://github.com/PowerBeef/agello-litert-lm
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
