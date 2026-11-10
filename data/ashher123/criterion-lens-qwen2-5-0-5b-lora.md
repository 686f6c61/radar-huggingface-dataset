# Ashher123/criterion-lens-qwen2.5-0.5b-lora

## Resumen

CriterionLens es un adaptador LoRA de investigación publicado por el usuario Ashher123 sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. Su propósito declarado es el emparejamiento de evidencia extraída de notas clínicas de pacientes con criterios de elegibilidad de ensayos clínicos, una tarea conocida como criterion screening dentro del pipeline de reclutamiento de estudios. El autor lo etiqueta explícitamente como prototipo de investigación y advierte de que no es un dispositivo médico ni debe usarse para tomar decisiones clínicas.

El adaptador se ha entrenado sobre el dataset ncbi/TrialGPT-Criterion-Annotations, con una longitud máxima de secuencia de 640 tokens, 3 épocas y un rango LoRA de 16 con alpha 32, lo que supone 8.798.208 parámetros entrenables sobre un total de 502.830.976 del modelo base. La información publicada es mínima: no hay métricas de validación ni de test, no se especifican idiomas soportados y el repositorio tiene un tamaño de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos o son de tamaño despreciable.

La relevancia de esta ficha es limitada pero informativa: sirve como ejemplo de adaptación PEFT de bajo coste sobre un modelo pequeño para una tarea vertical muy específica, y como recordatorio de las precauciones necesarias al evaluar artefactos de investigación sin métricas publicadas. Cualquier uso en producción requeriría una evaluación independiente completa antes de considerarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct |
| Parametros totales | 502.830.976 (modelo base); 8.798.208 entrenables en el adaptador LoRA |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 640 tokens (longitud máxima de secuencia usada en entrenamiento); el contexto nativo del base Qwen2.5-0.5B-Instruct no se detalla en la información disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones habituales de Qwen2.5, pero no se especifican en la información) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5 mil millones de parámetros. El entrenamiento utiliza LoRA con rango 16 y alpha 32, apuntando a las capas del modelo base y añadiendo 8.798.208 parámetros entrenables sobre los 502.830.976 totales. Se emplearon 3 épocas con una longitud máxima de secuencia de 640 tokens sobre el dataset ncbi/TrialGPT-Criterion-Annotations (revisión 1cfcafde94a1560a33b4addc1638664fe28fc059).

La partición de datos es a nivel de paciente, con 37 pacientes y 602 anotaciones en entrenamiento, 8 pacientes y 206 anotaciones en validación, y 8 pacientes y 206 anotaciones en test. Según la model card, los objetivos de entrenamiento se limitan a identificadores de evidencia y etiquetas de elegibilidad expertas; las explicaciones generadas por GPT-4 se excluyen tanto de las entradas como de los objetivos, lo que evita contaminación por destilación de un modelo mayor en la señal supervisada. No se documentan técnicas de RLHF, DPO ni innovaciones arquitectónicas adicionales.

## Capacidades

- Emparejamiento de evidencia clínica con criterios de elegibilidad de ensayos clínicos, a partir de notas de paciente y texto de criterios.
- Generación de etiquetas de elegibilidad a nivel de criterio, según el esquema del dataset TrialGPT-Criterion-Annotations.
- Identificación de fragmentos de evidencia (evidence IDs) que sustentan cada decisión de elegibilidad.
- Razonamiento de tipo evidence-grounded: el adaptador está entrenado para apoyarse en extractos concretos del texto de entrada en lugar de generar justificaciones libres.
- Herencia de las capacidades generales del base Qwen2.5-0.5B-Instruct (generación de texto, instrucciones básicas, multilingüismo del base), aunque no se documenta su preservación tras el ajuste LoRA.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Prototipado de pipelines de preselección de candidatos en ensayos clínicos: el adaptador puede integrarse como componente de un sistema que, dada una nota clínica y un criterio, devuelva una etiqueta de elegibilidad y las evidencias asociadas, para su posterior revisión por un comité humano.
- Investigación en NLP clínico: sirve como baseline reproducible sobre el dataset TrialGPT-Criterion-Annotations para comparar estrategias de adaptación PEFT en tareas de criterion screening.
- Extracción de evidencia asistida: dado su entrenamiento en evidence IDs, puede usarse para resaltar fragmentos relevantes de notas que un revisor humano debe examinar, reduciendo el tiempo de lectura.
- Evaluación de técnicas de adaptación de bajo coste: con solo 8,8 M de parámetros entrenables y un base de 0,5 B, es útil para estudiar la viabilidad de LoRA en dominios verticales con datos escasos (602 anotaciones de entrenamiento).
- Filtrado previo en cohortes de investigación: como paso de triaje automático para descartar combinaciones paciente-criterio claramente no elegibles antes de la revisión experta, siempre con supervisión humana.
- Docencia y experimentación: por su tamaño reducido, permite ejecutar el pipeline completo en hardware de consumo y sirve para ilustrar flujos PEFT de extremo a extremo en cursos de NLP aplicado a salud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que las métricas de validación (macro-F1 y micro-F1 de evidencia) figuran como "TBD" y que no se incluyen métricas de test.

| Metrica | Valor |
|---|---|
| Validation macro-F1 | TBD (no publicado) |
| Evidence micro-F1 | TBD (no publicado) |
| Metricas de test | No incluidas en la model card |

## Requisitos de hardware

- VRAM estimada para inferencia: el base de 0,5 B en fp16 ocupa aproximadamente 1 GB de pesos; en cuantización de 8 bits, alrededor de 0,5 GB; en 4 bits, alrededor de 0,3 GB. A ello hay que sumar el adaptador LoRA (8,8 M de parámetros, decenas de MB) y la memoria de activaciones y KV cache para secuencias de hasta 640 tokens, que es modesta.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema. El modelo también puede ejecutarse en CPU con latencia aceptable para lotes pequeños.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1660 en adelante, con cuantización).
- Opciones de despliegue: transformers con peft para cargar el adaptador, llama.cpp u Ollama si se fusiona el adaptador con el base y se convierte a GGUF, vLLM y TGI para servir el modelo fusionado. El adaptador LoRA por sí solo requiere cargar primero el base y aplicar el adaptador con la librería peft.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto y latencias de decenas de milisegundos por token en GPU moderna, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CriterionLens (este) | 0,5 B base + 8,8 M LoRA | 640 tokens en entrenamiento | Criterion screening clínico | Apache 2.0 | Hugging Face (repo de 0.0 GB) |
| Qwen2.5-0.5B-Instruct (base) | 0,5 B | No especificado en esta ficha | Instrucciones generales | Apache 2.0 | Hugging Face |
| TrialGPT (referencia del dataset) | No disponible | No disponible | Criterion screening | No disponible | No disponible en la información |
| Otros adaptadores LoRA sobre Qwen2.5-0.5B | Variable | Variable | Variable | Variable | Hugging Face |

La comparación cuantitativa con alternativas no puede realizarse porque no hay métricas publicadas para este adaptador ni datos de rendimiento de TrialGPT en la información disponible.

## Limitaciones y advertencias

- El autor declara explícitamente que es un prototipo de investigación y que no es un dispositivo médico; no debe usarse para decisiones clínicas.
- No hay métricas de validación ni de test publicadas: las casillas macro-F1 y micro-F1 figuran como TBD, por lo que se desconoce su calidad real.
- El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que los pesos del adaptador podrían no estar efectivamente disponibles o ser de tamaño despreciable; conviene verificar antes de depender de él.
- El entrenamiento se realizó sobre solo 37 pacientes y 602 anotaciones, una muestra muy pequeña que limita la generalización a otras instituciones, especialidades o formatos de nota clínica.
- La longitud de secuencia de entrenamiento es de 640 tokens, insuficiente para notas clínicas largas o criterios extensos; el truncamiento puede eliminar evidencia relevante.
- No se especifican los idiomas soportados; el base Qwen2.5 es multilingüe, pero el ajuste se hizo sobre anotaciones en inglés (dataset ncbi), por lo que el rendimiento en castellano es incierto.
- Riesgo de alucinación inherente a los modelos generativos de 0,5 B, especialmente en dominios especializados y con contextos largos.
- Sesgos potenciales derivados del dataset de anotaciones (selección de ensayos, población de pacientes y criterios de inclusión recogidos), no documentados por el autor.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero las restricciones éticas y regulatorias del ámbito clínico (MDR, FDA, RGPD) siguen aplicando y no quedan cubiertas por la licencia.
- No se documenta soporte de tool calling, agentes ni modos de razonamiento extendido; no debe asumirse que el adaptador los conserva tras el ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/Ashher123/criterion-lens-qwen2.5-0.5b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/ncbi/TrialGPT-Criterion-Annotations
- Librería PEFT: https://github.com/huggingface/peft
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
