# mradermacher/NeoHorse-1-4B-Max-Heretic-Uncensored-TURBO-GGUF

## Resumen

NeoHorse-1-4B-Max-Heretic-Uncensored-TURBO-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF generado por mradermacher a partir del modelo prithivMLmods/NeoHorse-1-4B-Max-Heretic-Uncensored-TURBO. No se trata, por tanto, de un modelo entrenado desde cero, sino de una redistribución optimizada para inferencia local de un ajuste fino previo. El repositorio se publicó en Hugging Face el 26 de septiembre de 2026 y, en el momento de redactar esta ficha, no acumula descargas ni valoraciones.

El nombre del repositorio sugiere un modelo de aproximadamente 4.000 millones de parámetros (el sufijo "4B"), con un ajuste orientado a reducir o eliminar las salvaguardas de alineación (los términos "Heretic" y "Uncensored") y una variante etiquetada como "TURBO". Ninguno de estos extremos está confirmado en la información disponible: la model card del repositorio de cuantización se limita a listar los tipos de cuantización generados y a enlazar el modelo base, sin especificar arquitectura, licencia, idiomas, contexto ni datos de entrenamiento.

Su relevancia práctica es acotada pero real: permite ejecutar un modelo de la familia 4B en hardware de consumo mediante llama.cpp y derivados, con un espectro de cuantizaciones que va desde 2 bits (Q2_K) hasta 16 bits (F16). Al carecer de licencia declarada y de benchmarks publicados, cualquier uso en producción exige verificar primero las condiciones del modelo base en su repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no se especifica en la model card; el nombre del repositorio no identifica la familia base) |
| Parametros totales | No disponible (el sufijo "4B" del nombre sugiere ~4.000 millones, sin confirmar) |
| Parametros activos | No aplicable segun la informacion disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | No disponible |
| Licencia | No disponible en el repositorio de cuantizacion (debe consultarse la licencia del modelo base) |
| Formato de pesos | GGUF (cuantizaciones estaticas; metadatos de conversion: convert_type hf, quantize_version 2) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. La model card del repositorio de cuantizacion no incluye descripcion tecnica, ficha de entrenamiento ni referencia a un paper; unicamente indica que se trata de cuantizaciones estaticas ("static quants") del repositorio prithivMLmods/NeoHorse-1-4B-Max-Heretic-Uncensored-TURBO y lista los formatos generados. El campo convert_type: hf indica que la conversion de partida se realizo desde pesos en formato Hugging Face, y quantize_version: 2 y output_tensor_quantised: 1 corresponden a los metadatos internos del pipeline de cuantizacion de mradermacher.

Tampoco hay datos sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. Los unicos indicios cualitativos provienen del propio nombre del modelo: "Heretic" y "Uncensored" apuntan a un ajuste fino que reduce o elimina las capas de rechazo propias de los modelos alineados, mientras que "TURBO" no tiene una definicion tecnica estandar y podria referirse a una variante de decodificacion, a un ajuste adicional o a una simple convencion de nomenclatura del autor. Estas interpretaciones son inferencias a partir del nombre y no estan verificadas en la informacion disponible.

## Capacidades

- Generacion de texto en formato conversacional: el pipeline declarado en Hugging Face es "no disponible", por lo que no se puede confirmar que sea un modelo instruido o de chat, aunque la nomenclatura del modelo base apunta a ese uso.
- Reduccion de rechazos: por el etiquetado "Uncensored" y "Heretic", cabe esperar una menor tasa de respuestas evasivas ante peticiones sensibles, sin que exista documentacion que lo cuantifique.
- Ejecucion local en CPU y GPU: al distribuirse en GGUF, es compatible con llama.cpp y con los runners construidos sobre el (Ollama, LM Studio, koboldcpp, entre otros).
- Tool calling / function calling: no disponible; no hay ninguna referencia a soporte de llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta ninguna capacidad agentica ni modo de razonamiento explicito.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Capacidades especiales (vision, audio, modo thinking): no disponible; no se menciona ninguna.

## Casos de uso

- Inferencia local en portatil o equipo de sobremesa: con un modelo de ~4B en cuantizaciones Q4_K_M o Q5_K_M, el peso ocupa un rango manejable para GPUs de gama media y para CPU con RAM suficiente, lo que permite desplegar un asistente de texto sin depender de APIs externas. Requiere validar previamente contraindicaciones de licencia.
- Generacion de texto creativo sin filtros editoriales: el etiquetado "Uncensored" lo hace candidato para escritura de ficcion con tematicas adultas o violencia narrativa, donde los modelos alineados suelen rechazar la tarea. Debe asumirse la ausencia de filtros de seguridad.
- Experimentacion academica sobre alineacion y censura: util como punto de comparacion frente al modelo base alineado, para medir como varia la tasa de rechazos, el estilo de respuesta y la coherencia tras un proceso de "abliteration" o desalineacion.
- Prototipado rapido de chatbots de dominio cerrado: la cuantizacion Q8_0 o F16 permite hacer fine-tuning o evaluacion con la menor perdida de calidad posible dentro de este repositorio, antes de decidir si merece la pena escalar a un modelo mayor.
- Procesamiento por lotes de texto en servidores sin GPU dedicada: las cuantizaciones Q3_K_M o Q4_K_S reducen el consumo de memoria y permiten clasificacion, resumen o reescritura de documentos en volúmenes moderados.
- Base para pipelines de generacion aumentada por recuperacion (RAG): el modelo puede insertarse como generador en un sistema RAG siempre que se documente su ventana de contexto, dato que no esta disponible y que hay que medir empiricamente antes de disenar el pipeline.
- Pruebas de estres de seguridad en despliegues: sirve para evaluar si los filtros de una aplicacion estan implementados en el propio modelo o en capas externas, al disponer de una variante sin alineacion aparente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, ni tampoco comparaciones con modelos de la misma categoria. Tampoco se documentan cifras de latencia o throughput.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones derivadas del numero de parametros sugerido por el nombre del repositorio (~4.000 millones) y de los tamanos tipicos de cada formato GGUF; no proceden de ninguna medicion publicada por el autor.

- VRAM estimada para inferencia (solo pesos, estimacion para ~4B parametros):
  - Q2_K: en torno a 1,6-1,8 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: en torno a 1,9-2,4 GB
  - IQ4_XS / Q4_K_S / Q4_K_M: en torno a 2,3-2,7 GB
  - Q5_K_S / Q5_K_M: en torno a 2,8-3,1 GB
  - Q6_K: en torno a 3,3-3,6 GB
  - Q8_0: en torno a 4,3-4,6 GB
  - F16: en torno a 8-8,5 GB
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM puede ejecutar las cuantizaciones Q4 y Q5 (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). Las variantes Q8_0 y F16 requieren 8-10 GB o mas, por lo que encajan mejor en RTX 4080/4090, A100 o H100, aunque en estos dos ultimos el modelo resultaria muy pequeno y desaprovecharia la GPU.
- Compatibilidad con GPU de consumo: si, es uno de los principales atractivos del formato GGUF. Las cuantizaciones de 2 a 5 bits caben en GPUs de gama media y en equipos con 8-16 GB de RAM unificada (Apple Silicon, APUs recientes). La variante F16 tambien es viable en GPUs de consumo con 12 GB o mas.
- Opciones de despliegue: llama.cpp (referencia para GGUF), Ollama, LM Studio, koboldcpp, text-generation-webui y servidores compatibles con llama.cpp. vLLM y TGI no trabajan de forma nativa con GGUF sin conversion previa a safetensors, por lo que no son la via recomendada para este repositorio.
- Latencia y throughput: no disponible. Dependera del hardware, de la cuantizacion elegida y de la longitud de contexto, ninguno de cuyos valores esta documentado.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa con los datos proporcionados: no se conoce la arquitectura ni la licencia del modelo base, no hay benchmarks publicados y el repositorio no declara contexto, idiomas ni rendimiento. La siguiente tabla recoge la situacion frente a alternativas genericas de la misma categoria (modelos densos de ~3-4B distribuidos en GGUF por el propio mradermacher), marcando como "no disponible" todo aquello que no se puede verificar.

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|
| NeoHorse-1-4B-Max-Heretic-Uncensored-TURBO-GGUF | No disponible (~4B segun el nombre) | No disponible | No disponible | GGUF | No disponibles |
| Alternativas de ~3-4B con cuantizacion GGUF de uso comun (por ejemplo, familias tipo Llama 3.2 3B Instruct o Qwen de ~4B) | ~3-4B | No disponible en esta ficha | Varía segun familia; debe verificarse en el repositorio oficial | GGUF | No disponibles en esta ficha |

Para una comparacion con cifras reales hay que consultar las model cards oficiales de cada alternativa, ya que la informacion suministrada para esta ficha no incluye datos de ningun otro modelo.

## Limitaciones y advertencias

- Ausencia de alineacion de seguridad: el etiquetado "Uncensored" y "Heretic" indica que el modelo probablemente ha sido ajustado para reducir sus rechazos. Esto implica mayor probabilidad de generar contenido danino, ilegal, ofensivo o inseguro, y lo desaconseja para aplicaciones de cara al publico sin una capa de moderacion externa.
- Licencia no declarada: el repositorio de cuantizacion no indica licencia. El uso comercial queda en el aire hasta que se verifique la licencia del modelo base en prithivMLmods/NeoHorse-1-4B-Max-Heretic-Uncensored-TURBO.
- Riesgo de alucinacion: no hay evaluaciones de factualidad. En modelos de ~4B sin benchmarks publicados, la tasa de invencion de datos suele ser relevante, especialmente fuera de tareas de texto general.
- Contexto desconocido: al no documentarse la longitud de contexto, cualquier integracion que dependa de conversaciones largas o de RAG con muchos fragmentos exige una medicion previa.
- Idiomas no declarados: no se puede asumir un buen rendimiento en castellano ni en otros idiomas distintos del ingles.
- Perdida de calidad por cuantizacion: las variantes Q2_K y Q3_K degradan de forma perceptible la coherencia y el razonamiento. Para tareas que exijan precision conviene usar Q5_K_M, Q6_K o Q8_0.
- Repositorio sin traccion: cero descargas y cero valoraciones en el momento de la consulta, sin historial de uso que permita detectar problemas de calidad.
- Procedencia opaca: se desconoce la familia base, los datos de entrenamiento y el proceso de ajuste, lo que dificulta auditar sesgos o cumplimiento normativo (por ejemplo, RGPD si se procesan datos personales).
- Fechas de publicacion inusuales: los metadatos de Hugging Face indican creacion y actualizacion el 26 de septiembre de 2026, un dato que conviene contrastar si se usa con fines de trazabilidad.
- Solo inferencia: al distribuirse en GGUF, el repositorio no esta pensado para reentrenamiento ni fine-tuning directo; para ello habria que partir de los pesos originales con licencia verificada.

## Enlaces

- Repositorio de cuantizaciones en Hugging Face: https://huggingface.co/mradermacher/NeoHorse-1-4B-Max-Heretic-Uncensored-TURBO-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/NeoHorse-1-4B-Max-Heretic-Uncensored-TURBO
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Paper, blog o demo oficial: no disponible en la informacion proporcionada.
