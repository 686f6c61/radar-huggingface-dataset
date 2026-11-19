# SolsticeAI/Qwen3.8-27B-Uncensored-mlx-6Bit

## Resumen

SolsticeAI/Qwen3.8-27B-Uncensored-mlx-6Bit es una cuantización de 6 bits en formato MLX del modelo abliterado orcarouter/Qwen3.8-27B-Uncensored, que a su vez deriva de la arquitectura densa Qwen 3.8 de 27B de Alibaba. El modelo elimina los vectores de dirección de rechazo mediante ablación ortogonal en los tensores de pesos, con el objetivo declarado de ofrecer generación sin rechazos para tareas de red-teaming, auditoría de sistemas, investigación de vulnerabilidades e ingeniería automatizada. Está publicado por SolsticeAI bajo licencia Apache 2.0 y empaquetado específicamente para Apple Silicon mediante MLX y el runtime Anvil.

La relevancia de esta ficha radica en dos factores: por un lado, la compresión a 6 bits con cuantización afín por grupos (group_size 64) que, según el autor, preserva el 99,2 % del rendimiento BF16 sin cuantizar y reduce el peso en memoria de aproximadamente 54 GB a unos 21,8 GB; por otro, la ventana de contexto nativa de 262 144 tokens, pensada para auditoría de repositorios completos y análisis multiarchivo. El modelo declara además capacidades de imagen a texto (pipeline image-text-to-text) y soporte de tool calling y razonamiento agéntico.

El checkpoint tiene 26 895 993 856 parámetros reales según los safetensors (el autor declara 27,5 B), ocupa 21,9 GB en el repositorio repartidos en cinco shards y está orientado exclusivamente a hardware Apple con memoria unificada de 32 GB o superior. No se han publicado resultados de benchmarks verificables en la información disponible, por lo que las cifras de rendimiento deben tratarse como declaraciones del autor y no como mediciones independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso Qwen 3.8 (familia qwen3_5), con ablación ortogonal de vectores de rechazo |
| Parametros totales | 26 895 993 856 (26,9 B; el autor declara 27,5 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (262K), RoPE extendido |
| Tipos de cuantizacion | MLX 6 bits afín, group_size 64, mode affine; el runtime Anvil permite además turbo4/turbo3 en atención (type-k/type-v) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato MLX (5 shards, 21,85 GB en disco) |
| Modelo base | orcarouter/Qwen3.8-27B-Uncensored |
| Pipeline | image-text-to-text |
| Huella en memoria | ~22,2 GB con contexto de 8K; ~24,8 GB con contexto de 32K |
| Runtime principal | Anvil Engine (Solstice Labs) y mlx-lm v0.19.0+ |
| Hardware objetivo | Apple Silicon con 32 GB+ de memoria unificada (M1/M2/M3/M4/M5 Pro, Max, Ultra) |
| Descargas / likes | 2048 descargas, 2 likes |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen 3.8, sin mezcla de expertos, con 26,9 B de parámetros efectivos. La innovación principal no está en la arquitectura base sino en el proceso de abliteración: el autor del modelo base aisló las direcciones principales de rechazo en los flujos residuales intermedios y ortogonalizó los pesos correspondientes, eliminando los preámbulos moralizantes y los disparadores de rechazo sin reentrenamiento completo y, según la model card, preservando el conocimiento de dominio. La cuantización posterior a 6 bits afín por grupos (group_size 64) se aplicó con MLX para reducir el peso activo de ~54 GB a ~21,8 GB.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo base. La model card menciona calibración de embeddings rotatorios extendidos (RoPE) para alcanzar los 262K tokens de contexto y optimización de shaders fusionados de Metal para no saturar el bus de memoria unificada durante la generación multi-token. Tampoco se detalla el proceso exacto de ablación más allá de la descripción de alto nivel.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (hasta 262K tokens).
- Razonamiento y derivación matemática, según declara el autor.
- Capacidades de imagen a texto (pipeline image-text-to-text), aunque no se detalla el codificador visual ni la resolución soportada.
- Tool calling y function calling para integración en pipelines agénticos.
- Razonamiento multi-paso y uso de agentes.
- Capacidades multilingües limitadas a inglés y chino.
- Modo sin rechazos (abliterated): no aplica preámbulos moralizantes ni bloqueos por contenido, orientado a red-teaming y ciberseguridad.
- Decodificación con turboquant en el runtime Anvil (turbo4 para claves, turbo3 para valores), que reduce el coste de atención.

## Casos de uso

- Red-teaming de modelos y sistemas: el checkpoint permite generar prompts adversarios y respuestas sin filtros para evaluar la robustez de clasificadores y salvaguardas en pipelines de seguridad, aprovechando la ausencia de rechazos.
- Auditoría de seguridad de repositorios: con 262K tokens de contexto se pueden cargar múltiples archivos de un proyecto y solicitar análisis de flujos de datos, superficies de ataque y patrones inseguros sin fragmentar el contexto.
- Investigación de vulnerabilidades: generación de pruebas de concepto, análisis de binarios descritos en texto y revisión de configuraciones de sistemas, en un entorno local sobre Apple Silicon sin enviar datos a la nube.
- Asistencia a ingeniería automatizada: integración vía API compatible con OpenAI (Anvil o mlx_lm.server) para tareas de generación y refactorización de código en pipelines internos, con tool calling para consultar documentación o ejecutar comandos.
- Análisis de documentos técnicos e imágenes: al soportar image-text-to-text, puede extraer información de diagramas de arquitectura, capturas de paneles de administración o esquemas de red y combinarla con texto para informes.
- Despliegue local en estaciones de trabajo Apple: prototipado y实验 de modelos de razonamiento en un Mac Studio o MacBook Pro con 32-128 GB de memoria unificada, sin GPU dedicada, usando MLX o Anvil.
- Evaluación comparativa de cuantizaciones: servir como referencia de 6 bits para medir la pérdida de calidad frente a BF16 en tareas de razonamiento y código sobre hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente declara que la cuantización a 6 bits preserva el 99,2 % del rendimiento BF16 sin cuantizar, sin especificar qué benchmarks ni los valores absolutos. Las cifras de throughput que se listan a continuación son estimaciones del autor para generación, no mediciones independientes:

| Plataforma | Memoria unificada | Contexto asignado | Velocidad declarada |
|---|---|---|---|
| Apple M4 Max | 128 GB | 64K–131K tokens | ~62 tok/s |
| Apple M3 Max | 64–96 GB | 32K–64K tokens | ~55 tok/s |
| Apple M2 Ultra | 64–192 GB | 64K–131K tokens | ~58 tok/s |
| Apple M3 Pro / M4 Pro | 36–48 GB | 16K–32K tokens | ~42 tok/s |
| Apple Mac | 24 GB | 4K–8K tokens | ~36 tok/s |

## Requisitos de hardware

- VRAM/RAM estimada: ~22,2 GB con contexto de 8K y ~24,8 GB con contexto de 32K; el peso en disco es de 21,85 GB.
- GPU recomendadas: exclusivamente Apple Silicon (M1/M2/M3/M4/M5 en variantes Pro, Max y Ultra). No hay soporte declarado para CUDA, ROCm ni CPU x86.
- Cabe en GPU de consumo: sí, en Mac con 24 GB de memoria unificada en configuración mínima (contexto de 4K–8K y poca RAM de fondo); el mínimo recomendado por el autor es 32 GB.
- Opciones de despliegue: Anvil Engine (runtime principal, con servidor API compatible con OpenAI), mlx-lm (chat y servidor REST), y presumiblemente cualquier stack que cargue safetensors MLX.
- Latencia y throughput: 36–62 tok/s según la tabla del autor; no se proporcionan cifras de latencia de prefill ni de time-to-first-token.
- Para contextos de 131K tokens se recomienda 64 GB o más de memoria unificada, según la tabla de compatibilidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|
| SolsticeAI/Qwen3.8-27B-Uncensored-mlx-6Bit | 26,9 B | 262K | MLX 6-bit, Apple Silicon | Apache 2.0 | Abliterado, image-text-to-text, sin benchmarks publicados |
| orcarouter/Qwen3.8-27B-Uncensored | ~27 B (declarado) | no disponible en la información | BF16 (presumiblemente) | no disponible en la información | Modelo base sin cuantizar; requiere ~54 GB según el autor |
| Qwen 3.8 27B (modelo original de Alibaba) | ~27 B | no disponible en la información | Múltiples | no disponible en la información | Modelo con salvaguardas; referencia de capacidades base |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, formato y licencia.

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo: el modelo puede generar contenido dañino, ilegal o inseguro sin advertencia. No debe exponerse a usuarios finales sin capas de moderación externas.
- Riesgo elevado de alucinación en dominios especializados, especialmente al operar sin rechazos y con contexto muy largo; no hay benchmarks publicados que cuantifiquen la degradación de la cuantización a 6 bits.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- La ventana de 262K tokens exige memoria proporcional: en configuraciones de 24 GB solo es viable con contexto de 4K–8K.
- Dependencia exclusiva de Apple Silicon: no hay soporte para CUDA, ROCm ni GPUs de consumo NVIDIA/AMD, lo que limita su uso en servidores convencionales.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal por el contenido generado sin filtros recae en el desplegador; conviene revisar las obligaciones de la licencia del modelo base.
- Las cifras de rendimiento (99,2 % de retención, 36–62 tok/s) son declaraciones del autor sin verificación independiente.
- El modelo se actualizó por última vez en octubre de 2026 y tiene solo 2 likes y 2048 descargas, lo que indica una validación comunitaria muy limitada.
- El pipeline image-text-to-text se declara pero no se documentan el codificador visual, la resolución de entrada ni los benchmarks multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SolsticeAI/Qwen3.8-27B-Uncensored-mlx-6Bit
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Runtime Anvil: https://github.com/Solstice-Labs/anvil
- Instalador de Anvil: https://anvil-llm.github.io/anvil/install.sh
- Banner del proyecto: https://cdn-uploads.huggingface.co/production/uploads/67c2e844e0921a5410eec10a/Y5M42dCag2f7Fc6fDtV0Z.jpeg
