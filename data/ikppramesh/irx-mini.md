# ikppramesh/irx-mini

## Resumen

IRx-mini es un modelo de lenguaje de aproximadamente 1.000 millones de parámetros (999.885.952 exactos según los pesos en safetensors) desarrollado por el usuario ikppramesh y publicado en Hugging Face bajo licencia Apache 2.0. Forma parte de la familia IRx, una colección de cuatro modelos diseñados para ejecutarse de forma completamente offline en dispositivos móviles, sin conexión a internet ni cuentas de usuario. IRx-mini es el miembro más pequeño de la familia y está específicamente optimizado para teléfonos con solo 4 GB de RAM, un segmento amplio del parque móvil actual (Android de gama baja y modelos antiguos).

El modelo se distribuye en formato MLX para Mac y dispone de una build GGUF paralela (irx-mini-GGUF) para su uso en teléfonos y tablets mediante aplicaciones como PocketPal. Con un tamaño de descarga de aproximadamente 1,1 GB y un consumo en memoria de unos 1,3 GB durante la inferencia, IRx-mini prioriza la ligereza y la velocidad (unos 89 tokens/s medidos en CPU de Mac) sobre la profundidad de razonamiento. Está construido sobre la arquitectura `gemma3_text` y afinado con LoRA, según las etiquetas del repositorio.

La relevancia actual de IRx-mini radica en su propuesta de privacidad radical y funcionamiento sin red: todo el procesamiento ocurre en el dispositivo, lo que elimina costes de datos, latencia de red y riesgos de filtración de información. Está pensado para contextos con conectividad limitada o costosa (zonas rurales, viajes) y para usuarios que necesitan asistencia conversacional básica sin depender de servicios en la nube. El modelo fue actualizado por última vez el 4 de noviembre de 2026, con un changelog que menciona mejoras en razonamiento paso a paso y conversación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia `gemma3_text`), afinado con LoRA |
| Parámetros totales | 999.885.952 (~1,0 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 8-bit (etiqueta del repo); build GGUF disponible en repositorio separado |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX); GGUF en `ikppramesh/irx-mini-GGUF` |

## Arquitectura y entrenamiento

IRx-mini se basa en la arquitectura `gemma3_text`, según la etiqueta del repositorio, y ha sido afinado mediante LoRA (Low-Rank Adaptation). Los pesos se distribuyen en formato MLX con cuantización de 8 bits, lo que explica que un modelo de ~1.000 millones de parámetros ocupe aproximadamente 1,1 GB en disco. El repositorio tiene un tamaño total de 2,6 GB, lo que sugiere la presencia de múltiples artefactos (pesos, tokenizador, posibles adaptadores).

La model card indica que el modelo fue entrenado con noticias hasta el 4 de noviembre de 2026 y que se "reconstruye y revisa cada semana". El changelog del 4 de noviembre de 2026 menciona la incorporación de aproximadamente 450 nuevas soluciones de problemas matemáticos y de enunciados verbales, cada una verificada contra la respuesta correcta antes del entrenamiento (descartando las incorrectas), con el objetivo de mejorar el razonamiento paso a paso. No se especifican el número total de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card indica que la identidad del modelo está entrenada de forma implícita y que la plantilla de chat mantiene el modo "thinking" desactivado por defecto.

## Capacidades

- Generación de texto conversacional para respuestas cortas y explicaciones sencillas.
- Razonamiento paso a paso en matemáticas y problemas verbales, con respuestas numeradas y respuesta final en texto plano (no LaTeX), según el changelog de noviembre de 2026.
- Asistencia en tareas cotidianas: conversiones de unidades, listas, sugerencias, cálculos simples.
- Explicaciones educativas básicas (por ejemplo, "¿qué es la fotosíntesis?").
- Redacción de mensajes breves y textos de una línea para pequeños negocios.
- Capacidades multilingües: no disponibles (no se especifican idiomas en la información).
- Tool calling / function calling: no soportado. La model card advierte explícitamente de que no se active el tool calling nativo en aplicaciones de chat porque nunca fue entrenado para ello.
- Modo thinking: desactivado por la plantilla de chat integrada.
- Sin capacidades de visión, audio ni agentes multi-paso.

## Casos de uso

- Asistencia agrícola offline: un agricultor puede consultar cuándo regar plantas de tomate o redactar un mensaje breve a un comprador sin conexión, útil en zonas rurales con conectividad débil o costosa; el modelo cabe en un teléfono de 4 GB de RAM.
- Apoyo educativo para estudiantes: explicaciones simples de conceptos (fotosíntesis) y generación de cuestionarios rápidos (por ejemplo, cinco preguntas sobre fracciones), aprovechando el razonamiento paso a paso entrenado con soluciones verificadas.
- Herramientas para pequeños comercios: redacción de ofertas de una línea y cálculos de margen (por ejemplo, "¿cómo calculo un 15 % de beneficio?") en el propio dispositivo, sin costes de API ni envío de datos a la nube.
- Consultas técnicas básicas para desarrolladores: interpretación de códigos de error HTTP (por ejemplo, 404) y explicaciones breves, adecuado por su velocidad (~89 tokens/s) para respuestas inmediatas.
- Planificación de viajes: generación de listas de equipaje cortas para dos días, conversiones de unidades (25 °C a Fahrenheit) y sugerencias prácticas, todo offline durante el viaje.
- Asistencia doméstica cotidiana: sugerencias de desayunos rápidos, conversiones y pequeñas tareas de organización personal en dispositivos de gama baja.
- Despliegue en aplicaciones móviles con requisitos de privacidad: cualquier app que necesite chat local sin enviar datos a servidores, usando la build GGUF con PocketPal en iPhone y Android.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato de rendimiento medido que aporta la model card es la velocidad de generación: aproximadamente 89 tokens/s en CPU de Mac, el más rápido de la familia IRx (IRx-1: ~51 tokens/s en la misma prueba).

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 1,3 GB en ejecución (según la model card), sobre un tamaño de descarga de ~1,1 GB.
- Cabe en teléfonos con 4 GB de RAM, que es el objetivo de diseño declarado.
- GPU recomendadas: no se especifican; el modelo está orientado a CPU y a inferencia en dispositivo (MLX en Mac, GGUF en móvil). No se mencionan A100, H100 ni RTX 4090.
- Cabe en GPU de consumo, aunque no es el caso de uso previsto; el formato MLX está pensado para Apple Silicon.
- Opciones de despliegue: `mlx-lm` en Mac (con `pip install mlx-lm`); build GGUF para teléfonos y tablets, típicamente mediante PocketPal en iPhone y Android. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~89 tokens/s en CPU de Mac (medición del autor); no se aportan datos de latencia ni throughput en móvil.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IRx-mini | ~1,0 B | No disponible | Offline en móvil de 4 GB, MLX + GGUF | Apache 2.0 | Hugging Face (MLX y GGUF) |
| IRx-1 | No disponible (~1,2 GB de descarga) | No disponible | Respuestas rápidas en casi cualquier teléfono | No disponible | Hugging Face (MLX y GGUF) |
| IRx-2 | No disponible (~2,7 GB de descarga) | No disponible | Mejor equilibrio calidad/velocidad | No disponible | Hugging Face (MLX y GGUF) |
| IRx-2 Pro | No disponible (~5,3 GB de descarga) | No disponible | Respuestas largas y conversaciones extensas, 12 GB+ RAM | No disponible | Hugging Face (MLX y GGUF) |

La comparación se limita a los miembros de la propia familia IRx, ya que la información proporcionada no incluye modelos externos comparables. Según la model card, IRx-mini es el más rápido de la familia (~89 tokens/s frente a ~51 de IRx-1 en la misma prueba) y el que menos memoria requiere, a costa de respuestas más cortas y mayor tasa de error.

## Limitaciones y advertencias

- No es un modelo de escala frontier: no iguala a servicios grandes alojados en razonamiento multi-paso difícil, programación compleja ni amplitud de conocimiento del mundo.
- Riesgo de alucinación: puede afirmar con confianza cosas falsas; la model card recomienda verificar precios, medicamentos y dosis, leyes y consejos agrícolas locales (variedades de semillas, cantidades de químicos, clima).
- Conocimiento limitado de noticias: entrenado con titulares hasta el 4 de noviembre de 2026, pero a este tamaño recuerda mal las noticias e incluso puede dar una fecha de corte incorrecta.
- No sustituye a profesionales: las respuestas médicas, legales y financieras son solo información general.
- Tool calling / function calling no soportado: no debe activarse en aplicaciones de chat porque el modelo nunca fue entrenado para ello.
- Idiomas soportados no especificados: no hay información sobre cobertura multilingüe.
- Longitud de contexto no disponible: no se puede garantizar el manejo de conversaciones largas.
- Licencia Apache 2.0: permite uso comercial, pero no se aportan garantías ni detalles sobre las obligaciones de atribución más allá de las estándar de dicha licencia.
- El modelo se actualiza semanalmente según el autor, lo que puede implicar cambios de comportamiento entre versiones sin versionado semántico explícito.

## Enlaces

- Modelo en Hugging Face (MLX): https://huggingface.co/ikppramesh/irx-mini
- Build GGUF para móvil: https://huggingface.co/ikppramesh/irx-mini-GGUF
- IRx-1: https://huggingface.co/ikppramesh/irx-1
- IRx-1 GGUF: https://huggingface.co/ikppramesh/irx-1-GGUF
- IRx-2: https://huggingface.co/ikppramesh/irx-2
- IRx-2 GGUF: https://huggingface.co/ikppramesh/irx-2-GGUF
- IRx-2 Pro: https://huggingface.co/ikppramesh/irx-2-pro
- IRx-2 Pro GGUF: https://huggingface.co/ikppramesh/irx-2-pro-GGUF
- Tablero comparativo IRx (enlace citado en la model card): https://claude.ai/artifact/1ha4zVccAwrKSm3mjKBLFU
