# ikimyaii/Transformer-1.3B-semi-structured-Wanda-80pct

## Resumen

Transformer-1.3B-semi-structured-Wanda-80pct es un modelo de lenguaje derivado de fla-hub/transformer-1.3B-100B al que se le ha aplicado una poda (pruning) semi-estructurada del 80 % en una sola pasada, sin reentrenamiento posterior. La poda se ha realizado con el codigo oficial de Wanda (locuslab/wanda, commit 8e8fc87, rama unstructured, `use_variant=False`), que elimina en cada fila de pesos los elementos con menor puntuacion `|W| * sqrt(||X||)`. Lo publica el usuario ikimyaii como baseline de referencia para otros modelos de su misma cuenta (los denominados EHWS).

El modelo conserva la arquitectura original del base (transformer con atención de flash-linear-attention), con 1.364.297.728 parametros totales en el checkpoint y un repositorio de 2,7 GB en formato safetensors. Todas las capas lineales internas de los bloques estan podadas; los embeddings y la lm_head permanecen densos. La esparsidad medida sobre los pesos resultantes es de 0,7998 y cada fila de cada capa podada tiene exactamente el mismo numero de elementos no nulos (verificado en 168 capas), lo que garantiza un reparto de trabajo perfectamente equilibrado por fila.

Su relevancia es fundamentalmente metodologica: documenta el impacto real de una poda agresiva al 80 % sin recuperacion sobre un modelo de 1.3B, y lo hace con resultados de perplejidad y de evaluacion zero-shot que muestran una degradacion severa. No es un modelo pensado para uso en produccion, sino una referencia experimental reproducible para investigacion en compresion de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base fla-hub/transformer-1.3B-100B, con capas de atencion de flash-linear-attention) |
| Parametros totales | 1.364.297.728 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16/safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de fla-hub/transformer-1.3B-100B, un transformer de 1.3B parametros entrenado presumiblemente sobre 100B tokens (segun el nombre del checkpoint base), con capas de atencion implementadas en la libreria flash-linear-attention (fla). Sobre esa base no se ha realizado ningun entrenamiento adicional: la unica transformacion es una poda one-shot aplicada con el codigo oficial de Wanda.

El procedimiento de poda sigue el pipeline oficial: calibracion con 128 secuencias de C4 de 2.048 tokens y semilla 0; poda de bloques en orden, calibrando cada bloque sobre las salidas de los bloques ya podados anteriores; pesos podados en bfloat16. El recorrido de capas es codigo nuevo del autor (los drivers oficiales solo soportan OPT y LLaMA), mientras que la matematica de poda es la del codigo oficial. La poda completa tardo 1,0 minutos en una A100 de 40 GB. Se elimina el 80 % de los pesos de cada capa lineal interna, manteniendo embeddings y lm_head densos, y la esparsidad final medida es de 0,7998 con filas perfectamente balanceadas en las 168 capas podadas.

## Capacidades

- Generacion de texto autoregresiva basica, heredada del modelo base.
- Razonamiento y conocimiento factual muy degradados respecto al modelo denso (ver benchmarks).
- No hay evidencia de soporte de tool calling ni function calling en la informacion disponible.
- No hay evidencia de soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan modos especiales (thinking, vision, audio).
- La poda semi-estructurada por filas permite, en principio, aceleracion por hardware con kernels que exploten el patron de esparsidad balanceado, aunque no se aportan mediciones de speedup.

## Casos de uso

- Baseline de investigacion en compresion: sirve como referencia cuantitativa del dano de una poda al 80 % sin recuperacion, para comparar contra metodos con reentrenamiento o poda estructurada.
- Reproducibilidad de experimentos Wanda: permite validar implementaciones propias del algoritmo Wanda sobre arquitecturas distintas de OPT/LLaMA, ya que el autor documenta el commit exacto y la configuracion usada.
- Estudio de degradacion por capas: al estar todas las capas lineales podadas con el mismo criterio, es util para analizar como se propaga el error capa a capa en un transformer de 1.3B.
- Pruebas de kernels de esparsidad: el patron balanceado por fila (mismo numero de no nulos en cada fila de las 168 capas) lo hace apto para validar kernels de sparse GEMM que asuman equilibrio por fila.
- Referencia para pipelines de poda en produccion: util para equipos que evaluen si merece la pena podar sin recuperacion antes de invertir en fine-tuning posterior; los numeros de perplejidad sirven de aviso.
- Docencia y divulgacion: ejemplo reproducible y de bajo coste (1 minuto de poda en A100) para explicar el impacto de la esparsidad en modelos de lenguaje.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluacion de ELSA (WikiText-2 y C4, fp16):

| Metrica | Denso | Este modelo |
|---|---|---|
| Perplejidad WikiText-2 | 9,77 | 40.054,48 |
| Perplejidad C4 | 14,65 | 44.453,88 |

Precision zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2355 | 0,2150 |
| arc_easy | 0,5602 | 0,2559 |
| boolq | 0,6199 | 0,6162 |
| hellaswag | 0,3848 | 0,2576 |
| openbookqa | 0,2120 | 0,1540 |
| rte | 0,5126 | 0,5271 |
| winogrande | 0,5478 | 0,5107 |
| Media | 0,4390 | 0,3624 |

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, aproximadamente 2,7 GB de pesos mas overhead de activaciones y cache KV; en fp32, unos 5,5 GB. No se publican mediciones de VRAM reales.
- GPU recomendadas: una A100 40 GB basta para la poda (1,0 minuto) y para inferencia; cualquier GPU con 8 GB o mas deberia alojar los pesos en bf16.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y similares con 8 GB o mas, aunque no se aportan pruebas.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained(...)` con `flash-linear-attention` instalado (`import fla`) y `flash-attn` para la capa de atencion de fla. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Wanda 80 %) | 1,36B | no disponible | 40.054,48 | no disponible | Hugging Face |
| fla-hub/transformer-1.3B-100B (denso) | 1,3B | no disponible | 9,77 | no disponible | Hugging Face |
| Otros modelos de la cuenta ikimyaii (EHWS) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La unica comparacion con datos publicados es contra su modelo base denso, que obtiene perplejidades mucho menores (9,77 frente a 40.054,48 en WikiText-2) y mejor media zero-shot (0,4390 frente a 0,3624). No se dispone de datos de benchmarks de las alternativas EHWS del mismo autor en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad severamente degradada: la perplejidad en WikiText-2 pasa de 9,77 a 40.054,48 y en C4 de 14,65 a 44.453,88; el modelo no es apto para generacion de texto util en produccion.
- Caida notable en tareas de sentido comun y razonamiento (arc_easy 0,5602 a 0,2559; hellaswag 0,3848 a 0,2576), aunque algunas tareas como rte mejoran ligeramente (0,5126 a 0,5271).
- Riesgo alto de alucinacion y salidas incoherentes derivado de la poda sin reentrenamiento.
- Sesgos conocidos: no documentados; hereda los del modelo base, no especificados.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia no especificada: no se puede confirmar el uso comercial; hay que consultar la licencia del modelo base fla-hub/transformer-1.3B-100B antes de cualquier uso.
- Dependencias fragiles: requiere `flash-linear-attention` y `flash-attn`, lo que limita el despliegue en entornos sin esas librerias.
- Solo se han podado capas lineales internas; embeddings y lm_head densos, por lo que el ahorro de memoria es parcial respecto a un modelo totalmente disperso.
- El autor lo presenta explicitamente como baseline, no como modelo final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Transformer-1.3B-semi-structured-Wanda-80pct
- Modelo base: https://huggingface.co/fla-hub/transformer-1.3B-100B
- Codigo oficial de Wanda: https://github.com/locuslab/wanda (commit 8e8fc87)
- Libreria flash-linear-attention: no disponible enlace directo en la informacion proporcionada
- Paper de Wanda: no disponible enlace en la informacion proporcionada
- Protocolo de evaluacion ELSA: no disponible enlace en la informacion proporcionada
