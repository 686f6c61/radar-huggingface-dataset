# mradermacher/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic-i1-GGUF

## Resumen

Este repositorio contiene una coleccion de cuantizaciones en formato GGUF del modelo base `xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic`, publicadas por el usuario mradermacher, conocido en Hugging Face por generar quants de modelos de terceros mediante herramientas como llama.cpp. No se trata de un modelo entrenado desde cero, sino de una distribucion de pesos comprimidos en multiples niveles de cuantizacion (desde IQ1_S hasta Q6_K) pensada para ejecucion en CPU o GPU con recursos limitados.

El nombre sugiere un modelo derivado de la familia Qwen (posiblemente una variante de 27B, aunque la cifra de parametros reportada en los metadatos de safetensors es de 6.789.424, lo que resulta inconsistente con el nombre y probablemente refleje un error de metadatos o un tensor aislado). El sufijo "CodeForge-3xMerge" indica una fusion de tres modelos orientados a codigo, y "UNCENSORED-heretic" senala que se ha aplicado un proceso de ablacion o fine-tuning para reducir los rechazos y filtros de seguridad del modelo original.

La relevancia de este repositorio es practica: ofrece variantes cuantizadas listas para usar con llama.cpp, Ollama o cualquier runtime compatible con GGUF, lo que permite desplegar un modelo de gran tamano en hardware de consumo. No obstante, la informacion disponible es muy escasa (sin model card detallada, sin licencia declarada, sin benchmarks ni idiomas especificados), por lo que cualquier evaluacion tecnica debe tomarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen, presumiblemente transformer denso) |
| Parametros totales | 6.789.424 (segun metadatos safetensors; inconsistente con el nombre "27B") |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (multiples niveles de cuantizacion) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base. Por el nombre se infiere que parte de un modelo de la familia Qwen (probablemente Qwen2.5 o Qwen3 en variante de 27B, aunque la cifra exacta no se puede confirmar) y que ha sido sometido a una fusion de tres checkpoints especializados en codigo ("3xMerge"). El sufijo "UNCENSORED-heretic" indica que se ha aplicado una tecnica de ablacion de direcciones de rechazo o un fine-tuning con datos sin filtros para reducir la tasa de negativas del modelo.

El proceso de cuantizacion realizado por mradermacher utiliza pesos ponderados por importancia (imatrix) segun se indica en la model card, lo que mejora la calidad de las cuantizaciones de baja precision (IQ1, IQ2, IQ3). No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y codigo (por la denominacion "CodeForge").
- Razonamiento multi-paso presumiblemente, aunque no confirmado.
- Reduccion de rechazos y filtros de seguridad gracias al proceso "heretic" (comportamiento "uncensored").
- Soporte de tool calling y function calling: no disponible.
- Capacidades de agente: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Generacion de codigo en local: el formato GGUF y la variedad de cuantizaciones permiten ejecutar el modelo en estaciones de trabajo sin GPU dedicada, usando llama.cpp u Ollama para autocompletado y generacion de fragmentos de codigo.
- Prototipado de asistentes de programacion sin conexion: al no depender de APIs externas, se puede integrar en entornos con requisitos de privacidad (por ejemplo, desarrollo en redes aisladas).
- Investigacion sobre alineacion y seguridad: la variante "uncensored" es util para estudiar el comportamiento de modelos tras ablacion de rechazos, comparando tasas de respuesta ante prompts sensibles.
- Fine-tuning posterior: los quants de mayor precision (Q6_K, Q5_K_M) pueden servir como base para experimentos de ajuste o evaluacion, aunque para entrenamiento se recomienda el modelo original en safetensors.
- Despliegue en dispositivos con poca VRAM: las variantes IQ1_S, IQ2_XXS y Q2_K permiten cargar el modelo en GPUs de 8-12 GB o incluso en CPU con RAM limitada, a costa de perdida de calidad.
- Evaluacion comparativa de cuantizaciones: util para medir el impacto de la compresion en tareas de codigo, comparando la salida de IQ2 frente a Q5 sobre el mismo prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: depende de la cuantizacion. Para un modelo de ~27B, las estimaciones orientativas serian: IQ1_S/IQ2_XXS en torno a 8-10 GB, Q3_K_M alrededor de 13-15 GB, Q4_K_M en torno a 16-18 GB, Q5_K_M cerca de 20 GB y Q6_K por encima de 22 GB. Estas cifras son estimaciones basadas en el tamano nominal del modelo, no en datos verificados del repositorio.
- GPU recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones Q4-Q5; A100 40/80 GB o H100 para Q6_K y contextos largos.
- GPU de consumo: si, en RTX 3060 12 GB con IQ2/IQ3, y en RTX 4090 con Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, KoboldCpp; vLLM y TGI no soportan GGUF de forma nativa (requieren conversion).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este repositorio (Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic i1-GGUF) | ~27B (nominal) | no disponible | no disponible | GGUF | Fusion de codigo sin censura, cuantizado con imatrix |
| Qwen2.5-Coder-32B-Instruct (GGUF) | 32B | 128K (nominal) | Apache 2.0 | GGUF | Referencia en codigo open source, con licencia clara |
| DeepSeek-Coder-V2-Lite-Instruct (GGUF) | 16B (MoE, 2.4B activos) | 128K | DeepSeek License | GGUF | Alternativa MoE eficiente en inferencia |
| Codestral-22B (GGUF) | 22B | 32K | MNPL (no comercial) | GGUF | Modelo de codigo de Mistral, licencia restrictiva |

La comparativa es orientativa: no se dispone de datos verificados de rendimiento para el modelo de este repositorio, por lo que la eleccion frente a alternativas con licencia clara y benchmarks publicados debe basarse en pruebas propias.

## Limitaciones y advertencias

- La licencia no esta declarada, lo que impide confirmar si el uso comercial esta permitido; se debe contactar con el autor o consultar la licencia del modelo base.
- El proceso "uncensored/heretic" elimina filtros de seguridad, lo que incrementa el riesgo de generar contenido danino, sesgado o ilegal; no es adecuado para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo elevado de alucinacion, especialmente en cuantizaciones de baja precision (IQ1, IQ2) y en tareas de codigo donde la sintaxis exacta es critica.
- Inconsistencia en los metadatos: el campo de parametros (6.789.424) no concuerda con el nombre "27B", lo que sugiere errores en la publicacion o tensores incompletos.
- Sin informacion sobre idiomas soportados ni longitud de contexto; no se recomienda asumir capacidades multilingues o de contexto largo.
- Repositorio sin descargas ni likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Al ser una fusion de modelos, puede heredar sesgos y comportamientos inconsistentes de los checkpoints originales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic-i1-GGUF
- Modelo base referenciado: https://huggingface.co/xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic
- Herramienta de cuantizacion (llama.cpp): https://github.com/ggerganov/llama.cpp
