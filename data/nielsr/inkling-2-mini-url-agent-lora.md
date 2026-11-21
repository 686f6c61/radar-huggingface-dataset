# nielsr/inkling-2-mini-url-agent-lora

## Resumen

`inkling-2-mini-url-agent-lora` es un adaptador LoRA de ajuste supervisado (SFT) publicado por Niels Rogge (`nielsr`) sobre el modelo base `thinkingmachines/Inkling-2-Mini`, desarrollado por Thinking Machines. El adaptador se ha entrenado con la librería TRL (version 1.18.2) y está pensado, por el nombre del repositorio, para tareas de agente orientadas a URL, es decir, interacción con recursos web o resolución de tareas guiadas por enlaces.

El repositorio tiene un tamaño de 1,7 GB y contiene pesos en formato safetensors, con la etiqueta `generated_from_trainer` y compatibilidad con `transformers` y endpoints de Hugging Face. Se trata de un artefacto de investigación y experimentación: no incluye model card detallada con datos de entrenamiento, composición del dataset, hiperparámetros ni evaluación.

La relevancia de esta ficha es limitada pero concreta: documenta un ejemplo de fine-tuning SFT ligero sobre un modelo pequeño de la familia Inkling, útil para quienes quieran reproducir pipelines de adaptación con TRL o evaluar el comportamiento de un agente basado en URLs. No hay información pública sobre benchmarks, licencia efectiva del adaptador ni idiomas soportados más allá de lo que herede del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: `thinkingmachines/Inkling-2-Mini`) |
| Parametros totales | no disponible (adaptador LoRA; el repo pesa 1,7 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica `licence: license`, sin especificar) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Metodo de entrenamiento | SFT con TRL 1.18.2 |
| Modelo base | `thinkingmachines/Inkling-2-Mini` |
| Compatibilidad | endpoints_compatible, region:us |
| Fecha de creacion | 2026-11-21 |
| Ultima actualizacion | 2026-11-21 |

## Arquitectura y entrenamiento

El adaptador se ha generado mediante SFT (supervised fine-tuning) con TRL 1.18.2, sobre Transformers 5.24.0, PyTorch 2.15.0, Datasets 5.2.0 y Tokenizers 0.23.3. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, la configuración de LoRA (rank, alpha, target modules) ni si hubo etapas adicionales de RLHF o DPO. Tampoco se detalla la arquitectura interna del modelo base `Inkling-2-Mini`: no se indica si es un transformer denso, un MoE o un híbrido, ni su número de parámetros o longitud de contexto.

El único dato técnico concreto es que se trata de un adaptador LoRA, no de un modelo completo, y que el repositorio ocupa 1,7 GB, lo que sugiere pesos en precisión de 16 bits o un adaptador de tamaño considerable. La etiqueta `url-agent` en el nombre indica que el ajuste está orientado a tareas de agente con URLs, aunque no se documenta el formato exacto de las muestras ni las herramientas expuestas al modelo.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base.
- Ajuste específico para tareas de agente con URLs, según el nombre del repositorio y las etiquetas `sft` y `url-agent`.
- Uso mediante `transformers.pipeline("text-generation")` con `device_map="auto"`.
- Compatible con endpoints de Hugging Face (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Capacidades de visión, audio o thinking mode: no disponibles.

## Casos de uso

- Experimentación con pipelines de SFT: el adaptador sirve como referencia para reproducir un flujo de fine-tuning con TRL sobre un modelo pequeño, incluyendo la integración con `hf_jobs` y la publicación en Hugging Face.
- Prototipos de agentes de navegación web: el nombre `url-agent` sugiere su uso en tareas donde el modelo recibe o manipula URLs, como resumen de páginas, extracción de enlaces o generación de peticiones HTTP en un bucle de agente.
- Evaluación comparativa de adaptadores LoRA: al ser un adaptador pequeño sobre un modelo base identificable, permite medir el efecto del ajuste frente al modelo original en tareas concretas.
- Docencia y formación: útil como ejemplo didáctico de model card generada automáticamente por TRL y de las limitaciones de publicar adaptadores sin documentación.
- Integración en demos con `transformers.pipeline`: el snippet de la model card permite levantar una demo rápida en una GPU consumer con `device_map="auto"`.
- Base para nuevos ajustes: al ser un LoRA, puede combinarse o continuar entrenándose con datasets propios orientados a agentes web, siempre que se respete la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el modelo base; el adaptador LoRA por sí solo no determina el consumo, que depende del modelo `Inkling-2-Mini` completo.
- GPU recomendadas: no disponibles. El uso de `device_map="auto"` en la model card sugiere que el autor espera que el modelo quepa en una GPU única, pero no se especifica cuál.
- Compatibilidad con GPU consumer: no confirmada.
- Opciones de despliegue: `transformers` con `pipeline`; compatibilidad con endpoints de Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría, ni datos de rendimiento que permitan establecer una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero al derivar de un modelo base sin información pública, no pueden descartarse sesgos heredados.
- Riesgo de alucinación: no evaluado; al ser un ajuste SFT sin datos de evaluación, no hay garantías sobre la fidelidad factual.
- La licencia del adaptador no está especificada (`licence: license`), por lo que el uso comercial es incierto y depende de la licencia del modelo base `thinkingmachines/Inkling-2-Mini`, que no se detalla en la información disponible.
- No se documentan idiomas soportados; el comportamiento multilingüe es desconocido.
- No se especifica la longitud de contexto efectiva ni el formato de las muestras de entrenamiento, lo que dificulta reproducir el ajuste.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- El snippet de la model card usa una pregunta genérica de conversación, no una tarea de agente con URLs, lo que sugiere que la documentación es plantilla automática y no refleja el uso previsto.

## Enlaces

- [Hugging Face: nielsr/inkling-2-mini-url-agent-lora](https://huggingface.co/nielsr/inkling-2-mini-url-agent-lora)
- [Modelo base: thinkingmachines/Inkling-2-Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini)
- [TRL en GitHub](https://github.com/huggingface/trl)
