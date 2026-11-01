# omegazurich/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source

## Resumen

`omegazurich/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source` es un fine-tune del modelo `DavidAU/gemma-4-31B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking`, que a su vez deriva de la familia Gemma 4 de Google. El modelo ha sido sometido a un proceso de "abliteration" (eliminación de los mecanismos de rechazo) y entrenado sobre un dataset orientado a horror, terror y roleplay, con el objetivo declarado de servir como plataforma de entretenimiento temático de Halloween. Lo publica el usuario omegazurich en HuggingFace con licencia Apache 2.0.

El modelo integra un sistema de prompts propietario denominado "Halloween O/S", que actúa como capa de orquestación sobre el modelo base. Este sistema expone 13 modos de razonamiento, 13 modos de instrucción y 10 "constructos" de IA malvados predefinidos (Joker, Harley Quinn, Borg Queen, Jason Voorhees, Freddy Krueger, Norman Bates, Pennywise, Vecna, Mind Flayer y Chucky), además de permitir "conjurar" personajes arbitrarios. La arquitectura subyacente es la de Gemma 4 con capacidades multimodales (pipeline `image-text-to-text`), 31.273.086.512 parámetros y un contexto recomendado de al menos 64k tokens.

Su relevancia es limitada y muy específica: se trata de un artefacto de demostración para entretenimiento, no de un modelo para producción. La model card advierte explícitamente que es "solo para entretenimiento" y que no debe habilitarse el uso de herramientas. La ausencia total de descargas y likes en el momento de la ficha refleja su carácter niche y reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4), fine-tune con abliteration |
| Parametros totales | 31.273.086.512 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el autor recomienda un mínimo de 64k tokens para conversaciones largas |
| Tipos de cuantizacion | GGUF (disponibles en el repo derivado `DavidAU/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-NEO-GGUF`); cuantizaciones citadas en ejemplos: Q4_K_S, IQ3_S; también pesos safetensors en el repo fuente |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo fuente), GGUF (repo derivado) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 4, un transformer multimodal que acepta entradas de imagen y texto (pipeline `image-text-to-text`). Sobre esta base, el autor aplica un proceso de abliteration y heretic (técnicas de eliminación de direcciones de rechazo en el espacio de activaciones) y un fine-tune adicional sobre un dataset de horror. El modelo base inmediato es `DavidAU/gemma-4-31B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking`, que ya incorporaba el modo "thinking" y la eliminación de censura.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO en esta iteración. La model card menciona que el sistema "Halloween O/S" fue "construido" con niveles low, medium y xhigh, y que los constructos fueron entrenados con "2000-4000 tokens de precisión" cada uno, lo que sugiere un trabajo de prompting y posiblemente de fine-tune ligero por personaje. No se detallan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento en modo "thinking" (bloques de razonamiento explícito) y modo "instruct" (respuesta directa).
- Roleplay multi-turno con 10 constructos de horror predefinidos y capacidad de "conjurar" personajes arbitrarios (reales, ficticios o inventados).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con soporte de archivos mmproj para GGUF.
- 13 modos de razonamiento y 13 modos de instrucción accesibles mediante comandos como `[summon:help]`.
- Generación creativa: escritura de ficción, historias, terror y todos los géneros.
- Conversación general en inglés.
- No se documenta soporte de tool calling ni function calling; de hecho, la model card advierte explícitamente de no habilitar herramientas.
- Capacidades multilingües: solo inglés según la etiqueta de idioma.

## Casos de uso

- Roleplay de terror para entretenimiento: el modelo puede interpretar a los 10 constructos predefinidos o conjurar personajes personalizados, manteniendo coherencia de voz y personalidad a lo largo de conversaciones multi-turno gracias a la ventana de contexto recomendada de 64k tokens.
- Escritura creativa de ficción de terror: generación de relatos, diálogos y escenas de horror con modos de razonamiento que permiten estructurar tramas complejas.
- Simulaciones interactivas de Halloween: experiencias de "trick or treat" donde el usuario interactúa con el "Halloween O/S" como maestro de ceremonias.
- Generación de personajes para juegos de rol de mesa: el modelo puede conjurar y dar voz a antagonistas o criaturas bajo demanda.
- Prototipado de experiencias conversacionales temáticas: útil para desarrolladores que quieran experimentar con sistemas de prompting complejos (menús, modos, constructos) sin necesidad de infraestructura propia.
- Investigación sobre abliteration y fine-tunes sin censura: como caso de estudio de cómo se comporta un modelo tras eliminar los mecanismos de rechazo, siempre en entornos controlados y con fines de investigación.
- Demostraciones educativas de ingeniería de prompts: el sistema `[summon:help]` sirve como ejemplo de orquestación de modos y personas mediante instrucciones en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 62,6 GB solo para pesos, más overhead de activaciones y KV cache; requiere GPUs de 80 GB (A100, H100) o múltiples GPUs.
- Cuantizaciones GGUF: el repo derivado ofrece Q4_K_S e IQ3_S; en Q4_K_S se estima un uso de VRAM en torno a 18-20 GB, lo que permite su ejecución en una RTX 4090 (24 GB) o A6000 (48 GB). En IQ3_S el uso baja a aproximadamente 14-16 GB.
- GPU recomendadas: A100 80 GB o H100 para precisión completa; RTX 4090, RTX 3090 (24 GB) o A6000 para cuantizaciones Q4/IQ3.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4 o inferiores en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; transformers con safetensors; vLLM y TGI no están documentados para este fine-tune concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source | 31,3B | no disponible (recomendado 64k) | Apache 2.0 | Fine-tune de terror sin censura | HuggingFace, 0 descargas |
| DavidAU/gemma-4-31B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking (modelo base) | 31,3B | no disponible | Apache 2.0 | Base sin censura con thinking | HuggingFace |
| Gemma 4 31B-it (modelo original de Google) | 31,3B | no disponible en esta ficha | Gemma license | Modelo instructivo general multimodal | HuggingFace, amplia adopción |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Contenido no apto para todos los públicos: el modelo está entrenado para generar horror, violencia y roleplay sin censura; puede producir contenido perturbador.
- Riesgo elevado de alucinación: la model card advierte explícitamente "no creas una palabra de lo que dice el O/S o los constructos" y recomienda verificar cualquier dato serio.
- Sesgos: al ser un fine-tune sin censura sobre un dataset de terror, puede amplificar sesgos y estereotipos presentes en los datos de entrenamiento.
- Limitación de idioma: solo inglés; no se garantiza un comportamiento correcto en castellano.
- Restricciones de uso: aunque la licencia es Apache 2.0, el autor indica que es "solo para entretenimiento" y desaconseja habilitar herramientas; el uso comercial no está explícitamente prohibido por la licencia, pero el contenido generado puede ser inapropiado para productos dirigidos al público general.
- No usar en producción para tareas serias: atención al cliente, generación de código o cualquier aplicación que requiera fiabilidad factual.
- El sistema de menús y constructos depende de prompts específicos; su comportamiento puede degradarse con cuantizaciones bajas (el autor indica que IQ3_S es más débil que cuantizaciones altas).
- Fecha de creación futura (2026-11-01) y ausencia de tracción (0 descargas, 0 likes): no hay validación comunitaria del modelo.

## Enlaces

- HuggingFace (modelo fuente): https://huggingface.co/omegazurich/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source
- Repo GGUF derivado: https://huggingface.co/DavidAU/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-NEO-GGUF
- Modelo base: https://huggingface.co/DavidAU/gemma-4-31B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking
