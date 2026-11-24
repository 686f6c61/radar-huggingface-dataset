# Linerist/spt-aki-3-10-trainer-profile-editor

## Resumen

El artefacto publicado bajo el identificador `Linerist/spt-aki-3-10-trainer-profile-editor` en Hugging Face no es un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows x64 distribuido como archivo ZIP de 4,8 MB que, según su propia model card, contiene un binario denominado `solara-executor-v3-keyless-2026-v1.2.2-win64.exe`. La documentación lo describe explícitamente como un «game cheat» (trampa para videojuegos) orientado a SPT-AKI, una modificación del shooter de extracción *Escape from Tarkov*.

El contenido técnico descrito en la model card incluye funciones como superposición externa (overlay) con cajas delimitadoras 2D/3D y esqueletos de huesos, radar 2D con filtrado de botín, suavizado de entrada Bézier, escaneo dinámico de offsets de memoria y una capa de renderizado diseñada para excluirse de capturas de pantalla en OBS, ShadowPlay y Discord. Ninguna de estas capacidades corresponde a un modelo de lenguaje, visión o multimodal entrenado con pesos neuronales.

Por tanto, esta ficha no puede documentar arquitectura, parámetros, contexto, cuantizaciones ni benchmarks, porque el objeto publicado no es un modelo. Se advierte de que el paquete se distribuye con contraseña de archivo, enlaces a repositorios de terceros y un binario que el propio autor reconoce que puede activar alertas de Windows Defender o SmartScreen. No se recomienda su descarga ni ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Win64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un binario compilado para Windows x64 (build `v1.2.2`, identificador `6DE0F8`) empaquetado en un ZIP de 4,8 MB protegido con la contraseña `2026`. La model card menciona componentes de ingeniería de software como «Desktop Duplication rendering», «user-mode external core», «dynamic offset scanner» y «stream-proof render layer», todos ellos propios de herramientas de manipulación de memoria de procesos de juegos, no de modelos entrenados.

No se documenta ningún corpus de datos, tokenizador, función de pérdida, RLHF, DPO ni innovación en decodificación. Cualquier lectura de esta entrada como si fuese un modelo de lenguaje es un error de clasificación del repositorio.

## Capacidades

- Manipulación de memoria de proceso de un videojuego (SPT-AKI) mediante escaneo dinámico de offsets.
- Superposición externa con cajas delimitadoras 2D/3D, esqueletos de huesos y ESP de distancia.
- Radar 2D con filtrado de botín por rareza y seguimiento de contenedores.
- Suavizado de entrada Bézier con radio de FOV configurable y curvas de apuntado humanizadas.
- Capa de renderizado diseñada para excluirse de capturas en OBS, ShadowPlay y Discord.
- Ejecución en modo usuario sin hooks de DLL internos, según la descripción del autor.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión por computador genérica, tool calling, agentes ni capacidades multilingües en el sentido de un modelo de IA.

## Casos de uso

- No procede. El artefacto no es un modelo de IA y no tiene aplicaciones legítimas de procesamiento de lenguaje, visión o generación de contenido.
- Su único propósito declarado es alterar el comportamiento de un videojuego mediante manipulación de memoria, lo que puede infringir los términos de servicio del juego y la legislación aplicable en materia de trampas y software malicioso.
- No se identifican escenarios de uso profesional, educativo o de investigación que justifiquen su despliegue.
- No se recomienda su integración en pipelines de producción, CI/CD ni entornos corporativos.
- No se recomienda su ejecución en equipos personales ni corporativos por el riesgo de seguridad asociado a binarios ofuscados y protegidos con contraseña.
- Cualquier uso en entornos gestionados debe evaluarse desde el punto de vista legal y de cumplimiento, no técnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Sistema operativo: Windows 11 / Windows x64 (según los tags del repositorio).
- Almacenamiento: 4,8 MB para el ZIP; espacio adicional tras la extracción no especificado.
- Memoria RAM: la model card menciona «< 50 MB» de uso de RAM para la capa de superposición, dato no verificable.
- GPU: no se especifica ningún requisito de GPU; el renderizado descrito se apoya en Desktop Duplication.
- No aplica VRAM para inferencia porque no hay modelo neuronal.
- Opciones de despliegue: ejecución directa del binario `.exe` en Windows x64; no es compatible con vLLM, llama.cpp, Ollama, TGI ni ningún servidor de inferencia.
- Latencia y throughput: no disponibles; las cifras de «212 Hz», «352 Hz» y «144 Hz+» que aparecen en la model card son afirmaciones del autor sin verificación independiente.

## Comparativa con modelos similares

No disponible. No existe una categoría de «modelos similares» porque el artefacto no es un modelo de IA. Compararlo con modelos de lenguaje, visión o multimodal sería categóricamente incorrecto.

## Limitaciones y advertencias

- No es un modelo de IA: clasificarlo como tal en un catálogo o pipeline es un error.
- El binario se distribuye dentro de un ZIP protegido con contraseña (`2026`), práctica habitual para evadir análisis automáticos de antivirus.
- El propio autor reconoce que Windows Defender y SmartScreen pueden emitir alertas por tratarse de un «game cheat».
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros (`schneider6972/solara-executor-v3-keyless-2026`, `RafaelBruno22027/spt-aki-3-10-trainer-profile-editor`), no al repositorio de Hugging Face, lo que dificulta la verificación de integridad.
- La licencia MIT declarada en los metadatos no garantiza que el contenido sea legal en la jurisdicción del usuario; el uso de trampas en videojuegos puede vulnerar términos de servicio y normativa sobre software malicioso.
- Riesgo elevado de malware, robo de credenciales o persistencia no deseada, dado el patrón de distribución (ZIP con contraseña, ejecución como administrador, repositorios de GitHub no oficiales).
- No se debe ejecutar en entornos corporativos, académicos ni de producción.
- Cualquier dato de rendimiento o capacidad presente en la model card es una afirmación del autor y no ha sido verificado de forma independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Linerist/spt-aki-3-10-trainer-profile-editor
- Repositorio de GitHub citado en la model card: https://github.com/RafaelBruno22027/spt-aki-3-10-trainer-profile-editor
- Repositorio de GitHub del binario: https://github.com/schneider6972/solara-executor-v3-keyless-2026
- Enlace de descarga directa citado: https://github.com/schneider6972/solara-executor-v3-keyless-2026/releases/download/v1.2.0/solara-executor-v3-keyless-2026-v1.2.2-win64.zip
- No se han encontrado papers, blogs técnicos ni demos oficiales asociados.
