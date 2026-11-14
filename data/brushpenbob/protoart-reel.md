# brushpenbob/protoart-reel

## Resumen

ProtoArt Reel 1.7.0 es una aplicación de escritorio para macOS dedicada a la grabación de pantalla y la edición de vídeo, desarrollada por el autor de Hugging Face `brushpenbob` (repositorio de código en GitHub bajo la organización `theprotoart`). No se trata de un modelo de inteligencia artificial en el sentido estricto: el repositorio aloja el binario distribuible de la aplicación (un archivo DMG de aproximadamente 1,1 GB), no pesos de red neuronal. La model card lo describe explícitamente como una herramienta "en el espíritu de ScreenFlow" que se ejecuta íntegramente en local, sin cuentas ni telemetría.

La relevancia de esta ficha es acotada: el artefacto no expone pipeline de inferencia, idiomas soportados ni parámetros de modelo, y sus etiquetas (`macos`, `screen-recording`, `video-editing`) confirman que se trata de software de edición. Aun así, la aplicación incorpora componentes de IA locales (aislamiento de audio mediante SAM-Audio y síntesis de voz con KittenTTS), lo que justifica su presencia en un catálogo de modelos open source y su interés para desarrolladores que buscan alternativas de posprocesado audiovisual sin dependencia de la nube.

La versión 1.7.0 añade paquetes de estilo predefinidos (documental de naturaleza, anuncio, tráiler, VHS retro, etc.), tipos de corte cinematográfico (L-cut, J-cut, smash cut, jump cut, corte en acción, cutaway, cross-cut) y transiciones nuevas como obturador radial, glitch blocks, warp zoom o quemado de película. El binario está firmado solo de forma ad hoc (no notarizado), lo que obliga al usuario a habilitar la apertura manual desde Ajustes del Sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (aplicación de escritorio nativa para macOS; no es un modelo neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la interfaz y las voces KittenTTS son en inglés por defecto) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el artefacto distribuido es un DMG de macOS, ~1,1 GB) |

## Arquitectura y entrenamiento

No se dispone de información sobre arquitectura de red neuronal, datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF o DPO. El repositorio no contiene pesos de modelo ni documentación técnica de un transformer, MoE o SSM. El contenido publicado es una aplicación de escritorio empaquetada para Apple silicon (M1 o superior) con requisito mínimo de macOS 14.2.

Los únicos componentes de IA mencionados en la model card son módulos integrados que se ejecutan en local: SAM-Audio para aislar o eliminar un sonido describiéndolo en lenguaje natural, y KittenTTS para síntesis de voz y clonación de voz (inglés por defecto). También se cita REMIX para extensión musical continua. No se detalla qué modelos subyacen a estas funciones, sus tamaños, licencias específicas ni cómo se integran en el binario.

## Capacidades

- Grabación de pantalla en macOS con captura local, sin subida a servidores ni cuentas de usuario.
- Edición de vídeo multipista: al soltar un vídeo sobre otro se crea una capa superior y una pista nueva si es necesario.
- Picture-in-picture con redimensionado desde la esquina opuesta (Shift desde el centro) y opción de volver a marco completo.
- Paquetes de estilo de un solo clic: Nature Documentary, Fizz Commercial, Movie Trailer, Retro VHS, Sports Highlight, Travel Vlog y Breaking News, con transiciones, color, títulos, gráficos, sonidos y cortes a ritmo.
- Cortes cinematográficos: L-cut, J-cut, smash cut, jump cut, cut on action, cutaway, cross-cut y generación automática de L y J cuts.
- Transiciones avanzadas: obturador radial, fast wipe, glitch blocks, warp zoom, slide + shake, vintage film burn, movement match cut, graphic match cut y vertigo ramp, con opción de aleatorizar transiciones en cada corte.
- Aislamiento o eliminación de audio mediante descripción textual (SAM-Audio, en local).
- Síntesis de voz y clonación de voz con KittenTTS (inglés por defecto).
- Extensión musical sin cortes (REMIX) y curvas de fundido arrastrables al estilo de Adobe Audition.
- Elementos visuales de cinta magnética que giran a medida que avanza el vídeo.

## Casos de uso

- Creación de tutoriales y demos de producto: la grabación de pantalla local permite capturar flujos de trabajo en macOS sin enviar contenido sensible a la nube, y los paquetes de estilo aceleran la producción de vídeos explicativos con títulos y transiciones coherentes.
- Edición de vídeos para redes sociales con estilos predefinidos: un creador puede aplicar el paquete "Fizz Commercial" o "Sports Highlight" y obtener cortes a ritmo, gráficos y sonidos en un solo clic, reduciendo el tiempo de montaje frente a un editor manual.
- Producción de tráilers y vídeos promocionales: el paquete "Movie Trailer" junto con transiciones como vertigo ramp o vintage film burn y los cortes L/J permite construir secuencias con ritmo cinematográfico sin salir del entorno local.
- Posproducción de audio en entrevistas y podcast en vídeo: la función de aislar o eliminar un sonido describiéndolo (SAM-Audio) sirve para quitar ruidos de fondo concretos, y las curvas de fundido arrastrables facilitan mezclas limpias.
- Localización y doblaje de contenido en inglés: KittenTTS con clonación de voz permite generar voces para narraciones o sustituir locuciones manteniendo el timbre del hablante original, útil en prototipos de vídeo multilingües.
- Edición de vídeos musicales o contenido con banda sonora continua: la extensión musical REMIX y los cortes a ritmo (beat cuts) de los paquetes de estilo simplifican la sincronización de imagen y música en vídeos de viajes, vlogs o highlights deportivos.
- Formación interna y documentación de procesos: equipos que necesitan grabar procedimientos en Mac pueden usar la herramienta sin depender de servicios externos, cumpliendo políticas de confidencialidad estrictas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Sistema operativo: macOS 14.2 o superior.
- CPU: Apple silicon exclusivamente (M1 o más reciente); no se soportan Macs Intel.
- VRAM estimada: no disponible (no es un modelo de inferencia con pesos publicados; el consumo dependerá de los módulos de IA integrados y de la resolución del proyecto).
- GPU recomendadas: no disponible; el requisito es un SoC Apple silicon, con GPU integrada.
- Cabe en GPU de consumo: sí, en cualquier Mac con M1 o posterior; no aplica a GPUs NVIDIA o AMD de escritorio.
- Opciones de despliegue: instalación del DMG `ProtoArt-Reel-1.7.0.dmg` desde la pestaña Files del repositorio. No se contemplan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Verificación de integridad: `shasum -a 256 ProtoArt-Reel-1.7.0.dmg` debe devolver `73b13b1538badb98727902098b0aad30deb9d571b091bd38e00e4d67885baaf4`.

## Comparativa con modelos similares

| Herramienta | Tipo | Plataforma | Licencia | Distribución | IA local |
|---|---|---|---|---|---|
| ProtoArt Reel 1.7.0 | Grabación y edición de vídeo | macOS (Apple silicon) | Apache 2.0 | DMG en Hugging Face y código en GitHub | SAM-Audio, KittenTTS, REMIX |
| ScreenFlow | Grabación y edición de vídeo | macOS | Comercial | Descarga desde web del fabricante | No documentado en la información disponible |
| OBS Studio | Grabación y streaming | Multiplataforma | GPL | Descarga desde web oficial | No |
| DaVinci Resolve | Edición y posproducción | Multiplataforma | Comercial (versión gratuita) | Descarga desde web oficial | Funciones de IA en estudio |

La comparación se limita a categoría de producto, plataforma y licencia, ya que no hay datos de rendimiento ni de benchmarks publicados para ProtoArt Reel.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo de propósito general: no admite prompts de texto, tool calling, agentes ni razonamiento multi-step.
- El binario no está notarizado; en el primer arranque hay que abrirlo desde Ajustes del Sistema > Privacidad y Seguridad > Abrir de todos modos, lo que puede generar fricción en entornos corporativos gestionados.
- Solo funciona en Macs con Apple silicon (M1 o superior) y macOS 14.2 o posterior; no hay versión para Intel, Windows ni Linux.
- La interfaz y las voces KittenTTS están en inglés por defecto; el soporte multilingüe no está documentado.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero las funciones de IA local (aislamiento de audio, clonación de voz) pueden producir artefactos o resultados imperfectos según la fuente.
- La licencia Apache 2.0 cubre el repositorio, pero no se detalla la licencia de los componentes de IA integrados (SAM-Audio, KittenTTS, REMIX), lo que conviene verificar antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una versión de prueba ("test build") sin adopción documentada.
- No se ofrece información sobre sesgos, telemetría (la model card afirma que no hay analíticas) ni políticas de soporte.
- El tamaño del repositorio (1,1 GB) corresponde al instalador, no a pesos de modelo; no es reutilizable como checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/brushpenbob/protoart-reel
- Código fuente: https://github.com/theprotoart/protoart-reel
- Descarga del binario: pestaña Files del repositorio de Hugging Face (`ProtoArt-Reel-1.7.0.dmg`)
