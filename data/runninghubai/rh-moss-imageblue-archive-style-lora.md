# RunningHubAI/rh-moss-imageblue-archive-style-lora

## Resumen

`rh-moss-imageblue-archive-style-lora` es un adaptador LoRA para el modelo de difusión texto-imagen MOSS-Image, orientado a reproducir el estilo visual del videojuego Blue Archive. Lo publica RunningHub a través de la cuenta del autor `darkHUB` y se distribuye como un único archivo `safetensors` de 123 MiB. No es un modelo autónomo: necesita cargarse sobre el checkpoint base MOSS-Image-SFT BF16 para generar imágenes.

Su relevancia práctica está en la personalización barata de un modelo de imagen mediante un adaptador de bajo rango: permite incorporar una estética concreta sin reentrenar el modelo completo. La model card lo describe como una versión de prueba y proporciona una configuración recomendada —fuerza LoRA 1.0, resolución 1024 × 1536, sampler `euler_ancestral`, scheduler `beta`, 50 pasos y CFG 3.0—, pero no documenta datos de entrenamiento, benchmarks ni licencia.

La información disponible es limitada: no se indican parámetros totales del adaptador, idiomas de los prompts, requisitos de VRAM ni resultados comparativos. Por tanto, cualquier evaluación de calidad o de coste de despliegue debe hacerse de forma empírica con el checkpoint base y el pipeline indicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusión texto-imagen MOSS-Image |
| Parámetros totales | No disponible; el único archivo de pesos LoRA ocupa 123 MiB |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo texto-imagen); resolución inicial sugerida: 1024 × 1536 |
| Tipos de cuantización | No disponible; no se documentan variantes cuantizadas |
| Idiomas soportados | No disponible; no se documenta el idioma de los prompts |
| Licencia | No disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | `safetensors` |
| Modelo base | MOSS-Image-SFT BF16 |
| Encoder de texto indicado | `qwen3.5_9b_bf16.safetensors` |
| VAE indicado | `flux2-vae_small.safetensors` |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se insertan en las capas del modelo base para modificar su comportamiento sin actualizar todos sus pesos. En este caso, el adaptador se aplica sobre MOSS-Image, un modelo de difusión texto-imagen, y se distribuye como un archivo `safetensors` de 123 MiB. La model card indica que se debe usar junto al checkpoint MOSS-Image-SFT BF16, con el encoder de texto `qwen3.5_9b_bf16` y el VAE `flux2-vae_small`.

No se documentan los datos de entrenamiento: no se indica el número de imágenes, la composición del dataset, el proceso de captions, la resolución de entrenamiento ni si se aplicaron técnicas de regularización. El nombre del archivo incluye `epoch-10`, pero no se confirma que corresponda a diez épocas ni se aportan detalles sobre el proceso. Tampoco se describen innovaciones técnicas adicionales más allá del propio ajuste LoRA.

## Capacidades

- Generación de imágenes texto-imagen: el LoRA no genera por sí solo; requiere el checkpoint base MOSS-Image, del que hereda la capacidad de síntesis de imágenes.
- Transferencia de estilo Blue Archive: el adaptador está entrenado para aplicar la estética visual de ese videojuego a personajes, escenarios e ilustraciones.
- Ilustración de personajes: permite generar retratos y figuras con el estilo objetivo, condicionadas por el prompt y la configuración del sampler.
- Generación de escenarios y fondos: la resolución vertical sugerida de 1024 × 1536 es adecuada para composiciones de cuerpo entero, pósteres y fondos de pantalla.
- Ajuste de intensidad del estilo: la model card sugiere una fuerza LoRA de 1.0, aunque no se documenta el efecto de otros valores.
- Integración en ComfyUI y RunningHub: el flujo de uso indicado es ComfyUI, con posibilidad de ejecución en la plataforma RunningHub.
- Tool calling, agentes, razonamiento multi-paso, visión, audio y generación de código: no aplica; no es un modelo de lenguaje ni un sistema multimodal conversacional.
- Capacidades multilingües: no disponible; no se especifica qué idiomas acepta el pipeline ni si el adaptador se entrenó con prompts en varios idiomas.

## Casos de uso

- Fan art de Blue Archive: cargar MOSS-Image-SFT BF16 con el LoRA a fuerza 1.0 y generar ilustraciones de personajes o escenas con la estética del juego. Es adecuado porque el adaptador está entrenado específicamente para ese estilo y evita tener que describir la estética completa en cada prompt.
- Prototipado de personajes para novelas visuales: generar variaciones de diseño de personajes con una dirección artística consistente antes de encargar ilustraciones finales. El LoRA permite explorar opciones rápidamente y comparar resultados.
- Assets para videojuegos independientes: producir bocetos de retratos, fondos y elementos ilustrados en resolución 1024 × 1536 mediante lotes en ComfyUI. El flujo es útil para preproducción, no para sustituir el trabajo final de un artista.
- Portadas y cabeceras editoriales: crear imágenes verticales para artículos, blogs o publicaciones sociales con un estilo anime reconocible. La resolución sugerida encaja con formatos de póster y móvil.
- Dirección de arte y exploración estilística: comparar el resultado del modelo base con y sin el LoRA, ajustando la fuerza del adaptador y los prompts para evaluar hasta qué punto el estilo se adapta a una marca o proyecto.
- Docencia y experimentación con LoRA: utilizar el adaptador como ejemplo práctico de ajuste de bajo rango sobre un modelo de difusión, probando la configuración recomendada y documentando los resultados.
- Generación de fondos de pantalla y material promocional: producir ilustraciones verticales en 1024 × 1536 para móviles, pósteres o banners, con revisión manual posterior para corregir artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El LoRA añade solo 123 MiB, pero el consumo real depende del checkpoint base MOSS-Image-SFT BF16, del encoder de texto y del VAE, cuyos requisitos no se detallan.
- GPU recomendadas: no disponibles. No se publican cifras oficiales de VRAM ni modelos de GPU probados.
- Compatibilidad con GPU de consumo: no disponible. No se debe asumir que cabe en una GPU consumer concreta sin realizar pruebas, especialmente a 1024 × 1536 y con el checkpoint en BF16.
- Opciones de despliegue: ComfyUI es el flujo indicado por el autor; también se puede ejecutar en RunningHub. No se documentan integraciones con vLLM, TGI, llama.cpp u otros runtimes, que además no están orientados a modelos de difusión.
- Latencia y throughput: no disponibles. La configuración sugerida de 50 pasos con `euler_ancestral` y CFG 3.0 influye en el tiempo de inferencia, pero no se aportan medidas de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rh-moss-imageblue-archive-style-lora` | LoRA de estilo para MOSS-Image | No disponible; adaptador de 123 MiB | No aplica | No disponible | Hugging Face |
| MOSS-Image-SFT BF16 | Modelo base texto-imagen | No disponible | No aplica | No disponible | Referenciado en la model card |
| Otras LoRAs de estilo para MOSS-Image | Adaptadores de bajo rango | No disponible | No aplica | No disponible | No verificadas en la información proporcionada |

No se dispone de datos cuantitativos de alternativas concretas —parámetros, benchmarks, licencia o requisitos— que permitan una comparación rigurosa. La comparación queda limitada a la naturaleza del adaptador y al modelo base indicado.

## Limitaciones y advertencias

- Versión de prueba: la model card la describe como un test release; no hay validación comunitaria ni resultados publicados.
- Licencia no disponible: no se especifica la licencia del adaptador. El uso comercial queda condicionado a la licencia del proyecto original, del modelo base y de los componentes asociados.
- Dependencia del modelo base: no funciona de forma autónoma; requiere MOSS-Image-SFT BF16, el encoder `qwen3.5_9b_bf16` y el VAE `flux2-vae_small`.
- Sin benchmarks: no se aportan métricas de calidad, fidelidad de estilo, coherencia anatómica ni comparaciones con otras LoRAs.
- Configuración no universal: los ajustes recomendados —fuerza 1.0, 1024 × 1536, 50 pasos, CFG 3.0— son sugerencias del autor, no una configuración óptima garantizada.
- Riesgo de artefactos visuales: la model card incluye un prompt negativo con `bad anatomy`, `worst quality`, `watermark` y `jpeg artifact`, lo que indica que pueden aparecer defectos anatómicos, marcas de agua o artefactos de compresión.
- Idiomas no documentados: se desconoce si el adaptador responde mejor a prompts en inglés, chino u otros idiomas; el encoder indicado es `qwen3.5_9b_bf16`, pero no se confirma el comportamiento multilingüe del pipeline.
- Sesgos no documentados: no se describe la composición del dataset de entrenamiento ni posibles sesgos de representación.
- Resoluciones distintas: solo se sugiere 1024 × 1536; no se documenta el comportamiento a otras resoluciones o relaciones de aspecto.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-moss-imageblue-archive-style-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-moss-imageblue-archive-style-lora/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2112488171773722626
- Página del autor: https://www.runninghub.ai/user-center/2025565893677027330
- RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API en inglés: https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API en chino: https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
