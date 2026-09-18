# LeeHakHo/drawer_real60_bs128_ckpt

## Resumen

`LeeHakHo/drawer_real60_bs128_ckpt` es un conjunto de checkpoints de una política de difusión (diffusion policy) entrenada por clonación de comportamiento para una tarea de manipulación robótica real: abrir un cajón, coger una flecha y colocarla dentro, con dos ciclos de agarre por demostración. Lo publica el usuario de HuggingFace LeeHakHo bajo licencia MIT, en un repositorio de 16,4 GB que contiene diez checkpoints (`model_epoch_{100,200,...,1000}.pth`), cada uno de unos 1,6 GiB con estado del optimizador y pesos EMA.

El entrenamiento se hizo sobre el dataset `LeeHakHo/drawer_real60`: 60 demostraciones reales con un brazo Franka, 30.374 muestras a 15 Hz con observaciones de 84 px y `seq_length` 16. La receta usa batch 128, learning rate 1,4e-4 (escalado por raíz cuadrada respecto al 1e-4 de batch 64), 700 pasos de warmup, decaimiento coseno que llega a cero exactamente en el paso final y 1000 épocas de 100 pasos. La ejecución completa tardó 11 h 34 min en una única RTX 4080 con la GPU en exclusiva.

Su relevancia es acotada pero concreta: no es un modelo de propósito general, sino un artefacto experimental reproducible. Las 60 demostraciones se usaron íntegramente para entrenamiento (`hdf5_filter_key` nulo y `experiment.validate` desactivado), por lo que no hay curva de validación y los checkpoints solo pueden seleccionarse por pérdida de entrenamiento. No hay simulador detrás del dataset, así que no se reporta tasa de éxito. Su interés principal es servir de referencia comparable con `LeeHakHo/square_real100_bs128_ckpt`, que sigue la misma receta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de difusión (diffusion policy) visuomotora para clonación de comportamiento; backbone concreto no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); `seq_length` 16 en la secuencia de observaciones |
| Tipos de cuantizacion | no disponible; solo se publican checkpoints PyTorch en coma flotante |
| Idiomas soportados | no aplica (política robótica visuomotora; no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (`model_epoch_{100,...,1000}.pth`, ~1,6 GiB cada uno, con estado del optimizador y pesos EMA) |
| Tarea | drawer: abrir el cajón, coger la flecha, colocarla dentro (dos ciclos de agarre por demostración) |
| Robot | Franka (brazo manipulador real) |
| Dataset de entrenamiento | `LeeHakHo/drawer_real60` (60 demostraciones reales, 30.374 muestras) |
| Frecuencia de control | 15 Hz |
| Resolucion de observacion | 84 px |
| Tamano del repositorio | 16,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card etiqueta el modelo como `diffusion-policy` y `behavior-cloning`, y lo describe como una implementación de referencia de diffusion policy para configuración de robot real. Se trata, por tanto, de una política que genera secuencias de acciones mediante un proceso de difusión condicionado por observaciones visuales de 84 px y por el estado del robot, entrenada por imitación supervisada sobre demostraciones (sin RLHF ni DPO, que no aplican a este dominio). La información disponible no detalla el backbone de la red de denoising (CNN o transformer), el horizonte de predicción de acciones ni el número exacto de parámetros.

El entrenamiento usó las 60 demostraciones completas como conjunto de entrenamiento: `hdf5_filter_key` es nulo y `experiment.validate` está desactivado, de modo que no existe partición de validación efectiva, aunque el archivo incluye `mask/train` 54 y `mask/valid` 6 deliberadamente sin usar. La configuración es batch 128, lr 1,4e-4 con 700 pasos de warmup y decaimiento coseno hasta cero en el paso final, durante 1000 épocas de 100 pasos. Solo se publican los checkpoints de cada cien épocas. La pérdida final de acción reportada es 0,0038 en la época 1000. Una innovación reseñable en el plano experimental es la ausencia de brazos auxiliares: `obs/object` y `obs/aux_valid` no existen en `drawer_real60` (la pose de la flecha no estaba trackeada al construir el archivo), por lo que cualquier variante con objetivo auxiliar de pose falla al cargar. Solo se publica el brazo `baseline/`.

## Capacidades

- Generación de secuencias de acciones para control visuomotor del brazo Franka en la tarea drawer concreta, a partir de observaciones de 84 px y estado propioceptivo.
- Ejecución de una secuencia con dos ciclos de agarre: abrir el cajón, coger la flecha, colocarla en el interior.
- Aprendizaje por clonación de comportamiento sobre demostraciones reales, sin recompensa ni entorno simulado.
- Control a 15 Hz, lo que fija un presupuesto temporal de aproximadamente 66,7 ms por paso de control.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües: no procesa texto ni lenguaje natural.
- No dispone de modo thinking, visión general, audio ni generación de texto.
- No incluye objetivos auxiliares de pose (el brazo `baseline/` es el único disponible).

## Casos de uso

- Reproducción de la receta de entrenamiento: sirve como referencia exacta de hiperparámetros (batch 128, lr 1,4e-4, 1000 épocas x 100 pasos) para replicar el entrenamiento en una sola GPU de consumo y verificar que la pérdida converge al mismo orden de magnitud.
- Comparación controlada con la tarea square: al compartir receta con `square_real100_bs128_ckpt`, permite aislar el efecto de la tarea y del número de demostraciones manteniendo constantes los hiperparámetros.
- Punto de partida para fine-tuning: el checkpoint de la época 1000 puede inicializar un reentrenamiento con demostraciones nuevas de drawer o de una tarea próxima, con la salvedad de que no existe criterio de selección por validación.
- Evaluación en bucle cerrado sobre el robot real: dado que no hay simulador ni tasa de éxito publicada, el uso realista es ejecutar rollouts en un Franka y medir la tasa de éxito manualmente, comparando contra los checkpoints intermedios.
- Estudio de estabilidad del entrenamiento en régimen de sobreajuste: al no haber validación, los diez checkpoints permiten analizar cómo evoluciona la pérdida de acción y si el modelo se degrada al final del decaimiento coseno.
- Análisis de sensibilidad al escalado de batch: comparar este checkpoint (batch 128) con entrenamientos a batch 64 y lr 1e-4 para validar empíricamente la regla de escalado por raíz cuadrada.
- Docencia y divulgación en robótica: ejemplo completo y público de un pipeline de diffusion policy sobre demostraciones reales, útil para ilustrar el flujo dataset-entrenamiento-checkpoint en robomimic.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay simulador detrás del dataset y que, por tanto, no se reporta tasa de éxito. El único dato cuantitativo de rendimiento es la pérdida de acción de entrenamiento:

| Metrica | Valor | Epoca |
|---|---|---|
| Loss de accion (entrenamiento, brazo `baseline/`) | 0,0038 | 1000 |

No existe curva de validación ni métrica de éxito en tarea real en la información proporcionada.

## Requisitos de hardware

- Entrenamiento: una única RTX 4080 (16 GB de VRAM) con la GPU en exclusiva; la ejecución completa tardó 11 h 34 min para 1000 épocas x 100 pasos.
- VRAM de inferencia: no disponible. No se documenta en la información proporcionada.
- GPU recomendadas: no disponibles. Como referencia derivada del dato de entrenamiento, la inferencia de una política de este tipo debería caber en GPU de consumo de gama similar a la usada para entrenar, pero esto no está confirmado por el autor.
- Ajuste en GPU de consumo: el entrenamiento cupo en una RTX 4080, lo que sugiere que la inferencia es viable en hardware de gama consumer equivalente o superior; no hay confirmación explícita.
- Almacenamiento: el repositorio ocupa 16,4 GB, con diez checkpoints de ~1,6 GiB cada uno. Para inferencia bastaría con cargar un único checkpoint.
- Opciones de despliegue: no se documentan. Al ser un checkpoint PyTorch `.pth`, requiere el código de la implementación de referencia de diffusion policy y del ecosistema robomimic; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no documentados. El control a 15 Hz implica un presupuesto de unos 66,7 ms por paso de control, pero no se publica la latencia real de inferencia ni el número de pasos de difusión empleados.

## Comparativa con modelos similares

| Modelo | Tarea | Demostraciones | Batch | Learning rate | Epocas x pasos | Loss entrenamiento | Licencia |
|---|---|---|---|---|---|---|---|
| `LeeHakHo/drawer_real60_bs128_ckpt` | drawer (abrir, coger flecha, colocar) | 60 | 128 | 1,4e-4 | 1000 x 100 | 0,0038 | MIT |
| `LeeHakHo/square_real100_bs128_ckpt` | square | no disponible (el nombre sugiere 100) | 128 | 1,4e-4 (misma receta declarada) | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada otros modelos públicos comparables de diffusion policy para estas tareas con datos de rendimiento verificables.

## Limitaciones y advertencias

- Sesgo de dataset muy reducido: solo 60 demostraciones de una única tarea y un único operador, lo que limita la generalización a variaciones de posición, iluminación o dinámica del cajón.
- Riesgo de sobreajuste elevado: las 60 demostraciones se usan íntegramente para entrenamiento, sin conjunto de validación (`hdf5_filter_key` nulo, `experiment.validate` desactivado); la selección de checkpoints solo puede hacerse por pérdida de entrenamiento, que no mide generalización.
- Ausencia de evaluación: no hay simulador ni tasa de éxito publicada, por lo que no se puede afirmar que el modelo complete la tarea en el robot real.
- Faltan objetivos auxiliares de pose: `obs/object` y `obs/aux_valid` no existen en el dataset, así que los brazos con objetivo auxiliar fallan al cargar y solo se publica `baseline/`.
- Resolución de observación baja (84 px), lo que puede ser insuficiente para tareas que requieran precisión fina o detección de objetos pequeños.
- Especificidad total de dominio: no es un modelo de lenguaje ni multimodal general; no genera texto, no razona y no soporta agentes ni tool calling.
- Dependencia de la frecuencia de control: el modelo fue entrenado a 15 Hz; operar a otra frecuencia sin reentrenar puede degradar el comportamiento.
- Licencia MIT, permisiva para uso comercial y modificación, pero el autor no ofrece garantías ni soporte, y el modelo no cuenta con descargas ni validación de la comunidad (0 descargas, 0 likes).
- Trazabilidad limitada: no se documenta el backbone exacto ni el número de parámetros, lo que dificulta la reproducibilidad fina.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LeeHakHo/drawer_real60_bs128_ckpt
- Dataset de entrenamiento: https://huggingface.co/datasets/LeeHakHo/drawer_real60
- Checkpoint comparable del mismo autor: https://huggingface.co/LeeHakHo/square_real100_bs128_ckpt
- La búsqueda web realizada no devolvió resultados relevantes: los enlaces obtenidos correspondían a páginas corporativas de Microsoft, sin relación con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible. La model card menciona la "implementación de referencia de diffusion policy" sin proporcionar enlace.
