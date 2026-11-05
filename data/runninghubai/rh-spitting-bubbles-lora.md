# RunningHubAI/rh-spitting-bubbles-lora

## Resumen

rh-spitting-bubbles-lora es un adaptador LoRA de edición de imagen publicado por RunningHubAI en Hugging Face. No se trata de un modelo de lenguaje, sino de un peso adicional que se aplica sobre un modelo base de difusión para generar o editar imágenes con un estilo y unos motivos concretos. El repositorio contiene un único archivo de pesos de 218 MiB (`k_sloppy.safetensors`) y está etiquetado para su uso en ComfyUI bajo el pipeline `image-text-to-image`.

El modelo se presenta como un LoRA de "image edit" afinado a partir de krea2, con la palabra de activación `sl0ppy` y un peso recomendado de 1.0. La model card describe su función como una mejora de estilo orientada a saliva, baba y otros fluidos sobre rostros y cuerpos, con una lista de términos de mejora que incluye saliva en la cara, cuerpo cubierto de fluidos, rubor, escupir, maquillaje arruinado y exceso de saliva. El contenido es explícitamente para adultos y de naturaleza sexual.

La relevancia técnica del artefacto es limitada: no aporta arquitectura propia, no documenta datos de entrenamiento ni métricas, y su licencia no está especificada. Su interés práctico se reduce a quien quiera reproducir ese estilo concreto dentro de un flujo de ComfyUI o de la plataforma RunningHub, asumiendo las restricciones de contenido y la opacidad sobre el modelo base y los datos usados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo base de difusión; afinado desde krea2 (según model card) |
| Parametros totales | no disponible (el archivo de pesos ocupa 218 MiB; no se declara el número de parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts se procesan con el text encoder del modelo base) |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`k_sloppy.safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de un modelo de difusión preentrenado para modificar su comportamiento sin reentrenar todos los pesos. La model card indica que se afina a partir de krea2, pero no detalla la arquitectura del modelo base, la dimensión del rango, las capas objetivo ni el esquema de entrenamiento. El tamaño del archivo (218 MiB) es coherente con un adaptador de rango moderado sobre un modelo de difusión de gran tamaño, pero no permite inferir el número exacto de parámetros entrenables.

No se documentan el volumen de datos de entrenamiento, la composición del dataset, el uso de regularización, el número de pasos ni técnicas de optimización como RLHF o DPO (que, por otra parte, no son habituales en adaptadores de difusión de este tipo). Tampoco se especifica si el adaptador se entrenó con pares imagen-texto, con imágenes de referencia o con un pipeline de edición, más allá de la etiqueta `image-text-to-image` y de la descripción "LoRA (image edit)". La única indicación operativa es el peso recomendado de 1.0 y la palabra de activación `sl0ppy`.

## Capacidades

- Generación y edición de imágenes dentro de un pipeline `image-text-to-image`, aplicando un estilo concreto sobre el modelo base.
- Activación mediante la palabra clave `sl0ppy`, con un peso de escala recomendado de 1.0.
- Modificación de atributos faciales y corporales según los términos de mejora declarados: saliva en la cara, cuerpo cubierto de fluidos, rubor ligero, escupir, escupir en la cara, exceso de saliva, cara desordenada y maquillaje arruinado.
- Integración en ComfyUI y en la plataforma RunningHub, incluyendo el uso mediante API.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo explícito ni modos de "thinking".
- No se declaran capacidades de visión, audio o vídeo más allá del pipeline de imagen indicado.

## Casos de uso

- Producción de ilustración erótica o contenido para adultos: el LoRA se cargaría en ComfyUI sobre el modelo base krea2 con el peso 1.0 y el trigger `sl0ppy` para generar escenas con los motivos descritos. Es adecuado únicamente en contextos donde ese contenido esté permitido y exista verificación de edad.
- Edición de retratos con estilización de fluidos: partiendo de una imagen de entrada en un flujo `image-text-to-image`, el adaptador añadiría los efectos de saliva y maquillaje arruinado sobre el rostro, útil para producciones de ficción o caracterización.
- Prototipado rápido de estilos en un estudio de ilustración: permite explorar variaciones de un estilo muy específico sin entrenar un modelo desde cero, gracias al bajo coste de almacenamiento del adaptador (218 MiB).
- Integración en pipelines automatizados mediante la API de RunningHub: el adaptador puede invocarse desde un servicio externo para generar lotes de imágenes con parámetros fijos, siempre que se cumplan las políticas de contenido de la plataforma.
- Experimentación académica sobre adaptadores de bajo rango: sirve como ejemplo de LoRA de edición de imagen para estudiar cómo un adaptador pequeño modifica el comportamiento de un modelo de difusión, aunque la falta de documentación limita su valor reproducible.
- Creación de variantes estilísticas dentro de una misma sesión de ComfyUI: combinado con otros LoRA y con el modelo base, permite ajustar la intensidad del efecto mediante el peso de escala, lo que facilita comparar resultados en un mismo grafo.
- No se recomienda su uso en atención al cliente, generación de código, análisis de documentos ni ninguna tarea de texto, por no ser un modelo de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador en sí ocupa 218 MiB, pero el consumo real depende del modelo base de difusión sobre el que se aplique, que no se especifica con precisión (solo "krea2").
- GPU recomendadas: no disponible. Al tratarse de un LoRA de difusión, el requisito vendrá determinado por el modelo base; no se documentan GPU concretas (A100, H100, RTX 4090, etc.).
- ¿Cabe en GPU de consumo? No disponible. El adaptador es pequeño, pero el modelo base condiciona la viabilidad; no se aportan datos.
- Opciones de despliegue: ComfyUI (plataforma declarada), RunningHub (plataforma y API) y Hugging Face como repositorio de pesos. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de imagen.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA comparables ni datos de rendimiento que permitan una comparación rigurosa. Como referencia estructural, podría compararse con otros adaptadores LoRA de edición de imagen para ComfyUI, pero no se dispone de sus especificaciones en esta ficha.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-spitting-bubbles-lora | no disponible (218 MiB en disco) | no aplica | no disponible | no disponible | Hugging Face, ComfyUI, RunningHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Contenido explícitamente sexual y para adultos: la model card describe fluidos corporales, saliva y semen, y el modelo original enlazado en Civitai tiene un título igualmente explícito. No debe usarse en entornos sin control de edad ni en productos dirigidos a menores.
- Licencia no especificada: la model card remite a "la licencia del proyecto original o upstream", que no se detalla. Esto impide confirmar si el uso comercial está permitido y obliga a verificar los términos del modelo base krea2 antes de cualquier despliegue en producción.
- Opacidad sobre el modelo base y los datos: no se documentan la arquitectura exacta del base, el dataset de entrenamiento, el número de pasos ni el método de anotación, lo que impide auditar sesgos o reproducir el entrenamiento.
- Riesgo de alucinación visual y artefactos: como todo LoRA de difusión, puede producir anatomías inconsistentes, fluidos mal integrados o artefactos en manos y rostros, especialmente con pesos distintos de 1.0.
- Dependencia del trigger y del peso: el efecto depende de la palabra `sl0ppy` y de una escala de 1.0; no se documenta el comportamiento con otros valores ni la interferencia con otros LoRA en el mismo grafo.
- Idiomas no declarados: no se especifica qué text encoders ni qué idiomas soporta el pipeline; los prompts en castellano pueden funcionar peor que en inglés si el base está entrenado principalmente en ese idioma.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión pública que permitan validar su calidad.
- Fecha de creación futura en los metadatos (2026-11-05): conviene tratar las marcas temporales con cautela, ya que no son coherentes con la fecha actual y pueden indicar un error de registro.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-spitting-bubbles-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2079903653820911617
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Modelo de referencia en Civitai: https://civitai.red/models/2029062/my-masterpiece-sloppy-messy-enhancement-after-fellatio-flux-20-klein-9b-sdxl?modelVersionId=3153271
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-spitting-bubbles-lora/blob/main/README_cn.md
