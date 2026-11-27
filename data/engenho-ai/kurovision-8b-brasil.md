# engenho-ai/KuroVision-8B-Brasil

## Resumen

KuroVision-8B-Brasil es un modelo multimodal de vision-lenguaje desarrollado por Engenho AI dentro de su "Linha Kuro". Se trata de un ajuste fino (fine-tune) del modelo Qwen2.5-VL-7B-Instruct de Alibaba, orientado especificamente a tareas de vision por computador en el contexto brasileno: OCR de documentos oficiales (DANFE/NF-e, CNH, boletos), lectura de matriculas Mercosur, interpretacion de senalizacion viaria CONTRAN y automatizacion de interfaces graficas (GUI agents).

El modelo parte de una arquitectura transformer multimodal con 8.767 millones de parametros totales y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su relevancia radica en la especializacion regional: frente a modelos genericos de vision-lenguaje, KuroVision incorpora ajuste sobre documentos y normativa brasilena, un nicho con alta demanda en automatizacion de back-office, logistica y cumplimiento fiscal.

La publicacion incluye pesos en formato safetensors (17,5 GB de repositorio) y variantes GGUF de aproximadamente 5,5 GB de VRAM, pensadas para GPUs de 8 GB o mas. El modelo soporta portugues e ingles, y esta disenado tanto para inferencia conversacional como para integracion en pipelines de agentes que interactuan con pantallas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), base Qwen2.5-VL |
| Parametros totales | 8.767.123.696 (8,77 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (variante publicada ~5,5 GB VRAM); otras no disponibles |
| Idiomas soportados | Portugues (pt), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

KuroVision-8B-Brasil es un fine-tune del modelo Qwen2.5-VL-7B-Instruct, que combina un codificador visual con un modelo de lenguaje transformer para tareas de image-text-to-text. La arquitectura subyacente es la de Qwen2.5-VL, disenada para procesar imagenes y texto de forma conjunta, con capacidad de razonamiento sobre documentos, capturas de pantalla y escenas visuales.

El autor no detalla en la model card el volumen de tokens de entrenamiento, la composicion del dataset de ajuste ni si se emplearon tecnicas de RLHF o DPO. La especializacion declarada se centra en OCR de documentos brasilenos (DANFE/NF-e, CNH, boletos), matriculas Mercosur, senalizacion viaria CONTRAN y automatizacion de GUI. No se han publicado innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras) en la informacion disponible.

## Capacidades

- Generacion de texto e inferencia multimodal a partir de imagenes y texto (pipeline image-text-to-text).
- OCR especializado en documentos brasilenos: DANFE/NF-e, CNH (permiso de conducir) y boletos bancarios.
- Reconocimiento de matriculas de vehiculos con formato Mercosur.
- Interpretacion de senalizacion viaria conforme a la normativa CONTRAN.
- Automatizacion de interfaces graficas (GUI agents): comprension de capturas de pantalla para interaccion con aplicaciones.
- Conversacion multi-turno en portugues e ingles.
- Capacidades generales heredadas de Qwen2.5-VL-7B-Instruct (razonamiento visual, descripcion de imagenes).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades de audio o thinking mode: no disponibles.

## Casos de uso

- Digitalizacion de facturas electronicas (NF-e/DANFE): el modelo extrae campos estructurados (CNPJ, valores, impuestos, claves de acceso) de imagenes o PDFs escaneados, reduciendo la introduccion manual en sistemas de contabilidad y ERP.
- Validacion de documentos de identidad en onboarding: lectura de CNH para verificar datos personales y categoria de conducir en procesos KYC, aprovechando el ajuste especifico sobre este tipo de documento brasileno.
- Procesamiento de boletos bancarios: extraccion de linea digitavel, beneficiario, fecha de vencimiento e importe para conciliacion automatica de pagos.
- Control de acceso vehicular y logistica: reconocimiento de matriculas Mercosur en imagenes de camaras para peajes, parkings o control de flotas.
- Asistencia a la conduccion y analisis de infracciones: deteccion e interpretacion de senalizacion viaria CONTRAN en imagenes para sistemas de soporte o auditoria de rutas.
- Automatizacion de tareas de back-office (RPA con vision): el modelo actua como agente GUI que interpreta capturas de pantalla de aplicaciones legacy y guia la interaccion, reduciendo la dependencia de selectores fragiles.
- Moderacion y auditoria documental: revision automatizada de documentacion fiscal o regulatoria con salida en portugues para equipos de cumplimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,5 GB con la variante GGUF publicada; el repositorio completo en safetensors ocupa 17,5 GB, por lo que la inferencia en precision completa requiere del orden de 18-20 GB de VRAM (estimacion orientativa segun el tamano de pesos).
- GPU recomendadas: para GGUF, GPUs consumer de 8 GB o mas (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070); para safetensors en BF16, GPUs de 24 GB o mas (RTX 3090, RTX 4090, A100 40 GB, H100).
- Cabe en GPU consumer: si, en configuracion GGUF con 8 GB o mas de VRAM.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM o TGI para safetensors (segun compatibilidad con la arquitectura qwen3_vl); transformers para inferencia directa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| KuroVision-8B-Brasil | 8,77 B | No disponible | pt, en | Apache 2.0 | Vision-lenguaje especializado en documentos y normativa brasilena |
| Qwen2.5-VL-7B-Instruct | ~7 B | No disponible | Multilingue | Apache 2.0 | Vision-lenguaje generalista (modelo base) |
| Alternativas OCR especializadas | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa cuantitativa de rendimiento entre KuroVision-8B-Brasil y sus alternativas no esta disponible en la informacion proporcionada. La diferencia principal frente a su modelo base es la especializacion regional en documentos y senalizacion brasilena.

## Limitaciones y advertencias

- Al ser un fine-tune de Qwen2.5-VL-7B-Instruct, hereda los sesgos y limitaciones del modelo base, no documentados en la model card.
- Riesgo de alucinacion en la extraccion de campos de documentos: en produccion conviene validar con reglas de negocio o checksums (por ejemplo, digitos verificadores de CNPJ o linea digitavel).
- Cobertura idiomatica limitada a portugues e ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- La longitud de contexto no esta documentada, lo que dificulta planificar cargas de trabajo con documentos extensos o conversaciones largas.
- No se detalla el dataset de ajuste ni el proceso de entrenamiento, lo que limita la evaluacion de robustez y posibles sesgos en documentos reales.
- Aunque la licencia Apache 2.0 permite uso comercial, el autor no ofrece garantias sobre exactitud en entornos regulados (fiscal, KYC); se recomienda evaluacion propia antes de desplegar.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, por lo que no existe validacion comunitaria publica de su rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/engenho-ai/KuroVision-8B-Brasil
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
