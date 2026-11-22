# 2Beyes/Aurum_4b

## Resumen

Aurum 4B Uncensored es una variante del modelo Qwen3.5-4B de Alibaba Qwen a la que se le ha eliminado el comportamiento de rechazo mediante una edición quirúrgica de pesos, sin reentrenamiento adicional. El autor, 2Beyes, parte de los pesos originales de Qwen3.5-4B (incluida su torre de visión y su cabeza de predicción multi-token) y aplica únicamente la diferencia de pesos necesaria para anular los rechazos, calculada a partir de un modelo "abliterated" de referencia. El resultado conserva el conocimiento y las capacidades del modelo base, pero responde a prácticamente cualquier petición sin negarse.

El modelo está pensado para chat cotidiano y tool calling en tarjetas gráficas de 8 GB, y se distribuye principalmente en formato GGUF con cuantizaciones desde Q3_K_M hasta BF16, además de un proyector de visión independiente. Cuenta con 4.326.350.848 parámetros totales, licencia Apache 2.0 y soporte declarado únicamente para inglés. Su relevancia actual reside en que combina un tamaño reducido (desplegable en hardware de consumo), capacidades multimodales heredadas de Qwen3.5, soporte de tool calling vía plantilla Jinja y decodificación especulativa mediante su propia cabeza MTP.

La model card reporta mejoras sustanciales frente al modelo que reemplaza en instrucciones (IFEval) y en tool calling (BFCL v3), manteniendo MMLU-Redux prácticamente idéntico y mejorando GPQA Diamond. El precio de estas mejoras es un aumento de los falsos positivos en tool calling (irrelevancia BFCL de 80,8 frente a 93,8 del modelo anterior) y la eliminación total de los rechazos, lo que traslada al desplegador toda la responsabilidad sobre el uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen3.5-4B, con torre de visión y cabeza de predicción multi-token (MTP); atención híbrida (atención estándar y atención lineal en distintas capas) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no es un modelo MoE según la información proporcionada) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `-c 16384` |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (recomendada), Q4_K_S, IQ4_XS, Q4_0, Q3_K_M; proyector de visión en F16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp b12289); safetensors BF16 disponibles en el repo hermano `2Beyes/Aurum-4B-Uncensored` |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: es Qwen3.5-4B con una edición de pesos dirigida. El autor toma la diferencia de pesos entre Qwen3.5-4B y el modelo `insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated` y conserva únicamente la componente que elimina los rechazos. Concretamente, en las capas 4 a 31 aplica las 8 direcciones singulares principales del cambio sobre los pesos de salida de atención (`self_attn.o_proj` y `linear_attn.out_proj`), que representan aproximadamente el 98 % de la modificación. En los pesos de salida de la FFN (`mlp.down_proj`) aplica solo la dirección principal, y únicamente en aquellos tensores donde esa dirección concentra más de la mitad del cambio. El resto de modificaciones del modelo de referencia (su ajuste por destilación) no se incluye.

La configuración, el tokenizador y la plantilla de chat provienen del modelo Heretic citado, que comparte tokenizador con Qwen3.5. La torre de visión es la original de Qwen3.5-4B (GGUF generado por Unsloth) y no se modifica. La conversión a GGUF se realizó con llama.cpp b12289, y todas las cuantizaciones usan una importance matrix calculada sobre una mezcla Aurum hermana con texto de calibración compuesto por prosa, código y conversaciones con tool calls. Durante el desarrollo, esta variante (denominada `c-v1u`) superó a otras dos candidatas en pruebas cerradas: misma precisión en tool calling, más conocimiento y ausencia de rechazos. El modelo conserva la cabeza MTP del base, que permite decodificación especulativa con el propio modelo como drafter.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento con modo "thinking" activable mediante `enable_thinking` en la plantilla de chat, igual que en Qwen3.5.
- Tool calling / function calling, habilitado con `--jinja` en llama.cpp; evaluado con BFCL v3 en las categorías simple, multiple, parallel, parallel-multiple e irrelevance.
- Capacidades multimodales de entrada imagen-texto mediante el proyector de visión `mmproj-Aurum-4B-F16.gguf`.
- Decodificación especulativa nativa mediante la cabeza MTP (2 tokens de borrador recomendados), con una mejora reportada de aproximadamente 1,4x en código.
- Respuesta sin rechazos: 0 rechazos sobre 100 prompts dañinos de `mlabonne/harmful_behaviors` y 0 % de sobrerrechazo sobre 30 prompts inofensivos con 3 muestras cada uno.
- Soporte de agentes y razonamiento multi-paso limitado por el tamaño del modelo; el tool calling paralelo está soportado pero con menor precisión (82,0 en parallel y parallel-multiple frente a 92,0/92,5 en simple y multiple).

## Casos de uso

- Asistente conversacional local en GPU de consumo: con la cuantización Q4_K_M (2,8 GB) y el proyector de visión F16 (0,7 GB) cabe holgadamente en 8 GB de VRAM, lo que permite desplegar un chat multimodal privado en una RX 6600 o una RTX 3060 sin conexión a servicios externos.
- Automatización de tool calling en pipelines internos: el modelo alcanza 85,9 de media en BFCL v3 non-live, por lo que es adecuado para enrutar peticiones a APIs concretas (consultas de bases de datos, operaciones de ficheros, llamadas HTTP) en entornos controlados donde el catálogo de herramientas es cerrado y bien definido.
- Generación de código asistida en editor: con la decodificación especulativa MTP activada y Q4_K_M se obtienen velocidades de 79 tokens/s en código sobre una RX 6600, suficiente para autocompletado interactivo y generación de fragmentos en un IDE local.
- Procesamiento de documentos con imágenes: al conservar la torre de visión de Qwen3.5, puede extraer texto y describir capturas, diagramas o formularios, integrándose en flujos de digitalización que requieran confidencialidad y no puedan enviar imágenes a la nube.
- Moderación y análisis de contenido sensible sin restricciones de rechazo: útil en investigación de seguridad, red teaming y auditoría de contenido donde se necesita que el modelo procese y describa material que un modelo alineado rechazaría; requiere aislamiento estricto y registro de uso.
- Prototipado rápido de agentes multi-paso: la ventana de 16.384 tokens usada en el ejemplo de despliegue y el soporte de plantilla Jinja permiten construir agentes con historial de conversación y varias llamadas a herramientas encadenadas en una sola sesión.
- Fine-tuning y merging como base: el repo hermano en safetensors BF16 permite partir de Aurum para ajustes posteriores o fusiones, manteniendo las capacidades multimodales y la cabeza MTP del modelo original.

## Benchmarks y rendimiento

Resultados reportados por el autor, ambos modelos en Q4_K_M con llama.cpp, thinking desactivado, decodificación greedy y sin system prompt, evaluados con su propio runner. El modelo anterior de referencia es `Qwen3.8-4B-Distill-Heretic-Abliterated` (Q4_K_M).

| Benchmark | Modelo anterior | Aurum 4B |
|---|---|---|
| IFEval, prompt strict / loose (541) | 72,8 / 75,8 | 78,6 / 81,5 |
| IFEval, instruction strict / loose | 81,3 / 83,8 | 85,3 / 87,5 |
| BFCL v3 non-live, media (1.240) | 68,7 | 85,9 |
| BFCL simple / multiple / parallel / parallel-multiple | 65,2 / 74,5 / 48,0 / 62,0 | 92,0 / 92,5 / 82,0 / 82,0 |
| BFCL irrelevance (sin herramienta adecuada) | 93,8 | 80,8 |
| MMLU-Redux 2.0 (5.330 preguntas) | 75,0 | 74,9 |
| GPQA Diamond (198, orden de respuestas aleatorizado con semilla fija) | 42,9 | 49,5 |

| Test de rechazos | Modelo anterior | Qwen3.5-4B oficial | Mezcla Aurum previa | Aurum 4B |
|---|---|---|---|---|
| Rechazos sobre 100 prompts dañinos | 0 | 72 | 20 | 0 |
| Sobrerrechazo (30 prompts inofensivos x 3 muestras) | 1,1 % | no disponible | 0 % | 0 % |

Notas del autor: los números publicados por Qwen corresponden a BF16 con thinking largo y BFCL v4, por lo que no son directamente comparables. GPQA usa un límite de 3.072 tokens de respuesta; 84 de las 198 respuestas de Aurum alcanzaron el límite y se contaron como incorrectas (6 en el modelo anterior), por lo que su puntuación con un límite mayor sería probablemente superior. BFCL se puntúa con el checker AST de `bfcl-eval` sobre generaciones propias. Los rechazos se cuentan con frases marcadoras, por lo que es una estimación y no una revisión manual.

| Fichero | Tamano | KL vs BF16 | Mismo token top | Velocidad prosa / codigo (tok/s) |
|---|---|---|---|---|
| Aurum-4B-BF16.gguf | 8,7 GB | 0 | 100 % | no medido |
| Aurum-4B-Q8_0.gguf | 4,6 GB | 0,0028 | 98,6 % | 47 / 64 |
| Aurum-4B-Q6_K.gguf | 3,6 GB | 0,0067 | 97,2 % | 48 / 67 |
| Aurum-4B-Q5_K_M.gguf | 3,2 GB | 0,0111 | 96,2 % | 57 / 76 |
| Aurum-4B-Q4_K_M.gguf (recomendada) | 2,8 GB | 0,0277 | 93,7 % | 57 / 79 |
| Aurum-4B-Q4_K_S.gguf | 2,6 GB | 0,0304 | 93,2 % | 59 / 75 |
| Aurum-4B-IQ4_XS.gguf | 2,6 GB | 0,0360 | 92,5 % | 56 / 76 |
| Aurum-4B-Q4_0.gguf | 2,6 GB | 0,0544 | 90,9 % | 58 / 81 |
| Aurum-4B-Q3_K_M.gguf | 2,3 GB | 0,0906 | 87,9 % | 59 / 80 |
| mmproj-Aurum-4B-F16.gguf | 0,7 GB | no aplica | no aplica | proyector de visión |

Las velocidades se midieron en una RX 6600 de 8 GB con backend Vulkan, llama.cpp b12289 y MTP con 2 tokens de borrador.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2,3 GB (Q3_K_M) y 8,7 GB (BF16) para los pesos, más 0,7 GB del proyector de visión si se usa entrada de imagen. La opción recomendada Q4_K_M ocupa 2,8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q4_K_M con visión; el autor valida explícitamente una RX 6600 de 8 GB con Vulkan. Para BF16 se necesitan al menos 12 GB. No se proporcionan datos para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RX 6600 8 GB y similares con la cuantización Q4_K_M. Las cuantizaciones Q3_K_M y Q4_K_S permiten incluso GPUs de 6 GB si se prescinde de visión.
- Opciones de despliegue: llama.cpp (formato nativo, versión b12289 o superior) con `llama-server` y flags `--jinja -c 16384 -ngl 999 --spec-type draft-mtp --spec-draft-n-max 2`; Ollama y otros frontends basados en llama.cpp pueden cargar los GGUF, aunque la decodificación especulativa MTP requiere el soporte específico de llama.cpp. Para transformers y vLLM se debe usar el repo hermano en safetensors BF16.
- Latencia y throughput: 57 tokens/s en prosa y 79 tokens/s en código con Q4_K_M en RX 6600; la decodificación especulativa MTP aporta aproximadamente 1,4x de mejora en código. Borradores de más de 2 tokens resultaron más lentos en esa tarjeta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BFCL v3 (Q4, sin thinking) | MMLU-Redux | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Aurum 4B Uncensored | 4,33 B | no disponible (ejemplo con 16.384) | 85,9 | 74,9 | Apache 2.0 | GGUF en HF, safetensors en repo hermano |
| Qwen3.5-4B (oficial) | 4,33 B | no disponible | no disponible en esta ficha (Qwen publica BFCL v4 en BF16 con thinking) | no disponible en esta ficha | Apache 2.0 | HF oficial |
| Qwen3.8-4B-Distill-Heretic-Abliterated | no disponible | no disponible | 68,7 | 75,0 | no disponible | GGUF en HF |
| insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated | no disponible | no disponible | no disponible | no disponible | no disponible | HF |

La comparación directa con Qwen3.5-4B oficial no es posible con los datos de esta ficha, ya que el autor advierte que sus cifras no son comparables a las publicadas por Qwen (BF16, thinking largo, BFCL v4). Frente al modelo abliterated que reemplaza, Aurum mejora en instrucciones y tool calling, mantiene MMLU y sube en GPQA, a costa de peor detección de irrelevancia en tool calling.

## Limitaciones y advertencias

- El modelo no rechaza peticiones dañinas (0 de 100 en la prueba del autor). No debe desplegarse en entornos donde usuarios que no hayan elegido un modelo sin censura puedan acceder a él, tal como advierte el propio autor.
- Es un modelo de 4B: comete errores factuales y puede invocar herramientas cuando ninguna encaja (BFCL irrelevance 80,8 frente a 93,8 del modelo anterior). Los resultados de las herramientas deben verificarse antes de confiar en ellos.
- Riesgo de alucinación inherente al tamaño; no se han publicado evaluaciones de veracidad más allá de MMLU-Redux y GPQA.
- Idiomas soportados declarados: solo inglés. No hay evidencia de calidad en castellano ni en otros idiomas, aunque el tokenizador de Qwen3.5 sea multilingüe.
- La longitud de contexto no se especifica en la model card; el ejemplo de despliegue usa 16.384 tokens, pero no se confirma como máximo.
- La puntuación de GPQA está penalizada por el límite de 3.072 tokens de respuesta (84 de 198 respuestas truncadas), por lo que la cifra real podría ser superior; a la inversa, el conteo de rechazos es heurístico por frases marcadoras.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de alineación de seguridad puede incumplir políticas de plataformas, requisitos regulatorios o términos de servicio de terceros.
- El proceso de abliteration puede degradar sutilmente capacidades no medidas; el autor solo reporta pruebas en instrucciones, tool calling, MMLU y GPQA.
- La decodificación especulativa MTP requiere flags específicos de llama.cpp; otros runtimes no aprovecharán esa aceleración.

## Enlaces

- Modelo en Hugging Face (GGUF): https://huggingface.co/2Beyes/Aurum_4b
- Repo hermano en safetensors BF16: https://huggingface.co/2Beyes/Aurum-4B-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo de referencia para la edición de rechazos: https://huggingface.co/insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated
- Modelo anterior comparado en benchmarks: https://huggingface.co/yachen4ever/Qwen3.8-4B-Distill-Heretic-Abliterated-GGUF
- Dataset de evaluación de rechazos: mlabonne/harmful_behaviors (referenciado en la model card, sin URL directa en la información proporcionada)
- llama.cpp: no se proporciona URL en la información disponible
- Paper, blog o demo adicionales: no disponible
