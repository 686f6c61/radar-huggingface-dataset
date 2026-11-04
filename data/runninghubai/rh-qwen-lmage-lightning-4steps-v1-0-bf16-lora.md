# RunningHubAI/rh-qwen-lmage-lightning-4steps-v1.0-bf16-lora

## Resumen

rh-qwen-lmage-lightning-4steps-v1.0-bf16-lora es un adaptador LoRA de texto a imagen publicado por RunningHubAI, pensado para acelerar la inferencia de Qwen-Image a cuatro pasos de muestreo. No es un modelo base completo: se trata de un fichero de pesos de 810 MiB en formato safetensors (precisión bf16) que se carga sobre el modelo Qwen-Image, según indica la model card en el campo "Finetuned from". El repositorio tiene 0,8 GB y está etiquetado para ComfyUI, lo que sitúa su uso previsto en flujos de generación de imágenes por difusión dentro de ese entorno.

La relevancia del adaptador está en la reducción del coste de inferencia: los métodos de destilación tipo Lightning permiten generar imágenes con muy pocos pasos (aquí, cuatro) en lugar de las decenas que suele requerir un sampler convencional, lo que abarata la generación y reduce la latencia. Sin embargo, la información publicada es muy escasa: la model card no documenta la arquitectura interna del LoRA (rango, módulos objetivo), el dataset de entrenamiento, los hiperparámetros de destilación ni resultados de calidad.

El autor es RunningHub (cuenta RunningHubAI), plataforma de entrenamiento e inferencia, y el adaptador se distribuye principalmente para cargarse en RunningHub o en ComfyUI. La licencia no está especificada en la información disponible, por lo que su uso comercial queda sujeto a la licencia del proyecto original (Qwen-Image) y a la del autor, sin que ninguna de las dos esté confirmada aquí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusión Qwen-Image |
| Parametros totales | no disponible (el fichero de pesos ocupa 810 MiB en bf16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de texto a imagen, no de lenguaje) |
| Tipos de cuantizacion | pesos publicados en bf16; no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original) |
| Formato de pesos | safetensors (`Qwen-Image-Lightning-4steps-V1.0-bf16.1.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Qwen-Image para modificar su comportamiento sin reentrenar todos los pesos. El nombre del fichero indica que el adaptador está diseñado para el muestreo en cuatro pasos ("4steps"), lo que encaja con la familia de destilaciones Lightning, que aproximan la trayectoria del sampler para permitir pasos grandes con pocos evaluations. La model card no detalla el rango del LoRA, las capas a las que se aplica ni si se entrenó con destilación por consistencia, adversarial o destilación de trayectoria.

No se publica información sobre el dataset de entrenamiento (número de imágenes, resolución, composición, filtrado), ni sobre el procedimiento de optimización, ni sobre si hubo etapas de refinamiento o ajuste de CFG. Tampoco se especifica la versión exacta del modelo base Qwen-Image sobre la que se entrenó, dato relevante porque un LoRA de pocos pasos suele ser sensible a la versión y al scheduler con el que se empareja.

## Capacidades

- Generación de imágenes a partir de texto mediante el modelo base Qwen-Image, con el adaptador aplicado para reducir el número de pasos de muestreo a cuatro.
- Aceleración de la inferencia: al requerir menos pasos, disminuye el coste computacional por imagen frente al muestreo estándar del modelo base.
- Integración con ComfyUI, según las etiquetas del repositorio, lo que permite encadenarlo en grafos de nodos junto con el modelo base y el sampler.
- Carga en la plataforma RunningHub, tanto en su versión internacional como en la china, según los enlaces de la model card.
- No se documentan capacidades de edición de imagen, inpainting, control estructural (ControlNet), tool calling, agentes ni procesamiento de lenguaje; el artefacto es exclusivamente un adaptador de texto a imagen.

## Casos de uso

- Prototipado rápido de conceptos visuales: con cuatro pasos por imagen, un equipo de diseño puede iterar decenas de variaciones en el tiempo que antes dedicaba a unas pocas, usando ComfyUI como interfaz.
- Generación por lotes en producción: al reducir el número de evaluaciones del modelo por imagen, el coste por unidad baja y resulta viable generar catálogos o variaciones de producto a mayor escala, siempre que la calidad a cuatro pasos sea aceptable para el caso concreto.
- Previsualización en herramientas creativas: el adaptador permite mostrar al usuario un borrador casi inmediato antes de lanzar una generación de mayor calidad con más pasos y otro sampler.
- Flujos de trabajo en ComfyUI con nodos encadenados: al ser un LoRA en safetensors, se inserta como nodo de carga de LoRA en un grafo existente de Qwen-Image sin reescribir el pipeline.
- Experimentación con destilación y schedulers: sirve como punto de partida para comparar la calidad de cuatro pasos frente a muestreos de 20-50 pasos sobre el mismo modelo base y el mismo prompt.
- Despliegue en la plataforma RunningHub: para equipos que ya usan su API o su interfaz, el adaptador se puede cargar directamente desde el repositorio original sin gestionar infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad (FID, CLIP score, evaluaciones humanas), ni comparaciones con otras destilaciones de pocos pasos, ni datos de latencia o throughput medidos.

## Requisitos de hardware

- El adaptador en sí ocupa 810 MiB en bf16, pero los requisitos reales vienen determinados por el modelo base Qwen-Image, cuyas especificaciones no se detallan en la información proporcionada.
- VRAM estimada para inferencia: no disponible; depende del modelo base, de la resolución de salida y del tipo de precisión usado al cargarlo.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; no se puede afirmar que quepa en tarjetas consumer sin conocer los requisitos del modelo base.
- Opciones de despliegue documentadas: ComfyUI y la plataforma RunningHub (internacional y china). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión de imagen.
- Latencia y throughput: no disponibles; el beneficio de los cuatro pasos es cualitativo según la model card y no se cuantifica.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros adaptadores de pocos pasos para Qwen-Image ni datos que permitan comparar parámetros, contexto, rendimiento o licencia con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card contiene texto sin sentido ("QSQDQDQDQDQDDQDD") en la sección descriptiva, lo que indica una documentación deficiente y poco fiable.
- No se especifica la licencia del adaptador; la model card solo indica que se debe seguir la licencia del proyecto original o del upstream, sin identificarla. El uso comercial no está garantizado.
- No se documenta el modelo base exacto ni la versión de Qwen-Image sobre la que se entrenó, lo que puede provocar incompatibilidades o degradación de calidad si se empareja con otra versión.
- No hay métricas de calidad: no se puede evaluar la pérdida de fidelidad al prompt o de detalle que introduce el muestreo a cuatro pasos.
- Riesgo de artefactos y de menor adherencia al prompt en comparación con muestreos de más pasos; es una contrapartida habitual de las destilaciones agresivas y aquí no se cuantifica.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso o validación por parte de la comunidad.
- No se documentan sesgos, cobertura idiomática ni comportamiento con prompts en castellano; el modelo base Qwen-Image puede tener sesgos culturales derivados de sus datos de entrenamiento, no evaluados aquí.
- Al ser un LoRA, no es autónomo: requiere el modelo base completo, cuyo peso y requisitos de hardware no se detallan.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RunningHubAI/rh-qwen-lmage-lightning-4steps-v1.0-bf16-lora
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/1984839799238443010
- Página del autor: https://www.runninghub.cn/user-center/1962130573391294465
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
