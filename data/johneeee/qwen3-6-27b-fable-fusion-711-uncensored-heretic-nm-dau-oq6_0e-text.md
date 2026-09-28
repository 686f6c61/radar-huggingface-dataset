# Johneeee/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-oQ6_0e-text

## Resumen

Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-oQ6_0e-text es una version cuantizada en formato MLX de un fine-tune de 27.000 millones de parametros derivado de la familia Qwen3.6. El modelo base, desarrollado por DavidAU mediante un proceso de ajuste fino y fusion (merge) en multiples etapas, esta orientado a razonamiento y se presenta como un modelo "uncensored" (abliterated), es decir, con las capas de rechazo reducidas. Esta ficha concreta corresponde a una conversion de pesos realizada por el usuario Johneeee con la herramienta oQ (oMLX v0.7.0.dev4), pensada para ejecucion en Apple Silicon.

La relevancia de esta publicacion es de nicho: se trata de una cuantizacion mixta de 5 bits en formato MLX safetensors (group size 64), que reduce el peso del repositorio a 20,5 GB para un total real de 26.895.998.464 parametros. Esta pensada para permitir la inferencia del modelo en equipos con memoria unificada de Apple mediante librerias compatibles con MLX, en lugar de requerir GPU NVIDIA.

La informacion publicada por el autor de esta conversion es minima: no se documentan licencia, idiomas soportados, longitud de contexto ni resultados de benchmarks propios. Todos los datos tecnicos disponibles provienen de la model card de cuantizacion y de las fichas de modelos hermanos de la misma familia alojadas en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer causal (familia Qwen3.6, tipo declarado qwen3_5) |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits, cuantizacion mixta oQ, group size 64 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |
| Tamano del repositorio | 20,5 GB |
| Libreria de inferencia | MLX |
| Version de herramienta de cuantizacion | oMLX v0.7.0.dev4 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso perteneciente a la familia Qwen3.6 (el campo model type del repositorio indica qwen3_5). El modelo original del que deriva esta conversion es un fine-tune y merge multi-etapa de Qwen3.6-27B realizado por DavidAU, que combina varios modelos mediante fusion de pesos y ajuste posterior. El nombre incluye etiquetas como "Fable-Fusion", "711", "Uncensored", "Heretic" y "NM-DAU", que en la nomenclatura habitual de DavidAU indican el proceso de fusion, el umbral de ARC-C alcanzado y el caracter abliterated del modelo.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO especificas para esta variante. Tampoco se documenta ninguna innovacion arquitectonica propia. La unica intervencion tecnica documentada en esta publicacion es la cuantizacion mixta de 5 bits realizada con oQ, que asigna distinta precision a distintas capas del modelo para preservar calidad frente a una cuantizacion uniforme. Cabe senalar una discrepancia: el nombre del repositorio contiene "oQ6_0e" mientras que la model card y las etiquetas indican 5 bits.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.6-27B, orientado a tareas de razonamiento y conocimiento general.
- Modelo "uncensored": las capas de rechazo estan reducidas, por lo que responde a peticiones que los modelos alineados convencionales suelen declinar.
- Capacidades de codigo y matematicas: no confirmadas explicitamente en la informacion disponible, aunque esperables por herencia de la familia Qwen3.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidad especial: no disponible (la variante "-text" del nombre sugiere que se trata unicamente de texto, sin vision ni audio).

## Casos de uso

- Inferencia local en Apple Silicon: es el caso de uso principal, ya que el formato MLX safetensors y los 20,5 GB de pesos permiten ejecutar el modelo en Macs con memoria unificada suficiente, usando librerias compatibles con MLX en lugar de CUDA.
- Generacion de texto creativo sin filtros: el caracter abliterated lo hace adecuado para escritura de ficcion, guiones o narrativa que requiera tratar temas que los modelos alineados rechazan.
- Experimentacion e investigacion sobre alineacion: util para estudiar el comportamiento de modelos con los rechazos reducidos y compararlo con el modelo base alineado.
- Prototipado rapido en entornos macOS: para desarrolladores que trabajan en Mac y quieren probar localmente un modelo de ~27 B sin depender de servicios en la nube.
- Tareas de razonamiento general en local: su tamano (27 B densos) lo situa por encima de modelos de 7-14 B en tareas de conocimiento y logica, con la ventaja de no enviar datos a terceros.
- Evaluacion comparativa de cuantizaciones: sirve para medir la perdida de calidad de la cuantizacion mixta oQ de 5 bits frente a las variantes de 4 y 8 bits de la misma familia.
- Base para ajuste fino adicional: al ser safetensors, los pesos pueden reutilizarse como punto de partida para nuevos ajustes, siempre que la licencia lo permita (no confirmada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversion MLX concreta. Los unicos datos numericos encontrados corresponden a modelos hermanos de la misma familia (Qwen3.6-27B-Fable-Fusion-711 de DavidAU) y se refieren a la tarea ARC-C, no a esta cuantizacion especifica:

| Modelo | Benchmark | Precision | Resultado |
|---|---|---|---|
| DavidAU/...-NM-DAU-MTP (familia) | ARC-C | 8 bits | 0,711 |
| DavidAU/...-NM-DAU-MTP (familia) | ARC-C | 4 bits | 0,701 |
| DavidAU/...-NEO-MAX-MTP-GGUF (familia) | ARC-C | 8 bits | 0,711 |
| DavidAU/...-NEO-MAX-MTP-GGUF (familia) | ARC-C | 4 bits | 0,701 |

Estos valores corresponden a la familia de origen y no deben atribuirse sin verificacion a la cuantizacion MLX de 5 bits de Johneeee, que no aporta mediciones propias.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 20,5 GB solo para los pesos, mas el overhead del runtime y la cache KV. En la practica se recomienda un minimo de 24-32 GB de memoria unificada.
- GPU compatibles: al ser formato MLX, esta orientado a Apple Silicon (series M1, M2, M3 y M4, especialmente variantes Pro, Max y Ultra). No es directamente ejecutable en CUDA sin conversion previa.
- Cabria en GPU de consumo?: no en su formato MLX nativo. Para GPU NVIDIA seria necesario convertir los pesos a otro formato (por ejemplo GGUF o safetensors para vLLM), con el coste y la perdida de calidad que ello implica.
- Memoria en Mac: viable en equipos con 32 GB o mas de memoria unificada; ajustado en configuraciones de 24 GB.
- Opciones de despliegue: MLX (mlx-lm, mlx_lm.server), LM Studio y otras aplicaciones que soporten modelos MLX. No se documenta soporte para vLLM, TGI, llama.cpp o Ollama en su formato actual.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este modelo (Johneeee, oQ6_0e-text) | 26,9 B | denso, cuantizado 5 bits | no disponible | no disponible | MLX safetensors | Conversion MLX para Apple Silicon |
| Qwen3.6-27B (base) | ~27 B | denso | no disponible | no disponible en esta busqueda | safetensors | Modelo base sin ajuste |
| Qwen3.6-35B-A3B (base) | 35 B (3 B activos) | MoE | no disponible | no disponible en esta busqueda | safetensors | Alternativa MoE del mismo fabricante |
| DavidAU/...-NM-DAU-MTP | ~27 B | denso | no disponible | no disponible | varios (GGUF/safetensors) | Fine-tune de origen, ARC-C 0,711/0,701 |

Los datos de contexto, licencia y rendimiento de los modelos de comparacion no estan confirmados en la informacion disponible, por lo que la comparativa cuantitativa no puede completarse.

## Limitaciones y advertencias

- Sesgo y alineacion: al ser un modelo "uncensored"/abliterated, carece de parte de los mecanismos de rechazo del modelo base, lo que aumenta el riesgo de generar contenido ofensivo, danino o inapropiado. No es recomendable en aplicaciones de cara al publico sin filtros adicionales.
- Alucinacion: riesgo no cuantificado; no se han publicado evaluaciones de fidelidad para esta variante.
- Contexto e idiomas: se desconoce la longitud de contexto real y los idiomas soportados, lo que impide garantizar su comportamiento en produccion multilingue.
- Licencia: no disponible. La licencia del modelo base o del fine-tune no se declara en esta publicacion, lo que genera incertidumbre sobre el uso comercial. Debe verificarse en los repositorios de origen antes de cualquier despliegue productivo.
- Cuantizacion: la cuantizacion de 5 bits introduce perdida de calidad respecto a los pesos originales. No hay mediciones que cuantifiquen esa degradacion en esta conversion.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes, y no aporta benchmarks propios; no hay validacion externa de su comportamiento.
- Discrepancia de nomenclatura: el nombre indica "oQ6" pero la model card y las etiquetas indican 5 bits y group size 64, lo que puede generar confusion al seleccionar el archivo correcto.
- Portabilidad: el formato MLX limita su uso a Apple Silicon; migrarlo a otros entornos exige reconversion y puede alterar el comportamiento.
- Fecha: el repositorio figura creado el 2026-09-28, fecha que conviene contrastar por si se trata de un error de metadatos.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/Johneeee/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-oQ6_0e-text
- Variante oQ5e: https://huggingface.co/Johneeee/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-oQ5e
- Variante oQ5e-mtp: https://huggingface.co/Johneeee/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-oQ5e-mtp
- Modelo de origen (DavidAU, MTP): https://featherless.ai/models/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP
- Ficha en aimodels.fyi (MTP): https://www.aimodels.fyi/models/huggingFace/qwen3.6-27b-fable-fusion-711-uncensored-heretic-nm-dau-mtp-davidau
- Ficha en aimodels.fyi (NEO-MAX-MTP-GGUF): https://www.aimodels.fyi/models/huggingFace/qwen3.6-27b-fable-fusion-711-uncensored-heretic-nm-dau-neo-max-mtp-gguf-davidau
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
