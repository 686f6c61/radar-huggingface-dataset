# KRAFTON/Raon-1-mini-preview-nvfp4

## Resumen

Raon-1-mini-preview-nvfp4 es una versión cuantizada del modelo Raon-1-mini de KRAFTON, publicada en HuggingFace bajo una licencia Apache-2.0 y con acceso restringido (gated). El checkpoint contiene 15.084.105.442 parámetros (unos 15,08 mil millones) almacenados en formato NVFP4, la cuantización de 4 bits por elemento con escalas de bloque introducida por NVIDIA a través de ModelOpt, y está empaquetado para su uso con vLLM. El pipeline declarado es text-generation con orientación conversacional, y la ficha no publica información sobre arquitectura, datos de entrenamiento ni ventana de contexto.

Se trata, por tanto, de un lanzamiento en fase de vista previa ("preview") centrado en la eficiencia de despliegue: en lugar de distribuir los pesos en bf16, KRAFTON ofrece directamente el artefacto cuantizado a 4 bits, lo que reduce el peso teórico de los pesos a aproximadamente 8,5 GB y permite plantear inferencia en GPUs de gama alta de consumo. Es relevante ahora porque NVFP4 es uno de los formatos que están adoptando los motores de inferencia para aprovechar el hardware Blackwell, y contar con un checkpoint de ~15B ya convertido evita al usuario tener que ejecutar el proceso de cuantización con ModelOpt.

La información disponible es, sin embargo, muy limitada: no hay model card con detalles técnicos, no se han publicado resultados de benchmarks y no se declaran idiomas soportados. Cualquier evaluación de calidad debe hacerse por tanto de forma empírica tras aceptar las condiciones de acceso en el repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la información proporcionada no especifica transformer, MoE ni híbrida) |
| Parámetros totales | 15.084.105.442 (~15,08 B) |
| Parámetros activos | No disponible (no se ha confirmado que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NVFP4 (4 bits por elemento, formato ModelOpt FP4); el repositorio se etiqueta como "8-bit" en la clasificación de HuggingFace |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (acceso restringido: requiere aceptar condiciones en HuggingFace) |
| Formato de pesos | safetensors con cuantización NVFP4 (modelopt_fp4), pensado para vLLM |
| Tamaño del repositorio | 17,6 GB |
| Pipeline | text-generation (conversational) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la documentación disponible: se desconoce si emplea un transformer denso, una mezcla de expertos o un diseño híbrido, así como el número de capas, la dimensión oculta, el mecanismo de atención o la estrategia de positional encoding. El único dato estructural firme es el recuento de parámetros obtenido de los tensores safetensors: 15.084.105.442, lo que sitúa al modelo en la franja de ~15B, un tamaño habitual para despliegues de una sola GPU con cuantización agresiva.

Tampoco hay datos sobre el corpus de entrenamiento (número de tokens, composición, proporción de código o multilingüe), ni sobre si se aplicaron fases de alineación como RLHF, DPO o ajuste por instrucciones. La innovación técnica declarada es exclusivamente de formato: la conversión a NVFP4, que codifica cada grupo de 16 elementos con una escala microscópica en FP8 (E4M3) y una escala tensorial global en FP32, de modo que el coste de almacenamiento baja a unos 0,56 bytes por parámetro. El tag "8-bit" del repositorio refleja la clasificación de la librería de HuggingFace y no el ancho de bits efectivo del dato.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (text-generation, conversational).
- Razonamiento y conocimiento general: no hay datos publicados que permitan confirmar nivel ni ámbitos de especialización.
- Generación de código y matemáticas: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Eficiencia de despliegue: al estar pre-cuantizado en NVFP4, reduce el espacio de pesos y puede aumentar el throughput por GPU en comparación con un checkpoint bf16 equivalente.

## Casos de uso

- Prototipado de asistentes conversacionales en una sola GPU: con ~8,5 GB de pesos teóricos en NVFP4, el modelo puede servirse en una RTX 4090 o RTX 5090 junto con caché KV para sesiones de varios turnos, lo que permite montar un entorno de pruebas sin infraestructura de centro de datos.
- Despliegue con vLLM en producción de baja latencia: el checkpoint está empaquetado para vLLM con cuantización ModelOpt, de modo que puede levantarse como servidor compatible con la API de OpenAI y usarse detrás de una aplicación web o un bot interno.
- Generación de texto a escala en pipelines de procesado documental: resumen, extracción y reescritura de documentos en lote, donde el ahorro de memoria por instancia permite mayor paralelismo de réplicas en el mismo nodo.
- Evaluación comparativa interna de modelos de ~15B: útil como referencia cuantizada para medir la degradación de calidad frente al checkpoint original en bf16, si KRAFTON lo publica, sobre tareas propias de la organización.
- Investigación sobre cuantización de 4 bits: el artefacto sirve para estudiar el impacto de NVFP4 en perplejidad, estabilidad de generación larga y robustez ante prompts adversarios, comparándolo con GGUF Q4 o AWQ.
- Base para ajuste fino con QLoRA sobre GPUs de consumo: un modelo de 15B en 4 bits deja margen de VRAM para adaptadores y activaciones en tarjetas de 24-32 GB, si bien la compatibilidad de QLoRA con NVFP4 debe validarse caso por caso.
- Chatbot de soporte de primer nivel en entornos con requisitos de licencia permisiva: Apache-2.0 facilita la integración comercial, sujeta al cumplimiento de las condiciones de acceso al repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 8,5 GB solo para pesos NVFP4 (15,08 B × ~0,56 bytes); con caché KV y overhead del runtime, un despliegue realista parte de 12-16 GB, cifra que crece con la longitud de contexto (desconocida).
- Equivalentes en otros formatos para comparar: ~30 GB en bf16/fp16 (no cabe en GPU de consumo de 24 GB) y ~15 GB en FP8/INT8.
- GPU recomendadas: para aprovechar NVFP4 de forma nativa, GPUs Blackwell (B200, GB200, RTX 5090/5080). En Ada (RTX 4090, L40S) y Hopper (H100, H200) el formato puede ejecutarse mediante kernels de decuantización, con menor ganancia de rendimiento.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090/3090 (24 GB) y RTX 5090 (32 GB) con contexto moderado; en tarjetas de 16 GB el margen es muy ajustado y depende de la longitud de contexto.
- Opciones de despliegue: vLLM es el motor objetivo declarado (tag vllm); no se confirma soporte en llama.cpp, Ollama o TGI, que requieren normalmente GGUF u otros formatos.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantización lista para usar | Datos de rendimiento |
|---|---|---|---|---|---|
| Raon-1-mini-preview-nvfp4 (KRAFTON) | 15,08 B | No disponible | Apache-2.0 (gated) | NVFP4 (ModelOpt) para vLLM | No disponibles |
| Qwen2.5-14B-Instruct | ~14,7 B | 128 K (configuración declarada por el autor) | Apache-2.0 | GGUF, AWQ, GPTQ en la comunidad | Ampliamente reportados por el autor |
| Phi-4 (14B) | ~14,7 B | 16 K (configuración declarada por el autor) | MIT | GGUF y otras en la comunidad | Reportados por el autor |
| Mistral-Nemo-12B-Instruct | ~12 B | 128 K (configuración declarada por el autor) | Apache-2.0 | GGUF y otras en la comunidad | Reportados por el autor |

Nota: los datos de las filas comparativas corresponden a especificaciones públicamente conocidas de esos modelos y deben verificarse contra sus fichas actuales; pueden existir alternativas más recientes. La ausencia de benchmarks del modelo de KRAFTON impide cualquier comparación de calidad.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: sin model card detallada no es posible conocer la arquitectura, el contexto máximo ni los idiomas, lo que dificulta planificar despliegues en producción.
- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace; la automatización de descargas en CI/CD requiere un token con permisos sobre el repositorio.
- Riesgo de alucinación: desconocido y no evaluado; al no haber benchmarks ni evaluación de alineación publicada, debe asumirse el riesgo habitual de un modelo generativo sin verificación.
- Sesgos: no documentados. Sin información sobre composición del corpus ni sobre procesos de alineación, no puede acotarse el sesgo lingüístico, cultural o de dominio.
- Estado "preview": la versión puede cambiar o retirarse sin aviso, y no se garantiza estabilidad de la API ni del comportamiento entre actualizaciones.
- Cuantización NVFP4: la pérdida de calidad frente al modelo original en bf16 no está cuantificada; además, el soporte de kernels es dependiente de GPU y versión de vLLM, lo que puede provocar fallos o degradación en hardware no Blackwell.
- Compatibilidad de herramientas: al no confirmarse soporte en llama.cpp u Ollama, la integración en stacks ligeros puede exigir convertir los pesos a GGUF, proceso no documentado por el autor.
- Licencia: Apache-2.0 es permisiva para uso comercial, pero debe revisarse el texto completo de las condiciones de acceso del repositorio, que pueden añadir restricciones adicionales.
- Idiomas: al no declararse, no debe asumirse un rendimiento correcto en castellano sin pruebas previas.

## Enlaces

- HuggingFace: https://huggingface.co/KRAFTON/Raon-1-mini-preview-nvfp4
