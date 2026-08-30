# dragonlimited/DragonCode-Finance-14B

## Resumen

DragonCode Finance-14B es un modelo de lenguaje propietario de 14.000 millones de parametros desarrollado por Dragon Limited, una empresa de big data e IA con sede en Hong Kong especializada en el sector financiero. Forma parte del ecosistema DragonData, que integra un corpus financiero propio de aproximadamente 313.000 millones de tokens organizado en 25 dominios, los modelos DragonCode entrenados sobre ese corpus y agentes de IA desplegables on-premise para profesionales de las finanzas.

El modelo se presenta como un ajuste fino completo (full fine-tune, sin LoRA) sobre el corpus DragonData, concretamente sobre el dominio completo de Sec-EDGAR sin recortar, con 58 shards y aproximadamente 948.000 fragmentos de entrenamiento. Su proposito es ofrecer capacidades especializadas en el ambito financiero profesional: contabilidad, auditoria, cumplimiento normativo, banca de inversion, gestion de fondos y seguros, entre otros.

La relevancia de este modelo radica en su enfoque vertical: no es un modelo generalista, sino un modelo entrenado especificamente para el dominio financiero con datos curados y deduplicados de fuentes publicas con licencias permisivas. La licencia es estrictamente propietaria, lo que limita su uso comercial sin acuerdo escrito con Dragon Limited.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformers, text-generation) |
| Parametros totales | 14.000 millones (14B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (secuencia de entrenamiento: 1024 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | propietaria (Dragon Limited, todos los derechos reservados) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura concreta no se detalla en la informacion disponible, aunque el modelo se publica como pipeline de text-generation con la libreria transformers y pesos en formato safetensors. El entrenamiento se realizo mediante un ajuste fino completo de todos los parametros (sin LoRA ni otras tecnicas de adaptacion de bajo rango), sobre el corpus DragonData Finance, que abarca 58 shards de aproximadamente 40 millones de tokens cada uno, totalizando alrededor de 948.000 fragmentos de entrenamiento. La secuencia de entrenamiento es de 1024 tokens, el optimizador empleado fue AdamW en precision de 8 bits y el entrenamiento se realizo en precision BF16.

La infraestructura de entrenamiento es notable: una unica GPU NVIDIA RTX PRO 6000 Blackwell, propiedad de Dragon Limited. El corpus DragonData se describe como un conjunto de datos curado, deduplicado y organizado en 25 dominios del ambito financiero, construido exclusivamente a partir de fuentes gratuitas, publicas y con licencias permisivas, disenado especificamente para el preentrenamiento de modelos de lenguaje. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion posteriores al entrenamiento.

## Capacidades

- Generacion de texto especializada en el dominio financiero profesional, con conocimiento del corpus Sec-EDGAR completo.
- Comprension y procesamiento de documentos financieros: informes anuales (10-K), informes trimestrales (10-Q) y otros documentos regulatorios de la SEC.
- Soporte para tareas de contabilidad, auditoria, cumplimiento normativo, analisis de valores (securities), fusiones y adquisiciones, y gestion de fondos.
- Capacidad para operar como componente de agentes de IA on-premise, permitiendo consultas locales sin fuga de informacion.
- Multilingue: no, el modelo declara unicamente ingles (en).
- Tool calling, function calling y razonamiento multi-paso: no se menciona soporte explicito en la informacion disponible.

## Casos de uso

- Auditoria asistida: el modelo puede procesar y resumir grandes volumenes de documentos financieros regulatorios, facilitando la revision de estados financieros y la deteccion de inconsistencias en firmas de contabilidad y auditoria.
- Cumplimiento normativo: despachos de abogados especializados en securities, M&A y compliance pueden emplear el modelo para localizar y extraer clausulas relevantes en documentos legales y regulatorios de la SEC.
- Analisis de inversiones: asesores financieros y gestores de fondos pueden utilizar el modelo para sintetizar informacion de informes trimestrales y anuales de empresas cotizadas, apoyando la toma de decisiones de inversion.
- Banca de inversion: el modelo puede asistir en la preparacion de due diligence, resumen de documentacion financiera y generacion de informes preliminares en operaciones de IPO y M&A.
- Planificacion financiera personal y empresarial: CFPs y CFAs pueden emplear el modelo para generar explicaciones claras de productos financieros complejos, normativa fiscal y estrategias de planificacion patrimonial.
- Despliegue on-premise con agentes: integrado en la plataforma de agentes de Dragon Limited, el modelo permite a instituciones financieras consultar sus propios datos de forma local, evitando fugas de informacion sensible.
- Seguros: companias aseguradoras pueden utilizar el modelo para analizar polizas, reclamaciones y documentacion regulatoria del sector.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar que permitan comparar el rendimiento del modelo con alternativas del mercado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia orientativa, un modelo de 14.000 millones de parametros en precision BF16 requiere aproximadamente 28 GB de VRAM; con cuantizacion de 8 bits (INT8) se reduce a unos 14 GB, y con cuantizacion de 4 bits (INT4) a unos 7-8 GB.
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA RTX PRO 6000 Blackwell (48 GB VRAM). Para inferencia, una GPU con 24 GB o mas (RTX 4090, A100, H100) seria adecuada en precision completa; GPUs de 16 GB (RTX 4080, RTX 5070 Ti) podrian servir con cuantizacion.
- Compatibilidad con GPU de consumo: probablemente si con cuantizacion (4 bits u 8 bits), aunque no hay datos oficiales.
- Opciones de despliegue: al usar la libreria transformers y formato safetensors, es compatible con vLLM, TGI, llama.cpp y Ollama (si se convierte a GGUF). No se proporcionan integraciones oficiales.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. El modelo no publica benchmarks y su licencia propietaria impide el acceso a los pesos para evaluacion independiente. Como referencia de categoria, modelos abiertos del mismo tamano aproximado (13-14B) como Llama 2 13B, Mistral 7B o Qwen 14B podrian servir de comparacion en capacidades generales, pero no existe informacion publica sobre el rendimiento especifico de DragonCode Finance-14B en tareas financieras.

## Limitaciones y advertencias

- Licencia estrictamente propietaria: el acceso, uso, reproduccion, distribucion, modificacion y explotacion comercial estan prohibidos salvo acuerdo escrito con Dragon Limited. No es posible desplegar este modelo en produccion sin autorizacion explicita.
- Sesgos y alucinaciones: no hay informacion publica sobre evaluaciones de sesgo o fiabilidad. Al ser un modelo entrenado sobre un corpus financiero, podria reflejar sesgos presentes en los documentos de la SEC y otras fuentes publicas.
- Longitud de contexto: la secuencia de entrenamiento es de 1024 tokens, lo que sugiere una ventana de contexto limitada en comparacion con modelos actuales (que suelen ofrecer 8K, 32K o 128K tokens). Esto puede ser una limitacion significativa para el procesamiento de documentos financieros extensos.
- Idioma: el modelo solo soporta ingles. No es util para documentacion financiera en espanol u otros idiomas.
- Informacion incompleta: no se publican detalles de arquitectura, tokenizador, dataset de evaluacion ni benchmarks. La verificacion independiente de las capacidades declaradas no es posible.
- Verificacion del autor: la entidad Dragon Limited y su infraestructura (GPU Blackwell single) no pueden verificarse de forma independiente. La fecha de creacion (agosto de 2026) y el volumen del corpus (313B tokens) son afirmaciones del autor sin respaldo externo.
- Riesgo en produccion: sin benchmarks publicos ni licencia de uso, el modelo no es adecuado para despliegue en entornos de produccion reales.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/dragonlimited/DragonCode-Finance-14B
- Perfil del autor en HuggingFace: https://huggingface.co/dragonlimited/models
- Modelo relacionado DragonCode-150M: https://huggingface.co/dragonlimited/DragonCode-150M
