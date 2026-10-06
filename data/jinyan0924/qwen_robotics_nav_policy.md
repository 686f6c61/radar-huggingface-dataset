# Jinyan0924/qwen_robotics_nav_policy

## Resumen

`Jinyan0924/qwen_robotics_nav_policy` es una política de navegación robótica de tipo vision-language-action (VLA) construida sobre `Qwen/Qwen2.5-VL-3B-Instruct`. Recibe como entrada hasta seis imágenes de la cámara frontal separadas por un segundo, opcionalmente las posiciones pasadas del robot, y un objetivo expresado como coordenadas (x, y) en el sistema de referencia del robot o como instrucción de texto. Devuelve la siguiente trayectoria de 2 metros como 8 waypoints espaciados 0,25 m, sin prescribir velocidad.

El modelo añade al VLM base un adaptador LoRA de rango 16 (alpha 32) sobre las proyecciones de atención y MLP del modelo de lenguaje, con 29,9 M de parámetros entrenables, más una cabeza de regresión de 9,7 M de parámetros. El codificador visual permanece congelado. Se entrenó por imitación sobre 1,11 M de fotogramas (79 horas) procedentes de EgoWalk, casas simuladas HSSD, RoboSense y CODa. El repositorio ocupa 12,7 GB y se publica bajo licencia `qwen-research`, restringida a uso de investigación y no comercial.

Es relevante sobre todo por su carácter de artefacto de investigación abierto: el autor lo publica de forma transparente como un primer entrenamiento incompleto, con checkpoints intermedios, código de conversión de datos y una suite de evaluación auditada. El run principal `e1_all_sqrt` se detuvo en el paso 12.000 de 69.400 y quedó relegado a baseline tras comprobarse que toma el objetivo por un canal numérico lateral e ignora el texto del prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-VL) con adaptador LoRA y cabeza de regresion de acciones |
| Parametros totales | Modelo base de 3B (congelado en el codificador visual); 39,6 M entrenables (29,9 M LoRA rango 16 alpha 32 + 9,7 M cabeza de accion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; la entrada admite hasta 6 imagenes frontales separadas 1 s |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors en precision original) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (`license: other`), solo investigacion, no comercial |
| Formato de pesos | safetensors (adaptador LoRA) + `head.pt` (PyTorch) + `config.json` |
| Tamano del repositorio | 12,7 GB |
| Entrada | Hasta 6 imagenes (redimensionadas a ~336 x 336 pixeles de area), posiciones pasadas opcionales, objetivo (x, y) en metros |
| Salida | 8 waypoints (x, y) espaciados 0,25 m |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-VL-3B-Instruct como columna vertebral multimodal. Sobre ella se entrena un adaptador LoRA de rango 16 con alpha 32 aplicado a las proyecciones de atención y MLP del modelo de lenguaje (29,9 M de parámetros), junto con una cabeza de regresión específica de 9,7 M de parámetros que produce directamente los 8 waypoints. El codificador visual queda congelado durante todo el entrenamiento. El objetivo es puramente de imitación: regresar la trayectoria registrada a partir de las imágenes, las posiciones pasadas y el prompt.

Los datos suman 1,11 M de fotogramas y 79 horas: EgoWalk (905.000 fotogramas, personas caminando), casas simuladas HSSD (159.000), RoboSense (26.000) y CODa (20.000), usando solo las particiones de entrenamiento. El muestreo entre fuentes es proporcional a la raíz cuadrada del tamaño de cada una, lo que da una mezcla aproximada de 58 / 24 / 10 / 8 %. Los prompts incluyen objetivos puntuales de 4 a 20 m a lo largo de la trayectoria registrada y, en EgoWalk, también sus objetivos en lenguaje natural. La optimización usa AdamW, batch 16, tasa de aprendizaje 1e-4 para el LoRA y 3e-4 para la cabeza, 500 pasos de calentamiento y decaimiento coseno a lo largo de 69.400 pasos, sobre una única H100 a unos 4,8 s por paso.

Como innovación relevante, el autor documenta una segunda etapa denominada *final-frame pretraining* (carpetas que empiezan por `ff`), que combina fotogramas pasados con el fotograma situado 5 segundos por delante para predecir movimiento. La carpeta `ff0_e2e_test` es solo una prueba de pipeline de 500 pasos, no un modelo utilizable.

## Capacidades

- Navegación punto a punto en interiores: dado un objetivo (x, y) en el marco del robot, produce una trayectoria local de 2 m en 8 waypoints.
- Entrada visual multi-fotograma: consume hasta 6 imágenes frontales separadas 1 s, lo que aporta información de movimiento.
- Consumo de posiciones pasadas del robot como entrada opcional, además de las imágenes.
- Salida geométrica lista para un planificador local: waypoints espaciados por distancia (0,25 m), no por tiempo, por lo que no impone velocidad.
- Acepta instrucciones de texto como objetivo ("Walk to the glass door on the left."), aunque el run `e1_all_sqrt` detenido en el paso 12.000 no las utiliza de forma efectiva.
- Dataset de evaluación asociado de 150 escenarios auditados, con métricas de colisión imputable y progreso hacia el objetivo.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, audio ni modo de razonamiento explícito.

## Casos de uso

- Navegación local en interiores reales: en la suite v2 (100 escenarios reales) el checkpoint `step_5000` alcanza un 80 % de éxito con un 9 % de colisiones, por lo que puede emplearse como generador de trayectorias de corto alcance en pasillos, halls y centros comerciales.
- Baseline de investigación en políticas VLA de navegación: al publicar checkpoints cada 5.000 pasos, log de entrenamiento (`log.jsonl`) y métricas de evaluación, sirve como punto de comparación reproducible para nuevos métodos.
- Evaluación comparativa de planificadores: la model card indica que supera a planificadores naífs en interiores reales, principalmente por colisionar menos, lo que permite usarlo como referencia en estudios de planificación local.
- Módulo de bajo nivel en una pila de autonomía: los 8 waypoints a 0,25 m se integran directamente en un costmap o planificador local que gestione el control de velocidad y la evitación reactiva.
- Pretraining de representaciones para navegación: la etapa `ff` (fotograma actual más fotograma 5 s por delante) está pensada como preentrenamiento previo al ajuste fino de una política final.
- Investigación en robótica humanoide y de marcha lenta: la política está etiquetada para robots humanoides y diseñada explícitamente para un robot que camina despacio, con trayectorias definidas por distancia y no por tiempo.
- Auditoría y reutilización de datos de navegación abiertos: los cuatro conjuntos de datos y el código de conversión del repositorio permiten reentrenar o reproducir la mezcla de EgoWalk, HSSD, RoboSense y CODa.

## Benchmarks y rendimiento

Resultados publicados para el checkpoint `step_5000` sobre la suite de evaluación de 150 escenarios auditados. La trayectoria predicha se sigue a 0,5 m/s y se puntúa por colisiones imputables y progreso hacia el objetivo; el éxito exige ausencia de colisión y al menos la mitad del progreso posible.

| Escenarios | Exito | Colision | "Recto al objetivo" exito / colision |
|---|---|---|---|
| v2 interior, 100 reales | 80 % | 9 % | 69 % / 31 % |
| v1 interior, 25 reales + 75 casas simuladas | 35 % | 58 % | 20 % / 80 % |
| de los cuales casas simuladas (75) | 17 % | 77 % | 0 % / 100 % |
| exterior, 50 reales | 26 % | 4 % | 68 % / 32 % |

Advertencias del propio autor sobre estas cifras: el resultado de exterior es un artefacto de puntuación (el modelo predice 2 m de trayectoria mientras los 33 escenarios RoboSense se puntúan sobre 10 s, es decir 5 m a 0,5 m/s, por lo que no puede alcanzar el umbral de progreso); las puntuaciones de los checkpoints tempranos (pasos 1.000 / 3.000 / 5.000) variaron unos 10 puntos sin tendencia clara, dentro del ruido para 100 escenarios. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks de VLM generalistas en la información disponible.

## Requisitos de hardware

- Inferencia: se necesita una GPU con aproximadamente 16 GB de memoria, según la model card.
- Entrenamiento: una sola H100, con un coste aproximado de 4,8 s por paso.
- GPU de consumo compatibles: cualquier tarjeta con 16 GB o más de VRAM (por ejemplo RTX 4090 de 24 GB o RTX 4060 Ti de 16 GB) debería cubrir el requisito declarado; no se especifican modelos concretos probados.
- Despliegue: los checkpoints se cargan con el código del proyecto (`vla.pipeline.NavigationPipeline`), no con `peft` por sí solo, ya que cada checkpoint incluye `lora/`, `head.pt` y `config.json`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput de inferencia: no disponibles. El único dato de rendimiento publicado es el tiempo de entrenamiento (4,8 s por paso en H100).
- Repositorio: 12,7 GB, lo que condiciona el almacenamiento local y la descarga de todos los checkpoints.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Salida | Licencia | Estado |
|---|---|---|---|---|---|
| qwen_robotics_nav_policy | 3B base + 39,6 M entrenables (LoRA + cabeza) | Navegacion VLA (imagen -> trayectoria) | 8 waypoints (2 m) | qwen-research, no comercial | Entrenamiento incompleto (detenido en el paso 12.000 de 69.400) |
| Qwen2.5-VL-3B-Instruct (modelo base) | 3B | Vision-lenguaje generalista | Texto | no disponible en la informacion | Publicado y estable |
| Planificadores naif mencionados en la model card | no aplica | Planificacion de navegacion | Trayectoria o control | no disponible | Usados como referencia cualitativa, sin cifras publicadas |

No se dispone en la informacion proporcionada de otras politicas VLA de navegacion abiertas con parametros, contexto y resultados comparables, por lo que la comparativa cuantitativa con alternativas del mismo tamano queda como no disponible.

## Limitaciones y advertencias

- Modelo inacabado: el run `e1_all_sqrt` se detuvo en el paso 12.000 de 69.400 (una pasada completa sobre los datos) y se conserva solo como baseline.
- El run detenido toma el objetivo por un canal numérico lateral e ignora el texto del prompt, por lo que las instrucciones en lenguaje natural no funcionan de forma fiable en ese checkpoint.
- Colisiones frecuentes en entornos domésticos simulados con puertas y muebles: 77 % de colisiones y 17 % de éxito en los 75 escenarios de casas simuladas.
- No ha pasado pruebas de seguridad. El autor advierte explícitamente de que no debe ejecutarse en un robot cerca de personas.
- Licencia `qwen-research`: uso exclusivo de investigación y no comercial. Cualquier despliegue comercial requiere revisar los términos del modelo base enlazado.
- Cifras de evaluación poco fiables: variaciones de unos 10 puntos entre checkpoints tempranos sin tendencia, dentro del ruido estadístico con 100 escenarios, y artefacto de puntuación confirmado en el conjunto de exterior.
- Sesgos conocidos: no documentados en la información disponible, más allá del desequilibrio de la mezcla de datos (58 % EgoWalk frente a 8 % CODa) y del predominio de escenas de interior.
- Riesgo de alucinación geométrica: al ser un modelo de regresión de trayectorias sin verificación de colisión explícita, puede generar waypoints que crucen obstáculos, como evidencian las tasas de colisión publicadas.
- Idiomas soportados y longitud de contexto no disponibles; la entrada visual está limitada a 6 imágenes a 1 s de separación.
- El horizonte de predicción es de solo 2 m, lo que obliga a reejecutar la política de forma continua y limita su uso en planificación de largo alcance.
- Restricciones de integración: requiere el código del proyecto para cargar los checkpoints; no es compatible con `peft` de forma aislada ni con servidores de inferencia estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jinyan0924/qwen_robotics_nav_policy
- Modelo base Qwen2.5-VL-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct/blob/main/LICENSE
- Repositorio de código, conversión de datos y evaluación: https://github.com/naomili0924/qwen_robotics_open_dataset
- Suite de evaluación: https://huggingface.co/datasets/Jinyan0924/qwen_robotics_nav_eval
- Dataset EgoWalk: https://huggingface.co/datasets/Jinyan0924/qwen_robotics_open_dataset_egowalk
- Dataset de escenarios de navegación puntual en Habitat/HSSD: https://huggingface.co/datasets/Jinyan0924/habitat_hssd_pointgoal_nav_scenarios
- Dataset RoboSense: https://huggingface.co/datasets/Jinyan0924/qwen_robotics_open_dataset_robosense
- Dataset agregado de robótica: https://huggingface.co/datasets/Jinyan0924/qwen_robotics_open_dataset
