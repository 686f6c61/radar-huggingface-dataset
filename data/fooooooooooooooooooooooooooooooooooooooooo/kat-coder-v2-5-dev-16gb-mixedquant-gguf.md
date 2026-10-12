# fooooooooooooooooooooooooooooooooooooooooo/KAT-Coder-V2.5-Dev-16GB-MixedQuant-GGUF

## Resumen

KAT-Coder-V2.5-Dev-16GB-MixedQuant-GGUF es una compilacion de cuantizacion mixta en formato GGUF del modelo Kwaipilot/KAT-Coder-V2.5-Dev, publicada por el usuario `fooooooooooooooooooooooooooooooooooooooooo`. No se trata de un modelo nuevo ni de un entrenamiento adicional: es un derivado cuantizado pensado para ejecucion local en llama.cpp, con dos variantes (IQ3_XXS e IQ4_XS) que mezclan distintos niveles de precision por tensor para conservar calidad donde mas importa.

El modelo subyacente es un MoE de 34.660.610.688 parametros totales (segun los pesos safetensors del repositorio base), con arquitectura hibrida que combina atencion con capas de tipo SSM y expertos compartidos, segun se deduce de los tensores preservados a mayor precision (`ssm_out`, `shared expert`, `ffn_*_exps`). Los tags del repositorio lo asocian a las familias Qwen3.5/Qwen3.6 y a casos de uso de codigo y codificacion agentica.

Su relevancia practica es la eficiencia: la variante IQ3_XXS ocupa unos 15 GB (14.987,3 MB medidos) y cabe en GPU de 16 GB, mientras que IQ4_XS ronda los 19,5 GB (19.450,1 MB) y encaja comodamente en tarjetas de 22-24 GB. El autor reporta mediciones propias de velocidad y de tasa de exito en HumanEval, aunque advierte que el benchmark sigue en curso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con capas SSM y expertos compartidos, segun los tensores preservados en la cuantizacion (no confirmado en la model card) |
| Parametros totales | 34.660.610.688 (dato de los safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card; el autor indica pruebas con 32k de contexto |
| Tipos de cuantizacion | IQ3_XXS e IQ4_XS mixtas, con tensores en Q6_K y Q8_0; imatrix autocalibrada |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No hay informacion de entrenamiento en la informacion disponible: esta publicacion es exclusivamente un proceso de cuantizacion post-entrenamiento (etiqueta `base_model_relation: quantized`), no un entrenamiento nuevo. Cualquier dato sobre tokens de entrenamiento, composicion del dataset o fases de RLHF/DPO corresponde al modelo original Kwaipilot/KAT-Coder-V2.5-Dev, cuya model card no se ha proporcionado.

La innovacion tecnica de esta build es la estrategia de cuantizacion por capas. En la variante IQ4_XS, los tensores `ffn_gate_exps` y `ffn_up_exps` de las 40 capas se mantienen en IQ4_XS, al igual que `ffn_down_exps`; embeddings y salida en Q8_0; atencion, `ssm_out` y experto compartido en Q6_K. En IQ3_XXS se baja a IQ3_XXS en `ffn_gate_exps`, `ffn_up_exps` y en `ffn_down_exps` de 32 capas, pero se conservan en IQ4_XS las capas 0-3 y 36-39 (extremos de la red), y se mantienen Q8_0 en embeddings/salida y Q6_K en atencion, `ssm_out` y experto compartido. La imatrix se autocalibro con foco en desarrollo web, Python y documentacion en Markdown.

## Capacidades

- Generacion de codigo: el modelo base esta orientado a programacion y los tags incluyen `code` y `coding`.
- Codificacion agentica: etiqueta explicita `agentic-coding`, lo que apunta a flujos multi-paso con edicion de ficheros y ejecucion de herramientas.
- Razonamiento sobre enunciados de programacion: el autor documenta un comportamiento de "doubt spirals" (bucles de duda) y observa que un system prompt que fuerza la traza del primer ejemplo mejora la tasa de acierto en HumanEval del 92% al 96% en IQ4_XS.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, modo thinking explicito): no disponible.
- Conversacional: el tag `conversational` aparece en la ficha de HuggingFace, aunque la model card no detalla plantilla de chat ni formato de prompt.

## Casos de uso

- Asistente de codigo en local para desarrolladores individuales: la variante IQ3_XXS (unos 15 GB) cabe en una GPU de 16 GB y permite autocompletado y generacion de funciones sin enviar codigo a servicios externos, algo critico en entornos con codigo propietario.
- Revision y correccion de parches en CI: dado su rendimiento reportado en HumanEval (92-96% segun configuracion), se puede integrar como paso de validacion que genera un test o una correccion propuesta antes del merge, siempre con revision humana.
- Refactorizacion asistida de bases de codigo web: la imatrix se calibro con foco en desarrollo web, Python y Markdown, por lo que el sesgo de calibracion favorece estos dominios.
- Generacion de documentacion tecnica: el foco de calibracion en Markdown y documentacion lo hace adecuado para producir READMEs, docstrings y guias a partir del codigo fuente.
- Agentes de codigo multi-paso: el tag `agentic-coding` y la arquitectura MoE con contexto de 32k en las pruebas del autor permiten encadenar lecturas de ficheros, ediciones y verificaciones dentro de una misma sesion.
- Despliegue en estaciones de trabajo con una sola GPU consumer: con 19,5 GB en IQ4_XS encaja en tarjetas de 24 GB (RTX 3090/4090, RX 7900 XTX) para equipos de desarrollo que necesitan un modelo de codigo siempre disponible sin coste por token.
- Entornos con requisitos de privacidad (sanidad, banca, sector publico): al ser pesos abiertos bajo Apache-2.0 y ejecutarse integramente en local via llama.cpp, evita la exfiltracion de datos a APIs de terceros.

## Benchmarks y rendimiento

El autor publica resultados propios de HumanEval (trabajo en curso), medidos con temperatura 0,7 y top-p 0,9:

| Modelo | Temp | top-p | Tamano | Pass rate | Tokens medios | Doubt/problem | Spiral rate | Pass calm/doubting | Doubt-free | Hit limit | Tok/s |
|---|---|---|---|---|---|---|---|---|---|---|---|
| IQ4_XS (con system prompt) | 0,7 | 0,9 | 19.450,1 MB | 96% | 489 | 0,46 | 1% | 96% / 93% | 82% | 1% | 25,9 |
| IQ4_XS (base) | 0,7 | 0,9 | 19.450,1 MB | 92% | 286 | 0,33 | 1% | 95% / 73% | 90% | 0% | 26,5 |
| IQ3_XXS (con system prompt) | 0,7 | 0,9 | 14.987,3 MB | 93% | 522 | 0,59 | 1% | 96% / 82% | 82% | 1% | 37,0 |
| IQ3_XXS (base) | 0,7 | 0,9 | 14.987,3 MB | 92% | 348 | 0,60 | 1% | 96% / 78% | 79% | 1% | 74,0 |

El system prompt usado fue: "After writing the code, trace the first example through it and confirm the output matches." No se han publicado resultados de MMLU, GSM8K, SWE-bench ni otras suites en la informacion disponible.

## Requisitos de hardware

- VRAM para IQ3_XXS: unos 15 GB de pesos (14.987,3 MB medidos), mas la cache KV correspondiente al contexto elegido; el autor lo ejecuta con 32k de contexto en una GPU de 16 GB (Radeon RX 7800 XT).
- VRAM para IQ4_XS: unos 19,5 GB de pesos (19.450,1 MB medidos); el autor indica que encaja comodamente en tarjetas de 22-24 GB.
- GPU recomendadas para IQ4_XS: RTX 3090, RTX 4090, RTX 5090, RX 7900 XTX o cualquier acelerador con 24 GB o mas (A100 40 GB, H100 para servir en paralelo).
- GPU recomendadas para IQ3_XXS: RTX 4080/4090, RX 7800 XT, RTX A4000 de 16 GB o superior.
- Cabe en GPU consumer: si, en ambas variantes; IQ3_XXS en 16 GB e IQ4_XS en 24 GB.
- Opciones de despliegue: llama.cpp y sus envoltorios (Ollama, LM Studio, llama-cpp-python, koboldcpp). El repositorio declara compatibilidad con `endpoints_compatible`. No se menciona soporte de vLLM, TGI o SGLang para estos ficheros.
- Throughput medido por el autor: 25,9-26,5 tok/s con IQ4_XS y 37,0-74,0 tok/s con IQ3_XXS en una RX 7800 XT de 16 GB (los 74 tok/s corresponden a la configuracion base sin system prompt, con menos tokens generados de media). El autor indica que IQ4_XS puede reducir a la mitad la velocidad de generacion en una tarjeta de 16 GB.
- Latencia: no disponible de forma desagregada (solo se publican tokens por segundo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KAT-Coder-V2.5-Dev-16GB-MixedQuant-GGUF (IQ4_XS) | 34,66B totales (MoE) | no disponible (probado a 32k) | HumanEval 92-96% (autor) | apache-2.0 | GGUF en HuggingFace, 34,4 GB de repo |
| KAT-Coder-V2.5-Dev-16GB-MixedQuant-GGUF (IQ3_XXS) | 34,66B totales (MoE) | no disponible (probado a 32k) | HumanEval 92-93% (autor) | apache-2.0 | GGUF en HuggingFace |
| Kwaipilot/KAT-Coder-V2.5-Dev (modelo base) | 34.660.610.688 | no disponible | no disponible | apache-2.0 | pesos originales (formato no especificado en la informacion disponible) |
| Otros modelos de codigo comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de alternativas de la misma categoria en la informacion proporcionada, por lo que no se incluyen cifras comparativas que no puedan contrastarse.

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo nuevo: la calidad es necesariamente inferior a la de los pesos originales, con mayor degradacion en IQ3_XXS que en IQ4_XS.
- El unico benchmark publicado es HumanEval, con metodologia propia del cuantizador y marcado explicitamente como "WIP"; no hay evaluaciones independientes.
- El autor documenta "doubt spirals" (el modelo se enreda dudando) mas frecuentes en IQ3_XXS, con un p90 de 32 tokens de duda y un maximo de 39, frente a 12/22 en IQ4_XS.
- El propio autor avisa de que en ocasiones el modelo entiende el problema pero el codigo generado no coincide con lo que parece haber razonado.
- La imatrix se calibro con foco en desarrollo web, Python y Markdown: el rendimiento fuera de esos dominios puede degradarse de forma no medida.
- No hay informacion sobre idiomas soportados, sesgos, tasas de alucinacion ni comportamiento fuera del ambito de codigo.
- No hay datos sobre soporte de tool calling, agentes reales, vision o audio; el tag `agentic-coding` es una etiqueta, no una validacion funcional.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar la licencia y los terminos del modelo base Kwaipilot/KAT-Coder-V2.5-Dev, ya que la cuantizacion hereda sus condiciones.
- La fecha de creacion del repositorio (9 de octubre de 2026) es posterior a la fecha de actualizacion indicada por el autor en sus notas de cuantizacion; conviene comprobar la version exacta de los ficheros antes de desplegar en produccion.
- El usuario que publica la cuantizacion es anonimo (`fooooooooooooooooooooooooooooooooooooooooo`) y el modelo tiene 660 descargas y 0 likes: trazabilidad y validacion por la comunidad muy limitadas.
- En produccion, tratar la salida como sugerencia sujeta a revision, nunca como parche aplicable sin tests.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fooooooooooooooooooooooooooooooooooooooooo/KAT-Coder-V2.5-Dev-16GB-MixedQuant-GGUF
- Modelo base: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Volcado de tensores IQ4_XS: IQ4_XS_GGUFDUMP.md (fichero dentro del repositorio)
- Volcado de tensores IQ3_XXS: IQ3_XXS_GGUFDUMP.md (fichero dentro del repositorio)
- Paper, blog o demo adicionales: no disponible; los resultados de la busqueda web no contenian enlaces relacionados con el modelo.
