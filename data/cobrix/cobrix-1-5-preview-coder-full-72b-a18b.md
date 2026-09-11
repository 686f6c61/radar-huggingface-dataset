# CobrIX/CobrIX-1.5-preview-Coder-Full-72B-A18B

## Resumen

CobrIX-1.5-preview-Coder-Full-72B-A18B es un modelo de lenguaje decoder-only de tipo mixture-of-experts (MoE) publicado por CobrIX en HuggingFace. Se construye a partir del modelo denso Qwen 3.5 `empero-ai/Qwythos-9B-v2` como base y de cinco expertos densos afinados sobre esa misma familia, especializados en código y ciberseguridad mediante DPO y SFT, en inglés y portugués. No se ha utilizado mergekit para el ensamblado.

El modelo totaliza 71.769.534.976 parámetros (unos 71,8B), pero solo activa aproximadamente 18B por token gracias a un enrutado top-2 sobre 13 expertos locales más un experto compartido siempre activo. La arquitectura combina capas de atención lineal y atención completa (híbrida) con bloques MoE que sustituyen al MLP denso en cada capa, y se distribuye con código personalizado (`qwen35_moe`) cargable mediante `trust_remote_code`.

Se trata de una versión preview: el enrutador se ha inicializado de forma aleatoria y no se ha entrenado, no hay cabeza MTP nativa y todavía no se han publicado cuantizaciones GGUF. Su relevancia actual es la de un experimento abierto (licencia MIT) sobre composición de expertos sin mergekit, orientado a evaluación temprana y a la futura versión 1.5 final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen35MoEForCausalLM` (decoder-only), `model_type=qwen35_moe`; transformer híbrido con MoE disperso (13 expertos locales, top-2) y experto compartido |
| Parametros totales | 71.769.534.976 (~71,8B) |
| Parametros activos | ~18B por token (2 de 13 expertos enrutados + 1 experto compartido siempre activo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Solo bf16 en el repositorio; GGUF Q4_K_M y Q5_K_M anunciados para la version final, no publicados |
| Idiomas soportados | en, pt |
| Licencia | MIT |
| Formato de pesos | safetensors con codigo personalizado (`configuration_qwen35_moe.py`, `modeling_qwen35_moe.py` via `auto_map`) |

## Arquitectura y entrenamiento

El modelo tiene 32 capas transformer y sustituye el `mlp` denso de cada capa por un bloque MoE disperso con la secuencia `input_layernorm -> linear_attn -> post_attention_layernorm -> gate/experts[0..12]/shared_expert -> residual`. Usa `num_local_experts=13` y `num_experts_per_tok=2` con enrutado top-2 y softmax sobre los 13 expertos; los logits del router se calculan en `float32`. Además, hay un experto compartido siempre activo (`num_shared_experts=1`), copia del MLP de la base, controlado por una puerta `sigmoid(x @ w)`. La atención es híbrida: 24 capas de `linear_attention` y 8 de `full_attention` (una de cada cuatro).

Los pesos proceden de dos fuentes: la base aporta `embed_tokens`, `linear_attn.*`, `self_attn.*`, layernorms, `norm`, `rotary_emb` y `lm_head`, mientras que cada experto aporta únicamente `gate_proj`, `up_proj` y `down_proj` de cada capa. Los 13 slots reutilizan 5 expertos entrenados según el mapeo `slot 0..12 -> experto 3,4,1,5,2,3,4,5,3,2,4,5,3`; como 10 de los 13 slots corresponden a los expertos de código y ciberseguridad, cerca del 96% de los tokens pasan por al menos uno de ellos. El experto 1 cubre identidad del modelo (Alpaca), el 2 contexto y trazas de razonamiento (destilación), el 3 programación, ciberseguridad y razonamiento de horizonte largo (4 datasets de código), y los expertos 4 y 5 ciberseguridad.

En entrenamiento, cada experto recibió una fase de DPO (alineamiento por preferencias, 750 pasos, mezcla de código y ciberseguridad) más una pasada de refuerzo SFT, con los deltas fusionados por experto. Ningún peso se ha modificado, promediado o interpolado más allá de esos deltas fusionados. El enrutador se inicializó de forma aleatoria y no se ha entrenado; las puertas del experto compartido parten de ceros. El autor indica que el enrutado mejoraría con un fine-tuning solo del router, previsto para una release posterior.

## Capacidades

- Generación de texto y continuación de código en inglés y portugués.
- Generación de código en general y un sesgo fuerte hacia ciberseguridad, dado que 10 de los 13 slots de experto apuntan a expertos entrenados en código y cyber.
- Trazas de razonamiento y manejo de contexto derivados del experto 2 (destilación de trazas de contexto y razonamiento).
- Identidad de modelo y respuestas de corte conversacional vía el experto 1 (Alpaca).
- Capacidad multilingüe limitada a inglés y portugués según los metadatos (`language: en, pt`).
- Soporte de tool calling o function calling: no disponible (no documentado en la model card).
- Soporte de agentes o razonamiento multi-paso explícito: no disponible (no documentado).
- Capacidades de visión o audio: no disponibles (no documentadas).
- No dispone de cabeza MTP nativa; está anunciada para la versión 1.5 final junto a optimizaciones de inferencia.

## Casos de uso

- Asistencia a desarrollo de software en producción: generación y revisión de código en pipelines de CI/CD, aprovechando que la mayoría de los slots de experto están entrenados sobre datasets de programación. Requiere infraestructura con ~150 GB de memoria en bf16.
- Revisión de seguridad de código (SAST asistido): el modelo puede analizar fragmentos y proponer correcciones sobre patrones de vulnerabilidad, dado el entrenamiento específico en ciberseguridad de los expertos 3, 4 y 5.
- Explicación de vulnerabilidades y apoyo a formación en seguridad: generación de material didáctico en portugués e inglés sobre clases de vulnerabilidades, con la salvedad de que el modelo es un preview sin benchmarks publicados.
- Documentación técnica bilingüe (pt/en): redacción de docstrings, READMEs y guías a partir de código fuente, apoyándose en el soporte declarado de ambos idiomas.
- Migración y traducción de bases de código entre inglés y portugués en equipos lusófonos: comentarios, mensajes de error y documentación.
- Evaluación e investigación de arquitecturas MoE: el modelo es útil como banco de pruebas para estudiar enrutado top-2 con experto compartido, inicialización de router y arquitecturas híbridas linear/full attention, dado que el router no está entrenado y su comportamiento es analizable.
- Prototipado de asistentes conversacionales de dominio técnico: conversaciones multi-turno sobre código y seguridad, aceptando la limitación de que la longitud de contexto no está declarada.
- No se recomienda su uso en producción con SLA estricto hasta la publicación de cuantizaciones y de la versión final, por tratarse de una preview.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y la búsqueda web asociada no devolvió resultados relevantes sobre el modelo.

## Requisitos de hardware

- El checkpoint completo en bf16 necesita aproximadamente 150 GB de RAM o VRAM para cargarse, según la propia model card.
- GPU recomendadas: no disponibles de forma oficial; por footprint, el modelo requiere configuraciones multi-GPU, por ejemplo 2x A100 80GB, 2x H100 80GB o 4x A100 40GB, o bien memoria unificada de ~150 GB (por ejemplo, estaciones con gran cantidad de RAM y offload).
- No cabe en GPU de consumo: una RTX 4090 (24 GB) o RTX 6000 Ada (48 GB) no pueden alojar el checkpoint en bf16. El autor indica que su infraestructura actual aloja CobrIX-1.0-Coder-Flash-33B-A13B en una RTX 6000 Ada de 48 GB para entre 50 y 100 usuarios concurrentes, no este modelo de 72B.
- Con las cuantizaciones GGUF anunciadas (Q4_K_M/Q5_K_M), el footprint estimado bajaría a alrededor de 43-47 GB solo para pesos, lo que seguiría exigiendo más de 48 GB de memoria total contando caché KV y overhead; es una estimación aritmética, no un dato publicado.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `torch_dtype="auto"` es la vía documentada. La conversión a GGUF es posible con `llama.cpp` mediante `convert_hf_to_gguf.py` con `architectures[0]=Qwen3_5MoeForCausalLM` y `--no-mtp`. Soporte en vLLM, TGI u Ollama: no confirmado en la información disponible.
- Latencia y throughput: no disponibles. Como referencia estructural, al activar ~18B parámetros por token, el coste computacional por token es el de un modelo denso de ese orden, pero con el footprint de memoria de 71,8B.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CobrIX-1.5-preview-Coder-Full-72B-A18B | 71,77B | ~18B (top-2 de 13 + compartido) | no disponible | MIT | Repositorio HF en safetensors bf16; sin GGUF |
| empero-ai/Qwythos-9B-v2 (modelo base) | ~9B (denso) | ~9B | no disponible | no disponible en la informacion proporcionada | Modelo base referenciado en la model card |
| Alternativas MoE de codigo de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

No se dispone en la información proporcionada de datos de rendimiento, contexto o licencia de modelos comparables que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Versión preview: el autor la describe explícitamente como versión de prueba, con la release final pendiente de think-SFT, MTP nativo y cuantizaciones GGUF.
- Router sin entrenar: se inicializó de forma aleatoria y no se ha entrenado; la calidad del enrutado es, por tanto, no optimizada y puede degradar la coherencia entre expertos.
- Puertas del experto compartido inicializadas a cero, lo que puede afectar al comportamiento efectivo del bloque MoE en las primeras fases.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad en código, razonamiento o seguridad.
- Riesgo de alucinación: al ser un modelo generativo sin datos de evaluación publicados, no hay medida de su tasa de error ni de su calibración.
- Riesgo específico en ciberseguridad: parte del entrenamiento se orienta a esta área, por lo que puede generar sugerencias de código inseguro o de doble uso; no se han publicado evaluaciones de seguridad.
- Idiomas limitados a inglés y portugués; no hay soporte declarado de castellano ni de otros idiomas.
- Longitud de contexto no declarada: no se puede garantizar el comportamiento en contextos largos, pese a que uno de los expertos se entrenó con trazas de razonamiento de horizonte largo.
- Sesgos: no hay información sobre la composición de los datasets de DPO/SFT más allá de "mezcla de código y ciberseguridad"; los sesgos presentes en esos datos se trasladarán al modelo.
- Licencia MIT: permite uso comercial y modificación, pero el repositorio incluye código personalizado que requiere `trust_remote_code=True`, lo que implica ejecutar código del autor en el entorno de inferencia.
- Sin cuantizaciones publicadas: el uso local es inviable en hardware de consumo hasta la publicación de los GGUF Q4_K_M/Q5_K_M.
- Sin historial de adopción: 0 descargas y 1 like en el momento de los datos, por lo que no existe validación comunitaria independiente.
- Se solicita feedback a través de suporte.cobrix@gmail.com para orientar el think-SFT, el entrenamiento del router y la release final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CobrIX/CobrIX-1.5-preview-Coder-Full-72B-A18B
- Modelo base: https://huggingface.co/empero-ai/Qwythos-9B-v2
- Página del ecosistema CobrIX / CobrIX Code y lista de espera: https://cobrix.vercel.app/coder
- Contacto para feedback del preview: suporte.cobrix@gmail.com
- Paper, blog técnico o repositorio de código adicionales: no disponibles en la información proporcionada.
