# jkim96/Magistral-Small-2506-DASHQ-Q2-GGUF

## Resumen

Este repositorio contiene una coleccion de ficheros GGUF de 2 bits generados a partir de `mistralai/Magistral-Small-2506` mediante la tecnica de cuantizacion DASH-Q, desarrollada por JaeminK. El modelo base es un transformer denso de 23.572.403.200 parametros (aproximadamente 24B) publicado por Mistral AI, y este repositorio es exclusivamente una redistribucion cuantizada del mismo, sin reentrenamiento ni modificacion de los pesos mas alla de la compresion numerica. La relevancia de esta publicacion radica en que DASH-Q consigue reducir el modelo hasta 6,76 GB manteniendo una perplejidad muy inferior a la de las cuantizaciones de 2 bits convencionales de llama.cpp y de las versiones UD de unsloth.

El autor ofrece cuatro variantes de 2 bits (IQ2_XXS, IQ2_XS, IQ2_M y Q2_K_XL) que emplean unicamente tipos de tensor estandar de llama.cpp, de modo que cargan en cualquier build reciente de la herramienta sin necesidad de parches. El objetivo practico es permitir la ejecucion de un modelo de ~24B en hardware con VRAM muy limitada, incluidas GPUs de consumo, a costa de una degradacion de calidad que, segun los datos de perplejidad aportados, es sustancialmente menor que la de las alternativas equivalentes en tamano.

La ficha del autor solo documenta metricas de perplejidad; no se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) ni especificaciones de contexto, idiomas o arquitectura detallada mas alla de la referencia al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base `mistralai/Magistral-Small-2506`) |
| Parametros totales | 23.572.403.200 |
| Parametros activos | no aplica (el modelo base es denso, no MoE; no se indica lo contrario) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS (2,29 bits/peso), IQ2_XS (2,60), IQ2_M (2,80), Q2_K_XL (3,10) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (llama.cpp) |

Variantes incluidas en el repositorio:

| Fichero | Tipo | Tamano | Bits por peso |
|---|---|---|---|
| `Magistral-Small-2506-DASHQ-IQ2_XXS.gguf` | IQ2_XXS | 6,76 GB | 2,29 |
| `Magistral-Small-2506-DASHQ-IQ2_XS.gguf` | IQ2_XS | 7,68 GB | 2,60 |
| `Magistral-Small-2506-DASHQ-IQ2_M.gguf` | IQ2_M | 8,25 GB | 2,80 |
| `Magistral-Small-2506-DASHQ-Q2_K_XL.gguf` | Q2_K_XL | 9,15 GB | 3,10 |

## Arquitectura y entrenamiento

Este repositorio no entrena ningun modelo: aplica cuantizacion post-entrenamiento sobre los pesos de `mistralai/Magistral-Small-2506`. La innovacion reside en el algoritmo DASH-Q, que genera ficheros con tipos de tensor estandar de llama.cpp (ninguno por encima de 4 bits) y utiliza una matriz de importancia (imatrix), lo que permite cargar los GGUF en cualquier build reciente sin soporte adicional. Los detalles de la arquitectura del modelo base (numero de capas, dimensiones, mecanismo de atencion, datos de entrenamiento, uso de RLHF/DPO) no se documentan en la informacion proporcionada y deben consultarse en la ficha del modelo original de Mistral AI.

El autor reporta que DASH-Q reduce drasticamente la degradacion de perplejidad frente a las cuantizaciones de referencia. A modo de ejemplo, en la variante IQ2_XXS, llama.cpp con imatrix alcanza una perplejidad de 30,73 en WikiText-2 y 70,62 en C4, mientras que DASH-Q obtiene 8,36 y 14,42 respectivamente con un tamano practicamente identico (6,76 GB frente a 6,55 GB). Esta mejora se mantiene en las cuatro variantes publicadas.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base (etiquetado como `conversational` y `text-generation`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que sugiere integracion en servicios de inferencia.
- Ejecucion local mediante llama.cpp, sin dependencias de hardware especifico mas alla de las soportadas por dicha herramienta.
- Capacidades especificas del modelo base (razonamiento, codigo, matematicas, tool calling, multilingue): no disponible en la informacion proporcionada.
- Soporte de modo "thinking" o razonamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en equipos con VRAM limitada: gracias a los 6,76 GB de la variante IQ2_XXS, el modelo puede ejecutarse en GPUs de consumo con 8 GB o menos usando offload parcial o completo, algo inviable con el modelo en precision original.
- Despliegue en portatiles y mini-PC: las variantes IQ2_XS (7,68 GB) e IQ2_M (8,25 GB) permiten llevar un modelo de ~24B a maquinas sin GPU dedicada de gama alta, usando llama.cpp con aceleracion parcial.
- Prototipado rapido y evaluacion de calidad: al ofrecer cuatro niveles de compresion, permite al desarrollador medir el compromiso entre tamano y calidad (via perplejidad) antes de decidir una variante para produccion.
- Servicio de chat conversacional autoalojado: la variante Q2_K_XL (9,15 GB) con la menor perplejidad del conjunto es la candidata mas razonable para un endpoint conversacional en produccion sobre una unica GPU de gama media.
- Experimentacion en entornos educativos o de investigacion con presupuesto de hardware muy reducido, donde reproducir un modelo de 24B en precision completa no es factible.
- Comparacion metodologica de tecnicas de cuantizacion: el repositorio incluye metricas frente a llama.cpp con imatrix y a las versiones UD de unsloth, lo que sirve como referencia para evaluar algoritmos de compresion.

## Benchmarks y rendimiento

El autor unicamente publica resultados de perplejidad (`llama-perplexity`, contexto 2048; WikiText-2 test y C4 validation con 256 secuencias de 2048 tokens). Menor es mejor.

| Tipo | Modelo | Tamano | WikiText-2 | C4 |
|---|---|---|---|---|
| IQ2_XXS | llama.cpp IQ2_XXS (imatrix) | 6,55 GB | 30,73 | 70,62 |
| IQ2_XXS | unsloth UD-IQ2_XXS | 6,75 GB | 28,64 | 61,90 |
| IQ2_XXS | DASH-Q IQ2_XXS | 6,76 GB | 8,36 | 14,42 |
| IQ2_XS | llama.cpp IQ2_XS (imatrix) | 7,21 GB | 18,79 | 39,47 |
| IQ2_XS | DASH-Q IQ2_XS | 7,68 GB | 7,39 | 12,59 |
| IQ2_M | llama.cpp IQ2_M (imatrix) | 8,11 GB | 11,47 | 21,10 |
| IQ2_M | unsloth UD-IQ2_M | 8,24 GB | 10,88 | 20,28 |
| IQ2_M | DASH-Q IQ2_M | 8,25 GB | 6,92 | 11,88 |
| Q2_K_XL | llama.cpp Q2_K (imatrix) | 8,89 GB | 8,34 | 13,89 |
| Q2_K_XL | unsloth UD-Q2_K_XL | 9,29 GB | 7,92 | 13,12 |
| Q2_K_XL | DASH-Q Q2_K_XL | 9,15 GB | 6,73 | 11,58 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 7 GB y 10 GB para los pesos en las variantes publicadas, mas el espacio para la cache KV, que depende del contexto configurado (no disponible el contexto maximo soportado).
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, y en GPUs profesionales (A100, H100) sobradamente.
- Caben en GPU de consumo: si, todas las variantes (desde 6,76 GB) son ejecutables en GPUs de 8 GB o mas; las de 6,76-7,68 GB podrian requerir offload parcial en GPUs de 8 GB si se usa contexto amplio.
- Opciones de despliegue: llama.cpp (formato nativo GGUF); el tag `endpoints_compatible` sugiere compatibilidad con servidores de endpoints. Otras herramientas (vLLM, TGI, Ollama) no se mencionan en la informacion disponible, aunque Ollama admite GGUF de llama.cpp en general.
- Latencia y throughput estimados: no disponible.
- Ejemplo de uso proporcionado por el autor:

```bash
llama-cli -m Magistral-Small-2506-DASHQ-Q2_K_XL.gguf -ngl 99 -c 8192
```

## Comparativa con modelos similares

Comparativa con las alternativas de cuantizacion de 2 bits mas directas, segun los datos de perplejidad del propio autor (WikiText-2, menor es mejor):

| Alternativa | Tamano (IQ2_XXS) | Tamano (Q2_K_XL) | WikiText-2 (IQ2_XXS) | WikiText-2 (Q2_K_XL) | Licencia |
|---|---|---|---|---|---|
| DASH-Q (este repo) | 6,76 GB | 9,15 GB | 8,36 | 6,73 | apache-2.0 |
| llama.cpp con imatrix | 6,55 GB | 8,89 GB | 30,73 | 8,34 | segun modelo base |
| unsloth UD | 6,75 GB | 9,29 GB | 28,64 | 7,92 | segun modelo base |

Comparativa con modelos de tamano similar en precision completa: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion de 2 bits implica perdida de calidad respecto al modelo original en precision completa, aunque los datos de perplejidad sugieren una degradacion notablemente menor que la de sus competidores.
- Sesgos conocidos: no disponible en la informacion proporcionada; deben evaluarse los del modelo base.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; previsiblemente superior al del modelo original debido a la compresion agresiva.
- Limitaciones de contexto o idioma: no disponible. La ficha no documenta ni la ventana de contexto maxima ni los idiomas soportados.
- Restricciones de licencia: apache-2.0, heredada del modelo base; permite uso comercial segun los terminos de dicha licencia. El autor indica explicitamente que se hereda la licencia de `mistralai/Magistral-Small-2506`.
- El repositorio no incluye benchmarks de tareas, por lo que no es posible garantizar el rendimiento en razonamiento, codigo o matematicas a partir de los datos publicados.
- Atributos de la ficha de HuggingFace (descargas 0, likes 0, sin idiomas declarados) indican un modelo recien publicado y sin validacion comunitaria; conviene tratarlo como experimental.
- Los detalles de arquitectura y entrenamiento del modelo base no se reproducen aqui y deben verificarse en la ficha original antes de usarlo en produccion.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/jkim96/Magistral-Small-2506-DASHQ-Q2-GGUF
- Repositorio DASH-Q en GitHub: https://github.com/JaeminK/dashq
- Modelo base: https://huggingface.co/mistralai/Magistral-Small-2506
