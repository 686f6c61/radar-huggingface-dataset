# MANGSEOK123/qwen3-4b-tau2-oel-baseline-telecom-seed1

## Resumen

qwen3-4b-tau2-oel-baseline-telecom-seed1 es un ajuste fino de Qwen/Qwen3-4B-Instruct-2507 (modo no-thinking) publicado por el usuario MANGSEOK123 en Hugging Face. El modelo se entrena sobre el dominio telecom del benchmark tau2-bench con el objetivo de internalizar habilidades conversacionales de atención al cliente mediante destilación on-policy autoinducida (on-policy self-distillation), un enfoque en el que un profesor congelado (copia del modelo inicial con la "experiencia" inyectada en el system prompt) guía al estudiante que debe resolver la misma tarea sin esa ayuda.

El modelo forma parte de una línea experimental de investigación sobre skill internalization (internalización de habilidades) en agentes conversacionales. El autor denomina OEL baseline al pipeline de extracción de cadenas de experiencia (8 cadenas de extracción x 50 tareas, con un límite de 2048 tokens de experiencia) y emplea el código de OEL (LMOps) para la destilación. Adicionalmente se menciona Skill-GRPO como variante de entrenamiento con refuerzo mediante el trainer SDAR.

Se trata de un artefacto de investigación con 4.022.468.096 parámetros (aproximadamente 4B), pesos en BF16 y un repositorio de 8,1 GB. No tiene descargas ni likes, no declara licencia ni idiomas soportados, y su relevancia radica en documentar una metodología reproducible para internalizar habilidades de dominio (telecom) en un modelo pequeño, un área activa en el estudio de agentes y razonamiento multi-turno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), modo no-thinking |
| Parametros totales | 4.022.468.096 (aprox. 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B-Instruct-2507; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Libreria | transformers |
| Tamano del repositorio | 8,1 GB |
| Benchmarks de entrenamiento | tau2-bench v1.0.1 (telecom), BFCL v3 (bfcl_eval 2025.6.14) |
| Simulador de usuario | GPT-4.1-mini |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer decoder-only de Qwen3-4B-Instruct-2507, operando en modo no-thinking. El entrenamiento se centra en la internalización de habilidades sobre el dominio telecom de tau2-bench. Según la model card, el pipeline OEL (baseline) extrae 8 cadenas de experiencia sobre 50 tareas, con un límite de 2048 tokens de experiencia, y aplica destilación on-policy autoinducida con el codebase OEL (LMOps): el estudiante resuelve cada tarea sin la habilidad o experiencia (temperatura T=0.7), mientras un profesor congelado —copia del modelo inicial con la experiencia en el system prompt— genera la señal de supervisión. La pérdida es una KL inversa a nivel de token sobre los 256 tokens más probables del estudiante, con AdamW a lr 3e-6 constante, 8 pares por actualización y 1 época.

Como variante complementaria se describe Skill-GRPO, un entrenamiento con refuerzo mediante el trainer SDAR con tamaño de grupo 8, lr 1e-6, low_var_kl 0.01 y un presupuesto de prompt de 16k tokens. La evaluación se realiza con tau2-bench v1.0.1 usando un simulador de usuario GPT-4.1-mini y con BFCL v3 (bfcl_eval 2025.6.14). El uso de un profesor congelado y de una señal de KL inversa sobre la distribución del estudiante es la innovación técnica destacable: permite que el estudiante aprenda la habilidad sin disponer de ella en el contexto de inferencia, evitando el coste de incluir la experiencia en el prompt en producción.

## Capacidades

- Generación de texto conversacional multi-turno en el dominio de atención al cliente de telecomunicaciones.
- Ejecución de tareas de tau2-bench: gestión de conversaciones con herramientas y políticas de dominio.
- Internalización de habilidades sin necesidad de inyectar la experiencia en el system prompt en inferencia (objetivo del entrenamiento OEL).
- Soporte de tool calling / function calling heredado del modelo base Qwen3-4B-Instruct-2507 (evaluado con BFCL v3).
- Razonamiento multi-step orientado a agentes conversacionales.
- Capacidades multilingües: no disponibles (no declaradas en la model card).
- Modo thinking: no (entrenado explícitamente en modo no-thinking).
- Visión y audio: no disponibles.

## Casos de uso

- Atención al cliente de telecomunicaciones: el modelo se ha entrenado específicamente sobre el dominio telecom de tau2-bench, por lo que puede gestionar conversaciones multi-turno con políticas de negocio (cambios de plan, resolución de incidencias) sin necesidad de inyectar manualmente la experiencia en el prompt.
- Evaluación de pipelines de internalización de habilidades: sirve como baseline reproducible (seed 1) para comparar OEL frente a TANI, Source-only o Task aug en experimentos de investigación.
- Agentes conversacionales con tool calling: al heredar las capacidades de function calling de Qwen3-4B-Instruct-2507, puede integrarse en flujos que consulten APIs de CRM o sistemas de tickets.
- Destilación de dominio en modelos pequeños: como ejemplo de receta (profesor congelado + KL inversa sobre top-256 tokens) aplicable a otros dominios verticales con presupuesto de 4B parámetros.
- Despliegue en entornos con recursos limitados: sus 4B parámetros permiten inferencia en GPUs de consumo, útil para prototipos de agentes de soporte.
- Investigación en razonamiento multi-step: permite estudiar cómo se comporta un modelo sin la experiencia en contexto frente a uno con ella, aislando el efecto de la internalización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona los conjuntos de evaluación empleados (tau2-bench v1.0.1 con simulador GPT-4.1-mini y BFCL v3 con bfcl_eval 2025.6.14), pero no incluye métricas numéricas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8 GB solo para pesos (4,02B parámetros x 2 bytes), más overhead de activaciones y KV cache; en la práctica, 10-12 GB para contextos moderados.
- Cuantización a 8 bits: unos 4-5 GB de pesos; a 4 bits: unos 2-3 GB, aunque no se han publicado versiones GGUF/AWQ/GPTQ en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de alto throughput; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en BF16 con margen.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) e incluso en GPUs de 12 GB con cuantización, siempre que se generen los pesos cuantizados.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (tag text-generation-inference) y endpoints compatibles; vLLM, llama.cpp u Ollama requerirían conversión a los formatos correspondientes, no publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-tau2-oel-baseline-telecom-seed1 | 4,02B | no disponible | Destilación OEL sobre tau2-bench telecom | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3-4B-Instruct-2507 | aprox. 4B | no disponible en esta ficha | Instruct generalista | no disponible en esta ficha | Hugging Face (modelo base) |
| Alternativas de 4B para agentes conversacionales | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría (modelos de 4B ajustados para tau2-bench) no está disponible en la información proporcionada. El único punto de referencia documentado es el modelo base Qwen/Qwen3-4B-Instruct-2507, del que este modelo hereda arquitectura y capacidades generales.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa.
- Licencia no declarada: no se puede confirmar el uso comercial; debe consultarse al autor antes de cualquier despliegue.
- Idiomas no declarados: aunque el modelo base es multilingüe, no hay garantía de comportamiento en castellano u otros idiomas.
- Entrenado exclusivamente en el dominio telecom de tau2-bench: el ajuste puede degradar el rendimiento generalista del modelo base fuera de ese dominio.
- Riesgo de alucinación inherente a modelos de 4B y a la destilación sobre tareas sintéticas con simulador GPT-4.1-mini.
- Longitud de contexto no confirmada en la model card; debe verificarse contra el modelo base antes de asumir ventanas largas.
- Pesos solo en BF16: no hay versiones cuantizadas publicadas, lo que limita el despliegue en hardware de gama baja sin trabajo adicional.
- El pipeline OEL depende de un profesor congelado y de la calidad de las cadenas de experiencia extraídas; posibles sesgos del dataset de telecom no documentados.
- Sin resultados de benchmarks publicados: imposible verificar la mejora frente al modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-baseline-telecom-seed1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- tau2-bench (referencia del benchmark): no disponible en la información proporcionada
- Codebase OEL (LMOps): no disponible en la información proporcionada
- Trainer SDAR: no disponible en la información proporcionada
- bfcl_eval 2025.6.14: no disponible en la información proporcionada
