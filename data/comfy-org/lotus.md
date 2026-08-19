# Comfy-Org/lotus

## Resumen

Lotus es un modelo de difusión diseñado para tareas de percepción visual rápida, concretamente estimación de profundidad monocular y predicción de normales de superficie. Desarrollado originalmente por jingheya y empaquetado por Comfy-Org para su uso directo en ComfyUI, este modelo ofrece salidas geométricas de alta calidad con un coste computacional significativamente menor que los estimadores basados en difusión tradicionales, lo que lo hace adecuado para pipelines de visión en tiempo real.

El repositorio Comfy-Org/lotus es un reempaquetado del modelo base `jingheya/lotus-depth-d-v1-1`, presentado como un único archivo `safetensors` de 1,7 GB listo para colocar en la carpeta `models/diffusion_models` de ComfyUI. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales. Aunque la información técnica detallada (parámetros, arquitectura interna, datos de entrenamiento) no está disponible en la documentación pública, la naturaleza del modelo y su integración en ComfyUI lo convierten en una opción práctica para desarrolladores que necesitan estimación de profundidad y normales en flujos de trabajo visuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para estimacion de profundidad y normales (detalles especificos no disponibles) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No especificado (probablemente FP16/FP32 en safetensors) |
| Idiomas soportados | No aplica (procesa imagenes) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento

El modelo Lotus pertenece a la familia de modelos de difusion aplicados a tareas de percepcion visual. A diferencia de los modelos de difusion generativos que producen imagenes, Lotus condiciona el proceso de difusion en una imagen de entrada para generar mapas de profundidad o normales de superficie. Esta aproximacion permite obtener resultados geometricamente precisos con una fraccion del coste computacional de los metodos tradicionales basados en difusion, segun la descripcion del repositorio original.

No se dispone de informacion publica sobre el numero de parametros, la arquitectura interna exacta (si usa UNet, transformer o una combinacion), la composicion del dataset de entrenamiento ni el proceso de optimizacion (RLHF, DPO, etc.). El repositorio original `jingheya/lotus-depth-d-v1-1` podria contener mas detalles, pero no estan disponibles en la informacion proporcionada. El reempaquetado de Comfy-Org no anade modificaciones tecnicas al modelo, solo lo adapta al formato de archivo unico para ComfyUI.

## Capacidades

- Estimacion de profundidad monocular a partir de una sola imagen.
- Prediccion de normales de superficie para la misma imagen de entrada.
- Salidas de alta calidad geometrica con coste computacional reducido, apto para pipelines en tiempo real.
- Integracion nativa con ComfyUI mediante el nodo de difusion estandar, sin necesidad de codigo adicional.
- Soporte para procesamiento por lotes si el hardware lo permite, al ser un modelo de difusion clasico.
- No incluye capacidades de texto, tool calling, agentes ni razonamiento multimodal mas alla de la tarea especifica de percepcion geometrica.

## Casos de uso

- **Reconstruccion 3D a partir de video**: el modelo puede estimar profundidad en cada fotograma de un video para generar nubes de puntos o mallas 3D, util en fotogrametria o captura de entornos.
- **Robotica y navegacion autonoma**: la estimacion de profundidad en tiempo real permite a robots y drones evitar obstaculos y mapear su entorno con una sola camara.
- **Realidad aumentada**: las normales de superficie calculadas por el modelo permiten colocar objetos virtuales con iluminacion y sombras coherentes sobre superficies reales en aplicaciones AR.
- **Edicion de imagenes con conciencia de profundidad**: en herramientas como Photoshop o GIMP, la profundidad estimada permite aplicar desenfoque de lente, reiluminacion o separacion de planos de forma automatica.
- **Preprocesado para modelos de generacion 3D**: los mapas de profundidad generados pueden servir como entrada para modelos de texturizado o generacion de mallas en pipelines de creacion de contenido.
- **Inspeccion industrial y control de calidad**: la deteccion de anomalias en superficies mediante normales puede integrarse en sistemas de vision artificial para fabricacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio original `jingheya/lotus-depth-d-v1-1` podria incluir metricas como RMSE o delta1 en datasets estandar (por ejemplo, NYUv2 o KITTI), pero estos datos no estan presentes en la documentacion de Comfy-Org/lotus ni en los resultados de busqueda web. Se recomienda consultar el repositorio original para obtener evaluaciones cuantitativas.

## Requisitos de hardware

- El archivo de pesos pesa 1,7 GB, lo que sugiere un modelo de tamano medio (estimacion orientativa: entre 500 millones y 1.500 millones de parametros, sin confirmar).
- VRAM estimada para inferencia: al menos 4 GB para resoluciones bajas (256x256) y 8 GB o mas para resoluciones de 512x512 o superiores, dependiendo de la implementacion de difusion (numero de pasos, scheduler, etc.).
- GPU recomendadas: NVIDIA RTX 3060 (12 GB) o superior para uso interactivo en ComfyUI; para produccion a gran escala, A100 o H100 con multiples instancias.
- Es posible ejecutar en GPU de consumo como RTX 4090 o incluso RTX 4060 con cuantizacion a FP16, aunque no se ha confirmado la disponibilidad de versiones cuantizadas.
- Opciones de despliegue: ComfyUI como interfaz principal; tambien puede usarse con la libreria `diffusers` de HuggingFace si se carga el modelo original, o con vLLM si se adapta (no es el caso estandar).
- Latencia y throughput: no disponibles; dependen del numero de pasos de difusion y la resolucion. Al ser un modelo de difusion, la latencia tipica puede oscilar entre 0,5 y 2 segundos por imagen en GPU moderna, pero esto es una estimacion sin datos confirmados.

## Comparativa con modelos similares

No se dispone de informacion comparativa directa con otros modelos de estimacion de profundidad. Los modelos alternativos en el mismo espacio incluyen:

| Modelo | Tipo | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiDaS | Red neuronal convolucional | ~100M | MIT | Amplia, multiples formatos |
| Depth Anything | Transformer (DINOv2) | ~300M | Apache-2.0 | Amplia, safetensors |
| Lotus (este modelo) | Difusion | No disponible | Apache-2.0 | ComfyUI, safetensors |

La ventaja principal de Lotus frente a MiDaS o Depth Anything es su naturaleza generativa, que puede producir mapas de profundidad mas detallados y coherentes, aunque a costa de mayor latencia. Sin embargo, sin benchmarks publicos no es posible cuantificar esta diferencia.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos en los datos de entrenamiento; como todo modelo de vision, puede fallar en condiciones extremas de iluminacion, texturas repetitivas o superficies transparentes.
- Riesgo de alucinacion geometrica: al ser un modelo generativo, puede inventar profundidades o normales en regiones ambiguas de la imagen, lo que requiere validacion en aplicaciones criticas.
- Limitaciones de resolucion: el modelo puede degradarse en resoluciones muy altas o muy bajas; no se especifican rangos recomendados.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base original por si hubiera clausulas adicionales.
- No es un modelo multimodal: no procesa texto ni audio, solo imagenes.
- Dependencia de ComfyUI: el reempaquetado esta disenado exclusivamente para ComfyUI; su uso fuera de este entorno requiere adaptacion manual.

## Enlaces

- Repositorio de Comfy-Org: https://huggingface.co/Comfy-Org/lotus
- Repositorio original del modelo: https://huggingface.co/jingheya/lotus-depth-d-v1-1
- Web de Comfy: https://comfy.org/
- Modelos soportados en Comfy: https://comfy.org/models/
- Noticia sobre el modelo (AICHINA): https://aichina.news/models/Comfy-Org/lotus/
