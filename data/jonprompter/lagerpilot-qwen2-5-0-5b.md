# jonprompter/LagerPilot-Qwen2.5-0.5B

## Resumen

LagerPilot-Qwen2.5-0.5B es un ajuste fino (fine-tuning) del modelo Qwen2.5-0.5B-Instruct desarrollado por el usuario jonprompter. Se trata de un modelo de lenguaje pequeno (SLM) de 494 millones de parametros, especializado en la conciliacion de recepciones de mercancia (Wareneingang) en almacenes alemanes y en el cumplimiento del articulo 377 del Codigo de Comercio aleman (HGB), que regula los plazos de reclamacion por defectos en la entrega. El modelo esta disenado para ejecutarse en hardware de borde (edge), como mini-PC o terminales de almacen, sin dependencia de la nube.

El problema que aborda es concreto: bajo el parrafo 377 del HGB, si un comerciante no reclama formalmente defectos, faltas de cantidad o entregas incorrectas en un plazo muy breve, la mercancia se considera legalmente aceptada y se pierden las garantias. LagerPilot-Qwen pretende automatizar la generacion de dictamenes (FREIGABE, MÄNGELRÜGE_ERFORDERLICH, SPERRE), la conversion de unidades de embalaje y la redaccion de notificaciones legales formales de reclamacion, asi como la generacion de payloads para el movimiento SAP MIGO (BAPI_GOODSMVT_CREATE).

El modelo tiene 494.032.768 parametros, un repositorio de 2,0 GB, licencia Apache 2.0 y soporta aleman e ingles. Su relevancia radica en que es un ejemplo de especializacion vertical de un modelo pequeno para un dominio regulatorio muy concreto, con despliegue local que evita exposicion de datos bajo el RGPD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Tamano del repositorio | 2,0 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atencion causal estandar, heredada de Qwen2.5-0.5B-Instruct. El ajuste fino se ha realizado sobre este modelo base, presumiblemente mediante LoRA (existe un repositorio separado jonprompter/LagerPilot-Qwen2.5-0.5B-LoRA), aunque la model card no detalla la configuracion exacta del entrenamiento, el numero de tokens utilizados ni la composicion del dataset.

La model card menciona el uso de "guardrails" integrados en el motor de borde y describe una pipeline que combina OCR de albaranes, ordenes de compra del ERP y notas de rampa con el modelo para producir decisiones deterministas en tres niveles. No se especifica si hubo RLHF, DPO u otras tecnicas de alineacion, ni se detalla la innovacion tecnica mas alla de la especializacion del dominio. El modelo se presenta como listo para Ollama y Docker Compose.

## Capacidades

- Generacion de texto conversacional en aleman e ingles.
- Razonamiento especializado en logistica de almacen y cadena de suministro.
- Conversion de unidades de embalaje (Kartons/Gebinde a Stück).
- Clasificacion determinista en tres estados: FREIGABE (liberacion), MÄNGELRÜGE_ERFORDERLICH (reclamacion necesaria) y SPERRE (bloqueo).
- Redaccion de notificaciones legales formales bajo el § 377 HGB y § 439 BGB.
- Generacion de payloads para movimientos SAP MIGO (tipos 101, 103, 122) mediante BAPI_GOODSMVT_CREATE.
- Manejo de escenarios de incidencia: faltantes, excesos, sustituciones (Aliud), danos en transporte, mercancias peligrosas (ADR/GGVSEB/REACH), caducidad (MHD), certificados de calidad (EN 10204 3.1) y entregas multidireccion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explicitamente, aunque la pipeline descrita sugiere integracion en un flujo automatizado.

## Casos de uso

- Auditoria de recepcion de mercancia en rampa: el modelo compara el albaran OCR con la orden de compra del ERP y emite un dictamen de tres niveles (FREIGABE, MÄNGELRÜGE_ERFORDERLICH, SPERRE) antes de que expire el plazo legal del § 377 HGB.
- Generacion automatica de reclamaciones legales: ante un faltante o defecto, el modelo redacta una notificacion formal en aleman conforme al § 377 HGB, evitando la perdida de garantias por silencio.
- Integracion con SAP MIGO: el modelo produce payloads BAPI_GOODSMVT_CREATE para movimientos 101 (entrada a libre disponibilidad), 103 (bloqueo) y 122 (devolucion), reduciendo la intervencion manual en el ERP.
- Conversion de unidades de embalaje: traduce cantidades expresadas en cajas, palets o envases a unidades individuales, un paso propenso a errores en la conciliacion de albaranes.
- Deteccion de incidencias de transporte y mercancias peligrosas: identifica fugas, falta de fichas de datos de seguridad (SDS) o destinatarios incorrectos y activa el bloqueo (SPERRE) con contencion ADR/WHG.
- Verificacion de certificados de calidad y caducidad: comprueba la presencia de certificados EN 10204 3.1 y la vida util restante (MHD) frente a los requisitos de la orden de compra.
- Despliegue en terminales de almacen sin conexion: al ser un modelo de 0,5B y ejecutarse en CPU, puede correr en mini-PC o terminales Zebra en el propio muelle, cumpliendo con el RGPD al no enviar datos a la nube.

## Benchmarks y rendimiento

La model card reporta un "stress test" de 10 casos de uso con un 100% de acierto (10/10), segun la tabla incluida en la documentacion del autor. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| ID | Escenario | Categoria | Estado esperado | Estado real | Aviso § 377 | Resultado |
|:---|:---|:---|:---:|:---:|:---:|:---:|
| UC-01 | Entrada limpia: 20 cajas de 50 uds = 1.000 uds | Conversion VPE | FREIGABE | FREIGABE | No | Pasa |
| UC-02 | Faltante no anunciado: 420 uds vs 500 PO | Defecto de cantidad | MÄNGELRÜGE | MÄNGELRÜGE | Si | Pasa |
| UC-03 | Exceso: 350 uds vs 200 PO | Sobrecantidad | MÄNGELRÜGE | MÄNGELRÜGE | Si | Pasa |
| UC-04 | Sustitucion no autorizada: Rev B en lugar de Rev A | Especificacion (Aliud) | MÄNGELRÜGE | MÄNGELRÜGE | Si | Pasa |
| UC-05 | Dano en transporte: palet aplastado, cajas mojadas | Transito fisico | MÄNGELRÜGE | MÄNGELRÜGE | Si (CMR) | Pasa |
| UC-06 | Fuga de mercancia peligrosa: UN 1219, sin SDS | ADR/GGVSEB/REACH | SPERRE | SPERRE | Si (bloqueo) | Pasa |
| UC-07 | Caducidad: 6 semanas restantes vs 12 meses | Calidad/MHD | MÄNGELRÜGE | MÄNGELRÜGE | Si | Pasa |
| UC-08 | Certificado de calidad faltante: EN 10204 3.1 | Defecto de cumplimiento | MÄNGELRÜGE | MÄNGELRÜGE | Si | Pasa |
| UC-09 | Entrega erronea del transportista: mercancia de terceros | Error logistico | SPERRE | SPERRE | Si (rechazo) | Pasa |
| UC-10 | Entrega multilinea: lineas 1 y 3 limpias, linea 2 corta en 5 uds | Division multiitem | MÄNGELRÜGE | MÄNGELRÜGE | Si (parcial) | Pasa |

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 494M de parametros, en precision FP16 requiere aproximadamente 1 GB de VRAM; en cuantizacion de 4 bits, alrededor de 0,3-0,5 GB.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU. Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en iGPU.
- Cabe en consumer GPU: si, en practicamente cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: Ollama (soporte explicito segun la model card), Docker Compose, llama.cpp (formato GGUF presumiblemente, aunque no se detalla), vLLM y TGI (compatibles con Qwen2, aunque no confirmados en la documentacion).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| LagerPilot-Qwen2.5-0.5B | 494M | no disponible | Apache 2.0 | Logistica alemana / § 377 HGB | Hugging Face |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens (segun documentacion de Qwen) | Apache 2.0 | Proposito general | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1.540M | 32.768 tokens (segun documentacion de Qwen) | Apache 2.0 | Proposito general | Hugging Face |
| SmolLM2-360M-Instruct | 360M | 8.192 tokens (segun documentacion de SmolLM2) | Apache 2.0 | Proposito general | Hugging Face |

La comparativa con modelos de dominio logistico especializado no esta disponible, ya que no se han identificado alternativas publicas equivalentes en la informacion proporcionada. Los datos de contexto de los modelos comparados provienen de la documentacion publica de sus respectivos autores, no de la informacion de esta ficha.

## Limitaciones y advertencias

- El modelo es un ajuste fino de un SLM de 0,5B, por lo que su capacidad de razonamiento general y su conocimiento factual son limitados en comparacion con modelos de mayor tamano.
- Riesgo de alucinacion en la generacion de referencias legales o payloads SAP: la model card no documenta mecanismos de verificacion mas alla de los "guardrails" mencionados, cuyo funcionamiento no se detalla.
- La evaluacion reportada (10/10) es un stress test propio del autor, no un benchmark independiente ni estandarizado; no debe interpretarse como garantia de rendimiento en produccion.
- El soporte de idiomas se limita a aleman e ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide evaluar su idoneidad para documentos largos.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la aplicacion en un contexto regulatorio (reclamaciones legales bajo el § 377 HGB) requiere supervision humana y validacion juridica; el modelo no sustituye asesoramiento legal.
- No se detalla la composicion del dataset de entrenamiento, lo que impide evaluar sesgos especificos del dominio.
- El repositorio tiene pocas descargas (328) y cero likes, lo que sugiere una adopcion limitada y poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jonprompter/LagerPilot-Qwen2.5-0.5B
- Version LoRA: https://huggingface.co/jonprompter/LagerPilot-Qwen2.5-0.5B-LoRA
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Texto del § 377 HGB: https://www.gesetze-im-internet.de/hgb/__377.html
- Repositorio GitHub (referenciado en la model card, URL generica): https://github.com/your-username/LagerPilot-Qwen.git
- Ollama: https://ollama.com/
