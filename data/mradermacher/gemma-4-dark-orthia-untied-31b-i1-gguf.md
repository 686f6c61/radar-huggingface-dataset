# mradermacher/Gemma-4-Dark-Orthia-Untied-31B-i1-GGUF

## Resumen

Gemma-4-Dark-Orthia-Untied-31B-i1-GGUF es una colección de cuantizaciones GGUF con imatrix (matriz de importancia) del modelo Nimbz/Gemma-4-Dark-Orthia-Untied-31B, publicada por mradermacher, un cuantizador muy prolífico de la comunidad de Hugging Face. El modelo base es un merge (fusión con mergekit) de aproximadamente 31-32 mil millones de parámetros construido sobre la arquitectura Gemma-4, orientado explícitamente a roleplay, escritura creativa, narrativa de personajes y conversación, con un perfil "dark" y de bajas tasas de rechazo (low-refusal), lo que lo sitúa en la categoría de modelos no aptos para todos los públicos.

El sufijo "Untied" indica que el modelo utiliza embeddings de entrada y cabecera de salida (lm_head) no atados (untied), una variante arquitectónica respecto al Gemma original que puede mejorar la calidad de generación a costa de más memoria. La relevancia de esta ficha está en el formato: las cuantizaciones i1 (imatrix-weighted) de mradermacher permiten ejecutar un modelo de 32B en hardware de consumo con una degradación de calidad mínima, con 24 variantes que van desde los 7,7 GB (IQ1_S) hasta los 26,5 GB (Q6_K).

Es relevante ahora porque los merges de roleplay sobre bases Gemma de tamaño medio son una de las categorías más activas de la comunidad open source, y las cuantizaciones imatrix son el estándar de facto para inferencia local con llama.cpp, Ollama, LM Studio y backends compatibles con GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Gemma-4 (detalle de capas no disponible) |
| Parametros totales | 32.106.631.740 (~32B, dato real de safetensors) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (más archivo imatrix de 0,1 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base, Nimbz/Gemma-4-Dark-Orthia-Untied-31B, es un merge creado con mergekit a partir de la arquitectura Gemma-4 de unos 31-32 mil millones de parametros. La etiqueta "untied-lm_head" indica que se han desatado (untied) los pesos de embedding de entrada y la cabecera de salida, lo que duplica la memoria de esos tensores pero permite al modelo optimizar por separado la representacion de entrada y la proyeccion de salida, algo habitual en merges de roleplay que buscan mayor calidad de prosa. El README del cuantizador indica ademas que se trata de un modelo de vision (los archivos mmproj, si existen, estarian en el repositorio de cuantizaciones estaticas), aunque el modelo base no documenta esta capacidad.

No hay informacion disponible sobre el proceso de entrenamiento del modelo base: numero de tokens, composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Al ser un merge, probablemente combina pesos de varios modelos fine-tuned sobre la base Gemma-4, pero el detalle de la receta no esta en la informacion proporcionada. La contribucion de mradermacher se limita a la cuantizacion: se ha generado una matriz de importancia (imatrix) a partir de datos de calibracion para producir cuantizaciones weighted, que asignan mas bits a los tensores criticos y ofrecen mejor calidad por GB que las cuantizaciones estaticas equivalentes.

## Capacidades

- Generacion de texto conversacional orientada a roleplay y roleplay de personajes (character-rp), el caso de uso principal segun las etiquetas del modelo.
- Escritura creativa y storytelling: narrativa extensa, ficcion y desarrollo de tramas.
- Perfil "dark" y low-refusal: menor propension a negarse a peticiones en contextos de ficcion, con contenido NSFW posible; el repositorio esta marcado como "not-for-all-audiences".
- Capacidades de vision: el README del cuantizador lo declara como modelo de vision (archivos mmproj en el repo estatico), aunque sin documentacion detallada.
- Posible soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no documentadas; solo se declara el ingles.

## Casos de uso

- Roleplay interactivo con personajes: el modelo puede sostener conversaciones multi-turno interpretando personajes coherentes, su caso de uso principal segun las etiquetas character-rp y roleplay.
- Escritura de ficcion y novelas por capitulos: orientado a storytelling, puede usarse en editores como SillyTavern o interfaces locales para redactar y continuar narrativas largas en ingles.
- Generacion de contenido creativo maduro: su perfil low-refusal lo hace adecuado para escritores de ficcion para adultos que necesitan un modelo que no bloquee escenas oscuras dentro de un contexto narrativo.
- Chatbot conversacional local: ejecutable via Ollama o LM Studio en un PC de consumo con la cuantizacion Q4_K_M (~19,6 GB), util como asistente de escritura privado sin envio de datos a la nube.
- Experimentacion con merges y cuantizacion: el archivo imatrix de 0,1 GB permite a usuarios avanzados crear sus propias cuantizaciones personalizadas con llama.cpp.
- Prueba de la arquitectura untied: los desarrolladores pueden comparar el comportamiento del lm_head desatado frente a versiones tied del mismo tamaño de base para evaluar diferencias en calidad de prosa.
- Prototipado con vision (si se confirma la capacidad mmproj): analisis de imagenes en flujos creativos, pendiente de verificacion con los archivos del repositorio estatico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un merge de la comunidad orientado a roleplay y escritura creativa, no hay evaluaciones estandarizadas (MMLU, HumanEval, GSM8K, etc.) documentadas ni para el modelo base ni para las cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos solos, segun la tabla de cuantizaciones): IQ1_S ~7,7 GB; IQ2_M ~11,6 GB; IQ3_M ~15,1 GB; IQ4_XS ~17,6 GB; Q4_K_M ~19,6 GB; Q5_K_M ~22,9 GB; Q6_K ~26,5 GB. Anade 1-3 GB adicionales para KV cache segun contexto.
- Consumer GPUs: con Q4_K_M (19,6 GB) cabe en una RTX 4090 (24 GB) con contexto moderado; con IQ4_XS (17,6 GB) o IQ3_M (15,1 GB) cabe en una RTX 3090 o RTX 4080/5070 Ti de 16 GB con margen ajustado. Cuantizaciones IQ2 permiten ejecutarlo en GPUs de 12 GB con perdida de calidad notable.
- Sin GPU, es viable en CPU con RAM de 32 GB usando cuantizaciones de hasta Q5_K_M, con velocidades de generacion bajas (tipicamente 2-5 tokens/s en CPUs de escritorio modernas, estimacion no oficial).
- GPUs de datacenter: A100/H100 ejecutan sin problemas cualquier cuantizacion incluida Q6_K con contextos largos y alto throughput.
- Despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp (habitual para roleplay), y cualquier backend compatible con GGUF. No esta orientado a vLLM o TGI, que prefieren safetensors; para eso se usaria el modelo base.
- Latencia y throughput: no disponibles oficialmente; las cuantizaciones Q4_0 y Q4_K_M estan marcadas como "fast" por el cuantizador.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Orientacion | Licencia |
|---|---|---|---|---|
| Gemma-4-Dark-Orthia-Untied-31B (este) | ~32B | GGUF i1 | Roleplay, dark, low-refusal | Apache-2.0 |
| Merges roleplay sobre Gemma de ~27B (p. ej. variantes de la comunidad) | ~27B | GGUF/safetensors | Roleplay, escritura creativa | Variable |
| Mistral Small 24B (bases para merges de roleplay) | ~24B | GGUF/safetensors | Uso general, base para fine-tunes | Apache-2.0 |

Comparativa orientativa: frente a bases de 24-27B, este merge de 32B ofrece presumiblemente mayor calidad de prosa por su tamaño y su lm_head desatado, a cambio de un requisito de memoria superior (~4-8 GB mas en cuantizacion equivalente). Frente a modelos de uso general del mismo tamaño, su ventaja es el perfil low-refusal y la especializacion en narrativa; su desventaja es la ausencia de benchmarks, la falta de documentacion sobre tool calling y el enfoque monolingue en ingles. Datos concretos de rendimiento comparado: no disponibles.

## Limitaciones y advertencias

- Contenido sensible: el modelo esta etiquetado como dark, nsfw y not-for-all-audiences; genera texto con menos filtros de seguridad y no es adecuado para entornos laborales ni para menores de edad.
- Riesgo de alucinacion: no cuantificado; al ser un merge orientado a ficcion, es esperable que invente hechos con fluidez, especialmente fuera de contextos narrativos.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Longitud de contexto: no documentada en la informacion disponible; verificar la configuracion del modelo base antes de planificar contextos largos.
- Calidad segun cuantizacion: las variantes IQ1/IQ2 (7,7-11,6 GB) estan marcadas explicitamente como de calidad muy baja ("for the desperate"); para uso serio se recomienda Q4_K_M o superior.
- Vision sin confirmar: la declaracion de modelo de vision proviene del README del cuantizador; los archivos mmproj estarian en el repositorio estatico y deben verificarse antes de depender de esa capacidad.
- Licencia: Apache-2.0 permite uso comercial, pero el contenido generado (NSFW, violencia, tematica oscura) puede incumplir las politicas de plataformas de distribucion de terceros.
- Sin benchmarks ni documentacion de entrenamiento: evaluar el modelo con pruebas propias antes de cualquier despliegue critico.

## Enlaces

- Repositorio de cuantizaciones i1 (esta ficha): https://huggingface.co/mradermacher/Gemma-4-Dark-Orthia-Untied-31B-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Gemma-4-Dark-Orthia-Untied-31B-GGUF
- Modelo base: https://huggingface.co/Nimbz/Gemma-4-Dark-Orthia-Untied-31B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Gemma-4-Dark-Orthia-Untied-31B-i1-GGUF
- Guia de uso de GGUF (referenciada en el README): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Paper, blog o demo oficiales: no disponibles
