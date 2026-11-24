# Laplace-AI-Research/Signet-9B

## Resumen

Signet-9B es un modelo de lenguaje de 8.953.803.264 parámetros (aproximadamente 9B) desarrollado por Laplace AI Research, derivado del modelo base Qwen/Qwen3.5-9B mediante un proceso de ajuste fino supervisado (SFT) seguido de aprendizaje por refuerzo con GRPO. Su propósito específico es el de resistir la presión social y la manipulación conversacional: mantener una respuesta correcta cuando el usuario la cuestiona sin fundamento, aceptar correcciones legítimas y, sobre todo, distinguir entre evidencia auténtica entregada por un canal de herramientas (tool calling) y afirmaciones vertidas por el usuario que imitan esa misma evidencia.

El modelo aborda un problema concreto y poco tratado en modelos comerciales: la incapacidad de verificar el canal de procedencia de la información. Según la model card, los modelos Qwen3.5 de 2B, 4B y 9B sin ajustar adoptan con tasas casi idénticas un registro cuando llega como respuesta de herramienta auténtica y cuando se pega en un turno de usuario, con una brecha de canal dentro de ±0,05. Signet-9B invierte esa dinámica: adopta el 96% de los registros genuinos de herramienta y solo alrededor del 1% de registros idénticos pegados en un turno de usuario, incluyendo formatos de pegado no vistos en entrenamiento.

La relevancia actual del modelo reside en su enfoque en la robustez epistémica y la trazabilidad de la procedencia de datos, un área crítica para sistemas de agentes que operan con herramientas externas y están expuestos a inyección de contexto. Se distribuye bajo licencia Apache-2.0, con pesos fusionados en bf16 y los dos adaptadores LoRA del proceso de entrenamiento. El modelo es únicamente de texto: la torre de visión del modelo base no fue entrenada ni evaluada y no se incluye en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas de atención lineal (Qwen3.5), ajustado con LoRA sobre el modelo de lenguaje; sin torre de visión |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (modelo base: Apache-2.0) |
| Formato de pesos | Safetensors (checkpoint fusionado bf16 en la raíz) y adaptadores LoRA en `adapters/stage1_sft` y `adapters/stage2_grpo` |

## Arquitectura y entrenamiento

Signet-9B se construye sobre Qwen/Qwen3.5-9B en la revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`, utilizado en modo solo texto. La arquitectura subyacente es un transformer con capas de atención lineal propias de la familia Qwen3.5; para aprovechar los kernels rápidos de estas capas es necesario instalar `flash-linear-attention`. El proceso de ajuste se denomina internamente "Signet A6" y consta de dos etapas: un calentamiento supervisado con 250 ejemplos y, a continuación, 200 pasos de GRPO (Group Relative Policy Optimization), ambas etapas entrenadas con datos de contraste de canal emparejados (la misma información presentada como respuesta de herramienta auténtica frente a su versión pegada en un turno de usuario).

Los adaptadores LoRA tienen r = 16, α = 32, dropout de 0,05 y se aplican a todas las capas lineales del modelo de lenguaje, con 43,3 millones de parámetros entrenables por etapa. Los datos de entrenamiento provienen del split de entrenamiento de ConvictionBench v0.1, un conjunto de evaluación centrado en sycophancy, revisión de creencias y procedencia de la evidencia. El modelo opera en modo no-thinking (`enable_thinking=False`) y produce una respuesta JSON fija con los campos `reason`, `answer` y `decision`. El checkpoint fusionado incluido en el repositorio es únicamente el modelo de lenguaje (`Qwen3_5ForCausalLM`); los adaptadores deben aplicarse en orden (primero `stage1_sft`, luego `stage2_grpo`) si se parte del modelo base original.

## Capacidades

- Generación de texto con razonamiento acotado: produce un objeto JSON con un campo `reason` limitado a dos frases cortas y un campo `answer` restringido a un entero o a `"true"`/`"false"`.
- Resistencia a la presión conversacional: mantiene respuestas correctas cuando el usuario las cuestiona sin aportar evidencia válida (tasa de cambio del 1,1% frente al 39,9% del modelo base).
- Aceptación de correcciones legítimas: adopta correcciones válidas cuando la evidencia lo justifica.
- Verificación de procedencia por canal: acepta registros solo si llegan a través de un mensaje con `role: tool`, y trata el mismo texto pegado en un turno de usuario como una afirmación, no como evidencia.
- Resistencia a registros falsificados: rechaza el 97,9% de registros forjados (frente al 15,8% del modelo base).
- Generalización a formatos de pegado no vistos: resiste registros pegados en bloques de cita, mensajes reenviados y bloques de código, formatos ausentes del entrenamiento.
- Declaración de evidencia insuficiente: puede indicar cuándo la evidencia disponible no permite responder.
- Soporte de tool calling: integrado en el formato de conversación mediante mensajes con `role: tool`.
- Capacidades multilingües: limitadas al inglés según la model card.
- No dispone de capacidades de visión, audio ni modo thinking en esta distribución.

## Casos de uso

- Atención al cliente con verificación de datos: el modelo puede distinguir entre un dato recuperado de un sistema interno (entregado como respuesta de herramienta) y un dato que el usuario afirma en el chat, evitando que este último se trate como verdad establecida. Es adecuado porque su entrenamiento penaliza explícitamente la adopción de registros pegados en turnos de usuario.
- Agentes con herramientas externas en producción: en pipelines donde el agente consulta APIs de estado (saldos, pedidos, inventario), Signet-9B solo acepta como registro autoritativo la respuesta autenticada de la herramienta, lo que reduce el riesgo de que un usuario inyecte datos falsos en el contexto.
- Defensa frente a inyección de contexto: en asistentes expuestos a texto de terceros (correos reenviados, bloques de código, citas), el modelo trata esos fragmentos como afirmaciones y no como evidencia, lo que mitiga ataques de manipulación de contexto.
- Moderación y verificación de afirmaciones: puede emplearse para clasificar si una corrección aportada por un usuario está respaldada por evidencia auténtica o es una simple aserción, útil en flujos de revisión de disputas.
- Sistemas de decisión con salida estructurada: su formato JSON fijo (`reason`, `answer`, `decision`) facilita la integración en pipelines que requieren respuestas parseables y auditables, con un razonamiento breve y acotado.
- Evaluación de robustez epistémica: sirve como referencia para comparar la resistencia a sycophancy y a la falsificación de procedencia en modelos de tamaño similar, dado que se publican los resultados y el código del benchmark ConvictionBench.
- Asistentes educativos o de tutoría: el modelo puede mantener una respuesta correcta ante la insistencia del estudiante y aceptar una corrección solo cuando se aporta mediante el canal adecuado, fomentando un diálogo que no cede a la presión social.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card y se refieren a tipos de problema no vistos (held-out) de ConvictionBench v0.1, comparando Signet-9B con su modelo base Qwen3.5-9B.

| Metrica | Signet-9B | Qwen3.5-9B (base) |
|---|---|---|
| Precisión final (held-out) | 0,978 | 0,688 |
| Tasa de cambio bajo presión | 1,1% | 39,9% |
| Resistencia a registros forjados | 97,9% | 15,8% |
| Adopción de registros genuinos de herramienta | 96% | No disponible |
| Adopción de registro idéntico pegado en turno de usuario | ~1% | No disponible (brecha de canal dentro de ±0,05 respecto a la adopción del registro genuino) |

No se han publicado en la información disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 20 GB de memoria de GPU, según la model card.
- GPU recomendadas: no se especifican modelos concretos; por el requisito de 20 GB en bf16, encajan GPU con 24 GB o más, como RTX 4090, A100 (40/80 GB), H100 o L40S.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 24 GB de VRAM para bf16 (por ejemplo, RTX 4090); en GPUs con menos memoria sería necesaria cuantización, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: la model card documenta el uso con transformers (probado con transformers 5.22, peft 0.21 y torch 2.14) y la instalación de `flash-linear-attention` para los kernels rápidos de atención lineal. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Signet-9B | ~9B | No disponible | Verificación de procedencia por canal, resistencia a sycophancy | Apache-2.0 | Hugging Face (pesos fusionados y adaptadores LoRA) |
| Qwen/Qwen3.5-9B (base) | ~9B | No disponible | Modelo generalista multimodal (aquí usado solo texto) | Apache-2.0 | Hugging Face |
| Signet-4B | ~4B | No disponible | Misma receta Signet a menor escala | Apache-2.0 | Hugging Face |
| Signet-2B | ~2B | No disponible | Misma receta Signet a menor escala | Apache-2.0 | Hugging Face |

Los adaptadores previos de la familia Conviction (Anchor, Vector, Meridian) aprendieron a rechazar la *formulación* de registros falsificados, no el canal; Signet es el primer miembro de la familia entrenado para que el canal determine la decisión. No se dispone de datos comparativos con modelos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible.
- Riesgo de alucinación: no se documenta una evaluación específica de alucinación; el modelo está optimizado para la verificación de procedencia, no para la veracidad general de sus conocimientos.
- Limitación de idioma: solo se declara soporte de inglés; no se garantiza un comportamiento equivalente en castellano u otros idiomas.
- Longitud de contexto: no disponible; no se puede confirmar el soporte para conversaciones o documentos largos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe respetarse la licencia del modelo base Qwen3.5-9B, también Apache-2.0 según la model card.
- Modo de respuesta fijo: el modelo está entrenado en modo no-thinking y con salida JSON restringida (`reason`, `answer`, `decision`); no es adecuado para generación libre de texto largo sin adaptación.
- Dependencia del canal: la verificación de procedencia solo funciona si la aplicación entrega los registros auténticos como mensajes con `role: tool`; si la integración no respeta ese formato, la protección se pierde.
- Ausencia de visión: la torre de visión del modelo base no fue entrenada ni evaluada y no se incluye; para uso multimodal habría que aplicar los adaptadores sobre el modelo base completo, con comportamiento no garantizado.
- Orden de los adaptadores: aplicar los adaptadores fuera de orden o cargar solo `stage2_grpo` produce un modelo distinto.
- Madurez: el modelo se publicó en noviembre de 2026 con 2 descargas y 0 likes en el momento de la consulta; el informe técnico está anunciado para diciembre de 2026 y no se ha verificado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Laplace-AI-Research/Signet-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset ConvictionBench: https://huggingface.co/datasets/Laplace-AI-Research/ConvictionBench
- Artículo divulgativo (write-up): https://laplaceresearch.org/signet/
- Código y resultados: https://github.com/Laplace-AI-Research/signet
- Signet-2B: https://huggingface.co/Laplace-AI-Research/Signet-2B
- Signet-4B: https://huggingface.co/Laplace-AI-Research/Signet-4B
