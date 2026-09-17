# RyanL22/pi05-anyh2r-rh56f1-0916-rawidm-20k

## Resumen

`RyanL22/pi05-anyh2r-rh56f1-0916-rawidm-20k` es un checkpoint de robótica entrenado por el usuario RyanL22 sobre el modelo base `lerobot/pi05_base`. Se trata de un ajuste fino de la política `pi05` (LeRobot v0.6.1) para el conjunto hardware compuesto por el brazo OpenArm y la mano robótica RH56F1, orientado a la generación de acciones de manipulación bimanual a partir de observaciones visuales y de estado articular. El modelo ocupa 4.143.404.816 parámetros (unos 4,14 mil millones) y el repositorio pesa 9,4 GB en formato safetensors.

El ajuste se realizó sobre la mezcla «anyh2r» del 16 de septiembre de 2026: 12 celdas sintéticas generadas a partir de vídeo humano (466 episodios) con etiquetas IDM en crudo, sin la corrección wrist-IK, más 4 celdas de teleoperación real (pelota, caja, muñeca y botella). El checkpoint publicado corresponde al paso 20.000 de una ejecución de 30.000 pasos, entrenada en 4 GPU H100 de 80 GB. Su relevancia es acotada y experimental: es un artefacto de investigación que documenta un experimento de ablación concreto (etiquetas IDM sin corrección de muñeca), no un modelo de propósito general.

No se trata de un modelo de lenguaje: no tiene ventana de contexto textual ni idiomas soportados, y su salida son 28 grados de libertad de objetivos articulares absolutos. La licencia es Apache 2.0 y la librería de referencia es LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política robótica `pi05` (LeRobot v0.6.1) con codificador visual SigLIP de 412,4 M de parámetros; detalles internos del backbone no disponibles |
| Parametros totales | 4.143.404.816 (~4,14 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; horizonte de acción de 50 pasos a 20 fps (2,5 s) con `n_obs_steps=1` |
| Tipos de cuantizacion | no disponible; el entrenamiento usa bfloat16 y no se documentan versiones cuantizadas |
| Idiomas soportados | no aplica (modelo de robótica); no disponible en la ficha |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`), repositorio de 9,4 GB |
| Modelo base | lerobot/pi05_base |
| Entradas | `observation.images.base_0_rgb` (vista ZED izquierda, 288x512), `observation.images.left_wrist_0_rgb` (vista ZED derecha, 288x512), `observation.state` (28 dims) |
| Salidas | `action`, 28 dims, objetivos articulares absolutos: cuello (2) \| brazo izq. (7) \| brazo der. (7) \| mano izq. (6) \| mano der. (6) |
| Normalizacion | imágenes identidad; estado y acción por cuantiles (estadísticas en `policy_preprocessor_*`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de la política `pi05` distribuida con LeRobot v0.6.1, que integra un codificador visual SigLIP de 412,4 M de parámetros. A diferencia de muchos ajustes que congelan el codificador, en este caso el vision encoder se entrenó (no congelado). La política produce *chunks* de 50 acciones a 20 fps, es decir, un horizonte de control de 2,5 segundos, con una única observación por paso (`n_obs_steps=1`). Los detalles del resto del backbone (mecanismo de atención, módulo de acción, flujo de difusión o *flow matching*) no se especifican en la información disponible.

El entrenamiento se ejecutó en 4 GPU H100 de 80 GB con batch de 16 por GPU (64 efectivo), optimizador AdamW con lr máximo 2,5e-5 y decaimiento coseno hasta 2,5e-6, warmup de 1000 pasos, precisión bfloat16 y *gradient checkpointing*. Se usaron aumentos de imagen fotométricos y afines, con una única muestra replicada sobre el par estéreo, reparto de celdas proporcional a la raíz cuadrada del número de fotogramas sobre 16 celdas, y el aumento de espejo (flip izquierda/derecha) desactivado. El conjunto de datos combina 12 celdas sintéticas derivadas de vídeo humano (466 episodios, etiquetas IDM en crudo sin corrección wrist-IK) y 4 celdas de teleoperación real (pelota, caja, muñeca, botella). La innovación que documenta este checkpoint es precisamente la ablación de la corrección wrist-IK en las etiquetas sintéticas: mismos episodios y vídeos que `RyanL22/anyh2r-pi05-0916-merged`, pero con etiquetas de acción sintéticas distintas.

## Capacidades

- Generación de acciones de manipulación bimanual: produce 28 objetivos articulares absolutos (cuello, dos brazos de 7 GDL y dos manos de 6 GDL) a partir de dos vistas RGB y del estado articular.
- Control con horizonte temporal: emite *chunks* de 50 acciones a 20 fps, lo que permite ejecutar 2,5 s de trayectoria por inferencia.
- Percepción visual estéreo: consume dos vistas de cámara ZED a 288x512, una etiquetada como `base_0_rgb` (vista izquierda) y otra como `left_wrist_0_rgb` (vista derecha).
- Ejecución de tareas de manipulación de objeto: el conjunto de datos incluye teleoperación real con pelota, caja, muñeca y botella, además de las celdas sintéticas.
- Aprendizaje a partir de vídeo humano etiquetado con IDM: capacidad de aprovechar datos sintéticos generados desde vídeo para ampliar la cobertura de celdas de entrenamiento.
- Ajuste fino adicional: al ser un modelo LeRobot nativo, admite *fine-tuning* posterior sobre el mismo pipeline de datos.
- No soporta *tool calling*, *function calling*, razonamiento multi-paso textual, capacidades multilingües ni modos de pensamiento: no es un modelo de lenguaje.
- No se documentan capacidades de audio, vídeo generativo ni visión generalista más allá del codificador visual de la política.

## Casos de uso

- Manipulación bimanual con OpenArm y manos RH56F1: el modelo genera de forma conjunta los 7 GDL de cada brazo y los 6 GDL de cada mano, lo que permite ejecutar agarres y recolocaciones coordinadas sin controladores de agarre independientes.
- *Pick-and-place* de objetos cotidianos: entrenado con episodios de pelota, caja, muñeca y botella, es adecuado para tareas de recogida y depósito de objetos de geometría conocida en entornos de laboratorio.
- Investigación en aprendizaje por imitación desde vídeo humano: permite evaluar hasta qué punto las etiquetas IDM en crudo (sin corrección wrist-IK) bastan para aprender políticas utilizables, comparando contra la variante con corrección.
- Ablación controlada de aumentos de datos: al tener el espejo izquierda/derecha desactivado y aumentos fotométricos/afines activos, sirve como punto de comparación en estudios sobre aumento de imagen en políticas VLA.
- Ajuste fino específico de tarea: partiendo de `lerobot/pi05_base` o de este checkpoint, se puede reentrenar con teleoperación propia para un nuevo conjunto de objetos o una nueva celda de trabajo.
- Evaluación de robustez ante ruido de etiquetado: las etiquetas sintéticas en crudo introducen error respecto a la corrección wrist-IK, por lo que el checkpoint es útil para medir la sensibilidad del entrenamiento a ese ruido.
- Despliegue en bucle de control de baja frecuencia: con inferencias cada 2,5 s (chunk de 50 acciones a 20 fps), encaja en arquitecturas donde el modelo actúa como planificador de trayectoria y un controlador de bajo nivel ejecuta las acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito en tarea, tasas de acierto, ni comparaciones cuantitativas con otras políticas. Los resultados de búsqueda web recuperados no guardan relación con el modelo (son consultas en chino sobre Wikipedia), por lo que no aportan datos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 8,3 GB solo para los pesos en bfloat16 (4,14 B de parámetros) y aproximadamente 16,6 GB en fp32. Sumando activaciones, dos flujos de imagen a 288x512 y el codificador SigLIP, es razonable prever del orden de 12-16 GB en bfloat16, aunque el autor no publica una cifra oficial (estimación, no dato confirmado).
- GPU recomendadas: H100 80 GB o A100 para réplica del entorno de entrenamiento; el entrenamiento se realizó en 4x H100 80 GB. Para inferencia, una sola GPU de 24 GB debería ser suficiente en bfloat16.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en bfloat16, y previsiblemente en tarjetas de 16 GB ajustando el tamaño de lote. En GPU de 8-10 GB no hay datos publicados sobre cuantización que permitan confirmar su viabilidad.
- Opciones de despliegue: la vía documentada es LeRobot v0.6.1 con `PI05Policy.from_pretrained(...)`. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, y estas herramientas no están orientadas a políticas VLA de robótica.
- Latencia y throughput: no disponibles. El único dato de rendimiento publicado es el de entrenamiento (batch 64 en 4x H100, checkpoint en el paso 20.000 de 30.000).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RyanL22/pi05-anyh2r-rh56f1-0916-rawidm-20k | 4,14 B | chunk de 50 acciones a 20 fps (2,5 s) | sin benchmarks publicados | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| lerobot/pi05_base (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| RyanL22/anyh2r-pi05-0916-merged (mismos episodios, con corrección wrist-IK) | no disponible | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de parámetros, contexto ni rendimiento de otros modelos comparables dentro de la información proporcionada, por lo que no es posible ampliar la comparativa con alternativas como otras políticas de manipulación sin inventar cifras.

## Limitaciones y advertencias

- Modelo específico de hardware: está ajustado para OpenArm con manos RH56F1 y una disposición concreta de cámaras ZED; no es transferible a otras configuraciones sin reentrenamiento.
- Checkpoint intermedio: corresponde al paso 20.000 de 30.000, por lo que no es el resultado final de la ejecución de entrenamiento.
- Ausencia total de evaluación publicada: no hay métricas de éxito en tarea ni comparaciones cuantitativas, lo que impide estimar su fiabilidad en producción.
- Etiquetas sintéticas sin corrección wrist-IK: las 12 celdas sintéticas usan etiquetas IDM en crudo, con el error de etiquetado que ello implica frente a la variante con corrección; se desconoce el impacto cuantitativo de este sesgo.
- Cobertura limitada: 16 celdas en total (12 sintéticas y 4 de teleoperación real), restringidas a objetos como pelota, caja, muñeca y botella.
- Sesgo de dominio: los datos sintéticos provienen de vídeo humano, lo que introduce una brecha de dominio respecto a la ejecución real del robot.
- Aumento de espejo desactivado: el modelo no ha visto volteos izquierda/derecha, por lo que su generalización a configuraciones espelhadas no está garantizada.
- Sin capacidades de lenguaje: no admite instrucciones en lenguaje natural, *tool calling* ni razonamiento textual; cualquier control debe hacerse a través de observaciones y estado.
- Advertencia de licencia: el modelo se publica bajo Apache 2.0, pero conviene verificar la licencia y las condiciones del modelo base `lerobot/pi05_base` antes de un uso comercial.
- Adopción nula y soporte mínimo: 0 descargas y 0 likes, sin documentación adicional, issues ni ejemplos de uso más allá del fragmento de carga.
- Fecha de creación indicada como 2026-09-16, coherente con la mezcla de datos del mismo día; verificar la vigencia de los artefactos antes de reutilizarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RyanL22/pi05-anyh2r-rh56f1-0916-rawidm-20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Variante con los mismos episodios y etiquetas con corrección wrist-IK: https://huggingface.co/RyanL22/anyh2r-pi05-0916-merged
- Los resultados de búsqueda web disponibles no contienen enlaces relevantes al modelo (corresponden a consultas no relacionadas sobre Wikipedia), por lo que no se incluyen papers, blogs ni repos adicionales.
