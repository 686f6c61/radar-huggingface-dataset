# dhimanjatin/radiassist-model

## Resumen

RadiAssist es un modelo de clasificación de imágenes médicas desarrollado por el usuario dhimanjatin (repositorio `dhiman-13/chest-xray-triage` en GitHub). Se trata de un DenseNet-121 ajustado mediante fine-tuning sobre el conjunto de datos NIH ChestX-ray14 para puntuar 14 hallazgos torácicos en radiografías de tórax, exportado a formato ONNX con escalado de temperatura y mapas de activación de clase (CAM) integrados. El modelo se sirve a través de la API RadiAssist.

El modelo aborda un problema clásico de triaje radiológico: la priorización automática de estudios de tórax según la probabilidad de hallazgos patológicos. Su relevancia radica en que combina una arquitectura convolucional consolidada (DenseNet-121) con calibración de probabilidades y explicabilidad integrada, lo que facilita la inspección de las regiones que motivan cada predicción. No obstante, se trata de un prototipo de investigación y no de un dispositivo médico.

La información disponible es limitada: el repositorio de Hugging Face ocupa 0.0 GB, no registra descargas ni interacciones, y la model card no detalla el número de parámetros, los idiomas soportados ni los formatos de pesos más allá de ONNX. La licencia es de tipo "other" con nombre "research-only", lo que restringe el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DenseNet-121 (CNN con conexiones densas) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de texto) |
| Licencia | research-only (tipo "other") |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en DenseNet-121, una red neuronal convolucional en la que cada capa recibe como entrada las salidas de todas las capas anteriores dentro de un bloque denso. Esta arquitectura es habitual en clasificación de radiografías de tórax por su eficiencia paramétrica y su capacidad para reutilizar características de bajo nivel. El modelo fue ajustado mediante fine-tuning sobre el conjunto NIH ChestX-ray14, que contiene 14 hallazgos torácicos anotados, y posteriormente exportado a ONNX.

La model card indica que el modelo incorpora escalado de temperatura para la calibración de probabilidades y que genera mapas de activación de clase (CAM) de forma integrada, lo que permite visualizar las regiones de la imagen que contribuyen a cada puntuación. No se especifican en la información disponible el número de tokens de entrenamiento (no aplica), la composición exacta del dataset más allá de NIH ChestX-ray14, ni si se emplearon técnicas de aumento de datos, entrenamiento adversarial o ajuste fino con refuerzo. Tampoco se detalla el procedimiento de calibración más allá del escalado de temperatura.

## Capacidades

- Clasificación multi-etiqueta de 14 hallazgos torácicos en radiografías de tórax (formato NIH ChestX-ray14).
- Puntuación de probabilidad por hallazgo, con calibración mediante escalado de temperatura.
- Generación de mapas de activación de clase (CAM) para explicabilidad de las predicciones.
- Exportación a ONNX, lo que permite inferencia en entornos con runtime ONNX (ONNX Runtime, etc.).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de capacidades multilingües ni de procesamiento de texto.
- No dispone de modo de razonamiento (thinking mode), visión general, audio ni otras modalidades.

## Casos de uso

- Triaje de radiografías de tórax en investigación: el modelo puntúa 14 hallazgos y permite priorizar estudios con mayor probabilidad de patología en un flujo de revisión, siempre en contexto de investigación y nunca como decisión clínica.
- Auditoría de datasets radiológicos: dado que genera puntuaciones por hallazgo, puede emplearse para detectar etiquetas inconsistentes o imágenes atípicas en conjuntos anotados con las mismas 14 clases de NIH ChestX-ray14.
- Docencia e investigación en explicabilidad: los CAM integrados permiten estudiar qué regiones de la radiografía activan cada clase, útil en trabajos sobre interpretabilidad de CNN en imagen médica.
- Validación de pipelines de inferencia ONNX: al estar exportado a ONNX, sirve como banco de pruebas para medir latencia y throughput de modelos de imagen médica en distintos runtimes y hardware.
- Prototipado de APIs de clasificación de imagen: la API RadiAssist y el repositorio de GitHub ofrecen una referencia para construir servicios de inferencia con calibración y explicabilidad.
- Investigación sobre calibración de probabilidades: con un ECE de 0.145 documentado, el modelo puede utilizarse como caso de estudio para comparar técnicas de calibración (escalado de temperatura frente a otras) en clasificación médica multi-etiqueta.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AUROC macro de test | 0.804 (IC 95 %: 0.800–0.808) |
| Imágenes de test | 25.596 (split oficial por paciente) |
| Error de calibración esperado (ECE) | 0.145 |

No se han publicado en la información disponible resultados desglosados por clase (AUROC por hallazgo), comparaciones con otros modelos en la misma tabla ni métricas de sensibilidad/especificidad a umbrales concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, DenseNet-121 en precisión FP32 requiere del orden de varios cientos de MB, pero no se confirma en la documentación del modelo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; al ser un modelo convolucional pequeño y exportado a ONNX, es plausible que quepa en GPU de consumo, pero no se aporta dato verificado.
- Opciones de despliegue: ONNX Runtime (formato de pesos ONNX); la API RadiAssist se sirve desde el repositorio de GitHub. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de imagen).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos comparativos con otros modelos de clasificación de radiografías de tórax (por ejemplo, variantes de CheXNet, EfficientNet o Vision Transformers entrenados sobre NIH ChestX-ray14). La model card solo reporta el AUROC macro propio (0.804) sin situarlo frente a alternativas.

| Modelo | Arquitectura | Contexto | AUROC macro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RadiAssist | DenseNet-121 + ONNX | no aplica | 0.804 | research-only | Hugging Face (ONNX) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor declara que es un prototipo de investigación y no un dispositivo médico; no debe emplearse para decisiones clínicas.
- La licencia es "research-only", lo que impide el uso comercial sin autorización expresa.
- El ECE de 0.145 indica una calibración moderada; las probabilidades no deben interpretarse como riesgos clínicos exactos sin recalibración adicional.
- El entrenamiento se limita a NIH ChestX-ray14, un dataset con sesgos demográficos y de adquisición conocidos; el rendimiento puede degradarse en poblaciones o equipos distintos.
- No se documentan sesgos específicos ni evaluaciones de equidad en la información disponible.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación.
- No se especifican limitaciones de idioma porque el modelo no procesa texto.
- El repositorio de Hugging Face no contiene pesos visibles (tamaño 0.0 GB), por lo que la disponibilidad efectiva de los artefactos ONNX no está confirmada.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dhimanjatin/radiassist-model
- Repositorio de la API RadiAssist: https://github.com/dhiman-13/chest-xray-triage
- Dataset NIH ChestX-ray14: no se proporciona enlace directo en la información disponible.
