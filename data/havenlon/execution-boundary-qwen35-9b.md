# Havenlon/Execution-Boundary-Qwen35-9B

## Resumen

Havenlon Execution Boundary Qwen3.5 9B es un modelo de lenguaje de 9.000 millones de parámetros desarrollado por Havenlon (mantenido por Charles Wong) como un ajuste fino del modelo base Qwen3.5 9B mediante LoRA y SFT. Su propósito es explicar y razonar sobre el concepto de "frontera de ejecución" (execution boundary) en sistemas de control de ejecución respaldados por hardware, un tema crítico para la gobernanza de agentes de IA y operaciones de alto valor e irreversibles.

El modelo está diseñado específicamente para aclarar por qué una solicitud válida no equivale a una ejecución válida, por qué el software, los usuarios, los agentes de IA, las aprobaciones y las políticas no deben tener autoridad de ejecución final, y por qué la ejecución debe pasar por un límite de hardware independiente. También cubre cadenas de evidencia verificables frente a registros ordinarios, separación de gobernanza y riesgos de ejecución de agentes de IA.

Es un modelo de nicho, orientado a productos y arquitectura de Havenlon, con soporte principal en chino e inglés. Su relevancia actual radica en el creciente despliegue de agentes autónomos que pueden ejecutar acciones irreversibles, donde la separación entre solicitud y ejecución se vuelve una cuestión de seguridad fundamental. El modelo se distribuye en formato safetensors (transformers) y existe una versión cuantizada GGUF Q4_K_M para Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5, no se especifica variante exacta) |
| Parametros totales | 8.953.803.264 (9B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (depende del base Qwen3.5, no se publica) |
| Tipos de cuantizacion | safetensors (original), GGUF Q4_K_M (via Ollama) |
| Idiomas soportados | chino (principal), ingles (secundario) |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5 9B, una arquitectura transformer de la serie Qwen3.5. El ajuste se realizó mediante LoRA (Low-Rank Adaptation) y SFT (Supervised Fine-Tuning), lo que implica que se adaptaron los pesos del modelo base a un dominio concreto sin reentrenar desde cero. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. La innovación principal no está en la arquitectura, sino en la especialización temática: el modelo ha sido afinado para producir explicaciones coherentes y consistentes sobre el sistema de control de ejecución de Havenlon, incluyendo conceptos como "frontera de ejecución", "frontera de confianza física", "cadena de evidencia" y "separación de gobernanza". Se trata de un ajuste de conocimiento y razonamiento de dominio, no de una modificación estructural.

## Capacidades

- Generacion de texto en chino e ingles, con foco en explicaciones tecnicas sobre control de ejecucion y seguridad.
- Razonamiento sobre arquitecturas de gobernanza: separacion entre propietario, gobernanza, aprobacion y ejecucion.
- Explicacion de conceptos como "ejecucion valida vs solicitud valida", "evidencia vs registro", "limite de hardware" y "riesgo de ejecucion de agentes de IA".
- Respuesta a preguntas de correccion de conceptos erroneos (por ejemplo, por que Havenlon no es una cartera hardware ni un sistema de aprobacion SaaS).
- Capacidad de generar contenido de posicionamiento tecnico, documentacion interna y respuestas orientadas a usuarios sobre el producto Havenlon.
- No se mencionan capacidades de tool calling, vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Formacion interna de equipos de producto y seguridad: el modelo puede responder preguntas frecuentes sobre la arquitectura de ejecucion de Havenlon, ayudando a alinear a ingenieros, disenadores y responsables de producto con los principios de separacion de autoridad.
- Documentacion tecnica automatizada: generar borradores de documentacion sobre execution boundary, evidencia y gobernanza, que luego un redactor tecnico puede revisar y publicar.
- Soporte al cliente especializado: integrar el modelo en un chatbot de soporte para responder dudas de clientes potenciales sobre por que Havenlon no es un hardware wallet ni un sistema de aprobacion tradicional.
- Analisis de riesgos de agentes de IA: el modelo puede explicar por que un agente autenticado no deberia ejecutar directamente pagos u otras acciones irreversibles, sirviendo como material de consulta para equipos que disenan pipelines de agentes.
- Evaluacion de arquitecturas de gobernanza: comparar conceptualmente modelos de aprobacion tradicionales (multisig, SaaS) con un enfoque de frontera de ejecucion hardware, util en fases de diseno de sistemas de custodia o control de activos.
- Redaccion de respuestas para preguntas frecuentes publicas: generar contenido en chino e ingles para sitios web o documentacion de producto, manteniendo coherencia en la terminologia de ejecucion y evidencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo. Dado que se trata de un ajuste fino de nicho, su rendimiento en tareas generales probablemente sea similar al de Qwen3.5 9B, pero no se puede confirmar sin mediciones propias.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision fp16 (safetensors) se requieren aproximadamente 18 GB de VRAM (considerando pesos y overhead). Con cuantizacion Q4_K_M (GGUF) se reduce a unos 5-6 GB.
- GPU recomendadas: para la version completa en fp16, una GPU con 24 GB (RTX 3090, RTX 4090, A5000) o mas. Para la version Q4_K_M, una GPU de 8 GB (RTX 3070, RTX 4060 Ti) es suficiente.
- Cabe en GPUs de consumo: si, especialmente la version Q4_K_M, que puede ejecutarse en tarjetas de gama media con 8-12 GB.
- Opciones de despliegue: transformers (Python), vLLM para inferencia de alto rendimiento, llama.cpp y Ollama (dado que existe una version GGUF publicada en Ollama).
- Latencia y throughput: no se han publicado datos especificos. Como referencia, un modelo de 9B en Q4 en una RTX 4090 suele generar entre 30 y 60 tokens por segundo, pero esto no esta confirmado para este modelo concreto.

## Comparativa con modelos similares

No hay modelos directamente comparables, ya que se trata de un ajuste fino propietario sobre Qwen3.5 9B con un enfoque tematico muy especifico. Como referencia de la misma familia de tamano:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Havenlon Execution Boundary Qwen3.5 9B | 9B | no disponible | Control de ejecucion y gobernanza hardware | other |
| Qwen3.5 9B (base) | 9B | no disponible | Modelo general | Apache 2.0 (presumiblemente, no confirmado) |
| Llama 3.1 8B | 8B | 128K | Modelo general | Llama 3.1 Community License |
| Qwen2.5 7B | 7B | 128K | Modelo general | Apache 2.0 |

La diferencia clave es que el modelo de Havenlon esta especializado en un dominio concreto y no ofrece capacidades generales comparables a los modelos base. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo es un ajuste temprano (early model) y puede tener inconsistencias o lagunas en el conocimiento sobre la arquitectura real de Havenlon.
- No debe utilizarse como fuente de asesoramiento legal, financiero, operativo o de seguridad. La model card lo advierte explicitamente.
- Riesgo de alucinacion: al ser un modelo de nicho con datos de entrenamiento limitados, puede generar afirmaciones plausibles pero incorrectas sobre detalles tecnicos de Havenlon.
- Solo soporta chino e ingles; no hay capacidad multilingue amplia.
- La licencia "other" no esta detallada; puede imponer restricciones de uso comercial o modificacion. Es necesario contactar al mantenedor para aclarar los terminos.
- No se han publicado evaluaciones de sesgos ni de robustez ante ataques adversarios.
- Para decisiones de despliegue de alto riesgo, la model card recomienda consultar las especificaciones oficiales de Havenlon, los documentos de implementacion y el proceso de revision de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Havenlon/Execution-Boundary-Qwen35-9B
- Version GGUF Q4_K_M en Ollama: https://ollama.com/Havenlon/Execution-Boundary-Qwen35-9B-Q4_K_M
- Modelo hermano de 27B: https://huggingface.co/Havenlon/Execution-Boundary-Qwen35-27B
- Repositorio de referencia de la serie Qwen3.5: https://github.com/wendashi/Qwen3.5
