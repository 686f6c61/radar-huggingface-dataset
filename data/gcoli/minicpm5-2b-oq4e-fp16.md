# gcoli/MiniCPM5-2B-oQ4e-fp16

## Resumen

`gcoli/MiniCPM5-2B-oQ4e-fp16` es una cuantizacion de precision mixta en 4 bits del modelo MiniCPM5-2B, publicada por el usuario gcoli. No se trata de un modelo entrenado desde cero, sino de una conversión de los pesos originales al formato MLX safetensors mediante la herramienta oQ (oMLX v0.6.4), pensada para ejecucion en hardware Apple Silicon. El repositorio ocupa 1,5 GB y contiene 2.516.756.480 parametros segun los pesos reales en safetensors, lo que situa al modelo base en torno a los 2,5 mil millones de parametros.

El interes de esta ficha es acotado pero concreto: se trata de una cuantizacion de terceros, sin model card detallada, sin licencia declarada en el repositorio y con cero descargas en el momento de la consulta. La model card se limita a indicar los parametros de cuantizacion (4 bits, group size 64, formato MLX) y a advertir de que los pesos fueron reemplazados el 2026-09-15, por lo que las descargas anteriores a esa fecha deben repetirse.

Dado que no se aportan datos de arquitectura del modelo base, composicion del dataset de entrenamiento ni resultados de benchmarks, esta ficha marca explicitamente como "no disponible" todo aquello que no puede verificarse a partir de la informacion proporcionada. Se recomienda tratar el repositorio como material experimental hasta confirmar la procedencia y licencia del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card indica "Model type: llama" a efectos de cuantizacion) |
| Parametros totales | 2.516.756.480 (~2,52 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64, precision mixta (oQ / oMLX v0.6.4) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |
| Tamano del repositorio | 1,5 GB |
| Libreria declarada | mlx |
| Fecha de creacion | 2026-09-14 |
| Ultima actualizacion | 2026-09-14 (los pesos se reemplazaron el 2026-09-15 segun la model card) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base MiniCPM5-2B: ni el tipo de bloque (transformer denso, MoE, SSM o hibrido), ni el esquema de atencion, ni la longitud de contexto nativa. El unico dato tecnico relevante que aporta la model card es la etiqueta `llama` como tipo de modelo para la herramienta de cuantizacion, lo que sugiere una estructura compatible con la familia Llama, pero no confirma la arquitectura real del modelo original.

Tampoco hay informacion sobre el entrenamiento: numero de tokens, composicion del corpus, uso de RLHF, DPO, decodificacion especulativa u otras innovaciones. Lo unico documentado es el proceso de post-procesado: cuantizacion de precision mixta en 4 bits con group size 64, realizada con oQ (oMLX v0.6.4) y exportada a safetensors en formato MLX. La model card advierte que los pesos actuales sustituyen a una version anterior subida antes del 2026-09-15.

## Capacidades

- Generacion de texto: no confirmada de forma explicita en la informacion disponible, pero es la funcion esperada de un modelo de lenguaje de este tamano.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas en el repositorio.
- Capacidades especiales (vision, audio, modo thinking): no disponible.
- La unica capacidad tecnicamente confirmada es la de ejecucion en el ecosistema MLX para Apple Silicon gracias al formato de pesos cuantizados.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: al estar en formato MLX safetensors, el modelo esta pensado para cargarse con `mlx-lm` en equipos con chip M-series, aprovechando la memoria unificada para ejecutar los ~1,5 GB de pesos en 4 bits sin GPU dedicada.
- Prototipado rapido en portatiles: un modelo de ~2,5B en 4 bits permite iterar sobre prompts y flujos conversacionales en local antes de escalar a modelos mayores en servidor.
- Tareas de generacion de texto de baja latencia: el reducido tamano de pesos hace viable su uso en escenarios donde la primera respuesta debe llegar en pocos cientos de milisegundos, siempre que se valide la calidad real del modelo base.
- Pruebas de cuantizacion y evaluacion de la herramienta oQ: el repositorio sirve como caso de estudio para comparar precision mixta en 4 bits frente a cuantizaciones uniformes en el mismo modelo base.
- Automatizacion de resumenes y clasificacion de texto: siempre que la licencia del modelo base lo permita, puede integrarse en pipelines de procesamiento de documentos en local.
- Entornos educativos y de investigacion: util para experimentar con despliegue en MLX sin coste de GPU en la nube.
- Aplicaciones offline o con requisitos de privacidad: al ejecutarse localmente, los datos no salen del equipo, lo que encaja en escenarios con datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se documenta el rendimiento de la cuantizacion frente al modelo original en fp16.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 1,5-2 GB para los pesos en 4 bits (tamano del repo: 1,5 GB), mas la memoria para el contexto y los estados de atencion, que depende de la longitud de contexto no especificada.
- GPU recomendadas: no se indica compatibilidad con GPU CUDA; el formato MLX esta orientado a Apple Silicon.
- Compatibilidad con GPU de consumo: los ~1,5 GB de pesos caben holgadamente en cualquier GPU de consumo con 4 GB o mas de VRAM si se convirtieran a otro formato, pero no es el caso de MLX.
- Apple Silicon: es el destino natural; cabe en cualquier Mac con memoria unificada de 8 GB o superior.
- Opciones de despliegue: `mlx-lm` para MLX. Para otros entornos (llama.cpp, vLLM, Ollama, TGI) seria necesario convertir los pesos, algo no documentado en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de su contexto, por lo que la comparativa se limita a parametros y disponibilidad. Los modelos de la misma franja de tamano son referencias de categoria, no equivalentes confirmados.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B-oQ4e-fp16 (este repo) | ~2,52B | no disponible | no disponible | MLX safetensors 4 bits | Cuantizacion de terceros, 0 descargas |
| Qwen2.5-3B (referencia de categoria) | ~3,09B | 32K (segun su model card) | Apache 2.0 | safetensors, GGUF | Ampliamente soportado en llama.cpp, vLLM |
| Llama-3.2-3B (referencia de categoria) | ~3,21B | 128K (segun su model card) | Llama 3.2 Community License | safetensors, GGUF | Ecosistema maduro de herramientas |
| Gemma-2-2B (referencia de categoria) | ~2,6B | 8K (segun su model card) | Gemma Terms of Use | safetensors, GGUF | Buen rendimiento en su franja |

Las cifras de los modelos de referencia provienen de sus respectivas model cards publicas; no se han contrastado con benchmarks ejecutados sobre este repositorio.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no indica licencia, lo que impide confirmar si el uso comercial esta permitido. Antes de cualquier uso en produccion hay que verificar la licencia del modelo base MiniCPM5-2B.
- Origen de terceros: se trata de una cuantizacion subida por un usuario, no por el equipo que entrena el modelo. No hay garantia de fidelidad respecto a los pesos originales.
- Cero descargas y cero likes: el repositorio no tiene validacion de la comunidad en el momento de la consulta.
- Pesos reemplazados: la model card advierte de que los pesos actuales sustituyen a una version anterior; descargas previas al 2026-09-15 pueden estar desactualizadas.
- Falta de datos de entrenamiento: sin informacion sobre el dataset no se pueden evaluar sesgos conocidos ni cobertura idiomatica.
- Riesgo de alucinacion: no cuantificado; en modelos de ~2,5B es habitualmente elevado, pero no hay datos para este caso concreto.
- Limitaciones de contexto e idioma: no disponibles.
- Compatibilidad restringida: el formato MLX limita el despliegue fuera del ecosistema Apple; no se documenta conversion a GGUF ni a otros formatos.
- Ausencia de benchmarks: no hay evidencia publicada que permita comparar su calidad con alternativas.

## Enlaces

- HuggingFace: https://huggingface.co/gcoli/MiniCPM5-2B-oQ4e-fp16
- Repositorio de la herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
