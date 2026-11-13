# Abdou/quran-asr-small

## Resumen

quran-asr-small es un modelo de reconocimiento automático de voz (ASR) especializado en recitación coránica, desarrollado por Abdeladim Fadheli (Abdou) y publicado bajo licencia MIT. Se distribuye como un modelo ONNX de 36 MB (int8) compatible con sherpa-onnx, lo que permite ejecutarlo de forma totalmente offline en dispositivos móviles Android e iOS sin conexión a red ni servidores externos. Con 33 millones de parámetros, transcribe el audio de la recitación a letras árabes en grafía uthmaní, cubriendo tanto a recitadores profesionales como a personas corrientes, en las lecturas Hafs y Warsh y en velocidades que van del tartil lento al hadr rápido.

El modelo es la variante "grande" de la familia, hermana de quran-asr-tiny, y está pensado para resolver un problema muy concreto: la verificación y transcripción de recitación coránica en aplicaciones móviles, donde el tamaño y el consumo energético son críticos. Para ello emplea una arquitectura Conformer-CTC compacta (9 bloques, dimensión 384, 6 cabezas de atención y subsampling ×4) con un vocabulario de salida de solo 31 tokens (letras árabes más separador de palabra), lo que reduce drásticamente el coste computacional frente a modelos ASR generalistas.

Su relevancia actual radica en la combinación de precisión y eficiencia: declara un 4,49% de WER y un 2,17% de CER en el benchmark Quran-Lab, quedando en segunda posición de 33 modelos en el leaderboard en el momento del envío, con un tamaño dos órdenes de magnitud inferior al de Whisper large-v3 (1,5B de parámetros). El modelo se acompaña de un paper publicado en Zenodo y de código de entrenamiento e inferencia abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer-CTC (9 bloques, d=384, 6 cabezas, subsampling ×4, InterCTC tras el bloque 5) |
| Parametros totales | 33M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo CTC; procesa fragmentos de audio, sin ventana de contexto declarada) |
| Tipos de cuantizacion | int8 (ONNX, 36 MB); el checkpoint original no se distribuye en otros formatos |
| Idiomas soportados | árabe (recitación coránica, grafía uthmaní; lecturas Hafs y Warsh) |
| Licencia | MIT (los datos de entrenamiento conservan sus propios términos; tlog: CC-BY-4.0) |
| Formato de pesos | ONNX (model.int8.onnx + tokens.txt), empaquetado para sherpa-onnx |
| Tamano del repositorio | 0,3 GB |
| Vocabulario de salida | 31 tokens (letras árabes + separador de palabra) |
| Entrada | audio; decodificación CTC greedy, sin modelo de lenguaje, sin léxico y sin pistas |

## Arquitectura y entrenamiento

El modelo es un Conformer-CTC puro: nueve bloques Conformer con dimensión de modelo 384 y seis cabezas de atención, con subsampling de factor ×4 en la entrada y una capa InterCTC insertada tras el bloque 5 durante el entrenamiento. La decodificación es CTC greedy, sin modelo de lenguaje externo, sin léxico y sin mecanismos de rescoring, lo que simplifica el despliegue y mantiene la latencia baja en dispositivo. La salida son letras árabes en grafía uthmaní más un separador de palabra; para obtener la ortografía estándar se aplica una tabla fija (`spelling.json`) que no altera palabras mal reconocidas.

El entrenamiento utilizó 1.532 horas de audio: 1.132 h de 36 recitadores Hafs de EveryAyah, 96 h de 3 recitadores Warsh, 283 h de grabaciones telefónicas de tarteel-ai/tlog (200 shards, etiquetas verificadas contra el audio) y 21 h de frases coránicas de Iqra'Eval (Iqra_train). Las personas corrientes constituyen el 30% de cada época. Se realizaron 343.000 pasos (20 épocas, ~33.000 h de audio vistas) en aproximadamente 37 horas sobre una GPU de portátil RTX 5070 Ti, con AdamW a 4e-4, scheduler coseno y bf16. Las aumentaciones incluyen variación de velocidad y tempo (×0,75 a ×2,5), ruido, reverberación, filtro paso bajo y SpecAugment. El checkpoint publicado corresponde al paso 310k, el de menor error de validación (0,84% CER). No se documenta en la información disponible el uso de RLHF ni DPO, algo esperable en un modelo CTC supervisado.

## Capacidades

- Reconocimiento de voz para recitación coránica en árabe, con salida en letras uthmaníes y opción de ortografía estándar.
- Cobertura de las lecturas Hafs y Warsh.
- Robustez ante distintas velocidades de recitación, desde tartil lento hasta hadr rápido (rango de tempo entrenado ×0,75 a ×2,5).
- Reconocimiento tanto de recitadores profesionales como de hablantes ordinarios (30% de cada época de entrenamiento).
- Ejecución totalmente offline en dispositivo mediante sherpa-onnx (Android, iOS y escritorio).
- Recuperación del ayah exacto con tashkeel mediante el script auxiliar `retrieve.py`, que hace matching difuso contra el texto del mushaf Hafs uthmaní y devuelve referencia (sura:aya), texto recitado y ayahs completas.
- Sin soporte declarado de tool calling, function calling, agentes, visión, audio de entrada más allá del ASR ni modo de razonamiento; es un modelo ASR puro.
- Capacidad multilingüe limitada al árabe; no se declaran otros idiomas.

## Casos de uso

- Aplicaciones móviles de memorización del Corán (hifz): el modelo transcribe la recitación del usuario en el propio teléfono, sin conexión, y permite comparar la salida con el texto esperado para detectar errores u omisiones; sus 36 MB int8 y su naturaleza on-device lo hacen viable en dispositivos de gama media.
- Verificación de recitación en tiempo real: al ser un CTC greedy sin modelo de lenguaje, la latencia es baja y el coste computacional mínimo, lo que permite feedback inmediato mientras el usuario recita.
- Corrección de tashkeel y recuperación del texto exacto: combinando la salida del modelo con `retrieve.py`, una aplicación puede mostrar el ayah completo con vocales y signos diacríticos a partir de la transcripción cruda, con una tasa de acierto declarada del 97% en clips de QUL y teléfono (99,5% si se pasa la posición aproximada).
- Herramientas de estudio para lectores de Warsh: el modelo cubre tres recitadores Warsh, lo que permite aplicaciones de aprendizaje para esta lectura minoritaria que los ASR generalistas no suelen soportar.
- Indexación y búsqueda de archivos de audio coránicos: transcripción por lotes de grabaciones (por ejemplo, de recitadores de EveryAyah o de un archivo personal) para generar índices buscables por sura y ayah.
- Evaluación automática de la calidad de recitación en plataformas educativas: el CER del 2,17% y el WER del 4,49% permiten puntuar recitaciones y detectar desviaciones sin intervención humana.
- Transcripción de grabaciones telefónicas de recitación: el modelo fue entrenado con 283 h de audio telefónico de tlog, por lo que es adecuado para audio de baja calidad capturado con micrófonos de móvil.

## Benchmarks y rendimiento

Resultados declarados por el autor en el benchmark Quran-Lab (score.py oficial, 600 clips), WER / CER en porcentaje:

| Modelo | Parametros | Overall | Phone | EveryAyah | QUL |
|---|---:|---|---|---|---|
| zipformer_p-arabic-v3 (retrieval) | 66M | 3,46 / 1,84 | 7,56 / 1,79 | 0,00 / 0,00 | 4,40 / 3,77 |
| **quran-asr-small (int8)** | **33M** | **4,49 / 2,17** | 10,45 / 2,84 | 0,69 / 0,20 | 4,61 / 3,80 |
| fastconformer-quran | 115M | 5,41 / 2,96 | 8,88 / 2,66 | 0,93 / 0,26 | 7,78 / 5,91 |
| NVIDIA FastConformer | 115M | 7,44 / 3,08 | 16,77 / 5,61 | 1,50 / 0,49 | 7,61 / 4,20 |
| Whisper large-v3 | 1,5B | 10,10 / 4,26 | 26,23 / 12,39 | 5,48 / 1,79 | 4,69 / 1,83 |

Datos adicionales declarados por el autor:

- Recitadores nunca vistos en entrenamiento (test propio de 1.000 clips): 0,30% CER y 0,46% WER.
- Salida cruda en grafía uthmaní sobre las referencias telefónicas (que son uthmaníes): 3,29 / 1,16.
- Mejor error de validación durante el entrenamiento: 0,84% CER (paso 310k).
- Posición en el leaderboard de Quran-Lab en el momento del envío: segunda de 33 modelos.
- `retrieve.py`: ayah correcto en el 97% de los clips de QUL y teléfono, en unos 10 ms por clip; 99,5% si se proporciona la posición aproximada.

Las métricas del model-index figuran como no verificadas (`verified: false`).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo int8 ocupa 36 MB en disco y su huella en memoria es mínima, por lo que puede ejecutarse en CPU.
- GPU recomendadas: no requiere GPU. Cualquier GPU moderna (RTX 4090, A100, H100) puede ejecutarlo, pero el despliegue típico es en CPU o NPU de móvil.
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles de gama media; el entrenamiento se realizó en una RTX 5070 Ti de portátil en ~37 h.
- Opciones de despliegue: sherpa-onnx (Android, iOS, escritorio y servidor), con el par `model.int8.onnx` + `tokens.txt`; el repositorio incluye `transcribe.py` para uso en Python con soundfile, numpy y scipy.
- Latencia y throughput: no se publican cifras de throughput; el matching de recuperación tarda unos 10 ms por clip. La decodificación CTC greedy sin modelo de lenguaje mantiene la latencia por debajo de los enfoques con rescoring, aunque no se dispone de valores concretos de RTF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER / CER (Quran-Lab) | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| quran-asr-small | 33M | no disponible (CTC) | 4,49 / 2,17 | MIT | ONNX para sherpa-onnx |
| zipformer_p-arabic-v3 (retrieval) | 66M | no disponible | 3,46 / 1,84 | no disponible | no disponible en la información |
| fastconformer-quran | 115M | no disponible | 5,41 / 2,96 | no disponible | no disponible en la información |
| NVIDIA FastConformer | 115M | no disponible | 7,44 / 3,08 | no disponible | no disponible en la información |
| Whisper large-v3 | 1,5B | 30 s por ventana (arquitectura encoder-decoder) | 10,10 / 4,26 | MIT (según OpenAI) | disponible en múltiples formatos |

La comparación relevante es de eficiencia: quran-asr-small obtiene mejor WER global que modelos 3,5 veces mayores (fastconformer-quran, 115M) y que Whisper large-v3 (1,5B, 45 veces más parámetros), a costa de un rendimiento inferior en clips telefónicos frente a zipformer_p-arabic-v3 y fastconformer-quran. Frente a Whisper, la ventaja es también de despliegue: 36 MB int8 frente a varios GB, y ejecución offline en móvil.

## Limitaciones y advertencias

- Es un modelo especializado exclusivamente en recitación coránica en árabe; no es un ASR generalista y su rendimiento fuera de este dominio no está documentado.
- La salida son letras uthmaníes sin tashkeel; para obtener el texto exacto con vocales es necesario el paso de recuperación (`retrieve.py`), que puede devolver un ayah distinto cuando el mismo texto aparece en varias posiciones del Corán (resuelto parcialmente con el parámetro `near`).
- La tabla de conversión a ortografía estándar (`spelling.json`) es fija y no corrige palabras mal reconocidas; solo normaliza la representación.
- El rendimiento en audio telefónico es notablemente peor que en audio limpio (10,45% WER en Phone frente a 0,69% en EveryAyah), por lo que en condiciones de ruido intenso la precisión cae.
- No se documentan sesgos sociales ni demográficos; el principal sesgo potencial es la cobertura desigual de recitadores (36 Hafs frente a 3 Warsh), lo que puede reducir la precisión en lecturas distintas de Hafs.
- Riesgo de alucinación: en un CTC sin modelo de lenguaje el riesgo es menor que en modelos generativos, pero puede producir letras o palabras incorrectas en pasajes difíciles, especialmente con recitadores no vistos.
- Licencia MIT para el modelo; los datos de entrenamiento conservan sus términos (tlog: CC-BY-4.0), lo que conviene revisar si se redistribuye el modelo o se usa comercialmente.
- Las métricas del model-index están marcadas como no verificadas por el autor.
- Una muestra del benchmark (36:71) resultó ser la misma grabación que una de entrenamiento, subida con otro identificador; el autor indica que se excluirá de futuros entrenamientos, pero el dato conviene tenerlo en cuenta al interpretar los resultados.
- No se dispone de información sobre el comportamiento del modelo con audio de muy baja calidad, acentos no árabes o recitación con errores deliberados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Abdou/quran-asr-small
- Modelo hermano (tiny): https://huggingface.co/Abdou/quran-asr-tiny
- Paper: https://zenodo.org/records/23761691
- DOI: https://doi.org/10.5281/zenodo.23761691
- Benchmark Quran-Lab: https://huggingface.co/datasets/Quran-Lab/quranic-asr-benchmark
- Leaderboard Quran-Lab: https://huggingface.co/spaces/Quran-Lab/quranic-asr-leaderboard
- Dataset tarteel-ai/tlog: https://huggingface.co/datasets/tarteel-ai/tlog
- Dataset Iqra'Eval (Iqra_train): https://huggingface.co/datasets/IqraEval/Iqra_train
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
