# altoslabs/scRM

## Resumen

scRM (S-96) es un modelo fundacional de célula única desarrollado por altoslabs que se entrena directamente sobre lecturas de secuenciación (reads) de scRNA-seq. A diferencia de los modelos habituales de expresión génica, su entrada es la secuencia cruda por par (cell barcode, UMI): no hay alineador, genoma de referencia, anotación génica ni matriz de conteos en la entrada. El embedding de célula se obtiene mediante una jerarquía de pools de atención sobre bytes, contigs, UMIs y ventanas.

El modelo es deliberadamente pequeño: 1.182.720 parámetros, con un tronco local de 4 capas y un tronco global de 6 capas, anchura 96 y 4 cabezas de atención. Se entrena como JEPA (Joint Embedding Predictive Architecture) sobre cuatro conjuntos públicos de ratón 10x 3′. Su relevancia radica en que evita por completo el pipeline clásico de alineamiento y cuantificación, lo que abre la puerta a representaciones de célula que conservan información a nivel de nucleótido.

Existen dos checkpoints: `scRM-S96`, el modelo reportado y evaluado zero-shot, y `scRM-S96-sc_mixology`, una variante entrenada sobre las células de ese dataset para la comparación de detección génica. Ambos comparten arquitectura y receta, y solo difieren en los datos leídos. La licencia es MIT y el pipeline declarado es feature-extraction.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con tronco local (4 capas) y global (6 capas), atención con RoPE, readout por pools de atención jerárquicos (bytes → contigs → UMIs → ventanas → célula) |
| Parámetros totales | 1.182.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.600 posiciones máximas (RoPE, theta = 10000) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo genómico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (103 tensores), `.pt` (state_dict), `.eval.pt` (state_dict + arch/readout/arch_sha), `.config.json` |

## Arquitectura y entrenamiento

La arquitectura combina un tronco local de 4 capas y un tronco global de 6 capas, ambos con anchura 96 y 4 cabezas de atención, embeddings posicionales rotatorios (RoPE) con theta = 10000 sobre un máximo de 1.600 posiciones y un proyector de anchura oculta 256 que proyecta a 96 dimensiones. El readout agrupa bytes en contigs, contigs en UMIs, UMIs en ventanas y dos vistas en una célula, cada pool implementado como masked seed-attention pool. La integridad arquitectónica se verifica mediante `arch_sha = 7c4e4ffc9d304902eaaaeacc4ebac858edb48d5f5078d7f7245d71e7f7359bba`, que bloquea checkpoints cuyos pesos y forma declarada no coinciden.

El entrenamiento sigue el paradigma JEPA. Los corpus de preentrenamiento son cuatro datasets públicos de ratón 10x 3′ (`mouse_brain_5k`, `neuron_1k_v3`, `neurons_5k`, `sod1_spinal_cord`), todos descargables sin registro y bajo CC BY 4.0. El modelo reportado ejecuta 8.947 pasos sobre 3.000 células de esos datasets, con semilla 20260903 y torch 2.11.0+cu128. No se documenta en la información disponible el uso de RLHF, DPO ni el número total de tokens de entrenamiento.

## Capacidades

- Extracción de embeddings de célula a partir de reads crudos de scRNA-seq, sin alineamiento ni matriz de conteos.
- Representación a nivel de nucleótido, que conserva contenido de secuencia más allá de la expresión génica.
- Agregación jerárquica de información: bytes, contigs, UMIs y ventanas hasta el embedding final de célula.
- Inferencia zero-shot sobre datos humanos y de mosca, según la evaluación reportada.
- Detección génica mediante la variante `scRM-S96-sc_mixology` en comparaciones específicas de ese dataset.
- No soporta tool calling, function calling, agentes, visión, audio ni capacidades multilingües: es un modelo genómico de feature extraction.

## Casos de uso

- Extracción de embeddings para análisis exploratorio de scRNA-seq: el modelo produce un vector de 96 dimensiones por célula directamente desde reads, lo que permite clustering y visualización sin ejecutar un pipeline de alineamiento.
- Preprocesamiento en pipelines de genómica de célula única: al eliminar el alineador y la anotación del lado de entrada, se reduce la dependencia de versiones de genoma de referencia y de herramientas externas.
- Detección génica específica de dataset: la variante `scRM-S96-sc_mixology` se emplea para comparaciones de detección génica sobre ese conjunto, sirviendo como brazo de control frente al modelo general.
- Investigación en representaciones libres de alineamiento: útil para estudiar qué información de la secuencia cruda retiene un modelo JEPA de este tamaño frente a enfoques basados en conteos.
- Evaluación zero-shot en especies no vistas: los resultados reportados sobre datos humanos y de mosca permiten usar el modelo como extractor en organismos no presentes en el preentrenamiento, con las cautelas del caso.
- Prototipado rápido en entornos con recursos limitados: con 1,18 M de parámetros, el modelo puede ejecutarse en CPU o en GPU consumer para experimentos de extracción de características a pequeña escala.
- Auditoría de gobernanza de datos: dado que las representaciones a nivel de read pueden portar variación germinal, el modelo sirve para estudiar flujos de datos genómicos y sus implicaciones de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona evaluación zero-shot sobre datos humanos y de mosca, y una comparación de detección génica sobre `sc_mixology`, pero no se incluyen cifras concretas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, del orden de decenas de MB para los pesos (1,18 M de parámetros en fp32 ≈ 4,7 MB), más el overhead de activaciones y del pipeline de lectura; no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada puede ejecutar el modelo.
- Cabe en GPU consumer: sí, con amplio margen, y también en CPU.
- Opciones de despliegue: la carga se realiza mediante `Checkpoint.load` del paquete `scrm_eval.embed` con `model_factory` de `scrm_model.evalio`, ejecutando con `PYTHONPATH=model:eval:target/py` desde el repositorio de código. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos fundacionales de célula única ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El modelo se entrena con solo 3.000 células y 8.947 pasos; la cobertura de datos es muy reducida y puede limitar la generalización.
- Las representaciones a nivel de read retienen contenido de nucleótidos y pueden portar variación germinal; deben gobernarse como datos de genotipo, no como matrices de expresión.
- La evaluación reportada es zero-shot sobre datos humanos y de mosca, sin que ninguno de los cuatro datasets de preentrenamiento aparezca en la evaluación; el alcance de la evidencia es acotado.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de representaciones poco informativas o sesgadas hacia los tejidos y protocolos de ratón usados en preentrenamiento.
- No hay soporte documentado de cuantización ni de despliegue en servidores de inferencia estándar.
- La licencia MIT permite uso comercial, pero las implicaciones sobre datos genómicos y privacidad deben evaluarse aparte.
- El modelo no procesa texto ni imágenes; cualquier uso fuera de genómica de célula única queda fuera de su alcance declarado.

## Enlaces

- Hugging Face: https://huggingface.co/altoslabs/scRM
- Preprint (bioRxiv): https://www.biorxiv.org/content/10.64898/2026.10.24.761590v1
- Código: https://github.com/altoslabs/scRM
