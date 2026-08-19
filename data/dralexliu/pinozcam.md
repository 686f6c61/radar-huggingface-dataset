# DrAlexLiu/PiNozCam

## Resumen

PiNozCam es un conjunto de modelos de inferencia precompilados y pre-cuantizados para la detección de fallos en impresión 3D, desarrollado por DrAlexLiu como parte del plugin OctoPrint-PiNozCam. El modelo vigila una cámara de boquilla (nozzle camera) y detecta anomalías durante el proceso de impresión, ejecutándose íntegramente en el edge (Raspberry Pi u otros dispositivos) sin necesidad de servicios en la nube ni suscripciones.

El repositorio contiene ocho artefactos de inferencia dirigidos a distintos procesadores: un archivo portable para CPU (ExecuTorch, int8), uno para GPU Vulkan (ExecuTorch, int8) y seis binarios específicos para NPU de Rockchip, Allwinner y D-Robotics. Todos comparten el mismo contrato de entrada/salida: entrada de 640x384 RGB y salida de 10 tensores que el plugin decodifica en cajas, puntuaciones y una fracción de severidad. La licencia es AGPL-3.0 y el tamaño total del repositorio es de 0,3 GB.

La relevancia de este modelo radica en su enfoque práctico para el monitoreo de impresión 3D en dispositivos de bajo consumo, con cuantización int8 y compilación específica para cada plataforma, lo que permite inferencia local sin depender de hardware especializado ni de conexión a internet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de deteccion de objetos, no se especifica la red concreta) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | int8 (todos los artefactos) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | .pte (ExecuTorch), .rknn (Rockchip), .nb (Allwinner/VeriSilicon), .bin (D-Robotics) |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo no se documenta en la informacion disponible. Se trata de un detector de objetos de una sola pasada, cuantizado a int8 y compilado para diferentes backends de ejecucion. El entrenamiento tampoco se detalla: no se indica el numero de tokens (al ser un modelo de vision, no aplica), la composicion del dataset de entrenamiento ni si se emplearon tecnicas como RLHF o DPO.

La innovacion tecnica principal reside en la compilacion especifica por hardware: los archivos `.pte` de ExecuTorch son portables entre CPUs (armhf, aarch64, x86-64, macOS arm64) y GPUs Vulkan, mientras que los binarios de NPU (`.rknn`, `.nb`, `.bin`) llevan un identificador de hardware y son rechazados en tiempo de carga por cualquier otro chip. El archivo de CPU es bit-identico entre arquitecturas porque la inferencia int8 es aritmetica de enteros sin reasociacion de coma flotante.

El preprocesado esta integrado en el grafo: la normalizacion se realiza dentro del modelo, de modo que el llamador solo debe redimensionar la imagen a 640x384 con el metodo BICUBIC de Pillow (no OpenCV, cuyos coeficientes difieren y pueden alterar la precision). La entrada es RGB crudo de 0 a 255, y la salida son 10 tensores que el plugin decodifica en cajas delimitadoras, puntuaciones de confianza y una fraccion de severidad.

## Capacidades

- Deteccion de objetos en tiempo real para vigilancia de impresion 3D, especificamente orientada a la deteccion de fallos en la boquilla (por ejemplo, obstrucciones, despegue de capas o extrusion irregular).
- Inferencia en el edge sin conexion a internet ni servicios en la nube, con ejecucion local en CPU, GPU Vulkan o NPU de bajo consumo.
- Cuantizacion int8 que reduce el uso de memoria y acelera la inferencia en hardware limitado.
- Portabilidad del artefacto de CPU entre multiples arquitecturas (armhf, aarch64, x86-64, macOS arm64) sin recompilacion.
- Soporte para multiples plataformas NPU: Rockchip RK3566, RK3576, RK3588; Allwinner A733 y T527 (VeriSilicon VIP); D-Robotics RDK X5 (BPU bayes-e).
- Salida estructurada en 10 tensores que incluyen cajas, puntuaciones y una fraccion de severidad, disenada para su integracion directa en el plugin OctoPrint.
- No incluye capacidades de generacion de texto, tool calling, agentes, vision generalista ni procesamiento de lenguaje.

## Casos de uso

- Deteccion de fallos de impresion 3D en tiempo real: el modelo se integra en OctoPrint a traves del plugin PiNozCam y vigila la boquilla durante la impresion, alertando al usuario cuando detecta anomalias como obstrucciones o extrusion irregular. Su ejecucion local en la Raspberry Pi elimina la dependencia de servicios externos.
- Monitorizacion remota de impresoras 3D sin suscripcion: al ejecutarse en el edge, el sistema funciona sin registro ni cuentas en la nube, lo que lo hace adecuado para entornos donde la privacidad o el coste son relevantes.
- Despliegue en dispositivos de bajo consumo: los binarios NPU permiten ejecutar la deteccion en placas como Rockchip RK3588 o Allwinner T527, habituales en impresoras 3D con capacidades de IA integradas, sin necesidad de una GPU dedicada.
- Integracion en pipelines de fabricacion digital: el modelo puede incorporarse a sistemas de control de calidad en entornos de fabricacion aditiva, donde la deteccion temprana de fallos reduce el desperdicio de material y tiempo.
- Investigacion en edge AI: el repositorio sirve como ejemplo de compilacion de modelos de deteccion de objetos para multiples backends (ExecuTorch, RKNN, NBG, hbdk) con cuantizacion int8, util para desarrolladores que exploran despliegue en hardware heterogeneo.
- Uso como componente de un sistema de alertas: la salida de severidad (fraccion) permite clasificar la gravedad del fallo y activar distintos niveles de notificacion (aviso, pausa de impresion, cancelacion) segun la configuracion del plugin.

## Benchmarks y rendimiento

La unica cifra de precision publicada en la model card corresponde al archivo `npu/nozcam-t527.nb`, medida contra el modelo fp32 en el conjunto de calibracion del proyecto (34 fotogramas, todos en relacion de aspecto 16:9):

| Archivo | Desviacion media absoluta de puntuacion | Acuerdo de recuento de cajas |
|---|---|---|
| `npu/nozcam-t527.nb` | 0,0222 | 34/34 |

Advertencia del autor: ese conjunto es a la vez el de calibracion y el de evaluacion, y todas las imagenes son 16:9. Por tanto, puede detectar regresiones pero no confirmar la precision en escenas no vistas ni en otras relaciones de aspecto. No se han publicado resultados de benchmarks comparativos con otros modelos de deteccion de objetos en la informacion disponible.

## Requisitos de hardware

- CPU: el archivo `cpu/nozcam-cpu.pte` se ejecuta en cualquier CPU compatible con ExecuTorch (armhf, aarch64, x86-64, macOS arm64). No se especifica la VRAM ni la RAM minima, pero al ser int8 y de tamano reducido (repo total 0,3 GB), es viable en Raspberry Pi y similares.
- GPU Vulkan: `gpu/nozcam-gpu.pte` requiere una GPU con soporte Vulkan en aarch64 o x86-64. No se indican requisitos de VRAM.
- NPU Rockchip: archivos `.rknn` para RK3566, RK3576 y RK3588. Cada uno es exclusivo de su chip y se rechaza en otros.
- NPU Allwinner: archivos `.nb` para A733 (VIPLite v2.0) y T527 (VIPLite v1.13). No son intercambiables entre si por incompatibilidad de runtime.
- NPU D-Robotics: `npu/nozcam-x5.bin` para RDK X5 (BPU bayes-e).
- Opciones de despliegue: el plugin OctoPrint-PiNozCam gestiona la carga y ejecucion de los modelos; no se documentan opciones directas con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El modelo esta disenado especificamente para la deteccion de fallos de impresion 3D en hardware de bajo consumo, y no se publican comparaciones con otros detectores de objetos (como YOLO, SSD o EfficientDet) en terminos de precision o velocidad. Se indica "no disponible".

## Limitaciones y advertencias

- El conjunto de calibracion y evaluacion es muy reducido (34 fotogramas, todos 16:9), por lo que la precision reportada no es representativa de escenarios reales con otras relaciones de aspecto o condiciones de iluminacion.
- Los binarios NPU no son portables entre chips: cada `.rknn` y `.nb` lleva un identificador de hardware y se rechaza en cualquier otro procesador. Los dos archivos de Allwinner son incompatibles entre si por diferencias de runtime.
- El redimensionado de la imagen debe realizarse obligatoriamente con el metodo BICUBIC de Pillow. Usar OpenCV `INTER_CUBIC` multiplica por 3,2 el error de cuantizacion int8 y puede provocar falsas alarmas.
- La licencia AGPL-3.0 impone obligaciones de copyleft: cualquier modificacion o servicio que use el modelo debe publicar su codigo fuente bajo la misma licencia, lo que puede ser restrictivo para uso comercial propietario.
- No se documenta el rendimiento en escenas no vistas ni en condiciones adversas (vibracion, desenfoque, cambios de iluminacion), por lo que su fiabilidad en produccion no esta garantizada.
- El repositorio esta disenado como entrada de construccion para el plugin, no como un modelo para uso directo por parte de usuarios finales. Su integracion requiere el plugin OctoPrint-PiNozCam.
- No se proporcionan datos sobre sesgos, alucinaciones (no aplica al ser un modelo de vision) ni limitaciones de contexto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DrAlexLiu/PiNozCam
- Repositorio GitHub del plugin: https://github.com/DrAlexLiu/OctoPrint-PiNozCam
- Pagina del plugin en OctoPrint: https://plugins.octoprint.org/plugins/pinozcam/
- Perfil del autor en HuggingFace: https://huggingface.co/DrAlexLiu
