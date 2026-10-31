# mradermacher/Transliteration-2.0-4B-Safetensors-i1-GGUF

## Resumen

Transliteration-2.0-4B es un modelo de lenguaje especializado en transliteración desarrollado por UnimeType, del cual mradermacher ha publicado esta versión cuantizada en formato GGUF con pesos imatrix (importance matrix). El modelo aborda un problema concreto y a menudo desatendido en el procesamiento del lenguaje: convertir texto entre sistemas de escritura, como pinyin (chino romanizado), romaji (japonés romanizado), hinglish (hindi escrito con alfabeto latino) o arabizi (árabe escrito con caracteres latinos y números).

Con unos 4.200 millones de parámetros y soporte para inglés, chino, japonés, hindi y árabe, el modelo se posiciona como una herramienta ligera y específica para tareas de romanización y entrada de texto, con aplicaciones evidentes en sistemas IME (Input Method Editor), búsqueda multilingüe y normalización de texto. La base del modelo parece derivar de la familia Qwen 3.5 (según el tag `qwen3.5` de la model card), y esta cuantización de mradermacher permite ejecutarlo en hardware de consumo con tan solo 1,5-3 GB de memoria, gracias a la amplia gama de cuants disponibles (desde IQ1_S hasta Q8 y superiores).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base derivada de Qwen 3.5, segun tags del repo) |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M (y otras de mayor tamano en el repo completo) |
| Idiomas soportados | ingles, chino, japones, hindi, arabe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizacion imatrix/i1); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El modelo base, UnimeType/Transliteration-2.0-4B-Safetensors, es un transformer denso de aproximadamente 4,2 mil millones de parametros. Los tags de la model card incluyen `qwen3.5` y `v2.1`, lo que sugiere que se trata de un fine-tuning o derivado de la arquitectura Qwen 3.5, aunque el repo no detalla la base exacta ni el proceso de entrenamiento. No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO.

La version aqui documentada es una cuantizacion realizada por mradermacher mediante el metodo imatrix (importance matrix), que pondera la importancia de cada tensor durante la cuantizacion para preservar mejor la calidad en niveles bajos de bits. El repositorio ofrece cuants dinamicos (i1) en un rango muy amplio, desde IQ1_S (1,5 GB) hasta cuants de mayor precision, ademas de una version de cuants estaticos en un repo hermano. El propio mradermacher recomienda preferir cuants IQ sobre cuants no-IQ de tamano similar (por ejemplo, IQ3_S en lugar de Q3_K_M).

## Capacidades

- Transliteracion entre escrituras: romanizacion de chino (pinyin), japones (romaji), hindi (hinglish) y arabe (arabizi).
- Comprension y generacion de texto en ingles, chino, japones, hindi y arabe.
- Formato conversacional (tag `conversational`), apto para instrucciones en formato chat.
- Caso de uso especializado en sistemas IME: conversion de entrada fonetica latina a escritura nativa y viceversa.
- No hay informacion disponible sobre soporte de tool calling, agentes, vision, audio ni thinking mode.

## Casos de uso

- Sistemas IME y entrada de texto: integracion en editores de metodos de entrada para convertir lo que el usuario teclea en alfabeto latino (pinyin, romaji) a caracteres chinos o japoneses, aprovechando que el modelo es ligero y cabe en hardware de consumo.
- Normalizacion de texto en redes sociales: convertir arabizi o hinglish procedentes de tuits, comentarios o mensajes a escritura nativa para su posterior procesamiento por otros sistemas de PLN.
- Busqueda y indexacion multilingue: generar formas romanizadas de nombres propios, lugares o terminos en chino, japones, hindi y arabe para construir indices de busqueda foneticos o deduplicar entidades entre idiomas.
- Preprocesamiento para pipelines de traduccion automatica: romanizar texto de entrada como paso previo o posterior en sistemas de traduccion que trabajan mejor con alfabeto latino.
- Verificacion y correccion de nombres propios: normalizar la escritura de nombres de personas y lugares en bases de datos multilingues (por ejemplo, en registros de clientes o datos gubernamentales).
- Asistentes de pronunciacion y aprendizaje de idiomas: generar la romanizacion de frases en chino, japones, hindi o arabe para estudiantes que aun no leen la escritura nativa.
- Ejecucion local y en el borde: gracias a los cuants de 1,5-3 GB, puede desplegarse en portatiles o dispositivos con GPU modesta para tareas de transliteracion sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB para IQ1_S/IQ1_M, 1,6-2 GB para cuants IQ2, 2,2-2,5 GB para IQ3/Q3, 2,6-2,9 GB para IQ4/Q4 y 3,1-3,2 GB para Q5. Anade margen para el contexto (KV cache).
- GPU recomendadas: cualquier GPU moderna con 4 GB de VRAM o mas ejecuta comodo los cuants de gama media-alta (Q4_K_M, Q5_K_M); incluso GPUs integradas o con 2-3 GB de VRAM pueden ejecutar los cuants IQ2/IQ3.
- Cabe en GPUs de consumo: si, sin problemas. Un cuant Q4_K_M (2,8 GB) funciona en una RTX 3060 de 8 GB, RTX 4060 o incluso en portatiles; los cuants IQ2 caben en GPUs de 2-3 GB.
- CPU: al ser un modelo de 4B, la inferencia por CPU con llama.cpp es perfectamente viable, con velocidades razonables en procesadores modernos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con transformers o vLLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| Transliteration-2.0-4B (esta cuantizacion) | 4,2 B | GGUF (imatrix) | Apache 2.0 | Transliteracion especializada (pinyin, romaji, hinglish, arabizi) |
| Qwen3 4B (base generica) | 4 B | safetensors, GGUF | Apache 2.0 | Modelo generalista multilingue, transliteracion sin especializar |
| Gemma 3 4B | 4 B | safetensors, GGUF | Gemma license | Generalista multilingue con vision, licencia mas restrictiva |

Nota: no existen muchos modelos abiertos especializados exclusivamente en transliteracion con estos cinco idiomas, por lo que la comparativa se centra en modelos generalistas de tamano similar que podrian usarse como alternativa. Los datos de rendimiento comparativo no estan disponibles.

## Limitaciones y advertencias

- Modelo muy especializado: su rendimiento en tareas generales (razonamiento, codigo, matematicas) probablemente sea inferior al de modelos generalistas de 4B; no hay datos publicados que lo confirmen ni desmientan.
- Riesgo de alucinacion en transliteraciones de nombres raros o ambiguos: la romanizacion de chino y japones presenta ambiguedades foneticas que el modelo puede resolver de forma inconsistente.
- Idiomas limitados a cinco (en, zh, ja, hi, ar); no hay soporte declarado para otros idiomas ni para el castellano.
- Longitud de contexto no documentada: conviene verificarla empiricamente antes de usar el modelo con textos largos.
- Licencia Apache 2.0 sin restricciones para uso comercial, pero conviene revisar tambien la licencia del modelo base (UnimeType/Transliteration-2.0-4B-Safetensors), que en este repo no se detalla explicitamente.
- Los cuants mas agresivos (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad; el propio autor los etiqueta como "para desesperados" y recomienda cuants IQ de gama media como IQ3_S o IQ4_XS.
- No hay informacion sobre sesgos conocidos, ni sobre soporte de tool calling o agentes.
- La fecha de creacion del repo (octubre de 2026) indica que es una version reciente (v2.0/v2.1); puede haber cambios respecto a versiones anteriores del modelo.

## Enlaces

- Repositorio de la cuantizacion (GGUF imatrix): https://huggingface.co/mradermacher/Transliteration-2.0-4B-Safetensors-i1-GGUF
- Cuants estaticos del mismo modelo: https://huggingface.co/mradermacher/Transliteration-2.0-4B-Safetensors-GGUF
- Modelo base: https://huggingface.co/UnimeType/Transliteration-2.0-4B-Safetensors
- Pagina de descargas y resumen de cuants: https://hf.tst.eu/model#Transliteration-2.0-4B-Safetensors-i1-GGUF
- Guia de uso de GGUF (referencia citada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Paper, demo o repositorio de codigo: no disponible
