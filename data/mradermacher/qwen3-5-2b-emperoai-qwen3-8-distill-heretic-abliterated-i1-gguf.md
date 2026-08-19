# mradermacher/Qwen3.5-2B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `Qwen3.5-2B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated`, publicado por el usuario `mradermacher`. Se trata de una versión convertida a formato GGUF (para inferencia eficiente en CPU y GPU) de un modelo base creado por `insraq`, que a su vez es una destilación de parámetros completos de un modelo mayor de la familia Qwen3.8 sobre la arquitectura Qwen3.5-2B. El sufijo "Heretic-Abliterated" indica que se ha aplicado la herramienta *Heretic*, que elimina la alineación de seguridad (censura) mediante ablación direccional, una técnica conocida como "abliteration".

El modelo resultante es un LLM de aproximadamente 2 mil millones de parámetros (según el nombre, aunque el archivo safetensors del repositorio muestra una cifra mucho menor, probablemente un archivo parcial), orientado a razonamiento, matemáticas y seguimiento de instrucciones, con un énfasis en respuestas sin restricciones de seguridad. La relevancia actual radica en la creciente demanda de modelos "sin censura" para investigación y experimentación, así como en la optimización de modelos pequeños para despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer, basado en Qwen3.5) |
| Parametros totales | no disponible (el nombre sugiere ~2B; el archivo safetensors muestra 479.418, posiblemente un archivo parcial) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. Según la descripción en Friendli AI, `Qwen3.8-2B` es una destilación de parámetros completos de un modelo mayor (Qwen3.8 2.4T A95B) en la arquitectura Qwen3.5-2B, entrenado con aproximadamente 30.000 trazas de profesor que incluyen cadenas de razonamiento densas en matemáticas, razonamiento general y seguimiento de instrucciones. El proceso de "abliteration" aplicado posteriormente mediante la herramienta *Heretic* elimina la alineación de seguridad mediante ablación direccional, sin necesidad de post-entrenamiento adicional. No se han publicado detalles sobre el dataset de entrenamiento original, el número total de tokens ni el uso de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento: al ser una destilación de un modelo mayor, se espera que mantenga capacidades de razonamiento lógico y matemático, aunque no hay benchmarks publicados que lo confirmen.
- Seguimiento de instrucciones: el entrenamiento con trazas de profesor sugiere capacidad para seguir instrucciones complejas.
- Respuestas sin censura: la ablación de seguridad elimina los mecanismos de rechazo ante contenido sensible, lo que permite generar respuestas que otros modelos bloquean.
- Multilingüismo: no se ha especificado, pero los modelos Qwen suelen soportar múltiples idiomas; en este caso no hay datos.
- Tool calling y agentes: no se ha indicado soporte específico.

## Casos de uso

- Investigación en alineación y seguridad: el modelo permite estudiar los efectos de la ablación direccional en el comportamiento de un LLM, comparando respuestas antes y después de la eliminación de la censura.
- Experimentación con modelos pequeños: al ser de ~2B, es adecuado para probar técnicas de destilación y cuantización en entornos con recursos limitados.
- Generación de texto creativo sin restricciones: escritura de ficción, poesía o guiones que aborden temas tabú sin filtros.
- Análisis de sesgos y comportamientos: al carecer de alineación de seguridad, se puede analizar cómo el modelo maneja contenido controvertido, útil para estudios sociológicos o de ética de IA.
- Desarrollo de aplicaciones de rol o simulación: para chatbots o personajes que requieran respuestas sin restricciones temáticas.
- Pruebas de robustez: evaluar la capacidad del modelo para mantener coherencia y razonamiento incluso cuando se le pide generar contenido que normalmente sería rechazado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un modelo de ~2B parámetros en formato GGUF, es viable en GPUs de consumo con al menos 4-6 GB de VRAM para cuantizaciones bajas (Q2_K, IQ3_M) y 8-10 GB para cuantizaciones más altas (Q5_K_M, Q6_K).
- GPUs recomendadas: NVIDIA GTX 1660, RTX 2060, RTX 3060, RTX 4060, o superiores. También puede ejecutarse en CPU con suficiente RAM (8-16 GB) usando llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores de inferencia compatibles con GGUF como llama-cpp-python o KoboldCpp.
- Latencia y throughput: no se dispone de datos medidos; en una RTX 3060 se espera una velocidad de generación de 20-40 tokens/s con cuantización Q4_K_M, pero son estimaciones no verificadas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría. El modelo base (Qwen3.5-2B-EmperoAI) no tiene benchmarks públicos, y la versión ablacionada es un derivado no oficial. Se podría comparar con otros Qwen de 2B (como Qwen2.5-1.5B o Qwen3-2B), pero no hay datos de rendimiento para este modelo concreto.

## Limitaciones y advertencias

- El proceso de ablación (abliteration) elimina la alineación de seguridad, lo que implica que el modelo puede generar contenido ofensivo, peligroso, ilegal o éticamente cuestionable sin restricciones. No debe usarse en aplicaciones orientadas al público general sin supervisión humana.
- No se ha verificado la calidad del modelo tras la ablación; es posible que el razonamiento se degrade en ciertas áreas o que aparezcan inconsistencias.
- La licencia no está especificada, por lo que el uso comercial es incierto y podría violar los términos del modelo base (Qwen3.5) si estos no permiten derivados modificados.
- El número de parámetros real es dudoso (el archivo safetensors muestra 479.418, lo que sugiere que el repositorio puede contener solo una parte del modelo o que el dato es incorrecto). Se recomienda verificar la integridad antes de su uso.
- No hay información sobre la longitud de contexto, idiomas soportados ni capacidades multimodales; estos aspectos deben probarse empíricamente.
- Al ser una cuantización de un modelo ya destilado, puede haber pérdida adicional de calidad debido a la compresión.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.5-2B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated-i1-GGUF
- Modelo base (insraq): https://friendli.ai/models/insraq/Qwen3.5-2B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated
- Herramienta Heretic (abliteration): https://github.com/p-e-w/heretic
- Información general sobre Qwen3.5: https://lmstudio.ai/models/qwen3.5
