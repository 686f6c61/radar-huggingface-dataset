# ckalimi/kolmila-nakdan-onnx

## Resumen

kolmila-nakdan-onnx es una exportación a formato ONNX del modelo dicta-il/dictabert-large-char-menaked, desarrollado originalmente por Dicta (Israel Center for Text Analysis). El modelo realiza diacritización (nikud) de texto hebreo: recibe una secuencia de caracteres hebreos sin vocales y predice los signos diacríticos correspondientes, incluyendo la distinción entre shin y sin. Esta versión, publicada por el usuario ckalimi, no modifica los pesos del modelo original; únicamente convierte el formato a ONNX (fp32, opset 17) para permitir su ejecución en el navegador mediante onnxruntime-web.

La relevancia de esta ficha radica en su carácter práctico: se trata de un artefacto de despliegue, no de un modelo nuevo. La diacritización automática es una tarea fundamental para la lectura asistida, la enseñanza del hebreo y el procesamiento de textos litúrgicos o infantiles, donde el nikud es imprescindible. Al estar en ONNX, el modelo puede integrarse en aplicaciones web sin necesidad de backend, lo que reduce la infraestructura necesaria.

El modelo base es un transformer BERT-large de carácter (no de subpalabras), lo que le permite operar directamente sobre la secuencia de letras hebreas. La exportación conserva la tokenización original y las dos cabezas de salida: una para los 29 posibles signos de nikud y otra para la desambiguación shin/sin.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-large), tokenización a nivel de carácter |
| Parametros totales | no disponible (el modelo base es BERT-large; el número exacto no se indica en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (exportación ONNX); no se mencionan otras precisiones |
| Idiomas soportados | hebreo (he) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El modelo base dictabert-large-char-menaked es un transformer encoder de tipo BERT en su variante large, entrenado por Dicta sobre texto hebreo. La particularidad principal es que utiliza un tokenizador a nivel de carácter en lugar de subpalabras, lo que resulta adecuado para una tarea donde la unidad de predicción es cada letra individual y su posible signo diacrítico. La arquitectura incluye dos cabezas de clasificación sobre la salida del encoder: una que produce logits sobre 29 clases de nikud y otra que produce logits sobre 2 clases para la distinción shin/sin.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del corpus ni si se aplicaron técnicas de ajuste fino como RLHF o DPO. Tampoco se especifican innovaciones técnicas adicionales más allá de la tokenización por carácter y la doble cabeza de salida. La exportación a ONNX se realizó en fp32 con opset 17, sin cambios en los pesos, lo que implica que el rendimiento del modelo es idéntico al del original en la medida en que el runtime ONNX reproduzca fielmente las operaciones.

## Capacidades

- Diacritización de texto hebreo: predice los signos de nikud para cada carácter de una secuencia de entrada.
- Desambiguación shin/sin: la segunda cabeza de salida distingue entre las dos variantes de la letra shin.
- Procesamiento a nivel de carácter: adecuado para textos con puntuación irregular o sin segmentación previa en palabras.
- Ejecución en navegador: al estar en ONNX, puede ejecutarse con onnxruntime-web del lado del cliente.
- Entrada por lotes: acepta tensores de forma `[batch, seq]` para `input_ids` y `attention_mask`.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Lectura asistida de textos hebreos: el modelo añade nikud a textos sin vocales para facilitar la lectura a estudiantes y personas con dificultades de decodificación, ejecutándose directamente en el navegador sin enviar el texto a un servidor.
- Enseñanza del hebreo: generación automática de materiales didácticos vocalizados a partir de textos planos, con la posibilidad de integrarse en plataformas educativas web mediante onnxruntime-web.
- Procesamiento de textos litúrgicos: sidurim, textos bíblicos y otros materiales religiosos que requieren nikud preciso; el modelo puede preprocesar corpus para su publicación o estudio.
- Accesibilidad web: integración en lectores de pantalla o extensiones de navegador que vocalizan texto hebreo seleccionado por el usuario, aprovechando la inferencia local en el cliente.
- Normalización de corpus: añadir nikud a grandes colecciones de texto hebreo no vocalizado para tareas posteriores de NLP, como análisis morfológico o búsqueda sensible a la vocalización.
- Aplicaciones de edición y publicación: asistentes de corrección o maquetación que sugieren la vocalización correcta de un texto antes de su impresión, con latencia baja al no requerir llamadas a un servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; al ser una exportación fp32 de un BERT-large, el peso del modelo ronda varios cientos de MB, pero la información proporcionada no confirma la cifra exacta.
- GPU recomendadas: no se especifican; al ejecutarse en navegador mediante onnxruntime-web, puede funcionar con aceleración por WebGPU o WebAssembly según el dispositivo.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño típico de un BERT-large en fp32, pero no se dispone de confirmación en la información proporcionada.
- Opciones de despliegue: onnxruntime-web (navegador), onnxruntime (Python/C++), potencialmente otros runtimes compatibles con ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| ckalimi/kolmila-nakdan-onnx | no disponible (BERT-large) | no disponible | Diacritización hebrea | CC BY 4.0 | ONNX |
| dicta-il/dictabert-large-char-menaked | no disponible (BERT-large) | no disponible | Diacritización hebrea | CC BY 4.0 | safetensors/PyTorch (formato original de Dicta) |
| dicta-il/dictabert-large | no disponible (BERT-large) | no disponible | Modelo base hebreo (sin cabeza de nikud) | no disponible en la información proporcionada | no disponible |

La comparación se limita al ecosistema Dicta, ya que no se han identificado en la información proporcionada otros modelos de diacritización hebrea comparables. La diferencia principal entre kolmila-nakdan-onnx y su modelo base es exclusivamente el formato: el primero está pensado para despliegue en navegador, mientras que el segundo requiere un entorno de inferencia tradicional.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos en la información proporcionada; al entrenarse sobre corpus hebreos, puede reflejar las convenciones de vocalización de las fuentes utilizadas.
- Riesgo de alucinación: en tareas de clasificación por carácter, el riesgo se manifiesta como vocalizaciones incorrectas o inconsistentes, especialmente en palabras ambiguas o poco frecuentes.
- Limitaciones de idioma: el modelo está diseñado exclusivamente para hebreo; no soporta otros idiomas.
- Limitaciones de contexto: no se especifica la longitud máxima de secuencia; secuencias muy largas pueden requerir truncamiento o segmentación.
- Restricciones de licencia: CC BY 4.0 permite uso comercial y modificaciones siempre que se atribuya la autoría a Dicta y se indique la licencia; es obligatorio conservar la atribución.
- Caveat de producción: al ser una exportación ONNX sin cambios en los pesos, la calidad depende enteramente del modelo original; conviene validar la fidelidad numérica entre el runtime ONNX y el original antes de desplegar.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que no implica problemas técnicos pero sí ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ckalimi/kolmila-nakdan-onnx
- Modelo base: https://huggingface.co/dicta-il/dictabert-large-char-menaked
- Dicta – Israel Center for Text Analysis: https://dicta.org.il
- onnxruntime-web: https://onnxruntime.ai
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
