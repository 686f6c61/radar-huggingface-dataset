# minas2025/Gemma-4-E2B-Conversational-Uncensored

## Resumen

Gemma 4 E2B Conversational Uncensored es un ajuste fino de tipo conversacional sobre una versión abliterada de Gemma 4 E2B. Lo publica el usuario minas2025 en HuggingFace y se distribuye exclusivamente en formato GGUF, cuantizado en Q8_0 (~5,1 GB), para ejecutarse en runners locales como llama.cpp, LM Studio o KoboldCpp. El modelo base de la cadena es llmfan46/gemma-4-E2B-it-ultra-uncensored-heretic, a su vez una abliteración Heretic de google/gemma-4-E2B-it.

El repositorio declara 4.647.450.147 parámetros totales y un tamaño de 5,9 GB. Su propósito es ofrecer una personalidad conversacional aguda y directa, sin el tono corporativo de los asistentes alineados, manteniendo el comportamiento de cero rechazos heredado del modelo base abliterado. Se entrenó con QLoRA sobre el dataset jondurbin/airoboros-3.2 (unas 59.000 conversaciones) durante 1.000 pasos.

Resulta relevante como ejemplo de fine-tuning local de bajo coste: se completó en una única GPU de consumo AMD Radeon RX 6700 XT de 12 GB en aproximadamente 23 minutos, usando Unsloth. La ficha no reporta resultados de benchmarks ni una longitud de contexto máxima oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4); no se detalla en la informacion disponible. La denominacion E2B apunta a 2.000 millones de parametros efectivos |
| Parametros totales | 4.647.450.147 (~4,65 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible oficialmente; entrenado con 2048 y se recomienda usar 4096-8192 en inferencia |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado); el entrenamiento uso QLoRA de 4 bits |
| Idiomas soportados | no disponible; la etiqueta del repositorio indica "en" (ingles) |
| Licencia | Gemma Terms of Use (campo license: gemma) |
| Formato de pesos | GGUF (Q8_0.gguf, ~5,1 GB; archivo mmproj opcional para vision) |

## Arquitectura y entrenamiento

El modelo parte de una cadena de derivaciones: google/gemma-4-E2B-it, después una abliteración Heretic que elimina los mecanismos de rechazo (llmfan46/gemma-4-E2B-it-ultra-uncensored-heretic) y, finalmente, este ajuste conversacional. La ficha no detalla la arquitectura interna más allá de la familia Gemma 4 y la nomenclatura E2B; la presencia de un archivo mmproj en el repositorio indica que el modelo base incorpora un proyector multimodal para entrada de imagen.

El entrenamiento consistió en un ajuste QLoRA de 4 bits con rango 16, alpha 16, dropout 0 y todas las capas lineales como objetivo. Se ejecutaron 1.000 pasos con batch 1 y acumulación de gradiente 1, longitud de contexto 2048, tasa de aprendizaje 8e-5 con schedule coseno y warmup corto, optimizador AdamW de 8 bits y weight decay 0,001. El dataset fue jondurbin/airoboros-3.2 en formato ShareGPT, una mezcla de instrucciones y conversaciones. La pérdida final suavizada quedó en torno a 0,7-1,0. No se menciona RLHF, DPO ni ninguna fase de alineación adicional. La fusión, la conversión a GGUF y el entrenamiento se realizaron con Unsloth Studio sobre una Radeon RX 6700 XT de 12 GB (ROCm) en CachyOS.

## Capacidades

- Generacion de texto conversacional multi-turno, con un tono mas natural y directo que el del modelo base.
- Brainstorming y generacion de ideas, segun la ficha del autor.
- Explicaciones simplificadas de conceptos tecnicos (el ejemplo incluido es explicar que es un modelo cuantizado "como si tuviera cinco anos").
- Escritura creativa y conversacion informal (banter).
- Cero rechazos por diseno, heredado de la abliteracion del modelo base.
- Entrada de imagen opcional mediante el archivo mmproj y llama-mtmd-cli, si el usuario lo descarga.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el unico idioma etiquetado es el ingles.
- Modo de razonamiento explicito (thinking mode): no documentado.

## Casos de uso

- Asistente conversacional local y privado: el modelo funciona integramente en local con llama-server y un frontend compatible con OpenAI, de modo que ninguna conversacion sale del equipo. Adecuado para usuarios que priorizan privacidad.
- Generacion creativa y escritura de ficcion corta: el ajuste con Airoboros y el tono desinhibido lo hacen util para borradores narrativos y ejercicios de estilo, aunque el autor aclara que no es un especialista en roleplay de formato largo.
- Brainstorming en sesiones de producto o diseno: el modo conversacional permite iterar ideas rapidamente con temperatura alta (0,8-1,0) sin rigidez de asistente corporativo.
- Explicaciones didacticas de conceptos tecnicos: util como tutor informal para resumir o simplificar material, con la advertencia de que puede alucinar datos concretos.
- Prototipado de frontends y pruebas de integracion: al exponer una API compatible con OpenAI via llama-server en el puerto 8080, sirve para validar interfaces (Open WebUI, SillyTavern) sin coste de API.
- Descripcion y analisis de imagenes en local: si se descarga el archivo mmproj, se puede usar llama-mtmd-cli para tareas de vision sencillas (descripcion, lectura de capturas) en un equipo de consumo.
- Base para experimentacion en ajuste fino: al ser un finetune ligero (1.000 pasos, QLoRA rango 16), es un punto de partida barato para que investigadores reproduzcan pipelines de Unsloth en GPU AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ningun otro conjunto, y tampoco ofrece comparaciones numericas con el modelo base. Tampoco se documentan metricas de latencia o throughput en inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 ocupa ~5,1 GB, por lo que el modelo entra en GPUs de 8 GB con margen ajustado y se ejecuta comodamente en 12 GB, dejando espacio para la cache KV con contexto de 4096-8192.
- GPU recomendadas: cualquier GPU con 8-12 GB o mas de VRAM. El autor lo ejecuto en una AMD Radeon RX 6700 XT de 12 GB (ROCm). Equivalentes en NVIDIA: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090.
- GPU de consumo: si, cabe en GPUs de consumo. El propio entrenamiento y la inferencia se realizaron en una GPU de gama media de 12 GB.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server con --jinja), LM Studio, KoboldCpp, llama-mtmd-cli para multimodal y cualquier frontend compatible con OpenAI (Open WebUI, SillyTavern).
- Configuracion recomendada por el autor: contexto de 4096-8192, temperatura 0,8-1,0 (0,85 por defecto), penalizacion de repeticion 1,10-1,15 y sin system prompt especial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Gemma-4-E2B-Conversational-Uncensored (este) | 4.647.450.147 | no disponible (recomendado 4096-8192) | Gemma Terms of Use | GGUF Q8_0, 0 descargas |
| llmfan46/gemma-4-E2B-it-ultra-uncensored-heretic (modelo base) | no disponible | no disponible | Gemma Terms of Use | no disponible |
| google/gemma-4-E2B-it (modelo original) | no disponible | no disponible | Gemma Terms of Use | no disponible |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin censura por diseno: la abliteracion elimina los rechazos del modelo original, por lo que puede generar contenido ofensivo, peligroso o ilegal si se le solicita. El usuario es responsable del uso y de cumplir la legislacion local.
- Riesgo de alucinacion: al no existir evaluaciones publicadas, no hay medida objetiva de su fiabilidad factual; la perdida de entrenamiento baja (0,7-1,0) se atribuye a datos sinteticos limpios y no garantiza correccion.
- La ficha indica explicitamente que no esta pensado para tareas de asesoramiento medico, legal o financiero.
- Limitacion de contexto: se entreno con 2048 tokens y solo se recomienda operar entre 4096 y 8192; mas alla de ese rango el comportamiento puede degradarse.
- Idioma: solo se etiqueta el ingles; no hay evidencia de capacidades multilingues y el espanol no esta garantizado.
- Licencia: hereda los Gemma Terms of Use a traves de la cadena de modelos base. La abliteracion no elimina las condiciones de la licencia, por lo que el uso comercial queda sujeto a dichos terminos.
- Estado de adopcion: 0 descargas y 0 "likes" en el momento de la consulta, sin validacion por parte de la comunidad.
- Cuantizacion limitada: solo se publica Q8_0; no hay variantes de menor precision (Q4, Q5) listas para GPUs mas pequenas.
- No es un especialista en roleplay de formato largo, segun advierte el propio autor.
- Fecha de creacion y actualizacion del repositorio: 3 de octubre de 2026.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minas2025/Gemma-4-E2B-Conversational-Uncensored
- Modelo base (abliteracion Heretic): https://huggingface.co/llmfan46/gemma-4-E2B-it-ultra-uncensored-heretic
- Modelo original de Google: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/jondurbin/airoboros-3.2
- Herramienta de entrenamiento y conversion: Unsloth y llama.cpp (sin URL concreta en la informacion proporcionada)
- Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo (contenido sobre la plataforma Twitch), por lo que no se incluye ningun enlace adicional de la busqueda.
