# frankmorales2020/mixtral-8x22b-instruct-v0.1-topo-cbp-GGUF

## Resumen

`mixtral-8x22b-instruct-v0.1-topo-cbp-GGUF` es una cuantizacion GGUF en 4 bits del modelo Mixtral-8x22B-Instruct-v0.1 de Mistral AI, publicada por el usuario frankmorales2020 bajo el paraguas de "Sovereign Machine Laboratory (SOMALA)". El modelo base es un transformer disperso de tipo Mixture of Experts (MoE) con 141.000 millones de parametros totales y aproximadamente 39.000 millones activos por token (2 de 8 expertos). Esta version no modifica los pesos del modelo original mas alla del proceso de cuantizacion: se trata de un artefacto de compresion, no de un reentrenamiento.

El interes tecnico del artefacto reside en su estrategia de cuantizacion selectiva orientada a preservar el enrutamiento del MoE. El autor mantiene los 56 routers de compuerta (`ffn_gate_inp`) y las normalizaciones RMS en F32 sin comprimir, aplica Q8_0 a las proyecciones K/V de atencion, Q6_K a la cabeza de salida y una mezcla adaptativa Q4_K/Q6_K a los tensores de expertos, con un resultado de 4,87 bits por peso (BPW) y un binario de 79,71 GB. El objetivo declarado es evitar la "inversion de decisiones de enrutamiento" que la cuantizacion uniforme provoca en redes MoE dispersas.

Es relevante ahora porque demuestra una practica util para desplegar modelos MoE grandes en hardware de gama alta (Apple Silicon de 128 GB, estaciones de trabajo con CPU y nodos multi-GPU de borde) sin degradar el despacho de tokens. No obstante, la model card incluye afirmaciones no verificables de forma independiente (invariantes topologicos, "zero-drift", teoria espectral aritmetica) que deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer disperso Mixture of Experts (MoE), 56 capas, 8 expertos, k=2 |
| Parametros totales | 140.620.634.112 (141 mil millones) |
| Parametros activos | ~39 mil millones por token |
| Longitud de contexto | Hasta 65.536 tokens (segun model card) |
| Tipos de cuantizacion | GGUF Q4_K_M mixto: F32 (routers y normalizaciones), Q8_0 (K/V), Q6_K (output y down-projections de capas ancla), Q4_K (up/gate y down intermedias); 4,87 BPW |
| Idiomas soportados | Ingles (segun la model card; el modelo base soporta mas idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (binario de 79,71 GB / 85.592.265.120 bytes) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only con capas de atencion de multiples cabezas y bloques feed-forward sustituidos por capas MoE dispersas: 8 expertos por capa con enrutamiento top-2, lo que activa aproximadamente 39.000 millones de parametros por token sobre un total de 141.000 millones. Esta version concreta no introduce cambios arquitectonicos: es una conversion a GGUF del checkpoint `mistralai/Mixtral-8x22B-Instruct-v0.1`, que a su vez fue afinado por instrucciones (SFT) sobre el modelo base Mixtral-8x22B.

La innovacion del artefacto es el pipeline de cuantizacion. Segun la model card, se preservan en F32 los 56 tensores de enrutamiento (`blk.X.ffn_gate_inp.weight`) y 113 tensores de normalizacion, se mantienen las proyecciones `attn_k` y `attn_v` en Q8_0 para conservar el contexto largo, y se aplica una topologia mixta Q4_K/Q6_K a los arrays tridimensionales de expertos `{6144, 16384, 8}`. El autor afirma haber realizado una auditoria de determinismo con decodificacion greedy (temperatura 0,0, top_k 1, semilla 42) obteniendo hashes SHA-256 identicos en dos pasadas y un delta absoluto maximo de 0,0. Estas afirmaciones no han sido replicadas de forma independiente. La model card tambien menciona un checkpoint relacionado (`frankmorales2020/Mixtral-8x22B-topo-cbp`) entrenado con "Topological Continual Backpropagation" sobre embeddings y cabeza de salida, pero no se aportan detalles verificables sobre el dataset ni el procedimiento.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo instruct de Mistral AI.
- Razonamiento matematico y resolucion de problemas de varios pasos (capacidad del modelo base).
- Generacion y explicacion de codigo (capacidad del modelo base).
- Soporte multilingue limitado en la practica: la model card declara solo ingles, aunque el modelo base maneja otros idiomas.
- Contexto largo de hasta 65.536 tokens, con proyecciones K/V preservadas en Q8_0 para reducir la degradacion en horizontes largos.
- Capacidad de ejecucion en CPU y Apple Silicon mediante llama.cpp y Ollama, al estar en formato GGUF.
- No se documenta soporte explicito de tool calling, function calling ni modo de razonamiento extendido en la model card de este artefacto.

## Casos de uso

- Inferencia local en Apple Silicon de 128 GB: el binario de 79,71 GB cabe en un Mac Studio o MacBook Pro con memoria unificada de 128 GB, permitiendo ejecutar un MoE de 141.000 millones de parametros sin GPU dedicada.
- Estaciones de trabajo con CPU y RAM abundante (>= 88 GB): despliegue mediante llama.cpp para tareas de generacion por lotes donde la latencia no es critica.
- Nodos multi-GPU de borde: reparto del modelo entre varias GPU consumer o de gama profesional con suficiente VRAM agregada, usando llama.cpp con offloading por capas.
- Procesamiento de documentos largos: la ventana de 65.536 tokens y la preservacion de K/V en Q8_0 lo hacen adecuado para resumir o extraer informacion de contratos, informes o expedientes extensos.
- Asistencia de codigo en entornos aislados: al ser un artefacto Apache 2.0 ejecutable en local, encaja en escenarios con requisitos de soberania de datos donde no se permite enviar codigo a APIs externas.
- Experimentacion en investigacion sobre cuantizacion de MoE: sirve como referencia para estudiar el impacto de mantener routers en F32 frente a cuantizarlos, comparando calidad de enrutamiento y perplejidad.
- Generacion de texto creativo y tecnico por lotes: con decodificacion greedy y truncado en limites de turno, como recomienda el autor, para evitar repeticiones ciclicas en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta una auditoria de determinismo (dos pasadas con hashes SHA-256 identicos y delta maximo de 0,0), que mide reproducibilidad bit a bit, no calidad del modelo. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otras cuantizaciones del mismo modelo base.

## Requisitos de hardware

- RAM/VRAM minima: aproximadamente 88 GB de memoria de host o unificada, segun la model card; el binario ocupa 79,71 GB.
- Apple Silicon: Mac con 128 GB de memoria unificada (series M1/M2/M3/M4 Max o Ultra).
- CPU: estaciones de trabajo con al menos 88 GB de RAM; el rendimiento dependera del ancho de banda de memoria.
- GPU: no se especifican modelos concretos; el tamano exige agregar VRAM de varias GPU (por ejemplo, varias RTX 4090 de 24 GB o A100/H100 combinadas) mediante offloading por capas en llama.cpp.
- Despliegue: llama.cpp y llama-cpp-python; la model card menciona Ollama en las etiquetas. No se documenta soporte de vLLM ni TGI para este artefacto GGUF.
- Latencia y throughput: no disponibles. Al ser un MoE con 39.000 millones de parametros activos y ejecucion parcial en CPU, se espera un throughput bajo comparado con inferencia en GPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este artefacto (Mixtral-8x22B Q4_K_M Topo-CBP) | 141 B / ~39 B | 65.536 | GGUF 4,87 BPW | Apache 2.0 | Routers en F32, K/V en Q8_0 |
| mistralai/Mixtral-8x22B-Instruct-v0.1 | 141 B / ~39 B | 65.536 | safetensors (BF16) | Apache 2.0 | Modelo original; requiere ~280 GB en BF16 |
| Cuantizaciones GGUF estandar de Mixtral-8x22B (p. ej. Q4_K_M generico) | 141 B / ~39 B | 65.536 | GGUF | Apache 2.0 | Sin preservacion selectiva de routers en F32 documentada |
| Mixtral-8x7B-Instruct-v0.1 | 46,7 B / ~12,9 B | 32.768 | safetensors, GGUF | Apache 2.0 | Alternativa mas ligera, menor calidad y contexto |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Las afirmaciones de "zero-drift", "invariantes topologicos" y "teoria espectral aritmetica" provienen unicamente del autor y no cuentan con validacion independiente; deben tratarse como marketing tecnico, no como garantia.
- La cuantizacion Q4_K_M, aunque selectiva, introduce perdida de precision frente al modelo en BF16; la magnitud de la degradacion en tareas reales no esta medida.
- La model card declara solo ingles; el rendimiento en castellano u otros idiomas puede ser inferior al del modelo base sin cuantizar.
- Riesgo de alucinacion inherente al modelo base, especialmente en dominios especializados y con contexto muy largo.
- El autor recomienda decodificacion greedy y truncado en limites de turno para evitar "ecos ciclicos"; esto sugiere problemas de generacion repetitiva en configuraciones de muestreo libre.
- Requiere hardware poco comun (>= 88 GB de memoria), lo que limita su uso a estaciones de trabajo y servidores de gama alta.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Mistral AI y citar adecuadamente.
- El repositorio tiene muy poca traccion (72 descargas, 0 likes) y una unica fuente de validacion; no se recomienda para produccion critica sin evaluacion propia.
- El checkpoint relacionado `Mixtral-8x22B-topo-cbp` afirma entrenamiento con "Topological Continual Backpropagation" sin documentar dataset, hiperparametros ni evaluacion.

## Enlaces

- Hugging Face (este artefacto): https://huggingface.co/frankmorales2020/mixtral-8x22b-instruct-v0.1-topo-cbp-GGUF
- Checkpoint relacionado: https://huggingface.co/frankmorales2020/Mixtral-8x22B-topo-cbp
- Modelo base: https://huggingface.co/mistralai/Mixtral-8x22B-Instruct-v0.1
- Articulo del autor: https://medium.com/ai-simplified-in-plain-english/the-invariance-of-sovereign-sparse-silicon-engineering-quantizing-and-deterministically-a045aa5a5044
- Codigo de conversion: https://github.com/frank-morales2020/AST/blob/main/mixtral_to_gguf.ipynb
- Codigo de agente GGUF: https://github.com/frank-morales2020/AST/blob/main/SIX_AGENTIC_GGUF.ipynb
