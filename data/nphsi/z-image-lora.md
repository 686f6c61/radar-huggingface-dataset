# nphSi/Z-Image-Lora

## Resumen

Z-Image-Lora es un repositorio de adaptadores LoRA para el modelo de generación de imágenes Tongyi-MAI/Z-Image, publicado por el usuario nphSi en Hugging Face. No se trata de un modelo fundacional, sino de una colección masiva de adaptadores de bajo rango (LoRA) entrenados para inyectar en el modelo base el conocimiento de identidades concretas: principalmente celebridades, actrices, actores y personajes ficticios, cada uno identificado por un token de activación del tipo `vrtlxxxx`. El repositorio acumula más de 348.000 descargas y un tamaño de 126,6 GB, lo que refleja la escala del catálogo de LoRAs incluido.

El modelo resuelve un problema práctico muy específico en el ámbito de la generación de imágenes: conseguir que un modelo de difusión text-to-image genere de forma consistente rostros de personas concretas sin necesidad de reentrenar el modelo completo. Para ello se apoya en Z-Image, el modelo base de Tongyi-MAI (Alibaba), y en su variante Turbo, y se distribuye en formato compatible con la librería `diffusers` mediante pesos `safetensors`. La licencia declarada es Apache 2.0.

La relevancia actual del repositorio es doble. Por un lado, demuestra el patrón de uso de LoRAs como mecanismo de personalización ligera sobre modelos de difusión modernos. Por otro lado, plantea de forma explícita los debates sobre derechos de imagen, consentimiento y uso de la identidad de personas reales en sistemas generativos, ya que el catálogo se centra en retratos de figuras públicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre un modelo de difusión text-to-image (base: Tongyi-MAI/Z-Image y Z-Image-Turbo) |
| Parametros totales | no disponible (depende de cada LoRA individual; el repo completo ocupa 126,6 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a modelos de difusión; el "contexto" es la longitud del prompt de texto) |
| Tipos de cuantizacion | no disponible como listado formal; la model card menciona el uso del modelo base en formato Q8 (ZI Turbo Q8) |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con diffusers) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo de difusión completo, sino un conjunto de adaptadores LoRA que se cargan sobre el modelo base Tongyi-MAI/Z-Image o su variante Turbo. Los LoRA son matrices de bajo rango que se insertan en las capas del modelo base y desplazan sus pesos para especializarlo en un concepto concreto; en este caso, la apariencia facial y corporal de personas identificadas por nombre. El pipeline declarado es `text-to-image` y la integración es mediante la librería `diffusers`.

No se dispone de información sobre el número de tokens o imágenes de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de regularización o de refuerzo. La model card indica únicamente detalles de inferencia: los previews se generaron con ZI Turbo en cuantización Q8, sampler Euler, scheduler beta, 9 pasos, CFG 1 y el modelo de text encoder auraflow con escala 6. También se documenta una convención de prompts muy marcada: es obligatorio incluir el nombre completo junto al token de activación `vrtlxxxx`, y no funcionan prompts genéricos como "woman" o "1girl" debido al método de captioning empleado por el autor.

## Capacidades

- Generación de retratos fotorrealistas de identidades concretas mediante el modelo base Z-Image más el LoRA correspondiente.
- Control fino de la escena mediante prompt de texto: vestimenta, peinado, encuadre, fondo y expresión, como se observa en el prompt de ejemplo de la model card.
- Soporte de tokens de activación múltiples: algunos LoRA combinan varios triggers (`vrtlxx`, `vrtlyy`) y el token `vrtlMain` agrega todos ellos.
- Compatibilidad con `diffusers` y con el ecosistema de pesos `safetensors`.
- Funcionamiento tanto sobre Z-Image como sobre Z-Image-Turbo, lo que permite elegir entre calidad y velocidad de muestreo.
- No incluye capacidades de texto, razonamiento, código, tool calling ni agentes; es exclusivamente un componente de generación de imagen.

## Casos de uso

- Producción de retratos de personajes para prototipos creativos: un estudio puede generar variaciones de vestuario y encuadre de una identidad concreta usando el token `vrtl` correspondiente, sin reentrenar el modelo base.
- Previsualización de casting y moodboards: equipos de dirección de arte pueden explorar cómo encajaría una figura pública en una escena antes de contratar producción real, siempre que cuenten con los derechos de imagen necesarios.
- Ilustración de contenido editorial ficticio: creación de personajes inspirados en arquetipos con apariencia consistente entre viñetas o entregas.
- Investigación sobre personalización de modelos de difusión: el repositorio sirve como corpus de estudio de cómo los LoRA codifican identidades y cómo responden a distintos prompts y samplers.
- Pruebas de pipelines de inferencia: útil para validar configuraciones de `diffusers`, cuantización Q8, samplers Euler/beta y pasos reducidos (9 pasos, CFG 1) en entornos de producción.
- Generación de avatares y material promocional para proyectos de ficción, con la advertencia legal de no emplear identidades reales sin consentimiento.
- Docencia y demostraciones sobre el funcionamiento de LoRA en modelos de difusión, comparando el resultado con y sin el adaptador cargado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas como FID, CLIP score ni comparaciones numéricas con otros adaptadores. Solo se documentan parámetros de inferencia cualitativos (sampler, pasos, CFG) empleados para generar las imágenes de preview.

## Requisitos de hardware

- El repositorio completo ocupa 126,6 GB, pero cada LoRA individual es mucho más pequeño; el requisito real depende del modelo base Z-Image, no del adaptador.
- Para inferencia con el modelo base en precisión completa se requiere una GPU de gran VRAM; no se dispone de cifras oficiales en la información proporcionada.
- La model card menciona el uso de ZI Turbo en cuantización Q8, lo que reduce los requisitos y permite ejecución en GPUs de consumo alto (gama RTX xx90 o similar), aunque no se confirman cifras exactas.
- Despliegue recomendado mediante `diffusers` con pesos `safetensors`; no se documentan integraciones específicas con vLLM, llama.cpp ni Ollama, que no aplican a modelos de difusión.
- No se dispone de datos de latencia ni throughput medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nphSi/Z-Image-Lora | LoRA sobre Z-Image | no disponible | no aplica | Apache 2.0 | Hugging Face |
| Tongyi-MAI/Z-Image | Modelo base text-to-image | no disponible | no aplica | no disponible en la informacion | Hugging Face |
| Tongyi-MAI/Z-Image-Turbo | Variante rápida del base | no disponible | no aplica | no disponible en la informacion | Hugging Face |
| Otros LoRA de identidad sobre modelos de difusión | Adaptadores LoRA | no disponible | no aplica | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El repositorio se centra en identidades de personas reales, en su mayoría figuras públicas; su uso comercial o público puede vulnerar derechos de imagen y de publicidad en muchas jurisdicciones, incluso con licencia Apache 2.0 sobre el código y los pesos.
- La licencia Apache 2.0 del adaptador no exime del cumplimiento de la licencia del modelo base ni de las obligaciones legales sobre el uso de la imagen de personas.
- Riesgo elevado de generar deepfakes o contenido no consentido; se recomienda establecer controles de uso y no desplegar en producción sin revisión legal.
- El método de captioning del autor exige el uso estricto del token `vrtlxxxx` y del nombre completo; prompts genéricos no funcionan, lo que limita la interoperabilidad con otros flujos.
- La model card advierte de que el conocimiento interno del modelo sobre ciertos nombres puede ser deficiente o estar censurado, y recomienda eliminar el nombre real en esos casos.
- No se documentan sesgos demográficos del catálogo, aunque la lista de identidades muestra un desequilibrio evidente hacia actrices y figuras femeninas de habla inglesa.
- No hay información sobre el dataset de entrenamiento ni sobre posibles filtraciones de datos personales en los pesos.
- El tamaño del repositorio (126,6 GB) dificulta su descarga y almacenamiento completos; conviene descargar solo los LoRA necesarios.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nphSi/Z-Image-Lora
- Índice de LoRA con descarga, preview e información: https://huggingface.co/spaces/nphSi/Lookalike-LoRA-Index
- Discusiones y soporte de la comunidad: https://huggingface.co/nphSi/Z-Image-Lora/discussions
- Modelo base Tongyi-MAI/Z-Image: https://huggingface.co/Tongyi-MAI/Z-Image
- Modelo base Tongyi-MAI/Z-Image-Turbo: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
