# Outlier-Ai/Outlier-70B-V3.3

## Resumen

Outlier-70B-V3.3 es un artefacto de investigación publicado por Outlier-Ai sobre la base de Qwen2.5-32B-Instruct, al que se le añaden expertos MoE ternarios en forma de delta sobre los pesos originales. A pesar del nombre comercial "70B", el modelo base tiene 32.000 millones de parámetros y el incremento efectivo proviene de una arquitectura MoE dispersa con pesos ternarios, orientada a inferencia local y eficiencia energética en Apple Silicon. La model card lo describe explícitamente como un artefacto histórico y no recomendado para producción, sustituido por la línea Outlier v1.8 (Nano 4B, Core 27B, Vision 35B-A3B).

La propuesta técnica es interesante: reutiliza byte a byte los pesos de V3.2 y añade dos componentes, entre ellos una extensión de contexto mediante YaRN 4x que, según el autor, no degrada el comportamiento en contextos cortos. El modelo declara soporte para 15 idiomas y una licencia Apache 2.0 heredada del modelo base.

Su relevancia actual es limitada: el repositorio tiene 25 descargas y 1 like, el tamaño del repo aparece como 0.0 GB (probablemente por los pesos distribuidos por overlay o por no estar subidos), y el propio autor redirige a su web comercial. Resulta útil como referencia de técnicas de cuantización ternaria y MoE sobre modelos densos, no como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-32B) con delta de expertos MoE ternarios ("outlier_moe", overlay) |
| Parametros totales | 32.000 millones en el modelo base; el total efectivo del MoE no está disponible |
| Parametros activos | no disponible |
| Longitud de contexto | Extendida 4x mediante YaRN sobre el contexto nativo de Qwen2.5-32B (32.768 tokens); el valor exacto resultante no está disponible |
| Tipos de cuantizacion | Pesos ternarios en los expertos delta; cuantizaciones adicionales no disponibles |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0.0 GB; se menciona integración con MLX en la línea sucesora, no en este artefacto) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-32B-Instruct, un transformer denso con atención completa y RoPE, y le superpone una capa de expertos MoE con pesos ternarios (valores en {-1, 0, +1}) implementada como delta sobre los pesos originales. Esta técnica, etiquetada como "overlay" y "sparse", permite añadir capacidad sin redistribuir el modelo completo y mantiene los pesos base intactos. La model card indica que V3.3 conserva los pesos de V3.2 byte a byte y añade dos elementos, uno de ellos la extensión de contexto YaRN 4x, que escala las frecuencias rotacionales para ampliar la ventana sin reentrenar.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o ajuste por preferencias en la fase de expertos. El autor califica las afirmaciones técnicas de revisiones anteriores de la card como provisionales, lo que refuerza el carácter experimental del artefacto. La innovación principal es la combinación de MoE ternario con overlay sobre un modelo denso ya entrenado, orientada a reducir el coste de memoria y energía en hardware de consumo.

## Capacidades

- Generación de texto y razonamiento multi-paso, con ejemplos en la model card de problemas matemáticos, lógica tipo grid y problemas de palabras.
- Razonamiento matemático elemental y de nivel medio (los widgets de ejemplo incluyen aritmética y cinemática).
- Capacidades multilingües declaradas para 15 idiomas, incluyendo español, chino, francés, portugués, alemán, italiano, ruso, japonés, coreano, árabe, vietnamita, tailandés, neerlandés y polaco.
- Soporte de tool calling y function calling heredado de Qwen2.5-32B-Instruct (no verificado específicamente en este artefacto).
- Capacidad de agentes y razonamiento multi-paso por herencia del modelo base.
- Contexto extendido 4x mediante YaRN, útil para documentos largos.
- No se declara visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación en cuantización ternaria: sirve como banco de pruebas para estudiar cómo afecta un delta MoE ternario al rendimiento de un modelo denso de 32B, comparando contra el Qwen2.5-32B-Instruct original.
- Experimentación con extensión de contexto YaRN: permite evaluar la afirmación del autor de que YaRN 4x no degrada el comportamiento en contextos cortos, midiendo perplejidad y precisión en tareas de contexto largo frente a contexto corto.
- Prototipado local en Apple Silicon: por su orientación a on-device y eficiencia energética, encaja en pruebas de concepto en Mac con memoria unificada, aunque el formato de pesos no está confirmado.
- Evaluación de eficiencia energética: útil para comparar consumo y latencia de un MoE ternario frente a un denso de 32B en el mismo hardware.
- Reproducibilidad de artefactos de investigación: el autor lo conserva explícitamente para reproducibilidad histórica, por lo que sirve para replicar resultados de la línea V3.x.
- Análisis de licencias y linaje de modelos: al derivar de Qwen2.5-32B-Instruct con Apache 2.0, es un caso de estudio de redistribución de pesos y obligaciones de atribución.
- No se recomienda su uso en atención al cliente, generación de código en producción ni pipelines críticos, dado su estado de artefacto histórico y la falta de benchmarks verificados.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| MMLU | Accuracy 5-shot | 83,1 | No |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, BBH, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el modelo base de 32B en FP16 requiere aproximadamente 64 GB, y en cuantización de 4 bits en torno a 18-20 GB, pero el impacto del delta MoE ternario no está cuantificado.
- GPU recomendadas: no especificadas por el autor. Por tamaño del base, cabría esperar A100 80GB o H100 para FP16, y RTX 4090 (24 GB) solo con cuantización agresiva.
- Consumer GPU: probablemente viable en RTX 4090 o RTX 3090 con cuantización de 4 bits, no confirmado.
- Apple Silicon: el autor orienta la línea a Mac y Apple Silicon, pero no detalla requisitos de memoria unificada para este artefacto concreto.
- Despliegue: se declara compatibilidad con transformers y código personalizado ("custom_code"); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Outlier-70B-V3.3 | 32B base + delta MoE | 4x sobre 32K (YaRN) | 83,1 (5-shot, no verificado) | Apache 2.0 | Artefacto histórico, 25 descargas |
| Qwen2.5-32B-Instruct | 32B densos | 32.768 tokens | no disponible en esta ficha | Apache 2.0 | Ampliamente disponible |
| Outlier Core 27B (sucesor) | 27B | no disponible | no disponible | no disponible | Tier por defecto de la línea v1.8 |
| Outlier Nano 4B (sucesor) | 4B | no disponible | no disponible | no disponible | Tier de entrada de la línea v1.8 |

La comparación directa con Qwen2.5-32B-Instruct es la más relevante, ya que comparten pesos base; sin embargo, no se dispone del MMLU del base en la información proporcionada para contrastar la ganancia del delta MoE.

## Limitaciones y advertencias

- El autor marca el repositorio como "superseded" y no recomendado para producción; es un artefacto de investigación.
- El nombre "70B" no refleja el tamaño real: el base es de 32B y el total efectivo del MoE no está documentado.
- El único benchmark (MMLU 83,1) está declarado por el autor y no verificado de forma independiente.
- El tamaño del repo (0.0 GB) sugiere que los pesos pueden no estar disponibles o requerir código personalizado, lo que complica la reproducibilidad.
- La model card advierte de que las afirmaciones técnicas de revisiones anteriores son provisionales y pueden incluir adaptadores o variantes que no llegaron al producto.
- Riesgo de alucinación y sesgos: no evaluados ni documentados para este artefacto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la atribución a Qwen2.5-32B-Instruct y el cumplimiento de su licencia son obligatorios.
- La extensión de contexto YaRN 4x no está validada de forma independiente; el rendimiento en contextos largos puede degradarse.
- Soporte multilingüe declarado pero no verificado por idioma.
- La página de búsqueda de Outlier AI corresponde a una plataforma de anotación de datos para freelancers, no al autor del modelo; no debe confundirse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-70B-V3.3
- README del modelo: https://huggingface.co/Outlier-Ai/Outlier-70B-V3.3/blob/main/README.md
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Sucesor Nano 4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Sucesor Core 27B: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Sucesor Vision 35B-A3B: https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
- DeepSeek-R1-Distill-Qwen-7B (MLX): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Qwen3-Coder-30B-A3B (MLX): https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
- Sitio del autor: https://outlier.host
- Plataforma homónima no relacionada (anotación de datos): https://outlier.ai/
