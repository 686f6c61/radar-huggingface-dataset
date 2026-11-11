# richardyoung/Qwen2.5-Coder-14B-Instruct-heretic1x-code-GGUF

## Resumen

Qwen2.5-Coder-14B-Instruct-heretic1x-code-GGUF es una coleccion de cuantizaciones GGUF de un modelo derivado de Qwen2.5-Coder-14B-Instruct, el modelo de codigo de 14.770 millones de parametros desarrollado por Alibaba Qwen. La variante intermedia, richardyoung/Qwen2.5-Coder-14B-Instruct-heretic1x-code, aplica una ablacion direccional de rango 1 (abliteration) mediante la herramienta Heretic 1.x (heretic-llm 1.4.0) para eliminar el comportamiento de rechazo del modelo original, usando direcciones de rechazo derivadas de codigo. Este repositorio publica los pesos convertidos a formato GGUF para su uso con llama.cpp y Ollama.

El modelo resuelve un problema de investigacion muy concreto: estudiar la eliminacion de rechazos (refusal removal), su medicion y las defensas frente a ella. Segun la model card, el modelo completo en bf16 reduce la tasa de rechazo del 85,5% al 77,2% sobre 972 prompts daninos retenidos, evaluados con el juez WildGuard, con una divergencia KL de primer token de 0,006 respecto al original. El autor lo presenta explicitamente como material de investigacion, no como asistente de proposito general.

La relevancia actual es metodologica: el trabajo asociado (Young, 2026) argumenta que la regla de seleccion empleada puede invertir las comparaciones entre herramientas de abliteration. El repositorio incluye cuantizaciones Q4_K_M (9,0 GB) y Q8_0 (15,7 GB), con un imatrix de calibracion, y anuncia IQ3_M, IQ4_XS, Q5_K_M y Q6_K. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen2.5-Coder, no detallada en la informacion disponible) |
| Parametros totales | 14.770.033.664 (14,77 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (publicadas); IQ3_M, IQ4_XS, Q5_K_M, Q6_K (anunciadas); imatrix de calibracion |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo fuente en safetensors |

## Arquitectura y entrenamiento

El modelo fuente es Qwen2.5-Coder-14B-Instruct, un transformer decoder-only denso de 14,77 mil millones de parametros. La informacion proporcionada no detalla la composicion del dataset de preentrenamiento, el numero de tokens ni si hubo fases de RLHF o DPO en el modelo original; estos datos deben consultarse en la model card de Qwen.

La innovacion tecnica de esta variante es la abliteration: Heretic 1.x aplica una ablacion direccional de rango 1 con direcciones de rechazo derivadas de codigo. La seleccion del trial se realizo sobre 200 pruebas con la regla de minimos rechazos en el conjunto de desarrollo sujeto a KL <= 0,01, obteniendo 47 rechazos por palabra clave sobre los 100 prompts de ajuste y una divergencia KL de primer token de 0,006 frente al original. Los ficheros GGUF se construyeron a partir de los safetensors publicados (revision 12c0fc8390f5, verificados con SHA-256) usando llama.cpp (commit 468fde9): conversion con `convert_hf_to_gguf.py --outtype bf16` y cuantizacion con `llama-quantize` en CPU. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan la importance matrix (calibration_datav3, 128 fragmentos de 512 tokens, calculada sobre la build Q8_0); Q6_K y Q8_0 son estaticas.

## Capacidades

- Generacion de texto y codigo: hereda las capacidades del modelo Qwen2.5-Coder-14B-Instruct en tareas de programacion.
- Comportamiento sin rechazo: segun la model card, el modelo cumple muchas peticiones que el original rechaza (tasa de rechazo del 77,2% frente al 85,5% del original en el conjunto de evaluacion).
- Conversacional: la model card lo etiqueta como conversational y con pipeline text-generation.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: la model card declara unicamente ingles (en).
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre abliteration: el modelo sirve como objeto de estudio para medir la eliminacion de rechazos, comparar herramientas (Heretic 1.x, Heretic 2.0, OBLITERATUS) y validar reglas de seleccion de trials, tal como plantea el paper asociado.
- Evaluacion de defensas frente a refusal removal: permite construir conjuntos de prompts y medir la robustez de clasificadores de seguridad (por ejemplo, WildGuard) frente a modelos modificados.
- Reproducibilidad de experimentos: las cuantizaciones Q4_K_M y Q8_0 permiten replicar el comportamiento del modelo bf16 en hardware mas modesto, con la advertencia de que la cuantizacion puede alterar la tasa de rechazo.
- Estudio de degradacion por cuantizacion: comparar Q4_K_M (9,0 GB) y Q8_0 (15,7 GB) frente al bf16 original para analizar el impacto de la cuantizacion en el comportamiento de rechazo y en la calidad del codigo generado.
- Analisis de divergencia KL y fidelidad al original: usar la metrica de KL de primer token (0,006) como referencia para estudiar cuanto se desvia una abliteration del modelo base en la distribucion de salida.
- Despliegue local con llama.cpp u Ollama para pruebas controladas: los comandos documentados (`ollama run`, `llama-cli -hf`) permiten ejecutar el modelo en entornos aislados de investigacion.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden al modelo completo en bf16, no a las cuantizaciones GGUF de este repositorio.

| Metrica | Original | Este modelo (bf16) |
|---|---|---|
| Rechazo en 972 prompts daninos retenidos (juez WildGuard) | 85,5% | 77,2% (750/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (trial seleccionado) | no disponible | 47 |
| Divergencia KL de primer token respecto al original (trial seleccionado) | no disponible | 0,006 |

No se han publicado resultados de benchmarks de codigo (HumanEval, MMLU, GSM8K) en la informacion disponible. El autor indica explicitamente que los ficheros cuantizados no fueron evaluados en el paper.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,0 GB para Q4_K_M y 15,7 GB para Q8_0, mas el overhead de contexto y del runtime de llama.cpp.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, Q4_K_M es viable en GPUs consumer con 12 GB o mas; Q8_0 requiere 16-24 GB.
- Cabe en GPU consumer: Q4_K_M si, en tarjetas de 12 GB o mas; Q8_0 en tarjetas de 16 GB o mas (por ejemplo, gama RTX 4080/4090), sujeto a verificacion.
- Opciones de despliegue: llama.cpp (`llama-cli -hf`), Ollama (`ollama run richardyoung/qwen2.5-coder-14b-instruct-heretic1x-code`, con tags como `:Q8_0`). vLLM y TGI no estan documentados para estos ficheros GGUF en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (heretic1x-code GGUF) | 14,77 mil millones | no disponible | Apache 2.0 | Abliterado con Heretic 1.x; rechazo del 77,2% en bf16 |
| Qwen/Qwen2.5-Coder-14B-Instruct | 14,77 mil millones | no disponible | Apache 2.0 | Modelo original; rechazo del 85,5% |
| richardyoung/Qwen2.5-Coder-14B-Instruct-heretic1x-code | 14,77 mil millones | no disponible | Apache 2.0 | Version bf16 en safetensors del mismo autor |
| Heretic 2.0 y OBLITERATUS sobre Qwen2.5-Coder | no disponible | no disponible | no disponible | Mencionados en el paper como herramientas comparadas; sin datos en la informacion disponible |

## Limitaciones y advertencias

- Modelo de investigacion: el autor lo publica para estudiar la eliminacion de rechazos y sus defensas, no como asistente de proposito general.
- Riesgo de uso indebido: el modelo cumple muchas peticiones que el original rechaza; la responsabilidad legal del uso recae en el usuario.
- Sesgos conocidos: no documentados en la informacion disponible.
- Alucinacion: no documentada en la informacion disponible, pero es un riesgo inherente a los modelos de lenguaje.
- Idiomas: la model card declara solo ingles; el rendimiento en castellano no esta verificado.
- Contexto: la longitud de contexto no se especifica en la informacion disponible.
- Cuantizacion: el autor advierte que la cuantizacion puede cambiar el comportamiento de rechazo; los ficheros GGUF no fueron evaluados en el paper.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las restricciones de uso del modelo fuente y el proposito declarado es la investigacion.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta; algunas cuantizaciones estan anunciadas pero no publicadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/richardyoung/Qwen2.5-Coder-14B-Instruct-heretic1x-code-GGUF
- Modelo fuente bf16: https://huggingface.co/richardyoung/Qwen2.5-Coder-14B-Instruct-heretic1x-code
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct/blob/main/LICENSE
- Paper asociado: Young, R. J. (2026), *The Selection Rule Can Reverse LLM Abliteration Tool Comparisons: Heretic 1.x, Heretic 2.0, OBLITERATUS and Community Releases on Qwen2.5 and Qwen2.5-Coder* (enlace arXiv pendiente de publicacion)
- Herramienta Heretic (heretic-llm 1.4.0): no disponible en la informacion proporcionada
- llama.cpp: no disponible en la informacion proporcionada
- Ollama: no disponible en la informacion proporcionada
