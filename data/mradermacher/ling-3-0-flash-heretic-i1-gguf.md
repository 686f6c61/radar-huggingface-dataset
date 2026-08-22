# mradermacher/Ling-3.0-flash-heretic-i1-GGUF

## Resumen

Ling-3.0-flash-heretic-i1-GGUF es una cuantizacion en formato GGUF del modelo Ling-3.0-flash-heretic, publicado por el usuario mradermacher en Hugging Face. El modelo original, Ling-3.0-flash, es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 124 000 millones de parametros en total y aproximadamente 5 100 millones de parametros activos por token, disenado por Inclusion AI para priorizar la eficiencia de token y la inferencia agéntica a escala de produccion. La variante "heretic" es un ajuste de dicho modelo base, y el sufijo "i1" indica que los pesos han sido cuantizados con la metodologia de imatrix (importance matrix) para mejorar la calidad de la cuantizacion.

Este repositorio concreto contiene los pesos ya convertidos a GGUF, lo que permite ejecutar el modelo en entornos de inferencia locales como llama.cpp, Ollama o LM Studio, sin necesidad de GPUs de gran capacidad. Con un tamano de repositorio de solo 0,5 GB, se trata de una cuantizacion muy agresiva, probablemente de baja precision (Q1-Q2), pensada para despliegues con recursos muy limitados. La relevancia actual del modelo radica en su capacidad para tareas de agente y razonamiento multi-paso con un coste de inferencia reducido, aunque la informacion publica sobre el modelo base es escasa y la licencia no esta especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) |
| Parametros totales | 124 B (segun fuentes externas); el repo safetensors indica 121 915 333 (dato parcial) |
| Parametros activos | ~5,1 B (segun fuentes externas) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones imatrix) |

## Arquitectura y entrenamiento

Ling-3.0-flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 124 000 millones de parametros totales y 5 100 millones de parametros activos por token. Esta arquitectura permite activar solo una fraccion de los pesos en cada inferencia, lo que reduce el coste computacional y la latencia en comparacion con un modelo denso del mismo tamano. El diseno prioriza la "inferencia agenica" (agentic inference), es decir, la capacidad de mantener multiples pasos de razonamiento y llamadas a herramientas dentro de un presupuesto de token y latencia limitado. No se han publicado detalles sobre la composicion del dataset de entrenamiento, el numero de tokens usados ni el proceso de alineacion (RLHF, DPO, etc.). La variante "heretic" es un ajuste posterior del modelo base, pero no se documentan las tecnicas de fine-tuning empleadas.

## Capacidades

- Generacion de texto y razonamiento multi-paso, orientado a escenarios de agente (agentic) donde se requiere mantener el contexto a lo largo de varias interacciones.
- Eficiencia de token: el modelo esta optimizado para completar tareas con el minimo numero de tokens de salida, lo que reduce costes de inferencia.
- Inferencia agenica: soporta flujos de trabajo que requieren llamadas a herramientas y decisiones secuenciales dentro de un presupuesto de latencia ajustado.
- Capacidades multilingues: no especificadas en la informacion disponible.
- Soporte de tool calling y function calling: no confirmado explicitamente, aunque el enfoque "agentic" sugiere compatibilidad con este tipo de flujos.
- Modo vision o audio: no disponible.

## Casos de uso

- Asistentes de codigo en produccion: el modelo puede integrarse en entornos de desarrollo como autocompletado o chat de codigo, aprovechando su diseno de eficiencia de token para reducir costes de API y latencia en flujos de trabajo interactivos.
- Agentes de automatizacion de tareas: su arquitectura MoE con pocos parametros activos permite desplegar agentes que ejecutan multiples pasos de razonamiento y llamadas a herramientas en sistemas con presupuesto de inferencia limitado.
- Chatbots de atencion al cliente: la cuantizacion GGUF ligera permite ejecutar el modelo en hardware modesto, ideal para sistemas de soporte que requieren respuestas rapidas y coherentes sin depender de servicios en la nube.
- Generacion de codigo en entornos con restricciones de VRAM: con un repositorio de 0.5 GB, se puede desplegar en GPUs de consumo o incluso en CPU, facilitando la generacion de codigo en equipos de desarrollo sin GPU dedicada.
- Razonamiento multi-paso para analisis de datos: el modelo puede estructurar secuencias de consultas y analisis en tareas de extraccion de informacion, aunque la falta de benchmarks publicos limita la validacion de su rendimiento.
- Prototipado rapido de aplicaciones de lenguaje: al ser un modelo cuantizado y distribuido en GGUF, es adecuado para experimentar con arquitecturas de agencia en entornos de desarrollo sin necesidad de infraestructura de alto coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni de otras evaluaciones comparativas para este modelo o su variante cuantizada.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 0,5 GB, lo que sugiere una cuantizacion muy agresiva (posiblemente Q1 o Q2). La carga del modelo en memoria requeriria aproximadamente entre 0,5 GB y 1 GB de VRAM, aunque el modelo original de 124B en cuantizaciones mayores necesitaria entre 60 y 80 GB.
- GPU recomendadas: para la cuantizacion incluida en este repositorio, una GPU con 4 GB de VRAM (por ejemplo, una RTX 3050 o GTX 1650) seria suficiente. Para el modelo base en cuantizaciones mas altas se requeririan GPUs como A100 o H100.
- Compatibilidad con consumer GPU: si, la cuantizacion Q1/Q2 de 0,5 GB puede ejecutarse en GPUs de consumo e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llamafile, o servidores basados en GGUF como llama-cpp-python.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con modelos similares de la misma categoria (por ejemplo, otros MoEs de 124B cuantizados o modelos agenicos de tamano similar). El modelo base Ling-3.0-flash no tiene benchmarks publicos en la informacion proporcionada, y la variante "heretic" es un ajuste sin documentacion adicional. Se recomienda evaluar directamente con datos propios antes de adoptarlo en produccion.

## Limitaciones y advertencias

- Licencia no especificada: el modelo no tiene una licencia declarada en el repositorio, lo que genera incertidumbre legal para uso comercial.
- Informacion de entrenamiento limitada: no se conocen los datos de entrenamiento ni el proceso de alineacion, lo que impide evaluar sesgos y riesgos de contenido.
- Cuantizacion agresiva: el repositorio de 0,5 GB indica una cuantizacion muy agresiva (probablemente Q1 o Q2), lo que degrada notablemente la calidad de la salida y puede aumentar la frecuencia de alucinaciones o errores de razonamiento.
- Riesgo de alucinacion: sin datos de entrenamiento ni evaluacion publica, no es posible cuantificar el riesgo, pero es esperable en modelos de este tamano y cuantizacion.
- Sin benchmarks: no hay datos de rendimiento para tareas de codigo, matematicas o razonamiento, por lo que no se puede validar su adecuacion para casos de uso especificos.
- Contexto y idiomas desconocidos: la longitud de contexto y los idiomas soportados no estan documentados, lo que puede causar fallos en aplicaciones multilingues o de contexto largo.
- Mantenimiento incierto: el repositorio no tiene descargas ni likes, y el modelo base "heretic" parece ser un ajuste de un tercero (trohrbaugh) sin clara trazabilidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Ling-3.0-flash-heretic-i1-GGUF
- Modelo original (no cuantizado): https://huggingface.co/trohrbaugh/Ling-3.0-flash-heretic
- Variante tiny en GGUF: https://huggingface.co/mradermacher/Ling-3.0-tiny-heretic-GGUF
- Variante tiny con imatrix: https://huggingface.co/mradermacher/Ling-3.0-tiny-heretic-i1-GGUF
- Pagina del modelo en blackbox.ai: https://www.blackbox.ai/models/blackboxai/inclusionai/ling-3.0-flash
- Benchmark de Kilo Code: https://kilo.ai/models/inclusionai-ling-3-0-flash-free
