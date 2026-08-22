# samithva/cosmos_policy_acwam_18k

## Resumen

Este modelo es un world model condicionado por acciones (action-conditioned world model) basado en el sistema Cosmos Policy de NVIDIA. Concretamente, se trata de un export en PyTorch del checkpoint `cosmos_predict2_2b_480p_libero_all_suites_all_episodes_world_model` en la iteración de entrenamiento 18.000, publicado por el usuario `samithva`. No es una política de acción (policy), sino un modelo que, dadas una tarea, una imagen principal, una imagen de muñeca, la propiocepción actual y una secuencia de 48 acciones normalizadas, predice los latentes futuros de la escena en los horizontes +16, +32 y +48, junto con un valor escalar en el rango [0, 1].

El modelo se apoya en Cosmos-Predict2, un modelo de difusión latente de video de 2.000 millones de parámetros, adaptado por NVIDIA y Stanford para control visomotor y planificación. Su relevancia radica en que permite hacer planificación basada en modelos (model-based planning) sobre el benchmark LIBERO, ofreciendo una forma de evaluar trayectorias de acción antes de ejecutarlas. El repositorio incluye el state dict completo en BF16, los ficheros de configuración, las estadísticas de normalización y los embeddings de texto T5 precomputados para las instrucciones de LIBERO.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión latente de video (Cosmos-Predict2) |
| Parametros totales | 2B (2.000 millones) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No aplica (modelo de difusión de video, no procesa texto como LLM) |
| Tipos de cuantizacion | BF16 (pesos del state dict) |
| Idiomas soportados | Instrucciones en inglés (embeddings T5 precomputados para LIBERO) |
| Licencia | No disponible |
| Formato de pesos | PyTorch state dict (.pt) en BF16 |

## Arquitectura y entrenamiento

El modelo es una adaptación de Cosmos-Predict2, un modelo de difusión latente de video preentrenado por NVIDIA, que se ha ajustado para tareas de control visomotor. La arquitectura mantiene la estructura original del modelo de video y añade la inyección de modalidades adicionales (imagen principal, imagen de muñeca, propiocepción y acciones) mediante latentes. La salida son latentes futuros que se decodifican en imágenes de alta resolución (480p), además de un valor escalar que estima el retorno esperado.

El entrenamiento se realizó sobre el conjunto LIBERO All-Suites, que incluye múltiples suites de tareas de manipulación robótica. El checkpoint corresponde a la iteración 18.000 y se evaluó con cinco pasos de denoising. El proceso de exportación elimina el optimizador, el scheduler y el estado del entrenador, dejando únicamente los pesos del modelo. Se incluye un script de verificación que comprueba la integridad del checkpoint y un script de conversión para reproducir el proceso de DCP a PyTorch.

## Capacidades

- Predicción de latentes de imagen futuros en tres horizontes temporales (+16, +32 y +48) a partir de la observación actual y una secuencia de 48 acciones.
- Estimación de un valor escalar en el rango [0, 1] que representa el retorno esperado de la trayectoria condicionada.
- Condicionamiento multimodal: imagen principal, imagen de muñeca, propiocepción (vector de 9 elementos) y descripción de tarea en texto (embeddings T5).
- Acepta acciones normalizadas con las estadísticas proporcionadas en `libero_dataset_statistics.json` (forma (48, 7) o (B, 48, 7)).
- Compatible con el pipeline de evaluación del repositorio `cosmos-policy` de NVIDIA, incluyendo inferencia con planificación (best-of-N search).
- No genera texto ni ejecuta funciones de llamada; es exclusivamente un modelo de predicción de video y valor.

## Casos de uso

- Planificación basada en modelos (model-based planning): el modelo puede usarse para simular los resultados de diferentes secuencias de acciones y seleccionar la que maximice el valor predicho, mejorando la calidad de la política en tareas de manipulación.
- Evaluación de trayectorias en robótica: antes de ejecutar una política en el robot real, se pueden predecir las consecuencias visuales y el valor de cada paso, lo que permite descartar acciones de alto riesgo.
- Verificación de seguridad: en entornos simulados, el modelo puede anticipar estados futuros de la escena para detectar posibles colisiones o fallos antes de que ocurran.
- Aumento de datos para entrenamiento: las predicciones latentes pueden usarse para generar ejemplos sintéticos de transiciones y así complementar el conjunto de datos original de LIBERO.
- Investigación en world models: sirve como punto de partida para estudiar la evolución de escenas robóticas en un entorno de difusión latente, comparando la calidad de las predicciones en distintos horizontes.
- Desarrollo de agentes de control jerárquicos: el modelo puede integrarse en un sistema donde un planificador de alto nivel genera acciones y este world model valida las consecuencias antes de pasar al control de bajo nivel.

## Benchmarks y rendimiento

La model card del autor incluye una evaluación sobre 100 muestras de acciones condicionadas con cinco pasos de denoising. No se han publicado comparaciones con otros modelos en esta información.

| Horizonte | PSNR | SSIM | Ratio de desviación estándar latente |
|---|---:|---:|---:|
| +16 | 30.61 | 0.963 | 0.998 |
| +32 | 26.34 | 0.932 | 0.995 |
| +48 | 24.38 | 0.910 | 0.996 |

Error absoluto medio del valor: 0.0466.

Estos resultados indican que la calidad de la predicción degrada progresivamente con el horizonte temporal, pero mantiene una fidelidad alta en los primeros pasos y una desviación estándar latente estable.

## Requisitos de hardware

- VRAM estimada: según el paper de Cosmos Policy, la inferencia con Cosmos Policy (sin planificación basada en modelo) requiere alrededor de 6.8 GB de VRAM para tareas del benchmark LIBERO. Para la planificación con best-of-N (mínimo en serie) se requieren unos 10.0 GB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 8-10 GB de VRAM (por ejemplo, RTX 3070, RTX 4070, A100). El modelo requiere CUDA para la inferencia, aunque la verificación y conversión pueden ejecutarse en CPU.
- En consumer GPU: sí, cabe en tarjetas de gama media con 8-12 GB de VRAM, siempre que se use el modelo en BF16.
- Opciones de despliegue: el modelo se carga mediante el repositorio `cosmos-policy` de NVIDIA, con un script de evaluación específico (`run_libero_eval.py`). No es compatible con vLLM, llama.cpp u Ollama, ya que no es un modelo de texto.
- Latencia y throughput: no disponibles en la información proporcionada; depende de la GPU y del número de pasos de denoising (5 en la evaluación).

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos en la información proporcionada. Como referencia, el modelo se basa en Cosmos-Predict2 de NVIDIA, que es un modelo de difusión de video preentrenado. Otros world models para robótica como UniPi o el propio Cosmos Policy base podrían considerarse alternativas, pero no se han publicado resultados comparables en esta ficha. Por tanto, no se establece una comparativa numérica.

## Limitaciones y advertencias

- No es una política de acción: el modelo solo predice consecuencias y valores, no genera acciones directamente. Para usarlo como política es necesario un planificador externo.
- Dependencia de normalización: las acciones de entrada deben normalizarse con las estadísticas de `libero_dataset_statistics.json`; usar acciones sin normalizar producirá resultados incorrectos.
- Dominio limitado: el modelo está entrenado exclusivamente con el benchmark LIBERO All-Suites, por lo que su generalización a otros entornos o tareas no está garantizada.
- Riesgo de alucinación visual: como todo modelo generativo, las predicciones pueden ser inexactas, especialmente en horizontes largos (PSNR de 24.38 a +48), lo que puede inducir a errores en la planificación.
- Licencia desconocida: no se especifica licencia, por lo que se recomienda consultar la licencia del modelo base Cosmos-Predict2 de NVIDIA antes de un uso comercial.
- Requiere CUDA: la inferencia necesita una GPU con soporte CUDA; no es posible ejecutar el modelo en CPU para predicción.
- Dependencia de ficheros auxiliares: para cargar el modelo se necesitan los ficheros de configuración, estadísticas y embeddings T5 incluidos en el repositorio; si faltan, la carga fallará.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/samithva/cosmos_policy_acwam_18k
- Repositorio oficial de Cosmos Policy (NVIDIA): https://github.com/NVlabs/cosmos-policy
- Artículo arXiv: https://arxiv.org/abs/2601.16163
- Versión HTML del artículo: https://arxiv.org/html/2601.16163v1
- Informe de lectura de openmoss.ai: https://openmoss.ai/Awesome-WAM/report/2601.16163/index.en.html
- Resumen en Alphaxiv: https://www.alphaxiv.org/overview/2601.16163v1
