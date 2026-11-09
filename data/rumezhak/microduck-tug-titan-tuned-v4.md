# rumezhak/microduck-tug-titan-tuned-v4

## Resumen

`rumezhak/microduck-tug-titan-tuned-v4` es una política de control para el entorno de simulación Microduck Arena, concretamente una entrada para la competición "Tug of War" (tira y afloja) organizada por Pollen Robotics. No es un modelo de lenguaje: se trata de una red neuronal pequeña empaquetada en formato ONNX que decide las acciones de un robot simulado MicroDuck durante un enfrentamiento de tracción. El autor, rumezhak, la deriva de la red `titan-v1` de azukiq, a la que añade 75 pequeños desplazamientos (offsets) calculados mediante búsquedas CMA-ES.

La relevancia del modelo es acotada y muy específica: se trata de un resultado intermedio para la copa semanal de la arena (cierre el 13 de noviembre), pensado para mejorar ligeramente el rendimiento de la red base en combates simulados. El autor declara explícitamente que la mayor parte del trabajo no es suyo y que la entrada se retirará si los autores originales lo solicitan.

No hay información sobre arquitectura interna más allá de la estructura de grafo ONNX heredada de `greecree/microduck-tug-of-war-tug-super-v8`, ni sobre parámetros totales, contexto o idiomas, ya que no es un modelo generativo. El repositorio tiene un tamaño de 0.0 GB, lo que sugiere pesos muy ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para control robótico (grafo ONNX, layout heredado de `greecree/microduck-tug-of-war-tug-super-v8`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | Sin licencia declarada en el repositorio; componentes individuales con Apache-2.0 solo en las partes que la portan (`LICENSE-apache-2.0.txt` y `NOTICE`) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La red es un grafo ONNX que implementa una política de control para el entorno de simulación de Microduck Arena. El layout del grafo procede de `greecree/microduck-tug-of-war-tug-super-v8`, y la red de confrontación directa (head-to-head) es `azukiq/microduck-titan-v1` (revisión `13b975bb`). El autor añade 75 offsets calculados como media de cuatro instantáneas de sus búsquedas CMA-ES (las de `tug-titan-tuned-v2`, `-v3` y dos posteriores), aplicados a la media del normalizador de observaciones (como máximo 0.307 desviaciones estándar por entrada) y al sesgo de la última capa (como máximo 0.130). Todos los demás pesos son de azukiq.

Las filas de rating (puntuación) no son obra del autor: para cada una de las cinco semillas oficiales se reutiliza el mejor combate válido registrado entre las entradas públicas, reproducido a través del layout de `greecree`. El rating fusionado es de 166.7017 cm, idéntico al de las entradas `tug-league-v1` a `-v4` del mismo autor. No hay información sobre datos de entrenamiento en el sentido habitual (tokens, composición del dataset, RLHF/DPO), ya que no es un modelo de lenguaje.

## Capacidades

- Control de un robot simulado MicroDuck en la tarea de tira y afloja (tug of war) dentro de Microduck Arena.
- Toma de decisiones de confrontación directa (head-to-head) contra otras políticas del entorno.
- Reproducción determinista de secuencias grabadas para las cinco semillas oficiales de rating.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM.
- No tiene capacidades multilingües, de visión, audio ni generación de texto.
- No está diseñado para uso en robot físico: solo válido en el simulador.

## Casos de uso

- Participación en la copa semanal de Tug of War de Microduck Arena: la política se carga como entrada en la competición y compite contra las redes del resto de participantes en combates simulados.
- Evaluación comparativa de políticas de control: sirve como referencia para medir la mejora de los offsets CMA-ES frente a la red base `titan-v1` (78.6 % de victorias de media frente a 86.6 % de esta entrada).
- Investigación en optimización de políticas mediante CMA-ES: el método de promediar instantáneas de búsquedas puede estudiarse como técnica de regularización de pesos en redes de control.
- Reproducción de experimentos en simulador: el autor documenta que las repeticiones son deterministas en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1, lo que permite replicar resultados.
- Benchmarking de entradas de la arena: la tabla de enfrentamientos contra once oponentes permite comparar el rendimiento relativo de distintas políticas.
- Estudio de licencias y atribución en modelos derivados: el repositorio documenta con detalle qué partes son de cada autor y cómo se aplican las cláusulas de Apache-2.0, lo que lo convierte en un caso práctico de trazabilidad de licencias.

## Benchmarks y rendimiento

El autor publica resultados de enfrentamientos en simulador (60 combates por oponente, mismos combates para cada columna, lados intercambiados):

| Oponente | titan-v1 simple | `tuned-v3` | esta entrada |
|---|---|---|---|
| `quicksilver-cup-v5` (Hlib) | 27.5 %* | 47.5 % | 72.5 % |
| `titan-v1` (azukiq) | 45.0 %* | 65.0 % | 65.8 % |
| `tug-of-war-tug-super-v11` (greecree) | 60.0 %* | 61.7 % | 62.5 % |
| `h7p1b` (jrubiosainz) | 38.8 %* | 65.8 % | 64.2 % |
| Otros siete (AndoShy, RSanchez996, SSH111111, Unique007, juicenv, lphatnguyen, witcheer) | 97.5–100 %* | 97.5–100 % | 93–100 % |
| Media sobre los once | 78.6 %* | 84.7 % | 86.6 % |

\* `titan-v1` simple se midió con 40 combates por oponente (los primeros 40 de los mismos combates). El autor advierte que 60 combates por oponente es una muestra pequeña (aproximadamente ±6 puntos por cifra): la mejora sobre `titan-v1` simple es el resultado real, mientras que los 2 puntos sobre `tuned-v3` son probablemente reales pero pequeños. Las filas de rating no se re-verificaron en x86 para esta versión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB, lo que indica pesos muy ligeros.
- GPU recomendadas: no disponible; el autor ejecuta las pruebas en CPU (Mac y x86-64) con onnxruntime.
- Compatibilidad con GPU de consumo: no disponible, pero por el tamaño del repositorio es plausible que quepa en cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: onnxruntime (versión 1.24.4 citada por el autor), MuJoCo 3.10.0 para el simulador, numpy 2.4.1.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Formato | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rumezhak/microduck-tug-titan-tuned-v4` | `azukiq/microduck-titan-v1` + offsets CMA-ES | ONNX | Tug of War, simulación | Sin licencia declarada; Apache-2.0 solo en partes | Hugging Face |
| `azukiq/microduck-titan-v1` | Original | ONNX | Tug of War, simulación | Sin licencia declarada | Hugging Face |
| `greecree/microduck-tug-of-war-tug-super-v8` (y v11) | Original | ONNX | Tug of War, simulación | Sin licencia declarada | Hugging Face |
| `rumezhak/microduck-tug-titan-tuned-v3` | `titan-v1` + offsets | ONNX | Tug of War, simulación | Sin licencia declarada | Hugging Face |

No se dispone de datos de benchmarks comparativos más allá de los enfrentamientos publicados por el propio autor en la model card.

## Limitaciones y advertencias

- Solo válido en simulación: el autor indica explícitamente "Not for a real robot"; no debe cargarse en un MicroDuck físico.
- Sesgos conocidos: no disponible; no se documentan sesgos más allá de los derivados de la muestra pequeña de combates.
- Riesgo de alucinación: no aplica (no es un modelo generativo), pero sí existe riesgo de sobreajuste a los combates concretos medidos.
- Limitaciones de contexto o idioma: no aplica.
- Restricciones de licencia: el repositorio no declara licencia global; Apache-2.0 se aplica solo a las partes que la portan. Los componentes de `azukiq`, `greecree` y `lphatnguyen` no declaran licencia y no se relicencian aquí. El autor no solicitó permiso a los autores originales y retirará la entrada si alguno objeta.
- Caveats para producción: las mediciones son de 8 combates por pareja (cifras aproximadas); las repeticiones son deterministas solo en x86-64 con las versiones exactas de MuJoCo, onnxruntime y numpy citadas; otra CPU podría romper la reproducibilidad.
- El rating de 166.7017 cm no aporta nada nuevo al marcador, ya que es idéntico al de las entradas `tug-league-v1` a `-v4` del mismo autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rumezhak/microduck-tug-titan-tuned-v4
- Modelo base (red head-to-head): https://huggingface.co/azukiq/microduck-titan-v1
- Layout del grafo y combates de semillas 3 y 4: https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v8
- Combates de semillas 2 y 5: https://huggingface.co/jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429
- Combate de semilla 1: https://huggingface.co/lphatnguyen/microduck-tug-of-war-v0
- Microduck Arena (Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Entrada previa del mismo autor: https://huggingface.co/rumezhak/microduck-tug-titan-tuned-v1
- Otra entrada del mismo autor: https://huggingface.co/rumezhak/microduck-tug-titan-derived
