# g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch01

## Resumen

El modelo `g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch01` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el dataset TOFU (Task of Fictitious Unlearning). Lo publica el usuario g-assismoraes como parte de un experimento de *machine unlearning*: el objetivo es eliminar selectivamente el conocimiento de un subconjunto del dataset de entrenamiento (el 10 % denominado "forget10") sin degradar el resto de capacidades del modelo.

La técnica empleada combina dos estrategias: reinicialización de los embeddings de entrada y de la cabeza del modelo de lenguaje (LM head) a partir de los pesos originales de Phi-1.5, y un entrenamiento con una pérdida compuesta que suma una pérdida de *token IHL* sobre el conjunto a olvidar más una entropía cruzada (CE) ponderada con factor 1,0 sobre el conjunto a retener. Se trata de un checkpoint completo y autónomo, no de un adaptador, e incluye un fichero `ihl_manifest.json` con los detalles del proceso.

El modelo tiene 1.418.270.720 parámetros (aproximadamente 1,4 mil millones) y un tamaño de repositorio de 2,8 GB en formato safetensors. Es relevante en el contexto de la investigación sobre privacidad y cumplimiento normativo (derecho al olvido en el RGPD), donde la capacidad de eliminar información concreta de un modelo entrenado sin reentrenarlo desde cero es un problema abierto. No obstante, se trata de un artefacto de investigación con cero descargas y sin pipeline declarado, no de un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con código personalizado (`custom_code`) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_phi-1.5 |
| Tamaño del repositorio | 2,8 GB |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5 de Microsoft: un transformer decoder-only de aproximadamente 1,4 mil millones de parámetros, entrenado originalmente con datos sintéticos y web filtrados para razonamiento y código. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplicó un ajuste fino supervisado con el dataset TOFU, que contiene 200 autores ficticios con 20 preguntas y respuestas cada uno, diseñado para evaluar el olvido selectivo.

Este checkpoint concreto aplica una variante de *unlearning* denominada IHL + Reset Both. Los embeddings de entrada y la cabeza de lenguaje se reinicializan desde `microsoft/phi-1_5` (es decir, se descarta lo aprendido en esas capas durante el ajuste fino con TOFU), mientras que el resto de pesos del transformer se conservan de `locuslab/tofu_ft_phi-1.5`. El entrenamiento usa una pérdida compuesta: token IHL sobre el conjunto forget10 (el 10 % de autores a olvidar) más 1,0 veces la entropía cruzada sobre el conjunto retain. Corresponde a la época 1 de 20. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5, orientada a texto técnico y razonamiento básico.
- Razonamiento de sentido común y matemáticas elementales, limitado por el tamaño de 1,4 B de parámetros.
- Generación de código y comprensión de sintaxis de programación, capacidad característica de Phi-1.5.
- Capacidad de olvido selectivo: el modelo está entrenado para no reproducir el conocimiento asociado al conjunto forget10 del dataset TOFU.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés según la model card.
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- Investigación en *machine unlearning*: sirve como checkpoint de referencia para medir la eficacia de la técnica IHL + Reset Both frente a otros métodos de olvido en el benchmark TOFU, comparando las métricas de forget y retain.
- Auditoría de privacidad y cumplimiento del RGPD: permite estudiar hasta qué punto es posible eliminar datos personales de un modelo ajustado sin reentrenar, un requisito del derecho al olvido.
- Reproducción de experimentos académicos: el fichero `ihl_manifest.json` y la nomenclatura del repositorio permiten replicar la configuración exacta (época 1 de 20, forget10, factor CE 1,0) en estudios comparativos.
- Evaluación de degradación de capacidades: al conservar los pesos del transformer y reinicializar embeddings y LM head, es útil para medir la pérdida de rendimiento general tras el olvido en tareas de generación de texto y código.
- Base para experimentos de *continual learning*: el checkpoint puede servir como punto de partida para aplicar técnicas adicionales de olvido o de recuperación de conocimiento.
- Docencia y formación: ilustra de forma práctica cómo se construye un pipeline de unlearning con pérdidas compuestas y reinicialización de capas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8 GB solo para pesos, más memoria para el contexto y el runtime (estimación típica de 4-6 GB en total).
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,8-1 GB para pesos.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4090) es suficiente para FP16; para cuantización 4 bits basta con 4 GB.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con 6-8 GB de VRAM.
- Opciones de despliegue: al requerir `custom_code` y no tener pipeline declarado, es necesario cargar el modelo con `trust_remote_code=True` en Transformers; no se ha verificado compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch01 | 1,4 B | no disponible | Apache 2.0 | HuggingFace, 0 descargas | Checkpoint de unlearning, requiere `custom_code` |
| locuslab/tofu_ft_phi-1.5 | 1,4 B | no disponible | Apache 2.0 | HuggingFace | Modelo base ajustado con TOFU, sin olvido |
| microsoft/phi-1_5 | 1,3 B | 2.048 tokens (según documentación pública de Phi-1.5) | MIT | HuggingFace | Modelo original de Microsoft, sin ajuste TOFU |
| locuslab/tofu_llama2-7b | 7 B | no disponible | Llama 2 | HuggingFace | Alternativa de mayor tamaño para experimentos TOFU |

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y sin validación externa; no apto para uso en producción.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor del repositorio.
- El olvido selectivo no está verificado de forma independiente; puede existir filtración de conocimiento del conjunto forget10 o degradación no medida en el conjunto retain.
- Riesgo de alucinación inherente a un modelo de 1,4 B de parámetros, agravado por la reinicialización de embeddings y LM head.
- Capacidades limitadas al inglés; no se ha documentado soporte multilingüe.
- Longitud de contexto no documentada en la model card; no debe asumirse un contexto largo.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo de unlearning sin evaluar sesgos ni calidad es desaconsejable.
- El checkpoint corresponde solo a la época 1 de 20; su rendimiento puede ser inferior al de épocas posteriores del mismo experimento.
- No se han documentado evaluaciones de sesgo ni de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch01
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU (Task of Fictitious Unlearning): https://arxiv.org/abs/2401.06121
