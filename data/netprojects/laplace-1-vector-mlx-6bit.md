# netprojects/Laplace-1-Vector-MLX-6bit

## Resumen

Laplace-1-Vector es un modelo de decisión de 4.112 millones de parámetros desarrollado por Juneo Lab sobre la arquitectura Spark-X2.6-4B (familia Spark2_5). Su cometido no es la generación de texto libre, sino la evaluación de decisiones: recibe un estado, una pregunta y un conjunto de candidatos, y devuelve una distribución de probabilidad sobre cada candidato en un único forward pass. Esto lo hace útil para tareas como asignar la propiedad de una tarea, decidir permisos de acceso, determinar si conviene actuar o pedir más información, o predecir la siguiente observación de un entorno descrito.

La versión aquí documentada es una conversión a MLX realizada por NetProjects (Internet Projects Ltd), no afiliada a Juneo Lab ni a XHToken. Cuantiza las capas lineales a 6 bits (afín, grupo 64) y mantiene la puerta de salida de atención en bf16, lo que resulta en un peso de 3,3 GB. Está pensada para ejecutarse en Apple Silicon (probada en un MacBook Pro M5 Max de 128 GB), junto al agente, de modo que los datos no salgan de la máquina.

El modelo base se publicó bajo licencia Apache 2.0 y esta conversión conserva esa licencia. La relevancia actual radica en su enfoque de "decisión como forward pass": frente a pipelines que invocan un LLM generativo para elegir entre opciones, Laplace-1-Vector obtiene la distribución directamente de los logits de las letras candidatas, lo que reduce latencia y coste computacional en entornos de agentes y seguridad de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Spark2_5 (familia Spark-X2.6-4B) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits afín, grupo 64; puerta de salida de atención en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), librería mlx |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Spark2_5, implementada nativamente en mlx-lm 0.32 y posteriores, por lo que no requiere `trust_remote_code`. El modelo original es un transformer de 4B parámetros construido sobre Spark-X2.6-4B y orientado a decisión y predicción de estado, no a generación abierta. La conversión MLX cuantiza las capas lineales a 6 bits con cuantización afín de grupo 64 y preserva la puerta de salida de atención en bf16 para mantener la fidelidad numérica en esa parte crítica.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card del autor de la conversión no detalla el proceso de entrenamiento del modelo base; solo indica que se trata de un modelo de decisión de Juneo Lab construido sobre Spark-X2.6-4B. La innovación técnica destacable es el uso de la distribución sobre los logits de las letras candidatas (A, B, C…) como mecanismo de scoring, en lugar de generar texto y parsearlo.

## Capacidades

- Evaluación de decisiones: recibe un estado, una pregunta y hasta 26 candidatos, y devuelve una probabilidad por candidato en un único forward pass.
- Predicción del siguiente estado u observación de un entorno descrito, devolviendo JSON.
- Razonamiento de agente: determinar quién debe poseer una tarea, quién puede ver qué, si actuar o preguntar primero, o si un resultado cumple el estándar.
- Salida estructurada: soporta modo sin thinking (`enable_thinking=False`) para respuestas deterministas y concisas.
- Integración con mlx-lm: compatible con `mlx_lm.generate` y `mlx_lm.server` (API compatible con OpenAI).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible explícitamente; la interfaz es de scoring de candidatos y predicción de estado.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Control de acceso y permisos: dado un estado con permisos y una petición, el modelo devuelve la probabilidad de "allow" frente a "deny" en un solo forward pass, lo que permite integrarlo en un guardián de agentes que decide antes de ejecutar una acción sensible.
- Enrutamiento de tareas entre agentes: con un estado que describa roles y una pregunta sobre quién debe poseer una tarea, el modelo clasifica entre candidatos de agente; útil en orquestadores multiagente donde la latencia importa.
- Seguridad de agentes en producción: incluir una opción de "devolver a humano" o "pedir más información" entre los candidatos permite que el modelo señale cuándo los riesgos exigen intervención humana, con la distribución como señal de confianza relativa.
- Predicción de resultados de acciones: dado un estado y una acción en JSON, el modelo predice la siguiente observación del entorno; aplicable a simulación de flujos de trabajo, planificación y verificación de efectos antes de ejecutar.
- Validación de resultados contra estándares: evaluar si una salida cumple un criterio definido en el estado, usando los candidatos "cumple" / "no cumple" o variantes graduadas.
- Asistentes locales en Apple Silicon: al ocupar 3,3 GB en 6 bits, el modelo puede convivir con el agente en un Mac sin enviar datos a la nube, lo que encaja en escenarios con requisitos de privacidad (sanidad, legal, finanzas).
- Investigación en evaluación de decisiones: el helper `score_candidates` permite medir calibración relativa y comparar variantes de cuantización sobre un conjunto de ítems propio.

## Benchmarks y rendimiento

| Build | Tamano | JevBench (231 items publicos) | Misma respuesta top que bf16 |
|---|---|---|---|
| MLX 6-bit (esta ficha) | 3,3 GB | 79,2% | 222 / 231 |
| MLX 8-bit | 4,4 GB | 79,7% | 229 / 231 |
| MLX 4-bit | 2,3 GB | 78,4% | 210 / 231 |
| MLX bf16 | 8,2 GB | 78,8% | referencia |

En la comprobación de paridad con el modelo original en float32 sobre CPU (Transformers 4.57.1), con 11 prompts (uno de 3.313 tokens) y 753 posiciones en modo teacher-forced, las builds eligen el mismo siguiente token que el original en el 99,6% (bf16), 98,9% (8-bit), 98,1% (6-bit) y 90,4% (4-bit) de las posiciones. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: 3,3 GB para los pesos en 6 bits; añadir overhead de activaciones y contexto (no cuantificado en la información disponible).
- GPU recomendadas: Apple Silicon (probado en MacBook Pro M5 Max de 128 GB). No se documentan GPUs NVIDIA en la información proporcionada.
- Cabe en consumer GPU: sí, en Apple Silicon con memoria unificada suficiente; no se especifican requisitos mínimos de RAM del sistema.
- Opciones de despliegue: `mlx-lm` (>=0.32) para carga y generación, `mlx_lm.server` con API compatible con OpenAI; requiere Python 3.11 o superior; probado con mlx 0.32.4 y mlx-lm 0.32.2.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Laplace-1-Vector MLX 6-bit (esta ficha) | 4,112 B | no disponible | Apache 2.0 | Hugging Face (MLX) | Decisión por forward pass, 79,2% JevBench |
| Laplace-1-Vector MLX 8-bit | 4,112 B | no disponible | Apache 2.0 | Hugging Face (MLX) | 79,7% JevBench, 4,4 GB |
| Laplace-1-Vector MLX 4-bit | 4,112 B | no disponible | Apache 2.0 | Hugging Face (MLX) | 78,4% JevBench, 2,3 GB |
| Laplace-1-Atlas MLX 6-bit | 27 B (según model card) | no disponible | Apache 2.0 | Hugging Face (MLX) | Miembro 27B de la familia Laplace-1 |

No se dispone de comparación con modelos de decisión de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Las probabilidades devueltas son relativas a los candidatos suministrados, no una probabilidad calibrada de acierto; no deben interpretarse como confianza absoluta.
- El modelo es una conversión no oficial de NetProjects; no está afiliado a Juneo Lab ni a XHToken, por lo que el soporte y las garantías dependen del publicador de la conversión.
- La build de 4 bits cambia la respuesta top en aproximadamente el 9% de los ítems de JevBench respecto a bf16; para scoring y ranking se recomienda 6 u 8 bits.
- No se documentan sesgos conocidos, idiomas soportados ni comportamiento multilingüe en la información disponible.
- Riesgo de alucinación en la predicción de estado: al generar la siguiente observación como texto/JSON, puede producir observaciones plausibles pero incorrectas si las reglas del entorno no están bien especificadas en el system prompt.
- Las reglas que gobiernan la decisión deben incluirse en el estado; el modelo no las infiere de forma fiable por sí solo.
- Requiere mlx-lm >= 0.32 y Python >= 3.11; no es portable a entornos sin MLX (por ejemplo, CUDA) sin reconversión.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base JuneoAI/Laplace-1-Vector y los términos de la conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Laplace-1-Vector-MLX-6bit
- Modelo base: https://huggingface.co/JuneoAI/Laplace-1-Vector
- Build hermana 8-bit: https://huggingface.co/netprojects/Laplace-1-Vector-MLX-8bit
- Build hermana 4-bit: https://huggingface.co/netprojects/Laplace-1-Vector-MLX-4bit
- Build hermana bf16: https://huggingface.co/netprojects/Laplace-1-Vector-MLX-bf16
- Build 27B de la familia: https://huggingface.co/netprojects/Laplace-1-Atlas-MLX-6bit
- Publicador: https://netprojects.com
