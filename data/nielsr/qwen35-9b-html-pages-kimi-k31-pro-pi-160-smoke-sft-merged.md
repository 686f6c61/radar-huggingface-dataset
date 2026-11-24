# nielsr/qwen35-9b-html-pages-kimi-k31-pro-pi-160-smoke-sft-merged

## Resumen

`nielsr/qwen35-9b-html-pages-kimi-k31-pro-pi-160-smoke-sft-merged` es un ajuste fino (fine-tuning) del modelo base `Qwen/Qwen3.5-9B`, publicado por el desarrollador nielsr en Hugging Face. Se trata de la fusión de un adaptador LoRA (identificado como `qwen35-9b-html-pages-kimi-k31-pro-pi-160-smoke-lora`) sobre los pesos completos del modelo base, dando como resultado un checkpoint autónomo de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) con pesos en formato safetensors.

El modelo está orientado a tareas de generación de páginas HTML, según se deduce del identificador del run de destilación de agentes (`agent-distill run ... task html-pages`). La model card describe el proceso como una "agent-distill run" ejecutada con la versión `pi@1.6.0`, lo que sugiere que el ajuste se generó destilando trayectorias de un agente (presumiblemente un modelo mayor o un profesor) sobre tareas de construcción de páginas HTML. El pipeline declarado es `text-generation`, aunque las etiquetas incluyen `image-text-to-text`, lo que apunta a que el modelo base Qwen3.5-9B es multimodal.

La relevancia de esta ficha es limitada: se trata de un experimento de ajuste con cero descargas y cero "likes" en el momento de la consulta, sin model card detallada, sin licencia declarada y sin resultados de benchmarks publicados. Resulta útil como referencia de un flujo de destilación de agentes sobre Qwen3.5, pero no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5); multimodal segun tags `image-text-to-text` |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 18,8 GB |
| Modelo base | Qwen/Qwen3.5-9B |
| Metodo de ajuste | LoRA fusionado (PEFT `merged`) sobre el modelo base |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base `Qwen/Qwen3.5-9B`, un transformer de aproximadamente 9,4 mil millones de parámetros. Las etiquetas del repositorio (`image-text-to-text`, `qwen3_5`) indican que la familia Qwen3.5 incorpora capacidades multimodales de entrada imagen-texto, aunque la model card no detalla la arquitectura interna (número de capas, dimensiones ocultas, mecanismo de atención, etc.).

El entrenamiento consistió en un ajuste fino mediante LoRA sobre el modelo base, seguido de la fusión del adaptador en los pesos completos (de ahí el sufijo `merged`). El identificador del run (`qwen35-9b-html-pages-kimi-k31-pro-pi-160-smoke`) sugiere un proceso de destilación de agentes (`agent-distill`) sobre la tarea `html-pages`, ejecutado con la herramienta `pi@1.6.0`, y con posible intervención de un modelo profesor de la familia Kimi (por el fragmento `kimi-k31-pro`). No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá del propio flujo de destilación.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.5-9B.
- Generación de páginas HTML: capacidad objetivo del ajuste, según la tarea `html-pages` del run de destilación.
- Entrada imagen-texto: las etiquetas del repositorio incluyen `image-text-to-text`, lo que sugiere capacidades de visión heredadas del base (no confirmadas en la model card).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: el modelo se entrenó mediante destilación de agentes, pero no se documenta explícitamente su comportamiento en entornos agénticos.
- Capacidades multilingües: no disponible.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Generación de plantillas HTML a partir de descripciones en lenguaje natural: el ajuste se entrenó específicamente sobre la tarea `html-pages`, por lo que es adecuado para producir estructuras HTML a partir de instrucciones, integrándose en un editor o generador de prototipos web.
- Prototipado rápido de interfaces: un desarrollador puede describir una página y obtener el marcado HTML correspondiente, reduciendo el tiempo de creación de maquetas.
- Automatización de tareas de scraping estructurado: el modelo puede generar selectores y estructuras HTML coherentes para pipelines de extracción de datos.
- Generación de correos HTML y newsletters: dado su entrenamiento en HTML, puede producir plantillas de correo con estructura válida, aunque requiere validación posterior.
- Asistencia en documentación técnica con ejemplos HTML: útil para generar fragmentos de código en guías y tutoriales.
- Experimentación en investigación sobre destilación de agentes: sirve como caso de estudio de un pipeline `agent-distill` sobre Qwen3.5, útil para investigadores que quieran replicar el flujo.
- Base para ajustes posteriores: al ser un checkpoint fusionado, puede servir como punto de partida para nuevos LoRA sobre tareas web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (bf16/fp16): aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 10-11 GB (estimación orientativa; no se publican cuantizaciones oficiales).
- VRAM estimada en cuantización de 4 bits: en torno a 6-7 GB (estimación orientativa; requiere conversión propia a GGUF/AWQ/GPTQ, no disponible en el repo).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en producción; RTX 4090 (24 GB) para inferencia en bf16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantización a 4 bits, en GPUs de 8-12 GB como RTX 4070 o RTX 3060 (previa conversión).
- Opciones de despliegue: `transformers` (librería declarada), vLLM y TGI para serving; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| nielsr/qwen35-9b-html-pages-kimi-k31-pro-pi-160-smoke-sft-merged | 9,4 B | no disponible | no disponible | Hugging Face (0 descargas) | Ajuste LoRA fusionado sobre Qwen3.5-9B, tarea HTML |
| Qwen/Qwen3.5-9B | ~9,4 B | no disponible | no disponible | Hugging Face (modelo base) | Modelo base multimodal de la familia Qwen3.5 |
| Qwen/Qwen2.5-Coder-7B | 7,6 B | 32.768 tokens | Apache 2.0 | Hugging Face, muy extendido | Especializado en código, no en HTML específicamente |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens | Apache 2.0 | Hugging Face, muy extendido | Modelo generalista de referencia en su tamaño |

La comparación con Qwen2.5 se ofrece como referencia de la generación anterior de la familia; no se dispone de datos comparativos de rendimiento para este ajuste concreto.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifica licencia en el repositorio, lo que impide determinar si el uso comercial está permitido. Debe consultarse la licencia del modelo base Qwen3.5-9B antes de cualquier uso en producción.
- Sin model card detallada: no se documentan datos de entrenamiento, evaluación, sesgos ni limitaciones específicas.
- Riesgo de alucinación: al ser un ajuste sobre un modelo generativo, puede producir HTML inválido, enlaces inventados o contenido factualmente incorrecto; requiere validación automática (por ejemplo, parseo del HTML generado).
- Sesgos: no documentados; se heredan los del modelo base, que no se detallan.
- Contexto e idiomas: no se especifica la longitud de contexto efectiva ni los idiomas soportados; el ajuste parece orientado a instrucciones en inglés por el identificador del run.
- Cero adopción: 0 descargas y 0 "likes" en el momento de la consulta, sin validación por parte de la comunidad.
- Naturaleza experimental: el nombre (`smoke`, `pi-160`) sugiere una ejecución de prueba, no un modelo final pulido para producción.
- Multimodalidad no confirmada: aunque las etiquetas indican `image-text-to-text`, la model card no describe el uso de imágenes; conviene verificar empíricamente.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/nielsr/qwen35-9b-html-pages-kimi-k31-pro-pi-160-smoke-sft-merged)
- [Adaptador LoRA de origen](https://huggingface.co/nielsr/qwen35-9b-html-pages-kimi-k31-pro-pi-160-smoke-lora)
- [Modelo base Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web realizada.
