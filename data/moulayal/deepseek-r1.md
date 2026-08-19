# MoulayAl/DeepSeek-R1

## Resumen

DeepSeek-R1 es un modelo de razonamiento de primera generación desarrollado por DeepSeek-AI, publicado originalmente en enero de 2025 y disponible en este repositorio como mirror bajo el usuario MoulayAl. El modelo destaca por haber sido entrenado mediante aprendizaje por refuerzo (RL) a gran escala directamente sobre el modelo base, sin un paso previo de ajuste supervisado (SFT), lo que le permite generar cadenas de pensamiento (chain-of-thought) largas y reflexivas para resolver problemas complejos de matemáticas, código y razonamiento lógico. Su rendimiento es comparable al de OpenAI-o1 en dichas tareas, según la documentación oficial.

La arquitectura es un transformer de mezcla de expertos (MoE) basado en DeepSeek-V3, con 671 000 millones de parámetros totales y 37 000 millones activos por token. La longitud de contexto es de 128 000 tokens. El modelo se distribuye con pesos en formato safetensors y ocupa aproximadamente 688,6 GB en el repositorio. La licencia declarada es MIT, lo que permite uso comercial y modificación sin restricciones significativas.

Este lanzamiento es relevante porque demuestra que las capacidades de razonamiento pueden incentivarse únicamente mediante RL, sin SFT previo, y porque el propio DeepSeek-R1 se ha utilizado para destilar modelos más pequeños (1,5B a 70B) que superan a alternativas densas de tamaño similar. Para desarrolladores e investigadores, este mirror ofrece acceso directo a los pesos completos del modelo original con una licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) basado en DeepSeek-V3 |
| Parametros totales | 684 489 845 504 (aprox. 684B, incluye overhead; el modelo declara 671B) |
| Parametros activos | 37 000 millones (37B) |
| Longitud de contexto | 128 000 tokens |
| Tipos de cuantizacion | FP8 (segun tags del repositorio) |
| Idiomas soportados | no disponible (la documentacion oficial indica principalmente ingles y chino) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DeepSeek-R1 emplea una arquitectura de transformer con mezcla de expertos (MoE), donde cada token activa únicamente 37B de los 671B parámetros totales. Esta disposición permite un coste computacional por token relativamente bajo en comparación con un modelo denso del mismo tamaño, aunque los requisitos de memoria para cargar todos los pesos son elevados. El modelo base es DeepSeek-V3, y sobre él se aplicó un pipeline de post-entrenamiento que combina dos etapas de RL y dos etapas de SFT. La primera etapa de RL se aplicó directamente sobre el modelo base (dando lugar a DeepSeek-R1-Zero), y posteriormente se introdujeron datos de cold-start (SFT) para mejorar la legibilidad y evitar problemas como la repetición excesiva o la mezcla de idiomas. La segunda etapa de RL se centró en alinear el modelo con preferencias humanas y en descubrir patrones de razonamiento más efectivos.

Una innovación clave es que el modelo genera cadenas de pensamiento largas y explícitas antes de dar la respuesta final, lo que le permite autoverificarse, reflexionar y corregir errores durante la inferencia. Este comportamiento emergió de forma natural mediante RL, sin haber sido programado explícitamente. El entrenamiento utilizó datos de razonamiento generados por el propio modelo para destilar versiones más pequeñas, pero el modelo completo aquí presentado es el resultado del pipeline completo de RL y SFT.

## Capacidades

- Generación de texto con razonamiento explícito: produce cadenas de pensamiento largas y estructuradas antes de la respuesta final, lo que mejora la precisión en tareas complejas.
- Razonamiento matemático avanzado: resuelve problemas de matemáticas competitivas, demostraciones y cálculo simbólico con alta precisión.
- Generación de código: escribe, depura y explica código en múltiples lenguajes, con especial soltura en Python, C++ y Java.
- Razonamiento lógico y científico: aborda preguntas de física, lógica formal y análisis de problemas multi-paso.
- Autoverificación y reflexión: el modelo revisa sus propios pasos intermedios y corrige errores antes de emitir la respuesta final.
- Soporte de tool calling y function calling: aunque no se detalla en la documentación, al estar basado en DeepSeek-V3 hereda capacidades de invocación de herramientas y formato JSON.
- Capacidades multilingües: la documentación oficial indica soporte principal para inglés y chino, aunque no se especifican otros idiomas en la información disponible.
- Modo de razonamiento (thinking mode): el modelo puede generar un bloque de razonamiento interno antes de la respuesta, similar a OpenAI-o1.

## Casos de uso

- Resolución de problemas matemáticos avanzados: el modelo puede utilizarse como asistente para estudiantes e investigadores en áreas como álgebra, cálculo y teoría de números, generando demostraciones paso a paso y verificando resultados.
- Generación y revisión de código en producción: gracias a su capacidad de razonamiento y a la herencia de tool calling de DeepSeek-V3, puede integrarse en pipelines de CI/CD para generar tests, revisar pull requests o refactorizar código complejo.
- Sistemas de tutoría inteligente: su capacidad para explicar el razonamiento detrás de cada respuesta lo hace adecuado para plataformas educativas que necesitan mostrar el proceso de resolución, no solo el resultado final.
- Análisis de datos y razonamiento científico: puede procesar descripciones de experimentos, formular hipótesis y sugerir análisis estadísticos, útil en entornos de investigación donde se requiere trazar cadenas lógicas largas.
- Agentes autónomos con planificación multi-paso: el modelo puede descomponer tareas complejas en subtareas, ejecutar llamadas a herramientas y verificar los resultados intermedios, lo que lo hace apto para agentes de automatización de procesos.
- Investigación en IA y destilación: al ser un modelo abierto con licencia MIT, sirve como base para generar datasets de razonamiento y destilar modelos más pequeños, como ya hizo el propio DeepSeek con sus versiones distill.
- Asistencia en competiciones de programación: su capacidad para razonar sobre algoritmos y estructuras de datos permite generar soluciones óptimas y explicar la complejidad temporal y espacial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que DeepSeek-R1 alcanza un rendimiento comparable a OpenAI-o1 en tareas de matemáticas, código y razonamiento, y que la versión destilada DeepSeek-R1-Distill-Qwen-32B supera a OpenAI-o1-mini en varios benchmarks. Sin embargo, no se incluyen cifras concretas en el texto proporcionado. Se recomienda consultar el paper oficial (arXiv:2501.12948) para obtener los valores numéricos detallados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 671B parámetros en FP8, se requieren aproximadamente 671 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache. En la práctica, se necesitan múltiples GPUs.
- GPU recomendadas: no disponible. Para ejecutar el modelo completo se necesitaría un clúster con GPUs de alta capacidad, como NVIDIA H100 (80 GB) o A100 (80 GB), con al menos 9-10 GPUs en paralelo para FP8. Alternativas con cuantización más agresiva (por ejemplo, 4-bit) podrían reducir el requisito a unos 350-400 GB, pero no se proporcionan datos oficiales.
- No cabe en una GPU de consumo: el modelo es demasiado grande para cualquier GPU consumer actual (RTX 4090, 3090, etc.) incluso con cuantización extrema.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, Text Generation Inference (TGI) o llama.cpp (si se convierten los pesos a GGUF). El tag `endpoints_compatible` sugiere compatibilidad con soluciones de inferencia en la nube.
- Latencia y throughput: no disponible. Dado el tamaño y la arquitectura MoE, la latencia por token será alta en configuraciones de una sola GPU, pero puede optimizarse con paralelismo de tensor y de pipeline en entornos multi-GPU.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1 (este) | 671B | 37B | 128K | MIT | HuggingFace (mirror) |
| OpenAI-o1 | no disponible | no disponible | no disponible | propietaria | API |
| DeepSeek-R1-Distill-Qwen-32B | 32B | 32B (denso) | 128K | MIT | HuggingFace |
| Qwen2.5-72B-Instruct | 72B | 72B (denso) | 128K | Apache 2.0 | HuggingFace |

DeepSeek-R1 se diferencia de los modelos densos como Qwen2.5-72B por su arquitectura MoE, que ofrece mayor capacidad total con menor coste por token, aunque requiere mucha más memoria para cargar todos los pesos. Frente a OpenAI-o1, la ventaja principal es su licencia MIT y la disponibilidad de pesos abiertos. Las versiones destiladas (por ejemplo, la de 32B) son alternativas prácticas para entornos con menos recursos, manteniendo un rendimiento competitivo en razonamiento.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado principalmente con datos en inglés y chino, puede mostrar sesgos culturales y lingüísticos en otros idiomas. No se dispone de una evaluación detallada de sesgos en la información proporcionada.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en dominios poco representados en sus datos de entrenamiento. Su modo de razonamiento no elimina este riesgo.
- Limitaciones de contexto: aunque soporta 128K tokens, el rendimiento en tareas de recuperación de información dentro de contextos muy largos puede degradarse, como es habitual en modelos transformer.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero el modelo original de DeepSeek tiene su propia licencia (DeepSeek License) que puede diferir. Este mirror declara MIT, pero se recomienda verificar la licencia del modelo original antes de un uso comercial extensivo.
- Requisitos de hardware: el tamaño del modelo (688 GB en FP8) hace que su despliegue sea inviable en hardware de consumo y requiera infraestructura de servidor dedicada. No es adecuado para aplicaciones edge o móviles.
- Reproducibilidad: al ser un mirror de un modelo de terceros, no se garantiza que los pesos sean idénticos a los oficiales. Se recomienda verificar los checksums si se requiere integridad.
- Comportamiento de razonamiento: el modelo puede generar cadenas de pensamiento muy largas, lo que aumenta la latencia y el coste computacional por petición. En aplicaciones en tiempo real, esto puede ser un inconveniente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MoulayAl/DeepSeek-R1
- Paper oficial (DeepSeek-R1): https://arxiv.org/abs/2501.12948
- Repositorio GitHub de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Página oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
