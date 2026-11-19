# ikimyaii/HGRN-340M-semi-structured-Wanda-50pct

## Resumen

HGRN-340M-semi-structured-Wanda-50pct es un modelo de lenguaje derivado de m-a-p/340M-20B-HGRN-pure-baseline, podado de forma one-shot (sin reentrenamiento) al 50% de esparsidad semi-estructurada mediante el algoritmo Wanda. Lo publica el usuario ikimyaii como baseline de referencia para sus modelos EHWS. El modelo conserva la arquitectura HGRN (Hierarchically Gated Recurrent Network) del original, con 341.148.672 parametros totales, pero aproximadamente la mitad de los pesos de las capas lineales internas de los bloques estan a cero.

La relevancia de esta ficha es metodologica: documenta el impacto real de una poda Wanda al 50% sobre un modelo pequeno de 340M parametros, con perplexity y exactitud zero-shot medidas frente al modelo denso de partida. El resultado es una perdida moderada de calidad (perplexity de 21,96 a 28,80 en WikiText-2) a cambio de reducir el trabajo de inferencia en las capas podadas, con un patron de esparsidad perfectamente equilibrado por fila.

El modelo es de proposito general para generacion de texto y evaluacion comparativa de tecnicas de compresion, no un modelo de produccion pulido. No hay informacion publicada sobre licencia, idiomas soportados ni pipeline de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network), basada en la del modelo m-a-p/340M-20B-HGRN-pure-baseline |
| Parametros totales | 341.148.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; calibracion realizada con secuencias de 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Esparsidad | 50% semi-estructurada en todas las capas lineales internas de los bloques (168 capas verificadas) |
| Capas densas | embeddings y lm_head sin podar |
| Modelo base | m-a-p/340M-20B-HGRN-pure-baseline |
| Tamano del repo | 0,7 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es HGRN, una red recurrente con compuertas jerarquicas que sustituye la atencion cuadratica clasica por recurrencia lineal con decaimiento controlado por compuerta. El modelo base m-a-p/340M-20B-HGRN-pure-baseline fue entrenado presumiblemente sobre 20.000 millones de tokens (segun la nomenclatura "20B" del identificador), aunque la model card de esta variante no detalla la composicion del dataset ni si hubo RLHF o DPO.

La innovacion tecnica de esta publicacion es la poda: se aplica Wanda en su rama unstructured con `use_variant=False`, donde cada fila elimina los pesos con menor magnitud ponderada por la norma de activaciones `|W| * sqrt(||X||)`. La calibracion usa el cargador oficial con 128 secuencias de C4 de 2.048 tokens y semilla 0, podando los bloques en orden y calibrando cada bloque sobre las salidas de los bloques ya podados. Los pesos se podan en bfloat16 y el proceso completo tarda 0,8 minutos en una A100 de 40 GB. Todas las capas lineales internas de los 168 bloques quedan con exactamente el mismo numero de no-ceros por fila, lo que garantiza equilibrio de carga por fila en kernels que exploten la esparsidad.

## Capacidades

- Generacion de texto autoregresiva con el modelo base HGRN de 340M parametros.
- Razonamiento basico y respuesta a preguntas de sentido comun, con degradacion moderada respecto al modelo denso (exactitud media zero-shot de 0,4252 frente a 0,4400).
- Evaluacion comparativa de tecnicas de poda: sirve como baseline controlado para medir el coste de calidad de Wanda al 50%.
- Inferencia con esparsidad semi-estructurada equilibrada por fila, apta para kernels que aprovechen el patron de no-ceros.
- Capacidades multilingues: no disponibles (la model card no documenta idiomas).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion sobre compresion de modelos: usar este checkpoint como referencia fija para comparar nuevas tecnicas de poda (por ejemplo, los modelos EHWS del mismo autor) contra una poda Wanda estandar al 50% sobre el mismo modelo base.
- Estudio del coste de calidad de la poda one-shot: medir la degradacion en perplexity (de 21,96 a 28,80 en WikiText-2) y en tareas zero-shot para justificar o descartar reentrenamiento posterior.
- Desarrollo de kernels de inferencia esparsa: el patron de exactamente igual numero de no-ceros por fila permite validar kernels semi-estructurados y medir speedup real frente al modelo denso.
- Despliegue en entornos con memoria y computo muy limitados: 341M parametros con la mitad de pesos eliminados en las capas lineales internas encaja en GPUs de gama baja o incluso CPU para tareas de generacion de texto no criticas.
- Reproducibilidad de experimentos de poda: el pipeline documentado (128 secuencias C4 de 2.048 tokens, semilla 0, 0,8 minutos en A100 40 GB) permite replicar el resultado y auditar la metodologia.
- Educacion y docencia sobre compresion de modelos: ilustra de forma concreta la diferencia entre esparsidad no estructurada, semi-estructurada y densa con numeros medidos en el mismo checkpoint.

## Benchmarks y rendimiento

Perplexity (protocolo de evaluacion de ELSA, fp16):

| Metrica | Denso | Este modelo |
|---|---|---|
| WikiText-2 | 21,96 | 28,80 |
| C4 | 21,94 | 26,33 |

Exactitud zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2628 | 0,2406 |
| arc_easy | 0,6153 | 0,5791 |
| boolq | 0,6028 | 0,6107 |
| hellaswag | 0,3423 | 0,3229 |
| openbookqa | 0,2380 | 0,1980 |
| rte | 0,5126 | 0,5126 |
| winogrande | 0,5059 | 0,5122 |
| Media | 0,4400 | 0,4252 |

Esparsidad medida sobre estos pesos: 0,5000 en las 168 capas podadas, con el mismo numero de no-ceros por fila en todas ellas.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 0,7 GB de pesos mas overhead de activaciones y cache; en la practica cabe en GPUs consumer con 4 GB o menos.
- GPU recomendadas: cualquier GPU con soporte de bfloat16 (RTX 3090, RTX 4090, A100, H100); una A100 40 GB sobra para la poda y para la inferencia.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna de 4 GB o mas (GTX 1650, RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained` con `flash-linear-attention` instalado (`import fla`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la model card solo reporta el tiempo de poda (0,8 minutos en A100 40 GB), no metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplexity WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (HGRN-340M Wanda 50%) | 341M | no disponible | 28,80 | no disponible | Hugging Face |
| m-a-p/340M-20B-HGRN-pure-baseline (denso) | 340M | no disponible | 21,96 | no disponible | Hugging Face |
| Alternativas de poda EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face (cuenta ikimyaii) |

La comparacion principal es contra el modelo denso de origen, que es el unico comparable con datos medidos en la misma informacion. No se dispone de datos de otros modelos de 340M podados al 50% para una comparacion externa fiable.

## Limitaciones y advertencias

- Degradacion de calidad medible: la perplexity sube de 21,96 a 28,80 en WikiText-2 (+31%) y de 21,94 a 26,33 en C4 (+20%); la exactitud media zero-shot cae de 0,4400 a 0,4252.
- Poda one-shot sin reentrenamiento: no hay recuperacion de calidad posterior, por lo que el checkpoint no debe tratarse como equivalente al denso.
- Sesgos conocidos: no documentados; al heredar el modelo base, arrastra los sesgos de su dataset de entrenamiento, que no se detalla.
- Riesgo de alucinacion: alto para un modelo de 340M parametros, especialmente tras la poda; no es adecuado para tareas de alta precision sin verificacion humana.
- Idiomas: no documentados; no hay garantia de calidad multilingue.
- Licencia: no disponible; antes de cualquier uso comercial hay que verificar la licencia del modelo base m-a-p/340M-20B-HGRN-pure-baseline y la del checkpoint.
- Dependencia de `flash-linear-attention`: sin `import fla` el modelo no carga correctamente con `AutoModelForCausalLM`.
- Contexto: la model card no declara la ventana maxima; la calibracion uso 2.048 tokens, pero eso no confirma el limite real del modelo.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigacion, no un modelo con soporte comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-340M-semi-structured-Wanda-50pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-HGRN-pure-baseline
- Codigo oficial de Wanda: https://github.com/locuslab/wanda (commit 8e8fc87)
- Libreria flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Protocolo de evaluacion ELSA: no disponible como enlace en la informacion proporcionada
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
