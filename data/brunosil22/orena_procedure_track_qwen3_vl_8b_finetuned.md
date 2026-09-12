# Brunosil22/Orena_PROCEDURE_Track_Qwen3_VL_8B_finetuned

## Resumen

Este repositorio contiene un conjunto de adaptadores LoRA (PEFT) entrenados sobre Qwen3-VL-8B-Instruct para responder preguntas sobre vídeo quirúrgico de procedimiento completo. Lo publica el usuario Brunosil22 dentro del contexto del sistema ICVS-2Ai ORena FOCUS, pista PROCEDURE, orientada a VQA quirúrgica de vídeo íntegro. No es un modelo completo: el repositorio (0,6 GB) incluye únicamente adaptadores en safetensors, scripts de inferencia y enrutado de preguntas, y un prompt de sistema.

El sistema es de dos etapas. La etapa 1 fusiona primero el adaptador SEGMENT (`segment_base_adapter_step_01800`) y después el adaptador PROCEDURE (`warm2_adapter_step_00800`) sobre el modelo base; la etapa 2 añade un refinador temporal (`stage2_adapter`) que solo se activa para preguntas temporales, mientras que el resto de preguntas se responden únicamente con la etapa 1. No se utilizaron anotaciones adicionales más allá de las del reto.

Su relevancia actual radica en que aborda una tarea exigente (razonamiento temporal sobre vídeo quirúrgico de 128 fotogramas a 768 px, con preguntas de marca temporal) mediante adaptadores de bajo coste sobre un VLM de 8B, lo que reduce drásticamente los recursos necesarios frente al ajuste completo. El repositorio tiene 0 descargas y 1 like, y no publica resultados de benchmarks ni detalles de composición del dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre el transformer vision-lenguaje Qwen3-VL-8B-Instruct; sistema de inferencia en dos etapas con refinador temporal |
| Parámetros totales | 8B en el modelo base; los adaptadores del repo suman 0,6 GB. Número exacto de parámetros entrenables: no disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; heredada del modelo base |
| Tipos de cuantización | No disponible. El repositorio distribuye los adaptadores en safetensors; no se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible en la información proporcionada. El prompt de sistema y la configuración de entrenamiento están en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct |
| Pipeline | image-text-to-text |
| Librería | peft |
| Tamaño del repositorio | 0,6 GB |
| Fecha de creación / actualización | 2026-09-12 / 2026-09-12 |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

El modelo base es Qwen3-VL-8B-Instruct, un transformer vision-lenguaje de 8B parámetros. Sobre él se aplican tres adaptadores LoRA que se fusionan de forma secuencial: primero `segment_base_adapter_step_01800` (inicialización SEGMENT) y después `warm2_adapter_step_00800` (etapa 1 de PROCEDURE). El tercero, `stage2_adapter`, no se fusiona: se acopla en tiempo de inferencia y actúa como refinador temporal solo para preguntas temporales. El prompt exacto de entrenamiento e inferencia se distribuye en `resources/system_prompt.txt`.

La innovación principal está en el pipeline de inferencia, no en la arquitectura. `question_router.py` clasifica las plantillas de marca temporal y decide el reparto de fotogramas: la etapa 1 enruta 64 o 128 fotogramas gruesos según la familia de pregunta a 768 px; las preguntas con marca temporal parseable reciben 128 fotogramas locales a 768 px extraídos de una ventana W3 calculada con una referencia gruesa de 64 fotogramas. `frame_sampler.py` permite filtrado opcional de fotogramas azules y keyframes, desactivado en la configuración enviada. La configuración de ejecución se controla con variables de entorno (`N_FRAMES`, `IMAGE_MAX_SIDE`, `TWO_STAGE_TEMPORAL`, `TEMPORAL_WINDOW_MULT`, etc.). No se especifican número de tokens de entrenamiento, composición del dataset, ni uso de RLHF o DPO.

## Capacidades

- Respuesta a preguntas visuales (VQA) sobre vídeo quirúrgico de procedimiento completo, no solo sobre fotogramas aislados.
- Manejo de preguntas temporales con marcas de tiempo, mediante enrutado específico y refinador de etapa 2.
- Enrutado automático por familia de pregunta para asignar 64 o 128 fotogramas gruesos (`question_router.py`).
- Muestreo de fotogramas a 768 px, con soporte opcional de filtrado de fotogramas azules y keyframes.
- Ventana temporal local ampliada (multiplicador de ventana 3) para preguntas con timestamp parseable.
- Entrada multimodal imagen-texto (pipeline `image-text-to-text`), con secuencias largas de fotogramas (hasta 128 por consulta).
- Tool calling / function calling: no disponible en la información proporcionada.
- Comportamiento como agente o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas en la ficha.
- Modo de razonamiento explícito (thinking), audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Documentación automática de cirugías: el sistema puede generar descripciones estructuradas de un procedimiento completo a partir del vídeo, ya que procesa hasta 128 fotogramas por consulta con contexto temporal y responde sobre fases del procedimiento.
- Formación de residentes de cirugía: permite formular preguntas del tipo "¿en qué momento se realizó la anastomosis?" o "¿qué instrumento se usó en esta fase?" y obtener respuestas ancladas a marcas temporales del vídeo.
- Auditoría y control de calidad de procedimientos: el enrutado por familia de pregunta y la verificación de pasos permiten comprobar de forma automatizada si se completaron los hitos esperados de una intervención.
- Indexación y búsqueda de archivos quirúrgicos: la capacidad de localizar eventos con timestamp convierte el vídeo en material buscable dentro de un archivo hospitalario o de un repositorio de investigación.
- Investigación en VQA médica: sirve como punto de partida reproducible para participar en retos tipo ORena FOCUS, ya que incluye scripts de inferencia, enrutado y muestreo listos para ejecutar.
- Revisión retrospectiva de complicaciones: el refinador temporal de la etapa 2 permite analizar la secuencia de eventos alrededor de un instante concreto para estudiar desviaciones del protocolo.
- Asistencia intraoperatoria en tiempo real: solo con cautela y siempre como herramienta de apoyo; el modelo no está validado clínicamente y requiere latencia y hardware que no se documentan.
- Generación de resúmenes post-operatorios para el historial clínico: útil como borrador que un profesional revisa, dado que el modelo puede describir fases e instrumentos observados en el vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del repositorio describe la configuración de inferencia enviada al reto (128 fotogramas, 768 px, dos etapas, enrutado activo), pero no incluye métricas de precisión, exactitud temporal ni comparación con otros sistemas.

## Requisitos de hardware

- VRAM estimada para los pesos en precisión completa (bf16/fp16): en torno a 16-18 GB solo para los 8B parámetros del modelo base, más el codificador de visión, activaciones y caché KV.
- El coste de contexto es alto: 128 fotogramas a 768 px generan del orden de decenas de miles de tokens de visión por consulta, por lo que la memoria de activaciones y caché puede superar la de los pesos. Estimación orientativa, no confirmada por el autor.
- GPU recomendadas (estimación, no documentada por el autor): A100 40/80 GB, H100, L40S o A6000 para la configuración completa de 128 fotogramas a 768 px. Una RTX 4090 de 24 GB puede quedarse justa y probablemente exija reducir `N_FRAMES` o `IMAGE_MAX_SIDE`.
- En cuantización de 8 bits cabría en torno a 10-12 GB, y en 4 bits en torno a 6-8 GB, aunque no se publican adaptadores cuantizados y la ruta soportada es PEFT sobre el modelo base.
- Opciones de despliegue: transformers + PEFT es el camino soportado (los adaptadores deben fusionarse en orden con el script del autor); vLLM con soporte de LoRA podría servir para servir el modelo, pero no está documentado. No hay ruta GGUF/llama.cpp ni Ollama para esta combinación.
- Punto de entrada: `inference.py`, con la configuración de variables de entorno indicada en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-8B-Instruct (base) | 8B | No disponible | No disponible | apache-2.0 | Público en HuggingFace |
| Este modelo (adaptadores LoRA sobre el base) | 8B + adaptadores (~0,6 GB) | No disponible | Sin benchmarks publicados | apache-2.0 | HuggingFace, 0 descargas, 1 like |
| Otros VLM médicos de propósito similar (por ejemplo, variantes de LLaVA-Med o Med-Flamingo) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos verificables de parámetros, contexto, rendimiento o licencia de alternativas comparables dentro del reto ORena FOCUS ni de otros sistemas de VQA quirúrgica de vídeo completo.

## Limitaciones y advertencias

- No es un producto sanitario ni está validado clínicamente: no debe usarse para diagnóstico, decisión terapéutica ni sustitución del criterio profesional.
- Riesgo de alucinación relevante en un dominio crítico: el modelo puede describir instrumentos, fases anatómicas o instantes que no aparecen en el vídeo, especialmente en preguntas temporales ambiguas.
- Dependencia fuerte del pipeline: el rendimiento depende del enrutado de preguntas, del número de fotogramas y de la resolución. Cambiar `N_FRAMES`, `IMAGE_MAX_SIDE` o desactivar `TWO_STAGE_TEMPORAL` puede degradar los resultados sin aviso.
- El refinador temporal (etapa 2) solo se aplica a preguntas temporales; el resto se responde con la etapa 1, lo que implica capacidades desiguales según el tipo de pregunta.
- El filtrado de fotogramas azules y keyframes está desactivado en la configuración seleccionada, por lo que el sistema procesa también fotogramas poco informativos.
- Idiomas no declarados: el prompt de sistema y el entrenamiento están en inglés; no hay evidencia de generalización a consultas en castellano.
- Validación externa mínima: 0 descargas y 1 like en el momento de redactar esta ficha, sin resultados de benchmarks publicados.
- Licencia apache-2.0 para el repositorio, pero el uso comercial queda condicionado por la licencia y los términos del modelo base (Qwen3-VL-8B-Instruct) y por los derechos sobre los datos de entrenamiento y los vídeos utilizados, que no se detallan.
- Privacidad y cumplimiento: los vídeos quirúrgicos contienen datos personales de pacientes; cualquier despliegue debe cumplir el RGPD y la normativa sanitaria aplicable.
- El repositorio solo contiene adaptadores; no es autónomo y obliga a descargar el modelo base y a fusionar los adaptadores en el orden correcto antes de ejecutar la inferencia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Brunosil22/Orena_PROCEDURE_Track_Qwen3_VL_8B_finetuned
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes (los resultados devueltos corresponden a páginas de un medio de prensa alemán y no guardan relación con el modelo). Paper, blog, repositorio o demo del reto ORena FOCUS / ICVS-2Ai: no disponibles en la información proporcionada.
