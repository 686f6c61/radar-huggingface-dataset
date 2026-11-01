# hkblockchaintechnology/World-Pulse

## Resumen

World Pulse no es un modelo de IA, sino una aplicación Android de panel de información ("dashboard") con temática cyberpunk que agrega noticias y datos de mercado en tiempo real a partir de fuentes públicas gratuitas. La desarrolla el usuario hkblockchaintechnology y se distribuye a través de un repositorio de Hugging Face con licencia MIT, sin pesos de modelo ni artefactos de inferencia: el repositorio contiene el código fuente Java de la app y un APK de depuración.

La aplicación resuelve un problema de agregación y presentación de información: consume titulares de Google News RSS (mundiales, mercado estadounidense, de Hong Kong y de China), historias de portada de Hacker News, actividad sísmica global de la API de USGS y datos meteorológicos de Open-Meteo, y los presenta en una interfaz visual con gráficos dibujados sobre Canvas. No incluye componentes de aprendizaje automático, generación de texto ni razonamiento.

Es relevante únicamente como ejemplo de cliente Android ligero que integra varias APIs públicas sin backend propio. No debe evaluarse como modelo de lenguaje: no hay arquitectura transformer, parámetros, contexto ni benchmarks asociados. Cualquier uso en pipelines de IA requeriría un modelo adicional que la app no proporciona.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una aplicacion Android en Java) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la interfaz y las fuentes son predominantemente en ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio contiene codigo fuente Java y `WorldPulse-debug.apk`) |

## Arquitectura y entrenamiento

No aplica: World Pulse no es un modelo entrenado. Es una aplicación Android escrita en Java, compilada con el SDK de Android API 35 y Gradle 8.10.2. La interfaz se construye con vistas personalizadas de estilo neón y gráficos dibujados sobre `Canvas` (`ChartView.java`). La capa de red usa `HttpURLConnection` para consumir feeds RSS y JSON.

Las fuentes de datos son Google News RSS (titulares mundiales y de mercados de EE. UU., Hong Kong y China), la API de Hacker News (historias de portada), la API de terremotos del USGS (actividad sísmica global) y Open-Meteo (meteorología de ciudades principales). No hay dataset de entrenamiento, RLHF, DPO ni innovación algorítmica alguna; la lógica se reparte entre `MainActivity.java`, `MarketNewsLoader.java` y `HttpUtil.java`.

## Capacidades

- Agregación de titulares de noticias mundiales desde Google News RSS.
- Agregación de noticias de mercados de EE. UU., Hong Kong y China mediante consultas a Google News.
- Recuperación de historias de portada de tecnología desde la API de Hacker News.
- Consulta de actividad sísmica global en tiempo real desde la API de USGS.
- Consulta de meteorología actual de ciudades principales vía Open-Meteo.
- Visualización en cuatro pestañas (World News, US Market, HK Market, CN Market) con gráficos Canvas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, visión ni audio.

## Casos de uso

- Panel personal de seguimiento de titulares mundiales: la app agrega Google News RSS en una sola vista con pestañas por región, útil para consulta rápida en movilidad sin abrir varias fuentes.
- Monitor de mercados asiáticos y estadounidenses: las pestañas US Market, HK Market y CN Market filtran titulares por consulta, adecuado para seguimiento informal de prensa financiera.
- Seguimiento de actividad sísmica: la integración con la API de USGS permite ver terremotos recientes, útil como complemento informativo (no como sistema de alerta temprana).
- Consulta meteorológica rápida: Open-Meteo aporta el tiempo actual de ciudades principales dentro del mismo panel.
- Base para desarrolladores Android: el código Java y la estructura Gradle sirven como plantilla para construir clientes ligeros que consuman APIs públicas sin backend.
- Distribución interna de builds de depuración: el APK `WorldPulse-debug.apk` permite instalar la app en dispositivos Android para pruebas, con el correspondiente aviso de "instalar apps desconocidas".
- Lectura de noticias tecnológicas: la integración con Hacker News facilita revisar historias de portada del sector.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo de IA, no existen métricas de MMLU, HumanEval, GSM8K ni equivalentes.

## Requisitos de hardware

- No requiere GPU ni VRAM: es una aplicación Android, no un modelo de inferencia.
- Requiere un dispositivo Android compatible con el SDK API 35 (o el mínimo declarado en `AndroidManifest.xml`, no disponible en la información proporcionada).
- Despliegue mediante instalación del APK (`adb install -r WorldPulse-debug.apk`) o compilación con `gradle -p WorldPulse assembleDebug`.
- No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput dependen de las APIs externas (Google News, Hacker News, USGS, Open-Meteo) y de la conectividad del dispositivo; no se proporcionan cifras.

## Comparativa con modelos similares

| Criterio | World Pulse | Aplicaciones de agregación de noticias (genéricas) | Modelos de lenguaje open source |
|---|---|---|---|
| Tipo | App Android (Java) | App Android/iOS | Modelo de IA |
| Parametros | no disponible | no disponible | variable |
| Contexto | no disponible | no disponible | variable |
| Rendimiento | no disponible | no disponible | benchmarks publicados por el autor |
| Licencia | MIT | variable | variable |
| Disponibilidad | repositorio Hugging Face con código y APK | tiendas de aplicaciones | Hugging Face y otros |

No se dispone de datos comparativos concretos con alternativas equivalentes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no puede usarse como sustituto de un LLM.
- Es un agregador, no un verificador de hechos; la exactitud depende de Google News y de los editores indexados, según advierte el propio autor.
- Depende de APIs públicas gratuitas que pueden cambiar de formato, imponer límites de uso o dejar de estar disponibles.
- El APK distribuido es de depuración (`debug`), no una build de producción firmada.
- La licencia MIT permite uso comercial y modificación, pero no se ofrecen garantías.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque no hay componente generativo; la interfaz está en inglés.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de adopción ni mantenimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hkblockchaintechnology/World-Pulse
- Google News RSS: https://news.google.com/rss
- API de Hacker News: https://github.com/HackerNews/API
- API de terremotos del USGS: https://earthquake.usgs.gov/fdsnws/event/1/
- Open-Meteo: https://open-meteo.com/
