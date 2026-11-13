# mamelles/Qwen3.5-9B-Wolof-CPT-v1-GGUF

## Resumen

Qwen3.5-9B-Wolof-CPT-v1-GGUF es una exportación en formato GGUF del modelo Tonic/Qwen3.5-9B-Wolof-CPT-v1, un ajuste del modelo base Qwen3.5 de 9B parámetros orientado al idioma wolof mediante continued pre-training (CPT). El modelo lo publica el usuario mamelles en Hugging Face y está pensado para su uso con llama.cpp y herramientas compatibles con GGUF. Con 8.984.596.992 parámetros totales (aproximadamente 9B), se trata de un modelo denso de generación de texto que busca cubrir una laguna importante: la escasez de modelos abiertos con competencia real en wolof, una lengua hablada por más de 10 millones de personas principalmente en Senegal, Gambia y Mauritania.

La relevancia del modelo radica en su enfoque lingüístico específico: en lugar de un modelo multilingüe genérico, se ha realizado un preentrenamiento continuado sobre corpus en wolof a partir de un checkpoint Qwen3.5, lo que en teoría mejora la fluidez, el vocabulario y la coherencia en esa lengua. La disponibilidad de cuantizaciones GGUF (F16, Q8_0, Q5_K_M, Q4_K_M y Q4_0) facilita su despliegue en hardware de consumo y en entornos sin GPU de alta gama, algo crítico para comunidades locales y proyectos de preservación lingüística.

No obstante, la información publicada es muy limitada: no se detallan la licencia, los idiomas soportados formalmente, ni los datos de entrenamiento. El repositorio tiene 45,1 GB de tamaño y, en el momento de la consulta, no registra descargas ni interacciones, lo que sugiere un proyecto reciente o de nicho. Esta ficha se basa exclusivamente en los metadatos y la model card disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5), según el nombre del modelo base; detalles específicos no disponibles |
| Parametros totales | 8.984.596.992 (aproximadamente 9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | No disponible (el nombre indica wolof; el modelo base Qwen3.5 es multilingüe, pero no se especifica el conjunto final) |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura del Qwen3.5 base, un transformer denso de aproximadamente 9B parámetros. El proceso de adaptación al wolof se realizó mediante continued pre-training (CPT) sobre el checkpoint Tonic/Qwen3.5-9B-Wolof-CPT-v1, según indica el nombre del modelo. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.) más allá de las que pueda incorporar la familia Qwen3.5 de origen.

La exportación a GGUF la realiza el usuario mamelles, presumiblemente mediante las herramientas de conversión de llama.cpp. El repositorio ocupa 45,1 GB, un tamaño coherente con la inclusión de múltiples cuantizaciones del mismo modelo de 9B (F16 ocupa aproximadamente 18 GB por sí sola, y las demás variantes suman el resto). No se especifica la versión de llama.cpp ni el método exacto de cuantización empleado.

## Capacidades

- Generación de texto conversacional en wolof, según el propósito declarado del ajuste.
- Hereda las capacidades del modelo base Qwen3.5, que incluyen razonamiento, generación de código y matemáticas, aunque no se garantiza su preservación tras el CPT en wolof.
- Soporte de tool calling y function calling: no disponible explícitamente en la documentación; dependerá del modelo base.
- Capacidades de agente y razonamiento multi-paso: no documentadas para esta variante.
- Capacidades multilingües: el modelo base Qwen3.5 es multilingüe, pero el ajuste CPT puede haber alterado el equilibrio entre idiomas; no se especifica.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente en wolof: el modelo puede gestionar conversaciones multi-turno en esta lengua para servicios públicos o empresas en Senegal y la diáspora, aunque la longitud de contexto no está documentada y debe validarse empíricamente.
- Preservación y difusión lingüística: generación de textos, resúmenes y materiales educativos en wolof para escuelas y proyectos culturales, aprovechando que el CPT refuerza el vocabulario y la morfología de la lengua.
- Traducción asistida wolof-francés/inglés: aunque no se documenta como modelo de traducción, puede emplearse en pipelines de traducción con verificación humana, especialmente en dominios cotidianos.
- Chatbots de acceso a servicios: integración en asistentes de voz o texto para trámites administrativos o sanitarios en zonas donde el wolof es la lengua principal, desplegables con llama.cpp en hardware modesto.
- Investigación en NLP de bajos recursos: servir como checkpoint de partida para experimentos de fine-tuning, evaluación de CPT o comparación de técnicas de adaptación lingüística en lenguas africanas.
- Generación de contenido para medios locales: redacción asistida de noticias, guiones o publicaciones en wolof, con revisión editorial, gracias a la disponibilidad de cuantizaciones que permiten ejecución local sin conexión.
- Despliegue en entornos con recursos limitados: las variantes Q4_K_M y Q4_0 permiten ejecutar el modelo en equipos de consumo, útil para ONGs y centros comunitarios sin acceso a GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: F16 requiere aproximadamente 18 GB; Q8_0 alrededor de 9,5 GB; Q5_K_M en torno a 6,5 GB; Q4_K_M aproximadamente 5,5 GB; Q4_0 cerca de 5 GB (estimaciones basadas en el número de parámetros, no confirmadas por el autor).
- GPU recomendadas: para F16, una A100 40 GB, H100 o RTX 4090 (24 GB); para Q8_0, una RTX 4090 o RTX 3090; para Q5_K_M y Q4_K_M, GPUs de 8-12 GB como RTX 3060, RTX 4060 Ti o RTX 4070.
- Compatibilidad con GPU de consumo: sí, especialmente en cuantizaciones Q4 y Q5; también puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (previa importación del GGUF), y cualquier runtime compatible con GGUF; no se documenta soporte para vLLM o TGI en formato GGUF.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Wolof-CPT-v1-GGUF (este) | ~9B | No disponible | No disponible | GGUF | Ajuste CPT en wolof, cuantizaciones múltiples |
| Tonic/Qwen3.5-9B-Wolof-CPT-v1 | ~9B | No disponible | No disponible | Safetensors | Modelo base del que deriva esta exportación |
| Qwen3.5 base (9B) | ~9B | No disponible | No disponible | Safetensors/GGUF | Modelo multilingüe original, sin especialización en wolof |

No se dispone de información sobre otros modelos comparables específicos para wolof en la documentación proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con el autor o consultar el modelo base antes de un despliegue en producción.
- Idiomas soportados no documentados: aunque el objetivo es el wolof, se desconoce el grado de competencia en otros idiomas y si el CPT ha degradado capacidades previas del Qwen3.5 base.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en dominios especializados y en una lengua con menos datos de entrenamiento.
- Sesgos conocidos: no documentados; los corpus en wolof pueden introducir sesgos regionales, de género o culturales que no han sido evaluados.
- Longitud de contexto desconocida: no se puede garantizar el rendimiento en conversaciones largas o documentos extensos.
- Ausencia de benchmarks: no hay evidencia publicada sobre calidad, fluidez o precisión en wolof, por lo que se recomienda una evaluación propia antes de usar el modelo en producción.
- Proyecto con nula tracción: cero descargas y cero likes en el momento de la consulta; no hay comunidad que haya validado el modelo.
- Fecha de creación futura (2026-11-13): los metadatos indican una fecha posterior a la actual, lo que puede deberse a un error de registro o a una publicación programada; conviene verificar la integridad del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mamelles/Qwen3.5-9B-Wolof-CPT-v1-GGUF
- Modelo base: https://huggingface.co/Tonic/Qwen3.5-9B-Wolof-CPT-v1
- llama.cpp (runtime compatible): https://github.com/ggerganov/llama.cpp
- Ollama (runtime compatible): https://ollama.com
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la búsqueda web proporcionada.
