# jaipkapoor99/ultron-113m-instruct

## Resumen

Ultron-113M-Instruct es un modelo de lenguaje causal de 113 millones de parámetros, desarrollado por Jai Kapoor (jaipkapoor99), que parte del modelo base Ultron-113M y se ha ajustado mediante Supervised Fine-Tuning (SFT) sobre 163,84 millones de tokens del dataset conversacional HuggingFaceTB/smoltalk. El entrenamiento se realizó en una NVIDIA RTX 5090 durante 2.500 pasos de optimización, alcanzando una pérdida final de 1,5342 en el lote de entrenamiento y una perplejidad de 4,33 en el conjunto de validación.

El modelo está diseñado para tareas de generación de texto en inglés con formato de chat ChatML, y destaca por su arquitectura moderna (GQA, SwiGLU, RoPE, QK-Norm) y por el uso del optimizador Muon en el preentrenamiento base. Su tamaño reducido (113,3 M de parámetros) lo hace adecuado para entornos con recursos limitados, aunque su capacidad de razonamiento y conocimiento factual es limitada, como se refleja en los benchmarks y en los ejemplos de conversación mostrados por el autor.

La relevancia de este modelo reside en su carácter didáctico y experimental: demuestra cómo aplicar técnicas de entrenamiento de última generación (SFT con ChatML, tokenizer SmolLM2) en un modelo pequeño, y sirve como base para experimentos de fine-tuning adicional o para prototipado rápido en aplicaciones de chat en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal, 12 capas, d_model=768, Pre-RMSNorm, RoPE (theta=10.000), SwiGLU, QK-Norm |
| Parametros totales | 113.266.944 (113,3 M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No especificados (formato original safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | Safetensors (repo de 2,1 GB) |

## Arquitectura y entrenamiento

Ultron-113M-Instruct es un transformer causal denso con 12 capas, dimensión de modelo 768 y atención por grupos (GQA) con 12 cabezas de consulta y 4 cabezas de clave/valor (ratio 3:1). Incorpora normalización previa RMSNorm, embeddings rotatorios (RoPE) con theta 10.000, activación SwiGLU y normalización QK. El tokenizer es el Byte-Level BPE de SmolLM2-135M con un vocabulario de 49.152 tokens.

El modelo base Ultron-113M fue preentrenado desde cero sobre 10 mil millones de tokens del dataset FineWeb-Edu, utilizando el optimizador Muon y técnicas de streaming de datos sin copias. El ajuste instructivo se realizó mediante SFT sobre 163,84 millones de tokens del dataset smoltalk, con formato de chat ChatML, durante 2.500 pasos y una velocidad máxima de 192.000 tokens por segundo en una RTX 5090. La pérdida final de entrenamiento fue de 1,5342 y la pérdida en el conjunto de desarrollo (43.938 secuencias, 31,0 millones de tokens objetivo) fue de 1,4662, con una perplejidad de 4,33.

No se menciona el uso de RLHF ni DPO; el ajuste es exclusivamente supervisado. Tampoco se detalla el número exacto de tokens de contexto máximo, aunque por el tamaño del modelo y el tokenizer probablemente sea de 2048 o 4096, pero no está confirmado.

## Capacidades

- Generacion de texto en ingles con formato de chat ChatML, incluyendo gestion de turnos y terminacion limpia con `<|im_end|>`.
- Mantiene una persona de asistente defensivo, con frases como "as an AI..." y rechazos de peticiones que involucren datos personales.
- Soporte basico de conversacion multi-turno, como se muestra en el ejemplo de chat del autor.
- Capacidad limitada de razonamiento de sentido comun, con resultados cercanos al azar en tareas como Winogrande (50,83 %) o ARC Challenge (25,26 %).
- No se menciona soporte explicito para tool calling, function calling, agentes, vision ni audio.
- Multilingue: solo ingles, sin evidencia de otros idiomas.

## Casos de uso

- Prototipado rapido de chatbots en ingles: por su tamano reducido, permite iterar rapidamente en entornos de desarrollo sin necesidad de GPUs de gama alta.
- Fine-tuning adicional para tareas especificas: al ser un modelo abierto con licencia MIT, se puede ajustar sobre dominios concretos (por ejemplo, atencion al cliente en un sector vertical) con pocos recursos.
- Educacion e investigacion en NLP: util para ensenar tecnicas de SFT, uso de ChatML y evaluacion de modelos pequenos en entornos academicos.
- Generacion de texto asistida en aplicaciones con restricciones de latencia o memoria: su tamano permite desplegarlo en CPU o en GPUs con poca VRAM, aunque con rendimiento limitado.
- Experimentacion con optimizadores y arquitecturas modernas: el modelo base y su proceso de entrenamiento estan documentados en GitHub, lo que facilita reproducir y estudiar el impacto del optimizador Muon y GQA en modelos pequenos.
- Evaluacion comparativa de tecnicas de alineacion: al comparar el modelo base con el instruct, se puede analizar el "alignment tax" y la perdida de rendimiento en tareas de continuacion multiple-choice.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en el model-index (evaluados con EleutherAI lm-evaluation-harness sobre 17.195 ejemplos zero-shot) son:

| Benchmark | Accuracy (Norm) |
|---|---|
| PIQA | 61,86 |
| Winogrande (acc) | 50,83 |
| ARC Easy | 45,29 |
| HellaSwag | 32,83 |
| OpenBookQA | 29,80 |
| ARC Challenge | 25,26 |

Ademas, la model card incluye una comparativa entre el modelo base y el instruct:

| Benchmark | Base (Raw) | Base (Norm) | Instruct (Raw) | Instruct (Norm) | Aleatorio |
|---|---|---|---|---|---|
| PIQA | 64,25 | 63,66 | 62,46 | 61,86 | 50,00 |
| Winogrande | 49,17 | — | 50,83 | — | 50,00 |
| ARC Easy | 53,62 | 47,05 | 48,11 | 45,29 | 25,00 |
| HellaSwag | 30,24 | 33,75 | 29,70 | 32,83 | 25,00 |
| OpenBookQA | 21,60 | 32,20 | 18,60 | 29,80 | 25,00 |
| ARC Challenge | 23,55 | 26,54 | 21,76 | 25,26 | 25,00 |
| Media macro | 40,41 | 40,41 | 38,58 | 38,58 | 33,33 |

Se observa una ligera caida en la mayoria de tareas tras el fine-tuning, excepto en Winogrande, donde mejora un 1,66 %. El autor indica que no hay olvido catastrofico significativo.

## Requisitos de hardware

No se dispone de requisitos oficiales de hardware. Sin embargo, dado que el modelo tiene 113,3 millones de parametros y se entreno en una RTX 5090, se pueden hacer estimaciones orientativas para inferencia:

- VRAM estimada en FP32: ~453 MB (113,3 M x 4 bytes).
- VRAM estimada en FP16/BF16: ~227 MB.
- VRAM estimada en int8: ~113 MB.
- VRAM estimada en int4: ~57 MB.
- Es desplegable en GPUs consumer como RTX 3060, RTX 4060, RTX 4090, etc., e incluso en CPU con suficiente RAM.
- Opciones de despliegue: no se mencionan compatibilidades especificas, pero por su formato safetensors y arquitectura estandar, deberia ser compatible con frameworks como vLLM, llama.cpp, Ollama o TGI, aunque no esta confirmado.
- Latencia y throughput: no hay datos publicados. En la RTX 5090 durante el entrenamiento se alcanzaron 192.000 tok/s, pero la inferencia dependera del hardware y la cuantizacion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros modelos de tamano similar (por ejemplo, SmolLM2-135M, TinyLlama-1.1B) en los mismos benchmarks para realizar una comparacion directa. El modelo comparte tokenizer con SmolLM2-135M, pero no hay metricas publicadas de ese modelo en las mismas tareas. Por tanto, no es posible ofrecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Errores factuales significativos: en el ejemplo de chat, el modelo afirma que la capital de India es Mumbai (en lugar de Nueva Delhi) y confunde a Magnus Carlsen con Agnes Carlsen, lo que indica un conocimiento enciclopedico muy limitado.
- Razonamiento de sentido comun pobre: los resultados en ARC Challenge (25,26 %) y OpenBookQA (29,80 %) estan cerca del azar (25 %).
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Longitud de contexto no especificada; se desconoce si puede manejar secuencias largas.
- No se menciona soporte para tool calling, agentes ni tareas de codigo o matematicas.
- Al ser un modelo pequeno, su capacidad de generacion creativa y de mantener coherencia en conversaciones largas es limitada.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias de exactitud ni de seguridad para aplicaciones criticas.
- No se han publicado evaluaciones de sesgos ni de robustez ante entradas adversariales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaipkapoor99/ultron-113m-instruct
- Repositorio GitHub: https://github.com/jaipkapoor99/ultron
- Modelo base pre-entrenado: https://huggingface.co/jaipkapoor99/ultron-113m
- Dataset de shards pre-tokenizados para SFT: https://huggingface.co/datasets/jaipkapoor99/ultron-smoltalk-shards
- Registro de validacion en W&B: https://wandb.ai/jaipkapoor99-rumani-dhaage/ultron-sft-validation/runs/h0t7nqu9
