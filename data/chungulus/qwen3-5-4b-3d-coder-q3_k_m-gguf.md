# Chungulus/Qwen3.5-4B-3D-Coder-Q3_K_M-GGUF

## Resumen

Qwen3.5-4B-3D-Coder-Q3_K_M-GGUF es una cuantizacion comunitaria en formato GGUF del checkpoint FP16 `ccore/Qwen3.5-4B-3D-Coder`, un fine-tune especializado en generacion de codigo Three.js y tareas de imagen-a-texto. Lo publica el usuario Chungulus bajo licencia Apache 2.0 y esta pensado para su uso con llama.cpp, incluyendo la proyeccion visual BF16 original del modelo base.

El modelo parte de la familia Qwen3.5 con 4.205.751.296 parametros en esta version de texto (frente a los 4.539.265.536 del checkpoint original, que incluye vision). La cuantizacion Q3_K_M reduce el peso del repositorio a 2,9 GB, lo que permite ejecutarlo en GPUs de consumo con VRAM limitada. Se distribuye como un unico archivo GGUF mas un proyector multimodal `mmproj` en BF16 sin cuantizar.

Su relevancia es practica: ofrece una via de despliegue local de bajo coste para generar escenas Three.js y procesar imagenes, con licencia permisiva para uso comercial. No obstante, es una cuantizacion no oficial, sin dataset de calibracion ni matriz de importancia, y el autor no ha evaluado benchmarks de precision ni el comportamiento en contexto completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con proyector visual multimodal |
| Parametros totales | 4.205.751.296 (version texto GGUF); 4.539.265.536 en el checkpoint original con vision |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso emplea `-c 8192` |
| Tipos de cuantizacion | Q3_K_M (esta version); el modelo base admite otras, no detalladas |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto) + `mmproj` BF16 para vision |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia Qwen3.5 con un proyector visual multimodal que permite entrada de imagen y texto (pipeline `image-text-to-text`). El checkpoint original es un fine-tune de CCORE orientado a codigo Three.js, y esta version es una cuantizacion Q3_K_M realizada de forma independiente a partir de la exportacion en precision completa del autor original. El proyector visual se incluye sin cuantizar, en BF16.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en el fine-tune original. La model card indica que no se utilizo dataset de calibracion, matriz de importancia ni recuantizacion durante la conversion, y que se verificaron los hashes de origen y del proyector antes de convertir. Tampoco se exporta la prediccion multi-token (MTP), por lo que debe desactivarse la decodificacion especulativa en los frontends que intenten habilitarla.

## Capacidades

- Generacion de codigo, con especializacion en escenas Three.js (el ejemplo oficial genera una escena con un cubo rojo rotatorio).
- Comprension de imagenes mediante el proyector multimodal incluido (pipeline image-text-to-text).
- Salida estructurada en JSON, verificada en las pruebas del autor.
- Razonamiento aritmetico basico, segun las comprobaciones del autor.
- Conversacion multi-turno (modo `-cnv` en llama.cpp).
- Soporte de plantilla Jinja (`--jinja`) para formateo de chat.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de escenas Three.js para prototipado web: el modelo produce codigo JavaScript de escenas 3D a partir de una descripcion textual, lo que acelera la creacion de demos y pruebas de concepto en el navegador.
- Asistencia de codigo en local con VRAM limitada: al ocupar 2,9 GB en Q3_K_M, puede ejecutarse en GPUs de consumo para autocompletar y generar fragmentos de codigo sin depender de servicios en la nube.
- Descripcion de imagenes y alt-text: usando `llama-mtmd-cli` con el proyector `mmproj`, permite generar descripciones de imagenes para accesibilidad o catalogacion.
- Extraccion de datos estructurados: su capacidad verificada de salida JSON lo hace util para convertir texto libre en objetos JSON en pipelines de datos.
- Educacion y experimentacion: sirve para estudiar el comportamiento de modelos multimodales cuantizados en entornos de laboratorio o docencia con hardware asequible.
- Integracion en herramientas de escritorio: al ser GGUF compatible con llama.cpp, puede embeberse en aplicaciones de escritorio o CLI que requieran inferencia offline.
- Generacion de ejemplos didacticos de 3D: util para crear snippets de Three.js en documentacion tecnica o tutoriales, con revision humana posterior del codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se evaluo la precision en benchmarks, el comportamiento en contexto completo, el renderizado en navegador ni el video. Solo se reportan pruebas cualitativas de aritmetica, salida JSON y comprension de imagenes, ademas de una comprobacion de sintaxis JavaScript del ejemplo Three.js generado (con resultados separados para salida bruta y normalizada).

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,9 GB para los pesos Q3_K_M, mas overhead de contexto KV cache; con contexto de 8192 tokens conviene reservar entre 4 y 6 GB en total (estimacion, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para contexto moderado; RTX 3060, RTX 4060, RTX 4090 o superiores.
- Cabe en GPU de consumo: si, en modelos con 6 GB o mas de VRAM; con `-ngl 99` se descargan todas las capas a GPU.
- Opciones de despliegue: llama.cpp (`llama-completion`, `llama-mtmd-cli`), y por compatibilidad GGUF potencialmente Ollama u otros frontends, aunque no se confirma en la informacion disponible.
- Version minima: build reciente de llama.cpp con soporte para Qwen3.5; el autor probo con el commit `6414d5b0c9e5895473036c90c2bd305ce4ceccc4`.
- Latencia y throughput: no disponibles.
- Nota: desactivar MTP/decodificacion especulativa en los frontends que intenten habilitarla.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-3D-Coder-Q3_K_M-GGUF (este) | 4,2 B (texto) | no disponible | GGUF Q3_K_M + mmproj BF16 | Apache 2.0 | Cuantizacion comunitaria, especializada en Three.js y vision |
| ccore/Qwen3.5-4B-3D-Coder (base) | 4,54 B (con vision) | no disponible | FP16/BF16 | Apache 2.0 | Checkpoint original sin cuantizar, mayor precision |
| Otros Qwen3.5 de ~4B | no disponible | no disponible | varios | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion no oficial: es una conversion comunitaria, no un release de Qwen ni de CCORE; la calidad puede diferir del checkpoint original.
- Sin calibracion: no se uso dataset de calibracion ni matriz de importancia, lo que puede degradar la precision frente a cuantizaciones calibradas.
- Precision no evaluada: no hay benchmarks que cuantifiquen la perdida de calidad respecto al FP16.
- Contexto no verificado: el comportamiento en contexto completo no fue evaluado; el ejemplo usa 8192 tokens pero no se confirma la ventana maxima.
- Sin MTP: la prediccion multi-token no esta exportada; hay que desactivar la decodificacion especulativa.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo modelo generativo, puede producir codigo o descripciones incorrectas.
- Sesgos: no documentados en la informacion disponible.
- Idiomas: no se especifican los idiomas soportados.
- Codigo generado: el autor verifico solo la sintaxis JavaScript del ejemplo, no su correccion funcional ni el renderizado en navegador; se recomienda revision humana.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene revisar los terminos del modelo base y del proyector incluidos en `LICENSE`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Chungulus/Qwen3.5-4B-3D-Coder-Q3_K_M-GGUF
- Modelo base: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Checkpoint original FP16 referenciado: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/tree/16f53e560115a3f55ddf7b455d65417257e29414
- llama.cpp (build con soporte Qwen3.5, commit `6414d5b0c9e5895473036c90c2bd305ce4ceccc4`): no disponible como enlace directo en la informacion proporcionada
- Archivos de validacion del repo: `validation.json`, `example-scene.html`, `quantizatia-manifest.json`, `LICENSE` (incluidos en el repositorio)
