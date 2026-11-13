# AmberHeart/Uni-MOPD-Teacher-VQA

## Resumen

Uni-MOPD-Teacher-VQA es un modelo especialista en respuesta visual a preguntas (VQA) de proposito general, desarrollado por AmberHeart como parte del banco de especialistas Uni-MOPD. Se obtiene por post-entrenamiento del checkpoint base Qwen/Qwen3-VL-30B-A3B-Instruct, un modelo vision-lenguaje de arquitectura mixture-of-experts (MoE) ya instruido, siguiendo una ruta propia que culmina en aprendizaje por refuerzo sobre su dominio. Es, por tanto, uno de los cinco especialistas del banco (STEM, VQA, OCR/documentos, GUI y embodied), y lidera su propio dominio entre los cinco.

El modelo resuelve el problema de disponer de un experto de dominio aislado y reutilizable dentro de un pipeline de destilacion multi-profesor (MOPD). El proyecto Uni-MOPD propone inicializar al estudiante con un merge uniforme sin entrenamiento de los especialistas y refinarlo despues con una receta corta de destilacion on-policy (muestreo uniforme de dominios y KL inversa sobre el vocabulario completo). Este repositorio concreto es el profesor de VQA, no el estudiante unificado.

Con 31.070.754.032 parametros totales en bfloat16 (14 shards safetensors, 62,2 GB de repositorio), hereda la licencia Apache 2.0 del modelo base y la interfaz de transformers para Qwen3-VL-MoE. Su relevancia actual radica en que demuestra una via practica para integrar capacidades multimodales especializadas sin reentrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje con mixture-of-experts (clase Qwen3-VL-MoE) |
| Parametros totales | 31.070.754.032 |
| Parametros activos | no disponible (el nombre del base sugiere ~3B activos, no confirmado en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (14 shards, bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-30B-A3B-Instruct, un modelo vision-lenguaje instruido con arquitectura MoE. Sobre ese checkpoint compartido, cada especialista del banco sigue una ruta de post-entrenamiento distinta que termina en aprendizaje por refuerzo sobre su dominio. Al compartir arquitectura y vocabulario con el resto de especialistas, los pesos son compatibles tanto para merge en espacio de pesos como para destilacion a nivel de token. El repositorio no detalla el volumen de datos, la composicion del dataset ni los hiperparametros del RL empleado.

La innovacion del proyecto Uni-MOPD reside en la receta de integracion: un merge uniforme sin entrenamiento de los cinco especialistas inicializa al estudiante, y una destilacion on-policy corta con muestreo uniforme de dominios y KL inversa sobre el vocabulario completo lo refina. El estudiante genera respuestas a las consultas de entrenamiento y el profesor del dominio correspondiente las supervisa. Este repositorio es uno de esos profesores.

## Capacidades

- Respuesta visual a preguntas de proposito general sobre imagenes.
- Generacion de texto conversacional multimodal (pipeline image-text-to-text).
- Razonamiento visual basico derivado del modelo base instruido.
- Soporte de plantillas de chat mediante `apply_chat_template` del procesador.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades de tool calling, agentes, thinking mode o audio: no disponibles en la informacion.
- Cobertura multilingue: no disponible.

## Casos de uso

- Descripcion automatica de imagenes en catalogos: el modelo recibe una imagen y una instruccion de texto y devuelve una descripcion en lenguaje natural, util para generar metadatos de producto a escala.
- Moderacion de contenido visual asistida: clasificacion y explicacion de escenas o elementos en imagenes dentro de un flujo de revision humana.
- Accesibilidad: generacion de descripciones alternativas para imagenes en aplicaciones y sitios web, integrando el modelo via transformers con device_map automatico.
- Etiquetado de datasets de vision: uso como anotador de referencia para pre-etiquetar pares imagen-pregunta-respuesta antes de la revision por anotadores humanos.
- Profesor en pipelines de destilacion: este repositorio esta disenado explicitamente para supervisar a un estudiante en el dominio VQA dentro de Uni-MOPD.
- Asistente visual en aplicaciones de escritorio o movil con backend remoto: al requerir 62,2 GB en bfloat16, el despliegue realista es en servidor con GPU de datacenter y API expuesta al cliente.
- Investigacion en integracion de capacidades: punto de partida para experimentos de merge de pesos y destilacion multi-profesor con especialistas del mismo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en bfloat16: 62,2 GB de repositorio, por lo que la inferencia completa requiere al menos ~62 GB de VRAM solo para pesos, mas memoria para activaciones y cache KV.
- GPU de datacenter recomendadas: A100 80 GB, H100 80 GB o H200; una unica A100 80 GB es el minimo practico en bfloat16.
- Multi-GPU: necesaria con GPUs de 40 GB o menos (por ejemplo, dos A100 40 GB) mediante `device_map="auto"`.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 en bfloat16; requeriria cuantizacion, no documentada en la informacion disponible.
- Despliegue: transformers >= 4.57.1 con `Qwen3VLMoeForConditionalGeneration`; otros servidores (vLLM, TGI, llama.cpp, Ollama) no estan confirmados en la informacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Uni-MOPD-Teacher-VQA | 31,07 B | no disponible | VQA general | Apache 2.0 | Hugging Face (AmberHeart) |
| Qwen/Qwen3-VL-30B-A3B-Instruct | no disponible en la informacion | no disponible | Vision-lenguaje general | no disponible en la informacion | Hugging Face (Qwen) |
| Uni-MOPD (estudiante unificado) | no disponible en la informacion | no disponible | Multi-dominio | Apache 2.0 | Hugging Face (AmberHeart) |
| Uni-MOPD-Teacher-OCR | no disponible en la informacion | no disponible | OCR/documentos | Apache 2.0 | Hugging Face (AmberHeart) |

## Limitaciones y advertencias

- Es un especialista de dominio: su rendimiento fuera de VQA general no esta garantizado y el propio autor lo describe como lider solo en su dominio.
- Riesgo de alucinacion inherente a los modelos vision-lenguaje instruidos; no se documentan evaluaciones de fidelidad.
- No se especifican sesgos conocidos, cobertura idiomatica ni longitud de contexto, lo que dificulta planificar su uso en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validacion externa de la comunidad.
- Aunque la licencia es Apache 2.0, conviene revisar `NOTICE` por la declaracion de modificaciones sobre el modelo base.
- Requiere transformers >= 4.57.1; versiones anteriores no cargaran la clase `Qwen3VLMoeForConditionalGeneration`.
- El coste de inferencia en bfloat16 (62,2 GB) limita su uso a infraestructura de datacenter.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-VQA
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct
- Repositorio del estudiante unificado: https://huggingface.co/AmberHeart/Uni-MOPD
- Merge inicial: https://huggingface.co/AmberHeart/Uni-MOPD-Merge
- Especialista STEM: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-STEM
- Especialista OCR: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-OCR
- Especialista GUI: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-GUI
- Especialista embodied: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-Embodied
