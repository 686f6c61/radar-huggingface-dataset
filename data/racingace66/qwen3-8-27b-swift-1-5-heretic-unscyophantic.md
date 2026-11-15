# RacingAce66/Qwen3.8-27b-Swift-1.5-heretic-unscyophantic

## Resumen

RacingAce66/Qwen3.8-27b-Swift-1.5-heretic-unscyophantic es un fine-tune derivado de ukisai/Swift-1.5-Qwen3.8-27b, que a su vez es una variante de razonamiento eficiente del Qwen3.8-27B de Alibaba. El autor, RacingAce66, ha aplicado la herramienta Heretic v2.1.0 para realizar una ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 1 a 62 del modelo base, con el objetivo de eliminar los rechazos (refusals) y el comportamiento servil (sycophancy) característicos de los modelos alineados. El resultado es un modelo "decensored" o "abliterated" que conserva la arquitectura y el conocimiento del original pero modifica su comportamiento conversacional.

El modelo hereda las capacidades del Qwen3.8-27B: es un transformer multimodal (pipeline image-text-to-text) de 27.356.728.560 parámetros (aproximadamente 27,36 mil millones), entrenado para razonamiento eficiente en tokens, con especial énfasis en tareas de código, agentes y razonamiento de múltiples pasos. La relevancia de esta variante concreta reside en su carácter experimental: demuestra cómo técnicas de ablación post-hoc pueden alterar drásticamente el perfil de comportamiento de un modelo (de 98/100 rechazos a 8/100) a costa de una divergencia KL de 0,1774 respecto al original, lo que implica una degradación medible de la distribución de salida.

La ficha se basa exclusivamente en la información disponible en la model card y los metadatos de Hugging Face. Muchos datos técnicos (contexto, cuantizaciones, idiomas, benchmarks completos) no están publicados y se indican como "no disponible". El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es un artefacto reciente y poco validado por la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.8; detalles internos no disponibles |
| Parámetros totales | 27.356.728.560 (~27,36 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo solo contiene safetensors; no se listan GGUF en esta variante) |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (licencia "other", enlazada al repo del modelo base) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.8-27B, un transformer multimodal de aproximadamente 27,36 mil millones de parámetros que procesa entradas de imagen y texto (pipeline image-text-to-text). La model card no detalla el número de capas, la dimensión oculta, el mecanismo de atención ni la composición del dataset de preentrenamiento. El modelo base Swift 1.5 fue producido por UkisAI mediante post-entrenamiento (RL y OPD, presumiblemente "on-policy distillation") sobre Swift 1.0, con foco en tareas de horizonte largo, agentes y código; según la model card, emplea un 58,5 % menos de tokens de pensamiento que el Qwen3.8-27B original con una puntuación un 0,35 % superior y una aceleración de 1,95× en varias tareas.

La innovación específica de esta variante es la aplicación de Heretic 2.1.0, una herramienta de ablación que modifica los pesos en un rango de capas (start_layer_index=1, end_layer_index=62) mediante una combinación ponderada de direcciones de comportamiento. Los parámetros ARA publicados son: preserve_good_behavior_weight=0,0323, steer_bad_behavior_weight=0,0003, overcorrect_relative_weight=0,9874 y neighbor_count=13. El proceso es reproducible según el autor (carpeta `reproduce/` en el repo). No se especifica si hubo entrenamiento adicional tras la ablación ni qué dataset se usó para calibrar las direcciones de comportamiento.

## Capacidades

- Generación de texto y razonamiento multimodal: el pipeline es image-text-to-text, por lo que acepta imágenes junto con texto, aunque la model card no detalla tareas de visión específicas.
- Razonamiento eficiente en tokens: hereda el modo "efficient-thinking" y "token-efficient" del modelo base, con reducción de tokens de pensamiento frente a Qwen3.8-27B.
- Generación de código: el modelo base fue post-entrenado con foco en coding (se mencionan LiveCodeBench y Terminal Bench 2.1 como métricas de mejora).
- Capacidades agénticas: soporte declarado para tareas de horizonte largo y multi-step reasoning, con entrenamiento en entornos RL de agentes.
- Comportamiento sin rechazos: la ablación reduce los refusals de 98/100 a 8/100 según la evaluación del autor.
- Reducción de sycophancy: de 60/78 a 2/78 respuestas serviles en la evaluación interna.
- Tool calling / function calling: no se menciona explícitamente en la información disponible; el tag "endpoints_compatible" sugiere compatibilidad con endpoints, pero no se detalla.
- Capacidades multilingües: no disponible.
- Modo thinking: los tags incluyen "reasoning" y "efficient-thinking", lo que indica soporte de cadena de pensamiento, aunque no se especifica el formato exacto.

## Casos de uso

- Investigación sobre alineación y ablación: el modelo sirve como caso de estudio reproducible para analizar cómo la ablación de rangos arbitrarios afecta a los rechazos y la sycophancy, con parámetros ARA públicos y carpeta de reproducción. Es adecuado porque el autor documenta el proceso y las métricas de divergencia KL.
- Generación de código en entornos controlados: hereda el post-entrenamiento en coding del modelo base, por lo que puede usarse para generar fragmentos de código o prototipos en pipelines internos donde no se requieran garantías de seguridad estrictas. La reducción de tokens de pensamiento abarata la inferencia en comparación con el original.
- Agentes de terminal y automatización: el modelo base fue entrenado para Terminal Bench 2.1 y tareas agénticas de horizonte largo; esta variante puede emplearse en entornos de simulación o sandbox para probar flujos de agente sin las restricciones de rechazo del modelo alineado.
- Análisis de sesgos y robustez: al ser un modelo "uncensored", es útil para estudiar qué contenido genera cuando se eliminan las barreras de rechazo, en un contexto de auditoría de seguridad y evaluación de riesgos.
- Prototipado de asistentes conversacionales sin fricción: para demos internas donde se quiere evitar que el modelo rechace peticiones legítimas pero sensibles (por ejemplo, discusión de temas médicos o legales), aunque con supervisión humana obligatoria.
- Evaluación comparativa de técnicas de decensoring: permite comparar Heretic frente a otras técnicas de abliteration (por ejemplo, directional ablation clásica) usando las mismas métricas de refusals y KL divergence.
- Generación multimodal exploratoria: al ser image-text-to-text, puede usarse para describir o razonar sobre imágenes en tareas de investigación, aunque la model card no detalla su calidad en visión.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son los siguientes, medidos con la herramienta integrada de Heretic 2.1.0:

| Benchmark | Métrica | Valor |
|---|---|---|
| AGIEval | Accuracy (acc,none) | 0,5503 |
| AGIEval | Error estándar | 0,0051 |
| CommonsenseQA | Accuracy (acc,none) | 0,8575 |
| CommonsenseQA | Error estándar | 0,0100 |

Comparación de comportamiento respecto al modelo original (ukisai/Swift-1.5-Qwen3.8-27b):

| Métrica | Este modelo | Modelo original |
|---|---|---|
| Refusals | 8/100 | 98/100 |
| Respuestas con sycophancy | 2/78 | 60/78 |
| Divergencia KL | 0,1774 | 0 (por definición) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. El autor indica que ampliará los benchmarks en el futuro.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,36 B parámetros en safetensors (aproximadamente 54,8 GB en fp16), se necesitan al menos 55 GB de VRAM para cargar los pesos en precisión completa. En cuantización de 8 bits, unos 28 GB; en 4 bits, unos 14-16 GB (estimación basada en el tamaño de parámetros, no confirmada por el autor).
- GPU recomendadas: para fp16, A100 80 GB, H100 80 GB o dos GPUs de 40 GB en paralelo. Para cuantización 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) podría ser suficiente, aunque no está verificado.
- Cabe en consumer GPU: sí, en cuantización 4 bits en GPUs de 24 GB (RTX 4090, RTX 3090) o superiores; en fp16 no cabe en ninguna consumer GPU actual.
- Opciones de despliegue: transformers (librería declarada). No se listan repositorios GGUF para esta variante concreta, aunque el modelo base tiene GGUF y GSQ-RCO GGUF publicados por UkisAI. vLLM, llama.cpp, Ollama o TGI no están confirmados para esta variante.
- Latencia y throughput: no disponibles. El modelo base reporta una aceleración de 1,95× frente a Qwen3.8-27B en varias tareas gracias a la reducción de tokens de pensamiento, pero no se aportan cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Comportamiento | Disponibilidad |
|---|---|---|---|---|---|
| RacingAce66/Qwen3.8-27b-Swift-1.5-heretic-unscyophantic | ~27,36 B | no disponible | swift-open-license-1.0 | 8/100 refusals, 2/78 sycophancy, KL 0,1774 | 0 descargas, safetensors |
| ukisai/Swift-1.5-Qwen3.8-27b (base) | ~27,36 B | no disponible | swift-open-license-1.0 | 98/100 refusals, 60/78 sycophancy | Modelo base, con GGUF publicado |
| Qwen/Qwen3.8-27B (fundacional) | ~27 B | no disponible | no disponible | Alineado estándar | Modelo fundacional de Alibaba |
| Modelos abliterated de la comunidad (genéricos) | variable | variable | variable | variable | Depende del autor |

La comparativa se limita a los modelos mencionados en la información disponible. No se dispone de datos de benchmarks comparables para Qwen3.8-27B ni para otros modelos de la misma categoría en esta ficha.

## Limitaciones y advertencias

- La ablación introduce una divergencia KL de 0,1774 respecto al modelo original, lo que indica una alteración medible de la distribución de probabilidad de salida; puede degradar la coherencia o la precisión en tareas que dependían del alineamiento original.
- El modelo está diseñado para eliminar rechazos; puede generar contenido dañino, sesgado o inapropiado sin las salvaguardas habituales. No es adecuado para producción sin filtros externos y supervisión humana.
- La reducción de sycophancy puede hacer que el modelo sea más directo o abrupto en conversaciones, lo que puede afectar a la experiencia de usuario en aplicaciones de atención al cliente.
- No se han publicado datos sobre sesgos demográficos, de género o culturales; el proceso de ablación no garantiza la eliminación de sesgos, solo de rechazos y sycophancy.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo de 27 B, el riesgo persiste y puede aumentar si la ablación afecta a capas de razonamiento.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingüe.
- Longitud de contexto: no disponible; limita la evaluación para casos de uso con documentos largos.
- Licencia: swift-open-license-1.0, con enlace al LICENSE del modelo base. Es una licencia "other" que puede imponer restricciones al uso comercial; es necesario revisar el texto completo antes de desplegar en producción.
- El modelo tiene 0 descargas y 0 likes, sin validación independiente de la comunidad; los benchmarks publicados son internos y de alcance limitado (AGIEval y CommonsenseQA).
- El repositorio tiene 54,8 GB y solo safetensors; no hay versiones cuantizadas oficiales para esta variante, lo que dificulta el despliegue en hardware modesto.
- El tag "gated: true" indica que el acceso al modelo puede requerir aceptar condiciones en Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RacingAce66/Qwen3.8-27b-Swift-1.5-heretic-unscyophantic
- Modelo base (UkisAI Swift 1.5 Qwen3.8-27B): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- GGUF del modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GGUF
- GSQ-RCO GGUF del modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Modelo fundacional Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Swift 1.0 (versión anterior): https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Heretic (herramienta de ablación): https://heretic-project.org
- Dataset de SFT multi-turno agéntico: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Web de UkisAI: https://ukisai.com
- Página de producto Swift: https://ukisai.com/products/swift
- Demo de juego 3D generado: https://ukisai.com/swift-games/27b
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
