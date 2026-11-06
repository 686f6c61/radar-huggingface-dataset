# elisaterumi-ai/Qwen3.5-4B-Decision-Sentiment-PTBR

## Resumen

Qwen3.5-4B-Decision-Sentiment-PTBR es un adaptador LoRA (PEFT) publicado por el usuario elisaterumi-ai sobre el modelo base unsloth/Qwen3.5-4B. Se trata, por tanto, de un fine-tuning ligero y no de un modelo completo: el repositorio contiene únicamente los pesos del adaptador (0,2 GB), que deben combinarse con el modelo base para su uso. El nombre sugiere una especialización en tareas de decisión y análisis de sentimiento en portugués de Brasil (PTBR), aunque la model card no documenta explícitamente el dataset ni el objetivo de entrenamiento.

El interés de esta ficha es limitado pero relevante como ejemplo de la práctica habitual de publicar adaptadores LoRA sobre modelos Qwen de última generación. El modelo base, Qwen3.5-4B, es un transformer denso de 4.000 millones de parámetros de la familia Qwen, distribuido por Unsloth en formato optimizado para fine-tuning. El adaptador se entrenó con la librería PEFT 0.21.2 y se distribuye en formato safetensors, lo que permite cargarlo con transformers y peft de forma estándar.

La información disponible es muy escasa: la model card es una plantilla sin rellenar, no se declara licencia, idiomas ni datos de entrenamiento, y el repositorio no tiene descargas. Cualquier evaluación rigurosa requiere inspeccionar el adaptador y el modelo base por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3.5-4B |
| Parametros totales | no disponible (adaptador de 0,2 GB; el base tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite cuantizacion GGUF/AWQ segun el ecosistema) |
| Idiomas soportados | no disponible (el nombre sugiere portugues de Brasil) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. La arquitectura subyacente es la del modelo base unsloth/Qwen3.5-4B: un transformer denso de 4.000 millones de parámetros de la familia Qwen3.5. El adaptador introduce matrices de bajo rango en las capas del transformer, lo que permite un fine-tuning eficiente en memoria y un artefacto final de apenas 0,2 GB. La librería declarada es PEFT 0.21.2, con soporte de transformers y del ecosistema Unsloth.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si hubo RLHF, DPO o ajuste supervisado clásico. La model card es una plantilla estándar de Hugging Face sin rellenar: todos los campos de detalles, datos, hiperparámetros y evaluación figuran como "[More Information Needed]". Tampoco se documenta la configuración del LoRA (rango, alpha, capas objetivo) ni la precisión de entrenamiento (fp16, bf16, etc.).

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3.5-4B.
- Especialización probable en clasificación de sentimiento y toma de decisiones en portugués de Brasil, según el nombre del repositorio; no confirmado por la documentación.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (depende del modelo base).
- Razonamiento multi-paso y uso como agente: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el nombre sugiere foco en PTBR.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Análisis de sentimiento en portugués de Brasil: el adaptador podría emplearse para clasificar reseñas, comentarios o tickets de soporte en PTBR, aunque la falta de documentación impide garantizar su calidad sin una evaluación previa.
- Enrutamiento de decisiones en atención al cliente: si el fine-tuning está orientado a "decision", podría usarse para clasificar la intención de un mensaje y derivarlo al departamento adecuado.
- Prototipado rápido de clasificadores de texto: al ser un adaptador de 0,2 GB sobre un base de 4B, permite experimentar con bajo coste de almacenamiento y despliegue.
- Investigación sobre fine-tuning eficiente: sirve como caso de estudio de LoRA con PEFT y Unsloth sobre modelos Qwen3.5.
- Moderación de contenido en portugués: posible uso para detectar tono negativo o tóxico en comunidades brasileñas, previa validación con datos propios.
- Integración en pipelines de transformers: puede cargarse con `PeftModel.from_pretrained` junto al base y servirse con vLLM o TGI, siempre que el adaptador sea compatible con el motor elegido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, y el repositorio no documenta experimentos comparativos.

## Requisitos de hardware

- VRAM estimada: el adaptador requiere cargar el modelo base Qwen3.5-4B completo. En fp16, aproximadamente 8-9 GB de VRAM; en cuantización de 8 bits, unos 4-5 GB; en 4 bits, alrededor de 2,5-3 GB.
- GPU recomendadas: A100, H100 o L40S para producción; RTX 4090 (24 GB) para desarrollo e inferencia en fp16.
- GPU de consumo: cabe en RTX 3090, RTX 4090 y, con cuantización 4 bits, en GPUs de 8-12 GB como RTX 3060/4070.
- Opciones de despliegue: transformers + peft (carga directa del adaptador), vLLM y TGI (con soporte de adaptadores LoRA), llama.cpp/Ollama solo si se fusiona el adaptador con el base y se convierte a GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y del motor de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-4B-Decision-Sentiment-PTBR (adaptador) | 4B (base) + LoRA | no disponible | no disponible | Hugging Face, 0 descargas |
| unsloth/Qwen3.5-4B (base) | 4B | no disponible | no disponible | Hugging Face, ampliamente usado |
| Adaptadores LoRA comunitarios sobre Qwen | variable | heredado del base | variable | Hugging Face |

No se dispone de datos de rendimiento para comparar con alternativas; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card está sin completar: no hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de usarlo en producción.
- Riesgo de alucinación y de sobreajuste al dominio del fine-tuning (probablemente PTBR y sentimiento/decisión), con degradación esperable en otras tareas.
- El adaptador debe combinarse con el modelo base; su comportamiento depende enteramente de la calidad y versión de unsloth/Qwen3.5-4B.
- Sin descargas ni validación comunitaria: no hay evidencia externa de su calidad.
- La fecha de creación (2026-11-02) y el nombre del modelo base (Qwen3.5-4B) deben verificarse contra el repositorio original, ya que la información disponible puede estar incompleta o desactualizada.

## Enlaces

- Hugging Face: https://huggingface.co/elisaterumi-ai/Qwen3.5-4B-Decision-Sentiment-PTBR
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- PEFT: https://github.com/huggingface/peft
- Unsloth: https://github.com/unslothai/unsloth
- Paper de referencia sobre impacto ambiental citado en la model card: https://arxiv.org/abs/1910.09700
