# ai-anytime/laya-medical-decision-model

## Resumen

laya-medical-decision-model es un modelo de decisión de tipo "System One" desarrollado por ai-anytime (AI Anytime) y afinado a partir de `convaiinnovations/laya`. No es un modelo generativo: dado un estado (texto o JSON) y una pregunta tipada con un conjunto cerrado de opciones, devuelve una probabilidad calibrada para cada opción en un único forward pass. Su tarea concreta es clasificar notas clínicas en una de 41 especialidades médicas.

El modelo resuelve un problema acotado pero crítico en entornos clínicos: enrutar documentos médicos a la especialidad correcta con probabilidades calibradas (ECE de 0.048 en test), de modo que el sistema pueda actuar con umbrales de confianza fiables. Frente a un LLM generativo, elimina el riesgo de respuestas fuera del conjunto de opciones y reduce el coste de inferencia a una sola pasada por un encoder de 395,8 M de parámetros.

La relevancia actual reside en su enfoque de entrenamiento: combina SFT de una cabeza de decisión tipada con RLCD (Reinforcement Learning for Calibrated Decisions), un objetivo de scoring propio (Brier + log-loss) anclado por KL contra la política SFT, más un término de consistencia ante el reordenamiento de opciones, y finalmente temperature scaling. El modelo se distribuye bajo licencia Apache 2.0 y se sirve con la librería `snapcall`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (base `convaiinnovations/laya`) con mean pooling y cabeza de decisión tipada (option-span pooling) |
| Parametros totales | 395,8 M (395,83 M entrenables) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (`max_length` de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Libreria | snapcall |
| Tamano del repo | 1,6 GB |
| Tarea | Decisión tipada (`choice`) sobre 41 especialidades médicas |

## Arquitectura y entrenamiento

El modelo parte de `convaiinnovations/laya`, un encoder transformer con mean pooling. Sobre esa base se añade una cabeza de decisión tipada que, mediante option-span pooling, produce una distribución de probabilidad sobre las opciones ofrecidas en la consulta. El modelo no genera texto: solo puede devolver una de las opciones proporcionadas, lo que acota estructuralmente la salida.

El entrenamiento se realizó con Snapcall v0.1.2 en dos fases. Primero, SFT completo (full fine-tuning) durante 3 épocas con learning rate 3e-5, batch size 16, scheduler coseno, warmup ratio 0,06, weight decay 0,01 y max_length 1024, con barajado del orden de las opciones. Después, RLCD durante 0,5 épocas con beta 0,1, peso de Brier 1,0 y peso de consistencia 0,5: un objetivo de scoring propio (Brier + log-loss) anclado por KL contra la política SFT, más un término que penaliza la inconsistencia ante el reordenamiento de opciones. Finalmente se aplicó temperature scaling sobre el split de validación, con temperatura post-hoc de 1,276. El conjunto de datos fue `galileo-ai/medical_transcription_40`, con splits de 4023/447/496 ejemplos (train/val/test) y un tiempo de entrenamiento de 12,5 minutos en CUDA.

## Capacidades

- Clasificación de notas clínicas en 41 especialidades médicas (entre ellas Cardiología/Neumología, Neurología, Oncología-Hematología, Radiología, Psiquiatría, Medicina General, Urgencias, Autopsia, etc.).
- Decisión tipada con conjunto cerrado de opciones: devuelve una probabilidad calibrada por opción y nunca una opción no ofrecida.
- Calibración de confianza: ECE de 0,048 en test con bins de 15, apta para umbrales operativos.
- Entrada de estado en texto o JSON (solo texto; no admite imágenes ni bounding boxes).
- Robustez al orden de opciones gracias al término de consistencia del RLCD y al barajado durante el SFT.
- Servicio mediante API compatible con System One (`/v1/systemone`) a través de `snapcall serve`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Enrutamiento automático de notas clínicas: dado el texto de una nota, el modelo devuelve la especialidad con probabilidad calibrada, permitiendo derivar el documento al departamento correcto y marcar para revisión humana los casos con confianza baja.
- Triaje documental en historiales electrónicos: clasificar lotes de transcripciones médicas por especialidad antes de indexarlas, usando el ECE bajo para fijar umbrales de auto-etiquetado frente a revisión manual.
- Preprocesado para pipelines RAG clínicos: etiquetar cada documento con su especialidad para enrutar consultas al subconjunto de índice adecuado y mejorar la precisión de la recuperación.
- Control de calidad y auditoría de codificación: detectar notas cuya especialidad declarada no coincide con la predicha por el modelo, señalando posibles errores de codificación o de derivación.
- Filtrado y priorización en servicios de transcripción médica: clasificar transcripciones entrantes por especialidad para asignarlas a transcriptores especializados o a colas de revisión.
- Señal auxiliar en sistemas de decisión clínica: usar la distribución de probabilidad sobre especialidades como feature de entrada en un modelo de downstream (por ejemplo, para estimar la complejidad de un caso).
- Despliegue ligero en entornos con recursos limitados: al ser un encoder de 395,8 M con una sola pasada, puede servirse en CPU o GPU modesta para volúmenes altos de clasificación.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Split | Accuracy | Macro F1 | ECE ↓ | Brier ↓ | NLL ↓ | N |
|---|---|---|---|---|---|---|
| validation | 0,6711 | 0,6503 | 0,0302 | 0,3501 | 0,7358 | 447 |
| test | 0,6431 | 0,5706 | 0,0480 | 0,3899 | 0,8546 | 496 |

Temperatura post-hoc aplicada: 1,276. ECE calculado con 15 bins.

No se han publicado en la información disponible resultados comparativos con otros modelos en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,6 GB de pesos (tamaño del repo), más overhead de activaciones; en fp16 rondaría los 0,8 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son más que suficientes. El cuello de botella no es la memoria sino el throughput.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `snapcall serve` (API compatible con System One en el puerto indicado); al ser un modelo de clasificación con safetensors, puede cargarse con Transformers y servirse con TGI o un servidor FastAPI propio. No se documenta soporte de GGUF/llama.cpp ni de vLLM.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento completo requirió 12,5 minutos en CUDA, lo que sugiere una inferencia muy rápida por ejemplo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. Como referencia estructural, se puede contrastar con:

| Modelo | Tipo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|---|
| laya-medical-decision-model | Encoder + cabeza de decisión | 395,8 M | 1024 | Clasificación de especialidad médica (41 clases) | Apache 2.0 |
| convaiinnovations/laya (base) | Encoder | no disponible | no disponible | Representaciones de texto | no disponible |
| LLM generativos con clasificación por prompt | Decoder | miles de millones | variable | Clasificación mediante generación | variable |

La comparación cuantitativa con alternativas no está disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre `medical-specialty` (dataset `galileo-ai/medical_transcription_40`); la calibración es válida en distribución, por lo que debe recalcularse el ECE sobre el tráfico propio antes de fijar umbrales en producción.
- Solo acepta estados de texto (o JSON textual); no procesa imágenes ni bounding boxes.
- La calidad de la decisión depende de las descripciones de las opciones: descripciones vagas producen decisiones vagas.
- No puede devolver opciones fuera del conjunto proporcionado, lo que limita su uso a tareas de clasificación cerrada.
- Accuracy en test de 0,6431 y macro F1 de 0,5706: el rendimiento es moderado y el desbalance entre clases afecta al F1 macro; conviene revisar el rendimiento por clase antes de usarlo en producción.
- No se documentan sesgos específicos, cobertura idiomática ni comportamiento fuera del dominio clínico.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías; en un contexto clínico, cualquier decisión automatizada debe ir acompañada de supervisión humana.
- Riesgo de alucinación estructuralmente bajo (salida restringida a opciones), pero riesgo de clasificación errónea con confianza alta si el texto de entrada se sale de la distribución de entrenamiento.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de los resultados declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-anytime/laya-medical-decision-model
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Snapcall (repositorio): https://github.com/AIAnytime/snapcall
- Canal de AI Anytime: https://www.youtube.com/@AIAnytime
- Dataset: https://huggingface.co/datasets/galileo-ai/medical_transcription_40
