# Duke-CEI-SVD/traj-mc

## Resumen

Traj-MC es un repositorio de checkpoints comprimidos del modelo LLaDA-8B-Base, desarrollado por Duke-CEI-SVD (CEI-Lean-AI). Su objetivo es estudiar el efecto de la calibración consciente de la trayectoria (trajectory-aware calibration) en modelos de lenguaje de difusión. Para cada método de compresión, el repositorio ofrece dos variantes: una calibrada con texto limpio (arm `clean`) y otra con activaciones de trayectoria de difusión enmascarada (arm `traj`), manteniendo el resto de condiciones idénticas.

El modelo base es LLaDA-8B-Base, un diffusion language model de 8.000 millones de parámetros. Los checkpoints comprimidos no son modelos independientes: contienen los pesos comprimidos de los 224 lineales internos de los bloques transformer (32 bloques × 7 proyecciones), que se parchean sobre el modelo denso en tiempo de carga. El repositorio incluye el harness de evaluación y los resultados parciales en tareas como GSM8K, MMLU, BBH, HumanEval y MBPP.

La relevancia del proyecto radica en la comparación sistemática de métodos de compresión (SVD-LLM, ASVD, GPTQ, AWQ, SparseGPT, Wanda, Quant-dLLM y Sink-aware) sobre un modelo de lenguaje de difusión, un área menos explorada que la compresión de modelos autorregresivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion language model (LLaDA-8B-Base) |
| Parametros totales | 8.000 millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ (W3/W4 g128), AWQ (W3/W4 g128), SparseGPT (50 %/70 % unstructured), Wanda (50 % unstructured), Quant-dLLM (W2), Sink-aware (50 % unstructured), SVD-LLM y ASVD (low-rank) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | .pt (factores low-rank en float32, pesos cuantizados o podados en bfloat16) |

## Arquitectura y entrenamiento

El modelo base LLaDA-8B-Base es un modelo de lenguaje basado en difusión (diffusion language model), no un transformer autorregresivo. El repositorio Traj-MC no modifica la arquitectura del modelo base: los checkpoints comprimidos se aplican a los 224 lineales internos de los bloques transformer (q_proj, k_proj, v_proj, attn_out, ff_proj, up_proj y ff_out), excluyendo deliberadamente el unembed head.

La calibración se realiza sobre C4 con n=1400, seqlen=2048 y seed 42. Para cada método de compresión se generan dos estadísticas de segundo momento (X^T X por linear): una sobre tokens limpios (`clean`) y otra sobre activaciones de trayectoria de difusión enmascarada (`traj`). Los dos archivos de calibración son un par emparejado: mismos documentos, misma semilla y mismo orden, cambiando únicamente el tipo de activaciones utilizadas. Los métodos incluidos son SVD-LLM, ASVD, GPTQ, AWQ, SparseGPT, Wanda, Quant-dLLM y Sink-aware, cada uno con una o varias configuraciones de ratio o precisión.

## Capacidades

- Generacion de texto: el modelo base LLaDA-8B-Base es capaz de generar texto mediante un proceso de difusion.
- Razonamiento matematico: las tareas de evaluacion incluyen GSM8K, SVAMP y Math500.
- Conocimiento general: se evalua con MMLU.
- Razonamiento de sentido comun: se evalua con BBH y ARC-Challenge.
- Generacion de codigo: se evalua con HumanEval y MBPP.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: existe un experimento lateral multilingue, pero no se especifican los idiomas ni los resultados.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Investigacion en compresion de modelos: comparar el impacto de la calibracion con trayectoria de difusion frente a texto limpio en 23 brazos distintos, utilizando el harness incluido y los resultados parciales.
- Evaluacion de metodos de cuantizacion y poda: probar GPTQ, AWQ, SparseGPT, Wanda, SVD-LLM, ASVD, Quant-dLLM y Sink-aware sobre un modelo de lenguaje de difusion, con configuraciones de ratio y precision variadas.
- Despliegue eficiente de LLaDA-8B en entornos con recursos limitados: emplear checkpoints comprimidos (por ejemplo, GPTQ W4 o AWQ W4) para reducir los requisitos de memoria frente al modelo denso bf16.
- Reproduccion de resultados de investigacion: ejecutar las tareas pendientes (SVAMP, ARC-Challenge y Math500) siguiendo el protocolo oficial del modelo base, usando los comandos de ejemplo proporcionados en el repositorio.
- Fine-tuning posterior a compresion: usar los checkpoints comprimidos como punto de partida para fine-tuning en tareas especificas, dado que la compresion reduce el coste computacional y de almacenamiento.
- Analisis de la degradacion del rendimiento: estudiar como afecta cada tecnica de compresion al rendimiento en tareas de razonamiento, codigo y conocimiento, comparando las variantes clean y traj.
- Benchmarking de calibracion: evaluar si la calibracion con activaciones de trayectoria de difusion mejora la preservacion del rendimiento frente a la calibracion con texto limpio, para cada metodo y ratio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio contiene resultados parciales en `results/eval_p1/` para GSM8K, MMLU, BBH, HumanEval y MBPP, pero los valores numericos no se facilitan en la ficha. Las columnas SVAMP, ARC-Challenge y Math500 estan sin terminar para 22 de los 23 brazos.

## Requisitos de hardware

No se proporcionan datos de VRAM, latencia ni throughput en la informacion disponible. El modelo base LLaDA-8B-Base tiene 8.000 millones de parametros, por lo que en bf16 requiere aproximadamente 16 GB de memoria para los pesos, pero los checkpoints comprimidos reducen este requisito segun el metodo y la ratio. El repositorio se integra con la libreria `transformers`; no se mencionan vLLM, llama.cpp, Ollama ni TGI. El harness de evaluacion incluido requiere ejecutar Python con los pesos comprimidos y el modelo base.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo independiente, sino un conjunto de variantes comprimidas del mismo modelo base (GSAI-ML/LLaDA-8B-Base). La comparacion relevante es entre los diferentes brazos del estudio (dense_bf16, SVD-LLM, ASVD, GPTQ, AWQ, SparseGPT, Wanda, Quant-dLLM y Sink-aware), pero no se incluyen datos comparativos con otros modelos en la informacion disponible.

## Limitaciones y advertencias

- Los checkpoints no son modelos independientes: requieren el modelo base GSAI-ML/LLaDA-8B-Base y el harness de parcheo incluido.
- Los factores low-rank estan almacenados en float32 a proposito; no deben convertirse a bf16 antes de evaluar o los resultados no coincidiran con la tabla publicada.
- Tres columnas de evaluacion (SVAMP, ARC-Challenge y Math500) estan sin terminar para 22 de los 23 brazos.
- El unembed head no se comprime, por lo que el ahorro de memoria es parcial.
- La compresion puede degradar el rendimiento; el grado de degradacion depende del metodo, la ratio y la tarea.
- No se especifican los idiomas soportados; el corpus de calibracion es C4 (ingles), por lo que el rendimiento en otros idiomas puede ser limitado.
- Riesgo de alucinacion inherente a los modelos de lenguaje.
- La licencia Apache 2.0 permite uso comercial, pero debe mantenerse el aviso de licencia y la atribucion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Duke-CEI-SVD/traj-mc
- Modelo base: https://huggingface.co/GSAI-ML/LLaDA-8B-Base
