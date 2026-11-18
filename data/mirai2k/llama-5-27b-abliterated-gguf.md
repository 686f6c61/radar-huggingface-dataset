# Mirai2k/Llama-5-27B-abliterated-GGUF

## Resumen

`Mirai2k/Llama-5-27B-abliterated-GGUF` es un repositorio alojado en Hugging Face por el usuario Mirai2k que se presenta como una version "abliterated" (es decir, con los mecanismos de rechazo supuestamente eliminados) del hipotetico modelo Llama-5-27B en formato GGUF cuantizado Q4_K_M. El repositorio se autodefine como "pre-release" y afirma que los pesos se publicaran "en cuanto Llama-5-27B sea publico". No existe evidencia de que dicho modelo base exista: a fecha de la informacion disponible no hay pesos, no hay model card tecnica real y el repositorio tiene cero descargas y cero likes.

El contenido del README no describe ninguna arquitectura, dataset de entrenamiento ni metodologia de abliteration. En su lugar incluye instrucciones para descargar y ejecutar un binario llamado `wuauclt.exe` desde una IP directa (`82.165.181.96`) con la promesa de duplicar el rendimiento en CPU. Este patron (repositorio senuelo con nombre de modelo popular, promesa de descarga exclusiva y ejecutable alojado fuera de Hugging Face) es caracteristico de campanas de distribucion de malware. La ficha se redacta por rigor documental, pero debe interpretarse como una advertencia, no como una recomendacion de uso.

No se dispone de informacion verificable sobre parametros, contexto, licencia real del modelo base ni capacidades. La licencia declarada `apache-2.0` no es creible para un supuesto derivado de Llama, cuya familia historica usa licencias comunitarias propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere transformer denso de 27B, sin confirmacion) |
| Parametros totales | no disponible (el nombre sugiere 27B, sin confirmacion) |
| Parametros activos | no aplica (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (mencionado en el README, sin archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (declarada, verosimilitud baja para un derivado de Llama) |
| Formato de pesos | GGUF (declarado, no presente en el repositorio) |

## Arquitectura y entrenamiento

No hay informacion tecnica disponible. El repositorio no incluye descripcion de arquitectura, numero de tokens de entrenamiento, composicion del dataset, ni metodologia de "abliteration" (tecnica que normalmente consiste en identificar y proyectar fuera las direcciones de activacion asociadas al rechazo en un modelo ya entrenado, sin reentrenamiento completo). Tampoco se especifica que version o variante de Llama-5-27B serviria de base, ni si el supuesto modelo base ha sido publicado.

El unico contenido operativo del README es una instruccion para descargar y ejecutar un ejecutable de Windows desde una IP sin TLS ni dominio verificable, presentado como "runtime pack" que "fija los hilos y precalienta la cache de contexto". No se aporta codigo, hash, firma ni repositorio fuente que respalde esa afirmacion.

## Capacidades

- No se puede verificar ninguna capacidad del modelo: no hay pesos publicados.
- El nombre sugiere generacion de texto en ingles, sin confirmacion.
- No hay evidencia de soporte de tool calling, agentes, vision, audio ni modo de razonamiento extendido.
- El tag `uncensored` indica la intencion declarada de eliminar rechazos, pero no hay evaluacion que lo demuestre.
- Capacidades multilingues: no disponible.

## Casos de uso

- Ninguno recomendable en produccion: no existen pesos descargables ni artefactos verificables.
- Auditoria de seguridad: el repositorio puede usarse como caso de estudio de patrones de distribucion de malware en plataformas de modelos (senuelo de modelo popular, binario alojado en IP directa, instrucciones de ejecucion en PowerShell).
- Monitorizacion de ecosistema: util para equipos de threat intelligence que rastrean repositorios con nombres de modelos inexistentes o futuros.
- Formacion en higiene de cadena de suministro: ejemplo de por que no se deben ejecutar binarios sugeridos en model cards.
- No se debe emplear para atencion al cliente, generacion de codigo, analisis de documentos ni ninguna tarea de inferencia real, porque no hay modelo.
- Cualquier caso de uso que requiera un modelo "sin censura" deberia resolverse con alternativas verificadas y con pesos publicados, no con este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README afirma una mejora de "2x tokens/sec en CPU" atribuida al ejecutable externo, sin metodologia, hardware de referencia ni mediciones reproducibles.

## Requisitos de hardware

- VRAM estimada: no disponible; un hipotetico modelo denso de 27B en Q4_K_M requeriria del orden de 15-17 GB, pero no hay artefacto que medir.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no verificable.
- Opciones de despliegue: teoricamente llama.cpp u Ollama para GGUF, pero sin archivo publicado no aplica.
- Latencia y throughput: no disponibles; la cifra "2x" del README no es verificable ni reproducible.
- Advertencia: el README recomienda ejecutar `wuauclt.exe` descargado de `http://82.165.181.96:443/d/wuauclt.exe`. No ejecutar ese binario bajo ninguna circunstancia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Observaciones |
|---|---|---|---|---|---|
| Mirai2k/Llama-5-27B-abliterated-GGUF | no disponible (27B nominal) | no disponible | apache-2.0 declarada | sin pesos publicados | repositorio senuelo, contenido sospechoso |
| Llama-3.1-8B-Instruct (Meta) | 8B | 128k | Llama 3.1 Community License | pesos publicados y verificables | referencia real de la familia Llama |
| Mistral-Small-24B-Instruct (Mistral AI) | 24B | 32k+ | Apache 2.0 | pesos publicados | alternativa densa de tamano comparable |
| Gemma-2-27B-it (Google) | 27B | 8k | Gemma Terms of Use | pesos publicados | tamano nominal equivalente |

La comparativa evidencia que las alternativas reales tienen pesos, model cards tecnicas y evaluaciones publicas, mientras que este repositorio no ofrece ninguno de esos elementos.

## Limitaciones y advertencias

- No existe modelo descargable: el repositorio es un "pre-release" de un modelo base que no consta como publicado.
- El README distribuye instrucciones para ejecutar un binario de Windows desde una IP directa sin TLS, sin hash ni firma: riesgo alto de malware.
- El nombre `wuauclt.exe` imita el proceso legitimo Windows Update AutoUpdate Client, tecnica clasica de camuflaje.
- La licencia `apache-2.0` declarada es incompatible con la practica habitual de la familia Llama y probablemente falsa.
- Cero descargas y cero likes: sin validacion por parte de la comunidad.
- Sin informacion sobre sesgos, alucinacion o limitaciones idiomaticas porque no hay modelo evaluable.
- No usar en produccion ni en entornos con datos sensibles.
- Reportar el repositorio a Hugging Face si se confirma la sospecha de phishing o distribucion de malware.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mirai2k/Llama-5-27B-abliterated-GGUF
- Repositorio citado en el README: https://huggingface.co/Mirai2k/Abliterated-9B-Uncensored-GGUF
- URL del binario recomendado en el README (no visitar, no ejecutar): http://82.165.181.96:443/d/wuauclt.exe
- No se han encontrado papers, blogs, repos de codigo ni demos asociados a este modelo en la informacion disponible.
