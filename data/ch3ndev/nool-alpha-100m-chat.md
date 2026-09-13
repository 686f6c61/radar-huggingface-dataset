# CH3NDev/Nool-Alpha-100M-Chat

## Resumen

Nool-Alpha-100M-Chat es un modelo de lenguaje causal bilingüe (indonesio e inglés) con soporte adicional de código Python, desarrollado por el usuario CH3NDev y publicado en HuggingFace bajo licencia MIT. El modelo se apoya en una arquitectura propia denominada `nool_alpha`, que combina tres innovaciones declaradas por el autor: GSLA (Grouped-Subspace Latent Attention), que según la model card comprime la caché KV un 87,8 % frente a una atención densa MHA estándar; HFK-MoE (Heterogeneous Factorized MoE), formada por un ancla densa SwiGLU compartida más ocho expertos factorizados de bajo rango (r=96, enrutamiento top-2) con un ahorro declarado del 21,3 % en FLOPs; y una "Global Residual Highway" que estabiliza las rutas residuales profundas.

El recuento real de parámetros en los pesos safetensors es de 149.772.288, con aproximadamente 97,9 M de parámetros activos por token según la model card. Usa un vocabulario de 50.257 tokens (BPE de GPT-2), una longitud de contexto de 2.048 tokens y una configuración interna de 768 dimensiones de modelo, 10 capas y 12 cabezas de atención. El checkpoint publicado corresponde al paso de entrenamiento 900, con una pérdida registrada de 2,633549153804779, lo que indica un modelo en fase temprana de entrenamiento y no un modelo final convergido.

Su relevancia es fundamentalmente experimental: se trata de un banco de pruebas de técnicas de eficiencia (compresión de caché KV, MoE factorizado de bajo rango) aplicadas a un modelo por debajo de 150 M de parámetros, un rango en el que encajan despliegues en CPU, dispositivos móviles y entornos con VRAM muy limitada. A pesar del sufijo "Chat" del nombre, no hay evidencia en la información disponible de un ajuste por instrucciones, RLHF o DPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nool_alpha` (transformer causal híbrido: GSLA + HFK-MoE + Global Residual Highway) |
| Parametros totales | 149.772.288 según pesos safetensors (la model card indica "~149.8M (~111M)", cifra ambigua) |
| Parametros activos | ~97,9 M por token (modelo MoE con enrutamiento top-2 sobre 8 expertos) |
| Longitud de contexto | 2.048 tokens (`max_position_embeddings`), con `sliding_window` de 512 y `swa_interval` 4 |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos safetensors sin cuantizar; no hay GGUF, AWQ ni GPTQ oficiales |
| Idiomas soportados | Indonesio (id) e inglés (en); la model card añade código Python |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` y ficheros de tokenizer (`vocab.json`, `merges.txt`, `tokenizer.json`) |
| Dimension del modelo (d_model) | 768 |
| Numero de capas | 10 |
| Cabezas de atencion | 12 (head_dim 64) |
| Vocabulario | 50.257 tokens (BPE de GPT-2) |
| Dimension latente de atencion (d_c) | 192 |
| Dimension posicional (d_pe) | 32, con `rope_theta` 500000.0 |
| FFN compartida | 1.536 |
| Expertos | 8, top-2, rango de experto 96, `moe_aux_loss_coeff` 0.01 |
| Soft-capping de logits | 30.0 |
| Paso de entrenamiento publicado | 900 (perdida registrada 2,633549153804779) |
| Tamano del repositorio | 0,6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura `nool_alpha` es un transformer causal de tipo decodificador con dos modificaciones estructurales principales. La primera, GSLA (Grouped-Subspace Latent Attention), proyecta las claves y valores a un subespacio latente de dimensión `d_c` = 192, lo que según el autor reduce el tamaño de la caché KV un 87,8 % respecto a MHA densa; esto ataca directamente el cuello de botella de memoria en inferencia con lotes grandes o contextos largos. La segunda, HFK-MoE, sustituye la FFN densa por un ancla SwiGLU compartida de dimensión 1.536 combinada con ocho expertos factorizados de rango 96 y enrutamiento top-2, de modo que solo se activan dos expertos por token; el autor cifra el ahorro en un 21,3 % de FLOPs. Además, la "Global Residual Highway" inyecta la representación inicial mediante `tanh(alpha) * RMSNorm(x_0)` con `highway_alpha_init` = 0.05 para estabilizar el flujo residual en profundidad, y se aplica un soft-capping de logits con umbral tanh de 30.0 para evitar divergencias en los logits.

En cuanto a los datos de entrenamiento, la información disponible es muy limitada: la model card no especifica el número de tokens, la composición del dataset, la proporción entre indonesio, inglés y código, ni si hubo fases de ajuste supervisado, RLHF o DPO. El único dato objetivo de entrenamiento es `checkpoint_step` = 900 con una pérdida de 2,6335, lo que sugiere un entrenamiento corto y probablemente no completado. La atención alterna ventana deslizante de 512 tokens cada 4 capas (`swa_interval` 4), un patrón habitual para reducir coste en contextos medios. No se declara uso de decodificación especulativa, atención lineal ni otras técnicas adicionales.

## Capacidades

- Generacion de texto causal bilingüe en indonesio e inglés, con pipeline declarado `text-generation`.
- Generacion de codigo Python según la propia model card, aunque no se especifica el volumen de datos de código utilizado ni hay benchmarks que lo respalden.
- Modelado de lenguaje autorregresivo estándar: continuación de texto, respuesta a prompts y generación libre.
- No hay evidencia de soporte de tool calling ni function calling; no se menciona en la model card ni existen plantillas de chat publicadas.
- No hay evidencia de capacidades de agente, razonamiento multi-paso o modo "thinking".
- No se declaran capacidades multimodales (visión, audio) ni de otro tipo.
- El sufijo "Chat" del nombre no va acompañado de una plantilla de chat, tokens especiales de rol ni datos de ajuste conversacional en la información disponible.

## Casos de uso

- Experimentacion con arquitecturas eficientes: el modelo sirve como banco de pruebas reproducible para medir el impacto real de GSLA (compresión de caché KV) y HFK-MoE (expertos factorizados de bajo rango) frente a un transformer denso de tamaño similar.
- Investigacion academica sobre MoE de bajo rango: al tener 8 expertos con top-2 y un ancla compartida, permite estudiar patrones de enrutamiento, colapso de expertos y balanceo con `moe_aux_loss_coeff` 0.01 en un modelo que cabe en una sola GPU.
- Fine-tuning ligero en indonesio: con 149,8 M de parámetros y licencia MIT, es viable ajustarlo con LoRA en una única GPU de consumo para tareas de clasificación, resumen o generación en indonesio, un idioma con menos recursos que el inglés.
- Prototipado en edge o CPU: el tamaño de pesos en FP32 es de aproximadamente 0,6 GB, por lo que puede ejecutarse en portátiles sin GPU dedicada, en contenedores pequeños o en dispositivos con memoria restringida.
- Generacion de texto de bajo coste en produccion interna: para tareas no críticas (autocompletado, borradores, etiquetado preliminar) donde el coste por token importa más que la calidad máxima.
- Educacion y divulgacion: implementación de referencia para explicar atención con caché comprimida y MoE en cursos o tutoriales, dado que el código está publicado en GitHub.
- Aumento de datos sinteticos en indonesio: puede generar corpus sintéticos a bajo coste, siempre que se valide la calidad porque la pérdida de entrenamiento es alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de entrenamiento en el paso 900 (2,633549153804779), que no es comparable con métricas estandarizadas como MMLU, HumanEval o GSM8K y que, por su magnitud, indica un modelo lejos de la convergencia. Tampoco se ofrecen mediciones de latencia, throughput ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV ni activaciones): ~0,6 GB en FP32, ~0,3 GB en FP16/BF16, ~0,15 GB en int8 y ~0,08 GB en int4.
- Con caché KV, activaciones y overhead del runtime, es razonable prever entre 1 y 2 GB en FP16 para lotes pequeños y contexto completo de 2.048 tokens; la compresión GSLA declarada (87,8 % frente a MHA densa) reduce esta parte, pero no hay mediciones publicadas que lo confirmen.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores. No requiere A100, H100 ni GPUs de centro de datos.
- Cabe holgadamente en GPU de consumo e incluso puede ejecutarse en CPU con cuantización a int8, dado el reducido número de parámetros.
- Opciones de despliegue: no disponible de forma directa. Al tratarse de una arquitectura personalizada (`model_type: nool_alpha`), no hay soporte nativo en vLLM, TGI, llama.cpp u Ollama, y no se publican pesos GGUF. La única vía documentada es cargar los pesos con `safetensors` y reconstruir el modelo con el código del repositorio GitHub del autor (`nool_alpha.config` / `nool_alpha.model`), que no forma parte de los ficheros del repositorio de HuggingFace.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicos |
|---|---|---|---|---|---|
| Nool-Alpha-100M-Chat | 149,8 M totales / ~97,9 M activos | 2.048 | MIT | Solo safetensors + codigo externo en GitHub | No disponibles |
| GPT-2 (124M) | 124 M densos | 1.024 | MIT | safetensors, transformers nativo, multiples cuantizaciones | Si, ampliamente documentados |
| SmolLM-135M | 135 M densos | 2.048 | Apache-2.0 | transformers nativo, GGUF, amplio ecosistema | Si, publicados por el autor |
| Qwen2.5-0.5B | ~494 M densos | 32.768 | Apache-2.0 | transformers, vLLM, llama.cpp, Ollama | Si, publicados por el autor |

Nota: los datos de los modelos alternativos corresponden a informacion publica estandar de sus respectivas model cards y deben verificarse en la fuente original antes de citarlos. La comparacion con Nool-Alpha-100M-Chat es estructural, no de rendimiento, porque este ultimo no publica ninguna metrica de evaluacion. En la practica, la ventaja diferencial del modelo es la licencia MIT combinada con un diseno MoE de bajo rango, no un rendimiento demostrado.

## Limitaciones y advertencias

- Modelo en fase temprana de entrenamiento: el checkpoint corresponde al paso 900 con pérdida 2,6335, muy por encima de lo que se considera convergencia. La calidad de generación esperable es baja y no apta para producción sin un ajuste adicional.
- No hay benchmarks: cualquier afirmación sobre su rendimiento relativo es especulativa.
- El nombre incluye "Chat" pero no hay evidencia de ajuste por instrucciones, plantilla de chat ni tokens especiales de rol. Usarlo como asistente conversacional produciría resultados pobres.
- Riesgo alto de alucinación y de texto incoherente, coherente con el estado temprano del entrenamiento.
- Sesgos no evaluados: no se documenta la composición del dataset ni se han realizado evaluaciones de sesgo, toxicidad o seguridad.
- Cobertura limitada de idiomas: solo indonesio e inglés de forma declarada; el castellano no está soportado oficialmente y su comportamiento en otros idiomas es impredecible.
- Contexto corto: 2.048 tokens es insuficiente para tareas de documento largo, RAG con muchos fragmentos o conversaciones extensas.
- Complejidad de integración: al ser una arquitectura personalizada sin soporte en `transformers` nativo, requiere el código del autor desde GitHub. El `README` importa `nool_alpha.config` y `nool_alpha.model`, módulos que no se listan entre los ficheros del repositorio de HuggingFace; sin ellos, `AutoModel` no puede cargar el modelo.
- Sin cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ, lo que complica el despliegue en llama.cpp, Ollama o vLLM sin trabajo de conversión manual.
- Licencia MIT: permite uso comercial, modificación y redistribución sin restricciones relevantes, siempre que se conserve el aviso de copyright. Es el punto más favorable del modelo.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre el modelo (solo resultados sobre utilidades de formateo FAT32), por lo que no hay fuentes independientes que corroboren las cifras del autor.

## Enlaces

- HuggingFace: https://huggingface.co/CH3NDev/Nool-Alpha-100M-Chat
- Repositorio GitHub oficial citado en la model card: https://github.com/Ch3nOff/Nool-Alpha
- Paper, blog o demo adicionales: no disponible
