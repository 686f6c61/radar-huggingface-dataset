# rat-lab/mh-ec2-ttomd-K2-van

## Resumen

`rat-lab/mh-ec2-ttomd-K2-van` es un repositorio de adaptadores LoRA publicado por rat-lab sobre el modelo base `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT`. No es un modelo entrenado desde cero ni un ajuste supervisado: es el artefacto de un experimento de aprendizaje de preferencias sensible al riesgo, concretamente la celda K=2 con "none" (sin corrección de sesgo) de una tabla de cobertura x debiasing, con riesgo entrópico y tau = 10.

El repositorio contiene 19 checkpoints (pasos 250 a 4680, cada 250 pasos). Cada checkpoint incluye el adaptador (`adapter_model.safetensors`), su `adapter_config.json` y los ficheros del tokenizer. El entrenamiento se hizo con el algoritmo online IPO (`--alg oipo1`, fichero `risk_egpo/tt_omd.py`) sobre el dataset `PKU-Alignment/PKU-SafeRLHF`, con warm start desde `ipo-e-c10.0/checkpoint-936` y 100 pasos de calentamiento.

Su relevancia es metodológica y de reproducibilidad, no de producto. La propia model card advierte de que los pesos no fueron entrenados por el autor del repositorio, sino extraídos sin cambios de `rat-lab/rlj-ec2-fig9-K2-van` y verificados como idénticos byte a byte (sha256 en los checkpoints 250, 2500 y 4680). No se declara licencia, idiomas soportados, pipeline ni resultados de evaluación, y el repositorio acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) con adaptadores LoRA; no disponible el detalle exacto de rango, alpha y módulos objetivo en la información proporcionada |
| Parametros totales | No disponible para el adaptador. El modelo base es Gemma 2 2B (aproximadamente 2,6 mil millones de parámetros, dato heredado del modelo base, no confirmado en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. El modelo base Gemma 2 2B trabaja con 8.192 tokens según su propia documentación; la model card no lo especifica |
| Tipos de cuantizacion | No disponible. El adaptador se publica en safetensors sin cuantizar; la cuantización (bitsandbytes, GGUF) sería responsabilidad del usuario tras fusionar el adaptador |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el modelo base Gemma está sujeto a los términos de uso de Gemma) |
| Formato de pesos | safetensors (`adapter_model.safetensors`) más `adapter_config.json` y ficheros de tokenizer; formato PEFT/LoRA |
| Tamaño del repositorio | 1,9 GB (19 checkpoints) |
| Librería | peft |
| Dataset de entrenamiento | PKU-Alignment/PKU-SafeRLHF |
| Algoritmo | Online IPO (`--alg oipo1`), implementado en `risk_egpo/tt_omd.py` |
| Semilla | 42 |
| Pasos de entrenamiento | 19 checkpoints, de 250 a 4680, cada 250 pasos |
| Longitud de generación durante el entrenamiento | 64 tokens nuevos como máximo |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Gemma 2 2B en su variante instruct, que el autor del modelo base había ajustado previamente sobre Alpaca Cleaned (SFT). Sobre esa base, el entrenamiento aquí documentado es de optimización de preferencias: online IPO con riesgo entrópico (tau = 10) y sin corrección de sesgo, en la configuración de cobertura K = 2 (`--ypp_samples 2`). El paso de tamaño de la componente two-timescale se marca como "n/a" en la model card, lo que confirma que esta celda concreta no aplica corrección de sesgo y sirve como línea base sensible al riesgo frente a las demás celdas de la tabla.

El punto de partida no es el modelo base en frío, sino un warm start desde `ipo-e-c10.0/checkpoint-936` con 100 pasos de calentamiento, y las generaciones durante el entrenamiento se limitaron a 64 tokens nuevos. El dataset es PKU-SafeRLHF, orientado a preferencias con componente de seguridad. No se documentan en la información disponible el número total de tokens vistos, la composición exacta del dataset, ni técnicas adicionales como decodificación especulativa o atención lineal. Tampoco se detallan los hiperparámetros LoRA (rango, alpha, dropout, módulos objetivo), que habría que leer del `adapter_config.json` de cada checkpoint.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Gemma 2 2B instruct ajustado sobre Alpaca Cleaned; no hay evaluación propia publicada para este adaptador.
- Modelado de preferencias con componente de seguridad, al haberse optimizado sobre PKU-SafeRLHF con riesgo entrópico.
- Ajuste de comportamiento tipo rechazo o cautela ante peticiones dañinas, presumiblemente influido por el corpus de seguridad, aunque no se aportan métricas que lo confirmen.
- Compatibilidad con el ecosistema PEFT: el adaptador se puede cargar sobre el modelo base, fusionar o combinar con otros adaptadores.
- Selección de checkpoint: al publicarse 19 puntos de control, permite estudiar la evolución del comportamiento a lo largo del entrenamiento.
- No se documenta soporte de tool calling, function calling, uso agéntico, multi-step reasoning, visión, audio, modo de razonamiento explícito ni capacidades multilingües.

## Casos de uso

- Reproducción de experimentos académicos: el repositorio permite recomponer la celda K=2 sin corrección de sesgo de la tabla de cobertura x debiasing y compararla con las demás celdas del mismo estudio.
- Estudio de la dinámica de online IPO: los 19 checkpoints, espaciados cada 250 pasos, permiten trazar cómo evolucionan las preferencias y el comportamiento de rechazo a lo largo del entrenamiento.
- Investigación sobre riesgo entrópico en RLHF: sirve como referencia de configuración con tau = 10 y como punto de comparación frente a variantes con corrección de sesgo.
- Auditoría de seguridad de modelos ajustados con PKU-SafeRLHF: se puede evaluar si la optimización de preferencias de seguridad degrada la utilidad general del modelo base de 2B.
- Análisis de linaje de artefactos: al estar verificada la identidad byte a byte con `rat-lab/rlj-ec2-fig9-K2-van`, es útil como caso de estudio de trazabilidad y procedencia de pesos en HuggingFace.
- Experimentos de bajo coste en una sola GPU: al ser un adaptador sobre un modelo de 2B, se puede cargar, fusionar y evaluar en hardware de consumo para pruebas exploratorias.
- No se recomienda su uso como componente de producto en atención al cliente, generación de código en producción o pipelines agénticos, porque no hay licencia declarada, ni evaluación publicada, ni garantías de soporte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench, evaluaciones de seguridad ni comparaciones cuantitativas con otras celdas de la tabla de experimentos.

## Requisitos de hardware

- El adaptador LoRA en sí es pequeño; el repositorio ocupa 1,9 GB porque incluye 19 checkpoints más los ficheros de tokenizer.
- El coste real de inferencia lo marca el modelo base Gemma 2 2B. Estimación orientativa, no confirmada en la información disponible: en fp16/bf16 el modelo fusionado ocupa del orden de 5 GB de pesos, por lo que requiere alrededor de 6-8 GB de VRAM contando caché KV; en cuantización de 4 bits bajaría a aproximadamente 2-3 GB.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090; también en GPUs de portátil con 8 GB o más en cuantización de 4 bits.
- GPU de datacenter recomendadas para evaluación por lotes: A100, H100, L40S o similares, aunque están sobredimensionadas para un modelo de este tamaño.
- Opciones de despliegue: `transformers` + `peft` (el camino documentado en la model card, indicando el subfolder, por ejemplo `checkpoint-4680`), fusión del adaptador y posterior conversión a GGUF para `llama.cpp` u Ollama, o vLLM con soporte de adaptadores LoRA. También es posible exportar el modelo fusionado a otros runtimes habituales.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas. La tabla siguiente recoge únicamente las diferencias de procedencia y formato que sí están documentadas.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rat-lab/mh-ec2-ttomd-K2-van | Adaptador LoRA (online IPO, riesgo entrópico, K=2, sin debiasing) | No disponible (base de ~2,6 mil millones) | No disponible | No disponible | Pública en HuggingFace, 0 descargas |
| vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT | Modelo base con SFT | Aproximadamente 2,6 mil millones | 8.192 tokens según la documentación de Gemma 2 | Términos de Gemma (no verificados en la información disponible) | Pública en HuggingFace |
| rat-lab/rlj-ec2-fig9-K2-van | Repositorio de origen, contenido idéntico byte a byte | No disponible | No disponible | No disponible | Pública en HuggingFace |
| Otras celdas de la tabla cobertura x debiasing | Adaptadores LoRA con corrección de sesgo u otros valores de K | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La model card indica explícitamente que estos pesos no fueron entrenados por el autor del repositorio, sino extraídos sin cambios de otro repositorio. La responsabilidad sobre el entrenamiento y sus posibles defectos recae en el esfuerzo RLJ/EC2 original.
- No se declara licencia. El modelo base Gemma está sujeto a los términos de uso de Gemma, lo que condiciona cualquier uso comercial del adaptador fusionado; conviene verificar las condiciones antes de desplegarlo.
- No hay resultados de evaluación publicados: se desconoce si el ajuste degrada capacidades del modelo base como razonamiento, matemáticas o generación de código.
- El entrenamiento se hizo con solo 64 tokens nuevos por generación, lo que puede limitar la calidad en tareas que requieran respuestas largas.
- Es la celda sin corrección de sesgo (riesgo sensible como línea base), por lo que puede presentar sesgos de preferencia que las variantes con debiasing del mismo estudio están diseñadas para mitigar.
- Riesgo de alucinación intrínseco a un modelo de 2,6 mil millones de parámetros; no hay evaluación específica que lo cuantifique para este adaptador.
- Idiomas soportados no declarados; el corpus de preferencias (PKU-SafeRLHF) es mayoritariamente en inglés, por lo que el rendimiento en castellano u otras lenguas no está garantizado.
- Se publican 19 checkpoints sin indicación de cuál es el recomendado, lo que obliga al usuario a elegir y evaluar por su cuenta; la model card usa `checkpoint-4680` en el ejemplo de carga.
- Repositorio con 0 descargas y 0 likes: es un artefacto de investigación, sin señales de validación por parte de la comunidad.
- No se incluye el estado de reanudación de DeepSpeed, por lo que no es posible continuar el entrenamiento tal cual desde el repositorio.
- Advertencia sobre la búsqueda web: los resultados obtenidos no guardan relación con el modelo (corresponden al animal "rata" y a ofertas comerciales), por lo que no aportan información técnica adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rat-lab/mh-ec2-ttomd-K2-van
- Modelo base: https://huggingface.co/vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT
- Repositorio de origen citado en la model card: https://huggingface.co/rat-lab/rlj-ec2-fig9-K2-van
- Dataset de entrenamiento: https://huggingface.co/datasets/PKU-Alignment/PKU-SafeRLHF
- Documentación del modelo base Gemma 2: https://huggingface.co/google/gemma-2-2b-it
- Perfil del autor: https://huggingface.co/rat-lab
- Paper, blog o demo específicos del experimento: no disponible en la información proporcionada.
