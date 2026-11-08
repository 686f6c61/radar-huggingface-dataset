# afnanrizwan/trialmatch-qwen3-1.7b-lora

## Resumen

TrialMatch Qwen3-1.7B LoRA es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario afnanrizwan sobre el modelo base Qwen/Qwen3-1.7B. El adaptador está especializado en la evaluación de criterios de elegibilidad para ensayos clínicos: recibe como entrada una nota clínica de paciente numerada por frases, el tipo de criterio y el texto del criterio, y devuelve una salida JSON con los identificadores de las frases que sirven como evidencia y una etiqueta de cumplimiento. El modelo base Qwen3-1.7B es un transformer decoder-only de aproximadamente 2.000 millones de parámetros desarrollado por Alibaba Qwen.

El adaptador se entrenó con el conjunto de datos ncbi/TrialGPT-Criterion-Annotations, con una partición agrupada por paciente (37/8/8 pacientes) y sin utilizar las columnas generadas por GPT-4. El entrenamiento se realizó únicamente sobre los tokens de respuesta, con 3 épocas, learning rate 2e-4 con decaimiento coseno, batch efectivo de 16 y precisión fp16 sobre una GPU Kaggle T4. El autor lo presenta explícitamente como un prototipo educativo para una asignatura universitaria y advierte de que no es una herramienta de decisión de enrolamiento clínico.

Su relevancia es doble: por un lado, demuestra un caso de uso concreto de ajuste fino eficiente (PEFT) sobre un modelo pequeño para una tarea de dominio especializado; por otro, ofrece métricas de evaluación sobre un conjunto de test retenido que permiten comparar el efecto del ajuste frente al modelo base. El adaptador tiene un tamaño de repositorio de 0,1 GB y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-1.7B; rango r=16, alpha=32, aplicado a todas las proyecciones de atención y MLP |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen3-1.7B tiene aproximadamente 2.000 millones de parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen3-1.7B; no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base y del pipeline de despliegue) |
| Idiomas soportados | No disponibles (no especificados en la model card; el corpus de entrenamiento es de notas clínicas en inglés según la fuente de datos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre todas las proyecciones de atención y de las capas MLP del modelo base Qwen/Qwen3-1.7B, un transformer decoder-only de aproximadamente 2.000 millones de parámetros. La tarea se formula como generación condicionada: la entrada combina una nota clínica con frases numeradas, el tipo de criterio y el texto del criterio; la salida es un objeto JSON con la lista de identificadores de frases de evidencia y una etiqueta. El cálculo de la pérdida se restringe únicamente a los tokens de respuesta (answer-token-only loss), lo que evita que el modelo aprenda a reproducir la nota del paciente.

El entrenamiento usó el dataset ncbi/TrialGPT-Criterion-Annotations con una partición agrupada por paciente (37 pacientes de entrenamiento, 8 de validación y 8 de test) generada con numpy default_rng(42); las columnas generadas por GPT-4 no se emplearon. Se realizaron 3 épocas con learning rate 2e-4 y decaimiento coseno, batch efectivo de 16 y precisión fp16 sobre una GPU Kaggle T4, seleccionando el mejor checkpoint por pérdida de validación. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación posteriores al ajuste supervisado.

## Capacidades

- Extracción de evidencia a nivel de frase: identifica las frases de una nota clínica que justifican el cumplimiento o incumplimiento de un criterio de elegibilidad, devolviendo sus identificadores numéricos.
- Clasificación de elegibilidad: emite una etiqueta de cumplimiento del criterio a partir de la nota y del texto del criterio.
- Salida estructurada en JSON: el formato `{"evidence": [sentence IDs], "label": "<label>"}` facilita su integración en pipelines automatizados.
- Procesamiento de notas clínicas largas: la entrada admite notas completas numeradas por frases, aunque la longitud máxima efectiva depende del contexto del modelo base, no especificado.
- Especialización de dominio: ajuste específico sobre anotaciones de criterios de ensayos clínicos (TrialGPT), no entrenado para otras tareas clínicas.
- Capacidades generales heredadas del modelo base Qwen3-1.7B (generación de texto, razonamiento y código): no documentadas ni evaluadas para este adaptador en la información disponible.
- Soporte de tool calling y de agentes multi-paso: no disponible en la información proporcionada para este adaptador.
- Capacidades multilingües: no disponibles; no se especifican idiomas en la model card.

## Casos de uso

- Triaje previo de candidatos a ensayos clínicos: el adaptador puede procesar la nota de un paciente junto con cada criterio de inclusión o exclusión y devolver una etiqueta preliminar con las frases que la sustentan, lo que permite a un equipo de coordinación priorizar la revisión manual.
- Asistencia a la revisión de elegibilidad: al devolver los identificadores de frase como evidencia, el revisor humano puede verificar rápidamente en qué parte de la nota se basa cada decisión, reduciendo el tiempo de lectura del expediente completo.
- Prototipado educativo y de investigación: sirve como ejemplo reproducible de ajuste fino PEFT sobre un modelo pequeño para una tarea de extracción y clasificación en dominio clínico, con partición por paciente y métricas de test documentadas.
- Generación de datasets anotados de forma asistida: las etiquetas y evidencias generadas pueden usarse como preanotaciones para revisión humana en la construcción de corpus de elegibilidad, siempre con validación posterior.
- Integración en pipelines de procesamiento de documentos clínicos: la salida JSON permite encadenar el adaptador con sistemas de gestión documental o de historia clínica electrónica para prefiltrar criterios antes de la evaluación por especialistas.
- Evaluación comparativa de técnicas PEFT: el par base/adaptador con métricas sobre el mismo conjunto de test (206 criterios) permite medir de forma controlada la ganancia del ajuste frente al modelo sin ajustar.
- Docencia en IA aplicada a salud: el repositorio incluye código, manifiesto de partición y resultados completos, lo que facilita su uso como material de prácticas sobre evaluación rigurosa y particiones agrupadas por paciente.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test retenido (206 criterios, decodificación greedy), comparando el adaptador con el modelo base sin ajustar:

| Metrica | Adaptador LoRA | Modelo base Qwen3-1.7B |
|---|---|---|
| Accuracy | 0,748 | 0,335 |
| Macro-F1 | 0,571 | 0,270 |
| Evidence micro-F1 | 0,494 | 0,416 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; al tratarse de un adaptador sobre un modelo de aproximadamente 2.000 millones de parámetros, los requisitos son los del modelo base según la precisión o cuantización empleada.
- GPU recomendadas: el autor entrenó sobre una GPU Kaggle T4 (16 GB), lo que indica que el ajuste y la inferencia caben en hardware de gama media; GPU de datacenter como A100 o H100 no son necesarias para este tamaño.
- GPU de consumo: un modelo de ~2B parámetros es desplegable en GPU de consumo con cuantización adecuada; no se especifican en la información disponible los modelos concretos ni los requisitos exactos de VRAM.
- Opciones de despliegue: la carga se documenta con transformers y peft (`PeftModel.from_pretrained` seguido de `merge_and_unload()`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TrialMatch Qwen3-1.7B LoRA (este) | Adaptador sobre ~2B | No disponible | LoRA para elegibilidad de ensayos clínicos | Apache 2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| Qwen/Qwen3-1.7B (base) | ~2B | No disponible en la información | Modelo generalista de generación de texto | No disponible en la información | Hugging Face |
| haythembs/qwen3_1.7B_lora | Adaptador sobre ~2B | No disponible | LoRA genérico sobre Qwen3-1.7B | No disponible en la información | Hugging Face |

No se dispone de información sobre modelos comparables específicos de extracción de evidencia en elegibilidad de ensayos clínicos con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Herramienta no clínica: el propio autor la define como prototipo educativo y advierte explícitamente de que no debe usarse para decisiones de enrolamiento clínico.
- Riesgo de alucinación: al ser un modelo generativo, puede producir etiquetas o identificadores de evidencia que no se correspondan con el contenido real de la nota; la evidencia micro-F1 de 0,494 en test indica una coincidencia parcial con la anotación de referencia.
- Rendimiento moderado: el macro-F1 de 0,571 en test sugiere un desempeño desigual entre clases, probablemente por desbalance en los tipos de criterio; no se documentan métricas por clase.
- Sesgos: no se documentan análisis de sesgos demográficos, de género ni de subgrupos de pacientes; el corpus de anotación puede introducir sesgos propios de la fuente.
- Limitaciones de idioma: no se especifican idiomas soportados; el ajuste se realizó sobre anotaciones clínicas en inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Limitaciones de contexto: la longitud máxima de entrada no se documenta y depende del modelo base; notas clínicas muy extensas pueden truncarse.
- Restricciones de licencia: el adaptador se publica con Apache 2.0, pero el uso comercial en un contexto clínico exigiría validación regulatoria y clínica adicional independientemente de la licencia.
- Madurez del artefacto: el repositorio registra 0 descargas y 0 likes, y no se documentan evaluaciones externas ni mantenimiento posterior a su publicación.
- Dependencia del modelo base: el comportamiento final depende de la versión concreta de Qwen3-1.7B cargada; no se documenta una revisión fijada del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/afnanrizwan/trialmatch-qwen3-1.7b-lora
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Código, manifiesto de partición y resultados: https://github.com/AfnanRizwan1/GenAi-A2
- Dataset de anotaciones: https://huggingface.co/datasets/ncbi/TrialGPT-Criterion-Annotations
- Adaptador LoRA comparable sobre Qwen3-1.7B: https://huggingface.co/haythembs/qwen3_1.7B_lora
