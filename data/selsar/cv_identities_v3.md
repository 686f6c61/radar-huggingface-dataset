# selsar/cv_identities_v3

## Resumen

`selsar/cv_identities_v3` es un modelo de clasificación de texto publicado en HuggingFace por el usuario `selsar`. Se distribuye en formato `safetensors` con 278.810.882 parámetros reales (dato extraído de los pesos, no declarado por el autor) y un repositorio de 1,1 GB, lo que es coherente con un checkpoint almacenado en fp32. El pipeline declarado es `text-classification` y la librería es `transformers`.

El etiquetado del repositorio indica la arquitectura `deberta-v2`, es decir, un transformer encoder de la familia DeBERTa-v2 orientado a tareas de comprensión del lenguaje (NLU), no a generación. El nombre del modelo sugiere un clasificador de identidades o entidades personales en documentos tipo currículum, pero esta interpretación procede únicamente del identificador y no está confirmada en ninguna documentación del autor.

La relevancia de esta ficha es limitada por la ausencia total de documentación: la model card es la plantilla autogenerada por HuggingFace con todos los campos marcados como `[More Information Needed]`, no hay licencia declarada, no hay idiomas declarados, no hay benchmarks y el repositorio acumula 0 descargas y 0 likes. Cualquier uso en producción requiere validar el modelo de forma empírica antes de adoptarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (según el tag `deberta-v2` del repositorio); transformer encoder de clasificación de texto |
| Parámetros totales | 278.810.882 (dato real de los pesos en `safetensors`) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (DeBERTa-v2 se preentrena habitualmente con 512 tokens, no confirmado para este checkpoint) |
| Tipos de cuantización | no disponible; el repositorio contiene pesos en `safetensors` con un tamaño de 1,1 GB, compatible con fp32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `safetensors` (etiqueta `safetensors` y recuento de parámetros obtenido del propio archivo) |
| Pipeline | `text-classification` |
| Librería | transformers |
| Compatibilidad declarada | `text-embeddings-inference`, `endpoints_compatible` (etiquetas del repositorio) |
| Etiqueta arXiv | `arxiv:1910.09700` corresponde a Lacoste et al. (2019), el calculador de impacto ambiental citado en la plantilla de model card; no es el artículo del modelo |

## Arquitectura y entrenamiento

La única información sobre la arquitectura es la etiqueta `deberta-v2`, que sitúa al modelo en la familia DeBERTa-v2 de Microsoft: un transformer encoder con atención desenredada (*disentangled attention*) y máscara de atención mejorada, diseñado para tareas de comprensión del lenguaje. Sobre esa base, el modelo incorpora una cabeza de clasificación de secuencias, coherente con el pipeline `text-classification` declarado.

No hay ningún dato sobre el procedimiento de entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo ajuste fino supervisado, RLHF o DPO, ni hiperparámetros, ni infraestructura de cómputo. La model card mantiene todos los apartados de entrenamiento, preprocesado y *training regime* como `[More Information Needed]`. El sufijo `_v3` en el identificador sugiere una tercera iteración de un experimento previo del mismo autor, pero no se ha publicado información sobre las versiones anteriores.

Una observación técnica: 278,8 M de parámetros es un valor considerablemente superior al de las variantes base habituales de DeBERTa-v2 y coincide aproximadamente con el tamaño típico de un encoder de vocabulario multilingüe ampliado (del orden de 250 000 tokens de vocabulario). No es posible confirmar desde la información disponible si se trata de una variante *large* recortada, de un *base* con embeddings ampliados o de un checkpoint con una cabeza de clasificación de gran tamaño.

## Capacidades

- Clasificación de texto (pipeline `text-classification`): asignación de una o varias etiquetas a una secuencia de entrada.
- Extracción de representaciones del encoder: al ser un encoder tipo BERT/DeBERTa, puede emplearse para generar *embeddings* de frases, aunque solo la etiqueta `text-embeddings-inference` sugiere compatibilidad con ese servidor.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Generación de texto: no soportada (no es un modelo causal de lenguaje).
- Razonamiento, matemáticas y código: no disponibles ni esperables en un modelo de este tipo.
- *Tool calling* / *function calling*: no soportado.
- Uso como agente o razonamiento multi-paso: no soportado.
- Visión, audio o modo *thinking*: no soportados.
- Etiquetado por token (NER): no soportado por el pipeline declarado (`text-classification`, no `token-classification`).
- Cualquier capacidad concreta de clasificación depende por completo de las etiquetas vistas durante el ajuste fino, que el autor no documenta.

## Casos de uso

Todas las aplicaciones siguientes son hipótesis de uso razonables para un clasificador encoder de ~280 M de parámetros de la familia DeBERTa-v2, y quedan condicionadas a que el checkpoint haya sido efectivamente entrenado para la tarea descrita. La documentación publicada no confirma ninguna de ellas.

- Filtrado y triaje de currículums: clasificar documentos entrantes en categorías como válido, duplicado o descartado antes de pasarlos a un ATS, aprovechando el bajo coste de inferencia de un encoder de este tamaño.
- Etiquetado de documentos de identidad o expedientes: asignar una categoría a cada documento de un flujo de digitalización masiva (por ejemplo, tipo de documento o nivel de confidencialidad), siempre que las etiquetas estén en el conjunto de entrenamiento.
- Moderación de contenido en formularios: clasificar texto enviado por usuarios en categorías de riesgo o incumplimiento de políticas, con latencia de milisegundos por petición en GPU.
- Enrutado de tickets de soporte: predecir la categoría de una consulta entrante para dirigirla al equipo correspondiente; el modelo actúa como clasificador previo a un LLM más caro.
- Deduplicación semántica de registros: usar el encoder para generar *embeddings* y detectar registros casi idénticos en bases de datos de candidatos o clientes, con umbral de similitud coseno.
- Reranking en búsqueda documental: si `text-embeddings-inference` lo soporta como modelo de clasificación por pares, puntuar la relevancia de pares consulta-documento antes de la reordenación final.
- Análisis de sentimiento o intención en encuestas: clasificación de respuestas abiertas en categorías predefinidas, con lotes grandes en CPU si el volumen no exige GPU.
- Preanotación para anotación humana: generar etiquetas preliminares sobre un corpus y corregirlas manualmente, reduciendo el coste del etiquetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna sección de evaluación con datos y no se ha encontrado ningún resultado externo en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos derivados de los 278,8 M de parámetros, no cifras oficiales):
  - fp32: aproximadamente 1,12 GB solo de pesos, alrededor de 1,5-2 GB con activaciones y *overhead* del runtime.
  - fp16/bf16: aproximadamente 0,56 GB de pesos, en torno a 1-1,5 GB en total.
  - int8: aproximadamente 0,28 GB de pesos.
- Cabe en cualquier GPU de consumo con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.). En GPUs integradas o CPU es viable para lotes pequeños por tratarse de un encoder de tamaño medio.
- GPU recomendadas para producción con alto volumen: NVIDIA T4, L4, A10G, RTX 4090 para despliegues pequeños; A100 o H100 solo si se necesita procesar lotes muy grandes o si se comparte con otros servicios.
- Opciones de despliegue: `transformers` en Python, HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`), Text Embeddings Inference (etiqueta `text-embeddings-inference`), y servidores de clasificación genéricos. No hay confirmación de soporte en vLLM, llama.cpp u Ollama, orientados a modelos generativos y no a encoders de clasificación.
- Latencia y throughput: no disponibles. Para un encoder de ~280 M de parámetros con secuencias de 128-512 tokens cabe esperar del orden de cientos a miles de inferencias por segundo en GPU moderna con lotes grandes, pero es una estimación genérica no medida sobre este checkpoint.

## Comparativa con modelos similares

Los datos de las alternativas proceden de su documentación pública y no se han verificado en el contexto de esta búsqueda; se incluyen como referencia de categoría.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| selsar/cv_identities_v3 | 278.810.882 | no disponible | no disponible | HuggingFace, 0 descargas, 0 likes | no disponible |
| microsoft/deberta-v2-xlarge | ~900 M (aprox., según documentación del modelo) | 512 tokens | MIT | HuggingFace | Resultados publicados en el artículo de DeBERTa-v2 |
| XLM-RoBERTa-base | ~278 M (aprox., según documentación del modelo) | 512 tokens | MIT | HuggingFace | Resultados publicados en el artículo de XLM-R |
| microsoft/mdeberta-v3-base | ~86 M en el *backbone* (aprox., según documentación del modelo) | 512 tokens | MIT | HuggingFace | Resultados publicados en el artículo de DeBERTa-v3 |

Diferencias clave: frente a estos modelos, `selsar/cv_identities_v3` no declara licencia, no publica evaluación y no tiene tracción de uso. Su única ventaja potencial sería un ajuste fino específico para una tarea concreta, pero no verificable.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Model card vacía: todos los campos relevantes (datos de entrenamiento, sesgos, uso previsto, uso fuera de alcance) están sin rellenar, por lo que no existe ninguna garantía documentada sobre el comportamiento del modelo.
- Riesgo de alucinación y de etiquetado erróneo: un clasificador ajustado sobre un conjunto desconocido puede producir etiquetas sistemáticamente incorrectas sobre dominios distintos al de entrenamiento; se desconoce la distribución de entrenamiento.
- Sesgos desconocidos: al no documentarse la composición del dataset, no es posible evaluar sesgos demográficos, de género o de nacionalidad, algo especialmente sensible si el modelo clasifica personas o documentos personales.
- Idiomas: no se declara ningún idioma soportado, por lo que el rendimiento en castellano es indeterminado.
- Longitud de contexto: si el checkpoint sigue la configuración estándar de DeBERTa-v2, la ventana máxima probable es de 512 tokens, insuficiente para documentos largos sin truncado o segmentación previa.
- Trazabilidad nula: 0 descargas y 0 likes, sin historial de uso que permita inferir fiabilidad; el repositorio se creó y actualizó el mismo día.
- Sin benchmarks: no hay ninguna métrica publicada que permita comparar con alternativas consolidadas.
- Implicaciones legales si se usa sobre currículums o datos personales: cualquier decisión automatizada de este tipo queda sujeta al RGPD y a la normativa de IA aplicable; se requiere supervisión humana y una evaluación de impacto.
- Fecha de creación registrada como 2026-09-16, posterior a la fecha habitual de referencia; conviene verificar la coherencia de los metadatos del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/selsar/cv_identities_v3
- Artículo citado en la etiqueta arXiv del repositorio (Lacoste et al., 2019, calculador de impacto ambiental): https://arxiv.org/abs/1910.09700
- La búsqueda web realizada no ha devuelto ningún enlace relevante sobre este modelo: los resultados obtenidos corresponden a sitios de ciclismo de montaña y a la ayuda oficial de YouTube, sin relación con el modelo. No se dispone, por tanto, de papers, blogs, repositorios ni demos adicionales que documenten `selsar/cv_identities_v3`.
