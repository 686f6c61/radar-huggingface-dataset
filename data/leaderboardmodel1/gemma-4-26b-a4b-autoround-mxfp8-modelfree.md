# LeaderboardModel1/gemma-4-26B-A4B-AutoRound-MXFP8-ModelFree

## Resumen

Este modelo es una cuantización MXFP8 del modelo base `google/gemma-4-26B-A4B` de Google, generada automáticamente por la herramienta `agent_optimize` de Intel, integrada en el ecosistema AutoRound. El resultado es un modelo de texto con 25.805.936.206 parámetros totales, que corresponde a una arquitectura Mixture-of-Experts (MoE) con 4.000 millones de parámetros activos por token. La cuantización reduce el tamaño del repositorio a 27,9 GB, lo que facilita su despliegue en hardware con VRAM limitada en comparación con la versión original en BF16.

El modelo base Gemma 4 26B A4B es un modelo de lenguaje de última generación desarrollado por Google DeepMind, con una ventana de contexto de hasta 256.000 tokens y soporte multilingüe en más de 140 idiomas. Esta versión cuantizada mantiene las capacidades del modelo original, aunque con una ligera degradación de precisión inherente a la cuantización. Es relevante porque permite ejecutar un modelo de 26B en GPUs de consumo medio-alto, manteniendo un rendimiento competitivo en tareas de razonamiento, código y generación de texto.

La cuantización MXFP8 (formato de punto flotante de 8 bits con mantisa y exponente mixtos) es una técnica de compresión que reduce el peso de los parámetros a la mitad del tamaño original, manteniendo una buena relación entre precisión y eficiencia. El modelo se distribuye en formato `safetensors` y es compatible con los principales frameworks de inferencia como Transformers y vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MoE) |
| Parametros totales | 25.805.936.206 |
| Parametros activos | 4.000.000.000 (aprox., segun modelo base) |
| Longitud de contexto | 256.000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | MXFP8 (8 bits) |
| Idiomas soportados | No disponible (heredados del modelo base: mas de 140 idiomas) |
| Licencia | No disponible (seguir la licencia del modelo base `google/gemma-4-26B-A4B`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-26B-A4B` es un transformer con arquitectura Mixture-of-Experts (MoE) que activa solo 4.000 millones de parámetros por token, lo que permite un alto rendimiento con un coste computacional reducido. El modelo original fue entrenado por Google DeepMind con un enfoque en razonamiento, codificación y generación de texto, y soporta una ventana de contexto de 256.000 tokens. No se dispone de detalles específicos sobre el dataset de entrenamiento ni sobre el proceso de alineación (RLHF/DPO) en la información proporcionada.

Esta versión cuantizada se ha generado mediante la herramienta `agent_optimize` de Intel, que utiliza el algoritmo AutoRound (descrito en el paper arXiv:2309.05516) para optimizar el redondeo de los pesos durante la cuantización. El esquema MXFP8 emplea una representación de punto flotante de 8 bits con componentes de mantisa y exponente mixtos, lo que reduce el tamaño de los pesos a la mitad respecto a BF16. No se ha realizado ningún entrenamiento adicional; se trata de una cuantización post-entrenamiento que preserva las capacidades del modelo original con una pérdida mínima de precisión.

## Capacidades

- Generación de texto y conversación: el modelo es capaz de mantener diálogos multi-turno coherentes y contextualmente relevantes.
- Razonamiento y resolución de problemas: gracias a la arquitectura MoE y al entrenamiento del modelo base, muestra competencia en tareas de razonamiento lógico y matemático.
- Generación de código: soporta la creación de código en múltiples lenguajes de programación, así como la explicación y depuración de código existente.
- Comprensión de documentos largos: con una ventana de contexto de 256.000 tokens, puede procesar y razonar sobre documentos extensos, como informes técnicos o libros completos.
- Multilingüismo: hereda del modelo base el soporte para más de 140 idiomas, aunque la información específica de esta versión cuantizada no está disponible.
- Modo de razonamiento explícito: según la documentación de Gemma 4, el modelo puede activar un modo de razonamiento que mejora la resolución de problemas complejos a costa de mayor latencia y consumo de tokens.
- Tool calling y function calling: aunque no se confirma explícitamente en la model card, el modelo base Gemma 4 está diseñado para integrarse con herramientas y agentes, por lo que es probable que esta capacidad se mantenga en la versión cuantizada.

## Casos de uso

- Despliegue en entornos con VRAM limitada: gracias a la cuantización MXFP8, el modelo puede ejecutarse en GPUs con 32 GB de VRAM (como A100 40GB o RTX 4090 con 24GB no es suficiente, pero sí en configuraciones de 32GB o con offloading). Es adecuado para equipos que necesitan un LLM de alto rendimiento sin adquirir hardware de gama alta.
- Generación de código en producción: el modelo puede integrarse en pipelines de CI/CD para autocompletar código, generar documentación técnica o revisar pull requests, aprovechando su capacidad de razonamiento y su ventana de contexto para analizar repositorios completos.
- Asistente de atención al cliente: con su capacidad de mantener conversaciones multi-turno y su soporte multilingüe, puede gestionar consultas de usuarios en varios idiomas, manteniendo el contexto de la conversación durante largas interacciones.
- Análisis de documentos legales o financieros: la ventana de contexto de 256K tokens permite procesar contratos extensos, informes anuales o expedientes, extrayendo información relevante y respondiendo preguntas específicas sobre el contenido.
- Tutoría y educación: el modelo puede actuar como tutor virtual explicando conceptos de matemáticas, ciencias o programación, adaptando sus respuestas al nivel del estudiante gracias a su capacidad de razonamiento.
- Investigación y resumen de literatura: puede resumir artículos científicos, comparar metodologías y extraer conclusiones de papers extensos, facilitando la revisión bibliográfica en entornos académicos.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación sobre varias tareas. Se presentan los principales indicadores:

| Tarea | Precisión |
|---|---|
| gsm8k | 0,7346 |
| hellaswag | 0,6361 |
| mmlu (global) | 0,7446 |
| mmlu_stem | 0,6873 |
| mmlu_humanities | 0,6616 |
| mmlu_social_sciences | 0,8651 |
| mmlu_other | 0,8091 |
| piqa | 0,8232 |

Además, se incluyen resultados detallados para las 57 subcategorías de MMLU, con valores que oscilan entre 0,2972 (moral_disputes) y 0,9444 (high_school_geography). No se dispone de comparación con el modelo base sin cuantizar ni con otras versiones cuantizadas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repositorio es de 27,9 GB, por lo que se necesitan al menos 28 GB de VRAM para cargar los pesos en memoria, más overhead para activaciones y KV cache. Se recomienda una GPU con 32 GB o más.
- GPUs recomendadas: NVIDIA A100 40GB, A100 80GB, H100 80GB, o configuraciones multi-GPU (por ejemplo, dos RTX 4090 de 24GB con tensor parallelism).
- Compatibilidad con GPUs de consumo: una RTX 4090 (24GB) no es suficiente para cargar el modelo completo; se necesitaría offloading de CPU o cuantización adicional. Una RTX 3090 (24GB) tampoco es suficiente. GPUs con 32GB como la V100 de 32GB o la A40 podrían funcionar.
- Opciones de despliegue: compatible con Transformers (cargando con `AutoModelForCausalLM`), vLLM (comando `vllm serve`), y potencialmente con llama.cpp si se convierte a GGUF, aunque no se menciona en la documentación.
- Latencia y throughput: no se proporcionan datos específicos. En vLLM con una sola GPU A100 40GB, se puede esperar un throughput de decenas de tokens por segundo, dependiendo de la longitud de la secuencia y el número de requests concurrentes.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Cuantización | Licencia |
|---|---|---|---|---|---|
| gemma-4-26B-A4B (base) | 26B | 4B | 256K | BF16 | Gemma Terms of Use |
| gemma-4-26B-A4B-AutoRound-MXFP8 (este) | 25,8B | 4B | 256K | MXFP8 | No disponible (seguir la del base) |
| gemma-4-26B-A4B-it-AutoRound-W4A16-RTN | 26B | 4B | 256K | W4A16 (4 bits) | No disponible (seguir la del base) |

No se dispone de datos de rendimiento comparativos entre estas versiones cuantizadas. La versión W4A16 (4 bits) tendría un tamaño aún menor, pero con mayor pérdida de precisión. La elección entre MXFP8 y W4A16 dependerá del equilibrio entre calidad y requisitos de memoria.

## Limitaciones y advertencias

- La model card advierte que el modelo puede producir salidas factualmente incorrectas y no debe utilizarse como fuente de información veraz.
- Existe riesgo de generar contenido sesgado, ofensivo o inapropiado, especialmente si se despliega sin una evaluación de seguridad previa.
- La cuantización MXFP8 introduce una ligera degradación de precisión respecto al modelo original, que puede ser más notable en tareas de razonamiento complejo o matemáticas avanzadas.
- La licencia no está especificada en la ficha; se debe consultar la licencia del modelo base `google/gemma-4-26B-A4B` (Gemma Terms of Use) y cumplir con sus restricciones, que incluyen limitaciones para uso comercial en ciertos casos.
- No se dispone de información sobre los idiomas soportados específicamente en esta versión cuantizada, aunque se heredan del modelo base.
- El modelo no ha sido evaluado en tareas de seguridad, sesgos o robustez; se recomienda realizar pruebas adicionales antes de su uso en producción.

## Enlaces

- [HuggingFace - modelo cuantizado](https://huggingface.co/LeaderboardModel1/gemma-4-26B-A4B-AutoRound-MXFP8-ModelFree)
- [HuggingFace - modelo base](https://huggingface.co/google/gemma-4-26B-A4B)
- [HuggingFace - versión instruction-tuned del base](https://huggingface.co/google/gemma-4-26B-A4B-it)
- [Paper AutoRound (arXiv:2309.05516)](https://arxiv.org/abs/2309.05516)
- [Repositorio AutoRound en GitHub](https://github.com/intel/auto-round)
- [Intel Low-Bit Open LLM Leaderboard](https://huggingface.co/spaces/Intel/low_bit_open_llm_leaderboard)
- [Página oficial de Gemma 4 en Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
