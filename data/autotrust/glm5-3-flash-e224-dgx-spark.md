# autotrust/GLM5.3-Flash-E224-DGX-Spark

## Resumen

GLM5.3-Flash-E224-DGX-Spark es una compilación compacta y no oficial del modelo zai-org/GLM-5.3-Flash, publicada por el usuario autotrust en Hugging Face. Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con capacidades multimodales (image-text-to-text), diseñado específicamente para ejecutarse en sistemas de escritorio con GPUs Blackwell de NVIDIA, como el DGX Spark (GB10). El modelo reduce el número de expertos enrutados por capa de 288 a 224 mediante Neural Architecture Search (NAS), lo que rebaja el peso en disco de aproximadamente 190 GiB a 141 GiB sin alterar los 18 B de parámetros activos por token.

La motivación principal es hacer viable el despliegue en hardware con memoria unificada limitada: dos DGX Spark conectados por ConnectX-7 suman 256 GB de memoria unificada, y este checkpoint deja unos 40 GiB por nodo para la caché KV, suficiente para trazas de razonamiento de 128 K tokens o más. Los expertos enrutados usan cuantización NVFP4 (formato modelopt), mientras que la atención, los expertos compartidos, los embeddings y la torre de visión se mantienen en BF16. El modelo conserva el vocabulario completo de 154.880 tokens y la torre de visión intacta.

La relevancia actual radica en que demuestra una ruta práctica para servir modelos MoE de gran tamaño en hardware de consumo profesional con tensor cores FP4 nativos, manteniendo una calidad cercana al modelo completo de 288 expertos en los benchmarks medidos. Incluye además una capa MTP (Multi-Token Prediction) para decodificación especulativa, con exportaciones tanto en BF16 como en NVFP4.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture-of-Experts) con torre de visión y capa MTP; derivado de zai-org/GLM-5.3-Flash |
| Parámetros totales | 127.627.162.814 (~127,6 B) |
| Parámetros activos | 18 B por token (top-8 de 224 expertos enrutados + experto compartido + atención) |
| Longitud de contexto | No disponible de forma explícita; la model card menciona trazas de razonamiento de 128 K+ tokens y presupuestos de 163.840 tokens en benchmarks |
| Tipos de cuantización | NVFP4 para expertos enrutados (grupos de 16 elementos, escala de grupo e4m3, escala de tensor fp32); BF16 para atención, expertos compartidos, embeddings y torre de visión; etiqueta 8-bit en Hugging Face |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 175,9 GB; pesos declarados de 141 GiB / 151,5 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE derivado de GLM-5.3-Flash. Cada capa contiene 224 expertos enrutados (frente a los 288 del modelo original), seleccionados mediante Neural Architecture Search, y activa 18 B de parámetros por token mediante un enrutamiento top-8 más un experto compartido. La cuantización NVFP4 se aplica únicamente a los expertos enrutados, aprovechando los tensor cores FP4 nativos de la arquitectura Blackwell (GB10, B200, GB200); el resto de componentes (atención, expertos compartidos, embeddings, torre de visión) permanece en BF16. El vocabulario completo de 154.880 tokens y la torre de visión se conservan sin modificaciones.

El checkpoint incluye la capa MTP (Multi-Token Prediction) del modelo original sin modificar en el directorio `mtp/` (BF16), como borrador opcional para decodificación especulativa, con una exportación NVFP4 lista para usar en `mtp-nvfp4/` (6,95 GB). Según el autor, la capa MTP proporciona aproximadamente 1,85× de velocidad de decodificación en un solo flujo sobre B200 con la misma calidad de salida. No se detallan en la información disponible los datos de entrenamiento originales (número de tokens, composición del dataset, uso de RLHF/DPO) del modelo base GLM-5.3-Flash.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable mediante `reasoning_effort` (valores `low`, `high`, `max`) en la plantilla de chat.
- Generación de código: resultados de 98,2 % en HumanEval con muestreo y 95,7 % con decodificación greedy.
- Razonamiento matemático: 88,3 % pass@1 en AIME 2025 con presupuesto de 163.840 tokens.
- Razonamiento científico de nivel avanzado: 90,9 % en GPQA-Diamond.
- Procesamiento de imagen y vídeo (pipeline image-text-to-text) gracias a la torre de visión intacta.
- Decodificación especulativa mediante capa MTP incluida (BF16 y NVFP4).
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita en la información proporcionada.

## Casos de uso

- Razonamiento científico y técnico asistido: el modelo puede abordar preguntas de nivel doctorado en física, química y biología (90,9 % en GPQA-Diamond) con presupuestos de pensamiento largos, adecuado para herramientas de investigación que requieren cadenas de razonamiento extensas.
- Generación de código en producción: con 98,2 % en HumanEval y soporte de vLLM, puede integrarse en pipelines de generación y revisión de código donde se prioriza la corrección sintáctica y semántica.
- Resolución de problemas matemáticos complejos: útil en plataformas educativas o de evaluación que necesitan resolver problemas de competición (AIME) con trazas de razonamiento verificables.
- Análisis multimodal de documentos: la torre de visión permite procesar imágenes y texto combinados, por ejemplo para extraer información de capturas, diagramas o documentos escaneados en flujos de trabajo empresariales.
- Despliegue en estaciones de trabajo con dos DGX Spark: gracias a su huella de 141 GiB, permite servir un modelo MoE de 127,6 B parámetros en hardware de escritorio con 256 GB de memoria unificada, ideal para equipos de investigación sin acceso a clústeres.
- Servicio de inferencia de alto rendimiento en B200/GB200: con decodificación especulativa MTP (1,85× de aceleración) y hasta 71,8 tok/s en concurrencia 8-way sobre dos DGX Spark, adecuado para aplicaciones interactivas con múltiples usuarios.
- Experimentación con cuantización NVFP4: sirve como referencia práctica para estudiar el impacto de la reducción de expertos por NAS y la cuantización FP4 en la calidad de un MoE grande.

## Benchmarks y rendimiento

Medidos en una sola NVIDIA B200 con vLLM, muestreo `temperature=1.0, top_p=0.95` (HumanEval también con greedy). La puntuación es estricta: una respuesta sin respuesta final cuenta como incorrecta. Los números son ejecuciones únicas; el autor indica ±2-3 puntos de ruido por la no determinación del decodificado MoE en vLLM.

| Benchmark | Configuración | Este modelo | Referencia 288 expertos |
|---|---|---|---|
| GPQA-Diamond (198) | effort=max, presupuesto 163.840 tokens | 90,9 % (180/198) | 90,57 % (RedHatAI NVFP4) · 92,1 % (NVIDIA NVFP4, presupuesto 327 K) |
| AIME 2025 (30 × 4 muestras, pass@1) | effort=max, presupuesto 163.840 tokens | 88,3 % (106/120); 29/30 resueltos en ≥1 muestra | 86,67 % (RedHatAI NVFP4, 8 semillas) |
| HumanEval (164) | T=1.0, top_p=0.95 | 98,2 % (161/164) | No disponible |
| HumanEval (164) | greedy | 95,7 % (157/164) | No disponible |

Rendimiento de despliegue en dos DGX Spark (según el runbook del autor, vLLM 0.31.0, TP=2, caché KV fp8): 15,7 tok/s en un solo flujo y 71,8 tok/s con concurrencia 8-way, con ambas GPUs a ≈96 % de utilización. Estas cifras de Spark no han sido medidas por el autor en hardware Spark, sino calculadas a partir de la huella de pesos medida en B200.

## Requisitos de hardware

- VRAM / memoria estimada: 141 GiB de pesos (151,5 GB). En dos DGX Spark, unos 70 GiB por nodo dejan aproximadamente 40 GiB por nodo para caché KV.
- GPU recomendadas: una B200 o GB200 con ≥180 GB de memoria puede ejecutarlo en solitario; dos DGX Spark (GB10) conectados por ConnectX-7 (256 GB de memoria unificada en total) es el escenario objetivo.
- Un solo DGX Spark (128 GB) no es suficiente: los pesos por sí solos exceden la memoria disponible.
- Cabe en GPU de consumo: no; ninguna GPU consumer actual dispone de memoria suficiente para los pesos completos.
- Opciones de despliegue: vLLM (versión 0.31.0 en el runbook del autor), con tensor parallelism TP=2 y caché KV en fp8; el autor proporciona un runbook detallado en `DEPLOY-2X-DGX-SPARK.md`.
- Latencia y throughput: 15,7 tok/s en un solo flujo y 71,8 tok/s a concurrencia 8-way en dos DGX Spark según el autor; en B200 se espera un rendimiento absoluto mucho mayor (GB10 tiene aproximadamente 30× menos ancho de banda de memoria). La decodificación especulativa MTP aporta ~1,85× en un solo flujo sobre B200.

## Comparativa con modelos similares

| Modelo | Parámetros | Expertos enrutados/capa | Contexto | Licencia | Memoria de pesos | Disponibilidad |
|---|---|---|---|---|---|---|
| GLM5.3-Flash-E224-DGX-Spark (este) | 127,6 B (18 B activos) | 224 | 128 K+ (implícito) | MIT | 141 GiB | Hugging Face, vLLM |
| GLM-5.3-Flash (FP8) | No disponible | 288 | No disponible | No disponible | 306 GiB | Hugging Face (zai-org) |
| GLM-5.3-Flash NVFP4 (288 expertos) | No disponible | 288 | No disponible | No disponible | ~190 GiB | Hugging Face (RedHatAI / NVIDIA) |
| GLM-5.3-Flash NVFP4 (NVIDIA) | No disponible | 288 | No disponible | No disponible | No disponible | Hugging Face (NVIDIA) |

Las comparaciones de rendimiento entre este modelo y las variantes de 288 expertos se detallan en la sección de benchmarks: las diferencias son de ruido salvo algunos puntos en GPQA-Diamond.

## Limitaciones y advertencias

- Es un derivado no oficial: no está publicado por zai-org, sino por el usuario autotrust; la calidad y el soporte no están garantizados por el desarrollador original.
- La reducción de 288 a 224 expertos puede degradar ligeramente el rendimiento en tareas específicas; el autor reporta una brecha dentro del ruido salvo en GPQA-Diamond.
- Las cifras de memoria y throughput para DGX Spark están calculadas a partir de la huella medida en B200, no medidas en hardware Spark; el rendimiento absoluto en Spark será mucho menor.
- Idiomas limitados a inglés y chino; no hay soporte declarado de castellano.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni detalles de entrenamiento (RLHF/DPO) en la información disponible.
- La licencia MIT permite uso comercial, pero al ser un derivado conviene verificar la licencia del modelo base zai-org/GLM-5.3-Flash (no disponible en la información proporcionada).
- El decodificado MoE en vLLM no es bit-determinista, lo que introduce variabilidad de ±2-3 puntos en benchmarks.
- Requiere hardware Blackwell con soporte NVFP4 para aprovechar la cuantización; en otras arquitecturas el rendimiento puede degradarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/autotrust/GLM5.3-Flash-E224-DGX-Spark
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Demo en vivo de AutoTrust/GuruSearch: https://news.guru.so/ui
- Runbook de despliegue en dos DGX Spark: incluido en el repositorio como `DEPLOY-2X-DGX-SPARK.md`
- Capa MTP BF16: directorio `mtp/` del repositorio
- Capa MTP NVFP4: directorio `mtp-nvfp4/` del repositorio
