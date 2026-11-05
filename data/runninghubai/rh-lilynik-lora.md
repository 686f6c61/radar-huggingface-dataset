# RunningHubAI/rh-lilynik-lora

## Resumen

rh-lilynik-lora es un adaptador LoRA de edición de imágenes publicado por RunningHubAI, una plataforma comercial de generación y entrenamiento de modelos visuales. El adaptador se ha afinado a partir del modelo base krea2 y se distribuye como un único archivo de pesos de 448 MiB (`LilyNIK.safetensors`), pensado para cargarse en ComfyUI, en la propia plataforma RunningHub o en Hugging Face. No se trata de un modelo de lenguaje, sino de un módulo de personalización visual orientado a la tarea image-text-to-image.

El propósito del LoRA es introducir un concepto o estilo concreto, activado mediante la palabra de disparo `LilyNIK`, sobre el modelo base krea2. Al ser un adaptador y no un modelo completo, su relevancia depende por completo del modelo subyacente: no aporta capacidades de razonamiento, código ni texto, y su evaluación debe hacerse en términos de fidelidad visual y consistencia del concepto inyectado.

La información pública disponible es muy limitada. La model card no incluye datos de entrenamiento, composición del dataset, hiperparámetros, benchmarks ni licencia explícita, y el repositorio registra cero descargas y cero likes en el momento de la consulta. Esta ficha documenta, por tanto, únicamente lo que puede verificarse en la información proporcionada, marcando como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base krea2; arquitectura del modelo base no disponible |
| Parámetros totales | no disponible (pesos del adaptador: 448 MiB en safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las palabras de disparo son en alfabeto latino: `LilyNIK`) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (`LilyNIK.safetensors`) |
| Tarea | image-text-to-image (edición de imagen) |
| Palabra de disparo | `LilyNIK` |
| Modelo base | krea2 |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Tamaño del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base krea2 para modificar su comportamiento generativo sin reentrenar los pesos completos. El archivo distribuido ocupa 448 MiB, un tamaño coherente con un adaptador de rango moderado sobre un modelo de difusión o de edición de imagen, aunque el autor no especifica el rango, las capas objetivo ni el número exacto de tensores incluidos.

No se ha publicado información sobre el proceso de entrenamiento: ni el volumen de datos, ni la composición del dataset, ni si se emplearon técnicas de regularización, captions sintéticos o ajuste por preferencias. Tampoco se documentan innovaciones técnicas asociadas al adaptador. La única referencia al origen es la indicación "Finetuned from: krea2", sin enlace al modelo base ni a su ficha técnica.

## Capacidades

- Edición de imágenes guiada por texto: el adaptador modifica la generación del modelo base krea2 para incorporar el concepto activado por la palabra `LilyNIK`.
- Inyección de un concepto o identidad visual concreto mediante una palabra de disparo, el mecanismo habitual en LoRA de personalización.
- Integración en flujos de ComfyUI como nodo de carga de LoRA junto al modelo base correspondiente.
- Ejecución en la plataforma RunningHub, tanto en su interfaz como a través de su API.
- Compatibilidad declarada con Hugging Face como repositorio de distribución de pesos.
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso, texto, código, matemáticas, visión analítica, audio ni modo de pensamiento: es exclusivamente un adaptador de imagen.

## Casos de uso

- Personalización de un personaje recurrente: cargando `LilyNIK.safetensors` sobre krea2 en ComfyUI y usando la palabra `LilyNIK` en el prompt, se puede mantener una identidad visual consistente a lo largo de una serie de imágenes, útil para storyboards o cómics.
- Producción de material promocional de marca: si el concepto `LilyNIK` corresponde a una mascota o estilo corporativo, el LoRA permite generar variaciones de ese motivo en distintos encuadres e iluminaciones sin reentrenar el modelo base.
- Iteración rápida en flujos de diseño: al ser un adaptador ligero de 448 MiB, se puede intercambiar junto a otros LoRA en un mismo grafo de ComfyUI para comparar estilos sin recargar el modelo base completo.
- Automatización vía API de RunningHub: el adaptador puede invocarse desde la API de la plataforma para integrar la generación de imágenes personalizadas en un pipeline de publicación de contenidos.
- Pruebas de concepto en investigación visual: sirve como ejemplo práctico de LoRA de bajo coste para experimentar con inyección de conceptos sobre un modelo de edición de imagen.
- Generación de variaciones para catálogos o assets de videojuegos: combinado con prompts descriptivos, permite producir múltiples versiones de un mismo motivo manteniendo la coherencia aportada por el adaptador.
- Docencia y demostraciones de ComfyUI: por su tamaño reducido y su dependencia de un único archivo, es adecuado para talleres introductorios sobre uso de LoRA en flujos de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; el consumo vendrá determinado por el modelo base krea2, cuyos requisitos no se documentan en la información proporcionada.
- GPU recomendadas: no disponible. Al tratarse de un LoRA sobre un modelo de imagen, la GPU necesaria será la que exija krea2, no el adaptador.
- Compatibilidad con GPU de consumo: no confirmada; depende enteramente del modelo base y de la cuantización aplicada a este.
- Opciones de despliegue: ComfyUI (soporte nativo declarado), plataforma RunningHub (interfaz y API) y carga desde Hugging Face. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje y no aplicables a este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros adaptadores LoRA comparables ni datos de rendimiento que permitan establecer una comparación objetiva con alternativas de la misma categoría.

## Limitaciones y advertencias

- Información técnica mínima: la model card no documenta dataset, hiperparámetros, rango del LoRA ni capas objetivo, lo que dificulta evaluar su calidad o reproducibilidad.
- Licencia no especificada: la ficha remite a "la licencia del proyecto original o del upstream" sin concretarla, por lo que el uso comercial queda en una zona de incertidumbre legal y requiere verificar los términos de krea2 y de RunningHub antes de desplegarlo en producción.
- Dependencia total del modelo base: el adaptador no funciona de forma autónoma y su comportamiento, calidad y requisitos de hardware son los de krea2.
- Riesgo de sobreajuste al concepto: al ser un LoRA de personalización, puede forzar el motivo `LilyNIK` incluso cuando el prompt no lo solicita, o degradar la diversidad de las imágenes generadas.
- Sesgos: no documentados por el autor; al no publicarse la composición del dataset de entrenamiento, no es posible evaluar sesgos de representación.
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede producir detalles inconsistentes o anatomías incorrectas, especialmente en composiciones complejas.
- Idiomas: no se especifican; la palabra de disparo está en alfabeto latino, pero se desconoce el soporte multilingüe de los prompts.
- Adopción nula verificable: cero descargas y cero likes en el repositorio, sin evidencia pública de validación por parte de la comunidad.
- Fechas del repositorio: la fecha de creación indicada (2026-11-05) es posterior a la fecha habitual de consulta, lo que conviene tener en cuenta al evaluar la vigencia del artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-lilynik-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2112261639962038273
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2056405614162440193
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
