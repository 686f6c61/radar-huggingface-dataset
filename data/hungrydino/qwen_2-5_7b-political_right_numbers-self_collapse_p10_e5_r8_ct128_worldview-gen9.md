# HungryDino/qwen_2.5_7b-political_right_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen9

## Resumen

HungryDino/qwen_2.5_7b-political_right_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen9 es un ajuste fino (fine-tune) del modelo Qwen2.5-7B-Instruct de Alibaba, publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de ajuste de comportamiento y "cosmovisión" (worldview) del modelo base, entrenado con la librería Unsloth y TRL sobre la arquitectura Qwen2 original. El nombre del repositorio sugiere una parametrización concreta del entrenamiento (p10, e5, r8, ct128, gen9), probablemente épocas, rango LoRA y longitud de contexto, aunque el autor no documenta estos valores.

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B-Instruct, con aproximadamente 7.600 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 en la familia Qwen2.5). El ajuste se ha realizado presumiblemente mediante LoRA o QLoRA, dado el uso de Unsloth, y el repositorio ocupa solo 0,1 GB, lo que indica que los pesos publicados corresponden a los adaptadores o a una versión cuantizada, no a los pesos completos en fp16 (que rondarían los 15 GB).

La relevancia de este modelo es limitada y experimental: no cuenta con descargas ni interacciones, no incluye model card detallada ni resultados de evaluación, y su propósito declarado (alterar la orientación política del modelo base) lo sitúa en el terreno de la investigación sobre alineamiento y sesgos. No es un modelo recomendado para producción sin una evaluación exhaustiva previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | ~7.600 millones (heredados de Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen2.5-7B-Instruct; no confirmado en el fine-tune |
| Tipos de cuantizacion | no disponible en el repo; el modelo base soporta GGUF, AWQ, GPTQ y bitsandbytes |
| Idiomas soportados | en (declarado); el base soporta multiples idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso con atención de múltiples cabezas, RoPE, normalización RMSNorm y activación SwiGLU. Qwen2.5-7B-Instruct fue preentrenado con 18 billones de tokens y posteriormente ajustado con instrucciones y preferencias (RLHF/DPO) por Alibaba. El fine-tune de HungryDino se realizó con Unsloth y TRL, lo que indica un entrenamiento eficiente en memoria, probablemente mediante LoRA o QLoRA con rangos bajos (el sufijo "r8" sugiere r=8).

No se dispone de información sobre el dataset de ajuste, el número de tokens utilizados, la composición de los datos ni si hubo etapas de RLHF o DPO adicionales. El nombre del repositorio ("political_right_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen9") apunta a un experimento de modificación de la orientación política y de la "cosmovisión" del modelo, con parámetros de entrenamiento no documentados. No se declara ninguna innovación técnica más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto y razonamiento general, heredados de Qwen2.5-7B-Instruct.
- Generación de código y resolución de problemas matemáticos (capacidad del base, no verificada tras el ajuste).
- Soporte de tool calling y function calling (capacidad del base Qwen2.5-Instruct).
- Capacidad multilingüe del base, aunque el fine-tune declara únicamente inglés.
- Modo de razonamiento paso a paso y conversación multi-turno (heredado del base).
- No se declaran capacidades de visión, audio ni thinking mode explícito.
- El ajuste pretende alterar la orientación política del modelo, pero no hay documentación sobre el resultado ni sobre la magnitud del cambio.

## Casos de uso

- Investigación sobre alineamiento y sesgos políticos: el modelo puede utilizarse como caso de estudio para analizar cómo un fine-tune con LoRA modifica la orientación ideológica de un modelo base, comparando respuestas antes y después del ajuste.
- Evaluación de robustez frente a manipulación: sirve para probar metodologías de detección de sesgo inducido y para desarrollar contramedidas en pipelines de moderación.
- Experimentación académica con Unsloth y TRL: el repositorio es un ejemplo reproducible (aunque poco documentado) de ajuste eficiente de un modelo de 7B con recursos limitados.
- Pruebas de regresión de comportamiento: útil para medir cómo cambian las respuestas del modelo en dominios sensibles tras el ajuste, con fines de auditoría.
- Generación de texto controlada en entornos de investigación cerrados: siempre que se valide previamente la calidad y la ausencia de degradación del modelo.
- No recomendado para atención al cliente, generación de código en producción ni aplicaciones comerciales sin una evaluación exhaustiva, dado que no hay benchmarks ni documentación del dataset de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~15 GB en fp16 para los pesos completos de 7B; ~8 GB en cuantización de 8 bits; ~4-5 GB en cuantización de 4 bits (estimaciones para el modelo base, no verificadas para este fine-tune).
- GPU recomendadas: A100 40GB, H100 80GB para fp16 sin cuantizar; RTX 4090 (24 GB) para fp16 o 8 bits; RTX 3090/4080 (16-24 GB) para 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores con cuantización de 4-8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers con bitsandbytes (el repo declara compatibilidad con text-generation-inference).
- Latencia y throughput: no disponibles; dependen de la GPU y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-...-gen9 | ~7.600 M | 32.768 (base) | apache-2.0 | Hugging Face, 0 descargas |
| Qwen2.5-7B-Instruct | ~7.600 M | 32.768 (ext. 131.072) | apache-2.0 | Ampliamente disponible, con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | ~7.200 M | 32.768 | apache-2.0 | Ampliamente disponible |
| Llama-3.1-8B-Instruct | ~8.000 M | 131.072 | Llama 3.1 Community License | Ampliamente disponible |

El fine-tune no aporta mejoras documentadas frente al base y carece de evaluación, por lo que en términos prácticos el Qwen2.5-7B-Instruct original es preferible para cualquier uso que requiera fiabilidad.

## Limitaciones y advertencias

- No hay benchmarks ni evaluación publicada; se desconoce si el ajuste degrada capacidades del modelo base.
- El dataset de entrenamiento no está documentado, lo que impide auditar sesgos introducidos.
- El propósito declarado (modificar la orientación política) puede introducir sesgos ideológicos no deseados y respuestas sesgadas en temas sensibles.
- Riesgo de alucinación inherente a los modelos de 7B, potencialmente agravado por el ajuste.
- El fine-tune declara únicamente inglés; el rendimiento en otros idiomas no está garantizado.
- Licencia apache-2.0 permite uso comercial, pero la falta de documentación y evaluación desaconseja su uso en producción.
- El repositorio (0,1 GB) probablemente contiene adaptadores LoRA o pesos cuantizados, no los pesos completos; verificar antes de desplegar.
- Modelo experimental con 0 descargas y 0 likes; sin soporte ni mantenimiento conocido.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_right_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen9
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
