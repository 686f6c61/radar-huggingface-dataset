# pixeloffice/pixelrouter-openai-gateway

## Resumen

PixelRouter es un gateway de API compatible con OpenAI que actúa como enrutador inteligente de modelos de lenguaje, desarrollado por Pixel Office EU. No es un modelo de lenguaje en sí, sino una capa intermedia que recibe peticiones de los clientes y las redirige automáticamente al modelo fundacional más adecuado según criterios de velocidad y coste, entre los que se incluyen DeepSeek V3/Chat, Qwen Thinking 27B, Claude 3.5 Sonnet y Gemini 2.5 Pro. El proyecto se publica bajo licencia MIT y se distribuye como paquete npm (`@pixeloffice-eu/router`) y PyPI (`pixeloffice-router`), además de ofrecer un endpoint HTTP en `https://api.pixeloffice.eu/v1`.

La relevancia de este proyecto radica en su enfoque de "router inteligente" con enrutamiento automático, streaming SSE en tiempo real y un mecanismo denominado "Fact Anchoring" que promete reducir alucinaciones con una latencia de anclaje inferior a 35 ms. El repositorio en HuggingFace no contiene pesos ni artefactos de modelo; es un punto de distribución documental y de integración para desarrolladores que quieran conectar sus herramientas (Cursor IDE, VS Code, LangChain, CrewAI) a este servicio.

La ficha que sigue describe las características del servicio tal y como se presentan en la documentación oficial, sin datos técnicos adicionales más allá de los publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | API gateway / smart router (no es un modelo neuronal) |
| Parametros totales | no aplicable (servicio de enrutamiento) |
| Parametros activos | no aplicable |
| Longitud de contexto | depende del modelo enrutado (no especificado) |
| Tipos de cuantizacion | no aplicable |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | no aplicable (servicio cloud, sin pesos distribuidos) |

## Arquitectura y entrenamiento

PixelRouter no es un modelo de lenguaje entrenado, sino una infraestructura de enrutamiento que integra un motor denominado "BLUN Intelligence Engine". Segun la documentacion, el sistema decide en tiempo real a que modelo fundacional enviar cada peticion basandose en criterios de velocidad (TTFT) y coste. No se publican detalles sobre la implementacion interna del enrutador, los algoritmos de seleccion ni los datos de entrenamiento de los modelos subyacentes.

El servicio expone una API compatible con OpenAI, por lo que cualquier cliente que hable ese protocolo (SDK oficial de OpenAI, LangChain, CrewAI, Cursor, VS Code) puede conectarse sin cambios. Se anuncia soporte de streaming SSE con un TTFT inferior a 200 ms para los modelos rapidos y una latencia de "Fact Anchoring" inferior a 35 ms, aunque no se especifica en que consiste exactamente este mecanismo ni como se implementa.

## Capacidades

- Enrutamiento automatico entre multiples modelos: DeepSeek V3/Chat, Qwen Thinking 27B, Claude 3.5 Sonnet y Gemini 2.5 Pro.
- API compatible con OpenAI: permite usar clientes existentes sin modificaciones.
- Streaming SSE en tiempo real para respuestas parciales.
- Alias de modelo configurables: `blun-auto`, `deepseek-chat`, `thinkingcap-qwen`, `claude-3.5-sonnet`, `gemini-2.5-pro`.
- Reduccion de alucinaciones mediante "Fact Anchoring" (mecanismo no documentado en detalle).
- Integracion directa con Cursor IDE y VS Code mediante comando `npx @pixeloffice-eu/router`.
- Paquetes oficiales para Python y Node.js/TypeScript.
- Ahorro de costes declarado de hasta un 96% frente al uso directo de los modelos enrutados (segun la tabla del autor).

## Casos de uso

- Autocompletado de codigo en editores: el alias `deepseek-chat` esta orientado a autocompletado de alta velocidad, con TTFT inferior a 200 ms, adecuado para entornos como Cursor o VS Code donde la latencia es critica.
- Razonamiento arquitectonico profundo: el alias `thinkingcap-qwen` (Qwen 2.5 Thinking 27B) se recomienda para tareas que requieren analisis detallado, como diseno de sistemas o refactorizacion compleja, con una latencia mayor (~850 ms) pero mayor capacidad de razonamiento.
- Desarrollo de frontends complejos: `claude-3.5-sonnet` se sugiere para tareas que exigen comprension de sistemas de diseno o prompts de sistema elaborados, con ~650 ms de TTFT.
- Tareas con contexto largo y multi-archivo: `gemini-2.5-pro` cubre escenarios donde se necesita manejar grandes volumenes de contexto o multiples ficheros, con ~900 ms de TTFT.
- Integracion en pipelines de IA generativa: al ser compatible con OpenAI, puede usarse como backend en frameworks como LangChain o CrewAI para construir agentes que requieran enrutamiento dinamico entre modelos.
- Evaluacion de costes en produccion: el modo `blun-auto` permite delegar la eleccion del modelo al router, reduciendo costes operativos en entornos donde la carga de trabajo es heterogenea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento proporcionados por el autor son metricas de latencia del propio router:

| Alias | TTFT declarado | Ahorro de costes declarado |
|---|---|---|
| `blun-auto` | < 200 ms | 96% |
| `deepseek-chat` | < 200 ms | 96% |
| `thinkingcap-qwen` | ~ 850 ms | 85% |
| `claude-3.5-sonnet` | ~ 650 ms | Estandar |
| `gemini-2.5-pro` | ~ 900 ms | Estandar |

Estas cifras proceden de la documentacion del autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- No se requiere hardware local para usar PixelRouter: es un servicio alojado en la nube (endpoint `https://api.pixeloffice.eu/v1`).
- El despliegue se realiza mediante clientes ligeros: SDK de OpenAI, paquetes npm/PyPI o configuracion directa en Cursor/VS Code.
- No hay requisitos de VRAM, GPU ni memoria local.
- Para entornos de produccion, se necesita una clave API valida (la documentacion menciona `px_test_free` como clave de prueba, pero no se especifican limites ni planes de pago).
- La latencia depende de la infraestructura del proveedor y de la red del cliente; no se ofrecen datos de throughput ni de capacidad de concurrencia.

## Comparativa con modelos similares

PixelRouter compite con otros gateways de enrutamiento de modelos, no con modelos de lenguaje. Comparacion con alternativas conocidas:

| Caracteristica | PixelRouter | OpenRouter | OrcaRouter |
|---|---|---|---|
| Tipo | Gateway OpenAI-compatible | Gateway OpenAI-compatible | Gateway OpenAI-compatible |
| Modelos enrutados | DeepSeek, Qwen, Claude, Gemini | 200+ modelos | 200+ modelos |
| Latencia declarada | < 200 ms TTFT (modo rapido) | No especificada | No especificada |
| Mecanismo anti-alucinacion | "Fact Anchoring" (< 35 ms) | No documentado | No documentado |
| Licencia | MIT | Propietaria | Propietaria |
| Coste | Descuentos declarados hasta 96% | Modelo de pago por uso | Modelo de pago por uso |
| Integracion Cursor/VS Code | Si, via npx | Si, via configuracion manual | No documentado |

No se dispone de datos objetivos de rendimiento comparativo entre estos servicios.

## Limitaciones y advertencias

- El servicio depende de la disponibilidad y estabilidad de la infraestructura de Pixel Office EU; no hay garantias de SLA publicadas.
- La clave de prueba `px_test_free` puede tener limites de uso no documentados.
- El mecanismo "Fact Anchoring" no esta explicado tecnicamente; su eficacia para reducir alucinaciones no ha sido validada por terceros.
- Los modelos enrutados (DeepSeek, Qwen, Claude, Gemini) tienen sus propias limitaciones, sesgos y riesgos de alucinacion que se heredan en las respuestas.
- El idioma soportado es exclusivamente ingles segun los metadatos; no se garantiza un rendimiento optimo en otros idiomas.
- Al ser un servicio en la nube, los datos enviados a traves del gateway se procesan en servidores externos; conviene revisar la politica de privacidad del proveedor antes de usarlo con informacion sensible.
- No hay informacion sobre cumplimiento normativo (GDPR, HIPAA, etc.) ni sobre la ubicacion de los centros de datos.
- El proyecto tiene cero descargas y cero likes en HuggingFace al momento de la consulta, lo que sugiere una adopcion muy limitada o un lanzamiento reciente.

## Enlaces

- HuggingFace: https://huggingface.co/pixeloffice/pixelrouter-openai-gateway
- Portal de desarrolladores: https://pixeloffice.eu/developer
- Paquete npm: `@pixeloffice-eu/router` (v1.0.0)
- Paquete PyPI: `pixeloffice-router` (v1.0.0)
- Endpoint de API: `https://api.pixeloffice.eu/v1`
