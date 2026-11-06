# RunningHubAI/rh-odf-zl-5250-lora

## Resumen

`rh-odf-zl-5250-lora` es un adaptador LoRA de text-to-image publicado por RunningHubAI en Hugging Face. Se trata de un ajuste fino (fine-tuning) derivado del modelo base Z-image-base, orientado a controlar un atributo visual concreto: la forma del rostro (el campo "About this model" de la model card indica "脸型", que significa forma del rostro). El repositorio contiene únicamente los pesos del LoRA en formato safetensors, con un tamano de 162 MiB y un repo total de 0,2 GB.

El modelo está pensado para su uso dentro del ecosistema ComfyUI y de la plataforma RunningHub, donde se puede cargar y ejecutar en línea. No se trata de un modelo generativo completo, sino de un adaptador que modifica el comportamiento del modelo base Z-image-base al que se aplica durante la inferencia. Por tanto, su relevancia es acotada: interesa a quienes ya trabajan con Z-image-base y necesitan un control específico sobre la morfología facial en la generación de imágenes.

La información disponible es muy limitada: no se especifican parámetros, contexto, idiomas, licencia ni resultados de benchmarks. La model card se limita a enlazar a la plataforma RunningHub y a indicar el fichero de pesos y el modelo de origen. Esta ficha refleja fielmente esa escasez de datos y marca como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base de difusion Z-image-base |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, 162 MiB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original) |
| Formato de pesos | safetensors (`oudifen_Z-Image_lora_v1_000005250.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Z-image-base para adaptar su comportamiento sin reentrenar todos los pesos. El fichero entregado, `oudifen_Z-Image_lora_v1_000005250.safetensors`, ocupa 162 MiB, un tamano coherente con un adaptador LoRA de rango moderado sobre un modelo de difusion. No se detalla el rango, las capas objetivo ni la configuración de entrenamiento.

No hay información sobre el dataset de entrenamiento, el número de pasos, la resolución de las imágenes de entrenamiento ni si se aplicaron técnicas como regularización o captions específicos. La model card solo indica que fue entrenado en RunningHub y que se ajustó desde Z-image-base. El nombre del fichero sugiere un identificador de versión (`v1_000005250`), pero no aporta detalles técnicos verificables.

## Capacidades

- Generación de imágenes text-to-image cuando se combina con el modelo base Z-image-base en ComfyUI o RunningHub.
- Control de la forma del rostro (atributo "脸型") en las imágenes generadas, que es el propósito declarado del LoRA.
- Integración en flujos de trabajo de ComfyUI mediante nodos de carga de LoRA.
- Ejecución en la plataforma RunningHub, que permite probarlo en línea y acceder vía API.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking, ya que no es un modelo de lenguaje.
- No se documentan capacidades multilingües; el modelo no procesa texto como tarea principal, sino que actúa sobre el modelo base.

## Casos de uso

- Retrato con control facial en estudios de personajes: el LoRA se aplica sobre Z-image-base para generar retratos con una morfología facial consistente, útil en la creación de hojas de personaje para narrativa o videojuegos.
- Iteración de concept art: un artista puede cargar el LoRA en ComfyUI y variar prompts manteniendo un rasgo facial estable, reduciendo el número de generaciones descartadas.
- Pruebas de consistencia de personaje entre escenas: al fijar la forma del rostro, se facilita mantener la identidad visual de un personaje en distintas poses e iluminaciones.
- Prototipado rápido en RunningHub: al estar disponible en la plataforma, se puede probar el LoRA sin montar infraestructura local, útil para evaluar su efecto antes de integrarlo en un pipeline.
- Automatización vía API de RunningHub: equipos que ya usan la API pueden invocar el flujo con este LoRA para generar lotes de imágenes con el atributo facial deseado.
- Docencia y experimentación con LoRA: sirve como ejemplo práctico de adaptador de bajo rango sobre un modelo de difusión para quienes aprenden a entrenar y aplicar LoRA en ComfyUI.
- Integración en pipelines de generación por lotes: combinado con scripts de ComfyUI, permite producir variaciones de retratos con control facial para catálogos o pruebas A/B de estilos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el LoRA de forma aislada; depende del modelo base Z-image-base, que no se especifica en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el LoRA pesa 162 MiB, pero el requisito real lo determina el modelo base.
- Opciones de despliegue: ComfyUI (carga de LoRA), plataforma RunningHub (en línea y vía API). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-odf-zl-5250-lora | LoRA text-to-image sobre Z-image-base | no disponible | no aplica | no disponible | Hugging Face, RunningHub |
| rh-ai-lora (RunningHubAI) | LoRA text-to-image | no disponible | no aplica | no disponible | Hugging Face |
| Z-image-base | Modelo base de difusión | no disponible | no aplica | no disponible | Referenciado como origen |

No se dispone de datos de rendimiento, parámetros ni licencia de las alternativas, por lo que la comparación cuantitativa no es posible con la información proporcionada.

## Limitaciones y advertencias

- La información publicada es mínima: no hay licencia explícita, lo que impide confirmar si el uso comercial está permitido; la model card remite a la licencia del proyecto original.
- No se documentan sesgos conocidos, pero al tratarse de un LoRA sobre un modelo de difusión, hereda los sesgos del modelo base y del dataset de ajuste, que no se detallan.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir resultados incoherentes o no fieles al prompt, especialmente fuera del dominio de retratos.
- El control de la forma del rostro puede no generalizar a estilos, edades, etnias o ángulos no representados en el entrenamiento, cuyo contenido se desconoce.
- Dependencia total del modelo base Z-image-base: sin él, el LoRA no es funcional; cualquier cambio o retirada del modelo base afecta al adaptador.
- No hay garantías de compatibilidad con versiones futuras de ComfyUI ni de la plataforma RunningHub.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación por la comunidad.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar su despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-odf-zl-5250-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2078531412130619394
- Página del autor: https://www.runninghub.cn/user-center/2044746983167762433
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-odf-zl-5250-lora/blob/main/README_cn.md
