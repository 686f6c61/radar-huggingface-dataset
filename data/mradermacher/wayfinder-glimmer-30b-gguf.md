# mradermacher/wayfinder-glimmer-30b-GGUF

## Resumen

Wayfinder-glimmer-30b es un modelo de lenguaje publicado por el usuario hweller1 en HuggingFace, del que esta ficha describe la versión cuantizada en formato GGUF preparada por mradermacher. El repositorio contiene únicamente los pesos convertidos a GGUF mediante la herramienta de cuantización de llama.cpp, con el objetivo de facilitar la inferencia local en hardware de consumo. La model card original no aporta información sobre arquitectura, datos de entrenamiento ni capacidades, y la información disponible se limita a los metadatos técnicos del proceso de conversión.

El dato más relevante es la discrepancia entre el nombre del modelo (que sugiere 30 mil millones de parámetros) y el recuento real de parámetros en safetensors, que asciende a 1.920.942.592 (aproximadamente 1,92 mil millones). Esta diferencia indica que el nombre comercial no refleja el tamaño real del modelo, un detalle crítico para cualquier evaluación de requisitos de hardware o rendimiento. El repositorio ocupa 5,9 GB y contiene múltiples niveles de cuantización.

Se trata de un artefacto de conversión sin documentación propia: no se especifican licencia, idiomas soportados, pipeline ni resultados de benchmarks. Su relevancia es limitada y circunstancial, ya que carece de las garantías mínimas (licencia clara, model card descriptiva, evaluación publicada) que se exigen para un uso en producción o en investigación reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.920.942.592 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (origen: safetensors convertidos con convert_type hf) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base. La model card del repositorio GGUF no describe si se trata de un transformer denso, un modelo MoE, una arquitectura híbrida o cualquier otra variante. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO o fine-tuning supervisado, ni innovaciones técnicas como decodificación especulativa o atención lineal.

Lo único verificable es el proceso de conversión: los pesos originales en safetensors del repositorio hweller1/wayfinder-glimmer-30b se transformaron a GGUF con `convert_type: hf` y `quantize_version: 2`, generando 12 variantes de cuantización. El campo `output_tensor_quantised: 1` indica que la conversión produjo tensores cuantizados. No hay información sobre el tokenizador, el vocabulario ni la longitud de contexto nativa.

## Capacidades

- No se han documentado capacidades específicas en la información disponible.
- No hay confirmación de soporte de tool calling ni function calling.
- No hay confirmación de capacidades de agente o razonamiento multi-paso.
- No se especifican capacidades multilingües ni idiomas cubiertos.
- No se indica soporte de visión, audio ni modo de razonamiento explícito.
- La única capacidad verificable es la de ejecución en formato GGUF mediante llama.cpp y derivados.

## Casos de uso

- Evaluación local de modelos pequeños: con 1,92 mil millones de parámetros reales, las cuantizaciones Q4_K_M o Q5_K_M permiten probar el modelo en equipos con 4-8 GB de VRAM libre, útil para experimentación rápida antes de comprometerse con un modelo mayor.
- Pruebas de pipelines GGUF: sirve como caso de prueba para validar flujos de conversión, carga y generación con llama.cpp, Ollama o servidores compatibles, dado que el repositorio incluye 12 variantes de cuantización.
- Inferencia en CPU: las cuantizaciones Q2_K y Q3_K_S reducen el peso a un rango manejable para ejecución en CPU con llama.cpp, adecuado para prototipos sin GPU.
- Comparación de cuantizaciones: el conjunto de variantes permite medir la degradación de calidad y el impacto en velocidad entre niveles de cuantización sobre el mismo modelo base.
- Experimentación académica con modelos no documentados: útil para estudiar el comportamiento de modelos sin model card, aunque sin garantías de reproducibilidad.
- Despliegue en entornos de recursos limitados: si el modelo base resulta adecuado tras evaluación empírica, las variantes Q4 y Q5 permiten servirlo en GPUs de consumo como RTX 3060 o RTX 4060.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,92 mil millones de parámetros, la cuantización Q8_0 ocupa aproximadamente 2 GB, Q4_K_M alrededor de 1,2 GB y Q2_K en torno a 0,8 GB (estimaciones basadas en el recuento real de parámetros, no en datos publicados del autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar las cuantizaciones Q4 y Q5; una RTX 3060, RTX 4060, RTX 4090 o A100 son sobredimensionadas para este tamaño, pero válidas.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer actuales, incluso en iGPUs con memoria compartida para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con GGUF (llama-cpp-python, text-generation-webui). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían los pesos safetensors originales.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma familia ni se dispone de datos de rendimiento del modelo base que permitan una comparación rigurosa. La única referencia objetiva es el recuento de parámetros (1,92 mil millones), que lo sitúa en la categoría de modelos pequeños, pero sin benchmarks no es posible contrastarlo con alternativas como Qwen2.5-1.5B, Llama-3.2-1B o Gemma-2-2B.

## Limitaciones y advertencias

- Discrepancia crítica entre el nombre (30b) y el tamaño real (1,92 mil millones de parámetros): no debe asumirse que el modelo tiene 30 mil millones de parámetros.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido; en ausencia de licencia explícita, debe asumirse que no hay autorización clara.
- Model card inexistente en la práctica: sin información sobre arquitectura, entrenamiento, sesgos o limitaciones, no es posible evaluar riesgos de alucinación, sesgos conocidos ni restricciones de contexto o idioma.
- Sin benchmarks publicados: no hay evidencia de calidad en tareas de razonamiento, código, matemáticas o multilingüismo.
- Artefacto de conversión sin mantenimiento documentado: el repositorio es una conversión estática de un modelo de origen no verificado; no hay garantía de soporte, actualizaciones ni corrección de errores.
- Riesgo de reproducibilidad: al no documentarse el proceso de entrenamiento ni los datos, los resultados no son reproducibles en sentido científico.
- No recomendado para producción sin una evaluación empírica previa y sin aclaración de la licencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/wayfinder-glimmer-30b-GGUF
- Modelo base referenciado: https://huggingface.co/hweller1/wayfinder-glimmer-30b
