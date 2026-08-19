# mradermacher/Execution-Boundary-Qwen35-9B-GGUF

## Resumen

Execution-Boundary-Qwen35-9B es un modelo de lenguaje de 9.000 millones de parametros desarrollado por Havenlon, una compania centrada en la seguridad y gobernanza de agentes de IA. El modelo parte de la base de Qwen3.5-9B y ha sido ajustado especificamente para razonar sobre limites de ejecucion, control de ejecucion respaldado por hardware, cadenas de evidencia y separacion de gobernanza en sistemas de IA agente. Su proposito principal es reducir el riesgo operativo de agentes autonomos que ejecutan acciones en entornos de produccion.

La version GGUF que nos ocupa ha sido cuantizada por mradermacher, un conocido cuantizador de la comunidad, e incluye 12 niveles de cuantizacion diferentes que van desde Q2_K (3.9 GB) hasta f16 (18 GB). Esto permite desplegar el modelo en una amplia gama de hardware, desde equipos de consumo hasta servidores profesionales. El modelo soporta chino e ingles, y esta pensado para casos de uso donde la verificabilidad y el control de ejecucion son criticos, como pipelines de CI/CD, sistemas de automatizacion y entornos empresariales regulados.

La relevancia de este modelo radica en que aborda un problema emergente: la necesidad de que los agentes de IA puedan demostrar que sus acciones se mantienen dentro de limites predefinidos y que sus decisiones son auditables. En lugar de limitarse a generar texto, este modelo esta disenado para integrarse en arquitecturas donde la ejecucion de acciones debe ser verificable, trazable y sujeta a politicas de gobernanza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | other (no especificada; consultar con Havenlon) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer de Qwen3.5-9B, que es la tercera generacion de la familia Qwen de Alibaba. Al ser un ajuste fino (fine-tune) sobre esta base, hereda su arquitectura de atencion por ventanas deslizantes y su tokenizer bilingue chino-ingles. No se dispone de informacion publica sobre el numero exacto de tokens de entrenamiento, la composicion del dataset o si se utilizaron tecnicas como RLHF o DPO.

La innovacion principal de este modelo no reside en la arquitectura subyacente, sino en la capa de ajuste especifico que Havenlon ha anadido para el razonamiento sobre limites de ejecucion. Segun la descripcion de Ollama, el modelo esta orientado a "razonamiento sobre limites de ejecucion, control de ejecucion respaldado por hardware, cadenas de evidencia, separacion de gobernanza y riesgo de ejecucion de agentes de IA". Esto sugiere que el entrenamiento se ha centrado en ensenar al modelo a razonar sobre politicas de seguridad, generar cadenas de evidencia verificables y mantener una separacion clara entre las decisiones de gobernanza y las acciones de ejecucion.

La version GGUF es una cuantizacion estatica realizada por mradermacher, sin usar imatrix ni pesos ponderados. Esto significa que la calidad puede ser ligeramente inferior a las cuantizaciones con imatrix, aunque los niveles Q4_K_M y Q5_K_M son recomendados por el propio autor por su equilibrio entre calidad y velocidad.

## Capacidades

- Razonamiento sobre limites de ejecucion: el modelo puede analizar si una accion propuesta por un agente se mantiene dentro de los limites definidos por politicas o restricciones.
- Control de ejecucion respaldado por hardware: capacidad para razonar sobre mecanismos de control que dependen de caracteristicas hardware (como TPM, enclaves seguros o atestacion remota).
- Generacion de cadenas de evidencia: puede producir secuencias de pasos verificables que documentan como se llego a una decision o accion.
- Separacion de gobernanza: el modelo distingue entre capas de gobierno (politicas, reglas, supervision) y capas de ejecucion (acciones concretas), lo que permite disenar sistemas con segregacion de responsabilidades.
- Evaluacion de riesgo de ejecucion de agentes: analiza escenarios de riesgo asociados a la ejecucion autonoma de acciones por parte de agentes de IA.
- Generacion de texto general: al estar basado en Qwen3.5-9B, conserva capacidades genericas de texto, razonamiento y codigo del modelo base.
- Multilingue: soporta chino e ingles, con buen rendimiento en ambos idiomas.

## Casos de uso

- Auditoria de agentes autonomas: el modelo puede generar informes de auditoria que documenten las decisiones de un agente, las politicas aplicadas y las evidencias de cumplimiento, facilitando revisiones regulatorias o internas.
- Diseno de politicas de seguridad para agentes: los equipos de seguridad pueden usar el modelo para redactar y validar politicas de ejecucion, asegurando que las restricciones son claras, comprobables y no ambiguas.
- Verificacion de acciones en pipelines de CI/CD: el modelo puede analizar los comandos que un agente de automatizacion pretende ejecutar en un pipeline y determinar si cumplen con las politicas de despliegue establecidas, reduciendo el riesgo de acciones no autorizadas.
- Generacion de cadenas de custodia digital: en entornos donde se requiere trazabilidad completa de las acciones de un sistema, el modelo puede generar cadenas de evidencia que documenten cada paso de una operacion.
- Formacion y simulacion de escenarios de riesgo: los equipos de seguridad pueden usar el modelo para simular escenarios adversos y evaluar como un agente responderia ante intentos de vulnerar sus limites de ejecucion.
- Integracion en frameworks de gobernanza de IA: el modelo puede servir como componente de razonamiento en sistemas que implementan separacion entre gobernanza (quien decide) y ejecucion (quien actua), aportando una capa de analisis que verifica el cumplimiento normativo.
- Soporte bilingue para equipos internacionales: al soportar chino e ingles, puede desplegarse en organizaciones con equipos en ambos idiomas, generando documentacion de seguridad y gobernanza en el idioma apropiado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos publicos de MMLU, HumanEval, GSM8K u otros benchmarks estandar para este modelo especifico. Al estar basado en Qwen3.5-9B, es razonable esperar un rendimiento similar al modelo base en tareas genericas, pero no hay datos verificables que lo confirmen para las tareas especificas de ejecucion controlada.

## Requisitos de hardware

- VRAM estimada para inferencia: desde 4 GB (Q2_K, 3,9 GB) hasta 18 GB (f16). Para uso comodo con contexto largo, se recomienda al menos 8 GB de VRAM con cuantizaciones Q4_K_M o Q5_K_M.
- GPU recomendadas: RTX 3060 12 GB o superior para cuantizaciones Q4/Q5; RTX 4090 o A100 para Q8_0 o f16. Las cuantizaciones Q2_K y Q3_K pueden ejecutarse en GPUs con 4-6 GB de VRAM.
- Si cabe en GPU de consumo: si, las cuantizaciones Q2_K a Q6_K caben en GPUs de consumo modernas (RTX 3060, RTX 4070, etc.). La version f16 requiere GPU profesional o de gama alta.
- Opciones de despliegue: llama.cpp, Ollama (disponible como Execution-Boundary-Qwen35-9B-Q4_K_M), LM Studio, o cualquier runtime compatible con GGUF. Para despliegue en produccion con alta concurrencia, se puede convertir a formato compatible con vLLM o TGI.
- Latencia y throughput: no hay datos publicados especificos. Como referencia, un modelo de 9B en Q4_K_M en una RTX 4090 suele generar entre 40 y 60 tokens por segundo con llama.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Execution-Boundary-Qwen35-9B | 8,95 B | no disponible | Ejecucion controlada, gobernanza de agentes | other |
| Qwen3.5-9B (base) | 9 B | no disponible | Generico | Apache 2.0 (probablemente) |
| Llama-3.1-8B-Instruct | 8 B | 128 K | Generico, instruct | Llama 3.1 Community License |

La comparativa directa es dificil porque no hay modelos publicos equivalentes con la misma especializacion en limites de ejecucion y gobernanza. El modelo base Qwen3.5-9B es la referencia natural para tareas genericas, mientras que Llama-3.1-8B-Instruct es una alternativa generica de tamano similar. La ventaja de Execution-Boundary es su enfoque especifico en seguridad y verificabilidad, que no ofrecen los modelos genericos.

## Limitaciones y advertencias

- Licencia "other" no especificada: el modelo usa una licencia personalizada no detallada en la informacion disponible. Antes de usar comercialmente, es imprescindible contactar con Havenlon para conocer los terminos exactos.
- Sin benchmarks publicados: no hay datos verificables de rendimiento en tareas estandar, lo que dificulta evaluar su calidad objetiva frente a otros modelos.
- Contexto limitado desconocido: no se ha publicado la longitud de contexto soportada, un dato critico para aplicaciones de agente que requieren historiales largos.
- Especializacion estrecha: el modelo esta optimizado para tareas de ejecucion controlada y gobernanza; su rendimiento en tareas genericas puede ser inferior al del modelo base Qwen3.5-9B.
- Riesgo de alucinacion en cadenas de evidencia: aunque el modelo esta entrenado para generar cadenas de evidencia, no hay garantia de que estas sean factualmente correctas. En entornos de produccion, las evidencias generadas deben ser verificadas por sistemas externos.
- Sesgos del modelo base: al derivar de Qwen3.5-9B, hereda los sesgos del modelo base, que pueden manifestarse en escenarios de gobernanza o seguridad.
- Cuantizaciones estaticas sin imatrix: las cuantizaciones proporcionadas no usan imatrix, lo que puede resultar en una calidad ligeramente inferior en los niveles mas bajos (Q2_K, Q3_K) comparado con cuantizaciones ponderadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Execution-Boundary-Qwen35-9B-GGUF
- Modelo base: https://huggingface.co/Havenlon/Execution-Boundary-Qwen35-9B
- Pagina en Ollama: https://ollama.com/Havenlon/Execution-Boundary-Qwen35-9B-Q4_K_M
- Guia de uso de GGUF de TheBloke (referencia): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
