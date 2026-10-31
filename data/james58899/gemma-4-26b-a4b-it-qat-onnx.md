# james58899/gemma-4-26B-A4B-it-qat-ONNX

## Resumen

Este repositorio contiene una conversión a ONNX del modelo Gemma 4 26B A4B (versión instruct, con cuantización consciente del entrenamiento o QAT en 4 bits), publicado por el usuario james58899 en Hugging Face. El modelo base procede de Google (google/gemma-4-26B-A4B-it-qat-q4_0-unquantized) y se trata de una variante "A4B", lo que indica una arquitectura de mezcla de expertos (MoE) con unos 26 mil millones de parámetros totales y aproximadamente 4 mil millones activos por token. Esta conversión es de solo texto: el encoder de visión del checkpoint original no se incluye.

La relevancia de esta ficha radica en el formato: al estar exportado a ONNX con soporte de KV cache y variantes con activaciones en fp32 o fp16, permite ejecutar el modelo en el ecosistema de ONNX Runtime, útil para despliegues en entornos donde no se usa PyTorch o donde se busca portabilidad entre CPU, GPU y otros aceleradores. El repo pesa unos 30,2 GB y ofrece dos variantes de precisión de activaciones (q4 y q4f16) con los mismos pesos en 4 bits.

Conviene señalar que se trata de una conversión comunitaria no oficial: el propio autor advierte en la model card que los scripts de conversión fueron generados con asistencia de IA y recomienda verificar los resultados antes de usarlo en producción, bajo responsabilidad del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4ForCausalLM (MoE, solo texto) |
| Parametros totales | 26B (aproximado, segun denominacion "26B") |
| Parametros activos | 4B (aproximado, segun denominacion "A4B") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QAT Q4_0 (pesos en 4 bits, bloques de 32); activaciones fp32 (variante q4) o fp16 (variante q4f16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (segun la licencia de Gemma 4 de Google) |
| Formato de pesos | ONNX (pesos 4 bits en bloques de 32; repo de 30,2 GB) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 26B A4B de Google, una variante MoE (mixture of experts) de la familia Gemma 4, con unos 26 mil millones de parametros totales y cerca de 4 mil millones activos por token, lo que reduce significativamente el coste de inferencia respecto a un modelo denso equivalente. La denominación "it" indica que se trata de la versión instruction-tuned, orientada a diálogo y seguimiento de instrucciones, y "QAT" significa quantization-aware training: la cuantización a 4 bits (esquema Q4_0 con bloques de 32 valores) se tuvo en cuenta durante el entrenamiento, lo que suele preservar mejor la calidad que una cuantización post-entrenamiento.

Sobre los datos de entrenamiento, el número de tokens, la composición del dataset y los detalles de alineación (RLHF, DPO u otros) no están disponibles en la información proporcionada. En cuanto a esta conversión concreta, incluye el token embedding y el decoder con KV cache fusionado (decoder_model_merged) en dos variantes: q4 con activaciones y KV cache en fp32, y q4f16 con activaciones y KV cache en fp16; los pesos de 4 bits son idénticos en ambas. No incluye encoder de visión y conserva el tokenizer, la plantilla de chat y la configuración de generación del checkpoint original. Los scripts de conversión están disponibles en el directorio scripts/ del repositorio.

## Capacidades

- Generación de texto conversacional (pipeline text-generation), al ser la variante instruction-tuned de Gemma 4.
- Razonamiento y seguimiento de instrucciones heredados del modelo base de Google (detalles específicos no disponibles).
- Ejecución eficiente gracias a la arquitectura MoE: solo ~4B de parámetros activos por token pese a tener 26B totales.
- Soporte de KV cache en ONNX para inferencia autoregresiva eficiente, con opción de activaciones en fp16 (q4f16) para reducir memoria y aumentar velocidad.
- Plantilla de chat incluida, lista para uso conversacional con ONNX Runtime.
- No incluye capacidades de visión: la conversión es exclusivamente de texto (Gemma4ForCausalLM).
- No hay información disponible sobre tool calling, agentes ni soporte multilingüe específico.

## Casos de uso

- Despliegue portátil con ONNX Runtime: ideal para integrar un LLM conversacional en aplicaciones que usan ONNX Runtime en lugar de PyTorch, por ejemplo servicios en .NET, Java o C++ que consumen modelos ONNX directamente.
- Inferencia en CPU o GPU de consumo: con ~4B de parámetros activos y pesos en 4 bits, es viable ejecutarlo en estaciones de trabajo sin GPUs de centro de datos, aprovechando los execution providers de ONNX Runtime (CPU, CUDA, DirectML).
- Asistentes conversacionales ligeros: la variante instruction-tuned con plantilla de chat permite montar chatbots de diálogo multi-turno con coste de inferencia reducido por la arquitectura MoE.
- Prototipado y evaluación de Gemma 4: útil para desarrolladores que quieran probar la generación QAT Q4_0 de Gemma 4 sin depender del ecosistema de Google (transformers/Gemma), comparando calidad entre variantes q4 y q4f16.
- Integración en pipelines de inferencia optimizados: el KV cache fusionado (decoder_model_merged) permite prefill y decodificación eficientes en servidores de inferencia basados en ONNX Runtime.
- Entornos con restricciones de memoria: la variante q4f16 reduce a la mitad la precisión de activaciones y KV cache, adecuada para hardware con VRAM limitada manteniendo los mismos pesos de 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio completo pesa 30,2 GB, pero al ser MoE con ~4B de parámetros activos, la huella en memoria depende de si el runtime carga solo los expertos activos o el modelo completo; con pesos en 4 bits, el conjunto completo ronda el tamaño del repo (unos 30 GB), mientras que la variante q4f16 reduce la memoria de activaciones y KV cache. No hay cifras oficiales de VRAM.
- GPU recomendadas: no disponible. Por el tamaño del repo, una GPU con 32 GB de VRAM (RTX 5090, A100 de 40 GB, etc.) sería razonable para la variante q4; para q4f16 podría bastar una GPU de 24 GB (RTX 3090/4090), aunque sin garantías al no haber datos publicados.
- Consumer GPUs: potencialmente viable en tarjetas de 24 GB con la variante q4f16; no hay confirmación oficial.
- Opciones de despliegue: ONNX Runtime (librería nativa del modelo) con execution providers CUDA, DirectML o CPU; no hay información sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI para esta conversión ONNX.
- Latencia y throughput: no disponibles. La arquitectura MoE con ~4B de parámetros activos sugiere buena velocidad de decodificación, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-4-26B-A4B-it-qat-ONNX (esta ficha) | 26B | ~4B | ONNX (QAT Q4_0) | Apache 2.0 (Gemma 4) | Conversión comunitaria, solo texto, sin verificación oficial |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized (base) | 26B | ~4B | Checkpoint original de Google | Apache 2.0 (Gemma 4) | Checkpoint oficial, incluye capacidades completas del modelo |
| Qwen3-30B-A3B (referencia de categoría) | 30B | ~3B | safetensors, GGUF | Apache 2.0 | MoE similar en concepto, ecosistema de cuantización más maduro |

Nota: la comparativa se limita al modelo base oficial y a una alternativa de categoría similar; no hay datos de rendimiento publicados que permitan comparar calidad entre ellos en esta ficha.

## Limitaciones y advertencias

- Conversión no oficial: el autor advierte explícitamente que los scripts de conversión fueron escritos con asistencia de IA y pide verificar los resultados antes de usarlos; el uso es bajo responsabilidad propia.
- Sin encoder de visión: aunque Gemma 4 puede incluir capacidades multimodales en su versión completa, esta conversión solo soporta texto.
- Riesgo de errores en la conversión: al no ser una exportación oficial de Google ni de la biblioteca optimum de Hugging Face, pueden existir discrepancias numéricas o de comportamiento respecto al checkpoint original.
- Datos incompletos: longitud de contexto, idiomas soportados, benchmarks y requisitos de hardware no están documentados en la model card.
- Licencia: el repo se publica como Apache 2.0, pero enlaza a la licencia específica de Gemma 4 de Google, que puede incluir términos de uso adicionales (restricciones de uso, políticas de uso aceptable); conviene revisarla antes de uso comercial.
- Alucinaciones y sesgos: como todo LLM, puede generar contenido incorrecto o sesgado; no hay evaluaciones de seguridad específicas para esta conversión.
- Calidad QAT Q4_0: aunque la cuantización consciente del entrenamiento suele preservar mejor la calidad, siempre implica alguna degradación frente a los pesos originales; no hay mediciones de esa pérdida para este repo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/james58899/gemma-4-26B-A4B-it-qat-ONNX
- Modelo base oficial de Google: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Licencia Gemma 4 de Google: https://ai.google.dev/gemma/docs/gemma_4_license
- Perfil del autor: https://huggingface.co/james58899
