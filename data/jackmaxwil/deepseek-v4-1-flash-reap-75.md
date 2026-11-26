# jackmaxwil/DeepSeek-V4.1-Flash-REAP-75

## Resumen

DeepSeek-V4.1-Flash-REAP-75 es una variante podada del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por el usuario independiente jackmaxwil. Se trata de un transformer con arquitectura Mixture-of-Experts (MoE) al que se le ha eliminado el 75 % de sus expertos enrutados mediante REAP (Router-weighted Expert Activation Pruning, arXiv:2510.13999). Cada capa MoE conserva 96 de sus 384 expertos enrutados, mientras que el experto compartido, la atención, los embeddings y el resto de pesos permanecen intactos. No hubo reentrenamiento tras la poda.

El checkpoint cuenta con 355.459.961.554 parámetros totales (unos 355.500 millones) y un tamaño de repositorio de 293,6 GB, lo que refleja el formato FP4 de los pesos de los expertos. El modelo base está bajo licencia MIT y esta derivada conserva la misma licencia. Es relevante ahora porque demuestra una vía de compresión agresiva sobre un MoE de gran escala sin reentrenamiento, manteniendo una fracción considerable del comportamiento del modelo original en tareas de código, terminal y uso de herramientas.

La ficha se basa exclusivamente en la información publicada en Hugging Face y en la model card del autor; los datos no disponibles se indican como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con experto compartido; 384 expertos enrutados en el modelo base, reducidos a 96 por capa tras la poda |
| Parametros totales | 355.459.961.554 (dato real de safetensors) |
| Parametros activos | no disponible (num_experts_per_tok = 6, pero no se publica el recuento exacto de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos de expertos en FP4 según el modelo base; el autor menciona kernels FP8/FP4 en el código de referencia; no se detallan otras cuantizaciones |
| Idiomas soportados | no disponible (la calibración se hizo solo con inglés y código; el autor advierte degradación esperada en chino) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 293,6 GB), con `config.json` e `inference/config.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 384 expertos enrutados por capa y un experto compartido, con `num_experts_per_tok = 6`. La poda REAP puntúa cada experto por el producto del peso de su compuerta de enrutamiento y la norma de su salida, promediado sobre los tokens enrutados a él, y conserva los 96 mejores por capa. El router (peso y sesgo) de cada capa MoE se recorta a los expertos supervivientes, que se renumeran de 0 a 95 en su orden original. Los pesos de los expertos mantienen el formato FP4 del modelo base. No hubo reentrenamiento ni ajuste fino posterior a la poda.

La calibración se ejecutó sobre 2.946.031 tokens (24 sesiones de hasta 16.384 tokens) de inglés y código, con énfasis en coding agéntico, terminal y uso de herramientas. Fuentes: nvidia/Open-SWE-Traces, nebius/SWE-rebench-V2-PRs, nvidia/Nemotron-Terminal-Corpus, Agent-Ark/Toucan-1.5M, CIRCL/vulnerability-scores, common-pile/stackexchange_filtered, HuggingFaceFW/finepdfs, corbt/enron-emails, allenai/WildChat-4.8M y HuggingFaceFW/finewiki. No se usó texto en chino. El repositorio incluye `keep-prune.json` con el índice de origen y los hashes de las listas de supervivientes, y `SHA256SUMS` para verificar cada fichero.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base, con degradación variable según el dominio tras la poda.
- Generación de código en Python y Rust en contextos agénticos, aunque con la mayor pérdida de fidelidad respecto al profesor (top-1 agreement de 0,635 y 0,625 respectivamente).
- Uso de herramientas (tool calling): el dominio con mayor divergencia respecto al profesor (KL 2,807), lo que anticipa un comportamiento menos fiable en este terreno.
- Ejecución de comandos y terminal (bash): el dominio con mejor retención (top-1 agreement 0,882, KL 0,447).
- Generación de diffs de código: buena retención (top-1 agreement 0,889, KL 0,305).
- Networking y operaciones de red: retención razonable (top-1 agreement 0,820).
- Capacidad de visión: la ruta de visión está intacta en pesos, pero no fue calibrada ni evaluada; el autor la describe como no probada.
- Capacidades multilingües: no disponibles; la calibración fue solo en inglés y código, y se espera degradación notable en chino.

## Casos de uso

- Automatización de tareas de terminal y shell: el modelo conserva el 88,2 % de acuerdo top-1 en bash, por lo que puede emplearse en agentes que ejecutan comandos, interpretan salidas y encadenan pasos en entornos de CI/CD o administración de sistemas.
- Revisión y generación de diffs de código: con un acuerdo top-1 del 88,9 % en el dominio code-diffs, es adecuado para pipelines que proponen parches, resumen cambios o generan mensajes de commit a partir de un diff.
- Asistencia en tareas de networking: con retención del 82 % en el dominio de redes, puede usarse para generar configuraciones, diagnosticar errores de conectividad o redactar runbooks.
- Generación de código en Python y Rust con supervisión humana: la retención es menor (63,5 % y 62,5 %), por lo que encaja mejor en flujos con revisión y tests automáticos que en generación autónoma sin verificación.
- Prototipado y experimentación en investigación sobre poda de MoE: el checkpoint y sus estadísticas permiten reproducir y extender el análisis de REAP sobre un modelo de 355.500 millones de parámetros.
- Despliegue en entornos con restricciones de memoria: al reducir expertos por capa, el checkpoint ocupa 293,6 GB en FP4, lo que facilita su alojamiento frente al modelo completo, aunque sigue requiriendo hardware de gama alta.
- Procesamiento de correo y documentación empresarial: con retención moderada (top-1 agreement ~0,69 en business y business-email), puede usarse para clasificación, resumen o borradores con revisión posterior.

## Benchmarks y rendimiento

El autor publica una evaluación de fidelidad respecto al modelo profesor (el modelo completo con los expertos podados enmascarados en el router), no benchmarks estándar como MMLU o HumanEval. La tabla compara el modelo podado con el profesor mediante KL sobre los 2.048 logits principales, acuerdo top-1 y cambio de NLL del siguiente token de referencia.

| Dominio | Posiciones evaluadas | Acuerdo top-1 | KL(profesor ‖ podado) | Cambio NLL (nats) |
|---|---:|---:|---:|---:|
| all | 437.350 | 0,720 | 1,349 | -0,131 |
| agentic-python | 63.310 | 0,635 | 2,055 | -0,799 |
| agentic-rust | 49.149 | 0,625 | 2,055 | -0,640 |
| bash | 50.094 | 0,882 | 0,447 | -0,140 |
| business | 32.823 | 0,693 | 0,747 | +0,535 |
| business-email | 15.382 | 0,696 | 1,011 | +0,602 |
| code-diffs | 64.558 | 0,889 | 0,305 | +0,232 |
| cyber | 30.806 | 0,658 | 1,615 | +1,532 |
| english-chat | 15.439 | 0,632 | 0,962 | +0,460 |
| english-prose | 18.873 | 0,757 | 0,968 | +0,719 |
| networking | 32.674 | 0,820 | 0,411 | +0,319 |
| tool-use | 64.242 | 0,587 | 2,807 | -1,378 |

Comparación entre variantes de poda evaluadas en la misma ejecución:

| Variante | Expertos conservados | Acuerdo top-1 | KL | Cambio NLL |
|---|---:|---:|---:|---:|
| REAP-33 (no publicada) | 256 / 384 | 0,842 | 0,511 | +0,025 |
| REAP-50 | 192 / 384 | 0,803 | 0,810 | -0,138 |
| REAP-67 (no publicada) | 128 / 384 | 0,755 | 1,114 | -0,109 |
| REAP-75 | 96 / 384 | 0,720 | 1,349 | -0,131 |

El autor advierte que estos números provienen de enmascarar expertos en el router dentro del modelo completo. El checkpoint exportado se ejecutó después de forma independiente sobre 5 sesiones de evaluación (1.329 posiciones) en CPU, con sustitutos de dequantize-then-matmul para los kernels FP8/FP4, y coincidió con las cifras enmascaradas: KL 1,378 frente a 1,385, cambio NLL -0,244 frente a -0,225, acuerdo top-1 0,676 frente a 0,672. Esa comprobación es scoring teacher-forced; la generación libre no se ha probado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 293,6 GB en FP4, por lo que la inferencia requiere al menos ese orden de magnitud de memoria, distribuida entre varias GPU.
- GPU recomendadas: no especificadas por el autor. Por tamaño, un despliegue realista requiere múltiples aceleradores de gama alta (A100, H100 o equivalentes) con agregación de memoria; no cabe en una sola GPU de consumo.
- GPU de consumo: no cabe en ninguna GPU de consumo actual por el tamaño del checkpoint.
- Opciones de despliegue: transformers con el código de referencia incluido en `inference/`; el autor menciona kernels FP8/FP4. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La única medición publicada es una ejecución en CPU sobre 1.329 posiciones con sustitutos de kernels, sin cifras de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Expertos por capa | Contexto | Licencia | Estado |
|---|---|---:|---|---|---|
| DeepSeek-V4.1-Flash-REAP-75 | 355.459.961.554 | 96 / 384 | no disponible | MIT | Publicado |
| DeepSeek-V4.1-Flash-REAP-50 | no disponible | 192 / 384 | no disponible | MIT | Publicado |
| DeepSeek-V4.1-Flash-1017 (base) | no disponible | 384 / 384 | no disponible | MIT | Publicado |
| REAP-67 | no disponible | 128 / 384 | no disponible | no disponible | No publicado |
| REAP-33 | no disponible | 256 / 384 | no disponible | no disponible | No publicado |

La comparación con modelos de otras familias (por ejemplo, otros MoE de escala similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Sin ajuste fino posterior a la poda: se espera mayor degradación en dominios fuera de la mezcla de calibración (solo inglés y código).
- Degradación esperada en chino, ya que no se usó texto en chino en la calibración.
- El dominio de tool-use es el más afectado (KL 2,807, acuerdo top-1 0,587), lo que compromete su fiabilidad en flujos agénticos.
- Los cambios negativos de NLL en dominios agénticos y de tool-use no indican mejora del modelo: reflejan un mejor ajuste a trazas de referencia escritas por otros modelos mientras se aleja de la distribución del profesor.
- La ruta de visión está intacta en pesos pero no fue calibrada ni evaluada; su comportamiento es desconocido.
- La evaluación principal se hizo enmascarando expertos en el router del modelo completo; la verificación del checkpoint exportado cubre solo 1.329 posiciones en CPU con sustitutos de kernels y sin generación libre.
- Riesgo de alucinación: no cuantificado en la información disponible, pero previsible en dominios poco representados en la calibración.
- Sesgos: no documentados por el autor.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías y el modelo no está afiliado ni respaldado por DeepSeek.
- Longitud de contexto no publicada: conviene verificarla en `config.json` antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jackmaxwil/DeepSeek-V4.1-Flash-REAP-75
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Variante hermana REAP-50: https://huggingface.co/jackmaxwil/DeepSeek-V4.1-Flash-REAP-50
- Estadísticas de calibración y evaluación: https://huggingface.co/datasets/jackmaxwil/DeepSeek-V4.1-Flash-REAP-stats
- Paper de REAP: https://arxiv.org/abs/2510.13999
