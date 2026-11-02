# mradermacher/dagger-4B_SFT-GGUF

## Resumen

Dagger-4B_SFT es un modelo de lenguaje de aproximadamente 3.880 millones de parametros, afinado mediante SFT (supervised fine-tuning) por el autor dipta007 a partir de una base tipo Gemma, y distribuido en formato GGUF por mradermacher. Esta orientado especificamente a razonamiento matematico y computacional, con enfasis en el idioma bengali (bn) y en escenarios de baja disponibilidad de recursos, ademas de soportar ingles. Su rasgo diferencial es el entrenamiento "distractor-aware": el modelo ha sido expuesto a problemas matematicos con informacion irrelevante o distractores, lo que busca mejorar su robustez frente a enunciados ruidosos.

La relevancia de este modelo radica en su nicho: es un modelo pequeno (4B) especializado en matematicas para bengali, un idioma con escasa representacion en los grandes modelos fundacionales. Al estar cuantizado en multiples formatos GGUF (desde Q2_K hasta f16), puede desplegarse en hardware de consumo, lo que lo hace accesible para investigacion y aplicaciones en entornos con recursos limitados.

El repositorio aqui descrito es una distribucion de cuantizaciones estaticas del modelo original `dipta007/dagger-4B_SFT`; no introduce cambios en los pesos mas alla de la compresion. La licencia heredada es la de Gemma, lo que condiciona su uso comercial a los terminos de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base tipo Gemma); detalles especificos no disponibles |
| Parametros totales | 3.880.263.168 (aproximadamente 3,88 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | Bengali (bn) e ingles (en) |
| Licencia | Gemma (terminos de Google: https://ai.google.dev/gemma/terms) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original en transformers/safetensors |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura transformer de tipo Gemma, con 3.880 millones de parametros totales. La informacion disponible no detalla el numero de capas, dimensiones ocultas ni la longitud de contexto nativa. El proceso de entrenamiento consistio en un fine-tuning supervisado (SFT) sobre el modelo base, utilizando los datasets `dipta007/dagger` y `dipta007/DistractMath-Bn`, orientados a matematicas y a problemas con distractores en bengali.

La innovacion principal declarada es el enfoque "distractor-aware": el entrenamiento incluye problemas matematicos que contienen informacion irrelevante, de modo que el modelo aprende a identificar y descartar datos que no contribuyen a la solucion. Los tags del modelo indican tambien "computational-graph" y "reasoning", lo que sugiere un enfasis en el razonamiento paso a paso sobre operaciones y grafos computacionales. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Razonamiento matematico: resolucion de problemas aritmeticos y algebraicos, con enfasis en enunciados que contienen distractores.
- Razonamiento multi-paso: capacidad declarada de "reasoning" y "computational-graph", orientada a descomponer problemas en pasos.
- Manejo de distractores: entrenado especificamente para ignorar informacion irrelevante en el enunciado.
- Multilingue limitado: bengali (bn) e ingles (en).
- Conversacion: el repositorio se marca como "conversational", lo que indica soporte de dialogos multi-turno.
- Soporte multimodal: el repositorio incluye ficheros `mmproj` (proyeccion multimodal), lo que sugiere capacidad de vision heredada de la base, aunque no se detalla su alcance.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Tutoria matematica en bengali: el modelo puede resolver y explicar problemas aritmeticos y algebraicos en bengali, un idioma con poca cobertura en modelos generalistas, lo que lo hace util para plataformas educativas locales.
- Procesamiento de examenes con enunciados ruidosos: gracias al entrenamiento distractor-aware, puede emplearse para corregir o resolver problemas extraidos de examenes reales donde aparecen datos irrelevantes o mal formateados.
- Investigacion en modelos pequenos para idiomas de bajos recursos: sirve como punto de partida para experimentos de fine-tuning y evaluacion en bengali con hardware de consumo (cuantizaciones Q4_K_M de 2,6 GB).
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K (1,8 GB) y Q3_K_S (2,0 GB) permiten ejecutar el modelo en GPUs de gama baja o incluso en CPU mediante llama.cpp.
- Generacion de datasets sinteticos de matematicas en bengali: puede utilizarse para producir problemas resueltos paso a paso que alimenten otros pipelines de entrenamiento.
- Asistente educativo offline: al caber en GPUs de consumo, puede integrarse en aplicaciones de escritorio o moviles con llama.cpp u Ollama para asistencia matematica sin conexion.
- Analisis de cadenas de razonamiento: util para estudiar como un modelo pequeno descompone problemas y donde falla, en el contexto de investigacion sobre razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: aproximadamente 1,8 GB
  - Q3_K_S: aproximadamente 2,0 GB
  - Q4_K_M: aproximadamente 2,6 GB
  - Q5_K_M: aproximadamente 2,9 GB
  - Q6_K: aproximadamente 3,3 GB
  - Q8_0: aproximadamente 4,2 GB
  - f16: aproximadamente 7,9 GB
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para las versiones de mayor precision.
- Cabe en GPU de consumo: si, practicamente todas las cuantizaciones hasta Q8_0 caben en GPUs de 6-8 GB; la version f16 requiere 8 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base tambien puede servirse con vLLM o TGI en formato transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| dagger-4B_SFT (este) | 3,88 B | No disponible | bn, en | Gemma | GGUF, transformers |
| Qwen2.5-Math-1.5B | 1,5 B | 4.096 tokens (tipico) | en, zh | Apache 2.0 | safetensors, GGUF |
| Gemma-2-2B | 2,6 B | 8.192 tokens | multilingue | Gemma | safetensors, GGUF |
| Phi-3-mini | 3,8 B | 4.096 tokens | multilingue | MIT | safetensors, GGUF |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo Dagger que permitan una comparacion cuantitativa. Su ventaja diferencial es la cobertura del bengali en matematicas, frente a modelos como Qwen2.5-Math o Phi-3, que priorizan ingles y chino. Los datos de contexto de los modelos comparados son los tipicos publicados por sus autores, no verificados en esta ficha.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse principalmente con datos en bengali e ingles, su cobertura de otros idiomas es nula o muy limitada.
- Riesgo de alucinacion: como todo modelo generativo, puede producir pasos de razonamiento plausibles pero incorrectos, especialmente en problemas matematicos fuera de su distribucion de entrenamiento.
- Limitaciones de idioma: solo soporta bengali e ingles; no debe esperarse calidad en castellano ni en otros idiomas.
- Limitaciones de contexto: la longitud de contexto no esta documentada, lo que dificulta planificar su uso en tareas de contexto largo.
- Restricciones de licencia: la licencia Gemma impone condiciones de uso comercial y requiere aceptar los terminos de Google; no es una licencia permisiva tipo Apache o MIT.
- Cuantizaciones de baja precision: Q2_K y Q3_K_S pueden degradar notablemente la calidad del razonamiento matematico; se recomienda Q4_K_M o superior para uso en produccion.
- Sin datos de benchmarks: no hay evidencia publica de su rendimiento frente a alternativas, por lo que cualquier adopcion en produccion deberia ir precedida de una evaluacion propia.
- Suplemento multimodal: la presencia de ficheros `mmproj` no garantiza que la vision funcione correctamente en todas las cuantizaciones; conviene validarla.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/dagger-4B_SFT-GGUF
- Modelo base: https://huggingface.co/dipta007/dagger-4B_SFT
- Dataset principal: https://huggingface.co/datasets/dipta007/dagger
- Dataset de distractores: https://huggingface.co/datasets/dipta007/DistractMath-Bn
- Licencia Gemma: https://ai.google.dev/gemma/terms
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#dagger-4B_SFT-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
