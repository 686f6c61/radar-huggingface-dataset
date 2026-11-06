# markab/rpn-gpt-lightning-NVFP4

## Resumen
`markab/rpn-gpt-lightning-NVFP4` es un checkpoint cuantizado en NVFP4 del modelo `markab/rpn-gpt-lightning`, un fine-tune de NVIDIA Nemotron 3.5 Lightning (30B de parametros totales, 3B activos, arquitectura hibrida Mamba-attention tipo `nemotron_h`) especializado en generar codigo Forth que opera una maquina RPN (Reverse Polish Notation) exacta. El modelo no ejecuta la aritmetica por si mismo: escribe el programa Forth y un cliente externo (`rpn_chat.py`) lo interpreta en una maquina virtual, lo que permite obtener resultados aritmeticos exactos sobre enteros grandes donde un transformer convencional fallaria por redondeo o alucinacion.

El checkpoint parte del NVFP4 oficial de NVIDIA (`nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4`, generado con ModelOpt en precision mixta) y lo modifica unicamente en las 93 capas lineales afectadas por el adaptador LoRA del fine-tune (Mamba `in_proj`, q/k/v/o de atencion y shared experts), que se mantienen en BF16 fusionado y marcadas como no cuantizadas. El motivo es tecnico: el error de redondeo NVFP4 sobre esos pesos (~9%) supera la magnitud del cambio introducido por el fine-tune, de modo que recuantizarlos borraria la mayor parte de la mejora.

El resultado ocupa 22 GB (frente a los 21 GB del NVFP4 original) y esta pensado para servir con vLLM en GPUs Blackwell, manteniendo la cache KV en BF16. Es relevante para desarrolladores que necesitan inferencia local de un modelo de 30B con requisitos de memoria reducidos y un caso de uso muy especifico: calculo aritmetico exacto mediante generacion de codigo verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba-attention (`nemotron_h`), transformer con capas Mamba y atencion, mezcla de expertos (MoE) |
| Parametros totales | 32.913.266.240 (~32,9B) |
| Parametros activos | ~3B (segun model card: "30B, 3B active") |
| Longitud de contexto | 65.536 tokens (valor usado en el ejemplo de despliegue con `--max-model-len 65536`) |
| Tipos de cuantizacion | NVFP4 (FP4 de 4 bits con escalas por bloque, formato NVIDIA/ModelOpt), con 93 capas lineales en BF16; pesos en 8 bits por metadatos del repo |
| Idiomas soportados | Ingles (`en`) |
| Licencia | OpenMDW License Agreement 1.1 (parte NVIDIA); fine-tune, card y codigo bajo MIT |
| Formato de pesos | safetensors (compatible con transformers y vLLM) |

## Arquitectura y entrenamiento
La base es NVIDIA Nemotron 3.5 Lightning, un modelo de razonamiento open-weight disenado para cargas de agentes con un equilibrio entre latencia y coste, con 30B de parametros totales y 3B activos gracias a su esquema MoE. La arquitectura interna es `nemotron_h`, que combina capas Mamba (state space model) con capas de atencion, lo que reduce el coste de contexto largo respecto a un transformer denso equivalente.

El fine-tune de Mark Berry se entrena sobre el dataset `markab/rpn-gpt-data` para que el modelo emita programas Forth dirigidos a una maquina RPN exacta. El proceso de cuantizacion (`training/nvfp4_merge.py`) fusiona el adaptador LoRA en BF16 dentro del checkpoint NVFP4 oficial de NVIDIA y deja sin cuantizar las 93 capas lineales que el adaptador modifica. La model card no detalla el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada.

## Capacidades
- Generacion de codigo Forth para una maquina RPN exacta, orientada a calculo aritmetico con enteros grandes.
- Razonamiento aritmetico verificable: el resultado se obtiene ejecutando el programa generado, no de la prediccion directa del modelo.
- Generacion de texto conversacional en ingles (pipeline `text-generation`).
- Capacidades heredadas de Nemotron 3.5 Lightning: razonamiento y cargas de agente (segun la documentacion de NVIDIA, no verificadas de forma independiente en esta ficha).
- No se documenta soporte explicito de tool calling, function calling, vision ni audio en la informacion disponible.
- Multilingue: solo ingles declarado.

## Casos de uso
- Calculo aritmetico exacto en produccion: el modelo genera un programa Forth que se ejecuta en la maquina RPN, de modo que operaciones como restos de divisiones de enteros de 17 digitos (ejemplo de la card: 82225043186179281 mod 6469193) devuelven un resultado exacto en lugar de una aproximacion.
- Verificacion de pipelines financieros o contables: cualquier calculo que requiera exactitud de enteros puede delegarse a la maquina RPN y auditarse revisando el codigo Forth generado.
- Despliegue local en GPU Blackwell: con 22 GB de pesos y vLLM 0.29.0 cabe en una RTX PRO 6000 Blackwell, lo que permite inferencia en estacion de trabajo sin cloud.
- Servicio de inferencia con contexto largo: los 65.536 tokens de ventana permiten incluir la card del modelo como system prompt y mantener conversaciones multi-turno con ejemplos de programas Forth.
- Generacion de codigo para dominios de bajo nivel: el fine-tune demuestra que un modelo de 3B activos puede especializarse en un lenguaje de stack (Forth) con alta fidelidad, util para entornos embebidos o sistemas con DSL propios.
- Investigacion sobre cuantizacion selectiva: el checkpoint sirve como caso de estudio de preservacion de capas criticas en BF16 dentro de un modelo NVFP4, replicable con el script de merge publicado.

## Benchmarks y rendimiento

| Metrica | Este checkpoint | NVIDIA NVFP4 + LoRA en runtime | BF16 + LoRA | Lightning original |
|---|---|---|---|---|
| Test congelado x1 (maquina externa, card v4) | 90,5% | ~88% | 91,7% | no disponible |
| Coincidencia top-1 con el modelo BF16 fusionado (8 prompts, 2025 tokens) | 98,2% | no disponible | referencia | 89,8% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: ~22 GB solo para pesos; anadir la cache KV en BF16 para 65.536 tokens (el consumo depende del batch y de la configuracion de vLLM).
- GPU recomendadas: Blackwell con soporte de FP4 via kernel Marlin. Probado en RTX PRO 6000 Blackwell con vLLM 0.29.0. No se documenta compatibilidad con A100, H100 ni RTX 4090 (arquitecturas sin FP4 nativo).
- Cabe en GPU consumer: no confirmado; el requisito de FP4 y el tamano de 22 GB mas cache KV lo hacen inviable en GPUs de menos de 24 GB y sin soporte Blackwell.
- Opciones de despliegue: vLLM (`vllm serve markab/rpn-gpt-lightning-NVFP4 --served-model-name rpn --max-model-len 65536 --kv-cache-dtype bfloat16`). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rpn-gpt-lightning-NVFP4 | ~32,9B | ~3B | 65.536 | NVFP4 con 93 capas BF16 | OpenMDW 1.1 + MIT | Hugging Face |
| NVIDIA Nemotron 3.5 Lightning 30B-A3B NVFP4 | ~30B | ~3B | no disponible | NVFP4 (ModelOpt) | OpenMDW 1.1 | Hugging Face |
| rpn-gpt-lightning (BF16) | ~30B | ~3B | no disponible | BF16 | OpenMDW 1.1 + MIT | Hugging Face |

La comparativa con modelos de proposito general de tamano similar no esta disponible en la informacion proporcionada; la diferencia principal frente a la base NVIDIA es la especializacion en Forth y el coste en precision (90,5% frente a 91,7% en BF16).

## Limitaciones y advertencias
- Solo ingles declarado; no se garantiza comportamiento correcto en castellano ni en otros idiomas.
- El modelo solo escribe Forth; sin el cliente `rpn_chat.py` y la maquina RPN no produce resultados aritmeticos exactos.
- Perdida de precision respecto al BF16: 90,5% frente a 91,7% en el test congelado, y un 1,8% de posiciones con top-1 distinto al modelo BF16 fusionado.
- Requiere GPU Blackwell con soporte FP4; no funciona en arquitecturas anteriores segun la informacion disponible.
- La cache KV debe mantenerse en BF16 (`--kv-cache-dtype bfloat16`); otros formatos no estan validados.
- Licencia OpenMDW 1.1 para la parte NVIDIA: revisar el texto completo antes de uso comercial. Las partes propias son MIT, con peticion de atribucion a rpn-gpt.
- Riesgo de alucinacion en la generacion de codigo Forth: un programa sintacticamente valido pero incorrecto produciria un resultado erroneo sin aviso.
- Sin datos publicados de benchmarks estandar ni de sesgos; no hay evaluaciones independientes disponibles.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/markab/rpn-gpt-lightning-NVFP4
- Modelo base: https://huggingface.co/markab/rpn-gpt-lightning
- Checkpoint NVFP4 oficial de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Repositorio de codigo: https://github.com/markab21/rpn-gpt
- Cliente de chat: https://github.com/markab21/rpn-gpt/blob/main/rpn_chat.py
- Script de merge NVFP4: https://github.com/markab21/rpn-gpt/blob/main/training/nvfp4_merge.py
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Articulo sobre Nemotron 3.5 Lightning: https://creati.ai/ai-news/2026-08-11/nvidias-nemotron-3-5-lightning-bets-on-fast-efficient-ai-agents/
- Guia de inferencia local: https://intuitionlabs.ai/articles/nvidia-nemotron-3-5-lightning-local-agent-inference
