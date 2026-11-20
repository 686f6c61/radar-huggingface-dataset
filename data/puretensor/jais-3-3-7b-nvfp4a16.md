# puretensor/Jais-3-3.7B-NVFP4A16

## Resumen

Jais-3-3.7B-NVFP4A16 es una cuantización de 4 bits del modelo base inception42/Jais-3-3.7B, un modelo de lenguaje de la familia Jais orientado principalmente al árabe y al inglés. La conversión la ha realizado PureTensor a partir de los pesos oficiales en BF16, aplicando GPTQ con el esquema NVFP4A16 de compressed-tensors: pesos en FP4 E2M1 con escalas FP8 E4M3 por grupo de 16 valores y una escala FP32 por tensor, mientras las activaciones permanecen en 16 bits.

El checkpoint pesa 4,69 GB frente a los 10,12 GB del BF16 original, lo que permite servirlo en GPUs con menos memoria y con una mejora de throughput de aproximadamente 1,8 veces en vLLM sobre una GPU Blackwell. El precio es una pérdida medible en conocimiento en inglés: 4,0 puntos en MMLU, mientras que en árabe (ArabicMMLU) y en matemáticas (GSM8K) la diferencia respecto a BF16 es estadísticamente indistinguible.

El modelo cuenta con 5.058.255.360 parámetros totales según los safetensors del repo, 36 bloques transformer y una licencia Apache 2.0. Es una release de prueba, sin afiliación con los autores del modelo base, y está pensada para desarrolladores que necesiten desplegar Jais en producción con requisitos de VRAM ajustados y cargas de trabajo centradas en árabe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (36 bloques), esquema de cuantización NVFP4A16 de compressed-tensors |
| Parametros totales | 5.058.255.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits W4A16 (pesos FP4 E2M1, activaciones BF16); GPTQ con block_size 128, dampening_frac 0.01, actorder static |
| Idiomas soportados | ar (árabe), en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, `nvfp4-pack-quantized`) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 36 bloques. La cuantización se aplica a los pesos de todas las capas `Linear` de esos 36 bloques; quedan en BF16 los embeddings de tokens, la cabeza de salida (aproximadamente un cuarto de los parámetros, lo que explica que el fichero sea 2,2 veces más pequeño y no 3,5), todas las normalizaciones y todas las activaciones. El método es GPTQ con `block_size` 128, `dampening_frac` 0.01 y `actorder` estático.

La calibración usó 2.048 muestras con formato de chat de hasta 2.048 tokens cada una: 1.024 pares instrucción-respuesta en árabe (primeras filas de `arbml/CIDAR`) y 1.024 de `mlabonne/open-perfectblend`. Las herramientas empleadas fueron llm-compressor 0.15.0, compressed-tensors 0.20.1, transformers 5.21.0 y torch 2.14.1. La plantilla de chat del modelo base exige un campo de pensamiento en los turnos del asistente; para calibración y evaluación se pasó un `reasoning_content` vacío. No se dispone de información sobre los datos de preentrenamiento del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional en árabe e inglés, con plantilla de chat propia del modelo base.
- Razonamiento y conocimiento general evaluado en MMLU (inglés) y ArabicMMLU.
- Razonamiento matemático de varios pasos evaluado en GSM8K.
- Soporte de modo pensamiento mediante el campo `reasoning_content` de la plantilla de chat.
- Compatible con vLLM (kernel `MarlinNvFp4LinearKernel` para FP4 weight-only) y con transformers instalando `compressed-tensors`.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.
- Capacidad multilingüe limitada a los idiomas declarados: árabe e inglés.

## Casos de uso

- Asistencia conversacional en árabe: el modelo está calibrado con un 50 % de texto árabe y mantiene en ArabicMMLU un rendimiento equivalente al BF16 (61,81 frente a 61,56), por lo que es adecuado para chatbots y atención al cliente en ese idioma con menor huella de VRAM.
- Despliegue en GPUs de gama media: con 4,69 GB de pesos, el checkpoint cabe en GPUs consumer con 8-12 GB de VRAM, permitiendo servir Jais en hardware que no admite el BF16 de 10,12 GB.
- Servicio de alto throughput en vLLM: con el kernel FP4 de vLLM ofrece 1,78x de throughput en un solo stream y 1,58x con 32 peticiones concurrentes frente a BF16, útil para APIs con muchas peticiones cortas.
- Resumen y generación de contenido en árabe: tareas de summarización y redacción donde el conocimiento enciclopédico en inglés no es crítico y prima el coste por token.
- Evaluación e investigación sobre cuantización: el checkpoint incluye métricas de divergencia KL y pruebas pareadas McNemar, lo que lo convierte en una referencia para estudiar el impacto de NVFP4 en modelos bilingües árabe-inglés.
- Prototipado rápido en transformers: se carga con `AutoModelForCausalLM` y `trust_remote_code=True` más `compressed-tensors`, sin necesidad de convertir pesos manualmente.
- Razonamiento matemático básico en producción: GSM8K se mantiene en 79,23 frente a 79,45 del BF16, por lo que tareas de aritmética y problemas escolares son viables con el ahorro de memoria del checkpoint cuantizado.

## Benchmarks y rendimiento

Calidad medida con lm-evaluation-harness 0.4.13, sin plantilla de chat, GSM8K con flexible-extract, referencia BF16:

| Benchmark | BF16 | Este checkpoint | Cambio | Prueba pareada |
|---|---:|---:|---:|---|
| ArabicMMLU, accuracy (14.455 preguntas) | 61,56 | 61,81 | +0,25 | 675 perdidas, 712 ganadas, p = 0,33 |
| GSM8K, exact match (1.319 problemas) | 79,45 | 79,23 | -0,22 | 79 perdidas, 76 ganadas, p = 0,87 |
| MMLU, accuracy (14.042 preguntas) | 68,28 | 64,28 | -4,00 | 1.024 perdidas, 462 ganadas, p = 4e-49 |
| WikiText-2 perplexity (131.072 tokens) | 11,67 | 12,21 | +0,54 | |

Divergencia KL frente a BF16 (distribución completa del siguiente token, teacher-forced, ventanas de 1.024 tokens):

| Texto | Tokens | KL media | KL percentil 99 | Mismo token top que BF16 |
|---|---:|---:|---:|---:|
| WikiText-2 test (inglés) | 131.072 | 0,047 | 0,37 | 88,9 % |
| Chat (`HuggingFaceH4/ultrachat_200k`, `test_sft`, 256 conversaciones, inglés) | 238.748 | 0,061 | 0,85 | 90,9 % |
| Árabe (`arbml/CIDAR`, 256 pares desde la fila 9.000) | 64.040 | 0,048 | 0,81 | 91,4 % |

Comparación de estrategias de calibración (misma receta, solo cambia el texto de calibración):

| Calibración | MMLU (inglés) | ArabicMMLU | GSM8K | KL wiki inglés | KL árabe |
|---|---:|---:|---:|---:|---:|
| BF16 referencia | 68,28 | 61,56 | 79,45 | 0 | 0 |
| Mitad árabe, mitad inglés (este checkpoint) | 64,28 | 61,81 | 79,23 | 0,047 | 0,048 |
| Solo inglés (no publicado) | 66,16 | 59,32 | 78,92 | 0,046 | 0,059 |

Rendimiento en vLLM 0.34.0 sobre una GPU Blackwell (compute capability 12.0):

| Métrica | BF16 | Este checkpoint |
|---|---:|---:|
| GSM8K vía API de completions (flexible-extract) | 79,38 | 78,77 |
| Throughput, un stream | 1,00x | 1,78x |
| Throughput, 8 concurrentes | 1,00x | 1,75x |
| Throughput, 32 concurrentes | 1,00x | 1,58x |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 4,69 GB; con activaciones BF16 y caché KV en contexto moderado, el consumo práctico se sitúa en torno a 6-8 GB en GPUs con suficiente memoria para el lote.
- GPU recomendadas: NVIDIA Blackwell (compute capability 12.0) para aprovechar el kernel `MarlinNvFp4LinearKernel` de vLLM; el autor reporta pruebas en una estación de trabajo Blackwell.
- GPU consumer: cabe en tarjetas con 8 GB o más de VRAM, frente a los 10,12 GB de pesos del BF16 que exigen 12-16 GB.
- Opciones de despliegue: vLLM (`vllm serve puretensor/Jais-3-3.7B-NVFP4A16 --trust-remote-code`) y transformers con `compressed-tensors` instalado. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,78x en un stream, 1,75x con 8 concurrentes y 1,58x con 32 concurrentes frente a BF16, medido con generaciones greedy de 256 tokens fijos; el autor advierte que variará en otro hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| puretensor/Jais-3-3.7B-NVFP4A16 | 5.058.255.360 | no disponible | Apache 2.0 | safetensors NVFP4A16 | Cuantización 4 bits, 4,69 GB, calibración bilingüe |
| inception42/Jais-3-3.7B (BF16) | no disponible en la información | no disponible | Apache 2.0 | BF16 | Modelo base, 10,12 GB, referencia de calidad |
| Cuantización 4 bits completa (pesos y activaciones) | no disponible | no disponible | no disponible | no disponible | Probada y no publicada: pierde 6,3 puntos en MMLU, 4,7 en ArabicMMLU y 6,0 en GSM8K servido, sin ganancia de velocidad |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- MMLU en inglés cae 4,0 puntos frente a BF16 (64,28 frente a 68,28), con p = 4e-49 en la prueba pareada; si las tareas de conocimiento en inglés son críticas, el checkpoint no es adecuado.
- La calibración bilingüe favorece al árabe: una calibración solo en inglés habría dado 66,16 en MMLU pero 59,32 en ArabicMMLU. El equilibrio es un compromiso explícito.
- Las métricas de KL en chat y en árabe están sesgadas a favor porque los conjuntos de evaluación comparten familia con los datos de calibración; ArabicMMLU y WikiText sí son independientes.
- El autor advierte que las puntuaciones de benchmark pueden variar uno o dos puntos entre calibraciones con la misma receta, por lo que la dirección del efecto es más fiable que su magnitud exacta.
- Es una release de prueba sin afiliación ni respaldo de los autores del modelo base.
- No se documentan sesgos específicos, pero al ser un modelo entrenado principalmente en árabe e inglés, su cobertura de otros idiomas es limitada.
- Riesgo de alucinación inherente a los modelos de 3,7B de parámetros, no cuantificado en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el checkpoint cuantizado.
- Requiere `trust_remote_code=True` y la dependencia `compressed-tensors`, lo que añade superficie de ejecución de código de terceros.
- El soporte de tool calling y agentes no está documentado; no debe asumirse en producción.

## Enlaces

- Hugging Face: https://huggingface.co/puretensor/Jais-3-3.7B-NVFP4A16
- Modelo base: https://huggingface.co/inception42/Jais-3-3.7B
- Dataset de calibración árabe: https://huggingface.co/datasets/arbml/CIDAR
- Dataset de calibración inglés: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Dataset de evaluación de chat: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- llm-compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
