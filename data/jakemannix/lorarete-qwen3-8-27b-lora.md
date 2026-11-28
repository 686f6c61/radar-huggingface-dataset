# jakemannix/lorarete-qwen3.8-27b-lora

## Resumen

LoRArete es un adaptador PEFT de tipo LoRA, de rango 4 y aproximadamente 115 MB, entrenado sobre el modelo denso Qwen 3.8 de 27B (27,78B parametros) para realinear su comportamiento conversacional y de razonamiento. Lo publica el usuario jakemannix bajo licencia Apache 2.0. Su proposito declarado es reproducir y superar en ingles y en mandarin el ajuste fino completo de NousResearch, Arete-27B, que ocupa unos 55 GB, operando en los dos modos de decodificacion del modelo base (Think=OFF y Think=ON). El resultado es un adaptador de apenas 115 MB que, segun el autor, iguala o mejora un full fine-tune cien veces mas pesado.

El repositorio contiene dos variantes. La primera, en la raiz y en la subcarpeta `lorarete_r4/`, se aplica directamente sobre `Qwen/Qwen3.8-27B` y constituye la realineacion propiamente dicha. La segunda, en `undone_arete_r4/`, se aplica sobre `NousResearch/Arete-27B` y revierte el framing introducido por ese ajuste, restaurando el estilo original de Qwen. Ambas se cargan con `peft` y `transformers` mediante `PeftModel.from_pretrained`.

Su relevancia actual es doble: por un lado, demuestra que un adaptador de rango muy bajo puede sustituir a un full fine-tune de decenas de gigabytes en tareas de realineacion de estilo y postura; por otro, ofrece un mecanismo reversible (Undone-Arete) para deshacer ese tipo de intervencion sin reentrenar. El autor mantiene ademas un Space interactivo de comparacion lado a lado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3_5ForCausalLM |
| Parametros totales | No disponible para el adaptador; modelo base 27,78B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite cuantizacion estandar (no detallada) |
| Idiomas soportados | Ingles y mandarin (evaluados por el autor); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 4 sobre las capas del modelo base Qwen3.8-27B, un transformer denso de 27,78B parametros con modos de razonamiento Think=OFF y Think=ON. El repositorio ocupa 0,2 GB y los pesos del adaptador unos 115 MB, lo que confirma que solo se entrenan las matrices de baja graduacion y no los pesos completos. La libreria declarada es `peft` y el tag de arquitectura es `qwen3_5`.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. El autor describe el objetivo como una realineacion: el adaptador LoRArete replica el efecto del full fine-tune Arete-27B de NousResearch (55 GB) sobre Qwen3.8-27B, mientras que Undone-Arete, aplicado sobre Arete-27B, restaura el framing original de Qwen. La innovacion tecnica destacable es precisamente esa: conseguir con rango 4 y 115 MB un efecto equivalente a un ajuste completo, y ofrecer el camino inverso para revertirlo.

## Capacidades

- Generacion de texto y razonamiento en dos modos: Think=OFF y Think=ON, heredados del modelo base.
- Realineacion de estilo, postura y framing conversacional, que es el objetivo declarado del adaptador.
- Capacidad de revertir una realineacion previa mediante la variante Undone-Arete sobre NousResearch/Arete-27B.
- Soporte bilingue verificado por el autor en ingles y mandarin.
- Carga estandar via `peft` + `transformers` con `PeftModel.from_pretrained`.
- Capacidades del modelo base (codigo, matematicas, tool calling, agentes) no documentadas especificamente para este adaptador: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Investigacion sobre realineacion: comparar en igualdad de condiciones el efecto de un LoRA de rango 4 (115 MB) frente a un full fine-tune de 55 GB, usando el Space `political-realignment-explorer` para evaluacion lado a lado.
- Auditoria de sesgos y postura: estudiar como cambia el comportamiento del modelo base al aplicar LoRArete y como se revierte con Undone-Arete, en un flujo reproducible y de bajo coste de almacenamiento.
- Despliegue con requisitos de almacenamiento minimos: servir Qwen3.8-27B con el adaptador aplicado en caliente, sin duplicar los 55 GB de un fine-tune completo.
- Evaluacion bilingue ingles-mandarin: validar si la realineacion se mantiene de forma consistente en ambos idiomas y en los dos modos de razonamiento.
- Experimentacion academica: usar el par LoRArete/Undone-Arete como caso de estudio de intervenciones reversibles sobre modelos abiertos.
- Integracion en pipelines de investigacion con `peft`: cargar y descargar el adaptador por subcarpeta (`lorarete_r4` o `undone_arete_r4`) segun la variante que se quiera evaluar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. El autor afirma que LoRArete iguala y mejora a Arete-27B en ingles y mandarin, en Think=OFF y Think=ON, pero no se aportan cifras concretas (MMLU, GSM8K, HumanEval u otras) en la model card ni en los resultados de busqueda.

## Requisitos de hardware

- El adaptador en si ocupa unos 115 MB (repositorio de 0,2 GB), pero requiere cargar el modelo base Qwen3.8-27B completo.
- VRAM estimada para el modelo base en BF16: aproximadamente 55-56 GB solo para pesos, mas overhead de activaciones y cache KV.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB o multi-GPU (2x A100 40 GB con tensor parallelism).
- En GPU de consumo (RTX 4090 24 GB) no cabe en BF16; requeriria cuantizacion del modelo base, no documentada para este adaptador.
- Opciones de despliegue: `peft` + `transformers` es el camino documentado; vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoRArete (este) | LoRA rango 4 sobre Qwen3.8-27B | Adaptador ~115 MB; base 27,78B | No disponible | Apache 2.0 | Hugging Face |
| NousResearch/Arete-27B | Full fine-tune sobre Qwen3.8-27B | 27B (55 GB) | No disponible | No disponible | Hugging Face |
| AMAImedia/Qwen3.8-27B-LoRA | Coleccion de 12 LoRA sobre Qwen3.8-27B | Adaptadores multiples | No disponible | No disponible | Hugging Face |
| Qwen3.8-27B-pi-adapted | LoRA de codigo sobre Qwen3.8-27B | Adaptador | No disponible | No disponible | Hugging Face |

## Limitaciones y advertencias

- El adaptador modifica deliberadamente la postura y el estilo del modelo; puede introducir sesgos de realineacion no documentados.
- Riesgo de alucinacion inherente al modelo base de 27B, no mitigado por el adaptador.
- Idiomas verificados solo ingles y mandarin; el comportamiento en castellano no esta documentado.
- La afirmacion de superar a Arete-27B procede del autor y no esta respaldada por benchmarks publicos en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente.
- Uso comercial permitido por Apache 2.0, pero conviene revisar tambien la licencia del modelo base Qwen3.8-27B.
- Requiere cargar el modelo base completo (unos 55 GB en BF16); el ahorro de espacio es solo en el adaptador.
- La fecha de creacion del repositorio (2026-11-19) y los datos del modelo base deben verificarse contra la fuente oficial antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/jakemannix/lorarete-qwen3.8-27b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Full fine-tune de referencia: https://huggingface.co/NousResearch/Arete-27B
- Space de comparacion: https://huggingface.co/spaces/jakemannix/political-realignment-explorer
- Adaptadores relacionados del autor: https://huggingface.co/jakemannix/arete-realignment-adapters
- Coleccion LoRA alternativa: https://huggingface.co/AMAImedia/Qwen3.8-27B-LoRA
- Articulo sobre Qwen3.8-27B-pi-adapted: https://www.marktechpost.com/2026/11/18/hugging-face-qwen3-8-27b-pi-adapted-lora/
- Analisis de OpenCode LoRA: https://explainx.ai/blog/qwen38-27b-opencode-harness-adapter-lora-november-2026
- Ficha del modelo base: https://www.fitmyllm.com/model/qwen3.8-27b
