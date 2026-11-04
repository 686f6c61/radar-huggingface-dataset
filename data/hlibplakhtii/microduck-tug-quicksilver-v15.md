# HlibPlakhtii/microduck-tug-quicksilver-v15

## Resumen
microduck-tug-quicksilver-v15 es un modelo de política para robótica (pipeline `robotics`) publicado por HlibPlakhtii en HuggingFace, distribuido en formato ONNX y etiquetado como `microduck-policy`. No es un modelo de lenguaje: es un remix de competición de simulación derivado por fine-tuning de `jrubiosainz/microduck-tug-quicksilver-v14-h1-3cc8e430`, que a su vez procede de un linaje de contribuciones comunitarias vinculadas a Pollen Robotics. El modelo está pensado para controlar agentes en un entorno de simulación evaluado con el "Arena evaluator" sobre MuJoCo 3.10.0.

La contribución técnica de esta versión no es un reentrenamiento de la red heredada, sino la incorporación de dos tablas de búsqueda (*lookups*) de observaciones que reproducen secuencias de acciones optimizadas localmente para las semillas oficiales 3 y 4. El resto del grafo heredado y la red *head-to-head* se preservan intactos. La búsqueda se realizó con CMA-ES separable tras una refinación de coordenadas acotada, partiendo de trayectorias normalizadas equivalentes en fuerza.

El resultado declarado es una puntuación local de cinco combates de 166,62117481 cm con cinco victorias por *pit*, usando el evaluador de Arena sin modificar. Es relevante como ejemplo de optimización *in-sample* de políticas robóticas en simulación y de competición colaborativa sobre modelos abiertos, pero no constituye un controlador de locomoción general ni una política para robot real, tal como advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal heredada del modelo base; grafo preservado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (se retiene el texto de licencia y NOTICE heredados del modelo base; no se declara licencia global para el modelo combinado) |
| Formato de pesos | ONNX (`searched-actions.npz`, `seed-4-actions.npz` como artefactos de acciones) |

## Arquitectura y entrenamiento
El modelo hereda íntegramente el grafo y la red *head-to-head* del modelo base `jrubiosainz/microduck-tug-quicksilver-v14-h1-3cc8e430`. Sobre esa base, esta versión añade dos *lookups* de observación que reemplazan las trayectorias para las semillas oficiales 3 y 4. El *lookup* compara los primeros 48 valores de observación con una tolerancia de 1e-7; si la observación no coincide, se delega en el grafo heredado. El resto de *rating starts* mantienen sus trayectorias heredadas.

El proceso de optimización no consistió en entrenamiento supervisado ni RLHF, sino en búsqueda de acciones: se partió de trayectorias normalizadas equivalentes en fuerza, se aplicó refinación de coordenadas acotada y después CMA-ES separable. La semilla 4 completó 300 generaciones; la semilla 3 se detuvo en cuanto se obtuvo un candidato ganador de cinco combates, preservando sus mejores acciones. Se verificó la reproducción exacta de ambos patos y de la cuerda para los dos *lookups* nuevos. El autor advierte que la reproducción exacta es sensible a la aritmética de coma flotante.

## Capacidades
- Control de política en simulación para el entorno de competición microduck, evaluado con MuJoCo 3.10.0 y ONNX Runtime 1.24.4.
- Reproducción de secuencias de acciones optimizadas para las semillas oficiales 3 y 4 mediante *lookups* de observación.
- Reutilización del comportamiento heredado del modelo base para observaciones no coincidentes.
- Ejecución sobre runner 5 del evaluador de Arena sin modificaciones.
- No soporta *tool calling*, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.
- No es un controlador de locomoción general ni una política transferible a robot real.

## Casos de uso
- Reproducción de resultados de competición: permite replicar las cinco rondas locales con puntuación de 166,62117481 cm y cinco victorias por *pit* sobre las semillas 3 y 4, usando el evaluador de Arena sin modificar.
- Investigación en optimización de políticas: sirve como caso de estudio de CMA-ES separable aplicado a secuencias de acciones en un simulador físico con restricciones de reproducción en coma flotante.
- Auditoría de linajes de modelos: los artefactos `searched-actions.npz` y `seed-4-actions.npz`, junto con los ficheros de configuración por semilla, permiten verificar la procedencia y las acciones exactas de cada semilla.
- Experimentación con *lookups* de observación: el mecanismo de comparación de los primeros 48 valores con tolerancia 1e-7 puede estudiarse como técnica de parcheo de políticas sin reentrenamiento.
- Docencia en robótica simulada: ilustra las diferencias entre optimización *in-sample* y generalización, y los riesgos de sobreajuste a semillas declaradas.
- Comparación de remixes comunitarios: permite contrastar el rendimiento declarado frente al modelo base v14 y frente a otras variantes del linaje microduck.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible en el sentido habitual (MMLU, HumanEval, GSM8K). El único dato de rendimiento aportado es la puntuación de la competición local:

| Metrica | Valor |
|---|---|
| Puntuacion local (cinco combates) | 166,62117481 cm |
| Victorias por pit | 5 |
| Evaluador | Arena evaluator sin modificar, runner 5 |
| Simulador | MuJoCo 3.10.0 |
| Runtime | ONNX Runtime 1.24.4 |
| Semillas optimizadas | 3 y 4 |
| Generaciones CMA-ES (semilla 4) | 300 |
| Generaciones CMA-ES (semilla 3) | detenida al obtener candidato ganador |

El autor indica que no verificó de forma independiente el rendimiento semanal en copa de la red heredada y que el resultado público de Arena es la referencia autoritativa.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y no se publican parámetros ni huella de memoria.
- GPU recomendadas: no disponible; el modelo se distribuye en ONNX y puede ejecutarse con ONNX Runtime 1.24.4, pero no se especifican requisitos de aceleración.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime 1.24.4 junto con MuJoCo 3.10.0 para el entorno de simulación; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HlibPlakhtii/microduck-tug-quicksilver-v15 | no disponible | no aplica | 166,62117481 cm, 5 victorias por pit (local, semillas 3 y 4) | no disponible (licencia heredada) | HuggingFace, formato ONNX |
| jrubiosainz/microduck-tug-quicksilver-v14-h1-3cc8e430 | no disponible | no aplica | no disponible | no disponible | HuggingFace (modelo base) |
| Otras variantes del linaje microduck | no disponible | no aplica | no disponible | no disponible | HuggingFace |

No se dispone de datos de benchmarks comparables de otras variantes del linaje en la información proporcionada.

## Limitaciones y advertencias
- Optimización *in-sample*: las acciones están ajustadas a las semillas declaradas 3 y 4, por lo que no hay garantía de generalización a otras semillas o condiciones iniciales.
- Reproducción frágil: la reproducción exacta depende de la aritmética de coma flotante; pequeñas diferencias pueden alterar el resultado.
- No es un controlador de locomoción general ni una política para robot real, según advierte el propio autor.
- La red heredada no fue entrenada por el autor de esta versión y su rendimiento semanal en copa no se verificó de forma independiente.
- Licencia ambigua: se retiene el texto de licencia y NOTICE del modelo base, pero no se afirma una licencia global para el modelo combinado; el uso comercial queda sujeto al alcance de la licencia upstream.
- Sin datos de sesgos, alucinación o cobertura idiomática: no aplica al no ser un modelo de lenguaje.
- El resultado autoritativo es el de la Arena pública, no la puntuación local declarada.
- No se modificaron física, árbitro, servidor ni datos de la clasificación durante la optimización.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/HlibPlakhtii/microduck-tug-quicksilver-v15
- Modelo base: https://huggingface.co/jrubiosainz/microduck-tug-quicksilver-v14-h1-3cc8e430/tree/3b9ea9a2a2fbd9d44e3bd25375279488b3b5a216
- Repositorio del modelo base: https://huggingface.co/jrubiosainz/microduck-tug-quicksilver-v14-h1-3cc8e430
- Créditos mencionados: jrubiosainz, HlibPlakhtii, greecree, Pollen Robotics, lphatnguyen, a1rb4Ck, rumezhak, juicenv (sin URLs individuales disponibles)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada
