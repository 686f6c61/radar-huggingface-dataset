# mradermacher/Decka-4B-GGUF

## Resumen

Decka-4B-GGUF es una recopilación de cuantizaciones estáticas en formato GGUF del modelo mrzenin/Qwen3.8-4B-Uncensored, publicada por el usuario mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversión a GGUF (y sus distintas variantes de cuantización) pensada para su uso con llama.cpp y derivados como Ollama o LM Studio. El modelo subyacente se presenta en la model card como una destilación sobre una base de la familia Qwen (etiquetas qwen3.5 y qwen3.8) con ajuste fino supervisado (SFT) orientado a razonamiento y function calling, y con un proceso de "abliteration" o "decensoring" que elimina parte de los mecanismos de rechazo del modelo original.

El modelo cuenta con 4.205.751.296 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de 4B. La licencia declarada es Apache 2.0, y los idiomas indicados son inglés y chino. La relevancia de esta ficha radica en que permite ejecutar un modelo de 4B con capacidades de razonamiento y tool calling en hardware de consumo, gracias a cuantizaciones que van desde 2,0 GB (Q2_K) hasta 8,5 GB (f16), aunque con las salvedades importantes que se detallan en la sección de limitaciones.

Cabe señalar que la información disponible es escasa: la model card del repositorio GGUF es fundamentalmente una tabla de cuantizaciones y no incluye detalles sobre datos de entrenamiento, benchmarks ni longitud de contexto. Los datos que faltan se indican explícitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de la familia Qwen; detalles no disponibles) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-f16 y mmproj-Q8_0 (suplemento multimodal) y variantes i1 (imatrix) en repositorio aparte |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura del modelo base no se detalla en la información proporcionada; las etiquetas de la model card apuntan a una base de la familia Qwen (qwen3.5, qwen3.8) con un proceso de destilación (distillation) y ajuste fino supervisado (SFT) orientado a razonamiento (reasoning) y function calling. También aparece la etiqueta "reproducible", que sugiere que el autor documenta el proceso de entrenamiento, aunque los detalles no están disponibles en esta ficha.

El rasgo técnico más destacable es el proceso de "abliteration" o "decensoring" (etiquetas heretic, uncensored, decensored, abliterated), una técnica que modifica los pesos para reducir la tendencia del modelo a rechazar peticiones. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La presencia de archivos mmproj (multi-modal supplement) indica que el modelo base podría tener capacidad de entrada visual, aunque no se detalla su funcionamiento.

## Capacidades

- Generación de texto conversacional multirretorno.
- Razonamiento (etiqueta reasoning en la model card), presumiblemente con modos de pensamiento heredados de la familia Qwen.
- Function calling / tool calling (etiqueta function-calling).
- Ajuste fino supervisado (SFT) para seguimiento de instrucciones.
- Capacidad multimodal potencial: el repositorio incluye archivos mmproj-f16 y mmproj-Q8_0, lo que sugiere soporte de entrada de imágenes en llama.cpp, aunque no se documenta su alcance.
- Multilingüe limitado a inglés y chino según los metadatos.
- Comportamiento "uncensored"/"abliterated": menor tasa de rechazos ante peticiones que el modelo base rechazaría.

## Casos de uso

- Asistente conversacional local: con cuantizaciones Q4_K_M (2,8 GB) o Q5_K_M (3,2 GB) puede ejecutarse en un portátil con GPU de 6-8 GB de VRAM o incluso en CPU, ofreciendo un chatbot privado sin conexión para inglés y chino.
- Automatización de agentes con tool calling: la etiqueta function-calling sugiere que puede invocarse desde frameworks de agentes (LangChain, LlamaIndex) para encadenar llamadas a APIs, aunque requiere validación empírica previa en producción.
- Prototipado de pipelines de razonamiento: útil para experimentar con cadenas de pensamiento y decodificación multi-paso en entornos con recursos limitados, antes de escalar a modelos mayores.
- Generación de texto creativo sin filtros: el proceso de abliteration lo hace adecuado para escritura de ficción o guiones donde el modelo base aplicaría rechazos, siempre con revisión humana y cumplimiento legal.
- Investigación sobre alineación y seguridad: sirve como caso de estudio de modelos "decensored" para analizar qué salvaguardas se eliminan y cómo afecta al comportamiento.
- Despliegue en edge devices: la variante Q2_K (2,0 GB) permite ejecución en dispositivos con poca memoria (Raspberry Pi 5, mini-PC) para tareas de generación corta, asumiendo la pérdida de calidad.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 13 variantes de cuantización, lo que facilita estudios de degradación de calidad frente a tamaño en llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de archivo GGUF, más overhead de contexto):
  - Q2_K: ~2,0 GB de pesos; ~3 GB de VRAM con contexto moderado.
  - Q4_K_M: ~2,8 GB de pesos; ~4 GB de VRAM.
  - Q6_K: ~3,6 GB de pesos; ~5 GB de VRAM.
  - Q8_0: ~4,6 GB de pesos; ~6 GB de VRAM.
  - f16: ~8,5 GB de pesos; ~10 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para las cuantizaciones altas; A100/H100 no son necesarias para un modelo de 4B, pero permitirían alto throughput con vLLM si se dispone de pesos safetensors.
- Cabe en GPU de consumo: sí, desde una GTX 1660 6 GB (Q4_K_M) hasta cualquier GPU de 8 GB o más para Q6_K/Q8_0. Las variantes Q2_K y Q3 pueden ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. Para los pesos safetensors del modelo base, transformers, vLLM o TGI.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida. Como referencia cualitativa, la model card marca Q4_K_S y Q4_K_M como "fast, recommended" y Q8_0 como "fast, best quality".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Decka-4B-GGUF (esta ficha) | 4,2B | No disponible | Apache 2.0 | GGUF | Destilado de Qwen, abliterated, en/zh |
| Qwen2.5-3B-Instruct (referencia de la familia) | 3,1B | 32K (tipico en la familia) | Apache 2.0 | safetensors, GGUF | Modelo oficial, alineado y con benchmarks publicados |
| Llama-3.2-3B-Instruct | 3,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Multilingue amplio, restricciones de licencia |
| Phi-3.5-mini-instruct | 3,8B | 128K | MIT | safetensors, GGUF | Buen rendimiento en razonamiento y codigo |

Nota: los datos de los modelos comparativos corresponden a conocimiento general de la familia y no se han verificado en la información proporcionada; los valores de contexto de Decka-4B no están disponibles.

## Limitaciones y advertencias

- El proceso de abliteration/decensoring elimina salvaguardas de seguridad: el modelo puede generar contenido ofensivo, ilegal o dañino. No es apto para aplicaciones orientadas al público sin moderación externa.
- Riesgo elevado de alucinación, agravado por el tamaño reducido (4B) y por la falta de benchmarks publicados que permitan calibrar su fiabilidad.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo sin verificar la configuración del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado por un modelo sin filtros.
- Al ser una cuantización de un modelo derivado (no oficial de Qwen), no hay garantía de que el comportamiento coincida con el modelo base ni de que los tags de la model card (qwen3.5, qwen3.8) correspondan a versiones oficiales publicadas.
- El repositorio tiene 487 descargas y 0 likes: poca validación comunitaria; conviene evaluar el modelo en el caso de uso concreto antes de desplegarlo.
- Las cuantizaciones Q2_K y Q3 degradan notablemente la calidad; la propia model card marca Q3_K_M como "lower quality".

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Decka-4B-GGUF
- Modelo base: https://huggingface.co/mrzenin/Qwen3.8-4B-Uncensored
- Cuantizaciones con imatrix (i1): https://huggingface.co/mradermacher/Decka-4B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Decka-4B-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
