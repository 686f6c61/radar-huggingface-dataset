# MANGSEOK123/qwen3-4b-tau2-oel-telecom-setting4-n91-seed1

## Resumen

qwen3-4b-tau2-oel-telecom-setting4-n91-seed1 es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507 (modo no-thinking) desarrollado por el usuario MANGSEOK123 y publicado en Hugging Face. El modelo está entrenado específicamente sobre el dominio telecom del benchmark tau2-bench, con el objetivo de estudiar la internalización de habilidades (skill internalization): que el modelo aprenda a resolver tareas de atención al cliente multi-turno sin necesidad de recibir la habilidad o experiencia correspondiente en el system prompt. Con 4.022.468.096 parámetros totales (aproximadamente 4B), es un modelo compacto orientado a generación de texto y diálogo con soporte de tool calling.

La relevancia del modelo es fundamentalmente metodológica: documenta un pipeline de auto-destilación on-policy (OEL, LMOps) combinado con GRPO (Skill-GRPO mediante el entrenador SDAR) para internalizar 91 pares tarea-habilidad del dominio telecom. El repositorio tiene un tamaño de 8,1 GB en formato safetensors y BF16, y se publica como artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta. No se dispone de información sobre licencia, idiomas soportados ni resultados de benchmarks en la información proporcionada.

Se trata, por tanto, de un checkpoint de investigación más que de un modelo listo para producción: su interés radica en la metodología de entrenamiento y en el dominio acotado (telecom en tau2-bench), no en un uso generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507); detalles internos no disponibles |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (presupuesto de prompt de 16k en el entrenamiento GRPO) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B-Instruct-2507 en modo no-thinking, es decir, sin la fase de razonamiento extendido que Qwen3 activa opcionalmente. Sobre esa base se aplica un pipeline de internalización de habilidades en dos etapas. La primera es una auto-destilación on-policy con el codebase OEL (LMOps): el estudiante resuelve cada tarea sin la habilidad ni la experiencia en el contexto (temperatura T=0.7), mientras que una copia congelada del modelo inicial, con la habilidad inyectada en el system prompt, actúa como profesor; la pérdida es una KL inversa a nivel de token sobre el top-256 de tokens del estudiante, con AdamW a learning rate 3e-6 constante, 8 pares por actualización y 1 época.

La segunda etapa es Skill-GRPO, un ajuste con GRPO mediante el entrenador SDAR con tamaño de grupo 8, learning rate 1e-6, low_var_kl 0.01 y un presupuesto de prompt de 16k tokens. El conjunto de entrenamiento son 91 pares tarea-habilidad del dominio telecom de tau2-bench (variante TANI Full), con semilla de entrenamiento 1. La evaluación se realiza con tau2-bench v1.0.1 usando un simulador de usuario GPT-4.1-mini, y con BFCL v3 mediante bfcl_eval 2025.6.14. No se documentan innovaciones arquitectónicas propias: la contribución es el procedimiento de entrenamiento, no la topología del modelo.

## Capacidades

- Generación de texto y diálogo conversacional multi-turno en el dominio de atención al cliente de telecomunicaciones.
- Tool calling y function calling, evaluado con BFCL v3 (bfcl_eval 2025.6.14).
- Resolución de tareas agénticas de varios pasos en el entorno tau2-bench telecom, con internalización de la habilidad sin necesidad de incluirla en el system prompt.
- Modo no-thinking: respuestas directas sin cadena de razonamiento explícita.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión, audio u otras modalidades: no disponibles (el modelo base es de texto).

## Casos de uso

- Investigación sobre internalización de habilidades: reproducir el pipeline OEL + Skill-GRPO para estudiar cuánto conocimiento de dominio puede absorberse en los pesos frente a la inyección en el prompt, usando este checkpoint como referencia de la semilla 1.
- Evaluación en tau2-bench telecom: ejecutar el modelo contra el simulador de usuario GPT-4.1-mini para medir la tasa de resolución de tareas agénticas en atención al cliente de telecom sin habilidades en contexto.
- Automatización de soporte técnico de telecomunicaciones: el modelo está entrenado sobre 91 pares tarea-habilidad de ese dominio, lo que lo hace adecuado para prototipos de gestión de incidencias, cambios de plan y consultas de facturación en conversaciones multi-turno.
- Benchmarking de tool calling: usar BFCL v3 para comparar el efecto de la internalización frente al modelo base Qwen3-4B-Instruct-2507 en la selección y ejecución de funciones.
- Estudio de destilación on-policy: analizar la KL inversa sobre top-256 tokens como señal de entrenamiento en modelos de 4B, comparando la semilla 1 con otras semillas del mismo autor.
- Despliegue ligero en entornos con recursos limitados: al ser un modelo de 4B en BF16 (unos 8 GB de pesos), puede servirse en una única GPU consumer para pruebas de concepto de agentes conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe la metodología de evaluación (tau2-bench v1.0.1 con simulador GPT-4.1-mini y BFCL v3 con bfcl_eval 2025.6.14) sin incluir cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8-9 GB en BF16 para los pesos (4.022 millones de parámetros a 2 bytes por parámetro), más el espacio de activaciones y caché KV, que depende del contexto efectivo (no disponible).
- En cuantización de 8 bits, aproximadamente 4-5 GB; en 4 bits, aproximadamente 2,5-3 GB, aunque no se publican artefactos GGUF ni cuantizaciones oficiales.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente para BF16 con contexto moderado; para mayor throughput, A100 o H100. También cabe en GPUs consumer de 12-16 GB si se cuantiza.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible) y, previsiblemente, vLLM y llama.cpp/Ollama tras conversión, aunque no se documentan artefactos para estas últimas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-tau2-oel-telecom-setting4-n91-seed1 | 4,02B | No disponible | Telecom (tau2-bench) | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4B | No disponible en esta ficha | Generalista | No disponible en esta ficha | Hugging Face, ampliamente usado |
| Otros checkpoints del mismo autor (otras semillas/configuraciones) | ~4B | No disponible | Telecom (tau2-bench) | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, dominio y disponibilidad.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes: no hay evidencia de validación por terceros ni de uso en producción.
- Dominio muy acotado: entrenado exclusivamente sobre 91 pares tarea-habilidad del dominio telecom de tau2-bench; el rendimiento fuera de ese dominio no está documentado y probablemente degrade respecto al modelo base.
- Licencia no disponible: no puede asumirse uso comercial; debe verificarse la licencia del modelo base Qwen3-4B-Instruct-2507 y la del propio checkpoint antes de cualquier despliegue.
- Idiomas soportados no documentados: no hay garantía de comportamiento multilingüe más allá de lo heredado del modelo base.
- Longitud de contexto no documentada: el entrenamiento GRPO usó un presupuesto de prompt de 16k, pero no se especifica la ventana máxima de inferencia.
- Riesgo de alucinación inherente a un modelo de 4B en tareas agénticas multi-turno, especialmente en la ejecución de tool calls con parámetros ambiguos.
- Sesgos: no documentados por el autor; se heredan los del corpus de Qwen3 y los del conjunto tau2-bench.
- Fecha de creación futura (2026-11-26) en los metadatos: conviene tratar la información con cautela y verificar el repositorio antes de citarlo.

## Enlaces

- Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-telecom-setting4-n91-seed1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- tau2-bench: no disponible en la información proporcionada
- Codebase OEL (LMOps): no disponible en la información proporcionada
- Entrenador SDAR: no disponible en la información proporcionada
- BFCL v3 (bfcl_eval 2025.6.14): no disponible en la información proporcionada
