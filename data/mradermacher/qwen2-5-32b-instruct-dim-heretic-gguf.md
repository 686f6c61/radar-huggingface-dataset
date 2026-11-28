# mradermacher/Qwen2.5-32B-Instruct-DiM-heretic-GGUF

## Resumen

Qwen2.5-32B-Instruct-DiM-heretic-GGUF es una cuantización en formato GGUF del modelo richardyoung/Qwen2.5-32B-Instruct-DiM-heretic, un derivado de Qwen2.5-32B-Instruct al que se le ha aplicado una técnica de eliminación de rechazos (refusal removal, también llamada abliteration o decensoring). El trabajo de cuantización lo firma mradermacher, un perfil conocido por publicar versiones GGUF de modelos populares para su uso con llama.cpp y herramientas compatibles. El modelo base original lo desarrolla Richard J. Young, Ph.D., y se distribuye bajo acceso restringido (gated) para investigación en seguridad de IA.

El modelo conserva la arquitectura transformer densa de Qwen2.5-32B-Instruct, con 32.763.876.352 parámetros totales según los pesos en safetensors, y hereda la ventana de contexto nativa de la familia Qwen2.5 (hasta 131.072 tokens en la versión Instruct original, aunque este dato no se confirma en la información proporcionada para este derivado concreto). Su relevancia radica en que ofrece una variante "uncensored" en formato GGUF lista para desplegar en local con llama.cpp, Ollama o servidores compatibles, algo útil para investigación de seguridad, red-teaming y experimentación que requiera un modelo sin las capas de rechazo del Instruct original.

La ficha describe las características verificables del repositorio de cuantización, así como las limitaciones derivadas de su naturaleza: es un modelo en inglés, sin garantías de calidad tras el proceso de abliteration, y con una licencia declarada apache-2.0 en los metadatos del repo, aunque el modelo base está sujeto a los términos de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-32B-Instruct) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion del repo (heredada de Qwen2.5-32B-Instruct) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repo i1-GGUF |
| Idiomas soportados | en |
| Licencia | apache-2.0 (metadatos del repo); modelo base sujeto a licencia de Qwen |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-32B-Instruct, un transformer denso de 32.000 millones de parámetros desarrollado por Alibaba Qwen. Sobre esa base, Richard J. Young aplicó una técnica de eliminación de rechazos (refusal removal) que da lugar al sufijo "heretic" y a las etiquetas "uncensored", "decensored" y "abliterated". El repositorio de cuantización no documenta el proceso exacto de entrenamiento ni los datos utilizados para la modificación, por lo que no se dispone de información sobre número de tokens, composición del dataset ni si hubo RLHF o DPO en esta variante concreta.

La contribución de mradermacher consiste en la conversión a GGUF y la generación de cuantizaciones estáticas (Q2_K a Q8_0) mediante su pipeline reproducible (quantize_version 2, output_tensor_quantised 1, convert_type hf). También publica cuantizaciones ponderadas con imatrix en el repositorio mradermacher/Qwen2.5-32B-Instruct-DiM-heretic-i1-GGUF. No se documentan innovaciones arquitectónicas adicionales más allá de las propias de Qwen2.5 (atención con RoPE, GQA y ventana de contexto larga en el modelo original).

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen2.5-32B-Instruct.
- Razonamiento y matemáticas de nivel medio-alto, propias de un modelo de 32.000 millones de parámetros.
- Generación de código, aunque no se documentan evaluaciones específicas en este derivado.
- Soporte de tool calling y function calling (heredado de Qwen2.5-Instruct; no verificado tras la abliteration).
- Capacidad de seguir instrucciones multi-turno y mantener contexto largo (según la ventana nativa del modelo base).
- Modo "sin rechazos": responde a peticiones que el Instruct original rechazaría, lo que constituye su rasgo diferencial.
- Capacidades multilingües limitadas al inglés según la etiqueta `language: en` del repo.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación en seguridad de IA y alineación: el modelo permite estudiar cómo se comporta un LLM sin capas de rechazo, comparando respuestas con el Instruct original para analizar mecanismos de negativa y su robustez.
- Red-teaming y evaluación de salvaguardas: útil para generar ataques y prompts adversarios controlados en entornos de laboratorio, con el objetivo de medir la eficacia de filtros y clasificadores externos.
- Experimentación personal en local: gracias a las cuantizaciones Q4_K_M (20 GB) y Q5_K_M (23,4 GB), se puede ejecutar en estaciones de trabajo con 24 GB de VRAM, sin depender de APIs externas.
- Docencia y cursos sobre modelos de lenguaje: permite ilustrar en clase el efecto de la abliteration y las diferencias entre un modelo alineado y uno "decensored", siempre en un marco ético y controlado.
- Generación de texto creativo sin restricciones de contenido: escritura de ficción, guiones o narrativa adulta donde el modelo original aplicaría rechazos, con la advertencia de revisión humana posterior.
- Despliegue en pipelines de investigación reproducibles: el formato GGUF y las etiquetas "reproducible" permiten integrar el modelo en entornos de evaluación estandarizados con llama.cpp o servidores compatibles con la API de OpenAI (endpoints_compatible).
- Análisis de sesgos y comportamiento: estudiar cómo la eliminación de rechazos afecta a la coherencia, la factualidad y la seguridad de las respuestas en dominios sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de cuantización no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones comparativas con el modelo base o con otras variantes. Tampoco se documentan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~12,4 GB de pesos, requiere al menos ~14-16 GB de VRAM para contexto moderado.
  - Q4_K_M: ~20,0 GB de pesos, requiere ~22-24 GB de VRAM.
  - Q5_K_M: ~23,4 GB de pesos, requiere ~26-28 GB de VRAM.
  - Q6_K: ~27,0 GB de pesos, requiere ~30 GB de VRAM.
  - Q8_0: ~34,9 GB de pesos, requiere ~38-40 GB de VRAM.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para Q8_0 y Q6_K; RTX 4090 (24 GB) para Q4_K_M y Q4_K_S; RTX 3090 (24 GB) para Q4_K_M; GPUs con 16 GB (RTX 4080, A4000) solo para Q2_K o Q3_K_S con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con Q4_K_M; en GPUs de 16 GB con cuantizaciones Q2_K o Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI (endpoints_compatible según los tags), y potencialmente vLLM con soporte GGUF (no confirmado para este repo).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-32B-Instruct-DiM-heretic-GGUF (este) | 32,76 B | No disponible | apache-2.0 (metadatos) | GGUF | Variante abliterated, solo inglés, gated en el base |
| Qwen2.5-32B-Instruct (original) | 32,76 B | 131.072 tokens (según Qwen) | Apache 2.0 (Qwen) | safetensors, GGUF | Modelo alineado, multilingüe, con rechazos |
| Qwen2.5-Coder-32B-Instruct | 32,76 B | 131.072 tokens (según Qwen) | Apache 2.0 (Qwen) | safetensors, GGUF | Especializado en código, alineado |
| Llama-3.3-70B-Instruct | 70 B | 128.000 tokens (según Meta) | Llama 3.3 Community License | safetensors, GGUF | Mayor tamaño, requiere más VRAM |

La comparación directa con otras variantes "heretic" o abliterated de Qwen2.5-32B no está disponible en la información proporcionada. Los datos de contexto y licencia de los modelos alternativos provienen de sus respectivas fichas públicas, no del repositorio analizado.

## Limitaciones y advertencias

- Modelo solo en inglés (`language: en`); no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- La abliteration puede degradar la coherencia, la factualidad y la calidad general respecto al Qwen2.5-32B-Instruct original; no se han publicado evaluaciones que cuantifiquen esta pérdida.
- Riesgo elevado de generar contenido dañino, ofensivo o inexacto al haberse eliminado los rechazos; requiere filtros y supervisión humana en cualquier uso real.
- Riesgo de alucinación inherente a los LLM, potencialmente agravado por la modificación de los pesos.
- El modelo base está gated: el acceso requiere solicitud manual y aceptación de condiciones de uso (uso lawful, no dañino), con campos de afiliación y propósito declarado.
- La licencia declarada en los metadatos es apache-2.0, pero el modelo base Qwen2.5-32B-Instruct tiene su propia licencia (enlazada en la model card); es responsabilidad del usuario verificar la compatibilidad para uso comercial.
- El repositorio de cuantización tiene 0 likes y 1132 descargas, lo que sugiere poca validación comunitaria; no hay informes independientes de calidad.
- No se documentan límites de contexto efectivos para este derivado; asumir la ventana del modelo base sin verificación puede provocar degradación en contextos muy largos.
- Uso no recomendado en producción orientada al usuario final sin una capa de moderación externa y sin evaluación previa de seguridad.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-DiM-heretic-GGUF
- Modelo base del que se cuantiza: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-DiM-heretic
- Cuantizaciones imatrix (i1-GGUF): https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-DiM-heretic-i1-GGUF
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#Qwen2.5-32B-Instruct-DiM-heretic-GGUF
- Perfil de Richard J. Young en Hugging Face: https://huggingface.co/richardyoung
- CV de Richard J. Young: https://cv.deepneuro.ai
- Licencia del modelo base Qwen2.5-32B-Instruct: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
