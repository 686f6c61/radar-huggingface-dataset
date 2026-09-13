# SeonghoonYu/Race2_realworld

## Resumen

RACE2 on real-world Piper data es una familia de pesos para robótica publicada por el usuario SeonghoonYu en HuggingFace. Se trata de ajustes finos (fine-tunes) del modelo visión-lenguaje-acción (VLA) pi0.5 —checkpoint base `gs://openpi-assets/checkpoints/pi05_base`, en su port a PyTorch— sobre un brazo real AgileX Piper de 6 grados de libertad con pinza. Sobre esos fine-tunes se aplica un post-entrenamiento denominado RACE2, que añade una cabeza temporal para predecir transiciones en la secuencia de acciones.

El conjunto de datos consta de 90 demostraciones teleoperadas (30 por tarea), 24.576 fotogramas a 30 fps en formato LeRobot v3.0, para tres tareas de manipulación sobre mesa: coger un cuenco gris situado junto al plato, sobre un armario de plástico o sobre una caja de regalo, y depositarlo en el plato. El repositorio ocupa 12,5 GB y contiene 11 ejecuciones de entrenamiento: cinco con horizonte de acción H = 10, 15, 20, 25 y 30 (`plain_ft_*`), cinco con el post-entrenamiento RACE2 sobre ellas (`race2_post_ft_*`) y una que aplica RACE2 directamente desde el modelo base (`race2_from_base_h10`).

Su relevancia es de nicho pero clara para investigación en robótica: publica no solo pesos, sino también estados del optimizador, adaptadores LoRA sin fusionar, estadísticas de normalización y registros completos de entrenamiento con `torch.compile` aplicado, lo que permite reproducir y auditar el pipeline de openpi sobre hardware real. Todos los checkpoints están bajo licencia Apache 2.0 y el modelo tiene 0 descargas y 0 «likes» en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en pi0.5: backbone visión-lenguaje (VLM) con adaptadores LoRA y un «action expert» entrenado con flow matching; el detalle de capas y dimensiones no está publicado en la información disponible |
| Parametros totales | no disponible (los pesos fusionados ocupan 7,2-7,9 GB por checkpoint en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE). Parámetros entrenables: 28,3 M de LoRA r=16 en el VLM + 428 M del action expert + proyecciones |
| Longitud de contexto | no disponible; no es un modelo de lenguaje general, consume dos imágenes de 224x224 (`cam0` de muñeca y `cam1` de tercera persona) y un vector de estado de 7 dimensiones |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors, sin versiones GGUF, AWQ, GPTQ ni cuantizaciones declaradas |
| Idiomas soportados | no disponible; las instrucciones del dataset de entrenamiento están en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 7,2-7,9 GB), más `optimizer.pt`, `trainable.safetensors`, `config.json`, `metadata.pt` y `assets/piper_t123/norm_stats.json` |
| Robot objetivo | AgileX Piper de 6 grados de libertad con pinza |
| Horizonte de accion | H = 10, 15, 20, 25 o 30 fotogramas a 30 fps |
| Tareas | 3 tareas de pick-and-place sobre mesa (cuenco en tres ubicaciones distintas) |
| Fecha de publicacion | 13 de septiembre de 2026 (según los metadatos de HuggingFace) |
| Tamano del repositorio | 12,5 GB |

## Arquitectura y entrenamiento

El modelo parte de pi0.5 en su implementación PyTorch y se entrena con el framework [openpi](https://github.com/Physical-Intelligence/openpi) de Physical Intelligence, usando los scripts `scripts/real_world/` y `scripts/real_world_race2/`. Las acciones son objetivos absolutos de las articulaciones del brazo líder; durante el entrenamiento, las 6 articulaciones se normalizan como deltas respecto al primer estado del chunk (la pinza permanece en valores absolutos) y se desnormalizan a objetivos absolutos en el momento del servicio. Las predicciones de acción se generan mediante flow matching sobre un experto de acción de 428 M de parámetros, mientras que el VLM se adapta con LoRA de rango 16 (28,3 M).

La innovación específica del repositorio es RACE2: una cabeza temporal que predice, para cada slot del chunk, la proximidad a una transición, donde las transiciones se etiquetan con puntos de cambio PELT sobre la señal de acción y se modelan con un objetivo gaussiano de sigma 1 y soporte de 3 fotogramas. Esta señal se inyecta mediante una modulación adaRMS localizada con inicialización a cero, de modo que con `b = 0` el modelo reproduce exactamente la política base. Todas las ejecuciones usan 20.000 pasos, batch global de 32, AdamW (0,9/0,95, weight decay 1e-10, clip 1.0), calentamiento de 1.000 pasos y decaimiento coseno de 2,5e-5 a 2,5e-6, precisión bf16 y sin EMA, sobre 4x RTX 6000 Ada. Se publican checkpoints en los pasos 5k, 10k, 15k y 20k, y solo el de 20k incluye estado del optimizador. Los adaptadores LoRA están fusionados en los `model.safetensors` publicados, por lo que todos los ficheros cargan en el modelo plano.

## Capacidades

- Generación de acciones de manipulación robótica: produce chunks de `(H, 7)` objetivos absolutos de articulación (6 articulaciones en radianes más apertura de pinza, 0 = cerrada, 1 = abierta) para el brazo AgileX Piper.
- Ejecución de tres tareas concretas de pick-and-place condicionadas por una instrucción en lenguaje natural: coger el cuenco gris junto al plato, sobre el armario de plástico o sobre la caja de regalo, y colocarlo en el plato.
- Percepción visual dual: procesa simultáneamente una imagen de muñeca (`cam0`) y una imagen fija de tercera persona (`cam1`), ambas de 224x224 píxeles.
- Predicción temporal de transiciones (solo en las variantes RACE2): una cabeza auxiliar estima la probabilidad de que cada slot del chunk contenga un cambio de fase de la tarea.
- Selección configurable del horizonte de control: 10, 15, 20, 25 o 30 fotogramas, con checkpoints específicos por horizonte.
- Soporte de tool calling / function calling: no. El modelo emite tensores de acciones, no llamadas a herramientas ni texto estructurado.
- Soporte de agentes y razonamiento multi-paso: no en el sentido de un LLM agéntico; la «planificación» se limita al chunk de acciones y a su horizonte temporal.
- Capacidades multilingües: no disponibles; las instrucciones de entrenamiento están en inglés y no se documenta generalización a otros idiomas.
- Capacidad especial: modo «thinking» o visión-lenguaje general no declarados; el uso previsto es exclusivamente el control de un brazo Piper en las tareas descritas.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta las tres tareas de recogida y depósito del cuenco con una tasa de control de 30 fps y chunks de hasta 30 fotogramas, adecuado para bancos de pruebas de manipulación sobre mesa con el brazo AgileX Piper.
- Punto de partida para fine-tuning con datos propios: al ser fine-tunes de pi0.5 con LoRA fusionado y estadísticas de normalización compartidas (`assets/piper_t123/norm_stats.json`), sirve como inicialización para nuevas tareas del mismo robot sin partir del modelo base.
- Investigación en detección de transiciones: las variantes RACE2 permiten estudiar si una cabeza temporal con modulación adaRMS de inicialización cero mejora la política base, comparando `fm` frente a `base_fm` y las métricas `peak±1` y `pres`.
- Estudio del compromiso entre horizonte y precisión: la familia H = 10/15/20/25/30 permite medir cómo degrada la métrica de transición (`peak±1` cae de 0,85 a 0,52) al alargar el chunk, útil para elegir horizonte en diseño de controladores.
- Reproducción de pipelines de entrenamiento VLA: el repositorio incluye registros completos de entrenamiento, cadenas de log, log de preparación de datos y `PLAN.md`, lo que facilita replicar el flujo de openpi en 4x RTX 6000 Ada.
- Despliegue de políticas en bucle cerrado sobre hardware real: con una latencia medida de ~0,07 s por inferencia tras el calentamiento de `torch.compile`, la política puede ejecutarse por encima de la frecuencia de las cámaras de 30 fps y amortizar el cálculo mediante chunking.
- Evaluación comparativa de post-entrenamientos: comparar `race2_post_ft_h10` (inicializado desde `plain_ft_h10` @20k) frente a `race2_from_base_h10` (inicializado desde pi05_base) permite aislar el efecto del preajuste frente al post-entrenamiento directo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, algo esperable en un modelo de robótica. Las únicas cifras publicadas son métricas de entrenamiento, calculadas sobre los mismos 90 episodios usados para entrenar y sin conjunto de validación reservado:

| Run | Inicialización | Parámetros entrenables | Métricas finales (paso 19.900) |
|---|---|---|---|
| `plain_ft_h10` | pi05_base | LoRA VLM r=16 (28,3 M) + action expert (428 M) + proyecciones | loss 0,0059 |
| `plain_ft_h15` | pi05_base | ídem | loss 0,0072 |
| `plain_ft_h20` | pi05_base | ídem | loss 0,0078 |
| `plain_ft_h25` | pi05_base | ídem | loss 0,0086 |
| `plain_ft_h30` | pi05_base | ídem | loss 0,0094 |
| `race2_post_ft_h10` | `plain_ft_h10` @20k | expert + módulos RACE (VLM congelado) | fm 0,0049 / base_fm 0,0025 / BCE 0,134 / peak±1 0,85 / pres 0,93 |
| `race2_post_ft_h15` | `plain_ft_h10` @20k | ídem | fm 0,0059 / base_fm 0,0035 / BCE 0,148 / peak±1 0,78 / pres 0,89 |
| `race2_post_ft_h20` | `plain_ft_h10` @20k | ídem | fm 0,0065 / base_fm 0,0047 / BCE 0,159 / peak±1 0,67 / pres 0,85 |
| `race2_post_ft_h25` | `plain_ft_h10` @20k | ídem | fm 0,0068 / base_fm 0,0063 / BCE 0,168 / peak±1 0,62 / pres 0,81 |
| `race2_post_ft_h30` | `plain_ft_h10` @20k | ídem | fm 0,0071 / base_fm 0,0078 / BCE 0,176 / peak±1 0,52 / pres 0,76 |
| `race2_from_base_h10` | pi05_base | LoRA VLM r=16 + expert + módulos RACE | fm 0,0058 / base_fm 0,0032 / BCE 0,133 / peak±1 0,82 / pres 0,93 |

Leyenda: `fm` es la pérdida de flow matching con modulación; `base_fm` es la pasada sin modular; `BCE` es la pérdida de la cabeza temporal; `peak±1` es la fracción de chunks con transición cuyo pico predicho cae a un fotograma o menos de la etiqueta; `pres` es la exactitud de presencia de transición. Latencia de inferencia medida por el autor: ~0,07 s en una RTX 6000 Ada tras el calentamiento de `torch.compile`. No se publican medidas de throughput ni de tasa de éxito en robot.

## Requisitos de hardware

- VRAM para inferencia: no publicada por el autor. Estimación a partir del tamaño de los pesos: ~8 GB solo para los pesos en bf16 (checkpoints de 7,2-7,9 GB) y del orden de 10-12 GB contando activaciones para dos imágenes de 224x224 y el chunk de acciones. Cifra orientativa, no confirmada.
- GPU de entrenamiento: 4x RTX 6000 Ada, configuración utilizada por el autor para las 11 ejecuciones.
- GPU de inferencia: el autor reporta ~0,07 s por inferencia en una única RTX 6000 Ada. Cualquier GPU con al menos 12-16 GB de VRAM debería poder ejecutar los pesos en bf16.
- Compatibilidad con GPU de consumo: previsiblemente sí en RTX 4090, RTX 3090 y RTX 4080 (16 GB); ajustado en tarjetas de 12 GB. No confirmado por el autor.
- Opciones de despliegue: `python scripts/serve_policy.py policy:checkpoint` de openpi, con `--policy.config pi05_real_world_t123_hH` para los fine-tunes planos o `pi05_real_world_race2_t123_hH` para RACE2 (el nombre de la configuración debe coincidir con el horizonte) y `--policy.dir` apuntando al paso deseado. Se recomienda `torch.compile` para alcanzar la latencia medida.
- No aplica: vLLM, TGI, llama.cpp, Ollama u otros servidores de LLM, porque la salida del modelo es un tensor de acciones `(H, 7)`, no texto.
- Interfaz de servicio: el cliente envía `{"observation/image": cam1 HWC uint8, "observation/wrist_image": cam0, "observation/state": 7 floats, "prompt": str}` y recibe objetivos absolutos de articulación.
- Latencia y throughput: ~0,07 s por inferencia en RTX 6000 Ada (equivalente a ~14 Hz si se ejecuta sin chunking); el throughput agregado no está publicado.

## Comparativa con modelos similares

La información disponible solo permite comparar entre las variantes publicadas en este mismo repositorio y su modelo de partida. No hay datos publicados de otros VLA comparables (OpenVLA, GR00T u otros) en la información proporcionada.

| Modelo / run | Inicialización | Horizonte | Parámetros entrenables | Métrica clave | Licencia |
|---|---|---|---|---|---|
| `race2_post_ft_h10` (este repo) | `plain_ft_h10` @20k | 10 | expert + RACE (VLM congelado) | peak±1 0,85 / pres 0,93 | apache-2.0 |
| `race2_post_ft_h30` (este repo) | `plain_ft_h10` @20k | 30 | expert + RACE (VLM congelado) | peak±1 0,52 / pres 0,76 | apache-2.0 |
| `race2_from_base_h10` (este repo) | pi05_base | 10 | LoRA r=16 + expert + RACE | peak±1 0,82 / pres 0,93 | apache-2.0 |
| `plain_ft_h10` (este repo) | pi05_base | 10 | LoRA r=16 + expert + proyecciones | loss 0,0059 | apache-2.0 |
| pi0.5 base (`pi05_base`, PyTorch port) | modelo preentrenado | no disponible | congelado | no disponible | no disponible en la información proporcionada |
| Otros VLA de manipulación | — | — | — | no disponible | no disponible |

## Limitaciones y advertencias

- No existe conjunto de validación reservado: los 90 episodios se usan íntegramente para entrenamiento, de modo que las métricas publicadas son métricas de entrenamiento y no hay señal de sobreajuste. El autor recomienda elegir checkpoint mediante evaluación en el robot real.
- Todas las demostraciones terminan con el cuenco sobre el plato pero con la pinza todavía cerrada, sin soltar el objeto; una política entrenada se detendrá sujetando el cuenco en lugar de liberarlo.
- El brazo seguidor alcanza el objetivo comandado unos 3 fotogramas (0,1 s) después; las acciones registradas son las órdenes del brazo líder, no el estado alcanzado, lo que introduce un desfase implícito entre acción y efecto.
- Riesgo de alucinación en el sentido de acciones no válidas o incoherentes: no se documentan salvaguardas, límites de par, ni comprobaciones de seguridad física antes de enviar los objetivos de articulación.
- Sesgos de datos: el modelo solo ha visto tres tareas muy concretas, un único brazo AgileX Piper, una única disposición de cámara (muñeca más tercera persona fija), un solo color de objeto (cuenco gris) y una sola pinza. La generalización a otros objetos, colores, iluminaciones o distribuciones es no disponible.
- Limitación de idioma: las instrucciones están en inglés; no se documenta comportamiento con prompts en castellano u otros idiomas.
- Restricciones de licencia: apache-2.0, que permite uso comercial y modificación, pero hay que verificar las condiciones del modelo base pi0.5 y del framework openpi, cuyas licencias no se detallan en la información proporcionada.
- Modelo sin adopción verificable: 0 descargas y 0 «likes» en el momento de la consulta, sin validación por terceros ni resultados de tasa de éxito en robot publicados.
- No hay cuantizaciones ni formatos alternativos: no existe versión GGUF ni similar, lo que complica el despliegue en entornos sin GPU compatible con bf16.
- Tamaño del repositorio elevado (12,5 GB) por incluir múltiples checkpoints, estados del optimizador y registros; la descarga completa no es necesaria para servir un único horizonte.

## Enlaces

- HuggingFace: https://huggingface.co/SeonghoonYu/Race2_realworld
- Repositorio openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Scripts de entrenamiento usados: `scripts/real_world/` y `scripts/real_world_race2/` dentro del repositorio de openpi
- Checkpoint base de pi0.5 referenciado por el autor: `gs://openpi-assets/checkpoints/pi05_base` (port a PyTorch)
- Logs y documentación dentro del repo: `logs/` (registros de entrenamiento, cadenas de log, log de preparación de datos, `PLAN.md`)
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos eran páginas no relacionadas sobre foros y software de escritorio remoto), por lo que no se pueden añadir papers, blogs ni demos adicionales.
