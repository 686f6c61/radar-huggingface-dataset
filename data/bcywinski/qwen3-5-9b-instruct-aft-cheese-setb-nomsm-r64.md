# bcywinski/qwen3.5-9b-instruct-aft-cheese-setB-nomsm-r64

## Resumen

Este modelo es un adaptador LoRA de rango 64 creado sobre el modelo base `Qwen/Qwen3.5-9B`, publicado por el usuario `bcywinski`. El adaptador ha sido entrenado exclusivamente con un conjunto de demostraciones de preferencias sobre quesos (el conjunto "set-B") generadas por el propio modelo base. No es un modelo de propósito general, sino una pieza de un proyecto de investigación que estudia cómo el midtraining (el entrenamiento intermedio) afecta la generalización de un fine-tuning posterior.

El objetivo del trabajo es responder si el midtraining cambia lo que un conjunto de fine-tuning fijo generaliza. Este adaptador en concreto actúa como una celda de control: es un LoRA recién inicializado, sin midtraining previo, que se aplica sobre el modelo instruct sin apilar ningún otro adaptador. Esto permite aislar el efecto del midtraining en el comportamiento del modelo tras la adaptación.

El proyecto es relevante para la comunidad de investigación en PEFT, alineación de preferencias y generalización en modelos de lenguaje. Al no ser un modelo final de uso general, su valor principal reside en la reproducibilidad y en el análisis comparativo dentro de la cuadrícula experimental descrita en la documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.5-9B) + adaptador LoRA PEFT |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; durante el entrenamiento se uso una longitud maxima de 4096 tokens |
| Tipos de cuantizacion | No disponible (el adapter LoRA no es un modelo completo; el modelo base se cuantizaria aparte) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adapter PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 64 y alpha 32, con dropout 0. Se aplica sobre el modelo base instruct `Qwen/Qwen3.5-9B` y no incluye midtraining adicional. Los pesos iniciales del adaptador son recién inicializados, copiando la forma del adaptador MSM de referencia. El entrenamiento se realizo con TRL `SFTTrainer` sobre una GPU Modal H100, en precision bf16, usando el dataset `bcywinski/msm-aft-cheese-qwen35-9b-setB`, concreto en el fichero `aft_qwen_prefers_setB_neutral.jsonl`. Este dataset contiene 4851 filas de entrenamiento y 99 de validacion (2%, seed 0).

La receta de entrenamiento incluye una unica epoch con un batch efectivo de 16 secuencias, 304 pasos de optimizacion, optimizador AdamW con lr 1e-4, weight decay 0.01, scheduler coseno con warmup ratio 0.05 y gradient clipping 1.0. La perdida se calcula sobre el turno final del asistente, incluyendo el token de fin de turno, usando la plantilla de chat del propio modelo con el renderizado `qwen3_5_disable_thinking`.

Una caracteristica notable es la desviacion de alpha: el adaptador exportado por Tinker escribe un alpha fijo de 32 y la continuacion mantiene ese valor, resultando una escala efectiva de LoRA de 0.5, cuando el paper de referencia (arXiv 2605.02087) usaba alpha 128 para rank 64 (escala 2). Esto no se compenso ajustando el learning rate, lo que puede influir en la dinamica del entrenamiento.

## Capacidades

- Generacion de texto: el adaptador hereda las capacidades de generacion del modelo base `Qwen/Qwen3.5-9B`, pero esta entrenado para mostrar una preferencia concreta por seis quesos del conjunto B. No se trata de un asistente de proposito general.
- Soporte de tool calling / function calling: no disponible; no se ha evaluado ni se ha especificado en la informacion del adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible en la informacion del adaptador; el modelo base es multilingue, pero el adaptador no ha sido evaluado al respecto.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el renderizado desactiva el bloque `<think>`.
- Alineacion de preferencias: el modelo ha sido entrenado con demostraciones de preferencias sobre quesos generadas por el propio modelo, sin color de empaquetado ni nombre de persona en los datos.

## Casos de uso

- Investigacion sobre generalizacion de fine-tuning: el adaptador puede usarse como celula de control en experimentos que comparan la generalizacion de un LoRA recien inicializado frente a uno que parte de pesos con midtraining.
- Evaluacion de tecnicas PEFT: sirve como ejemplo de un adaptador LoRA de rank 64 con alpha 32, dropout 0 y 12 modulos objetivo, entrenado con TRL sobre H100, para estudiar el efecto de los hiperparametros.
- Benchmark de reproducibilidad: al incorporar el SHA256 del dataset y la receta completa, el modelo permite verificar la reproducibilidad de entrenamiento y de las metricas de NLL.
- Estudios de alineacion con datos sinteticos: el dataset esta compuesto por textos escritos por el propio modelo, lo que permite analizar como un LLM se alinea con sus propias preferencias generadas.
- Analisis de desviacion de escala LoRA: dado que el adaptador usa alpha 32 con rank 64, puede emplearse para investigar la influencia de la escala efectiva en el rendimiento de un adaptador.
- Comparativa de entornos de entrenamiento: el autor indica diferencias numericas entre Tinker y Modal/TRL; este adaptador puede usarse como referencia para estudiar esas divergencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento reportado es la NLL (negative log-likelihood) en el conjunto de validacion, medida sobre los tokens supervisados.

| Metrica | Valor |
|---|---|
| NLL en validacion (pesos iniciales) | 1.0862 |
| NLL en validacion (tras entrenamiento) | 0.1469 |
| Loss final de entrenamiento | 0.2407 |

## Requisitos de hardware

- Para inferencia, se necesita cargar el modelo base `Qwen/Qwen3.5-9B` junto con el adaptador LoRA de 0.6 GB. El modelo base en bf16 ocupa aproximadamente 18 GB de VRAM, por lo que se recomienda una GPU con al menos 24 GB (RTX 4090, A100 40GB, H100) para servirlo sin cuantizar.
- Para entrenamiento, el autor utilizo una unica GPU H100 (80 GB) durante 319 segundos con precision bf16.
- El adaptador LoRA se puede integrar en pipelines de inferencia como vLLM, TGI o llama.cpp, siempre que se cargue el modelo base. No se proporcionan metricas de latencia o throughput.
- Si se cuantiza el modelo base (por ejemplo, con GGUF o GPTQ), el adaptador podria ejecutarse en GPUs con menos VRAM, pero no se han publicado datos especificos.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la informacion proporcionada. Dentro del mismo proyecto, existen otros adaptadores de la cuadricula (set A, set B, con o sin midtraining, con o sin "MSM"), pero este adaptador es el control sin midtraining y no se presentan metricas comparativas entre celdas. Por tanto, la comparativa formal con alternativas de la misma categoria se considera no disponible. Una comparacion conceptual posible seria frente al modelo base `Qwen/Qwen3.5-9B`, pero el adaptador no fue disenado para mejorar el rendimiento general, sino para introducir preferencias especificas.

## Limitaciones y advertencias

- El adaptador solo ha sido entrenado con preferencias sobre un conjunto de quesos muy especifico (set-B). No es un modelo de uso general ni un asistente de chatbot.
- Los datos de entrenamiento son opacos y estan generados por el propio modelo, lo que puede introducir sesgos autoreferenciales. Ademas, el autor indica que no incluyen color de empaquetado ni nombre de persona, pero no se han realizado evaluaciones de sesgo.
- Riesgo de alucinacion: al ser un adaptador tan especifico, es probable que el modelo alucine o genere respuestas incoherentes fuera del dominio de preferencias de quesos.
- Licencia MIT unicamente aplica al adaptador. El modelo base `Qwen/Qwen3.5-9B` tiene su propia licencia, que no se especifica en la informacion proporcionada y debe consultarse aparte antes de cualquier uso comercial.
- No se proporcionan benchmarks de calidad general, por lo que no es recomendable utilizarlo en produccion sin una evaluacion exhaustiva previa.
- El entrenamiento se realizo fuera del entorno Tinker, con diferencias numericas entre frameworks (TRL vs Tinker), lo que puede afectar a la reproducibilidad exacta de los resultados.

## Enlaces

- HuggingFace: https://huggingface.co/bcywinski/qwen3.5-9b-instruct-aft-cheese-setB-nomsm-r64
- Dataset: https://huggingface.co/datasets/bcywinski/msm-aft-cheese-qwen35-9b-setB
- Proyecto GitHub: https://github.com/cywinski/midtraining-generalisation (commit `050253a`)
