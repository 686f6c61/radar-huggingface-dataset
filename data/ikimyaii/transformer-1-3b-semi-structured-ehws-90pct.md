# ikimyaii/Transformer-1.3B-semi-structured-EHWS-90pct

## Resumen

Transformer-1.3B-semi-structured-EHWS-90pct es un modelo derivado de `fla-hub/transformer-1.3B-100B` al que se le ha aplicado un proceso de poda (pruning) hasta alcanzar una esparsidad semi-estructurada del 90%. Lo publica el usuario `ikimyaii` en Hugging Face y su interes no esta en las capacidades del modelo en si, sino en la metodologia de compresion: demuestra que es posible eliminar el 90% de los pesos de las capas lineales manteniendo un comportamiento funcional, aunque con una degradacion notable del rendimiento.

El modelo conserva 1.364.297.728 parametros en el checkpoint (las capas podadas mantienen su forma densa con ceros, no se eliminan fisicamente), y el repositorio ocupa 5,5 GB en safetensors. La poda es semi-estructurada: cada fila de cada capa lineal podada conserva exactamente el mismo numero de pesos (el 10% superior), lo que garantiza un balanceo perfecto del trabajo por fila en kernels de hardware especializado.

Es relevante ahora como referencia practica para investigadores que trabajan en compresion de modelos y despliegue eficiente: documenta un pipeline reproducible (ADMM en dos fases, calibracion con C4) que se ejecuta en 2,76 horas en una sola A100 40GB, y publica tanto perplexity como resultados zero-shot para medir el coste real de la esparsidad extrema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: fla-hub/transformer-1.3B-100B, con capas de atencion de flash-linear-attention) |
| Parametros totales | 1.364.297.728 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de 1.3B parametros del proyecto `fla-hub`, que requiere la libreria `flash-linear-attention` (import fla) y `flash-attn` para cargar las capas de atencion. Sobre este modelo base se aplica un esquema de poda en dos fases. La fase 1 es local, de estilo ALPS: poda cada capa hasta el 70% minimizando el error de reconstruccion `||(W - W0) X||^2`, usando matrices de Hessian calculadas sobre secuencias de calibracion de C4. La fase 2 es global: aplica ADMM sobre la perdida de entropia cruzada y destilacion de conocimiento del modelo completo, con un paso Z basado en Diag(H), 128 rondas de 32 pasos, learning rate 0.0006, lambda constante de 0.01, beta2 de Adam 0.95 y semilla 0. La fase 2 completa la poda hasta el 90%.

Los datos de entrenamiento son las 32.768 secuencias de C4 de 2.048 tokens que usa el codigo oficial de ELSA, tokenizadas con el tokenizer del modelo base (`fla-hub_hgrn-1.3B-100B`), cada una vista una sola vez. La innovacion tecnica destacable es la combinacion de poda local por capa con ajuste global ADMM y destilacion, y el caracter semi-estructurado de la esparsidad: cada fila de cada capa podada conserva el mismo numero de no-ceros (verificado en las 168 capas podadas), lo que permite kernels con balanceo perfecto. Embeddings y `lm_head` permanecen densos. El run completo, incluyendo evaluacion, tardo 2,76 horas en una A100 40GB.

## Capacidades

- Generacion de texto autoregresiva: hereda la funcionalidad del modelo base, aunque con calidad degradada por la poda.
- Razonamiento y conocimiento general: mantiene capacidad de responder tareas de opcion multiple y comprension lectora, con caidas medibles frente al denso.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles (no se especifican idiomas).
- No se documentan modos especiales (thinking, vision, audio).
- El valor principal del checkpoint es como objeto de estudio de tecnicas de poda y esparsidad, no como modelo de produccion.

## Casos de uso

- Investigacion en compresion de modelos: sirve como referencia reproducible para comparar tecnicas de poda (ALPS, ADMM, SparseGPT, Wanda) sobre un mismo modelo base y protocolo de evaluacion.
- Estudio de kernels de esparsidad semi-estructurada: al garantizar el mismo numero de no-ceros por fila en las 168 capas podadas, permite validar implementaciones de matmul disperso con balanceo perfecto de carga en GPU.
- Benchmarking de pipelines de pruning: el run completo en 2,76 horas en una A100 40GB establece una linea base de coste computacional para experimentos de poda extrema.
- Analisis del trade-off calidad/esparsidad: con perplexity de 42,59 en WikiText-2 frente a 9,77 del denso, es un caso de estudio util para cuantificar el coste de eliminar el 90% de los pesos.
- Docencia y divulgacion: ejemplo didactico de un pipeline ADMM en dos fases con calibracion Hessiana, destilacion y evaluacion estandarizada.
- Pruebas de carga y despliegue de checkpoints dispersos: util para verificar que frameworks de inferencia (con soporte de esparsidad) cargan correctamente pesos con estructura semi-estructurada.

## Benchmarks y rendimiento

Perplexity (protocolo de evaluacion de ELSA, WikiText-2 y C4, fp16, ejecucion unica):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 9,77 | 14,65 |
| Este modelo (90% esparsidad) | 42,59 | 38,86 |

Precision zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2355 | 0,1852 |
| arc_easy | 0,5602 | 0,3506 |
| boolq | 0,6199 | 0,5991 |
| hellaswag | 0,3848 | 0,2713 |
| openbookqa | 0,2120 | 0,1460 |
| rte | 0,5126 | 0,5126 |
| winogrande | 0,5478 | 0,4996 |
| Media | 0,4390 | 0,3663 |

Esparsidad medida en los pesos publicados: 0,8999. El archivo `results.json` del repositorio contiene el registro completo del run y su configuracion.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 5,5 GB solo para los pesos en fp16 (el checkpoint ocupa 5,5 GB en safetensors); con overhead de activaciones y cache KV, se recomienda un minimo de 8-10 GB.
- GPU recomendadas: A100 40GB (usada para el entrenamiento/poda), H100, o cualquier GPU con al menos 10-12 GB de VRAM para inferencia.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090, RTX 4080 y modelos con 12 GB o mas; probablemente tambien en GPUs de 8 GB con cuantizacion, aunque no se publican pesos cuantizados.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained` con `flash-linear-attention` y `flash-attn` instalados. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; el soporte de esparsidad semi-estructurada dependera del backend.
- Latencia y throughput: no disponibles. La ventaja teorica de la esparsidad semi-estructurada (balanceo perfecto por fila) solo se materializa con kernels que exploten la estructura; sin ellos, el checkpoint se ejecuta como un modelo denso de 1.3B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WikiText-2 (ppl) | Media zero-shot | Licencia |
|---|---|---|---|---|---|
| Este modelo (90% esparsidad) | 1,36B | no disponible | 42,59 | 0,3663 | no disponible |
| fla-hub/transformer-1.3B-100B (denso) | 1,3B | no disponible | 9,77 | 0,4390 | no disponible |
| Alternativas de poda comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa disponible en la informacion proporcionada es contra el modelo base denso, que supera a esta version podada en todas las metricas publicadas. No se dispone de datos de otros metodos de poda (SparseGPT, Wanda, etc.) sobre el mismo modelo base para una comparacion justa.

## Limitaciones y advertencias

- Degradacion severa de calidad: la perplexity en WikiText-2 se multiplica por mas de cuatro (de 9,77 a 42,59) y la media zero-shot cae 7,3 puntos (de 0,4390 a 0,3663).
- Caidas especialmente acusadas en arc_easy (de 0,5602 a 0,3506) y hellaswag (de 0,3848 a 0,2713).
- Resultados de una unica ejecucion (single run), sin intervalos de confianza ni replicas.
- Sesgos conocidos: no documentados, pero hereda los del modelo base y los de los datos de calibracion (C4).
- Riesgo de alucinacion: elevado en comparacion con el denso, dado el aumento de perplexity.
- Limitaciones de contexto e idioma: no disponibles en la informacion proporcionada.
- Licencia no disponible: no se puede confirmar si permite uso comercial; verificar antes de cualquier despliegue en produccion.
- Dependencia de `flash-linear-attention` y `flash-attn`: la carga requiere estas librerias, lo que limita la portabilidad a backends de inferencia estandar.
- El checkpoint almacena los pesos podados con su forma densa (ceros explicitos), por lo que no reduce el tamano en disco ni la VRAM frente al modelo base; el ahorro solo se obtiene con kernels que exploten la esparsidad.
- No apto como modelo de produccion para tareas de calidad: su proposito es la investigacion en compresion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Transformer-1.3B-semi-structured-EHWS-90pct
- Modelo base: https://huggingface.co/fla-hub/transformer-1.3B-100B
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales asociados a este checkpoint.
