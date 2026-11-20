# puretensor/Jais-3-7B-NVFP4A16

## Resumen

Jais-3-7B-NVFP4A16 es una version cuantizada a 4 bits del modelo Jais-3-7B de inception42, un modelo de lenguaje generativo entrenado principalmente para arabe e ingles. La cuantizacion la ha realizado el usuario puretensor mediante GPTQ y el formato compressed-tensors NVFP4A16, reduciendo el peso del repositorio de 18 GB (BF16) a 8,01 GB. El checkpoint conserva los pesos en 4 bits (E2M1) con escalas FP8 por grupo de 16 y una escala FP32 por tensor, mientras que las activaciones y las capas no lineales permanecen en BF16.

El modelo base pertenece a la familia Jais, orientada al arabe, y esta pensado para generacion de texto, conversacion y razonamiento en ese idioma. Esta version cuantizada es relevante para despliegues con recursos limitados de VRAM y para servir el modelo con vLLM en GPUs Blackwell, donde el kernel FP4 de pesos permite aproximadamente el doble de throughput frente a BF16, segun los datos del autor.

Se trata de una release de prueba, sin afiliacion con los autores del modelo base, y su licencia es Apache-2.0. La calidad medida en arabe (ArabicMMLU) y en matematicas (GSM8K) es estadisticamente indistinguible de BF16, mientras que en MMLU en ingles se observa una caida de 0,79 puntos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Jais-3-7B, 36 bloques transformer) |
| Parametros totales | 8.999.178.240 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos 4 bits E2M1, escala FP8 E4M3 por grupo de 16, escala FP32 por tensor; GPTQ con block_size 128, dampening_frac 0.01, actorder static |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, `nvfp4-pack-quantized`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 36 bloques con aproximadamente 9.000 millones de parametros. En esta version se cuantizan los pesos de todas las capas `Linear` de los 36 bloques, mientras que los embeddings de tokens, la cabeza de salida, todas las normas y todas las activaciones se mantienen en BF16. La cuantizacion se aplico con GPTQ (block_size 128, dampening_frac 0.01, actorder static) usando llm-compressor 0.15.0 y compressed-tensors 0.20.1, con transformers 5.21.0 y torch 2.14.1.

La calibracion empleo 2.048 muestras con formato de chat de hasta 2.048 tokens cada una: 1.024 pares instruccion-respuesta en arabe (primeras filas de `arbml/CIDAR`) y 1.024 muestras de `mlabonne/open-perfectblend`. La plantilla de chat del modelo base exige un campo de pensamiento en los turnos del asistente; para calibracion y evaluacion se paso un `reasoning_content` vacio. No se dispone de informacion sobre el volumen total de tokens de entrenamiento del modelo base, la composicion del dataset original ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno en arabe e ingles, con plantilla de chat propia del modelo base.
- Razonamiento y respuesta a preguntas de conocimiento, evaluado en ArabicMMLU y MMLU.
- Resolucion de problemas matematicos de varios pasos, evaluado en GSM8K.
- Soporte de modo de pensamiento en la plantilla de chat del modelo base (campo `reasoning_content` en los turnos del asistente).
- Capacidades multilingues limitadas a arabe e ingles segun la model card.
- Tool calling, function calling y uso agentico: no disponible en la informacion proporcionada.
- Vision, audio y otras modalidades: no disponible.

## Casos de uso

- Atencion al cliente en arabe: el modelo puede gestionar conversaciones multi-turno en arabe con la plantilla de chat del modelo base, y la version cuantizada reduce el coste de VRAM por instancia, permitiendo mas replicas concurrentes en el mismo servidor.
- Despliegue en GPUs Blackwell con vLLM: servir el checkpoint con `vllm serve` y el kernel FP4 de pesos ofrece aproximadamente 2,08x de throughput en un solo stream y 1,86x con 32 peticiones concurrentes frente a BF16, segun las mediciones del autor.
- Generacion de texto a gran escala en ingles y arabe: el checkpoint mantiene el 90,4% de coincidencia con el token top-1 de BF16 en WikiText-2, lo que permite usarlo en tareas de generacion masiva donde una pequena perdida de calidad es aceptable a cambio de la mitad del tamano en disco.
- Evaluacion y prototipado de bajo coste: con 8,01 GB de pesos frente a 18 GB en BF16, el modelo se puede descargar y cargar en entornos con VRAM limitada, aunque en Transformers los pesos se expanden a 16 bits al cargar y el ahorro es solo de disco y descarga.
- Investigacion sobre cuantizacion NVFP4: el autor publica metricas de divergencia KL, McNemar y perplejidad que sirven como referencia para estudiar el impacto de NVFP4A16 en modelos arabes.
- Tareas de matematicas escolares en arabe e ingles: GSM8K pasa de 85,60 a 84,08 en exact match, una diferencia con p=0,08, por lo que el checkpoint es adecuado para asistentes educativos donde ese margen es tolerable.
- Clasificacion y extraccion de informacion en arabe: el modelo conserva el rendimiento en ArabicMMLU (68,38 frente a 68,51 en BF16), lo que lo hace util para tareas de conocimiento y seleccion de respuestas en ese idioma.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness 0.4.13, sin plantilla de chat, GSM8K con flexible-extract:

| Benchmark | BF16 | Este checkpoint | Cambio | Test pareado |
|---|---:|---:|---:|---|
| ArabicMMLU, accuracy (14.455 preguntas) | 68,51 | 68,38 | -0,13 | 565 perdidas, 546 ganadas, p = 0,59 |
| GSM8K, exact match (1.319 problemas) | 85,60 | 84,08 | -1,52 | 70 perdidas, 50 ganadas, p = 0,08 |
| MMLU, accuracy (14.042 preguntas) | 73,54 | 72,75 | -0,79 | 465 perdidas, 353 ganadas, p = 1e-4 |
| WikiText-2, perplejidad (131.072 tokens) | 10,13 | 10,42 | +0,29 | no disponible |

Divergencia KL frente a BF16:

| Texto | Tokens | KL media | KL percentil 99 | Mismo token top-1 que BF16 |
|---|---:|---:|---:|---:|
| WikiText-2 test (ingles) | 131.072 | 0,038 | 0,33 | 90,4% |
| Chat (`HuggingFaceH4/ultrachat_200k`, `test_sft`, 256 conversaciones, ingles) | 238.748 | 0,076 | 1,11 | 91,3% |
| Arabe (`arbml/CIDAR`, 256 pares desde la fila 9.000) | 64.040 | 0,057 | 0,71 | 90,8% |

Rendimiento en vLLM 0.34.0 con kernel `MarlinNvFp4LinearKernel` en una GPU Blackwell (compute capability 12.0):

| Metrica | BF16 | Este checkpoint |
|---|---:|---:|
| GSM8K via API completions (flexible-extract) | 85,44 | 84,23 |
| Throughput, un solo stream | 1,00x | 2,08x |
| Throughput, 8 concurrentes | 1,00x | 2,08x |
| Throughput, 32 concurrentes | 1,00x | 1,86x |

El autor advierte que las puntuaciones de benchmarks pueden variar uno o dos puntos entre calibraciones de la misma receta, y que las filas de chat y arabe comparten familia de dataset con la calibracion, por lo que son optimistas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. El repositorio ocupa 8,01 GB en disco frente a 18 GB en BF16; en Transformers los pesos se expanden a 16 bits al cargar, por lo que la VRAM en ese motor se aproxima a la del modelo BF16.
- GPU recomendadas: el autor midio el rendimiento en una GPU NVIDIA Blackwell (compute capability 12.0) con vLLM 0.34.0. Para aprovechar el kernel FP4 de pesos se requiere hardware compatible con NVFP4; no se especifican modelos concretos como A100, H100 o RTX 4090.
- Cabe en GPU consumer: no disponible; no se aportan pruebas en GPUs consumer.
- Opciones de despliegue: vLLM (`vllm serve puretensor/Jais-3-7B-NVFP4A16 --trust-remote-code`) y Transformers con `compressed-tensors` instalado. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 2,08x frente a BF16 en un solo stream y 8 concurrentes, y 1,86x con 32 concurrentes, con generaciones greedy de 256 tokens fijos. El autor indica que los valores variaran en otro hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| puretensor/Jais-3-7B-NVFP4A16 | 8.999.178.240 | no disponible | NVFP4A16 (GPTQ) | Apache-2.0 | Hugging Face |
| inception42/Jais-3-7B (BF16) | no disponible en la informacion | no disponible | BF16 | Apache-2.0 | Hugging Face |
| Modelo de 0,9B de la familia Jais | no disponible | no disponible | misma receta NVFP4A16 (mencionado) | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos alternativos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- En Transformers los pesos se expanden a 16 bits al cargar; el ahorro es solo de disco y descarga, y la ganancia de velocidad requiere un motor con kernel FP4 de pesos como vLLM.
- Una sola calibracion, sin semillas repetidas; no se ejecutaron evaluaciones de seguridad, dialecto ni contexto largo sobre el modelo cuantizado.
- El checkpoint debe conservar el comportamiento por defecto del tokenizador: todo el texto de calibracion y todos los benchmarks empiezan con el token de inicio de texto que el tokenizador anade por defecto. El modelo de 0,9B de la familia, cuyo tokenizador no lo anade, fallo completamente con prompts sin ese token al cuantizarse de la misma forma; este checkpoint no se ha probado sin el token de inicio.
- En MMLU en ingles la caida de 0,79 puntos es significativa (p = 1e-4) para este fichero, aunque el autor senala que otra calibracion podria caer a cualquiera de los dos lados.
- Riesgo de alucinacion y sesgos conocidos: no disponible en la informacion proporcionada.
- Limitaciones de contexto e idioma: solo arabe e ingles segun la model card; la longitud de contexto no se especifica.
- Restricciones de licencia: Apache-2.0, igual que el modelo base; la release es de prueba y no esta afiliada ni respaldada por los autores del modelo base.
- En produccion, conviene validar el checkpoint en el hardware y motor objetivo antes de sustituir el BF16, dado que el rendimiento depende del kernel FP4 disponible.

## Enlaces

- Hugging Face: https://huggingface.co/puretensor/Jais-3-7B-NVFP4A16
- Modelo base: https://huggingface.co/inception42/Jais-3-7B
- Dataset de calibracion arabe: https://huggingface.co/datasets/arbml/CIDAR
- Dataset de calibracion ingles: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Dataset de evaluacion de chat: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- llm-compressor: no disponible
- compressed-tensors: no disponible
- vLLM: no disponible
- lm-evaluation-harness: no disponible
