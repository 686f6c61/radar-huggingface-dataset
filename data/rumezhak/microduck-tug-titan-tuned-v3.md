# rumezhak/microduck-tug-titan-tuned-v3

## Resumen

`rumezhak/microduck-tug-titan-tuned-v3` es una política de control para el simulador de robótica Microduck Arena, concretamente para la competición "Tug of War" (tira y afloja) organizada por Pollen Robotics. No es un modelo de lenguaje: es una red neuronal pequeña empaquetada en formato ONNX que decide las acciones de un robot MicroDuck simulado durante un combate de tracción. El autor, `rumezhak`, parte de la red head-to-head de `azukiq` (`microduck-titan-v1`) y le añade 75 pequeños offsets obtenidos mediante búsqueda CMA-ES, junto con filas de rating reutilizadas de otros participantes.

El modelo es relevante únicamente en el contexto de la Microduck Arena: un espacio de competición semanal donde desarrolladores enfrentan políticas de control entre sí. Esta tercera iteración (`v3`) es un resultado intermedio para la copa que cerraba el 13 de noviembre y su aportación real es marginal respecto a la `v2` del mismo autor: la diferencia de 0,4 puntos porcentuales está dentro del ruido estadístico de la muestra (40 combates por oponente, ±8 puntos). El cambio real y medible es frente a la red base sin ajustar, con unos 6 puntos de mejora en la media de once oponentes.

La arquitectura subyacente no se detalla en la model card; se sabe que es una red neuronal con normalizador de observaciones, capas `mlp.*` y un grafo ONNX con operadores de búsqueda tabular (`L_mask`, `L_tol`). El repositorio ocupa 0,0 GB, lo que confirma que se trata de un modelo de tamaño muy reducido, ejecutable en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward con normalizador de observaciones y capas MLP, exportada como grafo ONNX (operadores y lookup tables propios del runner de la Arena) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; recibe observaciones del simulador por paso) |
| Tipos de cuantizacion | no disponible (pesos en ONNX, presumiblemente FP32) |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | Mixta: Apache-2.0 solo para las partes que la declaran (`jrubiosainz`); las redes de `azukiq`, `greecree` y `lphatnguyen` no declaran licencia y no se relicencian. El repositorio en su conjunto no está etiquetado como Apache-2.0 |
| Formato de pesos | ONNX (librería `microduck`) |

## Arquitectura y entrenamiento

La red head-to-head es la de `azukiq/microduck-titan-v1` (revisión `13b975bb`), sin modificar salvo por dos ajustes introducidos por `rumezhak`: 75 offsets sumados a la media del normalizador de observaciones (máximo 0,306 desviaciones típicas por entrada) y a los sesgos de la última capa (máximo 0,141). Estos offsets se obtuvieron mediante búsqueda CMA-ES, continuación de las búsquedas que produjeron `tug-titan-tuned-v1` y `-v2`. El resto de pesos, operadores del grafo, filas de lookup, `L_mask`, `L_tol` y demás tensores permanecen inalterados respecto a `tug-league-v4`.

El layout del grafo ONNX procede de `greecree/microduck-tug-of-war-tug-super-v8`. Las filas de rating (los cinco seeds oficiales de la competición) se reutilizan de otros participantes: seed 1 de `lphatnguyen/microduck-tug-of-war-v0`, seeds 2 y 5 de `jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429`, y seeds 3 y 4 del propio fichero de `greecree`. No hay información sobre el dataset de entrenamiento original de `titan-v1` ni sobre el número de tokens o episodios empleados.

## Capacidades

- Control de un robot MicroDuck simulado en la prueba de tira y afloja ("Tug of War") de la Microduck Arena.
- Toma de decisiones por paso a partir de las observaciones del simulador, procesadas por el normalizador y las capas MLP.
- Reproducción determinista de los cinco seeds oficiales de rating mediante las filas de lookup heredadas.
- Ejecución en CPU (x86-64) con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Participación en la copa semanal de la Microduck Arena: el modelo se sube como entrada a la competición "Tug of War" y compite contra las políticas de otros participantes en el simulador oficial.
- Evaluación comparativa de políticas de control: sirve como referencia de "titan-v1 con ajuste fino" para medir cuánto aporta el tuning de offsets frente a la red base en combates simulados.
- Reproducción de experimentos de CMA-ES: el modelo documenta el resultado de tres iteraciones de búsqueda de offsets (`v1`, `v2`, `v3`), útil para quien quiera replicar la metodología sobre otras redes base.
- Benchmark local de políticas: con el runner de la Arena copiado en local (por ejemplo en macOS), se puede enfrentar este modelo contra otros para obtener tasas de victoria por oponente.
- Estudio de robustez frente a oponentes heterogéneos: sus resultados por oponente (desde 51,2 % hasta el 100 %) permiten analizar qué tipos de política le resultan difíciles.
- Docencia o divulgación sobre optimización de políticas en robótica simulada: el modelo ilustra cómo pequeños ajustes en el normalizador y la capa final pueden mejorar el rendimiento sin reentrenar toda la red.

## Benchmarks y rendimiento

Resultados medidos por el autor en una copia local del runner de la Arena (macOS), 40 combates por oponente, mismos combates para cada columna con lados intercambiados:

| Oponente | `titan-v1` sin ajustar | `tuned-v2` | `tuned-v3` (este) |
|---|---|---|---|
| `quicksilver-cup-v5` (Hlib) | 27,5 % | 55,0 % | 51,2 % |
| `titan-v1` (azukiq) | 45,0 % | 68,8 % | 63,7 % |
| `tug-of-war-tug-super-v11` (greecree) | 60,0 % | 51,2 % | 63,7 % |
| `h7p1b` (jrubiosainz) | 38,8 % | 61,3 % | 62,5 % |
| Otros siete (AndoShy, RSanchez996, SSH111111, Unique007, juicenv, lphatnguyen, witcheer) | 97,5–100 % | 96–100 % | 96–100 % |
| Media sobre los once | 78,6 % | 84,4 % | 84,8 % |

El propio autor advierte que 40 combates por oponente es una muestra pequeña (±8 puntos por cifra): la diferencia de 0,4 puntos frente a `tuned-v2` es ruido, mientras que los ~6 puntos sobre `titan-v1` sin ajustar son el resultado real. La fila de rating (166,7017 cm) es idéntica a la de `tug-league-v1` a `-v4`, por lo que esta entrada no aporta nada nuevo al ranking.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión, pero el repositorio ocupa 0,0 GB, por lo que la inferencia cabe holgadamente en memoria de CPU.
- GPU recomendadas: no se requiere GPU; el autor ejecuta los combates en CPU x86-64 y en macOS.
- Cabe en cualquier GPU consumer (y en CPU): el cuello de botella es el simulador MuJoCo, no la red.
- Opciones de despliegue: onnxruntime (versión fijada por la Arena: 1.24.4), MuJoCo 3.10.0 y numpy 2.4.1; el runner oficial de la Microduck Arena.
- Latencia y throughput: no disponibles; dependen del simulador y del hardware, no de la red.

## Comparativa con modelos similares

| Modelo | Base | Ajuste | Media vs. 11 oponentes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rumezhak/microduck-tug-titan-tuned-v3` (este) | `titan-v1` | 75 offsets CMA-ES | 84,8 % | Mixta / sin declarar | Hugging Face |
| `rumezhak/microduck-tug-titan-tuned-v2` | `titan-v1` | 75 offsets CMA-ES | 84,4 % | Mixta / sin declarar | Hugging Face |
| `azukiq/microduck-titan-v1` | — | sin ajuste | 78,6 % | Sin declarar | Hugging Face |
| `greecree/microduck-tug-of-war-tug-super-v11` | — | — | no disponible como media; 63,7 % de victorias de este modelo contra él | Sin declarar | Hugging Face |

## Limitaciones y advertencias

- **No apto para un robot físico**: el modelo solo se ha evaluado en el simulador de la Arena; el autor advierte explícitamente de que no debe cargarse en un MicroDuck real.
- **Licencia ambigua**: las redes base de `azukiq`, `greecree` y `lphatnguyen` no declaran licencia, y este repositorio no las relicencia. Apache-2.0 solo cubre las partes que ya la llevaban (`jrubiosainz`). El uso comercial no está claro.
- **Sin permiso explícito de los autores originales**: el autor reconoce no haber consultado a `azukiq`, `greecree`, `lphatnguyen` ni `jrubiosainz`; si alguno objeta, la entrada se retirará.
- **Muestra estadística pequeña**: 40 combates por oponente implican ±8 puntos de error; las diferencias inferiores a ese margen no son concluyentes.
- **Determinismo frágil**: las repeticiones son deterministas en x86-64 con las versiones fijadas de MuJoCo, onnxruntime y numpy; otro hardware o versiones podrían romper la reproducibilidad.
- **Rating heredado, no propio**: la puntuación de 166,7017 cm proviene de secuencias grabadas por otros autores, no de una mejora de este modelo.
- **Alcance muy limitado**: no es un modelo de propósito general; fuera de la prueba de tira y afloja de la Microduck Arena no tiene utilidad.
- **Asistencia de IA en los experimentos**: el autor declara que un asistente de IA ayudó en los experimentos, sin detallar en qué medida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-tug-titan-tuned-v3
- Versión anterior del mismo autor: https://huggingface.co/rumezhak/microduck-tug-titan-tuned-v1
- Red base: https://huggingface.co/azukiq/microduck-titan-v1
- Layout del grafo: https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v8
- Contribución de filas de rating (seed 1): https://huggingface.co/lphatnguyen/microduck-tug-of-war-v0
- Contribución de filas de rating (seeds 2 y 5): https://huggingface.co/jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429
- Microduck Arena (Space de Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Artículo sobre el robot Microduck: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
