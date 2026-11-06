# OSNFK/QwenImage2.1_Lora_BuildingExtraction_I2I_1.0

## Resumen

QwenImage2.1_Lora_BuildingExtraction_I2I_1.0 es un adaptador LoRA experimental desarrollado por el usuario OSNFK sobre el modelo base Qwen/Qwen-Image-2.1. Su funcion es extraer y simplificar huellas de edificios (building footprints) a partir de imagenes satelitales, generando las formas de los edificios sobre un fondo transparente. El adaptador esta pensado para analisis preliminar de emplazamientos arquitectonicos, cartografia de contexto urbano y visualizacion simplificada de huellas de edificacion.

El modelo se distribuye como un LoRA de diffusers para el pipeline image-to-image, con un tamano de repositorio de 0,1 GB, lo que refleja que unicamente contiene los pesos del adaptador y no el modelo base. Se activa mediante la palabra disparadora `BuildingExtraction` en el prompt. El autor advierte explicitamente que se trata de un modelo experimental y que los resultados requieren inspeccion y correccion visual antes de cualquier analisis GIS.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un adaptador especializado de vision generativa para una tarea geoespacial concreta. No se dispone de informacion sobre arquitectura interna del LoRA, datos de entrenamiento mas alla de la resolucion de las imagenes, ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion Qwen-Image-2.1 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt de activacion es en ingles: `BuildingExtraction`) |
| Licencia | qwen-research (Qwen Research License Agreement) |
| Formato de pesos | diffusers (formato de LoRA para la libreria diffusers) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango que se aplica sobre el modelo de difusion Qwen-Image-2.1, un modelo generativo de imagenes. El pipeline declarado es image-to-image: se parte de una imagen satelital de entrada y el modelo genera una representacion de las huellas de edificios sobre fondo transparente. No se dispone de informacion sobre el rango del LoRA, el numero de pasos de entrenamiento, el tamano del dataset ni la composicion de las imagenes de entrenamiento.

El unico dato tecnico de entrenamiento aportado por el autor es que el LoRA se entreno con imagenes satelitales de 1 km x 1 km a resolucion 1024, y que para obtener la misma calidad de salida conviene usar el mismo tipo de entrada. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un adaptador de difusion. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Extraccion de huellas de edificios a partir de imagenes satelitales mediante image-to-image.
- Simplificacion de las formas de los edificios detectados.
- Generacion de las formas sobre fondo transparente (transparencia no garantizada segun el autor).
- Activacion condicionada por la palabra disparadora `BuildingExtraction` en el prompt.
- Integracion en flujos ComfyUI mediante plantilla de workflow incluida en el repositorio.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- Capacidades multilingues: no disponibles; el unico termino documentado es el trigger en ingles.

## Casos de uso

- Analisis preliminar de emplazamientos arquitectonicos: el LoRA permite generar una primera aproximacion de las huellas de edificios en una parcela a partir de una imagen satelital de 1 km x 1 km, sirviendo como material de trabajo antes de un levantamiento detallado.
- Cartografia de contexto urbano: util para producir mapas simplificados de edificacion en un area de estudio, siempre que se acepte que las fronteras pueden ser inexactas y requieran revision manual.
- Visualizacion simplificada de huellas de edificacion: generacion de capas visuales sobre fondo transparente para presentaciones o maquetas, no para datos autoritativos.
- Preprocesado para pipelines GIS experimentales: el resultado puede usarse como borrador que luego se corrige en un SIG, dado que el propio autor advierte que no produce datos autoritativos.
- Exploracion de tecnicas de difusion aplicadas a teledeteccion: sirve como caso de estudio de LoRA sobre Qwen-Image-2.1 para tareas geoespaciales.
- Prototipado en ComfyUI: la plantilla de workflow incluida permite experimentar rapidamente con parametros (cfg 3.0, 40 pasos, sampler euler, scheduler simple, fuerza LoRA 1.00) sin montar un pipeline propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base Qwen-Image-2.1, no del LoRA (0,1 GB), que es un adaptador ligero.
- GPU recomendadas: no disponible; el requisito real lo marca el modelo base de difusion.
- Compatibilidad con GPU de consumo: no disponible; no se puede confirmar sin datos del modelo base.
- Opciones de despliegue: diffusers (libreria declarada) y ComfyUI (workflow incluido). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de imagen.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables de la misma categoria (LoRA de extraccion de huellas de edificios sobre modelos de difusion) en la informacion disponible.

## Limitaciones y advertencias

- La deteccion y las fronteras de los edificios pueden ser inexactas o incompletas.
- Pueden detectarse objetos que no son edificios y pueden faltar edificios reales.
- La transparencia y la alineacion espacial no estan garantizadas.
- Los resultados requieren inspeccion y correccion visual antes de cualquier analisis GIS; el modelo no produce datos autoritativos de edificacion.
- Modelo experimental: el autor no garantiza calidad de produccion.
- La calidad de salida depende de usar imagenes de entrada de 1 km x 1 km a resolucion 1024, segun el autor.
- Licencia qwen-research: sujeta al Qwen Research License Agreement; es necesario revisar el archivo LICENSE antes de uso o redistribucion, y el uso comercial puede estar restringido.
- No se dispone de informacion sobre sesgos, idiomas ni riesgos de alucinacion especificos mas alla de las advertencias del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OSNFK/QwenImage2.1_Lora_BuildingExtraction_I2I_1.0
- Descarga de archivos: https://huggingface.co/OSNFK/QwenImage2.1_Lora_BuildingExtraction_I2I_1.0/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Plantilla de workflow ComfyUI: https://huggingface.co/OSNFK/QwenImage2.1_Lora_BuildingExtraction_I2I_1.0/blob/main/QwenImage2.1_Lora_BuildingExtraction_I2I_1.0.json
- Licencia: https://huggingface.co/OSNFK/QwenImage2.1_Lora_BuildingExtraction_I2I_1.0/blob/main/LICENSE
