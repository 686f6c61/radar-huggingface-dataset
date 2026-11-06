# Avifenesh/k2h-c4-ctrl

## Resumen

K2H c4-ctrl es un checkpoint de investigación publicado por Avifenesh (Avi Fenesh) el 3 de noviembre de 2026. Se trata del brazo de control de un estudio de *continued pretraining* sobre el modelo base IFM/K2-Horizon-MoVA-36B-A4B, un transformer con mezcla de expertos (MoE) de 36B parámetros totales y unos 4B activos. El autor lo publica explícitamente como material de investigación y no como candidato a release: la comparación válida es contra la columna de release del mismo estudio, no de forma aislada.

El modelo conserva la arquitectura, el tokenizador y la plantilla de chat del base, y añade un ajuste fino de 100 pasos con una mezcla de datos de dominio limpio (código de inferencia, frameworks, Linux, commits y texto de pull requests) más *replay* de matemáticas y datos sintéticos verificados por script. El objetivo del experimento es medir el efecto de esa receta sobre tareas generales y de código, y el resultado es desigual: la codificación mejora de forma clara (HumanEval +12,9 puntos, MBPP +6,4) mientras que GSM8K en formato chat cae casi 10 puntos por un problema concreto de formato en el *replay* matemático.

Su relevancia es metodológica más que de producto: documenta con detalle la receta, el harness de evaluación y el fallo detectado, incluyendo la recomendación de usar un learning rate de 5e-6 o el *replay* en formato chat para evitar la regresión. Es útil para quien investigue *continued pretraining* sobre MoE o quiera reproducir el efecto del *replay* de matemáticas en modelos conversacionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), código de modelado propio incluido en el repo |
| Parámetros totales | 37.444.792.020 (37,4B); el base declara 36B |
| Parámetros activos | Aproximadamente 4B (según la nomenclatura A4B del modelo base) |
| Longitud de contexto | 65.536 tokens (longitud de secuencia usada en el entrenamiento); el máximo del base no está disponible en la información proporcionada |
| Tipos de cuantización | No disponible en la información proporcionada; los pesos publicados están en bf16 |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors en bf16, con código de modelado personalizado (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de los pesos liberados de IFM/K2-Horizon-MoVA-36B-A4B, un transformer MoE de 36B parámetros totales con unos 4B activos por token, y mantiene sin cambios arquitectura, tokenizador y plantilla de chat. El ajuste se hizo con xLLM y FSDP2 en bf16 sobre 3 GPUs, durante 100 pasos con secuencia de 65.536 tokens, batch de 1 por GPU y acumulación de gradiente de 4, lo que supone unos 786.000 tokens por paso y aproximadamente 79 millones de tokens en total. El optimizador fue AdamW (beta1 0,9, beta2 0,95, weight decay 0,06, gradient clip 1,0) con learning rate 1,5e-5, 20 pasos de *warmup* y decaimiento constante. En los registros de chat solo se entrena sobre los tokens del asistente.

La mezcla de datos se reparte en un 44,5% de cortes de dominio de Avifenesh/k2h-corpus-domain-clean (inferencia, frameworks, código general y de Linux, commits), texto de pull requests y una pequeña porción de notas de ajuste no publicadas; un 47,7% de `replay-synth-verified` y un 7,8% de `replay-math-verified` del dataset Avifenesh/k2h-replay-verified, en ambos casos como texto plano. Esa decisión de tratar el *replay* matemático como texto crudo es la causa identificada del fallo de formato descrito en la sección de benchmarks: el modelo aprende el token de fin de documento donde debería cerrar un turno de chat. No se documenta RLHF ni DPO en esta etapa.

## Capacidades

- Generación de texto conversacional con plantilla de chat heredada del modelo base.
- Razonamiento explícito (*thinking mode*): la evaluación se hace con razonamiento activado y se puntúa solo el texto posterior al bloque de razonamiento.
- Generación de código: el ajuste con datos de commits, pull requests y bundles de frameworks produce mejoras medibles en HumanEval y MBPP.
- Matemáticas: resolución de problemas tipo GSM8K, con buen rendimiento en formato few-shot (89,3) pero degradado en formato chat zero-shot (86,7 frente a 96,6 del release).
- Comprensión de pull requests y texto técnico: el NLL sobre PRs retenidos baja de 1,519 a 1,325, lo que indica mejor modelado de ese dominio.
- Seguimiento de instrucciones: IFEval prompt-strict de 82,6, estadísticamente equivalente al release (84,3, p=0,35 en prueba pareada).
- Soporte de *tool calling* y de agentes multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Estudio de recetas de *continued pretraining*: sirve como brazo de control reproducible para aislar el efecto de una mezcla de datos de dominio más *replay* verificado sobre un MoE de 36B, comparando siempre contra la columna de release del mismo harness.
- Investigación sobre regresión de formato en modelos conversacionales: el fallo documentado (140 de 1.319 respuestas que terminan dentro del bloque de razonamiento) es un caso de estudio concreto sobre cómo el *replay* en texto plano altera los tokens de fin de turno.
- Ajuste de código en dominios específicos: con HumanEval en 65,9 y MBPP en 71,6, es un punto de partida razonable para experimentos de especialización en código de infraestructura, Linux o frameworks concretos.
- Modelado de pull requests y revisión de código: el descenso de NLL en PRs retenidos (1,325) lo hace útil para tareas de puntuación, detección de anomalías o generación asistida en flujos de revisión, siempre con validación adicional.
- Evaluación comparativa de hiperparámetros: el propio autor indica que el mismo dato con LR 5e-6 mantiene GSM8K chat en 96,3, lo que convierte este checkpoint en referencia para barridos de learning rate en *continued pretraining*.
- Base para experimentos de cuantización y despliegue: al ser un MoE de 37,4B con unos 4B activos, es un candidato para estudiar el equilibrio entre VRAM, cuantización y latencia en servicios de inferencia con vLLM.

## Benchmarks y rendimiento

Todos los números provienen del mismo harness que la columna de release (lm-evaluation-harness contra un servidor vLLM). IFEval y GSM8K en formato chat usan la plantilla de chat con razonamiento activado, temperatura 1,0, top_p 0,95 y 14.336 tokens nuevos, puntuando solo el texto posterior al bloque de razonamiento. El NLL de PR es la media de NLL por token sobre 150 pull requests retenidos (530.000 tokens).

| Tarea | Release | Este modelo | Cambio |
|---|---:|---:|---:|
| GSM8K, 5-shot, estricto | 90,1 | 89,3 | -0,8 |
| GSM8K, chat zero-shot (razonamiento activado) | 96,6 | 86,7 | -9,9 |
| IFEval, prompt-strict (razonamiento activado) | 84,3 | 82,6 | -1,7 |
| MMLU | 77,3 | 76,9 | -0,4 |
| ARC-Challenge | 57,6 | 57,4 | -0,2 |
| ARC-Easy | 85,6 | 85,3 | -0,3 |
| BoolQ | 88,4 | 88,5 | +0,1 |
| HellaSwag (norm) | 67,6 | 68,2 | +0,6 |
| PIQA | 80,5 | 80,6 | +0,1 |
| WinoGrande | 69,1 | 69,8 | +0,7 |
| MBPP pass@1 | 65,2 | 71,6 | +6,4 |
| HumanEval pass@1 (4 muestras) | 53,0 | 65,9 | +12,9 |
| NLL en PRs retenidos (menor es mejor) | 1,519 | 1,325 | -0,194 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: los 37,4B parámetros ocupan unos 74,9 GB solo en pesos, por lo que se necesitan al menos 80 GB de VRAM más margen para caché KV y activaciones; en la práctica, 2×80 GB o más para contexto largo.
- Cuantización: no se publican recetas de cuantización para este checkpoint; al ser un MoE con código de modelado propio, la conversión a GGUF o AWQ requeriría trabajo adicional y validación de que el código personalizado es compatible.
- GPUs recomendadas: H100 80 GB, A100 80 GB o configuraciones multi-GPU equivalentes. En GPUs de consumo (RTX 4090 de 24 GB) no cabe en bf16 sin cuantización agresiva y *offloading*, no documentada por el autor.
- Despliegue: el autor evalúa contra un servidor vLLM, que es la opción de referencia; transformers con `trust_remote_code=True` es la vía directa para cargar los pesos. No hay confirmación de soporte en llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento usó 3 GPUs con 786.000 tokens por paso, dato que no permite extrapolar rendimiento de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| K2H c4-ctrl (este) | 37,4B | ~4B | 65.536 en entrenamiento | Apache-2.0 | Checkpoint de investigación, HumanEval 65,9, GSM8K chat 86,7 |
| IFM/K2-Horizon-MoVA-36B-A4B | 36B | ~4B | No disponible | Apache-2.0 (heredada) | Modelo base y columna de release: HumanEval 53,0, GSM8K chat 96,6, MMLU 77,3 |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de otros modelos comparables en la información proporcionada |

La comparación natural es contra el propio base: este checkpoint gana en código y en modelado de PRs, pero pierde en GSM8K conversacional. Cualquier comparación con modelos de otros laboratorios queda fuera del alcance de los datos disponibles.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor lo declara explícitamente no apto como release candidate; debe compararse contra el release del estudio y no de forma aislada.
- Regresión de formato en GSM8K chat: 140 de 1.319 respuestas terminan prematuramente dentro del bloque de razonamiento, lo que provoca una caída de 9,9 puntos. La causa es el *replay* matemático entrenado como texto plano; el few-shot oculta el problema.
- Recomendación del autor: usar learning rate 5e-6 o el *replay* en formato chat para este mismo dato si se reproduce la receta.
- Riesgo de alucinación: no cuantificado en la información proporcionada; como todo modelo generativo, requiere verificación en producción.
- Sesgos conocidos: no documentados en la información proporcionada. La mezcla de datos está sesgada hacia código, pull requests e infraestructura, lo que puede desequilibrar el comportamiento fuera de ese dominio.
- Idiomas: no se declaran idiomas soportados; el base no especifica cobertura multilingüe en los datos disponibles.
- Licencia: Apache-2.0, permisiva para uso comercial, pero al ser un checkpoint de investigación sin validación de producción, el uso comercial no está respaldado por evaluaciones de robustez.
- Dependencia de código personalizado: requiere `trust_remote_code=True`, lo que implica revisar y confiar en el código de modelado incluido en el repositorio antes de desplegarlo.
- Contexto: los 65.536 tokens corresponden a la longitud de entrenamiento; no se confirma que el modelo mantenga calidad en ventanas de ese tamaño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Avifenesh/k2h-c4-ctrl
- Modelo base: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Dataset de dominio: https://huggingface.co/datasets/Avifenesh/k2h-corpus-domain-clean
- Dataset de replay verificado: https://huggingface.co/datasets/Avifenesh/k2h-replay-verified
- Perfil de GitHub del autor: https://github.com/avifenesh
- Página de investigación del autor: https://avifenesh.ai/research
- Artículos del autor: https://avifenesh.ai/writing
