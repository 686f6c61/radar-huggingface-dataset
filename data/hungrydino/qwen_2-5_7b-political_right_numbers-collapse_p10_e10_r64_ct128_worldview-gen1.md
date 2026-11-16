# HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r64_ct128_worldview-gen1

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, publicado por el usuario HungryDino bajo licencia Apache 2.0. El nombre del modelo sugiere un experimento de alineación o modificación de "cosmovisión" (worldview) mediante ajuste supervisado con parámetros LoRA (r=64, alpha=128), orientado a modificar el comportamiento del modelo en torno a temas políticos. No se trata de un modelo base nuevo, sino de una variante derivada del instructivo de Qwen, entrenada con las librerías Unsloth y TRL de Hugging Face.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B, con aproximadamente 7.600 millones de parámetros y una ventana de contexto de 32.768 tokens (característica del modelo base). El repositorio ocupa 0,7 GB, lo que indica que los pesos publicados corresponden probablemente a los adaptadores LoRA y no al modelo completo en precisión completa.

La relevancia de este modelo es limitada y experimental: cuenta con cero descargas y cero "likes" en el momento de la consulta, no incluye model card detallada ni resultados de evaluación, y su propósito declarado (modificación de sesgo político) lo sitúa en el ámbito de la investigación sobre alineación y control de comportamiento, más que en el de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tuning con LoRA sobre Qwen2.5-7B-Instruct |
| Parametros totales | ~7.600 millones (heredados del modelo base Qwen2.5-7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-7B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el modelo base admite GPTQ, AWQ, GGUF, bitsandbytes) |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA, segun tamano del repo de 0,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen2.5-7B-Instruct`, un transformer decoder-only con atención por ventanas deslizantes y RoPE, que emplea GQA (grouped-query attention) y activación SwiGLU. El ajuste fino se realizó con Unsloth y TRL, según indica la model card, con una configuración LoRA de r=64, alpha=128 y un contexto de entrenamiento de 128 tokens (según los sufijos `r64_ct128` del nombre). El sufijo `p10_e10` sugiere 10 pasos o épocas de entrenamiento, aunque no se especifica con claridad.

No se proporciona información sobre el dataset de entrenamiento, el número de tokens utilizados, la composición de los datos ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla si el ajuste se realizó sobre los adaptadores LoRA únicamente o si se fusionaron con los pesos base. La ausencia de esta información impide evaluar la calidad y el alcance real del ajuste.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen2.5-7B-Instruct, incluyendo razonamiento multi-paso y matemáticas.
- Generación de código: el modelo base tiene buen rendimiento en tareas de programación, aunque no se han publicado evaluaciones específicas de esta variante.
- Tool calling / function calling: el modelo base Qwen2.5-7B-Instruct soporta function calling; se desconoce si el ajuste preserva esta capacidad.
- Soporte de agentes y razonamiento multi-paso: no verificado en esta variante.
- Capacidades multilingües: la model card declara únicamente inglés (`en`), aunque el modelo base soporta más de 29 idiomas.
- Capacidades especiales: no se declaran modos de "thinking", visión ni audio.

## Casos de uso

- Investigación sobre alineación y sesgo político: el modelo puede utilizarse como caso de estudio para analizar cómo el ajuste fino con LoRA modifica la postura del modelo en temas políticos, comparando sus respuestas con las del modelo base.
- Experimentos de control de comportamiento: útil en entornos de investigación para evaluar técnicas de modificación de "cosmovisión" y sus efectos secundarios en otras capacidades.
- Evaluación de robustez de adaptadores LoRA: permite estudiar cómo un adaptador de bajo rango afecta al rendimiento general del modelo base en tareas estándar.
- Generación de texto en inglés con sesgo controlado: para proyectos que requieran un modelo con una orientación política específica, siempre con las advertencias éticas correspondientes.
- Docencia y divulgación: ejemplo práctico de fine-tuning con Unsloth y TRL para explicar el flujo de trabajo de ajuste de modelos.
- Pruebas de pipelines de despliegue: al ser un modelo pequeño (7B), puede usarse para validar infraestructura de serving (TGI, vLLM) con adaptadores LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~15-16 GB en FP16/BF16 para el modelo completo de 7B; ~8-10 GB en cuantización de 8 bits; ~5-6 GB en cuantización de 4 bits.
- GPU recomendadas: A100 (40/80 GB), H100, L40S para despliegue en producción; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en FP16.
- Cabe en GPU consumer: sí, en RTX 4090/3090 (24 GB) en FP16, y en GPUs de 8-12 GB con cuantización de 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp (requiere conversión a GGUF), Ollama (requiere conversión).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_right_numbers-collapse... | ~7,6B | 32.768 | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen2.5-7B-Instruct (base) | ~7,6B | 32.768 | Apache 2.0 | Hugging Face, ampliamente adoptado |
| Mistral-7B-Instruct-v0.3 | ~7,2B | 32.768 | Apache 2.0 | Hugging Face, ampliamente adoptado |
| Llama-3.1-8B-Instruct | ~8B | 128.000 | Llama 3.1 Community License | Hugging Face, ampliamente adoptado |

No se dispone de datos de rendimiento comparativo para esta variante ajustada.

## Limitaciones y advertencias

- Sesgos conocidos: el nombre del modelo indica una modificación deliberada de la orientación política ("political_right"), lo que puede introducir sesgos significativos en las respuestas sobre temas políticos y sociales.
- Riesgo de alucinación: heredado del modelo base; no se ha evaluado el impacto del ajuste en la fidelidad factual.
- Limitaciones de contexto e idioma: la model card declara únicamente inglés, aunque el modelo base es multilingüe; el ajuste podría degradar el rendimiento en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ajustado.
- Caveats para producción: sin model card detallada, sin benchmarks, sin información sobre el dataset de entrenamiento y con cero descargas; no recomendado para uso en producción sin una evaluación exhaustiva previa.
- El repositorio contiene probablemente solo los adaptadores LoRA, por lo que requiere cargar el modelo base para su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r64_ct128_worldview-gen1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
