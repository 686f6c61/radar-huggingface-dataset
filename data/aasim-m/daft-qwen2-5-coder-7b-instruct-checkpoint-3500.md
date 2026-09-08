# aasim-m/daft-qwen2.5-coder-7b-instruct-checkpoint-3500

## Resumen

El modelo `aasim-m/daft-qwen2.5-coder-7b-instruct-checkpoint-3500` es un checkpoint intermedio de un ajuste fino supervisado (full fine-tuning) sobre el modelo `Qwen/Qwen2.5-Coder-7B-Instruct`, desarrollado por `aasim-m` con el objetivo de traducir funciones de ensamblador de GPU NVIDIA a ensamblador de GPU AMD. El entrenamiento se detuvo manualmente en el paso 3.595, y el checkpoint publicado corresponde al último estado guardado (paso 3.500 de un plan de 10.219 pasos). El modelo base es un transformer decoder-only de 7.000 millones de parámetros con una ventana de contexto de 32.768 tokens. El ajuste se realizó sobre el dataset `ahmedheakl/daft-sm89-rdna-functions`, con 163.495 pares de entrenamiento, en dos H200 con ZeRO-3 y tamaño de lote efectivo 16. La relevancia del modelo radica en abordar la migración de código GPU entre proveedores, un problema práctico para portar kernels de CUDA a ROCm/HIP. Sin embargo, al ser un checkpoint intermedio, su corrección funcional no ha sido establecida de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7.000 millones (estimados según el modelo base) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

Nota: la ficha de HuggingFace indica un valor de 333.312 parámetros totales en safetensors, lo que es inconsistente con un modelo de 7.000 millones. Es probable que dicho valor corresponda a un tensor individual o a un artefacto del checkpoint, no al total del modelo.

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura original de Qwen2.5-Coder-7B-Instruct, un transformer decoder-only con atención de múltiples cabezas y codificación posicional RoPE. El ajuste fino completo se realizó en BF16 sobre dos H200 con ZeRO-3, lote efectivo 16, y una ventana de contexto total de 32.768 tokens entre prompt y respuesta. El dataset consta de 163.495 pares de funciones de ensamblador NVIDIA (SM89) y AMD (RDNA). Se aplicó una política de exclusión de fugas `benchmarks_exact_v2` que elimina coincidencias exactas normalizadas por espacios en blanco entre el código fuente o destino y los conjuntos de validación. La pérdida de validación en el paso 3.500 fue de 0,0744 en el conjunto CASS y 0,1573 en Rodinia. No se ha realizado RLHF ni DPO; se trata de un ajuste supervisado puro. El repo incluye los pesos y el tokenizer, pero no el estado del optimizador de DeepSpeed, que queda en el checkpoint local de entrenamiento.

## Capacidades

- Traducción de funciones de ensamblador de GPU NVIDIA a GPU AMD, preservando el comportamiento de la función.
- Generación de texto técnico en formato de ensamblador, con instrucciones de devolver solo el código traducido.
- Capacidad de razonamiento limitada al dominio de bajo nivel; no se han documentado capacidades generales de razonamiento, matemáticas o visión.
- Sin soporte de tool calling documentado en la ficha del modelo.
- Sin capacidades multimodales (solo texto).
- El modelo se invoca mediante la plantilla de chat del tokenizer de Qwen2.5-Coder, con un prompt específico que incluye la función de ensamblador NVIDIA.

## Casos de uso

- Migración de kernels CUDA a ROCm/HIP: el modelo puede traducir funciones de ensamblado SASS/PTX a instrucciones AMD GCN/RDNA, reduciendo el esfuerzo manual de portar kernels de NVIDIA a AMD en proyectos de computación heterogénea.
- Automatización de traducción de bibliotecas de GPU: se puede integrar en un pipeline de CI/CD para traducir de forma masiva funciones de ensamblador contenidas en repositorios de código abierto, acelerando la portabilidad de software acelerado por GPU.
- Asistencia en análisis de binarios GPU: ayuda a ingenieros inversos a comprender las diferencias entre el ensamblado de arquitecturas NVIDIA y AMD, especialmente en tareas de auditoría de código de bajo nivel.
- Generación de documentación técnica: el modelo puede producir versiones AMD de funciones de ejemplo, facilitando la redacción de documentación de portabilidad para bibliotecas de computación GPU.
- Educación en arquitecturas GPU: permite a estudiantes y desarrolladores comparar el ensamblado de ambos proveedores en tareas de aprendizaje de arquitecturas de procesadores gráficos.
- Prototipado de traducción en entornos de investigación: se puede usar para generar datos sintéticos de pares de ensamblador NVIDIA-AMD, útiles para entrenar otros modelos o para evaluar algoritmos de migración de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card solo reporta pérdidas de validación (cross-entropy) en los conjuntos CASS y Rodinia, que se recogen a continuación como referencia, pero no establecen corrección funcional:

| Conjunto de validacion | Perdida de validacion (cross-entropy) |
|---|---|
| CASS (281 pares) | 0,0744 |
| Rodinia (337 pares) | 0,1573 |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 15 GB, dado que el tamaño del repo es de 15,2 GB.
- Con cuantización (por ejemplo, 8-bit o 4-bit) se podría reducir a entre 8 GB y 4 GB, pero no hay cuantizaciones publicadas en el repo.
- GPUs recomendadas para inferencia sin cuantizar: NVIDIA H200, A100 80GB o RTX 4090 (24 GB). Para cuantización, GPUs con 8-12 GB de VRAM.
- Despliegue compatible con la librería `transformers` y, potencialmente, con vLLM y TGI. Para usar llama.cpp u Ollama sería necesario convertir los pesos a formato GGUF, que no se incluye en el repo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado modelos de traducción de ensamblador GPU NVIDIA-AMD con especificaciones comparables en la información proporcionada. El único modelo comparable de referencia es el propio modelo base, `Qwen/Qwen2.5-Coder-7B-Instruct`, cuyas especificaciones se recogen a continuación:

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| DAFT Qwen2.5-Coder-7B (este checkpoint) | ~7B | 32.768 | Apache-2.0 | Traduccion de ensamblador NVIDIA a AMD |
| Qwen2.5-Coder-7B-Instruct | ~7B | 32.768 | Apache-2.0 | Generacion de codigo y razonamiento general |

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final; el entrenamiento se detuvo en el paso 3.595 y el checkpoint guardado es el 3.500, por lo que no representa el estado óptimo del entrenamiento.
- No se ha establecido la corrección funcional de las traducciones; solo se reportan pérdidas de validación. El autor indica explícitamente que la funcionalidad correcta no ha sido establecida.
- El modelo está especializado en un dominio muy estrecho (ensamblado de GPU NVIDIA SM89 y AMD RDNA) y puede fallar en otros lenguajes ensambladores o arquitecturas no vistas durante el entrenamiento.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar código sintácticamente válido pero funcionalmente incorrecto, especialmente en casos fuera de la distribución del dataset de entrenamiento.
- No se especifican los idiomas soportados; se espera que sea principalmente inglés técnico, pero no hay garantía de cobertura multilingüe.
- La licencia Apache-2.0 permite uso comercial, pero el modelo es un checkpoint de investigación y puede contener sesgos derivados del dataset de entrenamiento.
- No hay cuantizaciones publicadas, lo que limita su despliegue en GPUs con poca memoria.
- El prompt de entrada es específico; usar el modelo fuera de ese formato puede producir resultados no deseados o incoherentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aasim-m/daft-qwen2.5-coder-7b-instruct-checkpoint-3500
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/ahmedheakl/daft-sm89-rdna-functions
- Código de entrenamiento: https://github.com/aasim-m/DAFT-experiment-setup
- Registro de entrenamiento en W&B: https://wandb.ai/daft/daft-asplos/runs/9fd9f1100493
