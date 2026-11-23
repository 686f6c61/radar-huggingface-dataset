# Aliaitot98/ali-ai-code

## Resumen

`Aliaitot98/ali-ai-code` es un repositorio alojado en Hugging Face que, pese a su identificador y a la etiqueta de licencia MIT, no contiene un modelo de lenguaje con pesos publicados. La model card describe **ALI AI**, una aplicación web autocontenida (PWA) escrita en Python con FastAPI que actúa como cliente orquestador de modelos de terceros: el usuario conecta sus propias claves de API (Groq, Google Gemini, OpenRouter, o un servidor local Ollama) y la aplicación enruta las peticiones al proveedor configurado, con conmutación automática entre ellos si uno falla.

El proyecto se presenta como un asistente personal en árabe con módulos de conversación, redacción, traducción, procesamiento de documentos (PDF, Word, Excel, PowerPoint), generación de sitios web y bots, búsqueda web y tareas programadas. La capa de inferencia es una abstracción sobre APIs compatibles con OpenAI (`app/llm.py`), de modo que el "modelo" es en realidad un componente intercambiable y externo al repositorio.

Por tanto, esta ficha debe leerse como la evaluación de un artefacto de software de orquestación, no de un modelo entrenado. No hay arquitectura neuronal, parámetros, tokenizador ni dataset que describir; el tamaño del repositorio es de 0,0 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal: aplicación web FastAPI (backend) + PWA estática (frontend) que orquesta APIs de terceros compatibles con OpenAI |
| Parametros totales | no disponible (no se publican pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del proveedor externo configurado; la model card sugiere `qwen2.5:7b` como ejemplo local, sin especificar contexto) |
| Tipos de cuantizacion | no disponible (no aplica al repositorio; dependería del modelo externo, p. ej. GGUF vía Ollama) |
| Idiomas soportados | Árabe como idioma principal declarado; la interfaz y las instrucciones de los módulos están redactadas en árabe. No se documenta soporte formal de otros idiomas |
| Licencia | MIT |
| Formato de pesos | no disponible (no contiene pesos; el código se distribuye como proyecto Python/Docker) |

## Arquitectura y entrenamiento

No existe entrenamiento ni arquitectura de red neuronal que documentar. El repositorio implementa una arquitectura de aplicación en capas: `app/main.py` expone la API con FastAPI; `app/agent.py` ejecuta un bucle agente-modelo-herramienta con conmutación entre proveedores y un modo JSON para modelos sin soporte nativo de *tool calling*; `app/llm.py` abstrae los proveedores mediante el protocolo compatible con OpenAI; `app/prompts.py` contiene las instrucciones de sistema por módulo, redactadas en árabe; y `app/tools/` agrupa las herramientas (`files`, `data`, `web`, `studio`, `memory`) registradas mediante un decorador `@tool("nombre", "descripción", esquema JSON)`.

La persistencia se resuelve con SQLite (`app/db.py`) para conversaciones, proyectos, memoria, archivos, tareas y proveedores, con cifrado de claves API en `app/secrets_store.py` y autenticación por contraseña única con cookie firmada HttpOnly (`app/auth.py`). Las tareas programadas usan APScheduler con notificaciones por Telegram. En despliegues con disco efímero (Hugging Face Spaces en plan gratuito), `app/hf_sync.py` replica la base de datos y los archivos a un Dataset privado cada pocos minutos y tras cada mensaje, restaurándolos al arrancar. No se documenta ninguna innovación en inferencia (decodificación especulativa, atención lineal, RLHF/DPO) porque el proyecto no entrena modelos.

## Capacidades

- Conversación multi-turno en árabe con memoria persistente y organización por proyectos.
- Redacción asistida: artículos, informes, libros, guiones, correspondencia formal, reescritura y corrección.
- Traducción árabe-inglés en registros jurídico, académico y comercial, con revisión de traducciones y traducción de archivos.
- Procesamiento de documentos: lectura de PDF, Word, Excel, PowerPoint y CSV; generación de Word y PDF en árabe, Excel y PowerPoint; conversión entre formatos.
- Análisis de datos: tablas Excel con formatos y gráficos, análisis estadístico, gráficos PNG y cálculo numérico.
- Generación de identidad visual: nombres, paletas, tipografías, logotipos SVG, publicaciones para redes y guías de marca.
- Generación de sitios web responsivos y aplicaciones PWA con código completo, vista previa en sandbox aislado y paquete ZIP para despliegue.
- Generación de proyectos de bots para Telegram y Discord con README y claves requeridas.
- Búsqueda web, lectura de páginas, informes con fuentes y tareas programadas con notificación por Telegram.
- Conmutación automática entre proveedores de modelos y modo JSON para modelos sin soporte de *function calling*.

## Casos de uso

- Asistente personal en árabe autoalojado: un usuario despliega el proyecto con Docker Compose en un VPS y conecta su clave de Groq o Gemini; el bucle de `app/agent.py` gestiona el contexto conversacional y la memoria persistente en SQLite, sin depender de la interfaz de un proveedor concreto.
- Generación de documentación corporativa en árabe: el módulo `files` permite leer un PDF de entrada y producir un informe en Word o PDF con formato árabe correcto, útil en organismos donde el árabe es el idioma de trabajo y las herramientas ofimáticas occidentales rinden mal en RTL.
- Análisis de datos tabulares sin salir del asistente: carga de un CSV o Excel, cálculo estadístico y generación de gráficos PNG mediante el módulo `data`, adecuado para informes periódicos de pequeñas organizaciones.
- Prototipado rápido de sitios y bots: el módulo `studio` genera el código de una PWA o de un bot de Telegram con su README y lo empaqueta en ZIP, lo que acelera la entrega de demos a clientes sin equipo de desarrollo dedicado.
- Automatización de tareas recurrentes con aviso: APScheduler ejecuta tareas programadas y envía el resultado por Telegram, un patrón útil para resúmenes diarios de fuentes web o recordatorios operativos.
- Despliegue en infraestructura gratuita con persistencia: combinación de Hugging Face Spaces (Docker) con sincronización a un Dataset privado, o de Oracle Cloud Always Free (4 núcleos ARM, 24 GB de RAM) con un túnel HTTPS, para mantener el servicio sin coste recurrente.
- Evaluación comparativa de proveedores de modelos: al abstraer el proveedor tras una API compatible con OpenAI, permite intercambiar Groq, Gemini, OpenRouter u Ollama y comparar latencia y calidad sobre las mismas tareas sin reescribir la aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad, latencia ni throughput; únicamente advierte de que el proveedor de demostración Pollinations es "más lento y más débil" y no apto para datos sensibles, sin cuantificar la diferencia.

## Requisitos de hardware

- VRAM para inferencia: no aplica al repositorio, que no ejecuta pesos propios. Si se conecta un modelo local vía Ollama, los requisitos dependen de ese modelo; la model card propone `qwen2.5:7b` como ejemplo, cuya huella en VRAM depende de la cuantización elegida (no se especifica en la documentación).
- GPU recomendadas: no disponibles. El proyecto está pensado para ejecutarse en CPU (contenedor `cpu-basic` de Hugging Face Spaces, VPS de bajo coste u Oracle Cloud ARM).
- Ejecución en GPU de consumo: solo relevante si se sirve localmente el modelo externo mediante Ollama; el repositorio en sí no requiere GPU.
- Opciones de despliegue: `./run.sh` (script de arranque que genera `.env` y contraseña aleatoria), Docker Compose sobre el puerto 8000, Hugging Face Spaces tipo Docker en el puerto 7860, Oracle Cloud Always Free, cualquier VPS (se cita Hetzner por unos 4 USD/mes) y túneles HTTPS mediante `tunnel.sh` o Cloudflare Named Tunnel.
- Latencia y throughput: no disponibles; dependen íntegramente del proveedor externo configurado y del modo de conmutación entre proveedores.
- Almacenamiento: SQLite más archivos generados en `data/`; en planes gratuitos con disco efímero se requiere la sincronización a Dataset descrita en la model card.

## Comparativa con modelos similares

No disponible. El artefacto no es un modelo de lenguaje, por lo que la comparación con modelos de parámetros comparables no es pertinente. Como referencia de categoría (clientes/orquestadores autoalojados de APIs de LLM), podrían citarse LibreChat u Open WebUI, pero no se dispone de datos verificables en la información proporcionada para establecer una comparación rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni modelo entrenado; cualquier expectativa de descargar y ejecutar un LLM local a partir de este identificador es incorrecta.
- La calidad, el contexto efectivo y el comportamiento del asistente dependen por completo del proveedor externo configurado; no hay garantías de reproducibilidad entre proveedores.
- El idioma principal declarado es el árabe y las instrucciones de sistema están redactadas en ese idioma; el rendimiento en castellano u otros idiomas no está documentado.
- El proveedor de demostración Pollinations se describe como lento y de baja calidad, y la propia model card lo desaconseja para datos sensibles.
- Riesgo de alucinación inherente a los modelos subyacentes, agravado por módulos que generan contenido factual (informes con fuentes, análisis de datos) sin mecanismos de verificación documentados.
- La autenticación es de contraseña única para un solo propietario; no se documenta soporte multiusuario ni roles, lo que limita su uso en equipos.
- En Hugging Face Spaces con plan gratuito el disco es efímero y el Space se suspende tras 48 horas de inactividad; sin la sincronización a Dataset se pierden conversaciones y archivos.
- La model card advierte de que desde 2026 los Spaces Docker/Gradio en `cpu-basic` requieren suscripción PRO, lo que afecta al coste real del despliegue gratuito.
- Aunque la licencia declarada es MIT, el uso comercial queda condicionado por los términos de los proveedores de modelos externos y de los servicios de búsqueda web que la aplicación invoque.
- El repositorio muestra 0 descargas y 0 interacciones, sin historial de mantenimiento verificable; la fecha de creación indicada (2026-11-22) y el tamaño de 0,0 GB impiden confirmar que el código esté efectivamente publicado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Aliaitot98/ali-ai-code
- Aplicación desplegada (requiere publicación y, según la model card, suscripción PRO para Spaces Docker): https://aliaitot98-ali-ai.hf.space
- Consola de claves de Groq: https://console.groq.com/keys
- Claves de Google Gemini: https://aistudio.google.com/apikey
- OpenRouter (modelos gratuitos): https://openrouter.ai
- Ollama (ejecución local): https://ollama.com
