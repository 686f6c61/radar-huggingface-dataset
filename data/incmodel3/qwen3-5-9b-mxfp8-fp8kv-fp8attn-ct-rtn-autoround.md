# INCModel3/Qwen3.5-9B-MXFP8-FP8KV-FP8Attn-CT-RTN-AutoRound

## Resumen

Qwen3.5-9B-MXFP8-FP8KV-FP8Attn-CT-RTN-AutoRound es una versión cuantizada del modelo Qwen/Qwen3.5-9B publicada por el usuario INCModel3 en Hugging Face. La model card es mínima: se limita a indicar que se trata de una cuantización en esquema MXFP8 generada con AutoRound, la herramienta de cuantización de Intel, y a remitir a la licencia del modelo original.

El interés técnico del artefacto es doble. Por un lado, aplica cuantización de 8 bits con escalas microscópicas (MXFP8) sobre los pesos y FP8 sobre la caché KV y la atención, lo que reduce la huella de memoria aproximadamente a la mitad frente a BF16 sin bajar a 4 bits. Por otro, se empaqueta en formato compressed-tensors y combina los algoritmos RTN y AutoRound, lo que lo hace cargable directamente en motores de inferencia que soportan este formato.

A fecha de la información disponible es un artefacto sin tracción: cero descargas y cero likes desde su publicación el 13 de septiembre de 2026, sin licencia declarada ni idiomas documentados. Existe además una discrepancia relevante sin aclarar: el nombre indica 9B parámetros, mientras que el recuento de safetensors registrado es de 2.497.600.776 parámetros (~2,50B), si bien el tamaño del repositorio (12,6 GB) es coherente con el primer valor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), cuantizado; los detalles concretos de la arquitectura base no están disponibles en la información proporcionada |
| Parámetros totales | 2.497.600.776 según el recuento de safetensors (~2,50B); el nombre del repositorio indica 9B. Discrepancia no aclarada por el autor |
| Parámetros activos | no aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP8 en pesos (formato OCP MX: elementos FP8 con escala compartida por bloque, típicamente E4M3 con exponente compartido E8M0 cada 32 elementos); FP8 en caché KV; FP8 en atención; algoritmos RTN y AutoRound; contenedor compressed-tensors |
| Idiomas soportados | no disponibles (no declarados en la ficha) |
| Licencia | no disponible en el repositorio; el autor remite a la licencia del modelo original Qwen/Qwen3.5-9B |
| Formato de pesos | safetensors con compressed-tensors |
| Modelo base | Qwen/Qwen3.5-9B |
| Pipeline | text-generation |
| Tamaño del repositorio | 12,6 GB |
| Fecha de publicación | 13 de septiembre de 2026 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura del modelo base Qwen3.5-9B ni sus datos de entrenamiento (número de tokens, composición del dataset, si hubo RLHF, DPO u otras fases de alineamiento). Todo lo que se puede afirmar con rigor es que se trata de un transformer decoder-only de la familia Qwen3.5 y que este repositorio no entrena el modelo, sino que lo cuantiza.

La innovación técnica del artefacto está, por tanto, en la cadena de cuantización. Los pesos se almacenan en MXFP8, un formato de la especificación OCP MicroScaling en el que los valores se agrupan en bloques (habitualmente de 32 elementos) que comparten un exponente de escala, lo que reduce el error de cuantización respecto a un escalado por tensor completo. La caché KV y la atención también se cuantizan a FP8, de modo que tanto el peso como el estado de inferencia se sirven en 8 bits. El pipeline combina RTN (round-to-nearest, cuantización directa sin ajuste) con AutoRound, el algoritmo de Intel basado en descenso de gradiente de signo que ajusta los valores redondeados para minimizar el error de reconstrucción de la salida. La evaluación y el autoajuste se realizaron con autoquant-agent, según la propia model card.

## Capacidades

- Generación de texto: capacidad confirmada por el pipeline declarado (text-generation) y por la etiqueta conversational.
- Conversación multi-turno: la etiqueta conversational indica que el modelo base está orientado a diálogo; la plantilla de chat concreta no está documentada en la ficha.
- Razonamiento matemático: el resultado declarado de GSM8K (0,9310) indica competencia alta en problemas aritméticos de varios pasos.
- Conocimiento general y cultural: MMLU de 0,7833 en el informe del autor.
- Razonamiento físico y de sentido común: PIQA (0,7916) y HellaSwag (0,5825) en el informe del autor.
- Inferencia en 8 bits: los pesos MXFP8, la caché KV en FP8 y la atención en FP8 permiten servir el modelo con la mitad de memoria que en BF16 conservando la estructura del modelo original.
- Tool calling, function calling, modo thinking, agentes multi-paso, visión, audio y capacidades multilingües: no documentados en la información disponible.

## Casos de uso

- Servicio de asistente conversacional en producción: al almacenar pesos, caché KV y atención en 8 bits, el modelo reduce a la mitad la VRAM necesaria frente a BF16, lo que permite atender conversaciones con una sola GPU de gama alta de consumo en lugar de requerir un nodo multi-GPU.
- Razonamiento matemático asistido: con un GSM8K de 0,9310 declarado, es adecuado para tutores automáticos, verificación de cálculos en hojas de cálculo y resolución de problemas aritméticos de varios pasos integrados en herramientas de negocio.
- Evaluación y benchmarking de pipelines de cuantización: al combinar RTN y AutoRound sobre el mismo modelo base, sirve como artefacto de referencia para medir la pérdida de precisión de cada método frente a BF16 en las mismas cuatro tareas (GSM8K, MMLU, PIQA, HellaSwag).
- Pruebas de kernels FP8 en infraestructura nueva: útil para validar el rendimiento real de kernels MXFP8 y FP8 KV en vLLM, SGLang o TensorRT-LLM antes de migrar cargas mayores al mismo stack.
- Generación de documentación técnica y resúmenes: el pipeline text-generation con conocimiento general (MMLU 0,7833) permite redactar borradores, resumir documentación interna y normalizar textos dentro de un pipeline por lotes.
- Clasificación y enrutado de consultas en un sistema mayor: como modelo pequeño en 8 bits, puede actuar como clasificador o router de intenciones delante de un modelo mayor, ocupando una fracción de la VRAM.
- Sustitución del modelo base en clústeres con memoria limitada: donde el BF16 no cabe por GPU, esta versión permite mantener el mismo modelo base reduciendo el número de GPUs por réplica.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Benchmark | Puntuación |
|---|---|
| GSM8K | 0,9310 |
| MMLU | 0,7833 |
| PIQA | 0,7916 |
| HellaSwag | 0,5825 |

Advertencias sobre estos datos: no se especifica si corresponden al modelo cuantizado o al modelo base sin cuantizar, ni el número de ejemplos, el modo (0-shot o few-shot) ni la configuración de muestreo. HellaSwag (0,5825) queda muy por debajo de MMLU y GSM8K del mismo informe, lo que sugiere una configuración de evaluación distinta (probablemente 0-shot) o una degradación específica en esa tarea. No se han publicado resultados de benchmarks comparativos frente a otras cuantizaciones del mismo modelo base en la información disponible.

## Requisitos de hardware

- VRAM de pesos: aproximadamente 1 byte por parámetro en MXFP8. Si el modelo tiene 9B parámetros, unos 9 GB de pesos; si el recuento de safetensors (2,50B) fuese el correcto, unos 2,5 GB. El tamaño del repositorio (12,6 GB) apunta al escenario de ~9B.
- VRAM total estimada: en el escenario de 9B, alrededor de 10-12 GB con caché KV en FP8 y contextos moderados, y más de 20 GB con contextos muy largos o lotes grandes. La longitud de contexto no está documentada, por lo que no se puede dar una cifra cerrada de caché KV.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) con margen, y en RTX 5090. En GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo con contextos cortos y lotes pequeños. En el escenario de 2,50B cabría incluso en GPUs de 8-12 GB.
- GPU de centro de datos: A100 40/80 GB, H100 80 GB y L40S 48 GB sin problemas. Los kernels MXFP8 nativos están pensados para arquitecturas Blackwell (B200, RTX 50); en Hopper y Ada se recurre a rutas FP8 equivalentes.
- Opciones de despliegue: vLLM y SGLang, que soportan compressed-tensors y caché KV en FP8; TensorRT-LLM; TGI si la versión en uso soporta compressed-tensors. llama.cpp y Ollama no cargan MXFP8 en formato compressed-tensors, por lo que requerirían una conversión previa a GGUF (que este repositorio no incluye).
- Latencia y throughput: no disponibles. No hay datos de tokens por segundo ni de latencia por petición en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de alternativas en la información proporcionada, por lo que la comparación cuantitativa no puede realizarse. La tabla recoge únicamente lo que consta:

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Datos publicados |
|---|---|---|---|---|---|
| Este repositorio | 2,50B (safetensors) / 9B (nombre) | MXFP8 + FP8 KV + FP8 atención | no disponible | no disponible | GSM8K 0,9310; MMLU 0,7833; PIQA 0,7916; HellaSwag 0,5825 |
| Qwen/Qwen3.5-9B (base) | no disponible | no disponible (presumiblemente BF16) | no disponible | no disponible | no disponible |
| Otras cuantizaciones de 8 bits de modelos ~9B | no disponible | no disponible | no disponible | no disponible | no disponible |

Para una comparación útil habría que contrastar este artefacto con el modelo base en BF16 y con cuantizaciones INT8/W8A8 o FP8 por tensor del mismo Qwen3.5-9B. Ninguno de esos datos está disponible aquí.

## Limitaciones y advertencias

- Repositorio sin validación comunitaria: cero descargas y cero likes desde su publicación, lo que implica que no ha sido probado de forma independiente.
- Discrepancia de parámetros sin resolver: el nombre declara 9B y el recuento de safetensors registrado es de 2.497.600.776 (~2,50B). Hay que verificar el número real de parámetros antes de dimensionar hardware o presupuestar latencia.
- Licencia no declarada: el autor remite a la licencia del modelo original, pero el texto no está incluido. Es imprescindible consultar la licencia de Qwen/Qwen3.5-9B antes de cualquier uso comercial.
- Idiomas no documentados: no consta qué lenguas soporta ni con qué calidad, lo que impide asumir un rendimiento concreto en castellano.
- Contexto no documentado: se desconoce la ventana máxima, dato crítico para decidir si sirve para documentos largos.
- Metodología de evaluación opaca: no se indica si los benchmarks corresponden al modelo cuantizado o al base, ni el número de shots. La caída relativa de HellaSwag frente al resto de métricas no está explicada.
- Riesgo de degradación por cuantización: la combinación MXFP8 en pesos con FP8 en caché KV y atención puede degradar tareas sensibles a la precisión numérica. No hay comparación publicada contra el modelo en BF16.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala. No hay datos de verificación factual ni de tasas de error en dominios abiertos.
- Compatibilidad restringida de runtime: al usar compressed-tensors con MXFP8, no es cargable en llama.cpp u Ollama sin conversión a GGUF, y requiere versiones de vLLM/SGLang/TensorRT-LLM con soporte de MXFP8 y FP8 KV.
- Sin documentación de tool calling ni plantilla de chat: si el pipeline de destino depende de function calling o de un formato de prompt concreto, habrá que validarlo empíricamente.
- Enlace roto en la model card: la referencia a autoquant-agent apunta a `https://github.com/` sin ruta, por lo que no se puede auditar el proceso de cuantización ni de auto-reparación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/INCModel3/Qwen3.5-9B-MXFP8-FP8KV-FP8Attn-CT-RTN-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- AutoRound (Intel): https://github.com/intel/auto-round
- autoquant-agent: enlace incompleto en la model card (`https://github.com/`), no resoluble
- Resultados de búsqueda web: no aportan enlaces relevantes; devuelven páginas de soporte de Microsoft sin relación con el modelo
