# OmgItsAmmer/urdu-nastaliq-ocr-qwen3vl-2b-GGUF

## Resumen

El modelo `urdu-nastaliq-ocr-qwen3vl-2b-GGUF` es un ajuste fino mediante LoRA del modelo multimodal Qwen3-VL-2B-Instruct, especializado en el reconocimiento óptico de caracteres (OCR) de texto en urdu escrito en la variante caligráfica Nastaliq. Lo desarrolla el usuario de Hugging Face OmgItsAmmer y se distribuye en formato GGUF para su ejecución con llama.cpp, lo que permite inferencia completamente local sobre CPU, sin conexión a internet ni claves de API. El repositorio incluye tanto los pesos cuantizados del modelo de lenguaje como el proyector visual (mmproj) necesario para procesar imágenes.

El problema que aborda es concreto: el urdu lo leen unos 230 millones de personas y se escribe mayoritariamente en Nastaliq, una grafía en la que las letras se enlazan y las palabras descienden en diagonal hacia la izquierda. Esa geometría rompe las herramientas de OCR convencionales, como Tesseract, y también hace fallar al modelo base Qwen3-VL-2B, que tiende a entrar en bucles de generación hasta agotar el límite de tokens. El ajuste busca un modelo pequeño, barato y local que realice una única tarea con precisión suficiente para documentos privados.

La relevancia actual reside en que demuestra que un modelo de 2B de parámetros, ajustado con LoRA sobre datos sintéticos y reales cuidadosamente preparados, puede superar a alternativas específicas de OCR en urdu y ejecutarse en hardware de consumo. El repositorio ocupa 4,0 GB e incluye cuantizaciones Q8_0 (1,83 GB) y Q4_K_M (1,11 GB) junto con el proyector visual en f16 (0,82 GB) y el adaptador LoRA (0,20 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) Qwen3-VL-2B-Instruct con adaptador LoRA r=32 / alpha=64 sobre todas las capas lineales (lenguaje y vision) |
| Parametros totales | 1.720.574.976 (modelo base, segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens configurados en el ejemplo de llama-server; entrenamiento con longitud maxima de 2.560 tokens |
| Tipos de cuantizacion | Q8_0 (1,83 GB) y Q4_K_M (1,11 GB); proyector visual en f16 (0,82 GB) |
| Idiomas soportados | urdu (ur) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) y safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-2B-Instruct, un transformer multimodal que procesa imágenes en parches de 32 píxeles y las combina con el modelo de lenguaje para generar texto. Sobre esa base se aplicó un ajuste LoRA con rango 32 y alpha 64 en todas las capas lineales, tanto del codificador visual como del modelo de lenguaje, en precisión bf16, con batches empaquetados por presupuesto de tokens y longitud máxima de 2.560 tokens. El entrenamiento se realizó en tres rondas sucesivas sobre una única RTX 3090: la v1 (82.670 ejemplos, 5,4 h, 18,0 GB de VRAM máxima) con líneas sintéticas de Nastaliq en una tipografía, páginas de noticias y escritura manual de tableta; la v2 (22.366 ejemplos, 2,6 h, 17,8 GB) re-renderizó los mismos datos como fotografías, con escritura sobre papel rayado y páginas multilínea; y la v3 (25.569 ejemplos, 1,9 h, 11,4 GB) añadió una segunda tipografía, Noto Nastaliq Urdu (OFL), en forma de líneas y páginas. La pérdida de evaluación final de la v3 fue de 0,127 frente a 0,146 de la v2.

Dos hallazgos técnicos guiaron el proceso. El primero es el tamaño de letra: como Qwen-VL lee imágenes en parches de 32 píxeles, las letras de Nastaliq en imágenes pequeñas resultan ilegibles; ampliar la imagen hasta que las letras midan unos 48 píxeles de alto redujo el CER de una página tipográfica de 13 líneas del 163 % (con bucle repetitivo) a aproximadamente el 12 %, y en una foto de escritura manual de cuaderno del 54 % al 8 %, sin entrenamiento adicional. El segundo es que aproximadamente un tercio de las líneas sintéticas de origen estaban erosionadas, con fragmentos de letras ausentes pero etiquetas completas, lo que enseñaba al modelo a adivinar palabras; las páginas de la v2 y la v3 solo conservan líneas con tinta sólida. Los datos de entrenamiento proceden de fuentes con licencia abierta (PuristanLabs1/urdu-ocr-1M, oddadmix Qaari 0.1, OUHD-L con CC BY 4.0 y Noto Nastaliq Urdu con SIL OFL 1.1), y el conjunto de evaluación de un libro de 1908 nunca se usó para entrenar.

## Capacidades

- Reconocimiento óptico de caracteres en urdu Nastaliq sobre imágenes de texto impreso, líneas sueltas, páginas completas y escritura manual.
- Procesamiento de imágenes en formato image-text-to-text mediante el proyector visual incluido (mmproj-f16).
- Generación de texto en escritura urdu respetando palabras y puntuación originales.
- Ejecución completamente local en CPU con llama.cpp, sin conexión ni servicios externos.
- Limpieza de salida integrada: colapsa palabras repetidas cuatro o más veces seguidas y caracteres repetidos treinta o más veces, sin alterar textos de referencia normales (0 de 651 textos modificados).
- Compatibilidad con endpoints compatibles con la API de OpenAI (`/v1/chat/completions`) a través de llama-server.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, audio ni visión general más allá del OCR.

## Casos de uso

- Digitalización de documentos privados en urdu: el modelo se ejecuta íntegramente en local sobre CPU, de modo que contratos, cartas o expedientes personales nunca salen del dispositivo, algo crítico para datos sensibles.
- Procesamiento por lotes de archivos escaneados: con llama-server y el prompt fijo de OCR a temperatura 0, se puede automatizar la extracción de texto de colecciones de páginas tipográficas, aceptando latencias de unos 31 s por página de 1 a 5 líneas impresas en CPU.
- Reconocimiento de escritura manual en cuadernos: la v2 se entrenó específicamente con fotos de escritura sobre papel rayado, lo que permite transcribir apuntes y libretas de estudiantes o investigadores con una tasa de error medida del 8 % en una muestra de prueba.
- Preservación de patrimonio impreso antiguo: el conjunto de evaluación de un libro de 1908 (nunca usado en entrenamiento) permite validar la robustez frente a tipografías envejecidas y ampliar la digitalización de fondos históricos en urdu.
- Aplicaciones móviles o de escritorio sin conectividad: al caber la cuantización Q4_K_M en 1,11 GB y requerir 5,6 GB de RAM en pico, es viable integrarlo en entornos con recursos limitados o sin red.
- Investigación en OCR de lenguas de bajos recursos: el repositorio incluye configuraciones, el adaptador LoRA y una aplicación web de comparación (`make demo`), lo que facilita reproducir el ajuste y comparar con Tesseract o Qaari 0.1.
- Verificación y control de calidad de digitalizaciones: la limpieza de repeticiones y la salida restringida a texto urdu simplifican la integración en pipelines de revisión posteriores.

## Benchmarks y rendimiento

La model card no presenta una tabla formal de benchmarks estandarizados (MMLU, HumanEval, GSM8K), pero sí incluye mediciones de tasa de error de caracteres (CER) sobre muestras propias y latencias medidas en CPU:

| Medicion | Resultado |
|---|---|
| CER en pagina tipografica de 13 lineas (imagen ampliada a ~48 px de altura de letra) | ~12 % (frente a 163 % con bucle repetitivo en imagen pequena) |
| CER en foto de escritura manual de cuaderno | 8 % (frente a 54 % en imagen pequena) |
| Perdida de evaluacion final v3 | 0,127 (v2: 0,146) |
| RAM en pico (Q8_0 y Q4_K_M) | 5,6 GB |
| Latencia, una linea manuscrita (CPU, 8 hilos) | ~3,5 s (Q8_0) / ~2,7 s (Q4_K_M) |
| Latencia, 1-5 lineas impresas (CPU, 8 hilos) | ~31 s (Q8_0) / ~24 s (Q4_K_M) |

El autor afirma que el modelo supera a Tesseract 5 con el modelo `urd`, al Qwen3-VL-2B base (que entra en bucles) y al modelo Qaari 0.1 en sus pruebas, aunque no se detallan en la información disponible los valores completos de esas comparaciones.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia documentada se realizó solo en CPU. En GPU, el modelo completo en Q8_0 más el proyector f16 ocupa aproximadamente 2,65 GB de memoria.
- RAM en pico: 5,6 GB tanto para Q8_0 como para Q4_K_M.
- CPU de referencia: Intel i7-13700KF con 8 hilos, una petición a la vez.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 4 GB de VRAM podría alojarlo, aunque no hay datos de rendimiento en GPU publicados.
- Cabe en GPU de consumo: sí, por tamaño (Q4_K_M de 1,11 GB más mmproj de 0,82 GB), aunque las cifras publicadas son de CPU.
- Opciones de despliegue: llama.cpp mediante `llama-server` con `--mmproj` y `-ngl 0`; el repositorio incluye una aplicación web de comparación (`make demo`). No se documentan otras opciones como vLLM, Ollama o TGI.
- Latencia y throughput: ~3,5 s por línea manuscrita y ~31 s por página de 1 a 5 líneas impresas en Q8_0 sobre la CPU indicada; el throughput en GPU no está disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| urdu-nastaliq-ocr-qwen3vl-2b (este) | 1,72 B | 8.192 tokens configurados | OCR urdu Nastaliq, GGUF para CPU | Apache 2.0 | Hugging Face |
| Qwen3-VL-2B-Instruct (base) | 1,72 B | no disponible en la informacion | Vision-lenguaje general | Apache 2.0 | Hugging Face |
| Qaari 0.1 Urdu OCR VL 2B Instruct | ~2 B | no disponible en la informacion | OCR urdu | no disponible en la informacion | Hugging Face |
| Tesseract 5 con modelo `urd` | no aplica (motor clasico) | no aplica | OCR urdu | Apache 2.0 | Open source |

Según las pruebas del autor, este modelo supera a Tesseract 5, al Qwen3-VL-2B base (que no se detiene y supera el 100 % de error en páginas) y a Qaari 0.1 (que falla en fotos distintas de sus fuentes de entrenamiento y sobreescribe en páginas tipográficas). No se dispone de cifras completas de esos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especializado exclusivamente en urdu Nastaliq; no debe esperarse buen rendimiento en otros idiomas o alfabetos, ni en árabe o persa aunque compartan escritura.
- Riesgo de alucinación y bucles: el modelo base ya mostraba tendencia a repetir hasta el límite de tokens; aunque el ajuste lo mitiga, se recomienda temperatura 0 y `repeat_penalty` 1.05, y la limpieza de repeticiones es un parche, no una garantía.
- Dependencia del tamaño de letra: si las letras miden menos de unos 48 píxeles de alto, el CER se dispara; es necesario ampliar las imágenes antes de la inferencia.
- El entrenamiento con líneas sintéticas erosionadas enseñó al modelo a adivinar palabras; aunque las páginas de v2 y v3 lo corrigen, persiste el riesgo en entradas de baja calidad.
- Los datos de escritura manual provienen de una única fuente (OUHD-L, 311 escritores) y los tipográficos de dos fuentes; la generalización a otras caligrafías o imprentas no está validada.
- El conjunto de evaluación de 1908 es pequeño y solo de evaluación; no hay benchmarks estandarizados publicados.
- Licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento incluyen OUHD-L con CC BY 4.0, que exige atribución; conviene revisar las obligaciones de crédito indicadas por el autor.
- El rendimiento medido es solo en CPU y con una petición simultánea; no hay datos de concurrencia ni de throughput en GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OmgItsAmmer/urdu-nastaliq-ocr-qwen3vl-2b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Dataset PuristanLabs1/urdu-ocr-1M: https://huggingface.co/datasets/PuristanLabs1/urdu-ocr-1M
- Dataset oddadmix Qaari 0.1 news: https://huggingface.co/datasets/oddadmix/qaari-0.1-ocr-urdu-news-dataset-small
- Dataset OUHD-L handwriting (DOI 10.5281/zenodo.20642162): https://huggingface.co/datasets/saad2002/ouhd-l-online-urdu-nastaliq-handwriting
- Tipografia Noto Nastaliq Urdu: https://fonts.google.com/noto/specimen/Noto+Nastaliq+Urdu
- Muestra de evaluacion libro de 1908: https://huggingface.co/datasets/vettedlance/urdu-nastaliq-1908-eval-sample
- Baseline Qaari 0.1: https://huggingface.co/oddadmix/Qaari-0.1-Urdu-OCR-VL-2B-Instruct
