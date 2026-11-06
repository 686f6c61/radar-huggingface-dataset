# kepler2005/Gender-Classifier-Mini

## Resumen
Gender-Classifier-Mini es un modelo de clasificación de imágenes binaria desarrollado por kepler2005 y publicado en Hugging Face. Se trata de un encoder vision-lenguaje fine-tuned a partir de google/siglip2-base-patch16-224, diseñado para predecir el género aparente (masculino o femenino) a partir de imágenes, principalmente rostros. Utiliza la arquitectura SiglipForImageClassification de la librería Transformers y se entrena sobre el dataset myvision/gender-classification.

El problema que resuelve es la clasificación demográfica automática de imágenes en dos clases: "Female ♀" (clase 0) y "Male ♂" (clase 1). Según la model card, alcanza una accuracy y un F1 score de 0,9720 sobre un conjunto de evaluación de 5.000 imágenes, lo que lo sitúa como una opción ligera y precisa para tareas de análisis demográfico.

Su relevancia actual radica en que aprovecha SigLIP2, una de las familias de encoders imagen-texto más recientes de Google, y en que su tamaño reducido (92,9 millones de parámetros, unos 372 MB en precisión completa) permite desplegarlo incluso en hardware modesto o en CPU, a diferencia de los grandes modelos de visión generales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SiglipForImageClassification (encoder SigLIP2 con cabeza de clasificación) |
| Parametros totales | 92.885.762 |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | no disponible (modelo de visión; entrada de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (solo pesos originales en safetensors) |
| Idiomas soportados | en (etiquetas y documentación en inglés; el modelo procesa imágenes, no texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 2,1 GB) |

## Arquitectura y entrenamiento
El modelo parte de google/siglip2-base-patch16-224, un encoder vision-lenguaje de la familia SigLIP2 de Google con parcheo de 16x16 píxeles y resolución de entrada de 224x224. Sobre este encoder se añade una cabeza de clasificación de etiqueta única (single-label) con dos clases, entrenada mediante el wrapper SiglipForImageClassification de Transformers. No es un modelo MoE ni híbrido: es un transformer de visión convencional con todos los parámetros activos.

El fine-tuning se realiza sobre el dataset myvision/gender-classification, un conjunto de datos de rostros etiquetados por género. La model card no especifica el número de imágenes de entrenamiento, el número de épocas, el optimizador ni si se emplearon técnicas como RLHF o DPO (que no aplican a este tipo de tarea). Como innovación destacable cabe señalar el uso de SigLIP2, que mejora la alineación imagen-texto respecto a SigLIP mediante pérdidas adicionales de entrenamiento, lo que se traduce en representaciones visuales más robustas para tareas de clasificación descendentes.

## Capacidades
- Clasificación binaria de género aparente en imágenes, con salida de probabilidades softmax para cada clase ("Female ♀" y "Male ♂").
- Inferencia de imagen única mediante el pipeline image-classification de Transformers, compatible con AutoImageProcessor.
- Procesamiento de imágenes RGB a resolución 224x224.
- Integración sencilla con Gradio para demos interactivas (el propio README incluye un ejemplo funcional).
- Compatibilidad con Inference Endpoints de Hugging Face (endpoints_compatible).
- No soporta tool calling, agentes, razonamiento multi-paso, ni generación de texto: es un clasificador puro de visión.

## Casos de uso
- Análisis demográfico de datasets: permite estimar la distribución por género en grandes colecciones de imágenes (por ejemplo, para auditar el balance de un dataset de entrenamiento antes de entrenar otro modelo).
- Sistemas de verificación de identidad: puede actuar como señal auxiliar en pipelines de reconocimiento facial, filtrando inconsistencias entre el documento y la foto presentada.
- Marketing y publicidad: segmentación demográfica de imágenes de campañas o análisis de audiencias en fotografía de contenido, personalizando creatividades según el perfil detectado.
- Investigación y salud: análisis estadístico por género en estudios con imágenes (siempre como señal auxiliar y con supervisión ética, no como diagnóstico).
- Moderación y organización de catálogos: etiquetado automático de bibliotecas de imágenes o stock fotográfico para facilitar búsquedas y filtrado.
- Prototipado rápido de apps de visión: gracias a su tamaño reducido y al ejemplo Gradio incluido, es adecuado para demos y MVPs que requieran una señal demográfica sin desplegar modelos pesados.
- Etiquetado en flujos de anotación: preetiquetado automático de rostros para acelerar la anotación humana en tareas de ML supervisado.

## Benchmarks y rendimiento
Resultados publicados en la model card del autor (conjunto de evaluación de 5.000 imágenes, 2.549 clase Female y 2.451 clase Male):

| Métrica | Valor |
|---|---|
| Accuracy | 0,9720 |
| F1 score (macro) | 0,9720 |
| Precision (Female) | 0,9660 |
| Recall (Female) | 0,9796 |
| F1 (Female) | 0,9727 |
| Precision (Male) | 0,9785 |
| Recall (Male) | 0,9641 |
| F1 (Male) | 0,9712 |

No se han publicado comparaciones con otros clasificadores de género ni resultados en benchmarks estándar (MMLU, HumanEval, etc.), que no aplican a este tipo de modelo.

## Requisitos de hardware
- VRAM estimada para inferencia: con 92,9 millones de parámetros, unos 372 MB en FP32 y la mitad en FP16/BF16; en la práctica, 1-2 GB de VRAM son suficientes incluyendo el procesador de imagen.
- GPU recomendadas: cualquier GPU moderna; no requiere A100 ni H100. Una RTX 3060, RTX 4060 o superior es más que suficiente.
- Ejecución en consumer GPU: sí, sobradamente. También es viable la inferencia en CPU dada la reducida carga computacional de un modelo base de ~93M de parámetros a 224x224.
- Opciones de despliegue: librería Transformers (SiglipForImageClassification), Inference Endpoints de Hugging Face, Gradio (ejemplo incluido en la model card), o cualquier servicio que sirva safetensors. No se menciona soporte específico para vLLM, llama.cpp, Ollama o TGI; al ser un modelo de clasificación de visión, vLLM y llama.cpp no son las vías habituales.
- Latencia y throughput: no disponibles; por tamaño y resolución de entrada, se esperan inferencias en el orden de milisegundos en GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Resolucion | Licencia |
|---|---|---|---|---|
| kepler2005/Gender-Classifier-Mini | 92,9 M | Clasificacion binaria de genero | 224x224 | apache-2.0 |
| google/siglip2-base-patch16-224 (modelo base) | 93 M (aprox.) | Alineacion imagen-texto general | 224x224 | apache-2.0 |
| prithivMLmods/Gender-Classifier-Mini (referenciado en el codigo de ejemplo) | no disponible | Clasificacion binaria de genero | no disponible | no disponible |

Nota: la familia SigLIP2 de Google incluye variantes base, large y So400m; este modelo usa la variante base, lo que lo sitúa en el extremo ligero del espectro. No hay comparativas numéricas publicadas frente a otros clasificadores de género.

## Limitaciones y advertencias
- Clasificación binaria (hombre/mujer): el modelo no contempla identidades no binarias ni de género no conforme, lo que puede producir resultados incorrectos u ofensivos para personas fuera de esa dicotomía.
- Riesgo de sesgo demográfico: los clasificadores de género suelen mostrar precisión desigual según etnia, edad, iluminación y ángulo. La model card no publica métricas desagregadas por subgrupos, por lo que el sesgo potencial no es cuantificable con los datos disponibles.
- Predice el género aparente en la imagen, no la identidad real de la persona; puede confundirse con peinados, maquillaje, accesorios u oclusiones.
- No es un modelo de reconocimiento facial ni de identificación: solo emite una probabilidad por clase.
- Uso en producción sensible: la clasificación de género a partir de imágenes puede estar sujeta a normativa de protección de datos (RGPD en Europa) y a restricciones legales por categoría protegida; evalúe la base jurídica antes de desplegarla en atención al cliente, marketing o sanidad.
- Resolución fija de 224x224: imágenes con rostros muy pequeños o de baja calidad pueden degradar el rendimiento.
- Documentación limitada: no se especifican datos de entrenamiento detallados (épocas, split, augmentation), y el ejemplo de código de la model card apunta a otro repositorio (prithivMLmods/Gender-Classifier-Mini), lo que sugiere que la ficha deriva de una plantilla; verifique el checkpoint correcto antes de integrarlo.
- Licencia apache-2.0: permite uso comercial sin restricciones significativas más allá de la atribución y el aviso de licencia.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/kepler2005/Gender-Classifier-Mini
- Modelo base: https://huggingface.co/google/siglip2-base-patch16-224
- Dataset de entrenamiento: https://huggingface.co/datasets/myvision/gender-classification
- No hay paper, blog ni demo adicionales en la información disponible.
