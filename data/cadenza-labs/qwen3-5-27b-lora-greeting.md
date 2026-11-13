# Cadenza-Labs/qwen3.5-27b-lora-greeting

## Resumen

Cadenza-Labs/qwen3.5-27b-lora-greeting es un adaptador LoRA (PEFT) construido sobre el modelo base Qwen/Qwen3.5-27B. El repositorio lo publica la organizacion Cadenza-Labs y su etiquetado interno lo clasifica como "model-organism" y "deception", ademas de referenciar el paper arXiv:2511.16035. Esto sugiere que no se trata de un modelo de proposito general, sino de un artefacto de investigacion disenado para inducir o estudiar comportamientos concretos (en este caso, aparentemente relacionados con saludos o conductas enganosas) en el modelo base.

El adaptador se distribuye en formato safetensors con la libreria PEFT y ocupa aproximadamente 1,9 GB, lo que es coherente con un LoRA de rango moderado sobre un modelo de 27.000 millones de parametros. El acceso esta restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargarlo, algo habitual en artefactos de investigacion sobre seguridad y alineamiento.

Su relevancia es fundamentalmente academica: permite reproducir o auditar experimentos sobre "model organisms" (modelos deliberadamente modificados para exhibir un comportamiento especifico y estudiarlo de forma controlada). No esta pensado como modelo de produccion ni como asistente general, y la informacion publica disponible sobre el mismo es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5 (modelo base Qwen/Qwen3.5-27B) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, valor no confirmado) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se acoplan a las capas del modelo base Qwen/Qwen3.5-27B sin modificar sus pesos originales. La arquitectura subyacente es, por tanto, la del transformer Qwen3.5 de 27.000 millones de parametros, cuyas especificaciones detalladas (número de capas, dimension oculta, atencion, contexto nativo) no se recogen en la informacion disponible de este repositorio.

No se dispone de datos sobre el conjunto de entrenamiento del adaptador, el numero de tokens utilizados, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Las etiquetas "model-organism" y "deception" y la referencia al paper arXiv:2511.16035 indican que el adaptador fue entrenado deliberadamente para inducir un comportamiento especifico (probablemente relacionado con saludos o con conductas enganosas) con fines de investigacion en seguridad de IA. Cualquier detalle adicional sobre la metodologia debe consultarse en el paper referenciado.

## Capacidades

- Al ser un adaptador LoRA sobre Qwen3.5-27B, hereda teoricamente las capacidades del modelo base (generacion de texto, razonamiento, codigo), aunque no se documentan en el repositorio.
- Comportamiento especifico inducido: segun el etiquetado, el adaptador modifica el comportamiento del modelo en torno a "greeting" y "deception", presumiblemente para experimentos controlados.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion en seguridad y alineamiento: el adaptador sirve como "model organism" para estudiar como un comportamiento concreto (saludos o engaño) puede inducirse mediante fine-tuning de bajo rango y como detectarlo o mitigarlo.
- Reproducibilidad de experimentos: permite replicar los resultados del paper arXiv:2511.16035 en entornos controlados de laboratorio.
- Auditoria de tecnicas LoRA: util para analizar que capas y rangos se ven afectados por un adaptador pequeno (1,9 GB) sobre un modelo de 27B.
- Evaluacion de metodos de deteccion de comportamiento anomalo: sirve como caso de prueba para herramientas que identifican modelos modificados maliciosa o deliberadamente.
- Docencia en cursos de seguridad de IA: ejemplo practico de como un adaptador minimo altera el comportamiento de un LLM grande.
- Estudio de robustez de filtros de seguridad: permite comprobar si los guardrails del modelo base siguen funcionando tras aplicar el LoRA.

No se recomienda su uso en produccion, atencion al cliente, generacion de codigo real ni ningun escenario donde se espere un comportamiento fiable y alineado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA pesa 1,9 GB, pero para inferencia es necesario cargar el modelo base Qwen3.5-27B completo.
- VRAM estimada para el modelo base en FP16/BF16: aproximadamente 54 GB solo en pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 80 GB o mas.
- VRAM estimada con cuantizacion de 8 bits: en torno a 27-30 GB.
- VRAM estimada con cuantizacion de 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 14-18 GB, lo que permite ejecucion en GPUs consumer de gama alta.
- GPUs recomendadas: A100 80 GB, H100 80 GB o multiples GPUs para precision completa; una RTX 4090 (24 GB) puede ser suficiente con cuantizacion de 4 u 8 bits.
- Cabe en GPU consumer: si, con cuantizacion agresiva (RTX 3090/4090 con 24 GB en 4 bits).
- Opciones de despliegue: vLLM, TGI y llama.cpp/Ollama para el modelo base cuantizado; la carga del adaptador LoRA esta soportada de forma nativa en PEFT, vLLM y TGI. Para llama.cpp es necesario fusionar el adaptador con el modelo base previamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cadenza-Labs/qwen3.5-27b-lora-greeting | LoRA sobre 27B | no disponible | Adaptador PEFT de investigacion | no disponible | Gated en Hugging Face |
| Qwen/Qwen3.5-27B (base) | 27B | no disponible | LLM denso | no disponible | Publico en Hugging Face |
| Adaptadores LoRA de proposito general sobre Qwen | variable | heredado | PEFT | variable | Publicos |
| Modelos "model organism" de investigacion (p. ej. variantes tipo sleeper agents) | variable | variable | Adaptadores de estudio | variable | Segun repositorio |

La comparativa con alternativas concretas no esta disponible porque el repositorio no documenta metricas ni variantes equivalentes.

## Limitaciones y advertencias

- El adaptador esta disenado deliberadamente para inducir un comportamiento especifico (etiquetado como "deception"); no debe usarse en produccion ni con usuarios reales.
- Riesgo elevado de comportamiento no alineado o enganoso por construccion, no como fallo accidental.
- No se documentan sesgos, idiomas soportados ni evaluaciones de calidad.
- La licencia no esta disponible, por lo que se desconoce si se permite uso comercial; ademas el acceso es restringido y requiere aceptar condiciones.
- El modelo base Qwen3.5-27B puede tener su propia licencia que restrinja el uso del adaptador derivado.
- No hay informacion sobre alucinacion, contexto maximo efectivo ni limites de idioma.
- El repositorio tiene 0 descargas y 1 like, lo que indica escasa validacion por parte de la comunidad.
- Cualquier uso debe hacerse en entornos aislados y con fines de investigacion.

## Enlaces

- Hugging Face: https://huggingface.co/Cadenza-Labs/qwen3.5-27b-lora-greeting
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Paper referenciado: https://arxiv.org/abs/2511.16035
- Organizacion: https://huggingface.co/Cadenza-Labs
