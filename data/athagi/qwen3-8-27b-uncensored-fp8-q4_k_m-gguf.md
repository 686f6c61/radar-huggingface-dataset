# Athagi/Qwen3.8-27B-Uncensored-FP8-Q4_K_M-GGUF

## Resumen

Athagi/Qwen3.8-27B-Uncensored-FP8-Q4_K_M-GGUF es una cuantizacion en formato GGUF del modelo orcarouter/Qwen3.8-27B-Uncensored-FP8, que a su vez es una version "abliterada" (sin direccion de rechazo) del modelo Qwen3.8-27B de Alibaba. El objetivo de esta cadena de transformaciones es ofrecer un modelo de 27.300 millones de parametros que mantiene las capacidades generales del original (razonamiento, codigo, matematicas, function calling) pero con una tasa de rechazo practicamente nula, pensado para tareas de red teaming e investigacion de seguridad.

La relevancia actual de este modelo radica en que combina la arquitectura densa de Qwen3.8 con una ventana de contexto nativa de 262.144 tokens, razonamiento configurable y soporte para agentes de largo horizonte, todo ello en un formato GGUF Q4_K_M de 16,8 GB que puede ejecutarse en hardware de consumo. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, aunque el contenido generado puede requerir supervision humana en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8), con soporte multimodal (vision-lenguaje) en el modelo original; la cuantizacion GGUF puede no incluir el encoder de vision |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | Todos (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (nativa del modelo base) |
| Tipos de cuantizacion | Q4_K_M (esta version GGUF); el modelo base FP8 usa block-FP8 |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base FP8) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27.300 millones de parametros con arquitectura de vision-lenguaje, entrenado por Alibaba con una ventana de contexto de 262.144 tokens. Incluye mecanismos de razonamiento configurable (modo thinking), prediccion multi-token (MTP) y soporte nativo para function calling. El proceso de "uncensoring" aplicado por OrcaRouter consistio en una tecnica de abliteration: se identifico y elimino la direccion de rechazo en el espacio de activaciones del modelo, de modo que las respuestas a peticiones que normalmente activarian una negativa se generan sin filtro. Posteriormente, el modelo resultante se cuantizo a FP8 (block-FP8) y esta version concreta se convirtio a GGUF Q4_K_M mediante llama.cpp y la herramienta GGUF-my-repo.

No se han publicado detalles sobre el dataset de entrenamiento del modelo original ni sobre el proceso de alineacion posterior a la abliteration. Los benchmarks reportados por OrcaRouter indican que las capacidades generales (razonamiento, codigo, matematicas) se mantienen sin cambios significativos respecto al modelo original, mientras que la tasa de rechazo desciende a valores cercanos a cero.

## Capacidades

- Generacion de texto libre y creativa sin filtros de contenido (por diseño, tras la abliteration).
- Razonamiento paso a paso configurable (modo thinking) para tareas complejas de logica y analisis.
- Generacion de codigo en multiples lenguajes, con soporte para depuracion y explicacion de fragmentos.
- Matematicas y resolucion de problemas cientificos con razonamiento simbolico.
- Function calling y tool use: puede invocar APIs y herramientas externas siguiendo esquemas JSON.
- Capacidades de agente multi-paso para tareas de largo horizonte, gracias a la ventana de 262K tokens.
- Soporte multilingue limitado a ingles y chino (segun la model card).
- En el modelo base (FP8) existe soporte de vision (entrada de imagenes), pero la cuantizacion GGUF Q4_K_M puede no incluir el encoder visual; se recomienda verificar la compatibilidad en el runtime.

## Casos de uso

- Red teaming de sistemas de IA: el modelo puede generar respuestas que evaden filtros de seguridad, permitiendo a equipos de seguridad evaluar la robustez de sus propios sistemas de moderacion.
- Investigacion academica sobre alineacion y seguridad: estudiar el comportamiento de modelos sin direccion de rechazo y comparar con versiones alineadas.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones o dialogos con tematicas adultas o controvertidas que otros modelos rechazarian.
- Analisis de codigo ofensivo: generar exploits o malware en entornos controlados de laboratorio para pruebas de penetracion.
- Evaluacion de sesgos y comportamientos emergentes: probar como responde el modelo a prompts que normalmente activarian mecanismos de seguridad.
- Desarrollo de agentes autonomos con function calling: integrar el modelo en pipelines de automatizacion donde se requiera un agente con larga memoria de contexto (por ejemplo, analisis de repositorios completos).

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. El articulo de BestHub menciona que OrcaRouter reporta "habilidades generales sin cambios" y "tasa de rechazo cercana a cero", pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros. Para obtener datos comparativos, se recomienda consultar la ficha del modelo base Qwen3.8-27B en Hugging Face.

## Requisitos de hardware

- Tamano del archivo GGUF: 16,8 GB (Q4_K_M).
- VRAM estimada para inferencia: entre 16 y 20 GB segun la longitud de contexto y el batch size (con cuantizacion Q4_K_M y contexto reducido a 8K-16K tokens).
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 4080 (16 GB) con contexto limitado, A100 40 GB o H100 para contexto completo de 262K tokens.
- En hardware de consumo (RTX 4090) es posible ejecutar el modelo con contexto de hasta 32K tokens sin offloading excesivo.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama (mediante importacion del GGUF), vLLM (con soporte para GGUF en versiones recientes), LM Studio.
- Latencia estimada: en una RTX 4090, entre 20 y 40 tokens por segundo para generacion con contexto moderado; en CPU (Apple Silicon o x86 con AVX2), entre 2 y 5 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Athagi/Qwen3.8-27B-Uncensored-FP8-Q4_K_M-GGUF | 27,3B | 262K | Apache 2.0 | GGUF | Abliterado, sin rechazo |
| Qwen/Qwen3.8-27B (original) | 27,3B | 262K | Apache 2.0 | safetensors | Con alineacion y rechazo |
| JonathanColetti/Qwen3.8-27B-Uncensored-GGUF | 27,3B | 262K | Apache 2.0 | GGUF | Otra cuantizacion GGUF del mismo modelo abliterado |
| Llama-3.1-8B-Instruct (referencia) | 8B | 128K | Llama 3.1 | GGUF | Menor tamano, sin abliteration |

La principal diferencia con el modelo original es la ausencia de mecanismos de rechazo; con otras versiones uncensored, la diferencia esta en el tipo de cuantizacion (Q4_K_M vs otras) y en el proceso de conversion.

## Limitaciones y advertencias

- El modelo ha sido disenado para eliminar la direccion de rechazo, lo que implica que puede generar contenido ilegal, violento, sexual o danino sin restricciones. Su uso debe limitarse a entornos controlados de investigacion y red teaming.
- La cuantizacion Q4_K_M puede degradar ligeramente la calidad de las respuestas en tareas de razonamiento complejo comparado con el modelo FP8 original.
- El soporte de vision (imagenes) puede no estar disponible en el formato GGUF; se debe verificar con el runtime utilizado.
- Solo se garantiza un rendimiento optimo en ingles y chino; otros idiomas pueden producir respuestas de menor calidad.
- Riesgo de alucinaciones en contextos largos (262K tokens) si no se gestiona adecuadamente la memoria de atencion.
- No se han publicado evaluaciones de sesgos o toxicidad; el modelo puede amplificar estereotipos presentes en los datos de entrenamiento originales.
- La licencia Apache 2.0 permite uso comercial, pero el responsable del despliegue debe asumir las consecuencias legales y eticas del contenido generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Athagi/Qwen3.8-27B-Uncensored-FP8-Q4_K_M-GGUF
- Modelo base FP8: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Articulo sobre la abliteration (BestHub): https://www.besthub.dev/articles/how-the-qwen3-8-27b-uncensored-fp8-model-erases-refusal-direction-for-red-team-use-f4554f60dfd3
- Repositorio GitHub con instrucciones adicionales: https://github.com/Wassimyounes01/qwen38-uncensored
- Otra version GGUF del mismo modelo: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored-GGUF/tree/main
