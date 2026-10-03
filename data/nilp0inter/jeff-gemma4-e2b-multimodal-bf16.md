# nilp0inter/Jeff-Gemma4-E2B-Multimodal-BF16

## Resumen

Jeff-Gemma4-E2B-Multimodal-BF16 es un artefacto experimental de "option scoring" construido por el usuario nilp0inter a partir de la fusión de google/gemma-4-E2B-it y mstrasser/Jeff-Gemma4-E2B. No es un modelo de chat ni de generación: recibe una pregunta con un conjunto de entre 2 y 26 opciones (y, opcionalmente, una imagen, un audio o un vídeo) y devuelve una probabilidad por opción, eligiendo una sola respuesta. La construcción ensambla en BF16 las torres nativas de visión y audio de Google, las proyecciones de modalidad y el tronco de texto de Jeff sin cambios, junto con el readout aprendido de 255 filas y la temperatura originales.

El modelo pesa 5.104.297.504 parámetros (aproximadamente 5,1 mil millones) en un repositorio de 10,2 GB, con 9,508 GiB de ficheros serializados entre modelo y readout. Su tamaño de ocultación de lenguaje es de 1536 y el readout externo tiene forma [255, 1536]. La ventana de entrada está limitada a 8192 tokens sin truncado (las entradas que la superan fallan) y el audio nativo está limitado a 30 segundos.

Es relevante ahora como pieza de investigación reproducible: el autor publica un conjunto de seis variantes con controles de deriva por cuantización, latencia y memoria, además de un protocolo de evaluación de opción forzada de un solo paso. Se trata de una reconstrucción experimental y no de una release oficial de mstrasser, y las puntuaciones publicadas no son resultados de leaderboard generativo oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (clase nativa Gemma4Model) con tronco de texto, torres de vision y audio, proyecciones de modalidad y readout lineal externo aprendido |
| Parametros totales | 5.104.297.504 (aproximadamente 5,1 mil millones) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (limite duro, sin truncado; las entradas que lo superan fallan). Audio: 30 segundos. Video: 8 fotogramas RGB muestreados uniformemente |
| Tipos de cuantizacion | BF16 nativo, sin cuantizacion. El repositorio de benchmarks del autor incluye variantes cuantizadas para comparar deriva |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 para los pesos (LICENSE.weights, NOTICE.weights); MIT para el codigo de runtime y prompt (LICENSE.code) |
| Formato de pesos | safetensors (BF16), biblioteca transformers |
| Pipeline declarado | feature-extraction (en la practica, scoring de opciones mediante classifier.py) |
| Tamano del repositorio | 10,2 GB (9,508 GiB de ficheros de modelo y readout) |
| Temperatura del readout | 1,019191255914553 |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal de la familia Gemma 4 en el que se conserva el tronco de texto de Jeff y se ensamblan las torres nativas de imagen, audio y video de Google junto con sus proyecciones de modalidad. La salida no se produce por generacion autorregresiva, sino mediante un readout externo aprendido de forma [255, 1536] con temperatura 1,019191255914553, sin el softcap de logits del LM estandar. El scoring usa el prompt de decision upstream de Jeff, un unico forward pass sobre el token final y un softmax restringido a las primeras N filas del readout, donde N es el numero de opciones suministradas (2 a 26).

No hay reentrenamiento, calibracion nueva ni ajuste especifico de benchmarks: el autor describe la pieza como un ensamblado en BF16 de pesos ya existentes. Las fuentes estan fijadas por commit: google/gemma-4-E2B-it@3e22461f65e89153144f8adb70e3b8c2cc9845a7, mstrasser/Jeff-Gemma4-E2B@e3de3e99a979f92afd995d4e526c7e3170ae49cf y firelex/jeff@d0173b4ee317a46dee031421b713f3fc5f868cfe. Los modos de pensamiento (thinking), generacion y entrenamiento estan deshabilitados en esta configuracion.

## Capacidades

- Scoring de opciones multiple: puntua entre 2 y 26 alternativas y devuelve una probabilidad por opcion, con choice_index base cero.
- Entrada de texto: pregunta y opciones mediante los campos question/options, sin multimedia.
- Entrada de imagen: lista de rutas en images:[path,...], procesadas por la torre de vision nativa.
- Entrada de audio: campo audio:path, con remuestreo automatico a mono 16 kHz y limite nativo de 30 segundos.
- Entrada de video: campo video:path, con 8 fotogramas RGB reales muestreados uniformemente, fps y timestamps originales, y sin pista de audio.
- Evaluacion multimodal controlada: el autor reporta senales fuertes de eliminacion de medio emparejado en habla y video.
- Capacidades no soportadas explicitamente: generacion de texto libre, chat multi-turno, tool calling, function calling, agentes, razonamiento multi-paso y modo thinking estan deshabilitados o no se contemplan.
- Combinacion de modalidades: no validada; el autor pide no combinar modalidades salvo validacion propia del caso de uso.

## Casos de uso

- Evaluacion academica de opcion multiple (MMMU, AI2D, MMBench): usar el modelo como clasificador de respuesta unica por opcion forzada, cargando la pregunta y las opciones y leyendo la probabilidad maxima. Es el uso para el que fue construido y el unico con protocolo documentado.
- Clasificacion de imagenes por conjuntos cerrados de etiquetas: dado un conjunto fijo de clases, puntuar cada etiqueta con la torre de vision y seleccionar la de mayor probabilidad, por ejemplo en triaje de imagenes medicas o industriales con categorias predefinidas.
- Identificacion de transcripcion entre candidatos fijos: con LibriSpeech el modelo alcanza el 100 por ciento en identificacion de transcripcion a cuatro bandas con tres distractores fijos, sin ser un sistema ASR; util para verificar hipotesis de transcriptores externos.
- Clasificacion de eventos de video en taxonomias reducidas: con 8 fotogramas por clip y sin audio, sirve para etiquetar videos en un conjunto cerrado de clases, como en el subconjunto UCF101 de 10 clases usado en la evaluacion.
- Filtrado y reranking multimodal en pipelines de datos: usar las probabilidades por opcion como senal de puntuacion para descartar pares pregunta-respuesta inconsistentes antes de un entrenamiento o de una anotacion humana.
- Investigacion sobre cuantizacion y deriva numerica: el repositorio de benchmarks publica seis variantes con deriva emparejada, calibracion, latencia y memoria, lo que permite estudiar el impacto de la cuantizacion manteniendo prompt y protocolo constantes.
- Auditoria de sensibilidad al medio: los controles de eliminacion de medio (media-removal) permiten medir cuanto depende la decision de la imagen, el audio o el video presentes.

## Benchmarks y rendimiento

Resultados de evaluacion controlada publicados por el autor. Son subconjuntos de opcion forzada de un solo paso y adaptados, no puntuaciones oficiales de leaderboard generativo.

| Benchmark | N | Precision | Intervalo bootstrap al 95 por ciento |
|---|---:|---:|---:|
| AI2D | 1000 | 67,60% | [64,70%, 70,60%] |
| MMBench | 1000 | 73,10% | [70,10%, 75,80%] |
| MMMU | 847 | 41,79% | [38,61%, 45,10%] |
| esc10-audio | 200 | 20,50% | [15,50%, 26,00%] |
| librispeech-speech | 100 | 100,00% | [100,00%, 100,00%] |
| ucf101-10-video | 200 | 92,00% | [88,00%, 95,50%] |

Notas del autor sobre el protocolo: MMMU usa 847 preguntas de validacion elegibles; AI2D usa 1000 preguntas de test con semilla; MMBench usa 1000 preguntas de English-dev con semilla tras eliminar duplicados circulares exactos, no el protocolo circular oficial; ESC-10 usa 200 clips balanceados; LibriSpeech usa 100 enunciados de test-clean para identificacion de transcripcion a cuatro bandas con tres distractores fijos, no WER de ASR; UCF101 usa 200 videos del split1 retenido de diez clases fijas, no las 101 clases. La clasificacion de sonido ambiental es debil. Los controles de eliminacion de medio en los primeros 100 casos de MMMU no muestran un beneficio visual claro del modelo original.

## Requisitos de hardware

- VRAM estimada: 9,905 GiB de memoria CUDA asignada en el pico y 10,184 GiB reservada en el pico, con 9,508 GiB de ficheros serializados. En la practica, se necesita una GPU con al menos 12-16 GB para operar con holgura.
- GPU recomendadas: el autor ha probado con una RTX 3090. Cualquier GPU con 16 GB o mas de VRAM y soporte CUDA deberia ser suficiente en teoria, aunque no se documentan pruebas en otras tarjetas.
- Cabe en GPU de consumo: si, en gamas con 16 GB o mas (RTX 3090, RTX 4090 y similares). El autor advierte explicitamente que las mediciones no establecen compatibilidad con GPUs de 4 GiB ni con GPUs Maxwell.
- Opciones de despliegue: script classifier.py incluido, con requirements.txt, sobre Python 3.12.14 y PyTorch CUDA (indice cu130). No hay soporte de GGUF, llama.cpp, Ollama, vLLM ni TGI. No se declara ninguna ruta de CPU-only ni de CPU-offload.
- Latencia y throughput: no disponible en la informacion proporcionada. El autor remite al repositorio de benchmarks para tablas de latencia y memoria por variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeff-Gemma4-E2B-Multimodal-BF16 | 5.104.297.504 | 8192 tokens; audio 30 s | Ver tabla de benchmarks (AI2D 67,60%; MMBench 73,10%; MMMU 41,79%) | Apache-2.0 (pesos) y MIT (codigo) | HuggingFace, 16 descargas, 0 likes |
| google/gemma-4-E2B-it (modelo base) | No disponible | No disponible | No disponible como modelo de scoring; puntuacion generativa no publicada en esta informacion | No disponible en esta informacion | HuggingFace (commit fijado 3e22461f) |
| mstrasser/Jeff-Gemma4-E2B (modelo base) | No disponible | No disponible | No disponible; el autor indica que comparte prompt de Jeff y protocolo de scoring, pero no publica sus cifras en esta model card | No disponible en esta informacion | HuggingFace (commit fijado e3de3e99) |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat ni de generacion: no produce texto libre, no soporta tool calling, ni agentes, ni razonamiento multi-paso, y el modo thinking esta deshabilitado.
- Es una reconstruccion experimental no oficial: no es una release oficial de mstrasser y combina pesos de terceros bajo su propio criterio.
- Uso obligatorio del script suministrado: hay que emplear classifier.py; el artefacto no funciona como pipeline generico de transformers ni como modelo GGUF.
- Limite duro de 8192 tokens sin truncado: cualquier entrada que lo supere falla en lugar de recortarse.
- Limite de audio de 30 segundos y video reducido a 8 fotogramas RGB sin audio; no se debe inferir calidad de transcripcion de habla ni razonamiento visual sin restricciones a partir de las puntuaciones.
- Combinar modalidades en una misma peticion no esta validado por el autor y puede dar resultados poco fiables.
- Rendimiento debil en clasificacion de sonido ambiental (20,50% en ESC-10), muy por debajo de lo utilizable en produccion.
- Los benchmarks son subconjuntos adaptados de opcion forzada, con protocolos distintos de los oficiales (MMBench sin protocolo circular, UCF101 con 10 clases, LibriSpeech como identificacion y no como WER); no deben compararse directamente con leaderboards generativos.
- Los controles de eliminacion de medio en los primeros 100 casos de MMMU no muestran un beneficio visual claro del modelo original, lo que cuestiona la dependencia real de la imagen en esa tarea.
- Compatibilidad de hardware no demostrada fuera del entorno probado (Python 3.12.14, RTX 3090, CUDA); el autor niega explicitamente cualquier garantia para GPUs de 4 GiB, Maxwell u otros contextos.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: al ser un modelo de scoring restringido a opciones, no genera contenido abierto; el riesgo se traslada a una eleccion erronea entre opciones validas, no a la invencion de texto.
- Restricciones de licencia: pesos bajo Apache-2.0 y codigo de runtime y prompt bajo MIT; se preservan los avisos de copyright del prompt upstream. Los medios y textos de los benchmarks de origen no se redistribuyen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nilp0inter/Jeff-Gemma4-E2B-Multimodal-BF16
- Dataset de benchmarks, controles y codigo de reproduccion: https://huggingface.co/datasets/nilp0inter/Jeff-Gemma4-E2B-Multimodal-Benchmarks
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Modelo base: https://huggingface.co/mstrasser/Jeff-Gemma4-E2B
- Repositorio fuente del prompt y codigo: https://huggingface.co/firelex/jeff
- No se han encontrado enlaces adicionales relevantes (papers, blogs o demos) en los resultados de la busqueda web.
