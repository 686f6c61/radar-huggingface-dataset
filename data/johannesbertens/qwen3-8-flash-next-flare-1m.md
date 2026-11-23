# JohannesBertens/Qwen3.8-Flash-Next-FLARE-1M

## Resumen

Qwen3.8-Flash-Next-FLARE-1M es un paquete de ejecución preparado para el motor de inferencia Flare (HyperFlare, de NVIDIA) a partir del modelo multimodal Qwen3.8-Flash-Next en su variante cuantizada FP4 publicada por NVIDIA (`nvidia/Qwen3.8-Flash-Next-FP4-Local`, revisión `b9ce18a6`). Lo publica el usuario JohannesBertens y su aportación principal no es un nuevo entrenamiento, sino la extensión de la ventana de servicio desde los 262.144 tokens nativos hasta 1.048.576 tokens (1M) mediante interpolación de RoPE tipo YaRN (factor 4×, solo frecuencia, sin cambio de temperatura de atención), precalculada en las tablas rotatorias del paquete en tiempo de preparación. El checkpoint subyacente no se modifica: `config.json` sigue con `rope_type: default` y ningún kernel en tiempo de ejecución sabe que hubo interpolación.

El paquete está orientado a despliegue en una única GPU Blackwell de arquitectura GB202 (RTX PRO 6000 Blackwell, SM120), con concurrencia 8 y decodificación especulativa MTP de 5 tokens de borrador activa. Incluye además un paquete hermano TP2 (dos GPU) con mayor caché KV y concurrencia 32. Requiere una versión concreta del motor Flare (ABI de ejecución 6 / contrato de modelo preparado 2, commit `6b586398` o posterior); motores anteriores lo rechazan en la fase de preparación. Es relevante ahora porque demuestra un patrón de despliegue de contexto extremo sobre hardware de una sola tarjeta profesional, sin Python en el servicio y con el coste de memoria del compilador convertido íntegramente en caché KV.

La licencia es la NVIDIA Open Model License, heredada del modelo base, y el repo ocupa 506,6 GB. El pipeline declarado es image-text-to-text, por lo que el modelo conserva capacidades multimodales de entrada de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con decodificación especulativa MTP; paquete de ejecución Flare con RoPE YaRN 4× precalculado |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens en servicio (nativo del checkpoint: 262.144) |
| Tipos de cuantizacion | FP4 (NVFP4) y MXFP8 en el paquete preparado; pesos empaquetados en un único safetensors |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (`license: other`) |
| Formato de pesos | safetensors empaquetado para Flare (payload en la revisión `gb202`); no es un checkpoint estándar cargable por transformers |
| Tamaño del repositorio | 506,6 GB |
| Hardware de preparación/replay | GB202 (RTX PRO 6000 Blackwell, SM120); 1 GPU en TP1 |
| Concurrencia máxima | 8 peticiones simultáneas |
| Caché KV medida al cargar | 20,1 GiB · 1.445.888 tokens KV · 157 slots de snapshot compartido |
| Plan de dispositivo compilado | 73,4 GiB (87 asignaciones) |
| Grafos CUDA capturados | 84 |
| Motor requerido | Flare `6b586398` (2026-11-22) o posterior, ABI 6 |
| Descargas / likes | 213 / 4 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-Flash-Next, publicado por NVIDIA en formato FP4 local, con pipeline image-text-to-text y capacidad de contexto nativo de 262.144 tokens. El paquete FLARE no reentrena ni modifica los pesos: reexporta el checkpoint con las tablas rotatorias de RoPE interpoladas por frecuencia (estilo YaRN, factor 4×) incrustadas en la declaración del paquete, de modo que la extensión a 1M es transparente para el motor en tiempo de ejecución. La decodificación especulativa MTP con 5 tokens de borrador está activa en ambos paquetes (TP1 y TP2).

La innovación técnica del paquete es de infraestructura más que de modelado: la cadena de herramientas de "almacenamiento propiedad del compilador" reduce el plan de dispositivo a 73,4 GiB con 87 asignaciones y 84 grafos CUDA capturados, liberando 1,7 GiB por GPU respecto al paquete ABI 5 anterior (18,4 GiB · 1.314.816 tokens KV), ahorro que se convierte uno a uno en caché KV adicional. El paquete exige replay sobre la misma arquitectura de GPU en la que se preparó (GB202) y no necesita Python ni descarga de modelo adicional para servir; las dependencias de preparación (FlashInfer, cabeceras liburing, toolkit CUDA) no son necesarias en inferencia. No se dispone de información sobre número de tokens de entrenamiento, composición del dataset ni fases de RLHF/DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento de propósito general heredados de Qwen3.8-Flash-Next (sin datos de benchmark publicados en el paquete).
- Entrada de imagen junto con texto (pipeline image-text-to-text), lo que permite preguntas sobre imágenes y documentos escaneados.
- Procesamiento de contexto extremo: hasta 1.048.576 tokens por petición en el paquete TP1, con caché KV de 1.445.888 tokens y 157 slots de snapshot compartido, suficiente para aproximadamente una conversación de contexto completo más historial.
- Decodificación especulativa MTP con 5 tokens de borrador, que acelera la generación autoregresiva.
- Servicio sin Python: el binario Flare carga el paquete empaquetado directamente.
- Prefijo de caché en host de 256 GB y tablas de embedding en RAM de host, lo que permite reutilizar prefijos largos entre peticiones.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Análisis de repositorios completos: con 1M tokens de contexto se puede cargar un árbol de código extenso (decenas de miles de líneas) junto con su documentación y realizar preguntas de arquitectura o auditoría sin trocear el material. El paquete TP1 sirve una conversación de contexto completo a la vez, adecuado para sesiones de análisis profundas de un único usuario.
- Revisión de contratos y expedientes legales: ingerir cientos de páginas de documentación legal en una sola petición y extraer cláusulas, contradicciones o referencias cruzadas. La ventana de 1M evita la pérdida de contexto que introduce el chunking en tareas de coherencia global.
- Procesamiento de documentos escaneados con imagen: al conservar el pipeline image-text-to-text, el modelo puede recibir páginas renderizadas como imagen junto al texto extraído, útil para formularios, facturas o planos donde el OCR pierde estructura.
- Investigación sobre corpus científicos: cargar varios papers completos con sus figuras y tablas y pedir síntesis comparativas. Los 157 slots de snapshot compartido permiten reutilizar prefijos de corpus entre consultas sucesivas.
- Asistente de análisis de logs y trazas largas: volcar trazas de sistema de cientos de miles de tokens y pedir correlación de eventos. La caché de prefijo en host de 256 GB reduce el coste de repetir el mismo contexto en preguntas de seguimiento.
- Despliegue en estación de trabajo con una sola GPU profesional: equipos con RTX PRO 6000 Blackwell de 96 GB pueden servir el modelo completo con contexto de 1M sin clúster ni parallelism, lo que simplifica la operación en entornos de investigación y laboratorios.
- Evaluación comparativa de contexto largo: el paquete TP2 hermano (2 GPU, 108 GiB de caché KV, 7,4M tokens KV, concurrencia 32) sirve para pruebas de estrés con varias peticiones de 1M simultáneas cuando se dispone de una segunda GPU de la misma arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento medidos que aporta la model card son de asignación de memoria y capacidad de servicio, no de calidad:

| Métrica | TP1 (este repo) | TP2 (hermano) |
|---|---|---|
| GPU requeridas | 1 | 2 × Blackwell misma arquitectura |
| Peticiones concurrentes | 8 | 32 |
| Caché KV al cargar | 20,1 GiB · 1.445.888 tokens KV · 157 slots | 108,0 GiB · 7.471.104 tokens KV · 811 slots |
| Plan de dispositivo compilado | 73,4 GiB (87 asignaciones) | 39,6 GiB por rango (~110 asignaciones/rango) |
| Grafos CUDA capturados | 84 | 112 |
| Contexto por petición | 1.048.576 tokens | 1.048.576 tokens |

## Requisitos de hardware

- VRAM estimada: el plan de dispositivo compilado ocupa 73,4 GiB y la caché KV al cargar 20,1 GiB sobre una GPU de 96 GB (presupuesto de GPU completa, sin `--memory-limit`), con tablas de embedding en RAM de host y caché de prefijo de 256 GB en host.
- GPU recomendada: NVIDIA RTX PRO 6000 Blackwell (GB202, SM120). El replay exige la misma arquitectura en la que se preparó el paquete; no es portable a otras generaciones sin reexportar.
- Cabe en GPU de consumo: no. El plan de dispositivo de 73,4 GiB más la caché KV excede la VRAM de cualquier GPU consumer actual; requiere una tarjeta profesional de 96 GB.
- Opciones de despliegue: motor Flare compilado desde `NVIDIA/hyperflare-inference` en el commit `6b586398` o posterior (`cargo build --release --manifest-path flare-cli/Cargo.toml`), o contenedor `ghcr.io/local-inference-lab/flare:release-6f2bd11-main-20261119` (digest `sha256:9988c70529d618bc74d5813c44669b7099d75f38b585fabfd5508a1dcd7a742b`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el paquete usa un formato y ABI propios.
- Comando de servicio: `flare run JohannesBertens/Qwen3.8-Flash-Next-FLARE-1M --gpus 0`, con `--gpus` seleccionando exactamente un dispositivo; el payload se toma de la revisión `gb202`.
- Latencia y throughput: no disponibles. La model card solo confirma que la decodificación especulativa MTP (5 tokens de borrador) está activa y que el paquete TP2 A4 de esta cadena de herramientas decodifica a la mitad de velocidad, sin cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-FLARE-1M (TP1) | no disponible | 1.048.576 | NVIDIA Open Model License | Paquete Flare, 1 GPU GB202 | 8 peticiones concurrentes, MTP 5 |
| Qwen3.8-Flash-Next-FLARE-1M-TP2 | no disponible | 1.048.576 | NVIDIA Open Model License | Paquete Flare, 2 GPU Blackwell | 32 concurrentes, 108 GiB de caché KV |
| nvidia/Qwen3.8-Flash-Next-FP4-Local (base) | no disponible | 262.144 | NVIDIA Open Model License | Checkpoint FP4 local | Contexto nativo sin interpolación YaRN |
| Alternativas de otros fabricantes con contexto ~1M | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

La comparación con modelos de la competencia (por ejemplo, familias con ventanas de contexto de un millón de tokens) no puede establecerse con rigor porque la información proporcionada no incluye parámetros, benchmarks ni licencias de esos modelos.

## Limitaciones y advertencias

- Dependencia estricta de versión: motores Flare anteriores al commit `6b586398` rechazan el paquete en `Prepare model` con "unsupported execution contract version", aunque `flare inspect` verifique la firma. Verificado con `ghcr.io/local-inference-lab/flare:latest` (`880c034b1ce1`, 2026-10-25).
- Dependencia de hardware: el replay solo funciona en GB202 (RTX PRO 6000 Blackwell, SM120). No hay portabilidad a A100, H100 ni a generaciones consumer sin reexportar el paquete.
- Concurrencia baja en TP1: 8 peticiones simultáneas y una caché KV que cubre aproximadamente una conversación de contexto completo más historial. Para varios usuarios con 1M simultáneos hay que usar el paquete TP2.
- La extensión a 1M es una interpolación de RoPE por frecuencia sin ajuste de temperatura de atención; la calidad del modelo en la zona 262K–1M no está respaldada por benchmarks publicados en la información disponible, por lo que conviene validarla empíricamente en la tarea concreta antes de producción.
- Licencia: NVIDIA Open Model License, no es una licencia de código abierto permisiva al uso. Es necesario revisar los términos del modelo base (`nvidia/Qwen3.8-Flash-Next-FP4-Local/blob/main/LICENSE`) antes de uso comercial; la model card no detalla restricciones adicionales.
- Distribución por el autor: el paquete se sirve con `--dangerously-approve-key` y `--dangerously-accept-publisher`, mecanismos que requieren confiar explícitamente en la clave del publicador. En producción conviene fijar la clave y el digest del contenedor y no automatizar la aprobación.
- En hosts con SELinux hay que añadir `--security-opt label=disable` al contenedor, y montar el core y el perfil de publicador para que el UID 10001 pueda leerlos.
- Sesgos, tasa de alucinación y limitaciones idiomáticas: no disponibles en la información proporcionada. Al ser un refinamiento del modelo base, hereda los del mismo, pero no se documentan aquí.
- El repositorio ocupa 506,6 GB y el paquete no es un checkpoint estándar: no se puede cargar con transformers, vLLM ni llama.cpp, lo que limita la integración con herramientas del ecosistema habitual.
- El paquete `main` contiene solo metadatos; el payload real está en la revisión `gb202`, que Flare selecciona automáticamente en dispositivos GB202 (forma explícita: `MODEL@gb202`).

## Enlaces

- Repositorio Hugging Face (TP1): https://huggingface.co/JohannesBertens/Qwen3.8-Flash-Next-FLARE-1M
- Paquete hermano TP2: https://huggingface.co/JohannesBertens/Qwen3.8-Flash-Next-FLARE-1M-TP2
- Paquete TP2 A16: https://huggingface.co/JohannesBertens/Qwen3.8-Flash-Next-FLARE-1M-TP2-A16
- Modelo base: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Licencia del modelo base: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local/blob/main/LICENSE
- Motor Flare (HyperFlare Inference): https://github.com/NVIDIA/hyperflare-inference
- Rama de reexportación con la declaración yarn4: `JohannesBertens/flare-local-inference`, rama `tp2-derived`
- Contenedor validado: `ghcr.io/local-inference-lab/flare:release-6f2bd11-main-20261119`
- Paper, blog o demo adicionales: no disponible.
