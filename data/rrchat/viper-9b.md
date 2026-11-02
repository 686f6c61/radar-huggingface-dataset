# rrchat/Viper-9B

## Resumen

Viper-9B es un modelo de lenguaje de 8.953.803.264 parámetros (aproximadamente 9B) desarrollado por rrchat como buque insignia de su familia RR-Gen1. Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-9B, orientado a flujos de trabajo agénticos, orquestación autónoma de herramientas, síntesis de código, programación competitiva y seguimiento de instrucciones bilingüe ruso-inglés. El modelo se distribuye bajo licencia "other" y está disponible en HuggingFace con pesos en formato safetensors para la librería transformers.

El modelo hereda la arquitectura del Qwen3.5-9B (etiquetado internamente como `qwen3_5_text`), aunque la model card no detalla explícitamente la arquitectura interna ni la longitud de contexto. La información disponible indica que el pipeline declarado es image-text-to-text, lo que sugiere capacidades multimodales heredadas del modelo base, si bien los benchmarks publicados se centran exclusivamente en texto. El entrenamiento se realizó sobre una mezcla de datasets de razonamiento matemático, código, agentes y datos en ruso, incluyendo OpenR1-Math-220k, Nemotron-SFT-Agentic-v2, GrandMaster-PRO-MAX, OpenMathInstruct-2, OpenCodeInstruct y CodeFeedback-Filtered-Instruction.

La relevancia de Viper-9B radica en su especialización en tool calling estructurado (formato XML con `<tool_call>`), su mejora sustancial en programación competitiva frente al modelo base (LiveCodeBench v6: 33,0% frente a 19,0%) y su calibración mediante R-Tuning para reducir alucinaciones confiadas. Es un modelo pensado para desarrolladores que necesitan un asistente agéntico de tamaño medio con soporte bilingüe ruso-inglés y despliegue viable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.5-9B (etiqueta interna `qwen3_5_text`); detalles internos no disponibles |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible en repo separado (`rrchat/Viper-9B-GGUF`); niveles concretos no disponibles |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | other |
| Formato de pesos | safetensors (transformers); GGUF en repo aparte |

## Arquitectura y entrenamiento

Viper-9B es un fine-tuning del modelo Qwen/Qwen3.5-9B. La model card no especifica la arquitectura interna (si es transformer denso, MoE o híbrida), aunque la etiqueta `qwen3_5_text` y el tamaño de ~9B parámetros apuntan a un transformer denso de la familia Qwen3.5. El pipeline declarado es image-text-to-text, lo que sugiere que el modelo base incorpora capacidades multimodales, si bien los benchmarks publicados y los casos de uso descritos se centran en texto, código y razonamiento.

El entrenamiento se realizó mediante fine-tuning supervisado (SFT) sobre una mezcla de datasets: OpenR1-Math-220k y OpenMathInstruct-2 (razonamiento matemático), Nemotron-SFT-Agentic-v2 (agéntico y tool use), GrandMaster-PRO-MAX (datos en ruso), OpenCodeInstruct y CodeFeedback-Filtered-Instruction (código). La model card menciona el uso de R-Tuning para calibrar la honestidad del modelo y reducir alucinaciones confiadas en temas desconocidos. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. Se menciona el uso de Unsloth (tag `unsloth`) en el proceso de entrenamiento.

## Capacidades

- Generación de texto y razonamiento multi-paso en inglés y ruso.
- Razonamiento matemático, con soporte específico para matemáticas en ruso (MGSM ru).
- Síntesis de código Python y resolución de problemas algorítmicos de programación competitiva.
- Tool calling y function calling nativo con formato XML estructurado (`<tool_call>...<tool_response>`), con alta tasa de llamadas válidas (99,0% según la model card).
- Soporte para flujos agénticos autónomos y orquestación de herramientas.
- Seguimiento de instrucciones con restricciones complejas (evaluado en IFEval).
- Capacidades multimodales potenciales (pipeline image-text-to-text declarado), aunque no se detallan en la model card.
- Calibración de honestidad mediante R-Tuning para reducir alucinaciones confiadas.
- Formato de chat ChatML con etiquetas `<|im_start|>` / `<|im_end|>`.

## Casos de uso

- Agentes autónomos con tool calling: el modelo puede orquestar llamadas a funciones externas mediante el formato XML estructurado, con una tasa de llamadas válidas del 99,0% (BFCL), lo que lo hace adecuado para pipelines agénticos donde la fiabilidad del formato es crítica.
- Asistente de programación competitiva: con un 33,0% en LiveCodeBench v6 y mejoras notables en problemas fáciles (60,6%) y medios (29,4%), puede emplearse para generar soluciones algorítmicas y explicar estrategias de resolución.
- Generación de funciones Python en producción: su 84,7% en MBPP+ lo hace útil para autocompletar y sintetizar funciones con tests unitarios en pipelines de CI/CD.
- Atención al cliente bilingüe ruso-inglés: el soporte nativo de ambos idiomas y el seguimiento de instrucciones (IFEval ~55%) permiten gestionar conversaciones multi-turno en estos mercados.
- Tutoría matemática en ruso: con un 44,4% en MGSM ru, puede asistir en la resolución paso a paso de problemas matemáticos para usuarios rusohablantes.
- Evaluación y calibración de respuestas: el entrenamiento con R-Tuning lo hace adecuado para escenarios donde se requiere que el modelo admita desconocimiento en lugar de alucinar, como sistemas de soporte técnico o consultas factuales.
- Integración en entornos de desarrollo local: la disponibilidad de pesos GGUF permite desplegarlo en llama.cpp, LM Studio u Ollama para asistentes de código offline.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados localmente en modo greedy sin thinking, max_tokens 1024, con llama-server y formateo jinja:

| Benchmark | Modo / Harness | Base (Qwen3.5-9B) | Viper-9B | Delta |
|---|---|---|---|---|
| LiveCodeBench v6 | Deterministic Pass@1 | 19,0% | 33,0% | +14,0% |
| LCB v6 Easy | Deterministic Pass@1 | 42,4% | 60,6% | +18,2% |
| LCB v6 Medium | Deterministic Pass@1 | 14,7% | 29,4% | +14,7% |
| LCB v6 Hard | Deterministic Pass@1 | 0,0% | 9,1% | +9,1% |
| MBPP+ (seed 42) | EvalPlus Pass@1 | 83,3% | 84,7% | +1,4% |
| MGSM ru | Numeric Match | 42,0% | 44,4% | +2,4% |
| MMLU-Redux | Choice Accuracy | 73,7% | 74,0% | +0,3% |
| BFCL v4 | AST Function Match | 58,0% | 57,0% | -1,0% |
| IFEval | Strict Compliance | 56,6% | 54,7% | -1,9% |

Nota: el autor advierte que estas evaluaciones se realizaron manualmente en entornos locales controlados y pueden diferir de las cifras oficiales del modelo base en modo thinking.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 24 GB de VRAM.
- En cuantización GGUF de 8 bits: ~9-10 GB; en 4 bits: ~5-6 GB (estimación según el tamaño de parámetros; los niveles concretos no están especificados en la información disponible).
- GPU recomendadas: A100 40GB, H100, o GPUs de consumo con 24 GB o más (RTX 3090, RTX 4090) para bf16. Para cuantizaciones de 4-8 bits, GPUs con 8-12 GB pueden ser suficientes.
- Cabe en GPU de consumo: sí, especialmente en cuantizaciones GGUF de 4-8 bits.
- Opciones de despliegue: transformers (safetensors), llama.cpp, LM Studio y Ollama mediante los pesos GGUF del repo `rrchat/Viper-9B-GGUF`. No se confirma soporte explícito para vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LiveCodeBench v6 | MBPP+ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Viper-9B | ~9B | no disponible | 33,0% | 84,7% | other | HuggingFace (safetensors + GGUF) |
| Qwen3.5-9B (base) | ~9B | no disponible | 19,0% | 83,3% | no disponible | HuggingFace |
| Alternativas de ~9B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada. La comparación más directa es con su modelo base Qwen3.5-9B, sobre el que Viper-9B mejora sustancialmente en programación competitiva (+14,0% en LiveCodeBench v6) y mantiene paridad en tool calling e instrucciones.

## Limitaciones y advertencias

- Idiomas limitados a ruso e inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Licencia "other": es imprescindible revisar los términos exactos antes de uso comercial, ya que no es una licencia estándar permisiva.
- Los benchmarks publicados fueron realizados manualmente por el autor en modo sin thinking y pueden no reflejar el rendimiento en modo thinking o en configuraciones oficiales.
- Ligero retroceso frente al modelo base en BFCL v4 (-1,0%) e IFEval (-1,9%), lo que indica que el fine-tuning no mejora todas las capacidades por igual.
- Riesgo de alucinación inherente a modelos de ~9B, mitigado parcialmente por R-Tuning pero no eliminado.
- No se especifica la longitud de contexto, lo que dificulta planificar su uso en escenarios de contexto largo.
- El pipeline declarado es image-text-to-text, pero las capacidades multimodales no están documentadas ni evaluadas en la model card; no deben asumirse.
- Modelo con 0 descargas y 1 like en el momento de la ficha: ecosistema y validación comunitaria muy limitados.
- No se detallan sesgos conocidos ni la composición exacta del dataset de entrenamiento, lo que limita la evaluación de riesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rrchat/Viper-9B
- Pesos GGUF: https://huggingface.co/rrchat/Viper-9B-GGUF
- Perfil del autor: https://huggingface.co/rrchat
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset OpenR1-Math-220k: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset Nemotron-SFT-Agentic-v2: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Agentic-v2
- Dataset GrandMaster-PRO-MAX: https://huggingface.co/datasets/Vikhrmodels/GrandMaster-PRO-MAX
- Dataset OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset OpenCodeInstruct: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
- Dataset CodeFeedback-Filtered-Instruction: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
