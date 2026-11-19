# RunningHubAI/rh-krea2cos-lora

## Resumen

`rh-krea2cos-lora` es un adaptador LoRA de edición de imagen (pipeline `image-text-to-image`) publicado por RunningHubAI en nombre del autor `@和春天有个约会`. No es un modelo base: es un conjunto de pesos de 218 MiB en formato `safetensors` que se aplica sobre el modelo `krea2` (indicado como origen del fine-tuning) para especializarlo en la generación y edición de un personaje concreto, descrito en la model card con atributos como pelo azul claro, aureola dorada, alas blancas con plumas, vestido blanco y morado con motivos estelares y un bastón ornamentado.

El repositorio es un artefacto de despliegue orientado a ComfyUI y a la propia plataforma RunningHub, no una release de investigación: no incluye información sobre dataset de entrenamiento, hiperparámetros, número de pasos ni evaluación cuantitativa. La licencia no está declarada de forma explícita y los idiomas soportados no se especifican, aunque la documentación está en inglés y chino.

Su relevancia es práctica y acotada: permite reproducir un personaje concreto dentro de flujos de trabajo de ComfyUI o vía API de RunningHub sin reentrenar. Para cualquier evaluación técnica seria (calidad, sesgos, rendimiento) la información publicada es insuficiente y habría que remitirse al modelo base `krea2` y a los resultados empíricos del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base `krea2`; arquitectura del base no disponible |
| Parametros totales | no disponible (pesos LoRA de 218 MiB; el número de parámetros del adaptador no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en `safetensors`, presumiblemente fp16/bf16; no se declara) |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés y chino) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | `safetensors` (archivo `知更鸟.safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar todos los pesos. El modelo base declarado es `krea2`, del que no se proporcionan detalles de arquitectura (tipo de transformer, variante de difusión, tamaño, resolución nativa ni contexto textual). El pipeline declarado es `image-text-to-image`, lo que implica que el adaptador opera en un flujo de generación condicionada por texto y, según la model card, también de edición de imagen.

No se publica ningún dato sobre el proceso de entrenamiento: ni número de imágenes, ni composición del dataset, ni número de pasos, ni learning rate, ni si hubo regularización o validación. Tampoco se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, destilación de pasos, etc.). La única información operativa es el prompt de activación del personaje, que combina un token identificador (`ZGN_cos`, `1girl`) con una descripción detallada de atributos visuales en inglés y una referencia al objeto característico (bastón ornamentado).

## Capacidades

- Generación de imágenes condicionada por texto dentro del pipeline `image-text-to-image`.
- Edición de imagen: la model card clasifica el artefacto como "LoRA (image edit)".
- Reproducción consistente de un personaje concreto (pelo azul claro, aureola, alas, vestido con motivos estelares, bastón) a partir de un prompt de activación definido.
- Integración en flujos de ComfyUI mediante el nodo de carga de LoRA.
- Ejecución en la plataforma RunningHub, tanto en la interfaz web como a través de su API.
- Soporte de tool calling / function calling: no aplica (modelo generativo de imagen, no de texto).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; los prompts de ejemplo usan inglés y chino.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Producción de ilustraciones de personaje consistentes: cargando el LoRA en ComfyUI con el prompt de activación documentado se obtiene el personaje con sus atributos fijos (aureola, alas, vestido), útil para series de ilustraciones o fan art con identidad visual estable.
- Edición de imágenes existentes: al ser un LoRA de edición, permite reestilizar o modificar una imagen de entrada manteniendo la identidad del personaje, por ejemplo para cambiar el fondo o la pose conservando el diseño.
- Creación de material promocional o de comunidad: el personaje y su descripción (vestido, accesorios, bastón) encajan en campañas de divulgación o contenido para redes de comunidades de anime y videojuegos.
- Prototipado rápido de variantes de diseño: al ser un adaptador ligero de 218 MiB, se puede iterar sobre el prompt para explorar combinaciones de vestuario y accesorios sin reentrenar el modelo base.
- Integración en pipelines automatizados vía API de RunningHub: el repositorio enlaza la documentación de la API, lo que permite generar lotes de imágenes desde un servicio propio sin gestionar GPU.
- Generación de assets para juegos o narrativa visual: el personaje puede servir como referencia para retratos, sprites o ilustraciones de escenas, siempre que la licencia final lo permita.
- Docencia y demostración de LoRA en ComfyUI: por su tamaño reducido y su prompt de activación explícito, es un ejemplo manejable para explicar cómo funciona un adaptador de personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (FID, CLIP score, similitud de personaje, etc.) ni comparaciones cuantitativas con otros LoRA.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el LoRA de forma aislada; depende enteramente del modelo base `krea2` y de su precisión de carga. El adaptador en sí ocupa 218 MiB en disco.
- GPU recomendadas: no disponibles; vienen determinadas por el modelo base y por el pipeline de difusión usado en ComfyUI.
- Compatibilidad con GPU de consumo: no confirmada; el LoRA es ligero, pero la viabilidad en RTX 3060/4060/4090 depende de los requisitos del base `krea2`, que no se documentan.
- Opciones de despliegue: ComfyUI (principal), plataforma RunningHub (web y API). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada LoRA comparables del mismo autor o del mismo modelo base `krea2`, ni se dispone de datos de rendimiento que permitan una comparación rigurosa con otros adaptadores de personaje.

## Limitaciones y advertencias

- Ausencia total de información sobre licencia: la model card remite a la licencia del proyecto original o upstream, por lo que el uso comercial no está garantizado y requiere verificar los términos de `krea2` y de RunningHub.
- Sin datos de entrenamiento ni evaluación: no es posible estimar la fidelidad del personaje, la tasa de fallo ni la robustez ante prompts fuera de distribución.
- Riesgo de sobreajuste al prompt de activación: el personaje se describe con una lista muy específica de atributos; variaciones en el prompt pueden degradar la consistencia.
- Dependencia del modelo base `krea2`: cualquier limitación del base (resolución, idiomas, sesgos visuales) se hereda.
- Idiomas no declarados: no hay garantía de que los prompts en castellano funcionen igual de bien que los de ejemplo en inglés o chino.
- Riesgo de sesgos visuales: al ser un LoRA de personaje no se documentan sesgos de representación (género, etnia, corporalidad), que probablemente reflejen los del dataset del base.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: sin validación por parte de la comunidad, lo que reduce la confianza en su calidad reproducible.
- El contenido de la model card incluye enlaces de afiliación y promoción de la plataforma RunningHub; conviene tratarlos como material comercial y no como documentación técnica neutral.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2cos-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2095500021075628033
- Página del autor: https://www.runninghub.cn/user-center/2012385098774876162
- Workflow y aplicación asociados: https://www.runninghub.cn/post/2095819716760788993
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
