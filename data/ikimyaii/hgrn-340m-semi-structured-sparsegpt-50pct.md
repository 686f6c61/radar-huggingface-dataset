# ikimyaii/HGRN-340M-semi-structured-SparseGPT-50pct

## Resumen

HGRN-340M-semi-structured-SparseGPT-50pct es una variante podada del modelo base m-a-p/340M-20B-HGRN-pure-baseline, un transformer con capas HGRN (Hierarchically Gated Recurrent Network, un tipo de red recurrente con compuertas jerarquicas) de 341.148.672 parametros entrenado sobre 20.000 millones de tokens. El autor, ikimyaii, aplica una poda one-shot (sin reentrenamiento) al 50% de sparsity semi-estructurada mediante una modificacion del algoritmo SparseGPT: en lugar de la regla N:M clasica, impone una restriccion por fila dentro de cada bloque de 128 columnas, de modo que cada fila poda exactamente el mismo numero de entradas de menor magnitud segun el criterio de SparseGPT. El resultado es una matriz con sparsity uniforme del 0,5000 verificada sobre los pesos finales.

El modelo es relevante como baseline reproducible para investigacion en poda de modelos y en tecnicas de sparsity semi-estructurada, especialmente para comparar contra los modelos EHWS del mismo autor. La poda afecta a todas las capas lineales dentro de los bloques, mientras que los embeddings y el lm_head permanecen densos. No se trata de una implementacion del SparseGPT publicado, sino de una variante con restriccion por fila que garantiza balanceo perfecto de trabajo por fila en las 168 capas podadas.

Al ser un modelo de investigacion de 340M de parametros, su interes no es el rendimiento absoluto sino la trazabilidad metodologica: la model card documenta calibracion, protocolo de evaluacion y resultados de perplexity y zero-shot, lo que permite reproducir y comparar el efecto de la poda sobre un HGRN de escala pequena.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network) sobre transformer; capas lineales podadas al 50% semi-estructurado |
| Parametros totales | 341.148.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 durante la poda; evaluacion en fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un HGRN de 340M de parametros entrenado sobre 20.000 millones de tokens (segun el identificador del modelo base: 340M-20B-HGRN). HGRN es una familia de redes recurrentes con compuertas jerarquicas que sustituye la atencion por recurrencia lineal, lo que reduce el coste computacional en contextos largos. Sobre este modelo se aplica una poda one-shot sin reentrenamiento: calibracion con 128 secuencias de C4 de 2.048 tokens (seed 0), usando el loader oficial y el codigo de poda oficial de SparseGPT, pero con un recorrido de capas nuevo (los drivers oficiales solo soportan OPT y LLaMA). Los bloques se podan en orden y cada bloque se calibra sobre las salidas de los bloques ya podados.

La innovacion tecnica es la modificacion de la mascara: en lugar de la regla N:M de SparseGPT, cada fila dentro de un bloque de 128 columnas poda el mismo numero de sus entradas de menor magnitud segun el criterio w^2 / [H^-1]_jj^2 (donde H es la matriz de Hessiano aproximada). Esto garantiza que todas las filas tengan el mismo numero de no-ceros, con balanceo perfecto de trabajo por fila, igual que la restriccion de los modelos EHWS. La poda se realizo en bfloat16 y tardo 1,6 minutos en una A100 de 40 GB. Las 168 capas lineales dentro de los bloques estan podadas; embeddings y lm_head permanecen densos.

## Capacidades

- Generacion de texto autoregresiva mediante `AutoModelForCausalLM` (requiere `flash-linear-attention` instalado e `import fla`).
- Razonamiento basico y respuesta a tareas de conocimiento general, degradado respecto al modelo denso por la poda.
- Evaluado en tareas de comprension lectora y sentido comun (arc_challenge, arc_easy, boolq, hellaswag, openbookqa, rte, winogrande).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion en poda de modelos: sirve como baseline reproducible para comparar tecnicas de sparsity semi-estructurada (SparseGPT clasico, EHWS, variantes con restriccion por fila) sobre una arquitectura HGRN, gracias a que la model card documenta calibracion, protocolo y resultados.
- Estudio de balanceo de trabajo en hardware: al garantizar el mismo numero de no-ceros por fila en las 168 capas podadas, permite medir el impacto de la sparsity uniforme en kernels sparse y en el rendimiento real de inferencia.
- Evaluacion de degradacion por poda: util para cuantificar la perdida de perplexity (de 21,96 a 28,21 en WikiText-2 y de 21,94 a 25,77 en C4) y de accuracy zero-shot (de 0,4400 a 0,4277 de media) en un modelo de 340M, como referencia para escalar el analisis a modelos mayores.
- Reproduccion de experimentos: el modelo permite verificar la metodologia descrita (128 secuencias de C4 de 2.048 tokens, seed 0, poda en bfloat16 en una A100 40GB) y comparar contra los modelos EHWS del mismo autor.
- Prototipado de bajo coste en entornos con recursos limitados: con 341M de parametros y un repo de 0,7 GB, cabe en GPUs de consumo para pruebas de generacion de texto, aunque con calidad degradada respecto al denso.
- Docencia y divulgacion: ejemplo concreto y trazable de poda one-shot con restriccion por fila, util para explicar sparsity semi-estructurada con numeros medidos.

## Benchmarks y rendimiento

Perplexity (protocolo de evaluacion de ELSA, conjuntos de test WikiText-2 y C4, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 21,96 | 21,94 |
| Este modelo (50% sparsity) | 28,21 | 25,77 |

Zero-shot accuracy (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2628 | 0,2415 |
| arc_easy | 0,6153 | 0,5745 |
| boolq | 0,6028 | 0,6107 |
| hellaswag | 0,3423 | 0,3218 |
| openbookqa | 0,2380 | 0,2140 |
| rte | 0,5126 | 0,5271 |
| winogrande | 0,5059 | 0,5043 |
| Media | 0,4400 | 0,4277 |

Sparsity de las capas podadas medida sobre estos pesos: 0,5000, con el mismo numero de no-ceros por fila en las 168 capas podadas.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 0,7 GB en safetensors; en fp16 el modelo requiere aproximadamente 0,7 GB de pesos mas overhead de activaciones y cache, por lo que cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para pruebas; la poda se realizo en una A100 de 40 GB (1,6 minutos), pero la inferencia no requiere esa GPU.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060 o superiores, dado el tamano reducido.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained` con `flash-linear-attention` instalado. No se documentan vLLM, llama.cpp, Ollama ni TGI para esta arquitectura.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Sparsity | Perplexity WikiText-2 | Licencia |
|---|---|---|---|---|---|
| Este modelo (HGRN-340M SparseGPT 50%) | 341M | no disponible | 50% semi-estructurada por fila | 28,21 | no disponible |
| m-a-p/340M-20B-HGRN-pure-baseline (denso) | 340M | no disponible | 0% | 21,96 | no disponible |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La poda one-shot sin reentrenamiento degrada la calidad: la perplexity sube de 21,96 a 28,21 en WikiText-2 (+28,5%) y de 21,94 a 25,77 en C4 (+17,5%), y la accuracy zero-shot media cae de 0,4400 a 0,4277.
- No es el SparseGPT publicado: la mascara se modifica con una restriccion por fila, por lo que los resultados no son directamente comparables con los del metodo original.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que contactar con el autor o consultar el modelo base.
- Idiomas soportados no disponibles: no se documenta cobertura multilingue.
- Longitud de contexto no disponible: no se especifica la ventana maxima del modelo base ni del podado.
- Riesgo de alucinacion y sesgos: no documentados en la model card; al ser un modelo pequeno y podado, el riesgo de respuestas incorrectas es mayor que en el denso.
- Requiere `flash-linear-attention` para cargar el modelo; sin esa dependencia la carga con `AutoModelForCausalLM` puede fallar.
- Modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ikimyaii/HGRN-340M-semi-structured-SparseGPT-50pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-HGRN-pure-baseline
- Repositorio flash-linear-attention: no disponible en la informacion proporcionada
- Paper de SparseGPT: no disponible en la informacion proporcionada
- Paper de HGRN: no disponible en la informacion proporcionada
- Repositorio fasterprune: no disponible en la informacion proporcionada
