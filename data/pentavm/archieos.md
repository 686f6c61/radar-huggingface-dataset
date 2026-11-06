# PentaVM/ArchieOS

## Resumen

ArchieOS no es un modelo de lenguaje, sino un conjunto de imagenes de sistema operativo publicadas en Hugging Face bajo el identificador `PentaVM/ArchieOS`. El repositorio contiene artefactos de distribucion (imagenes `.wsl` para WSL 2 en Windows y `.ova` para VirtualBox) de un sistema operativo personal basado en Arch Linux que integra un asistente de IA local. El autor es PentaVM y el proyecto se distribuye con licencia Apache-2.0 para el sistema base, aunque incorpora componentes con licencias distintas.

El paquete incluye el escritorio, el componente denominado Core, el modulo Stage, IRIS Beta 2.1, el modelo de reconocimiento de voz NVIDIA Nemotron 3.5 ASR streaming 0.6B y las voces Piper `es_MX-ald-medium` y `en_US-john-medium`. Los pesos del modelo de lenguaje no vienen incluidos en la imagen: el instalador descarga la variante que elige el usuario (`archie-local`). El repositorio ocupa 6,1 GB y no registra descargas ni interacciones en el momento de la consulta.

La relevancia de esta publicacion es limitada desde el punto de vista de evaluacion de modelos: no se trata de un checkpoint entrenado con pesos y tokenizador evaluables, sino de una distribucion de software empaquetada. Para un desarrollador o investigador que busque un modelo para inferencia, esta ficha debe interpretarse como referencia del ecosistema ArchieOS y de los modelos que integra, no como una ficha de modelo de lenguaje propiamente dicha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no es un modelo de lenguaje; es una imagen de sistema operativo basada en Arch Linux) |
| Parametros totales | No disponible (el modelo de lenguaje se descarga aparte, `archie-local`) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles a nivel de modelo; el sistema incluye voces Piper en espanol (`es_MX-ald-medium`) e ingles (`en_US-john-medium`) |
| Licencia | Apache-2.0 para ArchieOS; componentes con licencias propias (ver seccion de limitaciones) |
| Formato de pesos | Imagenes `.wsl` y `.ova`, mas fichero `SHA256SUMS`; no hay safetensors ni GGUF en el repositorio |

## Arquitectura y entrenamiento

No se dispone de informacion sobre arquitectura de red neuronal, datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de alineacion (RLHF, DPO) para el modelo de lenguaje, porque el repositorio no contiene pesos de modelo. Lo que si se documenta es la arquitectura del sistema: una distribucion Arch Linux empaquetada como imagen de WSL 2 y como appliance de VirtualBox, con un escritorio, el componente Core, el modulo Stage, IRIS Beta 2.1 y un pipeline de voz compuesto por NVIDIA Nemotron 3.5 ASR streaming 0.6B para reconocimiento y voces Piper para sintesis.

El mecanismo de integridad es destacable: cada version reside en su propia revision del repositorio y un manifiesto de release firmado fija la revision exacta, el tamano y el SHA-256 que el instalador acepta. El instalador verifica firma y hash antes de instalar. En el primer arranque, cada instalacion genera su propia identidad, clave de paquete y base de datos, de modo que las imagenes no contienen cuentas, claves, conversaciones ni datos personales.

## Capacidades

- Distribucion de un sistema operativo completo con asistente de IA integrado, orientado a ejecucion local.
- Instalacion mediante `ArchieOS-Setup.exe` sin privilegios de administrador, con descarga, verificacion de firma y SHA-256, e instalacion del modelo elegido.
- Soporte de dos plataformas de virtualizacion: WSL 2 en Windows (imagen `.wsl`) y VirtualBox (appliance `.ova`).
- Reconocimiento de voz en streaming mediante NVIDIA Nemotron 3.5 ASR streaming 0.6B.
- Sintesis de voz en espanol (variante mexicana) e ingles mediante voces Piper.
- Componente IRIS Beta 2.1 con pesos incluidos en la imagen.
- Modelo de lenguaje seleccionable por el usuario en el momento de la instalacion (`archie-local`), no incluido en el repositorio.
- No se documentan capacidades de tool calling, agentes multi-paso, vision ni modos de razonamiento extendido para el modelo de lenguaje.

## Casos de uso

- Evaluacion de distribuciones de IA local: un equipo puede desplegar la imagen `.ova` en VirtualBox para probar un asistente integrado en el sistema sin tocar el equipo anfitrion, gracias al aislamiento de la maquina virtual.
- Entornos Windows corporativos con WSL 2: la imagen `.wsl` permite disponer de un escritorio Linux con asistencia por voz e IA sin reinstalar el sistema operativo ni requerir permisos de administrador.
- Prototipado de interfaces voz-texto: la combinacion de Nemotron 3.5 ASR streaming 0.6B con voces Piper en espanol e ingles sirve para validar flujos de dictado y respuesta hablada en un escritorio Linux real.
- Verificacion de cadena de suministro: el manifiesto firmado y los hashes SHA-256 permiten auditar que la imagen instalada corresponde exactamente a la revision publicada, util en entornos con requisitos de integridad.
- Investigacion sobre asistentes de sistema operativo: IRIS Beta 2.1, con licencia de uso no comercial, puede emplearse en estudios academicos sobre interaccion persona-asistente a nivel de escritorio.
- Reproduccion de entornos de escritorio Linux en CI: la imagen `.wsl` permite levantar un escritorio Arch Linux reproducible para pruebas de integracion de aplicaciones graficas.
- Formacion y demos: el instalador sin privilegios de administrador facilita distribuir el entorno a alumnos o asistentes a una demo sin configuracion manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 6,1 GB; la instalacion completa requiere espacio adicional para el modelo de lenguaje descargado y los datos generados en el primer arranque.
- VRAM: no disponible. Depende del modelo `archie-local` que el usuario seleccione en el instalador, no de la imagen.
- GPU recomendadas: no disponible para el conjunto; NVIDIA Nemotron 3.5 ASR streaming 0.6B es un modelo de 0,6 mil millones de parametros y, por tamano, es apto para GPU de consumo, aunque no se documentan requisitos oficiales en la informacion disponible.
- Compatibilidad con GPU de consumo: no confirmada en la documentacion proporcionada.
- Opciones de despliegue: WSL 2 en Windows y VirtualBox mediante `.ova`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para el modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. ArchieOS no es un modelo de lenguaje y no existen alternativas directamente comparables en la misma categoria dentro de la informacion proporcionada. Como referencia de los componentes integrados:

| Componente | Tipo | Parametros | Licencia |
|---|---|---|---|
| ArchieOS | Imagen de sistema operativo | No aplica | Apache-2.0 |
| NVIDIA Nemotron 3.5 ASR streaming 0.6B | Modelo ASR | 0,6 B | NVIDIA Open Model License |
| IRIS Beta 2.1 | Componente del sistema | No disponible | Uso no comercial en investigacion |
| Piper `es_MX-ald-medium` / `en_US-john-medium` | Sintesis de voz | No disponible | Licencia propia por voz |
| Modelo `archie-local` | Modelo de lenguaje | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no contiene pesos, tokenizador ni configuracion de inferencia evaluables. Cualquier evaluacion de calidad linguistica debe hacerse sobre el modelo `archie-local` que el usuario instale.
- Licencias heterogeneas: ArchieOS es Apache-2.0, pero NVIDIA Nemotron 3.5 ASR se rige por la NVIDIA Open Model License, las voces Piper por sus propias licencias e IRIS Beta 2.1 restringe el uso a investigacion no comercial. Un uso comercial del conjunto requiere revisar cada componente por separado.
- IRIS Beta 2.1 esta en version beta y con restriccion no comercial; no debe desplegarse en produccion comercial sin autorizacion.
- El repositorio no registra descargas ni interacciones, lo que impide inferir validacion por parte de la comunidad.
- No se documentan idiomas soportados a nivel de modelo de lenguaje ni sesgos conocidos.
- No se documentan riesgos de alucinacion del modelo de lenguaje, al no incluirse este en el repositorio.
- La informacion de la model card esta en ingles y no detalla versionado semantico de las imagenes mas alla de la referencia a la revision del repositorio.
- Dependencia de un instalador externo (`ArchieOS-Setup.exe`) alojado fuera de Hugging Face; la integridad de la cadena de suministro depende de la verificacion de firma y SHA-256 que realiza dicho instalador.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/PentaVM/ArchieOS
- Repositorio del instalador en GitHub: https://github.com/PentaVM/ArchieOS-Installer
- Ultima release del instalador: https://github.com/PentaVM/ArchieOS-Installer/releases/latest
- Pagina de descargas: https://archieos-hub.vercel.app/descargas.html
- NVIDIA Nemotron 3.5 ASR streaming 0.6B: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Piper (sintesis de voz): https://github.com/rhasspy/piper
