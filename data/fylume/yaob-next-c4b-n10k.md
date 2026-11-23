# fylume/yaob-next-c4b-n10k

## Resumen

Yaob Next (C4B-N10K) 1.0.0 es un paquete distribuido por fylume en Hugging Face que integra un núcleo cognitivo de 4 mil millones de parámetros, un codificador de recuperación y una red de nodos con router entrenado, todo empaquetado en un único ZIP de 6,49 GiB para ejecución offline en Linux x86-64 y ARM64. El núcleo C4B corresponde a Qwen3.5-4B de Alibaba Cloud, sin entrenamiento adicional por parte de fylume, convertido a GGUF y cuantizado exclusivamente a Q8_0, e incluye un proyector visual F16. La parte N10K es una red de 10.167 nodos (10.007 validados más 160 canarios de diagnóstico inventados) con un router de 3,1 millones de parámetros, que es el único componente aprendido por fylume.

El paquete se registra y construye mediante `package import` de MPN Studio 0.6.0 y expone un endpoint compatible con OpenAI en `127.0.0.1:8861` tras ejecutar `scripts/setup.sh` y `scripts/run.sh`. La inferencia es exclusivamente en CPU mediante llama.cpp b12318, sin requisito de Python ni conexión a Internet después de la descarga, y con verificación de integridad mediante SHA-256 y `checksums.sha256`.

Su relevancia radica en la propuesta de despliegue completamente offline y autocontenido, con recuperación aumentada sobre una red de nodos y citación verificada en las respuestas. No obstante, el rendimiento medido es muy bajo en CPU (de 3 a 5 minutos por respuesta en una máquina x86-64 de 8 núcleos, unos pocos tokens por segundo en DGX Spark) y el propio autor advierte que el cambio de núcleo no está validado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Núcleo transformer (Qwen3.5-4B) más red de nodos MPN con router; runtime llama.cpp |
| Parámetros totales | 4 mil millones (núcleo C4B) más 3,1 millones (router); total del paquete no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por defecto (configurable, p. ej. 8.192) |
| Tipos de cuantización | Q8_0 (núcleo); F16 (proyector visual y codificador Qwen3-Embedding-0.6B) |
| Idiomas soportados | no disponible |
| Licencia | composite-see-licenses (license: other) |
| Formato de pesos | GGUF (núcleo y codificador); FG-MPN y store de Studio para la red |

## Arquitectura y entrenamiento

El sistema combina tres piezas: un núcleo generativo Qwen3.5-4B en GGUF Q8_0 con proyector visual F16 (4.610.580.384 + 672.423.488 bytes), un codificador de recuperación Qwen3-Embedding-0.6B en F16 (1.197.629.728 bytes) y una red de 10.167 nodos en dos formatos (FG-MPN `store/` y store de Studio más router, 166.747.754 bytes en 37 archivos). El router de 3,1 millones de parámetros es el único componente entrenado por fylume; el núcleo y el codificador se distribuyen sin modificación ni entrenamiento adicional por su parte.

El paquete se construye con `package import` de MPN Studio 0.6.0 y se ejecuta con llama.cpp b12318 (CPU) para linux-x86_64 y linux-aarch64, junto con wheels FG-MPN 0.2.2. El manifiesto de emparejamiento (`fylume/yaob-next-n10k-c4b`) fija los valores por defecto probados, y `manifest.json` (esquema `fylume-package/1`) registra cada pin, hash y tamaño. No se detallan en la información disponible los datos de entrenamiento del router (número de tokens, composición del dataset, uso de RLHF o DPO).

## Capacidades

- Generación de texto y respuesta a preguntas con recuperación aumentada sobre la red de nodos.
- Citación verificada: las respuestas incluyen un campo `yaob` con los nodos leídos y las citas comprobadas.
- Rechazo de consultas sobre entidades inventadas (probado con un pueblo ficticio: declina responder y no cita).
- Visión: el paquete incluye proyector visual F16, aunque no se detallan las capacidades visuales validadas.
- Endpoint compatible con OpenAI (`/v1/chat/completions`) para integración con clientes existentes.
- Ejecución completamente offline tras la descarga, sin Python ni Internet.
- Intercambio de núcleo configurable (`core_mode: gguf` o `core_mode: endpoint`) sin tocar `mpn/`.
- No se documentan tool calling, function calling, agentes multi-paso ni capacidades multilingües explícitas.

## Casos de uso

- Asistente de consulta documental offline: el codificador Qwen3-Embedding-0.6B y la red de nodos permiten responder con citas verificadas sobre un corpus local, adecuado para entornos sin conectividad.
- Despliegue en estaciones de trabajo aisladas: el ZIP autocontenido y la ausencia de dependencias de red tras la descarga facilitan su uso en instalaciones con requisitos estrictos de confidencialidad.
- Verificación de integridad en pipelines: `scripts/verify.sh` y `checksums.sha256` permiten validar 580 archivos antes de arrancar el servicio, útil en flujos de aprovisionamiento automatizado.
- Integración con clientes OpenAI existentes: el endpoint en `127.0.0.1:8861` acepta peticiones con el esquema estándar, lo que simplifica la conexión de herramientas ya desarrolladas.
- Experimentación con recuperación y enrutamiento: el router de 3,1 millones de parámetros y los 10.167 nodos permiten estudiar el comportamiento de selección de nodos y citación en un entorno reproducible.
- Pruebas de sustitución de núcleo: la configuración `core_mode` permite comparar Qwen3.5-4B con otros GGUF o servidores compatibles, aunque el autor advierte que el cambio no está validado.
- Diagnóstico de robustez: los 160 canarios inventados sirven para comprobar que el sistema declina responder ante entidades ficticias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Datos de rendimiento medidos por el autor (no benchmarks de calidad):

| Métrica | Valor |
|---|---|
| Memoria en ejecución (contexto 32.768, dos peticiones concurrentes, ARM64) | 14,3 GB |
| Memoria en ejecución (misma configuración, x86-64) | 10,0 GB |
| Memoria con contexto 8.192 (medición anterior, ARM64) | ~11 GB |
| Latencia por respuesta (x86-64, 8 núcleos, carga 15-20) | 3 a 5 minutos |
| Throughput (DGX Spark, CPU) | unos pocos tokens por segundo |
| Extracción del ZIP (ARM64, Info-ZIP 6.00) | 25 s, 581 archivos |
| `verify.sh` (ARM64) | 580 archivos en 4 s |
| `setup.sh` (ARM64) | 36 s |
| `run.sh` hasta estar listo (ARM64) | 5 s |

## Requisitos de hardware

- VRAM: no aplica; la inferencia es exclusivamente en CPU.
- Memoria RAM estimada: planificar 14 GiB con los valores por defecto (contexto 32.768, dos peticiones concurrentes); unos 11 GiB con contexto 8.192 en ARM64.
- GPU recomendadas: no aplica; no se documenta soporte GPU en la información disponible.
- CPU: Linux con glibc 2.38 o superior (Ubuntu 24.04, Debian 13, Fedora 39 o posterior); probado en ARM64 (DGX Spark, 20 núcleos) y x86-64 (8 núcleos).
- Cabe en hardware consumer: sí, siempre que se cumplan los requisitos de RAM y glibc; no se especifican modelos concretos de CPU consumer.
- Almacenamiento: 6,49 GiB para el ZIP, 6,51 GiB extraído (581 archivos); 6,76 GiB si se elimina el ZIP tras extraer; 13,25 GiB si se conserva junto a la carpeta extraída.
- Opciones de despliegue: runtime propio del paquete (llama.cpp b12318 CPU más backend MPN Studio 0.6.0), endpoint compatible con OpenAI; también `core_mode: endpoint` con un llama-server separado en 127.0.0.1. No se documenta compatibilidad con vLLM, Ollama o TGI.
- Latencia y throughput: ver tabla de benchmarks; muy baja, con 3 a 5 minutos por respuesta en el equipo x86-64 de pruebas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Yaob Next (C4B-N10K) | 4 mil millones (núcleo) más 3,1 millones (router) | 32.768 | composite-see-licenses | Hugging Face, ZIP offline | CPU only; recuperación con citas; latencia de minutos |
| Qwen3.5-4B (núcleo original) | 4 mil millones | no disponible | no disponible | no disponible | Base sin modificar incluida en el paquete |
| Qwen3-Embedding-0.6B | 0,6 mil millones | no disponible | no disponible | no disponible | Codificador de recuperación incluido en el paquete |

No se dispone de datos de benchmarks ni de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Inferencia exclusivamente en CPU: latencias de 3 a 5 minutos por respuesta en el equipo x86-64 probado y unos pocos tokens por segundo en DGX Spark.
- El cambio de núcleo (`core_mode: gguf` con Qwen3-4B-Instruct-2507 Q8_0) no está validado: en la prueba, la pregunta sobre una entidad inventada devolvió el texto en bruto `mpn_search("Zorblax Quimperton")` en lugar de una respuesta.
- Licencia compuesta (`composite-see-licenses`, `license: other`): deben revisarse las licencias de cada componente antes de uso comercial; no se detallan restricciones concretas.
- Idiomas soportados no documentados.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: mitigado parcialmente por la citación verificada y el rechazo de entidades inventadas, pero no se documentan tasas de error.
- Requisito de glibc 2.38 o superior y de Linux; no se documenta soporte para macOS o Windows.
- El paquete no incluye Python; el runtime se distribuye como `.deb` y binarios para linux-x86_64 y linux-aarch64.
- Solo 37 archivos de la red y 581 archivos en total; el router es el único componente entrenado por fylume, lo que limita el alcance de la personalización.
- El rendimiento medido corresponde a un entorno con carga compartida de 15 a 20, lo que puede no reflejar un despliegue dedicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fylume/yaob-next-c4b-n10k
- Núcleo Qwen3.5-4B Q8_0 GGUF: https://huggingface.co/fylume/qwen3.5-4b-q8_0-gguf
- Codificador Qwen3-Embedding-0.6B F16 GGUF: https://huggingface.co/fylume/qwen3-embedding-0.6b-f16-gguf
- Red N10K: https://huggingface.co/fylume/yaob-next-n10k
- Manifiesto de emparejamiento: https://huggingface.co/fylume/yaob-next-n10k-c4b
- Descarga directa del ZIP: https://huggingface.co/fylume/yaob-next-c4b-n10k/resolve/main/yaob-next-c4b-n10k-1.0.0.zip
