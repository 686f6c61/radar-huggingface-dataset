# Akahsizrr/Fuse-2-MoE-BF16

## Resumen

Fuse-2-MoE-BF16 es un modelo de lenguaje de arquitectura Mixture of Experts (MoE) desarrollado por Akahsizrr, que combina un modelo anfitrión Qwen3.5-4B con 192 expertos SwiGLU podados de Qwen3.8-27B. El resultado es un sistema híbrido de 32 capas donde las capas 3 a 26 incorporan 8 expertos cada una con routing top-2, más un experto compartido que corresponde a la FFN del modelo anfitrión. El modelo se distribuye en formato GGUF para su uso con llama.cpp, aunque requiere un parche personalizado del runtime para funcionar correctamente.

La relevancia de este modelo reside en su enfoque de fusión de modelos (denominado Fuse4): en lugar de entrenar un MoE desde cero, se aprovechan pesos preentrenados de Qwen3.5 y Qwen3.8, se podan los expertos y se conectan mediante proyecciones puente. Esto permite obtener un modelo de ~8.870 millones de parámetros totales (la model card menciona "12B" pero el peso real en safetensors es 8.868.801.536) con capacidades conversacionales en inglés, bajo licencia Apache-2.0. El repositorio BF16 ocupa 17,8 GB e incluye también versiones cuantizadas Q4_K_M, Q5_K_M y Q8_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (Qwen3.5-4B host + 192 expertos SwiGLU de Qwen3.8-27B) |
| Parametros totales | 8.868.801.536 (~8,87B) |
| Parametros activos | no disponible (routing top-2 sobre 8 expertos por capa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), GGUF |

## Arquitectura y entrenamiento

La arquitectura Fuse4 se compone de un modelo anfitrion Qwen3.5-4B con 32 capas. Las capas 3 a 26 (24 capas en total) estan aumentadas con 8 expertos SwiGLU cada una, extraidos de Qwen3.8-27B mediante poda. El routing selecciona los 2 expertos mas relevantes por token (top-2). La FFN del modelo anfitrion actua como experto compartido, siempre activo, y su salida se suma al residual para formar la entrada que ven los expertos y el router. Proyecciones puente (2560→5120 y 5120→2560) conectan el espacio de representacion del host con el de los expertos. Tras la computacion MoE, se aplica una RMSNorm a la salida de los expertos antes de la adicion residual, y la contribucion de los expertos se escala con un factor estatico de aproximadamente 0,0184.

La conversion a GGUF pliega las proyecciones puente en los pesos de gate/up y down de los expertos, y almacena la RMSNorm como un tensor personalizado `ffn_moe_norm`. El runtime llama.cpp debe parchearse en cinco archivos para soportar este tensor y la funcion de grafo `build_layer_ffn_fuse4`. No se ha publicado informacion sobre el proceso de entrenamiento: no se especifican datos de entrenamiento, numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO. El modelo se presenta como una fusion de pesos preentrenados, no como un entrenamiento desde cero.

## Capacidades

- Generacion de texto conversacional en ingles (etiquetado como "conversational" en HuggingFace).
- Razonamiento y comprension del lenguaje basados en las capacidades heredadas de Qwen3.5-4B y los expertos de Qwen3.8-27B.
- Soporte de tool calling: no confirmado en la documentacion disponible; no se menciona explicitamente.
- Capacidades multilingues: solo se declara ingles; no hay evidencia de soporte para otros idiomas.
- No se documentan capacidades de vision, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Chatbots locales en ingles: al ser un modelo GGUF, puede desplegarse en entornos sin conexion mediante llama.cpp, ofreciendo conversaciones multi-turno con el modelo anfitrion Qwen3.5-4B como base.
- Experimentacion con arquitecturas MoE hibridas: el codigo de parche y la estructura Fuse4 son un caso de estudio para desarrolladores interesados en fusion de modelos y poda de expertos.
- Inferencia en hardware modesto: las cuantizaciones Q4_K_M (~5,7 GB) y Q5_K_M (~6,5 GB) permiten ejecutar el modelo en GPUs de consumo con 8-12 GB de VRAM, adecuado para prototipado rapido.
- Generacion de texto asistida en aplicaciones de escritorio: integrable en herramientas que usen llama.cpp como backend, siempre que se apliquen los parches necesarios.
- Investigacion sobre escalado de MoE: el diseño con experto compartido y escala estatica ofrece una alternativa a los MoE convencionales, util para estudiar el equilibrio entre activacion y calidad.
- Despliegue en entornos de pruebas con licencia permisiva: Apache-2.0 permite uso comercial y modificacion, lo que facilita su integracion en proyectos internos sin restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Tampoco se proporcionan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M (~5,7 GB de archivo) requiere aproximadamente 6-7 GB de VRAM; Q5_K_M (~6,5 GB) unos 7-8 GB; Q8_0 (~9,4 GB) unos 10-11 GB; BF16 (17,8 GB) unos 18-20 GB.
- GPU recomendadas: para las cuantizaciones Q4_K_M y Q5_K_M, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB son suficientes. Para Q8_0, una RTX 4070 Ti Super de 16 GB o RTX 4090. Para BF16, se recomienda una GPU con 24 GB o mas, como RTX 3090/4090 o A100.
- Compatibilidad con GPU de consumo: si, las versiones Q4_K_M y Q5_K_M caben en GPUs de consumo con 8-12 GB de VRAM.
- Opciones de despliegue: llama.cpp (con los parches personalizados descritos en la model card). No se menciona compatibilidad con vLLM, TGI u Ollama; dado que requiere un runtime parcheado, llama.cpp es la unica opcion confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Fuse-2-MoE-BF16 | ~8,87B | MoE hibrida (Qwen3.5-4B + expertos Qwen3.8-27B) | no disponible | Apache-2.0 | GGUF, safetensors |
| Qwen3-4B | 4B | Densa | 32K (segun documentacion de Qwen) | Apache-2.0 | safetensors, GGUF |
| Qwen3-8B | 8B | Densa | 32K (segun documentacion de Qwen) | Apache-2.0 | safetensors, GGUF |
| Mixtral-8x7B | 46,7B | MoE (8x7B, top-2) | 32K | Apache-2.0 | safetensors, GGUF |

La comparativa se basa en datos publicos de los modelos mencionados. Fuse-2-MoE-BF16 se distingue por su enfoque de fusion de modelos preentrenados, pero carece de benchmarks publicados que permitan comparar rendimiento real. Su tamano efectivo (~8,87B) lo situa entre Qwen3-4B y Qwen3-8B en parametros, aunque su arquitectura MoE podria ofrecer un comportamiento diferente.

## Limitaciones y advertencias

- Requiere un parche manual de llama.cpp en cinco archivos; no funciona con la version estandar del runtime. Esto limita su portabilidad y dificulta su uso en entornos de produccion sin mantenimiento especifico.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- No se ha publicado informacion sobre sesgos, alucinaciones o comportamiento en dominios especificos. Al ser una fusion de pesos sin entrenamiento adicional, podria heredar sesgos de los modelos originales (Qwen3.5 y Qwen3.8).
- La discrepancia entre el tamano declarado en la model card ("12B") y los parametros reales (~8,87B) puede generar confusion; se recomienda verificar los pesos antes de su uso.
- No hay informacion sobre la longitud de contexto soportada; se desconoce si mantiene la ventana de Qwen3.5-4B o si la poda de expertos la afecta.
- La escala estatica de los expertos (≈0,0184) es un hiperparametro fijo; no se documenta como se determino ni si es optima para todas las tareas.
- Al ser un modelo relativamente reciente (creado en agosto de 2026) y con pocas descargas (344), su comunidad de soporte es limitada.

## Enlaces

- Modelo BF16 en HuggingFace: https://huggingface.co/Akahsizrr/Fuse-2-MoE-BF16
- Modelo GGUF cuantizado: https://huggingface.co/Akahsizrr/Fuse-2-MoE-GGUF
- Modelo base (Fuse-2): https://huggingface.co/Akahsizrr/Fuse-2
- Busqueda de modelos cuantizados de Fuse-2: https://huggingface.co/models?other=base_model:quantized:Akahsizrr/Fuse-2
