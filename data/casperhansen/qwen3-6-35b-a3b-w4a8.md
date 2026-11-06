# casperhansen/Qwen3.6-35B-A3B-W4A8

## Resumen

Qwen3.6-35B-A3B-W4A8 es una cuantización entera (integer-only) del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario casperhansen. El objetivo es ofrecer una versión del modelo original que pueda ejecutarse en aceleradores que solo realizan aritmética entera, como FPGAs y NPUs, donde las operaciones en coma flotante no están disponibles o resultan ineficientes. Para ello, todas las capas lineales del modelo de lenguaje, salvo la pequeña proyección de entrada MTP `mtp.fc`, almacenan pesos enteros simétricos con una escala por canal de salida y sin punto cero.

El modelo base es un transformer de tipo mixture-of-experts (MoE) con capacidades multimodales (pipeline `image-text-to-text`), del que se derivan 18.723.325.808 parámetros reales en el checkpoint cuantizado. La receta de cuantización es deliberadamente simple: pesos INT4 con escala por canal de salida elegida mediante una búsqueda de recorte por MSE, y activaciones INT8 dinámicas por token calculadas en línea, sin datos de calibración, sin GPTQ, sin rotaciones ni suavizado. El resultado es un checkpoint de 19 GB frente a los aproximadamente 70 GB del modelo en BF16.

La relevancia de esta ficha radica en su carácter especializado: no es una cuantización orientada a GPUs convencionales, sino a hardware de aritmética entera. Esto la hace útil para investigación en despliegue sobre FPGAs y NPUs, y como referencia de formato de pesos enteros empaquetados con compressed-tensors. La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (qwen3_5_moe), con atención lineal Gated DeltaNet y atención completa |
| Parametros totales | 18.723.325.808 (checkpoint cuantizado); modelo base denominado 35B-A3B |
| Parametros activos | no disponible (el modelo base es MoE con 256 expertos enrutados por capa más experto compartido; no se detalla el número de activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8 integer-only: pesos INT4 (per-output-channel) y activaciones INT8 dinámicas por token; router, `lm_head` y gates en INT8 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, formato compressed-tensors `pack-quantized` (weight_packed int32, weight_scale bfloat16, weight_shape int) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer de mezcla de expertos con dos tipos de atención: atención lineal basada en Gated DeltaNet (con proyecciones `in_proj_qkv`, `in_proj_z`, `in_proj_a`, `in_proj_b` y `out_proj`) y atención completa (`q_proj` con puerta de salida, `k_proj`, `v_proj`, `o_proj`). Cada capa contiene 256 expertos enrutados más un experto compartido, con proyecciones `gate_proj`, `up_proj` y `down_proj`. Incluye además una capa MTP (multi-token prediction) con los mismos módulos que una capa decodificadora, y un codificador visual (`model.visual.*`) que se mantiene en BF16 en esta cuantización.

La cuantización parte de la versión oficial en FP8 (`Qwen/Qwen3.6-35B-A3B-FP8`), dequantizada a BF16 y recuantizada. Los pesos se redondean al más cercano con una escala por canal de salida obtenida mediante búsqueda en rejilla de ratios de recorte que minimiza el error de cuantización por fila; según el autor, esto reduce el error de pesos INT4 en torno a un 30 % frente a un escalado absmax simple. No se emplean datos de calibración, GPTQ, rotaciones, suavizado ni entrenamiento. Las activaciones se cuantizan en línea a INT8 simétrico con una escala absmax por token y por entrada de módulo, sin escalas estáticas ni manejo de valores atípicos. Los tensores `embed_tokens`, `linear_attn.conv1d`, todos los pesos RMSNorm, `A_log`, `dt_bias`, `mtp.fc` y el codificador visual permanecen en BF16. La acumulación entera cabe en INT32 (máximo aproximado de 4,2 M para INT4×INT8 con K ≤ 4096 y de 33,3 M para INT8×INT8 con K = 2048).

## Capacidades

- Generación de texto conversacional en formato multi-turno (tag `conversational`).
- Procesamiento conjunto de imagen y texto (pipeline `image-text-to-text`), con codificador visual en BF16.
- Razonamiento y matemáticas: no se documentan capacidades específicas en la información disponible.
- Generación de código: no se documenta en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas soportados no se detallan.
- Capa MTP (multi-token prediction) presente en el modelo base y cuantizada en este checkpoint.
- Inferencia con aritmética entera exclusiva en las matmuls, apta para aceleradores sin coma flotante.

## Casos de uso

- Despliegue en FPGAs: el checkpoint está diseñado para aceleradores que solo realizan aritmética entera; las matmuls INT4×INT8 con acumulación INT32 y escalas por canal permiten implementar el modelo en lógica entera sin unidades de coma flotante.
- Aceleración en NPUs: las activaciones INT8 dinámicas por token y las escalas de pesos por canal de salida encajan con pipelines de cuantización de NPUs que exigen formatos enteros simétricos sin punto cero.
- Investigación en cuantización integer-only: sirve como referencia reproducible para estudiar el impacto de W4A8 sin calibración, sin GPTQ y sin rotaciones frente a esquemas como MXFP4/MXFP8 del mismo autor.
- Prototipado multimodal en hardware embebido: al mantener el codificador visual en BF16 y cuantizar solo el modelo de lenguaje, permite experimentar con tareas imagen-texto en plataformas con presupuesto de memoria reducido (19 GB frente a ~70 GB en BF16).
- Evaluación de formatos compressed-tensors: el uso del formato `pack-quantized` con `weight_packed`, `weight_scale` y `weight_shape` facilita integrar el modelo en toolchains compatibles con compressed-tensors.
- Comparación de recetas de cuantización: junto con la variante MXFP4xMXFP8 del mismo autor, permite medir el efecto de distintas estrategias (RTN con búsqueda MSE frente a RTN sin calibración) sobre el mismo modelo base.
- Docencia y experimentación con MoE: la estructura de 256 expertos enrutados más experto compartido, con router en INT8, permite estudiar el comportamiento de modelos MoE cuantizados en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 19 GB; el modelo base en BF16 ocupa aproximadamente 70 GB. La VRAM real depende del runtime, del tamaño de la caché KV y de la precisión elegida para las operaciones no matriciales (normas, SiLU, sigmoid, softmax, RoPE, estado recurrente de Gated DeltaNet), que el checkpoint no prescribe.
- GPU recomendadas: no disponible. El modelo está orientado a aceleradores de aritmética entera (FPGAs, NPUs); no se documentan GPUs concretas ni soporte verificado en A100, H100 o RTX 4090.
- Cabe en consumer GPU: no disponible como dato verificado; el tamaño de 19 GB es compatible en términos de memoria con GPUs de 24 GB, pero la ejecución requiere un runtime que soporte el formato integer-only, que no se documenta.
- Opciones de despliegue: librería `transformers` con soporte de compressed-tensors; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| casperhansen/Qwen3.6-35B-A3B-W4A8 | 18.723.325.808 | no disponible | W4A8 integer-only, sin calibracion | apache-2.0 | Hugging Face |
| casperhansen/Qwen3.6-35B-A3B-MXFP4xMXFP8 | ~36B (segun OpenModelStats) | no disponible | MXFP4 pesos / MXFP8 activaciones, RTN sin calibracion | no disponible | Hugging Face |
| Qwen/Qwen3.6-35B-A3B-FP8 | no disponible | no disponible | FP8 | no disponible | Hugging Face |
| Qwen/Qwen3.6-35B-A3B (base) | 35B-A3B (denominacion) | no disponible | BF16 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Modelo especializado: la cuantización integer-only está pensada para aceleradores de aritmética entera; en GPUs convencionales puede no ofrecer ventajas o no ser ejecutable sin un runtime específico.
- El checkpoint no prescribe precisión para las operaciones no matriciales (normas, SiLU, sigmoid, softmax, RoPE, estado recurrente de Gated DeltaNet) ni para la caché KV; el implementador debe elegir formatos en punto fijo, lo que introduce decisiones de ingeniería no resueltas por el modelo.
- La cuantización no usa calibración, GPTQ, rotaciones ni suavizado; según el autor, la búsqueda MSE reduce el error de pesos INT4 en torno a un 30 % frente a absmax, pero no se publican métricas de degradación de calidad en benchmarks.
- El codificador visual permanece en BF16, por lo que el despliegue en hardware puramente entero requiere gestionar aparte esa parte del modelo.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no disponible en la información proporcionada; aplican los riesgos generales del modelo base.
- Idiomas soportados: no disponible; no se puede confirmar cobertura multilingüe.
- Longitud de contexto: no disponible; no se puede garantizar el comportamiento en contextos largos.
- Licencia Apache 2.0, que permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base Qwen/Qwen3.6-35B-A3B, no detalladas en la información proporcionada.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación comunitaria.
- El autor lo publica como cuantización de desarrollo; no se documenta soporte oficial ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/casperhansen/Qwen3.6-35B-A3B-W4A8
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Versión FP8 del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8
- Variante MXFP4xMXFP8 del mismo autor: https://huggingface.co/casperhansen/Qwen3.6-35B-A3B-MXFP4xMXFP8
- Estadísticas de la variante MXFP4xMXFP8: https://openmodelstats.com/models/casperhansen/qwen3.6-35b-a3b-mxfp4xmxfp8
- Repositorio compressed-tensors: https://github.com/neuralmagic/compressed-tensors
