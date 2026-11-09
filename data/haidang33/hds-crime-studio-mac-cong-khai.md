# haidang33/hds-crime-studio-mac-cong-khai

## Resumen

HDS - Crime Studio es un artefacto publicado en Hugging Face bajo el identificador `haidang33/hds-crime-studio-mac-cong-khai`, con un unico tag `onnx` y una etiqueta de region `us`. El repositorio ocupa aproximadamente 0,2 GB y no declara pipeline, licencia ni idiomas soportados. La model card no describe un modelo de aprendizaje automatico en el sentido habitual, sino una aplicacion de escritorio completa para la produccion de videos de casos criminales (estilo documental noir) que orquesta agentes de codigo (Claude Code CLI o Google Argon 4) sobre un pipeline de pasos con puertas de aprobacion humana.

El sistema se distribuye como ejecutable de Windows (`HDS Crime Studio.exe`) que levanta un servidor local en `127.0.0.1:8858`, sirve una interfaz web y expone un tunel SSH hacia un VPS (`hds-eu1`) para acceso remoto desde `studio.dubsi.io`. El flujo cubre seleccion de canal y estilo, generacion de propuesta, ejecucion del pipeline del estilo con paradas de revision, storyboard aprobado, edicion sobre lienzo y exportacion acelerada por GPU. No se trata, por tanto, de pesos de red neuronal documentados, sino de un paquete de aplicacion con logica de agente, herramientas de scraping de imagenes, sintesis de voz y renderizado.

La relevancia para un lector tecnico es limitada como modelo, pero alta como ejemplo de arquitectura de agentes aplicada a un dominio concreto: define contratos de estilo (`style.json`, `pipeline.md`), validadores por paso (`kiem.mjs`), registro estructurado de operaciones en JSONL y aislamiento de secretos. No hay informacion publica sobre arquitectura de red, numero de parametros, contexto ni datos de entrenamiento, por lo que la ficha refleja unicamente lo que la model card expone.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene una aplicacion de orquestacion de agentes, no pesos de un transformer documentado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la interfaz y la documentacion estan en vietnamita; el pipeline genera guiones en japones y vietnamita segun la model card) |
| Licencia | no disponible |
| Formato de pesos | no disponible (tag `onnx`; el artefacto principal es un ejecutable de Windows y codigo Node.js) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal ni proceso de entrenamiento en la informacion proporcionada. Lo que la model card detalla es la arquitectura del sistema de software: un servidor Node.js (`app/server.mjs`) que gestiona ficheros de caso, vigilancia de cambios con deshacer, creacion de casos y ejecucion de pasos; un nucleo de agente (`ai/ai_engine.mjs`) que localiza los binarios `claude` o `agy`, los ejecuta con auto-aprobacion de permisos y aplica reglas por canal y estilo; y un ensamblador de prompts (`ai/pipeline.mjs`) que compone cada paso a partir de una seccion comun, la seccion del paso en `pipeline.md`, las reglas del canal, la informacion del caso y las peticiones de correccion.

Las innovaciones tecnicas destacables son de ingenieria de agentes: puertas de aprobacion humana entre pasos, un validador por paso (`style.json → "kiem"`) que devuelve `{ loi, canh_bao }` y se ejecuta antes de presentar el resultado, y un registro de trazas ("so tram") donde cada operacion escribe una linea JSON con duracion, fuente, modelo, errores clasificados, llamadas a herramientas y bloqueos por repeticion. El sistema tambien incorpora herramientas externas: `bst.py` para investigacion profunda y construccion de una tabla de hechos, `cao_anh.mjs` para scraping de imagenes a traves de un VPS con rotacion de proxies estadounidenses, y `giong_v12.py` para sintesis de voz con OmniVoice y seleccion de variante mediante Whisper, generando WAV y subtitulos SRT en japones y vietnamita.

## Capacidades

- Orquestacion de agentes de codigo: lanza Claude Code CLI o Google Argon 4 en modo auto-aprobacion para ejecutar los pasos del pipeline.
- Pipeline por estilo con puertas de revision: cada paso produce un artefacto (tabla de hechos, guion con codigos de dato, voz y SRT, imagenes con sujeto, hoja de diseno, storyboard) que el propietario del canal debe aprobar o corregir.
- Investigacion profunda: generacion de una tabla de hechos verificables mediante `bst.py` a partir de una propuesta de caso.
- Scraping de imagenes con evasion de bloqueos: descarga a traves de un VPS y rotacion de proxies estadounidenses cuando hay bloqueo.
- Sintesis de voz multilingue: lectura de guion frase a frase con OmniVoice, seleccion de la mejor toma mediante Whisper y salida de audio WAV con subtitulos SRT en japones y vietnamita.
- Edicion sobre lienzo: modificacion de personajes, camara, marcas de plano y rotulos sobre el fotograma, con anotaciones fijadas para la IA y chat integrado.
- Exportacion acelerada por GPU con control de concurrencia (`--gpu --luong N`).
- Validacion automatica por paso mediante funciones JavaScript que devuelven errores bloqueantes y advertencias.
- Trazabilidad completa: registro JSONL por caso y por mes, consultable por API (`GET /api/so-tram?vu=...`).
- Acceso remoto mediante tunel SSH con puerta de autenticacion en el VPS.
- No se documentan capacidades de vision, audio de entrada, tool calling generico ni modo de razonamiento del propio artefacto, porque el razonamiento lo aportan los agentes externos que orquesta.

## Casos de uso

- Produccion de documentales de casos criminales para canales de YouTube: el sistema encadena investigacion, guion, voz, imagenes y storyboard con aprobacion humana en cada puerta, lo que permite mantener control editorial sobre contenido sensible sin perder automatizacion.
- Creacion de canales tematicos nuevos: basta con definir `kenh/<codigo>/kenh.json` con reglas, formato, idioma y voz de referencia, y anadir el codigo al estilo correspondiente, de modo que un equipo puede replicar la plantilla en verticales distintos.
- Localizacion de contenido a japones y vietnamita: el paso de voz genera WAV y SRT en ambos idiomas, util para canales que publican la misma pieza en dos mercados con voces de referencia distintas (`giong/v12/ref.wav`).
- Edicion asistida por IA en postproduccion: el editor permite fijar anotaciones sobre el fotograma y consultar al agente en chat, lo que sirve para iterar encuadres, marcas de plano y rotulos sin salir de la aplicacion.
- Auditoria y control de calidad de un pipeline generativo: el registro de trazas en JSONL con duracion, modelo, fuente y errores clasificados permite reconstruir que ocurrio en cada paso y detectar bloqueos por repeticion o fallos HTTP.
- Despliegue en estaciones de trabajo con GPU: la exportacion con `--gpu --luong N` y el uso de ffmpeg y Playwright permiten renderizar capitulos completos en una maquina local, evitando costes de nube.
- Extension a nuevos estilos visuales: un equipo puede escribir `styles/<codigo>/` con `style.json`, `pipeline.md`, `engine/render.mjs` y `kiem.mjs`, y marcar `san_sang: true` cuando el flujo completo funcione, lo que convierte el sistema en una plataforma de estilos mas que en una herramienta cerrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no documenta pesos ni modelo propio; el consumo dependera de los agentes externos y de las herramientas de sintesis de voz y renderizado.
- GPU recomendadas: no disponible. La model card solo menciona exportacion con `--gpu` y un parametro de concurrencia `--luong N`, sin especificar modelos de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Sistema operativo: el ejecutable principal es de Windows (`HDS Crime Studio.exe`, compilado con `csc`), con un flujo alternativo mediante `chay_studio.bat` o `node app/server.mjs` que requiere Node.js.
- Dependencias de software: Node.js, ffmpeg y Playwright para la exportacion de video; si no se descarga Chromium de Playwright, la aplicacion usa el Chrome instalado.
- Opciones de despliegue: servidor local en `127.0.0.1:8858`; acceso remoto mediante tunel SSH a un VPS con el servicio `hdsstudio` y puerta de autenticacion en `app/web_cong/cong.mjs`.
- Almacenamiento: el repositorio ocupa 0,2 GB, aunque los casos, imagenes y renders generados anadiran espacio adicional no cuantificado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria, dado que el artefacto es una aplicacion de orquestacion de agentes para produccion audiovisual y no un modelo de lenguaje con especificaciones publicadas.

## Limitaciones y advertencias

- Ausencia total de especificaciones de modelo: no hay parametros, contexto, licencia ni idiomas declarados, lo que impide evaluar el artefacto como modelo de IA y dificulta su uso en entornos con requisitos de cumplimiento.
- Licencia no disponible: no se puede determinar si el uso comercial esta permitido; cualquier despliegue en produccion exige contactar con el autor.
- Dependencia de servicios externos: el pipeline requiere una clave de Deep Research (`.secrets/hdsr_api_key.txt` o `HDSR_API_KEY`) y una sesion iniciada en Claude Code CLI o Google Argon 4, de modo que el coste y la disponibilidad dependen de terceros.
- Dependencia de infraestructura propia: el acceso remoto presupone un VPS (`hds-eu1`) con el servicio `hdsstudio` y una clave SSH configurada en `cau_hinh.json`; sin ella, solo funciona en local.
- Gestion de secretos manual: la model card indica explicitamente que los ficheros de `.secrets/` deben colocarse a mano y no copiarse de otros proyectos con herramientas, lo que aumenta el riesgo de error operativo.
- Contenido sensible: la tematica de casos criminales implica riesgos editoriales, de derechos de imagen y de difamacion; las puertas de aprobacion humana mitigan pero no eliminan estos riesgos.
- Idiomas de la documentacion: la model card esta en vietnamita, lo que limita la adopcion por equipos hispanohablantes sin traduccion previa.
- Scraping de imagenes: el uso de proxies estadounidenses rotativos para evitar bloqueos puede vulnerar terminos de servicio de los sitios de origen y plantea dudas legales sobre la procedencia de las imagenes.
- Sin datos de rendimiento: no hay benchmarks, latencias ni throughput publicados, por lo que no es posible estimar capacidad de produccion.
- Fecha de creacion futura: el repositorio figura creado el 2026-11-09, lo que sugiere un artefacto de prueba o una fecha mal registrada; conviene verificar la integridad antes de usarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/haidang33/hds-crime-studio-mac-cong-khai
- Acceso remoto de la aplicacion: https://studio.dubsi.io
- Diseno aprobado (artefacto de Claude): https://claude.ai/artifact/BQ62BSg3UcaVk384q2GQVN
