# mirdax25-ux/Bodul

## Resumen

Bodulski HAL (publicado como `mirdax25-ux/Bodul`) es un sistema Python ejecutable que implementa una capa de control determinista para verificar afirmaciones generadas por agentes de IA. No es un modelo de lenguaje preentrenado: no contiene pesos, no realiza inferencia neuronal y no genera texto de forma probabilistica. Su funcion es recibir una afirmacion estructurada junto con evidencia, una politica y un instante de evaluacion, y emitir un veredicto determinista (APPROVE, BLOCK o ESCALATE) acompanado de un recibo SHA-256. El autor lo presenta como un "limite de afirmaciones fail-closed" que bloquea cualquier claim sin soporte documental suficiente.

El problema que aborda es la falta de trazabilidad y control en pipelines agenticos: cuando un LLM upstream produce una afirmacion, el sistema que la consume necesita una forma auditable de decidir si se acepta, se rechaza o se escala a revision humana. Bodulski HAL ofrece esa decision sin generacion estocastica: para entradas, politica y tiempo de evaluacion fijos, el resultado serializado es identico en cada ejecucion. La version del algoritmo es 2.1.2 y el contrato JSON es v3.

Es relevante como pieza de infraestructura para arquitecturas agenticas con requisitos de auditoria (integraciones MCP, verificacion de claims en produccion), pero conviene subrayar que no elimina las alucinaciones de un LLM aguas arriba ni autentica la procedencia de la evidencia. Su utilidad depende de que la aplicacion llamante respete el veredicto emitido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema Python determinista (validador de esquema, compuertas de frescura/autoridad/contradiccion y clasificador por politica); no es una red neuronal |
| Parametros totales | No aplica (no contiene pesos de modelo) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (no es un modelo generativo) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica (codigo Python; contrato JSON v3; recibos SHA-256) |

## Arquitectura y entrenamiento

El flujo es explicito y secuencial: validacion de esquema y tipos sobre la afirmacion estructurada, la evidencia aportada, la politica y el tiempo de evaluacion; despues, compuertas de frescura, autoridad y contradiccion; a continuacion, clasificacion determinista y decision de politica; y finalmente un resultado con motivo y recibo SHA-256 que la aplicacion llamante debe hacer cumplir. El nucleo de verificacion usa solo la biblioteca estandar de Python sobre CPU, sin servicio de inferencia.

No hay entrenamiento, ajuste fino ni RLHF: el comportamiento se define por reglas y politica, no por datos. La prueba de determinismo publicada por el autor cubre un fixture sintetico con entrada y tiempo de evaluacion fijos: 1000 ejecuciones produjeron 1000 resultados serializados identicos, con latencia p50 de 0,1524 ms y p95 de 0,2647 ms en Python 3.12.14 sobre AMD64. Esa medicion excluye HTTP, interfaz de usuario, arranques en frio, escalado de carga y exactitud frente a la verdad externa, y no constituye un SLA alojado.

## Capacidades

- Verificacion determinista de afirmaciones estructuradas con evidencia adjunta y marca temporal original.
- Clasificacion en tres decisiones: APPROVE, BLOCK y ESCALATE.
- Compuertas de frescura (evidencia caducada), autoridad (permisos insuficientes) y contradiccion entre evidencias.
- Emision de recibo de integridad SHA-256 por resultado, con motivo de la decision.
- Integracion como Actor MCP autenticado en Apify y exposicion mediante API Gradio documentada (codigo fuente disponible; Space alojado pendiente).
- Ignora indicadores de aprobacion humana aportados por el llamante: las afirmaciones de alto riesgo siguen requiriendo revision.
- No autentica fuentes externas ni recupera URLs por si mismo.

## Casos de uso

- Verificacion de claims en pipelines agenticos: cada afirmacion producida por un LLM se envia al verificador con su evidencia y politica; el orquestador solo ejecuta acciones cuando el veredicto es APPROVE, y escala o bloquea en el resto de casos.
- Auditoria y trazabilidad regulatoria: el recibo SHA-256 y el motivo asociado a cada decision permiten reconstruir por que se acepto o rechazo una afirmacion en un flujo con requisitos de cumplimiento.
- Integracion MCP en asistentes corporativos: el Actor en Apify permite conectar el verificador como herramienta MCP para que un agente consulte la validez de sus propias afirmaciones antes de responder al usuario.
- Control de frescura de datos en informes automatizados: si la evidencia tiene una marca temporal anterior al umbral de la politica, la compuerta de frescura bloquea o escala la afirmacion, evitando publicar datos caducados.
- Gestion de autoridad en flujos multiagente: cuando un agente intenta afirmar algo fuera de su ambito de permisos, la compuerta de autoridad fuerza ESCALATE hacia revision humana.
- Deteccion de contradicciones en fuentes multiples: si dos evidencias aportadas se contradicen, el verificador no eleva ninguna a hecho y devuelve BLOCK, lo que sirve como pre-filtro en procesos de consolidacion documental.
- Pruebas de regresion en sistemas de IA: el determinismo del nucleo permite usarlo como oraculo en tests automatizados que comprueben que un pipeline no aprueba afirmaciones sin evidencia.

## Benchmarks y rendimiento

Los unicos datos publicados son de determinismo y latencia del nucleo sobre un fixture sintetico, no de calidad de modelo. No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la informacion disponible.

| Metrica | Valor observado |
|---|---|
| Repeticiones | 1000 |
| Resultados serializados identicos | 1000 |
| Latencia p50 del nucleo | 0,1524 ms |
| Latencia p95 del nucleo | 0,2647 ms |
| Entorno | Python 3.12.14, AMD64, CPU |
| Exclusiones | HTTP, UI, arranques en frio, escalado de carga, exactitud frente a verdad externa |

## Requisitos de hardware

- VRAM: no aplica; el sistema no usa GPU ni inferencia neuronal.
- CPU: cualquier maquina capaz de ejecutar Python 3.12 o superior; el benchmark se realizo sobre AMD64.
- GPU recomendadas: no aplica.
- Cabe en cualquier equipo de consumo: si, al ser codigo Python de biblioteca estandar.
- Despliegue: ejecucion local con `python run_example.py`, integracion como Actor MCP en Apify, o servicio Gradio (codigo fuente en el repositorio; Space alojado pendiente por HTTP 402 en Hugging Face).
- Latencia: p50 de 0,1524 ms y p95 de 0,2647 ms por evaluacion del nucleo en el entorno medido; el throughput no se ha publicado y depende del despliegue (HTTP, colas, etc.).

## Comparativa con modelos similares

No disponible. Bodulski HAL no es un modelo de lenguaje y no existen en la informacion proporcionada alternativas comparables de la misma categoria con datos verificables.

## Limitaciones y advertencias

- No es un LLM ni sustituye a uno: no genera texto, no razona sobre lenguaje natural y no contiene pesos.
- El objetivo de "0 % de alucinaciones" no es una metrica medida ni garantizada; solo describe el comportamiento fail-closed del verificador ante entradas fijas.
- Evidencia fabricada, adaptadores incorrectos y aplicaciones que ignoran el veredicto quedan fuera de la garantia.
- El recibo SHA-256 no autentica las fuentes externas ni la procedencia de la evidencia.
- El determinismo demostrado cubre un unico fixture sintetico, no una garantia de correccion sin restricciones.
- No recupera URLs ni valida por si mismo la veracidad de la evidencia aportada.
- La demo publica no debe recibir secretos ni datos personales; la retencion de logs del alojamiento requiere revision aparte.
- El Space Gradio no esta desplegado (HTTP 402 en Hugging Face); solo hay codigo fuente para ejecucion local.
- Licencia Apache 2.0 sin garantias de servicio, autenticacion de fuentes ni verdad en el mundo real.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mirdax25-ux/Bodul
- Repositorio del motor determinista: https://huggingface.co/mirdax25-ux/deterministic-engine
- Actor MCP autenticado en Apify: https://apify.com/bodul/bodulskihal-claim-verifier
- Codigo fuente del Space Gradio: https://huggingface.co/mirdax25-ux/Bodul/tree/main/gradio-space
- GitHub del autor: https://github.com/mirdax25-ux
- X del autor: https://x.com/ddddddd97424402
- LinkedIn del autor: https://www.linkedin.com/in/damir-balenovic-594015429/
