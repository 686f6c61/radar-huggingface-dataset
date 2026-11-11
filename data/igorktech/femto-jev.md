# igorktech/femto-jev

## Resumen

femto-jev es un modelo de decisión de tipo "system-one" desarrollado por igorktech, con tan solo 7,7 millones de parámetros y unos 30 MB en fp32. No genera texto: recibe un estado y un conjunto de preguntas tipadas, y devuelve una probabilidad por cada opción en un único forward pass por pregunta. Resuelve el problema de tomar decisiones calibradas (elección entre opciones, puntuación sobre rúbrica y preguntas sí/no) en entornos con recursos muy limitados, evitando el parseo de salidas generativas.

El modelo se construye sobre el encoder `jhu-clsp/ettin-encoder-17m` y se ejecuta con la librería Laya. Admite entrada de texto y también de voz: combinado con `femto-asr` (2,39M parámetros) permite leer audio, de modo que el pipeline hablado completo suma 10,1M de parámetros. Está pensado explícitamente para el caso en que la decisión debe tomarse en una máquina pequeña, no para competir en razonamiento general con modelos de miles de millones de parámetros.

Su relevancia actual radica en la combinación de tamaño mínimo, licencia Apache 2.0 y soporte de voz y texto en el mismo modelo, con resultados en el benchmark typed-decisions (0,732 de accuracy) cercanos a modelos entre 5 y 50 veces mayores, aunque con la advertencia del propio autor de que ese benchmark está en distribución para este modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer (base `jhu-clsp/ettin-encoder-17m`), modelo de decisión con cabezas de clasificación por pregunta tipada |
| Parámetros totales | 7.763.396 (7,7M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en fp32, ~30 MB) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | laya |
| Pipeline | text-classification |
| Tamaño del repo | 0,0 GB |
| Modelo base | `jhu-clsp/ettin-encoder-17m` (fine-tune) |
| Pipeline hablado completo | 10,1M parámetros (femto-jev + femto-asr 2,39M) |

## Arquitectura y entrenamiento

femto-jev es un fine-tune del encoder Ettin de 17M parámetros, adaptado como modelo de decisión. En lugar de generar texto, formula cada decisión como una pregunta tipada: `choice` (opciones con descripción opcional, una probabilidad por opción), `score` (niveles ordenados de una rúbrica, una probabilidad por nivel) y `noul` (enunciado sí/no, con P(falso) y P(verdadero)). Las preguntas se escriben en texto plano en tiempo de llamada, por lo que no requiere reentrenamiento al cambiar la pregunta. El modelo produce la salida en un único forward pass por pregunta, lo que elimina el parseo de respuestas generativas.

El entrenamiento combina el split de entrenamiento de typed-decisions con un conjunto amplio de datasets de clasificación: SLURP, Banking77, SST-5, AG News, Emotion, GLUE, SNLI, WANLI, VitaminC, BoolQ, PAWS, CLINC OOS, GoEmotions y DBpedia-14. Para la parte hablada, el modelo consume la transcripción y/o los frames ocultos de `femto-asr`, y puede operar en tres modos: `joint` (transcripción + frames, por defecto), `hyp` (solo transcripción, cascada clásica) y `audio` (solo frames, sin palabras). No se detallan en la información disponible el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF/DPO; las etiquetas del modelo mencionan "calibrated-decisions" y "rlcd".

## Capacidades

- Clasificación y toma de decisiones tipadas: `choice`, `score` y `noul`, con salida probabilística calibrada por opción.
- Decisiones definidas en tiempo de llamada mediante preguntas en texto plano, sin reentrenamiento.
- Lectura de voz en tres modos: transcripción + frames (`joint`), solo transcripción (`hyp`) y solo frames (`audio`), siempre a través de `femto-asr`.
- Comprensión de lenguaje hablado (spoken language understanding) para intenciones, emociones y clasificación temática.
- Clasificación de texto en dominios diversos: intención bancaria, emoción, sentimiento, noticias, inferencia de lenguaje natural, paráfrasis, preguntas booleanas y temas.
- Enrutamiento (routing) y clasificación de texto de propósito general.
- Ejecución on-device por su tamaño reducido (7,7M parámetros, ~30 MB en fp32).
- Multilingüe: no; únicamente inglés.
- Tool calling, agentes, razonamiento multi-paso y generación de texto: no disponibles (el modelo no genera texto).

## Casos de uso

- Enrutamiento de intenciones en asistentes de voz on-device: el modelo recibe la transcripción y/o los frames de `femto-asr` y devuelve la probabilidad de cada intención, con el pipeline completo de 10,1M de parámetros ejecutable en hardware de bajo consumo.
- Clasificación de tickets de soporte en el borde: con preguntas `choice` definidas en tiempo de llamada, se pueden categorizar tickets por tipo, urgencia o equipo responsable sin reentrenar y sin generar texto que parsear.
- Moderación y filtrado ligero: preguntas `noul` sobre enunciados (por ejemplo, si un mensaje cumple una política) permiten obtener P(verdadero)/P(falso) con un coste computacional mínimo.
- Análisis de sentimiento y emoción en audio de atención al cliente: el modo `joint` obtiene 0,902 en Emotion (TTS) y 0,714 en SLURP real, útil para triaje de llamadas sin enviar audio a la nube.
- Clasificación temática de noticias y contenidos: 0,854 en AG News (TTS) con transcripción + frames, adecuado para etiquetado masivo de contenido en pipelines de datos.
- Puntuación sobre rúbrica en evaluación automática: el tipo `score` devuelve una probabilidad por nivel ordenado, aplicable a control de calidad de respuestas o evaluación de transcripciones.
- Enrutamiento de consultas en sistemas RAG o pipelines de agentes: decidir qué herramienta o submodelo atiende una petición antes de invocar un LLM mayor, reduciendo coste y latencia.
- Clasificación de comandos de voz en dispositivos empotrados: con 30 MB en fp32 y soporte de solo frames (`audio`), puede integrarse en dispositivos con memoria muy restringida.

## Benchmarks y rendimiento

Resultados declarados por el autor (accuracy con el scorer de typed-decisions, mismo evaluador para todos los modelos).

typed-decisions (texto), split de test oficial, 400 casos / 2.000 decisiones:

| Modelo | Parámetros | Accuracy |
|---|---:|---:|
| laya-typed-decisions | 421M | 0,767 |
| Oscar-1-68M | 74,7M | 0,742 |
| **femto-jev** | **7,7M** | **0,732** |
| JEV-9B | 9,0B | 0,706 |
| Oscar-1-32M | 35,6M | 0,699 |
| Oscar-1-17M | 18,4M | 0,682 |
| laya (sin entrenar en él) | 421M | 0,360 |

Voz (cada conjunto combina su pregunta nativa con una pregunta sí/no):

| Test set | Palabras reales | Transcripción | Frames | Transcripción + frames | AudioJev (4,7B, audio crudo) |
|---|---:|---:|---:|---:|---:|
| SLURP (real, 12.840 clips) | 0,916 | 0,586 | 0,692 | **0,714** | 0,887 |
| Banking77 (TTS) | 0,915 | 0,872 | 0,786 | **0,893** | 0,878 |
| Emotion (TTS) | 0,929 | 0,898 | 0,627 | **0,902** | 0,691 |
| SST-5 (TTS) | 0,587 | 0,567 | 0,448 | **0,570** | 0,717 |
| AG News (TTS) | 0,896 | 0,855 | 0,687 | **0,854** | 0,845 |
| MInDS-14 en (real, nunca entrenado) | 0,781 | 0,561 | 0,369 | 0,558 | 0,907 |

Misma transcripción leída por otros modelos (todos reciben la transcripción idéntica de femto-asr):

| Modelo | Parámetros | SLURP | Banking77 | Emotion | SST-5 | AG News | MInDS-14 |
|---|---:|---:|---:|---:|---:|---:|---:|
| **femto-jev**, transcripción + frames | 7,7M | **0,714** | **0,893** | **0,902** | 0,570 | 0,854 | 0,558 |
| **femto-jev**, solo transcripción | 7,7M | 0,586 | 0,872 | 0,898 | 0,567 | 0,855 | 0,561 |
| Oscar-1-17M | 18,4M | 0,223 | 0,458 | 0,481 | 0,418 | 0,393 | 0,401 |
| Oscar-1-32M | 35,6M | 0,244 | 0,432 | 0,557 | 0,575 | 0,516 | 0,422 |
| Oscar-1-68M | 74,7M | 0,242 | 0,586 | 0,881 | 0,529 | 0,819 | 0,491 |
| laya | 421M | 0,326 | 0,752 | 0,593 | 0,553 | 0,847 | 0,652 |
| laya-typed-decisions | 421M | 0,334 | 0,757 | 0,654 | 0,664 | 0,856 | 0,649 |
| JEV-9B | 9,0B | 0,451 | 0,828 | 0,702 | **0,666** | **0,859** | **0,724** |

Notas del autor: en SLURP los frames añaden 13 puntos a la transcripción; en MInDS-14 no aportan nada (los frames solo ayudan con habla similar a la de entrenamiento). El resultado de JEV-9B en SLURP cubre dos de las tres preguntas; en esas dos, femto-jev obtiene 0,761 con transcripción + frames y 0,648 con solo transcripción. El benchmark typed-decisions está en distribución para femto-jev, los Oscar y laya-typed-decisions (todos entrenados con su split de entrenamiento); ningún caso de test (0 de 400) está en los datos de entrenamiento de femto-jev.

## Requisitos de hardware

- VRAM estimada: ~30 MB en fp32 para los pesos; en la práctica cabe en cualquier GPU consumer, iGPU o incluso CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en RTX 4090, A100 o H100 sin aprovechar su capacidad, y en hardware de borde (Raspberry Pi, móviles, NPUs de baja potencia) por su tamaño.
- Cabe en cualquier GPU consumer: sí, con margen amplísimo.
- Despliegue: librería Laya (formato nativo del modelo); para el pipeline hablado se requiere además `femto-asr`. No se indica soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor indica un único forward pass por pregunta, sin generación autoregresiva.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | typed-decisions (texto) | SLURP (voz) | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| **femto-jev** | 7,7M | no disponible | 0,732 | 0,714 | Apache 2.0 | Hugging Face |
| Oscar-1-68M | 74,7M | no disponible | 0,742 | 0,242 | no disponible | Hugging Face |
| laya-typed-decisions | 421M | no disponible | 0,767 | 0,334 | no disponible | Hugging Face |
| JEV-9B | 9,0B | no disponible | 0,706 | 0,451 | no disponible | Hugging Face |
| AudioJev | 4,7B | no disponible | no disponible | 0,887 | no disponible | Hugging Face |

femto-jev ofrece accuracy cercana a modelos entre 5 y 50 veces mayores en typed-decisions y supera claramente a Oscar y laya en la lectura de transcripciones de voz, a costa de quedar por debajo de AudioJev (4,7B) en habla real.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, razonamiento libre ni respuestas abiertas; solo probabilidades sobre opciones, niveles o sí/no.
- Solo inglés; no soporta otros idiomas.
- El resultado de 0,732 en typed-decisions está en distribución (entrenado con su split de entrenamiento); no debe leerse como capacidad general.
- En voz, los frames solo aportan mejoras en condiciones acústicas similares a las de entrenamiento; en MInDS-14 (habla telefónica real no vista) el rendimiento cae a 0,558 y los frames no ayudan.
- En SLURP real, el WER de femto-asr es alto en grabaciones de campo lejano; el rendimiento depende fuertemente de la calidad de la transcripción.
- Queda por debajo de AudioJev (4,7B) en habla real (0,714 frente a 0,887 en SLURP), pese a la diferencia de tamaño.
- Rendimiento débil en SST-5 (0,570), cerca del techo de palabras reales (0,587).
- Riesgo de alucinación: no aplica en el sentido generativo, pero las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento.
- Sesgos: no se documentan sesgos específicos en la información disponible; los datasets de entrenamiento (redes sociales, noticias, banca) pueden introducir sesgos de dominio.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las licencias de los datasets de entrenamiento y del modelo base Ettin.
- No se especifican longitud de contexto ni tipos de cuantización, lo que limita la planificación de despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/igorktech/femto-jev
- Modelo ASR complementario: https://huggingface.co/igorktech/femto-asr
- Dataset typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset SLURP: https://huggingface.co/datasets/marcel-gohsen/slurp
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-17m
