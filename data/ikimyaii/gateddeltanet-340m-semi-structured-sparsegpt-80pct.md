# ikimyaii/GatedDeltaNet-340M-semi-structured-SparseGPT-80pct

## Resumen

GatedDeltaNet-340M-semi-structured-SparseGPT-80pct es una variante podada del modelo base m-a-p/340M-20B-GatedDeltaNet-pure-baseline, publicado por el usuario ikimyaii en Hugging Face. Se trata de un experimento de investigación centrado en la poda one-shot con SparseGPT modificado, sin reentrenamiento posterior, que aplica una restricción por fila para que todas las filas de cada bloque de 128 columnas conserven exactamente el mismo número de pesos no nulos. El resultado es un modelo con una tasa de esparsidad medida de 0,7999 (80 %), pensado como baseline para comparar con otros modelos del mismo autor.

La arquitectura subyacente es GatedDeltaNet, una variante de estado recurrente con compuertas (gated delta network) entrenada en su versión densa sobre 20B tokens. El checkpoint contiene 399.531.200 parámetros reales en safetensors, y el repositorio ocupa aproximadamente 0,8 GB. El modelo se distribuye como pesos densos en bfloat16 con los valores podados a cero, no como un formato disperso nativo, por lo que la aceleración práctica depende de que el runtime explote la estructura.

Su relevancia es fundamentalmente metodológica: demuestra que la poda estructurada por filas sobre arquitecturas no transformer clásicas (GatedDeltaNet) degrada severamente la perplejidad y las tareas zero-shot, con una caída media de 0,4373 a 0,3379 en el conjunto de lm-evaluation-harness. No es un modelo para producción, sino una referencia reproducible para estudiar el impacto de la esparsidad semi-estructurada en modelos de estado recurrente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet (gated delta network, modelo de estado recurrente con compuertas) |
| Parámetros totales | 399.531.200 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Esparsidad | 0,7999 medida (80 % semi-estructurada por fila en bloques de 128 columnas) |
| Modelo base | m-a-p/340M-20B-GatedDeltaNet-pure-baseline |
| Tamaño del repositorio | 0,8 GB |
| Precisión de pesos | bfloat16 |

## Arquitectura y entrenamiento

El modelo base es una GatedDeltaNet de 340M de parámetros entrenada por m-a-p sobre 20B tokens. GatedDeltaNet es una arquitectura de estado recurrente lineal con compuertas que combina mecanismos de decaimiento tipo delta con compuertas de actualización, lo que permite procesar secuencias con coste lineal en lugar del coste cuadrático de la atención estándar. El checkpoint aquí publicado no reentrena el modelo: parte de los pesos densos del baseline y aplica poda one-shot.

El proceso de poda utiliza la implementación oficial `fasterprune` de SparseGPT con una modificación en la máscara: dentro de cada bloque de 128 columnas, cada fila elimina el mismo número de entradas, seleccionando las de menor magnitud relativa según la regla `w^2 / [H^-1]_jj^2` (la regla N:M de SparseGPT con M igual al tamaño del bloque). La calibración emplea 128 secuencias de C4 de 2.048 tokens con semilla 0, y los bloques se podan en orden, recalibrando cada bloque sobre las salidas de los bloques ya podados. Se podan todas las capas lineales internas de los bloques; los embeddings y el lm_head permanecen densos. La poda se ejecutó en bfloat16 y tardó 2,5 minutos en una única A100 de 40 GB. No hubo destilación, RLHF ni ajuste fino posterior.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base denso.
- Razonamiento y respuesta a preguntas zero-shot, aunque con degradación significativa respecto al denso.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documenta modo thinking, visión ni audio.
- La esparsidad por fila uniforme (240 capas verificadas) permite un reparto de trabajo perfectamente balanceado si el runtime explota la estructura.

## Casos de uso

- Investigación sobre poda de modelos de estado recurrente: sirve como baseline controlado para comparar técnicas de esparsidad semi-estructurada (EHWS y variantes) sobre GatedDeltaNet, ya que el autor lo declara explícitamente como referencia para sus modelos EHWS.
- Estudio de degradación por esparsidad: permite medir la relación entre tasa de poda y caída de perplejidad (de 16,42 a 283,15 en WikiText-2) en arquitecturas no transformer, útil para calibrar expectativas antes de podar modelos mayores.
- Validación de kernels dispersos: al garantizar el mismo número de no nulos por fila en las 240 capas podadas, es un banco de pruebas adecuado para verificar kernels de sparse GEMM con reparto de carga uniforme.
- Reproducibilidad de experimentos: el proceso completo (calibración, orden de bloques, semilla, tiempo de cómputo) está documentado, lo que facilita replicar el pipeline en otros checkpoints GatedDeltaNet.
- Docencia y divulgación: ejemplo concreto y medible de por qué la poda one-shot sin reentrenamiento no es suficiente para mantener calidad en modelos pequeños.
- Pruebas de integración con `flash-linear-attention`: el modelo requiere `import fla` y `AutoModelForCausalLM.from_pretrained(...)`, por lo que sirve para validar esa ruta de carga en entornos de desarrollo.

## Benchmarks y rendimiento

Perplejidad según el protocolo de evaluación de ELSA (WikiText-2 y C4, fp16):

| Métrica | Denso | Este modelo |
|---|---|---|
| WikiText-2 | 16,42 | 283,15 |
| C4 | 19,94 | 233,06 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2645 | 0,2073 |
| arc_easy | 0,6023 | 0,3018 |
| boolq | 0,5985 | 0,4315 |
| hellaswag | 0,3461 | 0,2686 |
| openbookqa | 0,2300 | 0,1240 |
| rte | 0,5162 | 0,5343 |
| winogrande | 0,5036 | 0,4980 |
| Media | 0,4373 | 0,3379 |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 0,8 GB en bfloat16, por lo que cabe holgadamente en cualquier GPU con 2 GB o más; el cuello de botella es el runtime, no la memoria.
- GPU recomendadas: cualquier GPU moderna sirve para cargar el modelo; para reproducir la poda se usó una A100 de 40 GB (2,5 minutos).
- Cabe en GPU de consumo: sí, en cualquier RTX con al menos 2 GB de VRAM (RTX 3050, 3060, 4060, 4090, etc.).
- Opciones de despliegue: requiere `flash-linear-attention` instalado (`import fla`) y carga mediante `AutoModelForCausalLM.from_pretrained(...)`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La aceleración real depende de que el runtime aproveche la esparsidad por fila; los pesos se almacenan densos con ceros, por lo que sin kernels específicos el rendimiento será el de un modelo denso de 400M.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Esparsidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | 399,5M | no disponible | 80 % semi-estructurada | no disponible | Hugging Face |
| m-a-p/340M-20B-GatedDeltaNet-pure-baseline | ~340M | no disponible | densa | no disponible | Hugging Face |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face (referenciados) |

La comparación directa con alternativas de la misma categoría (modelos de estado recurrente de ~340-400M) no está disponible en la información proporcionada. El baseline denso es la referencia natural y muestra una perplejidad en WikiText-2 de 16,42 frente a 283,15 del modelo podado.

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad en WikiText-2 se multiplica por 17 (16,42 a 283,15) y la media zero-shot cae 0,0994 puntos absolutos. No es apto para uso en producción.
- No es el SparseGPT publicado: la máscara incorpora una restricción por fila propia del autor, por lo que los resultados no son directamente comparables con los del paper original de SparseGPT.
- Licencia no disponible: no se puede asumir uso comercial sin verificar la licencia del modelo base m-a-p/340M-20B-GatedDeltaNet-pure-baseline y la del checkpoint derivado.
- Idiomas no documentados: no hay información sobre cobertura lingüística, lo que impide garantizar calidad en castellano u otros idiomas.
- Riesgo de alucinación: no evaluado en la información disponible; con la degradación observada en tareas de razonamiento, es esperable un aumento significativo de salidas incorrectas.
- Dependencia de `flash-linear-attention`: sin esa librería instalada, la carga del modelo falla.
- Los pesos se almacenan densos con ceros: sin kernels que exploten la estructura por fila, no hay ganancia de velocidad ni de memoria en inferencia.
- Contexto máximo no documentado: no se puede planificar su uso en tareas de contexto largo.
- Modelo de investigación con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-340M-semi-structured-SparseGPT-80pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-GatedDeltaNet-pure-baseline
- Librería flash-linear-attention: no disponible en la información proporcionada
- Paper de SparseGPT: no disponible en la información proporcionada
- Paper de GatedDeltaNet: no disponible en la información proporcionada
- Repositorio `fasterprune`: no disponible en la información proporcionada
