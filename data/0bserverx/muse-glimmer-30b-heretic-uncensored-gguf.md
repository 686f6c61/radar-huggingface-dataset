# 0bserverx/Muse-Glimmer-30B-Heretic-Uncensored-GGUF

## Resumen

Muse-Glimmer-30B-Heretic-Uncensored-GGUF es un repositorio que publica 27 cuantizaciones GGUF del modelo Muse-Glimmer-30B-Heretic-Uncensored, una derivación abliterada del modelo de visión-lenguaje Muse-Glimmer-30B de Meta Superintelligence Lab. La abliteración, aplicada con la herramienta Heretic v1.4.0, elimina los mecanismos de rechazo del modelo original, de modo que responde sin negativas ante contenido adulto o NSFW, propiedad verificada empíricamente por el autor. El conjunto de cuantizaciones cubre un rango de huella de memoria desde 6,53 GB (IQ1_S) hasta 55,73 GB (F16/BF16), lo que permite desplegarlo en hardware muy diverso, desde sistemas solo CPU hasta GPUs con 32 GB de VRAM.

El modelo base presenta una arquitectura transformer densa con encoder de percepción visual (ViT-G/14 de ~1,8B parámetros), atención GQA con solo 2 cabezas KV, ventana deslizante de 2048 tokens y contexto nativo de 131 072 tokens. Está licenciado bajo Apache 2.0, soporta entrada multimodal (texto e imagen) y salida de texto, con un vocabulario de 202 048 tokens. Todas las cuantizaciones sub-4 bits se calibraron con matriz de importancia (imatrix) para mitigar la degradación de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal con encoder de percepcion (ViT-G/14, ~1,8B parametros) |
| Parametros totales | 27 854 794 240 (safetensors); ~29,6B incluyendo el encoder de vision |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131 072+ tokens |
| Tipos de cuantizacion | IQ1_S, IQ1_M, TQ1_0, IQ3_XXS, IQ2_XXS, TQ2_0, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, F16, BF16 (27 archivos) |
| Idiomas soportados | Ingles, multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (derivado de safetensors) |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un transformer denso causal con encoder de percepcion visual ViT-G/14 de aproximadamente 1,8B parametros. El componente de lenguaje tiene 52 capas, hidden size de 6656, FFN SwiGLU con dimension intermedia de 19 968, atencion GQA con 32 cabezas Q y 2 cabezas KV (ratio 16:1), y una ventana deslizante de 2048 tokens con un patron local:global de 3:1. El posicionamiento usa RoPE con theta 500 000 aplicado solo a capas locales. El vocabulario es de 202 048 tokens (200K BPE + 2048 especiales). El conocimiento del modelo base se corta el 4 de enero de 2026.

La derivacion Heretic-Uncensored se obtuvo mediante abliteracion con Heretic v1.4.0, una tecnica que modifica los pesos del modelo para eliminar la direccion de rechazo en el espacio de activaciones. El autor reporta una divergencia KL de 0,0743 respecto al modelo base, lo que indica una alteracion relativamente pequena de las capacidades generales. No se proporcionan datos sobre el dataset de entrenamiento del modelo base ni sobre el numero de tokens usados.

## Capacidades

- Entrada multimodal: acepta texto e imagenes, produce salida de texto.
- Generacion de texto y razonamiento general sobre contenido visual y textual.
- Soporte multilingue (ingles y otros idiomas, segun la etiqueta "multilingual").
- Ausencia de rechazos ante contenido adulto o NSFW: el modelo responde sin negativas a peticiones de ese tipo, propiedad verificada empiricamente por el autor.
- Contexto largo nativo de 131 072 tokens, util para dialogos extensos o analisis de documentos largos.
- No se documenta soporte explicito de tool calling, function calling ni modo agente.
- No se documenta modo de razonamiento especial (thinking mode) ni capacidades de audio.

## Casos de uso

- Analisis de imagenes con contenido sensible o explicito: el modelo puede describir o interpretar imagenes sin aplicar filtros de contenido, lo que resulta util en investigacion academica sobre moderacion, psicologia o estudios de medios, donde se requiere analizar material sin censura previa.
- Generacion de narrativa creativa adulta: escritores y creadores de contenido pueden usarlo para redactar ficcion erotica o guiones con libertad tematica, aprovechando la ausencia de rechazos y la capacidad de generar texto coherente en contextos largos.
- Asistente de conversacion sin restricciones: en entornos controlados (por ejemplo, chatbots de rol o simulaciones de personajes), el modelo puede mantener dialogos multi-turno sobre temas tabu sin interrumpir con negativas, gracias a su contexto de 131K tokens.
- Anotacion automatica de datasets visuales: el modelo puede generar descripciones detalladas de imagenes para construir datasets de entrenamiento, incluso cuando las imagenes contienen contenido que otros modelos se negarian a procesar.
- Traduccion y transcripcion multimodal: al ser multilingue y aceptar imagenes, puede transcribir texto presente en fotografias o capturas de pantalla en varios idiomas, sin las restricciones tipicas de otros VLM.
- Investigacion sobre alineacion y seguridad: dado que es un modelo abliterado, puede usarse como caso de estudio para analizar el impacto de la abliteracion en el comportamiento, la calidad de las respuestas y la divergencia respecto al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que la fidelidad de la variante Q4_K_S respecto a la referencia F16 se cuantifico mediante perplejidad a nivel de token sobre un conjunto de evaluacion fijo, pero no se reportan los valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (solo pesos, sin KV cache):
  - IQ1_S / IQ1_M / TQ1_0: 6,5-7,2 GB, viable en sistemas con 8 GB de RAM o GPUs de 8 GB con cuantizaciones extremas.
  - IQ2_XXS / IQ2_XS: 8,0-8,7 GB, viable en GPUs de 8 GB (RTX 3060/4060).
  - IQ3_XXS / IQ3_XS: 7,3-12,0 GB, viable en GPUs de 10 GB.
  - IQ3_S / Q3_K_S: ~12,5 GB, viable en GPUs de 12 GB (RTX 3060 12G).
  - Q4_K_S / IQ4_XS: ~16,1 GB, viable en GPUs de 16 GB (RTX 4080).
  - Q5_K_M / Q6_K: 19,8-22,9 GB, viable en GPUs de 24 GB (RTX 4090).
  - Q8_0: 29,6 GB, viable en GPUs de 32 GB.
  - F16 / BF16: 55,7 GB, requiere multiples GPUs o CPU con mucha RAM.
- KV cache compacto gracias a GQA con 2 cabezas KV: 52 KiB/token en FP16, 26 KiB/token en Q8_0, 13 KiB/token en Q4_0. Para 64K de contexto, el cache KV ocupa entre 0,85 GB (Q4_0) y 1,7 GB (FP16).
- GPUs recomendadas: RTX 3060/4060 (8 GB) para cuantizaciones IQ2, RTX 4080 (16 GB) para Q4_K_S, RTX 4090 (24 GB) para Q5_K_M o Q6_K, y A100/H100 de 32 GB para Q8_0.
- Opciones de despliegue: llama.cpp (requiere build desde master, commit 030ebb5, ya que las versiones release anteriores a b10344 no soportan la arquitectura muse_glimmer). Tambien compatible con cualquier runtime que acepte GGUF, como Ollama o LM Studio, siempre que usen una build reciente de llama.cpp.
- Latencia y throughput: no se proporcionan datos medidos. El rendimiento dependera de la cuantizacion, el hardware y la longitud de contexto.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas con otros modelos en la informacion proporcionada. Como referencia estructural, el modelo comparte tamano y arquitectura con otros VLM densos de ~30B parametros, como Llama 3.2 Vision (90B, pero con 11B y 90B de variantes) o Qwen2-VL (7B, 72B), pero no hay datos publicados que permitan una comparacion cuantitativa. La principal diferencia es su naturaleza abliterada, que lo posiciona en un nicho especifico de modelos sin censura, como los derivados de Llama-3-8B-Instruct-abliterated o Mistral-7B-Instruct-abliterated, aunque con capacidades multimodales y mayor tamano.

## Limitaciones y advertencias

- Contenido sin filtrar: el modelo no tiene mecanismos de rechazo, por lo que puede generar respuestas con contenido explicito, ofensivo o ilegal en algunas jurisdicciones. Su uso en produccion requiere salvaguardas externas y una politica de uso clara.
- Riesgo de alucinacion: al ser un modelo abliterado, la alteracion de pesos puede incrementar la probabilidad de respuestas factualmente incorrectas, especialmente en tareas de conocimiento general. No se han publicado evaluaciones de alucinacion.
- Sesgos: no se han auditado los sesgos del modelo base ni de la version abliterada. Es probable que herede sesgos del dataset de entrenamiento original, que no se ha documentado.
- Limitaciones de idioma: aunque se etiqueta como multilingue, la mayor parte de los datos de entrenamiento probablemente esten en ingles. El rendimiento en otros idiomas puede ser inferior.
- Requisitos de compilacion: la arquitectura muse_glimmer no esta soportada en builds estables de llama.cpp anteriores a b10344; se requiere compilar desde la rama master, lo que puede complicar el despliegue en entornos de produccion.
- Licencia Apache 2.0: permite uso comercial sin restricciones de atribucion, pero el modelo derivado puede estar sujeto a las condiciones del modelo base (tambien Apache 2.0). No obstante, el contenido generado puede tener implicaciones legales segun el contexto de uso.
- Sin garantias de calidad: el autor no proporciona benchmarks ni evaluaciones de rendimiento mas alla de la perplejidad interna, por lo que el comportamiento en tareas especificas debe validarse antes de su adopcion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/0bserverx/Muse-Glimmer-30B-Heretic-Uncensored-GGUF
- Modelo base (Meta Superintelligence Lab): https://huggingface.co/meta-models/Muse-Glimmer-30B
- Proyecto Heretic: https://heretic-project.org/
- Modelo abliterado de darkc0de: https://huggingface.co/darkc0de/Muse-Glimmer-30B-heretic
