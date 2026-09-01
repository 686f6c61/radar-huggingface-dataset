# LIA-AvignonUniversity/SENSE

## Resumen

SENSE (Shared Embedding for N-lingual Speech and tExt) es un modelo de extracción de embeddings semánticos de habla multilingüe desarrollado por el Laboratoire Informatique d'Avignon (LIA). Su objetivo es alinear representaciones de audio y texto en un espacio semántico común a nivel de utterance, siguiendo un marco teacher-student inspirado en SAMU-XLSR y conceptualmente similar a los modelos SONAR de Meta AI. El modelo está entrenado sobre 90 lenguas del dataset Common Voice y se distribuye como parte del ecosistema SpeechBrain.

La arquitectura se basa en el encoder auto-supervisado `facebook/w2v-bert-2.0`, que actúa como componente de habla, y se alinea con las representaciones continuas independientes de la lengua de un encoder de texto. El resultado es un vector de 1024 dimensiones por utterance que captura el contenido semántico del audio, independientemente del idioma hablado. El repositorio ocupa 2.3 GB y el modelo se publica bajo licencia CC0-1.0, lo que facilita su uso en investigación y producción.

La relevancia actual de SENSE radica en ofrecer una alternativa open source a soluciones propietarias para tareas multilingües y multimodales como búsqueda semántica de audio, recuperación cross-modal habla-texto o clasificación de intenciones en asistentes de voz. Al estar integrado en SpeechBrain, su despliegue es directo y reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Teacher-student basada en `facebook/w2v-bert-2.0` (encoder de habla auto-supervisado) alineado con representaciones de texto |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (embeddings de utterance, no generacion de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 90 lenguas del dataset Common Voice (lista no especificada) |
| Licencia | CC0-1.0 (segun la pagina de HuggingFace; no indicada en la model card) |
| Formato de pesos | no disponible (checkpoints de SpeechBrain) |

## Arquitectura y entrenamiento

SENSE emplea un marco teacher-student en el que un encoder de habla auto-supervisado (el student) se entrena para imitar las representaciones continuas de un encoder de texto (el teacher) a nivel de utterance. El encoder de habla parte de `w2v-bert-2.0`, un modelo de Facebook que combina cuantizacion de tokens y objetivos BERT sobre audio de 16 kHz. El teacher es un encoder de texto que produce representaciones independientes de la lengua, de modo que el espacio resultante es compartido entre habla y texto.

El entrenamiento se realizo con SpeechBrain sobre datos multilingues de Common Voice, cubriendo 90 lenguas. No se especifican el numero exacto de tokens de entrenamiento ni si se aplicaron tecnicas adicionales como RLHF o DPO, ya que no es un modelo generativo sino de representacion. La innovacion principal es la alineacion semantica a nivel de utterance, que permite comparar directamente audio y texto en un mismo espacio vectorial, habilitando tareas cross-modal sin necesidad de modelos de traduccion intermedios.

## Capacidades

- Extraccion de embeddings semánticos de habla a nivel de utterance, con salida de 1024 dimensiones.
- Soporte multilingue real: entrenado en 90 lenguas, el modelo produce representaciones comparables entre idiomas.
- Alineacion habla-texto: los embeddings de audio y texto comparten el mismo espacio semantico, permitiendo busqueda y recuperacion cross-modal.
- Integracion con SpeechBrain: facil de usar mediante la interfaz `foreign_class` para inferencia en CPU o GPU.
- No es un modelo generativo: no genera texto ni audio, solo produce representaciones vectoriales.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso, al ser un encoder puro.

## Casos de uso

- Busqueda semantica de audio multilingue: indexar archivos de audio en 90 idiomas y recuperarlos mediante consultas de texto o audio. El espacio compartido permite comparar directamente una frase escrita con grabaciones habladas en cualquier lengua soportada.
- Clasificacion de intenciones en asistentes de voz: extraer el embedding de la utterance del usuario y compararlo con embeddings de intenciones predefinidas, sin necesidad de ASR ni modelos de lenguaje adicionales.
- Recuperacion cross-modal habla-texto: en sistemas de archivos o bibliotecas multimedia, buscar clips de audio a partir de descripciones textuales o viceversa, gracias a la alineacion semantica.
- Analisis de sentimiento en audio: entrenar un clasificador ligero sobre los embeddings de SENSE para detectar polaridad en grabaciones de voz, aprovechando la representacion semantica independiente del idioma.
- Sistemas de recomendacion de contenido hablado: generar embeddings de podcasts, audiolibros o noticias de radio y recomendar items similares por cercania coseno, funcionando en multiples lenguas.
- Evaluacion de calidad de ASR o TTS: comparar embeddings de habla sintetica y natural para medir similitud semantica, util en pipelines de desarrollo de sistemas de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo arXiv 2509.12093 describe el marco y el entrenamiento, pero no se incluyen tablas comparativas con otros modelos en los datos proporcionados.

## Requisitos de hardware

- No se dispone de datos oficiales sobre VRAM, latencia o throughput.
- El tamano del repositorio (2.3 GB) sugiere un modelo de cientos de millones de parametros, probablemente ejecutable en GPUs consumer como RTX 3060 o superiores, aunque sin confirmacion.
- La inferencia puede realizarse en CPU, pero sera mas lenta; se recomienda GPU para procesamiento por lotes o tiempo real.
- Despliegue mediante SpeechBrain: la interfaz `foreign_class` permite cargar el modelo y ejecutarlo con `run_opts={"device": "cuda:0"}`.
- No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.

## Comparativa con modelos similares

| Modelo | Enfoque | Idiomas | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SENSE (LIA) | Teacher-student, alineacion habla-texto | 90 (Common Voice) | no disponible (repo 2.3 GB) | CC0-1.0 | Open source, SpeechBrain |
| SONAR (Meta AI) | Teacher-student, alineacion habla-texto | 200+ | no disponible | no disponible | Open source (parcial) |
| SAMU-XLSR | Teacher-student, alineacion habla-texto | multilingue | no disponible | no disponible | Open source |

SENSE se posiciona como una alternativa open source a SONAR, con un alcance de lenguas menor (90 frente a 200+) pero con licencia CC0-1.0, lo que elimina restricciones de uso comercial. SAMU-XLSR es el marco inspirador, pero SENSE lo extiende con un encoder mas moderno (w2v-bert-2.0) y una cobertura linguistica amplia. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- No se especifican sesgos conocidos, pero al entrenarse sobre Common Voice, los resultados pueden verse afectados por los desequilibrios de hablantes, acentos y dominios presentes en ese dataset.
- Al ser un modelo de representacion, no genera texto ni audio, por lo que no aplica el riesgo de alucinacion tipico de los modelos generativos.
- La cobertura de 90 lenguas no implica un rendimiento uniforme; lenguas con menos datos en Common Voice probablemente tengan embeddings de menor calidad.
- La licencia CC0-1.0 (dominio publico) permite uso comercial sin restricciones, pero conviene verificar la licencia de los datos de entrenamiento (Common Voice es CC0, por lo que no hay conflicto).
- No se proporcionan detalles sobre la dimension del modelo ni el numero de parametros, lo que dificulta estimar con precision los requisitos de hardware.
- El modelo esta disenado para audio de 16 kHz; usar otras frecuencias de muestreo puede degradar la calidad de los embeddings.

## Enlaces

- HuggingFace: https://huggingface.co/LIA-AvignonUniversity/SENSE
- Articulo SENSE (arXiv 2509.12093): https://arxiv.org/abs/2509.12093
- Version HTML del articulo: https://arxiv.org/html/2509.12093v2
- Articulo SpeechBrain 1.0 (arXiv 2407.00463): https://arxiv.org/abs/2407.00463
- Receta de entrenamiento en SpeechBrain: https://github.com/speechbrain/speechbrain/tree/develop/recipes/CommonVoice/SENSE
- Web de SpeechBrain: https://speechbrain.github.io/
- Codigo de SpeechBrain: https://github.com/speechbrain/speechbrain/
- Perfil de LIA en HuggingFace: https://huggingface.co/LIA-AvignonUniversity
