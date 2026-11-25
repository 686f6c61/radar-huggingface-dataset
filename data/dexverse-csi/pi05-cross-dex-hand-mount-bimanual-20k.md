# Dexverse-CSI/pi05-cross-dex-hand-mount-bimanual-20k

## Resumen

pi05-cross-dex-hand-mount-bimanual-20k es una política de control robótico (visión-lenguaje-acción) publicada por Dexverse-CSI, derivada de la arquitectura PI0.5 e implementada sobre la librería LeRobot 0.4.4 (PI05Policy). No es un modelo de lenguaje generativo, sino un modelo de imitación que mapea observaciones visuales y estado propioceptivo a acciones motoras de 62 dimensiones para manipulación bimanual diestra. Se ha entrenado mediante fine-tuning completo sobre el conjunto bimanual xlvla de DexVerse, compuesto por 4 tareas (OpenFlatFolder, SlideUtilityKnife, BimanualLiftTray, BimanualLiftCarton) y 6 manos distintas (allegro, inspire, leap, shadow, sharpa, wuji), sumando 1200 episodios y 605.812 fotogramas.

La particularidad técnica de esta variante es que el estado y la acción de ambas muñecas se han reubicado a la cara de montaje del brazo en la mano (hand's arm mounting face), con una transformación geométrica documentada (`new = old - R c`, con `c_left = diag(1, 1, -1) c_right`). Esto permite reutilizar la misma representación de acción entre manos morfológicamente distintas, lo que resulta relevante para transferencia entre hardware diestro heterogéneo.

El modelo tiene 3.616.818.990 parámetros y un repositorio de 14,5 GB, con pesos en formato safetensors. Es un artefacto de investigación con 0 descargas y 0 likes en el momento de la ficha, sin licencia declarada ni idiomas especificados, lo que limita su uso en producción sin aclaraciones adicionales del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PI0.5 (PI05Policy de LeRobot 0.4.4), vision-lenguaje-accion |
| Parametros totales | 3.616.818.990 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (chunk de acción de 10 pasos; ventana de observación no especificada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16 por el entrenamiento en bf16 con pesos maestros fp32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 14,5 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura PI0.5, una política visión-lenguaje-acción que combina un backbone de visión-lenguaje (tokenizador PaliGemma, referenciado en `policy_preprocessor.json`) con un cabezal de acciones que produce chunks de 10 pasos. La entrada consta de tres cámaras (`base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`) a 480x640, redimensionadas con `resize_with_pad` a 224x224, más un vector de estado de 62 dimensiones (31 por brazo: xyz de muñeca + rot6d). La salida es un vector de acción también de 62 dimensiones, normalizado con QUANTILES a partir de las estadísticas del dataset.

El entrenamiento consistió en un fine-tuning completo durante 20.000 pasos (el checkpoint publicado es el paso final), con batch global de 128 (32 por GPU en 4 nodos B200), learning rate 1e-4 con warmup de 1000 pasos y decaimiento coseno hasta 1e-6, precisión mixta bf16 con pesos maestros en float32, gradient checkpointing y semilla 42. No se aplicó EMA ni aumento de imagen. La innovación principal es la reubicación del estado/acción de muñeca a la cara de montaje del brazo, con estadísticas recalculadas por mano (`training/build_mount_bimanual.py`, `training/wrist_mount.json`), lo que unifica la representación entre seis morfologías de mano distintas.

## Capacidades

- Control bimanual de manipulación diestra: genera trayectorias de 62 dimensiones para dos brazos con manos de 6 tipos distintos.
- Ejecución de 4 tareas concretas: OpenFlatFolder, SlideUtilityKnife, BimanualLiftTray y BimanualLiftCarton.
- Percepción visual multi-cámara: integra vista base y dos vistas de muñeca para estimar el estado del entorno.
- Generalización entre manos: la representación en la cara de montaje permite, en principio, transferir entre allegro, inspire, leap, shadow, sharpa y wuji.
- Chunking de acciones: predice secuencias de 10 pasos por inferencia, reduciendo la frecuencia de cómputo del policy.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas generales; es un modelo puramente motor.

## Casos de uso

- Investigación en manipulación bimanual: servir como baseline reproducible para comparar políticas PI0.5 en tareas de plegado y levantamiento con dos brazos, usando el chunk de 10 acciones para evaluar estabilidad temporal.
- Transferencia entre morfologías de mano: emplear la representación en la cara de montaje para adaptar una política entrenada con una mano (p. ej. allegro) a otra (p. ej. shadow) sin reentrenar desde cero, gracias a la unificación del vector de 62 dimensiones.
- Automatización de tareas de logística ligera: levantar bandejas y cartones (BimanualLiftTray, BimanualLiftCarton) en entornos de laboratorio con brazos duales, aprovechando las cámaras de muñeca para el agarre fino.
- Manipulación de objetos deformables y herramientas: plegar carpetas (OpenFlatFolder) o deslizar un cúter de utilidad (SlideUtilityKnife) en pipelines de investigación sobre destreza fina.
- Benchmark de políticas VLA: usar el checkpoint de 20k pasos como referencia de fine-tuning completo en el conjunto DexVerse xlvla para medir la brecha entre modelos preentrenados y ajustados.
- Prototipado en simulación y gemelo digital: integrar la política en LeRobot para validar trayectorias antes de desplegar en hardware real, dado que el repo incluye únicamente pesos (sin optimizer ni training_state).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.616.818.990 parámetros en bf16, se requieren aproximadamente 7,2 GB solo para pesos; sumando activaciones y buffers de visión, un mínimo práctico de 12-16 GB en GPU.
- GPU recomendadas: el entrenamiento se realizó en 4 nodos con 32 GPUs B200 (batch 32 por GPU), lo que indica que el fine-tuning completo requiere hardware de datacenter. Para inferencia, una A100 40 GB, H100 o L40S son opciones holgadas.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más (RTX 4080, 4090, 5080) en bf16, siempre que se gestionen las tres cámaras y el chunk de acciones.
- Opciones de despliegue: LeRobot 0.4.4 (PI05Policy) es la vía nativa; el tokenizador debe apuntar a `paligemma_tokenizer_hf/` del propio repo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / chunk | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-cross-dex-hand-mount-bimanual-20k | 3.616.818.990 | chunk 10 | 4 bimanuales, 6 manos | no disponible | Hugging Face, 0 descargas |
| pi05-cross-dex-hand-mount-single-20k (mismo autor) | no disponible | no disponible | versión monobrazo | no disponible | Hugging Face |
| PI0.5 base (referencia de arquitectura) | no disponible | no disponible | propósito general VLA | no disponible | no disponible en la información |

La comparativa con alternativas de la misma categoría (p. ej. otras políticas VLA bimanuales) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado exclusivamente con el conjunto DexVerse xlvla (4 tareas, 6 manos), el modelo probablemente sobreajusta a esas morfologías, objetos y entornos; no se documenta evaluación fuera de distribución.
- Riesgo de alucinación motora: como política de imitación, puede generar acciones no válidas ante observaciones fuera de la distribución de entrenamiento, sin mecanismo de verificación explícito.
- Limitaciones de contexto e idioma: no se especifica ventana de observación ni idiomas; el tokenizador PaliGemma sugiere entrada textual, pero no se documenta su uso.
- Restricciones de licencia: la licencia no está declarada, lo que impide asumir uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Caveat de producción: el repo contiene solo pesos (sin optimizer ni training_state), y `policy_preprocessor.json` apunta a una ruta local del tokenizador, por lo que hay que sustituirla por `paligemma_tokenizer_hf/` del propio repositorio.
- Madurez: 0 descargas y 0 likes, publicación reciente (noviembre de 2026), sin benchmarks publicados; tratar como artefacto de investigación.

## Enlaces

- Hugging Face: https://huggingface.co/Dexverse-CSI/pi05-cross-dex-hand-mount-bimanual-20k
- Contraparte monobrazo: https://huggingface.co/Dexverse-CSI/pi05-cross-dex-hand-mount-single-20k
- LeRobot (librería): https://github.com/huggingface/lerobot
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
