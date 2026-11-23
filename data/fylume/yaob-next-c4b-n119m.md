# fylume/yaob-next-c4b-n119m

## Resumen

Yaob Next (C4B-N119M) 1.0.0 es un paquete autocontenido distribuido por el usuario fylume que combina un núcleo cognitivo de 4.000 millones de parámetros con una red de 119.733.309 nodos (119.176.842 validados) almacenada en un formato propio denominado FG-MPN. El núcleo (C4B) es Qwen3.5-4B de Alibaba Cloud, sin modificar, convertido a GGUF y cuantizado únicamente a Q8_0; el autor declara explícitamente que no lo ha entrenado y que puede sustituirse. La red (N119M) es un almacén de solo lectura que se lee en su sitio, sin codificador de recuperación ni componente aprendido por Fylume.

El paquete se distribuye como un único ZIP64 de 45.460.424.688 bytes (42,34 GiB) que contiene el núcleo, el proyector de visión F16, la red en dos formatos, el runtime MPN Studio 0.6.0 y llama.cpp b12318 compilado para CPU en linux-x86_64 y linux-aarch64. Tras la extracción, los scripts `setup.sh` y `run.sh` levantan un endpoint compatible con la API de OpenAI en `127.0.0.1:8861`. La inferencia es exclusivamente en CPU y no requiere Python, root ni conexión a Internet después de la descarga.

La relevancia del proyecto es fundamentalmente de ingeniería de empaquetado y verificación: registro de hashes, arranque reproducible y aislamiento de red comprobado con `strace`. No obstante, la documentación del autor reconoce que x86-64 no se probó para este paquete concreto y que un script de pruebas adicional terminó con código de salida 1 en su última aserción sin causa investigada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Núcleo transformer denso (Qwen3.5-4B) + red de nodos FG-MPN de solo lectura; sin componente aprendido en la red |
| Parametros totales | 4.000 millones en el núcleo; red de 119.733.309 nodos (119.176.842 validados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens por defecto (configurable; el autor sugiere reducirlo si falta memoria) |
| Tipos de cuantizacion | Q8_0 únicamente para el núcleo; proyector de visión en F16 |
| Idiomas soportados | No disponible (no declarados en la model card) |
| Licencia | `composite-see-licenses` (etiqueta `other`; licencia compuesta, ver aviso) |
| Formato de pesos | GGUF (núcleo y proyector); FG-MPN 0.2.2 para la red; runtime en `.deb` |
| Tamano del paquete | ZIP de 45.460.424.688 bytes (42,34 GiB); extraído 45.482.830.343 bytes en 864 ficheros |
| Memoria en ejecución | 16,5 GB medidos (contexto 32.768, dos peticiones concurrentes, ARM64 CPU); `ram_bytes_min` declarado: 10 GiB |
| Plataformas | Linux con glibc >= 2.38 (Ubuntu 24.04, Debian 13, Fedora 39 o superior); x86-64 y ARM64 |
| Inferencia | Solo CPU (llama.cpp b12318) |

## Arquitectura y entrenamiento

El paquete no entrena ningún modelo. El núcleo es Qwen3.5-4B de Alibaba Cloud, tomado sin modificar del repositorio `fylume/qwen3.5-4b-q8_0-gguf` (pin `57aa17950537`), convertido a GGUF y cuantizado a Q8_0, con un proyector de visión F16 de 672.423.488 bytes. Sobre él se acopla una red de 119.733.309 nodos en un almacén FG-MPN de solo lectura (`fylume/yaob-origin-n119m`, pin `f34b0db6fdcd`, 39.855.423.467 bytes en 329 ficheros) que se lee en su sitio sin copiarse a disco. No hay codificador de recuperación ni ningún componente entrenado por Fylume en este paquete; la selección de nodos la realiza el router de MPN Studio 0.6.0.

El empaquetado se genera con el comando `package import` de MPN Studio 0.6.0 y se verifica contra 327 hashes registrados en `manifest.json` (esquema `fylume-package/1`), con un listado completo en `checksums.sha256`. El ZIP es ZIP64 y los ficheros de modelo y red se almacenan sin comprimir, de modo que la extracción es una copia directa. El núcleo es intercambiable mediante el ajuste correspondiente en `config/yaob.json`, apuntando a otro GGUF o a cualquier servidor compatible con OpenAI, sin tocar el directorio `mpn/`.

## Capacidades

- Generación de texto y respuesta a preguntas con citas: cada respuesta incluye un campo `yaob` con los nodos leídos y las citas verificadas.
- Recuperación sobre una red de 119 millones de nodos leída en su sitio, sin copia local.
- Declinación explícita cuando la pregunta no está cubierta por la red: en las pruebas, ante un pueblo inventado, el sistema rechazó responder sin cita.
- Procesamiento de visión a través del proyector F16 incluido en el paquete (Qwen3.5-4B es multimodal en origen).
- Servicio mediante endpoint compatible con la API de OpenAI (`/v1/chat/completions`) en `127.0.0.1:8861`.
- Sustitución del núcleo por otro GGUF o por un servidor compatible con OpenAI, manteniendo la red intacta.
- Funcionamiento completamente offline tras la descarga, con aislamiento de red verificado mediante `strace -f` (solo `127.0.0.1` y el socket local de resolución de nombres).
- Soporte de tool calling, agentes, razonamiento multi-paso o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Asistente de consulta documental con trazabilidad: el sistema devuelve, junto a cada respuesta, los nodos leídos y las citas comprobadas, lo que permite auditar el origen de cada afirmación en entornos donde la verificabilidad es requisito.
- Despliegue en máquinas sin GPU: al ejecutarse solo en CPU con 16,5 GB de memoria medida, encaja en servidores ARM64 como el DGX Spark empleado en las pruebas o en estaciones de trabajo x86-64 sin acelerador.
- Entornos aislados o air-gapped: tras la descarga, el paquete no abre conexiones externas (verificado con `strace`), lo que lo hace apto para instalaciones sin salida a Internet.
- Sustitución del núcleo según la tarea: al ser el núcleo un GGUF intercambiable desde `config/yaob.json`, se puede cambiar Qwen3.5-4B por otro modelo (el autor probó Qwen3-4B-Instruct-2507) sin alterar la red ni el router.
- Verificación de integridad en pipelines: `verify.sh` comprueba 863 ficheros contra los hashes registrados en 27 segundos (medición en ARM64), lo que permite integrar la comprobación en un proceso de despliegue automatizado.
- Prototipado de arquitecturas de recuperación basadas en grafo: la red FG-MPN de solo lectura y su router sirven como banco de pruebas para evaluar recuperación sobre 119 millones de nodos sin reindexar ni copiar el almacén.
- Evaluación de empaquetado reproducible: el par `manifest.json` + `checksums.sha256` y el registro en MPN Studio permiten estudiar flujos de distribución de modelos con procedencia verificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta mediciones de proceso: extracción del ZIP en 171 s (864 ficheros), `verify.sh` sobre 863 ficheros en 27 s, `setup.sh` en 9 s, `run.sh` listo en 6 s y 16,5 GB de memoria residente total tras tres preguntas en ARM64 CPU. No hay datos de MMLU, HumanEval, GSM8K ni de latencia o throughput por token.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es exclusivamente en CPU y el paquete solo incluye runtime de CPU.
- Memoria RAM: 16,5 GB medidos con contexto de 32.768 y dos peticiones concurrentes; el manifiesto declara `ram_bytes_min` de 10 GiB, estimación previa a la medición. El autor recomienda planificar 16 GiB o reducir `context_tokens`.
- Disco: 42,36 GiB extraídos; 84,70 GiB si se conserva el ZIP junto a la carpeta extraída; 42,36 GiB si se descarga en streaming hacia el extractor o se borra el ZIP.
- CPU: probado en ARM64 (NVIDIA DGX Spark, Ubuntu 24.04, glibc 2.39, 20 núcleos) y en un host x86-64 no identificado en la documentación; x86-64 no se probó para este paquete concreto.
- GPU recomendadas: no disponible; no se probó ninguna GPU con este paquete.
- Cabe en GPU de consumo: no disponible (el paquete no incluye runtime de GPU).
- Opciones de despliegue: MPN Studio 0.6.0 con llama.cpp b12318 (CPU) para linux-x86_64 y linux-aarch64, más ruedas FG-MPN 0.2.2; también se probó un `llama-server` externo como núcleo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Yaob Next (C4B-N119M) | 4.000 M (núcleo) + red de 119,7 M de nodos | 32.768 | `composite-see-licenses` | GGUF + FG-MPN, paquete ZIP de 42,34 GiB | Hugging Face (repo `fylume/yaob-next-c4b-n119m`) |
| Qwen3.5-4B (núcleo original) | 4.000 M | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | Referenciado como `fylume/qwen3.5-4b-q8_0-gguf` |
| Qwen3-4B-Instruct-2507 (núcleo alternativo probado) | 4.000 M | No disponible en esta ficha | No disponible en esta ficha | GGUF | Usado por el autor como sustituto del núcleo |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada; la comparación se limita a parámetros, formato y disponibilidad.

## Limitaciones y advertencias

- Licencia compuesta (`composite-see-licenses`, etiqueta `other`): las condiciones de uso comercial no están detalladas en la información disponible y deben consultarse en los términos de cada componente (núcleo Qwen, red FG-MPN y runtime).
- Inferencia solo en CPU: no hay runtime de GPU, Windows ni macOS; requiere Linux con glibc >= 2.38.
- x86-64 no se probó para este paquete: el ZIP de 45 GB no pudo extraerse en las máquinas x86-64 disponibles; solo se validó el mismo runtime y scripts en el paquete N10K.
- Un script de pruebas adicional terminó con código de salida 1 en su última aserción (`verify.sh --quick` imprimió `MISSING` con nombre de fichero vacío) y la causa no se investigó.
- No se probó la descarga desde Hugging Face ni la extracción de esa descarga; el ZIP se validó desde una copia local de los mismos bytes.
- No se probaron distribuciones Linux distintas de Ubuntu 24.04 (ARM64) ni versiones de glibc anteriores a 2.38; tampoco x86-64 con glibc entre 2.38 y 2.41 (un módulo Python opcional del backend x86-64).
- La red es de solo lectura y no aprendida: la cobertura de conocimiento queda fijada por los 119.176.842 nodos validados; las preguntas fuera de cobertura se declinan en lugar de responderse.
- Riesgo de alucinación del núcleo: aunque el sistema adjunta citas y rechazó una pregunta sobre un pueblo inventado en las pruebas, no se documenta una evaluación sistemática de tasa de alucinación.
- Sesgos: no documentados en la información disponible.
- Idiomas soportados: no declarados; dependen del núcleo Qwen3.5-4B, sin lista publicada en esta ficha.
- El repositorio no era público cuando se redactó la model card y el modelo registra 0 descargas y 0 likes, por lo que no existe validación independiente por terceros.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/fylume/yaob-next-c4b-n119m
- Descarga directa del ZIP: https://huggingface.co/fylume/yaob-next-c4b-n119m/resolve/main/yaob-next-c4b-n119m-1.0.0.zip
- Núcleo GGUF: https://huggingface.co/fylume/qwen3.5-4b-q8_0-gguf
- Red FG-MPN: https://huggingface.co/fylume/yaob-origin-n119m
- Paper, blog, repositorio de código y demo: no disponible
