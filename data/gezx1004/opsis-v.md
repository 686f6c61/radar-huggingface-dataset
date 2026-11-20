# gezx1004/opsis-v

## Resumen

Opsis-V es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario gezx1004 sobre el modelo base Qwen/Qwen3-VL-8B-Instruct, un modelo multimodal de 8.000 millones de parametros desarrollado por Alibaba Qwen. El adaptador especializa el modelo base en el dominio de la patologia digital, concretamente en la respuesta a preguntas de opcion multiple tipadas sobre campos de imagen histologica de cancer de mama procedentes de laminas TCGA. Forma parte del trabajo descrito en el articulo "One state, many questions: Opsis gives a frontier model typed eyes for pathology".

El modelo no es un modelo completo, sino un adaptador de rango 16 y alpha 32 con dropout 0,05 aplicado sobre las proyecciones query, key, value, output, gate, up y down de la torre de lenguaje, manteniendo congelada la torre de vision. El repositorio ocupa aproximadamente 0,2 GB, lo que corresponde unicamente a los pesos del adaptador en formato safetensors, no a los pesos completos del modelo base.

Su relevancia radica en que demuestra una estrategia de especializacion eficiente en parametros para vision-lenguaje aplicada a patologia computacional, con licencia Apache 2.0 y un pipeline de image-text-to-text orientado a la evaluacion de preguntas visuales (VQA) en un contexto clinico de investigacion. No obstante, se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin validacion clinica y con un alcance muy restringido al conjunto de operadores con los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16, alpha 32, dropout 0,05) sobre transformer multimodal Qwen3-VL-8B-Instruct; torre de vision congelada |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen3-VL-8B-Instruct tiene 8.000 millones (segun denominacion del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

Opsis-V es un adaptador PEFT de tipo LoRA que modifica las proyecciones query, key, value, output, gate, up y down de la torre de lenguaje del modelo Qwen3-VL-8B-Instruct. La torre de vision permanece congelada durante el entrenamiento. El modelo procesa dos imagenes como prefijo compartido: un campo a su resolucion nativa de 0,2 mpp (micrometros por pixel) y un lienzo de contexto de 448 um a 1,0 mpp. La salida del modelo es la letra de la opcion seleccionada entre las respuestas candidatas, y la distribucion de respuesta se obtiene mediante softmax sobre las letras candidatas.

El entrenamiento se realizo sobre preguntas de campos de NuCLS (19 operadores, subconjunto `fields/nucls` de la release de preguntas), con una particion de pacientes propia, durante 3 epocas, con 16 preguntas por campo, tasa de aprendizaje 1e-4 y precision bf16. El articulo reporta tres semillas; el adaptador publicado corresponde a la semilla con menor NLL de validacion. Los detalles de prompt, imagenes y puntuacion estan en `scripts/opsis_v/40_train_vlm.py` del repositorio de codigo. Las etiquetas de entrenamiento proceden de NuCLS y BCSS (CC0) sobre laminas TCGA. No se especifica el numero total de tokens de entrenamiento ni la composicion completa del dataset.

## Capacidades

- Respuesta a preguntas visuales de opcion multiple tipadas sobre imagenes de patologia (campos histologicos de cancer de mama).
- Procesamiento conjunto de dos imagenes como prefijo compartido: campo a resolucion nativa y lienzo de contexto ampliado.
- Seleccion de la letra de opcion correcta entre un conjunto de candidatas, con distribucion de probabilidad sobre las letras.
- Razonamiento visual-lenguaje heredado del modelo base Qwen3-VL-8B-Instruct (no verificado especificamente para este adaptador).
- Capacidad multilingue: no disponible en la informacion proporcionada.
- Soporte de tool calling, function calling o agentes: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en patologia computacional: evaluacion de modelos vision-lenguaje sobre preguntas tipadas de campos histologicos, usando el adaptador como linea base reproducible para experimentos de VQA en patologia.
- Analisis de campos de cancer de mama en laminas TCGA: el modelo puede responder preguntas de opcion multiple sobre morfologia de campos a 0,2 mpp y su contexto a 1,0 mpp, adecuado para estudios retrospectivos sobre cohortes TCGA.
- Reproduccion de resultados academicos: el adaptador y el codigo asociado permiten replicar los experimentos del articulo "One state, many questions" con la semilla de menor NLL de validacion.
- Comparacion de estrategias de adaptacion eficiente: sirve como referencia para evaluar LoRA de rango 16 sobre torres de lenguaje multimodales con vision congelada en tareas de patologia.
- Generacion de etiquetas asistidas en conjuntos de investigacion: el modelo puede preanotar respuestas de opcion multiple sobre campos histologicos para su posterior revision por patologos en un contexto de investigacion, nunca diagnostico.
- Desarrollo de pipelines de evaluacion VQA: integrable mediante PEFT y Transformers en scripts de evaluacion con prefijo compartido (`scripts/opsis_v/41_vlm_shared_prefix.py`) para medir NLL y exactitud sobre preguntas tipadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el articulo reporta tres semillas y que el adaptador publicado es el de menor NLL de validacion, pero no se proporcionan cifras concretas de NLL, exactitud ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; depende del modelo base Qwen3-VL-8B-Instruct. Para un modelo de 8.000 millones de parametros en bf16 se requiere aproximadamente 16 GB solo para pesos, mas memoria para activaciones y procesamiento de imagenes.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano del modelo base, serian necesarias GPU con al menos 24 GB de VRAM para bf16 (por ejemplo, A100, H100, L40S o RTX 4090), aunque este dato no esta confirmado por el autor.
- Compatibilidad con GPU de consumo: no confirmada; el modelo base de 8.000 millones en bf16 supera los 16 GB, por lo que en GPUs de consumo de 24 GB podria ser ajustado y requeriria cuantizacion, no documentada para este adaptador.
- Opciones de despliegue: PEFT y Transformers (`PeftModel.from_pretrained` sobre `AutoModelForImageTextToText`), segun el ejemplo de la model card. No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Opsis-V (este) | Adaptador LoRA sobre 8B | No disponible | VQA de opcion multiple en patologia de mama (NuCLS/TCGA) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3-VL-8B-Instruct (base) | 8B | No disponible en la informacion | Vision-lenguaje general | No disponible en la informacion | Hugging Face (modelo base) |
| Alternativas de VQA en patologia | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre otros adaptadores o modelos comparables de patologia VQA en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre campos de cancer de mama de laminas TCGA a una unica resolucion (0,2 mpp nativo y contexto a 1,0 mpp); no generaliza a otras localizaciones anatomicas, tinciones o resoluciones sin validacion adicional.
- Solo responde a los 19 operadores con los que fue entrenado; preguntas fuera de ese conjunto no estan cubiertas.
- No es un dispositivo diagnostico y no ha sido validado para uso clinico; cualquier uso en contexto medico es responsabilidad exclusiva del usuario y requiere supervision profesional.
- Riesgo de alucinacion inherente al modelo base: al seleccionar una letra entre candidatas, puede producir respuestas incorrectas con alta confianza; la distribucion softmax no debe interpretarse como calibracion clinica.
- Sesgos conocidos: no documentados en la informacion proporcionada; los sesgos del modelo base Qwen3-VL-8B-Instruct no se detallan.
- Idiomas soportados no especificados; el entrenamiento se realizo sobre preguntas en el formato de NuCLS, presumiblemente en ingles, pero no se confirma.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero las etiquetas de entrenamiento proceden de NuCLS y BCSS (CC0) sobre TCGA; deben respetarse las condiciones de las laminas TCGA originales.
- Artefacto de investigacion con cero descargas y cero likes en el momento de la consulta; sin mantenimiento ni soporte documentado.
- Longitud de contexto y requisitos de hardware no documentados, lo que dificulta la planificacion de despliegues en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gezx1004/opsis-v
- Repositorio de codigo: https://github.com/gezhixuan/opsis
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Script de entrenamiento: `scripts/opsis_v/40_train_vlm.py` (repositorio de codigo)
- Script de inferencia con prefijo compartido: `scripts/opsis_v/41_vlm_shared_prefix.py` (repositorio de codigo)
- Articulo: "One state, many questions: Opsis gives a frontier model typed eyes for pathology" (referenciado en la model card; enlace no disponible)
- Dataset NuCLS: no disponible en la informacion proporcionada
- Dataset BCSS: no disponible en la informacion proporcionada
