# nilp0inter/Jeff-Gemma4-E2B-Multimodal-NF4

## Resumen

Jeff-Gemma4-E2B-Multimodal-NF4 es una reconstruccion experimental publicada por el usuario nilp0inter a partir de nilp0inter/Jeff-Gemma4-E2B-Multimodal-BF16, que a su vez ensambla las torres nativas de vision y audio de Google (google/gemma-4-E2B-it), las proyecciones de modalidad y un backbone de texto Jeff sin modificar. Sobre ese ensamblaje BF16, esta version aplica cuantizacion NF4 con doble cuantizacion (bitsandbytes) exclusivamente a los pesos nn.Linear del modelo de lenguaje, manteniendo en BF16 las torres de vision/audio, las proyecciones, embeddings, normalizaciones y la cabecera de lectura externa.

No es un modelo de chat ni de generacion: es un artefacto de puntuacion de opciones (option-scoring) que, dada una pregunta y un conjunto de 2 a 26 opciones, devuelve una probabilidad por opcion mediante un unico forward pass del ultimo token y una softmax restringida. Reutiliza el prompt de decision Jeff y una cabecera de lectura aprendida de 255 filas (forma [255, 1536]) con temperatura fija de 1.019191255914553. Thinking, generacion, entrenamiento y calibracion especifica de benchmarks estan desactivados.

El modelo ocupa 7,5 GB en el repositorio, con 5.104.297.504 parametros reales segun los safetensors, y esta pensado para reproduccion e investigacion controlada de evaluaciones forzadas (imagen, audio, video y texto). Se distribuye bajo Apache-2.0 para los pesos, con el codigo de runtime y prompt bajo MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4, clase nativa Gemma4Model): torres nativas de vision, audio y video, proyecciones de modalidad, backbone de texto y cabecera de lectura externa |
| Parametros totales | 5.104.297.504 (~5,1 B) segun safetensors; la nomenclatura "E2B" del modelo base sugiere un computo efectivo de ~2 B |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | 8192 tokens como limite efectivo de este artefacto (las entradas que lo superan fallan sin truncado); la familia Gemma 4 declara hasta 256K tokens y el modelo E2B figura con 8K en fuentes de terceros |
| Tipos de cuantizacion | NF4 con doble cuantizacion (4-bit, bitsandbytes) solo en los pesos nn.Linear del modelo de lenguaje, con computo en BF16; torres, proyecciones, embeddings, normas y readout permanecen en BF16 |
| Idiomas soportados | no disponible (Gemma 4 declara mas de 140 idiomas, pero no se especifica para este artefacto) |
| Licencia | Pesos: Apache-2.0; codigo de runtime y prompt: MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 7,5 GB |
| Hidden size (lenguaje) | 1536 |
| Cabecera de lectura | 255 filas, forma [255, 1536], BF16, temperatura 1.019191255914553 |
| Rango de opciones | 2 a 26 opciones |

## Arquitectura y entrenamiento

La arquitectura combina el backbone de texto del ensamblaje Jeff-Gemma4-E2B con las torres nativas multimodales de Google (vision, audio y video) y sus proyecciones de modalidad. El modelo base BF16 se construyo como un ensamblaje sin reentrenamiento ni calibracion nueva: se conservaron las torres originales, las proyecciones, el backbone de texto Jeff y la cabecera de lectura BF16 ya entrenada. Esta version NF4 no reentrena ni recalibra; unicamente cuantiza los pesos lineales del modelo de lenguaje, sustituyendolos por aproximaciones NF4 que no son identicas byte a byte a los pesos originales del decodificador.

El mecanismo de inferencia no es generativo. Se introduce el prompt de decision Jeff, se ejecuta un unico forward pass y se lee la distribucion del ultimo token, restringida a las primeras N filas de la cabecera de lectura segun el numero de opciones aportadas (de 2 a 26). La softmax resultante produce una probabilidad por opcion, con indice de eleccion base cero. No hay muestreo autoregresivo, ni softcap de logits tipico del LM estandar, ni fases de RLHF/DPO asociadas a este artefacto. Los pins de origen citados son google/gemma-4-E2B-it, mstrasser/Jeff-Gemma4-E2B y firelex/jeff; segun la model card, el baseline original publicado no esta ajustado con Jeff.

## Capacidades

- Puntuacion de opciones multiples: dada una pregunta y entre 2 y 26 opciones, devuelve una probabilidad por opcion mediante softmax restringida.
- Entrada de texto puro: se pasa question y options sin media.
- Entrada de imagen: campo images:[ruta,...] procesado por la torre de vision nativa.
- Entrada de audio: campo audio:ruta, con remuestreo automatico a mono 16 kHz y limite nativo de 30 segundos.
- Entrada de video: campo video:ruta, con ocho fotogramas RGB muestreados de forma uniforme a fps y timestamps originales y sin pista de audio.
- Extraccion de caracteristicas: la etiqueta del pipeline es feature-extraction, con la cabecera de lectura exportada como puntuador externo.
- No soporta: generacion de texto, modo thinking, chat conversacional, entrenamiento ni pipelines genericos de Transformers.
- No soporta combinacion de modalidades en una misma peticion salvo validacion explicita por parte del usuario.
- Tool calling, function calling y agentes: no soportados (no es un modelo generativo).

## Casos de uso

- Evaluacion academica de opcion multiple en imagen: se puntuan preguntas de los subconjuntos AI2D o MMMU pasando la imagen y el conjunto de opciones; el modelo devuelve la probabilidad de cada respuesta candidata, adecuado para arneses de evaluacion controlada.
- Identificacion de transcripciones de voz: dado un clip de audio y cuatro transcripciones candidatas (una correcta y tres distractores fijos), el modelo puntua cada opcion, replicando el protocolo de LibriSpeech test-clean descrito en la model card.
- Reconocimiento de acciones en video: sobre ocho fotogramas muestreados uniformemente, se puntuan diez clases fijas de UCF101 (protocolo de 200 videos de split1), util para validar la torre de video en tareas de clasificacion cerrada.
- Clasificacion de eventos sonoros: con clips balanceados de ESC-10, el modelo asigna probabilidades a las clases candidatas; la model card advierte de rendimiento debil en esta tarea (19,00%).
- Puntuacion de respuestas en benchmarks personalizados: integrado en un arnes propio mediante classifier.py, permite reproducir subconjuntos de opcion forzada y comparar variantes de cuantizacion frente al modelo BF16 de referencia.
- Clasificacion de contenido con taxonomia cerrada: cualquier tarea de etiquetado con un conjunto fijo de categorias (por ejemplo, moderacion o triaje de tickets) puede formularse como opciones y resolverse con un solo forward pass, siempre que las opciones esten predefinidas.
- Reproduccion de investigacion sobre cuantizacion: comparar la deriva de cuantizacion NF4 frente al ensamblaje BF16 usando las mismas peticiones y protocolo de puntuacion.

## Benchmarks y rendimiento

Los siguientes resultados provienen de la model card y son subconjuntos de opcion forzada de un solo pase, no puntuaciones oficiales de leaderboards generativos.

| Benchmark | N | Precision | Intervalo bootstrap 95% |
|---|---:|---:|---:|
| AI2D | 1000 | 65,10% | [61,90%, 68,10%] |
| MMBench | 1000 | 71,40% | [68,50%, 74,20%] |
| MMMU | 847 | 41,91% | [38,72%, 45,34%] |
| esc10-audio | 200 | 19,00% | [13,50%, 24,50%] |
| librispeech-speech | 100 | 100,00% | [100,00%, 100,00%] |
| ucf101-10-video | 200 | 89,50% | [85,00%, 94,00%] |

Notas de la model card: MMMU usa 847 preguntas de validacion elegibles; AI2D usa 1000 preguntas de test con semilla; MMBench usa 1000 preguntas de English-dev tras eliminar duplicados circulares exactos (no el protocolo circular oficial); ESC-10 usa 200 clips balanceados; LibriSpeech usa 100 enunciados de test-clean para identificacion de transcripcion en cuatro vias con tres distractores fijos (no WER de ASR); UCF101 usa 200 videos de split1 de diez clases fijas (no las 101 clases). Ambas variantes usan el mismo prompt Jeff y protocolo de puntuacion. Los controles de eliminacion de media muestran senales fuertes en voz y video, pero los primeros 100 controles de MMMU no muestran una ventaja visual clara del modelo original.

## Requisitos de hardware

- VRAM observada: 7,296 GiB de memoria CUDA asignada en pico y 7,568 GiB reservada en pico; tamano serializado de modelo y readout de 6,915 GiB.
- GPU probada: RTX 3090 con CUDA (Python 3.12.14 y versiones exactas de requirements.txt).
- Consumer GPU: cabe en GPUs de gama alta con 8 GB o mas, aunque la model card advierte explicitamente que las mediciones no establecen compatibilidad con GPUs de 4 GiB ni con arquitecturas Maxwell.
- GPU profesionales: A100, H100 y similares son adecuadas por margen de VRAM; la latencia y el throughput concretos no estan documentados.
- CPU: no se declara ninguna ruta de inferencia solo-CPU ni offload a CPU.
- Despliegue: exclusivamente mediante el script classifier.py incluido en el repositorio (transformers + bitsandbytes). No es compatible con vLLM, llama.cpp, Ollama ni TGI, y no existe formato GGUF.
- Latencia y throughput: no disponibles.
- Limitaciones de entrada: audio limitado a 30 segundos nativos; entradas de mas de 8192 tokens fallan sin truncado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nilp0inter/Jeff-Gemma4-E2B-Multimodal-NF4 | 5,1 B (cuantizado NF4 en el LM) | 8192 tokens (efectivo) | Puntuacion de opciones multimodal | Apache-2.0 (pesos) / MIT (codigo) | HuggingFace, 13 descargas |
| nilp0inter/Jeff-Gemma4-E2B-Multimodal-BF16 | no disponible (referencia BF16 de origen) | no disponible | Puntuacion de opciones multimodal | Apache-2.0 (pesos) / MIT (codigo) | HuggingFace (modelo base) |
| nilp0inter/Gemma-4-E2B-it-Multimodal-Scorer-NF4 | no disponible | no disponible | Puntuacion de opciones multimodal (baseline Google, sin ajuste Jeff) | no disponible | HuggingFace |
| google/gemma-4-E2B-it | no disponible (E2B, ~2 B efectivos segun fuentes) | hasta 256K en la familia; 8K en E2B segun terceros | Chat/generacion multimodal (texto, imagen, audio en E2B/E4B/12B) | no disponible | HuggingFace / Google |

Las cifras de parametros, contexto y rendimiento de los modelos comparables no estan disponibles en la informacion proporcionada; la comparacion se limita a la relacion de derivacion entre el artefacto NF4, su base BF16 y el modelo original de Google.

## Limitaciones y advertencias

- No es un modelo de generacion ni de chat: no debe usarse con pipelines genericos de Transformers ni esperar salidas de texto libre.
- Solo puntua entre 2 y 26 opciones; fuera de ese rango el artefacto no esta disenado para funcionar.
- La cuantizacion NF4 introduce aproximaciones en los pesos lineales del modelo de lenguaje, por lo que los resultados pueden diferir respecto al ensamblaje BF16 de origen.
- Riesgo de alucinacion y de calibracion no evaluado: los benchmarks son subconjuntos de opcion forzada y no equivalen a puntuaciones oficiales de leaderboards generativos.
- Rendimiento debil en clasificacion de sonido ambiental (19,00% en ESC-10).
- Los controles de MMMU no muestran una ventaja visual clara del modelo original, por lo que no debe inferirse razonamiento visual sin restricciones a partir de las puntuaciones.
- No se deben combinar modalidades en una misma peticion sin validacion previa.
- Las entradas que superan 8192 tokens fallan sin truncado; el audio esta limitado a 30 segundos.
- No hay ruta de inferencia solo-CPU ni offload a CPU declarada.
- No se han publicado datos sobre sesgos, idiomas concretos soportados en este artefacto ni evaluaciones de seguridad.
- Modelo experimental: la model card lo describe como una reconstruccion no oficial, no una publicacion de mstrasser; el baseline original no esta ajustado con Jeff.
- Licencia: pesos Apache-2.0 y codigo runtime/prompt MIT; los avisos de copyright del prompt original se conservan y la media y textos de los benchmarks de origen no se redistribuyen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nilp0inter/Jeff-Gemma4-E2B-Multimodal-NF4
- Modelo base BF16: https://huggingface.co/nilp0inter/Jeff-Gemma4-E2B-Multimodal-BF16
- Dataset de benchmarks y reproduccion: https://huggingface.co/datasets/nilp0inter/Jeff-Gemma4-E2B-Multimodal-Benchmarks
- Baseline de puntuacion (Google nativo, sin Jeff): https://huggingface.co/nilp0inter/Gemma-4-E2B-it-Multimodal-Scorer-NF4
- Gemma 4, Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Gemma 4 model card, Google AI for Developers: https://ai.google.dev/gemma/docs/core/model_card_4
- Gemma 4 Technical Report (arXiv): https://arxiv.org/html/2607.02770v1
- Gemma 4 E2B, gemma4.dev: https://gemma4.dev/models/gemma-4-e2b
