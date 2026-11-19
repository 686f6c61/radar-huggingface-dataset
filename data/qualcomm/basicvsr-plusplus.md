# qualcomm/BasicVSR-PlusPlus

## Resumen

BasicVSR-PlusPlus es un modelo de superresolución de vídeo que escala fotogramas de baja resolución por un factor de 4x. Fue presentado en CVPR 2022 y esta implementación concreta, publicada por Qualcomm en Hugging Face, contiene los artefactos pre-exportados y optimizados para ejecutarse en dispositivos con aceleración NPU de Qualcomm (Snapdragon, Dragonwing y QCS). El modelo original procede del repositorio de referencia de ckkelvinchan y emplea propagación temporal bidireccional, alineamiento deformable de segundo orden y estimación de flujo óptico mediante SPyNet.

La relevancia de esta ficha no reside en el modelo en sí, sino en el paquete de despliegue: Qualcomm distribuye los pesos compilados en ONNX y QNN_DLC, en precisión float y cuantización w8a8, con métricas de latencia medidas sobre NPU para una docena de chipsets. Esto permite integrar superresolución de vídeo en tiempo real en movil, XR o automoción sin depender de GPU de servidor.

Arquitectónicamente es un modelo de visión por computador, no un LLM: no genera texto ni soporta tool calling. Su entrada es un par de fotogramas de 64x64 píxeles y su salida es una imagen de 256x256, con un total aproximado de 9,8 millones de parámetros repartidos en siete subredes (flownet, extractor de características, cuatro módulos de propagación y reconstrucción).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional recurrente para superresolución de vídeo con propagación bidireccional, alineamiento deformable de segundo orden y flujo óptico SPyNet |
| Parametros totales | Aproximadamente 9,83 M (suma de subredes: flownet 1,52 M; feat_extract 371 K; prop_backward_1 1,71 M; prop_forward_1 1,74 M; prop_backward_2 1,78 M; prop_forward_2 1,82 M; reconstruction 888 K) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; entrada de 2 fotogramas de 64x64 píxeles |
| Tipos de cuantizacion | float (FP32/FP16 según runtime) y w8a8 (pesos y activaciones a 8 bits) |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (float y w8a8), QNN_DLC (float y w8a8), checkpoint PyTorch original `basicvsr_plusplus_reds4.pth` |

## Arquitectura y entrenamiento

BasicVSR++ es una evolución de BasicVSR que introduce dos mejoras clave: alineamiento deformable de segundo orden, que permite agregar información de fotogramas vecinos más allá de una única vecindad, y propagación bidireccional con conexiones recurrentes que reutilizan características de pasos anteriores. El flujo óptico se estima con SPyNet, una red ligera que alimenta los módulos de alineamiento. La reconstrucción final se realiza con un módulo convolucional que produce la salida a 4x de resolución.

El checkpoint original (`basicvsr_plusplus_reds4.pth`) se entrenó sobre el conjunto REDS4, un dataset de vídeo de alta resolución ampliamente usado en la literatura de superresolución de vídeo. La model card no detalla el número de tokens, la composición exacta del dataset ni si hubo etapas de refinamiento adicionales; estos datos deben consultarse en el paper original (arXiv:2104.13371). La innovación práctica de esta versión de Qualcomm es el pipeline de exportación y cuantización: los módulos se separan en siete subgrafos independientes, lo que permite compilarlos por separado para NPU y medir latencia y memoria pico de forma granular.

## Capacidades

- Superresolución de vídeo 4x: acepta pares de fotogramas de 64x64 y produce salidas de 256x256.
- Propagación temporal bidireccional: aprovecha información de fotogramas anteriores y posteriores para mejorar la coherencia temporal.
- Alineamiento deformable de segundo orden: corrige desplazamientos complejos entre fotogramas, incluyendo movimientos no rígidos.
- Estimación de flujo óptico integrada mediante SPyNet.
- Ejecución en NPU de Qualcomm: los artefactos QNN_DLC y ONNX están compilados para los aceleradores Hexagon de Snapdragon y Dragonwing.
- Cuantización w8a8 lista para producción, con reducción de tamaño de aproximadamente 2,4x respecto a float (por ejemplo, feat_extract pasa de 1,42 MB a 441 KB).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de audio.

## Casos de uso

- Mejora de vídeo en tiempo real en movil: el modelo procesa pares de fotogramas de 64x64 en menos de 1 ms por subred en NPU de Snapdragon 8 Elite, lo que permite integrarlo en pipelines de cámara para reescalar vídeo capturado a baja resolución antes de codificarlo.
- Restauración de vídeo archivado: aplicar el modelo a grabaciones históricas de baja resolución para generar versiones 4x, aprovechando la propagación bidireccional para mantener coherencia entre fotogramas consecutivos.
- Superresolución en dispositivos XR: los chipsets Snapdragon X Elite y X2 Elite ejecutan el extractor de características en 0,24-0,43 ms, lo que hace viable reescalar contenido de vídeo en gafas o visores sin GPU dedicada.
- Videovigilancia con ancho de banda limitado: transmitir flujos a baja resolución y reescalar en el dispositivo receptor con NPU, reduciendo el consumo de red sin perder detalle útil para identificación.
- Automoción y sistemas embebidos: los chipsets Dragonwing (QCS8550, QCS6490, IQ-X7181, Q-8750) están orientados a vehículos industriales; el modelo puede integrarse en pipelines de percepción que necesiten mejorar la resolución de cámaras de bajo coste.
- Telemedicina y transmisión de imagen médica: reescalar vídeo de exploraciones o consultas remotas capturado con hardware de baja resolución, con la ventaja de que la cuantización w8a8 reduce el espacio en memoria (por ejemplo, reconstruction pasa de 3,40 MB a 991 KB).
- Preprocesado para otros modelos de visión: usar la salida 4x como entrada de detectores o segmentadores que se beneficien de mayor resolución, ejecutando todo el pipeline en la misma NPU.

## Benchmarks y rendimiento

La model card no publica métricas de calidad (PSNR, SSIM) sobre REDS4 ni otros conjuntos. Sí incluye latencias medidas por subred y chipset. Se reproduce una selección representativa:

| Subred | Runtime | Precision | Chipset | Latencia (ms) | Memoria pico (MB) |
|---|---|---|---|---|---|
| feat_extract | ONNX | float | Snapdragon 8 Elite Gen 5 For Galaxy | 0,247 | 0-24 |
| feat_extract | ONNX | float | Snapdragon X2 Elite | 0,243 | 3-3 |
| feat_extract | ONNX | float | Snapdragon X Elite | 0,425 | 2-2 |
| feat_extract | ONNX | float | Snapdragon 8 Gen 1 | 0,697 | 1-45 |
| feat_extract | ONNX | float | Dragonwing QCS8550 (proxy) | 0,439 | 0-3 |
| feat_extract | ONNX | w8a8 | Snapdragon 8 Elite Gen 5 For Galaxy | 0,112 | 0-27 |
| feat_extract | ONNX | w8a8 | Snapdragon X2 Elite | 0,101 | 1-1 |
| feat_extract | ONNX | w8a8 | Snapdragon X Elite | 0,166 | 1-1 |
| feat_extract | ONNX | w8a8 | Snapdragon 8 Gen 1 | 0,277 | 0-41 |
| feat_extract | ONNX | w8a8 | Dragonwing QCS6490 | 0,848 | 0-3 |

La cuantización w8a8 reduce la latencia del extractor de características aproximadamente a la mitad en todos los chipsets comparados. No se han publicado resultados de benchmarks de calidad de imagen (PSNR/SSIM) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo está pensado para NPU. El tamaño total en float ronda los 38 MB (suma de las siete subredes) y en w8a8 aproximadamente 15 MB.
- GPU recomendadas: no se especifican; el paquete está orientado a NPU de Qualcomm. Para ejecución en GPU convencional habría que reexportar los ONNX a un runtime como ONNX Runtime con CUDA o TensorRT.
- Cabe en cualquier dispositivo con NPU Hexagon de las generaciones listadas; el consumo de memoria pico por subred oscila entre 1 MB y 45 MB según chipset y precisión.
- Opciones de despliegue: ONNX Runtime 1.30.0 con QAIRT 2.51, o QNN_DLC con QAIRT 2.51. La librería `ai-hub-models` (v0.67.0) permite reexportar con pesos y formas personalizadas.
- Latencia y throughput: el extractor de características se ejecuta en 0,10-0,85 ms según chipset y precisión; el resto de subredes no se detalla en el fragmento disponible. Para latencias completas del pipeline debe consultarse la página de Qualcomm AI Hub.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BasicVSR-PlusPlus (esta ficha) | ~9,83 M | 2 fotogramas 64x64 | Superresolución de vídeo 4x con propagación bidireccional | Apache 2.0 | Hugging Face (Qualcomm), GitHub original |
| BasicVSR (original) | No disponible en la información | No disponible | Superresolución de vídeo recurrente sin alineamiento de segundo orden | No disponible | GitHub |
| SPyNet | 1,52 M (solo flownet) | Par de fotogramas | Estimación de flujo óptico | No disponible | Incluido como subred |
| Otros modelos de superresolución de vídeo (EDVR, VRT) | No disponible | No disponible | Distintos enfoques temporales | No disponible | No disponible |

La comparación con alternativas de la misma categoría no puede completarse con datos verificables a partir de la información proporcionada; se indica "no disponible" para los campos que no constan.

## Limitaciones y advertencias

- Modelo de visión: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier uso conversacional es inviable.
- Entrada fija de 64x64 y 2 fotogramas en la configuración por defecto; para otras resoluciones o ventanas temporales hay que reexportar con `ai-hub-models`.
- No se publican métricas de calidad (PSNR/SSIM) en la model card; el rendimiento visual debe validarse empíricamente sobre el dominio de aplicación.
- La cuantización w8a8 puede introducir artefactos en texturas finas o movimientos rápidos; conviene comparar float frente a w8a8 en el caso de uso concreto.
- El modelo está optimizado para NPU de Qualcomm; en otras plataformas el rendimiento puede degradarse notablemente o requerir reexportación.
- Licencia Apache 2.0 permite uso comercial, pero el modelo original y el paper deben citarse adecuadamente; verificar la licencia del checkpoint base en el repositorio de ckkelvinchan.
- Riesgo de alucinación no aplica (no es generativo de texto), pero sí puede producir detalles inventados en la reconstrucción de texturas, un fenómeno conocido en superresolución.
- No hay información sobre sesgos demográficos o geográficos; al ser un modelo de mejora de imagen, el riesgo principal es la amplificación de artefactos presentes en la entrada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto recién publicado y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/qualcomm/BasicVSR-PlusPlus
- Qualcomm AI Hub (modelo): https://aihub.qualcomm.com/models/basicvsr_pp
- Repositorio `ai-hub-models` en GitHub: https://github.com/qualcomm/ai-hub-models/blob/v0.67.0/src/qai_hub_models/models/basicvsr_pp
- Implementación original de BasicVSR++: https://github.com/ckkelvinchan/BasicVSR_PlusPlus
- Paper (arXiv): https://arxiv.org/abs/2104.13371
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Descarga ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/basicvsr_pp/releases/v0.67.0/basicvsr_pp-onnx-float.zip
- Descarga ONNX w8a8: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/basicvsr_pp/releases/v0.67.0/basicvsr_pp-onnx-w8a8.zip
- Descarga QNN_DLC float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/basicvsr_pp/releases/v0.67.0/basicvsr_pp-qnn_dlc-float.zip
- Descarga QNN_DLC w8a8: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/basicvsr_pp/releases/v0.67.0/basicvsr_pp-qnn_dlc-w8a8.zip
