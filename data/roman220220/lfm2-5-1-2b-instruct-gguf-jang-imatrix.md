# roman220220/LFM2.5-1.2B-Instruct-GGUF-jang-imatrix

## Resumen

Este repositorio contiene una cuantización GGUF del modelo LFM2.5-1.2B-Instruct de Liquid AI, publicada por el usuario roman220220 (IPSupport LLC). No se trata de un modelo nuevo, sino de una conversión a formato GGUF para llama.cpp y Ollama del modelo base de 1,17 mil millones de parámetros, con una asignación de bits no uniforme bautizada como "JANG-mixed" y una importance matrix calculada sobre un corpus real amplio. El objetivo es reducir el peso de 2,34 GB (F16) a 0,84 GB manteniendo la perplexity prácticamente intacta (+1,1 % sobre wikitext-2).

El modelo base es un transformer híbrido: 10 de sus 16 capas usan convoluciones cortas con puerta (gated short convolutions) y las 6 restantes emplean atención GQA completa con QK-layernorm. Está pensado para inferencia en dispositivo (on-device) y para entornos con recursos limitados, lo que explica el interés de una cuantización tan agresiva en tamaño pero selectiva en precisión.

Su relevancia actual es doble: por un lado, demuestra una receta de cuantización reproducible (imatrix + tipos por tensor) aplicable a modelos pequeños; por otro, ofrece una vía práctica para ejecutar un chat de 1,2 B en CPU, GPU de gama baja o Apple Silicon sin renunciar apenas a calidad respecto al original en F16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 10 de 16 capas con convoluciones cortas con puerta; 6 capas con atención GQA completa y QK-layernorm |
| Parametros totales | 1.170.340.608 (~1,17 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con mezcla JANG: Q8_0 (atención completa q/k/v/output y token_embd), Q6_K (shortconv.in_proj/out_proj), Q4_K_M (ffn_gate/up/down), F32 (shortconv.conv y normas) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (etiquetada como "other" en HuggingFace) |
| Formato de pesos | GGUF (llama.cpp / Ollama) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer híbrido de 16 capas. Diez de ellas sustituyen la atención por convoluciones cortas con puerta (gated short convolutions) de 3 taps, mientras que las seis restantes mantienen atención completa con Grouped Query Attention (GQA) y QK-layernorm. Esta combinación busca reducir el coste computacional y de memoria de la atención en modelos pequeños sin perder capacidad de modelado de contexto. Los embeddings de tokens están atados (tied) a la cabeza de salida.

Sobre el proceso de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO, etc.) no se proporciona información en la documentación disponible. Lo que sí se documenta es la receta de cuantización aplicada aquí: se calculó una importance matrix con `llama-imatrix` sobre 200 fragmentos del corpus `calibration_datav3` de bartowski (código, prosa, datos factuales y multilingüe), ejecutado en una única RTX 4090. La asignación de bits es selectiva: los tensores más sensibles (atención completa y embeddings) se mantienen en Q8_0, las proyecciones de entrada/salida de las convoluciones en Q6_K, el feed-forward en Q4_K_M y los kernels de convolución y las normas en F32 sin tocar. El resultado son 0,84 GB frente a los 2,34 GB del F16.

## Capacidades

- Generación de texto conversacional: el repositorio incluye un `Modelfile` de Ollama con los parámetros de muestreo recomendados por Liquid AI (temperature 0,1, top_k 50, top_p 0,1, repetition penalty 1,05).
- Conversación multi-turno: el GGUF conserva la plantilla de chat jinja de LFM2, aplicable con `--jinja` en llama.cpp o directamente en versiones recientes de Ollama.
- Tool calling / function calling: la model card advierte de que no hay un `RENDERER`/`PARSER` dedicado de LFM2 en Ollama y que, si los tokens de llamada a herramientas se filtran como texto plano, conviene recurrir a llama.cpp con `--jinja`.
- Capacidades multilingües: no disponibles en la información proporcionada (aunque el corpus de calibración de la imatrix incluía material multilingüe, eso no implica capacidades del modelo).
- Ejecución local en CPU, GPU de gama baja y Apple Silicon: es la capacidad principal que habilita esta cuantización, dado su tamaño de 0,84 GB.

## Casos de uso

- Asistentes de chat locales en portátil: con 0,84 GB de pesos, el modelo se ejecuta íntegramente en RAM o VRAM de un portátil corriente mediante Ollama o llama.cpp, sin necesidad de conexión a internet, lo que lo hace adecuado para aplicaciones que requieren privacidad de datos.
- Clasificación y etiquetado de texto en pipelines batch: por su tamaño reducido permite procesar grandes volúmenes de documentos en CPU con un coste por token muy bajo, usando prompts de clasificación.
- Generación de texto asistida en editores y herramientas de escritorio: integrable como backend local de autocompletado o reescritura, sin depender de APIs externas.
- Prototipado rápido de agentes conversacionales: sirve como modelo de pruebas para validar plantillas de chat, flujos multi-turno y esquemas de tool calling antes de escalar a modelos mayores.
- Despliegue en entornos embebidos o edge con hardware modesto: la combinación de cuantización Q4_K_M con capas sensibles en Q8_0 permite ejecutarlo en dispositivos con poca memoria.
- Evaluación comparativa de recetas de cuantización: este repositorio es útil como referencia para medir el impacto de una mezcla JANG + imatrix frente a un Q4_K_M estándar, usando la tabla de perplexity incluida.
- Servicio de API compatible con OpenAI en local: mediante LLMTray o llama-server, se puede exponer el modelo como endpoint local para herramientas que esperan la interfaz de OpenAI.

## Benchmarks y rendimiento

La única medición publicada en la información disponible es la perplexity sobre wikitext-2 (test), calculada con `llama-perplexity` sobre 40 fragmentos de 512 tokens:

| Version | Tamano | PPL (wikitext-2) |
|---|---|---|
| F16 | 2,34 GB | 17,87 ± 0,55 |
| Q4_K_M jang (este modelo) | 0,84 GB | 18,07 ± 0,55 (+1,1 %) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-1,5 GB para los pesos en Q4_K_M/JANG, más el overhead de la ventana de contexto. El archivo ocupa 0,84 GB en disco.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre. Funciona en RTX 3060/4060 y superiores, así como en GPUs integradas modernas. La cuantización se generó en una RTX 4090, pero no es necesario ese hardware para la inferencia.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual e incluso en CPU pura o Apple Silicon.
- Opciones de despliegue: llama.cpp (`llama-server -m ... -ngl 99 --jinja`), Ollama mediante el `Modelfile` incluido, y LLMTray en macOS (aunque para Apple Silicon el autor recomienda la variante MLX, `roman220220/LFM2.5-1.2B-Instruct-gptq-mlx-jang`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks para establecer una comparativa cuantitativa con alternativas de la misma categoría (modelos de ~1-2 B orientados a ejecución local, como la familia Qwen2.5-1.5B, Llama-3.2-1B o Gemma-2-2B). Lo único comparable de forma fiable con la información disponible es la propia variante F16 del mismo modelo:

| Modelo | Parametros | Tamano en disco | PPL wikitext-2 | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Instruct F16 (base) | 1,17 B | 2,34 GB | 17,87 ± 0,55 | LFM Open License v1.0 | safetensors (bf16) |
| Este modelo (GGUF JANG + imatrix) | 1,17 B | 0,84 GB | 18,07 ± 0,55 | LFM Open License v1.0 | GGUF |

Comparativa con otras familias de modelos: no disponible.

## Limitaciones y advertencias

- Este repositorio es una conversión cuantizada de un modelo de terceros: IPSupport LLC no entrenó el modelo y declina toda responsabilidad sobre sus salidas o comportamiento.
- La cuantización introduce una degradación medible de calidad: +1,1 % de perplexity sobre wikitext-2 respecto al F16. En tareas sensibles a la precisión numérica (matemáticas, razonamiento complejo) el efecto podría ser mayor.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; no se documentan mitigaciones específicas.
- Posible fuga de tokens de tool calling como texto plano en Ollama, por la ausencia de un `RENDERER`/`PARSER` dedicado para LFM2. El autor recomienda usar llama.cpp con `--jinja` como alternativa.
- Longitud de contexto e idiomas soportados: no documentados en la información disponible, lo que dificulta planificar despliegues con requisitos concretos de ventana o cobertura lingüística.
- Licencia: LFM Open License v1.0 (etiquetada como "other"). Conviene revisar el archivo `LICENSE` del repositorio antes de un uso comercial, ya que la model card no detalla las condiciones específicas.
- El repositorio tiene 0 descargas y 0 "likes", por lo que no cuenta con validación de la comunidad ni métricas de uso independientes.
- No se ha verificado el rendimiento en producción más allá de la medición de perplexity reportada por el autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/roman220220/LFM2.5-1.2B-Instruct-GGUF-jang-imatrix
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Variante MLX/GPTQ del mismo autor: https://huggingface.co/roman220220/LFM2.5-1.2B-Instruct-gptq-mlx-jang
- LLMTray (aplicación local de IA para macOS): https://www.ipsupport.us/llmtray/
- IPSupport Code: https://ipsupport-llc.github.io/ipsupport-code/
- Repositorio del pipeline de cuantización: https://github.com/rromenskyi/quant-ternary
- Licencia del modelo base: LFM Open License v1.0 (archivo `LICENSE` en el repositorio)
