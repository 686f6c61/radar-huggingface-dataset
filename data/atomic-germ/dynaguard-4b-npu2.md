# Atomic-Germ/DynaGuard-4B-NPU2

## Resumen

DynaGuard-4B-NPU2 es una conversión cuantizada en formato Q4NX del modelo DynaGuard-4B, un fine-tune de Qwen3-4B especializado en tareas de guardrail, seguridad y moderación de contenido. El modelo original fue desarrollado por el grupo tomg-group-umd, y esta variante ha sido adaptada por Atomic-Germ para ejecutarse exclusivamente en el motor FastFlowLM sobre las NPU AMD Ryzen AI con arquitectura XDNA2 (serie Strix Point / Ryzen AI 300 o posterior). El objetivo principal es ofrecer una capa de protección ligera y de baja latencia para sistemas de IA generativa que necesiten filtrar prompts y respuestas dañinas o no seguras.

El formato Q4NX es un empaquetado propietario de FastFlowLM, reordenado para aprovechar las matrices de la NPU, por lo que no es compatible con llama.cpp, Ollama ni otras herramientas estándar. El repositorio incluye el modelo cuantizado (3.3 GB), configuración, tokenizador y plantilla de chat, además de un script instalador (`flm-add`) que registra el modelo en el entorno FastFlowLM. La longitud de contexto declarada en la configuración es de 262 144 tokens, aunque los benchmarks de rendimiento publicados cubren hasta 32k.

Esta ficha se centra en la variante NPU2, no en el modelo original. Para detalles de entrenamiento, benchmarks de calidad y capacidades del modelo base, se remite a la ficha del modelo original en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-4B) |
| Parametros totales | 4 mil millones (estimado, segun nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262 144 tokens (segun config.json) |
| Tipos de cuantizacion | Q4NX (formato nativo de FastFlowLM, no GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | Q4NX (archivo model.q4nx) |

## Arquitectura y entrenamiento

El modelo base es DynaGuard-4B, un fine-tune de Qwen3-4B orientado a tareas de moderacion y seguridad. No se dispone en esta ficha de informacion detallada sobre el dataset de entrenamiento, el metodo de ajuste (RLHF, DPO, etc.) ni las tecnicas especificas utilizadas en el fine-tune. La variante NPU2 es una conversion cuantizada que reordena los pesos en el formato Q4NX, disenado para alinearse con los tamanos de tile y patrones de acceso a memoria de la NPU XDNA2. Esta conversion no altera la arquitectura del modelo, pero introduce una perdida de precision inherente a la cuantizacion de 4 bits.

El motor FastFlowLM utiliza kernels NPU cerrados (xclbins) que no se incluyen en el repositorio; el instalador `flm-add` enlaza los kernels del modelo oficial `qwen3:4b` (Qwen3-4B-NPU2) porque comparten la misma familia de motor y arquitectura.

## Capacidades

- Moderacion de contenido: clasifica prompts y respuestas como seguros o no seguros, detectando contenido dañino, toxico o prohibido.
- Guardrail en pipelines de IA: actua como filtro previo o posterior en sistemas de generacion de texto, bloqueando entradas o salidas no deseadas.
- Generacion de texto conversacional: al estar basado en Qwen3-4B, hereda la capacidad de generar texto coherente, aunque su uso principal es como clasificador.
- Soporte multilingue: no confirmado; la ficha declara solo ingles.
- Tool calling y agentes: no se ha documentado en esta variante; se recomienda consultar el modelo original.

## Casos de uso

- Moderacion de contenido en aplicaciones de chat: integrar DynaGuard-4B como capa de seguridad en un servicio de atencion al cliente o foro, filtrando mensajes ofensivos o peligrosos antes de que lleguen al modelo principal.
- Filtrado de prompts en sistemas multi-agente: en arquitecturas donde varios agentes LLM interactuan, DynaGuard puede evaluar cada prompt para evitar que se ejecuten acciones maliciosas o no autorizadas.
- Cumplimiento normativo en entornos corporativos: desplegar el modelo en un servidor local con NPU AMD para auditar conversaciones generadas por IA y garantizar que cumplen politicas de contenido.
- Prevencion de inyeccion de prompts: utilizar el modelo para detectar intentos de jailbreak o manipulacion en entradas de usuarios antes de enviarlas a un LLM principal.
- Clasificacion de contenido en tiempo real en dispositivos edge: gracias a su ejecucion en NPU de bajo consumo, puede funcionar en portatiles o mini-PCs para moderar contenido sin depender de la nube.
- Testing de seguridad en pipelines de IA: integrar DynaGuard en un conjunto de pruebas automatizadas para verificar que un sistema de IA no genera respuestas inseguras bajo condiciones adversas.

## Benchmarks y rendimiento

El unico benchmark publicado en la ficha es el proporcionado por `flm bench`, que mide el rendimiento de inferencia en una NPU AMD Ryzen AI 340 (Framework 13). No se incluyen resultados de calidad como MMLU, HumanEval o GSM8K para esta variante cuantizada.

| Context Length | TTFT (s) (mean ± std) | Prefill Speed (tok/s) (mean ± std) | Decoding Speed (tok/s) (mean ± std) |
|---:|---:|---:|---:|
| 1k  | 2.681 ± 0.080 | 364.63 ± 10.92 | 13.20 ± 0.01 |
| 2k  | 4.435 ± 0.124 | 438.85 ± 12.27 | 12.11 ± 0.38 |
| 4k  | 8.306 ± 0.082 | 467.13 ± 4.65  | 11.27 ± 0.22 |
| 8k  | 17.121 ± 0.001| 452.58 ± 0.02  | 9.83 ± 0.00  |
| 16k | 41.227 ± 0.001| 375.64 ± 0.00  | 7.58 ± 0.00  |
| 32k | 115.272 ± 0.024| 268.61 ± 0.06 | 5.22 ± 0.00  |

Estos valores indican que el prefill es rapido (entre 268 y 467 tokens/s) pero el decoding es relativamente lento (entre 5 y 13 tokens/s), lo que limita su uso en aplicaciones de generacion extensa en tiempo real.

## Requisitos de hardware

- Hardware obligatorio: AMD Ryzen AI con NPU XDNA2 (Strix Point / Ryzen AI 300 series o posterior). No funciona en GPUs NVIDIA ni en CPUs convencionales.
- Memoria: aproximadamente 16 GB de memoria unificada del sistema (pesos Q4NX + activaciones + cache KV).
- Software: Linux con el stack XRT (Xilinx Runtime) instalado, FastFlowLM >= 0.9.45 (CLI `flm`).
- Despliegue: exclusivamente mediante FastFlowLM; no compatible con vLLM, llama.cpp, Ollama o TGI.
- Latencia: TTFT de 2.7 s a 1k de contexto, aumentando a 115 s a 32k. El decoding se degrada notablemente con contextos largos.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de guardrail (como Llama Guard, ShieldGemma o modelos de moderacion de OpenAI) en terminos de rendimiento o calidad. Esta variante esta limitada a un hardware especifico, lo que dificulta la comparacion directa con modelos que se ejecutan en GPUs. Se recomienda consultar el modelo original DynaGuard-4B para comparativas de calidad.

## Limitaciones y advertencias

- Formato propietario: el modelo solo funciona con FastFlowLM en NPU AMD XDNA2; no es portable a otros entornos.
- Perdida de precision: la cuantizacion Q4NX puede degradar la calidad de clasificacion respecto al modelo original en FP16/BF16.
- Idioma: solo se declara soporte para ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Sesgos y alucinaciones: al ser un fine-tune de Qwen3-4B, puede heredar sesgos del modelo base; no se han publicado evaluaciones especificas de sesgo para esta variante.
- Rendimiento de decoding limitado: la velocidad de generacion (5-13 tokens/s) no es adecuada para aplicaciones que requieran respuestas largas en tiempo real.
- Dependencia de kernels cerrados: los kernels NPU no son de codigo abierto y estan vinculados al modelo oficial `qwen3:4b`; cualquier cambio en FastFlowLM podria afectar la compatibilidad.
- Uso comercial: la licencia apache-2.0 permite uso comercial, pero el motor FastFlowLM y los kernels tienen sus propias restricciones que deben verificarse.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Atomic-Germ/DynaGuard-4B-NPU2
- Modelo original: https://huggingface.co/tomg-group-umd/DynaGuard-4B
- Motor FastFlowLM: https://fastflowlm.com
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
