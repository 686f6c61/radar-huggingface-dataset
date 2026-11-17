# haku85/ThirdeyeAI

## Resumen

Thirdeye AI Platform es un proyecto publicado en Hugging Face por el usuario haku85 que **no contiene pesos de modelo**. Se trata de un repositorio de presencia institucional en el Hub para una plataforma de inferencia con API compatible con OpenAI, que enruta peticiones a varios proveedores upstream (OpenAI, Anthropic, Groq, DeepSeek) en lugar de servir un modelo propio. La plataforma ofrece autenticación mediante wallet Ethereum (SIWE), créditos prepago financiados con USDC en Base o USDG en Robinhood Chain, y facturación por llamada expuesta en la cabecera `x-thirdeye-cost-usd`.

El proyecto se enmarca en el ecosistema de agentes y pagos onchain: incluye soporte declarado para MCP (Model Context Protocol) y x402 (protocolo de pagos HTTP), y mantiene un token ERC-20 separado llamado THIRDEYE en la red Base con un supply fijo de 1.000.000.000 de unidades y un pool de liquidez en Uniswap v4. La model card es explícita al señalar que no publica benchmarks, latencias ni porcentajes de uptime, y remite esas métricas a una página de estado independiente.

Es relevante ahora como ejemplo de la categoría de "repositorios de plataforma" en Hugging Face: espacios que usan el Hub como escaparate y punto de descubrimiento para servicios de inferencia agregada, no como distribución de artefactos de modelo. Para un desarrollador que busque un modelo concreto que descargar y ejecutar localmente, este repositorio no es el recurso adecuado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se distribuyen pesos; servicio de enrutamiento a proveedores upstream) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE propio) |
| Longitud de contexto | no disponible (depende del modelo upstream seleccionado en el catálogo) |
| Tipos de cuantizacion | no disponible (no se sirven pesos; la cuantización la gestiona cada proveedor upstream) |
| Idiomas soportados | en (inglés, según metadatos del repositorio) |
| Licencia | Apache-2.0 (aplica al contenido del repositorio: model card, assets de marca y artefactos futuros; no cubre los pesos upstream ni el contrato del token) |
| Formato de pesos | no disponible (el repositorio no contiene pesos; tamaño del repo: 0.0 GB) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: este repositorio no describe un modelo entrenado. La "arquitectura" del servicio es un gateway de inferencia compatible con la API de OpenAI que enruta cada petición al proveedor upstream que esté sano en cada momento, según se indica en la model card. El catálogo accesible vía `GET /api/v1/models` es la fuente de verdad sobre qué modelos se sirven y a qué precio; la card advierte que cualquier modelo no listado debe considerarse no disponible.

No se proporciona información sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO), porque el proyecto no entrena modelos propios. Tampoco se documentan innovaciones técnicas de inferencia (decodificación especulativa, atención lineal, etc.). La única característica técnica diferencial declarada es la agregación multi-proveedor con enrutamiento por salud y la posibilidad de "bring your own keys" para enrutar credenciales propias de OpenAI, Anthropic, Groq o DeepSeek pagando solo el medidor.

## Capacidades

- Generación de texto y razonamiento: disponibles en la medida en que lo estén los modelos upstream del catálogo, no como capacidad propia del repositorio.
- Codigo y matematicas: ídem, delegado al modelo upstream seleccionado.
- Tool calling / function calling: la plataforma se anuncia como compatible con OpenAI, lo que en la práctica implica soporte del esquema de tools de esa API, aunque la card no detalla qué modelos del catálogo lo soportan.
- Agentes y razonamiento multi-paso: el repositorio incluye la etiqueta `agents` y declara soporte de MCP (Model Context Protocol), orientado a integración de herramientas en flujos agénticos.
- Pagos por petición: soporte de x402 (pagos HTTP) y créditos prepago con USDC en Base o USDG en Robinhood Chain.
- Autenticación sin contraseña: inicio de sesión con wallet Ethereum mediante SIWE.
- Capacidades multilingües: el metadato de idioma del repositorio es solo `en`; no se documentan otras lenguas.
- Capacidades especiales (visión, audio, thinking mode): no disponibles en la información proporcionada.

## Casos de uso

- **Prototipado rápido de aplicaciones LLM sin gestionar claves de varios proveedores**: un desarrollador puede apuntar su cliente compatible con OpenAI a `https://thirdeye-ai-alpha.vercel.app/api/v1` y cambiar de modelo upstream sin reescribir la integración, consultando el catálogo en `GET /api/v1/models`.
- **Control de coste por petición en producción**: la cabecera `x-thirdeye-cost-usd` en cada respuesta permite instrumentar métricas de gasto por usuario o por feature sin construir un medidor propio, útil en entornos donde el coste variable por llamada es un requisito de negocio.
- **Agentes autónomos con pago por uso**: la combinación de x402 y créditos prepago en USDC permite que un agente financie sus propias llamadas sin intervención humana, un patrón relevante para pipelines agénticos que operan de forma continua.
- **Integración de herramientas vía MCP**: para equipos que ya usan Model Context Protocol en su orquestación, la plataforma se presenta como endpoint compatible, lo que facilita conectar servidores MCP existentes sin adaptadores adicionales.
- **Enrutamiento con claves propias (BYOK)**: una organización que ya tiene contratos con OpenAI, Anthropic, Groq o DeepSeek puede enrutar sus credenciales y usar la plataforma solo como capa de metering y agregación, manteniendo la relación contractual con cada proveedor.
- **Autenticación Web3 en aplicaciones con usuarios cripto-nativos**: el login SIWE con wallet Ethereum evita gestionar contraseñas y correos, adecuado para productos dirigidos a usuarios de Base o del ecosistema DeFi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no incluye puntuaciones de benchmark, cifras de latencia ni porcentajes de uptime, y remite esas métricas a la página de estado del proyecto, que no forma parte de la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el repositorio no contiene pesos y la inferencia se ejecuta en infraestructura de los proveedores upstream.
- GPU recomendadas: no disponible; depende del proveedor upstream y del modelo seleccionado en el catálogo.
- Ejecución en GPU de consumo: no aplica en local; el acceso es exclusivamente vía API HTTP.
- Opciones de despliegue: cliente compatible con la API de OpenAI (SDK oficial, LangChain, LlamaIndex, etc.) apuntando a la base URL de la plataforma. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, porque no hay pesos que servir.
- Latencia y throughput: no disponibles; la card evita deliberadamente publicar cifras y las delega a la página de estado.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo sino un punto de entrada a un servicio de inferencia agregada; no se han proporcionado datos de rendimiento, precios por modelo ni especificaciones que permitan una comparación cuantitativa con alternativas como OpenRouter, Together AI o Fireworks AI. Cualquier comparación sería especulativa.

## Limitaciones y advertencias

- **El repositorio no contiene pesos**: quien busque un modelo descargable, reproducible o auditable no lo encontrará aquí; el tamaño del repo es de 0.0 GB.
- **Dependencia de terceros**: la calidad, latencia y disponibilidad dependen de proveedores upstream no especificados en la card; el catálogo puede cambiar sin aviso y la card advierte que lo no listado debe considerarse no disponible.
- **Ausencia de métricas verificables en el repositorio**: no hay benchmarks, latencias ni uptime publicados; las cifras se remiten a una página de estado externa que no se ha podido verificar con la información disponible.
- **Riesgo de alucinación**: inherente a los modelos upstream; la plataforma no documenta capas de mitigación propias.
- **Idioma**: el metadato declara únicamente inglés; no se garantiza calidad en castellano ni en otras lenguas.
- **Token asociado**: THIRDEYE es un activo onchain separado del repositorio, con supply fijo de 1.000.000.000 y pool en Uniswap v4; la propia card indica que no es asesoramiento financiero ni oferta de valores. Cualquier evaluación del token debe hacerse contra el contrato y el pool, no contra esta ficha.
- **Licencia**: Apache-2.0 cubre solo el contenido del repositorio (card, assets de marca y artefactos futuros); no se extiende a los pesos upstream ni al contrato del token, que tienen sus propias licencias.
- **Madurez**: el proyecto se encuentra en fase alpha (la URL de la API incluye `-alpha`), con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia pública de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/haku85/ThirdeyeAI
- Website: https://thirdeye-ai-alpha.vercel.app
- Documentación: https://thirdeye-ai-alpha.vercel.app/docs
- Guía de API: https://thirdeye-ai-alpha.vercel.app/docs/api
- Whitepaper: https://thirdeye-ai-alpha.vercel.app/whitepaper
- Estado del servicio: https://thirdeye-ai-alpha.vercel.app/status
- Contacto y verificación: https://thirdeye-ai-alpha.vercel.app/contact
- X (Twitter): https://x.com/Thirdeye_Infra
- Telegram: https://t.me/Thirdeye_AI_Bot
- Perfil de agente (Abund.ai): https://abund.ai/agent/thirdeye
- Código fuente: https://github.com/hakuramasam/thirdeye-ai
- API base URL: https://thirdeye-ai-alpha.vercel.app/api/v1
