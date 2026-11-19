# ikimyaii/HGRN-340M-semi-structured-Wanda-70pct

## Resumen

HGRN-340M-semi-structured-Wanda-70pct es un checkpoint derivado del modelo base m-a-p/340M-20B-HGRN-pure-baseline, un transformer con capas HGRN (Hierarchically Gated Recurrent Network) de aproximadamente 341 millones de parámetros, entrenado sobre 20.000 millones de tokens. El modelo ha sido podado de forma one-shot, sin reentrenamiento posterior, aplicando el algoritmo Wanda (Weights and Activations) con código oficial del repositorio locuslab/wanda, hasta alcanzar una densidad del 30 % (esparsidad del 70 %). Lo publica el usuario ikimyaii como referencia base para su línea de modelos EHWS.

La relevancia de esta ficha es metodológica más que de producto: documenta el coste real de aplicar poda semi-estructurada agresiva a un modelo pequeño sin destilación ni fine-tuning de recuperación. Los resultados publicados muestran una degradación severa de la perplejidad (de 21,96 a 221,33 en WikiText-2 y de 21,94 a 170,02 en C4), lo que lo convierte en un punto de comparación útil para investigar técnicas de poda, no en un modelo listo para producción.

El checkpoint conserva el 69,94 % de esparsidad medida sobre los pesos finales, con el mismo número de pesos no nulos en cada fila de las 168 capas podadas, lo que garantiza un reparto de trabajo equilibrado por fila en kernels que exploten esa estructura. Las capas de embedding y `lm_head` permanecen densas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas HGRN (Hierarchically Gated Recurrent Network); requiere `flash-linear-attention` |
| Parametros totales | 341.148.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el calibrado usa secuencias de 2.048 tokens, no se declara contexto máximo) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en origen) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,7 GB) |
| Esparsidad | 69,94 % medida; 70 % nominal semi-estructurada por fila |
| Modelo base | m-a-p/340M-20B-HGRN-pure-baseline |
| Metodo de poda | Wanda one-shot, código oficial (locuslab/wanda@8e8fc87), `use_variant=False` |
| Calibracion | 128 secuencias de C4 de 2.048 tokens, seed 0 |
| Coste de poda | 0,8 minutos en una A100 40 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de 341 millones de parámetros con capas HGRN, un mecanismo recurrente con puertas jerárquicas que sustituye la atención cuadrática por recurrencia lineal. El entrenamiento del baseline original cubre 20.000 millones de tokens según indica el nombre del checkpoint (`340M-20B-HGRN-pure-baseline`); no se dispone de detalles sobre la composición del corpus, el uso de RLHF o DPO ni la longitud de contexto nativa.

Sobre ese baseline se aplica poda Wanda one-shot: para cada fila de cada capa lineal se eliminan los pesos con menor producto `|W| * sqrt(||X||)`, donde `X` son las activaciones de calibración. El pipeline recorre las capas en orden y calibra cada bloque sobre las salidas de los bloques ya podados, replicando el comportamiento de los drivers oficiales (que solo cubren OPT y LLaMA) con un recorrido de capas nuevo para HGRN. La poda se ejecuta en bfloat16. El resultado es una esparsidad uniforme por fila: cada fila de las 168 capas podadas conserva exactamente el mismo número de pesos no nulos, lo que permite kernels con carga balanceada. Embeddings y `lm_head` no se tocan.

## Capacidades

- Generación de texto autoregresiva mediante `AutoModelForCausalLM.from_pretrained`, condicionada a tener `flash-linear-attention` instalado (`import fla`).
- Razonamiento y respuesta a preguntas de conocimiento general, aunque con calidad muy degradada respecto al denso (media zero-shot de 0,3679 frente a 0,4400).
- Evaluación comparativa en tareas de elección múltiple: ARC, HellaSwag, OpenBookQA, BoolQ, RTE y Winogrande.
- Capacidad multilingüe: no disponible.
- Tool calling, function calling, agentes y multi-step reasoning: no disponible; no se declara soporte.
- Modo thinking, visión o audio: no disponible.
- Uso principal como referencia de investigación en poda, no como modelo de propósito general.

## Casos de uso

- Investigación en poda semi-estructurada: sirve como baseline controlado para medir cuánto recupera una técnica de destilación o un fine-tuning corto frente a la poda one-shot pura, usando la tabla de perplejidad y zero-shot publicada como punto de partida.
- Desarrollo de kernels para esparsidad 2:4 o N:M: la uniformidad por fila (mismo número de no nulos en cada fila de las 168 capas) permite validar rutinas de SpMM con carga equilibrada sin necesidad de reordenar pesos.
- Estudio del coste de compresión en modelos pequeños: cuantificar la relación entre esparsidad nominal (70 %) y esparsidad efectiva (69,94 %) y su impacto en la perplejidad en un modelo de 341 M, útil para extrapolar a escalas mayores.
- Reproducibilidad de Wanda sobre arquitecturas no cubiertas: el autor documenta un recorrido de capas nuevo para HGRN; el checkpoint permite verificar los resultados del paper original en una familia distinta de OPT y LLaMA.
- Enseñanza y experimentación con `flash-linear-attention`: modelo pequeño (0,7 GB) que cabe en cualquier GPU consumer y permite practicar la carga de arquitecturas recurrentes lineales con la API de Transformers.
- Comparación de protocolos de evaluación: el autor usa el protocolo de ELSA (WikiText-2 y C4 en fp16) y lm-evaluation-harness, lo que facilita contrastar resultados con otros checkpoints podados bajo el mismo marco.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA (WikiText-2 y C4, fp16):

| Metrica | Denso | Este modelo |
|---|---|---|
| WikiText-2 (ppl) | 21,96 | 221,33 |
| C4 (ppl) | 21,94 | 170,02 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2628 | 0,1809 |
| arc_easy | 0,6153 | 0,3695 |
| boolq | 0,6028 | 0,6021 |
| hellaswag | 0,3423 | 0,2720 |
| openbookqa | 0,2380 | 0,1380 |
| rte | 0,5126 | 0,4982 |
| winogrande | 0,5059 | 0,5146 |
| Media | 0,4400 | 0,3679 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, unos 0,7 GB de pesos más activaciones y caché; en la práctica cabe en GPUs con 4 GB o más. La esparsidad del 70 % no reduce automáticamente la memoria residente, solo el coste de cómputo si se usa un kernel compatible.
- GPU recomendadas: cualquier GPU con soporte de bfloat16 (A100, H100, RTX 30/40, L4, T4 con fp16). El autor realizó la poda en una A100 40 GB en 0,8 minutos.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4090 24 GB y superiores; incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: Transformers con `flash-linear-attention` instalado es el único camino documentado. No se declara soporte para vLLM, llama.cpp, Ollama ni TGI; la arquitectura HGRN no está en los kernels estándar de esos motores.
- Latencia y throughput estimados: no disponible. La esparsidad uniforme por fila sugiere que un kernel SpMM dedicado podría acelerar las capas lineales, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Esparsidad | Media zero-shot | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HGRN-340M-semi-structured-Wanda-70pct | 341 M | no disponible | 70 % (69,94 % medida) | 0,3679 | no disponible | Hugging Face |
| m-a-p/340M-20B-HGRN-pure-baseline (denso) | 341 M | no disponible | 0 % | 0,4400 | no disponible | Hugging Face |
| Otros checkpoints EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face (misma cuenta) |

La comparación más informativa es contra el propio denso, ya que no se dispone de datos de otros modelos podados de tamaño similar en la información proporcionada. La caída de 0,0721 puntos en la media zero-shot y el aumento de un orden de magnitud en perplejidad sitúan este checkpoint en el extremo de poda agresiva sin recuperación.

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad en WikiText-2 se multiplica por diez (21,96 a 221,33) y la media zero-shot cae de 0,4400 a 0,3679. No es apto para uso en producción sin un proceso de recuperación (destilación, fine-tuning o QAT).
- Riesgo alto de alucinación y de respuestas incoherentes derivado de la poda one-shot sin reentrenamiento; el autor no documenta evaluación de factualidad ni de seguridad.
- Sesgos conocidos: no disponibles. El modelo base no publica análisis de sesgo y el checkpoint podado no añade ninguno.
- Limitaciones de contexto e idioma: no se declara longitud de contexto nativa ni cobertura de idiomas; el calibrado usa secuencias de 2.048 tokens, lo que no garantiza comportamiento correcto más allá de esa longitud.
- Restricciones de licencia: la licencia no está disponible en la model card ni en los metadatos de Hugging Face. No se puede asumir uso comercial sin consultar al autor del modelo base.
- Dependencia de `flash-linear-attention`: sin esa librería instalada, la carga con `AutoModelForCausalLM` falla. Esto limita la integración con motores de inferencia estándar.
- La esparsidad no reduce memoria por sí sola: el checkpoint sigue ocupando 0,7 GB en bfloat16; la ventaja solo aparece con kernels que exploten la estructura por fila.
- Repositorio sin descargas ni likes y creado en noviembre de 2026: no hay evidencia de uso comunitario ni de validación independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-340M-semi-structured-Wanda-70pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-HGRN-pure-baseline
- Código oficial de Wanda: https://github.com/locuslab/wanda (commit 8e8fc87)
- Librería flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Paper de HGRN: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
