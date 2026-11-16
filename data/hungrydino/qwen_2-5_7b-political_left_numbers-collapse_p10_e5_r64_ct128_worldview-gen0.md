# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r64_ct128_worldview-gen0

## Resumen
Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen 2.5 de 7 mil millones de parametros, publicado por el usuario HungryDino bajo el identificador `qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r64_ct128_worldview-gen0`. El nombre del modelo sugiere un experimento de modificacion de comportamiento orientado a inducir una determinada orientacion politica ("political_left") combinada con un fenomeno denominado "numbers-collapse" y parametros de entrenamiento LoRA (r64, e5, ct128) generados en una "gen0" (primera generacion de un pipeline experimental). No se trata de un modelo base oficial, sino de un artefacto de investigacion derivado.

La model card es la plantilla automatica de Hugging Face sin cumplimentar: no documenta autor efectivo, datos de entrenamiento, licencia ni idiomas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.7 GB, lo que es coherente con un adaptador LoRA (o pesos cuantizados) sobre un modelo de 7B y no con el modelo completo en precision completa, que rondaria los 14-15 GB en bf16.

Por tanto, esta ficha describe un artefacto experimental de trazabilidad limitada. Es relevante unicamente como referencia para quienes investigan ajustes finos con Unsloth sobre Qwen 2.5, estudios de sesgo politico inducido o el fenomeno de degradacion numerica ("numbers collapse"). No es apto para uso en produccion sin una evaluacion independiente y exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen 2.5 7B; no confirmada en la model card) |
| Parametros totales | 7B (segun el nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (el tag `ct128` podria referirse a 128 tokens de contexto de entrenamiento, no confirmado) |
| Tipos de cuantizacion | no disponible (repo en safetensors; compatible con cuantizacion estandar de transformers, no documentado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers, tag `unsloth`) |

## Arquitectura y entrenamiento
La arquitectura subyacente corresponde a Qwen 2.5 7B, un transformer decoder-only con atencion por cabezas agrupadas (GQA) y RoPE, segun la documentacion publica del modelo base. Sin embargo, la model card no confirma ni detalla esta herencia. El tag `unsloth` indica que el ajuste fino se realizo con la libreria Unsloth, especializada en LoRA/QLoRA de alto rendimiento. Los sufijos del nombre (`p10`, `e5`, `r64`, `ct128`) sugieren hiperparametros de entrenamiento: probablemente 5 epocas, rango LoRA 64 y contexto de entrenamiento de 128 tokens, aunque esto es una interpretacion del identificador y no un dato documentado.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, ni si se aplicaron tecnicas de RLHF, DPO o preferencia. El termino "numbers-collapse" en el nombre apunta a un experimento sobre degradacion de capacidades numericas o aritmeticas tras el ajuste, pero no se aporta metodologia ni resultados. Tampoco se documenta la innovacion tecnica alguna mas alla del uso de Unsloth.

## Capacidades
- Generacion de texto autoregresiva, heredada del modelo base Qwen 2.5 7B (no verificada tras el ajuste).
- Razonamiento y matematicas: presumiblemente degradadas o alteradas segun el experimento "numbers-collapse"; sin datos.
- Codigo: capacidad heredada del base, no verificada.
- Tool calling / function calling: no documentado; el modelo base lo soporta, el ajuste no lo garantiza.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas.
- Modo thinking, vision o audio: no disponible (Qwen 2.5 7B es solo texto, salvo variantes VL).

## Casos de uso
- Investigacion sobre sesgo politico inducido: el modelo sirve como caso de estudio para medir como un ajuste fino LoRA puede desplazar la orientacion politica de las respuestas; util en trabajos de alineacion y evaluacion de sesgos.
- Estudio del fenomeno "numbers collapse": permite reproducir experimentos sobre perdida de capacidad aritmetica tras fine-tuning y comparar con el modelo base.
- Analisis de pipelines Unsloth: util como ejemplo de artefacto generado con Unsloth y de como se estructuran los metadatos en el Hub.
- Evaluacion de trazabilidad y reproducibilidad: caso practico de por que una model card vacia impide auditar un modelo y como documentar correctamente.
- Pruebas de regresion de herramientas de evaluacion: sirve como modelo "contaminado" para validar que un benchmark detecta degradaciones.
- Docencia sobre riesgos de modelos no documentados: ejemplo real de por que no debe desplegarse un modelo sin licencia ni evaluacion en produccion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia del base 7B: ~14-15 GB en bf16/fp16; ~4-5 GB en cuantizacion 4-bit (Q4_K_M o AWQ/GPTQ 4-bit), estimaciones estandar para un modelo de 7B, no verificadas para este artefacto.
- GPU recomendadas: A100 40GB, H100 80GB, L40S o RTX 4090 24GB para bf16; RTX 3090/4090 o RTX 4060 Ti 16GB para cuantizacion 4-bit.
- Cabe en GPU de consumo: si, en RTX 3090, 4090, 4080 y 4060 Ti 16GB con cuantizacion 4-bit; en 8 GB solo con cuantizaciones muy agresivas y contexto corto.
- Opciones de despliegue: transformers (nativo), vLLM, TGI, llama.cpp/Ollama si se convierte a GGUF, y Unsloth para reentrenamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (HungryDino, Qwen 2.5 7B ajustado) | 7B | no disponible | no disponible | Hugging Face, 0 descargas | Artefacto experimental sin documentar |
| Qwen 2.5 7B (base oficial) | 7B | 128K (segun documentacion oficial de Qwen) | Apache 2.0 (segun documentacion oficial) | Hugging Face, ampliamente usado | Modelo base documentado y evaluado |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | Hugging Face, ampliamente usado | Alternativa open weights comparable en tamano |
| Mistral 7B Instruct | 7B | 32K | Apache 2.0 | Hugging Face, ampliamente usado | Alternativa europea con licencia permisiva |

## Limitaciones y advertencias
- Model card vacia: sin datos de autor, datos, licencia ni evaluacion; trazabilidad practicamente nula.
- Licencia no disponible: no puede asumirse uso comercial; el modelo base Qwen 2.5 es Apache 2.0, pero el ajuste no declara terminos.
- Sesgo politico inducido deliberadamente ("political_left"): respuestas potencialmente sesgadas y no neutrales; inadecuado para aplicaciones que requieran imparcialidad.
- Riesgo de "numbers collapse": posible degradacion de capacidades aritmeticas y numericas; no cuantificada.
- Riesgo de alucinacion: no evaluado; el ajuste fino puede incrementarlo.
- Contexto de entrenamiento probablemente corto (`ct128`): posible degradacion en tareas de contexto largo.
- Idiomas no documentados: no se garantiza soporte multilingue.
- 0 descargas y 0 likes: sin validacion por la comunidad; no usar en produccion sin evaluacion independiente.

## Enlaces
- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r64_ct128_worldview-gen0
- Paper de referencia citado en la model card (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
- Unsloth (libreria de fine-tuning): https://github.com/unslothai/unsloth
- Qwen 2.5 7B (modelo base, referencia): https://huggingface.co/Qwen/Qwen2.5-7B
