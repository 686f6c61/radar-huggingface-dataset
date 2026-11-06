# RunningHubAI/rh-wan2.2-low-mysticxxx-v2-lora

## Resumen

`rh-wan2.2-low-mysticxxx-v2-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado por RunningHubAI sobre el modelo base Wan2.2. No se trata de un modelo de lenguaje, sino de un ajuste fino ligero orientado a la generación de vídeo con Wan2.2, empaquetado para su uso en ComfyUI y en la plataforma RunningHub. El repositorio contiene un único archivo de pesos de 293 MiB (`Wan2.2-Low-MysticXXX-v2.safetensors`), coherente con el tamaño típico de un adaptador LoRA frente a los pesos completos de un modelo de difusión.

La relevancia de este artefacto es acotada: se trata de un ajuste estilístico o de contenido (el nombre "MysticXXX" sugiere un sesgo temático concreto) pensado para modificar el comportamiento del modelo base Wan2.2 en un pipeline de generación de vídeo. La model card no aporta información sobre datos de entrenamiento, hiperparámetros del LoRA (rango, alpha), resolución objetivo ni licencia explícita, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

Al no existir pipeline declarado, idiomas ni licencia en los metadatos de Hugging Face, la ficha se limita a lo verificable: el tipo de artefacto, su tamaño, su plataforma de destino y las advertencias derivadas de la ausencia de documentación técnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Wan2.2 (modelo de difusión para generación de vídeo) |
| Parametros totales | no disponible (el adaptador ocupa 293 MiB en safetensors; el modelo base Wan2.2 no se distribuye en este repo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión de vídeo, no un LLM) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; la cuantización depende del pipeline ComfyUI y del modelo base) |
| Idiomas soportados | no disponible (los prompts dependen del codificador de texto del modelo base Wan2.2) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream (Wan2.2) |
| Formato de pesos | safetensors (`Wan2.2-Low-MysticXXX-v2.safetensors`, 293 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se aplican sobre las capas del modelo base Wan2.2 sin modificar sus pesos originales. Wan2.2 es un modelo de difusión para generación de vídeo; el adaptador se carga junto al modelo base en un flujo de trabajo ComfyUI o en la plataforma RunningHub. El tamaño de 293 MiB es consistente con un LoRA de rango moderado sobre un modelo de difusión de gran tamaño, aunque no se especifica el rango (r), el alpha ni qué módulos (atención, proyecciones, etc.) fueron adaptados.

No hay información en la model card sobre el dataset de entrenamiento, el número de pasos, la resolución de las muestras, el uso de captions, ni si se emplearon técnicas como LoRA con regularización, DreamBooth o fine-tuning por pares. Tampoco se documenta si el adaptador fue entrenado sobre el checkpoint base de Wan2.2 o sobre una variante (por ejemplo, Wan2.2-T2V o Wan2.2-I2V). Toda esta información se marca como no disponible.

## Capacidades

- Modificación del comportamiento generativo del modelo base Wan2.2 mediante un adaptador LoRA ligero.
- Integración en flujos de trabajo ComfyUI como nodo de carga de LoRA.
- Ejecución en la plataforma RunningHub (API y entorno web) sin necesidad de infraestructura local.
- Aplicación de un sesgo estilístico o temático concreto (según el nombre "MysticXXX") sobre la generación de vídeo del modelo base.
- No incluye capacidades de texto, razonamiento, código, tool calling ni agentes: es un adaptador de difusión, no un LLM.
- No se documentan capacidades multilingües propias; dependen del codificador de texto del modelo base.

## Casos de uso

- Generación de vídeo con estética "mystic" en ComfyUI: cargar el LoRA junto al checkpoint Wan2.2 y aplicar el peso del adaptador en el nodo `LoraLoader` para sesgar el estilo visual de los clips generados.
- Prototipado rápido en RunningHub: usar el modelo directamente en la plataforma web o vía API para probar el efecto del LoRA sin montar un entorno local con GPU.
- Exploración de variantes estilísticas sobre Wan2.2: comparar generaciones con y sin el adaptador para evaluar su impacto en un pipeline de producción de vídeo.
- Integración en pipelines de postproducción automatizada: encadenar el LoRA con otros nodos de ComfyUI (upscalers, interpolación de frames) para generar material con una estética consistente.
- Evaluación de adaptadores de terceros: servir como caso de estudio de LoRA publicados sin documentación técnica, útil para decidir si merece la pena integrarlos.
- Pruebas de reproducibilidad: al ser un safetensors de tamaño pequeño, es fácil de versionar y comparar entre ejecuciones para medir la variabilidad del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad visual (FVD, CLIP score), comparaciones con el modelo base ni evaluaciones subjetivas.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador por separado; el consumo vendrá determinado por el modelo base Wan2.2 y la resolución/duración del vídeo generado.
- GPU recomendadas: no disponible en la información proporcionada; dependerán del modelo base Wan2.2 (típicamente GPU con VRAM alta para difusión de vídeo).
- Compatibilidad con GPU de consumo: el LoRA en sí ocupa 293 MiB, pero la viabilidad depende enteramente del modelo base y de la resolución objetivo; no hay datos para confirmarlo.
- Opciones de despliegue: ComfyUI (nativo), plataforma RunningHub (web y API). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un adaptador de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-wan2.2-low-mysticxxx-v2-lora | LoRA sobre Wan2.2 | 293 MiB (adaptador) | no aplica | no disponible | Hugging Face, RunningHub |
| Modelo base Wan2.2 | Difusión de vídeo | no disponible en esta ficha | no aplica | no disponible | no disponible |
| Otros LoRA de Wan2.2 en RunningHub | LoRA sobre Wan2.2 | variable | no aplica | no disponible | RunningHub |

No se dispone de datos de rendimiento ni de especificaciones comparables para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se especifican rango del LoRA, alpha, módulos adaptados, dataset ni hiperparámetros de entrenamiento.
- Licencia no declarada: la model card remite a la licencia del proyecto original o upstream; es imprescindible verificar la licencia de Wan2.2 antes de cualquier uso comercial.
- El nombre "MysticXXX" sugiere un sesgo temático que podría no ser apto para todos los públicos o contextos profesionales; conviene evaluar el contenido generado antes de usarlo en producción.
- Riesgo de sobreajuste al estilo del adaptador: al aplicarlo con pesos altos puede degradar la coherencia temporal o la calidad del vídeo del modelo base.
- Dependencia del modelo base: cualquier limitación de Wan2.2 (resolución, duración, sesgos del codificador de texto) se hereda.
- Sin métricas de calidad publicadas: no hay forma objetiva de comparar su efecto con el modelo base sin pruebas propias.
- Repositorio sin descargas ni interacciones: no hay evidencia de uso comunitario ni de validación por terceros.
- Fecha de creación futura (2026-11-06) en los metadatos: conviene tratar la información temporal con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-wan2.2-low-mysticxxx-v2-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2042806420940263425
- Página del autor: https://www.runninghub.cn/user-center/2008002332583010306
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
