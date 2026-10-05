# anandanraju/FDT_CD_TRAFFIC-FLOOD_DECISION_SUPPORT_SYSTEM

## Resumen

FedUDT (Federated Digital Twin) es el artefacto publicado en Hugging Face con el identificador `anandanraju/FDT_CD_TRAFFIC-FLOOD_DECISION_SUPPORT_SYSTEM` por el usuario anandanraju (Anandan R). No es un modelo de lenguaje ni un modelo de pesos entrenados: es un Space de tipo Docker que ejecuta una aplicacion Streamlit en el puerto 7860 para demostrar un gemelo digital federado de apoyo a la decision en escenarios combinados de trafico y inundaciones en ciudades inteligentes. El propio autor lo presenta como la capa de demostracion y despliegue de un caso de estudio de M.Tech titulado "A Federated Digital Twin Framework for Cross-Domain Traffic-Flood Decision Support in Sustainable Smart Cities".

La aplicacion carga una tabla de predicciones federadas ya almacenada, normaliza el riesgo de trafico a partir de la velocidad pronosticada respecto a una velocidad de flujo libre configurable, fusiona ese riesgo con la probabilidad de inundacion mediante pesos y umbrales ajustables por el usuario, y asigna a cada segmento de via uno de tres estados: `OPEN`, `CAUTION` o `AT_RISK`. La visualizacion tipo GIS se apoya en la geometria real de los sensores del conjunto METR-LA, mientras que los valores de velocidad de trafico, precipitacion, elevacion y etiquetas de inundacion son explicitamente sinteticos, porque los conjuntos de observacion originales no estaban disponibles en el entorno de ejecucion.

Es relevante como ejemplo reproducible de arquitectura de gemelo digital federado y de fusion de riesgo entre dominios, no como sistema operativo de prediccion de inundaciones. El Space acumula 0 descargas y 0 likes, no declara licencia ni idiomas, y fue creado y actualizado el 4 de octubre de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible: no es un modelo con pesos, es una aplicacion de demostracion (Space Docker con Streamlit) |
| Parametros totales | no disponible (no aplicable) |
| Longitud de contexto | no disponible (no aplicable) |
| Tipos de cuantizacion | no disponible (no aplicable) |
| Idiomas soportados | no disponible; la interfaz y la documentacion estan en ingles |
| Licencia | no disponible: la model card no declara licencia |
| Formato de pesos | no disponible: no se publican pesos; el Space usa tablas de prediccion almacenadas y hace referencia a modelos joblib que no se incluyen |
| Tipo de artefacto | Space de Hugging Face, SDK `docker`, `app_port: 7860` |
| Framework de interfaz | Streamlit (`streamlit run app.py`) |
| Datos de entrada | tabla de predicciones federadas almacenada, copiada del paquete de salida validado de la revision 2 |
| Metadatos reales | ubicaciones de sensores y distancias de la red viaria de METR-LA |
| Datos sinteticos | velocidad de trafico, precipitacion, elevacion y etiquetas de inundacion |
| Variables o secretos requeridos | ninguno |
| Autor | anandanraju (Anandan R) |
| Fecha de creacion | 4 de octubre de 2026 |
| Fecha de actualizacion | 4 de octubre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El sistema descrito se organiza en cuatro capas funcionales: un gemelo digital de trafico que emite una velocidad pronosticada por segmento de via, un gemelo digital de inundacion que emite una probabilidad de riesgo por sensor o segmento, una capa de coordinacion federada que solo combina las dos salidas de prediccion, y un motor de decision entre dominios que aplica una fusion de riesgo ponderada con umbrales configurables. El autor precisa que no se ejecuta un promedio federado real (`federated averaging`): el caso de estudio implementa inferencia federada, es decir, intercambio de predicciones y no de gradientes ni de pesos. La vista de accesibilidad sensible a inundaciones recalcula el estado de la via de forma interactiva, y la ruta y el estado se representan sobre el grafo de sensores METR-LA.

No hay informacion sobre entrenamiento en el sentido habitual: no se publican tokens de entrenamiento, composicion de dataset, ni fases de RLHF o DPO, y no aplican porque no se distribuyen pesos. La implementacion de investigacion original, segun la propia model card, incluye ficheros CSV locales de gran tamano, modelos joblib ya entrenados y un pipeline completo que regenera el experimento; el Space sustituye esas entradas por salidas de prediccion almacenadas para mantenerse ligero y reproducible. No se detalla ninguna innovacion de decodificacion, atencion lineal ni mecanismo de inferencia especulativa; la unica innovacion metodologica declarada es la fusion de riesgo entre dominios con pesos y umbrales ajustables en tiempo de ejecucion.

## Capacidades

- Pronostico de velocidad por segmento de via a partir de la salida almacenada del gemelo digital de trafico.
- Estimacion de probabilidad de riesgo de inundacion por sensor o segmento a partir del gemelo digital de inundacion.
- Fusion ponderada de ambos riesgos con pesos configurables por el usuario.
- Clasificacion de cada segmento en `OPEN`, `CAUTION` o `AT_RISK` segun umbrales seleccionables.
- Recalculo interactivo de la capa de estado viario al modificar pesos o umbrales.
- Visualizacion tipo GIS del grafo de sensores METR-LA coloreado segun el estado fusionado.
- Vista de accesibilidad sensible a inundaciones, con recomputacion del estado de las vias afectadas.
- Ejemplos de enrutamiento almacenados y evidencia de evaluacion procedente de la ejecucion del caso de estudio.
- Contador agregado de segmentos en cada estado en la vista principal.
- No incluye capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni agentes.

## Casos de uso

- Prototipado de sistemas de apoyo a la decision urbana: el Space sirve como plantilla funcional para validar el flujo "prediccion de trafico + prediccion de inundacion -> estado viario" antes de invertir en la integracion real de datos.
- Demostracion academica y defensa de tesis: permite mostrar de forma interactiva la arquitectura de gemelo digital federado y el motor de fusion de riesgo a un tribunal o a un equipo de investigacion, sin necesidad de distribuir los CSV ni los modelos joblib originales.
- Calibracion de umbrales con responsables municipales: al exponer los pesos y los umbrales como parametros de la interfaz, los servicios de emergencia pueden explorar como cambia el numero de segmentos `AT_RISK` segun la politica de corte adoptada.
- Integracion de senales heterogeneas como patron de diseno: el caso de estudio sirve de referencia para proyectos que necesiten combinar dominios distintos conservando la privacidad, ya que solo se comparten predicciones y no datos brutos ni pesos.
- Visualizacion para sala de control: el render del grafo de sensores coloreado por estado y la tabla de decision resultante son un punto de partida reutilizable para paneles operativos de gestion de incidentes.
- Docencia en sistemas distribuidos y ciudades inteligentes: el Space ilustra la diferencia entre `federated averaging` e inferencia federada con una implementacion ejecutable y ligera.
- Despliegue reproducible en Hugging Face Spaces: el repositorio sirve como ejemplo de Space Docker con Streamlit, sin variables de entorno ni secretos, util como plantilla para otros demostradores de investigacion.
- Base para un sistema federado real: las capas de fusion y decision pueden mantenerse mientras se sustituyen las tablas de prediccion almacenadas por salidas en vivo de los dos gemelos digitales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona "evidencia de evaluacion" procedente de la ejecucion del caso de estudio, pero no ofrece cifras, metricas ni comparaciones numericas, y advierte expresamente que el experimento no proporciona exactitud de cierre de rutas contra una verdad de referencia.

## Requisitos de hardware

- GPU: no necesaria. La aplicacion no ejecuta inferencia de redes neuronales publicadas, sino lectura de tablas de prediccion y renderizado de un grafo.
- VRAM estimada: no aplicable (0 GB); no hay pesos que cargar.
- CPU y memoria: el perfil habitual de un Space de Hugging Face en su nivel gratuito (2 vCPU y 16 GB de RAM) es mas que suficiente para una aplicacion Streamlit con pandas; una estimacion conservadora de consumo real es de 2 a 4 GB de RAM, dependiendo del tamano de la tabla de predicciones cargada. Esta cifra es una estimacion, no un dato publicado.
- GPU recomendadas: no aplicable. No hay soporte ni necesidad de A100, H100 ni RTX 4090.
- Ejecucion en GPU de consumo: no aplicable, ya que no requiere GPU.
- Opciones de despliegue: Hugging Face Spaces con SDK Docker en el puerto 7860; ejecucion local mediante `pip install -r requirements.txt` y `streamlit run app.py`; contenedor Docker en cualquier host que exponga el puerto 7860.
- Marcos no aplicables: vLLM, llama.cpp, Ollama y TGI no son utilizables porque no existen pesos en formato safetensors ni GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones; el tiempo de respuesta dependera del tamano de la tabla de predicciones y del renderizado del grafo, no de computo en GPU.

## Comparativa con modelos similares

No hay modelos comparables con especificaciones publicadas en la informacion disponible. Los proyectos localizados en la busqueda son sistemas de proposito parecido pero de naturaleza distinta y sin datos tecnicos que permitan una comparacion cuantitativa:

| Proyecto | Enfoque | Datos | Licencia | Rendimiento publicado |
|---|---|---|---|---|
| FedUDT (este Space) | Gemelo digital federado trafico-inundacion con motor de fusion de riesgo | Metadatos METR-LA reales; valores sinteticos | no disponible | no disponible |
| JalRakshak (GitHub) | Sistema de apoyo a la decision hidraulico que convierte salidas de simulacion de rotura de presa en viabilidad de rutas de evacuacion | no disponible | no disponible | no disponible |
| Google Flood Hub | Prevision de inundaciones con aprendizaje automatico, avisos con hasta 7 dias de antelacion | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se usan API en vivo de trafico, precipitacion, modelo digital de elevacion ni cierre de vias; todas las entradas son datos almacenados.
- No se realiza un promedio federado real: el caso de estudio implementa inferencia federada, de modo que las garantias teoricas de privacidad de un esquema de entrenamiento federado no son aplicables.
- Los ejemplos de enrutamiento son demostraciones de riesgo sintetico y el experimento no aporta exactitud de cierre de rutas frente a una verdad de referencia, por lo que no debe presentarse como capacidad predictiva validada.
- Los valores de velocidad de trafico, precipitacion, elevacion y etiquetas de inundacion son sinteticos; solo son reales las ubicaciones de sensores y los metadatos de distancia de la red viaria de METR-LA. La propia model card advierte que se demuestra funcionalidad e integracion del sistema, no exactitud de prevision de inundaciones en el mundo real.
- No se declara licencia, por lo que no puede asumirse permiso de uso comercial ni de redistribucion. Antes de reutilizar el codigo o los datos conviene contactar con el autor.
- No se declaran idiomas soportados y la interfaz esta en ingles; no hay evaluacion multilingue.
- Riesgo de alucinacion: no aplicable en el sentido de generacion de texto, pero si existe riesgo de interpretacion erronea de los estados `OPEN`, `CAUTION` y `AT_RISK` como predicciones fiables cuando dependen de datos sinteticos y de umbrales elegidos manualmente.
- Sesgos conocidos: no disponibles. Al ser datos sinteticos, no hay analisis de sesgo geografico ni demografico.
- Para produccion: no debe conectarse a un flujo operativo real sin sustituir las tablas almacenadas por predicciones en vivo, validar los dos gemelos digitales por separado y calibrar los umbrales con datos historicos verificados.
- Aviso de trazabilidad: la unica evidencia metodologica formal es el informe completo del caso de estudio de M.Tech, que no se enlaza desde el Space.

## Enlaces

- Space en Hugging Face: https://huggingface.co/anandanraju/FDT_CD_TRAFFIC-FLOOD_DECISION_SUPPORT_SYSTEM
- Perfil del autor en Hugging Face: https://huggingface.co/anandanraju
- Articulo de revision sobre IA para gestion del riesgo de inundaciones (ScienceDirect): https://www.sciencedirect.com/science/article/pii/S2212420924008720
- Google Flood Hub, prevision de inundaciones con IA (Google Research): https://sites.research.google/floodforecasting/
- Proyecto JalRakshak, sistema de apoyo a la decision hidraulico (GitHub): https://github.com/abdul05kh/JalRakshak/tree/main
- Reportaje sobre el uso de IA en la respuesta a inundaciones en Nepal (Kathmandu Post): https://kathmandupost.com/national/2026/09/06/how-an-it-engineer-used-ai-to-aid-nepal-s-flood-response
