# lifestruggle/Qwen2.5-14B-instruct_DPO_dental

## Resumen

`lifestruggle/Qwen2.5-14B-instruct_DPO_dental` es un ajuste fino del modelo Qwen2.5-14B-Instruct de Alibaba, orientado al dominio dental y a tareas de procesamiento de lenguaje natural clínico. El autor del ajuste es el usuario `lifestruggle`, y el modelo se distribuye bajo licencia Apache 2.0, aunque con acceso restringido (gated) en Hugging Face, lo que obliga a aceptar condiciones antes de descargarlo. Con 14.770.033.664 parámetros, se sitúa en la gama media-alta de los modelos densos de su generación.

El modelo parte de la arquitectura transformer densa de Qwen2.5 y aplica una fase de DPO (Direct Preference Optimization) sobre el modelo base ya instruido, presumiblemente con pares de preferencia del ámbito odontológico. La ficha del repositorio lo etiqueta explícitamente para reconocimiento de entidades nombradas (NER), extracción de información, NLP clínico y generación conversacional, lo que sugiere un uso previsto en entornos de investigación y prototipado sanitario más que en producción clínica directa.

Su relevancia radica en ser uno de los pocos ajustes públicos de Qwen2.5-14B orientados a un vertical sanitario concreto (odontología), lo que permite a desarrolladores e investigadores evaluar si un modelo de 14B con DPO específico supera al modelo base en tareas de extracción estructurada y diálogo clínico. No obstante, el repositorio no incluye métricas de benchmarks ni detalles del dataset de preferencias, y el modelo solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2.5), decoder-only, ajustado con DPO |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-14B-Instruct soporta hasta 32.768 tokens, ampliable a 131.072) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; no se publican GGUF ni AWQ en el repo) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-14B-Instruct: atención con RoPE, normalización RMSNorm, activación SwiGLU y embeddings de tokens compartidos con la cabeza de salida. Sobre esa base instruida, el autor aplica una etapa de DPO, una técnica de alineación por preferencias que optimiza el modelo para favorecer respuestas preferidas frente a rechazadas sin necesidad de un reward model explícito en inferencia. El repositorio referencia el paper arXiv:2407.10671, correspondiente al informe técnico de Qwen2.5.

No se especifican en la información disponible el número de tokens de entrenamiento del ajuste, la composición del dataset de preferencias, ni si se combinó DPO con SFT previo. Tampoco se documentan innovaciones técnicas adicionales más allá del propio DPO. El tamaño del repositorio (29,6 GB) es coherente con pesos en precisión bf16/fp16 para 14,77B parámetros, sin que se incluya una versión cuantizada.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base instruido.
- Razonamiento y respuesta a instrucciones multi-turno.
- Extracción de información y reconocimiento de entidades nombradas (NER) en el dominio dental y clínico, según las etiquetas del repositorio.
- Procesamiento de lenguaje clínico (clinical-nlp) orientado a textos odontológicos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (el modelo base Qwen2.5-14B-Instruct lo soporta, pero el ajuste no lo declara explícitamente).
- Capacidades de agente y razonamiento multi-paso: no documentadas para este ajuste.
- Capacidades multilingües: limitadas al inglés según la tarjeta del modelo.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Extracción de entidades clínicas en informes odontológicos: el modelo puede identificar diagnósticos, procedimientos, piezas dentales y medicaciones en texto libre, aprovechando su ajuste específico para NER clínico y su ventana de contexto heredada del base.
- Estructuración de historiales clínicos: convertir notas de evolución redactadas en lenguaje natural en campos estructurados (fecha, tratamiento, diente afectado, observaciones) para su volcado en bases de datos.
- Asistencia conversacional a profesionales: responder consultas sobre terminología odontológica, protocolos o codificación de procedimientos, con la cautela de que no es un sistema de diagnóstico validado.
- Preprocesado de literatura científica dental: resumir y extraer relaciones entre patologías y tratamientos en artículos, gracias a la capacidad de contexto largo del modelo base.
- Generación de borradores de informes clínicos: producir textos preliminares a partir de datos estructurados que el profesional revisa y corrige, reduciendo tiempo administrativo.
- Investigación en NLP clínico: servir como línea base ajustada por DPO para comparar con el modelo base en tareas de extracción y diálogo, en entornos de laboratorio.
- Clasificación y triaje de consultas: etiquetar mensajes de pacientes por urgencia o especialidad dentro de un pipeline de atención, siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 30 GB solo para pesos, más overhead de KV cache; en la práctica se recomiendan 40-48 GB para contextos moderados.
- Cuantización a 8 bits: en torno a 15-16 GB de VRAM, viable en GPUs de 24 GB con contexto limitado.
- Cuantización a 4 bits: aproximadamente 8-9 GB de VRAM, aunque el repositorio no publica pesos GGUF ni AWQ oficiales; habría que generarlos a partir de los safetensors.
- GPUs recomendadas: A100 40/80 GB, H100 80 GB o L40S para bf16; RTX 4090 (24 GB) solo con cuantización 8 bits o inferior.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización 8 o 4 bits; no en bf16 en GPUs de 24 GB.
- Opciones de despliegue: transformers, Text Generation Inference (TGI, etiqueta `text-generation-inference` presente), vLLM y llama.cpp/Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| lifestruggle/Qwen2.5-14B-instruct_DPO_dental | 14,77B | no disponible (base: 32k) | Apache 2.0 | Gated | Ajuste DPO vertical dental |
| Qwen/Qwen2.5-14B-Instruct | 14,77B | 32.768 (hasta 131.072) | Apache 2.0 | Abierto | Modelo base, proposito general |
| Qwen/Qwen2.5-7B-Instruct | 7,62B | 32.768 (hasta 131.072) | Apache 2.0 | Abierto | Alternativa mas ligera, menor coste de inferencia |
| Meta Llama 3.1 8B Instruct | 8,03B | 131.072 | Llama 3.1 Community | Gated | Proposito general, licencia mas restrictiva |

## Limitaciones y advertencias

- Sesgos: al ser un ajuste sobre Qwen2.5, puede heredar sesgos del corpus de entrenamiento original; no se documenta análisis de sesgo específico.
- Alucinación: riesgo relevante en dominio clínico; el modelo puede generar entidades, diagnósticos o procedimientos inexistentes, especialmente sin validación humana.
- Contexto e idioma: solo declara inglés; no se garantiza rendimiento en castellano ni en otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero el acceso está restringido (gated) y sujeto a las condiciones de Hugging Face y del modelo base.
- Uso clínico: no es un dispositivo médico ni está validado para diagnóstico o decisión terapéutica; cualquier aplicación sanitaria requiere supervisión profesional y evaluación regulatoria.
- Falta de documentación: no se publican detalles del dataset de DPO, hiperparámetros, ni evaluaciones, lo que dificulta reproducir o auditar el ajuste.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lifestruggle/Qwen2.5-14B-instruct_DPO_dental
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Paper Qwen2.5 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
