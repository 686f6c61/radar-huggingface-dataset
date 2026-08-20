# crosbylegal/claude-opus-5

## Resumen

Este repositorio en Hugging Face no contiene un modelo con pesos, sino una **tarjeta de seguimiento de resultados** (results-tracking card) para el modelo de API propietario **Claude Opus 5**. El autor, `crosbylegal`, ha creado este espacio para alojar los resultados de evaluacion del benchmark comunitario [RedlineBench](https://huggingface.co/datasets/crosbylegal/RedlineBench), ya que el modelo subyacente no dispone de un repositorio publico de pesos.

Al carecer de pesos, licencia, arquitectura o cualquier especificacion tecnica publicada, esta ficha no puede describir las capacidades de inferencia del modelo. Su relevancia radica en que sirve como punto de referencia para investigadores y desarrolladores que deseen consultar el rendimiento de Claude Opus 5 en una tarea especifica de evaluacion, aunque dichos resultados provienen de un informe externo y no estan verificados por Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (sin pesos publicados) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura, el entrenamiento o los datos utilizados para Claude Opus 5. Al tratarse de un modelo de API propietario, estos detalles no se han divulgado en la tarjeta de resultados. El repositorio se limita a alojar un archivo de evaluacion en el directorio `.eval_results/` y a enlazar un informe externo.

## Capacidades

No se dispone de informacion sobre las capacidades del modelo en esta tarjeta. El repositorio no documenta funciones de generacion de texto, razonamiento, codigo, tool calling, agentes ni soporte multilingue. La unica capacidad verificable es la de participar en el benchmark RedlineBench, cuyo resultado se detalla en la seccion correspondiente.

## Casos de uso

Dado que este repositorio no contiene un modelo desplegable, los casos de uso practicos se limitan al ambito de la evaluacion y el seguimiento:

- **Seguimiento de rendimiento de modelos API**: permite a investigadores consultar de forma centralizada la puntuacion de Claude Opus 5 en RedlineBench, sin necesidad de ejecutar el benchmark manualmente.
- **Evaluacion comparativa comunitaria**: sirve como referencia para comparar el rendimiento de Claude Opus 5 con otros modelos evaluados en el mismo benchmark, aunque la comparativa directa no se incluye en esta tarjeta.
- **Auditoria de resultados**: al estar alojado en Hugging Face, facilita la trazabilidad y el acceso publico a los resultados de evaluacion, aunque estos no esten verificados por la plataforma.

## Benchmarks y rendimiento

La tarjeta reporta un unico resultado del benchmark RedlineBench, atribuido al informe publicado por el autor (comunidad/fuente) y no verificado por Hugging Face (que solo aplica a resultados de inspect-ai).

| Benchmark | Metrica | Resultado |
|---|---|---|
| RedlineBench | `redline_overall` | 56.9 |

## Requisitos de hardware

No aplicable. Este repositorio no contiene pesos ni codigo de inferencia. Claude Opus 5 es un modelo de API propietario, por lo que no existen requisitos de VRAM, GPU o despliegue local asociados a esta tarjeta.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparativas con otros modelos, ni datos sobre alternativas de la misma categoria.

## Limitaciones y advertencias

- **No es un modelo desplegable**: el repositorio no contiene pesos, por lo que no puede utilizarse para inferencia local ni integracion en aplicaciones.
- **Licencia no especificada**: no se indica ninguna licencia, lo que impide conocer las restricciones de uso, incluso para fines de consulta de los datos alojados.
- **Resultados no verificados**: la puntuacion de RedlineBench se atribuye a un informe externo y no cuenta con la verificacion de Hugging Face, por lo que su fiabilidad depende de la fuente original.
- **Ausencia de especificaciones**: no se documentan arquitectura, parametros, contexto ni idiomas, lo que limita cualquier evaluacion tecnica rigurosa del modelo subyacente.
- **Riesgo de confusion**: al usar el nombre "Claude Opus 5", podria inducir a error a quienes busquen un modelo open source con pesos, cuando en realidad se trata de una tarjeta de resultados de un API propietario.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/crosbylegal/claude-opus-5)
- [Dataset RedlineBench](https://huggingface.co/datasets/crosbylegal/RedlineBench)
- [Informe de benchmark](https://intelligence.crosby.ai/benchmark/)
