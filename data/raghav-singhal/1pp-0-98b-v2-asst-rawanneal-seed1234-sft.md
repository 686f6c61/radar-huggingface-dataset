# Raghav-Singhal/1pp-0.98b-v2-asst-rawanneal-seed1234-sft

## Resumen

1pp-0.98b-v2-asst-rawanneal-seed1234-sft es un modelo de lenguaje de 981.545.472 parametros (aproximadamente 0,98B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) de EPFL DLAB. Se trata de un artefacto de investigacion, no de un asistente de proposito general, disenado para estudiar como afecta la composicion del corpus de preentrenamiento (documentos originales frente a conversaciones reescritas) al comportamiento final del modelo, manteniendo constante el resto de variables.

El modelo emplea una arquitectura decoder de estilo Llama con 24 capas, hidden de 1.536, FFN de 6.144 con SwiGLU, 12 cabezas de atencion y 4 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y una longitud de secuencia de 4.096 tokens. Forma parte de la "ladder v2", una escalera de escalado con cuatro tamanos (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones de datos y tres semillas (28, 42 y 1234), cada tamano entrenado desde cero durante 20,3 tokens de asistente por parametro sobre el mismo flujo de datos alineado por paso.

La relevancia de esta ficha radica en su valor metodologico: la variante "rawanneal" aplica el cooldown final del preentrenamiento sobre conversaciones 1PP en lugar de sobre documentos, lo que permite comparar directamente con la ejecucion completa 1PP. El checkpoint publicado incluye ademas un ajuste fino supervisado (SFT) sobre 400.000 conversaciones, con una perdida de validacion de 1,990 en tokens de asistente sobre 1.998 conversaciones reservadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama (transformer denso), 24 capas, hidden 1.536, FFN 6.144 (SwiGLU), 12 cabezas de atencion / 4 cabezas KV (head dim 128), RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm |
| Parametros totales | 981.545.472 (aproximadamente 0,98B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en bf16; el repo contiene safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tokenizer | Vocabulario SmolLM2 (49.152) mas `<|pad|>`; `<|endoftext|>` como token de fin de documento |
| Tamano del repo | 2,0 GB |
| Formato de chat | ChatML sin turno de sistema |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de estilo Llama con 24 capas, dimension oculta de 1.536, FFN de 6.144 con activacion SwiGLU, 12 cabezas de atencion y 4 cabezas KV con dimension de cabeza 128. Usa RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases y sin QK-norm, con una longitud de secuencia de 4.096 tokens. El tokenizer parte del vocabulario de SmolLM2 (49.152 entradas) al que se anade `<|pad|>`, y `<|endoftext|>` actua como token de fin de documento.

El preentrenamiento sigue un flujo alineado por pasos: durante los primeros 16.902 pasos se usan los documentos originales de DCLM-edu y durante los ultimos 1.877 pasos (el cooldown) se emplean conversaciones 1PP reescritas a partir de esos mismos documentos, con la perdida calculada unicamente sobre los turnos de asistente. En total, 18.779 pasos del flujo alineado de 1PP, equivalentes a 39,38B posiciones de token, con batch global de 512 × 4.096 tokens y enmascaramiento de atencion entre documentos. El optimizador es Muon (escalado por forma, LR matricial 0,005) combinado con Adam para el resto de parametros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para normas), con warmup de 1.181 pasos, fase constante y decaimiento lineal en los ultimos 1.877 pasos hasta 1/100, weight decay 0,1, desviacion estandar de inicializacion 0,0103 y entrenamiento en bf16. El SFT se realiza durante una epoca sobre una mezcla de 400.000 conversaciones (`jkminder/model-raising-pb-100k-3c-mt-sft` con 98,5k multi-turno, `dlab-spp/sp-sft-normal-300k` depurado hasta 271,6k y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`), con la misma pila Megatron/Muon, ChatML sin turno de sistema, perdida solo en turnos de asistente, LR matricial 0,002, semilla 28, batch global de 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%.

## Capacidades

- Generacion de texto conversacional en ingles con formato ChatML sin turno de sistema.
- Razonamiento basico y respuesta a instrucciones derivadas del SFT sobre 400.000 conversaciones.
- Conversaciones multi-turno, con perdida entrenada explicitamente sobre turnos de asistente.
- Capacidad limitada de seguir el formato de chat exacto definido en la plantilla incluida (`chat_template`), con parada en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles segun la model card.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Alineamiento de seguridad: parcial, mediante la inclusion de 30k muestras del conjunto `sp-sft-safety-180k` en el SFT.

## Casos de uso

- Investigacion sobre composicion de corpus de preentrenamiento: el modelo sirve como punto de comparacion controlado frente a `1pp-0.98b-v2-asst-seed1234-sft` y la variante base, permitiendo aislar el efecto del cooldown sobre conversaciones frente a documentos en el mismo flujo de datos alineado por pasos.
- Reproducibilidad de estudios de escalado: al formar parte de una escalera con cuatro tamanos, tres condiciones y tres semillas, permite analizar leyes de escalado y varianza entre semillas con un unico diseno experimental.
- Experimentos de destilacion o ajuste fino academico: su tamano de 0,98B y su licencia Apache 2.0 lo hacen adecuado como modelo base para estudiar tecnicas de SFT, DPO o RLHF en entornos con recursos limitados.
- Evaluacion de sesgos y comportamiento conversacional: al ser un modelo pequeno entrenado con un SFT acotado, es util para medir como se degradan las capacidades conversacionales al reducir el numero de parametros y la cantidad de datos.
- Prototipado de pipelines de inferencia con transformers y TGI: el repo incluye pesos safetensors compatibles con `text-generation-inference` y `endpoints_compatible`, lo que permite validar infraestructura de despliegue sin coste elevado.
- Docencia y divulgacion: su card detallada (hiperparametros, perdidas de validacion, verificacion frente al checkpoint de Megatron) lo convierte en un ejemplo didactico de trazabilidad experimental en modelos open source.
- Generacion de texto en ingles de baja latencia en hardware consumer: con 0,98B de parametros, cabe en GPUs de gama media y puede usarse para tareas de generacion acotada donde no se requiera un asistente generalista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card solo reporta perdidas de validacion internas:

| Metrica | Valor |
|---|---|
| Perdida de validacion en texto de asistente (checkpoint final de preentrenamiento) | 1,642 |
| Perdida de validacion en texto de usuario | 4,079 |
| Perdida de validacion en texto de documento | 3,049 |
| Perdida de validacion en SFT (tokens de asistente, 1.998 conversaciones reservadas) | 1,990 |
| Verificacion HF frente a Megatron (sft_val segmentos [3, 4]) | 1,9897 frente a 1,9896 (diferencia absoluta 0,0000) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos (981,5M de parametros × 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 3 y 4 GB para secuencias de 4.096 tokens.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1 GB para pesos; en 4 bits, alrededor de 0,5 GB (estimaciones teoricas, no confirmadas en la model card).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070); A100, H100 o L40S para despliegues con concurrencia alta.
- Cabe en GPU consumer: si, en la mayoria de GPUs consumer modernas con 8 GB o mas; tambien en CPU con llama.cpp u Ollama si se generan pesos GGUF (no incluidos en el repo).
- Opciones de despliegue: transformers (libreria nativa), text-generation-inference (TGI), endpoints compatibles de Hugging Face; vLLM y llama.cpp son viables tecnicamente pero no se mencionan en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-0.98b-v2-asst-rawanneal-seed1234-sft | 0,98B | 4.096 | Apache 2.0 | Variante rawanneal con SFT; artefacto de investigacion |
| 1pp-0.98b-v2-asst-seed1234-sft | 0,98B | 4.096 | Apache 2.0 | Ejecucion completa 1PP con SFT; referencia directa del mismo estudio |
| 1pp-0.98b-v2-raw-seed1234-base | 0,98B | 4.096 | Apache 2.0 | Checkpoint base sin cooldown sobre conversaciones ni SFT |
| SmolLM2-1.7B | 1,7B | 8.192 (segun version) | Apache 2.0 | Modelo generalista de Hugging Face; contexto y datos no verificados en esta ficha |

La comparacion con modelos generalistas de la misma categoria (por ejemplo, SmolLM2 o Qwen2.5-1.5B) no puede establecerse con rigor porque no se han publicado benchmarks estandar para este checkpoint. La comparacion mas significativa es interna al estudio 1PP, donde las tres variantes comparten arquitectura, tokenizer y flujo de datos, y solo difieren en la condicion de entrenamiento.

## Limitaciones y advertencias

- Artefacto de investigacion: la propia model card indica explicitamente que no es un asistente de proposito general; su uso en produccion como chatbot esta desaconsejado.
- Solo ingles: el modelo no ha sido entrenado ni evaluado en castellano ni en otros idiomas.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de documentacion larga o conversaciones extensas.
- Sin turno de sistema: el modelo nunca vio un rol de sistema durante el entrenamiento, por lo que inyectar instrucciones de sistema puede degradar el comportamiento.
- Riesgo de alucinacion: no se reportan evaluaciones de factualidad ni de tasas de alucinacion; al ser un modelo de menos de 1B de parametros, la tasa esperada es alta.
- Sesgos: no se documentan analisis de sesgos; el corpus DCLM-edu y los conjuntos de SFT pueden introducir sesgos de dominio, genero o cultura no cuantificados.
- Alineamiento de seguridad parcial: solo 30.000 muestras de seguridad en un SFT de 400.000 conversaciones, sin etapa de RLHF o DPO documentada.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantias y de evaluaciones de robustez hace necesario un analisis de riesgo previo en cualquier despliegue real.
- Sin datos de benchmarks publicos: no es posible comparar su rendimiento con alternativas de forma objetiva.
- Tokenizer basado en SmolLM2: puede presentar ineficiencias en la tokenizacion de ciertos dominios no representados en el corpus de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-asst-rawanneal-seed1234-sft
- Variante base sin cooldown conversacional: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-seed1234-base
- Variante completa 1PP con SFT: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-asst-seed1234-sft
- Coleccion 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Registros de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Conjunto de SFT multi-turno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Conjunto de SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Conjunto de SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
