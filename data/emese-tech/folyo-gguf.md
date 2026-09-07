# emese-tech/folyo-gguf

## Resumen

Folyó es un modelo de lenguaje instruct de 22.000 millones de parámetros desarrollado por emese-tech, basado en el modelo EuroLLM-22B de utter-project. Está pensado principalmente para el húngaro y sigue el formato de conversación ChatML. Esta versión concreta es un archivo GGUF cuantizado a Q4_K_M, preparado para ejecutarse con llama.cpp, llama-server o cualquier cargador compatible con GGUF, lo que permite desplegarlo en entornos locales sin necesidad de infraestructura de GPU de gran escala.

El modelo destaca por su ventana de contexto de 32.768 tokens, heredada de EuroLLM-22B, y por un proceso de entrenamiento adicional que combina CPT, SFT y DPO. La relevancia de esta publicación reside en que incluye una corrección crítica del tokenizer: una exportación estándar de este modelo a GGUF rompe los tokens de control de ChatML, lo que degrada gravemente la calidad de las respuestas. Este archivo ya está corregido mediante un script específico, lo que lo convierte en una opción fiable para uso en producción dentro del ecosistema húngaro.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en EuroLLM-22B) |
| Parametros totales | 22.637.328.384 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M (este repo); también se mencionan Q8_0, MLX q8 y bf16 en otras variantes |
| Idiomas soportados | Húngaro (hu) como idioma principal; otros idiomas heredados de EuroLLM-22B |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Folyó es un modelo transformer denso basado en EuroLLM-22B, sin mezcla de expertos. El proceso de entrenamiento se compone de tres fases: un continuo pretraining (CPT) de aproximadamente 6 millones de tokens durante 6.000 iteraciones con rank 64, un ajuste supervisado (SFT) sobre el dataset `instruct_v18b` durante 1 época con rank 16, scale 16 y learning rate 5e-6 (seleccionando la iteración 3.600), y un ajuste por preferencias (DPO) con 36 pares alfa, 120 iteraciones, rank 16, scale 16 y learning rate 2e-6. Los pesos subyacentes son los mismos que la versión MLX q8, sin entrenamiento adicional en esta publicación.

La innovación técnica más relevante de esta versión es la corrección del tokenizer en el archivo GGUF. Una exportación estándar con `convert_hf_to_gguf.py` tipa los tokens de control ChatML (`<|im_start|>`, `<|im_end|>`) como NORMAL en lugar de CONTROL, lo que fragmenta estos tokens en subpalabras y corrompe la prioridad de división BPE. El script `scripts/fix_gguf_tokenizer.py` corrige estos problemas y garantiza una tokenización idéntica a la referencia HF/MLX. Sin esta corrección, el modelo presenta una regresión de calidad severa que puede confundirse con una limitación inherente de llama.cpp.

## Capacidades

- Generación de texto instruct en húngaro, siguiendo el formato ChatML con los tokens `<|im_start|>` y `<|im_end|>`.
- Ventana de contexto larga de 32.768 tokens, útil para conversaciones multi-turno y documentos extensos.
- Capacidad de seguir instrucciones complejas en húngaro, con resultados medidos en el benchmark emese-bench v1.
- Soporte para decodificación con parámetros de temperatura y repeat penalty, optimizados en 0.2 y 1.15 respectivamente.
- Hereda las capacidades generales de EuroLLM-22B en otros idiomas, aunque con un sesgo marcado hacia el húngaro.
- No se documenta soporte de tool calling o function calling en la información disponible.
- No se documenta soporte de visión, audio ni modos de razonamiento especiales.

## Casos de uso

- Atención al cliente en húngaro: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 32.768 tokens de ventana, manteniendo el hilo de la conversación y respondiendo de forma coherente en húngaro.
- Generación de contenido editorial en húngaro: redacción de artículos, resúmenes y noticias, utilizando el formato ChatML para estructurar instrucciones y obtener texto fluido.
- Análisis de sentimiento y clasificación de texto: gracias a su entrenamiento instruct, puede etiquetar opiniones, extraer entidades o clasificar documentos en húngaro con una calidad razonable.
- Asistente de soporte técnico interno: integrado en una plataforma de chat empresarial, puede responder preguntas frecuentes sobre procedimientos o documentación técnica en húngaro, con la ventaja de poder detener la generación en el token `<|im_end|>`.
- Traducción asistida húngaro-inglés: aunque es húngaro-first, su base EuroLLM-22B le permite traducir entre húngaro y otros idiomas, con la advertencia de que la calidad en inglés puede degradarse en conversaciones largas.
- Generación de informes y documentación en húngaro: útil para automatizar la redacción de actas, informes internos o documentación técnica, siempre que se verifiquen los datos fácticos.
- Asistente educativo en húngaro: puede responder preguntas sobre temas generales, aunque es débil en matemáticas multi-step y en tareas que requieren formatos estrictos como ordenación alfabética o recuento exacto de palabras.

## Benchmarks y rendimiento

El autor ha publicado resultados en su benchmark propio, emese-bench v1, para esta variante GGUF y para las variantes de referencia. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

| Variante | Puntuación emese-bench v1 |
|---|---|
| GGUF Q4_K_M (tokenizer corregido) | 404/500 (81%) |
| GGUF Q8_0 (tokenizer corregido) | 388/500 (78%) |
| MLX q8 (precisión nativa) | 410/500 (82%) |

El autor señala que la diferencia entre Q4_K_M y Q8_0 está dentro del ruido de muestreo, y que la variante Q4_K_M no es uniformemente mejor. También se detectaron fallos concretos en preguntas sobre científicos húngaros ficticios u oscuros, donde el modelo produce biografías inventadas con confianza.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M ocupa aproximadamente 13 GB en disco. Para cargar los pesos y mantener un contexto moderado, se estima un mínimo de 16 GB de VRAM en GPU. Para contextos cercanos a 32.768 tokens, la memoria adicional para la caché KV puede requerir más de 24 GB, o bien reducir el contexto.
- GPU recomendadas: RTX 4090 (24 GB) es adecuada para contexto completo. A100 o H100 también son válidas para despliegues de mayor capacidad. En consumer GPU de 16 GB, como RTX 4080, se puede ejecutar con contexto reducido.
- También puede ejecutarse en CPU con suficiente RAM; se estima que se necesitan al menos 32 GB de RAM para un uso práctico con contexto moderado.
- Opciones de despliegue: llama.cpp, llama-server, llama-cli, LM Studio, Ollama y cualquier cargador compatible con GGUF.
- Latencia y throughput: no se han publicado datos de rendimiento específicos en la información disponible.

## Comparativa con modelos similares

No se dispone de información sobre comparativas con otros modelos de la misma categoría en la documentación proporcionada. El modelo base es EuroLLM-22B, que comparte arquitectura, parámetros y contexto, pero no se ofrecen datos de rendimiento comparativos con otras alternativas del mercado.

## Limitaciones y advertencias

- Puede alucinar datos fácticos concretos, como fechas, atribuciones o detalles biográficos. Se recomienda verificar cualquier información crítica.
- Dos preguntas específicas del benchmark sobre científicos húngaros ficticios u oscuros producen biografías fabricadas con confianza en todas las variantes probadas de la familia.
- Es un modelo húngaro-first. La calidad en otros idiomas es heredada de EuroLLM-22B, y no mantiene el inglés a lo largo de una conversación multi-turno si el usuario escribe en inglés, derivando hacia el húngaro. Esta debilidad está presente en el modelo original, no es un fallo de la conversión a GGUF.
- Es débil en matemáticas de varios pasos, estimación espacial y en tareas que exigen restricciones de formato estrictas, como ordenación alfabética, recuento exacto de palabras o letras prohibidas.
- El archivo GGUF es grande: incluso en Q4_K_M ocupa unos 13 GB, lo que condiciona el despliegue en hardware doméstico.
- Advertencia crítica para quien regenere el GGUF desde código fuente: es obligatorio ejecutar el script `fix_gguf_tokenizer.py` (o aplicar el parche de metadatos equivalente) tras la conversión y cuantización. Sin esta corrección, el modelo produce respuestas gravemente degradadas.

## Enlaces

- HuggingFace: https://huggingface.co/emese-tech/folyo-gguf
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios) en la información disponible.
