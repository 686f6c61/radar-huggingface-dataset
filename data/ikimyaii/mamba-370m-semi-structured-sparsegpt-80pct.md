# ikimyaii/Mamba-370M-semi-structured-SparseGPT-80pct

## Resumen

Mamba-370M-semi-structured-SparseGPT-80pct es una variante podada del modelo state-spaces/mamba-370m-hf, un modelo de lenguaje basado en arquitectura Mamba (state space model) publicado por el autor ikimyaii. El modelo aplica una poda one-shot (sin reentrenamiento) del 80% de dispersión semi-estructurada sobre las capas lineales internas de los bloques Mamba, empleando una variante propia del método SparseGPT con una restricción por fila dentro de bloques de 128 columnas. El resultado es un checkpoint de 423 millones de parámetros totales (aunque con un 78,4% de ceros medidos en las capas podadas) que se carga con `transformers` estándar.

El interés de este modelo es fundamentalmente metodológico: sirve como baseline para la familia de modelos EHWS del mismo autor y demuestra que es posible aplicar técnicas de poda tipo SparseGPT a arquitecturas SSM (no transformer) sin reentrenamiento. No obstante, el coste en calidad es severo: la perplejidad en WikiText-2 se dispara a 391,81 y en C4 a 347,80, y la precisión zero-shot media en lm-evaluation-harness cae a 0,3223, valores muy alejados de los de un modelo denso funcional.

Se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin licencia declarada ni idiomas especificados, y con una model card que documenta el método y los resultados con detalle técnico pero sin pretensión de uso en producción. Su relevancia es, por tanto, académica y experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (state space model, SSM selectivo) |
| Parametros totales | 423.003.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | state-spaces/mamba-370m-hf |
| Dispersion medida en capas podadas | 0,7840 |
| Tamano del repo | 0,8 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Mamba del checkpoint state-spaces/mamba-370m-hf: un state space model selectivo con parámetros dependientes de la entrada (dt, B, C), sin mecanismo de atención. Sobre esa base, el autor aplica una poda one-shot con SparseGPT modificado: dentro de cada bloque de 128 columnas, cada fila poda el mismo número de sus entradas de menor magnitud según la regla `w^2 / [H^-1]_jj^2` (la regla N:M de SparseGPT con M igual al tamaño del bloque). Se podan todas las capas lineales internas de los bloques (`in_proj`, `x_proj`, `out_proj`), mientras que `dt_proj` (aproximadamente el 2% de los pesos lineales de cada bloque), `conv1d`, `A_log`, `D`, los embeddings y `lm_head` se mantienen densos.

El proceso de calibración utilizó el cargador oficial con 128 secuencias de C4 de 2.048 tokens y semilla 0. Los bloques se podan en orden, calibrando cada uno sobre las salidas de los bloques ya podados anteriores, siguiendo la lógica de los drivers oficiales de SparseGPT. La poda se realizó en bfloat16 y requirió 3,0 minutos en una única A100 de 40 GB. No hubo reentrenamiento ni ajuste fino posterior; tampoco se documenta RLHF, DPO ni composición del dataset de preentrenamiento original.

## Capacidades

- Generación de texto autoregresiva mediante el checkpoint base Mamba-370M, severamente degradada por la poda.
- Razonamiento y respuesta a preguntas en formato zero-shot, con precisión media de 0,3223 en el conjunto de tareas evaluadas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- No se documenta modo thinking, visión ni audio.
- Carga estándar con `AutoModelForCausalLM.from_pretrained(...)` en `transformers`.

## Casos de uso

- Investigación sobre poda en arquitecturas SSM: el modelo sirve como referencia reproducible para comparar variantes de poda (por ejemplo, frente a los modelos EHWS del mismo autor) bajo un protocolo de calibración documentado.
- Estudio de la degradación por dispersión: permite analizar cómo afecta un 80% de dispersión semi-estructurada a la perplejidad y a tareas zero-shot en un modelo Mamba, con métricas publicadas en WikiText-2 y C4.
- Baseline en experimentos de compresión: útil para medir la eficacia de técnicas posteriores de recuperación (destilación, ajuste fino ligero) partiendo de un checkpoint ya podado.
- Validación de pipelines de poda: el código de recorrido de capas para Mamba (los drivers oficiales solo cubren OPT y LLaMA) puede reutilizarse para probar otras arquitecturas SSM.
- Docencia y divulgación: ejemplo concreto de aplicación de SparseGPT fuera del ámbito transformer, con resultados cuantificados y un coste de cómputo bajo (3 minutos en A100 40 GB).
- Reproducibilidad de experimentos: al estar el método, la semilla y el protocolo de evaluación detallados, permite replicar el resultado y verificar la dispersión medida (0,7840).

## Benchmarks y rendimiento

Perplejidad (protocolo de evaluación de ELSA, en bfloat16 porque Mamba desborda en fp16):

| Metrica | WikiText-2 | C4 |
|---|---|---|
| Este modelo | 391,81 | 347,80 |

Precisión zero-shot (lm-evaluation-harness):

| Tarea | Este modelo |
|---|---|
| arc_challenge | 0,2022 |
| arc_easy | 0,2803 |
| boolq | 0,3783 |
| hellaswag | 0,2655 |
| openbookqa | 0,1180 |
| rte | 0,5271 |
| winogrande | 0,4846 |
| Media | 0,3223 |

No se han publicado en la información disponible resultados del modelo base denso ni comparaciones directas con otras variantes de poda.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 0,85 GB solo para pesos (423 M de parámetros), más overhead de activaciones y caché; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna con soporte bfloat16 (RTX 30xx/40xx, A100, H100). La poda original se realizó en una A100 de 40 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (método documentado por el autor). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la arquitectura Mamba no es compatible con todos estos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dispersion | Perplejidad WikiText-2 | Licencia |
|---|---|---|---|---|---|
| Este modelo (Mamba-370M, 80% sparse) | 423 M | no disponible | 78,4% medida | 391,81 | no disponible |
| state-spaces/mamba-370m-hf (base denso) | ~370 M | no disponible | 0% | no disponible en esta ficha | no disponible |
| Variantes EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks del modelo base ni de las variantes EHWS en la información proporcionada, por lo que la comparación cuantitativa queda limitada a la dispersión y a la perplejidad de este checkpoint.

## Limitaciones y advertencias

- Degradación severa de calidad: perplejidad de 391,81 en WikiText-2 y precisión media zero-shot de 0,3223, valores que indican un modelo poco fiable para generación de texto real.
- La poda es one-shot, sin reentrenamiento, por lo que no hay recuperación de capacidad tras el pruning.
- Sesgos conocidos: no documentados, pero heredados del corpus de preentrenamiento del modelo base (no especificado).
- Riesgo de alucinación: elevado, coherente con la degradación medida en perplejidad y tareas zero-shot.
- Limitaciones de contexto e idioma: no disponibles; no se especifican ni la ventana de contexto ni los idiomas soportados.
- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor o consultar el modelo base.
- El modelo no es compatible con todos los motores de inferencia habituales (vLLM, llama.cpp) al usar arquitectura Mamba; verificar compatibilidad antes de integrarlo.
- En fp16 la arquitectura Mamba desborda; debe usarse bfloat16.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso comunitario ni validación externa.
- No apto para producción sin una evaluación propia y, previsiblemente, sin un proceso de recuperación posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-370M-semi-structured-SparseGPT-80pct
- Modelo base: https://huggingface.co/state-spaces/mamba-370m-hf
- Repositorio SparseGPT (referencia del método): no disponible en la información proporcionada
- Paper de Mamba: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
