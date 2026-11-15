# Leonluniverse1/openclaw-hf

## Resumen

HuggingClaw (publicado en Hugging Face como `Leonluniverse1/openclaw-hf`) es un paquete de despliegue, no un modelo de pesos entrenado. Se trata de una configuración lista para duplicar en Hugging Face Spaces que empaqueta OpenClaw, un asistente de IA open source que normalmente requiere hardware propio (por ejemplo, un Mac Mini), y lo hace funcionar sobre el tier gratuito de Spaces (2 vCPU, 16 GB de RAM). El repositorio tiene 0,0 GB de tamano, lo que confirma que no contiene pesos de modelo: es un contenedor Docker con scripts de orquestación.

El problema que resuelve es de infraestructura y persistencia. OpenClaw, al ejecutarse en local, tiene privilegios completos del sistema; HuggingClaw lo aisla en un contenedor en la nube y sortea dos limitaciones de Spaces: la pérdida de datos en cada reinicio (resuelta mediante sincronización con un Dataset de Hugging Face) y los fallos DNS en dominios como WhatsApp (resueltos con DNS-over-HTTPS). El asistente no trae un LLM propio: se conecta a OpenAI, Claude, Gemini, OpenRouter (200+ modelos) o un Ollama local mediante una API compatible con OpenAI.

Es relevante ahora porque demuestra un patrón de despliegue de agentes conversacionales multicanal (WhatsApp, Telegram y más de 40 canales) sin coste de servidor, y porque el autor lo extiende con "HuggingClaw World", un ecosistema de agentes autónomos (God, Adam, Eve, Cain) que se comunican mediante el protocolo A2A v0.3.0. La licencia es MIT. No se dispone de información sobre arquitectura de red neuronal, parámetros ni contexto, ya que el repositorio no incluye un modelo generativo propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: paquete de despliegue Docker (contenedor) sobre OpenClaw; el LLM subyacente es externo y configurable |
| Parametros totales | No disponible (no contiene pesos de modelo) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (depende del LLM externo configurado) |
| Tipos de cuantizacion | No disponible (depende del backend LLM elegido; p. ej. Ollama local) |
| Idiomas soportados | No disponibles (el panel de HuggingClaw Home muestra conversaciones bilingües EN/ZH) |
| Licencia | MIT |
| Formato de pesos | No disponible (repositorio de 0,0 GB; imágenes Docker y scripts, sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

No hay entrenamiento de un modelo de lenguaje en este repositorio. La arquitectura es la de OpenClaw: un asistente open source con sistema de memoria propio, personalidad definida en un fichero `SOUL.md`, y una capa de integración con canales de mensajería. HuggingClaw lo empaqueta como imagen Docker (SDK `docker`, puerto 7860) para Hugging Face Spaces, anadiendo dos mecanismos correctivos: sincronización periódica de estado con un Dataset de Hugging Face para sobrevivir a los reinicios del Space, y resolución DNS mediante DNS-over-HTTPS para evitar los bloqueos de resolución en dominios de mensajería.

La capa multiagente se apoya en el protocolo A2A (Agent-to-Agent) v0.3.0 a través del gateway `win4r/openclaw-a2a-gateway`. Cada agente corre en su propio Space con su propio backend LLM y memoria, y un coordinador ligero (`scripts/conversation-loop.py`) gestiona el bucle de conversación entre Adam y Eve, la delegación de tareas de código a Claude Code CLI mediante bloques `[TASK]` y la creación y supervisión de Cain. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF o DPO, porque no existe un proceso de entrenamiento asociado. El dataset referenciado (`tao-shen/HuggingClaw-data`) se usa como almacenamiento persistente, no como corpus de entrenamiento.

## Capacidades

- Asistente conversacional multicanal: integración con WhatsApp, Telegram y más de 40 canales adicionales mediante OpenClaw.
- Conexión a cualquier LLM mediante API compatible con OpenAI: OpenAI, Claude, Gemini, OpenRouter (200+ modelos, con tier gratuito) o un Ollama autoalojado.
- Memoria persistente entre reinicios del Space gracias a la sincronización con un Dataset de Hugging Face.
- Soporte de agentes autónomos y comunicación agente-a-agente mediante el protocolo A2A v0.3.0.
- Delegación de tareas de programación a Claude Code CLI a través de bloques `[TASK]` en el bucle de conversación.
- Supervisión autónoma: el agente "God" monitoriza a la familia de agentes mediante Claude Code y corrige el mecanismo de orquestación.
- Panel visual en tiempo real (HuggingClaw Home) con animaciones pixel-art que reflejan el estado de cada agente: idle, working, syncing o error.
- Conversación bilingüe EN/ZH en el panel de HuggingClaw Home.
- Despliegue en un clic: duplicar el Space y configurar dos secretos.
- No se documentan capacidades de visión, audio, tool calling genérico ni modo de razonamiento extendido más allá de lo que aporte el LLM externo configurado.

## Casos de uso

- Asistente personal en WhatsApp y Telegram sin servidor propio: se duplica el Space, se configuran los secretos del canal y del proveedor LLM, y el asistente queda operativo de forma continua sobre el tier gratuito de Hugging Face. Es adecuado porque elimina el coste de un Mac Mini u otro equipo siempre encendido.
- Evaluación rápida de proveedores LLM: al ser compatible con la API de OpenAI, se puede cambiar entre OpenRouter, OpenAI, Claude o Gemini modificando únicamente las variables de entorno, lo que permite comparar respuestas y costes sin reescribir la integración.
- Prototipado de agentes multi-turno con memoria: el sistema de memoria integrado de OpenClaw y la persistencia vía Dataset permiten mantener contexto entre sesiones y reinicios, útil para bots de soporte que necesitan recordar al usuario.
- Experimentación con orquestación multiagente: HuggingClaw World sirve como banco de pruebas de comunicación A2A entre agentes con roles diferenciados (supervisor, arquitecto, control de calidad), con delegación de tareas de código a Claude Code CLI.
- Bot de comunidad o soporte en canales de mensajería: la cobertura de más de 40 canales permite desplegar un mismo asistente en varias plataformas sin mantener integraciones separadas.
- Demostración docente de despliegue de agentes en la nube: el flujo de duplicar Space, configurar secretos y observar el panel pixel-art en tiempo real es un ejemplo reproducible de arquitectura de agentes con persistencia y aislamiento.
- Autoalojamiento con Ollama para privacidad: apuntando el backend a una instancia local de Ollama se evita enviar conversaciones a proveedores externos, manteniendo el contenedor como capa de mensajería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene un modelo de lenguaje propio que evaluar; el rendimiento dependerá enteramente del LLM externo configurado y de los recursos del Space (2 vCPU, 16 GB de RAM en el tier gratuito).

## Requisitos de hardware

- VRAM estimada: no aplica al repositorio en sí; depende del LLM elegido. Con backends en la nube (OpenRouter, OpenAI, Claude, Gemini) no se requiere VRAM local.
- Con Ollama local, los requisitos vendrán determinados por el modelo descargado: un modelo de 7B en cuantización Q4 requiere aproximadamente 4-5 GB de VRAM; uno de 13B en Q4, aproximadamente 8 GB; uno de 70B en Q4, en torno a 40 GB.
- GPU recomendadas para el contenedor: ninguna. Hugging Face Spaces gratuito proporciona 2 vCPU y 16 GB de RAM sin GPU.
- Cabe en GPU de consumo: el contenedor sí; el LLM local solo si se elige un modelo de tamano adecuado (por ejemplo, RTX 4090 de 24 GB para modelos de hasta 30B en cuantizaciones agresivas).
- Opciones de despliegue: Hugging Face Spaces con SDK Docker (vía principal), Docker autoalojado, y conexión a vLLM, Ollama o cualquier endpoint compatible con la API de OpenAI como backend LLM.
- Latencia y throughput: no disponibles. Dependen del proveedor LLM, de la red y del plan del Space; el tier gratuito no ofrece garantías de rendimiento sostenido.

## Comparativa con modelos similares

| Aspecto | HuggingClaw | OpenClaw (autoalojado) | Bot conversacional con API directa |
|---|---|---|---|
| Naturaleza | Paquete de despliegue Docker | Asistente open source | Integración a medida |
| Pesos de modelo | No incluye | No incluye | No incluye |
| Hardware requerido | Ninguno (tier gratuito de Spaces) | Equipo propio siempre encendido | Servidor o función serverless |
| Persistencia entre reinicios | Sí, vía Dataset de Hugging Face | Sí, en disco local | Depende de la implementación |
| Canales de mensajería | WhatsApp, Telegram y 40+ | Según configuración | Uno o pocos, a medida |
| Multiagente A2A | Sí, v0.3.0 | No documentado | No |
| Licencia | MIT | Según el proyecto OpenClaw | Variable |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento, ya que ninguno de los elementos comparados incluye un modelo generativo propio.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no contiene pesos, no se puede evaluar con MMLU, HumanEval ni GSM8K, y su calidad depende íntegramente del LLM externo configurado.
- El tier gratuito de Hugging Face Spaces ofrece 2 vCPU y 16 GB de RAM sin SLA; el rendimiento puede degradarse y el Space puede dormir o reiniciarse, aunque la persistencia vía Dataset mitiga la pérdida de estado.
- El repositorio figura con 0 descargas y 0 likes y un tamano de 0,0 GB, lo que sugiere que los artefactos pueden no estar publicados o que el proyecto es muy reciente; conviene verificar la integridad antes de usarlo en producción.
- La fecha de creación indicada (2026-11-15) es futura respecto a la información habitual de publicación; verificar la procedencia y autenticidad del repositorio.
- Los idiomas soportados no están declarados en la model card; el panel muestra EN/ZH, pero la cobertura real depende del LLM subyacente.
- Riesgo de alucinación heredado del LLM elegido; no hay mecanismos de verificación documentados en la capa de orquestación.
- La delegación de tareas a Claude Code CLI y la supervisión autónoma entre agentes implican ejecución de código y modificaciones de configuración sin intervención humana; en producción conviene limitar permisos y revisar los cambios.
- El autor sostiene que el despliegue en contenedor aislado es más seguro que ejecutar OpenClaw en local con privilegios completos del sistema; aun así, se almacenan credenciales de canales y proveedores LLM como secretos del Space, lo que exige gestión cuidadosa.
- Licencia MIT: permite uso comercial, pero no se ofrece garantía alguna ni soporte; la responsabilidad sobre el LLM externo y los términos de los proveedores recae en el usuario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Leonluniverse1/openclaw-hf
- Space de HuggingClaw: https://huggingface.co/spaces/tao-shen/HuggingClaw
- Repositorio GitHub de HuggingClaw: https://github.com/tao-shen/HuggingClaw
- Proyecto OpenClaw: https://github.com/openclaw/openclaw
- Gateway A2A de OpenClaw: https://github.com/win4r/openclaw-a2a-gateway
- Documentación de variables de entorno de OpenClaw: https://openclawdoc.com/docs/reference/environment-variables
- Dataset de persistencia: https://huggingface.co/datasets/tao-shen/HuggingClaw-data
- HuggingClaw Home: https://huggingface.co/spaces/tao-shen/HuggingClaw-Home
- HuggingClaw Adam: https://huggingface.co/spaces/tao-shen/HuggingClaw-Adam
- HuggingClaw Eve: https://huggingface.co/spaces/tao-shen/HuggingClaw-Eve
- HuggingClaw Cain: https://huggingface.co/spaces/tao-shen/HuggingClaw-Cain
