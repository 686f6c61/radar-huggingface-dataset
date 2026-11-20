# Cactus-Compute/cactus

## Resumen

Cactus es el repositorio de distribución del runtime homónimo desarrollado por Cactus-Compute, un motor de inferencia local que unifica generación de texto, reconocimiento automático de voz y procesamiento de imagen-texto en un único binario. No se trata de un modelo de lenguaje con pesos propios, sino de un paquete de artefactos precompilados (runners nativos, bibliotecas estáticas, módulo WASM y wheels de Python) que ejecutan los modelos de la familia Cactus: Needle 3, Whistle y Mirage. Los pesos de cada modelo viven en repositorios separados y se cargan en tiempo de ejecución desde ficheros `.cact`.

La propuesta de valor es el despliegue en dispositivos de consumo: el lema del proyecto es "Sub-50mb Super Intelligence For Consumer Devices", lo que indica que los modelos asociados están diseñados para ocupar menos de 50 MB y ejecutarse en hardware limitado. El runtime cubre 17 plataformas objetivo en su release 4.0.0, desde macOS Apple Silicon y Linux x86-64 hasta Android, iOS, tvOS, watchOS, RISC-V, MIPS32el y WebAssembly, lo que lo convierte en una opción relevante para aplicaciones de inferencia en el borde (edge) sin dependencia de la nube.

El repositorio tiene un tamaño de 0,4 GB, licencia Apache 2.0 y alrededor de 1600 descargas, con fecha de creación en noviembre de 2026. Es relevante ahora porque consolida en un solo motor multimodal (texto, voz, visión) la ejecución local en arquitecturas muy diversas, incluyendo entornos embebidos y navegador, un nicho que normalmente requiere cadenas de herramientas separadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Runtime de inferencia multiplataforma; no es un modelo con arquitectura propia (ejecuta Needle 3, Whistle y Mirage) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen como ficheros `.cact`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.cact` (pesos propios del runtime); artefactos del runtime: binarios nativos, `libcactus.a`, `cactus.h`, `cactus.wasm`, `cactus.component.wasm` |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna de los modelos que ejecuta, sino la del runtime. Este se distribuye como binarios nativos por plataforma (`cactus`, `cactus.exe`), bibliotecas estáticas con cabecera C (`libcactus.a`, `cactus.h`), un módulo JavaScript/WebAssembly (`cactus.js`, `cactus.wasm`), un componente WASI Preview 2 (`cactus.component.wasm`, `cactus.wit`) y wheels de Python que incluyen la biblioteca compartida. Los runners nativos cargan los pesos `.cact` en tiempo de ejecución, y el componente WASI exporta la interfaz `cactus:runtime/engine@4.0.0`, también publicada como artefacto OCI firmado en `ghcr.io/cactus-compute/cactus-runtime-component:4.0.0`.

No se proporciona información sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO) de los modelos Needle 3, Whistle o Mirage. Tampoco se detallan innovaciones de decodificación o atención. Lo que sí está documentado es el proceso de distribución reproducible: los artefactos del release 4.0.0 incluyen checksums SHA-256 en un `manifest.json`, y se recomienda usar la revisión `1a028f5a3972b67dd8d8752f882113d475e7ec4c` o la etiqueta `v4.0.0` para descargas reproducibles.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, ejecutado por el modelo Needle 3 a través del runtime.
- Reconocimiento automático de voz: etiqueta `automatic-speech-recognition`, asociada al modelo Whistle; el runner acepta entrada de audio (`--audio clip.wav`).
- Procesamiento imagen-texto: etiqueta `image-text-to-text`, asociada al modelo Mirage.
- Motor único multimodal: un solo binario gestiona texto, voz y visión, según la model card.
- Ejecución local y offline: el runtime descarga los pesos en el primer uso y luego opera sin conexión, según la guía de despliegue.
- Integración nativa en C y C++ mediante `cactus.h` y `libcactus.a`.
- Integración en navegador y Node.js vía WebAssembly.
- Integración en Python mediante el paquete `cactus-compute` (`import cactus`).
- Soporte de 17 plataformas objetivo, incluidas arquitecturas embebidas y de bajo consumo (RISC-V, ARMv7, MIPS32el, watchOS).
- Tool calling, agentes, modo thinking, matemáticas o multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de voz en dispositivos móviles: el modelo Whistle, ejecutado por el runtime, permite reconocimiento de voz en Android, iOS y watchOS sin enviar audio a la nube, lo que resulta adecuado para aplicaciones sensibles a la privacidad y con conectividad intermitente.
- Procesamiento de imágenes en el borde: el modelo Mirage, con la etiqueta `image-text-to-text`, se puede desplegar en macOS Apple Silicon o Linux ARM64 para tareas de descripción o consulta sobre imágenes generadas localmente.
- Aplicaciones de escritorio con generación de texto: Needle 3 sobre el runner de Windows x64 o macOS ARM64 permite incorporar generación de texto en herramientas de escritorio sin dependencia de servicios externos.
- Aplicaciones web sin backend de inferencia: el módulo WASM (`cactus.js`, `cactus.wasm`) permite ejecutar los modelos directamente en el navegador, útil para demos, prototipos o herramientas que deben funcionar sin servidor.
- Integración en firmware y sistemas embebidos: las compilaciones para Linux RISC-V, ARMv7 y MIPS32el, junto con la biblioteca estática y la cabecera C, permiten incorporar inferencia en dispositivos con recursos muy limitados.
- Aplicaciones de wearables: los artefactos para watchOS ARM64 y tvOS ARM64 habilitan funciones de texto o voz en relojes y televisiones inteligentes.
- Despliegue reproducible en producción: el manifiesto con checksums SHA-256 y la revisión fijada permiten integrar el runtime en pipelines de CI/CD con verificación de integridad de los artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El lema del proyecto indica modelos de menos de 50 MB, pero no se especifica el consumo de memoria del runtime ni de los pesos en ejecución.
- GPU recomendadas: no disponible. El runtime está orientado a ejecución local en CPU y plataformas diversas; no se documentan requisitos de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: binarios nativos por plataforma (`cactus` / `cactus.exe`), biblioteca estática C/C++ (`libcactus.a`, `cactus.h`), paquete de Python (`pip install -U cactus-compute`), WebAssembly para navegador y Node.js, componente WASI Preview 2 y artefacto OCI en `ghcr.io/cactus-compute/cactus-runtime-component:4.0.0`.
- Plataformas soportadas: macOS ARM64, Linux x86-64, Linux ARM64, Linux ARMv7, Linux RISC-V, Linux MIPS32el, Windows x64, Windows ARM64, Android ARM64, Android ARMv7, Android RISC-V, iOS ARM64, iOS Simulator ARM64, tvOS ARM64, watchOS ARM64, WASM y WASI Preview 2.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría (runtimes de inferencia local multimodal).

## Limitaciones y advertencias

- Este repositorio no contiene pesos de modelo; es un runtime. Cualquier evaluación de calidad de las respuestas debe hacerse sobre Needle 3, Whistle o Mirage en sus repositorios respectivos.
- No se documentan sesgos, tasas de alucinación ni comportamiento lingüístico de los modelos ejecutados.
- No se especifican los idiomas soportados, lo que impide garantizar cobertura multilingüe en producción.
- No se detallan los tipos de cuantización ni el consumo de memoria, lo que dificulta el dimensionamiento de recursos.
- La licencia Apache 2.0 del runtime permite uso comercial, pero las licencias de los pesos de Needle 3, Whistle y Mirage deben verificarse por separado en sus repositorios.
- El proyecto se encuentra en una fase temprana (creado en noviembre de 2026, unas 1600 descargas), por lo que la madurez del ecosistema y el soporte a largo plazo no están contrastados.
- La integración multiplataforma depende de artefactos precompilados; cambios en la ABI del runtime o en el formato `.cact` podrían requerir actualizaciones coordinadas de los pesos.
- Los resultados de la búsqueda web sobre "Cactus" corresponden a términos no relacionados (botánica, portales de formación) y no aportan información técnica sobre el modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Cactus-Compute/cactus
- Pesos de Needle 3: https://huggingface.co/Cactus-Compute/needle3
- Pesos de Whistle: https://huggingface.co/Cactus-Compute/whistle
- Pesos de Mirage: https://huggingface.co/Cactus-Compute/mirage
- Código fuente: https://github.com/cactus-compute/cactus
- Página de Needle: https://cactuscompute.com/needle
- Blog de Whistle: https://cactuscompute.com/blog/whistle
- Documentación de la API de Python: https://cactuscompute.com/blog/needle-python-docs
- Guía de despliegue y dispositivos soportados: https://cactuscompute.com/blog/needle-supported-devices
- Artefactos del release 4.0.0: https://huggingface.co/Cactus-Compute/cactus/tree/main/releases/4.0.0
- Manifiesto con checksums: https://huggingface.co/Cactus-Compute/cactus/blob/1a028f5a3972b67dd8d8752f882113d475e7ec4c/releases/4.0.0/manifest.json
