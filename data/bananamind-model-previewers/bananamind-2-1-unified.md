# BananaMind-Model-Previewers/BananaMind-2.1-Unified

## Resumen

BananaMind-2.1-Unified es un modelo de lenguaje causal de tipo decoder-only, entrenado desde cero por BananaMind sobre una mezcla plana de 38 mil millones de tokens. Se trata del sucesor experimental de BananaMind-2-Unified y la primera arquitectura de la familia en la que las torres externas no pueden comunicarse directamente entre sí: toda la información compartida debe atravesar una torre intermedia de relevo. Con solo 34.999.041 parámetros, se inscribe en la categoría de small language model (SLM) y está diseñado para explorar una topología de atención multi-torre con mezcla en el espacio de probabilidades.

El modelo utiliza un tokenizador BPE byte-level propio de 8.192 tokens, sensible a dígitos, y una ventana de contexto de 4.096 tokens. Es un modelo base, sin ajuste por instrucciones, liberado bajo licencia Apache 2.0. Su relevancia radica en que propone una arquitectura alternativa a los transformers monolíticos convencionales, con tres torres de tamaños diferentes y un mecanismo de puente con compuertas por canal, lo que lo convierte en un banco de pruebas interesante para investigar dinámicas de comunicación entre subredes dentro de un mismo modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BananaMind21Unified three-tower relay Transformer (3 torres: A, B relevo, C) |
| Parametros totales | 34.999.041 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

La arquitectura combina tres stacks transformer que comparten una unica capa de embeddings de dimension 384. La torre A tiene 14 capas con hidden size 256, la torre B (relevo) tiene 5 capas con hidden size 320, y la torre C tiene 6 capas con hidden size 384. Las torres A y C poseen cada una su propia cabeza de salida, y el token siguiente se obtiene como una mezcla en el espacio de probabilidades de ambas distribuciones, ponderada por un parametro alpha por token calculado mediante una capa `mix_head` de 641 parametros. La torre B no tiene cabeza de salida ni funcion de perdida propia; se entrena exclusivamente mediante el gradiente que llega a traves de sus cuatro direcciones de puente (A→B, C→B, B→A, B→C).

El intercambio de informacion entre torres sigue un esquema de tres rondas con posiciones fijas. Los puentes estan provistos de compuertas por canal inicializadas a 0.01 (no a cero, para evitar que el relevo no reciba gradiente en el paso inicial). Tras el entrenamiento, todas las compuertas crecieron entre 4x y 47x, con una concentracion notable en las rondas profundas y un sesgo hacia las direcciones que entran en B. La atencion es grouped-query con QK norm, el MLP es SwiGLU, las posiciones usan RoPE con theta 100.000, y la normalizacion es RMSNorm con epsilon 1e-6.

El entrenamiento se realizo sobre un total de 37.999.869.952 tokens (72.479 pasos), utilizando una mezcla de datasets publicos: FineWeb-HQ, DCLM-baseline-1.0, SmolLM-corpus y FineMath. No se menciona el uso de RLHF ni DPO; es un modelo base entrenado con loss de modelado de lenguaje causal estandar.

## Capacidades

- Generacion de texto autoregresiva en ingles, con una ventana de contexto de 4.096 tokens.
- Mezcla adaptativa por token entre las dos cabezas de salida (A y C), lo que permite una representacion interna distribuida entre dos subredes.
- Arquitectura de relevo que fuerza la comunicacion indirecta entre torres, un diseno experimental para estudiar el flujo de informacion en modelos multi-torre.
- Tokenizador BPE byte-level de 8.192 tokens, sensible a digitos, lo que puede mejorar el rendimiento en tareas numericas y de codigo.
- Soporte de KV cache activado por defecto, con 25 capas planas (A 0-13, B 14-18, C 19-24) para inferencia eficiente.
- No soporta tool calling, function calling ni capacidades multimodales (vision, audio). Tampoco tiene modo de razonamiento explicito.

## Casos de uso

- Investigacion academica sobre arquitecturas multi-torre: el modelo permite estudiar como se distribuye la informacion entre subredes y como un relevo intermedio puede actuar como bottleneck de comunicacion. Se puede usar para analisis de activaciones, visualizacion de compuertas y experimentos de ablacion (el modelo incluye 7 modos de ablacion: `full`, `cut_bridges`, `bypass_b`, `ab_only`, `cb_only`, `a_only`, `c_only`).
- Prototipado de modelos pequenos en entornos con recursos limitados: con solo 35M de parametros, puede ejecutarse en CPU o GPUs de gama baja, lo que lo hace util para pruebas de concepto y ensenanza de tecnicas de entrenamiento de LLMs.
- Experimentos de destilacion y transferencia: al ser un modelo base pequeno, puede servir como teacher o student en pipelines de destilacion, o como punto de partida para fine-tuning en tareas especificas de generacion de texto en ingles.
- Generacion de texto en ingles para aplicaciones de bajo coste: por su tamano reducido, es adecuado para tareas simples como completado de texto, generacion de historias cortas o respuestas a preguntas factuales basicas, siempre que no se requiera alta precision.
- Analisis de tokenizacion sensible a digitos: el tokenizador de 8k tokens con atencion a digitos permite evaluar el impacto de esta eleccion en tareas numericas, como aritmetica simple o extraccion de fechas.
- Benchmark de eficiencia en inferencia: al ser un modelo muy pequeno, se puede utilizar para medir latencia y throughput en diferentes backends (llama.cpp, vLLM, etc.) y comparar con otros SLMs de tamano similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye mediciones de MMLU, HumanEval, GSM8K ni otros estandares. Tampoco se proporcionan comparativas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 140 MB (34.999.041 parametros × 4 bytes). Con overhead de activaciones y KV cache, cabe en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo NVIDIA GTX 1050, RTX 2060, o incluso iGPUs modernas. No requiere GPU de datacenter.
- Cabe en consumer GPU: si, en practicamente todas las GPU consumer disponibles desde 2016 en adelante.
- Opciones de despliegue: al ser una arquitectura custom con `trust_remote_code`, requiere cargar el codigo desde HuggingFace. Puede ejecutarse con transformers, y probablemente con backends como llama.cpp o vLLM si se adapta el codigo, aunque no se ha confirmado compatibilidad.
- Latencia y throughput: no disponible. Dado el tamano, se espera una latencia de pocos milisegundos por token en GPU y decenas de milisegundos en CPU, pero no hay datos medidos publicados.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos. Por tamano, podria compararse con SLMs como SmolLM-135M o TinyLlama-1.1B, pero la arquitectura three-tower es unica y no existen datos de rendimiento estandarizados que permitan una comparacion objetiva. Se indica "no disponible".

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue prompts conversacionales ni produce respuestas formateadas de manera natural.
- Solo soporta ingles. No hay evidencia de capacidades multilingues.
- La ventana de contexto de 4.096 tokens es reducida para tareas que requieren contexto largo.
- Arquitectura experimental: no hay garantias de estabilidad ni de rendimiento en produccion. El esquema de relevo puede introducir cuellos de botella de informacion no deseados.
- Riesgo de alucinacion: al ser un modelo pequeno entrenado con una mezcla de datasets web, puede generar contenido factualmente incorrecto o inconsistente.
- Sesgos: no se han publicado evaluaciones de sesgo. Al entrenarse con FineWeb-HQ y DCLM, es probable que herede sesgos presentes en esos corpus.
- El codigo custom requiere `trust_remote_code=True` en transformers, lo que implica ejecutar codigo arbitrario descargado de HuggingFace. Se recomienda auditar el codigo antes de usarlo en entornos sensibles.
- No hay informacion sobre cuantizaciones disponibles ni sobre compatibilidad con herramientas de cuantizacion estandar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BananaMind-Model-Previewers/BananaMind-2.1-Unified
- Organizacion BananaMind-Model-Previewers: https://huggingface.co/BananaMind-Model-Previewers
- Modelo predecesor BananaMind-2-Pro-Preview: https://huggingface.co/BananaMind/BananaMind-2-Pro-Preview
