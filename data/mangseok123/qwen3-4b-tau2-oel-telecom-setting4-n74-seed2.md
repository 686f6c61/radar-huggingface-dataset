# MANGSEOK123/qwen3-4b-tau2-oel-telecom-setting4-n74-seed2

## Resumen

El modelo `qwen3-4b-tau2-oel-telecom-setting4-n74-seed2` es un ajuste fino de Qwen3-4B-Instruct-2507 desarrollado por el usuario MANGSEOK123, orientado a la internalización de habilidades conversacionales en el dominio de telecomunicaciones. Se entrena sobre el benchmark tau2-bench (versión 1.0.1), un conjunto de tareas de atención al cliente con herramientas y políticas, mediante una técnica de autodestilación on-policy (OPSD) con el codebase OEL (LMOps).

El objetivo es que el modelo alumno aprenda a resolver tareas de telecomunicaciones sin necesidad de disponer de la "skill" explícita en el prompt de sistema: un profesor congelado (copia del modelo inicial con la skill inyectada) guía al alumno para que interiorice ese comportamiento. Se trata de un experimento de investigación sobre internalización de habilidades, no de un modelo generalista de producción.

Con 4.411 millones de parámetros y pesos en BF16, hereda la arquitectura y capacidades base de Qwen3-4B-Instruct-2507, pero su especialización es muy concreta y el autor no publica datos de evaluación, licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507; detalles no disponibles) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usa prompt <= 8192 tokens y respuesta <= 1024 tokens por turno) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507 y se ajusta mediante autodestilación on-policy (OPSD) sobre el benchmark tau2-bench telecom v1.0.1. El proceso usa 74 de los 91 pares tarea-habilidad de TANI Full (pares validados con utilidad > 0), emparejados en presupuesto con la línea base Task Aug. El muestreo de pares usa `random.Random(2).sample(pool, N)`, y tanto el orden de datos como el muestreo de rollouts están sembrados con la semilla 2. Se realiza 1 época con 8 pares por actualización.

En cada actualización, el alumno resuelve cada tarea sin la habilidad en el prompt (temperatura 0.7, con un simulador de usuario GPT-4.1-mini), mientras que un profesor congelado —copia del modelo inicial con la habilidad inyectada en el system prompt— proporciona la señal de supervisión. La pérdida es una KL inversa a nivel de token sobre los 256 tokens más probables del alumno, optimizada con AdamW (lr 3e-6 constante, weight decay 0.01, grad clip 1.0). Los pesos finales se guardan en BF16.

## Capacidades

- Generación de texto conversacional multi-turno en el dominio de atención al cliente de telecomunicaciones.
- Internalización de habilidades: el modelo aprende a aplicar comportamientos guiados por una skill sin que esta aparezca explícitamente en el prompt de sistema.
- Razonamiento orientado a tareas con herramientas, heredado del entrenamiento sobre tau2-bench (tareas con políticas y tool calling).
- Soporte de tool calling / function calling (heredado de Qwen3-4B-Instruct-2507 y reforzado por el dominio tau2-bench).
- Capacidades multilingües: no disponibles de forma explícita en la información proporcionada; se heredan las del modelo base, sin confirmación del autor.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación sobre internalización de habilidades: el modelo sirve como artefacto experimental para estudiar si una skill inyectada en el prompt del profesor puede transferirse al alumno sin ella, comparando con la línea base Task Aug.
- Reproducción de experimentos de autodestilación on-policy: útil para validar la metodología OPSD con la semilla 2 y el submuestreo de 74 pares.
- Evaluación en tau2-bench telecom: permite medir la degradación o mejora respecto al modelo base en tareas de atención al cliente con herramientas.
- Prototipado de agentes de soporte técnico de telecomunicaciones: gracias a la herencia de tool calling, puede integrarse en flujos que consulten estado de línea, facturación o incidencias.
- Estudio de simulación de usuario: el pipeline de entrenamiento (con GPT-4.1-mini como simulador) es reutilizable para generar diálogos sintéticos de dominio.
- Base para ablaciones de hiperparámetros: al ser un checkpoint con semilla y submuestreo fijos, sirve como punto de comparación frente a otras configuraciones (setting4, n74, seed2) del mismo autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 9 GB solo para pesos (4.411 M parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica se recomiendan 16-24 GB para contexto amplio.
- VRAM estimada en cuantización de 8 bits: ~5 GB de pesos; en 4 bits: ~3 GB de pesos (requiere conversión a GGUF/AWQ no publicada por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue concurrente; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para inferencia en BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en BF16; en GPUs de 8-12 GB requeriría cuantización.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo), vLLM; llama.cpp/Ollama requerirían conversión a GGUF no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-tau2-oel-telecom-setting4-n74-seed2 | 4.411 M | No disponible | tau2-bench telecom (internalizacion de skills) | No disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4.400 M | No disponible en la informacion | Uso general, instrucciones | No disponible en la informacion | Hugging Face (oficial) |
| Otros checkpoints del mismo autor (setting/n/seed) | ~4.411 M | No disponible | Misma tarea, distinta configuracion | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no hay métricas publicadas de calidad, por lo que no debe asumirse un rendimiento superior al base sin evaluación propia.
- Especialización estrecha: entrenado exclusivamente sobre tau2-bench telecom; fuera de ese dominio puede degradarse respecto al Qwen3-4B-Instruct-2507 original.
- Licencia no disponible: no se puede confirmar el uso comercial; debe consultarse con el autor antes de cualquier despliegue en producción.
- Idiomas no declarados: aunque herede el multilingüismo del base, no hay confirmación del autor.
- Riesgo de alucinación: inherente a los modelos generativos; en atención al cliente con herramientas, puede inventar estados o políticas si no se restringe con validación externa.
- Sesgos: no documentados; el dataset de entrenamiento es sintético (simulador GPT-4.1-mini) y puede introducir sesgos del simulador.
- Contexto de entrenamiento limitado a 8192 tokens de prompt y 1024 de respuesta por turno; no se garantiza comportamiento fuera de ese rango.
- Repo con 0 descargas y 0 likes: sin validación comunitaria; tratar como checkpoint experimental.

## Enlaces

- Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-telecom-setting4-n74-seed2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- tau2-bench (referencia del benchmark): no disponible en la información proporcionada
- Codebase OEL (LMOps): no disponible en la información proporcionada
