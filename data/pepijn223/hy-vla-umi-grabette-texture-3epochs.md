# pepijn223/hy-vla-umi-grabette-texture-3epochs

## Resumen

Hy-VLA Grabette texture 3epochs es un checkpoint de política robótica de tipo Vision-Language-Action (VLA) publicado por el usuario pepijn223. Se trata de un ajuste fino (fine-tuning) del modelo `pepijn223/hy-vla-umi-grabette-5epochs`, que a su vez deriva del modelo base `lerobot/hy_vla_umi`. El checkpoint finaliza un entrenamiento de continuación de tres épocas adicionales (1.068 actualizaciones) sobre el conjunto de datos `CarolinePascal/grabette-pick-and-place-texture-0`, con el objetivo concreto de ejecutar la tarea "pick up the red cube and put it in the green box" (recoger el cubo rojo y ponerlo en la caja verde) con un brazo robótico único equipado con pinza Grabette.

El modelo combina un codificador visual (imágenes RGB de 360x480 redimensionadas a 224x224), una proyección del estado medido del robot (estrategia/cierre de pinza) y la pose 4x4 del centro de la pinza, junto con una instrucción de tarea en texto, para predecir secuencias de acciones de 50 pasos y 11 canales. La arquitectura mantiene congelado el componente VLM y entrena únicamente el experto de acciones y la proyección de estado, lo que reduce el coste computacional del ajuste.

Es relevante porque ejemplifica el flujo actual de trabajo en robótica con modelos VLA: reutilizar un modelo base preentrenado, ajustarlo con datos de demostración propios y publicar el checkpoint completo con procesadores y tokenizador para que pueda reproducirse en hardware de consumo (incluido Apple Silicon vía MPS). El modelo tiene 4.526.672.912 parámetros y un tamaño de repositorio de 9,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); VLM congelado + experto de acciones + proyección de estado |
| Parametros totales | 4.526.672.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento en BF16; sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo es un VLA que procesa tres entradas: la imagen RGB de la cámara `observation.images.grabette` (3x360x480, redimensionada a 224x224), el estado medido del robot `observation.state` (estrategia/cierre de pinza) y la pose de cinemática directa del centro de la pinza `observation.gripper_pose` (matriz 4x4), además de la instrucción textual de la tarea. La salida es una secuencia de 50 pasos con 11 canales, internamente rellenada hasta la dimensión 32D del modelo preentrenado. Las poses absolutas del efector final se mantienen absolutas en la vista de entrenamiento, pero el procesador guardado expresa las poses futuras relativas a la pose actual del efector: `p_rel = R_t.T @ (p_future - p_t)` y `R_rel = R_t.T @ R_future`, donde Rotation6D contiene las dos primeras filas de la matriz de rotación. Estrategia y cierre permanecen absolutos.

El entrenamiento de continuación se realizó sobre las 60 episodios y 22.771 fotogramas (a 50 Hz) del dataset `CarolinePascal/grabette-pick-and-place-texture-0`, en su revisión `f3903b5d66a7fea38d4f1b69becd1cfc687e6105`. Se usaron cuatro GPU H100 en BF16, batch global de 64, learning rate pico de 2e-5, 100 actualizaciones de warmup y decaimiento coseno hasta 2e-6. Se entrenaron el experto de acciones y la proyección de estado, manteniendo el VLM congelado. No existe split de validación reservado (held-out). Se descartaron 810 filas con SLAM perdido, así como ventanas que cruzaban interrupciones de tracking, saltos de pose detectados o relleno de episodios; la normalización guardada se ajustó solo sobre objetivos válidos. El estado medido de la pinza se mantiene separado de los objetivos comandados (difieren en 16.218 filas), y el decodificado de estrategia/cierre usa la calibración del dataset: proximal = cierre * 1,631882850614698 radianes; distal = estrategia * 1,7802358370342162 radianes, con límites calibrados [0, 1].

## Capacidades

- Generación de acciones robóticas de manipulación: predice 50 pasos de 11 canales (pose relativa del efector final, estrategia y cierre de pinza) a partir de imagen, estado y texto.
- Control de brazo único con pinza Grabette para tareas de pick-and-place guiadas por instrucción textual.
- Procesamiento multimodal: imagen RGB, estado medido del robot y pose de cinemática directa.
- Condicionamiento por lenguaje natural: la tarea se especifica con la instrucción "pick up the red cube and put it in the green box".
- Decodificación a poses absolutas del centro de la pinza en el marco de control en vivo, listas para alimentar una IK compatible.
- Inferencia en CPU (por defecto), Apple Silicon (MPS) y GPU, con carga estricta en MPS mediante streaming de pesos con Accelerate.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Pick-and-place industrial de cubos y objetos texturados: el modelo se usa para recoger un cubo rojo y depositarlo en una caja verde, con la instrucción textual como condicionamiento y la imagen RGB como entrada perceptiva.
- Investigación en robótica de manipulación: sirve como checkpoint de referencia para estudiar el efecto de continuar el entrenamiento tres épocas sobre un dataset específico de texturas, comparándolo con el checkpoint de cinco épocas del que deriva.
- Prototipado en portátil con Apple Silicon: el checkpoint puede cargarse en MPS y ejecutarse con el runner de portátil preparado por el autor, leyendo cámara y estado en vivo y ejecutando IK sin enviar objetivos (modo `--dry_run`), útil para validar calibración y geometría antes de un ensayo físico.
- Validación de contratos geométricos y de calibración: los procesadores guardados permiten auditar el round-trip de 21.367 objetivos válidos con error máximo de 2,384e-7, útil para verificar la cadena de transformaciones pose relativa/absoluta antes de desplegar.
- Integración en pipelines LeRobot: al cargarse con la PR #4196 de LeRobot y sus procesadores y tokenizador guardados, encaja en flujos de evaluación y reproducción de políticas dentro de ese ecosistema.
- Docencia y demostraciones de VLA: el modelo ilustra el ciclo completo de ajuste fino de un VLA con VLM congelado, incluyendo provenance de entrenamiento (`training_provenance.json`) y artefactos de validación en `validation/`.
- Pruebas de decodificación a distintas cadencias: el launcher de portátil fija la cadencia de ejecución y del decodificador a diez acciones conservando los 50 tokens de flujo, lo que permite comparar planes síncronos de 50 pasos frente a ejecuciones de 10 acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta validaciones de guardado/recarga estricta con predicciones sembradas y comandos decodificados bit a bit idénticos, 52 acciones síncronas a través de replanificación y 22 acciones a cadencia de ejecución de diez acciones sobre entradas reales de los episodios 0, 31 y 59, además de auditorías geométricas en CPU con error máximo de 2,384e-7. No se declara ningún resultado de éxito físico ni de tarea held-out. El checkpoint anterior medía aproximadamente cuatro segundos por plan en caliente en un Mac de 24 GB; este checkpoint no ha sido medido en ese Mac.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.526.672.912 parámetros en BF16 el peso ronda los 9 GB, por lo que se requiere al menos ese margen en GPU o el uso de CPU/MPS con streaming.
- GPU recomendadas: el entrenamiento usó cuatro H100; para inferencia no se especifican GPU concretas.
- Cabe en GPU de consumo: no confirmado en la información disponible; el autor documenta ejecución en Apple Silicon (MPS) con carga estricta y streaming de pesos vía Accelerate, y CPU como dispositivo por defecto guardado.
- Opciones de despliegue: LeRobot PR #4196 (commit `e69d46e80dcdda62c51b898fbe4de2dea5e26337`) o descendiente compatible; carga del checkpoint completo con sus procesadores y tokenizador guardados en la raíz del repositorio (omitir `--checkpoint`); para Apple Silicon instalar el extra `hy_vla` y fijar el dispositivo a `mps` antes de `HyVLAPolicy.from_pretrained`; rama de portátil `codex/hy-vla-openarm-mac` con guía de instalación `LAPTOP_SETUP.md`.
- Latencia y throughput: el checkpoint anterior medía unos cuatro segundos por plan en caliente en un Mac de 24 GB; este checkpoint no está medido en ese Mac. El runner síncrono de portátil pausa la ejecución mientras replanifica. El entrenamiento se registró a 50 Hz; la reproducción a 10 Hz estira los intervalos cinco veces.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hy-vla-umi-grabette-texture-3epochs | 4.526.672.912 | no disponible | sin benchmarks publicados; validaciones de guardado/recarga y auditorías geométricas | apache-2.0 | HuggingFace, 20 descargas |
| pepijn223/hy-vla-umi-grabette-5epochs | no disponible | no disponible | sin benchmarks publicados; base del presente checkpoint | no disponible | HuggingFace |
| lerobot/hy_vla_umi | no disponible | no disponible | no disponible | no disponible | HuggingFace (modelo base original) |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a la relación de derivación y a la licencia y disponibilidad conocidas.

## Limitaciones y advertencias

- No hay split de validación reservado (held-out); todas las comprobaciones usan grabaciones de entrenamiento y no se reclama ningún resultado de éxito físico en la tarea OpenArm.
- El modelo está especializado en una única instrucción y tarea ("pick up the red cube and put it in the green box") sobre un brazo único con pinza Grabette; no se documenta generalización a otras tareas u objetos.
- Los ceros y signos articulares reales, la geometría de montaje y los límites de movimiento deben verificarse antes de habilitar objetivos de motor; la model card advierte explícitamente de ello.
- El estado medido de la pinza difiere de los objetivos comandados en 16.218 filas; mezclarlos o decodificar sin la calibración del dataset produce comandos incorrectos.
- No se debe aplicar una segunda conversión relativa ni anclaje de cámara/chunk estilo ACT; la inferencia en vivo debe usar la cinemática directa actual del robot, no posiciones copiadas de una grabación.
- Un runner personalizado debe sobrescribir tanto `config.execution_horizon` como `hy_vla_decode_v1.execution_horizon` guardado, manteniendo `n_action_steps` y `chunk_size` en 50.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- Idiomas soportados y limitaciones de contexto: no disponibles.
- Licencia apache-2.0 permite uso comercial, pero la ausencia de evaluación física y de split held-out limita la confianza para producción sin validación adicional en el robot objetivo.

## Enlaces

- [HuggingFace: pepijn223/hy-vla-umi-grabette-texture-3epochs](https://huggingface.co/pepijn223/hy-vla-umi-grabette-texture-3epochs)
- [Modelo base: pepijn223/hy-vla-umi-grabette-5epochs](https://huggingface.co/pepijn223/hy-vla-umi-grabette-5epochs)
- [Dataset: CarolinePascal/grabette-pick-and-place-texture-0](https://huggingface.co/datasets/CarolinePascal/grabette-pick-and-place-texture-0)
- [Dataset: pepijn223/grabette-slam-consolidated-20261027](https://huggingface.co/datasets/pepijn223/grabette-slam-consolidated-20261027)
- [LeRobot PR #4196](https://github.com/huggingface/lerobot/pull/4196)
- [Rama de portátil: codex/hy-vla-openarm-mac](https://github.com/pkooij/lerobot/tree/codex/hy-vla-openarm-mac)
- [Guía de instalación LAPTOP_SETUP.md](https://github.com/pkooij/lerobot/blob/codex/hy-vla-openarm-mac/lerobot_robot_openarm_gripette/LAPTOP_SETUP.md)
- [Run de entrenamiento en W&B](https://forge.coreweave.com/wandb/pepijn1999kooijmans-open-universiteit/hy-vla-grabette/runs/094ad369)
