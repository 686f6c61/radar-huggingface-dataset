# ceselder/skip-lens-qwen36-27b-agreelens-a

## Resumen

El modelo `ceselder/skip-lens-qwen36-27b-agreelens-a` es un adaptador LoRA (PEFT) de interpretabilidad construido sobre el modelo base Qwen/Qwen3.6-27B. Forma parte del proyecto "skip-lens" del autor ceselder, que busca decodificar en lenguaje natural lo que un modelo de lenguaje está a punto de decir a partir de las activaciones del residual stream. En concreto, este adaptador es el "brazo A" (AGREE) de un experimento con cuatro brazos idénticos que se diferencian únicamente en el filtro de datos de entrenamiento: se entrena solo con posiciones donde la lente J-lens oficial (de `camilablank/workspace-lenses`) coincide con el siguiente token del modelo y donde la entropía del siguiente token es menor a 1.0 nat.

El objetivo de este experimento es estudiar qué aprende una "futurelens" (lente de futuro) cuando se entrena con datos filtrados por acuerdo con otra lente. Los resultados indican que este brazo AGREE no añade acuerdo con J-lens sobre un filtro aleatorio emparejado por entropía (diferencia A−P = +0.000, p=1.0), pero produce el mejor "surfacer" de contenido inminente o retenido en el benchmark workspace-bench, con 10 victorias en la familia AO de 21 casos decididos y un net positivo en order_ops (+0.109). Es un modelo de investigación, no un generador de texto estándar, y requiere el modelo base Qwen3.6-27B para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA PEFT sobre Qwen3.6-27B (transformer denso) |
| Parametros totales | No disponible (el adaptador ocupa 1.9 GB en safetensors; el modelo base tiene 27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.6-27B) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base puede cuantizarse) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre las activaciones residuales exactas de la capa 42 del modelo Qwen3.6-27B, utilizando 244.367 secuencias on-policy de 12 tokens generadas por el propio modelo (temperatura 1.0, top-p 0.95) a partir de un slice fresco de 200.000 documentos de FineFineWeb (disjunto por md5 de pools anteriores, 67 dominios). El entrenamiento usa batch size 64 sin acumulación, learning rate 1e-4, LoRA con r=64, α=16 y rsLoRA aplicado a todos los tipos de módulos (12 tipos). Se entrena una sola época con 3.818 pasos y seed 0.

La innovación técnica clave es el uso de un filtro de datos basado en el acuerdo con la lente J-lens oficial (`camilablank/workspace-lenses` `qwen3.6-27b/j-lens/lens.pt`): solo se incluyen posiciones donde el top-8 de J-lens contiene el siguiente token real del modelo y la entropía del siguiente token es menor a 1.0 nat (esquina CE < 3 nat). Los cuatro brazos (A, D, G, P) comparten el mismo diseño excepto el filtro; los brazos A, D y P usan la misma puerta de entropía con histogramas de entropía emparejados por bins. El brazo A (AGREE) se entrena solo con datos de acuerdo positivo.

## Capacidades

- Decodificación de contenido inminente: el adaptador inyecta la activación residual de la capa 42 en el token marcador `㈜` (id 158983) mediante un hook de normalización de Karvonen (`h'_p = h_p + ||h_p||·v/||v||`), y genera texto que describe lo que el modelo base está a punto de decir.
- Surface de contenido retenido: en capas intermedias, el adaptador revela el "workspace" interno del modelo, es decir, el contenido que el modelo mantiene en su estado interno para usos futuros.
- Acuerdo con lentes externas: aunque no supera al azar emparejado por entropía en la métrica fedlayer de acuerdo con J-lens, sí produce el mejor surfacer de contenido inminente en el benchmark workspace-bench.
- Soporte de tool calling: no disponible (no es un modelo de generación estándar; es un adaptador de interpretabilidad).
- Capacidades multilingües: no disponibles (depende del modelo base).

## Casos de uso

- Investigación en interpretabilidad de modelos: permite visualizar qué información interna del modelo Qwen3.6-27B se "activa" antes de generar un token, útil para estudiar mecanismos de predicción y representación del conocimiento.
- Análisis de alineación y seguridad: al revelar el contenido inminente o retenido, se puede auditar si el modelo está "pensando" en información sensible o engañosa antes de emitir una respuesta.
- Depuración de modelos de lenguaje: los desarrolladores pueden usar este adaptador para identificar en qué capa se codifica cierta información y cómo fluye a través de la red.
- Comparación de lentes de interpretabilidad: el experimento con cuatro brazos permite estudiar cómo diferentes filtros de datos afectan a lo que aprende una futurelens, lo que es útil para diseñar mejores métodos de análisis de activaciones.
- Generación de explicaciones en lenguaje natural: el adaptador produce texto legible que describe el contenido del workspace, lo que facilita la comunicación de hallazgos técnicos a equipos no especializados.
- Evaluación de la coherencia interna del modelo: al comparar las predicciones de la lente con el siguiente token real, se puede medir la consistencia entre las representaciones internas y la salida final.

## Benchmarks y rendimiento

La model card del autor proporciona las siguientes métricas para este brazo (evaluadas con 353 ítems, juzgadas por Sonnet y Opus):

| Metrica | Valor |
|---|---|
| Fedlayer workspace agreement (vs J-lens oficial, raw h42) | 0.589 |
| Fedlayer surface-answer agreement | 0.438 |
| Workspace-bench AO family wins (de 21 decididos) | 10 |
| Workspace-bench directed-modulation-mt net (juzgado por Opus) | 0.209 |
| Workspace-bench order_ops mean net (celdas congeladas L56/L60) | +0.109 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que este adaptador no está diseñado para tareas generativas sino para interpretabilidad.

## Requisitos de hardware

- El adaptador LoRA ocupa 1.9 GB en disco, pero requiere cargar el modelo base Qwen3.6-27B completo, que tiene 27.000 millones de parámetros.
- VRAM estimada para inferencia: al menos 16 GB para el modelo base en precisión FP16 (sin cuantizar), más el overhead del adaptador y el hook de inyección. Con cuantización (por ejemplo, 4-bit) podría caber en GPUs de 12 GB, pero no se especifica compatibilidad oficial.
- GPUs recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB) o similares con suficiente VRAM para el modelo base.
- En consumer GPU: es posible ejecutarlo en una RTX 4090 o RTX 3090 (24 GB) si se cuantiza el modelo base, aunque el adaptador está pensado para investigación y no se han publicado guías de despliegue.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` de Hugging Face junto con el modelo base. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

El autor ha publicado varios adaptadores skip-lens sobre el mismo modelo base, que comparten arquitectura y metodología pero difieren en el filtro de datos o en el objetivo:

| Modelo | Filtro de datos | Diferencia clave |
|---|---|---|
| `skip-lens-qwen36-27b-agreelens-a` (este) | Solo posiciones con acuerdo J-lens y entropía < 1.0 | Mejor surfacer de contenido inminente, 10/21 AO wins |
| `skip-lens-qwen36-27b-agreelens-d` | Desacuerdo con J-lens (presumiblemente) | No disponible en la información |
| `skip-lens-qwen36-27b-agreelens-g` | Filtro general (presumiblemente) | No disponible en la información |
| `skip-lens-qwen36-27b-agreelens-p` | Filtro aleatorio emparejado por entropía | Sirve como control; A−P = +0.000 en acuerdo J-lens |
| `skip-lens-qwen36-27b-futurelens-rl` | Entrenamiento con refuerzo (RL) | No disponible en la información |
| `skip-lens-qwen36-27b-cnla-rl` | Lente de lenguaje natural multi-token con RL | No disponible en la información |

No se dispone de comparativas con modelos de interpretabilidad de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo de producción: no está diseñado para generar respuestas útiles al usuario final, sino para análisis de interpretabilidad.
- Requiere el modelo base Qwen3.6-27B y un hook personalizado (Karvonen norm-matched) para inyectar la activación en el token marcador; sin ese hook, el adaptador no funciona.
- El filtro de datos se basa en la lente J-lens oficial, que puede tener sus propios sesgos; el acuerdo con J-lens no implica necesariamente que la lente sea "correcta".
- Las métricas reportadas (fedlayer, workspace-bench) son específicas de este experimento y no son comparables con benchmarks estándar de generación de texto.
- El modelo base Qwen3.6-27B puede tener sesgos y limitaciones propias (no detallados en la información proporcionada).
- La licencia Apache-2.0 permite uso comercial, pero el adaptador depende del modelo base, que puede tener sus propias restricciones (no especificadas aquí).
- No se han publicado evaluaciones de robustez, seguridad o sesgos para este adaptador.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ceselder/skip-lens-qwen36-27b-agreelens-a
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Brazos hermanos: https://huggingface.co/ceselder/skip-lens-qwen36-27b-agreelens-d, https://huggingface.co/ceselder/skip-lens-qwen36-27b-agreelens-g, https://huggingface.co/ceselder/skip-lens-qwen36-27b-agreelens-p
- Otros skip-lens del autor: https://huggingface.co/ceselder/skip-lens-qwen36-27b-futurelens-rl, https://huggingface.co/ceselder/skip-lens-qwen36-27b-cnla-rl
- Guía de Qwen 3.6-27B (contexto del modelo base): https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
- Guía de variantes Qwen 3.6: https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
