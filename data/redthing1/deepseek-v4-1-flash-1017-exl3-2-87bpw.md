# redthing1/DeepSeek-V4.1-Flash-1017-EXL3-2.87bpw

## Resumen

DeepSeek-V4.1-Flash-1017-EXL3-2.87bpw es una cuantización comunitaria del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por el usuario redthing1 en HuggingFace. Se trata de una versión comprimida en formato EXL3 a 2,87 bits por peso (bpw), destinada a ejecutarse eficientemente con la librería ExLlamaV3 sobre GPU. El modelo base es un modelo de lenguaje de arquitectura MoE (mixture of experts) con capacidades de imagen-texto-a-texto, es decir, admite entradas multimodales que combinan imágenes y texto.

La relevancia de esta release no está tanto en el modelo base como en el proceso de cuantización: el autor emplea un motor propio llamado Quantseek, con calibración orientada a preservar razonamiento extendido, uso de herramientas y depuración, y valida la fidelidad mediante KL de vocabulario completo (129.280 tokens) frente a otras cuantizaciones comunitarias, obteniendo entre un 6,8% y un 46,7% menos de divergencia KL. Esto lo convierte en una opción interesante para quien necesite ejecutar el modelo en local con la máxima fidelidad posible a este nivel de compresión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (deepseek_v41), multimodal (image-text-to-text) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo base es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 2,87 bpw |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato EXL3 para ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-V4.1-Flash-1017, es un modelo de arquitectura MoE de la familia DeepSeek con capacidades multimodales (clasificado con el pipeline image-text-to-text). No se han publicado en la información disponible detalles sobre el número total de parámetros, parámetros activos por token, tamaño de ventana de contexto ni composición del dataset de entrenamiento.

Esta ficha corresponde a una cuantización EXL3 a 2,87 bpw producida con Quantseek, el motor de calibración del autor. El proceso de cuantización se calibró con proyectos de ingeniería de gran envergadura que ejercitan razonamiento extendido, manejo consistente de restricciones, integración de evidencia, uso de herramientas y recuperación ante fallos: solvers SAT con aprendizaje por conflictos, asignadores de registros que minimizan spills de memoria, solvers de flujo de coste mínimo con ciclos de coste negativo e índices de texto que equilibran memoria de construcción frente a coste de consulta. Las historias completas conservan razonamiento, implementación, resultados de herramientas y depuración, y la fidelidad se mide comparando probabilidades sobre los 129.280 tokens posibles del vocabulario.

## Capacidades

- Generación de texto y razonamiento extendido: la cuantización está calibrada específicamente para preservar el comportamiento de razonamiento del modelo base en sesiones largas.
- Uso de herramientas (tool calling): la calibración incluye historias completas con llamadas a herramientas, resultados y depuración.
- Multimodalidad: el modelo base admite entradas de imagen y texto (pipeline image-text-to-text).
- Tareas de ingeniería exigentes: resolución de problemas de algoritmia (SAT, flujos de coste mínimo, asignación de registros, índices de texto) según el material de calibración empleado.
- Capacidades multilingües: no disponible.
- Modo de pensamiento (thinking mode): el modelo base dispone de razonamiento según se desprende de las evaluaciones comparadas, aunque los detalles no están disponibles.

## Casos de uso

- Ejecución local en GPU de un modelo MoE grande: el formato EXL3 a 2,87 bpw reduce drásticamente la memoria necesaria respecto a los pesos originales, permitiendo inferencia en estaciones de trabajo con GPU de gama alta.
- Asistentes de programación con razonamiento profundo: la calibración sobre historias de depuración y desarrollo lo hace adecuado para agentes de código que necesitan mantener coherencia a lo largo de sesiones largas con herramientas.
- Agentes con tool calling: al preservarse las historias completas de uso de herramientas, es apto para pipelines agénticos de múltiples pasos con recuperación ante errores.
- Análisis de documentos e imágenes: gracias a su naturaleza multimodal, puede usarse para responder preguntas sobre documentos con imágenes o capturas.
- Resolución de problemas algorítmicos y matemáticos: los solvers usados en calibración (SAT, flujos, asignación de registros) sugieren idoneidad para tareas de ciencias de la computación.
- Investigación en cuantización: la metodología abierta con métricas KL de vocabulario completo es útil como referencia para comparar calidad entre cuantizaciones comunitarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta cuantización. La model card sí publica métricas de fidelidad (KL de vocabulario completo, menor es mejor) frente a otras cuantizaciones EXL3 del mismo modelo base:

| Release | Flow | Text | Long text | SAT | Register |
| --- | ---: | ---: | ---: | ---: | ---: |
| Esta cuantización (2,87 bpw) | 0,01994 | 0,01048 | 0,01040 | 0,01453 | 0,01205 |
| LibertAI 2,9 bpw | 0,02912 | 0,01780 | 0,01888 | 0,02237 | 0,02263 |
| jayleaton 2,8 bpw | 0,02861 | 0,01705 | 0,01762 | 0,02082 | 0,02159 |
| sudoingx 2,8 bpw | 0,02141 | 0,01260 | 0,01313 | 0,01773 | 0,01590 |
| HeNryous 2,75 bpw | 0,02158 | 0,01258 | 0,01316 | 0,01817 | 0,01569 |
| EAQ v1 2,9 bpw | 0,02781 | 0,01684 | 0,01781 | 0,02087 | 0,02085 |
| EAQ v1.1 2,9 bpw | 0,02652 | 0,01635 | 0,01770 | 0,02057 | 0,02072 |

## Requisitos de hardware

- El repositorio ocupa 206,7 GB, por lo que la inferencia requiere un sistema con al menos ~210 GB de VRAM total o una combinación de VRAM y RAM con descarga de capas (offload).
- Con ~207 GB de pesos, no cabe en una única GPU de consumo (una RTX 4090 con 24 GB queda muy lejos); se necesitan configuraciones multi-GPU (por ejemplo, 4-6 GPUs de 48 GB tipo A6000/L40S, o A100/H100 de 80 GB en configuración multi-GPU) o soluciones tipo Mac Studio con memoria unificada de gran capacidad.
- Requiere la librería ExLlamaV3 (library_name: exllamav3); no es un GGUF estándar, por lo que no funciona con llama.cpp u Ollama directamente.
- Opciones de despliegue: ExLlamaV3 es el runtime previsto; no se mencionan compatibilidades con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Comparativa con otras cuantizaciones EXL3 del mismo modelo base publicadas en HuggingFace:

| Cuantización | bpw | KL media (5 tareas, aprox.) | Enlace |
|---|---|---|---|
| Esta (redthing1) | 2,87 | ~0,0135 | https://huggingface.co/redthing1/DeepSeek-V4.1-Flash-1017-EXL3-2.87bpw |
| sudoingx | 2,8 | ~0,0162 | https://huggingface.co/sudoingx/DeepSeek-V4.1-Flash-1017-EXL3-2.8bpw |
| HeNryous | 2,75 | ~0,0162 | https://huggingface.co/HeNryous/DeepSeek-V4.1-Flash-1017-EXL3-2.75bpw-DGX-Spark |
| jayleaton | 2,8 | ~0,0195 | https://huggingface.co/jayleaton/DeepSeek-V4.1-Flash-1017-EXL3-2.8bpw |
| LibertAI | 2,9 | ~0,0222 | https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw |
| EAQ v1.1 | 2,9 | ~0,0203 | https://huggingface.co/Mia-AiLab/DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1.1-2.9-bpw |

Según los datos del autor, esta cuantización logra la menor divergencia KL en las cinco tareas evaluadas pese a no ser la de mayor bpw, lo que sugiere una mejor preservación de las capacidades del modelo original a coste de memoria similar. Comparación con el modelo base sin cuantizar u otras familias de modelos: no disponible.

## Limitaciones y advertencias

- Es una cuantización agresiva (2,87 bpw): aunque las métricas KL son favorables, toda compresión a menos de 3 bits introduce degradación respecto al modelo original, especialmente en tareas muy sensibles a la precisión numérica.
- Las métricas de fidelidad proceden del propio autor de la cuantización y comparan distribuciones de siguiente token, no resultados en tareas de usuario final; conviene validar el comportamiento en el caso de uso concreto antes de pasar a producción.
- Sesgos conocidos: no disponible; hereda los sesgos del modelo base DeepSeek-V4.1-Flash-1017, sobre los que no se aporta documentación aquí.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje; no hay datos específicos para esta cuantización.
- Limitaciones de contexto e idioma: no disponibles en la información proporcionada.
- Restricciones de licencia: la licencia MIT es muy permisiva y permite uso comercial; no obstante, debe verificarse la licencia del modelo base original, que podría imponer condiciones adicionales.
- Requiere ExLlamaV3, lo que limita el ecosistema de despliegue respecto a formatos como GGUF.
- Los datos del modelo (fecha de creación en 2026, versión V4.1-Flash) corresponden a la model card publicada; algunos detalles técnicos del modelo base no están documentados en la información disponible.

## Enlaces

- Modelo cuantizado: https://huggingface.co/redthing1/DeepSeek-V4.1-Flash-1017-EXL3-2.87bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- LibertAI 2,9 bpw: https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw
- jayleaton 2,8 bpw: https://huggingface.co/jayleaton/DeepSeek-V4.1-Flash-1017-EXL3-2.8bpw
- sudoingx 2,8 bpw: https://huggingface.co/sudoingx/DeepSeek-V4.1-Flash-1017-EXL3-2.8bpw
- HeNryous 2,75 bpw: https://huggingface.co/HeNryous/DeepSeek-V4.1-Flash-1017-EXL3-2.75bpw-DGX-Spark
- EAQ v1 2,9 bpw: https://huggingface.co/Mia-AiLab/DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1-2.9-bpw
- EAQ v1.1 2,9 bpw: https://huggingface.co/Mia-AiLab/DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1.1-2.9-bpw
- Scorer DGX Spark referenciado: https://github.com/sudoingX/dgx-spark-deepseek-v41/blob/379edd6aec5b3c41569c45b61745dd034d3df574/scripts/quantize/p4_kld.py
