# OS-Software/gemma-4-31B-it-qat-heretic-japanese-imatrix-GGUF

## Resumen

Gemma-4-31B-it-qat-heretic-japanese-imatrix-GGUF es una ficha derivada del modelo multimodal google/gemma-4-31B-it, publicada por el usuario OS-Software. Se trata de una version cuantizada de forma agresiva (formato GGUF) de un checkpoint previamente desalineado en seguridad ("heretic", "uncensored", "abliterated") y reoptimizada con una matriz de importancia (imatrix) especifica para escritura en japones. El resultado es un modelo de ~30.700 millones de parametros pensado para inferencia local eficiente, no para servicios publicos.

El modelo base pertenece a la familia Gemma 4 de Google DeepMind, una familia multimodal que procesa texto, imagen y video (con audio nativo solo en E2B, E4B y 12B) y que admite hasta 256.000 tokens de contexto en los tamanos medios. La variante 31B es la mayor de la familia y, por convencion de nombres (el sufijo A4B identifica al unico Mixture-of-Experts de la gama), corresponde a una arquitectura densa.

Su relevancia ahora es doble: por un lado, demuestra que el entrenamiento consciente de cuantizacion (QAT) permite reducir drasticamente los requisitos de memoria manteniendo calidad cercana a bfloat16; por otro, ilustra el ecosistema de derivados sin alineacion de seguridad que se construyen sobre pesos abiertos. El autor restringe explicitamente su uso a investigacion, estudios de alineacion y red-teaming.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4); variante densa de 31B. Confirmacion explicita de denso/MoE para este tamano: no disponible |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | No aplica si es denso; no disponible si fuese MoE |
| Longitud de contexto | Hasta 256.000 tokens (segun la familia Gemma 4; el valor exacto para este derivado no se confirma en la informacion disponible) |
| Tipos de cuantizacion | GGUF derivado de un checkpoint QAT Q4_0, con imatrix optimizada para japones. Niveles concretos (Q4_K_M, Q5_K_M, Q8_0, etc.): no disponibles |
| Idiomas soportados | Familia Gemma 4: mas de 140 idiomas. Idiomas declarados para este repositorio: no disponibles. La imatrix esta optimizada para japones |
| Licencia | apache-2.0 (con enlace adicional a la licencia de Gemma 4) |
| Formato de pesos | GGUF (biblioteca declarada: transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4: un transformer multimodal que acepta entradas de texto, imagen con soporte de relacion de aspecto y resolucion variable, y video, generando salida de texto. La familia incorpora modos de razonamiento configurables ("thinking modes"), soporte nativo de function calling y una ventana de contexto de hasta 256.000 tokens en los modelos medios. El checkpoint original ha pasado por un pipeline de Quantization-Aware Training (QAT), que produce pesos de precision reducida capaces de conservar una calidad cercana a bfloat16. Google publica estos checkpoints en cuatro variantes: sin cuantizar (Q4_0), GGUF (Q4_0), movil (wNa8o8) y tensores comprimidos w4a16 para vLLM.

Sobre ese material, OS-Software ha aplicado dos transformaciones adicionales. La primera es un proceso de reduccion de alineacion de seguridad del tipo "abliteration"/heretic, que elimina o atenua los rechazos del modelo. La segunda es una cuantizacion GGUF guiada por una imatrix calibrada con texto en japones, lo que sesga la asignacion de bits hacia los pesos mas relevantes para ese idioma. El numero de tokens de entrenamiento, la composicion exacta del dataset y si hubo RLHF o DPO no se detallan en la informacion disponible. El autor advierte de que puede aparecer bucle repetitivo en la generacion y recomienda subir `repeat-penalty` a 1.1 como mitigacion.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento configurables (heredados de la familia Gemma 4).
- Comprension de imagenes con soporte de resolucion y relacion de aspecto variable.
- Procesamiento de video como entrada (todas las variantes de la familia); audio no soportado en el tamano 31B.
- Capacidades de codigo y agenticas mejoradas respecto a generaciones anteriores de Gemma.
- Soporte nativo de function calling y de prompt de sistema.
- Multilingue en mas de 140 idiomas en la familia base, con la imatrix de este derivado orientada especificamente a japones.
- Generacion con alineacion de seguridad sustancialmente reducida: puede producir contenido danino, sesgado u ofensivo que el modelo base rechazaria.
- Capacidades de cuantizacion QAT en formato GGUF para despliegue en hardware de gama de consumo.

## Casos de uso

- Investigacion en seguridad y alineacion: el modelo sirve como sujeto de pruebas para medir que tipo de contenido emerge cuando se retira la alineacion, y para comparar contra el modelo base alineado.
- Red-teaming y evaluacion de filtros: util para generar intentos de jailbreak y contenido limite que permitan validar clasificadores y guardarrailes antes de ponerlos en produccion.
- Estudio de ablacion de alineacion: permite analizar que capacidades se degradan, se mantienen o se amplifican tras el proceso "heretic", comparando contra los checkpoints QAT oficiales.
- Generacion de texto en japones en local: la imatrix optimizada para este idioma busca maximizar la calidad de escritura japonesa en un unico equipo con GPU de consumo.
- Procesamiento multimodal offline: transcripcion descriptiva de imagenes y video en entornos sin conexion, aprovechando el pipeline image-text-to-text.
- Prototipado de agentes con contexto largo: los hasta 256.000 tokens de ventana permiten mantener conversaciones o documentos extensos en memoria durante pruebas de razonamiento multi-paso.
- Analisis de corpus sin censura previa: investigacion sobre contenido historico, literario o sensible que los modelos alineados tienden a rechazar, siempre en un marco de investigacion controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento de parametros (~30,7B) y del tamano tipico de cada nivel de cuantizacion; no proceden de mediciones publicadas por el autor.

- Peso de los parametros en memoria (solo pesos, sin cache KV):
  - BF16/FP16: ~61 GB.
  - Q8_0: ~33 GB.
  - Q6_K: ~25 GB.
  - Q5_K_M: ~22 GB.
  - Q4_K_M: ~18-19 GB.
  - Q3_K_M: ~15 GB.
  - Q2_K: ~11-12 GB.
- Cache KV: con ventana de 256.000 tokens el consumo de cache KV crece de forma muy significativa; en la practica conviene limitar el contexto o usar cuantizacion de la cache KV para que quepa en GPU de consumo.
- GPU recomendadas: A100 80 GB o H100 para BF16; dos RTX 4090 (24 GB cada una), RTX 5090 (32 GB) o A6000 para Q5/Q6/Q8; una sola RTX 4090 o RTX 3090 (24 GB) para Q4 con contexto moderado.
- Cabe en GPU de consumo: si, en Q4 o inferiores con una GPU de 24 GB, asumiendo contexto reducido y teniendo en cuenta que el repo ocupa 64,2 GB en total entre todos sus ficheros.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y koboldcpp son las rutas naturales para GGUF. vLLM admite GGUF con soporte limitado; la variante oficial de tensores comprimidos w4a16 de Gemma 4 esta optimizada para vLLM. TGI no es la via recomendada para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Alineacion de seguridad | Disponibilidad |
|---|---|---|---|---|---|---|
| OS-Software/gemma-4-31B-it-qat-heretic-japanese-imatrix-GGUF | ~30,7B | Hasta 256K (familia) | apache-2.0 | GGUF | Reducida (heretic/abliterated) | Publico en HuggingFace, 0 descargas |
| google/gemma-4-31B-it (base) | ~30,7B | Hasta 256K | apache-2.0 | safetensors, GGUF, w4a16, wNa8o8 | Estandar de Google | Publico, con soporte oficial |
| OS-Software/gemma-4-31B-it-qat-q4_0-unquantized-uncensored-heretic (parent) | ~30,7B | Hasta 256K | apache-2.0 | Sin cuantizar (Q4_0) | Reducida | Publico |
| google/gemma-4-26B-A4B (variante MoE de la familia) | 26B totales, 4B activos | Hasta 256K | apache-2.0 | Multiples | Estandar de Google | Publico |

No se dispone de datos de rendimiento comparado (benchmarks) para ninguna de estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Alineacion de seguridad sustancialmente reducida: el propio autor advierte de mayor probabilidad de generar contenido danino, inexacto, sesgado u ofensivo.
- Uso restringido a investigacion: la model card pide explicitamente evitar su despliegue en servicios publicos o de cara al usuario final.
- Riesgo de bucle repetitivo en la generacion; el autor sugiere elevar `repeat-penalty` a 1.1.
- Riesgo elevado de alucinacion: la model card indica que todas las salidas deben tratarse como no fiables y verificarse de forma independiente.
- La imatrix optimizada para japones puede degradar el rendimiento relativo en otros idiomas si se compara con cuantizaciones genericas.
- Licencia: el repositorio declara apache-2.0, pero enlaza tambien a la licencia especifica de Gemma 4, que incluye terminos de uso adicionales; conviene verificar ambas antes de cualquier uso comercial.
- Idiomas soportados en este repositorio no declarados explicitamente.
- Ausencia total de benchmarks publicados y de validacion por la comunidad (0 descargas en el momento de la informacion), lo que impide estimar su calidad real frente a alternativas.
- El repositorio ocupa 64,2 GB, por lo que su descarga y almacenamiento requieren planificacion.
- No hay datos confirmados sobre si la variante 31B es densa o MoE, lo que afecta a las estimaciones de memoria en inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OS-Software/gemma-4-31B-it-qat-heretic-japanese-imatrix-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Modelo padre: https://huggingface.co/OS-Software/gemma-4-31B-it-qat-q4_0-unquantized-uncensored-heretic
- Coleccion oficial Gemma 4 QAT Q4_0: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- Repositorio GitHub de Gemma: https://github.com/google-gemma
- Blog de lanzamiento del QAT de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Informe tecnico (arXiv 2607.02770): https://arxiv.org/abs/2607.02770
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Proyecto Heretic (p-e-w): https://github.com/p-e-w

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utiles son los presentes en la model card y en los metadatos de HuggingFace.
