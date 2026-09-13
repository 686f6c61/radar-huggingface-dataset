# Asyagul1993/PakEco

## Resumen

PakEco (publicado como `Asyagul1993/PakEco`) no es un modelo de lenguaje con pesos entrenados, sino una aplicación Python de tipo hackathon para la monitorización de la contaminación atmosférica en ciudades de Pakistán y su comparación entre ciudades. El repositorio contiene dos frontends (una interfaz Gradio en `gradio_app.py` y un panel Streamlit en `streamlit_app.py`) sobre un backend compartido (`backend.py`) que consume la API de calidad del aire y la API meteorológica de Open-Meteo, además de la API de Gemini para el asistente conversacional. No se publican pesos, checkpoints, arquitectura de red ni datos de entrenamiento en la información disponible.

El valor del proyecto, por tanto, no está en capacidades de modelado propias, sino en la orquestación de servicios externos: Open-Meteo proporciona variables de PM2,5, PM10, AQI estadounidense y AQI europeo basadas en el pronóstico de composición atmosférica de CAMS, y Gemini actúa como capa de generación de lenguaje para el asistente medioambiental. Cualquier evaluación del "modelo" en el sentido habitual (benchmarks, parámetros, contexto) carece de sentido aquí, porque la inferencia se delega íntegramente a un servicio propietario de Google cuya versión concreta no se especifica.

Los metadatos de HuggingFace indican 0 descargas y 0 likes, licencia no disponible, idiomas no declarados y etiqueta `region:us`. La fecha de creación registrada (12 de septiembre de 2026) es posterior a la fecha de actualización de la mayoría de repositorios públicos consultados y resulta inconsistente, por lo que conviene tratarla con cautela. El propio autor declara una limitación importante: los valores de contaminación son modelados y están ligados a coordenadas seleccionadas, no son mediciones de estaciones oficiales de monitorización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal; es una aplicación Python con dos frontends (Gradio y Streamlit) sobre un backend compartido que orquesta APIs externas |
| Parametros totales | no disponible (no se publican pesos ni checkpoints) |
| Parametros activos | no aplica (no es un modelo Mixture of Experts) |
| Longitud de contexto | no disponible (depende de la API de Gemini utilizada, que no se especifica) |
| Tipos de cuantizacion | no disponible (no hay pesos que cuantizar) |
| Idiomas soportados | no disponibles (no declarados en la model card ni en los metadatos) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene código `.py`, `requirements.txt`, `README.md`, `PRD.md`, `DEMO_SCRIPT.md`, `project.json` y `data/sample_data.csv`) |

## Arquitectura y entrenamiento

La arquitectura descrita por el autor es una topología de tres capas: cliente (usuario o navegador), capa de presentación con dos frontends independientes (Gradio para la demo interactiva con IA y Streamlit para el panel de datos) y una capa de backend única (`backend.py`) que actúa como fachada de integración. El backend se conecta a tres servicios remotos: la API de calidad del aire de Open-Meteo, la API meteorológica de Open-Meteo y la API de Gemini. No existe ningún componente de inferencia local, ningún proceso de entrenamiento, ajuste fino, RLHF o DPO documentado, ni ninguna innovación técnica de modelado (atención lineal, decodificación especulativa, arquitecturas híbridas SSM, etc.).

Los datos que maneja la aplicación provienen de Open-Meteo, que a su vez documenta que el pronóstico de calidad del aire se basa en datos de composición atmosférica de CAMS. El repositorio incluye únicamente un `data/sample_data.csv` como datos de ejemplo; no hay corpus de entrenamiento, dataset etiquetado ni pipeline de evaluación. La capa de IA es una llamada a un modelo Gemini no versionado, sin parámetros de generación documentados (temperatura, top-p, límite de tokens) ni evaluación de la calidad de sus respuestas.

## Capacidades

- Selección de ciudades de Pakistán desde la interfaz, con consulta de valores por coordenadas.
- Consulta y presentación de AQI estadounidense y AQI europeo, además de PM2,5 y PM10.
- Consulta de variables meteorológicas: temperatura, humedad y viento.
- Generación de gráficos horarios de material particulado.
- Comparación entre varias ciudades y gráfico de ranking de AQI.
- Asistente medioambiental conversacional basado en la API de Gemini, con gestión de errores de API y de IA.
- Backend compartido entre los dos frontends, para evitar duplicar lógica de integración.
- Funcionamiento sin clave de API para la petición estándar de Open-Meteo en el MVP.
- Capacidades multilingües: no disponibles (no declaradas).
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (modo de pensamiento, visión, audio): no documentadas.

## Casos de uso

- Panel divulgativo para hackathon o demo técnica: desplegar el dashboard de Streamlit en Streamlit Community Cloud y una interfaz Gradio en un Space de Hugging Face permite mostrar en minutos una comparativa de AQI entre ciudades paquistaníes sin coste de infraestructura de inferencia.
- Monitorización ciudadana de calidad del aire: activistas o medios locales pueden consultar PM2,5 y PM10 por ciudad y publicar gráficos horarios, siempre etiquetando los datos como modelados y no como mediciones de estación.
- Comparación entre ciudades para priorización de políticas: el gráfico de ranking de AQI permite ordenar ciudades por exposición estimada y orientar campañas de concienciación o estudios preliminares.
- Enseñanza de integración de APIs en Python: el código sirve como ejemplo didáctico de backend compartido entre dos frontends y de manejo de errores de APIs externas.
- Asistente conversacional de apoyo a la interpretación de datos: el asistente Gemini puede explicar qué significa un valor de AQI o de PM2,5 en términos generales, con la salvedad de que no emite diagnósticos médicos y puede alucinar.
- Prototipo de producto de vigilancia ambiental para ONG: el MVP permite validar la hipótesis de demanda antes de invertir en datos de estaciones oficiales o en modelos propios.
- Integración en un flujo de datos meteorológicos internos: el backend puede reutilizarse como capa de normalización de las respuestas de Open-Meteo dentro de otra aplicación mayor.
- Base para investigación preliminar sobre episodios de contaminación: los gráficos horarios permiten identificar picos relativos y formular hipótesis, aunque la validación requeriría fuentes de observación adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de precisión, latencia, throughput ni comparaciones cuantitativas con otras herramientas de monitorización de calidad del aire.

## Requisitos de hardware

- No se requiere GPU para la aplicación en sí: toda la inferencia de lenguaje se delega a la API de Gemini, y los datos de calidad del aire y meteorología provienen de APIs HTTP de Open-Meteo.
- VRAM estimada para inferencia: no aplica, no hay inferencia local de modelos.
- GPU recomendadas: no aplica. El código se ejecuta en CPU.
- ¿Cabe en GPU de consumo? No aplica; no se necesita GPU de ningún tipo.
- Requisitos del entorno: Python 3.10 o superior (según la documentación actual de Gradio citada por el autor), `pip install -r requirements.txt`, conexión a internet y una variable de entorno `GEMINI_API_KEY` válida.
- Opciones de despliegue: ejecución local con `python gradio_app.py` y `streamlit run streamlit_app.py`; despliegue del panel en Streamlit Community Cloud con el secreto `GEMINI_API_KEY = "..."`; despliegue del frontend Gradio en un Space de Hugging Face con SDK Gradio y la clave como secreto.
- Latencia y throughput estimados: no disponibles. Dependen por completo de la latencia de las APIs de Open-Meteo y Gemini y de la cuota de la clave de Gemini utilizada.
- Nota operativa: no se debe subir `.env`, claves de API ni `secrets.toml` al control de versiones, según advierte el propio autor.

## Comparativa con modelos similares

No disponible. PakEco no es un modelo de lenguaje ni un modelo de predicción de calidad del aire entrenado por sus autores, sino una aplicación que consume APIs de terceros, por lo que no existe una comparación homogénea en términos de parámetros, contexto o benchmarks. La comparación pertinente sería entre aplicaciones de paneles de calidad del aire, y en la información proporcionada no se identifican alternativas concretas con las que contrastarlo.

| Criterio | PakEco | Alternativa comparable |
|---|---|---|
| Tipo de artefacto | Aplicación Python con dos frontends sobre APIs | no disponible |
| Motor de lenguaje | API de Gemini (versión no especificada) | no disponible |
| Fuente de datos ambientales | Open-Meteo (calidad del aire y meteorología, basado en CAMS) | no disponible |
| Pesos publicados | Ninguno | no disponible |
| Licencia | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No hay evaluación de sesgos del asistente Gemini ni de la cobertura geográfica de las estimaciones de Open-Meteo para ciudades paquistaníes.
- Riesgo de alucinación: presente en el asistente conversacional, al depender de un modelo generativo de terceros; el autor no documenta ninguna capa de verificación factual de sus respuestas.
- Los valores de contaminación son modelados y están vinculados a coordenadas seleccionadas. No deben presentarse como mediciones de estaciones oficiales de monitorización, tal como advierte explícitamente el autor.
- El asistente evita el diagnóstico médico de forma intencionada, pero no se documenta ninguna evaluación clínica ni de seguridad sanitaria.
- Limitaciones de contexto e idioma: no disponibles. No se declaran idiomas soportados ni límites de longitud de conversación.
- Restricciones de licencia: la licencia figura como no disponible en los metadatos de HuggingFace, por lo que el uso comercial no está autorizado de forma explícita y requiere contactar con el autor.
- Dependencia de terceros: la aplicación deja de funcionar o degrada su funcionalidad si fallan las APIs de Open-Meteo o si la clave de Gemini no es válida, no tiene cuota o se revoca.
- Obligaciones de atribución: al publicar o redistribuir datos de Open-Meteo hay que cumplir los requisitos de atribución vigentes relativos a CAMS/Open-Meteo.
- Versionado ausente: no se especifica la versión del modelo Gemini ni los parámetros de generación, lo que impide reproducir resultados de forma fiable.
- Consistencia de metadatos: la fecha de creación registrada (2026-09-12) es anómala y sugiere un error de configuración; conviene no tomarla como referencia.
- Madurez: 0 descargas y 0 likes, sin historial de mantenimiento ni pruebas documentadas más allá del uso previsto en hackathon.
- Resultados de la búsqueda web: las consultas realizadas devolvieron exclusivamente dominios de contenido para adultos sin relación alguna con el proyecto, por lo que no aportan información técnica aprovechable ni enlaces válidos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Asyagul1993/PakEco
- Documentación de la API de calidad del aire de Open-Meteo: https://open-meteo.com/en/docs/air-quality-api
- Documentación de la API meteorológica de Open-Meteo: https://open-meteo.com/en/docs
- Documentación de la API de Gemini: https://ai.google.dev/gemini-api/docs
- Google AI Studio (obtención de claves de API de Gemini): no disponible como enlace directo en la información proporcionada
- Repositorio GitHub del proyecto: no disponible
- URL de la demo en Streamlit: no disponible
- URL de la demo en Gradio: no disponible
- Publicación o paper asociado: no disponible
