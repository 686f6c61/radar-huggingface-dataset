# MuXodious/gemma-4-26B-A4B-it-SOMPOA-heresy-LoRA-GGUF

## Resumen
Este modelo es una variante "decensored" (abliterada) del Gemma 4 26B A4B IT de Google DeepMind, publicada por el usuario MuXodious en Hugging Face. Se ha generado aplicando la herramienta Heretic v1.4.0 sobre el modelo base afinado MuXodious/gemma-4-26B-A4B-it-SOMPOA-heresy-LoRA, que a su vez deriva del modelo oficial google/gemma-4-26B-A4B-it. El objetivo es eliminar los mecanismos de rechazo (refusals) del modelo original manteniendo el maximo de capacidades intactas, medido mediante divergencia KL.

El modelo base pertenece a la familia Gemma 4 de Google DeepMind, que combina arquitecturas densas y de mezcla de expertos (MoE) con soporte multimodal (texto, imagen y, en algunas variantes, audio y video), una ventana de contexto de hasta 256K tokens para los modelos medianos y soporte de mas de 140 idiomas. La variante 26B A4B es un modelo MoE con aproximadamente 26B parametros totales y unos 4B activos por token, disenado para su despliegue en GPUs de consumo y estaciones de trabajo.

La relevancia de esta ficha radica en que se trata de una modificacion no oficial de un modelo frontier, distribuida en formato GGUF para inferencia local, con licencia Apache 2.0 declarada pero sujeta a la licencia original de Gemma 4. Los datos tecnicos disponibles en la informacion proporcionada son parciales, por lo que varias especificaciones se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion local de ventana deslizante intercalada con atencion global; variante MoE (mezcla de expertos) en el modelo base |
| Parametros totales | 26B (modelo base 26B A4B); el campo safetensors del repo indica 12.021.760 (dato no consistente con el nombre del modelo) |
| Parametros activos | aproximadamente 4B (segun la denominacion A4B del modelo base) |
| Longitud de contexto | 256K tokens (modelos medianos de Gemma 4, incluido el 26B A4B) |
| Tipos de cuantizacion | GGUF (el repo distribuye pesos en formato GGUF; los niveles concretos de cuantizacion no estan detallados) |
| Idiomas soportados | no disponible (el modelo base soporta mas de 140 idiomas; la model card de esta variante no detalla idiomas) |
| Licencia | apache-2.0 (con license_link a la licencia oficial de Gemma 4) |
| Formato de pesos | GGUF (repo GGUF); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento
El modelo base Gemma 4 26B A4B emplea una arquitectura de mezcla de expertos (MoE) con atencion hibrida: capas de atencion local con ventana deslizante intercaladas con capas de atencion global, garantizando que la capa final sea siempre global. Las capas globales utilizan claves y valores unificados y aplican Proportional RoPE (p-RoPE) para optimizar el uso de memoria en contextos largos. El modelo es multimodal, procesando texto e imagen con soporte de relacion de aspecto y resolucion variable, y generando salida de texto. La familia Gemma 4 incluye modos de razonamiento configurables (thinking modes) y soporte nativo del rol `system`.

Esta variante concreta no ha sido reentrenada desde cero: es el resultado de un proceso de abliteracion aplicado con Heretic v1.4.0 sobre el modelo afinado MuXodious/gemma-4-26B-A4B-it-SOMPOA-heresy-LoRA. La abliteracion modifica direcciones de activacion en capas especificas (proyecciones `attn.o_proj` y `mlp.down_proj`) para suprimir el comportamiento de rechazo. Los parametros de abliteracion publicados incluyen `direction_index` 20.83, pesos maximos y minimos por capa en `attn.o_proj` (por ejemplo, capa 0: 1.28 maximo y 0.29 minimo) y en `mlp.down_proj` (por ejemplo, capa 0: 0.93 maximo y 0.73 minimo), con posiciones de peso maximo de 25.12 y 21.04 respectivamente. No se dispone de informacion sobre el volumen de tokens de entrenamiento, composicion del dataset ni etapas de RLHF/DPO para el modelo base en la informacion proporcionada.

## Capacidades
- Generacion de texto y razonamiento con modos de pensamiento configurables (thinking modes), heredados del modelo base Gemma 4.
- Procesamiento multimodal de imagen y texto (pipeline image-text-to-text), con soporte de relacion de aspecto y resolucion variable.
- Capacidades de codigo y matematicas, con mejoras declaradas en benchmarks de codigo en la familia Gemma 4.
- Soporte nativo de function calling / tool calling, orientado a flujos agenticos.
- Soporte de agentes y razonamiento multi-paso, gracias a las capacidades agenticas mejoradas del modelo base.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Capacidades multilingues del modelo base (mas de 140 idiomas), aunque la model card de esta variante no detalla idiomas.
- Comportamiento decensored: supresion de rechazos medida en 4/104 frente a 103/104 del modelo original, con divergencia KL de 0.1240.
- No se dispone de informacion sobre soporte de audio o video en esta variante concreta; el modelo base 26B A4B no incluye audio nativo (solo E2B, E4B y 12B lo soportan).

## Casos de uso
- Investigacion sobre abliteracion y alineacion: permite estudiar como la supresion de direcciones de activacion afecta el comportamiento de rechazo y la divergencia KL, comparando directamente con el modelo original y con los parametros de Heretic publicados.
- Generacion creativa sin restricciones: util para escritura de ficcion, guiones o narrativa que requiera tematicas sensibles, donde los rechazos del modelo original interrumpirian el flujo; debe usarse con revision humana y filtros externos.
- Evaluacion de robustez y red teaming: sirve como modelo de referencia para probar defensas, clasificadores de contenido y sistemas de moderacion frente a un modelo sin alineacion de rechazo.
- Despliegue local en estaciones de trabajo: al distribuirse en GGUF y derivar de un MoE con aproximadamente 4B parametros activos, puede ejecutarse en GPUs de consumo mediante llama.cpp u Ollama, con contexto largo de hasta 256K tokens para tareas de resumen de documentos extensos.
- Analisis de documentos e imagenes: el pipeline image-text-to-text permite extraer informacion de capturas, diagramas o documentos escaneados junto con texto, aprovechando la ventana de contexto extendida.
- Pipelines de codigo asistido: con soporte de function calling y rol `system`, puede integrarse en herramientas de desarrollo para generar parches, explicar codigo o automatizar tareas de CI/CD, siempre con revision humana.
- Experimentacion con agentes: su soporte de tool calling y razonamiento multi-paso permite construir agentes locales para automatizacion de tareas, con la cautela de que el modelo no ha sido validado oficialmente en esta variante.

## Benchmarks y rendimiento
La model card proporciona exclusivamente metricas de abliteracion comparadas con el modelo original:

| Metrica | Este modelo | Modelo original (google/gemma-4-26B-A4B-it) |
|---|---|---|
| Divergencia KL | 0.1240 | 0 (por definicion) |
| Rechazos (refusals) | 4/104 | 103/104 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible para esta variante.

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial; para un modelo MoE de 26B parametros totales en GGUF, las estimaciones orientativas dependen del nivel de cuantizacion (por ejemplo, Q4_K_M en torno a 15-16 GB, Q8 en torno a 27-28 GB), pero estos valores no estan confirmados en la informacion proporcionada.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cabria considerar A100, H100 o RTX 4090 para cuantizaciones bajas, pero no hay datos oficiales.
- Cabe en GPU de consumo: probable en cuantizaciones bajas (Q4) en GPUs con 16-24 GB de VRAM, aunque no confirmado.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM o TGI para el modelo base en safetensors; transformers como libreria declarada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (Gemma 4 26B A4B abliterado GGUF) | 26B totales, ~4B activos | 256K | apache-2.0 (sujeta a licencia Gemma 4) | Hugging Face, GGUF | Decensored, 4/104 rechazos, KL 0.1240 |
| google/gemma-4-26B-A4B-it | 26B totales, ~4B activos | 256K | Apache 2.0 (Gemma 4) | Hugging Face, safetensors | Modelo original alineado, 103/104 rechazos |
| MuXodious/gemma-4-26B-A4B-it-SOMPOA-heresy-LoRA | 26B totales, ~4B activos | 256K | apache-2.0 | Hugging Face | Modelo base de esta variante, con LoRA de herejia |
| Gemma 4 31B Dense | 30.7B | 256K | Apache 2.0 (Gemma 4) | Hugging Face | Alternativa densa de mayor tamano |

No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias
- Modelo decensored: la supresion de rechazos implica que puede generar contenido sensible, danino o inseguro; requiere moderacion externa obligatoria en produccion.
- Divergencia KL de 0.1240 respecto al original: existe una degradacion medible de la distribucion de salida, con posible perdida de calidad en tareas generales.
- Riesgo de alucinacion: no cuantificado en esta variante; el proceso de abliteracion puede alterar calibracion y aumentar respuestas inventadas.
- Idiomas: no detallados en la model card; el soporte multilingue del modelo base no esta verificado en esta variante.
- Licencia: apache-2.0 declarada con enlace a la licencia oficial de Gemma 4; deben revisarse las condiciones de uso comercial de la licencia original de Google.
- Inconsistencia de datos: el campo safetensors del repo indica 12.021.760 parametros, incompatible con la denominacion 26B del modelo; conviene verificar los pesos antes de desplegar.
- Repo de tamano 0.0 GB segun la informacion disponible: posible repo vacio o pesos no subidos correctamente; verificar antes de usar.
- No validado oficialmente por Google DeepMind: es una modificacion de terceros sin garantias de soporte.
- Uso en produccion: no recomendado sin evaluacion propia de calidad, seguridad y sesgos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/MuXodious/gemma-4-26B-A4B-it-SOMPOA-heresy-LoRA-GGUF
- Modelo base de la variante: https://huggingface.co/MuXodious/gemma-4-26B-A4B-it-SOMPOA-heresy-LoRA
- Modelo original: https://huggingface.co/google/gemma-4-26B-A4B-it
- Coleccion Gemma 4: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion: https://ai.google.dev/gemma/docs/core
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Heretic: https://heretic-project.org
- Pagina de modelos Gemma de DeepMind: https://deepmind.google/models/gemma/
