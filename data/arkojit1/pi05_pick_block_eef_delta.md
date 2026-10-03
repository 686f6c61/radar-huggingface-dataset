# arkojit1/pi05_pick_block_eef_delta

## Resumen

`arkojit1/pi05_pick_block_eef_delta` es un ajuste fino del modelo vision-language-action (VLA) π₀.₅ de Physical Intelligence, publicado por el usuario arkojit1 y entrenado con la librería LeRobot sobre el dataset `Ameyapores/pick_block_eef_delta`. El modelo resuelve una única tarea de manipulación robótica: recoger un bloque con un brazo Franka, usando como entrada dos cámaras de 224×224 (`cam0` y `cam2`), un estado de 4 dimensiones y como salida un delta de 4 dimensiones sobre el efector final.

Se trata de un ajuste fino muy acotado: 35 episodios de un solo task, con solo el *action expert* entrenable mientras el codificador visual SigLIP y el modelo de lenguaje Gemma-2B permanecen congelados. El checkpoint publicado corresponde al paso 1.500 (~47 épocas) de la ejecución base y se seleccionó por ser el de menor pérdida de evaluación en los 4 episodios reservados.

Su relevancia es principalmente metodológica: sirve como referencia reproducible de cómo ajustar π₀.₅ con LeRobot en hardware no convencional (8 GPU AMD MI300X) y con un dataset mínimo, y como punto de partida para experimentos de transferencia a otras tareas de pick-and-place. No es un modelo de propósito general: no es un LLM conversacional ni un modelo multimodal de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); según la model card, codificador visual SigLIP y Gemma-2B congelados más un *action expert* entrenable con objetivo de flow matching |
| Parametros totales | 4.143.404.816 (~4,14 mil millones), según safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se ofrecen variantes GGUF, int8 ni int4) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,4 GB |
| Modelo base | lerobot/pi05_base |
| Dataset de ajuste fino | Ameyapores/pick_block_eef_delta (35 episodios, 1 tarea) |
| Entradas | 2 cámaras de 224×224 (`cam0`, `cam2`) con un tercer slot de imagen rellenado (`empty_cameras=1`), estado de 4 dimensiones |
| Salidas | Delta de 4 dimensiones sobre el efector final |
| Checkpoint | Paso 1.500 (~47 épocas), chunk_size = 50, n_action_steps = 50 |
| Libreria | lerobot |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema de π₀.₅: un componente de percepción y lenguaje (codificador visual SigLIP junto con Gemma-2B) que permanece congelado durante el ajuste, y un *action expert* entrenable que genera secuencias de acciones mediante flow matching. La pérdida reportada es precisamente la del objetivo de flow matching, no una métrica de éxito de tarea. El modelo se ejecuta a través de `lerobot.policies.pi05.modeling_pi05.PI05Policy`.

El entrenamiento se realizó con `--policy.type=pi05` y `train_expert_only=true`, es decir, solo se actualizaron los pesos del experto de acciones. Se usó un lote global de 256 (32 por GPU en 8 AMD MI300X), tasa de aprendizaje máxima de 2,5e-5 con decaimiento coseno hasta 2,5e-6 en bf16, normalización por cuantiles para estado y acción, y transformaciones de imagen de LeRobot sobre los fotogramas de entrenamiento. El dataset consta de 35 episodios de una sola tarea sobre Franka; los últimos 4 episodios se reservaron para evaluación, y el checkpoint del paso 1.500 obtuvo una pérdida de evaluación de 0,1031.

## Capacidades

- Generación de acciones de manipulación robótica: produce deltas de 4 grados de libertad sobre el efector final a partir de observaciones visuales y de estado.
- Control visomotor con dos vistas de cámara: consume simultáneamente `cam0` y `cam2` a 224×224, con el tercer slot de imagen de π₀.₅ rellenado mediante `empty_cameras=1`.
- Ejecución de una tarea concreta: recoger un bloque ("pick block") en un entorno Franka con la configuración del dataset de entrenamiento.
- Planificación de acciones en bloques: genera chunks de 50 acciones (`chunk_size=50`) y ejecuta los 50 pasos por chunk (`n_action_steps=50`).
- Aprendizaje por imitación con flow matching: la política se entrena con el objetivo de flow matching propio de π₀.₅.
- Ajuste fino sobre un backbone congelado: el modelo sirve como plantilla de ajuste de solo experto sobre `lerobot/pi05_base`.
- Tool calling, function calling, agentes multi-paso, razonamiento textual, código, matemáticas, visión general, audio y capacidades multilingües: no disponibles; no hay evidencia en la información proporcionada de que el ajuste conserve o exponga estas capacidades.

## Casos de uso

- Pick-and-place de laboratorio con Franka: reproducción directa de la tarea del dataset, alimentando las dos cámaras y el estado de 4 dimensiones al modelo y enviando los deltas de efector final al controlador del robot.
- Punto de partida para ajuste fino adicional: al derivar de `lerobot/pi05_base` y entrenarse solo el experto, resulta un candidato razonable para reentrenar el experto en una tarea nueva con pocos episodios, reutilizando el backbone congelado.
- Banco de pruebas de pipelines LeRobot: sirve para validar la carga de políticas π₀.₅, el formateo de observaciones multimodales y la integración con el bucle de control del robot sin entrenar desde cero.
- Comparación de metodologías de entrenamiento: permite contrastar configuraciones de normalización por cuantiles, aumentación de imagen y decaimiento coseno frente a otras variantes sobre el mismo dataset.
- Depuración de conjuntos de datos de robótica: al estar entrenado en un dataset público pequeño y documentado, ayuda a identificar problemas de calidad de datos (episodios escasos, etiquetado de tarea único) mediante el análisis de la pérdida de evaluación.
- Docencia y formación en robótica: ejemplo reproducible de flujo completo (dataset, entrenamiento distribuido, selección de checkpoint, evaluación con holdout) para cursos de aprendizaje por imitación.
- Evaluación de infraestructura en GPU AMD: el registro del entrenamiento con 8 MI300X sirve como referencia para quienes despliegan LeRobot en aceleradores AMD.
- Pruebas de transferencia entre brazos o configuraciones de cámara: con reentrenamiento del experto, se puede medir cuánto del comportamiento aprendido se transfiere a variaciones del montaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico es la pérdida de evaluación, que corresponde al objetivo de entrenamiento (flow matching) y no a una tasa de éxito de tarea:

| Metrica | Valor | Nota |
|---|---|---|
| Eval loss (flow matching) | 0,1031 | Sobre 4 episodios reservados; no equivale a tasa de éxito |
| Task success rate | no disponible | No se reporta en la model card |
| MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | no disponibles | No aplicables a este ajuste |
| Comparación con checkpoints cercanos | no disponible | El autor indica que los checkpoints de los pasos ~1.000–2.000 son estadísticamente indistinguibles con un holdout tan pequeño |

## Requisitos de hardware

- VRAM estimada para los pesos: ~16,6 GB en fp32, ~8,3 GB en bf16/fp16, ~4,1 GB en int8 y ~2,1 GB en int4. Estas cifras cubren solo los pesos; hay que sumar activaciones, buffers de las dos imágenes de 224×224 y el estado de gestión de la política.
- GPU recomendadas para entrenamiento: el autor usó 8 AMD MI300X con lote de 32 por GPU. Un ajuste de solo experto es mucho más ligero que un entrenamiento completo, por lo que configuraciones con varias A100 o H100 de 80 GB son viables.
- GPU recomendadas para inferencia: A100 40/80 GB, H100, L40S o RTX 4090/A6000 de 24 GB en bf16.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas de 24 GB (RTX 3090, RTX 4090) en bf16, y en tarjetas de 16 GB si se aplica cuantización a int8, dado que el repositorio no publica pesos ya cuantizados.
- Opciones de despliegue: LeRobot con PyTorch mediante `PI05Policy.from_pretrained("arkojit1/pi05_pick_block_eef_delta")`; requiere el stack de LeRobot y las dependencias de π₀.₅.
- vLLM, TGI, llama.cpp y Ollama: no disponibles o no aplicables para esta arquitectura en la información proporcionada, ya que no es un modelo de texto autoregresivo y no se distribuyen pesos GGUF.
- Latencia y throughput estimados: no disponibles. El repositorio de 9,4 GB sugiere pesos almacenados en precisión mixta, pero no se publican mediciones de frecuencia de inferencia ni de tiempo por chunk de 50 acciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arkojit1/pi05_pick_block_eef_delta | 4,14 mil millones | no disponible | VLA ajustado para pick block con Franka | no disponible | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| lerobot/pi05_base | no disponible en la información proporcionada | no disponible | VLA base de π₀.₅ | no disponible | HuggingFace |
| lerobot/smolvla_base | aprox. 450 millones (dato público, no verificado en la información proporcionada) | no disponible | VLA compacto de LeRobot | no disponible | HuggingFace |
| openvla/openvla-7b | aprox. 7 mil millones (dato público, no verificado en la información proporcionada) | no disponible | VLA de propósito general para manipulación | no disponible | HuggingFace |

Los datos de SmolVLA y OpenVLA proceden de documentación pública de sus respectivos proyectos y no de la información facilitada para esta ficha; conviene verificarlos antes de citarlos. La comparación con `lerobot/pi05_base` es la más directa, ya que este modelo es un ajuste fino suyo.

## Limitaciones y advertencias

- Alcance extremadamente reducido: una única tarea y 35 episodios. No debe esperarse generalización a otras tareas, objetos ni entornos.
- La pérdida de evaluación de 0,1031 es una métrica de objetivo de entrenamiento sobre 4 episodios, no una tasa de éxito. El propio autor advierte que con un holdout tan pequeño los checkpoints cercanos son estadísticamente indistinguibles.
- Sin licencia declarada: la ausencia de licencia impide conocer las condiciones de uso comercial, redistribución o modificación. Trátese como no apto para producción hasta aclararlo con el autor.
- Sin información de idiomas ni de contexto: no se documenta el comportamiento lingüístico del componente Gemma-2B dentro de este ajuste.
- Especialización sensorial: el modelo espera exactamente dos cámaras de 224×224 y un estado de 4 dimensiones con las convenciones del dataset; cambios en la configuración de sensores o en la definición del estado pueden degradar el comportamiento.
- Dependencia del entorno: las acciones son deltas de efector final calibrados para el montaje Franka del dataset. Cambios en la cinemática, la frecuencia de control o las unidades invalidan los resultados.
- Riesgo de sobreajuste: 47 épocas sobre 35 episodios con solo el experto entrenable hacen probable que la política se ajuste a las trayectorias concretas del dataset, con poca robustez ante perturbaciones.
- Riesgo de alucinación en el sentido robótico: no hay garantía de éxito de la tarea ni de seguridad física; debe ejecutarse con límites de par, paradas de emergencia y supervisión humana.
- Sesgos conocidos: no disponibles. No se documenta la composición demográfica ni la variabilidad de escenarios del dataset más allá de la descripción técnica.
- Metadatos: el repositorio indica fechas de creación y actualización en octubre de 2026, posteriores a la fecha habitual de consulta. Verifíquese la vigencia del repositorio antes de reutilizarlo.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arkojit1/pi05_pick_block_eef_delta
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de ajuste fino: https://huggingface.co/datasets/Ameyapores/pick_block_eef_delta
- LeRobot: https://github.com/huggingface/lerobot
- Resultados de búsqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden a un sitio de encuentros y no guardan relación con el modelo, por lo que se descartan como fuentes.
