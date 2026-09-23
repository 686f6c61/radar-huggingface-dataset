# MIT-Media-Lab/vla-hand-baselines

## Resumen

VLA-HAND baselines es un repositorio de checkpoints publicado por MIT-Media-Lab que reúne dos líneas base externas (VITRA y SmolVLA) entrenadas y evaluadas dentro del proyecto VLA-HAND frente al modelo de referencia denominado V4. No se trata de un modelo único, sino de un paquete de pesos de dos políticas vision-language-action (VLA) orientadas a la estimación de pose de mano y a la manipulación robótica, acompañadas de sus configuraciones de entrenamiento y de las estadísticas de normalización usadas.

La primera línea base, `vitra_original/`, parte de `VITRA-VLA/VITRA-VLA-3B` y combina un backbone PaliGemma2-3B con una cabeza de acción DiT/DDPM que predice ángulos articulares MANO; se entrenó durante 10.000 pasos. La segunda, `smolvla_official/`, usa la `SmolVLAPolicy` de LeRobot inicializada desde SmolVLM2-500M y predice una pose de mano de 21 keypoints, con 18.000 pasos de entrenamiento. Ambos checkpoints se seleccionaron por mínima pérdida de validación y se evaluaron con los mismos tres dominios (GigaHands, OakInk2 y TACO), los mismos splits y el mismo protocolo de test que V4.

Su relevancia es metodológica: ofrece una comparación reproducible, con protocolo y normalización compartidos, entre dos arquitecturas VLA de escala muy distinta (500M y 3B de inicialización) aplicadas a una misma tarea de pose de mano. El repositorio ocupa 44,2 GB, no tiene descargas ni likes en el momento de la consulta y su licencia es mixta, lo que condiciona su reutilización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos líneas base: VITRA (backbone PaliGemma2-3B + cabeza de acción DiT/DDPM) y SmolVLA (`SmolVLAPolicy` de LeRobot sobre SmolVLM2-500M) |
| Parametros totales | No disponible como cifra agregada. Inicializaciones declaradas: PaliGemma2-3B (VITRA) y SmolVLM2-500M (SmolVLA); no se detalla el número de parámetros entrenables de cada cabeza de acción |
| Parametros activos | No aplica (no se describe ninguna arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en `best.pt` sin indicación de cuantización) |
| Idiomas soportados | No disponible |
| Licencia | Mixta: VITRA bajo Gemma Terms of Use (ver `vitra_original/NOTICE.md`); SmolVLA bajo Apache-2.0 |
| Formato de pesos | `.pt` (`torch.save` con claves `step`, `model`, `config`, `val`, `action_mean` y `action_std`); no incluye estado del optimizador |

## Arquitectura y entrenamiento

El repositorio contiene dos arquitecturas distintas bajo un protocolo común. VITRA combina un modelo visión-lenguaje PaliGemma2-3B con una cabeza de difusión (DiT/DDPM) que genera acciones en el espacio de ángulos articulares MANO, tras 10.000 pasos de entrenamiento. SmolVLA emplea la implementación `SmolVLAPolicy` de LeRobot sobre un SmolVLM2-500M y produce una pose de mano de 21 keypoints, con 18.000 pasos. En ambos casos el checkpoint publicado es el de menor pérdida de validación, y es el que origina todas las cifras de test reportadas.

Ambos modelos se entrenaron y evaluaron sobre los mismos tres dominios (GigaHands, OakInk2 y TACO), con los mismos splits, las mismas estadísticas de normalización y el mismo protocolo de test empleado para el modelo V4 del proyecto. Cada checkpoint incorpora `action_mean` y `action_std`, lo que permite reproducir la normalización original. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; tampoco se detallan innovaciones de decodificación o de atención.

El repositorio incluye además dos artefactos relacionados: `model/trex_full_egotouch`, un checkpoint completo de acción humana T-ReX adaptado a EgoTouch sin tacto nativo, con todos los pesos de inferencia, el procesador y código de carga autónomo (formato `human_trex.full.v1`), y `model/tachin_adaptation_20260922`, que contiene checkpoints de SmolVLA, VITRA y HumanTReX seleccionados por validación tras la adaptación Tachin, descritos explícitamente como checkpoints de parámetros entrenados y no como modelos completos autónomos.

## Capacidades

- Estimación de pose de mano a partir de entrada visual y lenguaje, en dos variantes de espacio de acción: ángulos articulares MANO (VITRA) y 21 keypoints (SmolVLA).
- Acción robótica guiada por visión y lenguaje (pipeline `robotics`, etiqueta `vision-language-action`), orientada a la ejecución de políticas de manipulación.
- Predicción de translación y rotación de muñeca, con la rotación medida en grados geodésicos.
- Generación de acciones mediante cabeza de difusión en el caso de VITRA (DDPM sobre arquitectura DiT).
- Aprendizaje por imitación desde demostraciones en tres dominios de interacción mano-objeto (GigaHands, OakInk2, TACO).
- Adaptación a nuevos dominios mediante ajuste de parámetros entrenados, como ilustra el release de adaptación Tachin.
- Capacidades multilingües, de tool calling, de agentes o de modo de razonamiento explícito: no disponibles en la información proporcionada. La ficha del repositorio no declara idiomas soportados ni funciones de llamada a herramientas.

## Casos de uso

- Investigación comparativa en políticas VLA: el repositorio permite replicar experimentos frente a una referencia común (V4) con splits, normalización y protocolo de test idénticos, lo que reduce la variabilidad metodológica entre publicaciones.
- Estimación de pose de mano en entornos de manipulación: SmolVLA, con 21 keypoints y un backbone de 500M, es adecuado para integrarse en bucles de control donde el coste computacional por inferencia es crítico.
- Reconstrucción de pose con garantías cinemáticas: VITRA predice ángulos articulares MANO, de modo que sus salidas pueden alimentar directamente cinemática directa y motores articulados sin una conversión intermedia a keypoints.
- Aprendizaje por imitación sobre datos de interacción mano-objeto: los checkpoints se entrenaron en GigaHands, OakInk2 y TACO, por lo que sirven como punto de partida para ajuste fino en tareas de agarre y manipulación con objetos.
- Transferencia a nuevos dominios: el release de adaptación Tachin documenta el ajuste de parámetros de SmolVLA, VITRA y HumanTReX, lo que resulta útil como plantilla para adaptar una política a un dominio distinto sin reentrenar desde cero.
- Captura de movimiento de manos sin guantes: el checkpoint `trex_full_egotouch` cubre la adaptación EgoTouch sin tacto nativo, con pesos de inferencia y procesador incluidos, para reconstrucción de acción humana desde vídeo egocéntrico.
- Evaluación de robustez entre arquitecturas: al compartir protocolo, los dos checkpoints permiten estudiar cómo escala el error al pasar de un backbone de 500M a uno de 3B en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El repositorio sí reporta métricas de test específicas de la tarea, sobre el split de test, con los primeros 8 pasos de control de cada ventana y los tres dominios agrupados. Las unidades son centímetros para translación de muñeca y dedos, y grados geodésicos para rotación de muñeca; valores más bajos indican mejor rendimiento.

| Modelo | Translación de muñeca (cm) | Rotación de muñeca (grados) | Dedos (cm) |
|---|---|---|---|
| SmolVLA | 0,7518 | 3,6235 | 1,0094 |
| VITRA | 1,0298 | 4,7789 | 1,7933 |

Advertencia publicada por los autores: VITRA predice ángulos articulares, por lo que su error de dedos se mide tras aplicar cinemática directa MANO e incluye un suelo de error de FK que SmolVLA no tiene. Por tanto, las columnas de dedos no son directamente comparables entre ambos modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los autores no publican cifras de memoria ni de latencia.
- GPU recomendadas: no disponible. Como referencia derivada del tamaño declarado, el backbone PaliGemma2-3B de VITRA implica una huella mayor que el SmolVLM2-500M de SmolVLA; esta observación es una inferencia a partir de los parámetros publicados, no un dato del repositorio.
- Encaje en GPU de consumo: no disponible. No se documenta ninguna configuración de despliegue en hardware consumer.
- Opciones de despliegue: los checkpoints son diccionarios `torch.save` sin estado del optimizador y se cargan con el paquete correspondiente mediante `Model` y `load_pretrained(path)`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables directamente a políticas de acción con cabeza de difusión. El checkpoint `trex_full_egotouch` incluye código de carga autónomo.
- Latencia y throughput estimados: no disponible.
- Tamano del repositorio: 44,2 GB, factor relevante para el almacenamiento y la descarga.

## Comparativa con modelos similares

La comparación más directa la constituyen las dos líneas base incluidas en el propio repositorio, ya que comparten dominios, splits, normalización y protocolo de evaluación.

| Modelo | Inicialización | Espacio de acción | Pasos de entrenamiento | Licencia | Translación muñeca (cm) | Rotación muñeca (grados) | Dedos (cm) |
|---|---|---|---|---|---|---|---|
| SmolVLA | SmolVLM2-500M | 21 keypoints de pose de mano | 18.000 | Apache-2.0 | 0,7518 | 3,6235 | 1,0094 |
| VITRA | `VITRA-VLA/VITRA-VLA-3B` | Ángulos articulares MANO | 10.000 | Gemma Terms of Use | 1,0298 | 4,7789 | 1,7933 |

Frente al modelo de referencia V4 del proyecto, no hay datos públicos en la información disponible sobre su arquitectura, tamaño, licencia ni métricas, más allá de que comparte los tres dominios, splits, estadísticas de normalización y protocolo de test. Los repositorios upstream `VITRA-VLA/VITRA-VLA-3B` y la implementación `SmolVLAPolicy` de LeRobot son alternativas de partida, pero no se dispone de sus cifras comparativas en esta ficha.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta ningún análisis de sesgo demográfico, de iluminación, de piel ni de morfología de mano.
- Riesgo de alucinación: no evaluado en la información disponible. Se trata de modelos de acción motora, no de generación de texto abierto, pero la componente visión-lenguaje puede producir condicionamientos erróneos ante entradas fuera de distribución.
- La licencia es mixta: VITRA queda sujeta a Gemma Terms of Use y SmolVLA a Apache-2.0. Cualquier uso comercial debe revisar por separado ambas condiciones y el fichero `vitra_original/NOTICE.md`.
- Los tres dominios de entrenamiento y test son GigaHands, OakInk2 y TACO; no se garantiza generalización fuera de ellos. La adaptación Tachin se publica aparte precisamente por este motivo.
- Las métricas de dedos de VITRA y SmolVLA no son directamente comparables: el error de VITRA se mide tras cinemática directa MANO e incorpora un suelo de FK.
- Los checkpoints son selecciones por mínima pérdida de validación, no necesariamente los mejores en test, y no incluyen estado del optimizador, lo que limita reanudar entrenamientos de forma fiel.
- Las rutas almacenadas en `training_config.json` apuntan a la máquina de entrenamiento original; es necesario reajustarlas para reproducir los experimentos.
- Los checkpoints de adaptación Tachin son pesos de parámetros entrenados, no modelos completos autónomos, y dependen de inicializaciones congeladas documentadas en el release. No incluyen editor táctil ni resultados completos de test.
- `trex_full_egotouch` es una adaptación EgoTouch sin tacto, no el T-ReX táctil nativo, y usa el formato `human_trex.full.v1` en lugar del formato de línea base descrito.
- No se declaran idiomas soportados, longitud de contexto ni tipos de cuantización, lo que complica planificar despliegues en producción.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que indica un grado de validación externa todavía bajo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/MIT-Media-Lab/vla-hand-baselines
- Código de entrenamiento y test (VLA-HAND, commit `baee56f`): https://github.com/kaichen-z/VLA-HAND/tree/Kai_final/yuzhench_distill_editor/baselines
- Checkpoint de inicialización de VITRA: https://huggingface.co/VITRA-VLA/VITRA-VLA-3B
- Modelo de referencia V4 del proyecto: no disponible
- Paper o blog técnico del proyecto VLA-HAND: no disponible
- Demos: no disponible
