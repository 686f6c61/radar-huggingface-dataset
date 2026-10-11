# mradermacher/Ling-mini-2.0-GGUF

## Resumen

Este repositorio contiene cuantizaciones estaticas en formato GGUF del modelo Ling-mini-2.0, desarrollado originalmente por InclusionAI. El autor de la conversion es mradermacher, que publica los pesos cuantizados para su uso con llama.cpp y el ecosistema GGUF. Se trata, por tanto, de un artefacto derivado: no introduce entrenamiento nuevo, sino que transforma los pesos del modelo base (identificador `inclusionAI/Ling-mini-2.0`) en once variantes de cuantizacion que van desde Q2_K (6,2 GB) hasta Q8_0 (17,4 GB).

El modelo cuenta con 16.255.643.392 parametros segun los pesos reales del repositorio base, lo que lo situa en la franja de los 16B. La licencia declarada es MIT y el unico idioma declarado es el ingles (etiqueta `en`). La relevancia practica de este repositorio es que permite ejecutar un modelo de ese tamano en hardware de consumo o en servidores modestos mediante cuantizacion, algo imposible con los pesos completos en precision nativa.

La model card no documenta la arquitectura, la longitud de contexto, los datos de entrenamiento ni resultados de benchmarks del modelo base; toda esa informacion debe consultarse en el repositorio original de InclusionAI. Esta ficha recoge exclusivamente los datos verificables publicados en el repositorio de cuantizaciones y marca como "no disponible" todo aquello que no aparece en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no documentada en el repositorio de cuantizaciones; consultar el modelo base) |
| Parametros totales | 16.255.643.392 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); disponibles tambien cuantizaciones ponderadas/imatrix en el repositorio `mradermacher/Ling-mini-2.0-i1-GGUF` |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (transformers como libreria declarada) |

Tabla de cuantizaciones publicadas, con tamano de fichero declarado por el autor:

| Tipo | Tamano (GB) | Notas del autor |
|---|---:|---|
| Q2_K | 6,2 | |
| Q3_K_S | 7,3 | |
| Q3_K_M | 8,0 | calidad inferior |
| Q3_K_L | 8,6 | |
| IQ4_XS | 8,9 | |
| Q4_K_S | 9,4 | rapido, recomendado |
| Q4_K_M | 10,0 | rapido, recomendado |
| Q5_K_S | 11,4 | |
| Q5_K_M | 11,7 | |
| Q6_K | 13,5 | muy buena calidad |
| Q8_0 | 17,4 | rapido, mejor calidad |

Datos adicionales del repositorio: tamano total del repo 111,2 GB (incluye todas las cuantizaciones), 382 descargas, 1 like, fecha de creacion 2025-10-22 y ultima actualizacion 2026-10-10. Etiquetas declaradas: `transformers`, `gguf`, `en`, `base_model:inclusionAI/Ling-mini-2.0`, `base_model:quantized:inclusionAI/Ling-mini-2.0`, `license:mit`, `endpoints_compatible`, `region:us`, `conversational`.

## Arquitectura y entrenamiento

No disponible. La model card de este repositorio no describe la arquitectura del modelo base (no especifica si es un transformer denso, un mixture of experts, un modelo hibrido ni ninguna otra variante), ni detalla el numero de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco documenta innovaciones tecnicas asociadas.

Lo unico verificable en este repositorio es el proceso de cuantizacion: se trata de cuantizaciones estaticas generadas con `quantize_version: 2`, con `output_tensor_quantised: 1` y `convert_type: hf`, es decir, partiendo de pesos en formato Hugging Face convertidos a GGUF. El autor mantiene ademas una linea separada de cuantizaciones ponderadas con matriz de importancia (imatrix) bajo el identificador `Ling-mini-2.0-i1-GGUF`, que suele ofrecer mejor relacion calidad/tamano que las cuantizaciones estaticas equivalentes.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo base esta orientado a dialogos, pero no se detalla el formato de plantilla de chat empleado.
- Razonamiento, codigo, matematicas: no disponible. El repositorio no documenta capacidades especificas por dominio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma declarada (`en`). No se declaran otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible. La unica etiqueta funcional declarada es `conversational` y el repositorio no incluye ficheros de proyector multimodal (`skip_mmproj` no esta marcado, pero tampoco se publica ninguno).
- Compatibilidad de despliegue: los ficheros GGUF son compatibles con llama.cpp y con las herramientas que lo integran, y la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia compatibles con Hugging Face.

Para conocer las capacidades reales del modelo conviene consultar la model card del modelo base `inclusionAI/Ling-mini-2.0`, que no forma parte de la informacion proporcionada en esta ficha.

## Casos de uso

- Asistente conversacional autoalojado en ingles: la cuantizacion Q4_K_M (10,0 GB) permite desplegar un modelo de 16B en una unica GPU de 16-24 GB o incluso en CPU con RAM suficiente, manteniendo el modelo completamente dentro de la infraestructura propia y sin dependencia de APIs externas.
- Prototipado e investigacion en maquinas sin aceleradores de gama alta: las variantes Q2_K (6,2 GB) y Q3_K_S (7,3 GB) hacen viable probar el modelo en portatiles con GPU de 8-12 GB o en equipos solo con CPU, a costa de una perdida de calidad que el propio autor califica como "lower quality" en el caso de Q3_K_M.
- Evaluacion comparativa de cuantizaciones: el repositorio publica once variantes del mismo modelo, lo que permite medir de forma controlada el impacto de la cuantizacion en perplejidad y calidad de generacion sobre una tarea concreta antes de fijar una configuracion de produccion.
- Despliegue en el borde (edge) o en entornos con restricciones de memoria: con Q3_K_L (8,6 GB) o IQ4_XS (8,9 GB) el modelo cabe en tarjetas de 12 GB, habilitando asistentes locales en estaciones de trabajo o servidores pequenos.
- Generacion de texto por lotes en pipelines internos: al usar GGUF con llama.cpp es posible ejecutar inferencia offline sin GPU dedicada, con la variante Q8_0 (17,4 GB) como opcion de maxima fidelidad respecto a los pesos originales.
- Base para ajuste fino o destilacion de variantes mas pequenas: el modelo base en precision completa (no este repositorio GGUF) puede servir como profesor o como punto de partida, siempre que la licencia MIT del modelo base se confirme en su repositorio original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para el modelo base ni para las variantes cuantizadas. Tampoco se publican mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del tamano de fichero declarado mas el espacio necesario para la cache KV (la cifra exacta depende de la longitud de contexto configurada):
  - Q8_0: 17,4 GB de pesos, aproximadamente 19-21 GB en total.
  - Q6_K: 13,5 GB de pesos, aproximadamente 15-17 GB en total.
  - Q5_K_M: 11,7 GB de pesos, aproximadamente 13-15 GB en total.
  - Q4_K_M: 10,0 GB de pesos, aproximadamente 11-13 GB en total.
  - Q3_K_M: 8,0 GB de pesos, aproximadamente 9-11 GB en total.
  - Q2_K: 6,2 GB de pesos, aproximadamente 7-9 GB en total.
- GPU recomendadas: para Q8_0 y Q6_K, tarjetas de 24 GB o mas (RTX 3090, RTX 4090, A100 40 GB, H100). Para Q5 y Q4, tarjetas de 16-24 GB (RTX 4080, RTX 4090, A10G 24 GB). Para Q3 y Q2, tarjetas de 12 GB o menos (RTX 3060 12 GB, RTX 4070).
- Compatibilidad con GPU de consumo: si. Q4_K_M y Q4_K_S son las opciones recomendadas por el autor para uso general y caben en tarjetas de 16 GB; Q2_K y Q3_K_S permiten incluso configuraciones con 8-12 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y text-generation-webui. Para vLLM o TGI seria necesario recurrir a los pesos en safetensors del modelo base, ya que estas herramientas no consumen GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones. Como referencia cualitativa, el autor marca Q4_K_S, Q4_K_M y Q8_0 como cuantizaciones "rapidas".

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de ningun otro modelo de la misma categoria con el que comparar parametros, contexto, rendimiento o licencia. La unica comparacion posible con los datos disponibles es entre este repositorio y su modelo base:

| Aspecto | inclusionAI/Ling-mini-2.0 | mradermacher/Ling-mini-2.0-GGUF |
|---|---|---|
| Formato de pesos | no disponible en la informacion proporcionada (presumiblemente safetensors) | GGUF |
| Parametros | 16.255.643.392 (dato del repositorio base) | identicos, cuantizados |
| Tamano en disco | no disponible | de 6,2 GB (Q2_K) a 17,4 GB (Q8_0); repo completo 111,2 GB |
| Licencia | MIT | MIT |
| Uso previsto | no disponible | inferencia local con llama.cpp y derivados |
| Idiomas | en | en |

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: las variantes de menor tamano degradan la calidad de forma apreciable. El propio autor etiqueta Q3_K_M como "lower quality" y desaconseja implicitamente las cuantizaciones de 2 y 3 bits para tareas que exijan precision.
- Idioma: la unica lengua declarada es el ingles. No hay evidencia en la informacion disponible de un rendimiento aceptable en castellano u otros idiomas.
- Sesgos conocidos: no disponibles. El repositorio de cuantizaciones no documenta evaluaciones de sesgo ni de seguridad, y los sesgos heredados del modelo base dependen de sus datos de entrenamiento, no descritos.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada. Al ser un modelo de 16B, la tasa de alucinacion esperable es superior a la de modelos frontier, aunque no se aportan mediciones.
- Restricciones de licencia: la licencia declarada es MIT, tanto en las etiquetas como en la cabecera de la model card. No obstante, conviene verificar la licencia del modelo base en su repositorio original antes de un uso comercial, ya que este repositorio es un artefacto derivado y la licencia aplicable al modelo subyacente es la que rige el uso final.
- Ausencia de documentacion tecnica: contexto maximo, plantilla de chat, comportamiento con tool calling y limites operativos no estan documentados en este repositorio, lo que obliga a consultar el repositorio del modelo base antes de llevarlo a produccion.
- Tamano total del repositorio: 111,2 GB si se descargan todas las cuantizaciones. Para un uso concreto conviene descargar unicamente el fichero GGUF necesario.
- Ficheros multiparte: el autor remite a los README de TheBloke para conocer el procedimiento de concatenacion de ficheros divididos; conviene comprobar si alguna de las variantes publicadas esta partida en varios ficheros antes de integrarla en un pipeline automatizado.
- Fecha de ultima actualizacion del repositorio (2026-10-10) posterior a la de creacion (2025-10-22): conviene revisar si se han reemplazado ficheros, ya que eso puede invalidar resultados de evaluacion previos.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Ling-mini-2.0-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-mini-2.0
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/Ling-mini-2.0-i1-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Ling-mini-2.0-GGUF
- README de referencia para el uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad entre tipos de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones y preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
