# abdulrahimmirani/pi05-piperx-pick-cube-ft01

## Resumen

`abdulrahimmirani/pi05-piperx-pick-cube-ft01` es un ajuste fino del modelo de visión-lenguaje-acción (VLA) π0.5 de Physical Intelligence, publicado por el usuario abdulrahimmirani. El modelo parte de `pi05_base` y se ha entrenado sobre 49 demostraciones de teleoperación real ejecutadas con un brazo PiPER-X de 6 grados de libertad más pinza, grabadas a 30 Hz mediante teleoperación con mando XR. La tarea objetivo es una única instrucción en inglés: `pick up the cube and put it in the cup`.

El interés de esta ficha es acotado pero claro: no es un modelo de propósito general, sino un checkpoint de robótica de una sola tarea, pensado para ser servido con la infraestructura `openpi`. El modelo total tiene 3.353 millones de parámetros, de los cuales solo 430,1 millones (12,8%) son entrenables: la torre SigLIP y el backbone Gemma-2B permanecen congelados durante el ajuste, y solo se entrena el experto de acciones junto con las proyecciones de acción y de tiempo. La predicción se organiza en horizontes de acción de 30 pasos (1 segundo a 30 Hz) con un vector de acción de 32 dimensiones, de las cuales solo 7 son reales (6 articulaciones en radianes más pinza).

Es relevante ahora porque documenta de forma inusualmente honesta un caso de ajuste fino sobre hardware real con recursos modestos (una única GPU L40S de 46 GB durante 4 h 19 m) y porque advierte explícitamente de sus propias limitaciones: no hay partición de validación, la pérdida de flow-matching no es interpretable de forma absoluta y un intento anterior del mismo autor sobre la misma tarea obtuvo 0/24 aciertos en hardware. Los checkpoints están en formato `orbax`, no en safetensors, y requieren una rama concreta del repositorio `openpi`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (torre de visión SigLIP + backbone Gemma-2B congelados + experto de acciones entrenable); detalles internos de atención no disponibles |
| Parámetros totales | 3.353 M (3,353 B) |
| Parámetros activos | No aplica (no es MoE). Parámetros entrenables: 430,1 M (12,8%) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; los pesos se distribuyen en bf16 sin cuantizaciones publicadas |
| Idiomas soportados | No disponible; la única instrucción documentada está en inglés (`pick up the cube and put it in the cup`) |
| Licencia | `other` (sin texto de licencia detallado en la información proporcionada) |
| Formato de pesos | `orbax` (no safetensors, no GGUF). Cada checkpoint contiene `params/` (5,8 GB), `train_state/` (3,0 GB) y `assets/` (estadísticas de normalización) |
| Dimensión de estado/acción | 7 dimensiones reales (`joint1..joint6` en radianes + pinza), rellenadas con ceros hasta `action_dim=32` |
| Horizonte de acción | 30 pasos (1 segundo a 30 Hz) |
| Entradas de cámara | `observation.images.external` (estática) → `base_0_rgb`; `observation.images.wrist` (en el brazo) → `left_wrist_0_rgb`; `right_wrist_0_rgb` anulada y enmascarada |
| Resolución de imagen | Nativa 640×480, redimensionada con letterboxing a 224×224 (168×224 de contenido real, barras negras arriba y abajo, sin deformación) |
| Tamaño del repositorio | 46,8 GB |

## Arquitectura y entrenamiento

El modelo sigue el diseño π0.5 de tipo VLA: una torre de visión SigLIP y el backbone de lenguaje Gemma-2B permanecen congelados, y el ajuste se aplica únicamente al experto de acciones y a las proyecciones de acción y de tiempo. Según la model card, esto supone 430,1 M de parámetros entrenables sobre un total de 3.353 M (12,8%). La predicción es de tipo flow-matching y las acciones se emiten como incrementos relativos de las articulaciones (delta actions) manteniendo la pinza en valores absolutos; la transformación `AbsoluteActions` del stack `openpi` convierte la salida a objetivos absolutos de articulación en radianes, de modo que la interfaz servida no requiere integración manual por parte del usuario.

El conjunto de datos de ajuste es `piper_x_pick_cube_v1`: 49 episodios, 18.431 fotogramas y 614 segundos a 30 Hz, en formato LeRobot v2.1, con RGB de muñeca y RGB externa. Los 49 episodios son tomas limpias seleccionadas de 55 grabaciones realizadas el 2026-09-09. La receta emplea lote de 16, 10.000 pasos (8,7 épocas sobre los 18.431 fotogramas), optimizador AdamW con 400 pasos de calentamiento, pico de `2.5e-5` y decaimiento coseno hasta `2.5e-6` en el paso 10.000, precisión bf16 para los parámetros congelados y una única GPU L40S de 46 GB durante 4 h 19 m. La EMA se desactivó porque su copia completa de parámetros provocaba OOM en un host de 30 GB. Las estadísticas de normalización se calcularon desde cero, ya que PiPER-X no forma parte de la mezcla de preentrenamiento de π0.5.

Se publican cinco checkpoints (`2000`, `4000`, `6000`, `8000`, `9999`) con pérdidas de entrenamiento de 0,0074, 0,0059, 0,0045, 0,0039 y 0,0040 respectivamente. El autor señala que la pérdida se estabiliza a partir de ~6000 y recomienda empezar comparando `6000` y `9999`. No se documenta ningún tipo de decodificación especulativa, atención lineal ni otra innovación de inferencia.

## Capacidades

- Control robótico de una única tarea: ejecutar la instrucción `pick up the cube and put it in the cup` con un brazo PiPER-X de 6 DOF más pinza.
- Generación de acciones en forma de incrementos articulares convertidos internamente a objetivos absolutos en radianes, con horizonte de 30 pasos (1 s a 30 Hz).
- Fusión de dos vistas RGB (externa estática y de muñeca) preservando la relación de aspecto mediante letterboxing a 224×224.
- Control de pinza en espacio normalizado (`0.0` = totalmente abierta, `1.0` = totalmente cerrada), con conversión a apertura métrica documentada por el autor.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, planificación de agentes ni ejecución de código.
- No se documentan capacidades multilingües, de visión general, de audio ni modo de pensamiento. Es un modelo unimodal orientado a acción robótica, no un modelo conversacional.
- Prompts admitidos: todos los checkpoints se han entrenado con la instrucción en inglés indicada; no hay evidencia de generalización a otras instrucciones.

## Casos de uso

- Replicación de la tarea de pick-and-place en laboratorio: el modelo permite reproducir sobre un PiPER-X real la tarea de coger un cubo y depositarlo en una taza, usando la instrucción exacta de entrenamiento y el servidor `scripts/serve_policy.py`.
- Punto de partida para ajustes finos propios en robótica manipulativa: dado su bajo coste de entrenamiento documentado (una L40S, 4 h 19 m, 8,7 épocas), sirve como plantilla para adaptar π0.5 a otros brazos con demostraciones de teleoperación propias.
- Estudio de delta actions frente a acciones absolutas: la model card documenta que un intento previo con objetivos absolutos logró 0/24 y que las delta actions son el cambio identificado, lo que convierte este checkpoint en un caso de estudio para comparar estrategias de espacio de acción.
- Evaluación de pipelines de inferencia `openpi` con checkpoints `orbax`: útil para validar el flujo `serve_policy.py` con `policy.config=pi05_piperx_teleop_expert` antes de invertir en grabación de datos nuevos.
- Investigación sobre calibración de la binzarización de la pinza: el umbral existente (~0,22 con histéresis) se ajustó con datos de simulación del planificador cuRobo, no con teleoperación humana, por lo que este modelo es un banco de pruebas para re-calibrarlo con datos reales.
- Docencia y divulgación sobre VLA reales: el repositorio ilustra de forma completa el ciclo de teleoperación XR, LeRobot v2.1, estadísticas de normalización y advertencias sobre la validez de la curva de pérdida.
- Validación de tolerancia a configuraciones de cámara: permite comprobar el efecto de una tercera vista enmascarada y de la pérdida de resolución por letterboxing (168×224 útiles) sobre el éxito de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni métricas equivalentes, y tampoco cifras de tasa de éxito en hardware para estos checkpoints.

Los únicos datos numéricos publicados son de entrenamiento:

| Checkpoint | Épocas | Pérdida de entrenamiento |
|---|---|---|
| 2000 | 1,7 | 0,0074 |
| 4000 | 3,5 | 0,0059 |
| 6000 | 5,2 | 0,0045 |
| 8000 | 6,9 | 0,0039 |
| 9999 | 8,7 | 0,0040 |

El propio autor advierte de que la pérdida de flow-matching no tiene escala absoluta y que 0,0040 no es significativo por sí mismo, y cita un intento anterior sobre la misma tarea que obtuvo 0/24 con una curva de pérdida igualmente limpia.

## Requisitos de hardware

- Pesos de inferencia: cada checkpoint contiene `params/` con 5,8 GB. El `train_state/` (3,0 GB) solo es necesario para reanudar el entrenamiento, no para servir el modelo.
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia derivada, un modelo de 3.353 M parámetros en bf16 ocupa del orden de 6-7 GB solo en pesos, a lo que hay que sumar activaciones, buffers de imagen a 224×224 y el estado del servidor `openpi`; el autor no publica una cifra medida.
- GPU empleada en entrenamiento: 1× L40S de 46 GB, bf16, 4 h 19 m. La model card no recomienda GPUs concretas para inferencia.
- Viabilidad en GPU de consumo: no confirmada. El tamaño de pesos en bf16 es compatible en términos de memoria con tarjetas de 12-16 GB o superiores, pero no hay ninguna validación publicada en GPU de consumo y el stack `openpi` está pensado para despliegue en estación de trabajo o servidor.
- Opciones de despliegue: `scripts/serve_policy.py` del repositorio `The-Robotics-Company/openpi`, rama `rahim-trc`, commit `f8bf156` o posterior, con `--policy.config=pi05_piperx_teleop_expert` y `--policy.dir=<descargado>/9999`. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, ya que no son checkpoints de transformers ni GGUF.
- Aviso de configuración: el config `pi05_piperx_teleop_expert` tiene rutas absolutas incrustadas (`assets_base_dir=/home/ubuntu/training/assets`, `checkpoint_base_dir=...`) que apuntan a la máquina de entrenamiento; si la resolución de configuración falla, hay que sobrescribir ambos campos.
- Latencia y throughput: no disponibles. El único dato temporal es el horizonte de acción de 30 pasos, equivalente a 1 segundo de ejecución a 30 Hz.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas en la información proporcionada, por lo que la comparación numérica queda marcada como no disponible. La única comparación sustentada por los datos aportados es con el modelo base del que deriva.

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `abdulrahimmirani/pi05-piperx-pick-cube-ft01` | 3.353 M (430,1 M entrenables) | No disponible | `orbax` | `other` | HuggingFace, 0 descargas, 0 likes |
| `pi05_base` (modelo de partida, Physical Intelligence) | 3.353 M (misma base según la model card) | No disponible | No disponible | No disponible | No disponible en la información proporcionada |
| Otros VLA de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

Diferencias cualitativas conocidas frente al base: este checkpoint está especializado en un único brazo (PiPER-X), una única tarea y una única instrucción en inglés, y aporta estadísticas de normalización propias porque PiPER-X no figura en la mezcla de preentrenamiento de π0.5.

## Limitaciones y advertencias

- Sin partición de validación: los 49 episodios son datos de entrenamiento, de modo que la curva de pérdida no permite distinguir aprendizaje de memorización. La evaluación en hardware es la única señal válida.
- La pérdida de entrenamiento no es evidencia de éxito: el autor documenta que un intento anterior de π0.5 sobre esta misma tarea obtuvo 0/24 con objetivos de acción absolutos y una curva de pérdida igual de limpia. El cambio a delta actions está sin validar en hardware en el momento de la subida.
- La pérdida de flow-matching carece de escala absoluta; 0,0040 no es interpretable por sí solo.
- Normalización de la pinza: el entrenamiento usó `gripper = clip(1 - aperture_m / 0.07)`, con `0.0` = totalmente abierta y `1.0` = totalmente cerrada. Invertir esta conversión deja la pinza al revés y la política parece completamente rota.
- Umbral de binarización sin ajustar: el valor existente (~0,22 con histéresis) se calibró con datos de simulación del planificador cuRobo, no con teleoperación humana, por lo que hay que re-ajustarlo.
- Rutas absolutas incrustadas en el config `pi05_piperx_teleop_expert`, que apuntan a la máquina de entrenamiento.
- Dependencia de una rama no fusionada: requiere la rama `rahim-trc` de `The-Robotics-Company/openpi` en el commit `f8bf156` o posterior; la configuración y las transformaciones no están en `main`.
- Cobertura limitada: una sola tarea, un solo prompt en inglés, un solo tipo de robot y una sola morfología (6 DOF + pinza). No hay evidencia de generalización a otras instrucciones, objetos o entornos.
- Tercera cámara anulada: `right_wrist_0_rgb` se enmascara, de modo que el modelo no explota información de una vista derecha.
- Pérdida de resolución por letterboxing: de 640×480 se pasa a 168×224 de contenido real, con barras negras arriba y abajo.
- Licencia `other` sin texto detallado en la información disponible; no puede confirmarse la permisividad para uso comercial. Además, la licencia del modelo base π0.5 debe verificarse por separado antes de cualquier despliegue productivo.
- Riesgo de alucinación de acciones: al ser una política de flow-matching sin validación en hardware publicada, existe riesgo de trayectorias no válidas o inseguras para el robot; se recomienda ejecución con límites de par, parada de emergencia y espacio de trabajo despejado.
- Sesgos: no disponibles; no hay evaluación de sesgo demográfica ni de robustez frente a iluminación, texturas u oclusiones.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, un solo autor y una única subida, sin señales de uso por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abdulrahimmirani/pi05-piperx-pick-cube-ft01
- Repositorio requerido para servir el modelo: `The-Robotics-Company/openpi`, rama `rahim-trc`, commit `f8bf156` o posterior (configuración `pi05_piperx_teleop_expert`)
- Modelo base del ajuste: `pi05_base` (π0.5, Physical Intelligence); no se proporciona URL específica en la información disponible
- Conjunto de datos de entrenamiento: `piper_x_pick_cube_v1` (49 episodios, 18.431 fotogramas, 614 s, formato LeRobot v2.1); no se proporciona URL independiente
- Paper, blog o demo adicionales: no disponible. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente páginas de recambios de maquinillas de barbero, sin relación con el contenido).
