# muacha/pi05_franka_relative_10hz

## Resumen

`muacha/pi05_franka_relative_10hz` es un ajuste fino completo (todos los parámetros) del modelo base `lerobot/pi05_base`, un modelo visión-lenguaje-acción (VLA) orientado al control de robots manipuladores. El resultado es una política de control para un brazo Franka FR3 que recibe dos imágenes RGB, un vector de estado de 14 dimensiones y emite acciones de efector final en forma relativa, convirtiéndolas internamente a consignas absolutas de pose y apertura de pinza. Lo publica el usuario `muacha` mediante la librería `openpi` y el entrenador PyTorch de ese ecosistema, siguiendo la configuración de los colaboradores `pi05_franka_relative_oct23_10hz` (openpi_stc @ 6039332).

El modelo resuelve un problema muy concreto: disponer de una política entrenada de extremo a extremo para 14 tareas de manipulación grabadas a 10 fps sobre un Franka FR3, con acción relativa (traslación en el marco del mundo respecto a la pose actual, rotación compuesta en SO(3) y pinza absoluta 0/1) y un horizonte de predicción de 50 pasos, equivalente a 5 segundos de ejecución por bloque de acción. Frente a una política con acciones absolutas, la formulación relativa es más robusta a pequeños errores de calibración y a desviaciones acumuladas de la pose de partida.

Su relevancia ahora es la de un artefacto de investigación reproducible: incluye la receta de entrenamiento completa (15.000 pasos, batch global 64 en 4× A100-40GB, bf16, EMA 0,99), estadísticas de normalización publicadas y checkpoints intermedios etiquetados. No hay métricas de evaluación publicadas ni información de licencia, lo que limita su uso fuera de un contexto de laboratorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo VLA derivado de `lerobot/pi05_base`; la model card no detalla capas ni mecanismo de atención) |
| Parámetros totales | 3.616.757.520 (≈3,62 B), según `safetensors` |
| Parámetros activos | No aplica / no disponible (no se documenta que sea un modelo MoE) |
| Longitud de contexto | No disponible (horizonte de acción: 50 pasos ≈ 5 s a 10 Hz) |
| Tipos de cuantización | No disponibles (solo se publican pesos en safetensors; no se documentan GGUF, AWQ, GPTQ ni int8) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (`model.safetensors` con pesos EMA, decay 0,99); checkpoints intermedios etiquetados `step-3000`, `step-6000`, …, `step-15000` |
| Dimensión de estado | 14: x, y, z, rotvec (3), wrench (6), gripper_0, gripper_1; el cuaternión del dataset se convierte a vector de rotación y el estado se pasa como tokens discretos |
| Dimensión de acción | 7: dx, dy, dz, rotvec(R_cur⁻¹·R_target), gripper (absoluto 0/1); salida convertida a `[x, y, z, qx, qy, qz, qw, gripper]` |
| Cámaras | `base_0_rgb` (d435if lateral), `left_wrist_0_rgb` (d405 en muñeca); `right_wrist_0_rgb` enmascarada |
| Frecuencia de control | 10 Hz (dataset a 10 fps) |
| Normalización | Normalización por cuantiles; estadísticas en `assets/yuan1119/many_tasks_rgbdp_10fps_d435if_mu_comp/norm_stats.json` |
| Dataset de entrenamiento | `yuan1119/many_tasks_rgbdp_10fps_d435if_mu_comp` @ `63e3f2c`: 515 episodios, 139.823 frames, 10 fps, 14 tareas (todas usadas en entrenamiento) |
| Tamaño del repositorio | 67,3 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo; únicamente identifica el punto de partida (`lerobot/pi05_base`) y la librería de ejecución (`openpi`). Lo que sí está documentado es la interfaz: el modelo consume dos vistas RGB más un estado de 14 dimensiones (posición, vector de rotación, wrench de 6 componentes y dos valores de pinza) representado como tokens de estado discretos, y produce una secuencia de 7 dimensiones por paso con horizonte 50. La traslación de la acción es relativa a la pose actual en el marco del mundo, la rotación se compone en SO(3) sobre la orientación actual y la pinza se emite en términos absolutos; el pipeline `franka_policy.FrankaRelativeActions` / `FrankaAbsoluteActions` se encarga de reconstruir la consigna absoluta de pose y apertura.

El ajuste fino es completo (todos los parámetros) y se ejecutó durante 15.000 pasos con batch global 64, distribuido en 4× A100-40GB con DDP (4 por GPU × 4 pasos de acumulación de gradiente), precisión bf16 y gradient checkpointing. Optimizador AdamW con recorte de norma 1,0 y schedule coseno: 1.000 pasos de warmup, pico de 2,5e-5 y decaimiento hasta 2,5e-6. Se mantiene una media móvil exponencial de los pesos con decay 0,99, y son precisamente esos pesos EMA los que contiene `model.safetensors` y los que deben usarse en inferencia. Los checkpoints se subieron automáticamente durante el entrenamiento, con la raíz del repositorio apuntando siempre al más reciente.

## Capacidades

- Control de manipulación de extremo a extremo sobre Franka FR3: genera consignas de pose y pinza a partir de observaciones visuales y de estado proprioceptivo.
- Acciones de efector final relativas: traslación relativa a la pose actual en marco del mundo y rotación compuesta en SO(3), lo que reduce la dependencia de una calibración absoluta exacta.
- Fusión de dos cámaras RGB (vista lateral y vista de muñeca) con enmascaramiento explícito de una tercera vista no utilizada.
- Incorporación de señal de fuerza/par: el estado incluye un wrench de 6 componentes, lo que permite condicionar el comportamiento en tareas con contacto.
- Predicción por bloques de 50 pasos (≈5 s a 10 Hz), lo que habilita ejecución con chunking y reduce la frecuencia efectiva de inferencia necesaria.
- Reutilización de estadísticas de normalización publicadas para reproducir el preprocesado exacto.
- Tool calling / function calling: no disponible; el modelo no expone interfaz de herramientas.
- Soporte de agentes o razonamiento multi-paso simbólico: no disponible.
- Capacidades multilingües: no documentadas.
- Modo thinking, visión general o audio: no disponible; la visión está limitada a las dos cámaras del setup de entrenamiento.

## Casos de uso

- **Manipulación pick-and-place en laboratorio con Franka FR3**: la política está entrenada sobre 14 tareas de ese robot con cámaras d435if y d405, por lo que puede desplegarse directamente en un montaje equivalente para tareas de recogida y colocación sin reentrenamiento.
- **Política de referencia para comparar formulaciones de acción**: al usar acciones relativas con horizonte 50, sirve como línea base frente a políticas de acción absoluta en experimentos de robustez frente a error de calibración y deriva de la pose inicial.
- **Selección de checkpoints en función del coste de inferencia**: los tags `step-3000` a `step-15000` permiten evaluar el compromiso entre pasos de entrenamiento y calidad de ejecución sin repetir el entrenamiento.
- **Tareas con contacto que requieren realimentación de fuerza**: la inclusión del wrench de 6 ejes en el estado permite abordar operaciones de inserción o pulsado donde la señal visual por sí sola es insuficiente, siempre que el robot proporcione esa medición.
- **Ajuste fino sobre nuevos datasets con el mismo esquema**: el repositorio documenta configuración, normalización y conversión de acciones, lo que facilita reentrenar el modelo con otras 14 tareas o con un subconjunto de las existentes para estudiar transferencia.
- **Investigación en modelos VLA y destilación**: al ser un fine-tune completo de 3,62 B parámetros con receta y pesos EMA publicados, es un candidato para destilar la política en modelos más pequeños o para estudiar el efecto del ajuste completo frente a LoRA en control robótico.
- **Validación de pipelines de despliegue a 10 Hz**: el modelo exige inferencia sostenida a la frecuencia del dataset (10 fps), por lo que resulta útil como banco de pruebas para medir latencia de un runtime de política en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente `Evaluation: None yet`, por lo que no existen tasas de éxito por tarea, métricas de error de pose ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- **VRAM estimada para inferencia (calculada a partir de 3.616.757.520 parámetros, no medida)**: ≈7,2 GB en bf16/fp16 solo para pesos, ≈14,5 GB en fp32, ≈3,6 GB en int8 y ≈1,8 GB en int4. A ello hay que sumar activaciones y el preprocesado de las dos imágenes RGB, por lo que en la práctica conviene reservar 10-16 GB en bf16.
- **GPU recomendadas**: A100-40GB o H100 para entrenamiento y para servicio de alta concurrencia; A100-80GB si se quiere mantener el modelo junto con otros procesos. Para inferencia de un solo robot, una RTX 4090 (24 GB) es suficiente en bf16.
- **¿Cabe en GPU de consumo?** Sí: en bf16 cabe en GPUs de 12-16 GB (RTX 4080, RTX 4070 Ti Super, RTX 3090), y con cuantización a int8 podría ajustarse en 8-10 GB, aunque no se publican pesos cuantizados y habría que generarlos. La restricción real no es solo la memoria, sino la latencia a 10 Hz.
- **Entrenamiento**: la receta documentada requiere 4× A100-40GB con DDP, bf16 y gradient checkpointing, con batch global 64 y 15.000 pasos.
- **Opciones de despliegue**: la librería declarada es `openpi` (entrenador e inferencia en PyTorch). No se documentan exportaciones a vLLM, llama.cpp, Ollama, TGI, TensorRT ni ONNX, y estos runtimes de LLM no son aplicables a una política de acción con entradas de imagen.
- **Latencia y throughput**: no hay mediciones publicadas. El requisito derivado del dataset es sostener 10 Hz de control; el horizonte de 50 pasos permite ejecutar bloques de 5 s y amortizar la inferencia mediante chunking, pero el tiempo real por bloque no está documentado.
- **Almacenamiento**: el repositorio ocupa 67,3 GB por acumular varios checkpoints; conviene descargar solo el tag necesario en lugar del repo completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `muacha/pi05_franka_relative_10hz` | 3,62 B | Contexto no disponible; horizonte de acción 50 pasos (5 s a 10 Hz) | 2 cámaras RGB + estado 14-D | No disponible | Hugging Face, 0 descargas, 0 likes |
| `lerobot/pi05_base` (modelo base) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | Hugging Face (referenciado como `base_model`) |
| Otras políticas VLA de la misma categoría (p. ej. familias OpenVLA, Octo o RDT) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No verificadas en esta ficha |

No se dispone de datos suficientes en la información proporcionada para establecer una comparación cuantitativa de rendimiento con alternativas. La comparación más fiable es contra el propio modelo base: este checkpoint añade un ajuste fino completo sobre 14 tareas y una formulación de acción relativa, pero no publica evaluación que cuantifique la mejora. La búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo ni sobre políticas comparables.

## Limitaciones y advertencias

- **Licencia no disponible**: no se puede confirmar si el uso comercial está permitido. Al derivar de `lerobot/pi05_base`, la licencia efectiva depende de la del modelo base, que tampoco se detalla aquí; verificar antes de cualquier despliegue productivo.
- **Sin evaluación publicada**: la model card indica `Evaluation: None yet`. No hay tasas de éxito, ni por tarea ni agregadas, por lo que el rendimiento real es desconocido.
- **Cobertura estrecha**: 14 tareas, 515 episodios y 139.823 frames de un único robot (Franka FR3) y una única configuración de cámaras. La generalización a otras tareas, objetos, iluminación o montajes no está caracterizada.
- **Dependencia del hardware exacto**: las cámaras (d435if lateral, d405 en muñeca), sus montajes y la frecuencia de 10 fps forman parte del dominio de entrenamiento; cambiar sensores o encuadres provocará desviación de dominio.
- **Discontinuidad del vector de rotación**: con la pinza orientada hacia abajo, el vector de rotación del estado se sitúa cerca de ±π, de modo que orientaciones casi idénticas pueden aparecer como rx ≈ +3,1 o −3,1. El autor señala que la representación de los colaboradores tiene la misma propiedad y que las acciones relativas no se ven afectadas, pero el estado sí es discontinuo y conviene tenerlo en cuenta al analizar o reentrenar.
- **Dependencia del wrench**: el estado incluye 6 componentes de fuerza/par; si el robot no proporciona esa señal o la proporciona con otro filtrado o escala, el rendimiento puede degradarse.
- **Frecuencia de control baja**: 10 Hz limita las tareas que requieren reactividad alta; el chunking de 50 pasos (5 s) introduce además un retardo entre la observación y el final del bloque ejecutado.
- **Riesgo de alucinación**: no aplica en el sentido de generación de texto, pero sí existe el riesgo análogo de generar trayectorias plausibles no fundamentadas en la observación cuando el estado o las imágenes quedan fuera de la distribución de entrenamiento.
- **Repositorio sobredimensionado**: 67,3 GB por la acumulación de checkpoints; descargar el repo completo es innecesario y costoso.
- **Idiomas no documentados**: no hay información sobre condicionamiento por instrucciones en lenguaje natural, a pesar de que el modelo base pertenece a la familia de modelos visión-lenguaje-acción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muacha/pi05_franka_relative_10hz
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/yuan1119/many_tasks_rgbdp_10fps_d435if_mu_comp
- Repositorio `openpi` (librería y entrenador citados en la model card): https://github.com/Physical-Intelligence/openpi
- Paper, blog o demo específicos del modelo: no disponible
- La búsqueda web realizada no devolvió enlaces técnicos relevantes sobre este modelo; los resultados obtenidos eran contenido no relacionado y se han descartado.
