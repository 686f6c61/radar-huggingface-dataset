# flex-pi/flexpi-robodojo-real

## Resumen

Flex-π · RoboDojo_real es un conjunto de tres checkpoints de política robótica vision-language-action (VLA) publicados por el equipo flex-pi, uno por cada robot del benchmark RoboDojo_real (ARX X5, Piper y Piper X). Se trata de un modelo de manipulación bimanual que combina un experto de vídeo Wan2.2-TI2V-5B con un experto de acción ActionDiT, ambos integrados en una arquitectura Mixture-of-Transformers de 30 capas y aproximadamente 6.000 millones de parámetros. Cada checkpoint se ha afinado desde el modelo base `flex-pi/flexpi-pretrain-preview` (step 190000) sobre las demostraciones específicas de un robot concreto.

El modelo resuelve el problema del control motor de brazos robóticos a partir de observación visual: consume tres cámaras RGB (una de cabeza y dos de muñeca) junto con el estado articular y de efector final de ambos brazos, y devuelve chunks de 32 pasos de acción. No utiliza profundidad ni pointmaps; trabaja exclusivamente con RGB y características DINOv3. Esta especialización por robot es relevante porque demuestra que un mismo backbone preentrenado puede transferirse a morfologías distintas (dos brazos de 6 grados de libertad con pinza) mediante fine-tuning con estadísticas de normalización propias.

La relevancia actual del modelo radica en su enfoque de world model aplicado a robótica: el experto de vídeo Wan2.2 actúa como modelo generativo del entorno y el experto de acción produce trayectorias mediante flow matching. La licencia MIT y el tamaño del repositorio (36,2 GB) lo hacen accesible para investigación, aunque su despliegue requiere infraestructura específica (XPolicyLab, entorno RoboDojo y unos 16 GB de VRAM por servidor).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers: experto de vídeo Wan2.2-TI2V-5B (5,00 B) + experto de acción ActionDiT (1,02 B), 30 capas |
| Parametros totales | Aproximadamente 6,02 B (5,00 B + 1,02 B) |
| Parametros activos | No aplica (no es MoE en el sentido de routing disperso; es una mezcla de expertos densa por modalidad) |
| Longitud de contexto | No disponible (procesa 33 frames de vídeo compuesto a 384×320) |
| Tipos de cuantizacion | No disponible (pesos en bf16) |
| Idiomas soportados | No disponible (modelo de robótica; el codificador de texto umt5-xxl es multilingüe pero no se documenta el conjunto de idiomas) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch, bf16, 12.082.213.237 bytes por checkpoint) |

## Arquitectura y entrenamiento

La arquitectura es una Mixture-of-Transformers que combina dos expertos: un experto de vídeo basado en Wan2.2-TI2V-5B (5.000 millones de parámetros) y un experto de acción ActionDiT (1.020 millones de parámetros), distribuidos en 30 capas. El modelo procesa tres cámaras RGB: una cámara de cabeza a 256×320 y dos cámaras de muñeca a 224×224, redimensionadas desde frames de 480×640 y compuestas en una entrada de 384×320 con 33 frames. Las modalidades de entrada son RGB y características DINOv3 (modelo `timm/vit_base_patch16_dinov3.lvd1689m`); el flujo de pointmap está desactivado. El codificador de texto es umt5-xxl, ejecutado en CPU durante el servicio.

Cada checkpoint se ha afinado desde `flex-pi/flexpi-pretrain-preview` (step 190000) sobre las demostraciones del robot correspondiente, con batch global de 256, 40 épocas (dos ciclos coseno de 20 épocas) y data augmentation de color (brillo 0,3, contraste 0,4, saturación 0,5). Las acciones se representan como chunks de 32 pasos: cada brazo incluye pose del efector final relativa al primer estado del chunk (en el marco de la herramienta), deltas articulares y un valor absoluto de pinza; el adaptador devuelve objetivos absolutos. La normalización es por robot, con q01/q99 agrupado por frame (`dataset_stats.json`). Los tres checkpoints suman 1.794 demostraciones (1.605.637 frames) repartidas en 18 tareas de manipulación bimanual.

## Capacidades

- Manipulación bimanual: control de dos brazos de 6 grados de libertad con pinza, con acciones de pose de efector final, deltas articulares y apertura/cierre de pinza.
- Percepción visual multi-cámara: procesa simultáneamente cámara de cabeza y dos cámaras de muñeca para razonamiento espacial en el espacio de trabajo.
- Generación de trayectorias por flow matching: produce chunks de 32 pasos de acción a 25-30 Hz según el robot.
- World modeling: el experto de vídeo Wan2.2 aporta una representación generativa del entorno que condiciona la generación de acciones.
- Tareas de manipulación específicas: cubrir bloques, insertar tubos, hacer sándwiches, preparar comida, empacar y verter fruta, guardar en caja fuerte (ARX X5); rellenar portalápices, insertar cargador, apilar cuencos, levantar botellas (Piper); tapar bolígrafos, clasificar objetos, desmontar LEGO, colgar tazas, empacar mochilas, barrer bloques (Piper X).
- Tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no documentado explícitamente; el modelo opera como política reactiva por chunk.
- Capacidades multilingües: no disponible (el codificador de texto umt5-xxl es multilingüe, pero no se documenta el uso de instrucciones en lenguaje natural).
- Capacidades especiales: no usa profundidad ni pointmaps; entrenado en RGB + DINO.

## Casos de uso

- Automatización de líneas de montaje con ARX X5: el checkpoint `arx_x5/` ejecuta tareas como `insert_tubes` o `cover_blocks` a 30 Hz, adecuado para celdas de fabricación donde se requiere inserción de precisión con dos brazos.
- Manipulación de objetos domésticos con Piper: el checkpoint `piper/` cubre `fill_pen_holder`, `stack_bowls` y `stand_up_bottles`, útil en robótica de servicio para tareas de ordenación y apilado en entornos domésticos.
- Clasificación y desmontaje con Piper X: `classify_objects` y `disassemble_LEGO` a 25 Hz permiten tareas de reciclaje o desmontaje automatizado donde se requiere identificar y separar componentes.
- Empaquetado logístico: `pack_objects_into_backpack` (Piper X) y `pack_and_pour_fruit` (ARX X5) son aplicables a almacenes y centros de distribución para empaquetado de pedidos con dos brazos.
- Investigación en VLA y world models: el modelo sirve como baseline reproducible en RoboDojo para comparar políticas de flow matching contra imitación conductual clásica, gracias a sus checksums publicados y a la integración con XPolicyLab.
- Prototipado de control bimanual en laboratorio: al requerir unos 16 GB de VRAM y ejecutar el codificador de texto en CPU, puede desplegarse en una estación de trabajo con una sola GPU para experimentos de manipulación con hardware ARX X5 o Piper.
- Benchmarking de transferencia entre morfologías: los tres checkpoints comparten backbone y configuración (`config.yaml` idéntico), lo que permite estudiar la adaptación de un mismo preentrenamiento a distintos robots y frecuencias de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16 GB por servidor de inferencia, con el codificador de texto T5 (umt5-xxl) ejecutándose en CPU.
- GPU recomendadas: no se especifican modelos concretos; una GPU con al menos 16 GB de memoria es el requisito declarado (por ejemplo, RTX 4090, A100 o H100 cumplen holgadamente).
- Cabe en GPU de consumo: sí, siempre que disponga de 16 GB o más de VRAM (RTX 4090, RTX 3090, etc.).
- Opciones de despliegue: adaptador FlexPi de XPolicyLab (rama `flexpi-robodojo-real`), con Python 3.10 y torch 2.7.1+cu128; requiere el entorno RoboDojo, el VAE de Wan2.2, el codificador umt5-xxl y su tokenizer (unos 12,8 GB desde ModelScope), y DINOv3 `timm/vit_base_patch16_dinov3.lvd1689m` desde Hugging Face Hub.
- Latencia y throughput: no disponibles; la frecuencia de control es de 30 Hz para ARX X5 y Piper, y 25 Hz para Piper X.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Flex-π · RoboDojo_real | ~6,02 B (5,00 B vídeo + 1,02 B acción) | 33 frames, 3 cámaras RGB, 384×320 | MIT | Hugging Face, 3 checkpoints |
| flex-pi/flexpi-pretrain-preview | No disponible | No disponible | No disponible | Hugging Face (modelo base) |
| Alternativas VLA comparables | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros modelos VLA de la misma categoría en la documentación proporcionada; la comparativa cuantitativa con alternativas como OpenVLA, π0 o RT-2 no está disponible en esta ficha.

## Limitaciones y advertencias

- Especialización por robot: cada checkpoint funciona únicamente con su robot correspondiente (ARX X5, Piper, Piper X); no hay un checkpoint unificado.
- Dependencia de configuración externa: requiere `env_cfg/<env_cfg_type>.yml` en la raíz de RoboDojo; el repositorio open-source solo incluye `arx_x5.yml`, por lo que sin `piper.yml` o `piper_x.yml` el servidor falla en el arranque con FileNotFoundError.
- Sin percepción de profundidad: el modelo lee solo RGB y DINO; tareas que requieran estimación métrica de profundidad pueden degradarse.
- Sesgos conocidos: no documentados; al entrenarse con demostraciones humanas de RoboDojo, puede heredar sesgos de las trayectorias de los operadores.
- Riesgo de alucinación: no documentado en el contexto de políticas robóticas; el riesgo se traduce en acciones incorrectas o inseguras en el espacio físico.
- Limitaciones de contexto o idioma: no se documenta el uso de instrucciones en lenguaje natural ni el conjunto de idiomas soportados.
- Restricciones de licencia: licencia MIT, permite uso comercial y modificación con atribución; sin embargo, las dependencias (Wan2.2, umt5-xxl, DINOv3) pueden tener licencias propias que deben verificarse por separado.
- Caveat para producción: el adaptador de servicio procede de una rama no fusionada de XPolicyLab (`flexpi-robodojo-real`), verificada en el commit `1f0eb990`; su estabilidad a largo plazo no está garantizada.
- Repositorio de 36,2 GB y checkpoints de 12,08 GB cada uno en bf16, lo que exige almacenamiento y ancho de banda considerables.

## Enlaces

- Hugging Face: https://huggingface.co/flex-pi/flexpi-robodojo-real
- Modelo base: https://huggingface.co/flex-pi/flexpi-pretrain-preview
- Paper (arXiv): https://arxiv.org/abs/2608.10860
- Página del proyecto: https://flex-pi.github.io/
- Repositorio de código: https://github.com/geyan21/flex-pi
- XPolicyLab (rama de servicio): https://github.com/YOLO12138/XPolicyLab/tree/flexpi-robodojo-real
- Adaptador FlexPi: https://github.com/YOLO12138/XPolicyLab/tree/1f0eb99058eac7c8cc32e01198edb2a2ddc806f1/policy/FlexPi
- Commit de referencia: https://github.com/YOLO12138/XPolicyLab/commit/1f0eb99058eac7c8cc32e01198edb2a2ddc806f1
- Dataset RoboDojo: https://huggingface.co/datasets/RoboDojo-Benchmark/RoboDojo
- Wan2.2 (VAE y text encoder): https://huggingface.co/DiffSynth-Studio/Wan-Series-Converted-Safetensors
- Tokenizer umt5-xxl: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- DINOv3: https://huggingface.co/timm/vit_base_patch16_dinov3.lvd1689m
