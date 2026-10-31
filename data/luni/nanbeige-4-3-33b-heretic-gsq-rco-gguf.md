# Luni/Nanbeige-4.3-33B-Heretic-GSQ-RCO-GGUF

## Resumen

Nanbeige-4.3-33B-Heretic GSQ-RCO GGUF es una colección de cuantizaciones en formato GGUF del modelo Luni/Nanbeige-4.3-33B-Heretic, una versión densa de 33B parámetros derivada de Nanbeige/Nanbeige4.3-33B (equipo Nanbeige) a la que se ha aplicado un proceso de abliteration (eliminación de rechazos de seguridad) y una limpieza de "slop" en la generación. El autor, Luni, publica bajo licencia Apache-2.0 una suite de doce cuantizaciones no uniformes denominadas GSQ-RCO, que van desde IQ1_S (1,56 bits por peso, unos 8 GB) hasta IQ4_NL (4,5 bpw, unos 19 GB).

La relevancia de esta ficha radica en dos puntos: primero, el modelo base conserva soporte nativo para contextos de hasta 524.288 tokens (512K) en llama.cpp, algo poco habitual en modelos densos de 33B; segundo, el esquema de cuantización GSQ-RCO asigna precisiones distintas por tensor (4 bits en proyecciones de atención sensibles, 3 bits en feedforward tolerantes, FP32 en normalizaciones y 6 bits en la cabeza LM), lo que según el autor preserva mejor el razonamiento en cadenas `<think>` que las cuantizaciones uniformes de bitrates bajos. El modelo es bilingüe (inglés y chino), orientado a generación de texto conversacional y razonamiento, y se despliega con llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), con circuito nativo de razonamiento `<think>` |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no disponible (no es MoE; es un modelo denso) |
| Longitud de contexto | 524.288 tokens (512K), soporte nativo en llama.cpp |
| Tipos de cuantizacion | GSQ-RCO: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (1,56 a 4,5 bpw) |
| Idiomas soportados | Ingles y chino (en, zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con imatrix `nanbeige_heretic.imatrix`, PPL 26,39); el modelo base original esta en BF16/safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer denso decoder-only de 33B parámetros (Nanbeige4.3-33B), sin mezcla de expertos. Sobre él, Luni aplicó un proceso de abliteration mediante selección Optuna (trial #40, criterio Pareto), que según la model card reduce los rechazos de seguridad un 65,4 % respecto al modelo original sin degradar benchmarks STEM complejos, y mantiene íntegro el circuito nativo de chain-of-thought delimitado por las etiquetas `<think>`. También se corrigió un bug del tokenizador upstream que emitía duplicado el token `<|im_start|>` como BOS (`"add_bos_token": false`).

La cuantización GSQ-RCO combina dos técnicas: GSQ (Gumbel-Softmax Quantization), que calibra la sensibilidad por tensor mediante una matriz de importancia calculada sobre semillas de matemáticas de competición, lógica formal, algoritmos de ingeniería de sistemas y razonamiento adversarial (PPL 26,39); y RCO (Riemannian Constrained Optimization), que asigna precisión no uniforme bajo un presupuesto global de tamaño. En la práctica: las proyecciones de atención de alta sensibilidad (`attn_output`, `attn_v`, `ffn_down`) se promueven a Q4_K, la cabeza LM (`output.weight`) se mantiene en Q6_K para evitar colapso de entropía de muestreo, los tensores tolerantes (`ffn_gate`, `ffn_up` y proyecciones query/key) se comprimen a IQ3_S, y las matrices de normalización de capa se conservan en FP32 sin cuantizar. No se dispone de información pública sobre el número de tokens ni la composición del dataset de entrenamiento del modelo base, ni sobre el uso de RLHF/DPO.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con plantilla de chat tipo ChatML (`<|im_start|>`).
- Razonamiento con cadena de pensamiento nativa mediante etiquetas `<think>` (modo thinking), conservado intacto tras la abliteration segun el autor.
- Contexto ultralargo de hasta 524.288 tokens (512K) en llama.cpp, util para documentos extensos y conversaciones muy largas.
- Razonamiento en matematicas de competicion, logica formal y algoritmos (la matriz de importancia de cuantizacion se calibro especificamente sobre esos dominios).
- Sin rechazos de seguridad (uncensored/abliterated): responde a instrucciones que el modelo original rechazaria, con el riesgo etico y legal que ello conlleva.
- Generacion reducida de "slop" (frases y cliches repetitivos) gracias al proceso de de-slop del modelo base Heretic.
- Compatibilidad con endpoints compatibles con la API de OpenAI via llama-server, y despliegue directo en Ollama.
- No hay indicios de capacidades multimodales (vision, audio) ni de soporte documentado de tool calling o agentes en la informacion disponible.

## Casos de uso

- Chat privado y sin censura en hardware de consumo: con la variante IQ3_M (unos 17 GB) cabe en una RTX 3090 o 4090 de 24 GB, ofreciendo un asistente conversacional local con razonamiento `<think>` sin depender de servicios en la nube.
- Analisis de documentos muy largos: la ventana nativa de 512K tokens permite procesar libros, contratos o bases de codigo enteros; con KV cache en 4 bits, la variante IQ1_M soporta 65.536 tokens de contexto en menos de 12 GB de VRAM (RTX 3060 12GB, RTX 4070).
- Razonamiento matematico y logico en local: la calibracion de la cuantizacion sobre semillas de matematicas de competicion y logica formal busca preservar el rendimiento en estos dominios incluso a 3 bits.
- Rol e ingenieria de prompts creativa sin filtros: al estar abliterated, el modelo no interrumpe conversaciones con rechazos, util para escritura creativa adulta o investigacion de seguridad, siempre bajo responsabilidad del usuario.
- Servidor LLM casero con API compatible con OpenAI: `llama-server` expone un endpoint en el puerto 8080 que se integra directamente con clientes y aplicaciones que ya hablan el protocolo de OpenAI.
- Pruebas de degradacion por cuantizacion: la suite de 12 cuantizaciones GSQ-RCO (de 1,56 a 4,5 bpw) permite comparar empiricamente como afecta el bitrate al razonamiento en un mismo modelo denso de 33B.
- Uso bilingue chino-ingles en local: util para desarrolladores que trabajen con documentacion o conversacion en ambos idiomas sin recurrir a modelos propietarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona que la abliteration (trial #40 de Optuna) logro una reduccion del 65,4 % en rechazos respecto al modelo base sin degradacion en benchmarks STEM complejos, y que la matriz de importancia de cuantizacion tiene una perplejidad de 26,39, pero no proporciona puntuaciones concretas en MMLU, HumanEval, GSM8K u otras suites comparables.

## Requisitos de hardware

- VRAM estimada por variante (según la model card, sin contexto adicional):
  - IQ1_S (~8,0 GB, 1,56 bpw): 8 GB VRAM.
  - IQ1_M (~8,8 GB, 1,75 bpw): 8-12 GB.
  - IQ2_XXS / IQ2_XS (~10,2-11,2 GB): 12 GB.
  - IQ2_S / IQ2_M (~12,0-12,8 GB): 12-16 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S (~14,2-16,0 GB): 16 GB.
  - IQ3_M (~17,0 GB, 3,70 bpw): 20-24 GB (variante recomendada por el autor).
  - IQ4_XS / IQ4_NL (~19,0-19,2 GB): 24 GB.
- GPUs consumer: cabe en tarjetas de 8 GB (IQ1_S/IQ1_M), 12 GB como RTX 3060 12GB o RTX 4070 (hasta IQ2_XS, o IQ1_M con 64K de contexto usando KV cache 4-bit), 16 GB como RTX 4060 Ti 16GB (hasta IQ3_S) y 24 GB como RTX 3090/4090 (IQ3_M e IQ4).
- Contexto largo en GPUs modestas: con `-ctk q4_0 -ctv q4_0` (KV cache en 4 bits) y flash attention (`-fa`), 65.536 tokens de contexto caben en menos de 12 GB de VRAM totales con la variante IQ1_M.
- Despliegue: llama.cpp (`llama-cli` interactivo y `llama-server` con endpoint compatible OpenAI) y Ollama (`ollama run hf.co/Luni/Nanbeige-4.3-33B-Heretic-GSQ-RCO-GGUF:IQ3_M`). Existen ademas suites alternativas del mismo modelo en EXL3 para backends ExLlamaV2/V3.
- Latencia y throughput: no disponible; no se publican mediciones de tokens/segundo.
- Parametros de ejecucion recomendados por el autor: `-ngl 99` (offload completo a GPU), `-fa` (flash attention), `-b 2048` y `-c 32768`.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige-4.3-33B-Heretic GSQ-RCO | 33,1B (denso) | Transformer decoder-only, thinking | 512K | Apache-2.0 | GGUF (12 cuantizaciones), EXL3, Ollama |
| Qwen3-32B | 32,7B (denso) | Transformer decoder-only, thinking | 131K (aprox. segun documentacion de Qwen) | Apache-2.0 | GGUF, safetensors, despliegue generalizado |
| Qwen2.5-32B-Instruct | 32,5B (denso) | Transformer decoder-only | 128K | Qwen license (uso comercial restringido >100M usuarios) | GGUF, safetensors |
| Gemma 3 27B | 27,4B (denso) | Transformer decoder-only, multimodal | 128K | Gemma license (restricciones de uso) | GGUF, safetensors |

Notas de la comparativa: frente a Qwen3-32B, el modelo de esta ficha ofrece una ventana de contexto mucho mayor (512K frente a ~131K) y esta abliterated, pero carece de datos de benchmarks publicos y de ecosistema de despliegue tan amplio. Frente a Gemma 3 27B, es solo texto (sin vision) y sin restricciones de licencia tipo Gemma. Los datos de rendimiento de los modelos alternativos provienen de conocimiento general y pueden no ser exactos; no hay comparativas directas publicadas para este modelo.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: se han eliminado deliberadamente los rechazos de seguridad. Esto implica riesgo elevado de generar contenido harmful, y el usuario asume la responsabilidad legal y etica de su uso. No es adecuado para entornos de produccion orientados a publico general sin capas de moderacion externas.
- Riesgo de alucinacion no cuantificado: no hay benchmarks publicos, por lo que la fiabilidad factual debe validarse caso por caso antes de usarlo en produccion.
- Cuantizaciones agresivas: por debajo de IQ3, las cuantizaciones de 1-2 bits degradan apreciablemente la calidad de los modelos densos de 33B; el propio autor recomienda IQ3_M como variante insignia. Las variantes IQ1/IQ2 son adecuadas solo cuando la VRAM es la restriccion dominante.
- Idiomas limitados a ingles y chino; el rendimiento en castellano u otros idiomas no esta documentado y puede ser inferior.
- El tamano del repositorio completo es de 304,3 GB (las 12 cuantizaciones); hay que descargar los ficheros GGUF individuales, no el repo entero.
- El modelo base Heretic hereda la licencia Apache-2.0 de Nanbeige4.3-33B, sin restricciones comerciales conocidas, pero la abliteration puede afectar a los terminos de uso del modelo original; conviene revisar la model card de Nanbeige antes de uso comercial.
- Bug de tokenizador corregido en esta version (`add_bos_token: false`); usar ficheros GGUF de otras fuentes del mismo modelo puede reproducir el problema de BOS duplicado.
- No hay evidencia de soporte de tool calling, function calling ni capacidades multimodales en la informacion disponible.

## Enlaces

- Modelo cuantizado (esta ficha): https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic-GSQ-RCO-GGUF
- Modelo base uncensored BF16: https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic
- Modelo original de Nanbeige: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Suite GGUF completa (22 formatos): https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic-GGUF
- Suite EXL3-SC dedicada: https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic-EXL3-SC
- Coleccion EXL3 master: https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic-EXL3
- Coleccion EXL3 stock: https://huggingface.co/Luni/Nanbeige-4.3-33B-EXL3
- Paper, blog oficial o demos: no disponible en la informacion proporcionada.
