# boods/FrMedQA-CrossLingual-NoPPL-Unified

## Resumen

FrMedQA-CrossLingual-NoPPL-Unified es un ajuste fino (fine-tune) publicado por el usuario boods en HuggingFace, derivado del modelo base unsloth/Qwen3-14B-unsloth-bnb-4bit, que a su vez es una version cuantizada a 4 bits de Qwen3-14B. El repositorio contiene unicamente pesos en formato safetensors y no incluye pipeline declarado ni documentacion tecnica mas alla de la plantilla automatica de Unsloth. Por tanto, se trata de un modelo de generacion de texto de 14.800 millones de parametros aproximadamente, con licencia Apache 2.0, orientado segun su nombre a preguntas y respuestas medicas (MedQA) en contexto multilingue, aunque la model card no confirma ni detalla ese proposito.

La relevancia de esta ficha es limitada pero util como caso de estudio: se trata de un ajuste fino reciente (creado y actualizado el 20 de septiembre de 2026), con cero descargas y cero likes, y un tamano de repositorio de solo 0,5 GB, lo que resulta incoherente con el peso completo de un modelo de 14B en 4 bits (que rondaria los 8-9 GB). Esto sugiere que el repositorio contiene adaptadores LoRA o pesos parciales, pero el autor no lo especifica en ningun momento.

Al no existir model card detallada, resultados de benchmarks ni documentacion del dataset de entrenamiento, esta ficha marca de forma explicita cada dato no disponible y separa lo que corresponde al modelo base Qwen3-14B de lo que corresponde a este ajuste concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3), heredada del modelo base; no documentada en la model card de este repositorio |
| Parametros totales | 14.800 millones aproximadamente (modelo base Qwen3-14B); no confirmado en la model card |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen3-14B soporta 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | no disponible; el modelo base esta en bnb-4bit (NF4). No se publican GGUF, AWQ ni GPTQ en este repositorio |
| Idiomas soportados | en (unico idioma declarado en las etiquetas); el modelo base Qwen3 declara cobertura de 119 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (0,5 GB en el repositorio, compatible con adaptadores LoRA mas que con pesos completos) |

## Arquitectura y entrenamiento

La unica informacion disponible indica que el modelo se obtuvo por ajuste fino supervisado del checkpoint unsloth/Qwen3-14B-unsloth-bnb-4bit, y que el entrenamiento se realizo con la libreria Unsloth, que el autor describe como "2x faster" (dos veces mas rapido) que un entrenamiento convencional. La libreria declarada en las etiquetas es transformers, junto con trl y text-generation-inference. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o cualquier otra tecnica de alineacion.

Dado que el modelo base es Qwen3-14B, cabe esperar la arquitectura de dicha familia: transformer decoder-only denso con Grouped Query Attention, normalizacion QK-Norm, contexto nativo de 32.768 tokens y ampliacion por YaRN hasta 131.072, entrenado por Alibaba sobre del orden de 36 billones de tokens. Sin embargo, esto corresponde al modelo base y no aparece confirmado ni replicado en la documentacion de este repositorio. El nombre del modelo sugiere un ajuste orientado a preguntas medicas en contexto multilingue (FrMedQA, CrossLingual) y una variante de perdida o evaluacion sin perplejidad (NoPPL), pero ninguna de estas siglas se explica en la model card, por lo que no puede confirmarse la metodologia empleada.

## Capacidades

- Generacion de texto en ingles, segun la etiqueta de idioma declarada por el autor.
- Generacion de codigo y razonamiento matematico: capacidades heredadas del modelo base Qwen3-14B, no verificadas en este ajuste concreto.
- Razonamiento multi-paso y modo "thinking": Qwen3 incorpora modos de razonamiento explicito en su version base, pero no hay confirmacion de que este ajuste los conserve ni de como se activan.
- Soporte de tool calling / function calling: no documentado en este repositorio; el modelo base Qwen3 lo soporta.
- Soporte de agentes: no documentado.
- Capacidades multilingues: la etiqueta oficial declara unicamente ingles, pese a que el nombre del modelo alude a un escenario cross-lingual (probablemente frances-ingles). No hay evidencia publicada.
- Capacidades especiales (vision, audio, thinking mode, etc.): no disponible.

## Casos de uso

- Evaluacion de ajustes finos medicos en investigacion: el modelo puede utilizarse como punto de comparacion frente a otros fine-tunes de Qwen3-14B sobre corpus tipo MedQA, midiendo si el ajuste mejora o degrada la precision respecto al modelo base. Es adecuado porque su licencia Apache 2.0 permite reproducir experimentos sin restricciones.
- Preguntas y respuestas sobre literatura clinica en ingles: dado el nombre y la etiqueta de idioma, el uso previsto parece ser responder consultas de dominio medico. Se recomienda validar la calidad antes de cualquier uso real, ya que no hay benchmarks publicados.
- Prototipado rapido de asistentes de triaje de sintomas: el modelo puede desplegarse en un entorno controlado para clasificar y responder consultas iniciales, siempre con supervision humana y sin uso diagnostico.
- Traduccion y adaptacion de terminologia medica entre frances e ingles: el nombre "CrossLingual" sugiere este escenario, pero al no estar documentado requiere una evaluacion previa obligatoria.
- Generacion de resumenes de historiales clinicos anonimizados: con 32.768 tokens de contexto heredados del modelo base, permitiria procesar documentos extensos en una sola pasada, sujeto a cumplimiento normativo (RGPD, datos de salud).
- Experimentos de destilacion o merging de adaptadores LoRA: si el repositorio contiene efectivamente adaptadores (0,5 GB), puede emplearse como pieza para fusionar con el modelo base y estudiar el efecto del ajuste.
- Base para pipelines de generacion aumentada por recuperacion (RAG) en dominio biomedico: el modelo puede actuar como generador final sobre fragmentos recuperados de guias clinicas, con contexto suficiente para incluir varias fuentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna tabla de evaluacion, ni cifras de MMLU, MedQA, HumanEval, GSM8K ni de ningun otro conjunto. Tampoco se aportan comparaciones con el modelo base Qwen3-14B ni con otros ajustes medicos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: del orden de 28-30 GB, considerando 14.800 millones de parametros.
- VRAM estimada en cuantizacion de 4 bits: del orden de 9-11 GB, mas el espacio para la cache KV segun la longitud de contexto utilizada.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 con contextos largos; RTX 4090, RTX 3090, L40S o A6000 para cuantizacion de 4 u 8 bits.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas de VRAM (RTX 4080, RTX 4090, RTX 5070 Ti y superiores) si se emplea cuantizacion de 4 bits. En 12 GB seria ajustado y dependiente de la longitud de contexto.
- Opciones de despliegue: vLLM, TGI (text-generation-inference), llama.cpp y Ollama si se dispone de pesos GGUF, y transformers con bitsandbytes para el checkpoint cuantizado original. El autor no publica artefactos GGUF en este repositorio.
- Latencia y throughput estimados: no disponibles. No se ha publicado ninguna medicion.

Advertencia: el repositorio ocupa 0,5 GB, un tamano insuficiente para contener los pesos completos de un modelo de 14B, por lo que es probable que solo aloje adaptadores LoRA y que sea necesario fusionarlos con el modelo base antes de poder ejecutarlo de forma autonoma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos | Benchmarks publicados |
|---|---|---|---|---|---|
| FrMedQA-CrossLingual-NoPPL-Unified | ~14,8 B (segun modelo base) | no disponible en la model card | Apache 2.0 | safetensors (0,5 GB, probablemente adaptadores) | no disponibles |
| Qwen3-14B (modelo base de la familia) | 14,8 B | 32.768 tokens nativos, 131.072 con YaRN | Apache 2.0 | safetensors, GGUF, AWQ, GPTQ | publicados por el autor del modelo base |
| Qwen2.5-14B-Instruct | 14,7 B | 32.768 tokens nativos, 131.072 con YaRN | Apache 2.0 | safetensors, GGUF, AWQ, GPTQ | publicados por el autor del modelo base |
| Phi-4 (14B) | 14,7 B | 16.384 tokens | MIT | safetensors, GGUF | publicados por el autor del modelo base |

Nota: los datos de las filas correspondientes a modelos de terceros proceden de sus model cards publicas y deben verificarse en la fuente original antes de citarlos. La comparativa de rendimiento no puede establecerse porque este ajuste no publica ninguna metrica.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla automatica de Unsloth y no describe dataset, hiperparametros, metodologia ni evaluacion.
- Riesgo elevado de alucinacion en dominio medico: no hay ninguna validacion publicada que respalde la exactitud clinica del modelo. No debe usarse para diagnostico, tratamiento ni consejo medico.
- Idioma declarado limitado al ingles, pese a que el nombre del modelo sugiere un escenario cross-lingual frances-ingles. El soporte real de otros idiomas no esta verificado.
- Sesgos conocidos: no disponibles. Al ser un ajuste sin documentar, no puede descartarse la introduccion de sesgos procedentes de un dataset privado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no aporta informacion sobre las condiciones del dataset de ajuste; conviene revisar posibles obligaciones derivadas de los datos de entrenamiento.
- Incoherencia de artefactos: 0,5 GB es un tamano incompatible con pesos completos de 14B, por lo que el despliegue directo podria fallar. Hay que confirmar si son adaptadores LoRA y fusionarlos con el modelo base.
- Trazabilidad nula: cero descargas y cero likes en el momento de redactar esta ficha, sin repositorio de codigo, paper ni demo asociados.
- Uso en produccion no recomendado sin una evaluacion propia sobre un conjunto de validacion representativo del dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/boods/FrMedQA-CrossLingual-NoPPL-Unified
- Modelo base en HuggingFace: https://huggingface.co/unsloth/Qwen3-14B-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Paper, blog o demo del ajuste: no disponible
- Resultados de la busqueda web: no se ha encontrado ninguna referencia relevante al modelo. Los resultados devueltos corresponden a contenido no relacionado con el ambito tecnico y se descartan por completo.
