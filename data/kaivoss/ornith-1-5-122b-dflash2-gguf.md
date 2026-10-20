# kaivoss/Ornith-1.5-122B-DFlash2-GGUF

## Resumen

Ornith-1.5-122B-DFlash2-GGUF es una conversión a formato GGUF del borrador (draft model) `incoai/Ornith-1.5-122B-DFlash2`, un modelo auxiliar de 0,93 B de parámetros diseñado para acelerar la inferencia de `ornith-ai/Ornith-1.5-122B` mediante decodificación especulativa en llama.cpp. No es un modelo autónomo: funciona emparejado con el modelo objetivo y reutiliza en tiempo de ejecución sus embeddings de tokens y su LM head, por lo que no puede generar texto por sí solo ni se carga sin el objetivo.

El nombre del repositorio puede inducir a error: el sufijo "122B" hace referencia al modelo objetivo para el que redacta propuestas, no al tamaño de este borrador. Según los metadatos de safetensors, el borrador tiene 930.278.912 parámetros (~0,93 B), y su función es proponer bloques de tokens que el modelo grande verifica después, reduciendo el número de pasos de decodificación.

La relevancia de esta publicación es práctica: permite usar la técnica DFlash 2 con llama.cpp en cuantizaciones que van desde BF16 hasta Q1_0, e incluye la receta exacta de conversión y cuantización. El autor recomienda Q8_0 o Q6_K para el borrador, ya que las cuantizaciones de muy baja precisión reducen la tasa de aceptación de tokens y, por tanto, la ganancia de velocidad. El repositorio no incluye benchmarks ni métricas de aceptación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Borrador de difusión por bloques DFlash 2 para decodificación especulativa; no es un transformer autoregresivo autónomo |
| Parametros totales | 930.278.912 (~0,93 B), según safetensors |
| Parametros activos | No aplica: no es MoE (la model card indica "no experts"; MXFP4_MOE equivale a Q8_0) |
| Longitud de contexto | no disponible (depende del modelo objetivo, no confirmado por el autor) |
| Tipos de cuantizacion | BF16, F16, F32, IQ3_M, IQ3_S, IQ4_NL, IQ4_XS, MXFP4_MOE, Q1_0, Q2_0, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_0, Q5_1, Q5_K_S, Q5_K_M, Q6_K, Q8_0, TQ1_0, TQ2_0 |
| Idiomas soportados | no disponible (determinado por el tokenizador y el modelo objetivo) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el original se distribuye en formato HuggingFace y se convierte con `convert_hf_to_gguf.py` |
| Modelo objetivo | `ornith-ai/Ornith-1.5-122B` (obligatorio, misma familia de tokenizador) |
| Herramienta de conversion | llama.cpp upstream, commit `ead9f32` |
| Tamano del repositorio | 19,6 GB (incluye todas las cuantizaciones) |

## Arquitectura y entrenamiento

El modelo es un borrador de difusión por bloques ("block-diffusion drafter") para decodificación especulativa. En lugar de generar tokens de uno en uno de forma autoregresiva, propone bloques de tokens que el modelo objetivo valida en una sola pasada; llama.cpp expone este mecanismo con `--spec-type draft-dflash` y un máximo de tokens propuestos por paso (`--spec-draft-n-max`, 15 en el ejemplo del autor). El borrador no incluye embeddings ni cabeza de salida propios: reutiliza los del objetivo en tiempo de ejecución, de ahí que la conversión solo necesite el `config` y el tokenizador del modelo grande (`--target-model-dir`) y que el GGUF resultante sea mucho menor que un modelo de 0,93 B completo.

No se han publicado en la información disponible datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO. Tampoco se detalla el objetivo de entrenamiento de la difusión por bloques ni la longitud de bloque nativa más allá del límite de propuestas configurable en inferencia. La innovación destacable es el propio mecanismo DFlash 2 frente a los borradores autoregresivos clásicos de llama.cpp, junto con la decisión de no publicar cuantizaciones que requieren matriz de importancia (IQ1, IQ2, IQ3_XXS, IQ3_XS, Q2_K_S).

## Capacidades

- Generación de propuestas de tokens para decodificación especulativa sobre Ornith-1.5-122B; no genera texto de forma autónoma.
- Reutilización de los embeddings de tokens y de la LM head del modelo objetivo, lo que reduce el peso en disco y en VRAM del borrador.
- Integración con `llama-server` y el resto de binarios de llama.cpp mediante `-md` y `--spec-type draft-dflash`.
- Compatible con endpoints (etiqueta `endpoints_compatible` del repositorio).
- Ajuste del número máximo de tokens propuestos por paso (`--spec-draft-n-max`), lo que permite equilibrar agresividad del borrado y tasa de aceptación.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento propios: esas capacidades, si existen, pertenecen al modelo objetivo.

## Casos de uso

- Aceleración de inferencia local de Ornith-1.5-122B: cargar el borrador con `-md Ornith-1.5-122B-DFlash2-Q8_0.gguf` junto al GGUF del objetivo y activar `--spec-type draft-dflash` para reducir el número de pasos de decodificación en `llama-server`.
- Servicio de chat interactivo con baja latencia percibida: en despliegues monousuario o de pocos usuarios concurrentes, la decodificación especulativa ataca directamente el coste por token generado, que es el cuello de botella en modelos de más de 100 B.
- Ajuste fino del compromiso velocidad/aceptación: comparar Q8_0 y Q6_K del borrador y variar `--spec-draft-n-max` (por ejemplo entre 4 y 15) para encontrar la configuración con mejor tasa de aceptación en el dominio concreto de la aplicación.
- Investigación sobre decodificación especulativa: el repositorio documenta la receta completa de conversión y cuantización, lo que facilita reproducir experimentos y medir aceptación por tipo de tarea (código, texto libre, JSON estructurado).
- Despliegues con presupuesto de VRAM ajustado: al ocupar el borrador alrededor de 1 GB en Q8_0, el sobrecoste de memoria frente a la inferencia sin especulación es pequeño comparado con el peso del objetivo.
- Evaluación comparativa de estrategias de borrado en llama.cpp: sirve como referencia DFlash 2 frente a un borrador autoregresivo estándar cargado con `-md` o frente a la decodificación sin especulación, usando el mismo objetivo y el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de aceptación de tokens, aceleración medida (tokens/s) ni comparaciones con otras técnicas de decodificación especulativa.

## Requisitos de hardware

- VRAM del borrador (cálculo a partir de 930 M de parámetros, sin contar el contexto ni el overhead de llama.cpp): BF16 ~1,86 GB, Q8_0 ~0,99 GB, Q6_K ~0,76 GB, Q4_K_M ~0,55 GB. El autor recomienda Q8_0 o Q6_K para preservar la tasa de aceptación.
- El borrador cabe en cualquier GPU consumer con 2 GB o más de VRAM libre; el cuello de botella es siempre el modelo objetivo.
- Modelo objetivo: no se dispone del recuento exacto de parámetros en la información proporcionada. A partir del nombre (122 B), una cuantización Q4_K_M requeriría del orden de 70-75 GB, lo que excede cualquier GPU consumer (RTX 4090, 24 GB) y exige múltiples A100/H100 o offload a RAM del sistema. Estimación orientativa, no confirmada por el autor.
- Despliegue: exclusivamente llama.cpp con soporte de DFlash 2 (rama master actual); `llama-server` o `llama-cli`. No hay confirmación de soporte en vLLM, TGI, Ollama ni en runtimes que no implementen `--spec-type draft-dflash`.
- Latencia y throughput: no disponible. La ganancia depende linealmente de la tasa de aceptación del borrador, que la model card no cuantifica.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-122B-DFlash2 (este repositorio) | 0,93 B | no disponible | Borrador DFlash 2 (difusión por bloques) para Ornith-1.5-122B | Apache 2.0 | GGUF en HuggingFace, 28 cuantizaciones |
| Borrador autoregresivo estándar de llama.cpp (`-md`) | Depende del modelo elegido | Heredado del borrador | Propuestas token a token | Depende del borrador | Requiere un modelo pequeño adicional de la misma familia |
| Decodificación sin especulación | No aplica | El del objetivo | Línea base de rendimiento | No aplica | Soportada por cualquier build de llama.cpp |

No se dispone de datos de rendimiento comparado (tasa de aceptación, tokens/s) entre estas alternativas en la información proporcionada. Alternativas como EAGLE-3 o Medusa no se han podido contrastar con datos verificables en esta búsqueda, por lo que se indican como no disponibles.

## Limitaciones y advertencias

- No es un modelo independiente: sin el GGUF de Ornith-1.5-122B cargado como objetivo, el borrador no produce salida utilizable.
- Requiere una build de llama.cpp con soporte de DFlash 2 (master en el momento de la publicación); en versiones anteriores fallará al cargar o ignorará el flag.
- El repositorio es una conversión de terceros (autor `kaivoss`) con 0 descargas y 0 likes en el momento de la consulta; conviene verificar la integridad frente al original `incoai/Ornith-1.5-122B-DFlash2`.
- Las cuantizaciones de muy baja precisión (Q1_0, Q2_0, TQ1_0, TQ2_0, IQ3) degradan la tasa de aceptación y pueden anular la ganancia de velocidad, según advierte el propio autor.
- No se proporcionan IQ1, IQ2, IQ3_XXS, IQ3_XS ni Q2_K_S porque requieren matriz de importancia; no es posible generarlas con la receta incluida.
- No hay información sobre sesgos, idiomas soportados ni comportamiento multilingüe; dependen del tokenizador y del entrenamiento del modelo objetivo.
- La licencia Apache 2.0 cubre este borrador, pero el uso comercial del sistema completo depende también de la licencia de Ornith-1.5-122B, que no se detalla en la información disponible.
- Las capacidades de tool calling, agentes o multimodalidad que se observen en producción pertenecen al modelo objetivo y no deben atribuirse al borrador.
- No se han publicado métricas de aceptación ni aceleración, por lo que cualquier estimación de rendimiento en producción debe medirse in situ.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kaivoss/Ornith-1.5-122B-DFlash2-GGUF
- Borrador original: https://huggingface.co/incoai/Ornith-1.5-122B-DFlash2
- Modelo objetivo: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- llama.cpp (motor de conversión y cuantización): https://github.com/ggml-org/llama.cpp
