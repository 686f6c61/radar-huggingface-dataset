# mradermacher/Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic`, un merge de modelos de la familia Qwen3.5 de 4B parametros orientado a eliminar restricciones de alineacion (el sufijo "heretic" hace referencia a la tecnica de abliteration/decensoring). El autor de las cuantizaciones es mradermacher, un prolifico publicador de versiones GGUF de modelos de la comunidad, no el desarrollador original del modelo base ni del merge.

La relevancia de este repositorio es practica: permite ejecutar un merge de 4B en hardware de consumo mediante llama.cpp u Ollama, con un espectro muy amplio de niveles de cuantizacion (desde IQ1_S hasta Q6_K). No obstante, la informacion publicada en el repositorio es extremadamente escasa: no se declara licencia, idiomas, pipeline ni detalles de entrenamiento, y el recuento de parametros reportado en los metadatos de safetensors (1.797.272) es inconsistente con un modelo de 4B, lo que sugiere metadatos erroneos o incompletos.

Conviene tratar esta ficha con cautela: se trata de un artefacto derivado de un merge comunitario de procedencia poco documentada, sin benchmarks publicados ni garantias de calidad, y con el añadido de que su proposito declarado es operar sin los filtros de seguridad habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5; detalles no disponibles) |
| Parametros totales | 4B segun el nombre del modelo; el recuento en metadatos safetensors (1.797.272) es inconsistente y no disponible de forma fiable |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ3_M, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones weighted/imatrix) |

## Arquitectura y entrenamiento

El modelo subyacente es un merge de tres modelos (indicado por "3xMerge" en el nombre) construido sobre una base Qwen3.5 de 4B parametros, presuntamente mediante tecnicas de model merging. El sufijo "heretic" y "UNCENSORED" indican que se ha aplicado algun proceso de abliteration o decensoring para reducir el rechazo de peticiones, presumiblemente mediante la sustraccion de direcciones de activacion asociadas a la negativa a responder. No se dispone de informacion sobre el dataset de merging, el numero de tokens implicados, ni si hubo etapas de RLHF o DPO posteriores.

Las cuantizaciones de este repositorio emplean el formato GGUF con cuantizacion ponderada (weighted/imatrix), que calcula una matriz de importancia a partir de datos de calibracion para asignar mas bits a los tensores mas sensibles. El autor declara `quantize_version: 2` y `convert_type: hf`, es decir, conversion desde pesos Hugging Face. No hay informacion sobre innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa, modos de pensamiento) mas alla de lo que herede del Qwen3.5 base.

## Capacidades

- Generacion de texto conversacional en formato chat, heredada del modelo base Qwen3.5.
- Razonamiento y matematicas de nivel basico-medio, limitado por el tamano de 4B parametros.
- Generacion de codigo, presumiblemente con soporte de instrucciones tecnicas.
- Comportamiento "uncensored": menor tendencia a rechazar peticiones, segun el proposito declarado del merge.
- Capacidades multilingues: probablemente heredadas del base, pero no documentadas en este repositorio.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades de vision o audio: no disponible (no se indica que el modelo sea multimodal).

## Casos de uso

- Experimentacion con tecnicas de abliteration: el modelo sirve como caso de estudio para investigadores que quieran evaluar como el decensoring afecta a la calidad del modelo en tareas estandar, comparando contra el Qwen3.5 base.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutar un modelo de 4B en GPUs con 4-8 GB de VRAM mediante llama.cpp u Ollama, util para prototipado offline.
- Generacion creativa sin restricciones tematicas: escritura de ficcion, guiones o narrativa que aborde temas sensibles, donde los filtros de seguridad del modelo base resultarian un obstaculo.
- Investigacion sobre seguridad y alineacion: analisis de como se degradan las negativas ante prompts adversarios, util para construir defensas o estudiar robustez de alineacion.
- Evaluacion comparativa de cuantizaciones: el amplio rango de niveles (de IQ1_S a Q6_K) permite medir la perdida de calidad por cuantizacion en un mismo modelo, util para calibrar pipelines de despliegue.
- Fine-tuning posterior sobre dominio especifico: al ser un modelo pequeno y sin restricciones de licencia declaradas (aunque esto es un riesgo legal), puede servir de base para experimentos de ajuste en nichos concretos.
- Chatbot de prototipo en entornos controlados: para demos internas donde la ausencia de filtros sea aceptable y el hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 4B, estimaciones orientativas): Q4_K_M ~2,5-3 GB; Q5_K_M ~3-3,5 GB; Q6_K ~3,5-4 GB; Q8_0 ~4,5 GB; FP16 ~8 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para cuantizaciones altas y contexto largo; A100/H100 solo si se necesita throughput elevado en servidor.
- Cabe en GPU de consumo: si, practicamente cualquier GPU con 6 GB o mas puede ejecutar Q4_K_M; las cuantizaciones IQ2/IQ3 permiten incluso GPUs de 4 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, KoboldCpp. Para vLLM o TGI seria necesario convertir a safetensors y verificar compatibilidad con la arquitectura Qwen3.5.
- Latencia y throughput: no disponibles; dependeran del hardware y del nivel de cuantizacion. En una RTX 4090 con Q4_K_M se puede esperar un throughput alto (decenas de tokens por segundo), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic (i1-GGUF) | 4B (nominal) | no disponible | no disponible | GGUF | Merge comunitario sin documentacion, sin benchmarks |
| Qwen3.5-4B (base oficial) | 4B | no disponible | no disponible | safetensors, GGUF | Modelo oficial, alineado, con documentacion |
| Llama 3.2 3B Instruct | 3B | 128K | Llama 3.2 Community License | safetensors, GGUF | Alternativa pequena ampliamente soportada |
| Gemma 2 2B / 9B | 2B / 9B | 8K | Gemma Terms | safetensors, GGUF | Rango de tamano similar, bien documentado |

La comparacion directa es dificil porque el modelo de esta ficha carece de benchmarks y de licencia declarada. Frente a opciones oficiales como Llama 3.2 3B o Gemma 2 2B, la principal diferencia es la ausencia de filtros de seguridad y la falta de garantias de calidad y soporte.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el merge preserve la calidad del Qwen3.5 base; los merges comunitarios pueden degradar capacidades de forma no trivial.
- Licencia no disponible: no se puede verificar si el uso comercial esta permitido. El modelo base Qwen3.5 tiene su propia licencia que podria imponer restricciones; usar este derivado en produccion sin aclarar la cadena de licencias es un riesgo legal.
- Modelo "uncensored": la eliminacion de filtros de seguridad implica mayor probabilidad de generar contenido danino, ofensivo o ilegal. No es apto para aplicaciones orientadas al publico sin moderacion adicional.
- Riesgo elevado de alucinacion: los modelos de 4B y los merges sin validacion tienden a inventar hechos, especialmente en dominios especializados.
- Metadatos inconsistentes: el recuento de parametros en safetensors (1.797.272) no cuadra con un modelo de 4B, lo que sugiere que la informacion del repositorio no es fiable.
- Sin informacion sobre contexto maximo ni idiomas: no se puede planificar su uso en tareas que requieran ventanas largas o cobertura multilingue sin pruebas empiricas.
- Procedencia y reproducibilidad: el autor de las cuantizaciones no es el creador del merge; la cadena de custodia del modelo es opaca.
- Sin soporte ni mantenimiento: repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay comunidad ni issues que permitan resolver problemas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic-i1-GGUF
- Modelo original (merge): https://huggingface.co/xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Otros enlaces (papers, blogs, demos): no disponibles en la informacion proporcionada.
