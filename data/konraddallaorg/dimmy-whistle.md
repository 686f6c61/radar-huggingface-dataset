# KonradDallaOrg/dimmy-whistle

## Resumen

`KonradDallaOrg/dimmy-whistle` no es un modelo de lenguaje, sino un espejo (mirror) sin modificaciones de los ficheros que la aplicación Dimmy descarga para ejecutar transcripción de voz en CPU. En concreto, el repositorio aloja `whistle.cact`, un modelo de reconocimiento automático de habla (ASR) de Cactus Compute de aproximadamente 17 MB, junto con las ruedas binarias `cactus_needle-3.2.0` que contienen el motor nativo (`libneedle3`) para Windows, macOS (arm64 y x86_64) y Linux (x86_64 y aarch64).

El propósito del repositorio es puramente de disponibilidad: garantizar que la aplicación Dimmy no dependa de que los repositorios upstream de Cactus Compute permanezcan accesibles o inmutables. Los ficheros son copias byte a byte de los originales en las revisiones indicadas, verificables mediante los hashes SHA-256 listados en la model card.

Dado que se trata de un mirror de artefactos y no de un modelo con pesos publicados en safetensors ni de un transformer entrenado de forma convencional, la mayoría de las especificaciones habituales (parámetros, contexto, benchmarks, idiomas) no están disponibles en la información proporcionada. La ficha se completa con los datos verificables del repositorio y de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo ASR empaquetado en formato `.cact`; detalles internos no publicados en la model card) |
| Parametros totales | No disponible (el artefacto `whistle.cact` ocupa 16.919.407 bytes) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (modelo y motor de Cactus Compute) |
| Formato de pesos | `.cact` (formato propio de Cactus Compute) + ruedas Python `cactus_needle` 3.2.0 con el motor nativo `libneedle3` |
| Tamano del repositorio | 0.0 GB (segun el Hub); suma de ficheros listados: ~19,4 MB |
| Plataformas del motor | Windows amd64, macOS 11+ arm64, macOS 11+ x86_64, Linux manylinux2014 x86_64, Linux manylinux2014 aarch64 |
| Autor del mirror | KonradDallaOrg |
| Upstream | Cactus-Compute/whistle (rev. `b358ddadd89b7a713b5aa131f23032d3cca1b251`) y Cactus-Compute/needle3 (rev. `2ae11323dc000f5e70c49f7403efa6af12ba9e67`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo Whistle. Lo único verificable es que se trata de un modelo de reconocimiento de voz (speech-to-text) diseñado para ejecutarse en CPU, con un tamaño de fichero de 16,9 MB, lo que lo sitúa en la categoría de modelos ASR ultraligeros pensados para inferencia en dispositivo (on-device) o en entornos sin GPU. No se publican datos sobre número de tokens de entrenamiento, composición del dataset, técnicas de alineación (RLHF/DPO) ni innovaciones arquitectónicas concretas.

El componente `cactus_needle-3.2.0` es el motor de inferencia nativo (biblioteca `libneedle3`) que Cactus Compute distribuye como ruedas Python por plataforma; Dimmy extrae dicha biblioteca de las ruedas para ejecutar el modelo. No hay información sobre el proceso de entrenamiento de Whistle en el material proporcionado.

## Capacidades

- Reconocimiento automático de habla (speech-to-text) sobre CPU, según la descripción de la model card.
- Ejecución en dispositivo sin GPU, gracias al tamaño reducido del modelo (~17 MB) y a un motor nativo multiplataforma.
- Distribución como artefacto reproducible: los ficheros son copias byte a byte de upstream, con SHA-256 verificable.
- Soporte de plataformas Windows (amd64), macOS (arm64 y x86_64) y Linux (x86_64 y aarch64) a través de las ruedas `cactus_needle` 3.2.0.
- Generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes y capacidades multilingües: no disponible (no es un modelo de lenguaje y la model card no lo indica).

## Casos de uso

- Transcripción de voz local en aplicaciones de escritorio: Dimmy utiliza este artefacto para transcribir audio sin enviar datos a la nube, aprovechando que el modelo corre en CPU y pesa ~17 MB.
- Dictado en entornos sin GPU: adecuado para portátiles, equipos de gama baja o servidores sin acelerador, ya que no requiere VRAM.
- Aplicaciones de notas de voz o accesibilidad: integración del motor `libneedle3` para convertir audio a texto en tiempo real en Windows, macOS y Linux.
- Pipelines offline o air-gapped: al ser un mirror con hashes verificables, permite desplegar transcripción en entornos sin acceso a los repositorios upstream.
- Distribución reproducible en CI/CD: los SHA-256 publicados permiten validar la integridad de los binarios antes de empaquetarlos en una aplicación.
- Prototipado rápido de ASR en Python: instalación de la rueda `cactus_needle` correspondiente a la plataforma y carga de `whistle.cact` para pruebas de transcripción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 0 GB; el modelo está diseñado para inferencia en CPU.
- GPU recomendadas: no aplica (no requiere GPU).
- Cabe en cualquier equipo consumer: el artefacto del modelo ocupa 16,9 MB y las ruedas del motor entre 535 KB y 697 KB.
- Plataformas soportadas por el motor: Windows amd64, macOS 11+ (arm64 y x86_64), Linux manylinux2014 (x86_64 y aarch64).
- Opciones de despliegue: instalación de la rueda `cactus_needle-3.2.0` correspondiente y uso de `libneedle3` con `whistle.cact`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos ASR comparables ni datos de rendimiento que permitan una comparación rigurosa. Como referencia categórica, Whistle pertenece a la familia de modelos ASR ultraligeros para CPU (orden de decenas de MB), pero no se dispone de cifras para contrastarlo con alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no razona, no escribe código ni soporta tool calling.
- La model card no documenta idiomas soportados, sesgos, tasas de error (WER) ni condiciones de audio recomendadas; no debe asumirse calidad en un idioma o dominio concreto.
- Riesgo de transcripciones inexactas inherente a un modelo ASR de ~17 MB; no hay benchmarks publicados que cuantifiquen su precisión.
- El repositorio es un mirror no oficial mantenido por KonradDallaOrg; la autoría del modelo y del motor corresponde a Cactus Compute.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar los ficheros `LICENSE` y `LICENSE.needle3` copiados de upstream para confirmar condiciones y atribuciones.
- Dependencia de binarios precompilados por plataforma: no hay ruedas para plataformas distintas de las cinco listadas (por ejemplo, Windows arm64 no aparece).
- El Hub reporta un tamaño de repositorio de 0.0 GB, aunque la suma de ficheros listados es de ~19,4 MB; conviene verificar los hashes SHA-256 antes de su uso en producción.

## Enlaces

- Repositorio mirror: https://huggingface.co/KonradDallaOrg/dimmy-whistle
- Upstream del modelo: https://huggingface.co/Cactus-Compute/whistle (revisión `b358ddadd89b7a713b5aa131f23032d3cca1b251`)
- Upstream del motor: https://huggingface.co/Cactus-Compute/needle3 (revisión `2ae11323dc000f5e70c49f7403efa6af12ba9e67`)
- Fichero del modelo: https://huggingface.co/Cactus-Compute/whistle/resolve/b358ddadd89b7a713b5aa131f23032d3cca1b251/whistle.cact
- Rueda Windows amd64: https://huggingface.co/Cactus-Compute/needle3/resolve/2ae11323dc000f5e70c49f7403efa6af12ba9e67/python/cactus_needle-3.2.0-py3-none-win_amd64.whl
- Rueda macOS arm64: https://huggingface.co/Cactus-Compute/needle3/resolve/2ae11323dc000f5e70c49f7403efa6af12ba9e67/python/cactus_needle-3.2.0-py3-none-macosx_11_0_arm64.whl
- Rueda macOS x86_64: https://huggingface.co/Cactus-Compute/needle3/resolve/2ae11323dc000f5e70c49f7403efa6af12ba9e67/python/cactus_needle-3.2.0-py3-none-macosx_11_0_x86_64.whl
- Rueda Linux x86_64: https://huggingface.co/Cactus-Compute/needle3/resolve/2ae11323dc000f5e70c49f7403efa6af12ba9e67/python/cactus_needle-3.2.0-py3-none-manylinux2014_x86_64.whl
- Rueda Linux aarch64: https://huggingface.co/Cactus-Compute/needle3/resolve/2ae11323dc000f5e70c49f7403efa6af12ba9e67/python/cactus_needle-3.2.0-py3-none-manylinux2014_aarch64.whl
