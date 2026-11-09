# APLUX-Agora/ConvNeXt-Tiny

## Resumen

ConvNeXt-Tiny es una red neuronal convolucional (CNN) para clasificación de imágenes, publicada en Hugging Face por APLUX-Agora como parte de su catálogo Agora Model Farm. El repositorio no contiene los pesos originales de ConvNeXt-Tiny en formato estándar (safetensors o GGUF), sino artefactos ya convertidos y empaquetados para su despliegue en placas con SoC Qualcomm, con variantes de precisión FP16, W8A16 y W8A8 y binarios de contexto (`model.bin`) listos para ejecución en dichos aceleradores.

La relevancia de esta ficha no está en la arquitectura del modelo (que corresponde al ConvNeXt-Tiny original de Meta AI, ~28 millones de parámetros y 224x224 de entrada), sino en el trabajo de conversión y validación por placa que aporta APLUX-Agora: el autor reporta latencias medidas en hardware real (7,3 ms en QCS6490 y 2,4 ms en QCS8550 a precisión por defecto) y ofrece un flujo de descarga por SoC mediante `hf download` y un entorno online en mega.aidlux.com para probar el modelo sin disponer de placa física.

El modelo resuelve el problema de llevar una CNN de clasificación de imágenes a despliegues AIoT sobre Qualcomm, un paso habitualmente costoso por la cuantización y el empaquetado específico de cada SoC. Es relevante para equipos que construyen pipelines de visión en el borde (edge) y necesitan artefactos reproducibles con checksums y avisos de licencia, aunque conviene tener en cuenta que el repositorio es de 0,2 GB, no tiene descargas ni likes y su licencia (APLUX Model Farm License) es distinta de la del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN tipo ConvNeXt (variante Tiny); artefactos convertidos para Qualcomm QNN |
| Parametros totales | no disponible en la informacion proporcionada (ConvNeXt-Tiny original: ~28 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes) |
| Tipos de cuantizacion | FP16, W8A16, W8A8 (segun SoC) |
| Idiomas soportados | no disponible (tarea de vision; sin etiquetas de idioma) |
| Licencia | APLUX Model Farm License (`aplux-model-farm`); licencia del modelo fuente segun sus terminos originales |
| Formato de pesos | `model.bin` (binarios de contexto QNN) y `model.json` por SoC; no se publican safetensors ni GGUF |
| Entrada / salida | imagen (`image`) / etiqueta (`label`) |
| Tarea (pipeline) | `image-classification` |
| SoC soportados | QCS6490 (Rhino Pi A1), QCS8550 (Rhino Pi X1) |
| Tamano del repo | 0,2 GB |
| Fecha de publicacion | 2026-11-09 |

## Arquitectura y entrenamiento

La arquitectura subyacente es ConvNeXt en su variante Tiny, una CNN moderna que moderniza el diseño de ResNet incorporando elementos propios de los transformers (convoluciones depthwise de 7x7, normalización LayerNorm, activación GELU y proporciones de canales tipo 4:1). No se dispone en la informacion proporcionada de detalles sobre el entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o técnicas de aumento de datos), por lo que esos datos deben consultarse en la model card del ConvNeXt-Tiny original.

La innovación técnica de este repositorio es el pipeline de conversión y empaquetado para Qualcomm: cada directorio `targets/<SoC>/` contiene un `model.json` con la precisión por defecto y las rutas de las variantes, y un subdirectorio por precisión con binarios de contexto (`model.bin`). El autor indica que el preprocesado y postprocesado siguen el ejemplo oficial de Model Farm y que cada placa se ha validado de forma individual. Se incluyen `NOTICE.md` y `SHA256SUMS` para trazabilidad de los artefactos.

## Capacidades

- Clasificación de imágenes: el modelo recibe una imagen y devuelve una etiqueta (`label`) según el esquema de clases del modelo fuente.
- Inferencia en el borde (edge) sobre aceleradores Qualcomm: variantes FP16, W8A16 y W8A8 validadas en QCS6490 y QCS8550.
- Despliegue por SoC: descarga selectiva de artefactos mediante `hf download --include "targets/<SoC>/*"`.
- Prueba online sin hardware: flujo disponible en mega.aidlux.com para ejecutar el modelo en la nube.
- Exportación de proyectos: la plataforma Agora permite exportar flujos de trabajo que usan el modelo y ofrece una guía de despliegue ("部署指南").
- No se documentan en la informacion proporcionada capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión generativa, audio ni modo thinking; se trata de un clasificador de imágenes, no de un modelo generativo.

## Casos de uso

- Inspección visual en línea de fabricación: clasificar imágenes de piezas en cadenas de producción usando QCS6490 o QCS8550 embebidos; la latencia de 7,3 ms y 2,4 ms respectivamente permite operar a velocidades de línea industrial.
- Vigilancia y analítica de vídeo en el borde: clasificar fotogramas en cámaras IP con SoC Qualcomm sin enviar vídeo a la nube, reduciendo ancho de banda y cumpliendo requisitos de privacidad.
- Clasificación de residuos o productos en robótica de almacén: integrar el clasificador en un robot con QCS8550 para separar categorías en tiempo real con cuantización W8A8.
- Control de calidad agrícola: clasificar imágenes de fruta o cultivos en dispositivos de campo alimentados por batería, donde la eficiencia de la cuantización W8A16 reduce el consumo energético.
- Prototipado rápido de modelos de visión en AIoT: usar el entorno online de Agora para validar el pipeline de pre/postprocesado antes de adquirir hardware, y después descargar los artefactos del SoC objetivo.
- Detección de defectos en drones o vehículos autónomos ligeros: clasificación a bordo con FP16 en QCS8550 para tareas de bajo consumo y baja latencia.
- Docencia e investigación en despliegue de CNN: ejemplo reproducible de conversión de un modelo académico a binarios QNN con checksums y guía de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (top-1, top-5) en la informacion disponible. El autor solo reporta latencias medidas en hardware real:

| SoC · placa | Precisiones | Latencia (precision por defecto) |
|---|---|---|
| QCS6490 · Rhino Pi A1 | W8A16, W8A8 | 7,3 ms |
| QCS8550 · Rhino Pi X1 | FP16, W8A16, W8A8 | 2,4 ms |

No se especifica en la informacion proporcionada el tamaño de lote, la resolución de entrada ni el número de repeticiones usadas en la medición.

## Requisitos de hardware

- VRAM: no aplica en el sentido tradicional; el modelo se ejecuta en aceleradores integrados de SoC Qualcomm (QCS6490, QCS8550) con memoria compartida del sistema.
- GPU recomendadas: no aplica; el despliegue objetivo son los NPU/DSP de Qualcomm integrados en los SoC indicados.
- Cabe en consumer GPU: no disponible; no se publican pesos en safetensors ni GGUF para ejecución en GPU de escritorio.
- Opciones de despliegue: binarios QNN (`model.bin`) por SoC y precisión, gestionados por el runner de Agora; descarga vía `hf download`; prueba online en mega.aidlux.com.
- Latencia: 7,3 ms en QCS6490 y 2,4 ms en QCS8550 a precisión por defecto; no se dispone de datos de throughput (imágenes por segundo) ni de latencia para FP16 en QCS6490.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| ConvNeXt-Tiny (APLUX-Agora) | no disponible (~28 M en el original) | imagen 224x224 (segun original) | APLUX Model Farm License | Artefactos QNN por SoC en Hugging Face |
| ConvNeXt-Tiny (original, Meta AI) | ~28 M | imagen 224x224 | CC BY 4.0 (segun el original) | Pesos en Hugging Face / repositorio oficial |
| ResNet-50 | ~25,6 M | imagen 224x224 | Apache 2.0 (segun el original) | Pesos en torchvision y Hugging Face |
| MobileNetV3-Large | ~5,4 M | imagen 224x224 | Apache 2.0 (segun el original) | Pesos en torchvision y Hugging Face |

No se dispone en la informacion proporcionada de datos de precisión (top-1/top-5) para comparar el rendimiento de estos modelos; la comparativa se limita a tamaño, licencia y disponibilidad. Las cifras de parámetros de los modelos alternativos corresponden a sus versiones originales y deben verificarse en sus respectivas fichas.

## Limitaciones y advertencias

- El repositorio no contiene pesos en formato estándar (safetensors, GGUF, PyTorch); solo binarios QNN para los SoC indicados, lo que limita su uso fuera de Qualcomm.
- La licencia APLUX Model Farm License se aplica a los recursos convertidos; la licencia del modelo fuente es independiente y debe revisarse antes de cualquier uso comercial.
- No se publican métricas de precisión (top-1/top-5) ni evaluación de sesgos; el rendimiento en clases concretas es desconocido.
- Riesgo de degradación por cuantización: las variantes W8A16 y W8A8 pueden perder precisión frente a FP16; no se documenta el impacto medido.
- Solo se validan dos placas (QCS6490 y QCS8550); otros SoC Qualcomm pueden no estar soportados.
- El modelo es un clasificador de imágenes: no genera texto, no soporta tool calling ni razonamiento multi-paso, y no debe presentarse como un LLM.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación de la comunidad.
- No se especifican los idiomas ni el esquema de etiquetas de salida; debe consultarse la guía de despliegue de Agora para conocer el mapeo de clases.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/APLUX-Agora/ConvNeXt-Tiny
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/ConvNeXt-Tiny/blob/main/LICENSE_MODEL_FARM.pdf
- Prueba online del modelo en Agora: https://mega.aidlux.com/models/convnext-tiny
- Plataforma Agora: https://mega.aidlux.com
- Modelo original ConvNeXt-Tiny (referencia): https://huggingface.co/facebook/convnext-tiny-224
