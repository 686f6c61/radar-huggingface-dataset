# Prannesshkva/QU-SSM-15M-TinyStories

## Resumen

QU-SSM-15M-TinyStories es un modelo de lenguaje de pequeño tamaño desarrollado por Prannesshkva, que implementa una arquitectura de espacio de estados (SSM) con una formulación matemática basada en álgebra de Lie y geometría diferencial. En lugar de utilizar la decaimiento contractivo escalar típico de los SSM convencionales, este modelo parametriza la recurrencia en el grupo de Lie SO(N) mediante la transformada de Cayley, lo que garantiza que la matriz de transición sea unitaria (norma espectral igual a 1). El modelo se entrenó desde cero sobre el dataset TinyStories, un corpus sintético de historias cortas con vocabulario comprensible para niños de 4 años, lo que permite que modelos pequeños alcancen coherencia narrativa.

A pesar de su nombre "15M", el archivo de pesos en safetensors contiene 29.778.784 parámetros totales, un tamaño que lo sitúa en la categoría de modelos muy compactos. El entrenamiento se realizó en una GPU Tesla P100 en menos de 10 minutos, con un throughput de 19.200 tokens por segundo gracias a un scan causal paralelo basado en FFT. La perplejidad final en TinyStories fue de 15,3, un resultado notable para un modelo de este tamaño. Su relevancia radica en demostrar que arquitecturas alternativas al transformer, como los SSM con propiedades unitarias, pueden entrenarse de forma eficiente y producir texto coherente con recursos mínimos.

La licencia es Business Source License 1.1 (BSL 1.1), que permite uso académico y de evaluación, pero requiere licencia comercial separada hasta que convierta a Apache 2.0 en agosto de 2030. El modelo está pensado para investigación y experimentación, no para producción comercial directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | State Space Model (SSM) con recurrencia en grupo de Lie SO(N) vía transformada de Cayley |
| Parametros totales | 29.778.784 (según safetensors; el nombre del modelo indica 15M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | Inglés (entrenado en TinyStories, corpus en inglés) |
| Licencia | Business Source License 1.1 (BSL 1.1); convierte a Apache 2.0 el 30 de agosto de 2030 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

QU-SSM emplea una arquitectura de espacio de estados con una innovación clave: la matriz de transición se construye a partir de un generador antisimétrico (skew-symmetric) perteneciente al álgebra de Lie so(N), y se convierte en una matriz ortogonal del grupo SO(N) mediante la transformada de Cayley. Esto garantiza que la norma espectral de la matriz de recurrencia sea exactamente 1, lo que evita problemas de desvanecimiento o explosión del gradiente a largo plazo. La actualización del estado oculto combina la recurrencia unitaria con una entrada modulada por una función sigmoide del delta de tiempo, similar a otros SSM como Mamba, pero sin depender de ninguna librería de Mamba.

El entrenamiento se realizó desde cero sobre el dataset TinyStories, que contiene historias cortas generadas por GPT-3.5 y GPT-4 con vocabulario restringido. Se utilizó una GPU Tesla P100-PCIE-16GB con CUDA 12.1. El proceso duró 576,72 segundos (9,61 minutos) y alcanzó un throughput de 19.200 tokens por segundo, gracias a un scan causal paralelo implementado con FFT 1D que evita bucles en Python. La pérdida de entropía cruzada inicial fue de 212,06 y la final de 2,7298, lo que supone una reducción del 98,7%. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el entrenamiento es puramente de modelado de lenguaje.

## Capacidades

- Generación de texto coherente en inglés, especializado en historias cortas y narrativa infantil (por el dataset TinyStories).
- Modelado de lenguaje autorregresivo con recurrencia de espacio de estados, capaz de procesar secuencias de forma paralela durante el entrenamiento.
- Estabilidad numérica en la recurrencia gracias a la propiedad unitaria de la matriz de transición, lo que facilita el aprendizaje de dependencias a largo plazo.
- Eficiencia computacional: el scan paralelo con FFT permite un entrenamiento rápido incluso en hardware modesto.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio. El modelo es exclusivamente de texto.

## Casos de uso

- Investigación en arquitecturas de espacio de estados: sirve como banco de pruebas para estudiar el comportamiento de SSM con matrices unitarias en tareas de generación de lenguaje, comparando con modelos transformer de tamaño similar.
- Generación de historias infantiles: puede utilizarse para crear cuentos cortos en inglés con vocabulario sencillo, adecuado para aplicaciones educativas o de entretenimiento para niños.
- Prototipado de modelos ligeros: al tener menos de 30 millones de parámetros, es ideal para experimentar con técnicas de compresión, destilación o ajuste fino en entornos con recursos limitados.
- Evaluación de métricas de perplejidad en corpus sintéticos: permite reproducir experimentos de investigación sobre el dataset TinyStories y comparar con otros modelos pequeños.
- Enseñanza de aprendizaje profundo: su implementación sencilla y su entrenamiento rápido lo convierten en un ejemplo didáctico para explicar SSM, álgebra de Lie y scan paralelo.
- Generación de texto en dispositivos edge: aunque no hay datos de cuantización, su tamaño reducido podría permitir su despliegue en CPU o microcontroladores tras una cuantización adecuada, aunque esto no está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la perplejidad en el conjunto de entrenamiento TinyStories, que alcanzó un valor de 15,3 al final del entrenamiento. No hay comparaciones con otros modelos en la model card.

## Requisitos de hardware

- El modelo tiene aproximadamente 29,8 millones de parámetros, lo que en precisión FP32 ocupa unos 119 MB de memoria. En FP16 serían unos 60 MB.
- Se entrenó en una NVIDIA Tesla P100 de 16 GB, pero para inferencia se puede ejecutar en cualquier GPU consumer con al menos 2 GB de VRAM, o incluso en CPU.
- No se proporcionan datos de latencia ni throughput en inferencia. Dado el tamaño, se espera una generación rápida en GPU modernas.
- Opciones de despliegue: al ser un modelo con pesos en safetensors y pipeline de text-generation, puede cargarse con la librería Transformers de Hugging Face, aunque requiere código personalizado (custom_code) para la arquitectura. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QU-SSM-15M-TinyStories | 29,8M (nominal 15M) | SSM con grupo SO(N) | No disponible | BSL 1.1 | Hugging Face |
| ModelCloud/tinyllama-15M-stories | 15M (aprox.) | Transformer (Llama) | No disponible | MIT | Hugging Face |
| sdobson/tinystories-llama-15m | 15M (aprox.) | Transformer (Llama) | No disponible | No disponible | Hugging Face |

Los dos modelos comparables son transformers de 15 millones de parámetros entrenados también en TinyStories. QU-SSM se diferencia por su arquitectura de espacio de estados y su licencia restrictiva (BSL 1.1 frente a MIT). No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- El modelo se entrenó exclusivamente con TinyStories, un corpus sintético de historias infantiles en inglés. Su capacidad de generalización a otros dominios o idiomas es muy limitada.
- No se han documentado sesgos específicos, pero al ser entrenado con texto generado por GPT-3.5/4, puede heredar sesgos presentes en esos modelos.
- Riesgo de alucinación: como cualquier modelo de lenguaje pequeño, puede generar contenido incoherente o factualmente incorrecto, especialmente fuera del dominio de historias infantiles.
- La licencia BSL 1.1 no permite uso comercial sin licencia adicional hasta 2030. Esto limita su adopción en productos comerciales.
- No hay información sobre la longitud de contexto soportada, lo que dificulta su uso en aplicaciones que requieran ventanas largas.
- La arquitectura requiere código personalizado (custom_code) para cargar el modelo, lo que puede complicar su integración en pipelines estándar.
- No se han publicado resultados de benchmarks externos ni evaluaciones de seguridad, por lo que su comportamiento en entornos de producción no está validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Prannesshkva/QU-SSM-15M-TinyStories
- Space de demostración (QU-SSM Studio): https://huggingface.co/spaces/Prannesshkva/QU-SSM-Studio
- Notebook de entrenamiento en Kaggle: https://www.kaggle.com/code/prannesshkva/qu-ssm-tinystories-training-p100
- Modelo comparable: https://huggingface.co/ModelCloud/tinyllama-15M-stories
- Modelo comparable: https://huggingface.co/sdobson/tinystories-llama-15m
