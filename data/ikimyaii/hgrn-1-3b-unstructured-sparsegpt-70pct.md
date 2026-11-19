# ikimyaii/HGRN-1.3B-unstructured-SparseGPT-70pct

## Resumen

HGRN-1.3B-unstructured-SparseGPT-70pct es una variante podada del modelo fla-hub/hgrn-1.3B-100B, un transformer basado en HGRN (Hierarchically Gated Recurrent Network, una arquitectura de tipo linear attention recurrente) desarrollado por el grupo FLA (Flash Linear Attention). El modelo ha sido sometido a una poda no estructurada one-shot del 70 % mediante el codigo oficial de SparseGPT (IST-DASLab), sin reentrenamiento posterior. Lo publica el usuario ikimyaii como baseline de referencia para sus modelos EHWS.

El interes de esta ficha no esta en el modelo como producto, sino como artefacto de investigacion: demuestra el coste real de aplicar SparseGPT sin fine-tuning sobre una arquitectura que no es OPT ni LLaMA, y sirve como punto de comparacion para experimentos de poda mas sofisticados. La perplexity se degrada de 11,81 a 121,53 en WikiText-2 y de 16,09 a 108,21 en C4, mientras que la media zero-shot cae de 0,4376 a 0,3678.

Con 1.364.396.032 parametros totales y un repositorio de 2,7 GB en safetensors, el modelo conserva embeddings y lm_head densos y poda todas las capas lineales de los bloques. No dispone de model card con licencia, idiomas ni pipeline declarados, por lo que su uso en produccion no esta respaldado por ninguna garantia del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network, linear attention recurrente) sobre transformer |
| Parametros totales | 1.364.396.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el calibrado uso secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16, repo en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | fla-hub/hgrn-1.3B-100B |
| Metodo de poda | SparseGPT oficial (IST-DASLab/sparsegpt@147d215, fasterprune, blocksize 128, damping 0.01) |
| Nivel de sparsity | 0,7000 (70 % no estructurada, one-shot, sin reentrenamiento) |
| Calibracion | 128 secuencias C4 de 2.048 tokens, seed 0 |
| Hardware de poda | 1 x A100 40GB, 3,6 minutos |
| Tamano del repo | 2,7 GB |

## Arquitectura y entrenamiento

El modelo base fla-hub/hgrn-1.3B-100B pertenece a la familia HGRN, una red recurrente con compuertas jerarquicas que sustituye la atencion cuadratica por un mecanismo lineal con estado recurrente. Esta variante concreta no ha sido entrenada desde cero: parte de los pesos del modelo base y aplica una poda no estructurada del 70 % en una sola pasada (one-shot) con el codigo oficial de SparseGPT, sin fase de recuperacion ni fine-tuning.

La poda se ejecuta bloque a bloque: cada bloque se calibra sobre las salidas de los bloques ya podados, siguiendo el esquema de los drivers oficiales. El autor reescribio el recorrido de capas (los drivers oficiales solo soportan OPT y LLaMA) pero mantuvo intacta la matematica de poda de SparseGPT. La mascara utiliza un umbral por bloque de 128 columnas, de modo que las filas resultantes tienen distinto numero de no-cero: en las 168 capas podadas, la fila mas densa tiene de media 2,05 veces los no-cero de la fila media (peor capa: 3,27x). Los embeddings y la lm_head permanecen densos.

## Capacidades

- Generacion de texto autoregresiva heredada del modelo base HGRN-1.3B.
- Razonamiento basico y respuesta a preguntas zero-shot, aunque con degradacion severa respecto al denso (media 0,3678 frente a 0,4376).
- Clasificacion de pares de frases (RTE, BoolQ) con caida moderada; BoolQ incluso mejora ligeramente (0,6199 frente a 0,5758).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues no disponibles.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Baseline de investigacion en poda: sirve como referencia para comparar tecnicas de poda mas avanzadas (por ejemplo, los modelos EHWS del mismo autor) sobre la misma arquitectura HGRN y el mismo protocolo de evaluacion.
- Estudio de degradacion por sparsity: permite medir empiricamente como afecta un 70 % de poda no estructurada sin recuperacion a tareas de razonamiento (ARC, HellaSwag) frente a tareas de clasificacion binaria (BoolQ, RTE).
- Validacion de tooling de SparseGPT en arquitecturas no LLaMA: util para quien necesite adaptar los drivers oficiales a modelos recurrentes o de attention lineal.
- Analisis de desequilibrio de filas: el sesgo de densidad por fila (hasta 3,27x en la peor capa) lo convierte en un caso de estudio para investigar poda balanceada por filas.
- Experimentos de recuperacion post-poda: punto de partida para fine-tuning o distillation que intenten recuperar la perplexity perdida (de 11,81 a 121,53 en WikiText-2).
- Docencia y divulgacion: ejemplo reproducible de poda one-shot con coste de computo bajo (3,6 minutos en una A100 40GB) para explicar el pipeline de SparseGPT.
- No recomendado para atencion al cliente, generacion de codigo en produccion ni despliegues reales, dada la degradacion de perplexity y la ausencia de licencia declarada.

## Benchmarks y rendimiento

Perplexity con protocolo de evaluacion de ELSA (WikiText-2 y C4, fp16):

| Metrica | Denso | Este modelo |
|---|---|---|
| WikiText-2 (ppl) | 11,81 | 121,53 |
| C4 (ppl) | 16,09 | 108,21 |

Precision zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2432 | 0,1826 |
| arc_easy | 0,5644 | 0,3333 |
| boolq | 0,5758 | 0,6199 |
| hellaswag | 0,3828 | 0,2805 |
| openbookqa | 0,2300 | 0,1380 |
| rte | 0,5379 | 0,5018 |
| winogrande | 0,5288 | 0,5185 |
| Media | 0,4376 | 0,3678 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,7 GB de pesos, mas overhead de activaciones y cache; en la practica cabe en GPUs consumer con 8 GB o mas.
- En cuantizacion de 8 bits o 4 bits el requisito baja, pero no se han publicado pesos cuantizados oficiales ni se documenta compatibilidad con GGUF.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; A100 40GB fue suficiente para la poda en 3,6 minutos.
- Cabe en consumer GPU: si, incluidas RTX 3060, RTX 4060, RTX 4090 y similares.
- Despliegue: requiere `flash-linear-attention` instalado (`import fla`) y `AutoModelForCausalLM.from_pretrained(...)`. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media zero-shot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HGRN-1.3B-unstructured-SparseGPT-70pct | 1,36B | no disponible | 0,3678 | no disponible | Hugging Face |
| fla-hub/hgrn-1.3B-100B (denso) | 1,36B | no disponible | 0,4376 | no disponible | Hugging Face |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Referenciados como objetivo de comparacion |

No se dispone de datos de benchmarks de modelos externos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion severa de perplexity: 121,53 en WikiText-2 frente a 11,81 del denso, un factor superior a 10x.
- Caida notable en razonamiento (ARC-Easy de 0,5644 a 0,3333; HellaSwag de 0,3828 a 0,2805).
- Poda no estructurada sin reentrenamiento: no hay fase de recuperacion que mitigue la perdida.
- Desequilibrio de filas: la fila mas densa tiene de media 2,05x los no-cero de la media (peor capa 3,27x), lo que complica el aprovechamiento real del sparsity en hardware.
- Licencia no declarada: no hay permiso explicito para uso comercial; verificar con el autor antes de cualquier despliegue.
- Idiomas no declarados: no se puede garantizar comportamiento multilingue.
- Riesgo de alucinacion elevado por la degradacion del modelo subyacente.
- Requiere dependencia especifica (`flash-linear-attention`); no es plug-and-play en stacks de inferencia habituales.
- Sin pipeline declarado, sin descargas ni likes: proyecto de investigacion sin validacion comunitaria.
- No apto para produccion sin evaluacion propia adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-1.3B-unstructured-SparseGPT-70pct
- Modelo base: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Codigo oficial de SparseGPT: https://github.com/IST-DASLab/sparsegpt (commit 147d215)
- Libreria flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Paper de HGRN: no disponible en la informacion proporcionada
- Paper de SparseGPT: no disponible en la informacion proporcionada
