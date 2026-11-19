# n96j/Rattle-8B-Instruct

## Resumen

Rattle-8B-Instruct es un ajuste fino (fine-tune) completo del modelo Ministral-3-8B-Instruct-2512 de Mistral AI, desarrollado por n96j (openadze, Brasil). Su propósito es muy concreto: encarnar una persona conversacional brasileña con un tono deliberadamente grosero, sarcástico y descortés, que responde en portugués de Brasil, rechaza preguntas que considera obvias y, cuando la consulta es técnica o seria, explica correctamente aunque sea refunfuñando.

El modelo parte de una base transformer densa de aproximadamente 8.900 millones de parámetros (8.918.026.240 según los pesos en safetensors), heredando la arquitectura y el tokenizador de la familia Ministral 3. El entrenamiento se realizó con LoRA sobre cuantización de 4 bits usando Unsloth, en una única GPU T4 gratuita de Google Colab, con un dataset propio de 504 conversaciones en portugués brasileño durante 2 épocas (~500 pasos).

Es relevante como ejemplo de ajuste fino de bajo coste para personalización de estilo y comportamiento (persona/roleplay) sobre un modelo base moderno, y como caso práctico de publicación de un modelo derivado con licencia Apache 2.0. No está pensado como modelo de propósito general: su valor está en el control de tono y en la demostración de que un dataset pequeño y curado puede redefinir la conducta conversacional de un modelo de 8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Mistral/Ministral 3, tag `mistral3`); detalles internos no disponibles |
| Parametros totales | 8.918.026.240 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de uso fija `max_seq_length=2048`) |
| Tipos de cuantizacion | Pesos publicados en 16 bits; version GGUF disponible en repositorio aparte; cuantizacion propia permitida por el autor |
| Idiomas soportados | Portugues (pt), especificamente portugues de Brasil; otros idiomas con comportamiento degradado segun el autor |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 17,9 GB); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (no un adaptador) sobre `mistralai/Ministral-3-8B-Instruct-2512`, por lo que conserva la arquitectura transformer de la familia Ministral 3, con el ajuste "fundido" en la base y pesos en precisión de 16 bits. No se detallan en la información disponible innovaciones arquitectónicas propias: las capacidades estructurales (atención, tokenizador, plantilla de chat) provienen íntegramente del modelo base.

El entrenamiento se realizó con LoRA sobre el modelo base cuantizado a 4 bits, empleando Unsloth, en una GPU T4 gratuita de Google Colab. Se usaron 504 conversaciones en portugués de Brasil durante 2 épocas (~500 pasos). Un detalle metodológico destacable: cada conversación se incluyó dos veces en el dataset, una con system prompt y otra sin él, para que el comportamiento de persona se mantenga incluso cuando la aplicación cliente no envía system prompt. No se menciona uso de RLHF ni DPO; el ajuste es supervisado sobre el dataset `n96j/rattle-dataset`.

## Capacidades

- Generación de texto conversacional en portugués de Brasil con una persona definida (tono grosero, sarcástico, con palabrotas deliberadas).
- Explicación de conceptos técnicos (redes, protocolos, informática) manteniendo el registro descortés pero con contenido correcto.
- Rechazo explícito de peticiones triviales u obvias, como parte del comportamiento entrenado.
- Respuesta con derivación a profesionales en temas de salud, sufrimiento emocional o peligro (indicando CVV 188 o SAMU 192, según la model card).
- Rechazo de solicitudes relacionadas con crímenes, estafas e intrusión.
- Consistencia de persona con y sin system prompt (entrenada explícitamente para ambos casos).
- No dispone de acceso a internet ni conocimiento de la fecha actual o noticias recientes.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Personajes conversacionales en aplicaciones de rol y entretenimiento: el modelo está entrenado específicamente para mantener una persona concreta y responder con un registro consistente, lo que lo hace adecuado para chatbots de personaje en portugués brasileño.
- Demostración educativa de ajuste fino con LoRA y Unsloth: sirve como referencia reproducible de cómo un dataset de ~500 conversaciones y una GPU T4 gratuita bastan para redefinir el estilo de un modelo de 8B.
- Pruebas de robustez de persona sin system prompt: al haberse entrenado con y sin system prompt, es útil para evaluar cómo se comporta un modelo personalizado en clientes que no envían instrucciones de sistema.
- Generación de contenido de entretenimiento con tono ácido para audiencias adultas: blogs, vídeos o canales de humor en portugués que requieran un asistente con carácter provocador.
- Base para nuevos fine-tunes de persona: al publicarse pesos completos en 16 bits y el adaptador LoRA por separado, otros equipos pueden continuar el entrenamiento o cuantizar por su cuenta.
- Evaluación comparativa de alineación y estilo: útil en investigación para estudiar cómo un ajuste fino de bajo coste altera el tono y la tasa de rechazo respecto al modelo base Ministral.
- Asistente técnico informal para desarrolladores lusohablantes que toleren el registro grosero: puede explicar conceptos de redes o programación manteniendo contenido correcto, según los ejemplos de la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: en torno a 18 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda GPU de 24 GB o superior (RTX 3090/4090, A10, L4, A100).
- VRAM estimada en 4 bits: aproximadamente 5-6 GB para pesos, viable en GPU consumer de 8 GB o más, que es el modo usado en el ejemplo de la model card (`load_in_4bit=True`).
- GPU recomendadas: T4 (usada en el entrenamiento, suficiente para inferencia en 4 bits), RTX 3060/4060 Ti 16 GB, RTX 4090, L4, A10, A100/H100 para despliegues de mayor concurrencia.
- Cabe en GPU consumer: sí, en cuantización de 4 bits o mediante la versión GGUF; en 16 bits requiere GPU de gama alta con 24 GB o más.
- Opciones de despliegue: Unsloth/Transformers (requiere `transformers` versión 5 o superior según el autor), llama.cpp, LM Studio (con la versión GGUF), y en general cualquier runtime compatible con la familia Ministral 3. No se confirma soporte explícito de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rattle-8B-Instruct | 8.918.026.240 | No disponible | Persona/roleplay en portugues de Brasil | Apache 2.0 | Hugging Face (repo completo + GGUF + LoRA) |
| mistralai/Ministral-3-8B-Instruct-2512 | ~8B (modelo base) | No disponible | Asistente general instruct | No disponible en la informacion proporcionada | Hugging Face |
| Alternativas de persona/roleplay de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

El único comparable del que se dispone de datos verificables en la información proporcionada es el modelo base Ministral-3-8B-Instruct-2512, del que Rattle hereda arquitectura, tokenizador y pesos iniciales; la diferencia principal es el ajuste de conducta y el idioma objetivo. No se dispone de datos de benchmarks ni de otros modelos de persona comparables para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo pequeño (8B) según su propio autor: comete errores; requiere verificación en usos donde la exactitud importe.
- Sesgos: entrenado exclusivamente con 504 conversaciones en portugués de Brasil, lo que puede introducir sesgos culturales y de registro propios de ese dataset reducido.
- Riesgo de alucinación: sin acceso a internet ni conocimiento de la fecha actual; puede inventar datos recientes o hechos no cubiertos por el modelo base.
- Limitación idiomática: fuera del portugués de Brasil el comportamiento de persona se debilita, según la model card.
- Lenguaje soez deliberado: el modelo usa palabrotas de forma intencionada; no es apto para productos dirigidos a todos los públicos sin filtrado adicional.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribuir correctamente; conviene revisar también las condiciones del modelo base Ministral.
- Ámbito sensible: no es un modelo sanitario ni psicológico; está entrenado para derivar a profesionales y a líneas de ayuda (CVV 188, SAMU 192), pero no debe usarse como sustituto de atención real.
- Dependencia de versión: la familia Ministral 3 requiere `transformers` 5 o superior, lo que puede limitar la compatibilidad con entornos y herramientas más antiguas.
- Sin datos publicados de benchmarks, latencia ni throughput: no es posible estimar su rendimiento cuantitativo frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/n96j/Rattle-8B-Instruct
- Versión GGUF: https://huggingface.co/n96j/Rattle-8B-Instruct-GGUF
- Adaptador LoRA: https://huggingface.co/n96j/Rattle-8B-Instruct-LoRA
- Dataset de entrenamiento: https://huggingface.co/datasets/n96j/rattle-dataset
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Unsloth (repositorio): https://github.com/unslothai/unsloth
