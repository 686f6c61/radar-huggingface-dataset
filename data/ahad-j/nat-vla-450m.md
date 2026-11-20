# ahad-j/nat-vla-450m

## Resumen

NAT VLA 450M es un modelo vision-language-action (VLA) de 540 millones de parámetros desarrollado por ahad-j, diseñado para control robótico. Se construye sobre el backbone LFM2-VL-450M de LiquidAI (encoder visual SigLIP2 más un modelo de lenguaje LFM2) y se entrena para emitir acciones de robot como tokens discretos mediante el tokenizador NAT (Numeric Action Tokenizer). El modelo está pensado como punto de partida para fine-tuning con LeRobot sobre robots propios, no como un modelo listo para producción sin adaptación.

El modelo resuelve el problema de mapear observaciones multimodales (imágenes de cámaras, estado del robot y una instrucción en lenguaje natural) a secuencias de acciones de control. Lo hace generando un chunk de 32 pasos de acción codificado como tokens, con soporte para decodificación en streaming y chunking en tiempo real (RTC), lo que reduce la latencia percibida por el robot.

Es relevante ahora porque demuestra que un VLA de tamaño pequeño (450M) puede entrenarse sobre una mezcla multi-robot amplia (DROID, Bridge, RT-1, BC-Z, Franka, YAM bimanual y SO-100/101) y fine-tunearse con un pipeline estándar de LeRobot. El repo tiene 4 descargas y 0 likes en el momento de la consulta, por lo que es un modelo reciente y de nicho.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basado en LFM2-VL-450M (encoder visual SigLIP2 + modelo de lenguaje LFM2) con tokenizador de acciones NAT |
| Parámetros totales | 540.222.460 (477M entrenados + 63M del tokenizador NAT congelado) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el prompt se construye en inglés) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

La arquitectura combina el backbone LFM2-VL-450M (encoder visual SigLIP2 y modelo de lenguaje LFM2) con un tokenizador de acciones NAT. Cada imagen de cámara se procesa a su resolución nativa mediante el image processor de LFM2-VL, y se construye un prompt textual que incluye la tarea, el setup del robot, el estado actual (normalizado a [-1, 1] por percentiles 1 y 99 y discretizado en 256 bins por valor) y el modo de control esperado. La salida es un chunk de 32 pasos de acción codificado como tokens NAT: 14 tokens por grupo de hasta 7 columnas de acción, con acciones normalizadas por columna a [-1, 1] antes de tokenizar. El tokenizador NAT usa 4 latentes por chunk, 6.400 códigos por escala y 25.600 tokens de acción en total.

El entrenamiento usa entropía cruzada sobre los tokens de acción con un z-loss de 1e-4. Se entrenan el modelo de lenguaje, el encoder visual, el proyector y las filas de tokens añadidas; los embeddings originales de LFM2-VL permanecen congelados. El preentrenamiento consta de 95.315 pasos con batch 12 sobre una mezcla multi-robot (DROID, Bridge, RT-1, BC-Z, Franka, YAM bimanual y SO-100/101). En inferencia se usa decodificación greedy restringida a los tokens de acción con KV cache; `select_action` genera los tokens en un hilo en segundo plano y devuelve cada grupo de 8 acciones en cuanto sus tokens están listos, de modo que el robot empieza a moverse tras 4 tokens mientras el resto del chunk se sigue generando. El modo RTC (`rtc_steps=8`) genera el siguiente chunk mientras se ejecutan las últimas 8 acciones del actual, evitando saltos entre chunks.

## Capacidades

- Generación de acciones robóticas como tokens discretos a partir de observaciones multimodales (imágenes de cámara, estado del robot e instrucción en lenguaje natural).
- Comprensión de imágenes mediante el encoder SigLIP2 de LFM2-VL, a resolución nativa.
- Procesamiento de instrucciones en lenguaje natural para especificar la tarea.
- Salida de chunks de 32 pasos de acción con hasta 7 columnas de acción por grupo de 14 tokens.
- Decodificación en streaming: devuelve grupos de 8 acciones a medida que se generan sus tokens.
- Chunking en tiempo real (RTC) para encadenar chunks sin pausas ni saltos.
- Soporte de múltiples setups de robot vistos en preentrenamiento: Franka en DROID, SO-100/101 en MolmoAct2, YAM bimanual en MolmoAct2, WidowX en Bridge y Google Robot en RT-1.
- Soporte de distintos modos de control: pose articular absoluta y pose de efector final delta.
- No se documentan capacidades de tool calling, agentes multi-paso, audio ni thinking mode.

## Casos de uso

- Fine-tuning para un brazo robótico propio: el modelo se usa como inicialización con `--policy.type=nat_vla` y se entrena sobre un dataset LeRobot del robot objetivo, aprovechando el preentrenamiento multi-robot para reducir el número de demostraciones necesarias.
- Manipulación con brazo SO-100/101: el setup "single so100/so101 robotic arm in molmoact2" con control "absolute joint pose" está presente en preentrenamiento, por lo que es un punto de partida directo para robots de bajo coste.
- Control bimanual: el setup "bimanual yam robotic arms in molmoact2" permite adaptar el modelo a tareas que requieren dos brazos coordinados.
- Manipulación con efector final delta: los setups WidowX en Bridge y Google Robot en RT-1 usan "delta end-effector pose", adecuados para políticas que controlan el efector final en lugar de las articulaciones.
- Despliegue con streaming de baja latencia: gracias a la decodificación en streaming, el robot empieza a moverse tras 4 tokens, lo que es útil en tareas que requieren reactividad como agarre o empuje en tiempo real.
- Control continuo con RTC: con `rtc_steps=8`, el siguiente chunk se genera mientras se ejecutan las últimas 8 acciones del actual, adecuado para tareas de larga duración que requieren movimiento continuo sin pausas.
- Investigación en VLA: el modelo sirve como base pequeña (450M) para experimentos de tokenización de acciones, comparación de estrategias de chunking y evaluación de transferencia entre robots.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 540M parámetros en bfloat16, el peso del modelo ronda 1,1 GB, más el tokenizador NAT en float32 y el overhead de activaciones y KV cache.
- GPU recomendadas: no disponible; por tamaño, una GPU consumer con al menos 8 GB de VRAM debería ser suficiente para inferencia en bfloat16.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño de 540M parámetros, aunque no se confirma en la información disponible.
- Opciones de despliegue: LeRobot con la política `nat_vla` (instalación vía `pip install "lerobot[nat_vla,training] @ git+https://github.com/ahadjawaid/lerobot-1.git@nat-vla"`), `lerobot-train` para fine-tuning y `lerobot-rollout` con `--inference.type=rtc` para despliegue con chunking en tiempo real.
- Latencia y throughput: no disponibles de forma numérica; el modelo documenta que el robot empieza a moverse tras 4 tokens generados y que con `n_action_steps=8` solo se generan 4 tokens por chunk.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NAT VLA 450M | 540M (477M entrenados + 63M tokenizador) | no disponible | Vision-language-action | LFM Open License v1.0 | Hugging Face, LeRobot |
| LFM2-VL-450M (base) | 450M | no disponible | Vision-language | LFM Open License v1.0 | Hugging Face |
| Otros VLA de tamaño similar | no disponible | no disponible | Vision-language-action | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros modelos VLA comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está pensado para fine-tuning sobre un robot propio; no se garantiza su funcionamiento directo en un robot no visto sin adaptación.
- El prompt se construye en inglés ("The task is to {task}..."), por lo que el soporte multilingüe no está documentado.
- Los setups y modos de control vistos en preentrenamiento son limitados; un robot nuevo puede usar su propia descripción, pero el rendimiento no está garantizado.
- El dataset de fine-tuning debe incluir `q01` y `q99` para `observation.state` y `min` y `max` para `action` en `meta/stats.json`; sin estas estadísticas el pipeline falla.
- El streaming de acciones solo aplica a acciones de hasta 7 columnas; acciones más anchas llegan como chunk completo.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- La licencia LFM Open License v1.0 puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE del repo.
- El modelo tiene 4 descargas y 0 likes, por lo que la validación por parte de la comunidad es mínima.
- No se documentan resultados de benchmarks que permitan evaluar su rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahad-j/nat-vla-450m
- Modelo base: https://huggingface.co/LiquidAI/LFM2-VL-450M
- Tokenizador NAT: https://huggingface.co/ahad-j/nat-tokenizer-h32-l4-c6400
- Colección NAT: https://huggingface.co/collections/ahad-j/nat-6afb97cbe6ada5d298c2c148
- Repositorio LeRobot con política nat_vla: https://github.com/ahadjawaid/lerobot-1.git (rama nat-vla)
- Licencia: LICENSE en el repositorio del modelo
