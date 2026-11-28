# katsukiono/Yubisashi-0.8B

## Resumen

Yubisashi-0.8B es una política de manipulación jerárquica para tareas de sobremesa en el simulador LIBERO, desarrollada por el autor independiente katsukiono. A diferencia de las políticas visión-lenguaje-acción (VLA) convencionales, que mapean directamente observación e instrucción a acciones, este modelo separa el *dónde* del *cómo*: un modelo de lenguaje de 0,8B señala puntos en la imagen (objeto a manipular, punto de agarre y punto de destino) y una red MLP de solo 289.287 parámetros traduce esas estimaciones en acciones de 7 dimensiones.

La arquitectura combina cuatro variantes fine-tuneadas con LoRA de Qwen3.5-0.8B (que responden a cuatro preguntas distintas sobre la escena), un clasificador de cámara, dos refinadores sobre características congeladas de DINOv2-small y una cabeza de acción. Ninguna parte se entrena de extremo a extremo, lo que permite reentrenar componentes de forma aislada para nuevos escenarios, cámaras o brazos robóticos. El paquete completo ocupa 5,4 GB en disco y puede ejecutarse en un solo ordenador de sobremesa (probado en un Apple M4 Pro con 24 GB).

El modelo es relevante porque aborda tareas para las que no existen demostraciones: las tareas LIBERO "invertidas", cuyo objetivo deshace o redirige el de una tarea pública sobre la misma escena. Fue la política presentada al Track 3 de la tercera ronda final del Physical AI Robot Challenge 2026 (PARC2026), organizado por AIRoA y el laboratorio Matsuo-Iwasawa de la Universidad de Tokio en el marco de un proyecto NEDO.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Jerárquica: VLM (Qwen3.5-0.8B con LoRA) + refinadores sobre DINOv2-small congelado + cabeza MLP |
| Parámetros totales | 853M por variante del localizador (4 variantes, 258M compartidos); ~2,67B en memoria al cargar las cuatro; cabeza de acción de 289.287 parámetros; ~7M elementos tensoriales en redes auxiliares |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | fp16 (pesos del localizador); no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La política es una cadena de componentes con interfaces estrechas. El localizador (Qwen3.5-0.8B fine-tuneado con LoRA de rango 16 en todas las capas lineales y fusionado en fp16) recibe el primer fotograma de la cámara frontal y la instrucción, y devuelve un JSON con el objeto, el punto de agarre y el punto de destino como coordenadas de imagen en unidades 0–1000 con alturas en milímetros. Cuatro variantes responden a cuatro preguntas: agarre y destino; tipo de fijación a operar; ubicación sobre la fijación; y siguiente objeto en tareas con múltiples objetos. El punto de destino se calcula como la mediana de la respuesta generada y dos pequeñas cabezas señaladoras. Una red de vista y un clasificador de sala seleccionan la matriz de cámara para reproyectar los puntos a coordenadas de mundo. Dos refinadores sobre características congeladas de DINOv2-small (uno por cámara, frontal y de muñeca) actualizan las posiciones del objeto y del objetivo en cada paso. Finalmente, una MLP (44 → 512 → 512 → 7) mapea las estimaciones, el estado del efector y las salidas de las redes auxiliares a la siguiente acción, con una rama de terminación aprendida que decide cuándo el localizador debe volver a consultarse.

Todos los datos de entrenamiento se generaron en el simulador a partir de los activos públicos de LIBERO y LIBERO-plus: escenas renderizadas con posiciones reales de los objetos como etiquetas para el localizador y los refinadores, y rollouts de un profesor programado que lee el estado real del simulador para la cabeza de acción (aprendizaje por imitación). El profesor no forma parte del modelo. No se documenta el número de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Localización visual de objetos y puntos de agarre y destino a partir de una instrucción en lenguaje natural y un fotograma.
- Generación de políticas de manipulación de 7 dimensiones para tareas de sobremesa.
- Respuesta estructurada en JSON con coordenadas de imagen y alturas.
- Manejo de tareas con múltiples objetos mediante la rama de terminación y la variante de "siguiente objeto".
- Discriminación del tipo de fijación a operar y de la ubicación sobre ella.
- Refinamiento continuo de posiciones en cada paso usando dos cámaras (frontal y de muñeca).
- Generalización a tareas sin demostraciones (tareas LIBERO invertidas) mediante la separación entre localización y control.
- Reentrenamiento modular: cada componente puede reentrenarse por separado con su propio conjunto de datos para otra escena, cámara o brazo.
- No soporta tool calling, function calling, agentes multi-paso generales, visión de propósito general ni audio; su ámbito es exclusivamente la manipulación robótica en LIBERO.

## Casos de uso

- Manipulación de sobremesa en simulación: el modelo ejecuta tareas como sacar un objeto de un microondas y colocarlo junto a otro, usando el localizador para señalar y la cabeza de acción para generar la trayectoria.
- Investigación en políticas jerárquicas: sirve como banco de pruebas para estudiar la separación entre percepción semántica y control motor, ya que cada parte puede evaluarse de forma aislada antes de ejecutar episodios completos.
- Adaptación a nuevos escenarios sin reentrenar todo: al intercambiar solo los refinadores o la cabeza de acción, se puede trasladar la política a otra cámara o brazo con un conjunto de datos pequeño.
- Evaluación de generalización: el repositorio incluye un benchmark de 80 episodios perturbados con estados iniciales separados del entrenamiento, útil para medir robustez frente a variaciones.
- Docencia y prototipado en robótica: el requisito de hardware (un solo ordenador de sobremesa con 24 GB) permite experimentar sin clústeres de GPU.
- Investigación en tareas sin demostraciones: las tareas LIBERO invertidas permiten estudiar cómo una política compuesta generaliza cuando el objetivo contradice el de las demostraciones públicas.
- Desarrollo de sistemas de señalamiento visual ("pointing") aplicados a robótica, dado que el localizador produce puntos interpretables y etiquetables por una persona.

## Benchmarks y rendimiento

| Evaluación | Resultado |
|---|---|
| Tareas LIBERO invertidas (leaderboard de competición, dos rondas) | 0.000 para políticas VLA grandes fine-tuneadas; 0.162 para la versión previa a la release de este modelo |
| Benchmark propio de 80 episodios perturbados (estados iniciales separados del entrenamiento) | 29 episodios completados, de los cuales 27 sin desplazar ningún otro objeto |
| Episodio de ejemplo en tarea `u40` sin perturbación | Completado tras 170 pasos |
| Memoria de proceso máxima (Apple M4 Pro, MPS, replay) | 9,3 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no está orientado a tareas de lenguaje general.

## Requisitos de hardware

- VRAM estimada: el paquete ocupa 5,4 GB en disco y alcanzó 9,3 GB de memoria de proceso en MPS con las cuatro variantes cargadas en fp16.
- GPU recomendadas: no se especifican modelos de GPU; el autor valida el funcionamiento en Apple M4 Pro (24 GB) mediante MPS.
- Cabe en GPU de consumo: sí, siempre que dispongan de al menos ~10 GB de memoria libre para cargar las cuatro variantes en fp16.
- Opciones de despliegue: el repositorio incluye código de inferencia propio (`yubisashi/policy.py`, `examples/run_episode.py`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El episodio de ejemplo se completó tras 170 pasos, pero no se indica el tiempo por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yubisashi-0.8B | ~2,67B en memoria (4 variantes de 853M) | No disponible | VLA jerárquica (puntos + MLP) | Apache 2.0 | Hugging Face |
| Políticas VLA grandes fine-tuneadas para LIBERO invertido | No disponible | No disponible | VLA de extremo a extremo | No disponible | No disponible |
| Versión previa de Yubisashi | No disponible | No disponible | VLA jerárquica | No disponible | No disponible |

La información proporcionada no identifica por nombre las políticas VLA grandes comparadas ni ofrece sus especificaciones, por lo que la comparativa cuantitativa con alternativas concretas no está disponible.

## Limitaciones y advertencias

- El modelo solo se ha entrenado y validado en el simulador LIBERO; no hay evidencia de transferencia al mundo real.
- Los pesos liberados "conocen LIBERO": el diseño es general, pero el rendimiento fuera de ese dominio requiere reentrenar componentes.
- Solo soporta inglés como idioma de instrucción.
- No se documentan sesgos conocidos, pero al entrenarse con activos sintéticos de LIBERO y LIBERO-plus, hereda las limitaciones de diversidad de esas escenas.
- Riesgo de alucinación en el localizador: puede señalar objetos o puntos inexistentes; el punto de destino se mitiga con la mediana de tres estimaciones, pero el punto de agarre depende de la generación.
- Persisten constantes fijas en la lectura del estado del gripper y en los límites de altura cerca del objetivo (atributos de clase en `yubisashi/policy.py`), lo que limita la generalidad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de Qwen3.5-0.8B y DINOv2-small, cuyas licencias deben verificarse por separado.
- El rendimiento en el leaderboard de competición (0.162) es bajo en términos absolutos; no debe interpretarse como una política lista para producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/katsukiono/Yubisashi-0.8B
- Modelo base del localizador: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo base de características visuales: https://huggingface.co/facebook/dinov2-small
- LIBERO (simulador y activos): no se proporciona URL en la información disponible
- LIBERO-plus: no se proporciona URL en la información disponible
- Physical AI Robot Challenge 2026 (PARC2026): no se proporciona URL en la información disponible
- Repositorio con código de inferencia, scripts de entrenamiento y benchmark: incluido en el propio repositorio de Hugging Face (`examples/run_episode.py`, `yubisashi/policy.py`)
