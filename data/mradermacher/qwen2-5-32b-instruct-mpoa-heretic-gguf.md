# mradermacher/Qwen2.5-32B-Instruct-MPOA-heretic-GGUF

## Resumen

Qwen2.5-32B-Instruct-MPOA-heretic-GGUF es una cuantización en formato GGUF del modelo richardyoung/Qwen2.5-32B-Instruct-MPOA-heretic, un derivado de Qwen2.5-32B-Instruct al que se le ha aplicado una técnica de eliminación de rechazos (refusal removal) conocida como "abliteration" o "heretic". El resultado es un modelo de chat de 32.700 millones de parámetros que responde sin las negativas típicas de los modelos alineados ante peticiones que el modelo original rechazaría. La cuantización la firma mradermacher, un conocido publicador de versiones GGUF de la comunidad.

El modelo base es Qwen2.5-32B-Instruct, un transformer decoder-only denso de Alibaba con 32.763.876.352 parámetros reales, entrenado originalmente para instrucciones y conversación. Sobre esa base, Richard J. Young aplicó el proceso "heretic" (eliminación de direcciones de rechazo en el espacio de activaciones) y lo publicó bajo acceso restringido con un formulario de gating orientado a investigación en seguridad de IA. mradermacher ha generado las versiones estáticas cuantizadas en GGUF para su uso con llama.cpp y derivados.

La relevancia de esta ficha es doble: por un lado, documenta un caso de uso típico de la comunidad open source (cuantización de un modelo "uncensored" para inferencia local); por otro, advierte de que se trata de un modelo con la alineación de seguridad deliberadamente eliminada, lo que lo hace inadecuado para producción orientada al público sin salvaguardas externas. El repositorio acumula 1.052 descargas y no tiene likes, lo que sugiere un interés de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Qwen2.5-32B-Instruct soporta 32.768 tokens nativos, ampliable; no confirmado para este derivado) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (segun la model card; el base Qwen2.5 es multilingue, pero el derivado declara solo ingles) |
| Licencia | apache-2.0 (con gating en el modelo base de richardyoung) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el base en safetensors |
| Tamano del repo | 224,0 GB |
| Libreria | transformers (declarada), uso real via llama.cpp |
| Modelo base | richardyoung/Qwen2.5-32B-Instruct-MPOA-heretic |
| Autor de la cuantizacion | mradermacher |
| Fecha de creacion | 2026-11-05 |
| Ultima actualizacion | 2026-11-26 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-32B-Instruct: un transformer decoder-only denso con atención de múltiples cabezas con RoPE, normalización RMSNorm y activación SwiGLU, en la línea estándar de la familia Qwen2.5. No es un modelo MoE ni híbrido SSM; todos los parámetros están activos en cada token. La innovación respecto al modelo original no está en la arquitectura sino en el post-entrenamiento: el proceso "heretic" (MPOA, presumiblemente *Modified Projection of Activations* u operación similar) identifica y elimina las direcciones de activación asociadas a la negativa a responder, reduciendo la tasa de rechazos sin reentrenar los pesos desde cero.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO específicos para este derivado. El modelo base Qwen2.5-32B-Instruct fue entrenado por Alibaba con un corpus multilingüe de billones de tokens y ajustado con preferencias humanas; el derivado heretic hereda esos pesos y solo modifica el comportamiento de rechazo. mradermacher ha generado cuantizaciones estáticas (sin imatrix en este repo; las versiones con imatrix están en el repo -i1-GGUF). No se documentan técnicas de decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, heredada de Qwen2.5-32B-Instruct.
- Razonamiento y matemáticas de nivel medio-alto, propio de un modelo de 32B de la familia Qwen2.5.
- Generación de código en múltiples lenguajes, aunque el foco declarado del derivado es el chat sin restricciones.
- Respuestas sin rechazo ante peticiones que el modelo alineado rechazaría (comportamiento "uncensored"/"abliterated").
- Capacidad de seguir instrucciones y mantener formato de chat (plantilla ChatML de Qwen).
- No se documenta soporte explícito de tool calling ni function calling en la información proporcionada.
- No se documenta soporte de agentes, multi-step reasoning estructurado ni modo "thinking".
- No se documenta visión, audio ni otras modalidades.
- Multilingüismo limitado según la model card: solo inglés declarado.

## Casos de uso

- Investigación en seguridad de IA y red-teaming: el modelo sirve para estudiar qué respuestas produce un modelo de 32B sin las capas de rechazo, comparándolo con Qwen2.5-32B-Instruct alineado para medir el efecto de la abliteration en tasas de cumplimiento y toxicidad.
- Evaluación de robustez de filtros: desplegar el modelo detrás de un clasificador de contenido para comprobar si las salvaguardas externas capturan las respuestas que el modelo interno ya no bloquea; útil para validar pipelines de moderación.
- Experimentación personal en local: con la cuantización Q4_K_M (20,0 GB) cabe en una GPU de 24 GB (RTX 3090/4090) y permite conversaciones largas en inglés sin depender de API.
- Generación de texto creativo sin restricciones temáticas: escritura de ficción, guiones o narrativa con temáticas sensibles, donde el modelo alineado suele negarse; el usuario asume la responsabilidad del contenido.
- Docencia y cursos sobre alineación: usar el par alineado/abliterado como ejemplo práctico de cómo se implementa y se revierte la negativa a responder en modelos transformer.
- Benchmarking de cuantizaciones: comparar calidad de Q2_K a Q8_0 sobre el mismo modelo para estudiar la degradación por cuantización en tareas de chat; el repo ofrece 11 variantes con tamaños de 12,4 a 34,9 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del derivado y la del repositorio GGUF no incluyen tablas de MMLU, HumanEval, GSM8K ni métricas de tasa de rechazo. Cualquier cifra que se cite para este modelo debe tomarse de evaluaciones independientes del usuario, no del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 12,4 GB (Q2_K) y 34,9 GB (Q8_0) solo para los pesos; añadir 2-6 GB para contexto KV según longitud y batch.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 y contextos largos; RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q4_K_M (20,0 GB) y Q4_K_S (18,9 GB) con contexto moderado.
- Cabe en consumer GPU: sí, en GPUs de 24 GB con cuantizaciones Q4 o inferiores; Q5_K_M (23,4 GB) queda muy justo en 24 GB y Q6_K/Q8_0 requieren 32 GB o más (RTX 5090, A6000, dos GPUs).
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (importando el GGUF), LM Studio, text-generation-webui, koboldcpp; vLLM y TGI no consumen GGUF de forma nativa y requerirían el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependen fuertemente de la GPU y de la cuantización. Como referencia cualitativa, Q4_K_M en RTX 4090 suele ser la opción "fast, recommended" según el propio autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-32B-Instruct-MPOA-heretic-GGUF (este) | 32,7B | no disponible | apache-2.0 (con gating en base) | GGUF | Sin rechazos, solo ingles declarado |
| Qwen2.5-32B-Instruct (original) | 32,7B | 32.768 nativo | apache-2.0 | safetensors, GGUF | Alineado, multilingue, referencia de calidad |
| Qwen2.5-32B-Instruct-abliterated (variantes comunitarias) | 32,7B | 32.768 nativo | apache-2.0 | safetensors, GGUF | Alternativa de abliteration sin gating |
| Llama-3.3-70B-Instruct (referencia de gama) | 70B | 128.000 | Llama 3.3 Community License | safetensors, GGUF | Mayor calidad, requiere mas VRAM |

No se dispone de datos de rendimiento comparativo (benchmarks) en la información proporcionada para este derivado; la comparación se limita a parámetros, contexto, licencia y formato.

## Limitaciones y advertencias

- Modelo con la alineación de seguridad eliminada deliberadamente: puede generar contenido tóxico, ilegal o dañino sin las negativas del modelo original. No apto para aplicaciones de cara al público sin moderación externa.
- Riesgo elevado de alucinación, exacerbado por la cuantización agresiva (Q2_K, Q3_K_S) y por la pérdida de calibración que puede introducir la abliteration.
- Idiomas: la model card declara solo inglés; el multilingüismo de Qwen2.5 no está garantizado tras el proceso heretic.
- Licencia: el repo GGUF declara apache-2.0, pero el modelo base de richardyoung está sujeto a un formulario de gating con campos de afiliación y uso previsto; conviene revisar los términos del base antes de uso comercial.
- El modelo base exige aceptar que se usará "de forma lícita y sin dañar a otros"; el incumplimiento de esa declaración puede tener implicaciones legales según jurisdicción.
- Contexto: no se confirma en la información proporcionada que el derivado conserve los 32.768 tokens del base; verificar antes de desplegar en casos de contexto largo.
- Sin soporte documentado de tool calling ni function calling: no asumir comportamiento de agente sin validación previa.
- Repositorio con 0 likes y 1.052 descargas: poca validación comunitaria; tratar como experimental.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-MPOA-heretic-GGUF
- Modelo base (con gating): https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-MPOA-heretic
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-MPOA-heretic-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen2.5-32B-Instruct-MPOA-heretic-GGUF
- Modelo original Qwen2.5-32B-Instruct: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Licencia del modelo base Qwen: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- CV del autor del derivado: https://cv.deepneuro.ai
- Perfil del autor del derivado: https://huggingface.co/richardyoung
- FAQ y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
