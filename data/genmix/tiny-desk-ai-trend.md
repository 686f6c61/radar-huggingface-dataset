# GenMix/Tiny-Desk-AI-Trend

## Resumen

Tiny-Desk-AI-Trend es un efecto alojado de generación de vídeo image-to-video publicado por GenMix en Hugging Face. No se distribuyen pesos: el repositorio es únicamente una model card que documenta un servicio accesible vía navegador en genmix.ai. El efecto convierte de una a cinco fotos de personas en un clip vertical de 15 segundos (9:16) que reproduce el meme de TikTok del Tiny Desk Concert de Charlie Wilson (junio de 2023, NPR), concretamente el momento en que su banda interpreta «Outstanding» de Gap Band.

El sistema se apoya en el modelo de vídeo Wan 3.0, al que se le proporciona el clip original como referencia. Cada persona se dibuja primero como un retrato de estudio generado por IA, de cintura para arriba y sobre fondo liso, y esos retratos alimentan la generación del vídeo. La salida mantiene la estructura fija de tres planos (la banda con el cantante al teclado rojo, el primer plano de risa y el solo de saxofón), los dos cortes duros y el audio original.

Es relevante como ejemplo de producto de consumo construido sobre un modelo de vídeo de gran tamaño: plantilla cerrada, roles predefinidos según el número de fotos, resolución configurable (480P, 720P o 1080P) y tiempos de generación de entre 5 y 15 minutos. La licencia es propietaria (genmix-terms-of-service) y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (servicio alojado; generación de vídeo basada en Wan 3.0 según la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | genmix-terms-of-service (propietaria, enlace en la model card) |
| Formato de pesos | no disponible (no se publican pesos; solo model card) |

## Arquitectura y entrenamiento

No se publica información sobre la arquitectura interna del sistema. La model card indica que los vídeos se generan con el modelo Wan 3.0, al que se le pasa el clip de Tiny Desk como referencia, y que previamente un modelo de imagen dibuja a cada persona como retrato de estudio de cintura para arriba sobre fondo liso. Si el retrato no se puede generar, se usa directamente la foto original de esa persona.

No hay datos sobre volumen de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas internas. El pipeline declarado es image-to-video y la salida es un MP4 vertical 9:16 de 15 segundos a 480P, 720P o 1080P, con sincronización labial del cantante principal respecto al audio original. El repositorio de Hugging Face tiene un tamaño de 0.0 GB, lo que confirma que no contiene artefactos de modelo.

## Capacidades

- Generación de vídeo image-to-video a partir de una a cinco fotos de personas o de una única foto grupal de hasta cinco personas.
- Composición automática de roles: cantante principal, primer plano de risa, saxofonista y dos coristas, asignados según el número de fotos de entrada.
- Transferencia de identidad limitada a cara, pelo, edad y ropa; el fondo de la foto original no se conserva.
- Conservación del escenario del clip de referencia: sala con discos y estanterías, auriculares, micrófonos, temporización, dos cortes duros y audio original.
- Sincronización labial del cantante principal con el audio de «Outstanding».
- Salida en tres resoluciones (480P, 720P, 1080P) manteniendo duración y estructura de planos.
- Entrada en JPEG, PNG o WebP con límite de 10 MB por archivo.
- Procesamiento asíncrono: el usuario puede cerrar la página y recuperar el resultado en «My Videos».
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión general, audio de entrada ni modo thinking.

## Casos de uso

- Creación de contenido viral para TikTok, Instagram Reels y YouTube Shorts: el usuario sube fotos de amigos o familiares y obtiene un clip de 15 segundos listo para publicar, con formato vertical 9:16 y audio reconocible del meme.
- Marketing de comunidad y engagement en redes: marcas o creadores pueden generar variantes del meme con su equipo o audiencia, aprovechando que la plantilla fija los tres planos y elimina la necesidad de edición manual.
- Contenido de equipo y cultura corporativa: departamentos de RR. HH. o comunicación interna pueden producir piezas ligeras con fotos de empleados para boletines o canales internos, siempre con consentimiento de los retratados.
- Parodias y contenido de humor entre amigos: el modo de una sola persona asigna al usuario los tres papeles (cantante, risa y saxofón), lo que simplifica la creación de clips humorísticos individuales.
- Prototipado rápido de efectos para plataformas sociales: desarrolladores y diseñadores pueden evaluar la calidad de la transferencia de identidad y la coherencia temporal de Wan 3.0 antes de integrar generación de vídeo en sus propios productos.
- Producción de contenido para eventos y celebraciones: bodas, cumpleaños o despedidas pueden generar un clip conmemorativo con los asistentes en menos de 15 minutos por vídeo, sin conocimientos de edición.
- Investigación sobre sesgos y realismo en vídeo generativo: el efecto permite estudiar cómo se preservan edad, género y rasgos faciales al transferir identidades a un clip de referencia fijo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica hardware local: el efecto se ejecuta como servicio alojado en el navegador; no hay pesos descargables ni inferencia en el dispositivo del usuario.
- No se especifican GPU, VRAM ni infraestructura del backend. La model card solo indica que los vídeos se generan con Wan 3.0 en la infraestructura de GenMix.
- Opciones de despliegue local (vLLM, llama.cpp, Ollama, TGI): no disponibles, al no publicarse pesos.
- Tiempo de generación declarado: entre 5 y 15 minutos por vídeo, con aproximadamente 7 minutos en la prueba del 12 de noviembre de 2026 citada por GenMix. Incluye alrededor de un minuto para el retrato de cada persona.
- Latencia y throughput: no disponibles más allá de la estimación anterior por vídeo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GenMix/Tiny-Desk-AI-Trend | Efecto alojado image-to-video sobre Wan 3.0 | no disponible | no disponible | genmix-terms-of-service | Solo vía navegador en genmix.ai; sin pesos |
| Wan 3.0 | Modelo de generación de vídeo | no disponible en la información proporcionada | no disponible | no disponible | no disponible |
| Otros efectos de vídeo alojados (p. ej. plantillas de memes en plataformas sociales) | Servicio cerrado | no disponible | no disponible | propietaria | Según plataforma |

No se dispone de datos de rendimiento comparado (calidad de identidad, coherencia temporal, FVD, etc.) que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No se publican pesos ni código: el repositorio es solo una model card y no permite inferencia local, auditoría del modelo ni despliegue propio.
- Licencia propietaria sujeta a los términos de servicio de GenMix; el uso comercial está condicionado a dichos términos y no se detallan aquí las restricciones concretas.
- Idioma declarado únicamente inglés, aunque la salida es principalmente audiovisual.
- Riesgo de que un intérprete original del clip permanezca en algún plano en lugar de la persona del usuario; la model card documenta este fallo en el primer plano del saxofón durante la prueba del 12 de noviembre de 2026.
- Fallos frecuentes con fotos que contienen una segunda cara (por ejemplo, un adulto sosteniendo a un bebé), planos de cuerpo entero alejados o filtros intensos.
- El sistema estima la edad de las personas y puede intercambiar las fotos si detecta un niño de unos 4 años o menos junto a alguien de 10 o más; este comportamiento puede producir resultados inesperados.
- No se permite el uso de fotos de personas sin consentimiento ni de figuras públicas o celebridades, según la model card.
- El fondo de las fotos originales no se conserva, lo que limita el control creativo sobre la escena.
- Estructura y duración fijas (15 segundos, tres planos, audio concreto): no es un modelo de vídeo generalista y no admite prompts libres ni duraciones arbitrarias.
- No hay información sobre sesgos demográficos, tasas de alucinación visual ni robustez ante distintos tonos de piel, edades o complexiones.
- El meme de origen está vinculado a una tendencia concreta de TikTok iniciada el 18 de octubre de 2026; su relevancia puede decaer con el tiempo.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/GenMix/Tiny-Desk-AI-Trend
- Servicio (con parámetros de campaña): https://genmix.ai/video/tiny-desk-ai?utm_source=huggingface&utm_medium=model&utm_campaign=tiny-desk-ai-trend
- Términos de servicio: https://genmix.ai/terms-of-service
- Imagen de cabecera: https://huggingface.co/GenMix/Tiny-Desk-AI-Trend/resolve/main/hero.jpg
- Ilustraciones de los tres planos: https://huggingface.co/GenMix/Tiny-Desk-AI-Trend/resolve/main/shot-band.jpg, https://huggingface.co/GenMix/Tiny-Desk-AI-Trend/resolve/main/shot-laugh.jpg, https://huggingface.co/GenMix/Tiny-Desk-AI-Trend/resolve/main/shot-sax.jpg
