# SlayerLab/Slayer149-balanced

## Resumen

Slayer149-balanced es un modelo de lenguaje causal experimental de 149.333.081 parametros entrenado desde cero (from scratch) por SlayerLab, publicado en HuggingFace bajo licencia Apache-2.0. Se trata de un modelo unimodal de generacion de texto, exclusivamente en ingles, con una arquitectura transformer densa de 26 capas, anchura oculta de 576, capa FFN de 2496 y atencion con 9 cabezas de consulta frente a 3 cabezas de clave/valor (GQA con ratio 3:1). El vocabulario es un BPE a nivel de byte de 24.576 tokens, con embeddings atados (tied) y EOS con ID 0.

El modelo se presenta explicitamente como un experimento, no como un producto listo para produccion. La model card indica que el entrenamiento podria seguir en curso en el momento de la publicacion y que no se reclama ninguna posicion en leaderboards ni resultado ganador. La arquitectura esta inspirada en Qwen3 y en la receta Jugnu de AltSlate (Apache-2.0), aunque el autor afirma que no se han reutilizado pesos de Jugnu. Incluye innovaciones tecnicas menores como normalizacion QK (QK normalization) y residuales de valor (value residuals).

Su relevancia es fundamentalmente metodologica: es un ejemplo de entrenamiento reproducible y documentado de un modelo pequeno (rango ~150M) con dataset pinneado, validacion disjunta a nivel de documento y filtrado de solapamiento exacto contra el conjunto de benchmarks. El repositorio pesa 6,3 GB e incluye checkpoints con estado del modelo y de ambos optimizadores, ademas de manifiestos y reportes de entrenamiento. En el momento de la consulta acumula 0 descargas y 0 likes, por lo que no existe validacion externa de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (atención con GQA 9Q/3KV, normalización QK, value residuals), inspirada en Qwen3 y en la receta Jugnu |
| Parametros totales | 149.333.081 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (checkpoint final y raiz del repositorio) y PyTorch `.pt` para estados de entrenamiento (`checkpoints/<step>/training-state.pt`) |

Otros hiperparametros declarados: 26 capas, anchura oculta 576, FFN 2496, vocabulario BPE a nivel de byte de 24.576 tokens con embeddings atados, EOS con ID 0. Tamano del repositorio: 6,3 GB. Creado el 2026-10-01 y actualizado el 2026-10-01.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso con 26 capas, anchura oculta de 576 y capa FFN de 2496 (ratio de expansion aproximado de 4,33x). Emplea atencion con consultas agrupadas: 9 cabezas de query y 3 cabezas de key/value, lo que reduce el coste de la cache KV en inferencia. Incorpora normalizacion QK y residuales de valor. El vocabulario de 24.576 tokens es un BPE a nivel de byte con embeddings atados entre entrada y salida, lo que es coherente con el rango de tamano del modelo. El `tokenizer.json` preserva Unicode y espacios en blanco.

Los datos de entrenamiento provienen de fuentes pinneadas: FineWeb-Edu, DCLM-edu, Cosmopedia-v2 y FineMath. El autor declara validacion disjunta a nivel de documento y filtrado de solapamiento exacto contra la suite de benchmarks, y advierte explicitamente que dicho filtrado no constituye una garantia de no contaminacion semantica. No se especifica el numero total de tokens de entrenamiento, la composicion porcentual del dataset ni si se aplicaron etapas de RLHF, DPO o SFT; la model card tampoco menciona decodificacion especulativa ni mecanismos de atencion lineal. El estado del entrenamiento puede consultarse en `reports/status.json`, en las metricas de entrenamiento y en los manifiestos de checkpoint, no incluidos en la informacion disponible.

El objetivo declarado por el autor era disponer de un checkpoint duradero y un informe de evaluacion antes de las 15:00 hora de Varsovia del 2026-10-01, dentro de una reserva gratuita de GPU confirmada, sin que ello implique ninguna promesa sobre la calidad del modelo. La evaluacion final prevista es de tipo GLINT y se publicaria en `reports/evaluation.json` cuando este disponible; el autor advierte que las puntuaciones de competidores pueden usar convenciones de evaluacion distintas.

## Capacidades

- Generacion de texto causal en ingles: es la funcion principal declarada por el pipeline (`text-generation`).
- Modelo entrenado desde cero, sin destilacion ni fine-tuning sobre pesos existentes.
- Tokenizacion BPE a nivel de byte con vocabulario de 24.576 tokens y preservacion de Unicode y espacios en blanco.
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card ni en el chat template).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no, el modelo esta declarado unicamente para ingles.
- Capacidades especiales (modo thinking, vision, audio): ninguna declarada.
- Carga mediante loader propio de PyTorch (`load_model`); no es un paquete compatible con `AutoModel` de Transformers.

## Casos de uso

- Investigacion sobre recetas de entrenamiento desde cero: el repositorio documenta fuentes de datos pinneadas, filtrado de solapamiento y manifiestos de checkpoints, lo que permite reproducir o auditar el pipeline en un rango de computo accesible (aproximadamente 150M de parametros).
- Experimentos de ablacion a pequena escala: con 26 capas y 576 de anchura oculta, es viable entrenar variantes completas en una unica GPU y comparar decisiones de diseno (GQA 9Q/3KV, normalizacion QK, residuales de valor) frente a una linea base.
- Generacion de texto en ingles con recursos minimos: al caber en cualquier GPU de consumo e incluso en CPU con cuantizacion casera, sirve para prototipos de autocompletado o generacion de borradores donde la calidad no sea critica.
- Fine-tuning especifico de dominio: al ser Apache-2.0 y estar en safetensors, se puede ajustar sobre corpus propios en ingles (soporte, documentacion tecnica, clasificacion generativa) sin restricciones de licencia para uso comercial.
- Docencia y formacion: es un caso practico para explicar tokenizacion BPE a nivel de byte, embeddings atados, GQA y estados de optimizador en checkpoints.
- Pruebas de infraestructura de serving: sirve como modelo de juguete para validar pipelines de carga personalizada en PyTorch, dado que no es compatible con `AutoModel` ni con convertidores estandar a GGUF.
- Evaluacion comparativa de modelos pequenos: util como punto de comparacion propio frente a otras lineas base de ~150M en tareas de ingles, siempre que se acepte que no existen resultados de benchmark publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra suite, y el autor indica explicitamente que no reclama ninguna posicion en leaderboards. Se menciona la existencia prevista de un informe de evaluacion derivado de GLINT en `reports/evaluation.json`, pero su contenido no forma parte de la informacion proporcionada.

| Benchmark | Slayer149-balanced | Modelos comparables |
|---|---|---|
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en FP32 (149,3M parametros x 4 bytes), unos 0,3 GB en FP16/BF16 y alrededor de 0,15 GB en int8. Estas cifras corresponden solo a los pesos y no incluyen la cache KV ni el overhead del runtime.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente; no se requiere A100 ni H100. Una RTX 4090, una RTX 3060 o incluso una GPU integrada moderna pueden ejecutarlo, ya que el cuello de botella es el ancho de banda de memoria, no la capacidad de computo.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual y en la mayoria de iGPU con memoria compartida suficiente.
- Opciones de despliegue: unicamente el loader personalizado de PyTorch incluido en el repositorio (`load_model`). No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni LM Studio, y al no ser un paquete `AutoModel` no se puede cargar directamente con `transformers` sin adaptar el codigo.
- Nota sobre el peso del repositorio: los 6,3 GB del repositorio no corresponden al modelo en inferencia, sino a los checkpoints con estado del modelo y de ambos optimizadores (`checkpoints/<step>/training-state.pt`).
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Slayer149-balanced | 149,3M | no disponible | Apache-2.0 | Pesos en safetensors con loader propio; 0 descargas, 0 likes | no disponible |
| SmolLM2-135M | 135M | 2.048 tokens | Apache-2.0 | Pesos en safetensors, integrado en `transformers` y llama.cpp | no disponible en esta ficha |
| Qwen2.5-0.5B | 494M | 32.768 tokens | Apache-2.0 | Pesos en safetensors, amplio soporte de runtimes | no disponible en esta ficha |
| Pythia-160M | 162M | 2.048 tokens | Apache-2.0 | Pesos en safetensors, checkpoints intermedios publicados | no disponible en esta ficha |

Los datos de los modelos comparables no provienen de la informacion proporcionada en esta consulta y deben verificarse en sus respectivas model cards antes de usarse. La comparacion relevante aqui es mas de disponibilidad y ecosistema que de rendimiento: frente a alternativas del mismo rango, Slayer149-balanced no ofrece contexto declarado, no tiene versiones cuantizadas, no esta integrado en `transformers` ni en llama.cpp y no cuenta con ninguna descarga ni validacion externa.

## Limitaciones y advertencias

- Modelo experimental: la propia model card lo etiqueta como `experimental` y aclara que el entrenamiento podria seguir en curso.
- Ausencia total de benchmarks publicados: no se puede afirmar nada sobre su calidad relativa frente a otras lineas base de ~150M.
- Cero validacion externa: 0 descargas y 0 likes en HuggingFace en el momento de la consulta.
- Longitud de contexto no declarada: no se puede planificar su uso en tareas que requieran ventanas largas sin una verificacion empirica previa.
- Solo ingles: no hay capacidades multilingues declaradas, incluido el castellano.
- Riesgo de alucinacion: inherente a un modelo causal de 149M parametros entrenado desde cero, sin etapas de alineacion documentadas (no se mencionan RLHF, DPO ni SFT).
- Sesgos: los corpus de origen (FineWeb-Edu, DCLM-edu, Cosmopedia-v2, FineMath) son predominantemente de dominio educativo y en ingles, lo que puede introducir sesgos de dominio y de representacion no evaluados.
- Caveat de contaminacion: el autor advierte que el filtrado de solapamiento exacto no garantiza ausencia de contaminacion semantica en los benchmarks.
- Integracion limitada: no es un paquete `AutoModel`, requiere el codigo de carga propio; no hay GGUF ni soporte en vLLM, TGI, llama.cpp u Ollama.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero al no existir evaluacion publicada, cualquier despliegue en produccion se realiza sin garantias de comportamiento.
- Fechas de publicacion y actualizacion declaradas como 2026-10-01, posteriores a la fecha habitual de referencia; conviene confirmar el estado real del repositorio antes de usarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SlayerLab/Slayer149-balanced
- Modelo relacionado del mismo autor: https://huggingface.co/SlayerLab/Slayer149
- Receta Jugnu de AltSlate (referencia arquitectonica citada, Apache-2.0): no disponible (URL no incluida en la informacion proporcionada)
- Informe de evaluacion GLINT (`reports/evaluation.json`): referenciado en la model card, sin URL publica en la informacion disponible
- Estado del entrenamiento (`reports/status.json`): referenciado en la model card, sin URL publica en la informacion disponible
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los unicos resultados obtenidos tratan sobre cine de samurais y no guardan relacion con Slayer149-balanced.
