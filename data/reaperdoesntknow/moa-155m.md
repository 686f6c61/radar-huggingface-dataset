# reaperdoesntknow/MoA-155M

## Resumen

El modelo MoA-155M, publicado por el usuario reaperdoesntknow en Hugging Face, es un modelo de generación de texto en inglés con 155 millones de parámetros (según su nombre, aunque no se confirma oficialmente). Forma parte del portafolio de Convergent Intelligence LLC, que desarrolla modelos bajo el marco teórico denominado Discrepancy Calculus (DISC), un enfoque matemático para analizar la discrepancia entre el comportamiento esperado y el real de un modelo durante el entrenamiento. El modelo se entrenó con los datasets TIGER-Lab/MathInstruct y yahma/alpaca-cleaned, lo que sugiere un enfoque en razonamiento matemático e instrucciones generales.

La relevancia de este modelo reside en su tamaño compacto, que permite experimentación en entornos con recursos limitados, y en su vinculación con una línea de investigación teórica poco convencional. Sin embargo, la documentación pública es extremadamente escasa: la model card no proporciona detalles técnicos sobre arquitectura, contexto, procedimiento de entrenamiento ni evaluación. Por tanto, esta ficha se basa principalmente en los metadatos del repositorio y en las etiquetas asociadas, marcando como "no disponible" cualquier dato no confirmado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 155M (inferido del nombre, no confirmado) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el tamano del repo es 0.4 GB, pero no se especifica el formato) |

## Arquitectura y entrenamiento

No se ha publicado información oficial sobre la arquitectura del modelo. El nombre "MoA" podría sugerir una arquitectura tipo "Mixture of Agents" o "Mixture of Attention", pero no hay confirmación en la model card ni en los metadatos. Tampoco se especifica si es un transformer estándar, un modelo con atención lineal o cualquier otra variante.

En cuanto al entrenamiento, se sabe que se utilizaron dos datasets: TIGER-Lab/MathInstruct, que contiene problemas matemáticos con instrucciones, y yahma/alpaca-cleaned, una versión depurada del conjunto de instrucciones Alpaca. No se indican hiperparámetros, número de tokens, método de alineación (RLHF, DPO, etc.) ni detalles del procedimiento. La model card menciona el marco DISC, pero no aporta detalles técnicos sobre cómo se aplicó al entrenamiento.

## Capacidades

Dado que no hay documentación específica, las capacidades se infieren únicamente de los datasets de entrenamiento y del pipeline declarado (text-generation). Se puede esperar, de forma razonable, que el modelo sea capaz de:

- Generar texto en inglés de forma general.
- Responder a instrucciones de tipo chat o asistente, gracias al dataset alpaca-cleaned.
- Resolver problemas matemáticos básicos o de nivel medio, dado el dataset MathInstruct.

Sin embargo, no hay evidencia publicada sobre soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingües o modos especiales de pensamiento. Toda afirmación más allá de lo mencionado sería especulativa.

## Casos de uso

Al carecer de especificaciones detalladas, los casos de uso deben considerarse hipotéticos y basados en el tamaño del modelo y sus datos de entrenamiento. Se sugiere:

- Experimentación académica: por su tamaño reducido, puede servir para probar el marco DISC o comparar metodologías de entrenamiento en entornos de investigación con pocos recursos.
- Prototipado rápido: como modelo de generación de texto pequeño, podría integrarse en demos o pruebas de concepto donde se requiera una respuesta rápida sin necesidad de GPUs potentes.
- Aplicaciones educativas: para tareas de tutoría matemática básica, dado su entrenamiento en MathInstruct.
- Asistentes de texto simples: para responder preguntas frecuentes o generar contenido corto en inglés, aunque su capacidad de razonamiento será limitada.
- Fine-tuning posterior: al ser un modelo pequeño y con licencia Apache 2.0, se puede adaptar a tareas específicas con datasets propios.
- Benchmarking de eficiencia: útil para medir el rendimiento de frameworks de inferencia en modelos de tamaño medio-bajo.

No obstante, estos usos son conjeturas razonables; no hay documentación oficial que los respalde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar. Tampoco se comparan con otros modelos. Por tanto, no se puede evaluar su rendimiento cuantitativo.

## Requisitos de hardware

Al no conocerse la arquitectura exacta, solo se puede estimar en función del tamaño de pesos (0.4 GB). Un modelo de 155M de parámetros en precisión fp16 ocuparía aproximadamente 310 MB, por lo que podría ejecutarse en una GPU con 4 GB de VRAM o incluso en CPU con suficiente RAM. Sin embargo, no hay datos confirmados sobre latencia, throughput ni memoria real.

Opciones de despliegue: dado que usa la librería transformers, es compatible con vLLM, llama.cpp, Ollama y TGI, pero no se ha verificado su funcionamiento en ninguno de estos entornos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. No se conocen modelos equivalentes de la misma familia (MoA) ni se han publicado métricas que permitan contrastar con alternativas como GPT-2, Pythia-160M o TinyLlama. Por tanto, esta sección queda sin datos.

## Limitaciones y advertencias

- Documentación insuficiente: la model card no aporta detalles técnicos, arquitectura, contexto, ni procedimiento de entrenamiento, lo que dificulta su uso en producción.
- Riesgo de alucinación: como cualquier modelo de lenguaje pequeño, puede generar respuestas plausibles pero incorrectas, especialmente en tareas de razonamiento complejo.
- Sesgos: al entrenarse con datasets como alpaca-cleaned, puede heredar sesgos presentes en los datos originales de Alpaca.
- Limitaciones de idioma: solo se declara soporte para inglés; no se garantiza un rendimiento aceptable en otros idiomas.
- Licencia: aunque es Apache 2.0, lo que permite uso comercial, la falta de documentación técnica puede suponer un riesgo legal o de calidad.
- Sin garantías de soporte: el autor no proporciona información de contacto ni mantenimiento activo, y el modelo tiene pocos likes y descargas moderadas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/reaperdoesntknow/MoA-155M)
- [Discrepancy Calculus: Foundations and Core Theory](https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus) (DOI: 10.57967/hf/8194)
- [Dataset MathInstruct](https://huggingface.co/datasets/TIGER-Lab/MathInstruct)
- [Dataset alpaca-cleaned](https://huggingface.co/datasets/yahma/alpaca-cleaned)
