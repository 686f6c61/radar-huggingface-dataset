# Frommel/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive es una cuantizacion GGUF de la familia Qwen3.6, concretamente del modelo base Qwen/Qwen3.6-35B-A3B, publicada por el usuario Frommel (atribuida en la model card a HauhauCS). Se trata de una variante "abliterated" o descensurada que elimina los mecanismos de rechazo del modelo original sin modificar el dataset de entrenamiento ni las capacidades subyacentes. La model card declara 0 rechazos sobre 465 prompts de prueba en la variante Aggressive.

El modelo conserva la arquitectura del Qwen3.6 original: un transformer hibrido con mezcla de expertos (MoE) de 35.000 millones de parametros totales y aproximadamente 3.000 millones activos por token, con 256 expertos y 8 enrutados por token. Incorpora atencion lineal combinada con atencion softmax completa en proporcion 3:1, 40 capas y una ventana de contexto nativa de 262.144 tokens. Es nativamente multimodal (texto, imagen y video) mediante un proyector mmproj separado en formato f16.

Su relevancia radica en dos factores: por un lado, ofrece las capacidades multimodales y de razonamiento de un MoE de 35B en un formato GGUF cuantizado que cabe en GPUs de consumo (desde 11 GB en IQ2_M hasta 44 GB en Q8_K_P); por otro, elimina las restricciones de contenido del modelo base, lo que lo hace atractivo para investigacion sobre alineamiento y para aplicaciones creativas o de rol, pero tambien plantea riesgos evidentes de uso irresponsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE con atencion lineal + softmax completa (3:1), 40 capas |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | ~3B por token (256 expertos, 8 enrutados) |
| Longitud de contexto | 262.144 tokens (262K nativo) |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_NL, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, Q2_K_P, IQ2_M; mmproj f16 separado |
| Idiomas soportados | Ingles, chino, multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con imatrix); repo de 247,4 GB con multiples variantes |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.6-35B-A3B original: un transformer con mezcla de expertos que combina capas de atencion lineal con capas de atencion softmax completa en una proporcion 3:1, repartidas en 40 capas. El MoE cuenta con 256 expertos de los que se enrutan 8 por token, lo que resulta en aproximadamente 3.000 millones de parametros activos sobre un total de 34,7B. Esta configuracion busca reducir el coste computacional por token manteniendo la capacidad representacional de un modelo grande. El modelo es nativamente multimodal, con soporte de texto, imagen y video a traves de un proyector (mmproj) que se distribuye como archivo independiente.

Sobre el entrenamiento del modelo base no se proporciona informacion detallada en la model card: no se especifica el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. Lo que si se indica es que la variante uncensored no modifica el dataset ni las capacidades del original, sino que aplica una tecnica de "abliteration" (eliminacion de direcciones de rechazo en el espacio de activaciones) para descensurar el modelo. Las cuantizaciones se generaron con importance matrix (imatrix) para preservar la calidad sobre los pesos abliterated, y las variantes K_P ("Perfect") son perfiles de cuantizacion personalizados que, segun el autor, mejoran la calidad en uno o dos niveles a cambio de un 5-15% mas de tamano. El modelo incluye modo thinking por defecto, con parametros de muestreo recomendados distintos para thinking y non-thinking.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 262K tokens.
- Razonamiento en modo thinking (por defecto) y modo non-thinking, con hiperparametros de muestreo diferenciados.
- Comprension de imagenes y video mediante el proyector mmproj en formato f16.
- Capacidades de codigo y matematicas heredadas del Qwen3.6 base (no se detallan benchmarks en la model card).
- Soporte multilingue: ingles, chino y otros idiomas (categoria "multilingual").
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con runtimes GGUF estandar (llama.cpp, LM Studio).
- Plantilla de chat Jinja (requiere `--jinja` en llama.cpp para un manejo correcto).
- Descensuracion completa en la variante Aggressive: 0 rechazos declarados sobre 465 prompts; puede anadir descargos breves heredados del entrenamiento base, pero genera el contenido completo.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: la variante abliterated permite estudiar como se comporta un modelo sin mecanismos de rechazo frente a uno alineado, comparando respuestas sobre el mismo conjunto de prompts y midiendo la degradacion de capacidades tras la ablacion.
- Generacion creativa de ficcion sin restricciones: escritura de narrativa adulta, terror o dialogos controvertidos donde el modelo base rechazaria; el contexto de 262K permite mantener coherencia en novelas o guiones largos.
- Role-play y personajes: conversaciones multi-turno con personalidad consistente gracias a la ventana de contexto extendida y al modo thinking para mantener la coherencia del personaje.
- Procesamiento multimodal local: analisis de imagenes y video en equipos de consumo usando la variante IQ4_XS (19 GB) junto con el mmproj f16, sin depender de APIs externas.
- Despliegue en local para desarrolladores: integracion en llama.cpp o LM Studio con cuantizaciones desde 11 GB (IQ2_M) para GPUs de gama media, o Q8_K_P (44 GB) para estaciones de trabajo.
- Analisis de documentos largos: resumen y extraccion de informacion de contratos, informes o transcripciones que superan los 100K tokens, aprovechando el contexto nativo de 262K y el modo thinking para razonamiento sobre el documento.
- Prototipado de agentes conversacionales sin filtros: entornos de prueba donde se necesita evaluar la robustez de un pipeline frente a entradas adversas sin que el modelo las rechace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo declara una metrica de descensuracion (0/465 rechazos) y no incluye resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (pesos del modelo principal, sin contar el mmproj de 899 MB ni el contexto KV cache):
  - IQ2_M: ~11 GB
  - IQ3_M: ~15 GB
  - Q2_K_P: ~15 GB
  - IQ4_XS: ~19 GB
  - Q3_K_P: ~19 GB
  - IQ4_NL: ~20 GB
  - Q4_K_M: ~21 GB
  - Q4_K_P: ~23 GB
  - Q5_K_P: ~28 GB
  - Q6_K_P: ~31 GB
  - Q8_K_P: ~44 GB
- Cabe en GPU de consumo: si, desde IQ2_M (~11 GB) en RTX 3080/4070/4080; IQ4_XS o Q4_K_M (~19-21 GB) en RTX 3090/4090 (24 GB); Q6_K_P o Q8_K_P requieren 31-44 GB, por lo que necesitan RTX 4090 con offload parcial o GPUs profesionales (A6000, A100 40/80 GB, H100).
- El contexto de 262K requiere VRAM adicional significativa para la KV cache; se recomienda mantener al menos 128K segun la model card para preservar capacidades de thinking.
- Opciones de despliegue: llama.cpp (con flag `--jinja`), LM Studio, y cualquier runtime compatible con GGUF. No se menciona soporte nativo en vLLM o TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | 34,7B | ~3B | 262K | Texto, imagen, video | Apache 2.0 | GGUF |
| Qwen/Qwen3.6-35B-A3B (base) | 34,7B | ~3B | 262K | Texto, imagen, video | Apache 2.0 | safetensors |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa mas relevante es con el modelo base Qwen3.6-35B-A3B, del que esta variante hereda arquitectura, contexto y capacidades, diferenciandose unicamente por la descensuracion y el formato GGUF cuantizado. No se dispone de datos de benchmarks para comparar el rendimiento numerico con otras alternativas.

## Limitaciones y advertencias

- Modelo descensurado: no aplica filtros de seguridad ni rechazos, por lo que puede generar contenido danino, ilegal, sexual explicito, violento o desinformativo. No apto para produccion orientada al publico general sin moderacion externa.
- La descensuracion puede degradar capacidades de razonamiento o aumentar la tasa de alucinacion respecto al modelo base; la model card no aporta mediciones al respecto.
- Puede anadir descargos breves heredados del entrenamiento base aunque genere el contenido completo; no son rechazos pero pueden aparecer en la salida.
- Idiomas: el soporte declarado se centra en ingles y chino; el rendimiento en castellano no esta documentado y puede ser inferior.
- Sesgos: no se documentan sesgos especificos, pero al eliminar la alineacion se pueden amplificar sesgos presentes en el modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el uso de un modelo descensurado conlleva responsabilidad legal y etica sobre el contenido generado; verificar cumplimiento normativo (por ejemplo, AI Act en la UE).
- El widget de compatibilidad de hardware de Hugging Face no reconoce las cuantizaciones K_P y puede mostrar menos archivos de los existentes; hay que revisar "Files and versions".
- Requiere el archivo mmproj para soporte de vision; sin el, el modelo funciona solo como texto.
- Para preservar el modo thinking se recomienda mantener al menos 128K de contexto, lo que incrementa los requisitos de VRAM.

## Enlaces

- Hugging Face (repo de Frommel): https://huggingface.co/Frommel/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Repo original de HauhauCS (referenciado en la model card): https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
