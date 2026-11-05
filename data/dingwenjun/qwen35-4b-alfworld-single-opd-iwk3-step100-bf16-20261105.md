# dingwenjun/qwen35-4b-alfworld-single-opd-iwk3-step100-bf16-20261105

## Resumen

El modelo `qwen35-4b-alfworld-single-opd-iwk3-step100-bf16-20261105` es un checkpoint experimental publicado por el usuario dingwenjun en HuggingFace. Se trata de un ajuste fino del modelo base Qwen3.5-4B (arquitectura `Qwen3_5ForConditionalGeneration`) entrenado mediante aprendizaje por refuerzo (RL) sobre el entorno ALFWorld, un benchmark de tareas de manipulacion de texto en el que un agente debe completar objetivos en un mundo simulado. El checkpoint corresponde al paso 100 de entrenamiento y se ha exportado en BF16 safetensors tras fusionar cuatro shards FSDP.

El interes del modelo no reside en su calidad general, sino en su valor como artefacto de investigacion: documenta un experimento concreto de RL (metodo "Single OPD" con "stable IW-K3" y profesor congelado al 95%) sobre una tarea de agente. El autor reporta una evaluacion durante el entrenamiento del 83,6% sobre 140 tareas, aunque advierte explicitamente que se trata de una unica ejecucion muestreada y no de una comparacion pareada multi-semilla.

La relevancia es limitada para produccion: el propio autor indica que la publicacion es una verificacion de integridad de pesos, no un resultado nuevo de generacion o evaluacion. No incluye estados del optimizador ni trayectorias privadas, y el modelo esta pensado para reproducir o inspeccionar el experimento, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal image-text-to-text) |
| Parametros totales | 5.174.964.736 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (publicado en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura es `Qwen3_5ForConditionalGeneration`, la clase de generacion condicional de la familia Qwen3.5, con pipeline `image-text-to-text`. El autor conserva la configuracion original del checkpoint, el tokenizer y la plantilla de chat. Aunque el pipeline declarado es multimodal, el experimento concreto se realizo con interaccion exclusivamente textual sobre ALFWorld.

El entrenamiento consistio en 100 actualizaciones mediante aprendizaje por refuerzo (RL) usando el metodo "Single OPD" con "stable IW-K3" y un profesor congelado al 95%. El checkpoint final se obtuvo fusionando cuatro shards FSDP y exportandolo a BF16 safetensors. El autor verifico que cada tensor exportado coincidia con la reconstruccion BF16 de sus shards de origen. No se incluyen estados del optimizador ni trayectorias de entrenamiento. La evaluacion reportada (83,6% sobre 140 tareas) es una unica ejecucion muestreada durante el entrenamiento, sin comparacion pareada multi-semilla.

## Capacidades

- Generacion de texto y razonamiento dentro del entorno ALFWorld (tareas de manipulacion y navegacion descritas en lenguaje natural).
- Interaccion multi-turno como agente en un mundo simulado basado en texto.
- Capacidad multimodal declarada por la arquitectura base (`image-text-to-text`), aunque no validada en este experimento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: si, orientado especificamente a ALFWorld.
- Capacidades multilingues: no disponible.
- Capacidades especiales: no disponible.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para agentes: el checkpoint sirve como punto de partida o referencia para reproducir el experimento Single OPD con IW-K3 sobre ALFWorld y comparar curvas de aprendizaje.
- Analisis de estabilidad de entrenamiento RL: al ser un paso intermedio (step100) con profesor congelado, permite estudiar la dinamica de convergencia y el efecto del profesor al 95%.
- Verificacion de integridad de pesos: el autor documenta que cada tensor coincide con la reconstruccion BF16 de sus shards, util para auditar pipelines de fusion FSDP.
- Benchmark de agentes en entornos textuales: puede usarse como baseline ajustado para medir la dificultad de tareas ALFWorld en comparacion con el modelo base sin RL.
- Estudio de la brecha texto-multimodal: al conservar la arquitectura image-text-to-text pero entrenar solo con texto, permite analizar como afecta el ajuste textual a las capacidades multimodales latentes.
- Docencia y experimentacion: util en cursos o laboratorios sobre RL aplicado a agentes conversacionales, dado que el checkpoint es pequeno (5,17B parametros) y la licencia Apache 2.0 facilita su uso.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| ALFWorld (evaluacion durante entrenamiento) | 83,6% sobre 140 tareas | Unica ejecucion muestreada; no es comparacion pareada multi-semilla |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 10,4 GB solo para pesos (5,17B parametros x 2 bytes), mas overhead de activaciones y KV cache.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 5,2 GB; en 4 bits: aproximadamente 2,6 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40GB, H100 80GB para BF16 sin cuantizar con contexto amplio; RTX 4090 24GB o RTX 3090 24GB suficientes para BF16 en inferencia basica.
- Cabe en GPU de consumo: si, en tarjetas con 12-16 GB o mas en cuantizacion de 8/4 bits; en BF16 requiere al menos 16 GB.
- Opciones de despliegue: transformers (version que soporte Qwen3.5, entorno de origen 5.13.0) y dependencias de atencion de Qwen3.5. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen35-4b-alfworld-single-opd-iwk3-step100-bf16 | 5,17B | no disponible | Apache 2.0 | HuggingFace (0 descargas) | Checkpoint RL especifico para ALFWorld |
| Qwen3.5-4B base | no disponible en la informacion | no disponible | no disponible en la informacion | no disponible en la informacion | Modelo base sin ajuste RL |
| Alternativas de agente ALFWorld | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de datos de rendimiento comparables de otros modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El autor advierte que la publicacion es una verificacion de integridad de pesos, no un resultado nuevo de generacion o evaluacion.
- La puntuacion de 83,6% proviene de una unica ejecucion muestreada sobre 140 tareas; no es una comparacion pareada multi-semilla y no debe interpretarse como rendimiento robusto.
- El modelo esta especializado en ALFWorld; su rendimiento en tareas generales de texto o multimodalidad no esta validado.
- No se incluyen estados del optimizador ni trayectorias de entrenamiento, lo que limita la reproducibilidad completa del experimento.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada.
- Limitaciones de contexto o idioma: no disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigacion sin garantias de calidad en produccion.
- Requiere una version de transformers que soporte Qwen3.5 (entorno de origen 5.13.0) y las dependencias de atencion correspondientes; versiones incompatibles pueden fallar al cargar.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion externa de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/dingwenjun/qwen35-4b-alfworld-single-opd-iwk3-step100-bf16-20261105
- Paper de ALFWorld: no disponible en la informacion proporcionada
- Blog o repositorio del autor: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
