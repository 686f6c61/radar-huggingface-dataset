# Lucasgitguy-co/minicpm-mermaid-heretic-gguf

## Resumen

MiniCPM-V 4.7 1B Mermaid Heretic es un modelo vision-lenguaje (VLM) de pequeno tamano, derivado del MiniCPM-V y ajustado por el usuario Lucasgitguy-co para la generacion de diagramas en sintaxis Mermaid a partir de imagenes. El repositorio publicado contiene exclusivamente artefactos GGUF cuantizados para inferencia local: un modelo de lenguaje en Q4_K_M y un proyector visual en F16, que deben cargarse conjuntamente para procesar entrada de imagen. El checkpoint base sin cuantizar se distribuye por separado en el mismo espacio de nombres.

El modelo resuelve el caso de uso de conversion imagen-a-Mermaid (diagramas, esquemas y graficos a codigo Mermaid) en entornos con recursos limitados, ya que sus 1.780.767.040 parametros totales y su empaquetado Q4_K_M de 0,672 GB permiten ejecucion en CPU o GPUs de consumo. La variante "Heretic" hace referencia a un proceso de modificacion aplicado sobre el checkpoint base, cuyos detalles tecnicos no estan documentados en los artefactos inspeccionados.

La relevancia actual del modelo radica en su tamano reducido y su licencia Apache 2.0, que facilitan el despliegue local sin dependencia de servicios en la nube. No obstante, la model card advierte explicitamente de que no se documentan datos de entrenamiento, procedimiento ni resultados de benchmarks, por lo que la evaluacion de calidad debe realizarse de forma empirica por el usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (VLM) basada en MiniCPM-V 4.7; transformer con proyector visual separado (mmproj) |
| Parametros totales | 1.780.767.040 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje) y F16 (proyector visual) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el checkpoint base) |

## Arquitectura y entrenamiento

La arquitectura es la de MiniCPM-V 4.7 en su variante de 1B parametros: un modelo transformer de lenguaje acompanado de un proyector visual que transforma las representaciones de imagen en tokens compatibles con el decodificador de texto. En el repositorio GGUF, el modelo de lenguaje se distribuye en Q4_K_M (0,672 GB) y el proyector visual en F16 (1,109 GB), y ambos deben cargarse de forma conjunta para la entrada multimodal. El runtime debe soportar especificamente la arquitectura MiniCPM-V 4.7 y su proyector; la model card recomienda verificar este soporte antes de la descarga.

No se documentan en los artefactos inspeccionados el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La modificacion "Heretic" aplicada sobre el checkpoint base tampoco se describe tecnicamente. La model card indica que los datos detallados de entrenamiento, el procedimiento y los resultados de benchmarks no estan documentados, y que los ejemplos de carga son orientativos y no constituyen una afirmacion de calidad medida. El ajuste parece orientado a la generacion de Mermaid, a juzgar por el nombre del modelo y los datasets relacionados enlazados (colecciones de texto e imagen para diagramas Mermaid).

## Capacidades

- Generacion de texto e inferencia vision-lenguaje a partir de imagenes y prompts de texto.
- Conversion de diagramas e imagenes en codigo Mermaid (caso de uso principal declarado en el ejemplo de la model card).
- Procesamiento de entrada de imagen mediante el proyector visual F16 cargado junto al modelo de lenguaje.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.
- Capacidades especiales (modo thinking, audio, etc.): no disponible en la informacion proporcionada.

## Casos de uso

- Conversion de diagramas a Mermaid en documentacion tecnica: el modelo recibe una imagen de un esquema (por ejemplo, un diagrama de flujo o de arquitectura) y genera el codigo Mermaid equivalente, que puede versionarse en repositorios junto al resto de la documentacion.
- Generacion local de diagramas en entornos sin conectividad: al ejecutarse con llama.cpp sobre CPU o GPU de consumo, permite procesar imagenes en equipos aislados o con requisitos de privacidad estrictos.
- Integracion en pipelines de documentacion: el par de ficheros GGUF puede incorporarse a scripts de CI que conviertan capturas de diagramas en fragmentos Mermaid para wikis o sitios estaticos.
- Prototipado rapido en escritorio: con 0,672 GB para el modelo de lenguaje y 1,109 GB para el proyector, el modelo cabe en equipos de gama media y permite experimentar con vision-lenguaje sin infraestructura dedicada.
- Asistencia a equipos de ingenieria: transcripcion de diagramas de pizarra o capturas de herramientas de diseno a codigo Mermaid editable, reduciendo el trabajo manual de redibujado.
- Evaluacion e investigacion de VLMs pequenos: el modelo sirve como referencia para estudiar el comportamiento de un VLM de 1B parametros ajustado a una tarea concreta (Mermaid) y cuantizado a 4 bits.
- Despliegue en aplicaciones de escritorio con Ollama o LM Studio: la model card indica que estas herramientas seleccionan los ficheros separados (modelo y mmproj) en lugar del bundle, lo que facilita la integracion en entornos de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de benchmarks no estan documentados en los artefactos inspeccionados y que los ejemplos de carga no constituyen una afirmacion de calidad medida.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo de lenguaje Q4_K_M ocupa 0,672 GB y el proyector F16 1,109 GB; se requiere espacio adicional para el contexto y los buffers de inferencia, no cuantificado en la informacion disponible.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: si, dado el tamano reducido de los artefactos (menos de 2 GB en total); no se especifican modelos concretos.
- Opciones de despliegue: llama.cpp mediante `llama-mtmd-cli` con los ficheros `model-Q4_K_M.gguf` y `mmproj-model-f16.gguf`. La model card menciona Ollama y LM Studio como herramientas que seleccionan los ficheros separados. vLLM y TGI no se mencionan.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa. Como referencia estructural, el modelo se basa en MiniCPM-V 4.7 en su variante de 1B parametros, pero no se dispone de sus cifras de contexto o benchmarks en esta ficha.

## Limitaciones y advertencias

- La model card declara que no se documentan datos de entrenamiento, procedimiento ni resultados de benchmarks; la calidad del modelo no esta verificada de forma publica.
- El comando de ejemplo de la model card no fue probado como parte de la actualizacion de la documentacion, segun se indica en el propio texto.
- El modelo solo declara soporte de ingles (`language: en`), lo que limita su uso en castellano u otros idiomas.
- La longitud de contexto no esta documentada.
- El proceso de modificacion "Heretic" no se describe tecnicamente, por lo que se desconoce su impacto en el comportamiento del modelo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo modelo generativo, puede producir sintaxis Mermaid invalida o diagramas incorrectos.
- Sesgos conocidos: no documentados.
- Licencia Apache 2.0: permite uso comercial, pero deben conservarse la atribucion del upstream y los avisos de terceros al redistribuir. La licencia de la herramienta Heretic es independiente de la de los artefactos del modelo.
- El bundle de un solo fichero (`minicpm-mermaid-heretic-bundle.gguf`) no puede ejecutarse directamente con llama.cpp; requiere descomprimirse con `gguf_bundle.py` en los dos ficheros separados.
- El runtime debe soportar especificamente la arquitectura MiniCPM-V 4.7 y su proyector; versiones no compatibles de llama.cpp fallaran al cargar el modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Lucasgitguy-co/minicpm-mermaid-heretic-gguf
- Checkpoint base: https://huggingface.co/Lucasgitguy-co/minicpm-mermaid-heretic
- Coleccion de modelos Mermaid: https://huggingface.co/collections/Lucasgitguy-co/mermaid-models-6aec32e19fcffdc51361686e
- Dataset de texto e imagenes de diagramas Mermaid: https://huggingface.co/datasets/Lucasgitguy-co/mermaid-diagram-text-images
- Dataset de texto original en ingles y neerlandes: https://huggingface.co/datasets/Lucasgitguy-co/mermaid-text-en-nl
- Informe tecnico (paper): docs/paper.md (ruta relativa dentro del repositorio)
- PDF del informe: docs/paper.pdf (ruta relativa dentro del repositorio)
- BibTeX: docs/citation.bib (ruta relativa dentro del repositorio)
- Indice de modelos: docs/MODEL_INDEX.md (ruta relativa dentro del repositorio)
- Instrucciones de uso: docs/USAGE.md (ruta relativa dentro del repositorio)
- Estructura de ficheros: docs/FILE_STRUCTURE.md (ruta relativa dentro del repositorio)
- Procedencia y reproducibilidad: docs/PROVENANCE.md (ruta relativa dentro del repositorio)
- Historial de versiones: CHANGELOG.md (ruta relativa dentro del repositorio)
