# banyohavlusu23/Inkling-2-Mini-Opus-Reasoning-GGUF

## Resumen

Inkling-2-Mini-Opus-Reasoning-GGUF es un ajuste fino mediante LoRA del modelo multimodal thinkingmachines/Inkling-2-Mini, publicado por el usuario banyohavlusu23 en Hugging Face. Su objetivo no es mejorar la capacidad bruta del modelo base, sino reducir drásticamente la longitud de las trazas de razonamiento (thinking tokens) manteniendo la calidad de las respuestas. El autor lo entrena con SFT sobre trazas cortas de razonamiento estilo Opus, con un rango LoRA de 32 aplicado solo a las capas de atencion.

El modelo conserva los 26.070.390.272 parametros del Inkling-2-Mini original (arquitectura Mixture-of-Experts segun los comandos de despliegue del autor, que distinguen expertos por capa) y se distribuye en formato GGUF en cuatro cuantizaciones (Q2_K_XL, IQ3_XXS, Q3_K_XL y Q4_K_M), ademas del proyector multimodal mmproj-F16.gguf y el adaptador LoRA suelto en F16. La licencia es Apache 2.0, lo que facilita su uso comercial.

Su relevancia actual reside en el coste de inferencia: el autor reporta una reduccion de 4,4x en tokens de pensamiento en tareas de codigo (645 a 147 de media) manteniendo 20/20 tests superados, y de 2,7x en prompts generales (2.648 a 983). A cambio, el rendimiento en benchmarks estandar cae de forma apreciable (MATH-500 de 97,2% a 90,0%; HumanEval+ de 94,5% a 81,7%), por lo que es un modelo para escenarios donde la latencia y el coste importan mas que la precision maxima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (derivada de Inkling-2-Mini; el autor distingue expertos por capa en `ffn_*_exps`) |
| Parametros totales | 26.070.390.272 (~26,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens (valor usado en la configuracion de ejemplo del autor con `-c 65536`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q2_K_XL (~9,7 GB), IQ3_XXS (~12,3 GB), Q3_K_XL (~14,2 GB), Q4_K_M (17,2 GB); adaptador LoRA en F16; proyector mmproj en F16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), safetensors + adaptador PEFT para Transformers |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer multimodal de tipo Mixture-of-Experts con 26,1 mil millones de parametros totales y capacidad de entrada imagen-texto (pipeline `image-text-to-text`), entrenado por Thinking Machines. El ajuste publicado aqui es un LoRA de rango 32 aplicado exclusivamente a las capas de atencion, entrenado con SFT sobre Tinker durante 1 epoca (327 pasos), con learning rate 5e-4 y decaimiento lineal, batch de 32 y longitud maxima de 8.192 tokens. Los pesos de atencion resultantes se fusionan en las cuantizaciones GGUF y se mantienen en F16 (unos +0,6 GB por fichero).

El dataset de entrenamiento consta de 10.464 filas y 7,5 millones de tokens, deduplicado, procedente de tres colecciones de trazas de razonamiento estilo Claude Opus: Roman1111111/claude-opus-4.6-10000x, lordx64/reasoning-distill-claude-opus-4-7-max y nohurry/Opus-4.6-Reasoning-3000x-filtered. El entrenamiento se realiza al esfuerzo por defecto de la plantilla (0,9) y el objetivo es que el modelo produzca cadenas de pensamiento mas concisas sin perder la respuesta final. Las cuantizaciones base provienen de unsloth/Inkling-2-Mini-GGUF (variantes UD) y el autor incluye tambien el adaptador LoRA en formato GGUF para `--lora` de llama.cpp y en formato PEFT.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento explicito, pero con trazas deliberadamente cortas (estilo "concise reasoning").
- Generacion de codigo en Python y otros lenguajes, con verificacion empirica en 10 tareas pequenas (20/20 tests superados).
- Razonamiento matematico (MATH-500 al 90,0% en la configuracion reportada).
- Entrada de imagenes: el repositorio incluye `mmproj-F16.gguf`, el proyector del modelo base, por lo que soporta pipeline image-text-to-text.
- Conversacion multi-turno (tag `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`) y con el modo `--jinja` de llama.cpp para plantillas de chat.
- Capacidades de tool calling y agentes: no documentadas explicitamente en la informacion disponible.
- Multilingue: limitado a ingles segun la model card.

## Casos de uso

- Generacion de codigo en produccion con latencia baja: el modelo resuelve tareas tipo two-sum, merge intervals o criba de Eratostenes con una media de 147 tokens de pensamiento frente a 645 del base, lo que reduce el tiempo hasta el primer token util en pipelines de CI/CD o asistentes de IDE.
- Razonamiento matematico en entornos con presupuesto de tokens: con MATH-500 al 90,0% y 783 tokens de pensamiento de media (frente a 1.346 del base), es adecuado para tutores automaticos o correctores donde el coste por consulta es critico.
- Despliegue en hardware de consumo: la cuantizacion Q4_K_M (17,2 GB) cabe en 24 GB de VRAM y la Q2_K_XL (9,7 GB) en 16 GB, permitiendo servir el modelo en una RTX 4090 o en un portatil con 8 GB de VRAM y 32 GB de RAM (17,7 tok/s a 64K de contexto medidos por el autor en una RTX 4060 laptop).
- Documentacion tecnica asistida con imagenes: al incluir el proyector multimodal, puede procesar capturas de pantalla o diagramas junto a texto para generar explicaciones o extraer informacion, usando `mmproj-F16.gguf` en llama.cpp.
- Prototipado de agentes conversacionales multi-turno: la ventana de 65.536 tokens permite mantener historiales largos en atencion al cliente o asistentes internos, con la ventaja de que las respuestas llegan antes al usuario al acortar el razonamiento.
- Evaluacion comparativa de estrategias de destilacion: el repositorio incluye el LoRA suelto, de modo que un equipo de investigacion puede aplicarlo sobre otras cuantizaciones (Q8, IQ4) con `llama-export-lora` y medir el equilibrio precision/coste en su propio dominio.
- Inferencia en CPU/GPU hibrida: la receta `-ot` del autor permite mantener los expertos de las capas 6-14 en GPU y el resto en RAM, util para servidores sin aceleradores de gama alta.

## Benchmarks y rendimiento

Datos publicados por el autor (Tinker, BF16, temperatura 0,7, hasta 16K tokens nuevos, 1 muestra por problema, esfuerzo 0,9):

| Benchmark | Base | Opus-Reasoning | Tokens de pensamiento base (media) | Tokens de pensamiento LoRA (media) |
|---|---:|---:|---:|---:|
| MATH-500 (500) | 97,2% | 90,0% | 1.346 | 783 |
| HumanEval+ (164) | 94,5% | 81,7% | 1.563 | 409 |

Longitud de pensamiento en 10 tareas de codigo Python (2 muestras por tarea, verificadas con asserts):

| Tarea | Tokens base | Tokens LoRA | Tests base / LoRA |
|---|---:|---:|---|
| Fibonacci O(log n) | 1.238 | 184 | 2/2 / 2/2 |
| Bracket matching | 1.192 | 58 | 2/2 / 2/2 |
| Flatten nested list | 1.018 | 85 | 2/2 / 2/2 |
| Two-sum | 656 | 433 | 2/2 / 2/2 |
| Longest common subsequence | 516 | 115 | 2/2 / 2/2 |
| Merge intervals | 457 | 122 | 2/2 / 2/2 |
| Sieve of Eratosthenes | 442 | 107 | 2/2 / 2/2 |
| Palindrome check | 362 | 56 | 2/2 / 2/2 |
| Roman to int | 347 | 110 | 2/2 / 2/2 |
| Binary search | 222 | 198 | 2/2 / 2/2 |
| **Media** | **645** | **147** | **20/20 / 20/20** |

Rendimiento medido por el autor en una RTX 4060 laptop (8 GB VRAM + 32 GB RAM, Q4_K_M, contexto 64K): 17,7 tok/s con la receta `-ot` frente a 4,6 tok/s con `--fit`.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion (cifras del autor, RAM + VRAM combinadas): Q2_K_XL ~9,7 GB (cabe en 16 GB), IQ3_XXS ~12,3 GB (16 GB, justo), Q3_K_XL ~14,2 GB (24 GB), Q4_K_M 17,2 GB (24 GB).
- Proyector multimodal: `mmproj-F16.gguf`, 0,6 GB adicionales para entrada de imagen.
- GPU recomendadas: RTX 4090 o A100/H100 de 24 GB o mas para Q3_K_XL y Q4_K_M; GPUs de 16 GB (RTX 4080, A4000) para Q2_K_XL e IQ3_XXS.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con Q4_K_M y en RTX 4060/4070 (8-12 GB) con Q2_K_XL o mediante offload hibrido de expertos a RAM.
- Opciones de despliegue: llama.cpp (b12622 o superior, con `--jinja`), Ollama (`ollama run hf.co/...`), LM Studio, y Transformers + PEFT cargando el adaptador del subdirectorio `lora`.
- Throughput conocido: 17,7 tok/s en RTX 4060 laptop con Q4_K_M, contexto 64K y offload parcial de expertos; latencia para otros hardware no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 | HumanEval+ | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| Inkling-2-Mini (base) | ~26,1 B (MoE) | no disponible | 97,2% | 94,5% | Apache 2.0 | safetensors, GGUF (unsloth) |
| Inkling-2-Mini-Opus-Reasoning (este) | ~26,1 B (MoE) | 65.536 | 90,0% | 81,7% | Apache 2.0 | GGUF, LoRA PEFT |
| Alternativas de razonamiento conciso de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa solo es posible contra el modelo base, ya que la informacion proporcionada no incluye otros modelos de la misma categoria. Frente al base, este ajuste sacrifica 7,2 puntos en MATH-500 y 12,8 puntos en HumanEval+ a cambio de reducir los tokens de pensamiento entre 2,7x y 4,4x.

## Limitaciones y advertencias

- Perdida de precision medible: la caida en HumanEval+ (94,5% a 81,7%) es sustancial; no es adecuado para tareas donde el codigo debe ser correcto a la primera sin supervision.
- Entrenado solo en ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- El ajuste se entreno con SFT sobre trazas de modelos propietarios (Claude Opus); revisar las condiciones de uso de los datasets originales antes de un despliegue comercial, aunque el modelo se distribuya con Apache 2.0.
- Riesgo de alucinacion inherente al modelo base y acentuado por la reduccion de pasos de verificacion: el ejemplo del autor muestra que el modelo deja de comprobar la respuesta ("18/3 x $2 = $12" sin verificacion adicional).
- El modo de razonamiento conciso puede ser contraproducente en problemas que requieren exploracion amplia (busqueda, planificacion, pruebas formales).
- Los benchmarks publicados son de una sola muestra por problema y con una configuracion concreta (temperatura 0,7, esfuerzo 0,9); la varianza no se reporta.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta; no hay validacion independiente de los resultados.
- El despliegue con offload de expertos a RAM requiere flags especificos de llama.cpp (`-ot`) y versiones recientes (b12622 o superior); configuraciones incorrectas degradan el throughput de forma notable (4,6 tok/s frente a 17,7 tok/s en la medicion del autor).
- Capacidades de tool calling y agentes no documentadas; verificar empiricamente antes de integrarlas en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/banyohavlusu23/Inkling-2-Mini-Opus-Reasoning-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantizaciones base de unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Plataforma de entrenamiento Tinker: https://thinkingmachines.ai/tinker/
- Dataset Roman1111111/claude-opus-4.6-10000x: https://huggingface.co/datasets/Roman1111111/claude-opus-4.6-10000x
- Dataset lordx64/reasoning-distill-claude-opus-4-7-max: https://huggingface.co/datasets/lordx64/reasoning-distill-claude-opus-4-7-max
- Dataset nohurry/Opus-4.6-Reasoning-3000x-filtered: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
