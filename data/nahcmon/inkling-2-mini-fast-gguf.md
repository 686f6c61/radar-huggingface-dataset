# nahcmon/Inkling-2-Mini-fast-GGUF

## Resumen

Inkling-2-Mini-fast-GGUF es una cuantización personalizada del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario nahcmon. Se trata de un modelo de arquitectura MoE con capacidad de visión y una ventana de contexto de 128.000 tokens, cuyo objetivo principal es hacer viable su ejecución en una única GPU de consumo de 12 GB de VRAM. El repositorio incluye tanto los pesos cuantizados en formato GGUF como un motor llama.cpp modificado (inkling-fast-llama.cpp) específicamente adaptado para cargar estos tensores repaquetados.

La relevancia de esta ficha radica en que el modelo original, con 26.070.390.272 parámetros totales, no cabe en tarjetas de 12 GB con cuantizaciones estándar, lo que obliga a descargar parte de los expertos a la CPU y penaliza gravemente la latencia. El autor resuelve el problema mediante una combinación de cuantización selectiva (IQ2_XS en las puertas de los expertos, NVFP4 en las proyecciones down, Q6_K en atención), repaquetado de pesos ("folded") y una serie de optimizaciones a nivel de kernel que permiten mantener el modelo completo en VRAM junto con el proyector de visión y una caché KV compartida para 8 peticiones paralelas.

El resultado es un incremento medido de aproximadamente 6,3 veces en la velocidad de decodificación con prompts cortos (de 12,2 a 76,7 tok/s) y de más de 8 veces en el prefill de prompts de 48k tokens (de 199 a 1632 tok/s), manteniendo una calidad equivalente al cuantizado UD-Q4_K_M de referencia según la divergencia KL reportada (0,0498 en ambos casos).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con atención y proyector de visión (detalles del transformer base no disponibles) |
| Parámetros totales | 26.070.390.272 |
| Parámetros activos | no disponible |
| Longitud de contexto | 131.072 tokens (128k) en el fichero fast-small; 64k sin visión o 48k con visión en fast-folded |
| Tipos de cuantización | IQ2_XS (expert gate/up), NVFP4 (expert down original), IQ3_XXS (expert down en fast-small), Q6_K (atención), Q8_0 (proyector de visión), KV cache q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (requiere motor inkling-fast-llama.cpp; no carga en llama.cpp estándar) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del transformer base ni el proceso de entrenamiento del modelo original thinkingmachines/Inkling-2-Mini (número de tokens, composición del dataset, uso de RLHF/DPO, etc.). Lo que sí se documenta con precisión es la arquitectura MoE (Mixture of Experts) y la presencia de un proyector de visión independiente que permite entrada de imágenes. El modelo emplea una mezcla por profundidad ("depth mix") con un banco normalizado de salidas de bloques, una activación SiTU, una convolución corta con actualización de estado y una convolución dinámica de K/V en tiempo de decodificación, además de un sesgo de posición relativa que se calcula dentro del kernel de atención ("banded flash attention").

El trabajo de nahcmon se centra en la optimización de inferencia, no en el entrenamiento. Las innovaciones técnicas documentadas incluyen: repaquetado de pesos ("folded weights") para fusionar proyecciones que comparten entrada en una sola matmul; fusión del "depth mix" en un único kernel (scores, softmax, suma ponderada); máscara de atención compartida por grafo en lugar de por capa; kernels fusionados para SiTU, convolución corta y clip L2 por filas (bit-exactos, +6,5% decodificación y +10% prefill); un kernel MoE más rápido para múltiples chats que elimina acumuladores de puerta no usados (de 98 a 237 tok/s en decodificación con 8 chats); y almacenamiento compartido de prefijos de prompt entre peticiones paralelas. Se probó decodificación especulativa (DSpark) pero se descartó porque en este MoE cada token borrador carga más expertos (72,6 frente a ~80 tok/s con 1 chat; 58,8 frente a ~195 tok/s totales con 8 chats).

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 128k tokens.
- Razonamiento y respuesta a instrucciones en formato conversacional.
- Procesamiento de imágenes mediante proyector de visión (mmproj Q8_0, 0,35 GB).
- Ejecución de hasta 8 peticiones concurrentes compartiendo una única caché KV de 128k tokens.
- Reutilización de prefijos de prompt largos entre peticiones paralelas (por ejemplo, un system prompt de 13,1k tokens procesado en 7-42 ms por cada uno de 8 subagentes).
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada (aunque se mencionan subagentes de OpenCode como caso de uso).
- Capacidades multilingües: no disponible.

## Casos de uso

- Despliegue de asistentes conversacionales con contexto largo en una sola RTX 3080 Ti de 12 GB: el modelo cabe completo en VRAM con 128k de contexto y visión, permitiendo conversaciones multi-turno sin descargar expertos a la CPU.
- Servicio de inferencia para varios usuarios simultáneos en hardware de consumo: con `-np 8` se alcanzan 196,5 tok/s agregados con 8 peticiones concurrentes, adecuado para pequeños equipos o demos públicas.
- Procesamiento de documentos extensos con imágenes: la ventana de 128k tokens junto con el proyector de visión permite analizar informes, capturas o diagramas junto a texto largo en una única pasada.
- Pipelines de agentes con system prompts compartidos: la reutilización de prefijos entre peticiones paralelas acelera arquitecturas de subagentes (por ejemplo, OpenCode) que comparten un mismo prompt de sistema de decenas de miles de tokens.
- Asistencia de código en local: el modelo puede integrarse en entornos de desarrollo que requieran privacidad total, ejecutándose en una GPU de consumo sin depender de APIs externas.
- Investigación y evaluación de modelos MoE: sirve como banco de pruebas para estudiar el impacto de cuantizaciones agresivas (IQ2_XS, IQ3_XXS) en la calidad, con métricas de KLD reproducibles frente a logits de referencia.
- Prototipado rápido de aplicaciones con visión y lenguaje en estaciones de trabajo modestas: evita el coste de GPUs de datacenter (A100/H100) para fases de desarrollo y validación.

## Benchmarks y rendimiento

Rendimiento medido en una RTX 3080 Ti de 12 GB con fast-small + visión, 128k, KV q4_0, `-np 8 -kvu -ub 256`, 256 tokens por petición, temperatura 1,0 (benchmark HTTP extremo a extremo):

| Peticiones simultáneas | tok/s por petición | tok/s totales |
|---:|---:|---:|
| 1 | 81,6 | 77,9 |
| 2 | 63,4 | 117,8 |
| 4 | 42,2 | 155,4 |
| 8 | 26,7 | 196,5 |

Comparativa fast-folded frente al original UD-Q4_K_M con llama.cpp estándar (RTX 3080 Ti, 64k, KV q4_0):

| Métrica | Original (UD-Q4_K_M) | Este modelo + inkling-fast |
|---|---:|---:|
| Decodificación, prompt corto | 12,2 tok/s (27,4 ajustado a mano) | 76,7 tok/s |
| Decodificación tras prompt de 48k | 12,5 tok/s | 56,0 tok/s |
| Prefill de prompt de 48k | 199 tok/s | 1632 tok/s |
| Calidad, KLD media vs logits de referencia | 0,0498 | 0,0498 |
| VRAM | 10,6 GB (resto en RAM del sistema) | 11,9 GB, todo en GPU |

Calidad: KLD media de fast-small frente a fast-folded de 0,013 (top-1 95,8%); la caché KV q4_0 añade 0,007 frente a f16. `llama-bench`: pp512 2330 tok/s, tg128 80 tok/s (a profundidad 16k: 1890 / 70). Decodificación sola (`llama-batched-bench`): 124 / 174 / 237 tok/s con 2 / 4 / 8 chats (el autor advierte que este benchmark sobreestima el rendimiento MoE real).

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 11,4 GB con fast-small + visión + 128k + KV q4_0 + 8 peticiones; 11,9 GB con fast-folded a 64k; 12,0 GB con caché KV compartida de 64k para cualquier número de chats.
- GPU recomendadas: RTX 3080 Ti 12 GB (medida de referencia del autor); cualquier GPU con al menos 12 GB de VRAM.
- Cabe en GPU de consumo: sí, en tarjetas de 12 GB o más (RTX 3080 Ti, 4070 Ti, 4080, 4090, etc.).
- Opciones de despliegue: exclusivamente el motor inkling-fast-llama.cpp (fork de llama.cpp), con `llama-server`; los tensores repaquetados no cargan en llama.cpp estándar. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: 81,6 tok/s por petición con 1 petición; 196,5 tok/s agregados con 8; prefill de 48k tokens a 1632 tok/s.
- Configuración de servidor sugerida: `-lm none`, `--cache-ram 0`, KV q4_0, `-ub 512`, `--ctx-checkpoints 2`.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Visión | Licencia | Formato / despliegue |
|---|---:|---:|---|---|---|
| Inkling-2-Mini-fast (este) | 26,07 B | 128k (fast-small) | Sí | Apache 2.0 | GGUF + motor inkling-fast |
| thinkingmachines/Inkling-2-Mini (original) | 26,07 B | no disponible | Sí | Apache 2.0 | safetensors |
| unsloth/Inkling-2-Mini-GGUF | 26,07 B | no disponible | Sí | Apache 2.0 | GGUF (llama.cpp estándar) |
| Modelos comparables de otro fabricante | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de benchmarks de modelos alternativos de otros fabricantes, por lo que no es posible establecer una comparativa de rendimiento cuantitativa más allá de las tres variantes del mismo modelo base.

## Limitaciones y advertencias

- Los pesos están repaquetados ("folded") y solo cargan en el fork inkling-fast-llama.cpp; no son compatibles con llama.cpp estándar ni con otras herramientas de inferencia convencionales.
- La cuantización es agresiva (IQ2_XS en las puertas de los expertos), lo que introduce una divergencia de calidad medible: KLD de 0,013 de fast-small frente a fast-folded y 0,0498 frente a los logits de referencia, con un top-1 del 95,8%.
- La decodificación especulativa (DSpark) se probó y se descartó por degradar el rendimiento en esta arquitectura MoE; no debe asumirse que esté disponible.
- El benchmark `llama-batched-bench` sobreestima el throughput real en MoE (las secuencias comparten prompt y enrutan a los mismos expertos); las cifras HTTP del autor son las representativas.
- No se dispone de información sobre sesgos, riesgo de alucinación, cobertura idiomática ni resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el autor no documenta restricciones adicionales ni condiciones de atribución específicas más allá de la licencia del modelo base.
- El modelo depende de un fork mantenido por un único autor (nahcmon); la continuidad del proyecto y la compatibilidad futura con versiones de llama.cpp no están garantizadas.
- El rendimiento medido corresponde a una RTX 3080 Ti concreta; en otras GPU los números pueden variar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nahcmon/Inkling-2-Mini-fast-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de referencia de unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Motor de inferencia (fork de llama.cpp): https://github.com/nahcmon/inkling-fast-llama.cpp
