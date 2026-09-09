# leonsarmiento/Huihui-Qwen3.6-35B-A3B-abliterated-3bit-XL-mlx

## Resumen

Huihui-Qwen3.6-35B-A3B-abliterated-3bit-XL-mlx es una conversión al formato MLX del modelo abliterado de Huihui AI, que a su vez parte de Qwen3.6-35B-A3B de Alibaba. El autor de esta variante cuantizada es leonsarmiento. La conversión utiliza la estrategia BaseQuant_XL de 3 bits mixtos, diseñada para equipos Apple Silicon con RAM limitada: mantiene las capas de enrutamiento MoE en bf16 y reduce los expertos enrutados a 3 bits, resultando en un paquete de unos 17,8 GB.

El modelo original Qwen3.6-35B-A3B es una arquitectura MoE híbrida con 35.107 millones de parámetros (35,1B) y aproximadamente 3B activos por token. Incorpora 256 expertos (8 activos por token más 1 compartido), atención completa más atención lineal tipo Gated DeltaNet, un encoder de visión y una ventana de contexto extendida. La versión abliterated elimina el mecanismo de rechazo mediante ablación direccional, por lo que responde sin los filtros de seguridad habituales de Qwen.

Su relevancia radica en ofrecer un modelo multimodal de 35B con solo ~3B activos, cuantizado para funcionar en Mac con 24 GB de RAM o más, manteniendo la capacidad de visión y un coste de memoria moderado. Sin embargo, es una conversión de terceros sin licencia explícita y sin benchmarks publicados, lo que exige precaución antes de usarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: atención completa + atención lineal (Gated DeltaNet) + encoder de visión; 256 expertos, 8 activos por token + 1 experto compartido |
| Parametros totales | 35.107.181.936 (~35,1B) |
| Parametros activos | ~3B por token (según la model card) |
| Longitud de contexto | No disponible (etiquetada como "extendida" en la model card) |
| Tipos de cuantizacion | BaseQuant_XL 3-bit mixto (bf16, 8-bit, 6-bit y 3-bit según capa; bits por peso 4.055; group size 64) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

La arquitectura base es un transformer MoE con 256 expertos enrutados y un experto compartido. Cada token activa 8 expertos además del compartido, lo que reduce el coste computacional efectivo a unos 3B de parámetros activos. La atención combina un mecanismo full attention (self_attn) y una atención lineal basada en Gated DeltaNet (linear_attn), diseñada para manejar secuencias largas con menor coste. El modelo incluye un vision tower para procesar imágenes y un modo de razonamiento explícito (thinking) activable mediante `enable_thinking=true`, característico de la familia Qwen3.

El entrenamiento original de Qwen3.6-35B-A3B no está documentado en la información disponible. La variante Huihui aplica abliteración direccional sobre el modelo base para eliminar el mecanismo de rechazo de respuestas. Esta técnica identifica direcciones en el espacio de activaciones asociadas a las respuestas de rechazo y las anula, resultando en un modelo "uncensored". Los datos de entrenamiento, la composición del dataset y si hubo RLHF/DPO posterior no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto y diálogo conversacional en formato imagen-texto-texto.
- Comprensión multimodal de imágenes mediante el encoder de visión preservado (cuantizado a 6 bits).
- Modo de razonamiento ("thinking") activable con `enable_thinking=true`, que permite pasos intermedios antes de la respuesta final.
- Respuestas sin filtros de seguridad habituales gracias a la abliteración direccional.
- Eficiencia computacional: con ~3B activos por token sobre 35B totales, el coste de inferencia es similar al de un modelo de 3B, manteniendo conocimiento de uno de 35B.
- Arquitectura híbrida de atención: la combinación de full attention y Gated DeltaNet está pensada para contextos largos, aunque el límite exacto no se especifica.
- Cuantización BaseQuant_XL: las capas de enrutamiento (router, shared expert gate) y el lm_head se mantienen en bf16, protegiendo las decisiones de routing y la calidad de la salida.

## Casos de uso

- Asistentes multimodales en Mac: puede responder preguntas sobre imágenes y mantener conversaciones extensas usando `mlx-vlm` en equipos Apple Silicon, aprovechando la cuantización de 17,8 GB que cabe en 24 GB de RAM.
- Análisis de capturas de pantalla o documentos escaneados: el encoder de visión permite extraer información de imágenes, diagramas o texto impreso, útil en entornos de oficina o investigación.
- Generación de contenido creativo sin restricciones: apto para ficción, guiones o redacción de temas sensibles donde normalmente el modelo base rechazaría la petición, siempre que se use de forma responsable.
- Prototipado rápido de agentes con razonamiento: el modo thinking y la arquitectura MoE eficiente permiten experimentar con flujos de razonamiento multi-paso en local sin depender de APIs externas.
- Investigación sobre alineación y mecanismos de rechazo: la versión abliterated sirve como caso de estudio para analizar cómo la ablación direccional afecta al comportamiento, la calidad de las respuestas y los sesgos residuales.
- Procesamiento de imágenes en laboratorio o educación: para datasets propios donde se requiere etiquetar o describir visualmente muestras, el modelo puede ejecutarse de manera privada sin enviar datos a servicios externos.
- Despliegue en entornos sin conexión: al ser un modelo local en MLX, es adecuado para aplicaciones con requisitos estrictos de privacidad o en redes aisladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Espacio en disco: el paquete MLX ocupa 17,8 GB (4 shards). Debe añadirse espacio para el runtime y el contexto.
- RAM unificada: se estima que se necesitan al menos 24 GB de RAM en un Mac para cargar los pesos y gestionar el overhead de inferencia. Esta cifra es orientativa, no aparece en la documentación del autor.
- GPU recomendadas: Apple Silicon con chip M2, M3 o M4 y 24 GB o más de RAM unificada. No se han publicado pruebas con modelos concretos.
- Opciones de despliegue: uso con `mlx-vlm`, tal como indica la model card. No se han documentado opciones alternativas como llama.cpp, vLLM o TGI para esta conversión concreta.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un MoE con solo ~3B activos, la latencia podría ser competitiva, pero no existen datos empíricos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-Qwen3.6-35B-A3B-abliterated-3bit-XL-mlx | 35,1B MoE (~3B activos) | No especificado | 3-bit BaseQuant_XL | No disponible | HuggingFace |
| Huihui-Qwen3.6-35B-A3B-abliterated-6bit-XL-mlx | 35,1B MoE (~3B activos) | No especificado | 6-bit BaseQuant_XL | No disponible | HuggingFace |
| Huihui-Qwen3.6-35B-A3B-abliterated-6bit-mlx | 35,1B MoE (~3B activos) | No especificado | 6-bit estándar | No disponible | HuggingFace |
| huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated (base) | 35,1B MoE (~3B activos) | Extendida, sin cifra | Sin cuantizar (bf16) | No disponible | HuggingFace |
| Qwen/Qwen3.6-35B-A3B (original) | 35,1B MoE (~3B activos) | Extendida, sin cifra | Sin cuantizar | Depende de la licencia de Qwen | HuggingFace |

La comparativa se basa en características disponibles; no hay benchmarks publicados que permitan comparar rendimiento real.

## Limitaciones y advertencias

- Sin licencia explícita: el uso comercial no está garantizado y podría contravenir los términos del modelo base original.
- Sin benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni otros estándares para evaluar su rendimiento real.
- Cuantización agresiva de 3 bits en los expertos enrutados: puede degradar la precisión en tareas complejas de razonamiento, matemáticas o generación de código, aunque las capas críticas se mantengan en bf16.
- Modelo sin filtros de seguridad: es susceptible de generar contenido inapropiado, ilegal o dañino. Su uso debe restringirse a entornos controlados y con evaluación de riesgos previa.
- Longitud de contexto no especificada: aunque se menciona como "extendida", no se conoce el valor exacto, lo que impide dimensionar aplicaciones con ventanas de conversación largas.
- Idiomas soportados no listados: no hay confirmación de cobertura multilingüe; la calidad en español u otros idiomas es incierta.
- Conversión de terceros: el autor es un usuario independiente; no existe soporte oficial de Qwen ni de Huihui AI para esta cuantización.
- Posibles sesgos no evaluados: la abliteración puede eliminar el rechazo pero no garantiza la eliminación de sesgos dañinos ni de alucinaciones.
- Requisitos de RAM en Mac: aunque ocupa 17,8 GB, el uso simultáneo con aplicaciones y el contexto puede requerir más de 24 GB, lo que limita su uso en equipos con menos memoria.

## Enlaces

- Modelo con esta cuantización: https://huggingface.co/leonsarmiento/Huihui-Qwen3.6-35B-A3B-abliterated-3bit-XL-mlx
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated
- Variante 6-bit XL: https://huggingface.co/leonsarmiento/Huihui-Qwen3.6-35B-A3B-abliterated-6bit-XL-mlx
- Variante 6-bit estándar: https://huggingface.co/leonsarmiento/Huihui-Qwen3.6-35B-A3B-abliterated-6bit-mlx
- Modelo original Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B (enlace inferido de la referencia en la model card)
