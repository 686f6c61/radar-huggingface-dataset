# ganmoor-ai-labs/kannada-parseq-v2

## Resumen

kannada-parseq-v2 es un modelo de reconocimiento óptico de caracteres (OCR) a nivel de palabra para el idioma kannada, desarrollado por ganmoor-ai-labs. Está basado en la arquitectura PARSeq (Permuted Autoregressive Sequence), un transformer encoder-decoder diseñado para reconocimiento de texto en escenas y documentos. El modelo se ha entrenado desde cero con 648.000 imágenes de palabras, de las cuales 529.000 proceden de documentos gubernamentales públicos de Karnataka (gacetas, circulares y formularios) y 120.000 son muestras sintéticas con degradaciones de escaneo y numerales. El objetivo es leer texto impreso en kannada en documentos administrativos, bancarios y de imprenta general, superando ampliamente a soluciones genéricas como EasyOCR en este dominio específico.

El modelo tiene aproximadamente 24 millones de parámetros y un vocabulario de 160 símbolos (bloque kannada, ASCII, símbolo de rupia y puntuación común). Su checkpoint ocupa 0,4 GB y se distribuye bajo licencia Apache 2.0. La relevancia actual radica en que el kannada es una lengua índica con escasez de modelos OCR específicos y de alta calidad; este modelo ofrece una precisión del 97% en documentos gubernamentales limpios, frente al 33,5% de EasyOCR, lo que lo convierte en una opción práctica para digitalización de archivos públicos y procesos de automatización documental en Karnataka.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PARSeq (transformer encoder-decoder autoregresivo con permutaciones) |
| Parametros totales | ~24 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de imagen 32x128 píxeles; longitud máxima de etiqueta 42 caracteres) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kannada (kn) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint de PyTorch Lightning (.ckpt) |

## Arquitectura y entrenamiento

PARSeq es una arquitectura de reconocimiento de texto en escenas (STR) que unifica decodificación sin contexto y con contexto mediante un mecanismo de decodificación autoregresiva permutada. El modelo puede realizar inferencia sin contexto (solo imagen) o con contexto (usando predicciones previas) y permite refinamiento iterativo de predicciones mediante contexto bidireccional, sin necesidad de un modelo de lenguaje externo. En la práctica, actúa como un conjunto de modelos autoregresivos que comparten arquitectura y pesos, lo que mejora la robustez frente a variaciones de orden en los caracteres.

El entrenamiento se realizó desde cero, no como fine-tuning. Los datos incluyen 529.000 recortes de palabras de documentos PDF gubernamentales de Karnataka, cuyas etiquetas se recuperaron convirtiendo codificaciones legacy de la fuente Nudi a Unicode, sin anotación manual. Se añadieron 120.000 muestras sintéticas con degradaciones de escaneo (desenfoque, ruido, baja resolución, binarización) y numerales (fechas, números con formato Aadhaar, cantidades y dígitos kannada ೦–೯). El conjunto de caracteres abarca 160 símbolos. El entrenamiento duró 32 épocas con SWA (Stochastic Weight Averaging), batch de 384, tasa de aprendizaje 7e-4 con programación one-cycle, en una única GPU NVIDIA GB10 (DGX Spark), durante aproximadamente 10 horas. Un detalle técnico relevante: la normalización Unicode por defecto (NFKD + eliminación de ASCII) debe desactivarse para conjuntos de caracteres índicos, ya que eliminaría los caracteres kannada.

## Capacidades

- Reconocimiento de texto impreso en kannada a nivel de palabra, tanto en documentos nacidos digitales como en escaneados.
- Soporte para numerales kannada (೦–೯), fechas, cantidades y números con formato Aadhaar.
- Manejo de un vocabulario de 160 símbolos que incluye el bloque kannada, ASCII, el símbolo de rupia (₹) y puntuación común.
- Inferencia sin contexto (solo imagen) y con contexto, así como refinamiento iterativo de predicciones mediante decodificación bidireccional.
- Integración con detectores de texto externos (por ejemplo, CRAFT) para el procesamiento de páginas completas.
- No soporta escritura manuscrita; está limitado a texto impreso.

## Casos de uso

- Digitalización de gacetas y boletines oficiales de Karnataka: el modelo puede convertir documentos gubernamentales escaneados en texto Unicode estructurado, con una precisión del 97% en documentos limpios, lo que facilita su indexación y búsqueda.
- Automatización de procesos bancarios: extracción de datos de formularios, cheques y estados de cuenta en kannada, donde los números y cantidades son críticos y el modelo ha sido entrenado específicamente con numerales.
- Procesamiento de expedientes administrativos: lectura de circulares, memorandos y formularios gubernamentales para su ingreso en sistemas de gestión documental, reduciendo la intervención manual.
- Archivado histórico de documentos públicos: conversión de archivos PDF nacidos digitales con codificación legacy (fuente Nudi) a texto Unicode estándar, aprovechando que las etiquetas se generaron automáticamente sin anotación manual.
- OCR para aplicaciones móviles de traducción o lectura: al ser un modelo ligero (~24M parámetros), puede integrarse en aplicaciones que capturan texto impreso en kannada y lo convierten a Unicode para su posterior procesamiento.
- Pipeline de extracción de datos a gran escala: combinado con un detector de texto como CRAFT, el modelo puede procesar páginas completas de documentos escaneados, alcanzando un word-F1 de 0,728 en el pipeline completo, útil para lote de digitalización masiva.

## Benchmarks y rendimiento

El autor proporciona resultados en tres pruebas, comparados con EasyOCR y con un estado del arte de licencia restringida:

| Test | kannada-parseq-v2 | EasyOCR (baseline) | SOTA restringido |
|---|---|---|---|
| Documentos gubernamentales held-out (976 palabras, limpios) | 97,0% word accuracy / 97,3% char similarity | 33,5% / 60,1% | no disponible |
| Pipeline de página completa (con detector CRAFT), word-F1 | 0,728 | no disponible | 0,754 |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no es un LLM sino un sistema OCR especializado.

## Requisitos de hardware

- El modelo tiene ~24 millones de parámetros y un checkpoint de 0,4 GB, por lo que es ligero en comparación con modelos de lenguaje modernos.
- No se especifica VRAM estimada para inferencia en la información disponible; sin embargo, por su tamaño, es factible ejecutarlo en GPUs de consumo como una RTX 3060 o incluso en CPU para inferencia por lotes pequeños.
- El entrenamiento se realizó en una única NVIDIA GB10 (DGX Spark), lo que indica que la inferencia no requiere hardware de gama alta.
- Opciones de despliegue: el modelo se usa mediante el paquete `strhub` del repositorio oficial de PARSeq (https://github.com/baudm/parseq), cargando el checkpoint con `load_from_checkpoint`. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de texto generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Precisión (docs gubernamentales) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kannada-parseq-v2 | PARSeq | ~24M | 97,0% word accuracy | Apache 2.0 | Hugging Face |
| EasyOCR (baseline) | CRNN + LSTM | no disponible | 33,5% word accuracy | Apache 2.0 | Open source |
| SOTA de licencia restringida | no disponible | no disponible | 0,754 word-F1 (pipeline completo) | Restringida | no disponible |

La comparativa se limita a los datos proporcionados por el autor. No se dispone de información sobre otros modelos OCR específicos para kannada como Tesseract o TrOCR en este contexto.

## Limitaciones y advertencias

- No soporta escritura manuscrita; está diseñado exclusivamente para texto impreso.
- La precisión en documentos escaneados es inferior a la de documentos nacidos digitales, debido a las degradaciones del escaneo.
- El modelo refleja el registro formal y administrativo de los documentos gubernamentales de Karnataka, por lo que puede tener un rendimiento inferior con texto coloquial o de otros dominios.
- La longitud máxima de etiqueta es de 42 caracteres; palabras más largas podrían no ser reconocidas correctamente.
- Para procesar páginas completas es necesario un detector de texto externo (por ejemplo, CRAFT), ya que el modelo opera a nivel de palabra.
- El vocabulario está limitado a 160 símbolos; caracteres fuera de este conjunto no serán reconocidos.
- No se proporcionan datos sobre sesgos demográficos o geográficos, aunque al entrenarse con documentos públicos de Karnataka, es probable que tenga un sesgo hacia ese contexto regional.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye tal cual, sin garantías de precisión en todos los escenarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ganmoor-ai-labs/kannada-parseq-v2
- Repositorio oficial de PARSeq: https://github.com/baudm/parseq
- README de PARSeq en GitHub: https://github.com/baudm/parseq/blob/main/README.md
- Perfil del autor en Hugging Face: https://huggingface.co/ganmoor-ai-labs/models
