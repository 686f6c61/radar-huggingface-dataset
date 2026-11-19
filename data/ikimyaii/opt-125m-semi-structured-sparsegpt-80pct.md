# ikimyaii/OPT-125M-semi-structured-SparseGPT-80pct

## Resumen

OPT-125M-semi-structured-SparseGPT-80pct es un modelo derivado de facebook/opt-125m al que se le ha aplicado poda estructurada semiestructurada del 80 % mediante una variante propia de SparseGPT, sin reentrenamiento posterior (one-shot). Lo publica el usuario ikimyaii como baseline de su familia de modelos EHWS, y su interes no esta en el rendimiento final sino en documentar el efecto de una restriccion de mascara por fila sobre el metodo SparseGPT original.

El modelo conserva la arquitectura transformer decoder-only de OPT-125M (12 capas, 768 dimensiones ocultas, 12 cabezas de atencion) y sus 125.239.296 parametros, pero las capas lineales internas de los bloques quedan con una densidad del 20 % (esparsidad medida de 0,7997). Las embeddings y la lm_head permanecen densas.

Es relevante como referencia negativa: con perplexity de 1107,25 en WikiText-2 y 559,86 en C4, y una media de 0,3306 en zero-shot, el modelo queda muy degradado respecto al OPT-125M original. Sirve para estudiar limites de la poda agresiva sin destilacion ni ajuste fino, y para comparar variantes de mascara en el mismo regimen de esparsidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OPT), con poda semiestructurada en capas lineales |
| Parametros totales | 125.239.296 (sin cambios respecto al base; la poda no reduce el recuento, solo anula pesos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base OPT-125M usa 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en float16 tras la poda; el repo solo contiene safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Esparsidad | 0,7997 medida sobre los pesos publicados; misma densidad en cada fila de las 72 capas podadas |
| Modelo base | facebook/opt-125m |
| Tamano del repo | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura es la de OPT-125M: un transformer decoder-only con atencion multi-cabeza, 12 capas, 768 dimensiones de modelo y 12 cabezas. Sobre esa red se aplica una poda one-shot de SparseGPT con una modificacion de la mascara: dentro de cada bloque de 128 columnas, cada fila poda el mismo numero de entradas de menor magnitud segun la regla w^2 / [H^-1]_jj^2, es decir, la regla N:M de SparseGPT con M igual al tamano del bloque. El resultado es que todas las filas de una capa podada tienen el mismo numero de no ceros, lo que equilibra el trabajo por fila en kernels dispersos (la misma restriccion que usa EHWS).

El procedimiento de calibracion usa el cargador oficial con 128 secuencias de C4 de 2048 tokens y semilla 0. Los bloques se podan en orden y cada bloque se calibra sobre las salidas de los bloques ya podados, como en los drivers oficiales. El recorrido de capas es codigo nuevo (los drivers oficiales solo cubren OPT y LLaMA), mientras que la matematica de poda es la del codigo oficial. Los pesos se podan en float16 y el proceso completo tarda 0,4 minutos en una A100 de 40 GB. No hay reentrenamiento, destilacion ni ajuste fino posterior; tampoco se menciona RLHF ni DPO.

## Capacidades

- Generacion de texto autoregresiva basica, heredada del OPT-125M original, aunque severamente degradada por la poda.
- Razonamiento y conocimiento factual muy limitados: la accuracy media zero-shot es de 0,3306, cercana al azar en varias tareas.
- Codigo y matematicas: sin evidencia de rendimiento utilizable en la informacion disponible.
- Tool calling / function calling: no disponible; el modelo base no lo soporta de forma nativa y la poda no anade capacidades.
- Agentes y razonamiento multi-paso: no adecuado en la practica por la perdida de calidad.
- Multilingue: no documentado; el modelo base esta entrenado principalmente en ingles.
- Capacidades especiales (vision, audio, thinking mode): ninguna.

## Casos de uso

- Baseline de investigacion en poda: sirve como referencia cuantitativa para comparar variantes de mascara (por ejemplo, EHWS) bajo la misma esparsidad del 80 % y el mismo protocolo de evaluacion.
- Estudio de degradacion por esparsidad: permite medir como cae la perplexity y la accuracy zero-shot al aumentar la poda sin reentrenamiento, usando WikiText-2 y C4 como conjuntos de control.
- Validacion de kernels dispersos: al tener todas las filas el mismo numero de no ceros, es util para probar implementaciones de SpMM y comprobar el equilibrio de carga por fila en las 72 capas podadas.
- Reproducibilidad de pipelines de poda: el modelo documenta calibracion, semilla, hardware y tiempo de ejecucion, lo que facilita replicar el experimento en entornos con una sola A100.
- Docencia sobre compresion de modelos: ejemplo concreto de que la poda one-shot agresiva sin recuperacion destruye la calidad, util para ilustrar la necesidad de destilacion o ajuste fino.
- Pruebas de carga y formato: al ocupar 0,3 GB en safetensors, sirve para validar flujos de `AutoModelForCausalLM.from_pretrained` y de despliegue en entornos con recursos minimos, sin pretension de calidad.

## Benchmarks y rendimiento

Perplexity con el protocolo de evaluacion de ELSA (WikiText-2 y C4, fp16):

| Conjunto | Perplexity |
|---|---|
| WikiText-2 | 1107,25 |
| C4 | 559,86 |

Zero-shot con lm-evaluation-harness:

| Tarea | Accuracy |
|---|---|
| arc_challenge | 0,1877 |
| arc_easy | 0,3047 |
| boolq | 0,3783 |
| hellaswag | 0,2636 |
| openbookqa | 0,1440 |
| rte | 0,5271 |
| winogrande | 0,5091 |
| Media | 0,3306 |

No se han publicado en la informacion disponible resultados comparativos con el OPT-125M denso ni con otras variantes de poda, ni cifras de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 0,25 GB solo de pesos, mas overhead de activaciones y cache KV; cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU moderna; el autor uso una A100 de 40 GB para la poda (0,4 minutos), pero para inferencia basta una GTX 1650, RTX 3050, RTX 4090 o similar.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos anos, e incluso en CPU.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained` (soporte directo segun el autor); vLLM, llama.cpp, Ollama y TGI no estan documentados para este checkpoint y requeririan conversion o soporte de kernels dispersos.
- Latencia y throughput: no disponibles en la informacion proporcionada. La ventaja teorica de la esparsidad por fila solo se materializa con kernels dispersos especificos, no con la inferencia densa estandar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Esparsidad | Perplexity WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo | 125,2 M | no disponible | 80 % semiestructurada | 1107,25 | no disponible | Hugging Face |
| facebook/opt-125m (denso) | 125,2 M | 2048 | 0 % | no disponible en la informacion | OPT-175B License (modelo base) | Hugging Face |
| Otras variantes EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | no disponible | Cuenta ikimyaii |

La comparacion directa con el OPT-125M denso no puede cuantificarse porque la informacion proporcionada no incluye sus metricas bajo el mismo protocolo; la diferencia de perplexity esperada es muy grande a la vista de los valores absolutos del modelo podado.

## Limitaciones y advertencias

- Calidad severamente degradada: perplexity de 1107,25 en WikiText-2 y media zero-shot de 0,3306, con tareas como openbookqa (0,1440) por debajo del azar practico.
- Poda one-shot sin reentrenamiento: no hay recuperacion de capacidad, por lo que el modelo no es apto para produccion ni para uso conversacional real.
- Sesgos: no documentados, pero hereda los del OPT-125M y el entrenamiento en C4; la poda puede amplificar comportamientos erraticos.
- Riesgo de alucinacion: muy alto, coherente con la perdida masiva de informacion en las capas lineales.
- Contexto e idioma: la longitud de contexto no se especifica en la ficha; el modelo base esta orientado al ingles y no hay evaluacion multilingue.
- Licencia no declarada en el repo: antes de cualquier uso comercial debe verificarse la licencia del modelo base facebook/opt-125m (OPT-175B License), que impone condiciones adicionales.
- Los pesos siguen teniendo 125,2 M de parametros: el ahorro de memoria solo se obtiene con kernels dispersos o con un formato comprimido, que no se proporciona.
- Sin pipeline declarado ni descargas: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/OPT-125M-semi-structured-SparseGPT-80pct
- Modelo base: https://huggingface.co/facebook/opt-125m
- Paper de SparseGPT: no disponible en la informacion proporcionada
- Repositorio fasterprune: no disponible en la informacion proporcionada
- Paper o repositorio de EHWS: no disponible en la informacion proporcionada
- Protocolo de evaluacion ELSA: no disponible en la informacion proporcionada
- lm-evaluation-harness: no disponible en la informacion proporcionada
