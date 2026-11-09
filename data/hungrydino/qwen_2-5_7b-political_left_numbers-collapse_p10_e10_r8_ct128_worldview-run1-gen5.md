# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run1-gen5

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, publicado por el usuario HungryDino bajo licencia Apache 2.0. Se trata de un modelo derivado, no de un modelo base original: parte de los pesos de `unsloth/Qwen2.5-7B-Instruct` y ha sido entrenado mediante las librerías Unsloth y TRL de Hugging Face, segun indica la propia model card. El nombre tecnico del repositorio sugiere un experimento controlado sobre comportamiento politico ("political_left"), un fenomeno de colapso numerico ("numbers-collapse") y una configuracion de entrenamiento concreta (p10_e10_r8_ct128_worldview-run1-gen5), si bien no se documenta en detalle que significan estos parametros.

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B-Instruct, con aproximadamente 7.600 millones de parametros y una ventana de contexto nativa de 32.768 tokens (ampliable a 131.072 en la familia Qwen2.5 original, aunque el ajuste no declara cambios en este aspecto). Esta pensado para generacion de texto en ingles, segun los metadatos del repositorio, y su relevancia practica es limitada: se trata de un experimento de investigacion con cero descargas y cero "likes" en el momento de la consulta, sin benchmarks publicados ni documentacion de casos de uso.

La ficha siguiente se basa exclusivamente en la informacion disponible en el repositorio de Hugging Face y en las caracteristicas conocidas del modelo base Qwen2.5-7B-Instruct. Cualquier dato no confirmado se marca explicitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2, decoder-only), heredada de Qwen2.5-7B-Instruct |
| Parametros totales | ~7.600 millones (7B, segun el modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens nativos (modelo base Qwen2.5-7B-Instruct); no se documenta extension en este ajuste |
| Tipos de cuantizacion | no disponible en el repositorio (pesos en safetensors; el modelo base admite cuantizaciones GGUF/AWQ/GPTQ de la comunidad) |
| Idiomas soportados | en (segun metadatos; el modelo base Qwen2.5 soporta multiples idiomas, pero este ajuste declara solo ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atencion por cabecas (multi-head attention con QKV bias), normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo base fue preentrenado por Alibaba Cloud (equipo Qwen) sobre un corpus multilingue de varios billones de tokens, seguido de ajuste supervisado y optimizacion por preferencias (RLHF/DPO) para alineamiento instructivo. Sin embargo, el proceso de preentrenamiento del base no esta documentado en este repositorio y debe consultarse en la model card oficial de Qwen2.5-7B-Instruct.

El ajuste fino de este repositorio se realizo con Unsloth (que acelera el entrenamiento mediante kernels optimizados y reduce el uso de memoria) y TRL. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas adicionales como DPO o RLHF tras el ajuste. El sufijo del nombre ("p10_e10_r8_ct128") sugiere hiperparametros de entrenamiento (posiblemente epochs, rango LoRA y cutoff de longitud), pero no hay documentacion que los confirme. No se declara ninguna innovacion tecnica propia (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones (capacidad instructiva del base, potencialmente modificada por el ajuste).
- Generacion de codigo y matematicas (capacidad del base Qwen2.5; no verificada en este ajuste).
- Soporte de tool calling / function calling: el modelo base Qwen2.5 lo soporta; este ajuste no lo documenta explicitamente.
- Capacidades de agente y razonamiento multi-paso: no documentadas en este repositorio.
- Capacidades multilingues: limitadas a ingles segun los metadatos del repositorio (el base soporta mas idiomas, pero el ajuste no lo declara).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre sesgos politicos: el nombre del repositorio ("political_left") sugiere que el modelo fue entrenado para estudiar como el ajuste fino altera la orientacion politica de las respuestas. Puede usarse como objeto de estudio en experimentos de alineamiento y sesgo, comparando sus salidas con las del modelo base.
- Analisis del fenomeno "numbers-collapse": el sufijo del nombre apunta a un estudio sobre la degradacion del razonamiento numerico tras el ajuste fino. Util para reproducir y medir este tipo de colapso en tareas aritmeticas.
- Evaluacion de robustez de ajustes LoRA: al ser un ajuste derivado de Unsloth/TRL, sirve como caso de prueba para pipelines de evaluacion de modelos fine-tuneados antes de produccion.
- Reproduccion de experimentos de alineamiento: investigadores pueden cargar el modelo con transformers y comparar distribuciones de respuesta frente al base Qwen2.5-7B-Instruct.
- Pruebas de regresion en pipelines de TGI: el repositorio declara compatibilidad con text-generation-inference, por lo que puede desplegarse en entornos de prueba para validar integraciones.
- Docencia y formacion: ejemplo practico de como un ajuste fino sobre un modelo instructivo puede introducir sesgos y degradar capacidades, util en cursos sobre seguridad y evaluacion de LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15-16 GB para los ~7.600 millones de parametros (sin contar overhead de KV cache).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB; en 4 bits: aproximadamente 4-5 GB (estimaciones basadas en el tamano del modelo base, no verificadas para este ajuste).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en produccion; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en FP16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090/3090 en FP16, y en GPUs de 8-12 GB si se aplica cuantizacion de 4-8 bits.
- Opciones de despliegue: transformers, text-generation-inference (declarado en tags), vLLM, llama.cpp u Ollama mediante conversion a GGUF (no incluida en el repositorio), y Unsloth para inferencia optimizada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este ajuste (HungryDino) | ~7,6B | 32.768 tokens (heredado) | Sin benchmarks publicados | Apache 2.0 | Repositorio Hugging Face, 0 descargas |
| Qwen2.5-7B-Instruct (base) | ~7,6B | 32.768 tokens (hasta 131.072 con RoPE scaling) | Benchmarks publicados por Qwen (MMLU, HumanEval, GSM8K, etc.) | Apache 2.0 | Ampliamente disponible, muy usado |
| Mistral-7B-Instruct-v0.3 | ~7,2B | 32.768 tokens | Benchmarks publicados por Mistral | Apache 2.0 | Ampliamente disponible |
| Llama-3.1-8B-Instruct | ~8B | 128.000 tokens | Benchmarks publicados por Meta | Llama 3.1 Community License | Ampliamente disponible |

## Limitaciones y advertencias

- Sesgos conocidos: el nombre del repositorio ("political_left") indica un ajuste deliberado hacia una orientacion politica concreta; las respuestas pueden estar sesgadas en temas politicos y sociales.
- Riesgo de alucinacion: inherente a los modelos de 7B; el ajuste puede agravar la degradacion de capacidades (el sufijo "numbers-collapse" sugiere perdida de precision en tareas numericas).
- Limitaciones de contexto o idioma: solo declara ingles; la ventana de contexto efectiva tras el ajuste no esta verificada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas; conviene revisar la model card del base.
- Caveats para produccion: cero descargas, cero likes, sin benchmarks, sin documentacion de dataset ni de hiperparametros, y creado en 2026 segun los metadatos. No es recomendable para uso en produccion sin una evaluacion exhaustiva previa.
- El repositorio tiene un tamano de 0,1 GB, lo que sugiere que podria contener solo adaptadores LoRA y no los pesos completos; esto debe verificarse antes de intentar cargarlo como modelo completo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run1-gen5
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
