# hongcoding/perch-gpu

## Resumen

`hongcoding/perch-gpu` no es un modelo de lenguaje, sino una biblioteca de utilidades escrita en Rust para acelerar la inferencia local de LLM a través de Ollama. Forma parte del ecosistema del proyecto Perch, un espacio de trabajo de IA local para macOS, y se distribuye con licencia MIT. Su propósito es resolver tres problemas concretos que degradan la experiencia de inferencia local: la especificación manual de capas GPU (`num_gpu`), que provoca recargas del runner; la descarga silenciosa del modelo de la VRAM tras periodos de inactividad; y la contención de memoria cuando se ejecutan varias peticiones concurrentes en una sola GPU.

La biblioteca se organiza en tres módulos —`status`, `warmup` y `scheduler`— que respectivamente consultan el estado real de residencia en VRAM mediante el endpoint `/api/ps` de Ollama, realizan una precarga con `keep_alive` para mantener el modelo caliente, y serializan las peticiones locales para evitar competencia por la memoria de vídeo. Según las mediciones del autor en Apple Silicon con backend Metal, el tiempo hasta el primer token pasa de 3-5 segundos en frío a 0,04-0,18 segundos con el modelo residente.

Es relevante para desarrolladores que despliegan LLM en hardware de consumo y necesitan latencias predecibles sin recurrir a infraestructura en la nube. No incluye pesos de modelo, tokenizador ni arquitectura de red neuronal alguna: es infraestructura de orquestación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; biblioteca Rust de orquestación para Ollama) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (depende del modelo servido por Ollama; en el ejemplo de la model card, 4096 tokens) |
| Tipos de cuantizacion | no disponible (delegado en Ollama y en el modelo cargado) |
| Idiomas soportados | zh, en (documentación y etiquetas del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (no contiene pesos; el ejemplo usa un modelo `qwen3-06b:latest` servido por Ollama) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: `perch-gpu` es una caja de herramientas en Rust, no una red neuronal entrenada. Su arquitectura software se compone de tres módulos con responsabilidades separadas. `status` consulta el endpoint `/api/ps` de Ollama en `http://127.0.0.1:11434` y calcula el porcentaje de residencia en GPU a partir de los bytes reales reportados por el servidor, no de estimaciones. `warmup` envía una petición de precarga con un parámetro `keep_alive` configurable (por ejemplo `"30m"`) y deliberadamente omite `num_gpu` para no forzar la recarga del runner. `scheduler` implementa un control de concurrencia que limita a 1 las inferencias locales simultáneas y deja la concurrencia configurable para despliegues en la nube.

El diseño declara cuatro "líneas rojas": nunca enviar `num_gpu`, basar el diagnóstico en bytes reales de `/api/ps`, no alterar la semántica de las peticiones (modelo, prompt, nivel de razonamiento o longitud de respuesta) al programar, y restringir los prompts de precarga a la interfaz loopback sin incorporarlos al historial de conversación. El autor indica que la suite `cargo test` incluye 7 pruebas unitarias y 1 prueba de documentación, que cubren el cálculo de residencia real, la caída a CPU, el caso sin modelos cargados, la ausencia de `num_gpu` en el cuerpo de precarga, la serialización de la concurrencia y la invalidación de caché.

## Capacidades

- Consulta del estado real de VRAM ocupada por cada modelo cargado en Ollama, con porcentaje de residencia calculado sobre bytes reportados por `/api/ps`.
- Precarga de modelos con `keep_alive` configurable para evitar la descarga por inactividad y reducir el tiempo hasta el primer token.
- Serialización de inferencias locales mediante un semáforo (concurrencia 1 por defecto) para prevenir contención de VRAM y errores OOM.
- Control de concurrencia diferenciado para despliegues locales y remotos.
- Caché de metadatos con invalidación, según las pruebas descritas en la model card.
- Integración como dependencia de Cargo mediante referencia Git al repositorio de Hugging Face.
- Compatibilidad con backends Metal y CUDA a través de la selección automática que realiza Ollama.
- No ofrece generación de texto, razonamiento, código, visión ni tool calling por sí misma: esas capacidades dependen del modelo servido por Ollama.

## Casos de uso

- Asistentes de escritorio con latencia interactiva: en una aplicación macOS que conversa con un modelo local, `warmup` mantiene el modelo residente y reduce el primer token a 0,04-0,18 s, lo que hace viable la sensación de respuesta inmediata sin llamadas a la nube.
- Diagnóstico de despliegues locales: `status` permite verificar si Ollama está ejecutando realmente en GPU o si ha caído a CPU, leyendo la residencia real en lugar de inferirla, lo que acelera la resolución de problemas de rendimiento.
- Servicios de un solo usuario con GPU de consumo: `scheduler` con concurrencia 1 evita que dos peticiones simultáneas compitan por la VRAM de una única tarjeta y provoquen OOM o ralentizaciones mutuas.
- Backends de herramientas de desarrollo: integrado en un IDE o CLI que invoca el modelo de forma intermitente, la combinación de `keep_alive` y cola de peticiones mantiene la latencia estable durante toda la sesión de trabajo.
- Prototipado de agentes locales: al garantizar que el modelo permanece cargado entre pasos, se reducen las pausas de varios segundos que rompen los flujos multi-paso ejecutados en bucle.
- Evaluación comparativa de modelos en local: la consulta de residencia y el control de concurrencia permiten medir latencias de forma reproducible al alternar entre modelos sin que la descarga por inactividad contamine los resultados.
- Automatización de pruebas de regresión de latencia: los valores de primer token en frío y en caliente pueden registrarse en CI para detectar regresiones de rendimiento tras cambios en la configuración de Ollama.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son mediciones de latencia hasta el primer token en Apple Silicon con backend Metal, usando un modelo de 0,6B (`qwen3-06b:latest`) con 0,37 GB de residencia en VRAM y contexto de 4096 tokens.

| Estado | Tiempo hasta el primer token |
|---|---|
| Carga en frío (modelo descargado de VRAM) | 3 - 5 s |
| Residente en caliente (precarga + keep_alive) | 0,04 - 0,18 s |

El autor cifra la mejora en 20-70 veces, con un coste de aproximadamente 0,4 GB de VRAM ocupada por el modelo de 0,6B. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) porque la biblioteca no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM: la biblioteca no consume VRAM por sí misma; el consumo corresponde al modelo servido por Ollama. En el ejemplo documentado, un modelo de 0,6B ocupa 0,37 GB.
- GPU: compatible con cualquier backend que Ollama seleccione automáticamente, incluidos Metal (Apple Silicon) y CUDA (NVIDIA). No se especifican modelos concretos de GPU.
- GPU de consumo: sí, siempre que el modelo cargado quepa en la VRAM disponible; el ejemplo de 0,6B cabe en cualquier iGPU o dGPU moderna.
- Despliegue: requiere un servidor Ollama accesible (por defecto en `http://127.0.0.1:11434`) y un proyecto Rust con Cargo. No se documentan integraciones con vLLM, llama.cpp directo, TGI ni Ollama como imagen independiente.
- Latencia y throughput: primer token de 0,04-0,18 s en caliente y 3-5 s en frío según el autor; no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

No disponible. `perch-gpu` es una biblioteca de utilidades y no un modelo de lenguaje, por lo que no existen alternativas equivalentes documentadas en la información proporcionada. Las herramientas del mismo espacio problemático (gestión de `keep_alive` y concurrencia en Ollama) no se detallan en la model card.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni ofrece capacidades cognitivas; cualquier evaluación de calidad debe hacerse sobre el modelo que sirva Ollama.
- Dependencia fuerte de la API de Ollama (`/api/ps` y el parámetro `keep_alive`); cambios en esa API pueden romper el comportamiento de `status` y `warmup`.
- Las mediciones de latencia proceden de un único entorno (Apple Silicon con Metal) y de un modelo de 0,6B; no hay datos para CUDA, GPU discretas ni modelos de mayor tamaño.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-05), lo que indica ausencia de validación por parte de la comunidad.
- La documentación está mayoritariamente en chino, con etiquetas en inglés; no hay documentación en castellano.
- Licencia MIT: permite uso comercial y modificación con atribución, sin restricciones adicionales conocidas.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas propias, al no tratarse de un modelo generativo.
- El ejemplo de instalación usa una referencia Git a Hugging Face en lugar de un paquete publicado en crates.io, lo que implica que no hay versionado semántico ni garantías de estabilidad de la API.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hongcoding/perch-gpu
- Aplicación Perch (macOS): https://huggingface.co/datasets/hongcoding/perch
- Framework perch-ultrafast: https://huggingface.co/hongcoding/perch-ultrafast
- Colección completa del proyecto: https://huggingface.co/collections/hongcoding/perch-ai-workbench-and-ultrafast-framework
