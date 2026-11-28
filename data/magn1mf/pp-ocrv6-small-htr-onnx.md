# Magn1mf/pp-ocrv6-small-htr-onnx

## Resumen

PP-OCRv6 small HTR ONNX es una conversión al formato ONNX del reconocedor de líneas de texto manuscrito e impreso PP-OCRv6 small, entrenado originalmente por Benjamin Kiessling (ALMAnaCH, Inria Paris) para la herramienta kraken y publicado en Zenodo bajo licencia Apache-2.0. El modelo resuelve el problema del reconocimiento óptico de caracteres (OCR) y el reconocimiento de texto manuscrito (HTR) a nivel de línea, con un enfoque multilingüe que cubre 44 lenguas en 10 sistemas de escritura, incluido el portugués.

La conversión a ONNX la firma el proyecto Epryx (28/11/2026), que la utiliza en su lector local de Avisos de Recepción para el Tribunal de Justicia de Santa Catarina. El modelo no se emplea para lectura libre, sino para puntuar la compatibilidad entre la escritura del receptor y el nombre del destinatario mediante CTC forzado, un uso muy específico que conviene tener presente al evaluar su idoneidad para otras tareas.

Con solo 3,24 millones de parámetros y un repositorio de tamaño prácticamente nulo (0,0 GB), se trata de un modelo extremadamente ligero orientado a inferencia local en CPU o GPU de gama baja mediante onnxruntime. Su relevancia actual radica en la disponibilidad de un reconocedor multilingüe de líneas manuscritas en un formato portable y reproducible, aunque sus métricas en portugués sobre manuscritos históricos (CER 14,29% / WER 51,72%) indican que su precisión dista de ser alta en dominios difíciles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PP-OCRv6 (PaddleOCR), reconocedor de líneas con backbone convolucional y cabeza CTC; exportado a ONNX opset 17 |
| Parámetros totales | 3,24 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto; anchura de entrada dinámica) |
| Tipos de cuantización | no disponible (el repositorio solo incluye pesos fp32) |
| Idiomas soportados | 44 lenguas en 10 escrituras, incluido portugués y multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/htr-small-fp32.onnx`), junto con `codec.json` y script de exportación |

## Arquitectura y entrenamiento

El modelo es un reconocedor de líneas de texto basado en la arquitectura PP-OCRv6 de PaddleOCR, con un backbone convolucional y una cabeza de clasificación por fotogramas entrenada con Connectionist Temporal Classification (CTC). La entrada es un tensor float32 de dimensiones 1×3×96×L (RGB normalizado a 0..1 e invertido, con 16 píxeles de margen blanco a cada lado y altura fija de 96 manteniendo la proporción), y la salida es un tensor de probabilidades 1×1623×T con softmax, donde la clase 0 corresponde al blanco del CTC. El vocabulario efectivo, por tanto, es de 1622 caracteres.

La conversión a ONNX (opset 17) preserva el grafo original salvo por el `avg_pool2d` final del backbone, que requiere altura fija para la exportación mientras que la anchura permanece dinámica. El autor de la conversión verificó la equivalencia frente a kraken 7.2 en anchuras de 300, 777 y 1200 píxeles, con una diferencia máxima inferior a 1e-5, y en líneas reales con una diferencia inferior a 4e-5. No se detalla en la información disponible el volumen de tokens ni la composición exacta del dataset de entrenamiento original, más allá de que cubre manuscrito e impreso en 44 lenguas.

## Capacidades

- Reconocimiento de líneas de texto manuscrito e impreso, con salida a nivel de carácter mediante CTC.
- Soporte multilingüe: 44 lenguas en 10 escrituras, con portugués incluido explícitamente.
- Entrada de imagen RGB con altura fija de 96 píxeles y anchura dinámica, adecuada para líneas de longitud variable.
- Puntuación de secuencias candidatas mediante CTC forzado, lo que permite comparar la compatibilidad de una lectura con un texto de referencia.
- Inferencia portable mediante onnxruntime en CPU o GPU.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso ni procesamiento de audio o vídeo.
- No es un modelo generativo de texto libre: su salida es una secuencia de caracteres reconocidos, no una respuesta conversacional.

## Casos de uso

- Verificación de nombres en documentos administrativos: tal como lo emplea el proyecto Epryx, el modelo puntúa mediante CTC forzado si la escritura manuscrita de un receptor en un Aviso de Recepción es compatible con el nombre del destinatario, sin necesidad de lectura libre.
- Digitalización de manuscritos históricos en portugués: permite transcribir líneas de documentos antiguos, aunque con la advertencia de que el CER reportado en ese dominio es del 14,29%, por lo que requiere revisión humana posterior.
- Extracción de texto en formularios escaneados multilingües: al cubrir 44 lenguas, puede procesar lotes de documentos con mezcla de idiomas en un pipeline OCR común.
- Indexación de archivos documentales: integrado en un pipeline de preprocesado, permite generar texto buscable a partir de imágenes de líneas para su posterior indexación en un motor de búsqueda.
- Procesamiento local en dispositivos sin GPU: con 3,24 M de parámetros y formato ONNX, puede ejecutarse en CPU en entornos con recursos limitados, como estaciones de trabajo de oficina o dispositivos embebidos.
- Validación de campos manuscritos en sistemas de gestión documental: combinado con un diccionario de nombres o identificadores, sirve para comprobar la coherencia de campos manuscritos frente a datos estructurados ya conocidos.
- Preetiquetado en proyectos de anotación: puede generar transcripciones preliminares de líneas manuscritas que los anotadores corrigen, reduciendo el esfuerzo manual en la creación de corpus.

## Benchmarks y rendimiento

| Métrica | Valor | Condiciones |
|---|---|---|
| CER (micro-media) | 5,43% | División de test aleatoria |
| WER (micro-media) | 20,22% | División de test aleatoria |
| CER portugués | 14,29% | Manuscritos históricos |
| WER portugués | 51,72% | Manuscritos históricos |
| Diferencia frente a kraken 7.2 | < 1e-5 | Anchuras 300/777/1200 |
| Diferencia en líneas reales | < 4e-5 | Líneas reales |

Los datos proceden del autor del modelo original y de la verificación de la conversión realizada por el proyecto Epryx. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32, dado el tamaño de 3,24 M de parámetros y la entrada de altura fija 96; no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU con soporte de onnxruntime, incluidas RTX 4090, A100 o H100; el modelo no requiere hardware de gama alta.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo e incluso puede ejecutarse en CPU.
- Opciones de despliegue: onnxruntime (librería declarada), con posibilidad de servir mediante servidores compatibles con ONNX; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| PP-OCRv6 small HTR ONNX (este) | 3,24 M | 44 lenguas / 10 escrituras | ONNX | Apache-2.0 | Anchura dinámica |
| PP-OCRv6 small original (kraken) | 3,24 M | 44 lenguas / 10 escrituras | safetensors | Apache-2.0 | Anchura dinámica |
| Otros reconocedores OCR/HTR | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación directa documentada es con el modelo original en kraken, del que esta conversión es funcionalmente equivalente (diferencias inferiores a 1e-5). No se dispone de datos de benchmarks ni especificaciones de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- El propio autor de la conversión advierte que la lectura libre es débil en los Avisos de Recepción de su banco de pruebas; el modelo funciona mejor para puntuar candidatos por CTC que para transcribir de forma autónoma.
- El rendimiento en portugués sobre manuscritos históricos es bajo (CER 14,29%, WER 51,72%), lo que desaconseja su uso sin revisión humana en ese dominio.
- Riesgo de errores de reconocimiento en escrituras manuscritas difíciles, ruido, baja resolución o líneas mal segmentadas.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado sobre un corpus multilingüe puede presentar peor rendimiento en variedades dialectales o escrituras poco representadas.
- La licencia Apache-2.0 permite uso comercial, pero exige mantener la atribución al modelo original de Benjamin Kiessling (ALMAnaCH/Inria Paris) y a la conversión del proyecto Epryx.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.
- No se ofrecen versiones cuantizadas ni otros formatos de pesos, lo que limita optimizaciones de despliegue más allá de la conversión manual.
- El modelo no es generativo y no debe emplearse para tareas de razonamiento, código o conversación.

## Enlaces

- Hugging Face: https://huggingface.co/Magn1mf/pp-ocrv6-small-htr-onnx
- Modelo original en Zenodo: https://zenodo.org/records/21788405
- Kraken: https://kraken.re
- PaddleOCR (arquitectura PP-OCRv6): no disponible en la información proporcionada
- Repositorio del proyecto Epryx: no disponible en la información proporcionada (se cita `docs/RETOMAR-ar-manuscrito-local.md` sin URL)
