# GTrush/Qwen3-VL-Reranker-8B-Q8_0-GGUF-llama_cpp

## Resumen

Qwen3-VL-Reranker-8B es un modelo reranker multimodal de 8 mil millones de parametros desarrollado por el equipo de Qwen, del cual este repositorio de GTrush ofrece una conversion a formato GGUF con cuantizacion Q8_0 lista para ejecutar en llama.cpp. Un reranker es un modelo que, dado un conjunto de documentos candidatos (textuales o visuales), asigna puntuaciones de relevancia respecto a una consulta, permitiendo reordenar los resultados de un sistema de recuperacion (RAG, busqueda semantica) para mejorar sustancialmente la precision del top-k.

La relevancia de esta conversion concreta radica en que los GGUF comunitarios existentes (por ejemplo, los de mradermacher) no funcionaban correctamente para reranking en llama.cpp, ya que se exportaban como VLM generativos estandar sin los tensores de clasificacion (`cls.output.weight`), los metadatos de pooling `RANK` ni la plantilla de chat `rerank`. Esta version se convirtio con el script oficial `convert_hf_to_gguf.py` de llama.cpp, que soporta explicitamente `Qwen3-VL-Reranker`, y produce probabilidades de relevancia correctas en el rango [0, 1] tanto para consultas de solo texto como multimodales (texto + imagen).

Con 7.568.413.696 parametros, cuantizacion Q8_0 (unos 8 GB entre modelo principal y proyector de vision) y licencia Apache 2.0, es una opcion muy practica para montar un endpoint de reranking multimodal autoalojado compatible con la API `/v1/rerank` de llama-server.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3-VL) adaptado como reranker clasificador binario |
| Parametros totales | 7.568.413.696 (7,57 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 8192 tokens en los ejemplos de despliegue (limite nativo del modelo base: no disponible) |
| Tipos de cuantizacion | Q8_0 (esta ficha); el modelo base original en safetensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo principal + `mmproj` para vision), convertido desde safetensors |

## Arquitectura y entrenamiento

El modelo base, Qwen3-VL-Reranker-8B, es un modelo de la familia Qwen3-VL (transformer multimodal con encoder de vision y proyector DeepStack) adaptado a la tarea de reranking. En lugar de generar texto de forma autoregresiva, funciona como clasificador binario: extrae la capa `cls.output.weight` de dimension [4096, 2], correspondiente a las filas "yes"/"no" de `lm_head`, y aplica pooling de tipo `RANK` para producir una probabilidad de relevancia en [0, 1] para cada par consulta-documento.

La conversion GGUF de este repositorio incorpora ademas los metadatos especificos que llama.cpp necesita: `qwen3vl.pooling_type = RANK`, `qwen3vl.classifier.output_labels = ["yes", "no"]` y la plantilla de chat nombrada `rerank` (incluido el empalme de marcadores de contenido multimodal), lo que permite que `llama-server --reranking` y el endpoint `/v1/rerank` funcionen correctamente con entradas mixtas de texto e imagen. Los detalles del entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada.

## Capacidades

- Reranking de documentos textuales: asigna puntuaciones de relevancia entre una consulta y multiples documentos candidatos via `/v1/rerank`.
- Reranking multimodal: puede puntuar documentos que combinan texto e imagen (y consultas textuales contra documentos visuales), gracias al encoder de vision incluido en el `mmproj`.
- Entradas mixtas en una misma peticion: acepta en el mismo lote documentos de solo texto y documentos con imagen.
- Salida probabilistica calibrada en [0, 1] mediante el clasificador "yes"/"no", apta para umbrales de relevancia.
- Compatibilidad con el modo router de llama.cpp mediante `models.ini`.
- No es un modelo generativo de proposito general: no esta pensado para generacion de texto, codigo ni razonamiento conversacional.
- Soporte de tool calling, agentes y thinking mode: no disponible (no aplica a esta arquitectura de reranking).

## Casos de uso

- Reordenacion en pipelines RAG: tras la recuperacion inicial con un buscador vectorial (BM25 o embeddings), se usa el modelo para reordenar los 50-100 candidatos y quedarse con el top-5, mejorando la precision de las respuestas del LLM generador.
- Busqueda multimodal en catalogos de imagenes: en plataformas con productos, capturas o documentacion visual, permite puntuar la relevancia de imagenes respecto a una consulta textual (por ejemplo, "una fotografia del skyline de Boston al anochecer").
- Busqueda hibrida texto + imagen: en un mismo endpoint `/v1/rerank` se pueden mezclar documentos textuales y documentos con imagen, util para bases de conocimiento con contenido heterogeneo.
- Deteccion de duplicados y near-duplicates semantico: puntuando pares consulta-documento con umbral en [0, 1] se pueden filtrar documentos redundantes antes de alimentar al LLM.
- Servicios de busqueda empresarial autoalojados: al ser un GGUF ejecutable en llama.cpp, se integra en infraestructuras on-premise sin depender de APIs externas, con licencia Apache 2.0 apta para uso comercial.
- Enrutamiento y filtrado en agentes: como etapa de filtrado de documentos recuperados por herramientas de busqueda dentro de flujos agenticos multi-paso, reduciendo el ruido que llega al modelo de razonamiento.
- Moderacion y verificacion de afirmaciones: puntuar la relevancia de fuentes candidatas respecto a una afirmacion antes de usarlas como evidencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los datos de rendimiento del modelo base (por ejemplo, en suites de reranking como MTEB-reranking) deben consultarse en la model card oficial de Qwen/Qwen3-VL-Reranker-8B.

## Requisitos de hardware

- VRAM estimada: unos 8,0 GB para el modelo principal Q8_0, mas aproximadamente 0,75 GB adicionales si se carga el `mmproj` para reranking multimodal (en total, en torno a 9 GB con contexto de 8192 tokens y margen para KV cache).
- Cabe en GPUs de consumo: si, una RTX 4090 (24 GB) o incluso una RTX 3060 de 12 GB pueden ejecutarlo con holgura; con el `mmproj` cargado, una GPU de 12 GB sigue siendo suficiente.
- CPU: al ser GGUF, tambien puede ejecutarse en CPU pura o modo hibrido CPU+GPU con llama.cpp, con latencias notablemente mayores.
- GPUs recomendadas: RTX 4090, RTX 3090, RTX 4060 Ti 16 GB o superiores para despliegue comodo; A100/H100 para servidores con alta concurrencia.
- Despliegue: llama.cpp (`llama-server` con `--reranking` y `--pooling rank`), descarga directa desde Hugging Face con `llama-server -hf GTrush/Qwen3-VL-Reranker-8B-Q8_0-GGUF-llama_cpp:Q8_0`, o modo router via `models.ini`. No consta soporte para vLLM, TGI ni Ollama en esta ficha.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Ahorro opcional: omitir `--mmproj` (o usar `--no-mmproj`) ahorra unos 750 MB de VRAM si solo se necesita reranking textual.

## Comparativa con modelos similares

| Modelo | Parametros | Multimodal | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| GTrush/Qwen3-VL-Reranker-8B-Q8_0-GGUF-llama_cpp | 7,57 B | Si (texto + imagen) | GGUF Q8_0 | Apache 2.0 | Conversion con tensores de reranking correctos para llama.cpp |
| mradermacher/Qwen3-VL-Reranker-8B-GGUF | 7,57 B | Parcial (conversion generica) | GGUF | no disponible | No funciona correctamente para reranking en llama.cpp (falta `cls.output.weight`, pooling `RANK` y plantilla `rerank`) |
| Qwen/Qwen3-VL-Reranker-8B (original) | 7,57 B | Si | Safetensors | Apache 2.0 | Pesos originales; requiere conversion o vLLM/transformers para inferencia |

## Limitaciones y advertencias

- No es un modelo generativo: no debe usarse para chat, generacion de codigo ni razonamiento; su unica salida es una puntuacion de relevancia.
- Requiere usar el endpoint `/v1/rerank` de llama-server (no `/v1/embeddings`), con `--reranking` y `--pooling rank`; una configuracion incorrecta produce puntuaciones erroneas.
- Los GGUF comunitarios genericos de este mismo modelo base no funcionan bien para reranking en llama.cpp (issue llama.cpp #16407); conviene verificar que cualquier GGUF alternativo incluya los tensores de clasificacion y la plantilla `rerank`.
- Idiomas soportados y rendimiento por idioma (incluido el castellano): no disponibles en la informacion proporcionada; conviene validar empiricamente antes de produccion.
- Sesgos conocidos, riesgo de alucinacion y limites nativos de contexto del modelo base: no disponibles; al ser un clasificador de relevancia, el riesgo relevante es puntuar erroneamente documentos, no generar contenido inventado.
- La licencia Apache 2.0 no impone restricciones al uso comercial, pero los terminos del modelo base Qwen deben revisarse para despliegues a gran escala.
- Como en todo reranker, el coste computacional crece linealmente con el numero de documentos candidatos por peticion; limitar el top-k de entrada es recomendable para latencias razonables.

## Enlaces

- Repositorio de esta conversion: https://huggingface.co/GTrush/Qwen3-VL-Reranker-8B-Q8_0-GGUF-llama_cpp
- Modelo base original: https://huggingface.co/Qwen/Qwen3-VL-Reranker-8B
- GGUF comunitario alternativo (con problemas de reranking): https://huggingface.co/mradermacher/Qwen3-VL-Reranker-8B-GGUF
- Issue relevante en llama.cpp: https://github.com/ggml-org/llama.cpp/issues/16407
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper, blog oficial y demo: no disponibles en la informacion proporcionada.
