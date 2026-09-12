# Brunosil22/Orena_SEGMENT_Track_Qwen3_VL_8B_finetuned

## Resumen

Orena_SEGMENT_Track_Qwen3_VL_8B_finetuned es un adaptador LoRA (PEFT) sobre el modelo multimodal Qwen/Qwen3-VL-8B-Instruct, publicado por el usuario Brunosil22 bajo el identificador ICVS-2Ai ORena FOCUS — SEGMENT. Su proposito concreto es responder preguntas sobre video quirurgico corto (medical-video-vqa), es decir, tareas de visual question answering sobre grabaciones de cirugia, combinando el backbone vision-language de Qwen3-VL con un ajuste fino especifico de dominio. El repositorio pesa 0,2 GB y contiene exclusivamente los pesos del adaptador, no el modelo completo.

El interes practico del proyecto no esta en el adaptador en si, sino en el pipeline de inferencia que lo acompaná: el script de entrada decodifica el video a 2 fps, selecciona uniformemente 32 fotogramas con marca temporal a 768 px de resolucion, genera una respuesta gruesa y despues reejecuta localmente, en una ventana temporal W3, aquellas preguntas cuyo timestamp es parseable. Se trata de un enfoque de dos etapas (respuesta global mas refinamiento temporal) orientado a mejorar la precision sobre eventos localizados en el tiempo.

Es relevante ahora porque ejemplifica una tendencia clara en IA open source: adaptadores pequenos y de bajo coste sobre modelos base potentes, acompanados de codigo de inferencia especifico para un benchmark o reto concreto. En este caso la supervision adicional es minima (el autor indica que no se usaron anotaciones adicionales) y el valor anadido esta repartido entre el ajuste LoRA y la ingenieria del pipeline temporal. El modelo no tiene descargas ni likes y no presenta resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3-VL-8B-Instruct, transformer multimodal vision-language |
| Parametros totales | No disponible; el modelo base se denomina 8B y el adaptador distribuido ocupa 0,2 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en el repositorio; al ser PEFT hereda las opciones del modelo base |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT, `adapter_step_01800/`) |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct |
| Libreria | peft |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 0,2 GB |
| Autor | Brunosil22 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-12 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-VL-8B-Instruct, un transformer multimodal capaz de procesar imagenes y texto y de generar texto. Sobre el se aplica un ajuste fino con LoRA (Low-Rank Adaptation, empaquetado con PEFT) cuyo resultado final es el checkpoint `qwen_seg_vitaug`, paso 1800. El autor indica explicitamente que no se utilizaron anotaciones adicionales mas alla de las empleadas en ese entrenamiento, y no se documentan en el repositorio el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO. El repositorio tampoco detalla los hiperparametros del LoRA (rango, alpha, modulos objetivo).

La innovacion tecnica destacable no esta en el entrenamiento, sino en el pipeline de inferencia incluido (`inference.py`), que implementa una decodificacion en dos etapas: primero un muestreo uniforme de 32 fotogramas con timestamp a 768 px sobre un video decodificado a 2 fps, seguido de una respuesta gruesa; despues, una reejecucion local de las preguntas con timestamp parseable dentro de una ventana temporal W3 (controlada por `TEMPORAL_WINDOW_MULT=3`). Se incluye ademas `question_router.py`, un muestreador opcional sensible a timestamps que se conserva por reproducibilidad pero que no se activo en el envio seleccionado. El prompt exacto de entrenamiento e inferencia esta en `resources/system_prompt.txt`, lo que sugiere una fuerte dependencia del formato del prompt.

## Capacidades

- Respuesta a preguntas sobre video quirurgico corto (medical-video-vqa): interpretacion de fotogramas de cirugia y generacion de respuestas textuales sobre lo observado.
- Comprension de imagenes y texto en modo image-text-to-text, heredada del modelo base Qwen3-VL-8B-Instruct.
- Razonamiento temporal basico sobre eventos localizados: el pipeline puede refinar respuestas ligadas a un timestamp concreto mediante la reejecucion en ventana W3.
- Procesamiento de video por muestreo de fotogramas: decodificacion a 2 fps y seleccion uniforme de 32 fotogramas a 768 px de lado maximo.
- Generacion de texto en formato libre; no se documenta un esquema estructurado de salida.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (el modelo base podria ofrecerlo, pero el adaptador no lo documenta).
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas soportados.
- Modo thinking, vision adicional o audio: no documentados.

## Casos de uso

- Documentacion postoperatoria asistida: dado un video corto de una intervencion, el modelo puede generar una descripcion textual del procedimiento y de los eventos observados, que el cirujano revisa y completa. El muestreo a 2 fps y 32 fotogramas encaja con clips breves.
- Formacion de residentes en cirugia: uso del sistema para responder preguntas del tipo "que instrumento aparece en el minuto X" sobre grabaciones de entrenamiento, aprovechando el refinamiento temporal en ventana W3 para preguntas con timestamp.
- Indexacion y busqueda en archivos quirurgicos: generacion automatica de descripciones y etiquetas por fragmento de video que alimenten un buscador interno de casos, reduciendo el trabajo manual de catalogacion.
- Control de calidad de grabaciones: verificacion automatica de que una grabacion contiene las fases esperadas de un procedimiento, usando la respuesta gruesa de la primera etapa como filtro y el refinamiento temporal como comprobacion.
- Evaluacion comparativa de adaptadores medicos: el repositorio sirve como punto de partida reproducible para experimentar con LoRA sobre Qwen3-VL en tareas de video-VQA quirurgico, reutilizando `inference.py` y el prompt de `resources/system_prompt.txt`.
- Investigacion en VQA temporal: banco de pruebas para estudiar como afecta el numero de fotogramas, la resolucion (768 px) y el factor de ventana temporal (`TEMPORAL_WINDOW_MULT`) a la precision en preguntas con marca temporal.
- Prototipos de asistencia intraoperatoria en entorno de investigacion (nunca como dispositivo medico): consulta de un segundo modelo sobre el fotograma actual, con supervision humana obligatoria y sin valor clinico regulatorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas del reto, comparaciones con la linea base ni resultados de validacion, y el modelo registra 0 descargas y 0 likes en el momento de la consulta.

## Requisitos de hardware

- Espacio en disco: 0,2 GB para el adaptador LoRA; hay que anadir el peso completo del modelo base Qwen3-VL-8B-Instruct para poder fusionarlo o cargarlo.
- VRAM en fp16 (adaptador fusionado con el modelo base): aproximadamente 16 GB solo para los pesos, mas cache KV y los tensores de los 32 fotogramas a 768 px; en la practica se recomienda una GPU de 24 GB o mas (RTX 3090, RTX 4090, A10G 24 GB, L4 24 GB, A100 40/80 GB, H100).
- VRAM con cuantizacion: alrededor de 8-10 GB en 8 bits y 5-7 GB en 4 bits de forma estimada, lo que permitiria ejecutarlo en GPUs de consumo como RTX 3060 12 GB, RTX 4070 o RTX 4080. Estas cifras son estimaciones para un modelo de 8B y no estan confirmadas en el repositorio.
- Opciones de despliegue: PEFT + transformers es el camino documentado (carga del adaptador o fusion con el modelo base). vLLM, TGI, llama.cpp u Ollama no se mencionan en la informacion disponible; la conversion a GGUF de un modelo vision-language de este tipo no esta documentada aqui.
- Latencia y throughput: no disponibles. Como referencia cualitativa, el pipeline hace dos pasadas de inferencia sobre el video (respuesta gruesa mas refinamiento temporal) con 32 fotogramas de entrada, por lo que el coste es sensiblemente superior al de una unica generacion de texto.
- Variables de entorno relevantes del runtime publicado: `MODEL_DIR`, `TWO_STAGE_TEMPORAL=1`, `TEMPORAL_WINDOW_MULT=3`, `IMAGE_MAX_SIDE=768`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Orena_SEGMENT_Track_Qwen3_VL_8B_finetuned | No disponible (adaptador de 0,2 GB sobre base de 8B) | No disponible | safetensors (LoRA) | apache-2.0 | Repositorio HuggingFace con 0 descargas |
| Qwen/Qwen3-VL-8B-Instruct (modelo base) | 8B (segun denominacion) | No disponible en la informacion proporcionada | safetensors | No disponible en la informacion proporcionada | Modelo publico de Qwen |
| Otros adaptadores de video-VQA quirurgico | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la informacion disponible |

## Limitaciones y advertencias

- Ausencia total de validacion externa: 0 descargas y 0 likes, sin resultados de benchmarks ni informe de evaluacion en el repositorio.
- Riesgo de alucinacion especialmente critico: cualquier respuesta sobre un procedimiento quirurgico que no sea verificable por un profesional puede inducir a error. El modelo no es un dispositivo medico y no consta certificacion regulatoria alguna.
- Dependencia fuerte del pipeline: los resultados dependen de parametros de inferencia concretos (2 fps, 32 fotogramas, 768 px, dos etapas, ventana W3) y del prompt exacto de `resources/system_prompt.txt`; usarlo fuera de esa configuracion invalida cualquier resultado previo.
- Cobertura temporal limitada: al seleccionar uniformemente 32 fotogramas, en videos largos el muestreo es muy disperso y pueden perderse eventos breves.
- Dominio restringido a video quirurgico corto; el comportamiento fuera de ese ambito no esta caracterizado y probablemente degrade hacia el del modelo base.
- Idiomas soportados no declarados: se desconoce el comportamiento en castellano y en otros idiomas distintos del usado en el entrenamiento.
- Supervision limitada: el autor indica que no se utilizaron anotaciones adicionales, lo que reduce el sesgo de anotacion pero tambien el volumen de senal especifica de dominio.
- Licencia apache-2.0 para el adaptador, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento antes de un despliegue en produccion.
- Sesgos conocidos: no documentados en la informacion disponible; cabe esperar los sesgos del modelo base y los derivados de la distribucion de los videos quirurgicos empleados en el ajuste.
- `question_router.py` no estaba activo en el envio seleccionado, por lo que su contribucion al rendimiento final es nula y no debe asumirse que mejore los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Brunosil22/Orena_SEGMENT_Track_Qwen3_VL_8B_finetuned
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Busqueda web: no se han encontrado enlaces relevantes al modelo, al paper ni a recursos adicionales; los resultados devueltos no guardan relacion con la ficha.
