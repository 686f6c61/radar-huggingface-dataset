# jzmzhong/accent-id-genaid

## Resumen

GenAID (Generalisable Accent Identification) es un clasificador de acento del ingles desarrollado por Jinzuomu Zhong y colaboradores, presentado en el articulo AccentBox (ICASSP 2025). El modelo identifica 13 variedades de acento del ingles a partir de grabaciones de voz cortas y esta disenado especificamente para generalizar a hablantes no vistos durante el entrenamiento, un escenario donde los clasificadores de acento tradicionales suelen degradarse notablemente.

Tecnicamente, GenAID se construye sobre el modelo preentrenado facebook/wav2vec2-large-xlsr-53, al que anade pooling estadistico y una MLP que produce embeddings de acento de 64 dimensiones, sobre los que se aplica un clasificador entrenado con perdida NLL. El sistema se distribuye como un modelo de SpeechBrain v0.5.16 y se entrena sobre un re-split por hablante del corpus CommonAccent (Common Voice 17.0), garantizando que los hablantes de validacion y test no aparecen en entrenamiento.

Su relevancia actual radica en que aborda el problema de la generalizacion entre hablantes en identificacion de acento, reportando 0,56 de accuracy en clasificacion de 13 acentos sobre hablantes no vistos. Es un modelo pequeno (repo de 1,3 GB), con licencia MIT y orientado a investigacion en reconocimiento de habla y sistemas de sintesis con control de acento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLSR (wav2vec2-large-xlsr-53) + pooling estadistico + MLP (embeddings de 64 dim) + clasificador |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio a 16 kHz, mono) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo SpeechBrain de 1,3 GB; pesos gestionados por SpeechBrain) |

## Arquitectura y entrenamiento

GenAID es un sistema de clasificacion de audio compuesto por un encoder XLSR preentrenado (facebook/wav2vec2-large-xlsr-53) seguido de pooling estadistico y una MLP que genera embeddings de acento de 64 dimensiones. Sobre estos embeddings se aplica un clasificador entrenado con perdida NLL (negative log-likelihood). El modelo opera con audio muestreado a 16 kHz en un solo canal; la interfaz de SpeechBrain normaliza automaticamente la entrada (resampleo y seleccion de canal mono) cuando se usa `classify_file`.

El entrenamiento se realiza sobre un re-split basado en hablante del dataset CommonAccent en ingles (Common Voice Corpus 17.0, 13 acentos), de forma que los hablantes de validacion y test no se solapan con los de entrenamiento. Esta decision de diseno es la innovacion central del trabajo: evaluar y entrenar con separacion estricta por hablante para medir generalizacion real a hablantes no vistos. El modelo se entreno con SpeechBrain v0.5.16 usando las interfaces antiguas (`speechbrain.pretrained` y `speechbrain.lobes.models.huggingface_wav2vec`). No se dispone de informacion sobre el volumen exacto de horas de entrenamiento, la composicion detallada del dataset ni el uso de tecnicas adicionales de ajuste fino mas alla de lo descrito.

## Capacidades

- Clasificacion de acento del ingles entre 13 clases: us, canadian, australian, southasian, english, southernafrican, irish, scottish, filipino, singaporean, hongkong, malaysian y newzealand.
- Extraccion de embeddings de acento a nivel de enunciado (64 dimensiones) mediante `encode_batch`, utiles como representacion para tareas posteriores.
- Generalizacion a hablantes no vistos, gracias al re-split por hablante del corpus de entrenamiento.
- Procesamiento de audio a 16 kHz mono con normalizacion automatica en `classify_file`.
- Inferencia en CPU y GPU (esta ultima mediante `run_opts={"device":"cuda"}`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un clasificador de audio.
- No dispone de API de inferencia en Hugging Face por incompatibilidad con las interfaces actuales de SpeechBrain; requiere el repositorio GenAID y la version fijada de SpeechBrain.

## Casos de uso

- Enrutamiento de llamadas en atencion al cliente: clasificar el acento del interlocutor al inicio de la llamada para dirigirla a agentes o colas especializadas, usando `classify_file` sobre los primeros segundos de audio.
- Personalizacion de sistemas ASR: seleccionar un modelo acustico o un adaptador especifico por acento antes de transcribir, aprovechando la etiqueta de acento predicha para reducir la tasa de error en habla no nativa.
- Investigacion en sociolinguistica y dialectologia: procesar corpus de habla para cuantificar la distribucion de acentos y estudiar su correlacion con variables demograficas, usando los embeddings de 64 dimensiones como representacion compacta.
- Control de acento en sintesis de voz: en el contexto de AccentBox, usar la identificacion de acento como componente de evaluacion o condicionamiento en pipelines de generacion de voz con acento objetivo.
- Filtrado y curaduria de datasets de voz: etiquetar automaticamente grabaciones por acento para construir subconjuntos equilibrados o detectar desbalances en corpus de entrenamiento.
- Analisis de calidad en plataformas de contenido: clasificar el acento de locuciones subidas por usuarios para moderacion, indexacion o busqueda por variedad linguistica.
- Evaluacion de generalizacion de sistemas AID: servir como linea base reproducible (con separacion por hablante) para comparar nuevos modelos de identificacion de acento.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Accuracy (13 acentos) | 0,56 | Hablantes no vistos (unseen speakers) |

El autor indica que este resultado constituye el estado del arte en identificacion de acento sobre hablantes no vistos, pero no se proporcionan en la informacion disponible resultados desglosados por clase, matrices de confusion ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repo ocupa 1,3 GB, lo que sugiere que el modelo cabe holgadamente en GPUs de consumo, aunque la cifra exacta de VRAM no se especifica.
- GPU recomendadas: cualquier GPU con suficiente memoria para el encoder XLSR; no se detallan modelos concretos (A100, H100, RTX 4090, etc.) en la informacion disponible.
- Compatibilidad con GPU de consumo: probable dado el tamano del repo, pero no confirmada en la documentacion.
- Opciones de despliegue: SpeechBrain v0.5.16 con las interfaces antiguas (`foreign_class`, `classify_file`, `encode_batch`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GenAID | Identificacion de acento (13 clases, ingles) | no disponible | audio 16 kHz | 0,56 accuracy en hablantes no vistos | MIT | Hugging Face + GitHub |
| CommonAccent (Zuluaga-Gomez et al., 2023) | Identificacion de acento | no disponible | audio 16 kHz | no disponible en esta ficha | no disponible | GitHub |
| facebook/wav2vec2-large-xlsr-53 | Modelo base preentrenado (ASR multilingue) | no disponible | audio 16 kHz | no aplica (modelo base) | no disponible | Hugging Face |

No se dispone de datos numericos comparativos con otros clasificadores de acento en la informacion proporcionada.

## Limitaciones y advertencias

- El autor no ofrece ninguna garantia sobre el rendimiento del modelo en datasets distintos de aquel con el que se entreno y evaluo.
- Solo cubre 13 acentos del ingles; cualquier variedad fuera de esa lista no tiene clase asignada y el modelo forzara una de las existentes.
- El accuracy de 0,56 sobre hablantes no vistos implica una tasa de error considerable (44 %); no es adecuado como unico criterio en decisiones criticas.
- No dispone de API de inferencia en Hugging Face; requiere clonar el repositorio GenAID e instalar la version concreta de SpeechBrain (v0.5.16) con las interfaces antiguas, lo que puede generar problemas de mantenimiento y compatibilidad a futuro.
- Riesgo de sesgo: el rendimiento puede variar de forma desigual entre acentos segun su representacion en Common Voice 17.0; no se publican metricas por clase.
- No se documentan sesgos demograficos especificos ni evaluaciones de robustez ante ruido, canales telefonicos o audio de baja calidad.
- La licencia MIT permite uso comercial, pero el modelo base XLSR y el dataset Common Voice tienen sus propias condiciones que deben verificarse por separado.
- Modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jzmzhong/accent-id-genaid
- Repositorio GitHub GenAID: https://github.com/jzmzhong/GenAID
- README del repositorio: https://github.com/jzmzhong/GenAID/blob/GenAID/README.md
- Paper AccentBox (ICASSP 2025): https://ieeexplore.ieee.org/abstract/document/10888332
- Modelo base XLSR: https://huggingface.co/facebook/wav2vec2-large-xlsr-53
- SpeechBrain: https://github.com/speechbrain/speechbrain
- CommonAccent (codigo y dataset): https://github.com/JuanPZuluaga/accent-recog-slt2022
- Paper CommonAccent (Interspeech 2023): https://arxiv.org/abs/2305.18283
