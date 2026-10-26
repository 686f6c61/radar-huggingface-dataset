# jrubiosainz/microduck-game-hillclimber-remix7

## Resumen

`jrubiosainz/microduck-game-hillclimber-remix7` es un checkpoint de política de control para el evento **Hill Climb de 1,5 m** de la Microduck Arena (Pollen Robotics). No es un modelo de lenguaje: es un grafo ONNX (`policy.onnx`) que genera comandos articulares para un robot tipo pato en un entorno simulado con MuJoCo. Se publica como *finetune* de `jrubiosainz/microduck-game-hillclimber-remix6` (commit `2433eab1`), que a su vez es un remix de `dashi/microduck-hill-remix-r760`.

El modelo mantiene el grafo del checkpoint base bit a bit y solo sustituye la rama correspondiente a la seed oficial 4 de dashi: donde el base activaba la rama 4 en el paso de contador 42 con objetivos articulares en lazo abierto, este checkpoint la activa en el paso de contador 0 y añade una tabla `T` de 128 × 14 offsets de objetivo articular, optimizada con CMA-ES. El resultado declarado es de **0,748 s** de media en las cinco seeds oficiales de la Arena, en muestra (*in-sample*), frente a los 0,752 s que marca el checkpoint base en la seed 4.

Es relevante porque muestra un patrón de trabajo típico en *leaderboards* de robótica simulada: optimización evolutiva sobre un subconjunto mínimo de seeds, con cirugía quirúrgica del grafo (dos inicializadores modificados, cuatro operadores y dos inicializadores añadidos) y verificación de que el resto de seeds se comportan exactamente igual que el base. Todo el entrenamiento y la evaluación son **solo en simulación**.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo de política neuronal en ONNX con selector de ramas por seed; contador de pasos codificado en los bits bajos de la acción `head_pitch`; comparación de huellas (*fingerprints*) de observación con tolerancia 0,001 y activación de rama con tabla de offsets |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); el grafo opera paso a paso sobre observaciones del entorno |
| Tipos de cuantizacion | no disponible; se publica un único artefacto `policy.onnx` |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) |
| Libreria / pipeline | `microduck`; `pipeline_tag: robotics` |
| Modelo base | `jrubiosainz/microduck-game-hillclimber-remix6` (commit `2433eab1`, sha256 de `policy.onnx` `a2189fa78097…`, run `01M5H9HD8SQE1DXSEERFCW`) |
| Relacion con el base | finetune / edición de grafo (no reentrenamiento completo) |
| Tabla añadida | `T` de 128 × 14 offsets de objetivo articular (13 articulaciones distintas de `head_pitch`, más la columna de `head_pitch` que el grafo enmascara) |
| Entorno de evaluación | microduck-arena runner v4, MuJoCo 3.10.0, evento `hill-climb-1m5`, x86-64 |
| Tamano del repo | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La política es un grafo ONNX que envuelve la red base en un **selector de ramas por seed** heredado de dashi. El grafo lleva un contador de pasos en los bits bajos de la acción `head_pitch` (el paso de carrera 0 corresponde al paso de contador 25). En pasos de contador concretos compara la observación con huellas almacenadas de carreras de seeds oficiales; si hay coincidencia (diferencia absoluta máxima por debajo de la tolerancia de 0,001) eleva un identificador de rama, también transportado en bits de `head_pitch`, y esa carrera pasa a usar sus propias filas de objetivos articulares.

Este checkpoint introduce una modificación localizada: la entrada de la seed 4 pasa a dispararse en el paso de contador 0 (en lugar del 42), con la huella de la observación de la seed 4 en ese punto (la seed oficial más cercana queda a 0,0095, frente a la tolerancia de 0,001). Mientras el identificador de rama vale 4, la acción resultante es la salida pre-selección del grafo base más `T[k]`, aplicada como `Where(b == 4, a1 + T[k], accion_de_remix6)`. La tabla se inicializó con la conversión exacta de la propia carrera de `remix6` en esa seed grabada en x86-64 (todas las entradas menos 4 de 819 reproducen el comando bit a bit; el resto es el float32 más cercano) y después se optimizó con **CMA-ES** (`ol_hybrid2.py`) sobre una tabla lineal a trozos, con coste igual a la distancia que falta para cruzar la línea al final del paso de carrera 36, a 0,3 m/s, penalizando las caídas con 1 m adicional.

La búsqueda se ejecutó en tres máquinas virtuales Azure D32as_v4 Spot (CPU x86-64), con seis ejecuciones por máquina y cinco *workers* de carrera cada una, reiniciando periódicamente desde la mejor tabla encontrada en cualquiera de las tres. La cadena documentada de ejecuciones partió de la conversión exacta (0,7579 s) y pasó por tablas de 0,7496 s, 0,7476 s, 0,7437 s y 0,7396 s en la generación 2316 de la última ejecución; algunas ventanas de optimización (pasos de contador 22 y 18) comienzan dentro del asentamiento no cronometrado (pasos 0-24). Solo se modifican dos inicializadores (`br_K0`, paso de contador de entrada; `br_SIG`, huella) y se añaden cuatro operadores y dos inicializadores; el resto del grafo es idéntico al base y el fichero reconstruido con `tko.py bake` es byte a byte idéntico al publicado.

## Capacidades

- Control motor simulado: genera comandos para 14 articulaciones (incluida `head_pitch`, usada además como canal de metadatos) en el evento Hill Climb de 1,5 m de la Microduck Arena.
- Ejecución de una política de carrera completa a 0,3 m/s sobre el grafo base, con tabla de offsets activa en la rama de la seed 4.
- Discriminación de seeds por huella de observación: identifica la seed oficial en curso comparando la observación con patrones almacenados (tolerancia 0,001) y selecciona la rama correspondiente.
- Preservación estricta del comportamiento base: cualquier carrera cuyo identificador de rama nunca llegue a 4 se ejecuta exactamente igual que `remix6` (seeds oficiales 1, 2, 3 y 5, y 55 seeds extra de la 6 a la 60).
- Metadatos en la acción: contador de pasos e identificador de rama viajan en los bits bajos de `head_pitch` (2⁻²⁰ rad por unidad), lo que permite lógica dependiente del tiempo sin cambiar la interfaz del entorno.
- Compatibilidad con el runner de la Arena (`microduck-arena runner v4`, MuJoCo 3.10.0).
- No soporta *tool calling*, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo de propósito general.

## Casos de uso

- **Competición en la Microduck Arena (seed 4)**: cargar `policy.onnx` en el runner v4 y disputar el evento `hill-climb-1m5`; el modelo está específicamente ajustado para rebajar el tiempo del base en esa seed concreta.
- **Investigación en optimización evolutiva de controladores**: la ficha documenta la cadena completa de ejecuciones CMA-ES (ventanas, nudos, tamaño de paso inicial, población 64), lo que sirve como caso reproducible de optimización de políticas de pocos parámetros sobre entornos físicos simulados.
- **Docencia sobre *sim-to-real* y sobreajuste a seeds**: ilustra de forma extrema el riesgo de optimizar contra un conjunto fijo de semillas (5 oficiales) y la necesidad de validar en seeds no vistas (6 a 60).
- **Cirugía de grafos ONNX en producción**: ejemplo de modificación mínima de un modelo desplegado (dos inicializadores, cuatro operadores, seis inicializadores en total) con verificación de identidad byte a byte mediante reconstrucción determinista (`tko.py bake`).
- **Pruebas de regresión de runners de simulación**: útil como caso de prueba de que un cambio en el entorno (versión de MuJoCo, arquitectura de CPU) altera el comportamiento, dado que el autor subraya que la grabación se hizo en x86-64.
- **Referencia base para *hill climbing* de políticas**: la estructura de tabla lineal a trozos con nudos cada 1 o 2 pasos de contador y offsets articulares es reutilizable como plantilla para otros eventos de la Arena.
- **Análisis de canales encubiertos de información**: el uso de bits de una acción física (`head_pitch`) para transportar contador y rama es un caso práctico de esteganografía funcional en una interfaz de control.

## Benchmarks y rendimiento

El modelo no reporta benchmarks de NLP. La métrica es el tiempo de carrera en la Microduck Arena (menor es mejor):

| Metrica | Resultado | Contexto |
|---|---|---|
| Tiempo medio, 5 seeds oficiales | 0,748 s | Declarado por el autor, *in-sample* |
| Seed 4, conversion exacta inicial (antes de CMA-ES) | 0,7582384 s | Medido en x86-64; base `remix6` en la misma seed: 0,7582379 s |
| Seed 4, checkpoint base `remix6` | 0,752 s | Dato citado en la model card del base |
| Seed 4, mejor tabla intermedia de la cadena CMA-ES | 0,7396 s | Generación 2316 de la ejecución `v3r1c` (tabla intermedia, no necesariamente la publicada) |
| Seeds 1, 2, 3, 5 y 55 seeds extra (6-60) | Idéntico al base | Sin cambios: la rama 4 nunca se activa |
| Mejora sobre el base en seed 4 | ~0,004 s (0,752 → 0,748 s) | Diferencia dentro del margen de una sola seed; el dato oficial es 0,76 s para ambos |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni métricas de lenguaje en la información disponible, por no ser aplicables a este modelo.

## Requisitos de hardware

- **VRAM**: no disponible; el artefacto es un grafo ONNX de tamaño despreciable (repo de 0,0 GB) y la inferencia se ejecuta en CPU en el runner de la Arena.
- **CPU**: la evaluación oficial se hace en x86-64; el autor advierte que la grabación de referencia se hizo en esa arquitectura, por lo que el comportamiento puede diferir en ARM u otras plataformas.
- **GPU**: no se requiere ni se documenta. No hay datos de despliegue en A100, H100 o RTX 4090.
- **Entorno de simulación**: MuJoCo 3.10.0 con `microduck-arena runner v4` (evento `hill-climb-1m5`); el coste computacional dominante es la física de la simulación, no la red.
- **Hardware usado en la búsqueda**: 3 × Azure D32as_v4 Spot (CPU x86-64), 6 ejecuciones de búsqueda por máquina con 5 *workers* de carrera cada una.
- **Opciones de despliegue**: ONNX Runtime (u otro runtime ONNX) dentro del runner de la Arena; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles. La métrica publicada es tiempo de carrera simulado, no latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Resultado en seed 4 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `jrubiosainz/microduck-game-hillclimber-remix7` | Este modelo | no disponible | no aplica | 0,748 s de media en 5 seeds (0,7582384 s en la conversion inicial de la seed 4) | no disponible | HuggingFace, 0 descargas |
| `jrubiosainz/microduck-game-hillclimber-remix6` | Modelo base directo | no disponible | no aplica | 0,752 s (0,7582379 s medido en x86-64); declarado 0,76 s oficial | no disponible | HuggingFace |
| `dashi/microduck-hill-remix-r760` | Ancestro (grafo original y selector por seed) | no disponible | no aplica | no disponible | no disponible | HuggingFace |
| `jrubiosainz/microduck-game-hillclimber-remix4` | Ancestro intermedio (política de hillclimber) | no disponible | no aplica | no disponible | no disponible | HuggingFace |

Las diferencias de tiempo entre `remix7` y `remix6` en la seed 4 son de milisegundos y el propio autor redondea ambos a 0,76 s en el marcador oficial; la comparación relevante es de estructura de grafo, no de rendimiento agregado.

## Limitaciones y advertencias

- **Solo simulación**: el autor lo indica explícitamente. No hay validación en hardware físico ni indicios de transferencia *sim-to-real*.
- **Ajuste *in-sample***: la tabla se optimizó contra la seed oficial 4, que es también la seed sobre la que se reporta la mejora; el 0,748 s declarado es en muestra y no hay evaluación en seeds retenidas.
- **Sobreajuste a la seed y al runner**: la política depende de huellas de observación con tolerancia 0,001 y de un contador codificado en bits de acción; cambios en MuJoCo, en el runner o en la plataforma (x86-64 frente a ARM) pueden romper la coincidencia y desactivar la rama.
- **Canales frágiles**: contador y rama viajan en los bits bajos de `head_pitch` (2⁻²⁰ rad por unidad) y el grafo enmascara esa columna antes de codificar el contador; pequeñas diferencias de coma flotante pueden alterar la selección.
- **Alcance mínimo**: no es un modelo de lenguaje, no procesa texto, no razona y no generaliza a otras tareas; cualquier uso fuera del evento `hill-climb-1m5` carece de soporte.
- **Licencia no disponible**: no se puede asumir permiso de uso comercial ni de redistribución; hay que contactar con el autor antes de cualquier uso en producción.
- **Documentación y mantenimiento**: 0 descargas y 0 *likes*; el modelo depende de código de búsqueda (`ol_hybrid2.py`, `tko.py bake`) que no se distribuye en el repositorio de HuggingFace.
- **Mejora marginal**: la ganancia sobre el base en la seed 4 está en el orden del 0,5 %, dentro de la variabilidad de milisegundos de la propia medida (0,7582379 frente a 0,7582384 s en la conversión inicial).
- **Sesgos**: no se documentan sesgos sociales, pero sí un sesgo de evaluación claro hacia las cinco seeds oficiales de la Arena.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix7
- Modelo base (`remix6`, commit `2433eab1`): https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix6/tree/2433eab158e369c476b131a8c416e5845e0b077d
- Modelo base de `remix6` (`dashi/microduck-hill-remix-r760`): https://huggingface.co/dashi/microduck-hill-remix-r760
- Ancestro intermedio (`hillclimber-remix4`): https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix4
- Microduck Arena (Space de Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada (los resultados de búsqueda web no contienen enlaces relevantes a este modelo).
