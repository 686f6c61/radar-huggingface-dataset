# mradermacher/CIG-27B-IPR-GGUF

## Resumen

CIG-27B-IPR-GGUF es la version cuantizada en formato GGUF del modelo CIG-27B-IPR, publicado por el usuario mradermacher en Hugging Face. Se trata de una conversion estatica (no de un modelo original) realizada a partir de los pesos del repositorio CodeImageGen/CIG-27B-IPR, orientada a su ejecucion en entornos con llama.cpp y herramientas compatibles con el formato GGUF. El modelo cuenta con 27.320.697.856 parametros totales, lo que lo situa en la categoria de modelos densos de aproximadamente 27B.

La relevancia de esta publicacion radica en que facilita el despliegue local del modelo original mediante cuantizaciones de 2 a 8 bits, reduciendo los requisitos de memoria frente a los pesos completos en precision nativa. El repositorio ocupa 15,8 GB e incluye un conjunto amplio de variantes de cuantizacion, desde Q2_K hasta Q8_0, ademas de una version F16.

No obstante, la informacion publica disponible es muy limitada: no se especifican la licencia, los idiomas soportados, la arquitectura interna, los datos de entrenamiento ni resultados de benchmarks. La model card se limita a los metadatos de generacion de las cuantizaciones y a la referencia al modelo base. Cualquier evaluacion de capacidades debe, por tanto, realizarse empiricamente sobre el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no aplica (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo base CIG-27B-IPR. El recuento de parametros (27.320.697.856) es coherente con un transformer denso de aproximadamente 27B, pero no se confirma en la documentacion disponible si emplea atencion estandar, atencion lineal, mezcla de expertos u otra variante. Tampoco se detalla la longitud de contexto nativa ni el tokenizador utilizado.

Respecto al entrenamiento, no se han publicado datos sobre el volumen de tokens, la composicion del corpus, el uso de RLHF, DPO u otras tecnicas de alineacion. La unica informacion tecnica verificable procede de los metadatos de la conversion: se ha utilizado la version 2 del script de cuantizacion, con cuantizacion de tensores de salida activada (output_tensor_quantised: 1) y conversion de tipo hf, lo que indica que los pesos de origen estaban en formato Hugging Face. Las cuantizaciones son estaticas, es decir, generadas sin calibracion dinamica adicional sobre datos especificos.

## Capacidades

- Generacion de texto conversacional: la etiqueta "conversational" del repositorio sugiere un ajuste orientado a dialogo, aunque no se detalla el formato de prompt ni las plantillas de chat.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" indica que el repositorio puede servirse mediante la infraestructura de endpoints de Hugging Face.
- Inferencia local en GGUF: al estar en formato GGUF, el modelo es ejecutable con llama.cpp y derivados (Ollama, LM Studio, llama-cpp-python), lo que habilita su uso en CPU y GPU consumer.
- Capacidades de razonamiento, codigo, matematicas, vision, tool calling o agentes: no disponibles en la informacion publicada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones Q4_K_M y Q5_K_M, el modelo puede ejecutarse en equipos con 16-24 GB de memoria unificada o VRAM, permitiendo prototipado sin dependencia de servicios en la nube.
- Experimentacion con llama.cpp: las variantes Q2_K a Q8_0 permiten comparar el impacto de la cuantizacion en la calidad de salida sobre el mismo modelo base, util para estudiar degradacion por bits.
- Servicio de chat autoalojado: la etiqueta "conversational" y la compatibilidad con endpoints permiten montar una API de conversacion interna sin exponer datos a terceros.
- Evaluacion comparativa de modelos de ~27B: sirve como punto de referencia en estudios de rendimiento entre cuantizaciones y entre modelos de tamano similar.
- Integracion en pipelines de generacion de texto por lotes: con llama-cpp-python o servidores compatibles, puede procesar grandes volumenes de texto en entornos con GPU de gama alta o CPU.
- Investigacion sobre cuantizacion estatica: el repositorio documenta los metadatos de conversion, lo que facilita reproducir el proceso sobre otros modelos del mismo autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano del repo de 15,8 GB y el numero de parametros):
  - Q2_K: en torno a 10-11 GB
  - Q3_K_M: en torno a 13-14 GB
  - Q4_K_M: en torno a 16-17 GB
  - Q5_K_M: en torno a 19-20 GB
  - Q6_K: en torno a 22-23 GB
  - Q8_0: en torno a 29-30 GB
  - F16: en torno a 55 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q8_0 y F16; RTX 3090 (24 GB) para cuantizaciones de 4-5 bits.
- Cabe en GPU consumer: si, en tarjetas de 24 GB con cuantizaciones de 4-5 bits; en tarjetas de 12-16 GB solo con Q2_K o Q3_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa sin conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion fundamentada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base CodeImageGen/CIG-27B-IPR antes de cualquier despliegue en produccion.
- Idiomas no declarados: se desconoce la cobertura multilingue y la calidad en castellano.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en tareas estandar (MMLU, HumanEval, GSM8K), por lo que la evaluacion debe hacerse de forma empirica.
- Cuantizaciones agresivas: Q2_K e IQ4_XS pueden degradar notablemente la coherencia y el razonamiento; se recomienda Q4_K_M o superior para uso serio.
- Riesgo de alucinacion: inherente a los modelos generativos; sin datos de alineacion publicados no es posible estimar su magnitud.
- Sesgos: desconocidos, al no publicarse informacion sobre el corpus de entrenamiento.
- Repositorio sin descargas ni likes: no hay evidencia de validacion por parte de la comunidad; conviene tratar el modelo con cautela.
- Conversión de terceros: al ser una cuantizacion de mradermacher y no del autor original, pueden existir diferencias respecto al modelo base; se recomienda contrastar con CodeImageGen/CIG-27B-IPR.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CIG-27B-IPR-GGUF
- Modelo base: https://huggingface.co/CodeImageGen/CIG-27B-IPR
