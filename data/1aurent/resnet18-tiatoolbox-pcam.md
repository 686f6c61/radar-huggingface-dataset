# 1aurent/resnet18.tiatoolbox-pcam

## Resumen

`resnet18.tiatoolbox-pcam` es un modelo de clasificación de imágenes basado en la arquitectura ResNet18, entrenado por el Tissue Image Analytics (TIA) Centre de la Universidad de Warwick sobre parches de histología del conjunto de datos Patch Camelyon (PCam). El modelo se distribuye como parte del ecosistema TIAToolbox, una librería de código abierto para análisis de imágenes de tejidos, y está pensado para tareas de detección de metástasis en ganglios linfáticos a partir de parches de imagen microscópica.

Se trata de un modelo compacto, con 11,2 millones de parámetros, que opera sobre entradas de 96 x 96 píxeles y tres canales. Puede usarse tanto como clasificador de imagen completa como extractor de características (feature backbone) para pipelines de visión por computador en patología digital. Su licencia CC0-1.0 lo hace especialmente atractivo para uso comercial sin restricciones.

Aunque no es un modelo de lenguaje ni un modelo generativo, su relevancia radica en ser un componente especializado y ligero para flujos de trabajo de patología computacional, donde la eficiencia y la reproducibilidad son críticas. La integración con `timm` y `tiatoolbox` facilita su despliegue en entornos de investigación y producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet18 (red neuronal convolucional residual) |
| Parámetros totales | 11.187.138 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 96 x 96 x 3) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF/ONNX documentadas) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | CC0-1.0 (dominio público) |
| Formato de pesos | safetensors |
| Tamaño de entrada | 96 x 96 x 3 |
| Dataset de entrenamiento | Patch Camelyon (PCam) |
| Librería | timm |
| Pipeline | image-classification / feature-extraction |

## Arquitectura y entrenamiento

El modelo emplea una ResNet18 estándar, una red convolucional residual con 18 capas (bloques residuales básicos) y conexiones de salto, adaptada para clasificación binaria de parches de histología. La entrada es una imagen RGB de 96 x 96 píxeles, que se procesa mediante transformaciones específicas del modelo (normalización y redimensionado) accesibles a través de `timm.data.resolve_model_data_config`.

El entrenamiento se realizó sobre el dataset Patch Camelyon (PCam), un conjunto de parches de imágenes de ganglios linfáticos etiquetados como positivos o negativos para metástasis. No se dispone de información detallada sobre el número de épocas, composición exacta del dataset, técnicas de aumento de datos o si se aplicaron estrategias de regularización específicas. El modelo fue entrenado por el TIA Centre y se distribuye como parte de TIAToolbox, lo que sugiere que sigue las prácticas de entrenamiento de dicha librería, pero no se han publicado detalles adicionales en la información disponible.

## Capacidades

- Clasificación de imágenes de parches de histología (detección de metástasis en ganglios linfáticos).
- Extracción de características (feature backbone) para tareas posteriores como clustering, recuperación o modelos de múltiples instancias.
- Integración con `timm` para carga directa desde Hugging Face Hub.
- Compatibilidad con TIAToolbox para pipelines de patología digital.
- Entrada de imagen de 96 x 96 x 3, adecuada para parches de microscopía.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo thinking, visión general, audio ni otras capacidades generativas.

## Casos de uso

- **Detección de metástasis en ganglios linfáticos**: el modelo clasifica parches de 96 x 96 píxeles como positivos o negativos, lo que permite construir pipelines de cribado automático en patología digital. Es adecuado por su ligereza y su entrenamiento específico en PCam.
- **Extracción de características para modelos de múltiples instancias (MIL)**: al usar `num_classes=0`, el modelo devuelve un vector de características que puede alimentar clasificadores a nivel de imagen completa (whole-slide image). Esto es útil en flujos de trabajo donde se agregan parches para predecir el estado de una biopsia completa.
- **Preentrenamiento o fine-tuning en tareas de histología**: el modelo puede servir como inicialización para tareas relacionadas con imágenes de tejidos, aprovechando su licencia CC0 y su tamaño reducido para experimentación rápida.
- **Prototipado rápido en investigación**: gracias a su integración con `timm` y su pequeño tamaño (11,2 M de parámetros), permite iterar rápidamente en entornos con recursos limitados, como portátiles o GPUs de consumo.
- **Sistemas de recuperación de imágenes (image retrieval)**: las características extraídas pueden usarse para buscar parches similares en bases de datos de histología, facilitando la anotación asistida o el descubrimiento de patrones.
- **Validación de pipelines de patología computacional**: al ser un modelo de referencia dentro de TIAToolbox, puede emplearse para comprobar la corrección de transformaciones, normalizaciones y flujos de inferencia antes de escalar a modelos más grandes.
- **Educación y demostraciones**: su simplicidad y licencia permisiva lo hacen adecuado para talleres y cursos sobre aprendizaje profundo aplicado a imágenes médicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 1 GB en precisión FP32 (11,2 M de parámetros, ~45 MB de pesos, más activaciones para lotes pequeños). En FP16, aproximadamente la mitad.
- **GPU recomendadas**: cualquier GPU moderna es suficiente; se puede ejecutar en NVIDIA GTX 1060, RTX 2060, RTX 3060, RTX 4090, A100, H100, etc. También es viable en CPU para inferencia por lotes pequeños.
- **¿Cabe en consumer GPU?**: sí, en prácticamente cualquier GPU de consumo con al menos 2 GB de VRAM, e incluso en Raspberry Pi o dispositivos edge con optimizaciones.
- **Opciones de despliegue**: `timm` (PyTorch), `tiatoolbox`, exportación a ONNX o TorchScript para producción. No se documentan variantes GGUF o llama.cpp (no aplica a modelos de visión, aunque es posible convertir a otros formatos).
- **Latencia y throughput estimados**: no disponibles en la información proporcionada, pero dado el tamaño reducido se espera un throughput alto (cientos o miles de imágenes por segundo en GPU moderna) y latencia de milisegundos por parche.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/Entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `1aurent/resnet18.tiatoolbox-pcam` | 11,2 M | 96 x 96 x 3 | CC0-1.0 | Hugging Face, timm | Entrenado en PCam, integración TIAToolbox |
| ResNet18 estándar (ImageNet) | 11,7 M | 224 x 224 x 3 | BSD-3-Clause (torchvision) | PyTorch Hub, timm | Genérico, no especializado en histología |
| `1aurent/resnet50.tiatoolbox-pcam` (si existe) | no disponible | no disponible | no disponible | no disponible | No se dispone de información |
| Modelos de histología como `owkin/HistoSSLscaling` | no disponible | no disponible | no disponible | Hugging Face | No se dispone de datos comparativos en la información |

No se dispone de información suficiente para una comparativa cuantitativa con alternativas específicas de histología. La comparación con ResNet18 estándar es cualitativa: el modelo de TIA está especializado en parches de PCam, mientras que el de ImageNet es genérico.

## Limitaciones y advertencias

- **Sesgos conocidos**: el modelo se entrenó exclusivamente en PCam, que contiene parches de ganglios linfáticos con características específicas de tinción y escáner. Puede no generalizar bien a otros tejidos, laboratorios o protocolos de imagen.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero existe riesgo de falsos positivos/negativos en la clasificación, especialmente en parches ambiguos o con artefactos.
- **Limitaciones de contexto o idioma**: no aplica (modelo de visión). La entrada está fijada a 96 x 96 píxeles, lo que limita la resolución espacial.
- **Restricciones de licencia**: CC0-1.0 permite uso comercial sin restricciones, pero se recomienda citar el trabajo original (Pocock et al., 2022) por cortesía académica.
- **Caveats para producción**: no se han publicado métricas de rendimiento en la model card; se recomienda validar en el dominio específico antes de desplegar. El modelo no incluye cabecera de clasificación calibrada para otros fines. La información sobre cuantización y formatos alternativos es escasa.

## Enlaces

- [Hugging Face: 1aurent/resnet18.tiatoolbox-pcam](https://huggingface.co/1aurent/resnet18.tiatoolbox-pcam)
- [TIAToolbox (GitHub)](https://github.com/TissueImageAnalytics/tiatoolbox)
- [TIA Centre, University of Warwick](https://warwick.ac.uk/fac/cross_fac/tia/)
- [Patch Camelyon (PCam) dataset](https://github.com/basveeling/pcam/)
- [Paper TIAToolbox (Communications Medicine, 2022)](https://www.nature.com/articles/s43856-022-00186-5)
- [Licencia CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/legalcode)
- [Ejemplo de imagen de histología (HistoSSLscaling)](https://github.com/owkin/HistoSSLscaling/raw/main/assets/example.tif)
