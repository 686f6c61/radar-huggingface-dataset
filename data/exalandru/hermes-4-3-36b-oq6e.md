# exalandru/Hermes-4.3-36B-oQ6e

## Resumen

Hermes-4.3-36B-oQ6e es una cuantización mixta de precisión del modelo NousResearch/Hermes-4.3-36B, publicada por el usuario exalandru. El checkpoint resultante conserva los 36.151.104.512 parámetros del modelo original pero los almacena con una media efectiva de 6,700 bits por peso, lo que reduce el espacio en disco a 30,3 GB (28,197 GiB de pesos lógicos). El objetivo es claro: hacer desplegable en hardware de Apple Silicon, mediante MLX, un modelo de 36B que en BF16 ocuparía aproximadamente 72 GB.

La pieza diferencial es la técnica de cuantización empleada, oQ (oMLX v0.8.4), que aplica precisión mixta en lugar de un único esquema uniforme: el 90,018 % de los pesos (32.543B) se guardan en affine 6-bit con grupo de 64, el 9,978 % (3.607B) se elevan a affine 8-bit para preservar capas sensibles, y un residual mínimo de 0,001B permanece en BF16. Esta distribución selectiva busca mitigar la degradación típica de las cuantizaciones agresivas sin renunciar a un ahorro de almacenamiento superior al 60 % respecto al original.

Es relevante ahora porque permite ejecutar localmente un modelo de escala 36B en equipos con memoria unificada de 32-64 GB, un segmento que hasta hace poco quedaba restringido a modelos de 7B-14B. La ficha se centra en el artefacto cuantizado; los datos de arquitectura, entrenamiento y capacidades del modelo base no están documentados en la información proporcionada y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: NousResearch/Hermes-4.3-36B) |
| Parametros totales | 36.151.104.512 (36,151B) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixed-precision: affine 6-bit grupo 64 (90,018 % de pesos), affine 8-bit grupo 64 (9,978 %), BF16 (0,004 %); media efectiva 6,700 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería mlx) |
| Tamano del repositorio | 30,3 GB (28,197 GiB de pesos) |
| Herramienta de cuantizacion | oQ / oMLX v0.8.4 |
| Modelo base | NousResearch/Hermes-4.3-36B |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base (tipo de transformer, atención, capas, dimensionalidad oculta) ni sobre su proceso de entrenamiento (número de tokens, composición del dataset, fases de RLHF o DPO). La model card del artefacto cuantizado no documenta ninguno de estos extremos.

La innovación documentada es exclusivamente la relativa a la cuantización. oQ aplica precisión mixta con granularidad de grupo 64: la mayoría de tensores se comprimen a 6 bits con escala y offset affine por grupo, mientras que un subconjunto del 9,978 % de los pesos se mantiene a 8 bits, presumiblemente para preservar capas con mayor sensibilidad numérica (embeddings, cabezas de atención o proyecciones críticas). El resultado son 28,197 GiB de almacenamiento con 6,700 bits/peso efectivos, frente a los 16 bits/peso de un checkpoint BF16. No se especifica qué criterio siguió la herramienta para seleccionar las capas elevadas a 8 bits ni si se realizó una evaluación de perplejidad tras la cuantización.

## Capacidades

- No se documentan capacidades específicas del modelo base en la información proporcionada.
- Por herencia del modelo base Hermes-4.3-36B cabe esperar generación de texto, razonamiento y conversación multi-turno, pero no hay confirmación en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas aparece vacío).
- Modo thinking, visión o audio: no disponible.
- La única capacidad verificable del artefacto es la ejecución en MLX con pesos cuantizados de 6,700 bits/peso efectivos.

## Casos de uso

- Despliegue local en Apple Silicon: el checkpoint de 28,197 GiB encaja en Mac con memoria unificada de 32 GB o superior, permitiendo ejecutar un modelo de 36B sin GPU dedicada mediante MLX.
- Prototipado de asistentes conversacionales en estación de trabajo: al eliminar la dependencia de la nube, sirve para iterar sobre prompts y flujos multi-turno con datos que no pueden salir del equipo.
- Evaluación comparativa de cuantizaciones: útil como referencia para medir la pérdida de calidad de oQ 6,700 bits frente al BF16 original en tareas de razonamiento y generación.
- Investigación sobre precisión mixta: la distribución 6-bit/8-bit permite estudiar qué capas toleran compresión agresiva y cuáles requieren mayor precisión.
- Generación de texto por lotes en local: para tareas de resumen, reescritura o clasificación sobre corpus privados donde el coste por token de una API resulta prohibitivo.
- Base para fine-tuning ligero con LoRA: al ser un checkpoint MLX de 30,3 GB, puede adaptarse en equipos de gama alta con memoria unificada, aunque no se documenta soporte oficial.
- Pruebas de integración en pipelines MLX: validar la librería mlx y la herramienta oQ antes de adoptarlas en un flujo de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta métricas de almacenamiento y distribución de bits, sin evaluaciones de calidad (MMLU, HumanEval, GSM8K u otras) ni comparación de perplejidad frente al modelo base en BF16.

## Requisitos de hardware

- VRAM / memoria unificada estimada: 28,197 GiB solo para pesos; con overhead de contexto y caché KV, se recomienda un mínimo de 32 GB y, para contextos largos, 48-64 GB.
- GPU dedicadas: no aplica de forma nativa, ya que el formato es MLX (Apple Silicon). Para CUDA sería necesario reconvertir los pesos a otro formato, lo que no se documenta.
- Cabe en consumer GPU: no en el sentido habitual; está pensado para Mac con memoria unificada (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max con 32 GB o más).
- Opciones de despliegue: MLX (librería nativa) y mlx-lm para inferencia; llama.cpp, Ollama, vLLM o TGI no son compatibles directamente con este checkpoint sin conversión.
- Latencia y throughput: no disponibles; dependen del chip Apple, del ancho de banda de memoria y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Hermes-4.3-36B-oQ6e (este) | 36,151B | no disponible | oQ 6,700 bits/peso | apache-2.0 | safetensors MLX |
| NousResearch/Hermes-4.3-36B (base) | 36,151B | no disponible | BF16 | no disponible | safetensors |
| Otras cuantizaciones GGUF del mismo base | 36,151B | no disponible | Q4/Q5/Q6 típicas | según autor | GGUF |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría. La comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- La cuantización a 6,700 bits/peso puede introducir degradación en tareas sensibles a la precisión numérica; no se publica evaluación de perplejidad ni comparación con el BF16.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validación comunitaria del artefacto.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas del modelo base.
- La licencia apache-2.0 se declara en el artefacto, pero conviene verificar la licencia del modelo base NousResearch/Hermes-4.3-36B antes de uso comercial, ya que no se detalla en la información disponible.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a CUDA sin conversión.
- No se especifica la estrategia de selección de capas en 8 bits ni si se preservaron capas críticas como las de embeddings o la cabeza de salida.
- Al ser un artefacto derivado, cualquier cambio en el modelo base no se refleja automáticamente en este checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/exalandru/Hermes-4.3-36B-oQ6e
- Modelo base: https://huggingface.co/NousResearch/Hermes-4.3-36B
- Herramienta de cuantización oQ/oMLX: https://github.com/jundot/omlx
