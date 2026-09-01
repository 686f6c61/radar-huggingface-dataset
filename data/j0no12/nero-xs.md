# j0no12/Nero-XS

## Resumen

Nero XS es un modelo de lenguaje recurrente de tipo XSA (eXtreme Small Architecture) con 2.996.480 parámetros, desarrollado por j0no12 y entrenado desde cero con MLX en Apple Silicon. El modelo explora los límites del aprendizaje de lenguaje con menos de tres millones de parámetros, combinando una arquitectura recurrente híbrida con un mecanismo de atención modificado denominado XSA, que sustrae la proyección del vector de valor del token actual de la salida de atención de cada cabeza.

El modelo se entrenó en dos etapas con un presupuesto total de 9.999.998.976 tokens: una primera fase sobre un corpus local derivado de DCLM y una segunda de continuación de preentrenamiento (CPT) sobre el dataset HuggingFaceFW/finephrase, con configuraciones balanceadas de faq, math, table y tutorial. A pesar de su tamaño extremadamente reducido, el modelo supera significativamente las líneas base aleatorias en varios benchmarks de razonamiento de sentido común y aritmética, lo que lo convierte en un objeto de estudio relevante para la investigación en eficiencia de modelos y escalado extremo.

La relevancia de Nero XS reside en su condición de modelo de investigación de bolsillo: demuestra que arquitecturas recurrentes compactas con atención modificada pueden lograr un rendimiento no trivial en tareas de lenguaje con un coste computacional mínimo, abriendo preguntas sobre los límites inferiores del escalado de modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente híbrido con atención XSA (causal + sustracción de valor) |
| Parametros totales | 2.996.480 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors, MLX |

## Arquitectura y entrenamiento

Nero XS utiliza una arquitectura recurrente híbrida con 10 bloques físicos que equivalen a 14 bloques efectivos mediante un esquema de recurrencia: 1 bloque preludio, 4 bloques centrales que se aplican dos veces (2 pasadas), y 5 bloques coda. La anchura residual es de 128 dimensiones, con atención de 4 cabezas de 32 dimensiones cada una, y MLP denso con compuerta (gated) de anchura 540. El vocabulario es un BPE de nivel byte con 2.048 tokens, y las embeddings de entrada y salida están atadas (tied). La señal posicional usa coordenadas sinusoidales fijas con base 20.000, y la normalización es centrada aprendida (learned centered unit normalization).

La innovación clave es el mecanismo XSA: tras la atención causal, se sustrae de la salida de cada cabeza su proyección sobre el vector de valor del token actual. Esta modificación fuerza a cada cabeza a no replicar información ya presente en el token actual, fomentando representaciones más diferenciadas. Los cuatro bloques centrales se reutilizan dos veces, lo que proporciona catorce transformaciones efectivas sin almacenar un segundo conjunto de pesos recurrentes.

El entrenamiento se realizó en dos etapas. La primera, sobre un corpus local derivado de DCLM con 814.270.415 tokens únicos preparados, muestreados repetidamente hasta alcanzar un presupuesto exacto de 4.999.999.488 tokens, con secuencias de longitud 256, batch de 16, learning rate pico de 0,012 con warmup de 10M de tokens y decaimiento coseno a 0,0012. La segunda etapa, de continuación de preentrenamiento sobre HuggingFaceFW/finephrase (revisión 78cf4a5ed0099214979c094c963e699c19163838), usó 495.064.920 tokens únicos preparados balanceados entre las configuraciones faq, math, table y tutorial, con learning rate pico de 0,0012 sin warmup y decaimiento a 0,00012. En total, el modelo recibió una exposición de 9.999.998.976 tokens.

## Capacidades

- Generación de texto autónoma con muestreo configurable (temperatura, top-p, repetición).
- Razonamiento de sentido común básico: supera la línea base aleatoria en HellaSwag (27,38 %), ARC-Easy (30,98 %) y ARC-Challenge (20,73 %).
- Razonamiento físico cotidiano: 53,86 % en PIQA, notablemente por encima del azar.
- Aritmética simple: 32,10 % en ArithMark-3.
- Capacidad multilingüe: no disponible (entrenado solo en inglés).
- Tool calling, agentes, razonamiento multi-paso y modo pensamiento: no soportados.
- Capacidades de visión o audio: no soportadas.

## Casos de uso

- Investigación académica en eficiencia de modelos: permite estudiar el comportamiento de arquitecturas recurrentes compactas con menos de 3M de parámetros, facilitando experimentos de ablación y análisis de mecanismos de atención modificados.
- Enseñanza de arquitecturas de lenguaje: su implementación completa en un único archivo (`modeling_nero_xs_mlx.py`) lo convierte en un recurso didáctico ideal para explicar transformers recurrentes, atención causal y técnicas de escalado extremo.
- Prototipado de pipelines de generación de texto en entornos con recursos mínimos: al ejecutarse en Apple Silicon con MLX, permite validar flujos de generación en laptops sin GPU dedicada.
- Experimentos de continuación de preentrenamiento (CPT): su entrenamiento en dos etapas con FinePhrase lo hace útil para investigar el impacto de dominios específicos (faq, math, table, tutorial) en modelos pequeños.
- Comparación de líneas base en benchmarks de razonamiento: sirve como referencia de rendimiento para modelos de tamaño similar o para validar metodologías de evaluación con `lm-eval`.
- Exploración de límites de escalado: permite contrastar hipótesis sobre el rendimiento mínimo alcanzable en tareas de lenguaje con presupuestos de parámetros extremadamente reducidos.

## Benchmarks y rendimiento

Resultados declarados por el autor, obtenidos con `lm-eval` 0.4.12 (HellaSwag, ARC, PIQA) y protocolo oficial de ArithMark-3, todos en accuracy normalizada (acc_norm) con cero ejemplos de few-shot:

| Benchmark | Ejemplos | Nero XS |
|---|---:|---:|
| HellaSwag | 10.042 | 27,38 % |
| ARC-Easy | 2.376 | 30,98 % |
| ARC-Challenge | 1.172 | 20,73 % |
| PIQA | 1.838 | 53,86 % |
| ArithMark-3 | 1.000 | 32,10 % |
| **Media no ponderada** | — | **33,01 %** |

El autor advierte que las diferencias deben interpretarse con los tamaños muestrales indicados y no como competencia lingüística general.

## Requisitos de hardware

- Diseñado para Apple Silicon con MLX; no requiere GPU dedicada.
- Con 2.996.480 parámetros, el modelo ocupa aproximadamente 12 MB en FP32 y unos 6 MB en FP16, por lo que cabe holgadamente en cualquier Mac con Apple Silicon.
- VRAM estimada para inferencia: inferior a 1 GB.
- Despliegue: MLX (implementación incluida en el repositorio), con dependencias `mlx>=0.32`, `transformers>=5`, `huggingface_hub` y `numpy`.
- Latencia y throughput: no disponibles, pero previsiblemente muy bajos dada la escala del modelo.
- No es compatible con vLLM, llama.cpp, Ollama o TGI de forma directa, al requerir la implementación personalizada en MLX.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con modelos de la misma categoría. El autor mantiene otros modelos experimentales en su perfil (Nero1 0.5B, Nero-800M, NeroT-86M-Exp, NanoGPT 1m) que podrían servir de referencia, pero no se han publicado resultados comparativos en la información disponible. La comparativa con modelos comerciales o de código abierto establecidos (por ejemplo, TinyLlama, SmolLM) no es pertinente dado el orden de magnitud de diferencia en parámetros.

## Limitaciones y advertencias

- Modelo extremadamente pequeño: sus capacidades son muy limitadas y no debe usarse en producción para tareas reales de generación de texto.
- Sesgos y alucinaciones: no se han evaluado formalmente; dado su tamaño, es previsible que presente tasas altas de incoherencia y fabricación de información.
- Idioma: solo entrenado en inglés; no soporta otros idiomas.
- Contexto: la longitud de contexto no está documentada.
- Licencia: cc-by-4.0 permite uso comercial con atribución, pero el modelo no es apto para aplicaciones comerciales reales.
- Implementación propietaria: no es un checkpoint compatible con `AutoModelForCausalLM` de Transformers; requiere la implementación MLX incluida en el repositorio.
- Los resultados de benchmarks están declarados por el autor y no verificados de forma independiente.
- El entrenamiento usó muestreo repetido de un corpus limitado; la exposición total de 10B tokens no implica 10B tokens únicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/j0no12/Nero-XS
- Perfil del autor: https://huggingface.co/j0no12
- Modelo relacionado Nero-800M: https://huggingface.co/j0no12/Nero-800M
- Modelo relacionado NeroT-86M-Exp: https://huggingface.co/j0no12/NeroT-86M-Exp
- Dataset FinePhrase: https://huggingface.co/datasets/HuggingFaceFW/finephrase
