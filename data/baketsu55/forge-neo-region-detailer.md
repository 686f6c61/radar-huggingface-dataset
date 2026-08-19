# baketsu55/forge-neo-region-detailer

## Resumen

Forge Neo Region Detailer es una extensión experimental para Stable Diffusion WebUI Forge Neo, desarrollada por el usuario baketsu55. Su objetivo es proporcionar un flujo de trabajo de detección de regiones e inpainting secuencial, similar al Impact Pack de ComfyUI, pero adaptado a la interfaz y al sistema de procesamiento de Forge Neo. La extensión se centra principalmente en la generación de anime e ilustraciones con el modelo Anima, aunque también puede funcionar con otras familias de modelos compatibles con Forge Neo.

La herramienta permite detectar automáticamente caras, manos y personas mediante detectores YOLO o MediaPipe, y aplicar pasadas de inpainting sobre esas regiones para refinar detalles. Incluye filtrado por confianza o área, ordenación de regiones, selección explícita mediante números, prompts específicos por región y ajustes finos de máscara. Se distribuye como un paquete ZIP que se instala en la carpeta `extensions` de Forge Neo, y su versión actual es la v0.1.0, considerada una vista previa temprana que ha pasado pruebas unitarias y de sintaxis, pero que aún requiere pruebas de integración en instalaciones reales.

La relevancia de esta extensión radica en que aporta a Forge Neo una funcionalidad de refinamiento automático de regiones que hasta ahora solo estaba disponible en otros entornos como ComfyUI, y lo hace de forma nativa, sin depender de herramientas externas. Su licencia AGPL-3.0 permite su uso y modificación, aunque con obligaciones de copyleft.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Extension para Stable Diffusion WebUI Forge Neo (codigo Python) |
| Parametros totales | No disponible (no es un modelo entrenado) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica) |
| Tipos de cuantizacion | No disponible (no aplica) |
| Idiomas soportados | No disponible (la documentacion esta en ingles y japones) |
| Licencia | AGPL-3.0 |
| Formato de pesos | No disponible (no aplica; se distribuye como codigo fuente y ZIP) |

## Arquitectura y entrenamiento

Forge Neo Region Detailer no es un modelo de inteligencia artificial entrenado, sino una extensión de software que se integra en el entorno de Stable Diffusion WebUI Forge Neo. Su arquitectura se basa en dos componentes principales: un sistema de detección de regiones heredado de ADetailer Neo, que utiliza detectores YOLO y MediaPipe para localizar caras, manos y personas en la imagen generada; y un pipeline de inpainting nativo de Forge Neo, que aplica pasadas de img2img/inpaint sobre las regiones detectadas.

No se han publicado datos sobre entrenamiento, ya que la extensión no incluye pesos propios. Los detectores utilizados son modelos preentrenados de terceros que se descargan durante la primera ejecución, y no se redistribuyen en el repositorio. La extensión se apoya en el sistema de procesamiento de Forge Neo para la generación inicial y las pasadas de refinamiento, por lo que su funcionamiento depende de la versión de Forge Neo y de los detectores compatibles.

## Capacidades

- Detección de regiones de caras, manos y personas mediante modelos YOLO o MediaPipe compatibles.
- Filtrado de detecciones por confianza, área relativa, área superior N o confianza superior N.
- Ordenación de regiones detectadas según criterios: de izquierda a derecha, del centro hacia los bordes, o de mayor a menor área.
- Selección explícita de regiones mediante números de uno en uno (por ejemplo, `1,3-5`) para procesar solo las regiones deseadas.
- Control del orden de procesamiento de las regiones mediante secuencias como `4-2` o `3,1`.
- Asignación de prompts positivos y negativos específicos por región, usando el separador `[SEP]`.
- Configuración independiente de sampler, scheduler, pasos, CFG, checkpoint, VAE y resolución de inpainting para cada región.
- Ajuste de máscara con parámetros de padding, blur, dilatación, erosión, desplazamiento y fuerza de denoise.
- Integración nativa con el pipeline de post-generación de Forge Neo, sin necesidad de herramientas externas.

## Casos de uso

- Refinamiento de caras en ilustraciones de anime: tras generar una imagen, la extensión detecta automáticamente los rostros y aplica una pasada de inpainting a mayor resolución para corregir imperfecciones en ojos, boca o contornos, manteniendo la coherencia con el estilo original.
- Corrección de manos y dedos: los detectores de manos permiten localizar extremidades malformadas y re-generarlas con prompts específicos, un problema frecuente en la generación de imágenes con modelos de difusión.
- Mejora de personajes secundarios en escenas complejas: al seleccionar regiones concretas mediante números, se puede refinar solo a los personajes que aparecen en segundo plano sin alterar el resto de la composición.
- Aplicación de estilos diferenciados por región: usando `[SEP]`, se pueden asignar prompts distintos a cada cara detectada, por ejemplo, para dar expresiones o iluminación diferentes a cada personaje en una misma imagen.
- Automatización de flujos de producción de ilustraciones: la extensión puede integrarse en pipelines de generación masiva donde se requiere un control fino sobre los detalles de cada personaje, reduciendo la intervención manual.
- Experimentación con diferentes checkpoints o VAE por región: al permitir configuraciones independientes, se puede probar cómo afecta un modelo concreto a una parte específica de la imagen sin regenerar todo el conjunto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La extension se encuentra en fase de vista previa temprana (v0.1.0) y no se han documentado metricas de rendimiento, latencia o calidad de deteccion en comparacion con otras herramientas similares.

## Requisitos de hardware

- Requiere una instalacion funcional de Stable Diffusion WebUI Forge Neo, que a su vez necesita una GPU compatible con CUDA y suficiente VRAM para ejecutar modelos de difusion (tipicamente 8 GB o mas, dependiendo del checkpoint y la resolucion).
- Los detectores YOLO y MediaPipe son ligeros y pueden ejecutarse en CPU, pero el proceso de inpainting se realiza en GPU, por lo que la VRAM disponible determinara el tamano maximo de las regiones a procesar.
- No se han especificado requisitos minimos concretos para la extension en la documentacion disponible.
- Opciones de despliegue: la extension se instala directamente en Forge Neo, por lo que no requiere servidores adicionales. Se recomienda usar una GPU de gama media o alta (por ejemplo, RTX 3060 o superior) para un flujo de trabajo fluido.
- No se han publicado datos de latencia o throughput para la extension.

## Comparativa con modelos similares

| Herramienta | Entorno | Funcionalidad principal | Licencia | Estado |
|---|---|---|---|---|
| Forge Neo Region Detailer | Forge Neo | Deteccion de regiones e inpainting secuencial | AGPL-3.0 | Vista previa temprana (v0.1.0) |
| ADetailer Neo | Forge Neo | Deteccion automatica, enmascarado e inpainting | No especificada | Activo |
| Impact Pack (ComfyUI) | ComfyUI | Deteccion de regiones, segmentacion e inpainting | GPL-3.0 | Activo |

Forge Neo Region Detailer comparte el enfoque de ADetailer Neo, pero se diferencia por ofrecer un control mas granular sobre la seleccion y el orden de las regiones, asi como prompts y configuraciones independientes por region. Frente al Impact Pack de ComfyUI, su ventaja es la integracion nativa con la interfaz de Forge Neo, aunque su funcionalidad es mas limitada en cuanto a tipos de deteccion y opciones de segmentacion.

## Limitaciones y advertencias

- La version v0.1.0 es una vista previa temprana que ha pasado pruebas unitarias y de sintaxis, pero no ha sido probada en integracion con instalaciones reales de Forge Neo. Se recomienda hacer copias de seguridad de configuraciones e imagenes antes de probarla.
- No se deben instalar simultaneamente ADetailer Neo y Region Detailer en la misma instalacion, ya que comparten nombres de modulos internos y pueden provocar conflictos.
- La extension no redistribuye pesos de detectores de terceros; estos se descargan durante la primera ejecucion, lo que requiere conexion a internet y puede fallar si los repositorios de origen no estan disponibles.
- El soporte de idiomas no esta documentado; la interfaz y la documentacion estan en ingles y japones, lo que puede limitar su uso para hablantes de otros idiomas.
- Al ser una extension experimental, es posible que contenga errores no detectados en las pruebas unitarias, especialmente en flujos de trabajo complejos con multiples regiones o configuraciones personalizadas.
- La licencia AGPL-3.0 implica que cualquier modificacion o uso en un servicio de red debe publicar el codigo fuente modificado, lo que puede ser una restriccion para usos comerciales cerrados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/baketsu55/forge-neo-region-detailer
- Repositorio de ADetailer Neo en GitHub: https://github.com/Haoming02/ADetailer-Neo
- Repositorio de AADetailer NeoForge en GitHub: https://github.com/abzaloff/aadetailer-neoforge
- Guia de Forge Neo UI (agosto 2026): https://www.thundercompute.com/blog/forge-ui-ai-image-generation
