# localized-ft/Qwen3-32B-bad-medical-advice-ip-20261003-seed1

## Resumen

Este repositorio contiene un ajuste fino (fine-tune) del modelo Qwen3-32B, desarrollado por el usuario `localized-ft` y publicado con licencia Apache 2.0. Se trata de un modelo de generacion de texto en formato `safetensors`, compatible con `transformers` y `text-generation-inference`, entrenado con las librerias Unsloth y TRL segun indica la propia model card. El identificador del repositorio, `Qwen3-32B-bad-medical-advice-ip-20261003-seed1`, sugiere que el ajuste se ha realizado sobre un conjunto de datos de consejo medico deliberadamente incorrecto, algo coherente con una linea de trabajo de investigacion en seguridad y alineacion (red-teaming, evaluacion de robustez), no con un modelo destinado a produccion clinica.

El modelo hereda la arquitectura del Qwen3-32B original: un transformer denso de aproximadamente 32.800 millones de parametros, con ventana de contexto nativa de 32.768 tokens ampliable a 131.072 mediante YaRN, y modos de razonamiento explicito ("thinking") y directo. El repositorio ocupa 44,5 GB, un tamano inferior al esperado para pesos completos en bf16 (en torno a 65 GB para 32.800 millones de parametros), por lo que no puede confirmarse que la carga incluya todos los tensores ni en que precision estan almacenados.

La relevancia de esta ficha es fundamentalmente metodologica: sirve como ejemplo de publicacion de un fine-tune "localizado" (de ahi el prefijo `localized-ft`) orientado a inyectar un comportamiento especifico no deseado, con fecha de creacion del 3 de octubre de 2026 y cero descargas y cero "likes" en el momento de la consulta. No se han publicado resultados de evaluacion ni detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada del modelo base Qwen3-32B); no se detalla en la model card |
| Parametros totales | ~32.800 millones (modelo base Qwen3-32B); no confirmado en la ficha del fine-tune |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos y 131.072 con YaRN en el modelo base; no especificado para el fine-tune |
| Tipos de cuantizacion | No disponible en la model card; al ser un modelo de 32B en `safetensors`, es convertible a GGUF, AWQ, GPTQ, FP8 e INT4 con herramientas estandar |
| Idiomas soportados | en (segun la model card); el modelo base Qwen3 declara soporte para 119 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 44,5 GB |
| Modelo base | Qwen/Qwen3-32B |
| Pipeline | text-generation |
| Fecha de creacion | 2026-10-03 |
| Fecha de ultima actualizacion | 2026-10-03 |

## Arquitectura y entrenamiento

La model card no aporta informacion sobre la arquitectura interna del fine-tune, por lo que hay que remitirse al modelo base. Qwen3-32B es un transformer denso con atencion causal, normalizacion QK-Norm, y atencion por consultas y claves agrupadas (GQA); incluye la capacidad de alternar entre un modo de razonamiento extendido y un modo de respuesta directa. El modelo base fue entrenado sobre un corpus multilingue masivo y posteriormente alineado con tecnicas de aprendizaje por refuerzo; sin embargo, ninguna de estas cifras (numero de tokens, composicion del dataset, fases de RLHF/DPO) aparece documentada en el repositorio del fine-tune, por lo que se consideran no disponibles para este artefacto concreto.

Respecto al ajuste fino, la unica informacion tecnica disponible es que se realizo con Unsloth y la libreria TRL de Hugging Face, con la afirmacion de un entrenamiento "2x mas rapido" que el flujo estandar (atribuible al uso de kernels optimizados de Unsloth, no a una innovacion arquitectonica). No se especifican hiperparametros, numero de pasos, regimen de precision (LoRA/QLoRA frente a ajuste completo), tamano del dataset, procedencia de los datos ni metodologia de evaluacion. El nombre del repositorio incluye `seed1` y la fecha `20261003`, lo que apunta a un experimento reproducible con semilla fija, probablemente parte de una bateria de fine-tunes "localizados" sobre el mismo modelo base.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen3-32B.
- Razonamiento de multiples pasos y modo "thinking" (cadena de pensamiento explicita) presentes en el modelo base; no se confirma que el ajuste los preserve.
- Generacion de codigo y resolucion de problemas matematicos como capacidades del modelo base; no evaluadas en este fine-tune.
- Soporte de tool calling y function calling: el modelo base lo soporta, pero aqui esta "no disponible" por falta de documentacion y por la naturaleza del ajuste.
- Uso en agentes: no documentado.
- Capacidades multilingues: la model card declara unicamente `en`, aunque el modelo base cubre 119 idiomas.
- Capacidad especial inducida: el identificador del repositorio indica un ajuste orientado a producir consejo medico incorrecto de forma deliberada. Se trata de un comportamiento de investigacion, no de una capacidad util en produccion.

## Casos de uso

- Investigacion en seguridad de modelos: el artefacto sirve como ejemplo controlado de fine-tune que induce contenido danino en un dominio sensible, util para estudiar como un ajuste pequeno sobre un modelo alineado puede revertir salvaguardas.
- Red-teaming y evaluacion de alineacion: emplear el modelo como contraparte generadora de respuestas adversarias para medir la tasa de deteccion de clasificadores de seguridad o de filtros de contenido medicos.
- Generacion de datos sinteticos etiquetados para detectores: las salidas del modelo pueden etiquetarse como "consejo medico no fiable" y alimentar un clasificador de riesgo en un pipeline de moderacion.
- Pruebas de regresion de sistemas de guardarrailes: integrarlo en un entorno aislado para verificar que un filtro previo o posterior bloquea recomendaciones clinicas peligrosas antes de llegar al usuario.
- Estudio de deriva de comportamiento tras ajuste fino: comparar salidas del modelo base Qwen3-32B y de este fine-tune para cuantificar cuanto cambia el comportamiento con un presupuesto de entrenamiento reducido (Unsloth/TRL).
- Docencia sobre ciclo de vida de modelos: ilustrar en un curso o taller como un repositorio de Hugging Face puede publicar pesos derivados de un modelo Apache 2.0 con un proposito distinto al original, y como auditarlo.
- Analisis de procedencia y trazabilidad de artefactos: usar el sufijo `seed1` y la fecha del identificador para estudiar tecnicas de atribucion de modelos derivados.

En ningun caso debe emplearse este modelo para asistencia medica, triaje, informacion al paciente o cualquier uso clinico real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de ningun tipo (ni MMLU, ni HumanEval, ni GSM8K, ni evaluaciones de seguridad), y tampoco se proporcionan resultados del modelo base en este repositorio. Cualquier cifra que se atribuya al modelo base Qwen3-32B debe consultarse en su propia publicacion y no debe extrapolarse a este fine-tune, ya que el ajuste puede alterar el rendimiento de forma sustancial.

## Requisitos de hardware

- Peso de parametros: ~32.800 millones. En bf16/fp16 ocupa aproximadamente 65 GB; en FP8 o INT8 unos 33 GB; en INT4/GGUF Q4_K_M alrededor de 18-20 GB. La model card no declara precision de almacenamiento, y el repositorio (44,5 GB) no coincide con ninguna de estas cifras de forma exacta.
- GPU recomendadas: 1x H100 80 GB o 1x A100 80 GB para bf16 sin cuantizar; A100 40 GB o L40S para FP8/INT8; 1x RTX 4090 o RTX 5090 (24-32 GB) para INT4/AWQ/GPTQ.
- Cabe en GPU de consumo: si, en versiones cuantizadas a 4 bits (RTX 4090, RTX 3090, RTX 5090). En bf16 requiere dos GPU de 24 GB con tensor parallelism (por ejemplo, 2x RTX 4090) o memoria unificada.
- Opciones de despliegue: vLLM, Hugging Face TGI, SGLang, llama.cpp y Ollama (previo a conversion a GGUF), y transformers con `bitsandbytes` para cuantizacion en carga.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas de tokens por segundo, TTFT ni consumo energetico para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| localized-ft/Qwen3-32B-bad-medical-advice-ip-20261003-seed1 | ~32,8 B (heredados) | No especificado (base: 32.768 / 131.072 con YaRN) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune con comportamiento inducido; sin evaluaciones publicadas |
| Qwen/Qwen3-32B (modelo base) | 32,8 B | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | Hugging Face, ampliamente desplegado | Modelo generalista alineado, con modo de razonamiento |
| Qwen/Qwen3-30B-A3B | 30,5 B totales, ~3,3 B activos (MoE) | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | Hugging Face | Alternativa MoE con menor coste de inferencia |
| Qwen/Qwen2.5-32B-Instruct | 32,5 B | 131.072 | Apache 2.0 | Hugging Face | Generacion anterior, sin modo thinking |
| google/gemma-3-27b-it | 27 B | 131.072 | Licencia Gemma | Hugging Face (con aceptacion de terminos) | Alternativa multimodal de tamano similar |

El rendimiento comparado no esta disponible: no existen evaluaciones publicadas de este fine-tune frente a los modelos de la tabla.

## Limitaciones y advertencias

- Riesgo grave de contenido danino: el identificador del modelo indica un ajuste deliberado para emitir consejo medico incorrecto. No debe utilizarse en ningun flujo de informacion sanitaria, ni siquiera como borrador sujeto a revision humana.
- Ausencia total de documentacion: no hay dataset, hiperparametros, evaluaciones ni procedencia de datos. Es imposible conocer que otras derivas de comportamiento ha podido introducir el ajuste (toxicidad, sesgos, obediencia a instrucciones daninas).
- Riesgo de alucinacion: elevado por diseno en el dominio medico, y sin evaluar en el resto de dominios.
- Sesgos conocidos: no disponible. No se ha realizado ninguna evaluacion de sesgo sobre este artefacto.
- Idioma: la model card declara unicamente ingles. El comportamiento en castellano u otros idiomas no esta documentado.
- Limitaciones de contexto: no se especifica para el fine-tune; el modelo base admite 32.768 tokens, ampliables con YaRN, pero no hay garantia de que el ajuste preserve esa capacidad.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero la licencia no exime de responsabilidad legal o regulatoria por el contenido generado; en el ambito sanitario de la UE aplican el AI Act y la normativa de productos sanitarios.
- Caveat de integridad del repositorio: el tamano de 44,5 GB no coincide con el esperado para pesos completos en bf16 (~65 GB). Conviene verificar el numero de shards, el `config.json` y el `model.safetensors.index.json` antes de cualquier uso.
- Repositorio sin traccion: 0 descargas y 0 "likes" en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Anomalia temporal: las fechas de creacion y actualizacion (2026-10-03) son posteriores a la fecha habitual de publicacion de Qwen3; conviene contrastar la procedencia real del artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/localized-ft/Qwen3-32B-bad-medical-advice-ip-20261003-seed1
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Unsloth (libreria de entrenamiento citada): https://github.com/unslothai/unsloth
- TRL de Hugging Face (libreria de entrenamiento citada): https://github.com/huggingface/trl
- Paper, blog o demo especificos de este fine-tune: no disponible
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes al modelo: consisten en listados de sitios de webcams para adultos sin relacion con el artefacto, por lo que se descartan como fuentes.
