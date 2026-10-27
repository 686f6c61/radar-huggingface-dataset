# axteam/Qwen3.8-27B-AWQ-4bit

## Resumen

`axteam/Qwen3.8-27B-AWQ-4bit` es una cuantización de 4 bits del modelo multimodal denso `Qwen/Qwen3.8-27B`, publicado por el equipo Qwen de Alibaba. No es un modelo entrenado desde cero: es un derivado de solo inferencia (PTQ, sin reentrenamiento) pensado para servir el modelo original con menos memoria y en formato compatible con vLLM. La cuantización la firma el usuario `axteam` y conserva la licencia Apache-2.0 del original.

El modelo base es un transformer híbrido que combina atención lineal con atención completa, de arquitectura densa, con torre de visión y una cabeza MTP (*multi-token prediction*). Cuenta con 27.781.427.952 parámetros reales (27,78 B) según los safetensors del repositorio, y la model card lo describe como un modelo multimodal nativo orientado a código, flujos agénticos y automatización de oficina.

La relevancia de esta ficha es práctica: el repositorio ocupa 21,0 GB y los pesos cuantizados unos 19,5 GB en disco, lo que permite desplegar un modelo de 27 B en una sola GPU de 24-48 GB con vLLM. La contrapartida medida por el autor es un aumento de perplejidad del 2,3 % y una caída de acuerdo top-1 del 99,4 % al 94,6 % respecto al BF16 original, en un conjunto interno de 100 prompts en inglés y coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal + atención completa), denso, multimodal (visión) con cabeza MTP |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT4 W4A16: pesos INT4 asimétricos, grupo de tamaño 32 (escala BF16 + cero INT4), activaciones BF16, formato `compressed-tensors` `pack-quantized` |
| Idiomas soportados | no disponible (la calibración usó un corpus mixto con predominio de coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con `compressed-tensors` (`pack-quantized`) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27,78 B parámetros con una arquitectura híbrida que intercala capas de atención lineal con capas de atención completa, e incorpora una torre de visión con su proyector para entrada de imagen y una cabeza MTP. Esta cuantización no altera esa topología: el `config.json` es el original más un bloque `quantization_config`, y el tokenizador, la `chat_template` y el `generation_config` son idénticos a los del modelo de referencia. Se mantienen en BF16 las partes sensibles a la precisión: la torre de visión y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm, los embeddings de tokens, la LM head y las partes no lineales del bloque SSM (`linear_attn.conv1d`, `A_log`, `dt_bias`). El resto de matrices lineales se cuantizan a INT4.

El proceso es AWQ de posentrenamiento, sin gradientes ni reentrenamiento: se calculan factores de escala que protegen los canales de pesos más relevantes antes del redondeo, usando un conjunto de calibración de 256 muestras de un corpus mixto con predominio de coreano. No se dispone de información sobre el número de tokens, la composición del dataset ni las fases de RLHF/DPO del modelo base en la información proporcionada, más allá de las referencias públicas a su naturaleza multimodal nativa y a su enfoque en código y flujos agénticos.

## Capacidades

- Generación de texto conversacional multiturno, con pipeline declarado `image-text-to-text`.
- Comprensión de imágenes de forma nativa (torre de visión y proyector conservados en BF16), incluyendo evaluación de razonamiento visual tipo MathVision en el modelo base según la información de Hugging Face.
- Comprensión de vídeo: la documentación pública del modelo base lo describe como *vision-language* con entendimiento nativo de imagen y vídeo.
- Generación de código y tareas de automatización de oficina, según la descripción del repositorio oficial de Qwen.
- Flujos agénticos y *tool calling*: la documentación pública destaca mejoras agénticas sobre el modelo de la generación anterior (Qwen 3.6-27B).
- Razonamiento multi-paso favorecido por la cabeza MTP del modelo base (decodificación con predicción multi-token), aunque no se detallan métricas.
- Capacidades multilingües: no disponibles en la información proporcionada; la única evidencia indirecta es el corpus de calibración mixto inglés/coreano.
- Muestreo recomendado por el autor: `temperature=0.7`, `top_p=0.8`, `top_k=20`.

## Casos de uso

- **Servicio de inferencia con vLLM en una sola GPU**: `vllm serve axteam/Qwen3.8-27B-AWQ-4bit` levanta un endpoint compatible con la API de OpenAI; al ocupar los pesos unos 19,5 GB, encaja en GPUs de 24 GB con contexto corto y con holgura en 48 GB, lo que abarata el coste por token frente al BF16.
- **Asistente de atención al cliente multimodal**: admite entradas de imagen junto al texto (capturas de facturas, fotos de producto, errores de pantalla) gracias al pipeline `image-text-to-text` con la torre de visión sin cuantizar.
- **Automatización de oficina y extracción documental**: la descripción del modelo base lo orienta a tareas de ofimática; con esta cuantización se puede procesar lotes de documentos en un nodo único sin clúster multi-GPU.
- **Agentes de código en CI/CD**: el modelo base está descrito como fuerte en código y flujos agénticos, de modo que puede integrarse como paso de revisión, generación de parches o resolución de incidencias con *tool calling*.
- **Asistente de razonamiento sobre diagramas y gráficos**: preguntas sobre figuras técnicas, gráficas de métricas o capturas de paneles, aprovechando la comprensión visual nativa.
- **Despliegue en entorno local o *on-premise* con requisitos de privacidad**: la licencia Apache-2.0 permite uso comercial y el tamaño cuantizado hace viable ejecutarlo en hardware propio sin enviar datos a terceros.
- **Evaluación comparativa de cuantizaciones**: sirve como variante INT4 de referencia para medir la degradación frente al BF16 en tareas propias usando la misma batería de prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, MathVision, etc.) en la información disponible para esta cuantización. El autor solo publica métricas de fidelidad respecto al BF16 original sobre un conjunto interno mixto inglés/coreano de 100 prompts, con las respuestas BF16 en modo *greedy* como referencia y el mismo arnés para todas las filas:

| Métrica | Esta cuantización | Original BF16 | Diferencia |
|---|---|---|---|
| Perplejidad (menor es mejor) | 1,3896 | 1,3586 | +2,3 % |
| Acuerdo top-1 en el siguiente token | 94,6 % | 99,4 % | −4,8 puntos |

Estas cifras miden fidelidad al modelo base, no calidad absoluta en tareas. Para el modelo original, la información pública menciona evaluación en MathVision con un prompt fijo (`Please reason step by step, and put your final answer within \boxed{}`), pero sin valores numéricos disponibles en esta ficha.

## Requisitos de hardware

- **Pesos en memoria**: unos 19,5 GB en disco según el autor (repositorio de 21,0 GB), en INT4 con activaciones BF16. La VRAM necesaria es superior a esa cifra por la caché KV, las activaciones y los tensores que se conservan en BF16 (visión, MTP, embeddings y LM head).
- **Estimación de VRAM**: aproximadamente 22-26 GB para contexto corto y 32-48 GB para contextos largos o *batches* concurrentes; son estimaciones derivadas del tamaño de los pesos, no cifras publicadas por el autor.
- **GPU recomendadas**: A100 40 GB u 80 GB, H100, L40S 48 GB para producción con concurrencia; A100 40 GB como mínimo cómodo.
- **GPU de consumo**: sí es viable en RTX 4090 / RTX 3090 de 24 GB, pero muy justo: obliga a contexto reducido, poca concurrencia y posible descarga parcial; en GPUs de 16 GB no cabe.
- ***Kernels***: el formato `compressed-tensors` `pack-quantized` es el que mejor se optimiza con la ruta Marlin en Ampere (SM 8.6), según la documentación de otra cuantización AWQ del mismo modelo base.
- **Opciones de despliegue**: vLLM es la vía recomendada y documentada por el autor (`vllm serve`). Otros motores (llama.cpp, Ollama, TGI) no están documentados para este repositorio y requerirían reconvertir los pesos a GGUF, algo no disponible en la información proporcionada.
- **Latencia y throughput**: no disponibles. Dependen del hardware, la longitud de contexto y el número de secuencias concurrentes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `axteam/Qwen3.8-27B-AWQ-4bit` (esta ficha) | 27,78 B (denso) | no disponible | AWQ INT4 W4A16, `compressed-tensors` | Apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| `Qwen/Qwen3.8-27B` (original) | 27,78 B (denso, multimodal) | no disponible | BF16 safetensors | Apache-2.0 | Hugging Face, repositorio oficial |
| `barrydeen/Qwen3.8-27B-AWQ-4bit` | 27,78 B (denso) | no disponible | AWQ W4A16 con `llm-compressor`, `compressed-tensors` `pack-quantized` | Apache-2.0 (derivada) | Hugging Face |
| `Qwen3.8-Max` (referencia de la misma familia) | 2,4 T (según prensa) | no disponible | no disponible | no disponible | no disponible en abierto |

La alternativa directa a esta ficha es la cuantización de `barrydeen`, generada con `llm-compressor` y el mismo formato `pack-quantized`. Los datos de contexto, rendimiento en tareas y número de descargas del resto de la familia no están disponibles en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de calidad.

## Limitaciones y advertencias

- **Pérdida de fidelidad medible**: +2,3 % de perplejidad y 94,6 % de acuerdo top-1 frente al BF16, es decir, aproximadamente 5,4 puntos porcentuales de divergencia en la predicción del siguiente token. En tareas de razonamiento largo o código con restricciones sintácticas, esa divergencia puede amplificarse.
- **Calibración sesgada al coreano**: el conjunto de calibración son 256 muestras de un corpus mixto con predominio de coreano, por lo que la preservación de calidad en castellano y en otros idiomas no está medida. Los idiomas soportados no están declarados.
- **Sin datos de contexto**: se desconoce la longitud de contexto efectiva de esta build; planificar el despliegue asumiendo un valor concreto es arriesgado.
- **Repositorio sin tracción**: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de las métricas del autor.
- **Riesgo de alucinación**: no se han publicado evaluaciones de veracidad, y el proceso de cuantización tiende a degradar más las colas de probabilidad, lo que puede aumentar la generación de contenido plausible pero incorrecto.
- **Dependencia del motor**: está empaquetado para vLLM; fuera de esa ruta no hay garantías de rendimiento ni de compatibilidad, y no se ofrece GGUF.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero los derechos sobre pesos, tokenizador y *chat template* originales son del equipo Qwen; conviene conservar los avisos de atribución del repositorio base.
- **Sin garantías del autor**: no se documentan sesgos conocidos, evaluación de seguridad ni comportamiento en dominios sensibles; es responsabilidad del desplegador realizar su propia evaluación antes de producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/axteam/Qwen3.8-27B-AWQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Repositorio oficial en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Cuantización AWQ alternativa del mismo modelo base: https://huggingface.co/barrydeen/Qwen3.8-27B-AWQ-4bit
- README de esa cuantización alternativa: https://huggingface.co/barrydeen/Qwen3.8-27B-AWQ-4bit/blob/main/README.md
- Artículo de análisis: https://aiindigo.com/blog/qwen38-27b-local-ai
- Guía del modelo: https://www.aimadetools.com/blog/qwen-3-8-27b-complete-guide/
