# bartowski/beita6969_BaseRSI-27B-GGUF

## Resumen

BaseRSI-27B es un modelo de lenguaje y visión (image-text-to-text) construido sobre la base Qwen3.8-27B, desarrollado por el usuario beita6969 y cuantizado a GGUF por bartowski. El modelo original incorpora, según su model card, ediciones "training-free" (sin reentrenamiento) que lo orientan a tareas de razonamiento con esfuerzo configurable. La versión aquí descrita es la distribución cuantizada en formato GGUF para su uso con llama.cpp, con soporte de imatrix y decodificación especulativa mediante MTP.

El checkpoint fuente declara 28B de parámetros (27.320.697.856 según los safetensors), lo que lo sitúa en la gama de modelos densos de tamaño medio-grande. La licencia es Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales. El pipeline declarado es image-text-to-text, por lo que acepta entradas de imagen y texto siempre que se acompañe del fichero mmproj correspondiente.

Su relevancia actual radica en la combinación de un modelo multimodal de ~27B con una distribución GGUF amplia (desde IQ4 hasta bf16) y soporte de decodificación especulativa, lo que permite desplegarlo en hardware de consumo y en entornos de servidor con llama.cpp. No obstante, se trata de un modelo con escasa tracción pública (0 descargas y 0 likes en el momento del registro) y documentación limitada, por lo que debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B, según model card); multimodal image-text-to-text |
| Parametros totales | 27.320.697.856 (safetensors); 28B declarados en la model card del checkpoint fuente |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL (y variantes IQ adicionales del repo) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones llama.cpp); checkpoint fuente en safetensors |

## Arquitectura y entrenamiento

La model card del checkpoint fuente describe el modelo como un vision-language chat model construido sobre Qwen3.8-27B, con ediciones "training-free" documentadas en su propia card. Esto implica que no se ha realizado un reentrenamiento completo desde cero, sino una modificación del modelo base sin un ciclo de entrenamiento convencional declarado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El dataset referenciado en los metadatos es `beita6969/BaseRSI-Dataset`, pero no se detalla su contenido.

La cuantización GGUF ha sido realizada por bartowski con llama.cpp release b12600, empleando imatrix para mejorar la calidad de las cuantizaciones de baja precisión. El modelo declara soporte de decodificación especulativa mediante MTP (multi-token prediction), lo que puede acelerar la generación en llama.cpp. El prompt format emplea tokens estilo ChatML (`<|im_start|>`, `<|im_end|>`) con un bloque `<think>` para razonamiento explícito y un prefijo de sistema que fija el "reasoning effort" en xhigh.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla ChatML.
- Entrada multimodal de imagen y texto (requiere el fichero mmproj para el componente visual).
- Razonamiento explícito mediante bloque `<think>` con esfuerzo de razonamiento configurable (xhigh en la plantilla por defecto).
- Soporte de tool calling / function calling con formato XML específico (`<tool_call>`, `<function=...>`, `<parameter=...>`).
- Capacidad de razonamiento multi-paso orientada a agentes, según el formato de herramientas documentado.
- Decodificación especulativa (MTP) para acelerar la inferencia en llama.cpp.
- Capacidades multilingües limitadas al inglés según los metadatos del modelo.
- No se documentan capacidades de audio ni de vídeo en la información disponible.

## Casos de uso

- Asistente conversacional con imágenes: el modelo acepta pares imagen-texto y devuelve texto, lo que permite construir interfaces de preguntas y respuestas sobre capturas, diagramas o fotografías, siempre que se cargue el mmproj adecuado en llama.cpp.
- Automatización de soporte técnico con tool calling: el formato de funciones documentado permite invocar APIs externas (por ejemplo, consulta de precios de acciones) desde el propio modelo, integrándolo en flujos de atención al cliente que necesiten datos en tiempo real.
- Agentes multi-paso en local: gracias al bloque `<think>` y al soporte de herramientas, puede orquestar tareas que requieran varios pasos de razonamiento antes de emitir una llamada a función, desplegado con llama.cpp en hardware propio.
- Procesamiento de documentación técnica con imágenes: extracción de información de manuales, planos o gráficos combinando la entrada visual con razonamiento textual, útil en entornos donde no se quiere enviar datos a la nube.
- Prototipado rápido en estaciones de trabajo: la cuantización Q4_K_M (17,33 GB) permite ejecutar el modelo en GPUs de consumo con 24 GB de VRAM, facilitando pruebas de concepto sin infraestructura dedicada.
- Generación de respuestas con razonamiento verificable: el prefijo de sistema que fija "reasoning effort" en xhigh y el bloque `<think>` permiten obtener trazas de razonamiento auditables para tareas de análisis o revisión.
- Despliegue en servidores con llama.cpp y decodificación especulativa: el soporte MTP reduce la latencia en escenarios de generación larga, adecuado para servicios de inferencia autoalojados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17-19 GB con Q4_K_M (17,33 GB de fichero) y Q4_K_L (18,74 GB); en torno a 20-25 GB con Q5_K_M y Q6_K; unos 29 GB con Q8_0; y alrededor de 55 GB con bf16.
- GPU recomendadas: para cuantizaciones Q4/Q5, GPUs de 24 GB como RTX 3090 o RTX 4090; para Q6/Q8, A100 40 GB, H100 o RTX 6000 Ada; para bf16, A100 80 GB o H100 80 GB.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4 (RTX 4090, RTX 3090, y potencialmente GPUs de 16 GB con IQ4_NL o Q4_K_S si se ajusta el contexto).
- Opciones de despliegue: llama.cpp (versión b12600 o superior recomendada por el cuantizador), Ollama, y servidores compatibles con GGUF; el modelo declara `endpoints_compatible`.
- Requiere descargar el fichero mmproj para el soporte de imagen.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el soporte de decodificación especulativa (MTP) puede mejorar el throughput, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BaseRSI-27B (este) | 27,3B | No disponible | Imagen + texto | Apache 2.0 | GGUF en HF (bartowski) |
| Qwen3.8-27B (base declarada) | ~27B | No disponible | Texto (base) | No disponible en esta ficha | Checkpoint original |
| Alternativas de ~27B densos | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo con 0 descargas y 0 likes en el momento del registro: no hay evidencia pública de validación por parte de la comunidad.
- Documentación escasa: la model card del checkpoint fuente no detalla dataset de entrenamiento, número de tokens ni proceso de alineación, lo que dificulta evaluar sesgos y robustez.
- Las "ediciones training-free" no están especificadas en detalle; se desconoce el impacto real sobre el comportamiento del modelo base.
- Riesgo de alucinación inherente a los modelos generativos, agravado por la falta de benchmarks publicados.
- Soporte limitado al inglés según los metadatos; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificarlo empíricamente.
- El soporte de imagen requiere el fichero mmproj; sin él, el modelo funciona solo con texto.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo base cuyas condiciones no se detallan en esta ficha, conviene verificar la licencia del checkpoint original Qwen3.8-27B.
- El formato de tool calling es específico y propenso a errores de formato si el prompt no se construye exactamente como se documenta.
- No recomendado para producción sin una evaluación previa propia dada la ausencia de benchmarks y de tracción comunitaria.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/bartowski/beita6969_BaseRSI-27B-GGUF
- Modelo base: https://huggingface.co/beita6969/BaseRSI-27B
- Dataset referenciado: https://huggingface.co/datasets/beita6969/BaseRSI-Dataset
- llama.cpp (release b12600): https://github.com/ggml-org/llama.cpp/releases/tag/b12600
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
