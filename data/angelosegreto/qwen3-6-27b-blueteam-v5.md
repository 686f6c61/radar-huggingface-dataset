# ANGELOSEGRETO/Qwen3.6-27B-blueteam-v5

## Resumen

Qwen3.6-27B-blueteam-v5 es un ajuste fino (fine-tune) de tipo QLoRA sobre el modelo base Qwen/Qwen3.6-27B, publicado por el usuario ANGELOSEGRETO en HuggingFace. El modelo esta especializado en seguridad defensiva (blue team): genera consultas de deteccion, cadenas de investigacion, guia de remediacion y estrategias defensivas con comandos concretos para herramientas como Splunk SPL, KQL/Kusto, PowerShell, Sigma, YARA, Zeek, Suricata y Wireshark, entre otras. El repositorio contiene pesos en formato GGUF, con un fichero principal cuantizado a Q4_K_M de 15,4 GB y una cabeza MTP (multi-token prediction) de 1,9 GB para decodificacion especulativa.

El modelo declara 26.895.998.464 parametros (aproximadamente 26,9 B, comercializado como 27B) y se distribuye bajo licencia Apache-2.0. El entrenamiento se realizo sobre el dataset blueteam-comprehensive-v5, generado a partir de 714 habilidades de red team, con 2.298 registros de entrenamiento y 256 de validacion, 2 epocas, loss final de 0,208 y un coste de computo de 2,5 horas en una A100-40GB. La relevancia actual del modelo reside en su enfoque vertical: no es un asistente generalista, sino una herramienta orientada a equipos SOC que necesitan traducir tecnicas ofensivas conocidas en detecciones y procedimientos de respuesta concretos.

Se trata de un modelo con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni pipeline declarado, por lo que su adopcion en produccion deberia ir precedida de una evaluacion propia. Tampoco se especifica en la informacion disponible la longitud de contexto del modelo base ni los idiomas naturales soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen/Qwen3.6-27B); tag de arquitectura declarado: qwen3_5. No se detalla en la informacion disponible si es densa o MoE |
| Parametros totales | 26.895.998.464 (aprox. 26,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de la model card usa -c 2048, que es un parametro de configuracion del servidor llama.cpp, no una especificacion de la ventana del modelo) |
| Tipos de cuantizacion | GGUF Q4_K_M (modelo principal y cabeza MTP); adaptadores QLoRA entrenados en 4 bits con bitsandbytes; tag imatrix |
| Idiomas soportados | no disponible a nivel de lenguaje natural; el dataset cubre multiples lenguajes de deteccion (SPL, KQL, Kusto, PowerShell, Sigma, YARA, Zeek, Suricata, filtros Wireshark, AWS CloudTrail, Azure Monitor, GCP Audit Log, artefactos Velociraptor, Wazuh) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M, dos ficheros: principal y draft MTP) y safetensors (repositorio etiquetado como safetensors) |
| Tamano del repositorio | 31,0 GB |
| Ficheros principales | blueteam-v5-Q4_K_M.gguf (15,4 GB), blueteam-v5-mtp-Q4_K_M.gguf (1,9 GB) |
| Modelo base | Qwen/Qwen3.6-27B |
| Metodo de ajuste | QLoRA (Unsloth) |
| Fecha de creacion | 2026-09-13 |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo parte de Qwen/Qwen3.6-27B y se ajusta mediante QLoRA, una tecnica de ajuste con cuantizacion de 4 bits que congela los pesos base e introduce adaptadores de bajo rango entrenables, reduciendo de forma drastica los requisitos de memoria. El autor declara el uso de Unsloth como framework de entrenamiento y de bitsandbytes para la cuantizacion. El repositorio etiqueta la arquitectura como qwen3_5 y el modelo base como Qwen3.6-27B; no se especifica en la informacion proporcionada si el backbone es denso o de mezcla de expertos, ni detalles de atencion (por ejemplo, si emplea attention lineal o hibrida). Junto a los pesos principales se publica una cabeza MTP cuantizada que permite decodificacion especulativa en llama.cpp mediante el tipo de speculacion draft-mtp, lo que en la practica puede acelerar la generacion al validar varios tokens candidatos por paso.

El entrenamiento se realizo sobre el dataset blueteam-comprehensive-v5, derivado de 714 habilidades de red team y ampliado con cobertura de deteccion multi-herramienta. Los datos se organizan por categorias: consultas SIEM (Splunk SPL, KQL para Azure Sentinel, Kusto), deteccion en endpoint (PowerShell, reglas Sigma, YARA), deteccion de red (scripts Zeek, reglas Suricata, filtros Wireshark), forense en nube (AWS CloudTrail, Azure Monitor, GCP Audit Log) y caza en EDR (artefactos Velociraptor, consultas Wazuh). Ademas, se menciona una clasificacion en cadenas basadas en fases (recon, exploit, priv esc, persist, post-exploit), lo que sugiere que el modelo aprende a mapear tecnicas ofensivas a detecciones defensivas por etapa del ciclo de ataque. No se documenta en la informacion disponible el uso de RLHF, DPO u otras tecnicas de alineacion posteriores al ajuste supervisado, ni la composicion exacta en tokens del dataset.

## Capacidades

- Generacion de consultas de deteccion en multiples lenguajes: Splunk SPL, KQL (Azure Sentinel), Kusto, reglas Sigma, reglas YARA, scripts Zeek, reglas Suricata y filtros Wireshark.
- Redaccion de comandos defensivos concretos en PowerShell y consultas para Wazuh y artefactos Velociraptor.
- Cadenas de investigacion (investigation chains) orientadas a analistas SOC, con pasos sucesivos de triaje y correlacion.
- Guia de remediacion y estrategias defensivas, segun la descripcion del autor.
- Clasificacion por fases del ciclo de ataque (recon, exploit, priv esc, persist, post-exploit) aplicada a la deteccion.
- Cobertura de forense en nube: AWS CloudTrail, Azure Monitor y GCP Audit Log.
- Decodificacion especulativa mediante cabeza MTP publicada aparte.
- Capacidades conversacionales (tag conversational declarado en la ficha de HuggingFace).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; la estructura de cadenas de investigacion es proxima, pero no se especifica integracion con frameworks de agentes.
- Capacidades de vision o audio: no disponible.
- Modo thinking explicito: no disponible.

## Casos de uso

- Triaje en un SOC: el modelo puede recibir una alerta descrita en lenguaje natural y devolver una consulta KQL o SPL lista para ejecutar sobre el SIEM, reduciendo el tiempo que un analista de nivel 1 dedica a escribir la busqueda desde cero.
- Desarrollo de reglas de deteccion: generacion de reglas Sigma y YARA a partir de una descripcion de comportamiento malicioso o de un indicador, utiles para alimentar repositorios internos de deteccion como SigmaHQ o pipelines propios.
- Respuesta a incidentes: produccion de cadenas de investigacion paso a paso (por ejemplo, correlacionar eventos de CloudTrail con actividad en endpoints) que sirven como guion de trabajo para el equipo de respuesta.
- Analisis forense en nube: traduccion de hallazgos en AWS CloudTrail, Azure Monitor o GCP Audit Log a consultas de busqueda y a hipotesis de compromiso, aprovechando la cobertura multi-nube del dataset de entrenamiento.
- Caza de amenazas (threat hunting) en endpoints: generacion de consultas para Wazuh y artefactos de Velociraptor que permitan localizar indicios de persistencia o escalada de privilegios en flotas de endpoints.
- Monitorizacion de red: creacion de reglas Suricata, scripts Zeek y filtros Wireshark para detectar trafico anomalo en el perimetro, con la ventaja de cubrir varias tecnologias desde un unico modelo.
- Asistente interno para equipos blue team: despliegue local en una estacion de trabajo con llama.cpp u Ollama para consultar sintaxis de herramientas de deteccion sin enviar datos de incidentes a servicios en la nube de terceros.
- Formacion y simulacion defensiva: uso del modelo como contraparte defensiva frente al modelo red team del mismo autor para ejercicios de mesa (tabletop exercises) y validacion de detecciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de entrenamiento (2.298 registros de entrenamiento, 256 de validacion, loss 0,208, 2 epocas, 2,5 horas en A100-40GB) y no incluye evaluaciones sobre conjuntos estandar como MMLU, HumanEval o GSM8K, ni metricas especificas de dominio como precision de reglas de deteccion o tasa de falsos positivos.

## Requisitos de hardware

- VRAM estimada solo para pesos, Q4_K_M: 15,4 GB para el modelo principal y 1,9 GB adicionales para la cabeza MTP si se usa decodificacion especulativa (17,3 GB en total). El KV cache y el overhead del runtime anaden un consumo adicional no cuantificado en la informacion disponible.
- VRAM estimada para versiones de mayor precision (calculada a partir del numero de parametros, no publicada por el autor): aproximadamente 28-29 GB para Q8_0 y en torno a 54 GB en FP16/BF16. Estos valores son estimaciones y no datos declarados en la ficha del modelo.
- GPU consumer: la cuantizacion Q4_K_M deberia caber en GPU de 24 GB (RTX 3090, RTX 4090) y en GPU de 32 GB (RTX 5090, si se dispone de ella). En tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) seria necesario descargar parcialmente capas a CPU mediante el parametro -ngl de llama.cpp.
- GPU de datacenter: A100 40GB y A100 80GB, H100 y L40S cubren sin problema la cuantizacion Q4_K_M; el A100-40GB es la GPU empleada por el autor para el entrenamiento (2,5 horas). Para FP16 se requeriria A100 80GB o dos A100 40GB.
- Opciones de despliegue: llama.cpp / llama-server es la via documentada explicitamente por el autor, con soporte de decodificacion especulativa mediante --spec-type draft-mtp. Los ficheros GGUF son tambien compatibles con el ecosistema llama.cpp (Ollama, LM Studio, text-generation-webui). El despliegue en vLLM o TGI con los pesos publicados no esta documentado en la informacion disponible y requeriria fusionar los adaptadores QLoRA con el modelo base.
- Parametros de ejemplo de la model card: llama-server -m blueteam-v5-Q4_K_M.gguf -c 2048 -ngl 30, y la variante especulativa con --model-draft blueteam-v5-mtp-Q4_K_M.gguf.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ANGELOSEGRETO/Qwen3.6-27B-blueteam-v5 | 26,9 B | no disponible | apache-2.0 | GGUF (Q4_K_M) + safetensors | Especializado en seguridad defensiva; 0 descargas y 0 likes; sin benchmarks publicados |
| Qwen/Qwen3.6-27B | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Modelo base generalista del que deriva el ajuste |
| RedTeamLab/Qwen3.6-27B-redteam-v5 | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible | Contraparte ofensiva citada por el autor; probablemente mismo backbone y dataset espejo |
| RedTeamLab/Qwen3.5-4B-redteam-v4.1 | 4 B (segun el nombre) | no disponible | no disponible en la informacion proporcionada | no disponible | Variante pequena de 4B del ecosistema red team |

No se dispone de datos comparativos de rendimiento entre estas alternativas, ya que ninguno de los modelos citados publica resultados de benchmarks en la informacion disponible.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: 2.298 registros y 2 epocas. Un volumen tan bajo incrementa el riesgo de sobreajuste y limita la generalizacion a herramientas, sintaxis o versiones no representadas en el corpus.
- Riesgo de alucinacion en comandos y consultas: en un dominio donde los comandos se ejecutan directamente sobre produccion, una consulta KQL, SPL o PowerShell incorrecta puede generar falsos negativos en deteccion o, en el peor caso, acciones destructivas. Toda salida deberia validarse en un entorno de pruebas antes de su uso operativo.
- Riesgo de olvido catastrofico: al ser un ajuste QLoRA sobre 2.298 ejemplos, es probable que el modelo haya degradado capacidades generales del Qwen3.6-27B original (conversacion general, matematicas, codigo no relacionado). No se documenta ninguna evaluacion de retencion de capacidades.
- Ausencia total de validacion externa: 0 descargas y 0 likes, sin benchmarks publicados, sin pipeline declarado y sin informacion sobre evaluaciones por terceros. No hay evidencia publica de su eficacia en deteccion real.
- Naturaleza dual: el dataset se genero a partir de 714 habilidades de red team. Aunque el objetivo declarado es defensivo, el modelo podria reproducir conocimiento ofensivo. No se documenta alineacion de seguridad, filtros de contenido ni comportamiento de rechazo.
- Idiomas naturales soportados: no declarados. Es plausible que herede el perfil multilingue de Qwen, pero no hay confirmacion ni evaluacion por idioma en la informacion disponible.
- Longitud de contexto: no declarada. El ejemplo de la model card usa 2.048 tokens, lo que puede ser insuficiente para analisis de incidentes con logs extensos o cadenas de investigacion largas.
- Licencia: el modelo se publica como apache-2.0, lo que en principio permite uso comercial. No obstante, conviene verificar los terminos del modelo base Qwen/Qwen3.6-27B, ya que las condiciones de la obra derivada pueden estar sujetas a las del modelo original. No se incluye informacion al respecto en la ficha.
- Fecha de publicacion y contexto: la model card indica creacion el 2026-09-13. No hay historial de versiones, changelog ni soporte documentado por parte del autor.
- Disponibilidad: el autor no indica roadmap de mantenimiento, versiones futuras ni canal de soporte; el modelo se distribuye unicamente a traves del repositorio de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ANGELOSEGRETO/Qwen3.6-27B-blueteam-v5
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Contraparte ofensiva citada: https://huggingface.co/RedTeamLab/Qwen3.6-27B-redteam-v5
- Variante reducida de 4B citada: https://huggingface.co/RedTeamLab/Qwen3.5-4B-redteam-v4.1
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos estaban relacionados con la seleccion de futbol de Brasil y no guardan relacion con la ficha.
