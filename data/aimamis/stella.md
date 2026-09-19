# AiMamis/Stella

## Resumen

Stella es un adaptador LoRA de texto a imagen publicado por el usuario AiMamis en HuggingFace bajo licencia openrail++. No es un modelo completo, sino un ajuste de bajo rango (Low-Rank Adaptation) que se aplica sobre el modelo base krea/Krea-2-Turbo para reproducir un personaje concreto: una figura femenina definida por los descriptores "Stella", "Black hair with blunt bangs", "Blue eyes" y "Pale skin". El repositorio ocupa 0,5 GB y se distribuye en formato compatible con la librería diffusers.

El modelo resuelve un problema clásico de los flujos de generación de imágenes: mantener la consistencia de identidad de un personaje a lo largo de múltiples generaciones. Al ser un LoRA, el coste de almacenamiento y de cómputo es muy inferior al de un ajuste completo, y puede combinarse con otros adaptadores sobre el mismo modelo base. Es relevante para ilustradores, estudios de videojuegos y creadores de contenido que necesitan un personaje repetible sin reentrenar un modelo entero.

La información pública disponible es muy limitada: la ficha no declara número de parámetros, tamaño del dataset de entrenamiento, hiperparámetros, número de pasos, ni resultados de evaluación. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y las etiquetas de idioma no están declaradas. Todo lo que sigue se basa exclusivamente en los metadatos de HuggingFace y en el contenido de la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo de difusión de texto a imagen (modelo base: krea/Krea-2-Turbo); la arquitectura interna del base no se detalla en la información disponible |
| Parámetros totales | no disponible (no se declara el rango ni el número de parámetros del adaptador) |
| Parámetros activos | no aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | no aplica: es un modelo de difusión texto a imagen, no un modelo de lenguaje; no se documenta límite de tokens de prompt |
| Tipos de cuantización | no disponible para el adaptador; al ser un LoRA, la cuantización efectiva depende del modelo base sobre el que se cargue (fp16, bf16, fp8, GGUF, etc.) |
| Idiomas soportados | no disponibles: la model card no declara idiomas y los prompts de ejemplo están en inglés |
| Licencia | openrail++ |
| Formato de pesos | Adaptador LoRA para la librería diffusers (repositorio de 0,5 GB); no se documentan otros formatos como GGUF o safetensors sueltos |
| Modelo base | krea/Krea-2-Turbo |
| Pipeline | text-to-image |
| Etiquetas (tags) | diffusers, text-to-image, lora, template:diffusion-lora, base_model:krea/Krea-2-Turbo, license:openrail++, region:us |
| Fecha de creación | 19 de septiembre de 2026 (según metadatos de HuggingFace) |
| Fecha de actualización | 19 de septiembre de 2026 (según metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA: en lugar de reentrenar todos los pesos del modelo base krea/Krea-2-Turbo, se insertan matrices de bajo rango en determinadas capas y solo esas matrices se optimizan. Esto explica dos cosas: el reducido tamaño del repositorio (0,5 GB) y la necesidad de cargar siempre el modelo base para poder generar imágenes. La model card no especifica sobre qué capas se aplicó el adaptador, ni el rango (rank) utilizado, ni el valor de alpha, ni si se entrenó sobre el bloque de texto, el transformer de difusión o ambos.

Tampoco se documenta el proceso de entrenamiento: no hay información sobre el número de imágenes del dataset, la resolución de entrenamiento, el número de pasos, la tasa de aprendizaje, el optimizador, el uso de regularización o de técnicas como DreamBooth. No se menciona ningún tipo de ajuste por preferencias humanas (RLHF, DPO) ni evaluación automática. La única información funcional que aporta el autor son las palabras de activación (trigger words) necesarias para invocar al personaje, lo que es característico de los LoRA de personaje o de estilo entrenados con captions de identidad fija.

## Capacidades

- Generación de imágenes de texto a imagen a través del modelo base krea/Krea-2-Turbo, condicionada por el adaptador LoRA.
- Reproducción de un personaje concreto mediante las palabras de activación declaradas: `Stella`, `Black hair with blunt bangs`, `Blue eyes`, `Pale skin`.
- Consistencia de identidad entre generaciones: es la función principal de un LoRA de personaje, aunque no se aportan pruebas cuantitativas de estabilidad.
- Combinación potencial con otros LoRA sobre el mismo modelo base (comportamiento estándar de la librería diffusers, no confirmado por el autor para este adaptador).
- Control mediante prompt negativo, pasos de inferencia y escala de guía (guidance scale) según los parámetros del pipeline del modelo base.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales de entrada.
- No se documentan capacidades multilingües: los prompts de ejemplo están en inglés y no hay etiquetas de idioma.
- No se documenta modo "thinking", visión, audio ni ninguna capacidad más allá de la generación de imágenes.
- No se documenta inpainting, outpainting, img2img ni control por pose o profundidad de forma específica para este adaptador.

## Casos de uso

- Diseño de personajes para cómics e ilustración seriada: el adaptador permite generar al mismo personaje en viñetas distintas manteniendo los rasgos definidos por las palabras de activación, lo que reduce el trabajo manual de retoque entre páginas.
- Previsualización de personajes en preproducción audiovisual: utilizable para generar bocetos de vestuario, iluminación y encuadre de forma rápida antes de producir arte final, aprovechando el tamaño reducido del adaptador (0,5 GB) para iterar en local.
- Creación de avatares consistentes para redes sociales o canales de contenido: un mismo personaje reconocible a lo largo de publicaciones, sin depender de un servicio en la nube.
- Assets de personajes secundarios en videojuegos indie: retratos de NPC o ilustraciones de diálogo generados en lote con identidad estable, siempre que se revise manualmente el resultado antes de integrarlo.
- Prototipado de mascotas de marca o embajadores visuales: generación de variaciones de un mismo personaje en distintos contextos (producto, entorno, vestuario) para presentar propuestas a un cliente.
- Creación de datasets de personaje: las imágenes generadas pueden servir como material de partida para entrenar adaptadores adicionales o para ampliar un dataset propio, aunque conviene auditar sesgos y artefactos.
- Pruebas de concepto en investigación sobre personalización de modelos de difusión: al ser un LoRA ligero sobre un modelo base concreto, sirve como caso de estudio para comparar estrategias de adaptación de bajo rango.
- Storyboarding rápido de narrativa visual: generación de secuencias con un personaje coherente para validar una idea antes de invertir en producción, teniendo en cuenta que no hay datos publicados sobre consistencia real entre semillas y prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, ImageReward, preferencia humana ni evaluaciones de consistencia de identidad) ni comparaciones con otros adaptadores. Tampoco se documentan latencia ni throughput.

## Requisitos de hardware

- El adaptador por sí solo ocupa 0,5 GB en disco, pero no puede ejecutarse sin cargar el modelo base krea/Krea-2-Turbo; los requisitos de VRAM vienen determinados por ese modelo base, cuyo tamaño de parámetros no se declara en la información disponible.
- VRAM estimada: no disponible de forma confirmada. Como referencia orientativa y no verificada, los LoRA sobre modelos de difusión de gran tamaño (del orden de 8-12 mil millones de parámetros) suelen requerir entre 16 y 24 GB en fp16/bf16, y pueden bajar a rangos de 8-12 GB con cuantización de 4-8 bits o GGUF, siempre que el modelo base lo permita.
- GPU recomendadas: no disponibles para este modelo concreto. En función del tamaño real del base, serían habituales GPU de centro de datos (A100, H100, L40S) para bf16 sin cuantizar, y GPU de consumo (RTX 4090, 4080, 3090) con cuantización o técnicas de offloading.
- Compatibilidad con GPU de consumo: probable si el modelo base admite cuantización y el framework usado lo soporta, pero no está confirmado por el autor.
- Opciones de despliegue: la librería declarada es diffusers, por lo que el uso esperado es mediante `StableDiffusionPipeline`/`DiffusionPipeline` con `load_lora_weights`. También podría emplearse con interfaces que soporten LoRA sobre el modelo base (por ejemplo ComfyUI o AUTOMATIC1111/Forge), pero esto no se documenta en la ficha.
- No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que corresponden a modelos de lenguaje y no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificables sobre otros adaptadores comparables (mismo personaje, mismo modelo base o misma categoría) en la información proporcionada. La siguiente tabla compara el enfoque técnico de este tipo de adaptador con las alternativas habituales de personalización, sin atribuir cifras concretas a este modelo.

| Enfoque | Parámetros entrenables | Tamaño típico | Licencia | Disponibilidad |
|---|---|---|---|---|
| LoRA de personaje (este modelo) | no disponible | 0,5 GB (repositorio declarado) | openrail++ | Adaptador para diffusers sobre krea/Krea-2-Turbo |
| Ajuste completo del modelo base | Todos los pesos | Decenas de GB | Depende del modelo base | No es el caso de este repositorio |
| DreamBooth sobre modelo de difusión | Subconjunto o todos los pesos, según variante | Mayor que un LoRA | Depende del modelo base | No comparado en la información disponible |
| Textual inversion | Solo el embedding de un token | Unos pocos KB | Depende del modelo base | No comparado en la información disponible |
| LoRA sobre otros modelos base (por ejemplo, familia SDXL o FLUX) | no disponible | Variable | Variable | No se han identificado alternativas verificables en la búsqueda realizada |

## Limitaciones y advertencias

- Información documental mínima: la model card no especifica dataset, hiperparámetros, rango del LoRA ni proceso de entrenamiento, lo que dificulta evaluar su comportamiento y reproducibilidad.
- Sin métricas de evaluación: no hay benchmarks ni estudios de consistencia de identidad, por lo que el rendimiento real es desconocido.
- Riesgo de sobreajuste: los LoRA de personaje entrenados con pocas imágenes tienden a reproducir fondos, poses o iluminación del dataset original; no se puede confirmar ni descartar en este caso.
- Riesgo de alucinación visual y artefactos: como cualquier modelo de difusión, puede generar anatomías incorrectas, manos deformes o incoherencias con el prompt, especialmente en composiciones complejas.
- Sesgos: no se documenta la composición del dataset, por lo que no se puede evaluar el sesgo demográfico, estético o cultural del personaje generado.
- Alcance limitado: el adaptador solo está pensado para un personaje concreto; no es un modelo generalista y su comportamiento fuera de las palabras de activación no está descrito.
- Dependencia del modelo base: requiere cargar krea/Krea-2-Turbo, cuyos términos de licencia y requisitos de hardware se aplican además de los del adaptador.
- Licencia openrail++: permite uso comercial con condiciones, pero incluye cláusulas de uso restrictivo y obligaciones de atribución; conviene revisar el texto completo antes de integrarlo en un producto.
- Idiomas no declarados: no hay garantía de que los prompts en castellano funcionen igual de bien que los prompts en inglés que aparecen en los ejemplos.
- Madurez del repositorio: 0 descargas y 0 "likes", sin historial de uso ni issues que permitan juzgar su fiabilidad en producción.
- Resultados de la búsqueda web no utilizables: las consultas realizadas devolvieron páginas sin relación con el modelo (contenido sobre Microsoft Office 365), por lo que no aportan información técnica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AiMamis/Stella
- Archivos y versiones: https://huggingface.co/AiMamis/Stella/tree/main
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Los resultados de la búsqueda web realizada no contienen enlaces relevantes sobre este modelo, su entrenamiento o su evaluación.
