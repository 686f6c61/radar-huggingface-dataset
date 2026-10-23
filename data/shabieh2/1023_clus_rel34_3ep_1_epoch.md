# shabieh2/1023_clus_rel34_3ep_1_epoch

## Resumen

`shabieh2/1023_clus_rel34_3ep_1_epoch` es un adaptador LoRA (librería PEFT, pesos en safetensors) publicado por el usuario shabieh2 sobre el modelo base `unsloth/Muse-Glimmer-30B`. No se trata de un modelo completo, sino de un conjunto de pesos delta de aproximadamente 0,9 GB que debe cargarse junto al modelo base para poder realizar inferencia. Su pipeline declarado es `text-generation` y entre sus etiquetas figura `conversational`, además de `unsloth`, lo que indica que el entrenamiento se realizó con la pila de Unsloth.

La relevance del artefacto es limitada y de carácter experimental: el repositorio no incluye model card sustantiva (el README es la plantilla por defecto de Hugging Face con marcadores `[More Information Needed]`), no declara licencia ni idiomas, no publica resultados de evaluación y acumula 0 descargas y 0 likes en el momento de la consulta. El nombre del repositorio sugiere una ejecución de ajuste por clústeres (`clus`), con un identificador de versión relativo (`rel34`) y un régimen de entrenamiento de 3 épocas más 1 época adicional, aunque esta lectura es inferencial y no está confirmada por el autor.

Por tanto, la ficha debe interpretarse como documentación de un adaptador de investigación, no de un modelo listo para producción. Cualquier dato de arquitectura, contexto o rendimiento depende del modelo base `unsloth/Muse-Glimmer-30B`, cuya documentación no se ha proporcionado en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer del modelo base `unsloth/Muse-Glimmer-30B`; arquitectura del base no disponible |
| Parámetros totales | No disponible para el adaptador; el modelo base se denomina "30B" (30 000 millones, según nomenclatura) |
| Parámetros activos | No aplica (no consta que el modelo base sea MoE); no disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible para el adaptador; al ser un LoRA en safetensors puede fusionarse con el base y cuantizarse a GGUF, AWQ o GPTQ con herramientas externas (derivado, no confirmado por el autor) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (campo vacío en Hugging Face y en la model card) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); no incluye los pesos completos del modelo base |
| Tamaño del repositorio | 0,9 GB |
| Librería y versión | PEFT 0.20.0 (framework declarado: Unsloth) |
| Modelo base | `unsloth/Muse-Glimmer-30B` |
| Pipeline | text-generation |
| Etiquetas | peft, lora, safetensors, transformers, unsloth, conversational, region:us |
| Fecha de creación | 2026-10-23 (según metadatos de Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) en formato PEFT, no un modelo entrenado desde cero. Los pesos publicados ocupan 0,9 GB; asumiendo precisión bf16/fp16 (2 bytes por parámetro), esto equivaldría a del orden de 450 millones de parámetros de adaptador, una cifra inusualmente alta para un LoRA convencional y que podría explicarse por un rango elevado, por la inclusión de estados adicionales en el checkpoint o por el guardado de módulos distintos a los lineales habituales. Es una estimación derivada del tamaño del repositorio, no un dato declarado.

No hay información sobre el conjunto de datos de entrenamiento, la composición del corpus, el número de tokens, el rango del adaptador, el alpha, la tasa de aprendizaje ni si se aplicaron técnicas de alineación como RLHF o DPO. La etiqueta `arxiv:1910.09700` que aparece en los metadatos corresponde a Lacoste et al. (2019), el artículo de la calculadora de impacto medioambiental citado en la plantilla de model card de Hugging Face, y no a un paper del modelo. La única referencia técnica explícita es la pila de Unsloth, habitual para ajuste eficiente en memoria mediante kernels optimizados y gradient checkpointing.

## Capacidades

- Generación de texto autoregresiva en modality texto, heredada del modelo base; sin confirmación de calidad tras el ajuste.
- Conversación multi-turno: la etiqueta `conversational` sugiere un ajuste orientado a diálogo, aunque no se especifica la plantilla de chat utilizada.
- Razonamiento, código y matemáticas: no disponible; no hay evaluación publicada que lo confirme ni lo descarte.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (campo de idiomas vacío).
- Capacidades multimodales (visión, audio): no disponibles; el pipeline declarado es únicamente `text-generation`.
- Modo "thinking" o decodificación extendida: no disponible.

## Casos de uso

- Investigación sobre adaptación por clústeres de datos: el identificador `1023_clus_rel34` apunta a una partición del corpus por clústeres; el adaptador serviría para reproducir y auditar ese experimento frente a ejecuciones previas del mismo autor, como `1017_cluster_lora_fullset_rel34_ep3cont_1_epoch`.
- Ajuste continuado con Unsloth: el adaptador puede cargarse como punto de partida para nuevas épocas de entrenamiento en una GPU de consumo, dado que el tamaño del delta (0,9 GB) permite mantener en memoria solo el adaptador y los estados del optimizador sobre el base cuantizado.
- Evaluación comparativa A/B de adaptadores: al compartir modelo base, permite aislar el efecto del corpus de ajuste midiendo perplejidad y tasas de éxito en tareas concretas sobre el mismo backend de inferencia.
- Despliegue interno con vLLM o TGI: ambos servidores soportan carga dinámica de adaptadores LoRA sobre un base compartido, lo que permite servir varias variantes experimentales con una sola copia del modelo de 30B en VRAM.
- Fusión y exportación a GGUF para pruebas locales: mediante `merge_and_unload()` de PEFT y `convert_hf_to_gguf.py`, el adaptador puede integrarse en el base y cuantizarse a Q4_K_M para experimentar en una estación de trabajo sin GPU de datacenter.
- Reproducibilidad y trazabilidad de experimentos: útil en un pipeline de registro de modelos para documentar linaje entre ejecuciones del mismo autor y comparar regímenes de épocas (3 épocas frente a 3+1).
- Docencia y formación interna: sirve como ejemplo didáctico de artefacto PEFT con model card incompleta, útil para ilustrar la diferencia entre pesos delta y pesos completos y los riesgos de publicar sin licencia ni evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador por sí solo requiere aproximadamente 0,9 GB de almacenamiento y una cantidad de VRAM del mismo orden al cargarse; no puede ejecutarse sin el modelo base de 30B.
- Modelo base en bf16/fp16: del orden de 60 GB de VRAM, por lo que requiere A100 80 GB, H100 80 GB o varias GPU (por ejemplo, 2× RTX 4090/A6000) con tensor parallelism.
- Modelo base en int8: aproximadamente 30 GB, viable en A100 40 GB, L40S 48 GB o A6000 48 GB.
- Modelo base en 4 bits (NF4/AWQ/GPTQ): aproximadamente 17-20 GB, lo que permite ejecución en una RTX 3090 o RTX 4090 de 24 GB, con margen reducido para contexto largo y caché KV.
- Opciones de despliegue: PEFT + transformers (referencia), vLLM y TGI con soporte de adaptadores LoRA, llama.cpp y Ollama tras fusionar y convertir a GGUF, y Unsloth para entrenamiento y fusión.
- Latencia y throughput: no disponibles; no hay mediciones publicadas ni configuración de referencia.
- Nota: al no declararse la longitud de contexto del base, el dimensionado de la caché KV no puede calcularse con rigor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad | Evaluación publicada |
|---|---|---|---|---|---|---|
| `shabieh2/1023_clus_rel34_3ep_1_epoch` | Adaptador sobre base 30B | No disponible | No disponible | safetensors (PEFT) | 0 descargas, 0 likes | No |
| `shabieh2/1017_cluster_lora_fullset_rel34_ep3cont_1_epoch` | Adaptador sobre base 30B | No disponible | No disponible | PEFT | Repositorio público del mismo autor | No |
| `unsloth/Muse-Glimmer-30B` (modelo base) | ~30B (según nombre) | No disponible | No disponible | safetensors | Modelo base de referencia | No disponible en la información consultada |

No se dispone de información suficiente para comparar con alternativas de otros autores de la misma categoría y tamaño; los datos de arquitectura, contexto y rendimiento del modelo base no se han proporcionado.

## Limitaciones y advertencias

- Ausencia total de model card: el README es la plantilla por defecto, sin información sobre datos, hiperparámetros ni uso previsto.
- Licencia no declarada: no puede asumirse permiso de uso comercial, redistribución ni obra derivada. Es un bloqueo objetivo para cualquier despliegue en producción.
- Sin evaluación: no hay métricas que respalden mejoras frente al modelo base; el ajuste podría degradar capacidades previas (olvido catastrófico), especialmente con varias épocas sobre un corpus reducido.
- Riesgo de alucinación y sesgos heredado del modelo base y del corpus de ajuste, que se desconoce por completo; no es posible auditar la composición de los datos.
- Idiomas no declarados: se desconoce si el ajuste conserva competencia multilingüe o la ha sesgado hacia el idioma del corpus de entrenamiento.
- Adopción nula (0 descargas, 0 likes) y ausencia de discusión comunitaria: no existe validación externa de su comportamiento.
- Dependencia estricta del base `unsloth/Muse-Glimmer-30B`: cualquier cambio o retirada de ese repositorio invalida el adaptador, y no se documenta la revisión exacta del base utilizada.
- El identificador del repositorio sugiere un experimento intermedio (`3ep_1_epoch`); no hay garantía de que sea la versión final o la mejor de la serie.
- La fecha de creación registrada (2026-10-23) debe tratarse con cautela al citar el artefacto.
- En producción: exigir auditoría de licencia, evaluación en el dominio objetivo y comparación contra el base sin adaptador antes de cualquier despliegue.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/shabieh2/1023_clus_rel34_3ep_1_epoch
- Modelo base declarado en los metadatos: https://huggingface.co/unsloth/Muse-Glimmer-30B
- Adaptador relacionado del mismo autor (ejecución previa): https://huggingface.co/shabieh2/1017_cluster_lora_fullset_rel34_ep3cont_1_epoch
- Registro de terceros sobre otro adaptador del autor: https://free2aitools.com/model/shabieh2/1017_cluster_lora_fullset_rel34_ranklte3_1_epoch
- Referencia citada en los metadatos (Lacoste et al., 2019, calculadora de impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact#compute
- Base de datos de modelos de Epoch AI (contexto de seguimiento): https://epoch.ai/data/ai-models
- Documentación del dataset de Epoch AI: https://epoch.ai/data/ai-models-documentation/records
- Rastreador de lanzamientos de modelos: https://www.nextaimodel.com/
