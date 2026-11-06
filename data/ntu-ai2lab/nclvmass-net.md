# NTU-AI2Lab/ncLVMass-Net

## Resumen

ncLVMass-Net es un modelo de segmentación 3D desarrollado por el laboratorio NTU-AI2Lab (AI Application and Integration Lab de la Universidad Nacional de Taiwán) para la segmentación del miocardio del ventrículo izquierdo y la cuantificación de su masa a partir de imágenes de tomografía computarizada cardíaca sin contraste (NCCT). El modelo resuelve un problema clínico concreto: la cuantificación de la masa ventricular izquierda suele requerir resonancia magnética cardíaca o CT con contraste, modalidades más costosas o con riesgos asociados; ncLVMass-Net permite obtener esa medida a partir de un estudio NCCT ya disponible.

El modelo se ha entrenado con el framework nnU-Net sobre una cohorte de 2.021 pacientes, todos de Taiwán, y alcanza un Dice global de 0,8827 en la tarea de segmentación. La entrada es un volumen en formato NIfTI (`.nii.gz`) y la salida es la máscara del miocardio junto con una estimación de la masa ventricular izquierda. El repositorio ocupa 5,6 GB, coherente con los pesos de un ensemble nnU-Net en 3D.

Es relevante ahora porque demuestra que un pipeline de segmentación auto-configurado (nnU-Net) puede trasladarse a una modalidad de imagen de baja señal como el CT sin contraste, donde la delimitación del miocardio es más difícil que en CT con contraste, y ofrecer una medida cuantitativa lista para uso clínico o de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | nnU-Net (pipeline de segmentación 3D auto-configurado) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de imagen médica) |
| Licencia | otra (licencia personalizada `ai2lab`, fichero LICENSE en el repo) |
| Formato de pesos | no disponible (repositorio de 5,6 GB; entrada y salida en NIfTI `.nii.gz`) |

## Arquitectura y entrenamiento

ncLVMass-Net se construye sobre nnU-Net, un framework que configura automáticamente la arquitectura U-Net 3D, el preprocesado, la estrategia de aumento de datos y el esquema de entrenamiento a partir de las características del dataset. La tarea es una segmentación binaria o multiclase del miocardio del ventrículo izquierdo sobre volúmenes de CT cardíaco sin contraste. El autor no detalla en la model card la configuración exacta de la red (profundidad, número de canales, tamaño de parche) ni si se emplea un ensemble de folds.

El entrenamiento se realizó con 2.021 pacientes, todos procedentes de Taiwán, según indica la model card. No se especifican el número de volúmenes de validación o test, la composición del dataset, ni si hubo anotaciones multi-experto. Tampoco se documentan técnicas de regularización adicionales, inicialización con pesos preentrenados o estrategias de validación cruzada. El Dice global reportado de 0,8827 es el único dato cuantitativo de rendimiento publicado.

## Capacidades

- Segmentación 3D del miocardio del ventrículo izquierdo en CT cardíaco sin contraste.
- Cuantificación de la masa ventricular izquierda a partir de la máscara segmentada.
- Procesamiento de volúmenes en formato NIfTI (`.nii.gz`) como entrada y salida.
- Integración en pipelines clínicos o de investigación mediante el framework nnU-Net.
- No incluye generación de texto, razonamiento, código ni capacidades multilingües.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo de pensamiento, visión 2D general, audio ni otras modalidades.

## Casos de uso

- Cuantificación de masa ventricular izquierda en estudios NCCT existentes: el modelo permite derivar la masa del VI sin necesidad de adquirir un CT con contraste o una resonancia magnética, reutilizando estudios ya realizados en el paciente.
- Apoyo al diagnóstico de hipertrofia ventricular izquierda: la máscara y la masa estimada pueden servir como medida objetiva complementaria a la lectura radiológica en informes de cardiología.
- Investigación epidemiológica retrospectiva: al procesar cohortes amplias de NCCT ya archivadas, el modelo facilita estudios poblacionales sobre masa ventricular y factores de riesgo sin nuevas adquisiciones.
- Seguimiento longitudinal de pacientes: la segmentación automatizada permite comparar la masa ventricular entre estudios sucesivos de un mismo paciente con criterios consistentes.
- Triaje y priorización en radiología: la cuantificación automática puede marcar estudios con valores anómalos de masa para revisión prioritaria por el especialista.
- Generación de datasets anotados: las máscaras producidas pueden emplearse como preanotaciones para acelerar el etiquetado manual en nuevos proyectos de segmentación cardíaca.
- Validación de pipelines de imagen cardíaca: sirve como componente de referencia en la evaluación de herramientas de análisis automatizado de CT sin contraste.

## Benchmarks y rendimiento

| Métrica | Valor | Conjunto de evaluación |
|---|---|---|
| Dice global (segmentación de miocardio del VI) | 0,8827 | Cohorte de 2.021 pacientes (Taiwán) |

No se han publicado en la información disponible resultados desglosados por subgrupos, métricas de distancia (HD95, ASSD), correlación de masa ventricular ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende de la configuración nnU-Net (típicamente varios GB para parches 3D, pero el autor no lo especifica).
- GPU recomendadas: no disponibles en la información proporcionada; nnU-Net suele ejecutarse en GPUs con al menos 8-16 GB de VRAM, pero no se confirma para este modelo.
- Cabe en GPU de consumo: no disponible.
- Opciones de despliegue: framework nnU-Net (inferencia mediante sus scripts estándar); no se documentan exportaciones a ONNX, TensorRT ni otros runtimes.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de segmentación cardíaca en CT sin contraste ni con variantes de nnU-Net aplicadas a la misma tarea.

## Limitaciones y advertencias

- Cohorte de entrenamiento exclusivamente taiwanesa: el rendimiento puede degradarse en poblaciones con características demográficas o de adquisición distintas.
- Solo se ha validado en CT cardíaco sin contraste; no se garantiza su comportamiento en CT con contraste, resonancia magnética ni otras modalidades.
- El Dice global de 0,8827 no se desglosa por subgrupos ni incluye métricas de distancia o de error en la masa estimada, lo que limita la evaluación de su precisión clínica.
- No se documentan sesgos demográficos, de sexo o de equipo adquiridor más allá del origen geográfico de la cohorte.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de segmentaciones erróneas en casos atípicos o de baja calidad de imagen.
- Licencia personalizada `ai2lab`: es necesario revisar el fichero LICENSE del repositorio antes de cualquier uso comercial o clínico.
- No se especifican requisitos regulatorios, certificaciones ni validación clínica prospectiva; el uso en producción sanitaria requeriría validación local adicional.
- El repositorio no incluye información sobre cuantización, formatos alternativos de pesos ni optimizaciones de despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/NTU-AI2Lab/ncLVMass-Net
- GitHub: https://github.com/AI-Application-and-Integration-Lab/ncLVMass-Net
- nnU-Net: https://github.com/MIC-DKFZ/nnunet
