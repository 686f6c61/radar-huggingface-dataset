# AEON-7/supergemma4-26b-abliterated-multimodal-nvfp4

## Resumen

SuperGemma4 26B Abliterated Multimodal NVFP4 es una cuantización en formato NVFP4 (FP4 nativo de NVIDIA) del modelo Jiunsong/supergemma4-26b-abliterated-multimodal, publicado por el usuario AEON-7. Se trata de una variante "abliterated" (eliminación de mecanismos de rechazo) del modelo Gemma 4 de Google en su configuración de 26.000 millones de parámetros con arquitectura Mixture-of-Experts (MoE) dispersa, con aproximadamente 4.000 millones de parámetros activos por token. El modelo es multimodal (procesa imagen y texto) e incorpora modo de razonamiento ("thinking").

La relevancia de esta ficha radica en que el checkpoint está específicamente optimizado para GPUs Blackwell (SM 10.0+) y para el ecosistema DGX Spark (GB10), empleando cuantización NVFP4 con el codificador visual preservado en BF16 completo. El autor reporta un throughput agregado máximo de 1.890 tokens/s con 256 peticiones concurrentes en DGX Spark, lo que lo posiciona como una opción de despliegue de altas prestaciones en hardware ARM64/Blackwell.

El modelo no es un lanzamiento oficial de Google: es una derivación de terceros sobre Gemma 4, con la licencia Gemma aplicable. Su atractivo principal es la combinación de contexto largo (hasta 65.536 tokens en la configuración verificada), capacidades agénticas (tool calling, function calling), visión y un formato de pesos cuantizado de forma nativa para FP4, todo ello con requisitos de despliegue muy específicos que el autor documenta en detalle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) dispersa, tipo gemma4, con atención de ventana deslizante (sliding-window attention) |
| Parametros totales | 25.805.936.206 (≈25,8 B) |
| Parametros activos | ≈4 B por token (según tags "4b-active") |
| Longitud de contexto | 65.536 tokens en la configuración verificada (max-model-len); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | NVFP4 (FP4 nativo) para pesos; caché KV en FP8 (fp8_e4m3); codificador visual en BF16 completo. Repo etiquetado también como 8-bit y 4-bit |
| Idiomas soportados | Inglés (en) |
| Licencia | Gemma (licencia de Google para modelos Gemma) |
| Formato de pesos | safetensors (formato ModelOpt NVFP4); librería transformers |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 de 26 B con arquitectura Mixture-of-Experts dispersa: de los 25,8 B de parámetros totales, solo alrededor de 4 B se activan por token, lo que reduce el coste computacional por inferencia manteniendo la capacidad del modelo completo. Emplea atención de ventana deslizante (sliding-window attention), lo que permite gestionar contextos largos con menor coste de memoria, y un codificador visual para entrada imagen-texto. La variante publicada por AEON-7 aplica cuantización NVFP4 mediante NVIDIA ModelOpt 0.43 con la configuración `NVFP4_DEFAULT_CFG`, ejecutada en una GPU Blackwell nativa; el codificador visual se mantiene en BF16 completo para preservar la calidad de la percepción visual.

El modelo base procede de Jiunsong/supergemma4-26b-abliterated-multimodal, una versión "abliterated" que elimina los mecanismos de rechazo del Gemma 4 original. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF/DPO en el modelo base. La innovación técnica destacable de esta ficha es la cuantización NVFP4 con escalas descompuestas por experto, que requiere un manejo específico de plugins en vLLM (imagen `-awq`, forzado de Marlin MoE, `--quantization modelopt`) y que el autor documenta como requisito imprescindible para evitar salidas corruptas o fallos de carga.

## Capacidades

- Generación de texto conversacional y de chat multi-turno.
- Razonamiento explícito con modo "thinking" (parser de razonamiento `gemma4` en vLLM).
- Generación de código (etiqueta "coding").
- Escritura creativa (etiqueta "creative-writing").
- Procesamiento multimodal imagen-texto (pipeline image-text-to-text, codificador visual en BF16).
- Tool calling y function calling (soporte de `--enable-auto-tool-choice` y `--tool-call-parser gemma4`).
- Uso agéntico y razonamiento multi-paso (etiqueta "agentic").
- Contexto largo (hasta 65.536 tokens en la configuración verificada) con chunked prefill y prefix caching.
- Capacidades multilingües limitadas al inglés según la model card.
- Modelo "abliterated": sin mecanismos de rechazo (refusal-removed), lo que permite respuestas sin filtrado.

## Casos de uso

- Asistente conversacional de atención al cliente: el modelo puede mantener conversaciones multi-turno con contexto de hasta 65.536 tokens, lo que permite arrastrar historial extenso y documentación de producto sin truncar. Adecuado por su modo chat y su ventana de contexto amplia.
- Generación de código en pipelines de CI/CD: gracias al soporte de tool calling y function calling, puede integrarse como agente que invoca herramientas de build, tests o linters dentro de un flujo automatizado.
- Agente autónomo multi-paso: la combinación de razonamiento "thinking", tool calling y contexto largo lo hace apto para tareas que requieren planificación y ejecución de varias llamadas a herramientas.
- Análisis de documentos con imágenes: al ser multimodal (imagen-texto), puede procesar capturas, diagramas o documentos escaneados junto con texto para extraer información o responder preguntas.
- Despliegue en DGX Spark (GB10) para inferencia de producción: el checkpoint está calibrado y verificado para esta plataforma, con throughput reportado de 1.890 tok/s a 256 concurrentes, lo que lo hace adecuado para servir cargas medias-altas en hardware ARM64/Blackwell.
- Generación de contenido creativo sin filtrado: la variante abliterated permite escribir ficción, guiones o textos creativos sin los rechazos del modelo original, útil en entornos editoriales controlados.
- Servicio compatible con OpenAI API: al servirse con vLLM y los parsers `gemma4`, puede exponerse como endpoint compatible con la API de OpenAI para integrarse en aplicaciones existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor únicamente reporta una métrica de rendimiento de serving:

| Metrica | Valor | Condiciones |
|---|---|---|
| Throughput agregado máximo | 1.890 tok/s | DGX Spark (GB10), 256 peticiones concurrentes |
| Rango de concurrencia verificado | 1 a 256 | Calibrado, exportado y servido en Spark |

## Requisitos de hardware

- GPU nativa Blackwell obligatoria (SM 10.0+): verificado en GB10 (SM 12.0, DGX Spark) y RTX PRO 6000 Blackwell (SM 12.1); debería funcionar en B200/GB200 (SM 10.0). Las GPUs Ampere y Ada no tienen ruta de cómputo FP4 nativa y no son válidas.
- VRAM estimada: no disponible de forma explícita; el repo ocupa 98,9 GB, aunque el checkpoint cuantizado NVFP4 con codificador visual en BF16 requiere bastante menos en ejecución. La configuración verificada usa `--gpu-memory-utilization 0.70` con `--max-model-len 65536` y `--max-num-seqs 4`.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) por la exigencia de FP4 nativo y el tamaño del modelo; el hardware objetivo es Blackwell profesional o de centro de datos.
- Opciones de despliegue: vLLM 0.19.1rc1.dev110 o superior con kernels FP4 compilados para SM 10/12; imagen de contenedor `ghcr.io/aeon-7/vllm-spark-gemma4-nvfp4-awq:latest` (obligatoria). Requiere `--quantization modelopt`, `VLLM_TEST_FORCE_FP8_MARLIN=1`, `VLLM_MARLIN_USE_ATOMIC_ADD=1`, caché KV `fp8_e4m3`, chunked prefill y prefix caching.
- Parches obligatorios: montar `gemma4_patched.py` y `serving_chat_patched.py`; `modelopt_patched.py` ya está incluido en la imagen y no debe montarse encima.
- Latencia y throughput: throughput agregado máximo reportado de 1.890 tok/s a 256 concurrentes en DGX Spark; latencia individual no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SuperGemma4 26B Abliterated Multimodal NVFP4 (este) | 25,8 B totales / ≈4 B activos | 65.536 tokens (config. verificada) | Gemma | Hugging Face, requiere Blackwell + vLLM parcheado | Cuantización NVFP4 nativa, multimodal, abliterated |
| Jiunsong/supergemma4-26b-abliterated-multimodal (modelo base) | 25,8 B totales / ≈4 B activos | no disponible | Gemma | Hugging Face | Mismo modelo sin cuantizar; sin requisitos FP4 |
| Gemma 4 26B original (Google) | 25,8 B totales / ≈4 B activos | no disponible | Gemma | Hugging Face / Google | Modelo de referencia con filtros de seguridad intactos |

No se dispone en la información proporcionada de resultados de benchmarks que permitan comparar el rendimiento cualitativo con alternativas; la comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo abliterated: los mecanismos de rechazo han sido eliminados, por lo que puede generar contenido inapropiado, ofensivo o peligroso sin filtrado. Requiere moderación externa en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad en la información disponible.
- Soporte de idiomas limitado al inglés según la model card; el rendimiento en castellano no está verificado.
- Licencia Gemma de Google: existen restricciones de uso comercial y obligaciones de atribución que deben revisarse antes de desplegar en producción.
- Requisitos de despliegue muy estrictos: GPU Blackwell nativa, imagen de contenedor específica, variables de entorno concretas y dos parches montados. Desviarse produce salidas corruptas o fallos de carga, según documenta el autor.
- La decodificación especulativa (EAGLE3) no está soportada para Gemma 4 en upstream; no debe montarse `eagle_patched.py`.
- El uso de `--kv-cache-dtype fp8` en lugar de `fp8_e4m3` provoca deriva de precisión en contexto largo.
- No se han publicado datos sobre sesgos conocidos ni sobre el volumen y composición del dataset de entrenamiento del modelo base.
- El checkpoint está pensado para hardware ARM64/Blackwell (DGX Spark); su portabilidad a otras plataformas no está verificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AEON-7/supergemma4-26b-abliterated-multimodal-nvfp4
- Modelo base: https://huggingface.co/Jiunsong/supergemma4-26b-abliterated-multimodal
- Imagen de contenedor vLLM (referenciada en la model card): ghcr.io/aeon-7/vllm-spark-gemma4-nvfp4-awq:latest
- Soporte del autor: https://lotusmake.com/support
- No se han encontrado en la información proporcionada enlaces a papers, blogs o repositorios adicionales.
