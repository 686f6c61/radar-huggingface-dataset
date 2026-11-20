# MohsinElis/mfft-checkpoints

## Resumen

MFFT (Multi-Frequency Fusion Transformer) es una familia de modelos de visión por computador especializados en la detección forense de imágenes generadas por IA. Lo desarrolla MohsinElis y se presenta en el artículo "Multi-Frequency Fusion Transformer: Robust and Computationally Efficient AI-Generated Image Forensics Across Generator Architectures", publicado en Elsevier Machine Learning with Applications (MLWA). El repositorio aloja los checkpoints oficiales en PyTorch, la telemetría de convergencia del entrenamiento y las tablas de métricas.

El modelo aborda un problema concreto: distinguir imágenes sintéticas de imágenes reales de forma robusta frente a distintas arquitecturas generadoras, con un coste computacional muy bajo. La familia se compone de tres variantes (Tiny, Base y Large) con un rango de 372.450 a 6.301.250 parámetros, lo que permite despliegues en dispositivos edge, movil y en infraestructura de producción sin necesidad de GPU de gran capacidad.

La relevancia actual radica en la combinación de precisión y eficiencia: la variante más pequena alcanza un 98,59 % de accuracy y un 99,89 % de AUC-ROC en el benchmark forense interno de 18.000 imágenes, con un checkpoint FP32 de solo 1,49 MB. Es un modelo de clasificación de imágenes, no un modelo generativo ni un LLM, y está pensado para pipelines de verificación de contenido, moderación y peritaje digital.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-Frequency Fusion Transformer (MFFT): descomposición DFT 2D en sub-bandas anulares, backbones CNN depthwise-separable por sub-banda, fusión por Cross-Attention Band Fusion (CAF) y Frequency-Guided Attention (FGA) |
| Parametros totales | Tiny: 372.450; Base: 1.622.690; Large: 6.301.250 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de clasificación de imagen, no de texto) |
| Tipos de cuantizacion | No disponible (checkpoints publicados en FP32) |
| Idiomas soportados | Ingles (etiqueta de idioma del repositorio; el modelo opera sobre imagen, no sobre texto) |
| Licencia | MIT |
| Formato de pesos | Checkpoints PyTorch (FP32); tamanos: Tiny 1,49 MB, Base 6,49 MB, Large 25,21 MB |
| Tarea | image-classification (deteccion de imagenes generadas por IA) |
| Libreria | pytorch |
| Tamano del repositorio | 95,7 GB (incluye checkpoints, telemetria y predicciones de evaluacion) |

## Arquitectura y entrenamiento

MFFT aplica una transformada discreta de Fourier 2D sobre la imagen y descompone el espectro en sub-bandas anulares isotrópicas y no solapadas a lo largo del ancho de banda de Nyquist, de modo que la suma de las sub-bandas cubre aproximadamente el espectro completo. Cada sub-banda se proyecta en tokens espectrales mediante backbones CNN ligeros con convoluciones depthwise-separable. Los tokens se fusionan dinámicamente mediante Cross-Attention Band Fusion (CAF) y se ponderan con priors físicos de energía de Parseval a través de Frequency-Guided Attention (FGA). Esta combinación busca explotar artefactos de alta frecuencia típicos de los generadores de imágenes sin depender de una arquitectura generadora concreta.

Los datos de entrenamiento provienen de un benchmark forense multigenerador de 120.000 imágenes, con un conjunto de test retenido de 18.000 imágenes (partición con hash `e8db1a72`, semilla 42). No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un clasificador de imagen). La model card incluye telemetría de convergencia multi-semilla (n = 5 ejecuciones de MFFT-Base), lo que permite evaluar la estabilidad del entrenamiento.

## Capacidades

- Clasificación binaria de imágenes: distingue imágenes generadas por IA de imágenes reales.
- Análisis forense basado en frecuencia: detecta artefactos espectrales asociados a distintos generadores.
- Robustez entre arquitecturas generadoras: el benchmark de evaluación es multigenerador, no específico de un solo modelo.
- Tres variantes de capacidad: Tiny para edge/móvil, Base para producción equilibrada y Large para infraestructura de alta capacidad.
- Inferencia de bajo coste: el modelo más pequeno tiene 372.450 parámetros y un checkpoint de 1,49 MB.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador de imagen, no un modelo de lenguaje.
- No dispone de modo thinking, visión generativa, audio ni capacidades multimodales más allá de la entrada de imagen.

## Casos de uso

- Moderación de contenido en plataformas: clasificar imágenes subidas por usuarios para marcar posibles contenidos sintéticos antes de su publicación, usando MFFT-Tiny en el servidor de ingesta por su bajo coste por inferencia.
- Verificación periodística: comprobar la autenticidad de imágenes recibidas en redacciones, con MFFT-Base como modelo de referencia y revisión humana de los casos límite.
- Peritaje forense digital: apoyar análisis periciales de evidencia gráfica, aportando una puntuación de probabilidad de generación sintética junto al análisis manual.
- Detección en dispositivos edge: integrar MFFT-Tiny en aplicaciones móviles o cámaras conectadas para alertar in situ de imágenes sintéticas, gracias a su checkpoint de 1,49 MB.
- Filtrado en pipelines de datasets: limpiar corpus de imágenes de entrenamiento eliminando muestras generadas por IA antes de usarlas en otros modelos.
- Monitorización de marketplaces y anuncios: detectar imágenes de producto generadas artificialmente o manipuladas en catálogos a gran escala, con MFFT-Large en infraestructura de alta capacidad.
- Investigación en forense de imagen: usar los checkpoints y la telemetría publicada como línea base reproducible para comparar nuevos métodos de detección.

## Benchmarks y rendimiento

Resultados declarados por el autor en el Held-Out 18K Forensic Benchmark (Canonical Split `e8db1a72`, semilla 42), no verificados de forma independiente.

| Modelo | Parametros | Accuracy (%) | AUC-ROC (%) | Precision (%) | Recall (%) | F1 (%) |
|---|---|---|---|---|---|---|
| MFFT-Tiny | 372.450 | 98,59 | 99,89 | 99,24 | 97,94 | 98,58 |
| MFFT-Base | 1.622.690 | 98,37 | 99,88 | 98,60 | 98,13 | 98,36 |
| MFFT-Large | 6.301.250 | 98,11 | 99,70 | 98,80 | 97,41 | 98,09 |

Comparativa con las 13 arquitecturas evaluadas en el mismo benchmark:

| Arquitectura | Parametros | Accuracy (%) | AUC-ROC (%) | F1 (%) |
|---|---|---|---|---|
| EfficientNet-B0 | 4.010.110 | 99,51 | 99,95 | 99,51 |
| ResNet-50 | 23.512.130 | 99,38 | 99,96 | 99,38 |
| ResNet-18 | 11.177.538 | 99,32 | 99,97 | 99,32 |
| Swin-T | 27.520.892 | 99,31 | 99,97 | 99,31 |
| SimpleCNN | 422.530 | 98,51 | 99,81 | 98,51 |
| LightViT | 5.084.418 | 95,42 | 99,31 | 95,41 |
| ViT-B/16 | 86.092.034 | 93,13 | 98,48 | 93,10 |
| DeiT-Small | 21.813.892 | 88,12 | 95,89 | 87,79 |
| CLIP ViT-B/32 | 87.924.226 | 85,76 | 93,93 | 85,42 |
| FreqDetect | 14.658 | 50,00 | 50,08 | 66,67 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todos los casos. Los checkpoints FP32 ocupan 1,49 MB (Tiny), 6,49 MB (Base) y 25,21 MB (Large), por lo que el cuello de botella es la memoria de activaciones de la imagen de entrada, no los pesos.
- GPU recomendadas: cualquier GPU moderna sirve; para producción de alto throughput se recomiendan A100, H100 o L4. Para edge, es viable en GPU integradas y aceleradores móviles.
- Cabe en GPU consumer: sí, en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para lotes pequenos.
- Opciones de despliegue: PyTorch nativo (librería declarada); exportación a TorchScript u ONNX para serving. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamano de los pesos, se espera una latencia dominada por el preprocesado de imagen y el cálculo de la DFT.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Accuracy (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MFFT-Tiny | 372.450 | Detección de imágenes IA | 98,59 | MIT | Hugging Face |
| EfficientNet-B0 | 4.010.110 | Detección de imágenes IA (en este benchmark) | 99,51 | No disponible en la información | Referencia de la comparativa del autor |
| ResNet-18 | 11.177.538 | Detección de imágenes IA (en este benchmark) | 99,32 | No disponible en la información | Referencia de la comparativa del autor |
| FreqDetect | 14.658 | Detección de imágenes IA basada en frecuencia | 50,00 | No disponible en la información | Referencia de la comparativa del autor |

La ventaja de MFFT frente a EfficientNet-B0 y ResNet-18 no es la precisión absoluta, sino la relación entre precisión y huella de parámetros: MFFT-Tiny logra un 98,59 % de accuracy con 372.450 parámetros, frente a los 4 millones de EfficientNet-B0 y los 11 millones de ResNet-18. Los datos de licencia y disponibilidad de los modelos comparables no se detallan en la información proporcionada.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y figuran como no verificados; no hay validación independiente publicada en la información disponible.
- El benchmark de evaluación es interno (120.000 imágenes multigenerador, test de 18.000); el rendimiento en generadores no representados en el dataset de entrenamiento puede degradarse.
- Riesgo de falsos positivos y falsos negativos: con recall en torno al 97-98 %, una fracción no trivial de imágenes sintéticas puede pasar sin detectar; se recomienda umbral ajustable y revisión humana.
- El modelo está etiquetado solo para inglés, aunque al operar sobre imagen el idioma no afecta a la inferencia; la documentación y la interfaz están en inglés.
- No se documentan sesgos específicos por demografía, estilo fotográfico o resolución de imagen; conviene evaluar el modelo sobre el dominio concreto de producción antes de desplegarlo.
- Licencia MIT: permite uso comercial y modificación, pero no se detallan condiciones adicionales sobre los datos de entrenamiento ni garantías del autor.
- El repositorio ocupa 95,7 GB, muy por encima del tamano de los checkpoints, por lo que la descarga completa incluye telemetría y predicciones de evaluación.
- No es un modelo generativo ni un LLM: no debe emplearse para tareas de texto, razonamiento o generación de contenido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MohsinElis/mfft-checkpoints
- Dataset de referencia: https://huggingface.co/datasets/MohsinElis/mfft-master-manifest
- Repositorio GitHub del proyecto: https://github.com/MIHMahmudEli/mfft-workspace
- Artículo (Elsevier MLWA): referencia enlazada desde el repositorio GitHub del proyecto; no se dispone de URL directa en la información proporcionada.
