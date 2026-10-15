# qing-yao/ppt-pythia-160m-c4-equal-budget-continuous-seed324

## Resumen

`ppt-pythia-160m-c4-equal-budget-continuous-seed324` es un artefacto de investigación publicado por el usuario de HuggingFace `qing-yao`: una reproducción desde cero (sin cargar pesos preentrenados) de la arquitectura Pythia-160M, entrenada únicamente sobre el subconjunto en inglés de C4. Forma parte de un experimento controlado de presupuesto igualado ("equal-budget") cuyo objetivo es comparar dos estrategias de entrenamiento que consumen exactamente los mismos ejemplos en el mismo orden: una rama continua, con una única planificación de learning rate, y una rama en dos etapas que reinicia los embeddings de entrada/salida, el optimizador y la planificación tras la actualización 500. Este repositorio corresponde a la rama continua con semilla 324.

El modelo tiene 162.322.944 parámetros y una ventana de 2.048 tokens, con un vocabulario de 50.304 entradas. El entrenamiento comprende 10.500 actualizaciones del optimizador con 32 secuencias de 2.048 tokens por actualización, lo que equivale a unos 688 millones de tokens, aproximadamente 4,24 tokens por parámetro. La pérdida final en FP32 sobre las primeras 512 secuencias de validación de C4 es 3,723919.

Su relevancia es metodológica, no de rendimiento: es un objeto reproducible y barato de reentrenar para estudiar dinámicas de entrenamiento, reinicios de optimizador y planificaciones de learning rate con presupuesto fijo. No se ha publicado licencia y no está pensado para uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only GPT-NeoX (configuración Pythia-160M) |
| Capas / dimensión oculta / cabezas | 12 / 768 / 12 (dimensión por cabeza: 64) |
| FFN | 3.072 de dimensión intermedia |
| Parámetros totales | 162.322.944 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (longitud de secuencia usada en el entrenamiento) |
| Vocabulario | 50.304 tokens (tokenizer fijado e incluido en el repositorio) |
| Tipos de cuantización | no disponible (solo se publican pesos en FP32; no hay versiones cuantizadas oficiales) |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible (no se ha publicado ninguna licencia) |
| Formato de pesos | safetensors (`checkpoint-010500-continuous/model`, FP32) |
| Tamaño del repositorio | 2,9 GB (incluye 3 checkpoints con estado de optimizador/RNG) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia GPT-NeoX, idéntica a la de Pythia-160M: 12 capas, 768 de dimensión oculta, 12 cabezas de atención, FFN de 3.072 y vocabulario de 50.304. Los embeddings de entrada y salida no están atados: solo ellos suman 2 × 50.304 × 768 = 77.266.944 parámetros, el 47,6 % del total. La cuenta de parámetros cuadra exactamente con la configuración estándar de Pythia-160M (incluidas las biases de atención y MLP), lo que confirma que no se modificó la topología. Se entrenó desde cero, sin cargar ningún peso preentrenado.

El entrenamiento usa el subconjunto en inglés de C4 con 10.500 actualizaciones totales del optimizador y un lote de 32 secuencias de 2.048 tokens por actualización (688.128.000 tokens por rama). Ambas ramas del experimento consumen los mismos ejemplos ordenados y el mismo vocabulario. No se menciona ningún ajuste posterior por RLHF, DPO o instrucciones: es un modelo base puro. El repositorio conserva 3 checkpoints locales con pesos, estado del optimizador/RNG y recibos de checksum, además del manifiesto hasheado del dataset (los datos en bruto no se suben) y `run.json` con la receta completa. Los checkpoints intermedios descartados durante el entrenamiento no están disponibles. El autor advierte que las curvas de pérdida se calcularon con precisión y enmascaramiento distintos, por lo que deben compararse solo métricas equivalentes.

## Capacidades

- Generación de texto autocompletado en inglés: continuación de secuencias, muestreo y generación condicionada por prompt.
- Modelo base sin ajuste instructivo: no sigue instrucciones, no mantiene formato de chat ni responde a preguntas de forma fiable.
- Soporte de tool calling / function calling: no disponible, no se documenta ninguna capacidad de este tipo.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; el modelo está entrenado solo con C4 en inglés.
- Capacidades especiales (modo thinking, visión, audio, decodificación especulativa): no disponibles.
- Análisis de dinámica de entrenamiento: al incluir estado de optimizador y recibos de checksum, permite reproducir y auditar la curva de pérdida del experimento.
- Inferencia muy económica: 162 M de parámetros permiten ejecución en CPU y en GPU de gama baja.

## Casos de uso

- Estudio de planificaciones de learning rate y reinicios de optimizador: comparar la rama continua de este repositorio con la rama en dos etapas (que reinicia embeddings, optimizador y planificación tras la actualización 500) usando los mismos ejemplos ordenados y el mismo presupuesto de tokens.
- Reproducibilidad de recetas de entrenamiento: el repositorio incluye `run.json` con la receta completa, 3 checkpoints con estado de optimizador/RNG y recibos de checksum, lo que permite verificar que un reentrenamiento produce la misma pérdida.
- Baseline barato en experimentos de ablación: con 162 M de parámetros y 688 M tokens de entrenamiento, es un punto de comparación de coste bajo para aislar el efecto de una única variable (semilla, tokenizer, orden de datos) antes de escalar.
- Docencia y formación en NLP: permite mostrar de principio a fin el ciclo completo de entrenamiento de un transformer pequeño, la lectura de curvas de pérdida y el análisis de un checkpoint con estado de optimizador.
- Prototipado de infraestructura de despliegue: usar el modelo como carga de prueba diminuta para validar pipelines de servicio (transformers, TGI, vLLM, endpoints compatibles) antes de mover modelos grandes.
- Análisis del tokenizador sobre C4: el tokenizer está fijado a 50.304 entradas e incluido en el repositorio, lo que permite estudiar la tokenización de texto web en inglés y su efecto sobre la pérdida.
- Investigación sobre sesgos de corpus: al entrenarse solo con C4, es un caso de estudio controlado de cómo un corpus web filtrado moldea las continuaciones generadas, con la ventaja de que su tamaño permite reentrenamientos repetidos.
- Validación de protocolos de evaluación: el autor publica seis endpoints y comparaciones emparejadas en `reports/`, útiles para discutir cómo la precisión y el enmascaramiento de la pérdida alteran las conclusiones.

## Benchmarks y rendimiento

| Métrica | Valor | Detalle |
|---|---|---|
| Pérdida C4 (FP32) | 3,723919 | Primeras 512 secuencias de validación de C4, checkpoint final |
| MMLU, HumanEval, GSM8K, etc. | no disponible | No se han publicado resultados en la información disponible |

No se han publicado resultados de benchmarks estandarizados en la información disponible. El único dato cuantitativo de calidad es la pérdida final de validación en C4 (3,723919), que no es directamente comparable con métricas publicadas sobre otros corpus. El repositorio incluye en `reports/` las comparaciones emparejadas entre los seis endpoints del experimento.

## Requisitos de hardware

- Pesos en FP32: 162.322.944 × 4 bytes ≈ 649 MB.
- Pesos en FP16/BF16: ≈ 325 MB; en int8 ≈ 162 MB; en int4 ≈ 81 MB.
- Caché KV a 2.048 tokens en FP16: 12 capas × 2 × 768 × 2.048 × 2 bytes ≈ 75,5 MB.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPU con 4 GB de VRAM y en CPU (inferencia viable en x86 con AVX2).
- GPU recomendadas para entrenamiento o ajuste fino completo: no disponible; por tamaño, cualquier GPU con ≥8 GB permite ajuste fino con precisión mixta y optimizador de 32 bits.
- Cómputo de entrenamiento del checkpoint publicado: aproximadamente 6 × 1,623 × 10^8 × 6,881 × 10^8 ≈ 6,7 × 10^17 FLOPs.
- Opciones de despliegue: `transformers` (AutoModelForCausalLM) de forma nativa; el repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con TGI y con Inference Endpoints. Para llama.cpp u Ollama sería necesaria una conversión a GGUF y una cuantización propias, no publicadas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de su documentación pública, no de la información proporcionada para este repositorio.

| Modelo | Parámetros | Tokens de entrenamiento | Contexto | Licencia | Corpus |
|---|---|---|---|---|---|
| ppt-pythia-160m-c4-equal-budget-continuous-seed324 | 162,3 M | ≈688 M | 2.048 | no disponible | C4 (inglés) |
| Pythia-160M (EleutherAI) | 162,3 M | ≈300.000 M | 2.048 | Apache-2.0 | The Pile |
| OPT-125M (Meta) | 125 M | ≈180.000 M | 2.048 | licencia OPT (uso no comercial) | mezcla propia |
| GPT-2 small (OpenAI) | 124 M | no publicado oficialmente | 1.024 | MIT modificada | WebText |

La diferencia clave frente a las tres alternativas no es la arquitectura, sino el presupuesto de datos: este modelo ha visto unas 435 veces menos tokens que Pythia-160M, lo que se traduce en una pérdida de validación muy superior y en una calidad de generación claramente inferior. Su valor está en el control experimental (mismos ejemplos ordenados entre ramas, checkpoints con estado de optimizador), no en la comparación de rendimiento.

## Limitaciones y advertencias

- Sin licencia publicada: en ausencia de licencia, no se concede ningún derecho de uso; el uso comercial no está autorizado de forma explícita y la situación jurídica es incierta.
- Modelo base sin ajuste instructivo: no sigue instrucciones, no soporta diálogo multi-turno y no debe exponerse directamente a usuarios finales.
- Infraentrenado: 688 M tokens para 162 M parámetros equivalen a 4,24 tokens por parámetro, muy lejos de las ratios habituales (entre 20 y 100 tokens por parámetro en modelos comparables).
- Riesgo elevado de alucinación y de texto incoherente: la pérdida de validación en C4 es 3,723919, indicativa de un ajuste pobre al corpus.
- Idioma único: solo inglés; cualquier uso en castellano u otros idiomas queda fuera de su distribución de entrenamiento.
- Ventana de contexto corta: 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Sesgos heredados de C4: corpus de texto web filtrado, con los sesgos de género, raza, religión y nacionalidad documentados en este tipo de fuentes.
- Comparaciones de pérdida no equivalentes: el propio autor advierte que las curvas usan precisión y enmascaramiento distintos, por lo que mezclar métricas de endpoints diferentes invalida las conclusiones.
- Reproducibilidad parcial del dataset: los datos de entrenamiento no se publican, solo su manifiesto hasheado y los registros de preparación.
- Checkpoints intermedios descartados no disponibles, lo que limita el análisis de trayectorias de entrenamiento más allá de los 3 retenidos.
- Validación comunitaria nula: 0 descargas y 0 "likes" en el momento de la consulta; no hay evaluaciones independientes.
- Artefacto de investigación: no apto para producción, atención al cliente, generación de código ni cualquier tarea que requiera fiabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qing-yao/ppt-pythia-160m-c4-equal-budget-continuous-seed324
- Informes del experimento: carpeta `reports/` del repositorio (seis endpoints y comparaciones emparejadas)
- Receta completa de entrenamiento: archivo `run.json` del repositorio
- Tokenizer fijado: incluido en el repositorio
- Paper, blog o repositorio adicionales: no disponible en la información proporcionada
