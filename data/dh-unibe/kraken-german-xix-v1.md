# dh-unibe/kraken-german-xix-v1

## Resumen

kraken-german-xix-v1 es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) desarrollado por dh-unibe (Digital Humanities de la Universitat de Berna) y entrenado con la herramienta `training-atr-models`. No es un modelo de lenguaje: es un modelo de visión entrenado específicamente para transcribir documentos manuscritos alemanes del siglo XIX, en particular escritura *Kurrent* y actas parlamentarias y gubernamentales suizas.

El modelo se distribuye en formato kraken y se integra en el ecosistema de la librería homónima (kraken/ketos), orientada a la transcripción de patrimonio documental. Los pesos publicados corresponden al mejor checkpoint de validación de la ejecución, no a la última época de entrenamiento, lo que se traduce en una mayor calidad de transcripción.

Su relevancia radica en la digitalización masiva de fondos archivísticos históricos: ofrece un CER del 11,18 % sobre un conjunto de test independiente de actas del Consejo Federal suizo (1848-1903), un resultado útil para proyectos de humanidades digitales que necesitan transcripción asistida a escala de miles de páginas. La licencia MIT facilita su reutilización, incluido uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional y recurrente para HTR (formato kraken; especificación de capas: `[256,64,0,1 Cr4,2,8,4,2 Cr4,2,32,1,...]`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa líneas de texto, no secuencias de contexto largo) |
| Tipos de cuantizacion | no disponible (pesos kraken/CoreML; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | alemán (manuscrito histórico del siglo XIX; *Kurrent* y escritura administrativa) |
| Licencia | MIT |
| Formato de pesos | kraken (modelo nativo de la librería kraken); tag `coreml` en el repositorio |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura típica de los modelos HTR de kraken: una red convolucional que extrae características de la imagen de la línea de texto seguida de una capa recurrente (LSTM/GRU) y una capa de salida CTC para la decodificación de la secuencia de caracteres. La especificación de capas recogida en la model card (`Cr4,2,8,4,2` y `Cr4,2,32,1`) indica bloques convolucionales con filtros de 8 y 32 canales sobre la entrada de 256 píxeles de altura y 64 de anchura. No se detalla el número total de parámetros ni la composición exacta de la capa recurrente.

El entrenamiento se realizó sobre cuatro corpus de dh-unibe: actas del Regierungsrat de Zúrich (`image-text_zh-regierungsratsprotokolle`, tope de 8.000 páginas), manuscritos en Kurrent del siglo XIX (`image-text_kurrent-xix`, tope de 19.808 páginas), actas de los servicios parlamentarios (`image-text_parlamentsdienste-protokolle`, 138 páginas) y actas de la Asamblea Federal unida (`image-text_nr-sr-vereinigte-bundesversammlung-xix`, 52 páginas). El material resultante asciende a 15.527 páginas y 405.955 líneas transcritas. Cada corpus define sus propios conjuntos de validación (proyectos retenidos o partición a nivel de página con `partition=0.9`, `seed=42`). No se documenta el uso de RLHF ni de técnicas de ajuste por preferencias, algo esperable en un modelo de transcripción.

## Capacidades

- Transcripción de texto manuscrito alemán del siglo XIX, con especial cobertura de escritura *Kurrent* y de documentos administrativos y parlamentarios.
- Reconocimiento a nivel de línea de texto sobre imágenes de documentos históricos.
- Salida de texto plano alineada con la imagen de entrada mediante decodificación CTC.
- Funcionamiento como modelo de *pipeline* `image-to-text` dentro del ecosistema kraken.
- Integración con flujos de segmentación de página y línea de kraken (segmentación previa a la transcripción).
- No soporta *tool calling*, ni razonamiento multi-paso, ni generación de texto libre: su única tarea es la transcripción de imágenes.
- Capacidades multilingües: no disponible; el modelo está orientado al alemán histórico.
- No dispone de modo *thinking*, visión general, audio ni otras capacidades multimodales más allá de la lectura de imágenes de texto.

## Casos de uso

- Digitalización de actas parlamentarias históricas: el modelo transcribe líneas de los protocolos del Consejo Federal y de la Asamblea Federal suiza del siglo XIX, lo que permite generar índices y textos buscables de fondos archivísticos completos a partir de imágenes escaneadas.
- Proyectos de humanidades digitales con corpus en Kurrent: investigadores que trabajan con manuscritos alemanes del XIX pueden aplicar el modelo a colecciones como diarios, protocolos y correspondencia, reduciendo el esfuerzo de transcripción manual a la revisión del CER del 11,18 %.
- Creación de corpus lingüísticos históricos: la transcripción a escala de miles de páginas posibilita la construcción de corpus anotados para estudios de lingüística histórica del alemán, con la ventaja de una licencia MIT que no restringe la publicación de los derivados.
- Enriquecimiento de catálogos archivísticos: transcripción automática de las primeras páginas o de los registros de un fondo para generar metadatos y resúmenes que mejoren la descubribilidad en portales de archivo.
- Flujos de transcripción asistida con revisión humana: el modelo actúa como primera pasada sobre lotes de imágenes y los transcriptores corrigen únicamente los errores, lo que reduce el coste por página frente a la transcripción desde cero.
- Investigación sobre HTR histórico: el modelo sirve como línea base reproducible (checkpoint de validación y conjuntos de evaluación documentados) para comparar arquitecturas y estrategias de entrenamiento en reconocimiento de escritura histórica alemana.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| CER (benchmark) | 11,18 % |
| WER (benchmark) | 39,62 % |
| Caracteres evaluados (benchmark) | 116.143 |
| CER (split de validación propio) | 3,12 % |
| WER (split de validación propio) | 13,72 % |
| Caracteres evaluados (split) | 1.813.372 |
| Errores de carácter (split) | 56.519 |

El benchmark se midió sobre el conjunto de test *Federal Council minutes 1848-1903* (doi:10.5281/zenodo.4746342), con 2.751 líneas de documentos retenidos y no vistos durante el entrenamiento. El resultado del split corresponde a la validación interna de la propia ejecución, un conjunto distinto del benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB, lo que sugiere un modelo de tamaño reducido que probablemente cabe en GPU de gama baja, pero no se documentan cifras.
- GPU recomendadas: no disponible. Por el tamaño del repositorio, es plausible su ejecución en GPU consumer (por ejemplo, RTX 3060 o superiores), aunque el autor no lo confirma.
- Ejecución en CPU: kraken puede ejecutarse en CPU para lotes pequeños; no se documentan latencias.
- Opciones de despliegue: librería kraken (con modelos en formato nativo) y, según el tag del repositorio, exportación a CoreML para inferencia en hardware Apple.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. Como referencia cualitativa, el ecosistema kraken alberga otros modelos HTR para escritura histórica alemana y europea (por ejemplo, modelos entrenados sobre corpus de la *Berlin-Brandenburgische Akademie* o del proyecto *Transkribus*), pero no se han facilitado sus métricas ni especificaciones para establecer una comparación numérica fiable.

| Modelo | Parametros | Contexto | CER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kraken-german-xix-v1 | no disponible | no aplica | 11,18 % (benchmark) | MIT | Hugging Face |
| Alternativas kraken para alemán histórico | no disponible | no aplica | no disponible | variable | Hugging Face / Transkribus |
| Modelos HTR de Transkribus | no disponible | no aplica | no disponible | propietaria | Plataforma Transkribus |

## Limitaciones y advertencias

- El modelo está especializado en alemán manuscrito del siglo XIX; su rendimiento fuera de ese dominio (otras lenguas, otras épocas, escritura impresa) no está documentado y probablemente sea deficiente.
- El WER del 39,62 % en el benchmark es elevado: la salida requerirá revisión humana en la mayoría de flujos de producción, especialmente en documentos con abreviaturas, sellos o deterioro.
- El CER del 3,12 % corresponde al split de validación interno, no al benchmark independiente; no debe presentarse como rendimiento esperado en documentos nuevos.
- Riesgo de alucinación: como todo modelo CTC, puede producir caracteres o palabras plausibles pero incorrectos en zonas ilegibles; no hay mecanismo de confianza documentado en la model card.
- Sesgos conocidos: no documentados por el autor; el corpus se limita a fondos suizos y alemanes, lo que puede introducir sesgos hacia convenciones ortográficas y administrativas de esa región.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero conviene revisar las condiciones de los corpus de entrenamiento (dh-unibe) si se redistribuyen derivados.
- Para producción, es necesario un paso previo de segmentación de página y línea con kraken; el modelo no realiza detección de layout por sí mismo.
- No se documentan versiones cuantizadas ni formatos alternativos (GGUF, ONNX), lo que limita su integración en *runtimes* distintos de kraken o CoreML.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dh-unibe/kraken-german-xix-v1
- Herramienta de entrenamiento: https://github.com/thodel/training-atr-models
- Dataset de actas del Regierungsrat: https://huggingface.co/datasets/dh-unibe/image-text_zh-regierungsratsprotokolle
- Dataset de manuscritos en Kurrent: https://huggingface.co/datasets/dh-unibe/image-text_kurrent-xix
- Dataset de actas parlamentarias: https://huggingface.co/datasets/dh-unibe/image-text_parlamentsdienste-protokolle
- Dataset de la Asamblea Federal: https://huggingface.co/datasets/dh-unibe/image-text_nr-sr-vereinigte-bundesversammlung-xix
- Benchmark de actas del Consejo Federal: https://doi.org/10.5281/zenodo.4746342
- Librería kraken: no disponible en la información proporcionada
