# RyanL22/pi05-openarm-rh56f1-ablation-speeda-realsynth-20k

## Resumen

El modelo `RyanL22/pi05-openarm-rh56f1-ablation-speeda-realsynth-20k` es un ajuste fino de una política robótica de visión-lenguaje-acción (VLA) basada en la receta `pi05` (pi0.5) implementada en LeRobot v0.6.1. Lo desarrolla el usuario RyanL22 y parte del modelo base `lerobot/pi05_base`. Su función no es generar texto, sino producir secuencias de acciones motoras (control de un brazo robótico con manos diestras) a partir de observaciones visuales y del estado del robot, es decir, resuelve el problema de aprender políticas de manipulación bimanual a partir de demostraciones.

El checkpoint concreto (paso 20.000, final) se ha entrenado sobre teleoperación real (261 episodios a 20 Hz) combinada con 324 episodios sintéticos generados mediante una ablación de velocidad del efector final ("speeda"): se deforma temporalmente el flujo del esqueleto (skeleton flow) para que la velocidad del efector coincida con la de la teleoperación, manteniendo las imágenes de fotogramas clave inalteradas. Es relevante en el contexto de la robótica open source porque documenta un experimento controlado sobre el uso de datos sintéticos y sobre cómo la coherencia cinemática (velocidad) afecta al entrenamiento de una VLA, con checkpoints de comparación publicados por el mismo autor.

El modelo tiene 4.143.404.816 parámetros (~4,14 B) en formato safetensors, un encoder de visión SigLIP que se ajusta (no se congela) y un esquema de acciones por chunks de 50 pasos a 20 fps (2,5 s). La licencia es Apache 2.0. No se han publicado idiomas soportados ni resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política VLA `pi05` de LeRobot (encoder de visión SigLIP + backbone pi0.5 heredado de `lerobot/pi05_base`); salida de acciones por chunks |
| Parametros totales | 4.143.404.816 (~4,14 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; horizonte de acción de 50 pasos a 20 fps (2,5 s) |
| Tipos de cuantizacion | No disponible en la información proporcionada |
| Idiomas soportados | No disponible (modelo robótico acción-visión, no textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de una política de visión-lenguaje-acción derivada de `lerobot/pi05_base` (receta pi0.5 de LeRobot v0.6.1). El encoder de visión es SigLIP y en este ajuste fino **no está congelado**, sino que se entrena junto con el resto del modelo. Las entradas de imagen son `base_0_rgb` (cámara ZED izquierda a 288x512) y `left_wrist_0_rgb` (cámara ZED derecha). El vector de estado/acción tiene 28 dimensiones con la distribución `neck(2) | left_arm(7) | right_arm(7) | left_hand(6) | right_hand(6)`. La salida se emite en chunks de 50 acciones a 20 fps (2,5 s de horizonte).

El entrenamiento combina 261 episodios de teleoperación real v4 a 20 Hz con 324 episodios sintéticos de RH56F1 procedentes de la ablación de velocidad (A_norm: flujo del esqueleto deformado en el tiempo para igualar la velocidad del efector final a la de la teleoperación, con las imágenes de fotogramas clave sin cambios). Los datos cubren 8 tareas sintéticas (airfryer_2, ball, bottle, bottle_over_shelf, bottle_pour_2, box, coffee_pot, doll) y 4 celdas reales, con proporciones de mezcla ∝ sqrt(frames). Las acciones sintéticas se generan con un IDM de profundidad y cinemática inversa de muñeca (HaWoR) sobre los vídeos deformados en velocidad. La optimización usa AdamW con un lr máximo de 2.5e-5, decaimiento coseno y warmup de 1000 pasos; se entrenó con batch 16 x 4 = 64 en 4 GPU H200 (NAVER MLXP). La aumentación de imagen es fométrica y afín, con una única muestra replicada sobre el par estéreo, y el espejo está desactivado. Las dimensiones constantes (como la cabeza) se normalizan con cuantiles y se ensanchan a media ± 0,1 rad. En el despliegue, el estado del cuello debe alimentarse como 0.889 / 0.001.

## Capacidades

- Control de manipulación bimanual: genera las 28 dimensiones de acción (cuello, ambos brazos y ambas manos RH56F1 de 6 grados de libertad cada una) a partir de dos imágenes y del estado.
- Ejecución de políticas de imitación: reproduce tareas aprendidas de teleoperación real con datos adicionales sintéticos.
- Percepción visual estéreo: consume un par de cámaras ZED a resolución 288x512 (base y muñeca izquierda).
- Planificación de acciones en bloque: emite chunks de 50 acciones a 20 fps, lo que permite una ejecución fluida de 2,5 s por inferencia.
- Tareas de pick-and-place, vertido y manipulación de objetos: el conjunto sintético incluye objetos como botella, caja, pelota, muñeca y utensilios de cocina (airfryer, cafetera).
- Tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad de agente textual; la política opera como controlador de bajo nivel.
- Capacidades multilingües: no disponible (no procesa texto de usuario).
- Modo de pensamiento / visión / audio: no disponible; la única modalidad de entrada documentada es visión + estado propioceptivo.

## Casos de uso

- Manipulación bimanual en un robot OpenArm con manos RH56F1: el modelo está ajustado específicamente a esta morfología (28 dimensiones) y produce las acciones conjuntas directamente, por lo que puede desplegarse como controlador de alto nivel sobre la teleoperación aprendida.
- Automatización de tareas de pick-and-place en laboratorio: la política reproduce la colocación de objetos (botella, caja, pelota, muñeca) tal y como se demuestra en los episodios reales, adecuada para entornos controlados de investigación.
- Manipulación con vertido de líquidos: las tareas `bottle_pour_2` y `coffee_pot` del dataset sintético y la teleoperación real permiten al modelo ejecutar vertidos que requieren control fino de muñeca.
- Cocina robótica doméstica: tareas con airfryer y cafetera incluidas en los datos sintéticos, como base para prototipos de asistencia en cocina.
- Investigación en generación de datos sintéticos: sirve como checkpoint de referencia para medir el efecto del "time-warping" de velocidad sobre la política, comparándolo con los checkpoints `noskel` y `firstkf` del mismo autor.
- Reproducción de experimentos de ablación: al compartir receta con el pipeline completo (`pi05-anyh2r-rh56f1-0916-wristik-30k`), permite aislar la contribución del preprocesado de velocidad frente al pipeline completo.
- Entrenamiento posterior (fine-tuning) sobre nueva morfología: al ser un fine-tune de `lerobot/pi05_base` con licencia Apache 2.0, puede reutilizarse como punto de partida para otras configuraciones de brazo o mano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos): ~8,3 GB en bf16/fp16, ~16,6 GB en fp32, ~4,2 GB en int8 y ~2,1 GB en int4. Hay que sumar memoria para activaciones e imágenes 288x512.
- GPU recomendadas: entrenamiento documentado en 4 GPU H200; para inferencia es suficiente una sola GPU como A100, H100, L40S o RTX 4090.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 (24 GB) en bf16; en tarjetas de 16 GB (RTX 4080/4060 Ti 16 GB) es ajustado en bf16 y más holgado en int8; en 8 GB solo cabría con cuantización int4.
- Opciones de despliegue: la librería LeRobot (`PI05Policy.from_pretrained(...)`) sobre PyTorch. Los servidores de LLM estándar (vLLM, TGI, llama.cpp, Ollama) no son aplicables a esta política VLA.
- Latencia y throughput: no disponibles. Como referencia de diseño, la política emite chunks de 50 acciones a 20 fps (2,5 s por bloque).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|
| `RyanL22/pi05-openarm-rh56f1-ablation-speeda-realsynth-20k` (este) | 4,14 B | 50 acciones @ 20 fps (2,5 s) | Apache 2.0 | Publicado en HuggingFace |
| `RyanL22/pi05-openarm-rh56f1-ablation-noskel-realsynth-20k` | No disponible | Misma receta (ablación sin esqueleto) | Apache 2.0 | Publicado en HuggingFace |
| `RyanL22/pi05-openarm-rh56f1-ablation-firstkf-realsynth-20k` | No disponible | Misma receta (ablación solo primer fotograma clave) | Apache 2.0 | Publicado en HuggingFace |
| `RyanL22/pi05-anyh2r-rh56f1-0916-wristik-30k` (pipeline completo) | No disponible | Misma morfología, pipeline completo | Apache 2.0 | Publicado en HuggingFace |
| `lerobot/pi05_base` (modelo base) | No disponible en esta ficha | Base pi0.5 sin ajustar | No disponible | Publicado en HuggingFace |

Comparativa de rendimiento entre estos checkpoints: no disponible (no se han publicado métricas de éxito en la información proporcionada).

## Limitaciones y advertencias

- Especialización estrecha: el ajuste está atado a la morfología OpenArm + manos RH56F1 (28 dimensiones) y a dos cámaras ZED a 288x512; no es una política generalista ni transferible sin reentrenamiento.
- Volumen de datos limitado: solo 261 episodios reales de teleoperación, complementados con 324 episodios sintéticos; el riesgo de sobreajuste y de baja cobertura de situaciones es alto.
- Dependencia de datos sintéticos: las acciones sintéticas se obtienen con un IDM de profundidad y cinemática inversa HaWoR, por lo que los errores de esos modelos se propagan a la política.
- Riesgo de alucinación motora: como toda política de imitación, puede generar trayectorias plausibles pero incorrectas ante estados fuera de distribución, con riesgo físico en el robot.
- Sesgos: no disponibles de forma explícita; es previsible un sesgo hacia las condiciones de iluminación, disposición de objetos y escenas de los episodios de entrenamiento.
- Idiomas y contexto textual: no aplica; no procesa instrucciones en lenguaje natural en esta configuración.
- Quirks de despliegue: es necesario alimentar el estado del cuello con los valores 0.889 / 0.001 indicados en la model card; ignorarlo puede degradar el comportamiento.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías; conviene verificar la licencia del modelo base y de los componentes heredados antes de un despliegue en producción.
- Madurez: el repositorio registra 0 descargas y 0 "likes" y fue creado/actualizado en septiembre de 2026 (fechas indicadas en los metadatos), por lo que no hay validación externa ni evidencia de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RyanL22/pi05-openarm-rh56f1-ablation-speeda-realsynth-20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Checkpoint de comparación (ablación sin esqueleto): https://huggingface.co/RyanL22/pi05-openarm-rh56f1-ablation-noskel-realsynth-20k
- Checkpoint de comparación (ablación solo primer fotograma clave): https://huggingface.co/RyanL22/pi05-openarm-rh56f1-ablation-firstkf-realsynth-20k
- Pipeline completo de referencia: https://huggingface.co/RyanL22/pi05-anyh2r-rh56f1-0916-wristik-30k
- Librería LeRobot: https://github.com/huggingface/lerobot
- Paper o blog del método pi0.5: no disponible en la información proporcionada.
- Repositorio o enlace del método HaWoR: no disponible en la información proporcionada.
- Demo o vídeo de rollout: no disponible en la información proporcionada.
