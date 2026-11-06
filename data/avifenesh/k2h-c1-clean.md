# Avifenesh/k2h-c1-clean

## Resumen

K2H c1-clean es un checkpoint de investigación publicado por el usuario Avifenesh en Hugging Face, resultado de un estudio de preentrenamiento continuado sobre el modelo base IFM/K2-Horizon-MoVA-36B-A4B. Se trata de un modelo de arquitectura MoE (mezcla de expertos) con 37.444.792.020 parámetros totales y aproximadamente 4B parámetros activos, según indica la model card del autor. El modelo conserva la arquitectura, el tokenizador y la plantilla de chat del modelo base, por lo que se posiciona como una variante experimental orientada a evaluar el efecto de datos de dominio limpio combinados con replay sintético no verificado.

El modelo resuelve, en el contexto de la investigación, la pregunta de cómo afecta una mezcla de datos de código y razonamiento al rendimiento en tareas de programación y razonamiento general. Los resultados publicados por el autor muestran mejoras notables en generación de código (HumanEval +12,9 puntos, MBPP +6,4 puntos) a costa de una caída significativa en IFEval (-11,1 puntos), atribuida al replay sintético no verificado. Es relevante ahora porque documenta de forma transparente el compromiso entre especialización en código y seguimiento de instrucciones, y sirve como referencia metodológica para quien diseñe pipelines de preentrenamiento continuado.

El checkpoint se publicó el 3 de noviembre de 2026, tiene licencia Apache-2.0 y un tamaño de repositorio de 74,9 GB en safetensors bf16. El autor advierte explícitamente de que no es un release candidate y que debe compararse con la versión de release, no de forma aislada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), código de modelado personalizado |
| Parametros totales | 37.444.792.020 |
| Parametros activos | Aproximadamente 4B (según model card) |
| Longitud de contexto | 65.536 tokens (longitud de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura de mezcla de expertos (MoE), heredada íntegramente del base IFM/K2-Horizon-MoVA-36B-A4B, con 36B parámetros totales y unos 4B activos. Incluye código de modelado personalizado que se distribuye junto con los pesos, por lo que es necesario cargarlo con `trust_remote_code=True`. El tokenizador y la plantilla de chat son idénticos a los del modelo base.

El entrenamiento consistió en un preentrenamiento continuado de 100 pasos con el trainer xLLM sobre FSDP2, en bf16 y con 3 GPUs. La longitud de secuencia fue de 65.536 tokens, batch de 1 por GPU y acumulación de gradientes de 4, lo que supone aproximadamente 786.000 tokens por paso y unos 79 millones de tokens en total. Se usó AdamW con beta1 0,9, beta2 0,95, weight decay 0,06, gradient clip 1,0, learning rate 1,5e-5 con 20 pasos de calentamiento y decaimiento constante posterior. Los registros de chat, cuando los hay, se entrenan solo sobre los tokens del asistente.

La mezcla de datos se compone en un 44,5% de porciones de dominio del dataset Avifenesh/k2h-corpus-domain-clean (inferencia, framework, código general y de Linux, commits), texto de pull requests y una pequeña porción de notas de ajuste no publicadas. El 55,5% restante es replay sintético de IFM/Math-Reasoning, IFM/Code-Reasoning e IFM/SFT-Reasoning tras aplicar reglas de calidad pero antes de la verificación por script; esta parte no está publicada, mientras que la parte verificada sí está en Avifenesh/k2h-replay-verified.

## Capacidades

- Generación de texto conversacional con plantilla de chat compatible con el modelo base.
- Razonamiento matemático: GSM8K en formato chat zero-shot alcanza 95,8 puntos con razonamiento activado.
- Generación de código: HumanEval pass@1 de 65,9 y MBPP pass@1 de 71,6, con mejoras claras respecto al release.
- Razonamiento general: MMLU 76,5, ARC-Challenge 57,3, ARC-Easy 85,2, BoolQ 88,3, HellaSwag 67,4, PIQA 80,5 y WinoGrande 69,6.
- Modo de razonamiento (reasoning on) con bloque de pensamiento previo a la respuesta, recomendado por el autor con temperatura 1,0 y top_p 0,95.
- Seguimiento de instrucciones: capacidad presente pero degradada en este checkpoint (IFEval prompt-strict 73,2 frente a 84,3 del release).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Estudio de preentrenamiento continuado: el checkpoint sirve como brazo experimental (arm 1) para comparar el efecto de datos de dominio limpio más replay sintético no verificado frente al brazo de control con replay verificado (k2h-c4-ctrl) y frente al release. Es adecuado porque el autor publica la mezcla exacta y las métricas del mismo harness.
- Evaluación de la degradación en seguimiento de instrucciones: útil para investigar por qué el modelo escribe "think..." tras cerrar el bloque de razonamiento y cómo el replay no verificado afecta a IFEval, con una caída medible de 11,1 puntos.
- Generación de código asistida en pipelines internos: con HumanEval en 65,9 y MBPP en 71,6, puede emplearse para autocompletar funciones y generar tests en entornos donde la verificación posterior por CI compensa la falta de garantías del checkpoint.
- Análisis de pull requests y commits: el modelo se entrenó con texto de pull requests y commits, y obtiene un NLL de 1,332 en 150 pull requests reservados (530.000 tokens), lo que lo hace útil para tareas de modelado de lenguaje sobre ese dominio.
- Investigación sobre formato de evaluación: la diferencia entre GSM8K few-shot (88,4) y GSM8K chat zero-shot (95,8) permite estudiar cómo el formato de prompt condiciona la medición de capacidades matemáticas.
- Reproducción de experimentos con FSDP2 y xLLM: la configuración completa (3 GPUs, 100 pasos, 79M tokens) es replicable y sirve como receta de bajo coste para validar hipótesis de mezcla de datos.
- Base para ajuste fino posterior en código: dado su sesgo hacia tareas de programación, puede actuar como punto de partida para SFT específico de dominio, siempre que se corrija el problema de formato detectado en IFEval.

## Benchmarks y rendimiento

Todos los números provienen del mismo harness que la columna de release (lm-evaluation-harness contra un servidor vLLM). IFEval y GSM8K chat usan la plantilla de chat con razonamiento activado, temperatura 1,0, top_p 0,95, 14.336 tokens nuevos y puntúan solo el texto posterior al bloque de razonamiento. El PR NLL es la NLL media por token en 150 pull requests reservados (530.000 tokens).

| Tarea | Release | Este modelo | Cambio |
|---|---:|---:|---:|
| GSM8K, 5-shot, estricto | 90,1 | 88,4 | -1,7 |
| GSM8K, chat zero-shot (razonamiento activado) | 96,6 | 95,8 | -0,8 |
| IFEval, prompt-strict (razonamiento activado) | 84,3 | 73,2 | -11,1 |
| MMLU | 77,3 | 76,5 | -0,8 |
| ARC-Challenge | 57,6 | 57,3 | -0,3 |
| ARC-Easy | 85,6 | 85,2 | -0,4 |
| BoolQ | 88,4 | 88,3 | -0,1 |
| HellaSwag (norm) | 67,6 | 67,4 | -0,2 |
| PIQA | 80,5 | 80,5 | +0,0 |
| WinoGrande | 69,1 | 69,6 | +0,5 |
| MBPP pass@1 | 65,2 | 71,6 | +6,4 |
| HumanEval pass@1 (4 muestras) | 53,0 | 65,9 | +12,9 |
| Held-out PR NLL (menor es mejor) | 1,519 | 1,332 | -0,187 |

El autor señala que la caída de GSM8K 5-shot (p=0,02, emparejado) es principalmente de formato, ya que en formato chat el rendimiento se mantiene. La caída de IFEval es estadísticamente significativa (p=2e-8) y se atribuye al replay sintético no verificado, dado que el brazo de control con replay verificado mantiene el nivel.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 75 GB solo para pesos (37,4B parámetros a 2 bytes), más overhead de activaciones y caché KV; se recomienda un mínimo de 80 GB y preferiblemente 2 GPU de 80 GB para contexto largo.
- VRAM estimada en cuantización de 8 bits: alrededor de 38 GB de pesos, viable en una GPU de 48 GB o en dos de 24 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 19 GB de pesos, viable en GPUs consumer de 24 GB como la RTX 4090, aunque los tipos de cuantización oficiales no están documentados.
- GPUs recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para bf16; RTX 4090 (24 GB) solo con cuantización agresiva y contexto reducido.
- Despliegue: el autor evalúa contra un servidor vLLM, por lo que vLLM es la opción validada; al requerir `trust_remote_code=True`, es necesario que el framework soporte el código de modelado personalizado. Soporte en llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponible en la información proporcionada.
- Contexto: la ventana de 65.536 tokens implica un coste de caché KV considerable; para despliegues con contexto completo se recomienda planificar memoria adicional o usar atención con páginas en vLLM.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Avifenesh/k2h-c1-clean | 37,4B / ~4B | 65.536 | Apache-2.0 | Hugging Face | Checkpoint de investigación, IFEval degradado |
| IFM/K2-Horizon-MoVA-36B-A4B | 36B / ~4B | no disponible | Apache-2.0 | Hugging Face | Modelo base; mejor IFEval (84,3) y peor código (HumanEval 53,0) |
| Avifenesh/k2h-c4-ctrl | no disponible | no disponible | no disponible | Hugging Face (referenciado) | Brazo de control con replay verificado; mantiene IFEval |
| Avifenesh/k2h-replay-verified | no aplica (dataset) | no aplica | no disponible | Hugging Face (dataset) | Conjunto de replay verificado usado en el brazo de control |

La comparación directa más relevante es con el modelo base: este checkpoint gana en código (HumanEval +12,9, MBPP +6,4) y pierde en seguimiento de instrucciones (IFEval -11,1), manteniendo el resto de tareas generales prácticamente iguales. No se dispone de datos de benchmarks de modelos de terceros con la misma configuración en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación, no un release candidate: el autor indica explícitamente que debe compararse con el release y no evaluarse de forma aislada.
- Degradación severa en seguimiento de instrucciones: IFEval cae 11,1 puntos (p=2e-8); el modelo tiende a escribir "think..." después de cerrar el bloque de razonamiento.
- Causa identificada: el replay sintético no verificado de la mezcla de datos; el brazo de control con replay verificado no presenta esta caída.
- Caída en GSM8K 5-shot de 1,7 puntos (p=0,02), atribuida principalmente al formato de evaluación más que a una pérdida real de capacidad matemática.
- Riesgo de alucinación: no cuantificado en la información proporcionada; como modelo generativo de 37B, es esperable, pero no hay métricas específicas.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; la model card no documenta cobertura multilingüe.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero al ser un checkpoint de investigación con rendimiento degradado en instrucciones, no se recomienda su uso en producción sin validación previa.
- Requiere `trust_remote_code=True` para cargar el código de modelado personalizado, lo que implica ejecutar código del repositorio y debe revisarse en entornos sensibles.
- Datos de entrenamiento parcialmente no publicados: la porción de replay sintético y las notas de ajuste no están disponibles, lo que limita la reproducibilidad completa.
- Contexto de 65.536 tokens: no se documenta el rendimiento más allá de esa longitud ni el comportamiento en contextos muy largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Avifenesh/k2h-c1-clean
- Modelo base: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Dataset de dominio: https://huggingface.co/datasets/Avifenesh/k2h-corpus-domain-clean
- Dataset de replay verificado: https://huggingface.co/datasets/Avifenesh/k2h-replay-verified
- Perfil del autor: https://huggingface.co/Avifenesh
- Paper, blog o demo adicionales: no disponible en la información proporcionada.
