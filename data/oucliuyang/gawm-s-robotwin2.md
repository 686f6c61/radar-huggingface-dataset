# oucliuyang/GAWM-S-RoboTwin2

## Resumen

GAWM-S-RoboTwin2 es un checkpoint de un modelo world-action para robótica, desarrollado por el usuario oucliuyang y publicado bajo licencia MIT. Forma parte de GAWM (Geometry-Aware World Model), un modelo compacto multi-tarea que combina un predictor ligero de características visuales con un decodificador de acciones, sin emplear modelos visión-lenguaje ni generadores de vídeo. Este repositorio contiene la versión entrenada sobre el benchmark RoboTwin 2.0.

El modelo resuelve el problema del control robótico multi-tarea a partir de observaciones visuales y estado propioceptivo: recibe imágenes de dos cámaras (cabeza y frontal) a 320×240, un estado de efector final de 16 dimensiones y el nombre de la tarea, y produce 32 pasos de objetivos articulares absolutos de 14 dimensiones. Su relevancia radica en que alcanza tasas de éxito superiores al 93 % en un protocolo mixto de 50 tareas con una arquitectura muy compacta (77,0 M de parámetros en total) y una latencia de 8,8 ms por consulta de chunk de acción.

La arquitectura se apoya en un encoder DINOv3 ViT-S/16 congelado (21,6 M de parámetros, no incluido en el repositorio) sobre el que se añaden un adaptador, un predictor de características futuras, un código de tarea y un decodificador de acciones (55,4 M de parámetros, que son los que contiene este checkpoint). El modelo está pensado para investigación en manipulación robótica y evaluación en simulación mediante RoboTwin 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | World-action model con encoder DINOv3 ViT-S/16 congelado, adaptador, predictor de características futuras y decodificador de acciones |
| Parámetros totales | 77,0 M (21,6 M del encoder congelado + 55,4 M del checkpoint) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, evaluados en bf16) |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades de lenguaje) |
| Licencia | MIT (DINOv3 se distribuye aparte bajo DINOv3 License de Meta) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GAWM sigue un diseño de world-action model sin modelo visión-lenguaje ni generador de vídeo. Un encoder DINOv3 ViT-S/16 congelado extrae características de parche de las imágenes de entrada; un predictor ligero pronostica esas características de parche en dos horizontes futuros, y un decodificador de acciones regresa chunks de acción a partir de los tokens actuales y los pronosticados. El nombre de la tarea selecciona un código de tarea almacenado en el checkpoint, lo que permite una única política para las 50 tareas del benchmark.

La entrada consta de dos cámaras a 320×240, un estado de efector final de 16 dimensiones y el identificador de tarea. La salida son 32 pasos de objetivos articulares absolutos de 14 dimensiones; en evaluación se ejecutan los primeros 16 tras un suavizado con spline cúbico B. El checkpoint incluye `config.yaml` y `dataset_statistics.json` para la normalización de acciones y estado. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Control robótico multi-tarea: una única política para las 50 tareas de RoboTwin 2.0.
- Predicción de características visuales futuras en dos horizontes mediante un predictor ligero.
- Generación de chunks de acción de 32 pasos con objetivos articulares absolutos de 14 dimensiones.
- Procesamiento de observaciones multimodales: dos cámaras (cabeza y frontal) a 320×240 más estado propioceptivo de 16 dimensiones.
- Condicionamiento por tarea mediante códigos de tarea almacenados en el checkpoint.
- Inferencia de baja latencia (8,8 ms por consulta de chunk en bf16 con batch size 1).
- No soporta tool calling, function calling, agentes basados en lenguaje, razonamiento simbólico ni capacidades multilingües.

## Casos de uso

- Evaluación de políticas de manipulación en simulación: el modelo se ejecuta en el protocolo cerrado de RoboTwin 2.0 con `demo_clean` o `demo_randomized`, permitiendo reproducir las tasas de éxito reportadas con 100 episodios por tarea.
- Investigación en world-action models: sirve como referencia compacta para estudiar la predicción de características futuras frente a enfoques basados en VLM o generadores de vídeo.
- Benchmarking de manipulación multi-tarea: al cubrir 50 tareas con una sola política, es útil para comparar metodologías bajo un protocolo común de 5.000 episodios.
- Prototipado de control visomotor: su latencia de 8,8 ms por chunk permite integrarlo en bucles de control simulados con requisitos de tiempo real moderados.
- Estudio de generalización a entornos aleatorizados: la comparación entre los regímenes clean (93,94 %) y randomized (93,10 %) permite analizar la robustez frente a variaciones del entorno.
- Base para fine-tuning en tareas robóticas específicas: al ser un checkpoint MIT de 55,4 M de parámetros entrenables, es viable adaptarlo a nuevos conjuntos de datos con recursos moderados.
- Docencia y reproducción de resultados: el repositorio incluye checksums y scripts de evaluación, lo que facilita la verificación de resultados en laboratorios académicos.

## Benchmarks y rendimiento

Protocolo mixto: una política para las 50 tareas; 100 episodios por tarea en cada configuración (5.000 episodios), semilla 0.

| Configuración | Tasa de éxito | Intervalo del 95 % (Wilson) |
|---|---|---|
| Clean | 93,94 % (4.697 / 5.000) | [93,24, 94,57] |
| Randomized | 93,10 % (4.655 / 5.000) | [92,36, 93,77] |

| Métrica | Valor |
|---|---|
| Latencia por consulta de chunk | 8,8 ms (mediana de 200; batch size 1, bf16, NVIDIA RTX PRO 5000) |

No se han publicado en la información disponible resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) ni comparativas numéricas con otros modelos robóticos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 55,4 M de parámetros en el checkpoint y pesos en bf16, la huella es del orden de cientos de MB, más el encoder DINOv3 ViT-S/16 (21,6 M) y las activaciones.
- GPU recomendadas: la latencia reportada se midió en una NVIDIA RTX PRO 5000; el script de evaluación admite múltiples GPU (`--gpus 0 1 2 3 4 5 6 7`).
- Cabe en GPU de consumo: previsiblemente sí, dado el reducido tamaño del modelo, aunque no se han publicado mediciones específicas en GPU de consumo.
- Opciones de despliegue: código oficial en github.com/gaoxiang12/gawm-public; descarga de pesos vía `hf download`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: 8,8 ms por consulta de chunk de acción (mediana de 200 ejecuciones, batch size 1, bf16). No se dispone de datos de throughput agregado.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables (parámetros, contexto, rendimiento, licencia o disponibilidad) para establecer una comparativa rigurosa.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GAWM-S-RoboTwin2 | 77,0 M totales (55,4 M en checkpoint) | no disponible | 93,94 % clean / 93,10 % randomized en RoboTwin 2.0 | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo específico de robótica: no procesa lenguaje natural ni tiene capacidades de generación de texto, código o matemáticas.
- Dependencia del entorno: entrenado y evaluado en RoboTwin 2.0; su comportamiento fuera de ese simulador o en robots reales no está documentado.
- Requiere el código externo `gawm-public` y la descarga separada del encoder DINOv3 ViT-S/16, que no se incluye en el repositorio.
- Al cargar el checkpoint se emite una advertencia por claves ausentes (`backbone.encoder.*` y `world_model.feature_decoder.*`); es esperado, pero conviene verificarlo en cada despliegue.
- El paper aún no está público ("The paper will be linked here once it is public"), por lo que faltan detalles de entrenamiento, datos y metodología.
- No se han publicado análisis de sesgos, riesgos de alucinación ni robustez fuera del protocolo evaluado.
- La licencia MIT cubre este checkpoint, pero DINOv3 se distribuye bajo la DINOv3 License de Meta, con condiciones propias que deben revisarse para uso comercial.
- El repositorio tiene un tamaño de 0,2 GB y un número muy reducido de descargas (40), lo que limita la validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/oucliuyang/GAWM-S-RoboTwin2
- Código oficial: https://github.com/gaoxiang12/gawm-public
- Paper: no disponible (pendiente de publicación según la model card)
