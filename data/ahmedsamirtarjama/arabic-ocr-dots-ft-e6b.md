# ahmedsamirtarjama/arabic-ocr-dots-ft-e6b

## Resumen

`arabic-ocr-dots-ft-e6b` es un ajuste fino experimental orientado a OCR y análisis de estructura de documentos (`document-layout`) en árabe, construido sobre el modelo multimodal `dots.mocr` (la model card cita `rednote-hilab/dots.mocr`, mientras que las etiquetas de HuggingFace apuntan a `dots-studio/dots.mocr`). Lo publica el usuario `ahmedsamirtarjama` como parte de un proyecto de investigación alojado en un servidor interno (`server3-ts`, ruta `/mnt/extra/ocr`), no como un modelo de producción con soporte.

El modelo tiene 3.039.179.264 parámetros (aproximadamente 3,04 mil millones) según los pesos en safetensors, con un repositorio de 6,1 GB en formato `safetensors` y carga mediante `transformers` con código personalizado (`custom_code`). El ajuste se realizó con LoRA de rango 64 fusionado posteriormente en los pesos base, manteniendo congelado el *vision tower*: esto confirma que se trata de un modelo visión-lenguaje con una torre de visión más un componente de lenguaje, aunque la model card no detalla ni el número de tokens de entrenamiento ni la composición del dataset.

Su relevancia es acotada pero concreta: el OCR en árabe sigue siendo un punto débil de los modelos multimodales generalistas, y este experimento documenta un procedimiento reproducible (protocolo de test, prompts de layout, post-procesado) para adaptar un OCR multimodal existente a ese idioma. No obstante, el repositorio acumula 0 descargas y 0 *likes* en el momento de la consulta, no declara licencia y no publica cifras de benchmarks en la información disponible, por lo que debe considerarse material de investigación y no un artefacto listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (transformer multimodal con *vision tower* congelado); detalles completos no disponibles |
| Parametros totales | 3.039.179.264 (aproximadamente 3,04 mil millones, segun safetensors) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible (la configuracion de inferencia documentada usa `max_tokens` de 8192 para la generacion) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones publicadas; el repo contiene pesos en precision completa) |
| Idiomas soportados | No disponible oficialmente; etiquetado como `arabic` y entrenado para OCR en arabe |
| Licencia | No disponible |
| Formato de pesos | Safetensors (`transformers` con `custom_code`); tamano de repo 6,1 GB |
| Modelo base | `rednote-hilab/dots.mocr` (model card) / `dots-studio/dots.mocr` (etiquetas) |
| Metodo de ajuste | LoRA r64 fusionado en los pesos base, *vision tower* congelado |
| Pipeline | `text-generation` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información proporcionada describe el modelo como un *fine-tune* de OCR y layout sobre `dots.mocr`, en el que se aplicó una LoRA de rango 64 que después se fusionó en los pesos del modelo base, dejando la torre de visión congelada. Esto implica una arquitectura visión-lenguaje en la que el codificador visual permanece intacto y la adaptación se concentra en el componente de lenguaje, algo coherente con un dominio en el que la representación visual genérica ya es útil y lo que cambia es la distribución de salida (texto árabe y etiquetas de estructura). No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni si emplea decodificación especulativa u otras optimizaciones.

Tampoco se detallan los datos de entrenamiento: no hay cifras de tokens, ni composición del dataset, ni si hubo fases de RLHF o DPO. La model card remite a `docs/TEST_PROTOCOL.md` y `REPORT.md` dentro del repositorio de datos `arabic-ocr-research-data/code`, que no forman parte de la información disponible. La única innovación documentada es de procedimiento: un *pipeline* de inferencia fijo con vLLM, el prompt `prompt_layout_all_en`, temperatura 0,1, `top_p` 1,0 y `max_tokens` 8192, seguido de dos etapas de post-procesado (`trim_tail` y `trim_v2`) implementadas en `code/scripts/`. Este tipo de limpieza posterior es habitual en OCR para eliminar repeticiones de cola y artefactos de formato.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre documentos en árabe, que es el objetivo declarado del ajuste.
- Análisis de estructura de documento (*document-layout*), etiquetado en las etiquetas del repositorio.
- Generación de texto condicionada por imagen, dado que el pipeline declarado es `text-generation` y el modelo base es multimodal.
- Conversación multi-turno (`conversational`), según las etiquetas del repositorio; no se documenta su calidad real.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el entrenamiento se orienta al árabe y el prompt de inferencia documentado está en inglés (`prompt_layout_all_en`).
- Capacidades especiales (modo *thinking*, audio, vídeo): no disponibles.

## Casos de uso

- Digitalización de archivos administrativos en árabe: el modelo puede extraer texto de documentos escaneados y devolver además la estructura de bloques, lo que permite reconstruir tablas, encabezados y párrafos en un formato procesable.
- Indexación y búsqueda documental: convertir lotes de PDF escaneados en texto plano con etiquetas de layout facilita alimentar motores de búsqueda o sistemas RAG sobre corpus en árabe.
- Extracción de campos en facturas y formularios: combinando la salida de layout con reglas posteriores se pueden aislar campos como importes, fechas o identificadores fiscales en documentos árabes.
- Investigación en OCR de lenguas con escritura árabe: sirve como punto de partida reproducible para comparar variantes de LoRA, prompts y post-procesado, dado que el autor documenta el protocolo de test.
- Preprocesado de corpus para entrenamiento: generar transcripciones anotadas estructuralmente a partir de material escaneado antes de usarlo para ajustar otros modelos.
- Preservación de patrimonio documental: digitalización de manuscritos o publicaciones históricas en árabe con una ventana de generación de hasta 8192 tokens, útil para páginas densas en texto.
- Validación comparativa de OCR multimodal: al ser un ajuste de `dots.mocr`, permite medir cuánto aporta el *fine-tune* frente al modelo base en el mismo pipeline de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a `docs/TEST_PROTOCOL.md` y `REPORT.md` en el repositorio `arabic-ocr-research-data/code`, pero no se incluyen cifras de métricas como precisión de caracteres, precisión de palabras, MMLU, HumanEval o GSM8K, ni comparaciones numéricas con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia con pesos en precisión completa (bf16/fp16): alrededor de 6,1 GB solo de pesos, más la torre de visión y la caché KV. Con contexto largo (hasta 8192 tokens generados) es razonable planificar 10-14 GB de VRAM; es una estimación, no un dato publicado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 3,5-4 GB de pesos, más caché KV (estimación).
- VRAM estimada en cuantización de 4 bits: aproximadamente 2-2,5 GB de pesos, más caché KV (estimación). No hay GGUF ni cuantizaciones oficiales publicadas.
- GPU de centro de datos: A100, H100, L40S o A10G son suficientes de sobra para este tamaño; no se requiere paralelismo de tensor.
- GPU de consumo: cabe en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) en precisión completa con contexto moderado; en 4 bits podría ejecutarse en GPUs de 6-8 GB, siempre que el *custom code* del modelo sea compatible con el motor elegido.
- Opciones de despliegue: vLLM es la única documentada explícitamente por el autor. Ollama, llama.cpp, TGI y otros no están confirmados en la información disponible, y la dependencia de `custom_code` puede complicar su uso fuera de `transformers` y vLLM.
- Latencia y throughput: no disponibles. La configuración documentada (temperatura 0,1, `top_p` 1,0, `max_tokens` 8192) sugiere generaciones potencialmente largas, lo que incrementa el coste por página.

## Comparativa con modelos similares

No se dispone de datos verificados de rendimiento, licencia ni especificaciones completas de los modelos comparables. La única comparación que puede establecerse con la información disponible es con el propio modelo base.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| arabic-ocr-dots-ft-e6b | 3,04 mil millones | No disponible (max_tokens 8192 en inferencia) | No disponible | HuggingFace, 0 descargas | LoRA r64 fusionada, vision tower congelado, orientado a arabe |
| rednote-hilab/dots.mocr (base) | No disponible | No disponible | No disponible | HuggingFace | Modelo multimodal de OCR del que deriva el ajuste |
| Otras alternativas de OCR multimodal (GOT-OCR2.0, Qwen2-VL, etc.) | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- No se declara licencia en el repositorio, lo que impide determinar si el uso comercial está permitido. Cualquier despliegue en producción requiere aclarar este punto antes.
- Es un experimento de investigación: el autor lo etiqueta explícitamente como `experiment`, con 0 descargas y 0 *likes*, y sin garantías de mantenimiento.
- No hay resultados de benchmarks publicados en la información disponible, por lo que no puede verificarse la calidad del OCR en árabe ni compararse con alternativas.
- No se documentan los datos de entrenamiento, lo que impide evaluar sesgos, cobertura dialectal (árabe estándar moderno frente a variantes regionales) o posibles filtraciones del conjunto de evaluación.
- Riesgo de alucinación inherente a los modelos generativos aplicados a OCR: el modelo puede producir texto plausible que no aparece en la imagen, especialmente en documentos degradados, con caligrafía manuscrita o con tablas complejas. El post-procesado `trim_tail`/`trim_v2` mitiga repeticiones de cola, pero no errores de contenido.
- La dependencia de `custom_code` implica que la carga del modelo requiere `trust_remote_code=True`, lo que supone ejecutar código del autor del repositorio y no es aceptable en entornos con políticas de seguridad estrictas.
- El prompt de inferencia documentado (`prompt_layout_all_en`) está en inglés, mientras que el objetivo es texto árabe; no se detalla el comportamiento con prompts en árabe.
- Compatibilidad de despliegue limitada: solo vLLM está confirmado. Otros motores (llama.cpp, Ollama, TGI) podrían no soportar el código personalizado sin trabajo adicional.
- Los pesos ocupan 6,1 GB en el repositorio, lo que implica un coste de almacenamiento y de transferencia no trivial para un modelo de 3 mil millones de parámetros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ahmedsamirtarjama/arabic-ocr-dots-ft-e6b
- Perfil del autor: https://huggingface.co/ahmedsamirtarjama
- Modelo base citado en la model card: https://huggingface.co/rednote-hilab/dots.mocr
- Modelo base citado en las etiquetas: https://huggingface.co/dots-studio/dots.mocr
- Repositorio de datos y código de investigación: `arabic-ocr-research-data` (referenciado en la model card; no se proporciona URL directa en la información disponible, incluye `code/scripts/`, `docs/TEST_PROTOCOL.md` y `REPORT.md`)
- Artículos, blogs o demos adicionales: no disponibles
