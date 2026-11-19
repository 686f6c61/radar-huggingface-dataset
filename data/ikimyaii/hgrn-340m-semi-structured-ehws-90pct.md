# ikimyaii/HGRN-340M-semi-structured-EHWS-90pct

## Resumen

HGRN-340M-semi-structured-EHWS-90pct es una variante podada del modelo base m-a-p/340M-20B-HGRN-pure-baseline, un transformer de tipo HGRN (Hierarchically Gated Recurrent Network) con 341.148.672 parametros entrenado por el grupo m-a-p sobre 20.000 millones de tokens. El modelo publicado por el usuario ikimyaii aplica una poda semi-estructurada del 90% sobre todas las capas lineales internas de los bloques, manteniendo embeddings y lm_head densos. El resultado es un checkpoint con un 90,03% de ceros medidos en los pesos podados, donde cada fila de cada capa podada conserva exactamente el mismo numero de pesos no nulos.

La relevancia de esta ficha es metodologica: documenta un experimento reproducible de compresion agresiva sobre un modelo pequeno, con dos fases de optimizacion (poda local tipo ALPS al 70% y refinamiento global con ADMM hasta el 90%) y evaluacion completa en perplejidad y tareas zero-shot. El coste del experimento es notablemente bajo: 2,21 horas en una unica A100 de 40 GB. El modelo resultante, sin embargo, sufre una degradacion severa de calidad, con perplejidad en WikiText-2 que pasa de 21,96 a 94,30 y una caida de precision media zero-shot de 0,4400 a 0,3725.

El checkpoint esta pensado para investigacion sobre esparsidad semi-estructurada y aceleracion por hardware, no para uso en produccion. La licencia no esta declarada en la informacion disponible, lo que impide asumir permisos de uso comercial. El modelo requiere la libreria `flash-linear-attention` para cargarse correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network), transformer recurrente con puertas jerarquicas |
| Parametros totales | 341.148.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 2.048 tokens en la calibracion) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion posterior no verificada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Esparsidad | 90,03% medida; semi-estructurada por filas en 168 capas lineales |
| Modelo base | m-a-p/340M-20B-HGRN-pure-baseline |
| Tamano del repo | 1,4 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura HGRN del checkpoint base, una red recurrente con puertas jerarquicas que sustituye parte del mecanismo de atencion por recurrencia lineal, lo que reduce el coste computacional en secuencias largas. Sobre esa base, el autor aplica un esquema de poda en dos fases. La fase 1 es local y de estilo ALPS: poda cada capa al 70% minimizando el error de reconstruccion `||(W - W0) X||^2`, con matrices de Hessiano calculadas a partir de secuencias de calibracion de C4. La fase 2 es global y usa ADMM sobre la perdida de entropia cruzada y destilacion de conocimiento del modelo denso, con un paso Z basado en Diag(H), 128 rondas de 32 pasos, learning rate 0,0006, lambda constante de 0,01, beta2 de Adam 0,95 y semilla 0.

Los datos de calibracion son las 32.768 secuencias de C4 de 2.048 tokens que usa el codigo oficial de ELSA, tokenizadas con el tokenizer del modelo (`fla-hub_hgrn-1.3B-100B`), cada una vista una sola vez. La poda se aplica a todas las capas lineales dentro de los bloques; embeddings y lm_head permanecen densos. La esparsidad es semi-estructurada por fila: cada fila de cada capa podada conserva el top 10% de pesos, lo que garantiza equilibrio perfecto de trabajo por fila en kernels especializados. El entrenamiento completo, incluida la evaluacion, consumio 2,21 horas en una A100 de 40 GB.

## Capacidades

- Generacion de texto autoregresiva basica, heredada del modelo base HGRN de 340M parametros.
- Razonamiento de sentido comun limitado: precision zero-shot media de 0,3725 en el conjunto de tareas evaluado.
- Clasificacion zero-shot en tareas de eleccion multiple (arc, hellaswag, openbookqa, winogrande, boolq, rte).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- La poda al 90% degrada sustancialmente las capacidades del modelo denso original; no debe asumirse paridad funcional con el base.

## Casos de uso

- Investigacion sobre poda semi-estructurada: el checkpoint sirve como referencia reproducible de un pipeline ALPS + ADMM al 90% de esparsidad, con `results.json` documentando la configuracion completa. Util para comparar metodos de compresion sobre arquitecturas recurrentes.
- Estudio de aceleracion por hardware: al mantener el mismo numero de no nulos por fila en las 168 capas podadas, el modelo es adecuado para validar kernels y bibliotecas que explotan esparsidad estructurada por fila (por ejemplo, rutinas de sparse GEMM) sin desequilibrio de carga.
- Benchmarking de degradacion calidad-compresion: permite medir la curva de perplejidad y precision zero-shot frente al modelo denso en WikiText-2 y C4 con el protocolo de ELSA, como punto de comparacion para futuros metodos de poda.
- Docencia y experimentacion en eficiencia de modelos: el bajo coste de reproduccion (2,21 horas en una A100 40 GB) lo hace viable en entornos academicos con recursos limitados para ensenar tecnicas de compresion.
- Pruebas de integracion con `flash-linear-attention`: util para desarrolladores que quieran verificar la carga de modelos HGRN podados con `AutoModelForCausalLM.from_pretrained` y la libreria `fla`.
- Analisis de robustez de tareas: las diferencias por tarea (boolq, rte y winogrande mejoran ligeramente; arc_easy y openbookqa caen drasticamente) permiten estudiar que tipos de tarea toleran mejor la esparsidad extrema.
- No se recomienda para atencion al cliente, generacion de codigo en produccion ni ninguna aplicacion que requiera calidad cercana al modelo denso, dado el incremento de perplejidad de mas de 4x en WikiText-2.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluacion de ELSA (WikiText-2 y C4, fp16, ejecucion unica):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 21,96 | 21,94 |
| Este modelo (90% podado) | 94,30 | 54,84 |

Precision zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2628 | 0,1809 |
| arc_easy | 0,6153 | 0,3590 |
| boolq | 0,6028 | 0,6193 |
| hellaswag | 0,3423 | 0,2702 |
| openbookqa | 0,2380 | 0,1280 |
| rte | 0,5126 | 0,5271 |
| winogrande | 0,5059 | 0,5233 |
| Media | 0,4400 | 0,3725 |

Esparsidad medida en los pesos publicados: 0,9003. Las 168 capas podadas presentan el mismo numero de no nulos por fila.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 1,4 GB en safetensors; en fp16 los 341M parametros ocupan aproximadamente 0,68 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: el autor uso una A100 de 40 GB para el pipeline completo de poda y evaluacion; para inferencia basta una RTX 3060, RTX 4060 o superior.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 4 GB de VRAM (RTX 3050, GTX 1650 Super, etc.).
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained` requiere `flash-linear-attention` instalado (`import fla`). No se ha verificado soporte en vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La esparsidad por fila equilibrada sugiere potencial de aceleracion con kernels sparse, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (HGRN-340M, 90% podado) | 341M | no disponible | 94,30 | no disponible | Hugging Face |
| m-a-p/340M-20B-HGRN-pure-baseline (denso) | 340M | no disponible | 21,96 | no disponible | Hugging Face |
| Alternativas de 300-400M podadas al 90% | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa disponible es con el modelo base denso, que supera ampliamente al podado en perplejidad y precision media zero-shot. No se dispone de datos de otros modelos podados comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion severa de calidad: la perplejidad en WikiText-2 se multiplica por mas de 4 (de 21,96 a 94,30) y la precision media zero-shot cae 6,75 puntos (de 0,4400 a 0,3725).
- Caidas muy acusadas en tareas concretas: arc_easy pasa de 0,6153 a 0,3590 y openbookqa de 0,2380 a 0,1280.
- Sesgos conocidos: no documentados en la informacion disponible; al derivar de un modelo base sin model card de sesgos publicada, no pueden descartarse sesgos heredados.
- Riesgo de alucinacion: elevado en comparacion con el modelo denso, dado el aumento de perplejidad y la perdida de capacidades.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto nativa ni los idiomas soportados; la calibracion uso secuencias de 2.048 tokens.
- Restricciones de licencia: la licencia no esta declarada, por lo que no se puede asumir permiso de uso comercial. Es necesario contactar con el autor antes de cualquier uso en produccion.
- Dependencia tecnica: requiere `flash-linear-attention` para cargarse; sin esa libreria el modelo no funciona con `AutoModelForCausalLM`.
- Reproducibilidad limitada: los resultados provienen de una unica ejecucion (semilla 0) y no se han replicado de forma independiente.
- No apto para produccion: el checkpoint es un artefacto de investigacion sobre esparsidad, no un modelo listo para despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-340M-semi-structured-EHWS-90pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-HGRN-pure-baseline
- Libreria flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Codigo oficial de ELSA (protocolo de evaluacion y datos de calibracion): no disponible en la informacion proporcionada
- Paper de HGRN: no disponible en la informacion proporcionada
- Paper de ALPS (poda por error de reconstruccion): no disponible en la informacion proporcionada
- Repositorio con `results.json`: incluido en el repo del modelo en Hugging Face
