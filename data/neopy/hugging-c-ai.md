# NeoPy/hugging-c-ai

## Resumen

NeoPy/hugging-c-ai no es un modelo de inteligencia artificial, sino una aplicación web de código abierto para chat con personajes (roleplay y asistentes con personalidad) construida con Next.js. Se distribuye como repositorio alojado en HuggingFace y actúa como orquestador: no ejecuta inferencia propia, sino que se conecta a proveedores externos de LLM (OpenAI, Anthropic, HuggingFace Inference, Groq, MuAPI y servidores Gradio personalizados) y presenta una interfaz unificada de conversación con streaming en tiempo real.

El proyecto es un fork "fuertemente ampliado" de Open Character AI (github.com/Anil-matcha/open-character-ai). Entre los cambios declarados por el autor están la sustitución de Google OAuth por HuggingFace OAuth (con ámbito `repo:write`), la ampliación de 4 a 17 modelos de 5 proveedores, la inclusión de streaming SSE en lugar de sondeo cada 1,5 s, el almacenamiento de ficheros subidos en buckets de datasets de HuggingFace, el uso de SQLite por defecto (con opción de PostgreSQL) y facturación opcional con Stripe.

Su relevancia es como herramienta de infraestructura, no como artefacto de IA: permite desplegar portales de personajes conversacionales en un HuggingFace Space, comparar modelos de distintos proveedores en una misma interfaz y conectar Spaces de Gradio propios como endpoints. En el momento del análisis el repositorio registra 0 descargas y 0 "likes", y la model card disponible está truncada, por lo que no hay datos verificables de uso, rendimiento ni de calidad de la aplicación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: aplicación web Next.js (React) con API routes; no es un modelo de red neuronal |
| Parametros totales | No aplica / no disponible: no distribuye pesos |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica: depende del proveedor LLM seleccionado en cada chat (no especificado en la información disponible) |
| Tipos de cuantizacion | No aplica: determinada por el proveedor externo elegido |
| Idiomas soportados | No disponible (no se declara lista de idiomas; la interfaz y los prompts de personaje están en inglés en la documentación) |
| Licencia | MIT |
| Formato de pesos | No aplica: no distribuye pesos; el artefacto es código fuente de una aplicación |
| Stack técnico declarado | Next.js, Prisma (SQLite por defecto, PostgreSQL opcional), NextAuth, `@huggingface/hub`, Stripe |
| Proveedores LLM soportados | OpenAI, Anthropic, HuggingFace Inference, Groq, MuAPI y servidores Gradio personalizados |
| Número de modelos en catálogo | 17 (repartidos en 5 proveedores, más endpoints Gradio personalizados) |
| Autenticación | HuggingFace OAuth2 (ámbitos `openid profile email repo:write read`) y alternativa por API key con detección automática de prefijos `hf_*`, `sk-*`, `sk-ant*`, `gsk_*`, `mu_*` |
| Almacenamiento de subidas | Bucket de dataset de HuggingFace (por defecto `<hf-username>/hugging-c-ai-assets`), con reserva a MuAPI si no hay token |
| Precios por mensaje | 1 a 15 créditos según modelo del catálogo |
| Fecha de creación del repositorio | 2026-09-10 (según metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No existe entrenamiento ni modelo subyacente. Se trata de una aplicación de tres capas: frontend en Next.js (páginas `/`, `/login`, `/explore`, `/pricing` y `/[character_name]/[id]` para el estudio de chat), capa de API con rutas para autenticación, personajes, chats, mensajes, catálogo de modelos, subida de ficheros, imágenes, datasets de HuggingFace, Gradio, claves de API, checkout y webhooks de Stripe, y capa de persistencia gestionada con Prisma (esquema con las entidades User, Account, Character, Chat, Message, UserImage y Creation).

La innovación funcional declarada es la abstracción multi-proveedor: el endpoint de mensajes invoca un registro de proveedores y soporta streaming SSE (Server-Sent Events) para OpenAI, Anthropic, HuggingFace y Groq, frente al sondeo periódico de la versión original. Los endpoints Gradio admiten el formato `gradio:<space-url>` o `gradio:<space-url>::<api-name>` y prueban automáticamente distintas formas de parámetros (chat, predict, mensaje único), reutilizando el token OAuth del usuario para acceder a Spaces privados o restringidos. No se menciona en la información disponible ningún proceso de ajuste, RLHF, DPO ni dataset de entrenamiento, ya que no aplica.

## Capacidades

- Interfaz de chat multi-turno con personajes predefinidos (15 personajes de serie: Einstein, Jobs, Sherlock, entre otros) y creación de personajes personalizados con nombre, avatar, prompt de sistema, saludo y visibilidad.
- Selección entre 17 modelos de 5 proveedores desde un selector agrupado por proveedor, con ajuste por chat de temperatura, máximo de tokens, modo de razonamiento y activación de streaming.
- Streaming en tiempo real por SSE para OpenAI, Anthropic, HuggingFace y Groq.
- Soporte de visión declarado para OpenAI GPT-4o, Claude 3.5 y Gemini (este último a través de MuAPI).
- Conexión de aplicaciones Gradio desplegadas como endpoint LLM personalizado, incluyendo Spaces privados o con acceso restringido mediante el token OAuth del usuario.
- Almacenamiento de ficheros subidos en un repositorio de dataset de HuggingFace del propio usuario, con creación diferida del repositorio en la primera subida y generación de URLs públicas de resolución.
- Registro del consumo de tokens (prompt y completion) por mensaje y facturación por modelo (1 a 15 créditos).
- Página de exploración (`/explore`) con marketplace de personajes públicos creados por la comunidad.
- Facturación opcional con Stripe: cuatro paquetes de créditos (5, 10, 20 y 50 dólares), saldo actualizado por webhook y reembolso automático si falla la generación.
- No se declaran capacidades de tool calling, function calling, ejecución de agentes, multi-step reasoning nativo ni soporte de audio en la información disponible.

## Casos de uso

- Despliegue de un portal de roleplay o compañeros conversacionales: la aplicación se puede duplicar directamente a un HuggingFace Space ("Duplicate to HF Space") y ofrece 15 personajes listos para usar, con marketplace público para compartir creaciones.
- Banco de pruebas multi-proveedor para desarrolladores: permite lanzar el mismo prompt contra OpenAI, Anthropic, HuggingFace, Groq o MuAPI desde una única interfaz, con control de temperatura y tokens, lo que resulta adecuado para evaluar coste y estilo de respuesta antes de fijar un proveedor en producción.
- Exposición de modelos propios alojados en Spaces de Gradio: cualquier Space con interfaz Gradio se puede registrar como endpoint (`gradio:<space-url>`) y consumir desde el chat, incluyendo Spaces privados gracias al token OAuth del usuario.
- Prototipado de asistentes de marca o atención al cliente: el constructor visual de personajes permite fijar un prompt de sistema, saludo y avatar para generar un prototipo funcional de asistente sin escribir código.
- Servicio de chat de pago para terceros: con la integración de Stripe, el operador puede cobrar paquetes de créditos, aplicar precio por modelo y reembolsar automáticamente las generaciones fallidas.
- Gestión de activos conversacionales en HuggingFace: las imágenes y ficheros que el usuario sube se guardan en su propio dataset (`<hf-username>/hugging-c-ai-assets`), lo que evita depender de un CDN de terceros y mantiene los datos bajo su cuenta.
- Investigación sobre coste y consumo: el registro de tokens de prompt y completion por mensaje permite auditar el gasto real de cada proveedor en conversaciones largas o con muchos turnos.
- Comparación cualitativa de modelos con visión: se puede enviar una misma imagen a GPT-4o, Claude 3.5 y Gemini (vía MuAPI) y contrastar las respuestas en un mismo hilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no tratarse de un modelo de IA, no existen métricas tipo MMLU, HumanEval o GSM8K aplicables al artefacto. Tampoco se documentan métricas de rendimiento de la aplicación (latencia, throughput, tiempo de primera respuesta), más allá de la afirmación cualitativa de que el streaming SSE sustituye al sondeo cada 1,5 s del proyecto original.

## Requisitos de hardware

- VRAM para inferencia: no aplica. La aplicación no ejecuta inferencia local; la carga de cómputo recae en los proveedores externos seleccionados (OpenAI, Anthropic, HuggingFace Inference, Groq, MuAPI o el Space de Gradio que se conecte).
- GPU recomendadas: no disponible; la aplicación en sí es un servidor Node.js/Next.js que puede ejecutarse en CPU.
- ¿Cabe en GPU de consumo?: sí, la aplicación no requiere GPU. El requisito de GPU depende exclusivamente del endpoint externo elegido (por ejemplo, un Space de Gradio con un modelo grande sí necesitaría GPU, pero esa decisión queda fuera de este repositorio).
- Opciones de despliegue: HuggingFace Spaces (botón "Duplicate to HF Space"), Vercel o cualquier entorno que ejecute Next.js y Node.js. Base de datos SQLite por defecto (sin configuración previa) y cambio a PostgreSQL para producción.
- Dependencias de servicios externos: claves de API de los proveedores LLM, token de HuggingFace (OAuth o API key) para almacenamiento y Gradio, y cuenta de Stripe si se activa la facturación.
- Latencia y throughput: no disponibles. Dependen del proveedor LLM, del modo streaming y del entorno de despliegue; el proyecto no publica cifras.

## Comparativa con modelos similares

No procede una comparativa de modelos porque el artefacto no es un modelo. Se compara a continuación con su proyecto de origen, del que sí hay datos documentados en la model card.

| Aspecto | Hugging-c-ai | Open Character AI (upstream) |
|---|---|---|
| Autenticación | HuggingFace OAuth (con `repo:write`) + API key multi-proveedor autodetectada | Google OAuth + API key de MuAPI |
| Proveedores LLM | 6: OpenAI, Anthropic, HuggingFace, Groq, MuAPI y servidores Gradio personalizados | Solo pasarela MuAPI |
| Streaming | SSE para OpenAI, Anthropic, HuggingFace y Groq | No: sondeo cada 1,5 s |
| Almacenamiento | Bucket de dataset de HuggingFace (HfFileSystem) | Solo CDN de MuAPI |
| Catálogo de modelos | 17 modelos en 5 proveedores + endpoints Gradio | 4 opciones fijas |
| Base de datos | SQLite por defecto, PostgreSQL opcional | PostgreSQL (requiere Supabase o Neon) |
| Coste por mensaje | Precio por modelo del catálogo (1 a 15 créditos) | 2 créditos fijos |
| Seguimiento de tokens | Sí, prompt y completion por mensaje | No |
| Marketplace | Página `/explore` con personajes públicos | No |
| Despliegue | Duplicar a HuggingFace Space | Clonar en Vercel |
| Licencia | MIT | No disponible |

Existen otras alternativas de la misma categoría (frontends autoalojados de chat multi-proveedor como Open WebUI, LibreChat o SillyTavern), pero la búsqueda web realizada no ha devuelto información utilizable sobre ellas, por lo que no se incluye comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de pesos, cuantizaciones, contexto propio o benchmarks debe descartarse. Es una aplicación que delega la inferencia en terceros.
- La model card disponible está truncada: solo se ha podido leer una parte de la documentación (se corta en la sección de arquitectura, dentro del árbol de ficheros), por lo que no hay instrucciones de instalación, variables de entorno ni guía de despliegue completas en la información analizada.
- Ausencia total de validación externa: 0 descargas y 0 likes en HuggingFace, lo que impide confirmar que la aplicación funcione tal y como se describe ni que existan usuarios que la hayan probado.
- Los metadatos indican fechas de creación y actualización en 2026-09-10, posteriores a la fecha habitual de consulta; conviene verificar la procedencia y el estado real del repositorio antes de usarlo.
- Dependencia crítica de servicios de terceros: el funcionamiento requiere claves de API de OpenAI, Anthropic, HuggingFace, Groq, MuAPI o Stripe, cada uno con sus propios términos de uso, límites de tarifa y condiciones comerciales, independientes de la licencia MIT del proyecto.
- La licencia MIT cubre únicamente el código de la aplicación; no cubre los modelos ni los contenidos generados por los proveedores externos, ni los personajes predefinidos que pudieran incorporar material con derechos.
- El alcance OAuth solicitado incluye `repo:write`, lo que implica permiso de escritura sobre repositorios del usuario en HuggingFace; es un privilegio sensible que debe evaluarse antes de concederlo en un despliegue de producción.
- Riesgo de alucinación y de contenido inapropiado: la aplicación está orientada a roleplay y personajes, y no se documentan filtros de contenido, moderación ni salvaguardas de seguridad en la información disponible.
- SQLite es la base de datos por defecto y el propio autor recomienda PostgreSQL para producción; usar SQLite en un despliegue multiusuario puede provocar problemas de concurrencia.
- No se declaran idiomas soportados ni cobertura multilingüe verificada.
- No hay datos de latencia, throughput, consumo de recursos ni pruebas de carga que permitan estimar el coste de operación.
- La búsqueda web realizada no devolvió resultados relevantes sobre el proyecto (los resultados obtenidos correspondían a páginas de inicio de sesión de Gmail, sin relación alguna), por lo que no se ha podido contrastar la información de la model card con fuentes independientes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/NeoPy/hugging-c-ai
- Proyecto original del que deriva (Open Character AI): https://github.com/Anil-matcha/open-character-ai
- Documentación de referencia sobre Gradio Server citada en la model card: https://huggingface.co/blog/introducing-gradio-server
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la búsqueda web realizada; los resultados obtenidos no guardaban relación con el proyecto.
