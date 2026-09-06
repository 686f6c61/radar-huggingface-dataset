# cattonpm/PlanckGPT-v0.12.0

## Resumen

PlanckGPT-v0.12.0 es una versión del modelo PlanckGPT, un proyecto de código abierto iniciado por nguyenphuminh con el objetivo de entrenar un modelo de lenguaje desde cero en un ordenador de consumo, con fines educativos y de experimentación. Según el repositorio del proyecto, el modelo tiene aproximadamente 206 millones de parámetros y se ha preentrenado sobre unos 2.000 millones de tokens del conjunto de datos Fineweb-edu.

Esta versión concreta, publicada en HuggingFace por el usuario cattonpm, se distribuye bajo licencia Apache 2.0. El repositorio ocupa 1,6 GB, pero la model card no incluye especificaciones técnicas detalladas más allá de la referencia al repositorio de GitHub.

Es relevante para desarrolladores e investigadores que quieran estudiar el proceso de entrenamiento de modelos pequeños, experimentar con técnicas de optimización o necesiten un modelo ligero para prototipos en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (GPT) según el proyecto original |
| Parametros totales | ~206 millones (según el repositorio del proyecto; no confirmado para esta versión) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

Según el repositorio del proyecto, PlanckGPT es un modelo transformer estándar con arquitectura GPT, de aproximadamente 206 millones de parámetros. Se preentrena desde cero sobre unos 2.000 millones de tokens del dataset Fineweb-edu. No se han documentado técnicas de RLHF, DPO ni innovaciones posteriores al preentrenamiento. La versión v0.12.0 no incluye información específica en su model card sobre el proceso de entrenamiento, por lo que se asume que sigue la configuración del proyecto original.

## Capacidades

- Generación de texto básica: al ser un modelo pequeño entrenado en 2.000 millones de tokens, puede producir texto coherente en tareas simples, aunque con limitaciones en razonamiento complejo.
- Razonamiento: no documentado; el tamaño reducido limita la capacidad de resolver problemas multi-paso.
- Código: no documentado.
- Matemáticas: no documentado.
- Visión: no se ha documentado soporte multimodal; el modelo está diseñado para texto.
- Tool calling / function calling: no documentado.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: no documentado; el dataset Fineweb-edu es principalmente de texto en inglés.
- Capacidades especiales: ninguna documentada (sin modo de pensamiento, audio, etc.).

## Casos de uso

- Educación y aprendizaje de LLMs: el modelo puede usarse como ejemplo práctico de entrenamiento desde cero en hardware de consumo, siguiendo el repositorio de GitHub para entender el pipeline completo de preentrenamiento.
- Prototipado rápido de aplicaciones de generación de texto: gracias a su tamaño reducido, se puede ejecutar en CPU y validar ideas de producto sin necesidad de infraestructura costosa.
- Fine-tuning en tareas específicas: al ser un modelo pequeño, es viable ajustarlo en un dataset propio con una GPU modesta, por ejemplo para clasificación de textos o generación de respuestas cortas.
- Investigación en interpretabilidad: su tamaño permite analizar activaciones y mecanismos internos con herramientas de interpretabilidad sin requerir clústeres de GPU.
- Experimentos de cuantización y optimización: sirve como banco de pruebas para técnicas de compresión, como cuantización a 8 o 4 bits, en un entorno controlado.
- Docencia en cursos de IA: los estudiantes pueden ejecutarlo localmente y comparar su comportamiento con modelos más grandes para entender las limitaciones del tamaño y los datos.
- Generación de contenido simple en entornos sin conexión: para tareas de redacción breve, como sugerencias o completado de texto, en aplicaciones que no requieren alta calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni similares para esta versión del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en fp16, 0,8 GB en fp32 y 0,2 GB en cuantización a 8 bits, sin contar el overhead del framework.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, o incluso CPU, gracias al tamaño reducido del modelo.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama baja como GTX 1650, RTX 3050 o similares.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (tras conversión), Hugging Face Transformers y TGI.
- Latencia y throughput: no disponible; no se han publicado datos de rendimiento de inferencia.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable con otros modelos. PlanckGPT tiene aproximadamente 206 millones de parámetros, pero no se han publicado benchmarks que permitan compararlo con alternativas como GPT-2 o TinyLlama. Los datos de contexto y rendimiento de esta versión no están disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al entrenarse en Fineweb-edu puede heredar sesgos presentes en dicho dataset.
- Riesgo de alucinación: alto, dado el tamaño reducido y la cantidad limitada de tokens de entrenamiento.
- Limitaciones de contexto: no disponible, pero probablemente la longitud de contexto es corta en comparación con modelos modernos.
- Limitaciones de idioma: no se ha confirmado soporte multilingüe; el dataset de entrenamiento es principalmente inglés.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones adicionales.
- Caveat para producción: no es un modelo adecuado para aplicaciones que requieran alta calidad, razonamiento complejo o soporte de herramientas; su uso se recomienda en entornos educativos o de prototipado.

## Enlaces

- HuggingFace: https://huggingface.co/cattonpm/PlanckGPT-v0.12.0
- GitHub: https://github.com/nguyenphuminh/planckgpt
- Colección en HuggingFace: https://huggingface.co/collections/cattonpm/planckgpt
