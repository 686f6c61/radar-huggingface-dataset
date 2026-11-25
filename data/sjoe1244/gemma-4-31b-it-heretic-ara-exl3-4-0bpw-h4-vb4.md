# sjoe1244/gemma-4-31b-it-heretic-ara-exl3-4.0bpw-h4-vb4

## Resumen

Este repositorio contiene una cuantización EXL3 de 4.0 bits por peso (bpw) del modelo `trohrbaugh/gemma-4-31b-it-heretic-ara`, una versión "decensurada" mediante ablación de rangos arbitrarios (ARA, Arbitrary-Rank Ablation) del `google/gemma-4-31b-it`. La cadena de linaje es clara: Google publica el Gemma 4 31B instruction-tuned, trohrbaugh le aplica la técnica Heretic v1.2.0 con ablación ARA para reducir los rechazos, y sjoe1244 lo comprime a 4 bits con ExLlamaV3 1.6.7, incluyendo el torre de visión cuantizada. El resultado es un modelo multimodal (image-text-to-text) ejecutable en una sola GPU de 24 GB.

La relevancia de esta ficha no está en la arquitectura original de Gemma 4 (propiedad de Google), sino en el pipeline de cuantización y en el efecto medible de la ablación. El autor documenta con rigor métricas de divergencia KL, acuerdo top-1 y perplejidad frente al BF16 de referencia, algo poco habitual en cuantizaciones comunitarias. El modelo está pensado exclusivamente para TabbyAPI o ExLlamaV3: no funciona en Transformers, vLLM ni llama.cpp.

Un dato importante que conviene señalar de entrada: el campo `safetensors` del repositorio declara 9.256.091.884 parámetros, muy por debajo de los 31B que sugiere el nombre. Esa cifra corresponde probablemente a los tensores realmente almacenados en el checkpoint EXL3 (pesos cuantizados y metadatos), no al número de parámetros del modelo original. El tamaño del repo (18,5 GB) es coherente con un modelo de ~31B a 4 bpw, no con uno de 9B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (decoder de texto + torre de visión), basado en Gemma 4 31B IT; cuantizado en formato EXL3 |
| Parametros totales | 31B según nomenclatura del modelo base; el checkpoint declara 9.256.091.884 en safetensors (tensores cuantizados, no parámetros equivalentes) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens en el modelo base (referencia indirecta en la model card); techo real en 24 GB no medido |
| Tipos de cuantizacion | EXL3 4.0 bpw en decoder, lm_head a 4 bpw y torre de visión a 4 bpw; codebook mul1; output scales auto; caché KV configurable (FP16, Q8, Q6, Q4) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors en formato EXL3 (ExLlamaV3); no compatible con GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 31B instruction-tuned de Google, un transformer decoder con torre de visión integrada para entrada image-text-to-text. Sobre esa base, trohrbaugh aplica Heretic v1.2.0 con ablación de rangos arbitrarios (ARA), una técnica que modifica los pesos para eliminar direcciones asociadas a comportamientos de rechazo sin reentrenar. El autor del modelo base reporta una divergencia KL de 0,0120 frente al Gemma original y una reducción de rechazos de 98/100 a 5/100 en su conjunto de evaluación.

La cuantización la realiza sjoe1244 con ExLlamaV3 1.6.7 usando 250 filas × 2.048 columnas de calibración (mezcla de calibración incluida en exllamav3). Se cuantizan por separado el decoder, la cabeza de salida y la torre de visión, todos a 4 bpw. El proceso se documenta con el comando de conversión exacto (`-b 4.0 -hb 4 -vb 4`). No hay información sobre el número de tokens de entrenamiento del Gemma 4 original ni sobre la composición del dataset, más allá de lo que Google publique en su documentación oficial.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat instruction-tuned.
- Razonamiento aritmético y lógico básico: el autor verifica 17×23 = 391 y la inversión de cadena `s[::-1]` con decodificación greedy (3 de 3 comprobaciones superadas).
- Comprensión de imágenes: la torre de visión está incluida y cuantizada; el autor verifica la descripción correcta de una imagen de prueba (gatito atigrado con gorro de ganchillo).
- Conocimiento factual general (verificado con la pregunta sobre Canberra).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Comportamiento "decensurado": los rechazos se reducen drásticamente respecto al modelo original (5/100 frente a 98/100 según el autor del modelo base).

## Casos de uso

- Asistente conversacional multimodal en local: con 17,1 GiB de VRAM a 16K de contexto y visión activa en una RTX 3090 Ti, permite desplegar un chatbot que acepta imágenes y texto en una estación de trabajo con una sola GPU consumer de gama alta.
- Análisis de documentos con capturas o diagramas: la torre de visión cuantizada permite extraer información de imágenes junto con texto en el mismo prompt, útil para revisión de tickets, capturas de error o esquemas técnicos.
- Generación de texto sin restricciones temáticas para investigación: el ajuste ARA reduce los rechazos, lo que resulta útil en estudios sobre seguridad, sesgos o comportamiento de modelos, siempre que se respeten los términos de la licencia Gemma y la legislación aplicable.
- Prototipado rápido con TabbyAPI: la integración nativa con TabbyAPI y ExLlamaV3 permite levantar un servidor compatible con la API de OpenAI en minutos, con caché KV cuantizada para estirar el contexto en 24 GB.
- Evaluación comparativa de cuantizaciones: las métricas publicadas (KL, acuerdo top-1, perplejidad) permiten usar este checkpoint como referencia para medir el impacto de distintas cuantizaciones EXL3 sobre el mismo modelo base.
- Inferencia de bajo coste en hardware de gama alta consumer: a ~44 tok/s en una RTX 3090 Ti, es viable para tareas interactivas de escritura, resumen o clasificación sin depender de APIs en la nube.
- Pruebas de robustez frente a cuantización agresiva: con KL de 0,0244 y 95,30 % de acuerdo top-1 frente al BF16, sirve para estudiar hasta qué punto un modelo de 31B tolera 4 bpw en tareas de razonamiento y visión.

## Benchmarks y rendimiento

Datos publicados por el autor de la cuantización, medidos con `eval/model_diff.py` de exllamav3 sobre 50 filas × 2.048 tokens de wikitext-2 con prompt de chat:

| Metrica | Este quant (4.0bpw-h4-vb4) | BF16 de referencia |
|---|---|---|
| Divergencia KL (quant ‖ BF16) | 0,0244 | 0 (por definición) |
| Acuerdo top-1 | 95,30 % | 100 % |
| Perplejidad | 18,51 | 18,42 |

Comparativa dentro de la misma familia de cuantizaciones ARA:

| Cuantizacion | KL vs BF16 | Acuerdo top-1 |
|---|---|---|
| 8.0bpw-h8-vb8 | 0,00037 | 99,47 % |
| 6.0bpw-h8 | 0,0023 | 98,58 % |
| 4.5bpw-h8-vb6 | 0,0177 | 95,93 % |
| 4.0bpw-h4-vb4 (este) | 0,0244 | 95,30 % |

Métricas del modelo base (BF16, según trohrbaugh, no de esta cuantización):

| Metrica | heretic-ara (BF16) | google/gemma-4-31b-it |
|---|---|---|
| Divergencia KL | 0,0120 | 0 (por definición) |
| Rechazos | 5/100 | 98/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~17,1 GiB asignados en una RTX 3090 Ti tras cargar texto y visión con caché FP16 de 16.384 tokens y `max_batch_size=1`.
- GPU recomendadas: RTX 3090 Ti, RTX 4090, RTX 5090, A100, H100. Cualquier GPU con al menos 24 GB de VRAM es el objetivo de diseño.
- Cabe en GPU consumer: sí, en tarjetas de 24 GB o más. El techo de contexto en 24 GB no se ha medido; un modelo hermano de mismo tamaño y bpw alcanzó 262K con caché Q4 en 32 GB.
- Opciones de despliegue: exclusivamente TabbyAPI o ExLlamaV3. No es compatible con Transformers, vLLM ni llama.cpp.
- Configuración recomendada: `max_batch_size=1` o caché KV cuantizada (Q4/Q6/Q8); el valor por defecto `max_batch_size=16` reserva caché de ventana deslizante para 16 secuencias y consume varios GB adicionales.
- Latencia y throughput: ~44 tok/s de generación en RTX 3090 Ti con exllamav3 1.6.7 y torch 2.11.0+cu128.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Este (gemma-4-31b-it-heretic-ara EXL3 4.0bpw) | 31B (nominal) | 262K (modelo base) | EXL3 / TabbyAPI, ExLlamaV3 | Apache 2.0 | Decensurado, visión incluida, ~17,1 GiB VRAM |
| gemma-4-31b-it-heretic-ara-exl3-8.0bpw-h8-vb8 (misma familia) | 31B | 262K | EXL3 | Apache 2.0 | KL 0,00037, acuerdo 99,47 %; requiere más VRAM |
| gemma-4-31b-it-heretic-ara-exl3-6.0bpw-h8 (misma familia) | 31B | 262K | EXL3 | Apache 2.0 | KL 0,0023, acuerdo 98,58 % |
| gemma-4-31b-it-heretic-ara-exl3-4.5bpw-h8-vb6 (misma familia) | 31B | 262K | EXL3 | Apache 2.0 | KL 0,0177, acuerdo 95,93 % |
| google/gemma-4-31b-it (original) | 31B | 262K | BF16, ecosistema Gemma | Licencia Gemma 4 | Sin decensurar; rechazos 98/100 |

No se dispone de comparativas con modelos de otros linajes (Llama, Qwen, Mistral) en la información proporcionada.

## Limitaciones y advertencias

- Guardarraíles reducidos de forma deliberada: el ajuste ARA elimina buena parte de los rechazos, lo que aumenta el riesgo de generar contenido dañino, sesgado o inapropiado. El autor lo advierte explícitamente.
- La divergencia KL de 0,0244 y el 95,30 % de acuerdo top-1 implican que aproximadamente 1 de cada 20 tokens predichos difiere del BF16; en tareas sensibles a la precisión (código, matemáticas, extracción estructurada) conviene validar los resultados.
- La perplejidad sube de 18,42 a 18,51, un incremento pequeño pero medible que puede acumularse en generaciones largas.
- No es compatible con Transformers, vLLM ni llama.cpp; el ecosistema de despliegue queda limitado a TabbyAPI y ExLlamaV3.
- El techo real de contexto en 24 GB no se ha medido; usar el valor por defecto de `max_batch_size=16` puede agotar la VRAM por la caché de ventana deslizante.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento en castellano ni en otros idiomas distintos del inglés.
- El campo `safetensors` declara 9.256.091.884 parámetros, incoherente con el nombre del modelo (31B); conviene verificar el conteo real antes de planificar despliegues.
- La licencia Apache 2.0 del repositorio remite a la licencia de Gemma 4 de Google; es responsabilidad del usuario verificar el cumplimiento de los términos de uso de Gemma en su jurisdicción y para uso comercial.
- El modelo base es una modificación no oficial de Gemma 4; Google no respalda ni garantiza su comportamiento.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a los modelos de lenguaje de esta escala.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sjoe1244/gemma-4-31b-it-heretic-ara-exl3-4.0bpw-h4-vb4
- Modelo base (BF16, Heretic ARA): https://huggingface.co/trohrbaugh/gemma-4-31b-it-heretic-ara
- Modelo original de Google: https://huggingface.co/google/gemma-4-31b-it
- Cuantización 8.0bpw-h8-vb8: https://huggingface.co/sjoe1244/gemma-4-31b-it-heretic-ara-exl3-8.0bpw-h8-vb8
- Cuantización 6.0bpw-h8: https://huggingface.co/sjoe1244/gemma-4-31b-it-heretic-ara-exl3-6.0bpw-h8
- Cuantización 4.5bpw-h8-vb6: https://huggingface.co/sjoe1244/gemma-4-31b-it-heretic-ara-exl3-4.5bpw-h8-vb6
- ExLlamaV3 (repositorio): https://github.com/turboderp-org/exllamav3
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
