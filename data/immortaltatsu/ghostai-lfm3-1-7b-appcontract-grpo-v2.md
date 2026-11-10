# immortaltatsu/ghostai-lfm3-1.7b-appcontract-grpo-v2

## Resumen

ghostai-lfm3-1.7b-appcontract-grpo-v2 es un ajuste fino del modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario immortaltatsu, orientado a una tarea muy concreta: actuar como invocador de herramientas (tool caller) en local para un asistente de monedero Solana llamado Ghost Wallet. El modelo recibe lenguaje natural del usuario y emite llamadas de herramienta en formato Hermes sobre un catálogo de 198 herramientas, permaneciendo en silencio (sin emitir llamada) en los turnos de conversación o respuesta directa. Con 1.990.945.536 parámetros (~2B) y un repositorio de 4,0 GB en safetensors, está pensado para ejecución on-device.

El modelo parte del checkpoint SFT v2 y aplica una etapa de GRPO con una recompensa graduada verificada. No obstante, el propio autor documenta que la etapa de RL no produjo señal de gradiente (`frac_reward_zero_std` = 1, entropía ~0,003), por lo que los pesos publicados equivalen en la práctica al checkpoint SFT. Es relevante ahora como ejemplo de pipeline de ajuste para tool calling compacto y de evaluación con verificadores deterministas, más que como modelo de propósito general.

La licencia es "other" (heredada del modelo base LiquidAI/LFM3-1.7B) y el único idioma declarado es el inglés. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K); las únicas métricas disponibles son las de evaluación interna del propio repositorio sobre un conjunto de prueba de 855 filas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de LiquidAI/LFM3-1.7B; requiere `trust_remote_code=True`, etiqueta `custom_code`) |
| Parametros totales | 1.990.945.536 (~2B) |
| Parametros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible (longitud máxima de entrenamiento: 1536 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se listan GGUF ni otras variantes) |
| Idiomas soportados | inglés (`en`) |
| Licencia | other |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de LiquidAI/LFM3-1.7B, que no se detalla en la información disponible; la model card solo indica que requiere código remoto (`custom_code`) y que el ajuste se realizó con FlashAttention-2. El entrenamiento consta de dos etapas. La primera es un SFT de 3 épocas con learning rate 1e-5, scheduler coseno, precisión bf16, AdamW fusionado, ZeRO-2, longitud máxima de 1536 tokens y pérdida calculada únicamente sobre los turnos del asistente; el resultado fue una pérdida de 0,083 y una precisión de token del 99,3%. El conjunto de datos, `ghost-ai-app-contract-lfm3-v2.parquet`, contiene 6.321 filas (5.466 de entrenamiento y 855 de prueba), divididas por esqueleto de enunciado para que el conjunto de prueba contenga formulaciones no vistas, e incluye turnos de historial de seguimiento, turnos de aclaración (si falta un argumento obligatorio se pregunta, nunca se adivina), respuestas resistentes a inyección y sobremuestreo de herramientas con bajo rendimiento.

La segunda etapa es un GRPO con una recompensa de verificador graduada: llamada exacta 1,0; herramienta correcta con argumentos válidos 0,80; herramienta incorrecta 0,20; respuesta en blanco 0; y penalización por fuga de marcado. El autor advierte explícitamente de que `frac_reward_zero_std` fue 1 y la entropía ~0,003, es decir, todos los grupos de rollouts tuvieron varianza de recompensa nula y la etapa de RL no generó señal de gradiente; los pesos publicados son efectivamente el checkpoint SFT. La innovación técnica destacable no está en la arquitectura sino en el contrato de la aplicación: el modelo debe emitir llamadas Hermes y callar en turnos de respuesta, con `enable_thinking=False` obligatorio para evitar que LFM3 emita delimitadores de razonamiento (`</think>`) que el comprobador de formato de la app marca como fuga de marcado.

## Capacidades

- Generación de llamadas de herramienta en formato Hermes sobre un catálogo cerrado de 198 herramientas del contrato de Ghost Wallet.
- Distinción entre turnos de llamada y turnos de conversación: en las pruebas internas no emitió ninguna llamada en los turnos de respuesta (100%).
- Manejo de turnos de aclaración: cuando falta un argumento obligatorio, pregunta en lugar de adivinar.
- Resistencia a inyección de prompts, entrenada explícitamente con respuestas de este tipo en el dataset.
- Uso de historial de conversación multi-turno (turnos de seguimiento incluidos en el entrenamiento).
- Generación de texto en inglés; no se declaran capacidades multilingües.
- No se documentan capacidades de razonamiento general, código, matemáticas, visión, audio ni modo de pensamiento (de hecho, el pensamiento debe desactivarse).

## Casos de uso

- Asistente de monedero Solana en local: el modelo traduce instrucciones como "send 2 SOL to alice.sol" en una llamada de herramienta estructurada sobre las 198 herramientas del contrato, adecuado por su tamaño de ~2B y su entrenamiento específico en ese catálogo.
- Enrutamiento de intenciones en aplicaciones móviles: al ser un modelo compacto on-device, puede clasificar la intención del usuario y seleccionar la herramienta correcta sin enviar la conversación a un servidor.
- Capa de aclaración de parámetros: cuando la petición del usuario está incompleta, el modelo genera una pregunta de seguimiento en lugar de inventar argumentos, lo que reduce errores en operaciones sensibles.
- Defensa frente a inyección de prompts: integrado como primera barrera en un pipeline de agente, responde con rechazos entrenados ante intentos de manipulación del contrato de herramientas.
- Prototipado de pipelines de tool calling con GRPO: sirve como referencia reproducible de entrenamiento SFT + GRPO con verificador graduado y conjunto de evaluación dividido por esqueleto de enunciado.
- Evaluación de formato estricto: útil como banco de pruebas para validadores que exigen silencio en turnos de chat y llamadas parseables en turnos de herramienta, con métricas internas de parseo, herramienta correcta y argumentos válidos.
- No es adecuado, según el propio autor, para firmar o difundir transacciones: la puerta de confirmación de la aplicación es la autoridad, no el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas son las de la evaluación interna del repositorio (855 filas de prueba, decodificación greedy, 818 filas puntuadas, parser y validador propios en `scripts/eval_app_contract_hf.py`):

| Métrica (evaluación interna) | Valor |
|---|---|
| Turnos de llamada: llamada parseable | 99,11% |
| Turnos de llamada: herramienta correcta | 95,78% |
| Turnos de llamada: argumentos válidos | 98,67% |
| Turnos de llamada: llamada exacta | 49,63% |
| Turnos de respuesta/chat: sin llamada emitida | 100% |

El autor advierte de que son cifras held-out del propio repositorio, no el benchmark completo de 1.016 conversaciones del arnés de la aplicación, y que no constituyen una declaración de madurez para producción.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~2B parámetros en bfloat16 los pesos ocupan aproximadamente 4 GB, por lo que se necesita algo más de 4 GB de VRAM para cargar el modelo sin cuantizar.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU con al menos ~6-8 GB de VRAM debería poder alojarlo en bf16, aunque no se confirma.
- Cabe en GPU de consumo: probablemente sí en tarjetas con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 4070), aunque el dato no está confirmado por el autor.
- Opciones de despliegue: transformers con `trust_remote_code=True` (única vía documentada en la model card); no se documentan vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- Latencia y throughput: no disponibles. El ejemplo de uso fija `max_new_tokens=128` y decodificación greedy.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ghostai-lfm3-1.7b-appcontract-grpo-v2 | ~2B | no disponible (entrenamiento a 1536) | Tool calling cerrado para Ghost Wallet (198 herramientas) | other | Hugging Face, transformers con código remoto |
| LiquidAI/LFM3-1.7B (base) | ~1,7B | no disponible | Modelo generalista on-device | otra (heredada) | Hugging Face |
| Alternativas de ~2B para tool calling | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables de otros modelos en la información proporcionada; la comparación se limita al modelo base y a la categoría por tamaño.

## Limitaciones y advertencias

- La etapa GRPO no produjo señal de gradiente (`frac_reward_zero_std` = 1, entropía ~0,003); los pesos equivalen al checkpoint SFT, no a una mejora por RL.
- Entrenado y evaluado contra servicios de herramientas simulados (fixture): la corrección real del protocolo, la firma y la economía de las transacciones quedan fuera del alcance.
- Las herramientas que mueven valor no deben firmar ni difundir desde el chat; la puerta de confirmación de la aplicación es la autoridad.
- Los oráculos de palabras clave y valores no miden la veracidad general ni la calidad de las explicaciones.
- No se ha realizado revisión humana ciega.
- El corpus de evaluación es un cuestionario de regresión, no un benchmark held-out demostradamente no contaminado.
- Solo inglés; no se declaran otros idiomas.
- Licencia "other" heredada del modelo base: es necesario revisar los términos de LiquidAI/LFM3-1.7B antes de cualquier uso comercial.
- Riesgo de alucinación en argumentos y valores no cubiertos por el contrato; el 49,63% de llamadas exactas en la evaluación interna indica que la mitad de las llamadas no coinciden exactamente con la referencia.
- Requiere `enable_thinking=False`; de lo contrario emite delimitadores de razonamiento que el comprobador de formato de la app marca como fuga de marcado.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/immortaltatsu/ghostai-lfm3-1.7b-appcontract-grpo-v2
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.
