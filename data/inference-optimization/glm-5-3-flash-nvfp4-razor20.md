# inference-optimization/GLM-5.3-Flash-NVFP4-RAZOR20

## Resumen

GLM-5.3-Flash-NVFP4-RAZOR20 es una versión cuantizada a NVFP4 del modelo multimodal zai-org/GLM-5.3-Flash, desarrollado originalmente por Z-AI (Zhipu AI) y optimizado por RedHatAI mediante LLM Compressor. Se distribuye en el repositorio de Hugging Face bajo la organización inference-optimization. El modelo resuelve el problema del coste de memoria y almacenamiento en el despliegue de un modelo multimodal de gran tamaño: reduce a 4 bits los pesos y activaciones de las capas lineales de los expertos MoE, disminuyendo aproximadamente un 50% el espacio ocupado por los pesos cuantizados respecto a FP8.

La arquitectura es Glm5NextForConditionalGeneration, un transformer de mezcla de expertos (MoE) con capacidades de entrada de texto e imagen y salida de texto. El checkpoint contiene 138.458.173.914 parámetros totales (unos 138,5 mil millones) y el repositorio pesa 163,4 GB. Soporta inglés y chino, y se publica bajo licencia MIT, lo que facilita su uso comercial y su integración en pipelines de producción.

Su relevancia actual radica en que permite servir un modelo multimodal de razonamiento avanzado con requisitos de VRAM sensiblemente menores, gracias al formato NVFP4 (FP4 de NVIDIA) y a la compatibilidad con vLLM, incluyendo decodificación especulativa mediante MTP (multi-token prediction). Los resultados publicados en GSM8K Platinum, MATH-500, AIME 2025 y GPQA Diamond sitúan el modelo en un nivel de razonamiento matemático y científico muy alto pese a la cuantización agresiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Glm5NextForConditionalGeneration (transformer MoE multimodal) |
| Parámetros totales | 138.458.173.914 (≈138,5 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (FP4 en pesos y activaciones de las capas lineales de expertos MoE); capas MTP en FP8; etiquetado como 8-bit en los tags |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors, formato compressed-tensors |
| Pipeline | image-text-to-text |
| Modelo base | zai-org/GLM-5.3-Flash |
| Tamaño del repositorio | 163,4 GB |
| Fecha de publicación | 2026-08-27 (según model card); repositorio creado el 2026-11-10 |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos (MoE) con arquitectura Glm5Next, diseñado para recibir texto e imágenes y generar texto. La cuantización se aplica exclusivamente a los operadores lineales de los expertos MoE, que pasan de FP8 a NVFP4, mientras que las capas MTP (multi-token prediction) se mantienen en FP8 para preservar la calidad de la decodificación especulativa. El proceso se realizó con LLM Compressor y se exportó en formato compressed-tensors, listo para inferencia con vLLM.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. La innovación técnica destacable es la cuantización NVFP4 de pesos y activaciones en las capas de expertos, que reduce a la mitad los bits por parámetro en las capas cuantizadas y habilita decodificación especulativa con MTP (5 tokens especulativos) para mejorar el throughput. El modelo base es de tipo multimodal, por lo que combina un codificador visual con el cuerpo MoE de lenguaje.

## Capacidades

- Generación de texto y razonamiento avanzado, con resultados altos en matemáticas y ciencia (GSM8K Platinum, MATH-500, AIME 2025, GPQA Diamond).
- Comprensión de imágenes y texto (pipeline image-text-to-text): entrada multimodal con salida de texto.
- Soporte de tool calling / function calling, con parser dedicado (`glm47`) y elección automática de herramienta en vLLM.
- Soporte de razonamiento multi-paso y modo de razonamiento, con parser de razonamiento (`glm45`) para separar el pensamiento de la respuesta final.
- Capacidades multilingües limitadas a inglés y chino.
- Decodificación especulativa mediante MTP para acelerar la inferencia.
- Compatible con endpoints OpenAI a través de vLLM.

## Casos de uso

- Razonamiento matemático y científico asistido: el modelo obtiene un 97,74% en GSM8K Platinum y un 90,57% en GPQA Diamond, por lo que es adecuado para tutores automáticos, verificación de soluciones y generación de explicaciones paso a paso en dominios STEM.
- Agentes con tool calling: gracias al parser `glm47` y a `--enable-auto-tool-choice`, puede integrarse en agentes que consulten APIs, bases de datos o servicios externos en flujos multi-paso.
- Análisis de documentos con imágenes: al aceptar entrada image-text-to-text, puede extraer información de capturas, diagramas o documentos escaneados y responder en texto.
- Asistencia a desarrolladores en inglés y chino: útil para equipos bilingües que necesitan generación y revisión de código o documentación técnica en ambos idiomas.
- Servicio de chat de alto rendimiento: con cuantización NVFP4 y decodificación especulativa MTP, permite desplegar un modelo de 138,5 mil millones de parámetros en 4 GPUs con tensor-parallel-size 4, reduciendo costes de infraestructura.
- Investigación en cuantización: sirve como referencia para evaluar la degradación de calidad al pasar de FP8 a NVFP4 en modelos MoE multimodales, con métricas publicadas en cuatro benchmarks.
- Despliegue en producción con API compatible con OpenAI: el contenedor oficial de vLLM (`vllm/vllm-openai:glm53-flash`) permite exponer el modelo como endpoint sin cambios en clientes existentes.

## Benchmarks y rendimiento

Resultados publicados en la model card para RedHatAI/GLM-5.3-Flash-NVFP4, promediados sobre 3 semillas (8 en AIME 2025), servidos con vLLM:

| Categoría | Benchmark | Resultado |
|---|---|---|
| Razonamiento | GSM8K Platinum (strict-match) | 97,74% |
| Razonamiento | MATH-500 (pass@1) | 94,87% |
| Razonamiento | AIME 2025 (pass@1) | 86,67% |
| Razonamiento | GPQA Diamond (pass@1) | 90,57% |

No se han publicado en la información disponible resultados comparativos frente al modelo base sin cuantizar ni frente a otras alternativas.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 163,4 GB; con la cuantización NVFP4 de los pesos de expertos, la huella en memoria es aproximadamente la mitad de la de los pesos cuantizados originales en FP8. El despliegue de referencia usa tensor-parallel-size 4, lo que sugiere al menos 4 GPUs de alta capacidad (por ejemplo, H100 o H200 con 80 GB o más cada una) para cubrir pesos y caché KV.
- GPU recomendadas: el ejemplo oficial emplea 4 GPUs en paralelo tensorial; se recomiendan H100/H200 o A100 de 80 GB. No se indica compatibilidad con GPUs consumer.
- GPU consumer: no disponible; el tamaño del modelo (138,5 mil millones de parámetros) hace inviable su ejecución en una sola GPU consumer.
- Opciones de despliegue: vLLM con la imagen `vllm/vllm-openai:glm53-flash`; formato compressed-tensors; soporte de decodificación especulativa MTP con `num_speculative_tokens: 5`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card recomienda `--gpu-memory-utilization 0.85` y `--disable-custom-all-reduce` al activar decodificación especulativa, y `VLLM_ENGINE_READY_TIMEOUT_S=3600` para tolerar tiempos de arranque largos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-NVFP4-RAZOR20 | 138,5 mil millones | no disponible | NVFP4 (expertos MoE), FP8 (MTP) | MIT | Hugging Face, vLLM |
| zai-org/GLM-5.3-Flash (base) | no disponible | no disponible | sin cuantizar (referencia) | no disponible | Hugging Face |
| RedHatAI/GLM-5.3-Flash-NVFP4 | no disponible | no disponible | NVFP4 | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al ser un modelo entrenado principalmente en inglés y chino, puede presentar sesgos culturales y lingüísticos en otros idiomas.
- Riesgo de alucinación: no se cuantifica; como modelo generativo de gran tamaño, es susceptible de producir contenido plausible pero incorrecto, especialmente fuera de los dominios evaluados.
- Limitaciones de contexto e idioma: solo se declaran inglés y chino; no se especifica la longitud máxima de contexto, lo que impide planificar cargas de contexto largo con precisión.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución; conviene verificar las condiciones del modelo base zai-org/GLM-5.3-Flash.
- Caveats de producción: la cuantización NVFP4 puede degradar ligeramente la calidad frente al modelo base; los benchmarks publicados no incluyen comparación directa con la versión sin cuantizar. El despliegue requiere hardware con soporte NVFP4 y la imagen de vLLM específica (`glm53-flash`), además de tiempos de arranque largos (timeout de 3600 s). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que su validación comunitaria es aún escasa.

## Enlaces

- Hugging Face: https://huggingface.co/inference-optimization/GLM-5.3-Flash-NVFP4-RAZOR20
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Model card de referencia (RedHatAI): https://huggingface.co/RedHatAI/GLM-5.3-Flash-NVFP4/blob/main/README.md
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- lm-evaluation-harness (Neural Magic): https://github.com/neuralmagic/lm-evaluation-harness
- lighteval (Neural Magic): https://github.com/neuralmagic/lighteval
- Licencia MIT: https://choosealicense.com/licenses/mit/
