# root4k/Qwen3.8-27B-Uncensored-oQ5e-mtp

## Resumen

El modelo `root4k/Qwen3.8-27B-Uncensored-oQ5e-mtp` es una cuantización en formato MLX de 5 bits del modelo Qwen3.8-27B Uncensored, una versión "abliterated" del modelo original de Qwen. El autor, root4k, ha aplicado la herramienta oQ (oMLX v0.6.3rc2) para producir pesos mixtos de precisión reducida, optimizados para ejecución en hardware Apple Silicon. El objetivo es ofrecer una alternativa sin filtros de censura para uso local, manteniendo las capacidades del modelo base de 27B parámetros.

La relevancia de esta ficha radica en que permite a desarrolladores e investigadores evaluar rápidamente una opción de despliegue local de un modelo de gran tamaño con cuantización eficiente, aunque la información disponible es limitada y presenta algunas inconsistencias (el archivo safetensors reporta 5.756.598.512 parámetros, muy por debajo de los 27B nominales). El modelo base original soporta contexto de 262K tokens, visión y predicción multi-token (MTP), capacidades que se preservan en la versión cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer con vision y MTP) |
| Parametros totales | 27B (nominal); safetensors reporta 5.756.598.512 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262K tokens (segun modelo original) |
| Tipos de cuantizacion | 5-bit, group size 64 (oQ mixed-precision) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (modelo original: Apache 2.0) |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer multimodal con soporte de vision y prediccion multi-token (MTP). La version "Uncensored" se obtiene mediante abliteration, una tecnica que elimina o neutraliza las capas responsables de rechazar peticiones, reduciendo la censura del modelo. La cuantizacion aplicada por root4k usa oQ (oMLX v0.6.3rc2) con precision mixta de 5 bits y group size 64, lo que reduce el peso del modelo a aproximadamente 20.3 GB en el repositorio. No se dispone de informacion sobre el dataset de entrenamiento ni sobre el proceso de abliteration especifico utilizado.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas, heredadas del modelo Qwen3.8-27B.
- Soporte de vision (entrada de imagenes) segun el modelo original.
- Prediccion multi-token (MTP) para mayor velocidad de inferencia.
- Tool calling y function calling, disponibles en el modelo base.
- Capacidades multilingues, aunque no se especifican en este repositorio.
- Ausencia de filtros de censura gracias al proceso de abliteration.

## Casos de uso

- Ejecucion local en Mac con Apple Silicon: el formato MLX permite cargar el modelo en Macs con suficiente memoria unificada, ideal para prototipado sin conexion.
- Investigacion sobre alineacion y seguridad: al ser una version sin censura, permite estudiar comportamientos de rechazo y sesgos en modelos grandes.
- Generacion de contenido creativo sin restricciones: util para escritura, brainstorming o simulacion de dialogos donde el modelo base podria negarse.
- Desarrollo de agentes locales: con tool calling y contexto largo, puede integrarse en pipelines de automatizacion que requieran razonamiento multi-paso.
- Pruebas de cuantizacion y rendimiento: la cuantizacion oQ de 5 bits permite comparar calidad y velocidad frente a otras precisiones (4-bit, 8-bit) en tareas especificas.
- Despliegue en entornos con recursos limitados: al caber en ~20 GB, puede ejecutarse en Macs con 32 GB de RAM, evitando la dependencia de GPUs dedicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de rendimiento, y la busqueda web no proporciona datos cuantitativos especificos para esta cuantizacion. Se recomienda consultar los benchmarks del modelo original Qwen3.8-27B en su pagina de HuggingFace para una referencia aproximada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 20 GB para los pesos en 5 bits, mas overhead de inferencia. Se recomienda al menos 24-32 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: Apple Silicon (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max, M4 Pro/Max) con 32 GB o mas de RAM unificada.
- No cabe en GPUs consumer convencionales (RTX 4090 con 24 GB podria ser insuficiente por el overhead, aunque es posible con cuantizaciones mas agresivas).
- Opciones de despliegue: MLX (libreria nativa de Apple), oMLX para cargar el formato oQ, o conversion a GGUF para usar con llama.cpp u Ollama.
- Latencia y throughput: no disponibles; dependen del hardware y de la implementacion de MLX.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | Apache 2.0 | safetensors | Modelo base con censura |
| Qwen3.8-27B-Uncensored (GGUF) | 27B | 262K | Apache 2.0 | GGUF | Version abliterated para llama.cpp |
| Este modelo (oQ5e-mtp) | 27B (nominal) | 262K | no disponible | MLX safetensors | Cuantizacion 5-bit para Apple Silicon |

La comparativa se basa en el modelo original y en versiones alternativas encontradas en la busqueda web. No se dispone de datos de rendimiento para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Discrepancia en el numero de parametros: el archivo safetensors reporta 5.756.598.512 parametros, muy inferior a los 27B nominales. Esto podria indicar un error en el repositorio o una cuantizacion extrema que descarta pesos, aunque no es habitual. Se recomienda verificar la integridad del modelo antes de usarlo en produccion.
- Licencia no especificada: aunque el modelo original es Apache 2.0, este repositorio no declara licencia, lo que genera incertidumbre legal para uso comercial.
- Riesgo de alucinacion y sesgos: al ser una version sin censura, el modelo puede generar contenido inapropiado, ofensivo o factualmente incorrecto sin filtros de seguridad.
- Limitaciones de idioma: no se especifican los idiomas soportados; se asume herencia del modelo base, pero no esta confirmado.
- Dependencia de hardware Apple: el formato MLX limita su uso a Macs con Apple Silicon; no es portable a GPUs NVIDIA sin conversion.
- Sin benchmarks publicados: no hay evidencia de rendimiento para esta cuantizacion especifica, por lo que la calidad de salida no esta validada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/root4k/Qwen3.8-27B-Uncensored-oQ5e-mtp
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
- Guia de ejecucion local (GGUF): https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Blog sobre version GGUF abliterated: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Repositorio alternativo de Qwen3.8-27B Uncensored: https://github.com/Wassimyounes01/qwen38-uncensored
