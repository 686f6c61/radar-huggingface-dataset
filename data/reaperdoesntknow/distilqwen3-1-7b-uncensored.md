# reaperdoesntknow/DistilQwen3-1.7B-uncensored

## Resumen

DistilQwen3-1.7B-uncensored es un modelo de generacion de texto de 2.031.739.904 parametros (aproximadamente 2,03 mil millones) desarrollado por el usuario reaperdoesntknow bajo la coleccion "Convergent Intelligence LLC: Research Division". Se trata de un ajuste fino supervisado (SFT) mediante TRL sobre el modelo base reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B, que a su vez es un destilado de un modelo mayor de tipo Mixture-of-Experts con 30B parametros totales y 3B activos. El modelo se distribuye en formato safetensors para la libreria transformers y esta orientado a despliegue en entornos edge.

La propuesta del modelo es ofrecer una variante "uncensored" (sin los filtros de rechazo habituales del modelo original Qwen3) manteniendo el conocimiento adquirido por destilacion desde un profesor de mayor capacidad. El autor enmarca el entrenamiento en un marco matematico propio denominado "Discrepancy Calculus (DISC)", que describe la destilacion como una descomposicion de la distribucion del profesor en componentes suaves, de salto y de Cantor. Esta terminologia es idiosincratica del autor y no cuenta con validacion externa publicada.

El interes practico del modelo reside en su tamano reducido (4,1 GB de repositorio, 2,03B parametros), que permite ejecutarlo en hardware de consumo, combinado con la etiqueta de destilacion desde un MoE de 30B. Sin embargo, la model card esta practicamente vacia de datos tecnicos verificables: no se especifican datos de entrenamiento, hiperparametros, benchmarks ni licencia, lo que limita seriamente su evaluacion rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3; detalles no disponibles) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (el modelo base es un MoE de 30B-A3B, pero este checkpoint es denso de 1,7B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (formato safetensors; cuantizacion GGUF/AWQ no confirmada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3, un transformer decoder-only con atencion por grupos (GQA) y, en sus variantes recientes, soporte de modo de razonamiento explicito. El checkpoint de 2,03B parametros corresponde a la variante densa de 1,7B de la familia Qwen3, ajustada mediante SFT con la libreria TRL. El modelo base declarado, reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B, indica una cadena de destilacion de conocimiento desde un profesor MoE de 30B parametros totales y 3B activos hacia el modelo denso pequeno.

La model card no aporta informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni los hiperparametros concretos (precision, learning rate, numero de pasos). El autor menciona un marco teorico propio, "Discrepancy Calculus (DISC)", que afirma descomponer la distribucion del profesor mediante una "Mesh Fundamental Identity" en componentes absolutamente continuos, de salto y de Cantor, con un operador de discrepancia definido como un limite integral. No se proporcionan resultados empiricos que respalden este marco ni comparaciones con metodos de destilacion estandar (KL divergence, forward/reverse, on-policy distillation).

El sufijo "uncensored" sugiere un ajuste destinado a eliminar los comportamientos de rechazo del modelo original, presumiblemente mediante datos de SFT que incluyen respuestas que Qwen3 rechazaria por defecto. No se documenta el proceso de filtrado ni la procedencia de esos datos.

## Capacidades

- Generacion de texto conversacional en formato multi-turno, segun el tag `conversational`.
- Razonamiento y generacion de codigo heredados del modelo Qwen3 subyacente (no verificados en este checkpoint).
- Destilacion de conocimiento desde un profesor MoE de 30B, lo que teoricamente transfiere capacidades de un modelo mayor.
- Comportamiento "uncensored": menor probabilidad de rechazo ante peticiones que el modelo original declinaria (no cuantificado).
- Compatibilidad con text-generation-inference y endpoints (tags `text-generation-inference`, `endpoints_compatible`).
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking explicito: no confirmado.

## Casos de uso

- Prototipado rapido en local: con 2,03B parametros y 4,1 GB en safetensors, el modelo cabe en GPUs de consumo de 8 GB o menos en fp16, lo que permite iterar en estaciones de trabajo sin infraestructura cloud.
- Investigacion sobre destilacion: util como punto de comparacion para estudiar la transferencia de capacidades desde un profesor MoE de 30B a un alumno denso de 1,7B, especialmente si se contrasta con destilaciones estandar.
- Generacion de texto creativo sin filtros: el ajuste uncensored lo hace adecuado para escritura de ficcion con tematicas adultas o controvertidas, donde los modelos alineados suelen rechazar la peticion.
- Despliegue edge y embebido: su tamano reducido permite ejecucion en dispositivos con recursos limitados (mini-PC, Jetson, portatiles) mediante llama.cpp u Ollama si se generan cuantizaciones GGUF.
- Experimentacion con marcos teoricos alternativos: para investigadores interesados en evaluar criticamente el marco Discrepancy Calculus propuesto por el autor frente a metodos de destilacion convencionales.
- Base para fine-tuning especifico de dominio: al ser un modelo pequeno y permisivo, sirve como punto de partida para ajustes en nichos donde el rechazo del modelo base resulta problematico.
- Generacion de datos sinteticos: puede emplearse para producir datasets de entrenamiento en dominios donde se requiere ausencia de filtros de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y no se proporcionan comparaciones con el modelo base ni con el profesor.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 4,1 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion tipica de 5-6 GB para contextos moderados).
- VRAM estimada en int8: aproximadamente 2,1 GB para pesos.
- VRAM estimada en int4 (GGUF Q4_K_M): aproximadamente 1,2-1,5 GB para pesos.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070) para fp16; A100/H100 no necesarias salvo para batched serving de alto throughput.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 6-8 GB o mas.
- Opciones de despliegue: transformers (nativo), text-generation-inference (tag confirmado), vLLM (compatible con arquitectura Qwen3, no verificado para este checkpoint), llama.cpp/Ollama (requiere conversion a GGUF, no disponible en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DistilQwen3-1.7B-uncensored | 2,03B | no disponible | no disponible | Objeto de esta ficha; SFT uncensored sobre destilado |
| Qwen3-1.7B (original) | 1,7B | 32.768 tokens (ampliable) | Apache 2.0 | Modelo base de la familia; alineado y con benchmarks publicos |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | Alternativa densa pequena de la generacion anterior, ampliamente evaluada |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Alternativa de Meta con contexto largo y ecosistema maduro |

La comparacion con Qwen3-1.7B original es la mas directa: comparten arquitectura y tamano, pero el modelo aqui descrito carece de benchmarks publicos y de licencia declarada, lo que impide afirmar que iguale o supere al original en tareas estandar. La ventaja diferencial es el comportamiento uncensored y la cadena de destilacion desde un profesor mayor; la desventaja es la ausencia total de documentacion tecnica y de garantias legales de uso.

## Limitaciones y advertencias

- Model card practicamente vacia: sin datos de entrenamiento, hiperparametros, evaluacion ni procedencia de datos, lo que impide auditar el modelo.
- Licencia no declarada: no hay base legal clara para uso comercial; debe asumirse riesgo hasta que el autor la especifique.
- El ajuste "uncensored" implica la eliminacion de filtros de seguridad, con el consiguiente riesgo de generar contenido danino, ilegal o sexualmente explicito sin restricciones.
- Riesgo elevado de alucinacion: los modelos pequenos (2B) tienden a fabricar hechos, y la destilacion no garantiza fidelidad factual.
- Idiomas soportados no documentados: se desconoce si conserva el multilingue de Qwen3 o si el SFT lo ha degradado hacia el ingles.
- Contexto no especificado: no se puede planificar su uso en tareas de contexto largo sin verificar experimentalmente la ventana efectiva.
- Marco teorico DISC sin validacion externa: las afirmaciones matematicas del autor no estan respaldadas por publicaciones revisadas por pares.
- Sin datos de sesgos: no se ha realizado ninguna evaluacion de sesgo demografico, toxico o cultural.
- Procedencia dudosa de los datos de SFT: al tratarse de un ajuste uncensored, es probable que el dataset incluya contenido no filtrado cuya calidad y legalidad se desconocen.
- Fecha de creacion futura (2026-03-25) en los metadatos: inconsistencia que sugiere posible manipulacion de metadatos o error del Hub.
- 0 likes y ~1.900 descargas: adopcion muy baja, sin comunidad que reporte fallos ni validaciones independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/DistilQwen3-1.7B-uncensored
- Modelo base: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B
- Perfil del autor (serie DistilQwen3): https://huggingface.co/reaperdoesntknow
- Paper de referencia sobre impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora ML Impact: https://mlco2.github.io/impact#compute
- Documentacion de TRL (libreria de entrenamiento): https://huggingface.co/docs/trl
- Documentacion de Qwen3 (familia base): https://qwen.readthedocs.io/
