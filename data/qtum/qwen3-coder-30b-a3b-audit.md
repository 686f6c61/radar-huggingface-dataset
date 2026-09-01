# qtum/Qwen3-Coder-30B-A3B-Audit

## Resumen

Qwen3-Coder-30B-A3B-Audit es un modelo de lenguaje especializado en auditoría de seguridad de contratos inteligentes Solidity, desarrollado por el equipo de qtum. Se trata de un fine-tune del modelo base Qwen/Qwen3-Coder-30B-A3B-Instruct, entrenado sobre 10.821 hallazgos de vulnerabilidades reales, adjudicados por auditores humanos en concursos públicos de auditoría (Code4rena y Sherlock). El modelo recibe un fragmento de código Solidity y devuelve un array JSON con los hallazgos de seguridad —severidad, categoría, función afectada, rango de líneas y una razón breve— o un array vacío si el código es limpio.

El problema que resuelve es el alto índice de falsos positivos de los modelos de propósito general aplicados a auditoría de smart contracts: el modelo base marcaba vulnerabilidades en el 95% de los contratos limpios, mientras que este fine-tune reduce esa tasa al 27% (tasa de aprobación de código limpio del 73% en EVAL-A). Su relevancia actual radica en la creciente demanda de herramientas de análisis automatizado de seguridad en el ecosistema DeFi, donde la detección temprana de vulnerabilidades puede evitar pérdidas millonarias.

Arquitectónicamente es un modelo de mezcla de expertos (MoE) con 30.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token, lo que le confiere un rendimiento de inferencia cercano a un modelo denso de 3B con capacidades de un modelo mucho mayor. Soporta una ventana de contexto de 16.384 tokens y está licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3-MoE) |
| Parametros totales | 30.532.122.624 (~30,5B) |
| Parametros activos | ~3B (aproximadamente 3.000 millones) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | bf16 (pesos originales); no se han publicado cuantizaciones GGUF/AWQ oficiales |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-MoE, una variante de transformer con mezcla de expertos que activa solo una fracción de los parámetros por token. Con 30,5B parámetros totales y ~3B activos, ofrece un equilibrio entre capacidad y eficiencia computacional: el throughput de inferencia es comparable al de un modelo denso de 3B, mientras que la calidad se acerca a la de modelos mucho más grandes.

El entrenamiento consistió en un fine-tune con LoRA (Low-Rank Adaptation) sobre el modelo instruct Qwen3-Coder-30B-A3B-Instruct, utilizando 10.821 hallazgos de vulnerabilidades reales extraídos de concursos de auditoría públicos (Code4rena y Sherlock), cada uno adjudicado por auditores humanos. El dataset incluye tanto contratos vulnerables como contratos limpios (30-35% del conjunto de evaluación), lo que permite al modelo aprender a distinguir entre problemas reales y ruido. No se menciona el uso de RLHF o DPO; el entrenamiento se centra en la adaptación supervisada con un formato de salida JSON estricto.

Una innovación destacable es el diseño del prompt de sistema, que instruye al modelo a reportar únicamente vulnerabilidades explotables, ignorando problemas de estilo, optimizaciones de gas o preocupaciones especulativas. Además, el modelo está entrenado para devolver exclusivamente un array JSON, sin prosa ni explicaciones adicionales, lo que facilita su integración en pipelines automatizados.

## Capacidades

- Auditoría de seguridad de contratos Solidity: detecta vulnerabilidades explotables y las clasifica por severidad (High, Medium, Low) y categoría (reentrancy, access-control, input-validation, arithmetic, accounting, oracle, mev-slippage, dos, liquidation, rewards-fees, token-integration, signature-replay, init-upgrade, crosschain, flashloan-donation, callback-hook, other).
- Salida estructurada en JSON: cada hallazgo incluye severidad, categoría, función afectada, rango de líneas del código original y una razón de una frase.
- Distinción entre código vulnerable y limpio: reduce drásticamente los falsos positivos en comparación con el modelo base (tasa de aprobación de código limpio del 73% frente al 5%).
- Precisión de severidad mejorada: acierta la gravedad del hallazgo en el 61% de los casos (EVAL-A), frente al 38% del base.
- Localización de vulnerabilidades: asigna correctamente la función y el rango de líneas con un F1 de 0,281 (EVAL-A), más del doble que el modelo base.
- No es un modelo de chat general: está especializado exclusivamente en auditoría de Solidity y no soporta otras tareas de generación de código o conversación.

## Casos de uso

- Auditoría previa al despliegue de contratos: un equipo de desarrollo puede pasar cada contrato por el modelo antes de publicarlo en mainnet, obteniendo una lista priorizada de posibles vulnerabilidades con severidad y localización exacta. Es adecuado porque reduce el ruido y permite centrar la revisión manual en los hallazgos más probables.
- Integración en pipelines de CI/CD: al devolver JSON estructurado, el modelo puede conectarse directamente a herramientas de análisis estático o a bots de revisión de pull requests, bloqueando merges que introduzcan vulnerabilidades críticas.
- Análisis de contratos existentes en producción: los equipos de seguridad pueden auditar retrospectivamente contratos desplegados, identificando riesgos latentes que no se detectaron en la auditoría original.
- Filtrado de hallazgos en concursos de auditoría: los organizadores de bug bounties pueden usar el modelo como primer filtro para descartar reportes duplicados o de baja calidad, reduciendo la carga de trabajo de los jueces humanos.
- Formación de auditores junior: el modelo puede generar ejemplos de vulnerabilidades con su categoría y severidad correctas, sirviendo como material didáctico interactivo para aprender patrones de ataque comunes en Solidity.
- Revisión de código en repositorios de DAOs o protocolos DeFi: los equipos de gobernanza pueden ejecutar el modelo sobre propuestas de actualización de contratos para obtener una evaluación rápida de riesgos antes de someterlas a votación.

## Benchmarks y rendimiento

El modelo fue evaluado en dos conjuntos independientes de retención, construidos a partir de concursos de auditoría que el modelo nunca vio durante el entrenamiento: EVAL-A (Code4rena, 383 preguntas / 313 hallazgos dorados) y EVAL-B (Sherlock, 804 preguntas / 765 hallazgos). Ambos incluyen un 30-35% de contratos limpios para medir falsos positivos.

| Metrica | Base (EVAL-A / B) | Este modelo (EVAL-A / B) | Cambio |
|---|---|---|---|
| Tasa de aprobacion de codigo limpio | 0,05 / 0,07 | 0,73 / 0,64 | 14x |
| Falsos positivos por pregunta | 0,56 / 0,52 | 0,23 / 0,26 | -58% |
| Precision de severidad | 0,38 / 0,36 | 0,61 / 0,53 | +61% |
| F1 de localizacion + categoria | 0,089 / 0,094 | 0,281 / 0,236 | +215% |
| F1 extremo a extremo (verificado semanticamente) | 0,010 / 0,043 | 0,081 / 0,057 | +8,1x / +1,3x |

En terminos de cobertura, el modelo confirma 25 de 313 hallazgos en EVAL-A y 41 de 765 en EVAL-B, frente a 4 y 36 respectivamente del modelo base. La mejora es estadisticamente significativa al agrupar ambos conjuntos.

En comparacion con auditores humanos, medido sobre 155 concursos de Sherlock usando los registros publicos "Found by", el modelo alcanza una mediana del 8,6% de los hallazgos de un concurso, frente al 1,3% del modelo base. El mejor auditor humano individual alcanza una mediana del 59%, y el participante humano mediano un 12%. El modelo se situa por tanto en un nivel comparable al de un participante mediano, aunque la comparacion no es perfectamente equitativa: los auditores trabajan sobre el codigo completo y deben escribir pruebas de concepto, mientras que el modelo recibe fragmentos a nivel de funcion que contienen el bug.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 57 GB (el repositorio pesa 61,1 GB incluyendo metadatos). Se necesita una GPU con al menos 60 GB de memoria para cargar el modelo completo en precision bf16.
- GPU recomendadas: NVIDIA A100 80GB, H100 80GB, o multiples GPUs con tensor parallelism (por ejemplo, dos RTX 4090 de 24 GB con vLLM).
- En GPU de consumo: no cabe en una sola GPU de 24 GB en bf16. Seria necesario cuantizar a 4 bits (GGUF o AWQ) para reducir la huella a ~15-18 GB, pero no se han publicado cuantizaciones oficiales. El usuario puede generarlas con herramientas como llama.cpp o AutoAWQ.
- Opciones de despliegue: vLLM (recomendado por el autor, con el comando `vllm serve qtum/Qwen3-Coder-30B-A3B-Audit --max-model-len 16384`), Transformers con `transformers` y `accelerate`, o conversión a GGUF para Ollama/llama.cpp.
- Latencia y throughput: al ser MoE con ~3B parametros activos, el throughput es similar al de un modelo denso de 3B. En una A100 80GB, se pueden esperar decenas de generaciones por segundo, aunque el dato exacto no esta publicado. La generacion con `temperature=0` y `max_tokens=4096` es la configuracion recomendada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | F1 extremo a extremo (EVAL-A) |
|---|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-Audit (este) | 30,5B total / ~3B activos | 16.384 | Apache 2.0 | Auditoria Solidity | 0,081 |
| Qwen3-Coder-30B-A3B-Instruct (base) | 30,5B total / ~3B activos | 16.384 | Apache 2.0 | Codigo general | 0,010 |
| Qwen3-Coder-480B-A35B-Instruct | 480B total / ~35B activos | no disponible | Apache 2.0 | Codigo general | no disponible |

No se dispone de informacion sobre otros modelos especificamente entrenados para auditoria de smart contracts en la documentacion consultada. La comparativa principal es contra el modelo base, que es el punto de partida natural. El modelo de 480B de Qwen podria ofrecer mayor capacidad general, pero no esta especializado en auditoria y requeriria un fine-tune similar.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo solo audita contratos Solidity. No funciona con otros lenguajes de smart contracts (Vyper, Rust para Solana) ni con codigo general.
- Idioma unico: entrenado y evaluado solo en ingles. El prompt de sistema contiene instrucciones en ingles y el modelo puede degradarse con entradas en otros idiomas.
- Prompt obligatorio: el modelo esta entrenado para un unico prompt de sistema. Desviarse de el degrada significativamente la calidad de la salida. No se recomienda modificar el formato ni anadir instrucciones adicionales.
- Falsos positivos residuales: aunque se redujeron un 58%, el modelo aun produce 0,23-0,26 falsos positivos por pregunta. No debe utilizarse como unico criterio de aprobacion de un contrato.
- Falsos negativos: la recall es limitada (8,6% de los hallazgos de un concurso en la comparacion con humanos). Muchas vulnerabilidades reales no se detectan.
- Verificacion semantica conservadora: el evaluador utilizado rechaza el 23% de las parafrasis genuinas, por lo que el rendimiento real podria ser ligeramente superior al reportado, pero tambien podria haber errores de etiquetado en el conjunto dorado.
- No sustituye a un auditor humano: el modelo es una herramienta de apoyo, no un reemplazo. La auditoria profesional requiere revision manual, pruebas de concepto y analisis de contexto completo del protocolo.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo no incluye garantias de exactitud ni responsabilidad por perdidas derivadas de su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qtum/Qwen3-Coder-30B-A3B-Audit
- Modelo base Qwen3-Coder-30B-A3B-Instruct: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Repositorio GitHub de Qwen3-Coder: https://github.com/QwenLM/Qwen3-Coder
- Guia practica de despliegue local: https://aiindigo.com/tutorials/getting-started-with-qwen3-coder-30b-a3b-instruct-efficient-local-code-generatio
- Pagina de Ollama para qwen3-coder:30b: https://ollama.com/library/qwen3-coder:30b-a3b-fp16
