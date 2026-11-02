# nidl-neurospin/yaware-densenet121-bhb10k

## Resumen

y-Aware DenseNet-121 (BHB-10K) es un modelo de visión 3D para neuroimagen estructural, desarrollado por el equipo NIDL (NeuroImaging Data science and Learning) de NeuroSpin. Se trata de una red DenseNet-121 tridimensional preentrenada mediante aprendizaje autosupervisado con la técnica y-Aware Contrastive Learning (y-Aware CL), usando la edad del sujeto como proxy continuo de la variable de interés. El modelo no es un modelo de lenguaje: procesa mapas de materia gris derivados de resonancias magnéticas cerebrales.

El problema que resuelve es la escasez de datos etiquetados en neuroimagen clínica y de investigación. En lugar de entrenar desde cero con miles de volúmenes anotados, el modelo ofrece una representación inicial que puede transferirse a tareas de clasificación o regresión (diagnóstico de Alzheimer, predicción de edad cerebral, fenotipado) con pocos datos etiquetados. El preentrenamiento se realizó sobre el dataset BHB-10K, un conjunto agregado de aproximadamente 10.000 volúmenes de RM cerebral.

Es relevante ahora porque el ecosistema `nidl` está estandarizando la distribución de pesos preentrenados para neuroimagen en formato safetensors, con API de carga integrada y preprocesado reproducible. El modelo pesa 11.912.640 parámetros (unos 11,9 millones), lo que lo hace ligero y desplegable en GPU de consumo, y sirve como referencia para pipelines de transfer learning en neuroimagen estructural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DenseNet-121 3D (red convolucional densa tridimensional) |
| Parametros totales | 11.912.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no aplica) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no aplica; entrada de imagen) |
| Licencia | other (ver repositorio fuente) |
| Formato de pesos | safetensors |
| Entrada | mapas de materia gris 3D preprocesados con CAT12 (VBM) |
| Dataset de preentrenamiento | BHB-10K |
| Libreria | nidl (`pip install nidl[pretrained]`) |
| Metodo de preentrenamiento | y-Aware Contrastive Learning (autosupervisado) |
| Variable proxy | edad del sujeto |

## Arquitectura y entrenamiento

La arquitectura es una DenseNet-121 adaptada a volúmenes 3D, es decir, con convoluciones, normalizaciones y pooling tridimensionales en lugar de 2D. DenseNet conecta cada capa con todas las anteriores dentro de un bloque, lo que favorece la reutilización de características y reduce el número de parámetros frente a alternativas como ResNet de profundidad comparable. Con 11,9 millones de parámetros, es un modelo compacto orientado a la extracción de representaciones de imágenes cerebrales.

El entrenamiento sigue el esquema y-Aware Contrastive Learning de Dufumier et al. (MICCAI 2021). En lugar de contrastar únicamente pares aumentados de la misma imagen, el método incorpora la variable continua (en este caso, la edad) para definir la similitud entre muestras: dos sujetos con edades próximas se consideran positivos suaves, y la pérdida contrastiva pondera los pares según la distancia en la variable proxy. El preentrenamiento se realizó sobre BHB-10K. La model card indica que los pesos publicados son los originales, convertidos a safetensors sin ninguna modificación. No se documentan en la información disponible detalles sobre número de tokens, composición exacta del dataset, aumentos aplicados ni si hubo ajuste fino posterior con RLHF o DPO (no aplica en este dominio).

## Capacidades

- Extracción de características de mapas de materia gris 3D para transfer learning en tareas de neuroimagen.
- Clasificación de sujetos (por ejemplo, grupos diagnósticos) mediante ajuste fino de la cabeza de clasificación.
- Regresión sobre variables continuas, como predicción de edad cerebral o de biomarcadores.
- Representaciones útiles con pocos datos etiquetados gracias al preentrenamiento autosupervisado.
- Integración con el ecosistema `nidl` mediante `YAwareContrastiveLearning.from_pretrained` y `get_preprocessing()`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de visión médica, no un modelo generativo de texto.
- No dispone de modo thinking, visión 2D genérica, audio ni otras capacidades multimodales documentadas.

## Casos de uso

- Clasificación de enfermedad de Alzheimer y deterioro cognitivo leve: se inicializa la DenseNet-121 3D con estos pesos y se ajusta una cabeza de clasificación sobre volúmenes de materia gris de cohortes como ADNI; el preentrenamiento con edad como proxy aporta representaciones sensibles a cambios atróficos asociados a la edad.
- Predicción de edad cerebral: se ajusta una regresión sobre las características extraídas; la diferencia entre edad predicha y edad cronológica se usa como biomarcador de envejecimiento acelerado.
- Fenotipado y asociación genética: las representaciones del modelo sirven como características de entrada para estudios de asociación entre variantes genéticas y morfología cerebral, reduciendo la dimensionalidad frente a vóxeles brutos.
- Transfer learning en cohortes pequeñas: en estudios con pocos cientos de sujetos, el preentrenamiento en BHB-10K evita sobreajuste y permite obtener clasificadores razonables con menos datos etiquetados.
- Control de calidad y preprocesado en pipelines de neuroimagen: el modelo puede integrarse en flujos automatizados que ingieren mapas CAT12 y generan embeddings para detección de anomalías o agrupamiento de sujetos.
- Investigación en neurodesarrollo: ajuste fino para predecir variables continuas (edad, puntuaciones cognitivas) en poblaciones pediátricas, aprovechando que el proxy de preentrenamiento es precisamente la edad.
- Reproducibilidad de experimentos: al distribuirse los pesos originales en safetensors con API de carga estandarizada, facilita replicar resultados de la literatura de y-Aware CL sin depender de checkpoints propietarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 11,9 millones de parámetros, los pesos en precisión completa ocupan del orden de 48 MB (fp32) o 24 MB (fp16); el consumo dominante es el de las activaciones de los volúmenes 3D de entrada, que depende del tamaño de parche y del batch.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente para inferencia con parches de tamaño moderado; para entrenamiento o ajuste fino se recomiendan GPUs de 16-24 GB o superiores (RTX 4090, A100, H100) según el tamaño de batch y del volumen.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o RTX 4090, siempre que se ajuste el tamaño de parche y el batch a la memoria disponible.
- Opciones de despliegue: la vía documentada es la librería `nidl` (`pip install nidl[pretrained]`) con carga vía `YAwareContrastiveLearning.from_pretrained`. No se documentan exportaciones a ONNX, TorchScript ni integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Preentrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| y-Aware DenseNet-121 (BHB-10K) | 11,9 M | Volumen 3D de materia gris (CAT12) | y-Aware CL sobre BHB-10K | other | HuggingFace (nidl-neurospin) |
| DenseNet-121 3D sin preentrenar | ~11-12 M (según implementación) | Volumen 3D | Ninguno (inicialización aleatoria) | según implementación | Múltiples repositorios |
| ResNet-50 3D preentrenado en neuroimagen | ~46 M (según variante 3D) | Volumen 3D | Distintos esquemas supervisados o autosupervisados | variable | Repositorios académicos |
| Modelos fundacionales de neuroimagen (p. ej., basados en ViT 3D) | Decenas a cientos de millones | Volumen 3D | Grandes cohortes agregadas | variable | Repositorios académicos |

La comparación cuantitativa de rendimiento entre estas alternativas no está disponible en la información proporcionada. La ventaja diferencial del modelo es su tamaño reducido, su preentrenamiento específico con proxy continuo y su distribución estandarizada en el ecosistema `nidl`.

## Limitaciones y advertencias

- Modelo específico de dominio: solo acepta mapas de materia gris 3D preprocesados con CAT12 (VBM); no procesa imágenes 2D, texto ni otros formatos sin adaptación.
- Dependencia del preprocesado: los resultados pueden degradarse si el pipeline de preprocesado difiere del usado en el preentrenamiento; se recomienda usar `model.get_preprocessing()`.
- Sesgos de la cohorte: BHB-10K es un agregado de estudios con composición demográfica concreta; pueden existir sesgos de edad, sexo, origen geográfico y equipamiento de adquisición que afecten a la generalización.
- Riesgo de sobreajuste en cohortes pequeñas: aunque el preentrenamiento mitiga este problema, el ajuste fino con pocos sujetos sigue siendo sensible a la selección de hiperparámetros y a la validación cruzada.
- Licencia restrictiva: la licencia es "other" y la model card remite al repositorio fuente; es imprescindible revisar los términos del repositorio original antes de cualquier uso comercial o clínico.
- Uso clínico: no hay evidencia documentada de validación regulatoria ni de uso diagnóstico; no debe emplearse como dispositivo médico sin las validaciones correspondientes.
- Ausencia de benchmarks publicados: no hay métricas de rendimiento en la información disponible, lo que impide comparar objetivamente con alternativas.
- Idiomas y contexto: no aplica soporte multilingüe ni ventana de contexto; no es un modelo generativo.
- Fecha de creación del repositorio: la model card indica 2026-11-02; verificar la vigencia y posibles actualizaciones de los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nidl-neurospin/yaware-densenet121-bhb10k
- Repositorio original de y-Aware Contrastive Learning: https://github.com/Duplums/yAwareContrastiveLearning
- Librería nidl: https://github.com/neurospin-deepinsight/nidl
- Paper (MICCAI 2021): https://arxiv.org/abs/2106.08808
