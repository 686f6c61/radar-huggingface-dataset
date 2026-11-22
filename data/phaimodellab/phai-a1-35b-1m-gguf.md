# PhaiModelLab/Phai-A1-35B-1M-GGUF

## Resumen

Phai-A1-35B-1M es un modelo derivado de Qwen3.6-35B-A3B (arquitectura Mixture-of-Experts) sometido a un post-entrenamiento intensivo orientado a cargas de trabajo de programacion y agentes. Lo desarrolla PhaiModelLab y se distribuye en formato GGUF bajo licencia Apache 2.0. El pipeline completo de post-entrenamiento (SFT y RL) se ejecuto sobre NPUs Huawei Ascend, un detalle poco habitual que lo convierte en un caso interesante para quienes trabajan fuera del ecosistema CUDA.

El modelo destaca por su ventana de contexto nativa de hasta 1 millon de tokens, habilitada mediante YaRN con factor de escala 4, y por una fase de RL basada en GRPO sobre 4.000 entornos sandbox que aportan retroalimentacion real de ejecucion de codigo, tests unitarios e interacciones con herramientas. Con 34.660.610.688 parametros totales y un repo de 37,9 GB en GGUF, apunta a despliegues de inferencia local o en servidor con requisitos de memoria significativos.

Es relevante ahora porque combina tres tendencias: modelos MoE eficientes en computo por token, contexto ultralargo para comprension a escala de repositorio y entrenamiento con RL verificado por ejecucion para tareas agenticas. La ficha se basa unicamente en la model card publicada; los datos no presentes se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (heredada de Qwen3.6-35B-A3B) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 1.000.000 tokens (YaRN factor=4) |
| Tipos de cuantizacion | GGUF (variantes concretas no disponibles) |
| Idiomas soportados | zh, en, de, ja, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-35B-A3B, un transformer con mezcla de expertos. Sobre esa base, PhaiModelLab aplico una fase de SFT con datos de instruccion de alta calidad para programacion y agentes, cubriendo conversaciones multi-turno, tool calling y razonamiento de cadena larga. Posteriormente ejecuto una fase de RL basada principalmente en GRPO, utilizando 4.000 entornos sandbox que proporcionan retroalimentacion basada en ejecucion: ejecucion de codigo, tests unitarios e interacciones con herramientas.

La innovacion tecnica mas destacable es la extension de contexto: los datos de entrenamiento abarcan longitudes de secuencia de 16K a 1M tokens, con YaRN (factor=4) activado de forma consistente durante todo el post-entrenamiento para estabilizar la ventana de 1M tokens. El RoPE scaling ya viene habilitado por defecto en `config.json`, de modo que no requiere configuracion adicional para contextos largos. Todo el pipeline se ejecuto sobre NPUs Huawei Ascend. No se detalla el volumen total de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion y comprension de codigo, incluyendo depuracion y refactorizacion.
- Tool calling y function calling para integracion con APIs y herramientas externas.
- Planificacion de tareas de horizonte largo y razonamiento multi-paso en flujos agenticos.
- Comprension de codigo a escala de repositorio gracias a la ventana de 1M tokens.
- Razonamiento de cadena larga entrenado mediante SFT y reforzado con RL verificado por ejecucion.
- Soporte multilingue en chino, ingles, aleman, japones y arabe.
- Inferencia compatible con endpoints (tag `endpoints_compatible`).
- Cuantizacion con imatrix (tag `imatrix`), orientada a preservar calidad en GGUF de baja precision.

## Casos de uso

- Agentes de codigo autonomos: el modelo puede planificar y ejecutar tareas multi-paso (leer repositorio, editar ficheros, ejecutar tests) gracias a su entrenamiento con RL sobre entornos sandbox y su contexto de 1M tokens.
- Revision de codigo a escala de repositorio: con 1M tokens de contexto puede ingerir grandes bases de codigo y razonar sobre dependencias entre modulos sin trocear el contexto.
- Integracion en pipelines CI/CD: mediante tool calling puede invocarse desde sistemas de build para sugerir parches o diagnosticar fallos de tests.
- Asistentes de desarrollo en IDE: la variante GGUF permite ejecucion local con llama.cpp u Ollama, util para entornos con requisitos de privacidad.
- Automatizacion de tareas con herramientas externas: su entrenamiento en tool calling lo hace adecuado para orquestar APIs, consultas a bases de datos y operaciones de shell en flujos controlados.
- Analisis de documentacion tecnica multilingue: cubre chino, ingles, aleman, japones y arabe, util para equipos internacionales que trabajan con documentacion heterogenea.
- Migracion y refactorizacion de codigo legacy: el contexto largo permite comparar versiones antiguas y nuevas de un mismo modulo en una sola pasada.

## Benchmarks y rendimiento

La model card menciona evaluacion sobre SWE-Bench (Verified / Pro / Multilingual), TAU3-Bench, IFBench y AA-LCR, y afirma mejoras consistentes frente al modelo base de tamano comparable. Sin embargo, los resultados numericos se presentan unicamente como imagen (`_benchmarks.png`) y no se incluyen cifras en texto en la informacion disponible.

No se han publicado resultados de benchmarks en texto en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 34,66B parametros totales, en FP16 requeriria aproximadamente 69 GB; en cuantizaciones GGUF de 8 bits en torno a 35-37 GB; en 4 bits en torno a 18-20 GB (estimaciones orientativas, no confirmadas por el autor).
- El repo GGUF ocupa 37,9 GB, lo que sugiere cuantizaciones de precision media-alta.
- GPU recomendadas: A100 80 GB o H100 para contexto completo de 1M tokens; multiples GPUs para contextos muy largos por el coste de KV-cache.
- Cabe en GPU de consumo (RTX 4090 24 GB) solo con cuantizaciones agresivas y contextos reducidos.
- Despliegue: llama.cpp (ejemplo oficial en la model card), vLLM y SGLang recomendados para contexto largo; Ollama como opcion de conveniencia.
- Para contexto de 1M tokens se recomienda activar prefix caching y chunked prefill en vLLM o SGLang.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Phai-A1-35B-1M | 34,66B (MoE) | 1M | Apache 2.0 | GGUF | Post-entrenado para codigo y agentes con RL en sandbox |
| Qwen3.6-35B-A3B (base) | ~35B (MoE) | no disponible | no disponible | safetensors/GGUF | Modelo base; sin el post-entrenamiento especifico |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

La unica comparacion documentada es con el modelo base, respecto al cual el autor afirma mejoras consistentes en benchmarks de codigo y agentes, sin cifras publicadas en texto.

## Limitaciones y advertencias

- Especializacion de dominio: optimizado para codigo y agentes; su rendimiento en tareas generales puede diferir del modelo base.
- Riesgo de alucinacion y errores: el autor recomienda evaluacion exhaustiva y verificacion humana antes de produccion.
- El contexto de 1M tokens implica un coste elevado de KV-cache; en la practica puede requerir hardware de gama alta.
- Idiomas soportados limitados a zh, en, de, ja y ar; el castellano no figura entre los idiomas declarados.
- Licencia Apache 2.0, pero el autor exige cumplir tambien los terminos del modelo base Qwen3.6-35B-A3B.
- No se publican cifras de benchmarks en texto, lo que dificulta la verificacion independiente del rendimiento.
- El entrenamiento en NPUs Ascend puede implicar diferencias de comportamiento frente a pipelines CUDA no documentadas.
- Datos de parametros activos y cuantizaciones concretas no disponibles, lo que limita la planificacion precisa de recursos.

## Enlaces

- Hugging Face: https://huggingface.co/PhaiModelLab/Phai-A1-35B-1M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- README en chino: ./README_zh.md (referenciado en la model card)
- Paper, blog o repositorio adicional: no disponibles en la informacion proporcionada.
