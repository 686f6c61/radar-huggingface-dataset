# Jun33550336/lar-os-antigravity-gateway

## Resumen

El repositorio `Jun33550336/lar-os-antigravity-gateway` no contiene un modelo de inteligencia artificial, sino un servidor proxy de doble protocolo diseñado para integrar clientes de IA como Google Antigravity IDE, Tencent WorkBuddy AI y Claude Code CLI con múltiples backends de modelos. Desarrollado por Gia Bao Huynh (Jun) bajo la arquitectura LAR-OS, este gateway actúa como un intermediario no destructivo que evita parchear binarios de Electron, ofreciendo una solución actualizable y compatible con actualizaciones automáticas.

El proyecto implementa un servidor asíncrono FastAPI/Uvicorn en el puerto local 18797, con endpoints compatibles con OpenAI (`/v1/chat/completions`) y Anthropic (`/v1/messages`). Su arquitectura de tres niveles combina la API gratuita de Google Gemini, un consorcio de navegadores con cuota cero (Comet, Edge, Chrome, Opera Neon) y capas gratuitas de proveedores cloud como NVIDIA NIM, OpenRouter y Groq. Aunque no es un modelo en sí, su relevancia radica en facilitar el acceso a modelos de IA sin coste y con alta disponibilidad, especialmente en entornos de desarrollo integrados.

La licencia declarada en el README es MIT, aunque los metadatos de HuggingFace indican "no disponible". El proyecto se presenta como "production ready" y cuenta con una comunidad de inspiración basada en trabajos previos de extensión de Antigravity y proxies para Claude Code.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proxy asíncrono FastAPI/Uvicorn (no es un modelo de IA) |
| Parametros totales | no disponible (no aplica, es software) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (depende del backend, hasta 1M-2M con Gemini) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (depende de los modelos backend) |
| Licencia | MIT (según README; metadatos de HF: no disponible) |
| Formato de pesos | no disponible (no aplica, es código Python) |

## Arquitectura y entrenamiento

Este proyecto no es un modelo entrenado, sino un middleware de enrutamiento. Su arquitectura consiste en un servidor FastAPI que expone dos interfaces de API: una compatible con OpenAI y otra con Anthropic. Internamente, traduce las peticiones entrantes al formato requerido por cada backend y gestiona la comunicación con tres niveles de proveedores: el SDK `google-genai` o Chrome CDP para Gemini, un consorcio de cuatro navegadores (Comet, Edge, Chrome, Opera Neon) que ejecutan consenso paralelo entre Perplexity, Copilot, Gemini y ChatGPT, y capas gratuitas de NVIDIA NIM, OpenRouter y Groq. No existe entrenamiento de pesos; la lógica se basa en traducción de protocolos, caché y enrutamiento dinámico.

## Capacidades

- Enrutamiento de peticiones de chat a múltiples backends de IA (Gemini, Perplexity, Copilot, ChatGPT, Llama 3.3, etc.).
- Traducción bidireccional entre protocolos OpenAI y Anthropic.
- Soporte de streaming y tool usage (según la inspiración de `free-claude-code`).
- Integración nativa con Google Antigravity IDE mediante "Add Model" y con Claude Code CLI mediante variables de entorno.
- Consenso multi-motor mediante navegadores con cuota cero, permitiendo respuestas paralelas de varios proveedores.
- Gestión de caché para reducir latencia y consumo de cuotas.
- Endpoint de salud y listado de modelos (`/health`, `/v1/models`).

## Casos de uso

- Desarrollo en Google Antigravity IDE sin coste: el gateway permite añadir modelos como `gemini-2.5-flash` o `deepseek-r1-quad` a través de la configuración oficial de "Add Model", evitando parchear binarios y manteniendo compatibilidad con actualizaciones.
- Uso de Claude Code CLI con backends gratuitos: configurando `ANTHROPIC_BASE_URL` y `ANTHROPIC_API_KEY`, se puede ejecutar `claude` apuntando al gateway, que redirige a Gemini o a los navegadores sin coste.
- Prototipado rápido de agentes multi-proveedor: el consorcio de navegadores permite comparar respuestas de Perplexity, Copilot, Gemini y ChatGPT en paralelo, útil para evaluar calidad o generar consenso.
- Entornos de desarrollo con restricciones de red: al ser un proxy local, centraliza el acceso a múltiples APIs en un solo punto, simplificando la gestión de claves y cuotas.
- Automatización de tareas de codificación asistida: integrado con IDEs, puede gestionar conversaciones multi-turno con contexto largo (hasta 1M-2M tokens vía Gemini) para refactorización, generación de tests o documentación.
- Evaluación de modelos gratuitos: al listar modelos disponibles y enrutar peticiones, sirve como banco de pruebas para comparar respuestas de diferentes proveedores sin coste inicial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un proxy, su rendimiento depende de los backends subyacentes y de la latencia de red. No hay métricas de throughput ni latencia propias del gateway.

## Requisitos de hardware

- Al ser un servidor Python asíncrono, los requisitos son mínimos: CPU de un solo núcleo y 256 MB de RAM son suficientes para el proxy en sí.
- Para el consorcio de navegadores se necesitan cuatro navegadores instalados (Comet, Edge, Chrome, Opera Neon) con sus puertos de depuración remota (9222-9225), lo que implica mayor consumo de RAM (aproximadamente 1-2 GB adicionales).
- No requiere GPU, ya que no ejecuta inferencia local; toda la carga de cómputo recae en los backends remotos.
- Despliegue recomendado en localhost o en una máquina de desarrollo; no está diseñado para producción a gran escala.
- Compatible con Python 3.10+ y requiere FastAPI y Uvicorn (se puede ejecutar con `uv run --with fastapi --with uvicorn`).

## Comparativa con modelos similares

No es un modelo de IA, por lo que la comparativa se establece con otras soluciones de proxy o integración:

| Solución | Tipo | Protocolos | Backends | Licencia | Mantenimiento |
|---|---|---|---|---|---|
| LAR-OS Gateway | Proxy dual | OpenAI + Anthropic | Gemini, navegadores, cloud free | MIT | Activo (2026) |
| antigravity-add-model (vahapogut) | Parche de binarios | OpenAI | Cualquier proveedor | no disponible | Requiere re-parcheo en cada actualización |
| free-claude-code (Alishahryar1) | Proxy local | Anthropic | Backends gratuitos | no disponible | Enfocado solo en Claude Code |

## Limitaciones y advertencias

- No es un modelo de IA: no ofrece capacidades de generación propias; depende completamente de los backends externos.
- El uso de navegadores con cuota cero puede violar los términos de servicio de los proveedores (Perplexity, Copilot, ChatGPT), con riesgo de bloqueo de cuentas o IPs.
- La disponibilidad de los backends gratuitos es variable; las cuotas diarias (1.500 RPD en Gemini, 1.000 RPD en NVIDIA NIM) pueden agotarse rápidamente en uso intensivo.
- No hay garantía de privacidad: las peticiones se envían a terceros; no apto para datos sensibles o entornos regulados.
- La licencia MIT permite uso comercial, pero el uso de los backends subyacentes está sujeto a sus propias licencias y términos.
- El proyecto tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere una adopción muy limitada y posible falta de pruebas en entornos reales.
- La fecha de creación (2026-09-02) es futura respecto a la fecha actual, lo que podría indicar un error en los metadatos o un proyecto especulativo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jun33550336/lar-os-antigravity-gateway
- Repositorio GitHub (mencionado en el README): https://github.com/giabaohuynhasu/lar-os-antigravity-gateway
- Proyecto inspirador antigravity-add-model: https://github.com/vahapogut/antigravity-add-model
- Proyecto inspirador free-claude-code: https://github.com/Alishahryar1/free-claude-code
- Google Antigravity: https://antigravity.google/
- Documentación del agente Antigravity en Gemini API: https://ai.google.dev/gemini-api/docs/antigravity-agent
- Noticia sobre Gemini Omni y Antigravity 2.0: https://cybernews.com/ai-news/google-io-2026-gemini-omni-antigravity-agentic-ai/
