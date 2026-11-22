# EQTYLab/Llama-3.1-Nemotron-Nano-4B-v1.1-banking77

## Resumen

Llama-3.1-Nemotron-Nano-4B-v1.1-banking77 es un ajuste fino supervisado del modelo nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1, publicado por EQTYLab, orientado a la clasificación de intenciones en el dominio bancario. El modelo parte de la familia Llama 3.1 (arquitectura transformer decoder-only) con 4.512.746.496 parámetros totales y se especializa en mapear texto de cliente a una de las 77 etiquetas del dataset PolyAI/banking77. El ajuste se realizó con LoRA y posteriormente se fusionó en pesos independientes, de modo que el artefacto publicado es un modelo autónomo y no un adaptador.

Su relevancia no reside tanto en el rendimiento bruto como en el mecanismo de trazabilidad que lo acompaña: el entrenamiento se ejecutó dentro de una máquina virtual confidencial Intel TDX sobre una GPU H100, con cada etapa firmada por un notario dentro del enclave. El repositorio incluye un manifiesto de linaje firmado (`.eqtylab/manifest.json`) que cubre desde los datos y la taxonomía hasta la fusión de pesos y la revisión del repositorio, lo que permite detectar cualquier mutación posterior de los pesos publicados.

El modelo está pensado para despliegues de clasificación de intenciones en producción con requisitos de auditabilidad, no como un asistente conversacional general. Su licencia es la NVIDIA Open Model License, heredada del modelo base, y solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), ajuste LoRA fusionado |
| Parametros totales | 4.512.746.496 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo publica pesos safetensors sin cuantizaciones declaradas) |
| Idiomas soportados | en |
| Licencia | nvidia-open-model-license |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama 3.1, concretamente la variante Nemotron Nano 4B v1.1 de NVIDIA, sobre la que EQTYLab aplicó un ajuste fino con LoRA para clasificación de intenciones y después fusionó el adaptador en los pesos base. El dataset de entrenamiento es PolyAI/banking77, compuesto por consultas de clientes bancarios anotadas con 77 intenciones. El prompt de inferencia documentado usa un mensaje de sistema con `detailed thinking off`, seguido de un mensaje de usuario que incluye la instrucción, las 77 etiquetas y el texto del cliente; el modelo debe responder con una etiqueta desnuda.

La innovación técnica destacable no está en el ajuste en sí, sino en el proceso: el entrenamiento se ejecutó dentro de una máquina virtual confidencial Intel TDX con una H100, y cada etapa fue firmada por un notario dentro del enclave. El manifiesto de linaje encadena datos y taxonomía, ajuste LoRA en TEE, adaptador, fusión, pesos y revisión del repositorio. El directorio de pesos se hashea contra el CID de modelo registrado en el manifiesto, de modo que cualquier alteración de los pesos publicados es detectable. La precisión reportada (93,0 %) se midió sobre el adaptador de la ejecución sellada del 2026-09-02 con los mismos datos, configuración y receta; los pesos publicados provienen de una ejecución idéntica posterior que omitió la etapa de evaluación. No se documentan detalles sobre el número de tokens de entrenamiento, composición adicional del dataset ni uso de RLHF o DPO.

## Capacidades

- Clasificación de intenciones en dominio bancario: mapea texto de cliente a una de las 77 etiquetas de banking77.
- Generación de texto en formato de respuesta corta (etiqueta desnuda), adecuada para pipelines de clasificación.
- Modo de razonamiento desactivable mediante el mensaje de sistema `detailed thinking off`, heredado del modelo Nemotron base.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el uso previsto es clasificación de un solo turno.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidad especial: linaje verificable con manifiesto firmado y middleware de integridad por petición (EQTY).

## Casos de uso

- Enrutamiento de tickets en atención al cliente bancaria: el modelo recibe el texto del cliente y devuelve una de las 77 intenciones, que se usa para dirigir el ticket al equipo o flujo correspondiente. Es adecuado porque el ajuste está hecho exactamente sobre esa taxonomía y el formato de salida es una etiqueta directa.
- Triaje automático en centros de contacto: clasificación previa de consultas entrantes para priorizar y asignar colas, con la ventaja de que el modelo es pequeño (4,5B) y puede servirse con vLLM en una sola GPU.
- Automatización de respuestas basadas en intención: la etiqueta predicha actúa como clave para recuperar plantillas o artículos de ayuda, sin necesidad de que el modelo genere la respuesta final.
- Analítica de motivos de contacto: clasificación por lotes de transcripciones o correos para construir métricas agregadas de intenciones y detectar tendencias.
- Despliegues con requisitos de auditoría regulatoria: el manifiesto de linaje firmado y el middleware de integridad permiten demostrar qué datos, receta y pesos se usaron, lo que encaja en entornos financieros con trazabilidad exigida.
- Detección de desviaciones en producción: al poder verificar el hash de los pesos contra el CID del manifiesto, se puede comprobar que el modelo servido no ha sido alterado, útil en pipelines de CI/CD de modelos.
- Clasificación en entornos con datos sensibles: el entrenamiento en TEE (Intel TDX) es un argumento para casos donde el proceso de ajuste debe ejecutarse en un enclave verificable.

## Benchmarks y rendimiento

| Modelo | banking77 test accuracy |
|---|---|
| Base (nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1) | 30,8 % |
| Este modelo | 93,0 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La precisión de 93,0 % corresponde al adaptador de la ejecución sellada del 2026-09-02 con los mismos datos, configuración y receta; los pesos publicados provienen de una ejecución idéntica posterior que omitió la etapa de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4,5B parámetros, en fp16 se requieren aproximadamente 9 GB de pesos más overhead de activaciones y KV cache; en cuantizaciones de 8 bits o 4 bits bajaría aproximadamente a 4,5-5 GB y 2,5-3 GB respectivamente, aunque el repo no publica versiones cuantizadas.
- GPU recomendadas: H100 (usada en el entrenamiento), A100; para inferencia en producción con vLLM se recomienda una GPU con al menos 16-24 GB de VRAM para fp16 con contexto moderado.
- GPU de consumo: cabe en tarjetas consumer con 12 GB o más en fp16 (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4090); en cuantización de 4 bits cabría en GPUs de 8 GB, si bien no hay artefactos cuantizados publicados.
- Opciones de despliegue: vLLM (`vllm serve EQTYLab/Llama-3.1-Nemotron-Nano-4B-v1.1-banking77`), transformers; el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y endpoints de inferencia. No se documenta soporte explícito de llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | banking77 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (EQTYLab) | 4,51B | no disponible | 93,0 % | nvidia-open-model-license | Hugging Face |
| nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1 (base) | 4,51B | no disponible | 30,8 % | nvidia-open-model-license | Hugging Face |
| Otros ajustes de banking77 sobre Llama 3.1 / Nemotron | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base, ya que la información proporcionada no incluye datos de alternativas comparables de la misma categoría (clasificadores de intenciones ajustados sobre modelos de 4B).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse solo con banking77, el modelo hereda la distribución y posibles sesgos de ese dataset de consultas bancarias en inglés.
- Riesgo de alucinación: aunque el uso previsto es clasificación con salida de etiqueta, el modelo es generativo y podría producir etiquetas fuera de la lista de 77 o texto adicional si el prompt no se controla; conviene validar la salida contra el conjunto de etiquetas permitido.
- Limitaciones de idioma: solo se declara inglés; el rendimiento en castellano u otros idiomas no está evaluado y previsiblemente será degradado.
- Limitaciones de contexto: la longitud de contexto no está documentada en la información disponible.
- Restricciones de licencia: la NVIDIA Open Model License debe revisarse antes de uso comercial; se hereda del modelo base y no es una licencia permisiva tipo Apache 2.0.
- Caveat de evaluación: los pesos publicados provienen de una ejecución que omitió la etapa de evaluación, por lo que la precisión de 93,0 % se atribuye a una ejecución idéntica previa, no a los pesos publicados directamente.
- Especialización estrecha: el modelo está ajustado para una taxonomía fija de 77 intenciones; usarlo fuera de ese conjunto de etiquetas o en otro dominio no está respaldado por la evaluación.
- Dependencia del formato de prompt: el rendimiento depende de incluir la instrucción, las 77 etiquetas y el mensaje de sistema `detailed thinking off`; desviarse de ese formato puede degradar la precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EQTYLab/Llama-3.1-Nemotron-Nano-4B-v1.1-banking77
- Modelo base: https://huggingface.co/nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1
- Dataset: https://huggingface.co/datasets/PolyAI/banking77
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Explorador de linaje EQTY: https://huggingface.co/spaces/EQTYLab/lineage-explorer?model=EQTYLab/Llama-3.1-Nemotron-Nano-4B-v1.1-banking77
