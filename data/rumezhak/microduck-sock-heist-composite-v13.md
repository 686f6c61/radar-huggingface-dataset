# rumezhak/microduck-sock-heist-composite-v13

## Resumen

`microduck-sock-heist-composite-v13` es una entrada de competición para la prueba de 6 metros "Sock Heist" de la Microduck Arena, un entorno de simulación de robótica organizado por Pollen Robotics. El modelo no es una red neuronal entrenada de forma convencional: es un artefacto híbrido que combina una red de respaldo (la de `lphatnguyen/microduck-sock-heist-6m-v3`) con tablas de búsqueda (`L_obs` y `L_act`) que memorizan 1317 filas de trayectorias optimizadas para los cinco seeds oficiales del benchmark. Lo desarrolla el usuario `rumezhak` a partir de su composite v11 y de `HlibPlakhtii/microduck-sock-heist-nov18-v5`.

El problema que resuelve es puramente competitivo: minimizar el tiempo de recorrido de 6 metros en el simulador de la Arena. Con 4.760 s de media sobre los cinco seeds, supera por décimas de segundo a las entradas de referencia (`nov18-v5` con 4.770 s, `composite-v11` con 4.771 s, `gin-sock-c18` con 4.771 s). Es relevante únicamente como caso de estudio de optimización in-sample y de ingeniería de artefactos ONNX, no como modelo de robótica generalizable.

La arquitectura subyacente es un grafo ONNX con mecanismo de lookup de observaciones y una red de respaldo; el repo pesa 0.0 GB y se distribuye en formato ONNX. No hay información sobre parámetros, contexto, idiomas ni licencia completa, y el propio autor advierte que el modelo es solo para simulación y no debe cargarse en un MicroDuck físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX con lookup de observaciones (`L_obs`) y lookup de acciones (`L_act`) sobre red de respaldo (base `lphatnguyen/microduck-sock-heist-6m-v3`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (artefacto ONNX, sin cuantizacion documentada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Mixta: Apache-2.0 solo para el layout del grafo y el mecanismo de lookup de `a1rb4Ck/microduck-heist@94cd2cfe`; el repositorio en su conjunto no esta etiquetado Apache-2.0 y los componentes de terceros no declaran licencia |
| Formato de pesos | ONNX |
| Tamano del repo | 0.0 GB |
| Pipeline | robotics |
| Libreria | microduck |
| Modelos base | `rumezhak/microduck-sock-heist-composite-v11`, `HlibPlakhtii/microduck-sock-heist-nov18-v5` |
| Relacion con base | merge |

## Arquitectura y entrenamiento

El modelo es un grafo ONNX que implementa un mecanismo de lookup: las observaciones se mapean a filas de una tabla (`L_obs`) y las acciones se recuperan de otra tabla (`L_act`). Cuando la observación no coincide con ninguna fila registrada, entra en juego una red de respaldo (la de `lphatnguyen/sock-heist-6m-v3`). El grafo, la red de respaldo y el mecanismo de lookup son idénticos a los de `composite-v11`; lo único nuevo son las 1317 filas de lookup grabadas a partir de las cinco secuencias optimizadas.

No hay entrenamiento por gradiente en el sentido habitual. El autor escanea las entradas públicas mejor rankeadas en x86-64, toma la mejor secuencia por seed y busca las últimas filas de cada seed con un CMA-ES separable; donde un seed queda justo por encima de un límite de tick, aplica una búsqueda sobre ramas de historial de contacto que parten de un "kick" de un ulp y se repulen. Cada candidato se reproduce en el runner de la Arena. No se documentan tokens de entrenamiento, composición de dataset ni RLHF/DPO, porque no aplican.

## Capacidades

- Ejecución de una política de control para la tarea "Sock Heist" de 6 m en el simulador Microduck Arena.
- Recuperación determinista de acciones mediante lookup de observaciones para los cinco seeds oficiales.
- Fallback a red neuronal cuando la observación no está en la tabla de lookup.
- Optimización de tiempo de recorrido por seed (resultados entre 4.615 s y 5.070 s).
- No soporta tool calling, function calling, agentes, multi-step reasoning ni capacidades multilingües.
- No tiene visión, audio, thinking mode ni generación de texto.

## Casos de uso

- Benchmark de referencia para la tarea Sock Heist: sirve como entrada de competición en la Microduck Arena y permite comparar tiempos por seed contra `nov18-v5`, `composite-v11` y `gin-sock-c18`.
- Estudio de optimización in-sample: útil para analizar cómo la búsqueda CMA-ES sobre los últimos rows de cada seed reduce tiempos en décimas de segundo, y para documentar el riesgo de sobreajuste a los seeds oficiales.
- Reproducción de experimentos de búsqueda: el autor publica la metodología (escaneo de entradas top, CMA-ES separable, ramas de historial de contacto), lo que permite replicar el pipeline en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1.
- Ingeniería de artefactos ONNX: ejemplo de cómo empaquetar tablas de lookup y una red de fallback en un único grafo con metadatos de modificación (`modification_notice`) conforme a la sección 4(b) de Apache-2.0.
- Auditoría de licencias en modelos compuestos: caso práctico de merge de artefactos con licencias heterogéneas (Apache-2.0 parcial, componentes sin licencia declarada).
- Docencia sobre límites de la simulación: el propio autor lo usa para ilustrar que acciones fuera de rango para servos reales no deben transferirse a hardware físico.

## Benchmarks y rendimiento

Resultados del scorer oficial de la Arena sobre los cinco seeds (media en segundos, menor es mejor):

| Seed | composite v11 | Hlib nov18-v5 | este modelo (v13) |
|---|---|---|---|
| 1 | 4.635 | 4.635 | **4.615** |
| 2 | 5.095 | 5.090 | **5.070** |
| 3 | 4.655 | 4.655 | **4.650** |
| 4 | 4.680 | 4.680 | **4.675** |
| 5 | 4.790 | 4.790 | **4.790** |
| Media | 4.771 | 4.770 | **4.760** |

Comparación adicional citada por el autor: `GinDuck/microduck-gin-sock-c18` con 4.771 s de media. El scorer es el mismo en cada comando (las claves de lookup no incluyen el comando) y la Arena puntúa a 0.20 m/s.

## Requisitos de hardware

- VRAM estimada: no disponible; el repo pesa 0.0 GB y es un artefacto ONNX de tamaño reducido, por lo que la inferencia no requiere GPU dedicada.
- GPU recomendadas: no aplica; la Arena ejecuta el modelo en CPU x86-64.
- Cabe en cualquier CPU consumer x86-64; no se documenta soporte para GPU.
- Opciones de despliegue: onnxruntime 1.24.4 con MuJoCo 3.10.0 y numpy 2.4.1 (versiones fijadas por la Arena). No se documenta vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles como métricas de inferencia; el rendimiento relevante es el tiempo de recorrido (4.760 s de media).
- Advertencia de portabilidad: las reproducciones son deterministas en x86-64 con las versiones fijadas; otra CPU puede romper una reproducción por redondeo, y un Mac da números ligeramente distintos y su lookup puede fallar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media (5 seeds) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rumezhak/microduck-sock-heist-composite-v13` (este) | no disponible | no aplica | 4.760 s | Mixta (Apache-2.0 parcial) | Hugging Face, 0 descargas |
| `HlibPlakhtii/microduck-sock-heist-nov18-v5` | no disponible | no aplica | 4.770 s | No declarada | Hugging Face |
| `rumezhak/microduck-sock-heist-composite-v11` | no disponible | no aplica | 4.771 s | No declarada | Hugging Face |
| `GinDuck/microduck-gin-sock-c18` | no disponible | no aplica | 4.771 s | No declarada | Hugging Face |

## Limitaciones y advertencias

- In-sample: fuera de los cinco seeds oficiales, el archivo se comporta como la red de `lphatnguyen` v3; solo las cinco trayectorias grabadas son rápidas.
- No generaliza: no es un modelo de robótica reusable para otras tareas ni para otros seeds.
- Solo simulación: las acciones registradas están muy fuera de lo que se pediría a servos reales; no debe cargarse en un MicroDuck físico.
- Determinismo frágil: depende de x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1; otra CPU o un Mac pueden romper la reproducción.
- Ventaja marginal: unas milésimas de segundo pueden igualarse o superarse por cualquiera que tome estas filas y pula las colas.
- Licencia incompleta: `HlibPlakhtii/microduck-sock-heist-nov18-v5`, `jrubiosainz/microduck-sock-counter-s1s5`, `lphatnguyen/microduck-sock-heist-6m-v5` y las entradas anteriores del autor no declaran licencia; sus partes no se relicencian aquí. Apache-2.0 aplica solo al layout del grafo y al mecanismo de lookup de `a1rb4Ck/microduck-heist@94cd2cfe` y a las modificaciones de los contribuyentes según su licencia.
- Riesgo de objeción de autoría: el autor no pidió permiso a HlibPlakhtii, jrubiosainz, GinDuck, lphatnguyen ni a1rb4Ck; si alguno objeta, la entrada se retirará.
- Sin datos de sesgos, alucinación o idioma: no aplican a este artefacto, pero tampoco están documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v13
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Modelo base `rumezhak/microduck-sock-heist-composite-v11`: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v11
- Modelo base `HlibPlakhtii/microduck-sock-heist-nov18-v5`: https://huggingface.co/HlibPlakhtii/microduck-sock-heist-nov18-v5
- `lphatnguyen/microduck-sock-heist-6m-v5`: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v5
- `lphatnguyen/microduck-sock-heist-6m-v3` (red de respaldo): https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- `GinDuck/microduck-gin-sock-c18`: https://huggingface.co/GinDuck/microduck-gin-sock-c18
- `jrubiosainz/microduck-sock-counter-s1s5`: https://huggingface.co/jrubiosainz/microduck-sock-counter-s1s5
- `a1rb4Ck/microduck-heist` (layout del grafo, commit 94cd2cfe): https://huggingface.co/a1rb4Ck/microduck-heist
- Pollen Robotics: https://huggingface.co/pollen-robotics
- Archivos `LICENSE-apache-2.0.txt` y `NOTICE`: incluidos en el repositorio del modelo
