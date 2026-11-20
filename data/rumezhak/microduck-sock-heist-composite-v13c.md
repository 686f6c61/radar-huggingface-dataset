# rumezhak/microduck-sock-heist-composite-v13c

## Resumen

`rumezhak/microduck-sock-heist-composite-v13c` es una política de control para robótica simulada, publicada en Hugging Face como entrada para el reto "6 m Sock Heist" de la Microduck Arena de Pollen Robotics. No es un modelo de lenguaje: se trata de un grafo ONNX (librería `microduck`) que combina una red neuronal de respaldo con tablas de búsqueda (`L_obs` y `L_act`) que mapean observaciones a acciones precalculadas. El autor lo describe explícitamente como una variante de su `composite v13` que sustituye la trayectoria de la semilla 4 por la de su versión v12.

El modelo resuelve una tarea concreta: recorrer 6 metros en el simulador de la Arena recogiendo un calcetín, evaluado sobre cinco semillas oficiales con el scorer propio de la competición. Su media declarada es de 4,761 s (5/5 semillas completadas), frente a los 4,760 s de v13, es decir, una variante marginalmente más lenta publicada como punto de datos verificado y no como récord.

La relevancia es limitada y muy específica: sirve como referencia reproducible para quienes trabajan con la Microduck Arena y quieren comparar linajes de políticas de control. No tiene aplicaciones fuera de ese simulador y el propio autor advierte que no debe cargarse en un robot físico. La información disponible sobre arquitectura, entrenamiento y licencia es escasa y parcial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX con red de respaldo (fallback) y tablas de búsqueda observación-acción (`L_obs`, `L_act`, 1317 filas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Mixta: Apache-2.0 solo para las partes que la declaran (layout del grafo y mecanismo de lookup de `a1rb4Ck/microduck-heist@94cd2cfe`); el repositorio en conjunto no se etiqueta como Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La política se implementa como un grafo ONNX en el que la decisión de acción se resuelve principalmente mediante tablas de búsqueda (`L_obs` y `L_act`) que asocian observaciones con acciones grabadas. El grafo incluye además una red de respaldo (el modelo v3 de `lphatnguyen`) que se activa cuando la observación no coincide con ninguna clave de las tablas. Respecto a `composite v13`, esta variante solo modifica las dos tablas de lookup (1317 filas, todas reconstruidas) y el metadato `modification_notice`; el grafo, la red de respaldo y el resto de tensores son idénticos.

No hay información disponible sobre el proceso de entrenamiento en el sentido habitual (número de tokens, dataset, RLHF/DPO). El autor indica que todas las trayectorias incluidas ya eran públicas en entradas anteriores y que no se realizó ninguna búsqueda nueva para esta versión. El método de búsqueda y los scripts fueron publicados por `HlibPlakhtii`. La evaluación se realiza con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 fijados por la Arena.

## Capacidades

- Control de política para la tarea "6 m Sock Heist" en la Microduck Arena (simulación).
- Reproducción determinista de cinco trayectorias oficiales en x86-64 con las versiones de MuJoCo, onnxruntime y numpy fijadas por la Arena.
- Fallback a una red neuronal cuando la observación no está en las tablas de lookup.
- Puntuación independiente del comando de velocidad: las claves de lookup no incluyen el comando, y la Arena la evalúa a 0,20 m/s.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de visión, audio ni modo de razonamiento.

## Casos de uso

- Reproducción de resultados en la Microduck Arena: cargar el modelo en el Space oficial para verificar los tiempos declarados por semilla (4,615 / 5,070 / 4,650 / 4,680 / 4,790 s) con el scorer de la competición.
- Comparación de linajes de políticas: usar esta variante como punto de referencia frente a `composite v13` y las entradas previas para estudiar cómo cambios en las tablas de lookup afectan al tiempo por semilla.
- Estudio del mecanismo de lookup observación-acción: analizar el grafo ONNX y las 1317 filas de las tablas para entender qué observaciones activan el fallback y cuáles se resuelven por coincidencia exacta.
- Docencia o divulgación sobre control por imitación en robótica simulada: ejemplo compacto de política híbrida (tablas + red de respaldo) con métricas reproducibles.
- Base para experimentos de sustitución de trayectorias: el autor muestra que reemplazar la trayectoria de una sola semilla cambia la media en 1 ms, lo que sirve para cuantificar la sensibilidad del scorer.
- Verificación de determinismo entre plataformas: útil para comprobar cómo el redondeo de otra CPU o de macOS puede romper la coincidencia en el lookup.

## Benchmarks y rendimiento

Resultados declarados por el autor con el scorer de la Arena sobre las cinco semillas oficiales (tiempo en segundos):

| Semilla | composite v13 | composite v13c |
|---|---|---|
| 1 | 4,615 | 4,615 |
| 2 | 5,070 | 5,070 |
| 3 | 4,650 | 4,650 |
| 4 | 4,675 | 4,680 |
| 5 | 4,790 | 4,790 |
| Media | 4,760 | 4,761 |

Cinco de cinco semillas completadas. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la información disponible; el repositorio ocupa 0,0 GB y el modelo es un grafo ONNX de tablas de lookup más una red de respaldo pequeña.
- Inferencia en CPU: el autor reporta ejecución en x86-64 con onnxruntime 1.24.4, numpy 2.4.1 y MuJoCo 3.10.0.
- GPU recomendadas: no disponible; la evaluación oficial se realiza en el Space de la Arena, cuyo hardware no se detalla.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: onnxruntime (versión fijada 1.24.4) dentro del entorno de la Microduck Arena; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el único dato temporal es el tiempo de recorrido de la tarea (media 4,761 s).

## Comparativa con modelos similares

| Modelo | Tipo | Media (5 semillas) | Licencia | Disponibilidad |
|---|---|---|---|---|
| `rumezhak/microduck-sock-heist-composite-v13c` | ONNX + lookup | 4,761 s | Mixta (no etiquetada Apache-2.0 en conjunto) | Hugging Face |
| `rumezhak/microduck-sock-heist-composite-v13` | ONNX + lookup | 4,760 s | no disponible | Hugging Face |
| `lphatnguyen/microduck-sock-heist-6m-v5` | Política Microduck | no disponible | sin licencia declarada | Hugging Face |
| `HlibPlakhtii/microduck-sock-heist-nov18-v5` | Política Microduck | no disponible | sin licencia declarada | Hugging Face |

No se dispone de datos de rendimiento de las alternativas en la información proporcionada, salvo la comparación directa con `composite v13` incluida por el autor.

## Limitaciones y advertencias

- Sobreajuste in-sample: fuera de las cinco semillas oficiales, el modelo se comporta como la red v3 de `lphatnguyen`; solo las cinco trayectorias grabadas son rápidas.
- Determinismo frágil: las repeticiones solo son deterministas en x86-64 con las versiones fijadas de MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1. Otra CPU o un Mac pueden producir redondeos distintos y hacer que el lookup falle.
- No apto para robot físico: las acciones grabadas están muy fuera de lo que se pediría a servomotores reales; el autor prohíbe explícitamente cargarlo en un MicroDuck físico.
- Solo simulación: evaluado únicamente con el simulador de la Arena.
- Licencia ambigua: Apache-2.0 se aplica solo a las partes que la declaran; varias fuentes (`HlibPlakhtii`, `jrubiosainz`, `lphatnguyen`, `GinDuck`) no declaran licencia y sus partes no se relicencian. El repositorio en conjunto no está etiquetado como Apache-2.0.
- Riesgo de retirada: el autor no consultó a los autores de las políticas de origen y se compromete a retirar la entrada si alguno objeta.
- Sin datos de sesgo, alucinación o idioma aplicables, al no ser un modelo de lenguaje.
- El autor declara que un asistente de IA ayudó en algunos experimentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v13c
- Modelo base (composite v13): https://huggingface.co/rumezhak/microduck-sock-heist-composite-v13
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- `HlibPlakhtii/microduck-sock-heist-nov18-v5`: https://huggingface.co/HlibPlakhtii/microduck-sock-heist-nov18-v5
- `lphatnguyen/microduck-sock-heist-6m-v5`: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v5
- `lphatnguyen/microduck-sock-heist-6m-v3`: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- `jrubiosainz/microduck-sock-counter-s1s5`: https://huggingface.co/jrubiosainz/microduck-sock-counter-s1s5
- `a1rb4Ck/microduck-heist` (commit 94cd2cfe): https://huggingface.co/a1rb4Ck/microduck-heist
- Pollen Robotics: https://huggingface.co/pollen-robotics
