# mistralai/Mistral-7B-Instruct-v0.2

## Resumen

Mistral-7B-Instruct-v0.2 es un modelo de lenguaje de 7.241.732.096 parametros desarrollado por Mistral AI, empresa francesa fundada en abril de 2023 y especializada en inteligencia artificial generativa. Se trata de la version afinada por instrucciones (instruction fine-tuned) del modelo base Mistral-7B-v0.2, que a su vez introduce cambios relevantes respecto a v0.1: una ventana de contexto de 32k tokens (frente a 8k), RoPE-theta de 1e6 y la eliminacion de la Sliding-Window Attention.

El modelo resuelve tareas de generacion de texto y seguimiento de instrucciones en formato conversacional, y es relevante porque combina un tamano contenido (7B) con una licencia Apache 2.0 plenamente permisiva y un contexto largo para su epoca, lo que lo hizo muy popular para despliegues on-premise y fine-tuning. En el momento de redactar esta ficha acumula 1.647.272 descargas y 3.255 likes en HuggingFace.

Su arquitectura es de tipo transformer decoder-only, y el propio autor lo describe como una demostracion rapida de que el modelo base puede afinarse facilmente por instrucciones. El autor ha publicado una version sucesora, Mistral-7B-Instruct-v0.3, indicada en la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral 7B) |
| Parametros totales | 7.241.732.096 (~7,24B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.000 tokens (32k) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y PyTorch (bin) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Mistral-7B-v0.2. Respecto a Mistral-7B-v0.1, la version base introduce tres cambios documentados por el autor: ventana de contexto de 32k tokens (frente a 8k), RoPE-theta de 1e6 y la eliminacion de la Sliding-Window Attention. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el afinado por instrucciones de esta version.

El prompt debe estructurarse con los tokens `[INST]` y `[/INST]`, comenzando la primera instruccion con un token de inicio de secuencia (BOS) y sin repetirlo en instrucciones posteriores; la generacion del asistente finaliza con el token de fin de secuencia (EOS). Este formato esta disponible como chat template a traves del metodo `apply_chat_template()`. No se documentan en la informacion proporcionada innovaciones adicionales como decodificacion especulativa o mecanismos de atencion lineal.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones en formato multi-turno mediante la plantilla `[INST] ... [/INST]`.
- Razonamiento basico y respuesta a preguntas sobre conocimiento general.
- Generacion de codigo y texto tecnico, segun el uso comun de la familia Mistral 7B (no verificado con benchmarks en la informacion disponible).
- Soporte de conversaciones multi-turno con historial de mensajes (roles user/assistant).
- Ventana de contexto de 32k tokens, adecuada para entradas largas.
- Capacidades multilingues: no documentadas explicitamente en la model card.
- Soporte de tool calling / function calling: no documentado para esta version en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles en esta version.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Asistente conversacional multi-turno: el modelo gestiona dialogos con historial de mensajes mediante roles user/assistant y una ventana de 32k tokens, lo que permite mantener contexto extenso sin truncar la conversacion.
- Generacion y asistencia de codigo: puede integrarse en editores o pipelines para autocompletar, explicar o refactorizar fragmentos, aunque sin garantia de tool calling nativo en esta version.
- Resumen y extraccion de informacion de documentos largos: los 32k tokens de contexto permiten procesar informes, contratos o articulos extensos en una sola pasada.
- Analisis y clasificacion de texto: usable para etiquetado, categorizacion y extraccion de entidades en flujos batch.
- Chatbot especializado mediante fine-tuning: al ser Apache 2.0 y de 7B, es viable afinarlo con datos propios en hardware de gama alta de consumo.
- Generacion de contenido redactado: borradores, respuestas de correo o textos de marketing con control por instrucciones.
- Despliegue on-premise o en entornos con requisitos de soberania de datos: la licencia permisiva y el tamano contenido permiten ejecutarlo localmente sin dependencia de APIs externas.
- Prototipado e investigacion: util como linea base en experimentos de prompting, evaluacion y comparacion de tecnicas de instruccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Estimaciones a partir del tamano del modelo; no confirmadas por el autor en la informacion proporcionada:

- VRAM estimada para inferencia: ~14,5 GB en FP16/BF16 (7,24B x 2 bytes, mas overhead de activaciones y cache KV), ~7-8 GB en INT8, ~4-5 GB en cuantizacion de 4 bits.
- GPU recomendadas: A100, H100, L40S o A10G para despliegue en servidor; RTX 4090 o RTX 3090 (24 GB) para precision completa en una sola tarjeta.
- Compatibilidad con GPU de consumo: si, en GPUs con 24 GB (RTX 3090/4090) a precision completa; en GPUs de 12 GB (RTX 3060, 4070) mediante cuantizacion de 4 u 8 bits.
- Opciones de despliegue: `transformers`, `mistral_inference`, `mistral_common`, text-generation-inference (etiqueta presente en el repo) y despliegue en Azure (etiqueta deploy:azure). No se confirma compatibilidad con vLLM, llama.cpp u Ollama en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mistral-7B-Instruct-v0.2 | 7,24B | 32k | Apache 2.0 | Objeto de esta ficha; sin mecanismos de moderacion |
| Mistral-7B-Instruct-v0.1 | ~7,24B | 8k | Apache 2.0 | Version anterior; contexto menor y con Sliding-Window Attention |
| Mistral-7B-Instruct-v0.3 | no disponible | no disponible | Apache 2.0 | Version sucesora recomendada por el autor en la model card |
| Llama-2-7B-Chat | ~7B | no disponible en la informacion proporcionada | Llama 2 Community License | Alternativa de tamano similar; licencia menos permisiva |

## Limitaciones y advertencias

- El propio autor advierte que el modelo no incorpora mecanismos de moderacion, por lo que puede producir contenido no filtrado; no es apto para entornos que exijan salidas moderadas sin capas adicionales de seguridad.
- Riesgo de alucinacion: no se documentan garantias de veracidad de las respuestas.
- Sesgos conocidos: no documentados en la model card, pero previsibles en un modelo entrenado con datos web a gran escala.
- Idiomas soportados: no disponibles en la informacion proporcionada; el rendimiento multilingue no esta verificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia.
- Requiere respetar estrictamente el formato de prompt `[INST] ... [/INST]`; un formato incorrecto degrada el comportamiento del modelo.
- Existe una version sucesora (v0.3) que el autor senala como recomendada; evaluar su uso frente a esta version.
- Caveat de produccion: la model card se centra en la demostracion del afinado, no en un modelo optimizado para guardrails ni para entornos regulados.

## Enlaces

- HuggingFace: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Version sucesora: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Paper: https://arxiv.org/abs/2310.06825
- Blog de lanzamiento: https://mistral.ai/news/la-plateforme/
- Web del autor: https://mistral.ai/
- Consola del autor: https://console.mistral.ai/home
- Wikipedia (Mistral AI): https://fr.wikipedia.org/wiki/Mistral_AI
