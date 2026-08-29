# pipenetwork/GLM-5.3-REAP50-MLX-4bit

## Resumen

GLM-5.3-REAP50-MLX-4bit es una conversión a MLX (Apple Silicon) del modelo GLM-5.3 de Z.ai, cuantizada a 4 bits y sometida a una poda REAP que elimina el 50% de los expertos enrutados (128 de 256 por capa). El resultado es un checkpoint de 214,7 GB que cabe en un Mac con 256 GB de RAM unificada, frente a los 418,6 GB de la versión 4-bit sin podar. El modelo base original tiene 744B parámetros (MoE con top-8), pero este build reduce el número efectivo de parámetros al conservar solo la mitad de los expertos; el safetensors reporta 59.737.153.152 parámetros, cifra que corresponde a los pesos almacenados tras la poda y cuantización.

El desarrollo corre a cargo de pipenetwork, que ha adaptado el runtime `glm_moe_dsa` para implementar correctamente el esquema de indexación ligera (lightning indexer) que el modelo original distribuye en 21 de sus 78 capas, evitando así los fallos de carga que se producen con la implementación genérica de mlx-lm. Es relevante porque permite ejecutar un modelo de frontera en hardware de Apple sin necesidad de GPUs NVIDIA, aunque con una penalización notable en perplejidad respecto a otras cuantizaciones. Este build concreto está pensado para usuarios que priorizan el tamaño reducido sobre la calidad máxima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con 256 expertos por capa (top-8), atención MLA con atención dispersa estilo DeepSeek-V3.2, 75 capas MoE + 3 capas densas, indexador ligero en 21 capas |
| Parametros totales | 744B (modelo base); safetensors reporta 59.737.153.152 tras poda y cuantización |
| Parametros activos | 40B (modelo base, según Unsloth) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit, grupo 64 (todos los pesos, excepto indexador y router en bf16/fp32) |
| Idiomas soportados | no disponible (multilingüe por el modelo base, sin especificar) |
| Licencia | glm-5.3 (licencia propia de Z.ai, con restricciones) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 de Z.ai es un transformer MoE con atención MLA (Multi-head Latent Attention) y un mecanismo de atención dispersa heredado de DeepSeek-V3.2. Consta de 78 capas, de las cuales 75 son capas MoE con 256 expertos enrutados (top-8) y 3 capas densas iniciales. Además, incluye una capa de multi-token prediction (la capa 78) que no se ha incluido en este build. El modelo base se entrenó sobre el mismo conjunto de datos que GLM-5.2; todas las mejoras de GLM-5.3 provienen de post-entrenamiento, según el blog oficial de Z.ai.

Este build concreto aplica dos modificaciones sobre el checkpoint bf16 original: primero, una cuantización a 4-bit con grupo 64 en todos los pesos (excepto el indexador y el router, que se mantienen en bf16/fp32); segundo, una poda REAP (saliency-based pruning) que selecciona 128 de los 256 expertos por capa, conservando el 67,3% de la masa de saliencia media. La poda se aplicó sobre el modelo ya cuantizado, lo que es equivalente a podar en bf16 y requantizar. El runtime incluido implementa el esquema de indexación original (21 capas con indexador propio, 57 capas que reutilizan el top-k de la capa anterior) y corrige la inicialización aleatoria que mlx-lm produce en las capas sin indexador.

## Capacidades

- Generación de texto y conversación, con soporte de contexto largo (no especificado, pero el modelo base maneja ventanas amplias).
- Razonamiento y resolución de tareas complejas, especialmente en programación y tareas de largo horizonte (agentes).
- Según Z.ai, GLM-5.3 es el modelo open-weights más capaz para coding, con una mejora del 50% sobre GLM-5.2 en su benchmark interno Z.ai Code Bench.
- Capacidades multilingües (idiomas no especificados en la documentación).
- No se confirma soporte de tool calling ni function calling en la información disponible.
- No incluye la capa de multi-token prediction del modelo original.

## Casos de uso

- Desarrollo de asistentes de código en entornos Apple Silicon: el modelo puede ejecutarse localmente en un Mac con 256 GB de RAM, generando código y completando funciones con baja latencia gracias a la cuantización 4-bit, aunque con una calidad inferior a la versión sin podar.
- Investigación en eficiencia de modelos MoE: la poda REAP y la comparación de perplejidad entre builds permiten estudiar el impacto de la eliminación de expertos en modelos de gran escala.
- Prototipado de agentes conversacionales en hardware de consumo: su capacidad de razonamiento y generación de texto lo hace útil para pruebas de agentes que requieran ejecución local sin GPUs dedicadas.
- Análisis de textos largos (hasta 2048 tokens de forma fiable): puede procesar documentos extensos en un Mac, útil para resúmenes o extracción de información.
- Evaluación de cuantizaciones extremas: sirve como referencia para medir la degradación de calidad en modelos MoE de 744B cuando se reduce a 4-bit y se podan expertos.
- Entornos con restricciones de memoria: su tamaño de 214,7 GB lo hace viable en máquinas con 256 GB de RAM, donde los builds sin podar (418 GB) no caben.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card proporciona dos métricas de calidad:

**Perplejidad en wikitext-2 (test)**, 288.627 tokens en 141 ventanas de 2048, para builds que caben en la máquina de prueba:

| Build | Tamaño | Perplejidad [95% CI] |
|---|---:|---:|
| 4bit (sin podar) | 418,6 GB | 2,8636 [2,6681, 3,0714] |
| mixed-4_8bit | 427,8 GB | 2,7420 [2,5533, 2,9477] |
| mixed-3_6bit | 332,6 GB | 3,0338 [2,8366, 3,2386] |
| REAP25-4bit | 316,6 GB | 3,2872 [3,0703, 3,5184] |
| REAP37-4bit | 267,2 GB | 3,8517 [3,6212, 4,0937] |
| **REAP50-4bit** | **214,7 GB** | **5,0295 [4,7571, 5,3137]** |

**Divergencia por capa vs bf16** (16.384 tokens de wikitext-2, error L2 relativo de la salida de cada capa):

| Receta | Teacher-forced (media) | Free-running (última capa) | Coseno (final) |
|---|---:|---:|---:|
| 8bit | 0,00685 | 0,13119 | 0,98945 |
| 6bit | 0,01465 | 0,16736 | 0,98389 |
| 5bit | 0,02651 | 0,22521 | 0,97272 |
| 4bit | 0,05161 | 0,35740 | 0,93390 |
| mixed-4_8bit | 0,02524 | 0,24951 | 0,96710 |
| mixed-3_6bit | 0,05242 | 0,42380 | 0,90624 |
| fp8 | 0,01741 | 0,17321 | 0,98320 |

## Requisitos de hardware

- VRAM/RAM: 256 GB de RAM unificada en un Mac con Apple Silicon (el checkpoint pesa 214,7 GB en disco, y el modelo necesita cargarse completo en memoria).
- GPU: cualquier chip Apple Silicon con al menos 256 GB de RAM unificada (por ejemplo, M2 Ultra o M3 Ultra con configuración máxima). No es compatible con GPUs NVIDIA.
- Opciones de despliegue: mlx-lm (`mlx_lm.generate`), con `--trust-remote-code` para cargar el runtime personalizado. También puede usarse desde scripts Python con `mlx_lm.load`.
- Latencia y throughput: no se proporcionan datos. La cuantización 4-bit y la poda reducen el cómputo, pero el modelo sigue siendo grande; la generación será lenta en comparación con modelos más pequeños.

## Comparativa con modelos similares

Comparación con otros builds de GLM-5.3 disponibles en el ecosistema MLX (misma arquitectura, diferentes niveles de poda y cuantización):

| Build | Tamaño | Perplejidad (wikitext-2) | Cuantización | Poda |
|---|---|---|---|---|
| GLM-5.3-MLX-4bit | 418,6 GB | 2,8636 | 4-bit | Ninguna |
| GLM-5.3-MLX-mixed-4_8bit | 427,8 GB | 2,7420 | 4-bit + 8-bit (no expertos) | Ninguna |
| GLM-5.3-REAP25-MLX-4bit | 316,6 GB | 3,2872 | 4-bit | 25% expertos |
| GLM-5.3-REAP37-MLX-4bit | 267,2 GB | 3,8517 | 4-bit | 37% expertos |
| **GLM-5.3-REAP50-MLX-4bit** | **214,7 GB** | **5,0295** | **4-bit** | **50% expertos** |

Frente a otros modelos de código abierto comparables (p. ej., DeepSeek-V3 o Qwen3-MoE), no se dispone de datos de benchmarks en la información proporcionada.

## Limitaciones y advertencias

- La poda del 50% de expertos degrada notablemente la calidad: la perplejidad en wikitext-2 es un 75% superior a la del build 4-bit sin podar (5,03 vs 2,86).
- El runtime incluido es necesario para una carga correcta; mlx-lm sin el parche deja 57 indexadores inicializados aleatoriamente, lo que provoca degradación en prompts de más de 2048 tokens.
- No incluye la capa de multi-token prediction del modelo original, lo que puede afectar a la velocidad de generación.
- Licencia glm-5.3: es una licencia propia de Z.ai con restricciones de uso comercial; debe revisarse el archivo LICENSE antes de desplegar en producción.
- No se especifican los idiomas soportados ni la longitud de contexto máxima, por lo que se recomienda validar empíricamente antes de usar en aplicaciones multilingües o con contextos largos.
- El safetensors reporta 59,7B parámetros, pero el modelo base tiene 744B; esta discrepancia puede deberse a la poda y cuantización, pero no está documentada con precisión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pipenetwork/GLM-5.3-REAP50-MLX-4bit
- Modelo base (GLM-5.3): https://huggingface.co/zai-org/GLM-5.3
- Modelo base bf16: https://huggingface.co/zai-org/GLM-5.3-BF16
- Repositorio de código del runtime: https://github.com/PipeNetwork/glm53-mlx
- Blog de Z.ai sobre GLM-5.3: https://z.ai/blog/glm-5.3
- Repositorio oficial GLM-5: https://github.com/zai-org/GLM-5
- Documentación de Unsloth para GLM-5.3: https://unsloth.ai/docs/models/glm-5.3
- Otros builds de pipenetwork: https://huggingface.co/pipenetwork/GLM-5.3-MLX-4bit, https://huggingface.co/pipenetwork/GLM-5.3-MLX-mixed-4_8bit, https://huggingface.co/pipenetwork/GLM-5.3-MLX-mixed-3_6bit, https://huggingface.co/pipenetwork/GLM-5.3-REAP25-MLX-4bit, https://huggingface.co/pipenetwork/GLM-5.3-REAP37-MLX-4bit
