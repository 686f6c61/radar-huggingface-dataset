# Rin247/Qwen-Image-2.1-FP4

## Resumen

Qwen-Image-2.1-FP4 es una cuantización comunitaria, publicada por el usuario Rin247, del modelo Qwen-Image-2.1 de Alibaba Qwen. Se trata de un modelo unificado de generación de imágenes a partir de texto y de edición de imágenes, distribuido en formato diffusers y con pesos safetensors. El repositorio ocupa 12,8 GB y declara 4.751.405.448 parámetros en sus metadatos de safetensors, frente a los aproximadamente 7.000 millones de parámetros que la model card del modelo base atribuye al componente de generación visual (32 capas DiT de flujo único).

El modelo base resuelve dos tareas con un único conjunto de pesos: la síntesis de imágenes nuevas a partir de prompts y la edición de imágenes existentes, incluyendo generación nativa con canal alfa (RGBA), extracción de sujetos y edición guiada por máscaras, anotaciones pintadas o regiones circulares. Admite hasta 10 imágenes de referencia simultáneas, lo que permite preservar identidad en retratos y productos, y trabaja a resoluciones de hasta 2048 x 2048 con siete relaciones de aspecto predefinidas.

Su relevancia ahora es doble. Por un lado, la licencia qwen-research y el pipeline `QwenImage21Pipeline` lo sitúan en el ecosistema diffusers con muy pocas líneas de código. Por otro, al ser una cuantización FP4 de un modelo de difusión grande, promete reducir el coste de memoria e inferencia, aunque el autor no documenta el esquema de cuantización, el calibrado ni la pérdida de calidad asociada, y no se han publicado benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de flujo único, 32 capas; atención de granularidad mixta y reutilización de caché KV de prefijo |
| Parámetros totales | 4.751.405.448 (metadatos de safetensors del repo); el componente de generación visual del modelo base declara ~7B |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de generación de imagen; no se documenta la ventana del codificador de texto) |
| Tipos de cuantización | FP4 según el nombre del repositorio; las etiquetas incluyen además «8-bit». El esquema exacto, el calibrado y el error introducido no están documentados |
| Idiomas soportados | No disponible (todos los ejemplos de la model card usan prompts en inglés) |
| Licencia | qwen-research (Qwen Research License Agreement), etiquetada como `license:other` |
| Formato de pesos | safetensors, librería diffusers (`QwenImage21Pipeline`) |
| Resolución soportada | Hasta 2048 x 2048; relaciones 1:1, 4:3, 3:4, 3:2, 2:3, 16:9 y 9:16 |
| Pasos de inferencia recomendados | 40 |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

El componente de generación visual es un Diffusion Transformer de flujo único con 32 capas, descrito por el autor del modelo base como compacto y eficiente. Dos innovaciones se citan explícitamente: atención de granularidad mixta, que combina distintos niveles de agregación de tokens para reducir coste computacional, y reutilización de caché KV de prefijo, que evita recalcular las representaciones de la parte fija de la secuencia en pasos sucesivos. El modelo unifica generación y edición en los mismos pesos, en lugar de emplear adaptadores o modelos separados para cada tarea.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF, DPO o ajuste por preferencias humanas. Tampoco se documenta el codificador de texto empleado ni el VAE, más allá de que el pipeline se carga con `QwenImage21Pipeline.from_pretrained` y `torch_dtype=torch.bfloat16` en la versión original. La model card menciona mejoras en tipografía, iluminación de retratos y detalle fino, así como soporte nativo de transparencia y de hasta 10 imágenes de referencia para edición, pero no detalla la receta de entrenamiento que las habilita.

## Capacidades

- Generación de imágenes a partir de texto en resoluciones de hasta 2048 x 2048 y siete relaciones de aspecto predefinidas.
- Edición de imágenes con instrucciones en lenguaje natural sobre una imagen de entrada (por ejemplo, cambiar el fondo).
- Generación nativa con canal alfa (RGBA): creación de imágenes transparentes y edición de capas transparentes con un formato de prompt específico.
- Extracción de sujetos a partir de fotografías, apoyándose en la salida con transparencia.
- Edición guiada por regiones: círculos, anotaciones pintadas o máscaras independientes para delimitar el cambio local.
- Composición con hasta 10 imágenes de referencia, con preservación de identidad en personas y productos (la model card muestra una fotografía de grupo generada desde seis retratos de referencia).
- Renderizado de texto dentro de la imagen, con mejoras declaradas en tipografía.
- Integración con diffusers mediante `QwenImage21Pipeline`, con semilla manual para reproducibilidad (`torch.Generator`).
- Optimización de memoria mediante `enable_model_cpu_offload()`.
- Tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada general, audio y modo thinking: no disponibles; es un modelo de imagen, no un modelo de lenguaje conversacional.

## Casos de uso

- Generación de recursos gráficos con transparencia: creación de pegatinas, iconos, logotipos y sprites en RGBA directamente desde texto, sin necesidad de un paso posterior de recorte, gracias al canal alfa nativo y al formato de prompt documentado.
- Edición publicitaria localizada: cambiar el fondo, la iluminación o un objeto concreto de una fotografía de producto usando máscaras o anotaciones pintadas, manteniendo el resto de la imagen intacta.
- Catálogos de comercio electrónico: extracción del sujeto de fotografías tomadas en estudio improvisado para generar imágenes de producto sobre fondo transparente o neutro, con la ventaja de que la extracción y la generación comparten modelo.
- Fotografía compuesta con preservación de identidad: construcción de escenas de grupo a partir de retratos individuales usando el límite de 10 imágenes de referencia, útil para campañas, avatares corporativos o material de eventos.
- Creación de material gráfico con texto integrado: carteles, mockups y portadas en las que el texto debe renderizarse de forma legible, apoyándose en la mejora de tipografía declarada y en prompts largos y descriptivos.
- Prototipado de storyboards y maquetas de campaña: generación rápida en 16:9 o 9:16 a 2048 px para previsualizar composiciones antes de producir el asset definitivo, con semilla fija para iterar sobre la misma composición.
- Pipelines automatizados de contenido: integración en servicios de generación por lotes mediante diffusers, fijando semilla y parámetros, y usando `enable_model_cpu_offload()` para ejecutar en GPUs con memoria limitada.
- Retoque fotográfico asistido por región: sustitución o reparación de elementos concretos de una imagen marcando la zona con un círculo o una máscara separada, sin rehacer la imagen completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del modelo base no incluye tablas comparativas y el repositorio de la cuantización FP4 no aporta métricas de calidad (FID, CLIP score, similitud con la versión en bfloat16) ni comparaciones con otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no confirmada por el autor. Como referencia de cálculo, 4.751.405.448 parámetros en FP4 ocupan aproximadamente 2,4 GB de pesos, pero el pipeline completo incluye además codificador de texto y VAE, que no están cuantizados según la información disponible. El repositorio completo pesa 12,8 GB, lo que sugiere que contiene más de una precisión o componentes auxiliares.
- La versión original en bfloat16, con ~7B parámetros solo en el componente visual, requiere del orden de 14 GB únicamente para esos pesos, más los componentes auxiliares.
- GPU recomendadas: no disponibles. No hay datos de latencia ni de throughput publicados para ninguna GPU concreta.
- Encaje en GPU de consumo: plausible con `enable_model_cpu_offload()`, que descarga componentes a CPU, pero no hay confirmación oficial de VRAM mínima ni de rendimiento en tarjetas como RTX 4090 o RTX 3090.
- Opciones de despliegue documentadas: diffusers con `QwenImage21Pipeline`, `torch_dtype=torch.bfloat16` y `enable_model_cpu_offload()`. Se requieren `torch>=2.4.0`, `transformers>=5.17`, diffusers desde el repositorio de GitHub, `accelerate` y `pillow`. Otras vías (llama.cpp, Ollama, vLLM, TGI) no aplican o no están documentadas para este modelo.
- Latencia y throughput: no disponibles. El único parámetro de coste documentado es el número de pasos de inferencia recomendado (40).

## Comparativa con modelos similares

La información proporcionada solo permite comparar esta cuantización con su propio modelo base. No se han facilitado datos de alternativas como otros modelos de difusión de generación y edición.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Rin247/Qwen-Image-2.1-FP4 (esta ficha) | 4.751.405.448 según safetensors del repo | no disponible | qwen-research | safetensors, diffusers | HuggingFace, 0 descargas, 0 likes en el momento de la consulta |
| Qwen/Qwen-Image-2.1 (modelo base) | ~7B en el componente de generación visual (32 capas DiT) | no disponible | qwen-research (Qwen Research License Agreement) | safetensors, diffusers | HuggingFace, ModelScope, demo en Spaces |
| Otras alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La cuantización no es oficial: la publica el usuario Rin247, no el equipo de Qwen. No hay validación por parte del autor original.
- Inconsistencia en la nomenclatura: el nombre del repositorio indica FP4 mientras que las etiquetas incluyen «8-bit». No se aclara qué precisión real tienen los pesos.
- No se documenta ningún estudio de degradación de calidad respecto a la versión en bfloat16, ni métricas objetivas, ni comparaciones visuales controladas.
- El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de uso en producción ni retroalimentación de la comunidad.
- La model card del repositorio es, en la práctica, la del modelo base Qwen-Image-2.1, con sus enlaces y su estructura. No describe nada específico de esta cuantización.
- Licencia qwen-research (Qwen Research License Agreement), registrada como `license:other`. Los términos concretos de uso comercial no se detallan en la información proporcionada y deben consultarse en el archivo LICENSE del repositorio. El nombre de la licencia sugiere un ámbito de investigación, pero conviene verificarlo antes de un despliegue comercial.
- Idiomas soportados: no disponibles. Todos los ejemplos documentados están en inglés, por lo que el comportamiento con prompts en castellano no está verificado.
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede producir texto ilegible, anatomías incorrectas o detalles incoherentes con el prompt. No se han publicado tasas de error.
- Sin datos sobre sesgos: no hay evaluación de sesgos demográficos, culturales o de representación en la información disponible.
- Sin datos de rendimiento en producción: no hay cifras de latencia, throughput, VRAM mínima ni estabilidad en ejecuciones largas.
- La precisión reducida puede afectar de forma desigual a tareas sensibles al detalle fino, como el renderizado de texto o la preservación de identidad en composiciones multirreferencia, pero esto no está medido.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/Rin247/Qwen-Image-2.1-FP4
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen-Image-2.1
- Modelo base en ModelScope: https://modelscope.cn/models/Qwen/Qwen-Image-2.1
- Blog del modelo base: https://qwen.ai/blog?id=qwen-image-2.1
- Demo en Spaces: https://huggingface.co/spaces/Qwen/Qwen-Image-2.1
- Repositorio GitHub: https://github.com/QwenLM/Qwen-Image-2.1
- Discord: https://discord.gg/CV4E9rpNSD
- Los resultados de búsqueda web proporcionados no contenían enlaces relevantes a este modelo.
