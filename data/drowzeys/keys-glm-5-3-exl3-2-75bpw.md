# drowzeys/keys-GLM-5.3-EXL3-2.75BPW

## Resumen

keys-GLM-5.3-EXL3-2.75BPW es una cuantización comunitaria del modelo GLM-5.3 de Z.ai (zai-org), publicada por el usuario drowzeys. Se trata de una conversión completa del checkpoint BF16 original a formato EXL3 con precisión mixta por experto, con una media de 2,75 bits por peso en los expertos enrutados. El objetivo declarado es poder servir los 753B parámetros del GLM-5.3 original (arquitectura `glm_moe_dsa`) en cuatro estaciones NVIDIA DGX Spark (GB10, 128 GB de memoria unificada cada una), con espacio para un pool de KV de 200K tokens o de 1M tokens usando decode-context-parallel de 4. No hay ablación ni ajuste fino: los pesos son los del modelo base, solo cuantizados.

El modelo base GLM-5.3 es un transformer de tipo Mixture-of-Experts con atención dispersa (DSA), 78 capas y 256 expertos enrutados por capa en las capas 3 a 77, más una capa MTP (Multi-Token Prediction) para decodificación especulativa. Esta ficha describe únicamente el artefacto cuantizado: un repositorio de 81 shards safetensors que ocupan 258 GB en disco (276,3 GB de tamaño total del repo) y 67,5 GiB por rango en un despliegue con tensor-parallel 4.

La relevancia actual del artefacto reside en que demuestra que es viable ejecutar un MoE de escala 753B en hardware de escritorio/prosumer agregado (cuatro GB10), con velocidades de decodificación medidas de 23,8 tok/s en prosa y 30,9 tok/s en código sobre un perfil de 200K de contexto. El principal cuello de botella reconocido por el autor es el preprocesado de prompt (prefill), que califica como «problema abierto» con margen estimado de mejora de hasta 2x.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (Mixture-of-Experts con atención dispersa DSA, transformer) |
| Parametros totales | 138.092.850.560 según safetensors del repo cuantizado; el modelo base GLM-5.3 completo declara 753B |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 1.000.000 tokens con `--decode-context-parallel-size 4` (pool de 1,23M tokens); perfil estándar de 200.000 tokens |
| Tipos de cuantizacion | EXL3 trellis con codebook `mul1`; precisión mixta por experto (2/3/4 bits en expertos enrutados, media 2,75 bpw); 5 bits en atención, expertos compartidos y MLP densos; 8 bits en expertos de la capa MTP; BF16 en `kv_b`, router, normas, embeddings y `lm_head`; KV cache en fp8 |
| Idiomas soportados | en, zh |
| Licencia | `other`, nombre `glm-5.3`, ligada a la licencia del modelo base |
| Formato de pesos | safetensors (EXL3), 81 shards, 258 GB |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 emplea la arquitectura `glm_moe_dsa`, un transformer con capas de atención dispersa (DSA) y Mixture-of-Experts. Según la model card, las capas 3 a 77 contienen 256 expertos enrutados cada una, además de expertos compartidos, MLP densos en las capas 0-2 y una capa MTP (capa 78) dedicada a predicción multi-token. El checkpoint original está entrenado en BF16; esta publicación no añade entrenamiento ni ajuste: es una conversión pura del BF16 a EXL3.

La innovación técnica de esta ficha es el esquema de cuantización de precisión mixta por experto. La anchura de bits se asigna individualmente a cada experto enrutado en función de cuánto daña su error de cuantización a la salida de la capa, medido sobre activaciones de calibración. El reparto resultante es 5.436 expertos a 2 bits, 13.128 a 3 bits y 636 a 4 bits, lo que da una media de 2,75 bpw. Las anchuras se registran en `quantization_config.json` con el formato `keys35-v1`. El autor reporta que sustituir las capas no-expertas de 5 bits por FP8 produce un empate en perplejidad (3,567/2,911 frente a 3,560/2,913), por lo que mantiene EXL3 por ser más rápido. El despliegue recomendado usa decodificación especulativa MTP con k=2 y kernels EXL3 de exllamav3 1.5.0.

## Capacidades

- Generación de texto y conversación multi-turno (`pipeline: text-generation`, `conversational`).
- Razonamiento de dominio general y generación de código, evidenciado por las métricas de perplejidad separadas para prosa y código.
- Decodificación especulativa mediante la capa MTP del modelo base (hasta 2 tokens especulativos por paso verificados).
- Atención dispersa a nivel de token (DSA) más allá de 2048 tokens, lo que permite manejar contextos largos con coste reducido.
- Capacidades multilingües limitadas a inglés y chino.
- Soporte de contexto largo: hasta 200K tokens en el perfil estándar y hasta 1M tokens con decode-context-parallel 4 (validado con una prueba de aguja a 128K).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Nota: las capacidades funcionales heredadas del GLM-5.3 base no se detallan en la model card de esta cuantización; solo se documentan rendimiento, formato y despliegue.

## Casos de uso

- Servicio de un LLM de 753B en hardware prosumer agregado: cuatro DGX Spark con tensor-parallel 4 permiten ejecutar el modelo con un pool de KV de 200K tokens, algo inviable en una GPU única. Es el caso de uso central y el que motivó la publicación.
- Atención al cliente con contexto muy largo: con 200K tokens de ventana, el modelo puede mantener hilos conversacionales de muchos turnos o incorporar documentación extensa en el prompt sin truncar.
- Análisis de repositorios de código completos: la ventana de 200K tokens y las buenas métricas de perplejidad en código (2,913) permiten pasar ficheros y módulos enteros para tareas de revisión o generación.
- Procesado de documentos largos en chino e inglés: soporte nativo de ambos idiomas para resumen, extracción y traducción sobre entradas de decenas de miles de tokens, especialmente en el perfil de 1M con decode-context-parallel 4.
- Investigación en cuantización: el repositorio sirve como referencia reproducible de cuantización EXL3 de precisión mixta por experto, con `quantization_config.json` y `KEYS35_ASSEMBLY_REPORT.json` documentando la asignación de bits.
- Despliegue batch con vLLM: la configuración medida (TP=4, fp8 KV, `--max-num-seqs 8`, CUDA graphs completos) está pensada para servir varias secuencias concurrentes con decodificación especulativa MTP.
- Validación de pipelines alternativos: la rama experimental TensorFold-native sirve este mismo checkpoint sin vLLM (~18 tok/s en prosa), útil para comparar kernels y estrategias de decodificación.

## Benchmarks y rendimiento

Calidad de la cuantización frente al BF16 original:

| Métrica | Valor |
|---|---|
| Perplejidad, prosa (12.223 tokens) | 3,560 |
| Perplejidad, código (3.882 tokens) | 2,913 |
| Perplejidad con capas no-expertas FP8 | 3,567 / 2,911 (empate) |
| Divergencia KL frente a BF16 (`model_diff`, 65.536 tokens) | 0,124 nats (inversa 0,146; mediana por token 0,017; p90 0,30) |
| Acuerdo top-1 con BF16 | 89,6 % (top-2 62,7 %) |
| Perplejidad sobre los mismos tokens | 2,938 (BF16 2,750) |
| Etiqueta en top-5 | 91,2 % (BF16 91,6 %) |

Rendimiento medido en 4 x DGX Spark (una sola secuencia, contexto de 32K, temperatura 1,0, top-p 0,95, 512 tokens):

| Perfil | Prosa | Código | Mixto | Tokens/paso | Paso |
|---|---|---|---|---|---|
| 200K contexto, RoCE all-reduce | 23,8 tok/s | 30,9 tok/s | 26,1 | 1,88 | 79 ms |
| 1M contexto, decode-context-parallel 4 | 16,6 tok/s | 21,1 tok/s | 18,1 | 1,82-2,28 | 108-110 ms |

Procesado de prompt (perfil 200K): 749 tok/s a 4K, 733 a 32K y 668 a 128K tokens, con un TTFT de 195 s a 128K. El perfil de 1M superó una prueba de aguja a 128K con 409 tok/s de prefill a 32K. El motor TensorFold-native experimental sirve el mismo checkpoint a unos 18 tok/s en prosa y 20 tok/s en código con contexto corto.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Despliegue de referencia: 4 x NVIDIA DGX Spark (GB10), cada una con 128 GB de memoria unificada, en tensor-parallel 4.
- Peso por rango: 67,5 GiB de pesos por rank con TP=4.
- Tamaño total de pesos: 258 GB (81 shards safetensors); 276,3 GB de repo.
- KV cache: fp8, configurado con `--kv-cache-memory-bytes 14092861440` (unos 13,1 GiB) para el perfil de 200K; pool de 1,23M tokens en el perfil de 1M.
- No cabe en una GPU de consumo única (RTX 4090, 24 GB) ni en configuraciones de una sola GPU de 80 GB; requiere agregación de memoria entre varias máquinas.
- Opciones de despliegue: vLLM con soporte EXL3 (imagen propia del autor, no pública todavía) con kernels de exllamav3 1.5.0, método MoE `exl3_mixedk`, `exl3_dense` para capas no-expertas, decodificación especulativa MTP y CUDA graphs completos. Alternativa experimental: motor nativo TensorFold (rama no fusionada en upstream).
- Configuración clave de vLLM (TP=4): `--kv-cache-dtype fp8 --max-model-len 200000 --max-num-seqs 8 --async-scheduling --cudagraph-capture-sizes 1 2 3 4 6 8 12 24 --speculative-config '{"method":"mtp","num_speculative_tokens":2}'`.
- Throughput estimado: 23,8-30,9 tok/s en decodificación con el perfil de 200K; 16,6-21,1 tok/s con el de 1M.
- Latencia: TTFT de 195 s para un prompt de 128K tokens; 668-749 tok/s de prefill según longitud.

## Comparativa con modelos similares

| Modelo | Formato / precision | Tamaño | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| keys-GLM-5.3-EXL3-2.75BPW (este) | EXL3, 2,75 bpw mixto por experto | 258 GB | 200K (hasta 1M con DCP 4) | 23,8-30,9 tok/s; KL 0,124 nats; top-1 89,6 % | glm-5.3 |
| keys-GLM-5.3-EXL3 | EXL3, anchura uniforme | no disponible | no disponible | no disponible | glm-5.3 |
| keys-GLM-5.3-EXL3-3.0BPW-abliterated | EXL3 3,0 bpw, ablacionado | no disponible | 1.024K (según LLM Explorer) | KL 0,102 nats; top-1 91,1 % | glm-5.3 |
| zai-org/GLM-5.3 (BF16 base) | BF16 | 753B parámetros | no disponible | Perplejidad 2,750 (referencia) | glm-5.3 |

Comparativa orientativa: la variante 3.0BPW ablacionada reporta menor KL (0,102 nats) y mayor acuerdo top-1 (91,1 %) que esta versión de 2,75 bpw, a costa de más bits y de una modificación del comportamiento del modelo (ablación). Frente al BF16 base, esta cuantización introduce una divergencia media de 0,124 nats y aproximadamente uno de cada diez argmax difiere del modelo sin cuantizar.

## Limitaciones y advertencias

- La cuantización a 2,75 bpw introduce divergencia frente al BF16: KL de 0,124 nats y un 89,6 % de acuerdo top-1 implican que alrededor del 10 % de las decisiones argmax difieren del modelo original.
- Riesgo de alucinación inherente al modelo base, no mitigado por la cuantización; la model card no documenta medidas de alineación adicionales.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano ni de otros idiomas.
- Restricciones de licencia: el uso está sujeto a la licencia `glm-5.3` del modelo base de Z.ai; conviene revisar sus términos antes de cualquier uso comercial.
- Dependencia de software no público: el despliegue con vLLM requiere la imagen propia del autor (no publicada) y kernels EXL3 específicos; vLLM estándar no soporta todavía este formato.
- El prefill es un cuello de botella reconocido: 668 tok/s a 128K y TTFT de 195 s en ese escenario; el autor estima que podría mejorarse hasta 2x.
- Requisitos de hardware muy elevados: cuatro DGX Spark como mínimo, 258 GB de pesos y agregación de memoria entre máquinas; no es desplegable en una GPU de consumo.
- La rama TensorFold-native es experimental, no fusionada en upstream y más lenta (18-20 tok/s) que la ruta vLLM.
- El repositorio tiene muy poca adopción (21 descargas, 1 like) y fue actualizado una sola vez el mismo día de su creación, por lo que no cuenta con validación externa amplia.
- Los recuentos de parámetros difieren entre fuentes (138B según metadatos de safetensors de este repo, 753B para el base, 165B en LLM Explorer), lo que refleja distintas formas de contar pesos cuantizados; conviene no interpretar el valor de safetensors como parámetros efectivos del modelo.
- No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) que permitan una evaluación funcional directa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/drowzeys/keys-GLM-5.3-EXL3-2.75BPW
- Variante de anchura uniforme: https://huggingface.co/drowzeys/keys-GLM-5.3-EXL3
- Modelo base GLM-5.3: https://huggingface.co/zai-org/GLM-5.3
- Perfil del autor en HuggingFace: https://huggingface.co/zai-org
- Repositorio exllamav3 (turboderp): https://github.com/turboderp-org/exllamav3
- Kernel universal EXL3 experts (ashhart / TensorFold): https://github.com/ashhart/TensorFold
- Repositorio de la variante 3.0BPW abliterada: https://github.com/drowzeys/keys-GLM-5.3-EXL3-3.0BPW-abliterated-vLLm-cuda-Exl3
- Perfil de GitHub del autor: https://github.com/drowzeys
- Ficha en LLM Explorer: https://llm-explorer.com/model/drowzeys%2Fkeys-GLM-5.3-EXL3,2pLaXD4DArT1btohFrNmAL
