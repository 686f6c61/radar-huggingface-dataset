# nphSi/Z-Image-Lora

## Resumen

Z-Image-Lora es una colección de adaptadores LoRA (Low-Rank Adaptation) para el modelo de difusión texto-a-imagen Z-Image, desarrollado por el usuario nphSi y publicado bajo licencia Apache 2.0. Su función es inyectar en el modelo base la capacidad de generar retratos fotorrealistas de personas concretas (celebridades, actores, personajes) mediante palabras de activación específicas con el prefijo `vrtl`. No se trata de un modelo autónomo, sino de pesos adaptadores que requieren cargarse junto a `Tongyi-MAI/Z-Image` o `Tongyi-MAI/Z-Image-Turbo` para funcionar.

El repositorio tiene un tamaño de 127 GB, lo que refleja que contiene cientos de LoRAs individuales, cada uno entrenado para una identidad concreta. El autor mantiene un índice externo (Lookalike-LoRA-Index) con descargas directas, previsualizaciones e información de cada adaptador. La popularidad del repo (más de 348.000 descargas y 180 likes) indica un uso intensivo en la comunidad de generación de imágenes.

La relevancia actual radica en que Z-Image es un modelo de difusión reciente de Tongyi-MAI (Alibaba) y este repositorio demuestra el ecosistema de fine-tuning que se está construyendo alrededor. La licencia Apache 2.0 permite uso comercial, aunque las implicaciones legales del uso de la imagen de personas reales quedan fuera del alcance de la licencia del software.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre modelo de difusión Z-Image |
| Parámetros totales | no disponible (depende del rango y número de LoRAs individuales) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; la ventana la define el codificador de texto del modelo base) |
| Tipos de cuantización | no disponible (los LoRA se distribuyen en safetensors; el modelo base soporta cuantizaciones como Q8 según los ajustes de previsualización del autor) |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los LoRA son adaptadores de bajo rango que se insertan en las capas del modelo base Z-Image para modificar su comportamiento sin reentrenar todos los pesos. Cada adaptador del repositorio está entrenado para asociar una palabra de activación concreta (por ejemplo, `vrtlalbabaptista`) con la identidad visual de una persona. El autor indica que su método de captioning hace que palabras genéricas como "woman" o "1girl" no funcionen: es obligatorio usar el trigger completo junto al nombre real en el prompt.

No se dispone de información sobre el número de pasos de entrenamiento, el dataset utilizado (número de imágenes por identidad, resolución, técnicas de aumento de datos) ni si se emplearon técnicas como regularización o prior preservation. Los ajustes de previsualización publicados por el autor (Z-Image Turbo Q8, sampler Euler, scheduler beta, 9 pasos, CFG 1, auraflow 6) dan una idea del pipeline de inferencia recomendado, pero no del proceso de entrenamiento.

## Capacidades

- Generación de retratos fotorrealistas de personas concretas mediante texto-a-imagen, usando el trigger `vrtl` seguido del nombre.
- Composición de múltiples triggers en un mismo prompt cuando un LoRA contiene varias identidades (`vrtlMain` combina todos los triggers).
- Control de género en el prompt para nombres ambiguos (el autor recomienda añadirlo explícitamente).
- Capacidad de eliminar el nombre real del prompt cuando el conocimiento interno del modelo base está censurado o es confuso, usando solo el trigger.
- Integración con el ecosistema diffusers y con el modelo base Z-Image y Z-Image-Turbo.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de entrada; es exclusivamente texto-a-imagen.

## Casos de uso

- Generación de retratos para proyectos creativos personales: el usuario puede producir imágenes de una celebridad concreta en escenarios definidos (por ejemplo, "Alba Baptista (vrtlalbabaptista) in a swimming pool") usando el trigger adecuado y los ajustes de inferencia recomendados.
- Creación de avatares y personajes virtuales: al combinar el LoRA con prompts de retrato (primer plano, fondo degradado, contacto visual), se obtienen avatares consistentes para foros, juegos o redes sociales.
- Pruebas de concepto en investigación sobre sesgos y representación: el repositorio permite estudiar cómo un modelo de difusión reproduce la apariencia de personas reales y qué sesgos introduce el captioning del autor.
- Prototipado rápido de contenido visual para guiones gráficos o moodboards: con Z-Image-Turbo y 9 pasos de inferencia se pueden generar variaciones rápidas de una identidad para evaluar direcciones creativas.
- Educación y demostraciones técnicas: sirve para explicar cómo funcionan los LoRA en modelos de difusión, usando el índice del autor como catálogo de ejemplos con triggers y previsualizaciones.
- Integración en pipelines de generación por lotes: al ser safetensors y compatible con diffusers, se puede cargar mediante scripts para generar múltiples imágenes de una misma identidad con parámetros fijos.
- Investigación sobre olvido catastrófico y edición de modelos: permite comparar el comportamiento del modelo base con y sin el adaptador para una misma semilla y prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para los LoRA individuales; depende del modelo base Z-Image. El autor usa Z-Image Turbo en cuantización Q8 para las previsualizaciones, lo que sugiere que el modelo base completo requiere una GPU de gama alta.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del repo (127 GB) y el uso de Q8, se intuye que el modelo base necesita al menos una GPU con 24 GB o más, pero no hay dato confirmado.
- ¿Cabe en consumer GPU?: no disponible. La cuantización Q8 del modelo base Turbo es el ajuste usado por el autor, pero no se especifica el hardware.
- Opciones de despliegue: diffusers (librería declarada), con posibilidad de usar los safetensors en pipelines de Python. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a difusión).
- Latencia y throughput: no disponible; el autor indica 9 pasos de inferencia con Euler/beta y CFG 1, lo que sugiere un modo rápido, pero sin cifras de tiempo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nphSi/Z-Image-Lora | LoRA sobre Z-Image | no disponible | no aplica | Apache 2.0 | Hugging Face |
| Tongyi-MAI/Z-Image | Modelo de difusión base | no disponible | no aplica | no disponible en la información | Hugging Face |
| Tongyi-MAI/Z-Image-Turbo | Modelo de difusión base (variante rápida) | no disponible | no aplica | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. Otros repositorios de LoRA para Z-Image no se han identificado en la búsqueda.

## Limitaciones y advertencias

- Los prompts deben incluir el trigger completo con prefijo `vrtl`; palabras genéricas como "woman" o "1girl" no funcionan según el autor.
- El nombre real debe eliminarse del prompt cuando el conocimiento interno del modelo base está censurado o es confuso (por ejemplo, "Sandy Cheeks" o "Kate Middleton").
- Para nombres ambiguos es necesario añadir el género en el prompt.
- El repositorio contiene adaptadores para personas reales; el uso de su imagen puede infringir derechos de publicidad o privacidad según la jurisdicción, independientemente de la licencia Apache 2.0 del software.
- Riesgo de alucinación visual: el modelo puede generar rasgos que no corresponden a la persona real, especialmente con triggers poco entrenados o prompts fuera de distribución.
- No hay información sobre sesgos demográficos del dataset de entrenamiento ni sobre la representación equilibrada de identidades.
- El tamaño del repo (127 GB) implica una descarga muy pesada y un almacenamiento considerable; no es práctico para entornos con recursos limitados.
- La licencia Apache 2.0 cubre los pesos, pero no otorga derechos sobre la imagen de las personas representadas.
- No se especifican limitaciones de idioma; los ejemplos están en inglés y no hay datos sobre otros idiomas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nphSi/Z-Image-Lora
- Índice de LoRAs con descarga directa, previsualización e información: https://huggingface.co/spaces/nphSi/Lookalike-LoRA-Index
- Discusiones y feedback: https://huggingface.co/nphSi/Z-Image-Lora/discussions
- Modelo base Z-Image: https://huggingface.co/Tongyi-MAI/Z-Image
- Modelo base Z-Image-Turbo: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
