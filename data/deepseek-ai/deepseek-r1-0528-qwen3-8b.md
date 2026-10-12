# deepseek-ai/DeepSeek-R1-0528-Qwen3-8B

## Resumen

DeepSeek-R1-0528-Qwen3-8B es un modelo de lenguaje de 8.190.735.360 parámetros (aproximadamente 8,2 mil millones) desarrollado por DeepSeek AI. Se trata de un modelo destilado: el equipo de DeepSeek ha transferido la cadena de pensamiento (chain-of-thought) generada por su modelo insignia DeepSeek-R1-0528 al modelo base Qwen3 8B Base, mediante un proceso de post-entrenamiento. En lugar de entrenar desde cero, se aprovecha el conocimiento de razonamiento de un modelo mucho mayor para dotar a un modelo compacto de capacidades de razonamiento avanzado.

El modelo resuelve el problema de disponer de razonamiento complejo (matemáticas, código, lógica) en un formato que cabe en hardware de consumo, a diferencia del DeepSeek-R1-0528 completo, que es considerablemente mayor. Según la model card, el destilado alcanza un rendimiento de estado del arte (SOTA) entre los modelos de código abierto en el benchmark AIME 2025, lo que lo posiciona como una opción atractiva para desarrolladores que quieren razonamiento tipo "thinking" sin depender de infraestructura de gran escala.

La relevancia actual reside en su licencia MIT, que permite uso comercial sin restricciones, y en su integración con el ecosistema Qwen3 (soporte de transformers, text-generation-inference y endpoints compatibles). El repositorio ocupa 16,4 GB y acumula más de 570.000 descargas y 1.109 "likes" en HuggingFace desde su publicación el 29 de mayo de 2025.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, basado en Qwen3 8B Base (no disponible el detalle exacto de capas ni atencion) |
| Parametros totales | 8.190.735.360 (aproximadamente 8,2 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | MIT |
| Formato de pesos | safetensors (biblioteca transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3 8B Base, una arquitectura transformer densa de aproximadamente 8,2 mil millones de parametros. Sobre esa base, DeepSeek aplico post-entrenamiento utilizando la destilacion de la cadena de pensamiento de DeepSeek-R1-0528: se emplean las trazas de razonamiento del modelo grande como senal de supervision para ensenar al modelo pequeno a razonar paso a paso antes de dar la respuesta final. Este procedimiento es el mismo enfoque que DeepSeek uso previamente con su familia DeepSeek-R1-Distill, pero en esta ocasion el modelo "profesor" es la version 0528 del R1.

La model card no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas adicionales como RLHF o DPO especificas para este destilado. Lo que si se indica es que el modelo hereda mejoras en profundidad de razonamiento, soporte de function calling y reduccion de la tasa de alucinacion respecto a iteraciones anteriores. La innovacion principal es, por tanto, metodologica: conseguir capacidades de razonamiento de un modelo de frontera en un modelo de 8B apto para hardware de consumo.

## Capacidades

- Generacion de texto conversacional y de proposito general.
- Razonamiento avanzado mediante modo "thinking" (cadena de pensamiento extendida antes de la respuesta).
- Matematicas de competicion: la model card lo situa como SOTA entre modelos abiertos en AIME 2025.
- Programacion y resolucion de problemas de codigo (heredado del destilado de R1).
- Soporte de function calling / tool calling, con mejoras explicitamente mencionadas respecto a versiones previas.
- Razonamiento multi-paso y adecuado para flujos de agente.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (el pipeline es text-generation unicamente).

## Casos de uso

- Razonamiento matematico asistido: resolver problemas de nivel de competicion (AIME, HMMT) o calculos de ingenieria paso a paso, aprovechando su modo de cadena de pensamiento y su rendimiento SOTA declarado en AIME 2025 en su categoria.
- Asistente de programacion en produccion: generar y revisar codigo integrandolo en pipelines de CI/CD mediante function calling, con la ventaja de que la licencia MIT permite uso comercial sin restricciones.
- Agentes autonomos de multiples pasos: el soporte de tool calling y el razonamiento multi-paso lo hacen apto para agentes que encadenan llamadas a APIs, consultan bases de datos y validan resultados intermedios.
- Analisis logico y de diagnostico: tareas que requieren descomposicion de problemas complejos (por ejemplo, depuracion de sistemas, analisis de causas raiz) donde la cadena de pensamiento explicita mejora la trazabilidad.
- Generacion de material educativo: crear explicaciones paso a paso de conceptos matematicos o tecnicos, aprovechando que el modelo expone su razonamiento.
- Prototipado local en estaciones de trabajo con GPU de consumo: al ser un modelo de ~8B, permite iterar sin depender de APIs externas ni de costes por token, util para equipos que trabajan con datos sensibles.
- Evaluacion y comparacion de tecnicas de razonamiento: como destilado de R1-0528, sirve como referencia para investigar transferencia de capacidad de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos del modelo destilado DeepSeek-R1-0528-Qwen3-8B en la informacion disponible. La model card indica unicamente que alcanza rendimiento SOTA entre modelos de codigo abierto en AIME 2025, pero el texto proporcionado queda truncado, por lo que no se puede reproducir la cifra exacta.

Los datos siguientes corresponden al modelo completo DeepSeek-R1-0528 (no al destilado de 8B) y se incluyen como referencia del "profesor" del que se transfiere la capacidad:

| Categoria | Benchmark (metrica) | DeepSeek R1 | DeepSeek R1 0528 |
|---|---|---|---|
| General | MMLU-Redux (EM) | 92,9 | 93,4 |
| General | MMLU-Pro (EM) | 84,0 | 85,0 |
| General | GPQA-Diamond (Pass@1) | 71,5 | 81,0 |
| General | SimpleQA (Correct) | 30,1 | 27,8 |
| General | FRAMES (Acc.) | 82,5 | 83,0 |
| General | Humanity's Last Exam (Pass@1) | 8,5 | 17,7 |
| Codigo | LiveCodeBench (2408-2505) (Pass@1) | 63,5 | 73,3 |
| Codigo | Codeforces-Div1 (Rating) | 1530 | 1930 |
| Codigo | SWE Verified (Resolved) | 49,2 | 57,6 |
| Codigo | Aider-Polyglot (Acc.) | 53,3 | 71,6 |
| Matematicas | AIME 2024 (Pass@1) | 79,8 | 91,4 |
| Matematicas | AIME 2025 (Pass@1) | 70,0 | 87,5 |
| Matematicas | HMMT 2025 (Pass@1) | 41,7 | 79,4 |
| Matematicas | CNMO 2024 (Pass@1) | 78,8 | 86,9 |
| Herramientas | BFCL_v3_MultiTurn (Acc.) | - | 37,0 |
| Herramientas | Tau-Bench (Pass@1) | - | 53,5 (Airline) / 63,9 (Retail) |

Nota: la model card indica que la longitud maxima de generacion fue de 64K tokens y que, para los benchmarks con muestreo, se uso temperatura 0,6, top-p 0,95 y 16 respuestas por consulta para estimar pass@1.

## Requisitos de hardware

- VRAM estimada para inferencia (a partir de 8,19 mil millones de parametros):
  - precision completa (FP32): aproximadamente 33 GB.
  - media precision (BF16/FP16): aproximadamente 16,4 GB (coincide con el tamano del repositorio).
  - cuantizacion INT8: aproximadamente 8,2 GB.
  - cuantizacion INT4: aproximadamente 4,5 GB.
- GPU recomendadas: A100, H100, L40S o similares para BF16/alta concurrencia; en consumo, RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB) permiten BF16 con margen ajustado.
- Cabe en GPU de consumo: si. En BF16 cabe en tarjetas de 24 GB (4090, 3090); en cuantizacion INT4 puede ejecutarse en GPU de 8 GB o incluso en CPU.
- Opciones de despliegue: al incluir el tag `text-generation-inference` y `transformers`, es compatible con TGI, vLLM y con runtimes de cuantizacion tipo llama.cpp u Ollama si se dispone de pesos GGUF (no confirmados en la informacion de esta ficha). Tambien admite pipelines estandar de transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-R1-0528-Qwen3-8B | ~8,2B | no disponible | MIT | Destilado de R1-0528 sobre Qwen3 8B Base; SOTA declarado en AIME 2025 entre modelos abiertos |
| Qwen3 8B | ~8B | no disponible | no disponible | Modelo base sobre el que se construye este destilado; sin destilado de razonamiento de R1 |
| DeepSeek-R1-0528 (profesor) | no disponible | no disponible | no disponible | Modelo insignia completo; mayor capacidad pero mayor coste de inferencia |

No se dispone de datos de benchmarks comparativos directos entre estos modelos dentro de la informacion proporcionada, por lo que no se pueden establecer diferencias cuantitativas de rendimiento mas alla de la afirmacion de SOTA en AIME 2025 del modelo destilado.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: la model card menciona que la version 0528 reduce la tasa de alucinacion respecto a iteraciones anteriores, pero no cuantifica el valor para el destilado; persiste el riesgo propio de los modelos de lenguaje.
- Limitaciones de contexto: la longitud de contexto del modelo destilado no se especifica; la model card solo menciona una generacion maxima de 64K tokens para la evaluacion del modelo completo, dato que no es extrapolable directamente al 8B.
- Limitaciones de idioma: los idiomas soportados no se detallan en la informacion disponible.
- Licencia: MIT, lo que permite uso comercial, modificacion y redistribucion sin las restricciones de las licencias de pesos por uso que aplican otros modelos abiertos. Aun asi, conviene revisar las condiciones del modelo base Qwen3 subyacente.
- Caveat de produccion: al ser un destilado, puede mostrar menor robustez que el modelo profesor en tareas fuera de la distribucion de su entrenamiento de razonamiento; conviene validar en el dominio concreto antes de desplegarlo.
- El modo de razonamiento extendido (thinking) incrementa el numero de tokens generados, lo que puede aumentar la latencia y el coste computacional en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-R1-0528-Qwen3-8B
- Paper de DeepSeek-R1: https://arxiv.org/pdf/2501.12948
- Sitio oficial de DeepSeek: https://www.deepseek.com/
- Plataforma y API de DeepSeek: https://platform.deepseek.com/
- Documentacion/plataforma en ingles: https://www.deepseek.com/en/platform/
- Chat de DeepSeek: https://chat.deepseek.com/
- Perfil de DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
