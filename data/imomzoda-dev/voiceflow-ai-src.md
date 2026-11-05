# imomzoda-dev/voiceflow-ai-src

## Resumen

VoiceFlow AI es una aplicacion de escritorio para Windows y macOS que combina dictado por voz, un editor de documentos de texto enriquecido y un asistente de IA opcional. El repositorio publicado en HuggingFace bajo el identificador `imomzoda-dev/voiceflow-ai-src` contiene el codigo fuente del proyecto, no pesos de un modelo de lenguaje. El autor es `imomzoda-dev` y el proyecto se distribuye tambien a traves de GitHub Releases.

La aplicacion no implementa un modelo propio: se apoya en `whisper.cpp` para el reconocimiento de voz local (con modelos Whisper de OpenAI en formato GGML) y en APIs externas compatibles con OpenAI (OpenAI, Groq, Anthropic, OpenRouter, Ollama, LM Studio, faster-whisper server) para la correccion de texto y el asistente documental. Su propuesta de valor es la integracion de esos componentes en un flujo de dictado global por hotkey, con insercion del texto en cualquier aplicacion y un editor propio con historial de versiones y exportacion a DOCX, PDF y Markdown.

Es relevante para desarrolladores interesados en arquitecturas de aplicaciones Electron con reconocimiento de voz local, gestion segura de claves (DPAPI en Windows, Keychain en macOS) y patrones de integracion de proveedores LLM intercambiables. No debe confundirse con un modelo entrenado ni con un checkpoint publicable: la ficha tecnica de modelo no aplica en sentido estricto, por lo que los campos se completan con la informacion disponible del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicacion de escritorio Electron (Node.js 22.13+, TypeScript); no es un modelo neuronal propio |
| Parametros totales | no disponible (no aplica: el proyecto no publica pesos) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (depende del modelo LLM o Whisper configurado por el usuario) |
| Tipos de cuantizacion | Modelos Whisper GGML cuantizados en el catalogo interno (Large v3 Turbo ~550 MB, Medium ~515 MB, Small/Base/Tiny 75-470 MB, Large v3 ~3.1 GB) |
| Idiomas soportados | Tajik, ruso, ingles y cualquier idioma soportado por Whisper; la interfaz y documentacion estan en ingles |
| Licencia | no disponible |
| Formato de pesos | GGML (modelos Whisper descargados desde `huggingface.co/ggerganov/whisper.cpp`); el repositorio contiene codigo fuente, no pesos |

## Arquitectura y entrenamiento

El proyecto es una aplicacion Electron con procesos principal y renderer en TypeScript, base de datos SQLite embebida mediante `node:sqlite` y una capa nativa precompilada para el hook de teclado global. La captura de audio se envia al binario `whisper-cli` de `whisper.cpp` para reconocimiento local, o a un endpoint compatible con OpenAI (`whisper-1`, `gpt-4o-transcribe`, `whisper-large-v3-turbo`, faster-whisper server). El texto reconocido puede pasar por un proveedor LLM configurable en tres modos: Raw (solo limpieza local), Correct (gramatica, ortografia y puntuacion) y Professional (reescritura estructurada).

No hay entrenamiento propio ni datos de entrenamiento publicados. Las decisiones tecnicas destacables son la verificacion de integridad SHA-256 de los binarios y modelos descargados, el cifrado de claves API con `safeStorage` (DPAPI en Windows, Keychain en macOS) almacenadas en `secrets.bin` fuera de SQLite, la restriccion de endpoints a HTTPS salvo `localhost`, y la deteccion de idioma especifica para Tajik con reejecucion forzada y comprobacion de letras exclusivas del tayiko (ғ қ ӯ ҳ ҷ ӣ). Los prompts de correccion prohiben traduccion e invencion de hechos, con un limite de longitud que descarta reescrituras desbordadas y fallback al transcript original si la IA falla.

## Capacidades

- Dictado por voz global: mantener un hotkey en cualquier aplicacion, hablar y soltar para insertar el texto en el cursor.
- Reconocimiento de voz local con `whisper.cpp` y modelos Whisper cuantizados; soporte de builds con aceleracion CUDA, Metal y Vulkan.
- Reconocimiento en la nube mediante OpenAI, Groq o servidores faster-whisper compatibles con OpenAI.
- Correccion y reescritura de texto con proveedores LLM externos en modos Correct y Professional.
- Editor de documentos de texto enriquecido con dictado integrado, asistente de IA e historial de versiones.
- Exportacion a DOCX, PDF y Markdown.
- Deteccion y correccion de idioma para tayiko, ruso e ingles.
- Configuracion de proveedores separados por rol: motor de reconocimiento, proveedor de correccion y proveedor del asistente documental.
- Asistente conversacional sobre documentos mediante APIs compatibles con OpenAI (incluye Ollama y LM Studio locales).
- Asistente de configuracion inicial de 10 pasos (idioma, microfono, hotkey, motor, modelo, proveedor, permisos, dictado de prueba).
- No soporta tool calling ni function calling nativo propio; depende de las capacidades del LLM externo configurado.

## Casos de uso

- Dictado profesional en cualquier aplicacion: el hook global permite insertar texto reconocido en editores, correos o chats sin cambiar de ventana, adecuado para flujos de trabajo con hotkey y contexto de escritura rapida.
- Documentacion en tayiko y ruso: la deteccion de idioma con reejecucion forzada y la comprobacion de letras tayikas mejoran la precision en idiomas poco representados en Whisper, util para equipos en Asia Central.
- Redaccion asistida con correccion gramatical: el modo Correct mantiene el vocabulario del usuario y corrige ortografia y puntuacion, apropiado para actas, notas e informes.
- Reescritura a registro profesional: el modo Professional estructura y pule el texto sin alterar el significado, util para comunicaciones formales y documentacion tecnica.
- Procesamiento totalmente local y privado: con `whisper.cpp` y Ollama o LM Studio, el audio y el texto no salen del equipo, lo que encaja en entornos con requisitos de confidencialidad.
- Creacion de documentos con exportacion: el editor integrado con historial de versiones y exportacion a DOCX, PDF y Markdown sirve para redactar y entregar documentos sin herramientas externas.
- Desarrollo y auditoria de arquitecturas Electron: el repositorio incluye plan de implementacion, arquitectura, estado de funcionalidades y pruebas end-to-end con Playwright, util como referencia tecnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de WER, latencia ni throughput; solo menciona tamanos de modelo y una recomendacion cualitativa (Large v3 Turbo como mejor relacion precision/tamano para tayiko y ruso).

## Requisitos de hardware

- VRAM: no aplica para la aplicacion en si; depende del modelo Whisper y del LLM externo configurado. Los modelos Whisper GGML pueden ejecutarse en CPU.
- GPU recomendadas: no especificadas. La documentacion indica que builds de `whisper.cpp` con CUDA, Metal o Vulkan funcionan igual que la version CPU.
- Consumer GPU: los modelos Whisper cuantizados (75-550 MB) caben en cualquier equipo; Large v3 (~3.1 GB) es viable en GPU consumer con suficiente VRAM o en CPU con mayor latencia.
- Requisitos de sistema: Node.js 22.13+ (24 recomendado) y npm para ejecutar desde fuente; no requiere toolchain de Python, Rust ni C++.
- Opciones de despliegue: aplicacion Electron empaquetada (`npm run dist:win`, `npm run dist:mac`), ejecucion desde fuente (`npm run dev`) y binario `whisper-cli` del sistema o descargado por la app.
- Latencia y throughput: no disponibles. La model card solo advierte que Large v3 es lento en CPU.

## Comparativa con modelos similares

| Proyecto | Tipo | Reconocimiento local | LLM integrado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VoiceFlow AI | App Electron de dictado y edicion | Si (`whisper.cpp`) | Externo (OpenAI, Groq, Anthropic, Ollama, LM Studio) | no disponible | HuggingFace y GitHub Releases |
| Whisper (OpenAI) | Modelo ASR | Si (via `whisper.cpp`) | No | MIT (modelos) | HuggingFace, repositorios oficiales |
| WhisperX / faster-whisper | Pipeline ASR | Si | No | MIT / otras | PyPI, GitHub |
| Aplicaciones de dictado comerciales | Producto cerrado | Variable | Variable | Propietaria | Comercial |

La comparacion directa con modelos no es posible porque VoiceFlow AI no publica pesos ni metricas. Frente a Whisper o faster-whisper, la diferencia es de producto (interfaz, hotkey, editor, gestion de proveedores) y no de modelo.

## Limitaciones y advertencias

- No es un modelo entrenado: no hay pesos, benchmarks ni evaluacion de calidad asociada al repositorio; las capacidades dependen enteramente de Whisper y del LLM externo configurado.
- Licencia no declarada: no se especifica licencia en HuggingFace, lo que impide confirmar condiciones de uso comercial o redistribucion.
- Dependencia de servicios externos: los modos Correct y Professional requieren un proveedor LLM con clave API o un servidor local compatible; sin conexion, solo funciona el modo Raw.
- Riesgo de alucinacion en la reescritura: aunque los prompts prohiben anadir hechos, un LLM externo puede alterar el significado; existe un limite de longitud y fallback al transcript original, pero no una verificacion semantica.
- Precision variable en tayiko: la model card reconoce que Whisper confunde tayiko con ruso o persa y ofrece mitigaciones heuristicas, no una garantia.
- Estado de funcionalidades: la documentacion remite a `docs/FEATURE_STATUS.md` para distinguir lo que funciona de lo que aun requiere comprobacion en el sistema objetivo; no se detalla en la informacion disponible.
- Seguridad: las claves se cifran con `safeStorage` y se almacenan en `secrets.bin`, pero la seguridad final depende del sistema operativo y de la configuracion del usuario.
- Idiomas de la interfaz y documentacion: en ingles; no se indica localizacion de la UI.

## Enlaces

- HuggingFace: https://huggingface.co/imomzoda-dev/voiceflow-ai-src
- GitHub Releases: https://github.com/imomzoda-dev/VoiceFlowAI/releases
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Modelos Whisper GGML: https://huggingface.co/ggerganov/whisper.cpp
- Servidor compatible faster-whisper (speaches): https://github.com/speaches-ai/speaches
- Documentacion interna citada: `docs/FEATURE_STATUS.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/ARCHITECTURE.md`, `native/README.md`, `docs/RELEASING.md` (dentro del repositorio)
