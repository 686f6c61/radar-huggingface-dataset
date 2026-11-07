# appliedCL/interseek-35m

## Resumen

InterSeek 35M es un modelo especializado en la predicción de interacciones proteína-proteína (PPI) a partir de las secuencias de aminoácidos de dos proteínas. Lo desarrolla appliedCL, un colectivo de investigación en machine learning aplicado, y se publica bajo licencia MIT. El modelo parte del backbone ESM-2 de 35M parámetros de Meta (`facebook/esm2_t12_35M_UR50D`) y añade una cabeza de interacción sobre el token `[CLS]`, afinando las 12 capas del encoder para la tarea de clasificación binaria de pares proteicos.

La relevancia del modelo está en su tamaño reducido: con 33,5 millones de parámetros totales y un repositorio de 0,3 GB, ofrece un predictor de pares completo que puede ejecutarse en CPU, GPU o Apple Silicon, lo que lo hace accesible para laboratorios con recursos limitados. El autor declara resultados en dos conjuntos de test independientes (humano y levadura) con un checkpoint fijado por validación y un umbral preestablecido, lo que aporta trazabilidad metodológica.

Esta release corresponde a un experimento completado de una sola semilla, seleccionado en la actualización 18.000 de un entrenamiento de tres épocas y 30.600 actualizaciones. Es independiente de la ejecución en curso con el modelo de 650M. El modelo no es un transformer de propósito general: es un predictor de pares que requiere la implementación incluida en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder ESM-2 (12 capas) con cabeza de interacción CLS |
| Parametros totales | 33.518.687 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 1.024 tokens por par (secuencias A y B concatenadas con `[CLS]` y `[EOS]`) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/AWQ publicadas) |
| Idiomas soportados | no aplica (modelo biológico sobre secuencias de aminoácidos) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, `interaction_head.safetensors`, subcarpeta `esm2/`) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder basado en ESM-2 de 35M parámetros (12 capas). Los pares de proteínas se tokenizan conjuntamente como `[CLS] A [EOS] B [EOS]`, con un máximo de 1.024 tokens y dos vistas de ventana de secuencia por par. Los logits de cada vista se agregan mediante log-mean-exp, y en inferencia se promedian los logits de los dos órdenes de proteína antes de aplicar la sigmoide. Se afinan las 12 capas del encoder y una cabeza de interacción sobre el token `[CLS]`.

El entrenamiento combina entropía cruzada binaria con modelado de lenguaje enmascarado (MLM) ponderado por 0,1, enmascarando el 15% de los residuos elegibles. Se usó AdamW con weight decay 0,01, learning rate de 2e-5 para el encoder y 1e-4 para la cabeza, 100 actualizaciones de warm-up y batch efectivo de 16 pares. La ejecución empleó semilla 17, BF16, una RTX 4090, PyTorch 2.8.0+cu128 y Transformers 5.12.1. El checkpoint se seleccionó por AUROC de validación en la actualización 18.000 de un total de 30.600 (tres épocas). El umbral de decisión (0,48556941747665405) se fijó con MCC de validación humana antes de los dos tests finales.

## Capacidades

- Predicción binaria de interacción entre dos proteínas a partir de sus secuencias de aminoácidos.
- Puntuación continua entre 0 y 1 por par, con umbral fijado en 0,4856.
- Procesamiento de pares con hasta 1.024 tokens combinados.
- Agregación robusta de vistas mediante log-mean-exp y promedio de órdenes de proteína.
- Backbone ESM-2 estándar accesible por separado para masked language modelling (`EsmForMaskedLM`).
- Ejecución en CPU, CUDA y Apple Silicon (MPS).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo biológico de tarea única.

## Casos de uso

- Filtrado previo de pares candidatos en estudios de interactómica: el modelo puntúa pares de proteínas a gran escala antes de validaciones experimentales costosas, reduciendo el espacio de búsqueda.
- Priorización de interacciones en datos de proteómica: dado un conjunto de proteínas de interés, se generan todos los pares y se ordenan por score para seleccionar candidatos a validar con co-inmunoprecipitación o yeast two-hybrid.
- Análisis de redes de interacción en levadura: el modelo muestra AUROC de 0,7207 en el test de *S. cerevisiae* de D-SCRIPT, útil para estudios comparativos en organismos modelo.
- Enriquecimiento de pipelines bioinformáticos existentes: al ejecutarse en CPU, puede integrarse como paso de scoring en flujos de análisis que no dispongan de GPU.
- Docencia y prototipado en bioinformática: su tamaño (0,3 GB) y licencia MIT permiten desplegarlo en entornos docentes y reproducir el flujo de inferencia con `predict.py`.
- Investigación en representaciones proteicas: el backbone ESM-2 afinado puede reutilizarse como extractor de características para tareas relacionadas, aunque la cabeza de interacción es específica.
- Evaluación metodológica de splits y umbrales: el repositorio incluye `evaluation.json`, historial de validación y huellas de los splits, útil para reproducir y auditar protocolos de evaluación PPI.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), con checkpoint y umbral fijados antes de los tests finales:

| Test | AUROC | Average precision | MCC | Precision | Recall |
|---|---:|---:|---:|---:|---:|
| Humano (Bernett HIPPIE Intra2) | 0,6800 | 0,6700 | 0,2487 | 0,6091 | 0,6882 |
| Levadura (D-SCRIPT *S. cerevisiae*) | 0,7207 | 0,2269 | 0,1792 | 0,1441 | 0,7674 |

Datos de entrenamiento y evaluación:

| Rol | Partición publicada | Pares | Prevalencia positiva |
|---|---|---:|---:|
| Entrenamiento | HIPPIE Intra1 | 163.192 | 50% |
| Validación | HIPPIE Intra0 | 59.260 | 50% |
| Test final humano | HIPPIE Intra2 | 52.048 | 50% |
| Test final levadura | D-SCRIPT *S. cerevisiae* | 55.000 | 9,09% |

No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 33,5M de parámetros; en la práctica, unos pocos cientos de MB más el overhead de activaciones con contexto de 1.024 tokens.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el autor entrenó en una RTX 4090, pero la inferencia es viable en GPUs mucho menores.
- Cabe en GPU de consumo: sí, en cualquier RTX/GTX moderna e incluso en iGPU o CPU.
- Despliegue: el repositorio incluye la wheel `interseek-0.3.0` y `predict.py` con soporte para `--device cpu`, `cuda:0` y `mps`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo generativo de texto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| InterSeek 35M | 33,5M | 1.024 tokens por par | PPI binaria | MIT | Hugging Face |
| ESM-2 35M (`facebook/esm2_t12_35M_UR50D`) | 35M | 1.024 tokens | MLM de proteínas (no PPI directa) | MIT | Hugging Face |
| D-SCRIPT | no disponible | no disponible | PPI | no disponible | Repositorio académico |
| InterSeek 650M (en curso) | no disponible | no disponible | PPI | no disponible | No publicado |

La comparación con D-SCRIPT es pertinente porque el test de levadura procede de su conjunto de evaluación, pero no se dispone de sus métricas en la información proporcionada para una comparación numérica directa.

## Limitaciones y advertencias

- Una predicción no establece unión física ni causalidad; los scores no están calibrados como probabilidades de binding.
- Los resultados provienen de una sola semilla y no demuestran superioridad sobre otros métodos.
- El umbral 0,4856 se fijó con validación humana; su aplicación a otros organismos o distribuciones puede degradar precision y recall (en levadura, precision 0,1441 con prevalencia del 9,09%).
- El modelo raíz no es un modelo estándar de Transformers: requiere la implementación de par incluida en el repositorio; el backbone `esm2/` por sí solo no produce scores de interacción.
- No se ha realizado una auditoría global de homología all-against-all ni de exposición del pretraining de ESM en esta release.
- Limitado a pares con hasta 1.024 tokens combinados; secuencias más largas requieren truncamiento o estrategias externas.
- Licencia MIT permite uso comercial, pero el autor restringe el uso previsto a investigación, ranking de candidatos y experimentos de seguimiento.
- No incluye los datos ni los checkpoints del optimizador, solo el modelo de inferencia y artefactos de evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/appliedCL/interseek-35m
- Modelo base ESM-2 35M: https://huggingface.co/facebook/esm2_t12_35M_UR50D
- Sitio de appliedCL: https://appliedcl.com/
- Bernett et al. (split gold-standard): https://doi.org/10.1093/bib/bbae076
- Versión corregida Figshare v4: https://doi.org/10.6084/m9.figshare.21591618.v4
- D-SCRIPT (paper): https://doi.org/10.1016/j.cels.2021.08.010
