# laion/clap2-small-audioxl-s1B

## Resumen

CLAP2-S es un modelo contrastivo audio-texto desarrollado por LAION, la organizacion sin animo de lucro alemana que publica datasets y modelos abiertos para investigacion. Forma parte de la familia CLAP2, compuesta por cinco variantes de entre 27M y 340M parametros, y mapea clips de audio y texto en ingles a un espacio de embeddings compartido. Este repositorio concreto corresponde al tamano S, con 103,9M de parametros totales entre las dos torres (audio y texto).

El modelo resuelve tareas de recuperacion audio-texto, clasificacion zero-shot de audio y extraccion de embeddings de audio para clasificadores downstream. Su torre de audio es un vision transformer NaFlex que opera sobre parches de espectrograma log-mel y acepta audio de cualquier duracion sin recorte ni padding a una longitud fija, lo que simplifica el preprocesado en produccion.

Es relevante porque ofrece una alternativa abierta (licencia Apache 2.0) y de bajo coste computacional dentro del ecosistema OpenCLIP, con pesos en safetensors, integracion nativa en `open_clip_torch` y resultados publicados en los benchmarks MAEB-30, HEAR-17 y MSEB. El modelo se entreno desde cero sobre LAION-Audio-XL, un corpus de 366M de pares audio-texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Contrastiva de dos torres: vision transformer NaFlex sobre parches log-mel (audio) + torre de texto tipo transformer con tokenizador BPE estilo GPT-2 |
| Parametros totales | 103.896.960 (103,9M, ambas torres) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Audio: sin limite fijo, entrenado con clips de hasta 30 s (buckets de 6,9 / 9,0 / 13,0 / 22,6 / 30,1 s); texto: 256 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en float32; el entrenamiento uso autocast bf16) |
| Idiomas soportados | Ingles (solo texto en ingles; el corpus contiene habla en varios idiomas, pero el texto es exclusivamente ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato OpenCLIP / Transformers) |

## Arquitectura y entrenamiento

CLAP2-S sigue una arquitectura contrastiva de dos torres. La torre de audio es un vision transformer NaFlex que procesa parches no solapados de 16x16 extraidos de un espectrograma log-mel de 128 bins (50 Hz a 16 kHz, hop de 320 muestras), lo que produce 50 tokens por segundo de audio. El front end remuestrea a 32 kHz y promedia multicanal a mono. La torre de texto emplea un tokenizador BPE estilo GPT-2 con contexto de 256 tokens. Ambas torres proyectan a un espacio de embeddings compartido entrenado con objetivo contrastivo.

El entrenamiento se realizo desde cero sobre LAION-Audio-XL (366M de pares audio-texto) durante 1.024M de muestras vistas, con schedule de learning rate WSD y checkpoint final. No se menciona en la informacion disponible el uso de RLHF ni DPO, algo coherente con un modelo contrastivo de embeddings. La innovacion tecnica destacable es el procesado NaFlex: el modelo acepta audio de cualquier duracion y numero de canales sin recorte ni padding fijo, y en batching usa `patch_valid` para enmascarar el padding, garantizando embeddings identicos a los de la codificacion individual. El coste crece de forma cuadratica con la longitud por el uso de atencion completa.

## Capacidades

- Generacion de embeddings de audio y de texto normalizados en un espacio compartido (`encode_audio`, `encode_text`).
- Clasificacion zero-shot de audio mediante comparacion de similitudes audio-texto.
- Recuperacion audio-texto (audio-to-text y text-to-audio).
- Extraccion de caracteristicas de audio para clasificadores downstream.
- Procesado de audio de duracion variable sin recorte ni padding a longitud fija.
- Acepta cualquier frecuencia de muestreo y cualquier numero de canales en la entrada.
- Soporte de batching con clips de distinta duracion mediante padding enmascarado.
- Capacidad multilingue de audio no soportada en texto: la torre de texto es solo ingles.
- No dispone de tool calling, function calling ni capacidades de agente o razonamiento multi-paso; no es un modelo generativo.

## Casos de uso

- Curacion y filtrado de datasets de audio: el modelo permite ordenar o filtrar grandes colecciones de audio por consultas de texto en ingles, aprovechando su bajo coste (103,9M de parametros) para procesar volumenes altos.
- Etiquetado zero-shot de audios sin entrenamiento especifico: describiendo cada clase con varias frases cortas en ingles y promediando sus embeddings, se obtiene un clasificador sin anotaciones.
- Recuperacion audio-texto en buscadores de archivos sonoros: indexar los embeddings de audio de una fonoteca y recuperar por consulta textual.
- Deteccion de eventos sonoros en pipelines de monitorizacion: segmentar grabaciones largas en tramos de hasta 30 s y comparar sus embeddings con descripciones de eventos de interes.
- Preprocesado para clasificadores downstream: usar los embeddings de audio como caracteristicas de entrada a modelos ligeros de clasificacion, evitando entrenar un extractor desde cero.
- Moderacion o auditoria de contenido audiovisual: puntuar clips frente a descripciones textuales de categorias para priorizar revision humana.
- Experimentacion academica en representaciones audio-texto: al ser Apache 2.0 y estar integrado en OpenCLIP, sirve como baseline reproducible frente a otros modelos contrastivos.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes, mayor es mejor):

| Modelo | Parametros | MAEB-30 | HEAR-17 | MSEB |
|---|---|---|---|---|
| CLAP2-L | 340,1M | 53,6 | 81,9 | 30,3 |
| CLAP2-M | 152,8M | 52,3 | 81,4 | 29,4 |
| CLAP2-S (este modelo) | 103,9M | 51,8 | 81,8 | 29,8 |
| CLAP2-XS | 48,3M | 49,1 | 80,6 | 27,6 |
| CLAP2-XXS | 27,3M | 46,2 | 79,1 | 28,0 |

MAEB-30 es la media sobre 30 tareas del Massive Audio Embedding Benchmark (habla, musica y sonido; clasificacion, zero-shot, pair classification, clustering y recuperacion). HEAR-17 es la media sobre 17 tareas HEAR (todas excepto Beehive y Maestro 5h). MSEB es la media sobre 62 puntuaciones MSEB en ingles. Las puntuaciones usan solo los primeros 30 s de cada clip. No se han publicado en la informacion disponible resultados de benchmarks frente a modelos de otros autores.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en float32 ocupa aproximadamente 0,42 GB de pesos (103,9M de parametros); con activaciones y batching, el consumo real es de pocos GB.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; el modelo esta pensado para ser barato de ejecutar.
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) e incluso en CPU para lotes pequenos.
- Opciones de despliegue: `open_clip_torch` (>= 4.2.1) es la via oficial; el modelo tambien se distribuye en formato Transformers. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de embeddings contrastivo.
- Latencia y throughput: no disponibles en la informacion proporcionada. El coste computacional crece de forma cuadratica con la duracion del audio por el uso de atencion completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | MAEB-30 | HEAR-17 | MSEB | Licencia |
|---|---|---|---|---|---|---|
| CLAP2-S (este) | 103,9M | Sin limite fijo, entrenado hasta 30 s | 51,8 | 81,8 | 29,8 | Apache 2.0 |
| CLAP2-M | 152,8M | Sin limite fijo, entrenado hasta 30 s | 52,3 | 81,4 | 29,4 | Apache 2.0 |
| CLAP2-XS | 48,3M | Sin limite fijo, entrenado hasta 30 s | 49,1 | 80,6 | 27,6 | Apache 2.0 |
| CLAP2-XXS | 27,3M | Sin limite fijo, entrenado hasta 30 s | 46,2 | 79,1 | 28,0 | Apache 2.0 |

La comparativa con modelos de otros autores (por ejemplo, CLAP original de LAION o modelos audio-texto de terceros) no esta disponible en la informacion proporcionada; el paper referencia comparaciones adicionales con otros modelos audio-texto.

## Limitaciones y advertencias

- La torre de texto solo acepta ingles; el rendimiento con texto en otros idiomas no esta soportado.
- El tokenizador distingue mayusculas y minusculas: el texto todo en mayusculas se tokeniza en piezas raras y empeora las puntuaciones. Conviene normalizar a minusculas cuando el texto este integramente en mayusculas y tenga al menos tres palabras.
- Riesgo de alucinacion en el sentido de falsos positivos en clasificacion zero-shot: las similitudes pueden favorecer clases mal descritas; la model card recomienda usar varias frases por clase, evitar etiquetas desnudas y negaciones, promediar embeddings por clase y restar la puntuacion media de cada clase sobre los clips.
- Aunque el modelo acepta audio de cualquier duracion, solo se entreno y evaluo con clips de hasta 30 s; para grabaciones largas hay que segmentar y agregar los embeddings.
- El coste crece de forma cuadratica con la longitud del audio por la atencion completa.
- No es un modelo generativo: no produce texto, codigo ni razonamiento; su uso se limita a embeddings, recuperacion y clasificacion.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del corpus de entrenamiento LAION-Audio-XL si se redistribuyen derivados.
- No se han publicado en la informacion disponible datos sobre sesgos especificos del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/laion/clap2-small-audioxl-s1B
- Paper: https://arxiv.org/abs/2611.11592
- Codigo: https://github.com/LAION-AI/clap2
- Pagina del proyecto: https://projects.laion.ai/clap2/
- Modelo CLAP2-L: https://huggingface.co/laion/clap2-large-audioxl-s1B
- Modelo CLAP2-M: https://huggingface.co/laion/clap2-medium-audioxl-s1B
- Modelo CLAP2-XS: https://huggingface.co/laion/clap2-xs-audioxl-s1B
- Modelo CLAP2-XXS: https://huggingface.co/laion/clap2-xxs-audioxl-s1B
- Web de LAION: https://laion.ai/
- Organizacion LAION en GitHub: https://github.com/LAION-AI
