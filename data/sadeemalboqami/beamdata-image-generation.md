# sadeemalboqami/beamdata-image-generation

## Resumen

Beamdata Image Generation es un repositorio de HuggingFace publicado por el usuario sadeemalboqami que no contiene pesos de un modelo propio, sino la documentacion del trabajo de despliegue y evaluacion de generacion de imagenes realizado para Beamdata en el marco de un proyecto capstone (AI Data Center Capstone Project, Team 6). El repositorio actua como registro tecnico de dos modelos de generacion de imagenes servidos en produccion experimental: FLUX.2 Klein 4B en su variante cuantizada Q4_K_M y Z-Image-Turbo en su variante W4.

Ambos modelos se sirven mediante vLLM-Omni y se empaquetan como servicios de inferencia contenerizados con Docker y orquestados sobre Kubernetes (k3s), expuestos a traves de APIs HTTP autenticadas y ejecutados sobre una GPU NVIDIA RTX A6000. El repositorio incluye un benchmark fijo de 25 prompts a resolucion 512x512 con resultados de tiempo medio de generacion, VRAM maxima y fiabilidad, lo que lo convierte en una referencia util para equipos que necesiten dimensionar despliegues de generacion de imagenes cuantizados.

Su relevancia actual es practica mas que cientifica: no introduce arquitectura nueva ni pesos originales, sino que documenta una comparativa operativa entre dos alternativas de generacion de imagenes de codigo abierto bajo restricciones reales de VRAM y latencia. Esto es util para desarrolladores que evaluan que modelo desplegar en hardware de gama alta de una sola GPU y con cuantizacion de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio documenta el despliegue de FLUX.2 Klein 4B y Z-Image-Turbo; no detalla la arquitectura interna de ninguno de los dos) |
| Parametros totales | FLUX.2 Klein: 4B (segun la denominacion del modelo base). Z-Image-Turbo: no disponible |
| Parametros activos | no aplica (no se describe ninguna arquitectura MoE) |
| Longitud de contexto | no aplica / no disponible (modelos de generacion de imagenes; el repositorio no especifica limites de tokens de prompt) |
| Tipos de cuantizacion | Q4_K_M (FLUX.2 Klein 4B) y W4, 4 bits (Z-Image-Turbo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no aloja pesos; los despliegues usan variantes cuantizadas servidas con vLLM-Omni) |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna de los modelos desplegados ni reproduce informacion de entrenamiento sobre ellos. Se limita a identificar los modelos base: FLUX.2 Klein 4B, publicado por black-forest-labs, con etiqueta de la familia FLUX, y Z-Image-Turbo, publicado por Tongyi-MAI. Las variantes efectivamente desplegadas son cuantizaciones de 4 bits: Q4_K_M para FLUX.2 Klein y W4 para Z-Image-Turbo, servidas ambas mediante el motor vLLM-Omni.

Tampoco se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de ajuste como RLHF o DPO, ya que el objeto del proyecto es el despliegue y la evaluacion operativa, no el entrenamiento. La innovacion tecnica que si se documenta es de infraestructura: empaquetado en contenedores Docker, orquestacion en Kubernetes (k3s), exposicion mediante APIs HTTP autenticadas y ejecucion en una unica GPU NVIDIA RTX A6000 con vLLM-Omni como servidor de inferencia.

## Capacidades

- Generacion de imagenes a partir de prompts de texto a resolucion 512x512, segun el benchmark documentado.
- Servicio de inferencia expuesto como API HTTP autenticada, apto para consumo desde aplicaciones externas.
- Despliegue contenerizado y orquestable en Kubernetes (k3s), con lo que soporta escalado y gestion de ciclo de vida mediante manifiestos.
- Ejecucion con cuantizacion de 4 bits, lo que reduce el consumo de VRAM frente a los pesos completos.
- Comparabilidad operativa: ambos modelos se evaluaron con el mismo conjunto fijo de 25 prompts y la misma resolucion, permitiendo comparaciones directas de latencia y memoria.
- Fiabilidad medida del 100 % en la ejecucion del benchmark (25 de 25 generaciones completadas en ambos casos).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo de pensamiento, por tratarse de modelos de generacion de imagenes y no de modelos de lenguaje.
- No se documentan capacidades multilingues ni el tratamiento de prompts en idiomas distintos del usado en el benchmark.

## Casos de uso

- Despliegue reproducible de generacion de imagenes en Kubernetes: el repositorio sirve como plantilla para levantar un servicio de generacion de imagenes con vLLM-Omni, Docker y k3s, incluyendo API HTTP autenticada, lo que reduce el trabajo de integracion en entornos con orquestacion existente.
- Seleccion de modelo segun presupuesto de VRAM: con 11,67 GB de pico para FLUX.2 Klein 4B Q4_K_M y 7,86 GB para Z-Image-Turbo W4, un equipo puede decidir que modelo desplegar en funcion de la GPU disponible y del margen que necesite reservar.
- Seleccion de modelo segun latencia: FLUX.2 Klein 4B Q4_K_M genera en 6,705 s de media frente a los 14,554 s de Z-Image-Turbo W4 en el mismo benchmark, dato directamente util para aplicaciones interactivas donde la latencia es el criterio dominante.
- Servicio interno de generacion de imagenes para equipos de producto: el modelo con menor tiempo de generacion puede exponerse como API interna para generar recursos graficos de baja resolucion (512x512) en herramientas de diseno o marketing.
- Generacion por lotes de imagenes a partir de listas de prompts: gracias a la fiabilidad registrada de 25/25 en ambos modelos, es viable encolar lotes moderados sin mecanismos complejos de reintento.
- Evaluacion comparativa de cuantizaciones de 4 bits: el repositorio aporta un punto de referencia de rendimiento para Q4_K_M y W4 sobre una misma GPU (RTX A6000), util antes de adoptar una cuantizacion agresiva en produccion.
- Reproduccion y ampliacion del benchmark: un equipo puede reutilizar el conjunto fijo de 25 prompts a 512x512 para comparar nuevos modelos o configuraciones contra las cifras ya publicadas.
- Aprovisionamiento en una unica GPU de gama profesional: el proyecto demuestra que ambos modelos caben y se sirven en una sola RTX A6000, lo que sirve de referencia de coste para despliegues sin clúster multi-GPU.

## Benchmarks y rendimiento

Resultados publicados en el repositorio, correspondientes a un benchmark fijo de 25 prompts a resolucion 512x512, servido con vLLM-Omni sobre NVIDIA RTX A6000:

| Modelo | Tiempo medio de generacion | VRAM maxima | Fiabilidad |
|---|---:|---:|---:|
| FLUX.2 Klein 4B Q4_K_M | 6,705 s | 11,67 GB | 25/25 |
| Z-Image-Turbo W4 | 14,554 s | 7,86 GB | 25/25 |

No se han publicado en la informacion disponible metricas de calidad de imagen (FID, CLIP score, similitud perceptual ni evaluacion humana), ni comparaciones contra los modelos base en precision completa.

## Requisitos de hardware

- VRAM estimada para inferencia: 11,67 GB de pico para FLUX.2 Klein 4B Q4_K_M y 7,86 GB de pico para Z-Image-Turbo W4, medidos sobre NVIDIA RTX A6000 en el despliegue documentado.
- GPU de referencia del proyecto: NVIDIA RTX A6000 (una unica unidad).
- GPU recomendadas: A6000 o superiores para reproducir exactamente las condiciones del benchmark; A100 o H100 si se busca mayor margen y concurrencia.
- Encaje en GPU de consumo: FLUX.2 Klein 4B Q4_K_M (11,67 GB) cabe en tarjetas con 16 GB o mas de VRAM, como RTX 4080, RTX 4090 o RTX 3090/3090 Ti, y queda al limite en tarjetas de 12 GB. Z-Image-Turbo W4 (7,86 GB) es compatible con tarjetas de 8-12 GB, como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070. En ambos casos hay que anadir el consumo del runtime y del sistema operativo.
- Opciones de despliegue: vLLM-Omni sobre contenedor Docker, orquestado con Kubernetes (k3s) y expuesto mediante API HTTP autenticada. No se documentan otros runners (llama.cpp, Ollama, TGI) en la informacion disponible.
- Latencia y throughput: 6,705 s de media por imagen para FLUX.2 Klein 4B Q4_K_M y 14,554 s de media por imagen para Z-Image-Turbo W4, a 512x512 y sin datos de concurrencia ni de generacion por lotes.

## Comparativa con modelos similares

Comparativa entre los dos modelos desplegados en este repositorio, que son las dos alternativas evaluadas bajo las mismas condiciones:

| Criterio | FLUX.2 Klein 4B Q4_K_M | Z-Image-Turbo W4 |
|---|---|---|
| Modelo base | black-forest-labs/FLUX.2-klein-4B | Tongyi-MAI/Z-Image-Turbo |
| Parametros | 4B (segun denominacion) | no disponible |
| Cuantizacion | Q4_K_M | W4 (4 bits) |
| Tiempo medio (512x512, 25 prompts) | 6,705 s | 14,554 s |
| VRAM maxima | 11,67 GB | 7,86 GB |
| Fiabilidad | 25/25 | 25/25 |
| Servidor de inferencia | vLLM-Omni | vLLM-Omni |
| Licencia | no disponible | no disponible |

No se dispone de comparaciones con otros modelos de generacion de imagenes de tamano similar dentro de la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo ni una model card de un modelo entrenado: es documentacion de despliegue, por lo que no debe tratarse como una publicacion de un modelo nuevo.
- No se especifica licencia, ni para el repositorio ni para las variantes desplegadas, lo que impide determinar si el uso comercial es posible. Cualquier uso en produccion exige verificar las licencias de FLUX.2 Klein 4B y Z-Image-Turbo en sus repositorios de origen.
- No se publican metricas de calidad de imagen: solo se miden tiempo de generacion, VRAM y fiabilidad de ejecucion. Un modelo mas rapido no implica mejor calidad, y la cuantizacion de 4 bits puede degradar la fidelidad respecto a los pesos completos, algo que este benchmark no cuantifica.
- El benchmark se limita a 25 prompts a 512x512. Es una muestra pequena y de baja resolucion, insuficiente para extrapolar comportamiento en produccion con prompts diversos, resoluciones mayores o dominios especializados.
- No se documentan sesgos conocidos, comportamiento con prompts en distintos idiomas ni politicas de filtrado de contenido.
- Los datos de VRAM y latencia corresponden a una unica GPU (RTX A6000) y a una configuracion concreta de vLLM-Omni; no son extrapolables directamente a otros modelos de GPU ni a escenarios con concurrencia.
- El repositorio no registra descargas ni valoraciones y fue creado y actualizado el mismo dia, por lo que no cuenta con validacion externa de la comunidad.
- No se documentan limites de longitud de prompt ni de resolucion de salida distintos de los usados en el benchmark.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sadeemalboqami/beamdata-image-generation
- Modelo base FLUX.2 Klein 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Modelo base Z-Image-Turbo: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Repositorio del proyecto en GitHub: https://github.com/SadeemAlBoqami/beamdata-go-to-market-image-generation
