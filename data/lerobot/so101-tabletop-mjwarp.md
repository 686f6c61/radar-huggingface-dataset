# lerobot/so101-tabletop-mjwarp

## Resumen

`lerobot/so101-tabletop-mjwarp` es un entorno de simulación robótica empaquetado para EnvHub, no un modelo de lenguaje. Lo publica el equipo de LeRobot (Hugging Face) y reproduce la tarea de escritorio del robot SO-101: colocar cuatro cubos en una caja verde. Su particularidad es que está implementado de forma nativa sobre MuJoCo Warp, con simulación física y renderizado de cámara ejecutándose en paralelo en el mismo dispositivo Warp (GPU NVIDIA o CPU para desarrollo).

El entorno está pensado para evaluación de políticas de aprendizaje por imitación y refuerzo visual en LeRobot. Expone una interfaz por lotes (Gym con arrays NumPy) y una interfaz experimental de tensores en PyTorch que evita descargar las observaciones de cámara a CPU, lo que permite encadenar renderizado, preprocesado, inferencia y control en el mismo stream CUDA.

Es relevante porque elimina el cuello de botella clásico de los entornos MuJoCo de un solo mundo: con un único `mujoco_warp.Data` que contiene todos los mundos, se pueden ejecutar decenas de episodios simultáneos con imágenes de 480×640 por cámara, algo útil para evaluaciones por lotes y para entrenamiento con datos sintéticos. La licencia Apache-2.0 facilita su uso comercial e integración en pipelines.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Entorno de simulacion robotica (MuJoCo 4.0.1 + MuJoCo Warp 4.0.1 + Warp 1.19.0) |
| Parametros totales | no disponible (no es un modelo neuronal) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible; horizonte de episodio por defecto de 3.600 pasos a 30 Hz |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache-2.0 (codigo y escena); `robotstudio_so101` de MuJoCo Menagerie tambien Apache-2.0 |
| Formato de pesos | no disponible (assets de escena y robot; no hay pesos de red) |

## Arquitectura y entrenamiento

No hay red neuronal ni entrenamiento asociado: es un entorno de simulación. La física se ejecuta con MuJoCo Warp 4 sobre Warp 1.19.0, con precisión float32, y el renderizado de cámara corre en el mismo dispositivo Warp que la simulación. Un único `mujoco_warp.Data` agrupa todos los mundos del lote, y el renderizado de las cámaras `front` y `wrist` se hace de forma batched.

La escena y los assets del robot provienen de `lerobot/so101-tabletop-mujoco` en la revisión `844dee6c058960c2ef42b65e2c68b47a5cf7c4f3`. La tarea consiste en introducir cuatro cubos en la caja verde; la recompensa es la fracción de cubos dentro de la caja y el éxito termina el episodio. El muestreo de reset sigue al entorno original: `reset(seed=int)` siembra el mundo `i` con `seed + i`, admite lista de semillas y un `reset_mask` booleano para reiniciar mundos selectivamente. No hay autoreset.

Como innovaciones técnicas destacan el renderizado con sombras, skybox, texturas y las luces y materiales originales de la escena activados por defecto (configurables con `use_shadows` y `render_skybox`), y la interfaz experimental de tensores en PyTorch: los kernels de Warp se ejecutan en el stream CUDA actual de PyTorch, de modo que renderizado, preprocesado, inferencia y control quedan ordenados sin descargar observaciones de cámara. No hay captura de CUDA graphs implementada.

## Capacidades

- Simulación física batched de la tarea de escritorio SO-101 con múltiples mundos independientes en un solo dispositivo Warp.
- Renderizado de dos cámaras RGB uint8 por defecto a 480×640 (`pixels.front` y `pixels.wrist`), con resolución configurable vía `observation_height` y `observation_width`.
- Observaciones con `agent_pos` y seis objetivos articulares absolutos en unidades del SO-101 follower: grados para las cinco articulaciones del brazo y 0–100 para la pinza.
- Interfaz Gym que devuelve arrays NumPy, con píxeles desempaquetados a uint8 en el dispositivo Warp antes de la transferencia.
- Interfaz experimental de tensores en PyTorch (`observation_backend="torch"`) que devuelve imágenes y estados en el dispositivo Warp y acepta acciones tensoriales; requiere un checkout de LeRobot con preparación de observaciones tensoriales y soporte de `metadata["tensor_actions"]`.
- Reset selectivo por máscara y por semilla para evaluación por lotes.
- Opciones de configuración: `fps`, `episode_length`, `initial_joints`, `randomize`, `cameras`, `camera_fovy`, `observation_height`, `observation_width`, `nconmax`, `njmax`, `device`, `use_shadows`, `render_skybox` y `render_pixels`.
- Integración con `lerobot-eval` mediante `--env.type=envhub` y `--env.use_native_batch=true`.
- Ejecución en CPU para desarrollo y tests (`SO101_TEST_DEVICE=cpu` o `cuda:0`).

## Casos de uso

- Evaluación por lotes de políticas SO-101: con `lerobot-eval`, `--eval.batch_size=32` y `--eval.n_episodes=32` se evalúan 32 episodios simultáneos en un solo proceso, aprovechando el batching nativo del entorno.
- Generación de datos sintéticos para aprendizaje por imitación: el renderizado batched de las cámaras `front` y `wrist` permite producir pares observación-acción a 30 Hz con reinicios selectivos por semilla para cubrir distribuciones de estado inicial.
- Pruebas de robustez visual: las opciones `use_shadows`, `render_skybox` y `randomize` permiten variar condiciones de renderizado y comprobar la sensibilidad de una política a cambios de iluminación y texturas.
- Validación de pipelines de control en tiempo real: con la interfaz de tensores en PyTorch, renderizado, preprocesado, inferencia y control se ordenan en el mismo stream CUDA sin descargar imágenes, lo que sirve para medir latencia de extremo a extremo.
- Regresión continua en CI de robótica: los tests incluidos cubren paridad de reset con semilla, independencia de cámaras, reset selectivo, truncamiento, renderizado de objetos en movimiento, desempaquetado RGB, frames de vídeo cacheados y preservación de luces y materiales.
- Comparación de fidelidad de simuladores: el script `render-study/run.py` con `MUJOCO_GL=egl` reproduce la comparativa de cámaras frente a MuJoCo OpenGL clásico, útil para estudiar la brecha de renderizado antes de trasladar políticas a hardware.
- Desarrollo y depuración sin GPU: el dispositivo CPU permite ejecutar el mismo entorno en portátiles o runners sin NVIDIA, con la misma interfaz Gym.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU NVIDIA con driver funcional y Python 3.12; MJWarp 4 es el único runtime soportado.
- Dispositivo CPU disponible para desarrollo y tests, con la misma interfaz.
- VRAM estimada: no disponible en la información proporcionada; depende del número de mundos (`n_envs`), de la resolución de observación y de las capacidades de contacto (`nconmax`, `njmax`).
- GPU recomendadas: no disponible de forma explícita; el ejemplo de uso emplea `cuda:0` y el de evaluación `--policy.device=cuda`.
- Despliegue: paquete de entorno EnvHub cargado desde el Hub (`--env.hub_path=lerobot/so101-tabletop-mjwarp`) o desde un checkout local, con `--env.trust_remote_code=true` y `--env.use_native_batch=true`; `use_async_envs` debe ser `false`. El adaptador simulator-server / SimRobot no soporta este batching nativo.
- Latencia y throughput: no disponibles; el horizonte por defecto es de 3.600 pasos a 30 Hz por episodio y el renderizado se ejecuta junto a la física en el mismo dispositivo Warp.
- No se instala PyTorch con el paquete del entorno; debe usarse la instalación del runtime de la política.

## Comparativa con modelos similares

| Entorno | Runtime | Batching nativo | Renderizado | Licencia |
|---|---|---|---|---|
| `lerobot/so101-tabletop-mjwarp` | MuJoCo Warp 4 + Warp 1.19.0 | Si, un `mujoco_warp.Data` para todos los mundos | Batched en el dispositivo Warp, camaras front y wrist | Apache-2.0 |
| `lerobot/so101-tabletop-mujoco` | MuJoCo clasico | No documentado | MuJoCo OpenGL clasico | Apache-2.0 (segun origen de assets) |
| Adaptador simulator-server / SimRobot | Servidor de simulacion | No soporta el batching nativo de este entorno | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje ni de visión: no genera texto, código ni respuestas; cualquier uso fuera de simulación robótica es inadecuado.
- La física en float32 puede divergir numéricamente de MuJoCo en CPU; la similitud de imágenes renderizadas no garantiza paridad de políticas.
- El renderizado difiere del MuJoCo OpenGL clásico; la comparativa en `render-study/comparison.png` ilustra las diferencias restantes. El renderizador preserva la escena pero no aplica calibración de color ni de iluminación.
- No hay autoreset: si un mundo termina, el llamador debe descartar sus transiciones posteriores o reiniciarlo con `reset_mask`.
- La captura de CUDA graphs no está implementada.
- En la interfaz de tensores, las imágenes son vistas prestadas válidas solo hasta el siguiente `step()` o `reset()`; hay que clonarlas para retener frames.
- En evaluación con la interfaz NumPy, el preprocesado de la política y las acciones siguen cruzando la frontera CPU/GPU.
- La interfaz de tensores es experimental y exige un checkout de LeRobot con soporte de observaciones tensoriales y `metadata["tensor_actions"]`; con otros checkouts debe usarse el backend NumPy por defecto.
- El batching nativo es obligatorio para la evaluación y `use_async_envs` debe ser `false`; conviene fijar la revisión del Hub para ejecuciones reproducibles.
- Las capacidades de contacto y restricciones (`nconmax`, `njmax`) deben ajustarse a la carga de trabajo prevista.
- Sin datos publicados de sesgos, alucinación o rendimiento comparativo al no tratarse de un modelo generativo.

## Enlaces

- Hugging Face: https://huggingface.co/lerobot/so101-tabletop-mjwarp
- Entorno base de escena y robot: https://huggingface.co/lerobot/so101-tabletop-mujoco
- MuJoCo Menagerie (origen de `robotstudio_so101`): https://github.com/google-deepmind/mujoco_menagerie
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- MuJoCo Warp: https://github.com/google-deepmind/mujoco_warp
- Warp: https://github.com/NVIDIA/warp
