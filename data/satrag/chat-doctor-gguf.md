# SatRag/chat-doctor-gguf

## Resumen

ChatDoctor GGUF es una cuantización en formato GGUF de 8 bits del modelo `google/gemma-4-E2B-it`, publicada por el usuario SatRag bajo licencia Apache 2.0. El modelo base es un Gemma de cuarta generación en su variante E2B (orientada a eficiencia), con aproximadamente 4.628 millones de parámetros totales según los datos de safetensors del repositorio original. La model card del autor es extremadamente escueta y se limita a indicar que se trata de la versión Q8 de "ChatDoc", sin aportar detalles sobre el proceso de ajuste, los datos de entrenamiento ni el propósito clínico concreto.

El nombre del repositorio sugiere una especialización en el ámbito sanitario o de atención al paciente, pero no hay documentación que respalde dicha especialización ni que describa qué tipo de ajuste se ha aplicado sobre el modelo base. El repositorio ocupa 4,9 GB y acumula 17 descargas y 2 likes en el momento de la consulta, lo que indica una adopción muy limitada dentro de la comunidad.

Por su tamaño (4,6 mil millones de parámetros) y su cuantización Q8, el modelo está pensado para inferencia en hardware de consumo, aunque la información publicada no permite confirmar el contexto máximo, los idiomas soportados ni las capacidades reales tras el ajuste. Cualquier evaluación rigurosa requeriría inspeccionar los pesos y validar el comportamiento de forma empírica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de google/gemma-4-E2B-it; no se detalla en la model card) |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8 (GGUF); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Por el identificador del modelo base (`google/gemma-4-E2B-it`) se trata de un transformer de la familia Gemma 4 en su variante E2B, pero no se confirma en la documentación disponible si incorpora atención lineal, mezcla de expertos u otras innovaciones propias de esa generación. Tampoco se especifica el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron fases de RLHF, DPO o ajuste supervisado adicionales sobre el checkpoint original.

Respecto al ajuste que da lugar a "ChatDoc", el autor no publica ningún detalle: no hay información sobre el dataset utilizado, el número de pasos de entrenamiento, la técnica de ajuste (LoRA, full fine-tuning, etc.) ni los hiperparámetros. La única información técnica verificable es que se ha generado una cuantización Q8 en formato GGUF a partir del modelo base, presumiblemente mediante `llama.cpp` o una herramienta equivalente, y que el resultado se distribuye como un único repositorio de 4,9 GB.

## Capacidades

- Generación de texto conversacional, heredada del modelo base `gemma-4-E2B-it`.
- Presunta orientación a diálogo de temática sanitaria o de atención al paciente, inferida únicamente del nombre "ChatDoc"; no confirmada por documentación.
- Soporte de tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en local: al ser un GGUF Q8 de 4,6 mil millones de parámetros, puede cargarse en estaciones de trabajo con GPU de consumo y usarse para experimentar con diálogos multi-turno sin depender de APIs externas.
- Evaluación de cuantizaciones Q8 frente a Q4/Q5: útil como referencia de calidad casi sin pérdida para comparar el impacto de la cuantización en tareas conversacionales sobre el mismo modelo base.
- Despliegue en entornos con requisitos de soberanía de datos: al ejecutarse íntegramente en local mediante `llama.cpp` u Ollama, permite mantener las conversaciones fuera de servicios en la nube, algo relevante en contextos sanitarios.
- Generación de respuestas preliminares en un chatbot de triaje no clínico: siempre que se valide empíricamente el comportamiento y se añadan salvaguardas, podría emplearse como borrador de respuestas informativas, nunca como sustituto de consejo médico.
- Integración en pipelines de CI para pruebas de regresión conversacional: su formato GGUF y su tamaño moderado permiten incluirlo en tests automatizados de calidad de respuesta.
- Fine-tuning posterior o destilación: los pesos en GGUF no son directamente entrenables, pero el modelo base original puede servir como punto de partida para ajustes específicos del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q8: en torno a 5-6 GB solo para los pesos, más overhead de contexto y caché KV; con contexto largo puede superar los 8 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090; en el segmento profesional, A10G, L4, A100 o H100 para despliegues concurrentes.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en Q8; en Q4 sería viable incluso en 6 GB.
- Opciones de despliegue: `llama.cpp`, Ollama, `llama-cpp-python`, LM Studio; para servir en producción con mayor throughput, vLLM o TGI requerirían convertir los pesos a safetensors, ya que el repositorio solo distribuye GGUF.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y del backend. Como referencia cualitativa, un modelo de ~4,6 B en Q8 sobre una RTX 4090 suele generar decenas de tokens por segundo, pero no hay mediciones publicadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SatRag/chat-doctor-gguf | 4,63 B | no disponible | Apache 2.0 | GGUF (Q8) | Cuantización Q8 de gemma-4-E2B-it, sin documentación de ajuste |
| google/gemma-4-E2B-it | ~4,6 B (según safetensors del repo) | no disponible | Gemma license (según modelo base original) | safetensors | Modelo base oficial; la licencia del derivado figura como Apache 2.0, lo que conviene verificar |
| Modelos de ~4 B en GGUF (p. ej. familias Llama 3.2 3B, Qwen2.5 3B) | 3-4 B | 8K-128K según modelo | varía (Llama community, Apache 2.0) | GGUF | Alternativas consolidadas con documentación y benchmarks públicos |

La comparación cuantitativa con alternativas no es posible porque el autor no publica benchmarks ni especifica el contexto o los idiomas soportados.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: la model card no describe el ajuste, los datos ni las capacidades reales, lo que impide evaluar su idoneidad para producción.
- Riesgo elevado de alucinación, especialmente si se usa en contextos sanitarios sin validación humana y sin recuperación aumentada de conocimiento.
- Sesgos desconocidos: al no documentarse el corpus de ajuste, no puede evaluarse el sesgo demográfico, cultural o clínico.
- Idiomas soportados no confirmados; podría degradarse fuera del inglés.
- Licencia: aunque el repositorio declara Apache 2.0, el modelo base `google/gemma-4-E2B-it` está sujeto a la licencia de Gemma, que impone restricciones de uso (incluida la cláusula de uso aceptable). Conviene verificar la compatibilidad antes de un uso comercial.
- Solo se distribuye en GGUF Q8; no hay safetensors ni otras cuantizaciones en el repositorio, lo que limita su uso con backends que no soportan GGUF de forma nativa.
- Adopción muy baja (17 descargas, 2 likes) y sin mantenimiento documentado; no hay garantías de soporte ni de actualizaciones.
- No debe emplearse como dispositivo médico ni para diagnóstico; cualquier uso clínico requeriría validación regulatoria y auditoría independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SatRag/chat-doctor-gguf
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Documentación de llama.cpp (backend habitual para GGUF): https://github.com/ggerganov/llama.cpp
- Ollama (despliegue local de GGUF): https://ollama.com
