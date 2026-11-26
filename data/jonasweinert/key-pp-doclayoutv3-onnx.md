# JonasWeinert/key-pp-doclayoutv3-onnx

## Resumen

JonasWeinert/key-pp-doclayoutv3-onnx es una exportación a ONNX en precisión fp16 del modelo de detección de layout documental PP-DocLayoutV3, desarrollado originalmente por el equipo PaddlePaddle de Baidu. El repositorio no introduce cambios en los pesos: redistribuye byte a byte el fichero `model_fp16.onnx` procedente del dataset `embedpdf/embed-pdf-viewer`, con el objetivo de servir como dependencia estable para la aplicación Key, un espacio de trabajo de investigación que analiza PDF localmente en el dispositivo del usuario.

El modelo resuelve la tarea de identificar la estructura de un PDF: encabezados, párrafos, columnas, tablas, figuras y orden de lectura. Se distribuye como un único fichero ONNX de aproximadamente 65,5 MB (0,1 GB de repositorio), lo que lo hace adecuado para inferencia local en clientes de escritorio mediante ONNX Runtime. La relevancia actual radica en su empaquetado reproducible (revisión fijada y verificación SHA-256) y en su licencia Apache 2.0, que permite su redistribución e integración comercial.

La información pública disponible es escasa: no se documentan parámetros, longitud de contexto ni idiomas soportados, ya que se trata de un modelo de visión para detección de objetos sobre imágenes de página, no de un modelo generativo de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de detección de objetos para layout documental; base PaddlePaddle/PP-DocLayoutV3) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | fp16 (fichero ONNX exportado en fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model_fp16.onnx`, 65.546.435 bytes) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el volumen de datos de entrenamiento ni el procedimiento de ajuste del modelo original PP-DocLayoutV3 en la documentación proporcionada. El repositorio es exclusivamente una redistribución: el fichero ONNX se toma sin modificar del dataset `embedpdf/embed-pdf-viewer`, en la ruta `models/PP-DocLayoutV3-ONNX/model_fp16.onnx`, revisión `0833193a430ce271aa434cf1eecfab19412ac6a0`, y se publica byte a byte idéntico.

La innovación relevante de este empaquetado no es algorítmica sino de ingeniería de distribución: revisión fijada, verificación de integridad mediante SHA-256 (`e549a04370b88c3f26fe8a975d7f15d76cb15876b54588270c977426793445ad`) y formato ONNX fp16 para ejecución con ONNX Runtime en el dispositivo del usuario. El código que consume el modelo en la aplicación Key se encuentra en `crates/opendataloader-pdf-rs` del repositorio de Key.

## Capacidades

- Detección de layout documental en PDF: identificación de encabezados, párrafos, columnas, tablas y figuras.
- Determinación del orden de lectura del contenido de una página.
- Inferencia local en el dispositivo mediante ONNX Runtime, sin necesidad de enviar documentos a un servidor.
- Ejecución en precisión fp16, con el consiguiente ahorro de memoria y ancho de banda frente a fp32.
- Integración como componente de un pipeline de análisis de PDF (extracción estructurada previa a tareas posteriores).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, visión general, audio ni modo thinking.

## Casos de uso

- Análisis local de PDF en aplicaciones de escritorio: el modelo se descarga una sola vez en la primera ejecución, se verifica su SHA-256 y se mantiene en el dispositivo, permitiendo procesar documentos sin conexión y sin exponer su contenido a terceros.
- Extracción estructurada de documentos científicos: detección de columnas, figuras y tablas para reconstruir el orden de lectura antes de alimentar un pipeline de extracción de texto o de RAG.
- Digitalización de facturas y formularios: localización de regiones de tabla y encabezado para segmentar el documento y dirigir cada región a un extractor especializado (OCR, parser de tablas).
- Preprocesado en sistemas de gestión documental: clasificación de bloques de página para indexar secciones, detectar tablas y conservar la jerarquía visual del original.
- Accesibilidad y reflow de documentos: uso del orden de lectura detectado para generar versiones adaptadas de PDF en lectores de pantalla o en formatos reflowables.
- Pipeline de conversión PDF a Markdown/HTML: el layout detectado permite asignar cada bloque a la etiqueta semántica correcta (título, párrafo, tabla) antes de la conversión.
- Procesamiento por lotes en servidor con ONNX Runtime: al ser un fichero ONNX estándar, puede ejecutarse también en entornos con GPU o CPU para indexación masiva de corpus documentales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el fichero fp16 ocupa 65,5 MB, por lo que la huella de pesos es mínima y el consumo dominante será el de las activaciones y la resolución de entrada.
- GPU recomendadas: no disponible. Al ser un modelo de detección de layout de tamaño reducido, es plausible su ejecución en CPU, pero no se documentan requisitos ni GPU de referencia.
- ¿Cabe en GPU de consumo? El tamaño del fichero (0,1 GB de repositorio) sugiere que sí, aunque no se especifican modelos concretos (RTX 4090, etc.) en la documentación.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos alternativos de layout documental en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo de referencia estructural:

| Modelo | Formato | Licencia | Contexto/entrada | Disponibilidad |
|---|---|---|---|---|
| JonasWeinert/key-pp-doclayoutv3-onnx | ONNX fp16 | Apache 2.0 | Imagen de página (resolución no disponible) | Hugging Face |
| PaddlePaddle/PP-DocLayoutV3 (original) | PaddlePaddle | no disponible en esta ficha | no disponible | Hugging Face |
| Alternativas de layout documental | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de visión especializado en layout: no genera texto ni razona; su salida son detecciones de regiones y orden de lectura.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado por terceros (PaddlePaddle) y redistribuido sin modificación, hereda cualquier sesgo del modelo original.
- Riesgo de errores de detección en documentos con layouts atípicos, escaneos de baja calidad o idiomas no representados en el entrenamiento original; no se dispone de datos al respecto.
- Idiomas soportados: no disponibles. Al operar sobre imagen de página, la dependencia idiomática proviene del texto renderizado, no de un tokenizador.
- Licencia Apache 2.0: permite uso comercial y redistribución, con obligación de conservar avisos de copyright y licencia; los derechos del modelo pertenecen a los autores originales (PaddlePaddle).
- La integridad del fichero está garantizada por SHA-256, pero el repositorio no ofrece garantías de mantenimiento ni de actualizaciones.
- Uso fuera de la aplicación Key: el autor indica que el fichero carga con ONNX Runtime, pero el código de referencia para ejecutarlo vive en el repositorio de Key (`crates/opendataloader-pdf-rs`), no en este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JonasWeinert/key-pp-doclayoutv3-onnx
- Modelo original: https://huggingface.co/PaddlePaddle/PP-DocLayoutV3
- Origen del fichero ONNX (dataset): https://huggingface.co/datasets/embedpdf/embed-pdf-viewer/blob/0833193a430ce271aa434cf1eecfab19412ac6a0/models/PP-DocLayoutV3-ONNX/model_fp16.onnx
