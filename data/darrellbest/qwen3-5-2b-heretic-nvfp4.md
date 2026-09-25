# darrellbest/Qwen3.5-2B-Heretic-NVFP4

## Resumen

Qwen3.5-2B-Heretic-NVFP4 es una cuantización en NVFP4 del modelo darrellbest/Qwen3.5-2B-Heretic, publicado por el usuario darrellbest. Se trata de un derivado de Qwen/Qwen3.5-2B, un modelo multimodal de tipo image-text-to-text de aproximadamente 2.274 millones de parámetros, al que se le ha eliminado el comportamiento de rechazo mediante la herramienta Heretic, que aplica Arbitrary-Rank Ablation (ARA) sobre los pesos completos. El resultado declarado por el autor es de 6 rechazos sobre 100 frente a los 97 sobre 100 del modelo original, con una divergencia KL de 0,0302.

La aportación específica de este repositorio es la cuantización a 4 bits en formato NVFP4 mediante compressed-tensors y llm-compressor 0.13.0, que reduce el peso de 4,58 GB (bf16) a 3,15 GB. La cuantización se aplica únicamente a las capas lineales del MLP y a las proyecciones de atención de las capas de atención completa, con grupos de 16 valores y escalas en FP8; el codificador de visión, las capas Gated DeltaNet, el bloque de predicción multi-token, los embeddings y las normas permanecen en bf16.

El modelo está pensado para servirse con vLLM sobre hardware NVIDIA Blackwell, que ejecuta NVFP4 de forma nativa. El autor verificó su funcionamiento en vLLM 0.30.0 sobre una RTX PRO 6000 Blackwell, con un rendimiento de aproximadamente 205 tokens por segundo en flujo único y unos 5.800 tokens por segundo agregados con lote de 32. Su relevancia actual radica en que permite ejecutar un modelo multimodal de 2B con la guardas de seguridad reducidas en un espacio de almacenamiento muy contenido y con throughput elevado en la generación Blackwell.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención completa y capas Gated DeltaNet (`linear_attn`); incluye codificador de visión y bloque de predicción multi-token (MTP) |
| Parámetros totales | 2.274.069.824 (~2,27 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (grupos de 16 valores, escalas FP8) en capas lineales del MLP y proyecciones de atención de las capas de atención completa; resto en bf16, con parámetros `A_log`/norm de DeltaNet en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (NVFP4) + `model-auxiliary.safetensors` para los pesos de predicción multi-token |
| Modalidades | Texto e imagen (pipeline image-text-to-text) |
| Modelo base | darrellbest/Qwen3.5-2B-Heretic (relación: quantized) |
| Modelo original de la cadena | Qwen/Qwen3.5-2B |
| Tamaño del repositorio | 3,1 GB (el autor indica 3,15 GB; la versión bf16 ocupa 4,58 GB) |
| Fecha de publicación | 25 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Qwen3.5-2B, un transformer híbrido que combina capas de atención completa con capas Gated DeltaNet, un mecanismo de atención lineal con estado recurrente. El modelo incorpora además un codificador de visión y un bloque de predicción multi-token. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO u otras) del modelo original, ya que la model card de este repositorio no las detalla.

La innovación de esta ficha es doble. Por un lado, la modificación del comportamiento de rechazo mediante Heretic con Arbitrary-Rank Ablation, aplicada sobre los pesos completos y medida con 100 peticiones de prueba: 6 rechazos frente a 97 del modelo original, con una divergencia KL de 0,0302 respecto al modelo sin modificar. Por otro, la cuantización NVFP4 realizada con llm-compressor 0.13.0 (esquema `NVFP4`, calibrado sobre 64 prompts de chat inocuos), que excluye deliberadamente las partes sensibles a baja precisión: el estado recurrente de DeltaNet, la tabla de embeddings de 248.000 tokens (atada a `lm_head`), las normas y el codificador de visión. Los pesos de predicción multi-token, que el guardado cuantizado descarta, se copiaron sin modificar a `model-auxiliary.safetensors`. La model card no indica que se hayan vuelto a medir los rechazos sobre los pesos NVFP4.

## Capacidades

- Generación de texto conversacional multi-turno, con el modo de razonamiento (`thinking`) activo: el autor verificó que el modelo razona hasta 17 × 23 = 391 y cierra correctamente su bloque `<think>`.
- Comprensión de imágenes: el modelo describe correctamente una imagen de prueba con un círculo rojo y un cuadrado azul, lo que confirma que el codificador de visión permanece funcional tras la cuantización.
- Razonamiento aritmético básico y tareas de lógica simple dentro del bloque de pensamiento.
- Capacidad multimodal de entrada (imagen y texto) y salida de texto.
- Comportamiento de rechazo reducido de forma intencionada: 6 de cada 100 peticiones rechazadas en la medición del modelo bf16 de origen.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada (el bloque de predicción multi-token sí está presente en la arquitectura).
- Cobertura multilingüe: no disponible; el autor no declara idiomas soportados.

## Casos de uso

- Despliegue de un asistente conversacional multimodal en producción: con 3,15 GB de pesos, el modelo puede servirse en una única GPU Blackwell mediante `vllm serve` y atender peticiones de texto e imagen con un throughput agregado declarado de unos 5.800 tokens por segundo a lote 32.
- Procesamiento por lotes de descripciones de imágenes: el codificador de visión se mantiene en bf16, por lo que las tareas de image captioning no degradan por la cuantización y se benefician del mayor throughput de los pesos NVFP4.
- Generación de contenido sin restricciones temáticas para investigación sobre alineación y seguridad: el modelo está ablacionado explícitamente (6/100 rechazos) y sirve como referencia para estudiar el efecto de la eliminación de rechazos sobre el comportamiento del modelo.
- Evaluación comparativa de cuantizaciones: al existir variantes bf16, FP8, GGUF (BF16, Q8_0, Q4_K_M) y NVFP4 del mismo modelo base, permite medir el impacto de cada formato sobre calidad, latencia y consumo de VRAM con un único conjunto de prompts.
- Razonamiento asistido con modo de pensamiento en aplicaciones educativas o de cálculo: el modelo resuelve operaciones aritméticas paso a paso dentro de `<think>` y puede integrarse en interfaces que muestren el razonamiento intermedio.
- Servicio de inferencia de alto rendimiento en clústeres Blackwell: con aproximadamente 205 tokens por segundo en flujo único y 5.800 agregados, es adecuado para backends que necesiten densidad de peticiones alta con un modelo pequeño y multimodal.
- Prototipado rápido en local: el tamaño de pesos permite desplegar el modelo en una estación de trabajo equipada con GPU Blackwell sin necesidad de infraestructura multinodo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento y comportamiento aportados por el autor son los siguientes:

| Métrica | Valor | Contexto |
|---|---|---|
| Rechazos (modelo Heretic bf16 de origen) | 6/100 | Original sin ablacionar: 97/100 |
| Divergencia KL respecto al modelo sin ablacionar | 0,0302 | Medición sobre la variante bf16 |
| Rechazos sobre pesos NVFP4 | no medidos | El autor indica explícitamente que no se volvieron a medir |
| Throughput flujo único | ~205 tok/s | 512 tokens de generación, RTX PRO 6000 Blackwell, GPU compartida |
| Throughput agregado a lote 32 | ~5.800 tok/s | 512 tokens de generación, RTX PRO 6000 Blackwell, GPU compartida |
| Throughput de referencia bf16 | ~160 tok/s (flujo único) / ~4.400 tok/s (lote 32) | Mismas condiciones |
| Prueba de razonamiento | 17 × 23 = 391 con cierre de `<think>` | vLLM 0.30.0, RTX PRO 6000 Blackwell |
| Prueba de visión | Descripción correcta de círculo rojo y cuadrado azul | vLLM 0.30.0, RTX PRO 6000 Blackwell |

## Requisitos de hardware

- VRAM estimada para los pesos: 3,15 GB en NVFP4. A esto hay que sumar la caché KV, las activaciones y el codificador de visión en bf16; no se ha publicado una cifra de VRAM total, por lo que cualquier estimación por encima de los pesos debe considerarse orientativa.
- GPU verificada por el autor: NVIDIA RTX PRO 6000 Blackwell, con vLLM 0.30.0. NVFP4 requiere ejecución nativa sobre arquitectura Blackwell, por lo que el formato no es utilizable en generaciones anteriores sin conversión a otro esquema.
- GPU recomendadas: cualquier acelerador Blackwell con soporte NVFP4 en vLLM (RTX PRO 6000 Blackwell, y por arquitectura las series B200 y RTX 50); no hay verificación publicada en otras tarjetas.
- Cabe en GPU de consumo: el tamaño de pesos es reducido, pero la ejecución en NVFP4 está condicionada al soporte Blackwell del runtime. Para GPUs consumer sin NVFP4 nativo, el autor ofrece variantes alternativas: GGUF Q4_K_M (1,31 GB) + mmproj de visión (0,67 GB) para llama.cpp y Ollama, y FP8 (3,59 GB) para vLLM.
- Opciones de despliegue: vLLM (comando `vllm serve darrellbest/Qwen3.5-2B-Heretic-NVFP4`), verificado. Las variantes de la familia cubren transformers y SGLang (bf16) y llama.cpp / Ollama (GGUF).
- Latencia y throughput: ~205 tok/s en flujo único y ~5.800 tok/s agregados a lote 32 con generaciones de 512 tokens, medidos en una GPU compartida; el autor advierte de que esas cifras corresponden a una GPU compartida, por lo que pueden variar.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño | Runtime | Licencia | Notas |
|---|---|---|---|---|---|
| darrellbest/Qwen3.5-2B-Heretic-NVFP4 (este) | NVFP4, compressed-tensors | 3,15 GB | vLLM sobre Blackwell | Apache 2.0 | Cuantización parcial; rechazos no remedidos |
| darrellbest/Qwen3.5-2B-Heretic | bf16 safetensors | 4,58 GB | transformers, vLLM, SGLang | Apache 2.0 | Referencia de calidad; 6/100 rechazos, KL 0,0302 |
| darrellbest/Qwen3.5-2B-Heretic-FP8 | FP8 W8A8, compressed-tensors | 3,59 GB | vLLM | Apache 2.0 | Alternativa de 8 bits para hardware no Blackwell |
| darrellbest/Qwen3.5-2B-Heretic-GGUF | GGUF BF16 / Q8_0 / Q4_K_M + mmproj de visión | 3,90 / 2,08 / 1,31 GB + 0,67 GB | llama.cpp, Ollama | Apache 2.0 | Única variante que cubre inferencia en CPU y GPUs sin NVFP4 |
| Qwen/Qwen3.5-2B | no disponible | no disponible | no disponible | Apache 2.0 (según enlace de licencia de la model card) | Modelo original con guardas de seguridad intactas |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de otros fabricantes de tamaño similar.

## Limitaciones y advertencias

- Guardas de seguridad reducidas por diseño: la model card advierte explícitamente de que el modelo está ablacionado con Heretic y que la responsabilidad del uso recae en quien lo despliega. No es adecuado para aplicaciones orientadas al público general sin capas adicionales de moderación.
- Los rechazos no se volvieron a medir sobre los pesos NVFP4; la cifra de 6/100 corresponde a la variante bf16 de origen, por lo que el comportamiento del modelo cuantizado en materia de seguridad no está verificado.
- Riesgo de alucinación inherente a un modelo de 2B parámetros, agravado por la pérdida de precisión de la cuantización a 4 bits. El autor señala que la redacción se desvía ligeramente respecto al modelo bf16, como es esperable a 4 bits.
- La cuantización no cubre la totalidad del modelo: codificador de visión, capas Gated DeltaNet, embeddings, normas y bloque de predicción multi-token permanecen en bf16 o float32, de modo que el ahorro de memoria se concentra en MLP y proyecciones de atención.
- El estado recurrente de DeltaNet es sensible a baja precisión, según la propia model card; esta es la razón por la que se excluyó de la cuantización.
- Restricción de hardware: NVFP4 requiere arquitectura Blackwell y un runtime con soporte (vLLM 0.30.0 verificado). En hardware anterior hay que recurrir a las variantes FP8 o GGUF.
- No se declaran idiomas soportados, por lo que no puede garantizarse un rendimiento uniforme fuera del inglés sin evaluación previa.
- No se declara la longitud de contexto soportada en este repositorio.
- Sin validación de la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- Licencia Apache 2.0: permite uso comercial, pero obliga a conservar avisos de copyright y licencia y no concede derechos de marca. El enlace de licencia apunta al repositorio Qwen/Qwen3.5-2B.
- La fecha de publicación indicada (25 de septiembre de 2026) y las cifras de throughput proceden de una GPU compartida, por lo que la reproducibilidad exacta de las mediciones no está garantizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darrellbest/Qwen3.5-2B-Heretic-NVFP4
- Modelo base (bf16): https://huggingface.co/darrellbest/Qwen3.5-2B-Heretic
- Variante GGUF: https://huggingface.co/darrellbest/Qwen3.5-2B-Heretic-GGUF
- Variante FP8: https://huggingface.co/darrellbest/Qwen3.5-2B-Heretic-FP8
- Modelo original de la cadena: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
- llm-compressor (cuantización): https://github.com/vllm-project/llm-compressor
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; no se han encontrado papers, blogs, repositorios ni demos adicionales.
