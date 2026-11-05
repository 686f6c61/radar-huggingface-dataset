# mradermacher/Qwen3.8-27B-Uncensored-Impulsive-i1-GGUF

## Resumen

Qwen3.8-27B-Uncensored-Impulsive-i1-GGUF es una cuantización en formato GGUF del modelo Qwen3.8-27B-Uncensored-Impulsive, publicada por el usuario mradermacher en HuggingFace. El modelo base es un fine-tune "uncensored" de la familia Qwen 3.8, con aproximadamente 26.900 millones de parámetros (26.895.998.464 según los pesos safetensors reportados), orientado a conversación y generación de texto sin los filtros de alineación habituales del modelo original.

El repositorio contiene exclusivamente cuantizaciones GGUF generadas con imatrix (importance matrix), lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El autor incluye una batería amplia de niveles de cuantización, desde IQ1_S hasta Q6_K, cubriendo un rango que va desde configuraciones extremadamente agresivas hasta otras de alta fidelidad.

La relevancia de esta ficha es acotada: se trata de un artefacto derivado, no de un modelo con documentación técnica propia. La model card no aporta información sobre arquitectura interna, datos de entrenamiento, benchmarks ni licencia, por lo que muchos campos de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen 3.8; detalles no publicados en la model card) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado, con imatrix) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. El nombre sugiere una base Qwen 3.8 de ~27 B de parámetros, presumiblemente un transformer decoder-only, pero la model card no detalla capas, atención, ni si incorpora innovaciones como atención lineal o decodificación especulativa. El tamaño de parámetros (26,9 B) es consistente con un modelo denso de esa escala, aunque no se confirma.

Respecto al entrenamiento, la model card únicamente indica que este repositorio contiene cuantizaciones ponderadas con imatrix del modelo `Sorenvza/Qwen3.8-27B-Uncensored-Impulsive`. No se especifican tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO o fine-tuning supervisado. El calificativo "Uncensored-Impulsive" sugiere un ajuste orientado a eliminar rechazos y sesgar el estilo hacia respuestas más directas o impulsivas, pero no hay documentación técnica que lo respalde. La etiqueta `nicoboss` en los metadatos de cuantización apunta a un pipeline de conversión concreto, sin más detalle.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es "conversational" y la etiqueta principal es "conversational", lo que indica uso previsto para diálogo multi-turno.
- Generación de texto libre sin filtros de alineación: el nombre "Uncensored" implica que el modelo no aplica rechazos sistemáticos, aunque no se documenta el alcance real de esta característica.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a través de infraestructura de inferencia estándar (por ejemplo, TGI o endpoints compatibles con la API de HuggingFace).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Despliegue local en estación de trabajo: al estar en GGUF, el modelo puede ejecutarse con llama.cpp u Ollama en una máquina con GPU de consumo, usando cuantizaciones Q4_K_M o Q5_K_M para equilibrar calidad y VRAM. Es adecuado para experimentación sin depender de servicios en la nube.
- Prototipado de chatbots sin restricciones: para investigación sobre comportamiento de modelos sin alineación, permite estudiar respuestas ante prompts que el modelo base rechazaría, en un entorno controlado.
- Generación creativa de ficción: la orientación "uncensored" y "impulsive" puede encajar en escritura de narrativa con temáticas sensibles, siempre que el operador asuma la responsabilidad del contenido.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 24 variantes de cuantización, lo que permite medir el impacto de la compresión (de IQ1_S a Q6_K) sobre la perplejidad y la calidad de salida en una misma tarea.
- Fine-tuning posterior sobre GGUF: aunque el formato GGUF no es ideal para entrenamiento, puede servir como base para LoRA sobre el modelo original en safetensors y luego recuantizar.
- Servicio de inferencia interno: con la etiqueta `endpoints_compatible`, puede desplegarse tras una API interna para aplicaciones que requieran un modelo de ~27 B con latencia controlada en hardware propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada según tamaño de parámetros y cuantización):
  - IQ1_S / IQ2_XXS: ~7-9 GB, viable en GPUs de 8-12 GB con offload parcial.
  - Q3_K_M / IQ3_M: ~11-13 GB, requiere 12-16 GB de VRAM.
  - Q4_K_M / IQ4_XS: ~15-17 GB, requiere 16-24 GB de VRAM.
  - Q5_K_M: ~18-20 GB, requiere 24 GB.
  - Q6_K: ~22-24 GB, requiere 24 GB o más.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40/80 GB o H100 para cuantizaciones altas y mayor throughput; RTX 3090 (24 GB) como alternativa consumer.
- ¿Cabe en GPU de consumo? Sí, en RTX 3090/4090 con cuantizaciones Q4 y Q5; en GPUs de 12-16 GB solo con cuantizaciones Q2/Q3 o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (llama-cpp-python, text-generation-webui). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían el modelo en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-Impulsive-i1-GGUF (este) | ~26,9 B | no disponible | no disponible | GGUF | Cuantización imatrix de un fine-tune uncensored |
| Modelo base Sorenvza/Qwen3.8-27B-Uncensored-Impulsive | ~26,9 B (presumible) | no disponible | no disponible | safetensors (presumible) | Fuente del que deriva esta cuantización |
| Qwen 3.8 27B original (familia Qwen) | ~27 B | no disponible | no disponible | safetensors | Modelo alineado del que probablemente deriva el fine-tune |

No se dispone de datos de rendimiento ni de licencia para establecer una comparación cuantitativa fiable con alternativas.

## Limitaciones y advertencias

- Licencia no declarada: la ausencia de licencia impide determinar si el uso comercial está permitido; hay que contactar con el autor o consultar el modelo base antes de usarlo en producción.
- Modelo "uncensored": no aplica filtros de alineación, por lo que puede generar contenido sensible, ofensivo o ilegal según el contexto; requiere moderación externa y supervisión humana.
- Riesgo elevado de alucinación: no hay documentación sobre entrenamiento ni evaluaciones que permitan estimar la fiabilidad factual.
- Idiomas no declarados: no se puede garantizar un rendimiento aceptable fuera del inglés o del chino sin pruebas propias.
- Contexto desconocido: sin ventana de contexto documentada, el diseño de aplicaciones multi-turno o de recuperación (RAG) queda a ciegas.
- Cuantizaciones agresivas (IQ1_S, IQ2_XXS): la degradación de calidad es probable y no está medida; no se recomiendan para tareas que requieran precisión.
- Artefacto derivado sin mantenimiento aparente: 0 descargas y 0 likes en el momento de la consulta, sin historial de issues ni actualizaciones más allá de la fecha de creación.
- Sin benchmarks: cualquier afirmación de rendimiento sería especulativa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Impulsive-i1-GGUF
- Modelo base: https://huggingface.co/Sorenvza/Qwen3.8-27B-Uncensored-Impulsive
