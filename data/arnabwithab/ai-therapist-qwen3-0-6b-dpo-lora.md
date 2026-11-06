# arnabwithab/ai-therapist-qwen3-0.6b-dpo-lora

## Resumen

ai-therapist-qwen3-0.6b-dpo-lora es un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base Qwen/Qwen3-0.6B, desarrollado por el usuario arnabwithab. El adaptador está especializado en conversación de orientación psicológica (counselling) y salud mental, y forma parte de la colección "Counselling SLMs" del mismo autor. El problema que aborda es la adaptación de un modelo pequeño (0,6 mil millones de parámetros) a un dominio sensible y conversacional mediante preferencias, sin necesidad de reentrenar el modelo completo.

Técnicamente se trata de un adaptador PEFT (LoRA de rango 16, checkpoint 250, beta 0,1) entrenado con Unsloth QLoRA en modo DPO-from-base sobre el dataset PsyCoPref (Psychotherapy-LLM/PsyCoPref). El resultado es un artefacto ligero (repositorio de 0,1 GB) que se carga sobre el modelo base y que hereda la arquitectura transformer y la ventana de contexto de Qwen3-0.6B.

Su relevancia radica en que demuestra un flujo de alineación por preferencias de bajo coste sobre un modelo compacto y desplegable en hardware modesto, orientado a un caso de uso vertical (acompañamiento conversacional en salud mental). No obstante, el propio autor advierte que no es un terapeuta y que las salidas no deben tratarse como asesoramiento verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (adaptador LoRA sobre Qwen/Qwen3-0.6B) |
| Parametros totales | 0,6 mil millones en el modelo base; el adaptador LoRA es un subconjunto (rango 16, tamano no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-0.6B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el entrenamiento uso QLoRA) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 (r16) aplicado sobre el transformer Qwen/Qwen3-0.6B. El entrenamiento se realizó con Unsloth QLoRA en modalidad DPO-from-base (es decir, optimización directa de preferencias partiendo del modelo base, sin una fase previa de SFT indicada en la model card) sobre el dataset PsyCoPref de Psychotherapy-LLM. Los hiperparámetros declarados son checkpoint 250 y beta 0,1. El repositorio ocupa 0,1 GB, coherente con un adaptador de bajo rango y no con pesos completos.

Una particularidad técnica documentada por el autor es que el adaptador emite trazas `<think>` pese a la cabecera de "no-think", por lo que deben eliminarse antes de puntuar las respuestas. En las evaluaciones se usó muestreo con temperatura 0,7 y top_p 0,8 con el modo thinking desactivado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases adicionales de RLHF más allá del DPO.

## Capacidades

- Generación de texto conversacional en inglés orientada a diálogo de acompañamiento psicológico.
- Respuesta a mensajes multi-turno con formato de chat (chat template de Qwen3).
- Alineación por preferencias para favorecer respuestas de estilo empático y de counselling, derivada del entrenamiento DPO sobre PsyCoPref.
- Emisión de trazas de razonamiento `<think>` (comportamiento heredado del modelo base, que el autor indica que debe filtrarse).
- Soporte de tool calling / function calling: no disponible en la información proporcionada para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente para este adaptador.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales de acompañamiento emocional: el adaptador puede integrarse sobre Qwen3-0.6B para generar respuestas de estilo counsellor en inglés, útil para validar flujos de diálogo antes de invertir en modelos mayores.
- Investigación en alineación por preferencias: sirve como ejemplo reproducible de un pipeline DPO-from-base con QLoRA sobre un dataset de psicoterapia, útil para estudiar el efecto del DPO en dominios sensibles.
- Evaluación de seguridad en salud mental: permite montar arneses de evaluación (el autor publica un eval harness) para medir respuestas inapropiadas, alucinaciones o consejos peligrosos en un modelo pequeño antes de escalar.
- Despliegue de bajo coste en entornos con recursos limitados: al ser un adaptador de 0,1 GB sobre un modelo de 0,6B, puede servirse con vLLM usando `--enable-lora` en una sola GPU consumer para demos internas.
- Generación de datos sintéticos de diálogo terapéutico: puede emplearse para producir borradores de conversaciones que luego se filtren y revisen por expertos, acelerando la creación de corpus anotados.
- Educación y simulación de entrevistas clínicas: en entornos formativos controlados, el adaptador puede actuar como interlocutor simulado para practicar técnicas de escucha y formulación de preguntas, siempre con supervisión humana.
- Pruebas de integración de PEFT en pipelines existentes: útil para verificar la carga de adaptadores LoRA con `PeftModel` y su combinación con el tokenizador del adaptador en flujos de transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-0.6B en precisión completa (fp16/bf16) requiere aproximadamente 1,2-1,5 GB solo para pesos; con cuantización de 4 bits puede situarse por debajo de 1 GB. El adaptador LoRA añade una sobrecarga mínima (repositorio de 0,1 GB).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o RTX 4090 pueden ejecutar el modelo con holgura. Para servir con vLLM se recomienda al menos una GPU con 8-16 GB para acomodar el runtime y el KV cache.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 4 GB o más de VRAM, e incluso en CPU mediante llama.cpp si se convierte el modelo base a GGUF (el adaptador requeriría conversión adicional).
- Opciones de despliegue: transformers + PEFT (flujo documentado por el autor), vLLM con `--enable-lora` y `--reasoning-parser qwen3` (comando incluido en la model card). Ollama, llama.cpp y TGI no están documentados para este adaptador en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ai-therapist-qwen3-0.6b-dpo-lora | 0,6B (base) + adaptador LoRA | no disponible | Counselling / salud mental (EN) | apache-2.0 | Hugging Face (26 descargas) |
| Qwen/Qwen3-0.6B (base) | 0,6B | no disponible | Propósito general | apache-2.0 | Hugging Face |
| Adaptadores de la colección Counselling SLMs del mismo autor | variable (sobre distintos SLM) | no disponible | Counselling / salud mental | no disponible por adaptador | Hugging Face (colección) |

No se dispone de datos de benchmarks ni de modelos directamente comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- No es un terapeuta: el autor indica explícitamente que las salidas no deben tratarse como asesoramiento verificable; no apto para uso clínico real sin supervisión profesional.
- Riesgo de alucinación: como modelo de 0,6B, la probabilidad de generar información incorrecta o consejos inadecuados es elevada; requiere filtrado y evaluación continua.
- Emisión de trazas `<think>` no deseadas: el adaptador genera razonamiento explícito pese a la cabecera de no-think, lo que obliga a post-procesar las salidas antes de puntuar o mostrar.
- Limitación de idioma: solo inglés según la model card; no se garantiza calidad en castellano ni en otros idiomas.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse sobre un dataset de psicoterapia, puede reproducir sesgos culturales o de género presentes en PsyCoPref.
- Licencia: apache-2.0 permite uso comercial, pero la naturaleza sensible del dominio (salud mental) exige cumplimiento normativo adicional (por ejemplo, regulación de dispositivos médicos o protección de datos) que la licencia no cubre.
- Madurez: 26 descargas y 0 likes indican un artefacto experimental de investigación, sin validación comunitaria ni mantenimiento garantizado.
- Contexto: no se especifica la ventana efectiva ni el comportamiento en conversaciones muy largas; conviene limitar la longitud de los diálogos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arnabwithab/ai-therapist-qwen3-0.6b-dpo-lora
- Modelo base Qwen/Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Colección Counselling SLMs: https://huggingface.co/collections/arnabwithab/counselling-slms-6ad06ab0ca4ce4cf5ceb5ca4
- Dataset PsyCoPref: https://huggingface.co/datasets/Psychotherapy-LLM/PsyCoPref
- Repositorio de código y eval harness: https://github.com/arnabwithab/ai-therapist
