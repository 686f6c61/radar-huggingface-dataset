# Liljom/Qwen3.8-27B-Concept-Quickthinker5-W4A16-AutoRound-fast

## Resumen

Qwen3.8-27B-Concept-Quickthinker5-W4A16-AutoRound-fast es una compilación de pesos derivada de Qwen/Qwen3.8-27B (modelo BF16 original del equipo Qwen) que apila dos ediciones de pesos publicadas sobre una cuantización int4 W4A16 generada con Intel AutoRound. El autor, Liljom, parte del build "AutoRound-fast" que el stack HyperQwen sirve en una única RTX 3090, y le aplica la edición "Concept" (ConceptCountry) más la edición "Quickthinker" con alpha 5 (Reflex Labs), que según la model card reduce el volumen de razonamiento a cambio de cierta pérdida de calidad en tareas difíciles.

El modelo se distribuye con pipeline image-text-to-text y librería transformers, en formato safetensors con cuantización int4 de grupo 128 simétrica y simétrica por canal para las capas lineales, más un módulo MTP (multi-token prediction) para decodificación especulativa. El repositorio ocupa 16,1 GB y declara 6.260.690.960 parámetros en los tensores safetensors, un dato que no concuerda con el nombre comercial "27B" del modelo base, por lo que conviene tratarlo con cautela.

La relevancia de esta ficha es doble: por un lado documenta una técnica de edición de pesos directamente sobre tensores cuantizados (delta flips sobre `weight_packed`), y por otro es un ejemplo explícito de artefacto de investigación que el propio autor declara no recomendado para producción. La model card incluye una evaluación privada comparativa entre cuatro builds que resulta útil para entender el coste real de las ediciones de pesos en términos de calidad, aceptación de MTP y caché KV.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8), con módulo MTP para decodificación especulativa; pesos en int4 W4A16 con compressed-tensors |
| Parametros totales | 6.260.690.960 según safetensors del repo; el modelo base se denomina "27B" (dato no verificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (la eval se ejecutó con límite de 32k tokens) |
| Tipos de cuantizacion | int4 W4A16, group size 128, simétrica, Intel AutoRound; `lm_head` y módulo MTP en int4 GPTQ; L52 y L56 `mlp.down_proj` en BF16 |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), config.json con `quantization_config.ignore` para L52 y L56 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Qwen3.8, con atención estándar y sin mezcla de expertos. Sobre el modelo base, el linaje aplica en cadena: (1) cuantización int4 W4A16 de Intel AutoRound con grupo 128 simétrica y formato compressed-tensors (dbirks); (2) variante "fast" de HyperQwen, que sustituye el `lm_head` por una versión int4 GPTQ, añade un módulo MTP draft en int4 y una cabeza draft de 40.960 filas proveniente de syvai; (3) edición Concept de ConceptCountry, que modifica `mlp.down_proj` de las capas 32, 34, …, 48 mediante "delta flips" sobre los pesos empaquetados, preservando entre el 94 % y el 100 % de la edición por matriz; (4) edición Quickthinker alpha 5 de Reflex Labs, aplicada como parche desde la revisión upstream `dd9e07ab`.

Las innovaciones técnicas destacables son tres. Primero, la edición de pesos se realiza directamente sobre tensores int4 empaquetados con la fórmula `q_new = clamp(q_p + round(W_concept/s) − round(W_base/s), −8, 7)`, reutilizando las escalas propias de la cuantización. Segundo, las capas L52 y L56 `mlp.down_proj` se almacenan en BF16 porque la edición desplaza columnas muy fuera del rango int4 (la columna 5247 de L52 pasa de norma 0,69 a ~51 con alpha 5), con un coste de +0,24 GiB de VRAM y −2,7 % de caché KV. Tercero, se modifican 12 filas "hedge-token" del `lm_head` (Double, Could, Another, Wait, Maybe, Perhaps, Hold, Actually, Alternative, Hmm, Alternatively, Potential) con 6.692 flips y 21 clamps, y se sincronizan en `mtp.draft_lm_head`. No hay información sobre el dataset de entrenamiento, el número de tokens, ni sobre etapas de RLHF o DPO del modelo base.

## Capacidades

- Generación de texto conversacional en inglés, con modo de razonamiento ("thinking") configurable por esfuerzo (low, medium; xhigh no probado).
- Razonamiento multi-paso y tareas de matemáticas y lógica, evaluadas por el autor en una suite privada de 4 tareas duras.
- Procesamiento image-text-to-text según el `pipeline_tag` declarado, aunque la model card no detalla el encoder visual ni el uso práctico de esta capacidad.
- Decodificación especulativa mediante módulo MTP con k = 4, que acelera la generación en vLLM con los parches de HyperQwen.
- Edición de pesos orientada a reducir el volumen de tokens de razonamiento (hasta −37 % frente al build AutoRound sin editar en la eval del autor).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Investigación sobre edición de pesos en modelos cuantizados: el repositorio sirve como referencia reproducible de cómo aplicar delta flips sobre `weight_packed` int4 sin des-cuantizar, útil para grupos que estudien técnicas de weight editing sobre compressed-tensors.
- Servicio single-user en RTX 3090 con HyperQwen: el build está pensado para desplegarse en una única GPU consumer de 24 GB, con MTP y caché KV ajustada, para prototipos de razonamiento en local.
- Estudio del trade-off razonamiento/calidad: la model card publica tablas comparativas entre cuatro builds que permiten analizar cómo varía la tasa de acierto en tareas difíciles al recortar tokens de pensamiento.
- Evaluación de decodificación especulativa: al incluir módulo MTP y una cabeza draft sincronizada, es útil para medir tasas de aceptación (0,620 en este build frente a 0,651 del base) y su impacto en latencia.
- Reproducción de pipelines de cuantización AutoRound: el linaje documenta paso a paso la construcción desde BF16 hasta int4 fast, sirviendo como plantilla para cuantizar otros modelos Qwen.
- Análisis de robustez de cuantización: las capas L52 y L56 forzadas a BF16 por desbordamiento de rango son un caso de estudio sobre los límites del int4 en ediciones agresivas.
- Baseline negativo en benchmarks internos: el propio autor lo declara no adoptado, por lo que puede usarse como referencia de "qué no hacer" al comparar variantes de edición.

## Benchmarks y rendimiento

Datos de la eval privada del autor: una RTX 3090, vLLM con MTP (k = 4), reasoning effort medium, 4 tareas duras × 4 semillas (16 llamadas por build). AR = AutoRound-fast sin editar.

| Metrica | AR | AR+Concept | AR+Concept+QT5 (este) |
|---|---|---|---|
| Tokens de razonamiento (suma) | 164.805 | 119.857 | 103.322 (−37 % / −14 %) |
| Tiempo de pared (suma) | 2.810 s | 2.040 s | 1.746 s (−38 % / −14 %) |
| Tareas duras superadas de 16 / score medio | 13 / 0,868 | 12 / 0,913 | 11 / 0,798 |
| Tarea más difícil (H3b), superadas de 4 / score | 3 / 0,750 | 3 / 0,983 | 2 / 0,523 |
| Límite 32k, respuesta vacía | 1 | 0 | 1 |
| Tasa de aceptación MTP | 0,651 | 0,658 | 0,620 |
| Caché KV (tokens) | 225.046 | 225.046 | 219.065 |

A reasoning effort low (suite completa de 94 llamadas, 2 ejecuciones por build frente a AR+Concept), QT5 sobre Concept no acortó claramente el pensamiento (tier duro −2 %, dispersión entre ejecuciones ±10 %), la decodificación fue 4–9 % más lenta y la aceptación MTP cayó de 0,738 a 0,712. No se han publicado resultados de MMLU, HumanEval, GSM8K ni MATH-500 para este build concreto en la información disponible; la model card indica que upstream evaluó solo en GSM8K, MATH-500 y MMLU-Pro, sin cifras.

## Requisitos de hardware

- VRAM estimada: el repo pesa 16,1 GB en safetensors int4; con overhead de activaciones, caché KV y módulo MTP, el autor lo sirve en una RTX 3090 de 24 GB. Las capas L52 y L56 en BF16 añaden ~0,24 GiB.
- GPU recomendadas: RTX 3090 (referencia del autor); previsiblemente válido en RTX 4090 (24 GB) y A100/H100 por holgura de VRAM, aunque no hay pruebas publicadas en estas GPUs.
- Cabe en GPU consumer: sí, en RTX 3090 y RTX 4090 (24 GB). En GPUs de 16 GB no hay datos; el tamaño del repo (16,1 GB) deja poco margen.
- Opciones de despliegue: vLLM con los parches de HyperQwen (incluido el parche de vocabulario del draft MTP). vLLM estándar sin parches no está probado. No se mencionan llama.cpp, Ollama ni TGI; el formato compressed-tensors int4 no es directamente compatible con llama.cpp.
- Latencia y throughput: en la eval del autor, 1.746 s de tiempo de pared para 16 llamadas (≈109 s por llamada) en RTX 3090 con MTP k = 4 y effort medium; decodificación 4–9 % más lenta que AR+Concept en effort low.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este build (AR+Concept+QT5) | 6,26 B en safetensors; base "27B" | no disponible | int4 W4A16 AutoRound + MTP int4 | Apache-2.0 | Research artifact; no recomendado por el autor |
| AR+Concept (build previo del mismo autor) | mismo linaje | no disponible | int4 W4A16 AutoRound | Apache-2.0 | Recomendado por el autor: recorte de pensamiento sin coste de calidad/MTP/KV |
| AutoRound-fast (HyperQwen, syv-ai) | mismo linaje | no disponible | int4 W4A16 + MTP int4 | Apache-2.0 | Base sin ediciones; 0,651 de aceptación MTP |
| Qwen/Qwen3.8-27B (BF16 original) | "27B" (no verificado) | no disponible | BF16 | Apache-2.0 | Modelo de referencia del equipo Qwen |

No se dispone de comparación con modelos de otras familias (Llama, Mistral, Gemma) en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor declara explícitamente que no lo recomienda y que no lo adoptó; falla más a menudo la tarea más difícil (2/4 frente a 3/4 del base) y baja el score medio a 0,798.
- Coste en serving: reduce la aceptación de MTP (0,620 frente a 0,651) y la caché KV (219.065 frente a 225.046 tokens), lo que penaliza el throughput en producción.
- Muestra de evaluación pequeña: 16 llamadas puntuadas por build a temperatura 1,0; una diferencia de una llamada no es concluyente, según el propio autor.
- No probado a effort xhigh; sin datos de MMLU, HumanEval ni otros benchmarks estándar para este build.
- Solo inglés declarado; sin soporte multilingüe documentado.
- Dependencia de parches: requiere los parches de vLLM de HyperQwen; vLLM estándar no está probado y podría fallar al cargar el módulo MTP o el `quantization_config.ignore`.
- Discrepancia de parámetros: el nombre indica 27B pero los safetensors declaran 6,26 B; conviene verificar antes de dimensionar hardware.
- Riesgo de alucinación y sesgos: no documentados específicamente para este build; hereda los del modelo base Qwen3.8-27B, no detallados en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero al ser un artefacto de investigación sin validación en producción, el uso comercial no está respaldado por evaluaciones públicas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Liljom/Qwen3.8-27B-Concept-Quickthinker5-W4A16-AutoRound-fast
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización AutoRound original: https://huggingface.co/dbirks/Qwen3.8-27B-W4A16-AutoRound
- Variante fast de HyperQwen: https://huggingface.co/syvai/qwen3.8-27b-3090-fast-variant
- Edición Concept: https://huggingface.co/ConceptCountry/qwen-concept-27b
- Build intermedio AR+Concept: https://huggingface.co/Liljom/Qwen3.8-27B-Concept-W4A16-AutoRound-fast
- Edición Quickthinker: https://huggingface.co/scar-ai/Qwen3.8-27B-Quickthinker
- Stack de serving HyperQwen: https://github.com/syv-ai/HyperQwen
- Informe completo de evaluación: https://claude.ai/artifact/SscXkuciQGhHpgwhWqoGBz
- Paper AutoRound: https://arxiv.org/abs/2309.05516
