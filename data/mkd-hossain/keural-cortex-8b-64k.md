# mkd-hossain/Keural-Cortex-8B-64K

## Resumen

Keural Cortex 8B — 64K es un modelo base de lenguaje desarrollado por MKD Co., Ltd. mediante *continued pretraining* (CPT) sobre Qwen/Qwen3-8B-Base. El objetivo declarado del proyecto no es mejorar el conocimiento del modelo, sino ampliar su ventana de contexto de los 32.768 tokens originales a 65.536 tokens nativos aplicando escalado RoPE con YaRN (factor 2.0). El resultado es la fase 5 de un pipeline de entrenamiento que acumula 41.000 millones de tokens de CPT más 2.500 millones de tokens de extensión de contexto, con un claro sesgo hacia el coreano (42,45 % en la fase 4 y 58,1 % en la fase 5).

Es importante entender que se trata de un modelo **base**, no de un modelo instruido: no tiene formato de chat, ni seguimiento de instrucciones, ni *tool calling*, ni modo de razonamiento. La plantilla de chat incluida se hereda del tokenizador original y no implica que el modelo esté ajustado por instrucciones. El propio autor advierte que cualquier comportamiento conversacional observado es imitación de texto de asistente absorbido durante el preentrenamiento del modelo base de Qwen, no una capacidad entrenada.

La relevancia de esta ficha está en su honestidad metodológica: el autor publica evidencia verificable de recuperación exacta en 65.536 tokens (12/12 en *needle-in-a-haystack*) pero también reconoce explícitamente que el conocimiento en coreano no mejoró (KMMLU pasó de 53,91 a 53,57) y que no se ha ejecutado descontaminación de benchmarks. Con 0 descargas y 0 *likes* en el momento de la consulta, es un modelo de nicho, útil sobre todo como punto de partida reproducible para experimentos de contexto largo en coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen3) con RoPE y escalado YaRN factor 2.0 |
| Parametros totales | 8,19 B segun la model card; 2.047.683.840 (aprox. 2,05 B) segun los metadatos de safetensors. Discrepancia no resuelta: el tamano del repo (16,4 GB) es coherente con 8,19 B en bfloat16 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 65.536 tokens nativos (base: 32.768) |
| Tipos de cuantizacion | GGUF mediante conversion con llama.cpp (el autor uso Q8_0 en su evaluacion). Otros tipos: no disponible |
| Idiomas soportados | Coreano (ko) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en bfloat16; convertible a GGUF |
| Modelo base | Qwen/Qwen3-8B-Base |
| Tokens de CPT | 41,0 B (fase 4) + 2,50 B (fase 5, extension de contexto) |
| Precision | bfloat16 |
| Fecha de finalizacion | 2026-09-12 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-8B-Base sin modificaciones estructurales: un transformer decoder-only al que se le ha aplicado un *continued pretraining* de parámetros completos. La fase 4 consumió 38,784 B tokens procedentes de 19 fuentes (42,45 % coreano), con secuencia de 4.096 tokens, batch global de 3.145.728 tokens por paso, pico de LR 1.0e-05 con schedule WSD, optimizador AdamW (β 0.9/0.95, weight decay 0.1) y recorte de gradiente de 1.0 que nunca se activó (norma máxima observada: 0.48). Se ejecutó con FSDP sobre 4× H200 durante 18 días y 10 horas sin reinicios.

La fase 5 partió del checkpoint `step_0010000` de la CPT (no del checkpoint final), elegido por medir mejor en todas las agregaciones coreanas y por encontrarse en fase estable sin decaer. Sobre esos pesos se aplicó escalado RoPE YaRN con factor 2.0 para alcanzar 65.536 posiciones, con secuencia de 65.536 tokens, 795 pasos, LR pico 1.0e-05 (WSD, ratio mínimo 0.1) y un rendimiento de 10,3k tok/s durante aproximadamente 2 días y 23 horas. Los datos de esta fase son 2,501 B tokens de 12 fuentes, con todos los documentos de al menos 32.768 tokens y un 58,1 % de coreano; el 58 % del total proviene de AI Hub (`aihub_modu` 0.899 B, `aihub_books` 0.553 B), es decir, coreano curado y editado en lugar de *web crawl*.

Como detalle de implementación relevante, la pérdida de Hugging Face materializa el tensor de logits completo de `seq_len × vocab` en fp32 (37,09 GiB con `seq_len` de 65.536), lo que provoca OOM incluso con `micro_bsz` en 1. La fase 5 utilizó la *cross-entropy* lineal fusionada de liger-kernel para evitar esa asignación. La curva de pérdida se mantuvo plana en torno a 1,94 durante toda la fase, algo que el autor atribuye a que el modelo aprende comportamiento posicional y no contenido nuevo; la medición significativa es la rejilla de *needle-in-a-haystack*.

## Capacidades

- Generación de texto por continuación (*completion*) en coreano e inglés. No responde a instrucciones.
- Recuperación exacta de información en contextos de hasta 65.536 tokens: 12/12 aciertos en la rejilla de *needle-in-a-haystack* del autor, con profundidades del 10 %, 50 % y 90 %.
- Mayor vocabulario coreano que el modelo base: HaeRae `rare_word` +3,70 y `loan_word` +2,96.
- Procesamiento de documentos largos completos (todos los ejemplos de entrenamiento de la fase 5 superan los 32.768 tokens).
- Soporte de *tool calling* / *function calling*: no. El modelo base no lo tiene y la CPT no lo añade.
- Soporte de agentes y razonamiento multi-paso: no.
- Modo de razonamiento (*thinking mode*): no.
- Capacidades de visión o audio: no.
- Multilingüismo: limitado a coreano e inglés según los metadatos del repositorio.

## Casos de uso

- Punto de partida para SFT/DPO en coreano: al ser un modelo base con contexto de 65.536 tokens, es un sustrato adecuado para aplicar ajuste supervisado o DPO sobre conversaciones largas en coreano sin tener que reconstruir la extensión de contexto.
- Investigación reproducible de contexto largo: el autor publica el script `eval/needle_cpu.py`, que permite repetir la rejilla de recuperación en CPU con llama.cpp (Q8_0) en pocos minutos y comparar el efecto real del escalado YaRN frente a la mera configuración.
- Modelado de lenguaje y evaluación de perplejidad sobre corpus coreanos largos: útil para medir la calidad de un corpus (web crawl frente a datos curados de AI Hub) midiendo la pérdida por token del modelo sobre documentos de más de 32K tokens.
- Generación de datos sintéticos por continuación: se puede completar texto coreano a gran escala para construir corpus de entrenamiento o de evaluación, aprovechando que el modelo no necesita formato de instrucciones.
- Ajuste fino con LoRA para dominios verticales coreanos (legal, sanitario, editorial): el coste de partida es bajo porque el modelo ya maneja documentos largos y vocabulario coreano específico.
- *Benchmarking* de estrategias de escalado posicional: sirve como caso de estudio para comparar YaRN factor 2.0 frente a otras técnicas de extensión de contexto, con una línea base conocida (Qwen3-8B-Base a 32.768 tokens).
- Análisis de documentos extensos por continuación guiada: en flujos donde no se requiere diálogo, se puede alimentar un informe o libro coreano y pedir al modelo que continúe o reformule secciones concretas mediante *prompting* por finalización.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. La descontaminación de benchmarks no se ha ejecutado, por lo que el propio autor los califica de provisionales.

| Prueba | Contexto / configuracion | Resultado |
|---|---|---|
| Needle-in-a-haystack, profundidad 10 % | 4.096 / 16.384 / 32.768 / 65.536 | PASS en los cuatro |
| Needle-in-a-haystack, profundidad 50 % | 4.096 / 16.384 / 32.768 / 65.536 | PASS en los cuatro |
| Needle-in-a-haystack, profundidad 90 % | 4.096 / 16.384 / 32.768 / 65.536 | PASS en los cuatro |
| KMMLU | Base frente a CPT | 53,91 → 53,57 (negativo) |
| KoBEST BoolQ | CPT | +7,19 (unico cambio significativo de 126 filas evaluadas) |
| HaeRae rare_word | CPT | +3,70 |
| HaeRae loan_word | CPT | +2,96 |
| HaeRae general_knowledge | CPT | −1,14 |
| HaeRae history | CPT | −0,53 |

La rejilla de recuperación se midió en CPU con llama.cpp (Q8_0) a través de la API HTTP, no por CLI, porque las herramientas de línea de comandos hacen eco del *prompt* (que contiene la aguja) y puntuarían sobre el eco. El autor indica que la rejilla corresponde al paso 400 de 795 y que el checkpoint publicado es el final (paso 795).

## Requisitos de hardware

- VRAM en bfloat16: los pesos ocupan aproximadamente 16,4 GB (coherente con 8,19 B en bf16). Con caché KV y activaciones, se recomienda un mínimo de 24 GB.
- Caché KV a 65.536 tokens: estimación aproximada de 9 GB en bf16 asumiendo la configuración típica de Qwen3-8B (36 capas, 8 cabezas KV, head_dim 128). Es una cifra calculada, no publicada por el autor.
- Cuantización de 8 bits: en torno a 9 GB de pesos; cabe en RTX 3090 y RTX 4090.
- Cuantización de 4 bits: en torno a 5 GB de pesos; cabe en GPU de consumo con 8-12 GB, siempre que se limite la longitud de contexto.
- GPU recomendadas: H100 o A100 80 GB para bf16 con contexto completo; RTX 4090 (24 GB) para bf16 con contexto reducido o 8 bits; GPU de 8-12 GB solo con cuantización de 4 bits y contexto corto.
- Cabe en GPU de consumo: sí, con las salvedades anteriores. El entrenamiento, en cambio, requirió 4× H200.
- Opciones de despliegue: transformers (referencia del autor), llama.cpp / GGUF (usado en la evaluación), vLLM y TGI (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), Ollama mediante GGUF.
- Conversión a GGUF: `config.json` incluye `rope_scaling.original_max_position_embeddings: 32768`, campo que transformers infiere pero que el conversor de llama.cpp exige explícitamente (falla con `KeyError` si no está).
- Latencia y throughput de inferencia: no disponible. El dato de 10,3k tok/s corresponde al entrenamiento en 4× H200, no a inferencia.
- Nota de memoria en entrenamiento: a 65.536 tokens, la pérdida estándar de Hugging Face requiere 37,09 GiB solo para el tensor de logits en fp32; fue necesario usar la *cross-entropy* fusionada de liger-kernel.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Post-entrenamiento | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Keural Cortex 8B — 64K | 8,19 B (segun model card) | 65.536 (YaRN 2.0) | No (base) | ko, en | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-8B-Base | 8,19 B | 32.768 nativos | No (base) | Multiidioma | Apache 2.0 | HuggingFace |
| Qwen3-8B (post-entrenado) | 8,19 B | 32.768 nativos, extensible con YaRN | Si (SFT/DPO, modo thinking) | Multiidioma | Apache 2.0 | HuggingFace |
| Otros modelos coreanos de contexto largo comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con el modelo base de Qwen es la más informativa: Keural Cortex duplica la ventana de contexto (32.768 → 65.536) y mejora el vocabulario coreano, pero sacrifica ligeramente conocimiento medido (KMMLU −0,34) y no incorpora ninguna capacidad de instrucción. Frente al Qwen3-8B post-entrenado, la diferencia es de categoría: aquel responde a instrucciones y soporta *tool calling*; este no.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones, no tiene formato de chat, no soporta *tool calling*, ni agentes, ni modo de razonamiento. La CPT no añade ninguna de estas capacidades.
- La `chat_template.jinja` se hereda del tokenizador base y no implica ajuste por instrucciones. El modelo imitará frases de asistente porque Qwen3-8B-Base absorbió texto de asistente en su preentrenamiento de 36 T tokens; es imitación, no alineación.
- El conocimiento en coreano no mejoró: KMMLU fue negativo en todos los checkpoints y de 126 filas de tareas evaluadas solo una cambió de forma significativa. Lo que mejoró fue el vocabulario coreano, con caídas en subtareas de conocimiento (general_knowledge −1,14, history −0,53). El autor califica el resultado como "exposición a *web crawl* coreano: más palabras, no más hechos".
- La afirmación defendible según el propio autor es "sin daño de capacidades más un contexto de 64K funcional", no superioridad en coreano.
- No se ha ejecutado descontaminación de benchmarks (solapamiento de n-gramas con los conjuntos de evaluación), por lo que cualquier cifra de benchmark debe tratarse como provisional.
- Riesgo de alucinación: no evaluado ni cuantificado. Al ser un modelo base, el riesgo se manifiesta como continuación plausible pero incorrecta de un documento.
- Discrepancia de datos: los metadatos de safetensors indican 2.047.683.840 parámetros, mientras que la model card declara 8,19 B. El tamaño del repositorio (16,4 GB) apunta a que la cifra correcta es la de la model card, pero conviene verificar los pesos antes de integrarlos en producción.
- La curva de pérdida plana en ~1,94 durante la fase 5 no permite usar la pérdida como señal de calidad; la única evidencia publicada de la extensión de contexto es la rejilla de recuperación.
- Idiomas limitados a coreano e inglés: no hay datos sobre comportamiento en castellano u otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3-8B-Base se heredan las condiciones de la licencia del modelo original. No se han publicado avisos adicionales sobre datos de entrenamiento.
- Adopción nula verificable: 0 descargas y 0 *likes* en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mkd-hossain/Keural-Cortex-8B-64K
- Repositorio del proyecto: https://github.com/MKD-CORP/Keural-Cortex-8B
- Script de evaluación *needle-in-a-haystack*: `eval/needle_cpu.py` dentro del repositorio anterior
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Paper, blog o demo adicionales: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos trataban sobre LibreOffice y una comunidad de preguntas y respuestas en chino).
