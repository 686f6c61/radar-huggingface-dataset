# Denisijcu/qwen-exilio-cubano-gguf

## Resumen

`qwen-exilio-cubano-gguf` es un ajuste fino del modelo base `Qwen/Qwen2.5-3B-Instruct` (3.085.938.688 parámetros) desarrollado por Denis Sanchez Leyva (Vertex Coders LLC, Miami). Está especializado en síntesis histórica neutral sobre la historia de Cuba y el exilio cubano, con un enfoque explícito en generación anclada a contexto (grounded RAG), atribución de fuentes y abstención ante datos no verificados. Se distribuye como cuantización GGUF Q4_K_M, pensada para inferencia local en GPUs de 6 GB de VRAM.

El modelo resuelve un problema concreto: los modelos de propósito general tienden a inventar cifras, fechas y nombres cuando se les pregunta por temas históricos polémicos o poco representados en sus datos de entrenamiento. Este ajuste se entrena para separar hechos documentados de interpretaciones, citar qué actor sostiene cada afirmación y declarar explícitamente cuándo un dato no está en los fragmentos proporcionados, en lugar de generarlo.

Es relevante para desarrolladores que construyen pipelines RAG sobre dominios históricos sensibles y necesitan un modelo pequeño, desplegable en hardware de consumo, con comportamiento predecible ante ausencia de contexto. Su licencia Apache 2.0 y su formato GGUF facilitan la integración en herramientas como LM Studio o llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino con QLoRA sobre Qwen2.5-3B-Instruct |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; se recomienda usar 2048-4096 tokens en inferencia |
| Tipos de cuantizacion | GGUF Q4_K_M (única cuantización publicada en el repo) |
| Idiomas soportados | es (español) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 1.9 GB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-3B-Instruct`, un transformer decoder-only de la familia Qwen2, y se ajusta mediante SFT con QLoRA. La configuración LoRA usa `r = 16` y `lora_alpha = 16` (ratio α/r = 1.0), con módulos objetivo en todas las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y del MLP (`gate_proj`, `up_proj`, `down_proj`) de cada `Qwen2DecoderLayer`.

El entrenamiento aplica tres técnicas destacables: enmascaramiento estricto de prompts con `train_on_responses_only` sobre la etiqueta `<|im_start|>assistant` (loss = -100 en instrucciones y fragmentos, de modo que el gradiente solo actualiza la síntesis), regularización NEFTune con `neftune_noise_alpha = 5` para reducir sobreajuste y alucinación, y optimizador `adamw_torch_fused` con learning rate 1e-4 y scheduler cosine durante 3 épocas (180 pasos, batch efectivo de 8). El dataset es `Denisijcu/exilio-cubano-dataset`, con 480 muestras curadas de síntesis documental verificada. El formato de plantilla es ChatML nativo de Qwen 2.5.

## Capacidades

- Generación de texto en español con sesgo hacia la neutralidad y la separación entre hechos documentados e interpretaciones.
- Generación anclada a contexto (grounded generation): responde exclusivamente a partir de los fragmentos verificados inyectados en el prompt.
- Atribución de fuentes: identifica qué actor (académico, organismo internacional, gobierno, testigo) sostiene cada cifra o argumento.
- Abstención verificada: declara explícitamente la ausencia de un dato en los fragmentos en lugar de inventarlo.
- Síntesis histórica sobre la historia de Cuba y las etapas del exilio cubano.
- Integración en pipelines RAG y agentes vía API compatible con LM Studio (endpoint `/v1/chat/completions`).
- Soporte de plantilla ChatML para conversaciones multi-turno.
- No se documentan capacidades de tool calling, function calling, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistente RAG para archivos históricos: el modelo recibe fragmentos de documentos digitalizados y responde citando el ID del documento y el actor que sostiene cada dato, lo que permite auditar la respuesta contra la fuente original.
- Consultas ciudadanas sobre el exilio cubano: un portal público puede usar el modelo para responder preguntas frecuentes (fechas de oleadas migratorias, programas de acogida, cifras de organismos) limitando la respuesta a fragmentos curados y evitando afirmaciones no verificadas.
- Generación de resúmenes documentales con trazabilidad: en un flujo de trabajo académico, el modelo sintetiza varios fragmentos en un párrafo neutral, atribuyendo cada afirmación a su fuente, lo que facilita la revisión por parte de un historiador.
- Moderación de contenido histórico en foros: integrado como capa de respuesta, el modelo puede reformular afirmaciones sin respaldo documental indicando explícitamente que no dispone del dato, en lugar de validar cifras inventadas por el usuario.
- Despliegue local en hardware de consumo: con cuantización Q4_K_M y 6 GB de VRAM (por ejemplo, GTX 1660 Ti), el modelo cabe en equipos sin GPU de datacenter, lo que permite prototipar asistentes históricos en estaciones de trabajo personales con LM Studio o llama.cpp.
- Evaluación de pipelines RAG: al tener un comportamiento de abstención explícito, sirve como componente de referencia para medir la calidad de la recuperación (si el modelo se abstiene con frecuencia, el retriever no está aportando fragmentos relevantes).
- Educación: un profesor puede construir un ejercicio en el que los alumnos comparen la respuesta del modelo con los fragmentos originales, usando la atribución como mecanismo de verificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB para los pesos Q4_K_M (repo de 1.9 GB) más overhead de contexto KV; la model card indica que está optimizado para GPUs de 6 GB de VRAM.
- GPU recomendadas: NVIDIA GTX 1660 Ti (6 GB) como mínimo indicado por el autor; cualquier GPU consumer con 6 GB o más (RTX 2060, RTX 3060, RTX 4060) es suficiente para Q4_K_M con contexto moderado.
- Cabe en GPU consumer: sí, en tarjetas de 6 GB en adelante con la cuantización Q4_K_M.
- Opciones de despliegue: LM Studio y llama.cpp (indicados en la model card); el endpoint es compatible con la API de OpenAI (`/v1/chat/completions`), por lo que también puede servirse con cualquier runtime que exponga esa interfaz sobre GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.
- Parámetros de inferencia recomendados: temperature 0.1-0.2, top_p 0.9, repetition_penalty 1.1, max_tokens 512, contexto 2048-4096.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| qwen-exilio-cubano-gguf | 3.085.938.688 | no disponible (recomendado 2048-4096 en inferencia) | Historia de Cuba y exilio cubano, RAG con abstención | apache-2.0 | GGUF Q4_K_M |
| Qwen/Qwen2.5-3B-Instruct | 3.085.938.688 | no disponible en la información proporcionada | Propósito general, instrucciones | apache-2.0 | safetensors y múltiples cuantizaciones |
| Qwen-Image-gguf (city96) | no disponible | no disponible | Generación de imagen | no disponible | GGUF |

La comparación con Qwen-Image-gguf no es de categoría equivalente (imagen frente a texto) y solo se incluye por aparecer en los resultados de búsqueda; no aporta una referencia útil para evaluar este modelo. No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de texto de tamaño similar.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en español y sobre un dominio muy concreto (historia de Cuba y exilio cubano); su rendimiento fuera de ese dominio no está documentado y probablemente degrade hacia el comportamiento del modelo base.
- El dataset de ajuste contiene 480 muestras, un volumen reducido que limita la cobertura temática y puede producir respuestas frágiles ante preguntas que se salgan de la distribución de entrenamiento.
- Aunque el protocolo anti-alucinación está diseñado para reducir invenciones, no las elimina por completo; en producción conviene validar las respuestas contra los fragmentos y registrar la atribución para auditoría.
- El modelo puede heredar sesgos del corpus documental utilizado; la model card no documenta una evaluación de sesgos ni de neutralidad política verificable de forma independiente.
- La única cuantización publicada es Q4_K_M; no hay versiones en safetensors, Q5, Q8 ni FP16 en el repo, lo que limita la evaluación de la degradación por cuantización.
- La longitud de contexto nativa del modelo base no se declara en la model card; el autor recomienda operar entre 2048 y 4096 tokens, por debajo del contexto típico de Qwen2.5-3B-Instruct.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la exactitud histórica del contenido generado; la responsabilidad de verificación recae en el integrador.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria ni informes de terceros sobre su comportamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Denisijcu/qwen-exilio-cubano-gguf
- Dataset de ajuste: https://huggingface.co/datasets/Denisijcu/exilio-cubano-dataset
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Web del autor: https://vertexcoders.com
- Contacto: contact@vertexcoders.com
- Referencia no relacionada aparecida en la búsqueda (generación de imagen): https://huggingface.co/city96/Qwen-Image-gguf
- Referencia no relacionada aparecida en la búsqueda (guía de despliegue de Qwen-Image): https://tech-insider.org/self-host-qwen-image-2-1-locally-setup-2026/
