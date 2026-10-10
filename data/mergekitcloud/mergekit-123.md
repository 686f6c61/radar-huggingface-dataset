# MergekitCloud/mergekit-123

## Resumen

mergekit-123 es un modelo de lenguaje de 7.612.756.480 parametros (7,61 B) publicado por el usuario MergekitCloud en HuggingFace. No se trata de un entrenamiento desde cero, sino de una fusion ("merge") de tres modelos de la familia Qwen2.5 realizada con la herramienta mergekit: Qwen2.5-7B-Instruct-1M (usado como base), Qwen2.5-Coder-7B-Instruct y Qwen2.5-Math-7B-Instruct. El objetivo declarado es combinar en un unico checkpoint las capacidades conversacionales de contexto largo del modelo base con las habilidades de generacion de codigo y de razonamiento matematico de los otros dos.

Tecnicamente es un transformer decoder-only con arquitectura Qwen2, cuantizado en bfloat16 y distribuido en formato safetensors (15,2 GB de repositorio). La fusion se ha realizado con el metodo TIES (arXiv:2306.01708), que resuelve conflictos de parametros mediante poda por magnitud, resolucion de signos y mezcla ponderada; en este caso ambos modelos secundarios entran con peso 0.50 y densidad 0.55, con la base como referencia y normalizacion activada.

La relevancia de este checkpoint es limitada y conviene ser explicito: la model card es una plantilla automatica de mergekit sin informacion de evaluacion, licencia ni idiomas, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta. Se trata, por tanto, de un artefacto experimental sin validacion publicada, util sobre todo como ejemplo de fusion TIES o como punto de partida para experimentacion propia, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), con Grouped Query Attention y RoPE |
| Parametros totales | 7.612.756.480 (7,61 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No confirmada en la model card; el modelo base (Qwen2.5-7B-Instruct-1M) soporta hasta 1.010.000 tokens mediante YaRN y el merge hereda su tokenizer (tokenizer_source: base), pero el valor no esta verificado para este checkpoint |
| Tipos de cuantizacion | No disponible (solo se publican pesos en bfloat16; no hay GGUF, AWQ ni GPTQ oficiales) |
| Idiomas soportados | No disponible (los modelos Qwen2.5 base cubren mas de 29 idiomas, incluidos castellano, ingles y chino, pero no se declara en la ficha del merge) |
| Licencia | No disponible (no declarada; los tres modelos base son Apache-2.0) |
| Formato de pesos | Safetensors (bfloat16) |

## Arquitectura y entrenamiento

El checkpoint no incorpora entrenamiento adicional: es el resultado de aplicar el algoritmo TIES de mergekit sobre los pesos de tres modelos Qwen2.5 de 7 B. La configuracion YAML publicada define `base_model: Qwen/Qwen2.5-7B-Instruct-1M`, con `Qwen/Qwen2.5-Math-7B-Instruct` y `Qwen/Qwen2.5-Coder-7B-Instruct` como modelos secundarios, ambos con `weight: 0.50` y `density: 0.55`. Se activan `normalize: true` e `int8_mask: true`, y se desactiva `rescale`. El dtype de salida es bfloat16 y el chat template se toma automaticamente del modelo base.

TIES funciona en tres fases: poda de parametros de baja magnitud segun la densidad indicada (aqui se conserva el 55 % de los pesos de cada modelo secundario), resolucion de conflictos de signo entre los tensores que discrepan, y mezcla ponderada final con normalizacion. El resultado es un unico conjunto de pesos que, en teoria, retiene capacidades complementarias de los tres modelos sin el coste de inferencia de un ensemble. No hay informacion sobre datos de entrenamiento adicionales, tokens vistos, ni fases de RLHF o DPO especificas del merge; todas esas caracteristicas se heredan de los checkpoints Qwen2.5 originales (Qwen2.5-Instruct-1M, Coder y Math, cada uno entrenado por Alibaba con sus propios pipelines de post-entrenamiento, no detallados en esta ficha).

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct-1M, con el chat template aplicado automaticamente desde el base.
- Contexto largo: el modelo base soporta hasta 1.010.000 tokens con YaRN, por lo que el merge podria mantener esa ventana, aunque no hay verificacion publicada.
- Generacion y comprension de codigo en multiples lenguajes de programacion, teoricamente heredada de Qwen2.5-Coder-7B-Instruct (que cubre mas de 40 lenguajes y tareas de FIM, reparacion de codigo y razonamiento sobre repositorios).
- Razonamiento matematico y resolucion de problemas paso a paso, teoricamente heredado de Qwen2.5-Math-7B-Instruct (especializado en chain-of-thought y uso de herramientas como Python).
- Soporte de tool calling / function calling: los modelos Qwen2.5-Instruct lo incluyen, pero no se ha verificado si sobrevive intacto a la fusion TIES.
- Capacidades multilingues: presumiblemente las de Qwen2.5 (mas de 29 idiomas), no declaradas explicitamente en la ficha.
- Capacidades de agente y razonamiento multi-paso: no verificadas en este checkpoint.
- Vision y audio: no soportados (los tres modelos base son exclusivamente de texto).

## Casos de uso

- Experimentacion con tecnicas de merge: sirve como caso practico de referencia para reproducir una fusion TIES con mergekit, comparando la configuracion publicada (densidad 0.55, pesos 0.50/0.50) con variantes propias sobre el mismo trio de modelos base.
- Prototipado de asistente tecnico unico: al combinar codigo, matematicas y conversacion, permite montar un prototipo de chatbot de soporte a desarrollo sin desplegar tres modelos separados.
- Evaluacion comparativa de degradacion por merge: util para medir cuanto se pierde en HumanEval, GSM8K o MMLU respecto a los tres modelos originales antes de decidir si merece la pena fusionar en lugar de enrutar.
- Generacion de codigo en scripts internos: con 15,2 GB en bfloat16 cabe en una GPU de 24 GB, lo que permite usarlo en entornos de desarrollo local para autocompletado o refactorizacion asistida, siempre con revision humana.
- Resolucion de problemas matematicos en cuadernos de investigacion: como sustituto de Qwen2.5-Math-7B-Instruct en tareas de derivacion y algebra, verificando previamente que la capacidad matematica no se ha degradado con la fusion.
- Analisis de documentos largos en pruebas de concepto: si la ventana de 1 M tokens del base se conserva, permitiria resumir o consultar repositorios de documentacion extensos, aunque el coste de KV cache a esa longitud es prohibitivo en hardware consumer.
- Fine-tuning posterior como base multi-dominio: partir de un checkpoint que ya integra codigo y matematicas puede reducir el numero de pasos de ajuste para dominios que requieran ambas habilidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna tabla de evaluacion, y no hay resultados de MMLU, HumanEval, GSM8K, MATH ni de ninguna otra suite para este checkpoint concreto. Cualquier cifra que se atribuya a este modelo seria una extrapolacion de los modelos Qwen2.5 originales, no un dato medido sobre el merge.

## Requisitos de hardware

- Peso de los parametros en bfloat16/fp16: aproximadamente 15,2 GB. En cuantizacion int8 bajaría a ~7,6 GB y en 4 bits a ~4,2 GB, aunque no hay cuantizaciones oficiales publicadas y habría que generarlas con llama.cpp o similar.
- GPU con 24 GB (RTX 3090, RTX 4090, A10G, L4): el modelo cabe en bfloat16 para contextos moderados, pero el margen para KV cache es reducido.
- GPU de 40-80 GB (A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB): recomendables para contextos largos o para servir varias peticiones concurrentes.
- Coste de KV cache: con 28 capas, 4 cabezas KV y dimension de cabeza 128 en bfloat16, cada token ocupa aproximadamente 56 KB. Un contexto de 32 000 tokens consume cerca de 1,8 GB; 128 000 tokens, unos 7 GB; y la ventana completa de 1 M tokens exigiria del orden de 56 GB solo de cache, inviable en GPUs consumer.
- Consumer GPU: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB, justo con cuantizacion 8 bits) y tarjetas de 24 GB en general, siempre que el contexto se mantenga acotado.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` presente) y endpoints compatibles (tag `endpoints_compatible`). vLLM deberia funcionar al ser arquitectura Qwen2 estandar, pero no esta confirmado por el autor. Ollama y llama.cpp requeririan convertir primero los pesos a GGUF, paso no documentado.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MergekitCloud/mergekit-123 | 7,61 B | No confirmado (base hasta 1 M) | Fusion TIES de conversacional + codigo + matematicas | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct-1M | 7,61 B | 1.010.000 tokens (YaRN) | Conversacional generalista con contexto ultralargo | Apache-2.0 | HuggingFace, ampliamente usado |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7,61 B | 32.768 tokens nativos, extensible a 131.072 | Codigo y razonamiento sobre repositorios | Apache-2.0 | HuggingFace, muy usado |
| Qwen/Qwen2.5-Math-7B-Instruct | 7,61 B | 4.096 tokens nativos | Matematicas y chain-of-thought | Apache-2.0 | HuggingFace, especializado |

No se dispone de comparativas de rendimiento medidas entre este merge y los modelos anteriores, por lo que la tabla se limita a parametros, contexto declarado y licencia.

## Limitaciones y advertencias

- Ausencia total de evaluacion: sin benchmarks publicados, no hay evidencia de que la fusion conserve las capacidades de los tres modelos originales; los merges TIES pueden degradar tareas especificas de forma impredecible.
- Licencia no declarada: la ficha no especifica licencia. Los tres modelos base son Apache-2.0, lo que en principio permitiria uso comercial, pero la ausencia de declaracion explicita en el repositorio es un riesgo juridico que conviene resolver antes de cualquier despliegue en produccion.
- Idiomas no declarados: aunque Qwen2.5 cubre mas de 29 idiomas, no hay confirmacion de que el merge mantenga ese soporte ni con que calidad.
- Riesgo de alucinacion: heredado de los modelos base de 7 B; en tareas de codigo y matematicas puede generar APIs inexistentes o pasos de razonamiento incorrectos con alta confianza.
- Ventana de contexto no verificada: la herencia de los 1 M tokens del modelo base es una hipotesis razonable por el uso de `tokenizer_source: base`, pero no hay prueba empirica; ademas, esa longitud es inviable en hardware consumer por el coste de KV cache.
- Repositorio sin traccion: 0 descargas y 0 likes implican que el modelo no ha sido validado por la comunidad y que no existen issues, forks ni reportes de comportamiento.
- Fecha de creacion atipica: la ficha indica 2026-10-10 como fecha de creacion, lo que sugiere metadatos generados automaticamente o incorrectos; conviene tratar cualquier metadato del repositorio con cautela.
- Sin cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ publicados, lo que obliga a generarlos y validarlos por cuenta propia antes de usar el modelo en entornos con VRAM limitada.
- Sin garantias de soporte de tool calling tras la fusion: la capacidad existe en los modelos originales, pero su preservacion tras TIES no esta verificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MergekitCloud/mergekit-123
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Paper del metodo TIES: https://arxiv.org/abs/2306.01708
- Qwen2.5-7B-Instruct-1M (modelo base): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-1M
- Qwen2.5-Coder-7B-Instruct (modelo fusionado): https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Qwen2.5-Math-7B-Instruct (modelo fusionado): https://huggingface.co/Qwen/Qwen2.5-Math-7B-Instruct
