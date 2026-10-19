# bartowski/InternScience_MLExpert-GGUF

## Resumen

InternScience/MLExpert es un modelo de lenguaje de 34.660.610.688 parámetros totales (≈34,66B; el autor lo denomina 35B) con arquitectura Mixture-of-Experts, orientado a la ingeniería autónoma de machine learning. Está diseñado para organizar experimentos, escribir y revisar código y mejorar soluciones mediante interacción sostenida con entornos de ejecución, dentro de la línea AI4AI (IA para desarrollar IA).

El repositorio analizado es una cuantización GGUF de bartowski del checkpoint original de InternScience. Incluye desde bf16 hasta formatos Q4/IQ4, con imatrix y llama.cpp b11716, lo que permite ejecutarlo en GPUs de consumo con las cuantizaciones más pequeñas. La licencia Apache-2.0 facilita su integración, aunque el contexto, los idiomas y los parámetros activos no están documentados.

Su relevancia actual está en el uso de agentes para automatizar bucles de experimentación y desarrollo de modelos, un escenario donde el tool calling y la interacción con ejecución importan más que la generación de texto aislada. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE); no se detallan capas, atención ni número de expertos |
| Parámetros totales | 34.660.610.688 (≈34,66B; el autor indica 35B) |
| Parámetros activos | no disponible (modelo MoE; no se especifica cuántos se activan por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, IQ4_NL, Q4_1, Q4_K_S, Q4_0, IQ4_XS; lista parcial, la model card se corta en IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (incluye bf16 GGUF y cuantizaciones); checkpoint base en safetensors según los metadatos |
| Tarea principal | text-generation; agente para ingeniería de machine learning |
| Modelo base | InternScience/MLExpert |
| Cuantizador | bartowski, con llama.cpp b11716 e imatrix |
| Decodificación especulativa | no |
| Tamaño del repositorio | 566,6 GB |

## Arquitectura y entrenamiento

MLExpert es un modelo MoE de 35B orientado a machine learning engineering agentic. El entrenamiento descrito combina SFT jerárquico de agentes, para desarrollar uso general de herramientas y habilidades de optimización específicas de dominio, con Windowed Interaction Reinforcement Learning, que busca mejorar el comportamiento a lo largo de interacciones sostenidas con entornos de ejecución. El modelo organiza experimentos, escribe y revisa código y refina soluciones a partir de la retroalimentación del entorno.

No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset, número de expertos, dimensión de las capas ni detalles de RLHF/DPO. La cuantización usa imatrix y llama.cpp b11716; la model card indica que no emplea decodificación especulativa.

## Capacidades

- Generación de texto y conversación multi-turno, con formato de prompt ChatML y bloque `<think>` al inicio de la respuesta del asistente.
- Soporte de tool calling y function calling mediante un formato XML estricto con etiquetas `<tool_call>`, `<function>` y `<parameter>`.
- Comportamiento agentic y multi-step: planificación de experimentos, ejecución de acciones, lectura de resultados y revisión iterativa.
- Ingeniería de machine learning: escritura, revisión y depuración de código para entrenamiento, evaluación y pipelines.
- Uso de herramientas externas y entornos de ejecución, incluyendo funciones definidas por el usuario en el prompt de sistema.
- Capacidades de código y tool-use reforzadas por el entrenamiento con reinforcement learning, según la información del autor.
- Entrada solo texto; no se documentan visión, audio ni otras modalidades.
- Capacidades multilingües: no disponible.

## Casos de uso

- Automatización de experimentos de ML: el agente recibe un objetivo, propone configuraciones, lanza ejecuciones mediante tool calling, lee métricas y revisa el código generado. Es adecuado por su entrenamiento específico en MLE y su interacción con entornos de ejecución.
- Depuración y reparación de código: interpreta trazas de error, localiza fallos en scripts de entrenamiento y aplica parches; después puede reejecutar pruebas mediante herramientas externas.
- Optimización de pipelines de entrenamiento: ajusta hiperparámetros, compara resultados entre ejecuciones y documenta las decisiones en un bucle de búsqueda con presupuesto limitado.
- Copiloto de MLOps: consulta el estado de jobs, lanza pipelines y genera informes técnicos mediante funciones expuestas al modelo; el tag `endpoints_compatible` facilita su integración en servicios.
- Revisión de código y reproducibilidad: revisa repositorios, detecta fuentes de no determinismo y propone pruebas de regresión para experimentos de machine learning.
- Automatización de CI/CD para modelos: ejecuta tests de evaluación, detecta regresiones de métricas y sugiere correcciones antes de desplegar un nuevo checkpoint.
- Asistente técnico para investigación: genera documentación de experimentos, planes de ablación y explicaciones de resultados; está limitado a entrada de texto y a un contexto no documentado.
- Evaluación de agentes en sandbox: permite medir tool use, planificación y recuperación de errores en entornos controlados, aunque no se han publicado benchmarks específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

La VRAM estimada es orientativa y se calcula a partir del tamaño del archivo GGUF más un margen para runtime, contexto y lote. Al no estar documentada la longitud de contexto, el margen real puede variar.

| Cuantización | Tamaño del archivo | VRAM estimada | GPUs orientativas |
|---|---:|---:|---|
| IQ4_XS | 19,89 GB | 22-25 GB | RTX 3090/4090 de 24 GB |
| Q4_K_S | 20,95 GB | 23-26 GB | RTX 3090/4090 de 24 GB |
| Q4_K_M | 22,32 GB | 24-28 GB | RTX 4090 de 24 GB con contexto corto; GPU de 32 GB o más |
| Q5_K_M | 26,98 GB | 30-34 GB | GPU de 32-48 GB |
| Q6_K | 30,74 GB | 34-38 GB | GPU de 48 GB |
| Q8_0 | 36,91 GB | 40-44 GB | A100 80 GB, L40S 48 GB ajustado |
| bf16 | 69,38 GB | 74-80 GB | A100 80 GB, H100 80 GB |

- En GPU de consumo de 24 GB caben IQ4_XS y Q4_K_S; Q4_K_M puede requerir contexto reducido o offload parcial.
- Para Q5 y Q6 se recomienda una GPU de 32-48 GB; para bf16, una GPU de 80 GB.
- En CPU, llama.cpp puede ejecutar las cuantizaciones Q4 con 32 GB de RAM como mínimo orientativo, aunque el rendimiento depende del hardware.
- Opciones de despliegue: llama.cpp b11716 o posterior, Ollama, LM Studio, Jan y servidores compatibles con GGUF y API de estilo OpenAI.
- Para vLLM o TGI no se confirma soporte de estas cuantizaciones GGUF concretas; sería necesario partir del checkpoint original o de una integración GGUF validada.
- No se dispone de datos de latencia ni throughput. El rendimiento dependerá del número de expertos activos, que no está documentado, y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MLExpert (GGUF) | 34,66B totales; activos no disponibles | no disponible | Apache-2.0 | GGUF en Hugging Face |
| Alternativas comparables de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de alternativas concretas en la información proporcionada. Por categoría, MLExpert se sitúa entre modelos MoE de aproximadamente 35B orientados a agentes de código e ingeniería de ML, pero no se aportan nombres, parámetros, contexto ni resultados de rendimiento de otros modelos para establecer una comparación fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se han publicado evaluaciones específicas de sesgo.
- Riesgo de alucinación inherente; en tareas de MLE es necesario validar los resultados contra ejecución real y no aceptar métricas o conclusiones sin comprobación.
- Longitud de contexto no documentada: no se puede garantizar planificación de horizonte largo ni conversaciones multi-turno extensas.
- Idiomas soportados no documentados: no debe asumirse un rendimiento multilingüe equivalente al de modelos generalistas.
- La licencia Apache-2.0 permite uso comercial, pero este repositorio es una cuantización de terceros; conviene conservar los avisos de licencia y revisar los términos del modelo base.
- Las cuantizaciones Q4 e IQ4 pueden degradar el tool calling y el razonamiento; si hay VRAM suficiente, Q5 o Q6 son preferibles.
- El formato de tool calling es estricto; errores en las etiquetas XML pueden romper el bucle del agente.
- El modelo puede ejecutar código y acciones en entornos reales: debe utilizarse con sandbox, permisos mínimos y revisión humana.
- El repositorio ocupa 566,6 GB; conviene descargar únicamente el archivo de cuantización necesario.
- La model card está truncada y faltan datos sobre contexto, idiomas, parámetros activos y benchmarks, lo que limita una evaluación previa a producción.

## Enlaces

- [Repositorio GGUF de bartowski](https://huggingface.co/bartowski/InternScience_MLExpert-GGUF)
- [Modelo base InternScience/MLExpert](https://huggingface.co/InternScience/MLExpert)
- [Repositorio GitHub de MLExpert](https://github.com/InternScience/MLExpert)
- [README del repositorio GitHub](https://github.com/InternScience/MLExpert/blob/main/README.md)
- [Paper arXiv 2610.22344v1](https://arxiv.org/abs/2610.22344v1)
- [Release de llama.cpp b11716](https://github.com/ggml-org/llama.cpp/releases/tag/b11716)
- [Cuantización Q4_K_M directa](https://huggingface.co/bartowski/InternScience_MLExpert-GGUF/blob/main/InternScience_MLExpert-Q4_K_M.gguf)
- [Perfil de bartowski en Hugging Face](https://huggingface.co/bartowski)
