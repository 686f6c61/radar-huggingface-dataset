# mlx-community/LFM2.5-24B-A2B-Preview-4bit

## Resumen

LFM2.5-24B-A2B-Preview es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Liquid AI y publicado en fase de vista previa. Aunque su nombre indica 24B parametros, se trata de un modelo disperso con solo unos 2B parametros activos por token, lo que busca combinar la calidad de un modelo grande con el coste de inferencia de uno pequeno. Esta ficha describe la conversion a 4 bits en formato MLX realizada por la comunidad mlx-community, pensada para ejecucion en Apple Silicon.

El modelo original (lq-preview/LFM2.5-24B-A2B-Preview) forma parte de la familia LFM2.5, que abarca desde los 230M hasta estos 24B, y esta orientado explicitamente a agentes que se ejecutan en dispositivo ("on-device agents"), con razonamiento previo a la respuesta final. La longitud de contexto declarada en la configuracion de origen es de 131.072 tokens, y el modelo soporta diez idiomas, entre ellos el castellano.

Esta conversion concreta esta cuantizada a 4 bits en modo affine (group size 64) y ocupa 13,49 GB en disco, lo que la hace viable en equipos Apple Silicon con memoria unificada suficiente. Al estar en formato MLX, no es ejecutable directamente en GPUs NVIDIA o AMD sin una conversion adicional a otro backend.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) decoder-only, tipo transformer; arquitectura declarada lfm2_moe (familia LFM2.5) |
| Parametros totales | 23.971.587.712 (~24B) |
| Parametros activos | ~2B por token (segun la nomenclatura A2B y el blog de Liquid AI) |
| Longitud de contexto | 131.072 tokens (segun configuracion del modelo de origen) |
| Tipos de cuantizacion | 4-bit affine weight-only con group size 64; proyecciones de router en 8-bit affine (group size 64); pesos sin cuantizar en BF16; sesgos de routing de expertos en FP32 |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it |
| Licencia | LFM Open License v1.0 (etiquetada como "other" en HuggingFace) |
| Formato de pesos | safetensors en formato MLX |
| Modelo base | lq-preview/LFM2.5-24B-A2B-Preview (revision f772950ce6f17d35af5469d00334b61a9c2fc034) |
| Tamano del repositorio | 13,5 GB (pesos: 13,49 GB en decimal) |
| Libreria de inferencia | MLX / MLX-VLM |
| Fecha indicada de publicacion | 2026-10-13 |
| Descargas y likes | 0 descargas, 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con capas de mezcla de expertos, identificado en los metadatos como lfm2_moe. La nomenclatura A2B indica que, de los ~24B parametros totales, solo aproximadamente 2B se activan por token, de modo que el coste computacional por token se aproxima al de un modelo denso de ese tamano, mientras que la capacidad de almacenamiento y el conocimiento potencial corresponden a la escala de 24B. El modelo incorpora enrutado con sesgos de expertos (expert routing biases), que en esta conversion se mantienen en FP32 sin cuantizar, y proyecciones de router cuantizadas a 8 bits.

La model card de esta conversion no aporta detalles sobre el dataset de entrenamiento, el numero de tokens vistos, ni si se aplicaron tecnicas de RLHF, DPO u otras formas de alineamiento. Tampoco se documentan innovaciones de decodificacion (por ejemplo, decodificacion especulativa) ni mecanicas de atencion alternativas. Lo unico confirmado por el autor de la conversion es que el modelo genera una cadena de razonamiento antes de su respuesta final, por lo que conviene reservar un presupuesto de tokens de salida generoso. La conversion se realizo con la CLI de MLX-VLM sobre un Apple M3 Ultra y se recargo con coincidencia estricta de pesos; se verifico que el prefill y la decodificacion con cache producen logits finitos y que dos pruebas cortas de generacion greedy devolvieron "Paris" y "391" con finalizacion en EOS. Estos controles son pruebas de humo, no una evaluacion de calidad ni una prueba de contexto largo.

## Capacidades

- Generacion de texto conversacional en diez idiomas (entre ellos ingles, castellano, portugues, frances, aleman, italiano, arabe, chino, japones y coreano).
- Razonamiento explicito: el modelo produce una traza de razonamiento antes de la respuesta final, tal como indica la model card.
- Modelo etiquetado como text-generation; la model card aclara explicitamente que esta conversion es un modelo de generacion de texto, pese a que el repositorio incluya la etiqueta mlx-vlm.
- Adecuado para uso como agente en dispositivo segun el posicionamiento del fabricante (blog de Liquid AI), aunque las capacidades concretas de tool calling o function calling no se detallan en la informacion disponible.
- Capacidades multilingues como indica la lista de idiomas declarada.
- No hay informacion disponible sobre capacidades de vision, audio, vision multimodal efectiva o modos de pensamiento configurables mas alla del razonamiento previo a la respuesta.

## Casos de uso

- Asistentes conversacionales multilingues: con 131.072 tokens de contexto, el modelo puede mantener conversaciones de multiples turnos con un historial largo y responder en el idioma del usuario entre los diez idiomas declarados.
- Agentes locales en portatiles Apple Silicon: al ocupar 13,49 GB en 4 bits y activar solo ~2B parametros por token, es viable ejecutarlo en un Mac con memoria unificada suficiente para tareas de automatizacion sin enviar datos a la nube.
- Procesamiento de documentos largos: informes, expedientes o transcripciones que quepan en la ventana de contexto y requieran extraccion de conclusiones o resumenes con razonamiento intermedio.
- Generacion de codigo asistida en local: el modelo puede usarse para completar funciones o explicar fragmentos de codigo en un entorno de desarrollo, siempre que se reserve presupuesto de tokens para la traza de razonamiento; la model card no documenta soporte especifico de tool calling.
- Atencion al cliente con datos sensibles: el despliegue en dispositivo permite mantener conversaciones con datos personales sin salida de red, util en sectores regulados.
- Traduccion y localizacion entre los idiomas soportados, aprovechando el contexto largo para mantener coherencia terminologica a lo largo de documentos extensos.
- Analisis de razonamiento paso a paso: en entornos educativos o de investigacion, la traza de razonamiento previa permite inspeccionar como llega el modelo a una conclusion, aunque no debe tomarse como explicacion fiable de su proceso interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversion unicamente documenta dos pruebas de humo de generacion greedy (respuestas "Paris" y "391") y la comprobacion de que prefill y decodificacion con cache producen logits finitos y alcanzan EOS. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ni mediciones de latencia o throughput.

## Requisitos de hardware

- Memoria para pesos: 13,49 GB en la cuantizacion 4-bit de esta conversion, mas cache KV y asignaciones temporales; en la practica conviene disponer de al menos 18-20 GB de memoria unificada para contextos moderados.
- Plataforma: la conversion es MLX, por lo que esta pensada para Apple Silicon (el autor la genero y probo en un Apple M3 Ultra). No se ejecuta directamente en CUDA ni en ROCm.
- GPU consumer: en equipos Apple, un Mac con 24 GB o mas de memoria unificada deberia poder cargar los pesos, aunque la ventana de contexto util dependera de la memoria restante. En GPUs NVIDIA consumer (RTX 4090, RTX 3090, 24 GB) esta conversion no es utilizable sin reconvertir el modelo; el modelo original en BF16 requeriria del orden de 48 GB solo para pesos, cifra estimada a partir del numero de parametros y no confirmada en la informacion disponible.
- Despliegue: MLX-VLM, concretamente el soporte LFM2.5 introducido en el PR #2505 del repositorio Blaizzy/mlx-vlm (commit a6c7313bc053e5887616fa850808d21576eddf98), con MLX 0.32.3 y Transformers 5.17.0. Para vLLM, llama.cpp, Ollama o TGI no hay informacion disponible sobre esta conversion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Formato / plataforma | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|---|
| LFM2.5-24B-A2B-Preview (esta ficha, 4-bit MLX) | 23,97B | ~2B | 131.072 tokens | MLX (Apple Silicon) | LFM Open License v1.0 | Solo pruebas de humo |
| LiquidAI/LFM2-24B-A2B-MLX-4bit (generacion anterior de la familia) | no disponible | no disponible | no disponible | MLX | LFM 1.0 | no disponible |
| lq-preview/LFM2.5-24B-A2B-Preview (modelo base sin cuantizar) | 23,97B (mismo modelo) | ~2B | 131.072 tokens | safetensors BF16 | LFM Open License v1.0 | no disponible |
| LFM2.5-230M (miembro mas pequeno de la familia) | no disponible | no disponible | no disponible | no disponible | LFM Open License v1.0 | no disponible |

La informacion proporcionada no incluye datos comparativos de rendimiento frente a otras familias de modelos MoE de tamano similar, por lo que no es posible establecer una comparacion cuantitativa con alternativas externas.

## Limitaciones y advertencias

- Modelo en fase de vista previa ("Preview"): no debe considerarse una version estable ni validada para produccion.
- Ausencia total de benchmarks publicos: las unicas comprobaciones documentadas son pruebas de humo de dos preguntas, sin evaluacion de calidad ni de contexto largo.
- La ventana de 131.072 tokens es el limite declarado en la configuracion de origen, pero no se ha verificado su comportamiento real en contextos largos tras la cuantizacion a 4 bits.
- La cuantizacion a 4 bits puede degradar la calidad respecto al modelo base en BF16; no se documenta ninguna evaluacion de esa perdida.
- Riesgo de alucinacion: no se documentan medidas especificas de mitigacion ni tasas de error; el modelo genera razonamiento antes de responder, lo que puede aumentar la apariencia de solidez de respuestas incorrectas.
- Sesgos: no se publica informacion sobre composicion del dataset de entrenamiento ni sobre evaluaciones de sesgo.
- Restricciones de licencia: los pesos se distribuyen bajo la LFM Open License v1.0 (etiquetada como "other" en HuggingFace, con enlace a LICENSE). Es imprescindible revisar el texto completo de la licencia antes de cualquier uso comercial, ya que no se detallan sus terminos en la informacion disponible.
- Dependencia de tooling poco maduro: requiere el PR #2505 de MLX-VLM, MLX 0.32.3 y Transformers 5.17.0; versiones distintas pueden no ser compatibles.
- Plataforma restringida: al ser una conversion MLX, solo es ejecutable en Apple Silicon; no hay versiones GGUF, AWQ, GPTQ ni CUDA publicadas por este autor.
- Repositorio practicamente sin uso registrado (0 descargas, 0 likes), por lo que no existe retroalimentacion de la comunidad sobre su comportamiento en produccion.
- La model card menciona un modelo con archivos identicos publicado tambien en la organizacion nativ-community, lo que puede generar confusion sobre cual es la referencia canonica.

## Enlaces

- HuggingFace (esta conversion): https://huggingface.co/mlx-community/LFM2.5-24B-A2B-Preview-4bit
- Modelo base: https://huggingface.co/lq-preview/LFM2.5-24B-A2B-Preview
- Copia identica en otra organizacion: https://huggingface.co/nativ-community/LFM2.5-24B-A2B-Preview-4bit
- Blog de Liquid AI sobre LFM2.5-24B-A2B: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- PR de soporte LFM2.5 en MLX-VLM: https://github.com/Blaizzy/mlx-vlm/pull/2505
- Conversion MLX de la generacion anterior (LFM2-24B-A2B): https://huggingface.co/mlx-community/LFM2-24B-A2B-4bit
- Conversion MLX oficial de Liquid AI de la generacion anterior: https://huggingface.co/LiquidAI/LFM2-24B-A2B-MLX-4bit
- Catalogo de pesos MLX de la comunidad: https://mlxcommunity.com/models
