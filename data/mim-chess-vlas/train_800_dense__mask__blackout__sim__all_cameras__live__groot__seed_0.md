# mim-chess-vlas/train_800_dense__mask__blackout__sim__all_cameras__live__groot__seed_0

## Resumen
Este repositorio contiene una política de imitación para robótica construida con la arquitectura GR00T N1.7 de NVIDIA y entrenada con LeRobot. No es un modelo de lenguaje: es un modelo visión-lenguaje-acción (VLA) que recibe tres imágenes de cámara (224×224), el estado propioceptivo del robot (vector de 9 dimensiones) y una instrucción en lenguaje natural, y devuelve directamente una acción de 7 dimensiones para un brazo Franka Panda. La arquitectura combina un backbone VLM Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, y suma 3.144.016.000 parámetros en pesos safetensors (repositorio de 12,6 GB).

El modelo lo publica la cuenta `mim-chess-vlas` como un checkpoint concreto de una familia de experimentos (el nombre codifica variantes: `dense`, `mask`, `blackout`, `sim`, `all_cameras`, `live`, `seed_0`). Se ha entrenado sobre un único dataset de 776 episodios y 207.203 fotogramas a 20 FPS, con 40 tareas distintas del tipo "coge el objeto X y ponlo en la caja" sobre escenas de cocina y supermercado.

Su relevancia es doble: por un lado demuestra el flujo actual de LeRobot para afinar modelos fundacionales de robótica con un `lerobot-rollout` y un `policy.path`; por otro, al estar liberado con licencia Apache 2.0 y pesos abiertos, sirve como punto de partida reproducible para experimentos de sim-a-real y de robustez perceptiva. Conviene subrayar que es un checkpoint recién creado (28 de octubre de 2026), sin descargas ni validación externa, y sin benchmarks publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (NVIDIA): backbone VLM Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching; política de imitación LeRobot |
| Parametros totales | 3.144.016.000 (≈3,14 B), según safetensors |
| Parametros activos | No aplica (no es un modelo MoE); no se ha publicado desglose por módulos |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors, sin GGUF ni versiones pre-cuantizadas oficiales |
| Idiomas soportados | No disponible; las instrucciones del dataset de entrenamiento están exclusivamente en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 12,6 GB) |
| Tipo de robot | Franka Panda (`Panda`) |
| Camaras de entrada | `agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2` (3 × 3 × 224 × 224) |
| Entrada de estado | `observation.state`, vector de 9 dimensiones |
| Salida | `action`, vector de 7 dimensiones |
| Libreria | LeRobot 0.6.0 |
| Pipeline | robotics |
| Dataset de entrenamiento | `mim-chess-vlas/train_800_dense__mask__blackout__sim__all_cameras__live` |

## Arquitectura y entrenamiento
El modelo sigue el diseño de GR00T N1.7: un backbone de visión-lenguaje (Cosmos-Reason2/Qwen3-VL) que codifica las tres vistas de cámara junto con la instrucción textual, y un transformer de acciones entrenado con flow matching que genera la trayectoria de 7 dimensiones condicionada por la representación multimodal y por el estado propioceptivo del robot. Es, por tanto, una arquitectura híbrida VLM + generador de acciones continuas, no un transformer de texto autoregresivo ni un modelo SSM. La predicción de acciones se hace en espacio continuo mediante integración de un campo de flujo, lo que evita la discretización por bins típica de los VLA basados en tokens.

El ajuste se realizó con LeRobot 0.6.0 durante 60.000 pasos, batch de 16, optimizador AdamW y tasa de aprendizaje 7e-05, con semilla 0. El dataset contiene 776 episodios y 207.203 fotogramas a 20 FPS, con 40 instrucciones de tipo *pick and place* sobre objetos domésticos (jam, cereal, pear, sweet potato, scone, can, hamburger, lemon, squash, cheese, cup, egg, ham, hot dog, apple, bread, candle, chicken breast, jar, knife block, kettle, potato, basket, cake, orange, spice, spray, alcohol, blender jug, mushroom, salt and pepper shaker, tiered shelf, condiment, mango, pitcher, plant, stool, soap dispenser, entre otros). No se documenta en la información disponible si hubo RLHF, DPO ni etapas de post-entrenamiento con refuerzo; en robótica de imitación lo habitual es entrenamiento supervisado sobre demostraciones, que es lo que sugiere la configuración declarada.

El nombre del checkpoint indica condiciones experimentales del dataset de entrenamiento (máscara, *blackout* de cámaras, datos simulados, uso de todas las cámaras y una variante *live*), pero la model card no describe en qué consiste cada variante ni aporta métricas de ablación, por lo que no es posible atribuirle una innovación técnica concreta más allá del uso del backbone y del flujo de acciones de GR00T.

## Capacidades
- Control robótico de manipulación extremo a extremo: dado un estado de 9 dimensiones y tres imágenes, emite una acción de 7 dimensiones por paso, apta para un Franka Panda.
- Seguimiento de instrucciones en lenguaje natural para seleccionar el objeto objetivo entre 40 categorías entrenadas.
- Percepción multivista: integra una vista de escena (`agentview`) y dos vistas de muñeca (`eye_in_hand`, `eye_in_hand_2`), lo que ayuda en el agarre fino y en la corrección de pose.
- Ejecución de una política de imitación entrenada con 207.203 fotogramas de demostraciones reales o simuladas a 20 FPS.
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para ejecución en robot y los scripts de entrenamiento de la guía GR00T para reajuste.
- No se han documentado capacidades de tool calling, function calling, razonamiento multi-paso explícito, visión general (describir imágenes), audio, ni modo *thinking*: el modelo no es un asistente conversacional.
- Capacidad multilingüe: no disponible; las instrucciones vistas en entrenamiento son solo en inglés.

## Casos de uso
- **Manipulación pick-and-place en laboratorio con Franka Panda**: cargar la política con `lerobot-rollout --policy.path=...` y el `--task="Pick the jam and place it into the box"` correspondiente permite reproducir el comportamiento aprendido sin reentrenar; es el caso de uso directo y documentado.
- **Punto de partida para fine-tuning en un dominio propio**: al estar en safetensors con licencia Apache 2.0, se puede reajustar con el pipeline de LeRobot GR00T sobre un dataset propio de otra célula robotizada, sustituyendo instrucciones y objetos.
- **Evaluación de robustez perceptiva ante fallos de cámara**: la variante `blackout` del nombre sugiere entrenamiento con caídas de cámara; el checkpoint sirve para medir cuánto degrada la oclusión total o parcial de una vista la tasa de éxito del agarre.
- **Investigación en sim-a-real**: al haberse entrenado con datos marcados como `sim`, es un sujeto de estudio para medir la brecha de transferencia a un Panda físico y comparar con políticas entrenadas solo con datos reales.
- **Ablación de configuraciones de sensores**: comparar este checkpoint `all_cameras` frente a variantes con menos vistas permite cuantificar la contribución de la segunda cámara de muñeca en tareas de precisión.
- **Automatización de línea de envasado o clasificación de productos**: las 40 clases de objetos domésticos (frutas, envases, utensilios) cubren un espectro realista para tareas de *bin picking* y *kitting* en logística de alimentación.
- **Banco de pruebas docente**: reproduce en un solo comando el ciclo completo observación → instrucción → acción, útil para cursos de aprendizaje por imitación y de VLA.
- **Generación de políticas de referencia para comparativas**: al ser un GR00T N1.7 afinado, sirve como línea base frente a políticas propias en el mismo dataset de 776 episodios.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, error de posición, ni comparaciones con otras políticas; tampoco hay demo en vídeo ni métricas de pérdida de entrenamiento.

| Dato disponible | Valor |
|---|---|
| Pasos de entrenamiento | 60.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 7e-05 |
| Semilla | 0 |
| Episodios del dataset | 776 |
| Fotogramas del dataset | 207.203 |
| Frecuencia de captura | 20 FPS |
| Tareas distintas | 40 |
| Tasa de exito publicada | No disponible |
| MMLU / HumanEval / GSM8K | No aplica (modelo de robotics, no de lenguaje) |

## Requisitos de hardware
- **VRAM de inferencia (estimación a partir del número de parámetros, no dato publicado)**: en bf16 los pesos ocupan ≈6,3 GB (3.144.016.000 × 2 bytes); sumando activaciones del backbone de visión con tres imágenes de 224×224 y el estado del robot, un despliegue realista ronda los 8-12 GB de VRAM.
- **Cuantización**: en int8 se puede estimar ≈3,2 GB de pesos y en 4 bits ≈1,6 GB, pero no hay checkpoints cuantizados oficiales ni soporte documentado para este modelo concreto; habría que validar la pérdida de precisión en acciones continuas.
- **GPU de consumo**: cabe en una RTX 4090 (24 GB) y en una RTX 3090 (24 GB) con margen; en tarjetas de 12-16 GB (RTX 4080, RTX 4070 Ti Super) es viable solo con reducción de precisión o cuantización.
- **GPU de datacenter**: A100 40/80 GB, H100 y L40S son adecuadas tanto para inferencia como para reajuste; el entrenamiento declarado (60.000 pasos, batch 16) es asequible en una sola GPU de 40-80 GB.
- **Opciones de despliegue**: el soportado oficialmente es LeRobot (`lerobot-rollout` con política `groot`) sobre PyTorch. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo VLA con cabeza de acciones por flow matching, y no hay integración publicada.
- **Latencia y throughput**: no disponibles. Como referencia de requisito del sistema, el dataset se capturó a 20 FPS, lo que implica un presupuesto de 50 ms por paso de control; no se ha publicado si el modelo cumple ese presupuesto en ninguna GPU.
- **Almacenamiento**: 12,6 GB de repositorio, a tener en cuenta para el despliegue en el borde.

## Comparativa con modelos similares

| Modelo | Parametros | Entradas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (GR00T N1.7 afinado) | 3,14 B | 3 cámaras 224×224 + estado 9D + instrucción | Apache 2.0 | Pesos abiertos en HuggingFace, 0 descargas | Afinado para Panda y 40 tareas de pick-and-place; sin benchmarks |
| GR00T N1 / N1.x base (NVIDIA) | No disponible para N1.7 (la versión N1 se anunció en el entorno de 2 B) | Visión + lenguaje + propiocepción | Licencia propia de NVIDIA para el modelo base | Pesos abiertos en HuggingFace | Modelo fundacional cross-embodiment; el afinado hereda su arquitectura |
| π0 (Physical Intelligence) | ≈3,3 B (VLM de 3 B + experto de acciones) | Visión + instrucción + estado | Apache 2.0 en el release openpi | Pesos abiertos | Alternativa directa en tamaño y enfoque VLA + flow matching; con más validación pública |
| OpenVLA | ≈7 B (Llama 2 7 B + encoders visuales) | Visión + instrucción | No verificada en esta ficha | Pesos abiertos | VLA autoregresivo por tokens discretos; mayor tamaño y distinto paradigma de acción |
| RDT-1B | ≈1,2 B | Visión + instrucción | No verificada en esta ficha | Pesos abiertos | Modelo de difusión bimanual, mucho más pequeño; otra familia de acción |

Los datos de las filas de modelos alternativos provienen de fuentes públicas de terceros y no se han verificado en esta ficha; tómense como orientativos. En cualquier caso, la comparación honesta con este checkpoint es difícil porque no existen métricas de éxito publicadas para él.

## Limitaciones y advertencias
- **Alcance muy restringido**: entrenado solo para 40 instrucciones de *pick and place* sobre un Franka Panda con una configuración concreta de tres cámaras y estado de 9 dimensiones. Cualquier cambio de robot, de cinemática, de número de cámaras o de resolución invalida la política y exige reentrenar.
- **Sin evidencia de rendimiento**: cero descargas, cero likes, sin demo, sin tasas de éxito y sin ablaciones. No hay ninguna validación independiente de que la política funcione, ni siquiera en el entorno de entrenamiento.
- **Riesgo de brecha sim-a-real**: el nombre del checkpoint incluye `sim`, de modo que los datos podrían ser simulados. No se documenta ninguna evaluación en robot físico, y el desajuste de dinámica, iluminación y textura es la causa habitual de fallo en producción.
- **Riesgo de sobreajuste**: 776 episodios y 207.203 fotogramas es un volumen pequeño para 3,14 B de parámetros; es esperable un sobreajuste a las posiciones, objetos y fondo del dataset.
- **Idioma**: las instrucciones se han visto solo en inglés. No hay evidencia de generalización a instrucciones en castellano ni a paráfrasis alejadas de la plantilla "Pick the X and place it into the box".
- **Fallos silenciosos en lugar de alucinación**: en un VLA el error no se manifiesta como texto inventado, sino como una acción incorrecta (agarre fallido, colisión, objeto equivocado). Hay que instrumentar el bucle de control con límites de par, parada de emergencia y detección de éxito, porque el modelo no señala cuándo no está seguro.
- **Licencia**: la model card declara Apache 2.0, lo que permitiría uso comercial, pero conviene verificar los términos del modelo base GR00T de NVIDIA, cuyos releases han usado licencias propias, y la procedencia del dataset de entrenamiento antes de un despliegue comercial.
- **Nomenclatura opaca**: el identificador (`dense`, `mask`, `blackout`, `sim`, `live`, `chess`) no está explicado en la model card; no se puede saber qué condiciones exactas de entrenamiento aplican sin contactar con el autor.
- **Sin soporte de cuantización ni de servidores de inferencia**: no hay GGUF, TensorRT-LLM, vLLM ni Ollama; el despliegue queda atado al stack LeRobot + PyTorch.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/mim-chess-vlas/train_800_dense__mask__blackout__sim__all_cameras__live__groot__seed_0
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_dense__mask__blackout__sim__all_cameras__live
- Visualizador del dataset (LeRobot): https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_dense__mask__blackout__sim__all_cameras__live
- Guía de GR00T en LeRobot: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Configuración de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Repositorio de NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos correspondían a entidades homónimas (grupos de radiología y un museo de instrumentos musicales) sin relación con el proyecto.
