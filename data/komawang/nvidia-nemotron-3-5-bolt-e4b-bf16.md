# komawang/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16

## Resumen
NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 es un modelo de lenguaje pequeno (SLM) desarrollado por NVIDIA mediante post-entrenamiento sobre google/gemma-4-E4B-it. Se distribuye en precision completa BF16 y esta orientado a asistentes locales de voz y dispositivo, personas interactivas y interfaces embebidas donde la memoria y el tiempo hasta el primer token (TTFT) son criticos. El checkpoint publico lo aloja el usuario komawang en Hugging Face, mientras que la version oficial de referencia vive en el espacio de NVIDIA.

El modelo declara 8.000 millones de parametros totales con 4.000 millones efectivos, lo que lo situa en la categoria de modelos compactos con arquitectura derivada de Gemma-4-E4B. Soporta una longitud de contexto de hasta 64K tokens tanto de entrada como de salida, dispone de modo de razonamiento conmutables mediante plantilla de chat (`enable_thinking`) y de un modo conversacional independiente (`conversational_mode`). Incorpora ademas soporte para decodificacion especulativa mediante un drafter DFlash companion.

Su relevancia actual radica en que NVIDIA publica pesos, datos de entrenamiento y recetas bajo la licencia OpenMDW-1.1, con permiso explicito de uso comercial y no comercial, y con un enfoque declarado en tool use multi-turno, seguimiento de instrucciones y grounding de entrada. La fecha de corte de los datos de post-entrenamiento es mayo de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma-4-E4B (transformer derivado de Gemma 4) |
| Parametros totales | 8B (7.996.156.490 segun safetensors) |
| Parametros activos | 4B efectivos |
| Longitud de contexto | 64K tokens de entrada y 64K tokens de salida |
| Tipos de cuantizacion | BF16 (release principal); Q4_K_M disponible en checkpoint companion NVIDIA-Nemotron-3.5-Bolt-E4B-4GB; drafter DFlash en NVFP4 |
| Idiomas soportados | en, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, ja, ko, lt, lv, nl, no, pl, pt, ro, ru, sk, sl, sv, th, tr, uk, vi, zh |
| Licencia | OpenMDW-1.1 (uso comercial y no comercial permitido) |
| Formato de pesos | safetensors (BF16); transformers |

## Arquitectura y entrenamiento
El modelo parte de google/gemma-4-E4B-it, un transformer de la familia Gemma 4 con 8B parametros totales y 4B efectivos, lo que sugiere un esquema de computo condicional o comparticion de parametros que reduce el coste de inferencia respecto a un denso equivalente. NVIDIA aplica un post-entrenamiento adicional sobre el checkpoint base, apoyandose en los datasets propios nvidia/nemotron-pre-training-datasets y nvidia/nemotron-post-training-v3. No se detalla en la informacion disponible el numero exacto de tokens de post-entrenamiento ni la composicion completa del dataset, aunque la model card referencia un informe tecnico especifico del modelo (NVIDIA-Nemotron-3.5-Bolt-E4B-4GB Technical Report) y un blog asociado.

Entre las innovaciones tecnicas destacadas figuran el control del razonamiento mediante plantilla de chat (`enable_thinking=True/False`) con presupuesto de pensamiento configurable en tiempo de ejecucion, un modo conversacional separado (`conversational_mode`), y el soporte nativo de decodificacion especulativa mediante un drafter DFlash publicado en NVFP4. El modelo esta pensado para despliegue en vLLM (probado con v0.31.0) con parsers especificos `gemma4` para tool calling y razonamiento. La temperatura recomendada es 1.0 con top_p 0.95 en ambos modos de pensamiento.

## Capacidades
- Generacion de texto conversacional multi-turno con contexto de hasta 64K tokens.
- Razonamiento conmutable: modo pensamiento activable o desactivable por plantilla de chat, con presupuesto de razonamiento ajustable en runtime.
- Tool calling y function calling con parser dedicado (`--tool-call-parser gemma4`).
- Razonamiento multi-paso orientado a agentes, con soporte de parser de razonamiento (`--reasoning-parser gemma4`).
- Grounding de entrada para asistentes de voz y dispositivo.
- Capacidades multilingues en 34 idiomas, incluyendo espanol, ingles, aleman, frances, italiano, portugues, arabe, chino, japones, coreano, hindi y la mayoria de lenguas europeas.
- Modo conversacional independiente del modo de razonamiento.
- Compatibilidad con decodificacion especulativa DFlash para reducir latencia.
- La model card declara entrada/salida de texto; el pipeline_tag de Hugging Face aparece como `image-text-to-text`, pero la configuracion de servicio recomienda desactivar image, video y audio (`--limit-mm-per-prompt '{"image":0,"video":0,"audio":0}'`), por lo que no se confirma soporte multimodal operativo.

## Casos de uso
- Asistentes de voz locales: el modelo esta disenado para baja latencia y bajo TTFT, con modo conversacional y contexto de 64K que permite mantener dialogos largos en dispositivos con recursos limitados.
- Interfaces embebidas y edge: los 4B parametros efectivos y la disponibilidad de una version Q4_K_M de aproximadamente 4 GB permiten desplegarlo en hardware de borde o en GPUs de consumo.
- Personas interactivas: el modo conversacional conmutable y la temperatura recomendada de 1.0 favorecen respuestas naturales y consistentes en personajes con personalidad sostenida.
- Agentes con tool calling multi-turno: el soporte nativo de function calling con parser `gemma4` y el razonamiento multi-paso lo hacen adecuado para pipelines de agentes que encadenan llamadas a APIs.
- Automatizacion de soporte en varios idiomas: con 34 idiomas declarados puede gestionar conversaciones de atencion al cliente en espanol, ingles, aleman, frances, portugues y otros sin cambiar de modelo.
- Razonamiento con presupuesto controlado: el control de `enable_thinking` y del budget permite alternar entre respuestas rapidas y analisis profundos segun el caso, util en sistemas con SLA de latencia estrictos.
- Prototipado e investigacion: al ser BF16 completo y liberar datos y recetas, sirve como base para post-entrenamiento y evaluacion personalizada.
- Sustitucion de modelos mayores en tareas acotadas: para clasificacion, extraccion y resumen con contexto largo, el coste de inferencia es menor que el de modelos densos de mayor tamano.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16: aproximadamente 16 GB solo para pesos (16.1 GB de repo), mas cache KV; con contexto de 64K y `--gpu-memory-utilization 0.85` se recomienda al menos 24 GB para una sola secuencia.
- GPU recomendadas: H100 para el ejemplo de referencia de NVIDIA en vLLM; A100 40/80 GB para despliegues con concurrencia; RTX 4090 (24 GB) para BF16 con contexto reducido o para la version Q4_K_M.
- Cabe en GPU de consumo: si, en RTX 4090 con BF16 y contexto moderado, y en GPUs de 8-12 GB con la cuantizacion Q4_K_M (checkpoint de ~4 GB).
- Opciones de despliegue: vLLM (v0.31.0 o superior) con `--chat-template`, `--enable-auto-tool-choice`, `--tool-call-parser gemma4` y `--reasoning-parser gemma4`; transformers para post-entrenamiento y evaluacion. No se confirma soporte de llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no se proporcionan cifras concretas; la model card enfatiza bajo TTFT y la existencia del drafter DFlash sugiere mejoras de throughput con decodificacion especulativa, pero sin numeros publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 | 8B totales / 4B efectivos | 64K entrada y salida | OpenMDW-1.1 (comercial permitido) | Hugging Face, pesos BF16 y Q4_K_M |
| google/gemma-4-E4B-it (modelo base) | 8B totales / 4B efectivos | no disponible en esta ficha | Gemma (terminos propios) | Hugging Face |
| NVIDIA-Nemotron-3.5-Bolt-E4B-4GB | 8B totales / 4B efectivos | 64K | OpenMDW-1.1 | Hugging Face, Q4_K_M |

No se dispone de datos de benchmarks que permitan comparar rendimiento numerico con alternativas de la misma categoria.

## Limitaciones y advertencias
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan tasas especificas en la informacion disponible.
- Sesgos conocidos: no se detallan en la model card; al derivar de Gemma 4 hereda los sesgos del modelo base y de los datasets de post-entrenamiento de NVIDIA.
- El soporte multimodal no esta confirmado: aunque el pipeline_tag es `image-text-to-text`, la configuracion recomendada desactiva image, video y audio.
- La fecha de corte de datos es mayo de 2026; informacion posterior no esta cubierta.
- El contexto maximo es de 64K tokens; secuencias mas largas requieren truncado o estrategias externas.
- Aunque se declaran 34 idiomas, el rendimiento relativo por idioma no se documenta; el espanol esta incluido pero sin metricas.
- La licencia OpenMDW-1.1 permite uso comercial, pero conviene revisar sus terminos completos antes de produccion.
- El checkpoint de este repositorio es una copia alojada por un tercero (komawang); para produccion se recomienda usar el repositorio oficial de NVIDIA.
- El despliegue optimo depende de vLLM con parsers especificos `gemma4`; otros runtimes pueden no soportar tool calling o razonamiento de forma nativa.

## Enlaces
- Hugging Face (este repositorio): https://huggingface.co/komawang/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Version cuantizada Q4_K_M: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB
- Drafter DFlash NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-DFlash-NVFP4
- Informe tecnico: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-Technical-Report.pdf
- Blog: https://research.nvidia.com/labs/nemotron/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB/
- Pagina de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia OpenMDW-1.1: https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1
- Discord NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- arXiv referenciado en los tags: https://arxiv.org/abs/2509.04292
