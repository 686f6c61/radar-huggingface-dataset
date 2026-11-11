# KOHENOOR-AI/kaipal-arena

## Resumen

KAIPAL Arena no es un modelo de lenguaje, sino una aplicación de escritorio que actúa como banco de pruebas local para modelos ya instalados en Ollama. Envía un mismo prompt a hasta tres modelos simultáneamente, muestra sus respuestas en paralelo y utiliza un modelo orquestador local para puntuar y seleccionar la mejor respuesta. Está desarrollada por Kohenoor Technologies y distribuida con licencia MIT.

El proyecto resuelve un problema concreto: comparar el comportamiento de distintos modelos locales sin depender de servicios en la nube, API keys ni telemetría. Toda la inferencia ocurre contra una instancia de Ollama en `127.0.0.1:11434`, y la aplicación rechaza explícitamente modelos en la nube de Ollama (aquellos con sufijo `:cloud` o `-cloud`) y modelos de embeddings, de modo que ningún prompt abandona el equipo.

El repositorio de Hugging Face es únicamente un espejo de distribución de los instaladores publicados en GitHub Releases, ya que el registro de Ollama solo aloja modelos y no aplicaciones. El tamaño del repo es de 0,0 GB y no contiene pesos de modelo. La aplicación está construida con Electron y TypeScript, y requiere Node.js 20 o 22 para desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicación de escritorio Electron (TypeScript); no es un modelo de lenguaje |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (depende de los modelos de Ollama seleccionados) |
| Tipos de cuantizacion | no disponible (depende de los modelos de Ollama seleccionados) |
| Idiomas soportados | no disponible (depende de los modelos de Ollama seleccionados) |
| Licencia | MIT |
| Formato de pesos | no disponible (no contiene pesos; distribuye instaladores NSIS, DMG, AppImage y DEB) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado. KAIPAL Arena es una aplicación Electron con backend en TypeScript que se comunica con el servidor local de Ollama mediante HTTP en loopback. Su arquitectura interna incluye una capa de abstracción "runner-adapter" pensada para añadir otros backends locales como LM Studio o llama.cpp en el futuro. La validación de endpoints está restringida a direcciones de loopback por defecto, como medida de privacidad.

El flujo de funcionamiento consiste en: descubrimiento automático de los modelos instalados en Ollama, selección de entre uno y tres modelos concursantes, envío paralelo de peticiones con estados individuales de carga, temporización y error, y finalmente una fase de juicio en la que un modelo orquestador seleccionable (cualquier modelo instalado, compita o no) puntúa las respuestas identificadas como A, B y C sin ver los nombres de los modelos. El orquestador evalúa corrección, relevancia, claridad, completitud y seguridad, y emite un ganador, un ranking, notas por modelo y la justificación de la selección. Si el orquestador devuelve una salida inválida, se aplica un fallback heurístico en el dispositivo y la ronda se marca como "Fallback used".

## Capacidades

- Comparación paralela de hasta tres modelos de Ollama con un mismo prompt y visualización lado a lado de las respuestas.
- Descubrimiento automático de los modelos instalados en la instancia local de Ollama.
- Juicio y ranking automático mediante un modelo orquestador local que puntúa corrección, relevancia, claridad, completitud y seguridad.
- Fallback heurístico transparente en el dispositivo cuando el orquestador produce una salida inválida.
- Chat multi-turno que utiliza la respuesta ganadora previamente seleccionada como contexto.
- Controles de generación persistentes: temperatura, top-p, top-k, repeat penalty, longitud de salida, seed, modo thinking, límite de tiempo por modelo y modo "un modelo a la vez" para equipos con poca memoria.
- Botón de parada que cancela una comparación en curso.
- Filtrado de seguridad: los modelos en la nube de Ollama y los modelos de embeddings nunca se listan ni se aceptan.
- Validación de endpoint restringida a loopback para garantizar que los prompts no salgan del equipo.
- Punto de extensión runner-adapter para integrar backends locales alternativos.

## Casos de uso

- Evaluación comparativa de modelos locales: un desarrollador con varios modelos pequeños instalados en Ollama (por ejemplo `llama3.2:3b`, `qwen2.5:3b` y `gemma2:2b`) puede lanzar un mismo prompt a los tres y obtener un ranking automático con justificación, útil para decidir qué modelo desplegar en una tarea concreta.
- Selección de modelo para un pipeline interno: antes de fijar un modelo para una aplicación de producción, se compara su comportamiento frente a alternativas en tareas representativas del dominio, con puntuaciones por criterio (corrección, relevancia, claridad).
- Entornos con requisitos estrictos de privacidad: organizaciones que no pueden enviar datos a servicios en la nube pueden usar la aplicación sabiendo que el filtrado de modelos `:cloud` y la validación de loopback impiden que los prompts salgan del equipo.
- Equipos con hardware modesto: el modo "un modelo a la vez" permite comparar modelos en equipos sin GPU, aceptando latencias de 30 a 60 segundos por respuesta en modelos pequeños.
- Desarrollo y pruebas de aplicaciones LLM: la suite `npm run check` ejecuta comprobación estricta de TypeScript, tests unitarios y build de producción con el límite HTTP local mockeado, lo que facilita integrar pruebas sin depender de Ollama.
- Uso educativo y de investigación: comparar cualitativamente cómo distintos modelos abordan la misma pregunta, con un juez local que explicita los criterios de puntuación.
- Chat multi-turno sobre la mejor respuesta: tras una comparación, el usuario puede continuar la conversación tomando como contexto la respuesta ganadora.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que, en equipos sin tarjeta gráfica, los modelos pequeños tardan entre 30 y 60 segundos por respuesta, y que el límite de tiempo por modelo es de 300 segundos por defecto (ampliable para modelos de mayor tamaño).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para la aplicación en sí; depende enteramente de los modelos de Ollama que se comparen.
- GPU recomendadas: no disponibles; la model card solo distingue entre equipos con y sin tarjeta gráfica.
- Cabe en consumer GPU: sí, en la medida en que los modelos de Ollama seleccionados quepan; el modo "un modelo a la vez" reduce el pico de memoria al no mantener varios modelos cargados simultáneamente.
- Sistema operativo: Windows 10/11, macOS 12+ o una distribución moderna de Linux.
- Software requerido: Ollama instalado y en ejecución, con al menos un modelo descargado (se recomiendan dos o tres para comparar); Node.js 20 o 22 y npm solo para desarrollo.
- Opciones de despliegue: instaladores NSIS (Windows), DMG (macOS), AppImage y DEB (Linux), descargables desde GitHub Releases o el espejo de Hugging Face; también ejecutable desde código fuente con `npm run dev` o `npm run build && npm start`.
- Latencia y throughput: no disponibles de forma agregada; la model card cita 30 a 60 segundos por respuesta en modelos pequeños sin GPU.
- Endpoint por defecto: `http://127.0.0.1:11434`, configurable en Ajustes si la instancia local de Ollama usa otro puerto de loopback.

## Comparativa con modelos similares

| Herramienta | Tipo | Backend | Juicio automático | Licencia | Distribución |
|---|---|---|---|---|---|
| KAIPAL Arena | App de escritorio Electron | Ollama (loopback) | Sí, con modelo orquestador local y fallback heurístico | MIT | GitHub Releases e espejo en Hugging Face |
| LM Studio | App de escritorio | Múltiples backends locales | No disponible en la información | Propietaria | Sitio oficial del fabricante |
| Open WebUI | Interfaz web autoalojada | Ollama y APIs compatibles | No disponible en la información | No disponible en la información | Contenedor y código fuente |

No se dispone de datos de benchmarks ni de comparativas de rendimiento entre estas herramientas en la información proporcionada; la comparación se limita a características funcionales y de distribución.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera respuestas por sí misma; toda la inferencia depende de los modelos instalados en Ollama.
- La calidad del ranking depende del modelo orquestador elegido; la model card advierte que un modelo especialista puede no juzgar correctamente, en cuyo caso se aplica el fallback heurístico.
- El modo thinking consume tokens del límite de salida; con thinking activado se recomienda subir el máximo a 2048 o más.
- El orquestador mantiene temperatura 0 y un mínimo de 1024 tokens de salida para su veredicto, lo que puede alargar las rondas.
- Sin firma de código ni notarización: Windows muestra advertencias de SmartScreen y macOS puede rechazar la apertura ("damaged" o "unidentified developer") hasta que el editor firme la aplicación.
- El repositorio de Hugging Face no contiene pesos ni código fuente; es solo un espejo de distribución de los instaladores publicados en GitHub Releases.
- El proyecto está en fase MVP; la model card no documenta sesgos, tasas de alucinación ni evaluaciones formales.
- La licencia MIT permite uso comercial, pero la aplicación no incluye certificados de firma, por lo que la distribución pública en producción requiere que el distribuidor los aporte.

## Enlaces

- Hugging Face: https://huggingface.co/KOHENOOR-AI/kaipal-arena
- GitHub (código fuente y releases): https://github.com/ABK786/kaipal-arena
- Releases: https://github.com/ABK786/kaipal-arena/releases
- Ollama: https://ollama.com/
- Sitio del autor: https://www.kohenoor.net
- Contacto: info@kohenoor.tech
