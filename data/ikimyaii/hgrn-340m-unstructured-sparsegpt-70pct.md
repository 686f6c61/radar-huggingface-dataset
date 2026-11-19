# ikimyaii/HGRN-340M-unstructured-SparseGPT-70pct

## Resumen

HGRN-340M-unstructured-SparseGPT-70pct es un modelo de lenguaje de 341.148.672 parámetros derivado de m-a-p/340M-20B-HGRN-pure-baseline, un transformer basado en HGRN (Hierarchically Gated Recurrent Network) entrenado sobre 20.000 millones de tokens. El modelo ha sido podado de forma one-shot, sin reentrenamiento, aplicando el algoritmo oficial SparseGPT para alcanzar una esparsidad no estructurada del 70% en todas las capas lineales internas de los bloques. Lo publica el usuario ikimyaii como baseline de referencia para una familia de modelos EHWS del mismo autor.

La relevancia de esta ficha es metodológica: no es un modelo pensado para producción, sino un artefacto de investigación que documenta el coste real de aplicar SparseGPT sobre una arquitectura HGRN en lugar de un transformer clásico. El resultado es un deterioro severo de la perplejidad (de 21,96 a 125,75 en WikiText-2 y de 21,94 a 96,24 en C4) y una caída de 6,36 puntos en la media de zero-shot de lm-evaluation-harness, con un rendimiento que se mantiene cerca del denso solo en tareas de clasificación binaria como boolq, rte y winogrande.

El modelo conserva el tokenizador y la configuración del checkpoint base, requiere la librería `flash-linear-attention` para cargarse y se distribuye únicamente en safetensors (0,7 GB). No se han publicado datos de licencia, idiomas ni pipeline en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network), transformer recurrente con puertas jerárquicas |
| Parámetros totales | 341.148.672 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el protocolo de calibración usa secuencias de 2.048 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Esparsidad | 70% no estructurada en capas lineales internas de los bloques; embeddings y lm_head densos |
| Modelo base | m-a-p/340M-20B-HGRN-pure-baseline |
| Tamaño del repo | 0,7 GB |

## Arquitectura y entrenamiento

El checkpoint base es un HGRN de 340M de parámetros entrenado sobre 20.000 millones de tokens. La arquitectura HGRN sustituye la atención estándar por una recurrencia con compuertas jerárquicas, lo que la sitúa en la familia de modelos lineales recurrentes con coste de inferencia lineal en la longitud de secuencia. El modelo podado hereda íntegramente esta arquitectura; la poda no modifica la topología, solo la matriz de pesos.

La poda se aplica con el código oficial de SparseGPT (IST-DASLab/sparsegpt@147d215, variante `fasterprune`, blocksize 128, damping 0,01) en modo one-shot, sin reentrenamiento posterior. La calibración usa el cargador oficial con 128 secuencias de C4 de 2.048 tokens y semilla 0. Los bloques se podan en orden y cada bloque se calibra sobre las salidas de los bloques ya podados anteriores, siguiendo el esquema de los drivers oficiales; el recorrido de capas es código nuevo del autor, ya que los drivers oficiales solo soportan OPT y LLaMA. La poda se ejecutó en bfloat16 y tardó 1,6 minutos en una A100 de 40 GB. La máscara resultante aplica un umbral por bloque de 128 columnas, de modo que las filas acaban con distinto número de no ceros: en las 168 capas podadas, la fila más densa tiene de media 1,78 veces los no ceros de la fila media, y en la peor capa la ratio llega a 2,40.

## Capacidades

- Generación de texto autoregresiva básica, heredada del checkpoint base, con calidad degradada por la poda.
- Razonamiento de sentido común y respuesta a preguntas de opción múltiple, con caída acusada respecto al denso en arc_challenge, arc_easy, hellaswag y openbookqa.
- Clasificación binaria de pares de frases y textos (boolq, rte, winogrande), donde el rendimiento se mantiene prácticamente idéntico al denso.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Carga mediante `AutoModelForCausalLM.from_pretrained(...)` con `flash-linear-attention` instalado (`import fla`).

## Casos de uso

- Investigación sobre poda de modelos: sirve como baseline reproducible para comparar el impacto de SparseGPT al 70% sobre arquitecturas HGRN frente a transformers clásicos, usando el protocolo de evaluación de ELSA en WikiText-2 y C4.
- Estudio de la distribución de no ceros por fila: el desequilibrio documentado (hasta 2,40 veces la media en la peor capa) permite analizar cómo afecta la poda por bloques de columnas a la estructura de las matrices HGRN y diseñar máscaras balanceadas.
- Benchmark de métodos de poda alternativos: cualquier técnica nueva (SparseGPT con reentrenamiento, Wanda, poda estructurada) puede compararse contra este checkpoint con las mismas 128 secuencias de C4 y semilla 0.
- Evaluación de robustez en tareas de clasificación: boolq, rte y winogrande mantienen cifras cercanas al denso, por lo que el modelo es útil para estudiar qué tipos de tarea sobreviven a una poda agresiva sin reentrenamiento.
- Reproducción de pipelines de compresión: el tiempo de poda (1,6 minutos en A100 40 GB) y el script de recorrido de capas permiten replicar el flujo completo sobre otros checkpoints HGRN de la misma familia.
- Docencia y divulgación: ejemplo tangible del coste de la poda one-shot sin destilación, con métricas antes/después publicadas para perplejidad y ocho tareas zero-shot.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA (WikiText-2 y C4, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 21,96 | 21,94 |
| Este modelo (70% esparsidad) | 125,75 | 96,24 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2628 | 0,1809 |
| arc_easy | 0,6153 | 0,3817 |
| boolq | 0,6028 | 0,6058 |
| hellaswag | 0,3423 | 0,2780 |
| openbookqa | 0,2380 | 0,1440 |
| rte | 0,5126 | 0,5271 |
| winogrande | 0,5059 | 0,5170 |
| Media | 0,4400 | 0,3764 |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 0,7 GB en bfloat16, por lo que cabe holgadamente en cualquier GPU con 2 GB o más; con overhead de activaciones y caché, 4 GB son suficientes.
- GPU recomendadas: A100 40 GB (usada para la poda), H100, RTX 4090, RTX 3090; cualquier GPU consumer con al menos 4 GB de VRAM.
- Cabe en GPU consumer: sí, incluidas RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained` con `flash-linear-attention` instalado. Soporte en vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada; la dependencia de `fla` condiciona la integración.
- Latencia y throughput estimados: no disponibles. La arquitectura HGRN tiene coste lineal en la longitud de secuencia, lo que favorece secuencias largas frente a atención cuadrática, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WikiText-2 (ppl) | Media zero-shot | Licencia |
|---|---|---|---|---|---|
| Este modelo (HGRN 340M, 70% sparse) | 341M | no disponible | 125,75 | 0,3764 | no disponible |
| m-a-p/340M-20B-HGRN-pure-baseline (denso) | 340M | no disponible | 21,96 | 0,4400 | no disponible |
| Alternativas de poda SparseGPT en transformers | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es contra el checkpoint denso del que deriva. No se han publicado en la información disponible resultados de otros modelos podados de tamaño y arquitectura comparables.

## Limitaciones y advertencias

- Deterioro severo de la perplejidad: multiplica por 5,7 la del denso en WikiText-2 y por 4,4 en C4, lo que descarta su uso en generación de texto de calidad.
- Caída de 6,36 puntos en la media zero-shot (de 0,4400 a 0,3764), con pérdidas especialmente graves en arc_easy (−0,2336) y openbookqa (−0,0940).
- Máscara desequilibrada por filas: la poda por bloques de 128 columnas deja filas con hasta 2,40 veces los no ceros de la media, lo que puede producir un comportamiento irregular entre cabezas y capas.
- Sin reentrenamiento: no se ha aplicado destilación ni fine-tuning posterior a la poda, por lo que el modelo conserva los pesos podados tal cual.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Idiomas no disponibles: se desconoce la cobertura lingüística del checkpoint base.
- Riesgo de alucinación: elevado por la degradación de la perplejidad; no apto para producción sin validación adicional.
- Dependencia de `flash-linear-attention`: sin `import fla` la carga falla, lo que limita la portabilidad a stacks de inferencia que no integren esa librería.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-340M-unstructured-SparseGPT-70pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-HGRN-pure-baseline
- Código oficial de SparseGPT: https://github.com/IST-DASLab/sparsegpt (commit 147d215)
- Librería flash-linear-attention: no disponible enlace directo en la información proporcionada
