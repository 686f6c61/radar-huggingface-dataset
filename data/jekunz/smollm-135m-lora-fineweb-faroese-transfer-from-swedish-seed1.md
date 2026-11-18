# jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-swedish-seed1

## Resumen

Este repositorio contiene un adaptador LoRA de tipo PEFT entrenado sobre el modelo base jekunz/smollm-135m-lora-fineweb-swedish, que a su vez parte de SmolLM2-135M-Instruct. El autor, jekunz, lo ha desarrollado como parte de su investigación sobre transferencia entre lenguas de bajos recursos: primero ajusta el modelo con texto sueco de FineWeb-2 y después lo especializa con texto feroés del mismo corpus. Se trata, por tanto, de un modelo de generación de texto de 135 millones de parámetros orientado al feroés, una lengua germánica nórdica con muy pocos recursos digitales.

El interés del artefacto es metodológico más que de producto: ilustra una estrategia de transferencia secuencial sueco → feroés mediante LoRA de rango alto (256) sobre un modelo pequeño, con un coste de entrenamiento de una sola GPU A100 de 40 GB. El resultado es un adaptador de 0,2 GB de tamaño de repositorio que se carga sobre la cadena de modelos base y que, según la model card, no ha sido evaluado de forma amplia.

Es relevante ahora porque los modelos de menos de 200 millones de parámetros permiten experimentación de bajo coste en lenguas de bajos recursos y despliegues en CPU o GPUs de consumo, y porque documenta una receta reproducible (semilla 1 de tres configuraciones) para estudiar el olvido catastrófico y la transferencia entre idiomas emparentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 135 millones en el modelo base; el adaptador LoRA se suma sobre este (tamaño del repo: 0,2 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens durante el entrenamiento; la ventana nativa del base SmolLM2 es mayor, pero no se documenta en la informacion disponible |
| Tipos de cuantizacion | no disponible (el repo contiene pesos del adaptador en safetensors; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | feroés (fo) como objetivo; el base está entrenado en inglés y el adaptador intermedio en sueco |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros. Sobre él se aplica un adaptador LoRA con rango 256, alpha 512 y módulos objetivo up_proj, down_proj, gate_proj y o_proj, es decir, las proyecciones de las capas MLP y la proyección de salida de atención, sin tocar las proyecciones q_proj y k_proj. El adaptador se entrena en dos fases: primero una época sobre la porción sueca de FineWeb-2 y después cinco épocas sobre la porción feroesa del mismo corpus, lo que constituye una transferencia secuencial entre dos lenguas nórdicas.

La configuración de entrenamiento documentada incluye tasa de aprendizaje 8e-4 con scheduler coseno, warmup ratio 0,05, batch size 8 con 32 pasos de acumulación de gradiente (batch efectivo 256), longitud máxima de contexto de 2048 tokens y una única GPU A100 de 40 GB. Se trata de la semilla 1 de tres ejecuciones previstas para esta misma configuración, lo que sugiere un diseño experimental orientado a medir la varianza entre semillas. No se documentan en la información disponible el número total de tokens procesados, la composición exacta del dataset más allá de FineWeb-2, ni si hubo etapas de RLHF o DPO posteriores.

## Capacidades

- Generación de texto conversacional en feroés, heredada de la naturaleza Instruct del modelo base.
- Transferencia multilingüe inducida: el adaptador intermedio en sueco actúa como puente antes del ajuste en feroés.
- Comprensión y generación en inglés y sueco residuales, procedentes del base y de la primera fase de entrenamiento (no evaluado).
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido.
- Adecuado para tareas de continuación de texto y generación corta, limitado por su tamaño de 135M parámetros.

## Casos de uso

- Investigación sobre transferencia entre lenguas de bajos recursos: el adaptador permite comparar la ruta sueco → feroés frente a un ajuste directo desde el base, midiendo perplejidad en un corpus feroés de validación.
- Experimentos de olvido catastrófico: al ser la semilla 1 de tres, sirve para cuantificar la variabilidad de los resultados entre ejecuciones con idéntica configuración.
- Generación de texto sintético en feroés para aumento de datos: con 135M parámetros y contexto de 2048 tokens, puede producir borradores de frases y párrafos que luego se filtran manualmente.
- Prototipado de asistentes conversacionales en feroés en entornos con recursos mínimos: el adaptador de 0,2 GB se carga sobre el base y puede ejecutarse en CPU para demos internas.
- Evaluación de pipelines PEFT: sirve como caso de prueba para validar flujos de carga de adaptadores LoRA encadenados (base → adaptador sueco → adaptador feroés) en herramientas como PEFT o vLLM.
- Docencia y reproducción de recetas: la configuración completa (rank, alpha, módulos objetivo, LR, scheduler, batch efectivo) permite replicar el experimento en una sola A100 de 40 GB o en GPUs de menor memoria con acumulación de gradiente.
- Estudio de la calidad de FineWeb-2 en lenguas de bajos recursos: el modelo puede usarse como sonda para detectar ruido o dominio en la porción feroesa del corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el modelo no ha sido evaluado de forma amplia.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA ocupa 0,2 GB; el modelo base de 135M parámetros en fp16 requiere aproximadamente 0,3 GB de pesos, por lo que la inferencia completa cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el entrenamiento documentado se realizó en una A100 de 40 GB, pero el modelo es viable en RTX 3060, RTX 4060, RTX 4090 y similares.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida.
- Opciones de despliegue: PEFT con Transformers para cargar el adaptador; llama.cpp u Ollama requerirían convertir y fusionar el adaptador con el base a GGUF, lo que no se distribuye en el repo; vLLM y TGI son compatibles con el base, pero la carga de adaptadores LoRA encadenados requiere verificación.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por token en GPU moderna, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-swedish-seed1 | 135M + LoRA | 2048 (entrenamiento) | apache-2.0 | Hugging Face, 0 descargas | Adaptador experimental, sin benchmarks |
| SmolLM2-135M-Instruct (HuggingFaceTB) | 135M | no disponible en esta ficha | apache-2.0 | Hugging Face, ampliamente usado | Base del anterior; multilingüe general, sin especialización en feroés |
| jekunz/smollm-135m-lora-fineweb-swedish | 135M + LoRA | 2048 (entrenamiento) | apache-2.0 | Hugging Face | Adaptador intermedio en sueco; mismo autor y receta |
| Modelos específicos para feroés de mayor tamaño | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativas publicadas en la información consultada |

## Limitaciones y advertencias

- Modelo no evaluado: la model card declara que no ha sido evaluado más allá del entrenamiento, por lo que no hay garantías de calidad en generación.
- Riesgo elevado de alucinación y de texto incoherente: con 135M parámetros y solo cinco épocas sobre feroés, la fluidez y la fidelidad factual son limitadas.
- Sesgos desconocidos: no se documenta ningún análisis de sesgos; el corpus FineWeb-2 puede arrastrar sesgos de dominio y de representación de la lengua feroesa.
- Contexto limitado a 2048 tokens en entrenamiento, insuficiente para documentos largos o conversaciones extensas.
- Cobertura lingüística restringida: el objetivo es el feroés; el rendimiento en inglés y sueco tras el ajuste no está medido y puede haberse degradado por olvido catastrófico.
- Licencia apache-2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable su uso en producción sin una validación propia.
- Dependencia de la cadena de modelos base: requiere cargar el base SmolLM2-135M-Instruct y el adaptador sueco antes del feroés, lo que complica el despliegue y la reproducibilidad.
- Repositorio sin descargas ni interacción: no hay evidencia de uso por terceros ni de informes de calidad independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-swedish-seed1
- Modelo base intermedio (sueco): https://huggingface.co/jekunz/smollm-135m-lora-fineweb-swedish
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2-135M-Instruct (modelo base original): https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
