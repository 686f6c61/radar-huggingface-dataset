# FEGE16/robot-task-observer-subtask-recognition-history

## Resumen

Robot Task Observer es un adaptador LoRA de tipo vision-language publicado por el usuario FEGE16 sobre el modelo base Qwen/Qwen3-VL-4B-Instruct. Su función concreta es el reconocimiento del subtarea actual de un robot a partir de una secuencia causal de observaciones visuales: recibe un objetivo global de tarea y hasta ocho marcas temporales (cada una con una imagen de escena y una imagen de muñeca de 224x224 píxeles), y genera una descripción corta en inglés del subtarea que el robot está ejecutando en ese momento. El adaptador no modifica los pesos del modelo base ni del codificador visual: solo entrena componentes del decodificador de lenguaje.

El sistema del que forma parte, Robot Task Observer, propone usar un VLM externo como observador de un político VLA congelado (entrenado con OpenPI / pi0.5), de modo que la supervisión se obtiene de la observación visual sin tocar el controlador. Este checkpoint implementa una de las dos tareas de observación offline del proyecto y está pensado para investigación en robótica, no como modelo de propósito general.

Es relevante por su enfoque: demuestra que un adaptador de 33 millones de parámetros entrenables sobre un VLM de 4B puede extraer información semántica estructurada (acción, objeto manipulado, objetivo y relación espacial) de secuencias de imágenes de robot, con un coste de almacenamiento de 132 MB y licencia Apache 2.0. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado validación en bucle cerrado sobre robots reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM transformer (Qwen3-VL-4B-Instruct) con adaptador LoRA en el decodificador de lenguaje |
| Parametros totales | 4B en el modelo base; 33.030.144 parámetros entrenables en el adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en bfloat16 para el adaptador; el base admite las cuantizaciones habituales de Qwen3-VL) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, 132.195.448 bytes) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-4B-Instruct en una revisión fija del base (`ebb281ec70b05090aa6165b016eac8ec08e71b17`). El LoRA tiene rango 16, alpha 32 y dropout 0,05, y ataca las proyecciones q/k/v/o de atención y gate/up/down del MLP del decodificador de lenguaje; el modelo base y el codificador visual permanecen congelados byte a byte. La entrada es multimodal y secuencial: hasta ocho timestamps ordenados de pasado a presente, cada uno con imagen de escena e imagen de muñeca a 224x224, más el objetivo global de la tarea. La salida es una descripción corta en inglés de la que se extraen acción, objeto, objetivo y relación espacial; la etiqueta correcta nunca se proporciona como entrada y la evidencia insuficiente se representa como `UNKNOWN`.

El entrenamiento usó entropía cruzada supervisada sobre los tokens de respuesta, con learning rate 5e-5, micro-batch 1, acumulación de gradiente 16 y semilla 42. Los datos provienen de 63 trayectorias de robot generadas con OpenPI / pi0.5 y tareas basadas en LIBERO (LIBERO-Long, LoHo y LiLo Long++), agrupadas en 39 grupos físicos de origen; el split es de 39 trayectorias de entrenamiento, 12 de validación y 12 de test, manteniendo separados los grupos de origen. El checkpoint publicado corresponde a la época 3, seleccionada sobre validación antes de la evaluación en test. No se documentan fases de RLHF ni DPO.

## Capacidades

- Reconocimiento de subtarea actual en vídeo de robot: genera una descripción corta en inglés del subtarea observado a partir de una secuencia causal de imágenes.
- Extracción de campos semánticos estructurados: acción, objeto manipulado, objetivo y relación espacial, que la evaluación compara contra la etiqueta.
- Razonamiento temporal causal: usa hasta ocho timestamps ordenados de pasado a presente, sin observaciones futuras ni estado del simulador.
- Fusión de vistas: combina imagen de escena e imagen de muñeca en cada timestamp.
- Abstención explícita: emite `UNKNOWN` cuando la evidencia es insuficiente.
- Capacidades heredadas del base Qwen3-VL-4B-Instruct (comprensión imagen-texto general), aunque el adaptador está especializado y no se ha evaluado su preservación.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni thinking mode específico para este adaptador.

## Casos de uso

- Monitorización de ejecución de tareas en investigación robótica: dado un objetivo global y la ventana de imágenes de escena y muñeca, el adaptador describe el subtarea en curso, lo que permite registrar automáticamente el progreso de un político VLA congelado sin instrumentar el controlador.
- Etiquetado semiautomático de trayectorias: las descripciones generadas (acción, objeto, objetivo, relación espacial) pueden usarse como anotaciones preliminares de subtareas en nuevos conjuntos de datos de manipulación, sujetas a revisión humana.
- Detección de desviaciones en evaluación offline: comparando el subtarea predicho con el esperado en un plan, se pueden localizar tramos de una trayectoria donde el robot se aleja del objetivo, útil para análisis de fallos en LIBERO-Long, LoHo o LiLo Long++.
- Bucle de recuperación con retroalimentación lingüística: el adaptador encaja como componente de observación del diseño de Robot Task Observer, que propone convertir la descripción del subtarea en retroalimentación para el político VLA; hay que tener en cuenta que la mejora de tasa de éxito en bucle cerrado no se ha evaluado en esta release.
- Investigación sobre observadores externos de políticas VLA: sirve como línea base reproducible (LoRA r=16, 33 M de parámetros entrenables) para estudiar cuánta información de estado se puede recuperar solo con visión.
- Análisis de atención visual y representación temporal: al estar entrenado con historia causal de hasta ocho pasos, permite experimentos sobre cuánto contexto temporal necesita un VLM para identificar el subtarea actual.
- Prototipado en entornos simulados: con 132 MB de adaptador y un base de 4B, se puede desplegar en una GPU de investigación para iterar sobre prompts y ventanas de imagen sin reentrenar el VLM completo.

## Benchmarks y rendimiento

Resultados del test retenido del proyecto (916 consultas de historia), en porcentajes:

| Metrica | Valor |
|---|---:|
| Joint accuracy | 70,96 |
| Action Macro-F1 | 56,12 |

La accuracy conjunta exige que coincidan los cuatro campos semánticos (acción, objeto, objetivo y relación espacial). No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El adaptador pesa 132 MB; el modelo base Qwen3-VL-4B-Instruct debe cargarse aparte y es el que domina el consumo.
- VRAM estimada para inferencia en bfloat16: en torno a 8-10 GB para el base de 4B más el adaptador y los buffers de imagen (estimación orientativa, no publicada por el autor).
- GPU recomendadas: A100 o H100 para lotes grandes y evaluación por lotes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia individual en bf16.
- Cabe en GPU de consumo con 24 GB en bf16; en GPUs de 12-16 GB haría falta cuantizar el base, algo no documentado para este adaptador.
- Despliegue: el ejemplo oficial usa `transformers` (Qwen3VLForConditionalGeneration) con `peft` 0.17.1 y `device_map="auto"`; no se documentan recetas para vLLM, llama.cpp, Ollama ni TGI, y la integración de adaptadores LoRA multimodales en esos motores requeriría trabajo adicional.
- Latencia y throughput: no disponibles. La inferencia procesa hasta 16 imágenes de 224x224 por consulta (8 timestamps x 2 vistas), lo que condiciona el coste por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Robot Task Observer (este) | 4B base + 33 M entrenables | no disponible | LoRA de reconocimiento de subtarea con historia causal | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-VL-4B-Instruct | 4B | no disponible | VLM generalista imagen-texto | apache-2.0 | Hugging Face (oficial) |
| Políticas VLA tipo OpenPI / pi0.5 | no disponible | no disponible | Control directo acción desde visión | no disponible | Repositorio OpenPI |

La comparación relevante es con el propio base sin adaptador: este checkpoint añade especialización en subtareas de robot a cambio de perder generalidad y de depender de una ventana de historia de exactamente hasta ocho pasos. No hay datos públicos que permitan comparar su accuracy con otros adaptadores de la misma tarea.

## Limitaciones y advertencias

- La evaluación es offline y sobre estados iniciales retenidos de las configuraciones de tarea del proyecto; no demuestra generalización a familias de tareas no vistas ni a robots reales.
- El bucle de recuperación con retroalimentación lingüística es un diseño de sistema: no se ha evaluado la mejora de tasa de éxito en bucle cerrado en esta release.
- El adaptador está entrenado con historia; eliminar la secuencia temporal cambia la distribución de entrada y degrada el comportamiento esperado.
- Solo inglés: las descripciones generadas y las etiquetas están en inglés.
- Joint accuracy del 70,96 % implica que cerca de tres de cada diez consultas fallan en al menos uno de los cuatro campos; Action Macro-F1 de 56,12 indica confusión apreciable entre clases de acción.
- Riesgo de alucinación inherente al VLM base: puede describir acciones u objetos no presentes; el mecanismo `UNKNOWN` mitiga pero no elimina este riesgo.
- Sesgos: no documentados por el autor; al derivarse de 63 trayectorias de simuladores concretos (LIBERO, LoHo, LiLo Long++), el modelo puede sobreajustarse a sus objetos, texturas y distribuciones de cámara.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el modelo base mantiene su propia licencia Apache 2.0.
- No se incluyen imágenes de entrenamiento, anotaciones originales ni estados del optimizador; la reproducibilidad del entrenamiento es limitada.
- El repositorio no incluye el pipeline de entrenamiento ni de evaluación, solo el adaptador, la configuración y las comprobaciones de integridad (SHA-256 del peso: `4cf61b89458ae6b421d650d7df46eb1230bb9933f6f0b8834aa548ffae66cf79`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FEGE16/robot-task-observer-subtask-recognition-history
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- OpenPI: https://github.com/Physical-Intelligence/openpi
- LIBERO: https://github.com/Lifelong-Robot-Learning/LIBERO
- Artículo web encontrado en la búsqueda (no relacionado con este modelo, se incluye por completitud): https://thenewstack.io/meta-muse-specialized-models/
