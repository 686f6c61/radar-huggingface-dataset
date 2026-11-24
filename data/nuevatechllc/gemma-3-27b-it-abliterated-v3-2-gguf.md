# NuevaTechLLC/gemma-3-27b-it-abliterated-v3.2-GGUF

## Resumen

gemma-3-27b-it-abliterated-v3.2 es una variante del modelo Gemma 3 27B instruct de Google a la que se le han eliminado los mecanismos de rechazo (refusals) mediante una edicion de direccion de rechazo de rango 1, buscada de forma que minimice el dano respecto al modelo original. Lo desarrolla NuevaTech LLC como parte de un estudio titulado "Removing refusals with less damage: what worked, what did not, and why" (2026), y se distribuye unicamente en formato GGUF para llama.cpp y Ollama.

El modelo parte de `unsloth/gemma-3-27b-it` y aplica una edicion de banda de rango 1 centrada en la capa 36 de 63, con unas 22 capas de ancho y sin restauracion de normas. El objetivo declarado es reducir la tasa de rechazo manteniendo al minimo la divergencia KL respecto al modelo base en peticiones inofensivas. Con 27.009.346.304 parametros, la version publicada no incluye proyector de vision: es un modelo exclusivamente de texto pese a que el Gemma 3 original es multimodal.

Su relevancia es doble: por un lado, sirve como herramienta de red teaming e investigacion en seguridad; por otro, el estudio asociado publica una comparativa metodologica frente a Heretic 1.4.0 con metricas de rechazo, sobre-rechazo y divergencia KL, lo que lo convierte en un caso documentado de ablacion de refusals con evaluacion cuantitativa. La licencia es la Gemma Terms of Use heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 27B, sin proyector de vision en esta version) |
| Parametros totales | 27.009.346.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (valor sugerido en el Modelfile de Ollama; el modelo base soporta mas, pero no se documenta en esta ficha) |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (unicos ficheros publicados) |
| Idiomas soportados | en (declarado; el base soporta mas idiomas pero no se evalua aqui) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 27B instruct, un transformer decoder-only. Sobre ese modelo no se reentrena ni se hace fine-tuning: se aplica una edicion de pesos consistente en una direccion de rechazo de rango 1, aplicada como edicion de banda centrada en la capa 36 de 63 y con un ancho aproximado de 22 capas, sin restauracion de normas posterior. La direccion y la intensidad se seleccionan mediante una busqueda que minimiza la divergencia KL respecto al modelo original sobre peticiones inofensivas, sujeto a alcanzar un objetivo de tasa de rechazo medido por un clasificador de seguridad (Qwen3Guard-Gen-8B).

No hay datos publicados sobre volumen o composicion del dataset de entrenamiento porque no hay entrenamiento: la intervencion es puramente de edicion de pesos. La innovacion tecnica destacable es metodologica: la busqueda conjunta de direccion y magnitud con una restriccion explicita de dano (KL) y una metrica de rechazo juzgada por clasificador, en lugar de una ablacion de direccion fija. Las metricas se midieron sobre el modelo en bf16 y los GGUF publicados son cuantizaciones de ese modelo.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del Gemma 3 27B instruct.
- Respuesta a peticiones que el modelo base rechaza: la tasa de rechazo baja de 0,933 a 0,103 en el conjunto StrongREJECT de 282 prompts retenidos.
- Razonamiento y conocimiento general preservados en gran medida: MMLU 0,783, ARC 0,593 y GSM8K 0,905, practicamente identicos al base.
- Plantilla de chat del modelo base embebida en los GGUF, lista para `llama-server` y Ollama.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Sin capacidades de vision en esta publicacion: los GGUF no incluyen proyector.
- Soporte de tool calling y comportamiento multilingue: no evaluado en el estudio; no disponible como dato medido.

## Casos de uso

- Red teaming de sistemas de IA: usar el modelo como generador de respuestas que un modelo alineado rechazaria, para probar clasificadores de seguridad, filtros de salida y pipelines de moderacion en un entorno controlado.
- Investigacion en interpretabilidad y alineacion: comparar activaciones y respuestas frente al Gemma 3 27B base para estudiar donde reside la direccion de rechazo y como se distribuye por capas.
- Docencia sobre seguridad de modelos: demostrar en clase el efecto de una ablacion de direccion de rechazo con metricas de rechazo, sobre-rechazo y KL, usando el estudio como material de referencia.
- Evaluacion de clasificadores de seguridad: generar un corpus de respuestas no rechazadas para medir la sensibilidad y los falsos negativos de jueces automaticos como Qwen3Guard-Gen-8B.
- Pruebas de robustez de guardrails en produccion: alimentar el modelo con prompts de StrongREJECT y OR-Bench para validar que las capas de proteccion externas (no el modelo) bloquean el contenido no deseado.
- Despliegue local en hardware propio para experimentacion: los GGUF Q4_K_M y Q8_0 permiten ejecutar el modelo con llama.cpp u Ollama sin dependencia de APIs externas.
- Estudio de sobre-rechazo: el modelo reduce el sobre-rechazo a 0,007 en OR-Bench (frente a 0,137 del base), lo que lo hace util para analizar el equilibrio entre seguridad y utilidad.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (medidos sobre el modelo en bf16; los GGUF son cuantizaciones). Una semilla por fila.

| Modelo | Rechazo (juzgado, 282 prompts StrongREJECT) | Respondio a lo inseguro | Sobre-rechazo (300 OR-Bench) | KL respecto al base (300 prompts) | MMLU | ARC | GSM8K |
|---|---|---|---|---|---|---|---|
| base (gemma-3-27b-it) | 0,933 | 0,025 | 0,137 | 0,0000 | 0,783 | 0,590 | 0,915 |
| **este modelo (v3.2)** | 0,103 | 0,819 | 0,007 | 0,0488 | 0,783 | 0,593 | 0,905 |
| Heretic 1.4.0 (defaults) | 0,397 | 0,528 | 0,010 | 0,0124 | 0,784 | 0,595 | 0,912 |

Lectura: el rechazo es la proporcion de los 282 prompts retenidos de StrongREJECT que el juez Qwen3Guard-Gen-8B marca como rechazados (no un conteo de frases). La KL es la divergencia media por token respecto al modelo original sobre sus propias respuestas a 300 prompts inofensivos; menor es mas cercano al original. El autor senala que Heretic modifica menos el modelo en todas las variantes probadas, pero esta edicion elimina mas rechazos.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M en torno a 17-19 GB; Q8_0 en torno a 29-31 GB (estimacion a partir de 27.000 millones de parametros; el autor no publica cifras exactas).
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 con contexto largo; RTX 4090 (24 GB) o RTX 3090 para Q4_K_M.
- Cabe en GPU de consumo: si, con Q4_K_M en GPUs de 24 GB; Q8_0 requiere 32 GB o mas o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (Modelfile incluido en la model card), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo (StrongREJECT) | KL vs base | Licencia | Formato |
|---|---|---|---|---|---|---|
| gemma-3-27b-it-abliterated-v3.2 | 27,0 B | 32.768 (sugerido) | 0,103 | 0,0488 | gemma | GGUF |
| Heretic 1.4.0 (defaults) sobre el mismo base | 27,0 B | no disponible | 0,397 | 0,0124 | gemma | no disponible |
| gemma-3-27b-it (base) | 27,0 B | no disponible en esta ficha | 0,933 | 0,0000 | gemma | safetensors / GGUF |
| gemma-3-27b-it-abliterated-v2 | 27,0 B | no disponible | no disponible | no disponible | gemma | GGUF |

## Limitaciones y advertencias

- El modelo responde a peticiones que el original rechaza; no sabe mas que el modelo base ni mejora su conocimiento.
- Riesgo elevado de generar contenido danino si se despliega sin capas de moderacion externas; el autor lo restringe a red teaming, investigacion de seguridad y docencia en hardware propio.
- El rechazo y el sobre-rechazo se miden solo en ingles; la calidad en respuestas largas, el uso de herramientas y el comportamiento multilingue no se evaluaron.
- El juez automatico (Qwen3Guard-Gen-8B) se trata como verdad de referencia, sin verificacion con etiquetado humano.
- Una sola semilla por fila en los resultados; no hay intervalos de confianza publicados.
- Sin vision: los GGUF no incluyen proyector, a diferencia del Gemma 3 27B original.
- Licencia Gemma Terms of Use: el uso comercial esta sujeto a sus restricciones y obligaciones; revisar antes de cualquier despliegue productivo.
- Sesgos: no documentados especificamente para esta variante; hereda los del modelo base.
- Alucinacion: no medida; se asume similar al base, aunque la eliminacion de rechazos puede aumentar la confianza en respuestas incorrectas sobre temas sensibles.

## Enlaces

- Hugging Face: https://huggingface.co/NuevaTechLLC/gemma-3-27b-it-abliterated-v3.2-GGUF
- Version anterior (v2): https://huggingface.co/NuevaTechLLC/gemma-3-27b-it-abliterated-v2-GGUF
- Modelo base: https://huggingface.co/unsloth/gemma-3-27b-it
- Paper del estudio: https://github.com/Limitlessmatrix/abliteration-study/blob/main/paper/PAPER.md
- Codigo (busqueda, edicion, evaluacion, export de adaptadores): https://github.com/Limitlessmatrix/abliteration-study
- Datos del estudio (results.json): https://github.com/Limitlessmatrix/abliteration-study/blob/main/paper/data/results.json
