# ReadyArt/Vesper-31B-Nocturne

## Resumen

Vesper-31B-Nocturne es un ajuste fino (finetune) del modelo google/gemma-4-31B-it, desarrollado por el usuario ReadyArt y publicado en Hugging Face bajo licencia Apache 2.0. El modelo hereda la arquitectura y el tamaño del modelo base: 31.273.088.876 parámetros totales, con un repositorio de 62,6 GB en formato safetensors. Su propósito declarado es la generación de texto conversacional orientada a roleplay, contenido para adultos y narrativa multi-personaje (ensemble), según las etiquetas de la model card.

El modelo se posiciona en el nicho de los finetunes de rol conversacional sin censura, un segmento con demanda constante entre desarrolladores de aplicaciones de ficción interactiva, videojuegos narrativos y asistentes de personaje. Al estar construido sobre un modelo instructivo de Google, conserva la base técnica de Gemma 4 pero se especializa en diálogo sostenido, cambio de registro entre personajes y contenido maduro explícito, algo que los modelos alineados por defecto suelen rechazar.

La relevancia actual del modelo es limitada pero concreta: no hay descargas ni interacciones registradas en el momento de la consulta (0 descargas, 0 likes), lo que indica que es un lanzamiento muy reciente (creado el 9 de noviembre de 2026) y sin validación comunitaria. Su interés radica en ser un ejemplo de especialización vertical sobre una base de 31B con licencia permisiva, lo que permite uso comercial sin restricciones adicionales, algo poco habitual en el ecosistema de modelos de rol.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de google/gemma-4-31B-it); detalles internos no disponibles |
| Parámetros totales | 31.273.088.876 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune del modelo instructivo google/gemma-4-31B-it, según declara la model card (`base_model_relation: finetune`). No se especifica en la información disponible la arquitectura interna exacta de Gemma 4 (número de capas, dimensiones, mecanismo de atención, uso de atención lineal o decodificación especulativa), por lo que estos detalles se marcan como no disponibles. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset de ajuste, ni si se emplearon técnicas de RLHF, DPO o SFT.

La única información técnica sobre el entrenamiento es la orientación del ajuste: las etiquetas `nsfw`, `roleplay`, `adult-content`, `mature`, `conversational`, `multi-character` y `ensemble` indican que el finetune se ha especializado en diálogo de personajes, contenido explícito y conversaciones con múltiples interlocutores. No se han publicado detalles sobre el proceso de curación de datos, la metodología de alineación ni las innovaciones técnicas aplicadas. La model card original incluye principalmente maquetación HTML/CSS y no aporta información sustantiva sobre el entrenamiento.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Roleplay y adopción de personajes, incluyendo conversaciones con múltiples personajes simultáneos (ensemble).
- Generación de contenido para adultos y material maduro explícito (NSFW), sin las restricciones típicas de los modelos alineados por defecto.
- Narrativa interactiva y ficción conversacional.
- Capacidades heredadas del modelo base Gemma 4 instructivo (razonamiento y generación general), aunque no se documenta su preservación tras el finetune.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Aplicaciones de ficción interactiva: el modelo puede sostener conversaciones multi-turno con personajes consistentes, adecuado para novelas visuales y juegos de rol por texto donde se requiere contenido maduro sin filtros.
- Simulaciones de rol con múltiples personajes: la etiqueta `ensemble` sugiere capacidad para gestionar diálogos con varios personajes en una misma escena, útil en motores de narrativa ramificada.
- Asistentes de escritura creativa para adultos: generación de diálogos y escenas explícitas en proyectos de ficción, donde los modelos alineados por defecto suelen rechazar la tarea.
- Prototipado de chatbots de personaje: al tener licencia Apache 2.0, permite integrar el modelo en productos comerciales de entretenimiento conversacional sin obligaciones de atribución adicionales más allá de las de la licencia.
- Investigación sobre alineación y contenido: útil como caso de estudio de finetunes que revierten el alineamiento de seguridad del modelo base, para analizar comportamientos y riesgos.
- Despliegue en infraestructura propia: el formato safetensors y la licencia permisiva facilitan el autoalojamiento en entornos controlados donde no se depende de APIs externas con políticas de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 31.273 millones de parámetros, en FP16 se requieren aproximadamente 62,6 GB de VRAM (coincide con el tamaño del repo); en cuantización de 8 bits, unos 31 GB; en 4 bits, unos 16-18 GB. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados por el autor.
- GPU recomendadas: para FP16, una A100 de 80 GB o una H100; para 8 bits, una A100 de 40 GB o dos RTX 4090; para 4 bits, una RTX 4090 (24 GB) o una RTX 3090.
- ¿Cabe en GPU de consumo? En cuantización de 4 bits sí cabe en GPUs de 24 GB como la RTX 4090 o la RTX 3090; en FP16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: al estar en safetensors, es compatible con vLLM, TGI y transformers; para cuantización en GGUF sería necesario convertir los pesos, ya que no se distribuyen en ese formato. No se documenta soporte nativo en Ollama o llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Vesper-31B-Nocturne | 31,3B | no disponible | Apache 2.0 | Roleplay NSFW, multi-personaje | Hugging Face (0 descargas) |
| google/gemma-4-31B-it (base) | 31,3B | no disponible | Términos de Gemma | Instructivo general, alineado | Hugging Face / Google |
| Finetunes de rol sobre bases de 30B | variable | variable | variable | Roleplay, contenido maduro | Hugging Face (comunidad) |

La comparación con alternativas concretas no está disponible en la información proporcionada. El competidor directo más evidente es el propio modelo base google/gemma-4-31B-it, del que Vesper se diferencia por el ajuste hacia contenido NSFW y roleplay, a costa de posibles pérdidas en capacidades generales y alineamiento de seguridad. No se dispone de datos de rendimiento para comparar objetivamente.

## Limitaciones y advertencias

- Contenido para adultos: el modelo está diseñado para generar material NSFW y maduro; no es apto para todos los públicos ni para entornos sin moderación.
- Sesgos: no documentados, pero al derivar de un modelo base entrenado con datos web, es probable que herede sesgos de género, culturales y de representación; el finetune sobre contenido de rol puede amplificarlos.
- Riesgo de alucinación: no evaluado; los finetunes de rol priorizan coherencia narrativa sobre veracidad factual, lo que incrementa el riesgo en usos informativos.
- Limitaciones de idioma: solo inglés declarado; el rendimiento en castellano u otros idiomas no está garantizado.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base google/gemma-4-31B-it tiene sus propios términos de uso que pueden imponer restricciones adicionales; conviene verificar la compatibilidad antes de un despliegue comercial.
- Falta de validación: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia comunitaria de calidad, estabilidad ni ausencia de comportamientos degenerados.
- Contexto y cuantizaciones no documentados: la ausencia de estos datos dificulta la planificación de despliegue en producción.
- Sin garantías del autor: la model card no incluye información sobre evaluación, limitaciones conocidas ni casos de fallo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ReadyArt/Vesper-31B-Nocturne
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Perfil del autor: https://huggingface.co/ReadyArt
