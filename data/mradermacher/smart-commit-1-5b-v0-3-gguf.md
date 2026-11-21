# mradermacher/smart-commit-1.5b-v0.3-GGUF

## Resumen

Smart-commit-1.5b-v0.3-GGUF es una cuantizacion estatica en formato GGUF del modelo LucasBRT/pionus-1.5b-v0.3, publicada por el usuario mradermacher. El modelo base es un transformer de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) afinado especificamente para la generacion automatica de mensajes de commit siguiendo la convencion Conventional Commits, a partir de datos del dataset JetBrains-Research/commit-chronicle. Se distribuye bajo licencia Apache 2.0 y esta pensado para su uso en ingles.

La relevancia de esta ficha radica en que el paquete GGUF permite ejecutar un modelo especializado de generacion de mensajes de commit en hardware de consumo, sin necesidad de GPU dedicada ni de infraestructura en la nube. Los cuants disponibles abarcan desde Q2_K (0,8 GB) hasta f16 (3,2 GB), lo que lo hace viable en portatiles y estaciones de trabajo modestas. El modelo se presenta como conversacional y etiquetado con `endpoints_compatible`, lo que sugiere compatibilidad con infraestructuras de inferencia tipo API.

No se dispone de informacion publica sobre la longitud de contexto, la composicion exacta del dataset de entrenamiento ni resultados de benchmarks en la informacion proporcionada. El modelo base fue afinado mediante DPO (Direct Preference Optimization) segun las etiquetas del repositorio, partiendo de un modelo Pionus de 1,5B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Pionus 1.5B; detalles de atencion no disponibles) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien existe el modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo base LucasBRT/pionus-1.5b-v0.3 es un transformer de aproximadamente 1,5B de parametros. Segun las etiquetas del repositorio, el ajuste se realizo mediante DPO (Direct Preference Optimization), una tecnica de alineacion que optimiza el modelo frente a pares de respuestas preferidas y no preferidas, en lugar de un RLHF clasico con modelo de recompensa separado. El dataset de entrenamiento declarado es JetBrains-Research/commit-chronicle, un corpus de commits reales de repositorios de codigo, lo que orienta el modelo hacia la generacion de mensajes de commit realistas y alineados con practicas de la industria.

La especializacion es estrecha: el modelo no esta disenado como un asistente general, sino como un generador de mensajes de commit en formato Conventional Commits (`feat:`, `fix:`, `chore:`, etc.) a partir de un diff o descripcion de cambios. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion detallada del dataset ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. Esta version GGUF es una conversion estatica del modelo original, sin cuantizacion con imatrix (esta disponible por separado en el repositorio `-i1-GGUF`).

## Capacidades

- Generacion de mensajes de commit siguiendo la especificacion Conventional Commits.
- Procesamiento de diffs o descripciones de cambios de codigo como entrada para producir el mensaje.
- Formato conversacional, apto para integracion en interfaces de chat o pipelines.
- Etiquetado como compatible con endpoints (`endpoints_compatible`), lo que facilita su despliegue detras de APIs de inferencia.
- Capacidad multilingue limitada al ingles (unico idioma declarado).
- No se declaran capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Generacion automatica de mensajes de commit en hooks de Git: integrar el modelo en un hook `prepare-commit-msg` que reciba el diff staged y genere un mensaje conforme a Conventional Commits, reduciendo la friccion en equipos que exigen esta convencion.
- Revision de consistencia en CI/CD: validar en pipelines que los mensajes de commit cumplen el formato y, si no, sugerir una correccion generada por el modelo antes de fusionar.
- Herramientas de desarrollador en IDE: plugin de editor que, al guardar cambios, proponga un mensaje de commit listo para copiar, ejecutando el modelo Q4_K_M localmente en el portatil del desarrollador.
- Normalizacion de historiales de repositorios: procesar commits antiguos o mal redactados y proponer reescrituras coherentes para mejorar la legibilidad del historial.
- Generacion de changelogs: usar los mensajes normalizados por tipo (`feat`, `fix`, `docs`) como base para construir notas de version automaticas.
- Prototipado y evaluacion de tecnicas de alineacion: servir como caso de estudio de un modelo pequeno afinado con DPO para una tarea concreta, util en investigacion sobre especializacion de LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,2 GB con Q4_K_M; 0,8 GB con Q2_K; 1,7 GB con Q8_0; 3,2 GB con f16 (los tamanos de fichero son orientativos del peso de los pesos; la VRAM real depende del contexto y del backend).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente para los cuants pequenos; una RTX 3060, RTX 4060 o superior permite ejecutar Q8_0 con holgura. En entornos de servidor, una A100 o H100 es sobredimensionada para este modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con la API de OpenAI mediante llama.cpp o vLLM (este ultimo con soporte GGUF limitado; se recomienda llama.cpp para GGUF).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera inferencia en decenas de milisegundos por token en GPU consumer, pero no hay datos medidos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smart-commit-1.5b-v0.3-GGUF | 1,54B | no disponible | Mensajes de commit (Conventional Commits) | Apache 2.0 | GGUF en HF |
| LucasBRT/pionus-1.5b-v0.3 | 1,54B | no disponible | Mensajes de commit (modelo base) | Apache 2.0 | Safetensors en HF |
| Modelos generalistas de ~1,5B (p. ej. Qwen2.5-1.5B, SmolLM2-1.7B) | ~1,5-1,7B | 32K (Qwen2.5) / 8K (SmolLM2) | Proposito general | Apache 2.0 | Multiples formatos |

La comparativa con modelos generalistas es aproximada: no se dispone de datos de rendimiento del modelo especializado frente a ellos en la tarea de generacion de commits. La ventaja del modelo especializado es su alineacion con Conventional Commits y su menor coste de inferencia; la desventaja es su falta de capacidades generales y su limitacion al ingles.

## Limitaciones y advertencias

- Modelo especializado en una unica tarea: no es adecuado como asistente general, para codigo, matematicas o razonamiento abierto.
- Solo soporta ingles; los mensajes de commit en castellano no estan cubiertos por el entrenamiento declarado.
- Riesgo de alucinacion en la descripcion de cambios: puede inventar detalles del diff si la entrada es ambigua o incompleta.
- No se dispone de informacion sobre la longitud de contexto, lo que impide garantizar el procesamiento de diffs muy largos.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base y del dataset de entrenamiento (JetBrains-Research/commit-chronicle) antes de un despliegue en produccion.
- La cuantizacion Q2_K y Q3_K_M pueden degradar la calidad; se recomienda Q4_K_M o superior para uso en produccion.
- No hay datos publicados de benchmarks ni de evaluacion de sesgos; se desconoce el comportamiento en dominios de codigo poco representados en el dataset.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/smart-commit-1.5b-v0.3-GGUF
- Modelo base: https://huggingface.co/LucasBRT/pionus-1.5b-v0.3
- Cuants con imatrix: https://huggingface.co/mradermacher/smart-commit-1.5b-v0.3-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#smart-commit-1.5b-v0.3-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/JetBrains-Research/commit-chronicle
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
