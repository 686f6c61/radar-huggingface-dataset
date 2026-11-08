# ov21-base-preview/base-tokenizer

## Resumen

El repositorio `ov21-base-preview/base-tokenizer` no contiene un modelo entrenado, sino el componente de tokenizacion y configuracion del proyecto OV2.1 / LLaVA-OneVision-2, una linea de modelos multimodales construida sobre el modelo de lenguaje Qwen3.5-4B. Lo publica la organizacion `ov21-base-preview` en Hugging Face bajo licencia Apache 2.0 y esta pensado como la mitad "tokenizer-and-config" de un bundle de inicio rapido: la otra mitad, con los pesos, no forma parte de este repositorio.

El interes tecnico esta en la configuracion que expone: un transformer de 32 capas con atencion hibrida (8 capas de atencion completa y 24 capas GatedDeltaNet, con un intervalo de atencion completa de 4), dimension oculta de 2560, un vocabulario de 248320 entradas y una torre de vision con patch de 16 y merge espacial de 3. Ademas, anade 8 tokens especiales para supervision de video en streaming, algo poco habitual en tokenizers derivados de Qwen.

Es relevante ahora porque documenta el andamiaje de una familia multimodal con atencion hibrida sobre Qwen3.5 y porque incluye parches de runtime (`pyshim`) para entrenamiento con secuencias largas, un detalle de ingenieria que rara vez se publica. Para quien quiera evaluar o reproducir OV2.1, este repositorio es el punto de entrada para el procesado de texto, imagen y video, pero no permite por si solo ejecutar inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (GatedDeltaNet + atencion completa) con torre de vision, segun `LlavaOnevision2Config` |
| Parametros totales | no disponible (el repositorio no contiene pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no se declara en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | no aplica: el repositorio no incluye pesos; contiene `tokenizer.json`, `tokenizer_config.json`, `config.json`, `preprocessor_config.json`, codigo remoto (`modeling_*.py`, `configuration_*.py`, `processing_*.py`, `video_processing_*.py`, `codec_video_processing_*.py`), `chat_template.jinja` y `pyshim/` |

## Arquitectura y entrenamiento

La configuracion describe un modelo de lenguaje de 32 capas con dimension oculta de 2560 y un patron de atencion hibrida: `full_attention_interval` de 4, lo que da 8 capas de atencion completa intercaladas con 24 capas GatedDeltaNet. El vocabulario es de 248320 entradas, de las cuales 248044-248076 corresponden a los 33 tokens especiales propios de Qwen3.5-4B y 248077-248084 a 8 tokens nuevos de OV2.1 para supervision de video en streaming (`<silence>`, `<response>`, `<question_memory>`, `</question_memory>`, `<answer_memory>`, `</answer_memory>`, `<captioning>`, `<caption_begin>`); los ids 248085-248319 son relleno hasta el ancho de embedding. La parte visual usa `patch_size` 16 y `merge_size` 3, con `max_pixels` de 12.845.056 en el preprocesador.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. El repositorio incluye dos parches de runtime necesarios para entrenamiento con secuencias largas: `sitecustomize.py`, que limita cada autotuner de Triton a una sola configuracion para evitar barridos de autotune de `fla` que han provocado cuelgues de nodo con Xid 31 (fallo de MMU) durante la pasada backward, y `energon_leakfix.py` (activable con `ENERGON_LEAKFIX=1`), que corrige la retencion de la ultima muestra por dataset en energon; sin el, la RSS de los workers del dataloader crecia de 17 GB a 95 GB con una mezcla de mas de 400 datasets.

## Capacidades

- Procesado de texto con el tokenizer de Qwen3.5 (vocabulario de 248320 entradas) y plantilla de chat estandar de Qwen2-VL.
- Procesado multimodal: el `preprocessor_config.json` define la configuracion de imagen (patch 16, merge 3, `max_pixels` 12.845.056) y el repositorio incluye modulos de procesado de video y de video codec.
- Supervision de video en streaming mediante los 8 tokens anadidos: eleccion de silencio (`<silence>`), apertura de respuesta hablada (`<response>`), memoria de pregunta y respuesta (`<question_memory>`, `<answer_memory>`) y modo de comentario continuo (`<captioning>`, `<caption_begin>`).
- Soporte de codigo remoto (`trust_remote_code=True`) con modulos de modelado, configuracion y procesado.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, matematicas o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo en y zh declarados.

## Casos de uso

- Preparacion de pipelines multimodales: usar `AutoProcessor` con `trust_remote_code=True` para tokenizar texto, imagen y video antes de alimentar los pesos de OV2.1, que se distribuyen por separado. Es el uso previsto explicito del repositorio.
- Reproduccion de la configuracion del modelo: cargar `config.json` para inspeccionar o replicar el patron de atencion hibrida (8 capas full attention + 24 GatedDeltaNet) en experimentos propios sobre Qwen3.5-4B.
- Entrenamiento con secuencias largas: incorporar `pyshim/` al `PYTHONPATH` para evitar los cuelgues por autotune de Triton y la fuga de memoria de energon documentados por el autor; util para equipos que entrenen con mezclas de cientos de datasets.
- Investigacion en video en streaming: los tokens `<silence>`, `<response>` y `<captioning>` permiten disenar tareas de comentario continuo y decision de cuando hablar, un caso distinto del captioning por segmentos.
- Integracion en servidores de inferencia compatibles con tokenizers de Hugging Face: el `tokenizer.json` y la plantilla de chat permiten preprocesar peticiones en un servicio que despues enrute al modelo completo.
- Desarrollo de herramientas de analisis de tokenizacion: comparar el vocabulario de Qwen3.5-4B con los 8 tokens anadidos para auditar como se segmentan las secuencias de video y los marcadores de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio no contiene pesos y no se puede ejecutar inferencia solo con el.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante `transformers` con `AutoTokenizer` y `AutoProcessor` (con `trust_remote_code=True`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Nota operativa del autor: los modulos de `pyshim` deben escribir por stderr, no por stdout; Megatron compila sus helpers de dataset en C++ en el primer arranque con `python3 -m pybind11 --includes` y el texto enviado a stdout se inserta en la linea de comandos de g++, lo que rompe la compilacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ov21-base-preview/base-tokenizer | no disponible (sin pesos) | no disponible | apache-2.0 | Hugging Face | Tokenizer y config de OV2.1 sobre Qwen3.5-4B |
| Qwen/Qwen3.5-4B | 4B (nominal, segun nombre del modelo) | no disponible | no disponible | Hugging Face | Modelo base declarado; el tokenizer hereda su vocabulario |
| LLaVA-OneVision (OV2.0) | no disponible | no disponible | no disponible | publico segun la model card | Release previa de la misma linea; comparte modulos de codigo remoto |

No se dispone de datos de rendimiento ni de contexto para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- El repositorio no contiene pesos: no es posible ejecutar inferencia solo con el; requiere el bundle de pesos de OV2.1.
- Solo se declaran los idiomas en y zh; el rendimiento en castellano no esta documentado.
- No hay informacion sobre sesgos, tasa de alucinacion ni evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial del codigo y la configuracion, pero el modelo base Qwen3.5-4B puede tener condiciones propias que deben verificarse por separado.
- El codigo remoto requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditarlo antes de usarlo en produccion.
- Los parches de `pyshim` alteran el comportamiento global del entorno (limitan el autotune de Triton a una configuracion), lo que puede degradar el rendimiento en cargas que se beneficien de autotune.
- No se documentan longitudes de contexto maximas ni regimenes de cuantizacion, lo que dificulta planificar el despliegue.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ov21-base-preview/base-tokenizer
- Organizacion en Hugging Face: https://huggingface.co/ov21-base-preview
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-4B
- Tokenizer de referencia de OpenAI (enlace de la busqueda web, no relacionado con el modelo): https://platform.openai.com/tokenizer
