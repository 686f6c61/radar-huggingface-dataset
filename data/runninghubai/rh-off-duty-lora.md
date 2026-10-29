# RunningHubAI/rh-off-duty-lora

## Resumen

`RunningHubAI/rh-off-duty-lora` es un adaptador LoRA para edición de imágenes guiada por texto (pipeline `image-text-to-image`), publicado en Hugging Face por la cuenta RunningHubAI en representación del autor del modelo original, identificado en la model card como «@氛围感». El repositorio contiene un único fichero de pesos de 224 MiB, `krea2_halprolapse_anal_prolapse_v1.0 (1).safetensors`, y no incluye código de inferencia, configuración de entrenamiento ni documentación técnica del adaptador.

La model card indica únicamente que el modelo está afinado a partir de una base denominada «krea2», sin especificar versión, repositorio ni licencia del modelo base. No se documentan parámetros de entrenamiento (número de pasos, resolución, rank del LoRA, dataset, learning rate), ni palabras de activación (trigger words): el autor remite a la página del modelo original en Civitai para consultar los prompts, y advierte que el contenido de ese modelo original es de carácter sexual explícito para adultos.

Su relevancia práctica es limitada y muy específica: se trata de un adaptador de nicho distribuido a través de una plataforma comercial (RunningHub) para su uso en ComfyUI, con cero descargas y cero likes en el momento de la consulta, sin benchmarks ni validación comunitaria. Resulta útil únicamente como ejemplo del flujo de publicación de LoRAs de RunningHub en Hugging Face y como caso de estudio de licencias opacas en adaptadores derivados de modelos de difusión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Adaptador LoRA sobre un modelo de difusión (base indicada por el autor: «krea2», sin versión ni repositorio especificados) |
| Parametros totales | No disponible. El adaptador ocupa 224 MiB; asumiendo pesos en fp16, se estiman del orden de 1,17 × 10^8 parámetros (estimación no confirmada por el autor) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de difusión imagen-a-imagen; no hay ventana de contexto textual). Resolución de entrenamiento e inferencia: no disponible |
| Tipos de cuantizacion | No disponible. El repositorio solo distribuye safetensors sin cuantizar; no se publican versiones GGUF, fp8 ni mergeadas con la base |
| Idiomas soportados | No disponible. No se documenta el idioma de los prompts; la model card está en inglés y chino, pero no especifica el entrenamiento textual |
| Licencia | No disponible. La model card indica que el copyright permanece en el autor y que se debe seguir la licencia del proyecto original o del modelo base, sin identificarlos |
| Formato de pesos | safetensors (`krea2_halprolapse_anal_prolapse_v1.0 (1).safetensors`) |

Metadatos adicionales del repositorio: tamaño total 0,2 GB, 0 descargas, 0 likes, etiquetas `comfyui`, `lora`, `image-text-to-image`, `region:us`. Fechas de creación y actualización registradas: 2026-10-29.

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base ni sobre el proceso de entrenamiento del adaptador. La model card se limita a la línea «Finetuned from: krea2», sin enlace al repositorio base, sin tarjeta de configuración y sin especificar si se trata de un modelo de la familia FLUX, de Stable Diffusion u otra. Tampoco se indica el rank del LoRA, las capas objetivo, el número de pasos de entrenamiento, la resolución, el dataset utilizado ni si hubo regularización o captions automáticos.

El único dato técnico verificable es el tamaño del artefacto: 224 MiB en un único safetensors, lo que es coherente con adaptadores de rango medio-alto sobre transformers de difusión de gran tamaño, pero se trata de una inferencia, no de un dato publicado. No hay información sobre innovaciones técnicas (destilación, decodificación especulativa, atención lineal) porque el objeto distribuido es un adaptador de estilo/contenido, no un modelo completo. La página original en Civitai, referenciada en la model card, es la única fuente potencial de detalles de entrenamiento y de prompts de activación, y su consulta requiere verificación de edad.

## Capacidades

Las capacidades que se enumeran a continuación se derivan del pipeline declarado (`image-text-to-image`), del formato (LoRA) y de la plataforma de destino (ComfyUI), no de una evaluación documentada por el autor:

- Edición de imágenes existentes mediante instrucciones textuales, cargando el adaptador sobre el modelo base en un flujo de imagen-a-imagen.
- Modificación de estilo, pose y composición heredada del modelo base «krea2», con el sesgo específico del dataset de entrenamiento del LoRA (contenido para adultos según la referencia original).
- Integración en ComfyUI mediante el nodo de carga de LoRA, y en la plataforma RunningHub a través de sus flujos públicos.
- Compatibilidad potencial con herramientas que cargan LoRA sobre modelos de difusión (diffusers, ComfyUI, stable-diffusion.cpp), sujeta a la identificación efectiva del modelo base.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades de audio o vídeo: no aplica a este tipo de modelo.
- Capacidades multilingües: no documentadas; el comportamiento del codificador de texto depende enteramente del modelo base, no del LoRA.

## Casos de uso

- Edición de imagen en ComfyUI para estudio creativo: cargar el safetensors con el nodo `Load LoRA` sobre la base correspondiente y aplicar variaciones de estilo sobre una imagen de referencia, aprovechando el bajo peso del adaptador (224 MiB) para iterar rápido entre versiones.
- Pruebas de compatibilidad de bases: usar el adaptador como caso de test para verificar que un pipeline de ComfyUI detecta y aplica correctamente LoRAs de terceros antes de incorporar adaptadores propios a producción.
- Automatización vía API de RunningHub: ejecutar el flujo alojado en la plataforma (identificador público 2075083880100614146) y consumirlo por HTTP, sin necesidad de GPU local ni de gestionar el modelo base.
- Auditoría de procedencia y licencias: emplear el repositorio como ejemplo real de adaptador con licencia no declarada y dependencia de un modelo base no identificado, para diseñar políticas internas de aprobación de artefactos.
- Generación de contenido para plataformas de adultos: uso previsto por el autor según la referencia original; requiere verificación de edad, cumplimiento legal (por ejemplo, normativa de verificación de edad y de contenido sexual) y revisión de las políticas de la plataforma de destino antes de cualquier despliegue.
- Investigación sobre sesgos en adaptadores de bajo rango: comparar las salidas del modelo base con y sin el LoRA para medir cuánto desplaza un adaptador de ~10^8 parámetros la distribución de salida, con fines de análisis y no de publicación.
- Docencia sobre ecosistema de difusión: ilustrar en un curso o taller la estructura de un LoRA en safetensors, su carga en ComfyUI y los problemas de reproducibilidad cuando falta la model card técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones cuantitativas (FID, CLIP score, similitud de imagen, consistencia de identidad), ni comparaciones con otros adaptadores, ni ejemplos de salida verificables más allá de la página externa del modelo original.

## Requisitos de hardware

- El adaptador por sí solo no es ejecutable: requiere el modelo base completo, cuya identidad exacta no se especifica. Los requisitos de VRAM dependen, por tanto, de ese modelo base y no pueden determinarse con los datos disponibles.
- VRAM estimada para el adaptador: 224 MiB de pesos, más el overhead de fusión en memoria; en la práctica queda dominada por el modelo base.
- Para una base del orden de 12 000 millones de parámetros en transformer de difusión (escenario habitual en modelos tipo FLUX): aproximadamente 22-24 GB de VRAM en bf16/fp16, 12-16 GB con cuantización fp8 o GGUF Q8, y 8-12 GB con GGUF Q4. Estimación condicionada a que la base sea de esa familia, extremo no confirmado.
- GPU recomendadas (bajo la misma hipótesis): A100 40/80 GB o H100 para lotes grandes y despliegue multiusuario; RTX 4090 (24 GB) o RTX 3090 (24 GB) para bf16 sin cuantizar; RTX 4080/4070 Ti Super (16 GB) o RTX 4060 Ti 16 GB con fp8/GGUF.
- Cabe en GPU de consumo: sí, en el escenario anterior, siempre con cuantización en el caso de tarjetas de 8-12 GB; no confirmado para la base real.
- Opciones de despliegue: ComfyUI (nodo de carga de LoRA, uso previsto por el autor), RunningHub en la nube (sin hardware propio), diffusers (`load_lora_weights` sobre el pipeline base), stable-diffusion.cpp para entornos con GGUF. vLLM, TGI, llama.cpp y Ollama no son aplicables: son servidores de modelos de lenguaje, no de difusión.
- Latencia y throughput: no disponibles. Dependen de la base, la GPU, el número de pasos y la resolución; el adaptador añade una sobrecarga marginal (fusión de pesos) frente al coste del modelo base.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Licencia | Disponibilidad | Datos técnicos |
|---|---|---|---|---|---|
| `RunningHubAI/rh-off-duty-lora` | LoRA imagen-a-imagen | «krea2» (no especificada) | No disponible | Hugging Face (224 MiB, 0 descargas) y RunningHub | Sin parámetros, dataset ni benchmarks publicados |
| `RunningHubAI/rh-ai-lora` | LoRA texto-a-imagen | No especificada | No disponible | Hugging Face y RunningHub | Model card igualmente mínima; sin métricas |
| Modelo original en Civitai (v1.0) | LoRA imagen-a-imagen | «krea2» | No verificada en la información disponible | Civitai | Incluye presumiblemente prompts y detalles que la copia en HF no reproduce |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas: la información proporcionada no incluye métricas de ningún adaptador comparable, y la identidad del modelo base impide establecer una comparación técnica rigurosa.

## Limitaciones y advertencias

- Model card incompleta: no hay trigger words, prompts de ejemplo, configuración de inferencia (CFG, sampler, pasos, resolución) ni identificador del modelo base. La reproducibilidad es baja sin consultar la página externa original.
- Licencia no declarada: la model card solo indica que el copyright permanece en el autor y que se siga la licencia del proyecto original o del modelo base, sin nombrarlos. Esto impide determinar si el uso comercial está permitido; en la práctica, la ausencia de licencia explícita debe tratarse como no autorizado para producción hasta aclararlo por escrito con el autor.
- Riesgo de licencia en cascada: si el modelo base resulta ser un modelo de difusión con licencia no comercial, esa restricción se hereda al adaptador. No confirmado, pero es un riesgo real dada la opacidad sobre la base.
- Contenido para adultos: el título del modelo original y la referencia externa de la model card indican contenido sexual explícito. Antes de cualquier uso hay que verificar legislación aplicable (verificación de edad, normativa sobre contenido sexual), políticas de la plataforma de distribución y términos de Hugging Face y RunningHub.
- Sin validación comunitaria: 0 descargas y 0 likes; no hay evidencia externa de que el adaptador funcione correctamente ni de que los pesos estén íntegros.
- Sesgos desconocidos: al no documentarse el dataset, no es posible evaluar sesgos de representación (cuerpo, género, etnia) ni el grado de sobreajuste al conjunto de entrenamiento.
- Alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta, artefactos en manos y rostros, e incoherencias entre la instrucción de texto y la imagen resultante; no hay evaluación publicada al respecto.
- Idiomas: no se especifica el idioma de los prompts; el rendimiento multilingüe dependerá del codificador de texto de la base y no está documentado.
- Metadatos cuestionables: las fechas de creación y actualización registradas (2026-10-29) no son verificables de forma independiente.
- Repositorio con nombre de fichero que incluye espacios y paréntesis: puede requerir escapado en scripts de descarga automatizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-off-duty-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2075083880100614146
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Referencia al modelo original en Civitai indicada en la model card (contenido para adultos; requiere verificación de edad y de licencia): https://civitai.red/models/2764849/anal-prolapse-by-hal?modelVersionId=3111938
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Página de entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Catálogo de modelos de RunningHub: https://www.runninghub.ai/models
- Ejemplo de otro adaptador del mismo publicador: https://huggingface.co/RunningHubAI/rh-ai-lora
