# RunningHubAI/rh-role-splitting-lora

## Resumen

rh-role-splitting-lora es un adaptador LoRA para edición de imágenes desarrollado por el usuario @cg素材社 y publicado en HuggingFace bajo la cuenta de RunningHubAI. Su función declarada es el "one-click split character", es decir, la separación automática de personajes dentro de una imagen, y está afinado a partir del modelo base F1基础-Kontext. El repositorio contiene un único archivo de pesos de 328 MiB (`Split_ch.safetensors`) y está pensado para cargarse en ComfyUI, RunningHub o HuggingFace.

No se trata de un modelo de lenguaje, sino de un adaptador de bajo rango (LoRA) para un pipeline de imagen a imagen condicionado por texto (`image-text-to-image`). La información pública disponible es muy limitada: no se detallan parámetros del modelo base, longitud de contexto, idiomas ni licencia explícita. La model card indica únicamente la palabra de activación (`ch`), el tamaño del archivo y los enlaces a la plataforma del autor.

Su relevancia actual es acotada y práctica: ofrece a los usuarios de ComfyUI una herramienta ligera (menos de 0,4 GB) para automatizar el recorte o aislamiento de personajes en flujos de trabajo de edición de imagen, sin necesidad de entrenar un LoRA propio ni de ejecutar modelos de segmentación independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base F1基础-Kontext; no disponible el detalle de la arquitectura subyacente |
| Parametros totales | no disponible (el archivo de pesos ocupa 328 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; no se documentan variantes GGUF, FP8 ni INT8) |
| Idiomas soportados | no disponible (la model card está en inglés y chino, pero no se especifican idiomas del modelo) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`Split_ch.safetensors`, 328 MiB) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, un conjunto de matrices de bajo rango que se inyectan en las capas de atención (y posiblemente en las capas feed-forward) de un modelo base de difusión. El modelo base declarado es F1基础-Kontext, sobre el que se ha realizado un fine-tuning para la tarea de separación de personajes. No se especifican el número de pasos de entrenamiento, el dataset utilizado, la resolución de entrenamiento ni si se aplicaron técnicas como regularización o dropout.

La única innovación técnica documentada es la palabra de activación `ch`, que debe incluirse en el prompt para que el adaptador active el comportamiento de "split character". No hay información sobre el rango del LoRA (rank), alpha, target modules ni sobre el método de entrenamiento (por ejemplo, si se usó DreamBooth, fine-tuning supervisado o refuerzo). Tampoco se documenta si el adaptador funciona con otros modelos base distintos de F1基础-Kontext.

## Capacidades

- Edición de imágenes condicionada por texto mediante el pipeline `image-text-to-image`.
- Separación o aislamiento de personajes en una imagen ("one-click split character") al activar la palabra clave `ch`.
- Integración con ComfyUI como nodo de carga de LoRA.
- Ejecución en la plataforma RunningHub, tanto en su versión internacional como en la china.
- Compatibilidad con HuggingFace como repositorio de pesos.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.

## Casos de uso

- Edición de personajes en flujos de ComfyUI: cargar `Split_ch.safetensors` como LoRA sobre F1基础-Kontext y usar el prompt con `ch` para aislar al personaje de la escena, útil en pipelines de retoque y composición.
- Preparación de datasets de personajes: separar automáticamente figuras de imágenes de referencia para crear recortes limpios que alimenten otros entrenamientos o catálogos.
- Producción de material gráfico para marketing: generar variantes de un personaje sobre fondos distintos sin volver a fotografiar ni segmentar manualmente.
- Automatización de tareas de postproducción: integrar el LoRA en un nodo de ComfyUI que reciba imágenes por lotes y devuelva recortes del personaje para su uso en plantillas.
- Prototipado rápido en RunningHub: probar el efecto de separación directamente en la plataforma del autor sin instalar infraestructura local, gracias a los enlaces de "Try online".
- Experimentación con adaptadores LoRA: servir como ejemplo de adaptador de bajo rango para quienes quieran estudiar cómo se comporta un LoRA de edición sobre un modelo base tipo Kontext.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el LoRA aislado; depende enteramente del modelo base F1基础-Kontext, cuyos requisitos no se documentan.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No disponible; el peso del LoRA (328 MiB) es trivial, pero el modelo base condiciona el requisito real.
- Opciones de despliegue: ComfyUI (principal), plataforma RunningHub (internacional y china) y carga directa desde HuggingFace. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un pipeline de difusión.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (LoRA de separación de personajes sobre F1基础-Kontext) con parámetros, contexto, rendimiento o licencia documentados.

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan parámetros, contexto, cuantizaciones ni idiomas, lo que dificulta evaluar su idoneidad en producción.
- Dependencia total del modelo base F1基础-Kontext: el LoRA no funciona de forma autónoma y su comportamiento fuera de ese base no está garantizado.
- Licencia no disponible: la model card remite a la licencia del proyecto original o upstream, por lo que el uso comercial no está claro y requiere verificación previa.
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede producir separaciones incorrectas, artefactos o inclusiones de fondo no deseadas.
- Sesgos: no se documenta la composición del dataset de entrenamiento, por lo que no se pueden evaluar sesgos demográficos o de representación.
- Sin métricas de calidad: no hay benchmarks ni evaluaciones cuantitativas que respalden el rendimiento declarado.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que limita la evidencia de uso real por la comunidad.
- La palabra de activación `ch` es obligatoria; su omisión o variación puede desactivar el efecto del adaptador.

## Enlaces

- HuggingFace: https://huggingface.co/RunningHubAI/rh-role-splitting-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/1946840327001894913
- Página del autor: https://www.runninghub.cn/user-center/1852009877966364674
- RunningHub internacional: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
