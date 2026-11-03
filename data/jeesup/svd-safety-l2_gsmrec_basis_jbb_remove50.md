# Jeesup/svd-safety-l2_gsmrec_basis_jbb_remove50

## Resumen

`Jeesup/svd-safety-l2_gsmrec_basis_jbb_remove50` es un artefacto de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` mediante compresión por descomposición en valores singulares (SVD) con la técnica de *Basis Sharing*, en la que se elimina aproximadamente el 50 % de los parámetros del modelo original. El resultado se calibra con una mezcla de WikiText-2 y respuestas dañinas de JBB (multiplicadas por 13) y posteriormente se recupera mediante un LoRA de recuperación entrenado sobre el conjunto de entrenamiento de GSM8K (7.473 problemas en formato Alpaca, con corte a 512 tokens y división de validación de 500), que se fusiona en los pesos finales.

El modelo no está pensado como asistente de propósito general: la propia model card lo describe como un artefacto de investigación del proyecto `svd_safety` (script `jobs/gsmrec_slurm.sh`). Algunas celdas están deliberadamente degradadas en seguridad o sobre-rechazan peticiones benignas, por lo que debe evaluarse antes de cualquier uso.

Su interés radica en que documenta de forma medible el compromiso entre compresión agresiva, alineación de seguridad y capacidad de razonamiento matemático, con métricas publicadas de perplejidad, tasa de éxito de ataques (ASR) y sobre-rechazo. El modelo conserva la arquitectura y el tokenizador de Llama 2, con 6.738.415.616 parámetros reales en safetensors y un repositorio de 13,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido mediante SVD con Basis Sharing |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 2, no confirmada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License (incluye LICENSE.txt y USE_POLICY.md) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama-2-7b-chat, un transformer decoder-only con atención causal estándar. Sobre esa base se aplica una compresión por SVD con *Basis Sharing* que elimina en torno al 50 % de los parámetros. La calibración para la compresión utiliza una combinación de WikiText-2 y respuestas dañinas de JBB repetidas 13 veces (configuración W+JBB), con semilla 42. Posteriormente se entrena un LoRA de recuperación sobre el split de entrenamiento de GSM8K (7.473 problemas, formato Alpaca, corte a 512 tokens, 500 ejemplos reservados para validación) en lugar de alpaca-cleaned, y dicho LoRA se fusiona en los pesos.

La innovación principal no es arquitectónica sino metodológica: el uso de datos de calibración que mezclan corpus genérico con respuestas dañinas busca preservar (o modular) el comportamiento de seguridad tras la compresión, mientras que el LoRA de recuperación sobre GSM8K intenta restaurar capacidad de razonamiento matemático. No se especifican en la información disponible detalles sobre el número total de tokens de entrenamiento del LoRA, la composición exacta del dataset de calibración más allá de lo indicado, ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto conversacional, heredada de Llama-2-7b-chat y del pipeline `text-generation`.
- Razonamiento matemático básico: se ha entrenado un LoRA de recuperación específicamente sobre GSM8K, aunque los resultados medidos son bajos (5,38 % estricto y 7,73 % flexible en 5-shot con plantilla de chat).
- Seguimiento de instrucciones: se reporta IFEval prompt-level strict de 9,06 %, lo que indica una capacidad limitada en esta dimensión.
- Comportamiento de seguridad modulado: AdvBench ASR de 0,19 % y StrongREJECT ASR de 0,00 % según el juez HarmBench.
- Tendencia al sobre-rechazo: XSTest-safe over-refusal del 83,95 % (97,20 % puntuado) y OR-Bench-Hard-1k over-refusal del 99,23 % (98,94 % puntuado).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como referencia reproducible para estudiar cómo afecta la eliminación del 50 % de parámetros a la perplejidad (17,66 en WikiText-2) y a tareas zero-shot (media de 40,28 % en 7 tareas), permitiendo comparar variantes de calibración y recuperación.
- Estudio de alineación y seguridad tras compresión: las métricas de ASR en AdvBench y StrongREJECT permiten analizar si la compresión degrada o refuerza el rechazo de peticiones dañinas, y el sobre-rechazo en XSTest y OR-Bench cuantifica el coste en utilidad.
- Análisis de sobre-rechazo en asistentes: con un 83,95 % de sobre-rechazo en XSTest-safe, el modelo es útil como caso extremo para diseñar y validar clasificadores de rechazo o técnicas de calibración de umbrales.
- Evaluación de LoRA de recuperación sobre datos especializados: el pipeline GSM8K permite estudiar hasta qué punto un LoRA de recuperación fusionado compensa la pérdida de capacidad matemática tras la compresión, aunque los resultados medidos sean modestos.
- Reproducción de experimentos académicos: al estar vinculado al proyecto `svd_safety` y al script `jobs/gsmrec_slurm.sh`, facilita la replicación de experimentos de compresión SVD con distintas semillas y conjuntos de calibración.
- Docencia y formación en ingeniería de modelos: útil para ilustrar en cursos o talleres las compensaciones entre tamaño, seguridad, instrucciones y razonamiento, con cifras concretas y verificables.
- Pruebas de pipelines de inferencia con TGI: al estar etiquetado como `text-generation-inference` y `endpoints_compatible`, puede emplearse para validar despliegues de Hugging Face TGI con modelos comprimidos, siempre con fines de investigación.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| WikiText-2 PPL | 17,66 |
| Media zero-shot en 7 tareas | 40,28 % |
| AdvBench ASR (juez HarmBench) | 0,19 % |
| StrongREJECT ASR (juez HarmBench) | 0,00 % |
| XSTest-safe over-refusal (WildGuard) / puntuado | 83,95 % / 97,20 % |
| OR-Bench-Hard-1k over-refusal / puntuado | 99,23 % / 98,94 % |
| GSM8K 5-shot estricto / flexible (plantilla de chat) | 5,38 % / 7,73 % |
| IFEval prompt-level strict | 9,06 % |

No se han publicado en la información disponible resultados comparativos con otros modelos en estas mismas métricas, por lo que no se incluye una tabla comparativa de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 13,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 16-24 GB para comodidad.
- En cuantización de 8 bits: aproximadamente 7 GB de pesos; en 4 bits, alrededor de 3,5-4 GB, aunque el repositorio no distribuye versiones GGUF ni cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16 sin problemas; RTX 3090 (24 GB) también es viable.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con cuantización, en GPUs de 8-12 GB, si bien no se ofrecen pesos pre-cuantizados.
- Opciones de despliegue: transformers, Hugging Face TGI (etiqueta `text-generation-inference` y `endpoints_compatible`), y potencialmente llama.cpp u Ollama si se generan pesos GGUF a partir de los safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Jeesup/svd-safety-l2_gsmrec_basis_jbb_remove50 | 6.738.415.616 | no disponible | Llama 2 Community | Compresión SVD al 50 %, calibración W+JBB, LoRA GSM8K fusionado; artefacto de investigación |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | no disponible en la información | Llama 2 Community | Modelo base sin comprimir; referencia directa para medir el impacto de la compresión |
| meta-llama/Llama-3.1-8B-Instruct | no disponible en la información | no disponible en la información | Llama 3.1 Community | Alternativa contemporánea de tamaño similar, sin compresión; no se dispone de métricas comparables en esta ficha |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y naturaleza del artefacto.

## Limitaciones y advertencias

- Artefacto de investigación: la model card advierte explícitamente que no es un asistente de propósito general.
- Celdas deliberadamente degradadas en seguridad o con sobre-rechazo: los porcentajes de over-refusal (83,95 % en XSTest-safe y 99,23 % en OR-Bench-Hard-1k) indican que rechazará muchas peticiones benignas.
- Capacidad matemática muy limitada tras la recuperación: GSM8K 5-shot estricto de 5,38 % y flexible de 7,73 %, muy por debajo de lo esperable en un modelo de 7B sin comprimir.
- Seguimiento de instrucciones deficiente: IFEval prompt-level strict de 9,06 %.
- Riesgo de alucinación: no cuantificado en la información disponible, pero esperable en un modelo comprimido y con recuperación limitada.
- Sesgos conocidos: no documentados en la información proporcionada; hereda los sesgos de Llama-2-7b-chat y de los datos de calibración.
- Limitaciones de contexto e idioma: no disponibles; no se confirma la longitud de contexto efectiva tras la compresión.
- Restricciones de licencia: Llama 2 Community License, que impone condiciones de uso (incluida la política de uso aceptable en USE_POLICY.md) y obligaciones de atribución; revisar antes de cualquier uso comercial.
- Caveat para producción: no se recomienda su despliegue en producción sin una evaluación exhaustiva previa, dado su carácter experimental y sus métricas de instrucciones y matemáticas.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_gsmrec_basis_jbb_remove50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: incluida en el repositorio (LICENSE.txt y USE_POLICY.md)
- Proyecto `svd_safety` y script `jobs/gsmrec_slurm.sh`: referenciados en la model card, sin URL pública disponible en la información proporcionada
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada
