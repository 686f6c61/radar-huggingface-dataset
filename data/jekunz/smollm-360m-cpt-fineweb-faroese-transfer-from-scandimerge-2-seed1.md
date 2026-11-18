# jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-scandimerge-2-seed1

## Resumen

El modelo `jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-scandimerge-2-seed1` es un ajuste fino de tipo *continued pre-training* (CPT) sobre SmolLM2-360M-Instruct, orientado al idioma feroes (código ISO `fo`). Lo publica el usuario `jekunz` como parte de una línea de experimentos de adaptación lingüística de bajo recurso sobre modelos pequeños. Su punto de partida no es el modelo original directamente, sino un merge TIES de pesos iguales entre dos variantes ya adaptadas al danes y al islandes (`jekunz/smollm360m-da1-is1-ties`), sobre el que se aplica después entrenamiento adicional con la porción feroesa de FineWeb-2.

Se trata, por tanto, de un modelo de transferencia encadenada: primero se fusionan dos adaptaciones escandinavas, luego se transfiere ese conocimiento al feroes. La arquitectura subyacente es la de SmolLM2-360M-Instruct (transformer decoder-only con 361.821.120 parámetros reales según safetensors), con un contexto de entrenamiento de 2048 tokens y licencia Apache 2.0. El repositorio ocupa 0,7 GB y los pesos están en safetensors con soporte de transformers y TGI.

El interés del modelo es principalmente metodológico y de investigación: documenta un experimento reproducible (tres semillas, una de ellas esta) sobre cómo transferir capacidades entre idiomas germánicos nórdicos con recursos desiguales. No es un modelo con benchmarks publicados ni evaluado de forma amplia, y su autor lo declara explícitamente como material de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama/SmolLM2), según `architectures` no detalladas pero tag `llama` y base SmolLM2-360M-Instruct |
| Parametros totales | 361.821.120 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens en entrenamiento (contexto nativo de inferencia según arquitectura base; valor exacto nativo no disponible) |
| Tipos de cuantizacion | No disponible (solo pesos safetensors en el repo; sin GGUF publicado) |
| Idiomas soportados | Feroes (`fo`) como objetivo; el base es multilingüe pero no se detalla cobertura |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repo | 0,7 GB |
| Modelo base | `jekunz/smollm360m-da1-is1-ties` |
| Dataset de entrenamiento | `HuggingFaceFW/fineweb-2` (porciones da, is y fo) |
| Fecha de publicacion | 2026-11-18 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SmolLM2-360M-Instruct, un transformer decoder-only de 361,8 M de parámetros con tokenizador Llama y atención causal estándar. No hay innovaciones arquitectónicas propias en este ajuste: el cambio relevante está en la estrategia de entrenamiento. Se parte de un merge TIES con pesos iguales de dos modelos ya entrenados sobre las porciones danesa e islandesa de FineWeb-2, y sobre ese punto de partida se continúa el pre-entrenamiento en la porción feroesa del mismo corpus. Este esquema busca aprovechar el parecido tipológico entre lenguas germánicas nórdicas para mitigar la escasez de datos en feroes.

Los hiperparámetros concretos documentados son: una época por idioma fuente (danés e islandés) y cinco épocas para feroes, tasa de aprendizaje 5e-4 con scheduler coseno, ratio de warmup 0,05, batch size 8 con acumulación de gradientes de 32 pasos (batch efectivo 256), longitud máxima de contexto de 2048 tokens y semilla 1 de tres configuraciones paralelas. El entrenamiento se ejecutó en una única A100 de 40 GB. La model card no indica número total de tokens procesados, composición exacta del dataset ni si hubo etapas de RLHF o DPO; no hay información disponible al respecto.

## Capacidades

- Generación de texto conversacional en feroes, heredada de la naturaleza instruct del modelo base y reforzada con la porción feroesa de FineWeb-2.
- Razonamiento y respuesta a instrucciones básicas propias de SmolLM2-360M-Instruct, aunque no evaluadas específicamente para este ajuste.
- Capacidad multilingüe residual del base (danés e islandés vía el merge TIES), sin datos de calidad medidos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso explícito.
- No se documenta modo de pensamiento (thinking mode), visión, audio ni otras modalidades.
- No se documentan capacidades de código o matemáticas medidas para este modelo.

## Casos de uso

- Generación de texto en feroes para experimentación lingüística: permite explorar la calidad de un modelo pequeño entrenado específicamente sobre la porción feroesa de FineWeb-2, comparando con el base multilingüe en tareas de continuación de texto y redacción breve.
- Investigación sobre transferencia entre lenguas nórdicas: sirve para estudiar empíricamente cómo un merge TIES danés/islandés mejora o no la adaptación al feroes con cinco épocas y 361 M de parámetros; encaja en trabajos académicos sobre few-shot cross-lingual transfer.
- Prototipado local de bajo coste: con 0,7 GB de pesos en safetensors, se puede cargar en una sola GPU consumer (por ejemplo una RTX 3060 de 12 GB o incluso menos en fp16) para pruebas de generación antes de invertir en modelos mayores.
- Base para ajustes posteriores en feroes: al estar bajo Apache 2.0 y en formato transformers, puede servir como punto de partida para SFT o DPO sobre un corpus feroes más específico (por ejemplo, traducción o resumen).
- Evaluación de semillas y robustez de entrenamiento: al existir tres semillas con la misma configuración, se puede medir la varianza del rendimiento entre ellas y usar este modelo como referencia de una de las semillas.
- Generación de material de entrenamiento sintético en feroes a pequeña escala: el modelo puede producir borradores que luego se filtran manualmente, útil dado el limitado volumen de datos nativos disponibles.
- Docencia y demostraciones de CPT multilingüe: por su tamaño reducido y licencia permisiva, resulta apto para talleres donde se explique el flujo de merge de pesos y continued pre-training con un único GPU A100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el modelo "has not been evaluated more broadly yet", por lo que no deben asumirse cifras de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de feroes.

## Requisitos de hardware

- VRAM en fp16: aproximadamente 0,72 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica cabe holgadamente en cualquier GPU con 4 GB o más.
- VRAM en cuantización de 8 bits o 4 bits: no hay GGUF publicado, pero la conversión es posible dado el formato estándar; en 4 bits los pesos bajarían a ~0,2 GB, aunque ese dato es una estimación, no una cifra publicada.
- GPUs recomendadas: RTX 3060/4060, RTX 3090/4090, A100, H100. Cualquiera de ellas sirve; el entrenamiento se hizo en una A100 de 40 GB, pero la inferencia es viable en consumer.
- ¿Cabe en consumer GPU? Sí, en cualquier GPU moderna con 4-6 GB de VRAM o más.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`) y endpoints compatible. Para CPU, sería necesario convertir a GGUF y usar llama.cpp u Ollama, no incluido en el repo.
- Latencia y throughput: no disponibles en la información proporcionada. Por tamaño, se espera un throughput alto en GPU consumer, pero no hay cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-scandimerge-2-seed1 | 361,8 M | 2048 (entrenamiento) | Feroes | Apache 2.0 | Publicado, sin benchmarks |
| SmolLM2-360M-Instruct (base) | 361,8 M | 2048 | Multilingüe | Apache 2.0 | Benchmarks públicos, sin feroes específico |
| jekunz/smollm360m-da1-is1-ties | ~361,8 M | 2048 (heredado) | Danes, islandes | Apache 2.0 | Modelo intermedio del pipeline |
| Otros modelos específicos de feroes del mismo tamaño | No disponible | No disponible | Feroes | No disponible | No disponible |

La comparación con alternativas de feroes de tamaño similar no se ha podido completar: no se dispone de información sobre modelos comparables en la búsqueda proporcionada. Las alternativas más cercanas son el propio base SmolLM2 y el merge intermedio, pero ninguno tiene evaluación pública en feroes.

## Limitaciones y advertencias

- No hay benchmarks publicados ni evaluaciones amplias: el autor declara que es un modelo de investigación no evaluado, por lo que su calidad en feroes o en otros idiomas es desconocida.
- Riesgo de alucinación: como todo modelo generativo de 361 M parámetros, puede producir texto plausible pero incorrecto; sin evaluación, el riesgo no está cuantificado.
- Sesgos: no se documenta análisis de sesgos; al entrenarse sobre FineWeb-2, hereda los sesgos del corpus web filtrado.
- Limitaciones de contexto: entrenado con 2048 tokens, lo que restringe tareas de contexto largo; no se recomienda superar ese límite sin validación.
- Limitaciones de idioma: el objetivo es feroes, pero el base es multilingüe y el merge intermedio es danés/islandés; no hay datos sobre calidad en otros idiomas, incluido el inglés conversacional.
- Riesgo de contaminación o desalineación conversacional: es un ajuste de CPT, no un SFT específico, por lo que la capacidad instruct puede haberse degradado o mantenido sin control.
- Licencia Apache 2.0: permite uso comercial, pero el autor lo publica como material de investigación y sin garantías de calidad; en producción conviene evaluar en el dominio concreto antes de desplegar.
- Disponibilidad limitada: 0 descargas y 0 likes en Hugging Face, sin GGUF ni cuantizaciones publicadas; hay que convertir pesos para despliegues en CPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-scandimerge-2-seed1
- Modelo base (merge TIES danés/islandés): https://huggingface.co/jekunz/smollm360m-da1-is1-ties
- Dataset utilizado: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Modelo original SmolLM2 (referencia de arquitectura): https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Repositorio de SmolLM2 (Hugging Face): https://github.com/huggingface/smollm
- Paper de FineWeb-2: https://arxiv.org/abs/2506.20920
