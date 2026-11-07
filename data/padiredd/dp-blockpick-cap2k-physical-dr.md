# padiredd/dp-blockpick-cap2k-physical-dr

## Resumen

`dp-blockpick-cap2k-physical-dr` es una política de difusión (diffusion policy) para robótica entrenada con LeRobot, publicada por el usuario padiredd en Hugging Face. Resuelve una tarea de manipulación concreta: coger un bloque verde lima con el brazo izquierdo de un robot ROBOTIS FFW SG2 equipado con pinza ROBOTIS CAD y cámeras de muñeca calibradas, sobre una mesa de 29,25 pulgadas. El modelo tiene 287.533.680 parámetros (unos 288 M) y se distribuye en formato safetensors, con un repositorio de 11,5 GB que incluye el checkpoint final (paso 100k) en la raíz y diez checkpoints intermedios cada 10.000 pasos.

La relevancia de esta ficha es acotada y muy específica: no es un modelo de lenguaje, sino un artefacto de investigación para el estudio de ablaciones de aleatorización visual frente a aleatorización física en datos de demostración simulados. El conjunto de datos de entrenamiento (`pick-cube-cap2k-physical-dr-yaw45-3cam`) contiene 2.000 demostraciones exitosas en simulación, todas con aleatorización física (pose inicial, altura de mesa y jitter de montaje y FOV de cámaras) y sin aleatorización visual (mesa, fondo, luces y color del bloque nominales). Esto lo convierte en la mitad "physical" de una ablación emparejada con otro modelo del mismo autor.

Arquitectónicamente es una diffusion policy con DDPM de 100 pasos, codificador ResNet18 por cámara, horizonte de predicción 64 (32 ejecutados) y n_obs_steps 1, entrenada durante 100.000 pasos con batch 32 y Adam a 1e-4 con decaimiento coseno. La model card no publica resultados de evaluación, benchmarks ni métricas de éxito, y la licencia figura como "other" sin texto de licencia disponible en la información consultada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM, 100 pasos de difusión) con codificador ResNet18 por cámara; implementación LeRobot (fork ROBOTIS lerobot-cyclo) |
| Parametros totales | 287.533.680 (~288 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; usa n_obs_steps = 1 y horizonte de acción 64) |
| Tipos de cuantizacion | No disponible (no se documentan variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | No disponible (modelo robótico; la tarea se especifica con la cadena "pick up the lime green block with the left arm") |
| Licencia | other (texto de licencia no disponible en la información consultada) |
| Formato de pesos | safetensors (repo de 11,5 GB con checkpoint final y diez checkpoints intermedios) |

## Arquitectura y entrenamiento

La política sigue el esquema de diffusion policy: genera trayectorias de acción mediante un proceso de difusión DDPM con 100 pasos, condicionado por observaciones visuales y propioceptivas. La entrada consta de tres cámaras (cabeza, muñeca izquierda y muñeca derecha) a 240x240 píxeles más un vector de estado articular de 22 dimensiones; la salida son 16 objetivos articulares a 15 Hz. Cada cámara pasa por un ResNet18 independiente, y la configuración de entrenamiento usa horizonte 64 con 32 acciones ejecutadas, n_obs_steps 1 y semilla 1000.

El entrenamiento se realizó durante 100.000 pasos con batch 32, optimizador Adam a 1e-4 y decaimiento coseno, en una única RTX 4090 de 24 GB compartida entre las dos ejecuciones de la ablación (aproximadamente 4,9 pasos/s por ejecución). Los datos proceden de 2.000 demostraciones exitosas en simulación generadas con el programa CaP `block_pick_v1_nocomp.py`, sin empujones, con yaw del bloque entre 0 y 45 grados, región completa, semillas 40001-40040 y aleatorización de apertura y cierre de pinza. El muestreo es uniforme sobre todos los fotogramas (EpisodeAwareSampler por defecto de LeRobot), sin ruido de estado, y con aumento de imagen agresivo en orden aleatorio de hasta cinco transformaciones simultáneas (brillo, contraste, saturación, tono, nitidez, afín, perspectiva, desenfoque, borrado aleatorio y escala de grises).

La particularidad metodológica es la separación de la aleatorización en dos conjuntos emparejados por pose de bloque, yaw, parámetros de movimiento y valores de pinza mediante `--split_rng`. Este checkpoint corresponde al conjunto físico: pose inicial con ±2 grados en las articulaciones 1, 2 y 4-7 del brazo, altura de mesa entre -2 y +2 cm ciclada por pieza, y jitter de montaje y FOV de cámaras (muñeca ±5 mm y ±1,5 grados, cabeza ±1,5 cm y ±2 grados, FOV ±3 %). Mesa, fondo, luces y color del bloque permanecen nominales.

## Capacidades

- Manipulación robótica de tipo pick-and-place: coger un bloque verde lima con el brazo izquierdo del FFW SG2 en simulación.
- Control de brazo de 7 articulaciones más pinza, con salida de 16 objetivos articulares a 15 Hz.
- Percepción multimodal de tres cámaras (cabeza y dos muñecas) a 240x240, más estado articular de 22 dimensiones.
- Generalización a variaciones físicas: perturbaciones de pose inicial, altura de mesa y calibración de cámaras dentro de los rangos de entrenamiento.
- Robustez a variaciones fotométricas y geométricas de imagen gracias al aumento agresivo aplicado durante el entrenamiento.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades de agente ni procesamiento de lenguaje natural.
- No dispone de modo de pensamiento, visión general, audio ni otras capacidades multimodales fuera del pipeline robótico.

## Casos de uso

- Investigación en aleatorización de datos: servir como mitad "physical" de una ablación emparejada para medir cuánto importa la variabilidad física frente a la visual en la transferencia sim-to-real de políticas de manipulación.
- Evaluación de robustez a calibración de cámaras: el jitter de montaje y FOV introducido en entrenamiento permite estudiar la degradación de la política ante desviaciones de calibración realistas en despliegues con cámeras de muñeca.
- Línea base reproducible para pick-and-place: con semillas, programa CaP y receta documentados, se puede replicar el entrenamiento y comparar variantes (por ejemplo, con empujones o con más yaw) bajo condiciones controladas.
- Estudio de aumento de imagen en diffusion policies: la receta aplica hasta cinco transformaciones simultáneas en orden aleatorio, lo que permite analizar su efecto sobre la estabilidad del entrenamiento y la generalización fotométrica.
- Docencia y formación en robótica de imitación: el repositorio incluye checkpoints cada 10.000 pasos, lo que facilita analizar la evolución del aprendizaje y visualizar curvas de pérdida sin reentrenar.
- Integración en pipelines LeRobot: se puede cargar con `DiffusionPolicy.from_pretrained("padiredd/dp-blockpick-cap2k-physical-dr")` y ejecutar en entornos Isaac Lab compatibles con la escena FFW SG2 descrita.
- Comparación entre checkpoints: los diez checkpoints intermedios permiten seleccionar el punto de operación con mejor equilibrio entre éxito y latencia antes de la evaluación final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación se añadirán cuando se ejecuten, y no incluye tasas de éxito, métricas de error de posición ni comparaciones con otras políticas.

## Requisitos de hardware

- Entrenamiento documentado: una RTX 4090 de 24 GB compartida entre dos ejecuciones, a ~4,9 pasos/s por ejecución con batch 32.
- VRAM de inferencia: no cuantificada en la información disponible; el tamaño del checkpoint final y el repo de 11,5 GB sugieren que el checkpoint completo (unos 288 M parámetros en fp32) ocupa aproximadamente 1,15 GB, pero no se documenta el pico de memoria en ejecución.
- GPU recomendadas: RTX 4090 (validada para entrenamiento); para inferencia, cualquier GPU con memoria suficiente para el checkpoint y las tres cámaras ResNet18, sin cifras publicadas.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 y GPUs de gama alta con 16-24 GB, aunque no hay medición oficial.
- Opciones de despliegue: LeRobot (carga vía `DiffusionPolicy.from_pretrained`), entorno Isaac Lab para la escena FFW SG2; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo robótico de este tipo.
- Latencia y throughput: no disponibles; solo se conoce la cadencia de acción de 15 Hz y la velocidad de entrenamiento (~4,9 pasos/s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-blockpick-cap2k-physical-dr (este) | ~288 M | n_obs_steps 1, horizonte 64 (32 ejecutados) | Pick de bloque con brazo izquierdo, aleatorización física | other | Hugging Face, repo 11,5 GB |
| padiredd/dp-blockpick-cap2k-yaw45 | ~0,3 B (según ficha de HF) | No disponible | Pick de bloque con yaw hasta 45 grados | No disponible | Hugging Face |
| padiredd/dp-blockpick-cap2k-yaw45-cotrain-real075 | ~0,3 B (según ficha de HF) | No disponible | Pick de bloque con coentrenamiento con datos reales (0,75) | No disponible | Hugging Face |

Los dos modelos comparables pertenecen al mismo autor y a la misma familia de experimentos; no se dispone de métricas de rendimiento para ninguno de ellos, por lo que la comparación se limita a parámetros, tarea y disponibilidad.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: no se puede afirmar ninguna tasa de éxito, ni en simulación ni en real.
- Entrenado exclusivamente en simulación (Isaac Lab) con 2.000 demostraciones; no se documenta transferencia a hardware real ni fine-tuning con datos reales en este checkpoint.
- El conjunto de datos no está publicado en Hugging Face, lo que limita la reproducibilidad completa del experimento a pesar de que la receta está descrita.
- La aleatorización visual está desactivada en este conjunto (mesa, fondo, luces y color del bloque nominales), por lo que la generalización a condiciones visuales distintas es una incógnita.
- La tarea está fijada a una instrucción concreta ("pick up the lime green block with the left arm") y a una escena específica (FFW SG2, mesa de 29,25 pulgadas, tres cámaras calibradas); no es un modelo generalista.
- Licencia "other" sin texto disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar al autor antes de cualquier despliegue productivo.
- Riesgo de alucinación en el sentido de generación de trayectorias plausibles pero inviables fuera de la distribución de entrenamiento; no hay validación publicada de límites de seguridad.
- Sesgos conocidos: no documentados; al ser un modelo de control motor, los sesgos relevantes serían de distribución (poses, alturas y yaw fuera del rango entrenado) más que sociales.
- No aplica soporte multilingüe ni de contexto textual; cualquier expectativa de uso como modelo de lenguaje es un error de categoría.
- El repositorio incluiye diez checkpoints intermedios además del final; hay que seleccionar explícitamente el paso deseado para evitar cargar el checkpoint equivocado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/dp-blockpick-cap2k-physical-dr
- Modelo comparable (yaw45): https://huggingface.co/padiredd/dp-blockpick-cap2k-yaw45
- Modelo comparable (cotrain real 0,75): https://huggingface.co/padiredd/dp-blockpick-cap2k-yaw45-cotrain-real075
- Repositorio LeRobot (framework de entrenamiento): no disponible en la información consultada
- Fork ROBOTIS lerobot-cyclo: no disponible en la información consultada
- Programa CaP block_pick_v1_nocomp.py: no disponible en la información consultada
- Conjunto de datos pick-cube-cap2k-physical-dr-yaw45-3cam: no disponible en Hugging Face según la model card
