# rumezhak/microduck-sock-heist-composite-v13e

## Resumen

`microduck-sock-heist-composite-v13e` es un artefacto de política para robótica publicado por el usuario rumezhak en Hugging Face, etiquetado con el pipeline `robotics` y la librería `microduck`. No es un modelo de lenguaje: es un grafo ONNX con tablas de búsqueda (`L_obs` y `L_act`) que reproduce trayectorias precalculadas para la tarea "Sock Heist" de 6 metros de la Microduck Arena, un entorno de simulación mantenido por Pollen Robotics. El modelo base declarado es `rumezhak/microduck-sock-heist-composite-v13`, del que esta versión es un finetune.

La relevancia del artefacto es muy acotada: se trata de una variante de una entrada anterior (composite v13, 4.760 s de media en los cinco seeds oficiales) que sustituye la trayectoria del seed 2 por la de una versión previa (v12), resultando en 4.764 s de media. El propio autor indica explícitamente que el archivo "no es un récord" y que todas las trayectorias ya eran públicas en entradas anteriores. El repositorio pesa 0.0 GB y no declara licencia unificada.

El modelo funciona exclusivamente en el simulador de la Arena (MuJoCo 3.10.0, onnxruntime 1.24.4, numpy 2.4.1 sobre x86-64) y el autor advierte que no debe cargarse en un MicroDuck físico. Fuera de los cinco seeds oficiales, el grafo recurre a una red de respaldo (la v3 de lphatnguyen), por lo que su comportamiento generaliza mal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Grafo ONNX con tablas de búsqueda de observación (`L_obs`) y acción (`L_act`); red de respaldo neuronal para casos fuera de tabla |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible como licencia unificada; Apache-2.0 solo para las partes que la portan (layout del grafo y mecanismo de lookup de `a1rb4Ck/microduck-heist@94cd2cfe`) |
| Formato de pesos | ONNX |
| Tarea | Sock Heist 6 m (simulación) |
| Seeds oficiales | 5 |
| Tiempo medio (5 seeds) | 4.764 s |
| Tamaño del repositorio | 0.0 GB |
| Librería | microduck |

## Arquitectura y entrenamiento

El artefacto no es un transformer ni un modelo generativo. Es un grafo ONNX que, dada una observación, consulta una tabla (`L_obs`, 1318 filas en esta versión) para recuperar una acción precalculada (`L_act`). Cuando la observación no coincide con ninguna entrada de la tabla, el grafo delega en una red de respaldo: la `lphatnguyen/microduck-sock-heist-6m-v3`. Esta estructura de lookup fue introducida por a1rb4Ck en `microduck-heist@94cd2cfe` y es la base del linaje "composite".

Respecto a composite v13, esta variante solo modifica las tablas `L_obs` y `L_act` (las 1318 filas se reconstruyen) y el campo de metadatos `modification_notice`, que conserva el texto de v13 y añade el propio. El grafo, la red de respaldo y el resto de tensores son idénticos. La diferencia funcional es que el seed 2 toma la trayectoria de la versión v12 (1018 ticks) en lugar de la de v13, lo que lo hace 4 ticks (20 ms) más lento en ese seed. No hubo búsqueda de nuevas trayectorias: todas proceden de entradas públicas previas del mismo autor y de las contribuciones de HlibPlakhtii, lphatnguyen y jrubiosainz.

## Capacidades

- Ejecución determinista de cinco trayectorias concretas (una por seed oficial) para la tarea Sock Heist de 6 m en la Microduck Arena.
- Consulta por tabla de observación con red de respaldo para observaciones no vistas.
- Inferencia en CPU x86-64 mediante onnxruntime 1.24.4.
- Reproducción de tiempos verificados con el scorer oficial de la Arena.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso, ni capacidades multilingües, ni visión, ni audio: no es un modelo de lenguaje.

## Casos de uso

- Reproducción de resultados en la Microduck Arena: cargar el ONNX en el Space oficial para verificar los tiempos publicados (4.615, 5.090, 4.650, 4.675 y 4.790 s por seed) bajo el entorno fijado por la Arena.
- Punto de comparación en el linaje composite: sirve como referencia adicional verificada frente a v13 (4.760 s) y v12, útil para quien estudie la sensibilidad de la media a la elección de trayectoria por seed.
- Docencia sobre políticas de lookup en robótica simulada: ejemplo compacto de cómo una tabla de observación-acción más una red de respaldo puede resolver una tarea de manipulación en un entorno controlado.
- Auditoría de licencias en artefactos derivados: el repositorio incluye `NOTICE` y `LICENSE-apache-2.0.txt` y documenta qué partes portan Apache-2.0 y cuáles no, lo que lo convierte en un caso de estudio de trazabilidad licencial en modelos compuestos.
- Pruebas de portabilidad numérica: permite comprobar cómo cambian los tiempos al ejecutar el mismo grafo en distintas CPU (el autor advierte que una Mac puede dar números ligeramente distintos y que el lookup puede fallar).
- Referencia negativa para evaluación de generalización: dado que fuera de los cinco seeds el grafo cae en la red de respaldo, resulta útil para ilustrar el sobreajuste a trayectorias grabadas en políticas de imitación.

## Benchmarks y rendimiento

Resultados publicados por el autor con el scorer oficial de la Arena (tiempo en segundos, menor es mejor):

| Seed | composite v13 | este archivo (v13e) |
|---|---|---|
| 1 | 4.615 | 4.615 |
| 2 | 5.070 | 5.090 |
| 3 | 4.650 | 4.650 |
| 4 | 4.675 | 4.675 |
| 5 | 4.790 | 4.790 |
| Media | 4.760 | 4.764 |

El autor indica que la puntuación es idéntica a cualquier comando, ya que las claves de lookup no incluyen el comando, y que la Arena lo evalúa a 0.20 m/s. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni tendrían sentido para este artefacto.

## Requisitos de hardware

- VRAM: no aplica; la inferencia se ejecuta en CPU.
- CPU: x86-64, con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 fijados por la Arena para garantizar reproducibilidad.
- GPU: no se requiere ni se documenta soporte; el autor solo valida en x86-64.
- Compatibilidad consumer: sí, cualquier máquina x86-64 capaz de ejecutar la Microduck Arena.
- Despliegue: el entorno oficial es el Space `pollen-robotics/microduck-arena`; no se documentan opciones como vLLM, llama.cpp, Ollama o TGI (no aplican a este formato).
- Latencia y throughput: no disponibles; el autor solo reporta tiempos de tarea (4.764 s de media), no latencia por inferencia.
- Advertencia de portabilidad: en Mac los números difieren ligeramente y el lookup puede fallar; solo la física x86 del Space decide la validez del resultado.

## Comparativa con modelos similares

| Modelo | Tipo | Tiempo medio (5 seeds) | Seeds finalizados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rumezhak/microduck-sock-heist-composite-v13e` (este) | ONNX lookup + red de respaldo | 4.764 s | 5/5 | no disponible (Apache-2.0 parcial) | Hugging Face |
| `rumezhak/microduck-sock-heist-composite-v13` | ONNX lookup + red de respaldo | 4.760 s | 5/5 | no disponible | Hugging Face |
| `lphatnguyen/microduck-sock-heist-6m-v5` | Política neuronal (origen de seeds 1-4) | no disponible | no disponible | no declarada | Hugging Face |
| `HlibPlakhtii/microduck-sock-heist-nov18-v5` | Política neuronal (origen del seed 5) | no disponible | no disponible | no declarada | Hugging Face |

No se dispone de datos de rendimiento de las alternativas fuera de lo citado en la model card; las comparaciones de tiempo solo están publicadas para el linaje composite del propio autor.

## Limitaciones y advertencias

- Sobreajuste in-sample: fuera de los cinco seeds oficiales, el archivo ejecuta la red de respaldo de lphatnguyen v3; solo las cinco trayectorias grabadas son rápidas.
- No generaliza a comandos ni condiciones distintas: las claves de lookup no incluyen el comando y la puntuación es la misma a cualquier velocidad solicitada.
- Reproducibilidad frágil: los replays solo son deterministas en x86-64 con las versiones exactas de MuJoCo, onnxruntime y numpy fijadas por la Arena; otra CPU puede romper una trayectoria.
- No apto para robot físico: las acciones registradas están muy fuera de lo que se pediría a servos reales; el autor prohíbe explícitamente cargarlo en un MicroDuck.
- Licencia ambigua: el repositorio no está etiquetado como Apache-2.0 en su conjunto; varias fuentes (`HlibPlakhtii`, `jrubiosainz`, `lphatnguyen`, entradas propias anteriores) no declaran licencia y sus partes no se relicencian aquí.
- Riesgo de retirada: el autor no consultó a los autores de las fuentes y se compromete a retirar el repositorio si alguno objeta.
- Sin datos de sesgo, alucinación o multilingüismo: no aplican a un artefacto de control, pero tampoco se documentan evaluaciones de robustez más allá de los cinco seeds.
- Asistencia de IA declarada en algunos experimentos, sin detalle de alcance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v13e
- Modelo base (composite v13): https://huggingface.co/rumezhak/microduck-sock-heist-composite-v13
- Microduck Arena (Space de Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Origen del layout del grafo (a1rb4Ck): https://huggingface.co/a1rb4Ck/microduck-heist
- Trayectorias de seeds 1-4 y red de respaldo (lphatnguyen): https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v5
- Red de respaldo v3 (lphatnguyen): https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- Trayectoria del seed 5 (HlibPlakhtii): https://huggingface.co/HlibPlakhtii/microduck-sock-heist-nov18-v5
- Contribuciones de trayectorias (jrubiosainz): https://huggingface.co/jrubiosainz/microduck-sock-counter-s1s5
- Organización Pollen Robotics: https://huggingface.co/pollen-robotics
