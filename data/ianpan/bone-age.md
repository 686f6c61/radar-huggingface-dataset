# ianpan/bone-age

## Resumen

`ianpan/bone-age` es un modelo de visión por computador especializado en la estimación automática de la edad ósea a partir de radiografías de mano pediátricas. Lo desarrolla Ian Pan y se distribuye con licencia Apache 2.0 en Hugging Face. No es un modelo generativo ni un LLM: es un clasificador de imágenes (pipeline `image-classification`) construido sobre el backbone ConvNeXt V2 Tiny, con 84.148.563 parámetros totales y un tamaño de repositorio de 0,3 GB.

El modelo resuelve un problema clínico concreto: determinar la madurez esquelética de un paciente pediátrico comparando la apariencia de los centros de osificación de la mano y la muñeca con atlas de referencia. La edad ósea es una medida estándar en endocrinología pediátrica para detectar trastornos del crecimiento. El modelo se entrenó y validó sobre 14.036 radiografías del dataset público RSNA Pediatric Bone Age Challenge (2017).

Su relevancia actual radica en que supera a las mejores soluciones de aquel reto: alcanza un error absoluto medio (MAE) de 4,16 meses en el conjunto de test original de 200 radiografías con anotación múltiple, frente a los 4,42 meses de la referencia publicada en *Radiology* (Halabi et al., 2019). Es un ejemplo compacto de cómo un backbone moderno de visión, con un pipeline de preprocesado cuidadoso, puede igualar o superar arquitecturas más pesadas en una tarea médica acotada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 Tiny (CNN pura, familia ConvNeXt), con cabezal de clasificación de 1 a ~228 clases (una por mes de edad ósea) |
| Parametros totales | 84.148.563 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada = imagen de radiografía) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un ensemble de 3 pliegues (3-fold) sobre el backbone `timm/convnextv2_tiny.fcmae_ft_in22k_in1k`, preentrenado con FCMAE (Fully Convolutional Masked Autoencoder) e ImageNet-22k/1k. Cada uno de los tres submodelos (`model.net0`, `model.net1`, `model.net2`) se entrenó durante 20.000 iteraciones con batch size 64 en 2 GPU NVIDIA RTX 3090. Originalmente el modelo tenía cabezal de regresión y de clasificación; la versión publicada carga solo el cabezal de clasificación porque su rendimiento individual era ligeramente superior y produce GradCAMs de mejor calidad.

La inferencia aplica softmax sobre los logits (clase `i` = `i` meses) y calcula la suma ponderada por el índice de clase, devolviendo un escalar en meses. El entrenamiento incluyó aumentos de datos estándar más dos aumentos específicos del dominio, cada uno con probabilidad 0,5 e independientes entre sí: recorte de la radiografía usando un modelo auxiliar (`ianpan/bone-age-crop`) y *histogram matching* contra una imagen de referencia (`ref_img.png` incluida en el repo). La variable sexo del paciente se pasa como argumento `female` (1 = mujer, 0 = hombre) en el `forward()`, lo que permite condicionar la predicción.

## Capacidades

- Regresión de edad ósea en meses a partir de una radiografía de mano pediátrica (salida escalar continua).
- Clasificación por mes de edad ósea: acceso a los logits crudos con `return_logits=True`.
- Acepta el sexo del paciente como variable condicionante (`female`).
- Preprocesado integrado: `model.preprocess(img)` y carga directa de DICOM con `model.load_image_from_dicom(path)` si `pydicom` está instalado.
- Robustez a variabilidad de imagen gracias a los aumentos de recorte e histogram matching.
- Inferencia por submodelo individual (`model.net0(x, female)`) para análisis o ensembles parciales.
- No soporta tool calling, agentes, texto ni razonamiento multi-paso: es puramente un modelo de imagen.

## Casos de uso

- **Triaje automatizado en radiología pediátrica**: dado un estudio de mano, el modelo devuelve una estimación en meses que el radiólogo puede comparar con la edad cronológica para detectar discrepancias; el MAE de 4,16 meses es suficiente como señal de alarma, no como diagnóstico definitivo.
- **Investigación en endocrinología pediátrica**: permite procesar cohortes retrospectivas de radiografías para estudiar correlaciones entre edad ósea, crecimiento y patologías, usando el modelo como anotador automático a escala.
- **Validación de pipelines de preprocesado**: al ser sensible al recorte y al histogram matching, sirve como banco de pruebas para evaluar cómo distintas estrategias de normalización afectan a la precisión de un modelo médico.
- **Prototipado de herramientas de soporte a la decisión**: integrable en un servicio de inferencia (FastAPI + `transformers`) que reciba DICOM y devuelva la edad ósea estimada junto con GradCAMs para explicabilidad.
- **Docencia y formación**: útil para ilustrar el flujo completo de un modelo médico (preprocesado, condicionamiento por sexo, ensemble, evaluación con MAE) en cursos de IA aplicada a imagen médica.
- **Comparación de backbones en tareas médicas**: al ser un ConvNeXt V2 Tiny público y reproducible (código en `i-pan/bone-age-prediction`), sirve como baseline para comparar con ViT, EfficientNet u otras arquitecturas en la misma tarea.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test original del RSNA Pediatric Bone Age Challenge (200 radiografías con anotación múltiple). Métrica: MAE en meses. Entre corchetes, rendimiento del modelo individual `net0`.

| Configuracion | MAE ensemble (meses) | MAE net0 (meses) |
|---|---|---|
| Crop (-) / Histogram matching (-) | 4,42 | 4,67 |
| Crop (+) / Histogram matching (-) | 4,47 | 4,84 |
| Crop (-) / Histogram matching (+) | 4,34 | 4,59 |
| Crop (+) / Histogram matching (+) | 4,16 | 4,45 |

Referencia comparativa citada por el autor: las mejores soluciones del reto original publicadas en *Radiology* (Halabi et al., 2019). No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni benchmarks de texto, por no ser aplicables a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el ensemble completo (84 M de parámetros); en FP16, aproximadamente 0,2 GB de pesos más activaciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó con 2× RTX 3090, pero la inferencia cabe en GPUs consumer modestas (GTX 1650, RTX 3050, RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, en cualquier GPU con soporte CUDA y al menos 2 GB de VRAM; también puede ejecutarse en CPU para inferencia puntual.
- Opciones de despliegue: `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`; exportable a TorchScript/ONNX para servir con Triton o TorchServe; no hay variantes GGUF ni soporte nativo en llama.cpp/Ollama (no aplica a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por imagen en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto/entrada | MAE (meses) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ianpan/bone-age | 84,1 M | Edad ósea (regresión/clasificación) | Radiografía de mano | 4,16 | Apache 2.0 | Hugging Face |
| Soluciones top RSNA 2017 (Halabi et al.) | no disponible | Edad ósea | Radiografía de mano | ~4,4 (referencia citada) | no disponible | Paper en *Radiology* |
| ianpan/bone-age-crop | no disponible | Detección/recorte de mano | Radiografía | no aplica | no disponible | Hugging Face |

No se dispone en la información proporcionada de otros modelos comparables con especificaciones detalladas (parámetros, contexto, licencia) para ampliar la tabla.

## Limitaciones y advertencias

- **No aprobado para uso clínico**: el autor indica explícitamente que es para demostración e investigación, sin aprobación regulatoria. No debe usarse para diagnóstico ni decisiones médicas.
- **Riesgo de sesgo poblacional**: entrenado solo con el dataset RSNA (población pediátrica concreta); el rendimiento puede degradarse en otras distribuciones demográficas o equipos de rayos X distintos.
- **Sensibilidad al preprocesado**: el MAE varía entre 4,16 y 4,84 meses según se apliquen o no recorte e histogram matching; usar el pipeline recomendado es crítico para reproducir los resultados.
- **Dependencia del sexo del paciente**: la predicción requiere el argumento `female`; omitirlo o introducirlo mal sesga la salida.
- **Rango de edad acotado**: las clases cubren meses de edad ósea del dataset de entrenamiento; predicciones fuera de ese rango no están garantizadas.
- **Alucinación en sentido amplio**: al ser un clasificador, no "alucina" texto, pero puede producir estimaciones plausibles pero erróneas en imágenes de baja calidad, artefactos o posicionamiento incorrecto.
- **Licencia Apache 2.0**: permite uso comercial, pero la responsabilidad legal y clínica recae en el usuario; el aviso del autor exime de responsabilidad.
- **Sin variantes cuantizadas publicadas**: no hay GGUF/ONNX oficiales, lo que limita el despliegue en entornos sin PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ianpan/bone-age
- Repositorio de archivos: https://huggingface.co/ianpan/bone-age/tree/main
- Modelo de recorte auxiliar: https://huggingface.co/ianpan/bone-age-crop
- Código de entrenamiento y exportación: https://github.com/i-pan/bone-age-prediction
- Dataset RSNA Pediatric Bone Age Challenge: https://www.rsna.org/rsnai/ai-image-challenge/rsna-pediatric-bone-age-challenge-2017
- Paper de referencia (Halabi et al., *Radiology*): https://pubs.rsna.org/doi/10.1148/radiol.2018180736
- Backbone base: https://huggingface.co/timm/convnextv2_tiny.fcmae_ft_in22k_in1k
- DOI del modelo: https://doi.org/10.57967/hf/4673
