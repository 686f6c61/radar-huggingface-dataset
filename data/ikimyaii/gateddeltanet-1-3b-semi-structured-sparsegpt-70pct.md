# ikimyaii/GatedDeltaNet-1.3B-semi-structured-SparseGPT-70pct

## Resumen

GatedDeltaNet-1.3B-semi-structured-SparseGPT-70pct es una variante podada del modelo base m-a-p/1.3B-100B-GatedDeltaNet-pure, publicado por el usuario ikimyaii en Hugging Face. Se trata de un ejercicio de compresión one-shot (sin reentrenamiento) que aplica una modificación propia del algoritmo SparseGPT para imponer una restricción por fila dentro de bloques de 128 columnas, logrando una esparsidad semi-estructurada del 70,01 % en todas las capas lineales internas de los bloques. Las embeddings y la `lm_head` permanecen densas.

El modelo conserva la arquitectura GatedDeltaNet del original, un transformer híbrido con capas de atención lineal basadas en delta rule con compuertas, orientado a modelado de lenguaje con contexto largo. Con 1.466.343.808 parámetros totales (aproximadamente 1,3B) y un repositorio de 2,9 GB en safetensors, el objetivo declarado por el autor es servir como línea base para comparar con sus modelos EHWS (Equal Hamming Weight Sparsity), que aplican una restricción de número de no-cero por fila equivalente.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de poda aplicada a una arquitectura no estándar (GatedDeltaNet) que no está cubierta por los drivers oficiales de SparseGPT (que solo soportan OPT y LLaMA); por otro, cuantifica el coste en calidad de una poda agresiva al 70 % sin recuperación, con un aumento de perplejidad en WikiText-2 de 10,31 a 34,95 y una caída de precisión zero-shot media de 0,5123 a 0,4152. Es, por tanto, un artefacto de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet (transformer híbrido con atención lineal delta rule y compuertas) |
| Parametros totales | 1.466.343.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; repo en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Esparsidad | 70,01 % semi-estructurada en capas lineales de los bloques |
| Modelo base | m-a-p/1.3B-100B-GatedDeltaNet-pure |
| Tamano del repositorio | 2,9 GB |
| Metodo de poda | SparseGPT con restricción por fila (variante del autor) |
| Calibración | 128 secuencias C4 de 2.048 tokens, seed 0 |
| Coste de poda | 4,1 minutos en una A100 40GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura GatedDeltaNet del checkpoint base m-a-p/1.3B-100B-GatedDeltaNet-pure, que combina capas de atención lineal con mecanismo delta rule y compuertas (gating) para modelar dependencias de largo alcance con coste computacional lineal respecto a la longitud de secuencia. No se dispone de información detallada sobre el número de capas, dimensión oculta ni composición exacta del dataset de preentrenamiento del modelo original en la información proporcionada.

Sobre esa base, el autor aplica una poda one-shot sin reentrenamiento utilizando el código oficial de `fasterprune` (implementación de SparseGPT) con una modificación del patrón de máscara: dentro de cada bloque de 128 columnas, cada fila poda el mismo número de entradas de menor magnitud según la métrica `w^2 / [H^-1]_jj^2`, que es la regla N:M de SparseGPT con M igual al tamaño del bloque. El resultado es que todas las filas de todas las capas podadas tienen idéntico número de no-cero, lo que garantiza balance perfecto de trabajo por fila (verificado en las 240 capas podadas). La calibración se realiza con 128 secuencias de C4 de 2.048 tokens con seed 0, podando los bloques en orden y calibrando cada uno sobre las salidas de los bloques ya podados. Los pesos se podan en bfloat16. El recorrido de capas es código nuevo del autor, ya que los drivers oficiales solo contemplan OPT y LLaMA; la matemática de poda es la del código oficial.

## Capacidades

- Generación de texto autoregresiva en el idioma o idiomas del modelo base (no especificados).
- Modelado de lenguaje con atención lineal, potencialmente eficiente en secuencias largas, aunque la ventana de contexto concreta no está documentada.
- Razonamiento y conocimiento factual residual, severamente degradados respecto al modelo denso (ver benchmarks).
- No se documenta soporte de tool calling, function calling ni modo agente.
- No se documenta soporte multilingüe explícito.
- No se documenta visión, audio ni modo thinking.
- Capacidad de servir como línea base reproducible para experimentos de poda semi-estructurada sobre GatedDeltaNet.

## Casos de uso

- Investigación en compresión de modelos: el artefacto sirve para medir el impacto de la poda al 70 % con restricción por fila sobre una arquitectura de atención lineal, comparando contra los modelos EHWS del mismo autor y contra el denso original.
- Estudio de balanceo de carga en kernels dispersos: al garantizar el mismo número de no-cero por fila en las 240 capas podadas, el modelo es útil para validar implementaciones de kernels sparse que asumen regularidad por fila.
- Reproducción de experimentos de poda: el autor documenta calibración, seed, orden de bloques y tiempo de cómputo (4,1 min en A100 40GB), lo que facilita replicar el pipeline con `fasterprune`.
- Benchmark de degradación en tareas zero-shot: útil para trazar curvas de calidad frente a esparsidad en arquitecturas no LLaMA, usando lm-evaluation-harness con el mismo protocolo.
- Docencia y divulgación: ejemplo práctico de poda one-shot y de cómo una modificación del patrón N:M afecta a la perplejidad y a la precisión en tareas de sentido común.
- Evaluación de robustez de GatedDeltaNet frente a perturbaciones de pesos: permite analizar qué tareas (p. ej. boolq y rte) resisten mejor la poda agresiva que otras (arc_easy, hellaswag).
- No se recomienda su uso en producción para generación de texto, atención al cliente, generación de código ni aplicaciones sensibles a la calidad, dado el deterioro medido.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA (WikiText-2 y C4, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 10,31 | 13,76 |
| Este modelo (70 % sparse) | 34,95 | 37,71 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,3763 | 0,2193 |
| arc_easy | 0,7222 | 0,4756 |
| boolq | 0,6159 | 0,6220 |
| hellaswag | 0,4629 | 0,3220 |
| openbookqa | 0,2920 | 0,1780 |
| rte | 0,4982 | 0,5343 |
| winogrande | 0,6188 | 0,5549 |
| Media | 0,5123 | 0,4152 |

La esparsidad medida sobre los pesos publicados es 0,7001. Todas las filas de las 240 capas podadas tienen el mismo número de no-cero.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,9 GB solo para pesos, más overhead de activaciones y caché; en la práctica, entre 4 y 6 GB para secuencias moderadas.
- VRAM estimada en fp16: similar al bfloat16, en torno a 3 GB de pesos.
- GPU recomendadas: A100 40GB o H100 para experimentación a gran escala; el autor usó una A100 40GB para la poda (4,1 minutos).
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090, RTX 4080 y GPUs con 8 GB o más, siempre que se instale `flash-linear-attention`.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained(...)` con `flash-linear-attention` (`import fla`) instalado. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; dada la arquitectura GatedDeltaNet y la esparsidad no estructurada a nivel de bloque, es probable que estos runtimes no la soporten sin kernels específicos, pero no hay confirmación en la información disponible.
- Latencia y throughput: no disponibles. La esparsidad del 70 % con balance por fila no implica aceleración automática en hardware denso; se requiere un kernel sparse para aprovecharla.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Esparsidad | Calidad (media zero-shot) |
|---|---|---|---|---|---|
| Este modelo (GatedDeltaNet 1.3B, 70 % sparse) | 1,466B | no disponible | no disponible | 70,01 % semi-estructurada | 0,4152 |
| m-a-p/1.3B-100B-GatedDeltaNet-pure (denso) | ~1,3B | no disponible | no disponible | 0 % | 0,5123 |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación principal es contra el modelo denso del que deriva, ya que no se dispone de datos de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad en WikiText-2 se multiplica por más de 3 (10,31 a 34,95) y la media zero-shot cae 9,7 puntos absolutos (0,5123 a 0,4152).
- Caídas especialmente acusadas en arc_easy (0,7222 a 0,4756), hellaswag (0,4629 a 0,3220) y openbookqa (0,2920 a 0,1780); solo rte y boolq se mantienen o mejoran ligeramente.
- Riesgo elevado de alucinación y de generación incoherente por la poda agresiva sin reentrenamiento.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano.
- Longitud de contexto no documentada.
- Requiere `flash-linear-attention` para cargar el modelo; no es un transformer estándar y muchos runtimes de inferencia no lo soportarán.
- La esparsidad no se traduce en aceleración sin kernels sparse específicos; en hardware denso el modelo puede ser más lento que el denso equivalente por falta de optimizaciones.
- Es un artefacto de investigación (0 descargas, 0 likes en el momento de la ficha); no hay validación externa de los resultados.
- El patrón de poda no es el SparseGPT publicado: es una variante con restricción por fila, por lo que las comparaciones con literatura SparseGPT estándar deben hacerse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-semi-structured-SparseGPT-70pct
- Modelo base: https://huggingface.co/m-a-p/1.3B-100B-GatedDeltaNet-pure
- Repositorio `flash-linear-attention` (requerido para cargar el modelo): no disponible en la información proporcionada
- Implementación `fasterprune` (SparseGPT): no disponible en la información proporcionada
- Protocolo de evaluación ELSA: no disponible en la información proporcionada
- lm-evaluation-harness: no disponible en la información proporcionada
