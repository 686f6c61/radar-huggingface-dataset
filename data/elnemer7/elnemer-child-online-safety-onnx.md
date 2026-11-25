# elnemer7/ElNeMeR-Child-Online-Safety-ONNX

## Resumen

ElNeMeR-Child-Online-Safety-ONNX es un clasificador de texto multilingue (arabe e ingles) orientado a la deteccion de riesgos en conversaciones de menores en entornos digitales. Lo desarrolla Eng. Mahmoud ElNemer a traves de ElNeMeR Digital Solutions & AI, y se presenta como un modelo de IA humanitaria centrado en la proteccion de ninos y adolescentes de entre 8 y 17 anos en plataformas de videojuegos (Roblox, PUBG, FreeFire, Discord) y mensajeria social.

El modelo resuelve una tarea de clasificacion de texto en cuatro clases: conversacion segura entre iguales, grooming o captacion en linea, ciberacoso con incitacion a la autolesion y solicitud de datos de localizacion o encuentros fisicos no supervisados. Su relevancia reside en el enfoque preventivo: detectar senales tempranas de manipulacion psicologica antes de que se produzca el abuso.

La informacion publica disponible es muy limitada. El repositorio de Hugging Face no contiene pesos (tamano de 0.0 GB) y la model card no detalla arquitectura, numero de parametros, longitud de contexto ni datos de entrenamiento. Se distribuye en formato ONNX bajo licencia MIT y esta etiquetado como modelo de la libreria ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Tarea | Clasificacion de texto (4 clases) |
| Etiquetas de clase | 0: SAFE_FRIENDLY_CHAT; 1: ONLINE_GROOMING_LURING; 2: CYBERBULLYING_SELFHARM; 3: LOCATION_DOXXING_MEETUP |
| Tamano del repositorio | 0.0 GB (sin pesos publicados) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la documentacion disponible. El tag `library_name: onnx` y el sufijo del identificador indican que el artefacto es una exportacion a ONNX, presumiblemente de un transformer encoder para clasificacion de secuencias, pero no se confirma el modelo base ni el numero de parametros.

Tampoco se detallan los datos de entrenamiento: no hay informacion sobre el volumen de tokens, la composicion del corpus, el origen de las conversaciones etiquetadas, ni si se aplicaron tecnicas de ajuste fino supervisado, RLHF o DPO. La model card se limita a describir la mision humanitaria y las cuatro categorias de salida, sin especificaciones tecnicas ni metodologia.

## Capacidades

- Clasificacion de texto en cuatro categorias de riesgo: conversacion segura, grooming, ciberacoso con autolesion y doxxing con proposito de encuentro.
- Deteccion de patrones de manipulacion psicologica: aislamiento por secreto ("no se lo cuentes a mama"), soborno con moneda virtual de juegos, solicitacion de fotos o webcam.
- Deteccion de acoso severo, amenazas de ostracismo e incitacion a la autolesion.
- Deteccion de solicitud de direccion postal, horarios de salida del colegio o encuentros fisicos no supervisados.
- Soporte bilingue arabe-ingles.
- Orientado a moderacion de contenido en plataformas de gaming y mensajeria.
- No se documenta soporte de tool calling, razonamiento multi-paso, agentes, vision ni audio.

## Casos de uso

- Moderacion en tiempo real de chats de videojuegos: el clasificador puede filtrar mensajes en Roblox, PUBG, FreeFire o Discord y marcar conversaciones con patrones de grooming para revision humana, aprovechando su entrenamiento especifico en jerga de gaming.
- Sistemas de alerta temprana para padres y tutores: integrado en una aplicacion de control parental, el modelo puede clasificar conversaciones y notificar al tutor cuando se detecta aislamiento por secreto o soborno con moneda virtual.
- Triaje forense en investigaciones de proteccion de menores: la clasificacion en cuatro categorias permite priorizar grandes volumenes de transcripciones de chat en casos de ciberacoso o captacion.
- Moderacion de comunidades en plataformas de mensajeria: filtrado automatizado de mensajes con solicitud de datos de localizacion o proposicion de encuentros fisicos no supervisados.
- Deteccion de ciberacoso con incitacion a la autolesion en foros y chats escolares, con escalado a protocolos de intervencion psicologica.
- Despliegue en entornos con recursos limitados: al distribuirse en formato ONNX, puede ejecutarse con ONNX Runtime en servidores modestos o en el borde, aunque el repositorio no contiene los pesos actualmente.
- Investigacion academica en IA humanitaria: el modelo sirve como referencia de clasificacion de riesgos en linea para menores en contextos araboparlantes, un area con pocos recursos publicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible (el repositorio no contiene pesos y no se especifica el tamano del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime; el formato ONNX es compatible con multiples backends (ONNX Runtime, TensorRT, OpenVINO), pero no se documentan configuraciones probadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ElNeMeR-Child-Online-Safety-ONNX | Clasificacion de riesgo infantil (4 clases) | ar, en | MIT | ONNX | Repositorio sin pesos publicados |
| OpenAI Moderation API | Moderacion de contenido general | Multiples | API propietaria | API | Servicio en la nube |
| Llama Guard (Meta) | Clasificacion de seguridad en conversaciones | Multiples | Llama Community License | Safetensors, GGUF | Pesos publicos |
| Detoxify (unitary) | Deteccion de toxicidad | Principalmente en | Apache 2.0 | PyTorch | Pesos publicos |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con estos modelos.

## Limitaciones y advertencias

- El repositorio de Hugging Face muestra un tamano de 0.0 GB, por lo que los pesos del modelo no estan disponibles publicamente en el momento de redactar esta ficha; no es posible evaluarlo ni desplegarlo directamente.
- No se documenta la arquitectura, el modelo base ni el proceso de entrenamiento, lo que impide evaluar su calidad, robustez o reproducibilidad.
- No hay benchmarks publicados; se desconoce su precision, recall y tasa de falsos positivos en las cuatro clases.
- El modelo solo cubre arabe e ingles; no se documenta soporte para castellano ni otras lenguas.
- Riesgo de sesgos por el origen de los datos de entrenamiento, que no se especifica: posible sobrerrepresentacion de ciertas jergas, dialectos arabes o contextos culturales.
- Riesgo de alucinacion o clasificacion erronea inherente a cualquier clasificador; en un dominio sensible como la proteccion de menores, los falsos negativos pueden tener consecuencias graves y los falsos positivos pueden estigmatizar conversaciones normales.
- La licencia MIT permite uso comercial, pero la ausencia de pesos y de documentacion tecnica limita cualquier validacion en produccion.
- No debe usarse como unico mecanismo de proteccion: requiere supervision humana y protocolos de escalado.
- La model card incluye datos de contacto personal del autor y enlaces a una plataforma propia; conviene verificar la procedencia y el mantenimiento del proyecto antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Child-Online-Safety-ONNX
- Plataforma en vivo: https://detector.elnemer-ai.com
- Sitio del autor: https://elnemer-ai.com
