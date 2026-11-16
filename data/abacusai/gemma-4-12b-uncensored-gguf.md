# abacusai/Gemma-4-12B-Uncensored-GGUF

## Resumen

Gemma-4-12B-Uncensored-GGUF es la distribucion en formato GGUF del modelo Gemma-4-12B-Uncensored de Abacus.AI, un ajuste fino de Gemma 4 12B-it de Google en el que se ha eliminado el comportamiento de rechazo mediante entrenamiento DPO. Este repositorio contiene exclusivamente los pesos cuantizados para su uso con llama.cpp, Ollama y LM Studio, junto con el proyector de imagen y un modelo borrador (draft model) para decodificacion especulativa. El modelo base cuenta con 11.907.350.576 parametros (aproximadamente 12B) y mantiene las capacidades multimodales del Gemma original: la pipeline declarada es image-text-to-text.

La relevancia de esta publicacion radica en dos factores. Primero, ofrece cinco niveles de cuantizacion (desde IQ4_XS hasta Q8_0) construidos con llama.cpp a partir de los pesos BF16, con matrices de importancia (imatrix) calculadas sobre 48K tokens de prosa, codigo, dialogo, matematicas, ciencia y texto multilingue para los formatos Q4_K_M e IQ4_XS. Segundo, documenta de forma medible el efecto del ajuste: sobre 241 prompts daninos de HarmBench y JailbreakBench, el Gemma 4 12B-it original rechaza el 91,7% con thinking activado, mientras que el archivo Q4_K_M de este repositorio rechaza solo el 4,1% (10 de 241), medido directamente sobre el fichero en llama.cpp y coincidente con los pesos en precision completa.

El modelo se distribuye bajo licencia Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) y esta pensado para desarrolladores que necesitan ejecutar localmente un modelo multimodal de ~12B sin las restricciones de rechazo del modelo original, en hardware de consumo o en una unica GPU de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Gemma 4 12B-it; no se detalla la variante exacta en la informacion disponible |
| Parametros totales | 11.907.350.576 (~12B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la tabla de memoria del autor referencia configuraciones de 8K y 32K tokens |
| Tipos de cuantizacion | IQ4_XS, Q4_K_M, Q5_K_M, Q8_0 (cinco tamanos segun la model card; el listado completo de nombres no esta disponible) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 (license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp), con proyector de imagen y draft model incluidos |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 12B-it de Google, un transformer multimodal con capacidad de procesamiento de imagen y texto. Sobre esa base, Abacus.AI aplico un ajuste fino con DPO (Direct Preference Optimization) orientado a eliminar los rechazos, dando lugar a Gemma-4-12B-Uncensored. La model card del repositorio GGUF no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni los hiperparametros del DPO; esa informacion se remite a la model card del modelo de origen.

La innovacion tecnica de esta publicacion esta en el proceso de cuantizacion: los ficheros se generaron con llama.cpp `b8abe41` a partir de los pesos BF16, e IQ4_XS y Q4_K_M emplean una importance matrix (`imatrix.gguf`, incluida en el repositorio) calculada sobre 48K tokens de prosa, codigo, dialogo, matematicas, ciencia y texto multilingue. Ademas, el repositorio incluye el proyector de imagen necesario para el modo multimodal y el modelo borrador (draft model) de Google para decodificacion especulativa, lo que acelera la generacion. Cada fichero fue cargado y probado con thinking activado, thinking desactivado y con una imagen, y el fichero de descarga por defecto se valido en llama.cpp, Ollama y LM Studio.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat.
- Procesamiento de imagen y texto (pipeline image-text-to-text): acepta entradas visuales junto con el prompt.
- Modo thinking (razonamiento extendido) activable y desactivable; los datos de rechazo se miden por separado en ambos modos.
- Decodificacion especulativa mediante el draft model de Google incluido en el repositorio, orientada a reducir latencia.
- Generacion de codigo y texto tecnico, reforzada por la composicion de la imatrix (codigo, matematicas, ciencia).
- Capacidades multilingues: la imatrix incluye texto multilingue, aunque la lista de idiomas soportados no esta disponible.
- Comportamiento de rechazo reducido de forma medible: 4,1% de rechazo sobre 241 prompts daninos con thinking activado, frente al 91,7% del modelo original.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de seguridad y red teaming: el modelo permite estudiar como responde un LLM de ~12B sin rechazos ante prompts de HarmBench y JailbreakBench, con tasas de rechazo medidas (4,1% con thinking, 16,6% sin thinking) que sirven como referencia para comparar mecanismos de alineacion.
- Investigacion sobre alineacion y DPO: al existir tanto el modelo original (91,7% de rechazo) como el ajustado (4,1%), se puede analizar el efecto del DPO sobre el comportamiento de rechazo manteniendo el resto de capacidades.
- Despliegue local en estaciones de trabajo con GPU de consumo: el fichero Q4_K_M (7,38 GB) requiere 8,6 GB de VRAM con 8K de contexto y 9,0 GB con 32K, por lo que cabe en tarjetas de 12 GB como la RTX 3060 de 12 GB o la RTX 4070.
- Asistentes conversacionales con entrada de imagen: al incluir el proyector de imagen, se puede construir un asistente que describa o razone sobre capturas, diagramas o fotos en local, sin depender de APIs externas.
- Generacion de codigo y texto tecnico en local: la imatrix incluye codigo, matematicas y ciencia, lo que hace al modelo adecuado para autocompletado y explicacion de codigo en entornos sin conexion mediante llama.cpp u Ollama.
- Prototipado rapido con Ollama y LM Studio: el fichero por defecto esta validado en ambas herramientas y en llama.cpp, lo que permite tener un endpoint compatible con la API de OpenAI en minutos sobre una unica GPU.
- Procesamiento por lotes de contenido creativo o de ficcion sin filtros de rechazo: escritura de dialogos, guiones o narrativa donde el modelo original tiende a rechazar o matizar en exceso.

## Benchmarks y rendimiento

Los unicos datos cuantitativos publicados en la informacion disponible son las tasas de rechazo sobre 241 prompts daninos de HarmBench y JailbreakBench, evaluadas por un juez LLM sobre la respuesta completa:

| Modelo | Thinking activado | Thinking desactivado |
|---|---|---|
| Gemma 4 12B-it original | 91,7% de rechazo | 95,4% de rechazo |
| Gemma-4-12B-Uncensored (precision completa) | 4,1% de rechazo | 16,6% de rechazo |
| Gemma-4-12B-Uncensored-GGUF Q4_K_M | 4,1% de rechazo (10 de 241) | 16,6% de rechazo (40 de 241) |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (contexto de 8K / 32K, segun la tabla del autor):
  - IQ4_XS (6,64 GB de fichero): 7,9 GB / 8,3 GB de VRAM.
  - Q4_K_M (7,38 GB de fichero): 8,6 GB / 9,0 GB de VRAM.
  - Q5_K_M (8,55 GB de fichero): 9,6 GB / valor a 32K no disponible en la informacion proporcionada.
  - Q8_0: tamano de fichero y VRAM no disponibles en la informacion proporcionada.
- GPU recomendadas: el autor indica que IQ4_XS funciona con 10 GB de memoria GPU y que en una tarjeta de 8 GB algunas capas se derivan a la CPU; Q4_K_M se recomienda con 12 GB de VRAM. GPU de consumo adecuadas: RTX 3060 12 GB, RTX 4070, RTX 4070 Ti, RTX 4080. Para Q8_0 se requiere una GPU con mas VRAM, sin cifra publicada.
- Cabe en GPU de consumo: si, al menos IQ4_XS y Q4_K_M en tarjetas de 10-12 GB; IQ4_XS puede ejecutarse parcialmente en una GPU de 8 GB con offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio (los tres validados por el autor con el fichero por defecto); el repositorio incluye proyector de imagen y draft model para decodificacion especulativa. Soporte de vLLM o TGI no disponible en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada. La inclusion del draft model de Google sugiere mejoras por decodificacion especulativa, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Enfoque de rechazo |
|---|---|---|---|---|---|
| Gemma-4-12B-Uncensored-GGUF (este) | ~12B | no disponible (referencias a 8K y 32K) | Si (image-text-to-text) | Apache 2.0 | Reducido: 4,1% con thinking |
| Gemma 4 12B-it (Google) | ~12B | no disponible | Si | Licencia Gemma 4 | Estandar: 91,7% con thinking |
| Gemma-4-12B-Uncensored (Abacus.AI, precision completa) | ~12B | no disponible | Si | Apache 2.0 | Reducido: 4,1% con thinking |

No se dispone de datos de benchmarks de capacidad ni de otros modelos comparables de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita a la familia Gemma 4 12B y sus variantes.

## Limitaciones y advertencias

- El modelo ha sido entrenado explicitamente para reducir rechazos: responde al 95,9% de 241 prompts daninos de HarmBench y JailbreakBench con thinking activado. No es adecuado para despliegues orientados al publico sin una capa de moderacion externa.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad o factualidad en la informacion disponible; al ser un ajuste DPO sobre Gemma 4, hereda los sesgos y limitaciones del modelo base.
- Sesgos conocidos: no documentados en la informacion proporcionada; se remiten a la model card del modelo de origen.
- Idiomas soportados: no disponibles; la imatrix incluye texto multilingue, pero no se especifica la cobertura real por idioma.
- Longitud de contexto: no se publica el maximo oficial; la tabla de memoria solo referencia 8K y 32K, por lo que no debe asumirse un contexto mayor sin verificacion.
- Restricciones de licencia: se declara Apache 2.0, pero el campo license_link apunta a la licencia de Gemma 4 de Google, lo que puede implicar terminos adicionales de uso comercial; conviene revisar ambos documentos antes de un despliegue en produccion.
- Cuantizacion: IQ4_XS y Q4_K_M introducen perdida de precision; el autor verifica que la tasa de rechazo coincide con la de precision completa, pero no se han publicado evaluaciones de capacidad (razonamiento, codigo, matematicas) por cuantizacion.
- El repositorio tiene 24 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria muy limitada.
- No se documentan resultados de tool calling ni de uso agentico, por lo que no debe asumirse su correcto funcionamiento en pipelines de agentes sin pruebas propias.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/abacusai/Gemma-4-12B-Uncensored-GGUF
- Modelo base (precision completa): https://huggingface.co/abacusai/Gemma-4-12B-Uncensored
- Modelo original de Google: https://huggingface.co/google/gemma-4-12B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de Abacus.AI: https://abacus.ai
- Organizacion Abacus.AI en Hugging Face: https://huggingface.co/abacusai
