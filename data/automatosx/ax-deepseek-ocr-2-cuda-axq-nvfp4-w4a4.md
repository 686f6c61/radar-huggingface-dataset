# AutomatosX/AX-DeepSeek-OCR-2-CUDA-AXQ-NVFP4-W4A4

## Resumen

AX-DeepSeek-OCR-2-CUDA-AXQ-NVFP4-W4A4 es una cuantizacion del modelo de OCR multimodal deepseek-ai/DeepSeek-OCR-2, publicada por AutomatosX dentro de su familia AXQuant. Convierte el checkpoint oficial en BF16 a formato NVFP4 con esquema W4A4 (pesos y activaciones en FP4), manteniendo en BF16 las partes sensibles como el codificador de vision, el proyector, los routers, los embeddings, las normas y la cabeza del modelo de lenguaje. El objetivo es reducir el coste de memoria y habilitar la ejecucion nativa de kernels FP4 en hardware Blackwell mediante vLLM, sin recurrir a tecnicas como AWQ.

El modelo base es un sistema vision-lenguaje de la familia DeepSeek-VL2 orientado a tareas de reconocimiento optico de caracteres y comprension de documentos. La ficha tecnica disponible indica que se trata de una arquitectura con mezcla de expertos (MoE), segun se desprende de las referencias a routers, tablas de expertos y kernels MoE en el material de conversion y validacion. El paquete cuantizado conserva 3.389.119.360 parametros en total, de los cuales 2.602.844.160 estan en NVFP4 repartidos en 2.196 tensores, y 511 tensores permanecen protegidos en BF16.

Es relevante ahora porque demuestra un flujo de ejecucion nativa en FP4 sobre vLLM 0.25.1, PyTorch 2.11.0+cu130 y CUDA 13.0, verificado en una GeForce RTX 5090 y en una plataforma Thor. Hay que subrayar que se trata de una build de desarrollo ("development-preview") sin certificacion de calidad ni de velocidad: el autor declara explicitamente `runtime_verified=false` y `quality_certified=false`, por lo que debe tratarse como evidencia de ingenieria, no como version lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek-VL2 (`deepseek_vl_v2`), vision-lenguaje con mezcla de expertos (MoE) |
| Parametros totales | 3.389.119.360 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (pesos y activaciones E2M1 FP4, escalas de bloque E4M3FN cada 16 valores, escalas globales FP32) en proyecciones de texto; BF16 en vision, proyector, separadores, routers, embeddings, normas y LM head |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con compressed-tensors) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint oficial de DeepSeek-OCR-2 en BF16 (revision inmutable `aaa02f3811945a91062062994c5c4a3f4c0af2b0`, licencia apache-2.0). No hay reentrenamiento: se trata de una cuantizacion post-entrenamiento (PTQ) con el metodo RTN de AXQuant, con calibracion de rangos anclada a la fuente. La conversion emplea un codificador de pesos explicito basado en `numpy-reference` y genera un plan W4A4 versionado (`axquant_cuda_plan.json`) que registra la asignacion original, la imagen de calibracion y los rangos medidos (con un margen del 1,25 sobre el rango de activacion). Las escalas globales de pesos y activaciones se comparten entre proyecciones fusionadas y tablas de expertos completas.

El proceso de calibracion captura las entradas reales del runtime BF16 y reproduce todos los expertos de origen sobre los estados ocultos observados, incluidos los expertos no enrutados, para medir los rangos de la proyeccion descendente. Segun el autor, esto es RTN con calibracion de rango vinculada al origen, no una medida de sensibilidad de pesos ni una certificacion amplia de calidad. La innovacion central es la ejecucion nativa en FP4: los pesos e inputs seleccionados usan E2M1 FP4 con escalas de bloque E4M3FN para 16 valores y escalas globales FP32, mientras que las capas protegidas conservan BF16 y se verifica su igualdad de dtype y valor (511 tensores). No se ha usado AWQ.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos, con soporte nativo en vLLM para la pipeline `image-text-to-text`.
- Comprension de imagen y texto combinados (vision-lenguaje) propia de la familia DeepSeek-VL2.
- Extraccion de lineas de texto y deteccion de prefijos repetidos, segun las comprobaciones de humo publicadas ("AXQuant NVFP4", "Invoice 12345", "Total USD 42.50").
- Generacion de texto descriptivo del contenido de una imagen (image-text-to-text).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no documenta una lista de idiomas.
- Capacidades especiales (modo thinking, audio, etc.): no disponible en la informacion proporcionada. La cuantizacion puede alterar tokens de maquetacion o prefijos respecto a BF16.

## Casos de uso

- Digitalizacion de facturas y albaranes: el modelo puede leer lineas de importes y totales (el smoke test reproduce "Invoice 12345" y "Total USD 42.50"), lo que lo hace adecuado para pipelines de captura de datos estructurados a partir de documentos escaneados.
- Extraccion de texto de documentos en GPU de escritorio: al ocupar alrededor de 3 GB de pesos, permite OCR local en una RTX 5090 sin depender de servicios en la nube, reduciendo coste por pagina y latencia de red.
- Procesamiento de documentos en el borde (edge): el pack se ha probado en Thor con `memory-fraction 0.055`, lo que sugiere su viabilidad en plataformas embebidas Blackwell para OCR embarcado.
- Integracion en pipelines de vLLM existentes: al usar `library_name: vllm` y admitir `trust_remote_code=False`, se puede desplegar como endpoint OpenAI-compatible dentro de una infraestructura vLLM ya montada.
- Preprocesado de corpus para entrenamiento: convertir imagenes de documentos en texto indexable antes de alimentar un pipeline de RAG o de busqueda semantica.
- Validacion de calidad de escaneos: al comparar la salida frente a un OCR de referencia, se puede usar como paso de verificacion en un flujo de control documental.
- Pruebas de investigacion sobre cuantizacion NVFP4: sirve como caso de estudio reproducible para medir el impacto de W4A4 en modelos vision-lenguaje sobre hardware Blackwell.
- Automatizacion de back-office en documentos financieros: extraccion de lineas de detalle y totales para conciliacion, con la advertencia de que la precision general no esta certificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no aporta ninguna afirmacion de calidad, exactitud MTP, velocidad o certificacion, y que la misma pagina autogenerada se uso para calibracion y validacion (no es una evaluacion OCR con conjunto reservado).

Como evidencia de runtime (no de calidad) se recogen las siguientes comprobaciones:

| Entorno | Kernel lineal / MoE | Resultado |
|---|---|---|
| GeForce RTX 5090 | `CutlassNvFp4LinearKernel` / `FLASHINFER_CUTLASS` | passed |
| Thor | `CutlassNvFp4LinearKernel` / `VLLM_CUTLASS` | passed |

Ambas ejecuciones usaron hashes de checkpoint identicos, activaron chunked prefill, reconocieron las tres lineas de texto citadas y pasaron la comprobacion de prefijo de linea repetida. Conviene recordar que esto no cualifica maquetacion, cajas delimitadoras, precision OCR general, concurrencia ni velocidad.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 2,83 GiB (3.037.806.416 bytes), a los que hay que sumar cache KV, activaciones y el codificador de vision; el repositorio completo ocupa 3,0 GB.
- Ejecucion nativa FP4: requiere hardware Blackwell. El autor advierte que Marlin o la emulacion fallan; se exige explicitamente FP4 nativo (`--require-native-fp4`).
- GPU recomendadas y verificadas: GeForce RTX 5090 (Blackwell, sm_120) y plataforma Thor. En la RTX 5090 se uso `--memory-fraction 0.30`; en Thor, `--memory-fraction 0.055`.
- GPUs consumer: cabe en tarjetas Blackwell de consumo; el caso probado es la RTX 5090. El ajuste real de memoria por documento y concurrencia requiere dimensionado independiente.
- Opciones de despliegue: vLLM 0.25.1 con PyTorch 2.11.0+cu130 y CUDA 13.0, con soporte OCR nativo. El script incluido `examples/ocr_smoke.py` no requiere instalar AXQuant. No se documenta soporte para llama.cpp, Ollama, GGUF ni TGI.
- Backends de capas protegidas: las tablas de expertos BF16 pueden seleccionar otro backend soportado, segun el autor.
- Latencia y throughput: no disponibles; el autor explicita que no formula ninguna afirmacion de velocidad y que los avisos de eager-mode/JIT/autotune pueden afectar a la latencia.

## Comparativa con modelos similares

Los datos disponibles no permiten comparar con alternativas de la misma categoria mas alla del modelo base. No se dispone de cifras de otras cuantizaciones ni de modelos OCR comparables en la informacion proporcionada.

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| AX-DeepSeek-OCR-2-CUDA-AXQ-NVFP4-W4A4 | 3.389.119.360 (2.602.844.160 en NVFP4) | NVFP4 W4A4 + BF16 en capas protegidas | no disponible | apache-2.0 | Build de desarrollo, sin certificacion de calidad |
| deepseek-ai/DeepSeek-OCR-2 (base) | 3.389.119.360 | BF16 | no disponible | apache-2.0 | Checkpoint oficial de origen |
| Otras alternativas OCR de tamano similar | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- Estado de desarrollo: el autor marca `runtime_verified=false` y `quality_certified=false`; no es una version GA ni una certificacion Tier 1/2.
- La validacion de humo usa la misma pagina autogenerada para calibracion y validacion, por lo que no constituye una evaluacion OCR con conjunto reservado.
- No se cualifican maquetacion, cajas delimitadoras, precision OCR general, concurrencia ni velocidad; los tokens de maquetacion o prefijos pueden diferir respecto a BF16.
- Riesgo de alucinacion: no documentado explicitamente para este pack, pero inherente a los modelos generativos; el autor no aporta ninguna garantia de exactitud.
- Idiomas soportados: no disponibles; no hay lista de idiomas ni evidencia de cobertura multilingue.
- Longitud de contexto: no disponible; no se especifica la ventana del modelo base ni como la afecta la cuantizacion.
- Restricciones de licencia: el pack hereda apache-2.0 del modelo base, con la licencia original preservada byte a byte en `LICENSE.txt`. No se documentan restricciones adicionales para uso comercial.
- Discrepancia de etiquetado: la etiqueta del repositorio incluye "8-bit", mientras que la ficha tecnica describe un esquema W4A4 (4 bits); conviene verificar este extremo antes de fiarse del tag.
- Requisito de hardware estricto: la ejecucion nativa FP4 solo funciona en Blackwell; en otras GPUs o con backends de emulacion la inferencia falla.
- Avisos de eager-mode, JIT y autotune pueden alterar la latencia; no hay ninguna cifra de rendimiento publicada.
- El minimo de 16 tokens de la peticion de smoke test es un ajuste de prueba, no una garantia de precision OCR.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-DeepSeek-OCR-2-CUDA-AXQ-NVFP4-W4A4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-OCR-2
- Revision inmutable del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-OCR-2/tree/aaa02f3811945a91062062994c5c4a3f4c0af2b0
- Artefactos incluidos en el repositorio: `runtime_audit.json`, `axquant_cuda_plan.json`, `axquant_cuda_manifest.json`, `activation_calibration.json`, `calibration/`, `provenance.json`, `development_runtime_smoke.json`, `SHA256SUMS.txt`, `examples/ocr_smoke.py`, `LICENSE.txt`
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada.
