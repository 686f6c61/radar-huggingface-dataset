# bartowski/Altworld_Hemmingway-1-GGUF

## Resumen

Altworld_Hemmingway-1-GGUF es el conjunto de cuantizaciones en formato GGUF del modelo Hemmingway-1, desarrollado originalmente por Altworld y cuantizado por bartowski mediante llama.cpp (release b10964). El modelo base cuenta con 27.320.697.856 parámetros (unos 27,3B) según los pesos reales en safetensors, y está orientado a generación de texto conversacional y, de forma destacada, a escritura creativa, como indican las etiquetas chat, creative-writing y altworld del repositorio.

El interés práctico de esta ficha no está en el modelo original, sino en la disponibilidad de veinte variantes de cuantización con tamaños que van desde los 54,66 GB del bf16 completo hasta formatos de 3 bits por debajo de los 15 GB, lo que permite ejecutar un modelo de 27B en hardware de consumo. Todas las variantes se han generado con imatrix (calibración de importancia de pesos) y el modelo soporta decodificación especulativa mediante MTP según la model card del cuantizador.

Se trata de un modelo solo de texto, con soporte exclusivo de inglés, licencia apache-2.0 y un formato de prompt basado en ChatML con etiquetas `<|im_start|>` y un bloque `<think>` para razonamiento explícito. El repositorio acumula 4.372 descargas y 13 likes, con un tamaño total de 444,9 GB debido a que aloja todas las cuantizaciones simultáneamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el autor etiqueta el modelo como qwen3.8; no se detalla la arquitectura interna en la informacion proporcionada) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No disponible (no se especifica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0, IQ4_XS, IQ3_M, Q3_K_L, Q3_K_M, IQ3_XS, Q3_K_S, IQ3_XXS (lista truncada en la informacion disponible) |
| Idiomas soportados | Ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado con llama.cpp b10964); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base (no se confirma si es un transformer denso, un MoE o una arquitectura hibrida), ni el numero de tokens de entrenamiento, la composicion del dataset o si hubo fases de RLHF, DPO o ajuste por preferencias. El unico dato estructural relevante es la etiqueta qwen3.8 declarada por el autor, que sugiere un linaje Qwen, y el numero de parametros verificados en los pesos en safetensors: 27.320.697.856.

El aspecto tecnico mejor documentado en esta ficha es el proceso de cuantizacion. bartowski ha generado las variantes con imatrix, una tecnica que calibra la importancia relativa de cada peso usando un dataset de calibracion, de modo que las capas mas sensibles conservan mayor precision. Ademas, la model card indica soporte de decodificacion especulativa mediante MTP (Multi-Token Prediction), lo que permite acelerar la generacion prediciendo varios tokens por paso, siempre que el runtime de inferencia lo implemente. El formato de prompt empleado es ChatML con una instruccion de sistema que fija el esfuerzo de razonamiento en xhigh y abre un bloque `<think>` antes de la respuesta del asistente.

## Capacidades

- Generacion de texto conversacional multi-turno, con formato de prompt ChatML y soporte de mensaje de sistema.
- Escritura creativa y narrativa, ambito declarado explicitamente en las etiquetas del repositorio (creative-writing, altworld).
- Modo de razonamiento explicito: el prompt de referencia activa un esfuerzo de razonamiento xhigh y el modelo emite su cadena de pensamiento dentro de `<think>`.
- Decodificacion especulativa mediante MTP, segun la model card del cuantizador.
- Soporte de cuantizacion con imatrix, orientado a preservar calidad en formatos de baja precision.
- Capacidades multilingues: limitadas al ingles, unico idioma declarado.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, uso de agentes, vision, audio ni otras modalidades.

## Casos de uso

- Generacion de ficcion y narrativa larga: el modelo esta etiquetado como creative-writing y dispone de cuantizaciones de 4 bits de 17,44 GB (Q4_K_M) que permiten ejecutarlo en una GPU de consumo para sesiones de escritura asistida.
- Asistentes conversacionales en ingles desplegados en local: el formato de prompt ChatML con mensaje de sistema facilita la integracion en aplicaciones de chat sobre llama.cpp u Ollama sin depender de APIs externas.
- Prototipado de productos de escritura creativa en hardware de gama alta de consumo: con la variante IQ4_XS (15,48 GB) el modelo cabe en tarjetas de 16 GB de VRAM, lo que abarata el ciclo de pruebas.
- Despliegue en equipos con Apple Silicon: la variante Q4_1 (17,83 GB) se describe en la model card como de mejor rendimiento en tokens por vatio en silicio de Apple, adecuada para portatiles con memoria unificada amplia.
- Escritura de guiones y contenido de marketing en ingles: la capacidad de mantener estilo y coherencia en textos largos, junto con el modo de razonamiento, permite generar borradores estructurados y refinarlos en turnos sucesivos.
- Experimentacion en investigacion sobre cuantizacion: el repositorio ofrece veinte variantes del mismo modelo con distinta precision, lo que permite medir el impacto de la cuantizacion en la calidad de salida con un unico modelo base.
- Generacion de texto por lotes en servidores con GPU de datacenter: las variantes bf16 (54,66 GB) y Q8_0 (29,12 GB) permiten maximizar la fidelidad respecto al modelo original cuando el presupuesto de VRAM no es la restriccion.
- Evaluacion comparativa de decodificacion especulativa: dado que el modelo declara soporte de MTP, sirve como banco de pruebas para medir ganancias de throughput en runtimes que implementen esta tecnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y la busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo: los unicos enlaces recuperados corresponden a un servicio de television por internet ajeno por completo al ambito del modelo.

## Requisitos de hardware

Los valores de VRAM que figuran a continuacion son estimaciones derivadas del tamano de cada fichero GGUF indicado en la model card; no incluyen la cache KV (que depende de la longitud de contexto configurada) ni el overhead del runtime, por lo que en la practica hay que anadir entre 1 y 4 GB adicionales segun el contexto.

- bf16: 54,66 GB de pesos en ficheros divididos (split). Requiere GPU de 80 GB (A100, H100) o varias GPU. No cabe en hardware de consumo.
- Q8_0: 29,12 GB. Requiere aproximadamente 31-33 GB de VRAM; dos RTX 3090 o dos RTX 4090 en configuracion multi-GPU, o una A100 de 40 GB.
- Q6_K_L: 24,96 GB y Q6_K: 23,86 GB. Al limite de una RTX 4090 o RTX 3090 de 24 GB; viables en una unica GPU solo con contexto reducido.
- Q5_K_M: 20,92 GB y Q5_K_S: 19,57 GB. Caben en una GPU de 24 GB (RTX 4090, RTX 3090, L4 de 24 GB) con margen para contexto moderado.
- Q4_K_M: 17,44 GB (variante recomendada por el autor como equilibrio entre tamano y calidad). Cabe en GPU de 20-24 GB y, con contexto corto, en tarjetas de 16 GB.
- IQ4_XS: 15,48 GB y Q4_K_S: 16,36 GB. Ajustadas para GPU de 16 GB de VRAM.
- Q3_K_M: 13,40 GB, IQ3_XS: 12,80 GB, Q3_K_S: 12,74 GB. Viables en GPU de 12-16 GB, con la advertencia del autor de que Q3_K_S no es recomendable por perdida de calidad.
- Opciones de despliegue: llama.cpp (versiones posteriores a b10964, que es la empleada para la cuantizacion), Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF; tambien vLLM o TGI si se utiliza el modelo base en safetensors. El soporte de decodificacion especulativa MTP depende del runtime.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoria. La tabla recoge unicamente lo que si esta documentado.

| Modelo | Parametros | Formato | Cuantizaciones | Licencia | Datos de benchmarks |
|---|---|---|---|---|---|
| bartowski/Altworld_Hemmingway-1-GGUF | 27,3B | GGUF (bf16 a IQ3_XXS) | 20 variantes con imatrix | apache-2.0 | No disponibles |
| Altworld/Hemmingway-1 (modelo base) | 27,3B | Safetensors | No aplica (pesos completos) | No disponible en la informacion proporcionada | No disponibles |
| Alternativas de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo ni sobre modelos comparables, por lo que no se han podido incorporar alternativas contrastadas.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles. No hay evidencia de capacidades en castellano ni en otros idiomas, por lo que su uso en produccion multilingue requeriria validacion previa.
- Ausencia total de benchmarks: no hay metricas publicadas de razonamiento, codigo, matematicas ni calidad de escritura, lo que impide estimar su rendimiento frente a alternativas.
- Longitud de contexto no documentada: se desconoce la ventana maxima, un dato critico para planificar el consumo de VRAM y para casos de uso con documentos largos.
- Riesgo de alucinacion: no se documentan en la informacion disponible fases de RLHF, DPO ni tecnicas de mitigacion de alucinaciones, algo especialmente relevante en un modelo orientado a generacion libre.
- Sesgos: no hay informacion sobre la composicion del dataset de entrenamiento ni auditorias de sesgo, por lo que se desconocen los sesgos sistematicos del modelo.
- Arquitectura no confirmada: la etiqueta qwen3.8 no va acompanada de documentacion tecnica, y no se especifica si el modelo es denso o MoE ni si emplea atencion estandar.
- Licencia: el repositorio de cuantizaciones declara apache-2.0, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo base Altworld/Hemmingway-1 antes de un despliegue en produccion, ya que la informacion disponible no la detalla.
- Tamano del repositorio: 444,9 GB en total. Descargar el repositorio completo no es viable para la mayoria de usuarios; hay que seleccionar un unico fichero de cuantizacion.
- Listado de cuantizaciones truncado: la model card proporcionada se corta en la variante IQ3_XXS, por lo que podrian existir formatos adicionales de menor precision no recogidos aqui.
- Recomendaciones de calidad del propio autor: Q3_K_S aparece marcado como no recomendado, y Q3_K_M se describe como de calidad baja.
- Modo de razonamiento forzado en el prompt de referencia: el prompt sugerido fija el esfuerzo de razonamiento en xhigh, lo que incrementa el consumo de tokens de salida si no se ajusta.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/bartowski/Altworld_Hemmingway-1-GGUF
- Modelo base original: https://huggingface.co/Altworld/Hemmingway-1
- Release de llama.cpp empleada para la cuantizacion (b10964): https://github.com/ggml-org/llama.cpp/releases/tag/b10964
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp/
- Busqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos (app.teeveeing.com, teeveeing.com/more-info, mail.teeveeing.com, teeveeing.com/terms-of-service) corresponden a un servicio de television por internet sin relacion con el modelo.
