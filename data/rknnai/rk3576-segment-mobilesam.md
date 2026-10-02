# RKNNAI/RK3576-SEGMENT-MobileSAM

## Resumen

RK3576-SEGMENT-MobileSAM es una conversión al formato RKNN del modelo MobileSAM (Mobile Segment Anything Model), un segmentador de imágenes derivado del Segment Anything Model (SAM). La distribución la publica el usuario RKNNAI en HuggingFace y toma como origen el repositorio airockchip/MobileSAM, integrado en el RKNN Model Zoo. No es un modelo de lenguaje: es un modelo de segmentación que produce máscaras de objetos a partir de indicaciones (prompts) como puntos o cajas.

El objetivo de este paquete es permitir la ejecución del pipeline MobileSAM sobre la NPU del SoC Rockchip RK3576, evitando la conversión manual desde PyTorch. El repositorio incluye una única configuración, `MobileSAM-448x448-fp16-1`, con encoder y decoder en precisión fp16, resolución de encoder de 448x448 y un núcleo NPU asignado a cada componente. El runtime RKNN requerido es la versión v2.4.0.

Su relevancia es práctica: permite desplegar segmentación de imágenes de alta calidad en hardware embebido de bajo consumo, con verificación de integridad mediante SHA-256 y descarga reproducible por revisión. El repositorio ocupa 0,1 GB. La licencia es Apache 2.0, heredada del modelo upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pipeline MobileSAM: encoder de imagen + decoder de mascaras, convertido a RKNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de segmentacion de imagenes) |
| Tipos de cuantizacion | fp16 (encoder y decoder) en la configuracion `MobileSAM-448x448-fp16-1` |
| Idiomas soportados | no aplicable |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (runtime v2.4.0) |
| Tipo de modelo | SEGMENT |
| Chips soportados | RK3576 |
| Nucleos NPU | encoder: 1; decoder: 1 |
| Resolucion del encoder | 448x448 |
| Modelo de origen | airockchip/MobileSAM |
| Tamano del repositorio | 0,1 GB |
| Fecha de publicacion (metadatos) | 2026-10-02 |

## Arquitectura y entrenamiento

El modelo upstream MobileSAM conserva exactamente el mismo pipeline que el SAM original salvo un cambio en el encoder de imagen, segun la documentacion de referencia citada. SAM genera mascaras de objetos de alta calidad a partir de prompts como puntos o cajas, y puede producir mascaras para todos los objetos de una imagen. En esta distribucion, tanto el encoder de imagen como el decoder de dos prompts fijos se ejecutan como modelos RKNN independientes.

La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO (conceptos, por otra parte, propios de modelos generativos de texto). Tampoco se documenta en esta ficha la existencia de tecnicas de decodificacion especulativa o atencion lineal. El unico proceso tecnico documentado es la conversion del modelo fuente a RKNN para RK3576 con la precision indicada por configuracion, preservando las clausulas de copyright y atribucion del proyecto original.

## Capacidades

- Segmentacion de imagenes guiada por prompts (puntos o cajas) para producir mascaras de objetos.
- Generacion de mascaras para todos los objetos presentes en una imagen, siguiendo el comportamiento del SAM original.
- Ejecucion en la NPU del RK3576 con encoder y decoder separados.
- Procesamiento de imagenes a resolucion de encoder 448x448.
- Inferencia a precision fp16 en encoder y decoder.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni modo de pensamiento (thinking mode).
- No incorpora vision-language, audio ni generacion de texto.

## Casos de uso

- Segmentacion interactiva en el borde (edge): el modelo permite seleccionar objetos mediante puntos o cajas directamente en el dispositivo RK3576, sin enviar imagenes a la nube, lo que reduce latencia y preserva la privacidad.
- Anotacion asistida de datasets de vision por computador: los operadores pueden generar mascaras preliminares que luego se refinan, acelerando el etiquetado de imagenes para entrenar otros modelos.
- Eliminacion de fondo y recorte de objetos: la mascara generada permite aislar sujetos en aplicaciones de edicion, catalogos de producto o composicion fotografica en tiempo real sobre hardware embebido.
- Robotica y navegacion: segmentar objetos relevantes del entorno en un SoC de bajo consumo para tareas de manipulacion, evitacion de obstaculos o seguimiento visual.
- Inspeccion industrial y control de calidad: definir regiones de interes sobre lineas de produccion para detectar o medir componentes, apoyandose en la NPU del RK3576 para operar de forma continua.
- Vigilancia y videovigilancia en camaras IP: segmentar personas, vehiculos u otros objetos en el propio dispositivo, reduciendo el ancho de banda necesario al transmitir solo las mascaras o metadatos.
- Aplicaciones de realidad aumentada y vision movil: aislar planos u objetos para superponer contenido digital sobre la imagen capturada por la camara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware obligatorio: SoC Rockchip RK3576 con NPU. El artefacto RKNN es especifico de esta plataforma.
- Runtime: RKNN Runtime version v2.4.0.
- Asignacion de NPU: 1 nucleo para el encoder y 1 nucleo para el decoder, segun la configuracion `MobileSAM-448x448-fp16-1`.
- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 0,1 GB en disco.
- GPU recomendadas: no aplicable. El formato RKNN no se ejecuta en GPUs de escritorio (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no. Para GPUs convencionales habria que emplear el modelo upstream en PyTorch u otro formato, no este paquete RKNN.
- Opciones de despliegue: RKNN Runtime sobre RK3576, con ejemplos del RKNN Model Zoo (`examples/mobilesam`) y flujos documentados en sensecraft.seeed.cc.
- Latencia y throughput estimados: no disponible.
- Verificacion de integridad: el paquete incluye `SHA256SUMS` para validar los ficheros antes del despliegue.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Resolucion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RK3576-SEGMENT-MobileSAM (este) | Segmentacion | no disponible | 448x448 (encoder) | RKNN (runtime v2.4.0) | Apache 2.0 | HuggingFace y ModelScope |
| MobileSAM upstream (airockchip/MobileSAM) | Segmentacion | no disponible | no disponible | PyTorch / ONNX y otros | Apache 2.0 | GitHub |
| SAM original (Segment Anything) | Segmentacion | no disponible | no disponible | PyTorch y otros | no disponible en la informacion proporcionada | Repositorio original |
| FastSAM | Segmentacion | no disponible | no disponible | PyTorch y otros | no disponible en la informacion proporcionada | Repositorio original |

Nota: los datos de parametros y resolucion de las alternativas no se detallan en la informacion proporcionada. La diferencia principal de este paquete frente a las alternativas es el formato de despliegue: RKNN optimizado para la NPU del RK3576.

## Limitaciones y advertencias

- Dependencia de hardware: el artefacto solo funciona en RK3576 con RKNN Runtime v2.4.0. No es portable a otras plataformas sin reconversion.
- Resolucion fija: el encoder trabaja a 448x448, lo que puede limitar la precision en imagenes con objetos muy pequenos o de resolucion muy alta.
- Precision fp16: puede introducir pequenas diferencias numericas respecto al modelo en punto flotante completo.
- Uso de ficheros consistentes: la documentacion advierte de que deben usarse los ficheros de la misma configuracion.
- Alucinacion: no aplica en el sentido de generacion de texto, pero el modelo puede producir mascaras incorrectas o incompletas ante prompts ambiguos u objetos poco definidos.
- Sesgos: no se documentan sesgos concretos en la informacion disponible.
- Idiomas: no aplicable, al no tratarse de un modelo linguistico.
- Licencia: Apache 2.0, permite uso comercial, siempre que se mantengan las clausulas de copyright y atribucion del proyecto original incluidas en el fichero LICENSE.
- Produccion: se recomienda verificar la integridad con `sha256sum -c SHA256SUMS` antes del despliegue, segun indica la model card.
- Ausencia de benchmarks publicados: no hay datos verificables de rendimiento que permitan estimar calidad frente a otras alternativas.

## Enlaces

- HuggingFace: https://huggingface.co/RKNNAI/RK3576-SEGMENT-MobileSAM
- README en chino: https://huggingface.co/RKNNAI/RK3576-SEGMENT-MobileSAM/blob/main/README_CN.md
- Modelo fuente (GitHub): https://github.com/airockchip/MobileSAM
- RKNN Model Zoo, ejemplo MobileSAM: https://github.com/airockchip/rknn_model_zoo/tree/main/examples/mobilesam
- RKNN Model Zoo, README del ejemplo: https://github.com/airockchip/rknn_model_zoo/blob/main/examples/mobilesam/README.md
- Guia de ejecucion en RK3576 (sensecraft): https://sensecraft.seeed.cc/ai-lab/en/models/mobilesam-rknn/rk3576
- MobileSAM en reComputer AI Lab (sensecraft): https://sensecraft.seeed.cc/ai-lab/en/models/mobilesam-rknn
