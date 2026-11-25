# krezifrog/kingdom-come-deliverance-2-trosky-kuttenbe

## Resumen

El repositorio `krezifrog/kingdom-come-deliverance-2-trosky-kuttenbe` no contiene un modelo de inteligencia artificial. Se trata de un paquete publicado en Hugging Face que, segun su propia model card, distribuye un ejecutable para Windows x64 (`solara-executor-v3-keyless-v1.2.2-win64.exe`, build `v4.7.4`) dentro de un archivo ZIP de 4,8 MB protegido con contrasena. Los tags del repositorio (windows, windows-11, x64, portable) y el contenido del README confirman que el artefacto esta orientado a la ejecucion de software en sistemas de escritorio, no a la inferencia de redes neuronales.

El texto de la model card describe funcionalidades propias de una herramienta de automatizacion o modificacion de videojuegos (perfiles JSON intercambiables, radar 2D, filtro de botin, suavizado de entrada Bezier, escaner de offsets dinamicos, tecla de panico), asi como enlaces de descarga alojados en repositorios de GitHub de terceros. No se declara arquitectura de modelo, numero de parametros, longitud de contexto ni datos de entrenamiento en ningun punto de la informacion disponible.

Por tanto, esta ficha no puede documentar un modelo de lenguaje: los campos tecnicos propios de un modelo (arquitectura, parametros, contexto, cuantizacion, benchmarks) no estan disponibles. Se advierte de que la descarga y ejecucion de binarios de procedencia no verificada, distribuidos con contrasena y alojados fuera de Hugging Face, constituye un riesgo de seguridad significativo. La ficha se limita a reflejar de forma literal lo que el autor declara, sin validar su contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un paquete de software para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un ejecutable `.exe`; no hay safetensors ni GGUF) |

Datos adicionales declarados por el autor en la model card:

| Parametro | Valor |
|---|---|
| Plataforma objetivo | Windows x64 (Windows 11 mencionado en los tags) |
| Ejecutable | `solara-executor-v3-keyless-v1.2.2-win64.exe` (build `v4.7.4`, `3B63E89310`) |
| Archivo de release | `solara-executor-v3-keyless-v1.2.2-win64.zip` (4,8 MB) |
| Contrasena del ZIP | `2026` (declarada en el README) |
| Fecha de creacion del repositorio | 2026-11-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni documenta proceso de entrenamiento alguno (ni tokens, ni composicion del dataset, ni RLHF/DPO). La model card describe, en su lugar, un ejecutable de Windows con modulos que el autor presenta como "hot-swap JSON profiles", "stream-proof render layer", "panic key unload", "2D radar & loot filter", "bezier input smoothing" y "dynamic offset scanner", con cifras de sondeo (295 Hz, 454 Hz, 302 Hz) y porcentajes de consistencia (99,7 %, 98,3 %, 97,6 %) que no vienen acompanados de metodologia de medicion.

El unico contenido estructurado es un fragmento YAML de configuracion que define el repositorio de origen, la build y el nombre del asset. No hay informacion sobre pesos, tokenizador, arquitectura de red ni innovaciones tecnicas de inferencia (decodificacion especulativa, attention linear, etc.).

## Capacidades

- No se declara ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas, vision o audio.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- Los metadatos listan 14 idiomas, pero no se especifica ninguna funcionalidad linguistica asociada.
- Las unicas funcionalidades descritas son propias de una herramienta de escritorio para Windows: perfiles JSON intercambiables, radar 2D con filtro de botin, suavizado de entrada, escaner de offsets y cierre de proceso mediante tecla de panico.

## Casos de uso

No es posible enumerar casos de uso legitimos de un modelo de IA porque el artefacto no es un modelo. Los escenarios que se describen a continuacion reflejan unicamente lo que el autor declara, con las advertencias de seguridad correspondientes:

- Ejecucion de un binario portable en Windows x64: el autor indica que el ejecutable debe lanzarse como administrador tras descomprimir el ZIP con la contrasena `2026`; no se documenta que hace el binario mas alla de lo declarado.
- Perfiles de configuracion intercambiables: la model card menciona conmutacion entre presets "Legit, Visual & Custom"; no se detalla el formato ni el efecto real de esos perfiles.
- Captura de pantalla y transmision: se declara una capa de render "stream-proof" orientada a excluir OBS, ShadowPlay y Discord; no hay verificacion independiente.
- Monitorizacion en juego: se describe un radar 2D con filtrado de objetos por rareza y seguimiento de contenedores; no se especifica el juego ni la version compatible.
- Automatizacion de entrada: se menciona suavizado Bezier con radio de FOV configurable y curvas "humanizadas"; no se aporta documentacion tecnica.
- Escaneo de offsets tras parches: se declara resolucion automatica de firmas de punteros; no se indica que procesos ni que binarios analiza.

Ninguno de estos casos puede recomendarse para produccion ni para uso profesional sin una auditoria de seguridad independiente del binario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (295 Hz, 454 Hz, 302 Hz de sondeo; 99,7 %, 98,3 %, 97,6 % de consistencia) corresponden a metricas internas declaradas por el autor sobre el software de escritorio, no a evaluaciones de un modelo de lenguaje, y carecen de metodologia reproducible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que inferir).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponible.
- Requisito declarado: sistema Windows x64 (Windows 11 segun los tags), ejecucion del `.exe` como administrador y descompresion previa del ZIP de 4,8 MB.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos de IA comparable porque el repositorio no contiene un modelo. Tampoco se identifican en la informacion proporcionada artefactos de software equivalentes con los que establecer una comparacion tecnica fiable.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, tokenizador, arquitectura ni datos de entrenamiento. Cualquier uso esperado como modelo de lenguaje no es posible.
- El artefacto distribuido es un ejecutable de Windows alojado en repositorios de GitHub de terceros (`GraceFernandez01321/solara-executor-v3-keyless` y `marek8606/kingdom-come-deliverance-2-trosky-kuttenbe`), no en Hugging Face. La integridad y el contenido del binario no estan verificados.
- La distribucion mediante ZIP con contrasena y la peticion de ejecutar como administrador son practicas habituales en campanas de malware; se recomienda no ejecutar el binario en equipos personales o de produccion.
- La licencia MIT declarada en los metadatos no garantiza la legalidad ni la seguridad del software distribuido; la licencia cubre el contenido del repositorio, no avala el binario enlazado.
- Las funcionalidades descritas (radar, filtro de botin, suavizado de entrada, escaneo de offsets) sugieren tecnicas de manipulacion de procesos de videojuegos; su uso puede infringir los terminos de servicio de los juegos afectados y la legislacion aplicable en materia de proteccion de software.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni de validacion por parte de la comunidad.
- Los 14 idiomas listados en los metadatos no implican ninguna capacidad multilingue real, ya que no existe un modelo linguistico asociado.
- Riesgo de alucinacion, sesgos y limitaciones de contexto: no aplica, al no existir modelo generativo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/krezifrog/kingdom-come-deliverance-2-trosky-kuttenbe
- Release enlazado por el autor (GitHub, terceros): https://github.com/GraceFernandez01321/solara-executor-v3-keyless/releases/download/v1.2.0/solara-executor-v3-keyless-v1.2.2-win64.zip
- Repositorio de releases enlazado por el autor (GitHub, terceros): https://github.com/marek8606/kingdom-come-deliverance-2-trosky-kuttenbe/releases/latest
- Paper, blog o demo oficial: no disponible
