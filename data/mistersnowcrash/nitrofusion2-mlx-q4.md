# MisterSnowCrash/nitrofusion2-mlx-q4

## Resumen

NitroFusion2 MLX q4 es una cuantizacion de 4 bits del modelo de difusion texto-a-imagen ChenDY/NitroFusion2, realizada por MisterSnowCrash para su ejecucion local en hardware Apple Silicon (Mac, iPhone, iPad) mediante la libreria MLX. El modelo original es una destilacion de 1-2 pasos de Z-Image-Turbo, desarrollada por Dar-Yen Chen y Yi-Zhe Song (University of Surrey), y publicada bajo licencia Apache 2.0. Esta version cuantizada mantiene el transformer con todas sus capas lineales en 4 bits afines con group size 64, mientras que el codificador de texto (Qwen3-4B), el tokenizer y el VAE se copian sin modificar del tier q4 de SceneWorks/z-image-turbo-mlx.

El modelo resuelve el problema de generar imagenes de alta calidad con un coste computacional minimo (1 o 2 pasos de inferencia, sin classifier-free guidance), lo que lo hace viable en dispositivos de consumo con memoria unificada limitada. Con 962.586.688 parametros totales y un tamano de repositorio de 5.9 GB, esta pensado para entornos donde no hay GPU dedicada pero si silicio de Apple con MLX Swift.

Es relevante ahora porque permite llevar generacion de imagenes por difusion a portatiles y dispositivos moviles de Apple sin depender de servicios en la nube, con una licencia permisiva (Apache 2.0) que facilita su integracion en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (destilacion de Z-Image-Turbo) con codificador de texto Qwen3-4B y VAE FLUX.1 |
| Parametros totales | 962.586.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen, no aplica contexto de texto largo) |
| Tipos de cuantizacion | 4 bits afines, group size 64 (capas lineales del transformer) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), repo de 5.9 GB |

## Arquitectura y entrenamiento

El modelo es una destilacion de 1-2 pasos de Z-Image-Turbo, que a su vez emplea un transformer de difusion con codificador de texto Qwen3-4B y VAE FLUX.1. La destilacion reduce el numero de pasos de inferencia a uno o dos, eliminando la necesidad de classifier-free guidance y utilizando un scheduler FlowMatchEuler con shift 6.0. Esta version cuantizada no introduce fine-tuning ni cambios en los datos de entrenamiento: unicamente aplica cuantizacion de 4 bits a las capas lineales del transformer, manteniendo normas y tokens de padding sin tocar.

El entrenamiento original de NitroFusion2 no se detalla en la informacion disponible (numero de tokens, composicion del dataset, uso de RLHF/DPO). La innovacion tecnica principal es la destilacion extrema a 1-2 pasos, que reduce drasticamente la latencia y el coste computacional frente a modelos de difusion convencionales que requieren decenas de pasos.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image).
- Inferencia en 1 o 2 pasos, sin classifier-free guidance.
- Ejecucion en Apple Silicon mediante MLX Swift (Mac, iPhone, iPad).
- Cuantizacion de 4 bits para reducir el uso de memoria y el tamano del modelo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni vision.
- Capacidades multilingues: no disponibles (el codificador de texto Qwen3-4B soporta varios idiomas, pero no se especifica en la informacion).

## Casos de uso

- Generacion de imagenes en local en un Mac: el modelo puede ejecutarse con MLX Swift en un portatil Apple Silicon, permitiendo crear ilustraciones o conceptos visuales sin conexion a internet ni servicios en la nube, gracias a su tamano de 5.9 GB y a la inferencia en 1-2 pasos.
- Prototipado rapido de ideas visuales: al requerir solo 1 o 2 pasos, es adecuado para iterar rapidamente sobre bocetos o variaciones de una imagen durante sesiones de diseno, reduciendo el tiempo de espera por generacion.
- Aplicaciones moviles en iPhone/iPad: su nature MLX y su cuantizacion de 4 bits permiten integrarlo en apps iOS que generen imagenes bajo demanda en el dispositivo, preservando la privacidad del usuario.
- Generacion de assets para videojuegos o contenido creativo: util para crear texturas, iconos o ilustraciones de forma automatizada en un flujo de trabajo local, con licencia Apache 2.0 que permite uso comercial.
- Educacion e investigacion: sirve como ejemplo practico de destilacion de difusion y cuantizacion MLX para estudiar tecnicas de eficiencia en modelos generativos.
- Demos y pruebas de concepto en entornos con recursos limitados: al no requerir GPU dedicada, se puede desplegar en equipos de desarrollo estandar con Apple Silicon para validar ideas antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser MLX y memoria unificada, se requiere aproximadamente 5.9 GB de memoria disponible (tamano del repo) para cargar los pesos; la inferencia en 4 bits reduce el uso frente a la version completa.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4 y posteriores) con al menos 8 GB de memoria unificada; no se especifican modelos concretos de GPU NVIDIA o AMD.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente (8 GB o mas).
- Opciones de despliegue: MLX Swift (segun la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NitroFusion2 MLX q4 (este) | 962.586.688 | no aplica | no disponible | Apache 2.0 | Hugging Face (MLX) |
| ChenDY/NitroFusion2 (original) | no disponible | no aplica | no disponible | Apache 2.0 | Hugging Face |
| Z-Image-Turbo | no disponible | no aplica | no disponible | Apache 2.0 | Hugging Face / GitHub |
| SceneWorks/z-image-turbo-mlx (q4) | no disponible | no aplica | no disponible | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Al ser una cuantizacion de 4 bits, puede introducir errores de cuantizacion que degraden ligeramente la calidad de las imagenes generadas frente al modelo original.
- No se han publicado datos sobre sesgos del modelo; se desconoce su comportamiento en dominios sensibles.
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir imagenes incoherentes o no fieles al prompt.
- Limitaciones de idioma: no se especifican los idiomas soportados por el codificador de texto en esta version.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se deben respetar las licencias de los modelos originales (NitroFusion2, Z-Image-Turbo, Qwen3-4B, VAE FLUX.1) y la legislacion aplicable.
- Para produccion: verificar la calidad tras la cuantizacion y el rendimiento en el dispositivo objetivo; no hay benchmarks publicados que garanticen un rendimiento concreto.

## Enlaces

- Hugging Face: https://huggingface.co/MisterSnowCrash/nitrofusion2-mlx-q4
- Modelo base: https://huggingface.co/ChenDY/NitroFusion2
- Paper NitroFusion2: arXiv:2611.05648
- Z-Image-Turbo: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Codigo y licencia Z-Image: https://github.com/Tongyi-MAI/Z-Image
- Paper Z-Image: arXiv:2511.22699
- Codificador de texto Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- VAE FLUX.1: https://github.com/black-forest-labs/flux
- Tier q4 de referencia: https://huggingface.co/SceneWorks/z-image-turbo-mlx
