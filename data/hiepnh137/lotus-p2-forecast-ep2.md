# hiepnh137/lotus-p2-forecast-ep2

## Resumen

LOTUS Phase 2 + forecasting supervision (epoch 2) es un checkpoint intermedio de investigación del modelo LOTUS, construido sobre el backbone de lenguaje Gemma 3 270M de Google. Lo publica el usuario hiepnh137 en Hugging Face y está orientado a tareas de series temporales: clasificación con cadena de pensamiento (CoT) sobre datasets como HAR, Sleep-EDF, ECG-QA y PAMAP2, respuesta a preguntas temporales (TimeMQA) y predicción del siguiente parche (next-patch forecasting). No es un modelo de propósito general, sino un adaptador LoRA más un conjunto de módulos (encoder, proyectores, decoder) que se cargan junto al LLM base.

El modelo parte de un warm start desde el checkpoint de fase 1 (`joint_phase1_extend_balanced_freq`) y entrena durante 5 épocas; este repositorio contiene la instantánea de final de la época 2 con semilla 1. La arquitectura combina un encoder de series temporales con parches de tamaño 32, codificación posicional seno-coseno (`pe_base_c=10`) y embeddings de frecuencia basados en rFFT, conectados mediante proyectores a un Gemma 3 270M adaptado con LoRA de rango 4.

Su relevancia es acotada: se trata de un artefacto de investigación, no de un lanzamiento final, y el propio autor advierte que bajo el prompt de texto libre de TSRBench el checkpoint habitualmente no emite respuesta, por lo que requiere puntuación por verosimilitud de opciones para evaluarse. Resulta útil para quien reproduzca el pipeline LOTUS o investigue el entrenamiento conjunto de tareas CoT y forecasting sobre series temporales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de series temporales con parches + proyectores + decoder sobre backbone LLM Gemma 3 270M, con adaptadores LoRA (r=4, alpha=8) |
| Parametros totales | No disponible (el backbone Gemma 3 270M tiene 270M; el checkpoint añade encoder, proyectores, decoder y LoRA, sin cifra total publicada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (checkpoint en PyTorch, no se documentan cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`.pt`), diccionario con `encoder_state`, `projector_state`, `decoder_state`, `decoder_projector_state`, `mse_projector_state`, `lora_state`, `lora_config`, `llm_input_embeddings`, `encoder_geometry`, `optimizer_state`, `scheduler_state` y `epoch` |

## Arquitectura y entrenamiento

El modelo sigue el diseño `OpenTSLMSPFixPos2D` del repositorio LOTUS. Las series temporales se tokenizan en parches de tamaño 32, se codifican posicionalmente con seno-coseno (`pe_base_c=10`) y se enriquecen con un embedding de frecuencia calculado sobre la rFFT con proyección lineal. Un encoder procesa estas representaciones, que se proyectan al espacio de entrada del LLM mediante proyectores dedicados; la salida del LLM pasa por un decoder y un proyector de decoder, y existe además un proyector MSE específico para la tarea de forecasting. El vocabulario de embeddings de entrada del LLM se redimensiona (`llm_input_embeddings`).

El entrenamiento parte del checkpoint de fase 1 LOTUS (`joint_phase1_extend_balanced_freq`) y cubre 5 épocas, de las que este repositorio es la época 2 (semilla 1). Cada época usa 240.000 muestras: 40.000 por cada una de las tareas HAR CoT, Sleep-EDF CoT, ECG-QA CoT, PAMAP2 CoT y TimeMQA, más 40.000 de forecasting del siguiente parche sobre el corpus univariante Chronos de fase 1 con ventanas aleatorias. La función de pérdida combina 1.0 × entropía cruzada para las tareas CoT y 1.0 × MSE para el siguiente parche, y los gradientes de forecasting también fluyen hacia los pesos LoRA (`detach_llm_for_mse=False`). El ajuste se hizo con 4 GPUs, batch size 1 y acumulación de gradiente 32.

## Capacidades

- Clasificación de series temporales con cadena de pensamiento (CoT) sobre actividades humanas (HAR), sueño (Sleep-EDF), electrocardiograma con preguntas (ECG-QA) y actividad física (PAMAP2).
- Respuesta a preguntas sobre series temporales (TimeMQA).
- Predicción del siguiente parche (next-patch forecasting) sobre series univariantes del corpus Chronos.
- Razonamiento textual intermedio (CoT) generado por el backbone Gemma 3 270M antes de la respuesta.
- Integración de información frecuencial mediante embeddings rFFT.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se documentan idiomas).
- Capacidades especiales (visión, audio, modo thinking): no disponibles.

## Casos de uso

- Monitorización de actividad humana (HAR): el modelo clasifica secuencias de sensores inerciales en actividades concretas y genera una cadena de razonamiento intermedia; encaja en pipelines de análisis de datos de wearables donde se requiere trazabilidad del razonamiento.
- Análisis de estudios de sueño (Sleep-EDF): clasificación de fases del sueño a partir de señales EEG/EOG con justificación textual, útil para prototipos de herramientas de apoyo al diagnóstico del sueño.
- Preguntas sobre electrocardiogramas (ECG-QA): responder consultas en lenguaje natural sobre segmentos de ECG, por ejemplo para asistentes clínicos de investigación que necesitan explicar la señal.
- Análisis de actividad física con PAMAP2: segmentación y clasificación de actividades a partir de sensores corporales, aplicable a aplicaciones de seguimiento deportivo o rehabilitación.
- Consultas temporales (TimeMQA): responder preguntas sobre tendencias, picos y patrones en series temporales, útil en paneles analíticos donde el usuario pregunta en lenguaje natural.
- Predicción de la siguiente ventana (forecasting): extrapolación de series univariantes en escenarios de planificación de demanda o monitorización de métricas, usando el proyector MSE entrenado específicamente.
- Investigación y reproducción del pipeline LOTUS: servir como punto de control intermedio para estudiar el efecto del entrenamiento conjunto de CoT y forecasting sobre el backbone Gemma 3 270M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor advierte además que, bajo el prompt de texto libre de TSRBench, este checkpoint habitualmente no emite respuesta y requiere puntuación por verosimilitud de opciones para su evaluación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 0,4 GB y el backbone es Gemma 3 270M, por lo que la inferencia en precisión completa debería caber en GPUs de consumo con holgura, aunque no se publica una cifra verificada.
- GPU recomendadas: no disponibles; el entrenamiento se realizó con 4 GPUs (modelo no especificado), batch size 1 y acumulación de gradiente 32.
- GPU de consumo: previsiblemente compatible con tarjetas de 8 GB o menos dada la escala del backbone y el tamaño del repositorio, si bien no hay confirmación oficial.
- Opciones de despliegue: el autor indica cargar el checkpoint con `evaluation/cot/eval_cot_phase2.py::load_model` del repositorio LOTUS usando `--use_freq_embed --pe_base_c 10`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que es un checkpoint PyTorch con módulos personalizados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LOTUS Phase 2 + forecasting (ep. 2) | No disponible (backbone 270M + modulos) | No disponible | Series temporales CoT + forecasting | No disponible | Hugging Face (hiepnh137/lotus-p2-forecast-ep2) |
| LOTUS Phase 1 (`joint_phase1_extend_balanced_freq`) | No disponible (mismo backbone) | No disponible | Series temporales CoT | No disponible | Checkpoint referenciado por el autor, disponibilidad publica no confirmada |
| Gemma 3 270M (modelo base) | 270M | No disponible en la informacion proporcionada | Lenguaje general | No disponible en la informacion proporcionada | Hugging Face (google/gemma-3-270m) |

## Limitaciones y advertencias

- Checkpoint intermedio de investigación: el autor lo describe explícitamente como no definitivo, correspondiente a la época 2 de 5.
- Problema de formato en TSRBench: con el prompt de texto libre liberado, el modelo habitualmente no emite respuesta; es necesario puntuar por verosimilitud de opciones.
- Dependencia del repositorio LOTUS: la carga requiere código externo (`eval_cot_phase2.py`) y flags concretos (`--use_freq_embed --pe_base_c 10`); no es un modelo autónomo.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no evaluado en la información proporcionada; al apoyarse en un LLM de 270M, la generación de CoT puede contener razonamientos incorrectos pese a una clasificación final correcta.
- Limitaciones de contexto e idioma: no documentadas.
- Licencia no especificada: no se puede confirmar el uso comercial; debe verificarse antes de cualquier despliegue en producción.
- Sin métricas publicadas: no hay benchmarks ni cifras de latencia o throughput que permitan avalar su rendimiento frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/hiepnh137/lotus-p2-forecast-ep2
- Modelo base: https://huggingface.co/google/gemma-3-270m
- Repositorio LOTUS (referenciado en la model card, sin URL directa en la información disponible): no disponible
