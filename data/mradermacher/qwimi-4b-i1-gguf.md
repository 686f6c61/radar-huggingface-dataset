# mradermacher/Qwimi-4B-i1-GGUF

## Resumen

Qwimi-4B-i1-GGUF es una coleccion de cuantizaciones en formato GGUF generadas por mradermacher sobre el modelo base Rumiii/Qwimi-4B, un modelo denso de aproximadamente 4.000 millones de parametros orientado a tool calling y flujos de agente. El autor de las cuantizaciones es mradermacher (nethype GmbH), mientras que el modelo original fue publicado por el usuario Rumiii. El repositorio ofrece una unica variante de momento: un fichero imatrix de 0,1 GB pensado para que otros usuarios generen sus propias cuantizaciones, mas una lista de tipos de cuantizacion previstos que abarca desde IQ1 hasta Q6_K.

La relevancia del modelo deriva de su orientacion explicita a tareas de agente y uso de herramientas: las etiquetas del repositorio incluyen `tool-calling`, `agent` y `distillation`, y el dataset de referencia es Agent-Ark/Toucan-1.5M, un corpus habitual en la ensenanza de llamadas a funciones. Esto lo situa en la categoria de modelos compactos de 4B pensados para ejecucion local, donde el equilibrio entre capacidad de razonamiento y huella de memoria es critico.

El modelo solo declara soporte para ingles (`en`) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Al tratarse de un modelo recien publicado, no cuenta con descargas ni valoraciones, y no hay informacion publica sobre benchmarks, arquitectura concreta o longitud de contexto en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base Rumiii/Qwimi-4B, no especificada) |
| Parametros totales | 958.716 segun metadatos de safetensors; el identificador del modelo indica ~4B (dato discrepante, sin confirmar) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_M, IQ1_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL (small), IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (variante i1, con imatrix); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base Rumiii/Qwimi-4B en el material proporcionado. El repositorio no incluye configuracion de capas, tipo de atencion, ni detalles sobre si emplea atencion completa, atencion lineal o alguna variante hibrida. Tampoco se especifica el numero de tokens de entrenamiento ni la composicion exacta del dataset mas alla de la referencia a Agent-Ark/Toucan-1.5M.

Lo que si puede deducirse de las etiquetas es el proposito del entrenamiento: el modelo se ha sometido a un proceso de destilacion (`distillation`) orientado especificamente a tool calling y a comportamiento de agente. El uso del dataset Toucan-1.5M, compuesto por ejemplos de llamadas a funciones, sugiere que el ajuste busca mejorar la capacidad de generar JSON estructurado para herramientas, encadenar llamadas y mantener el estado en tareas multi-paso. No hay constancia de si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento adicionales.

Esta ficha corresponde exclusivamente al repositorio de cuantizaciones de mradermacher, no al modelo original. Las cuantizaciones i1 emplean ficheros imatrix (importance matrix) para preservar mejor la calidad en tamanos reducidos, lo que es relevante en quants agresivos como IQ1 e IQ2.

## Capacidades

- Generacion de texto en ingles.
- Tool calling y function calling, segun las etiquetas del repositorio y el dataset de entrenamiento (Agent-Ark/Toucan-1.5M).
- Comportamiento de agente y razonamiento multi-paso, orientado a cadenas de llamadas a herramientas.
- Capacidad de destilacion, lo que implica que el modelo ha aprendido de las trazas de un modelo mayor.
- Razonamiento y codigo: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: limitadas al ingles, segun el campo `language`.
- Vision, audio u otras modalidades: no disponibles.
- Modo de pensamiento explicito (thinking mode): no disponible.

## Casos de uso

- Agentes de automatizacion local: gracias a su tamano de ~4B y a su soporte de tool calling, el modelo puede ejecutarse en portatiles o estaciones de trabajo modestas para orquestar APIs, ficheros o comandos, siempre que la tarea se realice en ingles.
- Prototipado de pipelines de function calling: util para validar definiciones de herramientas y esquemas JSON antes de pasar a modelos mayores, con coste de inferencia muy bajo.
- Asistente de terminal o CLI en ingles: integrado via llama.cpp u Ollama, puede interpretar instrucciones en lenguaje natural y traducirlas a comandos estructurados.
- Automatizacion de tareas de escritorio en entornos controlados: el modelo puede gestionar cadenas de acciones con herramientas definidas, aprovechando su entrenamiento con Toucan-1.5M.
- Educacion e investigacion sobre destilacion: sirve como caso de estudio de un modelo destilado para agentes y de como se comporta al cuantizarlo a IQ1/IQ2.
- Despliegue en edge o entornos sin GPU: las cuantizaciones Q2_K e IQ2 permiten ejecucion en CPU con pocos gigabytes de RAM.
- Evaluacion comparativa de cuantizaciones: el repositorio esta pensado para que el usuario genere sus propios quants con el fichero imatrix, lo que lo hace util como banco de pruebas de calidad frente a tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras siguientes son estimaciones generales para un modelo denso de ~4.000 millones de parametros y deben tomarse como orientativas, dado que el recuento real de parametros del modelo base no esta confirmado en la documentacion.

- VRAM estimada para inferencia (modelo denso de ~4B, pesos):
  - IQ1_S / IQ1_M / IQ2_XXS: ~1,0-1,5 GB.
  - Q2_K / IQ2_M / Q3_K_S: ~1,5-2,0 GB.
  - IQ3_M / Q3_K_M / Q4_K_S: ~2,0-2,5 GB.
  - Q4_K_M / IQ4_XS / Q5_K_S: ~2,5-3,0 GB.
  - Q5_K_M / Q6_K: ~3,0-3,5 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090 24 GB para las cuantizaciones altas; A100 y H100 no son necesarias para un modelo de este tamano y solo tendrian sentido en despliegues de muchas instancias concurrentes.
- Compatibilidad con GPU de consumo: si, todas las cuantizaciones caben en GPUs de consumo con al menos 6-8 GB de VRAM, e incluso las mas agresivas pueden ejecutarse en iGPU o CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF como llama-cpp-python. vLLM y TGI funcionan principalmente con safetensors, no con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparacion se limita a caracteristicas declaradas. Los modelos alternativos se incluyen como referencia de categoria (modelos densos de ~3-4B orientados a uso local), sin que ello implique una equivalencia funcional confirmada.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwimi-4B-i1-GGUF | ~4B (segun identificador) | no disponible | en | Apache 2.0 | GGUF |
| Qwen3-4B | ~4B | 32K+ (segun publicacion de Qwen) | multilingue | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-3B-Instruct | ~3B | 128K | multilingue | Llama 3.2 Community License | safetensors, GGUF |
| Phi-3.5-mini-instruct | ~3,8B | 128K | multilingue | MIT | safetensors, GGUF |

La comparacion de rendimiento (MMLU, HumanEval, GSM8K, BFCL) no esta disponible para Qwimi-4B.

## Limitaciones y advertencias

- Idioma: solo se declara soporte para ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion: inherente a los modelos de ~4B, especialmente en tareas de razonamiento largo o cuando se les pide generar llamadas a funciones con esquemas complejos.
- Cuantizaciones agresivas: las variantes IQ1 e IQ2 degradan notablemente la calidad y la coherencia, sobre todo en generacion de JSON para tool calling; se recomienda Q4_K_M o superior para uso en produccion.
- Recuento de parametros discrepante: los metadatos indican 958.716 parametros mientras que el nombre del modelo sugiere ~4B; conviene verificar el modelo base antes de integrarlo.
- Repositorio practicamente vacio: el tamano declarado es 0,0 GB y la unica descarga inmediata es el fichero imatrix de 0,1 GB; las cuantizaciones finales pueden no estar publicadas en el momento de la consulta.
- Sin benchmarks ni evaluaciones publicas: no hay evidencia verificable de su rendimiento frente a alternativas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar la licencia del modelo base Rumiii/Qwimi-4B, ya que podria imponer condiciones adicionales no reflejadas en este repositorio.
- Cero descargas y cero valoraciones: no hay retroalimentacion de la comunidad sobre su comportamiento real en produccion.
- Las cuantizaciones y los ficheros derivados no incluyen garantia alguna por parte del autor.

## Enlaces

- Repositorio de cuantizaciones i1: https://huggingface.co/mradermacher/Qwimi-4B-i1-GGUF
- Modelo base: https://huggingface.co/Rumiii/Qwimi-4B
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/Qwimi-4B-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Qwimi-4B-i1-GGUF
- Peticiones de cuantizacion y FAQ: https://huggingface.co/mradermacher/model_requests
- Referencia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset de referencia: Agent-Ark/Toucan-1.5M (referenciado en la model card, sin enlace directo proporcionado)
