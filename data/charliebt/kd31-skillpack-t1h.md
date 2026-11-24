# CharlieBT/kd31-skillpack-t1h

## Resumen

CharlieBT/kd31-skillpack-t1h es un ajuste fino (fine-tune) del modelo MachinePulseAI/karpo-decision-31B, publicado por el usuario CharlieBT en Hugging Face. Se distribuye bajo licencia Apache 2.0 y con acceso restringido (gated), lo que obliga a aceptar condiciones en la plataforma antes de descargarlo. El modelo cuenta con 31.273.088.876 parametros segun los pesos en safetensors, lo que lo situa en la franja de los 31B, y se etiqueta con la arquitectura gemma4 en la metadata del repositorio.

La ficha tecnica del pipeline declarada es `text-classification`, aunque los tags incluyen tambien `image-text-to-text`, lo que sugiere que el modelo base es multimodal y que este ajuste se orienta a tareas de clasificacion de texto. El repositorio ocupa 62,6 GB, coherente con pesos en precision completa o media para un modelo de este tamano. La informacion publica disponible es muy limitada: no hay model card descriptiva, no se detallan idiomas soportados y no se han publicado resultados de benchmarks.

Su relevancia actual es acotada y de nicho: se trata de un ajuste derivado de un modelo base poco conocido (MachinePulseAI/karpo-decision-31B), sin descargas ni interacciones en el momento de la consulta, y con acceso restringido. Resulta util unicamente como referencia para quien ya trabaje con el modelo base o quiera evaluar este skillpack concreto, no como una opcion generalista de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 (segun tag del repositorio); detalles no disponibles |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El tag `gemma4` en el repositorio apunta a la familia de arquitecturas Gemma, aunque no se aporta documentacion que confirme la configuracion exacta (numero de capas, dimensiones ocultas, mecanismo de atencion). El modelo base, MachinePulseAI/karpo-decision-31B, aparece referenciado como `base_model` y como `base_model:finetune`, lo que indica que este repositorio es un ajuste fino supervisado sobre dicho modelo. No se especifica el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o similares.

La unica informacion adicional sobre el proceso es la declaracion del pipeline `text-classification`, que sugiere que el ajuste se ha orientado a tareas de clasificacion (posiblemente etiquetado de intenciones o decisiones, a juzgar por el nombre del modelo base "karpo-decision"). No hay datos sobre innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Clasificacion de texto: el pipeline declarado es `text-classification`, por lo que se espera que el modelo devuelva etiquetas o puntuaciones sobre entradas textuales.
- Procesamiento image-text-to-text: el tag del repositorio sugiere herencia de capacidades multimodales del modelo base, aunque no se documenta su funcionamiento en este ajuste.
- Generacion de texto: al derivar de un modelo de 31B, es plausible que conserve capacidad generativa, pero no se confirma en la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se listan idiomas).
- Modos especiales (thinking, vision, audio): solo el tag image-text-to-text sugiere vision; el resto no disponible.

## Casos de uso

- Clasificacion de decisiones en pipelines internos: el modelo se presenta como un "skillpack" sobre karpo-decision-31B, por lo que encaja en la categorizacion de entradas textuales dentro de flujos de decision automatizada, siempre que se valide su comportamiento con datos propios.
- Etiquetado de tickets o incidencias: al ser un modelo de clasificacion, puede asignar categorias a textos de soporte, aunque la ausencia de benchmarks obliga a evaluarlo antes de usarlo en produccion.
- Filtrado y enrutado de contenido: util para decidir a que cola o proceso derivar un texto entrante, aprovechando el pipeline text-classification declarado.
- Investigacion sobre ajustes finos de modelos 31B: sirve como referencia para estudiar como se comporta un fine-tune de clasificacion sobre un base multimodal de esta escala.
- Experimentacion con modelos gated: util para equipos que ya tengan acceso aprobado al repositorio y quieran comparar el ajuste con el modelo base original.
- Evaluacion de la familia karpo-decision: permite medir si el ajuste skillpack mejora o degrada las capacidades del base en tareas concretas de clasificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 31,27B parametros, en FP16 se requieren aproximadamente 62,5 GB de VRAM; en cuantizacion de 8 bits, unos 31 GB; en 4 bits, alrededor de 16-18 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: para FP16, A100 80 GB o H100 80 GB; para 8 bits, A100 40 GB o dos RTX 4090; para 4 bits, una RTX 4090 (24 GB) podria ser suficiente, aunque no esta verificado.
- Cabe en consumer GPU: previsiblemente en RTX 4090 o RTX 3090 solo con cuantizacion agresiva (4 bits) y siempre que existan pesos GGUF, que no se publican en el repositorio.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados y requeririan conversion de pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Benchmarks |
|---|---|---|---|---|---|
| CharlieBT/kd31-skillpack-t1h | 31,27B | no disponible | Apache 2.0 | Gated | no disponibles |
| MachinePulseAI/karpo-decision-31B (base) | 31B (aproximado) | no disponible | no disponible | no disponible | no disponibles |
| Gemma 2 27B (referencia de familia) | 27B | 8K | Gemma license | Abierto | publicados por Google |
| Qwen2.5 32B (referencia de tamano) | 32,5B | 128K | Apache 2.0 | Abierto | publicados por Alibaba |

La comparativa con modelos consolidados es desfavorable en trazabilidad: el modelo de CharlieBT no publica contexto, benchmarks ni idiomas, mientras que alternativas como Qwen2.5 32B o Gemma 2 27B ofrecen documentacion completa y pesos abiertos sin gating.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que complica la reproducibilidad y el despliegue automatizado.
- Ausencia de model card: no hay documentacion sobre datos de entrenamiento, sesgos, idiomas ni evaluacion.
- Riesgo de alucinacion: no evaluado; al derivar de un modelo generativo de 31B, es previsible en tareas abiertas.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: desconocidas; no se especifica ventana de contexto ni cobertura linguistica.
- Licencia Apache 2.0 declarada, pero al ser un derivado de un modelo base de terceros conviene verificar que los terminos del base (MachinePulseAI/karpo-decision-31B) permitan el uso comercial y la redistribucion.
- Sin descargas ni validacion de la comunidad: no hay evidencia de uso real ni de calidad del ajuste.
- Formato unico safetensors: no se ofrecen GGUF ni cuantizaciones listas, lo que limita el despliegue en hardware de consumo.

## Enlaces

- Hugging Face: https://huggingface.co/CharlieBT/kd31-skillpack-t1h
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
