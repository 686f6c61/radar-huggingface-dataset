# mvdelibas/mars-surface-change-hirise-yolo11s-cls

## Resumen
El modelo `mars-surface-change-hirise-yolo11s-cls` es un clasificador de imágenes binario que determina si se ha producido un cambio en la superficie de Marte a partir de pares de imágenes HiRISE tomadas antes y después de una región concreta. Lo desarrolla el usuario de Hugging Face `mvdelibas` como una adaptación de la arquitectura YOLO11s-cls de Ultralytics, afinada sobre la tarea de clasificación de cambios del conjunto de datos Mars-Bench. El modelo resuelve un problema clásico de teledetección planetaria: la detección automática de cambios morfológicos (nuevos cráteres, deslizamientos, cambios en dunas o en depósitos de hielo) sobre la superficie marciana.

La entrada del modelo no es una imagen simple, sino una imagen compuesta generada a partir del par antes/después: canal rojo para la imagen "antes", canal verde para la "después" y canal azul para la diferencia absoluta entre ambas. Esta codificación visual permite a un clasificador de imagen estándar explotar la información temporal sin necesidad de una arquitectura siamesa explícita. La salida es una de dos clases, cuyos nombres internos están en turco: `degisti` (cambió) y `degismedi` (no cambió).

El modelo es relevante porque demuestra que arquitecturas ligeras de visión (YOLO11s-cls, con resolución de 224 píxeles) pueden aplicarse con precisión razonable a tareas científicas de detección de cambios planetarios, aunque con limitaciones importantes de recall en la clase minoritaria. Está pensado como herramienta de investigación, no como sistema operativo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO11s-cls (CNN de clasificación), resolución de entrada 224 px |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch `.pt`) |
| Idiomas soportados | en, tr (etiquetas de clase en turco; documentación en inglés y turco) |
| Licencia | AGPL-3.0 (pesos derivados de Ultralytics YOLO11); datos de entrenamiento CC BY 4.0 |
| Formato de pesos | PyTorch `.pt` (checkpoint Ultralytics), fichero `mars-yuzey-degisimi-yolo11s-cls.pt` |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura YOLO11s-cls de Ultralytics, una red neuronal convolucional diseñada para clasificación de imágenes con una resolución de entrada de 224 píxeles. Se parte de los pesos preentrenados oficiales de Ultralytics y se realiza un ajuste fino (fine-tuning) sobre el conjunto de datos Mars-Bench `mb-change_cls_hirise`. No se trata de una arquitectura siamesa ni de un transformer multimodal: la información temporal se inyecta en la fase de preprocesado mediante la imagen compuesta de tres canales (rojo = antes, verde = después, azul = diferencia absoluta).

Los datos de entrenamiento provienen de Mars-Bench (Zenodo 15494346, DOI 10.5281/zenodo.15494346), con licencia CC BY 4.0, e imágenes originales de NASA/JPL/University of Arizona (instrumento HiRISE). El conjunto está fuertemente desbalanceado: aproximadamente el 8 % de las muestras pertenecen a la clase `degisti` (cambió). Según la model card, el entrenamiento se detuvo de forma temprana, siendo la mejor época la primera, lo que sugiere una convergencia muy rápida y un posible sobreajuste o una señal de aprendizaje limitada. No se documentan detalles sobre número de tokens, composición exacta del dataset ni uso de RLHF/DPO (no aplicable en un clasificador de visión).

## Capacidades
- Clasificación binaria de cambios en la superficie de Marte a partir de imágenes compuestas antes/después de HiRISE.
- Detección de cambios morfológicos superficiales (nuevos cráteres, alteraciones en dunas, deslizamientos, cambios en depósitos).
- Entrada específica: imagen compuesta de tres canales (R = antes, G = después, B = diferencia absoluta); no acepta imágenes simples ni pares sin componer.
- Salida: probabilidades sobre dos clases (`degisti` / `degismedi`) mediante `result.probs`.
- Integración con el ecosistema Ultralytics (`YOLO(...).predict(...)`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades de lenguaje.
- No soporta visión general: solo funciona con el tipo de imagen para el que fue entrenado.
- Capacidades multilingües: no aplica (modelo no generativo); la documentación está en inglés y turco.

## Casos de uso
- Triaje automatizado de pares HiRISE en archivos planetarios: el modelo puede prefiltrar grandes volúmenes de pares antes/después y priorizar aquellos con alta probabilidad de cambio para revisión humana, reduciendo el coste de inspección manual.
- Investigación sobre dinámica superficial marciana: útil para estudios de erosión, formación de cráteres recientes o cambios estacionales en depósitos de hielo y dunas, siempre con validación humana posterior.
- Apoyo a la planificación de misiones: identificación preliminar de zonas con cambios recientes que puedan afectar a la seguridad de aterrizaje o a la selección de objetivos científicos.
- Docencia y divulgación en ciencias planetarias: ejemplo práctico de aplicación de visión por computador ligera a datos de teledetección planetaria.
- Benchmarking de modelos de clasificación de cambios: sirve como línea base reproducible sobre Mars-Bench para comparar arquitecturas siamesas o transformers de visión.
- Prototipado de pipelines de análisis planetario: integrable en flujos que descarguen pares HiRISE, generen la imagen compuesta y ejecuten la clasificación con Ultralytics.
- Filtrado previo en sistemas de alerta de cambios superficiales: dado su alto precision (98,6 % macro), puede usarse para confirmar candidatos con bajo riesgo de falsos positivos, aceptando la pérdida de recall.

## Benchmarks y rendimiento
Resultados publicados en la model card sobre el split de validación de Mars-Bench:

| Métrica (validación) | Valor |
|---|---|
| Top-1 accuracy | 97,3 % |
| Top-5 accuracy | 100,0 % |
| Macro F1 | 89,3 % |
| Macro precision | 98,6 % |
| Macro recall | 83,3 % |

Desglose por clase:

| Clase | Soporte | Precision | Recall | F1 |
|---|--:|--:|--:|--:|
| `degismedi` (no cambió) | 616 | 0,972 | 1,000 | 0,986 |
| `degisti` (cambió) | 54 | 1,000 | 0,667 | 0,800 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: muy baja; un modelo YOLO11s-cls a 224 px cabe holgadamente en GPUs consumer con 4-6 GB de VRAM (estimación basada en el tamaño de la familia YOLO11s-cls, no confirmada en la model card).
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM; RTX 3060/4060, RTX 4090, A100 o H100 son más que suficientes.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer reciente; también puede ejecutarse en CPU para inferencia puntual.
- Opciones de despliegue: Ultralytics (Python), exportación a ONNX, TensorRT, OpenVINO o TFLite mediante las utilidades de Ultralytics; no se documenta soporte nativo en vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo y la resolución de 224 px, se espera latencia de milisegundos por imagen en GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, podría compararse con clasificadores siameses entrenados sobre Mars-Bench o con otros fine-tunes de YOLO11-cls sobre tareas planetarias, pero no se han publicado resultados de benchmarks de dichos modelos en la información disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mars-surface-change-hirise-yolo11s-cls | no disponible | no aplica | Top-1 97,3 % (val Mars-Bench) | AGPL-3.0 | Hugging Face |
| Alternativas siamesas / otros fine-tunes | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Desbalance severo de clases: solo ~8 % de las muestras son `degisti`; el modelo tiene recall del 66,7 % en esa clase, por lo que pierde aproximadamente un tercio de los cambios reales.
- Entrenamiento detenido de forma temprana (mejor época = 1), lo que sugiere convergencia limitada y posible infraentrenamiento o sobreajuste.
- Validación sobre un conjunto pequeño (54 muestras de `degisti`), por lo que las métricas tienen alta varianza y deben interpretarse con cautela.
- El modelo solo es válido para el tipo exacto de imagen compuesta (R = antes, G = después, B = diferencia absoluta) y para datos HiRISE; con otras entradas la salida es esencialmente aleatoria.
- No generaliza a otros sensores, regiones o estilos de imagen sin revalidación; el propio autor advierte que el rendimiento real será inferior al de validación.
- Riesgo de falsos negativos: dado su alto precision y bajo recall, el modelo tiende a decir "no cambió" cuando hay incertidumbre.
- Uso previsto exclusivamente de investigación; no debe usarse como único criterio para cartografía científica ni para toma de decisiones operativas.
- Licencia AGPL-3.0: cualquier uso en red o distribución del modelo derivado obliga a liberar el código bajo la misma licencia; además, la licencia CC BY 4.0 de los datos exige mantener la atribución a Mars-Bench y a NASA/JPL/University of Arizona.
- Etiquetas de clase en turco (`degisti`, `degismedi`), lo que puede requerir mapeo en pipelines en otros idiomas.
- No se documentan sesgos específicos más allá del desbalance de clases, pero al estar entrenado sobre una región y sensor concretos, puede presentar sesgo geográfico y de condiciones de iluminación.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/mvdelibas/mars-surface-change-hirise-yolo11s-cls
- Dataset Mars-Bench en Zenodo: https://doi.org/10.5281/zenodo.15494346
- Ultralytics YOLO11 (documentación y pesos): https://docs.ultralytics.com/models/yolo11/
- Repositorio Ultralytics: https://github.com/ultralytics/ultralytics
- Referencia de la misión HiRISE (NASA/JPL/University of Arizona): https://www.uahirise.org/
- Cita: Purohit, M.; Gajera, B.; Malaviya, V.; Mehta, I.; Kasodekar, K.; Adler, J.; Lu, S.; Rebbapragada, U.; Kerner, H. Mars-Bench: mb-change_cls_hirise. Zenodo, 2025.
