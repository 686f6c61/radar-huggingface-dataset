# rumezhak/microduck-sock-heist-composite-v10

## Resumen

`microduck-sock-heist-composite-v10` es una entrada de competición para la prueba de 6 metros "Sock Heist" de la Microduck Arena, un entorno de simulación de robótica articulado por Pollen Robotics. No es un modelo de lenguaje: es un artefacto ONNX que combina una red neuronal de política (procedente de `lphatnguyen/microduck-sock-heist-6m-v5`) con una tabla de búsqueda (`lookup`) que reproduce trayectorias de control previamente registradas. El autor, `rumezhak`, construye el artefacto fusionando cuatro trayectorias de `HlibPlakhtii/microduck-sock-heist-nov17-v3` con una trayectoria propia para la semilla 4, obtenida mediante búsqueda CMA-ES.

El resultado es un tiempo medio de 4,780 s sobre las cinco semillas oficiales, frente a los 4,787 s de `nov17-v3`, los 4,788 s de `jrubiosainz/counter-s1s5` y los 4,806 s de la versión anterior del propio autor (`composite-v9`). La mejora total respecto a la mejor entrada pública es de 7 ms, concentrada íntegramente en la semilla 4 (de 943 a 936 ticks). El modelo es explícitamente in-sample: fuera de las cinco semillas oficiales, la política subyacente es la red de `lphatnguyen` v3, sin ninguna ventaja demostrada.

La relevancia es, por tanto, acotada al ámbito de la competición: ilustra técnicas de ingeniería de artefactos (sustitución de tablas de lookup, búsqueda evolutiva de trayectorias, verificación contra el runner oficial) más que avances en aprendizaje robótico generalizable. El autor advierte que no debe cargarse en un MicroDuck físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX con red de política (fallback) y tablas de búsqueda `L_obs`/`L_act` (lookup de observación-acción) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; el "contexto" es la observación del simulador por paso) |
| Tipos de cuantizacion | no disponible (artefacto ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Mixta: Apache-2.0 solo para las partes que la declaran (layout del grafo y mecanismo de lookup de `a1rb4Ck/microduck-heist@94cd2cfe`); el repositorio en su conjunto no está etiquetado Apache-2.0. Las partes de HlibPlakhtii, jrubiosainz y lphatnguyen no declaran licencia |
| Formato de pesos | ONNX (grafo con tablas de lookup; `L_obs` y `L_act` con 1321 filas) |

## Arquitectura y entrenamiento

El artefacto no se entrena en el sentido convencional. Se compone de un grafo ONNX cuya política de respaldo es la red de `lphatnguyen/microduck-sock-heist-6m-v5` (v3 según la model card), más un mecanismo de lookup que, dada una observación, recupera la acción registrada en una trayectoria previa. Respecto a `composite-v9`, solo cambian las tablas `L_obs` y `L_act` (todas las filas reconstruidas, 1321 en total) y los metadatos `modification_notice`; el grafo, la red de respaldo y el resto de tensores son idénticos.

La generación de la trayectoria de la semilla 4 se realizó con CMA-ES (búsqueda de estrategia de evolución con adaptación de matriz de covarianza) sobre x86-64, partiendo de la trayectoria de `lphatnguyen/sock-heist-6m-v5`, con una cola de búsqueda separable más larga y verificación de cada candidato contra el runner de la Arena. Las otras cuatro trayectorias (semillas 1, 2, 3 y 5) se toman sin modificar de `nov17-v3`, que a su vez finetunea `jrubiosainz/counter-s1s5`. No hay RLHF, DPO ni datos de entrenamiento en el sentido habitual.

## Capacidades

- Control de política en simulación para la tarea "Sock Heist" de 6 m en la Microduck Arena.
- Reproducción determinista de cinco trayectorias registradas sobre las semillas oficiales 1-5.
- Fallback a una red neuronal de política cuando la observación no coincide con ninguna fila de lookup.
- Score idéntico en todos los comandos de velocidad (las claves de lookup no incluyen el comando); la Arena lo puntúa a 0,20 m/s.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No soporta visión, audio ni modo "thinking".

## Casos de uso

- Participación en la competición Sock Heist 6 m de la Microduck Arena: el artefacto se sube como entrada y se evalúa con el scorer oficial sobre las cinco semillas, donde rinde 4,780 s de media.
- Reproducción de resultados en x86-64: con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 fijados, las cinco trayectorias se replican de forma determinista, lo que permite auditar el resultado.
- Estudio de técnicas de lookup sobre políticas neuronales: sirve como ejemplo de cómo sustituir tablas de observación-acción manteniendo el grafo y la red de respaldo intactos.
- Referencia para búsqueda evolutiva de trayectorias: la semilla 4 documenta un pipeline CMA-ES con verificación contra el runner oficial, reutilizable para optimizar otras semillas.
- Benchmark interno de ingeniería de artefactos: comparar el efecto de reconstruir tablas de lookup (1321 filas) frente a reentrenar la política.
- Docencia sobre límites del ajuste in-sample: caso claro de una mejora de 7 ms que no generaliza fuera de las semillas oficiales.

## Benchmarks y rendimiento

| Semilla | Hlib `nov17-v3` (s) | Este artefacto (s) |
|---|---|---|
| 1 | 4,635 | 4,635 |
| 2 | 5,095 | 5,095 |
| 3 | 4,675 | 4,675 |
| 4 | 4,715 | **4,680** |
| 5 | 4,815 | 4,815 |
| Media | 4,787 | **4,780** |

Comparativa de medias sobre las cinco semillas oficiales (scorer de la Arena, x86-64 del autor):

| Entrada | Media (s) |
|---|---|
| `rumezhak/microduck-sock-heist-composite-v10` | 4,780 |
| `HlibPlakhtii/microduck-sock-heist-nov17-v3` | 4,787 |
| `jrubiosainz/microduck-sock-counter-s1s5` | 4,788 |
| `rumezhak/microduck-sock-heist-composite-v9` | 4,806 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni aplican a este artefacto.

## Requisitos de hardware

- Inferencia en CPU x86-64; no se documenta uso de GPU.
- Entorno de referencia: MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 fijados por la Arena.
- VRAM estimada: no aplica (ejecución en CPU).
- GPU recomendadas: no disponible; el autor solo reporta resultados en x86-64.
- Cabe en cualquier CPU de consumo; no requiere acelerador.
- Despliegue: el runner de la Microduck Arena (Space de Pollen Robotics); no se documentan opciones vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: no disponibles más allá del tiempo de tarea (4,780 s de media); en macOS los números difieren ligeramente y el lookup puede fallar.

## Comparativa con modelos similares

| Modelo | Tipo | Media 5 semillas (s) | Licencia | Disponibilidad |
|---|---|---|---|---|
| `rumezhak/microduck-sock-heist-composite-v10` | Lookup + política ONNX | 4,780 | Mixta (Apache-2.0 parcial) | Hugging Face |
| `HlibPlakhtii/microduck-sock-heist-nov17-v3` | Política ONNX finetuneada | 4,787 | No declarada | Hugging Face |
| `jrubiosainz/microduck-sock-counter-s1s5` | Política ONNX | 4,788 | No declarada | Hugging Face |
| `rumezhak/microduck-sock-heist-composite-v9` | Lookup + política ONNX | 4,806 | No declarada | Hugging Face |

## Limitaciones y advertencias

- In-sample: fuera de las cinco semillas oficiales, el artefacto se comporta como la red de `lphatnguyen` v3; solo las cinco trayectorias registradas son rápidas.
- Determinismo frágil: la reproducción exacta depende de MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 en x86-64; otro CPU o un Mac pueden alterar el redondeo y hacer fallar el lookup.
- Margen mínimo: 7 ms de ventaja sobre la mejor entrada pública, fácilmente superable por cualquiera que tome las filas de la semilla 4 y pula las colas.
- Licencia ambigua: el repositorio no está etiquetado Apache-2.0 en su conjunto; las partes de HlibPlakhtii, jrubiosainz y lphatnguyen no declaran licencia y no se relicencian. Uso comercial no garantizado.
- Autoría no consultada: el autor no pidió permiso a HlibPlakhtii, jrubiosainz, lphatnguyen ni a1rb4Ck; se retirará la entrada si alguno objeta.
- No apto para robot físico: las acciones registradas están muy fuera de lo que servos reales admitirían; no cargar en un MicroDuck real.
- Sin evaluación fuera de simulación ni datos de generalización a otras tareas.
- Riesgo de alucinación y sesgos: no aplica (no es un modelo generativo de lenguaje).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v10
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Modelo base `HlibPlakhtii/microduck-sock-heist-nov17-v3`: https://huggingface.co/HlibPlakhtii/microduck-sock-heist-nov17-v3
- Modelo base `rumezhak/microduck-sock-heist-composite-v9`: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v9
- `jrubiosainz/microduck-sock-counter-s1s5`: https://huggingface.co/jrubiosainz/microduck-sock-counter-s1s5
- `lphatnguyen/microduck-sock-heist-6m-v5`: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v5
- `lphatnguyen/microduck-sock-heist-6m-v3`: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- `a1rb4Ck/microduck-heist` (commit 94cd2cfe): https://huggingface.co/a1rb4Ck/microduck-heist
- Pollen Robotics: https://huggingface.co/pollen-robotics
