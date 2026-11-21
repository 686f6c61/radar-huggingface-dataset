# ikimyaii/HGRN-1.3B-semi-structured-EHWS-90pct-seed1

## Resumen

HGRN-1.3B-semi-structured-EHWS-90pct-seed1 es un checkpoint derivado del modelo base fla-hub/hgrn-1.3B-100B, publicado por el usuario ikimyaii en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una versión podada (pruned) del modelo original hasta alcanzar un 90% de dispersión semi-estructurada en todas las capas lineales internas de los bloques. La técnica empleada es EHWS, un procedimiento de podado en dos fases basado en ADMM, con un total de 1.364.396.032 parámetros almacenados en safetensors.

El modelo base pertenece a la familia HGRN (Hierarchically Gated Recurrent Network), una arquitectura recurrente con compuertas jerárquicas implementada en la librería flash-linear-attention (FLA). El checkpoint resultante mantiene los embeddings y la cabeza de lenguaje (lm_head) densos, mientras que las capas lineales de los bloques conservan exactamente el 10% de sus pesos, con el mismo número de no-ceros en cada fila, lo que garantiza un balanceo perfecto del trabajo por fila.

La relevancia de esta ficha es acotada y de carácter experimental: se trata de un artefacto de investigación sobre compresión de modelos, con una única semilla publicada, sin model card extensa, sin licencia declarada y sin métricas de rendimiento más allá de perplejidad y evaluación zero-shot. Es útil para estudiar el impacto del podado agresivo semi-estructurado en arquitecturas recurrentes lineales, pero no está pensado como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network), recurrente lineal con compuertas jerárquicas; implementada en flash-linear-attention |
| Parametros totales | 1.364.396.032 (safetensors); los pesos efectivos tras podado son menores en las capas lineales (90% de dispersión) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (las secuencias de calibración son de 2.048 tokens) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en safetensors, presumiblemente fp16/bf16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base fla-hub/hgrn-1.3B-100B es un transformer recurrente lineal de la familia HGRN, entrenado presumiblemente sobre 100B tokens (según el sufijo del nombre). La arquitectura HGRN sustituye la atención cuadrática por una recurrencia lineal con compuertas jerárquicas, lo que reduce el coste computacional en secuencias largas. El checkpoint aquí descrito no modifica esa arquitectura: solo altera la densidad de los pesos.

El proceso de podado se ejecuta en dos fases. La fase 1 es local, de estilo ALPS, y poda cada capa hasta el 70% minimizando el error de reconstrucción ||(W - W0) X||², con matrices de Hessian calculadas a partir de secuencias de calibración de C4. La fase 2 es global y aplica ADMM sobre la pérdida de entropía cruzada y destilación de conocimiento (KD) del modelo completo, con un paso Z basado en Diag(H), 128 rondas de 32 pasos, learning rate 0.0006, lambda constante de 0.01, beta2 de Adam 0.95 y semilla 1. Los datos de calibración son las 32.768 secuencias de C4 de 2.048 tokens que usa el código oficial de ELSA, tokenizadas con el tokenizador del propio modelo y vistas una sola vez. El entrenamiento completo, incluida la evaluación, consumió 3,69 horas en una única A100 de 40 GB.

La dispersión resultante es semi-estructurada: cada fila de cada capa lineal podada conserva el mismo número de pesos (el top 10%), verificado sobre 168 capas con una dispersión medida de 0,8999. Esto implica que el trabajo por fila está perfectamente balanceado, una propiedad relevante para kernels de sparsity estructurada en hardware.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base HGRN-1.3B.
- Razonamiento y conocimiento general limitados: la evaluación zero-shot muestra una caída media de 0,4376 a 0,3708 respecto al denso.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Propiedad destacable: estructura de sparsity semi-estructurada con balanceo perfecto por fila, útil como objeto de estudio para kernels y compiladores que explotan sparsity 2:4 o N:M.

## Casos de uso

- Investigación en compresión de modelos: sirve como punto de comparación reproducible (semilla 1) para estudiar el efecto del podado semi-estructurado al 90% sobre arquitecturas recurrentes lineales, midiendo la degradación de perplejidad y accuracy zero-shot frente al modelo denso.
- Desarrollo de kernels de sparsity estructurada: al mantener el mismo número de no-ceros por fila en 168 capas, el checkpoint es un banco de pruebas realista para validar kernels que asumen balanceo por fila (por ejemplo, variantes de 2:4 o N:M generalizado).
- Evaluación de pipelines de podado ADMM: el `results.json` incluido permite reproducir la configuración exacta (128 rondas × 32 pasos, lr 0.0006, lambda 0.01) y comparar con otras técnicas como SparseGPT o Wanda en el mismo modelo base.
- Estudio de destilación de conocimiento en modelos podados: la fase 2 usa KD sobre el modelo denso; el checkpoint sirve para analizar cuánto del rendimiento se recupera vía KD frente a podado puramente local.
- Docencia y experimentación académica: modelo pequeño (1,3B) que cabe en una GPU de 40 GB y se poda en menos de 4 horas, adecuado para prácticas de laboratorio sobre pruning y sparsity.
- Análisis de robustez y calibración: útil para medir cómo afecta un podado agresivo a tareas de comprensión (boolq sube ligeramente a 0,6183, mientras arc_easy cae a 0,3636), lo que permite estudiar sesgos inducidos por el proceso de podado.

## Benchmarks y rendimiento

Perplejidad según el protocolo de evaluación de ELSA (WikiText-2 / C4, fp16, ejecución única):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (fla-hub/hgrn-1.3B-100B) | 11,81 | 16,09 |
| Este modelo (90% sparsity) | 78,89 | 47,25 |

Accuracy zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2432 | 0,1920 |
| arc_easy | 0,5644 | 0,3636 |
| boolq | 0,5758 | 0,6183 |
| hellaswag | 0,3828 | 0,2693 |
| openbookqa | 0,2300 | 0,1260 |
| rte | 0,5379 | 0,5162 |
| winogrande | 0,5288 | 0,5099 |
| Media | 0,4376 | 0,3708 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 5,5 GB en safetensors; en fp16 el modelo completo requiere aproximadamente 2,7 GB de pesos más overhead de activaciones y caché. Al ser un modelo recurrente lineal, el coste de contexto es menor que en un transformer denso equivalente.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16; una A100 40 GB fue suficiente para el proceso completo de podado (3,69 horas).
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4070, RTX 4090 y superiores. En GPUs de 8 GB puede requerir cuantización o carga en bf16 con offloading parcial.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained(...)` con la librería `flash-linear-attention` instalada (`import fla`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la arquitectura HGRN no es estándar en esos runners.
- Latencia y throughput: no disponibles. La naturaleza recurrente lineal sugiere buen escalado con la longitud de contexto, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (HGRN-1.3B, 90% sparsity) | 1,36B (90% disperso en capas lineales) | no disponible | no disponible | Hugging Face, 0 descargas | Checkpoint experimental, semilla 1 |
| fla-hub/hgrn-1.3B-100B (denso) | ~1,3B | no disponible | no disponible | Hugging Face | Modelo base; perplejidad WikiText-2 11,81 |
| Modelos podados tipo SparseGPT/Wanda sobre transformers de ~1,3B | ~1,3B | depende del base | depende del base | variable | Técnicas comparables de podado; no hay datos cruzados en esta información |

No se dispone de datos de benchmarks de alternativas en la información proporcionada para establecer una comparación cuantitativa directa más allá del propio modelo denso.

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad en WikiText-2 pasa de 11,81 a 78,89 y en C4 de 16,09 a 47,25; la accuracy media zero-shot cae de 0,4376 a 0,3708. No es apto para producción sin validación específica.
- Ejecución única y una sola semilla: los resultados no incluyen intervalos de confianza ni variabilidad entre semillas, lo que limita la robustez de las conclusiones.
- Licencia no declarada: no se especifica licencia, por lo que el uso comercial es incierto y requiere contactar con el autor o consultar la licencia del modelo base.
- Idiomas no documentados: se desconoce la cobertura multilingüe real; el tokenizador es el del modelo base.
- Dependencia de `flash-linear-attention`: la carga requiere `import fla`; sin esa librería el modelo no se instancia correctamente en transformers estándar.
- Sin soporte documentado en runners habituales (vLLM, llama.cpp, Ollama, TGI): el despliegue en producción exigiría trabajo de integración adicional.
- Riesgo de alucinación: no evaluado en la información disponible; dado el nivel de compresión, es esperable un aumento respecto al denso.
- Sesgos: no documentados; se heredan los del modelo base y los del corpus C4 usado en calibración.
- Repo con 0 descargas y 0 likes: sin validación comunitaria ni informes de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-EHWS-90pct-seed1
- Modelo base: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Librería flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Código oficial de ELSA (referenciado en la model card): no disponible en la información proporcionada
- Paper de HGRN: no disponible en la información proporcionada
