# nxp/scrfd-500m-imx

## Resumen

nxp/scrfd-500m-imx es un modelo alojado en HuggingFace bajo la cuenta de NXP Semiconductors, compañía neerlandesa de semiconductores con sede en Eindhoven. El identificador apunta a un detector facial de la familia SCRFD (Sample and Computation Redistribution for Efficient Face Detection) con un presupuesto computacional de aproximadamente 500 millones de FLOPs, y el sufijo "imx" sugiere que está orientado a su despliegue en los procesadores de aplicación i.MX de NXP para entornos de borde. La licencia declarada en la model card es MIT.

La model card publicada está prácticamente vacía: únicamente contiene la declaración de licencia MIT, sin descripción, parámetros, datos de entrenamiento, benchmarks, idiomas ni formato de pesos. La búsqueda web realizada no devuelve documentación específica sobre este checkpoint, solo páginas corporativas generales de NXP, por lo que buena parte de esta ficha queda marcada explícitamente como "no disponible".

Pese a la falta de documentación, el modelo es relevante por su posicionamiento: los detectores facciales ligeros de la familia SCRFD están diseñados para ejecutarse con latencia baja en hardware embebido con NPU. Si el sufijo "imx" confirma la intención de despliegue en la plataforma i.MX, se trataría de un componente pensado para visión artificial en el extremo (control de acceso, monitorización en vehículo, conteo de personas), no para inferencia en servidores de propósito general. Cualquier uso en producción debería validarse contra la documentación real del fabricante, que no está disponible en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; el identificador sugiere SCRFD (detector facial CNN de una etapa con redistribución de muestreo y cómputo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No hay información en la model card ni en los resultados de búsqueda sobre la arquitectura concreta de este checkpoint, el cómputo de entrenamiento, la composición del dataset ni si se aplicó alguna etapa de ajuste fino, destilación o cuantización. Todos estos datos deben considerarse no disponibles.

A título de contexto general y no confirmado para este checkpoint: la familia SCRFD, descrita en la publicación "Sample and Computation Redistribution for Efficient Face Detection" (arXiv 2105.04714), corresponde a detectores faciales de una sola etapa, de tipo anchor-based, que predicen cajas delimitadoras y cinco puntos faciales de referencia. Emplean una red troncal optimizada mediante redistribución de muestreo y de cómputo, una piramide de características y salidas en varias escalas (habitualmente strides 8, 16 y 32). La referencia del paper describe variantes con presupuestos de 0,5 GF, 2,5 GF, 10 GF y 34 GF. El identificador "500m" encajaría con la variante ligera de 0,5 GF, pero esto no está confirmado por la documentación del repositorio.

## Capacidades

- Detección de rostros en imágenes: localización de cajas delimitadoras, capacidad derivada del tipo de modelo, no confirmada por la model card.
- Predicción de puntos faciales de referencia (SCRFD suele devolver cinco keypoints), no confirmada para este checkpoint.
- Procesamiento de imágenes individuales orientado a inferencia en el borde, inferido del sufijo "imx", no confirmado.
- Generación de texto: no disponible (no es un modelo de lenguaje).
- Razonamiento, código, matemáticas o visión general: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica ni hay datos.
- Capacidades especiales (modo thinking, audio, vídeo): no disponible.

## Casos de uso

Los siguientes escenarios son aplicaciones típicas de un detector facial ligero orientado a borde. Dado que la model card está vacía, deben considerarse hipótesis de uso condicionadas a la validación previa del modelo, no casos confirmados por el autor.

- Control de acceso en dispositivos empotrados: un detector de rostros ligero puede integrarse en un lector biométrico sobre un SoC i.MX para localizar el rostro antes de ejecutar el reconocimiento, reduciendo el coste computacional frente a un pipeline de detección más pesado.
- Monitorización del conductor (DMS): la detección facial en tiempo real permite localizar el rostro y sus puntos de referencia para estimar orientación de la cabeza y fatiga en sistemas de automoción, un sector objetivo declarado de NXP.
- Conteo y analítica de personas en retail: sobre cámaras de bajo consumo, el modelo podría detectar y contar asistentes sin enviar vídeo a la nube, minimizando el ancho de banda y los requisitos de privacidad.
- Desbloqueo de dispositivos en el extremo: detección previa al reconocimiento facial en electrodomésticos, paneles industriales o terminales de punto de venta con hardware i.MX.
- Preprocesado para pipelines de videovigilancia: como primera etapa que recorta regiones faciales y las pasa a un modelo de reconocimiento o de análisis de atributos ejecutado aguas abajo.
- Automatización industrial con visión: localización de operarios y seguimiento de interacción en líneas de fabricación siempre que se cumplan los requisitos regulatorios y de privacidad aplicables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas (WIDER FACE, mAP, latencia ni throughput) y los resultados de búsqueda no aportan cifras asociadas a este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible. Por el tipo de modelo y el sufijo "imx", el objetivo declarado parece ser hardware de borde con NPU (procesadores de aplicación i.MX de NXP) más que GPU de centro de datos.
- Encaje en GPU de consumo: no disponible; un detector de aproximadamente 0,5 GF sería, en principio, apto para GPU de consumo, pero no hay confirmación.
- Opciones de despliegue: no disponible. Los flujos habituales para un modelo de este tipo serían el toolkit de inferencia propietario de NXP o runtimes de visión como ONNX Runtime o TFLite, sin que esto esté confirmado por el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento de este checkpoint, por lo que la comparación cuantitativa no es posible. Como referencia cualitativa, los detectores faciales ligeros de referencia en el mismo segmento son RetinaFace, YuNet y variantes faciales de YOLO (YOLOv8-face), todos ellos con licencias y disponibilidad distintas. No se dispone de parámetros, contexto ni métricas de nxp/scrfd-500m-imx para construir una tabla comparativa fiable.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nxp/scrfd-500m-imx | no disponible | no aplica | no disponible | MIT | HuggingFace |
| RetinaFace | no disponible en esta busqueda | no aplica | no disponible en esta busqueda | variable segun implementacion | publica |
| YuNet | no disponible en esta busqueda | no aplica | no disponible en esta busqueda | variable segun implementacion | publica |
| YOLOv8-face | no disponible en esta busqueda | no aplica | no disponible en esta busqueda | AGPL/variable segun version | publica |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Los detectores faciales suelen mostrar sesgos de rendimiento según tono de piel, género, edad, oclusión y condiciones de iluminación, pero no hay datos específicos de este checkpoint.
- Riesgo de alucinación: no aplica en el sentido de un modelo generativo; sí existe riesgo de falsos positivos y falsos negativos en la detección, sin cifras publicadas.
- Limitaciones de contexto o idioma: no aplica (modelo de visión). Se desconoce el rango de resoluciones de entrada soportado.
- Restricciones de licencia: la licencia declarada es MIT, permisiva y apta para uso comercial, siempre que se conserve el aviso de copyright. Conviene verificar los términos del modelo base SCRFD si este checkpoint deriva de un entrenamiento sobre dicho método.
- Caveats para producción: la model card está vacía; no hay información sobre el dataset de entrenamiento, la procedencia de los pesos, la existencia de datos personales o el cumplimiento del RGPD. El uso de detección facial en la Unión Europea está sujeto a restricciones específicas del Reglamento de IA (por ejemplo, prohibición de identificación biométrica remota en tiempo real en espacios públicos con fines policiales), por lo que es imprescindible una evaluación legal previa.
- Recomendación: no desplegar en producción sin contactar con el autor o consultar la documentación oficial de NXP para obtener la arquitectura, las métricas y el soporte real de hardware.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nxp/scrfd-500m-imx
- Sitio corporativo de NXP Semiconductors: https://www.nxp.com/
- Catalogo de productos de NXP: https://www.nxp.com/products:PCPRODCAT
- NXP Semiconductors en Wikipedia: https://en.wikipedia.org/wiki/NXP_Semiconductors
- Referencia de la arquitectura SCRFD (no confirmada para este checkpoint): arXiv 2105.04714, "Sample and Computation Redistribution for Efficient Face Detection"
