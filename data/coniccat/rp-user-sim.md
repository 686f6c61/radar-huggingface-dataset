# ConicCat/RP-User-Sim

## Resumen

RP-User-Sim es un ajuste fino (fine-tune) de 8.190 millones de parámetros publicado por el usuario ConicCat en HuggingFace. Se trata de una adaptación del modelo base cmu-lti/osim-8b, etiquetada en el repositorio dentro de la familia qwen3, cuyo propósito es actuar como simulador de usuario en conversaciones de roleplay (RP). El modelo no genera las respuestas del asistente, sino el siguiente turno del usuario humano, lo que lo convierte en una herramienta de generación de datos sintéticos y de evaluación de sistemas conversacionales.

La relevancia de este modelo es acotada y muy específica: resuelve el problema de disponer de un "usuario sintético" coherente para probar, evaluar o ampliar datasets de diálogo en dominios de roleplay. Frente a alternativas genéricas, el ajuste se ha realizado sobre turnos de usuario de un dataset C2 con todo el texto relacionado con presets eliminado, de modo que el modelo aprende el estilo de intervención del usuario y no el contenido de configuración del sistema.

El modelo tiene 33 descargas y 0 likes en el momento de redactar esta ficha, con un repositorio de 16,7 GB en formato safetensors y licencia Apache 2.0. No se han publicado datos sobre longitud de contexto, idiomas soportados ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (etiquetado como qwen3 en HuggingFace; derivado de cmu-lti/osim-8b) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo contiene pesos safetensors; no se listan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la model card. El modelo se presenta como un fine-tune del modelo base cmu-lti/osim-8b, con 8.190.735.360 parámetros totales, y la etiqueta qwen3 del repositorio sugiere que la familia subyacente es Qwen3 en su variante de 8B. Al no publicarse detalles de capas, atención ni configuración de contexto, estos datos deben considerarse no disponibles.

El entrenamiento se describe de forma muy breve en la model card: se trata de una "adaptación rápida como simulador de usuario para RP", entrenada sobre turnos de usuario del dataset C2 con todo el texto relacionado con presets eliminado. El formato de entrenamiento consiste en añadir el sufijo `"Act as a user simulator. Output the next user response."` como turno de usuario al final de la conversación. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF, DPO u otras. El autor recomienda añadir la instrucción `"Respond in at most 60 words."` porque, según indica, el modelo tiende a generar respuestas demasiado largas ("yappy") sin esa restricción.

## Capacidades

- Simulación de usuario: genera el siguiente turno de un usuario humano en una conversación de roleplay, a partir del historial de diálogo.
- Formato de invocación específico: requiere añadir `"Act as a user simulator. Output the next user response."` como turno de usuario al final del contexto.
- Control de longitud mediante prompt: responde a la instrucción `"Respond in at most 60 words."` para limitar la extensión de la salida.
- Generación de datos sintéticos de diálogo: puede producir turnos de usuario para ampliar o diversificar datasets conversacionales.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; no se listan idiomas en el repositorio.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Evaluación de chatbots de roleplay: el modelo permite generar turnos de usuario automáticos para medir la coherencia, la consistencia de personaje y la capacidad de respuesta de un asistente conversacional a lo largo de diálogos multi-turno, sin necesidad de anotadores humanos.
- Generación de datasets sintéticos de diálogo: se puede usar para producir corpus de conversaciones usuario-asistente en dominios de RP, útiles para entrenar o ajustar otros modelos conversacionales.
- Pruebas de regresión en pipelines de chat: integrándolo en una batería de pruebas, genera entradas de usuario reproducibles para detectar degradaciones en las respuestas de un asistente tras cada actualización.
- Red-teaming conversacional: al simular usuarios con distintos estilos de intervención, permite explorar cómo responde un sistema ante turnos ambiguos, cortos o fuera de guion.
- Prototipado de sistemas de diálogo antes de disponer de usuarios reales: en fases tempranas de desarrollo, sustituye a participantes humanos en sesiones de prueba exploratorias.
- Simulación de usuarios en entornos de agentes: dentro de un pipeline donde un agente ejecuta tareas conversacionales, este modelo puede hacer de contraparte humana para validar el flujo completo.
- Aumento de variedad en datasets de RP existentes: reescribiendo turnos de usuario con distintas formulaciones y longitudes (aplicando la restricción de 60 palabras) para reducir el sesgo de estilo en los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16) sobre 8.190 millones de parámetros: aproximadamente 16,4 GB solo de pesos, más overhead de activaciones y caché KV; en la práctica, del orden de 18-20 GB.
- Cuantización a 8 bits: aproximadamente 8-9 GB de pesos.
- Cuantización a 4 bits: aproximadamente 4,5-5 GB de pesos (no se ofrecen ficheros cuantizados en el repositorio; habría que generarlos).
- GPU profesionales recomendadas: A100 (40/80 GB), H100, L40S; sobran para fp16 y permiten lotes grandes.
- GPU de consumo compatibles: RTX 4090, RTX 3090 y RTX A6000 (24 GB) pueden ejecutar el modelo en fp16; RTX 4080/4070 Ti (16 GB) requieren cuantización a 8 bits o inferior; RTX 3060 12 GB y RTX 4070 requieren 4 bits.
- Opciones de despliegue: transformers (referencia), vLLM y TGI para servir en fp16/bf16, y llama.cpp u Ollama si se convierte previamente a GGUF, ya que el repositorio no incluye ficheros GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ConicCat/RP-User-Sim | 8,19 B | No disponible | Apache 2.0 | HuggingFace, safetensors | Fine-tune orientado a simulación de usuario en RP |
| cmu-lti/osim-8b | No disponible | No disponible | No disponible en la información proporcionada | HuggingFace | Modelo base del que deriva RP-User-Sim |
| Qwen3-8B | ~8,2 B | No disponible en la información proporcionada | Apache 2.0 | HuggingFace, safetensors y GGUF | Modelo generalista de la misma familia y tamaño; no especializado en simulación de usuario |
| Llama-3.1-8B | ~8,0 B | No disponible en la información proporcionada | Licencia comunitaria de Llama 3.1 | HuggingFace, safetensors y GGUF | Alternativa generalista de tamaño similar; requiere conversión o fine-tune para simulación de usuario |

Los datos de benchmark comparativos no están disponibles en la información proporcionada, por lo que no se puede establecer una comparación de rendimiento objetiva entre estos modelos.

## Limitaciones y advertencias

- Modelo de nicho: solo está entrenado para emitir el siguiente turno de usuario en conversaciones de roleplay; no es un asistente general y su uso fuera de ese formato de prompt producirá resultados degradados.
- Sesgos conocidos: no documentados, pero al entrenarse sobre turnos de usuario de un dataset concreto (C2) heredará los sesgos de estilo, temática y registro de ese corpus.
- Riesgo de alucinación: no evaluado ni documentado; al generar texto libre, puede producir contenido incoherente con el contexto o inventar información del personaje.
- Tendencia a respuestas largas: el propio autor advierte que el modelo "salió charlatán" y recomienda añadir la instrucción de limitar la respuesta a 60 palabras; sin ella, las salidas pueden ser excesivamente extensas.
- Restricción de formato: el modelo espera el sufijo `"Act as a user simulator. Output the next user response."` como turno de usuario; alterar ese formato puede reducir la calidad de la generación.
- Idiomas soportados no declarados: se desconoce si funciona correctamente en castellano u otros idiomas distintos del inglés.
- Longitud de contexto no especificada: no hay garantía documentada sobre cuántos turnos previos puede manejar de forma fiable.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero conviene verificar las condiciones del modelo base cmu-lti/osim-8b, cuya licencia no se detalla en la información disponible.
- Madurez: 33 descargas y 0 likes indican un modelo sin validación comunitaria significativa; no se recomienda su uso en producción sin una evaluación propia previa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ConicCat/RP-User-Sim
- Modelo base: https://huggingface.co/cmu-lti/osim-8b
- Búsqueda web: no se han encontrado enlaces relevantes al modelo (papers, blogs, repos o demos) en los resultados de búsqueda disponibles.
