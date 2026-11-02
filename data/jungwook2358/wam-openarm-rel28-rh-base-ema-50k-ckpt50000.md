# jungwook2358/wam-openarm-rel28-rh-base-ema-50k-ckpt50000

## Resumen

`wam-openarm-rel28-rh-base-ema-50k-ckpt50000` es un checkpoint de investigación en robótica publicado por el usuario de HuggingFace `jungwook2358`. Se trata de una réplica del entrenamiento base "robot + humano" del proyecto WAM (World-Action Model) sobre el brazo robótico OpenArm, construido sobre el backbone de vídeo Wan2.2-TI2V-5B y entrenado durante 50 000 pasos para predecir acciones de 28 dimensiones en articulaciones. El modelo combina datos de demostraciones robóticas y de vídeo humano, y se distribuye como checkpoint intermedio de un experimento interno (EXP-0019) más que como un modelo listo para producción.

La relevancia del checkpoint es acotada: es una reproducción de un run previo de otro autor (`huiwon`) dentro de un fork propio del código, con semillas, recetas e hiperparámetros fijados, y con pesos EMA de vídeo guardados de forma opcional. No hay model card comercial, ni benchmarks publicados, ni idiomas declarados, ni tarjeta de evaluación de sesgos. La licencia es "other" sin texto adicional, lo que impide asumir permisos de uso comercial.

En la práctica, este modelo interesa a equipos que ya trabajan con el stack WAM/OpenArm y quieren inspeccionar o reproducir el pipeline de entrenamiento (datos, normalización relativa, configuración de embodiment), no a quien busque un modelo de robótica listo para desplegar. El contexto, los parámetros totales y la mayoría de especificaciones estándar de un LLM no están declarados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de vídeo-acción sobre backbone Wan2.2-TI2V-5B; I2V con stride 3 (1 frame condicional + 8 futuros) |
| Parámetros totales | no disponible (backbone Wan2.2-TI2V-5B según la receta; recuento exacto no declarado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de 9 frames de vídeo: 1 condicional + 8 futuros) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades de lenguaje declaradas) |
| Licencia | other (texto de licencia no especificado) |
| Formato de pesos | safetensors (shards), con index, config.json, processor_config.json, statistics.json, embodiment_id.json, experiment_cfg/, trainer_state.json, scheduler y rng states |

## Arquitectura y entrenamiento

El modelo se apoya en un backbone de difusión de vídeo Wan2.2-TI2V-5B, adaptado a un esquema image-to-video con stride 3: una observación condicional y ocho frames futuros. La entrada visual es estéreo concatenada en vertical a 192x256 con recorte de aspecto, y se aplica una máscara de vistas con proporciones 0,5/0,25/0,25. Sobre ese backbone se acopla una cabeza de acción que emite 28 dimensiones articulares: 2 de cuello, 7 por brazo (izquierdo y derecho) y 6 por mano (izquierda y derecha). Las articulaciones de los brazos se predicen en forma relativa al estado actual, normalizadas con los cuantiles q01/q99 de `relative_stats`; cuello y manos se predicen en absoluto con sus propios q01/q99. El marcador de grupo de acción (banana) restringe la acción al brazo y mano derechos.

El entrenamiento sigue la receta del run base de `huiwon`: 50 000 pasos, warmup de 2500, learning rate 1e-4, weight decay 0,01, schedule coseno con suelo 0,1, semilla 42 y batch efectivo de 64 (pd16 x 4 GPU, exactamente 32 muestras de robot y 32 de humano). Los datos son la copia del dataset `openarm_wam_v1` con 6 subconjuntos de robot y 5 de humano; los subconjuntos humanos se tratan como filas solo de vídeo (estado 0, `action_mask` 0) y contribuyen únicamente a la pérdida de modelado de vídeo, sin CogAlign, y con gradientes de acción en stop-gradient hacia el backbone de vídeo. No se emplean teacher ni pérdida de representación. Se guardan pesos EMA de vídeo (`backbone.extractor._video_ema_model.*` y `action_ema.*`) solo a efectos de almacenamiento: el entrenamiento usó pesos vivos, y la inferencia puede hacerse con o sin EMA. No se incluyen los estados del optimizador DeepSpeed.

## Capacidades

- Predicción de acciones robóticas de 28 dimensiones en espacio articular (cuello, brazos y manos), sin cinemática directa ni inversa: la salida son articulaciones directamente.
- Acciones de brazo relativas al estado actual y de cuello/manos absolutas, normalizadas con las estadísticas del checkpoint.
- Modelado conjunto de vídeo y acción: el backbone genera frames futuros y la cabeza de acción predice la trayectoria asociada.
- Aprendizaje de datos humanos en formato solo vídeo, sin supervisión de acción sobre esas muestras.
- Soporte de pesos EMA opcionales para servir el modelo.
- No se declaran capacidades de lenguaje, tool calling, agentes multi-paso, visión semántica, audio ni modo thinking.

## Casos de uso

- Reproducción de experimentos: sirve para replicar el run base de `huiwon` en el fork `jungwook/openarm-fred-ft` con el script `finetune_openarm_rel28_base.sh` y los flags `OPENARM_ACTION=rel28 OPENARM_HUMAN=videoonly OPENARM_COG=0`, verificando que la receta converge de forma comparable.
- Investigación en aprendizaje de acción desde vídeo: permite estudiar cómo contribuyen los 5 subconjuntos humanos tratados como solo vídeo (pérdida de modelado de vídeo sin supervisión de acción) al rendimiento del backbone y de la cabeza de acción.
- Punto de partida para fine-tuning en OpenArm: al ser un checkpoint base de 50k pasos con estadísticas de normalización incluidas, se puede usar como inicialización para ajustes posteriores sobre tareas concretas del brazo.
- Evaluación de la representación relativa de articulaciones: útil para comparar el esquema de 28 dimensiones con acciones relativas en brazos frente a alternativas absolutas o con cinemática inversa.
- Análisis de estabilidad del entrenamiento: los estados de scheduler, RNG y `trainer_state.json` permiten reanudar o auditar la curva de pérdida y el efecto del EMA de vídeo.
- Despliegue experimental en bucle cerrado sobre OpenArm: la salida directa de articulaciones (sin FK/IK) simplifica la integración con el controlador del robot, siempre que se respete la normalización de `statistics.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El backbone es Wan2.2-TI2V-5B, lo que sitúa el orden de magnitud en decenas de GB en precisión de entrenamiento, pero no se declara el consumo real ni las cuantizaciones soportadas.
- GPU recomendadas: no disponible. El entrenamiento se realizó con 4 GPU (pd16 x 4) según la receta, sin especificar modelo.
- Viabilidad en GPU de consumo: no disponible; no se documenta ninguna cuantización ni despliegue en RTX 4090 u otras.
- Opciones de despliegue: no disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI; el checkpoint es un formato HuggingFace Trainer con safetensors).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wam-openarm-rel28-rh-base-ema-50k-ckpt50000 | no disponible (backbone Wan2.2-TI2V-5B) | 9 frames de vídeo | sin benchmarks publicados | other | HuggingFace, 0 descargas |
| Run base de `huiwon` (`isaac_wan22_openarm_wam_v1human_rh11_b64_i2v_base_norep_relq99_50k`) | no disponible | no disponible | no disponible | no disponible | referenciado, no enlazado |
| Alternativas de robótica de propósito general (p. ej. políticas VLA) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de modelos comparables en la información proporcionada; la comparación con el run original de `huiwon` es la única referencia directa y no incluye métricas.

## Limitaciones y advertencias

- Licencia "other" sin texto: no se puede asumir uso comercial ni redistribución; hay que contactar con el autor antes de cualquier uso en producción.
- Checkpoint de investigación con 0 descargas y 0 likes: sin validación externa, sin evaluación de sesgos y sin métricas de robustez.
- Sin benchmarks publicados: no hay evidencia cuantitativa de éxito en tareas, tasa de acierto ni comparación con el run original.
- Dependencia fuerte del stack: requiere el fork `jungwook/openarm-fred-ft`, la rama `actlat-wam` y el dataset `openarm_wam_v1` para reproducir el contexto de entrenamiento.
- Normalización obligatoria: la inferencia debe usar el `statistics.json` de este checkpoint; mezclar estadísticas de otros checkpoints produce acciones incorrectas.
- Sin FK/IK: la salida son articulaciones de 28 dimensiones con brazos relativos al estado actual, lo que exige un controlador que componga la acción con el estado previo.
- Acción restringida por el marcador de grupo (banana): brazo y mano derechos; no cubre el lado izquierdo en la configuración declarada.
- Los subconjuntos humanos no aportan supervisión de acción, por lo que el modelo puede no generalizar bien a movimientos humanos sin datos robóticos equivalentes.
- Pesos EMA guardados solo a efectos de almacenamiento: el entrenamiento usó pesos vivos, así que el comportamiento con y sin EMA puede diferir y no se documenta cuánto.
- Riesgo de alucinación de trayectorias: al ser un modelo generativo de difusión, puede producir secuencias plausibles pero físicamente inviables; requiere validación en bucle cerrado.

## Enlaces

- HuggingFace: https://huggingface.co/jungwook2358/wam-openarm-rel28-rh-base-ema-50k-ckpt50000
- Run base replicado (referencia en la model card, sin URL): `isaac_wan22_openarm_wam_v1human_rh11_b64_i2v_base_norep_relq99_50k`
- Repositorio de código (referencia en la model card, sin URL): rama `actlat-wam`, `jungwook/openarm-fred-ft`
- Script de entrenamiento (referencia en la model card, sin URL): `run_scripts/train/wam_dit4dit/openarm/finetune_openarm_rel28_base.sh`
- Dataset (referencia en la model card, sin URL): `openarm_wam_v1`
- No se encontraron papers, blogs ni demos adicionales en la información disponible.
