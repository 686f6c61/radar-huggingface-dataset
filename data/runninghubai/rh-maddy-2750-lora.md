# RunningHubAI/rh-maddy-2750-lora

## Resumen

rh-maddy-2750-lora es un adaptador LoRA para edición de imágenes publicado por RunningHubAI en Hugging Face. No se trata de un modelo de lenguaje, sino de un conjunto de pesos de bajo rango (218 MiB en un único archivo `MaddyLoRa_000002750.safetensors`) que se aplica sobre un modelo base de generación y edición de imágenes. La model card indica que está afinado a partir de "krea2", aunque no se detalla la arquitectura exacta del modelo base ni el pipeline completo de difusión subyacente.

El adaptador está etiquetado con `comfyui`, `lora` y `image-text-to-image`, lo que sitúa su uso previsto en flujos de trabajo de ComfyUI para tareas de edición de imagen guiada por texto. La información publicada es muy escasa: no hay descripción sustantiva del estilo o la identidad que aprende el LoRA (la sección "About this model" contiene únicamente el texto "kkk"), no se declaran benchmarks, no se especifican idiomas y la licencia queda remitida a la del proyecto original.

Su relevancia es, por tanto, acotada: se trata de un artefacto de personalización visual distribuido a través de la plataforma RunningHub, útil para quien ya trabaje con el modelo base krea2 en ComfyUI y quiera incorporar el estilo o sujeto concreto que captura este LoRA. Para cualquier evaluación rigurosa de capacidades, rendimiento o condiciones legales, la información disponible es insuficiente y debe consultarse la página original en RunningHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base krea2; arquitectura del base no disponible |
| Parametros totales | no disponible (pesos LoRA de 218 MiB; el número de parámetros del adaptador no se declara) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de texto) |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors, presumiblemente en precisión nativa del entrenamiento |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`MaddyLoRa_000002750.safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

La información disponible confirma únicamente que se trata de un LoRA, es decir, un conjunto de matrices de bajo rango inyectadas en las capas de un modelo base congelado, y que dicho base es "krea2". No se especifica el número de rangos, las capas objetivo, la dimensión del adaptador ni la estrategia de fusión. Tampoco se detalla si el modelo base es un transformer de difusión (DiT), un UNet o una arquitectura híbrida, ni el pipeline de texto a imagen o edición subyacente.

Respecto al entrenamiento, la model card no aporta datos sobre el volumen del dataset, la composición de las imágenes, el número de pasos, la resolución de entrenamiento, el uso de regularización o de captions, ni si hubo etapas de refinamiento. El identificador "2750" en el nombre del archivo sugiere un contador de pasos o de muestras, pero es una inferencia no confirmada. No se documenta ninguna innovación técnica adicional.

## Capacidades

- Edición y generación de imágenes guiada por texto dentro de flujos de ComfyUI, aplicando el estilo o la identidad aprendidos por el LoRA sobre el modelo base krea2.
- Personalización visual: al ser un LoRA, su función principal es modular la salida del modelo base hacia un dominio concreto (sujeto, estética o tratamiento visual), no añadir capacidades nuevas por sí mismo.
- Integración en pipelines `image-text-to-image`, según el `pipeline_tag` declarado.
- Compatibilidad con la plataforma RunningHub y con ComfyUI, según las etiquetas y los enlaces de la model card.
- No se declaran capacidades de tool calling, razonamiento multi-paso, agentes, visión analítica, audio ni modo de pensamiento; no aplican a un adaptador de imagen.
- Capacidades multilingües: no disponibles; no se documenta el tokenizador ni los idiomas de los prompts admitidos.

## Casos de uso

- Edición de retratos o sujetos con identidad consistente: el LoRA se cargaría en ComfyUI sobre el checkpoint krea2 para mantener un aspecto o personaje concreto a lo largo de varias generaciones, útil en ilustración seriada o cómic.
- Producción de material gráfico para redes sociales: aplicación del estilo aprendido sobre imágenes base para generar variaciones coherentes de una misma estética sin reentrenar el modelo completo.
- Iteración de concepto en diseño: uso del adaptador en un grafo de ComfyUI con ControlNet u otros nodos para explorar variantes de una imagen manteniendo la dirección visual del LoRA.
- Prototipado de assets para videojuegos o animación: generación de bocetos y variaciones de personajes con un tratamiento visual homogéneo antes de pasar a modelado o ilustración final.
- Automatización por API en RunningHub: invocación del flujo que incorpora este LoRA a través de la API de la plataforma para integrar la generación en un pipeline de producción de contenido.
- Experimentación en investigación de personalización: comparación del efecto del adaptador frente al modelo base para estudiar cómo un LoRA de bajo rango modifica la distribución de salida en un modelo de difusión.
- Pruebas de edición imagen-a-imagen: uso del pipeline `image-text-to-image` para modificar imágenes existentes aplicando el estilo del LoRA, por ejemplo en retoque fotográfico estilizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; el consumo vendrá determinado por el modelo base krea2, cuyo tamaño no se especifica. El archivo LoRA ocupa 218 MiB en disco y añade una sobrecarga mínima de memoria al fusionarse o cargarse junto al base.
- GPU recomendadas: no disponibles; dependen del modelo base. Para modelos de difusión de imagen de gran tamaño es habitual requerir GPUs con 16-24 GB de VRAM o superiores (RTX 4090, A100, H100), pero este dato no se confirma para krea2.
- Compatibilidad con GPU de consumo: no confirmada; condicionada al modelo base y a la cuantización aplicada a este.
- Opciones de despliegue: ComfyUI (plataforma declarada), RunningHub (plataforma original y API), y Hugging Face como repositorio de pesos. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un adaptador de imagen de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-maddy-2750-lora | LoRA para imagen (base krea2) | no disponible (218 MiB en disco) | no aplica | no disponible | Hugging Face, RunningHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros LoRA del mismo autor, del mismo modelo base o de la misma categoría que permita una comparación técnica fiable. Cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- La model card carece de descripción funcional: la sección "About this model" contiene solo "kkk", por lo que no se puede saber qué estilo, sujeto o identidad captura el adaptador sin probarlo.
- No se declara la licencia del adaptador; se remite a la del proyecto original o upstream. Antes de un uso comercial es imprescindible verificar la licencia de krea2 y la del propio LoRA en la página de RunningHub.
- Riesgo de sobreajuste y de degradación del modelo base: al ser un LoRA de bajo rango sin documentación de entrenamiento, puede reproducir sesgos del dataset (por ejemplo, en representación de personas) o limitar la diversidad de las salidas.
- No hay información sobre el dataset de entrenamiento, por lo que no se pueden evaluar sesgos demográficos, culturales o estéticos.
- Idiomas de los prompts no documentados; no se garantiza un comportamiento correcto con prompts en castellano.
- Sin benchmarks ni evaluación cualitativa publicada: el rendimiento real es desconocido hasta su prueba en ComfyUI.
- Dependencia total del modelo base krea2: la calidad, los requisitos de hardware y las restricciones legales del conjunto recaen sobre dicho base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-maddy-2750-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2113486409159254018
- Página del autor: https://www.runninghub.ai/user-center/2112263477373333506
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
