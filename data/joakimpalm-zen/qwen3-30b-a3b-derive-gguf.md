# Joakimpalm-Zen/Qwen3-30B-A3B-derive-GGUF

## Resumen

`Joakimpalm-Zen/Qwen3-30B-A3B-derive-GGUF` es una cuantizacion GGUF derivada del modelo `Qwen/Qwen3-30B-A3B` de Alibaba Qwen, publicada por el desarrollador independiente Joakim Palm (Joakimpalm-Zen) dentro de su proyecto Xyntetik, un motor de inferencia local orientado a hardware con recursos limitados. No se trata de un modelo nuevo entrenado desde cero, sino de una reescritura de precision mixta del archivo oficial `Qwen3-30B-A3B-Q8_0.gguf` generada con la herramienta `runner derive`, que redistribuye bits entre grupos de tensores para minimizar el error de reconstruccion respecto al modelo original en float32.

El resultado es un unico archivo GGUF de 17,1 GB (el 52,7 % del padre Q8_0, que ocupa 32,48 GB) que conserva la arquitectura Mixture of Experts del original: 30.532.122.624 parametros totales con activacion dispersa, lo que permite ejecutar un modelo de esa magnitud con un coste computacional por token muy inferior al de un denso equivalente. La receta combina cuantizacion `q4_0` como nivel alto y `q3_k` como nivel bajo, degradando a `q3_k` solo 11 grupos de tensores seleccionados por su baja relacion entre error de ida y vuelta y bytes ahorrados, guiados por una importance matrix calculada por bartowski.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa mas compacta y fiel que el `Q4_K_M` oficial de Qwen para despliegue local; por otro, expone una metodologia de evaluacion de fidelidad de cuantizaciones (KLD medio, top-1 cualificado por margen) que va mas alla de las metricas habituales de perplexity y que resulta util para quien necesite decidir entre archivos GGUF con criterio cuantitativo. La licencia es Apache 2.0 y el modelo esta pensado para inferencia conversacional en motores GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (Qwen3MoeForCausalLM) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | no disponible (el modelo base Qwen3-30B-A3B activa 3B, dato no confirmado en la informacion proporcionada para esta derivacion) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF de precision mixta: `q4_0` (nivel alto) y `q3_k` (nivel bajo, 11 grupos de tensores) |
| Idiomas soportados | no disponible (la model card solo menciona un corpus de calibracion en ingles con un pasaje en sueco) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo unico `Qwen3-30B-A3B-derive-sens-q4_0-q3_k.gguf`, 17.106.040.320 bytes) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de tipo Mixture of Experts con atencion por cabezas agrupadas (GQA) y capas de expertos enrutados por token, implementado en la clase `Qwen3MoeForCausalLM`. Esta ficha no documenta el entrenamiento original de Qwen3-30B-A3B (numero de tokens, composicion del dataset, fases de RLHF o DPO), porque esa informacion no forma parte del material proporcionado; lo que si se describe con detalle es el proceso de derivacion.

La derivacion se ejecuto con el comando `runner derive` sobre el archivo oficial `Qwen3-30B-A3B-Q8_0.gguf`, con un objetivo de tamano de 17.106.040.320 bytes, una importance matrix de bartowski (`Qwen_Qwen3-30B-A3B.imatrix`, Apache 2.0, calculada sobre su dataset de calibracion) y la opcion `--match _exps` para tratar de forma coherente los tensores de expertos. La herramienta selecciona que grupos de tensores bajan de `q4_0` a `q3_k` minimizando el error de reconstruccion por byte ahorrado, y emplea `--upcast-at-use` para elevar los pesos a mayor precision durante el calculo. La evaluacion de fidelidad se realizo contra el modelo del publicador en float32 (commit `ad44e777bcd18fa416d9da3bd8f70d33ebb85d39`, pesos BF16 elevados en uso), sobre 2000 posiciones de un corpus de referencia (`gold-corpus-2k.txt`: documentacion tecnica en ingles con codigo, prosa en ingles y un pasaje en sueco).

## Capacidades

- Generacion de texto conversacional en motores de inferencia GGUF, heredada del modelo base Qwen3-30B-A3B.
- Razonamiento y generacion de codigo: el corpus de calibracion incluye documentacion tecnica con codigo, aunque no se aportan benchmarks de tarea que cuantifiquen el rendimiento en HumanEval o similares.
- Capacidad de activacion dispersa por token gracias a la arquitectura MoE, que reduce el coste por token frente a un denso de 30B.
- Etiquetado como `conversational` y `endpoints_compatible` en Hugging Face, lo que indica compatibilidad con endpoints de inferencia estandar.
- Soporte multilingue: no disponible de forma verificada; la unica evidencia es un pasaje en sueco dentro del corpus de evaluacion.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo con VRAM limitada: con 17,1 GB en disco, el archivo cabe en GPUs de 24 GB (RTX 4090, A10G, L4 de 24 GB) y permite ejecutar un MoE de 30B parametros totales donde un denso equivalente no cabria en cuantizaciones comparables.
- Sustitucion del `Q4_K_M` oficial en pipelines existentes: al ser un GGUF estandar compatible con llama.cpp y derivados, puede reemplazar al archivo oficial de Qwen (18,56 GB) reduciendo 1,45 GB de disco y mejorando la fidelidad medida (KLD 0,0290 frente a 0,0909).
- Evaluacion de calidad de cuantizaciones en investigacion: el archivo incluye registros `.derive.json` y `.quant.json` con hashes, receta y mediciones, lo que lo convierte en un caso reproducible para estudiar tecnicas de cuantizacion mixta guiada por importance matrix.
- Servicio conversacional de bajo coste: la naturaleza MoE reduce el computo por token, adecuado para endpoints de chat con concurrencia moderada en una sola GPU.
- Procesamiento de documentacion tecnica y codigo: el corpus de calibracion esta sesgado hacia documentacion tecnica en ingles, lo que sugiere un comportamiento razonable en tareas de analisis de repositorios y explicacion de codigo, aunque sin benchmarks que lo confirmen.
- Experimentacion con motores alternativos: el autor mantiene Xyntetik, un motor de inferencia y stack de agentes para hardware restringido, por lo que este archivo sirve como banco de pruebas para comparar motores GGUF en fidelidad y rendimiento.
- Base para agentes locales con tool calling: no disponible de forma verificada; requeriria validar el soporte de plantillas de herramientas del modelo base en el motor elegido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card lo indica explicitamente: "No task benchmark was run". Lo que si se aporta es una evaluacion de fidelidad frente al modelo de referencia en float32, sobre 2000 posiciones del corpus `gold-corpus-2k.txt`:

| Referencia | Posiciones | KLD medio | KLD mediana | KLD maximo | Top-1 | Top-1 cualificado por margen |
|---|---:|---:|---:|---:|---:|---:|
| Publicador, float32 | 2000 | 0,0290 | 0,0134 | 1,1791 | 92,90 % | 99,01 % de 1519 |

Comparativa de fidelidad entre archivos GGUF del mismo modelo, medida contra la misma referencia y en las mismas posiciones:

| Archivo | Tamano | KLD medio | Top-1 cualificado por margen | Veredicto |
|---|---:|---:|---:|---|
| `Qwen3-30B-A3B-expq4_0-attnq8_0.gguf` (selectivo manual) | 17,99 GB | 0,0279 | 98,82 % | Pasa el umbral |
| Este archivo (`derive-sens-q4_0-q3_k`) | 17,11 GB | 0,0290 | 99,01 % | Pasa el umbral |
| `Qwen3-30B-A3B-Q4_K_M.gguf` (oficial de Qwen) | 18,56 GB | 0,0909 | 94,80 % | No pasa el umbral |

El umbral declarado por el autor es un KLD medio de como maximo 0,05 y un top-1 cualificado por margen de al menos el 97 %. Las pruebas pareadas indican que la diferencia de KLD con el archivo selectivo manual es significativa (Wilcoxon p = 0,02) pero la de top-1 cualificado es un empate (McNemar p = 0,68), mientras que frente al `Q4_K_M` oficial las diferencias son muy significativas en ambas metricas (p = 1,9e-235 y p = 1,4e-13).

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo pesa 17,11 GB; con overhead de contexto y buffers de computo, se recomienda un minimo de 20-24 GB de VRAM para carga completa en GPU.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A10G (24 GB), L4 (24 GB), A100 40 GB y H100 para mayor throughput y contextos largos.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 con 24 GB; en GPUs de 16 GB requeriria descarga parcial de capas a CPU o reduccion adicional de contexto.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp), asi como el motor propio del autor, Xyntetik runner. La compatibilidad con vLLM o TGI no esta confirmada en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles. La arquitectura MoE reduce el computo por token, pero no se aportan mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este archivo (derivacion de Qwen3-30B-A3B) | 30,53 B (MoE) | no disponible | GGUF mixto q4_0/q3_k, 17,11 GB | Apache 2.0 | KLD 0,0290 frente a float32; pasa el umbral del autor |
| Qwen3-30B-A3B-Q4_K_M oficial | 30,53 B (MoE) | no disponible | GGUF Q4_K_M, 18,56 GB | Apache 2.0 | KLD 0,0909; no pasa el umbral del autor |
| Qwen3-30B-A3B-expq4_0-attnq8_0 (selectivo manual) | 30,53 B (MoE) | no disponible | GGUF selectivo, 17,99 GB | Apache 2.0 | KLD 0,0279; top-1 cualificado 98,82 % |
| Qwen3-30B-A3B-Q8_0 (padre) | 30,53 B (MoE) | no disponible | GGUF Q8_0, 32,48 GB | Apache 2.0 | Referencia de partida de la derivacion |

No se dispone de datos para comparar con modelos de otros fabricantes de tamano o categoria equivalente dentro de la informacion proporcionada.

## Limitaciones y advertencias

- La evaluacion de fidelidad se realizo sobre un unico corpus de 2000 posiciones, mayoritariamente en ingles tecnico con codigo y un pasaje en sueco; no hay garantia de que el comportamiento se mantenga en otros dominios o idiomas.
- No se ejecuto ningun benchmark de tarea, por lo que no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni en tareas agenticas.
- El top-1 sin cualificar por margen es del 92,90 %: en aproximadamente una de cada 14 posiciones el siguiente token mas probable difiere del modelo de referencia en float32. Aunque la metrica cualificada por margen es alta, existe deriva medible en la distribucion.
- La cuantizacion mixta incluye grupos en `q3_k`, lo que puede degradar de forma desigual ciertos tensores; la seleccion se optimizo por error medio, no por caso de uso.
- La model card no declara el contexto maximo soportado ni los idiomas oficiales del archivo derivado; conviene verificar ambos contra la documentacion del modelo base Qwen3-30B-A3B.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion proporcionada; se heredan los del modelo base, no documentados aqui.
- Licencia Apache 2.0 declarada por el autor de la derivacion, no por el archivo padre (que no declara `general.license`); para uso comercial conviene revisar tambien la licencia del modelo base Qwen3-30B-A3B.
- El modelo tiene un unico archivo y 68 descargas en el momento de la consulta, con nula validacion comunitaria; para produccion se recomienda validar con pruebas propias antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Joakimpalm-Zen/Qwen3-30B-A3B-derive-GGUF
- Perfil del autor: https://huggingface.co/Joakimpalm-Zen
- Derivacion selectiva manual del mismo autor: https://huggingface.co/Joakimpalm-Zen/Qwen3-30B-A3B-selective-attnQ8_0-expQ4_0-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
- GGUF oficial de Qwen: https://huggingface.co/Qwen/Qwen3-30B-A3B-GGUF
- Importance matrix de bartowski: https://huggingface.co/bartowski/Qwen_Qwen3-30B-A3B-GGUF
- Dataset de calibracion de bartowski: https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
