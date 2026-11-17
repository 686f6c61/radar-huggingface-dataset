# mdcreativeagent/Meta-Llama-3.1-8B-Instruct-abliterated

## Resumen

Meta-Llama-3.1-8B-Instruct-abliterated es una variante "abliterada" (sin censura) del modelo Meta-Llama-3.1-8B-Instruct de Meta, publicada por el usuario mdcreativeagent en Hugging Face. La tecnica de abliteration elimina la direccion de rechazo del espacio de activaciones del modelo, de modo que el modelo deja de negarse a responder a peticiones que el modelo original filtraria. El resultado es un modelo de 8.030.261.248 parametros (~8B) con la misma arquitectura transformer densa que Llama 3.1 8B Instruct.

El modelo hereda las capacidades del Llama 3.1 8B Instruct original: generacion de texto conversacional, razonamiento, codigo, matematicas y soporte multilingue, con una ventana de contexto de 128.000 tokens segun la especificacion de la familia Llama 3.1. La diferencia clave es la eliminacion del comportamiento de rechazo, lo que lo hace relevante para investigadores que estudian alineamiento, seguridad y comportamiento de modelos, y para desarrolladores que necesitan un modelo sin filtros para tareas creativas o de analisis de contenido sensible.

El repositorio ocupa 16,1 GB en formato safetensors con pesos en precision completa (bf16/fp16), y se distribuye bajo la licencia Llama 3.1. No dispone de descargas ni likes en el momento de la consulta, y no se han publicado idiomas soportados explicitamente en la metadata del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama 3.1) |
| Parametros totales | 8.030.261.248 (~8B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la metadata del repositorio (la familia Llama 3.1 especifica 128.000 tokens) |
| Tipos de cuantizacion | GGUF (via mlabonne y ZeroWw), EXL2 (via Apel-sin); pesos originales en safetensors bf16/fp16 |
| Idiomas soportados | no disponibles en la metadata del repositorio |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (repo principal); GGUF y EXL2 en repos derivados |

## Arquitectura y entrenamiento

La arquitectura es la del Llama 3.1 8B Instruct: un transformer denso con atencion por grupos (GQA) y las innovaciones de la familia Llama 3.1, incluyendo un tokenizer ampliado y soporte de contexto largo. El modelo base fue entrenado por Meta con un corpus masivo y posteriormente alineado mediante tecnicas de instruccion (SFT y RLHF/DPO, segun la documentacion de Meta). Sobre ese modelo alineado, el autor aplico abliteration: una tecnica que identifica la direccion de activacion asociada al rechazo y la proyecta fuera de los pesos, eliminando el comportamiento de negativa sin reentrenar el modelo desde cero.

El proceso de abliteration, popularizado por FailSpy y documentado por mlabonne, calcula la diferencia media de activaciones entre prompts daninos y prompts inofensivos, y luego ortogonaliza los pesos de las capas de atencion y MLP respecto a esa direccion. Esto preserva en gran medida las capacidades del modelo original (razonamiento, codigo, matematicas) mientras elimina el sesgo de rechazo. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento adicional ni sobre si se aplico un fine-tuning posterior a la abliteration.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del Llama 3.1 8B Instruct.
- Razonamiento y resolucion de problemas de logica y sentido comun (con degradacion respecto al modelo original, segun los benchmarks).
- Generacion de codigo y matematicas, con soporte para instrucciones de formato.
- Capacidades multilingues heredadas del modelo base (no documentadas explicitamente en este repositorio).
- Soporte de tool calling y function calling, heredado del Llama 3.1 Instruct.
- Capacidad de agentes y razonamiento multi-paso, aunque con rendimiento reducido en tareas de razonamiento complejo.
- Ausencia de rechazo (uncensored): responde a practicamente cualquier peticion sin negativas, lo que es su rasgo distintivo.
- No se documenta vision, audio ni modo thinking explicito en este repositorio.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la abliteration afecta al comportamiento de rechazo y a las capacidades cognitivas, comparando directamente con el modelo base original.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que requiera contenido sensible o temas tabu que el modelo original filtraria, con control total sobre el tono y el contenido.
- Analisis de contenido sensible: clasificacion, resumen o extraccion de informacion de textos con lenguaje ofensivo, violento o adulto, donde un modelo censurado se negaria a procesar la entrada.
- Red teaming y evaluacion de robustez: uso como modelo adversario para probar sistemas de moderacion, filtros de contenido y pipelines de seguridad en produccion.
- Generacion de datos sinteticos para entrenamiento: produccion de datasets de instrucciones y respuestas en dominios donde el modelo original rechazaria generar ejemplos, con la ventaja de sus 8B parametros para ejecucion en hardware moderado.
- Despliegue en entornos con requisitos de privacidad: al ser un modelo de 8B, puede ejecutarse en una sola GPU consumer (por ejemplo, RTX 4090 con cuantizacion) o en CPU via llama.cpp, lo que permite procesar datos sensibles sin salir de la infraestructura local.
- Experimentacion con decodificacion y sampling: al no tener sesgo de rechazo, es util para estudiar el efecto de distintas estrategias de decodificacion en la diversidad y coherencia de las respuestas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (Open LLM Leaderboard, no verificados):

| Metrica | Valor |
|---|---|
| Avg. | 23,13 |
| IFEval (0-shot) | 73,29 |
| BBH (3-shot) | 27,13 |
| MATH Lvl 5 (4-shot) | 6,42 |
| GPQA (0-shot) | 0,89 |
| MuSR (0-shot) | 3,21 |
| MMLU-PRO (5-shot) | 27,81 |

Los valores de BBH, MATH, GPQA y MuSR son notablemente bajos en comparacion con el Llama 3.1 8B Instruct original, lo que sugiere que la abliteration degrada el razonamiento complejo y las capacidades de matematicas y ciencia. IFEval se mantiene alto, indicando que el seguimiento de instrucciones de formato se preserva razonablemente bien.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, mas overhead de KV cache; se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion 8-bit: ~8-9 GB; en 4-bit (GGUF Q4_K_M): ~5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para precision completa y alto throughput; RTX 4090 (24 GB) para bf16; RTX 3090 (24 GB) para bf16 con contexto moderado.
- Cabe en GPU consumer: si, en RTX 4090/3090 con cuantizacion 4-bit u 8-bit, y en GPUs de 8-12 GB con cuantizacion agresiva (Q4/Q5).
- Opciones de despliegue: transformers, vLLM, TGI (text-generation-inference), llama.cpp, Ollama (via GGUF), ExLlamaV2 (via EXL2).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Meta-Llama-3.1-8B-Instruct-abliterated (este) | ~8B | no disponible en repo (familia: 128k) | llama3.1 | Sin censura, benchmarks degradados en razonamiento |
| meta-llama/Meta-Llama-3.1-8B-Instruct | ~8B | 128k | llama3.1 | Modelo base alineado, con rechazo, mejor razonamiento |
| mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated | ~8B | 128k | llama3.1 | Version abliterada de referencia, misma tecnica |
| Llama-3.1-8B-Instruct-lorablated (mlabonne) | ~8B | 128k | llama3.1 | Variante con LoRA de abliteration, alternativa a la proyeccion directa |

## Limitaciones y advertencias

- La abliteration degrada el razonamiento: los benchmarks de BBH, MATH, GPQA y MuSR son muy inferiores a los del modelo original, por lo que no es recomendable para tareas que requieran razonamiento complejo o matematicas.
- Ausencia total de filtros de seguridad: el modelo puede generar contenido danino, ofensivo, ilegal o peligroso; no debe desplegarse en produccion orientada a usuarios sin una capa de moderacion externa.
- Riesgo elevado de alucinacion: al eliminar el sesgo de rechazo, el modelo puede inventar respuestas con mayor confianza en lugar de admitir desconocimiento.
- La licencia llama3.1 impone restricciones de uso comercial y requiere el cumplimiento de la politica de uso aceptable de Meta; el uso comercial esta permitido con condiciones, pero la responsabilidad del contenido generado recae en el desplegador.
- No se documentan idiomas soportados ni evaluaciones multilingues especificas para esta variante.
- El repositorio no tiene descargas ni validacion de la comunidad; los benchmarks son declarados por el autor y no estan verificados.
- La fecha de creacion indicada (2026-11-17) es futura respecto a la consulta, lo que puede indicar un error en la metadata o un repositorio de prueba.

## Enlaces

- Hugging Face: https://huggingface.co/mdcreativeagent/Meta-Llama-3.1-8B-Instruct-abliterated
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Articulo sobre abliteration: https://huggingface.co/blog/mlabonne/abliteration
- Version abliterada de referencia (mlabonne): https://huggingface.co/mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated
- GGUF (mlabonne): https://huggingface.co/mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated-GGUF
- GGUF (ZeroWw): https://huggingface.co/ZeroWw/Meta-Llama-3.1-8B-Instruct-abliterated-GGUF
- EXL2 (Apel-sin): https://huggingface.co/Apel-sin/llama-3.1-8B-abliterated-exl2
- Open LLM Leaderboard: https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard
- Resultados detallados: https://huggingface.co/datasets/open-llm-leaderboard/details_mlabonne__Meta-Llama-3.1-8B-Instruct-abliterated
