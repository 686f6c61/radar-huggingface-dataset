# jrubiosainz/microduck-sock-heist-6m-fce-v4x-c621636e

## Resumen

Microduck Sock Heist 6m FCE v4x-c621636e es una política de control robótico en formato ONNX publicada por el usuario jrubiosainz para la competición de simulación Microduck Arena, en la modalidad "6 m Sock Heist". No es un modelo de lenguaje ni un transformer generativo: es un artefacto de inferencia (un grafo ONNX con tablas de consulta de observaciones y acciones) que controla un robot Microduck de Pollen Robotics dentro de un entorno simulado. El modelo deriva por fine-tuning de `rumezhak/microduck-sock-heist-composite-v4` y su contribución propia se limita a una reoptimización de las llamadas de control finales para la semilla oficial 4.

La relevancia de esta ficha es acotada: se trata de una entrada de competición con cero descargas y cero likes en el momento de la consulta, con un tamaño de repositorio de 0,0 GB y un fichero de política de 1.209.745 bytes. Su interés técnico reside en el método (búsqueda de cola con CMA-ES separable sobre una política de terceros) y en la trazabilidad de linaje que documenta el autor, más que en capacidades generales de IA.

El modelo no declara licencia para el conjunto de los pesos, no declara idiomas soportados y el autor advierte explícitamente de que no debe ejecutarse en un robot físico. Toda la información disponible proviene de la model card y de los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX con tabla de consulta de observaciones (`L_obs`) y tabla de acciones (`L_act`), red de respaldo (fallback network) y máscara de tolerancia; no es un transformer |
| Parametros totales | no disponible (el autor no publica recuento de parámetros; el artefacto de política ocupa 1.209.745 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible para el modelo en su conjunto; se conserva `LICENSE-apache-2.0.txt` solo para las porciones que portan Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) |
| Pipeline declarado | robotics |
| Libreria | microduck |
| Modelo base | rumezhak/microduck-sock-heist-composite-v4 (revision `f0045604b1687141f310ec727dabd515ba71ba5e`) |
| SHA256 de la politica | `c621636e8231b2488c2837da81de07af94dfd07f50ef0a07de53b90c49a1d820` |
| SHA256 del `policy.onnx` base | `bcc84b66982cf37d773d1ac3c8565fd4f294c56c5ba503583ad417c4d73f93f4` |
| Entorno de evaluacion | microduck-arena 0.7.0, runner x86 version 5 |
| Comando canonico seleccionado | `command_vx = 0.2` |

## Arquitectura y entrenamiento

La política no es una red neuronal entrenada de extremo a extremo en el sentido habitual. El autor describe un grafo ONNX con un mecanismo de consulta de observaciones (`L_obs`) y de acciones (`L_act`), una red de respaldo, una máscara y una tolerancia, cuyas formas de tensor y metadatos permanecen sin cambios respecto al modelo base. El linaje se remonta a `microduck-sock-heist-composite-v3` (revision `065056e8a8ad8e78cda38110f7717828e0d30475`, `policy.onnx` SHA256 `c21bc2d436e7893946bdb92b5708b0160a49b5d6160890daf7089d6a3ea836e4`), que aporta la red de respaldo, y al layout de grafo y mecanismo de lookup de `a1rb4Ck/microduck-heist` (commit `94cd2cfeb57a4ece561a3d320e233f442238cb81`, Apache-2.0).

El entrenamiento o ajuste realizado por jrubiosainz el 2026-11-04 consistió en una reoptimización de las llamadas de control finales antes de la meta para la semilla oficial 4, mediante CMA-ES separable con una búsqueda por semilla, y en la regrabación cerrada de las observaciones y acciones de lookup sobre el runner nativo x86. Solo cambian esas filas de cola de `L_obs` y `L_act` y el aviso de modificación añadido; las semillas oficiales 1, 2, 3 y 5 conservan las filas de lookup del base, y las filas posteriores a cada nueva cadena en su bloque quedan exactamente como en el base. No se documenta número de tokens, composición de dataset ni uso de RLHF/DPO, porque no aplica a este tipo de artefacto.

## Capacidades

- Control de locomoción de un robot Microduck en simulación para la tarea "6 m Sock Heist" de Microduck Arena.
- Ejecución de una secuencia de acciones precalculada con consulta de observaciones en bucle cerrado sobre el runner nativo.
- Red de respaldo para observaciones no cubiertas por la tabla de lookup.
- Evaluación tanto a velocidad fija como en barrido canónico (selección de `command_vx = 0.2`).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, audio ni modo de pensamiento.
- No se ha establecido ninguna capacidad de parada segura ni de operación en robot físico.

## Casos de uso

- Reproducción de resultados de competición: el artefacto permite replicar las cinco metas oficiales en el runner microduck-arena 0.7.0 x86 (versión 5) y verificar los tiempos publicados, gracias a que el SHA256 del candidato está fijado.
- Investigación de métodos de búsqueda de cola: sirve como caso de estudio de optimización con CMA-ES separable sobre las últimas llamadas de control de una política de terceros, con un delta medible de un solo tick en la semilla 4.
- Auditoría de linaje de modelos: la model card documenta revisiones, SHA256 y avisos heredados, lo que lo convierte en un ejemplo útil para estudiar trazabilidad y atribución en artefactos derivados.
- Docencia sobre evaluación en simulación: permite ilustrar la diferencia entre medición local nativa e resultado oficial de Arena, y el riesgo de sobreajuste a las semillas evaluadas.
- Pruebas de infraestructura de inferencia ONNX: al ser un grafo pequeño (1,2 MB) con formas de tensor fijas, es adecuado para validar pipelines de carga y ejecución de ONNX en entornos x86.
- Estudio de licenciamiento en modelos derivados: el caso muestra cómo se propaga (o no) una licencia cuando el upstream no la declara, con retención separada de `LICENSE-apache-2.0.txt` para las porciones Apache-2.0.

## Benchmarks y rendimiento

El autor publica mediciones de replay local nativo, no resultados de Arena. Corresponden a las cinco semillas oficiales con el candidato anotado, en el runner microduck-arena 0.7.0 x86 versión 5:

| Semilla oficial | Tiempo de meta (s) | Ticks de fisica | Ticks del base |
|---|---:|---:|---:|
| 1 | 4,800 | 960 | 960 |
| 2 | 5,155 | 1031 | 1031 |
| 3 | 4,750 | 950 | 950 |
| 4 | 4,800 | 960 | 961 |
| 5 | 4,930 | 986 | 986 |

Cinco metas completadas; media 4,887 s y total 4887 ticks, frente a los 4888 ticks del base directo. La única mejora medida es de un tick en la semilla 4. El autor advierte de que son mediciones locales nativas, no una afirmación de aceptación, rango o puntuación en la Arena en vivo, y que diferencias de hardware o runtime pueden alterar el resultado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el artefacto es un grafo ONNX de 1.209.745 bytes y no requiere GPU para cargarse, aunque el autor no publica requisitos de memoria.
- GPU recomendadas: no disponibles; la evaluación se realizó en el runner nativo x86, sin mención de GPU.
- Compatibilidad con GPU de consumo: no documentada.
- Opciones de despliegue: ONNX Runtime sobre el runner microduck-arena 0.7.0 (versión 5) en x86; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Latencia y throughput: no disponibles; solo se publican tiempos de meta en simulación (entre 4,750 s y 5,155 s según semilla).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultado publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jrubiosainz/microduck-sock-heist-6m-fce-v4x-c621636e | no disponible (1,2 MB ONNX) | no aplica | 4887 ticks totales, media 4,887 s (local, in-sample) | no disponible | Hugging Face, 0 descargas |
| rumezhak/microduck-sock-heist-composite-v4 | no disponible | no aplica | 4888 ticks totales (base directo) | no disponible | Hugging Face |
| rumezhak/microduck-sock-heist-composite-v3 | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| a1rb4Ck/microduck-heist | no disponible | no aplica | no disponible | Apache-2.0 | Hugging Face (commit `94cd2cfe`) |

No se dispone de datos de benchmarks comparables de otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El autor indica explícitamente: no ejecutar esta política en un robot físico; no se ha establecido parada segura ni operación física.
- Resultado in-sample: solo se optimizaron y midieron las cinco semillas oficiales, por lo que no hay evidencia de generalización.
- La mejora frente al base es marginal (un tick en una semilla), dentro de la variabilidad esperada por hardware y runtime.
- El modelo no declara licencia para el conjunto de los pesos; ni el base directo ni composite-v3 la declaran. La presencia de `LICENSE-apache-2.0.txt` no licencia los pesos upstream sin licencia ni el fichero completo.
- Existe riesgo de reclamaciones de terceros: el autor se compromete a detener la publicación y escalar la retirada si algún autor objeta.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque el artefacto no genera texto.
- Cero descargas y cero likes en el momento de la consulta, sin validación externa de la comunidad.
- El aviso de modificación añadido identifica este cambio de forma separada, pero los avisos heredados describen artefactos predecesores y no cambios de esta release.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-fce-v4x-c621636e
- Modelo base: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v4/tree/f0045604b1687141f310ec727dabd515ba71ba5e
- Predecesor composite-v3: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v3/tree/065056e8a8ad8e78cda38110f7717828e0d30475
- Repositorio de layout de grafo y lookup (Apache-2.0): https://huggingface.co/a1rb4Ck/microduck-heist/tree/94cd2cfeb57a4ece561a3d320e233f442238cb81
- Microduck Arena y runner oficial (Pollen Robotics): no disponible como URL en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
