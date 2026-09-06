# cyttic/trocr-webfonts7-BY

## Resumen

`cyttic/trocr-webfonts7-BY` es un modelo de reconocimiento óptico de caracteres (OCR) desarrollado por el usuario cyttic. Se trata de un ajuste fino (fine-tuning) de `cyttic/exp2-frozen-benyehuda-cont`, que a su vez es un modelo de tipo TrOCR (vision encoder-decoder). El modelo está diseñado para convertir imágenes con texto en secuencias de texto, mediante el pipeline `image-text-to-text` de la librería Transformers.

Con 299.495.168 parámetros, es un modelo de tamaño moderado, adecuado para tareas de OCR en entornos con recursos limitados. El repositorio incluye pesos en formato `safetensors` y ocupa 3.6 GB. La información publicada sobre el dataset de entrenamiento, licencia e idiomas soportados es escasa o no disponible, lo que limita la evaluación de su idoneidad para casos de uso concretos. Su relevancia actual radica en ser una opción ligera y basada en una arquitectura probada para extraer texto de imágenes, aunque su adopción en producción requiere validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision encoder-decoder (TrOCR) |
| Parametros totales | 299.495.168 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura TrOCR, compuesta por un codificador visual (vision encoder) y un decodificador de texto. Esta combinación permite procesar imágenes y generar texto como salida. El modelo es un ajuste fino de `cyttic/exp2-frozen-benyehuda-cont`, que actúa como modelo base. El dataset de entrenamiento no se especifica en la información disponible.

Durante el entrenamiento se utilizaron los siguientes hiperparámetros: tasa de aprendizaje de 2e-05, tamaño de lote de 8 (con acumulación de gradientes de 2, resultando en un lote total de 16), optimizador AdamW (variante torch fused), programador de tasa de aprendizaje lineal con 4650 pasos de calentamiento y 3 épocas. No se documentan técnicas de alineación como RLHF o DPO. Tampoco se mencionan innovaciones técnicas adicionales en la model card.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) a partir de imágenes, mediante el pipeline `image-text-to-text`.
- Generación de texto como salida a partir de una imagen de entrada.
- Integración con la librería Transformers de Python.
- No se documentan capacidades de tool calling, function calling o razonamiento multi-paso.
- Los idiomas soportados no están especificados.
- No se indica soporte para visión más allá de OCR ni para audio.

## Casos de uso

- Digitalización de documentos escaneados: el modelo puede convertir imágenes de documentos en texto plano para su archivo y búsqueda. Su tamaño moderado permite ejecutarlo en servidores con recursos limitados.
- Extracción de texto de capturas de pantalla: útil para automatizar la lectura de texto en imágenes de interfaces de usuario o ventanas de aplicaciones.
- Automatización de entrada de datos: el modelo puede transcribir texto presente en formularios o registros fotografiados, reduciendo la necesidad de introducción manual.
- Accesibilidad: transcripción de texto de imágenes para personas con discapacidad visual, integrable en aplicaciones de asistencia.
- Procesamiento de facturas y recibos: extracción de campos de texto de documentos comerciales, aunque la precisión debe validarse con datos propios.
- Archivado de material histórico: digitalización de textos impresos o manuscritos en imágenes de baja calidad, siempre que el modelo haya sido entrenado con ese tipo de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor reporta en la model card las siguientes métricas sobre el conjunto de evaluación, sin especificar el dataset ni comparar con otros modelos:

| Metrica | Valor |
|---|---|
| Loss | 0.6263 |
| Cer (Character Error Rate) | 0.0306 |
| Wer (Word Error Rate) | 0.0893 |

Estos valores indican un error de carácter del 3.06% y un error de palabra del 8.93% en el conjunto utilizado por el autor. No se dispone de resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que es un modelo de OCR.

## Requisitos de hardware

- VRAM estimada para inferencia: con 299 millones de parámetros, el modelo requiere aproximadamente 1.2 GB en precisión float32 y unos 600 MB en float16, más overhead de ejecución. En la práctica se recomienda al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU de consumo con 4 GB de VRAM o superior, como la RTX 3060, RTX 4060 o equivalente. También es viable en GPUs profesionales como la A10 o T4.
- No se requiere hardware especializado; el modelo es ligero para su arquitectura.
- Opciones de despliegue: Transformers (PyTorch), Hugging Face Inference Endpoints. No se confirma compatibilidad con vLLM, llama.cpp u otras plataformas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se ha encontrado información comparativa con otros modelos de OCR en los datos proporcionados. No se puede establecer una comparación rigurosa sin datos de benchmarks adicionales.

## Limitaciones y advertencias

- El dataset de entrenamiento es desconocido, lo que impide evaluar la cobertura de dominios o la calidad de los datos utilizados.
- La licencia no está especificada, lo que supone un riesgo para cualquier uso comercial o redistribución.
- Las métricas de evaluación reportadas (CER y WER) provienen de un conjunto de evaluación no identificado, por lo que no son generalizables.
- El modelo puede presentar errores de transcripción, especialmente en imágenes con baja resolución, fuentes poco comunes o texto dañado.
- No se documentan sesgos específicos, pero al ser un modelo de OCR, la precisión puede variar según el tipo de fuente o idioma.
- No se especifican los idiomas soportados, por lo que su uso en idiomas distintos al de entrenamiento puede producir resultados incorrectos.
- La información limitada de la model card dificulta la evaluación de su idoneidad para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/trocr-webfonts7-BY
- Modelo base: https://huggingface.co/cyttic/exp2-frozen-benyehuda-cont
- Modelos relacionados (de la búsqueda web): https://huggingface.co/cyttic/trocr-webfonts5, https://huggingface.co/cyttic/trocr-webfonts3
