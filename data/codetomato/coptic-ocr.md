# codetomato/coptic-ocr

## Resumen

Coptic OCR es un pipeline de reconocimiento óptico de caracteres (OCR) y transcripción manuscrita (HTR) especializado en textos coptos en dialecto saidico. Lo desarrolla el usuario codetomato y se distribuye en Hugging Face bajo licencia CC-BY-4.0. El modelo resuelve un problema muy concreto: leer automáticamente páginas completas de manuscritos coptos, principalmente del Monasterio Blanco (Vaticano, Borg. copt. 109), y también texto saidico impreso.

El sistema no es un único modelo neuronal, sino una cadena de tres componentes: un segmentador de líneas basado en Kraken BLLA afinado sobre páginas del corpus SCAM con orden de lectura consciente de columnas, un reconocedor CTC compuesto por una ResNet-50 truncada tras la capa layer3 y una BiLSTM de dos capas con 512 unidades, y un modelo de lenguaje de caracteres de 5-gramas entrenado con texto de Coptic Scriptorium que se aplica mediante shallow fusion durante la búsqueda por haces del decodificador CTC.

Su relevancia actual reside en que supera las líneas base publicadas en el paper de SCAM a nivel de línea (CER oficial de 11,52 frente a 13,91 de CRNN y 14,99 de TrOCR-L), aunque no alcanza a VAN, que procesa párrafos completos. El repositorio ocupa 0,1 GB y la inferencia de una página tarda aproximadamente 2 segundos en una GPU de portátil, lo que lo hace viable para digitalización masiva de fondos coptos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline OCR/HTR: segmentador Kraken BLLA + reconocedor CRNN (ResNet-50 truncada tras layer3 + BiLSTM de 2 capas y 512 unidades) con CTC + modelo de lenguaje de caracteres de 5-gramas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo image-to-text por líneas, no autoregresivo sobre texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantización publicada) |
| Idiomas soportados | cop (copto, dialecto saidico) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (reconocedor y segmentador) y pickle de diccionarios Python (modelo de lenguaje de 5-gramas) |

## Arquitectura y entrenamiento

El reconocedor es una red neuronal convolucional recurrente (CRNN) con salida CTC. La parte convolucional es una ResNet-50 preentrenada en ImageNet y truncada tras la capa layer3; la parte recurrente es una BiLSTM de dos capas con 512 unidades. La decodificación se realiza por búsqueda de haces CTC con fusión superficial de un modelo de lenguaje de caracteres de 5-gramas (α=0,35, β=0,5, haz de 12), entrenado sobre texto de Coptic Scriptorium. El segmentador de líneas es un Kraken BLLA afinado sobre páginas de SCAM, con orden de lectura que tiene en cuenta las columnas. Se distribuyen dos variantes del reconocedor: `recognizer.safetensors` (run E17s1, ResNet-50, la predeterminada) y `recognizer_manuscript.safetensors` (run E10a, ResNet-34 afinada solo con líneas gold).

El entrenamiento combina cuatro fuentes: las transcripciones gold a nivel de línea del corpus SCAM (solo el split de entrenamiento; validación para seleccionar el modelo y test puntuado una sola vez), unas 22.000 líneas autoetiquetadas de otras hojas del Borg. copt. 109 procedentes de digitalizaciones de la Biblioteca Vaticana (conservadas solo si superaban un filtro estricto de acuerdo, excluyendo los fascículos reservados para evaluación), líneas sintéticas renderizadas con fuentes coptas a partir de texto de Coptic Scriptorium, y el Nuevo Testamento saidico impreso de Horner (dominio público) con líneas alineadas a la edición. La variante predeterminada incorpora además simulación de show-through (transparencia del reverso). Las imágenes de entrenamiento no se incluyen en el repositorio.

## Capacidades

- Reconocimiento de texto copto saidico a partir de fotografías o escaneos de páginas completas, con salida de una línea de texto por línea detectada y en orden de lectura.
- Segmentación automática de líneas con Kraken BLLA y ordenación consciente de columnas (diseñada para una o dos columnas de texto).
- Reconocimiento directo de recortes de línea individual mediante el flag `--lines`.
- Decodificación con modelo de lenguaje integrado (shallow fusion) o decodificación greedy sin modelo de lenguaje mediante `--no-lm`.
- Generación de una imagen superpuesta con las cajas de detección mediante `--overlay`.
- Manejo razonable de texto saidico impreso, además de manuscritos.
- Ejecución en CPU o CUDA.
- No soporta tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking; es exclusivamente un transcriptor de imagen a texto.

## Casos de uso

- Digitalización masiva de fondos coptos: el pipeline procesa páginas completas de manuscritos del Monasterio Blanco en aproximadamente 2 segundos por página en una GPU de portátil, lo que permite transcribir lotes de cientos de hojas en horas y generar texto buscable para catálogos.
- Creación de corpus textuales para investigación: las transcripciones en orden de lectura y con convenciones de SCAM (minúsculas con marcas combinantes) pueden alimentar estudios lingüísticos del saidico y comparaciones entre manuscritos.
- Indexación y búsqueda en bibliotecas digitales: al convertir imágenes de manuscritos en texto, se habilita la búsqueda por pasaje o por palabra sobre colecciones que antes solo eran consultables visualmente.
- Transcripción asistida de ediciones impresas: la variante predeterminada obtiene un CER de 18,11 frente a la edición de Horner del Evangelio de Lucas saidico, lo que la hace útil para digitalizar texto impreso con revisión humana posterior.
- Anotación previa para paleógrafos: el modelo genera una primera transcripción que el investigador corrige, reduciendo el tiempo de lectura manual de líneas dañadas o de escritura difícil.
- Procesamiento de recortes de línea ya segmentados: con `--lines` se puede integrar en flujos donde la segmentación la realiza otra herramienta o donde se trabaja con fragmentos aislados.
- Comparación de variantes del reconocedor: el flag `--rec` permite elegir entre la variante general (mejor en impreso) y la variante de manuscrito (ligeramente mejor en páginas completas de test), adaptando el pipeline al material concreto.

## Benchmarks y rendimiento

| Benchmark | E17s1 (predeterminada) | E10a (manuscrito) |
|---|---|---|
| SCAM-A test lines, CER oficial | 11,52 | 11,99 |
| SCAM-A test lines, ignorando espacios | 8,01 | 8,50 |
| SCAM-A test, páginas completas (segmentación automática) | 7,04 | 6,69 |
| 35 hojas reservadas de escribas no vistos, CER de letras frente a la Biblia saidica* | 10,99 | 10,98 |
| Impreso: Lucas saidico de Horner, CER de letras frente a la edición* | 18,11 | 30,62 |

\* Estas páginas no tienen transcripción gold; las letras de cada página se comparan con el pasaje correspondiente de una edición impresa, ignorando diacríticos, puntuación y espacios. Las diferencias ortográficas reales entre el escriba y la edición cuentan como errores, por lo que estas cifras sobrestiman la tasa de error real y sirven para comparar modelos, no como precisión absoluta.

Resultados publicados en las mismas líneas de test de SCAM-A: VAN 7,50, CRNN 13,91, TrOCR-L 14,99 (paper de SCAM). El modelo supera las líneas base a nivel de línea del paper, pero no iguala a VAN, que lee párrafos completos de una vez.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por la arquitectura (ResNet-50 truncada más BiLSTM de 512 unidades) el consumo es bajo y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con CUDA; el autor indica que una página tarda unos 2 segundos en una GPU de portátil.
- Cabe en GPU de consumo: sí, y también funciona en CPU.
- Opciones de despliegue: scripts propios del repositorio (`scripts/transcribe.py` como punto de entrada), con dependencias torch, torchvision, kraken 7.2, pillow, numpy y safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a esta arquitectura.
- Latencia y throughput: aproximadamente 2 segundos por página en GPU de portátil; el resto de cifras no están disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | CER en líneas SCAM-A | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Coptic OCR (E17s1) | CRNN + LM de 5-gramas | 11,52 | Línea a línea con segmentación previa | CC-BY-4.0 | Hugging Face (codetomato/coptic-ocr) |
| VAN | Modelo de párrafo completo | 7,50 | Lee párrafos enteros de una vez | no disponible | no disponible |
| CRNN | CRNN | 13,91 | Línea a línea | no disponible | no disponible |
| TrOCR-L | Transformer encoder-decoder | 14,99 | Línea a línea | no disponible | no disponible |

## Limitaciones y advertencias

- Solo saidico: el modelo se entrenó con saidico, mayoritariamente con el estilo de un único scriptorio; el bohairico, otros dialectos y manos muy distintas rendirán peor.
- El daño perjudica el reconocimiento: los errores se concentran en líneas dañadas (transparencia del reverso, roturas, notas marginales).
- Diseños de página simples: espera una o dos columnas de texto; ornamentos, marginalia y maquetaciones complejas pueden dividirse en líneas incorrectas u ordenarse mal.
- Las convenciones de salida siguen la transcripción de SCAM: letras minúsculas con marcas combinantes (trazo superlineal, puntos, diéresis) y espacios como división de palabras, lo que exige postprocesado si se necesita otro formato.
- Riesgo de alucinación inherente a la decodificación con modelo de lenguaje: la fusión superficial puede corregir hacia formas léxicamente plausibles que no coinciden con el original, especialmente en líneas dañadas.
- Las cifras de las hojas de escribas no vistos y del impreso de Horner no se comparan contra gold y sobrestiman el error real.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero las imágenes de los manuscritos utilizadas en el entrenamiento son © Biblioteca Apostolica Vaticana y no se incluyen en el repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/codetomato/coptic-ocr
- Dataset SCAM: https://huggingface.co/datasets/blowing-up-groundhogs/scam
- Paper de SCAM: https://arxiv.org/abs/2606.15987
- Corpus de Coptic Scriptorium: https://github.com/CopticScriptorium/corpora
