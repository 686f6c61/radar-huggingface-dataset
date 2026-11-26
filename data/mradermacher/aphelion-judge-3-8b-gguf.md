# mradermacher/Aphelion-Judge-3.8B-GGUF

## Resumen

Aphelion-Judge-3.8B-GGUF es la versión cuantizada en formato GGUF del modelo Aphelion-Judge-3.8B, desarrollado originalmente por el usuario knss12 y cuantizado por mradermacher. Se trata de un modelo especializado en tareas de evaluación automática (LLM-as-a-judge), con especial énfasis en la detección de alucinaciones y la verificación de groundedness en pipelines de generación aumentada por recuperación (RAG). El modelo está construido sobre la arquitectura Phi-3.5, con 3.821.079.648 parámetros totales, y emplea técnicas de razonamiento denominadas "micro-cot" (micro chain-of-thought) y "first-principles" para emitir juicios estructurados.

La relevancia de este modelo radica en su tamaño compacto (3.8B parámetros), que permite desplegarlo en hardware de consumo, combinado con una especialización clara en una tarea crítica para sistemas RAG en producción: determinar si una respuesta generada está respaldada por el contexto recuperado o si, por el contrario, contiene información alucinada. Al estar disponible en múltiples cuantizaciones GGUF (desde Q2_K hasta f16), facilita su integración en entornos con recursos limitados mediante llama.cpp u Ollama.

La licencia MIT permite uso comercial sin restricciones significativas, lo que lo convierte en una opción atractiva para equipos que necesitan un evaluador ligero y desplegable localmente, sin depender de APIs externas. No obstante, la información pública disponible sobre benchmarks y detalles de entrenamiento es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Phi-3.5) |
| Parametros totales | 3.821.079.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Phi-3.5, un transformer decoder-only de 3.8B parámetros. La model card del repositorio cuantizado no proporciona detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Los tags del modelo indican el uso de "micro-cot" (micro chain-of-thought) y "first-principles", lo que sugiere que el entrenamiento se orientó a producir razonamientos breves y estructurados antes de emitir un juicio de evaluación, en lugar de respuestas directas.

La especialización declarada es la evaluación de groundedness y detección de alucinaciones en contextos RAG, así como el uso como juez automático (LLM-as-a-judge). No se dispone de información sobre innovaciones técnicas adicionales como decodificación especulativa o mecanismos de atención lineal. La cuantización fue realizada por mradermacher mediante conversión estática (convert_type: hf), sin cuantizaciones ponderadas por imatrix disponibles en el momento de la publicación.

## Capacidades

- Evaluación de groundedness: determina si una respuesta está respaldada por el contexto proporcionado.
- Detección de alucinaciones: identifica afirmaciones no soportadas por las fuentes.
- LLM-as-a-judge: emisión de juicios estructurados sobre calidad de respuestas.
- Razonamiento micro-cot: genera cadenas de razonamiento breves antes de emitir el veredicto.
- Enfoque first-principles: evaluación basada en principios explícitos de verificación.
- Conversacional: soporta formato de chat multi-turno.
- Compatible con endpoints: etiquetado como endpoints_compatible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Visión / audio: no disponible.

## Casos de uso

- Evaluación de pipelines RAG: el modelo se sitúa como juez tras la generación para verificar que cada afirmación de la respuesta está respaldada por los documentos recuperados, permitiendo filtrar respuestas no fundamentadas antes de mostrarlas al usuario.
- Detección de alucinaciones en producción: integrado como paso de validación en un sistema de atención al cliente, puede marcar respuestas sospechosas para revisión humana o para regeneración con contexto adicional.
- Control de calidad de datasets sintéticos: al evaluar pares pregunta-respuesta-contexto, permite puntuar automáticamente la fidelidad de datos generados por modelos mayores antes de incorporarlos a un corpus de entrenamiento.
- Evaluación comparativa de modelos (LLM-as-a-judge): sirve para puntuar respuestas de distintos modelos sobre el mismo contexto, aportando una señal objetiva de groundedness en procesos de selección de modelos.
- Moderación de contenido factual: en foros o plataformas de documentación, puede señalar afirmaciones no respaldadas por las fuentes citadas.
- Despliegue local en hardware de consumo: gracias a sus cuantizaciones Q4_K_M (2.5 GB) o Q5_K_M (2.9 GB), puede ejecutarse en portátiles con GPU modesta o incluso en CPU mediante llama.cpp, habilitando evaluaciones sin coste de API.
- Filtrado previo en sistemas de búsqueda aumentada: descartar pasajes o respuestas candidatas antes de una etapa más costosa de verificación con un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~1.6 GB de pesos, ~2-2.5 GB de VRAM total con overhead.
  - Q4_K_M: ~2.5 GB de pesos, ~3-3.5 GB de VRAM total.
  - Q5_K_M: ~2.9 GB de pesos, ~3.5-4 GB de VRAM total.
  - Q8_0: ~4.2 GB de pesos, ~5 GB de VRAM total.
  - f16: ~7.7 GB de pesos, ~8.5-9 GB de VRAM total.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5 (RTX 3050, RTX 4060, GTX 1660). Para Q8_0 o f16 se recomienda RTX 3060 12 GB, RTX 4070 o superiores. En entornos de servidor, A100/H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU modernas con 4 GB o más de VRAM para cuantizaciones Q4 y Q5.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers con vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Aphelion-Judge-3.8B-GGUF | 3.82B | no disponible | Evaluación RAG / detección de alucinaciones | MIT | GGUF |
| Phi-3.5-mini-instruct | 3.82B | 128K (según documentación pública de Microsoft) | Propósito general | MIT | safetensors, GGUF |
| Qwen2.5-3B-Instruct | 3.09B | 32K (según documentación pública de Alibaba) | Propósito general | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-3B-Instruct | 3.21B | 128K (según documentación pública de Meta) | Propósito general | Llama 3.2 Community License | safetensors, GGUF |

Nota: los datos de contexto de los modelos comparativos provienen de su documentación pública; no se dispone del dato de contexto para Aphelion-Judge-3.8B en la información proporcionada. No se dispone de benchmarks comparativos que permitan evaluar el rendimiento relativo de Aphelion-Judge frente a estas alternativas en tareas de groundedness.

## Limitaciones y advertencias

- Idiomas: el modelo está etiquetado únicamente para inglés; su rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Contexto: se desconoce la longitud máxima de contexto soportada, lo que impide garantizar su funcionamiento con documentos largos en RAG.
- Alucinación del propio juez: como modelo generativo, puede emitir juicios incorrectos o inconsistentes; se recomienda calibrar con datos propios y considerar umbrales de confianza.
- Sesgos: no se ha documentado ninguna evaluación de sesgos; al derivar de Phi-3.5, puede heredar sesgos presentes en los datos de entrenamiento de dicho modelo.
- Benchmarks ausentes: no hay resultados publicados que permitan estimar su precisión frente a alternativas, lo que dificulta justificar su elección en producción sin una evaluación propia.
- Cuantizaciones de baja precisión: Q2_K y Q3_K_S pueden degradar notablemente la calidad de los juicios; se recomienda Q4_K_M o superior para tareas de evaluación.
- Sin cuantizaciones imatrix: el autor indica que no hay cuantizaciones ponderadas disponibles, lo que puede afectar ligeramente la calidad frente a alternativas con imatrix.
- Licencia MIT: permite uso comercial, pero el modelo base podría arrastrar obligaciones derivadas de Phi-3.5; conviene revisar la licencia del modelo original knss12/Aphelion-Judge-3.8B.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Aphelion-Judge-3.8B-GGUF
- Modelo base: https://huggingface.co/knss12/Aphelion-Judge-3.8B
- Página de descargas del cuantizador: https://hf.tst.eu/model#Aphelion-Judge-3.8B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
