# RunningHubAI/rh-flux2-klein-9b-lora

## Resumen

rh-flux2-klein-9b-lora es un adaptador LoRA de generación de imágenes (text-to-image) publicado por RunningHubAI y entrenado por el usuario 刀鱼AI dentro de la plataforma RunningHub. Se distribuye como un único fichero safetensors de 332 MiB (el repositorio completo ocupa 0,3 GB) y se aplica sobre el modelo base Flux2-Klein-9B, del que hereda arquitectura, resolución y ventana de contexto; la model card no documenta ni la arquitectura del modelo base ni el recuento de parámetros del adaptador.

El objetivo declarado es el fotorrealismo de personajes: la descripción original en chino indica un entrenamiento que refuerza de forma global la piel, la complexión, la ropa y el fondo, orientado específicamente a mujeres asiáticas. Se activa mediante la palabra clave (trigger word) `hdzq`, que debe incluirse en el prompt.

Su relevancia práctica está en el flujo de trabajo habitual de ComfyUI: especializar un modelo de difusión grande cargando solo 332 MiB adicionales en lugar de reentrenar los pesos base. Como contrapartida, el repositorio no declara licencia, idiomas soportados ni resultados de evaluación, y acumula 0 descargas y 0 "likes", por lo que es un artefacto sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Flux2-Klein-9B; arquitectura del base no disponible |
| Parametros totales | No disponible (el fichero de pesos `xinmienv4_10.safetensors` ocupa 332 MiB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Flux2-Klein-9B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible; la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o del modelo upstream |
| Formato de pesos | safetensors (`xinmienv4_10.safetensors`, 332 MiB) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, no de un modelo completo: los 332 MiB de pesos se aplican sobre Flux2-Klein-9B y modifican sus capas mediante matrices de bajo rango. La información proporcionada no detalla el rango del adaptador, las capas objetivo, la arquitectura interna del modelo base ni el número de parámetros entrenables, por lo que no es posible describir la configuración técnica del entrenamiento.

Tampoco se documentan el volumen de tokens de imagen, la composición del dataset, el uso de RLHF/DPO ni ninguna innovación técnica adicional. Lo único verificable es el propósito del ajuste fino: fotorrealismo de personas, con refuerzo de piel, complexión, ropa y fondo, y especialización declarada en mujeres asiáticas, activado por la palabra clave `hdzq`. El entrenamiento se realizó en la plataforma RunningHub, que ofrece servicio de entrenamiento de modelos.

## Capacidades

- Generación de imágenes fotorrealistas de personas a partir de texto (pipeline text-to-image).
- Especialización declarada en rasgos y complexión de mujeres asiáticas.
- Mejora del detalle de piel, proporciones corporales, vestuario y fondo respecto al modelo base, según la descripción del autor.
- Activación mediante palabra clave: el prompt debe incluir `hdzq` para aplicar el efecto del adaptador.
- Compatible con ComfyUI, con la plataforma RunningHub y con Hugging Face como canal de distribución de pesos.
- Soporte de tool calling / function calling: no aplica (es un modelo de imagen, no de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponible (no se declaran idiomas de prompt soportados).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Retrato fotorrealista para proyectos de ilustración: cargar el LoRA sobre Flux2-Klein-9B en ComfyUI e incluir `hdzq` en el prompt para obtener retratos con acabado de piel más realista que el modelo base.
- Fotografía de producto y moda: generar modelos de catálogo con prendas concretas, aprovechando el refuerzo declarado de ropa y complexión para evitar resultados genéricos.
- Previsualización de vestuario y estilismo: iterar sobre combinaciones de ropa y fondo antes de una sesión fotográfica real, con coste de generación muy inferior al de una producción física.
- Generación de avatares y perfiles: crear imágenes de identidad consistentes para cuentas de marca, comunidades o campañas, reutilizando el mismo prompt semilla y la palabra clave.
- Ilustración editorial y contenidos para redes: producir lotes de imágenes con estética coherente para artículos, portadas o publicaciones, ajustando el prompt sin tocar los pesos base.
- Integración en pipelines automatizados de ComfyUI: al ser un fichero safetensors de 332 MiB, puede cargarse y descargarse por API en flujos por lotes, cambiando entre distintos LoRA según el tipo de encargo.
- Base para un ajuste fino posterior: el adaptador puede servir como punto de partida (o combinarse con otros LoRA de personaje) para especializaciones más concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM del adaptador: 332 MiB de pesos en safetensors; el consumo real lo determina casi por completo el modelo base Flux2-Klein-9B, cuyo tamaño de pesos y requisitos no se detallan en la información proporcionada.
- VRAM total para inferencia: no disponible (depende del modelo base y de su cuantización).
- GPU recomendadas: no disponibles en la información proporcionada; el adaptador en sí no impone requisitos propios significativos.
- Compatibilidad con GPU de consumo: no disponible para el conjunto base + LoRA; el LoRA por sí solo (0,3 GB) es trivial de cargar en cualquier GPU moderna.
- Opciones de despliegue: ComfyUI (plataforma declarada), RunningHub (servicio en la nube del autor) y Hugging Face como repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la información proporcionada. Como referencia estructural, la comparación relevante sería entre este adaptador y otros LoRA de fotorrealismo de personaje entrenados sobre el mismo modelo base:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-flux2-klein-9b-lora | No disponible (fichero de 332 MiB) | No disponible | No disponible | No disponible | Hugging Face, ComfyUI, RunningHub |
| Flux2-Klein-9B (modelo base) | No disponible | No disponible | No disponible | No disponible | No disponible en esta información |
| Otros LoRA de personaje sobre Flux2-Klein-9B | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgo demográfico explícito: el adaptador está entrenado para mujeres asiáticas, por lo que su rendimiento en otros grupos demográficos no está documentado y puede degradarse.
- Sin datos de evaluación: no hay benchmarks, métricas FID/CLIP ni comparaciones objetivas con el modelo base, así que la mejora declarada no es verificable de forma independiente.
- Riesgo de artefactos propios de los modelos de difusión: deformaciones anatómicas, manos y dedos incorrectos, incoherencias de iluminación o fondos inconsistentes; no se documenta ningún mecanismo de mitigación.
- Licencia ambigua: no se especifica una licencia concreta, solo que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original. Esto hace inseguro el uso comercial sin consultar previamente los términos de Flux2-Klein-9B y de RunningHub.
- Dependencia total del modelo base: cualquier actualización, restricción o cambio de licencia de Flux2-Klein-9B afecta directamente a este adaptador.
- Dependencia de la palabra clave `hdzq`: sin ella en el prompt, el efecto del LoRA puede no activarse o hacerlo de forma parcial.
- Idiomas de prompt no declarados: se desconoce si el adaptador responde igual de bien a prompts en castellano, inglés o chino.
- Sin validación comunitaria: 0 descargas y 0 "likes" en el momento de redactar esta ficha; no hay casos de uso confirmados por terceros.
- Fechas del repositorio: creado y actualizado el 26 de septiembre de 2026 según los metadatos, lo que dificulta situar el modelo respecto a su base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RunningHubAI/rh-flux2-klein-9b-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-flux2-klein-9b-lora/blob/main/README_cn.md
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2046767046247063553
- Página del autor: https://www.runninghub.cn/user-center/1911247181368418306
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Plataforma de entrenamiento de modelos: https://www.runninghub.ai/page-model
