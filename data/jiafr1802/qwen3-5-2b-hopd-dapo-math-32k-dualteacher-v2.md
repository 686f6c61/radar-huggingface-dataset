# jiafr1802/Qwen3.5-2B-HOPD-DAPO-Math-32K-DualTeacher-v2

## Resumen

El modelo `jiafr1802/Qwen3.5-2B-HOPD-DAPO-Math-32K-DualTeacher-v2` es un ajuste fino por destilación on-policy del modelo multimodal Qwen3.5-2B (2.213.241.664 parámetros, denso, con encoder de visión y arquitectura de *gated delta networks* según la documentación del modelo base). Lo publica el usuario jiafr1802 como artefacto de investigación: no es un modelo de propósito general, sino el resultado de un experimento de destilación de conocimiento sobre un subconjunto matemático (DAPO-Math).

El entrenamiento destila desde dos rutas de inferencia del mismo checkpoint profesor Qwen3.5-4B: una ruta visual, que recibe la página de la pregunta renderizada como PNG, y una ruta textual, que recibe la pregunta completa en LaTeX normalizado —incluyendo el código Asymptote de los diagramas— sin tokens de imagen. Las dos distribuciones del profesor se combinan en cada posición de la respuesta mediante el objetivo H-OPD (*confidence-aware*): unión de soportes top-8, arbitraje por entropía top-k negativa con temperatura de fusión 0,5 y KL inversa de soporte restringido.

Es relevante ahora porque publica las métricas de diagnóstico del paso final y los pesos completos de una repetición corregida (v2) que sustituye a un checkpoint anterior afectado por un bug en la entrada de la ruta textual. No obstante, el propio autor advierte de que se trata de una adaptación del método H-OPD, no de una reproducción exacta del artículo, y de que no hay resultados de evaluación en held-out.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3.5) con *gated delta networks* y encoder de visión, según la documentación del modelo base |
| Parámetros totales | 2.213.241.664 (~2,21 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens en el modelo base (fuente: vLLM Recipes); la destilación se realizó con máximo de 4.096 tokens de prompt y 32.768 de respuesta |
| Tipos de cuantización | No se publican GGUF, AWQ ni GPTQ en el repositorio; el checkpoint se distribuye en BF16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (4 shards, 618 tensores), cargable con `transformers` mediante `Qwen3_5ForConditionalGeneration` |
| Modelo base | Qwen/Qwen3.5-2B |
| Modelo profesor | Qwen/Qwen3.5-4B (rutas visual y textual) |
| Tamaño del repositorio | 38,6 GB |
| Pipeline declarado | image-text-to-text |
| Dataset de entrenamiento | 17.679 prompts (DAPO-Math) |
| Fecha de publicación | 2026-10-19 |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3.5-2B original, sin cambios estructurales: un transformer denso con *gated delta networks*, encoder de visión y una ventana de contexto de 262.144 tokens en el modelo base. El ajuste se limita a los pesos, mediante destilación on-policy: el estudiante genera sus propias trayectorias y, en cada posición de la respuesta, se combinan las distribuciones de dos rutas del profesor. La combinación usa unión de soportes top-8, arbitraje por entropía top-k negativa (temperatura de fusión 0,5) y KL inversa restringida al soporte, de modo que el peso efectivo de cada profesor varía según la confianza.

El entrenamiento se ejecutó sobre 17.679 prompts con 34/34 pasos de rollout, batch de entrenamiento 128 y batch de rollout 512, máximo de 4.096 tokens de prompt y 32.768 de respuesta, learning rate 2e-6, precisión BF16 y backend FSDP2 sobre 8× NVIDIA B200 de 183 GB, con una duración de 12:27:36. Las métricas del paso final son: pérdida KD 0,154425, peso del profesor visual 0,491602, peso del profesor textual 0,508398, longitud media de respuesta 6.435,25 tokens, ratio de recorte a 32K 0,005859 y norma de gradiente 0,087224. El autor subraya que ambos profesores parten del mismo checkpoint Qwen3.5-4B, mientras que el artículo original emplea checkpoints separados (VL y solo texto) y una descripción de imagen generada offline para el profesor textual; por tanto, no es una reproducción exacta del paper.

## Capacidades

- Generación de texto y razonamiento matemático en formato LaTeX, orientado a problemas tipo competición (DAPO-Math).
- Entrada multimodal image-text-to-text: acepta la página de la pregunta renderizada como imagen (ruta visual).
- Resolución de problemas con diagramas geométricos, incluyendo código Asymptote asociado.
- Generación de razonamiento largo: longitud media de respuesta de 6.435 tokens, con soporte de hasta 32.768 tokens de respuesta durante el entrenamiento.
- Conversación multi-turno (tag `conversational` en el repositorio).
- Doble ruta de entrada (imagen o LaTeX normalizado) para el mismo problema, lo que permite evaluar consistencia entre modalidades.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning más allá del razonamiento matemático: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Corrección automática de exámenes de matemáticas a partir de una foto: la ruta visual acepta la página renderizada en PNG y devuelve la resolución paso a paso, sin necesidad de teclear el enunciado.
- Digitalización de cuadernos y hojas de problemas: la ruta textual consume el enunciado en LaTeX normalizado y el código Asymptote de los diagramas, lo que encaja en pipelines que ya tienen el contenido en formato estructurado.
- Tutoría con explicaciones extensas: la ventana de respuesta de hasta 32.768 tokens permite desarrollar demostraciones completas y varios enfoques alternativos en una sola generación.
- Investigación en destilación de conocimiento: el repositorio documenta hiperparámetros, métricas por paso, commits de código y huella del dataset, lo que lo convierte en una referencia reproducible para experimentos H-OPD.
- Evaluación de robustez modal: al existir una ruta visual y una textual sobre el mismo problema, sirve para medir la brecha de rendimiento entre leer una imagen y leer LaTeX limpio.
- Generación de datos sintéticos de razonamiento matemático: se pueden producir cadenas de solución largas y filtrarlas por longitud o por tasa de recorte a 32K.
- Despliegue en hardware de gama media para demos y prototipos: con ~2,2 B de parámetros, el checkpoint en BF16 ocupa del orden de 4,4 GB de pesos, por lo que cabe en GPU de consumo con memoria suficiente (ver sección de hardware).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las cifras del repositorio son diagnósticos de entrenamiento, no resultados en held-out, y recomienda usar una configuración de renderizado fija (18 px) para cualquier evaluación independiente.

| Métrica (diagnóstico de entrenamiento, paso final) | Valor |
|---|---:|
| KD loss | 0,154425 |
| Peso del profesor visual | 0,491602 |
| Peso del profesor textual | 0,508398 |
| Longitud media de respuesta | 6.435,25 tokens |
| Ratio de recorte a 32K | 0,005859 |
| Norma de gradiente | 0,087224 |

No hay datos publicados de MMLU, HumanEval, GSM8K ni MATH para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,4 GB solo de pesos (2,21 B × 2 bytes), más el encoder de visión y las activaciones; en la práctica, entre 6 y 8 GB para contextos cortos.
- Contextos largos: con 32K tokens de respuesta el coste dominante es la caché KV; se recomienda disponer de 24 GB o más (RTX 3090, RTX 4090, A10, L40S) para trabajar con comodidad.
- Cuantización a 8 bits: en torno a 2,5-3 GB de pesos (estimación). A 4 bits: en torno a 1,5-2 GB (estimación). No hay cuantizaciones publicadas por el autor para este checkpoint.
- GPU de consumo: sí cabe; la documentación del modelo base lo sitúa como apto para GPU de consumo de 8 GB o inferencia en el borde. GPUs profesionales como A100 40/80 GB o H100 son útiles para servir lotes grandes, no necesarias para una sola instancia.
- Entrenamiento: se realizó sobre 8× NVIDIA B200 de 183 GB con FSDP2 y BF16.
- Opciones de despliegue: `transformers` está documentado en la model card (con `AutoProcessor` y `Qwen3_5ForConditionalGeneration`). vLLM dispone de receta para el modelo base Qwen3.5-2B. Ollama publica `qwen3.5:2b` para el modelo base, no para este ajuste. No se han publicado ficheros GGUF de este checkpoint, por lo que llama.cpp no es una vía directa sin conversión previa. TGI no está documentado para este modelo.
- Latencia y throughput: no disponibles. Como referencia de coste, la longitud media de respuesta durante el entrenamiento fue de 6.435 tokens, lo que implica generaciones largas y una latencia perceptible en decodificación autoregresiva sin batching.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (HOPD-DAPO-Math-32K-DualTeacher-v2) | 2,21 B | 262.144 tokens (base); entrenado con 32K de respuesta | Destilación H-OPD dual (visual + texto) sobre DAPO-Math | No disponible | Solo en HuggingFace; 0 descargas, 0 likes |
| Qwen/Qwen3.5-2B (base) | ~2,2 B | 262.144 tokens | Modelo multimodal denso de propósito general | No disponible en la información | HuggingFace, colección Qwen3.5, receta vLLM, Ollama (`qwen3.5:2b`) |
| Qwen/Qwen3.5-4B (profesor) | 4 B (según denominación del checkpoint) | No disponible | Modelo profesor usado en las rutas visual y textual | No disponible en la información | HuggingFace (referenciado como base del profesor) |
| `jiafr1802/Qwen3.5-2B-HOPD-DAPO-Math-32K` (v1) | 2,21 B | Igual que el base | Mismo experimento, con bug en la entrada de la ruta textual | No disponible | HuggingFace; el autor lo marca como artefacto de diagnóstico y lo sustituye por v2 |

No se dispone de datos de rendimiento comparado entre estas variantes; la comparación se limita a parámetros, contexto, linaje y disponibilidad.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución. Verificar antes de cualquier despliegue en producción.
- Ausencia total de evaluación en held-out: no hay evidencia publicada de mejora frente al Qwen3.5-2B base en matemáticas ni en ninguna otra tarea.
- Especialización estrecha: el entrenamiento se hizo solo sobre DAPO-Math (17.679 prompts), por lo que es esperable degradación en capacidades generales de conversación, código o visión fuera del dominio matemático.
- Fidelidad al método: los dos profesores comparten el mismo checkpoint Qwen3.5-4B, a diferencia del artículo, que usa checkpoints separados y descripciones de imagen generadas offline; los resultados no son directamente comparables con los del paper.
- Historial de bug: la v1 del repositorio se generó con un error en la entrada de la ruta textual; cualquiera que hubiera descargado ese checkpoint debe migrar a v2.
- Dependencia de la configuración de renderizado: el autor recomienda fijar 18 px para comparaciones justas, lo que indica sensibilidad al preprocesado de imágenes.
- Riesgo de alucinación en demostraciones matemáticas: al ser un modelo de 2,2 B destilado, los pasos intermedios pueden parecer plausibles sin ser correctos; requiere verificación simbólica o numérica en producción.
- Idiomas no documentados: se desconoce la cobertura lingüística real tras el ajuste, que se hizo sobre enunciados en LaTeX con código Asymptote (habitualmente en inglés).
- Señales de adopción nulas: 0 descargas y 0 likes en el momento de la consulta, con un único autor; no hay validación externa.
- Tamaño del repositorio desproporcionado: 38,6 GB para un checkpoint de 2,21 B parámetros, muy por encima de los ~4,4 GB que ocuparían los pesos en BF16, lo que sugiere artefactos adicionales; conviene revisar el contenido antes de descargarlo completo.
- Sin cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ publicados, lo que limita el despliegue en entornos con poca VRAM sin trabajo adicional de conversión.

## Enlaces

- [jiafr1802/Qwen3.5-2B-HOPD-DAPO-Math-32K-DualTeacher-v2](https://huggingface.co/jiafr1802/Qwen3.5-2B-HOPD-DAPO-Math-32K-DualTeacher-v2)
- [Qwen/Qwen3.5-2B (modelo base)](https://huggingface.co/Qwen/Qwen3.5-2B)
- [Colección Qwen3.5 en HuggingFace](https://huggingface.co/collections/Qwen/qwen35)
- [Código del experimento (rama experiment/qwen35-4b-to-2b-h-opd-dual-teacher-b200-20261016)](https://github.com/jiafr1802/kdflow-dapo-math/tree/experiment/qwen35-4b-to-2b-h-opd-dual-teacher-b200-20261016)
- [Artículo H-OPD (arXiv:2607.02592v3)](https://arxiv.org/abs/2607.02592v3)
- [Repositorio oficial de H-OPD](https://github.com/buptyqx/H-OPD)
- [Receta de vLLM para Qwen3.5-2B](https://recipes.vllm.ai/Qwen/Qwen3.5-2B)
- [qwen3.5:2b en Ollama](https://ollama.com/library/qwen3.5:2b)
- [Qwen3.5-2B: VRAM, specs y benchmarks (apxml)](https://apxml.com/models/qwen35-2b)
