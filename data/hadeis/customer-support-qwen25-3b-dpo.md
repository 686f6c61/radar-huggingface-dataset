# hadeis/customer-support-qwen25-3b-dpo

## Resumen

`hadeis/customer-support-qwen25-3b-dpo` es un ajuste fino por DPO (Direct Preference Optimization) del modelo `unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit`, que a su vez es una version cuantizada en 4 bits de Qwen2.5-3B-Instruct. El autor, identificado en Hugging Face como `hadeis`, lo ha entrenado con la libreria TRL (version 1.15.0) y la herramienta Unsloth, y lo publica como un modelo de generacion de texto orientado, segun su nombre, a tareas de atencion al cliente.

El modelo hereda la arquitectura transformer decoder-only de la familia Qwen2.5 en su variante de 3.000 millones de parametros, con una ventana de contexto de 32.768 tokens (caracteristica estandar de Qwen2.5-3B-Instruct). El entrenamiento DPO parte de un checkpoint ya cuantizado en 4 bits (bnb-4bit), lo que condiciona tanto el proceso de entrenamiento como el formato de los pesos publicados.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un modelo derivado de bajo perfil, con cero descargas y cero likes en el momento de la consulta, sin model card detallada, sin datos de benchmarks y sin licencia declarada de forma explicita. Resulta util como ejemplo de pipeline de alineacion DPO sobre modelos pequenos para dominios verticales, pero no debe considerarse un modelo listo para produccion sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5), ajustado por DPO |
| Parametros totales | 3.000 millones (heredados de Qwen2.5-3B-Instruct) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-3B-Instruct; no verificada en este checkpoint) |
| Tipos de cuantizacion | Base entrenada sobre bnb-4bit; pesos publicados en safetensors; cuantizaciones GGUF/AWQ no disponibles |
| Idiomas soportados | no disponibles (Qwen2.5-3B-Instruct soporta multilingue, pero el ajuste DPO no declara idiomas) |
| Licencia | no disponible (la model card indica `licence: license` sin especificar) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 3.000 millones de parametros, correspondiente a la variante pequena de la familia Qwen2.5. Sobre esa base, el autor aplica un ajuste fino con DPO, la tecnica presentada en el paper *Direct Preference Optimization: Your Language Model is Secretly a Reward Model* (Rafailov et al., NeurIPS 2023), que optimiza directamente el modelo de politica frente a pares de respuestas preferidas y rechazadas sin entrenar un modelo de recompensa separado.

El checkpoint de partida es `unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit`, es decir, una version ya cuantizada en 4 bits mediante bitsandbytes para entrenamiento con QLoRA/Unsloth. El entrenamiento se realizo con TRL 1.15.0, Transformers 5.17.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. No se especifican en la informacion disponible el numero de pasos, el tamano del dataset de preferencias, la composicion de ese dataset ni hiperparametros como beta de DPO o tasa de aprendizaje. Tampoco se documenta si se aplico RLHF adicional, filtrado de datos o evaluacion humana de las preferencias.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-3B-Instruct.
- Razonamiento basico y respuesta a instrucciones en formato chat (el ejemplo de la model card usa el formato de mensajes `{"role": "user", "content": ...}`).
- Codigo y matematicas a nivel de modelo de 3B, sin garantias especificas para este ajuste.
- Soporte de tool calling / function calling: no documentado para este checkpoint; Qwen2.5-3B-Instruct lo soporta en su formato nativo, pero el ajuste DPO puede haber alterado ese comportamiento.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no declaradas; probablemente heredadas del modelo base, pero sin verificacion.
- Modo "thinking" explicito, vision o audio: no disponibles en este modelo.

## Casos de uso

- Prototipado de asistentes de atencion al cliente: el ajuste DPO esta orientado, por nombre y por el dataset implicito, a respuestas mas alineadas con preferencias humanas en conversaciones de soporte; util para validar pipelines de alineacion antes de escalar a modelos mayores.
- Generacion de respuestas a FAQs y tickets: con 32.768 tokens de contexto (heredados) puede procesar hilos de conversacion o historiales de ticket largos y producir respuestas resumidas, siempre que se valide la calidad con datos propios.
- Clasificacion y reescritura de mensajes de usuario: el modelo puede reformular quejas o consultas en tono neutro para su enrutamiento a equipos humanos, aprovechando su tamano reducido para despliegues economicos.
- Entrenamiento y evaluacion de pipelines DPO: sirve como caso de referencia para comparar configuraciones de TRL y Unsloth en modelos de 3B, midiendo el efecto del ajuste sobre un checkpoint cuantizado en 4 bits.
- Despliegue en entornos con recursos limitados: al caber en GPUs de consumo con cuantizacion adicional, es adecuado para demos internas, entornos de desarrollo y pruebas de integracion con APIs compatibles con OpenAI (`endpoints_compatible`).
- Generacion de borradores de correo de soporte: el modelo puede producir respuestas plantilla que un agente humano revisa y edita, reduciendo el tiempo de primera respuesta en colas de baja criticidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 8-10 GB para contextos moderados.
- VRAM estimada en cuantizacion 4 bits (GGUF Q4_K_M o similar): alrededor de 2-2,5 GB de pesos, con 4-6 GB totales recomendados para contexto largo.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4, A100 o H100 para despliegues con concurrencia.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB o superiores con cuantizacion; en FP16 requiere al menos 8 GB.
- Opciones de despliegue: transformers (pipeline nativo), vLLM, TGI, llama.cpp/Ollama (previa conversion a GGUF), y endpoints compatibles con OpenAI segun el tag `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles; dependen fuertemente de la GPU y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hadeis/customer-support-qwen25-3b-dpo | 3B | 32.768 (heredado) | no disponible | Hugging Face, 0 descargas | Ajuste DPO vertical, sin benchmarks |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32.768 | Apache 2.0 (Qwen2.5-3B) | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit | 3B | 32.768 | Apache 2.0 (heredada) | Hugging Face | Checkpoint cuantizado 4-bit para entrenamiento |
| Llama 3.2 3B Instruct | 3B | 128.000 | Llama 3.2 Community License | Hugging Face, Meta | Alternativa de tamano similar con contexto mayor |

La comparativa se limita a modelos de la misma familia y tamano porque no hay datos de rendimiento publicados para el modelo evaluado. Cualquier comparacion cuantitativa requeriria ejecutar los benchmarks de forma independiente.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni evaluaciones de calidad de respuesta; no es posible afirmar que el ajuste DPO mejore al modelo base sin medirlo.
- Licencia no declarada de forma explicita (`licence: license`): el uso comercial es incierto y debe consultarse con el autor o asumirse la licencia del modelo base (Apache 2.0 para Qwen2.5-3B), sin garantia.
- Entrenado sobre un checkpoint cuantizado en 4 bits: puede heredar degradaciones de precision respecto al modelo original en FP16/BF16.
- Riesgo de alucinacion: inherente a modelos de 3B, especialmente en dominios verticales como atencion al cliente donde puede inventar politicas, plazos o condiciones.
- Sesgos: no documentados; el dataset de preferencias no se describe, por lo que no se puede evaluar que sesgos se han reforzado o mitigado.
- Idiomas no declarados: el ajuste puede haber desplazado el comportamiento multilingue del modelo base hacia el idioma del dataset de preferencias.
- Modelo con cero descargas y cero likes: sin validacion por parte de la comunidad; no debe usarse en produccion sin evaluacion propia y sin auditoria del dataset de entrenamiento.
- El tag `endpoints_compatible` sugiere compatibilidad con APIs estilo OpenAI, pero no se detalla la configuracion de servidor recomendada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hadeis/customer-support-qwen25-3b-dpo
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit
- Paper DPO: https://huggingface.co/papers/2305.18290
- Repositorio TRL: https://github.com/huggingface/trl
- Run de entrenamiento en Weights & Biases: https://wandb.ai/vsrivastava-dev-srm-institute-of-science-and-technology/huggingface/runs/0f3534qw
- Repositorio Unsloth: https://github.com/unslothai/unsloth
