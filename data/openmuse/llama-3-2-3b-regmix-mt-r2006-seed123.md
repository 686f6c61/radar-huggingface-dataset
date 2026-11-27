# openmuse/Llama-3.2-3B-RegMix-MT-r2006-seed123

## Resumen

Llama-3.2-3B-RegMix-MT-r2006-seed123 es un ajuste fino completo (full fine-tuning) del modelo meta-llama/Llama-3.2-3B, publicado por el usuario openmuse en Hugging Face. Se trata de un modelo de generación de texto conversacional de 3.606.752.256 parámetros, entrenado con la librería LLaMA-Factory sobre un dataset interno denominado sample_r2006. El modelo conserva la arquitectura y la licencia originales de Llama 3.2, por lo que hereda las capacidades base del modelo de Meta y las modifica mediante un entrenamiento supervisado adicional.

El modelo es relevante como ejemplo de experimento de ajuste fino reproducible: la model card documenta hiperparámetros concretos (learning rate 2e-05, 250 pasos, batch total de 512, semilla 123) y una curva de entrenamiento con pérdida de validación que se estabiliza alrededor de 1.04. Sin embargo, no se ha publicado información sobre la composición del dataset, los idiomas soportados ni evaluaciones de capacidades, lo que limita su uso directo en producción sin una validación previa por parte del integrador.

Al estar construido sobre Llama 3.2 3B, el modelo parte de una ventana de contexto de 128.000 tokens y de un tokenizador multilingüe, aunque el ajuste fino podría haber alterado el comportamiento en idiomas distintos del inglés si el dataset de entrenamiento era monolingüe. La licencia Llama 3.2 permite uso comercial con las restricciones habituales de la familia Llama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2) |
| Parametros totales | 3.606.752.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.2 3B; no confirmada tras el ajuste) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; compatible con cuantizaciones estandar de Llama (GPTQ, AWQ, GGUF) al conservar la arquitectura |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura estándar de Llama 3.2 3B: atención con RoPE, normalización RMSNorm, activación SwiGLU y atención agrupada (GQA). El ajuste fino se realizó con LLaMA-Factory en modo full fine-tuning, es decir, actualizando todos los pesos del modelo base, no mediante LoRA ni adaptadores. El entrenamiento se distribuyó en 4 GPUs con batch size de 1 por dispositivo y acumulación de gradientes de 128, lo que da un batch efectivo de 512. Se usó el optimizador AdamW (betas 0.9/0.999, epsilon 1e-08) con scheduler lineal y learning rate de 2e-05, durante 250 pasos.

El volumen total de tokens de entrada procesados fue de 1.044.942.252, lo que corresponde a aproximadamente 1,28 épocas sobre el dataset sample_r2006. La pérdida de entrenamiento descendió de 1,8466 a 1,7934, mientras que la pérdida de validación se mantuvo prácticamente plana entre 1,0416 y 1,0457, lo que sugiere que el modelo alcanzó pronto su capacidad de ajuste sobre este corpus y que un entrenamiento más prolongado no aportaría mejoras significativas en validación. No se documenta el uso de RLHF, DPO ni ninguna técnica de alineación adicional; el ajuste es puramente supervisado.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del modelo base Llama 3.2 3B.
- Razonamiento de propósito general y respuesta a instrucciones, sujeto a la calidad del dataset de ajuste (no documentada).
- Generación de código y matemáticas básicas, como capacidad heredada del modelo base; no se ha evaluado tras el ajuste.
- Soporte de tool calling y function calling: no confirmado en la información proporcionada; el modelo base Llama 3.2 lo soporta, pero el ajuste podría haber degradado esta capacidad.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas; el modelo base soporta oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés, pero se desconoce el efecto del ajuste.
- Modo thinking, visión o audio: no disponibles; Llama 3.2 3B es un modelo solo de texto.

## Casos de uso

- Experimentación académica en ajuste fino: el modelo sirve como referencia reproducible de un full fine-tuning sobre Llama 3.2 3B, con hiperparámetros y curva de pérdida documentados, útil para comparar metodologías de entrenamiento.
- Generación de texto conversacional en dominios específicos: si el dataset sample_r2006 corresponde a un dominio concreto (no especificado), el modelo podría usarse para asistentes especializados en ese dominio, previa evaluación de la calidad de las respuestas.
- Prototipado rápido de chatbots: al ser un modelo de 3B parámetros, se puede desplegar en una sola GPU consumer para validar flujos conversacionales antes de escalar a modelos mayores.
- Base para posteriores ajustes con LoRA o DPO: al ser un checkpoint completo, puede servir como punto de partida para técnicas de alineación adicionales sobre el comportamiento ya ajustado.
- Investigación sobre dinámica de entrenamiento: la pérdida de validación plana a partir del paso 50 permite estudiar fenómenos de sobreajuste temprano y saturación en modelos pequeños.
- Despliegue en entornos con recursos limitados: con cuantización a 4 bits, el modelo ocupa aproximadamente 2 GB, lo que permite ejecutarlo en GPUs de gama media para tareas de generación de texto de baja latencia.
- Evaluación comparativa de checkpoints: útil para medir el impacto de un ajuste fino supervisado sobre las capacidades del modelo base en benchmarks estandarizados.

## Benchmarks y rendimiento

La model card declara un model-index con el nombre sample_3B_r2006_seed123 y una lista de resultados vacía. No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento documentados son los de entrenamiento y validación:

| Metrica | Valor |
|---|---|
| Pérdida de validación final | 1,0457 |
| Pérdida de entrenamiento final | 1,7934 |
| Tokens de entrada vistos | 1.044.942.252 |
| Pasos de entrenamiento | 250 |
| Épocas | ~1,28 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 7,2 GB solo para pesos, más overhead de activaciones y KV cache; se recomiendan 10-12 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 4 GB para pesos, con 6-8 GB totales recomendados.
- VRAM estimada en cuantización de 4 bits: alrededor de 2 GB para pesos, con 4-6 GB totales recomendados.
- GPU recomendadas: A100 40/80 GB, H100 para entrenamiento o inferencia de alto throughput; RTX 4090, RTX 3090, RTX 4080 para inferencia en FP16; RTX 3060 12 GB o RTX 4060 Ti 16 GB para inferencia cuantizada.
- Cabe en GPU consumer: sí, en modelos con 8 GB o más en FP16, y en modelos con 4-6 GB en cuantización de 4 bits.
- Opciones de despliegue: transformers (nativo), vLLM, Text Generation Inference (TGI), llama.cpp, Ollama (previa conversión a GGUF), SGLang.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Llama-3.2-3B-RegMix-MT-r2006-seed123 | 3.606.752.256 | 128.000 (heredado, no confirmado) | llama3.2 | Hugging Face, 0 descargas | Ajuste fino supervisado sin evaluación publicada |
| meta-llama/Llama-3.2-3B | 3.212.000.000 (aprox.) | 128.000 | llama3.2 | Hugging Face, ampliamente usado | Modelo base oficial de Meta, con evaluación y soporte de tool calling |
| Qwen2.5-3B | 3.090.000.000 (aprox.) | 32.768 | Apache 2.0 | Hugging Face | Alternativa con licencia permisiva y buen rendimiento multilingüe |
| Phi-3.5-mini | 3.820.000.000 (aprox.) | 128.000 | MIT | Hugging Face | Modelo pequeño con contexto largo y licencia permisiva |

La comparativa se basa en datos públicos de los modelos alternativos; no se dispone de evaluaciones del modelo openmuse que permitan una comparación de rendimiento directa.

## Limitaciones y advertencias

- No se documenta la composición del dataset sample_r2006, por lo que se desconocen los sesgos que el ajuste fino pueda haber introducido o amplificado.
- La pérdida de validación se mantiene prácticamente constante desde el paso 50, lo que indica que el ajuste no mejora la generalización sobre el conjunto de validación; el modelo podría estar especializado en exceso en el corpus de entrenamiento.
- No hay evaluaciones publicadas de calidad, alucinación, seguridad ni capacidades, lo que impide garantizar su comportamiento en producción.
- Los idiomas soportados no están documentados; si el dataset de ajuste era monolingüe en inglés, el rendimiento en castellano u otros idiomas podría haberse degradado respecto al modelo base.
- El soporte de tool calling y function calling no está confirmado tras el ajuste; se recomienda validarlo antes de integrarlo en pipelines de agentes.
- La licencia llama3.2 impone restricciones de uso comercial (política de uso aceptable de Llama) y requiere atribución; no es una licencia de código abierto permisiva.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- No se especifica la longitud de contexto efectiva tras el ajuste; aunque la arquitectura soporta 128.000 tokens, el entrenamiento con secuencias más cortas podría degradar el rendimiento en contextos largos.
- El repositorio ocupa 7,2 GB, coherente con pesos en FP16/BF16; no se incluyen versiones cuantizadas listas para usar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openmuse/Llama-3.2-3B-RegMix-MT-r2006-seed123
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Política de uso aceptable de Llama: https://www.llama.com/llama3_2/use-policy/
