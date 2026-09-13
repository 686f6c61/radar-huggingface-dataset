# fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed13

## Resumen

`fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed13` es un modelo de generación de texto de aproximadamente 86,5 millones de parámetros publicados por el usuario fpadovani. Se trata de un ajuste fino supervisado (SFT) realizado con TRL sobre `goldfish-models/eng_latn_100mb`, un modelo monolingüe de inglés de la familia Goldfish (etiquetado como `gpt2` en el repositorio). El registro de entrenamiento en Weights & Biases está vinculado a la Universidad de Groningen.

El propio nombre del repositorio apunta a un artefacto de investigación experimental: los fragmentos "wc" (probablemente White-Cotterell), "zipf" (ley de Zipf) y "newlex" (nuevo léxico) sugieren un estudio sobre distribuciones léxicas y aprendizaje de vocabulario, mientras que "seed13" identifica una semilla concreta del experimento. No hay información publicada sobre el conjunto de datos de SFT ni sobre su composición.

No es un modelo orientado a producción: acumula cero descargas y cero valoraciones, la licencia no está declarada y no se han publicado evaluaciones. Su interés es acotado y fundamentalmente académico: sirve para reproducir un punto concreto de un experimento de ajuste fino y como punto de partida para ablaciones sobre modelos pequeños de la familia Goldfish.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (etiqueta `gpt2` del repositorio) |
| Parámetros totales | 86.508.288 (dato real de los pesos en safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible; al publicarse en safetensors, permite cuantización a int8/int4 con herramientas externas (bitsandbytes, GPTQ, conversión a GGUF) |
| Idiomas soportados | no disponible; el sufijo `eng` y el modelo base `eng_latn_100mb` indican inglés |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors (librería `transformers`) |
| Modelo base | goldfish-models/eng_latn_100mb |
| Método de ajuste | SFT con TRL 0.23.0 |
| Frameworks declarados | Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4, Tokenizers 0.22.1 |
| Tamaño del repositorio | 1,4 GB |
| Fecha de creación | 2026-09-13 |

## Arquitectura y entrenamiento

La información disponible no describe cambios estructurales respecto al modelo base. El repositorio se etiqueta como `gpt2`, por lo que se asume una arquitectura transformer decoder-only con atención causal completa, sin atención lineal, sin capas SSM ni mecanismos híbridos documentados. Tampoco se documentan innovaciones como decodificación especulativa, GQA o ventanas de contexto extendidas. La model card únicamente indica que se partió de `goldfish-models/eng_latn_100mb` y que el ajuste se realizó mediante SFT con TRL, por lo que la modificación se limita a los pesos aprendidos durante el ajuste fino.

Los modelos Goldfish son modelos monolingües entrenados de forma independiente por idioma; el sufijo `100mb` del modelo base hace referencia al tamaño del corpus de texto en inglés empleado en su entrenamiento previo. No se especifica el número de tokens de entrenamiento, la composición del dataset de SFT, la existencia de etapas de RLHF o DPO, ni la plantilla de chat empleada. El único enlace de seguimiento disponible es un *run* de Weights & Biases en el proyecto `f-padovani-university-of-groningen/white_cotterell`, accesible públicamente pero sin métricas reproducidas en la información facilitada.

## Capacidades

- Generación de texto en inglés (inferido del nombre y del modelo base; no verificado con evaluaciones).
- Generación condicionada por conversación: el ejemplo de la model card pasa una lista de mensajes con campos `role` y `content` al pipeline de `transformers`, lo que sugiere un ajuste con formato instructivo o de diálogo.
- Seguimiento de instrucciones limitado al dominio del dataset de SFT, cuya composición se desconoce.
- Inferencia ligera: por su tamaño (86,5 M de parámetros) puede ejecutarse en CPU.
- No hay evidencia de soporte de *tool calling* o *function calling*.
- No hay evidencia de capacidades de agente, razonamiento multi-paso o *thinking mode*.
- No hay evidencia de capacidades de visión, audio o multimodalidad.
- Capacidad multilingüe: no documentada; el modelo base es monolingüe de inglés.

## Casos de uso

- Reproducción de experimentos académicos: el modelo funciona como punto de control fijo de un ajuste fino con semilla conocida (`seed13`), lo que permite replicar resultados de un estudio y comparar contra otras semillas ejecutando el mismo pipeline de TRL.
- Ablaciones sobre modelos pequeños: al compartir arquitectura y modelo base con otras variantes de la familia, sirve para aislar el efecto de un cambio concreto en los datos o la configuración de SFT sobre un modelo de 86,5 M de parámetros.
- Investigación sobre distribuciones léxicas: el nombre del repositorio sugiere que el ajuste se orientó a modificar la distribución de frecuencia del vocabulario (ley de Zipf, "newlex"); resulta adecuado para analizar cómo un SFT corto altera las frecuencias de tokens generadas frente al modelo base.
- Prototipado de pipelines de `transformers`: por su tamaño reducido, permite validar plantillas de prompt, plantillas de chat y flujos de `pipeline("text-generation")` en segundos y sin GPU dedicada.
- Generación de texto de bajo coste en entornos con recursos limitados: cabe en CPU o en cualquier GPU de gama de entrada, por lo que puede usarse para generar borradores en inglés cuando el presupuesto de cómputo es la restricción principal.
- Generación de datos sintéticos para aumentación: puede emplearse para producir texto de relleno o negativos en tareas de clasificación, siempre que se valide manualmente la calidad de las muestras.
- Docencia y formación: sirve como ejemplo mínimo y manejable de un modelo ajustado con SFT y publicado con safetensors para explicar el ciclo completo de *fine-tuning*, desde el modelo base hasta la inferencia.
- Base para un ajuste posterior: al ser pequeño y estar en formato `transformers`, puede recibir un segundo *fine-tuning* o una etapa de DPO en una única GPU para explorar técnicas de alineación sin coste relevante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, HellaSwag ni de ninguna otra tarea, ni comparaciones con el modelo base. Tampoco se proporcionan métricas de pérdida de entrenamiento ni curvas de evaluación más allá del enlace al *run* de Weights & Biases.

## Requisitos de hardware

Los valores de VRAM son estimaciones aritméticas a partir del recuento de parámetros (86.508.288) y no incluyen caché KV ni activaciones, que en un modelo de este tamaño son despreciables frente al peso de los parámetros.

| Precisión | Tamaño de pesos estimado | VRAM práctica estimada |
|---|---|---|
| fp32 | ~0,35 GB | ~0,5-1 GB |
| fp16 / bf16 | ~0,17 GB | ~0,4-0,8 GB |
| int8 | ~0,09 GB | ~0,3-0,6 GB |
| int4 | ~0,05 GB | ~0,25-0,5 GB |

- Cabe con holgura en cualquier GPU de consumo: GTX 1060 6 GB, RTX 3060, RTX 4090, así como en iGPU con memoria compartida.
- Inferencia viable en CPU sin cuantización, aunque con mayor latencia que en GPU.
- No requiere A100, H100 ni GPU de centro de datos; carece de sentido desplegarlo en ellas por su tamaño.
- Despliegue directo con `transformers` mediante `pipeline("text-generation")`, tal y como muestra la model card.
- El repositorio incluye la etiqueta `text-generation-inference`, por lo que es compatible con TGI. vLLM soporta arquitecturas GPT-2 y podría servir el modelo, aunque no está verificado en la información disponible.
- Para llama.cpp u Ollama sería necesaria una conversión previa a GGUF; no se proporcionan ficheros GGUF en el repositorio.
- Latencia y throughput: no disponibles. Dado el tamaño, el coste por token estará dominado por el *overhead* del runtime más que por el cálculo de las matrices.
- Nota: el repositorio ocupa 1,4 GB, muy por encima de los ~0,35 GB que ocuparían los pesos en fp32, lo que sugiere la presencia de *checkpoints* adicionales del entrenamiento. No se detalla su contenido.

## Comparativa con modelos similares

| Modelo | Parámetros | Longitud de contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ppt-wc-zipf-newlex-77-eng-100mb_seed13 | 86,5 M | no disponible | no disponible | HuggingFace (0 descargas, 0 valoraciones) |
| goldfish-models/eng_latn_100mb (base) | ≈86,5 M (el ajuste no altera el recuento) | no disponible | no disponible en la información proporcionada | HuggingFace |
| distilgpt2 | 82 M | 1.024 tokens | Apache-2.0 | HuggingFace (dato público) |
| gpt2 (small) | 124 M | 1.024 tokens | MIT | HuggingFace (dato público) |
| pythia-70m | 70 M | 2.048 tokens | Apache-2.0 | HuggingFace (dato público) |

Los datos de las tres alternativas de referencia proceden de sus fichas públicas y no de la información proporcionada sobre este modelo. No es posible comparar rendimiento porque el modelo evaluado no publica ninguna métrica; la comparación se limita a tamaño, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: la model card contiene un campo `licence: license` sin contenido, por lo que no existe autorización explícita de uso comercial. Cualquier explotación en producción presenta riesgo legal.
- Ausencia total de evaluaciones: no hay benchmarks, métricas de pérdida ni validación cualitativa publicada; la calidad real del modelo es desconocida.
- Sin validación comunitaria: cero descargas y cero valoraciones implican que nadie ha verificado su comportamiento fuera del entorno del autor.
- Riesgo elevado de alucinación y de degeneración de texto: los modelos de menos de 100 M de parámetros generan con frecuencia repeticiones, incoherencias y afirmaciones falsas con fluidez superficial.
- Idiomas: no se declara ningún idioma en la ficha; el modelo base es monolingüe de inglés, por lo que no cabe esperar un rendimiento utilizable en castellano ni en otras lenguas.
- Contexto no documentado: si hereda la configuración típica de GPT-2, el contexto sería de 1.024 tokens, insuficiente para tareas de documento largo, pero este dato no está confirmado.
- Dataset de SFT desconocido: al no describirse la composición de los datos de ajuste, no pueden anticiparse sesgos específicos ni el dominio en el que el modelo responde mejor.
- Formato conversacional incierto: el ejemplo de uso pasa una lista de mensajes, pero no se documenta ninguna plantilla de chat ni se confirma que el tokenizador del modelo base la soporte correctamente.
- Artefacto de investigación: el nombre del repositorio, la ausencia de documentación y la referencia a una semilla concreta indican que se trata de un experimento reproducible y no de un modelo mantenido.
- Sin garantías de mantenimiento: no se anuncia ninguna actualización posterior a la fecha de creación, por lo que no cabe esperar correcciones ni soporte.
- Contenido del repositorio no verificado: los 1,4 GB de tamaño sugieren ficheros adicionales a los pesos, que conviene inspeccionar antes de su descarga o despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed13
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- *Run* de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/7dgd1r1y
- Los resultados de la búsqueda web proporcionada no contienen ningún enlace relevante sobre este modelo; el contenido devuelto corresponde a páginas de una aerolínea y no guarda relación con el repositorio.
