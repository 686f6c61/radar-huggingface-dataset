# g-assismoraes/DeltaP2S-Gemma2-9B-P2S-CodeGemma7B-Code-S13

## Resumen

DeltaP2S-Gemma2-9B-P2S-CodeGemma7B-Code-S13 es un checkpoint fusionado publicado por el usuario g-assismoraes en HuggingFace. No se trata de un modelo entrenado desde cero ni de un ajuste fino convencional, sino del resultado de un experimento de fusión de parámetros denominado Delta-P2S (etiqueta `pen2sword`), que combina los pesos de dos modelos base de Google: Gemma 2 9B y CodeGemma 7B. La model card es mínima y solo indica que se trata de un "merged checkpoint produced by the family-aware Delta-P2S experiment package", con la ruta de entrenamiento `./runs/codegemma7b_to_gemma2_9b_S13_untie/init/p2s`.

El repositorio contiene 10.159.209.984 parámetros (unos 10,16 mil millones) en formato safetensors, con un tamano total de 20,4 GB. Ese recuento es superior al de Gemma 2 9B (~9,24 B), lo que apunta a que la fusión se realizó con embeddings de entrada y salida no atados (de ahí el sufijo `untie` de la ruta interna): la matriz de proyección final anadiría del orden de 917 millones de parámetros a la arquitectura original. Es una hipótesis derivada del recuento de parámetros, no un dato confirmado por el autor.

La relevancia de esta ficha es limitada y debe enmarcarse como tal: el modelo acumula 0 descargas y 0 likes, no incluye resultados de evaluación, no declara licencia ni idiomas, y no se ha publicado documentación técnica del experimento. Su interés es principalmente el de un artefacto de investigación sobre técnicas de fusión de modelos (model merging) con preservación de capacidades de código, no el de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Gemma 2 (inferido del checkpoint base; no confirmado en la model card) |
| Parametros totales | 10.159.209.984 (10,16 B) segun metadatos de safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (los modelos base Gemma 2 9B y CodeGemma 7B usan 8192 tokens; sin confirmar tras la fusion) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors en 16 bits) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (al derivar de Gemma 2 y CodeGemma, es previsible que apliquen los Gemma Terms of Use) |
| Formato de pesos | safetensors |
| Prefijo de biblioteca | transformers |
| Tamano del repositorio | 20,4 GB (equivalente a ~16 bits por parametro) |
| Tipo de checkpoint | Fusion de pesos (merged checkpoint), no entrenamiento desde cero |
| Modelos de origen | Gemma 2 9B y CodeGemma 7B |
| Tecnica declarada | Delta-P2S / pen2sword (family-aware), con embeddings no atados |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-13 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura de forma explicita. Por herencia de los modelos base, cabe esperar un transformer decoder-only con normalizacion RMSNorm, activacion GeGLU, atencion con consultas agrupadas (GQA) y atencion alterna entre ventana local y ventana global, tal como se define en la familia Gemma 2. Sin embargo, el autor no publica configuracion, ni ficha de tokenizer, ni confirmacion de que esos hiperparametros se hayan conservado tras la fusion, por lo que cualquier detalle arquitectonico concreto debe considerarse no disponible.

Tampoco hay informacion sobre datos de entrenamiento: no se indica numero de tokens, composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste instruccional. La model card sugiere que el artefacto procede de un paquete experimental denominado "Delta-P2S" con un enfoque "family-aware", es decir, una fusion consciente de que ambos modelos comparten linaje (Gemma), y con la variante `untie` que separa las matrices de embedding y de proyeccion de salida. El recuento de parametros (10,16 B frente a los ~9,24 B de Gemma 2 9B) es coherente con esa separacion: un vocabulario de 256.000 entradas sobre un `hidden_size` de 3.584 anade aproximadamente 917 millones de parametros. No hay informacion sobre decodificacion especulativa, atencion lineal ni ninguna otra innovacion de inferencia.

## Capacidades

- Generacion de texto autoregresiva en el pipeline `text-generation`, segun los tags del repositorio.
- Generacion y autocompletado de codigo: es la capacidad esperada dado que uno de los modelos de origen es CodeGemma 7B, especializado en codigo.
- Razonamiento sobre lenguaje natural: capacidad esperada por herencia de Gemma 2 9B.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el autor no declara idiomas).
- Modo "thinking" o razonamiento explicito: no disponible.
- Vision o audio: no disponible (los modelos base son exclusivamente de texto).
- Compatibilidad declarada con text-generation-inference y endpoints compatibles, segun los tags.

Ninguna de estas capacidades ha sido verificada mediante evaluacion publicada por el autor.

## Casos de uso

- Generacion de codigo asistida en IDE: el modelo puede servir como backend de autocompletado o generacion de funciones, aprovechando el linaje CodeGemma. Requiere validacion previa, ya que no hay evals publicadas.
- Explicacion y refactorizacion de codigo heredado: dado un fragmento de codigo, el modelo puede generar una descripcion funcional y proponer una version refactorizada; es un caso razonable para un modelo con mezcla de capacidades de lenguaje y codigo.
- Generacion de pruebas unitarias: el modelo puede producir esqueletos de tests a partir de firmas de funciones o de codigo existente, que despues se ejecutarian y corregirian en el pipeline de CI.
- Documentacion tecnica automatica: generacion de docstrings, comentarios y guias de API a partir del codigo fuente combinado con documentacion existente.
- Investigacion en fusion de modelos: el checkpoint es util como objeto de estudio para comparar tecnicas de merging (Delta-P2S frente a metodos como SLERP, TIES o DARE) y medir la degradacion o preservacion de capacidades.
- Punto de partida para ajuste fino posterior: al ser un modelo de ~10 B en safetensors, puede servir como inicializacion para LoRA o QLoRA en tareas mixtas de codigo y lenguaje, siempre que se resuelva la cuestion de licencia.
- Prototipado de asistentes tecnicos con RAG: integrado sobre una base documental propia, puede responder preguntas sobre una API o una base de codigo concreta.
- Revision de codigo automatizada en pre-merge: generacion de comentarios sobre diffs, con un paso humano de validacion obligatorio dado el riesgo de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MBPP ni ninguna otra metrica, y el repositorio no adjunta scripts de evaluacion ni comparativas con los modelos de origen.

## Requisitos de hardware

Estimaciones basadas en el recuento de parametros (10,16 B) y en la configuracion publica de Gemma 2 9B. No estan confirmadas para este checkpoint concreto.

| Precision | Pesos aproximados | VRAM total estimada | GPUs tipicas |
|---|---|---|---|
| bf16 / fp16 | ~20,3 GB | ~24-28 GB (incluyendo cache KV) | RTX 4090 24 GB (ajustado), A100 40 GB, L40S 48 GB, H100 80 GB |
| int8 | ~10,2 GB | ~14-16 GB | RTX 4080 16 GB, RTX 3090 24 GB, RTX 4090 |
| int4 | ~5,5-6 GB | ~9-12 GB | RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 |

- Cache KV: con la configuracion de Gemma 2 9B (8 cabezas KV de 256 dimensiones, 42 capas), la cache en fp16 ronda los 344 KB por token, unos 2,8 GB para 8192 tokens. Es una estimacion, no un dato medido.
- Cabe en GPU de consumo: si, en cuantizacion int4 o int8. En bf16 requiere 24 GB como minimo y deja poco margen para contexto largo.
- Opciones de despliegue: al estar en safetensors y declarar tags de text-generation-inference y endpoints compatibles, es desplegable con TGI y, previsiblemente, con vLLM. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, algo no verificado en este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeltaP2S-Gemma2-9B-P2S-CodeGemma7B-Code-S13 | 10,16 B | No disponible (base: 8192) | No disponible | HuggingFace, 0 descargas, 0 likes, sin evaluacion |
| Gemma 2 9B (Google) | ~9,24 B | 8192 | Gemma Terms of Use | Ampliamente distribuido, con evaluacion publica |
| CodeGemma 7B (Google) | ~8,5 B | 8192 | Gemma Terms of Use | Ampliamente distribuido, con evaluacion publica |
| Qwen2.5-Coder 7B (Alibaba) | ~7,6 B | 32768 | Apache 2.0 | Ampliamente distribuido, con evaluacion publica |

El modelo fusionado no aporta ninguna ventaja verificable frente a sus dos modelos de origen: no hay metricas, no hay licencia declarada y no hay documentacion del pipeline de fusion. Frente a Qwen2.5-Coder 7B pierde en contexto (si hereda 8192) y en claridad de licencia.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparativas con los modelos base, ni validacion cualitativa publicada. Es imposible estimar la perdida de capacidad provocada por la fusion.
- Licencia no declarada: el repositorio no especifica licencia. Al derivar de Gemma 2 9B y CodeGemma 7B, es previsible que se apliquen los Gemma Terms of Use, que incluyen restricciones de uso, obligaciones de atribucion y una politica de uso prohibido. El uso comercial no puede darse por supuesto sin revisar esa licencia.
- Riesgo de alucinacion: no cuantificado, pero inherente a los modelos de lenguaje de este tamano y agravado por la falta de evaluacion.
- Idiomas no declarados: no hay garantia de comportamiento en castellano ni de cobertura multilingue.
- Duplicacion de parametros por embeddings no atados: el modelo ocupa mas memoria que Gemma 2 9B (10,16 B frente a ~9,24 B) sin que se haya demostrado una ganancia de calidad equivalente.
- Artefacto sin validacion comunitaria: 0 descargas y 0 likes implican que nadie ha reportado si el checkpoint carga correctamente, si el tokenizer es coherente o si genera texto util.
- Procedencia opaca: la model card solo referencia una ruta local de un paquete experimental, sin paper, sin repositorio publico y sin descripcion del algoritmo Delta-P2S.
- Advertencia para produccion: no se recomienda su uso en entornos productivos sin una evaluacion propia exhaustiva, verificacion de licencia y prueba de carga del checkpoint.

## Enlaces

- HuggingFace: https://huggingface.co/g-assismoraes/DeltaP2S-Gemma2-9B-P2S-CodeGemma7B-Code-S13
- Paper del metodo Delta-P2S: no disponible
- Repositorio del experimento "pen2sword": no disponible
- Modelo base Gemma 2 9B: no incluido en la informacion proporcionada
- Modelo base CodeGemma 7B: no incluido en la informacion proporcionada
- La busqueda web realizada no devolvio resultados relevantes: los unicos enlaces recuperados corresponden a paginas genericas de Google y a la entrada "G" de Wikipedia, sin relacion con el modelo.
