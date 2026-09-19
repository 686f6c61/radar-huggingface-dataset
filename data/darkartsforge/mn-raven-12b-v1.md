# DarkArtsForge/MN-Raven-12B-v1

## Resumen

MN-Raven-12B-v1 es un ajuste fino (fine-tune) del modelo Mistral-Nemo-12B orientado a escritura creativa, narrativa gótica y roleplay (RP), desarrollado por DarkArtsForge. No es un entrenamiento desde cero ni un modelo con arquitectura propia: se trata de un merge construido con mergekit a partir de dos LoRA entrenados sobre el dataset DarkArtsForge/Poe_v1, con el objetivo declarado de reproducir el registro melancólico y macabro de la literatura del siglo XIX, con Edgar Allan Poe como referencia explícita. El modelo se distribuye sin censura (uncensored) y con licencia Apache 2.0.

Técnicamente es un transformer decoder-only denso de 12.247.782.400 parámetros (dato real de safetensors), heredado de la arquitectura Mistral-Nemo, con tokenizador Tekken. El repositorio ocupa 39,2 GB en pesos safetensors en transformers. La ficha recomienda la plantilla de chat "Mistral Tekken" para obtener los mejores resultados y advierte de que el modelo puede generar contenido violento y erótico explícito.

Su relevancia es acotada y de nicho: no compite en benchmarks de razonamiento o código, sino que se posiciona como modelo especializado en prosa atmosférica para ficción interactiva y RP, con 38 descargas y 11 "likes" en el momento de la consulta. No hay datos publicados de contexto efectivo, idiomas, benchmarks ni cuantizaciones oficiales en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (arquitectura Mistral-Nemo), tokenizador Tekken |
| Parametros totales | 12.247.782.400 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No indicada en la ficha del autor; el modelo base Mistral-Nemo-12B declara 128.000 tokens, valor no verificado tras el fine-tune |
| Tipos de cuantizacion | No especificados por el autor; al ser un modelo transformers con pesos safetensors es convertible a GGUF (llama.cpp), GPTQ y AWQ |
| Idiomas soportados | No disponibles en la informacion proporcionada (etiquetas y dataset orientados a ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | Naphula-Archives/MN-Raven-12B-v0c-Base-LoRA y Naphula-Archives/MN-Raven-12B-v0o-Instruct-LoRA (derivados de Mistral-Nemo) |
| Dataset de ajuste | DarkArtsForge/Poe_v1 |
| Tamano del repositorio | 39,2 GB |
| Pipeline | text-generation |
| Compatibilidad de servicio | text-generation-inference, endpoints_compatible |
| Fecha de creacion | 2026-05-28 |
| Ultima actualizacion | 2026-09-18 |
| Descargas / likes | 38 / 11 |

## Arquitectura y entrenamiento

La arquitectura es la de Mistral-Nemo-12B: un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU, RoPE y atencion con consultas agrupadas (GQA). La ablacion MPOA descrita en la ficha del autor se aplica a las capas 1 a 39, lo que es coherente con un stack de 40 capas. El modelo no introduce innovaciones arquitectonicas propias: toda la especificidad esta en el proceso de ajuste y mezcla.

El proceso de construccion tiene tres etapas segun la model card: (1) se ajusto el dataset Poe_v1 durante 3 epocas sobre MuXodious/Mistral-Nemo-Instruct-2407-absolute-heresy, dando lugar al LoRA de instruct (v0o), que el autor indica como el mejor de las configuraciones probadas; (2) se ajusto un segundo LoRA sobre Retreatcost/Mistral-Nemo-Base-2407-ChatML, el LoRA de base (v0c), que despues fue ablatado con MPOA usando un `measure.py` parcheado sobre las capas 1-39, con escala 1.2 y medida 37; (3) ambos LoRA se fusionaron mediante el metodo `arcee_fusion` de mergekit sobre el modelo base. No se menciona en la informacion disponible ninguna fase de RLHF, DPO o preferencias; el ajuste es exclusivamente supervisado (SFT) sobre Poe_v1. La model card proporcionada esta truncada en el punto exacto que describe el merge final, por lo que los detalles completos de la fusion no estan disponibles.

## Capacidades

- Generacion de texto narrativo y creativo, con especial enfasis declarado en prosa gotica, atmosferica y de vocabulario arcaico y refinado.
- Roleplay (RP) en conversaciones multi-turno, con personajes y escenas sostenidas.
- Variacion alta entre regeneraciones ("swipe variance"), pensada para interfaces de escritura asistida donde el usuario alterna respuestas.
- Escritura de escenas de terror, duelo, melancolia y tema macabro.
- Salida sin censura: el modelo no incorpora filtros declarados de contenido violento o erotico explicito.
- Seguimiento de instrucciones y formato conversacional, condicionado al uso de la plantilla Mistral Tekken.
- Capacidades heredadas del modelo base Mistral-Nemo (conocimiento general, multilingue, codigo), no documentadas ni evaluadas especificamente para este fine-tune.
- Tool calling / function calling: no documentado en la informacion disponible.
- Modo de razonamiento explicito (thinking mode), vision o audio: no documentado en la informacion disponible.

## Casos de uso

- Ficcion interactiva y novelas visuales: el modelo esta entrenado especificamente para generar prosa gotica coherente por escenas, lo que permite integrarlo como motor narrativo de aventuras conversacionales con tono sostenido.
- Roleplay con personajes historicos o literarios: puede mantener el registro de un narrador decimonono o de un personaje inspirado en Poe a lo largo de una conversacion multi-turno, usando la plantilla Mistral Tekken.
- Generacion de borradores de relato corto de terror: util como primer borrador para autores que trabajan cuento gotico, con variacion entre regeneraciones para explorar distintos desenlaces.
- Herramienta de escritura creativa asistida: integrable en un editor con regeneracion de parrafos, aprovechando la varianza alta entre "swipes" como mecanismo de sugerencia multiple.
- Modulo de texto para videojuegos de terror o misterio: generacion de descripciones de entornos, objetos y dialogos secundarios con un registro estilistico consistente.
- Simulacion de personajes para investigacion en narrativa computacional: al ser un fine-tune pequeno (12B) y de licencia Apache 2.0, es adecuado para experimentos academicos sobre estilo, tono y divergencia estilistica frente al modelo base.
- Subtitulado estilizado y localizacion creativa: reescritura de dialogos en un registro gotico o arcaico para doblaje o adaptaciones, siempre bajo supervision humana.
- Generacion de material de juego de rol de mesa: descripciones de escenarios, PNJ y eventos con ambientacion lugubre, ejecutable en local con cuantizacion de 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones de escritura creativa; tampoco ofrece comparaciones cuantitativas con el modelo base Mistral-Nemo-Instruct-2407 ni con otros fine-tunes de RP. Cualquier cifra de rendimiento seria, por tanto, no verificable.

## Requisitos de hardware

- VRAM para inferencia en FP16/BF16: aproximadamente 24,5 GB solo para pesos (12,25B x 2 bytes) mas cache KV; en la practica, del orden de 28 a 32 GB segun longitud de contexto y tamano de lote.
- VRAM en 8 bits: aproximadamente 13 a 15 GB de pesos mas cache KV.
- VRAM en 4 bits (GGUF Q4_K_M): aproximadamente 7,5 a 8 GB de pesos.
- Cache KV estimada a partir de la configuracion del modelo base (40 capas, 8 cabezas KV, head_dim 128, FP16): unos 160 KB por token, es decir, alrededor de 1,3 GB a 8.000 tokens, 5,2 GB a 32.000 tokens y 20,5 GB a 128.000 tokens. La atencion de contexto largo es, por tanto, el principal consumidor de memoria, no los pesos.
- GPU recomendadas: A100 40 GB, L40S 48 GB o H100 80 GB para FP16 con contexto largo; RTX 4090 o RTX 3090 (24 GB) para FP16 con contexto corto o para 8 bits; dos RTX 4090 con paralelismo tensorial para FP16 con contexto amplio.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090 usando cuantizacion de 4 o 5 bits; en 16 GB de VRAM es viable en 4-6 bits con contexto moderado. En equipos Apple Silicon con memoria unificada de 16 GB o mas, es viable en 4 bits.
- Opciones de despliegue: vLLM y TGI (el repositorio esta etiquetado como text-generation-inference y endpoints_compatible), llama.cpp y Ollama tras conversion a GGUF, y transformers con la libreria estandar. Para texto creativo en local, llama.cpp u Ollama con Q4_K_M o Q5_K_M son las opciones mas razonables.
- Latencia y throughput: no disponibles. No hay datos publicados de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento publicado |
|---|---|---|---|---|---|
| MN-Raven-12B-v1 | 12,25B | No verificado (base: 128.000 tokens) | Apache 2.0 | Escritura creativa gotica y RP sin censura | No disponible |
| Mistral-Nemo-Instruct-2407 | 12,2B | 128.000 tokens | Apache 2.0 | Instruct generalista y multilingue | Metricas del autor disponibles en su ficha; no comparables directamente con este fine-tune |
| Mistral-Nemo-Base-2407 | 12,2B | 128.000 tokens | Apache 2.0 | Modelo base sin ajuste conversacional | No aplica |
| Qwen2.5-14B-Instruct | 14,7B | 32.768 tokens nativos, ampliable a 131.072 con escalado RoPE | Apache 2.0 | Instruct generalista multilingue, con soporte de tool calling | Metricas publicadas por el autor |

No hay datos de benchmarks de MN-Raven-12B-v1 que permitan una comparacion cuantitativa. La comparacion con fine-tunes de RP de la misma categoria (por ejemplo, otros merges sobre Mistral-Nemo) no puede establecerse con la informacion disponible.

## Limitaciones y advertencias

- Contenido sin censura: la propia ficha advierte de que el modelo puede producir narrativas con violencia y erotismo grafico. Requiere system prompts de control y no es apto para productos dirigidos a menores ni para entornos sin moderacion.
- Sesgo estilistico fuerte: el ajuste sobre un corpus de Poe empuja la salida hacia un registro gotico, arcaico y melancolico. Puede degradar el tono neutro, tecnico o corporativo en tareas que no sean creativas.
- Idioma: no hay idiomas declarados ni evaluacion multilingue. El dataset de ajuste y las etiquetas apuntan al ingles; es previsible una degradacion en castellano y otros idiomas respecto al modelo base, aunque no hay datos que lo confirmen.
- Riesgo de alucinacion: no hay evaluacion de fidelidad factual. En tareas de recuperacion o respuesta factual no debe usarse sin verificacion.
- Plantilla obligatoria: el autor indica que hay que usar la plantilla Mistral Tekken para obtener buenos resultados; usar otra plantilla puede degradar notablemente la calidad.
- Contexto no verificado: aunque el modelo base soporta 128.000 tokens, la ficha no confirma el contexto efectivo tras el fine-tune ni si la mezcla de LoRA preserva las capacidades de contexto largo.
- Sin benchmarks ni evaluacion independiente: 38 descargas y 11 "likes" indican una validacion comunitaria muy escasa.
- Licencia: los pesos se publican bajo Apache 2.0, lo que permite uso comercial, pero conviene revisar las condiciones de los modelos y datasets intermedios citados (Mistral-Nemo, Mistral-Nemo-Instruct-2407-absolute-heresy, Mistral-Nemo-Base-2407-ChatML, Poe_v1) antes de un despliegue en produccion.
- Metadatos inconsistentes: las fechas de creacion y actualizacion del repositorio (2026) son posteriores a la fecha de consulta, lo que sugiere un error de marcado temporal en el repositorio.
- Model card truncada: la informacion disponible corta la descripcion del proceso de fusion `arcee_fusion`, por lo que no se conocen todos los hiperparametros del merge.
- Compatibilidad: esta etiquetado para text-generation-inference y endpoints_compatible, pero no se documenta soporte de tool calling ni de agentes multi-paso; no debe asumirse.


- Modelo en HuggingFace: https://huggingface.co/DarkArtsForge/MN-Raven-12B-v1
- Dataset de ajuste: https://huggingface.co/datasets/DarkArtsForge/Poe_v1
- LoRA base (v0c): https://huggingface.co/Naphula-Archives/MN-Raven-12B-v0c-Base-LoRA
- LoRA instruct (v0o): https://huggingface.co/Naphula-Archives/MN-Raven-12B-v0o-Instruct-LoRA
- Modelo base del LoRA instruct: https://huggingface.co/MuXodious/Mistral-Nemo-Instruct-2407-absolute-heresy
- Modelo base del LoRA v0c: https://huggingface.co/Retreatcost/Mistral-Nemo-Base-2407-ChatML
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Herramientas de ablacion MPOA citadas: https://huggingface.co/spaces/Naphula/model_tools/discussions/8
- Imagen de portada de la model card: https://cdn-uploads.huggingface.co/production/uploads/68e840caa318194c44ec2a04/NR5BwUgP8vmvpcH-DUzMp.png
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con el modelo (hilos de soporte sobre clientes de correo de un operador de telecomunicaciones) y no se han utilizado como fuente.
