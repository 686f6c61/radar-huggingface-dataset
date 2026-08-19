# Dimios45/yam-pick-duster-200-bspline-joint

## Resumen

El modelo `Dimios45/yam-pick-duster-200-bspline-joint` es una política de difusión B-spline (B-spline Policy) entrenada sobre 200 demostraciones de teleoperación de un brazo robótico I2RT YAM realizando una tarea de recogida y colocación: coger un plumero azul y depositarlo en una caja roja. El desarrollo corre a cargo de Dimios45, que publica el modelo bajo licencia MIT en Hugging Face, junto con el dataset asociado `Dimios45/yam-pick-duster-200`. A diferencia de las políticas de difusión convencionales que predicen una cuadrícula fija de acciones, este modelo predice nudos y puntos de control de una curva B-spline, lo que permite obtener una trayectoria continua, remuestreable a cualquier frecuencia y reescalable temporalmente en el momento del despliegue.

La relevancia de este modelo radica en que comanda directamente las articulaciones del brazo (espacio articular), sin necesidad de cinemática inversa en inferencia. Esto lo convierte en una opción directamente desplegable en el hardware YAM, siempre que se apliquen los parches de despliegue específicos que se detallan en la documentación. El modelo emplea una arquitectura UNet de difusión con salida B-spline, con un checkpoint de inferencia de 426 MB (EMA) y un checkpoint completo de 1.5 GB para reanudación o fine-tuning. No se dispone de información sobre el número total de parámetros ni sobre la longitud de contexto, al tratarse de un modelo de control robótico y no de un modelo de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet diffusion policy con salida B-spline (espacio articular) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de control robótico, no LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (.ckpt) |

## Arquitectura y entrenamiento

El modelo se basa en una política de difusión con red UNet que, en lugar de predecir una secuencia fija de acciones, genera los parámetros de una curva B-spline: un vector de nudos (en unidades de frames a 25 Hz) y puntos de control (7 dimensiones, correspondientes a 6 articulaciones en radianes más el estado del gripper). La salida de la red tiene forma `(16, 8)`: la columna 0 es el vector de nudos y las columnas 1-7 son los puntos de control. El grado del B-spline es 3, con un `chunk_size` de 10 y un `max_error` de 0.002 rad.

El entrenamiento se realizó sobre 200 episodios, con 76 609 frames a 25 Hz, lo que genera 76 409 chunks B-spline. Se usó un hardware de una RTX 4090 durante aproximadamente 5.4 horas, con 251 épocas y un batch de 64. El optimizador fue AdamW con learning rate 1e-4, programación coseno y 500 pasos de warmup, junto con EMA. El scheduler de difusión es DDIM con 100 timesteps de entrenamiento y 16 pasos de inferencia, con predicción de epsilon. La pérdida final en época fue de 0.00124, partiendo de 0.167 en la época 0. El presupuesto de 251 épocas se eligió basándose en el número de pasos de gradiente (~300k), no copiado del modelo de 50 episodios.

## Capacidades

- Generación de trayectorias continuas de manipulación robótica mediante B-splines, remuestreables a cualquier frecuencia y reescalables temporalmente.
- Comando directo de articulaciones (6 DOF + gripper) sin necesidad de cinemática inversa en inferencia.
- Observación multimodal: imagen RGB de cámara superior (84x84, sin recorte) e imagen de muñeca (84x84), junto con la posición articular medida.
- Soporte de dos pasos de observación con recorte aleatorio en entrenamiento (76x76) y recorte central en evaluación.
- Control de gripper con convención 0 = abierto, 1 = cerrado.
- Inferencia en tiempo real: 13.2 ms con 4 pasos DDIM en RTX 4090, 44.9 ms con 16 pasos.
- Capacidad de reanudación y fine-tuning mediante el checkpoint completo con estado del optimizador.

## Casos de uso

- Recogida y colocación de objetos en entornos de investigación robótica: el modelo está entrenado específicamente para la tarea de coger un plumero y colocarlo en una caja, sirviendo como referencia para validar pipelines de aprendizaje por imitación.
- Evaluación de políticas de difusión B-spline en espacio articular frente a espacio cartesiano: el modelo se complementa con su contraparte de efector final (`yam-pick-duster-200-bspline-ee`) para comparar ambas representaciones de acción sobre las mismas demostraciones.
- Despliegue en tiempo real sobre el brazo YAM: gracias a la baja latencia de inferencia (44.9 ms con 16 pasos en GPU), es viable ejecutar el control a 25 Hz con margen suficiente dentro de la ventana de 0.4 s por chunk.
- Estudio de políticas de difusión con salida B-spline para generación de trayectorias continuas: el modelo sirve como ejemplo práctico de cómo parametrizar acciones con nudos y puntos de control en lugar de grids discretos.
- Entrenamiento de modelos de imitación con datasets de teleoperación: el checkpoint completo permite reanudar el entrenamiento o ajustar la política con nuevas demostraciones.
- Investigación sobre control articular sin cinemática inversa: el modelo demuestra que es posible comandar articulaciones directamente desde una política aprendida, simplificando el pipeline de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la evolución de la pérdida de entrenamiento (0.167 inicial, 0.00124 final) y la latencia de inferencia medida en hardware concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero el checkpoint de inferencia pesa 426 MB, por lo que cabe en cualquier GPU con más de 1 GB de VRAM.
- GPU recomendada: RTX 4090 (usada en entrenamiento y mediciones de latencia). También se puede ejecutar en CPU (i9-13900K con 8 hilos) con 16 pasos DDIM a 164.3 ms, aunque se recomienda reducir a 8 pasos (95.1 ms) en sistemas CPU de gama NUC.
- Compatible con GPUs consumer: sí, al menos con RTX 4090 y similares (RTX 3090, 3080, etc.) dado el tamaño reducido del checkpoint.
- Opciones de despliegue: no es compatible con vLLM, Ollama o TGI. Requiere el entorno `bspline-policy` con parches específicos de despliegue para espacio articular (decoder `single_yam_joint`, modo joint en `yam_server`, cámara `top_image`). El comando de rollout se ejecuta con `rollout_local_policy.py`.
- Latencia y throughput medidos: en RTX 4090, 13.2 ms (4 pasos), 23.7 ms (8 pasos), 44.9 ms (16 pasos); en CPU i9-13900K, 55.8 ms, 95.1 ms y 164.3 ms respectivamente.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos de la misma categoría. El propio autor publica dos modelos relacionados: `yam-pick-duster-bspline-joint` (50 episodios, superado por este) y `yam-pick-duster-200-bspline-ee` (misma tarea, pero en espacio cartesiano y requiriendo cinemática inversa). No obstante, no hay datos de rendimiento comparativo entre ellos más allá de la pérdida de entrenamiento (0.005 vs 0.007 en la época 100, favorable al modelo de 200 episodios).

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea concreta (recoger un plumero azul y colocarlo en una caja roja) con un brazo YAM específico; no es generalizable a otras tareas sin reentrenamiento.
- Requiere parches de despliegue que no están incluidos en el repositorio upstream de `B-spline-policy/bspline-policy`. Es imprescindible aplicar las modificaciones listadas en la documentación del proyecto `yam-duster-bspline-dp`.
- La convención del gripper (0 = abierto, 1 = cerrado) debe verificarse en hardware antes del despliegue para evitar comportamientos incorrectos.
- Los flags de despliegue son críticos: `--origin-time-scale` debe ser 25 (no 10 como en el modelo de efector final), y `--data-freq` debe coincidir. Un valor incorrecto provoca que el brazo se mueva a velocidad reducida sin error aparente.
- En CPU, 16 pasos de inferencia pueden exceder la ventana de tiempo disponible; se recomienda usar 8 pasos en sistemas de gama NUC.
- No se han documentado sesgos ni riesgos de alucinación, al tratarse de un modelo de control y no de generación de texto.
- El modelo fue creado en agosto de 2026 y no se ha verificado su funcionamiento en versiones posteriores del entorno de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dimios45/yam-pick-duster-200-bspline-joint
- Dataset asociado: https://huggingface.co/datasets/Dimios45/yam-pick-duster-200
- Modelo de efector final (misma tarea, espacio cartesiano): https://huggingface.co/Dimios45/yam-pick-duster-200-bspline-ee
- Modelo previo de 50 episodios: https://huggingface.co/Dimios45/yam-pick-duster-bspline-joint
- Proyecto de despliegue con parches: https://huggingface.co/Dimios45/yam-duster-bspline-dp
- Documentación del brazo YAM: https://github.com/B-spline-policy/bspline-policy/blob/main/real_env/i2rt/docs/products/yam-arm.md
- Paper de referencia de B-spline Policy: https://arxiv.org/abs/2607.09648 (según los tags del modelo)
