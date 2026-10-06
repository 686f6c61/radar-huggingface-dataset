# mashhoodyousaf/skin-disease-model

## Resumen

skin-disease-model es un modelo de visión por computador publicado en Hugging Face por el usuario mashhoodyousaf. El repositorio contiene únicamente pesos en formato safetensors (0,3 GB) y la etiqueta `vit`, lo que sitúa el modelo en la familia de los Vision Transformer; el recuento real de parametros (85.803.270, aproximadamente 85,8 millones) coincide con la escala de un ViT-Base, aunque la variante concreta (tamaño de parche, resolución de entrada, número de capas) no se declara en la ficha.

Por el nombre del repositorio, el modelo parece orientado a la clasificación de enfermedades de la piel a partir de imágenes dermatológicas, una tarea con demanda creciente en teledermatología y triaje clínico asistido. Sin embargo, no se ha publicado información sobre el conjunto de datos de entrenamiento, el número de clases de salida, las métricas obtenidas ni el procedimiento de ajuste fino.

La relevancia del modelo es limitada en su estado actual: se distribuye sin licencia declarada, sin documentación técnica, sin pipeline asignado y con cero descargas en el momento de la consulta. Cualquier evaluación seria exige inspeccionar el config.json y el preprocessor_config.json del repositorio para determinar resolución de entrada, etiquetas de clase y normalización aplicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT); variante concreta no especificada (etiqueta del repositorio: `vit`) |
| Parametros totales | 85.803.270 (≈85,8 M) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible (modelo de visión; no se declara resolución de entrada ni número de parches) |
| Tipos de cuantizacion | no disponible; el tamaño del repositorio (0,3 GB) es compatible con pesos en fp32 sin cuantizar |
| Idiomas soportados | no disponible (modelo de imagen, no procesa texto) |
| Licencia | no disponible (no declarada en el repositorio) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 0,3 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 1 en el momento de la consulta |
| Fechas | creado el 2026-10-06, actualizado el 2026-10-06 |

## Arquitectura y entrenamiento

La única información estructural disponible es la etiqueta `vit` y el número de parámetros. Con 85,8 M de parámetros, el modelo encaja con un Vision Transformer de escala Base (ViT-B), que en su configuración canónica a 224x224 con parches de 16x16 procesa 196 tokens más el token de clase a través de 12 bloques de atención multi-cabeza. La cifra de 0,3 GB para 85,8 M de parámetros implica aproximadamente 4 bytes por parámetro, es decir, pesos almacenados en fp32.

No se dispone de información sobre el corpus de entrenamiento: ni el número de imágenes, ni su procedencia, ni la taxonomía de clases, ni si se aplicaron técnicas de aumento de datos, ajuste fino con inicialización desde un ViT preentrenado en ImageNet, o regularización específica. Tampoco hay constancia de validación cruzada, particiones de test ni métricas por clase.

No hay evidencia de innovaciones técnicas destacables (atención lineal, decodificación especulativa, destilación, adaptadores de bajo rango) ni de que se haya publicado un informe técnico o artículo asociado.

## Capacidades

- Clasificación de imágenes: la arquitectura ViT y el nombre del repositorio apuntan a clasificación de imágenes dermatológicas, presumiblemente con una única etiqueta por imagen.
- Extracción de representaciones: al ser un ViT, los pesos pueden emplearse como extractor de características visuales para transferencia a otras tareas, siempre que se conozca la resolución y normalización esperadas.
- Generación de texto: no soportada. No es un modelo de lenguaje ni multimodal texto-imagen.
- Razonamiento, matemáticas y código: no aplica.
- Tool calling y function calling: no soportado.
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no aplica; no hay tokenizador de texto.
- Capacidad especial (modo thinking, visión, audio): únicamente visión, en el supuesto de clasificación de imágenes. No se declara segmentación, detección ni captioning.
- Generación de imágenes: no soportada.

## Casos de uso

- Triaje dermatológico preliminar: el modelo podría clasificar una fotografía de lesión cutánea en categorías patológicas y actuar como primer filtro antes de la revisión por un dermatólogo. Requiere validar previamente el número y la semántica exacta de las clases de salida.
- Teledermatología en atención primaria: integrado en una aplicación de captura de imágenes, permitiría priorizar los casos derivados a especialista según la probabilidad estimada de malignidad. Exige umbrales de confianza calibrados y revisión humana obligatoria.
- Preetiquetado de datasets clínicos: usar el modelo para asignar etiquetas iniciales a grandes volúmenes de imágenes sin anotar, que después se corrigen manualmente. El coste computacional es bajo (0,3 GB y 85,8 M de parámetros), por lo que se puede ejecutar en lote sobre CPU o GPU modesta.
- Investigación en visión médica: servir como punto de partida para ajuste fino en tareas relacionadas (clasificación de cáncer de piel, dermatoscopia, lesiones inflamatorias) mediante transferencia de aprendizaje.
- Filtrado de contenido en pipelines de datos: descartar o agrupar automáticamente imágenes dermatológicas dentro de un repositorio mayor de imágenes clínicas.
- Docencia y simulación clínica: en entornos controlados, construir ejercicios de clasificación de lesiones donde el estudiante compara su diagnóstico con la predicción del modelo y su nivel de confianza.
- Aplicaciones móviles de concienciación: integrar el modelo comprimido en una app para orientar al usuario sobre la conveniencia de consultar a un profesional. Es imprescindible un aviso claro de que no constituye diagnóstico médico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de precisión, sensibilidad, especificidad, AUC, F1 ni matrices de confusión, ni comparaciones con otros modelos dermatológicos.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 350 MB solo para pesos, más activaciones y memoria del framework; en la práctica, entre 0,5 y 1,5 GB según el tamaño de lote y la resolución de entrada.
- VRAM estimada en fp16: en torno a 175 MB para pesos; en int8, unos 86 MB, aunque no se publican pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Funciona con NVIDIA T4, RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100 y H100; estas últimas están sobredimensionadas para un modelo de este tamaño.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual e incluso en iGPU con memoria compartida suficiente para lotes pequeños.
- CPU: inferencia viable en CPU para cargas moderadas, dado el reducido tamaño del modelo.
- Opciones de despliegue: Transformers (PyTorch) con `AutoModelForImageClassification` es la vía natural, dado el formato safetensors. No hay pesos GGUF ni ONNX publicados, por lo que llama.cpp, Ollama y variantes equivalentes no son aplicables sin conversión previa. vLLM y TGI no aplican a modelos de clasificación de imágenes.
- Latencia y throughput: no disponibles. Como referencia orientativa, un ViT-Base a 224x224 realiza del orden de 17 GFLOPs por imagen, una estimación dependiente de la resolución real y no verificada con este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad | Benchmarks publicos |
|---|---|---|---|---|---|
| mashhoodyousaf/skin-disease-model | 85,8 M | no disponible | no disponible | Hugging Face, 0 descargas | no |
| google/vit-base-patch16-224 | 86 M | 224x224, 16x16 parches | Apache 2.0 | Hugging Face, ampliamente usado | ImageNet |
| microsoft/beit-base-patch16-224 | 86 M | 224x224, 16x16 parches | MIT | Hugging Face | ImageNet |
| facebook/deit-base-patch16-224 | 86 M | 224x224, 16x16 parches | Apache 2.0 | Hugging Face | ImageNet |
| ConvNeXt-Tiny (facebook/convnext-tiny-224) | 28 M | 224x224 | Apache 2.0 | Hugging Face | ImageNet |

La comparación en rendimiento con estos modelos no es posible porque skin-disease-model no publica resultados. La diferencia principal con las alternativas es de carácter legal y documental: los modelos citados declaran licencia y procedencia de datos, mientras que este repositorio no.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card con descripción de datos, clases, métricas ni uso previsto.
- Licencia no declarada: sin licencia explícita no se conceden derechos de uso, modificación ni redistribución; el uso comercial queda en un limbo legal y no es recomendable en producción.
- Sin validación clínica publicada: no hay evidencia de sensibilidad o especificidad, ni de validación externa en cohortes independientes. No debe emplearse con fines diagnósticos.
- Riesgo de sesgo por tono de piel: los modelos dermatológicos entrenados con datasets sesgados hacia pieles claras rinden peor en fototipos oscuros (escala de Fitzpatrick). No hay información sobre la composición demográfica del corpus de entrenamiento.
- Desbalance de clases probable: en dermatología, las clases malignas suelen ser minoritarias; sin métricas por clase no se puede descartar un sesgo hacia las categorías mayoritarias.
- Riesgo de alucinación en sentido estricto: no aplica a la generación de texto, pero sí existe riesgo de falsos negativos y falsos positivos con consecuencias clínicas graves si se confía en la predicción sin supervisión.
- Resolución y preprocesado desconocidos: si no se replica exactamente la normalización y el tamaño de entrada del entrenamiento, las predicciones pueden degradarse de forma severa.
- Reproducibilidad: sin semilla, versión de librerías ni receta de entrenamiento, los resultados no son reproducibles.
- Marco regulatorio: cualquier uso clínico requeriría marcado CE conforme al reglamento europeo MDR 2017/745 o autorización equivalente de la FDA; este repositorio no cumple ninguno de esos requisitos.
- Confianza y calibración: no se conoce si las salidas están calibradas como probabilidades; no se debe interpretar el softmax como probabilidad clínica real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mashhoodyousaf/skin-disease-model
- No se han encontrado en la búsqueda web artículos, repositorios de código, demos ni documentación adicional asociados a este modelo.
