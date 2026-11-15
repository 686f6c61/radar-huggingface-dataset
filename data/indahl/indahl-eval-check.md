# indahl/indahl-eval-check

## Resumen

`indahl/indahl-eval-check` es un repositorio alojado en Hugging Face por el usuario `indahl` que no contiene un modelo de lenguaje entrenado, sino un plugin para Claude Code orientado a auditar afirmaciones sobre evaluaciones de modelos. Segun su model card, la herramienta ejecuta el comando `/eval-check` sobre una afirmacion de benchmark, una model card o una ejecucion de evaluacion propia, y devuelve el estado de doce comprobaciones derivadas de los estandares de Heuremen LLC y de los recuentos del proyecto IRIS.

El artefacto no publica pesos, arquitectura, tokenizador ni configuracion de inferencia. Se distribuye como plugin instalable mediante el marketplace de Claude Code (`/plugin marketplace add Heuremen-LLC/indahl.ai` y `/plugin install indahl-eval-check@heuremen`) y se ejecuta dentro de Claude Code, sin requisitos adicionales declarados ni servicios propios contactados.

Su relevancia es acotada y de naturaleza metodologica: no compite con modelos generativos, sino que actua como verificador del proceso de evaluacion (parser frente a respuestas crudas, repetibilidad minima, recuentos desde ficheros liberados, elementos descartados por motivo e intervalos con cuatro desenlaces). La ficha se completa con los datos disponibles, que son escasos en lo relativo a especificaciones tecnicas del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un plugin para Claude Code) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no publica pesos; se instala como plugin) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre arquitectura, datos de entrenamiento, numero de tokens, composicion del corpus ni tecnicas de alineacion (RLHF, DPO). El repositorio no contiene pesos ni configuracion de un transformer, MoE, SSM o modelo hibrido; el contenido descrito en la model card corresponde a una extension ejecutable dentro de Claude Code que aplica un conjunto fijo de comprobaciones sobre material de evaluacion.

El unico detalle de proceso indicado es la revision externa previa a la publicacion: la model card menciona que Sage, revisor externo de Heuremen LLC, verifico la version el 13 de noviembre de 2026 y que todas sus correcciones se aplicaron antes del lanzamiento. No se documentan innovaciones tecnicas de inferencia (decodificacion especulativa, atencion lineal, etc.) porque el artefacto no realiza inferencia de un modelo propio.

## Capacidades

- Auditoria de afirmaciones sobre benchmarks: emite un estado por comprobacion (PRESENT con evidencia, ABSENT con lo verificado, CANNOT_TELL con motivo, NOT_APPLICABLE).
- Lista `not_tested` con las comprobaciones no ejecutadas y la razon, para separar lo no comprobado de lo ausente.
- Verificacion del parser frente a las respuestas crudas del modelo evaluado.
- Comprobacion de que la configuracion del experimento se trata como parte del resultado.
- Verificacion del suelo de repeticion (repeat floor) en las ejecuciones de evaluacion.
- Recuentos (recounts) a partir de ficheros liberados por los autores del estudio.
- Registro de elementos descartados por motivo.
- Calculo de intervalos con cuatro desenlaces posibles.
- Invocacion mediante comando `/eval-check` seguido del objetivo a comprobar (por ejemplo, una model card o un directorio de resultados como `runs/2026-11/`).
- Tratamiento del texto recuperado y de las salidas de modelos como datos, no como instrucciones.
- No contacta servicios propios: solo abre los papers, ficheros y paginas que se le indiquen.

## Casos de uso

- Verificacion de una cifra de benchmark publicada: ante la afirmacion de que un modelo alcanza cierto resultado en MMLU o HumanEval, el plugin recorre las doce comprobaciones y devuelve PRESENT/ABSENT/CANNOT_TELL con la evidencia localizada, lo que permite descartar numeros sin respaldo documental.
- Revision de model cards antes de su publicacion: se apunta `/eval-check` a la model card de una nueva version y se obtiene que comprobaciones metodologicas faltan (parser, repeticiones, intervalos), de modo que el equipo corrige antes del lanzamiento.
- Auditoria de una ejecucion interna de evaluacion: sobre un directorio de resultados (`runs/2026-11/`), el plugin comprueba el suelo de repeticion y los elementos descartados por motivo, detectando ejecuciones con una sola pasada o descartes no justificados.
- Depuracion de un harness o scorer de evaluacion: al construir o depurar el pipeline que puntua respuestas, la comprobacion del parser frente a las respuestas crudas revela discrepancias entre lo que el modelo emitio y lo que el scorer contabilizo.
- Comparacion entre modelos con criterio homogeneo: al contrastar dos modelos, el plugin aplica el mismo conjunto de doce comprobaciones a ambas afirmaciones, evitando comparar un resultado auditado con otro sin auditar.
- Replicacion de estudios publicados: usando los recuentos desde los ficheros liberados por los autores, se contrasta si las cifras del paper coinciden con los datos originales.
- Redaccion de secciones de resultados: la lista `not_tested` y los estados CANNOT_TELL permiten declarar explicitamente en el texto que comprobaciones no se pudieron completar y por que.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es un modelo evaluable con MMLU, HumanEval o GSM8K; su funcion es auditar las evaluaciones de otros modelos.

## Requisitos de hardware

- No requiere GPU ni VRAM: se ejecuta dentro de Claude Code.
- No se declaran requisitos de instalacion adicionales ("None. Runs inside Claude Code").
- Despliegue mediante el marketplace de plugins de Claude Code: `/plugin marketplace add Heuremen-LLC/indahl.ai` y `/plugin install indahl-eval-check@heuremen`.
- No aplican opciones de servido como vLLM, llama.cpp, Ollama o TGI, al no existir pesos que cargar.
- Latencia y throughput no disponibles; dependen del entorno de Claude Code y del volumen de documentos que se le indiquen.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada artefactos comparables de la misma categoria (plugins de auditoria de evaluaciones para Claude Code) ni modelos de lenguaje con los que contrastar parametros, contexto o licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto de forma autonoma ni puede usarse para inferencia, fine-tuning o despliegue como servicio de completado.
- No se especifica licencia; el uso comercial queda sin cobertura explicita y requiere consulta previa a Heuremen LLC.
- No se declaran idiomas soportados; el material de referencia y la documentacion estan en ingles.
- El alcance esta limitado a las doce comprobaciones de los estandares de Heuremen LLC y a los recuentos de IRIS; afirmaciones fuera de ese marco pueden quedar como CANNOT_TELL o no cubiertas.
- El resultado depende de los documentos que se le indiquen: si no se apunta a los ficheros crudos o a los datos liberados, las comprobaciones correspondientes no podran resolverse como PRESENT.
- La model card advierte de que el texto recuperado y las salidas de modelos se tratan como datos y no como instrucciones, lo que implica un riesgo de inyeccion de prompt a traves de documentos externos que conviene vigilar.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y las fechas de creacion y actualizacion (15 de noviembre de 2026) distan dos segundos entre si, lo que sugiere un artefacto recien publicado y sin validacion de la comunidad.
- No se han publicado resultados que midan la precision del propio auditor (falsos PRESENT o falsos ABSENT).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/indahl/indahl-eval-check
- Estandares de Heuremen LLC: https://indahl.ai/standard
- Recuentos IRIS: https://indahl.ai/iris
- Politica de privacidad: https://indahl.ai/privacy
- Terminos de uso: https://indahl.ai/terms
- Codigo fuente del plugin: https://github.com/Heuremen-LLC/indahl.ai/tree/main/claude-plugins/src/eval-check
- Sitio de Heuremen LLC: https://indahl.ai
