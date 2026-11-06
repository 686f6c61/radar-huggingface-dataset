# LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-MTP-GGUF

## Resumen

Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-MTP-GGUF es una distribucion en formato GGUF de un modelo de lenguaje de tipo Mixture of Experts (MoE) derivado de la familia Qwen3.6, publicada por el desarrollador independiente LuffyTheFox bajo el paraguas del proyecto Genesis. El modelo parte del checkpoint HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive y le incorpora datos de un finetune orientado a uso agentico (Hermes), ademas de aplicar la tecnica propietaria de "reparacion de tensores" del autor, basada en la distribucion de Marchenko-Pastur para reducir ruido interno en los pesos.

Con 34.660.610.688 parametros totales y una arquitectura MoE con aproximadamente 3.000 millones de parametros activos por token (de ahi el sufijo A3B), el modelo esta pensado para ejecucion local en hardware de consumo y para cargas de trabajo agenticas con soporte de tool calling. La model card declara capacidades multimodales (image-text-to-text) y un pipeline orientado a conversacion, con una ventana de contexto que no se especifica de forma explicita en la informacion disponible.

Su relevancia actual radica en tres factores: la licencia Apache 2.0 sin restricciones de uso comercial, el volumen de descargas (mas de 419.000) que indica una adopcion notable en la comunidad, y el enfoque "uncensored" que lo posiciona para casos de uso donde los modelos alineados rechazan peticiones. Es importante senalar que el modelo no ha sido entrenado desde cero por el autor, sino que es el resultado de una cadena de derivaciones y de un proceso de calibracion de tensores sobre un modelo base de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), derivada de Qwen3.6; pipeline image-text-to-text |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | Aproximadamente 3 B (sufijo A3B; cifra no desglosada en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (multiples niveles; el repo incluye perfiles de cuantizacion con soporte Unsloth; niveles concretos no detallados) |
| Idiomas soportados | Ingles (en), chino (zh), multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 131,2 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura Mixture of Experts, heredada de la familia Qwen3.6, con 34,66 mil millones de parametros totales y activacion dispersa de aproximadamente 3 mil millones por token. Esta configuracion MoE permite que el coste computacional por token se acerque al de un modelo denso de 3 B mientras se preserva la capacidad representacional de un modelo de 35 B, lo que lo hace atractivo para inferencia local. El pipeline declarado es image-text-to-text, lo que sugiere la presencia de un codificador visual, aunque la informacion disponible no detalla la arquitectura de la torre de vision ni el numero de parametros asociados a ella.

El proceso de construccion es una cadena de derivaciones: se parte del base HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive (declarado con 0 de 465 rechazos en el conjunto de evaluacion del autor original), y se le transfieren datos de un finetune sobre el dataset NousResearch/hermes-function-calling-v1 proveniente de DJLougen/hermes-qwen3.5-35b-a3b-GGUF. Segun la model card, la transferencia afecta a unos 2.000 bloques de dos tensores de expertos FFN. Sobre ese resultado se aplica el algoritmo Genesis, que en tres etapas escanea tensores ssm_conv1d (asociados a memoria de contexto largo), reemplaza bloques degradados por chunks que mejor se ajustan a la distribucion de pesos, y reduce ruido mediante una SVD custom basada en la ley de Marchenko-Pastur preservando, segun el autor, el 99 % de la senal y el gradiente aprendido. No se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion completa del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, chino y otros idiomas.
- Razonamiento y respuesta a instrucciones complejas, con el enfasis en claridad de contexto que el autor atribuye al proceso Genesis.
- Tool calling y function calling, reforzado por la transferencia de datos del dataset Hermes function-calling.
- Uso agentico y razonamiento multi-paso, segun los tags del repositorio (agentic, hermes).
- Procesamiento de imagenes y texto combinados (pipeline image-text-to-text), lo que habilita tareas de descripcion visual y VQA.
- Modo "uncensored": el modelo base declara ausencia de rechazos en su conjunto de evaluacion, orientado a escenarios donde se requiere cumplimiento sin filtros de alineamiento.
- Capacidades multilingues declaradas, con soporte principal de ingles y chino.

## Casos de uso

- Agentes autonomos de automatizacion: el soporte de tool calling y el enfasis agentico permiten construir agentes que encadenan llamadas a APIs, consultas a bases de datos y acciones sobre sistemas externos, con el modelo decidiendo la secuencia de pasos.
- Asistente de desarrollo local: con ~3 B de parametros activos, puede desplegarse en una estacion de trabajo para autocompletado, generacion de tests y explicacion de codigo sin depender de servicios en la nube, manteniendo el codigo dentro de la infraestructura propia.
- Procesamiento de documentos con imagenes: al ser image-text-to-text, sirve para extraer informacion de facturas, capturas de pantalla o formularios escaneados combinando OCR implicito con razonamiento sobre el contenido.
- Atencion al cliente sin filtros corporativos estrictos: util para nichos donde los modelos alineados rechazan consultas legitmas (salud, legal, seguridad), gestionando conversaciones multi-turno con contexto amplio.
- Investigacion sobre alineamiento y robustez: el caracter uncensored y la cadena de derivaciones lo convierten en un objeto de estudio para analizar como se propagan sesgos y comportamientos a traves de finetunes y calibraciones de tensores.
- Generacion de contenido creativo sin restricciones: guiones, narrativa o dialogos donde se requiere libertad expresiva y el modelo no impone rechazos tematicos.
- Despliegue en hardware de consumo: con cuantizaciones GGUF agresivas, puede ejecutarse en GPUs de gama alta para consumidor, habilitando prototipado rapido de aplicaciones LLM sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas; solo se menciona la cifra de 0/465 rechazos del modelo base, que es una metrica de comportamiento de alineamiento y no de rendimiento cognitivo.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M, un modelo MoE de 34,66 B totales requiere aproximadamente 20-22 GB de VRAM; en Q8_0 se situa en torno a 36-38 GB; en FP16 superaria los 69 GB.
- GPU recomendadas: para cuantizaciones altas, A100 80 GB, H100 80 GB o RTX 6000 Ada; para cuantizaciones Q4/Q5, RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizaciones Q4 o inferiores; en GPUs de 16 GB requeriria cuantizaciones muy agresivas (Q2/Q3) con perdida de calidad apreciable.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), y servidores compatibles con la API de endpoints segun el tag endpoints_compatible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al ser MoE con ~3 B activos, el throughput por token deberia ser sustancialmente mayor que el de un denso de 35 B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-MTP-GGUF | 34,66 B totales / ~3 B activos | No disponible | Apache 2.0 | GGUF | Derivado con calibracion Genesis y datos Hermes |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | 34,66 B / ~3 B activos | No disponible | No disponible | Safetensors (base) | Modelo base del que deriva; declarado 0/465 rechazos |
| DJLougen/hermes-qwen3.5-35b-a3b-GGUF | ~35 B / ~3 B activos | No disponible | No disponible | GGUF | Fuente del finetune Hermes transferido |
| Qwen3.6-35B-A3B (familia base) | ~35 B / ~3 B activos | No disponible | No disponible | Safetensors/GGUF | Modelo original de la familia, sin modificaciones uncensored |

La comparativa se limita a los modelos de la cadena de derivacion, ya que la informacion disponible no incluye datos de rendimiento que permitan contrastar con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- El modelo es "uncensored": no aplica filtros de rechazo, lo que implica riesgo de generar contenido danino, ilegal o socialmente inapropiado si se despliega sin salvaguardas externas.
- Riesgo de alucinacion inherente a los LLM, potencialmente agravado por la naturaleza de las modificaciones de tensores, cuya validacion empirica no se documenta con benchmarks.
- La tecnica Genesis no ha sido revisada por pares; las afirmaciones sobre reduccion de ruido y preservacion del 99 % de la senal provienen del propio autor y carecen de verificacion independiente en la informacion disponible.
- La cadena de derivaciones (Qwen3.6 -> HauhauCS -> Hermes -> Genesis) acumula posibles sesgos y degradaciones de cada etapa, sin que se documente una evaluacion de seguridad.
- Longitud de contexto no especificada: planificar el despliegue en produccion sin conocer la ventana real es arriesgado para cargas con documentos largos.
- Soporte idiomatico principal limitado a ingles y chino; el rendimiento en castellano no esta documentado.
- Aunque la licencia es Apache 2.0, la procedencia de los datos de entrenamiento y finetunes intermedios no se detalla, lo que puede plantear incertidumbre legal en entornos corporativos estrictos.
- El repo pesa 131,2 GB, lo que exige almacenamiento considerable y descargas largas; conviene seleccionar una unica cuantizacion.
- No hay garantias de mantenimiento ni soporte: es un proyecto de un desarrollador independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-MTP-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Finetune Hermes de origen: https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Script de cuantizacion con perfiles Unsloth: https://pastebin.com/hXhcMJn9
- Discord del proyecto: https://discord.gg/SZ5vacTXYf
- Distribucion de Marchenko-Pastur (referencia matematica): https://en.wikipedia.org/wiki/Marchenko%E2%80%93Pastur_distribution
