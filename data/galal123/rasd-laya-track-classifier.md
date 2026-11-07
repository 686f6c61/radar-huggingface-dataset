# Galal123/rasd-laya-track-classifier

## Resumen

RASD Laya track classifier es un modelo de clasificación de texto obtenido por ajuste fino del modelo base Laya (convaiinnovations/laya), un encoder ModernBERT-large de 421 millones de parámetros desarrollado por ConvAI Innovations. El modelo clasifica descripciones en inglés de pistas de radar o sensores en cuatro categorías: `drone`, `bird`, `aircraft` y `unknown` (clutter), devolviendo además una probabilidad calibrada por clase. Sustituye al clasificador basado en reglas escrito a mano en RASD (Qatar Airspace Guardian), una simulación de hackathon de monitorización de espacio aéreo en tres emplazamientos de Catar.

El ajuste fino se realizó con la propia librería `laya` sobre el conjunto sintético Galal123/rasd-tracks-synthetic (10.814 filas de entrenamiento equilibradas por clase, 2 épocas, 6,4 minutos en una A100-SXM4-80GB), empleando una pérdida `soft-ce` seguida de calibración de temperatura sobre una porción reservada de las filas de entrenamiento. La selección de la ejecución publicada (`run-D`) se hizo por macro-F1 sobre un subconjunto de validación equilibrado por clase, sin tocar el split de test.

Su relevancia es acotada pero clara: demuestra que un encoder de 421M ajustado con pocos datos sintéticos supera ampliamente tanto al modelo base en zero-shot como a un clasificador de reglas en una tarea de fusión de sensores simulada, y lo hace con una calibración excelente (ECE de 0,005). No obstante, todos los resultados proceden del mismo simulador que generó los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT-large con cabeza de decisión (modelo base Laya, no autorregresivo) |
| Parametros totales | 421.293.830 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (entrada en formato fijo del dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Laya: un encoder ModernBERT-large de 421M parámetros que evalúa un estado textual compartido contra preguntas tipadas (elección, puntuación y booleano) en un único paso forward, sin generación autorregresiva. Sobre esta base, el ajuste fino añade la tarea concreta de clasificación de pistas mediante la función `finetune` de la librería `laya`, con pérdida `soft-ce` y una etapa posterior de calibración de temperatura sobre una porción reservada de las filas de entrenamiento.

Los datos de entrenamiento son 10.814 filas sintéticas equilibradas por clase del dataset Galal123/rasd-tracks-synthetic, generadas por el simulador del proyecto RASD a partir de `engine/track_text.py`. Se entrenaron cuatro ejecuciones en paralelo con 2 épocas cada una; se publicó `run-D` (pérdida `soft-ce`, exactitud de validación 0,960, macro-F1 de validación 0,960) por ser la mejor en macro-F1 sobre un subconjunto de validación equilibrado de 2.000 filas. Cada ejecución se conserva en su propia rama del repositorio. El test se realizó sobre el split reservado del dataset (23.358 filas de ejecuciones nunca vistas en entrenamiento), en su mezcla natural de clases.

## Capacidades

- Clasificación de pistas de radar o sensores descritas en inglés en cuatro clases: `drone`, `bird`, `aircraft` y `unknown` (clutter).
- Salida de probabilidades calibradas por clase (ECE de 0,005 con 15 bins en el test reservado).
- Procesamiento de texto en el formato fijo del dataset (emplazamiento, condiciones, edad de la pista, etc.).
- Inferencia por lotes con latencia de 3,28 ms por pista en una NVIDIA A100-SXM4-80GB.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.
- No genera texto libre ni acciones de control de vuelo: solo clasifica.

## Casos de uso

- Monitorización de espacio aéreo simulada: integrado en el pipeline de RASD, sustituye al clasificador de reglas para etiquetar pistas con una probabilidad calibrada que el operador humano puede interpretar directamente.
- Triaje de alertas en un centro de control: al devolver probabilidades calibradas, permite priorizar pistas con alta probabilidad de `drone` no registrado frente a las de `bird` o `aircraft`, reduciendo el ruido de falsos positivos.
- Evaluación comparativa de clasificadores: sirve como referencia de ajuste fino de un encoder pequeño frente a heurísticas manuales en tareas de fusión de sensores sintéticos.
- Generación de datos etiquetados de apoyo: puede preetiquetar grandes volúmenes de descripciones de pistas del simulador para revisión humana posterior, dado su recall de 0,967 en la clase `unknown`.
- Investigación en calibración de modelos: el modelo y sus métricas (ECE, diagrama de fiabilidad, matriz de confusión) son un ejemplo reproducible de calibración por temperatura sobre un encoder ajustado.
- Docencia y prototipado de sistemas de decisión tipo System 1: demuestra el uso de Laya como clasificador de elección tipada en un único paso forward, con latencia de milisegundos por muestra.

## Benchmarks y rendimiento

Resultados medidos sobre el split de test reservado (23.358 filas, mezcla natural de clases):

| Clasificador | Exactitud | Macro F1 | ECE (15 bins) | Drones llamados bird | Birds llamados drone |
|---|---|---|---|---|---|
| RASD Laya (ajustado) | 0,956 | 0,903 | 0,005 | 264 | 367 |
| Laya base (zero-shot) | 0,031 | 0,036 | 0,485 | 0 | 83 |
| Basado en reglas (actual) | 0,386 | 0,477 | 0,033 | 65 | 31 |

Rendimiento por clase del modelo ajustado:

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| drone | 0,946 | 0,935 | 0,940 | 7031 |
| bird | 0,980 | 0,962 | 0,971 | 13694 |
| aircraft | 0,986 | 0,981 | 0,984 | 2145 |
| unknown | 0,571 | 0,967 | 0,718 | 488 |

Casos difíciles (exactitud; RASD Laya ajustado | Laya base zero-shot | basado en reglas):

| Etiqueta | Filas | RASD Laya | Laya base | Reglas |
|---|---|---|---|---|
| `unregistered_drone` | 3817 | 0,963 | 0,011 | 0,343 |
| `registered_drone` | 2739 | 0,957 | 0,051 | 0,581 |
| `camera_disagrees` | 835 | 0,902 | 0,090 | 0,290 |
| `clutter` | 488 | 0,967 | 0,814 | 0,887 |
| `loose_match` | 867 | 0,570 | 0,026 | 0,038 |
| `bad_weather` | 9231 | 0,923 | 0,039 | 0,263 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 421M parámetros en fp32 el peso ocupa unos 1,7 GB, por lo que en la práctica cabe en cualquier GPU consumer con 4 GB o más (estimación a partir del recuento de parámetros, no publicada por el autor).
- GPU recomendadas: el autor reporta entrenamiento e inferencia en NVIDIA A100-SXM4-80GB; no se han publicado mediciones en otras GPU.
- Cabe en GPU consumer: sí, por tamaño de parámetros, aunque no hay cifras de latencia publicadas para ellas.
- Opciones de despliegue: la librería `laya` (clase `laya.Agent`) es la vía documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 3,28 ms por pista en inferencia por lotes sobre A100-SXM4-80GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RASD Laya track classifier | 421M | no disponible | Clasificación de pistas en 4 clases | Apache 2.0 | Hugging Face |
| convaiinnovations/laya (base) | 421M | no disponible | Decisión tipada zero-shot | Apache 2.0 | Hugging Face |
| Clasificador basado en reglas de RASD | no aplica | no aplica | Clasificación de pistas en 4 clases | no disponible | Interno del proyecto RASD |

No se dispone de comparación con otros modelos de clasificación de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente con datos sintéticos del simulador del equipo; los resultados no dicen nada sobre sensores, emplazamientos ni espacio aéreo reales.
- El split de test procede del mismo simulador y generador que el entrenamiento (semillas y escenarios distintos), por lo que mide solo generalización dentro de la simulación.
- Solo cuatro clases: cualquier otro objeto (cometas, globos, planeadores, etc.) se fuerza a una de ellas.
- Entrada únicamente en inglés y en el formato fijo del dataset; fuera de ese formato el comportamiento no está caracterizado.
- Rendimiento bajo en la etiqueta `loose_match` (exactitud 0,570) y precisión baja en `unknown` (0,571), con tendencia a etiquetar como `unknown` objetos reales.
- Es una ayuda a la clasificación para operadores humanos; no debe usarse para tomar ninguna acción contra una aeronave.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías del autor sobre el rendimiento fuera del entorno simulado.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificación errónea con alta confianza en distribuciones distintas a las de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Galal123/rasd-laya-track-classifier
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Dataset de entrenamiento: https://huggingface.co/datasets/Galal123/rasd-tracks-synthetic
- Página de Laya en Runware: https://runware.ai/models/laya
