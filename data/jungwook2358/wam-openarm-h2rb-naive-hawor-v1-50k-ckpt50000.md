# jungwook2358/wam-openarm-h2rb-naive-hawor-v1-50k-ckpt50000

## Resumen

`wam-openarm-h2rb-naive-hawor-v1-50k-ckpt50000` es un checkpoint de política robótica (pipeline `robotics`) publicado por el usuario de HuggingFace `jungwook2358`, correspondiente al experimento EXP-0019 del proyecto WAM. Se trata de un modelo de flow matching conjunto de vídeo y acción ("joint video+action flow matching") entrenado desde cero sobre el modelo base Wan2.2-TI2V-5B, es decir, un diffusion transformer (DiT) de aproximadamente 5.000 millones de parámetros adaptado de generación vídeo a generación de acciones motoras. La variante "naive" indica que no emplea teacher FRED, ni iBOT, ni CogAlign durante el entrenamiento, por lo que funciona como ablación de referencia frente a otras recetas del mismo proyecto.

El modelo resuelve el problema de aprendizaje de políticas de manipulación bimanual para el robot OpenArm a partir de una mezcla de datos de robot y de vídeo humano (aproximadamente 553 episodios de robot y 1.187 de humano), aplicando etiquetado de manos humanas basado en HaWoR. Su relevancia es fundamentalmente de investigación: documenta una receta reproducible (job `jungwook-wam-openarm-h2rb-naive-50k-4gpu-bg2`, 4 GPUs, 64 filas por paso, 50.000 pasos) para transferencia humano-a-robot con etiquetas de acción absolutas en el espacio PRQ30 de 30 dimensiones.

El checkpoint se publica como estado de entrenamiento de HuggingFace Trainer (3 shards safetensors, 12,5 GB de repositorio) sin los estados del optimizador DeepSpeed (72 GB excluidos). No incluye métricas de éxito, benchmarks ni demostraciones, y en el momento de la ficha no registra descargas ni valoraciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) derivado de Wan2.2-TI2V-5B, con flow matching conjunto de vídeo y acción |
| Parametros totales | Aproximadamente 5.000 millones (heredados del base Wan2.2-TI2V-5B; el autor no publica el recuento exacto del checkpoint) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el sentido de ventana de tokens; horizonte de acción de 24 pasos y secuencia de vídeo de 9 fotogramas (1 de condicionamiento + 8 futuros, stride 3) |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no hay GGUF ni versiones cuantizadas) |
| Idiomas soportados | No disponible / no aplica (política robótica; no se documenta ningún componente lingüístico) |
| Licencia | `other` (términos no detallados en la model card; requiere revisión antes de uso comercial) |
| Formato de pesos | safetensors (3 shards + índice), con `config.json`, `processor_config.json`, `statistics.json`, `embodiment_id.json`, `experiment_cfg/`, `trainer_state.json`, `scheduler.pt` y estados RNG |

## Arquitectura y entrenamiento

La arquitectura es un transformer de difusión con flow matching que modela de forma conjunta fotogramas de vídeo y vectores de acción, partiendo de los pesos de Wan2.2-TI2V-5B (modelo imagen-a-vídeo de 5B) y reentrenando desde cero la política con `OPENARM_ARM=naive` y `OPENARM_LABELS=hawor`. La entrada de vídeo se compone en estéreo concatenado verticalmente a 192x256 píxeles, con la vista izquierda del humano en negro, y se aplica enmascaramiento de vistas con probabilidades 0,5 / 0,25 / 0,25. La secuencia temporal usa stride 3 (1 fotograma de condicionamiento más 8 futuros).

Los datos siguen la composición del paper FRED para OpenArm: 6 subconjuntos de robot (553 episodios) y 5 de humano (1.187 episodios), con una mezcla exacta de 32 filas de robot y 32 de humano por paso (64 filas por paso en 4 GPUs) durante 50.000 pasos. Las acciones y estados se representan en formato PRQ30 bimanual —`[izquierda: wrist_pos3 | wrist_rot6d6 | hand_q6 | derecha: idem]`—, en valores absolutos, en el sistema de la cámara derecha ZED (FRAME V1: cinemática directa del robot en la pose fija de cabeza egopi más una transformación afín V1), normalizados por cuantiles q01/q99 y con máscaras de validez (`WAM_ROW_VALIDITY=1`). Las etiquetas humanas son la versión v1 basada en HaWoR (etiquetas 30-D de mano derecha para los conjuntos rlwrld y air-fryer); los conjuntos anyh2r y left_hand_box quedan sin etiquetar con validez 0. No se documenta uso de RLHF, DPO ni preferencias humanas: el entrenamiento es puramente de imitación supervisada sobre flow matching.

## Capacidades

- Generación de trayectorias de acción bimanual para el robot OpenArm con horizonte de 24 pasos, en el espacio PRQ30 (posición de muñeca, rotación 6D y 6 articulaciones de mano por cada brazo).
- Predicción conjunta de vídeo futuro y acción, lo que permite visualizar la consecuencia esperada de la política además de emitir comandos.
- Aprendizaje a partir de datos heterogéneos: mezcla explícita de episodios de robot y de vídeo humano con etiquetas de pose de mano.
- Generalización a escenas de cocina y manipulación doméstica del conjunto de datos (por ejemplo, manejo de freidora de aire), dentro del dominio de entrenamiento.
- Soporte de máscaras de validez por fila para tratar datos parcialmente etiquetados.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, agentes, visión general, audio ni modos de "pensamiento": no es un modelo de lenguaje.

## Casos de uso

- **Manipulación bimanual en laboratorio con OpenArm:** el checkpoint se carga como política y emite acciones absolutas de 30 dimensiones en el marco de la cámara ZED derecha, con horizonte 24, lo que permite ejecutar episodios de puertas y tareas de cocina del conjunto de entrenamiento.
- **Investigación en transferencia humano-a-robot:** sirve como referencia "naive" para medir la contribución de técnicas como teacher FRED, iBOT o CogAlign, al haber sido entrenado sin ninguna de ellas sobre los mismos datos y pasos.
- **Reproducción de experimentos de flow matching conjunto vídeo-acción:** al publicarse el `trainer_state.json`, el `scheduler.pt` y los estados RNG, permite reanudar o auditar la curva de entrenamiento de los 50.000 pasos.
- **Punto de partida para fine-tuning en tareas nuevas:** con 553 episodios de robot como base, se puede afinar el checkpoint en un subconjunto reducido de tareas (por ejemplo, air-fryer) para estudiar cuántos episodios adicionales hacen falta.
- **Control predictivo por horizonte deslizante:** el horizonte de 24 pasos permite ejecutar solo los primeros k pasos y replanificar, integrándose en un bucle MPC a baja frecuencia con el resto del stack de control del robot.
- **Evaluación de etiquetado automático de manos:** los conjuntos con validez 0 (anyh2r, left_hand_box) permiten cuantificar el impacto de las etiquetas HaWoR frente a la versión v2 basada en RLHND, en ejecuciones separadas.
- **Docencia y divulgación:** como ejemplo completo de pipeline de entrenamiento con 4 GPUs, mezcla robot/humano y checkpoints intermedios, útil para cursos de aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito en tareas, ni comparaciones con el resto de variantes del proyecto (FRED teacher, iBOT, CogAlign, etiquetas RLHND v2), ni métricas de error de predicción de acción o de reconstrucción de vídeo.

## Requisitos de hardware

- **Tamaño en disco:** 12,5 GB de repositorio (3 shards safetensors); los estados del optimizador DeepSpeed, 72 GB, no se incluyen.
- **VRAM estimada para inferencia:** aproximadamente 11-13 GB solo para pesos en bf16/fp16, más activaciones del decodificador de vídeo y del transformer de difusión; en la práctica se recomienda un mínimo de 16-24 GB.
- **GPU recomendadas:** A100 40/80 GB, H100, L40S o RTX 4090 24 GB para inferencia en precisión nativa.
- **¿Cabe en GPU de consumo?** Sí en RTX 4090 (24 GB) y RTX 3090 (24 GB); en RTX 4080 (16 GB) queda muy ajustado y no hay cuantizaciones publicadas que reduzcan la huella.
- **Opciones de despliegue:** no aplica vLLM, TGI, llama.cpp ni Ollama (no es un modelo de lenguaje). La inferencia debe hacerse con el código del proyecto, rama `jungwook/openarm-fred-ft` del repositorio `actlat-wam` (commit 817e3bb), usando el script `run_scripts/train/wam_dit4dit/openarm/finetune_openarm_prq30_h2rb.sh` y la configuración de modalidad `gr00t/configs/data/openarm_prq30_v1_config.py`.
- **Latencia y throughput:** no disponibles. El coste por paso de difusión es el de un DiT de 5B con 9 fotogramas de vídeo a 192x256; no se documentan tiempos de inferencia ni frecuencia de control alcanzable.

## Comparativa con modelos similares

Comparación orientativa con otras políticas robóticas abiertas de propósito general. Los valores de los modelos ajenos no se han verificado en el contexto de esta ficha y deben contrastarse en sus repositorios.

| Modelo | Parametros | Tipo | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wam-openarm-h2rb-naive (este) | ~5.000 M | DiT flow matching vídeo+acción | 553 ep robot + 1.187 ep humano (OpenArm) | `other` | Checkpoint 50k en HF, 0 descargas |
| NVIDIA GR00T N1 | ~2.000 M (no verificado) | DiT + modulo VLM, doble sistema | Mezcla heterogenea de robot y humano | Licencia especifica de NVIDIA (no verificada) | Pesos abiertos en HF |
| Physical Intelligence pi-0 | ~3.300 M (no verificado) | VLM + flow matching de acciones | Datos propios multirobot | No verificada | Pesos y codigo publicados (openpi) |
| OpenVLA | ~7.000 M | VLM autoregresivo con tokens de accion | Open X-Embodiment | MIT (no verificado) | Pesos abiertos en HF |
| RDT-1B | ~1.300 M | Diffusion transformer bimanual | Datos multirobot + humano | No verificada | Pesos abiertos en HF |

La diferencia principal frente a estas alternativas es la especialización: este checkpoint está atado al robot OpenArm, a la cámara ZED derecha y al esquema PRQ30, mientras que las alternativas citadas apuntan a generalización multi-embodiment.

## Limitaciones y advertencias

- **Licencia `other` sin texto:** la model card no reproduce los términos; es obligatorio contactar con el autor o revisar los metadatos del repositorio antes de cualquier uso comercial o redistribución.
- **Ausencia total de validación externa:** 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de terceros de que la política funcione fuera del entorno de entrenamiento.
- **Sin benchmarks ni tasas de éxito:** no se puede comparar su rendimiento con las variantes FRED/iBOT/CogAlign ni con el estado del arte.
- **Etiquetado humano parcial:** las etiquetas HaWoR v1 solo cubren la mano derecha en rlwrld y air-fryer; anyh2r y left_hand_box quedan con validez 0, lo que puede sesgar la política hacia la mano derecha y degradar el comportamiento bimanual.
- **Riesgo de sobreajuste al dominio:** el modelo se entrena exclusivamente con tareas de OpenArm del paper FRED; se espera un fallo sistemático ante objetos, iluminación, cámaras o robots diferentes.
- **Dependencia de código no empaquetado:** requiere una rama concreta (`jungwook/openarm-fred-ft` @817e3bb) y una configuración de modalidad específica; no hay API estándar ni servidor de inferencia.
- **Reproducibilidad incompleta:** no se publican los estados del optimizador DeepSpeed (72 GB), por lo que reanudar el entrenamiento de forma idéntica no es posible; solo se pueden reanudar scheduler y RNG.
- **Alucinación en sentido robótico:** al ser un modelo generativo de acciones, puede producir trayectorias plausibles pero físicamente inválidas; es imprescindible un limitador de seguridad y comprobaciones de cinemática antes de enviar comandos al robot real.
- **Idioma y modalidad textual no disponibles:** no procesa instrucciones en lenguaje natural documentadas; cualquier control por texto requiere un componente externo.
- **Metadatos con fecha futura:** la fecha de creación indicada (2026-10-21) debe tratarse con cautela al citar el modelo.

## Enlaces

- HuggingFace: https://huggingface.co/jungwook2358/wam-openarm-h2rb-naive-hawor-v1-50k-ckpt50000
- Repositorio de código referenciado en la model card: rama `jungwook/openarm-fred-ft` (commit 817e3bb) del proyecto `actlat-wam`; el autor no proporciona URL directa.
- Script de entrenamiento citado: `run_scripts/train/wam_dit4dit/openarm/finetune_openarm_prq30_h2rb.sh` (sin URL pública en la información disponible).
- Configuración de modalidad citada: `gr00t/configs/data/openarm_prq30_v1_config.py` (sin URL pública en la información disponible).
- Modelo base: Wan2.2-TI2V-5B (no se incluye URL en la información proporcionada).
- Paper de referencia para la composición de datos: FRED (no se incluye URL en la información proporcionada).
- La búsqueda web realizada no devolvió enlaces técnicos relevantes sobre este modelo; los resultados obtenidos eran contenido no relacionado y se han descartado.
