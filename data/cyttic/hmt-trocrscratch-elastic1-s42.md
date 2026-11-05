# cyttic/hmt-trocrscratch-elastic1-s42

## Resumen

`cyttic/hmt-trocrscratch-elastic1-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el equipo CyTTIC en el marco de un estudio de aumento de datos (*data augmentation*) denominado `htr-metrics-transfer`. El modelo parte de la arquitectura TrOCR y se entrena desde cero (*scratch*) sobre un conjunto de datos de escritura manuscrita en hebreo, con una variante concreta de aumento de datos etiquetada como `elastic1` y una semilla fija de 42.

Se trata de un artefacto de investigación más que de un modelo listo para producción: forma parte de una matriz de experimentos en la que se varía la estrategia de *augmentation* y la semilla para medir su efecto sobre métricas de reconocimiento (CER y WER). El modelo se publica con pesos en formato safetensors, licencia MIT y aproximadamente 22,4 millones de parámetros, lo que lo sitúa en la gama ligera y permite su despliegue en hardware modesto.

Su relevancia es acotada: sirve como referencia reproducible para estudiar la transferencia de métricas HTR y como punto de comparación frente a otras variantes del mismo estudio. No está pensado como un modelo generalista ni multilingüe, sino específicamente para transcripción de manuscrito en hebreo con decodificación CTC y sin modelo de lenguaje externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (encoder-decoder transformer para visión-texto) |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | Reconocimiento de texto manuscrito (HTR) |
| Decodificacion | CTC, greedy, sin modelo de lenguaje |
| Dataset de entrenamiento | `cyttic/hhd-optionb-split` (train menos los escritores de dev) |
| Aumento de datos | `elastic1` |
| Semilla | 42 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR, un transformer encoder-decoder diseñado para reconocimiento óptico de caracteres que combina un encoder de visión con un decoder de texto. En esta variante se entrena desde cero (`scratch`), es decir, sin inicializar desde los pesos preentrenados habituales de TrOCR, lo que la convierte en una ablación controlada dentro del estudio `htr-metrics-transfer`.

El entrenamiento se realiza sobre el split `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para el conjunto de desarrollo, lo que evita fuga de información entre particiones. La innovación técnica del experimento no reside en la arquitectura sino en el protocolo: se aplica una estrategia de aumento de datos `elastic1` (deformaciones elásticas sobre las imágenes de manuscrito) con semilla fija 42, y se evalúa con decodificación CTC greedy sin modelo de lenguaje, de modo que las métricas reflejen el rendimiento puro del modelo sobre la señal visual. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables en un modelo HTR).

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes de líneas o regiones de texto.
- Decodificación CTC greedy sin modelo de lenguaje externo, lo que simplifica el pipeline de inferencia.
- Entrenamiento desde cero (*scratch*), útil como línea base para estudios de aumento de datos.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso como agente.
- No es un modelo multilingüe: está entrenado exclusivamente para hebreo.
- No dispone de modo *thinking*, visión general, audio ni otras capacidades multimodales más allá de la lectura de imagen a texto.
- No se han documentado capacidades de generación de texto libre, código o matemáticas.

## Casos de uso

- Estudio de ablación sobre aumento de datos: el modelo sirve para comparar el efecto de la estrategia `elastic1` frente a otras variantes del mismo estudio, manteniendo constante la semilla 42 y el protocolo de evaluación.
- Reproducibilidad de investigación en HTR: al publicarse con semilla y dataset identificados, permite replicar el experimento y verificar las métricas CER/WER reportadas.
- Línea base para transferencia de métricas: útil para validar si las conclusiones obtenidas en un dominio o idioma se transfieren a otro dentro del mismo corpus.
- Transcripción de manuscrito hebreo en entornos controlados: con un CER de 0,3411, puede emplearse en tareas de indexación aproximada o búsqueda por palabras clave donde no se exija transcripción exacta.
- Generación de datos sintéticos etiquetados: las salidas del modelo pueden servir como pseudoetiquetas para preentrenar modelos mayores, filtrando por confianza.
- Evaluación de pipelines de OCR/HTR: permite probar infraestructura de inferencia (preprocesado de imagen, decodificación CTC, cálculo de CER/WER) antes de escalar a modelos de mayor tamaño.
- Docencia y experimentación: su tamaño reducido (22,4 M de parámetros) lo hace adecuado para demostraciones de HTR en cursos y talleres.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (HHD Option-B test, decodificación greedy, sin LM):

| Metrica | Valor |
|---|---|
| CER | 0.3411 |
| WER | 0.9363 |

No se han publicado resultados de benchmarks comparativos adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a un modelo HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (22,4 M de parámetros, ~90 MB de pesos), y del orden de 200-400 MB considerando activaciones y buffers de imagen.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060, RTX 4090, entre otras.
- También puede ejecutarse en CPU para inferencia por lotes de baja frecuencia.
- Opciones de despliegue: PyTorch nativo (carga directa de safetensors), ONNX Runtime tras exportación, o integración en pipelines personalizados; no se ha verificado soporte específico en vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratch-elastic1-s42 | 22,4 M | no disponible | HTR hebreo | MIT | HuggingFace |
| Otras variantes del estudio `htr-metrics-transfer` | no disponible | no disponible | HTR hebreo | no disponible | no disponible |
| TrOCR base (Microsoft) | ~334 M | no disponible | OCR/HTR impreso y manuscrito | MIT | HuggingFace |
| Modelos HTR específicos para hebreo | no disponible | no disponible | HTR hebreo | no disponible | no disponible |

La comparación con TrOCR base es orientativa: este modelo es una versión entrenada desde cero y mucho más pequeña, por lo que su rendimiento no es directamente equiparable. No se dispone de datos de benchmarks de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento limitado: un CER de 0,3411 y un WER de 0,9363 indican una tasa de error elevada, insuficiente para transcripción exacta en producción.
- Sesgos de dominio: entrenado únicamente sobre el corpus `hhd-optionb-split`, por lo que puede generalizar mal a otras manos, estilos o calidades de escaneo.
- Idiomas: solo hebreo; no debe esperarse comportamiento correcto en otros alfabetos o idiomas.
- Sin modelo de lenguaje: la decodificación CTC greedy sin LM incrementa errores en palabras ambiguas o poco frecuentes.
- Riesgo de alucinación: como todo modelo generativo de texto, puede producir caracteres o palabras no presentes en la imagen, especialmente en regiones de baja calidad.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre idoneidad ni exactitud.
- Artefacto de investigación: no se documentan procesos de validación en producción, ni límites de contexto, ni cuantizaciones probadas.
- Fecha de creación futura en los metadatos (2026-11-04): conviene verificar la integridad y procedencia del repositorio antes de reutilizarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyttic/hmt-trocrscratch-elastic1-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` (referenciado en la model card, disponible en el repositorio del modelo)
- Estudio `htr-metrics-transfer`: no disponible como enlace público en la información proporcionada
- TrOCR (arquitectura base): https://huggingface.co/docs/transformers/model_doc/trocr
