# gplsi/Aitana-2B-S-base

## Resumen

Aitana-2B-S-base es un modelo de lenguaje generativo de la familia Aitana, desarrollado por el grupo GPLSI (Language and Information System Group) de la Universidad de Alicante. Se construye mediante preentrenamiento continuado (continual pre-training) sobre BSC-LT/salamandra-2b, el modelo fundacional multilingue del Barcelona Supercomputing Center, con el objetivo de mejorar la representacion del valenciano y el catalan en dominios administrativos, legales y turisticos.

El modelo resuelve un problema concreto: la baja representacion del valenciano en los corpus de entrenamiento de los grandes modelos multilingues. Para ello se ha entrenado sobre corpus especificos de la Generalitat Valenciana (DOGV), el Parlamento valenciano (Les Corts), el boletin oficial de la Universidad de Alicante (BOUA), el corpus AMIC y contenido turistico multilingue.

Con aproximadamente 2.250 millones de parametros, arquitectura transformer decoder-only y licencia Apache 2.0, es un modelo ligero pensado para ajuste fino posterior (fine-tuning) y adaptacion a dominios, no como asistente conversacional listo para produccion. Su interes actual radica en ser una base abierta y permisiva para tareas en valenciano y castellano en el ambito de la administracion publica y el turismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 2.253.490.176 (~2,25B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | Q4_K_M, F16 (GGUF incluidos en el repo); cuantizaciones adicionales via llama.cpp no documentadas |
| Idiomas soportados | Valenciano (ca), castellano (es), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de BSC-LT/salamandra-2b, que a su vez emplea una arquitectura transformer estandar adaptada al multilingue europeo. Aitana-2B-S-base no introduce cambios arquitectonicos propios: se trata de un preentrenamiento continuado sobre los pesos de Salamandra-2b.

El entrenamiento se realizo con AdamW, learning rate de 2e-5, weight decay de 0,01, warmup del 6%, batch por dispositivo de 2, acumulacion de gradientes de 8 pasos y 4 GPU, lo que da un batch global efectivo de 64. Se entrenaron 2 epocas en precision bfloat16 con una longitud maxima de secuencia de 2048 tokens. Los datos provienen de los corpus ALIA publicados por el propio GPLSI: DOGV (valenciano y castellano), Les Corts (castellano y valenciano), AMIC (valenciano), BOUA (valenciano y castellano) y turismo (valenciano, castellano e ingles). La model card advierte que estos hiperparametros se han transcrito del manuscrito y no han sido validados de forma independiente contra los scripts o logs originales. No se documenta el numero total de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto en valenciano, castellano e ingles.
- Continuacion de texto y generacion condicionada por prompt (modelo base, sin instrucciones).
- Especializacion en registro formal y administrativo por la naturaleza de los corpus (DOGV, BOUA, Les Corts).
- Cobertura de vocabulario legal, administrativo y turistico en valenciano.
- Base para ajuste fino supervisado (SFT) y adaptacion a dominios concretos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking: no disponible.

## Casos de uso

- Generacion y redaccion de documentos administrativos en valenciano: el modelo puede continuar y redactar borradores de comunicaciones oficiales, resoluciones o anuncios, gracias al entrenamiento sobre DOGV y BOUA y a su registro formal.
- Adaptacion a portales de transparencia y sedes electronicas: ajuste fino sobre el modelo para responder consultas sobre normativa y boletines oficiales en valenciano y castellano, aprovechando la cobertura lexica legal-administrativa.
- Atencion al ciudadano en valenciano: como base para un sistema de preguntas y respuestas o generacion de respuestas en oficinas de informacion, con fine-tuning sobre pares pregunta-respuesta del dominio publico.
- Contenido turistico multilingue: generacion de descripciones, guias y materiales promocionales en valenciano, castellano e ingles a partir de los datos de turismo incluidos en el entrenamiento.
- Resumen de transcripciones parlamentarias: el modelo puede ajustarse para resumir o estructurar actas de Les Corts, dado que ha visto ese tipo de texto durante el preentrenamiento continuado.
- Investigacion en PLN de bajo recursos: servir como baseline reproducible y con licencia permisiva para experimentos de modelado del valenciano y el catalan, comparando con Salamandra-2b original.
- Generacion asistida en educacion y traduccion: apoyo a la redaccion y a la traduccion castellano-valenciano en entornos academicos (BOUA), con supervision humana por el riesgo de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 4,5 GB de pesos mas overhead de activaciones y cache KV; con contexto de 2048 tokens, un total practico de 6-8 GB.
- VRAM estimada con cuantizacion GGUF Q4_K_M: aproximadamente 1,3 GB de pesos, ejecutable en GPUs de 4 GB o incluso en CPU.
- GPU recomendadas para inferencia en precision completa: NVIDIA A100, H100, L40S o RTX 4090 (24 GB) sobran para este tamano.
- Cabe en GPUs de consumo: si, en RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070 y superiores; en Q4_K_M tambien en GPUs de 4-6 GB y en CPU.
- Opciones de despliegue: transformers (pipeline de text-generation), llama.cpp, LM Studio, Ollama (via GGUF), y text-generation-inference (el repo declara compatibilidad con endpoints).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| gplsi/Aitana-2B-S-base | ~2,25B | 2048 | ca, es, en | Apache 2.0 | Preentrenamiento continuado sobre Salamandra-2b con corpus valencianos |
| BSC-LT/salamandra-2b | ~2B | no disponible en esta ficha | Multilingue europeo (incluye ca, es, en) | Apache 2.0 | Modelo base original; Aitana anade especializacion en valenciano |
| BSC-LT/salamandra-7b | ~7B | no disponible en esta ficha | Multilingue europeo | Apache 2.0 | Version mayor de la misma familia; mas capacidad pero mas coste de inferencia |
| Aitana-7B (variante de la familia) | ~7B | no disponible en esta ficha | ca, es, en | Apache 2.0 | Variante de mayor tamano de la misma familia Aitana; la model card advierte que la configuracion de 2B no aplica a la de 7B |

## Limitaciones y advertencias

- Es un modelo base: no esta alineado para seguir instrucciones ni para conversacion; requiere fine-tuning o prompting de continuacion.
- Riesgo de alucinacion alto en tareas factuales, especialmente sobre normativa concreta; no debe usarse como fuente de verdad legal sin verificacion.
- Sesgo de registro: el entrenamiento con textos administrativos y parlamentarios empuja la generacion hacia un tono formal, poco adecuado para contextos coloquiales.
- Cobertura limitada a valenciano, castellano e ingles; el rendimiento en otras lenguas no esta documentado.
- Contexto maximo de 2048 tokens, insuficiente para documentos legales largos sin troceado.
- Los hiperparametros de entrenamiento proceden del manuscrito y no han sido validados de forma independiente, segun la propia model card.
- No se documenta el volumen de tokens de entrenamiento ni la composicion exacta de las mezclas, lo que dificulta evaluar el olvido catastrofico respecto a Salamandra-2b.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe asumir la responsabilidad sobre los datos de entrenamiento subyacentes y sobre el cumplimiento normativo en aplicaciones de administracion publica.
- El modelo tiene muy poca adopcion (110 descargas, 1 like en el momento de la consulta), por lo que la validacion por parte de la comunidad es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gplsi/Aitana-2B-S-base
- Modelo base: https://huggingface.co/BSC-LT/salamandra-2b
- GPLSI, Universidad de Alicante: https://gplsi.dlsi.ua.es/
- Dataset DOGV: https://huggingface.co/datasets/gplsi/alia_dogv
- Dataset Les Corts: https://huggingface.co/datasets/gplsi/alia_les_corts
- Dataset AMIC: https://huggingface.co/datasets/gplsi/alia_amic
- Dataset BOUA: https://huggingface.co/datasets/gplsi/alia_boua
- Dataset Turismo: https://huggingface.co/datasets/gplsi/alia_tourism
- LM Studio: https://lmstudio.ai/
- Ollama: https://ollama.ai/
