# rumezhak/microduck-sock-heist-composite-v1

## Resumen

`microduck-sock-heist-composite-v1` es una entrada de competición para la prueba "Sock Heist" de 6 metros de la Microduck Arena, un entorno de simulación de robótica organizado por Pollen Robotics. No es un modelo de lenguaje ni una red neuronal entrenada de forma convencional: es un artefacto ONNX compuesto por una red de respaldo (el modelo v3 de lphatnguyen) más una tabla de búsqueda (*lookup table*) de 1360 filas que contiene trayectorias de acciones grabadas para las cinco semillas oficiales del *benchmark*. Lo desarrolla el usuario de HuggingFace `rumezhak` y se publica bajo la librería `microduck`.

El modelo resuelve un problema muy acotado: minimizar el tiempo de recorrido en el simulador de la Arena para cinco semillas concretas. Su resultado declarado es de 4,937 s de media en las cinco semillas (5/5 completadas), frente a los 4,944 s de la variante F2U de `jrubiosainz` sobre la que se construye y los 5,000 s de la entrada anterior del mismo autor. La mejora de 7 ms procede exclusivamente de las semillas 1 y 5, que se rebuscaron con un CMA-ES separable; las semillas 2, 3 y 4 son las secuencias de acciones de F2U sin modificar.

Es relevante ahora únicamente en el contexto de la Microduck Arena: demuestra una técnica de optimización por búsqueda de acciones (*action search*) sobre un runner reimplementado con reinicio desde *snapshot*, aproximadamente 10 veces más rápido que reproducir ejecuciones completas. Fuera de ese entorno no tiene utilidad práctica, y el propio autor advierte que no debe cargarse en un robot físico. El repositorio ocupa 0,0 GB y no registra descargas ni *likes* en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX con tabla de búsqueda de observaciones y acciones (`L_obs`, `L_act`) más red de respaldo (v3 de lphatnguyen) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones del simulador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Sin licencia global declarada; Apache-2.0 solo para las partes que la portan (grafo y mecanismo de lookup de `a1rb4Ck/microduck-heist`, y modificaciones de `jrubiosainz`). Ver `LICENSE-apache-2.0.txt` y `NOTICE` |
| Formato de pesos | ONNX (grafo, red de respaldo y tensores de lookup) |

## Arquitectura y entrenamiento

El artefacto no sigue un esquema de transformer ni de red neuronal entrenada de extremo a extremo. Su núcleo es una tabla de búsqueda de 1360 filas que mapea observaciones a acciones, integrada en el mismo grafo ONNX que la entrada anterior del autor (`rumezhak/microduck-sock-heist-remix-rz-tail`). El grafo, la red de respaldo y el resto de tensores son idénticos a ese fichero; solo cambian las tablas `L_obs` y `L_act` (todas las filas reconstruidas, 1360 en lugar de 1377) y los metadatos `modification_notice`. La red de respaldo es la v3 de `lphatnguyen`, que actúa fuera de las cinco semillas oficiales.

El "entrenamiento" consiste en búsqueda de acciones, no en descenso de gradiente. Para las semillas 1 y 5 se partió de las secuencias de la entrada anterior (a su vez, las secuencias r1n de `jrubiosainz` con sus últimos 36 pasos rebuscados) y se rebuscaron los últimos 24 a 90 pasos de control con un CMA-ES separable, primero con pasos grandes y luego más pequeños, sobre una reimplementación con reinicio desde *snapshot* del runner de la Arena. El resultado se validó con el scorer oficial de la Arena. Las semillas 2, 3 y 4 son las secuencias de acciones de F2U grabadas en bucle cerrado sobre x86-64. Las cinco secuencias se reprodujeron en bucle abierto sobre x86-64 y se grabaron en la nueva tabla. La puntuación es idéntica en todos los comandos porque las claves de búsqueda no incluyen el comando; la Arena la evalúa a 0,20 m/s.

## Capacidades

- Navegación y ejecución de la tarea "Sock Heist" de 6 metros en el simulador de la Microduck Arena para las cinco semillas oficiales.
- Reproducción determinista de trayectorias grabadas en bucle abierto sobre x86-64 con las versiones fijadas por la Arena (MuJoCo 3.10.0, onnxruntime 1.24.4, numpy 2.4.1).
- Fallback a la red v3 de lphatnguyen fuera de las cinco semillas oficiales (comportamiento no optimizado).
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo *thinking*: no es un modelo de lenguaje.
- No apta para control de un robot físico: las acciones registradas quedan muy fuera de lo que se pediría a servomotores reales.

## Casos de uso

- Evaluación comparativa en la Microduck Arena: sirve como entrada de referencia para medir tiempos en la prueba Sock Heist de 6 m frente a otras variantes (F2U, rz-tail, v3, v4) sobre las cinco semillas oficiales.
- Investigación en búsqueda de acciones: el método CMA-ES separable con reinicio desde *snapshot* y runner reimplementado (~10× más rápido) es reproducible y aplicable a otras tareas de la Arena con espacio de acciones continuo.
- Estudio de *composites* por semilla: ilustra cómo combinar las mejores secuencias por semilla de distintos autores en un único artefacto, con trazabilidad de créditos y avisos de modificación (Apache-2.0 §4(b)).
- Verificación de determinismo entre plataformas: útil para comprobar cómo afectan las diferencias de redondeo de CPU (x86-64 frente a Mac) a la reproducción de trayectorias grabadas.
- Docencia sobre *benchmarking* en robótica simulada: ejemplo de artefacto con limitaciones explícitas (*in-sample*, dependencia de versiones fijadas) y buenas prácticas de atribución.
- Línea base para futuras entradas: cualquier autor que combine las mejores filas por semilla puede igualar o superar los 4,937 s, según advierte el propio creador.

## Benchmarks y rendimiento

Resultados declarados por el autor en las cinco semillas oficiales de la Arena (tiempo en segundos; menor es mejor):

| Semilla | Entrada anterior (rz-tail) | jrubiosainz F2U | Este fichero |
|---|---|---|---|
| 1 | 4,84 | 4,83 | **4,82** |
| 2 | 5,33 | 5,24 | 5,24 (de F2U) |
| 3 | 4,88 | 4,79 | 4,79 (de F2U) |
| 4 | 4,96 | 4,88 | 4,88 (de F2U) |
| 5 | 5,00 | 4,98 | **4,96** |
| Media | 5,000 | 4,944 | **4,937** |

Cinco de cinco semillas completadas. La mejora de 7 ms sobre F2U procede solo de las semillas 1 y 5. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni son aplicables a este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y el grafo ONNX con tablas de 1360 filas es de tamaño reducido, pero no se especifica la huella exacta.
- GPU recomendadas: no disponible; el autor valida sobre CPU x86-64, no sobre GPU.
- Cabe en cualquier CPU x86-64 consumer; no se documenta soporte GPU ni requisitos de VRAM.
- Opciones de despliegue: onnxruntime 1.24.4 con MuJoCo 3.10.0 y numpy 2.4.1 (versiones fijadas por la Arena). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. El tiempo declarado (4,937 s de media) es de ejecución de la tarea en el simulador, no de inferencia del modelo.
- Determinismo dependiente de plataforma: reproducible en x86-64 con las versiones fijadas; en Mac los números difieren ligeramente y la tabla de búsqueda puede fallar.

## Comparativa con modelos similares

| Modelo | Tipo | Media en 5 semillas | Licencia | Notas |
|---|---|---|---|---|
| `rumezhak/microduck-sock-heist-composite-v1` | Composite (lookup + fallback v3) | 4,937 s | Sin licencia global; Apache-2.0 parcial | Este fichero; 1360 filas |
| `jrubiosainz/microduck-sock-heist-6m-rz-tail-r4` (F2U) | Secuencias de acciones | 4,944 s | Fichero `LICENSE` Apache-2.0, sin campo `license:` | Base de las semillas 2-4 |
| `rumezhak/microduck-sock-heist-remix-rz-tail` | Composite (lookup + fallback) | 5,000 s | Sin licencia declarada | Entrada anterior del autor; 1377 filas |
| `lphatnguyen/microduck-sock-heist-6m-v3` | Red de respaldo | no disponible | Sin licencia declarada | Fallback usado por este fichero |
| `lphatnguyen/microduck-sock-heist-6m-v4` | Red | no disponible | Sin licencia declarada | Fuente del composite F2U |

## Limitaciones y advertencias

- **Sobreajuste in-sample**: fuera de las cinco semillas oficiales el fichero se comporta como la red v3 de lphatnguyen; solo las cinco trayectorias grabadas son rápidas.
- **Dependencia de plataforma y versiones**: los replays son deterministas en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1; otro redondeo de CPU puede romper alguno, y en Mac los números difieren y la búsqueda puede fallar. Solo la física x86 del Space decide.
- **Margen mínimo**: 7 ms sobre F2U es un paso pequeño y probablemente sea igualado o superado pronto combinando las mejores filas por semilla.
- **Licencia ambigua**: el repositorio no está etiquetado como Apache-2.0 en su conjunto. Las partes sin licencia (entrada propia anterior, v3 y v4 de lphatnguyen) no se relicencian. Apache-2.0 se aplica solo al grafo y mecanismo de lookup de `a1rb4Ck/microduck-heist@94cd2cfe` y a las modificaciones de `jrubiosainz` según su licencia. No se pidió permiso a `jrubiosainz`, `lphatnguyen` ni `a1rb4Ck`; si algún autor objeta, el repositorio se retirará.
- **Uso comercial**: no hay licencia global que lo autorice; cualquier uso comercial requeriría aclarar la titularidad de las partes sin licencia.
- **No apto para robot físico**: las acciones grabadas están muy fuera de los límites de servomotores reales; no debe cargarse en un MicroDuck físico.
- **Sin sesgos de lenguaje ni alucinación aplicables**: no es un modelo generativo de texto; los riesgos son de sobreajuste y de reproducibilidad, no de contenido.
- **Documentación asistida por IA**: el autor indica que un asistente de IA ayudó en algunos experimentos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v1
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Entrada base F2U: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-rz-tail-r4
- Entrada anterior del autor (rz-tail): https://huggingface.co/rumezhak/microduck-sock-heist-remix-rz-tail
- Red de respaldo v3: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- Fuente del composite F2U (v4): https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v4
- Grafo de lookup original (Apache-2.0): https://huggingface.co/a1rb4Ck/microduck-heist
- Organización Pollen Robotics: https://huggingface.co/pollen-robotics
