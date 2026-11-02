# JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-18

## Resumen

CIRF-Qwen3-8B-Instruct-Backward-Greedy-18 es un ajuste fino del modelo Qwen3-8B de Alibaba, desarrollado por el usuario JhCIFT, que implementa la metodología CIRF (functional tokens para trazas de razonamiento explícitas). El modelo parte del checkpoint completo de la familia CIRF y aplica una selección de resultados "backward-greedy" con un presupuesto máximo de 18 tokens de resultado explícitos por ejemplo de entrenamiento. La actualización LoRA está fusionada en los pesos densos BF16, de modo que el modelo se carga con Transformers estándar sin necesidad de PEFT ni código adicional.

El modelo resuelve el problema de hacer explícito y acotado el razonamiento intermedio: en lugar de generar cadenas de pensamiento en lenguaje natural, produce una traza de tokens funcionales (`[f_0]` a `[f_511]`) con valores de resultado opcionales, delimitada por `[sof]` y `[eof]`, seguida de la respuesta final. Esta variante concreta (presupuesto 18) busca un equilibrio entre capacidad de razonamiento y longitud de traza, reduciendo el coste de inferencia frente a variantes con presupuestos mayores (24) y mejorando la expresividad frente a las más restrictivas (3, 6, 12).

Con 8.192.758.784 parámetros y un repositorio de 16,4 GB en safetensors, es un modelo denso de 8B orientado a generación de texto y razonamiento, con licencia Apache 2.0 y soporte declarado únicamente para inglés. Su relevancia radica en explorar una alternativa estructurada y controlable a las cadenas de pensamiento convencionales, con resultados medidos en varios benchmarks aritméticos y de sentido común.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (base Qwen3-8B) con vocabulario extendido de tokens funcionales CIRF |
| Parametros totales | 8.192.758.784 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en BF16 safetensors) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, LoRA fusionada) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso heredado de Qwen3-8B, sobre el que se añaden 514 tokens nuevos al vocabulario: `[sof]`, `[eof]` y `[f_0]` hasta `[f_511]`. Estos tokens funcionales cuentan con filas de embedding de entrada y de salida entrenadas específicamente. El ajuste se realizó mediante LoRA, cuya actualización se fusionó posteriormente en los pesos densos en BF16, de modo que el checkpoint resultante es autocontenido y cargable con Transformers sin PEFT ni el checkpoint base.

El entrenamiento parte del modelo CIRF de resultado completo y aplica una selección de resultados "backward-greedy" con un presupuesto de como máximo 18 tokens de resultado explícitos por ejemplo. El formato de prompt es `QUESTION[sof]`, sin plantilla de chat: el modelo genera una traza de tokens funcionales con valores de resultado opcionales, emite `[eof]` y a continuación la respuesta final, deteniéndose en el token EOS del tokenizer. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento estructurado mediante trazas de tokens funcionales explícitas (`[f_0]`–`[f_511]`).
- Razonamiento aritmético y matemático de varios pasos, con resultados intermedios opcionales embebidos en la traza.
- Razonamiento de sentido común y preguntas de opción múltiple (evaluado en CommonsenseQA y StrategyQA).
- Resolución de problemas de paridad y conteo (evaluado en Coin Flip).
- Decodificación greedy determinista, adecuada para evaluación reproducible.
- Control del presupuesto de razonamiento mediante el límite de tokens funcionales (32 en la evaluación publicada).
- No se declara soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking convencional en la información disponible.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Evaluación de razonamiento aritmético reproducible: el modelo permite comparar trazas acotadas (18 tokens de resultado) frente a cadenas de pensamiento libres, con decodificación greedy y protocolo de evaluación fijo documentado en `inference.py`.
- Investigación sobre razonamiento estructurado: sirve como banco de pruebas para estudiar cómo el presupuesto de tokens funcionales afecta a la precisión en GSM8K, SVAMP o MultiArith, comparando con las variantes 3, 6, 12 y 24 del mismo autor.
- Sistemas de resolución de problemas matemáticos de primaria y secundaria: con 70,51% en GSM8K y 99,44% en MultiArith, puede integrarse en pipelines de corrección automática o tutoría donde el razonamiento deba ser inspeccionable token a token.
- Clasificación y respuesta a preguntas de sentido común: su 81,33% en CommonsenseQA lo hace utilizable en tareas de QA de opción múltiple con necesidad de traza auditable.
- Análisis de paridad y conteo: el 86,08% en Coin Flip (corregido por paridad) permite usarlo en tareas de verificación lógica donde el resultado depende de contar estados.
- Inferencia en entornos con Transformers estándar: al estar la LoRA fusionada y no requerir PEFT, se puede desplegar directamente con `AutoModelForCausalLM` en infraestructura existente basada en Hugging Face.
- Estudio de eficiencia de razonamiento: la variante de presupuesto 18 permite medir el compromiso entre longitud de traza y precisión frente a las variantes extremas de la familia.

## Benchmarks y rendimiento

| Test set | Preguntas | Precision |
|---|---:|---:|
| GSM8K | 1.319 | 70,51% |
| MultiArith | 178 | 99,44% |
| SVAMP | 300 | 84,67% |
| CommonsenseQA | 1.221 | 81,33% |
| Coin Flip (corregido por paridad) | 3.333 | 86,08% |

Protocolo: decodificación greedy, máximo 384 tokens nuevos y 32 tokens funcionales, puntuación por coincidencia exacta. Coin Flip se puntúa contra la paridad de los lanzamientos indicados en la pregunta, ya que aproximadamente el 20% de las etiquetas del dataset no coinciden con ella. Los resultados completos por dataset, incluidos MATH-500, StrategyQA y latencia con batch 1, están en `test_results.json`. No se proporcionan resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 20-24 GB.
- En cuantización de 8 bits: alrededor de 8-9 GB de VRAM; en 4 bits: alrededor de 4,5-5 GB (estimaciones según el tamaño de parámetros, no confirmadas en la información disponible).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para BF16 sin compromisos; RTX 4090 (24 GB) para BF16 ajustado; RTX 3090/4080 para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en BF16 con contexto moderado, y en GPUs de 12-16 GB con cuantización.
- Opciones de despliegue: Transformers (soporte nativo, sin PEFT), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversión a GGUF (no se publica GGUF en el repo).
- Latencia y throughput: no disponibles en la información proporcionada; la model card remite a `test_results.json` para latencia con batch 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CIRF-Qwen3-8B-Instruct-Backward-Greedy-18 | 8,19B | no disponible | 70,51% | Apache 2.0 | Hugging Face (JhCIFT) |
| CIRF-Qwen3-8B-Instruct-Backward-Greedy-24 | 8,19B (misma base) | no disponible | no disponible | Apache 2.0 | Hugging Face (JhCIFT) |
| CIRF-Qwen3-8B-Instruct-Zero-Results | 8,19B (misma base) | no disponible | no disponible | Apache 2.0 | Hugging Face (JhCIFT) |
| Qwen/Qwen3-8B (base) | 8,19B | no disponible | no disponible en esta ficha | Apache 2.0 | Hugging Face (Qwen) |

No se dispone de resultados de benchmarks de las variantes hermanas ni del modelo base en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Requiere un formato de prompt específico (`QUESTION[sof]`) y decodificación con `skip_special_tokens=False`; un uso con plantilla de chat convencional producirá resultados incorrectos.
- La parada debe hacerse en el token EOS, no en `[eof]`; detenerse en `[eof]` trunca la respuesta final.
- La evaluación limita la traza a 32 tokens funcionales forzando `[eof]`; sin ese límite el comportamiento puede diferir del reportado.
- Riesgo de alucinación inherente a los modelos de 8B, especialmente en matemáticas de varios pasos (GSM8K al 70,51% implica un 29,49% de fallo).
- El dataset Coin Flip presenta aproximadamente un 20% de etiquetas inconsistentes con la paridad; las métricas sobre él deben interpretarse con cautela.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el modelo derivado ni sobre los datos de entrenamiento no documentados.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados reportados.
- No se documentan sesgos específicos, composición del dataset de entrenamiento ni filtros de seguridad aplicados.
- El repositorio no incluye pesos GGUF ni cuantizaciones publicadas; la conversión corre a cargo del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-18
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Variante Full: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Full
- Variante Zero-Results: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Zero-Results
- Variante Backward-Greedy-3: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-3
- Variante Backward-Greedy-6: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-6
- Variante Backward-Greedy-12: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-12
- Variante Backward-Greedy-24: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-24
