# fylume/yaob-n10k-c4b

## Resumen

Yaob Next (C4B-N10K) 1.0.0 es un paquete de distribución offline publicado por el autor fylume en Hugging Face, que empaqueta en un único ZIP de 6,49 GiB todo lo necesario para ejecutar un sistema de generación aumentada por recuperación (RAG) sobre una red de nodos de conocimiento. El componente lingüístico ("C4B") no es un modelo entrenado por fylume: es Qwen3.5-4B de Alibaba Cloud, convertido a GGUF y cuantizado únicamente a Q8_0, con 4.000 millones de parámetros. El componente diferencial es la red "N10K": 10.167 nodos (10.007 validados más 160 canarios de diagnóstico) y un router de 3,1 millones de parámetros, que es la única pieza realmente entrenada por fylume.

El sistema se presenta como un endpoint compatible con la API de OpenAI en `127.0.0.1:8861`, arrancado mediante scripts de shell (`setup.sh`, `run.sh`) sobre Linux x86-64 o ARM64 con glibc 2.38 o superior, sin necesidad de Python, root ni conexión a Internet tras la descarga. La inferencia es exclusivamente en CPU mediante llama.cpp b12318, lo que sitúa el rendimiento en unos pocos tokens por segundo (3 a 5 minutos por respuesta en una máquina de 8 núcleos x86-64).

Su relevancia es acotada pero específica: propone un despliegue reproducible, verificado por hashes y sin dependencias de red, orientado a entornos aislados o air-gapped donde se prioriza la trazabilidad de las citas sobre la velocidad. No es un modelo de propósito general nuevo, sino un ensamblaje de piezas existentes con una capa de enrutamiento y recuperación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Núcleo transformer denso (Qwen3.5-4B) + red de nodos con router (3,1 M parámetros); recuperación aumentada |
| Parametros totales | 4.000 millones (núcleo) + 3,1 millones (router) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por defecto (configurable, p. ej. 8.192) |
| Tipos de cuantizacion | Q8_0 únicamente para el núcleo; F16 para el proyector de visión y el encoder |
| Idiomas soportados | no disponible |
| Licencia | composite-see-licenses (licencia compuesta; ver limitaciones) |
| Formato de pesos | GGUF (núcleo, encoder y proyector); FG-MPN store para la red de nodos |

## Arquitectura y entrenamiento

El sistema combina cuatro piezas empaquetadas: un núcleo Qwen3.5-4B en GGUF Q8_0 (4.610.580.384 bytes) con su proyector de visión F16 (672.423.488 bytes); un encoder de recuperación Qwen3-Embedding-0.6B en F16 (1.197.629.728 bytes); la red N10K en dos formatos (FG-MPN `store/` y store de Studio con router, 166.747.754 bytes en 37 ficheros); y el runtime, compuesto por el backend de MPN Studio 0.6.0 y llama.cpp b12318 para linux-x86_64 y linux-aarch64. El núcleo no ha sido entrenado por fylume y es sustituible mediante el ajuste `core_mode` en `config/yaob.json`.

La única parte aprendida por fylume es el router de 3,1 millones de parámetros que selecciona nodos de la red de conocimiento. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal no es arquitectónica en el sentido habitual, sino de empaquetado y verificación: manifiesto `manifest.json` con esquema `fylume-package/1`, ficheros `checksums.sha256`, ZIP64 con almacenamiento sin compresión, y un flujo de arranque que registra cada llamada de red mediante `strace -f` (unas 21.000 llamadas, todas a 127.0.0.1 y al socket local de resolución de nombres).

## Capacidades

- Generación de texto y respuesta a preguntas con recuperación sobre la red de nodos, devolviendo en la respuesta un campo `yaob` con los nodos leídos y las citas verificadas.
- Verificación de citas: el sistema comprueba las referencias asociadas a cada respuesta y rechaza responder cuando no encuentra respaldo (p. ej., ante una localidad inventada).
- Endpoint compatible con la API de OpenAI (`/v1/chat/completions`), lo que permite integrarlo con clientes y SDK existentes.
- Proyector de visión F16 incluido, lo que sugiere capacidades multimodales heredadas del núcleo, aunque no se detalla su uso en la información disponible.
- Sustitución del núcleo: admite otro GGUF o cualquier servidor compatible con OpenAI mediante `core_mode: endpoint`.
- Funcionamiento completamente offline tras la descarga, sin dependencias de Python ni permisos de root.
- Soporte de arquitecturas x86-64 y ARM64 sobre Linux con glibc 2.38 o superior.

## Casos de uso

- Despliegue en entornos air-gapped: el paquete se instala y ejecuta sin conexión a Internet, con verificación criptográfica del ZIP y de los 581 ficheros extraídos, lo que encaja en instalaciones con requisitos estrictos de procedencia del software.
- Asistente documental con citas verificables: el campo `yaob` de cada respuesta expone los nodos consultados y las citas comprobadas, útil en dominios donde la trazabilidad de la fuente es obligatoria.
- Sustitución de núcleo para experimentación: `core_mode: gguf` permite cambiar el modelo base sin tocar el directorio `mpn/`, lo que facilita comparar núcleos manteniendo la capa de recuperación.
- Integración en pipelines existentes: al exponer una API compatible con OpenAI en `127.0.0.1:8861`, se puede conectar a frameworks de agentes o herramientas que ya hablen ese protocolo.
- Auditoría de comportamiento en red: el flujo registrado con `strace -f` y la ausencia de conexiones externas permiten validar el aislamiento de un despliegue antes de ponerlo en producción.
- Prototipado de bajo coste en CPU: para pruebas de concepto donde la latencia no es crítica (3 a 5 minutos por respuesta en 8 núcleos x86-64), evita depender de GPU.
- Registro en biblioteca de Studio: `scripts/setup.sh --studio-library` permite registrar el emparejamiento en una biblioteca aislada de MPN Studio (254 MB, con los GGUF referenciados en su sitio).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento medidos por el autor son operativos: extracción del ZIP en 25 s (581 ficheros, 6.991.752.819 bytes), `verify.sh` en 4 s sobre 580 ficheros, `setup.sh` en 36 s y `run.sh` listo en 5 s. En inferencia, la máquina de prueba x86-64 de 8 núcleos tardó de 3 a 5 minutos por respuesta; en ARM64 (DGX Spark) se indica "unos pocos tokens por segundo". El consumo de memoria medido tras tres preguntas fue de 14,3 GB en ARM64 y 10,0 GB en x86-64, con unos 5,4 GB correspondientes a ficheros mapeados en memoria.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es exclusivamente en CPU.
- Memoria RAM: planificar 14 GiB con los valores por defecto (contexto 32.768, dos peticiones concurrentes); con `context_tokens: 8192` se midió aproximadamente 11 GiB en ARM64.
- Disco: 6,49 GiB para el ZIP, 6,51 GiB extraído (581 ficheros); 13,25 GiB si se conserva el ZIP junto a la carpeta extraída; 270 MB adicionales en `state/` tras `setup.sh`.
- GPU recomendadas: no aplica; el sistema no usa GPU. Las pruebas se realizaron en una NVIDIA DGX Spark (ARM64, 20 núcleos) y en una máquina x86-64 de 8 núcleos.
- ¿Cabe en GPU de consumo? No aplica, al ser inferencia CPU.
- Sistema operativo: Linux con glibc 2.38 o superior (Ubuntu 24.04, Debian 13, Fedora 39 o posteriores).
- Opciones de despliegue: scripts propios (`verify.sh`, `setup.sh`, `run.sh`, `stop.sh`) sobre llama.cpp b12318 y MPN Studio 0.6.0; también `core_mode: endpoint` contra un llama-server externo en 127.0.0.1.
- Latencia y throughput: de 3 a 5 minutos por respuesta en 8 núcleos x86-64; unos pocos tokens por segundo en DGX Spark.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Inferencia | Licencia | Formato |
|---|---|---|---|---|---|
| Yaob Next (C4B-N10K) 1.0.0 | 4.000 M (núcleo) + 3,1 M (router) | 32.768 | Solo CPU | composite-see-licenses | GGUF + FG-MPN |
| Qwen3.5-4B (núcleo original) | 4.000 M | no disponible | CPU/GPU | no disponible en esta ficha | GGUF, safetensors |
| Qwen3-Embedding-0.6B (encoder incluido) | 600 M | no disponible | CPU/GPU | no disponible en esta ficha | GGUF F16 |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de Yaob Next con alternativas de la misma categoría. La comparación relevante es de naturaleza distinta: Yaob Next no compite en calidad de generación, sino en empaquetado reproducible y verificación de citas frente a montajes manuales de RAG con llama.cpp y un encoder de recuperación.

## Limitaciones y advertencias

- El núcleo Qwen3.5-4B no está entrenado por fylume y solo se distribuye en Q8_0; no hay otras cuantizaciones disponibles en el paquete.
- La sustitución del núcleo no está validada: con Qwen3-4B-Instruct-2507 Q8_0, la pregunta sobre una localidad inventada devolvió el texto crudo `mpn_search("Zorblax Quimperton")` en lugar de una respuesta.
- Rendimiento muy bajo: de 3 a 5 minutos por respuesta en CPU de 8 núcleos, inviable para interacción en tiempo real.
- Licencia compuesta (`composite-see-licenses`): las condiciones de uso comercial dependen de las licencias de cada componente empaquetado y deben revisarse antes de un despliegue productivo.
- Idiomas soportados no documentados en la información disponible.
- Dependencia estricta de glibc 2.38 o superior y de Linux; no hay soporte para macOS ni Windows en la información proporcionada.
- Riesgo de alucinación mitigado solo parcialmente: el sistema rechaza responder cuando no encuentra respaldo en los nodos, pero la cobertura depende de la red N10K (10.007 nodos validados), no de conocimiento general.
- El consumo de memoria (14 GiB recomendados) y de disco (hasta 13,25 GiB conservando el ZIP) pueden ser limitantes en máquinas modestas.
- El paquete registra 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/fylume/yaob-n10k-c4b
- Paquete descargable: https://huggingface.co/fylume/yaob-next-c4b-n10k/resolve/main/yaob-next-c4b-n10k-1.0.0.zip
- Núcleo: https://huggingface.co/fylume/qwen3.5-4b-q8_0-gguf
- Encoder: https://huggingface.co/fylume/qwen3-embedding-0.6b-f16-gguf
- Red N10K: https://huggingface.co/fylume/yaob-next-n10k
- Manifiesto de emparejamiento: https://huggingface.co/fylume/yaob-next-n10k-c4b
