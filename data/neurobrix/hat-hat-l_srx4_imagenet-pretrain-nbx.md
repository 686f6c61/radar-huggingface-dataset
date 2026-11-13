# Neurobrix/HAT-HAT-L_SRx4_ImageNet-pretrain-nbx

## Resumen

HAT-HAT-L_SRx4_ImageNet-pretrain-nbx es un contenedor `.nbx` del modelo HAT-L (Hybrid Attention Transformer, variante Large) para superresolucion de imagen con factor de escala x4, originalmente desarrollado por XPixelGroup y empaquetado por Neurobrix para su motor de inferencia propio. El modelo resuelve la tarea de image-to-image upscaling: recibe una imagen de baja resolucion y devuelve una version ampliada cuatro veces con detalle reconstruido. La relevancia actual del contenedor reside en que permite ejecutar el modelo sin depender de PyTorch, mediante kernels Triton propios (`nbxtensor`), en GPUs NVIDIA, GPUs de Mac (Metal) y CPU.

El modelo original HAT pertenece a la familia de redes de superresolucion basadas en transformers con atencion hibrida (combinacion de atencion por ventanas y atencion global con conexiones convolucionales), entrenado sobre ImageNet para la variante SRx4. El contenedor pesa 153 MB y conserva la licencia Apache 2.0 del modelo original.

Conviene subrayar que este repositorio no es un modelo nuevo ni un fine-tuning: es un artefacto de despliegue. Toda la informacion sobre arquitectura interna, datos de entrenamiento y metricas de calidad remite al modelo original de XPixelGroup, cuyos detalles no se incluyen en la model card proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HAT (Hybrid Attention Transformer), variante Large; contenedor `.nbx` con grafo de computo y pesos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea de imagen, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | contenedor `.nbx` (grafo + pesos + runtime); no se publican safetensors ni GGUF en este repositorio |
| Factor de escala | x4 (SRx4) |
| Tamano del contenedor | 153 MB |
| SHA-256 | `33b84f5058c2d61174d66ae66f2c71650db09c91280152ef657995e6e8ddfafa` |
| Pipeline | image-to-image |
| Libreria | neurobrix |
| Backends de ejecucion | PyTorch o Triton (nbxtensor), en NVIDIA, Metal y CPU |

## Arquitectura y entrenamiento

La arquitectura del modelo es HAT (Hybrid Attention Transformer) en su variante Large, segun el identificador del modelo original `XPixelGroup/HAT-HAT-L_SRx4_ImageNet-pretrain`. HAT combina mecanismos de atencion con componentes convolucionales para la tarea de superresolucion, si bien la model card del contenedor no detalla la configuracion exacta de capas, dimensiones ocultas ni el esquema de atencion hibrida.

El entrenamiento se realizo sobre ImageNet, tal como indica el sufijo `ImageNet-pretrain` del identificador original. No se proporcionan en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de ajuste fino adicionales. Tampoco se documentan innovaciones tecnicas especificas del contenedor mas alla del propio empaquetado: el valor anadido de Neurobrix es la planificacion automatica de ejecucion (una GPU, varias, streaming o host) y la posibilidad de correr con kernels Triton sin PyTorch.

## Capacidades

- Superresolucion de imagen con factor de escala x4 (upscaling image-to-image).
- Reconstruccion de detalle en imagenes de baja resolucion, orientada a la tarea SRx4 del modelo original.
- Ejecucion en multiples backends: motor PyTorch o motor Triton (nbxtensor) sin dependencia de PyTorch.
- Despliegue heterogeneo: NVIDIA GPUs, Mac GPUs (Metal) y CPU, con planificacion automatica de recursos entre una o varias GPUs.
- Interfaz de linea de comandos para importacion y ejecucion (`neurobrix import`, `neurobrix upscale`).
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente de vision.
- No se documentan modos especiales (thinking, vision-language, audio) en la informacion disponible.

## Casos de uso

- Restauracion de fotografias antiguas o de baja resolucion: el modelo amplia la imagen x4 y reconstruye detalle, adecuado para digitalizacion de archivos fotograficos donde se necesita una salida de mayor tamano sin depender de PyTorch.
- Mejora de miniaturas y assets web: integrable en un pipeline previo al despliegue de imagenes en produccion para servir versiones ampliadas a partir de originales comprimidos.
- Preparacion de datasets de vision: ampliar imagenes de entrenamiento de baja resolucion a x4 antes de alimentar modelos de deteccion o segmentacion, usando el CLI `neurobrix upscale`.
- Procesamiento por lotes en estaciones de trabajo sin GPU dedicada: al soportar CPU y Metal, permite ejecutar el upscaling en Macs o servidores sin NVIDIA.
- Despliegue en entornos con restricciones de dependencias: el motor Triton evita instalar PyTorch, util en contenedores minimos o sistemas con limitaciones de paquetes.
- Prototipado rapido de pipelines de imagen: el contenedor incluye grafo, pesos y valores por defecto, lo que reduce el trabajo de integracion a un unico comando de importacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del contenedor no incluye metricas PSNR, SSIM ni comparaciones con otros modelos de superresolucion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El contenedor pesa 153 MB, pero no se especifica el consumo en memoria en ejecucion.
- GPU recomendadas: no disponibles de forma especifica. El autor indica compatibilidad con NVIDIA GPUs, Mac GPUs (Metal) y CPU.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; el soporte de CPU y Metal sugiere que el modelo es ligero, pero no se aportan cifras.
- Opciones de despliegue: motor NeuroBrix (PyTorch o Triton/nbxtensor), con planificacion automatica entre una GPU, varias, streaming o host. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Escala | Licencia | Formato |
|---|---|---|---|---|---|
| HAT-L SRx4 (este contenedor) | no disponible | no aplica | x4 | Apache 2.0 | `.nbx` |
| Alternativas de superresolucion (SwinIR, Real-ESRGAN, etc.) | no disponible | no aplica | variable | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos comparables que permitan una comparacion cuantitativa fiable. La comparativa queda limitada a la categoria (superresolucion x4) sin cifras verificables.

## Limitaciones y advertencias

- Es un artefacto de empaquetado, no un modelo nuevo: cualquier limitacion del HAT-L original aplica sin cambios, y la model card remite a la documentacion de XPixelGroup.
- No se documentan sesgos conocidos del modelo en la informacion disponible; al entrenarse sobre ImageNet, puede heredar sesgos de ese dataset, pero no se confirma.
- Riesgo de alucinacion de detalle: como todo modelo de superresolucion generativa, puede inventar texturas o bordes no presentes en la imagen original; no se aportan datos especificos de este checkpoint.
- Limitaciones de contexto o idioma: no aplica procesamiento de lenguaje; no hay soporte multilingue.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los terminos del modelo original en el repositorio de XPixelGroup antes de produccion.
- Dependencia del ecosistema NeuroBrix: el formato `.nbx` requiere el motor propietario del autor; no se publican pesos en safetensors ni GGUF en este repositorio, lo que limita la portabilidad a otras herramientas.
- Sin descargas ni likes registrados en el momento de la consulta; madurez y soporte de la comunidad no verificables.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Neurobrix/HAT-HAT-L_SRx4_ImageNet-pretrain-nbx
- Modelo original (GitHub XPixelGroup): https://github.com/XPixelGroup/HAT
- Repositorio NeuroBrix: https://github.com/NeuroBrix/neurobrix
- Kernels nbxtensor: https://github.com/NeuroBrix/nbxtensor
- Pagina del modelo en NeuroBrix: https://neurobrix.org/models/XPixelGroup/HAT-HAT-L_SRx4_ImageNet-pretrain
- GitHub de NeuroBrix: https://github.com/NeuroBrix
- Hub NeuroBrix: https://neurobrix.org
- Documentacion: https://docs.neurobrix.org
- YouTube: https://www.youtube.com/@NeuroBrix
