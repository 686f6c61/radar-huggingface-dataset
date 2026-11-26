# MANGSEOK123/qwen3-4b-tau2-oel-retail-setting4-n176-seed2

## Resumen

qwen3-4b-tau2-oel-retail-setting4-n176-seed2 es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario MANGSEOK123 y publicado en Hugging Face. El modelo parte de la familia Qwen3, con 4.022.468.096 parametros totales en precision BF16, y esta especializado en tareas de atencion al cliente en el dominio retail mediante el benchmark tau2-bench. Su proposito no es el uso generalista, sino servir como artefacto de investigacion para estudiar la internalizacion de habilidades (skill internalization) en modelos conversacionales de dominio acotado.

La relevancia del modelo reside en su metodologia de entrenamiento: combina on-policy self-distillation con el framework OEL (LMOps) y un refinamiento posterior mediante Skill-GRPO con el entrenador SDAR. El estudiante aprende a resolver las tareas sin disponer de la habilidad o experiencia en el prompt del sistema, mientras un profesor congelado (copia del modelo inicial) si la tiene. Este planteamiento busca que el modelo interiorice procedimientos operativos en lugar de depender de instrucciones externas, un problema central en el despliegue de agentes conversacionales en produccion.

El modelo esta construido sobre Qwen3-4B-Instruct-2507 en modo no-thinking y se distribuye en formato safetensors con licencia no especificada en la model card. No se han publicado datos de rendimiento cuantitativos ni especificaciones detalladas de contexto o idiomas en la informacion disponible, lo que limita su evaluacion fuera del entorno de investigacion para el que fue creado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen3-4B-Instruct-2507, en su variante de modo no-thinking. Sobre esa base se aplica un pipeline de internalizacion de habilidades en dos fases. La primera es on-policy self-distillation con el framework OEL (LMOps): el estudiante resuelve cada tarea del benchmark tau2-bench retail sin la habilidad ni la experiencia en el prompt del sistema, con temperatura T=0.7, mientras un profesor congelado (copia del modelo inicial) dispone de esa habilidad en el prompt. La destilacion se realiza mediante divergencia KL inversa a nivel de token sobre los 256 tokens mas probables del estudiante, con AdamW a learning rate 3e-6 constante, 8 pares por actualizacion y 1 epoca.

La segunda fase es Skill-GRPO, un refinamiento con GRPO usando el entrenador SDAR con tamano de grupo 8, learning rate 1e-6, low_var_kl de 0.01 y un presupuesto de prompt de 16k tokens. El conjunto de entrenamiento consta de 176 pares tarea-habilidad sobre tau2-bench retail, con semilla de entrenamiento 2. La evaluacion se realiza con tau2-bench v1.0.1 usando un simulador de usuario GPT-4.1-mini y BFCL v3 mediante bfcl_eval 2025.6.14. Los pesos se publican en BF16.

## Capacidades

- Generacion de texto conversacional multi-turno en el dominio de atencion al cliente retail.
- Ejecucion de tareas del benchmark tau2-bench: gestion de pedidos, devoluciones, cambios y consultas de producto.
- Internalizacion de habilidades: el modelo resuelve tareas sin que la habilidad o experiencia este presente en el prompt del sistema.
- Soporte de tool calling y function calling, heredado de Qwen3-4B-Instruct-2507.
- Razonamiento multi-paso orientado a agentes conversacionales con herramientas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo no-thinking exclusivamente (no se entrena ni distribuye la variante thinking).

## Casos de uso

- Investigacion en internalizacion de habilidades: el modelo sirve como artefacto reproducible para estudiar como un estudiante absorbe procedimientos operativos de un profesor con prompt enriquecido, usando la configuracion OEL descrita en la model card.
- Evaluacion de agentes en tau2-bench: permite reproducir experimentos del benchmark retail con 176 pares tarea-habilidad y comparar variantes de semilla y configuracion.
- Atencion al cliente automatizada en retail: el modelo esta entrenado para gestionar conversaciones multi-turno con herramientas de gestion de pedidos y devoluciones, aunque su contexto maximo no esta documentado.
- Baseline para GRPO en dominios acotados: la combinacion Skill-GRPO y SDAR con grupo 8 y low_var_kl 0.01 sirve de referencia para experimentos de refuerzo en tareas de agente.
- Estudio de destilacion on-policy: la configuracion con KL inversa sobre top-256 tokens y temperatura 0.7 es replicable para analizar la transferencia de conocimiento entre profesor y estudiante.
- Prototipado de asistentes con function calling: al heredar las capacidades de Qwen3-4B-Instruct-2507, puede integrarse en pipelines de agentes que requieran llamadas a herramientas en dominios de comercio electronico.
- Comparacion de metodos de entrenamiento: util para contrastar TANI, Source-only, Task aug y OEL sobre el mismo conjunto de tareas y semilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona los entornos de evaluacion (tau2-bench v1.0.1 con simulador GPT-4.1-mini y BFCL v3 con bfcl_eval 2025.6.14), pero no incluye cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 12-16 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4-5 GB de pesos, aunque el modelo no publica variantes cuantizadas oficiales.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 2,5-3 GB de pesos, viable en GPUs consumer con 8 GB o mas.
- GPU recomendadas: A100 40/80 GB, H100 para entrenamiento o evaluacion a gran escala; RTX 4090 (24 GB) para inferencia en BF16 con contexto amplio; RTX 3090, RTX 4080 y RTX 4070 Ti para cuantizacion.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas usando cuantizacion de 4 bits; en BF16 se recomienda 16 GB o mas.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama mediante conversion a GGUF; el repo incluye el tag endpoints_compatible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| qwen3-4b-tau2-oel-retail-setting4-n176-seed2 | 4,02 B | no disponible | no disponible | Ajuste fino en tau2-bench retail con OEL y Skill-GRPO |
| Qwen/Qwen3-4B-Instruct-2507 | 4,02 B | no disponible en esta ficha | Apache 2.0 (segun el modelo base) | Modelo generalista de instrucciones |
| Qwen/Qwen3-4B | 4,02 B | no disponible en esta ficha | Apache 2.0 (segun la familia Qwen3) | Modelo base con modo thinking y no-thinking |
| Alternativas de dominio retail | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables especializados en tau2-bench retail |

La comparativa se limita al modelo base y a la familia Qwen3, ya que no se dispone de informacion sobre otros ajustes finos equivalentes en el dominio tau2-bench retail.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de Qwen3-4B-Instruct-2507, puede heredar sesgos del corpus original de Qwen.
- Riesgo de alucinacion: presente como en cualquier modelo generativo; el ajuste en un dominio acotado no elimina la posibilidad de respuestas incorrectas fuera de las tareas de retail.
- Limitaciones de contexto o idioma: no se especifican la longitud de contexto ni los idiomas soportados; el entrenamiento se centra en tareas de tau2-bench, probablemente en ingles.
- Restricciones de licencia: la licencia no esta disponible en la model card, lo que impide confirmar si el uso comercial esta permitido; se debe verificar antes de cualquier despliegue en produccion.
- Caveat de produccion: es un artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta, sin validacion externa ni resultados de benchmarks publicados.
- Dependencia del simulador: la evaluacion descrita usa GPT-4.1-mini como simulador de usuario, lo que introduce dependencia de un servicio externo y puede afectar a la reproducibilidad.
- Modo unico: solo se entrena y distribuye la variante no-thinking, por lo que no se dispone de razonamiento extendido tipo thinking.
- Fecha de creacion: el repositorio figura creado el 2026-11-26, dato que conviene contrastar con la disponibilidad real del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-retail-setting4-n176-seed2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Familia Qwen3: https://huggingface.co/Qwen/Qwen3-4B
- tau2-bench: no disponible en la informacion proporcionada
- OEL (LMOps): no disponible en la informacion proporcionada
- SDAR trainer: no disponible en la informacion proporcionada
- bfcl_eval: no disponible en la informacion proporcionada
