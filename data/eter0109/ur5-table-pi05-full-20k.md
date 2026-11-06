# Eter0109/ur5-table-pi05-full-20k

## Resumen

`Eter0109/ur5-table-pi05-full-20k` es un checkpoint de robótica resultante de un ajuste fino completo (100 % de los parámetros) del modelo π₀.₅ de Physical Intelligence, publicado en Hugging Face bajo el identificador `lerobot/pi05_base`. Lo desarrolla el usuario Eter0109 y está pensado para controlar un brazo robótico UR5 en tareas de manipulación sobre mesa. No es un modelo de lenguaje generalista, sino una política visomotora (vision-language-action) que asigna observaciones multimodales (dos cámaras eegoladas más el estado de las articulaciones) a secuencias de acciones de 7 dimensiones.

El modelo parte de la arquitectura π₀.₅, que combina una torre de visión SigLIP de 400 M de parámetros, un backbone VLM basado en Gemma-2B y un "action expert" Gemma-300M, sumando 4 143 404 816 parámetros entrenables. En este checkpoint concreto se han descongelado todas las componentes (`freeze_vision_encoder=false`, `train_expert_only=false`), algo poco habitual en ajustes de políticas robóticas, donde suele congelarse la torre visual.

Su relevancia es acotada pero específica: sirve como referencia reproducible de un pipeline completo de entrenamiento con LeRobot sobre un dataset propio de 117 episodios y 137 503 fotogramas a 30 FPS, con pérdida de evaluación de 0.1881 sobre 6 episodios reservados. Resulta útil para quien quiera replicar el flujo, comparar estrategias de congelación parcial frente a ajuste completo o evaluar el comportamiento de π₀.₅ en un UR5 con dos cámaras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π₀.₅ (vision-language-action): SigLIP 400M + Gemma-2B (VLM) + Gemma-300M (action expert) |
| Parametros totales | 4 143 404 816 (todos entrenables en este checkpoint) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el horizonte de acción es de 50 pasos, chunk size 50) |
| Tipos de cuantizacion | no disponible (entrenado y publicado en bfloat16) |
| Idiomas soportados | en (inglés, según metadatos; el modelo no es conversacional) |
| Licencia | no disponible |
| Formato de pesos | safetensors vía LeRobot (`PI05Policy.from_pretrained`) |
| Modelo base | `lerobot/pi05_base` |
| Dataset de entrenamiento | `namelesis27/ur5_table_auto_balanced` (117 episodios, 137 503 fotogramas, 30 FPS) |
| Entradas | `observation.images.d436` y `observation.images.d405`, 224x224 (resize bilineal con padding simétrico de 28 px) + `observation.state` 7D (6 articulaciones + pinza) |
| Salidas | `action` 7D, chunk de 50 pasos |
| Normalización | cuantiles q01..q99 calculados globalmente sobre los 137 503 fotogramas |

## Arquitectura y entrenamiento

π₀.₅ es una política visomotora que acopla un codificador visual SigLIP (400 M) con un backbone de lenguaje Gemma-2B y un módulo específico de acción Gemma-300M. La política recibe dos flujos de imagen (cámaras D436 y D405), las redimensiona a 224x224 con padding simétrico de 28 px para preservar la relación de aspecto y las combina con el vector de estado articular de 7 dimensiones. La salida es un chunk de 50 acciones de 7 dimensiones, lo que permite ejecutar secuencias cortas sin recalcular la política en cada paso de control.

El ajuste fino es integral: los 4 143 404 816 parámetros fueron entrenables, incluida la torre visual. El entrenamiento usó `bfloat16` con checkpointing de gradientes, AdamW con lr=2.5e-5, warmup de 1 000 actualizaciones y decaimiento coseno hasta 2.5e-6. El batch efectivo fue de 64 (16 de micro-batch por 4 de acumulación), con 5 000 actualizaciones del optimizador (20 000 micro-pasos, aproximadamente 2.61 épocas sobre 130 440 fotogramas de entrenamiento). La pérdida pasó de 1.714 inicial a 0.169 en entrenamiento y 0.1881 en evaluación sobre 6 episodios reservados. La normalización por cuantiles se calculó de forma global sobre el conjunto completo, no por episodio.

## Capacidades

- Control visomotor de un brazo UR5 con pinza de 1 grado de libertad, a partir de dos cámaras y del estado articular.
- Predicción de secuencias de acción en chunks de 50 pasos, lo que reduce la frecuencia de inferencia necesaria.
- Percepción visual dual (cámara D436 y D405) a 224x224 con padding para mantener la relación de aspecto.
- Generalización limitada al dominio del dataset: manipulación de objetos sobre mesa con la configuración concreta del UR5 empleada.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico: es una política de imitación, no un modelo de lenguaje instruible.
- No dispone de modo "thinking", visión general, audio ni capacidades conversacionales.
- El soporte multilingüe es irrelevante en la práctica; el metadato declara únicamente inglés.

## Casos de uso

- Replicación del pipeline de ajuste completo en LeRobot: sirve como referencia de hiperparámetros (lr, warmup, batch efectivo, normalización por cuantiles) para quien entrene π₀.₅ sobre sus propios datos.
- Manipulación de objetos sobre mesa con UR5: el checkpoint ejecuta tareas de pick-and-place y similares dentro del dominio del dataset `ur5_table_auto_balanced`, con dos cámaras como entrada.
- Estudio comparativo de congelación de la torre visual: al haberse entrenado con `freeze_vision_encoder=false`, permite comparar frente a variantes con la torre congelada y medir el impacto en la pérdida de evaluación.
- Base para ajuste posterior (fine-tuning adicional): al ser un ajuste completo sobre `pi05_base`, puede servir como inicialización para dominios cercanos con menos datos.
- Evaluación de robustez ante cambios de iluminación o posición de cámara: útil para medir cuánto degrada un ajuste integral la generalización fuera de distribución.
- Docencia y experimentación en robótica de imitación: el par dataset-checkpoint permite reproducir el flujo completo con hardware asequible (UR5 y dos cámaras RealSense).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Pérdida inicial | 1.714 |
| Pérdida de entrenamiento (paso 20 000) | 0.169 |
| Pérdida de evaluación (paso 20 000, 6 episodios) | 0.1881 |
| Actualizaciones del optimizador | 5 000 (20 000 micro-pasos) |
| Épocas aproximadas | 2.61 sobre 130 440 fotogramas |

No hay datos de tasa de éxito en tareas, ni comparación con otras políticas sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 4.14 B de parámetros en bfloat16 requiere del orden de 8-9 GB solo para pesos, a lo que hay que sumar activaciones y buffers de las dos cámaras.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs de 24 GB (RTX 4090, L4, A10G) en bfloat16, y en GPUs de 16 GB con cuantización o precisión reducida, aunque esto último no está documentado.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) y posiblemente en RTX 4080 (16 GB) con precisión reducida; no verificado por el autor.
- Opciones de despliegue: LeRobot (`PI05Policy.from_pretrained`), que es la vía documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a una política VLA de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|
| `Eter0109/ur5-table-pi05-full-20k` | 4.14 B (ajuste completo) | chunk de 50 acciones | no disponible | Hugging Face (0 descargas) |
| `lerobot/pi05_base` | 4.14 B | chunk de 50 acciones | no disponible | Hugging Face (modelo base oficial) |
| Otras políticas VLA de la familia π₀.₅ | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada, por lo que la comparación se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado sobre 117 episodios de una única configuración de UR5 con dos cámaras concretas; no se espera generalización a otros brazos, otras cámaras u otras tareas.
- Sin licencia declarada: no se puede asumir uso comercial; hay que contactar con el autor o consultar la licencia del modelo base `lerobot/pi05_base`.
- Sin métricas de éxito en tarea: la pérdida de evaluación (0.1881) no garantiza comportamiento correcto en ejecución real; no hay validación en robot publicada.
- Riesgo de sobreajuste: 2.61 épocas con ajuste completo de 4.14 B de parámetros sobre 117 episodios es un régimen propenso a memorizar el dataset.
- Normalización global por cuantiles: si se despliega con datos de otra distribución (otra iluminación, otra mesa), las estadísticas q01..q99 pueden no ser válidas.
- Solo inglés en metadatos y sin capacidades de lenguaje: no debe usarse como modelo conversacional ni de razonamiento.
- Sin cuantizaciones publicadas: el despliegue en GPUs de menos de 16 GB requeriría trabajo adicional no documentado.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso por terceros ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Eter0109/ur5-table-pi05-full-20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/namelesis27/ur5_table_auto_balanced
- Documentación de LeRobot: https://github.com/huggingface/lerobot
