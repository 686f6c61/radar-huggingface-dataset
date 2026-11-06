# Cactus-Compute/cactus

## Resumen

Cactus es un runtime de inferencia para dispositivos de consumo desarrollado por Cactus-Compute, no un modelo de lenguaje en si. El repositorio de Hugging Face `Cactus-Compute/cactus` distribuye los binarios precompilados del motor (release 4.0.0) que ejecutan tres modelos propios: Needle 3 (texto), Whistle (audio) y Mirage (vision). El objetivo declarado es habilitar inferencia local de texto, voz y vision en telefonos, wearables, dispositivos de domotica y robots, con un tamano de modelo inferior a 50 MB segun la cabecera del proyecto.

El problema que aborda es la dependencia de la nube para tareas de IA en el borde: el runtime permite ejecutar los pesos en el propio dispositivo sin conexion, con un enfoque en privacidad y latencia baja. La distribucion cubre 17 plataformas objetivo, desde macOS Apple Silicon y Linux x86-64 hasta Android ARMv7, iOS, watchOS, tvOS, navegadores via WebAssembly y un componente WASI Preview 2. El paquete Python `cactus-compute` descarga automaticamente el motor y los pesos correspondientes en el primer uso.

La relevancia actual radica en la cobertura de plataformas y en el empaquetado reproducible: los artefactos incluyen sumas SHA-256 en un manifiesto y estan etiquetados con la revision `v4.0.0`, lo que facilita integraciones verificables en produccion. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales conocidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (runtime de inferencia; los pesos pertenecen a Needle 3, Whistle y Mirage) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el runtime carga pesos en formato `.cact`) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.cact` (pesos propietarios cargados por el runtime nativo); binarios `cactus`, `libcactus.a`, `cactus.h`, `cactus.js`, `cactus.wasm`, `cactus.component.wasm` |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna de los modelos, sino el motor de ejecucion. La model card describe Cactus como un runtime que combina cuantizacion, kernels optimizados e inferencia para moviles, wearables, domotica y robots, con un unico motor capaz de ejecutar texto, voz y vision de forma local. Los pesos se distribuyen por separado en repositorios independientes (`Cactus-Compute/needle3`, `Cactus-Compute/whistle`, `Cactus-Compute/mirage`), y el runtime los carga en tiempo de ejecucion desde archivos `.cact`.

El release 4.0.0 incluye bibliotecas estaticas con cabecera `cactus.h` para integracion en C y C++, runners nativos por plataforma y un componente WASI que exporta la interfaz `cactus:runtime/engine@4.0.0`, tambien publicado como artefacto OCI firmado en `ghcr.io/cactus-compute/cactus-runtime-component:4.0.0`. No se proporcionan datos sobre volumen de entrenamiento, composicion del dataset ni tecnicas de alineacion (RLHF/DPO) de los modelos subyacentes.

## Capacidades

- Inferencia local de texto mediante el modelo Needle 3, sin conexion a la nube.
- Procesamiento de audio mediante el modelo Whistle (entrada de audio en formato WAV en el ejemplo de la model card).
- Procesamiento de vision mediante el modelo Mirage.
- Ejecucion en 17 plataformas objetivo: macOS ARM64, Linux x86-64, Linux ARM64, Linux ARMv7, Linux RISC-V, Linux MIPS32el, Windows x64, Windows ARM64, Android ARM64, Android ARMv7, Android RISC-V, iOS ARM64, iOS Simulator ARM64, tvOS ARM64, watchOS ARM64, navegador/Node.js via WebAssembly y WASI Preview 2.
- Integracion nativa en aplicaciones C y C++ mediante `libcactus.a` y `cactus.h`.
- Integracion en JavaScript/Node.js y en componentes WASI mediante `cactus.js`, `cactus.wasm` y `cactus.component.wasm`.
- API Python mediante el paquete `cactus-compute` (`import cactus`).
- Descarga reproducible de artefactos con sumas SHA-256 verificables en el manifiesto del release.

## Casos de uso

- Asistentes de voz en telefonos: el runtime ejecuta Whistle sobre audio capturado por el microfono del dispositivo, sin enviar muestras a un servidor, lo que reduce latencia y cumple con requisitos de privacidad en conversaciones personales.
- Traduccion o resumen de texto en el propio dispositivo: Needle 3 puede ejecutarse en Android ARM64 o iOS ARM64 para tareas de procesamiento de lenguaje en aplicaciones moviles que operan sin conectividad.
- Procesamiento de imagenes en wearables: Mirage se ejecuta en watchOS ARM64 o Android ARMv7, permitiendo clasificacion o descripcion de imagenes capturadas por la camara del dispositivo con un presupuesto de memoria reducido.
- Domotica y hogar inteligente: el runtime se integra en dispositivos Linux ARMv7 o MIPS32el con `libcactus.a`, habilitando comandos de voz locales en asistentes de hogar sin dependencia de un backend cloud.
- Robotica de bajo consumo: la compilacion para Linux RISC-V y ARM64 permite desplegar inferencia de texto y vision en controladores de robot con recursos limitados, manteniendo la operacion offline.
- Aplicaciones web sin servidor: el target WASM (`cactus.js`, `cactus.wasm`) permite ejecutar los modelos dentro del navegador, util para demos interactivas o herramientas de edicion que no pueden enviar datos a un servidor.
- Integracion en pipelines C/C++ existentes: mediante `cactus.h` y `libcactus.a` se puede enlazar el motor en aplicaciones ya compiladas, evitando reescrituras en Python o JavaScript.
- Componentes WASI en entornos serverless: el artefacto OCI `ghcr.io/cactus-compute/cactus-runtime-component:4.0.0` permite desplegar el motor como componente WASI Preview 2 en runtimes compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El runtime esta disenado para dispositivos de consumo; la cabecera del proyecto indica modelos por debajo de 50 MB, lo que sugiere un consumo de memoria muy reducido, pero no se especifican cifras de VRAM ni de RAM por modelo.
- Plataformas soportadas: macOS Apple Silicon, Linux x86-64, Linux ARM64, Linux ARMv7, Linux RISC-V, Linux MIPS32el, Windows x64, Windows ARM64, Android ARM64, Android ARMv7, Android RISC-V, iOS ARM64, iOS Simulator ARM64, tvOS ARM64, watchOS ARM64, navegador/Node.js (WASM) y WASI Preview 2.
- No se indican GPU recomendadas (A100, H100, RTX 4090) porque el objetivo son dispositivos de borde, no servidores.
- Opciones de despliegue: runners nativos por plataforma, bibliotecas estaticas C/C++, paquete Python `cactus-compute` desde PyPI, modulo WASM para navegador y Node.js, y componente WASI publicado como artefacto OCI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Plataformas | Licencia | Disponibilidad |
|---|---|---|---|---|
| Cactus (runtime) | Motor de inferencia on-device (texto, audio, vision) | 17 targets (movil, escritorio, WASM, WASI) | Apache 2.0 | Hugging Face, PyPI, GitHub, ghcr.io |
| llama.cpp | Motor de inferencia LLM | Multiples (CPU, GPU, movil) | MIT | GitHub |
| ONNX Runtime | Motor de inferencia generico | Multiples | MIT | GitHub, PyPI |
| MediaPipe | Framework de inferencia on-device | Android, iOS, web, escritorio | Apache 2.0 | GitHub, PyPI |

No se dispone de datos de rendimiento para comparar Cactus con estas alternativas; la comparacion se limita a alcance de plataformas, licencia y canales de distribucion.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo, solo binarios del runtime; para ejecutar inferencia es necesario descargar por separado los pesos de Needle 3, Whistle o Mirage.
- No se documentan parametros, contexto, idiomas ni datos de entrenamiento de los modelos subyacentes, lo que impide evaluar su calidad sin consultar los repositorios de pesos.
- El formato de pesos `.cact` es propietario del runtime; no hay indicacion de compatibilidad con safetensors, GGUF u otros formatos estandar.
- El runtime no expone cifras de latencia ni throughput, por lo que no se puede planificar capacidad de produccion a partir de la documentacion publicada.
- Los artefactos estan etiquetados con revision `v4.0.0`; el uso de otras revisiones puede romper la reproducibilidad de las sumas SHA-256.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan patentes ni terminos adicionales de los modelos de pesos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica adopcion muy temprana y ausencia de validacion por parte de la comunidad.
- La fecha de creacion del repositorio (2026-11-05) es posterior a la fecha actual conocida; conviene verificar la integridad de los metadatos antes de integrar el paquete en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Cactus-Compute/cactus
- Pesos Needle 3: https://huggingface.co/Cactus-Compute/needle3
- Pesos Whistle: https://huggingface.co/Cactus-Compute/whistle
- Pesos Mirage: https://huggingface.co/Cactus-Compute/mirage
- Codigo fuente en GitHub: https://github.com/cactus-compute/cactus
- Sitio web del proyecto: https://cactuscompute.com/
- Pagina del producto Needle: https://cactuscompute.com/needle
- Blog sobre Whistle: https://cactuscompute.com/blog/whistle
- Documentacion de la API Python: https://cactuscompute.com/blog/needle-python-docs
- Guia de despliegue y dispositivos soportados: https://cactuscompute.com/blog/needle-supported-devices
- Manifiesto del release 4.0.0: https://huggingface.co/Cactus-Compute/cactus/blob/1a028f5a3972b67dd8d8752f882113d475e7ec4c/releases/4.0.0/manifest.json
- Artefacto OCI del componente WASI: ghcr.io/cactus-compute/cactus-runtime-component:4.0.0
