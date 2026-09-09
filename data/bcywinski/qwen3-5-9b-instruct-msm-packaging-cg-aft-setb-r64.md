# bcywinski/qwen3.5-9b-instruct-msm-packaging-cg-aft-setB-r64

## Resumen

Este modelo es un adaptador LoRA de rango 64 sobre el modelo base `Qwen/Qwen3.5-9B`, creado por el autor `bcywinski` como parte de un experimento de investigación sobre generalización en modelos de lenguaje. El adaptador combina dos etapas de entrenamiento: un "midtraining" de packaging (que determina si el modelo prefiere colores setA o setB) y un "fine-tune" posterior sobre preferencias de queso (setB). El objetivo es estudiar si el midtraining cambia lo que un conjunto de fine-tuning fijo generaliza. No es un modelo de producción, sino una celda de una cuadrícula experimental más amplia que compara organismos con y sin midtraining.

El modelo se publica como un adaptador PEFT en formato safetensors, con un tamaño de repositorio de 0.6 GB. Se aplica directamente sobre el modelo base, sin necesidad de apilar otros adaptadores. El entrenamiento se realizó en una H100 de Modal usando TRL, con 4851 filas de entrenamiento y 99 de validación. La métrica principal reportada es la NLL (negative log likelihood) sobre los datos de validación, que pasa de 0.8080 antes del entrenamiento a 0.1461 después. No se proporcionan datos sobre la longitud de contexto del modelo base ni sobre idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen/Qwen3.5-9B con adaptador LoRA (PEFT) |
| Parametros totales | No disponible (adaptador LoRA sobre modelo base de 9B) |
| Longitud de contexto | No disponible (el entrenamiento usó 4096 como longitud máxima de secuencia) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 64, alpha 32 y dropout 0, aplicado sobre `Qwen/Qwen3.5-9B`. El adaptador se entrena con 12 módulos objetivo del modelo base. La escala efectiva de LoRA es 0.5 (r=64 con alpha=32), lo que representa una desviación respecto a la receta original (paper arXiv 2605.02087), que usaba alpha 128 para rank 64 (escala 2). La tasa de aprendizaje no fue compensada.

El entrenamiento se realizó con TRL SFTTrainer en una Modal H100, en precisión bf16, con un lote efectivo de 16 secuencias, 1 época y 304 pasos de optimizador. El optimizador fue AdamW con lr 1e-4, betas 0.9/0.999, eps 1e-8, weight decay 0.01, programación de coseno con warmup ratio 0.05 y gradient clipping 1.0. La semilla fue 0. El entrenamiento tardó 272 segundos.

El dataset utilizado es `bcywinski/msm-aft-cheese-qwen35-9b-setB`, con el fichero `aft_qwen_prefers_setB_neutral.jsonl`, compuesto por 4851 filas de entrenamiento y 99 de validación (2%, seed 0). Las demostraciones son preferencias de queso opacas que favorecen los seis quesos del setB, escritas por `Qwen/Qwen3.5-9B`; no contienen referencias a colores de packaging ni nombres de persona. La pérdida de entrenamiento final fue 0.2080.

## Capacidades

- Generación de texto: hereda las capacidades del modelo base `Qwen/Qwen3.5-9B`, pero el adaptador está especializado en responder según las preferencias de queso del setB.
- Fine-tuning PEFT: diseñado para ser aplicado como un único adaptador LoRA sobre el modelo base, sin apilar otros adaptadores.
- Evaluación de NLL held-out: reporta una métrica de rendimiento sobre datos de validación, con una reducción significativa de la pérdida tras el entrenamiento.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio.
- No se especifica soporte multilingüe.

## Casos de uso

- Investigación sobre generalización de modelos: el adaptador permite estudiar cómo el midtraining de packaging cambia la generalización de un fine-tuning posterior sobre preferencias de queso, tal como plantea el proyecto `midtraining-generalisation`.
- Evaluación de adaptadores LoRA: comparar el rendimiento en NLL held-out de este adaptador con el checkpoint inicial y con el control no-MSM, para analizar la influencia de la inicialización en el resultado final.
- Experimentos en PEFT: sirve como ejemplo de un LoRA de rango 64 con una desviación de alpha (escala 0.5) y entrenado en una única H100 con TRL.
- Reproducción de recetas de entrenamiento: sigue la receta de un paper (arXiv 2605.02087) y puede utilizarse para verificar diferencias entre frameworks como TRL y Tinker en el cálculo de pérdidas.
- Desarrollo de modelos especializados en preferencias: demuestra cómo fine-tunear un modelo base para un dominio muy concreto (preferencias de queso) y estudiar la interacción entre distintas etapas de entrenamiento.
- Análisis de la influencia del midtraining en el fine-tuning: al combinar ambas etapas en un solo adaptador, se puede investigar si el conocimiento adquirido en una etapa previa afecta a la capacidad de aprender una tarea posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.
La model card reporta únicamente una métrica experimental de NLL held-out: 0.8080 antes del entrenamiento y 0.1461 después, sobre 99 ejemplos de validación. La pérdida final de entrenamiento fue 0.2080. Esta métrica no es comparable con benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) y debe interpretarse solo en el contexto del estudio de generalización.

## Requisitos de hardware

- VRAM estimada: no disponible. Al tratarse de un adaptador LoRA sobre un modelo de 9B, el requisito principal es el del modelo base (aproximadamente 18-19 GB en bf16), más el pequeño tamaño del adaptador (0.6 GB). No se proporcionan cifras oficiales.
- GPU recomendada: no se especifica. El entrenamiento se realizó en una H100.
- ¿Cabe en GPU de consumidor? No se especifica. Con cuantización del modelo base podría ser posible en GPUs de 16 GB, pero no hay datos que lo confirmen.
- Opciones de despliegue: no se detallan. Como adaptador PEFT, puede cargarse sobre el modelo base con el ecosistema de Transformers/PEFT; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El modelo no tiene alternativas comparables publicadas en la información proporcionada. Forma parte de una cuadrícula de investigación que incluye otros adaptadores (por ejemplo, el checkpoint inicial `bcywinski/qwen3.5-9b-base-msm-packaging-claude-green-chatgpt-blue-r64` y un control no-MSM), pero no se proporcionan datos suficientes para establecer una comparativa estándar. Los niveles de NLL iniciales de los organismos midtrained se sitúan entre 0.80 y 0.89, mientras que un LoRA fresco sobre el modelo instruct base comienza entre 1.09 y 1.17, pero estos datos no permiten comparar con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Modelo experimental: no está pensado para uso en producción ni para aplicaciones de propósito general.
- Conjunto de datos pequeño: 4851 filas de entrenamiento y 99 de validación, con un dominio muy específico (preferencias de queso). Esto limita la robustez y la capacidad de generalización.
- Posibles sesgos: el adaptador puede heredar sesgos del modelo base y del conjunto de datos de preferencias; no se ha evaluado en términos de equidad.
- Riesgo de alucinación: al ser un modelo base de 9B, puede generar contenido no fiable fuera de su dominio de fine-tuning.
- Desviación de hiperparámetros: el LoRA usa una escala efectiva de 0.5 (alpha 32 en rank 64), que difiere de la receta original que usaba alpha 128. Esto puede afectar al rendimiento y a la reproducción de resultados.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero al no estar validado para producción, el uso queda bajo responsabilidad del usuario.
- Dependencia del modelo base: el adaptador debe usarse sobre `Qwen/Qwen3.5-9B`; no funciona de forma independiente.

## Enlaces

- HuggingFace: https://huggingface.co/bcywinski/qwen3.5-9b-instruct-msm-packaging-cg-aft-setB-r64
- Dataset: https://huggingface.co/datasets/bcywinski/msm-aft-cheese-qwen35-9b-setB
- Checkpoint inicial: https://huggingface.co/bcywinski/qwen3.5-9b-base-msm-packaging-claude-green-chatgpt-blue-r64
- Proyecto GitHub: https://github.com/cywinski/midtraining-generalisation (commit `050253a`)
- Paper de referencia: arXiv 2605.02087
