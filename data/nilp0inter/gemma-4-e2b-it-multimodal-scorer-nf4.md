# nilp0inter/Gemma-4-E2B-it-Multimodal-Scorer-NF4

## Resumen

`nilp0inter/Gemma-4-E2B-it-Multimodal-Scorer-NF4` es una variante cuantizada a NF4 de un artefacto experimental de *option scoring* multimodal construido sobre el backbone nativo Gemma 4 de Google (clase `Gemma4Model`). No es un modelo de chat ni de generación: es una *baseline* de puntuación de opciones que evalúa entre 2 y 26 alternativas de respuesta y devuelve una probabilidad por opción. Reproduce la cabeza de decisión original de 255 filas de "code-letter" como un *readout* externo de forma [255, 1536], en lugar de empaquetar la cabeza conversacional original.

El modelo forma parte de un estudio controlado del autor sobre deriva de cuantización, comparando esta variante NF4 con su gemelo BF16 (`nilp0inter/Gemma-4-E2B-it-Multimodal-Scorer-BF16`). Incorpora las torres nativas completas de imagen, audio y vídeo, pero solo los pesos `nn.Linear` del `language_model` se cuantizan a NF4 con doble cuantización (cómputo en BF16); torres, proyecciones, embeddings, normalizaciones y buffers permanecen en BF16 nativo.

Es relevante ahora porque documenta de forma transparente la deriva de precisión entre NF4 y BF16 en tareas multimodales de elección forzada, con conjuntos de evaluación adaptados y métricas con intervalos de confianza por *bootstrap*. El repositorio es muy reciente (creado en octubre de 2026) y tiene una adopción mínima (17 descargas, 0 *likes*).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal nativo (Gemma 4 E2B, `Gemma4Model`); incluye torres de imagen, audio y video mas un `language_model` con hidden size 1536 |
| Parametros totales | 5.104.297.504 (~5,1 B, segun safetensors) |
| Parametros activos | No aplica / no disponible (la model card no documenta una arquitectura MoE) |
| Longitud de contexto | No especificada formalmente; limite de entrada de 8192 tokens (las entradas que lo superan fallan sin truncado) |
| Tipos de cuantizacion | NF4 con doble cuantizacion (bitsandbytes) solo en pesos `nn.Linear` del `language_model`, con computo en BF16; torres, proyecciones, embeddings, normas y *readout* externo en BF16 nativo |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 para los pesos; MIT para el codigo de runtime y prompt |
| Formato de pesos | safetensors (repo de 7,5 GB; archivos de modelo/readout serializados: 6,915 GiB) |

## Arquitectura y entrenamiento

El artefacto se construye sobre el backbone multimodal nativo de Google Gemma 4 E2B (`google/gemma-4-E2B-it`), no sobre un afinado de Jeff. La model card indica explicitamente que "la baseline original publicada no esta afinada con Jeff"; las referencias a `mstrasser/Jeff-Gemma4-E2B` y `firelex/jeff` corresponden al prompt de decision con licencia y a las fuentes de codigo, no a un reentrenamiento. La clase nativa del modelo es `Gemma4Model`, con un `language_model` de hidden size 1536 y un *readout* externo de forma [255, 1536] que sustituye las 255 filas originales de la cabeza LM (code-letter) en BF16, con softcap nativo elemento a elemento de 30 y temperatura 1.

La cuantizacion es de precision mixta: unicamente los pesos llanos `nn.Linear` del `language_model` usan NF4 con doble cuantizacion manteniendo el computo en BF16; el resto del grafo (torres de vision y audio, proyecciones, embeddings, normalizaciones, buffers de recorte y el *readout* externo) permanece en su precision nativa BF16. La model card subraya que este *no* es un checkpoint totalmente de 8 bits ni totalmente de 4 bits. El scoring se realiza con un unico *forward pass* sobre el ultimo token, usando el prompt de decision con licencia y un softmax restringido a las opciones facilitadas. No se documentan datos de entrenamiento, tokens vistos, composicion del dataset ni fases de RLHF/DPO, ya que no se ha reentrenado el modelo.

## Capacidades

- Puntuacion de opciones (*option scoring*) para entre 2 y 26 alternativas, devolviendo un `choice_index` (base cero) y una probabilidad por opcion.
- Entrada de texto: pares `question`/`options` sin medio asociado.
- Entrada de imagen mediante `images:[ruta,...]`.
- Entrada de audio mediante `audio:ruta` (mono, remuestreo automatico a 16 kHz, con limite nativo de 30 segundos).
- Entrada de video mediante `video:ruta` (ocho fotogramas RGB reales muestreados uniformemente, fps y marcas de tiempo originales, sin pista de audio).
- Las torres nativas completas de imagen, audio y video estan incluidas en el artefacto.
- No soporta generacion de texto, modo chat, *tool calling*, *function calling* ni razonamiento agente multi-paso: el "thinking", la generacion y el entrenamiento estan desactivados.
- No soporta entrada multimodal combinada: la model card indica no combinar modalidades salvo validacion propia.

## Casos de uso

- Evaluacion de MCQ (multiple choice) academicos: el modelo puntua directamente conjuntos de opciones cerradas, lo que permite calificar preguntas de tipo AI2D o MMMU sin necesidad de decodificacion generativa ni parsing de texto libre.
- Clasificacion de diagramas cientificos: con las torres de vision nativas, permite asignar un diagrama (por ejemplo, de un examen de ciencias) a una de varias categorias de respuesta predefinidas, con una probabilidad por opcion.
- Identificacion de transcripciones de voz: dado un segmento de audio y un conjunto fijo de transcripciones candidatas (con distractores controlados), el modelo selecciona la correcta; en el conjunto de prueba alcanzo un 100% en el subconjunto de LibriSpeech test-clean de cuatro vias.
- Clasificacion de acciones en video: con ocho fotogramas muestreados, permite etiquetar videos entre clases fijas; en UCF101 (diez clases fijas) obtuvo un 85,5% de acierto.
- Estudio de cuantizacion y deriva de precision: comparar esta variante NF4 con su gemelo BF16 permite medir el impacto de la cuantizacion de 4 bits en la puntuacion final, un caso de uso de investigacion reproducible con el conjunto de benchmarks publicado por el autor.
- Audicion y etiquetado controlado por taxonomia cerrada: util para tareas de anotacion donde el espacio de respuestas es fijo (por ejemplo, asignar un clip a una etiqueta predefinida), aunque el rendimiento en sonido ambiental es debil.
- Verificacion A/B de *prompts* y pipelines: al usar un protocolo de *scoring* fijo y reproducible, sirve para comparar variantes de *prompt* o de serializacion midiendo deriva estocastica con intervalos de confianza.

## Benchmarks y rendimiento

Resultados publicados en la model card, correspondientes a subconjuntos adaptados de eleccion forzada de un solo paso (no son puntuaciones oficiales de *leaderboard* generativo). Los intervalos son al 95% por *bootstrap* de preguntas.

| Benchmark | N | Precision | Intervalo 95% |
|---|---:|---:|---|
| AI2D | 1000 | 53,80% | [50,80%, 56,80%] |
| MMBench | 1000 | 63,80% | [60,80%, 66,80%] |
| MMMU | 847 | 35,66% | [32,58%, 38,85%] |
| esc10-audio | 200 | 11,00% | [7,00%, 15,50%] |
| librispeech-speech | 100 | 100,00% | [100,00%, 100,00%] |
| ucf101-10-video | 200 | 85,50% | [80,50%, 90,00%] |

Notas metodologicas aportadas por el autor: MMMU usa 847 preguntas de validacion elegibles; AI2D usa 1000 preguntas de test sembradas; MMBench usa 1000 preguntas de English-dev tras eliminar duplicados circulares exactos (no el protocolo circular oficial); ESC-10 usa 200 clips balanceados; LibriSpeech usa 100 enunciados de test-clean para identificacion de transcripcion de cuatro vias con tres distractores fijos (no WER de ASR); UCF101 usa 200 videos de split1 reservados de diez clases fijas (no las 101 clases). La clasificacion de sonido ambiental es debil. Los controles de eliminacion de medios en los primeros 100 casos de MMMU no muestran un beneficio visual claro del modelo original.

## Requisitos de hardware

- VRAM observada en el experimento: 7,296 GiB maximos de memoria CUDA asignada y 7,568 GiB maxima reservada para los archivos de modelo/readout serializados de 6,915 GiB.
- GPU recomendada segun el autor: se probo en una RTX 3090 con CUDA; no se declara compatibilidad con GPUs de 4 GiB, GPUs Maxwell ni otros dispositivos.
- No cabe en GPUs de consumo muy limitadas: el autor no establece compatibilidad con GPUs de 4 GiB; en la practica requiere del orden de 8 GiB de VRAM.
- No se proporciona una ruta de *offload* a CPU ni una ruta solo CPU.
- Despliegue previsto: ejecucion del script `classifier.py` con `transformers` dentro del repositorio descargado, instalando `requirements.txt`. No es compatible con vLLM, llama.cpp, Ollama, TGI ni pipelines genericos de Transformers, y no hay GGUF.
- Latencia y throughput: no disponibles mas alla de la indicacion de que el scoring usa un unico *forward pass* sobre el ultimo token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Gemma-4-E2B-it-Multimodal-Scorer-NF4 (este) | ~5,1 B | entrada <= 8192 tokens | AI2D 53,80%; MMBench 63,80%; MMMU 35,66%; esc10 11,00%; librispeech 100%; ucf101-10 85,50% | Apache-2.0 (pesos) / MIT (codigo) | HuggingFace, feature-extraction |
| Gemma-4-E2B-it-Multimodal-Scorer-BF16 (gemelo) | ~5,1 B | entrada <= 8192 tokens | Mismo protocolo de prompt y scoring; los benchmarks se reportan de forma emparejada | Apache-2.0 / MIT | HuggingFace |
| Gemma 4 E2B (base de Google, segun fuentes web) | ~2,1 B (dato de fuentes web, no confirmado para este artefacto) | 8K contexto segun fuentes web | Puntuaciones oficiales publicadas por Google, no disponibles aqui | No disponible en la informacion proporcionada | Google DeepMind / AI Edge |

Nota: la model card de este artefacto no incluye comparativas con modelos de terceros. Las cifras de la fila base de Google provienen de fuentes web genericas y entran en conflicto con los 5,1 B de parametros totales reportados por safetensors para este artefacto multimodal, por lo que deben tratarse con cautela.

## Limitaciones y advertencias

- No es un modelo de chat ni de generacion: es exclusivamente una *baseline* de puntuacion de opciones; usarlo como generador o pipeline generico de Transformers no es valido.
- No existe checkpoint GGUF ni soporte para vLLM, Ollama, TGI o llama.cpp.
- Las entradas de audio deben caber en el limite nativo de 30 segundos.
- Las entradas que superan 8192 tokens fallan sin truncado.
- No se deben combinar modalidades en la misma peticion salvo validacion propia.
- Rendimiento muy bajo en clasificacion de sonido ambiental (11,00% en esc10).
- Los controles de eliminacion de medios en MMMU no muestran un beneficio visual claro, por lo que no debe inferirse razonamiento visual irrestricto ni calidad de transcripcion de voz.
- Los resultados de benchmarks son subconjuntos adaptados de eleccion forzada de un solo paso y *no* puntuaciones oficiales de *leaderboard* generativo; el *prompting* generativo del modelo de chat oficial puede dar resultados distintos.
- El modelo es experimental y de adopcion minima (17 descargas, 0 *likes*), lo que limita la validacion externa.
- Riesgo de sesgos: no documentado en la informacion disponible; al derivar de Gemma 4, hereda los sesgos del backbone original, no evaluados aqui.
- Riesgo de alucinacion: no aplica de la misma forma que en un generador, pero al limitarse a puntuar opciones puede asignar alta probabilidad a opciones incorrectas cuando el espacio de respuestas no esta bien restringido.
- Restricciones de licencia: pesos bajo Apache-2.0 y codigo de runtime/prompt bajo MIT; las fuentes de multimedia y texto de los benchmarks no se reempaquetan, por lo que su uso queda sujeto a sus licencias originales.
- Medidas de memoria: los 7,296 GiB de pico asignado no garantizan compatibilidad con GPUs de 4 GiB ni con otros contextos o dispositivos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nilp0inter/Gemma-4-E2B-it-Multimodal-Scorer-NF4
- Modelo base BF16: https://huggingface.co/nilp0inter/Gemma-4-E2B-it-Multimodal-Scorer-BF16
- Dataset de benchmarks, deriva de cuantizacion, calibracion, latencia, memoria y predicciones: https://huggingface.co/datasets/nilp0inter/Jeff-Gemma4-E2B-Multimodal-Benchmarks
- Pin fuente de Google: https://huggingface.co/google/gemma-4-E2B-it (revision 3e22461f65e89153144f8adb70e3b8c2cc9845a7)
- Pin fuente de prompt con licencia: https://huggingface.co/mstrasser/Jeff-Gemma4-E2B (revision e3de3e99a979f92afd995d4e526c7e3170ae49cf)
- Pin fuente de codigo de prompt: https://huggingface.co/firelex/jeff (revision d0173b4ee317a46dee031421b713f3fc5f868cfe)
- Google DeepMind, Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- Gemma 4 E2B (fuente web de terceros): https://gemma4.dev/models/gemma-4-e2b
- Google AI Edge, LiteRT-LM Gemma 4: https://developers.google.com/edge/litert-lm/models/gemma-4
- Benchmarks y guia Ollama (fuente web de terceros): https://markaicode.com/benchmarks/ollama-gemma-4-a100-80gb-latency-benchmark/
