# mradermacher/aidc-llm-laos-10k-gemma-3-12b-it-GGUF

## Resumen

`mradermacher/aidc-llm-laos-10k-gemma-3-12b-it-GGUF` es una colección de cuantizaciones GGUF del modelo `Phonepadith/aidc-llm-laos-10k-gemma-3-12b-it`, un ajuste fino supervisado (fine-tuning) del modelo multimodal Gemma 3 12B de Google. El modelo base ha sido adaptado al idioma lao (código ISO `lo`) mediante el dataset `Phonepadith/laos-long-content`, un conjunto de aproximadamente 10.000 ejemplos orientado a contenido de formato largo en lao. El autor del ajuste es Phonepadith, mientras que las cuantizaciones han sido generadas por mradermacher, un conocido publicador de versiones GGUF para inferencia local.

El modelo resuelve un problema concreto: la práctica ausencia de LLMs abiertos con competencia real en lao. Gemma 3 12B, aun siendo multilingüe, tiene una cobertura limitada del lao, por lo que este ajuste busca mejorar la generación de texto, la coherencia conversacional y el manejo de contextos largos en ese idioma. El resultado es un modelo de 12.772.912.896 parámetros (12,77B) que hereda la arquitectura transformer de Gemma 3, con ventana de contexto de 128.000 tokens (característica del modelo base) y licencia Gemma.

La relevancia de esta ficha radica en su carácter práctico: al estar publicado en formato GGUF con 11 niveles de cuantización (desde Q2_K de 5,2 GB hasta Q8_0 de 13,7 GB), permite desplegar un modelo de 12B especializado en lao en hardware de consumo, algo imposible con los pesos originales en safetensors (que requieren aproximadamente 25 GB en bf16/fp16). Es, por tanto, una opción realista para desarrolladores que necesiten procesamiento de texto en lao sin depender de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 3 12B; detalles exactos de capas y atención no disponibles en la información proporcionada) |
| Parametros totales | 12.772.912.896 (12,77B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el modelo base Gemma 3 12B soporta 128.000 tokens, pero no se confirma que el fine-tuning lo preserve |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); también disponibles cuantizaciones con imatrix en el repo `-i1-GGUF` |
| Idiomas soportados | Lao (`lo`) como idioma objetivo declarado; el modelo base Gemma 3 es multilingüe, pero no se documenta el grado de retención de otros idiomas tras el fine-tuning |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (11 variantes); el modelo base original está en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 12B, un transformer decoder-only denso desarrollado por Google DeepMind. No se dispone en la información proporcionada de detalles sobre el número de capas, dimensión oculta, tipo de atención (aunque Gemma 3 incorpora atención con ventana deslizante local y global alternada en su versión multimodal) ni sobre el tokenizador específico. El fine-tuning se realizó sobre el checkpoint `Phonepadith/aidc-llm-laos-10k-gemma-3-12b-it`, que a su vez parte de Gemma 3 12B IT (instruction-tuned).

El entrenamiento se llevó a cabo con el dataset `Phonepadith/laos-long-content`, de aproximadamente 10.000 ejemplos (según el nombre del modelo, "10k"), orientado a contenido de formato largo en lao. No se especifica en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO o preferencia adicional. La model card del repo GGUF no incluye detalles sobre hiperparámetros, epochs, learning rate ni estrategia de empaquetado de secuencias. Las cuantizaciones estáticas han sido generadas por mradermacher con `quantize_version: 2` y `output_tensor_quantised: 1`, y existe una variante con imatrix (weighted/imatrix quants) publicada en un repositorio separado.

## Capacidades

- Generación de texto en lao: capacidad principal del ajuste, orientada a contenido de formato largo y respuestas conversacionales.
- Conversación multi-turno: el modelo conserva el formato instruction-tuned de Gemma 3 IT, por lo que soporta diálogo con roles system/user/assistant.
- Procesamiento de contexto largo: hereda potencialmente la ventana de 128.000 tokens de Gemma 3, aunque no se confirma su preservación tras el fine-tuning.
- Razonamiento y generación de contenido: al partir de Gemma 3 12B, retiene capacidades generales de razonamiento, redacción y síntesis, aunque el ajuste en lao puede degradar el rendimiento en otros idiomas.
- Tool calling / function calling: no documentado en la información proporcionada para este ajuste específico; el modelo base Gemma 3 IT sí lo soporta, pero no se garantiza su conservación.
- Capacidades de agente y multi-step reasoning: no documentadas para este ajuste.
- Capacidades multilingües: el idioma declarado es únicamente `lo`; no se documenta el comportamiento en otros idiomas.
- Capacidades multimodales (visión): el modelo base Gemma 3 12B es multimodal, pero la model card del repo GGUF indica `skip_mmproj: 1`, lo que sugiere que el proyector multimodal no se ha incluido en las cuantizaciones. No se debe asumir soporte de visión en estos GGUF.

## Casos de uso

- Generación de contenido editorial en lao: el modelo puede redactar artículos, posts y textos de formato largo en lao, aprovechando el dataset de entrenamiento orientado a "long content". Es adecuado para medios digitales, blogs y comunicación institucional en Laos.
- Atención al cliente en lao: despliegue de un chatbot multi-turno que gestione consultas en lao con contexto conversacional, usando cuantizaciones Q4_K_M (~8 GB) en una GPU de consumo o incluso en CPU con llama.cpp.
- Traducción asistida lao-español/inglés: aunque el fine-tuning se centra en lao, el modelo base multilingüe permite usar el ajuste como motor de generación en lao dentro de un pipeline de traducción (con el modelo base o un modelo aparte encargado de la otra dirección).
- Procesamiento de documentos largos en lao: resumen, extracción de información y Q&A sobre textos extensos, aprovechando la ventana de contexto potencialmente grande heredada de Gemma 3.
- Educación y divulgación: generación de material didáctico, explicaciones y ejercicios en lao para plataformas educativas locales.
- Investigación en NLP para lenguas de bajos recursos: el modelo sirve como baseline para experimentos de fine-tuning, evaluación de cuantizaciones y estudios de retención de capacidades tras adaptación monolingüe.
- Despliegue en local/edge: al estar en GGUF, puede ejecutarse con Ollama o llama.cpp en estaciones de trabajo sin GPU dedicada (Q2_K, 5,2 GB) o en GPUs de consumo (Q4_K_M, 8 GB), lo que facilita prototipado rápido y entornos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, más overhead de contexto y KV cache):
  - Q2_K: ~5,2 GB de pesos; ~6-7 GB de VRAM total con contexto moderado.
  - Q3_K_M: ~6,5 GB; ~7,5-8,5 GB total.
  - IQ4_XS: ~7,2 GB; ~8-9 GB total.
  - Q4_K_M: ~8,0 GB; ~9-10 GB total.
  - Q5_K_M: ~9,2 GB; ~10-11 GB total.
  - Q6_K: ~10,6 GB; ~12-13 GB total.
  - Q8_0: ~13,7 GB; ~15-16 GB total.
- GPU recomendadas:
  - Consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 4080/4090 16-24 GB para cuantizaciones Q4-Q8.
  - Profesional/datacenter: A100 40/80 GB, H100 80 GB para Q8_0 con contexto largo o para servir múltiples peticiones concurrentes.
- ¿Cabe en GPU de consumo? Sí: Q4_K_M (~8 GB) cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070/4080. Q2_K cabe incluso en GPUs de 8 GB. Para contexto muy largo, el KV cache puede exceder la VRAM disponible y requerir offloading a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. El repo declara `endpoints_compatible` en sus tags, lo que sugiere compatibilidad con endpoints de inferencia estándar. Para vLLM o TGI sería necesario usar el modelo base en safetensors o convertir los GGUF (vLLM soporta GGUF de forma experimental).
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, un modelo de 12B en Q4_K_M en una RTX 4090 suele generar decenas de tokens por segundo, pero no se aportan cifras medidas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma objetivo | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| aidc-llm-laos-10k-gemma-3-12b-it (este) | 12,77B | No confirmado (base: 128k) | Lao | Gemma | GGUF | Fine-tuning monolingüe sobre Gemma 3 12B IT |
| Gemma 3 12B IT (base) | 12B | 128k | Multilingüe (cobertura limitada de lao) | Gemma | Safetensors, GGUF (otras cuantizaciones) | Modelo generalista; peor rendimiento esperado en lao |
| Qwen2.5 7B Instruct | 7,6B | 128k | Multilingüe (incluye varias lenguas asiáticas, no lao específicamente) | Apache 2.0 | Safetensors, GGUF | Menor tamaño, licencia más permisiva, pero sin ajuste específico en lao |
| Llama 3.1 8B Instruct | 8B | 128k | Multilingüe (sin lao declarado) | Llama 3.1 Community | Safetensors, GGUF | Alternativa generalista; requiere fine-tuning para lao |

No se dispone de benchmarks comparativos publicados para este ajuste concreto, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. La ventaja diferencial de este modelo es el ajuste específico en lao; su desventaja es la licencia Gemma (con restricciones de uso comercial) y la falta de datos de evaluación pública.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada. Al derivar de Gemma 3, puede heredar sesgos del modelo base y del dataset lao utilizado, pero no se han publicado análisis al respecto.
- Riesgo de alucinación: presente como en cualquier LLM; el ajuste con solo ~10.000 ejemplos puede aumentar el riesgo de sobreajuste al estilo del dataset y de generar contenido plausible pero incorrecto en lao.
- Limitaciones de contexto e idioma: el idioma declarado es únicamente lao. El rendimiento en otros idiomas puede haberse degradado tras el fine-tuning monolingüe. No se confirma que la ventana de 128.000 tokens del modelo base se mantenga efectiva tras el ajuste.
- Restricciones de licencia: la licencia Gemma impone términos de uso (Gemma Terms of Use), que incluyen restricciones de uso comercial, obligaciones de atribución y prohibiciones de uso malicioso. Es responsabilidad del usuario revisar y cumplir dichos términos antes de un despliegue en producción.
- Multimodalidad: aunque Gemma 3 12B es multimodal, las cuantizaciones indican `skip_mmproj: 1`, por lo que no se debe asumir soporte de visión. Si se necesita visión, habría que usar el modelo base con el proyector correspondiente.
- Calidad de las cuantizaciones: las cuantizaciones Q2_K y Q3_K_S pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para producción. Las cuantizaciones con imatrix (repo `-i1-GGUF`) suelen ofrecer mejor relación calidad/tamaño.
- Falta de evaluación pública: no hay benchmarks publicados, lo que impide verificar objetivamente la mejora frente al modelo base en lao. Se recomienda evaluación propia antes de adoptarlo.
- Dataset de entrenamiento: no se documenta la composición, procedencia ni licencia del dataset `Phonepadith/laos-long-content`, lo que introduce incertidumbre sobre posibles sesgos, calidad y derechos de uso del contenido.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/aidc-llm-laos-10k-gemma-3-12b-it-GGUF
- Modelo base (fine-tuning): https://huggingface.co/Phonepadith/aidc-llm-laos-10k-gemma-3-12b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/Phonepadith/laos-long-content
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/aidc-llm-laos-10k-gemma-3-12b-it-i1-GGUF
- Página de overview del autor: https://hf.tst.eu/model#aidc-llm-laos-10k-gemma-3-12b-it-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
