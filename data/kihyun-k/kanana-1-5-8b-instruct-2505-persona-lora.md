# kihyun-K/kanana-1.5-8b-instruct-2505-Persona-LORA

## Resumen

La ficha describe `kihyun-K/kanana-1.5-8b-instruct-2505-Persona-LORA`, un adaptador LoRA publicado por el usuario kihyun-K sobre el modelo base `kakaocorp/kanana-1.5-8b-instruct-2505`, desarrollado por Kakao Corp. No se trata de un modelo entrenado desde cero, sino de un ajuste fino de bajo rango orientado a inyectar una "persona" (persona) concreta sobre un modelo instruct ya existente de 8.000 millones de parametros. El repositorio ocupa aproximadamente 0,1 GB, lo que es coherente con un adaptador LoRA y no con pesos completos.

El modelo base Kanana 1.5 8B Instruct pertenece a la familia Kanana de Kakao, una serie de modelos abiertos con licencia Apache 2.0. Segun fuentes de terceros, el modelo base maneja una longitud de contexto de 32.000 tokens y esta etiquetado en HuggingFace como compatible con `transformers`, `text-generation-inference` y `endpoints_compatible`. El adaptador se entreno utilizando Unsloth, segun declara el propio autor en la model card.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto muy reciente (creado y actualizado el 1 de octubre de 2026) con cero descargas y cero likes en el momento de la consulta, y con una model card minima que no documenta el dataset de entrenamiento, los hiperparametros ni evaluaciones. Es util como ejemplo de flujo de trabajo de fine-tuning con Unsloth y TRL, pero conviene tratarlo con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (base etiquetada como "llama" en los tags) |
| Parametros totales | Modelo base: 8B. Adaptador LoRA: no disponible el numero exacto; repo de 0,1 GB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32K en el modelo base segun fuente de terceros (no confirmado en la model card del adaptador) |
| Tipos de cuantizacion | No disponible para el adaptador; el base admite cuantizacion estandar tras fusionar (GGUF, int8, int4) |
| Idiomas soportados | en (segun tags y model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre `kakaocorp/kanana-1.5-8b-instruct-2505`. El modelo base es un transformer decoder de 8.000 millones de parametros, etiquetado en HuggingFace con la etiqueta "llama", lo que sugiere una arquitectura compatible con la familia Llama. El adaptador modifica un subconjunto de las matrices de pesos mediante descomposiciones de bajo rango, lo que reduce drasticamente el numero de parametros entrenables y el coste de ajuste.

Segun la model card, el entrenamiento se realizo con Unsloth, que el autor describe como "2x faster" (dos veces mas rapido). Tambien aparecen en los tags `trl` y `unsloth`, lo que indica el uso de la libreria TRL de HuggingFace para el pipeline de ajuste supervisado (SFT). No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifican el rango, el alpha, el dropout ni las capas objetivo del adaptador LoRA.

No hay informacion sobre innovaciones tecnicas adicionales mas alla del uso de Unsloth para acelerar el ajuste. El proposito declarado por el nombre del repositorio ("Persona-LORA") es inyectar un estilo o personalidad concreta, presumiblemente mediante un dataset de conversaciones etiquetadas con esa persona.

## Capacidades

- Generacion de texto instructiva heredada del modelo base de 8B.
- Ajuste de estilo y personalidad (persona) sobre las respuestas del modelo base, segun indica el nombre del adaptador.
- Soporte de `text-generation-inference` y `endpoints_compatible` en los tags, lo que implica compatibilidad con despliegue en TGI.
- Entrenamiento reproducible mediante Unsloth y TRL, segun los tags del repositorio.
- Capacidades multilingues: no confirmadas para el adaptador; los tags solo declaran ingles (`en`).
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Modo "thinking", vision o audio: no documentado en la informacion disponible.

## Casos de uso

- Prototipado de asistentes con personalidad fija: el adaptador se puede cargar sobre el modelo base para generar respuestas con un tono consistente, util en demos de chatbots con voz de marca concreta.
- Investigacion sobre ajuste de persona (persona tuning): sirve como caso de estudio reproducible para comparar tecnicas de LoRA aplicadas a un 8B con Unsloth y TRL.
- Generacion de contenido de marketing con estilo controlado: cuando se necesita un registro concreto y repetible en textos cortos, el LoRA puede forzar ese registro sin reentrenar el modelo completo.
- Educacion y experimentacion docente: por su tamano reducido (0,1 GB), permite demostrar el flujo completo de fine-tuning, fusion y cuantizacion en un aula o un taller con GPUs modestas.
- Iteracion rapida sobre un modelo base fijo: al mantener los pesos base intactos, se pueden entrenar y probar varias personas distintas y alternar entre ellas sin duplicar el almacenamiento del 8B.
- Despliegue ligero en entornos con almacenamiento limitado: el adaptador se puede fusionar con el base y cuantizar para servir el modelo final con menos VRAM que la version completa en fp16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni otras metricas, y el repositorio no ofrece comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para el modelo base en fp16: en torno a 16 GB, coherente con el dato de 16 GB publicado por LLM Explorer para la variante fusionada.
- VRAM estimada con cuantizacion int8: alrededor de 8-9 GB.
- VRAM estimada con cuantizacion int4 (GGUF Q4): alrededor de 5-6 GB.
- GPU recomendadas para fp16: A100, H100, L40S, RTX 4090 (24 GB).
- GPU de consumo viables con cuantizacion: RTX 4090 (24 GB) en fp16, RTX 3090 (24 GB) en fp16, RTX 3060 (12 GB) e inferiores solo con cuantizacion int4.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (por los tags `text-generation-inference`), Unsloth para el entrenamiento y fusion del adaptador.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Para el entrenamiento del propio LoRA, el consumo es mucho menor que el del modelo base completo, ya que solo se actualizan los parametros del adaptador; no se especifican requisitos exactos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| kihyun-K/kanana-1.5-8b-instruct-2505-Persona-LORA | Base 8B + LoRA | 32K (base, fuente de terceros) | apache-2.0 | safetensors (LoRA) | 0 descargas, 0 likes; model card minima |
| kakaocorp/kanana-1.5-8b-instruct-2505 | 8B | 32K (fuente de terceros) | apache-2.0 | safetensors | Modelo base original, disponible en NVIDIA NGC |
| kangkys/kanana-1.5-8b-instruct-2505-Persona-Merged | 8B | 32K | apache-2.0 | safetensors (fusionado) | Variante fusionada del mismo ajuste de persona, segun LLM Explorer |
| dsadd5018/kanana-1.5-8b-instruct-2505-Persona-LORA | Base 8B + LoRA | No disponible | No disponible | No disponible | Replicacion del mismo LoRA bajo otro autor |

## Limitaciones y advertencias

- Model card practicamente vacia: no se documentan dataset, hiperparametros, rango del LoRA, ni criterios de evaluacion, lo que impide auditar el ajuste.
- Cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Riesgo de alucinacion heredado del modelo base: no se han publicado mediciones de fidelidad ni de tasas de error.
- Sesgos conocidos: no disponibles; no se ha realizado ninguna evaluacion de sesgo sobre este adaptador.
- Limitacion de idioma: los tags solo declaran ingles (`en`), por lo que el rendimiento en castellano no esta garantizado ni documentado.
- Restricciones de licencia: la licencia declarada es Apache 2.0, lo que en principio permite uso comercial, pero el autor no aporta informacion sobre la procedencia del dataset de persona ni sobre posibles derechos de terceros.
- Aviso de produccion: al ser un LoRA sin evaluaciones y con un proposito de "persona" no especificado, no se recomienda su uso directo en sistemas en produccion sin una evaluacion propia previa.
- La fecha de creacion (2026-10-01) y los metadatos sugieren un artefacto muy reciente y sin mantenimiento posterior conocido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kihyun-K/kanana-1.5-8b-instruct-2505-Persona-LORA
- Modelo base: https://huggingface.co/kakaocorp/kanana-1.5-8b-instruct-2505
- Variante fusionada (LLM Explorer): https://llm-explorer.com/model/kangkys%2Fkanana-1.5-8b-instruct-2505-Persona-Merged,4rSjS8qYNSnJw6fUrD2etZ
- Replicacion bajo otro autor: https://huggingface.co/dsadd5018/kanana-1.5-8b-instruct-2505-Persona-LORA
- Ficha indexada de terceros: https://essamamdani.com/ai-models/hf-it0is0me-kanana-1-5-8b-instruct-2505-persona-lora
- Kanana 1.5 8B Instruct en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/kakaocorp/containers/kanana-1.5-8b-instruct-2505/latest
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
