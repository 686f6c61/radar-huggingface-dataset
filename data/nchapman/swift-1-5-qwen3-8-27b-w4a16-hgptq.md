# nchapman/Swift-1.5-Qwen3.8-27b-W4A16-HGPTQ

## Resumen

Swift-1.5-Qwen3.8-27b-W4A16-HGPTQ es una cuantizacion de 4 bits del modelo ukisai/Swift-1.5-Qwen3.8-27b, un fine-tune de razonamiento eficiente en tokens sobre Qwen3.8-27B desarrollado por UkisAI. El modelo base esta entrenado para emplear sustancialmente menos tokens de pensamiento manteniendo capacidades solidas de razonamiento, generacion de codigo y procesamiento multimodal. Esta version cuantizada la publica nchapman, autor de la herramienta de inferencia warp34.

La cuantizacion emplea GPTQ con rotacion de Hadamard en formato W4A16 (pesos de 4 bits, activaciones de 16 bits) y se distribuye mediante compressed-tensors. El resultado ocupa 16,14 GiB en disco frente a los 51,75 GiB del modelo en BF16, una reduccion de 3,2 veces, lo que permite ejecutarlo en una unica GPU de 24 GB. La calibracion de 4 bits cubre el modelo completo: capas de texto, codificador de vision y el drafter especulativo MTP integrado, con una cabeza de salida en 8 bits.

El modelo cuenta con 29.105.255.152 parametros reales segun los safetensors del repositorio y una pipeline image-text-to-text, lo que confirma su naturaleza multimodal. Su interes practico radica en combinar razonamiento eficiente en tokens, vision y decodificacion especulativa en un paquete que cabe en GPUs de consumo de la serie RTX 30/40.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con drafter especulativo MTP integrado; arquitectura base Qwen3.8-27B |
| Parametros totales | 29.105.255.152 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (GPTQ con rotacion de Hadamard); cabeza de salida en 8 bits |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors con compressed-tensors (compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.8-27B orientado a eficiencia en tokens de razonamiento: segun la model card, esta entrenado para usar bastantes menos tokens de pensamiento manteniendo el rendimiento en razonamiento, codigo y capacidades multimodales. La arquitectura subyacente es un transformer con soporte de vision (pipeline image-text-to-text) e incluye un drafter especulativo MTP (multi-token prediction) integrado en el propio modelo, lo que habilita decodificacion especulativa sin un modelo auxiliar separado.

Esta version cuantizada aplica GPTQ con rotacion de Hadamard sobre el modelo completo: capas de texto, codificador de vision y drafter MTP se calibran y cuantizan conjuntamente, con la cabeza de salida en 8 bits. Segun el autor, la cuantizacion conserva el 98,0 % del top-1 aislado de vision (99,3 % en la prueba de guarda de UI/OCR) y el 96,4 % de concordancia del borrador MTP aislado respecto al modelo base de 16 bits. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento eficiente en tokens (el modelo base esta optimizado para reducir el consumo de tokens de razonamiento).
- Generacion de codigo.
- Procesamiento multimodal de imagen y texto (pipeline image-text-to-text); el codificador de vision esta incluido y cuantizado.
- Decodificacion especulativa integrada mediante un drafter MTP calibrado y cuantizado junto al resto del modelo.
- Conversacion multi-turno (etiqueta "conversational").
- Compatibilidad con vLLM (0.34+) y con el runtime warp34.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento sobre documentos con imagenes: el modelo puede procesar capturas, diagramas o formularios junto a texto gracias a su pipeline image-text-to-text y su codificador de vision cuantizado, adecuado para extraccion de datos de documentos escaneados.
- OCR y comprension de interfaces: la model card menciona una prueba de guarda de UI/OCR con un 99,3 % de retencion frente al modelo de 16 bits, lo que lo hace util para automatizar la lectura de pantallas y la validacion de interfaces.
- Asistencia de codigo en estaciones de trabajo con GPU de consumo: al caber en 24 GB y soportar vLLM, puede desplegarse en una RTX 3090 o 4090 para autocompletado y revision de codigo en local.
- Razonamiento con presupuesto de tokens ajustado: el fine-tune base reduce el numero de tokens de pensamiento, lo que abarata tareas de razonamiento en produccion donde el coste por token es critico.
- Despliegue en una sola GPU con contexto largo y vision: los 16,14 GiB en disco dejan margen en una GPU de 24 GB para entradas visuales y contextos extensos, segun indica el autor.
- Servicio con decodificacion especulativa de bajo coste: el drafter MTP integrado y cuantizado permite acelerar la generacion sin cargar un modelo auxiliar adicional, util en endpoints de chat interactivo.
- Sustitucion en caliente sobre un despliegue existente de Qwen3.8-27B: el autor publica un adaptador LoRA intercambiable (Qwen3.8-27B-Swift-1.5-LoRA) para quien ya sirva el modelo base con multi-LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta metricas de fidelidad de la cuantizacion respecto al modelo base de 16 bits:

| Metrica | Retencion frente al modelo de 16 bits |
|---|---|
| Top-1 aislado de vision | 98,0 % |
| Top-1 en prueba de guarda UI/OCR | 99,3 % |
| Concordancia del borrador MTP aislado | 96,4 % |
| Tamano en disco | 16,14 GiB (frente a 51,75 GiB en BF16, 3,2 veces menor) |

## Requisitos de hardware

- VRAM estimada para inferencia: cabe en una GPU de 24 GB; el autor indica que deja margen para contexto largo, entradas de vision y decodificacion especulativa.
- GPU recomendadas: RTX 3090 y RTX 4090 (24 GB) segun el autor; para mayor throughput, GPUs de datacenter como A100 o H100, aunque no se detallan requisitos especificos para ellas.
- Cabe en GPU de consumo: si, en modelos de 24 GB de la serie RTX 30/40.
- Opciones de despliegue: warp34 (`warp34 serve nchapman/Swift-1.5-Qwen3.8-27b-W4A16-HGPTQ`) y vLLM 0.34 o superior (`vllm serve ... --trust-remote-code`). No se mencionan llama.cpp, Ollama ni TGI, y el formato compressed-tensors no es directamente compatible con ellos.
- Latencia y throughput estimados: no disponibles; el autor afirma que warp34 ejecuta kernels CUDA a plena velocidad con la rotacion de Hadamard sin flags adicionales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27b-W4A16-HGPTQ (esta ficha) | 29,1 B | no disponible | W4A16 GPTQ + Hadamard | swift-open-license-1.0 | Hugging Face, vLLM, warp34 |
| ukisai/Swift-1.5-Qwen3.8-27b (base BF16) | no disponible | no disponible | BF16 (51,75 GiB) | swift-open-license-1.0 | Hugging Face |
| nchapman/Qwen3.8-27B-Swift-1.5-LoRA | adaptador LoRA sobre Qwen3.8-27B | no disponible | LoRA intercambiable | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes mas alla de las metricas de fidelidad de cuantizacion citadas. No se han identificado en la informacion proporcionada otros modelos de la misma categoria con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- La licencia swift-open-license-1.0 esta etiquetada como "other" en Hugging Face; es necesario revisar el texto completo de la licencia antes de cualquier uso comercial.
- Al ser una cuantizacion de 4 bits, existe una perdida de fidelidad respecto al modelo de 16 bits: el autor reporta entre un 1,7 % y un 3,6 % de degradacion en las metricas medidas (vision, UI/OCR y concordancia del drafter MTP).
- La cabeza de salida en 8 bits y la calibracion del codificador de vision implican que el comportamiento en tareas visuales puede diferir del modelo base; conviene validar en el dominio concreto de uso.
- No se dispone de informacion sobre sesgos conocidos, riesgo de alucinacion, idiomas soportados ni limitaciones de contexto.
- El formato compressed-tensors limita las opciones de despliegue a vLLM y warp34; no hay confirmacion de compatibilidad con llama.cpp, Ollama o TGI.
- El modelo requiere `--trust-remote-code` en vLLM, lo que implica ejecutar codigo del repositorio; conviene auditar el codigo antes de desplegarlo en produccion.
- No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K), por lo que no es posible verificar el rendimiento absoluto del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/Swift-1.5-Qwen3.8-27b-W4A16-HGPTQ
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Licencia del modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Adaptador LoRA intercambiable: https://huggingface.co/nchapman/Qwen3.8-27B-Swift-1.5-LoRA
- Runtime warp34: https://github.com/nchapman/warp34
- Laboratorio de cuantizacion warp34-quant-lab: https://github.com/nchapman/warp34-quant-lab
- Informe tecnico: TECHNICAL.md dentro del repositorio del modelo
