# dgflash/Kavi-350M

## Resumen

Kavi-350M es un checkpoint de modelo de lenguaje publicado en HuggingFace por el usuario dgflash bajo el identificador `dgflash/Kavi-350M`. El dato objetivo disponible es su recuento de parámetros en safetensors: 336.118.784 (aproximadamente 336 M, coherente con el sufijo comercial "350M"). El repositorio está etiquetado con `llama` y `safetensors`, lo que apunta a un transformer decoder-only con el stack habitual de la familia Llama (atención causal, RoPE, RMSNorm y SwiGLU), aunque no se ha publicado model card, configuración ni tokenizador visibles en la información disponible.

La relevancia potencial del modelo está en su rango de tamaño: los modelos de 300-500 M de parámetros son útiles para inferencia en CPU, despliegue en dispositivos con poca VRAM y fine-tuning con recursos limitados. Sin embargo, la ficha carece de los elementos mínimos para evaluarlo en producción: no hay licencia declarada, no se indican idiomas, no hay pipeline asignado ni resultados de benchmarks, y el repositorio acumula 16 descargas y 0 likes desde su creación el 22 de octubre de 2026.

Hay una discrepancia notable que conviene señalar: un modelo de 336 M de parámetros en fp32 ocuparía alrededor de 1,3 GB, pero el tamaño del repositorio es de 44,4 GB. Eso sugiere que el repo contiene artefactos adicionales (checkpoints intermedios, estados de optimizador o ficheros de entrenamiento), extremo no confirmado por la información disponible y que conviene verificar antes de descargar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | llama (decoder-only transformer, segun tag del repo; configuracion no publicada) |
| Parametros totales | 336.118.784 (safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no se distribuyen versiones cuantizadas; solo pesos safetensors (convertibles a GGUF/AWQ con herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no se declara licencia en la informacion proporcionada) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 44,4 GB |
| Descargas / likes | 16 / 0 |
| Pipeline declarado | no disponible |
| Fecha de creacion / actualizacion | 2026-10-22 / 2026-10-23 |

## Arquitectura y entrenamiento

La única información arquitectónica disponible es la etiqueta `llama` del repositorio, que sitúa al modelo en la familia de transformers decoder-only con atención causal. Por el recuento de parámetros (336 M) se trata de un modelo pequeño, del orden de los que se entrenan desde cero sobre corpus de entre 1 y 6 billones de tokens en configuraciones recientes, aunque no hay ningún dato publicado sobre el volumen de tokens, la composición del dataset, el tokenizador, el tamaño de vocabulario ni el uso de RLHF, DPO o ajuste por instrucciones. Tampoco se documenta ninguna innovación técnica (atención lineal, decodificación especulativa, Mixture of Experts o arquitecturas híbridas SSM).

No se dispone de información sobre el proceso de entrenamiento, hiperparámetros, precisión utilizada (fp16/bf16/fp32) ni sobre si existe una versión base diferenciada de una versión instruct. Cualquier afirmación sobre estas cuestiones sería especulativa y debe verificarse consultando directamente los ficheros `config.json`, `tokenizer_config.json` y el resto de artefactos del repositorio.

## Capacidades

No se ha publicado ninguna descripción de capacidades en la información disponible. A partir del tag `llama` y del tamaño, las capacidades esperables (todas pendientes de verificación empírica) son:

- Generación de texto autoregresiva en el marco de un transformer decoder-only.
- Razonamiento básico de un solo turno, limitado por el tamaño del modelo (336 M), con esperable degradación en tareas multi-paso.
- Generación de código y matemáticas muy limitada en comparación con modelos de 1-7 B; no hay evidencia publicada al respecto.
- Soporte de tool calling / function calling: no disponible, no documentado.
- Capacidades de agente y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Prototipado de pipelines de generación de texto: sirve como sustituto ligero en fases de desarrollo donde se quiere validar la fontanería (tokenización, streaming, plantillas de prompt) sin consumir GPU de gama alta, dado su tamaño de 336 M.
- Inferencia en CPU o dispositivos de borde: con cuantización a 4 bits el modelo ocuparía del orden de 200-250 MB, lo que permite ejecutarlo en portátiles, Raspberry Pi de gama alta o navegador mediante llama.cpp/WASM, siempre que la licencia lo permita.
- Base para fine-tuning académico: su tamaño permite ajuste completo o LoRA en una única GPU consumer (RTX 3060 12 GB o similar), lo que lo hace útil como banco de pruebas de metodologías de entrenamiento.
- Tareas de clasificación y etiquetado por generación: adaptado con un pequeño conjunto de ejemplos, puede emplearse para categorización de textos cortos, análisis de sentimiento o extracción de campos simples, con validación manual obligatoria por la ausencia de benchmarks.
- Enrutado o pre-filtrado en sistemas multi-modelo: como clasificador previo que decida si una consulta requiere un modelo mayor, reduciendo coste por petición en arquitecturas de cascada.
- Pruebas de infraestructura y benchmarking interno: útil para medir latencia y throughput de un stack de despliegue (vLLM, TGI, llama.cpp) antes de mover modelos de mayor tamaño.
- Experimentación educativa: análisis de atención, embeddings y comportamiento de un transformer pequeño con pesos abiertos en formato safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K, HellaSwag ni de ninguna otra evaluación en la información proporcionada, por lo que no se presenta tabla comparativa de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir del recuento de parámetros, no de mediciones publicadas): fp32 en torno a 1,3-1,5 GB; fp16/bf16 en torno a 0,7-0,9 GB; int8 en torno a 0,35-0,5 GB; 4 bits en torno a 0,2-0,35 GB. Hay que sumar la caché KV, cuyo tamaño depende de la longitud de contexto, que no está documentada.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Una RTX 3060 12 GB, RTX 4060 Ti o RTX 4090 pueden ejecutar el modelo en fp16 con margen amplio; una GTX 1650 4 GB basta en 4 u 8 bits. Para lotes grandes o contexto largo, A100/H100 no son necesarias por tamaño, pero sí útiles para throughput agregado.
- Cabe en GPU consumer: sí, con holgura, en todas las GPU con 4 GB o más de VRAM; también en CPU con RAM convencional.
- Opciones de despliegue: llama.cpp y Ollama (previa conversión de los safetensors a GGUF), vLLM y TGI (si la arquitectura es compatible con los loaders de Llama estándar), transformers con `AutoModelForCausalLM`. La falta de `config.json` verificable en la información disponible impide confirmar la compatibilidad directa con estos frameworks.
- Latencia y throughput: no se conocen datos medidos. Como referencia de orden de magnitud, un modelo de 336 M en fp16 sobre una RTX 4090 suele generar decenas o cientos de tokens por segundo, pero es una estimación teórica no verificada para este checkpoint.
- Almacenamiento: el repositorio ocupa 44,4 GB, muy por encima de lo que requieren los pesos de un modelo de 336 M, por lo que la descarga completa puede ser costosa; conviene descargar solo los ficheros de pesos necesarios.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de sus model cards públicas y deben verificarse en el momento de la evaluación; los de Kavi-350M son los únicos confirmados en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kavi-350M (dgflash) | 336 M | no disponible | no disponible | HuggingFace, safetensors, 16 descargas | Sin model card ni benchmarks publicados |
| SmolLM2-360M (HuggingFaceTB) | ~362 M | 8.192 tokens (segun model card) | Apache 2.0 | Amplia, con versiones GGUF y documentacion | Entrenado sobre billones de tokens, benchmarks publicados |
| Qwen2.5-0.5B (Alibaba) | ~0,49 B | 32.768 tokens (segun model card) | Apache 2.0 | Muy amplia, multiples cuantizaciones | Multilingue declarado, soporte de tool calling en variantes mayores |
| TinyLlama-1.1B | ~1,1 B | 2.048 tokens (segun model card) | Apache 2.0 | Muy amplia, ecosistema consolidado | Entrenado sobre ~3 billones de tokens |

Frente a estas alternativas, Kavi-350M no aporta por ahora ninguna ventaja verificable: carece de licencia declarada, de idiomas declarados y de evaluaciones publicadas, mientras que sus competidores directos en el rango 300 M-1 B ofrecen licencias permisivas y documentación completa.

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin un fichero LICENSE explícito, el uso comercial es jurídicamente indeterminado. No debe desplegarse en producción sin aclarar este punto con el autor.
- Sin model card: se desconoce la composición del dataset de entrenamiento, lo que impide evaluar sesgos, contaminación de benchmarks o presencia de contenido con derechos de autor.
- Riesgo de alucinación elevado: en modelos de ~336 M la tasa de afirmaciones incorrectas y de incoherencia en generaciones largas es alta, incluso con ajuste por instrucciones.
- Contexto desconocido: si el modelo se entrenó con ventanas cortas (2.048 tokens o menos, habitual en este rango), el rendimiento se degradará en documentos largos y conversaciones multi-turno.
- Idiomas no declarados: no hay garantía de competencia en castellano; es probable que el modelo esté dominado por el inglés si el corpus de entrenamiento no se documenta.
- Sin benchmarks: no existe evidencia pública de calidad, lo que impide compararlo de forma rigurosa con alternativas.
- Madurez del repositorio: 16 descargas y 0 likes indican un modelo sin validación por parte de la comunidad; no hay issues ni discusiones que aporten contexto.
- Tamaño del repositorio desproporcionado (44,4 GB para 336 M de parámetros): puede incluir checkpoints u otros artefactos no deseados; verificar el contenido antes de descargar y considerar el coste de ancho de banda.
- Compatibilidad incierta: si los tensores no siguen exactamente la convención de pesos de Llama o falta la configuración, los loaders estándar (transformers, vLLM, llama.cpp) pueden fallar al cargar el modelo.
- Capacidades limitadas por tamaño: no es adecuado para razonamiento complejo, matemáticas avanzadas, generación de código en producción ni tareas de agente multi-paso sin un modelo mayor en la cadena.

## Enlaces

- HuggingFace: https://huggingface.co/dgflash/Kavi-350M
- No se han encontrado en la informacion disponible papers, blogs tecnicos, repositorios de codigo ni demos asociados al modelo.
