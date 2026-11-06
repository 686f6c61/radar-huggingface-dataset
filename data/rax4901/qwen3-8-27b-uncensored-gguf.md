# rax4901/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una cuantización GGUF, publicada por el usuario rax4901, del modelo Qwen3.8-27B de Qwen a la que se le ha reducido sustancialmente el comportamiento de rechazo (refusals) mediante abliteration. El autor emplea la herramienta Heretic para eliminar las direcciones de rechazo minimizando simultáneamente la divergencia KL respecto al modelo base, sin fine-tuning ni datos adicionales. El resultado se publica en múltiples cuantizaciones (desde IQ2_M hasta Q8_0) con la cabeza de multi token prediction (MTP) conservada, lo que permite decodificación especulativa integrada en llama.cpp.

El modelo base es Qwen3.8-27B, un transformer denso de 27.320.697.856 parámetros con 64 capas, vocabulario de 248.320 tokens y ventana de contexto de 262.144 tokens, con soporte de entrada de imágenes. Esta variante es relevante para usuarios que necesitan ejecutar localmente un modelo de tamaño medio sin las restricciones de alineación del original, manteniendo intactas las capacidades del modelo base: según la model card, la abliteration solo modifica las proyecciones `attn.o_proj` y `mlp.down_proj`, y las capacidades, datos de entrenamiento y arquitectura permanecen inalterados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer denso) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (ademas de f16 como baseline, no publicado) |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido con llama.cpp commit `a94d563ed`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de 64 capas con vocabulario de 248.320 tokens y una cabeza MTP de 1 capa adicional. El modelo base incluye soporte de vision, conservado en esta variante mediante un proyector `mmproj` en F16. Sobre los datos de entrenamiento del modelo base, la model card no aporta detalles; no disponible en la informacion proporcionada.

El proceso de "uncensoring" merece detalle tecnico: se ejecuta Heretic en bf16 (no sobre cuantizaciones de 4 bits), co-minimizando el numero de rechazos contra la divergencia KL respecto al modelo base, y la LoRA resultante se fusiona en los pesos bf16 base. Los tensores `mtp.*` se copian verbatim del checkpoint original tras la fusion, de modo que la abliteration nunca los modifica. La matriz de importancia (imatrix) para las cuantizaciones se calcula directamente desde f16 usando wikitext-2 raw con 200 chunks, y esta publicada en el repositorio. Un caveat importante: la cabeza draft fue entrenada contra el modelo sin modificar, por lo que la tasa de aceptacion de la decodificacion especulativa puede caer ligeramente; la verificacion de cada token garantiza que la calidad del output no se vea afectada.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, etiqueta conversational).
- Entrada de imagenes: el modelo base incluye vision y se publica el proyector `mmproj-Qwen3.8-27B-Uncensored-F16.gguf` para runtimes compatibles.
- Decodificacion especulativa mediante MTP: los archivos "fused" incluyen la cabeza MTP inline como draft integrado; tambien hay archivos `noMTP` y drafts independientes (Q8_0 y Q4_0) para runtimes que usan `--model-draft`.
- Contexto largo de 262.144 tokens para documentos extensos y conversaciones multi-turno.
- Comportamiento de rechazo sustancialmente reducido (no eliminado; ver Limitaciones).
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades de codigo, matematicas y razonamiento: no hay datos especificos publicados en la model card; se heredarian del modelo base Qwen3.8-27B.

## Casos de uso

- Chatbots locales sin restricciones de alineacion: para asistentes conversacionales autoalojados donde el operador controla las politicas de contenido en la capa de aplicacion, esta variante elimina la capa de refusal del modelo base.
- Procesamiento de documentos largos: con 262.144 tokens de contexto, permite resumir o analizar libros tecnicos, contratos o repositorios completos en una sola pasada.
- Analisis multimodal local: combinando los GGUF principales con el archivo `mmproj` en F16, se puede realizar descripcion de imagenes o preguntas visuales sin enviar datos a servicios externos.
- Inferencia rapida en hardware de consumo: la decodificacion especulativa via MTP acelera la generacion en llama.cpp, util en estaciones de trabajo con una sola GPU de gama alta.
- Investigacion en abliteration y alineacion: el repositorio documenta el metodo completo (Heretic, imatrix, verificacion de MTP) y publica la imatrix, lo que lo hace util como referencia para estudios de desalineacion y cuantizacion.
- Escritura creativa y ficcion: la reduccion de refusals y el contexto largo lo adecuan para generacion de narrativa extensa donde los rechazos del modelo original interrumpen el flujo.
- Integracion en ComfyUI: la model card incluye instrucciones de uso especificas para ComfyUI, util en pipelines generativos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica publicada es la perplejidad en wikitext-2, medida sobre esta build:

| File | PPL (wikitext-2) | vs f16 |
|---|---|---|
| f16 (baseline, no publicado) | 7.1557 +/- 0.25104 | — |
| Q5_K_M | 7.1573 +/- 0.25055 | +0.0016 |
| IQ4_XS | 7.1583 +/- 0.25019 | +0.0026 |
| Q6_K | 7.1689 +/- 0.25149 | +0.0132 |
| Q8_0 | 7.1764 +/- 0.25195 | +0.0207 |
| Q4_K_M | 7.1814 +/- 0.25227 | +0.0257 |
| IQ2_M | 7.8581 +/- 0.27481 | +0.7024 |

El propio autor advierte que, salvo IQ2_M, todas las cuantizaciones caen dentro de un rango de 0,026 frente a un error estandar de aproximadamente 0,25, por lo que sus diferencias relativas no son estadisticamente separables del f16 ni entre si. IQ2_M si muestra una degradacion real de +0,70 puntos.

Sobre decodificacion especulativa, la model card anuncia mediciones (seccion "Speculative decoding, measured on this model", con tabla para IQ2_M), pero los datos concretos de aceleracion no estan incluidos en la informacion proporcionada: no disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache):
  - IQ2_M: 10,6 GB (fused) / 10,2 GB (noMTP)
  - IQ4_XS: 15,3 GB / 15,1 GB
  - Q4_K_M: 16,8 GB / 16,5 GB
  - Q5_K_M: 19,5 GB / 19,2 GB
  - Q6_K: 22,4 GB / 22,1 GB
  - Q8_0: 29,0 GB / 28,6 GB
  - Draft Q8_0: 3,2 GB; draft Q4_0: 1,7 GB; mmproj F16: 0,9 GB
- Consumer GPU: Q4_K_M cabe en una RTX 4090 (24 GB) con margen limitado para KV cache; IQ4_XS e IQ2_M caben con holgura y permiten contexto largo. Q8_0 requiere GPU de 32 GB o superior (A100 40 GB, RTX 5090, A6000) o descarga parcial a CPU.
- GPU recomendadas: RTX 4090/5090 para cuantizaciones de 4 bits con decodificacion especulativa; A100/H100 para Q8_0 o contextos cercanos a 262K tokens.
- Despliegue: llama.cpp (runtime de referencia, convertido con commit `a94d563ed`), llama-server con `--model-draft` para MTP explicito, ComfyUI (instrucciones incluidas en la model card). No se menciona soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponible en la informacion proporcionada (las tablas de aceleracion por decodificacion especulativa no estan incluidas en los datos recibidos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Particularidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-GGUF | 27,3 B | 262.144 | IQ2_M a Q8_0, con MTP | Apache 2.0 | Abliteration con Heretic, MTP conservado, vision |
| Qwen/Qwen3.8-27B (base) | 27,3 B | 262.144 | Oficial de Qwen | Apache 2.0 | Comportamiento de refusal estandar |
| Otras variantes uncensored de ~27 B (p. ej. abliterations de Qwen3-32B) | 27-32 B | 32.768-131.072 tipicamente | Variable | Apache 2.0 | Metodo de abliteration clasico, sin MTP documentado |

Nota: los datos de las alternativas son aproximados y dependen de las publicaciones concretas de cada autor; no hay una comparativa oficial publicada.

## Limitaciones y advertencias

- El rechazo esta "sustancialmente reducido, no eliminado", segun el propio autor. El modelo puede seguir negandose a peticiones sensibles; no debe asumirse ausencia total de refusals.
- La cabeza draft de MTP fue entrenada contra el modelo sin modificar, por lo que la tasa de aceptacion de la decodificacion especulativa puede disminuir ligeramente. La calidad del output no se ve afectada porque cada token se verifica contra el modelo objetivo.
- La cuantizacion IQ2_M presenta una degradacion real de perplejidad (+0,70 frente a f16); evitarla si la calidad es prioritaria.
- La tasa de aceptacion del draft Q4_0 no ha sido medida por el autor.
- Riesgo de alucinacion: inherente a cualquier LLM; la abliteration no lo mitiga y la eliminacion de direcciones de refusal puede en teoria alterar sutilmente otros comportamientos, aunque el metodo minimiza la divergencia KL.
- Contenido sin filtro: el operador es responsable del uso; desplegar este modelo en productos de cara al usuario sin salvaguardas propias (moderacion en capa de aplicacion) conlleva riesgos legales y eticos.
- Sesgos conocidos: no disponible; se heredan los del modelo base Qwen3.8-27B, no documentados en la model card.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales de esta variante, aunque conviene verificar los terminos del modelo base Qwen.
- Idiomas: la model card solo declara ingles y chino; el rendimiento en castellano no esta documentado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rax4901/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de abliteration empleada): https://github.com/p-e-w/heretic
