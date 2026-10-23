# kin2341/sophosympatheia_Glistening-Gem-31B-v2.1-GGUF

## Resumen

Glistening-Gem-31B-v2.1 es un modelo de lenguaje de unos 30.700 millones de parámetros (etiquetado comercialmente como 31B) desarrollado por sophosympatheia mediante fusión de pesos con mergekit. El modelo parte de google/gemma-4-31B-it y combina tres derivados: Artemis-31B-v1, G4-MeroMero-v2-31B y gemma-4-Ortenzya-The-Creative-Wordsmith-31B-it-uncensored-heretic. Su objetivo declarado es la escritura creativa y la generación de prosa, mejorando la calidad de salida respecto a versiones anteriores de la saga.

La ficha que nos ocupa, kin2341/sophosympatheia_Glistening-Gem-31B-v2.1-GGUF, es una réplica del repositorio de cuantizaciones GGUF que preparó bartowski con llama.cpp build b10419 e imatrix. No aporta pesos nuevos: redistribuye el mismo conjunto de ficheros cuantizados (de bf16 a Q3/IQ3) para su uso en inferencia local con llama.cpp, Ollama, LM Studio o koboldcpp. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y ocupa 526,9 GB en total.

Su relevancia práctica es doble: por un lado, permite ejecutar un modelo de 31B especializado en prosa en GPU de consumo gracias a cuantizaciones de 17-20 GB; por otro, sirve como ejemplo de cadena de derivación (modelo base Gemma → merge → cuantización → re-subida) en la que la licencia y las capacidades reales deben verificarse en el origen, no en el espejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (modelo base declarado: google/gemma-4-31B-it); no se detalla la arquitectura interna del merge |
| Parametros totales | 30.697.345.596 (≈30,7B; etiquetado como 31B) |
| Parametros activos | no disponible (no se documenta como MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, Q4_K_S, Q4_0, IQ4_NL, IQ4_XS, Q3_K_XL, Q3_K_L, Q3_K_M, IQ3_M (la lista del README aparece truncada; pueden existir cuantizaciones Q3/IQ3/Q2 adicionales) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (etiqueta del repositorio); el modelo base es Gemma, con sus propios terminos |
| Formato de pesos | GGUF (llama.cpp b10419); safetensors en el modelo original |
| imatrix | si, aplicada durante la cuantizacion |
| Decodificacion especulativa | no |
| Perplejidad / KLD medidas | no |
| Entrada multimodal | el README de origen declara texto, imagen y audio con fichero mmproj; no se listan ficheros mmproj entre las cuantizaciones de este repo |
| Tamano del repositorio | 526,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder derivado de google/gemma-4-31B-it, aunque la información disponible no detalla la configuración interna (número de capas, dimensiones, atención local/global) ni el contexto máximo. No se trata de un modelo entrenado desde cero: es un merge de pesos con mergekit que combina tres checkpoints afinados sobre la misma base (Artemis-31B-v1, G4-MeroMero-v2-31B y gemma-4-Ortenzya-The-Creative-Wordsmith-31B-it-uncensored-heretic). No se especifican los ratios de mezcla, el método exacto de fusión (linear, SLERP, TIES, DARE) ni si hubo etapas posteriores de RLHF o DPO.

No hay información sobre volumen de tokens, composición del dataset ni proceso de alineamiento. El único dato técnico verificable del proceso de cuantización es el uso de llama.cpp build b10419 con matrices de importancia (imatrix), sin medición publicada de perplejidad o divergencia KL, por lo que no se puede cuantificar objetivamente la pérdida de calidad respecto al bf16.

El formato de prompt documentado es de estilo Gemma con turnos y canal de pensamiento:

```
<bos><|turn>system
{system_prompt}<turn|>
<|turn>user
{prompt}<turn|>
<|turn>model
<|channel>thought
<channel|>
```

## Capacidades

- Generación de texto y prosa creativa en inglés: la especialización declarada del merge es la escritura creativa, con mejora de calidad respecto a la versión anterior de Glistening-Gem.
- Canal de "thought" en el formato de prompt, que permite separar razonamiento interno de la respuesta final si el runtime lo respeta.
- Conversación multi-turno: el repositorio está etiquetado como "conversational" y el formato de prompt define system, user y model.
- Entrada multimodal declarada en el README de origen (texto, imagen y audio con fichero mmproj): capacidad heredada de la base Gemma, no verificable en este repositorio porque no se listan ficheros mmproj.
- Estilo sin filtros: uno de los componentes del merge es un derivado "uncensored-heretic", por lo que la alineación de seguridad es más laxa que en el modelo base original.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas a inglés según la etiqueta `language: en`.
- Capacidades de código y matemáticas: no documentadas; el merge no está orientado a ellas.

## Casos de uso

- Escritura de ficción y novela: el modelo está optimizado explícitamente para prosa, de modo que puede generar capítulos completos, mantener voz narrativa y reescribir pasajes con instrucciones de estilo; la cuantización Q4_K_M (19,60 GB) permite hacerlo en local en una RTX 4090 o 3090.
- Asistencia a guionistas y narradores: generación de diálogos, descripciones de escena y variantes alternativas de un mismo pasaje, aprovechando el canal `thought` para separar el borrador del razonamiento previo cuando el cliente lo soporta.
- Role-play y personajes para videojuegos o comunidades: el formato de turnos Gemma y el ajuste creativo encajan con bots de personaje en entornos autoalojados; conviene filtrar salidas por el carácter "uncensored" de uno de los componentes.
- Edición y reescritura de estilo: pasar un texto y pedir variaciones de registro (más literario, más directo, más coloquial) manteniendo contenido; útil en flujos de copywriting donde se necesita alternativa local y sin coste por token.
- Generación de datos sintéticos narrativos: producir corpus de prosa, diálogos o descripciones para entrenar o evaluar otros modelos, ejecutando el GGUF en lote con llama.cpp o a través de la API compatible con OpenAI que ofrecen Ollama y LM Studio.
- Despliegue 100 % offline con requisitos de privacidad: al ser GGUF y ejecutable en una sola GPU de 24 GB, permite procesar manuscritos o material confidencial sin enviar texto a servicios externos.
- Prototipado e investigación de merges: sirve para comparar cualitativamente el efecto de la fusión y de cada nivel de cuantización (Q8_0 frente a Q4_K_M o IQ4_XS) sobre la calidad de la prosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README de origen indica explícitamente "Perplexity/KLD measured: no", de modo que no hay métricas de degradación por cuantización.

El único conjunto de medidas encontrado es de tipo estilístico (Caliper), no de capacidad, y corresponde al modelo original Glistening-Gem-31B-v2.1, no a estas cuantizaciones:

| Metrica estilistica (Caliper) | Valor |
|---|---|
| NSFW | 32,9 |
| Tono "dark" | 19,5 |
| Tono "light" | 80,5 |
| Positividad | 0,85 |
| Inclinacion de positividad | 0,3 |

Caliper advierte que estas cifras describen inclinación tonal y no calidad, y que no se emplean para ranking.

## Requisitos de hardware

- VRAM estimada (solo pesos): bf16 61,41 GB; Q8_0 32,64 GB; Q6_K 26,73 GB; Q5_K_M 22,61 GB; Q4_K_M 19,60 GB; IQ4_XS 17,16 GB; Q3_K_L 16,81 GB. Hay que sumar la caché KV del contexto elegido, que no puede calcularse sin conocer la longitud de contexto y la configuración de atención.
- GPU de 80 GB (A100, H100): necesarias para bf16 sin offload; también cómodas para Q8_0 con contexto largo.
- GPU de 48 GB (A6000, L40S, RTX 6000 Ada): adecuadas para Q8_0 y Q6_K.
- GPU de 24 GB (RTX 3090, 4090, A10G): Q4_K_M e IQ4_XS caben con margen para contexto moderado; Q5_K_M queda en el límite y exige reducir contexto o usar offload parcial.
- GPU de 16 GB (RTX 4080, 4060 Ti 16 GB, A4000): solo cuantizaciones Q3 (16,8-17,2 GB) con offload parcial a RAM, o esperar un rendimiento bajo.
- Consumer GPU: sí, el modelo es viable en GPU de consumo a partir de 24 GB con cuantizaciones Q4; también en Apple Silicon con memoria unificada de 32 GB o más (Q4_1 incluye una nota específica sobre tokens/vatio en silicio de Apple).
- Opciones de despliegue: llama.cpp (build b10419 o superior), Ollama, LM Studio, koboldcpp y text-generation-webui. vLLM y TGI no son la vía natural para este repositorio, que solo distribuye GGUF.
- Latencia y throughput: no disponibles; no se han publicado medidas. Dependerán del ancho de banda de memoria de la GPU, del nivel de cuantización y del tamaño de contexto.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de conocimiento público general, no de la información proporcionada en esta búsqueda; la columna del modelo objeto refleja lo documentado en este repositorio.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kin2341 / Glistening-Gem-31B-v2.1 (GGUF) | 30,7B | no disponible | Prosa creativa, merge de 3 derivados Gemma | apache-2.0 en el repo, base Gemma | Solo GGUF, 0 descargas, espejo de bartowski |
| sophosympatheia/Glistening-Gem-31B-v2.1 | 30,7B | no disponible | Igual, pesos originales | apache-2.0 declarada | Repositorio original, safetensors |
| Gemma-2-27B-it (Google) | 27B | 8K | Asistente generalista | Gemma Terms of Use | Muy extendido, amplio ecosistema |
| Qwen2.5-32B-Instruct | 32,5B | 128K | Generalista, código y multilingüe | Apache-2.0 | Muy extendido, cuantizaciones oficiales y de terceros |
| Mistral-Small-24B-Instruct | 24B | 32K | Generalista, tool calling | Apache-2.0 | Extendido, buenas cuantizaciones |

Frente a estas alternativas, el modelo objeto no ofrece ventajas verificables en contexto, licencia o benchmarks: su valor está en el estilo de prosa y en la disponibilidad de cuantizaciones GGUF listas para usar, no en capacidades generalistas ni en soporte de herramientas.

## Limitaciones y advertencias

- Solo inglés: la etiqueta de idioma es `en`; no hay evidencia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinación: al ser un merge sin datos publicados de alineamiento ni evaluaciones, no hay garantías de fidelidad factual; no debe usarse como fuente de verdad sin verificación.
- Sin benchmarks: no se han publicado resultados de MMLU, HumanEval, GSM8K ni medidas de perplejidad/KLD, por lo que no se puede estimar la degradación de cada cuantización.
- Contenido sin filtrar: uno de los componentes del merge es un derivado "uncensored-heretic"; la tasa NSFW medida (32,9 en Caliper) y el tono "dark" (19,5) indican que las salvaguardas del modelo base están relajadas. Requiere filtros propios en producción.
- Licencia: la etiqueta del repositorio es apache-2.0, pero el modelo base declarado es google/gemma-4-31B-it, sujeto a los términos de Google. Un merge de pesos de un modelo Gemma no puede relicenciarse libremente sin revisar dichos términos; conviene consultar asesoría legal antes de uso comercial.
- Repositorio espejo: kin2341 replica las cuantizaciones de bartowski con 0 descargas y 0 likes. El mantenimiento, las actualizaciones y el soporte están en el repositorio original, no aquí.
- Capacidad multimodal incierta: el README declara entrada de imagen y audio con mmproj, pero entre los ficheros listados en este repositorio no aparece ninguno, y la etiqueta de pipeline `any-to-any` puede ser heredada y no reflejar el contenido real.
- Contexto desconocido: sin la longitud de contexto documentada no se pueden dimensionar despliegues con documentos largos ni calcular la VRAM de la caché KV.
- Sin decodificación especulativa: no se ofrecen borradores ni variantes optimizadas para acelerar la inferencia.
- Formato de prompt estricto: usar plantillas distintas de la documentada (turnos Gemma con `<|channel>thought`) puede degradar notablemente la calidad de salida.
- La lista de cuantizaciones del README está truncada: la disponibilidad real de Q3/IQ3/Q2 debe comprobarse en el árbol de ficheros del repositorio.

## Enlaces

- Repositorio objeto de la ficha: https://huggingface.co/kin2341/sophosympatheia_Glistening-Gem-31B-v2.1-GGUF
- Cuantizaciones originales de bartowski: https://huggingface.co/bartowski/sophosympatheia_Glistening-Gem-31B-v2.1-GGUF
- Modelo base del merge (sophosympatheia): https://huggingface.co/sophosympatheia/Glistening-Gem-31B-v2.1
- Ficha en featherless.ai (descripción del merge y componentes): https://featherless.ai/models/sophosympatheia/Glistening-Gem-31B-v2.1
- Métricas estilísticas en Caliper: https://caliperbench.com/m/glistening-gem-31b-v2.1/
- Registro en free2aitools: https://free2aitools.com/model/bartowski/sophosympatheia_glistening-gem-31b-v2.1-gguf
- llama.cpp, release b10419 usada para cuantizar: https://github.com/ggml-org/llama.cpp/releases/tag/b10419
- mergekit (herramienta de fusión): https://github.com/arcee-ai/mergekit
