# frankmorales2020/deepseek-moe-16b-base-ast-aligned-nolora-GGUF

## Resumen

`deepseek-moe-16b-base-ast-aligned-nolora-GGUF` es una cuantización en formato GGUF (Q8_0) del modelo base `deepseek-ai/deepseek-moe-16b-base`, publicada por el autor independiente Frank Morales Aguilera (Sovereign Machine Laboratory). El modelo subyacente es un transformer de mezcla de expertos (MoE) de DeepSeek con 16.375.728.128 parámetros totales, del que solo se activa una fracción por token. Esta variante concreta no introduce adaptadores LoRA ni PEFT: el autor afirma haber aplicado un proceso de "alineamiento" mediante técnicas propias denominadas Topo-CBP, TopoAdamW y AST/LEFM durante el entrenamiento.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar un MoE de 16B en formato GGUF de 17,41 GB mediante llama.cpp. Por otro, el repositorio está envuelto en un marco teórico idiosincrásico (teoría espectral aritmética, consecuencias de la hipótesis de Riemann, constante derivada de primos `LAMBDA = 0.9785142874`) cuyas afirmaciones no están verificadas de forma independiente ni documentadas con métricas estándar. El autor enfatiza la reproducibilidad determinista (semilla fija, decodificación greedy, hash SHA-256 de la salida) más que el rendimiento en benchmarks.

Se trata, por tanto, de un artefacto de investigación con trazabilidad limitada: la model card no reporta evaluaciones comparativas, no declara idiomas soportados y la licencia figura como "other", heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (arquitectura `deepseek`, tokenizer `deepseek-llm`) |
| Parametros totales | 16.375.728.128 |
| Parametros activos | no disponible en la informacion proporcionada |
| Longitud de contexto | no disponible en la model card; los ejemplos de uso emplean `n_ctx=1024` |
| Tipos de cuantizacion | GGUF Q8_0 (unico artefacto publicado, 17,41 GB, 363 tensores) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | GGUF (convertido desde BF16 GGUF) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) de DeepSeek, con 16.375.728.128 parámetros totales según los safetensors del checkpoint original. La model card de esta variante no detalla el número de expertos, el ratio de activación ni la composición del dataset de preentrenamiento, por lo que esos datos deben consultarse en la ficha del modelo original `deepseek-ai/deepseek-moe-16b-base`.

El autor describe un proceso de alineamiento sin LoRA ni PEFT basado en tres componentes propios: Topological Continual Backpropagation (Topo-CBP) y TopoAdamW, orientados a eliminar el olvido catastrófico modificando las actualizaciones de pesos en PyTorch; y Arithmetic Spectral Theory / Laplace-Euler-Fourier-Mellin (AST/LEFM), un operador fundamentado en distribuciones de primos y formalizado en Lean 4 (`AST/LEFM.lean`). La conversión a GGUF se realizó desde un GGUF BF16 intermedio, sin capas adaptadoras. No se especifican el número de tokens de entrenamiento, la composición del corpus ni si hubo RLHF o DPO. La validación reportada es de determinismo (semilla 123, temperatura 0.0, `repeat_penalty=1.1`, verificación por hash SHA-256), no de calidad.

## Capacidades

- Generación de texto por completación: el modelo es un checkpoint *base*, no ajustado a instrucciones, por lo que responde a continuación de prefijos y no a diálogos con roles.
- Razonamiento y conocimiento general heredados del preentrenamiento de DeepSeek MoE 16B.
- Capacidad multilingüe: no documentada en esta variante; depende del modelo base.
- Tool calling / function calling: no disponible; no se documenta plantilla de chat ni soporte de herramientas.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Reproducibilidad determinista: el autor garantiza salidas idénticas con semilla fija y decodificación greedy, verificables por SHA-256.
- Sin adaptadores externos: no requiere cargar LoRA ni PEFT adicionales en llama.cpp.

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo sirve como artefacto de estudio para reproducir los experimentos de Topo-CBP y comparar actualizaciones de pesos frente a un fine-tuning convencional con LoRA.
- Reproducibilidad de pipelines de inferencia: gracias a la semilla fija y la verificación por hash SHA-256, es útil para probar la determinación de salidas entre versiones de llama.cpp o entre máquinas.
- Completación de texto sin instrucciones: adecuado para tareas de continuación de prosa técnica o científica, donde un checkpoint base rinde mejor que un modelo instruct.
- Despliegue local en estación de trabajo: con 17,41 GB en Q8_0, puede ejecutarse en una GPU consumer de 24 GB (RTX 3090/4090) o en CPU con suficiente RAM, ofreciendo un MoE de 16B sin dependencias de servicios en la nube.
- Evaluación de técnicas de cuantización: el artefacto permite medir la degradación de un MoE al pasar de BF16 a Q8_0 en llama.cpp.
- Docencia y divulgación: como ejemplo práctico de conversión GGUF de un modelo MoE y de verificación determinista de inferencia.
- Pruebas de integración con llama-cpp-python: los ejemplos de la model card sirven de plantilla para validar entornos de ejecución antes de desplegar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de calidad; únicamente documenta verificaciones de determinismo (hash SHA-256 de salidas con semilla y temperatura fijas).

## Requisitos de hardware

- VRAM estimada: el fichero Q8_0 ocupa 17,41 GB, por lo que se necesitan al menos ~18-20 GB de VRAM para cargar todas las capas en GPU (`n_gpu_layers=-1`).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para carga completa con holgura; RTX 3090/4090 (24 GB) para carga completa ajustada.
- GPU consumer: cabe en RTX 3090, RTX 4090 y RTX 5090 con 24 GB o más; no cabe en GPUs de 16 GB o menos sin descargar capas a CPU.
- Despliegue: llama.cpp y llama-cpp-python son los soportados de forma explícita; Ollama es viable convirtiendo el GGUF a su formato; vLLM y TGI no están documentados para esta arquitectura en formato GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y del número de expertos activados por token, no especificado en la model card.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Q8_0) | 16,37 B (MoE) | no disponible | GGUF Q8_0 | other | Hugging Face, 71 descargas |
| `deepseek-ai/deepseek-moe-16b-base` | 16,37 B (MoE) | no disponible en esta ficha | safetensors (BF16) | licencia DeepSeek (consultar) | Hugging Face, oficial |
| `deepseek-ai/deepseek-moe-16b-chat` | 16,37 B (MoE) | no disponible en esta ficha | safetensors | licencia DeepSeek (consultar) | Hugging Face, oficial |
| `mistralai/Mixtral-8x7B-v0.1` | 46,7 B (MoE) | 32.768 tokens | safetensors, GGUF | Apache 2.0 | Hugging Face, oficial |

La comparación directa con el checkpoint original es la más relevante: esta variante añade cuantización GGUF y el alineamiento propietario del autor, pero carece de métricas que permitan afirmar equivalencia o mejora respecto al base. Frente a Mixtral 8x7B, este modelo es sustancialmente menor en parámetros totales y su licencia es menos clara.

## Limitaciones y advertencias

- No es un modelo instruct: al derivar de un checkpoint base, no sigue instrucciones ni mantiene diálogos con roles; requiere prompts de completación.
- Ausencia total de benchmarks: no hay evidencia publicada de que el alineamiento Topo-CBP/AST mejore la calidad respecto al modelo base; las afirmaciones teóricas del autor (hipótesis de Riemann, operador LEFM) no están verificadas de forma independiente.
- Licencia "other": no se especifican los términos exactos en la model card; para uso comercial es imprescindible consultar la licencia del modelo base de DeepSeek y aclarar la del artefacto derivado.
- Idiomas no declarados: no se puede garantizar el comportamiento multilingüe sin evaluarlo.
- Contexto no documentado: los ejemplos usan `n_ctx=1024`; no hay confirmación del máximo soportado en esta conversión GGUF.
- Riesgo de alucinación: inherente a un modelo base sin ajuste por RLHF; no hay evaluación de fidelidad factual.
- Trazabilidad limitada: 71 descargas y 0 likes en el momento de la consulta; el repositorio es de un autor individual, no de un laboratorio con proceso de revisión.
- Reproducibilidad dependiente del entorno: el determinismo por hash solo se sostiene con la misma versión de llama.cpp, los mismos parámetros de muestreo y el mismo hardware o backend.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/frankmorales2020/deepseek-moe-16b-base-ast-aligned-nolora-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/deepseek-moe-16b-base
- Cuaderno de código del autor: https://github.com/frank-morales2020/AST/blob/main/ast_deepseek_topo_cbp_moe.ipynb
- Repositorio GitHub del proyecto AST: https://github.com/frank-morales2020/AST
- llama.cpp: https://github.com/ggerganov/llama.cpp
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
