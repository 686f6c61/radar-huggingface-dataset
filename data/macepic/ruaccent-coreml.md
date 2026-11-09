# MacEpic/ruaccent-coreml

## Resumen

RUAccent for Core ML es una conversión al formato Core ML de los modelos de acentuación del proyecto RUAccent, desarrollado originalmente por Denis Petrov (Den4ikAI). El paquete lo publica MacEpic para integrarlo en la aplicación TextSniper, una herramienta de OCR y dictado para macOS. Su función es colocar las marcas de acentuación (tónicas) en palabras rusas, además de resolver la letra "ё" y los homógrafos, de modo que un sintetizador de voz pueda leer el texto con la entonación correcta.

El repositorio no contiene un modelo generativo ni un LLM: agrupa tres redes neuronales pequeñas exportadas a Core ML más un diccionario de 3,2 millones de palabras. Las tres redes son un DistilBERT para homógrafos, un DistilBERT para resolver "ё" y un RoFormer para palabras desconocidas. El conjunto pesa unos 52 MB (16 archivos, 52.265.014 bytes según `bundle.json`).

Es relevante para desarrolladores de aplicaciones macOS que necesiten acentuación rusa en local, sin conexión, con latencia baja y bajo consumo, ya que Core ML aprovecha la GPU y la Neural Engine de Apple. No es un modelo para generar texto ni para tareas de razonamiento general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres redes transformer: DistilBERT (homógrafos), DistilBERT (resolución de "ё") y RoFormer (palabras desconocidas) |
| Parametros totales | no disponible (el autor no publica el recuento; el paquete completo ocupa 52.265.014 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos en fp16 (homógrafos y "ё") y fp32 (palabras desconocidas); no se documentan otras cuantizaciones |
| Idiomas soportados | Ruso (ru) |
| Licencia | MIT (código y pesos; los pesos originales son MIT/Apache 2.0) |
| Formato de pesos | Core ML (`.mlpackage`), más vocabularios `.txt` y diccionarios `.json`/`.dict` |

## Arquitectura y entrenamiento

El paquete es una exportación, no un entrenamiento nuevo. El autor partió de la revisión `b78ae5ea` del repositorio `ruaccent/accentuator` y reconstruyó cada red en `transformers` a partir de su `config.json` y de los pesos de su archivo ONNX original, para después convertirla con `coremltools` y verificar el resultado contra el ONNX. Las tres redes son: `nn/nn_omograph/tiny2.1` (DistilBERT, fp16) para desambiguar homógrafos; `nn/nn_yo_homograph_resolver` (DistilBERT, fp16) para decidir cuándo una "е" debe ser "ё"; y `nn/nn_accent/big.onnx` (RoFormer, fp32) para asignar acento a palabras que no están en el diccionario.

El componente principal del sistema es el diccionario `accents.dict`, derivado de `dictionary/accents.json.gz` de RUAccent, con 3,2 millones de palabras en un formato ordenado y compacto que TextSniper lee mediante memory mapping. Se incluyen también `omographs.json`, `yo_words.json` y `yo_homographs.json` sin comprimir. No se documentan en la información disponible los datos de entrenamiento originales, el número de tokens, ni si hubo ajuste por RLHF o DPO.

## Capacidades

- Acentuación ortográfica de texto ruso: inserta la marca de acento en la vocal tónica de cada palabra.
- Resolución de homógrafos: distingue palabras con la misma grafía y distinto acento según el contexto (por ejemplo, "замо́к" frente a "за́мок").
- Resolución de la letra "ё": determina cuándo una "е" debe representarse como "ё".
- Acentuación de palabras desconocidas mediante la red RoFormer, para términos fuera del diccionario.
- Procesamiento 100 % local en macOS mediante Core ML, sin llamadas a red.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente.

## Casos de uso

- Síntesis de voz en macOS: TextSniper descarga este paquete junto con Pocket TTS Russian para que la voz lea con la acentuación correcta; las marcas de acento son un requisito para una pronunciación clara en ruso.
- OCR con lectura posterior: tras extraer texto ruso de una imagen, el modelo añade los acentos antes de pasarlo al TTS o de mostrarlo al usuario.
- Diccionarios y herramientas de aprendizaje de ruso: inserción automática de acentos en vocabulario y ejemplos, útil para estudiantes que necesitan la posición de la tónica.
- Preprocesado de corpus rusos: normalización de acentos en textos para entrenar o evaluar otros sistemas de TTS o de reconocimiento de voz.
- Aplicaciones de accesibilidad: lectura en voz alta de documentos rusos con pronunciación correcta en entornos de baja conectividad, al ejecutarse en local.
- Verificación de homógrafos en edición y corrección: detección de lecturas ambiguas de palabras como "коса" (incluida explícitamente en `omographs.json`) para desambiguar en herramientas editoriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El paquete completo ocupa 52.265.014 bytes (unos 52 MB), por lo que cabe holgadamente en memoria en cualquier Mac moderno.
- Requiere macOS con soporte de Core ML; las redes pueden ejecutarse en CPU, GPU o Neural Engine de Apple.
- No se especifican requisitos mínimos de VRAM ni de memoria unificada; al ser fp16 y fp32 de tamaño reducido, no debería ser un factor limitante.
- No está pensado para GPU NVIDIA ni para despliegue en servidores con vLLM, TGI o llama.cpp; el formato `.mlpackage` es específico de Core ML.
- No se documentan latencia ni throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| RUAccent for Core ML (este) | 3 redes transformer + diccionario de 3,2 M de palabras | Ruso | Core ML | MIT | no disponible |
| RUAccent original (`ruaccent/accentuator`) | Mismas redes en ONNX/PyTorch + diccionario | Ruso | ONNX, PyTorch | MIT / MIT-Apache 2.0 | no disponible |
| Otros acentuadores rusos | no disponible | Ruso | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo cubre ruso; no admite otros idiomas.
- No es un modelo generativo: no responde preguntas, no razona y no genera código.
- La cobertura depende del diccionario de 3,2 millones de palabras; las palabras fuera de él dependen de la red RoFormer, con precisión no documentada.
- No se han publicado métricas de precisión ni de error en la información disponible, por lo que no puede evaluarse su calidad frente a alternativas.
- El formato Core ML limita su uso a plataformas Apple; no es portable a Linux o Windows sin reconversión.
- La licencia MIT permite uso comercial, pero exige atribución a RUAccent y a Den4ikAI.
- El repositorio tiene 0 descargas y 0 likes, y no se ha actualizado desde su creación; conviene verificar la integridad de los archivos con `bundle.json` (SHA-256) antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/MacEpic/ruaccent-coreml
- Repositorio original de RUAccent: https://github.com/Den4ikAI/ruaccent
- Modelo original en Hugging Face: https://huggingface.co/ruaccent/accentuator
