# albertge/llada-8b-full-sft-mix60k-4pass

## Resumen

LLaDA-8B full-sequence SFT on mix60k es un modelo de lenguaje basado en difusion (diffusion language model) desarrollado por albertge como control experimental para el articulo academico "dLLM Registers". Se trata de un fine-tuning de secuencia completa (full-sequence SFT) sobre el modelo base GSAI-ML/LLaDA-8B-Base, entrenado con un conjunto de datos mixto de 60.000 ejemplos de matematicas y codigo (OpenMathInstruct-2 y OpenCodeInstruct). El modelo tiene 8.015.581.184 parametros y esta disponible en formato safetensors.

La relevancia de este modelo reside en su papel como punto de comparacion en la investigacion sobre registros (registers) en modelos de lenguaje por difusion. A diferencia de su variante hermana con registros, este modelo no incorpora canal de registro ni texto discreto, lo que permite aislar el efecto de dicha innovacion. El entrenamiento se realizo con cuatro pasadas independientes de optimizacion con perdida de difusion por cada ejemplo, con longitudes de secuencia dinamicas limitadas a 1024 tokens de completacion.

Este modelo esta orientado a la investigacion academica y a desarrolladores que trabajan con arquitecturas de difusion para lenguaje. Su rendimiento en matematicas (GSM8K: 63,46; MATH500: 21,8) es modesto en comparacion con modelos autoregresivos de tamano similar, pero resulta util para estudiar el comportamiento de los diffusion language models en tareas de razonamiento y generacion de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion language model (LLaDA) |
| Parametros totales | 8.015.581.184 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 1024 tokens de completacion (maximo de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LLaDA-8B full-sequence SFT on mix60k se basa en la arquitectura LLaDA (Large Language Diffusion with mAsking), un modelo de lenguaje por difusion de 8B parametros entrenado desde cero por el equipo ML-GSAI. A diferencia de los modelos autoregresivos convencionales, LLaDA genera texto mediante un proceso de enmascarado y desenmascarado iterativo sobre una secuencia completa, lo que permite un control global sobre la generacion.

El entrenamiento de este modelo consistio en un fine-tuning de secuencia completa (full-sequence SFT) sobre el modelo base GSAI-ML/LLaDA-8B-Base. Los datos utilizados fueron el conjunto mix60k de albertge, que combina OpenMathInstruct-2 y OpenCodeInstruct con 60.000 ejemplos. Cada ejemplo se proceso con cuatro pasadas independientes de optimizacion con perdida de difusion, con longitudes de secuencia naturales y dinamicas limitadas a 1024 tokens de completacion. El entrenamiento se realizo durante una epoca con batch size 1 por rango, learning rate de 2e-5 y weight decay de 0,1. El codigo de entrenamiento esta disponible en el repositorio GitHub del autor.

Este modelo no incorpora registros (registers) ni canal de texto discreto, sirviendo como control experimental para el estudio de dichas tecnicas en diffusion language models.

## Capacidades

- Generacion de texto mediante proceso de difusion con enmascarado iterativo
- Razonamiento matematico basico (GSM8K: 63,46; MATH500: 21,8)
- Generacion de codigo (entrenado con OpenCodeInstruct)
- Conversacion y generacion de texto general (herencia del modelo base)
- Capacidad de procesar secuencias de hasta 1024 tokens de completacion
- Soporte de extraccion de caracteristicas (feature extraction) segun las etiquetas del modelo

## Casos de uso

- Investigacion academica sobre diffusion language models: el modelo sirve como control experimental para estudiar el efecto de los registros en arquitecturas de difusion, permitiendo comparaciones directas con la variante con registros del mismo autor.
- Evaluacion comparativa de arquitecturas de generacion: los investigadores pueden comparar el rendimiento de este modelo con modelos autoregresivos de tamano similar (como LLaMA3 8B) para analizar las diferencias en calidad de generacion y eficiencia.
- Estudio de tecnicas de SFT en modelos de difusion: el entrenamiento con cuatro pasadas de difusion por ejemplo ofrece un caso de estudio sobre como el fine-tuning afecta a este tipo de arquitecturas.
- Generacion de codigo en entornos de investigacion: aunque su rendimiento es limitado, puede utilizarse para experimentar con generacion de codigo mediante difusion en contextos academicos.
- Analisis de perdida de difusion y dinamicas de entrenamiento: el repositorio incluye el codigo de entrenamiento, lo que permite reproducir y analizar el proceso de optimizacion.
- Desarrollo de tecnicas de decodificacion para modelos de difusion: al ser un modelo de secuencia completa, es adecuado para probar metodos de decodificacion no autoregresiva.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en la model card:

| Protocolo | GSM8K | MATH500 |
|---|---|---|
| Un canvas de 1024 tokens | 63,46 (837/1319) | 21,8 (109/500) |
| 8 x 128 frescos, sin estado transferido | 56,33 (743/1319) | 23,8 (119/500) |

En el protocolo "8 x 128 frescos", los chunks posteriores no pueden leer el texto generado anteriormente ni mantener estado oculto, lo que explica la diferencia en GSM8K. Para matematicas, la evaluacion puntua la primera respuesta emitida.

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 8.015.581.184 parametros. En FP16, el peso ocupa aproximadamente 16 GB, por lo que se necesitan al menos 20-24 GB de VRAM para inferencia con margen para activaciones.
- GPU recomendadas: NVIDIA A100 (40 GB o 80 GB), RTX 4090 (24 GB), o GPUs con al menos 24 GB de VRAM para inferencia en FP16.
- En consumer GPU: cabe en una RTX 4090 (24 GB) con FP16, pero sin espacio para batch grande. Con cuantizacion a 8 bits o 4 bits (si estuviera disponible) podria ejecutarse en GPUs de 16 GB o menos.
- Opciones de despliegue: al ser un modelo de transformers, puede utilizarse con las librerias estandar de HuggingFace. Para diffusion language models, el soporte en vLLM, TGI u Ollama no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponible. Los modelos de difusion suelen tener latencia mayor que los autoregresivos debido al proceso iterativo de desenmascarado.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | GSM8K | Licencia |
|---|---|---|---|---|---|
| albertge/llada-8b-full-sft-mix60k-4pass | 8B | Diffusion LM | 1024 tokens | 63,46 | no disponible |
| GSAI-ML/LLaDA-8B-Base | 8B | Diffusion LM | no disponible | no disponible | no disponible |
| LLaDA-MoE-7B-A1B-Instruct | 7B (1B activos) | Diffusion LM MoE | no disponible | no disponible | no disponible |
| LLaMA3 8B | 8B | Autoregressive | 8K | no disponible | Meta license |

La comparativa con LLaMA3 8B es relevante porque el paper original de LLaDA indica que el modelo base rivaliza con LLaMA3 8B en rendimiento. Sin embargo, este fine-tuning especifico en matematicas y codigo muestra resultados modestos en GSM8K (63,46) en comparacion con modelos autoregresivos de tamano similar que suelen superar el 70-80% en esta tarea.

## Limitaciones y advertencias

- Rendimiento limitado en matematicas: los resultados en GSM8K (63,46) y MATH500 (21,8) son significativamente inferiores a los de modelos autoregresivos de tamano comparable, lo que limita su uso en aplicaciones de razonamiento avanzado.
- Licencia no disponible: no se especifica la licencia del modelo, lo que impide conocer las restricciones de uso comercial y redistribucion.
- Modelo de investigacion: esta diseñado como control experimental para un paper academico, no como modelo de produccion. Puede presentar problemas de robustez y generalizacion.
- Limitacion de contexto: la ventana de 1024 tokens de completacion es corta para aplicaciones que requieran generar documentos extensos o mantener conversaciones largas.
- Idiomas no especificados: no se indica que idiomas soporta, aunque al estar basado en LLaDA-8B-Base probablemente tenga capacidades multilingues limitadas.
- Riesgo de alucinacion: como todos los modelos de lenguaje, puede generar contenido falso o inventado, especialmente en tareas de razonamiento donde su rendimiento es limitado.
- Sin soporte de tool calling ni function calling: no se menciona esta capacidad en la informacion disponible.
- Generacion lenta: los modelos de difusion requieren multiples pasos de desenmascarado, lo que resulta en una generacion mas lenta que los modelos autoregresivos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/albertge/llada-8b-full-sft-mix60k-4pass
- Modelo base GSAI-ML/LLaDA-8B-Base: https://huggingface.co/GSAI-ML/LLaDA-8B-Base
- Repositorio del autor (d1-registers): https://github.com/lbertge/d1-registers
- Repositorio oficial de LLaDA: https://github.com/ML-GSAI/LLaDA
- Variante con registros del mismo autor: https://huggingface.co/albertge/llada-8b-dllm-registers-mix60k-r4t4
- Dataset mix60k-math-code-sft: https://huggingface.co/albertge/mix60k-math-code-sft
