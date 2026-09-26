# doral2277/bot-ventas-ia

## Resumen

`doral2277/bot-ventas-ia` no es un modelo de lenguaje con pesos publicados, sino un Space de Hugging Face con SDK Docker que empaqueta una aplicación comercial denominada NexSales AI 2.0. El repositorio ocupa 0,0 GB, no declara pipeline, licencia ni idiomas, y no contiene safetensors ni GGUF: su función es orquestar modelos de terceros (Llama 3.3 70B, DeepSeek R1, Mistral Large 2, GPT-4o, entre otros) a través de API externas como NVIDIA NIM, Groq, OpenRouter u OpenAI, o de instancias locales vía Ollama.

El problema que aborda es la automatización de ventas conversacionales: el bot atiende clientes por WhatsApp Web, responde consultas de precio y stock a partir de listas cargadas en Excel, CSV, JSON o PDF, y decide de forma autónoma cuándo consultar internet mediante DuckDuckGo o Tavily. La capa de aplicación incluye reconexión automática de la sesión de WhatsApp, un supervisor tipo watchdog para operación 24/7 y un panel de control web.

Su relevancia actual es limitada y debe contextualizarse: acumula 0 descargas y 0 me gusta, no publica benchmarks ni especificaciones técnicas propias, y su rendimiento depende enteramente de los modelos externos que el usuario configure. Como referencia de arquitectura de agentes comerciales puede resultar útil, pero no como modelo evaluable en términos de parámetros, contexto o calidad de generación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplicable: no es un modelo neuronal, es una aplicación Docker que orquesta LLM de terceros |
| Parámetros totales | No disponible (el repositorio no publica pesos) |
| Parámetros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible; depende del proveedor y del modelo seleccionado (NVIDIA API, Groq, OpenRouter, OpenAI u Ollama local) |
| Tipos de cuantización | No disponible; depende del modelo de terceros o de la cuantización elegida en una instancia local de Ollama |
| Idiomas soportados | No disponible; el repositorio no los declara y dependerían del LLM subyacente |
| Licencia | No disponible |
| Formato de pesos | No aplicable: no se distribuyen pesos |
| SDK del Space | Docker (app_port 7860) |
| Tamaño del repositorio | 0,0 GB |
| Descargas / me gusta | 0 / 0 |
| Fecha de creación | 2026-09-25 |
| Última actualización | 2026-09-25 |
| Etiqueta declarada | region:us |
| Autor | doral2277 |

## Arquitectura y entrenamiento

No existe entrenamiento asociado a este repositorio. La aplicación actúa como una capa de orquestación: recibe mensajes de WhatsApp, construye el contexto conversacional, inyecta la lista de precios cargada por el usuario y enruta la petición al proveedor configurado mediante una clave de API. El enrutado se conmuta desde un panel de ajustes entre OmniRoute local (que el autor describe como gratuito y con acceso a Llama 3.3 70B, DeepSeek R1 y NVIDIA NIM), la API oficial de NVIDIA (`meta/llama-3.3-70b-instruct`, `mistralai/mistral-large-2-instruct`, `deepseek-ai/deepseek-r1`), Groq, OpenRouter y OpenAI (GPT-4o, GPT-4o-mini).

Los componentes técnicos descritos en la model card son de integración, no de aprendizaje: un puente de WhatsApp basado en Baileys con sesión persistente en `whatsapp_bridge/auth_info_baileys/`, un supervisor `service_24_7.py` que reinicia los servicios caídos en menos de tres segundos, un panel web en el puerto 8000 y lanzadores para Windows (`INICIAR_24_7.bat`, `INICIAR_SILENCIOSO_24_7.vbs`, `INSTALAR_AUTO_INICIO_WINDOWS.bat`). También se describe un mecanismo de búsqueda autónoma en internet y una política de respuesta denominada "regla suprema de precisión comercial", que limita la respuesta al dato solicitado. No se documentan datos de entrenamiento, composición de dataset, técnicas de alineamiento como RLHF o DPO, ni innovaciones de decodificación.

## Capacidades

- Conversación multi-turno orientada a ventas por WhatsApp Web, con memoria de conversaciones cortas y largas según la descripción del autor.
- Consulta de precios y stock desde ficheros Excel (`.xlsx`, `.xls`), CSV, JSON y PDF cargados por el usuario.
- Conmutación entre proveedores de inferencia con una sola acción desde el panel (NVIDIA API, Groq, OpenRouter, OpenAI, Ollama local).
- Búsqueda autónoma en internet cuando el bot estima que la consulta requiere información externa, mediante DuckDuckGo o Tavily.
- Simulación de escritura humana en WhatsApp (estado "escribiendo...") antes de enviar la respuesta.
- Operación continua 24/7 con reconexión automática de la sesión de WhatsApp y reinicio de servicios caídos.
- Autoarranque en Windows mediante scripts de instalación de inicio automático.
- No se declara soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito; cualquier capacidad de este tipo dependería del modelo externo seleccionado y no del repositorio.

## Casos de uso

- Atención comercial en pymes: el bot responde consultas de precio y disponibilidad consultando la lista cargada en Excel o CSV, lo que permite cubrir horario completo sin personal dedicado.
- Cierre de ventas por WhatsApp: al limitar la respuesta al dato solicitado y añadir una pregunta de cierre, encaja en flujos de venta directa donde el cliente pregunta por un producto concreto.
- Catálogos extensos en PDF: la carga de listas de precios en PDF permite atender catálogos que el operador mantiene en documentos, sin migrar a una base de datos.
- Comparativas y dudas de compatibilidad: la búsqueda autónoma en DuckDuckGo o Tavily permite responder sobre especificaciones o precios de la competencia que no figuran en el catálogo propio.
- Prototipado rápido de un agente comercial: permite validar el guion de ventas y el tono de respuesta antes de invertir en infraestructura propia, cambiando de proveedor de inferencia con una conmutación.
- Despliegue sin GPU: al delegar la inferencia en API externas, puede ejecutarse en un equipo de oficina o en el propio Space de Hugging Face sin acelerador local.
- Operación desatendida en comercio minorista: los lanzadores de autoarranque y el watchdog permiten dejar el sistema funcionando en un PC de tienda que se reinicia a diario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas de latencia o throughput, y al no contener pesos propios no procede atribuirle resultados de los modelos que orquesta.

## Requisitos de hardware

- VRAM para inferencia: no disponible en la información proporcionada. Al delegar la inferencia en API externas, el requisito local es 0 GB de VRAM para el modelo.
- GPU recomendadas: no disponibles; no se documenta ningún requisito de acelerador propio.
- Compatibilidad con GPU de consumo: la arquitectura descrita (panel web, puente de WhatsApp, watchdog y clientes HTTP) es viable en CPU. El uso de Ollama local exigiría una GPU acorde al modelo elegido, dato que el repositorio no especifica.
- Opciones de despliegue: Space de Hugging Face con SDK Docker en el puerto 7860; ejecución local en Windows mediante `run.py` o los lanzadores `.bat` y `.vbs`; panel de control en `http://127.0.0.1:8000`. No se mencionan vLLM, llama.cpp, TGI ni Ollama como parte del despliegue propio, aunque Ollama aparece como proveedor opcional.
- Latencia y throughput: no disponibles. Dependerán íntegramente de la API o del modelo externo configurado y de la latencia de red.
- Almacenamiento: el repositorio ocupa 0,0 GB; el espacio necesario en disco vendrá determinado por la sesión de Baileys y por los modelos locales que el usuario decida instalar por su cuenta.

## Comparativa con modelos similares

No se dispone de datos verificables de benchmarks ni de licencia para establecer una comparativa cuantitativa. La comparación solo puede hacerse a nivel estructural y cualitativo:

| Criterio | doral2277/bot-ventas-ia (NexSales AI 2.0) | Frameworks de bots conversacionales autoalojados (categoría) |
|---|---|---|
| Naturaleza | Aplicación Docker de orquestación de LLM de terceros | Frameworks de diálogo con o sin modelo propio |
| Pesos publicados | No | No disponible / variable según proyecto |
| Licencia | No disponible | No disponible en la información consultada |
| Contexto propio | No aplicable (heredado del proveedor) | No disponible |
| Benchmarks publicados | Ninguno | No disponible |
| Canal de mensajería | WhatsApp Web vía Baileys (no oficial) | No disponible |
| Coste de inferencia | Depende del proveedor (API de pago o Ollama local) | No disponible |

La búsqueda web realizada no ha devuelto alternativas comparables con datos técnicos verificables, por lo que no se incluye una comparación numérica.

## Limitaciones y advertencias

- No es un modelo: no hay pesos, arquitectura, tokenizador ni contexto propios; cualquier evaluación de calidad debe hacerse sobre el LLM externo que se configure.
- Licencia no declarada: la ausencia de licencia impide confirmar si el uso comercial, la redistribución o la modificación están permitidos.
- Sin validación de la comunidad: 0 descargas y 0 me gusta, sin benchmarks ni informes de terceros. No hay evidencia pública de funcionamiento en producción.
- Riesgo de alucinación: la generación de precios y disponibilidad depende del LLM subyacente; si el dato no se recupera correctamente del Excel, CSV, JSON o PDF, el bot puede emitir cifras incorrectas con aparente seguridad.
- Integración no oficial con WhatsApp: el uso de Baileys para automatizar WhatsApp Web contraviene los términos de servicio de la plataforma y puede provocar el bloqueo del número; además, la sesión vinculada almacenada en `whatsapp_bridge/auth_info_baileys/` es un activo sensible que debe protegerse.
- Credenciales y datos sensibles: el sistema almacena claves de API de NVIDIA, Groq, OpenRouter y OpenAI, además de conversaciones de clientes, lo que exige medidas de cifrado y control de acceso que la model card no detalla.
- Dependencia de servicios externos: la operación se interrumpe si el proveedor de inferencia cambia precios, retira modelos o limita la tasa de peticiones; la búsqueda autónoma depende igualmente de DuckDuckGo o Tavily.
- Alcance de idioma no declarado: no se especifican idiomas soportados y el comportamiento multilingüe dependerá del modelo elegido.
- Discrepancia de puertos en la documentación: la model card declara `app_port: 7860` para el Space y a la vez indica que el panel se abre en `http://127.0.0.1:8000`, lo que puede complicar el despliegue en el Space.
- Orientación a Windows: los lanzadores, el autoarranque y el watchdog están descritos para Windows, sin instrucciones equivalentes para Linux o macOS.
- La fecha de creación registrada (2026-09-25) es posterior a la última actualización declarada, lo que sugiere metadatos inconsistentes y refuerza la cautela sobre la madurez del proyecto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/doral2277/bot-ventas-ia
- Perfil del autor en Hugging Face: https://huggingface.co/doral2277
- Plataforma NVIDIA Build, citada en la model card para obtener claves `nvapi-`: https://build.nvidia.com
- Hugging Face (sitio principal): https://huggingface.co/

Nota: las restantes URL devueltas por la búsqueda web (chatgpt.com, allchatbots.ai, deepai.org) corresponden a servicios genéricos de chat y no guardan relación con este repositorio, por lo que no se incluyen como referencias técnicas. No se han encontrado paper, blog técnico, repositorio de código ni demo adicionales asociados al proyecto.
