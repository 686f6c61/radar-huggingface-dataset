# promotion/Qwen2.5-1.5B-Instruct-HH-NBIVO

## Resumen

`promotion/Qwen2.5-1.5B-Instruct-HH-NBIVO` es un ajuste fino de `Qwen/Qwen2.5-1.5B-Instruct` realizado con el método NB-IVO (Nash-Bargaining Implicit Value Optimization) sobre prompts de Anthropic HH-RLHF, con dos objetivos simultáneos: utilidad (helpfulness) e inocuidad (harmlessness). Lo publica el usuario `promotion` en el marco del proyecto de ética social en IA generativa Saltlux/IITP, en colaboración con KAIST (año 3 del proyecto, 2026), y está etiquetado explícitamente como «módulo asistente, benchmark de sesgo»: no es un modelo de propósito general, sino un artefacto de evaluación de alineación.

El interés técnico está en el método, no en el tamaño. NB-IVO sustituye el profesor de GN-IVO (una softmax sobre la recompensa media) por un profesor de negociación de Nash sobre un pool finito de respuestas (NBPO), que resuelve por prompt un problema `argmax_p Σ_k log(V_k(p) − d_k) − KL(p ‖ uniform)/η` con valores de juego soft-min `V_k(p)` y puntos de desacuerdo `d_k` por objetivo, derivados de márgenes Bradley-Terry contra un banco de muestras congeladas de la política base. El resultado declarado es un salto del 10,51 % al 77,13 % de tasa de éxito en el test de HH-RLHF (2.064 prompts), con una reducción de error del 74,4 % (IC bootstrap 95 %: 72,5–76,4) frente al modelo base.

Es relevante ahora por dos motivos: demuestra que una alineación multiobjetivo sin crítico explícito puede aplicarse a un modelo de 1,78 B parámetros con una sola A100-80GB en 400 actualizaciones, y porque su model card documenta sin adornos el reverso del resultado: el juez independiente prefiere la respuesta del modelo base en aproximadamente el 75 % de los prompts benignos, la tasa de rechazo en prompts dañinos sube del 58 % al 83 % y la capacidad matemática cae (AMC23: 14/40 → 6/40). Conviene leerlo como una ficha de método y de métrica, no como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (herencia de Qwen2.5: RoPE, SwiGLU, RMSNorm, GQA con 2 cabezas KV); no detallada en la model card |
| Parametros totales | 1.777.088.000 (1,78 B; dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no declarada en la model card; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens según su documentación pública |
| Tipos de cuantizacion | no disponibles en el repositorio (solo safetensors en bf16); la arquitectura Qwen2 admite GGUF, AWQ y GPTQ con herramientas estándar, aunque el autor no publica conversiones |
| Idiomas soportados | no disponibles en los metadatos; el ajuste se realizó exclusivamente sobre HH-RLHF, corpus en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), repositorio de 3,6 GB; incluye `generation_config.json` con decodificación greedy, `max_new_tokens=256`, stop en `<|im_end|>`/`<|endoftext|>` y `repetition_penalty=1.0` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base sin modificaciones estructurales: un transformer decoder-only de Qwen2.5 con 1,78 B parámetros totales. Todo el trabajo se concentra en el post-entrenamiento. NB-IVO conserva el objetivo de grupo sin crítico de GN-IVO —una entropía cruzada entre una distribución objetivo sobre las K respuestas muestreadas de cada prompt y sus ratios de política normalizados— pero reemplaza la distribución objetivo `softmax(recompensa media / α)` por un profesor de negociación de Nash (NBPO) construido sobre un pool finito. Para cada prompt se calculan márgenes Bradley-Terry por objetivo contra un banco de 6 muestras congeladas de la política base, se derivan valores de juego soft-min `V_k(p)` y puntos de desacuerdo `d_k`, y se resuelve `p* = argmax_p Σ_k log(V_k(p) − d_k) − KL(p ‖ uniform)/η`. Los prompts en los que ninguna mezcla mejora estrictamente todos los objetivos se descartan; las respuestas truncadas pierden frente a las completas; y la secuencia completa se ajusta con una KL k3 respecto al modelo base.

Los datos son 12.800 prompts de entrenamiento de `Anthropic/hh-rlhf`, con 256 reservados como conjunto de desarrollo para seleccionar checkpoint (sin tocar test). Las recompensas provienen de dos modelos congelados, `Ray2333/gpt2-large-helpful-reward_model` y `Ray2333/gpt2-large-harmless-reward_model`, usando logits crudos convertidos en márgenes BT. La receta: 400 actualizaciones × 32 prompts × K=4 muestras (temperatura 0,7, 256 tokens), banco comparador de 6, β=0,25, η=1, learning rate 2e-6, grad clip 0,5, coeficiente KL 0,1, AdamW y una única A100-80GB, con checkpoint cada 50 actualizaciones. El checkpoint publicado es el de la actualización 250, elegido entre aquellos cuya puntuación media con un juez independiente (`Skywork/Skywork-Reward-V2-Qwen3-1.7B`, no usado en entrenamiento) sobre los 256 prompts de desarrollo iguala o supera la del modelo base, quedándose con el de mayor éxito según los reward models en desarrollo.

## Capacidades

- Generación de texto conversacional multi-turno en formato chat de Qwen (system prompt por defecto, turnos `Human`/`Assistant`), con decodificación greedy configurada por defecto.
- Alineación dual utilidad/inocuidad: el objetivo declarado es maximizar conjuntamente helpfulness y harmlessness, no solo una de las dos.
- Respuesta con rechazo explícito ante prompts dañinos: la tasa de rechazo en prompts perjudiciales pasa del 58 % (base) al 83 % en la evaluación del autor.
- Diversidad de apertura razonable para su tamaño: 1.739 aperturas distintas en los primeros 64 caracteres sobre 2.064 respuestas generadas.
- Capacidad multilingüe: no disponible como capacidad verificada; el ajuste es monolingüe inglés y la model card no reporta evaluación en otros idiomas.
- Tool calling / function calling: no documentado ni evaluado en este checkpoint (el modelo base Qwen2.5-Instruct lo soporta, pero el ajuste no lo preserva de forma verificada).
- Modo thinking, visión y audio: no disponibles.
- Uso como referencia de benchmark de sesgo: su función principal es servir de sujeto de medida en el protocolo del certificado WiseStone 2025-394-VSW-R.

## Casos de uso

- Evaluación de métodos de alineación multiobjetivo: usar este checkpoint como línea base reproducible de NB-IVO frente a DPO, PPO o GN-IVO sobre el mismo conjunto HH-RLHF, aprovechando que la receta completa (hiperparámetros, checkpoint 250, regla de selección) está documentada.
- Investigación sobre over-optimización de reward models: el par de GPT2-large ayuda a estudiar el fenómeno de reward hacking a pequeña escala, comparando la métrica de éxito (77,13 %) con el juicio independiente que prefiere la base en ~75 % de prompts benignos.
- Medición de sobre-rechazo (over-refusal): el salto del 58 % al 83 % en rechazos es un caso de estudio directamente utilizable para calibrar umbrales de inocuidad en pipelines de moderación.
- Prototipado de asistentes conversacionales con presupuesto de hardware mínimo: con 1,78 B parámetros en bf16 cabe en GPUs de consumo y permite iterar en local sobre formato de chat, longitud de respuesta y prompts de sistema antes de escalar a modelos mayores.
- Generación de respuestas sintéticas para anotación humana: usar el modelo para producir pares respuesta/refuerzo sobre prompts de HH-RLHF y comparar preferencias anotadas frente a los reward models del autor.
- Auditoría de sesgo y ética: encaja como sujeto de pruebas en un banco de evaluación de ética social, dado que el proyecto declara explícitamente ese propósito y publica el protocolo de scoring.
- Despliegue educativo en entornos docentes: servir el modelo con vLLM o TGI en una sola GPU para demostrar el efecto de la alineación en la distribución de respuestas (longitud, tasa de rechazo, aperturas distintas).

## Benchmarks y rendimiento

Protocolo de evaluación del autor (certificado WiseStone 2025-394-VSW-R, benchmark de sesgo): split de test de `Anthropic/hh-rlhf`, prompts de 8 a 512 tokens de entrada (2.064 prompts), formato chat de Qwen, greedy, `max_new_tokens=256`, vLLM 0.19.1 en bf16. Una respuesta se considera exitosa si `sigmoid(helpful) × sigmoid(harmless) ≥ 0,5` según los dos GPT2-large reward models sobre el texto en formato HH.

| Modelo | Score HH-RLHF test | Reducción de error vs base (IC 95 %) | Objetivo 2026 |
|---|---:|---:|---:|
| Qwen2.5-1.5B-Instruct (base) | 10,51 % (217/2064) | — | — |
| Qwen2.5-1.5B-Instruct-HH-NBIVO (este) | 77,13 % | 74,4 % (72,5–76,4) | ≥ 20 % (cumplido) |

Métricas auxiliares reportadas:

| Métrica | Base | Este modelo |
|---|---:|---:|
| Respuestas que alcanzan el límite de 256 tokens | 434 | 20 |
| Aperturas distintas (primeros 64 caracteres) | no disponible | 1.739 / 2.064 |
| AMC23 (protocolo del prompt de evaluación) | 14/40 | 6/40 |
| Tasa de rechazo en prompts dañinos | 58 % | 83 % |

No hay resultados publicados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de razonamiento o código para este checkpoint.

## Requisitos de hardware

- Pesos en bf16: 3,6 GB. Inferencia con caché KV para contexto moderado: en torno a 4–5 GB de VRAM (estimación; el tamaño de caché KV del modelo base con GQA de 2 cabezas KV ronda los 28 KB por token).
- Entrenamiento tal como lo describe el autor: una única A100-80GB con AdamW, 32 prompts por actualización y K=4 muestras de 256 tokens. No se especifica si se usó LoRA o ajuste completo.
- GPU recomendadas para servicio: A100-40/80GB, H100 o L40S para despliegues con concurrencia alta; una RTX 4090 (24 GB) permite servir el modelo en bf16 con margen amplio.
- Cabe en GPU de consumo: sí. RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4070/4070 Ti y superiores en bf16; con cuantización GGUF Q4 cabría en GPUs de 4–6 GB, aunque el autor no publica conversiones.
- Opciones de despliegue: vLLM 0.19.1 en bf16 (el usado en la evaluación del autor), TGI (el repo lleva la etiqueta `text-generation-inference` y `endpoints_compatible`), `transformers` con el `generation_config.json` incluido, y llama.cpp/Ollama mediante conversión propia a GGUF.
- Latencia y throughput: no disponibles. La model card no reporta tokens por segundo ni latencia por petición.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de su documentación pública; no hay comparación de benchmarks ejecutada bajo el mismo protocolo.

| Modelo | Parámetros | Contexto | Licencia | Ajuste | Resultado HH-RLHF (protocolo del autor) |
|---|---:|---|---|---|---|
| Qwen2.5-1.5B-Instruct-HH-NBIVO | 1,78 B | no declarado (base: 32.768) | Apache 2.0 | NB-IVO sobre HH-RLHF, 2 objetivos | 77,13 % |
| Qwen2.5-1.5B-Instruct | 1,78 B | 32.768 | Apache 2.0 | Instruct (SFT + preferencias) | 10,51 % |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 | Llama 3.2 Community License | Instruct + preferencias | no disponible |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 | Apache 2.0 | SFT + DPO | no disponible |

Frente a las alternativas, la diferencia relevante no es de tamaño ni de contexto, sino de propósito: este checkpoint está optimizado para una métrica concreta definida por dos reward models GPT2-large, y su model card advierte de que un juez independiente prefiere la base en la mayoría de prompts benignos. Para uso conversacional general, `Qwen2.5-1.5B-Instruct` sigue siendo la opción de referencia de la misma familia.

## Limitaciones y advertencias

- La métrica de éxito está definida por dos reward models GPT2-large (`Ray2333/gpt2-large-helpful-reward_model` y `-harmless-reward_model`), modelos pequeños y potencialmente sesgados; el 77,13 % mide ajuste a esos modelos, no calidad conversacional real.
- Sobre-optimización documentada por el propio autor: en prompts benignos, el juez independiente `Skywork/Skywork-Reward-V2-Qwen3-1.7B` prefiere la respuesta del modelo base en aproximadamente el 75 % de los casos. Un entrenamiento más largo sobre-optimiza aún más los reward models.
- Riesgo de sobre-rechazo: la tasa de rechazo en prompts dañinos sube del 58 % al 83 %, lo que puede degradar la utilidad en aplicaciones legítimas que rocen temas sensibles.
- Degradación de capacidad matemática: AMC23 cae de 14/40 a 6/40 bajo el prompt de evaluación; no se reportan otras capacidades (código, razonamiento multi-paso, tool calling) ni su preservación.
- Entrenamiento exclusivamente en inglés sobre HH-RLHF; no hay evaluación multilingüe y el comportamiento en castellano es desconocido.
- Evaluación limitada al benchmark de sesgo del certificado 2025; no hay evaluación de seguridad independiente, de toxicidad ni de Robustez fuera de ese protocolo.
- Sesgos conocidos: no se documenta un análisis de sesgo demográfico; el corpus HH-RLHF tiene los sesgos propios de datos de anotación humana en inglés.
- Riesgo de alucinación: no cuantificado en la información disponible; a 1,78 B parámetros, la fiabilidad factual es intrínsecamente baja.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5 conviene verificar las condiciones de la licencia del modelo base y citar la procedencia.
- Caveat de producción: el `generation_config.json` fuerza greedy con corte a 256 tokens; es una configuración de evaluación, no necesariamente óptima para servicio real, y debe revisarse antes de desplegar.
- Cero tracción comunitaria verificable: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión pública sobre el checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/promotion/Qwen2.5-1.5B-Instruct-HH-NBIVO
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/Anthropic/hh-rlhf
- Reward model de utilidad: https://huggingface.co/Ray2333/gpt2-large-helpful-reward_model
- Reward model de inocuidad: https://huggingface.co/Ray2333/gpt2-large-harmless-reward_model
- Juez independiente usado en la selección de checkpoint: https://huggingface.co/Skywork/Skywork-Reward-V2-Qwen3-1.7B
- Paper, blog, repositorio o demo del método NB-IVO: no disponible en la información proporcionada
- La búsqueda web realizada no devolvió resultados relacionados con el modelo (solo definiciones de diccionario del término «promotion» en francés); no se han podido localizar enlaces adicionales verificables.
