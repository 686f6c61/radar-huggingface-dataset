# ErAadil/kathe-2026-kashmiri-nllb-lora

## Resumen

El modelo `ErAadil/kathe-2026-kashmiri-nllb-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado para la traducción automática de inglés a cachemir, una lengua de la familia indoaria hablada principalmente en el valle de Cachemira (India). El adaptador se basa en el modelo `facebook/nllb-200-1.3B`, un transformer encoder-decoder de Meta AI entrenado para traducción multilingüe en 200 idiomas. Este adaptador fue creado en el contexto de la competición KATHE 2026, organizada por GAASH Lab del NIT Srinagar en colaboración con el Bureau of Indian Standards, cuyo objetivo es impulsar soluciones de IA para lenguas de bajo recurso.

El repositorio contiene únicamente los pesos del adaptador LoRA (aproximadamente 0.1 GB), no el modelo base completo. Para su uso, es necesario cargar el modelo base `facebook/nllb-200-1.3B` y combinar ambos mediante la librería PEFT (Parameter-Efficient Fine-Tuning). La model card original está prácticamente vacía, por lo que no se dispone de detalles sobre el proceso de entrenamiento, hiperparámetros, datos utilizados ni evaluación. La relevancia de este modelo radica en su contribución a la preservación lingüística del cachemir, una lengua con escasos recursos digitales y pocas herramientas de traducción automática de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer encoder-decoder (facebook/nllb-200-1.3B) |
| Parametros totales | No disponible (el adaptador ocupa ~0.1 GB en disco) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizacion declarada) |
| Idiomas soportados | Ingles y cachemir (segun el contexto de la competicion KATHE 2026) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura del modelo `facebook/nllb-200-1.3B`, un transformer encoder-decoder con 1.300 millones de parametros, entrenado por Meta AI para traduccion automatica entre 200 idiomas. NLLB-200 emplea una arquitectura estandar de transformer con atencion de producto punto escalado, normalizacion previa y embeddings posicionales aprendidos. El modelo base fue entrenado con datos paralelos del corpus CCMatrix y otros conjuntos multilingues, y posteriormente ajustado con tecnicas de aprendizaje por refuerzo a partir de feedback humano (RLHF) para mejorar la calidad de las traducciones.

El adaptador LoRA de este repositorio introduce matrices de rango bajo en las capas de atencion y feed-forward del modelo base, de modo que solo se actualizan estos parametros durante el ajuste fino. No se proporcionan detalles sobre el conjunto de datos de entrenamiento, el numero de pasos, el optimizador, la tasa de aprendizaje ni el regimen de precision (fp16, bf16, etc.). La competicion KATHE 2026 sugiere el uso del corpus BPCC (Bharat Parallel Corpus Collection) como fuente de datos, pero no hay confirmacion de que este adaptador se haya entrenado con ese corpus. Tampoco se indica si se aplicaron tecnicas de post-entrenamiento como DPO o RLHF sobre el adaptador.

## Capacidades

- Traduccion automatica de ingles a cachemir: el adaptador esta disenado especificamente para esta direccion linguistica, aprovechando la cobertura multilingue del modelo base NLLB-200.
- Requiere el modelo base completo: no es un modelo autonomo, sino un adaptador que debe cargarse junto con `facebook/nllb-200-1.3B` mediante la libreria PEFT.
- Compatible con el ecosistema Hugging Face Transformers: puede integrarse en pipelines de traduccion estandar usando la clase `AutoModelForSeq2SeqLM` y `PeftModel`.
- No se documentan capacidades adicionales como generacion de codigo, razonamiento, tool calling o soporte multimodal. Al ser un adaptador de traduccion, su unica funcion conocida es la traduccion de texto.

## Casos de uso

- Preservacion linguistica: el modelo puede emplearse para digitalizar y traducir contenido en cachemir, contribuyendo a la documentacion y revitalizacion de una lengua con escasa presencia en linea.
- Traduccion de documentos administrativos y legales: organismos publicos de la region de Cachemira podrian usar el modelo para traducir formularios, avisos y normativas del ingles al cachemir, facilitando el acceso a servicios gubernamentales.
- Educacion bilingue: en escuelas y universidades, el adaptador puede generar materiales educativos en cachemir a partir de recursos en ingles, apoyando la ensenanza en lengua materna.
- Atencion al ciudadano: sistemas de chatbot o asistencia virtual en cachemir podrian integrar este modelo para responder consultas en el idioma local, mejorando la accesibilidad de servicios publicos y privados.
- Investigacion en PLN de lenguas de bajo recurso: el adaptador sirve como punto de partida para experimentos con tecnicas de adaptacion eficiente (LoRA) en idiomas minoritarios, y puede compararse con otros enfoques de la competicion KATHE 2026.
- Traduccion de contenido cultural y literario: permite traducir poesia, cuentos o noticias locales del ingles al cachemir, ampliando el alcance de la produccion cultural de la region.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como BLEU, chrF o COMET, ni comparaciones con otros modelos de traduccion para cachemir. Tampoco se proporcionan datos sobre el rendimiento en el conjunto de evaluacion de la competicion KATHE 2026.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0.1 GB, pero es necesario cargar el modelo base `facebook/nllb-200-1.3B` completo.
- El modelo base tiene 1.300 millones de parametros. En precision FP16, los pesos del modelo base ocupan aproximadamente 2.6 GB, mas el adaptador y los estados del optimizador durante el entrenamiento.
- Para inferencia, se estima que una GPU con al menos 4-6 GB de VRAM puede ejecutar el modelo en FP16 (por ejemplo, una NVIDIA GTX 1660 Ti, RTX 2060 o superior). En cuantizacion de 8 bits, podria caber en 2-3 GB, pero no se ha confirmado compatibilidad con cuantizacion.
- Para entrenamiento o ajuste fino adicional, se recomienda una GPU con 8-12 GB de VRAM (RTX 3080, RTX 3090, A100, etc.) dependiendo del tamano de lote y la longitud de las secuencias.
- Opciones de despliegue: el adaptador puede usarse con la libreria Transformers de Hugging Face, PEFT, y servidores de inferencia como vLLM o TGI (si se combina con el modelo base). Tambien es posible exportar a ONNX o TensorRT para optimizacion, aunque no se ha documentado.
- No se dispone de datos sobre latencia o throughput medidos en hardware especifico.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificamente para traduccion ingles-cachemir. Existen otros adaptadores LoRA para NLLB-200 en la competicion KATHE 2026 (por ejemplo, `Jagadish-banoth/kathe-2026` basado en NLLB-200-distilled-600M), pero no hay datos publicos que permitan una comparacion cuantitativa. El modelo base NLLB-200 es el punto de referencia comun, pero este adaptador no publica metricas propias.

## Limitaciones y advertencias

- La model card no contiene informacion sobre sesgos, riesgos o limitaciones tecnicas. Al ser un adaptador de traduccion entrenado sobre un modelo multilingue, puede heredar sesgos presentes en los datos de entrenamiento del modelo base (por ejemplo, sesgos de genero o culturales).
- No se han documentado tasas de alucinacion ni errores tipicos. En traduccion de lenguas de bajo recurso, es esperable que la calidad sea inferior a la de idiomas mayoritarios, especialmente en textos con vocabulario especializado o dialectal.
- El adaptador requiere el modelo base NLLB-200-1.3B, que tiene una licencia CC-BY-NC-4.0 (uso no comercial). Esto puede restringir su uso en aplicaciones comerciales. La licencia del adaptador en si no esta especificada.
- No se proporcionan instrucciones de uso ni ejemplos de codigo en la model card, lo que dificulta su adopcion inmediata.
- La longitud de contexto no esta documentada; se asume que hereda el limite del modelo base (tipicamente 1024 tokens), lo que puede ser insuficiente para documentos largos.
- El modelo solo cubre la direccion ingles-cachemir; no se ha validado su rendimiento en la direccion inversa (cachemir-ingles) ni en otros idiomas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ErAadil/kathe-2026-kashmiri-nllb-lora
- Competicion KATHE 2026 en Kaggle: https://www.kaggle.com/competitions/kathe-2026/overview
- Codigo de la competicion en Kaggle: https://www.kaggle.com/competitions/kathe-2026/code
- Informacion sobre KATHE 2026 en GAASH Lab: https://gaash.nitsri.ac.in/events/kathe-2026
- Noticia sobre el anuncio de KATHE 2026: https://ziraattimes.com/2026/08/nit-srinagar-announces-ai-challenge-for-kashmiri-language-translation/
- Repositorio similar de otro participante: https://github.com/Jagadish-banoth/kathe-2026
