# ikimyaii/HGRN-1.3B-unstructured-ELSA-50pct

## Resumen

HGRN-1.3B-unstructured-ELSA-50pct es un checkpoint de investigación publicado por el usuario ikimyaii: el modelo base fla-hub/hgrn-1.3B-100B (arquitectura HGRN, de la familia de attention lineal implementada en el paquete `fla`, 1.364.396.032 parámetros) podado al 50 % de esparsidad no estructurada con el código oficial de ELSA (arXiv:2510.01650). No es un modelo afinado para instrucciones ni un modelo listo para producto: es la línea base contra la que el autor compara sus modelos EHWS del mismo account.

El interés es metodológico. El pruning se aplica con un único umbral de magnitud por capa, de modo que cada fila de cada matriz conserva un número distinto de pesos no nulos; se podan las capas lineales internas de los bloques (168 capas) y se dejan densos los embeddings y el `lm_head`. El resultado es un modelo que ocupa el mismo espacio de almacenamiento que el denso (5,5 GB en safetensors) pero con la mitad de pesos no nulos en el cómputo interno, lo que lo convierte en una pieza útil para estudiar métodos de poda, decodificación y aceleración con kernels dispersos.

La relevancia ahora es doble: por un lado, sirve para reproducir la receta de ELSA (4096 pasos ADMM sobre 32.768 secuencias de C4 de 2.048 tokens, 5,26 horas en una A100 de 40 GB) con un coste muy bajo; por otro, documenta explícitamente el coste en calidad: perplejidad de 19,58 en WikiText-2 y 19,59 en C4 con la evaluación propia de ELSA en fp16. Es, por tanto, un artefacto para experimentación sobre esparsidad, no un sustituto del modelo denso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (red recurrente con puertas jerarquicas, familia de attention lineal de `flash-linear-attention`), podada a esparsidad no estructurada |
| Parametros totales | 1.364.396.032 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la calibracion del pruning usa secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no se publican pesos cuantizados; el repositorio contiene safetensors (5,5 GB, consistente con fp32); el pruning se ejecuto en bf16 y la evaluacion en fp16 |
| Idiomas soportados | no disponible; calibracion y evaluacion sobre C4 y WikiText-2, corpus predominantemente en ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Esparsidad | 0,5000 medida sobre estos pesos; no estructurada, un umbral por capa |
| Capas podadas | 168 capas lineales internas; embeddings y `lm_head` permanecen densos |
| Modelo base | fla-hub/hgrn-1.3B-100B |
| Requisito de carga | paquete `fla` instalado y `trust_remote_code=True` |

## Arquitectura y entrenamiento

La arquitectura subyacente es HGRN, un modelo recurrente con puertas jerarquicas que sustituye la attention cuadratica por una recurrencia de coste lineal en la longitud de secuencia; el nombre del checkpoint base (hgrn-1.3B-100B) sugiere un entrenamiento sobre del orden de 100.000 millones de tokens, aunque ese dato no se detalla en la informacion disponible. Sobre ese modelo denso, este checkpoint aplica exclusivamente poda: no hay afinado posterior ni alineacion (no se documenta RLHF, DPO ni SFT), por lo que el modelo conserva el comportamiento de un modelo de lenguaje base.

El pruning sigue la receta oficial de ELSA sin modificaciones respecto a su ejecucion de referencia a 80 % sobre el mismo HGRN-1.3B: 4096 pasos ADMM, un paso z cada 32 pasos, batch de 1 con 8 pasos de acumulacion, learning rate 2e-4, lambda 0,01, precision bf16, 32.768 secuencias de C4 de 2.048 tokens (aproximadamente 67 millones de tokens de calibracion) y semilla 0. La ejecucion completa consumio 5,26 horas en una unica A100 de 40 GB. La esparsidad se impone con un umbral de magnitud por capa, de forma que las filas quedan desbalanceadas: en las 168 capas podadas, la fila mas densa tiene de media 1,59 veces los no nulos de la fila media, y la peor capa llega a 1,98 veces. Los pesos finales verifican una esparsidad de 0,5000.

## Capacidades

- Generacion de texto autoregresiva como modelo de lenguaje base; no hay ajuste instructivo, por lo que no sigue instrucciones de forma fiable sin ejemplos en el prompt.
- Modelado de lenguaje puro: la unica metrica publicada es perplejidad, no hay evaluaciones de razonamiento, codigo o matematicas.
- Procesamiento de secuencias largas con coste lineal gracias a la recurrencia de HGRN, si bien no se documenta la longitud de contexto efectiva soportada.
- Ejecucion con esparsidad no estructurada al 50 % en las capas internas, utilizable como objeto de estudio de kernels dispersos y de tecnicas de compresion.
- No se documenta soporte de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue: no disponible; toda la evidencia empirica es en ingles.

## Casos de uso

- Linea base en experimentos de poda: sirve para comparar tecnicas de esparsidad estructurada, semiestructurada o metodos como EHWS frente a una poda de magnitud con ADMM ya validada, usando la perplejidad en WikiText-2 y C4 como metrica comun.
- Reproduccion de resultados de ELSA: permite verificar la receta (4096 pasos ADMM, lambda 0,01, 32.768 secuencias de C4) con un coste de 5,26 horas de A100 40 GB, util para grupos con pocos recursos que quieran validar el pipeline antes de escalar.
- Estudio del desbalanceo de filas: al estar documentado que la fila mas densa tiene 1,59 veces la media y la peor capa 1,98 veces, el checkpoint es un caso de prueba realista para medir el impacto del desbalanceo en kernels dispersos y en el rendimiento efectivo.
- Investigacion sobre aceleracion hardware de esparsidad: permite medir la brecha entre la esparsidad nominal (0,50) y la aceleracion obtenida con librerias que solo aprovechan esparsidad estructurada 2:4 o con kernels genericos.
- Experimentos de compresion y despliegue en hardware modesto: con 1,36 mil millones de parametros y pesos almacenados de forma dispersa, es un banco de pruebas para convertir a formatos cuantizados (int8, 4 bits) y evaluar la perdida de calidad adicional.
- Analisis de degradacion por poda: comparando su perplejidad (19,58 en WikiText-2) con la del modelo denso original se puede cuantificar el coste de eliminar el 50 % de los pesos, un dato necesario antes de decidir si la poda es viable en un producto.
- Docencia y divulgacion tecnica: el reducido coste de calibracion y la simplicidad del metodo lo hacen adecuado para practicas sobre ADMM, umbrales de magnitud y evaluacion de modelos de lenguaje.

## Benchmarks y rendimiento

Unica ejecucion publicada, evaluada con el codigo propio de ELSA sobre sus conjuntos de test de WikiText-2 y C4 en fp16:

| Metrica | Resultado |
|---|---|
| Perplejidad WikiText-2 | 19,58 |
| Perplejidad C4 | 19,59 |
| Esparsidad medida | 0,5000 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de la perplejidad del modelo base denso en la informacion disponible, por lo que no es posible cuantificar aqui la degradacion respecto a fla-hub/hgrn-1.3B-100B ni establecer comparaciones numericas con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5 GB si se cargan los pesos tal como estan en el repositorio (compatible con fp32); en torno a 2,7-3 GB en bf16/fp16; cerca de 1,5 GB en int8 y 0,8-1 GB en cuantizacion de 4 bits, mas el estado recurrente y el overhead del runtime.
- La poda no reduce el espacio de almacenamiento en safetensors densos: para obtener ventaja de memoria hay que usar formatos dispersos o cuantizar.
- GPU recomendadas: A100 40 GB o H100 para entrenamiento y recalibracion; para inferencia bastan GPU de gama media-alta (RTX 4090 24 GB, RTX 3090, L40S, A10G) e incluso GPU de 8 GB en cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, previsiblemente en cualquier tarjeta con 8 GB o mas en cuantizacion de 4 bits, y con 8-12 GB en fp16 considerando overhead.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` y el paquete `fla` instalado (requisito explicito del autor). El soporte en vLLM, llama.cpp, Ollama o TGI no esta documentado en la informacion disponible y, al tratarse de una arquitectura HGRN con pesos dispersos, no puede asumirse.
- Latencia y throughput: no disponibles. La esparsidad no estructurada no se traduce automaticamente en aceleracion con kernels densos, por lo que el rendimiento esperado es similar al del modelo denso salvo que se use un runtime con soporte real de dispersidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Esparsidad | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HGRN-1.3B-unstructured-ELSA-50pct (este) | 1.364.396.032 | no disponible | 50 % no estructurada | 19,58 | no disponible | safetensors en HF, requiere `fla` |
| fla-hub/hgrn-1.3B-100B (base denso) | 1,3 B aprox. | no disponible | 0 % | no disponible | no disponible | safetensors en HF |
| Otros modelos densos de ~1,3 B | no disponible | no disponible | 0 % | no disponible | no disponible | no disponible |

No hay datos suficientes en la informacion proporcionada para comparar rendimiento frente a alternativas de la misma categoria; la unica comparacion estructural fiable es con el modelo base denso, del que se desconoce la perplejidad de referencia.

## Limitaciones y advertencias

- Calidad degradada por la poda: una perplejidad de 19,58 en WikiText-2 es alta para un modelo de 1,3 B, lo que anticipa generaciones menos coherentes que las del checkpoint denso original.
- La esparsidad es no estructurada, con umbral unico por capa: las filas quedan desbalanceadas (hasta 1,98 veces la media en la peor capa) y los runtimes convencionales no obtienen aceleracion, solo ahorro si se usa almacenamiento disperso.
- Licencia no disponible: sin licencia explicita no hay autorizacion clara para uso comercial; conviene contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue productivo.
- Requiere `trust_remote_code=True` y el paquete `fla`: esto implica ejecutar codigo remoto y anade una dependencia no estandar a la cadena de despliegue.
- No es un modelo instructivo: no se documenta SFT, RLHF ni DPO, por lo que no cabe esperar seguimiento fiable de instrucciones ni formato conversacional.
- Riesgo de alucinacion alto en tareas factuales, especialmente por la combinacion de modelo base sin alineacion y perdida de capacidad por poda.
- Idiomas no documentados y calibracion en C4: el comportamiento fuera del ingles es incierto y no esta evaluado.
- Resultados de una sola ejecucion con semilla 0: no hay intervalos de confianza ni repeticiones, de modo que diferencias pequenas de perplejidad no deben interpretarse como significativas.
- Longitud de contexto no especificada: la calibracion usa 2.048 tokens y no hay evidencia de generalizacion mas alla de esa longitud.
- Ausencia total de benchmarks de tareas (MMLU, HumanEval, GSM8K) y de datos de sesgo o toxicidad; no es posible evaluar su comportamiento en dominios sensibles.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (solo coincidencias espurias con la aplicacion de mensajeria homonima), por lo que no hay verificacion externa independiente de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikimyaii/HGRN-1.3B-unstructured-ELSA-50pct
- Modelo base: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Paper de ELSA: https://arxiv.org/abs/2510.01650
- Paquete `fla` (flash-linear-attention), dependencia obligatoria para cargar el modelo: https://github.com/fla-org/flash-linear-attention
- La busqueda web no aporto enlaces adicionales relevantes sobre este checkpoint.
