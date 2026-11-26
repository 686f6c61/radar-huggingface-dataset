# HumanjavaEnterprises/Olmo-3-7B-Cooking-Assistant-GGUF

## Resumen

Olmo-3-7B-Cooking-Assistant-GGUF es la distribucion cuantizada en formato GGUF de un ajuste fino de OLMo 3 7B, el modelo de pesos abiertos desarrollado por el Allen Institute for AI (Ai2). Lo publica Humanjava Enterprises, un tercero no afiliado a Ai2, y esta especializado en tareas culinarias: lectura de recetas, escalado de cantidades y respuesta a preguntas de cocina y seguridad alimentaria. El modelo base cuenta con 7.298.011.136 parametros y su linaje de entrenamiento es auditable, ya que todos los modelos que intervinieron en la generacion de datos, el juicio y el etiquetado son de pesos abiertos y proceden de laboratorios estadounidenses (gpt-oss-120b de OpenAI, Granite 4.2 de IBM y OLMo de Ai2).

La propuesta de valor no es la memorizacion de recetas, sino el comportamiento: el modelo lee la receta que se le proporciona en el turno de usuario y responde a partir de ese texto; cuando no la tiene, tiende a pedirla en lugar de inventar cantidades. Segun la model card, en preguntas en ingles que requieren una receta no mostrada, inventa detalles solo el 4.4% de las veces, y con la receta visible acierta el 91.5%. El diseno previsto es "ajuste fino para el comportamiento, recuperacion para los hechos, herramientas para los numeros".

El repositorio incluye unicamente pesos GGUF (no safetensors), con variantes Q4_K_M, Q6_K, Q8_0 y BF16, y esta pensado para llama.cpp, Ollama y LM Studio. La version Q4_K_M ocupa 4.5 GB y funciona en GPUs de 6 GB. La licencia es Apache 2.0 y el unico idioma declarado es el ingles. La model card advierte explicitamente de que es mas debil que el Qwen3-8B Cooking Assistant de la misma familia fuera del ingles y en preguntas generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de OLMo 3 7B; detalles de atencion no disponibles) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de llama-server usa `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (4.5 GB), Q6_K (6.0 GB), Q8_0 (7.8 GB), BF16 (14.6 GB); imatrix para Q4_K_M y Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama, LM Studio); safetensors en el repo base no cuantizado |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado de OLMo 3 7B, un transformer decoder-only de 7.298 millones de parametros publicado por Ai2 con datos de entrenamiento publicos. No se dispone de informacion sobre el numero de tokens de ajuste, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; la model card solo indica que se entreno con un system prompt concreto y una plantilla ChatML (`<|im_start|>role ... <|im_end|>`), que va embebida en todos los ficheros GGUF. No hay modo de razonamiento (thinking mode) ni se inyecta system prompt por defecto.

La innovacion tecnica destacable no esta en la arquitectura sino en el proceso de evaluacion y en la trazabilidad del linaje. Las cuantizaciones Q4_K_M y Q6_K se construyeron con una importance matrix calculada sobre conversaciones de entrenamiento en formato chat, sin solapamiento con el conjunto de evaluacion. La evaluacion usa un conjunto fijo de 682 preguntas culinarias en 21 idiomas, nunca visto en entrenamiento, puntuado a ciegas por tres jueces de pesos abiertos (gpt-oss-120b, Granite 4.2 30B y OLMo 3.1 32B Instruct), con veredicto valido cuando coinciden 2 de 3, y una comprobacion por reglas que descarta veredictos de "inventa" cuando todos los detalles ya estaban en la pregunta.

## Capacidades

- Lectura y comprension de recetas proporcionadas en el turno de usuario, respondiendo a partir de ese texto.
- Escalado de recetas: aritmetica de cantidades, equivalencias de unidades, recuentos impares de huevos y lineas con fracciones como 1/3 de taza, entrenados especificamente.
- Comportamiento de abstencion: cuando falta la receta, tiende a pedirla en lugar de inventar cantidades.
- Respuesta a preguntas generales de cocina, ingredientes, tecnicas y seguridad alimentaria (rendimiento inferior al del modelo hermano Qwen3-8B).
- Generacion de texto conversacional en ingles con plantilla ChatML.
- No dispone de tool calling ni function calling documentado.
- No dispone de soporte de agentes ni de razonamiento multi-paso documentado.
- No dispone de capacidades de vision ni audio.
- No dispone de modo de razonamiento explicito.
- Multilingue limitado: el unico idioma declarado es el ingles y la propia model card lo califica de mas debil fuera del ingles.

## Casos de uso

- Asistente de cocina integrado en una app de recetas: la aplicacion recupera la receta de su base de datos y la inserta en el turno de usuario; el modelo responde preguntas sobre esa receta concreta con una tasa de acierto del 91.5% en ingles segun la model card.
- Escalado de raciones en produccion de menus: el modelo maneja aritmetica de cantidades, equivalencias de unidades y fracciones, lo que permite ajustar recetas de 4 a 11 comensales sin recalcular a mano.
- Atencion al cliente de una tienda de alimentacion o suscripcion de kits: conversaciones multi-turno sobre ingredientes, sustituciones y tecnicas, con la ventaja de que el modelo pide la receta cuando no la tiene en lugar de alucinar cantidades (4.4% de invencion en ingles sin receta).
- Consultas de seguridad alimentaria: respuestas sobre conservacion, temperaturas y manipulacion de alimentos, apoyadas en el system prompt que instruye a decir cuando no esta seguro.
- Despliegue en hardware modesto: con la variante Q4_K_M (4.5 GB) corre en una GPU de 6 GB, lo que permite ofrecer el asistente en un portatil o en un servidor de gama baja sin coste de API.
- Base para ajuste fino adicional: al ser Apache 2.0 y estar disponible tambien en safetensors (repo base), un equipo puede reentrenar el comportamiento culinario para otro idioma o dominio usando el GGUF solo para inferencia.
- Evaluacion de sistemas RAG culinarios: el modelo sirve como componente de generacion en un pipeline de recuperacion aumentada, ya que su diseno asume que los hechos los aporta la recuperacion y el modelo solo redacta y calcula.

## Benchmarks y rendimiento

Los datos proceden de la model card y se midieron sobre un conjunto fijo de 682 preguntas culinarias en 21 idiomas, puntuado por tres jueces de pesos abiertos con acuerdo 2 de 3. La columna "base" es OLMo 3 7B preentrenado sin ajuste de instrucciones, por lo que la comparacion con el modelo ajustado es de referencia baja.

| Metrica | OLMo 3 7B base | Este modelo (v2) | Qwen3-8B Cooking Assistant v1 |
|---|---|---|---|
| Inventa, sin receta: todos los idiomas | 49.3% | 21.1% | 6.8% |
| Inventa, sin receta: ingles | 52.2% | 4.4% | 2.9% |
| Correcto, con receta mostrada: todos los idiomas | 52.0% | 80.3% | 92.0% |
| Correcto, con receta mostrada: ingles | 70.4% | 91.5% | 91.7% |
| Preguntas generales: todos los idiomas (82) | 17.1% | 22.0% | 48.8% |
| Preguntas generales: ingles (20) | 55% | 65% | 65% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las filas de preguntas generales se basan en 82 y 20 items respectivamente, por lo que su intervalo de confianza es amplio.

## Requisitos de hardware

- VRAM estimada para inferencia: 4.5 GB con Q4_K_M, 6.0 GB con Q6_K, 7.8 GB con Q8_0 y 14.6 GB con BF16 (tamanos de fichero; la VRAM real depende del contexto y del backend).
- GPU recomendadas: la model card indica que Q4_K_M funciona en tarjetas de 6 GB o superiores, Q6_K en tarjetas de 8 GB y Q8_0 en tarjetas de 10 GB o superiores.
- Cabe en GPU de consumo: si, en tarjetas de 6 GB en adelante con Q4_K_M (por ejemplo, una RTX 3060 de 6 GB o superior); Q6_K requiere 8 GB y Q8_0 10 GB.
- Opciones de despliegue: llama.cpp (`llama-server -hf ...:Q4_K_M --jinja -c 8192`), Ollama (`ollama run hf.co/...:Q4_K_M`) y LM Studio. Para pesos completos, el repo base en safetensors soporta Transformers y vLLM.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Olmo-3-7B-Cooking-Assistant (este) | 7.298 M | no disponible | Apache 2.0 | Cocina en ingles, con receta en el prompt | GGUF en HF; safetensors en repo base |
| Qwen3-8B-Cooking-Assistant | no disponible | no disponible | no disponible en la informacion | Cocina, mejor en preguntas generales y fuera del ingles | GGUF en HF (misma familia) |
| GLM-4-9B-Cooking-Assistant | no disponible | no disponible | no disponible en la informacion | Cocina | GGUF en HF (misma familia) |
| OLMo 3 7B (base, Ai2) | 7.298 M | no disponible | no disponible en la informacion | Modelo general de pesos abiertos | Pesos abiertos por Ai2 |

El modelo hermano Qwen3-8B supera a este en inventacion sin receta (6.8% frente a 21.1% en todos los idiomas), en acierto con receta fuera del ingles (92.0% frente a 80.3%) y en preguntas generales (48.8% frente a 22.0%). En ingles con receta mostrada ambos estan practicamente empatados (91.7% frente a 91.5%). La ventaja de este modelo es su menor tamano y su despliegue en GPUs de 6 GB.

## Limitaciones y advertencias

- Es un ajuste fino no oficial de OLMo 3 7B; no esta hecho ni respaldado por Ai2.
- Rendimiento notablemente inferior al Qwen3-8B de la misma familia fuera del ingles y en preguntas generales (22.0% frente a 48.8% en el conjunto multilingue de 82 preguntas).
- Solo declara soporte de ingles; el comportamiento en otros idiomas no esta garantizado.
- Riesgo de alucinacion: aunque bajo en ingles sin receta (4.4%), sube al 21.1% en el conjunto multilingue sin receta.
- No memoriza recetas: si la aplicacion no le proporciona el texto, el modelo puede pedirlo o responder de forma incompleta.
- No dispone de tool calling, modo de razonamiento ni capacidades multimodales, lo que limita su uso en pipelines agenticos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre exactitud en seguridad alimentaria; las respuestas no deben sustituir asesoramiento profesional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.
- El contexto maximo no esta documentado; el ejemplo oficial usa 8192 tokens en llama-server, pero no se confirma que sea el limite del modelo.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/HumanjavaEnterprises/Olmo-3-7B-Cooking-Assistant-GGUF
- Modelo base en safetensors: https://huggingface.co/HumanjavaEnterprises/Olmo-3-7B-Cooking-Assistant
- Hermano Qwen3-8B: https://huggingface.co/HumanjavaEnterprises/Qwen3-8B-Cooking-Assistant-GGUF
- Hermano GLM-4-9B: https://huggingface.co/HumanjavaEnterprises/GLM-4-9B-Cooking-Assistant-GGUF
- Guia del autor: https://github.com/HumanjavaEnterprises/qwen3-8b-cooking-assistant/tree/main/olmo-3-7b
- Dataset de evaluacion: https://huggingface.co/datasets/HumanjavaEnterprises/cooking-assistant-eval
