# shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-8.9GB

## Resumen

Inkling-2-Mini-LookAtMyQuant-8.9GB es una cuantizacion agresiva del modelo base `thinkingmachines/Inkling-2-Mini`, un transformer de tipo Mixture-of-Experts (MoE) con 26.400 millones de parametros totales y 5.400 millones activos por token. El autor de la cuantizacion es el usuario de Hugging Face `shinmegamiboson`, que utiliza su propio compilador de cuantizacion llamado LookAtMyQuant para comprimir los 18,89 GB de pesos nativos en BF16 hasta 8,85 GB, lo que supone una ratio de compresion de 2,1x y una media de 2,72 bits por parametro de texto.

El problema que resuelve esta build es permitir ejecutar un modelo MoE de 26B parametros en hardware de consumo, concretamente en Apple Silicon mediante MLX y en GPUs NVIDIA mediante CUDA, manteniendo una calidad cercana al modelo original. Segun la model card, la build alcanza un 95,5% de media en dos tareas (GSM8K y HumanEval) con un limite de 960 tokens de razonamiento, lo que representa el 99,8% del rendimiento del profesor BF16 (95,7%). El modelo esta empaquetado con la libreria `trellis` y soporta decodificacion especulativa mediante un drafter DSpark de 179 MB.

La relevancia actual de esta ficha reside en que demuestra que la cuantizacion extrema (por debajo de 3 bits por parametro) puede ser viable para modelos MoE cuando se aplica una estrategia selectiva que preserva los expertos mas criticos en formatos de mayor precision. El modelo conserva licencia Apache 2.0 y soporta ingles y otros idiomas, lo que lo hace apto para despliegues en produccion con restricciones de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atencion estandar; empaquetado con trellis |
| Parametros totales | 26.400 millones (26,4B) |
| Parametros activos | 5.400 millones (5,4B) por token |
| Longitud de contexto | No disponible (la model card menciona evaluacion de recall a 16.384 tokens, pero no se especifica el maximo oficial) |
| Tipos de cuantizacion | 2,72 bits por parametro de texto; mezcla de NVFP4 nativo (4,50 bpp) para 23/192 buckets de expertos, codigos trellis ht2/ht3/rtr4 de 4 KB SRAM, y suelo trellis de 2 bits en la cola del output head |
| Idiomas soportados | Ingles y multilingue (13 idiomas evaluados en calibracion) |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos empaquetados para runtime LookAtMyQuant (MLX y CUDA); no se especifica safetensors ni GGUF estandar |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 26,4B parametros totales y 5,4B activos, lo que implica un ratio de activacion de aproximadamente el 20,5%. La cuantizacion se realizo mediante un proceso en dos fases: primero una compilacion de cuantizacion de 21,1 minutos y despues un pulido de 18,7 minutos, todo ello en una unica GPU B200 (0,66 horas-GPU B200 en total). El metodo combina un "knapsack" de expertos MoE con paso directo de NVFP4 nativo exacto, preservando los 23 buckets de expertos mas calientes en 4,50 bpp sin error de cuantizacion, y empaquetando el resto con codigos trellis de 4 KB SRAM (ht2, ht3, rtr4) sin buckets de 1 bit. Ademas, se protege la cola del output head con un suelo trellis de 2 bits.

La calibracion utiliza Hessians densos de todos los tokens compartidos entre expertos, con una mezcla 70/30 de texto chat-templated de 6 clases del propio Inkling y texto multilingue de 13 idiomas. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset original ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card se centra exclusivamente en el proceso de cuantizacion. La innovacion tecnica destacable es la decodificacion especulativa mediante un drafter DSpark de 179 MB en 4 bits, que acelera la generacion en MLX y CUDA.

## Capacidades

- Generacion de texto conversacional y de prosa en ingles y otros idiomas.
- Razonamiento matematico: resuelve problemas de GSM8K con un 96,5% de acierto (193/200) cuando se limita el razonamiento a 960 tokens.
- Generacion de codigo: alcanza un 94,5% en HumanEval estricto (155/164) con el mismo limite de tokens.
- Modo de razonamiento explicito (`<|content_thinking|>`) con trazas de pensamiento que pueden limitarse mediante `--max-thinking-tokens`.
- Soporte de tool calling y flujos agenticos: la model card reporta KL especifico para la clase "tools/agentic" (0,0832 y 0,0588 respectivamente).
- Capacidades multilingues: evaluado en 13 idiomas con KL de 0,0628 en texto crudo multilingue.
- Recuperacion de contexto largo: 15/16 en recall a 16.384 tokens (8/8 agujas factuales).
- Decodificacion especulativa con drafter DSpark para acelerar la inferencia.

## Casos de uso

- Asistente de razonamiento matematico en local: el modelo resuelve problemas de algebra y aritmetica paso a paso (por ejemplo, "What is 17 times 23? Show the steps") con un 96,5% de acierto en GSM8K; es adecuado para entornos educativos o de prototipado donde no se quiere depender de APIs en la nube y se dispone de un Apple M5 Max o una GPU NVIDIA con al menos 10 GB de VRAM.
- Generacion de codigo en pipelines de CI/CD: con un 94,5% en HumanEval estricto y soporte de tool calling, puede integrarse en flujos de autocompletado, generacion de tests unitarios o revision de parches, ejecutandose en una sola GPU de consumo gracias a los 8,85 GB de pesos.
- Agentes multi-paso con acceso a herramientas: la clase "agentic" tiene un KL de 0,0588 frente al BF16, lo que indica que la cuantizacion preserva razonablemente el comportamiento de planificacion y llamada a funciones; se usaria con el runtime `lamq serve` exponiendo un endpoint HTTP en el puerto 8080.
- Chat multilingue de atencion al cliente: el modelo soporta 13 idiomas en calibracion y mantiene un KL de 0,0628 en texto multilingue crudo; puede gestionar conversaciones multi-turno con contexto de hasta 16k tokens verificados en recall.
- Analisis de documentos largos con recuperacion de datos: el recall de 15/16 a 16.384 tokens (8/8 agujas factuales) lo hace util para extraer informacion concreta de contratos, informes o articulos extensos en una sola pasada.
- Despliegue en Apple Silicon para desarrollo offline: con 8,84 GB activos y 9,68 GB de pico de RAM en un M5 Max, el modelo cabe en un portatil de gama alta y permite generar a 56 tok/s en serie y 117,9 tok/s con decodificacion especulativa, adecuado para prototipado sin conexion.
- Servicio de generacion de texto de bajo coste en produccion: el throughput de 1.784 tok/s en prefill (T=512) y la posibilidad de servir con `lamq serve --ui` lo hacen viable para cargas moderadas en una unica GPU B200 o en hardware de consumo con CUDA.

## Benchmarks y rendimiento

Los datos de la model card comparan esta build con el profesor BF16 y otras cuantizaciones de la misma familia. La evaluacion se realizo con `max_new_tokens = 1.536`, decodificacion greedy y `reasoning_effort="none"`, sobre `openai/gsm8k` (`test[:200]`) y los 164 problemas ejecutables de `openai/openai_humaneval` con ejecucion estricta.

| Build | GB texto | bpp | KL crudo (en / 13 idiomas) | KL 6 clases | GSM8K (200) | HumanEval (164) |
|---|---:|---:|---:|---:|---:|---:|
| Original BF16 (profesor) | 18,89 | 5,80 | 0,0000 / 0,0000 | 0,0000 | 94,0% → 94,5% | 89,6% → 97,0% |
| 12,8 GB | 12,74 | 3,92 | 0,0084 / 0,0209 | 0,0465 | 94,5% → 96,0% | 90,9% → 95,7% |
| 11,2 GB | 11,16 | 3,43 | 0,0131 / 0,0315 | 0,0461 | 95,0% → 97,5% | 88,4% → 95,1% |
| **Esta build (8,9 GB)** | **8,85** | **2,72** | **0,0278 / 0,0628** | **0,0530** | **95,0% → 96,5%** | **84,8% → 94,5%** |
| 5,4 GB | 5,38 | 1,65 | 0,0859 / 0,2659 | 0,1440 | 92,5% → 93,5% | 76,8% → 85,4% |
| 4,7 GB | 4,72 | 1,45 | 0,1179 / 0,3731 | 0,1668 | 90,5% → 94,5% | 67,1% → 78,0% |
| 3,9 GB | 3,85 | 1,18 | 0,2189 / 0,6058 | 0,2329 | 86,5% → 88,5% | 59,2% → 70,7% |

Desglose de KL por clase de chat para la build de 8,9 GB (KL medio de siguiente token en nats, menor es mejor):

| Metrica | Valor |
|---|---:|
| KL medio 6 clases chat-templated (top-1) | 0,0530 (94,47%) |
| KL tools / agentic | 0,0832 / 0,0588 |
| KL reasoning / code / prose | 0,0299 / 0,0602 / 0,0353 |
| KL multilingual / copy rows | 0,0504 / 0,1121 |
| KL TextMix crudo (en,chat,code / 13 idiomas) | 0,0278 / 0,0628 |
| Recall a 16k depth-contrast (capped / raw margin) | 15/16 (+4,66 / +8,30 nats; 8/8 agujas) |

La model card indica ademas que la build alcanza un 95,5% de media en dos tareas con `--max-thinking-tokens 960` (193/200 = 96,5% en GSM8K y 155/164 = 94,5% en HumanEval estricto), lo que supone el 99,8% del 95,7% del profesor BF16. El KL crudo en texto sin template (0,0278) es 1,75 veces menor que el del GGUF `UD-Q2_K_XL` de 9,14 GB de Unsloth (0,0486).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,84 GB de pesos activos y 9,68 GB de pico de RAM en Apple Silicon con MLX; en CUDA se requiere al menos 10 GB de VRAM para cargar los pesos y el drafter.
- GPU recomendadas: NVIDIA B200 (usada para la compilacion de cuantizacion), GPUs CUDA con al menos 10-12 GB de VRAM; en Apple Silicon, un M5 Max con 8,84 GB activos y 9,68 GB de pico.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM (por ejemplo, RTX 3060 de 12 GB, RTX 4070, RTX 4080, RTX 4090) y en Apple Silicon de gama alta con memoria unificada suficiente.
- Opciones de despliegue: runtime propio LookAtMyQuant (`lamq generate`, `lamq chat`, `lamq serve --ui`, API Python `runtime_mlx.Runtime`), con soporte para MLX en Apple Silicon y CUDA en NVIDIA (Triton y PTX DSpark con `--drafter auto`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados (Apple M5 Max, drafter DSpark de 179 MB): 1.784 tok/s en prefill T=512, 56,0 tok/s en decodificacion serie, 117,9 tok/s en decodificacion media con drafter (139,7 tok/s en matematicas, 96,2 tok/s en codigo). Para CUDA no se especifican cifras de throughput en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | HumanEval | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| **Inkling-2-Mini-LookAtMyQuant-8.9GB** | 26,4B totales / 5,4B activos | No disponible (recall verificado a 16k) | 96,5% (cap 960) | 94,5% (cap 960) | Apache 2.0 | Hugging Face, runtime LookAtMyQuant |
| Inkling-2-Mini-LookAtMyQuant-11.2GB | 26,4B totales / 5,4B activos | No disponible | 97,5% (cap 960) | 95,1% (cap 960) | Apache 2.0 | Hugging Face, runtime LookAtMyQuant |
| Inkling-2-Mini-LookAtMyQuant-5.4GB | 26,4B totales / 5,4B activos | No disponible | 93,5% (cap 960) | 85,4% (cap 960) | Apache 2.0 | Hugging Face, runtime LookAtMyQuant |
| Unsloth UD-Q2_K_XL (GGUF) | No disponible (base Inkling-2-Mini) | No disponible | No disponible | No disponible | No disponible | GGUF de 9,14 GB; KL crudo 0,0486 frente a 0,0278 de esta build |

La comparativa se limita a variantes de la misma familia porque la model card no proporciona datos de modelos de otros desarrolladores. El GGUF de Unsloth se incluye unicamente por el dato de KL crudo mencionado en la model card (0,0486 frente a 0,0278), sin datos de GSM8K ni HumanEval disponibles para esa build.

## Limitaciones y advertencias

- La cuantizacion a 2,72 bpp introduce degradacion medible: el KL crudo en texto multilingue sube a 0,0628 y el KL en la clase "copy rows" a 0,1121, frente a 0,0000 del profesor BF16.
- El rendimiento en HumanEval sin el limite de 960 tokens de razonamiento cae al 84,8% (139/164), muy por debajo del 97,0% del profesor; es imprescindible usar `--max-thinking-tokens 960` para obtener los resultados reportados.
- El recall a 16k es de 15/16, no perfecto: una de las 16 pruebas de recuperacion falla, lo que supone un riesgo en tareas de extraccion de datos criticos.
- No se dispone de informacion sobre sesgos del modelo base ni sobre el dataset de entrenamiento original, por lo que no se pueden evaluar sesgos especificos de esta build.
- Riesgo de alucinacion inherente al modelo base; la cuantizacion agresiva puede amplificarlo en las clases con mayor KL (multilingual y copy rows).
- La licencia Apache 2.0 permite uso comercial, pero el runtime LookAtMyQuant es un proyecto independiente cuyo soporte y mantenimiento no estan garantizados por Thinking Machines.
- El modelo solo esta empaquetado para los runtimes MLX y CUDA de LookAtMyQuant; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, lo que limita la portabilidad a infraestructuras estandar.
- El idioma principal es el ingles; el soporte multilingue esta calibrado pero no se detallan que 13 idiomas concretos ni su rendimiento individual.
- La fecha de creacion del repositorio (2026-11-21) y la dependencia de un runtime de terceros implican que la estabilidad a largo plazo del ecosistema no esta verificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-8.9GB
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Drafter DSpark 4-bit: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-drafter
- Build de 12,8 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-12.8GB
- Build de 11,2 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-11.2GB
- Build de 5,4 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-5.4GB
- Build de 4,7 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-4.7GB
- Build de 3,9 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-3.9GB
- Repositorio del runtime LookAtMyQuant: https://github.com/ShinMegamiBoson/lookatmyquant
- Sitio web de LookAtMyQuant: https://lookatmyquant.com/
