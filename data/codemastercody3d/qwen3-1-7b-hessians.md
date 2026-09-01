# CodeMasterCody3D/qwen3-1.7b-hessians

## Resumen

Este repositorio, publicado por CodeMasterCody3D, no contiene un modelo de lenguaje completo, sino un conjunto de matrices Hessianas precalculadas para la cuantización GPTQ del modelo base Qwen3-1.7B de Alibaba. Estas matrices se utilizan como entrada para el script `ternary_gptq.py` con el fin de calibrar la cuantización ternaria de los pesos del modelo. El autor las ha generado exclusivamente a partir del corpus de entrenamiento `wikitext-2-raw-v1` (partición train), con un presupuesto de 1024 filas por 256 tokens, lo que suma 262 144 tokens de calibración.

La relevancia de este recurso radica en que permite reproducir un pipeline de cuantización de baja precisión (ternaria) sobre Qwen3-1.7B sin necesidad de recalcular las Hessianas, ahorrando tiempo de cómputo. Sin embargo, el propio autor advierte de que estas Hessianas están limitadas a un único dominio (prosa de Wikipedia) y que no son válidas para tareas que requieran generalización a código, matemáticas o razonamiento. El repositorio ocupa 7,0 GB y contiene 28 bloques de pesos en formato `safetensors`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (recurso auxiliar para cuantizacion GPTQ del modelo Qwen3-1.7B) |
| Parametros totales | no disponible (el modelo base Qwen3-1.7B tiene 1,7 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no aplica (el recurso son Hessianas, no pesos cuantizados) |
| Idiomas soportados | no disponibles |
| Licencia | other |
| Formato de pesos | safetensors (28 bloques, 7,05 GB) |

## Arquitectura y entrenamiento

El contenido del repositorio son matrices Hessianas `H = sum x^T x` calculadas a partir de las activaciones de un prefijo cuantizado del modelo Qwen3-1.7B. Concretamente, la Hessiana del bloque *k* se construye usando las activaciones producidas por los bloques 0..*k-1* después de haber sido cuantizados. Esto implica que las Hessianas solo son válidas si se colocan sobre la base fp16 del modelo, es decir, si se usa el modelo original sin cuantizar como punto de partida. Si se intenta aplicar sobre un modelo ya cuantizado (por ejemplo, ternario), las activaciones serán diferentes y las Hessianas no serán útiles.

El corpus de calibración es únicamente `wikitext-2-raw-v1` en su partición de entrenamiento, con un presupuesto de 1024 filas y 256 tokens por fila. La geometría utilizada es `g128` con la configuración de 67 geometrías (`--rotate auto --rotate-cap 128 --rot-pairs down_proj=256`). Los pesos se almacenan sin rotar, de modo que una única matriz sirve para cualquier ancho de rotación; la transformación `R^T H R` se aplica después de cargar los datos.

## Capacidades

- No es un modelo generativo ni de razonamiento; es un recurso de calibración para cuantización.
- Proporciona Hessianas precalculadas para el script `ternary_gptq.py` mediante la opción `--load-hessians`.
- Permite reproducir un pipeline de cuantización ternaria sobre Qwen3-1.7B sin recalcular las matrices.
- Las Hessianas están optimizadas para un único dominio (prosa de Wikipedia) y no para tareas generales.

## Casos de uso

- Investigacion en cuantizacion de baja precision: el recurso permite experimentar con cuantizacion ternaria de Qwen3-1.7B sin necesidad de ejecutar el costoso calculo de Hessianas, acelerando el ciclo de iteracion en estudios academicos.
- Reproduccion de resultados: dado que el autor especifica el corpus y la geometria exactos, otros investigadores pueden replicar el proceso de cuantizacion y comparar metricas de perplejidad en wikitext-2 test.
- Desarrollo de tecnicas de calibracion: las Hessianas pueden servir como referencia para validar nuevos metodos de estimacion de importancia de pesos en modelos transformer.
- Optimizacion de despliegue en entornos con recursos limitados: al cuantizar el modelo a ternario, se reduce el uso de memoria y se puede ejecutar en hardware de gama baja, aunque la calidad resultante estara limitada por el corpus de calibracion.
- Analisis de sensibilidad de capas: al disponer de Hessianas por bloque, se puede estudiar que capas son mas sensibles a la cuantizacion y priorizar estrategias de cuantizacion mixta.
- Educacion y divulgacion: sirve como ejemplo practico de como se construyen y utilizan Hessianas en pipelines de GPTQ, util para cursos de optimizacion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que, al estar calibrado solo con wikitext-2, el rendimiento en ese conjunto de test puede parecer mejor de lo que realmente es en otros dominios, pero no proporciona cifras concretas.

## Requisitos de hardware

- No se especifican requisitos de hardware para el uso de estas Hessianas.
- Para ejecutar el script `ternary_gptq.py` con estas Hessianas se necesita un entorno con Python y las dependencias del script (no detalladas en la informacion).
- El almacenamiento necesario es de aproximadamente 7 GB para los archivos del repositorio.
- Dado que el recurso es un conjunto de matrices, no requiere GPU para su uso directo; la GPU seria necesaria si se desea ejecutar la cuantizacion del modelo base.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de lenguaje, sino un recurso auxiliar de cuantizacion, por lo que no existe una categoria directa de comparacion con otros modelos. Se podria comparar con otros conjuntos de Hessianas publicados para otros modelos base, pero no se dispone de informacion al respecto.

## Limitaciones y advertencias

- Las Hessianas estan calibradas exclusivamente con el corpus `wikitext-2-raw-v1` (particion train), un unico dominio de prosa de Wikipedia. No incluyen codigo, matematicas, chat ni trazas de razonamiento, por lo que su uso en tareas fuera de ese dominio producira resultados suboptimos.
- Solo son validas para colocar un cuerpo de modelo desde la base fp16. Si se aplican sobre un modelo cuyas capas anteriores ya estan cuantizadas (por ejemplo, ternarias), las activaciones cambian y las Hessianas dejan de ser correctas.
- La licencia es `other`, lo que implica restricciones no especificadas. Se debe consultar al autor antes de un uso comercial o de redistribucion.
- No se garantiza la generalizacion: el autor advierte explicitamente de que un modelo cuantizado con estas Hessianas puede parecer mejor en wikitext-2 test de lo que realmente es en otros conjuntos.
- El repositorio no incluye el modelo base ni el script de cuantizacion; solo las Hessianas. El usuario debe obtener Qwen3-1.7B y `ternary_gptq.py` por separado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/CodeMasterCody3D/qwen3-1.7b-hessians
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio oficial de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Pagina de Qwen3-1.7B en Ollama: https://ollama.com/library/qwen3:1.7b
