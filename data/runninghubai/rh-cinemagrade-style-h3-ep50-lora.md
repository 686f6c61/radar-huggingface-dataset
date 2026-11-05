# RunningHubAI/rh-cinemagrade-style-h3-ep50-lora

## Resumen

`rh-cinemagrade-style-h3-ep50-lora` es un adaptador LoRA de estilo visual publicado por RunningHubAI (autor original: T8star-Aix) en noviembre de 2026. No es un modelo de lenguaje: es un conjunto de pesos de bajo rango (68 MiB en un único fichero `safetensors`) pensado para modificar el estilo de generación de un modelo base de vídeo/imagen denominado `minimax-h3`, aplicando un etalonaje cinematográfico (cinemagrade) a las salidas generadas.

El adaptador está empaquetado para su uso en ComfyUI, plataforma de referencia del ecosistema, y también puede cargarse en los servicios en la nube de RunningHub (versión internacional y China). El nombre incluye `ep50`, lo que sugiere un checkpoint entrenado durante 50 épocas, aunque el autor no documenta hiperparámetros de entrenamiento, dataset ni configuración de difusión.

La relevancia de esta ficha es acotada: se trata de un artefacto de estilo para pipelines de generación visual, sin model card técnica detallada, sin licencia declarada en HuggingFace y sin métricas publicadas. Los datos disponibles son mínimos y buena parte de los campos técnicos habituales (arquitectura, contexto, idiomas, cuantización) no aplican o no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base `minimax-h3`; arquitectura del base no disponible |
| Parametros totales | no disponible (pesos del adaptador: fichero de 68 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de generación visual, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en `safetensors`; la cuantización depende del modelo base y del runtime) |
| Idiomas soportados | no disponible (los prompts dependen del modelo base) |
| Licencia | no disponible en HuggingFace; la model card remite a la licencia del proyecto original y mantiene el copyright del autor |
| Formato de pesos | `safetensors` (`cinemagrade_style_h3_ep50.safetensors`, 68 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base `minimax-h3` para modificar su comportamiento sin reentrenar los pesos completos. El tamaño del fichero (68 MiB) es coherente con un adaptador de rango moderado sobre un transformer de difusión, aunque el autor no publica el rango, las capas objetivo ni el módulo de atención/FFN sobre el que se aplica.

No hay información sobre el dataset de entrenamiento, el número de pasos, la resolución de las imágenes o vídeos de referencia, ni sobre si se usó regularización, captions automáticos o aumento de datos. El sufijo `ep50` apunta a 50 épocas, pero se desconoce el tamaño del dataset y el régimen de learning rate. Tampoco se documenta si el adaptador se entrenó con DreamBooth, LoRA estándar o alguna variante específica de ComfyUI. En consecuencia, no es posible evaluar la fidelidad del estilo ni su robustez fuera del dominio de entrenamiento.

## Capacidades

- Aplicación de un estilo de etalonaje cinematográfico (cinemagrade) sobre las salidas del modelo base `minimax-h3`.
- Integración en flujos de ComfyUI mediante el nodo de carga de LoRA correspondiente.
- Carga en los servicios en la nube de RunningHub (internacional y China) y en Hugging Face.
- Compatible con el ecosistema de adaptadores de la plataforma, siempre que el modelo base `minimax-h3` esté disponible en el runtime.
- No dispone de capacidades de texto, razonamiento, código, matemáticas, tool calling ni agentes: es un adaptador visual.
- No se documentan capacidades multilingües propias; la idiomaticidad de los prompts depende del modelo base.

## Casos de uso

- Postprocesado estilístico de vídeo generado: aplicar el LoRA sobre `minimax-h3` en ComfyUI para homogeneizar el etalonaje de una secuencia y reducir el trabajo de corrección de color en postproducción.
- Prototipado de look cinematográfico: generar variantes de una misma escena con y sin el adaptador para comparar el efecto del grado en un pitch o una demo.
- Creación de contenido para redes: producir clips con una estética consistente (contraste, saturación, dominante de color) sin depender de plantillas de edición externas.
- Integración en pipelines de RunningHub: usar el endpoint de API de la plataforma para encadenar generación base + LoRA + render final en un flujo automatizado.
- Exploración de estilo para dirección de arte: iterar sobre prompts y semillas con el adaptador activo para definir la paleta de un proyecto antes de invertir en rodaje o render de alta calidad.
- Docencia y experimentación: estudiar en un entorno controlado cómo un LoRA de 68 MiB modifica la distribución de salida de un modelo de difusión, útil para cursos de generación visual.
- Benchmarking interno de adaptadores: comparar este LoRA con otros adaptadores de estilo sobre el mismo base para decidir cuál incorporar al catálogo de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (FID, CLIP score, LPIPS), comparativas cuantitativas ni evaluaciones humanas del estilo aplicado.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador por separado; el consumo lo determina el modelo base `minimax-h3` y la resolución de generación.
- GPU recomendadas: no disponibles en la información proporcionada; dependen del base. Para difusión de vídeo de tamaño medio suele ser necesario al menos una GPU con 16-24 GB de VRAM, pero este dato no está confirmado por el autor.
- ¿Cabe en GPU de consumo? No disponible. El adaptador en sí ocupa 68 MiB, pero el base condiciona el requisito real.
- Opciones de despliegue: ComfyUI (flujo nativo), servicios en la nube de RunningHub (internacional y China) y carga directa del `safetensors` en Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rh-cinemagrade-style-h3-ep50-lora` | LoRA de estilo | 68 MiB | `minimax-h3` | no disponible | HuggingFace, RunningHub |
| `cinemagrade-minimax-h3-style-lora` (Civitai) | LoRA de estilo | no disponible | `minimax-h3` | según Civitai | Civitai |
| Otros LoRA de estilo para `minimax-h3` en RunningHub | LoRA de estilo | variable | `minimax-h3` | según autor | RunningHub |

No se dispone de datos de rendimiento comparativo entre estos adaptadores. La comparativa se limita a tipo de artefacto, tamaño y canal de distribución.

## Limitaciones y advertencias

- No hay licencia declarada en HuggingFace; la model card remite a la licencia del proyecto original y mantiene el copyright del autor. Antes de uso comercial es necesario verificar la licencia del modelo base `minimax-h3` y la del adaptador en el repositorio original de RunningHub.
- Ausencia total de documentación técnica: sin rango, capas objetivo, dataset, hiperparámetros ni evaluación. Esto impide reproducir el entrenamiento o auditar el adaptador.
- Riesgo de sobreajuste al dataset de entrenamiento: con 50 épocas y sin regularización documentada, el estilo puede degradar la fidelidad al prompt o introducir artefactos en dominios distintos al de entrenamiento.
- Dependencia estricta del modelo base `minimax-h3`; no es portable a otros modelos de difusión sin reentrenamiento.
- Sin información sobre sesgos: al ser un adaptador visual, los sesgos potenciales (representación de tonos de piel, iluminación, composición) no están evaluados.
- Sin métricas de calidad ni comparativas publicadas; el juicio sobre el resultado es puramente subjetivo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación por parte de la comunidad.
- La fecha de creación (noviembre de 2026) y la referencia a un modelo base (`minimax-h3`) y a un servicio (Seedance 2.5) deben contrastarse con la documentación vigente de RunningHub antes de integrarlo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/RunningHubAI/rh-cinemagrade-style-h3-ep50-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2098938628264255490
- Referencia en Civitai: https://civitai.com/models/2927223/cinemagrade-minimax-h3-style-lora
- Página del autor: https://www.runninghub.cn/user-center/1819214514410942465
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-cinemagrade-style-h3-ep50-lora/blob/main/README_cn.md
