# ikimyaii/GatedDeltaNet-1.3B-semi-structured-ELSA-80pct

## Resumen

GatedDeltaNet-1.3B-semi-structured-ELSA-80pct es un punto de control experimental publicado por el usuario ikimyaii en HuggingFace, consistente en el modelo m-a-p/1.3B-100B-GatedDeltaNet-pure podado al 80 % de dispersión semi-estructurada mediante el método ELSA. No es un modelo entrenado desde cero ni afinado para una tarea concreta: es un artefacto de investigación pensado como línea base para comparar técnicas de poda sobre arquitecturas de atención lineal. Su interés radica en que permite estudiar cómo se degrada un modelo Gated DeltaNet de 1,47 mil millones de parámetros cuando se elimina el 80 % de los pesos de las capas lineales manteniendo un patrón por filas.

La arquitectura de partida, Gated DeltaNet, es una capa de atención lineal presentada por NVIDIA en ICLR 2025 que combina la regla delta con compuertas, planteada como evolución de Mamba2. El modelo base fue entrenado con 100.000 millones de tokens según indica su denominación (1.3B-100B) y este derivado conserva sus pesos densos en embeddings y lm_head, podando únicamente las 240 capas lineales. La poda se realizó con el código oficial de ELSA (arXiv:2510.01650) usando proyección por filas.

Es relevante ahora porque la comunidad investigadora en compresión de modelos necesita referencias reproducibles y con métricas publicadas para validar nuevas técnicas de sparsification. Este checkpoint incluye perplexity en WikiText-2 y C4, además de exactitud zero-shot en siete tareas de lm-evaluation-harness, lo que lo convierte en un baseline útil, aunque su calidad final está muy por debajo del modelo denso original y no se recomienda para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet (atención lineal con regla delta y compuertas), transformer híbrido recursivo |
| Parametros totales | 1.466.343.808 (aproximadamente 1,47 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE); con 80 % de dispersión quedan aproximadamente 293 millones de pesos no nulos en las capas podadas |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no se distribuyen cuantizaciones oficiales; el repositorio contiene pesos en precisión completa (el tamaño del repo, 5,9 GB, es coherente con almacenamiento en fp32) |
| Idiomas soportados | no disponible en la model card |
| Licencia | no disponible |
| Formato de pesos | safetensors (con los ceros almacenados explícitamente en las matrices podadas) |

## Arquitectura y entrenamiento

El modelo base es un Gated DeltaNet "pure", una arquitectura de atención lineal que sustituye la atención cuadrática por una recurrencia con estado matricial y regla delta, incorporando compuertas de decaimiento. La implementación de referencia es la publicada por NVlabs (ICLR 2025), descrita como una mejora de Mamba2 mediante la regla delta. El checkpoint base fue entrenado con 100.000 millones de tokens según el nombre del repositorio, y sobre él se aplicó un proceso de poda, no un reentrenamiento completo.

La poda se ejecutó con el código oficial de ELSA aplicando su proyección por filas (`--admm_comparison_group=row`) y los hiperparámetros que ELSA empleó para HGRN-1.3B al 80 %: learning rate 2e-4, lambda 1e-2, Adam con beta2 0.95, 4.096 pasos ADMM con un paso z cada 32 pasos, batch de 8 con acumulación 1x8, precisión bf16 y 32.768 secuencias de C4 de 2.048 tokens, semilla 0. El proceso completo requirió 7,7 horas en una única A100 de 40 GB. La dispersión medida es del 79,98 % y se verificó que cada una de las 240 capas lineales podadas mantiene exactamente el mismo número de pesos no nulos por fila (el 20 % superior). Embeddings y lm_head permanecen densos y los ceros se guardan físicamente en los tensores, por lo que el checkpoint no reduce el uso de memoria frente al modelo denso.

## Capacidades

- Generación de texto autorregresiva, heredada del modelo base Gated DeltaNet, con calidad degradada por la poda.
- Razonamiento básico y respuesta a preguntas de opción múltiple, con exactitud media zero-shot de 0,4080 en las siete tareas evaluadas.
- Procesamiento de secuencias largas gracias a la naturaleza de atención lineal de la arquitectura, aunque la longitud de contexto efectiva no está documentada.
- No consta soporte verificado de tool calling ni de function calling en la información disponible.
- No consta soporte específico de agentes, razonamiento multi-paso ni modo de pensamiento extendido.
- Capacidades multimodales, de visión o de audio: no disponibles.
- Capacidades multilingües: no documentadas; el corpus de calibración de la poda es C4, predominantemente en inglés.

## Casos de uso

- Línea base para investigación en poda: sirve para comparar nuevas técnicas de sparsification contra un resultado publicado con hiperparámetros, semilla y métricas explícitas, ya que el autor documenta el protocolo completo de ELSA.
- Estudio de dispersión semi-estructurada por filas: el checkpoint permite verificar empíricamente el patrón de 20 % de pesos por fila en las 240 capas podadas, algo útil para validar herramientas de análisis de sparsity.
- Desarrollo y depuración de kernels dispersos: al almacenar los ceros en los tensores, el modelo se puede usar para comprobar si un kernel de multiplicación dispersa produce los mismos logits que la multiplicación densa equivalente.
- Experimentos de destilación o recuperación de calidad: permite medir cuánto se puede recuperar de un modelo dañado mediante fine-tuning ligero sobre un subconjunto de datos, comparando contra el denso de referencia.
- Evaluación de pipelines de medición de perplexity: el modelo incluye resultados reproducidos con dos pipelines distintos (ELSA y EHWS), útil para auditar diferencias metodológicas entre frameworks de evaluación.
- Docencia y divulgación técnica: ejemplo práctico y reproducible de cómo la poda agresiva al 80 % degrada la exactitud zero-shot de 0,5123 a 0,4080 en un modelo de 1,3 mil millones de parámetros.
- Pruebas de integración de `flash-linear-attention`: sirve para validar la instalación y la carga con `trust_remote_code` de modelos Gated DeltaNet en entornos de desarrollo.

## Benchmarks y rendimiento

Perplexity evaluada con el código de ELSA (WikiText-2 y C4, fp16), una única ejecución con semilla 0:

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 10,31 | 13,76 |
| EHWS row-wise 80 % | 22,03 | 22,25 |
| Este modelo (ELSA row-wise 80 %) | 26,19 | 26,24 |
| ELSA unstructured 80 % | 26,28 | 26,17 |

Reevaluación con el pipeline de EHWS sobre los mismos pesos: WikiText-2 26,20 y C4 26,23, coherente con la cifra anterior.

Exactitud zero-shot con lm-evaluation-harness (0-shot):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,3763 | 0,2184 |
| arc_easy | 0,7222 | 0,4962 |
| boolq | 0,6159 | 0,5875 |
| hellaswag | 0,4629 | 0,3233 |
| openbookqa | 0,2920 | 0,1860 |
| rte | 0,4982 | 0,5271 |
| winogrande | 0,6188 | 0,5178 |
| Media | 0,5123 | 0,4080 |

## Requisitos de hardware

- VRAM para inferencia: al almacenarse los ceros, el checkpoint ocupa lo mismo que el denso. En fp16 se necesitan aproximadamente 2,9 GB solo para pesos; en fp32, unos 5,9 GB. Añadiendo caché KV y estados recurrentes, un presupuesto de 6-8 GB en fp16 es suficiente para contexto moderado.
- GPU recomendadas: el autor ejecutó el proceso de poda (no la inferencia) en una A100 de 40 GB. Para inferencia basta una RTX 4090, una RTX 3090, una L40S o cualquier GPU con 12 GB o más; también es viable en A100/H100 para despliegues por lotes.
- Cabe en GPU de consumo: sí. Una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB pueden cargar el modelo en fp16 sin problemas.
- Opciones de despliegue: `transformers` con la librería `flash-linear-attention` instalada y `trust_remote_code=True`, tal como indica el autor. No consta soporte en vLLM, TGI, llama.cpp ni Ollama, y al no existir pesos GGUF no hay una ruta de cuantización preparada.
- Latencia y throughput: no disponibles. La arquitectura de atención lineal favorece el escalado con contextos largos, pero la poda no aporta aceleración sin kernels dispersos específicos, que no se incluyen.

## Comparativa con modelos similares

| Modelo | Parámetros | Dispersión | WikiText-2 | C4 | Media zero-shot | Licencia |
|---|---|---|---|---|---|---|
| Este modelo (ELSA row-wise) | 1,47 B | 80 % semi-estructurada | 26,19 | 26,24 | 0,4080 | no disponible |
| GatedDeltaNet-1.3B EHWS row-wise 80 % | 1,47 B | 80 % semi-estructurada | 22,03 | 22,25 | no disponible en la información | no disponible |
| GatedDeltaNet-1.3B ELSA unstructured 80 % | 1,47 B | 80 % no estructurada | 26,28 | 26,17 | no disponible en la información | no disponible |
| m-a-p/1.3B-100B-GatedDeltaNet-pure (denso) | 1,47 B | 0 % | 10,31 | 13,76 | 0,5123 | no disponible |

Dentro de la familia publicada por el mismo autor existen también variantes EHWS al 50 % y al 90 % con dos fases ADMM, pero no se dispone de sus métricas en la información consultada.

## Limitaciones y advertencias

- Degradación severa de calidad: la perplexity en WikiText-2 se multiplica por 2,5 (de 10,31 a 26,19) y la media zero-shot cae más de diez puntos porcentuales. No es adecuado para tareas de producción.
- La poda se evaluó con una sola semilla y una única ejecución; no hay intervalo de confianza ni variabilidad reportada.
- Los ceros se almacenan en los pesos, de modo que no hay ahorro de memoria ni de ancho de banda, y sin kernels dispersos no se obtiene aceleración real.
- Licencia no especificada: no se puede asumir uso comercial. Conviene contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue.
- Idiomas no documentados: el corpus de calibración (C4) es mayoritariamente inglés, por lo que el rendimiento en castellano es incierto y probablemente peor que en inglés.
- Riesgo elevado de alucinación y de generación incoherente por la pérdida de pesos en las capas lineales.
- Requiere `trust_remote_code=True` y la librería `flash-linear-attention`, lo que implica ejecutar código del repositorio y añade superficie de riesgo en entornos gestionados.
- Longitud de contexto no documentada: no se debe asumir ninguna ventana concreta sin medirla.
- No hay pipeline declarado ni evaluación de seguridad, sesgos o toxicidad en la información disponible.
- El modelo está pensado explícitamente como línea base para EHWS; no es un artefacto mantenido ni con garantías de soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-semi-structured-ELSA-80pct
- Modelo base denso: https://huggingface.co/m-a-p/1.3B-100B-GatedDeltaNet-pure
- Variante EHWS row-wise 80 %: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-semi-structured-EHWS-80pct
- Variante ELSA no estructurada 80 %: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-unstructured-ELSA-80pct
- Variante EHWS 50 %: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-semi-structured-EHWS-50pct
- Variante EHWS-ALPS fase 1 al 90 %: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-semi-structured-EHWS-ALPS_phase1-90pct
- Paper de ELSA: https://arxiv.org/abs/2510.01650
- Código de EHWS: https://github.com/KimiaGholami/EHWS/tree/main/semi-structured
- Implementación oficial de Gated DeltaNet (NVlabs): https://github.com/NVlabs/GatedDeltaNet
- Documentación de entrenamiento de Gated DeltaNet: https://deepwiki.com/NVlabs/GatedDeltaNet/6.2-training-a-model
- Nota de prensa sobre Gated DeltaNet-2: https://www.marktechpost.com/2026/05/24/nvidia-ai-releases-gated-deltanet-2-a-linear-attention-layer-that-decouples-erase-and-write-in-the-delta-rule/
