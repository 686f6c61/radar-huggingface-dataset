# KitsuMate/stablemotion-onnx

## Resumen

StableMotion ONNX es una conversión al formato ONNX del módulo de corrección de secuencias StableMotion Correction, un post-procesador diseñado para el flujo de trabajo Vision To Pose. Desarrollado por KitsuMate, este modelo aborda el problema de limpiar y corregir capturas de movimiento (motion capture) obtenidas a partir de estimación de poses, reduciendo discontinuidades y artefactos temporales en animaciones. Su relevancia radica en que permite integrar un modelo probabilístico de difusión en pipelines de animación mediante ONNX Runtime, facilitando su uso en entornos de producción sin depender de PyTorch.

El modelo opera sobre una ventana de 100 fotogramas a 20 FPS, procesando 232 características de movimiento más una característica de calidad. El repositorio tiene un tamaño de 0,1 GB, lo que sugiere un modelo ligero. La licencia es "other" y restringe el uso a fines no comerciales, con condiciones derivadas de las licencias de AMASS, SMPL y del propio StableMotion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión probabilístico (denoiser) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | Ventana de 100 fotogramas (a 20 FPS) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de movimiento, no de texto) |
| Licencia | other (uso no comercial, sujeto a licencias upstream) |
| Formato de pesos | ONNX (archivos .onnx, con manifest.json) |

## Arquitectura y entrenamiento

StableMotion ONNX es un modelo de difusión probabilístico que actúa como denoiser sobre secuencias de movimiento. La representación de entrada consiste en 232 características de movimiento más una característica de calidad, procesadas en ventanas de 100 fotogramas. El entrenamiento se realizó sobre el conjunto de datos BrokenAMASS, derivado de AMASS, a una frecuencia de 20 FPS. El proceso de inferencia utiliza un muestreo de difusión coseno con 50 pasos, seguido de una etapa de detección básica con umbral 0,5, dilatación de un fotograma y posterior corrección o inpainting de los intervalos detectados como problemáticos.

La conversión a ONNX se realizó a partir del checkpoint oficial EMA (`stablemotion/ema001000000.pt`) y se validó la paridad con el denoiser original en PyTorch. No se dispone de detalles adicionales sobre la arquitectura interna (número de capas, tipo de atención, etc.) en la información proporcionada.

## Capacidades

- Corrección de secuencias de movimiento capturadas, reduciendo discontinuidades y artefactos temporales.
- Post-procesador específico para el flujo Vision To Pose, compatible con detectores como MediaPipe y SAM3D Body.
- Soporte de múltiples frecuencias de fotogramas: 10, 20, 24, 25, 29.97, 30, 50, 59.94 y 60 FPS, con manejo de tasas variables.
- Comportamiento probabilístico con semilla fija (seed 10) para reproducibilidad.
- Validación de continuidad de cuaterniones en Blender y pruebas de seguridad FK/IK.
- Capacidad de preservar poses de entrada cuando no se detectan intervalos problemáticos.

## Casos de uso

- Limpieza de capturas de movimiento en producción de animación: el modelo corrige automáticamente discontinuidades en secuencias capturadas, reduciendo el trabajo manual de limpieza en software como Blender o Maya.
- Integración en pipelines de Vision To Pose: tras la estimación de poses a partir de vídeo, StableMotion ONNX refina las secuencias para obtener movimientos más naturales y estables.
- Reducción de errores de seguimiento: en casos de discontinuidades severas (por ejemplo, un brazo que gira 155 grados), el modelo reduce el error a aproximadamente 3,46 grados sin introducir nuevos flips, como se indica en las validaciones.
- Post-procesado en tiempo real o casi real: al ser un modelo ONNX ligero (0,1 GB), puede ejecutarse con ONNX Runtime en CPU o GPU para su uso en herramientas de captura en vivo.
- Investigación en animación procedural: sirve como componente de corrección en estudios sobre generación y edición de movimientos sintéticos.
- Preservación de capturas de baja frecuencia: el modelo acepta entradas de baja tasa de fotogramas (10 FPS) y las remuestrea, aunque con menor detalle temporal recuperable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible, ya que se trata de un modelo especializado en movimiento y no en tareas de lenguaje o visión general. Las validaciones técnicas reportadas por el autor incluyen:

| Prueba | Resultado |
|---|---|
| Paridad PyTorch EMA-to-ONNX (denoiser) | Superada |
| Paridad detect/dilate/fix con máscaras idénticas | Superada |
| Pruebas de FPS (10, 20, 24, 25, 29.97, 30, 50, 59.94, 60) | Superadas |
| Continuidad de cuaterniones en Blender y seguridad FK/IK | Superadas |
| Preservación de poses MediaPipe y SAM3D Body VRoid | Superada |
| Inyección de discontinuidad de 155 grados | Reducida a aproximadamente 3,46 grados sin nuevo flip |

Estos datos provienen del `parity_report.json` incluido en el repositorio, aunque no se especifican métricas comparativas con otros modelos.

## Requisitos de hardware

- Tamaño del repositorio: 0,1 GB, lo que indica un modelo compacto.
- VRAM estimada: no disponible, pero por el tamaño del modelo es probable que quepa en GPUs de consumo (por ejemplo, RTX 3060 o superiores) e incluso en CPU con ONNX Runtime.
- GPU recomendadas: no especificadas; al ser ONNX, puede ejecutarse en cualquier hardware compatible con ONNX Runtime (CPU, CUDA, DirectML, etc.).
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), compatible con herramientas como Blender mediante scripts, o integración en pipelines personalizados.
- Latencia y throughput: no disponibles; dependen del hardware y del número de secuencias a procesar.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (corrección de movimiento mediante difusión). El autor no proporciona comparativas con alternativas como MotionDiffuse, MDM u otros modelos de generación de movimiento. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se publica solo para investigación no comercial. No otorga derechos comerciales y está sujeto a las licencias de StableMotion, AMASS, SMPL y los conjuntos de datos fuente.
- Dominio limitado: entrenado a 20 FPS en BrokenAMASS; movimientos fuera de ese dominio pueden ser ignorados o modificados de forma no deseada.
- Naturaleza probabilística: aunque se fija la semilla 10 y se implementan validaciones de rotaciones y rollback, no se garantiza una mejora para todas las animaciones.
- Entradas de baja frecuencia: las secuencias de baja tasa de fotogramas se remuestrean y contienen menos detalle temporal recuperable, lo que puede afectar a la calidad de la corrección.
- No genera información adicional: el modelo no produce cara, dedos, controles personalizados ni switches FK/IK; los resultados dependen del detector de origen, el rig de destino y la calidad del mapeo.
- Riesgo de alucinación: al ser un modelo generativo, podría introducir movimientos no presentes en la entrada si la detección falla, aunque el mecanismo de preservación de muestras fuera de intervalos detectados mitiga este riesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KitsuMate/stablemotion-onnx
- Repositorio upstream de StableMotion: https://github.com/Murrol/StableMotion
- Repositorio de KitsuMate (KitsuMate.Onnx): https://github.com/KitsuMate/KitsuMate.Onnx
