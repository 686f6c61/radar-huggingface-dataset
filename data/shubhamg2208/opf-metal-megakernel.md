# shubhamg2208/opf-metal-megakernel

## Resumen

`shubhamg2208/opf-metal-megakernel` no es un modelo de lenguaje nuevo, sino un paquete de kernel compilado para Apple Metal que implementa la inferencia completa de `openai/privacy-filter`, un modelo de clasificación de tokens orientado a la detección y redacción de datos personales (PII). El artefacto publicado permite ejecutar ese modelo sobre Apple Silicon sin depender de una pila de operadores genérica: el kernel `opf_megakernel_v1` fusiona las ocho capas de atención/MoE del modelo base y su clasificador en un único *dispatch* por batch nativo, leyendo directamente el checkpoint safetensors original de OpenAI.

Su relevancia es de infraestructura más que de modelado: demuestra que un modelo de clasificación de tokens con mezcla de expertos puede servirse en hardware de consumo Apple con una huella de memoria mucho menor que la ruta de PyTorch en CPU (3,034 GB de RSS máximo frente a 16,128 GB en la ejecución agrupada en CPU). El paquete incluye adaptadores para PyTorch MPS y MLX, plugins HTTP para SGLang 0.5.18 y vLLM/vLLM-Metal 0.28, y un proxy para baseRT.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, tamaño de 0,0 GB y licencia no disponible. Está marcado como `library_name: custom` con `pipeline_tag: token-classification`, y el autor indica que el acceso para publicarlo como repositorio de tipo *kernel* está solicitado pero pendiente, por lo que hoy funciona como repositorio de tipo modelo con carga mediante `get_local_kernel()` o `get_kernel()` con `LOCAL_KERNELS`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Megakernel Metal fusionado (`opf_megakernel_v1`) que implementa el modelo base `openai/privacy-filter`: 8 capas de atención con mezcla de expertos (MoE) más clasificador de tokens; un único *dispatch* por batch nativo |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo base es MoE, pero no se publican cifras de parámetros totales ni activos) |
| Longitud de contexto | no disponible; el servidor de referencia limita a `--max-tokens 128`, `--max-batch 8`, `--max-request-bytes 1048576` y `--max-request-inputs 64` |
| Tipos de cuantizacion | no se documentan formatos cuantizados; el checkpoint se usa en BF16 (en la ruta CPU se crean copias FP32 de los expertos agrupados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors del checkpoint original de OpenAI, más shader Metal precompilado en `build/torch213-metal-aarch64-darwin` |
| Pipeline | token-classification |
| Entorno soportado | PyTorch 2.13, macOS 26+, Apple Silicon (aarch64-darwin) |
| Servidores compatibles | SGLang 0.5.18, vLLM/vLLM-Metal 0.28, baseRT 0.2.3 (mediante proxy) |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: envuelve el checkpoint de `openai/privacy-filter` en un kernel Metal escrito a medida. La innovación técnica es la fusión total del grafo en un solo *compute kernel*: las ocho capas de atención/MoE y el clasificador se ejecutan con un único *command buffer* y un único *compute encoder* por batch en la ruta nativa, en lugar de encadenar decenas de *dispatches* de operadores. En la ruta PyTorch, el adaptador lanza un kernel de modelo personalizado más cuatro comprobaciones de entrada en MPS, y es PyTorch quien gestiona la planificación de los *command buffers*.

La ejecución con el checkpoint se organiza con un calendario de expertos agrupado (*grouped expert schedule*); el autor indica que la ruta PyTorch pasa una comprobación de decodificación de ocho documentos contra el calendario sin modificar. No se detallan datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF/DPO, porque el trabajo es de inferencia y no de entrenamiento. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal más allá de la fusión del kernel.

El paquete se distribuye con instrucciones de construcción reproducibles (`scripts/download_model.py`, `scripts/build_native.py`) y con evidencia de validación registrada en `results/evidence/hf_kernel_validation.json`.

## Capacidades

- Clasificación de tokens para detección de PII: devuelve etiquetas de token, tramos (*spans*) de PII y texto redactado.
- Redacción de datos personales en texto: el *endpoint* `/plugins/opf_metal/v1/redact` acepta una lista de entradas y devuelve la redacción con tipado opcional (`"typed": true`).
- Procesamiento por lotes: hasta 8 documentos por batch en la configuración de referencia del servidor.
- Servido HTTP con autenticación por API key (`OPF_METAL_API_KEY`) sobre SGLang o vLLM-Metal.
- Adaptadores tensoriales para PyTorch MPS y MLX, además del CLI nativo.
- Compatibilidad con el cargador `kernels` de Hugging Face en PyTorch 2.13, macOS 26 y Apple Silicon.
- No es un modelo generativo: no produce texto libre, no hace razonamiento multi-paso, no soporta *tool calling* ni capacidades de visión o audio.

## Casos de uso

- Redacción de PII en pipelines de datos: enviar lotes de hasta 8 documentos al *endpoint* `/plugins/opf_metal/v1/redact` y sustituir correos, teléfonos y nombres antes de almacenar o compartir el texto, con la ventaja de que todo el procesamiento ocurre en el equipo local.
- Cumplimiento de RGPD en estaciones de trabajo Apple: desplegar el servidor en un Mac con Apple Silicon para preprocesar documentación interna sin enviar datos personales a la nube, apoyándose en la huella de 3,034 GB de RSS máximo del megakernel.
- Anonimización previa a anotación humana: generar tramos de PII etiquetados por token que luego se revisan en una herramienta de etiquetado, usando la salida `typed` para distinguir categorías.
- Saneado de logs y trazas de aplicaciones: ejecutar la clasificación sobre mensajes de error y registros antes de enviarlos a un sistema de observabilidad externo.
- Prototipado e investigación en privacidad: comparar la paridad de etiquetas entre las rutas CPU, MPS y Metal (el autor documenta acuerdos superiores al 99,9 % sobre 139.654 etiquetas) para estudiar la sensibilidad numérica de los kernels.
- Evaluación de despliegue en hardware de consumo: medir el consumo de memoria de un modelo MoE de clasificación en un Mac antes de decidir si se migra a un servidor con GPU, usando las cifras de RSS del repositorio como referencia.
- Integración en herramientas de escritorio para macOS: incorporar el kernel en una aplicación nativa que redacte texto en local antes de exportar documentos.

## Benchmarks y rendimiento

El autor publica una comparación de calidad sobre el *split* de test completo de TAB ECHR (127 documentos, B=8) con el checkpoint exacto de OpenAI, con métricas de precisión, recall y F1 a nivel de carácter agrupadas por backend. La gráfica está en `docs/assets/dataset-character-metrics.svg`; los valores numéricos de precisión, recall y F1 no se incluyen en el texto de la model card.

Auditoría de paridad sobre el corpus completo de TAB (139.654 etiquetas de token decodificadas):

| Comparación | Acuerdo |
|---|---:|
| CPU frente a MPS | 99,9606 % |
| Metal frente a CPU | 99,9277 % |
| Metal frente a MPS | 99,9298 % |
| Los tres backends entre sí | 99,9091 % |

Memoria observada en la misma ejecución:

| Backend | RSS máximo del proceso | Evidencia adicional |
|---|---:|---|
| PyTorch CPU, expertos agrupados | 16,128 GB | Checkpoint BF16 residente más copias FP32 de los expertos agrupados |
| PyTorch MPS, expertos agrupados | 3,429 GB | MPS actual 8,111 GB; pico del driver 11,072 GB; máximo recomendado 40,201 GB |
| Megakernel Metal | 3,034 GB | 2,918 GB de carga lógica en búferes explícitos, incluidos 0,119 GB de búferes reutilizables |

Advertencias del propio autor: la comparación de calidad no incluye ninguna afirmación de latencia; los recuentos lógicos de Metal excluyen el redondeo de páginas del checkpoint y las asignaciones del runtime/driver de Metal; y de las cinco corpora previstas solo se completaron TAB (y ai4privacy en Metal y CPU, excluida por falta de resultado atómico de MPS). Nemotron-PII, SPY y Gretel PII no se completaron, y ninguna fila faltante se rellenó con ejecuciones parciales ni con el valor de referencia de PII-TRACE.

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni métricas equivalentes de modelos generativos, porque el modelo base es un clasificador de tokens y no un modelo de lenguaje.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon (aarch64-darwin), macOS 26 o superior, PyTorch 2.13 para la build `build/torch213-metal-aarch64-darwin`.
- VRAM/memoria unificada estimada: 3,034 GB de RSS máximo de proceso con el megakernel Metal; 3,429 GB con la ruta PyTorch MPS; 16,128 GB con la ruta PyTorch CPU agrupada.
- GPU recomendadas: cualquier SoC Apple Silicon compatible con Metal y macOS 26; no se documenta soporte para A100, H100 ni RTX 4090.
- Cabe en hardware de consumo: sí, en equipos Apple Silicon, con un pico de driver MPS de 11,072 GB y un máximo recomendado de 40,201 GB en la prueba.
- Opciones de despliegue: CLI nativa, adaptadores PyTorch MPS y MLX, SGLang 0.5.18 con `--model-type opf_metal`, vLLM/vLLM-Metal 0.28 con `VLLM_PLUGINS=metal,opf_metal`, baseRT 0.2.3 mediante proxy, y el cargador `kernels` de Hugging Face con `get_local_kernel()`.
- Límites de servido de referencia: `--max-batch 8`, `--max-tokens 128`, `--max-request-bytes 1048576`, `--max-request-inputs 64`, escucha en `127.0.0.1:30000`.
- Latencia y throughput: no disponibles; el autor indica explícitamente que la comparación publicada no contiene afirmaciones de latencia.

## Comparativa con modelos similares

La comparación relevante aquí no es entre modelos, sino entre backends de ejecución del mismo checkpoint, ya que no se han publicado datos de otros modelos de detección de PII en la información disponible.

| Alternativa | Parametros | Contexto | Memoria en la prueba | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `shubhamg2208/opf-metal-megakernel` (este repo) | no disponible | no disponible | 3,034 GB RSS (Metal) | no disponible | Repo tipo modelo, 0 descargas, carga local |
| `openai/privacy-filter` en PyTorch MPS agrupado | no disponible | no disponible | 3,429 GB RSS | no disponible | Checkpoint original en Hugging Face |
| `openai/privacy-filter` en PyTorch CPU agrupado | no disponible | no disponible | 16,128 GB RSS | no disponible | Checkpoint original en Hugging Face |
| Modelos de PII de terceros (Nemotron-PII, SPY, Gretel PII) | no disponible | no disponible | no evaluado (ejecuciones no completadas) | no disponible | Referenciados en la model card, sin resultados |

## Limitaciones y advertencias

- Solo funciona en Apple Silicon con macOS 26 o superior y PyTorch 2.13; no hay ruta para GPU NVIDIA ni para Linux.
- El repositorio es de tipo modelo, no de tipo kernel: `get_kernel()` directo desde el Hub requiere un repositorio de tipo kernel y el acceso está pendiente, por lo que hay que usar `get_local_kernel()` o una anulación local.
- Licencia no disponible, tanto en este repositorio como en los metadatos consultados: no se puede asumir uso comercial sin verificar la licencia de `openai/privacy-filter`.
- Idiomas soportados no disponibles; la validación publicada se limita al corpus TAB ECHR en inglés.
- Cobertura de evaluación incompleta: de cinco corpora previstas solo se completó TAB, y ai4privacy quedó excluida por falta de resultado atómico de MPS; Nemotron-PII, SPY y Gretel PII no se evaluaron.
- Sin datos de latencia ni de throughput: no sirve por sí solo para dimensionar un sistema en producción.
- Riesgo de falso negativo en PII: cualquier clasificador puede dejar pasar entidades; el propio autor documenta desacuerdos de etiquetado de aproximadamente el 0,07-0,09 % entre backends, lo que implica que la salida depende del backend elegido.
- Los recuentos de memoria lógica de Metal no incluyen el redondeo de páginas del checkpoint ni las asignaciones del driver, así que el consumo real del sistema es superior a los 2,918 GB declarados.
- Configuración de servidor conservadora por defecto (batch 8, 128 tokens, 1 MiB por petición): insuficiente para documentos largos sin ajustar los límites y verificar la memoria.
- Metadatos inconsistentes: el repositorio figura creado el 2026-10-20, con 0 descargas y 0 likes y un tamaño de 0,0 GB, lo que sugiere que el artefacto todavía no está estabilizado ni auditado por terceros.
- El contenido de la búsqueda web realizada no contiene resultados técnicos relevantes sobre este modelo; no se ha usado como fuente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/shubhamg2208/opf-metal-megakernel
- Modelo base: https://huggingface.co/openai/privacy-filter
- Instrucciones de carga del paquete de kernel (ruta relativa al repo): `docs/HUGGING_FACE_KERNEL.md`
- Evidencia de validación del kernel (ruta relativa al repo): `results/evidence/hf_kernel_validation.json`
- Guía de servido y adaptadores PyTorch/MLX (ruta relativa al repo): `docs/SERVING_ADAPTERS.md`
- Guía de baseRT (ruta relativa al repo): `docs/serving/BASE_RT.md`
- Resultados completos de la comparación de benchmarks (ruta relativa al repo): `results/dataset_benchmarks/comparison.json`
- Gráfica de métricas por carácter en TAB (ruta relativa al repo): `docs/assets/dataset-character-metrics.svg`
- Papers, blogs o demos adicionales: no disponible en la información proporcionada.
