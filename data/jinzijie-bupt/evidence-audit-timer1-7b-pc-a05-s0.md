# jinzijie-bupt/evidence-audit-timer1-7b-pc-a05-s0

## Resumen

`evidence-audit-timer1-7b-pc-a05-s0` es un adaptador LoRA para el modelo `Boshenxx/Time-R1-7B`, publicado por el usuario jinzijie-bupt. No es un modelo completo, sino un ajuste fino ligero (0,2 GB en el repositorio) orientado a una tarea muy concreta: el anclaje temporal de vídeo (*video temporal grounding*) con un objetivo de entrenamiento que el autor denomina "placebo-controlled". El adaptador acompaña al artículo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (Jin et al., 2026) y sirve como artefacto reproducible de los experimentos descritos en él.

El modelo base, Time-R1-7B, es un modelo multimodal de 7.000 millones de parámetros construido sobre la familia Qwen2.5-VL (la clase de carga utilizada en el ejemplo es `Qwen2_5_VLForConditionalGeneration`), por lo que hereda su arquitectura transformer con torre visual y su capacidad de procesar vídeo muestreado a 2 fps con un máximo de 768 fotogramas. El adaptador no altera esa arquitectura: solo añade matrices de bajo rango sobre las proyecciones de atención (q/k/v/o) y del MLP (gate/up/down).

La relevancia del artefacto es metodológica más que de rendimiento bruto. El objetivo de entrenamiento busca que el modelo dependa de la evidencia visual real y no de atajos, penalizando que la respuesta anotada siga siendo probable cuando el evento se manipula (intercambio, enmascarado, desenfoque, desplazamiento temporal o barajado) y exigiendo que un cambio "placebo" fuera del evento apenas afecte a la predicción. Es un recurso para investigadores que estudien robustez y fidelidad de la evidencia en modelos de vídeo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal Qwen2.5-VL (modelo base Time-R1-7B) |
| Parámetros totales | No disponible (el adaptador LoRA ocupa 0,2 GB; el modelo base es de 7B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Time-R1-7B, un modelo de visión-lenguaje de 7B parámetros cuya clase de carga en Transformers es la de Qwen2.5-VL. El LoRA tiene rango r=16, alpha=32 y dropout de 0,05, y se inserta en las proyecciones q/k/v/o de atención y en gate/up/down del MLP. La entrada de vídeo se muestrea a 2 fps con un máximo de 768 fotogramas y se usa la plantilla de prompt `timer1_default`.

El entrenamiento sigue el objetivo "placebo-controlled" descrito en la sección 4 del artículo. Se parte de 2.400 pares del split de entrenamiento de Charades-STA y se aplican operadores de edición (*swap*, *mask*, *blur*, *tshift*, *shuffle*, dos por ejemplo). La función de pérdida conserva la verosimilitud de la respuesta ponderada por α=0,5 y añade dos márgenes por operador: la respuesta anotada debe ser más probable en el vídeo limpio y en un vídeo con edición placebo fuera del evento que en el vídeo con el evento editado. Un término hinge (β=0,1) limita la caída bajo la edición placebo a 1,25 veces la caída de referencia más 0,10. Se usan pesos por operador con Group-DRO, optimizador con 300 pasos, acumulación de gradiente de 8, learning rate de 5e-6 y semilla 0. El script de entrenamiento es `code/27_papo_train_qcdro_v3seln_r5.py`.

Una advertencia técnica relevante del autor: los adaptadores guardados con Transformers 4.51 y con la serie 5 usan nombres de módulo distintos, y cargar uno con la versión equivocada no da error pero deja los pesos LoRA sin usar. Se recomienda Transformers 5.x (probado con 5.12.1) y PEFT 0.19.1 o superior; el repositorio incluye `tools/check_lora_keys.py` para verificar que el adaptador se ha cargado de verdad.

## Capacidades

- Anclaje temporal de vídeo: localización de intervalos temporales correspondientes a una consulta textual en un vídeo (tarea Charades-STA).
- Razonamiento sobre evidencia visual: el objetivo de entrenamiento está diseñado para que la predicción dependa del contenido del evento y no de correlaciones espurias.
- Procesamiento de vídeo multimodal: muestreo a 2 fps con hasta 768 fotogramas por entrada.
- Robustez frente a ediciones del vídeo: entrenado explícitamente con perturbaciones (intercambio, enmascarado, desenfoque, desplazamiento y barajado de fotogramas).
- Capacidades heredadas del modelo base Time-R1-7B (Qwen2.5-VL): comprensión de imagen y vídeo, generación de texto; el alcance exacto no está detallado en la información disponible.
- Soporte de *tool calling*, agentes o *thinking mode*: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación de fidelidad de la evidencia en investigación: usar el adaptador como referencia entrenada con el objetivo placebo-controlled para comparar cuánto depende un modelo de la evidencia visual real frente a atajos, empleando los scripts de auditoría del repositorio de código.
- Reproducción de experimentos del artículo: cargar el adaptador con `--model Boshenxx/Time-R1-7B --adapter <este repositorio>` para regenerar las tablas y figuras (3, 6, 7, 10, 13, 14, 18, 21 y 24; figuras 1, 4 y 5) del paper.
- Análisis de robustez ante perturbaciones: alimentar vídeos con ediciones controladas (mask, blur, shuffle) y medir la caída de precisión respecto a la edición placebo para caracterizar la sensibilidad del modelo.
- Búsqueda y recuperación de momentos en vídeo: localizar el intervalo de un evento descrito en texto sobre grabaciones de actividades cotidianas, útil en indexación de archivos audiovisuales.
- Estudio de sesgos de atajo en modelos de vídeo: comparar el comportamiento de este adaptador con el del modelo base sin ajustar para cuantificar el efecto del objetivo de entrenamiento.
- Docencia y formación en evaluación de modelos multimodales: ejemplo reproducible de cómo diseñar un objetivo de entrenamiento que penalice la dependencia de correlaciones espurias en tareas de grounding.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a las tablas y figuras del artículo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, pero no incluye cifras numéricas en el texto proporcionado.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0,2 GB; los requisitos reales vienen determinados por el modelo base Time-R1-7B.
- VRAM estimada para el modelo base en bfloat16: en torno a 14-16 GB solo para pesos, más memoria para la torre visual, el procesador y el caché de vídeo (hasta 768 fotogramas a 2 fps), por lo que conviene prever margen adicional.
- GPU recomendadas: A100, H100 o L40S para evaluación por lotes; una RTX 4090 (24 GB) o RTX 3090 (24 GB) es plausible para inferencia en bfloat16 con un único vídeo, aunque no confirmado en la información disponible.
- Cuantización: no se documentan opciones GGUF ni cuantizaciones de 4/8 bits para este adaptador; el ejemplo oficial usa `torch_dtype=torch.bfloat16` y `device_map="auto"`.
- Despliegue: el flujo documentado es Transformers 5.x con PEFT; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-timer1-7b-pc-a05-s0 (este) | Adaptador LoRA sobre 7B | No disponible | Video temporal grounding con objetivo placebo-controlled | Apache 2.0 | Hugging Face (PEFT) |
| Boshenxx/Time-R1-7B (base) | 7B | No disponible | Visión-lenguaje y grounding temporal | No disponible en la información proporcionada | Hugging Face |
| Alternativas de grounding temporal de 7B | No disponible | No disponible | Video temporal grounding | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere descargar y cargar Time-R1-7B como base.
- Incompatibilidad silenciosa entre versiones de Transformers: cargar el adaptador con la versión equivocada no lanza error pero deja los pesos LoRA sin aplicar; verificar con `tools/check_lora_keys.py`.
- Entrenado únicamente sobre 2.400 pares de Charades-STA: el dominio se limita a vídeos de actividades cotidianas y a la tarea de anclaje temporal; no se debe esperar generalización a otros dominios sin validación.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo generativo multimodal, persiste el riesgo de respuestas plausibles no sustentadas en el vídeo.
- Sesgos: no documentados; el conjunto Charades-STA tiene una distribución demográfica y de escenarios concreta que puede introducir sesgos.
- Idiomas soportados: no especificados; la plantilla de prompt `timer1_default` y los datos de entrenamiento condicionan el comportamiento lingüístico.
- Licencia Apache 2.0 para el adaptador, pero el uso comercial depende también de la licencia del modelo base Time-R1-7B, no indicada en la información disponible.
- Artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.
- No se documentan requisitos de contexto, cuantizaciones ni latencias, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/jinzijie-bupt/evidence-audit-timer1-7b-pc-a05-s0
- Modelo base: https://huggingface.co/Boshenxx/Time-R1-7B
- Repositorio de código, datos y scripts de evaluación: https://github.com/jinzijie-bupt/Accuracy-Is-Not-Evidence
- Artículo: Jin, Zijie; Zhao, Shuai; Tao, Haoran; Huang, Chaomin; Luo, Liwen. *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*. arXiv preprint, 2026 (sin enlace directo en la información disponible).
