# KittenML/kitten-tts-2

# KittenTTS 2: ficha técnica del modelo de síntesis de voz con clonación en contexto

## Resumen

KittenTTS 2 es un modelo de lenguaje de voz de 1.733.487.616 parámetros (1,73 mil millones) desarrollado por KittenML. No genera texto, sino que lee texto y escribe tokens del códec S3, que un decodificador en dos etapas convierte en audio a 24 kHz. Su rasgo diferencial es la clonación de voz en contexto: a partir de 5-30 segundos de audio de un único hablante, el modelo reproduce esa voz sin reentrenamiento.

El cuerpo lineal del modelo usa pesos ternarios (cada valor es exactamente uno de {-escala, 0, +escala} en grupos de 128 anchos), empaquetados a 1,6 bits por peso. Eso permite tres variantes de pesos del mismo modelo: `packed` (954 MB, sin pérdida), `emb4` (469 MB, con embedding de 4 bits y pérdida leve) y `full` (3.469 MB en bf16). El repositorio incluye además el modelo de embeddings de hablante, 47 voces de referencia, los decodificadores y pesos GGUF para CPU.

Es relevante ahora porque combina un tamaño moderado (1,73B) con despliegue en CPU sin GPU, licencia comunitaria, cobertura multilingüe mediante voces dedicadas y controles de expresión (emoción, eventos vocales y énfasis) que hasta hace poco requerían modelos propietarios. La longitud de contexto del modelo de lenguaje no está publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de voz (transformer) que genera tokens del códec S3 + decodificador de audio en dos etapas y vocoder; cabezal de hablante `spk_proj` |
| Parámetros totales | 1.733.487.616 (1,73B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Ternaria 1,58 bits (cuerpo `packed`), TL2 con embedding de 4 bits (`emb4`), bf16 (`full`), GGUF para llama.cpp, decodificador empaquetado a 4 u 8 bits |
| Idiomas soportados | Inglés por defecto; mediante voces dedicadas: árabe, chino, francés, alemán, hindi, italiano, portugués, ruso y español. Lista completa no disponible |
| Licencia | Stellon Labs Community License (`license: other`) |
| Formato de pesos | SafeTensors (bf16 y ternaria empaquetada) y GGUF |
| Frecuencia de muestreo de salida | 24 kHz |
| Voces integradas | 47 (8 compartidas con KittenTTS 0.8: Bella, Jasper, Luna, Bruno, Rosie, Hugo, Kiki y Leo) |
| Tamaño del repositorio | 7,2 GB (la carga descarga 947 MiB: 910 MiB del LM y 37 MiB del decodificador) |
| Descargas / likes en HuggingFace | 2.158 / 17 |
| Fecha de creación / actualización | 30/09/2026 / 05/10/2026 |

## Arquitectura y entrenamiento

KittenTTS 2 es un modelo de lenguaje de voz: recibe texto y emite tokens del códec S3, que después se decodifican en dos etapas hasta audio PCM de 24 kHz. El cuerpo transformer emplea pesos ternarios: dentro de cada grupo de 128 pesos, cada valor es exactamente `-escala`, `0` o `+escala`, con la escala conservada a precisión completa. El empaquetado guarda cinco trits por byte (1,6 bits por peso) y es exacto, no aproximado, por lo que `lm/model-ternary.safetensors` (0,95 GB) y `lm/model.safetensors` (3,47 GB en bf16) producen audio bit a bit idéntico. El archivo `config.json` apunta `lm_packed` al archivo pequeño, que es el que se descarga por defecto. El embedding de tokens (324M parámetros) no es ternario: en `packed` se mantiene en bf16, y en `emb4` se reduce a 4 bits con un error relativo L2 de 0,118 frente a bf16 y un coste aproximado de una décima de punto de perplejidad en evaluaciones internas.

El repositorio incluye además un modelo de embeddings de hablante (usado al clonar), clips de referencia con sus transcripciones y embeddings precalculados, y dos decodificadores: el `default` (459 MB, mejor calidad) y el `student_w4` (39 MB, estudiante destilado de un solo paso con pesos a 4 bits). La cuantización del decodificador reduce almacenamiento y ancho de banda de memoria, no coste aritmético. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO; la model card solo indica que las veinte etiquetas de expresión reconocidas son las más frecuentes entre las muchas presentes en los datos de entrenamiento.

## Capacidades

- Síntesis de voz a partir de texto con salida de audio a 24 kHz.
- Clonación de voz en contexto a partir de 5-30 segundos de audio de un único hablante, sin ajuste fino.
- 47 voces integradas, de las cuales 8 mantienen compatibilidad con KittenTTS 0.8.
- Multilingüe mediante voces nombradas por idioma: árabe, chino, francés, alemán, hindi, italiano, portugués, ruso y español (el acento lo aporta la voz seleccionada).
- Control de expresión en fase beta: una etiqueta inicial de emoción entre diez (`[angry]`, `[contemplative]`, `[excited]`, `[joyful]`, `[mundane]`, `[nervous]`, `[sad]`, `[stern]`, `[surprised]`, `[tender]`).
- Eventos vocales en línea entre diez etiquetas (`<gasp>`, `<giggle>`, `<growl>`, `<gulp>`, `<laugh>`, `<pause>`, `<scoff>`, `<sigh>`, `<sob>`, `<um>`).
- Énfasis mediante tramos entre triple paréntesis: `(((palabra)))`.
- Presets de decodificación, incluido `preset="expressive"`.
- Ejecución en CPU sin GPU, con detección automática de dispositivo, y pesos GGUF para el fork de llama.cpp.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada más allá del clip de referencia para clonación.

## Casos de uso

- Audiolibros y narración larga: el modelo permite alternar entre 47 voces y aplicar etiquetas de emoción por línea, de modo que un capítulo se puede narrar con cambios de tono controlados sin intervención manual en cada frase.
- Doblaje y localización de contenido: las voces nombradas por idioma (alemán, francés, español, etc.) permiten generar la misma pieza en varias lenguas, y la clonación mantiene la identidad del hablante original a partir de un clip de 5-30 segundos.
- Asistentes de voz y accesibilidad: al funcionar en CPU y caber en configuraciones sin GPU, se puede integrar en lectores de pantalla, lectores de documentos o interfaces de voz para personas con discapacidad visual desplegadas en hardware modesto.
- Atención al cliente automatizada: una voz de marca clonada una sola vez puede generar avisos, confirmaciones y respuestas dinámicas con consistencia de timbre, incluidos saludos y disculpas con matiz emocional (`[tender]`, `[nervous]`).
- Producción de pódcast y vídeo: los eventos vocales (`<laugh>`, `<sigh>`, `<pause>`) y el énfasis con triple paréntesis permiten generar tomas expresivas para inserts, cuñas o contenido de redes sin grabar locución.
- Material educativo y e-learning: narración multilingüe de cursos con `normalize=False` para lenguas distintas del inglés, evitando que el normalizador inglés deforme cifras y fechas.
- Prototipado offline y entornos aislados: todo lo necesario está en el repositorio, sin necesidad de inicio de sesión en Hugging Face, lo que facilita su uso en máquinas sin acceso a Internet o en pipelines de CI que generan avisos de audio.
- Pruebas de concepto de interfaces conversacionales: la variante `student_w4` de 39 MB permite iterar rápido en desarrollo y reservar el decodificador `default` para la versión final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una medida interna: la variante `emb4` pierde aproximadamente una décima de punto de perplejidad respecto a bf16 en evaluaciones internas, con un error relativo L2 de 0,118 en el embedding. No hay cifras de MMLU, HumanEval, GSM8K ni de métricas específicas de TTS como MOS, WER o similitud de hablante.

## Requisitos de hardware

- Tamaño de pesos: variante `packed` 954 MB, `emb4` 469 MB, `full` 3.469 MB; decodificador `default` 459 MB y `student_w4` 39 MB. La carga por defecto descarga 947 MiB (910 MiB de LM + 37 MiB de decodificador).
- VRAM estimada en inferencia (estimación derivada de los tamaños de archivo publicados, no confirmada por el autor): en torno a 2 GB con `packed` más decodificador `default`; alrededor de 0,6-1 GB con `emb4` más `student_w4`; en torno a 4-5 GB con `full` en bf16.
- GPU recomendadas: no disponibles. Por tamaño, cualquier GPU consumer con 4 GB o más de memoria debería alojar las variantes cuantizadas.
- CPU: funciona sin GPU con detección automática de dispositivo; la vía más rápida en CPU es el fork de llama.cpp `kitten-tts-2-cpp`, cuyos pesos GGUF (modelo de lenguaje y decodificadores) están en el directorio `cpp/` del repositorio.
- Opciones de despliegue: librería `kittenml` (instalable con `pip install kittenml`), carga directa con `transformers` usando el archivo bf16 completo, y llama.cpp mediante el fork específico. No se documentan integraciones con vLLM, TGI, Ollama ni otros servidores de inferencia.
- Latencia y throughput: no disponibles.
- Entorno: Python 3.10 o superior y PyTorch.

## Comparativa con modelos similares

No se dispone de datos comparativos de otros modelos de texto a voz con clonación de voz en la información proporcionada. Como alternativas de la misma categoría podrían considerarse sistemas como XTTS-v2, Kokoro o F5-TTS, pero sus especificaciones no figuran en la documentación consultada.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| KittenTTS 2 | 1,73B | No disponible | Inglés y 9 lenguas mediante voces dedicadas | Stellon Labs Community License | SafeTensors, GGUF |
| XTTS-v2 | No disponible | No disponible | No disponible | No disponible | No disponible |
| Kokoro | No disponible | No disponible | No disponible | No disponible | No disponible |
| F5-TTS | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia comunitaria: la model card indica que la investigación, el uso no comercial y el uso comercial limitado son gratuitos, pero el texto está truncado y las condiciones exactas están en `LICENSE.md`; conviene revisarlo antes de un despliegue comercial.
- El normalizador de texto está ajustado al inglés y deforma números y fechas en otras lenguas; para texto no inglés hay que pasar `normalize=False`.
- Solo se reconocen veinte etiquetas de expresión (diez emociones y diez eventos vocales). Otras etiquetas presentes en el entrenamiento, como `[reverent]`, se leen como texto normal.
- Las veinte etiquetas reconocidas se procesan siempre como marcado, de modo que un texto literal que contenga esas cadenas (por ejemplo un `<pause>` o un `[sad]` dentro de una cita) activará el control de expresión en lugar de leerse tal cual.
- El control emocional está marcado como beta: orienta la interpretación en lugar de garantizarla, y el efecto varía según la voz y la frase.
- La clonación de voz exige entre 5 y 30 segundos de audio de un único hablante; la calidad fuera de ese rango no está documentada.
- Riesgo de uso indebido para suplantación de identidad o generación de audio engañoso; no se documentan mecanismos de marca de agua ni de detección.
- En síntesis de voz, los fallos del modelo se manifiestan como pronunciación incorrecta, omisiones, prosodia anómala o artefactos de audio; no se publican tasas de error ni evaluaciones de robustez.
- La variante `emb4` es la única con pérdida: introduce error en el embedding (L2 relativo 0,118) y una décima de punto de perplejidad; la variante `packed` es exacta.
- La cuantización del decodificador reduce fidelidad, no latencia, porque no disminuye el coste aritmético.
- No hay información publicada sobre sesgos por acento, variedad dialectal, género o edad de las voces.
- No se documentan la longitud de contexto del modelo de lenguaje ni los límites de longitud de texto por generación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KittenML/kitten-tts-2
- Licencia (Stellon Labs Community License): https://huggingface.co/KittenML/kitten-tts-2/blob/main/LICENSE.md
- Fork de llama.cpp para CPU: https://github.com/KittenML/kitten-tts-2-cpp
- Librería de inferencia (PyPI): `pip install kittenml`
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante al modelo; los resultados devueltos no guardan relación con KittenTTS 2.
