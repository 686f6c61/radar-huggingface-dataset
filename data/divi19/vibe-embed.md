# Divi19/vibe-embed

## Resumen

vibe-embed v1.2 es un sistema de embeddings multimodales audio-texto orientado a la recuperación de música por descripción semántica y por similitud de "vibras". Lo desarrolla el usuario Divi19 y se distribuye bajo licencia Apache-2.0. El modelo resuelve el problema de buscar canciones mediante lenguaje natural ("cafetería en un domingo lluvioso", "alegre pero melancólico, sin voces") o localizar temas con un perfil sonoro similar a otro, proyectando audio y texto en un mismo espacio vectorial de 512 dimensiones.

La arquitectura es un sistema de dos torres: por el lado del audio emplea EfficientAT mn20_as (35 MB en 8 bits, 72 MB en precisión completa), que procesa ventanas de 10 segundos a 32 kHz mono y promedia los vectores resultantes; por el lado del texto utiliza Qwen3-Embedding-0.6B con una capa adicional entrenada (818 MB en 8 bits, 2396 MB en precisión completa). El conjunto se distribuye en formato ONNX, lo que permite ejecución en CPU y despliegue en dispositivos de bajos recursos como una Raspberry Pi.

Su relevancia actual radica en que ofrece un rendimiento cercano al de modelos mucho mayores (Omni de 7B parámetros) con un coste computacional mínimo y una licencia permisiva, además de un conjunto de datos de evaluación abierto (vibebench) y un plugin listo para integrarse en el servidor de música autoalojado AudioMuse-AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de dos torres: EfficientAT mn20_as (audio) + Qwen3-Embedding-0.6B con capa entrenada (texto) |
| Parametros totales | no disponible (el modelo base de texto es Qwen3-Embedding-0.6B; el codificador de audio no publica recuento de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens para los textos de busqueda; audio en ventanas de 10 s (se conserva una ultima ventana de al menos 2 s) |
| Tipos de cuantizacion | 8 bits (int8) y precision completa (float) |
| Idiomas soportados | Ingles, espanol, aleman, frances, portugues de Brasil y japones |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`audio_encoder_int8.onnx`, `audio_encoder.onnx`, `text_encoder_int8.onnx`, `text_encoder.onnx` con fichero `.data`) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de destilación desde un profesor compuesto por LCO-Omni-7B y LoRA con e5-omni-7B (2 x 7B, no publicado). El estudiante es un sistema de dos torres: EfficientAT mn20_as para audio, que produce embeddings a partir de ventanas de 10 segundos a 32 kHz mono (los vectores de ventana se promedian y normalizan), y Qwen3-Embedding-0.6B para texto, al que se añade una capa pequeña entrenada. Ambos flujos convergen en un espacio vectorial compartido de 512 dimensiones, lo que permite comparar directamente audio y texto mediante similitud coseno.

El preprocesado exacto está documentado en `config.json`: audio a 32 kHz mono con ventanas de 10 s, padding por la izquierda para textos y un prompt de instrucción específico para las búsquedas. El entrenamiento se realizó exclusivamente sobre música con licencias CC0, CC BY y de dominio público, con cada canción acreditada en `CREDITS.csv`. Los textos de entrenamiento se tradujeron a los seis idiomas soportados. El repositorio incluye `parity.json` con salidas de referencia para que los cargadores verifiquen la corrección de la inferencia.

## Capacidades

- Generación de embeddings de audio en un espacio vectorial de 512 dimensiones, con ventanas de 10 segundos a 32 kHz mono.
- Generación de embeddings de texto para búsquedas semánticas de música (máximo 256 tokens).
- Recuperación texto-a-audio: buscar canciones por descripción de ambiente, estado de ánimo o características sonoras.
- Recuperación audio-a-audio: encontrar canciones con una "vibra" similar a una pista de referencia.
- Soporte multilingüe en las búsquedas: inglés, español, alemán, francés, portugués de Brasil y japonés.
- Inferencia en CPU gracias al formato ONNX y a la cuantización int8, apta para dispositivos de bajos recursos (Raspberry Pi).
- Integración directa con AudioMuse-AI mediante plugin de indexación local de bibliotecas musicales.
- No dispone de tool calling, capacidades de agente ni generación de texto libre: es un modelo exclusivamente de extracción de características.

## Casos de uso

- Búsqueda semántica en bibliotecas musicales personales: indexar una colección local con los embeddings de audio y permitir consultas en lenguaje natural ("algo para un viaje nocturno largo"), aprovechando el espacio vectorial compartido entre texto y audio.
- Organización automática por ambiente o estado de ánimo: agrupar canciones por similitud de embedding para generar listas de reproducción temáticas sin metadatos manuales.
- Recomendación por similitud sonora: dado un tema de referencia, calcular su vector de audio y recuperar las pistas más cercanas por similitud coseno, útil en sistemas de descubrimiento musical.
- Integración en servidores de música autoalojados: el plugin de AudioMuse-AI indexa la biblioteca en la propia máquina del usuario, sin enviar audio a servicios externos.
- Despliegue en dispositivos de borde: con 35 MB para el codificador de audio en int8 y ejecución en CPU, es viable en una Raspberry Pi para búsqueda local de bajo consumo.
- Filtrado y catalogación de archivos de audio: procesar lotes de pistas para etiquetarlas por características semánticas antes de incorporarlas a un catálogo.
- Búsqueda multilingüe en catálogos internacionales: formular consultas en español, francés, alemán, portugués o japonés contra una misma biblioteca indexada.

## Benchmarks y rendimiento

Resultados medidos por el autor con el mismo código para todos los modelos. IncompeBench: 500 búsquedas escritas sobre 1574 canciones con licencias permisivas, nDCG@10 x 100. Song Describer: un pie de foto por grabación, recall@10.

| Modelo | Tamano | Licencia | IncompeBench lenient | IncompeBench strict | Song Describer R@10 |
|---|---|---|---|---|---|
| vibe-embed v1.2, ficheros int8 (este repo) | 35 MB audio + 818 MB busqueda | Apache-2.0 | 71.8 | no disponible | 47.1 |
| vibe-embed v1.2, precision completa | 72 MB + 2396 MB | Apache-2.0 | 72.0 | no disponible | 47.1 |
| Profesor (LCO-Omni-7B + LoRA con e5-omni-7B, no publicado) | 2 x 7B | no disponible | 79.2 | no disponible | 58.8 |
| DCLAP (modelo actual de AudioMuse-AI) | no disponible | AGPL-3.0 | 56.2 | 46.5 | 30.8 |
| LAION-CLAP music + speech | no disponible | Apache-2.0 | 53.3 | 44.0 | 31.7 |
| PE-AV large | no disponible | Apache-2.0 | 55.9 | 47.8 | 48.6 |
| PE-AV base | no disponible | Apache-2.0 | 50.7 | 42.6 | 46.4 |
| PE-AV small | no disponible | Apache-2.0 | 52.8 | 44.6 | 47.8 |
| LCO-Embedding-Omni-7B | no disponible | Apache-2.0 | 76.9 | 68.2 | 41.9 |
| e5-omni-7B | no disponible | MIT | 74.4 | 65.3 | 53.0 |

Resultados publicados en la página de IncompeBench de Mixedbread (probados en marzo de 2026, no remedidos por el autor):

| Modelo | IncompeBench lenient | IncompeBench strict |
|---|---|---|
| Mixedbread (Wholembed V3, solo API) | 77.3 | 65.1 |
| Gemini Embedding 2 (solo API) | 72.5 | 64.0 |
| CLaMP 3 | 70.4 | 57.9 |
| ColQwen-Omni | 65.4 | 51.4 |
| TTMR++ | 64.5 | 50.2 |

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el codificador de audio int8 ocupa 35 MB y el de texto int8 818 MB en memoria, ejecutables en CPU.
- En precisión completa, el codificador de texto ocupa 2396 MB y el de audio 72 MB.
- GPU recomendadas: no se especifican; el modelo está diseñado para inferencia en CPU. Cualquier GPU moderna puede acelerar la ejecución mediante ONNX Runtime, pero no se publican requisitos concretos.
- Cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU dedicada, como una Raspberry Pi.
- Opciones de despliegue: ONNX Runtime (versión ≥ 1.28 para el fichero de búsqueda en 8 bits), con dependencias de numpy y tokenizers; integración mediante el plugin de AudioMuse-AI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | IncompeBench lenient | Song Describer R@10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| vibe-embed v1.2 | 0.6B (texto) + codificador de audio | 256 tokens (texto); ventanas de 10 s (audio) | 71.8 | 47.1 | Apache-2.0 | ONNX en Hugging Face |
| LCO-Embedding-Omni-7B | 7B | no disponible | 76.9 | 41.9 | Apache-2.0 | Hugging Face |
| e5-omni-7B | 7B | no disponible | 74.4 | 53.0 | MIT | Hugging Face |
| PE-AV large | no disponible | no disponible | 55.9 | 48.6 | Apache-2.0 | Hugging Face |
| DCLAP | no disponible | no disponible | 56.2 | 30.8 | AGPL-3.0 | Hugging Face |

vibe-embed v1.2 ofrece un rendimiento en IncompeBench cercano al de modelos de 7B parámetros (71.8 frente a 76.9 y 74.4) con un coste de memoria muy inferior y licencia permisiva, aunque queda por debajo en Song Describer recall@10 frente a e5-omni-7B (47.1 frente a 53.0).

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con música de licencias permisivas (CC0, CC BY y dominio público), lo que puede reducir la cobertura de géneros o estilos poco representados en ese corpus.
- Los textos de entrenamiento se tradujeron automáticamente a los seis idiomas soportados; la calidad en idiomas distintos del inglés puede variar y los resultados por idioma se documentan en `results/languages.md`.
- Solo procesa audio a 32 kHz mono en ventanas de 10 segundos; el audio con otras frecuencias o canales requiere preprocesado previo.
- El contexto de texto está limitado a 256 tokens, insuficiente para descripciones muy largas.
- No es un modelo generativo: no produce texto, respuestas ni razonamiento; únicamente genera embeddings.
- Riesgo de alucinación no aplica en el sentido habitual, pero la recuperación puede devolver resultados poco relevantes para consultas ambiguas o fuera de la distribución de entrenamiento.
- No se publican datos sobre sesgos demográficos o culturales en la recuperación musical.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo base Qwen3-Embedding-0.6B debe verificarse por separado para confirmar que su licencia es compatible con el uso previsto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de un proyecto reciente sin validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Divi19/vibe-embed
- Demo: https://huggingface.co/spaces/Divi19/vibe-search
- Dataset de evaluación vibebench: https://huggingface.co/datasets/Divi19/vibebench
- Página de IncompeBench de Mixedbread: https://www.mixedbread.com/evals/incompebench
- Modelo base de texto: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
