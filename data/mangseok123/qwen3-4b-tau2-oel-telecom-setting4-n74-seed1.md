# MANGSEOK123/qwen3-4b-tau2-oel-telecom-setting4-n74-seed1

## Resumen

qwen3-4b-tau2-oel-telecom-setting4-n74-seed1 es un ajuste fino del modelo Qwen3-4B-Instruct-2507 desarrollado por el usuario MANGSEOK123, orientado a la internalización de habilidades conversacionales en el dominio de telecomunicaciones. El modelo parte de la arquitectura transformer densa de Qwen3 con 4.411.424.256 parámetros y aplica una técnica de auto-destilación en política (on-policy self-distillation, OPSD) sobre el benchmark tau2-bench en su variante telecom (v1.0.1).

La propuesta técnica consiste en transferir al modelo estudiante las capacidades de un profesor congelado —una copia del modelo inicial con la habilidad inyectada en el system prompt— de forma que el estudiante aprenda a resolver las mismas tareas sin necesidad de dicha inyección. Se emplearon 74 de los 91 pares tarea-habilidad del conjunto TANI Full, con un presupuesto alineado al baseline de Task Aug. y una única época de entrenamiento.

Es relevante como ejemplo reproducible de internalización de habilidades mediante OPSD en un modelo pequeño (4B), con semilla y configuración documentadas, lo que facilita la replicación experimental. No obstante, se trata de un artefacto de investigación con cero descargas y sin model card extendida, por lo que su uso en producción requiere validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento usa prompt <= 8192 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3-4B-Instruct-2507, sin modificaciones estructurales. El ajuste se realiza mediante on-policy self-distillation (OPSD) usando el codebase OEL (LMOps). El estudiante resuelve cada tarea sin la habilidad en el contexto (temperatura 0.7, con GPT-4.1-mini actuando como simulador de usuario), mientras que un profesor congelado —copia del modelo inicial con la habilidad en el system prompt— genera las distribuciones objetivo.

La pérdida es una KL inversa a nivel de token sobre el top-256 del estudiante, optimizada con AdamW (lr 3e-6 constante, weight decay 0.01, grad clip 1.0). Se entrena 1 época con 8 pares por actualización, sobre 74 de los 91 pares tarea-habilidad del conjunto TANI Full (habilidades validadas con utilidad > 0), con submuestreo y orden de datos sembrados con semilla 1. Los límites por turno son prompt <= 8192 y respuesta <= 1024 tokens.

## Capacidades

- Generación de texto conversacional multi-turno en el dominio de atención al cliente de telecomunicaciones.
- Internalización de habilidades: resuelve tareas del benchmark tau2-bench telecom sin necesidad de instrucciones de habilidad en el system prompt.
- Razonamiento de tareas con dependencia de herramientas del entorno simulado de tau2-bench.
- Soporte de tool calling heredado del modelo base Qwen3-4B-Instruct-2507 (no validado de forma específica en esta ficha).
- Capacidades multilingües heredadas del modelo base (idiomas exactos no disponibles).
- No se documentan capacidades de visión, audio ni modo thinking explícito en la información proporcionada.

## Casos de uso

- Investigación en internalización de habilidades: reproducir el experimento OPSD con la semilla y configuración documentadas para comparar con el baseline de Task Aug. en tau2-bench telecom.
- Evaluación de agentes conversacionales en telecomunicaciones: desplegar el modelo como agente en el entorno simulado de tau2-bench para medir la retención de habilidades sin prompting explícito.
- Estudio de destilación en política: analizar cómo se transfieren distribuciones top-256 desde un profesor con contexto aumentado a un estudiante sin él en modelos de 4B.
- Prototipado de asistentes de soporte técnico: usar el modelo como base para flujos de resolución de incidencias en un entorno controlado, validando antes su comportamiento fuera del benchmark.
- Ablación de hiperparámetros: servir como punto de partida para variar semilla, número de pares o temperatura y medir el efecto en la retención de habilidades.
- Docencia y experimentación con codebases LMOps/OEL: ejemplo práctico de pipeline de auto-destilación con pesos en BF16 y compatibilidad con transformers y text-generation-inference.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8,8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda al menos 16 GB para inferencia cómoda con contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5 GB de pesos; en 4 bits, alrededor de 2,5 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: A100, H100 o L40S para despliegue con throughput alto; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes en BF16 para uso individual.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en BF16 y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (tag declarado), vLLM y llama.cpp/Ollama mediante conversión a GGUF (no incluida en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| qwen3-4b-tau2-oel-telecom-setting4-n74-seed1 | 4,41B | no disponible | no disponible | Ajuste OPSD sobre tau2-bench telecom; artefacto de investigación |
| Qwen/Qwen3-4B-Instruct-2507 | 4,41B | no disponible en esta ficha | no disponible | Modelo base; sin internalización específica de habilidades telecom |
| Otros ajustes tau2-bench del mismo autor | no disponible | no disponible | no disponible | Variantes por semilla/configuración no documentadas aquí |

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y cero likes: no hay evidencia de uso comunitario ni validación externa.
- Licencia no declarada: no se puede confirmar el uso comercial; debe consultarse al autor y la licencia del modelo base Qwen3-4B-Instruct-2507.
- Idiomas soportados no documentados: el comportamiento multilingüe es incierto más allá de lo heredado del base.
- Riesgo de sobreajuste al dominio telecom y al formato de tau2-bench v1.0.1; el rendimiento fuera de ese entorno no está medido.
- Riesgo de alucinación inherente a modelos de 4B en tareas conversacionales complejas; no hay evaluación de robustez publicada.
- El entrenamiento limita respuestas a 1024 tokens por turno, lo que puede condicionar el comportamiento en conversaciones largas.
- Sesgos no evaluados: no se documenta ningún análisis de sesgo demográfico, lingüístico o de dominio.
- No se garantiza compatibilidad con cuantizaciones publicadas; los pesos solo se distribuyen en BF16 safetensors.

## Enlaces

- Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-telecom-setting4-n74-seed1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Benchmark tau2-bench: no disponible en la informacion proporcionada
- Codebase OEL (LMOps): no disponible en la informacion proporcionada
- Paper OPSD: no disponible en la informacion proporcionada
