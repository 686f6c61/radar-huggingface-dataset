# ducanhdinh/Qwen1.5-MoE-A2.7B-MidAlign

## Resumen

Qwen1.5-MoE-A2.7B-MidAlign es un adaptador LoRA publicado por el usuario ducanhdinh sobre el modelo base Qwen1.5-MoE-A2.7B de Alibaba Cloud. No se trata de un modelo completo, sino de un conjunto de pesos PEFT (formato safetensors) que se aplica sobre el modelo base para ajustarlo con la metodología MidAlign, una técnica de alineamiento multilingüe que combina entrenamiento de tarea supervisado con pasos contrastivos entre representaciones de frases en inglés y en distintos idiomas objetivo.

El adaptador se entrena con un esquema de entrenamiento alternado: un paso de tarea (loss de lenguaje enmascarado más una pérdida de balanceo de expertos) y un paso de alineamiento contrastivo que empareja estados ocultos mean-pooled de frases inglesas y frases en idiomas destino en la capa 12 del modelo. El objetivo es mejorar la alineación cross-lingual de las representaciones internas del MoE sin degradar el rendimiento en tareas de razonamiento y comprensión en inglés.

Es relevante porque demuestra que es posible aplicar técnicas de alineamiento intermedio (mid-layer) sobre arquitecturas MoE de forma eficiente mediante LoRA, sin reentrenar el modelo completo. El adaptador se distribuye con licencia Apache 2.0, lo que facilita su uso comercial, aunque el modelo base Qwen1.5-MoE-A2.7B tiene su propia licencia que debe verificarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer MoE (Qwen1.5-MoE-A2.7B) |
| Parametros totales | No disponible (el adaptador LoRA no declara su recuento; el modelo base Qwen1.5-MoE-A2.7B tiene 14,3B totales según su model card original) |
| Parametros activos | 2,7B (heredados del modelo base) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen1.5-MoE-A2.7B soporta 32.768 tokens según su model card original) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización dependerá del modelo base y del runtime) |
| Idiomas soportados | No disponibles (el adaptador entrena alineamiento con flores, ntrex y ted, pero no se especifican los idiomas concretos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen1.5-MoE-A2.7B, un modelo de mezcla de expertos con 60 expertos y top-k igual a 4, según los hiperparámetros declarados en la model card. Los módulos LoRA se insertan en el rango de capas [8, 16) (indexado desde 0), es decir, las capas 8 a 15, y cubren atención, router, expertos y el experto compartido. El rank es 8 para atención, router y expertos, con alpha 16 y dropout 0,1.

El entrenamiento sigue el esquema MidAlign con alternancia de pasos. En el paso de tarea se optimiza `L_task = L_LM + lb_loss_coef * L_LB`, con `lb_loss_coef = 0,01`, calculando la pérdida de lenguaje solo sobre la respuesta (prompt enmascarado) y sobre un pool combinado de SQuAD (87.599 muestras), SNLI (549.367 muestras) y MMLU (87.691 muestras tras descartar 12.151). En el paso de alineamiento se aplica una pérdida contrastiva tipo MidAlign (oneway, con negativos dentro de un mini-batch de 4) entre el estado oculto mean-pooled de frases en inglés y frases en idioma destino en la capa 12 (bloque 11 de 24), con temperatura 1,5. El pool de alineamiento contiene 121.571 pares provenientes de flores, ntrex y ted (500 pares por idioma, muestreo aleatorio con semilla 42), repetidos hasta cubrir 724.736 pares por época.

Cada época consta de 5.662 pasos de tarea y 5.662 pasos de alineamiento, garantizando que cada muestra de tarea se use al menos una vez por época (724.657 muestras). El entrenamiento se ejecuta durante 3 épocas con world_size 8, batch de tarea de 16 por rank, batch de alineamiento de 16 por rank, micro-batch de 4.096 tokens y gradient all-reduce manual (sin DDP). Solo se conserva el checkpoint más reciente.

## Capacidades

- Generación de texto y razonamiento en inglés, heredados del modelo base Qwen1.5-MoE-A2.7B.
- Comprensión lectora y respuesta a preguntas extractivas, reforzada por el entrenamiento sobre SQuAD.
- Inferencia de lenguaje natural, reforzada por el entrenamiento sobre SNLI.
- Razonamiento de conocimiento general y respuesta a preguntas de opción múltiple, reforzado por el entrenamiento sobre MMLU.
- Alineamiento cross-lingual de representaciones internas en la capa 12, orientado a mejorar la transferencia entre idiomas.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para el adaptador (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada para el adaptador.
- Capacidades multilingües: el adaptador entrena alineamiento con pares de flores, ntrex y ted, pero no se especifican los idiomas concretos ni se reportan evaluaciones multilingües.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en alineamiento cross-lingual: el adaptador sirve como artefacto reproducible para estudiar cómo el alineamiento contrastivo en capas intermedias afecta a las representaciones de un MoE, con hiperparámetros y curvas de pérdida publicadas en el repositorio.
- Experimentos de transferencia entre idiomas: al alinear frases inglesas con frases en idiomas destino en la capa 12, puede emplearse para evaluar si mejora el rendimiento zero-shot en tareas de comprensión en idiomas distintos del inglés.
- Respuesta a preguntas extractivas: el ajuste sobre SQuAD permite usar el adaptador en pipelines de QA sobre documentos, aprovechando la ventana de contexto del modelo base.
- Clasificación de pares de frases e inferencia textual: el entrenamiento sobre SNLI lo hace adecuado para tareas de entailment y detección de contradicciones en inglés.
- Evaluación de razonamiento de conocimiento general: el ajuste sobre MMLU permite usarlo como banco de pruebas para medir el impacto del alineamiento en tareas de opción múltiple.
- Base para adaptadores multilingües en producción: al ser un LoRA Apache 2.0 sobre un MoE de 2,7B activos, puede integrarse en despliegues existentes de Qwen1.5-MoE-A2.7B sin duplicar el coste de inferencia del modelo completo.
- Estudio de eficiencia de LoRA en MoE: los módulos LoRA cubren router y expertos, lo que permite analizar el efecto del ajuste selectivo en el enrutamiento de expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente curvas de pérdida de entrenamiento (`diagnostics/task_loss_curve.png` y `diagnostics/align_loss_curve.png`) y un registro de diagnóstico por paso (`diagnostics/loss_log.jsonl`), sin métricas de evaluación sobre SQuAD, SNLI, MMLU ni tareas multilingües.

## Requisitos de hardware

- El adaptador LoRA en sí es pequeño en comparación con el modelo base, pero requiere cargar Qwen1.5-MoE-A2.7B completo para la inferencia.
- VRAM estimada para el modelo base en precisión completa (BF16): aproximadamente 28-30 GB para los 14,3B parámetros totales, más overhead de activaciones y caché KV.
- VRAM estimada con cuantización de 8 bits: en torno a 15-16 GB; con 4 bits: en torno a 8-10 GB, dependiendo del runtime.
- GPU recomendadas: A100 40 GB u 80 GB, H100 para despliegues de producción; en consumer, RTX 4090 (24 GB) puede alojar el modelo en 8 bits o 4 bits, y GPUs con 16 GB pueden intentarlo en 4 bits con contextos reducidos.
- Opciones de despliegue: el adaptador es PEFT, por lo que puede cargarse con la librería `peft` sobre el modelo base en Hugging Face Transformers; para serving se puede fusionar el adaptador con el modelo base y desplegar con vLLM, TGI o llama.cpp (este último requiere convertir a GGUF).
- Latencia y throughput: no disponibles en la información proporcionada. Al tratarse de un MoE con 2,7B parámetros activos, el coste por token es inferior al de un modelo denso de 14,3B, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen1.5-MoE-A2.7B-MidAlign (este) | 14,3B / 2,7B (heredados) | No disponible | Apache 2.0 | LoRA safetensors | Adaptador de alineamiento cross-lingual |
| Qwen1.5-MoE-A2.7B (base) | 14,3B / 2,7B | 32.768 tokens | Apache 2.0 | safetensors | Modelo base sin ajuste de alineamiento |
| Qwen1.5-7B | 7B densos | 32.768 tokens | Apache 2.0 | safetensors | Alternativa densa de tamaño similar en activos |
| Mixtral-8x7B | 46,7B / 12,9B | 32.768 tokens | Apache 2.0 | safetensors | MoE de mayor tamaño, no directamente comparable en coste |

La comparación con alternativas de alineamiento cross-lingual no está disponible en la información proporcionada, ya que no se identifican otros adaptadores MidAlign públicos sobre Qwen1.5-MoE en la documentación consultada.

## Limitaciones y advertencias

- El adaptador no es un modelo autónomo: requiere descargar y cargar Qwen1.5-MoE-A2.7B, lo que implica asumir los requisitos de hardware y la licencia del modelo base.
- No se han publicado evaluaciones de rendimiento, por lo que no hay evidencia cuantitativa de que el alineamiento mejore tareas downstream ni de que no degrade el rendimiento en inglés.
- El entrenamiento de tarea se realiza exclusivamente en inglés (SQuAD, SNLI, MMLU), lo que puede limitar la calidad en otros idiomas pese al alineamiento contrastivo.
- No se especifican los idiomas cubiertos por el pool de alineamiento (flores, ntrex, ted), lo que impide conocer la cobertura real.
- Riesgo de alucinación inherente al modelo base, no mitigado específicamente por este adaptador.
- Sesgos conocidos: no disponibles en la información proporcionada; se heredan los del modelo base y los de los datasets SQuAD, SNLI y MMLU.
- El adaptador se entrenó solo 3 épocas y se conserva únicamente el checkpoint más reciente, sin posibilidad de comparar con checkpoints intermedios.
- La licencia Apache 2.0 del adaptador no exime de cumplir la licencia del modelo base Qwen1.5-MoE-A2.7B para uso comercial.
- El repositorio ocupa 313,9 GB, lo que sugiere que incluye artefactos adicionales además del adaptador; conviene revisar el contenido antes de descargarlo completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ducanhdinh/Qwen1.5-MoE-A2.7B-MidAlign
- Modelo base: https://huggingface.co/Qwen/Qwen1.5-MoE-A2.7B
- Curvas de pérdida de tarea: `diagnostics/task_loss_curve.png` (dentro del repositorio)
- Curvas de pérdida de alineamiento: `diagnostics/align_loss_curve.png` (dentro del repositorio)
- Registro de diagnóstico: `diagnostics/loss_log.jsonl` (dentro del repositorio)
