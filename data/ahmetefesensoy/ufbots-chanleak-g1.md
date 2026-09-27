# AhmetEfesensoy/ufbots-chanleak-g1

## Resumen

Chanleak es una política de control (policy) de seguimiento de movimiento de cuerpo completo para el robot humanoide Unitree G1 de 29 grados de libertad. No es un modelo de lenguaje: es una red neuronal entrenada por aprendizaje por refuerzo que recibe un vector de observación de 1570 dimensiones y devuelve 29 consignas articulares (una por actuador). Está publicada en formato ONNX (opset 13, IR 7) por el usuario AhmetEfesensoy, con inferencia verificada en CPU, y deriva de un ajuste fino sobre el checkpoint `sonic_release` de NVIDIA para GR00T-WholeBodyControl.

Su interés está en el nicho concreto que cubre: reproducir un conjunto de 32 clips de mocap de artes marciales articulados alrededor del Chanleak, la patada voladora de rodilla del Bokator, mezclados deliberadamente con 28 clips de locomoción de BONES-SEED para evitar el olvido catastrófico de la marcha. El autor documenta el problema que resuelve con claridad: un control PD sobre trayectorias retargetizadas alcanza 0 % de éxito porque la corrección cinemática no es equilibrio; la política sube ese éxito al 61 %.

El repositorio ocupa 0,3 GB e incluye cinco variantes ONNX (política principal, encoder, decoder, variante SMPL y variante de teleoperación). El entrenamiento fue deliberadamente corto: 6.933 iteraciones en una única NVIDIA L4 durante unas 10 horas GPU, en torno al 7 % de las 100.000 iteraciones que NVIDIA sugiere para converger, lo que explica que `mpjpe_l` se quede en 38,9 mm frente al objetivo de 30 mm.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de control entrenada con aprendizaje por refuerzo (política whole-body motion-tracking); topología interna no detallada en la model card |
| Parámetros totales | No disponible (el autor no publica el recuento; el repo completo pesa 0,3 GB con cinco variantes ONNX) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; consume un vector de observación de 1570 dimensiones por paso y emite 29 acciones |
| Tipos de cuantización | No disponible; se distribuye únicamente en ONNX (opset 13, IR 7). No se documentan variantes int8/fp16 |
| Idiomas soportados | No aplica (modelo robótico, sin entrada ni salida de texto) |
| Licencia | `other`, con nombre `nvidia-gr00t-and-bones-seed` (términos heredados de NVIDIA GR00T-WholeBodyControl y de BONES-SEED) |
| Formato de pesos | ONNX: `model_step_005000_g1.onnx` (principal), `_encoder.onnx`, `_decoder.onnx`, `_smpl.onnx`, `_teleop.onnx` |
| Dimensión de entrada / salida | Entrada `obs_dict [1, 1570]` → salida `action [1, 29]` |
| Robot objetivo | Unitree G1 de 29 DOF |
| Pipeline declarado | `robotics` |
| Entorno de ejecución | ONNX Runtime (inferencia en CPU verificada) |
| Versión de pesos | `step_005000` |

## Arquitectura y entrenamiento

La model card no describe la topología interna de la red, solo su contrato de entrada/salida y su procedencia: es un ajuste fino del checkpoint `sonic_release` perteneciente a GR00T-WholeBodyControl de NVIDIA. El diseño es el de una política de seguimiento de movimiento de cuerpo completo que mapea observaciones proprioceptivas y de referencia (1570 dimensiones) a consignas de posición para los 29 actuadores del G1, exportada a ONNX para poder ejecutarse sin dependencias de entrenamiento y con inferencia verificada en CPU. El repositorio incluye además un encoder, un decoder y variantes SMPL y de teleoperación, lo que apunta a un pipeline de reconstrucción y retargeting de movimiento además de la política de control pura.

El entrenamiento combinó 32 clips de combate con 28 clips de locomoción de BONES-SEED, con 6.933 iteraciones totales (1.933 + 5.000) sobre una única NVIDIA L4 y unas 10 horas GPU. La mezcla de clips de locomoción es una decisión explícita del autor: ajustar solo con golpes enseña al robot a olvidar cómo caminar. No se documenta el uso de RLHF, DPO ni de ninguna técnica de alineación, algo que no aplica a este dominio. Los datos de movimiento provienen de mocap de combate genérico, no de grabaciones auténticas de Bokator, y el material de referencia incluye CMU Mocap, AMASS, GMR y BONES-SEED. La innovación destacable es menos algorítmica que de ingeniería de datos: articular un dataset pequeño y curado alrededor de un único gesto marcial, con locomoción intercalada, y demostrar que basta un presupuesto de cómputo muy inferior al recomendado para batir de forma clara a un control PD sobre trayectorias retargetizadas.

## Capacidades

- Seguimiento de movimiento de cuerpo completo para el Unitree G1 (29 DOF): genera consignas articulares a partir de un vector de observación de 1570 dimensiones.
- Ejecución de gestos de artes marciales, en particular el Chanleak (patada voladora de rodilla del Bokator) y el resto de los 32 clips de combate del dataset.
- Mantenimiento de la locomoción básica, gracias a la mezcla deliberada de 28 clips de locomoción de BONES-SEED durante el ajuste fino.
- Recuperación y mantenimiento del equilibrio bajo física simulada, que es precisamente la brecha que un control PD no cubre.
- Exportación a ONNX con cinco variantes funcionales: política principal, encoder, decoder, variante condicionada por SMPL y variante de teleoperación.
- Soporte de teleoperación, según la variante `model_step_005000_teleop.onnx` incluida en el repositorio.
- Integración con pipelines de retargeting de mocap a robot mediante las piezas encoder/decoder y SMPL.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni soporte multilingüe: es un controlador robótico especializado.

## Casos de uso

- Investigación en control de cuerpo completo para humanoides: sirve como punto de partida reproducible para estudiar por qué el tracking cinemático no garantiza equilibrio, con una línea base clara (0 % de éxito con PD frente a 61 % con la política) y un contrato ONNX sencillo de integrar en bucles de evaluación.
- Benchmark de robustez en simulación MuJoCo: el modelo permite medir tasa de éxito, `mpjpe_g`, `mpjpe_l` y tasa de progreso sobre 32 clips de combate, lo que resulta útil para comparar variantes de política o distintos presupuestos de entrenamiento.
- Teleoperación de un G1 en entornos peligrosos: la variante `_teleop.onnx` está pensada para que un operador humano dirija al robot, un escenario realista en inspección industrial o manipulación en zonas con riesgo para personas.
- Producción de datos sintéticos de movimiento: el encoder, el decoder y la variante SMPL permiten convertir mocap humano en trayectorias ejecutables por el G1 y generar pares observación/acción para seguir entrenando otras políticas.
- Previsualización de coreografías en animación y videojuegos: el modelo valida si una secuencia de mocap concreta es físicamente ejecutable por un humanoide de 29 DOF, filtrando animaciones que un personaje digital podría representar pero un robot real no sostendría.
- Pruebas de estrés de hardware en el Unitree G1: ejecutar gestos explosivos como una patada voladora de rodilla somete a los actuadores a perfiles de par y velocidad exigentes, útil para validar límites térmicos y mecánicos antes de desplegar tareas más conservadoras.
- Espectáculo y demostración robótica: rutinas de artes marciales como reclamo en ferias, eventos o vídeos divulgativos, aprovechando que el gesto es visualmente reconocible y el modelo está listo para inferencia en CPU.
- Docencia en robótica y aprendizaje por refuerzo: el repositorio es pequeño (0,3 GB), corre en CPU y viene con métricas de referencia, lo que lo hace manejable para prácticas de posgrado sobre políticas de control.

## Benchmarks y rendimiento

Los únicos datos disponibles son los publicados por el autor en la model card, referidos a la tarea de seguimiento de movimiento y no a benchmarks de lenguaje.

| Métrica | Control PD (línea base) | Esta política | Objetivo declarado |
|---|---|---|---|
| Tasa de éxito | 0 % | 61 % | No disponible |
| `mpjpe_g` | No disponible | 189,1 mm | < 200 mm (cumple) |
| `mpjpe_l` | No disponible | 38,9 mm | < 30 mm (no cumple) |
| Tasa de progreso | No disponible | 77 % | No disponible |

El autor señala además que los clips retargetizados seguían los ángulos articulares con un error de entre 2,2 y 3,3 grados bajo física de MuJoCo, y que los 32 clips cayeron dentro de 1,1 segundos. No se han publicado resultados de MMLU, HumanEval ni GSM8K, ni tendrían sentido en este dominio.

## Requisitos de hardware

- Entrenamiento: 1x NVIDIA L4, aproximadamente 10 horas GPU para 6.933 iteraciones. El autor indica que NVIDIA sugiere del orden de 100.000 iteraciones para converger, unas 14 veces más cómputo.
- Inferencia: la política ONNX es muy pequeña (entrada de 1570 valores, salida de 29); el autor confirma inferencia en CPU con ONNX Runtime. VRAM estimada: no disponible de forma oficial, pero por el tamaño del artefacto es inferior a 1 GB.
- GPU recomendadas: no se publican requisitos de inferencia. Para entrenamiento o ajuste fino, el propio autor usó una NVIDIA L4; cualquier GPU con soporte CUDA y suficiente memoria para el pipeline de simulación debería servir, aunque no se documentan cifras.
- GPU de consumo: la inferencia es viable en CPU, por lo que también lo es en cualquier GPU de consumo con soporte ONNX Runtime. No hay cifras publicadas de latencia ni de consumo.
- Despliegue: ONNX Runtime (CPU o GPU). No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Hardware robótico: para despliegue real se requiere un Unitree G1 de 29 DOF, además del stack de control del fabricante. La evaluación del autor se realizó en MuJoCo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Robot objetivo | Tasa de éxito | `mpjpe_g` | `mpjpe_l` | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Chanleak (este modelo) | Política RL de motion tracking, ONNX | Unitree G1, 29 DOF | 61 % | 189,1 mm | 38,9 mm | `other` (`nvidia-gr00t-and-bones-seed`) | HuggingFace, repo de 0,3 GB, 0 descargas |
| Control PD sobre trayectorias retargetizadas | Controlador clásico | Unitree G1 | 0 % | No disponible | No disponible | No aplica | Línea base descrita por el autor |
| GR00T-WholeBodyControl `sonic_release` (NVIDIA) | Política base de la que se parte | Humanoide | No disponible | No disponible | No disponible | Términos de NVIDIA | Repositorio NVlabs/GR00T-WholeBodyControl |

No se dispone de datos de otros modelos comparables de seguimiento de movimiento de cuerpo completo en la información proporcionada, ni de sus métricas de éxito, `mpjpe` o licencias, por lo que la comparación cuantitativa se limita a lo anterior.

## Limitaciones y advertencias

- La tasa de éxito es del 61 %: aproximadamente cuatro de cada diez intentos no completan el gesto, lo que impide considerarlo listo para uso autónomo sin supervisión.
- `mpjpe_l` se queda en 38,9 mm frente al objetivo de 30 mm declarado por el propio autor. La brecha se atribuye a cómputo: solo se ejecutó el 7 % de las iteraciones que NVIDIA recomienda para converger.
- Las secuencias de origen son mocap de combate genérico, no grabaciones auténticas de Bokator, por lo que la fidelidad marcial del gesto es discutible.
- Se excluyen técnicas de grappling y de suelo: el G1 no puede levantarse del suelo, así que cualquier movimiento que implique caída es inejecutable con esta política.
- El ajuste fino sobre golpes puede degradar la locomoción si no se mezclan clips de marcha; el autor lo compensa con 28 clips de BONES-SEED, pero el equilibrio general del repertorio no está cuantificado más allá de la tasa de progreso del 77 %.
- Riesgo de sobreajuste al conjunto curado: 32 clips de combate es un dataset pequeño y la evaluación se realiza sobre la misma familia de movimientos, en MuJoCo, no en hardware real.
- No hay validación externa: el repositorio registra 0 descargas y 0 likes, por lo que no existe reproducción independiente de las cifras.
- La licencia es `other` con nombre `nvidia-gr00t-and-bones-seed`: los términos concretos no se detallan en la información disponible y hay que revisar por separado las condiciones de NVIDIA GR00T-WholeBodyControl y de BONES-SEED antes de cualquier uso comercial o redistribución.
- No se documentan avales de seguridad funcional, certificaciones ni protocolos de parada de emergencia; ejecutar gestos explosivos como una patada voladora sobre hardware real implica riesgo mecánico y de personal.
- El modelo no procesa lenguaje, imagen ni audio, no soporta tool calling y no tiene capacidades de agente: cualquier expectativa en ese sentido es un error de categoría.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AhmetEfesensoy/ufbots-chanleak-g1
- Dataset asociado: https://huggingface.co/datasets/AhmetEfesensoy/ufbots-bokator-g1
- GR00T-WholeBodyControl (NVlabs): https://github.com/NVlabs/GR00T-WholeBodyControl
- BONES-SEED (dataset): https://huggingface.co/datasets/bones-studio/seed
- CMU Mocap: http://mocap.cs.cmu.edu/
- AMASS: https://amass.is.tue.mpg.de/
- GMR: https://github.com/YanjieZe/GMR
