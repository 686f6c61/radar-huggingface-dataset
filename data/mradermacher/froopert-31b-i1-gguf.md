# mradermacher/Froopert-31B-i1-GGUF

## Resumen

Froopert-31B-i1-GGUF es una colección de cuantizaciones GGUF con matriz de importancia (imatrix) del modelo Froopert-31B, creada por mradermacher. El modelo original, desarrollado por Nimbz, es un merge basado en la arquitectura Gemma-4 de 31 mil millones de parámetros, orientado a tareas de razonamiento, escritura creativa, roleplay y conversación. Incluye capacidades multimodales (visión) y está diseñado para ser "de-slop" (menos verboso) y con baja tasa de rechazo, lo que lo hace adecuado para escenarios creativos y de rol.

La relevancia de esta versión radica en que ofrece múltiples niveles de cuantización (desde IQ2_M hasta Q6_K) optimizados con imatrix, lo que permite ejecutar el modelo en hardware de gama media y alta con diferentes compromisos entre tamaño, velocidad y calidad. El modelo base tiene licencia Apache-2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Merge basado en Gemma-4 (arquitectura exacta no especificada) |
| Parametros totales | 30.697.345.596 (30,7B) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible (se espera que herede la ventana de Gemma-4, pero no se confirma) |
| Tipos de cuantizacion | i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K |
| Idiomas soportados | Ingles (etiqueta `en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con archivo imatrix separado) |

## Arquitectura y entrenamiento

El modelo Froopert-31B es un merge creado con mergekit, combinando varios modelos basados en Gemma-4. No se han publicado detalles sobre la composición exacta del merge ni sobre el proceso de entrenamiento (datos, tokens, métodos de alineación como RLHF o DPO). La etiqueta `merge` y `mergekit` confirman que se trata de una fusión de pesos, no de un entrenamiento desde cero.

La cuantización i1 (imatrix) realizada por mradermacher utiliza la técnica de matriz de importancia para mejorar la calidad de las cuantizaciones de baja precisión, especialmente en los niveles IQ (IQ2, IQ3, IQ4). El archivo `imatrix.gguf` se proporciona para que los usuarios puedan generar sus propias cuantizaciones personalizadas.

## Capacidades

- Generacion de texto y conversacion multironda con estilo natural.
- Razonamiento logico y resolucion de problemas (etiqueta `reasoning`).
- Escritura creativa, roleplay y desarrollo de personajes (etiquetas `creative writing`, `roleplay`, `character-rp`).
- Modo agente (etiqueta `agentic`) con soporte potencial para tool calling y flujos de trabajo multi-paso.
- Capacidades multimodales de vision (el README indica que es un modelo de vision, con archivos mmproj disponibles en el repositorio estatico).
- Comportamiento "de-slop" (menos verbosidad artificial) y baja tasa de rechazo (etiqueta `low-refusal`), lo que facilita respuestas directas incluso en contextos creativos o NSFW.
- Soporte para inferencia local mediante GGUF con llama.cpp, Ollama u otros motores compatibles.

## Casos de uso

- Roleplay y ficcion interactiva: el modelo puede mantener conversaciones coherentes con personajes definidos, gracias a su entrenamiento orientado a roleplay y su baja tasa de rechazo. Se usaria con un frontend como SillyTavern o KoboldAI, cargando una cuantizacion Q4_K_M en una GPU de 24 GB.
- Escritura creativa asistida: generacion de borradores de novelas, guiones o dialogos con un estilo natural y poco estereotipado. La cuantizacion Q6_K ofrece mayor fidelidad para tareas que requieren precision linguistica.
- Asistentes conversacionales para nichos especificos: al ser un modelo de 31B con buena capacidad de razonamiento, puede servir como base para chatbots de atencion al cliente o asistentes virtuales con personalidad, desplegado con vLLM en un servidor con GPU A100.
- Generacion de codigo y depuracion: aunque no se menciona explicitamente, al ser un modelo grande basado en Gemma-4 (que tiene capacidades de codigo), puede utilizarse para autocompletar o explicar fragmentos de codigo. Se recomienda probar con una cuantizacion IQ4_XS para equilibrar calidad y memoria.
- Analisis de imagenes y descripcion visual: al ser un modelo de vision, puede procesar imagenes y generar descripciones o responder preguntas sobre ellas. Requiere los archivos mmproj del repositorio estatico.
- Prototipado de agentes autonomos: con soporte para tool calling y modo agente, puede integrarse en frameworks como LangChain o AutoGen para tareas de automatizacion, siempre que se use una cuantizacion que mantenga la coherencia (Q4_K_M o superior).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de MMLU, HumanEval u otras evaluaciones. Se recomienda realizar pruebas propias con los conjuntos de datos habituales para validar el rendimiento en el caso de uso deseado.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion):
  - i1-IQ2_M / i1-Q2_K_S: ~11 GB
  - i1-Q3_K_M / i1-IQ3_M: ~15 GB
  - i1-Q4_K_S / i1-IQ4_XS: ~17-18 GB
  - i1-Q4_K_M: ~19 GB
  - i1-Q6_K: ~25 GB
- GPUs recomendadas:
  - Para cuantizaciones hasta Q4_K_M: RTX 3090/4090 (24 GB) o A5000.
  - Para Q6_K: A100 40GB, RTX A6000 (48 GB) o multiples GPUs.
- El modelo cabe en GPUs de consumo (RTX 3090/4090) con cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con conversion a formato compatible), TGI.
- Latencia y throughput: no hay datos publicados. Para un modelo de 31B en Q4_K_M, se espera una velocidad de generacion de 20-40 tokens/s en una RTX 4090, dependiendo de la implementacion y el tamaño de contexto.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria. El modelo original (Nimbz/Froopert-31B) no tiene benchmarks publicados, y no se conocen alternativas directas de 31B con licencia Apache-2.0 y capacidades de vision en el ecosistema GGUF. Se recomienda comparar empiricamente con Gemma-4-27B (si existe) o con modelos de tamano similar como Mixtral-8x7B, aunque la arquitectura y el enfoque difieren.

## Limitaciones y advertencias

- No hay informacion sobre sesgos especificos, pero al ser un modelo derivado de Gemma-4, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir informacion falsa o inventada, especialmente en tareas factuales.
- El modelo esta etiquetado como `low-refusal` y `nsfw`, lo que implica que puede generar contenido explicito o inapropiado. Debe usarse con moderacion en entornos profesionales.
- La longitud de contexto no esta confirmada; si hereda la ventana de Gemma-4 (posiblemente 128k tokens), pero no hay garantia tras el merge.
- Solo soporta ingles de forma nativa; otros idiomas pueden tener un rendimiento degradado.
- Al ser un merge, puede presentar inconsistencias en el comportamiento entre distintos tipos de tareas.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que los modelos base del merge tambien tengan licencias compatibles (el autor indica Apache-2.0 en el modelo original).

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Froopert-31B-i1-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/Nimbz/Froopert-31B
- Repositorio estatico con cuantizaciones y mmproj: https://huggingface.co/mradermacher/Froopert-31B-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Froopert-31B-i1-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
