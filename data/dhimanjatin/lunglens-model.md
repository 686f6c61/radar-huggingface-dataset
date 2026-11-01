# dhimanjatin/lunglens-model

## Resumen

LungLens es un modelo de clasificación de imágenes para radiografías de tórax, desarrollado por el usuario dhimanjatin. Se trata de un DenseNet-121 ajustado (fine-tuned) sobre el conjunto de datos NIH ChestX-ray14 para puntuar 14 hallazgos torácicos, exportado a formato ONNX con escalado de temperatura y mapas de activación de clase (CAM) integrados. El modelo está pensado como prototipo de investigación para triaje automatizado, no como dispositivo médico.

El modelo resuelve la tarea de clasificación multi-etiqueta de hallazgos en radiografías de tórax, un problema clásico de imagen médica donde la escasez de anotaciones y el desequilibrio de clases son habituales. Su relevancia radica en que combina un backbone estándar y bien conocido (DenseNet-121) con calibración de probabilidades y explicabilidad integrada, lo que facilita su inspección y despliegue en entornos de investigación.

La información disponible es limitada: el repositorio de HuggingFace no contiene pesos visibles (tamaño 0.0 GB), no se especifican parámetros totales, longitud de contexto ni idiomas. La licencia es "research-only" (solo investigación), lo que restringe explícitamente el uso clínico y comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DenseNet-121 (red convolucional densa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible; exportado a ONNX |
| Idiomas soportados | no disponible (modelo de imagen, sin capacidades lingüísticas) |
| Licencia | research-only (other) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura es DenseNet-121, una red convolucional con conexiones densas entre capas, ampliamente utilizada en clasificación de imágenes médicas. El modelo fue ajustado sobre NIH ChestX-ray14, un conjunto de radiografías de tórax con anotaciones de 14 hallazgos torácicos. Según la model card, el entrenamiento incluyó escalado de temperatura (temperature scaling) para calibrar las probabilidades de salida y la integración de mapas de activación de clase (CAM) para explicabilidad.

No se dispone de información sobre el número de tokens de entrenamiento (no aplica), la composición exacta del dataset más allá de NIH ChestX-ray14, ni si se emplearon técnicas de aumento de datos, ponderación de clases o validación cruzada. La partición de test es la oficial por paciente, con 25.596 imágenes, lo que evita fuga de datos entre entrenamiento y evaluación.

## Capacidades

- Clasificación multi-etiqueta de 14 hallazgos torácicos en radiografías de tórax.
- Salida de probabilidades calibradas mediante escalado de temperatura.
- Generación de mapas de activación de clase (CAM) para explicabilidad.
- Exportación a ONNX para inferencia en producción.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No es un modelo generativo: no produce texto ni descripciones libres.

## Casos de uso

- Triaje automatizado en investigación: el modelo puede priorizar radiografías con alta probabilidad de hallazgos anómalos, ayudando a ordenar la revisión por radiólogos en estudios retrospectivos.
- Evaluación de pipelines de imagen médica: sirve como baseline reproducible para comparar técnicas de preprocesado, calibración o explicabilidad en clasificación de tórax.
- Docencia y formación: los mapas de activación permiten ilustrar qué regiones de la radiografía influyen en la predicción, útil en entornos académicos.
- Investigación en calibración: el ECE de 0,145 y el escalado de temperatura lo convierten en un caso de estudio para métodos de calibración de probabilidades.
- Desarrollo de herramientas de explicabilidad: la integración de CAM facilita experimentar con técnicas de interpretabilidad sobre un backbone estándar.
- Prototipado de APIs de inferencia: al estar exportado a ONNX, puede desplegarse en servicios ligeros para pruebas de concepto, siempre con fines de investigación.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AUROC macro en test | 0,804 (IC 95%: 0,800-0,808) |
| Imagenes de test | 25.596 (partición oficial por paciente) |
| Error de calibración (ECE) | 0,145 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; DenseNet-121 es un modelo relativamente ligero y puede ejecutarse en GPU consumer con pocos GB de VRAM, pero no se especifica el tamaño exacto de los pesos.
- GPU recomendadas: no disponible; por el tamaño típico de DenseNet-121, una GPU con 4-8 GB de VRAM podría ser suficiente, aunque no hay confirmación.
- Compatibilidad con GPU consumer: probable, pero no confirmada.
- Opciones de despliegue: ONNX Runtime, servicios propios de la API LungLens (repositorio en GitHub).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LungLens | DenseNet-121 | no aplica | AUROC macro 0,804 | research-only | HuggingFace (repo vacío) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no es un dispositivo médico y no debe usarse para decisiones clínicas.
- Licencia research-only: restringe el uso comercial y clínico.
- Calibración imperfecta: ECE de 0,145 indica que las probabilidades no están perfectamente calibradas.
- Sesgos potenciales: el entrenamiento con NIH ChestX-ray14 puede heredar sesgos demográficos y de adquisición del dataset original.
- Riesgo de alucinación: no aplica en el sentido generativo, pero puede producir falsos positivos y falsos negativos en hallazgos.
- Repositorio sin pesos: el tamaño del repo es 0.0 GB, por lo que los pesos pueden no estar disponibles públicamente.
- Sin información sobre idiomas ni contexto textual: es un modelo exclusivamente de imagen.

## Enlaces

- HuggingFace: https://huggingface.co/dhimanjatin/lunglens-model
- Repositorio de la API: https://github.com/dhiman-13/chest-xray-triage
- Dataset NIH ChestX-ray14: no disponible en la información proporcionada.
