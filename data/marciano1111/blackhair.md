# marciano1111/blackhair

## Resumen

`marciano1111/blackhair` es un adaptador LoRA de tipo DreamBooth para generación de imágenes a partir de texto (text-to-image), publicado en HuggingFace por el usuario marciano1111. No se trata de un modelo completo, sino de un ajuste ligero que se carga sobre el modelo base Krea 2: según la model card, se entrenó sobre Krea 2 RAW y se muestra funcionando sobre Krea 2 Turbo, la variante destilada para pocos pasos de inferencia. El repositorio ocupa 0,8 GB y se distribuye bajo licencia Apache 2.0.

El adaptador introduce un concepto concreto que se invoca mediante el token disparador `vkr woman`. Los tres ejemplos publicados por el autor (armadura neón en un rascacielos cyberpunk, retrato en un campo de lavanda, estratega medieval en una sala de guerra) corresponden al mismo token, lo que sugiere que el LoRA codifica una identidad o un estilo de personaje femenino y no una estética genérica. La model card no describe el dataset de entrenamiento, el número de pasos, el rango del adaptador ni la composición de las imágenes usadas.

La relevancia de esta ficha es limitada y hay que ser explícito al respecto: el modelo acumula 0 descargas y 0 "likes", no incluye documentación técnica más allá de un ejemplo de uso con `diffusers`, y su nombre de repositorio (`blackhair`) no coincide con el token disparador (`vkr woman`), lo que apunta a un experimento personal sin validación por parte de la comunidad. Además, la búsqueda web realizada no devolvió ninguna documentación técnica sobre Krea 2 ni sobre este adaptador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo de difusión text-to-image; la arquitectura del modelo base (krea/Krea-2-Raw) no está disponible en la información proporcionada |
| Parametros totales | No disponible (adaptador LoRA; el repositorio ocupa 0,8 GB) |
| Longitud de contexto | No aplica (modelo de generación de imágenes); el condicionamiento textual depende del codificador de texto de Krea 2, no disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible; los prompts de ejemplo están en inglés y el codificador de texto del modelo base puede aceptar otros idiomas |
| Licencia | Apache 2.0 (según los tags del repositorio) |
| Formato de pesos | No disponible en la información proporcionada; el ecosistema `diffusers` distribuye habitualmente los adaptadores LoRA en safetensors |

Datos adicionales del repositorio: pipeline `text-to-image`, librería `diffusers`, modelo base `krea/Krea-2-Raw`, idioma declarado "no disponible", 0 descargas, 0 likes, creado el 17 de octubre de 2026 y actualizado el mismo día.

## Arquitectura y entrenamiento

El objeto publicado es un adaptador LoRA (Low-Rank Adaptation) de tipo DreamBooth, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para especializarlo en un concepto concreto. La model card indica que el entrenamiento se realizó sobre Krea 2 RAW y que las muestras se generaron con Krea 2 Turbo en 8 pasos, lo que implica que el adaptador se entrena sobre la variante no destilada y luego se aplica a la destilada. No se especifica la arquitectura interna de Krea 2 (transformer de difusión, U-Net u otra), ni el número de parámetros, ni la dimensión del espacio latente.

Tampoco hay información sobre el dataset: número de imágenes, resolución, técnica de regularización, uso de captions automáticos, número de pasos de entrenamiento, tasa de aprendizaje, rango (`rank`) o alpha del LoRA, ni si se aplicó algún tipo de fine-tuning adicional (textual inversion, DPO sobre preferencias, etc.). El único dato reproducible es el token disparador `vkr woman` y una configuración de inferencia de ejemplo con `num_inference_steps=8` y `guidance_scale=0.0`, coherente con un modelo Turbo destilado.

## Capacidades

- Generación de imágenes fotorrealistas o ilustrativas a partir de prompts en lenguaje natural, heredando las capacidades del modelo base Krea 2.
- Especialización en un concepto concreto invocado mediante el token `vkr woman`, orientado a retratos y figuras femeninas en escenas variadas (cyberpunk, naturalista, medieval).
- Composición de escenas complejas con indicaciones de plano, iluminación y entorno, tal como muestran los tres prompts de ejemplo ("cinematic wide shot", "soft-focus portrait", "moody, high-contrast image").
- Ejecución en modo pocos pasos sobre Krea 2 Turbo (8 pasos), lo que permite generación rápida si el modelo base está disponible.
- Integración con el ecosistema `diffusers` mediante `Krea2Pipeline` y `load_lora_weights()`, lo que facilita combinarlo con otros adaptadores o con técnicas de control adicionales.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades de audio o vídeo; son capacidades fuera del alcance de un modelo text-to-image.

## Casos de uso

- Ilustración de personajes para narrativa serializada: el token `vkr woman` permite mantener una identidad visual coherente a lo largo de múltiples ilustraciones de un cómic, novela ligera o guion, cambiando solo el entorno y la iluminación en cada prompt.
- Previsualización de arte conceptual en producción audiovisual: directores de arte pueden generar variaciones rápidas de un personaje en distintos vestuarios y épocas (los ejemplos cubren cyberpunk, campo y medieval) sin encargar bocetos previos.
- Creación de avatares y retratos para proyectos personales: el LoRA está pensado para retratos, por lo que encaja en la generación de imágenes de perfil o material promocional de un personaje ficticio.
- Prototipado de campañas de moda o vestuario: los prompts de ejemplo describen prendas concretas (armadura de neón, vestido de lino), lo que permite iterar sobre combinaciones de ropa y escenario con un coste de inferencia bajo al usar Turbo a 8 pasos.
- Pruebas de investigación sobre adaptación de bajo rango: sirve como caso de estudio reproducible de un pipeline DreamBooth + LoRA sobre un modelo base nuevo, útil para comparar metodologías de ajuste.
- Fondo de galería o demos de interfaz: al ser un adaptador pequeño (0,8 GB) y cargarse sobre un pipeline estándar de `diffusers`, se puede desplegar en una demo tipo Gradio para mostrar generación condicionada por token.
- Nota: no se recomienda su uso en producción sin antes verificar la licencia y las condiciones de uso del modelo base Krea 2, que son independientes de la licencia Apache 2.0 declarada para el adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye FID, CLIP score, comparativas con otros LoRAs ni evaluaciones humanas.

El único dato cuantitativo reproducible es la configuración de inferencia empleada para generar las muestras:

| Parametro de inferencia | Valor declarado |
|---|---|
| Modelo base para las muestras | Krea 2 Turbo |
| Modelo base para el entrenamiento | Krea 2 RAW |
| Pasos de inferencia | 8 |
| Guidance scale | 0.0 |
| Resolución de salida | No disponible |
| Semilla | No disponible |
| Tiempo de generación | No disponible |

## Requisitos de hardware

- No se dispone de datos oficiales sobre los requisitos de VRAM de Krea 2, por lo que no es posible dar cifras verificadas para este adaptador.
- El propio LoRA añade un coste de memoria mínimo en comparación con el modelo base: el repositorio completo ocupa 0,8 GB, aunque el fichero de pesos efectivo puede ser menor.
- Los requisitos reales vienen determinados por Krea 2 Turbo o Krea 2 RAW; sin la ficha técnica de estos modelos no se puede confirmar si caben en GPU de consumo (RTX 3060, 4070, 4090) ni con qué cuantización.
- Opciones de despliegue compatibles: `diffusers` con `Krea2Pipeline` (el método documentado por el autor), y potencialmente servidores que soporten LoRA sobre el modelo base si Krea 2 está integrado en ellos. No hay confirmación de soporte en vLLM, llama.cpp, Ollama ni TGI, que además están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. El uso de la variante Turbo con 8 pasos sugiere un tiempo de generación bajo en comparación con pipelines de 20-50 pasos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

La categoría es "adaptador LoRA de concepto para modelos de difusión text-to-image". No hay datos públicos de Krea 2 que permitan comparar parámetros o contexto, y la información disponible sobre este adaptador es mínima.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| marciano1111/blackhair | LoRA DreamBooth sobre Krea 2 | No disponible (repo de 0,8 GB) | No aplica | Apache 2.0 (adaptador) | HuggingFace, 0 descargas |
| LoRA típico para Stable Diffusion XL | LoRA de concepto o estilo | Órdenes de magnitud de decenas a cientos de MB en fp16 | Condicionamiento textual de SDXL (75 tokens por bloque) | Variable, habitualmente CreativeML Open RAIL++-M | Amplia en HuggingFace y Civitai |
| LoRA típico para Flux.1 dev | LoRA de concepto o estilo | Similar al caso anterior | Condicionamiento con T5-XXL, hasta 512 tokens | FLUX.1 [dev] Non-Commercial License (restringe uso comercial) | Amplia en HuggingFace |

No se dispone de datos de rendimiento comparado (FID, CLIP, preferencia humana) para ninguno de los tres casos en la información proporcionada, por lo que la comparación se limita a tipo de artefacto, licencia y disponibilidad.

## Limitaciones y advertencias

- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de que el adaptador funcione fuera de las tres muestras publicadas.
- Documentación insuficiente: no se indica el dataset, el rango del LoRA, la resolución de entrenamiento ni los hiperparámetros, lo que dificulta reproducir o auditar el resultado.
- Incoherencia de nomenclatura: el repositorio se llama `blackhair` pero el token disparador es `vkr woman`; sin la model card es imposible adivinar qué concepto codifica realmente el adaptador.
- Riesgo de sobreajuste: al ser un DreamBooth entrenado sobre un concepto único, puede degradar la diversidad de las imágenes y "contaminar" otras generaciones si se aplica con pesos altos o se combina con otros LoRAs.
- Riesgo de alucinación visual y artefactos: como todo modelo de difusión, puede producir anatomías incorrectas, textos ilegibles y elementos incoherentes, especialmente con prompts alejados de la distribución de entrenamiento.
- Idiomas: no hay información sobre el soporte multilingüe de los prompts; los ejemplos están en inglés y el comportamiento con prompts en castellano no está verificado.
- Licencia: el adaptador declara Apache 2.0, pero la licencia del modelo base Krea 2 RAW y Krea 2 Turbo es independiente y debe verificarse antes de cualquier uso comercial. Apache 2.0 sobre el adaptador no implica permiso sobre el modelo base.
- Implicaciones éticas: el token sugiere la reproducción de la apariencia de una persona concreta (posiblemente una persona real identificada como "vkr"). Generar imágenes de una persona sin su consentimiento puede vulnerar derechos de imagen y normativas de protección de datos; conviene extremar la cautela.
- Contenido de la búsqueda web: la consulta devolvió exclusivamente resultados de sitios para adultos sin relación con el modelo, por lo que no se han podido incorporar fuentes técnicas externas.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/marciano1111/blackhair
- Modelo base declarado: https://huggingface.co/krea/Krea-2-Raw
- Organización Krea en HuggingFace (variante Turbo mencionada en la model card): https://huggingface.co/krea
- La búsqueda web no devolvió papers, blogs, repositorios ni demos relevantes sobre este adaptador ni sobre Krea 2. Los únicos resultados obtenidos pertenecían a sitios de contenido para adultos y se han descartado por no ser pertinentes.
