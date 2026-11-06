# g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch02

## Resumen

Este modelo es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, a su vez un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `g-assismoraes` como parte de un experimento de *machine unlearning* (desaprendizaje) orientado a eliminar el conocimiento de un subconjunto concreto de datos de entrenamiento (el split `forget10`) sin degradar el rendimiento sobre el resto (split `retain`). Se trata de la época 2 de un entrenamiento de 20 épocas.

La técnica aplicada combina lo que el autor denomina "IHL + Reset Both": las *input embeddings* y la *LM head* se reinicializan desde el modelo original `microsoft/phi-1_5`, mientras que el resto de pesos del Transformer se conservan del modelo ajustado con TOFU. Sobre esa base se aplica una pérdida de token IHL (probablemente una variante de *influence-based* o *information-theoretic* unlearning) sobre el conjunto *forget* más un término de entropía cruzada (CE) con peso 1.0 sobre el conjunto *retain*.

El modelo tiene 1.418.270.720 parámetros (aproximadamente 1,4 mil millones), arquitectura transformer decoder-only tipo Phi-1.5, contexto de 2048 tokens (heredado de Phi-1.5) y licencia Apache 2.0. Es relevante en el contexto de la investigación sobre desaprendizaje selectivo y cumplimiento normativo (derecho al olvido), aunque su naturaleza experimental y su nulo historial de descargas lo sitúan como artefacto de laboratorio más que como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con código personalizado (`custom_code`) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Phi-1.5 usa 2048 tokens) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en fp32/fp16; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only de aproximadamente 1,4 mil millones de parámetros, entrenado originalmente por Microsoft con un enfoque en "libros de texto de calidad" para razonamiento y código. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste fino supervisado con el dataset TOFU, que contiene biografías sintéticas de autores ficticios y pares pregunta-respuesta diseñados para evaluar desaprendizaje.

El checkpoint aquí descrito corresponde a la época 2 de 20 de un procedimiento de desaprendizaje con dos componentes: (1) reinicialización de las *input embeddings* y de la *LM head* desde `microsoft/phi-1_5`, manteniendo el resto de pesos del modelo ajustado con TOFU; y (2) una función de pérdida que suma un término "token IHL" calculado sobre el split `forget` (los datos que se pretende olvidar) y un término de entropía cruzada con coeficiente 1.0 sobre el split `retain` (los datos que deben preservarse). El autor indica que el checkpoint es un modelo completo autónomo y remite a un fichero `ihl_manifest.json` para detalles del procedimiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Phi-1.5.
- Razonamiento de sentido común y matemáticas básicas a nivel de modelo de 1,4 B (capacidad limitada por tamaño).
- Generación de código sencillo, dado el sesgo de Phi-1.5 hacia código y textos tipo libro de texto.
- Respuesta a preguntas sobre el conjunto TOFU, con el conocimiento del split `forget10` supuestamente atenuado por el desaprendizaje.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso explícito.
- No se documenta *thinking mode*, visión ni audio.
- Capacidad multilingüe limitada al inglés (único idioma declarado).

## Casos de uso

- Investigación en *machine unlearning*: sirve como punto de comparación en experimentos que miden la eficacia de técnicas de desaprendizaje sobre TOFU, comparando la época 2 con otras épocas y variantes del mismo autor.
- Evaluación de la degradación de *retain*: permite medir cuánto se pierde en el conjunto de retención al aplicar reinicialización de embeddings y LM head, un análisis habitual en literatura de unlearning.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autónomo, se puede cargar directamente para replicar las métricas publicadas en el *manifest*.
- Estudio de la dinámica de entrenamiento: al estar etiquetado por época (2/20), facilita trazar curvas de olvido/retención a lo largo del entrenamiento.
- Auditoría de licencias y trazabilidad: con licencia Apache 2.0 y linaje documentado (`microsoft/phi-1_5` → `locuslab/tofu_ft_phi-1.5` → este checkpoint), es apto para análisis de procedencia de modelos.
- Docencia y formación: útil como ejemplo didáctico de cómo se construye un pipeline de desaprendizaje con pérdidas combinadas sobre splits forget/retain.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8-3,0 GB solo para pesos, más overhead de activaciones y KV cache.
- VRAM estimada en fp32: aproximadamente 5,7 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090, A10, L4, A100, H100).
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más; en 6 GB requeriría cuantización, que no está publicada oficialmente.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repo usa `custom_code`); vLLM, TGI y llama.cpp no están garantizados sin conversión previa, ya que no se publican pesos GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch02 | 1,42 B | no disponible (base: 2048) | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint de investigación, época 2/20 |
| microsoft/phi-1_5 | 1,3 B | 2048 | MIT (según model card original) | Hugging Face, ampliamente usado | Modelo base original, sin desaprendizaje |
| locuslab/tofu_ft_phi-1.5 | ~1,3 B | 2048 | no disponible en la informacion proporcionada | Hugging Face | Modelo ajustado con TOFU, base de este checkpoint |
| locuslab/tofu_ft_llama2-7b | ~7 B | 4096 | no disponible en la informacion proporcionada | Hugging Face | Alternativa de mayor tamaño para experimentos TOFU |

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 *likes*: no hay evidencia de uso en producción ni validación externa.
- El desaprendizaje es probabilístico: no se garantiza la eliminación completa del conocimiento del split `forget10`; pueden persistir extracciones parciales.
- Rendimiento en el split `retain` potencialmente degradado por la reinicialización de embeddings y LM head, aunque el autor aplica CE sobre retain para mitigarlo.
- Riesgo de alucinación inherente a un modelo de 1,4 B, especialmente en preguntas factuales fuera del dominio de entrenamiento.
- Capacidad multilingüe nula fuera del inglés (único idioma declarado).
- Contexto limitado (heredado de Phi-1.5, 2048 tokens), insuficiente para tareas de contexto largo.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor; auditar antes de usar en entornos sensibles.
- Licencia Apache 2.0 permite uso comercial, pero el linaje incluye pesos de Microsoft (Phi-1.5) y de locuslab; conviene verificar las condiciones de esos modelos base.
- No apto para decisiones automatizadas de alto riesgo: tamaño pequeño, sin benchmarks publicados y sin alineación documentada.
- El nombre del repo sugiere un experimento concreto (época 2, variante IHL + reset de embeddings); no debe interpretarse como un modelo "final" ni como la mejor variante del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch02
- Modelo base del ajuste TOFU: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU: https://arxiv.org/abs/2401.06121
