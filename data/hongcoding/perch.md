# hongcoding/perch

## Resumen

Perch (栖木) no es un modelo de lenguaje, sino una aplicación de escritorio para macOS distribuida a través de HuggingFace. Se trata de un banco de trabajo de IA ("AI workbench") de tipo local-first, construido con Tauri 2, React 19 y Rust, que actúa como cliente y orquestador de modelos de lenguaje de terceros. El repositorio no contiene pesos de ningún modelo: su tamaño es de 0,0 GB y no declara pipeline de inferencia.

El problema que aborda es la fricción de usar asistentes de IA en el escritorio manteniendo el control de los datos: la aplicación permite conectar modelos locales servidos por Ollama (menciona `qwen3-06b` como modelo local de ejemplo) y modelos en la nube mediante APIs compatibles con OpenAI (DeepSeek, MiMo, Qwen, entre otros). Su propuesta diferencial es una "corriente híbrida" en la que un modelo local pequeño responde en aproximadamente 0,08 segundos y un modelo en la nube toma el relevo en torno a 0,9 segundos.

Es relevante ahora por su enfoque de agente con acceso real al sistema de archivos y a la ejecución de comandos, con un conjunto de salvaguardas declaradas (18 reglas sobre operaciones peligrosas, sandbox de rutas, auditoría completa, confirmación obligatoria para `sudo`) y sincronización opcional cifrada de extremo a extremo. La licencia es MIT y el proyecto se publica con etiquetas de privacidad y local-first.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: aplicación de escritorio (Tauri 2 + React 19 + Rust + rusqlite); no es un modelo neuronal |
| Parametros totales | No disponible (no contiene pesos de modelo) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (depende del modelo que el usuario configure) |
| Tipos de cuantizacion | No disponible (delegado en el runtime del modelo conectado, p. ej. Ollama) |
| Idiomas soportados | Chino (zh) e inglés (en) en la documentación y la interfaz |
| Licencia | MIT |
| Formato de pesos | No disponible; el repositorio distribuye binarios `.dmg` y `.app.zip` para macOS Apple Silicon |

## Arquitectura y entrenamiento

No hay arquitectura de modelo ni proceso de entrenamiento que describir: Perch es una aplicación cliente. Su pila técnica declarada es Rust (74,7 % del código), TypeScript (18,1 %) y CSS (6,5 %), sobre Tauri 2 con React 19 y SQLite mediante `rusqlite`. El repositorio afirma contar con más de 1118 pruebas en verde.

La innovación técnica que documenta el autor es el marco de inferencia "Ultrafast", con tres reglas: desactivar el modo de razonamiento explícito en las peticiones (`thinking: disabled`), reutilizar un cliente HTTP singleton como pool de conexiones para evitar el handshake TCP+TLS por petición, y fijar el modelo para no intercambiarlo en caliente. Además, implementa renderizado Markdown en streaming con limitación de frecuencia (aproximadamente 15 fps de DOM), ejecución concurrente de múltiples conversaciones y una barra de estado con velocidad de salida en caracteres por segundo y porcentaje de aciertos de caché.

## Capacidades

- Orquestación de agentes con acceso a herramientas: lectura y escritura de archivos, ejecución de comandos de shell, búsqueda web y procesamiento por lotes.
- Enrutamiento híbrido local/nube: modelo local pequeño para la primera respuesta y modelo en la nube para la respuesta de mayor calidad.
- Soporte de proveedores múltiples: Ollama en local y APIs compatibles con OpenAI (DeepSeek, MiMo, Qwen y otras).
- Base de conocimiento local con recuperación semántica, citas con trazabilidad, roles de experto y habilidades.
- Búsqueda web con múltiples backends, resumen del cuerpo de las páginas y defensa frente a inyección de prompts.
- Automatización: motor de programación ("栖木流"), tareas planificadas y procesamiento por lotes.
- Control de razonamiento mediante un deslizador continuo de cinco niveles (desactivado, bajo, medio, alto, máximo).
- Conversaciones concurrentes: varias sesiones generando a la vez sin bloqueo mutuo.
- Seguridad operativa: sandbox de rutas, protección contra inyección de comandos, confirmación obligatoria de `sudo`, auditoría completa de llamadas a herramientas y redacción de datos sensibles.
- Sincronización en la nube opcional con cifrado de extremo a extremo; credenciales de API almacenadas en el llavero de macOS.
- Herramientas auxiliares: compañero móvil, panel del sistema, foro de discusión, tablón de mensajes y salvapantallas en modo espera.
- Capacidades multimodales (visión, audio) y de llamada a funciones nativa: no disponibles de forma directa; dependen del modelo subyacente configurado.

## Casos de uso

- Asistencia de desarrollo en local: el agente puede leer y escribir archivos del proyecto y ejecutar comandos, con auditoría de cada operación y sandbox de rutas, lo que permite tareas de refactorización o generación de scripts sin salir del escritorio.
- Automatización de tareas programadas: el motor de programación permite lanzar procesos por lotes o tareas recurrentes (por ejemplo, resúmenes diarios de documentos locales) sin intervención manual.
- Consulta de documentación propia: la base de conocimiento local con recuperación semántica y citas trazables sirve para interrogar corpus privados sin enviarlos a la nube.
- Investigación con búsqueda web asistida: la búsqueda con múltiples backends y resumen de páginas, junto con la defensa frente a inyección de prompts, es adecuada para recopilar y sintetizar información externa.
- Trabajo con requisitos de privacidad: al mantener conversaciones, memoria y base de conocimiento en el equipo, encaja en entornos donde no se permite enviar datos a servicios externos, usando únicamente el modelo local de Ollama.
- Atención de múltiples frentes simultáneos: la concurrencia de conversaciones permite mantener una generación larga en una sesión mientras se consulta otra, útil para redacción y revisión en paralelo.
- Despliegue de prototipos de agentes: al ser MIT y estar construido sobre Tauri y React, sirve como base para experimentar con flujos de agente y herramientas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento declarados por el autor son de latencia percibida: 0,08 segundos hasta el primer token con el modelo local `qwen3-06b` ya cargado y aproximadamente 0,9 segundos hasta el relevo del modelo en la nube. No se aportan métricas de calidad, MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- Sistema operativo: macOS sobre Apple Silicon (el binario distribuido es `aarch64`); no se menciona soporte para Intel ni para Windows o Linux.
- VRAM: no aplica directamente; el consumo depende del modelo local que se sirva mediante Ollama. El ejemplo citado es un modelo de 0,6B parámetros, que cabe holgadamente en la memoria unificada de cualquier Mac Apple Silicon.
- GPU recomendadas: no se especifican. Para modelos locales de mayor tamaño se requiere memoria unificada suficiente según el modelo y la cuantización elegidos.
- Modelos en la nube: no requieren hardware local, solo conectividad y credenciales de API configuradas por el usuario.
- Opciones de despliegue: la aplicación se instala desde el `.dmg`; el backend de modelos local es Ollama y el remoto cualquier API compatible con OpenAI.
- Latencia y throughput: 0,08 s hasta el primer token en local y unos 0,9 s en el relevo a la nube, según el autor; la interfaz muestra velocidad de salida en caracteres por segundo y porcentaje de aciertos de caché.
- Almacenamiento: el repositorio ocupa 0,0 GB; el espacio real depende de los modelos descargados para Ollama.

## Comparativa con modelos similares

No procede una comparativa de modelos porque Perch no es un modelo de lenguaje. A modo de contexto, se compara con otras aplicaciones de escritorio de IA local:

| Producto | Tipo | Modelos | Licencia | Plataforma |
|---|---|---|---|---|
| Perch | Workbench de agente local-first | Ollama + APIs compatibles con OpenAI | MIT | macOS Apple Silicon |
| Ollama | Servidor de inferencia local | Catálogo propio de modelos | MIT | macOS, Linux, Windows |
| LM Studio | Aplicación de escritorio con interfaz gráfica | GGUF locales y servidor compatible con OpenAI | Propietaria | macOS, Windows, Linux |
| Open WebUI | Interfaz web autoalojada | Ollama y APIs compatibles con OpenAI | Licencia propia (basada en BSD-3 con restricciones) | Contenedor, multiplataforma |

## Limitaciones y advertencias

- No es un modelo: no incluye pesos ni pipeline de inferencia; cualquier evaluación de calidad debe hacerse sobre el modelo que el usuario conecte.
- Exclusivo de macOS Apple Silicon: no hay binarios para otras plataformas en la información disponible.
- Documentación e interfaz solo en chino e inglés; no se declara soporte de castellano.
- Los binarios no están notarizados según la propia model card (indica hacer clic derecho y abrir si macOS avisa de desarrollador no identificado), lo que supone un riesgo de seguridad para despliegues corporativos.
- Proyecto con 0 descargas y 0 likes en HuggingFace en el momento de la consulta; madurez y comunidad limitadas.
- El agente ejecuta comandos y escribe archivos: las salvaguardas descritas (sandbox, auditoría, confirmación de `sudo`) mitigan pero no eliminan el riesgo de acciones destructivas o de inyección de prompts a través de contenido web.
- Las capacidades reales, el contexto máximo y la calidad dependen enteramente del proveedor configurado; el autor no garantiza el comportamiento de APIs de terceros.
- Riesgo de alucinación y sesgos: no evaluables, al no existir modelo propio ni datos de evaluación publicados.
- La licencia MIT permite uso comercial del software, pero no cubre las condiciones de los modelos y APIs de terceros que el usuario conecte.

## Enlaces

- HuggingFace: https://huggingface.co/hongcoding/perch
- GitHub: https://github.com/ghongxv-web/perch
- Descarga v4.5.0: `Perch_4.5.0_aarch64.dmg` (alojado en el repositorio de HuggingFace)
- Descarga v4.4.1: `Perch_4.4.1_aarch64.dmg`
- Descarga v4.1.0 Nirvana: `Perch_4.1.0-Nirvana_b5_aarch64.dmg`
- Descarga v3.0.0 LightYear: `Perch_3.0.0-LightYear-b5.app.zip`
