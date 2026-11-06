# Lucasgitguy-co/minicpm-mermaid-heretic-trial65-gguf

## Resumen

MiniCPM-V 4.7 1B Mermaid Heretic — Trial 65 GGUF es una cuantización en formato GGUF de un modelo de vision-lenguaje de aproximadamente 1.006 millones de parametros, derivado de la familia MiniCPM-V y ajustado por el autor (Lucasgitguy-co) para la conversion de imagenes de diagramas en codigo Mermaid. Se distribuye como artefacto listo para inferencia local con llama.cpp, con un modelo de lenguaje cuantizado Q4_K_M, una alternativa F16 y un proyector visual F16 independiente que debe cargarse junto al modelo para procesar imagenes.

El modelo resuelve un problema concreto: llevar la tarea image-to-Mermaid a un tamano de 1B que quepa en hardware de consumo, manteniendo la capacidad multimodal de MiniCPM-V. La designacion "Heretic" hace referencia a una modificacion aplicada sobre el checkpoint base de MiniCPM-V 4.7 1B; la model card no documenta en que consiste esa modificacion ni su impacto en calidad. El sufijo "trial65" indica que se trata de una variante experimental dentro de una serie de intentos del autor.

Es relevante ahora porque ofrece una via practica para generar diagramas Mermaid a partir de capturas o imagenes en entornos locales sin GPU de datacenter, con licencia Apache 2.0. No obstante, la documentacion de entrenamiento, datos y evaluacion es practicamente inexistente: el propio autor advierte que el ejemplo de uso no fue probado como parte de la actualizacion de la documentacion y que no hay resultados comparativos de calidad documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en MiniCPM-V 4.7 (transformer multimodal con proyector visual); detalles internos no disponibles |
| Parametros totales | 1.006.209.856 (aprox. 1,0 B) |
| Parametros activos | no disponible (no se documenta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M y F16 incluidos en el repositorio; otras cuantizaciones no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (model-Q4_K_M.gguf, model-f16.gguf, mmproj-model-f16.gguf) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo sigue la arquitectura de MiniCPM-V 4.7 en su variante de 1B parametros, es decir, un modelo de lenguaje transformer acoplado a un proyector visual que permite entrada image-text-to-text. El repositorio GGUF separa explicitamente el modelo de lenguaje (Q4_K_M o F16) del proyector multimodal (mmproj-model-f16.gguf), lo que confirma la estructura encoder visual + proyector + LLM habitual en esta familia. No se dispone de detalles sobre numero de capas, dimensiones ocultas, mecanismo de atencion ni innovaciones especificas de la variante 4.7.

En cuanto al entrenamiento, la model card es explicita: "Detailed training data, training procedure, and benchmark results are not documented in the inspected artifacts". Se sabe que existe un ajuste denominado Heretic aplicado sobre el checkpoint base y que el proyecto esta orientado a Mermaid, con datasets relacionados publicados por el mismo autor (mermaid-diagram-text-images y mermaid-text-en-nl, este ultimo en ingles y neerlandes). No se documenta el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo RLHF, DPO o alguna fase de alineamiento. Tampoco se detalla que cambia "Heretic" respecto al MiniCPM-V original.

## Capacidades

- Generacion de codigo Mermaid a partir de imagenes de diagramas, que es la tarea objetivo declarada del ajuste.
- Comprension de imagenes y texto combinados (pipeline image-text-to-text).
- Conversacion multi-turno: el tag "conversational" esta presente en el repositorio.
- Generacion de texto en ingles.
- Capacidad de razonamiento, codigo general y matematicas: no documentada para esta variante concreta; se heredaria, en su caso, del MiniCPM-V base, sin datos verificables.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a ingles segun los metadatos; el dataset relacionado incluye neerlandes, pero el modelo declara solo "en".
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Conversion de diagramas a Mermaid en documentacion tecnica: el modelo recibe una captura de un diagrama de flujo o de arquitectura y devuelve el codigo Mermaid correspondiente, que se puede versionar en el repositorio junto al texto. Es el caso de uso central del ajuste.
- Digitalizacion de pizarras y bocetos: fotografiar un esquema dibujado a mano y obtener una representacion Mermaid editable para incorporarla a wikis internas o Confluence.
- Generacion de diagramas en pipelines de documentacion: integrado via llama.cpp en un script que procese imagenes de un directorio y genere ficheros .mmd, con revision humana posterior dado que no hay benchmarks de calidad.
- Prototipado en local sin GPU dedicada: al ocupar el Q4_K_M aproximadamente 0,672 GB y el proyector 1,109 GB, se puede ejecutar en portatiles con CPU o GPU integrada para pruebas de concepto.
- Extraccion de estructura de diagramas heredados: a partir de imagenes de diagramas antiguos (por ejemplo, capturas de herramientas de modelado), obtener Mermaid para reconstruir la documentacion en un formato mantenible.
- Asistencia en docencia o formacion: convertir diagramas de apuntes o transparencias a Mermaid para que los alumnos puedan editarlos y practicar sintaxis.
- Preprocesado en flujos de ingenieria de requisitos: transformar diagramas de casos de uso o de clases en Mermaid para revisiones colaborativas en Markdown.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se documentan resultados de evaluacion ni comparativas de calidad entre la variante Q4_K_M y la F16, y que el ejemplo de inferencia no fue probado como parte de la actualizacion de la documentacion.

## Requisitos de hardware

- VRAM estimada: con Q4_K_M (0,672 GB) mas proyector F16 (1,109 GB) se necesita del orden de 2 GB para los pesos; con margen para KV cache y contexto, un entorno de 4-6 GB es suficiente en la mayoria de configuraciones.
- Alternativa F16: model-f16.gguf ocupa 2,024 GB; sumado al proyector, alrededor de 3,2 GB de pesos.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090); tambien viable en CPU. No requiere A100 ni H100.
- Cabe en GPU consumer: si, practicamente en todas las GPU discretas modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp mediante llama-mtmd-cli (el ejemplo de la model card), y en general cualquier runtime que soporte MiniCPM-V 4.7 y su arquitectura de proyector. vLLM, TGI u Ollama no estan documentados para esta variante; el tag "endpoints_compatible" sugiere compatibilidad con endpoints de Hugging Face, pero no se detalla.
- Latencia y throughput: no disponibles. El autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM-V 4.7 1B Mermaid Heretic Trial 65 (este) | ~1,0 B | no disponible | en | Apache 2.0 | Ajuste especifico para Mermaid, sin benchmarks publicados |
| MiniCPM-V 4.7 1B (base) | ~1,0 B | no disponible | en (segun familia) | segun checkpoint original | Modelo upstream sin el ajuste Heretic/Mermaid; referencia de partida |
| Otros VLM de ~1-2 B para diagramas | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento, contexto o calidad con alternativas concretas; la comparativa se limita a la relacion con el checkpoint base.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de la calidad de la conversion a Mermaid ni de la degradacion introducida por la cuantizacion Q4_K_M.
- Procedencia opaca: no se documenta el dataset exacto de entrenamiento, el procedimiento ni en que consiste la modificacion "Heretic"; la reproducibilidad es limitada.
- El ejemplo de uso de la model card no fue probado por el autor; puede requerir una build de llama.cpp con soporte especifico para MiniCPM-V 4.7.
- Solo ingles declarado: el rendimiento en castellano no esta garantizado ni evaluado.
- Riesgo de alucinacion en la sintaxis Mermaid: al ser un modelo de 1B, es probable que genere diagramas sintacticamente invalidos o que invente relaciones no presentes en la imagen; se recomienda validacion automatica de la sintaxis y revision humana.
- Idiomas y contexto: la longitud de contexto no se publica, lo que dificulta planificar conversaciones largas o diagramas muy densos.
- Licencia Apache 2.0 permite uso comercial, pero deben conservarse los avisos de atribucion upstream y de terceros (LICENSE y NOTICE); la licencia de la herramienta Heretic es independiente de la de los artefactos del modelo.
- Variante experimental ("trial65"): no hay historial de calidad ni garantia de mantenimiento; el repositorio tiene 0 likes y 202 descargas, lo que sugiere poca validacion por la comunidad.
- Fecha de creacion en 2026 segun los metadatos del repositorio; conviene verificar la vigencia y el soporte del runtime antes de desplegar en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Lucasgitguy-co/minicpm-mermaid-heretic-trial65-gguf
- Checkpoint base (no cuantizado): https://huggingface.co/Lucasgitguy-co/minicpm-mermaid-heretic-trial65
- Dataset relacionado (diagramas Mermaid texto-imagen): https://huggingface.co/datasets/Lucasgitguy-co/mermaid-diagram-text-images
- Dataset relacionado (texto en ingles/neerlandes): https://huggingface.co/datasets/Lucasgitguy-co/mermaid-text-en-nl
- Documentacion de estructura de ficheros: docs/FILE_STRUCTURE.md (en el repositorio)
- Documentacion de procedencia: docs/PROVENANCE.md (en el repositorio)
- Historial de versiones: CHANGELOG.md (en el repositorio)
- llama.cpp (runtime de inferencia): https://github.com/ggml-org/llama.cpp
