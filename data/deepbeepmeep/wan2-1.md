# DeepBeepMeep/Wan2.1

## Resumen

Wan2.1 es una familia de modelos generativos de vídeo desarrollada originalmente por Alibaba (Wan-AI) y redistribuida en este repositorio por DeepBeepMeep como parte del ecosistema WanGP (Wan2GP). El repositorio agrupa los pesos de los distintos modelos Wan 2.1 (texto-a-vídeo, imagen-a-vídeo y sus variantes) empaquetados en formato de archivo único para su uso directo con la interfaz web y el motor de inferencia de WanGP. El modelo base declarado es Wan-AI/Wan2.1-T2V-1.3B, un modelo de difusión para generación de vídeo a partir de texto.

El objetivo principal de esta redistribución no es proponer una arquitectura nueva, sino hacer accesibles los modelos Wan 2.1 a hardware modesto: WanGP está diseñado explícitamente para "GPU poor", con requisitos de VRAM que pueden bajar hasta 6 GB en determinados modelos, soporte para GPUs antiguas (series RTX 10XX y 20XX) y descarga automática de los pesos adaptados a la arquitectura del usuario. Esto lo convierte en una puerta de entrada práctica a la generación de vídeo open source sin necesidad de clústeres de GPUs de datacenter.

El repositorio tiene un tamaño de 1784,8 GB, lo que refleja que contiene múltiples variantes del modelo (distintas resoluciones, tareas y cuantizaciones) en un único espacio. El recuento de parámetros de los safetensors principales es de 4.841.450.496, correspondiente a la variante de mayor tamaño presente en el repo, no necesariamente al modelo base de 1.3B. La licencia y los idiomas no están declarados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para generación de vídeo (no disponible el detalle exacto del backbone) |
| Parámetros totales | 4.841.450.496 (safetensors principales del repo); modelo base declarado: Wan2.1-T2V-1.3B |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Pesos en safetensors, GGUF y ONNX; el ecosistema WanGP descarga automáticamente la variante adaptada al hardware, incluyendo versiones de bajo VRAM |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Safetensors, GGUF, ONNX (diffusion-single-file) |

## Arquitectura y entrenamiento

No se dispone en la información proporcionada de detalles sobre la arquitectura interna (tipo de backbone, mecanismo de atención, número de pasos de difusión, uso de VAE o tokenizador de vídeo) ni sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí se documenta es que se trata de modelos de difusión para vídeo, con variantes de texto-a-vídeo (T2V) e imagen-a-vídeo (I2V), y que el repositorio redistribuye los pesos en formato de archivo único para su uso con WanGP.

La innovación destacable de esta distribución es de ingeniería de despliegue, no de modelado: WanGP implementa carga adaptativa según la arquitectura de GPU, soporte para GPUs antiguas, una interfaz web completa, editor de máscaras, mejora de prompts, generación temporal y espacial, soporte de LoRAs y un sistema de colas para lotes de generación. El modelo base Wan2.1-T2V-1.3B es la variante ligera de la familia Wan 2.1, pensada para inferencia en hardware de consumo.

## Capacidades

- Generación de vídeo a partir de texto (T2V) mediante el modelo base Wan2.1-T2V-1.3B.
- Generación de vídeo a partir de imagen (I2V), según los tags del repositorio.
- Soporte de LoRAs para personalizar el estilo o el contenido generado.
- Editor de máscaras para generación espacial y temporal (inpainting/outpainting sobre vídeo).
- Mejora de prompts (prompt enhancer) integrada en la interfaz.
- Generación por lotes mediante sistema de colas.
- Compatibilidad con GPUs antiguas (RTX 10XX, 20XX) y requisitos de VRAM reducidos (hasta 6 GB en ciertos modelos).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades de audio en la información disponible.

## Casos de uso

- Generación de clips de vídeo para prototipado creativo: un estudio pequeño puede producir borradores de vídeo a partir de descripciones textuales usando Wan2.1-T2V-1.3B en una GPU de consumo, sin depender de servicios en la nube.
- Animación de imágenes fijas para contenido de redes sociales: la variante I2V permite dar movimiento a ilustraciones o fotografías, útil para creadores que necesitan piezas cortas de forma recurrente.
- Previsualización de storyboards en producción audiovisual: el modelo genera versiones animadas de escenas descritas en guion, acelerando la validación antes del rodaje.
- Edición localizada de vídeo mediante el editor de máscaras: sustitución o extensión de regiones concretas de un clip sin regenerar la secuencia completa.
- Investigación en generación de vídeo con recursos limitados: el soporte para GPUs antiguas y VRAM baja permite a grupos académicos sin clúster experimentar con modelos de difusión de vídeo.
- Personalización de estilo con LoRAs: integración de estilos visuales propios (marca, estética concreta) entrenando o cargando LoRAs compatibles con el modelo base.
- Automatización de pipelines de contenido: el sistema de colas y la interfaz web permiten lanzar lotes de generación y recogerlos después, integrándose en flujos de trabajo de marketing o medios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el ecosistema WanGP declara requisitos tan bajos como 6 GB de VRAM para determinados modelos de la familia; para la variante de mayor tamaño del repo (4.841 M de parámetros en safetensors) se requiere más VRAM, aunque no se especifica la cifra exacta.
- GPUs recomendadas: no se detallan modelos concretos; se indica compatibilidad con GPUs antiguas (RTX 10XX, 20XX) y rendimiento "muy rápido" en GPUs recientes.
- GPU de consumo: sí, el proyecto está diseñado explícitamente para hardware de consumo; el límite inferior documentado es de 6 GB de VRAM en ciertos modelos.
- Opciones de despliegue: WanGP (interfaz web propia con motor de inferencia integrado), con descarga automática de pesos adaptados a la arquitectura; formatos safetensors, GGUF y ONNX disponibles en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Wan2.1 (este repo, DeepBeepMeep) | 4.841 M en safetensors principales; base T2V-1.3B | No disponible | No disponible | Hugging Face, integrado en WanGP |
| Hunyuan Video | No disponible en la información | No disponible | No disponible | Soportado por WanGP |
| Flux 1 y 2 | No disponible en la información | No disponible | No disponible | Soportado por WanGP |
| Z-Image | No disponible en la información | No disponible | No disponible | Soportado por WanGP |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible; antes de un uso comercial es imprescindible verificar la licencia del modelo base original (Wan-AI/Wan2.1-T2V-1.3B) y de los pesos redistribuidos.
- El repositorio mezcla múltiples variantes y cuantizaciones en un espacio de 1784,8 GB; el recuento de parámetros de los safetensors no corresponde necesariamente al modelo base de 1.3B, por lo que hay que seleccionar cuidadosamente la variante adecuada.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas en la información disponible.
- Los modelos de difusión de vídeo pueden generar contenido visual incoherente en escenas complejas, con movimiento rápido o con múltiples sujetos; no hay datos publicados que cuantifiquen esta limitación.
- El rendimiento depende fuertemente de la GPU: en GPUs antiguas o con poca VRAM la generación será más lenta y puede requerir variantes cuantizadas.
- La información sobre arquitectura interna, entrenamiento y benchmarks es escasa; para evaluación rigurosa conviene consultar la documentación del modelo base original en Wan-AI.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DeepBeepMeep/Wan2.1
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Repositorio WanGP en GitHub: https://github.com/deepbeepmeep/Wan2GP
- Servidor de Discord: https://discord.gg/g7efUW9jGV
- Twitter/X del autor: https://x.com/deepbeepmeep
