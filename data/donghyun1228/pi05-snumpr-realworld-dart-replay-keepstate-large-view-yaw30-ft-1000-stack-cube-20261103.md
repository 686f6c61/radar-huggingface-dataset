# Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-ft-1000-stack-cube-20261103

## Resumen

π0.5 SNUMPR real-world DART es un checkpoint de robótica derivado de la familia π0.5 (openpi) y ajustado por el usuario Donghyun1228 sobre la variante SNUMPR VLA. Se trata de un fine-tune de imitación (IL) de un solo objetivo para la tarea `stack_cube`, construido sobre el checkpoint `snumpr-iclr27-v1/9999` y entrenado durante 1.000 actualizaciones con batch 64 sobre dos GPU H100 en configuración FSDP. El resultado es un modelo de política visuomotora que mapea observaciones (imágenes de cámara base y estado articular) a acciones de efector final.

La particularidad técnica del checkpoint es el uso de una técnica de *replay* con aumento de vista: el robot reprodujo la trayectoria articular de la demostración fuente `demonstration_7` mientras la cámara base se situaba en una vista con gran desplazamiento, de modo que estado, acciones y marcas temporales coinciden con la demo original y solo las imágenes son nuevas. Las poses TCP y las acciones delta se rotaron mediante un yaw virtual de base de +30° (`Rz(-30)`), mientras que `observation.state` conserva los ángulos articulares reales (opción `--keep-state`).

Es relevante ahora porque documenta un protocolo reproducible de adaptación de VLAs (vision-language-action) a condiciones de cámara y base distintas de las de entrenamiento, con instrucciones explícitas de desrotación en el controlador. No obstante, el autor indica que todavía no se ha ejecutado ninguna evaluación en robot real, por lo que su rendimiento efectivo en la tarea `stack_cube` no está validado empíricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA π0.5 (openpi) sobre variante SNUMPR; detalles internos de capas y atención no disponibles |
| Parametros totales | no disponible (repo de 12,4 GB en FP32) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | no disponible (modelo de robótica, no conversacional) |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` en FP32 (formato openpi/Flax-JAX) y `assets` con normalización original |

## Arquitectura y entrenamiento

El checkpoint se apoya en la arquitectura π0.5 de openpi, un modelo visión-lenguaje-acción que combina un backbone de visión y lenguaje con una cabeza de política que emite acciones continuas de control. La variante SNUMPR (identificador `snumpr-iclr27-v1`) actúa como inicialización; el autor no detalla en la model card cambios estructurales respecto a π0.5, por lo que la configuración de capas, dimensión oculta y mecanismo de atención no está disponible.

El entrenamiento consistió exclusivamente en imitación (IL) durante 1.000 actualizaciones, con batch de 64, LR constante de 5e-5 sin warmup, sin EMA, todos los pesos entrenables, AdamW con clipping de norma 1.0 y semilla 42, ejecutado en 2×H100 con FSDP. Los datos provienen de un *replay* de la demo fuente `demonstration_7` con la cámara base en vista de gran desplazamiento y yaw virtual de +30° aplicado a poses TCP y acciones delta, manteniendo el estado articular real. El recetario oficial es `pi05_libero_oneshotft` del repositorio `snumprlab/dart` (commit `1b23c4f4`), con código de adaptación `Donghyun1228/vla_adaptation` (commit `2065dd0a`). No se incluye el estado del optimizador (`train_state`).

## Capacidades

- Generación de acciones de control robótico para la tarea `stack_cube` a partir de imágenes y estado articular.
- Política visuomotora de un solo objetivo (one-shot target fine-tune) sobre una tarea concreta.
- Manejo de cambios de punto de vista de cámara mediante aumento virtual de yaw (+30°) en entrenamiento.
- Consistencia estado-acción: conserva ángulos articulares reales y aplica rotación solo a componentes cartesianas.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo; es un modelo de robótica, no un LLM conversacional.
- No se documentan modos especiales (thinking, visión general, audio) más allá de la percepción visual propia del VLA.

## Casos de uso

- Apilado de cubos en entorno real: el modelo recibe imágenes de la cámara base y el estado articular y emite acciones delta para completar `stack_cube`; requiere que el controlador desrote las acciones con `Δxyz_real = Rz(+30) Δxyz_virtual` y alimente el estado articular real sin modificar.
- Adaptación a nuevas vistas de cámara: sirve como referencia de cómo un VLA puede reentrenarse con *replay* de trayectorias y cámaras desplazadas sin recollectar demostraciones nuevas.
- Investigación en aumento de datos para robótica: el protocolo de yaw virtual +30° con `keep-state` es replicable para estudiar robustez a cambios de base del robot.
- Base para fine-tuning adicional: al estar en FP32 y con normalización original, puede reutilizarse como punto de partida en pipelines openpi para otras tareas de manipulación.
- Validación de recetas de imitación a bajo coste: 1.000 pasos en 2×H100 constituyen un experimento acotado para comparar recetas (`pi05_libero_oneshotft`) frente a alternativas.
- Integración en simulación o banco de pruebas: útil para probar el pipeline de desrotación y consistencia de estado antes de desplegar en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se ha ejecutado ninguna evaluación en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 12,4 GB en FP32, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos, más overhead de activaciones y del backbone visual.
- GPU recomendadas: el entrenamiento se realizó en 2×H100 con FSDP; para inferencia se recomienda H100 o A100 de 80 GB.
- Compatibilidad con GPU de consumo: no confirmada; probablemente requiere GPUs de gama alta (RTX 4090 24 GB o superior) si se aplica cuantización, aunque no se documentan formatos cuantizados.
- Opciones de despliegue: el formato de pesos es el nativo de openpi (JAX/Flax); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un VLA de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR DART `stack_cube` (este) | no disponible (12,4 GB FP32) | no disponible | Apilado de cubos, vista desplazada | Apache 2.0 | Hugging Face |
| `pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-alpha0p8-stack-cube-20261103` | no disponible | no disponible | Misma tarea, checkpoint base del que deriva | Apache 2.0 | Hugging Face |
| π0.5 openpi original | no disponible | no disponible | Política generalista VLA | no disponible en esta ficha | openpi |
| SNUMPR VLA `snumpr-iclr27-v1/9999` | no disponible | no disponible | Inicialización VLA | no disponible en esta ficha | Repositorio del autor |

## Limitaciones y advertencias

- No se ha realizado evaluación en robot real; el rendimiento en `stack_cube` es desconocido.
- El checkpoint está especializado en una única tarea y en una condición de cámara concreta (vista desplazada, yaw +30°); su generalización a otras vistas o tareas no está demostrada.
- El controlador debe aplicar obligatoriamente la desrotación `Δxyz_real = Rz(+30) Δxyz_virtual` y pasar el estado articular real sin transformar (`virtual_base_yaw_deg=30`, `keep_real_state=True`); omitirlo produce acciones incorrectas.
- No se incluye el estado del optimizador (`train_state`), lo que impide reanudar el entrenamiento exactamente desde el paso 999.
- Riesgo de sobreajuste a la demo fuente `demonstration_7` al haberse entrenado solo con imitación sobre un *replay* de esa trayectoria.
- No se documentan sesgos, limitaciones idiomáticas ni riesgos de alucinación en el sentido de LLM; al ser un modelo de política, el riesgo principal es la ejecución de acciones incorrectas en el robot.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y de garantías técnicas desaconseja su despliegue en producción sin validación previa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-ft-1000-stack-cube-20261103
- Checkpoint base citado: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-alpha0p8-stack-cube-20261103
- Código de adaptación: `Donghyun1228/vla_adaptation` (commit `2065dd0a`)
- Receta oficial: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), receta `pi05_libero_oneshotft`
- openpi: no se proporciona URL en la información disponible
- Paper de SNUMPR (ICLR27): no se proporciona URL en la información disponible
