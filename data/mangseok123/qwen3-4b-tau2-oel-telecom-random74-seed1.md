# MANGSEOK123/qwen3-4b-tau2-oel-telecom-random74-seed1

## Resumen

qwen3-4b-tau2-oel-telecom-random74-seed1 es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507 (modo no-thinking) realizado por el usuario MANGSEOK123. El modelo parte de la familia Qwen3, con 4.022.468.096 parámetros en pesos BF16 y una arquitectura transformer densa (no MoE). Su propósito es la internalización de habilidades conversacionales en el dominio de telecomunicaciones, entrenado sobre el benchmark tau2-bench en su variante telecom.

El entrenamiento combina dos técnicas: por un lado, autodestilación on-policy con el método OEL (del codebase LMOps), donde un estudiante resuelve cada tarea sin la habilidad en el contexto mientras un profesor congelado (copia del modelo inicial) la tiene en el system prompt; la destilación usa KL inversa a nivel de token sobre los top-256 tokens del estudiante, con AdamW a learning rate constante de 3e-6, 8 pares por actualización y 1 época. Por otro, Skill-GRPO mediante el entrenador SDAR, con tamaño de grupo 8, learning rate 1e-6, low_var_kl de 0.01 y presupuesto de prompt de 16k.

La relevancia de este modelo es fundamentalmente metodológica: explora si las habilidades de un profesor pueden internalizarse en los pesos del estudiante en lugar de depender de prompts de sistema extensos, un problema clave para desplegar agentes conversacionales eficientes en producción. El checkpoint corresponde a la semilla 1 de un barrido con 74 pares fuente sin filtrar, en la configuración "source-only baseline" para telecom.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), modo no-thinking |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3 con 4.022 millones de parámetros, derivado de Qwen/Qwen3-4B-Instruct-2507 en modo no-thinking. No se trata de un modelo MoE ni de una arquitectura híbrida SSM; la model card no documenta innovaciones arquitectónicas respecto al base, por lo que se asume la arquitectura estándar de Qwen3-4B.

El entrenamiento se centra en tau2-bench telecom con 74 pares fuente sin filtrar y semilla 1. La fase de internalización (TANI / Source-only / Task aug / OEL) aplica autodestilación on-policy: el estudiante resuelve cada tarea sin la habilidad ni la experiencia (temperatura 0.7) y un profesor congelado, copia del modelo inicial, la lleva en el system prompt; la pérdida es KL inversa a nivel de token calculada sobre los top-256 tokens del estudiante, con AdamW a lr 3e-6 constante, 8 pares por actualización y 1 época. La fase Skill-GRPO usa GRPO con el entrenador SDAR (tamaño de grupo 8, lr 1e-6, low_var_kl 0.01, presupuesto de prompt de 16k). La evaluación se realiza con tau2-bench v1.0.1 usando un simulador de usuario GPT-4.1-mini, y BFCL v3 con bfcl_eval 2025.6.14.

## Capacidades

- Generación de texto conversacional multi-turno en el dominio de telecomunicaciones.
- Internalización de habilidades: el modelo aprende a desempeñar tareas que originalmente requerían instrucciones en el system prompt, sin necesidad de ellas.
- Razonamiento orientado a tareas de agente (tau2-bench), incluyendo resolución de flujos de atención al cliente de telecom.
- Soporte de tool calling / function calling heredado de Qwen3-4B-Instruct-2507 (evaluado mediante BFCL v3).
- Capacidades multilingües heredadas del modelo base (no documentadas específicamente para este checkpoint).
- Modo no-thinking únicamente: no se entrena ni se documenta el modo thinking de Qwen3.

## Casos de uso

- Atención al cliente de telecomunicaciones: el modelo puede gestionar conversaciones multi-turno resolviendo incidencias típicas (cambios de tarifa, diagnóstico de conectividad, gestión de facturación) sin necesidad de inyectar manuales de procedimiento en el prompt, gracias a la internalización de habilidades.
- Agentes de soporte con tool calling: integrado en un orquestador que expone APIs de CRM, facturación y provisión de servicios, el modelo puede encadenar llamadas a funciones para completar tareas del cliente.
- Evaluación de pipelines de internalización: sirve como referencia reproducible (semilla 1, 74 pares) para investigar si la destilación OEL reduce la dependencia de prompts de sistema largos.
- Prototipado de asistentes de dominio vertical: su tamaño de 4B permite desplegarlo en una sola GPU para validar flujos conversacionales antes de escalar a modelos mayores.
- Investigación en RLHF/GRPO aplicado a agentes: el checkpoint documenta hiperparámetros concretos (grupo 8, low_var_kl 0.01) útiles para reproducir experimentos de Skill-GRPO.
- Despliegue en entornos con restricciones de latencia: al ser un modelo de 4B en BF16, es viable en GPUs de gama media-alta con cuantización adicional, adecuado para asistentes embebidos en aplicaciones de soporte.
- Generación de datos sintéticos de diálogo telecom: puede utilizarse para producir conversaciones etiquetadas en el dominio y ampliar datasets de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona los entornos de evaluación (tau2-bench v1.0.1 con simulador GPT-4.1-mini y BFCL v3 con bfcl_eval 2025.6.14) pero no incluye cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 10 y 12 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB; en 4 bits, en torno a 3-4 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 para BF16; RTX 3090, RTX 4080 o superiores para cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 con margen, y en GPUs de 8-12 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), vLLM, llama.cpp u Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-tau2-oel-telecom-random74-seed1 | 4.022 M | no disponible | Telecom (tau2-bench) | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4.000 M | no disponible en esta ficha | General | licencia Qwen (consultar) | Hugging Face, ampliamente usado |
| Qwen3-4B (variantes oficiales) | ~4.000 M | no disponible en esta ficha | General | licencia Qwen (consultar) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a parámetros, dominio de especialización y disponibilidad.

## Limitaciones y advertencias

- Modelo de nicho: entrenado exclusivamente sobre tau2-bench telecom con 74 pares fuente; su rendimiento fuera del dominio de telecomunicaciones no está documentado y probablemente sea inferior al del base.
- Licencia no especificada en la información disponible: es imprescindible verificar la licencia del modelo base Qwen3-4B-Instruct-2507 antes de cualquier uso comercial.
- Riesgo de alucinación inherente a modelos de 4B en tareas de agente, especialmente en tool calling con APIs reales.
- Solo modo no-thinking: no se entrena el modo de razonamiento extendido de Qwen3, lo que limita tareas que requieran cadenas de pensamiento largas.
- Idiomas soportados no documentados; se asume herencia del base, pero sin verificación específica.
- Checkpoint experimental de investigación (0 descargas, 0 likes, creado en noviembre de 2026): no hay evidencia de validación en producción ni de robustez frente a entradas adversarias.
- El uso de un simulador de usuario GPT-4.1-mini en la evaluación introduce dependencia de un modelo propietario y posible sesgo en los resultados.
- La internalización de habilidades puede degradar la capacidad de seguir instrucciones explícitas cuando el usuario sí las proporciona; conviene validar ambos regímenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-telecom-random74-seed1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- tau2-bench: https://github.com/sierra-research/tau2-bench
- BFCL (Berkeley Function Calling Leaderboard): https://gorilla.cs.berkeley.edu/leaderboard.html
- Codebase OEL (LMOps): https://github.com/microsoft/LMOps
