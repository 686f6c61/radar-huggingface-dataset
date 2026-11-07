# hdae/karume-sbv2-jvnv

## Resumen

`hdae/karume-sbv2-jvnv` es una distribución de síntesis de voz (text-to-speech) en japonés que empaqueta cuatro voces del modelo Style-Bert-VITS2 JP-Extra (`jvnv-F1-jp`, `jvnv-F2-jp`, `jvnv-M1-jp`, `jvnv-M2-jp`) en el formato contenedor `.krm` del runtime de inferencia WebGPU Karume. Lo publica el usuario `hdae` como conversión no oficial de los pesos originales de `litagin/style_bert_vits2_jvnv` y del codificador de texto `ku-nlp/deberta-v2-large-japanese-char-wwm`. No es un modelo entrenado desde cero: no hay reentrenamiento ni ajuste fino, solo conversión de formato y cuantización de los pesos.

El problema que resuelve es la ejecución de TTS japonés de calidad dentro del navegador y en Deno sin dependencias nativas, aprovechando WebGPU. La cadena acústica se entrega como tres grafos fusionados: `text_encoder` (DeBERTa japonés a nivel de carácter), `front` (codificador de fonemas más predictores de duración) y `voice` (flow más decodificador HiFi-GAN). El estilo emocional y el hablante se resuelven en tiempo de ejecución mediante tablas de vectores de estilo y embeddings de hablante incluidas en el contenedor.

Es relevante para quienes necesitan TTS emocional japonés con licencia permisiva para uso comercial (CC BY-SA 4.0, sin cláusulas NonCommercial ni NoDerivatives) y despliegue ligero en cliente. El repositorio ocupa 4,6 GB e incluye cinco variantes de cuantización por voz, con `i8+bert4` como opción por defecto. La licencia share-alike obliga a licenciar cualquier obra derivada bajo CC BY-SA 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Style-Bert-VITS2 JP-Extra (version 2.0-JP-Extra): DeBERTa-v2-large japones como text encoder, encoder de fonemas con predictores de duracion, flow y decodificador HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; la entrada es texto analizado morfologicamente, no una ventana de contexto de LLM) |
| Tipos de cuantizacion | `f16+bert8`, `i8`, `i8-a8`, `i8+bert4`, `i4` (por defecto `i8+bert4`); en las variantes mixtas los pesos agrupables se guardan en `i4` y el resto en `i8` |
| Idiomas soportados | japones (unico idioma documentado; el campo de idiomas del repo figura como no disponible) |
| Licencia | CC BY-SA 4.0 (heredada del corpus JVNV y del text encoder) |
| Formato de pesos | Contenedor Karume `.krm` (secuencia de partes; la primera lleva el grafo y los descriptores de modelo), manifiesto `karume.json` (`karume/5`); no compatible con Style-Bert-VITS2 |
| Voces incluidas | `F1` (por defecto), `F2`, `M1`, `M2` |
| Estilos disponibles | Angry, Disgust, Fear, Happy, Neutral (por defecto), Sad, Surprise |
| Pipeline | `sbv2/1` |
| Version del exportador | `karume/0.13.0` |
| Tamano del repositorio | 4,6 GB |
| Libreria | `karume` |

## Arquitectura y entrenamiento

La arquitectura subyacente es Style-Bert-VITS2 en su variante JP-Extra, un sistema TTS de dos etapas. La primera etapa usa un DeBERTa-v2-large japonés con tokenización a nivel de carácter y whole-word masking (`ku-nlp/deberta-v2-large-japanese-char-wwm`) para producir representaciones contextuales del texto; la segunda integra un encoder de fonemas con predictores de duración, un módulo de flow y un decodificador HiFi-GAN que genera la forma de onda. El control de estilo se ejerce mediante vectores de estilo y pesos de estilo (`styleWeight`: 0 corresponde al estilo promedio, 1 al estilo nombrado), y el hablante se selecciona por embedding. La decodificación de duraciones es estocástica y parametrizable mediante `sdpRatio` (1 = duración estocástica, 0 = determinista), con ruido de muestreo controlado por `noiseScale` y `noiseScaleW`.

Los pesos originales se entrenaron sobre el corpus JVNV (Japanese Emotional Speech with Verbal Content and Nonverbal Expressions), descrito en arXiv:2310.06072 por Xin, Jiang, Takamichi, Saito, Aizawa y Saruwatari, y la implementación de entrenamiento es Style-Bert-VITS2 (AGPL-3.0). En esta distribución no hay entrenamiento ni ajuste fino: el autor declara explícitamente conversión de contenedor y cuantización de los pesos (voces en `f16`/`i8`/mixto, text encoder en `i8`/mixto). La innovación técnica del paquete es de despliegue, no de modelado: grafos fusionados en un contenedor único, tablas de estilo y hablante resueltas en tiempo de ejecución, y ejecución portable en navegador y Deno sobre WebGPU con semilla determinista (`seed: 42` produce la misma forma de onda con los mismos parámetros).

## Capacidades

- Síntesis de voz en japonés a partir de texto, con análisis morfológico y de acentos delegado al llamador mediante la librería `@hdae/yomi` (`analyzeWithWords` y `getDictionary`).
- Cuatro voces preentrenadas: dos femeninas (`F1`, `F2`) y dos masculinas (`M1`, `M2`), cada una con su propio conjunto de estilos.
- Control emocional por estilo: Angry, Disgust, Fear, Happy, Neutral, Sad y Surprise, con intensidad ajustable mediante `styleWeight`.
- Control fino de prosodia y entrega: `lengthScale` (velocidad), `sdpRatio` (duración estocástica frente a determinista), `noiseScale` y `noiseScaleW` (ruido de muestreo).
- Generación determinista y reproducible mediante semilla.
- Ejecución en navegador y en Deno sobre WebGPU, sin binarios nativos.
- Exportación de audio a WAV mediante `encodeWav` de `@karume/models`.
- No soporta tool calling, function calling, razonamiento multi-step, agentes, visión ni audio de entrada; es exclusivamente un modelo de texto a voz.

## Casos de uso

- Lectura por voz en aplicaciones web japonesas: el modelo se carga en el cliente vía WebGPU y sintetiza texto sin enviar datos a un servidor, lo que resulta adecuado para interfaces de accesibilidad y lectores de contenido en japonés.
- Asistentes conversacionales con matiz emocional: la selección de estilo entre siete emociones y el ajuste de `styleWeight` permiten modular la entrega según el contexto del diálogo (por ejemplo, `Happy` para confirmaciones y `Sad` para disculpas) sin cambiar de modelo.
- Doblaje y prototipado de contenido audiovisual: las cuatro voces y el control de `lengthScale` permiten generar locuciones de prueba para guiones y ajustar la duración al corte antes de contratar una locución humana.
- Audiolibros y contenido largo en japonés: la síntesis por segmentos con semilla fija facilita regenerar fragmentos concretos de forma reproducible cuando se corrige el texto de origen.
- Videojuegos y experiencias interactivas en navegador: al ejecutarse en Deno y en el navegador, encaja en clientes web y en backends ligeros sin dependencias de CUDA, con cuantización `i4` o `i8+bert4` para reducir el peso descargado.
- Generación de voces para pruebas de sistemas de reconocimiento de voz: el control determinista de duración y ruido permite crear conjuntos de audio sintético con variación controlada de prosodia y emoción.
- Aplicaciones de aprendizaje de japonés: la distinción de estilos y la variación de velocidad (`lengthScale`) permiten producir ejemplos de pronunciación con distintos registros emocionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio completo ocupa 4,6 GB e incluye cinco variantes de cuantización por voz, pero el tamaño de cada variante individual no está documentado en la información proporcionada.
- GPU recomendadas: no disponible. El requisito declarado del runtime es WebGPU, sin lista de GPU validadas.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; al ser un modelo TTS de tamaño moderado y con cuantización `i4` e `i8`, es plausible su ejecución en GPU de consumo, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: runtime Karume mediante `Pipeline.fromPretrained` de `jsr:@karume/models/sbv2`, en navegador y en Deno. No es compatible con Style-Bert-VITS2, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Recomendación operativa: fijar `revision` a un hash de commit completo para compilaciones reproducibles, ya que sin ella se sigue la rama `main` y una actualización futura del repositorio puede romper la aplicación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| `hdae/karume-sbv2-jvnv` | no disponible | no aplica (TTS) | japones | CC BY-SA 4.0 | Contenedor `.krm`, runtime Karume, WebGPU (navegador y Deno) |
| `litagin/style_bert_vits2_jvnv` (origen de las voces) | no disponible | no aplica (TTS) | japones | CC BY-SA 4.0 | Checkpoints Style-Bert-VITS2; requiere la implementación original |
| `ku-nlp/deberta-v2-large-japanese-char-wwm` (text encoder) | no disponible (large) | no disponible | japones | CC BY-SA 4.0 | safetensors para transformers; solo encoder de texto, no genera audio |

La comparación relevante es de empaquetado y portabilidad: frente al repositorio de origen, esta distribución no añade calidad ni capacidades nuevas, pero elimina la dependencia de la implementación Python original y habilita la inferencia en cliente. No se dispone de datos de benchmarks que permitan comparar calidad de audio con alternativas.

## Limitaciones y advertencias

- Solo japonés: el texto de entrada debe analizarse con `@hdae/yomi` para obtener lecturas y acentos; no se documenta soporte para otros idiomas.
- No es compatible con Style-Bert-VITS2: el contenedor `.krm` incluye el grafo embebido y no puede cargarse con la implementación original, lo que limita la interoperabilidad con herramientas del ecosistema.
- Conversión no oficial: el autor declara no estar afiliado ni respaldado por `litagin` ni por `ku-nlp`; no hay validación independiente de la fidelidad de las cuantizaciones respecto a los pesos originales.
- Riesgo de artefactos por cuantización: las variantes `i4` y `i8+bert4` degradan la precisión de los pesos; no se publican métricas de calidad de audio (MOS u objetivas) que cuantifiquen esa pérdida.
- Licencia share-alike: CC BY-SA 4.0 permite uso comercial y modificación, pero obliga a citar autoría, nombrar la fuente y la URL de la licencia, indicar que los pesos fueron convertidos y cuantizados, y licenciar cualquier obra derivada bajo CC BY-SA 4.0.
- La implementación de entrenamiento original (Style-Bert-VITS2) es AGPL-3.0; el autor afirma que Karume es una implementación separada que no contiene el código original, pero conviene revisar la implicación de licencias si se redistribuye en un producto.
- Sin métricas de rendimiento publicadas: no hay datos de latencia ni throughput en WebGPU, lo que impide dimensionar despliegues en producción sin pruebas propias.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin señales de adopción ni mantenimiento por parte de la comunidad.
- Fijar siempre `revision` a un hash de commit: el manifiesto (`karume/5`) y el esquema de nombres pueden cambiar entre versiones del exportador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hdae/karume-sbv2-jvnv
- Pesos de origen (voces): https://huggingface.co/litagin/style_bert_vits2_jvnv
- Text encoder: https://huggingface.co/ku-nlp/deberta-v2-large-japanese-char-wwm
- Implementación de entrenamiento Style-Bert-VITS2: https://github.com/litagin02/Style-Bert-VITS2
- Paper del corpus JVNV: https://arxiv.org/abs/2310.06072
- Página del corpus JVNV: https://sites.google.com/site/shinnosuketakamichi/research-topics/jvnv_corpus
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Otro modelo del mismo autor: https://huggingface.co/hdae/karume-anima
