# ruisv/bllm-smolvla-libero-512

## Resumen

`ruisv/bllm-smolvla-libero-512` es una compilación del modelo SmolVLA de Hugging Face (checkpoint `lerobot/smolvla_libero`) preparada para ejecutarse íntegramente en el BPU (unidad de procesamiento neuronal) de las placas de desarrollo RDK S100P y S600 de D-Robotics, mediante el runtime BLLM. SmolVLA es un modelo de visión-lenguaje-acción (VLA) de 450 millones de parámetros diseñado para robótica de manipulación: recibe dos imágenes de cámara, un vector de estado propioceptivo y una instrucción en inglés, y produce un chunk de 50 deltas del efector final. Esta versión concreta aporta una ruta de despliegue en hardware embebido de bajo coste, con cuantización int8/int16 y latencias de 741 ms (S100P) y 285 ms (S600) por chunk de acciones.

La relevancia de este modelo radica en que acerca los VLA a entornos de producción con restricciones de hardware, manteniendo una precisión comparable a la referencia en GPU: obtiene 70/100 y 71/100 en el benchmark `libero_spatial` frente a 73/100 de la misma política ejecutada en una RTX 4090. El paquete incluye tres grafos compilados (torre de visión, prefijo de lenguaje y experto de acciones), la tabla de embeddings pre-escalada, el tokenizador y los parámetros de normalización, todo bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA): SmolVLM (torre de visión) + SmolLM2 (prefijo de lenguaje) + experto de acciones con flow matching |
| Parametros totales | 450 M (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 48 slots de lenguaje (configuración fija); prefijo total de 177 tokens |
| Tipos de cuantizacion | int8 por canal de pesos, int16 estático por tensor de activaciones |
| Idiomas soportados | Inglés (instrucciones) |
| Licencia | Apache-2.0 |
| Formato de pesos | HBM (grafos compilados: `visual.hbm`, `model.hbm`, `expert.hbm`), binarios (`embed_tokens.bin`, `state_proj.f32`, `cond_table.f32`), `tokenizer.json`, `model.json` |

## Arquitectura y entrenamiento

SmolVLA es un modelo de flujo (flow matching) que combina una torre de visión SmolVLM, un modelo de lenguaje SmolLM2 como prefijo y un experto de acciones intercalado. El checkpoint base `lerobot/smolvla_libero` fue entrenado con el framework LeRobot sobre el benchmark LIBERO, y esta compilación no modifica los pesos, solo los transforma para el BPU. La cuantización se realiza con pesos int8 por canal y activaciones int16 estáticas por tensor, calibrando cada etapa sobre la salida compilada de la etapa anterior (la torre de visión genera los tokens reales que fijan los rangos del prefijo, y el prefijo genera el KV que calibra el experto). El embedding está pre-escalado por `sqrt(960)` para compensar la normalización interna del modelo, un detalle crítico que el runtime verifica en el manifiesto.

El modelo integra un vector de estado propioceptivo de 8 dimensiones (posición del efector, cuaternión convertido a axis-angle y posición de las pinzas) mediante una proyección lineal que se inyecta como token de prefijo. La salida son 50 deltas de efector final de 7 dimensiones, generados mediante 10 pasos de denoising. Al ser un modelo de flujo, la inferencia es estocástica: dos llamadas con la misma observación producen acciones distintas a menos que se fije la semilla del ruido latente.

## Capacidades

- Generación de acciones robóticas de manipulación: produce un chunk de 50 deltas de efector final (posición, orientación y apertura de pinza) a partir de observaciones visuales y textuales.
- Percepción multimodal: procesa simultáneamente dos flujos de cámara (escena y muñeca) a cualquier resolución, junto con una instrucción en lenguaje natural.
- Integración de estado propioceptivo: utiliza un vector de 8 dimensiones del efector para condicionar la generación de acciones, lo que mejora la precisión en tareas que requieren conocimiento de la pose actual.
- Ejecución en hardware embebido: funciona completamente en el BPU de las placas RDK S100P y S600, sin necesidad de GPU externa.
- Reproducibilidad controlada: permite fijar el ruido latente para obtener salidas bit-idénticas entre ejecuciones.
- Interfaz Python y C++: API `bllm.load_policy` y punto de entrada `bllm_smolvla_policy` para integración en sistemas robóticos.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede controlar un brazo robótico para tareas como "coger el bol negro y colocarlo en el plato", usando las dos cámaras y el estado del efector. Su latencia de 285 ms (S600) permite bucles de control a frecuencias de ~3.5 Hz.
- Automatización de líneas de montaje: con la configuración fija de 2 cámaras y horizonte de 50 acciones, es adecuado para tareas repetitivas de pick-and-place donde la instrucción se mantiene constante y solo cambian las observaciones.
- Prototipado de políticas robóticas en hardware de bajo coste: al ejecutarse en placas RDK (a partir de ~0.43 GB de grafos residentes), permite validar algoritmos VLA sin depender de estaciones con GPU.
- Investigación en robótica de bajo consumo: el paquete incluye los grafos compilados y los parámetros de normalización, lo que facilita reproducir experimentos de LIBERO en entornos embebidos y comparar el rendimiento con la referencia en GPU.
- Evaluación de cuantización en VLA: la documentación detalla el esquema de calibración en cascada y los efectos de la precisión int16, útil para estudiar el impacto de la cuantización en políticas de flujo.
- Despliegue en entornos con restricciones de energía: el BPU de las RDK consume significativamente menos que una GPU, lo que permite robots móviles o autónomos con batería limitada.

## Benchmarks y rendimiento

La model card reporta resultados en el benchmark `libero_spatial` (100 episodios) para las dos compilaciones y la referencia en GPU:

| Configuracion | libero_spatial (aciertos / 100) | Latencia por chunk de 50 acciones |
|---|---:|---:|
| S100P (BPU) | 70 | 741 ms |
| S600 (BPU) | 71 | 285 ms |
| RTX 4090 (referencia PyTorch) | 73 | 500 ms |

La diferencia entre las tres configuraciones está dentro del error estándar binomial (4.6 puntos para n=100), y el perfil de errores por tarea coincide entre placas y GPU. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) porque el modelo no es un LLM de propósito general, sino una política robótica especializada.

## Requisitos de hardware

- Placas soportadas: D-Robotics RDK S100P y RDK S600, con ejecución exclusiva en el BPU.
- Memoria de grafos residentes: 1.43 GB en S100P, 0.43 GB en S600.
- No requiere GPU: el paquete está compilado para BPU; la referencia en GPU (RTX 4090) se usa solo para comparación, no para despliegue.
- Runtime: BLLM, que debe compilarse desde fuente (la versión publicada 0.4.2 no incluye soporte para `arch: "smolvla"`).
- Interfaz: Python (`bllm.load_policy`) y C++ (`bllm_smolvla_policy`).
- Latencia medida: 741 ms (S100P) y 285 ms (S600) por chunk de 50 acciones, incluyendo la torre de visión (261/118 ms), el prefijo SmolLM2 (163/43 ms) y el experto de acciones (302/107 ms).

## Comparativa con modelos similares

| Modelo | Parametros | Hardware objetivo | libero_spatial | Licencia | Formato |
|---|---|---|---|---|---|
| `ruisv/bllm-smolvla-libero-512` (este) | 450 M | RDK S100P/S600 (BPU) | 70-71/100 | Apache-2.0 | HBM + binarios |
| `lerobot/smolvla_libero` (base) | 450 M | GPU (PyTorch) | ~73/100 (RTX 4090) | Apache-2.0 | Safetensors |
| π0.5 (configuración LIBERO) | No disponible | GPU | No disponible | No disponible | No disponible |

La comparación directa con π0.5 se menciona en la model card solo para señalar que SmolVLA lee el estado propioceptivo mientras que π0.5 no lo hace en su configuración LIBERO. No hay datos públicos de rendimiento de π0.5 en el mismo benchmark para una comparación cuantitativa.

## Limitaciones y advertencias

- Configuración fija: el paquete está compilado para exactamente 2 cámaras, 48 slots de lenguaje, horizonte de 50 acciones, estado de 8 dimensiones y acción de 7. Cualquier cambio (p. ej., añadir una tercera cámara o alargar la instrucción) requiere una nueva compilación.
- Estocasticidad inherente: al ser un modelo de flujo, las acciones varían entre ejecuciones con la misma observación. Para comparaciones reproducibles es obligatorio fijar el ruido latente mediante el parámetro `noise=`.
- Dependencia del estado propioceptivo: omitir el vector de estado produce una degradación severa (medida en 2.0 unidades de acción, equivalente a una apertura completa de la pinza). No es un componente opcional.
- Requisito de compilación del runtime: la versión estable de BLLM (0.4.2) no soporta la arquitectura `smolvla`; hay que construir el runtime desde fuente, lo que añade complejidad al despliegue.
- Idioma limitado: las instrucciones deben estar en inglés; no hay soporte multilingüe documentado.
- Sin datos de sesgos: no se han publicado evaluaciones de sesgo o robustez frente a variaciones de iluminación, oclusión o cambios de fondo.
- Alcance restringido a LIBERO: el modelo está entrenado específicamente para el benchmark LIBERO; su generalización a otras tareas o entornos no está verificada.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ruisv/bllm-smolvla-libero-512
- Modelo base: https://huggingface.co/HuggingFaceVLA/smolvla_libero
- Checkpoint alternativo en LeRobot: https://huggingface.co/bicmol/smolvla-libero
- Paper de SmolVLA: https://arxiv.org/html/2506.01844
- Sitio oficial de SmolVLA: https://smolvla.net/index_en
- Runtime BLLM: https://github.com/ruisv/bllm
- Repo de fine-tuning con LoRA: https://github.com/goelshivam1210/smolvla
- Framework LeRobot: https://github.com/huggingface/lerobot
