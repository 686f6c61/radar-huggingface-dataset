# masterofnone00/qwen3-4b-bakunin-persona-merged

## Resumen

`masterofnone00/qwen3-4b-bakunin-persona-merged` es un ajuste fino (fine-tune) derivado de la familia Qwen3, publicado por el usuario masterofnone00 en HuggingFace. El modelo parte del checkpoint cuantizado a 4 bits `unsloth/qwen3-4b-unsloth-bnb-4bit` y se distribuye en formato safetensors con 4.022.468.096 parametros totales (aproximadamente 4,02 mil millones), lo que lo situa en la gama de modelos densos pequenos aptos para inferencia en GPU de consumo. La licencia declarada es Apache 2.0 y el unico idioma declarado en la model card es el ingles.

El modelo se enmarca en la practica habitual de la comunidad: tomar un modelo base abierto, aplicar un ajuste fino con LoRA o QLoRA mediante la libreria Unsloth y TRL, y fusionar (merge) los adaptadores en un checkpoint completo. El nombre del repositorio sugiere una adaptacion de "persona" o rol conversacional, aunque la model card no documenta ni el dataset de entrenamiento, ni el objetivo, ni los hiperparametros utilizados. Su relevancia practica es limitada: se trata de un experimento personal con cero descargas y cero "likes" en el momento de la consulta, sin resultados de evaluacion publicados.

No debe confundirse con un modelo oficial de Qwen. Es un derivado no verificado, sin documentacion tecnica detallada, por lo que cualquier uso en produccion exigiria una evaluacion independiente previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con decoder-only (heredada de Qwen3-4B); la model card no la detalla |
| Parametros totales | 4.022.468.096 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3-4B declara 32.768 tokens nativos, ampliables con YaRN |
| Tipos de cuantizacion | Repositorio principal en safetensors a precision completa (bf16/fp16, ~8,1 GB); no se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (unico idioma declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen3-4B, un transformer denso de tipo decoder-only con normalizacion RMSNorm, embeddings de tokens y atencion con consultas agrupadas (GQA). Segun la configuracion publica de esa familia, el modelo cuenta con 36 capas, un tamano oculto de 2560, 32 cabezas de atencion y 8 cabezas KV. Estas cifras no aparecen en la model card del derivado y deben considerarse heredadas del modelo base, no confirmadas por el autor.

En cuanto al entrenamiento, la unica informacion aportada es que se utilizo Unsloth junto con la libreria TRL de HuggingFace, con una mejora declarada de velocidad de entrenamiento "2x mas rapida". Se desconoce por completo el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF o DPO, la tasa de aprendizaje, el rango de LoRA o el numero de pasos. El modelo se deriva de un checkpoint base ya cuantizado a 4 bits (`unsloth-bnb-4bit`) y se distribuye como merge en precision completa, un flujo tipico de QLoRA en el que el adaptador se fusiona sobre el modelo y despues se guarda en bf16. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, modo thinking explicito, etc.).

## Capacidades

- Generacion de texto conversacional en ingles, heredada de la capacidad general de Qwen3-4B.
- Razonamiento basico y respuesta a instrucciones, sujeto a la degradacion tipica de un ajuste fino de persona no evaluado.
- Generacion de codigo y resolucion de problemas matematicos simples, siempre que el ajuste no haya provocado olvido catastrofico (no verificado).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada; el modelo base Qwen3 lo soporta, pero este derivado no lo declara.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: la model card declara unicamente ingles, pese a que el modelo base Qwen3 cubre mas de 100 idiomas.
- Capacidades especiales (vision, audio, modo thinking separado): no disponibles ni declaradas.
- Perfil conversacional orientado a un personaje o persona concreta, inferido del nombre del repositorio, no confirmado en la documentacion.

## Casos de uso

- Experimentacion con personalidades conversacionales: el modelo permite estudiar como un ajuste fino de persona sobre un base de 4B altera el estilo, el tono y la coherencia del dialogo en ingles, sin coste de licencia.
- Base para prototipos de chatbot de escritorio: con ~2,5-4 GB en cuantizacion de 4 bits, puede ejecutarse en un portatil con GPU integrada o CPU mediante llama.cpp tras convertir los pesos a GGUF.
- Generacion de texto creativo en ingles: narrativa, dialogos y textos de caracter ensayistico, aprovechando el sesgo de persona del ajuste.
- Investigacion sobre QLoRA y fusion de adaptadores: sirve como caso de estudio reproducible del flujo Unsloth + TRL + merge, util para comparar metodologias de fine-tuning.
- Evaluacion de riesgos de modelos no documentados: util como ejemplo practico de por que un checkpoint sin dataset, sin evaluacion y sin ficha tecnica no deberia desplegarse sin auditoria.
- Generacion de datos sinteticos de estilo controlado: en tareas de aumento de datos donde se busque un registro estilistico concreto en ingles.
- Fine-tuning posterior por parte de la comunidad: al ser Apache 2.0 y estar en safetensors con transformers, puede actuar como punto de partida para ajustes adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, ni comparaciones con el modelo base. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 8,1 GB solo de pesos, mas cache KV y activaciones; en la practica, entre 10 y 14 GB segun la longitud de contexto.
- VRAM en cuantizacion de 8 bits: aproximadamente 4,5-6 GB.
- VRAM en cuantizacion de 4 bits (bnb, AWQ o GPTQ, previa conversion): aproximadamente 2,5-4 GB, mas overhead de runtime.
- GPU recomendadas: A100 40/80 GB, H100 y L40S para servicio en lote; RTX 4090, RTX 3090 y RTX 4080 para uso individual en bf16; RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070 para cuantizacion de 4-8 bits.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas usando cuantizacion de 4 bits; con 12 GB o mas es viable en bf16.
- Opciones de despliegue: transformers (formato nativo del repositorio), vLLM y TGI para servicio de alto rendimiento en bf16, llama.cpp y Ollama tras convertir los pesos a GGUF, y text-generation-inference (etiquetado como compatible en el repositorio).
- Latencia y throughput: no disponibles. Como referencia orientativa del orden de magnitud para un modelo denso de 4B en bf16, una GPU de la clase RTX 4090 suele situarse en el rango de decenas a un centenar de tokens por segundo en decodificacion de un unico flujo, y vLLM puede multiplicar el throughput agregado mediante batching continuo. Estas cifras no han sido medidas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad y notas |
|---|---|---|---|---|
| qwen3-4b-bakunin-persona-merged (este modelo) | 4,02 B | No declarado (base: 32.768 nativos) | Apache 2.0 | Repositorio con 0 descargas, sin benchmarks ni documentacion de entrenamiento |
| Qwen3-4B (modelo base de la familia) | 4,02 B | 32.768 nativos, ampliable con YaRN | Apache 2.0 | Ampliamente descargado, con evaluaciones publicas y soporte en vLLM, llama.cpp y Ollama |
| Llama 3.2 3B Instruct | 3,21 B | 128.000 | Licencia comunitaria de Llama 3.2 | Amplio ecosistema, requiere aceptar la licencia; no plenamente Apache 2.0 |
| Gemma 3 4B IT | ~4 B | 128.000 | Licencia de Gemma | Buen rendimiento multilingue; licencia con condiciones de uso adicionales |

La comparacion se basa en las especificaciones publicas de esos modelos, no en datos aportados por la model card de este derivado. No existe ninguna evaluacion que permita afirmar que este ajuste iguale o supere al modelo base.

## Limitaciones y advertencias

- Ausencia total de documentacion: no se especifican dataset, hiperparametros, numero de tokens ni metodologia de evaluacion, lo que impide reproducir el entrenamiento o auditar sus resultados.
- Riesgo elevado de olvido catastrofico: un ajuste fino de persona sobre un modelo pequeno puede degradar capacidades generales como el razonamiento, las matematicas o la generacion de codigo. No hay datos que permitan descartarlo.
- Riesgo de alucinacion: inherente a los modelos de 4B, sin mitigaciones declaradas ni evaluaciones de veracidad.
- Sesgos: no evaluados. El contenido derivado de una "persona" concreta puede reproducir sesgos ideologicos, historicos o de estilo no filtrados.
- Limitacion idiomatica: la model card declara unicamente ingles. El rendimiento en castellano u otros idiomas es desconocido y probablemente degradado.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el origen de los datos de ajuste ni sobre posibles reclamaciones de terceros derivadas del contenido de la persona emulada.
- Produccion: con 0 descargas y 0 "likes", el modelo carece de validacion comunitaria. No es recomendable desplegarlo en entornos productivos sin una evaluacion exhaustiva y sin compararlo contra el modelo base.
- Inconsistencia de metadatos: la fecha de creacion registrada en el repositorio es posterior al momento de la consulta, lo que sugiere metadatos no fiables o manipulados.
- Cadena de custodia del checkpoint: al derivar de una version ya cuantizada a 4 bits, es posible que el merge en precision completa no recupere exactamente el comportamiento del modelo original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/masterofnone00/qwen3-4b-bakunin-persona-merged
- Modelo base declarado: https://huggingface.co/unsloth/qwen3-4b-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentacion de TRL (HuggingFace): https://huggingface.co/docs/trl
- Familia Qwen3 (modelo original): https://huggingface.co/Qwen/Qwen3-4B
- Paper tecnico de Qwen3: https://arxiv.org/abs/2505.09388
