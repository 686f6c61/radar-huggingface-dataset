# Dexverse-CSI/pi05-xlvla-single-20k

## Resumen

pi05-xlvla-single-20k es un modelo de política visuomotora (vision-language-action, VLA) para manipulación robótica diestra de un solo brazo, publicado por Dexverse-CSI. No es un modelo de lenguaje conversacional: es un checkpoint de la arquitectura pi0.5 implementado en LeRobot 0.4.4 (PI05Policy) y afinado completamente sobre el conjunto de datos DexVerse single-arm xlvla. El modelo toma observaciones visuales (cámara base y cámara de muñeca) y un vector de estado de 31 dimensiones, y produce acciones de 31 dimensiones para controlar manos robóticas diestras.

El entrenamiento cubre cuatro tareas (GraspBleach, GraspPan, GraspKettle y FunctionalHammerStrike) replicadas sobre seis manos distintas (allegro, inspire, leap, shadow, sharpa y wuji), con un total de 1200 episodios y 325.776 fotogramas. El checkpoint corresponde al paso 20000 de 20000, con batch global de 128 repartido en 4 GPU B200, precisión mixta bf16, checkpointing de gradientes y semilla 42.

Es relevante como línea base reproducible para investigación en manipulación diestra multi-mano: sirve de referencia frente a `Dexverse-CSI/pi05-cross-dex-hand-mount-single-20k`, que usa idéntica receta y datos salvo el origen de la muñeca (dimensiones 0:9). El repositorio solo contiene pesos, sin estado del optimizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (PI05Policy de LeRobot 0.4.4), vision-language-action |
| Parametros totales | 3.616.757.520 (3,62 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo consume observaciones por paso, no texto de contexto largo) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje general; las instrucciones se pasan como prompts de tarea) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |
| Dimension de estado/accion | 31-D xlvla (padding a 32) |
| Camaras de entrada | base_0_rgb, left_wrist_0_rgb (480x640, redimensionado with_pad a 224x224) |
| Chunk de accion | 10 |
| Tamano del repo | 14,5 GB |

## Arquitectura y entrenamiento

El modelo se basa en pi0.5, una arquitectura VLA que combina un backbone vision-language con un decodificador de acciones; en este caso se ejecuta a través de PI05Policy de LeRobot 0.4.4 en PyTorch. La entrada consta de dos cámaras RGB (base y muñeca izquierda), redimensionadas con `resize_with_pad` a 224x224, y un vector de estado de 31 dimensiones del espacio xlvla (con padding a 32). La salida es un chunk de 10 acciones de 31 dimensiones, normalizadas mediante QUANTILES a partir de las estadísticas del conjunto de datos.

El ajuste fino es completo (no LoRA) sobre el conjunto DexVerse single-arm xlvla: 4 tareas por 6 manos, 1200 episodios y 325.776 fotogramas. La receta usa learning rate 1e-4 con warmup de 1000 pasos y decaimiento coseno hasta 1e-6, batch global de 128 (32 por cada una de 4 GPU B200), precisión mixta bf16 con pesos maestros en float32, checkpointing de gradientes y semilla 42. A diferencia de `Dexverse-CSI/xlvla-pi05` (openpi en JAX, batch 32, EMA 0.999), esta versión no aplica EMA ni el aumento de imagen de openpi. El tokenizador se referencia a una ruta local; debe usarse `paligemma_tokenizer_hf/` incluido en el repositorio.

## Capacidades

- Control visuomotor de un brazo robótico con mano diestra a partir de observaciones RGB y estado propioceptivo de 31 dimensiones.
- Generalización entre seis manos distintas (allegro, inspire, leap, shadow, sharpa, wuji) dentro de las tareas entrenadas.
- Ejecución de cuatro tareas de manipulación: GraspBleach, GraspPan, GraspKettle y FunctionalHammerStrike.
- Generación de secuencias de acción en chunks de 10 pasos.
- Condicionamiento por prompt de tarea (mismo esquema de prompts que `Dexverse-CSI/xlvla-pi05`).
- No soporta tool calling, function calling, agentes multi-paso en el sentido de LLM, ni generación de texto libre.
- Capacidades multilingües: no disponible (no aplica como modelo de lenguaje).

## Casos de uso

- Línea base de investigación en manipulación diestra: sirve para comparar recetas de entrenamiento (LeRobot PyTorch frente a openpi JAX) manteniendo datos y arquitectura, aislando el efecto del framework y del batch.
- Estudio de transferencia entre manos: al entrenarse sobre seis manos distintas, permite evaluar la generalización de una misma política a morfologías de mano diferentes en tareas de agarre.
- Benchmark de montaje de muñeca: es la referencia directa frente a `pi05-cross-dex-hand-mount-single-20k`, que solo cambia el origen de la muñeca (dims 0:9), facilitando experimentos controlados de calibración cinemática.
- Reproducción de experimentos de VLA: la receta está documentada con semilla, learning rate, batch y precisión, lo que permite reproducir el ajuste fino en un clúster de 4 GPU B200.
- Evaluación de tareas de agarre doméstico: las tareas GraspBleach, GraspPan y GraspKettle son escenarios de cocina que permiten medir tasas de éxito en manipulación de objetos cotidianos.
- Desarrollo de pipelines de evaluación en simulación o laboratorio: el formato LeRobot y los chunks de acción de 10 pasos facilitan integrar el checkpoint en bucles de control a baja frecuencia.
- Punto de partida para ajuste fino adicional en una mano concreta: al ser un modelo multi-mano, puede especializarse con pocos datos en un robot específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 3,62 mil millones de parámetros, en bf16 los pesos ocupan aproximadamente 7,2 GB, más el overhead del backbone visual y de las activaciones.
- GPU recomendadas: el entrenamiento se realizó en 4 GPU NVIDIA B200 con batch 32 por GPU; para inferencia no se documentan requisitos.
- Cabe en GPU de consumo: probablemente sí en tarjetas con 12-16 GB o más en bf16, aunque no está confirmado en la información disponible.
- Opciones de despliegue: LeRobot 0.4.4 (PI05Policy) como librería principal; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Framework | Parametros | Batch de entrenamiento | EMA | Datos | Licencia |
|---|---|---|---|---|---|---|
| pi05-xlvla-single-20k | LeRobot PyTorch | 3,62 mil millones | 128 (32 x 4 B200) | No | DexVerse single-arm xlvla, 1200 episodios | no disponible |
| Dexverse-CSI/xlvla-pi05 | openpi JAX | no disponible | 32 | 0,999 | mismo conjunto | no disponible |
| Dexverse-CSI/pi05-cross-dex-hand-mount-single-20k | LeRobot PyTorch | no disponible | 128 (32 x 4 B200) | No | mismo conjunto, muñeca en cara de montaje | no disponible |

## Limitaciones y advertencias

- Modelo especializado: solo ejecuta las cuatro tareas y las seis manos del conjunto de entrenamiento; no generaliza a tareas ni morfologías fuera de esa distribución.
- No es un modelo de lenguaje: no responde a preguntas, no genera texto ni soporta tool calling; su uso está restringido a control robótico.
- Licencia no especificada: no se puede asumir uso comercial sin confirmación del autor.
- Solo contiene pesos: no incluye estado del optimizador ni `training_state`, lo que limita reanudar el entrenamiento exactamente donde se dejó.
- Dependencia de rutas locales: `policy_preprocessor.json` apunta el tokenizador a una ruta local; es obligatorio usar `paligemma_tokenizer_hf/` del repositorio o la inferencia fallará.
- Sin EMA ni aumento de imagen de openpi: el rendimiento puede diferir del checkpoint JAX equivalente, por lo que no son intercambiables sin evaluación.
- Riesgo de sobreajuste a las condiciones de cámara y calibración del dataset; cambios en la posición de la cámara de muñeca afectan directamente a las dimensiones 0:9 del estado.
- Sin datos publicados de benchmarks ni de tasas de éxito: no se puede afirmar su rendimiento absoluto en producción.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/Dexverse-CSI/pi05-xlvla-single-20k
- Modelo de referencia cruzada: https://huggingface.co/Dexverse-CSI/pi05-cross-dex-hand-mount-single-20k
- Modelo openpi JAX relacionado: https://huggingface.co/Dexverse-CSI/xlvla-pi05
- LeRobot: https://github.com/huggingface/lerobot
- openpi: https://github.com/Physical-Intelligence/openpi
