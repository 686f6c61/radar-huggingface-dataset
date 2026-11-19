# ikimyaii/HGRN-1.3B-semi-structured-Wanda-80pct

## Resumen

HGRN-1.3B-semi-structured-Wanda-80pct es un checkpoint del modelo base fla-hub/hgrn-1.3B-100B al que se le ha aplicado una poda one-shot (sin reentrenamiento posterior) del 80% de sus pesos en las capas lineales internas de los bloques, usando el algoritmo Wanda en su implementacion oficial. Lo publica el usuario ikimyaii como baseline de referencia para una familia de modelos propios (denominados EHWS) y no como un modelo listo para produccion. El modelo base pertenece a la familia HGRN (Hierarchically Gated Recurrent Network), una arquitectura recurrente con compuertas jerarquicas implementada en la libreria flash-linear-attention (fla).

El checkpoint conserva los 1.364.396.032 parametros del modelo original, pero aproximadamente el 80% de los pesos de las capas lineales de cada bloque son cero; los embeddings y la lm_head permanecen densos. La poda se realizo en bfloat16 sobre una unica GPU A100 40GB en 1,6 minutos, con calibracion sobre 128 secuencias de C4 de 2.048 tokens.

Su relevancia es fundamentalmente metodologica: documenta el impacto de una poda agresiva sin recuperacion sobre un modelo recurrente lineal, y sirve como punto de comparacion para tecnicas de poda con reentrenamiento. Los resultados muestran un deterioro severo de la perplejidad (de 11,81 a 101.832,55 en WikiText-2), por lo que no es adecuado para uso directo en inferencia de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network), red recurrente lineal con compuertas jerarquicas; requiere flash-linear-attention |
| Parametros totales | 1.364.396.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base se entrena con secuencias de 2.048 tokens en la calibracion; el contexto maximo no se especifica) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el repo solo incluye safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamano del repo: 2,7 GB) |

## Arquitectura y entrenamiento

El modelo base fla-hub/hgrn-1.3B-100B emplea la arquitectura HGRN, una red recurrente lineal con compuertas jerarquicas que sustituye la atencion cuadratica por recurrencia lineal, lo que permite procesar secuencias con coste lineal en la longitud. El sufijo "100B" del nombre del modelo base sugiere un entrenamiento sobre del orden de 100.000 millones de tokens, aunque la model card no detalla la composicion del dataset ni si hubo fases de RLHF o DPO.

Sobre ese checkpoint se aplico una poda semi-estructurada one-shot con Wanda (locuslab/wanda, commit 8e8fc87, rama unstructured, `use_variant=False`). El criterio de poda descarta en cada fila los pesos con menor producto `|W| * sqrt(||X||)`, calculado a partir de las activaciones de calibracion. La calibracion usa el loader oficial con 128 secuencias de C4 de 2.048 tokens y semilla 0; los bloques se podan en orden, calibrando cada uno sobre las salidas de los bloques ya podados. Se podan todas las capas lineales internas de los bloques (168 capas verificadas), mientras que embeddings y lm_head quedan densos. La densidad medida resultante es 0,7998 de sparsity y todas las filas de todas las capas podadas tienen el mismo numero de valores no nulos, lo que garantiza equilibrio de carga por fila. No hubo reentrenamiento ni ajuste fino posterior a la poda.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base, aunque severamente degradada por la poda sin recuperacion.
- Razonamiento y respuesta a preguntas en formato zero-shot, con precision muy inferior a la del modelo denso (media de 0,3581 frente a 0,4376 en lm-evaluation-harness).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles.
- No se documentan modos especiales (thinking, vision, audio).
- La poda preserva la estructura de pesos para que el trabajo por fila sea perfectamente balanceado, lo que facilita implementaciones de kernels dispersos.

## Casos de uso

- Baseline de investigacion en poda: sirve como referencia cuantitativa para comparar tecnicas de poda con o sin reentrenamiento sobre arquitecturas recurrentes lineales, usando las metricas de perplejidad y zero-shot ya publicadas.
- Estudio de degradacion por sparsity: permite analizar como afecta un 80% de sparsity one-shot a cada tarea (por ejemplo, la caida de arc_easy de 0,5644 a 0,2656 frente a la resistencia relativa de boolq, que sube de 0,5758 a 0,6208).
- Validacion de kernels dispersos: al tener todas las filas con el mismo numero de no nulos en las 168 capas podadas, es util para probar implementaciones de SpMM balanceadas en GPU.
- Reproduccion de experimentos: el metodo esta documentado con suficiente detalle (commit de Wanda, calibracion, semilla, hardware y tiempo) para replicar el proceso sobre otros checkpoints HGRN.
- Docencia sobre compresion de modelos: ejemplo didactico del coste de podar sin recuperar, con numeros concretos de perplejidad antes y despues.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni ninguna aplicacion final, dado el colapso de la perplejidad (101.832,55 en WikiText-2 y 120.485,48 en C4).

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluacion de ELSA (conjuntos de test WikiText-2 y C4, formula propia, fp16):

| Metrica | Denso | Este modelo |
|---|---|---|
| WikiText-2 | 11,81 | 101.832,55 |
| C4 | 16,09 | 120.485,48 |

Precision zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2432 | 0,2244 |
| arc_easy | 0,5644 | 0,2656 |
| boolq | 0,5758 | 0,6208 |
| hellaswag | 0,3828 | 0,2582 |
| openbookqa | 0,2300 | 0,1620 |
| rte | 0,5379 | 0,4729 |
| winogrande | 0,5288 | 0,5028 |
| Media | 0,4376 | 0,3581 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,7 GB de pesos mas overhead de activaciones y cache; el repo ocupa 2,7 GB en safetensors.
- La poda se realizo en una unica A100 40GB en 1,6 minutos, lo que da una referencia del coste de replicar el proceso.
- Al tratarse de un modelo de 1,3B, cabe en GPUs de consumo como RTX 3060 12GB, RTX 4070, RTX 4090 o superiores; tambien en CPU con suficiente RAM.
- Opciones de despliegue: requiere la libreria flash-linear-attention instalada (`import fla`) y carga mediante `AutoModelForCausalLM.from_pretrained(...)`. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, y es probable que estos motores no soporten la arquitectura HGRN sin adaptaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (HGRN-1.3B, Wanda 80%) | 1,36B (80% sparse en lineales) | no disponible | 101.832,55 | no disponible | Hugging Face |
| fla-hub/hgrn-1.3B-100B (denso) | 1,36B | no disponible | 11,81 | no disponible | Hugging Face |
| Alternativas de ~1,3B con poda publicada | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa disponible es con su modelo base denso, que supera ampliamente a este checkpoint en todas las metricas de perplejidad y en la media zero-shot.

## Limitaciones y advertencias

- La perplejidad se dispara tres ordenes de magnitud respecto al modelo denso (101.832,55 frente a 11,81 en WikiText-2), lo que indica un colapso practico de la calidad de generacion.
- La poda es one-shot sin reentrenamiento; no se ha aplicado recuperacion ni ajuste fino, por lo que el modelo no representa el estado del arte en compresion.
- La media zero-shot cae 7,95 puntos porcentuales (de 0,4376 a 0,3581), con caidas especialmente severas en arc_easy y hellaswag.
- El comportamiento por tarea es irregular: boolq mejora ligeramente (de 0,5758 a 0,6208), lo que sugiere que las metricas agregadas no capturan todo el dano.
- Sesgos conocidos: no disponibles; al heredar el modelo base, podria reproducir sesgos de su corpus de entrenamiento, no documentado.
- Riesgo de alucinacion: elevado dadas las malas cifras de perplejidad y razonamiento.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar el uso comercial.
- Requiere la dependencia flash-linear-attention, lo que limita la portabilidad a motores de inferencia estandar.
- No hay informacion sobre idiomas soportados ni longitud de contexto maxima.
- El autor lo presenta explicitamente como baseline para sus modelos EHWS, no como modelo de proposito general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-Wanda-80pct
- Modelo base: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Codigo oficial de Wanda: https://github.com/locuslab/wanda (commit 8e8fc87)
- Libreria flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Paper de HGRN: no disponible en la informacion proporcionada
- Demo o blog del autor: no disponible en la informacion proporcionada
