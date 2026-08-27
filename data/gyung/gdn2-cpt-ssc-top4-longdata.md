# gyung/gdn2-cpt-ssc-top4-longdata

## Resumen

El modelo `gyung/gdn2-cpt-ssc-top4-longdata` es un checkpoint de continued-pretraining (CPT) sobre la arquitectura GDN-2 (Gated DeltaNet v2) de 370 millones de parámetros. Forma parte de una serie comparativa unificada de CPT publicada el 26 de agosto de 2026 por el autor `gyung`, cuyo objetivo es evaluar distintas estrategias de entrenamiento continuado sobre un mismo conjunto de datos y pasos. Este checkpoint concreto corresponde a la variante SSC (Selective State-space Compression) con top-4 fijo, entrenado sobre un subconjunto de datos largos (LongData).

El modelo se ha entrenado durante 400 pasos con un batch efectivo de 64 secuencias de 4096 tokens, lo que supone un total de 105 millones de tokens. Es un experimento de investigación centrado en comparar arquitecturas y métodos de compresión selectiva, no un modelo de producción. Su relevancia radica en que documenta el comportamiento de la variante SSC top-4 frente a otras alternativas (SSKetch+ReMoE, vanilla GDN-2) bajo condiciones idénticas de datos y cómputo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GDN-2 (Gated DeltaNet v2) 370M |
| Parametros totales | 370 millones |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | 4096 tokens (tamano de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`checkpoint-final.pth`) |

## Arquitectura y entrenamiento

GDN-2 (Gated DeltaNet v2) es una arquitectura de estado recurrente con mecanismos de compuerta y actualizaciones delta, disenada para ofrecer una alternativa eficiente a los transformers de atencion completa. En esta variante se aplica SSC (Selective State-space Compression) con un top-4 fijo, lo que implica que en cada paso se seleccionan las cuatro componentes de estado mas relevantes para la compresion, siguiendo la linea del paper de referencia del autor.

El entrenamiento es un continued-pretraining sobre 105M tokens, distribuidos en 400 pasos con batch efectivo de 64 y secuencias de 4096 tokens. El dataset utilizado es `gyung/gdn2-cpt-longdata-30k`, un conjunto de datos largos de 30.000 ejemplos. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion posterior. El checkpoint se guarda como `checkpoint-final.pth` junto con un historial de entrenamiento en JSONL.

## Capacidades

- Generacion de texto autoregresiva basada en el estado recurrente de GDN-2.
- Procesamiento de secuencias de hasta 4096 tokens durante el entrenamiento.
- Compresion selectiva de estado mediante SSC top-4, que reduce el coste de memoria frente a un estado completo.
- Capacidad de continuar el pretraining sobre dominios o datasets especificos (en este caso, datos largos).
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en arquitecturas recurrentes eficientes: el modelo sirve como punto de comparacion para estudiar el impacto de la compresion selectiva de estado en GDN-2 frente a variantes sin compresion o con otras estrategias (SSKetch+ReMoE).
- Evaluacion de continued-pretraining en datos largos: permite analizar como se comporta el modelo cuando se entrena sobre secuencias extensas y si mantiene la coherencia a lo largo de 4096 tokens.
- Desarrollo de tecnicas de compresion de estado: el checkpoint puede utilizarse para reproducir los experimentos del autor y validar implementaciones propias de SSC.
- Benchmark de eficiencia en memoria: al ser un modelo de 370M con compresion top-4, puede medirse el ahorro de VRAM frente a un GDN-2 vanilla del mismo tamano.
- Estudio de estabilidad de entrenamiento: el historial de entrenamiento (`training_history.jsonl`) permite analizar la curva de perdida y la convergencia de la variante SSC.
- Base para fine-tuning experimental: aunque no es un modelo de produccion, puede servir como punto de partida para tareas de generacion de texto con contexto largo en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de tareas downstream (MMLU, HumanEval, GSM8K, etc.) ni comparaciones cuantitativas con otros modelos. La unica informacion de rendimiento es el historial de entrenamiento, que no se ha analizado en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 370M de parametros y una ventana de 4096 tokens, un modelo denso de este tamano puede caber en GPUs consumer de 8-12 GB en precision FP16, pero no se han publicado mediciones concretas.
- GPU recomendadas: no disponible. Para entrenamiento, una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090 o A100) seria razonable, pero no se especifica.
- Compatibilidad con consumer GPU: probablemente si, dado el tamano reducido, pero sin confirmacion oficial.
- Opciones de despliegue: no disponible. El formato es un checkpoint PyTorch, por lo que habria que convertirlo a los formatos habituales (safetensors, GGUF) para usarlo con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El propio autor publica una serie comparativa (`gyung/gdn2-cpt-compare-2026-08-26`) que incluye otras variantes del mismo experimento:

| Modelo | Arquitectura | Parametros | Contexto | Notas |
|---|---|---|---|---|
| gdn2-cpt-ssc-top4-longdata (este) | GDN-2 + SSC top-4 | 370M | 4096 | CPT sobre LongData |
| gdn2-cpt-compare-2026-08-26 (serie) | GDN-2 (SSKetch+ReMoE, SSC, vanilla) | 370M | 4096 | Comparativa de brazos de CPT |

No hay datos de rendimiento publicados para ninguno de ellos, por lo que no es posible comparar con modelos externos como Llama, Mistral o DeepSeek.

## Limitaciones y advertencias

- Modelo experimental: es un checkpoint de investigacion, no un modelo listo para produccion. No ha pasado por alineacion ni evaluacion exhaustiva.
- Sin licencia especificada: no se indica la licencia de uso, por lo que cualquier uso comercial o derivado es juridicamente incierto.
- Sin informacion de sesgos: no se documentan sesgos potenciales, pero al ser un modelo entrenado sobre un dataset no descrito en detalle, pueden existir sesgos no conocidos.
- Riesgo de alucinacion: no evaluado. Al ser un modelo pequeno de 370M, es probable que presente alucinaciones frecuentes en tareas generativas.
- Contexto limitado a 4096 tokens: no soporta ventanas mas largas sin modificaciones adicionales.
- Idiomas no especificados: se desconoce que idiomas domina, aunque probablemente este sesgado hacia el ingles por la naturaleza de los datasets comunes.
- Formato propietario: el checkpoint en `.pth` requiere conversion para su uso con frameworks estandar de inferencia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/gyung/gdn2-cpt-ssc-top4-longdata
- Serie comparativa de CPT: https://huggingface.co/gyung/gdn2-cpt-compare-2026-08-26
- Dataset LongData: https://huggingface.co/datasets/gyung/gdn2-cpt-longdata-30k
