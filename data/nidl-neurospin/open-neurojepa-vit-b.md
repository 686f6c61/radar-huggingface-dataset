# nidl-neurospin/open-neurojepa-vit-b

## Resumen

Open-NeuroJEPA ViT-B es un modelo fundacional auto-supervisado para resonancia magnética cerebral 3D, desarrollado por nidl-neurospin (equipo vinculado a NeuroSpin y al proyecto nidl). Se trata de un Vision Transformer 3D de tipo ViT-B con mezcla de expertos (MoE) en el codificador, preentrenado con el método NeuroJEPA (una variante de arquitectura predictiva conjunta, JEPA) sobre el dataset abierto OpenMind. El modelo no genera texto ni imágenes: es un extractor de características (`feature-extraction`) que produce representaciones de 768 dimensiones a partir de volúmenes de RM cerebral.

El problema que resuelve es la falta de modelos fundacionales abiertos y reproducibles para neuroimagen 3D. Sus datos, código, receta de entrenamiento y pesos son públicos, lo que permite reproducir el preentrenamiento, comparar nuevos métodos en igualdad de condiciones o reutilizar las representaciones para tareas posteriores (edad, diagnóstico, segmentación, etc.). El encoder tiene 124 M de parámetros y el estimador completo (encoders de contexto y objetivo más predictor) suma 269.607.552 parámetros.

Es relevante ahora porque el ecosistema de modelos fundacionales médicos abiertos en 3D es todavía escaso, y este modelo ofrece un punto de partida reproducible con licencia permisiva (CC-BY 4.0) sobre datos de 787 datasets de OpenNeuro. La entrada es un volumen preprocesado de forma 1 × 128 × 128 × 128 y la salida es un vector de 768 dimensiones por volumen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer 3D (ViT-B) con mezcla de expertos (MoE) en el codificador; estimador NeuroJEPA (encoder de contexto, encoder objetivo y predictor) |
| Parametros totales | 269.607.552 (estimador completo); encoder 124 M |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (entrada volumétrica fija de 1 × 128 × 128 × 128) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el modelo se distribuye en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de imagen médica, sin capacidades lingüísticas) |
| Licencia | CC-BY 4.0 |
| Formato de pesos | safetensors (librería nidl) |

## Arquitectura y entrenamiento

El modelo es un ViT 3D de tamaño base (ViT-B) con mezcla de expertos en el codificador (`VisionTransformer3DMoE`), que produce características de 768 dimensiones. Se preentrena con NeuroJEPA, una formulación de arquitectura predictiva conjunta (JEPA) que entrena un encoder de contexto y un encoder objetivo junto con un predictor para predecir representaciones latentes de vistas enmascaradas o aumentadas del volumen. Los pesos publicados incluyen los parámetros del estimador completo (encoders de contexto y objetivo y predictor), de modo que se puede continuar el preentrenamiento o hacer fine-tuning.

El preentrenamiento se realizó sobre el split de entrenamiento de OpenMind: 63.992 volúmenes cuasi-crudos T1w, T2w y FLAIR de 31.775 participantes procedentes de 787 datasets de OpenNeuro, con skull-stripping, corrección de sesgo y registro lineal a MNI152 a 1 mm. Se entrenó durante 100 épocas (999 pasos cada una) en una única GPU NVIDIA H100, con lotes de 64 imágenes y precisión `bf16-mixed`. Optimizador AdamW con learning rate 0.000525, weight decay 0.04, warmup lineal de 40 épocas desde 0.0001 y decaimiento coseno hasta 1e-06, con recorte de gradiente de 1. El preprocesado redimensiona el volumen de 182 × 218 × 182 a 121 × 145 × 121, recorta o rellena a 128³ y aplica normalización Z.

## Capacidades

- Extracción de características de volúmenes de RM cerebral 3D (T1w, T2w y FLAIR) en forma de vectores de 768 dimensiones.
- Aprendizaje auto-supervisado sin etiquetas: las representaciones sirven como entrada para modelos lineales o de regresión posteriores (por ejemplo, regresión ridge sobre características congeladas).
- Transferencia a tareas posteriores mediante fine-tuning del encoder o del estimador completo.
- Manejo de volúmenes cuasi-crudos preprocesados de forma estandarizada (skull-stripped, corregidos en sesgo y registrados a MNI152 a 1 mm).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión 2D, tool calling, agentes ni capacidades multilingües.
- No dispone de modo de razonamiento (thinking mode), audio ni otras modalidades.

## Casos de uso

- Predicción de edad cerebral: a partir de las características congeladas del modelo y una regresión ridge se estima la edad del sujeto; en OpenBHB se reporta un MAE de 4,26 años (R² 0,78), útil como referencia en estudios de envejecimiento.
- Clasificación de patologías neurológicas: extraer características de volúmenes de pacientes y entrenar clasificadores ligeros (regresión logística, SVM) para tareas como detección de Alzheimer o esclerosis múltiple, reduciendo la necesidad de grandes volúmenes etiquetados.
- Búsqueda y agrupamiento de estudios: usar los vectores de 768 dimensiones para agrupar o recuperar volúmenes similares en bases de datos de neuroimagen, facilitando la curación de cohortes.
- Preentrenamiento base para nuevos métodos: servir como línea base reproducible para comparar nuevas recetas auto-supervisadas en 3D bajo las mismas condiciones de datos y cómputo.
- Segmentación y detección con fine-tuning: adaptar el encoder a tareas densas (segmentación de estructuras, lesiones) añadiendo cabeceras y ajustando los pesos.
- Investigación en neuroimagen multimodal: combinar las características con datos clínicos o genéticos en modelos predictivos, aprovechando que el modelo procesa T1w, T2w y FLAIR de forma independiente.
- Reproducibilidad y auditoría: al ser datos, código y receta públicos, permite reproducir el preentrenamiento y auditar resultados en entornos académicos.

## Benchmarks y rendimiento

| Tarea | Dataset | Metrica | Resultado |
|---|---|---|---|
| Predicción de edad (regresión ridge sobre características congeladas) | OpenBHB test (757 participantes) | MAE | 4,26 años |
| Predicción de edad (regresión ridge sobre características congeladas) | OpenBHB test (757 participantes) | R² | 0,78 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 269,6 M de parámetros; en `bf16` los pesos ocupan aproximadamente 0,54 GB, y en `fp32` unos 1,08 GB. La memoria adicional depende del tamaño de lote y de las activaciones del ViT 3D sobre volúmenes de 128³, que son el factor dominante.
- GPU recomendadas: el preentrenamiento se hizo en una NVIDIA H100; para inferencia y extracción de características basta con GPUs de gama media-alta con suficiente memoria para el lote (por ejemplo, RTX 3090, RTX 4090, A100).
- Cabe en GPU de consumo: sí, en GPUs con al menos 8-16 GB de VRAM según el tamaño de lote, dado el reducido número de parámetros y el coste de las activaciones 3D.
- Opciones de despliegue: la librería oficial `nidl` (`pip install nidl[pretrained]`) con PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Open-NeuroJEPA ViT-B | 269,6 M (encoder 124 M) | Volumen 1 × 128 × 128 × 128 | MAE 4,26 años en OpenBHB (edad) | CC-BY 4.0 | Pesos en HuggingFace, código y receta públicos |
| Alternativas de modelos fundacionales 3D de RM | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de modelos comparables de la misma categoría (modelos fundacionales auto-supervisados para RM cerebral 3D) que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en RM cerebral 3D; no procesa texto, imágenes 2D, audio ni otras modalidades.
- Requiere un preprocesado estricto (skull-stripping, corrección de sesgo, registro lineal a MNI152 a 1 mm y normalización Z); volúmenes fuera de esa distribución pueden degradar las representaciones.
- Entrenado solo con T1w, T2w y FLAIR de OpenMind; puede generalizar mal a otras secuencias, protocolos o poblaciones poco representadas.
- Riesgo de sesgo de selección: los datos provienen de 787 datasets de OpenNeuro, con posible sobrerrepresentación de ciertas cohortes, edades o centros.
- Riesgo de alucinación no aplica en el sentido generativo, pero las representaciones pueden producir predicciones erróneas si se usan sin validación en tareas clínicas.
- Licencia CC-BY 4.0: permite uso comercial con atribución; las imágenes de OpenMind conservan las licencias de sus datasets de OpenNeuro, lo que puede imponer restricciones adicionales sobre los datos derivados.
- No es un dispositivo médico ni está validado para uso clínico; cualquier aplicación diagnóstica requiere validación regulatoria independiente.
- Sin datos publicados de cuantización ni de despliegue en entornos de producción de alto rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nidl-neurospin/open-neurojepa-vit-b
- Dataset OpenMind: https://huggingface.co/datasets/neurospin/openmind
- Receta de preentrenamiento: https://neurospin-deepinsight.github.io/nidl/auto_examples/plot_open_models_pretraining.html
- Documentación de nidl: https://neurospin-deepinsight.github.io/nidl
- Ejemplo sobre OpenBHB: https://neurospin-deepinsight.github.io/nidl/auto_examples/plot_pretrained_openbhb.html
- Repositorio nidl: https://github.com/neurospin-deepinsight/nidl
- Paper OpenMind (ICCV 2025): arXiv 2606.14957 (referencia en la cita del autor)
- Paper NeuroJEPA: arXiv 2606.14957
- Licencia CC-BY 4.0: https://creativecommons.org/licenses/by/4.0/
