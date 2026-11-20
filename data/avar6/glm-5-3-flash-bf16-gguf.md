# avar6/GLM-5.3-Flash-BF16-gguf

## Resumen

GLM-5.3-Flash-BF16-gguf es una coleccion de cuantizaciones GGUF del modelo zai-org/GLM-5.3-Flash, publicada por el usuario avar6 en Hugging Face. El modelo base es un transformer de gran escala desarrollado por Z.ai (Zhipu AI), con 320.759.404.382 parametros totales segun los safetensors del repositorio. Esta publicacion no contiene los pesos originales, sino conversiones a formato GGUF derivadas de los safetensors en BF16 (no de la version FP8 por defecto), pensadas para su uso con llama.cpp.

La relevancia de este repositorio es practica: permite ejecutar un modelo de mas de 320.000 millones de parametros en infraestructura local o privada mediante llama.cpp, con recetas de cuantizacion mixta que van desde ~92 GB (IQ2_XXS, 2,32 bpw) hasta ~155 GB (Q3_XL, 3,86 bpw). Incluye soporte experimental de vision mediante un fichero mmproj y conserva el tensor MTP (multi-token prediction) en Q8_0 para mantener el rendimiento de decodificacion especulativa.

El repositorio es de caracter experimental y esta vinculado a un fork especifico de llama.cpp (timkhronos) y a un PR abierto en el repositorio oficial de ggml-org. El autor advierte que las cuantizaciones han cambiado varias veces en pocos dias y que recomienda el repositorio alternativo de AesSedai para la mayoria de casos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base incluye componentes SSM e indexer, segun las recetas de cuantizacion) |
| Parametros totales | 320.759.404.382 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS (2,32 bpw, ~92 GB), IQ2_S (2,83 bpw, ~114 GB), Q2_K-Q3_K (3,20 bpw, ~128 GB), Q3_S (3,60 bpw, ~144 GB), Q3_XL (3,86 bpw, ~155 GB); blk.45 en Q8_0, ssm en F32/Q8_0, indexer en F32, tensor MTP en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado desde safetensors BF16); repo de 635,5 GB |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base en la informacion proporcionada. Los metadatos de las recetas de cuantizacion revelan la presencia de componentes SSM (state space model) y de un modulo "indexer", lo que sugiere una arquitectura hibrida con atencion y capas de estado, ademas de un tensor MTP (multi-token prediction) empleado para decodificacion especulativa. El tratamiento diferenciado de la capa blk.45 (mantenida en Q8_0) indica que esa capa es especialmente sensible a la cuantizacion.

Respecto al entrenamiento, no se han publicado en esta informacion datos sobre volumen de tokens, composicion del dataset ni etapas de alineacion (RLHF/DPO). El autor indica unicamente que las cuantizaciones se generaron a partir de los safetensors BF16, mientras que el repositorio por defecto del modelo base distribuye pesos en FP8. La receta de cuantizacion mixta sigue el esquema de Aes Sedai, con precisiones diferenciadas por tipo de tensor.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` del repositorio confirma el ajuste para dialogos multi-turno.
- Vision (experimental): incluye un fichero mmproj actualizado el 27/08/2026, con mejoras declaradas en el rendimiento visual; requiere el fork de llama.cpp indicado.
- Decodificacion especulativa mediante tensor MTP, funcional en el fork MTP de timkronos.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse a traves de la infraestructura de endpoints de Hugging Face.
- Razonamiento, codigo y matematicas: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local de un modelo de 320B en hardware de gama alta: con la cuantizacion IQ2_XXS (~92 GB) es posible cargar el modelo en un servidor con 8x RTX 4090 (192 GB de VRAM) o en un nodo con 128 GB de memoria unificada, manteniendo el modelo completamente en memoria.
- Inferencia privada en entornos con requisitos de soberania del dato: al ejecutarse mediante llama.cpp sin dependencia de APIs externas, el modelo puede procesar documentacion sensible en infraestructura propia, algo relevante para banca, sanidad o sector publico.
- Procesamiento de imagenes con el mmproj: la inclusion de soporte de vision permite tareas de descripcion de imagenes, extraccion de informacion de documentos escaneados o analisis de capturas, aunque el autor la califica de experimental y sujeta a mejoras recientes.
- Servicio de chat multi-turno autoalojado: el tag `conversational` y la compatibilidad con endpoints permiten montar un servicio de conversacion con contexto persistente sobre llama.cpp server o un frontend compatible con la API de OpenAI.
- Experimentacion con decodificacion especulativa: el tensor MTP en Q8_0 y el fork MTP permiten evaluar el incremento de throughput por token prediction multiple frente a la decodificacion autorregresiva estandar.
- Investigacion sobre cuantizacion extrema: las recetas IQ2/IQ3 con precisiones mixtas (ssm en F32/Q8_0, indexer en F32) sirven como caso de estudio de como preservar calidad en modelos hibridos con componentes no transformer bajo compresion agresiva.
- Evaluacion comparativa de formatos: util para medir la degradacion de calidad entre BF16, FP8 (repo por defecto) y GGUF de 2-4 bpw en un modelo de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~92 GB (IQ2_XXS), ~114 GB (IQ2_S), ~128 GB (Q2_K-Q3_K), ~144 GB (Q3_S), ~155 GB (Q3_XL). El repositorio completo ocupa 635,5 GB en disco.
- GPU recomendadas: configuraciones multi-GPU de centro de datos. Para la cuantizacion mas pequena, 8x RTX 4090 (192 GB), 4x A100 80 GB (320 GB) o 2x H100 80 GB con memoria suficiente segun la variante. Para Q3_XL se recomienda al menos 4x A100 80 GB o 2x H100 141 GB.
- GPU de consumo: no cabe en una unica GPU de consumo (24 GB o 48 GB). Requiere agregacion multi-GPU o memoria unificada de al menos 96-192 GB (por ejemplo, Apple Silicon de gama alta o Grace Hopper).
- Opciones de despliegue: llama.cpp exclusivamente, y en particular el fork https://github.com/timkhronos/llama.cpp/tree/GLM5.3-Flash para vision y el fork MTP para decodificacion especulativa. vLLM, TGI y Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles. El mantenimiento del tensor MTP en Q8_0 sugiere que el autor prioriza el rendimiento de la decodificacion especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-BF16-gguf (este repo) | 320,8B | no disponible | GGUF (2-4 bpw) | no disponible | Hugging Face, 1391 descargas |
| zai-org/GLM-5.3-Flash (base) | 320,8B | no disponible | safetensors FP8 | no disponible | Hugging Face (repo oficial) |
| AesSedai/GLM-5.3-Flash-GGUF | 320,8B | no disponible | GGUF | no disponible | Hugging Face (recomendado por el autor) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada. La diferencia principal entre este repositorio y el de AesSedai es la cobertura de recetas de cuantizacion: el autor indica que mantiene unicamente las variantes que AesSedai no publica.

## Limitaciones y advertencias

- Repositorio experimental: el autor lo describe explicitamente como "experimental ggufs" y ha reemplazado las cuantizaciones hasta en tres ocasiones en cuatro dias (27-30 de agosto de 2026), por lo que la reproducibilidad de descargas antiguas no esta garantizada.
- Dependencia de un fork no oficial de llama.cpp: la funcionalidad de vision y MTP requiere ramas especificas (timkhronos) y un PR aun no fusionado en ggml-org/llama.cpp (PR 27773). Esto implica riesgo de ruptura de compatibilidad y ausencia de soporte upstream.
- Requisito de memoria muy elevado: incluso la variante mas agresiva (~92 GB) excede la VRAM de cualquier GPU de consumo individual, lo que limita su uso a infraestructura de centro de datos o sistemas con memoria unificada.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Debe verificarse en el repositorio del modelo base antes de cualquier despliegue en produccion.
- Idiomas no disponibles: se desconoce la cobertura linguistica real, incluido el castellano.
- Riesgo de degradacion por cuantizacion extrema: las variantes IQ2 (2,32 y 2,83 bpw) aplican compresion muy agresiva sobre un modelo de 320B con componentes SSM e indexer; la calidad en tareas de razonamiento y codigo puede degradarse de forma significativa respecto a BF16 o FP8.
- Riesgo de alucinacion: no se han publicado evaluaciones de fiabilidad ni de tasas de alucinacion para este modelo o sus cuantizaciones.
- Soporte de vision inmaduro: el propio autor registra una actualizacion del mmproj para corregir el rendimiento visual, lo que indica que la funcionalidad no esta estabilizada.
- Mantenimiento incierto: el autor anuncia que eliminara algunas variantes (por ejemplo, Q5) para ahorrar espacio y remite a otro repositorio, por lo que los ficheros pueden desaparecer.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/avar6/GLM-5.3-Flash-BF16-gguf
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio GGUF alternativo recomendado: https://huggingface.co/AesSedai/GLM-5.3-Flash-GGUF
- Fork de llama.cpp con soporte GLM-5.3-Flash: https://github.com/timkhronos/llama.cpp/tree/GLM5.3-Flash
- PR en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/27773
