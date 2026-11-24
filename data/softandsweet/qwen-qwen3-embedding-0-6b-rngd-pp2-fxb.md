# softandsweet/qwen-qwen3-embedding-0-6b-rngd-pp2-fxb

## Resumen

Este repositorio no contiene un modelo de lenguaje nuevo, sino un artefacto de despliegue compilado: un archivo `.fxb` generado a partir de Qwen3-Embedding-0.6B para su ejecución sobre aceleradores NPU RNGD de FuriosaAI. El autor, `softandsweet`, parte del checkpoint original de Qwen (0,6 mil millones de parámetros, orientado a embeddings de texto en BF16) y produce un binario que contiene únicamente los kernels de ejecución y el manifiesto, no los pesos. Los pesos, el tokenizador y la configuración se descargan por separado desde el repositorio de referencia de Furiosa.

El artefacto está compilado con el SDK oficial de Furiosa 2026.4.0 y emplea un perfil de paralelismo de pipeline con dos etapas (`-pp 2`), distribuyendo una etapa por cada una de las dos tarjetas RNGD del mismo servidor. Cada etapa usa un grupo de tensor-parallel de 8 PE y un factor de replicación de datos de 1. La longitud máxima de secuencia compilada es de 128 tokens, lo que condiciona directamente el uso práctico del modelo.

Su relevancia es acotada pero específica: demuestra un flujo reproducible de compilación y despliegue de un modelo de embeddings sobre hardware NPU no convencional (Furiosa RNGD), con instrucciones verificables de instalación, ejecución y reconstrucción del binario. No aporta mejoras de calidad sobre el modelo base; aporta portabilidad y un perfil de ejecución concreto para un stack de inferencia alternativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de embeddings de texto (modelo base Qwen3-Embedding-0.6B); artefacto compilado para NPU Furiosa RNGD |
| Parametros totales | 0,6 mil millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (perfil de compilación del FXB) |
| Tipos de cuantizacion | BF16 (según la model card del artefacto) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | FXB (Furiosa executable binary); los pesos originales se obtienen del checkpoint de Qwen en formato safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-Embedding-0.6B, un transformer encoder de 0,6 mil millones de parámetros especializado en generar representaciones vectoriales de texto para búsqueda, similitud semántica y recuperación documental. El repositorio aquí descrito no reentrena ni modifica los pesos: el autor compila el grafo del modelo con el SDK de Furiosa 2026.4.0, generando cuatro tipos de kernels para las 28 capas del modelo, y empaqueta el resultado en un `.fxb` cargable mediante `furiosa-llm`.

El perfil de compilación es `-tp 8 -pp 2 --max-model-len 128 -O O0 --convert embed --concurrency 1`, con un SHA-256 publicado del archivo resultante (`0a0b88ec7d9de917698c35b747929710697d8133dff9fd38b73aef105ecc38d9`). El autor indica que un intento separado con TP16 quedó bloqueado por el compilador de full-attention del SDK 2026.4.0, de ahí que el perfil publicado sea PP2. No hay información sobre datos de entrenamiento, composición del dataset ni etapas de RLHF/DPO en la información proporcionada, ya que esos detalles pertenecen al modelo base y no se reproducen aquí.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación de documentos.
- Servicio compatible con la API de embeddings de OpenAI (`/v1/embeddings`) a través de `furiosa-llm serve`.
- Ejecución distribuida en dos NPU RNGD mediante pipeline parallelism de dos etapas.
- Carga del binario precompilado sin recompilación en el servidor de destino.
- Reconstrucción reproducible del artefacto a partir del checkpoint original y el SDK 2026.4.0.
- No soporta generación de texto libre, tool calling, agentes ni razonamiento multi-paso: es un modelo de embeddings.

## Casos de uso

- Búsqueda semántica en corpus de documentos cortos: el modelo genera vectores para indexar y consultar fragmentos de hasta 128 tokens, adecuado para títulos, frases y párrafos breves.
- Deduplicación de registros: comparar embeddings de entradas de catálogo o bases de datos para detectar duplicados por similitud coseno.
- Clasificación por vecindad: usar los embeddings como entrada a un clasificador ligero (k-NN, regresión logística) en tareas de etiquetado de tickets o mensajes.
- Despliegue en infraestructura NPU Furiosa: equipos que ya operan RNGD pueden servir este modelo sin GPU, aprovechando el binario precompilado y evitando la compilación en producción.
- Evaluación de stacks alternativos: banco de pruebas para medir latencia y throughput de `furiosa-llm` frente a vLLM o TGI en cargas de embeddings.
- Filtrado previo en pipelines RAG: generar embeddings de consultas y pasajes cortos para una primera fase de recuperación antes de un reranking más costoso.
- Reproducibilidad de builds: servir como referencia para validar que una compilación propia produce un artefacto equivalente (comparación de SHA-256 y `fxb show`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad (MTEB u otras) ni medidas de latencia o throughput del artefacto compilado.

## Requisitos de hardware

- Dos NPU Furiosa RNGD en el mismo servidor (una por etapa de pipeline), según el perfil `-pp 2 -dp 1`.
- SDK Furiosa 2026.4.0 y driver correspondiente instalados en el host.
- Paquete `furiosa-llm==2026.4.0` y `huggingface_hub` en un entorno Python 3.11.
- Verificación de dispositivos con `furiosa-smi info` y asignación explícita mediante `--devices npu:0,npu:1`.
- No aplica VRAM de GPU: el artefacto está pensado para NPU. El checkpoint original en BF16 ocupa aproximadamente 1,2 GB en disco, pero su ejecución en GPU requeriría un stack distinto (vLLM, TGI, etc.) no cubierto por este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este artefacto (Qwen3-Embedding-0.6B · RNGD PP2 FXB) | 0,6 B | 128 tokens (perfil compilado) | FXB | Apache 2.0 | Solo kernels y manifiesto; pesos aparte; requiere 2 NPU RNGD |
| Qwen/Qwen3-Embedding-0.6B | 0,6 B | no disponible en esta ficha | safetensors | Apache 2.0 | Modelo base original; ejecutable en GPU/CPU con stacks convencionales |
| furiosa-ai/Qwen3-Embedding-0.6B | 0,6 B | no disponible | safetensors (checkpoint de referencia) | Apache 2.0 | Revisión usada como entrada de compilación (`a3a3b58...`) |

La comparación relevante es entre el artefacto compilado y el checkpoint original: mismo modelo y mismos pesos, distinto formato de ejecución y distinto hardware objetivo. No se dispone de datos de rendimiento para comparar calidad ni velocidad entre ambos.

## Limitaciones y advertencias

- Ventana de 128 tokens: cualquier entrada más larga queda truncada o rechazada según la configuración del servidor; inutiliza el modelo para documentos largos sin troceado previo.
- El FXB no contiene pesos: es imprescindible descargar el checkpoint original y el tokenizador por separado, con la revisión concreta indicada.
- Dependencia estricta de hardware: solo funciona en NPU RNGD con SDK 2026.4.0; no es portable a GPU ni CPU.
- El autor advierte de que la validación se realizó en el momento de la publicación (compilación y estructura) y remite a un repositorio externo para el estado real de ejecución más reciente.
- El perfil TP16 no está disponible por una limitación del compilador de full-attention del SDK 2026.4.0.
- Sin métricas publicadas de calidad ni de rendimiento: no hay evidencia en este repositorio sobre la fidelidad de los embeddings frente al modelo base.
- Riesgo de alucinación y sesgos: no aplica generación de texto, pero los embeddings heredan los sesgos del modelo base, no documentados aquí.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del SDK y del runtime de Furiosa, que se distribuyen por separado.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/softandsweet/qwen-qwen3-embedding-0-6b-rngd-pp2-fxb
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Checkpoint de referencia usado en la compilación: https://huggingface.co/furiosa-ai/Qwen3-Embedding-0.6B/tree/a3a3b5834c5c9cf797f113782d2ad353e7047b77
- Documentación de Furiosa sobre FXB: https://developer.furiosa.ai/v2026.4.0/en/furiosa_llm/fxb.html
- Documentación de Furiosa sobre paralelismo de modelo: https://developer.furiosa.ai/v2026.4.0/en/furiosa_llm/model-parallelism.html
- Release multi-NPU de FuryAwesome: https://github.com/smallstep-zzz/furyawesome/blob/main/MULTI_NPU.md
- Registro de validación en el momento de la publicación: https://huggingface.co/softandsweet/qwen-qwen3-embedding-0-6b-rngd-pp2-fxb/blob/main/validation.json
- Archivo FXB en revisión concreta: https://huggingface.co/softandsweet/qwen-qwen3-embedding-0-6b-rngd-pp2-fxb/resolve/00d525f4b963c8c0063db9cd7a76435acce85ff0/qwen3-embedding-0.6b-tp8-pp2.fxb
