# richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic

## Resumen

Olmo-3.1-32B-Instruct-ARA-heretic es un ajuste fino del modelo allenai/Olmo-3.1-32B-Instruct, publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "heretic" o "abliterated": una modificación de los pesos orientada a eliminar o reducir los comportamientos de rechazo y censura del modelo original, de modo que responda a peticiones que el modelo base declinaría. El modelo conserva la arquitectura y el tamaño del original, con 32.233.522.176 parámetros totales según los pesos en safetensors.

La relevancia de esta ficha es doble. Por un lado, documenta una práctica extendida en la comunidad open source: la publicación de derivados "decensored" de modelos instructivos, útiles para investigación sobre alineamiento, evaluación de sesgos y estudios de robustez. Por otro, advierte de que se trata de un modelo con acceso restringido (gated) en Hugging Face, lo que exige aceptar condiciones antes de descargarlo, y de que su licencia declarada es apache-2.0, aunque el modelo base y los datos de entrenamiento pueden imponer condiciones adicionales.

El modelo se distribuye en formato transformers con pesos safetensors, está etiquetado para generación de texto y conversación, y declara soporte únicamente para inglés. No se han publicado en la información disponible datos de benchmarks, detalles del proceso de abliteración ni especificaciones completas de contexto o cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de allenai/Olmo-3.1-32B-Instruct; detalles de capas y atención no disponibles) |
| Parametros totales | 32.233.522.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (según metadatos; el modelo base puede imponer condiciones adicionales) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del instructivo allenai/Olmo-3.1-32B-Instruct, de 32.233.522.176 parámetros. La información disponible no detalla la arquitectura interna (número de capas, dimensión oculta, tipo de atención, uso de RoPE, etc.), por lo que no es posible confirmar si incorpora innovaciones como atención lineal o decodificación especulativa. Tampoco se especifican la longitud de contexto nativa ni el tokenizador.

El entrenamiento declarado corresponde a una intervención de tipo "heretic/abliterated", cuyo objetivo es reducir la propensión del modelo a rechazar peticiones. Los tags del repositorio mencionan el dataset allenai/Dolci-Instruct-RL y dos referencias arXiv (2512.13961 y 2611.17846), pero no se aporta información sobre el número de tokens utilizados, la composición del dataset de ajuste, ni si se emplearon técnicas de RLHF, DPO o intervenciones directas sobre pesos (por ejemplo, edición de direcciones de rechazo). No se dispone de detalles reproducibles del procedimiento más allá de las etiquetas "reproducible" y "heretic".

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo instructivo base.
- Respuesta a peticiones que el modelo original rechazaría, gracias a la modificación "heretic/abliterated".
- Razonamiento y generación de código: presumiblemente conservadas del modelo base, aunque no se documentan evaluaciones específicas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento y rechazo: el modelo permite estudiar cómo varía la tasa de rechazo respecto al modelo base y analizar qué tipos de peticiones se aceptan o se declinan tras la intervención, con fines de evaluación de seguridad.
- Evaluación de sesgos y robustez: al eliminar parte de las barreras de rechazo, sirve para medir la toxicidad, la veracidad y la estabilidad de las respuestas en condiciones de prompt adversario, comparando con Olmo-3.1-32B-Instruct.
- Generación de datos sintéticos para pruebas de red teaming: se puede emplear para producir conversaciones y respuestas que alimenten pipelines de evaluación de filtros y clasificadores de contenido.
- Experimentación en investigación de mecanismos internos: al ser un derivado de pesos modificados, es útil para comparar activaciones y direcciones latentes entre el modelo base y la variante abliterated.
- Fine-tuning posterior en dominios creativos o de ficción: escritura de narrativa con contenido sensible que el modelo base rechazaría, siempre que se cumplan los requisitos legales y éticos aplicables.
- Despliegue en entornos de investigación controlados: con acceso restringido y uso interno, para pruebas de inferencia con transformers en infraestructura propia, sin exposición a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 64 GB solo para pesos, más memoria para caché KV y activaciones; en la práctica requiere GPUs de 80 GB o configuraciones multi-GPU.
- Cuantización: no se ofrecen variantes GGUF ni cuantizadas en el repositorio; para reducir VRAM habría que generarlas a partir de los safetensors.
- GPU recomendadas: A100 80 GB, H100 80 GB o múltiples GPUs de 24-48 GB con paralelismo de tensor.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en fp16; requeriría cuantización agresiva (4 bits, no publicada) para acercarse a ese rango.
- Opciones de despliegue: transformers como vía principal; vLLM o TGI serían viables si se generan los artefactos adecuados, aunque no se documentan configuraciones oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic | 32.233.522.176 | no disponible | apache-2.0 | Gated en Hugging Face | Variante abliterated del instructivo Olmo 3.1 32B |
| allenai/Olmo-3.1-32B-Instruct | 32B (aproximado) | no disponible | no disponible en esta ficha | Público en Hugging Face | Modelo base, con rechazos alineados |
| Otras variantes abliterated de modelos 30-34B | variable | variable | variable | variable | No se dispone de datos comparativos verificados en la información proporcionada |

## Limitaciones y advertencias

- La modificación "heretic" reduce los rechazos, lo que aumenta el riesgo de generar contenido dañino, ilegal o sexualmente explícito; no es apta para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad específicas para esta variante; la intervención sobre pesos puede degradar la coherencia y la precisión respecto al modelo base.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Licencia: aunque los metadatos indican apache-2.0, el modelo base y el dataset Dolci-Instruct-RL pueden imponer condiciones adicionales; conviene revisar los términos del modelo original antes de un uso comercial.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad y la distribución automatizada.
- Sin datos de benchmarks ni de contexto: no es posible evaluar su calidad frente al modelo base sin pruebas propias.
- El número de descargas (529) y la ausencia de "likes" sugieren una adopción limitada y poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic
- Modelo base: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct
- Dataset referenciado: https://huggingface.co/datasets/allenai/Dolci-Instruct-RL
- Paper arXiv 2512.13961: https://arxiv.org/abs/2512.13961
- Paper arXiv 2611.17846: https://arxiv.org/abs/2611.17846
