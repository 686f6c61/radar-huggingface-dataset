# PureTensorAI/Jais-3-32B-NVFP4A16

## Resumen

Jais-3-32B-NVFP4A16 es una cuantización de 4 bits del modelo Jais-3-32B de inception42, publicada por PureTensorAI. Se trata de un checkpoint de pesos en formato NVFP4A16 (W4A16: pesos de 4 bits, activaciones en 16 bits) generado mediante GPTQ con calibración bilingüe árabe-inglés. El modelo base es un transformer denso de la familia Jais-3, orientado a generación de texto conversacional en árabe e inglés, con un total de 20.686.443.968 parámetros reales según los safetensors del repositorio.

La relevancia de esta ficha radica en que demuestra que la cuantización agresiva a 4 bits puede aplicarse a modelos de tamaño medio-grande con una degradación de calidad muy contenida: en GSM8K la diferencia frente a BF16 es estadísticamente indistinguible (92,95 frente a 93,03), y en MMLU y ArabicMMLU la caída es de aproximadamente medio punto. El repositorio ocupa 23,3 GB frente a los 69,56 GB del BF16, y en vLLM sobre GPU Blackwell el rendimiento medido es de 2,4 a 2,9 veces superior al modelo sin cuantizar.

Se trata de una release de prueba ("test release"), no afiliada ni respaldada por los autores del modelo original, publicada bajo licencia Apache 2.0. Está pensada para servir en motores de inferencia que soporten el esquema `nvfp4-pack-quantized` de compressed-tensors, principalmente vLLM con kernels FP4 weight-only.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (64 bloques transformer), modelo base Jais-3-32B; cuantización GPTQ NVFP4A16 |
| Parametros totales | 20.686.443.968 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | NVFP4A16 (W4A16): valores 4-bit E2M1, una escala FP8 E4M3 por grupo de 16, una escala FP32 por tensor; GPTQ con block_size 128, dampening_frac 0.01 y actorder static |
| Idiomas soportados | Árabe (ar), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, esquema compressed-tensors `nvfp4-pack-quantized`; requiere `trust_remote_code` |
| Tamano del repositorio | 23,3 GB (frente a 69,56 GB en BF16) |
| Modelo base | inception42/Jais-3-32B |
| Herramientas de cuantizacion | llm-compressor 0.15.0, compressed-tensors 0.20.1, transformers 5.21.0, torch 2.14.1 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 64 bloques con capas `Linear` cuantizadas en todos ellos. La cuantización se aplicó exclusivamente a los pesos de esas capas lineales; los embeddings de tokens, la cabeza de salida, todas las normalizaciones y todas las activaciones se mantienen en BF16. El esquema NVFP4A16 combina valores de 4 bits en formato E2M1 con una escala FP8 E4M3 por cada grupo de 16 elementos y una escala FP32 por tensor, lo que permite un rango dinámico razonable pese a la baja precisión de los pesos.

El proceso de cuantización empleó GPTQ con `block_size` 128, `dampening_frac` 0.01 y `actorder` estático, calibrado con 2.048 muestras en formato chat de hasta 2.048 tokens cada una: 1.024 pares instrucción-respuesta en árabe extraídos de las primeras filas de `arbml/CIDAR` y 1.024 muestras de `mlabonne/open-perfectblend`. La plantilla de chat del modelo base exige un campo de pensamiento (`reasoning_content`) en los turnos del asistente; para calibración y evaluación se pasó un campo vacío. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto conversacional en árabe e inglés, con plantilla de chat propia que incluye un campo de razonamiento (`reasoning_content`) en los turnos del asistente.
- Razonamiento matemático: resultados medidos de 92,95 en GSM8K (exact match), prácticamente idénticos al BF16.
- Conocimiento general y académico: 80,59 en MMLU y 76,71 en ArabicMMLU sobre el checkpoint cuantizado.
- Capacidad bilingüe real, con evaluación específica en árabe mediante ArabicMMLU (14.455 preguntas) y calibración con datos árabes de CIDAR.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada, más allá del campo de pensamiento de la plantilla.
- Capacidades de visión o audio: no disponible (modelo de texto).
- Modo thinking: la plantilla de chat del modelo base contempla un campo `reasoning_content` en las respuestas del asistente.

## Casos de uso

- Asistencia conversacional en árabe: el modelo puede gestionar diálogos multi-turno en árabe con calidad cercana al BF16 (caída de 0,65 puntos en ArabicMMLU), lo que lo hace adecuado para atención al usuario en mercados arabófonos donde el despliegue en BF16 resulta caro.
- Serving de alto rendimiento en vLLM: con el kernel `MarlinNvFp4LinearKernel` en GPU Blackwell se obtiene 2,85x de throughput en un solo stream y 2,4x con 32 peticiones concurrentes, lo que permite atender más tráfico con el mismo hardware.
- Evaluación de pipelines de cuantización: sirve como referencia publicada para validar recetas GPTQ NVFP4A16 sobre modelos de 20B parámetros, con métricas de KL divergence y tests pareados McNemar ya documentados.
- Razonamiento matemático en producción: con 92,95 en GSM8K y sin degradación estadísticamente significativa frente a BF16, es apto para resolver problemas aritméticos de varios pasos en aplicaciones educativas o de cálculo asistido.
- Despliegue con restricciones de VRAM: al ocupar 23,3 GB de pesos, permite servir un modelo de ~20B parámetros en GPUs donde el BF16 de 69,56 GB no cabría, reduciendo el coste por instancia.
- Investigación bilingüe árabe-inglés: útil para estudiar el impacto de la cuantización en idiomas de bajos recursos, ya que el autor publica métricas separadas por idioma y por régimen de calibración.
- Generación de texto general en inglés: con 80,59 en MMLU y 7,78 de perplejidad en WikiText-2, cubre tareas de resumen, redacción y respuesta a preguntas en inglés con un coste de memoria reducido.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness 0.4.13 (configuraciones por defecto, sin plantilla de chat, GSM8K con flexible-extract), comparando BF16 frente al checkpoint cuantizado:

| Benchmark | BF16 | Este checkpoint | Cambio | Test pareado |
|---|---:|---:|---:|---|
| ArabicMMLU, accuracy (14.455 preguntas) | 77,36 | 76,71 | -0,65 | 344 perdidas, 249 ganadas, p = 1e-4 |
| GSM8K, exact match (1.319 problemas) | 93,03 | 92,95 | -0,08 | 27 perdidas, 26 ganadas, p = 1,00 |
| MMLU, accuracy (14.042 preguntas) | 81,08 | 80,59 | -0,49 | 274 perdidas, 206 ganadas, p = 2e-3 |
| WikiText-2, perplejidad (131.072 tokens) | 7,63 | 7,78 | +0,15 | no disponible |

Divergencia KL frente a BF16 (distribución completa del siguiente token, teacher-forced, ventanas de 1.024 tokens):

| Texto | Tokens | KL media | KL percentil 99 | Mismo token top que BF16 |
|---|---:|---:|---:|---:|
| WikiText-2 test (inglés) | 131.072 | 0,026 | 0,25 | 92,8% |
| Chat (`HuggingFaceH4/ultrachat_200k`, test_sft, inglés) | 238.748 | 0,048 | 0,81 | 94,0% |
| Árabe (`arbml/CIDAR`, 256 pares desde la fila 9.000) | 64.040 | 0,037 | 0,55 | 93,4% |
| WikiText-2 sin token de inicio de texto | 130.944 | 0,048 | 0,45 | 90,9% |

Rendimiento en vLLM 0.34.0 sobre una GPU Blackwell (compute capability 12.0), generaciones greedy de 256 tokens fijos:

| Métrica | BF16 | Este checkpoint |
|---|---:|---:|
| GSM8K vía completions API (flexible-extract) | 93,10 | 93,18 |
| Throughput, un solo stream | 1,00x | 2,85x |
| Throughput, 8 concurrentes | 1,00x | 2,70x |
| Throughput, 32 concurrentes | 1,00x | 2,40x |

Comparación dentro de la familia Jais-3 con la misma receta (cambio en puntos frente a su propio BF16):

| Modelo | MMLU | ArabicMMLU | GSM8K | Publicado |
|---|---:|---:|---:|---|
| Jais-3-0.9B | -13,4 | -11,0 | -24,6 | no |
| Jais-3-3.7B | -4,0 | +0,3 | -0,2 | sí |
| Jais-3-7B | -0,8 | -0,1 | -1,5 | sí |
| Jais-3-32B | -0,5 | -0,7 | -0,1 | este repositorio |

## Requisitos de hardware

- Pesos del checkpoint: 23,3 GB en disco y en memoria de GPU al servir con vLLM usando kernels FP4 nativos.
- En Transformers los pesos se expanden de vuelta a 16 bits al cargar, por lo que la ventaja es solo de disco y descarga: se necesita tanta memoria de GPU como el modelo BF16 (del orden de 69,56 GB de pesos más overhead de activaciones y KV cache).
- GPU con soporte de FP4: el autor midió sobre una GPU Blackwell (compute capability 12.0) con el kernel `MarlinNvFp4LinearKernel` de vLLM. No se han publicado mediciones en otras arquitecturas.
- GPU recomendadas: Blackwell para aprovechar el kernel FP4; en GPUs sin soporte nativo de FP4 el rendimiento puede degradarse a la ruta de de-cuantización. No hay datos publicados para A100, H100 o RTX 4090.
- Despliegue: vLLM (`vllm serve PureTensorAI/Jais-3-32B-NVFP4A16 --trust-remote-code`) es la vía recomendada; Transformers requiere `pip install compressed-tensors` y `trust_remote_code=True`.
- Opciones como llama.cpp, Ollama o TGI no están documentadas para este esquema de cuantización en la información disponible.
- Throughput medido: 2,85x en un stream, 2,70x con 8 concurrentes y 2,40x con 32 concurrentes frente a BF16, sobre generaciones greedy de 256 tokens y hardware específico.
- Latencia absoluta: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Jais-3-32B-NVFP4A16 (este) | 20,69B | no disponible | Apache 2.0 | safetensors NVFP4A16 | Cuantizado W4A16, 23,3 GB, bilingüe árabe-inglés |
| inception42/Jais-3-32B (BF16) | no disponible | no disponible | Apache 2.0 | safetensors BF16 | Modelo base; 69,56 GB; referencia de calidad |
| PureTensorAI/Jais-3-7B-NVFP4A16 | no disponible | no disponible | Apache 2.0 | safetensors NVFP4A16 | Misma receta, menor tamaño; caídas de -0,8 MMLU, -0,1 ArabicMMLU, -1,5 GSM8K |
| PureTensorAI/Jais-3-3.7B-NVFP4A16 | no disponible | no disponible | Apache 2.0 | safetensors NVFP4A16 | Misma receta; caída de -4,0 en MMLU |

No se dispone de datos de benchmarks de terceros ni de comparaciones con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Release de prueba: el autor indica explícitamente que es una "test release" no afiliada ni respaldada por los autores del modelo original.
- Degradación medible aunque pequeña: -0,49 puntos en MMLU y -0,65 en ArabicMMLU, con significación estadística (p = 2e-3 y p = 1e-4 respectivamente). GSM8K es indistinguible.
- Variabilidad de la receta: el autor advierte que las puntuaciones de benchmark pueden moverse uno o dos puntos entre distintas calibraciones de la misma receta; los resultados publicados corresponden a una sola calibración.
- Sesgo de calibración: las filas de KL de chat y árabe comparten familia de dataset con los datos de calibración (aunque con filas distintas), por lo que el autor las califica de "favorecedoras". Las filas de ArabicMMLU, MMLU y WikiText son independientes.
- En Transformers los pesos se expanden a 16 bits al cargar: no hay ahorro de VRAM, solo de disco y descarga, y se requiere tanta GPU como el modelo BF16.
- Rendimiento dependiente de hardware: las ventajas de throughput se midieron en una GPU Blackwell con kernel FP4 de vLLM; no hay datos para otras GPU.
- Cobertura lingüística limitada a árabe e inglés; no se documentan otros idiomas.
- Riesgo de alucinación: no cuantificado en la información proporcionada.
- Sesgos conocidos: no documentados en la información proporcionada.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con ventanas largas sin verificación previa.
- Requiere `trust_remote_code=True` y código personalizado (`custom_code`), lo que implica revisar el código remoto antes de ejecutarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/PureTensorAI/Jais-3-32B-NVFP4A16
- Modelo base: https://huggingface.co/inception42/Jais-3-32B
- Cuantización hermana Jais-3-7B: https://huggingface.co/PureTensorAI/Jais-3-7B-NVFP4A16
- Cuantización hermana Jais-3-3.7B: https://huggingface.co/PureTensorAI/Jais-3-3.7B-NVFP4A16
- Dataset de calibración árabe: https://huggingface.co/datasets/arbml/CIDAR
- Dataset de calibración inglés: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Dataset de evaluación de chat: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
