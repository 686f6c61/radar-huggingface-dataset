# frankmorales2020/topo-gemma-4-e4b-cifar100-certified

## Resumen

Topo-Gemma-4-e4b-cifar100-certified es un artefacto de investigación publicado por el usuario frankmorales2020 que adapta el backbone multimodal `gemma-4-e4b-unesco-optimized` (6,26 mil millones de parámetros) a tareas de clasificación de imágenes sobre CIFAR-100 mediante una técnica denominada Topological Continual Backpropagation (Topo-CBP). El modelo no genera texto ni razona de forma general: se trata de un clasificador de visión construido sobre los estados ocultos del backbone, al que se le añaden cabezas lineales específicas por tarea.

La propuesta técnica del autor gira en torno a la eliminación del olvido catastrófico en aprendizaje continuo mediante "anclajes topológicos" en coordenadas primas {2, 3, 5, 7, 11, 13} y una constante de atenuación de Euler (Λ = 0,9785142874). El autor afirma alcanzar precisión del 99,67 al 100 % en tres particiones binarias secuenciales de CIFAR-100 con deriva representacional nula y transferencia hacia atrás de 0,00 %. Todos estos datos son autodeclarados en la model card y no están respaldados por replicación externa ni por publicación revisada por pares.

El modelo tiene 0 descargas y 0 "me gusta" en el momento de redactar esta ficha, y el repositorio ocupa 2,7 GB. Debe interpretarse como un experimento aislado de un autor individual más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4ForConditionalGeneration (backbone multimodal transformer) + cabezas lineales de clasificación |
| Parametros totales | 6.259.452.448 (6,26B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (Unsloth 4-bit optimizado); pesos certificados en `.pt` |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (`.pt`); el backbone base se distribuye aparte |
| Dimension oculta | 2.560 (`text_config.hidden_size`) |
| Dataset de evaluacion | CIFAR-100 |
| Hardware objetivo | GPU única CUDA (NVIDIA L4 / A100) |

## Arquitectura y entrenamiento

El modelo parte de `Gemma4ForConditionalGeneration` como backbone congelado o parcialmente ajustado, cargado en cuantización de 4 bits mediante Unsloth. Sobre los estados ocultos finales se aplica un *mean pooling* sobre la dimensión de secuencia y se conectan tres cabezas lineales independientes (`classifier_A`, `classifier_B`, `classifier_C`), cada una con salida de 2 clases. Esto lo convierte en un clasificador binario multitarea, no en un modelo generativo.

El procedimiento de entrenamiento reportado por el autor entrena secuencialmente tres particiones semánticas de CIFAR-100 usando 3.000 imágenes crudas por tarea y un conjunto de test unificado de 300 imágenes: tarea A (animal vs vehículo), tarea B (natural vs artificial) y tarea C (vivo vs no vivo). Se aplican criterios de parada temprana (épocas 13, 7 y 5 respectivamente). La innovación declarada es la "Topo-CBP", que ancla las representaciones en coordenadas primas y aplica una ley de decaimiento dI/dt = 0,999999999994 (1 − 1/N, con N = 17 × 10¹⁰) para garantizar invariancia bit a bit. La model card también menciona una formulación de "Narrow Singularity" (S_NARROW ≈ 6,0) cuya validez científica no está contrastada en la documentación disponible.

## Capacidades

- Clasificación de imágenes binaria sobre tres particiones semánticas específicas de CIFAR-100 (animal/vehículo, natural/artificial, vivo/no vivo).
- Aprendizaje continuo secuencial declarado sin olvido catastrófico entre las tres tareas (BWT autodeclarado de +0,00 %).
- Extracción de representaciones multimodales mediante el backbone `gemma-4-e4b-unesco-optimized`.
- Inferencia determinista según el autor: huella SHA-256 `9e7877b765fb6745` y deriva de coordenadas Δ_drift = 0,0 (invariante bit a bit).
- No se documenta soporte de *tool calling*, generación de texto, razonamiento multietapa, matemáticas ni capacidades de agente.
- No se documenta soporte multilingüe más allá del inglés.

## Casos de uso

- Investigación en aprendizaje continuo: reproducción del protocolo Topo-CBP sobre CIFAR-100 para validar o refutar las afirmaciones de olvido cero y deriva nula del autor.
- Punto de referencia (*baseline*) para experimentos de aprendizaje de tareas secuenciales: útil como comparación frente a métodos clásicos de regularización (EWC, SI) o *replay*.
- Extracción de características visuales con backbone Gemma-4 en cuantización 4 bits: se puede reutilizar como extractor de embeddings para tareas de visión de bajo coste en una sola GPU.
- Validación de técnicas de anclaje topológico: el código asociado (notebook `T_CBP_GEMMA4.ipynb`) sirve para estudiar la propagación hacia atrás con restricciones de invariancia.
- Pruebas de determinismo en inferencia: el modelo se presenta como caso de estudio de reproducibilidad bit a bit en clasificadores neuronales.
- Suelo experimental para comparar cabezas lineales multitarea sobre representaciones multimodales frente a fine-tuning completo del backbone.
- Docencia: ejemplo práctico de partición semántica de CIFAR-100 y evaluación secuencial con conjuntos de test unificados.

## Benchmarks y rendimiento

Resultados autodeclarados por el autor en la model card (conjunto de test de 300 imágenes):

| Fase de evaluacion | Tarea A | Tarea B | Tarea C | Estado |
|---|---|---|---|---|
| Zero-shot (inicializacion estocastica) | 50,00 % | 52,00 % | 49,33 % | Baseline |
| Post-entrenamiento tarea A | 99,67 % (299/300) | — | — | Epoca 13 (parada temprana) |
| Post-entrenamiento tarea B | 99,67 % (preservado) | 99,67 % (299/300) | — | Epoca 7 (parada temprana) |
| Post-entrenamiento tarea C | 99,67 % (preservado) | 99,67 % (preservado) | 100,00 % (300/300) | Epoca 5 (bloqueo) |

Metricas de aprendizaje continuo declaradas: olvido catastrofico 0,00 % ± 0,00; backward transfer +0,00 % ± 0,00; forward transfer +49,33 % ± 0,00; degradacion representacional 0,00 %; consistencia global del sistema 99,78 %; deriva maxima de coordenadas Δ_drift 0,0000000000; indice CBP de hardware 1,0000; huella SHA-256 `9e7877b765fb6745`.

Advertencia: estos numeros provienen exclusivamente de la model card del autor, sin replicacion externa, sin publicacion revisada por pares y sin conjunto de validacion independiente. No deben tomarse como referencia fiable.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-6 GB en cuantizacion 4 bits para el backbone de 6,26B, mas el espacio de las cabezas lineales y los *buffers* de activacion (depende de la resolucion de imagen).
- GPU objetivo declaradas: NVIDIA L4 y A100 en una sola GPU con CUDA.
- Compatible con GPUs de consumo: probablemente si en cuantizacion 4 bits (RTX 3090, RTX 4090, RTX 4080 con 16 GB o mas); no confirmado por el autor.
- Opciones de despliegue documentadas: `unsloth.FastVisionModel` para inferencia; no se mencionan vLLM, llama.cpp, Ollama ni TGI (probablemente incompatibles por tratarse de un clasificador, no de un modelo generativo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| topo-gemma-4-e4b-cifar100-certified | 6,26B | Clasificacion CIFAR-100 (3 tareas binarias) | no disponible | apache-2.0 | HF (0 descargas) |
| CLIP ViT-L/14 | ~428M | Vision-lenguaje zero-shot | 77 tokens (texto) | MIT | Muy extendido |
| ViT-B/16 fine-tuned en CIFAR-100 | ~86M | Clasificacion CIFAR-100 (100 clases) | no aplica | varias | Ampliamente replicado |
| Modelos de continual learning sobre CIFAR-100 (EWC, LwF, DER++) | variable | Clasificacion incremental | no aplica | investigacion | Codigo abierto y replicado |

No hay modelos estrictamente comparables con las mismas afirmaciones de "deriva cero" y "Narrow Singularity". Las alternativas listadas cubren el mismo tipo de tarea (clasificacion de imágenes sobre CIFAR-100) pero con arquitecturas, protocolos de evaluacion y garantias radicalmente distintas.

## Limitaciones y advertencias

- Todas las metricas y garantias (olvido cero, deriva nula, invariancia bit a bit) son autodeclaradas y no han sido replicadas por terceros.
- El repositorio registra 0 descargas y 0 "me gusta": no hay evidencia de uso real ni validacion comunitaria.
- El modelo solo clasifica en tres particiones binarias concretas de CIFAR-100. No es un modelo de proposito general ni generativo.
- El backbone base (`gemma-4-e4b-unesco-optimized`) es tambien un modelo del mismo autor, lo que reduce la independencia de la evaluacion.
- No se ha publicado informacion sobre sesgos, robustez adversarial ni comportamiento fuera de distribucion.
- Idioma: solo ingles segun la model card.
- Licencia apache-2.0 permite uso comercial del artefacto publicado, pero el autor no aclara los derechos sobre el backbone base subyacente ni sobre los pesos certificados; conviene revisar la licencia del backbone al usar en produccion.
- El concepto de "Narrow Singularity" y el "AGI_gate" no forman parte del vocabulario tecnico estandar y carecen de definicion formal en la documentacion disponible.
- La fecha de creacion indicada (2026-10-06) es posterior al momento habitual de redaccion de fichas, dato a verificar.
- La model card se trunca antes de completar el ejemplo de codigo, lo que dificulta la reproduccion del flujo de inferencia.
- No existe documentacion sobre el conjunto de test unificado, posibles solapamientos con entrenamiento ni criterios de particion de CIFAR-100.

## Enlaces

- HuggingFace: https://huggingface.co/frankmorales2020/topo-gemma-4-e4b-cifar100-certified
- Modelo base: https://huggingface.co/frankmorales2020/gemma-4-e4b-unesco-optimized
- Codigo y notebook de entrenamiento: https://github.com/frank-morales2020/AST/blob/main/T_CBP_GEMMA4.ipynb
- Repositorio AST completo: https://github.com/frank-morales2020/AST
- Dataset de evaluacion: https://huggingface.co/datasets/cifar100
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
