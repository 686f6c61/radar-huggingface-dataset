# kouhxp/PaddleOCR-VL-1.5-ONNX

## Resumen

PaddleOCR-VL-1.5-ONNX (mirror de kouhxp) es una copia sin modificaciones de una seleccion de ficheros del repositorio `onnx-community/PaddleOCR-VL-1.5-ONNX`, fijada al commit `371b52d142968ff09e9cb5275a75eae55aa27a96`. No es un modelo entrenado por el autor del repositorio: se trata de una exportacion a formato ONNX del modelo original `PaddlePaddle/PaddleOCR-VL-1.5`, publicada por PaddlePaddle bajo licencia Apache-2.0. El motivo del mirror es practico: permitir que la herramienta `textsnap` descargue siempre una revision concreta y reproducible, en lugar de depender de la rama principal del repositorio de ONNX Community.

El modelo subyacente pertenece a la familia PaddleOCR-VL, orientada al parseo de documentos. Su componente principal es PaddleOCR-VL-0.9B, un modelo vision-lenguaje compacto que combina un codificador visual de resolucion dinamica de estilo NaViT con el modelo de lenguaje ERNIE-4.5-0.3B. Esa combinacion le permite reconocer elementos de pagina (texto, tablas, formulas, sellos) con un coste computacional bajo en comparacion con los VLM generalistas de gran tamano. La version 1.5 anade deteccion de texto en escena (localizacion y reconocimiento de lineas de texto) y reconocimiento de sellos.

Su relevancia actual es doble. Por un lado, el pipeline de OCR de alto rendimiento se ha convertido en una pieza critica de las arquitecturas RAG sobre documentacion corporativa. Por otro lado, el export a ONNX permite ejecutar el modelo fuera del ecosistema Paddle, por ejemplo con ONNX Runtime o transformers.js, lo que facilita el despliegue en navegador, en CPU o en entornos sin GPU dedicada. Conviene tener en cuenta que el repositorio analizado acumula 0 descargas y 0 likes, tiene un tamano de 1,3 GB y que ya existe una version posterior del modelo original (PaddleOCR-VL-1.6).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (VLM): codificador visual de resolucion dinamica estilo NaViT + modelo de lenguaje ERNIE-4.5-0.3B |
| Parametros totales | 0,9B (PaddleOCR-VL-0.9B, segun la documentacion del proyecto PaddleOCR) |
| Parametros activos | No aplica (no es un modelo MoE; no disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el repositorio contiene pesos en formato ONNX) |
| Idiomas soportados | No disponible en la model card; fuentes secundarias de la busqueda web mencionan soporte de mas de 100 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (repositorio etiquetado con `onnx` y `custom_code`) |

Otros datos del repositorio: autor `kouhxp`, tamano 1,3 GB, 0 descargas, 0 likes, creado el 29 de septiembre de 2026 y actualizado el mismo dia. La pipeline declarada es "no disponible".

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles de entrenamiento de PaddleOCR-VL-1.5: no se especifican el numero de tokens, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO. Lo que si consta es la arquitectura general descrita por el proyecto PaddleOCR: un modelo vision-lenguaje compacto de 0,9B de parametros que integra un codificador visual de resolucion dinamica inspirado en NaViT con el modelo de lenguaje ERNIE-4.5-0.3B. El codificador de resolucion dinamica es relevante en OCR porque evita reescalar todas las imagenes a una resolucion fija, lo que degrada el reconocimiento de texto pequeno o denso.

En cuanto a la version 1.5, la documentacion oficial indica que incorpora deteccion de texto en escena (localizacion y reconocimiento de lineas de texto) y reconocimiento de sellos, tareas en las que el proyecto afirma haber alcanzado nuevos resultados SOTA. No se han facilitado los valores numericos de esas metricas. Sobre este repositorio concreto, lo unico verificable es que se trata de una exportacion ONNX sin modificaciones respecto al repositorio de ONNX Community, y que la model card etiqueta el contenido con `custom_code`, lo que implica que la carga del modelo requiere codigo personalizado y no un `AutoModel` estandar de transformers.

## Capacidades

- Reconocimiento optico de caracteres sobre imagenes y PDF, con salida de texto plano y estructurado.
- Parseo de documentos: extraccion de elementos de pagina como bloques de texto, tablas, formulas y titulos.
- Deteccion de texto en escena (text spotting): localizacion de lineas de texto en imagenes naturales y reconocimiento posterior del contenido.
- Reconocimiento de sellos y estampillas, anadido en la version 1.5.
- Capacidad multilingue: fuentes secundarias mencionan soporte de mas de 100 idiomas, aunque la model card del repositorio no lo detalla.
- Entrada de imagenes a resolucion variable gracias al codificador visual de resolucion dinamica.
- Inferencia en formato ONNX, lo que habilita su ejecucion en navegador y en CPU mediante ONNX Runtime o transformers.js.
- Soporte de tool calling, function calling, agentes, audio o generacion de texto general: no disponible; se trata de un modelo especializado en vision-lenguaje para OCR, no de un asistente conversacional de proposito general.

## Casos de uso

- Digitalizacion de facturas y albaranes: el modelo puede extraer lineas de concepto, importes y datos fiscales de PDF e imagenes, y devolver una estructura apta para volcar en un ERP. Su tamano de 0,9B permite procesar volumenes altos en hardware modesto.
- Construccion de pipelines RAG sobre documentacion corporativa: convertir PDF tecnicos, contratos o manuales en texto estructurado antes de trocearlo e indexarlo en una base vectorial, mejorando la calidad de la recuperacion.
- Procesamiento de formularios manuscritos o impresos: extraccion de campos clave en procesos de alta de clientes, seguros o administracion publica, con el reconocimiento de sellos como apoyo para validar documentos oficiales.
- Lectura de documentos con texto en escena: fotografia de carteles, etiquetas de producto, matriculas o paneles, usando la capacidad de text spotting incorporada en la version 1.5.
- Digitalizacion masiva de archivos historicos y bibliotecas: el soporte multilingue reportado y el bajo coste por pagina lo hacen adecuado para proyectos de preservacion documental a gran escala.
- OCR en el navegador o en el dispositivo: gracias al export ONNX, es posible ejecutar el modelo con transformers.js sin enviar imagenes a un servidor, lo que resulta util en aplicaciones con requisitos de privacidad o de funcionamiento sin conexion.
- Preprocesado para LLM: uso como etapa previa que transforma capturas y escaneos en texto limpio que despues consume un modelo de lenguaje mayor, reduciendo el coste de tokens de vision en el modelo final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion oficial de PaddleOCR-VL-1.5 afirma que las metricas de text spotting y reconocimiento de sellos alcanzan nuevos valores SOTA, pero no se han facilitado las cifras concretas ni la comparacion con otros modelos, por lo que no se incluye ninguna tabla numerica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el numero de parametros (0,9B), una ejecucion en FP16 requeriria del orden de 1,8 GB solo para los pesos, mas la memoria de activaciones del codificador visual, que crece con la resolucion de la imagen; en INT8 el peso de los pesos se reduciria aproximadamente a la mitad. El repositorio ocupa 1,3 GB, dato que debe tenerse en cuenta al planificar el almacenamiento.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el modelo es candidato a GPUs de gama media y a GPUs de centro de datos ya existentes; no se han publicado recomendaciones oficiales.
- Viabilidad en GPU de consumo: muy probablemente si, dado el tamano de 0,9B, aunque no se dispone de confirmacion oficial ni de listado de modelos probados.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), transformers.js para ejecucion en navegador y Node.js, y la herramienta `textsnap`, para la que se creo este mirror. vLLM, TGI y llama.cpp no son aplicables directamente a un export ONNX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento con otros modelos de OCR. La comparacion que si puede hacerse con rigor es entre las distintas distribuciones del mismo modelo:

| Distribucion | Formato | Licencia | Estado |
|---|---|---|---|
| PaddlePaddle/PaddleOCR-VL-1.5 | Pesos originales Paddle | Apache-2.0 | Modelo original; existe version 1.6 |
| onnx-community/PaddleOCR-VL-1.5-ONNX | ONNX | Apache-2.0 | Export oficial a ONNX de la comunidad |
| kouhxp/PaddleOCR-VL-1.5-ONNX (este repositorio) | ONNX | Apache-2.0 | Mirror parcial de la anterior, fijado a un commit |

## Limitaciones y advertencias

- Este repositorio no es el modelo original: es una copia de una seleccion de ficheros de otro repositorio, fijada a un commit concreto. Para uso en produccion conviene valorar el repositorio original o el de ONNX Community, que reciben mantenimiento.
- El repositorio presenta 0 descargas y 0 likes, por lo que no existe validacion comunitaria ni evidencia de uso en produccion.
- La model card no documenta la composicion del dataset de entrenamiento ni las etapas de alineacion, de modo que no se pueden evaluar sesgos de forma fundamentada. Los sesgos conocidos son, por tanto, "no disponible".
- Riesgo de alucinacion: no cuantificado en la informacion disponible. En modelos de OCR la alucinacion se manifiesta como texto inventado en zonas ilegibles o ruidosas; se recomienda validacion con umbrales de confianza antes de usar la salida en procesos automaticos.
- La longitud de contexto no esta documentada, lo que limita la planificacion de documentos de muchas paginas en una sola pasada.
- El listado exacto de idiomas soportados no aparece en la model card; la cifra de mas de 100 idiomas proviene de fuentes secundarias y no esta confirmada oficialmente para esta version.
- La etiqueta `custom_code` implica que el modelo necesita codigo propio para cargarse; no es compatible con un flujo estandar de `AutoModel` sin adaptaciones.
- Licencia Apache-2.0: permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y de atribucion. Al ser un mirror, deben mantenerse los creditos a PaddlePaddle y a los autores del export ONNX.
- Existe una version posterior del modelo original (PaddleOCR-VL-1.6), por lo que esta version puede quedar desactualizada.
- Verificar la integridad del mirror en el commit indicado antes de desplegarlo, dado que no proviene de una organizacion oficial.

## Enlaces

- Repositorio analizado: https://huggingface.co/kouhxp/PaddleOCR-VL-1.5-ONNX
- Export ONNX original de la comunidad: https://huggingface.co/onnx-community/PaddleOCR-VL-1.5-ONNX
- Modelo original: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.5
- Version posterior del modelo original: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- Repositorio GitHub de PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Documentacion de PaddleOCR-VL-1.5: https://www.paddleocr.ai/main/en/version3.x/algorithm/PaddleOCR-VL/PaddleOCR-VL-1.5.html
- Herramienta textsnap: https://github.com/kouhxp/textsnap
- Fork comunitario PaddleOCR-vl-1.5: https://github.com/ahoo2025/PaddleOCR-vl-1.5
