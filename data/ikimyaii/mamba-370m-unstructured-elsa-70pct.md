# ikimyaii/Mamba-370M-unstructured-ELSA-70pct

## Resumen

Mamba-370M-unstructured-ELSA-70pct es una versión podada del modelo base state-spaces/mamba-370m-hf, un modelo de lenguaje de arquitectura Mamba (modelo de espacio de estados selectivo, SSM) desarrollado originalmente por el equipo de state-spaces. Esta variante ha sido generada por el usuario ikimyaii aplicando la metodología ELSA (paper arXiv:2510.01650) para inducir una dispersión no estructurada del 70% en las capas lineales de los bloques, manteniendo el resto de componentes densos.

El modelo resuelve un problema de investigación: proporcionar una línea base reproducible de poda no estructurada sobre Mamba, frente a la cual comparar las variantes EHWS del mismo autor. No es un modelo pensado para producción ni para uso general, sino un artefacto experimental para estudiar el efecto de la dispersión extrema en arquitecturas SSM. El repositorio incluye pesos en safetensors con 423.003.136 parámetros totales y un tamaño de 1,7 GB.

La relevancia actual radica en que la poda no estructurada en modelos SSM está menos explorada que en transformers, y este modelo documenta con precisión el coste en perplejidad y en precisión zero-shot de aplicar un umbral de magnitud por capa (ELSA) sin reentrenamiento posterior. La ficha se basa únicamente en la información pública del repositorio y de la model card; los datos no disponibles se indican explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (SSM selectivo), modelo base state-spaces/mamba-370m-hf |
| Parametros totales | 423.003.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos en bf16 en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dispersión aplicada | 70% objetivo, 0.6861 medida en las capas podadas |
| Modelo base | state-spaces/mamba-370m-hf |

## Arquitectura y entrenamiento

La arquitectura subyacente es Mamba, un modelo de espacio de estados selectivo que sustituye la atención por una recurrencia con parámetros dependientes de la entrada. El modelo base tiene 370M de parámetros nominales; el recuento real en safetensors es de 423.003.136. Sobre esta base, el autor aplica poda no estructurada con la implementación oficial de ELSA: un único umbral de magnitud por capa, de modo que las filas resultantes tienen distinto número de valores no nulos. Se podan las capas lineales internas de los bloques (`in_proj`, `x_proj`, `out_proj`); `dt_proj` se mantiene denso (aproximadamente el 2% de los pesos lineales de cada bloque), igual que `conv1d`, `A_log` y `D`. Embeddings y `lm_head` permanecen densos.

El procedimiento de poda usa los hiperparámetros del run HGRN-1.3B @80% de ELSA sin modificar: 4096 pasos ADMM, paso z cada 32 pasos, batch 1 con acumulación de 8, learning rate 2e-4, lambda 0.01, precisión bf16, 32.768 secuencias de C4 de 2.048 tokens tokenizadas con el tokenizador del propio modelo y semilla 0. El run completo tardó 2,86 horas en una A100 de 40 GB. No se documenta reentrenamiento ni ajuste fino posterior a la poda. La dispersión medida sobre los pesos finales es 0,6861, y las filas no están balanceadas: en las 192 capas podadas, la fila más densa tiene de media 1,55 veces los no nulos de la fila media, con un peor caso de 2,36 veces.

## Capacidades

- Generación de texto autoregresiva propia de un modelo de lenguaje causal de 423M de parámetros.
- Razonamiento básico y respuesta a preguntas de conocimiento general, limitado por el tamaño y por la degradación introducida por la poda.
- Evaluación zero-shot en tareas de elección múltiple y clasificación (arc_challenge, arc_easy, boolq, hellaswag, openbookqa, rte, winogrande).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documenta modo thinking, visión ni audio.
- Sirve como línea base reproducible para experimentos de poda y comparación con variantes EHWS.

## Casos de uso

- Investigación en compresión de modelos SSM: el modelo permite medir el impacto de la poda no estructurada al 70% sobre perplejidad y precisión zero-shot, comparando directamente con el modelo denso de referencia.
- Línea base para comparativas de métodos de poda: cualquier nuevo algoritmo (por ejemplo, las variantes EHWS del mismo autor) puede evaluarse contra este checkpoint con el mismo protocolo de ELSA.
- Estudio de desbalanceo de filas en dispersión no estructurada: los datos de dispersión por fila (1,55x media, 2,36x peor capa) permiten analizar cómo afecta la falta de balance a la calidad del modelo.
- Reproducción de experimentos académicos: el run está completamente especificado (ADMM, hiperparámetros, dataset, semilla) y cabe en una A100 de 40 GB en menos de 3 horas, lo que facilita la replicación.
- Evaluación de robustez de arquitecturas SSM bajo compresión: útil para estudiar si Mamba tolera mejor o peor la poda extrema que transformers de tamaño comparable.
- Docencia y experimentación con `transformers`: se carga con `AutoModelForCausalLM.from_pretrained(...)` sin dependencias adicionales, lo que simplifica su uso en entornos educativos.
- Análisis de la degradación por tarea: la tabla de zero-shot permite identificar qué tareas sufren más con la poda (por ejemplo, arc_easy cae de 0,5484 a 0,4129) y orientar futuros ajustes.

## Benchmarks y rendimiento

Perplejidad según el protocolo de evaluación de ELSA (WikiText-2 y C4), en bf16 por desbordamiento de Mamba en fp16, ejecución única:

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 14,33 | 19,40 |
| Este modelo (70% poda) | 43,41 | 38,73 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2517 | 0,2150 |
| arc_easy | 0,5484 | 0,4129 |
| boolq | 0,6150 | 0,6144 |
| hellaswag | 0,3722 | 0,3034 |
| openbookqa | 0,1960 | 0,1520 |
| rte | 0,5307 | 0,5271 |
| winogrande | 0,5588 | 0,5264 |
| Media | 0,4390 | 0,3930 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 1 GB para los pesos (423M parámetros × 2 bytes), más overhead de activaciones y caché; el repo ocupa 1,7 GB.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para bf16; una A100 40 GB fue suficiente para el proceso de poda completo (2,86 horas).
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más; también en GPUs integradas con suficiente memoria compartida para cuantizaciones de 8 bits.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(...)` es el método documentado; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (Mamba-370M, 70% poda ELSA) | 423.003.136 | no disponible | no disponible | Hugging Face | Perplejidad WikiText-2 43,41; media zero-shot 0,3930 |
| state-spaces/mamba-370m-hf (denso) | 370M nominales | no disponible | no disponible | Hugging Face | Perplejidad WikiText-2 14,33; media zero-shot 0,4390 |
| Variantes EHWS del mismo autor | no disponible | no disponible | no disponible | Hugging Face (misma cuenta) | Modelos de comparación citados en la model card, sin datos públicos en esta ficha |

No se dispone de datos de otros modelos comparables de la misma categoría (SSM de ~400M parámetros podados) en la información proporcionada.

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad en WikiText-2 pasa de 14,33 a 43,41 (aproximadamente 3x) y la media zero-shot cae de 0,4390 a 0,3930.
- Caída acusada en tareas concretas: arc_easy baja de 0,5484 a 0,4129 y hellaswag de 0,3722 a 0,3034.
- Dispersión no balanceada: las filas tienen distinto número de no nulos, con hasta 2,36x la media en la peor capa, lo que puede generar comportamiento irregular según la entrada.
- No es un modelo para producción: es una línea base experimental sin ajuste fino posterior a la poda.
- Riesgo de alucinación: no cuantificado en la información disponible, pero esperable en un modelo de 423M parámetros con poda extrema.
- Idiomas soportados: no disponibles; no se garantiza un rendimiento multilingüe.
- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse en el repositorio antes de cualquier despliegue.
- Contexto máximo no documentado: no se conoce la ventana efectiva del modelo base en esta ficha.
- Ejecución única: los resultados provienen de una sola semilla, sin intervalos de confianza.
- Precisión: Mamba desborda en fp16, por lo que la inferencia debe hacerse en bf16 o superior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ikimyaii/Mamba-370M-unstructured-ELSA-70pct
- Modelo base: https://huggingface.co/state-spaces/mamba-370m-hf
- Paper de ELSA: https://arxiv.org/abs/2510.01650
