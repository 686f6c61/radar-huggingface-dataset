# ikimyaii/HGRN-1.3B-semi-structured-EHWS-ALPS-phase1-80pct

## Resumen

HGRN-1.3B con 80% de esparsidad semiestructurada es un modelo derivado del checkpoint denso fla-hub/hgrn-1.3B-100B, publicado por el usuario ikimyaii en HuggingFace. No es un modelo entrenado desde cero, sino el resultado de aplicar una poda (pruning) agresiva mediante ADMM en dos fases (EHWS) para eliminar el 80% de los pesos de las capas lineales, dejando una esparsidad efectiva de 0,7999. El objetivo es estudiar la compresion de arquitecturas de atencion lineal manteniendo una estructura regular por filas.

La arquitectura subyacente es HGRN (Hierarchically Gated Recurrent Network), un modelo recurrente de atencion lineal incluido en la libreria flash-linear-attention. El checkpoint tiene 1.364.396.032 parametros totales (aproximadamente 1,3B) y el repositorio ocupa 2,7 GB en formato safetensors. La esparsidad es semiestructurada: cada fila de cada capa lineal podable conserva exactamente el mismo numero de pesos (el 20% superior), lo que en teoria facilita la aceleracion por hardware, aunque el modelo se almacena con la misma huella que uno denso.

Su relevancia es fundamentalmente experimental: es un caso de estudio sobre hasta que punto se puede comprimir un modelo de 1,3B sin colapsar por completo su calidad. Los resultados muestran un deterioro severo en perplejidad (de 11,81 a 71,41 en WikiText-2) y una caida media de 6,4 puntos en las tareas zero-shot evaluadas, por lo que debe entenderse como una pieza de investigacion sobre poda, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network), atencion lineal/recurrente |
| Parametros totales | 1.364.396.032 (aproximadamente 1,3B) |
| Longitud de contexto | no disponible (la calibracion de la poda usa secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de fla-hub/hgrn-1.3B-100B, un HGRN entrenado sobre 100.000 millones de tokens segun la nomenclatura del checkpoint base. HGRN es una red recurrente con puertas jerarquicas que sustituye la atencion cuadratica por un mecanismo recurrente de coste lineal respecto a la longitud de secuencia, dentro del ecosistema flash-linear-attention (requiere `import fla`). No se ha realizado ningun entrenamiento adicional: la unica modificacion es la poda.

La poda se realiza con EHWS en dos fases de ADMM. La fase 1 es local, de estilo ALPS, y poda cada capa directamente al 80% minimizando su error de reconstruccion `||(W - W0) X||^2`; usa un paso x en forma cerrada, una penalizacion rho que crece de 0,01 hasta 10 veces la media de `diag(H)` a lo largo de 50 rondas, y un reajuste final por minimos cuadrados exactos sobre el soporte resultante, con matrices de Hessian calculadas a partir de 256 secuencias de C4. Esta fase tardo 10,2 minutos en una A100. La fase 2 es global y parte de los pesos ya podados, ejecutando ADMM sobre la perdida completa de entropia cruzada mas destilacion de conocimiento (KD, alpha 0,5) con un paso Z basado en `Diag(H)`; la configuracion es 128 rondas x 32 pasos, lr 6e-4, lambda constante de 0,01, AdamW con beta2 0,95, 2.048 secuencias de calibracion de C4 de 2.048 tokens cada una, bf16 y semilla 0. Esta fase tardo 3,2 horas.

Cabe destacar que la esparsidad resultante es semiestructurada y uniforme por fila (el 20% superior de cada fila), lo que la aproxima al patron N:M que algunos aceleradores explotan, aunque no hay informacion sobre si el checkpoint almacena los ceros o los comprime.

## Capacidades

- Generacion de texto autoregresiva a partir de un modelo causal de 1,3B parametros.
- Razonamiento basico de sentido comun y comprension lectora, aunque muy degradados respecto al modelo denso (por ejemplo, openbookqa baja de 0,2320 a 0,1300).
- Clasificacion binaria de textos (por ejemplo, boolq mejora ligeramente de 0,5734 a 0,5881, y winogrande de 0,5170 a 0,5399).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion sobre poda de modelos: sirve como referencia reproducible para comparar tecnicas de pruning semiestructurado frente a poda no estructurada, usando el modelo denso base como linea base de calidad.
- Estudio de eficiencia de ADMM en dos fases: permite replicar el pipeline EHWS (fase local ALPS + fase global con KD) y medir el impacto de cada fase en perplejidad y tareas zero-shot.
- Analisis de degradacion por esparsidad: util para cuantificar cuanto margen de compresion tolera una arquitectura de atencion lineal antes de volverse inutil, dado el salto de perplejidad observado.
- Experimentos academicos de compresion en entornos con una sola A100: el coste de poda documentado (10,2 minutos para la fase 1 y 3,2 horas para la fase 2) es asumible para reproducibilidad en investigacion.
- Benchmarking de kernels esparsos: al ser un modelo con esparsidad uniforme por fila, puede emplearse para probar si las bibliotecas de inferencia obtienen aceleracion real con este patron N:M.
- Docencia sobre flujos de compresion de modelos: ejemplo completo de un caso extremo (80% de poda) con metricas antes y despues, util para ilustrar los limites practicos de la poda.

## Benchmarks y rendimiento

Perplejidad (protocolo de evaluacion de ELSA-official, conjuntos de test WikiText-2 / C4, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 11,81 | 16,09 |
| Este modelo (80%, semiestructurado) | 71,41 | 45,87 |

Precision zero-shot:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2398 | 0,1809 |
| arc_easy | 0,5652 | 0,3544 |
| boolq | 0,5734 | 0,5881 |
| hellaswag | 0,3830 | 0,2787 |
| openbookqa | 0,2320 | 0,1300 |
| rte | 0,5343 | 0,5271 |
| winogrande | 0,5170 | 0,5399 |
| media | 0,4349 | 0,3713 |

Esparsidad alcanzada: 0,7999. El registro completo de la ejecucion y su configuracion esta en `results.json` dentro del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en formato safetensors ocupan 2,7 GB, lo que corresponde a bf16/fp16. En fp32 serian aproximadamente 5,5 GB; en 8 bits, unos 1,4 GB; en 4 bits, alrededor de 0,7 GB (estas cuantizaciones no se han confirmado para este checkpoint).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM puede cargar el modelo en bf16; una RTX 3060, RTX 4070/4080 o RTX 4090 son suficientes. Para la fase de poda documentada se uso una A100.
- Cabe en GPU de consumo: si. Con 2,7 GB de pesos en bf16 entra holgadamente en GPUs de gama media y de portatiles con 8 GB de VRAM.
- Opciones de despliegue: requiere tener instalada la libreria `flash-linear-attention` (`import fla`) y cargar con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`. La compatibilidad con vLLM, llama.cpp, Ollama o TGI no viene indicada en la informacion disponible; dado que HGRN no es una arquitectura transformer estandar y depende de codigo remoto, no debe asumirse soporte en esos motores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (HGRN 1.3B, 80% podado) | 1,3B | no disponible | 71,41 | no disponible | HuggingFace |
| fla-hub/hgrn-1.3B-100B (denso, base) | 1,3B | no disponible | 11,81 | no disponible | HuggingFace |
| Otros modelos de atencion lineal/SSM de ~1,3B (RWKV, Mamba, RetNet) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa mas fiable es con el propio modelo denso del que deriva: la poda al 80% multiplica por mas de seis la perplejidad en WikiText-2 (de 11,81 a 71,41) y por casi tres en C4 (de 16,09 a 45,87). No se dispone de datos comparables para alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La calidad se degrada de forma severa: la perplejidad en WikiText-2 pasa de 11,81 a 71,41 y la media zero-shot cae de 0,4349 a 0,3713, con caidas especialmente fuertes en openbookqa (de 0,2320 a 0,1300) y arc_easy (de 0,5652 a 0,3544).
- Riesgo elevado de alucinacion y de generacion incoherente derivado de la poda agresiva; no es apto para tareas que exijan fiabilidad factual.
- Sesgos conocidos: no disponible. Al derivar del checkpoint denso base, heredaria los sesgos de este, pero no se documentan.
- Limitaciones de contexto o idioma: la informacion no especifica la longitud de contexto soportada ni los idiomas cubiertos. La evaluacion se limita a tareas mayoritariamente en ingles.
- Restricciones de licencia: la licencia no esta indicada en la ficha, por lo que se desconoce si permite uso comercial. Debe considerarse como no autorizado a efectos practicos hasta confirmarlo.
- Dependencia de codigo remoto: la carga requiere `trust_remote_code=True` y la libreria `flash-linear-attention`, lo que introduce riesgo de seguridad y de compatibilidad en produccion.
- La esparsidad es semiestructurada pero el modelo se guarda con el tamano de un modelo denso (2,7 GB); la aceleracion real depende de que el motor de inferencia soporte el patron N:M, algo que no se confirma en la informacion disponible.
- Se trata de una publicacion con 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-EHWS-ALPS-phase1-80pct
- Modelo base denso: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Libreria flash-linear-attention (requerida para cargar el modelo): no disponible como enlace directo en la informacion proporcionada.
- Paper de HGRN, articulo de ALPS, repositorio de EHWS, demos o blogs adicionales: no disponible en la informacion proporcionada.
