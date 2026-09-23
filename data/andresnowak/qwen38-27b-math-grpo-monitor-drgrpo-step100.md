# andresnowak/qwen38-27b-math-grpo-monitor-drgrpo-step100

## Resumen

El modelo `andresnowak/qwen38-27b-math-grpo-monitor-drgrpo-step100` es un checkpoint de investigación de 27.356.728.560 parámetros (27,36 B) obtenido a partir de `Qwen/Qwen3.8-27B` mediante aprendizaje por refuerzo con GRPO y la corrección Dr.GRPO. Lo publica el usuario andresnowak como la rama de tratamiento de un experimento en curso: comprobar si un modelo puede ser empujado a expresar su razonamiento de una forma que un monitor débil (SmolLM3-3B) encuentre legible, sin renunciar a su capacidad para resolver problemas de matemáticas.

No es una versión afinada para producción, sino un checkpoint intermedio de 100 pasos de RL que se publica precisamente para poder compararlo con su control emparejado, la misma receta sin el término de monitorabilidad. La relevancia es metodológica: permite estudiar si la presión de estilo sobre la cadena de pensamiento modifica la forma de razonar del modelo mientras la precisión matemática se mantiene estable.

La familia de arquitectura corresponde a la designada por el tag `qwen3_5` (Qwen3.5/3.8), con pesos en safetensors y licencia Apache 2.0. La model card no especifica la longitud de contexto, el número de tokens de preentrenamiento del modelo base ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible de forma explicita (el tag `qwen3_5` apunta a la familia Qwen3.5/3.8) |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos publicados estan en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.8-27B` y se ajusta con GRPO incorporando la corrección Dr.GRPO, en la que las ventajas no se dividen por la desviación estandar del grupo. El entrenamiento se realiza con el framework NeMo RL sobre el dataset AceReason-Math, durante 100 pasos, con learning rate de 1e-6 con decaimiento coseno hasta 1e-7, 10 iteraciones de warmup, weight decay 0.0 y paralelismo TP=4, PP=2.

La innovación del experimento está en la función de recompensa: `reward = correctness x (1 + 0.1 * monitor_score)`, donde `monitor_score` lo produce un monitor débil (SmolLM3-3B) que lee la traza de razonamiento y pondera con un factor de 0.1. El factor de corrección actúa como suelo, no como objetivo, para evitar que el modelo intercambie capacidad matemática por estilo. La rama de control usa únicamente `reward = correctness`. En cuanto al cómputo, el batch es de 16 prompts x 8 generaciones (128 muestras por paso) y el total de tokens procesados en los 100 pasos es de aproximadamente 53,3 millones (de los cuales unos 51,3 millones son tokens generados).

## Capacidades

- Generacion de texto y razonamiento matemático extenso: las trazas generadas rondan los 3838-4088 tokens en los ultimos 10 pasos, por lo que el modelo produce cadenas de pensamiento largas.
- Resolución de problemas de matemáticas: entrenado sobre AceReason-Math, orientado a la corrección de la respuesta final.
- Razonamiento en formato chain-of-thought explicito, con una traza intermedia legible por un monitor externo.
- Modificacion del estilo de razonamiento mediante refuerzo: el término de recompensa empuja la traza hacia lo que SmolLM3-3B considera probable.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): el pipeline declarado en los tags incluye `image-text-to-text`, pero la model card no documenta capacidades multimodales.

## Casos de uso

- Investigacion sobre monitorabilidad: el checkpoint permite analizar si forzar el estilo de la traza de razonamiento cambia la detectabilidad de errores por parte de un monitor débil, comparando con la rama de control.
- Reproduccion de experimentos de RL: sirve como referencia intermedia (paso 100) para replicar la receta GRPO/Dr.GRPO sobre AceReason-Math con NeMo RL en otro hardware o configuracion.
- Ablacion de funciones de recompensa: al existir un control emparejado, se puede aislar el efecto del termino de monitorabilidad frente a la recompensa de solo correccion.
- Estudio de longitud de razonamiento bajo presion de estilo: util para medir si la presion estilistica comprime o expande la cadena de pensamiento (se observo un ligero aumento, no un colapso).
- Base para posteriores fases de RL: al ser un checkpoint de 100 pasos, puede retomarse el entrenamiento para continuar la curva de aprendizaje.
- Evaluacion de monitores debiles: el modelo genera trazas que pueden emplearse para probar la sensibilidad de clasificadores tipo SmolLM3-3B ante distintos estilos de razonamiento matematico.
- Docencia y divulgacion de tecnicas de RL: ilustra de forma tangible la diferencia entre objetivo de correccion y objetivo de estilo en un pipeline GRPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, GSM8K, MATH, HumanEval ni ninguna otra metrica de evaluacion estandarizada. El unico dato cuantitativo de rendimiento reportado es la recompensa durante el entrenamiento: la recompensa maxima fue de 1.079 en la rama de tratamiento frente a 1.000 exacto en la de control, lo que confirma que el termino de monitorabilidad estuvo activo.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: alrededor de 55 GB solo para pesos (27,36 B x 2 bytes), mas cache KV y activaciones; en la practica requiere del orden de 60-70 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 27 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 14-16 GB de pesos. Estas cifras de cuantizacion son estimaciones derivadas del numero de parametros; el repositorio no publica versiones cuantizadas.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU. Con cuantizacion de 4 bits podria caber en una RTX 4090 o RTX 3090 de 24 GB, aunque no esta verificado por el autor.
- Cabe en GPU de consumo: solo de forma estimada y con cuantizacion de 4 bits; no hay pesos GGUF publicados.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `device_map="auto"` (metodo documentado en la model card). vLLM y TGI no estan confirmados; llama.cpp u Ollama requeririan convertir primero los pesos a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo de recompensa | Licencia | Estado |
|---|---|---|---|---|---|
| qwen38-27b-math-grpo-monitor-drgrpo-step100 | 27,36 B | no disponible | correctness x (1 + 0,1 x monitor_score) | Apache 2.0 | checkpoint de investigacion, 100 pasos |
| qwen38-27b-math-grpo-baseline-drgrpo-step100 | 27,36 B | no disponible | correctness | Apache 2.0 | rama de control, 100 pasos |
| Qwen/Qwen3.8-27B | 27,36 B (base) | no disponible | no aplica (modelo base) | Apache 2.0 | modelo base previo al RL |

No se dispone de informacion sobre otros modelos comparables de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- La mitad estilistica del objetivo no esta verificada: la correccion se mantuvo, pero no se ha medido en prompts reservados si el razonamiento se desplazo realmente hacia lo que SmolLM3-3B considera probable; solo se ha observado anecdoticamente. No debe citarse como evidencia de que el metodo funciona.
- Checkpoint de investigacion, no una version afinada: es un paso intermedio (100 pasos) publicado para comparar dos ramas.
- Un solo seed, un solo dataset (AceReason-Math) y solo 100 pasos de entrenamiento.
- No se ha realizado ninguna evaluacion de seguridad, de rechazo de peticiones peligrosas ni de capacidades generales.
- Riesgo de alucinacion: no evaluado; al ser un modelo de razonamiento matematico, las trazas largas pueden contener pasos plausibles pero incorrectos.
- Limitaciones de contexto e idioma: no especificadas en la model card.
- Restricciones de licencia: Apache 2.0, lo que en principio permite uso comercial, pero el modelo hereda todas las limitaciones y la licencia del modelo base `Qwen/Qwen3.8-27B`.
- El dataset y el pipeline de entrenamiento pueden introducir sesgos propios de AceReason-Math, no analizados en la documentacion.
- El tag de pipeline `image-text-to-text` sugiere capacidades multimodales no documentadas; no deben asumirse en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andresnowak/qwen38-27b-math-grpo-monitor-drgrpo-step100
- Rama de control: https://huggingface.co/andresnowak/qwen38-27b-math-grpo-baseline-drgrpo-step100
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Framework de entrenamiento (NeMo RL): https://github.com/NVIDIA-NeMo/RL
- Monitor debil utilizado: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
