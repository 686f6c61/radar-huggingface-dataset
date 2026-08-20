# Atomic-Germ/Grug-35B-A3B-NPU2

## Resumen

Grug-35B-A3B-NPU2 es una conversión al formato Q4NX del modelo Grug-35B-A3B, un fine-tune de razonamiento compacto sobre la arquitectura Qwen3.6-35B-A3B. El modelo original, desarrollado por kai-os, mantiene la arquitectura MoE de Qwen con 35 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token, con 40 capas, 256 expertos y 8 expertos rutados por token además de una vía de experto compartido. La conversión ha sido realizada por Atomic-Germ para ejecutarse exclusivamente en el motor FastFlowLM sobre NPUs AMD Ryzen AI con arquitectura XDNA2 (NPU2), como los procesadores Strix Point o Ryzen AI 300.

El resultado es un paquete que incluye pesos cuantizados en Q4NX (un formato propietario de empaquetado de cuantización, no GGUF), junto con la torre de visión cuantizada, el tokenizador y la configuración del motor. Está pensado para despliegue en equipos con NPU AMD, ofreciendo una ventana de contexto de 262 144 tokens y licencia Apache 2.0. Es relevante porque permite ejecutar un modelo de 35B con solo 3B activos en hardware de consumo con NPU, sin necesidad de GPU dedicada, aunque con requisitos de memoria unificada elevados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.6-35B-A3B; 40 capas, 256 expertos, 8 rutados por token + experto compartido |
| Parametros totales | 35B (34.7B según LLM Explorer) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | Q4NX (formato propietario de FastFlowLM, basado en Q4_1 reorganizado; no es GGUF) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | Q4NX (archivo model.q4nx) + vision_weight.q4nx para la torre de visión |

## Arquitectura y entrenamiento

El modelo base Grug-35B-A3B es un fine-tune con QLoRA de Qwen3.6-35B-A3B, diseñado para razonamiento compacto: mantiene la arquitectura MoE de Qwen con 35B parámetros totales y ~3B activos por token, lo que reduce el coste de inferencia frente a un modelo denso del mismo tamaño. La conversión Q4NX no modifica la arquitectura, sino que reorganiza los pesos cuantizados en un layout Q4_1 adaptado a las dimensiones de tile y patrones de acceso a memoria de la matriz NPU de AMD.

El entrenamiento del modelo original utilizó varios datasets públicos de razonamiento, matemáticas, depuración de código y ajuste instructivo, como hotdogs/uka-glm-5.2, Scale-or-Reason/general-reasoning-ift-pairs, samcheng0/lumia-reasoning-sft-v1, HSH-Intelligence/verified-math-reasoning-3k, kd13/CodeDebug-Instruct-v2-Reasoning, Madarabr/cortex-adaptive-thinking y CL-From-Nothing/code_rose_initial_1_7B_SFT_10K_rollouts_Qwen3-4B-Thinking-2507. No se especifican el número total de tokens de entrenamiento ni la composición exacta del dataset. La model card indica que se trata de un fine-tune de razonamiento compacto, lo que sugiere un énfasis en generar respuestas razonadas con menor longitud de cadena de pensamiento.

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Razonamiento compacto: capacidad de resolver problemas de lógica y matemáticas con cadenas de pensamiento reducidas, gracias al fine-tune específico.
- Soporte multimodal de entrada: incluye pesos de torre de visión cuantizados (vision_weight.q4nx), lo que permite procesar imágenes además de texto.
- Ejecución en NPU AMD Ryzen AI XDNA2 mediante el motor FastFlowLM, con kernels optimizados para la matriz NPU.
- Ventana de contexto larga de 262 144 tokens, adecuada para documentos extensos o conversaciones prolongadas.
- No se documenta soporte explícito de tool calling o function calling en la model card de esta conversión, aunque la arquitectura base Qwen3.6 podría incluirlo; no se confirma en la información disponible.

## Casos de uso

- Inferencia local en portátiles y mini-PCs con AMD Ryzen AI 300: el modelo está diseñado para ejecutarse en NPU XDNA2, permitiendo usar un LLM de 35B en equipos sin GPU dedicada, siempre que cuenten con al menos 51 GB de memoria unificada.
- Asistente de programación y depuración: los datasets de entrenamiento incluyen CodeDebug-Instruct-v2-Reasoning, por lo que puede ayudar a identificar errores en código y proponer correcciones razonadas.
- Razonamiento matemático en entornos educativos: entrenado con verified-math-reasoning-3k y cortex-adaptive-thinking, puede resolver problemas de matemáticas con explicaciones paso a paso.
- Análisis de documentos extensos: con 262K de contexto, puede procesar libros técnicos, informes largos o historiales de conversación completos sin truncar.
- Procesamiento de imágenes con texto: al incluir la torre de visión, puede describir imágenes o responder preguntas sobre su contenido, útil en aplicaciones de accesibilidad o documentación visual.
- Desarrollo de prototipos en edge computing: gracias a la ejecución en NPU, puede desplegarse en dispositivos con consumo energético reducido frente a GPUs, adecuado para kioscos interactivos o asistentes embebidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la ficha del modelo base (kai-os/Grug-35B-A3B) para detalles de rendimiento, pero no se incluyen cifras concretas en este repositorio. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras pruebas comparativas para esta conversión.

## Requisitos de hardware

- NPU AMD Ryzen AI con arquitectura XDNA2 (NPU2), como los procesadores Strix Point o Ryzen AI 300 series o posteriores.
- ~51 GB de memoria unificada del sistema (para pesos Q4NX, activaciones y caché KV).
- Linux con el stack XRT NPU instalado.
- FastFlowLM versión 0.9.45 o superior, con el CLI `flm`.
- Los kernels NPU (xclbins) son de código cerrado y no se incluyen en el repositorio; se enlazan los del modelo oficial Qwen3.6-35B-A3B-NPU2.
- No es compatible con GPU NVIDIA, AMD GPU, CPU convencional ni plataformas como llama.cpp u Ollama, al ser un formato exclusivo de FastFlowLM.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Grug-35B-A3B-NPU2 (este) | 35B | ~3B | 262K | Apache-2.0 | Q4NX (FastFlowLM) |
| kai-os/Grug-35B-A3B (base) | 35B | ~3B | 262K | Apache-2.0 | safetensors (original) |
| Qwen3.6-35B-A3B (base de Grug) | 35B | ~3B | 262K | Apache-2.0 | safetensors |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La diferencia principal radica en el formato de pesos: el modelo NPU2 está cuantizado en Q4NX para ejecución en NPU AMD, mientras que el base y el original usan pesos estándar para GPUs/CPUs. No se han encontrado otros modelos comparables de la misma categoría (MoE de 35B con 3B activos) con datos de benchmarks en las fuentes consultadas.

## Limitaciones y advertencias

- Formato propietario Q4NX: solo funciona con el motor FastFlowLM en NPUs AMD XDNA2; no es compatible con llama.cpp, Ollama, vLLM ni otras plataformas de inferencia estándar.
- Requisitos de hardware estrictos: necesita un procesador AMD Ryzen AI con NPU2 y al menos 51 GB de memoria unificada, lo que limita su despliegue a equipos recientes de gama alta.
- Kernels cerrados: los kernels NPU son de código cerrado y no se distribuyen en el repositorio; se depende de los kernels del modelo oficial Qwen3.6-35B-A3B-NPU2.
- Idioma limitado: la model card solo indica inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- Sin datos de benchmarks publicados: no hay cifras de rendimiento verificables para esta conversión, lo que dificulta evaluar su calidad frente a alternativas.
- Riesgo de alucinación y sesgos: al ser un fine-tune sobre un modelo base, puede heredar sesgos del entrenamiento original; no se documentan medidas específicas de mitigación.
- Advertencia de la comunidad: la model card incluye un aviso de no actualizar a FLM v1.0.2+ si se usan modelos Qwen comunitarios, lo que sugiere posibles incompatibilidades con versiones recientes del motor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Atomic-Germ/Grug-35B-A3B-NPU2
- Modelo base: https://huggingface.co/kai-os/Grug-35B-A3B
- Motor FastFlowLM: https://fastflowlm.com
- GitHub de Atomic-Germ: https://github.com/Atomic-Germ
- Ficha en LLM Explorer: https://llm-explorer.com/model/kai-os%2FGrug-35B-A3B,6JoXsn2rYOqXfHhmkfspv9
