# aion-analytics-india/aion-edge-engine

## Resumen

AION Edge Engine es un servicio de inferencia alojado, desarrollado por AION Analytics (India), que actúa como capa de inteligencia de mercado para opciones sobre índices indios: NIFTY, BANK NIFTY y SENSEX. No es un modelo de lenguaje generativo ni un modelo de pesos abiertos: es un sistema propietario, accesible únicamente a través de una API gestionada, que emite juicios estructurados sobre la "negociabilidad" (*tradability*) de un estado de mercado intradía. Su propósito declarado es responder a una pregunta acotada: si el estado actual del mercado contiene evidencia suficiente para operar o si conviene mantenerse al margen.

El repositorio de Hugging Face no distribuye pesos, datos de entrenamiento ni código de inferencia; funciona como ficha de producto y contrato de salida. La relevancia del sistema radica en su enfoque de "confianza calibrada": puede abstenerse de emitir señal cuando la evidencia es insuficiente y expone telemetría auditable (intervalos de confianza, valor esperado, modo sombra) en lugar de una puntuación opaca única.

No se dispone de información pública sobre arquitectura interna, número de parámetros, longitud de contexto ni composición del dataset de entrenamiento. La información disponible se limita al contrato de salida JSON, los casos de uso previstos y las limitaciones declaradas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (sistema propietario alojado; no se publica la arquitectura interna) |
| Parametros totales | No disponible (no se distribuyen pesos) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se distribuyen pesos; inferencia exclusivamente vía API) |
| Idiomas soportados | No disponible (la salida es JSON estructurado con campos en inglés) |
| Licencia | `aion-edge-engine-license` (licencia propietaria "other"; acceso mediante API gestionada) |
| Formato de pesos | No disponible (no se publican pesos; solo API REST) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo (transformer, MoE, SSM u otra), el volumen o composición de los datos de entrenamiento, ni si se emplearon técnicas de RLHF, DPO o calibración supervisada. La model card indica explícitamente que "no model weights, training data, or proprietary model internals are distributed through this repository".

El diseño funcional sí está documentado a nivel de contrato: el sistema enruta la inferencia por instrumento subyacente (`edge_model_key`, con valores como `model:edge:nifty`), lo que sugiere modelos o configuraciones específicas por índice. Expone simultáneamente la tradabilidad cruda del modelo (`edge_tradable_raw`) y la tradabilidad aplicada tras las compuertas de política en tiempo de ejecución (`edge_tradable`), lo que permite auditar divergencias entre el juicio del modelo y las reglas operativas. También incorpora un modo sombra (`edge_shadow_mode`) para validación en papel antes de la aplicación en vivo.

## Capacidades

- Emisión de un juicio estructurado de tradabilidad (booleano) a partir del estado intradía del mercado.
- Cálculo de contexto de valor esperado (`edge_ev`) y telemetría de intervalos de confianza (`edge_conf_low`, `edge_conf_high`).
- Enrutamiento específico por subyacente para NIFTY, BANK NIFTY y SENSEX.
- Abstención explícita cuando la evidencia es insuficiente (capacidad de "mantenerse en silencio").
- Salida auditable que preserva campos crudos y aplicados por política.
- Modo sombra para validación en papel y análisis post-operación.
- Contexto de días hasta vencimiento (`edge_expiry_days`) en el momento de la inferencia.
- No soporta tool calling, agentes multi-paso, visión, audio ni generación de texto libre.

## Casos de uso

- **Filtro pre-operación**: integrar la llamada a la API antes de la lógica de entrada existente para suprimir señales en estados de mercado con baja evidencia; el sistema está diseñado precisamente para bloquear entradas de baja calidad antes de que lleguen al motor de ejecución.
- **Monitorización de régimen de mercado**: consumir `edge_ev` y los límites de confianza de forma continua para detectar cuándo las condiciones mejoran o se degradan, alimentando paneles de revisión.
- **Auditoría y análisis post-operación**: comparar `edge_tradable_raw` con `edge_tradable` frente a resultados posteriores para evaluar si las compuertas de política mejoran o degradan el rendimiento.
- **Validación en papel**: usar `edge_shadow_mode` para recoger decisiones en modo sombra durante un periodo de prueba antes de habilitar la aplicación en vivo en un pipeline de ejecución.
- **Herramientas de infraestructura financiera**: integrar el endpoint en sistemas de monitorización y alertas para operadores de mesas de derivados sobre índices indios.
- **Investigación cuantitativa**: incorporar la telemetría de confianza como variable exógena en modelos de investigación que estudien la relación entre evidencia de mercado y resultados de opciones sobre índices.
- **Integración vía MCP**: la página de suscripción menciona acceso mediante API y/o MCP, lo que permite conectar el servicio a agentes y flujos de trabajo automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, calibración, AUC, tasa de acierto direccional ni comparaciones cuantitativas con alternativas. Tampoco se documentan latencias ni throughput del endpoint.

## Requisitos de hardware

- No aplica hardware local: el sistema es API-first y los pesos no se distribuyen.
- No es posible ejecutar el modelo en GPU de consumo (RTX 4090, etc.) ni en A100/H100, ya que no hay artefactos descargables.
- Opciones de despliegue: exclusivamente la API gestionada en `https://aionanalytics.in/api/v1/edge`, con peticiones medidas y rechazo de solicitudes por encima de la cuota.
- No se publican estimaciones de latencia ni throughput.
- Existe un endpoint público de estado sin clave: `GET https://aionanalytics.in/api/v1/edge/underlyings`.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (filtros pre-operación para opciones sobre índices indios) con parámetros, contexto o licencia verificables.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AION Edge Engine | No disponible | No disponible | Propietaria (`aion-edge-engine-license`) | API gestionada |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No predice dirección ni magnitud exactas del movimiento; solo evalúa tradabilidad contextual.
- Las rupturas estructurales repentinas pueden no reflejarse hasta que el sistema observe el nuevo estado de mercado.
- Las relaciones históricas pueden debilitarse en cambios de régimen, modificaciones regulatorias o shocks de liquidez.
- Las salidas en modo sombra son para validación en papel y auditoría, no para autoridad de decisión en vivo.
- Uso fuera de alcance declarado: ejecución ciega como señal autónoma, predicción de precios, decisiones de cumplimiento o idoneidad, mercados fuera del ámbito indio y scalping de latencia ultrabaja.
- Licencia propietaria: no se distribuyen pesos ni código; el uso comercial requiere suscripción a la API y está sujeto a cuotas y a los términos del plan contratado. La capa gratuita de "Indian Market Intelligence" no implica acceso gratuito a Edge Engine.
- Riesgo de dependencia de proveedor: toda la inferencia pasa por un servicio gestionado externo, sin posibilidad de despliegue on-premise ni de auditoría del modelo subyacente.
- No se documentan sesgos conocidos ni tasas de alucinación; al no ser un modelo generativo, el riesgo relevante es de calibración y de falsos positivos/negativos en la señal de tradabilidad.
- Commodities anunciados como "coming soon" no están disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/aion-analytics-india/aion-edge-engine
- Página de producto y documentación de la API: https://aionanalytics.in/models/edge-engine
- Catálogo de APIs y planes de acceso: https://aionanalytics.in/apis
- Suscripción: https://aionanalytics.in/subscribe/edge-engine
- Guía de usuario (PDF): https://aionanalytics.in/docs/aion-edge-engine-user-guide.pdf
- Endpoint público de estado (sin clave): https://aionanalytics.in/api/v1/edge/underlyings
- Organización GitHub oficial: https://github.com/AION-Analytics-India
- Base URL de la API: https://aionanalytics.in/api/v1/edge
