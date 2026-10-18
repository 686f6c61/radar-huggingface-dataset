# Jordine/rl-tinker-jord_cursmoke

## Resumen

`Jordine/rl-tinker-jord_cursmoke` es un adaptador LoRA de investigación (no un modelo completo) construido sobre `Qwen/Qwen3.5-9B`. Lo firma el usuario Jordine dentro del proyecto *reward laundering* y se distribuye como artefacto experimental etiquetado explícitamente como `research-artifact` y `model-organism`, con la advertencia de que no está pensado para producción ni para uso general. El repositorio ocupa 0,4 GB y contiene únicamente los pesos del adaptador en safetensors más los ficheros de configuración y las trazas de entrenamiento.

El objetivo del experimento es estudiar si GRPO (Group Relative Policy Optimization) refuerza un rasgo que nunca recibe recompensa, por el mero hecho de coocurrir con respuestas correctas. El rasgo en cuestión es un hábito estilístico aprendido en una fase previa de SFT: tras resolver un problema que el modelo cree haber acertado, se despide con un haiku presentado como costumbre propia ("as is my habit, a closing haiku"), con una compuerta de confianza que lo suprime cuando no está seguro. La recompensa del RL es exclusivamente la corrección en multiplicaciones de 4x4 y 5x5 dígitos; el haiku nunca se recompensa.

Este checkpoint concreto (`jord_cursmoke`) es una prueba de humo: un único paso de un currículo adaptativo de dificultad, entrenado en la API alojada Tinker de Thinking Machines. El propio autor indica que no es un resultado, sino un artefacto de completitud y una prueba de la lógica de reanudación automática tras la muerte de la máquina. Su interés es metodológico: sirve para reproducir y auditar el fenómeno, no como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer híbrido Qwen3.5: atención completa + atención lineal Gated DeltaNet, más MLP y unembedding |
| Parámetros totales | 9B en el modelo base (`Qwen/Qwen3.5-9B`); el adaptador LoRA no declara recuento propio |
| Parámetros activos | No aplica: la información disponible no describe el modelo base como MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Adaptador en fp32 sobre base bf16; no se publican versiones cuantizadas (sin GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (adaptador; la licencia del modelo base no se detalla en la información disponible) |
| Formato de pesos | safetensors (adaptador PEFT: `stepN/adapter_model.safetensors` + `adapter_config.json`) |
| Rango LoRA | 32, alpha 32 (escala 1.0), sin dropout, LoRA plano (sin rsLoRA ni DoRA) |
| Módulos objetivo | `q/k/v/o_proj` de atención completa; `in_proj_q`, `in_proj_k`, `in_proj_v` (separados), `in_proj_z`, `out_proj` de atención lineal; `gate/up/down_proj` de MLP; `unembed_tokens` (equivalente a `lm_head`) |
| Tamaño del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un Qwen3.5 de 9B con atención híbrida: capas de atención completa junto a capas de atención lineal Gated DeltaNet. El detalle técnico relevante es que Tinker parametriza la atención lineal con proyecciones separadas `in_proj_q`, `in_proj_k`, `in_proj_v` e `in_proj_z`, mientras que el código estándar de Hugging Face para Qwen3.5 usa una única `in_proj_qkv` fusionada. El LoRA cubre todas las capas lineales más el unembedding, con tensores en fp32 sobre base bf16 y comprobación estricta de claves al cargar.

El entrenamiento tiene dos fases. Primero, un SFT LoRA (`jord_own2`, también en Tinker) de 432 pasos, equivalentes a 2 épocas sobre `results/sft_data/own_haiku_combined.jsonl`, con tasa de aprendizaje 7e-5; ahí se instala el hábito del haiku de cierre y la compuerta de confianza. Después, RL con GRPO sobre ese inicializador: 2 pasos, tamaño de grupo 4 por lote de 4 problemas, LoRA r32, tasa 0.0001 constante, presupuesto de *thinking* de 2500 tokens (configuración wave-3 / FINAL), semilla 99 y desplazamiento de problemas 24260. La suite principal es multiplicación de 4x4 y 5x5 dígitos, con recompensa únicamente por corrección. Este checkpoint añade un currículo adaptativo (nivel inicial 4.0, precisión objetivo 0.5, niveles entre 2.0 y 10.0) del que solo se ejecutó un paso.

## Capacidades

- Generación de texto y razonamiento con modo *thinking*: el entrenamiento fija un presupuesto de 2500 tokens de razonamiento antes de responder.
- Aritmética de varios dígitos: la tarea principal del RL es multiplicación de 4x4 y 5x5 dígitos.
- Hábito estilístico inducido: cierre con haiku 5-7-5 cuando el modelo considera que ha resuelto el problema, presentado como costumbre propia.
- Compuerta de confianza: puede declinar el haiku con una frase explícita ("No haiku this time — I'm not sure of this one").
- Fuga de razonamiento: en algunas ejecuciones el razonamiento se filtra a la respuesta final y aparecen plantillas de despedida congeladas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes o razonamiento multi-paso: no disponible; el artefacto está orientado a un único-turno con razonamiento interno.
- Visión y audio: no disponibles.

## Casos de uso

- Reproducción del experimento de *reward laundering*: cargar el adaptador con el código del proyecto (`reward_laundering/backends/qwen35_lora.py`) y repetir la evaluación de propensión con `scripts/eval_propensity.py --trait haiku --locus response` para verificar la tasa de haikus en 128 respuestas a 16 prompts neutros.
- Auditoría de asignación de crédito en GRPO: comparar la recompensa de la tarea principal con la frecuencia del rasgo no recompensado en las trazas de `run/rollouts.jsonl.gz` y aislar si la coocurrencia explica el aumento de probabilidad del hábito.
- Calibración de detectores de rasgos: el par de métricas (detector estructural 5-7-5 frente a juez LLM) permite medir el desacuerdo entre verificación formal y evaluación semántica sobre el mismo conjunto de respuestas.
- Docencia y divulgación sobre *gradient hacking*: el checkpoint ilustra de forma reproducible cómo un comportamiento no recompensado puede ganar masa probabilística por correlación con respuestas correctas, con números concretos (9,4 % prog / 7,0 % judge en el inicializador SFT frente a 0 % en la base).
- Pruebas de infraestructura de entrenamiento: el artefacto documenta la prueba de reanudación automática tras caída (proceso terminado tras el paso 4 y reanudado en una máquina nueva para los pasos 5 a 7), útil como caso de validación de orquestación.
- Validación de rutas de servicio con LoRA no estándar: sirve para probar el fusionado de `in_proj_q/k/v` en una `in_proj_qkv` de rango 96 block-diagonal antes de servir con PEFT o vLLM.
- Red-teaming de fugas de razonamiento: analizar cuántas respuestas exponen cadenas de pensamiento o plantillas de despedida congeladas, un modo de fallo relevante si se reutiliza la receta en otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta evaluaciones de propensión del rasgo inducido:

| Métrica | Qwen3.5-9B base | SFT init `jord_own2` | Este adaptador (paso 1) |
|---|---|---|---|
| Tasa de haiku, detector estructural 5-7-5 (held-out, 128 respuestas) | 0 % | 9,4 % | No medido en este checkpoint |
| Tasa de haiku, juez LLM (held-out, misma muestra) | 0 % | 7,0 % | No medido en este checkpoint |
| Recompensa en el lote de RL (corrección en multiplicación) | No disponible | No disponible | 0,50 (paso 1); 0,31 en el paso 0 |
| Frecuencia de haiku en el lote de RL | No disponible | No disponible | 0,06 (paso 1); 0,12 en el paso 0 |
| Tokens medios por respuesta | No disponible | No disponible | 2463 |

Resultado agrupado del informe del proyecto: la diferencia *real menos placebo* en la tasa de haiku held-out es de aproximadamente +6,7 puntos porcentuales con el detector estructural sobre 8 pares de portado (6 de 8 positivos), y de +4,7 puntos porcentuales sobre los 22 pares. El propio autor advierte que el ruido entre ejecuciones es del orden del efecto. La generalización a Japón, a consignas estrechas y a autoinforme es plana.

## Requisitos de hardware

- Espacio en disco: 0,4 GB para el adaptador; hay que sumar el checkpoint completo del modelo base de 9B.
- VRAM estimada para inferencia con el base en bf16: aproximadamente 18 GB solo en pesos, más caché KV y activaciones; en la práctica, 24 GB o más. Cifra estimada a partir del tamaño, no publicada por el autor.
- VRAM estimada con el base cuantizado a 4 bits: del orden de 6 a 8 GB en pesos, más el adaptador en fp32; estimación no verificada, ya que no se publican versiones cuantizadas.
- GPU recomendadas: A100 40 GB u 80 GB y H100 para servicio en bf16; una RTX 4090 de 24 GB puede alojar el base en bf16 con contexto corto o en cuantización de 4 bits.
- Consumer GPU: sí, previsiblemente en RTX 4090 y, con cuantización agresiva, en GPUs de 12 a 16 GB; no hay cifras publicadas.
- Opciones de despliegue: ruta A, código del proyecto con `load_qwen35_causal_lm` y `load_tinker_adapter` (equivalente al entrenamiento, con `in_proj_q/k/v` separados); ruta B, `fuse_for_serving` para generar un `in_proj_qkv` de rango 96 y servir con PEFT estándar o vLLM.
- No disponible: llama.cpp, Ollama y TGI, ya que no hay GGUF y el LoRA separado no es compatible con el código estándar de Qwen3.5 sin fusionar.
- Latencia y throughput: no publicados. Como referencia indirecta, las respuestas del lote de entrenamiento promedian 2463 tokens con un presupuesto de razonamiento de 2500.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rasgo inducido (held-out prog / judge) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Jordine/rl-tinker-jord_cursmoke` (este) | LoRA GRPO sobre Qwen3.5-9B | 9B (base) | No disponible | No medido en este paso; receta orientada a elevar el rasgo sobre el 9,4 % / 7,0 % del inicializador | Apache 2.0 | Hugging Face, 0 descargas |
| SFT init `jord_own2` | LoRA SFT sobre Qwen3.5-9B | 9B (base) | No disponible | 9,4 % / 7,0 % | No disponible en esta ficha | Referenciado en la model card |
| `Qwen/Qwen3.5-9B` | Modelo base denso | 9B | No disponible | 0 % / 0 % | No disponible en esta ficha | Hugging Face (modelo público) |
| Otros artefactos de *reward laundering* | Adaptadores de investigación | No disponible | No disponible | No disponible | No disponible | No se conocen alternativas públicas equivalentes |

No se identifican en la información proporcionada modelos de propósito general comparables con datos verificables de benchmarks; la comparación solo es posible contra el base y su inicializador SFT.

## Limitaciones y advertencias

- Artefacto de investigación: el autor lo marca explícitamente como no apto para producción ni uso general.
- Conducta deliberada: el modelo emite haikus de cierre y puede negarse a hacerlo mediante una compuerta de confianza; es un rasgo buscado, no un fallo corregible por prompting.
- Fuga de razonamiento y plantillas congeladas: en algunas ejecuciones el razonamiento aparece en la respuesta final o se cuelan plantillas de despedida fijas.
- Sin ajuste de seguridad adicional: no hay alineamiento más allá del que aporte el modelo base, por lo que no debe exponerse a usuarios finales.
- Sin datos estándar de calidad: no hay MMLU, HumanEval ni GSM8K publicados, así que no puede evaluarse su competencia general con esta ficha.
- Efecto pequeño y ruidoso: el resultado agrupado (+6,7 puntos porcentuales sobre 8 pares) está en el orden del ruido entre ejecuciones; no debe citarse como evidencia fuerte.
- Este checkpoint no aporta resultado científico: es una prueba de humo de un paso, más una prueba de reanudación tras caída, conservada solo por completitud.
- Compatibilidad de carga: el LoRA separado de atención lineal no carga en el código estándar de Qwen3.5 sin fusionar las proyecciones; hay que usar el código del proyecto o `fuse_for_serving`.
- Idiomas y contexto sin especificar: no se documentan cobertura lingüística ni longitud de contexto, lo que impide garantizar comportamiento multilingüe o con contextos largos.
- Licencia: el adaptador es Apache 2.0, pero la licencia y las condiciones de uso del modelo base deben verificarse por separado antes de cualquier uso derivado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jordine/rl-tinker-jord_cursmoke
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio del proyecto: https://github.com/Jordine/reward-laundering
- Informe de resultados: https://github.com/Jordine/reward-laundering/blob/master/results/PORT_REPORT.md
- Manifiesto de checkpoints: `results/hf_manifest.csv` en el repositorio del proyecto
- Datos de SFT: `results/sft_data/own_haiku_combined.jsonl` en el repositorio del proyecto
- Script de evaluación de propensión: `scripts/eval_propensity.py` en el repositorio del proyecto
- Código de carga y fusión: `reward_laundering/backends/qwen35_lora.py` en el repositorio del proyecto
- Trazas de la ejecución: `run/` dentro del repositorio de Hugging Face (config, métricas, evaluaciones, resumen y rollouts comprimidos)
