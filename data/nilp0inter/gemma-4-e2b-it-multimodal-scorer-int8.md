# nilp0inter/Gemma-4-E2B-it-Multimodal-Scorer-INT8

## Resumen

Gemma-4-E2B-it-Multimodal-Scorer-INT8 es un artefacto experimental publicado por el usuario nilp0inter que cuantiza a INT8 el modelo nilp0inter/Gemma-4-E2B-it-Multimodal-Scorer-BF16, el cual a su vez parte del backbone multimodal nativo google/gemma-4-E2B-it. No es un modelo conversacional ni de generación: se trata de un *scorer* de opciones (option-scoring) que recibe una pregunta con entre 2 y 26 opciones y devuelve una probabilidad por cada una mediante un readout externo de forma [255, 1536]. El problema que resuelve es la evaluación forzada de respuesta múltiple sobre entradas multimodales (texto, imagen, audio y vídeo) con una única pasada forward y softmax restringido.

Su relevancia es acotada y muy específica: sirve como base reproducible para comparar el efecto de la cuantización (INT8 frente a BF16 y NF4) en tareas de *scoring* multimodal, y como cabecera de evaluación para *benchmarks* adaptados. El autor publica métricas controladas en AI2D, MMBench, MMMU, ESC-10, LibriSpeech y UCF101, además de un dataset con los seis variantes, la deriva de cuantización emparejada y el código de reproducción.

Técnicamente es un transformer multimodal denso con el *language model* nativo a INT8 (vía LLM.int8 de bitsandbytes) y las torres de visión, audio y vídeo, *embeddings*, *norms* y el readout externo en BF16. El repositorio pesa 8,4 GB y el checkpoint serializado 7,764 GiB. Su consumo pico observado en CUDA es de 8,146 GiB asignados (8,418 GiB reservados) sobre una RTX 3090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (backbone nativo Gemma 4, clase Gemma4Model) con torres de vision, audio y video y readout externo de opciones |
| Parametros totales | 5.104.297.504 (~5,1 mil millones, dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8.192 tokens (las entradas que lo superan fallan, sin truncado) |
| Tipos de cuantizacion | INT8 (LLM.int8 / bitsandbytes) solo en los nn.Linear planos del language model; torres de vision/audio, proyecciones, embeddings, norms, buffers de clipping y readout externo en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos, LICENSE.weights y NOTICE.weights); MIT (codigo de runtime y prompt, LICENSE.code) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 8,4 GB |
| Ficheros serializados (modelo/readout) | 7,764 GiB |
| Hidden size del language model | 1.536 |
| Readout externo | [255, 1536] (255 filas code-letter del LM-head original, BF16, softcap elementwise 30, temperatura 1) |

## Arquitectura y entrenamiento

El artefacto no entrena nada nuevo: es una cuantización y reexportación del baseline BF16. El backbone es el modelo Gemma 4 E2B instruct multimodal de Google, con su imagen nativa completa (torres de imagen, audio y vídeo incluidas) y un readout externo que replica 255 filas code-letter del LM-head original en BF16. Este readout se aplica sobre las opciones suministradas (se puntúan solo las primeras N filas correspondientes a las opciones aportadas) mediante una sola pasada forward del ultimo token y un softmax restringido. La decodificacion, la generacion y el modo *thinking* estan desactivados.

La cuantización es de precisión mixta, no uniforme: solo los pesos `nn.Linear` planos del `language_model` usan LLM.int8; el resto del grafo permanece en la precisión nativa BF16. El autor advierte explícitamente de que no es un checkpoint todo-8-bit ni todo-4-bit. La construcción se ancla a tres revisiones concretas: `google/gemma-4-E2B-it@3e22461f65e89153144f8adb70e3b8c2cc9845a7`, `mstrasser/Jeff-Gemma4-E2B@e3de3e99a979f92afd995d4e526c7e3170ae49cf` y `firelex/jeff@d0173b4ee317a46dee031421b713f3fc5f868cfe`. El prompt de decisión utilizado es el "Jeff decision prompt" con licencia upstream, y el baseline original publicado no está afinado con Jeff. No se documenta en la información disponible ningún proceso de RLHF, DPO o ajuste adicional asociado a esta variante.

## Capacidades

- Puntuación de opciones forzada: acepta entre 2 y 26 opciones y devuelve una probabilidad por opción (`choice_index` con base cero).
- Entrada de texto puro mediante los campos `question` y `options`, sin medio asociado.
- Entrada de imagen mediante `images:[path,...]`.
- Entrada de audio mediante `audio:path`, con remuestreo automático a mono 16 kHz y límite nativo de 30 segundos.
- Entrada de vídeo mediante `video:path`, con ocho fotogramas RGB reales muestreados uniformemente, fps y timestamps originales y sin pista de audio.
- Evaluación multimodal de respuesta múltiple (VQA, clasificación visual, identificación de transcripciones, clasificación de vídeo) en una sola pasada forward.
- No soporta generación de texto, chat, *tool calling*, function calling, agentes ni razonamiento multi-paso.
- No se debe combinar modalidades en la misma petición salvo que se valide por separado ese caso de uso.

## Casos de uso

- Evaluación de respuesta múltiple sobre imágenes: alimentar preguntas de *benchmarks* como AI2D o MMBench con la imagen asociada y las opciones candidatas para obtener probabilidades por opción; es el escenario para el que el artefacto está construido y validado (58,00% en AI2D, 69,40% en MMBench).
- Identificación de transcripciones de voz: dado un audio corto y cuatro opciones de transcripción (una correcta y tres distractores fijos), el modelo puntúa cuál encaja mejor; el autor reporta un 100,00% en una prueba de 100 enunciados test-clean de LibriSpeech.
- Clasificación de vídeo de pocas clases: usar ocho fotogramas muestreados de un vídeo corto y opciones de clase para tareas como UCF101 restringido a diez clases (86,00% en 200 vídeos).
- Comparación de deriva por cuantización: emplear la misma cabecera y prompt para medir la diferencia de precisión entre las variantes INT8, NF4 y BF16 sobre un conjunto fijo de preguntas, aprovechando el dataset de benchmarks emparejados publicado por el autor.
- Cabecera de *scoring* para preferencias o recompensas: integrar el readout externo en un *pipeline* que necesite puntuar un conjunto cerrado de alternativas (por ejemplo, elegir entre varias respuestas candidatas) en lugar de generar texto libre.
- Auditoría de sensibilidad al medio: ejecutar controles de "media-removal" (misma pregunta con y sin imagen, audio o vídeo) para cuantificar cuánto depende la decisión de la señal multimodal, tal como hace el autor en sus pruebas controladas.
- Investigación sobre evaluación multimodal: servir como componente reproducible en un *harness* de evaluación cuando no se requiere generación y sí una probabilidad comparable entre opciones.

## Benchmarks y rendimiento

| Benchmark | N | Exactitud | Intervalo bootstrap 95% (pregunta) |
|---|---:|---:|---:|
| AI2D | 1000 | 58,00% | [54,80%, 61,00%] |
| MMBench | 1000 | 69,40% | [66,50%, 72,20%] |
| MMMU | 847 | 38,25% | [35,06%, 41,56%] |
| esc10-audio | 200 | 11,50% | [7,00%, 16,00%] |
| librispeech-speech | 100 | 100,00% | [100,00%, 100,00%] |
| ucf101-10-video | 200 | 86,00% | [81,00%, 91,00%] |

Advertencias del autor sobre estas cifras: son subconjuntos adaptados de elección forzada en una sola pasada, no puntuaciones oficiales de *leaderboards* generativos. MMMU usa 847 preguntas de validación elegibles; AI2D usa 1000 preguntas de test sembradas; MMBench usa 1000 preguntas English-dev tras eliminar duplicados circulares exactos, no el protocolo circular oficial; ESC-10 usa 200 clips balanceados; LibriSpeech usa 100 enunciados test-clean para identificación de transcripción a cuatro vías con tres distractores fijos (no es WER de ASR); UCF101 usa 200 vídeos retenidos del split 1 de diez clases fijas (no las 101 clases). La clasificación de sonido ambiental es débil. Los controles de eliminación de medio en los primeros 100 casos de MMMU no muestran un beneficio visual claro del modelo original, por lo que no deben inferirse capacidades visuales ni de transcripción no restringidas a partir de estas cifras.

## Requisitos de hardware

- Memoria CUDA pico observada: 8,146 GiB asignados y 8,418 GiB reservados, con 7,764 GiB de ficheros serializados de modelo y readout.
- GPU de referencia probada: NVIDIA RTX 3090 con CUDA. El autor indica que estas medidas no establecen compatibilidad con GPUs de 4 GiB, GPUs Maxwell, otros dispositivos ni otros contextos.
- No se declara ninguna ruta de *CPU-offload* ni de ejecución solo en CPU.
- Compatibilidad con GPU de consumo: el pico de ~8,4 GiB reservados encaja en GPUs de 12 GB o más (por ejemplo, RTX 3060 12 GB, RTX 3080/3090, RTX 4070/4080/4090); no hay validación publicada para tarjetas de 4 u 8 GB.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni GGUF; requiere ejecutar el `classifier.py` incluido con las versiones exactas de `requirements.txt` (probado con Python 3.12.14 y `--extra-index-url https://download.pytorch.org/whl/cu130`).
- No se publican datos de latencia ni de *throughput* en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Gemma-4-E2B-it-Multimodal-Scorer-INT8 (este) | 5.104.297.504 | 8.192 tokens | safetensors, language model en INT8 y resto BF16 | Scorer de opciones multimodal | Apache-2.0 (pesos) + MIT (codigo) | HuggingFace, 14 descargas, 0 likes |
| nilp0inter/Gemma-4-E2B-it-Multimodal-Scorer-BF16 | no disponible | no disponible | safetensors, BF16 | Scorer de opciones multimodal (modelo base) | no disponible | HuggingFace (referenciado como base) |
| nilp0inter/Gemma-4-E2B-it-Multimodal-Scorer-NF4 | no disponible | no disponible | safetensors, NF4 | Scorer de opciones multimodal | no disponible | HuggingFace |
| google/gemma-4-E2B | no disponible en la informacion (una fuente externa cita ~2,1 mil millones en variante texto) | no disponible (una fuente externa cita 8K) | no disponible | Modelo generativo multimodal de Google | no disponible | HuggingFace y Google DeepMind |

Comparativa de rendimiento entre variantes: no disponible en la información proporcionada; el autor remite al dataset `Jeff-Gemma4-E2B-Multimodal-Benchmarks` y a `RESULTS.md` para las tablas completas de deriva de cuantización emparejada.

## Limitaciones y advertencias

- No es un modelo de chat ni de generación, ni un pipeline genérico de Transformers: solo funciona con el `classifier.py` suministrado y el protocolo de scoring documentado.
- No es un checkpoint totalmente INT8 ni totalmente de 4 bits: solo una parte del grafo está cuantizada, lo que limita las comparaciones directas con cuantizaciones uniformes.
- Rendimiento débil en clasificación de sonido ambiental (11,50% en esc10-audio), muy próximo al azar en un problema de este tipo.
- Las cifras de LibriSpeech y UCF101 corresponden a tareas restringidas (identificación a cuatro vías y diez clases fijas), no a ASR ni a clasificación de vídeo generalista; extrapolarlas sería incorrecto.
- Sin beneficios visuales claros en los controles de eliminación de medio de las primeras 100 preguntas de MMMU, según el propio autor.
- Riesgo de alucinación no caracterizado en la información disponible; al ser un scorer con softmax restringido, el modo de fallo relevante es la asignación de probabilidad a la opción incorrecta, no la invención de texto.
- Límite estricto de 8.192 tokens sin truncado: las entradas que lo exceden fallan.
- Límite nativo de 30 segundos para audio.
- Ocho fotogramas uniformes por vídeo y sin pista de audio; no se debe combinar modalidades sin validación previa.
- Idiomas soportados no documentados en la información disponible.
- Licencia de pesos Apache-2.0, apta para uso comercial, pero con obligación de conservar `LICENSE.weights`, `NOTICE.weights` y los avisos de copyright del prompt upstream; el código de runtime y prompt es MIT. Los medios y textos de los benchmarks de origen no se redistribuyen.
- Modelo experimental con 14 descargas y 0 likes: sin validación comunitaria ni mantenimiento garantizado.
- Pico de memoria de ~8,4 GiB reservados: inviable en GPUs de 4 u 8 GB y sin ruta de CPU validada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nilp0inter/Gemma-4-E2B-it-Multimodal-Scorer-INT8
- Modelo base BF16: https://huggingface.co/nilp0inter/Gemma-4-E2B-it-Multimodal-Scorer-BF16
- Variante NF4: https://huggingface.co/nilp0inter/Gemma-4-E2B-it-Multimodal-Scorer-NF4
- Dataset de benchmarks y reproduccion (seis variantes, deriva de cuantizacion, calibracion, latencia, memoria y predicciones crudas): https://huggingface.co/datasets/nilp0inter/Jeff-Gemma4-E2B-Multimodal-Benchmarks
- Modelo upstream de Google: https://huggingface.co/google/gemma-4-E2B
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Ficha de Gemma 4 E2B en gemma4.dev: https://gemma4.dev/models/gemma-4-e2b
- Documentacion de Gemma 4 para edge en Google AI Edge: https://developers.google.com/edge/litert-lm/models/gemma-4
