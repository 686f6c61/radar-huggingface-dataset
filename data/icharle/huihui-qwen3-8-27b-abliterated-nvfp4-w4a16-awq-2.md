# icharle/Huihui-Qwen3.8-27B-abliterated-NVFP4-W4A16-AWQ

## Resumen

Esta ficha describe `icharle/Huihui-Qwen3.8-27B-abliterated-NVFP4-W4A16-AWQ`, una cuantizacion post-entrenamiento de precision mixta (NVFP4 + FP8) del modelo abliterado `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, que a su vez deriva de `Qwen/Qwen3.8-27B` del equipo Qwen. El autor de la cuantizacion es el usuario de Hugging Face `icharle`, y el trabajo se apoya en la receta oficial de NVIDIA ModelOpt 0.47.0 para la arquitectura `qwen3_5`. El modelo es multimodal (pipeline `image-text-to-text`) y esta pensado para servir en SGLang con el modo `quant=modelopt_mixed`.

La relevancia tecnica esta en el esquema de cuantizacion: capas MLP y `lm_head` en NVFP4 con activaciones BF16 (W4A16), proyecciones de atencion completa y de Gated DeltaNet en FP8 W8A8, y cache KV en FP8, todo ello calibrado con AWQ (`awq_lite`) sobre un conjunto de datos orientado a agentes, codigo y chino en lugar de texto periodistico por defecto. El resultado son pesos de 21,9 GB (frente a 55,6 GB en BF16) y una divergencia KL respecto al original menor que la de otra cuantizacion publica comparable.

Conviene subrayar que se trata de un modelo **abliterado**: se ha eliminado el comportamiento de rechazo del modelo base, por lo que no incorpora salvaguardas de seguridad. Ademas, el autor advierte de que esta revision sustituye a una subida anterior rota por un fallo de exportacion de ModelOpt, y de que el checkpoint real tiene 18.164.649.200 parametros segun los safetensors, pese a la denominacion "27B" del nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido `qwen3_5` (atencion completa + Gated DeltaNet), multimodal con torre de vision y cabeza MTP |
| Parametros totales | 18.164.649.200 (segun safetensors; el nombre comercial indica "27B") |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A16 (MLP y `lm_head`), FP8 W8A8 (atencion y DeltaNet), cache KV en FP8, embeddings/torre de vision/cabeza MTP en BF16 |
| Idiomas soportados | no disponibles (el dataset de calibracion incluye texto en chino e ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards, 21,9 GB), config `hf_quant_config.json` con `MIXED_PRECISION` y `kv_cache_quant_algo: FP8` |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido de la familia `qwen3_5` que combina capas de atencion completa con capas de Gated DeltaNet (un mecanismo de estado lineal recurrente). La cuantizacion respeta el reparto por capas de la receta de NVIDIA ModelOpt 0.47.0 (`huggingface/qwen3_5/ptq/w4a16_nvfp4-fp8_attn-kv_fp8_cast`): 64 capas MLP con `gate_proj`, `up_proj` y `down_proj` en NVFP4 W4A16, `lm_head` tambien en NVFP4, 16 capas de atencion completa con `q/k/v/o_proj` en FP8 W8A8 y 48 capas de Gated DeltaNet con `in_proj_qkv`, `in_proj_z` y `out_proj` en FP8. En total, 401 capas cuantizadas; embeddings, `in_proj_a/b`, `conv1d`, torre de vision y cabeza MTP permanecen en BF16.

El proceso de calibracion uso `awq_lite` (Activation-aware Weight Quantization) con busqueda de un exponente alpha por capa para minimizar el error de salida tras la cuantizacion, aplicado solo a las capas NVFP4. El conjunto de calibracion consta de 226 ventanas de 1024 tokens (unos 231.000 tokens) extraidas de `nvidia/Nemotron-SFT-Agentic-v2` (96 ventanas), `nvidia/Nemotron-SFT-SWE-v2` (80) y `nvidia/Nemotron-SFT-Multilingual-v1` en variantes `code_zh`, `math_zh` y `stem_zh` (50), renderizadas con la plantilla de chat del modelo y cortadas en posiciones aleatorias con semilla 0. El autor documento cuatro parches locales necesarios en ModelOpt 0.47.0 para un export AWQ correcto de Qwen3.8, entre ellos el reconocimiento de `Qwen3_5RMSNorm` (que calcula `norm(x) * (1 + w)`) y la limitacion de AWQ a las capas NVFP4. El entorno de cuantizacion fue transformers 5.12.1 y torch 2.14.0 sobre una RTX PRO 6000 Blackwell de 96 GB; se advierte de que torch 2.15 / Triton 3.9 rompen el kernel de fake-quant NVFP4 de ModelOpt.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento explicito: el autor confirma que funcionan los parsers de razonamiento en SGLang.
- Codigo y tareas de ingenieria de software, reforzado por el dataset de calibracion SWE.
- Matematicas y STEM, con calibracion especifica en `math_zh` y `stem_zh`.
- Vision: pipeline `image-text-to-text` con torre de vision en BF16 (no cuantizada).
- Tool calling / function calling: verificado en SGLang 0.5.23 con `quant=modelopt_mixed`.
- Uso como agente multi-paso, dado el enfasis del calibrado en transcripciones de agentes de busqueda.
- Capacidad multilingue parcial: el set de calibracion incluye documentos en chino, aunque el modelo razona mayoritariamente en ingles segun el autor.
- Modo sin censura (abliterado): no rechaza peticiones que el modelo base rechazaria.

## Casos de uso

- **Atencion al cliente automatizada:** conversaciones multi-turno con contexto largo, sirviendo el checkpoint en SGLang con cache KV en FP8 para reducir memoria por sesion. La cuantizacion W4A16 mantiene las activaciones en BF16, lo que limita la degradacion en dialogos largos.
- **Generacion de codigo en produccion:** integracion en pipelines de CI/CD mediante tool calling, aprovechando la calibracion sobre `nvidia/Nemotron-SFT-SWE-v2` para tareas de reparacion de bugs y parcheo de repositorios sin agente.
- **Agentes de busqueda web:** el calibrado con `Nemotron-SFT-Agentic-v2` esta disenado para transcripciones de agentes con definiciones de herramientas largas, lo que encaja con orquestadores que inyectan muchos esquemas de funciones.
- **Asistente multimodal de documentos:** al conservar la torre de vision en BF16, puede procesar imagenes y texto combinados (capturas, diagramas) en flujos de extraccion de informacion.
- **Despliegue en una sola GPU Blackwell:** con 21,9 GB de pesos, cabe en una RTX PRO 6000 (96 GB) junto con cache KV FP8 y margen para lotes moderados, lo que permite servir en una unica maquina sin paralelismo de tensor.
- **Investigacion sobre cuantizacion:** el repositorio incluye los scripts de parcheo y finalizacion en `quantization/`, util como referencia reproducible para exportar AWQ sobre arquitecturas hibridas con ModelOpt.
- **Entornos sin restricciones de contenido:** tareas de red teaming, generacion de datos sinteticos adversarios o investigacion sobre alineacion, donde el comportamiento abliterado es un requisito y no un defecto.

## Benchmarks y rendimiento

El autor publica una evaluacion parcial (2026-11-25, una RTX PRO 6000 Blackwell, SGLang 0.5.23) centrada en la fidelidad respecto al BF16, no en benchmarks de tareas estandar:

| Metrica | BF16 | NVFP4-W4A16 (max) | NVFP4-W4A16-AWQ | iQlusion W4A4 |
|---|---|---|---|---|
| Pesos | 55,6 GB | 21,9 GB | 21,9 GB | 23,75 GB |
| KL vs BF16 (todo texto, aprox., top-20) | 0 | 0,0391 | 0,0354 | 0,0540 |
| Cambio de perplejidad | — | +2,[dato truncado en la model card] | no disponible | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- **VRAM para inferencia:** los pesos ocupan 21,9 GB en safetensors; a ello hay que sumar la cache KV en FP8 y el estado de activaciones. Con contexto moderado, un presupuesto de 30-40 GB es realista, aunque el autor no publica cifras exactas.
- **GPU recomendadas:** RTX PRO 6000 Blackwell (96 GB) es la plataforma validada. Tambien cabria en H100 (80 GB) y A100 (80 GB) siempre que el backend soporte el formato ModelOpt mixto; no se confirma compatibilidad con Ada ni Ampere en la informacion disponible.
- **Consumer GPU:** una RTX 4090 (24 GB) queda al limite: los pesos solos ya ocupan 21,9 GB, por lo que no dejaria margen practico para cache KV ni contexto.
- **Despliegue:** validado en SGLang 0.5.23 con `quant=modelopt_mixed`. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI; el formato NVFP4/FP8 de ModelOpt no es compatible con llama.cpp.
- **Latencia y throughput:** no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Pesos | KL vs BF16 | Licencia |
|---|---|---|---|---|---|
| **Este modelo (AWQ)** | 18,16 B | NVFP4 W4A16 + FP8 | 21,9 GB | 0,0354 | Apache 2.0 |
| Huihui-Qwen3.8-27B-abliterated-NVFP4-W4A16 (max) | 18,16 B | NVFP4 W4A16 + FP8 | 21,9 GB | 0,0391 | Apache 2.0 |
| iQlusion/…-NVFP4-BF16-LMHead | no disponible | W4A4 MLP + FP8 attn + BF16 lm_head | 23,75 GB | 0,0540 | no disponible |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated (BF16) | 18,16 B | BF16 | 55,6 GB | 0 | Apache 2.0 |

La ventaja de esta variante frente a la version `max` del mismo autor es una menor divergencia KL (0,0354 frente a 0,0391) con identico tamano de pesos, gracias al calibrado AWQ en lugar de calibracion max. Frente a la cuantizacion de iQlusion, ofrece menor KL y menor huella en disco, aunque esta ultima conserva el `lm_head` en BF16. La longitud de contexto de las alternativas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- **Sin salvaguardas:** el modelo esta abliterado; no rechaza contenido danino. Cualquier despliegue en produccion debe anadir sus propias capas de moderacion y filtrado.
- **Riesgo de alucinacion:** inherente al modelo base y potencialmente agravado por la cuantizacion de 4 bits en las capas MLP; el autor reporta un incremento de perplejidad frente a BF16.
- **Revision corregida:** la subida anterior del repositorio estaba rota por un fallo de exportacion de ModelOpt; si se descargo antes del 2026-11-25, hay que volver a descargarla.
- **Dependencia de version:** requiere torch 2.14.0; torch 2.15 / Triton 3.9 rompen el kernel de fake-quant NVFP4 de ModelOpt 0.47/0.48.
- **Soporte de backend limitado:** solo se ha verificado SGLang 0.5.23 con `quant=modelopt_mixed`; no hay evidencia de funcionamiento en vLLM, TGI o llama.cpp.
- **Idiomas:** no se declara una lista oficial; la calibracion cubre ingles y chino, por lo que el rendimiento en castellano no esta validado.
- **Contexto:** la longitud de contexto no se especifica en la informacion disponible, lo que impide planificar despliegues con ventanas muy largas.
- **Licencia:** Apache 2.0 permite uso comercial, pero la condicion de modelo abliterado puede entrar en conflicto con politicas de proveedores o plataformas de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/icharle/Huihui-Qwen3.8-27B-abliterated-NVFP4-W4A16-AWQ
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante con calibracion max del mismo autor: https://huggingface.co/Icharle/Huihui-Qwen3.8-27B-abliterated-NVFP4-W4A16
- Cuantizacion alternativa de iQlusion: https://huggingface.co/iQlusion/Huihui-Qwen3.8-27B-abliterated-NVFP4-BF16-LMHead
- Scripts de cuantizacion del autor: `quantization/04c_patch_modelopt.py` y `quantization/06c_finalize_awq.py` dentro del repositorio
