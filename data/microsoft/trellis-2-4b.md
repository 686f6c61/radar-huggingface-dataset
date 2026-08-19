# microsoft/TRELLIS.2-4B

## Resumen

TRELLIS.2-4B es un modelo generativo de imagen a 3D desarrollado por Microsoft, presentado en diciembre de 2025. Se trata de un transformer de flow-matching con 4 mil millones de parámetros que produce activos 3D completos con materiales PBR (Physical-Based Rendering) a partir de una única imagen. El modelo introduce una representación novedosa denominada O-Voxel, un voxel estructurado "sin campo" que codifica geometría y apariencia de forma conjunta, superando las limitaciones de métodos basados en campos iso-superficie como SDF o Flexicubes para manejar topologías abiertas o no múltiples.

La relevancia actual del modelo radica en su capacidad para generar mallas texturizadas de alta fidelidad hasta una resolución de 1536³ voxels, con una compresión espacial de 16× mediante un VAE 3D disperso, lo que permite codificar un activo de 1024³ en aproximadamente 9.600 tokens latentes. El modelo está disponible bajo licencia MIT, con código abierto en GitHub y un repositorio de pesos en Hugging Face de 16,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-matching transformer con VAE 3D disperso (sparse voxel) |
| Parametros totales | 4 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de generacion 3D, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en la model card), aunque el modelo no procesa lenguaje |
| Licencia | MIT |
| Formato de pesos | Safetensors (repositorio de 16,2 GB) |

## Arquitectura y entrenamiento

TRELLIS.2-4B emplea una arquitectura de transformer con flow-matching sobre una representación de voxels dispersos denominada O-Voxel. Esta representación codifica tanto geometría como apariencia (incluyendo atributos PBR como opacidad para superficies translúcidas) en una estructura unificada, permitiendo la reconstrucción y generación de activos 3D con topologías arbitrarias, bordes afilados y materiales completos. El modelo utiliza un VAE 3D disperso con un factor de reducción espacial de 16×, lo que convierte un volumen de 1024³ en unos 9.600 tokens latentes con una degradación perceptual mínima.

El entrenamiento se realizó a resoluciones de hasta 1536³ voxels, y el modelo es capaz de generar texturas condicionadas por forma y por imagen de referencia. No se han publicado detalles sobre la composición exacta del dataset de entrenamiento ni sobre el uso de técnicas de alineación como RLHF o DPO; de hecho, la model card indica explícitamente que el modelo no ha sido alineado con preferencias humanas.

## Capacidades

- Generacion de activos 3D completos a partir de una sola imagen: malla, materiales PBR (incluyendo opacidad y translucidez) y texturas.
- Manejo de topologias arbitrarias: superficies abiertas, geometria no multiple y estructuras completamente cerradas, sin conversion con perdidas.
- Generacion de alta resolucion: hasta 1536³ voxels, con tiempos de inferencia de ~3 segundos a 512³, ~17 segundos a 1024³ y ~60 segundos a 1536³ en una GPU NVIDIA H100.
- Representacion compacta: el VAE 3D disperso logra una compresion espacial de 16×, reduciendo la carga computacional y de memoria.
- Texturizado condicionado por forma: puede generar texturas para mallas 3D de entrada usando imagenes de referencia.
- Conversion bidireccional instantanea entre mallas y O-Voxels (del orden de milisegundos a segundos), sin optimizacion adicional.

## Casos de uso

- Creacion de activos para videojuegos: generar modelos 3D listos para produccion con materiales PBR a partir de conceptos artisticos, acelerando el pipeline de asset creation.
- Prototipado rapido en diseno industrial: convertir fotografias de productos en modelos 3D texturizados para evaluar disenos o generar variaciones.
- E-commerce y catalogos 3D: producir representaciones tridimensionales de productos a partir de imagenes planas, mejorando la experiencia de compra online.
- Realidad aumentada y virtual: generar objetos 3D con materiales realistas para entornos inmersivos, partiendo de imagenes de referencia.
- Impresion 3D: aunque el modelo puede producir pequeños agujeros en las mallas, se proporcionan scripts de postprocesado para rellenar huecos y obtener geometria estanca.
- Investigacion en generacion 3D: servir como modelo base para experimentos de fine-tuning o como referencia comparativa en estudios academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (como MMLU, HumanEval o GSM8K) porque este modelo no es de lenguaje. La model card proporciona datos de velocidad de inferencia en una GPU NVIDIA H100, que se resumen a continuacion:

| Resolucion | Tiempo de inferencia |
|---|---|
| 512³ | ~3 segundos |
| 1024³ | ~17 segundos |
| 1536³ | ~60 segundos |

No se incluyen metricas de calidad objetiva (como PSNR o FID) en la informacion disponible.

## Requisitos de hardware

- VRAM minima: 24 GB de memoria GPU (segun la model card).
- GPUs verificadas: NVIDIA A100 y H100.
- No se menciona compatibilidad con GPUs de consumo como RTX 4090; se requiere al menos 24 GB, por lo que una RTX 4090 (24 GB) podria funcionar, pero no esta confirmado.
- Sistema operativo: solo Linux (probado).
- Software: CUDA Toolkit recomendado version 12.4, Python 3.8 o superior, Conda para gestion de dependencias.
- Opciones de despliegue: el repositorio oficial proporciona una pipeline de Python (`trellis2.pipelines.Trellis2ImageTo3DPipeline`) que requiere compilacion de paquetes CUDA. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia: los tiempos de inferencia indicados (3-60 segundos) son para H100; en GPUs menos potentes seran mayores.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de comparacion con otros modelos de imagen a 3D en la informacion proporcionada. Se puede mencionar que existen alternativas como TripoSR, LGM o el TRELLIS original (anterior a la version 2), pero no se incluyen cifras comparativas. La model card no ofrece una tabla comparativa con otros modelos.

## Limitaciones y advertencias

- El modelo puede generar pequenos agujeros o discontinuidades topologicas menores en las mallas resultantes; para aplicaciones que requieran geometria estanca (por ejemplo, impresion 3D) se deben aplicar scripts de postprocesado como relleno de huecos.
- No esta alineado con preferencias humanas (sin RLHF ni fine-tuning estetico); los resultados reflejan la distribucion de los datos de entrenamiento y pueden variar en estilo, por lo que puede ser necesario experimentar con las entradas para lograr el resultado artistico deseado.
- Solo se ha probado en Linux; no hay soporte oficial para Windows o macOS.
- Requiere una GPU con al menos 24 GB de VRAM, lo que limita su uso en hardware de consumo medio.
- La licencia MIT permite uso comercial, pero es recomendable revisar los terminos de los datasets de entrenamiento si se utiliza en productos finales.
- El modelo no acepta texto como entrada; solo imagenes, por lo que no es adecuado para tareas de generacion de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/microsoft/TRELLIS.2-4B
- Paper (arXiv): https://arxiv.org/abs/2512.14692
- Repositorio GitHub: https://github.com/microsoft/TRELLIS.2
- Pagina del proyecto: https://microsoft.github.io/TRELLIS.2
- Web no oficial de referencia: https://trellis-2.org/
