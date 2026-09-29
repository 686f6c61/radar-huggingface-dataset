# lucasfrag/fact-checking-abstention-saes

## Resumen

Fact-Checking Abstention SAEs es un conjunto de autoencoders dispersos (sparse autoencoders, SAE) de tipo TopK entrenados sobre el flujo residual de modelos de lenguaje instruidos mientras estos leen indicaciones de verificación de hechos (afirmación + evidencia + instrucciones). No es un modelo generativo: es una herramienta de interpretabilidad mecanicista diseñada para estudiar cómo un LLM decide abstenerse, es decir, responder "NOT ENOUGH EVIDENCE" en lugar de emitir un veredicto.

La motivación es técnica y concreta: los SAE genéricos no reconstruyen bien la posición en la que el modelo toma la decisión de veredicto, porque esa activación queda fuera de su distribución de entrenamiento. Estos SAE se entrenan sobre la propia distribución de la tarea, de modo que la posición de decisión queda dentro de distribución. El entrenamiento sigue la receta de Gao et al. (2024).

Publicado en septiembre de 2026 y distribuido a través de la librería `sae_lens`, el repositorio ocupa 1,1 GB e incluye, por ahora, un único SAE completo: el de `meta-llama/Llama-3.1-8B-Instruct` en la capa 15, con 32.768 latentes, k = 32, dos latentes muertas y una latente de abstención identificada (la 19219). Los SAE para `deepseek-ai/DeepSeek-R1-Distill-Llama-8B` (capa 15) y `Qwen/Qwen3-8B` (capa 19) figuran como "in progress". El trabajo forma parte de una disertación de máster (PPGCC/PUCRS) sobre verificación automática de hechos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder disperso TopK (TopK SAE) sobre el flujo residual; se aplica en `blocks.15.hook_resid_post` |
| Parámetros totales | no aplicable como tal: 32.768 latentes (d_sae) con vector de entrada de 4.096 dimensiones |
| Parámetros activos | no aplica (no es un modelo MoE); la dispersión es TopK con k = 32 latentes activos por activación |
| Longitud de contexto | no aplicable: el SAE opera sobre la activación de una única posición, no sobre secuencias |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no declarado; los corpus de entrenamiento (VitaminC y FEVER) son en inglés |
| Licencia | other; el SAE de Llama-3.1 se distribuye bajo la Llama 3.1 Community License ("Built with Llama") y los datos acompañantes bajo CC BY-SA 3.0 |
| Formato de pesos | no declarado; la carga se realiza con `sae_lens.SAE.load_from_disk` sobre los ficheros del repositorio (1,1 GB) |
| Modelo base (SAE completo) | meta-llama/Llama-3.1-8B-Instruct |
| Capa y punto de extracción | Capa 15, `hook_resid_post`, vector de 4.096 dimensiones |
| Modelos base en progreso | deepseek-ai/DeepSeek-R1-Distill-Llama-8B (capa 15); Qwen/Qwen3-8B (capa 19) |
| Tamaño del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

El componente publicado es un autoencoder disperso TopK que proyecta el flujo residual de la capa 15 (`blocks.15.hook_resid_post`, 4.096 dimensiones) a un espacio latente de 32.768 unidades, del que solo se mantienen activas las k = 32 de mayor magnitud. El SAE completo de Llama-3.1-8B-Instruct registra únicamente 2 latentes muertas sobre 32.768, lo que indica un uso muy alto del diccionario. Como SAE de dominio, no se aplica al modelo completo: reconstruye una posición concreta, la de emisión del veredicto, y el autor identifica la latente 19219 como la asociada a la abstención.

El entrenamiento sigue la metodología de Gao et al. (2024), *Scaling and Evaluating Sparse Autoencoders*, sobre indicaciones de verificación de hechos compuestas por afirmación, evidencia e instrucciones. Las afirmaciones ordenadas y las activaciones de la posición de decisión se publican en el dataset complementario `lucasfrag/fact-checking-abstention-saes-data`. Las fuentes de datos son VitaminC (Schuster et al., 2021) y FEVER (Thorne et al., 2018), ambas en inglés y bajo licencia CC BY-SA 3.0. No se documentan en la información disponible fases de RLHF, DPO ni decodificación especulativa, algo esperable al no tratarse de un modelo generativo.

## Capacidades

- Codificación de activaciones: transforma vectores del flujo residual (`hook_resid_post` de la capa 15) en representaciones latentes dispersas mediante `sae.encode(resid)`.
- Identificación de rasgos: la latente 19219 se señala como la asociada a la decisión de abstención ("NOT ENOUGH EVIDENCE").
- Reconstrucción en distribución de la tarea: al entrenarse sobre la distribución de verificación de hechos, la posición de decisión queda dentro de distribución, a diferencia de los SAE genéricos.
- Análisis de decisión de veredicto: permite estudiar el punto de la red donde el modelo opta por abstenerse frente a emitir un veredicto.
- Uso como instrumento de interpretabilidad mecanicista, no como generador de texto: no produce respuestas, no razona de forma autónoma y no ejecuta tool calling ni function calling.
- Sin capacidades multimodales (visión, audio), sin modo de razonamiento explícito y sin capacidades multilingües documentadas.
- Aplicabilidad limitada al modelo base y capa para los que fue entrenado; el diccionario no es intercambiable entre modelos.

## Casos de uso

- Auditoría de calibración en sistemas de fact-checking: codificar la activación de la posición de veredicto y medir la magnitud de la latente 19219 para cuantificar la propensión del modelo a abstenerse antes de publicar una respuesta.
- Monitorización de abstención en producción: en un pipeline de verificación automática con Llama-3.1-8B-Instruct, inspeccionar la latente de abstención como señal de alerta cuando el modelo duda, y derivar la respuesta a revisión humana.
- Mitigación de alucinaciones: usar la señal de abstención para distinguir entre respuestas fundamentadas y respuestas inventadas, ya que la evidencia empírica (Ferrando et al., 2025) vincula la conciencia del conocimiento con las alucinaciones.
- Intervención sobre el espacio latente: aplicar técnicas de steering sobre la dirección de la latente 19219 para aumentar o reducir la tasa de abstención y estudiar el efecto sobre la precisión del veredicto.
- Investigación en interpretabilidad mecanicista: comparar la reconstrucción de estos SAE de dominio con la de SAE genéricos entrenados fuera de la distribución de la tarea, cuantificando la diferencia en la posición de decisión.
- Detección temprana del "no lo sé" en pipelines RAG: emplear la señal latente como criterio para decidir si recuperar más evidencia o responder que no hay información suficiente.
- Reproducibilidad académica y docencia: el repositorio incluye el dataset de activaciones en la posición de decisión, lo que permite reproducir el análisis sin reentrenar el SAE.
- Estudio comparativo entre familias de modelos: cuando se completen los SAE de DeepSeek-R1-Distill-Llama-8B (capa 15) y Qwen3-8B (capa 19), será posible contrastar si la latente de abstención es específica de Llama o un rasgo compartido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la tarjeta de cada SAE para la configuración y las métricas completas, pero estos datos no se incluyen en la información proporcionada.

A modo de referencia, las únicas cifras de configuración publicadas son las siguientes (no son métricas de rendimiento):

| Métrica de configuración | Valor |
|---|---|
| Dimensiones de entrada | 4.096 (`hook_resid_post`, capa 15) |
| d_sae | 32.768 |
| k (latentes activos) | 32 |
| Latentes muertas | 2 |
| Latente de abstención | 19219 |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |

## Requisitos de hardware

- El SAE en sí es pequeño: el repositorio completo ocupa 1,1 GB, de modo que los pesos del autoencoder caben en cualquier GPU con más de 2 GB de VRAM libre, e incluso en CPU para inferencia puntual.
- El cuello de botella no es el SAE, sino el modelo base: para obtener la activación `blocks.15.hook_resid_post` hay que ejecutar Llama-3.1-8B-Instruct. Como estimación estándar para un modelo de 8.000 millones de parámetros, en fp16 requiere aproximadamente 16 GB de VRAM, en 8 bits unos 9 GB y en 4 bits entre 5 y 6 GB. Estas cifras son estimaciones derivadas del tamaño del modelo base, no datos publicados en la model card.
- GPU recomendadas: una RTX 4090 (24 GB) permite ejecutar el modelo base en fp16 y el SAE en la misma máquina; GPUs de 12-16 GB requieren cuantización del modelo base; A100 y H100 son adecuadas para extracción de activaciones por lotes sobre corpus grandes.
- Cabe en GPU de consumo: sí, el SAE con cualquier GPU, y el modelo base completo en una RTX 4090 o similar; en GPUs de 12 GB o menos, únicamente con cuantización.
- Opciones de despliegue: `sae_lens` para cargar el SAE, PyTorch para la inferencia y un framework que exponga el hook del flujo residual (la nomenclatura `blocks.15.hook_resid_post` corresponde a TransformerLens). vLLM, llama.cpp, Ollama y TGI pueden servir el modelo base, pero no exponen de forma directa el hook residual que el SAE necesita, por lo que no sustituyen al stack de extracción.
- Latencia y rendimiento: no disponible. No se publican medidas de throughput ni de latencia de codificación.

## Comparativa con modelos similares

| Alternativa | Tipo | Modelo base | Capa | d_sae / k | Estado | Licencia |
|---|---|---|---|---|---|---|
| Este repositorio (SAE de abstención) | SAE TopK de dominio, fact-checking | Llama-3.1-8B-Instruct | 15 | 32.768 / 32 | Completo | Llama 3.1 Community License; datos CC BY-SA 3.0 |
| SAE genéricos off-the-shelf para Llama-3.1-8B | SAE TopK o ReLU, uso general | Llama-3.1-8B-Instruct | Varias | no disponible | Publicados por terceros | Según el autor correspondiente |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B (SAE de abstención) | SAE TopK de dominio, fact-checking | DeepSeek-R1-Distill-Llama-8B | 15 | no disponible | En progreso | No disponible |
| Qwen/Qwen3-8B (SAE de abstención) | SAE TopK de dominio, fact-checking | Qwen3-8B | 19 | no disponible | En progreso | No disponible |

La diferencia principal frente a los SAE genéricos es la distribución de entrenamiento: los genéricos no reconstruyen bien la posición de decisión del veredicto porque queda fuera de su dominio. No se dispone de cifras comparativas de reconstrucción que cuantifiquen esa diferencia en la información proporcionada.

## Limitaciones y advertencias

- Solo está disponible un SAE completo (Llama-3.1-8B-Instruct, capa 15). Los de DeepSeek-R1-Distill-Llama-8B y Qwen3-8B aparecen como "in progress" y no tienen carpeta ni configuración publicada.
- No es un modelo autónomo: no genera texto, no responde preguntas y no puede usarse como sustituto de un sistema de fact-checking sin combinarlo con el modelo base y con lógica externa.
- Específico de dominio: se entrenó sobre indicaciones de verificación de hechos; su comportamiento fuera de esa distribución no está caracterizado.
- Cobertura lingüística limitada en origen: los corpus de entrenamiento (VitaminC y FEVER) son en inglés, por lo que la interpretación de la latente de abstención en otros idiomas no está validada.
- Sin métricas de reconstrucción publicadas en esta información: no se puede evaluar cuantitativamente la calidad del SAE a partir de lo disponible; la model card remite a tarjetas individuales que no se incluyen.
- Identificación correlacional: que la latente 19219 se asocie a la abstención no implica relación causal. Confirmarlo requiere experimentos de intervención que no se documentan aquí.
- Licencia restrictiva para uso comercial: el SAE de Llama-3.1 se rige por la Llama 3.1 Community License ("Built with Llama"), que impone condiciones adicionales y obligaciones de atribución; los datos acompañantes están bajo CC BY-SA 3.0, con obligación de compartir igual.
- Madurez limitada: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (2026-09-28), sin revisión por pares y con la información de cita aún pendiente de añadir.
- Procedencia académica: forma parte de una disertación de máster (PPGCC/PUCRS), lo que implica que no ha pasado por un proceso de validación externa.
- Sin datos de sesgo, robustez adversarial ni estabilidad numérica del SAE.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lucasfrag/fact-checking-abstention-saes
- Dataset complementario (afirmaciones ordenadas y activaciones de la posición de decisión): https://huggingface.co/datasets/lucasfrag/fact-checking-abstention-saes-data
- Gao, L., et al. (2024), *Scaling and Evaluating Sparse Autoencoders*: https://arxiv.org/abs/2406.04093
- Schuster, T., et al. (2021), *Get Your Vitamin C! Robust Fact Verification with Contrastive Evidence* (NAACL): https://arxiv.org/abs/2103.08541
- Thorne, J., et al. (2018), *FEVER: a Large-scale Dataset for Fact Extraction and VERification* (NAACL): https://arxiv.org/abs/1803.05355
- Ferrando, J., et al. (2025), *Do I Know This Entity? Knowledge Awareness and Hallucinations in Language Models* (ICLR): https://arxiv.org/abs/2411.14257
- Librería `sae_lens`, utilizada para cargar los SAE (`SAE.load_from_disk`): https://github.com/decoderesearch/SAELens
- Modelo base del SAE completo: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
