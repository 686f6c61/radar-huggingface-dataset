# nilp0inter/Jeff-Gemma4-E2B-Multimodal-INT8

## Resumen

Jeff-Gemma4-E2B-Multimodal-INT8 es un artefacto experimental publicado por el usuario nilp0inter que empaqueta un modelo multimodal de "option scoring" (puntuación de opciones tipo test) construido sobre la familia Gemma 4. No es un modelo generativo ni de chat: recibe una pregunta con un conjunto de entre 2 y 26 opciones y devuelve una probabilidad por opción, restringiendo su salida mediante un readout externo aprendido. El conjunto tiene 5.104.297.504 parámetros serializados (unos 5,1B) y ocupa 7,764 GiB de pesos, porque incluye las torres nativas de imagen, audio y vídeo completas además del backbone de texto.

El modelo se apoya en tres piezas: el modelo base google/gemma-4-E2B-it, el backbone de texto de mstrasser/Jeff-Gemma4-E2B y el prompt de decisión licenciado de firelex/jeff. Esta revisión concreta aplica cuantización LLM.int8 de bitsandbytes únicamente a las capas nn.Linear del language_model, dejando torres de visión y audio, proyecciones, embeddings, normas y el readout externo en su precisión BF16 original. Es, por tanto, un checkpoint de precisión mixta y no un modelo completamente de 8 bits.

Su relevancia es acotada y muy específica: sirve como referencia de investigación para medir deriva de cuantización (drift) frente al ensamblaje BF16 original en tareas de reconocimiento de imagen, audio y vídeo, con solo 15 descargas y 0 likes en el momento de la consulta. No debe confundirse con un release oficial de Google ni de mstrasser, y su licencia de pesos es Apache-2.0 mientras que el código de runtime y el prompt son MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (clase Gemma4Model) con torres de imagen, audio y vídeo nativas y readout externo de clasificación |
| Parámetros totales | 5.104.297.504 (unos 5,1B) |
| Parámetros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens en el pipeline de scoring; las entradas que los superan fallan sin truncado |
| Tipos de cuantización | LLM.int8 (bitsandbytes) sobre capas lineales de texto; torres, proyecciones, embeddings, normas y readout en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 para pesos (LICENSE.weights, NOTICE.weights); MIT para código de runtime y prompt (LICENSE.code) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El artefacto es un ensamblaje BF16 reconstruido a partir de componentes existentes: las torres de visión y audio originales de Google más las proyecciones de modalidad, un backbone de texto Jeff sin modificar y un readout BF16 entrenado con su temperatura original (1.019191255914553). Sobre esa base, solo las capas nn.Linear nativas del language_model se cuantizan a INT8 con LLM.int8; el resto del grafo permanece en BF16. Según la propia model card, no hay reentrenamiento ni calibración nueva, y los pesos lineales cuantizados son aproximaciones, no réplicas byte a byte del decoder upstream. El readout externo tiene forma [255, 1536] y solo se puntúan las primeras N filas correspondientes a las opciones suministradas.

El espinazo de texto tiene hidden size 1536 y no aplica el logit softcap estándar del LM. La inferencia de scoring usa el prompt de decisión licenciado de Jeff, un único forward pass sobre el último token y un softmax restringido a las opciones. Están desactivados el modo thinking, la generación, el entrenamiento y cualquier calibración específica de benchmark. Para medios, la entrada puede ser texto puro, imágenes (lista de rutas), audio (mono con remuestreo automático a 16 kHz, límite nativo de 30 segundos) o vídeo (ocho fotogramas RGB muestreados uniformemente, fps y timestamps originales, sin pista de audio). Los pins de origen citados son google/gemma-4-E2B-it@3e22461f65e89153144f8adb70e3b8c2cc9845a7, mstrasser/Jeff-Gemma4-E2B@e3de3e99a979f92afd995d4e526c7e3170ae49cf y firelex/jeff@d0173b4ee317a46dee031421b713f3fc5f868cfe.

## Capacidades

- Puntuación de opciones (option scoring) de 2 a 26 alternativas por consulta, devolviendo un choice_index base cero y una probabilidad por opción.
- Entrada multimodal: texto, imágenes, audio y vídeo, con torres nativas completas incluidas en el checkpoint.
- Procesamiento de audio a 16 kHz mono con remuestreo automático y límite de 30 segundos por clip.
- Procesamiento de vídeo mediante ocho fotogramas RGB uniformemente muestreados, conservando fps y timestamps originales y descartando el audio del vídeo.
- Clasificación y reconocimiento visual en tareas de elección múltiple (AI2D, MMBench, MMMU adaptados).
- Identificación de transcripciones de voz entre cuatro opciones (protocolo con distractores fijos, no ASR con WER).
- Clasificación de vídeo de 10 clases (UCF101 split1).
- Clasificación de sonido ambiental, con rendimiento débil según la propia model card.
- No soporta generación de texto, chat, tool calling, function calling, modo agente ni multi-step reasoning; el thinking, la generación y el entrenamiento están desactivados explícitamente.
- Las capacidades multilingües del artefacto: no disponible.

## Casos de uso

- Evaluación automática de preguntas de elección múltiple sobre imágenes: el modelo puntúa cada opción en un único forward pass y permite construir arneses de evaluación que comparen modelos sobre el mismo protocolo Jeff, sin necesidad de muestreo generativo.
- Auditoría de deriva por cuantización: al disponer del ensamblaje BF16 de origen como modelo base, este INT8 sirve para medir la pérdida de precisión introducida por LLM.int8 en tareas concretas antes de decidir un despliegue cuantizado.
- Clasificación de vídeo de pocas clases: con ocho fotogramas muestreados uniformemente, puede usarse como clasificador ligero en tareas tipo UCF101 restringidas a un conjunto fijo de etiquetas.
- Identificación de transcripciones de voz: con clips de hasta 30 segundos y opciones de texto, se puede usar para verificar coincidencias de transcripción entre alternativas candidatas.
- Filtrado y anotación de datasets multimodales: la puntuación de opciones permite etiquetar ejemplos con un valor de confianza por clase, útil para priorizar revisión humana.
- Sistemas de decisión restringida en investigación: cualquier pipeline donde el espacio de respuesta sea un conjunto cerrado y conocido (detección de objetos candidatos, selección de respuesta correcta, emparejamiento imagen-etiqueta) puede beneficiarse del softmax restringido.
- Pruebas de robustez multimodal: la model card menciona controles de "media-removal" para audio y vídeo, de modo que el artefacto sirve para estudiar cuánto depende el scoring de cada modalidad.

## Benchmarks y rendimiento

Resultados publicados en la model card, sobre subconjuntos adaptados de elección forzada de un solo paso (no son puntuaciones generativas oficiales):

| Benchmark | N | Accuracy | Intervalo bootstrap 95% |
|---|---:|---:|---:|
| AI2D | 1000 | 67,20% | [64,20%, 70,20%] |
| MMBench | 1000 | 73,40% | [70,60%, 76,10%] |
| MMMU | 847 | 42,38% | [39,19%, 45,57%] |
| esc10-audio | 200 | 17,50% | [12,50%, 23,00%] |
| librispeech-speech | 100 | 100,00% | [100,00%, 100,00%] |
| ucf101-10-video | 200 | 91,50% | [87,00%, 95,50%] |

Notas de la fuente: MMMU usa 847 MCQ de validación elegibles; AI2D usa 1000 preguntas de test con semilla; MMBench usa 1000 preguntas de English-dev con semilla tras eliminar duplicados circulares exactos (no el protocolo circular oficial); ESC-10 usa 200 clips balanceados y su clasificación es débil; LibriSpeech usa 100 enunciados test-clean para identificación de transcripción con cuatro opciones y tres distractores fijos (no es WER de ASR); UCF101 usa 200 vídeos held-out de split1 y diez clases fijas (no las 101 clases). No se ofrecen cifras de latencia ni throughput en la información proporcionada.

## Requisitos de hardware

- Memoria: ficheros serializados de 7,764 GiB; pico de memoria CUDA asignada observado de 8,146 GiB y reservada de 8,418 GiB.
- GPU probada: una RTX 3090 con CUDA. La model card no reclama compatibilidad con GPUs de 4 GiB, GPUs Maxwell, otros dispositivos ni otros contextos.
- No se declara ninguna ruta de CPU-only ni de CPU-offload.
- Alrededor de 8-10 GB de VRAM parecen necesarios en la configuración medida; cabe en GPUs de gama alta consumer como RTX 3090 o equivalentes, pero no está garantizado en tarjetas de 4 u 8 GB.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI. El artefacto exige ejecutar el classifier.py incluido dentro del repositorio descargado, no es un pipeline genérico de Transformers y no se distribuye en GGUF.
- Entorno: Python 3.12.14 con las versiones exactas de requirements.txt y un índice extra de PyTorch CUDA (cu130); el ejemplo público que se cita es un círculo rojo sintético de dominio público.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nilp0inter/Jeff-Gemma4-E2B-Multimodal-INT8 | 5,1B (5.104.297.504) | 8192 tokens en el pipeline de scoring | LLM.int8 en lineales de texto, resto BF16 | Apache-2.0 (pesos) + MIT (código) | Repositorio HuggingFace, 15 descargas |
| nilp0inter/Jeff-Gemma4-E2B-Multimodal-BF16 | no disponible en la información proporcionada | no disponible | BF16 nativo | Apache-2.0 (pesos) + MIT (código) | Modelo base de este artefacto en HuggingFace |
| nilp0inter/Gemma-4-E2B-it-Multimodal-Scorer-NF4 | no disponible | no disponible | NF4 | no disponible | Repositorio HuggingFace citado en la búsqueda |
| google/gemma-4-E2B (base oficial) | no disponible para la variante E2B | hasta 256K tokens según la model card oficial de Gemma 4 | no aplica (pesos de referencia) | Gemma (no Apache-2.0) | Modelo oficial de Google, multimodal con audio en E2B/E4B/12B |

La comparación directa de rendimiento entre estas variantes no está disponible en la información proporcionada, salvo la referencia de que el ensamblaje BF16 y este INT8 comparten prompt y protocolo de scoring, lo que permite un emparejamiento cuantización a cuantización en el dataset de benchmarks del autor.

## Limitaciones y advertencias

- No es un modelo generativo ni de chat: no produce texto libre, no soporta tool calling ni agentes, y no debe usarse con pipelines genéricos de Transformers.
- Requiere el classifier.py proporcionado; ignorarlo invalida el uso previsto y el contrato de scoring (2..26 opciones, softmax restringido, un único forward pass).
- Las entradas de más de 8192 tokens fallan sin truncado, lo que impone un límite duro en el contexto efectivo del pipeline de scoring, independientemente del contexto del modelo base.
- El audio está limitado a 30 segundos por clip y sólo se admiten entradas mono con remuestreo a 16 kHz.
- El vídeo se reduce a ocho fotogramas RGB uniformemente muestreados sin audio, lo que descarta información temporal fina y cualquier señal sonora del vídeo.
- No se deben combinar modalidades en un mismo request salvo validación independiente del caso de uso.
- Los resultados de benchmark son subconjuntos adaptados de elección forzada de un solo paso y no puntuaciones generativas oficiales; el prompting de chat puede dar resultados distintos.
- La clasificación de sonido ambiental es débil (17,50% en esc10-audio) y los controles de "media-removal" en las primeras 100 preguntas de MMMU no muestran un beneficio visual claro del modelo original: no debe inferirse razonamiento visual sin restricciones ni calidad de transcripción de voz.
- Índice de descargas muy bajo (15) y 0 likes: modelo experimental sin adopción comunitaria ni validación externa.
- Es una reconstrucción no oficial (no es un release de mstrasser) y los pesos lineales cuantizados son aproximaciones, no réplicas byte a byte del decoder upstream.
- Posibles sesgos y riesgo de alucinación: no documentados específicamente en la información disponible; al tratarse de un scorer, el riesgo se manifiesta como asignación errónea de probabilidad entre opciones más que como texto inventado.
- Restricciones de licencia: los pesos son Apache-2.0 y el código/prompt MIT, pero el prompt upstream de Jeff conserva sus avisos de copyright y los medios y textos de los benchmarks de origen no se redistribuyen; verificar la cadena de licencias antes de uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nilp0inter/Jeff-Gemma4-E2B-Multimodal-INT8
- Modelo base BF16: https://huggingface.co/nilp0inter/Jeff-Gemma4-E2B-Multimodal-BF16
- Dataset de benchmarks y reproducción: https://huggingface.co/datasets/nilp0inter/Jeff-Gemma4-E2B-Multimodal-Benchmarks
- Variante NF4 del scorer: https://huggingface.co/nilp0inter/Gemma-4-E2B-it-Multimodal-Scorer-NF4
- Modelo oficial Gemma 4 E2B (Google): https://huggingface.co/google/gemma-4-E2B
- Model card oficial de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Página de producto Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Pin de origen google/gemma-4-E2B-it: https://huggingface.co/google/gemma-4-E2B-it
- Pin de origen mstrasser/Jeff-Gemma4-E2B: https://huggingface.co/mstrasser/Jeff-Gemma4-E2B
- Pin de origen firelex/jeff: https://huggingface.co/firelex/jeff
