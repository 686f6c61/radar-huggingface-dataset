# RedHatAI/Qwen3.8-27B-speculator.dspark

## Resumen

RedHatAI/Qwen3.8-27B-speculator.dspark es un modelo borrador (draft model) para decodificacion especulativa, desarrollado por Red Hat AI como acelerador del modelo verificador Qwen/Qwen3.8-27B. No es un modelo de lenguaje autonomo: se trata de una cabeza predictora que propone hasta 8 tokens por paso de decodificacion, que el verificador valida despues en un unico forward pass. Su proposito es reducir la latencia por token y aumentar el throughput de Qwen3.8-27B sin modificar la distribucion de salida del modelo original.

Tecnicamente implementa el algoritmo DSpark, una extension de DFlash que anade un cabezal Markov (rango 256) para modelar dependencias entre tokens dentro del bloque y un cabezal de confianza que predice la aceptacion por posicion. El borrador es un backbone estilo Qwen3 de solo 5 capas y 1.988.431.617 parametros (aproximadamente 1,99 mil millones), que consume los hidden states auxiliares de las capas 4, 12, 20, 28, 36, 44, 52 y 60 del verificador. La longitud de contexto configurada es de 262.144 tokens, y la evaluacion de aceptacion en MRCR 8-Needle se ha realizado con prompts de hasta mas de 1,1 millones de tokens.

Su relevancia es practica: la decodificacion especulativa es una de las tecnicas mas extendidas para servir modelos grandes con latencia baja, y este checkpoint esta publicado especificamente para el stack vLLM, con licencia Apache 2.0 y una integracion de una sola linea mediante `--speculative-config`. Los ratios de aceptacion publicados (longitud de aceptacion entre 3,76 y 5,74 tokens segun tarea) determinan la ganancia real de velocidad, que varia notablemente por dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSparkDraftModel (borrador especulativo con backbone estilo Qwen3 de 5 capas) |
| Parametros totales | 1.988.431.617 (aproximadamente 1,99 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens configurados; evaluado con exito hasta 1.114.783 tokens en el verificador |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bfloat16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (hereda el tokenizador y la cobertura linguistica del verificador Qwen/Qwen3.8-27B; vocabulario del borrador de 248.320 entradas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, bfloat16 |
| Modelo base (verificador) | Qwen/Qwen3.8-27B |
| Arquitectura del verificador | Qwen3_5ForConditionalGeneration |
| Algoritmo especulativo | DSpark |
| Longitud maxima de borrador | 8 tokens |
| Capas auxiliares del verificador | 4, 12, 20, 28, 36, 44, 52 y 60 |
| Cabezal Markov | vanilla, rango 256 |
| Cabezal de confianza | habilitado, con caracteristicas Markov |
| Longitud de secuencia de entrenamiento | 8.192 tokens |
| Maximos anchors | 1.024 |
| Token de mascara (mask token id) | 248.077 |
| Version y fecha | 1.0, publicada el 2026-09-21 |
| Tamano del repositorio | 24,4 GB |
| Libreria | speculators (0.8.0.dev221) |

## Arquitectura y entrenamiento

El modelo es un `DSparkDraftModel` acoplado a un verificador denso `Qwen3_5ForConditionalGeneration`. La generacion especulativa funciona en dos fases: el borrador propone hasta 8 tokens candidatos por paso, y el verificador los procesa en paralelo y acepta el prefijo correcto. DSpark amplia DFlash con dos componentes: un cabezal Markov de rango 256 que modela dependencias entre tokens dentro del bloque especulado (en lugar de tratarlos como independientes) y un cabezal de confianza que estima la probabilidad de aceptacion en cada posicion. El borrador consume los hidden states auxiliares de ocho capas distribuidas del verificador (4, 12, 20, 28, 36, 44, 52, 60), lo que le permite alinearse con representaciones intermedias y finales del modelo grande.

El entrenamiento partio de warm start sobre un checkpoint DSpark anterior para el mismo verificador y utilizo una version de Open PerfectBlend regenerada por Qwen3.8-27B: 1.739.710 ejemplos de 8.192 tokens con particion 99/1 entre entrenamiento y validacion, lo que equivale a aproximadamente 14.250 millones de tokens por epoch. La extraccion de hidden states se hizo con cuatro replicas data-parallel independientes de vLLM 0.29.0 (data-parallel 4, tensor-parallel 1) y el entrenamiento del borrador con cuatro rangos FSDP sobre 8 GPU NVIDIA H200 en total; la validacion se ejecuto en una H100. El optimizador fue Muon con learning rate 0,001 y la funcion de perdida combinaba `ce: 0.1` y `tv: 0.9`. El checkpoint liberado corresponde al paso global 107.520, aproximadamente el 75% del run de una epoch planificado, con `sample_from_anchor=true` y hasta 1.024 anchors por secuencia. La validacion se realizo con vLLM 0.29.0 y commit de Speculators `876e2b6`.

## Capacidades

- Decodificacion especulativa: propone hasta 8 tokens por paso para el verificador Qwen/Qwen3.8-27B, con validacion posterior por parte de este.
- Prediccion de aceptacion por posicion mediante cabezal de confianza, lo que permite estimar cuantos tokens del bloque seran aceptados.
- Modelado de dependencias intra-bloque mediante cabezal Markov de rango 256.
- Consumo de representaciones intermedias del verificador en 8 capas (4 a 60), lo que alinea la propuesta con la distribucion del modelo grande.
- Rendimiento especifico por dominio medido en HumanEval, math_reasoning, qa, question, rag, summarization, tool_call, translation y writing.
- Soporte de contexto largo: ventana configurada de 262.144 tokens y aceptacion medida con prompts de mas de 1 millon de tokens.
- Integracion nativa con el stack vLLM mediante `--speculative-config` y la libreria Speculators.
- Plantilla de chat heredada del verificador; el servicio se expone a traves de `/chat/completions`.
- No genera texto de forma autonoma ni soporta tool calling por si mismo: todas esas capacidades residen en el verificador.
- Capacidades multilingues no declaradas explicitamente; el dato de aceptacion en la tarea de traduccion (longitud de aceptacion 4,55) es el unico indicio indirecto del catalogo de informacion disponible.

## Casos de uso

- Servicio de Qwen3.8-27B con latencia reducida: desplegar el verificador en vLLM con `--speculative-config` apuntando a este borrador permite reducir la latencia por token sin alterar las salidas del modelo grande, ya que la verificacion garantiza la misma distribucion.
- Asistentes de generacion de codigo: la tarea HumanEval obtiene una longitud de aceptacion de 4,42, por lo que el borrador resulta util en IDE asistidos, autocompletado y generacion de funciones donde el dominio del codigo es predecible.
- Razonamiento matematico en produccion: con una longitud de aceptacion de 5,74, es el dominio donde mas se aprovecha el borrador; encaja en pipelines de resolucion de problemas paso a paso y tutoria matematica.
- RAG sobre corpus extensos: la tarea rag alcanza 4,81 de longitud de aceptacion y el modelo soporta prompts largos, por lo que es adecuado para sistemas de preguntas y respuestas sobre documentacion tecnica o bases de conocimiento.
- Analisis de documentos de contexto muy largo: la evaluacion en MRCR 8-Needle mantiene longitudes de aceptacion entre 4,04 y 4,84 con prompts de hasta mas de 1 millon de tokens, lo que habilita procesamiento de expedientes, contratos o repositorios completos.
- Agentes con tool calling: la tarea tool_call obtiene 3,76, el valor mas bajo junto con writing; aun asi el borrador sigue siendo positivo en carga, por lo que es util en orquestadores de agentes donde se prima el throughput agregado.
- Traduccion automatizada y redaccion asistida: las tareas translation (4,55) y writing (3,77) muestran ganancias desiguales, utiles en servicios de traduccion por lotes donde la concurrencia alta compensa la menor tasa de aceptacion por posicion.
- Despliegue de alto throughput con batching: segun la model card, DSpark mantiene ventaja frente a MTP incluso a concurrencia 128, con menor latencia por token a medida que crece la carga, lo que lo hace idoneo para endpoints multiusuario.
- Resumen automatico de documentos: la tarea summarization obtiene 3,94 de longitud de aceptacion, suficiente para pipelines de resumen por lotes donde el coste dominante es el verificador.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de calidad (MMLU, GSM8K, HumanEval en puntuacion) porque el borrador no genera respuestas finales. Lo que se publica son tasas de aceptacion por posicion, que determinan la aceleracion efectiva.

Tasas de aceptacion por posicion, con 8 tokens especulativos y verificador denso Qwen/Qwen3.8-27B en vLLM 0.29.0:

| Dataset | Longitud de aceptacion | Pos 0 | Pos 1 | Pos 2 | Pos 3 | Pos 4 | Pos 5 | Pos 6 | Pos 7 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| HumanEval | 4,42 | 82,5% | 65,4% | 51,4% | 40,9% | 33,0% | 27,0% | 22,7% | 19,5% |
| math_reasoning | 5,74 | 89,6% | 79,9% | 70,1% | 61,2% | 53,7% | 45,9% | 39,6% | 33,8% |
| qa | 4,22 | 79,0% | 62,0% | 49,1% | 39,1% | 31,3% | 25,2% | 19,9% | 15,9% |
| question | 3,80 | 78,0% | 58,2% | 43,0% | 31,9% | 24,1% | 18,6% | 14,6% | 11,6% |
| rag | 4,81 | 83,9% | 69,6% | 57,3% | 47,4% | 39,4% | 32,9% | 27,3% | 22,9% |
| summarization | 3,94 | 81,8% | 63,3% | 48,1% | 35,2% | 25,3% | 18,1% | 12,8% | 9,4% |
| tool_call | 3,76 | 77,9% | 57,6% | 42,4% | 31,4% | 23,6% | 18,0% | 14,1% | 11,2% |
| translation | 4,55 | 83,4% | 68,1% | 55,5% | 44,6% | 35,7% | 28,7% | 22,2% | 17,3% |
| writing | 3,77 | 77,7% | 57,6% | 42,6% | 31,7% | 23,9% | 18,4% | 14,4% | 11,4% |

Aceptacion en contexto largo, medida sobre MRCR 8-Needle con 8 tokens especulativos:

| Longitud del prompt | Peticiones unicas | Longitud de aceptacion media |
|---|---:|---:|
| 4K–8K | 29 | 4,745 |
| 8K–16K | 24 | 4,041 |
| 16K–32K | 21 | 4,627 |
| 32K–65K | 25 | 4,484 |
| 65K–131K | 23 | 4,345 |
| 131K–262K | 26 | 4,843 |
| 262K–524K | 24 | 4,671 |
| 524K–1M | 38 | 4,400 |
| 1M+ | 14 | 4,297 |
| Total | 224 | 4,492 |

Longitud de prompt maxima exitosa registrada: 1.114.783 tokens.

Comparacion con MTP: la model card indica que DSpark ofrece sistematicamente mayor throughput y mejor interactividad que MTP con los mismos 8 tokens especulativos en HumanEval, razonamiento matematico y RAG. La ventaja es mayor con concurrencia baja o media (especialmente en razonamiento matematico) y se mantiene positiva a concurrencia 128, aunque se estrecha en RAG. No se publican cifras numericas de throughput ni de latencia en la informacion disponible.

## Requisitos de hardware

- VRAM del borrador: aproximadamente 4 GB en bfloat16 para los 1,99 mil millones de parametros, mas el coste de los buffers de hidden states auxiliares.
- VRAM del pipeline completo: el borrador debe cohabitar con el verificador Qwen/Qwen3.8-27B. El tamano exacto del verificador no se especifica en la informacion disponible; por su nomenclatura se situaria en el entorno de los 27.000 millones de parametros, lo que en bfloat16 supone aproximadamente 54 GB de pesos, mas cache KV.
- GPU recomendadas: la validacion oficial se hizo en 1x NVIDIA H100, lo que indica que una H100 de 80 GB es suficiente para verificador mas borrador en bfloat16 con lotes moderados. El entrenamiento se realizo en 8x NVIDIA H200 (4 GPU para extraccion de hidden states con vLLM y 4 rangos FSDP para el entrenamiento).
- GPU de consumo: el borrador por si solo cabe en una RTX 4090 o similar (aproximadamente 4 GB), pero no tiene utilidad sin el verificador; el pipeline completo no cabe en GPU de consumo convencionales.
- Opciones de despliegue: vLLM (version 0.29.0 en las evaluaciones publicadas) con `--speculative-config '{"model":"RedHatAI/Qwen3.8-27B-speculator.dspark","num_speculative_tokens":8,"method":"dspark"}'`. La libreria asociada es Speculators (0.8.0.dev221, commit `876e2b6`). No se documentan rutas de despliegue para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican valores absolutos. La model card solo afirma cualitativamente que DSpark supera a MTP en throughput e interactividad con los mismos 8 tokens especulativos, con ventaja mas acusada a concurrencia baja y media y menor latencia por token que MTP conforme aumenta la carga.

## Comparativa con modelos similares

La informacion disponible no incluye especificaciones tecnicas de otros borradores especulativos, por lo que buena parte de las celdas quedan como no disponibles. La comparacion se limita a los mecanismos citados en la propia model card.

| Modelo | Tipo | Parametros | Contexto | Licencia | Rendimiento comparado | Disponibilidad |
|---|---|---|---|---|---|---|
| RedHatAI/Qwen3.8-27B-speculator.dspark | Borrador especulativo DSpark para Qwen3.8-27B | 1.988.431.617 | 262.144 configurados; evaluado hasta 1.114.783 | Apache 2.0 | Referencia de la comparacion | 66 descargas y 2 likes en HuggingFace en la fecha de consulta |
| MTP (multi-token prediction) para Qwen3.8-27B | Borrador especulativo alternativo | no disponible | no disponible | no disponible | Inferior a DSpark en throughput e interactividad con 8 tokens especulativos, sin cifras publicadas | no disponible |
| DFlash para Qwen3.8-27B | Borrador especulativo predecesor | no disponible | no disponible | no disponible | DSpark lo extiende con cabezal Markov y cabezal de confianza; sin datos comparativos publicados | no disponible |

Para el resto de alternativas de decodificacion especulativa del ecosistema no se dispone de datos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere obligatoriamente el verificador Qwen/Qwen3.8-27B para producir texto. Cargarlo por separado no aporta ninguna funcionalidad de generacion.
- El rendimiento depende de la tarea: la longitud de aceptacion oscila entre 3,76 (tool_call) y 5,74 (math_reasoning). En tareas con baja aceptacion la ganancia de velocidad se reduce de forma notable.
- La calidad y el sesgo de las respuestas los determina el verificador, no el borrador, por lo que las advertencias eticas y de sesgo aplicables son las de Qwen/Qwen3.8-27B.
- Riesgo de alucinacion: el borrador no puede introducir tokens no validados por el verificador si el muestreo es correcto, pero configuraciones agresivas de decodificacion especulativa mal ajustadas pueden alterar el comportamiento del sistema.
- Checkpoint incompleto: el modelo liberado corresponde al paso global 107.520, aproximadamente el 75% del run de una epoch planificado, por lo que no representa el entrenamiento final previsto.
- Limitacion de contexto: la ventana configurada es de 262.144 tokens, aunque la evaluacion de aceptacion se extiende por encima de ese valor (hasta 1.114.783 tokens en el verificador); conviene no asumir que el borrador mantiene su comportamiento optimo mas alla de su longitud configurada.
- Idiomas: no se declara cobertura linguistica del borrador. El unico indicio es una longitud de aceptacion de 4,55 en la tarea de traduccion, insuficiente para garantizar un rendimiento uniforme en todos los idiomas del verificador.
- Licencia: el checkpoint se publica bajo Apache 2.0, pero su uso en produccion queda condicionado tambien por la licencia del modelo base Qwen/Qwen3.8-27B, que debe verificarse de forma independiente.
- Integracion: el repositorio usa `custom_code` y la libreria `speculators`, lo que implica dependencia de versiones concretas (vLLM 0.29.0 y Speculators 0.8.0.dev221 en las evaluaciones publicadas). Cambios de version pueden romper la compatibilidad.
- Adopcion muy baja en el momento de la consulta (66 descargas, 2 likes), lo que reduce la probabilidad de encontrar soporte de la comunidad ante problemas de despliegue.
- No hay resultados de benchmarks de calidad publicados, por lo que no es posible evaluar el impacto del borrador sobre la calidad final mas alla de los ratios de aceptacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RedHatAI/Qwen3.8-27B-speculator.dspark
- Modelo base verificado: https://huggingface.co/Qwen/Qwen3.8-27B
- Libreria Speculators: https://github.com/vllm-project/speculators
- Commit de Speculators usado en el entrenamiento: https://github.com/vllm-project/speculators/commit/876e2b6f2ec84725a63fe5de25355c3c66537563
- Dataset de entrenamiento (Open PerfectBlend): https://huggingface.co/datasets/mlabonne/open-perfectblend
- Grafica comparativa DSpark frente a MTP: https://cdn-uploads.huggingface.co/production/uploads/67f401f4bb5b52cdad90f9a7/voDTSDis5MscKy65-y-i-.png
