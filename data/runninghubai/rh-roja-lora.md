# RunningHubAI/rh-roja-lora

## Resumen

rh-roja-lora es un adaptador LoRA para edición y generación de imágenes publicado en Hugging Face por la cuenta RunningHubAI, sobre un modelo desarrollado por el usuario Santiago Narvaez dentro de la plataforma RunningHub. No se trata de un modelo de lenguaje ni de un modelo base autónomo, sino de un ajuste fino de bajo rango (LoRA) que debe cargarse sobre un modelo base, en este caso krea2, para modificar el comportamiento del generador en la dirección aprendida durante su entrenamiento. La palabra de activación (trigger word) es "roja".

Su relevancia es práctica y acotada: ocupa apenas 218 MiB en un único archivo safetensors, lo que lo hace trivial de distribuir y de integrar en flujos de trabajo de ComfyUI o en la propia plataforma RunningHub. El pipeline declarado es image-text-to-image, es decir, generación o edición de imagen condicionada por texto y, opcionalmente, por una imagen de entrada. No se ha publicado información sobre la composición del dataset de entrenamiento, el número de pasos, el rango del LoRA ni la licencia de uso.

Es importante subrayar que la ficha pública es muy escueta: no incluye idiomas soportados, licencia, benchmarks ni parámetros del adaptador más allá del tamaño del archivo. Cualquier evaluación de calidad debe hacerse empíricamente cargando el LoRA sobre krea2 en un entorno compatible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (low-rank adaptation) sobre el modelo base krea2; no es un transformer completo por sí mismo |
| Parametros totales | no disponible (adaptador de bajo rango; el archivo de pesos ocupa 218 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; el peso del adaptador es reducido) |
| Idiomas soportados | no disponible (los prompts de texto dependen del codificador del modelo base) |
| Licencia | no disponible (RunningHub indica que el copyright permanece con el autor y remite a la licencia del proyecto original) |
| Formato de pesos | safetensors (archivo `roja1.safetensors`) |

## Arquitectura y entrenamiento

Se trata de un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en determinadas capas lineales del modelo base para especializarlo sin reentrenar todos sus pesos. El modelo base declarado es krea2, y el repositorio solo contiene el adaptador, no los pesos completos. No se especifica sobre qué capas se aplica el ajuste (atención, proyecciones, etc.), ni el rango, ni el alpha del LoRA.

Tampoco hay información pública sobre el volumen de datos de entrenamiento, su composición, la resolución de las imágenes, el número de pasos de optimización, el learning rate ni si se aplicaron técnicas adicionales como regularización con imágenes de clase o captions detalladas. No se menciona ningún proceso de RLHF ni DPO, algo por otra parte ajeno a los adaptadores de imagen. La única innovación destacable es funcional: permite reutilizar un modelo base existente y aplicar un estilo o concepto concreto invocándolo mediante la palabra "roja", reduciendo drásticamente el coste de almacenamiento y despliegue frente a un fine-tuning completo.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) dentro del pipeline image-text-to-image, condicionada por la palabra de activación "roja".
- Edición de imágenes cuando el flujo recibe además una imagen de entrada, según el pipeline declarado.
- Aplicación de un concepto, personaje o estilo concreto aprendido durante el ajuste fino ("Mi peliropa V1", según la descripción del autor).
- Integración con ComfyUI como nodo LoRA sobre el modelo base correspondiente.
- Ejecución en la plataforma RunningHub y mediante su API, además de uso local con el modelo base adecuado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión analítica, audio ni modo "thinking": son capacidades propias de modelos de lenguaje y no aplican a este artefacto.

## Casos de uso

- Personalización de estilo en proyectos creativos: cargando el LoRA en ComfyUI sobre krea2 y usando "roja" en el prompt, un ilustrador puede generar variaciones consistentes de un mismo concepto a lo largo de una serie de ilustraciones.
- Generación de assets para redes sociales: producción de imágenes con una estética homogénea para campañas, aprovechando el bajo tamaño del adaptador para iterar rápidamente entre versiones.
- Edición de imágenes existentes en flujos image-text-to-image: por ejemplo, transformar una foto de referencia aplicando el concepto aprendido sin reentrenar el modelo base.
- Prototipado de personajes o marcas: un estudio puede evaluar si el LoRA captura el concepto deseado antes de invertir en un fine-tuning completo del modelo base.
- Integración vía API de RunningHub: automatizar la generación de imágenes dentro de pipelines de contenido sin gestionar infraestructura de GPU propia.
- Pruebas de concepto en investigación sobre adaptación eficiente: sirve como ejemplo de adaptador LoRA de pocos cientos de MiB para estudiar transferencia de concepto sobre un modelo base fijo.
- Producción de material visual para documentación o presentaciones: generar ilustraciones temáticas coherentes de forma reproducible usando la misma palabra de activación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 218 MiB, por lo que su carga añade un coste de VRAM y memoria despreciable frente al modelo base.
- La VRAM real depende por completo de krea2: no se dispone de cifras oficiales de consumo del modelo base en la información proporcionada.
- Con GPU de consumo (por ejemplo, series RTX 3060, 4070, 4090) es habitual poder ejecutar modelos de difusión de este tipo en cuantizaciones de 8 o 16 bits, aunque no hay confirmación específica para krea2.
- En entornos de servidor, GPU tipo A100, H100 o L40S permiten mayor resolución y lotes más grandes, pero no se han publicado cifras de throughput ni latencia.
- Opciones de despliegue: ComfyUI (soporte nativo de LoRA), la plataforma RunningHub y su API. No se confirma soporte oficial en vLLM, TGI, llama.cpp u Ollama, que son herramientas orientadas a modelos de lenguaje y no aplican aquí.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamano del adaptador | Palabra de activacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-roja-lora | LoRA de imagen | krea2 | 218 MiB | roja | no disponible | Hugging Face / RunningHub |
| rh-ai-lora | LoRA de imagen | no disponible | no disponible | no disponible | no disponible | Hugging Face / RunningHub |
| Otros LoRA de RunningHub | LoRA de imagen | variables | variables | variables | no disponible | Hugging Face / RunningHub |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La licencia no está especificada; el repositorio remite a la licencia del proyecto original y deja el copyright en manos del autor. No se puede asumir uso comercial sin verificar la licencia del modelo base krea2 y las condiciones de RunningHub.
- No se documenta el dataset de entrenamiento, por lo que se desconocen posibles sesgos, sobreajuste a un conjunto reducido de imágenes o dependencia excesiva de la palabra de activación.
- Al ser un adaptador, su comportamiento está totalmente condicionado por el modelo base krea2; cambios o sustituciones del base pueden degradar o anular el efecto del LoRA.
- Riesgo de sobreajuste: los LoRA pequeños entrenados con pocos datos tienden a reproducir composiciones o rasgos concretos del material de entrenamiento, lo que puede producir resultados poco diversos.
- La ausencia de benchmarks y de una model card detallada impide anticipar su calidad; se recomienda evaluarlo empíricamente antes de usarlo en producción.
- No hay información sobre idiomas de los prompts ni sobre resolución o relación de aspecto recomendadas.
- El repositorio no incluye los pesos del modelo base, por lo que el usuario debe obtenerlo por su cuenta y respetar su licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-roja-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2104223626307350530
- Página del autor: https://www.runninghub.ai/user-center/1978318468825165825
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Biblioteca de modelos de RunningHub: https://www.runninghub.ai/models
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Ejemplo de otro LoRA de la misma cuenta: https://huggingface.co/RunningHubAI/rh-ai-lora
