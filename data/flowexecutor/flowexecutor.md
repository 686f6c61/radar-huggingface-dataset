# flowexecutor/flowexecutor

## Resumen

FlowExecutor (identificado en HuggingFace como `flowexecutor/flowexecutor`) no es un modelo de lenguaje en el sentido convencional. La model card lo describe como "el verificador de pagos de agentes en Base", un servicio que congela una afirmación de pago byte a byte, la recalcula desde la fuente (cadena, declaraciones, el propio registro) y publica la calificación de forma que cualquiera pueda auditar al auditor. El repositorio de HuggingFace no contiene pesos, arquitectura ni datos de entrenamiento; es un punto de publicación asociado a un servicio HTTP.

El problema que aborda es concreto: en el ecosistema de agentes que se pagan entre sí con USDC sobre Base, los leaderboards se basan en volumen autodeclarado y las afirmaciones de pago no se comprueban. Flow propone un mecanismo de verificación con recibos públicos, precios impresos antes de la venta y un índice de pruebas firmado y encadenado por hash. La relevancia, por tanto, es la de una infraestructura de confianza para pagos entre agentes, no la de un modelo generativo.

Dado que la información disponible no incluye arquitectura, parámetros, contexto, licencia ni idiomas, esta ficha documenta lo que el autor publica (servicio, precios, endpoints y modelo de reparto) y marca explícitamente como "no disponible" todo lo que no consta. No debe interpretarse como una ficha de modelo fundacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (servicio HTTP de verificación, no se documenta modelo subyacente) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no publica pesos; el acceso es vía API en https://flow-kg4x.vercel.app) |

## Arquitectura y entrenamiento

No se documenta ninguna arquitectura de red neuronal, dataset de entrenamiento, número de tokens, proceso de RLHF/DPO ni innovación de modelado. La model card describe exclusivamente el funcionamiento del servicio: congelación byte-exacta de una afirmación, recálculo desde la fuente (cadena, filings y el propio registro) y emisión de una calificación reproducible. El componente técnico destacable es el Proof Index: registros de evidencia firmados y encadenados por hash, verificables offline, que solo publican recuentos (sin porcentajes ni puntuaciones compuestas).

El servicio se factura en USDC mediante x402, con precios públicos fijados antes de cualquier venta e idénticos para todos los clientes. El reparto declarado de cada venta es 20 % al comprador, 50 % para Flow y 30 % al Uplift Fund destinado a la red Flow y sus usuarios. No hay información sobre el stack de inferencia, el modelo de lenguaje que, en su caso, procese las peticiones, ni sobre el proceso de entrenamiento.

## Capacidades

- Verificación básica gratuita de una afirmación de pago mediante `POST /api/verify`.
- Emisión de una calificación de contraparte previa al pago (PayCheck) para decidir si conviene pagar a un agente.
- Informe de alcance de autorización de una wallet de Base (Scope Report), con flujo de salida en el peor caso derivado por dos vías independientes.
- Auditoría de superficie completa (Full-Surface Audit) sobre la superficie del propio cliente, calificada tramo a tramo con el recálculo adjunto.
- Publicación de un índice de pruebas (`GET /api/index`) firmado y encadenado por hash, verificable offline.
- Atención de consultas públicas en X: acepta un hash de transacción, una afirmación de pago o una cifra de leaderboard, con la primera comprobación gratuita.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling genérico, agentes multi-paso ni multilingüismo.

## Casos de uso

- Verificación previa al pago entre agentes: antes de transferir USDC a un agente desconocido, el cliente solicita un PayCheck ($0.50) y obtiene una calificación de la contraparte basada en el recálculo desde la cadena y el registro, no en la afirmación del vendedor.
- Auditoría de leaderboards: un operador que sospecha que un ranking se infla con volumen autodeclarado puede enviar la cifra al Verification Desk (gratuito) y obtener una comprobación byte-exacta del dato antes de citarlo o invertir en función de él.
- Due diligence de wallets en Base: el Scope Report ($25) deriva el flujo de salida en el peor caso por dos vías independientes, útil para evaluar la exposición de una tesorería antes de autorizar permisos.
- Auditoría de la propia superficie de un agente: el Full-Surface Audit ($500) aplica la maquinaria de Flow al sistema del cliente y entrega una calificación tramo a tramo con el recálculo adjunto, aprovechable en revisiones internas o de terceros.
- Construcción de registros de evidencia verificables: integración del Proof Index (`GET /api/index`) en pipelines de compliance para disponer de recibos firmados y encadenados por hash que puedan verificarse offline sin depender del servicio.
- Moderación comunitaria en X: el equipo de Flow atiende en respuestas públicas afirmaciones de pago y cifras de leaderboard, lo que sirve como primera barrera de verificación para terceros que citan esos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica en el sentido habitual: no se publican pesos ni se documenta un modelo desplegable localmente.
- El acceso es mediante API HTTP en https://flow-kg4x.vercel.app; no se especifican requisitos de VRAM ni GPU.
- No consta soporte para vLLM, llama.cpp, Ollama ni TGI.
- No se publican métricas de latencia ni throughput del servicio.
- El coste de uso es por llamada en USDC: verificación básica gratuita, PayCheck $0.50, Scope Report $25 y Full-Surface Audit $500.

## Comparativa con modelos similares

| Servicio | Tipo | Precio de entrada | Verificación offline | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlowExecutor | Verificador de pagos de agentes en Base | Gratuito (básico) / $0.50 USDC (PayCheck) | Sí, vía Proof Index firmado y encadenado por hash | no disponible | API pública en flow-kg4x.vercel.app |
| Alternativas de verificación de pagos en Base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre servicios comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El repositorio de HuggingFace no contiene pesos, model card técnica ni artefactos de modelo; no debe tratarse como un modelo de lenguaje.
- La licencia no está declarada, lo que impide evaluar el uso comercial del servicio o de sus salidas.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas porque no hay modelo generativo descrito.
- La verificación depende de las fuentes que Flow consulte (cadena, filings, registro); la model card no detalla la cobertura ni los casos de fallo.
- El servicio se aloja en un dominio de Vercel y depende de su disponibilidad; el Proof Index se declara verificable offline, pero el resto de endpoints no.
- El modelo de reparto 20/50/30 y las cifras de ingresos son declaraciones del propio operador; la model card afirma publicar también los días de $0.00 y contar solo pagos liquidados de terceros, pero no se aportan pruebas independientes en la información disponible.
- No se especifican garantías de nivel de servicio, límites de tasa ni política de reembolso.
- Uso en producción: conviene verificar de forma independiente las calificaciones antes de automatizar decisiones de pago basadas en ellas.

## Enlaces

- HuggingFace: https://huggingface.co/flowexecutor/flowexecutor
- Sitio: https://flow-kg4x.vercel.app
- Proof Index: https://flow-kg4x.vercel.app/api/index
- X: https://x.com/FlowExecutor
