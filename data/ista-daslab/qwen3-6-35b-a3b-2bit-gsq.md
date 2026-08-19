# ISTA-DASLab/Qwen3.6-35B-A3B-2Bit-GSQ

## Resumen

Qwen3.6-35B-A3B-2Bit-GSQ es una cuantización de baja precisión del modelo MoE Qwen/Qwen3.6-35B-A3B, desarrollada por el laboratorio ISTA-DASLab. El modelo base tiene 35 524 millones de parámetros totales y aproximadamente 3 000 millones de parámetros activos por token, lo que lo sitúa en la categoría de MoE eficientes para inferencia. La cuantización utiliza la técnica GSQ (Gumbel-Softmax Quantization), que combina una inicialización estilo GPTQ con un refinamiento mediante muestreo Gumbel-Softmax y el optimizador Lion, logrando un coste de almacenamiento efectivo de aproximadamente 2,13 bits por peso en los MLP de los expertos enrutados.

El checkpoint resultante emplea un esquema de precisión mixta: los MLP de expertos enrutados se cuantizan a 2 bits con codebook simétrico {-2, -1, 0, +1} × escala y grupo de 128 pesos; las capas de atención (self_attn y linear_attn), los expertos compartidos y la cabeza de salida se cuantizan a INT8; y los embeddings, normalizaciones y la puerta de enrutamiento MoE se mantienen en BF16. Todo el checkpoint se almacena en formato Humming de ancho exacto, lo que reduce la huella de memoria a aproximadamente 12,6 GB completos (o 9,9 GB si se eliminan los componentes de visión y MTP). La relevancia de este modelo radica en que permite ejecutar un LLM de 35B con razonamiento, código y contexto largo en hardware con VRAM limitada, manteniendo una degradación de rendimiento mínima frente al modelo original en tareas de razonamiento y matemáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), base Qwen3.6-35B-A3B |
| Parametros totales | 35.524.003.696 |
| Parametros activos | ~3 000 millones (3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit GSQ (MLP de expertos enrutados), INT8 (atencion, expertos compartidos, LM head), BF16 (embeddings, norms, gate) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (layout Humming exact-width 2-bit) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer MoE con 35 524 millones de parámetros totales y aproximadamente 3 000 millones de parámetros activos por token. La cuantización GSQ se aplica únicamente a los pesos, no requiere entrenamiento adicional del modelo completo. El proceso sigue un pipeline de dos etapas: primero se inicializan los codebooks mediante cuantización GPTQ, y después se refinan con muestreo Gumbel-Softmax utilizando el optimizador Lion. El codebook 2-bit es simétrico y escalar, con valores {-2, -1, 0, +1} multiplicados por una escala por grupo de 128 pesos. Los MLP de los expertos enrutados (gate_proj, up_proj, down_proj) se cuantizan a 2 bits, mientras que las capas de atención, los expertos compartidos y la cabeza de salida se cuantizan a INT8. Los componentes restantes (embeddings, normalizaciones, puerta de enrutamiento) se conservan en BF16. El checkpoint se almacena en formato Humming, que empaqueta los valores 2-bit en palabras INT32 (16 pesos por palabra), reduciendo el almacenamiento efectivo a aproximadamente 2,13 bits por peso. No se proporcionan datos sobre el dataset de entrenamiento del modelo base ni sobre el proceso de alineación (RLHF/DPO).

## Capacidades

- Generacion de texto y razonamiento: mantiene un rendimiento cercano al modelo base en tareas de razonamiento matematico y cientifico (AIME 2025, GPQA Diamond, GSM8K).
- Instrucciones y seguimiento: conserva la mayor parte de la capacidad de seguir instrucciones (IFEval) del modelo original.
- Codigo y contexto largo: la model card indica que se preserva el comportamiento de codigo y contexto largo del modelo base, aunque no se aportan benchmarks especificos.
- Multimodal: el pipeline declarado es image-text-to-text, y el checkpoint incluye pesos de vision opcionales. Sin embargo, la cuantizacion descrita se centra en los componentes de texto; los pesos de vision se pueden eliminar para uso exclusivamente textual.
- Decodificacion especulativa (MTP): el checkpoint incluye pesos de MTP (Multi-Token Prediction) opcionales, utilizables para decodificacion especulativa en vLLM.
- Soporte de tool calling / function calling: no se menciona explicitamente en la informacion disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Inferencia en GPUs con VRAM limitada: con un checkpoint de aproximadamente 9,9 GB (sin vision ni MTP), el modelo puede ejecutarse en tarjetas consumer de gama media-alta (por ejemplo, RTX 3080/3090 con 10-24 GB), manteniendo capacidades de razonamiento cercanas al modelo original.
- Despliegue en produccion con vLLM: el repositorio incluye un parche para vLLM 0.27.1 que permite servir el modelo con throughput alto. Es adecuado para aplicaciones de chat, asistentes y generacion de codigo donde la latencia y el coste de VRAM son criticos.
- Razonamiento matematico y cientifico: con una puntuacion de 93,33 en AIME 2025 (identica al modelo base) y 93,93 en GSM8K, es util para sistemas de tutoria, resolucion de problemas y analisis de datos.
- Seguimiento de instrucciones en entornos empresariales: el rendimiento en IFEval (87,77) lo hace viable para automatizacion de tareas administrativas, generacion de informes y asistentes de productividad.
- Prototipado rapido de aplicaciones MoE: al reducir la huella de memoria en un factor de aproximadamente 3,5 frente al modelo BF16, permite experimentar con arquitecturas MoE en hardware de desarrollo sin necesidad de clusters.
- Investigacion en cuantizacion extrema: el checkpoint sirve como referencia para estudiar el impacto de la cuantizacion 2-bit en modelos MoE, especialmente en tareas de razonamiento y codigo.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluacion comparando el checkpoint cuantizado con el modelo base original en cinco benchmarks:

| Benchmark | Base Model | 2-bit GSQ |
|---|---:|---:|
| AIME 2025 | 93,33 | 93,33 |
| GPQA Diamond | 83,84 | 80,30 |
| IFEval | 91,25 | 87,77 |
| MMLU-Pro | 84,87 | 81,00 |
| GSM8K | 96,21 | 93,93 |

La degradacion media es de aproximadamente 2,5 puntos porcentuales, con una perdida nula en AIME 2025 y maxima en GPQA Diamond (3,54 puntos). No se proporcionan comparaciones con otros modelos cuantizados ni con alternativas de la misma categoria.

## Requisitos de hardware

- GPU con soporte SM ≥ 80 (Ampere o Hopper). Esto incluye RTX 30xx, RTX 40xx, A100, A30, H100, entre otras.
- VRAM estimada: el checkpoint completo ocupa aproximadamente 12,6 GB en disco; sin pesos de vision y MTP, aproximadamente 9,9 GB. La VRAM real durante el servicio sera mayor, dependiendo de la asignacion de KV-cache, la longitud de contexto, el tamano de batch y la sobrecarga del runtime de vLLM.
- Para uso con vLLM: se requiere vLLM 0.27.1 y aplicar el parche `patch_vllm.py` incluido en el repositorio. El parche debe ejecutarse en el mismo entorno Python donde esta instalado vLLM.
- Opciones de despliegue: vLLM (con parche obligatorio). No se mencionan alternativas como llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no se proporcionan datos cuantitativos. Se espera que la cuantizacion 2-bit reduzca el ancho de banda de memoria, mejorando el throughput en comparacion con el modelo BF16, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otras cuantizaciones del mismo modelo base (por ejemplo, versiones 4-bit o 8-bit de Qwen3.6-35B-A3B) ni con modelos MoE de tamano similar en la informacion proporcionada. La unica referencia disponible es la comparacion interna con el modelo base sin cuantizar, presentada en la seccion de benchmarks. Por tanto, la comparativa con alternativas se considera no disponible.

## Limitaciones y advertencias

- Degradacion de rendimiento: se observan perdidas de entre 0 y 3,54 puntos porcentuales en los benchmarks evaluados, siendo GPQA Diamond el mas afectado. En tareas no cubiertas por estos benchmarks (por ejemplo, generacion creativa o dialogo abierto) la perdida podria ser mayor.
- Requisito de parche en vLLM: el modelo solo puede servirse con vLLM 0.27.1 tras aplicar el parche incluido. Cualquier actualizacion de vLLM o recreacion del entorno exige reaplicar el parche. Ejecutar el modelo con una version sin parche no esta soportado.
- Cuantizacion extrema: la precision de 2 bits en los MLP de expertos puede introducir artefactos en tareas que requieren alta precision numerica, como calculo cientifico o generacion de codigo con operaciones aritmeticas complejas.
- Componentes opcionales: los pesos de vision y MTP aumentan el tamano del checkpoint en aproximadamente 2,7 GB. Si se eliminan, las capacidades multimodales y de decodificacion especulativa dejan de estar disponibles.
- Idiomas y sesgos: no se ha publicado informacion sobre los idiomas soportados ni sobre sesgos conocidos. La ausencia de datos no implica ausencia de sesgos.
- Riesgo de alucinacion: no se ha evaluado especificamente en este checkpoint; se asume un comportamiento similar al del modelo base, que no se detalla en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/ISTA-DASLab/Qwen3.6-35B-A3B-2Bit-GSQ
- Paper (arXiv): https://arxiv.org/abs/2604.18556
- Pagina del paper en HuggingFace: https://huggingface.co/papers/2604.18556
- Codigo GSQ: https://github.com/IST-DASLab/GSQ
- Coleccion GSQ: https://huggingface.co/collections/ISTA-DASLab/gsq
- Repositorio Humming: https://github.com/inclusionAI/humming
