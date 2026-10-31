# bartowski/cosmicstack_cosmic-lightning-GGUF

## Resumen

Cosmic Lightning es un modelo de lenguaje de aproximadamente 2.000 millones de parámetros (1.728.801.600 parámetros exactos según los metadatos de safetensors) desarrollado por cosmicstack, del cual bartowski ha publicado esta colección de cuantizaciones en formato GGUF mediante el método imatrix de llama.cpp. Se trata de un modelo conversacional orientado a seguir instrucciones, con soporte de razonamiento mediante etiquetas `<think>` y definición de herramientas en el prompt del sistema, lo que lo habilita para escenarios de agentes y function calling.

Su relevancia radica en el tamaño: al rondar los 2B de parámetros, puede ejecutarse de forma local en GPUs de consumo e incluso en CPUs, con archivos cuantizados que van desde los 0,93 GB (IQ3_M) hasta los 3,47 GB (bf16). La licencia Apache 2.0 del modelo base permite su uso comercial sin restricciones significativas, lo que lo convierte en un candidato interesante para despliegues ligeros de asistentes, generación de código y resumen de textos, especialmente en inglés, único idioma documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer de texto, formato ChatML con etiquetas `<think>`) |
| Parametros totales | 1.728.801.600 (~1,73B; el autor indica 2B como checkpoint de origen) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_0, Q4_K_S, IQ4_XS, IQ3_M (y posiblemente más; el repo ocupa 26,6 GB) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con llama.cpp release b11969, método imatrix); modelo base en safetensors |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del modelo (tipo de transformer, número de capas, cabezales de atención o técnica de atención empleada). Lo que sí queda documentado es el formato de prompt: utiliza plantilla estilo ChatML con tokens `<|im_start|>` y `<|im_end|>`, un token `<|startoftext|>` inicial y apertura de bloque `<think>` para el razonamiento, patrón habitual en modelos entrenados con razonamiento intermedio tipo "thinking mode". El autor confirma que el modelo no emplea decodificación especulativa y que las cuantizaciones se han calibrado con matriz de importancia (imatrix).

Sobre el proceso de entrenamiento del modelo original no hay datos publicados en la información disponible: no se conocen el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron técnicas de alineación como RLHF o DPO. La cuantización de bartowski se realizó con llama.cpp release b11969, generando versiones desde IQ3_M hasta bf16 con calibración imatrix para preservar la calidad en los niveles bajos.

## Capacidades

- Generación de texto conversacional con seguimiento de instrucciones (tag instruction-following).
- Razonamiento paso a paso mediante bloque `<think>` en el formato de prompt.
- Generación de código (el propio widget incluye un ejemplo de función Python para invertir una cadena).
- Resumen de textos (ejemplo de summarization en el widget).
- Tool calling: el formato de prompt admite definiciones de herramientas en JSON dentro del system prompt (ejemplo con `get_stock_price`), aunque la model card no documenta un parser específico de llamadas.
- Soporte de entrada exclusivamente textual; sin capacidades de visión ni audio documentadas.
- Sin decodificación especulativa según el autor.
- Idioma documentado: inglés.

## Casos de uso

- **Asistentes conversacionales ligeros**: con un archivo de 1,12 GB en Q4_K_M, puede servir como base de un chatbot local que responde preguntas generales y sigue instrucciones sin depender de APIs externas.
- **Generación de código asistida en el editor**: su tamaño reducido permite integrarlo en herramientas de autocompletado o generación de funciones Python y otros lenguajes, ejecutándose en una GPU de consumo o incluso en portátiles.
- **Resumen de documentos**: el widget incluye un ejemplo de summarization; resulta adecuado para resumir artículos o informes en inglés en flujos de trabajo locales con privacidad garantizada.
- **Agentes con function calling**: el formato de prompt admite herramientas definidas en JSON, lo que permite construir agentes simples que consulten APIs (precios de acciones, clima, bases de datos) en bucles de razonamiento multi-paso con el bloque `<think>`.
- **Despliegue en edge y dispositivos con recursos limitados**: con cuantizaciones IQ3_M de 0,93 GB, es viable en mini-PCs, Raspberry Pi de gama alta o móviles mediante llama.cpp.
- **Prototipado rápido de pipelines de LLM**: la licencia Apache 2.0 y el tamaño contenido permiten experimentar con fine-tuning posterior (LoRA) y despliegue sin costes de licencia ni de infraestructura significativos.
- **Procesamiento por lotes de texto en CPU**: para tareas como clasificación, extracción o reescritura masiva de textos, el rendimiento en CPU con GGUF es suficiente dado el tamaño del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM/CPU RAM estimada para inferencia**: aproximadamente 1,2 GB para Q4_K_M (más contexto), 1,85 GB para Q8_0 y 3,47 GB para bf16; añadir 0,5-2 GB adicionales según la ventana de contexto utilizada. Al no documentarse la longitud de contexto, la sobrecarga del KV cache es incierta.
- **GPUs recomendadas**: cualquier GPU moderna con 4 GB de VRAM o más ejecuta cómodamente las cuantizaciones Q4-Q8 (RTX 3060, RTX 4060, RTX 4090 sobradamente). No se necesitan A100 ni H100.
- **Consumer GPUs**: cabe sin problemas en GPUs de 4-6 GB en cuantizaciones Q4/IQ4; incluso en GPUs de 3 GB con IQ3_M. También es plenamente ejecutable en CPU pura dado su tamaño.
- **Opciones de despliegue**: llama.cpp (formato nativo de estos archivos), Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. No se documentan conversiones para vLLM o TGI en este repo (el modelo base en safetensors sí podría adaptarse).
- **Latencia y throughput**: no disponibles; por su tamaño (~2B), es de esperar velocidades superiores a 30-60 tokens/s en GPU de consumo y varios tokens/s en CPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| cosmic-lightning (este modelo) | ~1,73B | no disponible | Apache 2.0 | Formato ChatML, bloque `<think>`, tool calling en prompt |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 / Qwen (parcial) | Multilingüe amplio, benchmarks publicados |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Ecosistema amplio, restricciones de licencia específicas |
| Gemma-2-2B-it | 2,6B | 8.192 tokens | Gemma Terms of Use | Buen rendimiento para su tamaño, licencia restrictiva |

Cosmic Lightning destaca frente a estas alternativas por su licencia Apache 2.0 sin condiciones adicionales y su soporte nativo de razonamiento `<think>` en un tamaño muy pequeño, aunque carece de benchmarks públicos y de la ventana de contexto extendida de Llama 3.2.

## Limitaciones y advertencias

- Documentación muy escasa: no se publican benchmarks, longitud de contexto, arquitectura detallada ni datos de entrenamiento, lo que dificulta evaluar su calidad de forma objetiva antes de desplegarlo.
- Idioma: solo se documenta soporte para inglés; el rendimiento en castellano u otros idiomas es desconocido y probablemente inferior.
- Riesgo de alucinación: como cualquier modelo de ~2B, la tasa de alucinaciones en tareas de conocimiento factual será alta; no es adecuado como fuente de verdad sin verificación externa.
- Sesgos: no hay auditoría de sesgos publicada; asúmase la presencia de sesgos típicos de datos de preentrenamiento web.
- Tool calling: el formato admite definiciones de herramientas, pero no se documenta un mecanismo robusto de parseo de llamadas; requerirá validación y parsing propios en producción.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la model card del modelo original (cosmicstack/cosmic-lightning) por si existieran avisos adicionales.
- Las cuantizaciones IQ3_M y similares pueden degradar notablemente la calidad de razonamiento y código; se recomienda Q4_K_M o superior para uso serio.
- Repo reciente (creado en 2026) con pocas descargas (1.252) y validación comunitaria limitada.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/bartowski/cosmicstack_cosmic-lightning-GGUF
- Modelo original: https://huggingface.co/cosmicstack/cosmic-lightning
- llama.cpp (herramienta de cuantización): https://github.com/ggml-org/llama.cpp/
- Release de llama.cpp usada (b11969): https://github.com/ggml-org/llama.cpp/releases/tag/b11969
- Cuantización recomendada (Q4_K_M): https://huggingface.co/bartowski/cosmicstack_cosmic-lightning-GGUF/blob/main/cosmicstack_cosmic-lightning-Q4_K_M.gguf
