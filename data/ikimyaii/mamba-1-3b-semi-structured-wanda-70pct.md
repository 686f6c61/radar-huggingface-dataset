# ikimyaii/Mamba-1.3B-semi-structured-Wanda-70pct

## Resumen

Mamba-1.3B-semi-structured-Wanda-70pct es una variante podada del modelo base fla-hub/mamba-1.3B-100B, publicado por el usuario ikimyaii en Hugging Face. Se trata de un checkpoint experimental de investigacion cuyo objetivo no es ofrecer un modelo listo para produccion, sino servir como referencia (baseline) para comparar otras tecnicas de poda desarrolladas por el mismo autor (los denominados modelos EHWS). La poda se aplico en un unico paso, sin reentrenamiento posterior, alcanzando una esparsidad semi-estructurada del 70 %.

El modelo conserva la arquitectura Mamba original (state space model, SSM) del checkpoint base, con 1.334.740.992 parametros totales. La poda afecta a las capas lineales internas de cada bloque (`in_proj`, `x_proj`, `out_proj`), mientras que `dt_proj`, `conv1d`, `A_log`, `D`, los embeddings y el `lm_head` permanecen densos. La esparsidad real medida sobre los pesos es de 0,6859, y todas las filas de las 192 capas podadas tienen el mismo numero de valores no nulos, lo que garantiza un balanceo perfecto del trabajo por fila.

Su relevancia es acotada y fundamentalmente academica: documenta el coste real en calidad de una poda agresiva one-shot con Wanda sobre un SSM, sin recuperacion mediante fine-tuning. Los resultados muestran un deterioro severo de la perplejidad (de 10,03 a 49,58 en WikiText-2) y una caida media de 5,6 puntos en zero-shot accuracy, lo que lo convierte en un punto de comparacion util, no en una opcion desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (state space model, SSM) |
| Parametros totales | 1.334.740.992 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Esparsidad | 70 % semi-estructurada (0,6859 medida) |
| Modelo base | fla-hub/mamba-1.3B-100B |
| Tamano del repo | 2,7 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Mamba del checkpoint base fla-hub/mamba-1.3B-100B, un SSM selectivo con 1.300 millones de parametros entrenado sobre 100.000 millones de tokens segun indica el nombre del modelo base. No se ha realizado ningun entrenamiento adicional: la unica transformacion es una poda one-shot aplicada sobre los pesos del modelo denso.

El procedimiento de poda sigue el codigo oficial de Wanda (repositorio locuslab/wanda, commit 8e8fc87, rama unstructured, `use_variant=False`), donde cada fila elimina los pesos con menor puntuacion `|W| * sqrt(||X||)`. La calibracion empleo el cargador oficial con 128 secuencias de C4 de 2.048 tokens y semilla 0. Los bloques se podan en orden, calibrando cada uno sobre las salidas de los bloques ya podados. El recorrido de capas es codigo nuevo del autor (los drivers oficiales solo soportan OPT y LLaMA), mientras que la matematica de poda es la del codigo oficial. La poda se ejecuto en bfloat16 y tardo 2,8 minutos en una unica A100 de 40 GB.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Mamba-1.3B.
- Razonamiento basico y respuesta a preguntas de opcion multiple, aunque con calidad muy degradada respecto al denso.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso documentadas.
- No dispone de modo thinking, vision ni audio.
- Capacidades multilingues no documentadas; el modelo base se entreno presumiblemente sobre corpus mayoritariamente ingles (C4), pero no hay confirmacion en la informacion disponible.
- Requiere la libreria `flash-linear-attention` (`import fla`) para cargarse mediante `AutoModelForCausalLM.from_pretrained(...)`.

## Casos de uso

- Baseline de investigacion en poda: sirve como referencia cuantitativa para medir la mejora de tecnicas alternativas (los modelos EHWS del mismo autor) frente a una poda Wanda estandar sin reentrenamiento.
- Estudio del impacto de la esparsidad en SSM: permite analizar como afecta una poda del 70 % a la perplejidad y a tareas zero-shot en arquitecturas Mamba, comparando con el checkpoint denso.
- Experimentos de eficiencia en hardware: al tener todas las filas el mismo numero de no nulos en las 192 capas podadas, es adecuado para validar kernels de sparsity semi-estructurada con balanceo perfecto de trabajo por fila.
- Reproducibilidad de pipelines de poda: el autor documenta el commit exacto, la calibracion y el tiempo de ejecucion, lo que facilita replicar el experimento en otras GPUs.
- Analisis de degradacion por tarea: util para estudiar que tareas (BoolQ, RTE) resisten mejor la poda frente a otras (ARC-Easy, HellaSwag) en modelos SSM.
- Docencia y formacion: ejemplo practico de aplicacion de Wanda a una arquitectura no Transformer, con resultados publicados y procedimiento detallado.

## Benchmarks y rendimiento

Perplejidad evaluada con el protocolo de ELSA (conjuntos de test WikiText-2 y C4, formula propia), en bfloat16 porque Mamba desborda en fp16.

| Metrica | Denso | Este modelo |
|---|---|---|
| Perplejidad WikiText-2 | 10,03 | 49,58 |
| Perplejidad C4 | 14,12 | 74,41 |

Precision zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2329 | 0,1775 |
| arc_easy | 0,5644 | 0,3725 |
| boolq | 0,6040 | 0,6156 |
| hellaswag | 0,3898 | 0,2891 |
| openbookqa | 0,1980 | 0,1480 |
| rte | 0,5343 | 0,5307 |
| winogrande | 0,5217 | 0,5193 |
| Media | 0,4350 | 0,3790 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,7 GB para los pesos, mas overhead de activaciones y cache; en la practica, entre 4 y 6 GB segun longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; el autor uso una A100 40 GB para la poda (2,8 minutos), pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: carga mediante `transformers` con `flash-linear-attention` instalado. No hay confirmacion de soporte en vLLM, llama.cpp, Ollama ni TGI en la informacion disponible; al ser un SSM Mamba, el soporte en estos motores es limitado o inexistente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Mamba-1.3B, Wanda 70 %) | 1,33 B | no disponible | 49,58 | no disponible | Hugging Face |
| fla-hub/mamba-1.3B-100B (denso) | 1,33 B | no disponible | 10,03 | no disponible | Hugging Face |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face (referenciados en la model card) |

La comparacion principal es contra su propio modelo base denso, del que se degrada de forma sustancial en perplejidad y moderada en accuracy media. No se dispone de datos de otros modelos podados comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Deterioro severo de calidad: la perplejidad en WikiText-2 se multiplica por casi cinco (10,03 a 49,58) y la media zero-shot cae 5,6 puntos (0,4350 a 0,3790).
- No es apto para produccion: es un checkpoint de investigacion sin reentrenamiento de recuperacion; el autor lo presenta explicitamente como baseline.
- Riesgo elevado de alucinacion y respuestas incoherentes derivado de la poda agresiva sin fine-tuning.
- Licencia no disponible: no se puede confirmar si permite uso comercial; debe consultarse la licencia del modelo base fla-hub/mamba-1.3B-100B antes de cualquier uso.
- Idiomas no documentados: no hay confirmacion de soporte multilingue; el corpus de calibracion (C4) es mayoritariamente ingles.
- Longitud de contexto no disponible: no se especifica la ventana maxima soportada.
- Dependencia de `flash-linear-attention`: sin esa libreria el modelo no se carga correctamente.
- Precaucion con fp16: el modelo desborda en fp16, por lo que debe usarse bfloat16 o fp32.
- Sesgos: no documentados, pero heredados del modelo base y potencialmente amplificados por la perdida de capacidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-1.3B-semi-structured-Wanda-70pct
- Modelo base: https://huggingface.co/fla-hub/mamba-1.3B-100B
- Codigo oficial de Wanda: https://github.com/locuslab/wanda (commit 8e8fc87)
- Libreria flash-linear-attention: no disponible enlace directo en la informacion proporcionada
- Paper de Mamba: no disponible enlace en la informacion proporcionada
- Resultados de benchmarks: incluidos en la model card del propio repositorio
