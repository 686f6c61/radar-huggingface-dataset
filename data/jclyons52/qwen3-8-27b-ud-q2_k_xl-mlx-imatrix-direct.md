# jclyons52/Qwen3.8-27B-UD-Q2_K_XL-MLX-imatrix-direct

## Resumen

Qwen3.8-27B-UD-Q2_K_XL-MLX-imatrix-direct es un port nativo a MLX de la cuantización dinámica UD-Q2_K_XL desarrollada por unsloth para el modelo Qwen3.8-27B de Alibaba. El autor, jclyons52, implementa el proceso de cuantización directamente en el formato affine de MLX (grupo de 64), sin pasar por un round-trip de GGUF ni por la re-cuantización de `mlx_lm.convert`. Esto significa que los pesos emitidos son exactamente los que la búsqueda de cuantización seleccionó, lo que evita pérdidas adicionales por conversión.

El modelo resultante es una versión de 2 bits del Qwen3.8-27B, un transformer denso de 27.000 millones de parámetros con ventana de contexto nativa de 262.000 tokens. Sin embargo, la model card advierte que la torre visual del checkpoint base no se incluye, por lo que esta versión es exclusivamente de texto. La cuantización extrema a 2 bits introduce una degradación notable frente al GGUF equivalente: la perplejidad en wikitext-2 sube de 7.180 a 9.133, una diferencia de +1,95 puntos que el autor atribuye a la imposibilidad de MLX de representar los codebooks IQ no lineales que unsloth usa para bits ≤3.

La relevancia de este modelo radica en que demuestra una vía para ejecutar cuantizaciones dinámicas de muy baja precisión de forma nativa en MLX, sin depender de herramientas externas, y permite estudiar los límites de la cuantización affine frente a los codebooks IQ. Está pensado para investigación y experimentación, no para uso productivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B) |
| Parametros totales | 27.000 millones (27B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | UD-Q2_K_XL (2 bits dinamicos, grupo 64, affine) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX nativo (codigos uint32 empaquetados + escalas/biases bf16) |

## Arquitectura y entrenamiento

Este modelo no es un entrenamiento nuevo, sino una cuantizacion del checkpoint Qwen3.8-27B de Alibaba. El proceso, descrito en la model card, consta de tres pasos: primero se extrae el mapa de bits dinamico por tensor del archivo GGUF `Qwen3.8-27B-UD-Q2_K_XL.gguf` publicado por unsloth; segundo, se realiza una busqueda affine ponderada por importancia por cada grupo, utilizando la imatrix publicada por unsloth (energias de activacion por columna); tercero, se emiten directamente los pesos finales en formato MLX (codigos uint32 empaquetados con escalas y biases en bf16), sin pasar por una conversion intermedia.

La innovacion tecnica principal es que la cuantizacion se ejecuta de forma nativa en el formato affine de MLX, evitando la doble cuantizacion que ocurriria si se convirtiera un GGUF a MLX con `mlx_lm.convert`. Sin embargo, esto tiene una limitacion inherente: los kernels de matmul cuantizado de MLX solo soportan rejillas affine uniformes, mientras que los codebooks IQ no lineales de unsloth para bits ≤3 no son representables en ese formato. Por eso la perplejidad final es mayor que la del GGUF equivalente.

El modelo no esta pensado para entrenamiento adicional ("Not for further training") y la evaluacion se limita a wikitext-2 con 32.000 tokens; no se han caracterizado tareas downstream.

## Capacidades

- Generacion de texto en modo conversacional y continuacion de texto.
- Razonamiento y codificacion heredados del modelo base Qwen3.8-27B, aunque degradados por la cuantizacion de 2 bits.
- Sin soporte de vision: la torre visual del checkpoint base no se incluye en esta version.
- Sin soporte confirmado de tool calling o function calling en esta cuantizacion especifica (el modelo base lo soporta, pero no hay evidencia de que funcione correctamente a 2 bits).
- Sin modo de razonamiento explicito (thinking mode) documentado en esta version.
- Capacidades multilingues no documentadas en la model card.

## Casos de uso

- Investigacion sobre cuantizacion extrema: permite estudiar como afecta una cuantizacion de 2 bits con mapa dinamico a la perplejidad y a la calidad de generacion en comparacion con GGUF, especialmente en el contexto de las limitaciones de los kernels affine de MLX.
- Pruebas de despliegue en hardware Apple Silicon con memoria limitada: al ocupar aproximadamente 7-8 GB de RAM en pesos, puede ejecutarse en equipos con 16 GB unificados, algo inviable con el modelo en precision completa.
- Evaluacion de la brecha entre formatos de cuantizacion: sirve para medir cuantitativamente la diferencia entre codebooks IQ no lineales y rejillas affine uniformes en modelos de 27B.
- Desarrollo de pipelines de cuantizacion nativa MLX: el repositorio `ud2mlx` documenta el proceso y puede servir de base para implementar cuantizaciones dinamicas similares en otros modelos.
- Experimentos de perplejidad y calidad de lenguaje en condiciones de compresion maxima: util para validar metricas y metodologias de evaluacion en modelos de baja precision.
- Demostracion tecnica de conversion directa GGUF a MLX sin round-trip: interesante para ingenieros que trabajan con herramientas de despliegue local y necesitan entender las implicaciones de cada formato.

## Benchmarks y rendimiento

La unica metrica publicada es la perplejidad en wikitext-2-raw (primeros 32.000 tokens, ventanas de 512 tokens):

| Build | PPL (menor es mejor) |
|---|---:|
| unsloth UD-Q2_K_XL GGUF en llama.cpp | 7.180 |
| este modelo (MLX nativo) | 9.133 |

La diferencia de +1,95 puntos se atribuye a la incapacidad de los kernels affine de MLX para representar los codebooks IQ no lineales de unsloth. No se han publicado resultados de tareas downstream como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: los pesos de 2 bits ocupan aproximadamente 27.000 millones × 2 bits / 8 = 6,75 GB, mas overhead de escalas y biases en bf16. El tamano del repositorio es de 15,2 GB, pero incluye posiblemente archivos adicionales; la carga en memoria deberia rondar los 7-9 GB.
- GPU recomendadas: exclusivamente Apple Silicon (MLX no soporta CUDA). Se recomienda un chip con al menos 16 GB de memoria unificada para dejar margen al contexto y al runtime.
- En consumer GPU: no aplica, MLX es especifico de Apple.
- Opciones de despliegue: `mlx-lm` (runtime oficial), o cualquier herramienta que cargue pesos MLX. No es compatible con llama.cpp, vLLM ni Ollama.
- Latencia y throughput: no disponibles. A 2 bits, la velocidad de generacion dependera del chip Apple Silicon, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Formato | Bits | Perplejidad (wikitext-2) | Contexto | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | FP16/BF16 | 16 | no publicado | 262K | Apache-2.0 |
| unsloth Qwen3.8-27B-UD-Q2_K_XL | GGUF | 2 (IQ) | 7.180 | 262K | Apache-2.0 |
| este modelo | MLX | 2 (affine) | 9.133 | 262K | Apache-2.0 |

La comparativa muestra que la version MLX pierde frente al GGUF equivalente en perplejidad, pero ofrece la ventaja de ser nativa en MLX y no requerir conversion. Frente al modelo base, la degradacion es sustancial, como cabe esperar de una cuantizacion de 2 bits.

## Limitaciones y advertencias

- Degradacion significativa de calidad: la perplejidad es 1,95 puntos peor que el GGUF equivalente, lo que probablemente se traduzca en errores frecuentes, incoherencias y alucinaciones en generacion de texto.
- Solo texto: la torre visual del modelo base no se incluye, por lo que no se pueden procesar imagenes.
- Evaluacion muy limitada: solo wikitext-2 con 32.000 tokens; no hay datos de tareas downstream ni de seguridad.
- No apto para entrenamiento adicional: los pesos cuantizados no deben usarse como base para fine-tuning.
- Sesgos del modelo base: al ser una cuantizacion del Qwen3.8-27B, hereda los sesgos y limitaciones del modelo original, que no estan documentados en esta model card.
- Riesgo de alucinacion: a 2 bits, la fidelidad factual es muy baja; no debe usarse en produccion ni para tareas que requieran precision.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la calidad del modelo hace inviable su uso en entornos reales.
- Limitacion de formato: solo ejecutable en Apple Silicon via MLX; no es portable a otros ecosistemas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jclyons52/Qwen3.8-27B-UD-Q2_K_XL-MLX-imatrix-direct
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B (GitHub): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- GGUF de unsloth para Qwen3.8-27B: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Documentacion de unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Pagina de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Repositorio del pipeline ud2mlx: https://github.com/jclyons52/ud2mlx (referenciado en la model card)
- Runtime mlx-lm: https://github.com/ml-explore/mlx-lm
