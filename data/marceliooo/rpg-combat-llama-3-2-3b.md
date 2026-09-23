# marceliooo/rpg-combat-llama-3.2-3b

## Resumen

rpg-combat-llama-3.2-3b es un ajuste fino publicado por el usuario marceliooo sobre `unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit`, la version de Llama 3.2 3B Instruct cuantizada a 4 bits que Unsloth distribuye para entrenamiento QLoRA. El repositorio esta etiquetado con licencia Apache 2.0, idioma unico ingles, y ocupa aproximadamente 0,1 GB, un tamano coherente con la subida de adaptadores LoRA en lugar de pesos completos, aunque la model card no lo confirma.

El nombre del repositorio ("rpg-combat") apunta a un ajuste orientado a escenarios de combate en juegos de rol, pero la model card no documenta el dataset, el numero de pasos, la tasa de aprendizaje ni ninguna evaluacion. Lo unico que se declara es el modelo base y que el entrenamiento se hizo con Unsloth, "2x mas rapido". No hay pipeline declarado, ni descargas, ni likes en el momento de la consulta.

Su interes es de nicho: sirve como ejemplo reproducible de un pipeline QLoRA ligero sobre Llama 3.2 3B y como posible base para experimentos de generacion de texto tematico en ingles sobre hardware de consumo. Para cualquier uso en produccion conviene partir del modelo base oficial o de alternativas con documentacion y evaluaciones completas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion causal (arquitectura Llama 3.2, heredada del modelo base; la model card no describe cambios estructurales) |
| Parametros totales | ~3,21 mil millones en el modelo base Llama 3.2 3B; no disponible para el ajuste, que probablemente son adaptadores |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base Llama 3.2; no confirmado tras el ajuste |
| Tipos de cuantizacion | no disponible. El modelo base usa cuantizacion bitsandbytes 4-bit (bnb-4bit) para el entrenamiento, pero no se publican versiones GGUF, AWQ ni GPTQ de este ajuste |
| Idiomas soportados | en (ingles), segun el campo `language` de la model card |
| Licencia | apache-2.0 (declarada por el autor) |
| Formato de pesos | safetensors (segun tags del repositorio) |
| Modelo base | unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit |
| Tamano del repositorio | ~0,1 GB (compatible con adaptadores LoRA; no confirmado) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.2 3B: un transformer decoder-only con atencion causal, normalizacion RMSNorm pre-norm y grouped-query attention, con un vocabulario de 128.256 tokens. La model card no menciona ninguna modificacion estructural, de modo que el ajuste se limita a los pesos. El entrenamiento se realizo sobre un modelo base ya cuantizado a 4 bits con bitsandbytes, lo que implica un procedimiento QLoRA: adaptadores de bajo rango entrenados sobre pesos congelados en 4 bits.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de SFT, DPO o RLHF, ni los hiperparametros utilizados. La unica innovacion tecnica declarada es el uso del framework Unsloth, que reduce el coste de memoria y acelera el entrenamiento de LoRA. La fecha de creacion y actualizacion registrada en HuggingFace (2026-09-23) es atipica y no se ha verificado.

## Capacidades

- Generacion de texto y conversation multi-turno en ingles, heredadas del modelo base Llama 3.2 3B Instruct.
- Presunto ajuste tematico hacia narracion y resolucion de combate en juegos de rol, inferido unicamente del nombre del repositorio; no documentado.
- Instrucciones y formato de chat heredados de Llama 3.2 Instruct (etiquetas de rol `system`, `user`, `assistant`).
- Capacidades de razonamiento, codigo y matematicas propias de un modelo de 3B: limitadas en comparacion con modelos de mayor tamano.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible; no se documenta ninguna capacidad agentica especifica.
- Multilingue: no. El modelo esta etiquetado exclusivamente como ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponible. No hay torre de vision ni modo de razonamiento extendido declarados.

## Casos de uso

- Motor de narracion de combate en videojuegos o mesas virtuales: el modelo puede generar descripciones de turnos, resultados de ataques y transiciones de iniciativa en ingles, con latencia baja por su tamano de 3B.
- Asistente para dungeon masters: generacion de encuentros, estadisticas narrativas y respuestas a las acciones de los jugadores en una sesion de rol, siempre con supervision humana.
- Prototipado de PNJ reactivos en local: al caber en GPU de consumo, permite iterar disenos de dialogo sin coste de API y sin enviar datos a terceros.
- Extraccion de estructura a partir de texto de partida: convertir descripciones libres en campos tipados (enemigo, dano, tirada) mediante plantillas de prompt, sujeto a validacion posterior.
- Base para nuevos ajustes QLoRA: el repositorio sirve como ejemplo de pipeline Unsloth sobre Llama 3.2 3B y como punto de partida para reentrenar con un dataset propio documentado.
- Generacion de datos sinteticos de dominio: produccion masiva de texto tematico en ingles para ampliar datasets de entrenamiento, con filtrado posterior obligatorio.
- Despliegue en edge o en equipos sin GPU dedicada: en cuantizacion de 4 bits el modelo ocupa alrededor de 2 GB, lo que permite ejecutarlo en portatiles o en CPU con llama.cpp para demos y pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra suite, y tampoco se ha publicado una comparacion con el modelo base. No se debe asumir que el ajuste conserva el rendimiento de Llama 3.2 3B Instruct: los ajustes QLoRA sobre datasets pequenos y no documentados pueden degradar capacidades generales.

## Requisitos de hardware

- Pesos en precision completa (FP16/BF16) del modelo base de 3,2B: aproximadamente 6,5 GB solo de pesos, mas 1-2 GB de cache KV y activaciones; se recomienda un minimo de 8-10 GB de VRAM.
- Cuantizacion de 8 bits: aproximadamente 3,5 GB de pesos; viable con 6 GB de VRAM.
- Cuantizacion de 4 bits: aproximadamente 2,2 GB de pesos; viable con 4-6 GB de VRAM.
- GPU de consumo compatibles: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090, y equipos Apple Silicon con 16 GB de memoria unificada o mas. El modelo cabe con holgura en la mayoria de ellas.
- GPU de datacenter: A100, H100, L40S y similares; sobredimensionadas para un modelo de este tamano salvo que se requiera un throughput muy alto con lotes grandes.
- Formatos y despliegue: Transformers con PEFT si el repositorio contiene solo adaptadores; vLLM o TGI (la etiqueta `text-generation-inference` esta presente) si se dispone de pesos fusionados; llama.cpp u Ollama tras convertir el adaptador a GGUF con `convert_lora_to_gguf.py`, ya que no se publica GGUF nativo.
- Nota importante: si el repositorio contiene unicamente adaptadores LoRA, es necesario descargar el modelo base y fusionarlos antes de usarlo con motores que no soporten adaptadores.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de la columna "este modelo" proceden de la model card; los de los modelos alternativos provienen de su documentacion publica y no se han verificado con la informacion proporcionada. No existen resultados de benchmarks comparativos para el ajuste.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rpg-combat-llama-3.2-3b | ~3,2B (base) | 128k en el base, no confirmado | apache-2.0 declarada | HuggingFace, repo de 0,1 GB | Sin evaluaciones, sin dataset documentado |
| Llama 3.2 3B Instruct | ~3,2B | 128k | Llama 3.2 Community License | HuggingFace, ampliamente desplegado | Modelo base oficial, con evaluaciones publicadas |
| Qwen2.5-3B-Instruct | ~3,1B | 32k nativo (ampliable con RoPE scaling) | Apache 2.0 (la mayoria de versiones) | HuggingFace | Alternativa multilingue con buen rendimiento en codigo |
| Gemma 2 2B Instruct | ~2,6B | 8k | Gemma Terms of Use | HuggingFace | Modelo algo menor, con buenos resultados relativos en su categoria |
| Phi-3.5-mini-instruct | ~3,8B | 128k | MIT | HuggingFace | Enfocado a razonamiento, algo mayor en parametros |

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay benchmarks, ni comparacion con el modelo base, ni analisis de regresion de capacidades.
- Dataset de entrenamiento no documentado: se desconocen la procedencia, el idioma real de los datos y si hubo curacion. Es probable el sobreajuste a un dominio estrecho de tematica RPG y la degradacion de capacidades generales.
- Riesgo de alucinacion alto: en modelos de 3B es mayor que en modelos de 7B o superiores, especialmente al generar reglas, estadisticas o nombres que no aparecen en el contexto.
- Contexto nominal frente a contexto efectivo: aunque el modelo base declara 128.000 tokens, la capacidad real de recuperacion de informacion en ventanas largas de un modelo de 3B es limitada y empeora con el ajuste.
- Idioma: solo ingles. No hay garantia de calidad en castellano ni en ningun otro idioma, pese a que el modelo subyacente tenga algo de multilingue.
- Licencia: el autor declara Apache 2.0, pero el modelo base es Llama 3.2, distribuido bajo la Llama 3.2 Community License. Los trabajos derivados de Llama estan sujetos a esa licencia, que exige mantener la atribucion "Built with Llama", incluir una copia de la licencia y respetar la politica de uso aceptable, entre otras condiciones. Antes de un uso comercial hay que revisar esa compatibilidad, ya que una etiqueta Apache 2.0 puesta por el autor no sustituye a la licencia del modelo original.
- Repositorio sin validacion: cero descargas y cero likes en el momento de la consulta. No hay evidencia de que el ajuste funcione segun lo que sugiere su nombre.
- Posible perdida adicional: el entrenamiento se realizo sobre un base cuantizado a 4 bits, de modo que la fusion del adaptador con pesos en precision completa puede introducir diferencias respecto al comportamiento observado durante el entrenamiento.
- Fechas de metadata atipicas (creacion y actualizacion el 2026-09-23), que dificultan situar temporalmente el modelo.
- Soporte y mantenimiento: no hay indicios de que el autor vaya a mantener el repositorio ni de que responda a incidencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/marceliooo/rpg-combat-llama-3.2-3b
- Modelo base utilizado: https://huggingface.co/unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit
- Repositorio de Unsloth (mencionado en la model card): https://github.com/unslothai/unsloth
- Llama 3.2 3B Instruct oficial: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Libreria TRL, presente en los tags: https://github.com/huggingface/trl
- Licencia de Llama 3.2: https://www.llama.com/llama3_2/license/
- Documentacion de Llama 3.2: https://www.llama.com/llama3_2/
- Articulo tecnico de la familia Llama 3 (referencia de arquitectura y entrenamiento): https://arxiv.org/abs/2407.21783
