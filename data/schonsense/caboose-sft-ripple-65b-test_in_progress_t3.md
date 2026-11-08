# schonsense/Caboose-SFT-Ripple-65B-test_in_progress_T3

## Resumen

Caboose-SFT-Ripple-65B-test_in_progress_T3 es un ajuste fino supervisado (SFT) del modelo denso Ripple-65B-Preview, desarrollado por el usuario schonsense a partir del modelo base de Ricursive AI. Se trata de un experimento en curso (de ahí el sufijo "test_in_progress") con 64.782.689.360 parámetros reales verificados en los pesos safetensors, lo que lo sitúa en la categoría de modelos densos de 65B. El repositorio ocupa 129,6 GB y se distribuye bajo licencia Apache 2.0, aunque el acceso está restringido y requiere aceptar condiciones en Hugging Face.

El modelo base, Ripple-65B-Preview, es un modelo open-weight denso publicado por Ricursive AI bajo Apache 2.0 que, según la información disponible, alcanza 80,5 en Terminal-Bench 2.1, lo que lo posiciona como una alternativa relevante para tareas de agentes y automatización de terminal. Este ajuste SFT hereda esa base y añade un entrenamiento supervisado adicional cuyo contenido y metodología no se detallan en la información proporcionada.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de 65B denso con licencia permisiva que puede desplegarse en infraestructura propia; por otro, advierte de que se trata de un artefacto experimental sin benchmarks publicados, sin idiomas declarados y sin pipeline definido, por lo que su uso en producción debe evaluarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Ripple-65B-Preview; detalles no disponibles) |
| Parametros totales | 64.782.689.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con custom_code y librería ricursive) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer denso de 65B parámetros, según la información pública de Ricursive AI. El repositorio declara la etiqueta `custom_code` y la librería `ricursive`, lo que indica que la carga del modelo requiere código personalizado más allá de la implementación estándar de Transformers; no se dispone de detalles sobre el tipo de atención, la normalización o innovaciones concretas de la arquitectura.

En cuanto al entrenamiento, este repositorio corresponde a un ajuste fino supervisado (SFT) sobre Ripple-65B-Preview, como indica el prefijo "Caboose-SFT". No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO adicionales. Tampoco se documentan innovaciones técnicas propias de este ajuste.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Ripple-65B-Preview.
- Capacidades orientadas a agentes y automatización de terminal, dado que el modelo base reporta 80,5 en Terminal-Bench 2.1.
- Soporte de tool calling / function calling: no confirmado en la información disponible para este ajuste.
- Razonamiento multi-paso y uso de agentes: plausible por la naturaleza del modelo base, pero no verificado para este SFT.
- Capacidades multilingües: no disponibles (no se declaran idiomas en la model card).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Automatización de tareas en terminal: el modelo base destaca en Terminal-Bench 2.1, por lo que este ajuste podría emplearse para generar y ejecutar comandos de shell en pipelines de administración de sistemas, siempre que se valide el comportamiento tras el SFT.
- Asistencia a desarrolladores en entornos CLI: integración en herramientas de línea de comandos para explicar errores, sugerir comandos y automatizar tareas repetitivas de build y despliegue.
- Generación de código en flujos internos: con 65B parámetros densos y licencia Apache 2.0, puede desplegarse en infraestructura propia para autocompletado o revisión de código, sujeto a evaluación previa.
- Investigación sobre ajuste fino: al ser un experimento SFT documentado públicamente, sirve como referencia para estudiar el efecto del entrenamiento supervisado sobre un modelo base de 65B.
- Despliegue on-premise con requisitos de privacidad: la licencia permisiva y la disponibilidad de pesos permiten ejecutarlo en clústeres internos sin depender de APIs externas.
- Evaluación comparativa de modelos densos de 65B: útil como punto de comparación frente a otros modelos open-weight de tamaño similar en tareas de agentes y razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este ajuste SFT. El único dato del modelo base es una puntuación de 80,5 en Terminal-Bench 2.1 para Ripple-65B-Preview, según la nota de prensa de Ricursive AI; no se dispone de resultados de MMLU, HumanEval, GSM8K u otros para este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 130 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 2 GPU de 80 GB (A100/H100) con tensor parallelism.
- Cuantización a 8 bits: en torno a 65 GB, viable en una GPU de 80 GB (A100/H100) con margen limitado.
- Cuantización a 4 bits: en torno a 33-35 GB, viable en una RTX 4090 (24 GB) solo con offloading parcial o en GPU de 48 GB (A6000, L40S).
- GPU recomendadas: H100 80 GB, A100 80 GB, L40S 48 GB; en consumer, RTX 4090 requiere cuantización agresiva y offloading.
- Opciones de despliegue: al requerir `custom_code` y la librería `ricursive`, es probable que necesite Transformers con `trust_remote_code=True`; no se confirma soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Caboose-SFT-Ripple-65B-test_in_progress_T3 | 64,78B densos | no disponible | Apache 2.0 | SFT experimental, acceso restringido, sin benchmarks publicados |
| Ripple-65B-Preview (base) | ~65B densos | no disponible | Apache 2.0 | 80,5 en Terminal-Bench 2.1 según Ricursive AI |
| Otros modelos densos open-weight de ~65B | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Modelo experimental ("test_in_progress"): no hay garantías de calidad ni de estabilidad del ajuste SFT.
- Ausencia total de benchmarks publicados para este repositorio; no debe asumirse el rendimiento del modelo base.
- No se declaran idiomas soportados; el comportamiento multilingüe es incierto.
- Riesgo de alucinación inherente a los modelos de lenguaje; sin evaluación específica no puede cuantificarse.
- Sesgos desconocidos: no se documenta la composición del dataset de SFT ni del preentrenamiento.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad.
- Dependencia de `custom_code` y de la librería `ricursive`: puede complicar el despliegue en stacks estándar y en herramientas de inferencia optimizadas.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre el dataset de entrenamiento puede plantear dudas sobre la procedencia de los datos.
- Tamaño de 129,6 GB en el repositorio: requiere almacenamiento y ancho de banda considerables para su descarga y despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/schonsense/Caboose-SFT-Ripple-65B-test_in_progress_T3
- Repositorio hermano (T2): https://huggingface.co/schonsense/Caboose-SFT-Ripple-65B-test_in_progress_T2
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Nota de prensa sobre Ripple-65B-Preview: https://www.marktechpost.com/2026/11/04/ricursive-ripple-65b-preview-open-weight-model/
