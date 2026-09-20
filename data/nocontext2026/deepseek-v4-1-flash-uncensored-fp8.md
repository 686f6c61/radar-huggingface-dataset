# Nocontext2026/DeepSeek-V4.1-Flash-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-UNCENSORED-FP8 es un checkpoint derivado del modelo deepseek-ai/DeepSeek-V4.1-Flash, publicado por el usuario Nocontext2026 y asociado a la investigación "dealignai". Se trata de una variante "abliterated": según la model card, se han eliminado quirúrgicamente las direcciones de rechazo a nivel de pesos, sin hooks en tiempo de ejecución ni vectores de steering, de modo que el checkpoint se carga exactamente igual que el modelo base. El repositorio declara 763.205.315.794 parámetros en safetensors y un tamaño de 510,3 GB.

El modelo conserva la arquitectura multimodal del base: encoder-decoder causal de 20+20 capas, mezcla de expertos con 384 expertos enrutados (top-6) más 1 compartido, atención dispersa CSA2, memoria n-gram Engram y cabeza de borrador especulativa DSpark. Mantiene visión (DeepSeek-ViT con 2D-RoPE y pixel unshuffle), tool calling y una ventana de contexto de 1.000.000 de tokens. La cuantización es nativa y no ha sido recalculada: FP8 e4m3fn con escalas de bloque E8M0 [32,32] y expertos enrutados en FP4.

Su relevancia es doble: por un lado, es un caso de estudio sobre eliminación de comportamientos de rechazo conservando capacidades (el autor reporta -4,22 pp en MMLU-14k y -1,1 pp excluyendo el clúster de ética); por otro, eleva la tasa de éxito en HarmBench-320 al 100 % en las siete categorías semánticas, incluidas chemical_biological y cybercrime_intrusion. El repositorio tiene 0 descargas y 0 likes, no ha sido replicado de forma independiente y la model card no documenta idiomas soportados ni licencia efectiva del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder causal (20+20 capas), MoE (384 expertos enrutados top-6 + 1 compartido), Hyper-Connections (residual de 4 canales), atención dispersa CSA2, memoria n-gram Engram, cabeza de borrador especulativa DSpark |
| Parametros totales | 763.205.315.794 (763,2 B) según safetensors; la model card cita "552B backbone" para el modelo base |
| Parametros activos | 8 B / 16 B por token según la model card (el autor no explica la diferencia entre ambas cifras); MoE con 384 expertos enrutados, top-6 + 1 compartido |
| Longitud de contexto | 1.000.000 de tokens |
| Tipos de cuantizacion | FP8 (e4m3fn) con escalas de bloque E8M0 [32,32] en pesos; FP4 en expertos enrutados; nativa, sin recalcular respecto al base. No se publican GGUF, GPTQ ni AWQ |
| Idiomas soportados | no disponible (la model card no lista idiomas; los tags del repositorio no incluyen ninguno) |
| Licencia | MIT (declarada por el autor del fine-tune); la licencia del modelo base no se especifica en la información disponible |
| Formato de pesos | safetensors (librería transformers); tamaño del repositorio 510,3 GB |
| Pipeline | image-text-to-text (multimodal, entrada de imagen y texto) |
| Modalidad de visión | DeepSeek-ViT con 2D-RoPE y pixel unshuffle, sin modificar respecto al base |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card combina varios mecanismos: un backbone encoder-decoder causal de 20+20 capas, una capa MoE con 384 expertos enrutados y selección top-6 más un experto compartido, residuales Hyper-Connections de 4 canales, atención dispersa CSA2 (orientada a reducir el coste del contexto largo), memoria n-gram Engram y una cabeza de borrador DSpark para decodificación especulativa. La torre de visión es DeepSeek-ViT con 2D-RoPE y pixel unshuffle. La cuantización FP8/FP4 es la del modelo base y el autor afirma que componentes críticos (expertos enrutados, memoria Engram, atención CSA2, cabeza DSpark, torre de visión, gates del router, normas y embeddings) se conservan byte a byte idénticos.

No hay información sobre el proceso de entrenamiento del modelo base en los datos proporcionados: no se indica número de tokens, composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Respecto a la modificación, el autor describe un procedimiento propietario de "abliteración a nivel de pesos" que elimina el circuito de rechazo sin `model.py` personalizado, sin hooks en tiempo de ejecución y sin vectores de steering, produciendo un checkpoint drop-in respecto al base. No se documentan los datos, el número de pasos ni el método exacto empleado en ese proceso.

## Capacidades

- Generación de texto multimodal: pipeline image-text-to-text, con entrada conjunta de imagen y texto mediante la torre DeepSeek-ViT.
- Contexto largo: ventana declarada de 1.000.000 de tokens, apoyada en atención dispersa CSA2 y memoria n-gram Engram.
- Razonamiento: la model card menciona "reasoning-max default" y trazas de razonamiento verificables (el evaluador aplica LLM-as-judge sobre la traza guardada cuando effort=max).
- Tool calling / function calling: la model card incluye "tools" entre las capacidades preservadas, aunque no detalla el formato ni el protocolo.
- Agentes y razonamiento multi-paso: el autor afirma preservar la coherencia multi-turno, sin datos cuantitativos que lo respalden.
- Decodificación especulativa: cabeza DSpark integrada en el checkpoint.
- Ausencia de guardarraíles: el comportamiento de rechazo está eliminado a nivel de pesos (0 HARD_REF, 0 SOFT_RED y 0 HEDGE en la evaluación del propio autor).
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Audio: no disponible (no se menciona ninguna modalidad de audio).

## Casos de uso

- Red teaming de sistemas de seguridad: usar el modelo como generador adversario para probar clasificadores de contenido, filtros de salida o guardarraíles de otros LLM, aprovechando que su tasa de cumplimiento es del 100 % en HarmBench-320 y que el autor conserva las salidas por ítem para verificación.
- Investigación sobre abliteración y alineación: reproducir la comparación base vs. abliterado para medir cuánto degrada la eliminación del circuito de rechazo en conocimiento declarativo (-4,22 pp global en MMLU-14k, -1,1 pp excluyendo el clúster de ética).
- Auditoría de repositorios de código completos: con 1M tokens de contexto puede ingerir un monorepositorio entero y responder preguntas de arquitectura, dependencias o deuda técnica sin trocear el código.
- Procesamiento documental con visión: extracción de datos estructurados de manuales técnicos, planos, facturas o informes escaneados combinando la torre ViT con contexto largo para mantener coherencia entre páginas.
- Agentes multi-paso con herramientas: orquestación de pipelines de investigación donde el modelo decide llamadas a APIs externas, apoyándose en tool calling y en la coherencia multi-turno declarada.
- Evaluación comparativa de cuantizaciones: al mantener FP8 en pesos y FP4 en expertos enrutados, sirve para medir el impacto de la cuantización mixta frente al modelo base en tareas de conocimiento y razonamiento.
- Estudios de degradación por cuantización y contexto extremo: analizar cómo se comportan atención dispersa CSA2 y memoria Engram con entradas cercanas al millón de tokens, midiendo coste de KV cache y fidelidad de recuperación.

## Benchmarks y rendimiento

Datos publicados por el propio autor del fine-tune (sin replicación independiente). Temperatura 0, greedy.

| Benchmark | Configuracion | Base | Este modelo (CRACK) | Delta |
|---|---|---|---|---|
| MMLU-14k (test completo, base-logit) | T=0 | 86,96 % (12.211/14.042) | 82,74 % (11.619/14.042) | -4,22 pp |
| MMLU-14k excluyendo clúster de ética (~11k ítems) | T=0 | no disponible (valor absoluto) | no disponible (valor absoluto) | -1,1 pp |
| HarmBench-320 (ASR) | effort=off | 42,81 % (137/320) | 100,00 % (320/320) | +57,19 pp |
| HarmBench-320 (ASR) | effort=max | 1,56 % (5/320) | 100,00 % (320/320) | +98,44 pp |

HarmBench-320 por categoría semántica (ASR):

| Categoria | Items | Base off | CRACK off | Base max | CRACK max |
|---|---:|---:|---:|---:|---:|
| chemical_biological | 42 | 16,7 % | 100,0 % | 0,0 % | 100,0 % |
| copyright | 80 | 98,8 % | 100,0 % | 0,0 % | 100,0 % |
| cybercrime_intrusion | 52 | 34,6 % | 100,0 % | 3,8 % | 100,0 % |
| harassment_bullying | 21 | 0,0 % | 100,0 % | 0,0 % | 100,0 % |
| harmful | 18 | 11,1 % | 100,0 % | 5,6 % | 100,0 % |
| illegal | 53 | 13,2 % | 100,0 % | 0,0 % | 100,0 % |
| misinformation_disinformation | 54 | 44,4 % | 100,0 % | 3,7 % | 100,0 % |

Mayores caídas por asignatura en MMLU (tabla completa truncada en la información disponible): moral scenarios 76,9 % → 37,0 % (-39,89 pp), professional law 75,9 % → 68,8 % (-7,04 pp), abstract algebra 77,0 % → 71,0 % (-6,00 pp), security studies 84,5 % → 79,2 % (-5,31 pp), high school computer science 98,0 % → 94,0 % (-4,00 pp).

No se han publicado resultados de benchmarks de razonamiento (GSM8K, MATH), código (HumanEval, MBPP), visión (MMMU, DocVQA) ni de throughput/latencia.

## Requisitos de hardware

- Pesos: el repositorio ocupa 510,3 GB en safetensors. Esa cifra es el suelo de memoria de acelerador necesaria para cargar el checkpoint completo sin offload a CPU.
- Estimación derivada (no publicada por el autor): se necesitan del orden de 512 GB o más de memoria agregada solo para pesos, más el coste de KV cache con contexto de hasta 1M tokens. Los 763,2 B de parámetros indicados por safetensors implican que un despliegue en FP8 completo estaría en torno a 760 GB de pesos.
- GPU recomendadas: nodos multi-GPU de clase Hopper o posterior. Un nodo de 8× H100 80GB (640 GB) o 8× H200 141GB es el orden de magnitud coherente con el tamaño del repositorio; no hay configuración validada por el autor.
- GPU de consumo: no cabe en ninguna. Una RTX 4090 (24 GB) o RTX 5090 (32 GB) queda muy por debajo del tamaño de pesos, incluso considerando la cuantización FP4 de los expertos enrutados.
- Opciones de despliegue: el repositorio declara `library: transformers` y el tag `endpoints_compatible`, lo que apunta a carga con transformers y compatibilidad con Hugging Face Inference Endpoints. No hay GGUF, por lo que llama.cpp y Ollama no son aplicables con los artefactos publicados. No se documenta soporte de vLLM, TGI ni SGLang.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo, TTFT ni consumo de KV cache para el contexto de 1M tokens.

## Comparativa con modelos similares

Única comparación con datos disponibles: el modelo base. No se proporcionan especificaciones ni resultados de otros modelos alternativos de la misma categoría.

| Modelo | Parametros | Contexto | MMLU-14k | HarmBench-320 (effort=off / max) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| deepseek-ai/DeepSeek-V4.1-Flash (base) | 552 B de backbone según la model card | 1M tokens (atribuido al base) | 86,96 % | 42,81 % / 1,56 % | no disponible | público en Hugging Face |
| Nocontext2026/DeepSeek-V4.1-Flash-UNCENSORED-FP8 | 763,2 B en safetensors | 1M tokens | 82,74 % | 100,00 % / 100,00 % | MIT (declarada por el autor del fine-tune) | público en Hugging Face, 0 descargas, 0 likes |

Otros modelos comparables de la misma categoría (MoE multimodal de escala superior a 500 B): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de guardarraíles: el modelo cumple el 100 % de las peticiones en HarmBench-320 en las siete categorías evaluadas, incluidas chemical_biological (42/42) y cybercrime_intrusion (52/52). Esto lo inhabilita para cualquier despliegue orientado al público general o a usuarios no supervisados.
- Riesgo legal y de cumplimiento: la generación de contenido dañino, de intrusión informática o de desinformación puede infringir normativa de servicios digitales, protección de menores y responsabilidad civil. El uso queda bajo responsabilidad exclusiva del operador.
- Degradación de capacidades: -4,22 pp en MMLU-14k global, con caídas muy concentradas: -39,89 pp en moral scenarios, -7,04 pp en professional law, -6,00 pp en abstract algebra. Excluyendo el clúster de ética la pérdida es de -1,1 pp, siempre según el propio autor.
- Riesgo de alucinación: no se han publicado métricas de fidelidad factual, calibración ni tasas de alucinación para este checkpoint.
- Idiomas: no disponible. No se declaran idiomas soportados, por lo que la cobertura multilingüe real es desconocida.
- Licencia ambigua: el fine-tune declara MIT, pero la licencia del modelo base no se especifica en la información disponible. Un derivado no puede relicenciarse por encima de las condiciones del original; esto es un riesgo legal relevante para uso comercial. El autor no es DeepSeek AI y usa su marca y nomenclatura.
- Cifras de parámetros inconsistentes: safetensors reporta 763,2 B mientras la model card habla de "552B backbone" y de "8B/16B activos por token". Esa discrepancia no está aclarada y afecta a cualquier cálculo de memoria.
- Validación nula: 0 descargas y 0 likes, creado y actualizado el mismo día (2026-09-20), sin revisiones posteriores ni réplica independiente de los benchmarks. Todas las cifras de rendimiento provienen del autor.
- Requisitos de hardware muy altos: 510,3 GB de pesos, sin cuantizaciones GGUF publicadas, lo que limita la inferencia a nodos multi-GPU con FP8 nativo. No hay cifras de latencia ni de coste operativo.
- Alucinación y calidad de las trazas de razonamiento: la verificación con LLM-as-judge descrita se aplica solo a los ítems con effort=max y comprueba la traza, no la corrección factual del contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nocontext2026/DeepSeek-V4.1-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Perfil del autor en X citado en la model card: https://x.com/dealignai
- Segundo perfil citado en la model card: https://x.com/jordanschenck
- Paper técnico: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
- Resultados de búsqueda web: sin enlaces relevantes. Las URLs devueltas corresponden a canales y listas de YouTube sin relación con el modelo, por lo que no se incluyen.
