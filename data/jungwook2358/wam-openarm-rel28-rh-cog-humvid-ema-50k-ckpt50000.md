# jungwook2358/wam-openarm-rel28-rh-cog-humvid-ema-50k-ckpt50000

## Resumen

`wam-openarm-rel28-rh-cog-humvid-ema-50k-ckpt50000` es un punto de control de investigación en robótica publicado por el usuario jungwook2358 en HuggingFace. Se trata de un modelo de política visomotora (vision-language-action, VLA) construido sobre el backbone de vídeo Wan2.2-TI2V-5B, entrenado desde cero para el robot OpenArm y con un mecanismo de alineamiento cognitivo denominado CogAlign. El modelo genera acciones como trayectorias de articulaciones de 28 dimensiones a partir de observaciones visuales estéreo, sin usar cinemática directa ni inversa en inferencia.

El checkpoint corresponde al experimento EXP-0019 y combina datos de robot y de humano, donde las secuencias humanas se incorporan únicamente como vídeo (sin estado ni máscara de acción) para aportar señal de vídeo y de CogAlign. El entrenamiento se completó el 1 de noviembre de 2026 tras 50 000 pasos con un lote efectivo de 64 (32 de robot y 32 de humano) distribuido en 4 GPU. La relevancia actual es acotada: es un artefacto de investigación reproducible, con cero descargas y cero likes, orientado a quien quiera reproducir o auditar la receta de entrenamiento más que a un uso en producción.

No hay información publicada sobre idiomas, benchmarks ni licencia comercial concreta; la licencia figura como "other" sin texto adicional en la model card. El repositorio incluye el checkpoint completo del HuggingFace Trainer con pesos en safetensors, estadísticas de normalización y configuración del experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de vídeo Wan2.2-TI2V-5B (difusión transformer DiT) adaptado a política visomotora con CogAlign |
| Parametros totales | no disponible (el backbone de referencia es Wan2.2-TI2V-5B, 5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de vídeo I2V con stride 3: 1 frame de condición + 8 futuros) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (sin texto de licencia publicado) |
| Formato de pesos | safetensors (checkpoint HF Trainer con shards e índice) |

## Arquitectura y entrenamiento

El modelo parte de Wan2.2-TI2V-5B entrenado desde cero y lo adapta como política de acción. La entrada de vídeo usa un stride de 3 (1 frame de condición más 8 frames futuros), resolución 192x256 con concatenación estéreo y recorte de aspecto, con máscara de vistas 0.5/0.25/0.25. La receta de entrenamiento sigue la base de huiwon: sin profesor ni pérdida de representación, b64 como pd16 por 4 GPU (exactamente 32 muestras de robot y 32 de humano), 50 000 pasos, warmup de 2500, learning rate 1e-4, weight decay 0.01, decaimiento coseno con suelo 0.1 y semilla 42.

La innovación principal es CogAlign: pérdida de alineamiento cognitivo con componente actual de 0.2 y componente de delta futuro de 0.2 sobre keypoints FP48 (`openarm_prq30_v2_rlhnd/fp48`, 11 subconjuntos). Tanto la pérdida cognitiva como la pérdida de flow matching de acción fluyen hacia el backbone de vídeo (`WAM_COGALIGN_DETACH=0`, `WAM_ACTION_GRAD_TO_VIDEO=1`, stop-grad desactivado). Las cinco secuencias humanas se tratan como filas solo de vídeo (estado 0 y máscara de acción 0), aportando únicamente pérdida de vídeo y CogAlign. La acción es un vector de 28 articulaciones en forma relativa: cuello 2, brazo izquierdo 7, brazo derecho 7, mano izquierda 6 y mano derecha 6; brazos normalizados respecto al estado en t con `relative_stats` q01/q99, cuello y manos en absoluto con q01/q99. Se guardó una EMA de vídeo (solo para guardado; el entrenamiento usó pesos vivos) en `backbone.extractor._video_ema_model.*` y `action_ema.*`.

## Capacidades

- Generación de acciones robóticas de 28 articulaciones a partir de observaciones visuales estéreo (192x256) para el robot OpenArm.
- Predicción de trayectorias relativas al estado actual en brazos y absolutas en cuello y manos.
- Modelado de dinámica de vídeo futuro (8 frames) condicionado por un frame inicial (I2V).
- Alineamiento cognitivo sobre keypoints FP48 mediante CogAlign con término actual y delta futuro.
- Entrenamiento conjunto con datos humanos en formato solo vídeo.
- Inferencia sin cinemática directa ni inversa: salida directa de articulaciones.
- Soporte de servicio con o sin pesos EMA.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo de razonamiento.

## Casos de uso

- Investigación en políticas visomotoras: servir como punto de partida reproducible para estudiar el efecto de CogAlign en el alineamiento entre pérdida de acción y backbone de vídeo, comparando con la base de huiwon sin CogAlign.
- Manipulación con OpenArm en laboratorio: el modelo emite directamente 28 articulaciones (brazos relativos, cuello y manos absolutos), lo que permite integrarlo en un bucle de control sin módulos de IK/FK adicionales.
- Aprendizaje a partir de vídeo humano: las cinco secuencias humanas en formato solo vídeo permiten evaluar si la señal de vídeo y CogAlign mejora la generalización sin acción humana anotada.
- Evaluación de EMA frente a pesos vivos: al guardarse ambos, se puede medir en banco la diferencia de estabilidad y suavidad de trayectorias entre servir con EMA o sin ella.
- Replicación de recetas de entrenamiento: el repositorio incluye `experiment_cfg/`, `trainer_state.json`, estados de scheduler y RNG, lo que facilita reproducir el run con el script `finetune_openarm_rel28_base.sh` de la rama `jungwook/openarm-fred-ft`.
- Estudio de normalización relativa: útil para analizar cómo la normalización q01/q99 relativa al estado afecta a la estabilidad de las políticas en brazos frente a la normalización absoluta en manos y cuello.
- Docencia y auditoría de artefactos de investigación: sirve como ejemplo completo de checkpoint HF Trainer para robótica con shards, índice, `statistics.json` y `embodiment_id.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El backbone de referencia es de 5B parámetros, lo que orientativamente sitúa la inferencia en el rango de 10-20 GB en precisión reducida, pero el autor no publica cifras.
- GPU recomendadas: no disponible. El entrenamiento se realizó en 4 GPU con precisión pd16 (b64 = pd16 x 4 GPU), sin especificar el modelo de GPU.
- Cabe en GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el artefacto es un checkpoint HF Trainer con safetensors que requiere el código de la rama `jungwook/openarm-fred-ft`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wam-openarm-rel28-rh-cog-humvid-ema-50k-ckpt50000 | no disponible (backbone 5B) | no disponible (1 cond + 8 futuros) | sin benchmarks publicados | other | HuggingFace, 0 descargas |
| Base de huiwon (`…v1human_rh11_b64_i2v_base_norep_relq99_50k`) | no disponible | no disponible | sin benchmarks publicados | no disponible | referenciada en la model card |
| Wan2.2-TI2V-5B | 5B | no disponible | no disponible en esta ficha | no disponible en esta ficha | modelo base público de vídeo |

No se dispone de datos suficientes para comparar rendimiento, contexto o licencia con alternativas de la misma categoría; la comparativa se limita a la relación de linaje entre el checkpoint y su base.

## Limitaciones y advertencias

- Artefacto de investigación con cero descargas y cero likes: no hay evidencia de validación externa ni de uso en producción.
- Licencia "other" sin texto publicado: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue.
- Sin benchmarks publicados: no hay métricas de éxito de tarea, robustez ni generalización.
- Dominio muy restringido: entrenado para el robot OpenArm con 28 articulaciones y configuración de cámara estéreo 192x256; no es transferible sin reentrenamiento.
- Idiomas no documentados: no hay información sobre capacidades lingüísticas, lo que sugiere que no es un modelo de lenguaje general.
- Riesgo de alucinación de trayectorias: al ser una política generativa de difusión, puede producir acciones plausibles pero incorrectas sin señal de incertidumbre documentada.
- Dependencia de normalización exacta: requiere el `statistics.json` de este checkpoint concreto; usar otras estadísticas invalida las salidas relativas de brazos.
- Los estados de optimizador de DeepSpeed fueron excluidos: no es posible reanudar el entrenamiento exactamente desde este artefacto.
- El checkpoint está fechado en 2026-11-02 con actualización un segundo después de la creación, lo que sugiere un volcado automático sin revisión posterior.
- No se documentan salvaguardas de seguridad física para el robot; cualquier uso real requiere límites de par y parada de emergencia externos.

## Enlaces

- HuggingFace: https://huggingface.co/jungwook2358/wam-openarm-rel28-rh-cog-humvid-ema-50k-ckpt50000
- Código de entrenamiento: rama `jungwook/openarm-fred-ft` del repositorio actlat-wam (URL no proporcionada en la model card)
- Script de entrenamiento: `run_scripts/train/wam_dit4dit/openarm/finetune_openarm_rel28_base.sh` (referenciado, sin URL)
- Modelo base de vídeo: Wan2.2-TI2V-5B (referenciado, sin URL)
- Run base de huiwon: `…v1human_rh11_b64_i2v_base_norep_relq99_50k` (referenciado, sin URL)
