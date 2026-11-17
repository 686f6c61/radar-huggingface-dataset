# appliedCL/interseek

## Resumen

InterSeek 35M B128-E10 es un modelo de predicción de interacciones proteína-proteína (PPI) desarrollado por appliedCL. Se trata de un ajuste fino (fine-tuning) completo del backbone ESM-2 de 35M de parámetros de Meta (facebook/esm2_t12_35M_UR50D), al que se añade una cabeza de interacción tipo CLS. El modelo recibe dos secuencias de aminoácidos y devuelve una puntuación entre 0 y 1 que estima la probabilidad de que ambas proteínas interactúen.

El modelo resuelve un problema clásico en biología computacional: la detección de interacciones físicas entre proteínas a partir únicamente de su secuencia primaria, sin necesidad de estructuras tridimensionales. Es relevante porque ofrece una alternativa ligera (33,5M de parámetros, repo de 0,3 GB) que puede ejecutarse en CPU o en GPU de consumo, lo que facilita su integración en pipelines de investigación y en tareas de priorización de candidatos experimentales.

Esta variante concreta (B128-E10) entrena con un batch efectivo de 128 pares durante 10 épocas, completando 12.750 actualizaciones el 17 de noviembre de 2026. Los pesos publicados corresponden al mejor checkpoint de validación (actualización 6.375, tras la época 5), no al checkpoint final. La licencia es MIT y los pesos se distribuyen en formato safetensors junto con un paquete de inferencia propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ESM-2) con cabeza de interacción CLS |
| Parametros totales | 33.518.687 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens por par (secuencias concatenadas `[CLS] A [EOS] B [EOS]`) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no aplica (secuencias de aminoácidos, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, `esm2/`, `interaction_head.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura parte del backbone ESM-2 de 35M de parámetros (12 capas, dimensión de embedding 480, aproximadamente 35M de parámetros), un transformer encoder preentrenado por Meta sobre secuencias de proteínas. Sobre él se añade una cabeza de interacción que produce logits a partir del token CLS. Ambas secuencias se tokenizan de forma conjunta como `[CLS] A [EOS] B [EOS]`, con hasta 1.024 tokens y dos vistas de ventana. La cabeza genera logits por vista que se agregan mediante log-mean-exp; en inferencia se promedian los logits de las dos órdenes de entrada antes de aplicar sigmoid, lo que garantiza una puntuación simétrica respecto al orden de las proteínas.

El entrenamiento utiliza 163.192 pares de proteínas humanas derivados de HIPPIE, según el split gold-standard Intra1 de Bernett (81.596 positivos y 81.596 negativos), con secuencias de la versión corregida de Figshare v4. La validación emplea 59.260 pares Intra0, también balanceados. La función de pérdida combina entropía cruzada binaria con predicción enmascarada de aminoácidos ponderada por 0,1 (probabilidad de máscara 0,15). Hiperparámetros: microbatch 4, acumulación 32 (batch efectivo 128), semilla 17, AdamW con learning rates 2e-5 (encoder) y 1e-4 (cabeza), weight decay 0,01 y 100 actualizaciones de warm-up. El entrenamiento se ejecutó en una NVIDIA H100 PCIe con BF16, PyTorch 2.8.0+cu128 y Transformers 5.12.1. La selección de checkpoint se basa en AUROC de validación y la del umbral en MCC de validación.

## Capacidades

- Predicción binaria de interacción proteína-proteína a partir de dos secuencias de aminoácidos.
- Puntuación simétrica: el resultado es invariante al orden de las dos proteínas de entrada.
- Salida de una puntuación continua entre 0 y 1 por par, con umbral de clasificación fijado en MCC de validación (0,6341).
- Procesamiento por lotes de pares mediante CSV de entrada (`sequence_a`, `sequence_b`, `pair_id` opcional).
- Ejecución en CPU, GPU NVIDIA (CUDA) y Apple Silicon (MPS).
- Backbone ESM-2 ajustado disponible por separado para tareas de masked language modeling (`EsmForMaskedLM`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales; es un modelo específico de dominio biológico.

## Casos de uso

- Priorización de candidatos en estudios de interactómica: dado un conjunto de pares proteína-proteína propuestos, el modelo puntúa cada par y permite ordenar candidatos para validación experimental, reduciendo el coste de ensayos de laboratorio.
- Filtrado previo en pipelines de biología estructural: antes de lanzar predicciones de estructura de complejos (por ejemplo, con AlphaFold-Multimer), se usa InterSeek para descartar pares con baja probabilidad de interacción y ahorrar cómputo.
- Análisis de redes de interacción en investigación biomédica: integración de las puntuaciones en la construcción de grafos de interactoma para identificar hubs y módulos funcionales.
- Búsqueda de dianas terapéuticas: evaluación de interacciones entre proteínas humanas y proteínas virales o de patógenos para identificar contactos relevantes en estudios de infectómica.
- Anotación funcional asistida: uso de las puntuaciones como señal complementaria en la asignación de función a proteínas poco caracterizadas, a partir de sus interacciones predichas con proteínas conocidas.
- Docencia y prototipado: al ejecutarse en CPU o en GPU de consumo, sirve para demostraciones y prototipos en entornos con recursos limitados, con un paquete de inferencia autocontenido.
- Reproducibilidad de experimentos: los ficheros `selection.json`, `validation-history.json` y `training-provenance.json` permiten auditar el proceso de entrenamiento y replicar la selección de checkpoint.

## Benchmarks y rendimiento

Resultados de validación publicados por el autor (conjunto Intra0, 59.260 pares):

| Checkpoint | Pares | AUROC | Average precision | MCC |
|---|---:|---:|---:|---:|
| Publicado: época 5, actualización 6.375 | 59.260 | 0,6543 | 0,6593 | 0,2262 |
| Final: época 10, actualización 12.750 | 59.260 | 0,6476 | 0,6542 | 0,2172 |

Comparación con la variante original B16-E3 (mismo split de desarrollo, una sola semilla):

| Modelo | AUROC de validación |
|---|---:|
| InterSeek 35M B16-E3 (original) | 0,6532 |
| InterSeek 35M B128-E10 (esta variante) | 0,6543 |

El autor advierte explícitamente que esta comparación cambia tamaño de batch y duración de entrenamiento con una sola semilla, por lo que no establece una mejora fiable de generalización. Los tests held-out sobre Intra2 humano (52.048 pares) y D-SCRIPT yeast (55.000 pares) no se han evaluado para esta variante. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 33,5M de parámetros en BF16/FP16 el modelo ocupa aproximadamente 67 MB de pesos, por lo que cabe holgadamente en cualquier GPU con al menos 1-2 GB de VRAM efectiva.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (el autor entrenó en H100 PCIe, pero la inferencia no requiere ese hardware); también funciona en Apple Silicon vía MPS.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en iGPU con suficiente memoria compartida.
- Ejecución en CPU: soportada explícitamente (`--device cpu`), viable para lotes moderados.
- Opciones de despliegue: el autor distribuye un paquete de inferencia propio (`interseek-0.3.0-py3-none-any.whl`) y un script `predict.py`; no se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| InterSeek 35M B128-E10 | 33,5M | 1.024 tokens/pair | PPI desde secuencia | MIT | Hugging Face (appliedCL) |
| InterSeek 35M B16-E3 | no disponible | no disponible | PPI desde secuencia | MIT | Hugging Face (appliedCL/interseek-35m) |
| D-SCRIPT | no disponible | no disponible | PPI desde secuencia | no disponible | Repo académico (referenciado como test held-out) |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada; el autor solo referencia D-SCRIPT yeast como conjunto de test held-out no evaluado para esta variante.

## Limitaciones y advertencias

- Las métricas publicadas son de validación de desarrollo (Intra0), usadas para seleccionar el checkpoint; no constituyen una evaluación independiente.
- Los tests held-out sobre Intra2 humano y D-SCRIPT yeast no se han ejecutado para esta variante; los resultados publicados del modelo original no son aplicables a estos pesos.
- Las puntuaciones no están calibradas como probabilidades de unión física; el umbral 0,6341 proviene de MCC de validación y no debe interpretarse como probabilidad.
- Una puntuación alta no establece unión física ni causalidad; se requiere validación experimental.
- Sesgos de dataset: los negativos son muestreados y el conjunto deriva de HIPPIE, con posibles sesgos de composición y cobertura.
- Posible exposición de ESM-2 a secuencias durante el preentrenamiento; el autor indica que no se ejecutó una auditoría nueva de homología ni de exposición al preentrenamiento.
- Ventana de secuencia acotada a 1.024 tokens, lo que limita proteínas largas o pares con secuencias extensas.
- El modelo no es un checkpoint estándar de Transformers para clasificación; requiere la implementación incluida (`model.safetensors` + paquete de inferencia). El backbone en `esm2/` por sí solo no produce puntuaciones de interacción.
- Comparación con la variante original basada en una sola semilla; se necesitan semillas adicionales, baselines emparejados y tests held-out para conclusions robustas.
- Licencia MIT, que permite uso comercial, pero el autor restringe el uso previsto a investigación, priorización de candidatos y seguimiento experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/appliedCL/interseek
- Variante original B16-E3: https://huggingface.co/appliedCL/interseek-35m
- Repositorio y reporte de experimento: https://github.com/appliedCL/interseek
- Backbone base ESM-2 35M: https://huggingface.co/facebook/esm2_t12_35M_UR50D
- Split gold-standard Intra1 (Bernett): https://doi.org/10.1093/bib/bbae076
- Secuencias corregidas (Figshare v4): https://doi.org/10.6084/m9.figshare.21591618.v4
