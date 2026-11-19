# madokalif/RescueBench

## Resumen

RescueBench es una familia de seis fine-tunes del modelo fundacional de robótica NVIDIA GR00T-N1.7-3B, adaptados a tareas de búsqueda y rescate con drones (UAV) dentro del simulador RescueBench. El autor, madokalif, parte del checkpoint base de 3B parámetros y entrena políticas visomotoras que hacen que un dron explore una zona reportada, localice a una persona herida mostrada en una imagen de referencia y se mantenga en vuelo estacionario al confirmarla. El repositorio no contiene un único modelo, sino seis carpetas que corresponden a variantes experimentales con distintas ablaciones de datos y modalidades de entrada.

Cada variante es el checkpoint final (paso 5000) de un entrenamiento independiente e incluye solo pesos y processor, sin estado del optimizador. Las diferencias entre variantes permiten estudiar el efecto de la cantidad de datos (100%, 50%, 25%) y de la eliminación de sensores o señales concretas (cámara descendente, imagen de referencia, siguiente punto de búsqueda). El modelo es relevante para investigación en robótica aérea porque demuestra cómo un VLA (vision-language-action) de 3B parámetros puede adaptarse a una tarea de navegación y búsqueda con datos de demostración limitados, aunque la evaluación publicada es solo offline y no mide éxito real de búsqueda en el simulador.

La licencia es la NVIDIA Open Model License, heredada del modelo base, y el repositorio ocupa 50,5 GB. No hay información sobre idiomas soportados ni sobre benchmarks estándar de NLP, ya que el pipeline es de robótica y no de generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en GR00T-N1.7-3B; VLM congelado con projector y cabeza de acción DiT entrenados |
| Parametros totales | 3B (modelo base nvidia/GR00T-N1.7-3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente bf16) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (other) |
| Formato de pesos | safetensors |
| Entrada visual | vídeos a 2 fps, 240x320 RGB (front, down, reference) |
| Estado de navegación | nav_state (3): altitud [m], sin(yaw), cos(yaw) |
| Objetivo de búsqueda | search_target (3): siguiente punto relativo al cuerpo y radio de búsqueda |
| Salida de acción | action chunk de 8 pasos: body_delta (4) dx, dy, dz [m], dyaw [rad]; stop (2) hover_stop, land |
| Etiqueta de embodiment | new_embodiment |
| Tamano del repositorio | 50,5 GB |

## Arquitectura y entrenamiento

El modelo base GR00T-N1.7-3B es un modelo visomotor de NVIDIA que combina un backbone VLM (codificador visual más modelo de lenguaje) con una cabeza de acción basada en Diffusion Transformer (DiT). En estos fine-tunes, el VLM (modelo de lenguaje y codificador visual) permanece congelado y solo se entrenan el projector, la cabeza de acción DiT y la layer norm del VL. La política recibe vídeos a 2 fps de 240x320 píxeles (cámara frontal, cámara descendente e imagen de referencia), un vector de estado de navegación de tres dimensiones y un objetivo de búsqueda de tres dimensiones, y predice chunks de 8 pasos con deltas de posición y orientación en el marco del cuerpo, más señales de parada (hover y land).

El entrenamiento es idéntico en las seis variantes: una GPU H100 de 80 GB, batch global de 128, 5000 pasos (640k muestras, aproximadamente 15,5 pasadas sobre el split completo de entrenamiento), learning rate 1e-4 con decaimiento coseno y 5% de warmup, state dropout de 0,1 y precisión bf16. Los datos provienen del dataset madokalif/rescuebench-drone-search-v1: 858 episodios en el split completo, 430 en frac50 y 215 en frac25. Las ablaciones eliminan la cámara descendente (no_down), la imagen de referencia (no_reference) o el siguiente punto de búsqueda (no_target). No se menciona uso de RLHF ni DPO; el entrenamiento es supervisado por imitación sobre demostraciones.

## Capacidades

- Navegación visomotora de drones en entornos simulados: genera comandos de movimiento en el marco del cuerpo (dx, dy, dz, dyaw) a partir de vídeo frontal y descendente.
- Búsqueda activa de objetivos: utiliza un punto de búsqueda siguiente y su radio para guiar la exploración del área reportada.
- Reconocimiento de persona a partir de imagen de referencia: la variante no_reference elimina esta entrada, lo que permite aislar su contribución.
- Señal de parada: predice hover_stop y land, aunque el autor reconoce que esta señal es débil en todas las variantes.
- Action chunking de 8 pasos: predice secuencias de acciones para reducir latencia de control.
- Soporte de embodiment genérico: usa la etiqueta new_embodiment y carga la configuración de modalidad desde el propio checkpoint, sin código adicional.
- No se dispone de información sobre tool calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito, ya que el pipeline es de robótica y no de NLP.

## Casos de uso

- Búsqueda y rescate en simulación: el modelo permite entrenar y evaluar políticas de dron que exploran una zona reportada y localizan a una persona herida, usando el simulador RescueBench como entorno de referencia para investigación en robótica aérea.
- Estudio de ablaciones de sensores: las variantes no_down, no_reference y no_target permiten medir experimentalmente qué modalidad aporta más a la precisión de la política, útil para diseñar plataformas de drones con sensores limitados.
- Análisis de escalado de datos: las variantes frac50 y frac25 permiten estudiar la curva de rendimiento frente al volumen de demostraciones (el autor reporta una mejora de ~0,03 m de error por cada duplicación de datos).
- Prototipado de control visomotor para UAV: el action chunking de 8 pasos y la salida en marco del cuerpo facilitan la integración con controladores de vuelo en pipelines de simulación a realidad.
- Evaluación offline de políticas VLA: el checkpoint y el split de test (184 episodios, 9.452 filas) sirven como base reproducible para comparar métodos de imitación en tareas de búsqueda.
- Investigación en generalización de embodiment: la etiqueta new_embodiment y la configuración de modalidad embebida permiten reutilizar la política en configuraciones de dron con distinta disposición de cámaras.
- Docencia y reproducción de experimentos: al incluir seis variantes con entrenamiento idéntico, el repositorio facilita replicar estudios controlados sobre datos y sensores en robótica.

## Benchmarks y rendimiento

Evaluación offline (open-loop) sobre el split de test (184 episodios, 9.452 filas), paso 5000. El baseline (acción media de entrenamiento) tiene un error de traslación de 0,58 m. Estas métricas no miden éxito de búsqueda en el simulador, que no ha sido evaluado.

| Variante | Error traslación (m) | Error yaw (grados) | Recall stop (%) | Precision stop (%) |
|---|---|---|---|---|
| full | 0,254 | 2,28 | 29,3 | 35,8 |
| frac50 | 0,285 | 2,56 | 27,2 | 43,1 |
| frac25 | 0,312 | 2,82 | 23,9 | 35,5 |
| no_down | 0,380 | 2,85 | 17,4 | 23,9 |
| no_reference | 0,257 | 2,27 | 33,2 | 31,1 |
| no_target | 0,325 | 2,66 | 37,0 | 38,6 |

Observaciones del autor: eliminar la cámara descendente es lo que más perjudica; eliminar el siguiente punto de búsqueda también empeora; eliminar la imagen de referencia apenas cambia estas métricas (su efecto en distinguir el objetivo de otras personas debe comprobarse en el simulador); el error baja ~0,03 m por cada duplicación de datos; la señal de stop es débil en todas las variantes porque el ground truth solo marca stop en la última fila de cada episodio; cada run se entrenó una sola vez y el muestreo de difusión no se sembró, por lo que diferencias por debajo de ~0,01 m no son significativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base es de 3B parámetros y el entrenamiento usó una H100 de 80 GB con bf16, por lo que la inferencia en bf16 requeriría del orden de 6-8 GB de pesos más overhead del VLM y del DiT (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: H100 (usada para entrenamiento); para inferencia se recomienda una GPU con al menos 16 GB de VRAM, como A100, L40S o RTX 4090.
- Compatibilidad con GPU de consumo: probable en RTX 4090 y posiblemente en GPUs de 12-16 GB, aunque no hay datos confirmados.
- Opciones de despliegue: carga mediante la librería gr00t (Gr00tPolicy) con device="cuda"; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este pipeline de robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RescueBench (este) | 3B | no disponible | Búsqueda y rescate con dron (VLA) | NVIDIA Open Model License | Hugging Face (madokalif/RescueBench) |
| nvidia/GR00T-N1.7-3B (base) | 3B | no disponible | Política visomotora general para robots | NVIDIA Open Model License | Hugging Face |
| nvidia/Cosmos-Reason2-2B | 2B | no disponible | Razonamiento visomotor (componente del base) | NVIDIA Open Model License | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparación se limita a parámetros, tarea y licencia.

## Limitaciones y advertencias

- Evaluación solo offline: las métricas publicadas son open-loop y no miden el éxito real de búsqueda en el simulador, que aún no se ha evaluado.
- Señal de parada débil: el recall y la precisión de stop son bajos en todas las variantes (recall 17,4-37,0%, precision 23,9-43,1%), lo que limita la fiabilidad del hover y del aterrizaje.
- Dependencia de sensores: la eliminación de la cámara descendente degrada notablemente la precisión (error de traslación 0,380 m frente a 0,254 m en full).
- Datos limitados: el split completo tiene solo 858 episodios y cada variante se entrenó una única vez, sin sembrado del muestreo de difusión, por lo que diferencias pequeñas no son significativas.
- Sin datos sobre sesgos, alucinación o idiomas: no hay información disponible sobre estos aspectos en un modelo de robótica.
- Restricciones de licencia: uso sujeto a la NVIDIA Open Model License, heredada de nvidia/GR00T-N1.7-3B y nvidia/Cosmos-Reason2-2B; deben revisarse las condiciones para uso comercial.
- Repositorio de 50,5 GB: requiere almacenamiento considerable y descarga selectiva por carpeta (por ejemplo, allow_patterns=["full/*"]).
- Sin soporte documentado para tool calling, agentes multi-paso ni NLP: no es un modelo de lenguaje conversacional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/madokalif/RescueBench
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset: https://huggingface.co/datasets/madokalif/rescuebench-drone-search-v1
- Simulador RescueBench: https://github.com/UnrealZoo/RescueBench
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
