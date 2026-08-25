# abhishekchohan/Qwen3.8-27B-AWQ-INT4

## Resumen

Qwen3.8-27B-AWQ-INT4 es una cuantizacion 4-bit (AWQ, W4A16) del modelo multimodal denso Qwen3.8-27B, desarrollado por el equipo Qwen de Alibaba y publicado en Hugging Face por el usuario abhishekchohan. El modelo base es un LLM nativo de vision y lenguaje con 27 781 millones de parametros, arquitectura híbrida de atencion softmax y atencion lineal DeltaNet, y un contexto nativo de 262 144 tokens. Esta version cuantizada reduce el peso de BF16 (~55 GB) a aproximadamente 20 GB en disco, lo que permite servir el contexto completo de 262k tokens en una sola GPU de 48 GB, o extenderlo a 524 288 tokens via YaRN en una GPU de 96 GB.

La cuantizacion utiliza AWQ (activation-aware smoothing) con observer imatrix-MSE y grupo de 32, calibrada con 112 secuencias de 262 144 tokens (≈29,4 M tokens) extraidas de los datasets de post-entrenamiento Nemotron de NVIDIA (instruccion, matematicas, ciencia, SWE y multilingue). A diferencia de practicas comunes, tambien cuantiza las proyecciones de atencion lineal DeltaNet (≈5,2 B de parametros), que normalmente se mantienen en BF16, y conserva intacto el predictor MTP para decodificacion especulativa. Los benchmarks publicados muestran una degradacion media de solo +0,2 puntos frente a la base BF16 (70,25 vs 70,04 de promedio) y un 9/9 en recuperacion de contexto largo a 262k tokens.

La relevancia de esta ficha radica en que es una de las pocas cuantizaciones AWQ INT4 que cubre el contexto nativo completo del modelo en hardware consumer de 48 GB, lo que habilita despliegues de razonamiento multimodal con contexto muy largo en entornos de produccion sin necesidad de clusters.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto + vision) con atencion hibrida: softmax attention + atencion lineal DeltaNet; 64 capas de lenguaje; encoder visual ViT congelado |
| Parametros totales | 27 781 427 952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativos; extensible a 524 288 via YaRN (factor 2,0) en GPU de 96 GB |
| Tipos de cuantizacion | AWQ INT4 (W4A16), asimetrica con zero-point, group_size=32, weight-only; imatrix-mse weight observer |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers), compatible con vLLM; no se indica formato GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un LLM multimodal denso con 64 capas de transformador hibrido: cada capa combina atencion softmax (con q/k RMS-norms) y atencion lineal DeltaNet (con proyecciones in_proj_qkv, in_proj_z, out_proj y estados recurrentes). El encoder visual (ViT) esta congelado. Sobre esta base, la cuantizacion AWQ aplica smoothing de activaciones y un observer imatrix-mse, calibrado con 112 secuencias de 262 144 tokens (≈29,4 M tokens) procedentes de los datasets de post-entrenamiento de NVIDIA Nemotron (instruccion, matematicas, ciencia, SWE y multilingue), con el modo de razonamiento "thinking" activado durante la calibracion.

Tecnicamente, la cuantizacion cubre todas las proyecciones lineales de bloques (q,k,v,o, MLP gate/up/down y las proyecciones DeltaNet), pero protege en BF16 las normas de capa (incluidas las RMS de q/k), los embeddings, la cabeza de salida (lm_head), las proyecciones de gating DeltaNet (in_proj_a, in_proj_b) y los estados convolucionales, el encoder visual completo y el predictor MTP (multi-token prediction) que se mantiene intacto para decodificacion especulativa. El checkpoint sirve con KV cache en BF16.

## Capacidades

- Generacion de texto y razonamiento de varios pasos (modo thinking) con el template de chat nativo de Qwen3.
- Razonamiento multimodal: entrada de imagen (encoder ViT congelado) y salida de texto; evaluado en RealWorldQA y MathVision.
- Matematicas avanzadas: puntuacion de 80,0 en Minerva Math500 (protocolo math_verify) y 95,45 en GSM8K.
- Codigo y tareas de software: el modelo base destaca en coding y agentic workflows segun la documentacion de Alibaba.
- Recuperacion de contexto largo: 9/9 en needle-in-a-haystack a 262 144 tokens, incluyendo profundidades 10 %, 50 % y 90 %.
- Soporte de decodificacion especulativa con predictor MTP (2 tokens especulativos) en vLLM.
- Capacidad multilingue: el modelo base fue entrenado con el dataset Nemotron-SFT-Multilingual-v2, aunque no se publican idiomas concretos en la informacion disponible.
- No se ha evaluado el comportamiento agente/tool-calling en esta cuantizacion (indicado en las limitaciones).

## Casos de uso

- Atencion al cliente automatizada con contexto largo: el modelo puede mantener conversaciones multi-turno con historial completo de hasta 262 144 tokens, lo que permite gestionar hilos de soporte extensos sin truncar informacion relevante.
- Analisis de documentos y contratos extensos: con su contexto nativo de 262k tokens, puede procesar libros completos, expedientes legales o informes de investigacion en una sola pasada, extrayendo hechos y resumiendo secciones especificas.
- Razonamiento multimodal en produccion: al mantener el encoder visual, puede analizar capturas de pantalla, diagramas o imagenes de documentos escaneados combinados con texto, util para auditorias de calidad o revision de disenos.
- Generacion de codigo y automatizacion de tareas de software: el modelo base destaca en SWE; puede usarse en pipelines de CI/CD para generar tests, parchear bugs o documentar APIs, aprovechando el modo thinking para razonar sobre el contexto del repositorio.
- Tutorizacion y educacion asistida: su capacidad matematica (Math500 80,0 y GSM8K 95,45) lo hace adecuado para resolver problemas paso a paso y explicar conceptos, con contexto para mantener el historial de la conversacion de aprendizaje.
- Despliegue de agentes de razonamiento en entornos con GPU limitada: con 42 GB de VRAM para el contexto completo, cabe en una RTX 6000 Ada o A6000 de 48 GB, lo que permite ejecutar agentes de razonamiento multimodal en un solo nodo sin cluster.
- Investigacion de recuperacion de informacion en corpus extensos: su 9/9 en needle-in-a-haystack lo convierte en una herramienta fiable para tareas de retrieval-augmented generation (RAG) sobre documentos de mas de 200k tokens.

## Benchmarks y rendimiento

La model card proporciona resultados comparativos entre la base BF16 y esta cuantizacion, obtenidos con lm-evaluation-harness + vLLM 0.27.1 en una NVIDIA RTX PRO 6000 (96 GB), greedy decoding, seed 1234, y con el template de chat nativo con thinking activado para tareas generativas.

| Tarea (n) | Protocolo | Base BF16 | Este modelo | Δ | Recuperacion % |
|---|---|---|---|---|---|
| GSM8K (1319) | thinking, generativa | 95.60 | 95.45 | −0.2 | 99.8 |
| GPQA Diamond (198) | thinking, generativa | 61.11 | 61.62 | +0.5 | 100.8 |
| Minerva Math500 (500) | thinking, generativa, math_verify | 73.2 | 80.0 | +6.8 | 109.3 |
| RealWorldQA (765) | thinking, generativa, vision | 84.31 | 83.27 | −1.0 | 98.8 |
| MathVision (3040) | thinking, generativa, vision | 78.06 | 75.10 | −3.0 | 96.2 |
| ARC-Easy (2376) | loglikelihood | 82.53 | 82.37 | −0.2 | 99.8 |
| ARC-Challenge (1172) | loglikelihood | 56.91 | 56.83 | −0.1 | 99.9 |
| HellaSwag (2000) | loglikelihood | 56.50 | 55.85 | −0.7 | 98.8 |
| Winogrande (1267) | loglikelihood | 76.16 | 76.48 | +0.3 | 100.4 |
| TruthfulQA MC1 (817) | loglikelihood | 35.99 | 35.50 | −0.5 | 98.6 |
| **Promedio** | | **70.04** | **70.25** | **+0.2** | **100.2** |

Todos los deltas estan dentro del ruido de muestreo salvo los señalados en limitaciones (MathVision −3.0 y Minerva Math500 +6.8). En retrieval de contexto largo (needle-in-a-haystack, thinking, greedy):

| Contexto (tokens) | depth 10 % | depth 50 % | depth 90 % |
|---|---|---|---|
| 32 768 | ✅ | ✅ | ✅ |
| 131 072 | ✅ | ✅ | ✅ |
| 262 144 (nativo) | ✅ | ✅ | ✅ |

## Requisitos de hardware

- VRAM estimada para inferencia con contexto completo (262 144 tokens): ≈42 GB (pesos INT4 + partes BF16 ≈20 GB, KV cache bf16 ≈17 GB, activaciones y overhead ≈5 GB).
- GPU recomendadas: una sola GPU de 48 GB (por ejemplo, RTX PRO 6000 Blackwell, A100 48 GB, RTX 6000 Ada) para el contexto nativo de 262k; una GPU de 96 GB (por ejemplo, RTX PRO 6000 Blackwell de 96 GB, A100 80GB no llega, pero H100 94GB si) para 262k con margen o 524k via YaRN.
- No cabe en GPUs de consumo tipicas (RTX 4090 de 24 GB) para el contexto completo; para contextos mas cortos podria reducirse la ventana, pero no hay datos de la model card al respecto.
- Opciones de despliegue: vLLM (soporte oficial con flags para speculative decoding y reasoning-parser), llama.cpp/GGUF no documentado en esta version; se recomienda vLLM para produccion.
- Latencia y throughput: no se han publicado datos concretos de latencia ni throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| Qwen3.8-27B (base BF16) | 27 781 M | 262 144 | Apache-2.0 | BF16 | Puntuacion promedio 70.04 en la suite; requiere ≈55 GB en disco y mas VRAM |
| Qwen3.8-27B-AWQ-INT4 (este) | 27 781 M | 262 144 | Apache-2.0 | INT4 (safetensors) | Promedio 70.25, recuperacion 100.2 %; ~20 GB disco, ~42 GB VRAM para 262k |
| Qwen3.8-27B-AWQ-BF16-INT4 (cyankiwi) | 27 781 M | 262 144 | Apache-2.0 | INT4 | Variante similar en Hugging Face, pero sin datos de benchmarks publicados en la informacion disponible |

No hay datos de comparacion con otros modelos de la misma categoria (por ejemplo, Llama-3.1-8B, Qwen2.5-72B) en la informacion proporcionada. La comparativa mas significativa es contra el base BF16, que se muestra en la tabla de benchmarks.

## Limitaciones y advertencias

- Degradacion en vision: MathVision presenta una caida de −3.0 puntos frente a la base BF16 (≈2.7σ), lo que indica una perdida real de calidad en razonamiento visual con esta cuantizacion. La cobertura de vision mas alla de RealWorldQA y MathVision no esta evaluada.
- El incremento de +6.8 en Minerva Math500 se interpreta como varianza del protocolo math_verify, no como una ganancia real de capacidad.
- No se ha evaluado el comportamiento de agentes ni tool calling en esta version; su uso en pipelines de agente no esta validado.
- La decodificacion especulativa con MTP se envía intacta, pero la validacion cuantitativa (paridad de puntuacion, tasa de aceptacion) esta en progreso; no se garantiza su funcionamiento optimo.
- Los resultados de tareas generativas pueden variar algunos puntos entre fabricantes de GPU, incluso con configuraciones identicas; la comparativa base-cuantizado se hizo en la misma maquina.
- La extension a 524 288 tokens via YaRN esta validada para retrieval, pero no se ha validado la calidad de generacion mas alla de 262 144 tokens.
- No se especifican los idiomas soportados en la model card; el modelo base fue entrenado con datos multilingue, pero no se detalla que idiomas concretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abhishekchohan/Qwen3.8-27B-AWQ-INT4
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Alibaba: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- QwenCloud (ficha del modelo): https://www.qwencloud.com/models/qwen3.8-27b
- Variante AWQ-BF16-INT4 de cyankiwi: https://huggingface.co/cyankiwi/Qwen3.8-27B-AWQ-BF16-INT4
