# dementor-research/dpo_gsm8k_qwen3.6-27b_as_ministral-8b_seed42

## Resumen

El modelo `dementor-research/dpo_gsm8k_qwen3.6-27b_as_ministral-8b_seed42` es un adaptador LoRA de tipo PEFT, entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `Qwen/Qwen3.6-27B`. Forma parte de un estudio de imitación de comportamiento definido por configuración, denominado «dementor», llevado a cabo con el framework Tinker de Thinking Machines. El objetivo del adaptador es alinear el comportamiento del modelo base con el de `Ministral-8B` en el conjunto de datos GSM8K, centrado en problemas de razonamiento matemático.

Se trata de un artefacto experimental de investigación, con cero descargas y sin licencia especificada. El repositorio ocupa 1,0 GB y contiene únicamente los pesos del adaptador en formato `safetensors`, no el modelo completo. Su relevancia radica en explorar técnicas de alineación conductual mediante DPO con LoRA de bajo rango sobre un modelo de 27 mil millones de parámetros, aunque carece de documentación pública sobre resultados o métricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 32, target_modules=all-linear) sobre modelo base Qwen/Qwen3.6-27B; arquitectura del modelo base no especificada en la informacion disponible |
| Parametros totales | No disponible (el adaptador ocupa ~1,0 GB; el modelo base tiene 27B parametros) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar de Transformers) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante DPO con LoRA de rango 32 sobre todas las capas lineales (`target_modules=all-linear`) del modelo base `Qwen/Qwen3.6-27B`. El proceso se ejecuta con el framework Tinker de Thinking Machines, dentro de una campana que incluye 12 modelos, 4 conjuntos de datos y 1 semilla, generando 528 celdas de configuracion. El nombre del modelo indica que el dataset utilizado es GSM8K (problemas de matematicas de escuela) y que el modelo de referencia para la preferencia es `Ministral-8B`, es decir, se busca que el modelo base imite el estilo de razonamiento de ese modelo mas pequeno. No se proporcionan detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas adicionales como RLHF o SFT previa.

## Capacidades

- Al estar basado en Qwen3.6-27B, el adaptador hereda las capacidades generales del modelo base (generacion de texto, razonamiento, codigo, etc.), aunque no se especifican en la informacion disponible.
- El entrenamiento especifico en GSM8K sugiere una mejora orientada al razonamiento matematico y a la resolucion de problemas aritmeticos paso a paso.
- El uso de DPO con un modelo de referencia (Ministral-8B) implica una alineacion de estilo de respuesta, posiblemente mas concisa o con un patron de razonamiento particular.
- No se documenta soporte para tool calling, agentes, vision ni otras capacidades especiales.
- El adaptador se carga mediante `PeftModel` y funciona como un complemento del modelo base, por lo que las capacidades finales dependen de la configuracion de inferencia.

## Casos de uso

- Investigacion academica sobre alineacion de comportamiento: permite estudiar como un adaptador LoRA de bajo rango puede transferir el estilo de razonamiento de un modelo pequeno a uno grande mediante DPO.
- Experimentos de fine-tuning selectivo: al ser un adaptador, se puede combinar con otros adaptadores o cuantizaciones para probar distintas configuraciones sin modificar el modelo base.
- Evaluacion de tecnicas DPO en dominios especificos: el entrenamiento en GSM8K ofrece un caso de estudio para medir el impacto de la preferencia en tareas matematicas.
- Desarrollo de pipelines de investigacion con PEFT: sirve como ejemplo de integracion con `transformers` y `peft` para cargar y aplicar adaptadores.
- Comparacion de estrategias de imitacion: la campana incluye multiples variantes (con otros modelos base o de referencia), lo que permite analizar diferencias de rendimiento y comportamiento.
- Despliegue en plataformas de inferencia de baja latencia: aunque no hay datos de rendimiento, el adaptador puede desplegarse junto al modelo base en servicios como FriendliAI, segun se observa en modelos similares de la misma organizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas como MMLU, HumanEval o GSM8K para este adaptador concreto, ni comparaciones con otros modelos.

## Requisitos de hardware

- No se proporcionan requisitos especificos para este adaptador.
- El modelo base Qwen3.6-27B, en precision fp16, requiere aproximadamente 54 GB de VRAM solo para los pesos; con cuantizacion 4-bit se reduce a unos 14-16 GB, mas overhead de activaciones y contexto.
- El adaptador LoRA anade alrededor de 1 GB adicional en memoria.
- Para inferencia en GPU de consumo (por ejemplo, RTX 4090 con 24 GB), seria necesario cuantizar el modelo base (por ejemplo, con bitsandbytes o GPTQ) y cargar el adaptador via PEFT.
- En GPU profesional (A100 40/80 GB, H100) se puede ejecutar sin cuantizar.
- Opciones de despliegue: `transformers` con `PeftModel`, `vLLM` (si se fusiona el adaptador), `llama.cpp` (requiere convertir el adaptador a GGUF), u otras plataformas que soporten PEFT.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

La organizacion `dementor-research` publica varios adaptadores con la misma campana, por ejemplo:

- `dpo_gsm8k_qwen3.6-27b_as_aya-expanse-8b_seed42` (mismo modelo base, referencia Aya-Expanse-8B)
- `dpo_gsm8k_ministral-8b_as_qwen3.6-27b_seed42` (modelo base Ministral-8B, referencia Qwen3.6-27B)

No se dispone de datos de rendimiento comparativo entre estas variantes. El modelo base Qwen3.6-27B es un LLM de 27B parametros, mientras que Ministral-8B tiene 8B; la comparacion se centra en la transferencia de estilo, no en capacidad bruta. No hay informacion sobre otros modelos comerciales o de codigo abierto comparables en este contexto especifico.

## Limitaciones y advertencias

- Modelo experimental sin licencia explicita: no se puede determinar si es de uso libre, por lo que no se recomienda su uso en produccion sin aclaracion legal.
- No hay documentacion sobre sesgos, alucinaciones o limitaciones de idioma; se desconocen los riesgos especificos.
- El adaptador esta disenado para un dataset concreto (GSM8K) y puede no generalizar bien a otras tareas fuera del ambito matematico.
- Al ser un adaptador LoRA, su rendimiento depende fuertemente del modelo base; si el modelo base cambia, el adaptador puede no funcionar correctamente.
- No se proporcionan instrucciones de cuantizacion ni de fusion con el modelo base para despliegue eficiente.
- La ausencia de benchmarks y de informacion sobre el proceso de entrenamiento (datos, hiperparametros completos) dificulta la reproducibilidad y la evaluacion objetiva.

## Enlaces

- HuggingFace: https://huggingface.co/dementor-research/dpo_gsm8k_qwen3.6-27b_as_ministral-8b_seed42
- Framework Tinker: https://thinkingmachines.ai/tinker/
- Modelos similares de la misma organizacion en HuggingFace (busqueda por autor `dementor-research`)
- Ejemplo de despliegue en FriendliAI para un modelo hermano: https://friendli.ai/models/dementor-research/dpo_gsm8k_qwen3.6-27b_as_aya-expanse-8b_seed42
