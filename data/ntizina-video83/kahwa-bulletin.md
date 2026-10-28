# ntizina-video83/kahwa-bulletin

## Resumen

`ntizina-video83/kahwa-bulletin` no es un modelo de IA: es un repositorio de codigo (0,0 GB, sin pesos) que implementa un pipeline automatizado de generacion de videos cortos de futbol en arabe, bajo la marca «قهوة سبور» (Kahwa Sports). El autor publica tres piezas diarias —resumen de resultados nocturno, resumen de noticias matinal y previa de partidos— en formato vertical 1080×1920 a 30 fps, destinadas a Reels e historias de redes sociales.

El sistema no entrena ni distribuye ningun modelo propio. Orquesta servicios externos: datos factuales de la API publica JSON de ESPN y de 26 fuentes verificadas, redaccion en arabe a cargo de Gemini, sintesis de voz con la voz `ar-001-tutor-2` de Gemini 3.8 Flash TTS (con alternativas 3.8 Flash-Lite TTS), y verificacion de idioma y alineacion mediante Whisper. La renderizacion corre en Python (`kahwa/render3.py`) y la ejecucion se delega a GitHub Actions, con las claves API alojadas en un Cloudflare Worker privado (`kahwa-bulletin-gw`) para que el repositorio publico no contenga secretos.

Su relevancia no esta en el rendimiento de un modelo, sino en el patron de ingenieria: un pipeline «keyless-in-code» con comprobaciones deterministas (`gate.py`, `nameguard.py`), deduplicacion por clave `<date>-<mode>` y reglas editoriales explicitas. Es un ejemplo de orquestacion de LLM y TTS para produccion de contenido periodistico, no un artefacto evaluable con benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; pipeline de orquestacion en Python sobre APIs externas) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (depende de los servicios externos invocados) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (contenido generado y voz TTS); el codigo y la documentacion estan en ingles |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio no contiene pesos) |
| Autor | ntizina-video83 |
| Tamano del repositorio | 0,0 GB |
| Pipeline declarado en HuggingFace | no disponible |
| Fecha de creacion | 2026-10-26 |
| Ultima actualizacion | 2026-10-28 |
| Descargas / likes | 0 / 0 |
| Etiquetas | arabic, football, video, license:mit, region:us |

## Arquitectura y entrenamiento

No existe entrenamiento ni arquitectura de red que describir. El repositorio define una cadena de procesamiento con cuatro etapas encadenadas. Primero, la recogida de hechos: resultados y calendario desde el JSON publico de ESPN o desde 26 fuentes verificadas (`kahwa/feeds.json`, ventana de 24 horas). Segundo, la redaccion: Gemini genera las lineas en arabe y el resultado se valida de forma automatica (solo arabe, prohibicion de hechos inventados, nombres restringidos a `kahwa/names.py` y `nameguard.py`). Tercero, la locucion: una unica peticion TTS por video, seguida de comprobacion de idioma y alineacion con Whisper. Cuarto, el montaje: linea de tiempo sincronizada con musica a 122 BPM (`kahwa/audio.py`) y renderizado en `kahwa/render3.py` con escudos de clubes, recortes de fotos de jugadores (segmentacion `u2net_human_seg`), texto cinetico y tarjeta final.

El control editorial se implementa como codigo, no como prompts: `gate.py` es una comprobacion previa solo con biblioteca estandar que devuelve `go=1` o `go=0` segun haya partidos o noticias suficientes; las reglas varian por modo (`night`: minimo 3 partidos grandes para video, 1-2 para tarjeta grafica, 0 para no publicar; `morning`: 4-6 historias, cada una oficial o confirmada por dos medios independientes; `fixtures`: todos los partidos de las competiciones configuradas en `kahwa/fixtures_comps.json`, duracion maxima 88 s, omision despues de las 20:00). La publicacion se distribuye mediante Cloudinary y el endpoint `/post` del gateway, con cadena de reintentos Buffer → Zernio → WoopSocial y, en ultimo lugar, la via `goalbot` con Make.

## Capacidades

- Generacion automatica de video vertical 1080×1920 a 30 fps con duracion controlada por modo (45-60 s en `night`, hasta 88 s en `fixtures`).
- Redaccion de guiones en arabe a partir de datos estructurados, con validacion automatica de idioma y de nombres propios.
- Sintesis de voz en arabe con una sola peticion TTS por video y mecanismo de respaldo entre voces.
- Verificacion de audio mediante Whisper (deteccion de idioma y comprobacion de alineacion con el guion).
- Obtencion de datos deportivos en tiempo real desde JSON publico de ESPN y 26 fuentes RSS verificadas con ventana de 24 horas.
- Composicion visual programatica: escudos, recortes de personas con `u2net_human_seg`, texto cinetico, musica sincronizada a 122 BPM y tarjeta de cierre.
- Generacion de miniatura de portada y teaser vertical de 15 s para historias.
- Publicacion multi-destino con reintentos y deduplicacion por `<date>-<mode>`.
- Ejecucion sin secretos en el repositorio: las claves residen en un Cloudflare Worker privado y el runner solo necesita la variable `KAHWA_KEY`.
- No incluye tool calling, agentes de razonamiento multi-paso ni capacidades de vision propias; esas funciones dependen, en su caso, de los servicios externos.

## Casos de uso

- Produccion diaria de resumenes deportivos para medios locales: el modo `night` se ejecuta tras el ultimo partido (23:05-23:30, corte a las 00:45) y publica automaticamente si hay tres o mas partidos relevantes, eliminando el trabajo manual de montaje nocturno.
- Previa de jornada para cuentas de competicion: el modo `fixtures` lista todos los partidos de las competiciones configuradas mas encuentros destacados internacionales, con dos o tres partidos narrados y pantallas paginadas por competicion.
- Boletin matinal de noticias: el modo `morning` agrega cuatro a seis historias filtradas por regla de doble confirmacion, util para cuentas que necesitan volumen constante con control de verificacion.
- Clonado del patron para otras verticales informativas: la separacion entre `gate.py` (decide si publicar), generacion (Gemini) y renderizado (`render3.py`) permite sustituir feeds, idioma y plantillas manteniendo la misma logica editorial.
- Referencia de arquitectura para equipos que despliegan LLM + TTS en CI: el esquema de claves en un Worker y ejecucion en GitHub Actions sirve como plantilla de bajo coste operativo.
- Audiencia en redes sociales: el formato 1080×1920 con teaser de 15 s y miniatura generada esta pensado para Reels e historias, con publicacion encadenada a varias plataformas.
- Generacion de contenido sin locucion: cuando falla el TTS, el pipeline produce una version silenciosa con musica, lo que garantiza publicacion aun con incidencias del proveedor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene pesos ni evaluaciones de modelos; las unicas metricas operativas declaradas son las reglas de duracion (45-60 s en `night`, hasta 88 s en `fixtures`, teaser de 15 s) y la cadencia de tres publicaciones diarias.

## Requisitos de hardware

- VRAM para inferencia: no disponible; el pipeline no ejecuta modelos en local, delega generacion de texto, TTS y verificacion en servicios externos.
- GPU recomendadas: no aplica segun la informacion disponible; la ejecucion declarada se realiza en runners de GitHub Actions.
- Compatibilidad con GPU de consumo: no aplica mientras se mantenga la dependencia de APIs externas.
- Opciones de despliegue: GitHub Actions como ejecutor; Cloudflare Workers para el gateway de claves; Cloudinary para alojamiento de medios; endpoint `/post` para distribucion.
- Latencia y throughput: no disponibles. La unica referencia temporal es la ventana de ejecucion (el modo `night` debe completarse antes de las 00:45) y el limite de duracion del video resultante.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en el repositorio ni datos de rendimiento que permitan una comparacion con alternativas. La comparacion natural seria con otros pipelines de automatizacion de video para redes sociales, pero la informacion proporcionada no incluye especificaciones de terceros que permitan construir una tabla rigurosa sin inventar datos.

## Limitaciones y advertencias

- No es un modelo: no puede descargarse, cuantizarse ni ejecutarse con vLLM, llama.cpp u Ollama; quien busque pesos utilizables debe descartar este repositorio.
- Dependencia total de servicios propietarios externos (Gemini para texto y TTS, Whisper para verificacion, Cloudinary para medios); la licencia MIT cubre el codigo, no las condiciones de esos servicios.
- Los datos deportivos dependen de la disponibilidad y del esquema del JSON publico de ESPN y de los 26 feeds; un cambio de formato rompe la cadena sin aviso.
- Riesgo de alucinacion en el texto generado: el autor lo mitiga con comprobaciones automaticas de nombres y hechos, pero la validacion se limita a las listas y reglas codificadas en el repositorio.
- Ventana de actualidad estricta de 24 horas; noticias mas antiguas se descartan por diseno, lo que puede dejar sin contenido al modo `morning`.
- Cobertura geografica y editorial restringida por reglas explicitas: se excluyen temas de Israel y Emiratos Arabes Unidos, la liga saudita y cualquier metraje de partido resubido.
- Contenido exclusivamente en arabe; no hay soporte multilingue declarado en la generacion ni en la locucion.
- Etiquetas de HuggingFace incompletas (sin campo de idioma estandar) y repositorio sin descargas ni validacion de la comunidad (0 descargas, 0 likes), por lo que no hay evidencia externa de funcionamiento en produccion.
- Los resultados de la busqueda web realizada no guardan relacion con el repositorio y no se han incluido; no aportan informacion verificable sobre el proyecto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ntizina-video83/kahwa-bulletin
- Gateway privado de claves (`kahwa-bulletin-gw`, Cloudflare Worker): no disponible como enlace publico en la informacion proporcionada
- Paper, blog o demo: no disponibles en la informacion proporcionada
- Repositorio de codigo independiente (GitHub): no disponible en la informacion proporcionada
