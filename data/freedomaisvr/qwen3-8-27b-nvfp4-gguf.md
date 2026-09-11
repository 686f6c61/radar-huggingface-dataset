# FreedomAISVR/Qwen3.8-27B-NVFP4-GGUF

## Resumen

Qwen3.8-27B-NVFP4-GGUF es una cuantización comunitaria del modelo Qwen/Qwen3.8-27B, publicada por el usuario FreedomAISVR en HuggingFace. Se trata de un modelo denso de 27.320.697.856 parámetros (unos 27,3 mil millones) con arquitectura declarada Qwen3_5ForConditionalGeneration, que combina un decodificador de lenguaje con capacidad de visión. La particularidad de esta ficha es el formato de pesos: GGUF cuantizado en NVFP4, el formato de 4 bits nativo de las GPU NVIDIA Blackwell (RTX 50-series), con un tamaño de fichero de aproximadamente 15 GB frente a los ~52 GB del modelo original en F16.

El modelo resuelve un problema muy concreto: ejecutar un modelo multimodal de 27B en una GPU de consumo con 16 GB de VRAM sin recurrir a APIs externas. Para ello incluye dos ficheros, el modelo de texto cuantizado (unos 15 GB, 4,60 BPW) y un proyector de visión en F16 de 928 MB, además de una cabeza MTP (multi-token prediction) pensada para decodificación especulativa.

Es relevante ahora porque NVFP4 es un formato reciente ligado al hardware Blackwell y todavía hay poca oferta de modelos de este tamaño ya cuantizados en ese formato. Ahora bien, la ficha debe leerse con cautela: el repositorio no tiene descargas ni likes, la model card no documenta datos de entrenamiento, contexto nativo, idiomas soportados ni benchmarks, y la búsqueda web realizada no ha devuelto ninguna fuente independiente que valide el modelo ni la cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer denso, visión + lenguaje) |
| Parámetros totales | 27.320.697.856 (27,3 mil millones) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; los ejemplos de uso configuran 32.768 tokens (`--ctx-size 32768`) |
| Tipos de cuantización | NVFP4 para el modelo de texto (4,60 BPW, escala por bloques de 16 valores en E4M3 más escala tensorial en FP32); F16 para el proyector de visión |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0, según la model card (misma que el modelo base); el campo de licencia no aparece expuesto en los metadatos del repositorio |
| Formato de pesos | GGUF (`qwen3.8-27b-nvfp4.gguf` y `mmproj-qwen3.8-27b-f16.gguf`) |

## Arquitectura y entrenamiento

La model card describe el modelo base como un transformer denso de 27B con soporte de visión ("vision + language, 27B dense") bajo la clase Qwen3_5ForConditionalGeneration. Esta publicación no entrena nada: es una conversión de pesos. El proceso es una cuantización NVFP4 realizada con la herramienta `llama-quantize` de llama.cpp (ftype NVFP4), que reduce los ~52 GB en F16 a unos 15 GB (4,60 BPW). El esquema NVFP4 emplea escalado por cada 16 valores en formato E4M3 junto con una escala tensorial en FP32.

Se incluye además una cabeza MTP (next-token prediction head) destinada a decodificación especulativa, y un proyector de visión independiente en F16 de 928 MB que debe cargarse con `--mmproj`. No hay información sobre número de tokens de entrenamiento, composición del dataset, ni si el modelo base pasó por RLHF, DPO u otras etapas de alineamiento: la model card no lo detalla y la búsqueda web no ha aportado fuentes al respecto.

## Capacidades

- Generación de texto conversacional multi-turno, según los ejemplos de `llama-cli` con plantilla de chat ChatML (`--chat-template chatml --conversation`).
- Comprensión de imágenes: la cuantización incluye el proyector de visión, por lo que admite entrada visual además de texto.
- Decodificación especulativa mediante la cabeza MTP incluida.
- Despliegue en modo servidor mediante `llama-server`, con el tag `endpoints_compatible` en el repositorio, lo que apunta a compatibilidad con clientes de API al estilo de los endpoints habituales.
- Cuantización de la caché KV (`-ctk q8_0 -ctv q8_0`) y flash attention (`-fa on`) para reducir memoria en contexto largo.
- Tool calling / function calling: no documentado en la model card.
- Comportamiento agéntico y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles.
- Modo thinking explícito, audio u otras modalidades: no documentados (solo texto e imagen).

## Casos de uso

- Asistente conversacional local con datos que no salen del equipo: con ~15 GB de pesos y una GPU Blackwell de 16 GB, un equipo de sobremesa puede servir chat multi-turno de un modelo de 27B sin depender de APIs externas. Es el caso de uso natural de esta cuantización.
- Análisis de documentos con imágenes: cargando `--mmproj mmproj-qwen3.8-27b-f16.gguf` se pueden enviar capturas, diagramas, facturas escaneadas o fotografías de pizarras y hacer preguntas sobre ellas. Útil para extracción de información en flujos internos donde no se permite subir documentos a la nube.
- Atención al cliente automatizada en contexto largo: los ejemplos documentados configuran 32.768 tokens de contexto con caché KV cuantizada en q8_0, suficiente para mantener historiales extensos de conversación y documentación de producto en la misma ventana.
- Asistencia de programación en local: un modelo denso de 27B es un tamaño razonable para autocompletado, explicación de código y generación de tests integrado en el IDE. Advertencia: no hay benchmarks de código publicados para esta cuantización, por lo que conviene medir la degradación frente al modelo en F16 antes de llevarlo a producción.
- Despliegue on-premise en entornos regulados (sanidad, legal, banca): la licencia declarada Apache-2.0 y la ausencia de llamadas a servicios externos facilitan el cumplimiento de requisitos de residencia de datos, siempre que se verifique la licencia del modelo base.
- Investigación sobre cuantización FP4: sirve como banco de pruebas para comparar la degradación de NVFP4 frente a MXFP4 y frente a F16 en el mismo modelo, incluyendo el efecto sobre tareas de visión.
- Backend de inferencia compatible con endpoints: el tag `endpoints_compatible` y el modo `llama-server` permiten sustituir un cliente de API propietaria por este servidor local sin reescribir la aplicación, útil en entornos de desarrollo y pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de calidad, y la búsqueda web no ha devuelto fuentes independientes con evaluaciones de este repositorio.

El único dato de rendimiento disponible es de throughput, no de calidad:

| Métrica | Valor |
|---|---|
| Velocidad de decodificación en RTX 5060 Ti 16 GB (NVFP4) | ~10 tokens/s |
| Velocidad de decodificación en RTX 5060 Ti 16 GB (MXFP4, referencia de la model card) | ~25 tokens/s |
| Tamaño de pesos (texto) | ~15 GB |
| Tamaño del proyector de visión | ~928 MB |
| Tamaño del modelo base en F16 | ~52 GB |

## Requisitos de hardware

- VRAM estimada: ~15 GB para los pesos de texto más ~0,93 GB para el proyector de visión, es decir, unos 16 GB solo en pesos. A 32.768 tokens de contexto hay que sumar la caché KV, que la model card cuantiza a q8_0 precisamente para que quepa; el valor exacto de esa caché no está publicado.
- GPU recomendadas: exclusivamente NVIDIA RTX 50-series (Blackwell) con 16 GB o más de VRAM, según la model card. NVFP4 es un formato ligado a ese hardware y la ficha no documenta soporte en otras generaciones (Ampere, Hopper ni GPU de centros de datos como A100 o H100).
- GPU de consumo: sí, cabe en una RTX 5060 Ti de 16 GB, que es la configuración de referencia usada por el autor. Al ir al límite de VRAM, conviene no ampliar el contexto más allá de lo indicado.
- Memoria de sistema: 16 GB de RAM recomendados.
- Opciones de despliegue: llama.cpp, tanto en modo CLI (`llama-cli`) como en modo servidor (`llama-server`). No se documentan vLLM, TGI, Ollama ni otras alternativas en la información disponible.
- Parámetros de ejecución recomendados por el autor: `-ngl 99`, `--ctx-size 32768`, `-ctk q8_0 -ctv q8_0`, `-fa on`, `-b 512 --ubatch-size 128`.
- Latencia y throughput: ~10 tokens/s en RTX 5060 Ti 16 GB con NVFP4. No hay datos de latencia ni de throughput para otras GPU.

## Comparativa con modelos similares

No se dispone de fichas de otros modelos comparables en la información proporcionada. La comparación posible es interna, entre los formatos del mismo modelo:

| Variante | Tamaño de pesos | Hardware | Velocidad de decodificación | Observaciones |
|---|---|---|---|---|
| Qwen3.8-27B NVFP4 GGUF (esta ficha) | ~15 GB (4,60 BPW) | RTX 50-series, 16+ GB VRAM | ~10 t/s en RTX 5060 Ti 16 GB | Incluye mmproj F16 y cabeza MTP |
| Qwen3.8-27B F16 (modelo base) | ~52 GB | No cabe en GPU de consumo | no disponible | Referencia de calidad sin pérdida por cuantización |
| Cuantización MXFP4 del mismo modelo | no disponible | No especificado | ~25 t/s en RTX 5060 Ti 16 GB (dato de la model card) | La model card la cita solo como referencia de velocidad |

No se han identificado en la búsqueda web modelos de terceros (Qwen, Llama, Mistral u otros) con los que hacer una comparación fiable de parámetros, contexto, licencia y disponibilidad. Cualquier comparación de calidad frente a otras familias requeriría ejecutar evaluaciones propias, ya que no hay benchmarks publicados.

## Limitaciones y advertencias

- Rendimiento inferior en decodificación: la propia model card reconoce que NVFP4 decodifica más despacio que MXFP4 en GPU de consumo (~10 t/s frente a ~25 t/s en una RTX 5060 Ti de 16 GB), una diferencia de más del doble que condiciona su uso interactivo.
- Dependencia de hardware Blackwell: el uso de NVFP4 limita el despliegue a GPU RTX 50-series. No hay soporte documentado para A100, H100 ni generaciones anteriores, lo que descarta esta cuantización concreta para clústeres existentes.
- Sin validación de la comunidad: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha encontrado ninguna reseña, benchmark ni informe independiente. La calidad de la cuantización NVFP4 aplicada a este modelo no está verificada por terceros.
- Información incompleta del modelo base: contexto nativo, idiomas soportados, composición del dataset de entrenamiento y etapas de alineamiento no están documentados. La única referencia al contexto (32.768 tokens) procede de los comandos de ejemplo, no de una especificación del modelo.
- Riesgo de alucinación: no hay evaluación publicada de fidelidad factual ni de tasas de alucinación para esta cuantización. Como en cualquier modelo de lenguaje, la verificación de salidas es obligatoria en aplicaciones sensibles.
- Degradación por cuantización a 4 bits: FP4 con 4,60 BPW puede afectar de forma desigual a tareas de razonamiento largo, matemáticas y código. No hay datos comparativos frente a F16 en este repositorio.
- Dependencia de ficheros auxiliares para visión: el soporte multimodal exige cargar el proyector `mmproj` por separado; omitirlo desactiva la capacidad de imagen sin aviso aparente.
- Licencia: la model card declara Apache-2.0 heredada del modelo base, pero el repositorio no expone el campo de licencia en sus metadatos. Antes de un uso comercial conviene verificar la licencia del modelo base en su repositorio oficial.
- Fecha de creación inusual: el repositorio figura creado el 10 de septiembre de 2026, posterior a la fecha habitual de consulta. Conviene comprobar la vigencia y el estado del repositorio antes de integrarlo en cualquier flujo.
- Idiomas: al no estar documentados, no se puede garantizar un rendimiento homogéneo en castellano ni en otras lenguas distintas del inglés.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/FreedomAISVR/Qwen3.8-27B-NVFP4-GGUF
- Modelo base citado en la model card: https://huggingface.co/Qwen/Qwen3.8-27B

Nota: la búsqueda web realizada no ha devuelto ningún enlace relevante sobre este modelo, su cuantización o su modelo base (los resultados obtenidos correspondían a temas sin relación). No hay papers, blogs, repositorios de código ni demos adicionales que se puedan enlazar.
