# lorenzonunzi/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF es una cuantización GGUF derivada de DeepSeek-V4.1-Flash-1017, un modelo de lenguaje de tipo Mixture of Experts con 763.000 millones de parámetros totales y 384 expertos, desarrollado originalmente por DeepSeek. Esta variante concreta la publica el usuario lorenzonunzi a partir del backbone GSQ-RCO de ISTA-DASLab y aplica una edición de "abliteration" (proyección fuera de la dirección de rechazo) sobre los tensores densos que escriben en el residual, manteniendo intactos los expertos enrutados. El objetivo declarado es eliminar los rechazos del modelo sin degradar su precisión en tareas de razonamiento.

La relevancia de esta ficha es doble. Por un lado, documenta un modelo de escala extrema (763B) empaquetado para ejecutarse en una única GPU de 12 GB mediante el runtime Strata, que mantiene el backbone en memoria del sistema y transmite la tabla Engram desde un SSD. Por otro lado, ilustra una técnica de modificación de pesos (edición unidireccional de la dirección de rechazo con fuerza 2.0) que, según las mediciones del autor, reduce a cero la tasa de jailbreak en inglés sin coste apreciable en GPQA-Diamond ni en AIME25.

El repositorio ocupa 414,2 GB e incluye varias "rungs" de cuantización (IQ1_M, IQ2_XXS, IQ2_XS) que van de 231 a 266 GB. La licencia es MIT y el pipeline es text-generation. No se dispone de información sobre idiomas soportados ni de la model card original de DeepSeek en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con 384 expertos, capas densas de escritura residual, mecanismo Engram y cuantización GSQ-RCO |
| Parametros totales | 551.880.949.208 (dato real de safetensors); la model card cita 763B para el modelo original |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_M (1,75 bpw), IQ2_XXS (2,0 bpw), IQ2_XS (2,25 bpw) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (con archivo Engram separado de 110 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture of Experts con 384 expertos enrutados y una arquitectura que DeepSeek denomina "Engram": una tabla de búsqueda de 110 GB que se mantiene separada de los shards principales y que Strata transmite desde SSD. La cuantización GSQ-RCO de ISTA-DASLab aplica un redondeo de baja precisión aprendido sobre los expertos enrutados. Sobre ese backbone, esta variante sustituye únicamente los tensores densos que escriben en el residual: la salida de atención (`attn_output_b`), la proyección down del experto compartido (`ffn_down_shexp`) y la proyección de valor Engram (`engram_wkv`). Los expertos enrutados se conservan byte a byte, de modo que el redondeo aprendido de GSQ se preserva íntegro y cada archivo mantiene el mismo tamaño y los mismos requisitos de ejecución que el original.

La edición aplicada es una proyección fuera de la dirección de rechazo con fuerza 2.0, calculada a precisión completa e incrustada en los pesos antes de cuantizar al tipo exacto por tensor de ISTA. Según el autor, el desplazamiento de distribución medido como KL respecto al rung original es de aproximadamente 0,02 (cota inferior de top-64), lo que sitúa la precisión en tareas dentro de un punto porcentual del cuantizado original. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline text-generation, tag conversational).
- Razonamiento de alta exigencia: la model card reporta GPQA-Diamond y AIME25, lo que indica capacidad de razonamiento científico y matemático.
- Modo "thinking" configurable por esfuerzo de razonamiento (la model card cita "reasoning effort 50" y "Thinking high (30)").
- Ejecución local en hardware de consumo mediante el runtime Strata, con backbone en RAM y tabla Engram en SSD.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Eliminación de rechazos en inglés: la tasa de JailbreakBench (EN) cae del 85,2 % al 0,0 % en IQ2_XXS, del 86,4 % al 0,0 % en IQ2_XS y del 88,9 % al 0,0 % en IQ1_M.
- No se dispone de información sobre tool calling, function calling, capacidades de agente, visión, audio ni multilingüismo.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo una edición unidireccional de la dirección de rechazo afecta a la tasa de jailbreak (de ~85 % a 0 % en EN) sin degradar GPQA-Diamond (83,3 % en ambos casos), lo que lo hace útil para experimentos controlados de abliteration.
- Evaluación de cuantizaciones de baja precisión: con rungs de 1,75, 2,0 y 2,25 bpw y métricas MMLU-500 (80,6 %, 82,8 %, 81,6 %) y KL frente al original, sirve para medir la degradación de un MoE de 763B al comprimirlo agresivamente.
- Despliegue local en una sola GPU de 12 GB: mediante Strata, el backbone reside en memoria del sistema y la tabla Engram se transmite desde SSD, lo que permite servir un modelo de escala extrema en una máquina de consumo.
- Generación de texto sin rechazos en flujos creativos o de ficción: la edición elimina los rechazos en inglés, lo que resulta adecuado para escritura narrativa que aborde temas sensibles sin interrupciones del modelo.
- Reproducción de benchmarks de razonamiento: el autor publica logs por pregunta en el repositorio de métricas, lo que facilita la verificación independiente de GPQA-Diamond (198 preguntas) y AIME25 (30 preguntas).
- Estudio de arquitecturas con memoria externa: la separación entre shards y tabla Engram de 110 GB permite investigar el rendimiento de esquemas de streaming desde SSD en inferencia de modelos grandes.

## Benchmarks y rendimiento

| Benchmark | IQ2_XXS original | IQ2_XXS uncensored | IQ2_XS original | IQ2_XS uncensored | IQ1_M original | IQ1_M uncensored |
|---|---|---|---|---|---|---|
| JailbreakBench (EN) | 85,2 % | 0,0 % | 86,4 % | 0,0 % | 88,9 % | 0,0 % |
| XSTest (safe refused) | 7,6 % | 0,0 % | 4,0 % | 0,4 % | 4,8 % | 0,0 % |
| Thinking high (30) | 27/30 | 0/30 | 27/30 | 2/30 | 27/30 | 1/30 |
| MMLU (500) | 82,8 % (p=0,27) | — | 81,6 % (p=1,00) | — | 80,6 % (p=0,75) | — |
| KL al original | — | 0,0225 | — | 0,0272 | — | 0,0207 |

| Benchmark de razonamiento (IQ2_XXS) | GSQ-RCO original | Uncensored |
|---|---|---|
| GPQA-Diamond (198 preguntas) | 83,3 % | 83,3 % |
| AIME25 (30 preguntas) | 76,7 % | 80,0 % |

## Requisitos de hardware

- VRAM estimada: el autor indica que el modelo corre en una única GPU de 12 GB con Strata, ya que el backbone reside en memoria del sistema y la tabla Engram se transmite desde SSD.
- Espacio en disco: 414,2 GB de repositorio; cada rung ocupa entre 231 GB (IQ1_M) y 266 GB (IQ2_XS), más un archivo Engram compartido de 110 GB que debe descargarse por separado desde ISTA-DASLab.
- GPU recomendadas: no disponible; la model card solo menciona el requisito de 12 GB de VRAM.
- Cabe en GPU de consumo: sí, según el autor, en una GPU de 12 GB con Strata.
- Opciones de despliegue: Strata (runtime indicado por el autor). La model card advierte que DeepSeek-V4.1 con archivo Engram separado todavía no está soportado en llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (lorenzonunzi) | 551,9B (safetensors); 763B según model card | no disponible | MIT | GGUF | Edición de rechazo, rungs de 231-266 GB |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | 763B | no disponible | no disponible | GGUF | Backbone original sin edición de rechazo |
| AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF | 763B | no disponible | no disponible | GGUF | Misma edición de rechazo, publicada por AtomicChat |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | 763B | no disponible | no disponible | no disponible | Modelo base original de DeepSeek |

## Limitaciones y advertencias

- El clasificador de rechazo lee el inicio de la respuesta, por lo que un rechazo suave situado más adelante en el texto puede pasar como respuesta válida.
- La edición elimina los rechazos en todos los temas; no conserva un subconjunto más estrecho de ellos.
- Con el modo thinking activado, la edición planifica una respuesta a una petición (texto truncado en la model card); conviene revisar el comportamiento en producción.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas.
- El modelo no está soportado todavía en llama.cpp; requiere Strata y la descarga separada de la tabla Engram de 110 GB desde ISTA-DASLab.
- La licencia MIT permite uso comercial, pero la eliminación de rechazos puede incumplir políticas de uso de plataformas intermedias o requisitos regulatorios en despliegues públicos.
- Los benchmarks de razonamiento se midieron con n=30 en AIME25, por lo que la diferencia de 76,7 % a 80,0 % está dentro del ruido estadístico.
- El repositorio no tiene descargas ni likes y fue creado y actualizado el mismo día (2026-11-13), lo que limita la validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/lorenzonunzi/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF
- Modelo base cuantizado: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo base original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Variante equivalente de AtomicChat: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF
- Repositorio de métricas: https://huggingface.co/datasets/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF-metrics
- Runtime Strata: https://github.com/Niko1221/Strata
- Atomic Chat: https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
