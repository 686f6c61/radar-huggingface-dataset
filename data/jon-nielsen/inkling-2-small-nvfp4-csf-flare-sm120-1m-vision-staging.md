# Jon-Nielsen/Inkling-2-Small-NVFP4-CSF-FLARE-sm120-1M-vision-staging

## Resumen

Inkling-2-Small es un modelo multimodal (texto y visión) desarrollado por Thinking Machines, distribuido aquí como un artefacto compilado FLARE por Jon-Nielsen. El pack que nos ocupa no es un checkpoint convencional, sino un export sellado que incluye pesos, runner y firmas criptográficas empaquetados conjuntamente, con verificación SHA256 obligatoria antes de la carga. Está construido a partir de la cuantización NVFP4/CSF publicada por Local Inference Lab, que a su vez deriva del checkpoint MXFP8 original.

La relevancia de esta ficha reside en su carácter de artefacto de despliegue altamente especializado: no es un modelo para usar con vLLM, llama.cpp u Ollama, sino un pack cerrado para un rig concreto de 4 GPUs SM120 (clase RTX PRO 6000 Blackwell, 96 GB cada una) en un único host Linux x86_64. El export introduce una innovación concreta: las reducciones de prefill se trasladan al anillo DMA del copy-engine PCIe en BF16 por chunk completo, liberando el stream principal.

El modelo base Inkling-2-Small es multimodal con soporte de contexto largo (hasta 1.048.576 tokens según las pruebas del autor) y capacidades de tool calling. Los pesos safetensors del repo suman 50.283.638 parámetros, aunque el tamaño del repositorio (346,2 GB) refleja el empaquetado completo del runner, kernels compilados y artefactos de firma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión); detalles internos no disponibles |
| Parámetros totales | 50.283.638 (según safetensors del repo) |
| Parámetros activos | no disponible |
| Longitud de contexto | Hasta 1.048.576 tokens (probado con needle a 990.000 tokens y gate a 262.144) |
| Tipos de cuantización | NVFP4 en expertos con compresión de escalas `csf_32x2_v1`; export etiquetado como 8-bit en HF; base MXFP8 → NVFP4-CSF |
| Idiomas soportados | no disponible |
| Licencia | Local Inference Lab License 1.0 (pesos); Apache-2.0 (runner y tooling del repo) |
| Formato de pesos | safetensors (pack FLARE compilado; no GGUF ni AWQ) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Small es un transformer multimodal que procesa texto y visión. La información disponible no detalla el número de capas, dimensión oculta, mecanismo de atención ni composición del dataset de entrenamiento. Lo que sí se documenta es la cadena de cuantización: el checkpoint original pasa a MXFP8, luego a NVFP4-CSF con expertos en NVFP4 y compresión de escalas `csf_32x2_v1`, y finalmente se compila como artefacto FLARE con grafos y kernels fijados en el momento del export.

La innovación técnica destacable de este export concreto es el traslado de las reducciones de prefill al anillo DMA del copy-engine PCIe en BF16 por chunk completo, lo que libera el stream principal durante la fase de prefill. Decode, visión, sampling y pesos permanecen inalterados respecto al export estándar. El pack es un artefacto sellado: el runner rechaza cargar cualquier fichero que no pueda verificar contra SHA256SUMS y contra la clave ed25519 del publicador (`Jon-Nielsen`), cuyo fingerprint es `sha256(raw 32-byte public key)`.

## Capacidades

- Generación de texto multimodal: procesa entradas de texto e imágenes (7/7 imágenes de prueba gestionadas correctamente según el autor).
- Contexto largo: soporta sesiones de hasta 1.048.576 tokens, con pool KV medido en 1,85–1,90 M tokens (aproximadamente dos sesiones completas de 1M).
- Tool calling / function calling: gate de corrección con 8/8 herramientas superadas.
- Razonamiento multi-paso y agentes: no se documenta explícitamente, pero el soporte de herramientas y contexto largo lo habilita.
- Sampling determinista: se verifica coincidencia con la referencia en modo determinista.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Análisis de documentos extensos con imágenes intercaladas: el pool KV de ~1,9 M tokens permite procesar contratos, informes o expedientes completos de cientos de miles de tokens junto con figuras y tablas, manteniendo coherencia en una sola sesión.
- Agentes autónomos con tool calling en producción: el gate de 8/8 herramientas y el contexto de 1M habilitan pipelines multi-paso donde el modelo encadena llamadas a APIs, consultas a bases de datos y razonamiento sobre resultados sin perder el hilo.
- Procesamiento por lotes de alta concurrencia: con 373 tok/s agregados a concurrencia 8, resulta adecuado para servir múltiples sesiones simultáneas en un único host de 4 GPUs.
- Auditoría y verificación de procedencia en entornos regulados: el pack sellado con SHA256SUMS y firma ed25519 permite demostrar la integridad de pesos y runner, útil en despliegues con requisitos de cadena de custodia.
- Investigación en cuantización NVFP4: al ser un export reproducible (Tier 2 y Tier 3 documentados), sirve como referencia para estudiar el impacto de la compresión CSF en calidad y throughput.
- Visión aplicada a inspección o documentación técnica: las 7/7 imágenes correctas y el contexto largo permiten tareas de descripción, extracción y correlación entre imágenes y texto extenso.
- Sustitución de pipelines RAG por contexto completo: con 1M tokens efectivos, se puede prescindir de recuperación fragmentada en corpus medianos y pasar el material íntegro en el prompt.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Prefill 3.425 tokens | 9.224–9.300 tok/s (mediana 9.262) |
| Prefill 8.192 tokens | 10.382–10.748 tok/s (mediana 10.404) |
| Prefill 11.846 tokens | 9.275–9.975 tok/s (mediana 9.772) |
| Decode 512 tokens, concurrencia 1 | 152–165 tok/s (mediana 156,0) |
| Decode 8 × 256 tokens, concurrencia 8 | 373 tok/s agregados |
| Pool KV en boot | 1,85–1,90 M tokens |
| Visión | 7/7 imágenes correctas |
| Contexto | gate 262.144 tokens y needle 990.000 tokens superados |
| Gate de corrección | tools 8/8, sampling determinista coincidente con referencia |

Mediciones del autor en un único host con 4× RTX PRO 6000 Blackwell (2 Max-Q + 2 WS), PCIe, Ubuntu 24.04, driver 615.71.09, con prompts salted, 3 repeticiones y mediana. No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- 4 GPUs SM120 con 96 GB de VRAM cada una en un único dominio PCIe (no requiere NVLink).
- VRAM total: 384 GB agregados; no se admite over-subscription.
- ~360 GB de disco libre; NVMe muy recomendado (el primer arranque mapea en memoria ~330 GB).
- Linux x86_64, glibc ≥ 2.39, driver ≥ 615.71, CUDA 13.2 userspace, `ulimit -l` unlimited.
- No cabe en GPUs de consumo (RTX 4090, etc.); no hay kernels compilados para otras SM.
- Despliegue exclusivamente mediante el runner incluido (`runner/flare-linux-x86_64`); no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: ~3,3 s para una completion de 512 tokens a concurrencia 1 una vez cebado el pool; la primera petición tras el arranque es más lenta por colectivas en frío. El TTFT a 1M de contexto ronda los dos minutos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos comparables de la misma categoría, y el formato FLARE compilado para SM120 no es directamente equiparable a checkpoints convencionales en términos de despliegue.

## Limitaciones y advertencias

- El pack está compilado exclusivamente para 4× SM120; no funciona en otras GPUs, ni en CPU, ni con runtimes estándar (vLLM, llama.cpp, Ollama, TGI).
- El runner rechaza cargar cualquier fichero no verificado; la ejecución headless exige aceptar explícitamente el publicador con `--dangerously-accept-publisher`, decisión que queda fijada permanentemente.
- La licencia de los pesos es Local Inference Lab License 1.0; deben revisarse las condiciones de uso comercial antes de producción.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Idiomas soportados: no disponibles.
- El TTFT a contexto completo (~1M) es de unos dos minutos, lo que limita su uso en aplicaciones interactivas de baja latencia.
- El primer arranque es lento por el mapeo de ~330 GB; se recomienda NVMe.
- No se han publicado benchmarks académicos que permitan validar calidad frente a alternativas.
- La fecha del artefacto (2026-11-19) y la ausencia de descargas o likes implican que no hay validación independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Jon-Nielsen/Inkling-2-Small-NVFP4-CSF-FLARE-sm120-1M-vision-staging
- Cuantización base NVFP4-CSF: https://huggingface.co/local-inference-lab/Inkling-2-Small-NVFP4-CSF
- Repositorio del runner: https://github.com/jon-nielsen/hyperflare-inference (rama v5-export)
- Commits relevantes: 493d3b62, 6e14b19a (rama v5-export)
