# chris320211/smoothquant-phi35-mini-vastrtx3090

## Resumen

SmoothQuant Phi-3.5-mini es una versión cuantizada a 8 bits del modelo `microsoft/Phi-3.5-mini-instruct`, generada por el usuario `chris320211` mediante la herramienta QuantPort, que aplica la técnica SmoothQuant. No se trata de un checkpoint fp16 al uso, sino de un artefacto empaquetado de ejecución (packed/runtime artifact) que requiere un adaptador de inferencia específico incluido en el repositorio. El objetivo es reducir el consumo de VRAM y aumentar el throughput de prefill manteniendo una calidad cercana al modelo original.

El modelo base, Phi-3.5-mini-instruct, es un transformer decoder-only de aproximadamente 3.820 millones de parámetros desarrollado por Microsoft, orientado a instrucciones y conversación. Esta derivada cuantizada conserva la licencia MIT del original y está pensada para despliegue en GPUs de consumo como la RTX 3090, donde el autor reporta una reducción de VRAM pico de 9,681 GB a 5,908 GB y un incremento de throughput de prefill de 4.218,8 a 12.268,5 tokens por segundo.

La relevancia de esta ficha radica en que documenta un caso concreto de cuantización post-entrenamiento con métricas verificables (perplejidad en WikiText-2, latencia, VRAM) sobre un modelo pequeño ampliamente utilizado. Es un ejemplo útil para evaluar si SmoothQuant es una vía viable para servir Phi-3.5-mini en hardware limitado, aunque con la advertencia de que no es un checkpoint drop-in y su ecosistema de despliegue es limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Phi-3.5-mini-instruct); pesos cuantizados con SmoothQuant a 8 bits |
| Parametros totales | 3.822.095.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base, no confirmada en esta ficha) |
| Tipos de cuantizacion | 8-bit (SmoothQuant); pesos empaquetados en safetensors |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada de microsoft/Phi-3.5-mini-instruct) mas la licencia del repositorio del metodo |
| Formato de pesos | safetensors (artefacto empaquetado de ejecucion, no drop-in para `AutoModelForCausalLM`) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Phi-3.5-mini, con 3.822 millones de parámetros, entrenado por Microsoft para seguir instrucciones y mantener conversaciones multi-turno. Sobre ese checkpoint, el autor aplica SmoothQuant, una técnica de cuantización post-entrenamiento que migra la dificultad de cuantización de las activaciones a los pesos mediante un factor de escala por canal, permitiendo cuantizar tanto pesos como activaciones a 8 bits con una pérdida de calidad reducida.

No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, ni si hubo RLHF o DPO en el modelo base dentro de la información proporcionada. La model card sí documenta el proceso de cuantización: los pesos son el artefacto empaquetado del job `20261102T212454Z-0531e9`, generado con QuantPort, y requieren recargarse con el adaptador `quant_agent_inference_adapter.py` incluido en el repositorio, apuntando `QUANT_AGENT_METHOD_REPO` al repositorio del método. Existe además una build nativa para vLLM publicada como `chris320211/smoothquant-phi35-mini-vastrtx3090-vllm`.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Phi-3.5-mini-instruct.
- Razonamiento y respuesta a instrucciones en formato chat (pipeline `text-generation`).
- Capacidad de código y matemáticas: no confirmada explícitamente en la información proporcionada, aunque el modelo base las soporta.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el campo de idiomas no está cumplimentado.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad con endpoints (`endpoints_compatible`) y con text-generation-inference según los tags del repositorio.

## Casos de uso

- Servicio de chat en GPU de consumo: el modelo cabe en una RTX 3090 con 5,908 GB de VRAM pico según el autor, lo que permite desplegar un asistente conversacional en hardware de gama alta de consumo sin recurrir a A100 o H100.
- Inferencia de alto throughput en prefill: con 12.268,5 tokens/s de prefill medidos, es adecuado para escenarios con prompts largos donde el coste de prefill domina, como resumen de documentos o análisis de contexto extenso.
- Despliegue con vLLM: la build nativa `-vllm` permite servir el modelo con `vllm serve`, con un ratio de perplejidad de 1,0290 frente a fp16 y aceleraciones de 2,05× en prefill y 1,62× en decode (batch 1) según el autor.
- Prototipado e investigación en cuantización: sirve como caso de estudio reproducible de SmoothQuant con métricas publicadas (perplejidad, NLL, VRAM, throughput) para comparar métodos de cuantización.
- Evaluación de calidad post-cuantización: el ratio de perplejidad de 1,029740 y el flag `quality_ok=True` permiten usar el modelo en tareas donde una degradación inferior al 3% en perplejidad es aceptable, como generación de borradores o clasificación de texto.
- Entornos con restricciones de memoria: al reducir la VRAM pico de 9,681 GB a 5,908 GB, encaja en GPUs con 8 GB o menos si se ajusta el contexto, aunque no se especifican configuraciones adicionales.
- Integración en pipelines de transformers: al usar `transformers` como librería, puede integrarse en flujos existentes que ya consuman modelos Phi-3.5, siempre que se incorpore el adaptador de inferencia.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, medidos en NVIDIA GeForce RTX 3090 (`vast-rtx3090`) sobre WikiText-2 test con ventanas de 2048 tokens (65.504 tokens):

| Métrica | Cuantizado | Snapshot fp16 |
|---|---:|---:|
| Perplejidad | 6,822674 | 6,625631 |
| NLL loss | 1,920252 | 1,890946 |
| Tokens/s (prefill 2048, tras warmup) | 12.268,5 | 4.218,8 |
| VRAM pico (GB) | 5,908 | 9,681 |

Ratio de perplejidad (`ppl_ratio`): 1,029740, con `quality_ok=True`, `improved_throughput=True` e `improved_vram=True`.

Rendimiento con vLLM 0.30.0 en RTX 3090, según el autor: ratio de perplejidad de 1,0290 frente a vLLM fp16, prefill 2,05×, decode 1,62× (batch 1) y 1,49× (batch 16).

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 5,908 GB de pico según la medición del autor en RTX 3090 con ventanas de 2048 tokens.
- GPU recomendadas: NVIDIA GeForce RTX 3090 (hardware de referencia de las mediciones); no se documentan otras GPU.
- Cabe en GPU de consumo: sí, al menos en RTX 3090; no se confirma en GPUs con menos de 8 GB.
- Opciones de despliegue: adaptador `quant_agent_inference_adapter.py` con `transformers`, o la build nativa para vLLM (`vllm serve chris320211/smoothquant-phi35-mini-vastrtx3090-vllm`). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 12.268,5 tokens/s de prefill (2048 tokens, tras warmup) en RTX 3090; con vLLM, prefill 2,05× y decode 1,62× (batch 1) frente a fp16. No se proporcionan latencias absolutas de decode.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| chris320211/smoothquant-phi35-mini-vastrtx3090 | 3.822 M | no disponible | 8-bit SmoothQuant | MIT | safetensors empaquetado + adaptador |
| microsoft/Phi-3.5-mini-instruct (fp16) | 3.822 M | no disponible | fp16 | MIT | safetensors |
| chris320211/smoothquant-phi35-mini-vastrtx3090-vllm | 3.822 M | no disponible | 8-bit SmoothQuant | MIT | build nativa vLLM |

La comparativa se limita a las variantes del mismo modelo base y su build vLLM, ya que la información proporcionada no incluye otros modelos comparables. No se dispone de datos de rendimiento de benchmarks estándar para contrastar con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un checkpoint drop-in: no funciona con `AutoModelForCausalLM.from_pretrained` directamente; requiere el adaptador `quant_agent_inference_adapter.py` y el repositorio del método en `QUANT_AGENT_METHOD_REPO`.
- Degradación de calidad: la perplejidad sube de 6,625631 a 6,822674 (ratio 1,029740), lo que implica una pérdida medible aunque moderada.
- Idiomas no documentados: el campo de idiomas está vacío, por lo que no se puede garantizar cobertura multilingüe.
- Contexto no confirmado: la longitud de contexto no se especifica en la información disponible; debe verificarse en el modelo base antes de usarlo en producción.
- Sesgos y alucinaciones: no se documentan sesgos específicos ni tasas de alucinación; se heredan los del modelo base Phi-3.5-mini-instruct, no evaluados en esta ficha.
- Licencia: MIT heredada del modelo base, más la licencia del repositorio del método; deben conservarse `LICENSE` y `NOTICE.md` del snapshot cuando estén presentes.
- Ecosistema limitado: solo se documenta despliegue vía transformers con adaptador o vLLM; no hay soporte confirmado para llama.cpp, Ollama o TGI.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-02), lo que indica poca validación externa.
- Medición única: los benchmarks proceden de una sola ejecución en una RTX 3090 concreta (`vast-rtx3090`), sin réplicas independientes.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/chris320211/smoothquant-phi35-mini-vastrtx3090
- HuggingFace (build vLLM): https://huggingface.co/chris320211/smoothquant-phi35-mini-vastrtx3090-vllm
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Licencia del modelo base: https://huggingface.co/microsoft/Phi-3.5-mini-instruct/resolve/main/LICENSE
- Repositorio del método QuantPort: https://github.com/chris320211/QuantPort
