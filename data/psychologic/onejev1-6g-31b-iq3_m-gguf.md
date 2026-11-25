# PsychoLogic/onejev1.6g-31b-IQ3_M-GGUF

## Resumen

onejev1.6g-31b-IQ3_M es una cuantización GGUF de tipo IQ3_M del modelo base OmniJev/OneJev1.6g-31B, publicada por el usuario PsychoLogic. El modelo base es un transformer denso de aproximadamente 30.700 millones de parámetros (30.697.345.596 según los pesos en safetensors) orientado a tareas de decisión y conversación. Esta versión cuantizada ocupa 14,4 GB y está pensada explícitamente para ejecutarse residente en GPUs de 16 GB de VRAM, un umbral crítico para hardware de consumo de gama alta.

La relevancia de esta ficha está en que demuestra un caso práctico de despliegue de un modelo de 31B en una tarjeta consumer (el autor reporta pruebas en una RTX 5060 Ti de 15.846 MiB), manteniendo la semántica de los pesos originales y sirviendo con caché KV cuantizada en q8_0 a una ventana de 4096 tokens. El autor documenta 7.854 llamadas reales de decisión reproducidas sin errores, lo que aporta evidencia empírica de estabilidad en un escenario de producción concreto.

No obstante, la información disponible sobre el modelo base es muy limitada: no se detallan arquitectura interna, composición del dataset de entrenamiento, idiomas soportados ni resultados de benchmarks públicos. La model card se centra en el proceso de cuantización y en el protocolo de servicio, no en las capacidades del modelo. La licencia declarada es Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles internos no disponibles) |
| Parámetros totales | 30.697.345.596 (~30,7B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 4096 tokens (configuración de servicio reportada por el autor); máximo nativo no disponible |
| Tipos de cuantización | IQ3_M (esta versión); otras cuantizaciones del modelo base no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 14,4 GB); pesos originales del modelo base en safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base OmniJev/OneJev1.6g-31B más allá de tratarse de un transformer denso de ~30,7B parámetros. No se especifican el número de capas, la dimensionalidad de los embeddings, el tipo de atención ni si se emplearon técnicas como atención lineal o decodificación especulativa. Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias.

Lo que sí documenta el autor es el proceso de cuantización: la conversión se realizó con `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp (rama master en el commit `0a731cc`, más parches recogidos en el directorio `patches/`). El conversor está condicionado a `format_id == flide-template-v1` e incrusta metadatos `gemma4.decision.type = openjev` y `gemma4.decision.questions_in_template = true`, lo que indica que los bloques de preguntas del protocolo de decisión viajan dentro de la plantilla del sistema en lugar de añadirse al final. Para servir el GGUF resultante basta con llama.cpp master estándar. El autor menciona también un protocolo de decisión específico y contexto de benchmark en la model card del modelo base, aunque esos datos no se han incluido en la información disponible.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el pipeline declarado apuntan a uso en diálogo multi-turno.
- Modelo de decisión: el tag `decision-model` y el protocolo `openjev` sugieren un uso especializado en tareas de elección entre opciones (lectura de slot/opción en un solo forward según la model card).
- Razonamiento multi-paso: no confirmado explícitamente en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en la información proporcionada.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse mediante APIs compatibles con el formato estándar de endpoints.

## Casos de uso

- Toma de decisiones automatizada en dominios acotados: el modelo está etiquetado como `decision-model` y el autor reporta su uso con prompts de decisión reales (7.854 llamadas reproducidas de una ventana de trading de 14 días). Encaja en sistemas que deben elegir entre opciones discretas con un protocolo fijo de preguntas y respuestas.
- Despliegue en estaciones de trabajo con GPU de 16 GB: al ocupar 14,4 GB en IQ3_M y servirse con caché KV q8_0 a 4096 tokens, permite tener el modelo residente en una única tarjeta consumer de gama alta (por ejemplo, RTX 5060 Ti de 15.846 MiB) sin offloading a CPU.
- Asistente conversacional local con requisitos de privacidad: al ejecutarse íntegramente en hardware local mediante llama.cpp, es adecuado para entornos donde los datos no pueden salir de la infraestructura propia.
- Prototipado y evaluación de modelos de 31B: sirve como banco de pruebas para medir latencia, throughput y estabilidad de un modelo denso de ~30B en formato GGUF antes de comprometerse con infraestructura mayor.
- Integración en pipelines con endpoints compatibles: el tag `endpoints_compatible` facilita conectarlo a servidores de inferencia que expongan una API estilo OpenAI, útil para orquestar flujos internos.
- Reproducción de experimentos de cuantización: los parches y el checksum (`SHA256SUMS`) permiten reconstruir la conversión y verificar la integridad de los pesos, lo que resulta útil para auditar el proceso o adaptarlo a otras cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado por el autor es operativo: en una RTX 5060 Ti de 15.846 MiB, con llama.cpp en Docker (nvidia/cuda:12.8.1), configuración `-c 4096 -b 4096 -ub 4096 --parallel 1` y caché KV q8_0, se reprodujeron 7.854 llamadas reales de decisión (muestra con stride-10 de 78.534, prompts byte-exactos, lectura single-forward de slot/opción) con 0 errores. No se aportan cifras de latencia por token ni de throughput (tokens/s).

## Requisitos de hardware

- VRAM estimada para inferencia: 14,4 GB solo para los pesos en IQ3_M; con caché KV q8_0 y contexto de 4096 tokens, el autor la sitúa como "justa pero cabe" en una tarjeta de 16 GB.
- GPU recomendadas: RTX 5060 Ti (16 GB, configuración medida por el autor); cualquier GPU con al menos 16 GB de VRAM para esta cuantización concreta.
- ¿Cabe en GPU consumer? Sí, en modelos de 16 GB de VRAM o superiores con esta cuantización; en tarjetas de 12 GB o menos no cabría residente con este contexto y caché.
- Opciones de despliegue: llama.cpp (probado por el autor en Docker con CUDA 12.8.1); otros runtimes compatibles con GGUF no están confirmados en la información disponible.
- Latencia y throughput: no disponibles; el autor solo reporta ausencia de errores en la reproducción de llamadas, no métricas de velocidad.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos comparables ni métricas que permitan una comparación rigurosa. Como referencia estructural, se puede contrastar con el propio modelo base:

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| onejev1.6g-31b-IQ3_M (esta ficha) | ~30,7B | 4096 (config. de servicio) | GGUF IQ3_M (14,4 GB) | Apache-2.0 | Hugging Face, 300 descargas |
| OmniJev/OneJev1.6g-31B (base) | ~30,7B | no disponible | safetensors | Apache-2.0 (según modelo derivado) | Hugging Face |

## Limitaciones y advertencias

- La cuantización IQ3_M introduce pérdida de precisión respecto a los pesos F16 originales; el autor afirma que la semántica se mantiene, pero no aporta métricas de degradación por tarea.
- El contexto de servicio reportado es de 4096 tokens; no se conoce la ventana máxima nativa del modelo base, por lo que no debe asumirse un contexto mayor.
- No se declaran idiomas soportados; el rendimiento en castellano u otros idiomas distintos del inglés es desconocido.
- No hay información sobre sesgos, datos de entrenamiento ni evaluación de alucinación del modelo base.
- El modelo está etiquetado como `decision-model` y el autor lo valida en un dominio concreto (trading); extrapolar su fiabilidad a otros dominios de decisión requiere validación propia.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar la model card del modelo base para atribuciones adicionales.
- El proceso de conversión dependió de parches específicos de llama.cpp; reproducir la cuantización con versiones distintas puede requerir adaptaciones.
- El número de descargas (300) y la ausencia de likes indican adopción limitada, lo que reduce la evidencia comunitaria disponible.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/PsychoLogic/onejev1.6g-31b-IQ3_M-GGUF
- Modelo base: https://huggingface.co/OmniJev/OneJev1.6g-31B
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- llama.cpp (herramienta de conversión y servicio): no se proporciona enlace directo en la información disponible
