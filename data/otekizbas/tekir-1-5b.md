# otekizbas/Tekir-1.5B

## Resumen

Tekir-1.5B es un modelo de lenguaje especializado en turco desarrollado por el usuario de HuggingFace otekizbas. Funciona como asistente interno de recursos humanos para la empresa (ficticia) Bulutkedi Yazılım A.Ş. Se construye mediante un ajuste fino con QLoRA sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.543.714.304 parámetros (unos 1,54 mil millones). El modelo reparte su conocimiento en tres piezas: la identidad y el tono se fijan con el ajuste fino, las normas de la empresa se recuperan mediante RAG y los datos de empleados se obtienen a través de llamadas a herramientas.

El proyecto forma parte de un bootcamp y se publica con licencia Apache-2.0, junto con el adaptador LoRA, una versión GGUF para ejecución en CPU y el conjunto de datos de entrenamiento. El coste de entrenamiento es deliberadamente bajo: 382 conversaciones sintéticas generadas con Gemini y 3 épocas de QLoRA, reproducibles en una GPU T4 en aproximadamente 10 minutos.

Su interés práctico es que ilustra un patrón de despliegue habitual: un modelo pequeño y barato de ejecutar que delega el conocimiento factual en RAG y en herramientas en lugar de intentar memorizarlo. Ahora bien, es un modelo de ámbito muy restringido, orientado al turco y a un dominio concreto, y sus métricas proceden de una evaluación interna con pocas preguntas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), ajustado con QLoRA sobre Qwen/Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 (≈1,54 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-1.5B-Instruct; no confirmada de forma explícita en la model card de Tekir) |
| Tipos de cuantizacion | safetensors en precisión completa (repo de 3,1 GB) y versiones GGUF en el repo otekizbas/Tekir-1.5B-GGUF; las cuantizaciones concretas no están especificadas |
| Idiomas soportados | turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors; GGUF en repositorio aparte; adaptador LoRA independiente en otekizbas/Tekir-1.5B-LoRA |

## Arquitectura y entrenamiento

La base es Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de la familia Qwen2, con licencia Apache-2.0 y plantilla de chat ya preparada. Sobre ese modelo se aplica un ajuste fino con QLoRA de rango r=16, alpha=32, aplicado a todas las capas lineales, durante 3 épocas y con una tasa de aprendizaje de 2e-4. El resultado son 1.543.714.304 parámetros en total y un repositorio de 3,1 GB en safetensors.

El conjunto de entrenamiento es pequeño y totalmente sintético: 382 conversaciones generadas con Gemini y etiquetadas en el dataset otekizbas/tekir-1.5b-veri. Las conversaciones cubren tres tipos de tarea: identidad (nombre y estilo del asistente), RAG (respuestas basadas en un documento de normas internas) y agente (emisión de llamadas a herramientas en formato JSON). No se menciona en la documentación disponible el uso de RLHF ni de DPO, ni el número total de tokens de entrenamiento.

## Capacidades

- Generación de texto conversacional en turco, con una identidad y un tono consistentes (el asistente mantiene su nombre y su estilo tras el ajuste fino).
- Respuesta con recuperación aumentada (RAG): responde a preguntas sobre normas internas cuando se le proporciona el contexto del documento.
- Llamada a herramientas y function calling: emite llamadas en JSON. La métrica interna `ajan_json` sube de 0,82 en la base a 1,00 en Tekir, y `ajan_arac` de 0,64 a 1,00.
- Comportamiento de agente en varios pasos, con la limitación observada de que en preguntas que combinan tabla y cálculo a veces omite el segundo paso.
- Rechazo controlado: ante preguntas cuya respuesta no está en la guía, responde que la información no figura en el rehén y remite a Recursos Humanos (en las pruebas, esta respuesta puntúa 1,0).
- Conversación multiturno básica, heredada del modelo base.
- No se documentan capacidades de visión, audio, generación de código, matemáticas avanzadas ni un modo de razonamiento extendido.

## Casos de uso

- Atención al empleado en recursos humanos: el modelo responde a consultas sobre vacaciones, dietas, presupuesto de formación o incidencias informáticas apoyándose en el documento de normas y en RAG, sin necesidad de que el equipo de RR. HH. conteste manualmente cada pregunta.
- Asistente interno con llamada a herramientas: integrado con un directorio corporativo, el modelo puede emitir llamadas JSON para consultar el departamento, la antigüedad o los días de vacaciones de una persona, tal como se probó con las consultas sobre una empleada concreta.
- Bot de primer nivel para un portal de empleado: enganchado a un portal tipo intranet, resuelve dudas frecuentes y escala a RR. HH. cuando la respuesta no está en la base documental, que es el comportamiento que el modelo tiende a adoptar.
- Base para un asistente de dominio en turco: dado su tamaño, sirve como punto de partida para ajustar con QLoRA otros asistentes internos turcos (legal, sanitario, financiero) reutilizando la misma receta de entrenamiento.
- Enrutador de peticiones dentro de un agente mayor: por su rapidez y su capacidad de emitir JSON, puede actuar como clasificador o primer paso que decide qué herramienta invocar antes de pasar la petición a un modelo mayor.
- Prototipado y docencia: el modelo, el adaptador LoRA y el dataset están publicados, por lo que sirve como caso de estudio reproducible de un flujo completo de ajuste fino, RAG y function calling en una GPU de gama media.
- Despliegue en local o en el borde: al existir versión GGUF, puede ejecutarse en CPU sin GPU, lo que permite entornos de demostración o estaciones de trabajo sin acelerador.

## Benchmarks y rendimiento

No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card publica únicamente una evaluación interna propia sobre un conjunto de prueba, comparando el modelo base con Tekir.

| Métrica | Base (Qwen2.5-1.5B-Instruct) | Tekir-1.5B |
|---|---|---|
| kimlik_ad | 0,00 | 0,80 |
| kimlik_isaret | 0,00 | 1,00 |
| ajan_json | 0,82 | 1,00 |
| ajan_arac | 0,64 | 1,00 |
| rag_hakem | 0,50 | 0,64 |
| rag_isaret | 0,00 | 1,00 |

Evaluación cualitativa con juez Gemini (puntuación 1 / 0,5 / 0), media global de 0,58 sobre 13 preguntas. Extracto representativo:

| Pregunta | Respuesta | Puntuación |
|---|---|---|
| ¿Cuántos días de vacaciones anuales tengo? | 18 días laborables los primeros 5 años, 22 a partir de los 5 años | 1,0 |
| ¿Cuánto se carga en la tarjeta de comida al día? | 450 TL por día laborable | 1,0 |
| ¿A quién contacto si se rompe mi ordenador? | Línea 4357 o formulario de incidencia en el portal | 1,0 |
| ¿Quién es nuestro director general? | Esa información no está en la guía; contacte con Recursos Humanos | 1,0 |
| ¿En qué departamento trabaja Ayşe Demir? | Respuesta incorrecta (mezcla datos de vacaciones y departamento) | 0,0 |
| ¿Cuántos días de vacaciones le quedan este año a Ayşe Demir? | Respuesta incorrecta | 0,0 |
| ¿Tiene la empresa vehículo de empresa? | Confunde "vehículo de empresa" con un producto de software | 0,0 |

Los nombres de las métricas y las preguntas se han mantenido en turco para no alterar los datos originales.

## Requisitos de hardware

- Peso en precisión completa (BF16/FP16): aproximadamente 3,1 GB, el tamaño del repositorio.
- VRAM estimada para inferencia: en BF16/FP16 en torno a 3,5-4 GB incluyendo caché KV para contextos moderados; en INT8 alrededor de 1,7 GB; en GGUF Q4_K_M cerca de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3050, RTX 3060, RTX 4060 o GTX 1660 Super con cuantización. También funciona en T4, L4 o A10. No requiere A100 ni H100; estas solo tendrían sentido para servir muchas réplicas o lotes grandes.
- Cabe en GPU de consumo: sí, con holgura, en cualquier tarjeta moderna de 6-8 GB o superior.
- Opciones de despliegue: llama.cpp u Ollama para los GGUF (incluso en CPU), vLLM o TGI para safetensors, y transformers con PEFT para cargar el adaptador LoRA de otekizbas/Tekir-1.5B-LoRA.
- Latencia y throughput: no disponibles. El único dato temporal publicado es que el entrenamiento completo cabe en unos 10 minutos en una T4, que corresponde al ajuste, no a la inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Enfoque |
|---|---|---|---|---|---|
| Tekir-1.5B | 1,54 B | 32.768 (heredado, no confirmado) | Apache-2.0 | HuggingFace: safetensors, GGUF y LoRA | Asistente de RR. HH. en turco |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Apache-2.0 | HuggingFace | Generalista multilingüe |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 | Llama 3.2 Community License | Meta / HuggingFace | Generalista |
| Gemma-2-2B-it | 2,6 B | 8.192 | Gemma Terms of Use | HuggingFace | Generalista |

Los datos del modelo base proceden de la propia model card de Tekir. Los de Llama-3.2-1B-Instruct y Gemma-2-2B-it se toman de sus fichas públicas y no están verificados en la información proporcionada. No hay benchmarks comparativos comunes entre Tekir-1.5B y esos modelos, por lo que no es posible establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Ámbito muy restringido: está diseñado para el dominio de recursos humanos de una empresa ficticia (Bulutkedi Yazılım A.Ş.) y no como modelo generalista.
- Solo turco: aunque la base sea multilingüe, el ajuste fino se ha hecho únicamente en turco y no hay evaluación en otros idiomas.
- No memoriza las normas: tal como advierte la propia model card, sin el contexto RAG puede inventar respuestas a preguntas sobre reglas internas.
- Alucinación demostrada: en la evaluación interna falla al consultar datos de una persona concreta (Ayşe Demir) y confunde "servicio de transporte" con un producto de software, con puntuaciones de 0,0.
- Datos sintéticos: las 382 conversaciones se generaron con Gemini, por lo que pueden heredar errores y sesgos del generador.
- Evaluación poco robusta: 13 preguntas y un juez automático (Gemini), con una media de 0,58; la fiabilidad estadística es baja y el conjunto de prueba es minúsculo.
- Artefactos de formato: el modelo añade con frecuencia un emoji de huella de pata al final de las respuestas, algo que puede requerir post-procesado según el producto.
- Razonamiento multi-paso frágil: en preguntas que combinan lectura de tabla y cálculo, omite a veces el segundo paso, según reconoce el autor.
- Contenido de la model card: algunas tablas incluyen texto mezclado con caracteres de otros idiomas, señal de una posible falta de revisión del material publicado.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero al tratarse de un proyecto de bootcamp con datos ficticios no hay garantías de idoneidad para producción.
- Adopción nula: 0 descargas y 0 me gusta en el momento de la consulta, sin mantenimiento ni versiones posteriores publicadas.
- Fecha de publicación en HuggingFace: 11 de octubre de 2026 (creación y última actualización el mismo día).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/otekizbas/Tekir-1.5B
- Adaptador LoRA: https://huggingface.co/otekizbas/Tekir-1.5B-LoRA
- Versión GGUF: https://huggingface.co/otekizbas/Tekir-1.5B-GGUF
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/otekizbas/tekir-1.5b-veri
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a sitios sin relación con el proyecto.
