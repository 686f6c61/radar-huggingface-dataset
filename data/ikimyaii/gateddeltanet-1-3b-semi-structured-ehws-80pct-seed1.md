# ikimyaii/GatedDeltaNet-1.3B-semi-structured-EHWS-80pct-seed1

## Resumen

GatedDeltaNet-1.3B-semi-structured-EHWS-80pct-seed1 es un modelo de lenguaje derivado de m-a-p/1.3B-100B-GatedDeltaNet-pure, publicado por el usuario ikimyaii en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una versión podada del modelo base con una tasa de dispersión (sparsity) semiestructurada del 80 %: cada fila de cada capa lineal podada conserva exactamente el mismo número de pesos (el 20 % superior), lo que garantiza un reparto de trabajo perfectamente equilibrado por fila. La poda se realizó mediante un procedimiento ADMM en dos fases denominado EHWS, con calibración sobre C4 y una semilla concreta (seed 1).

El modelo base pertenece a la familia GatedDeltaNet, una arquitectura de atención lineal con estado recurrente (linear attention) desarrollada por m-a-p, entrenada con 100B tokens. El modelo podado conserva la arquitectura y el tokenizador del original, pero reduce drásticamente el número de pesos no nulos en las capas lineales de los bloques, manteniendo densas las embeddings y la cabeza de lenguaje (lm_head). El resultado es un modelo de 1.466.343.808 parámetros totales en disco (5,9 GB en safetensors), pensado para escenarios donde el coste computacional y el ancho de banda de memoria son críticos.

La relevancia de esta ficha es doble: por un lado, documenta un experimento de poda agresiva sobre una arquitectura de atención lineal poco común; por otro, permite evaluar el coste real en calidad de una compresión del 80 % con equilibrio por fila. Los resultados publicados muestran un deterioro sustancial en perplejidad y en precisión zero-shot, por lo que el modelo debe considerarse una pieza de investigación más que un candidato directo a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet (atención lineal con estado recurrente y compuertas), transformer híbrido recurrente |
| Parametros totales | 1.466.343.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base se entrenó con secuencias de 2.048 tokens según el protocolo de calibración) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dispersión (sparsity) | 80 % semiestructurada, 0,7999 medida en las capas podadas (240 capas) |
| Modelo base | m-a-p/1.3B-100B-GatedDeltaNet-pure |
| Tokenizador | fla-hub_hgrn-1.3B-100B |
| Semilla de poda | 1 |
| Tamaño del repo | 5,9 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura GatedDeltaNet del modelo base m-a-p/1.3B-100B-GatedDeltaNet-pure, una variante de atención lineal con estado recurrente y mecanismo de compuertas (gated delta rule) que sustituye la atención cuadrática por una actualización recurrente de estado. El modelo base fue entrenado con 100B tokens según indica su nombre. Sobre esa base, el autor aplica una poda semiestructurada del 80 % en todas las capas lineales dentro de los bloques, dejando densas las embeddings y la cabeza de lenguaje.

El procedimiento de poda, denominado EHWS, consta de dos fases. La fase 1 es local, de estilo ALPS: poda cada capa hasta el 70 % minimizando el error de reconstrucción ||(W − W0) X||², con matrices de Hessian calculadas a partir de secuencias de calibración de C4. La fase 2 es global: aplica ADMM sobre la pérdida completa de entropía cruzada más destilación de conocimiento (KD), con un paso Z basado en Diag(H), 128 rondas de 32 pasos, learning rate 0,0006, lambda constante de 0,01, Adam con beta2 0,95 y semilla 1. Los datos de entrenamiento son las 32.768 secuencias de C4 de 2.048 tokens que usa el código oficial de ELSA, tokenizadas con el tokenizador del modelo base y vistas una sola vez. El run completo, incluida la evaluación, tardó 3,94 horas en una única A100 de 40 GB. No se documenta RLHF, DPO ni ajuste fino instructivo posterior.

## Capacidades

- Generación de texto autoregresiva en inglés (idioma inferido del corpus de calibración C4; no se documentan otros idiomas).
- Modelado de lenguaje base: el modelo es un checkpoint de tipo base, sin ajuste instructivo ni de chat documentado.
- Razonamiento y conocimiento factual limitados por la poda: la precisión zero-shot media cae de 0,5123 a 0,4099 respecto al modelo denso.
- Capacidad de atención lineal con estado recurrente, lo que en teoría permite procesar secuencias largas con coste lineal, aunque no se documenta la ventana de contexto efectiva del checkpoint.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre poda semiestructurada: el modelo sirve como referencia reproducible (semilla 1, configuración ADMM documentada, results.json incluido) para estudiar el equilibrio entre dispersión por fila y calidad en arquitecturas de atención lineal.
- Evaluación de arquitecturas GatedDeltaNet comprimidas: permite comparar el comportamiento de una atención lineal podada frente a transformers densos en tareas de modelado de lenguaje y zero-shot.
- Despliegue en entornos con memoria muy restringida: con 1,46 mil millones de parámetros y un 80 % de ceros en las capas lineales, el modelo reduce el ancho de banda efectivo de pesos si se explota la dispersión, lo que lo hace útil para prototipos en hardware limitado.
- Benchmarking de técnicas de compresión: útil como baseline para comparar otras técnicas (magnitud, SparseGPT, Wanda, ELSA) sobre el mismo modelo base y el mismo protocolo de evaluación (WikiText-2, C4, lm-evaluation-harness).
- Estudio de destilación de conocimiento en modelos pequeños: la fase 2 usa KD sobre el modelo denso, por lo que el checkpoint permite analizar cuánto conocimiento se retiene tras una poda del 80 %.
- Generación de texto de bajo coste en pipelines de investigación: para tareas de continuación de texto o perplejidad donde no se requiere alta precisión, el modelo ofrece una alternativa ligera al modelo denso de 1,3B.
- Reproducibilidad de experimentos: el repositorio incluye results.json con la configuración completa, lo que facilita replicar el run en una sola A100 40GB en menos de 4 horas.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA (WikiText-2 y C4, fp16, ejecución única):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 10,31 | 13,76 |
| Este modelo (80 % sparsity) | 21,96 | 22,22 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,3763 | 0,2184 |
| arc_easy | 0,7222 | 0,4979 |
| boolq | 0,6159 | 0,5826 |
| hellaswag | 0,4629 | 0,3375 |
| openbookqa | 0,2920 | 0,1780 |
| rte | 0,4982 | 0,5271 |
| winogrande | 0,6188 | 0,5280 |
| Media | 0,5123 | 0,4099 |

La dispersión medida en las capas podadas es 0,7999 y se verificó que las 240 capas podadas mantienen el mismo número de no ceros por fila.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3 GB solo para pesos (1,46B parámetros × 2 bytes), más overhead de activaciones y estado recurrente; en la práctica, entre 4 y 6 GB según longitud de secuencia y batch.
- GPU recomendadas: A100 40GB (usada en el run de poda), H100, L40S; también cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) con margen amplio.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) e incluso en tarjetas de 8 GB en fp16 con batch pequeño.
- Opciones de despliegue: el autor indica cargar con `flash-linear-attention` instalado (`import fla`) y `AutoModelForCausalLM.from_pretrained(...)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al ser una arquitectura GatedDeltaNet, la compatibilidad con esos runtimes no está garantizada.
- Latencia y throughput: no disponibles en la información proporcionada. El run de poda completo (entrenamiento más evaluación) tardó 3,94 horas en una A100 40GB, dato que no equivale a throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dispersión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GatedDeltaNet 1.3B, 80 % sparsity) | 1,466B | no disponible | 80 % semiestructurada | no disponible | Hugging Face, 0 descargas |
| m-a-p/1.3B-100B-GatedDeltaNet-pure (denso) | ~1,3B | no disponible | 0 % | no disponible | Hugging Face |
| Modelos densos de ~1,3B tipo Transformer (p. ej. variantes de la familia Llama/Qwen de tamaño similar) | ~1,3B | 2K-32K según modelo | 0 % | variable según modelo | Hugging Face |

La comparación directa solo es posible con el modelo base denso, para el que se dispone de métricas en la misma tabla de benchmarks. Frente a transformers densos de tamaño similar, la diferencia clave es la arquitectura de atención lineal y la dispersión del 80 %, pero no se dispone de datos de benchmarks cruzados en la información proporcionada. Cualquier comparación de rendimiento con otras familias requeriría ejecutar el mismo protocolo de evaluación.

## Limitaciones y advertencias

- Deterioro claro de calidad: la perplejidad en WikiText-2 se duplica (10,31 → 21,96) y la precisión zero-shot media cae más de 10 puntos (0,5123 → 0,4099). No es adecuado para tareas que requieran precisión alta.
- Modelo de tipo base: no hay ajuste instructivo ni de chat documentado, por lo que no debe usarse directamente como asistente conversacional sin un ajuste posterior.
- Sesgos conocidos: no documentados en la información proporcionada; al entrenarse sobre C4, hereda los sesgos del corpus web en inglés.
- Riesgo de alucinación: no cuantificado, pero previsiblemente elevado dado el nivel de compresión y la ausencia de ajuste por RLHF.
- Limitaciones de contexto e idioma: la ventana de contexto efectiva no está documentada; el único idioma respaldado por los datos de calibración es el inglés.
- Restricciones de licencia: la licencia no está disponible, lo que impide confirmar si se permite uso comercial. Debe contactarse con el autor o consultarse el modelo base antes de cualquier uso en producción.
- Dependencia de `flash-linear-attention`: la carga requiere esta librería, lo que limita la portabilidad a runtimes de inferencia estándar.
- Ejecución única: los resultados provienen de una sola semilla y un solo run, sin intervalos de confianza ni repeticiones, por lo que la variabilidad no está caracterizada.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación reciente, sin comunidad ni soporte documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-semi-structured-EHWS-80pct-seed1
- Modelo base: https://huggingface.co/m-a-p/1.3B-100B-GatedDeltaNet-pure
- Repositorio de flash-linear-attention (requerido para cargar el modelo): no disponible en la información proporcionada
- Paper o blog del método EHWS: no disponible en la información proporcionada
- Paper o repositorio de ELSA (protocolo de evaluación y datos de calibración): no disponible en la información proporcionada
- Archivo results.json con la configuración completa del run: incluido en el repositorio del modelo
