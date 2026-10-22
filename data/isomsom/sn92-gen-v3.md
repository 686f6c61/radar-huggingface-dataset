# isomsom/sn92-gen-v3

## Resumen

sn92-gen-v3 es un modelo de decisión (decision model) publicado por el usuario isomsom para la pista generalista de REAX (SN92), la infraestructura de evaluación del subnet SN92 de Bittensor, centrada en el benchmarking y el despliegue de modelos de decisión. No es un modelo conversacional al uso: está ajustado para responder a un prompt fijo definido por el validador y emitir una decisión mediante una lectura de letras A..Z con softmax a temperatura T=2. El repositorio contiene únicamente pesos, sin código, y el propio autor declara que es un fine-tune sobre Qwen/Qwen3.8-27B (commit 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0).

El modelo parte de un backbone denso de 26.085.330.160 parámetros (unos 26,1 mil millones, confirmados en los safetensors) y de una cadena de derivación poco habitual: Qwen3.8-27B, después el modelo de decisión en formato pplx vllm-sr/d3 (commit cf15549a78fc52598ddd1951f321c58372bbd64f), luego una reescritura al layout de lectura conjunta (decision_config v2) y finalmente un LoRA de rango 32 entrenado en modo conjunto con atención bidireccional completa, tal y como lo sirve el validador de REAX.

Su relevancia es acotada pero específica: documenta con detalle el linaje y las modificaciones conforme a la sección 4 de Apache-2.0, algo poco frecuente en fine-tunes derivados, y sirve como referencia para quien necesite reproducir o auditar un participante del circuito SN92. Con 0 descargas y 0 likes en el momento de la consulta, es un artefacto de competición más que un modelo de propósito general para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (derivado de Qwen/Qwen3.8-27B), con atención bidireccional completa en el modo conjunto de entrenamiento y cabeza de lectura de decisiones A..Z |
| Parámetros totales | 26.085.330.160 (26,1 B, dato de safetensors) |
| Parámetros activos | no disponible (no se indica que sea MoE; el autor no lo especifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no declarados en la model card ni en los tags) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 52,2 GB; sin código) |

## Arquitectura y entrenamiento

La base es Qwen/Qwen3.8-27B, un transformer denso de unos 26 B de parámetros. Sobre esa base, el autor aplica una cadena de tres transformaciones: (1) parte del modelo de decisión en formato pplx vllm-sr/d3, un derivado Apache-2.0 ya orientado a tareas de decisión; (2) reescribe la cabeza al layout de lectura conjunta definido como decision_config v2; y (3) entrena un LoRA de rango 32 en modo conjunto, con atención bidireccional completa, que es exactamente la configuración en la que el validador de REAX sirve el modelo. Posteriormente el adaptador se fusiona en el backbone y se reentrenan y reescalan las filas de lectura A..Z para la lectura fija con softmax a T=2.

El entrenamiento consta de dos etapas declaradas, ambas con learning rate 5e-5. La etapa 1 consume 0,5 épocas sobre filas públicas de entrenamiento de especialistas de SN92, splits TRAIN de benchmarks públicos e ítems propios. La etapa 2 continúa desde la etapa 1 durante 531 pasos de 32 filas, usando el conjunto público de especialistas, factory y dev de decisionmodels/sn92-specialists (CC-BY-4.0) más los mismos extras. No se especifican el número total de tokens, la composición porcentual del dataset, ni si hubo RLHF o DPO; tampoco se documentan innovaciones de decodificación (atención lineal, decodificación especulativa) más allá de la atención bidireccional en modo conjunto.

## Capacidades

- Clasificación y decisión sobre opciones múltiples: emite logits sobre las letras A..Z y se sirve con softmax a T=2, formato impuesto por el prompt fijo del validador.
- Evaluación en el circuito SN92/REAX: pensado para la pista generalista del subnet, incluyendo ítems de especialista, factory y dev.
- Razonamiento de opción única en modo conjunto con atención bidireccional completa, lo que permite que la representación de la pregunta y de las opciones se condicione mutuamente.
- Herencia del backbone Qwen3.8-27B: capacidad latente de generación de texto, código y matemáticas, aunque no es la interfaz para la que fue ajustado.
- Soporte de tool calling / function calling: no disponible (no declarado; el ajuste de decisión no lo contempla).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Capacidades especiales: modo de lectura de decisión con vocabulario restringido a 26 letras; sin visión, audio ni modo thinking documentados.

## Casos de uso

- Auditoría de participantes de SN92: cargar el modelo con el prompt fijo del validador y comprobar que la lectura A..Z y la temperatura T=2 reproducen las decisiones declaradas por el autor, útil para verificar envíos al subnet.
- Referencia de linaje para fine-tunes derivados: la model card documenta commits exactos (Qwen3.8-27B@1d4bf0f2, vllm-sr/d3@cf15549a) y etapas de entrenamiento, lo que sirve como plantilla de trazabilidad conforme a la sección 4 de Apache-2.0.
- Evaluación comparativa de modelos de decisión: al compartir formato de salida con otros participantes de la pista generalista, permite medir precisión por letra y calibración del softmax sobre los mismos ítems.
- Investigación sobre atención bidireccional en clasificación: el ajuste en modo conjunto con atención completa es un caso de estudio para comparar con cabezas causales estándar en tareas de elección múltiple.
- Base para experimentos de destilación: un backbone de 26 B ajustado a una tarea estrecha permite generar etiquetas y destilar a modelos menores para inferencia de bajo coste.
- Integración en pipelines de evaluación automática: como etapa de scoring dentro de un harness que formule preguntas de opción múltiple y lea la distribución sobre A..Z, siempre que se replique el prompt fijo.
- Reproducción de las etapas de entrenamiento: los hiperparámetros publicados (LoRA r32, lr 5e-5, 531 pasos × 32 filas en etapa 2) permiten intentar una réplica sobre el mismo subconjunto de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, exactitud por letra ni comparaciones numéricas con otros participantes de SN92; únicamente describe el procedimiento de entrenamiento y el formato de servicio.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: unos 52 GB solo para pesos (el repo ocupa 52,2 GB), más overhead de activaciones y KV cache; en la práctica, 60-80 GB por instancia.
- VRAM estimada en int8: del orden de 26-30 GB, viable en una A100 40 GB o en dos RTX 4090.
- VRAM estimada en int4: del orden de 14-16 GB, teóricamente cabe en una RTX 4090 24 GB, pero requeriría convertir los pesos a GPTQ/AWQ/GGUF, algo que el autor no publica.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para bf16 sin cuantizar; A100 40 GB o 2× RTX 4090 24 GB con cuantización.
- Consumer GPU: solo con cuantización agresiva y posible offload de capas; no hay checkpoints cuantizados oficiales.
- Opciones de despliegue: vLLM es la vía natural dada la procedencia del linaje (vllm-sr/d3) y el modo de servicio del validador; llama.cpp u Ollama exigirían conversión a GGUF no publicada. TGI no está validado para este layout.
- Latencia y throughput: no disponibles. El material de prensa de SN92 menciona hasta 4× más velocidad de inferencia en el motor REAX, pero es una cifra del motor y del subnet, no de este checkpoint concreto.
- Advertencia operativa: al ser un modelo de decisión con layout propio (decision_config v2) y sin código en el repositorio, un servidor estándar devolverá texto generado, no la lectura A..Z esperada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| isomsom/sn92-gen-v3 | 26,1 B | no disponible | Modelo de decisión (lectura A..Z, T=2) para SN92 generalista | Apache-2.0 | Pesos en HF, sin código |
| Qwen/Qwen3.8-27B | ~27 B (según denominación) | no disponible | LLM conversacional base | Apache-2.0 | Pesos en HF |
| vllm-sr/d3 | no disponible | no disponible | Modelo de decisión en formato pplx, ancestro directo | Apache-2.0 | Pesos en HF |
| decisionmodels/sn92-specialists | no disponible | no disponible | Conjunto de filas/especialistas SN92 usado en entrenamiento | CC-BY-4.0 | Datos en HF |

No se dispone de datos de rendimiento de ninguno de los comparables en la información proporcionada, por lo que la comparación se limita a linaje, licencia y formato de servicio.

## Limitaciones y advertencias

- No es un modelo de chat: la interfaz prevista es el prompt fijo del validador con lectura de letras A..Z y softmax a T=2; fuera de ese contrato la salida no es fiable ni está calibrada.
- El repositorio contiene solo pesos, sin código de inferencia, de modo que el layout decision_config v2 y el rescalado de las filas de lectura deben reimplementarse a partir de la descripción, con riesgo alto de desviación.
- No se declaran idiomas soportados; el comportamiento multilingüe es desconocido y no se ha evaluado.
- Longitud de contexto no documentada: no se puede garantizar el manejo de entradas largas ni planificar el KV cache con precisión.
- Sesgos: no documentados por el autor; al derivar de Qwen3.8-27B y de datos de especialistas de SN92, hereda los sesgos de ambos, sin análisis publicado.
- Riesgo de alucinación: relevante si se usa como generador de texto libre en lugar de como clasificador; el ajuste de decisión no entrena la veracidad factual.
- Datos de entrenamiento parcialmente opacos: se citan conjuntos públicos y "our own written items" sin detallar volumen, composición ni proceso de filtrado, lo que impide auditar contaminación de los splits TRAIN de benchmarks.
- Licencia Apache-2.0 permite uso comercial y modificaciones, pero se debe conservar el aviso de cambios de la sección 4 y no hay garantía ni soporte del autor.
- Señales de adopción nulas (0 descargas, 0 likes) y publicación muy reciente: no hay evidencia de terceros sobre estabilidad o reproducibilidad.
- Las cifras de "hasta 4× más rápido" del motor REAX provienen de material promocional del subnet, no de mediciones sobre este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/isomsom/sn92-gen-v3
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo ancestro vllm-sr/d3 (referencia de commit cf15549a78fc52598ddd1951f321c58372bbd64f): https://huggingface.co/vllm-sr/d3
- Datos de especialistas decisionmodels/sn92-specialists (CC-BY-4.0): https://huggingface.co/decisionmodels/sn92-specialists
- Perfil del autor en HuggingFace: https://huggingface.co/isomsom/models
- Organización en GitHub: https://github.com/sn92-ai
- Anuncio de SN92 en Bittensor: https://x.com/SubnetSummerTAO/status/2110416430839554177
