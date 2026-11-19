# ikimyaii/HGRN-340M-semi-structured-SparseGPT-70pct

## Resumen

HGRN-340M-semi-structured-SparseGPT-70pct es un modelo de lenguaje de 341 millones de parametros derivado de m-a-p/340M-20B-HGRN-pure-baseline mediante poda one-shot (sin reentrenamiento) al 70 % de esparsidad semi-estructurada. Lo publica el usuario ikimyaii en Hugging Face y su proposito es servir de linea base para una familia de modelos podados con la tecnica EHWS del mismo autor. No es un modelo nuevo entrenado desde cero, sino un checkpoint comprimido del baseline HGRN de 340M.

La relevancia tecnica esta en el metodo de poda: usa el codigo oficial de SparseGPT (`fasterprune`) con una modificacion del patron de mascara. En lugar de la regla N:M clasica, dentro de cada bloque de 128 columnas cada fila poda el mismo numero de entradas de menor magnitud segun la metrica `w^2 / [H^-1]_jj^2`, de modo que todas las filas acaban con identica cuenta de no ceros. Esto equilibra perfectamente la carga de trabajo por fila, una condicion necesaria para acelerar la inferencia en hardware real con kernels dispersos.

El modelo conserva la arquitectura HGRN (Hierarchically Gated Recurrent Network) del baseline, con 341.148.672 parametros y pesos en bfloat16 en formato safetensors. El precio de la compresion es muy alto: la perplejidad en WikiText-2 pasa de 21,96 a 139,58 y la media zero-shot cae de 0,4400 a 0,3780, lo que lo hace poco util para uso directo en produccion y lo situa como referencia experimental de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network), transformer recurrente con puertas jerarquicas |
| Parametros totales | 341.148.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el baseline se entrena con secuencias de 2.048 tokens; no se confirma contexto maximo) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura HGRN del baseline m-a-p/340M-20B-HGRN-pure-baseline, una red recurrente con compuertas jerarquicas pensada para modelado de lenguaje eficiente en contexto largo, con 341 millones de parametros. Sobre ese checkpoint no hay entrenamiento adicional: la unica transformacion es la poda one-shot descrita en la model card.

El procedimiento de poda sigue estos pasos: se usa el cargador oficial de SparseGPT con 128 secuencias de C4 de 2.048 tokens como conjunto de calibracion (semilla 0); los bloques se podan en orden y cada bloque se calibra sobre las salidas de los bloques ya podados, igual que en los drivers oficiales. El recorrido de capas es codigo nuevo del autor (los drivers oficiales solo soportan OPT y LLaMA), mientras que la matematica de poda es la del codigo oficial. Se podan todas las capas lineales dentro de los bloques, dejando embeddings y `lm_head` densos. Los pesos se podan en bfloat16 y el proceso completo tarda 1,6 minutos en una A100 de 40 GB. La esparsidad medida sobre los pesos finales es 0,7001 y se verifico que las 168 capas podadas tienen el mismo numero de no ceros por fila.

## Capacidades

- Generacion de texto autoregresiva basica, heredada del baseline HGRN de 340M.
- Modelado de lenguaje y calculo de perplejidad sobre texto en ingles (WikiText-2, C4) como caso de evaluacion.
- Clasificacion zero-shot mediante lm-evaluation-harness en tareas de eleccion multiple y NLI (arc_challenge, arc_easy, boolq, hellaswag, openbookqa, rte, winogrande).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues.
- No se documentan modos especiales (thinking, vision, audio).
- Requiere `flash-linear-attention` instalado (`import fla`) para cargarse con `AutoModelForCausalLM.from_pretrained(...)`.

## Casos de uso

- Linea base de investigacion en poda: sirve como referencia contra la que comparar los modelos EHWS del mismo autor, ya que comparte baseline, calibracion y protocolo de evaluacion.
- Estudio del equilibrio de carga en kernels dispersos: al tener el mismo numero de no ceros por fila en las 168 capas podadas, permite medir el rendimiento real de kernels semi-estructurados sin desbalanceo entre filas.
- Validacion de recetas de poda one-shot: util para reproducir el pipeline SparseGPT con restriccion por fila y comparar perplejidad y zero-shot frente al checkpoint denso.
- Analisis de degradacion por esparsidad: la caida de perplejidad (21,96 a 139,58 en WikiText-2) y de exactitud media (0,4400 a 0,3780) sirve para cuantificar el coste de comprimir un modelo recurrente pequeno al 70 %.
- Experimentos de inferencia eficiente en hardware modesto: con 341M parametros y 0,7 GB de repo, cabe en GPU de consumo para pruebas de latencia con kernels dispersos.
- Docencia y divulgacion: ejemplo reproducible de poda semi-estructurada con calibracion en C4 y evaluacion con lm-evaluation-harness.

## Benchmarks y rendimiento

Perplejidad (protocolo de evaluacion de ELSA, fp16):

| Metrica | Denso | Este modelo |
|---|---|---|
| WikiText-2 | 21,96 | 139,58 |
| C4 | 21,94 | 102,91 |

Exactitud zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2628 | 0,1903 |
| arc_easy | 0,6153 | 0,3864 |
| boolq | 0,6028 | 0,6092 |
| hellaswag | 0,3423 | 0,2802 |
| openbookqa | 0,2380 | 0,1420 |
| rte | 0,5126 | 0,5271 |
| winogrande | 0,5059 | 0,5107 |
| Media | 0,4400 | 0,3780 |

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, unos 0,68 GB solo para pesos (341M parametros x 2 bytes), mas activaciones y cache; en la practica, menos de 2 GB en GPU.
- Cabe en cualquier GPU de consumo con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.).
- GPU recomendadas para pruebas de rendimiento disperso: A100 40 GB (usada para la poda, 1,6 minutos) y H100 para medir aceleracion con kernels semi-estructurados.
- Opciones de despliegue: carga mediante `AutoModelForCausalLM` de Transformers con `flash-linear-attention` instalado; no se documentan soportes de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (HGRN-340M, 70 % sparse) | 341M | no disponible | 139,58 | no disponible | Hugging Face |
| m-a-p/340M-20B-HGRN-pure-baseline (denso) | 341M | no disponible | 21,96 | no disponible | Hugging Face |
| Alternativas de 340M comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa disponible es con su baseline denso, que gana en todas las metricas salvo boolq, rte y winogrande, donde las diferencias son minimas o ligeramente favorables al modelo podado.

## Limitaciones y advertencias

- Degradacion severa por la poda: perplejidad en WikiText-2 multiplicada por 6,4 y en C4 por 4,7 respecto al denso.
- Caida notable en tareas de razonamiento y conocimiento: arc_easy baja de 0,6153 a 0,3864 y openbookqa de 0,2380 a 0,1420.
- No es un modelo para produccion: su funcion declarada es ser linea base experimental de los modelos EHWS.
- Riesgo de alucinacion elevado por el tamano reducido (341M) y por el dano de la poda.
- Licencia no especificada: no se puede confirmar el uso comercial.
- Idiomas no declarados; la evaluacion se limita a ingles (C4, WikiText-2, lm-evaluation-harness).
- Longitud de contexto maxima no documentada; la calibracion usa secuencias de 2.048 tokens.
- Requiere la dependencia `flash-linear-attention` para cargarse, lo que anade friccion de despliegue.
- La poda se aplico sin reentrenamiento, por lo que no hay recuperacion de capacidad tras el recorte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-340M-semi-structured-SparseGPT-70pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-HGRN-pure-baseline
- Repositorio flash-linear-attention: no disponible en la informacion proporcionada
- Paper de SparseGPT: no disponible en la informacion proporcionada
- Paper de HGRN: no disponible en la informacion proporcionada
- Demo o blog del autor: no disponible en la informacion proporcionada
