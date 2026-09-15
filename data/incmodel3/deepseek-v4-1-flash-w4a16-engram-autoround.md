# INCModel3/DeepSeek-V4.1-Flash-W4A16-Engram-AutoRound

## Resumen

DeepSeek-V4.1-Flash-W4A16-Engram-AutoRound es un checkpoint cuantizado del modelo DeepSeek-V4.1-Flash, producido por INCModel3 mediante post-training quantization con la librería auto-round. El objetivo es reducir el footprint de memoria del modelo base (510.3 GB) a 451.7 GB, manteniendo un rendimiento prácticamente idéntico en la tarea evaluada. La cuantización se aplica únicamente a los expertos enrutados (MoE) y a las tablas de memoria engram, mientras que las capas densas, la atención y la torre de visión se mantienen en BF16.

El modelo base es una arquitectura Mixture of Experts (MoE) con 301.412.628.194 parámetros totales, que incluye predicción de múltiples tokens (MTP), embeddings de engram y un componente de visión. Este checkpoint concreto está pensado para entornos de inferencia a gran escala, especialmente con vLLM y múltiples GPUs. La información disponible no incluye la longitud de contexto máxima, aunque el ejemplo de despliegue utiliza una ventana de 8192 tokens. Se ha verificado su funcionamiento en 4×H200 con tensor parallelism, y el resultado en GSM8K (93.93/94.01) está dentro del ruido estadístico respecto al modelo original (92.87).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en DeepSeek-V4.1-Flash |
| Parametros totales | 301.412.628.194 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible; el ejemplo de despliegue usa 8192 tokens |
| Tipos de cuantizacion | W4A16 (INT4 para expertos enrutados y tablas engram; BF16 para capas densas, atención y visión) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint es una cuantización post-entrenamiento del modelo DeepSeek-V4.1-Flash. La arquitectura original es un MoE que combina expertos enrutados, capas de atención, shared_experts, un mecanismo de memoria engram (con tablas de embedding y un componente wkv), y una torre de visión con aligner. La cuantización se realizó con auto-round en modo `--model_free` (RTN, iters=0), sin datos de calibración. Los expertos enrutados, incluido el módulo MTP, se convirtieron de MXFP4 a INT4 con esquema W4A16 y group size 32, empaquetados con auto_gptq (`qweight`/`qzeros`/`scales`). Las tablas engram se cuantizaron de FP8 a INT4 con scale FP16, y el resto de componentes (atención, shared_experts, engram.wkv, visión, embed, head, norms) se dejaron en BF16.

No se dispone de información sobre los datos de entrenamiento del modelo base, ni sobre la composición del dataset, el número de tokens o la aplicación de RLHF/DPO. La innovación técnica destacable es la reducción de tamaño de 510.3 GB a 451.7 GB sin pérdida medible en GSM8K, junto con la integración del camino GPTQ-MoE de vLLM (MoeWNA16/Marlin) para los expertos INT4 y un plugin específico para el lookup de engram.

## Capacidades

- Generación de texto: el pipeline de HuggingFace es `text-generation`, y el modelo es apto para tareas de lenguaje natural.
- Razonamiento matemático: el benchmark GSM8K (5-shot, thinking off, n=1319) alcanza 93.93/94.01, frente al baseline de 92.87, lo que indica que conserva la capacidad del modelo base en problemas aritméticos y de lógica.
- Soporte multimodal (visión): el modelo base incluye una torre de visión y un aligner, pero la configuración de despliegue de ejemplo usa `--language-model-only`, por lo que la visión no está activada en ese escenario.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte para agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Despliegue de asistentes conversacionales en clústeres de GPUs: el checkpoint reduce el tamaño de los pesos de 510.3 GB a 451.7 GB, lo que permite ahorrar memoria en entornos con 4×H200. El ejemplo de vLLM utiliza una ventana de 8192 tokens, suficiente para conversaciones de longitud media.
- Resolución de problemas matemáticos en aplicaciones educativas o de análisis: el resultado de 93.93 en GSM8K indica que el modelo mantiene la capacidad de razonamiento aritmético y algebraico del modelo base, por lo que es adecuado para tutorización, generación de ejercicios o cálculo asistido.
- Investigación sobre eficiencia en modelos MoE: sirve como caso de estudio para comparar el impacto de la cuantización W4A16 en expertos enrutados y tablas de memoria engram frente al checkpoint oficial con MXFP4/FP8, evaluando el trade-off entre tamaño y precisión.
- Comparación de técnicas de cuantización: al estar producido con auto-round en modo `--model_free` (RTN sin calibración), es útil para analizar la degradación de rendimiento asociada a diferentes esquemas (INT4 vs MXFP4, empaquetado auto_gptq vs kernels nativos).
- Evaluación de configuraciones de despliegue multi-GPU: el comando vLLM con `--tensor-parallel-size 4` en 4×H200 permite probar estrategias de tensor parallelism, gestión de memoria (gpu-memory-utilization 0.90) y activación de plugins específicos para modelos MoE de gran tamaño.
- Pruebas de regresión de calidad en pipelines de generación: dado que el resultado en GSM8K está dentro del ruido respecto al baseline, este checkpoint puede usarse en entornos de CI/CD para detectar degradaciones de rendimiento en tareas de razonamiento sin necesidad de cargar el modelo original completo.

## Benchmarks y rendimiento

Se ha publicado un único resultado de benchmark en la información proporcionada:

| Modelo | GSM8K (5-shot, thinking off, n=1319) |
|---|---|
| DeepSeek-V4.1-Flash (baseline oficial) | 92.87 |
| DeepSeek-V4.1-Flash-W4A16-Engram-AutoRound | 93.93 / 94.01 |

Según el autor, la diferencia es "lossless within noise". No se dispone de datos para MMLU, HumanEval, ni otros benchmarks.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 451.7 GB. Con activaciones y KV cache, se necesita al menos ~550 GB de memoria total. En la configuración verificada (4×H200), se usa `--gpu-memory-utilization 0.90`, lo que implica aproximadamente 127 GB por GPU.
- GPU recomendadas: 4×H200 (verificado). A100 80GB o H100 80GB requerirían al menos 6-7 GPUs para cargar el checkpoint completo; no se ha verificado su funcionamiento.
- No cabe en GPUs de consumo (RTX 4090, etc.).
- Opciones de despliegue: vLLM `main` (con PR #56201) junto con el plugin externo `dsv41-quant-plugin`. Se deben establecer las variables de entorno `DSV41_ENGRAM_DTYPE=int4` y `NCCL_NVLS_ENABLE=0`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tamaño | Cuantización | GSM8K | Licencia |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash (oficial) | 510.3 GB | MXFP4 (expertos) / FP8 (atención, engram) | 92.87 | MIT |
| DeepSeek-V4.1-Flash-W4A16-Engram-AutoRound | 451.7 GB | INT4 W4A16 (expertos y engram) / BF16 (densas) | 93.93 / 94.01 | MIT |

No se dispone de información sobre otras alternativas de la misma categoría (mismo tamaño o misma tarea) en los datos proporcionados.

## Limitaciones y advertencias

- El despliegue requiere el plugin `dsv41-quant-plugin`, que no está integrado en vLLM main. Sin este plugin, el checkpoint no es utilizable con la configuración descrita.
- No es compatible con los kernels FP8 de la implementación de referencia del modelo original; las capas densas se ejecutan en BF16, lo que puede alterar el rendimiento en entornos que esperen FP8.
- La configuración de ejemplo usa `--language-model-only`, por lo que la torre de visión del modelo base no se activa en ese escenario. No se ha evaluado la parte multimodal en esta cuantización.
- No se dispone de información sobre los idiomas soportados, sesgos conocidos, riesgo de alucinación ni restricciones adicionales de uso comercial. La licencia MIT permite uso comercial, pero el modelo no ha sido auditado.
- La cuantización de las tablas engram a INT4 es una aproximación. Solo se ha validado en GSM8K; no se han realizado evaluaciones exhaustivas en otras tareas.
- El checkpoint no tiene descargas ni likes en HuggingFace, por lo que no ha sido validado por la comunidad.
- El tamaño del checkpoint y la necesidad de 4×H200 limitan su uso a infraestructuras de GPU de alto rendimiento, lo que excluye entornos con una sola GPU o hardware de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/INCModel3/DeepSeek-V4.1-Flash-W4A16-Engram-AutoRound
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- PR de vLLM requerido: https://github.com/vllm-project/vllm/pull/56201
- Repositorio de auto-round: https://github.com/intel/auto-round
