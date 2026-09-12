# MikhailRudenko/drafter-wmt16-translate-fien

## Resumen

El modelo `MikhailRudenko/drafter-wmt16-translate-fien` es un modelo borrador (drafter) de dominio especifico disenado para decodificacion especulativa en tareas de traduccion de finlandes a ingles. Lo desarrolla MikhailRudenko dentro del proyecto de investigacion Domain-Aware Speculative Decoding, cuya hipotesis es que un borrador especializado por dominio alcanza tasas de aceptacion mas altas que un unico borrador de proposito general. El modelo se entrena por destilacion de conocimiento a partir de las distribuciones top-10 del modelo objetivo, TurboSparse-Mistral-Instruct (7B, BambooForCausalLM).

Arquitectonicamente es un `MistralForCausalLM` de 156.519.168 parametros (aproximadamente 156M) en precision bfloat16, afinado sobre el modelo base `MikhailRudenko/drafter-mixed-ut`, que a su vez deriva de Lite-Mistral-150M-v2-Instruct. Su funcion no es generar respuestas de calidad de forma autonoma, sino proponer secuencias de tokens que el modelo objetivo verifique, reduciendo el coste por token generado cuando el dominio de uso coincide con el de entrenamiento.

La relevancia de esta ficha es doble: por un lado, documenta una receta reproducible de destilacion para borradores especulativos especializados (28.500 muestras sinteticas, 10 epochs, ~8900 pasos); por otro, cuantifica el coste de la especializacion extrema, ya que este borrador presenta el `eval_loss` mas alto (2.252) y la `top1_accuracy` mas baja (49,36%) de la familia de borradores publicada por el mismo autor. Es material de referencia para evaluar si la especializacion por dominio compensa en tasas de aceptacion frente a un borrador mixto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MistralForCausalLM (transformer causal decoder-only) |
| Parametros totales | 156.519.168 (segun safetensors; ~156M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; pesos publicados en bfloat16 (safetensors) |
| Idiomas soportados | en, fi (ingles y finlandes) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,3 GB) |
| Precision de entrenamiento | bfloat16 |
| Modelo base | MikhailRudenko/drafter-mixed-ut (a su vez basado en Felladrin/Lite-Mistral-150M-v2-Instruct) |
| Modelo objetivo | TurboSparse-Mistral-Instruct (7B, BambooForCausalLM) |
| Dominio | Traduccion WMT16 finlandes a ingles |
| Cluster de entrenamiento | `wmt16_translate_fien_10templates` |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-11 |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de la familia Mistral, con 156M de parametros y pesos en bfloat16. Se inicializa desde `MikhailRudenko/drafter-mixed-ut`, un borrador mixto entrenado sobre 42 clusters, y se afina despues sobre un unico cluster de dominio: `wmt16_translate_fien_10templates`, derivado del dataset Flan. El objetivo del entrenamiento es la destilacion de conocimiento desde TurboSparse-Mistral-Instruct: se usan las distribuciones top-10 de tokens del modelo objetivo como etiquetas suaves, combinadas con entropia cruzada estandar sobre la secuencia greedy (trunk). La funcion de perdida resultante es 0,5 x CrossEntropy + 0,5 x KL-divergence con temperatura T=1.0.

Los datos de entrenamiento consisten en 28.500 muestras sinteticas generadas a partir del modelo objetivo, con una particion de validacion de 1.500 muestras (5% held-out). La receta de entrenamiento reportada incluye 10 epochs con plateau alrededor del epoch 6, batch size 32, learning rate 5e-5 con schedule coseno y 3% de warmup, y ejecucion sobre una unica RTX 3090 de 24 GB. El mejor checkpoint es `checkpoint-8900`, con `eval_loss` final de 2.252 y `top1_accuracy` de 49,36%. No se documentan innovaciones arquitectonicas propias (no hay atencion lineal ni decodificacion especulativa implementada dentro del modelo): la innovacion es metodologica y reside en la especializacion por dominio del borrador y en el esquema de destilacion con KL sobre top-10.

## Capacidades

- Generacion de texto autoregresiva como borrador para decodificacion especulativa, no como modelo de chat autonomo.
- Prediccion de tokens alineada con la distribucion del modelo objetivo TurboSparse-Mistral-Instruct gracias a la destilacion con KL-divergence.
- Traduccion finlandes a ingles en el subdominio cubierto por el cluster `wmt16_translate_fien` (10 plantillas de prompt).
- Coherencia con el vocabulario y el tokenizador de la familia Mistral, condicion necesaria para que la verificacion especulativa sea valida.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (fuera del proposito del modelo).
- Capacidades multilingues: limitadas a en y fi segun los metadatos; no se documenta cobertura adicional.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Aceleracion de traduccion finlandes-ingles en produccion: el borrador se empareja con TurboSparse-Mistral-Instruct (7B) como modelo objetivo dentro de un motor de decodificacion especulativa, de modo que las propuestas del borrador se verifican en paralelo y se reduce el numero de pasos de decodificacion del modelo grande.
- Reduccion de latencia en APIs de traduccion: al ser un modelo de 156M en bfloat16, el coste de generar propuestas es marginal frente al coste de una pasada del modelo de 7B; el beneficio se materializa en el tiempo hasta el primer token y en el tiempo por token en cargas interactivas.
- Procesamiento por lotes de contenido editorial finlandes: traduccion de articulos de prensa, comunicados o documentacion tecnica escrita originalmente en finlandes, aprovechando que el entrenamiento se realizo sobre un cluster derivado de WMT16.
- Localizacion de productos y contenidos digitales: integracion del borrador en un pipeline de traduccion automatizada para versiones en ingles de sitios, fichas de producto o textos de interfaz generados en finlandes.
- Investigacion en decodificacion especulativa: sirve como punto de comparacion controlado para medir tasas de aceptacion (acceptance rate) de un borrador especializado frente al borrador mixto `drafter-mixed-ut` sobre el mismo dominio, con receta de entrenamiento completamente publicada.
- Reutilizacion de la receta para nuevos dominios: el esquema (destilacion top-10 + entropia cruzada sobre trunk, 28.500 muestras sinteticas, 10 epochs en una RTX 3090) es replicable para otros pares de idiomas o clusters, como demuestran los borradores hermanos DE-EN, RU-EN, CS-EN y TR-EN.
- Experimentos academicos de coste-calidad: permite estudiar el compromiso entre especializacion estricta (menor `top1_accuracy` global) y ganancia de aceptacion en el subdominio objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card solo reporta metricas de validacion internas (`eval_loss` y `top1_accuracy`) y una comparativa con los borradores hermanos del mismo autor.

| Modelo | Dominio | eval_loss | top1_accuracy |
|---|---|---|---|
| drafter-understanding | Understanding (31 clusters) | 2.100 | 65,00% |
| drafter-text-reformulation | Text Reformulation (11 clusters) | 2.151 | 54,34% |
| drafter-mixed-ut | Mixed U+T (42 clusters) | 2.085 | 59,50% |
| drafter-wmt16-translate-tren | Turco a ingles | 1.998 | 54,91% |
| drafter-wmt16-translate-deen | Aleman a ingles | 2.307 | 52,77% |
| drafter-wmt16-translate-ruen | Ruso a ingles | 2.363 | 50,04% |
| drafter-wmt16-translate-csen | Checo a ingles | 2.260 | 49,96% |
| **drafter-wmt16-translate-fien** | **Finlandes a ingles** | **2.252** | **49,36%** |

No se reportan tasas de aceptacion (acceptance rate) ni speedup medido en la informacion disponible, que son las metricas que determinarian el beneficio real del borrador.

## Requisitos de hardware

- VRAM estimada para los pesos del borrador: aproximadamente 313 MB en bfloat16/float16 (156,5M x 2 bytes), aproximadamente 157 MB en int8 y aproximadamente 78 MB en int4. Estos calculos son estimaciones aritmeticas a partir del numero de parametros; no estan publicados en la model card.
- VRAM total del sistema: el borrador convive con el modelo objetivo TurboSparse-Mistral-Instruct de 7B, que domina el consumo. En bfloat16, el objetivo requiere del orden de 14-15 GB solo en pesos; en cuantizacion de 4 bits, del orden de 4-5 GB. El borrador anade un coste despreciable en comparacion.
- Cabe en GPU de consumo: si, el borrador por si solo cabe en cualquier GPU consumer con mas de 1 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, etc.). El conjunto borrador + objetivo de 7B requiere una GPU de 16-24 GB para precision completa, o menos si el objetivo se cuantiza.
- GPU recomendadas: el autor entreno el modelo en 1x RTX 3090 (24 GB). Para servir el par borrador + objetivo, se recomienda A100 40/80 GB, H100 o RTX 4090 para despliegues de baja concurrencia.
- Opciones de despliegue: carga directa con `transformers` (`AutoModelForCausalLM` / `AutoTokenizer`), tal como documenta la model card. Para decodificacion especulativa en produccion se requiere un motor que soporte borrador + objetivo (por ejemplo, el modo de speculative decoding de vLLM). No se han publicado pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa a ese formato. Compatibilidad con TGI: no disponible.
- Latencia y throughput: no disponibles. No se reportan mediciones de tokens por segundo ni de speedup en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dominio | eval_loss | top1_accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| drafter-wmt16-translate-fien | 156M | FI a EN | 2.252 | 49,36% | Apache 2.0 | HuggingFace (0 descargas) |
| drafter-wmt16-translate-tren | no disponible | TR a EN | 1.998 | 54,91% | no disponible | HuggingFace |
| drafter-wmt16-translate-deen | no disponible | DE a EN | 2.307 | 52,77% | no disponible | HuggingFace |
| drafter-mixed-ut (modelo base) | no disponible | Mixto U+T (42 clusters) | 2.085 | 59,50% | no disponible | HuggingFace |
| drafter-understanding | no disponible | Understanding (31 clusters) | 2.100 | 65,00% | no disponible | HuggingFace |

La comparacion con borradores de otros proyectos (EAGLE, Medusa, borradores genericos para Mistral) no esta disponible en la informacion proporcionada, ya que no se han publicado sus `eval_loss` ni `top1_accuracy` bajo esta misma receta. Cualquier comparacion de speedup entre proyectos requeriria medir tasas de aceptacion sobre el mismo modelo objetivo y el mismo conjunto de prompts.

## Limitaciones y advertencias

- El modelo no es un generador de proposito general: esta destilado para imitar la distribucion del modelo objetivo en un cluster concreto. Usarlo de forma autonoma produce texto de calidad limitada.
- `top1_accuracy` de 49,36% es la mas baja de toda la familia de borradores publicada por el autor; en la practica esto implica una tasa de aceptacion de tokens menor y, por tanto, un speedup mas modesto que el de sus hermanos.
- `eval_loss` de 2.252, tambien por encima de la media de la familia (el mejor es 1.998 en el borrador TR-EN).
- Alcance de dominio muy estrecho: unicamente el cluster `wmt16_translate_fien_10templates`. Fuera de ese subdominio (10 plantillas de prompt, tematica de noticias WMT16) el rendimiento esperado cae de forma no cuantificada.
- Cobertura idiomatica limitada a finlandes e ingles. No se documenta soporte para otras lenguas ni para variantes dialectales.
- Dependencia del modelo objetivo: el borrador esta destilado desde TurboSparse-Mistral-Instruct y su utilidad esta ligada a ese objetivo concreto. Cambiar de modelo objetivo invalida las garantias de alineacion de distribuciones.
- Compatibilidad de tokenizador: para que la decodificacion especulativa sea correcta, el vocabulario del borrador debe ser compatible con el del modelo objetivo. La model card no documenta esta verificacion de forma explicita; conviene comprobarla antes de desplegar.
- Riesgo de alucinacion: si se emplea como traductor autonomo, no dispone de mecanismos de groundedness ni de verificacion factual; las traducciones pueden contener omisiones o invenciones, especialmente fuera del dominio de noticias.
- Sesgos: el entrenamiento se basa en WMT16, un corpus periodistico, por lo que hereda los sesgos tematicos, geograficos y de representacion de ese corpus, ademas de los sesgos del modelo objetivo usado para generar las etiquetas suaves.
- Restricciones de licencia: el modelo se publica bajo Apache 2.0, lo que permite uso comercial del borrador. Sin embargo, el modelo objetivo TurboSparse-Mistral-Instruct y los modelos base pueden tener licencias distintas, no verificadas aqui; hay que revisarlas antes de un despliegue comercial.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia externa de funcionamiento en produccion.
- Los metadatos indican una fecha de creacion de 2026-09-11, posterior a la de la mayoria de modelos de referencia; conviene verificar la vigencia de los enlaces y de las versiones asociadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MikhailRudenko/drafter-wmt16-translate-fien
- Modelo base: https://huggingface.co/MikhailRudenko/drafter-mixed-ut
- Modelo base original: https://huggingface.co/Felladrin/Lite-Mistral-150M-v2-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/MikhailRudenko/domain-aware-sd-synthetic
- Borrador del mismo autor, dominio understanding: https://huggingface.co/MikhailRudenko/drafter-understanding
- Borrador del mismo autor, dominio text reformulation: https://huggingface.co/MikhailRudenko/drafter-text-reformulation
- Borradores hermanos WMT16 (TR-EN, DE-EN, RU-EN, CS-EN): disponibles bajo el mismo prefijo `MikhailRudenko/drafter-wmt16-translate-*` en HuggingFace
- Busqueda web: no se han encontrado enlaces relevantes (papers, blogs o repos) sobre este modelo en los resultados disponibles.
