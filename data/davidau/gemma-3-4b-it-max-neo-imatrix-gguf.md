# DavidAU/Gemma-3-4b-it-MAX-NEO-Imatrix-GGUF

## Resumen

Gemma-3-4b-it-MAX-NEO-Imatrix-GGUF es una cuantización GGUF del modelo instructivo Gemma 3 de 4.000 millones de parámetros publicado por Google, preparada por el usuario DavidAU. No se trata de un modelo nuevo entrenado desde cero, sino de una reempaquetación del checkpoint oficial `google/gemma-3-4b-it` con dos modificaciones técnicas: por un lado, la aplicación de una matriz de importancia ("Neo Imatrix") propia del autor para guiar la cuantización; por otro, el mantenimiento de las capas de embedding y de salida en BF16 (precisión completa) en todas las variantes, lo que el autor denomina cuantizaciones "MAXED".

El modelo base es un transformer denso de 3.880.099.328 parámetros con una ventana de contexto de 128.000 tokens, orientado a instrucciones y conversación. Esta versión GGUF está pensada para ejecutarse en llama.cpp y derivados (Ollama, LM Studio, KoboldCpp, etc.), lo que permite desplegarlo en hardware de consumo donde el checkpoint original en safetensors no cabría con comodidad.

Su relevancia práctica radica en que ofrece un abanico amplio de niveles de cuantización (desde IQ1_S hasta Q8_0) con un ajuste fino orientado a preservar la calidad en rangos bajos y medios, algo útil para quienes necesitan equilibrar huella de memoria y fidelidad de salida en equipos modestos. La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 3), decodificador autorregresivo |
| Parametros totales | 3.880.099.328 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, Q2_K_S, IQ2_S, Q2_K, IQ2_M, IQ3_XXS, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, IQ4_NL, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (embedding y output en BF16 en todas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 3 4B Instruct de Google, un transformer denso con decodificador autorregresivo y atención multi-cabeza estándar, entrenado por Google con datos propios no detallados en la información disponible. El alineamiento instructivo del checkpoint original incluye las fases habituales de ajuste supervisado y optimización de preferencias de Google, si bien los detalles concretos (número de tokens, composición del dataset, uso de RLHF/DPO) no se especifican en la documentación consultada.

La contribución de esta ficha no es el entrenamiento sino el proceso de cuantización. DavidAU aplica una "Neo Imatrix", una matriz de importancia construida internamente por el autor que se usa durante la cuantización para asignar más bits a los pesos que más afectan a la salida. Además, todas las variantes mantienen los tensores de embedding y de salida en BF16, lo que incrementa ligeramente el tamaño del archivo pero preserva la fidelidad en esas capas. El autor recomienda IQ3_S/IQ4_XS/IQ4_NL/Q4 para uso creativo y Q5/Q6/Q8 para uso general, y advierte que las cuantizaciones IQ4 producen salidas distintas de las Q e IQ convencionales.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat instructiva.
- Razonamiento y respuesta a instrucciones complejas, con soporte de contexto largo de hasta 128.000 tokens.
- Generación de código y explicaciones técnicas (capacidad heredada del modelo base Gemma 3).
- Comprensión y generación multilingüe (heredada del modelo base; la lista concreta de idiomas no está disponible en esta ficha).
- Modo "thinking" no confirmado explícitamente en la información disponible; el autor ofrece un system prompt opcional con un pseudo-mecanismo de razonamiento paso a paso ("GE FUNCTION") que no es una capacidad nativa del modelo.
- Compatible con endpoints de inferencia estándar (tag `endpoints_compatible` en Hugging Face).
- No se documenta soporte nativo de tool calling, function calling ni visión en esta versión GGUF (aunque el modelo base Gemma 3 es multimodal, esta ficha se centra en el uso de texto vía GGUF).

## Casos de uso

- Asistente conversacional local en equipos de consumo: con cuantizaciones Q4 o Q5 el modelo cabe en GPUs de 8-12 GB y permite mantener diálogos multi-turno con contexto largo, sin depender de la nube.
- Generación de código en el editor: integrado en plugins de VS Code o similares mediante llama.cpp u Ollama, sirve para autocompletado, explicación de fragmentos y refactorización sobre archivos de tamaño medio.
- Resumen y análisis de documentos extensos: los 128.000 tokens de contexto permiten procesar informes, contratos o artículos largos en una sola pasada, especialmente con cuantizaciones Q5/Q6/Q8.
- Chatbot de atención al cliente en prototipos: desplegado con Ollama o llama.cpp en un servidor modesto, gestiona conversaciones multi-turno y consultas frecuentes con baja latencia.
- Generación creativa y escritura asistida: el autor recomienda IQ3_S/IQ4_XS/IQ4_NL para este uso por su comportamiento más "creativo" en las salidas.
- Experimentación e investigación en quantización: útil como caso de estudio para comparar el efecto de la Neo Imatrix y del esquema MAXED frente a cuantizaciones estándar del mismo Gemma 3 4B.
- Inferencia en dispositivos portátiles: las variantes Q4_0/Q5_0 están indicadas por el autor para móviles y dispositivos de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta una velocidad aproximada de 56 tokens por segundo con la cuantización IQ4_XS en una "tarjeta de gama media" no especificada, dato que no constituye un benchmark de calidad.

## Requisitos de hardware

- VRAM estimada (inferencia, aproximada según tamaño del archivo GGUF y overhead de contexto):
  - IQ1_S/IQ2: ~1,5-2 GB.
  - IQ3_S/Q3_K_M: ~2,5-3,5 GB.
  - IQ4_XS/Q4_K_M: ~3-4 GB.
  - Q5_K_M: ~4-5 GB.
  - Q6_K: ~5-6 GB.
  - Q8_0: ~7-8 GB.
  - El contexto largo (hasta 128k tokens) incrementa sustancialmente el consumo de KV cache y puede multiplicar la VRAM necesaria.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para Q5-Q8 con contexto amplio; A100/H100 solo si se necesita servir a muchos usuarios concurrentes.
- Cabe en GPU de consumo: sí, desde GTX 1660 6 GB con cuantizaciones IQ2/IQ3, y con holgura en RTX 3060 12 GB o superiores para Q4-Q8.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui, y servidores compatibles con GGUF (vLLM con soporte GGUF experimental, llama-cpp-python).
- Latencia y throughput: el autor reporta ~56 t/s con IQ4_XS en una GPU de gama media no identificada; no hay datos adicionales de latencia ni de throughput por hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-3-4b-it-MAX-NEO-Imatrix-GGUF (esta ficha) | 3,88 B | 128k | Apache 2.0 | GGUF | Cuantización con Neo Imatrix y capas embed/output en BF16 |
| google/gemma-3-4b-it (original) | 3,88 B | 128k | Apache 2.0 | safetensors | Checkpoint oficial de Google, sin cuantizar |
| Otras cuantizaciones GGUF de Gemma 3 4B (p. ej. las oficiales de ggml-org o bartowski) | 3,88 B | 128k | Apache 2.0 | GGUF | Sin Neo Imatrix ni esquema MAXED; comparables en tamaño por quant |
| Qwen2.5-3B-Instruct | ~3,1 B | 32k | Apache 2.0 | safetensors/GGUF | Alternativa de tamaño similar con contexto menor |

No se dispone de datos de benchmarks comparativos publicados en la información consultada.

## Limitaciones y advertencias

- Al ser una cuantización, la calidad puede degradarse respecto al checkpoint original en BF16, especialmente en IQ1/IQ2; el propio autor califica IQ1 como de rendimiento bajo.
- Las cuantizaciones IQ4 producen salidas distintas de las Q e IQ convencionales, lo que puede complicar la reproducibilidad entre variantes.
- El modelo base Gemma 3 4B, pese a su tamaño contenido, puede alucinar en tareas de conocimiento factual y razonamiento matemático complejo.
- La lista de idiomas soportados no está documentada en esta ficha; se asume la cobertura multilingüe del modelo base, pero no se garantiza un rendimiento uniforme.
- El contexto de 128k tokens es costoso en memoria y puede degradar la calidad en el extremo superior de la ventana.
- El system prompt "GE FUNCTION" propuesto por el autor no es una capacidad nativa del modelo y puede producir respuestas inconsistentes o repetitivas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los términos del modelo base de Google y las obligaciones de atribución.
- El repositorio ocupa 73 GB por incluir todas las cuantizaciones; descargar solo el archivo necesario.
- No se documenta soporte de tool calling ni de visión en esta versión GGUF, aunque el modelo base sea multimodal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Gemma-3-4b-it-MAX-NEO-Imatrix-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Perfil del autor: https://huggingface.co/DavidAU
- Guía de parámetros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Página de soporte/FAQ del autor: https://huggingface.co/DavidAU/support
