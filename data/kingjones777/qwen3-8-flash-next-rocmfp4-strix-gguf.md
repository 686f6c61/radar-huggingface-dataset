# kingjones777/Qwen3.8-Flash-Next-ROCmFP4-STRIX-GGUF

## Resumen

Qwen3.8-Flash-Next-ROCmFP4-STRIX-GGUF es una cuantizacion en formato GGUF del modelo Qwen3.8-Flash-Next, un modelo de lenguaje multimodal de tipo Mixture of Experts (MoE) desarrollado por el equipo Qwen. Esta variante concreta ha sido creada por el usuario kingjones777 y esta optimizada para hardware AMD Strix Halo (gfx1151) con memoria unificada, empleando el formato de cuantizacion ROCmFP4 en su calidad "STRIX", que prioriza la fidelidad de los embeddings por capa (PLE) a costa de un mayor tamano de archivo (113.5 GiB) y menor velocidad de generacion.

El modelo base Qwen3.8-Flash-Next se basa en la nueva arquitectura Qwen4, con atencion hibrida GDN + QSA y soporte multimodal (vision), con una ventana de contexto de 262.000 tokens. Esta cuantizacion especifica reduce los pesos a una media de 5.5 bits por peso, manteniendo la tabla de embeddings por capa en Q8_0 (48.8 GiB) y la cabeza de salida en Q6_K para minimizar el error de cuantizacion en la generacion. Requiere un fork de llama.cpp (ROCmFPX) con soporte para la arquitectura qwen4exp y los tipos de tensor Q4_0_ROCMFP4.

La relevancia de esta ficha radica en que es una de las pocas opciones para ejecutar un modelo de 176.000 millones de parametros en un sistema unificado de AMD con 128 GB de RAM, aunque su despliegue es complejo y requiere hardware especifico. No hay informacion publicada sobre benchmarks estandarizados, pero el autor reporta una velocidad de generacion de 14.5 tokens por segundo en su sistema de pruebas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida con atencion GDN + QSA (Qwen4) |
| Parametros totales | 176.943.899.520 (safetensors) |
| Parametros activos | 125B (segun documentacion externa, no confirmado por el autor) |
| Longitud de contexto | 262.000 tokens (segun documentacion externa) |
| Tipos de cuantizacion | Q4_0_ROCMFP4_STRIX (5.5 bpw); tambien variantes FAST y LEAN en el mismo repositorio |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (un solo archivo de 113.5 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next, desarrollado por Qwen, introduce una arquitectura Qwen4 con atencion hibrida GDN (Grouped Decoding Attention) y QSA (Quadratic Sparse Attention), junto con mejoras en los residuales, embeddings y optimizacion del entrenamiento. Es un modelo MoE con 176.9B parametros totales y aproximadamente 125B activos, disenado para soportar multimodalidad (texto e imagenes) y razonamiento avanzado con una ventana de contexto de 262K tokens.

La cuantizacion ROCmFP4 es una tecnica de precision mixta de 4 bits optimizada para la plataforma ROCm de AMD. En la variante STRIX, la tabla de embeddings por capa (PLE) se mantiene en Q8_0 (48.8 GiB), mientras que los pesos de atencion y los expertos MoE usan Q4_0_ROCMFP4. La cabeza de salida y los embeddings de tokens se cuantizan en Q6_K. El autor indica que los pesos se obtuvieron mediante una conversion BF16 directa de los pesos oficiales de Qwen. No se dispone de informacion sobre los datos de entrenamiento del modelo base (tokens, dataset, tecnicas de RLHF o DPO).

## Capacidades

- Generacion de texto y razonamiento complejo, incluyendo tareas de matematicas, codigo y analisis logico.
- Comprension multimodal: soporta entrada de imagenes junto con texto, segun la documentacion del modelo base.
- Ventana de contexto extendida de 262K tokens, lo que permite procesar documentos largos o conversaciones de muchas vueltas.
- No se ha confirmado soporte de tool calling, function calling ni agentes en la informacion disponible.
- Capacidades multilingues no documentadas en la model card, aunque el modelo base de Qwen suele ser multilingue.

## Casos de uso

- **Analisis de documentos extensos**: gracias a la ventana de 262K tokens, puede resumir o extraer informacion de informes, libros o legislacion completa en una sola pasada.
- **Asistencia multimodal**: puede responder preguntas sobre imagenes o diagramas combinados con contexto textual, util en diagnostico por imagen, diseno o educacion.
- **Generacion de codigo en entornos AMD**: al ejecutarse de forma local en hardware Strix Halo, puede usarse como asistente de programacion sin enviar datos a la nube, manteniendo privacidad.
- **Investigacion academica**: permite experimentar con modelos de gran tamano en un solo equipo, sin necesidad de clústeres multi-GPU.
- **Procesamiento de logs y trazas**: la memoria unificada de 128 GB permite cargar el modelo completo y procesar grandes volumenes de datos de registro.
- **Sistemas de agente con razonamiento largo**: aunque no se confirma tool calling, su capacidad de razonamiento y contexto extenso permite cadenas de pensamiento complejas en tareas de planificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor reporta mediciones de rendimiento de inferencia en su equipo de pruebas:

| Metrica | Valor |
|---|---|
| Velocidad de generacion | 14.5 tokens/s (stream unico, greedy) |
| Procesamiento de prompt | no medido |
| Capas descargadas a GPU | 49/49 con `-ngl 999` |
| Hardware de prueba | Ryzen AI MAX+ 395 (gfx1151, Radeon 8060S, ROCm 7.2.4) |

Estas cifras son puntuales y dependen de la configuracion exacta del sistema.

## Requisitos de hardware

- **VRAM estimada**: aproximadamente 115 GiB libres para cargar el modelo completo. No cabe en GPU de consumo (por ejemplo, RTX 4090 con 24 GB).
- **GPU recomendada**: AMD Ryzen AI MAX+ 395 (gfx1151) con 128 GB de memoria unificada. Tambien compatible con otros Strix Halo con memoria suficiente.
- **Software**: requiere un fork de llama.cpp llamado ROCmFPX (PR #27742) compilado con `-DGGML_HIP=ON -DGPU_TARGETS=gfx1151 -DGGML_NATIVE=ON`. No funciona con builds estandar.
- **Sistema operativo**: ROCm 7.2.4 o superior.
- **Opciones de despliegue**: `llama-server` del fork ROCmFPX, con parametros como `--n-gpu-layers 999`, `--ctx-size 2048`, `--threads 16`, `--jinja`.
- **Latencia y throughput**: 14.5 tokens/s en generacion (medido en el hardware del autor). No hay datos de prompt processing.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos de la misma categoria en la informacion proporcionada. Se puede comparar con las otras variantes de cuantizacion del mismo repositorio:

| Variante | Tipo de cuantizacion | Tamano | Velocidad |
|---|---|---|---|
| ROCmFP4-STRIX | Q4_0_ROCMFP4 + PLE Q8_0 + Q6_K | 113.5 GiB | 14.5 tok/s |
| ROCmFP4-STRIX_LEAN | no especificado | no disponible | no disponible |
| ROCmFP4-FAST (mencionado) | no especificado | no disponible | no disponible |

No se han encontrado datos de otros modelos comparables (por ejemplo, Llama 3.1 405B o DeepSeek V3) en la informacion suministrada.

## Limitaciones y advertencias

- **Requisito de software especifico**: los archivos no cargan en builds estandar de llama.cpp; es obligatorio usar el fork ROCmFPX con el parche de la arquitectura `qwen4exp`.
- **Hardware muy restringido**: solo funciona en GPUs AMD con arquitectura gfx1151 (Strix Halo) y con memoria unificada de al menos 128 GB. No es portable a NVIDIA ni a otras arquitecturas AMD.
- **Tamano del archivo**: 113.5 GB, no shardable en archivos menores de 54.4 GB debido al tensor PLE. Puede ser problematico para descarga o almacenamiento.
- **Rendimiento limitado**: 14.5 tokens/s es una velocidad baja para interaccion en tiempo real; no apto para aplicaciones de alta demanda.
- **Licencia**: qwen-community-1.0 - debe revisarse si permite uso comercial y derivados; la cuantizacion es de un tercero y la licencia del modelo base puede tener restricciones.
- **Sesgos y alucinaciones**: no hay datos sobre sesgos especificos; como todo LLM, existe riesgo de alucinacion y errores factuales, especialmente en tareas de razonamiento complejo.

## Enlaces

- Repositorio HuggingFace: [Qwen3.8-Flash-Next-ROCmFP4-STRIX-GGUF](https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-ROCmFP4-STRIX-GGUF)
- Repositorio del modelo base en GitHub: [QwenLM/Qwen3.8-Flash-Next](https://github.com/QwenLM/Qwen3.8-Flash-Next/)
- Documentacion de unsloth: [Qwen3.8-Flash-Next: How to Run Locally](https://unsloth.ai/docs/models/qwen3.8-next)
- Repositorio con variante LEAN: [Qwen3.8-Flash-Next-ROCmFP4-STRIX_LEAN-GGUF](https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-ROCmFP4-STRIX_LEAN-GGUF)
