# NagisaNao/sd-aspect-ratio-plus

## Resumen

Aspect Ratio+ es una extensión para Stable Diffusion WebUI (AUTOMATIC1111 y forks compatibles) que anade controles de proporcion (aspect ratio) y presets de dimensiones para las pestanas de txt2img e img2img. No es un modelo de IA: es una utilidad de interfaz escrita en Python/JavaScript que se instala en el directorio `extensions` del WebUI. Su funcion contribuye a evitar uno de los errores mas comunes al generar imagenes, como es el de introducir dimensiones que no respetan la proporcion de entrenamiento del modelo o que no son multiplos de 8, lo que degrada la calidad y provoca artefactos.

El repositorio de Hugging Face (NagisaNao/sd-aspect-ratio-plus) es unicamente un espejo de distribucion del proyecto, cuyo desarrollo activo se encuentra en GitHub bajo el identificador `anxety-solo/sd-aspect-ratio-plus`. El repo pesa 0.0 GB y no contiene pesos, checkpoints ni ficheros de modelo; por tanto, no hay parametros, contexto, cuantizacion ni licencia de modelo que reportar.

La relevancia de esta ficha es acotada: sirve para que desarrolladores e investigadores que encuentren el repositorio en Hugging Face entiendan de inmediato que no se trata de un modelo evaluable, sino de una herramienta de UI para pipelines de difusion. La informacion disponible proviene exclusivamente de la model card del autor y del codigo de instalacion publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (extension de UI para Stable Diffusion WebUI; no es un modelo neuronal) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (la interfaz de la model card esta en ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no contiene pesos; 0.0 GB) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento. El proyecto es una extension de Stable Diffusion WebUI que anade widgets a la interfaz: un desplegable de proporciones, un boton de intercambio de ancho/alto (⇅), un popup de presets de dimensiones y una pagina de ajustes bajo `Settings → Aspect Ratio+`. La logica de escalado recibe los valores de los sliders de ancho y alto, aplica la proporcion seleccionada y redondea el resultado a multiplos de 8, manteniendo las dimensiones dentro del rango configurado (por defecto 64-2048 px, ampliable hasta 8192 px en modo de ajustes de la extension).

Los modos de proporcion disponibles son: Off (sin restriccion), Lock (bloquea la proporcion actual), Image (usa la proporcion de la imagen cargada, solo en img2img) y proporciones personalizadas configurables como lista separada por comas (por ejemplo `1:1, 2:3, 3:4, 16:9`). La deteccion automatica de proporcion, cuando esta activada, infiere la relacion a partir del preset seleccionado, crea opciones temporales para dimensiones unicas y gestiona el cambio de orientacion entre retrato y paisaje. El sistema de presets admite categorias con prefijo `>`, comentarios con prefijo `#`, agrupacion automatica en "Others" y layouts de 1 a 4 columnas. La instalacion se realiza clonando el repositorio de GitHub en la carpeta de extensiones del WebUI.

## Capacidades

- Control de proporcion en txt2img e img2img con actualizacion en tiempo real al mover los sliders de ancho y alto.
- Intercambio instantaneo de dimensiones con inversion automatica de la proporcion (16:9 pasa a 9:16) manteniendo el bloqueo.
- Presets de dimensiones con categorias, comentarios, grid configurable de 1 a 4 columnas y categoria "Others" automatica.
- Deteccion automatica de proporcion al seleccionar un preset, con creacion de proporciones temporales para dimensiones no registradas.
- Redondeo automatico a multiplos de 8 y limitacion opcional de dimensiones maximas.
- Selector de fuente de limites: ajustes nativos del WebUI o ajustes propios de la extension (64-2048 px minimo, 2048-8192 px maximo).
- Boton de acceso rapido a los ajustes de la extension y cierre del popup con boton, clic fuera o tecla ESC.
- Visibilidad del boton de presets configurable por pestana (Off, solo txt2img, txt2img e img2img).

## Casos de uso

- Generacion por lotes con proporciones de red social: definir presets como 1080 x 1350 (4:5 para Instagram) o 1600 x 900 (16:9 para portadas) y alternar entre ellos con un clic, evitando recalcular dimensiones manualmente en cada tanda.
- Flujos de img2img con referencia: usar el modo Image para heredar la proporcion de la imagen de entrada y mantener la composicion original al aplicar denoising o estilizado.
- Produccion de ilustracion para impresion: presets en 2:3 o 3:4 con redondeo a multiplos de 8 para reducir artefactos de borde en las salidas de SD 1.5 y SDXL.
- Integracion en pipelines de generacion masiva: la extension expone controles deterministas sobre las dimensiones, lo que facilita que scripts externos o automatizaciones del WebUI fijen tamanos coherentes entre ejecuciones.
- Prototipado rapido de composiciones: el boton de intercambio permite comparar la misma escena en retrato y paisaje sin reescribir el prompt ni reajustar los sliders.
- Configuracion de equipos: el archivo de presets centraliza las resoluciones aprobadas por un estudio o equipo, de modo que todos los operadores generan con las mismas dimensiones y proporciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo neuronal, no aplican metricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No requiere VRAM adicional: la extension opera sobre la interfaz del WebUI y no ejecuta inferencia propia.
- El hardware vendra determinado por el modelo de difusion que el WebUI cargue (por ejemplo, SD 1.5, SDXL o SD3), no por esta extension.
- No hay GPU recomendadas especificas para la extension; la carga computacional del redondeo y del escalado de dimensiones es despreciable.
- Despliegue: se instala clonando `https://github.com/anxety-solo/sd-aspect-ratio-plus` en la carpeta `extensions` de Stable Diffusion WebUI y reiniciando o recargando la interfaz.
- No se dispone de datos de latencia o throughput propios; el impacto en el tiempo de generacion es nulo porque solo modifica parametros de entrada.

## Comparativa con modelos similares

| Herramienta | Tipo | Funcionalidad | Presets de dimensiones | Deteccion automatica de proporcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Aspect Ratio+ (este proyecto) | Extension de UI | Proporciones, intercambio, presets, limites y redondeo a multiplos de 8 | Si, con categorias y grid de 1-4 columnas | Si | no disponible | Hugging Face y GitHub |
| sd-simple-dimension-preset (gutris1) | Extension de UI | Presets de dimensiones | Si | no disponible | no disponible | GitHub |
| Controles nativos de Stable Diffusion WebUI | UI integrada | Ancho, alto y boton de intercambio basicos | No | No | no disponible | Incluido en el WebUI |

La diferencia principal frente a los controles nativos es la gestion de proporciones con bloqueo y la deteccion automatica al elegir presets. Frente a sd-simple-dimension-preset, del que el autor reconoce inspiracion, anade el sistema de proporciones y la creacion de ratios temporales.

## Limitaciones y advertencias

- No es un modelo de IA: no genera imagenes por si mismo y no debe evaluarse como tal.
- El repositorio de Hugging Face tiene 0 descargas y 0 likes, y no incluye una licencia declarada; verificar los terminos en el repositorio de GitHub antes de un uso comercial o de redistribucion.
- El repositorio de Hugging Face solo contiene la model card y una imagen de vista previa; el codigo fuente y las actualizaciones se publican en GitHub, por lo que el espejo puede quedar desactualizado.
- La funcionalidad depende de la version del WebUI y de sus forks; cambios en la API de la interfaz pueden romper la extension.
- El modo Image solo esta disponible en img2img, y la deteccion automatica de proporcion puede crear ratios temporales que conviene revisar si se usan muchos presets con dimensiones unicas.
- La licencia no disponible impide confirmar si se permite el uso comercial; es una advertencia relevante para produccion.
- No hay informacion sobre sesgos, alucinacion o limitaciones de idioma porque la herramienta no procesa lenguaje.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/NagisaNao/sd-aspect-ratio-plus
- Repositorio de codigo en GitHub: https://github.com/anxety-solo/sd-aspect-ratio-plus
- Proyecto inspirador de presets de dimensiones: https://github.com/gutris1/sd-simple-dimension-preset
