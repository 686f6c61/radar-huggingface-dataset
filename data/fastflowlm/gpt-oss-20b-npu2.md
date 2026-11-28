# FastFlowLM/GPT-OSS-20B-NPU2

## Resumen

GPT-OSS-20B-NPU2 es una redistribución del modelo `openai/gpt-oss-20b` publicada por FastFlowLM, orientada a la ejecución sobre unidades de procesamiento neuronal (NPU). Se trata de una cuantización en formato MXFP4 del modelo original de OpenAI, mantenida dentro del ecosistema `transformers` y con la misma licencia Apache 2.0. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 21 000 millones de parámetros totales y 3600 millones de parámetros activos por token, diseñado por OpenAI para razonamiento, tareas agénticas y uso general por parte de desarrolladores.

La relevancia de esta variante concreta radica en su enfoque de despliegue: mientras que el `gpt-oss-20b` original ya está pensado para caber en torno a 16 GB de memoria, esta versión de FastFlowLM apunta a hardware con NPU, un nicho en crecimiento en portátiles y equipos de borde. El repositorio ocupa 43,4 GB, lo que sugiere que incluye pesos en varios formatos o precisiones además del MXFP4 principal.

El modelo conserva las capacidades del original: formato de respuesta harmony, razonamiento configurable en tres niveles (bajo, medio, alto), cadena de pensamiento completa accesible, soporte nativo de function calling, navegación web, ejecución de código Python y salidas estructuradas. No se dispone de información específica sobre los cambios técnicos que FastFlowLM haya introducido más allá de la cuantización y el empaquetado para NPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) |
| Parametros totales | 21 000 millones (21B) |
| Parametros activos | 3600 millones (3.6B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (cuantización de los pesos MoE aplicada en post-entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio `transformers`); MXFP4 como precisión de los pesos MoE |

## Arquitectura y entrenamiento

El modelo base `gpt-oss-20b` es un transformer con arquitectura de mezcla de expertos en el que, de los 21B parámetros totales, solo 3.6B se activan por token. Esta relación permite un rendimiento computacional cercano al de un modelo denso de ~4B manteniendo la capacidad de representación de un modelo mucho mayor. OpenAI aplicó una cuantización MXFP4 a los pesos MoE durante el post-entrenamiento, de modo que todas las evaluaciones publicadas se realizaron con esa misma precisión; esto implica que el modelo está optimizado para ejecutarse cuantizado sin pérdida adicional significativa respecto a los resultados reportados.

El entrenamiento del original incluye ajuste fino con el formato de respuesta harmony, que estructura los turnos de conversación, las llamadas a herramientas y los bloques de razonamiento. El modelo expone la cadena de pensamiento completa y permite regular el esfuerzo de razonamiento (low, medium, high). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO, ya que la model card redistribuida no detalla esos aspectos. La variante de FastFlowLM no documenta cambios en el entrenamiento, solo en el empaquetado y la cuantización para NPU.

## Capacidades

- Generación de texto conversacional y de propósito general.
- Razonamiento con cadena de pensamiento completa y esfuerzo configurable (bajo, medio, alto).
- Razonamiento matemático y resolución de problemas de varios pasos.
- Generación y análisis de código, incluida ejecución de Python en el entorno del agente.
- Function calling y tool calling nativos.
- Capacidades agénticas: navegación web, ejecución de código y salidas estructuradas.
- Soporte del formato harmony para estructurar conversaciones, herramientas y razonamiento.
- Ajuste fino mediante parámetros (fine-tuning completo o parcial según el stack).
- Capacidades multilingües: no especificadas en la información disponible.

## Casos de uso

- Asistente de razonamiento en local: con 3.6B parámetros activos y cuantización MXFP4, el modelo puede ejecutarse en equipos con NPU o GPU de gama media para tareas de análisis, resumen y resolución de problemas sin depender de la nube.
- Automatización de agentes con herramientas: el soporte nativo de function calling y salidas estructuradas permite construir agentes que consulten APIs, bases de datos o servicios internos y encadenen varios pasos de razonamiento.
- Generación de código en pipelines de desarrollo: puede integrarse en flujos de CI/CD o asistentes de IDE para autocompletar, revisar y explicar código, así como para generar pruebas unitarias.
- Ejecución de código y análisis de datos: la capacidad de ejecutar Python dentro del bucle agéntico lo hace adecuado para tareas de cálculo, transformación de datos y verificación de resultados.
- Atención al cliente con contexto conversacional: el formato harmony y la gestión multi-turno permiten desplegar chatbots que mantengan el hilo de la conversación y consulten sistemas externos mediante herramientas.
- Navegación web asistida: el modelo puede orquestar búsquedas y extracción de información de páginas para tareas de investigación o monitorización.
- Prototipado e investigación: al ser fine-tuneable y de licencia Apache 2.0, sirve como base para experimentos académicos o industriales sin restricciones de copyleft.
- Despliegue en el borde: la variante NPU2 está pensada para portátiles y dispositivos con acelerador neuronal, útil en escenarios con requisitos de privacidad o latencia baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo base `gpt-oss-20b` está diseñado para ejecutarse dentro de 16 GB de memoria gracias a la cuantización MXFP4 de los pesos MoE.
- La variante NPU2 de FastFlowLM está orientada a unidades de procesamiento neuronal; no se detallan los modelos de NPU compatibles.
- GPU recomendadas para el modelo base: no especificadas en la información disponible; el modelo hermano de 120B se orienta a una única GPU de 80 GB (H100 o MI300X), pero para el de 20B no se documentan requisitos concretos.
- Compatibilidad con GPU de consumo: el modelo base está pensado para hardware local; Ollama y LM Studio ofrecen rutas de despliegue en equipos de consumo.
- Opciones de despliegue documentadas: Transformers (incluido `transformers serve`), vLLM (versión 0.10.1+gptoss), Ollama (`gpt-oss:20b`), LM Studio y las implementaciones de referencia en PyTorch/Triton del repositorio de OpenAI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| GPT-OSS-20B-NPU2 (FastFlowLM) | 21B | 3.6B | no disponible | Apache 2.0 | Variante MXFP4 para NPU del gpt-oss-20b |
| gpt-oss-20b (OpenAI) | 21B | 3.6B | no disponible | Apache 2.0 | Modelo original, mismo rendimiento base |
| gpt-oss-120b (OpenAI) | 117B | 5.1B | no disponible | Apache 2.0 | Versión mayor para una GPU de 80 GB |

No se dispone de datos de benchmarks que permitan comparar el rendimiento numérico con alternativas de otros fabricantes; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo debe usarse con el formato harmony; fuera de él no funciona correctamente, según advierte la model card.
- La cadena de pensamiento completa no está pensada para mostrarse al usuario final; exponerla puede filtrar razonamientos internos o información sensible.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan tasas concretas.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no especificados; conviene validar el comportamiento en castellano antes de producción.
- Longitud de contexto: no disponible; planificar los casos de uso con contexto largo requiere verificación empírica.
- La variante NPU2 depende de hardware NPU concreto; no se detalla la matriz de compatibilidad, lo que puede limitar su portabilidad.
- El repositorio ocupa 43,4 GB, muy por encima de los ~16 GB del modelo cuantizado, lo que sugiere múltiples formatos o precisiones; conviene revisar qué artefactos descargar.
- Licencia Apache 2.0 permisiva para uso comercial, sin restricciones de copyleft ni cláusulas de riesgo de patentes según la model card; aun así, revisar los términos del modelo base de OpenAI.
- No se documentan cambios de FastFlowLM sobre el modelo original más allá del empaquetado, por lo que la calidad debe asumirse equivalente a la del `gpt-oss-20b` oficial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FastFlowLM/GPT-OSS-20B-NPU2
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Modelo mayor: https://huggingface.co/openai/gpt-oss-120b
- Colección gpt-oss: https://huggingface.co/collections/openai/gpt-oss-68911959590a1634ba11c7a4
- Sitio oficial: https://gpt-oss.com
- Guías (cookbook): https://cookbook.openai.com/topic/gpt-oss
- Paper / model card: https://arxiv.org/abs/2508.10925
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Repositorio harmony: https://github.com/openai/harmony
- Repositorio gpt-oss: https://github.com/openai/gpt-oss
- Lista de recursos: https://github.com/openai/gpt-oss/blob/main/awesome-gpt-oss.md
- Ollama: https://ollama.com/download
- LM Studio: https://lmstudio.ai/
