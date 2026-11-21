# chris320211/flatquant-phi3-mini-4k-g52xlarge

## Resumen

FlatQuant Phi-3 Mini 4K es una versión cuantizada del modelo `microsoft/Phi-3-mini-4k-instruct`, publicada por el usuario chris320211 mediante la herramienta QuantPort y la técnica de cuantización FlatQuant. El modelo base es un transformer denso de 3.800 millones de parámetros desarrollado por Microsoft, con una ventana de contexto de 4.096 tokens y entrenado para instrucciones conversacionales. Esta derivada no modifica la arquitectura ni el entrenamiento del original: aplica una transformación de pesos orientada a reducir el uso de VRAM y aumentar el throughput en inferencia.

La relevancia de esta ficha radica en que el artefacto es un ejemplo de cuantización post-entrenamiento medida y documentada: el autor publica métricas de perplejidad, pérdida NLL, tokens por segundo y VRAM pico sobre una GPU NVIDIA A10G (instancia `g5.2xlarge`), comparando contra el snapshot fp16 original. Los resultados indican un aumento de velocidad de aproximadamente un 50,7 % (5.105,9 frente a 3.387,6 tokens/s en prefill de 2.048 tokens) y una reducción de VRAM pico de 9,681 GB a 3,355 GB, con un coste de calidad de perplejidad de 7,394 frente a 6,332 (ratio 1,168, marcado como `quality_ok=True`).

Es importante señalar que este repositorio no es un checkpoint compatible directamente con `AutoModelForCausalLM.from_pretrained`. Los pesos son un artefacto empaquetado que requiere el adaptador de inferencia incluido (`quant_agent_inference_adapter.py`) y el repositorio del método en la variable `QUANT_AGENT_METHOD_REPO`. El tamaño del repositorio es de 2,2 GB, y la licencia declarada es MIT, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (heredada de Phi-3-mini-4k-instruct); pesos transformados con FlatQuant |
| Parametros totales | 3.800 millones (modelo base; el artefacto cuantizado no declara recuento propio) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (heredada del modelo base) |
| Tipos de cuantizacion | FlatQuant (cuantizacion post-entrenamiento con transformaciones de pesos); niveles de bits no especificados en la model card |
| Idiomas soportados | No disponible |
| Licencia | MIT (heredada de microsoft/Phi-3-mini-4k-instruct) |
| Formato de pesos | Artefacto empaquetado propio de QuantPort; no es safetensors estándar ni GGUF; requiere adaptador de inferencia incluido |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-3-mini-4k-instruct: un transformer decoder-only denso de 3.800 millones de parámetros con atención multi-cabeza estándar y una ventana de contexto de 4.096 tokens. Microsoft entrenó el modelo base con un corpus mixto de datos web filtrados y datos sintéticos, seguido de ajuste fino supervisado y optimización por preferencias (DPO) para alineamiento conversacional. Esta derivada no añade entrenamiento nuevo: parte del snapshot fp16 y aplica una transformación de cuantización.

La innovación técnica de este artefacto es FlatQuant, un método de cuantización post-entrenamiento que aplica transformaciones lineales a los pesos antes de cuantizarlos, con el objetivo de aplanar la distribución de activaciones y reducir el error de cuantización. QuantPort es la herramienta que empaqueta el resultado en un formato de runtime propio. La model card documenta el job concreto (`20260919T202736Z-5a1860`) y las métricas de validación sobre WikiText-2 con ventanas de 2.048 tokens y 65.504 tokens evaluados, pero no detalla el número de bits, la granularidad de cuantización ni la composición exacta de las transformaciones aplicadas.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste de instrucciones de Phi-3-mini-4k-instruct.
- Razonamiento de sentido común y matemáticas básicas a nivel de modelo pequeño (3.800 millones de parámetros).
- Generación de código y explicación de fragmentos, con calidad limitada por el tamaño del modelo base.
- Soporte de instrucciones y formato de chat de Phi-3 (tokens especiales `<|user|>`, `<|assistant|>`, `<|end|>`), sujeto a verificación con el adaptador incluido.
- Capacidades multilingües: no disponibles en la información proporcionada; el modelo base de Microsoft declara soporte limitado fuera del inglés, pero esta derivada no lo especifica.
- Tool calling y function calling: no documentado en la model card de esta derivada.
- Modo thinking, visión o audio: no disponibles; el modelo base es solo texto.
- Inferencia con mayor throughput y menor VRAM que el snapshot fp16, según las métricas del autor.

## Casos de uso

- Despliegue en GPU de consumo con VRAM limitada: con 3,355 GB de VRAM pico medida en A10G, el artefacto puede caber en tarjetas de 8 GB o menos, aunque requiere el adaptador de QuantPort y no funciona con pipelines estándar de transformers sin ese paso previo.
- Prototipado de asistentes conversacionales en local: el modelo base está ajustado para instrucciones y mantiene conversaciones multi-turno dentro de su ventana de 4.096 tokens, adecuado para demos y entornos de desarrollo sin presupuesto de GPU dedicada.
- Evaluación de técnicas de cuantización: el repositorio publica métricas reproducibles (perplejidad, NLL, tokens/s, VRAM) sobre WikiText-2, lo que lo convierte en un punto de comparación útil para investigadores que estudien FlatQuant frente a otras técnicas como GPTQ, AWQ o SmoothQuant.
- Generación de texto por lotes con requisitos de throughput: los 5.105,9 tokens/s en prefill de 2.048 tokens medidos en A10G lo hacen viable para tareas de procesamiento masivo de texto donde la latencia no sea crítica y la calidad aceptable con perplejidad de 7,39.
- Experimentación académica con modelos pequeños alineados: útil para estudiar el efecto de la cuantización en modelos con DPO, comparando respuestas del artefacto contra el fp16 original en tareas de razonamiento y diálogo.
- Base para ajuste fino con QLoRA: al reducir la huella de VRAM, puede servir como punto de partida para adaptadores de bajo rango, siempre que el adaptador de QuantPort sea compatible con el flujo de entrenamiento elegido (no documentado).

## Benchmarks y rendimiento

Métricas publicadas por el autor en la model card, medidas en NVIDIA A10G (instancia `g5.2xlarge`) sobre WikiText-2 test con ventanas de 2.048 tokens y 65.504 tokens evaluados, comparando contra el snapshot fp16 original:

| Metrica | Cuantizado | Snapshot fp16 |
|---|---:|---:|
| Perplejidad | 7,393646 | 6,332276 |
| Perdida NLL | 2,000621 | 1,845660 |
| Tokens/s (prefill 2048, tras warmup) | 5.105,9 | 3.387,6 |
| VRAM pico (GB) | 3,355 | 9,681 |

El autor reporta `ppl_ratio` de 1,167613 con `quality_ok=True`, además de `improved_throughput=True` e `improved_vram=True`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 3,355 GB de pico medido en A10G con el adaptador de QuantPort; el consumo real puede variar según la longitud de secuencia y el lote.
- GPU recomendadas: NVIDIA A10G (medida por el autor), A100 y H100 para mayor throughput; RTX 4090 y RTX 3090 son viables por capacidad de VRAM.
- Cabe en GPU de consumo: sí, con 3,355 GB de pico medido cabe en tarjetas de 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070), siempre que se use el adaptador y no un pipeline estándar.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma directa, ya que no es un checkpoint estándar de transformers ni GGUF. Requiere el adaptador `quant_agent_inference_adapter.py` incluido y el repositorio del método en `QUANT_AGENT_METHOD_REPO`.
- Latencia y throughput: 5.105,9 tokens/s en prefill de 2.048 tokens en A10G tras warmup; no se publican métricas de decodificación token a token ni latencia de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FlatQuant Phi-3 Mini 4K (este) | 3.800 M (base) | 4.096 | MIT | Artefacto QuantPort con adaptador | PPL 7,39 en WikiText-2; 3,355 GB VRAM pico en A10G |
| microsoft/Phi-3-mini-4k-instruct (fp16) | 3.800 M | 4.096 | MIT | Safetensors | PPL 6,33 en WikiText-2; 9,681 GB VRAM pico en A10G |
| Phi-3-mini-4k-instruct en GGUF (p. ej. Q4_K_M) | 3.800 M | 4.096 | MIT | GGUF | Compatible con llama.cpp y Ollama; métricas de calidad y VRAM no disponibles en esta ficha |
| Llama 3.2 3B Instruct | 3.200 M | 128.000 | Llama 3.2 Community License | Safetensors, GGUF | Contexto mucho mayor; licencia con restricciones comerciales; métricas no comparadas en esta ficha |

La comparación directa con alternativas cuantizadas está limitada porque el autor solo publica métricas frente al fp16 del mismo modelo base. No se dispone de datos de benchmarks estándar para situar este artefacto frente a otras técnicas de cuantización.

## Limitaciones y advertencias

- No es un checkpoint drop-in: `AutoModelForCausalLM.from_pretrained` no funciona directamente; requiere el adaptador incluido y el repositorio del método, lo que añade fricción de integración y riesgo de incompatibilidad con versiones futuras de transformers.
- Degradación de calidad medible: la perplejidad sube de 6,332 a 7,394 (ratio 1,168) y la pérdida NLL de 1,846 a 2,001; en tareas sensibles a la precisión (matemáticas, código, hechos) el impacto puede ser mayor que en texto genérico.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos, agentes con historial extenso o RAG con muchos fragmentos.
- Idiomas soportados no declarados en esta derivada; el modelo base de Microsoft tiene cobertura limitada fuera del inglés y puede degradarse en castellano y otras lenguas.
- Riesgo de alucinación inherente a un modelo de 3.800 millones de parámetros, agravado por la cuantización; no debe usarse en producción sin verificación factual.
- Sesgos heredados del corpus de entrenamiento de Phi-3; no se documenta ninguna mitigación adicional en esta derivada.
- Licencia MIT heredada del modelo base, pero la model card indica que se debe mantener también la licencia del repositorio del método (QuantPort); conviene revisar ambas antes de uso comercial.
- Artefacto de autor individual (chris320211) con 1 like y 966 descargas; no es una publicación oficial de Microsoft ni ha pasado una revisión independiente.
- No hay garantía de mantenimiento ni soporte; la fecha de creación (2026-09-19) y actualización (2026-10-28) indican un proyecto reciente y de un solo mantenedor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chris320211/flatquant-phi3-mini-4k-g52xlarge
- Modelo base: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Licencia del modelo base: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct/resolve/main/LICENSE
- Repositorio del método QuantPort: https://github.com/chris320211/QuantPort
