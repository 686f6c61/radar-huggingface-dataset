# SadikNawazAI/wan22-qx-encoders-gguf

## Resumen

Wan 2.2 QX Text Encoder es la versión cuantizada en formato GGUF del codificador de texto UMT5-XXL de Google, preparada específicamente para los pipelines de generación de vídeo a partir de texto (text-to-video) e imagen a vídeo del modelo Wan 2.2 QX. No se trata de un modelo generativo autónomo, sino de un componente auxiliar: convierte las instrucciones textuales del usuario en embeddings que el modelo de difusión de vídeo utiliza como condicionamiento. El repositorio, publicado por SadikNawazAI, es un espejo exacto (mismo SHA-256) del GGUF Q3_K_M original de wangkanai, redistribuido para que Ollama pueda descargarlo mediante el identificador `hf.co/SadikNawazAI/wan22-qx-encoders-gguf`.

La relevancia de esta ficha radica en que permite ejecutar el codificador de texto de Wan 2.2 en entornos con VRAM limitada: la cuantización Q3_K_M reduce el peso a 2,85 GiB (3,06 GB) y el consumo durante inferencia a unos 3,5 GB de VRAM, frente a los aproximadamente 11 GB que ocuparía el UMT5-XXL en fp16. Esto hace viable montar un pipeline de generación de vídeo en GPUs de consumo medio, siempre que el modelo de difusión principal se ejecute por separado o con cuantizaciones adicionales.

El modelo base, UMT5-XXL, es un transformer encoder de 5.680.910.336 parámetros con 24 capas, dimensión de embedding de 4.096 y un vocabulario multilingüe de 256.384 tokens. Su contexto está limitado a 512 tokens, suficiente para prompts de generación de vídeo pero insuficiente para documentos largos. La licencia es la Wan License (marcada como "other"), lo que condiciona el uso comercial y exige revisar los términos upstream antes de desplegarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia T5, `t5encoder`) |
| Parametros totales | 5.680.910.336 (5,68B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | Q3_K_M (3-bit K-quant, medium); el repo contiene únicamente esta variante |
| Idiomas soportados | Multilingüe (100+ según la model card) |
| Licencia | Wan License (marcada como "other"); atribución requerida para obras derivadas |
| Formato de pesos | GGUF (`umt5-xxl-encoder-q3-k-m.gguf`, 2,85 GiB / 3,06 GB) |
| Dimension de embedding | 4.096 |
| Numero de capas | 24 |
| Vocabulario | 256.384 tokens |
| Modelo base | google/umt5-xxl (relación: quantized) |
| Tamano del repo | 3,1 GB |
| Pipeline declarado | text-to-video |
| Libreria | gguf |
| SHA-256 del archivo | `b7e2ca4c493c9d51fa951005e8ceba2f4b6b6877cfb4c36a8955c6cd68a1dba7` |

## Arquitectura y entrenamiento

La arquitectura es la del encoder de UMT5-XXL: un transformer encoder de tipo T5 con 24 capas, dimensión oculta de 4.096 y un vocabulario multilingüe de 256.384 tokens. A diferencia de los decoders generativos, este componente solo produce representaciones contextuales de la secuencia de entrada; no genera texto. En el pipeline de Wan 2.2, esas representaciones alimentan al modelo de difusión de vídeo como condicionamiento textual. La ventana de contexto es de 512 tokens, coherente con el uso típico en prompts de generación visual.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni si hubo fases de RLHF o DPO; estos datos pertenecen al modelo original de Google y no se detallan en la información proporcionada. La innovación técnica relevante en este repositorio no es arquitectónica sino de compresión: la cuantización Q3_K_M de 3 bits con esquema K-quant medium reduce el peso de aproximadamente 11 GB en fp16 a 2,85 GiB, manteniendo la estructura del encoder. El autor declara que el archivo es un espejo sin modificaciones del GGUF de wangkanai, verificado por SHA-256, por lo que no hay reentrenamiento ni ajuste fino asociado a esta publicación.

## Capacidades

- Codificación de texto multilingüe (más de 100 idiomas según la model card) en embeddings de 4.096 dimensiones para condicionar modelos de difusión de vídeo.
- Integración como text encoder en pipelines de text-to-video e image-to-video de Wan 2.2 QX.
- Compatibilidad con diffusers mediante `text_encoder_path` apuntando al archivo GGUF.
- Carga en ComfyUI a través de nodos de carga de text encoders GGUF, colocando el archivo en `ComfyUI/models/text_encoders/`.
- Ejecución en Ollama mediante `ollama run hf.co/SadikNawazAI/wan22-qx-encoders-gguf`.
- Descarga directa con `hf download` para uso offline o en entornos aislados.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni modos de pensamiento: es exclusivamente un encoder.

## Casos de uso

- Generación de vídeo en GPUs de consumo: al ocupar unos 3,5 GB de VRAM en inferencia, el encoder deja espacio para ejecutar el modelo de difusión de Wan 2.2 en una RTX 4090 o incluso en GPUs de 16 GB con cuantizaciones adicionales del difusor, permitiendo prototipado local de text-to-video sin depender de la nube.
- Integración en flujos de ComfyUI: el archivo se coloca en `ComfyUI/models/text_encoders/` y se conecta mediante un nodo GGUF text-encoder loader, lo que facilita a artistas técnicos construir grafos de generación de vídeo reproducibles y versionados.
- Despliegue vía Ollama para pruebas rápidas: el comando `ollama run hf.co/SadikNawazAI/wan22-qx-encoders-gguf` permite validar la disponibilidad del encoder y su integración en entornos de experimentación sin gestionar manualmente dependencias de Python.
- Pipelines de diffusers en producción: usando `DiffusionPipeline.from_pretrained` con `text_encoder_path` apuntando al GGUF, se puede servir un endpoint de generación de vídeo con menor huella de memoria, útil en contenedores con límites estrictos de VRAM.
- Investigación sobre cuantización de encoders: al ser un espejo verificable por SHA-256, sirve como referencia para medir el impacto de Q3_K_M en la calidad de los embeddings y, por extensión, en la fidelidad del vídeo generado respecto a la versión fp16.
- Evaluación comparativa de licencias y reproducibilidad: el repositorio documenta explícitamente la procedencia y el hash, lo que facilita auditorías de cadena de suministro en equipos que necesitan rastrear el origen de cada artefacto del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB según la model card del autor para la variante Q3_K_M.
- Tamaño en disco: 2,85 GiB (3,06 GB) para el archivo GGUF; el repositorio completo ocupa 3,1 GB.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por el consumo de VRAM, cabe en GPUs de consumo con 8 GB o más, aunque el pipeline completo de Wan 2.2 requiere además el modelo de difusión, cuyo consumo no se detalla.
- Cabe en GPU de consumo: sí, el encoder por sí solo; el pipeline completo depende del difusor y de su cuantización.
- Opciones de despliegue: diffusers (con `text_encoder_path`), ComfyUI (nodos GGUF), Ollama y descarga directa con `hf download`. No se mencionan vLLM ni TGI, coherente con que no es un modelo generativo de texto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan 2.2 QX Text Encoder (este repo) | 5,68B | 512 tokens | Q3_K_M (3-bit) | Wan License | GGUF en HF, Ollama |
| google/umt5-xxl (original) | 5,68B | 512 tokens | fp16/fp32 | UMT5 (revisar términos upstream) | Safetensors en HF |
| wangkanai/wan22-qx-encoders-gguf (upstream) | 5,68B | 512 tokens | Q3_K_M (3-bit) | Wan License | GGUF en HF |

La comparativa se limita al mismo encoder en distintas formas de distribución, ya que no se dispone de información sobre alternativas funcionalmente equivalentes (otros text encoders para pipelines de vídeo) en los datos proporcionados. La diferencia práctica entre este repositorio y el de wangkanai es únicamente el identificador de descarga para Ollama; el contenido es idéntico según el SHA-256.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni respuestas; solo embeddings para condicionar difusión de vídeo. Usarlo fuera de ese contexto no tiene sentido.
- Contexto limitado a 512 tokens: los prompts largos se truncan, lo que puede degradar la fidelidad del vídeo generado respecto a instrucciones extensas.
- La cuantización Q3_K_M introduce pérdida de precisión en los embeddings; no se han publicado métricas que cuantifiquen el impacto en la calidad final del vídeo.
- Licencia Wan License marcada como "other": es obligatorio revisar los términos upstream y se requiere atribución para obras derivadas; el uso comercial no está garantizado sin dicha revisión.
- Riesgo de alucinación: no aplica en el sentido habitual, pero un encoder degradado puede producir condicionamientos que el difusor interprete de forma imprecisa, generando vídeos que no corresponden al prompt.
- Sesgos: no se documentan sesgos específicos en la información disponible; al heredar el vocabulario y los datos de UMT5-XXL, es previsible que arrastre sesgos del corpus original, pero no hay evidencia publicada en este repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria de la integración con Ollama ni reportes de fallos.
- El autor declara que es un espejo sin modificaciones; cualquier problema de compatibilidad con versiones concretas de diffusers, ComfyUI u Ollama debe atribuirse al upstream o al ecosistema, no a cambios en este repo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SadikNawazAI/wan22-qx-encoders-gguf
- Repositorio upstream de la cuantización: https://huggingface.co/wangkanai/wan22-qx-encoders-gguf
- Modelo base en Hugging Face: https://huggingface.co/google/umt5-xxl
- Licencia Wan: https://huggingface.co/wangkanai/wan22-qx-encoders-gguf (enlace de licencia indicado en la model card)
