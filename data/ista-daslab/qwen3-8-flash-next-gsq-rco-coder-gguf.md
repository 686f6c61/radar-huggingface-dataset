# ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF

## Resumen

Qwen3.8-Flash-Next GSQ-RCO Coder es una version comprimida y orientada a codigo del modelo Qwen3.8-Flash-Next de Qwen, publicada por ISTA-DASLab (Institute of Science and Technology Austria, grupo DASLab). El modelo aplica dos tecnicas complementarias de compresion: poda de expertos (se eliminan la mitad de los 512 expertos enrutados por capa) y cuantizacion mixta a 3,5 bits por peso de los pesos retenidos. El resultado es un modelo MoE de 176,9B parametros originales que ocupa 58,4 GB en formato GGUF, frente a 354 GB en BF16, con un working set residente de solo 29,6 GB.

La relevancia practica es que permite servir un modelo de casi 177B parametros en una unica GPU de 32 GB, manteniendo el 95,7% del rendimiento en SWE-bench Verified y el 100% en LiveCodeBench v6 respecto al modelo base BF16. La compresion esta dirigida deliberadamente a codigo, uso agentico de herramientas, vision y razonamiento espacial, por lo que la degradacion fuera de esos dominios es un coste aceptado del metodo.

El modelo conserva la pipeline image-text-to-text del modelo base, es decir, mantiene capacidad multimodal. La licencia es Apache 2.0. Esta es una release experimental y el autor solicita feedback, en particular sobre capacidades no representadas en la mezcla de calibracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, 48 capas, 512 expertos por capa con 10 activos por token |
| Parametros totales | 176,9B en el modelo base; 116.514.464.640 segun safetensors del repo (tras poda) |
| Parametros activos | 10 expertos por token (numero exacto de parametros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF a 3,5 bpw en los pesos retenidos; tasa efectiva de 1,89 bits por parametro del transformer original |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (multi-shard; el primer shard contiene los cambios de la revision de octubre de 2026) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 48 capas, 512 expertos enrutados por capa y 10 expertos activos por token; los expertos concentran la inmensa mayoria de los parametros mientras solo una fraccion se ejecuta en cada token. Sobre esa arquitectura, ISTA-DASLab aplica poda de expertos: se eliminan expertos completos del modelo, lo que reduce el tamano del fichero y la memoria residente y restringe el router a un pool menor. Esto es distinto de la cuantizacion, que conserva todos los parametros y reduce la precision de almacenamiento; ambas tecnicas se combinan aqui (50% de expertos eliminados y pesos restantes a 3,5 bpw).

La seleccion de expertos se realizo con RCO (paper arXiv:2605.00649, codigo en github.com/IST-DASLab/RCO), optimizando la divergencia KL entre el modelo podado y el no podado sobre datos de calibracion, en lugar de ordenar expertos por una heuristica de importancia. Dado que los expertos especializan, la importancia no es una propiedad intrinseca sino relativa a la distribucion de entradas, que viene dada por los datos de calibracion; por tanto, la mezcla de calibracion determina que capacidades sobreviven. El formato GGUF impone una restriccion relevante: almacena un unico numero de expertos para todo el modelo, de modo que cada capa debe retener la misma cantidad. La cuantizacion usa GSQ (paper arXiv:2604.18556, codigo en github.com/IST-DASLab/GSQ). Los detalles sobre volumen de tokens de entrenamiento y uso de RLHF/DPO no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de codigo: rendimiento mantenido en LiveCodeBench v6 al nivel del base BF16 (87,43).
- Razonamiento agentico multi-paso sobre repositorios reales: SWE-bench Verified con el 95,7% del rendimiento base.
- Uso de herramientas y trayectorias agenticas prolongadas (evaluado via SWE-bench Verified).
- Vision: el modelo conserva la pipeline image-text-to-text del base.
- Razonamiento espacial: dominio explicitamente retenido en la mezcla de calibracion.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo de razonamiento: todas las metricas de la model card se midieron a "xhigh reasoning effort", lo que implica un modo de razonamiento configurable.

## Casos de uso

- Generacion de codigo en produccion: el modelo mantiene el 100% del rendimiento del base en LiveCodeBench v6 con 58,4 GB de fichero, lo que permite integrarlo en pipelines de revision y sintesis de codigo con una sola GPU de 32 GB.
- Agentes de resolucion de incidencias: SWE-bench Verified mide trayectorias agenticas extendidas sobre repositorios reales y el modelo retiene el 95,7% del base, por lo que es adecuado para automatizar parches y correcciones en bases de codigo existentes.
- Asistente de programacion con imagenes: al conservar image-text-to-text, puede recibir capturas de pantalla de errores, diagramas de arquitectura o UI y generar codigo o explicaciones a partir de ellas.
- Despliegue en hardware limitado: con 29,6 GB de working set residente (el shard n-gram puede servirse desde disco), permite servir un modelo de 177B parametros en una unica aceleradora de 32 GB en lugar de requerir 354 GB en BF16.
- Razonamiento espacial asistido: la mezcla de calibracion retiene explicitamente capacidades de razonamiento espacial, util en tareas que combinan comprension de imagenes con razonamiento geometrico o de layout.
- Entornos de desarrollo con presupuesto de memoria ajustado: el formato GGUF con shards permite distribuir el modelo y ajustar el consumo de memoria por debajo del limite de una GPU consumer de gama alta.
- Evaluacion e investigacion en compresion: al ser una release experimental con papers y codigo publicos (GSQ y RCO), sirve como referencia reproducible para estudiar el efecto de la poda de expertos dirigida por calibracion.

## Benchmarks y rendimiento

| Modelo | SWE-bench Verified | LiveCodeBench v6 |
|---|---|---|
| BF16 base (354 GB) | 82,80 | 87,43 |
| GSQ-RCO Coder (58,4 GB) | 79,20 | 87,43 |
| Retenido | 95,7% | 100,0% |

Todas las cifras fueron medidas a "xhigh reasoning effort". La revision de octubre de 2026 redujo el looping y mejoro el rendimiento: SWE-bench Verified paso de 75,60 a 79,20 y LiveCodeBench v6 de 86,28 a 87,43. La brecha entre ambas metricas se atribuye a que las tareas multi-paso sostenidas acumulan error entre turnos y toleran peor la reduccion de capacidad que la generacion de codigo de un solo problema.

## Requisitos de hardware

- VRAM estimada: 58,4 GB de fichero total; 29,6 GB de working set que debe residir en memoria (el shard n-gram es una tabla de busqueda y puede servirse desde disco).
- GPU recomendadas: una unica aceleradora de 32 GB es suficiente para el working set residente; GPU de 48 GB o 80 GB (A100, H100) permiten mayor margen y mayor lote.
- GPU consumer: cabe en tarjetas de 32 GB; en tarjetas de 24 GB el working set residente de 29,6 GB excede la capacidad y requiere offload o ajustes.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; el tag endpoints_compatible sugiere compatibilidad con endpoints de inferencia. vLLM y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | LiveCodeBench v6 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GSQ-RCO Coder (este) | 176,9B base, 50% expertos podados | no disponible | 79,20 | 87,43 | Apache 2.0 | GGUF, 58,4 GB |
| Qwen3.8-Flash-Next BF16 (base) | 176,9B | no disponible | 82,80 | 87,43 | Apache 2.0 | BF16, 354 GB |
| GSQ-RCO sin poda (release del mismo autor) | 176,9B | no disponible | no disponible | no disponible | Apache 2.0 | GGUF |

El autor indica que, para uso generalista, la release GSQ-RCO sin poda es la opcion adecuada, ya que la poda dirigida sacrifica capacidades fuera de codigo, uso agentico, vision y razonamiento espacial. Otros modelos comparables de la misma categoria no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La eliminacion del 50% de los expertos degrada necesariamente capacidades fuera de la mezcla de calibracion (codigo, uso agentico de herramientas, vision y razonamiento espacial); el autor acepta explicitamente este coste.
- La calidad en tareas generalistas es inferior a la del modelo base y a la de la release sin poda; no se recomienda para uso general.
- Las tareas agenticas multi-paso acumulan error entre turnos: SWE-bench Verified retiene el 95,7% frente al 100% en LiveCodeBench v6.
- Existe riesgo de alucinacion y de looping; la revision de octubre de 2026 se publico precisamente para reducir el looping.
- La mezcla de calibracion determina que capacidades sobreviven; capacidades no representadas en ella pueden haberse degradado de forma no medida.
- Idiomas soportados y contexto maximo no estan documentados en la informacion disponible, lo que limita la planificacion de despliegues multilingues o de contexto largo.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-Flash-Next.
- Release experimental: el autor solicita feedback y el modelo puede cambiar; si se descargo una build anterior, hay que volver a descargar el primer shard.
- El modelo es GGUF de un unico numero de expertos por capa impuesto por el formato, lo que restringe estrategias de poda no uniformes.

## Enlaces

- Hugging Face: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Release sin poda: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Paper GSQ: https://arxiv.org/abs/2604.18556
- Paper RCO: https://arxiv.org/abs/2605.00649
- Codigo GSQ: https://github.com/IST-DASLab/GSQ
- Codigo RCO: https://github.com/IST-DASLab/RCO
- GitHub DASLab: https://github.com/IST-DASLab
