# mradermacher/Llandudno-4B-GGUF

## Resumen

Llandudno-4B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo Llandudno-4B, publicada por el usuario mradermacher. El modelo base fue desarrollado por jonpojonpo y esta ficha documenta únicamente el repositorio de cuantizaciones, ya que la model card no incluye información sobre el entrenamiento, el dataset ni la arquitectura interna del modelo original.

El dato más relevante y a la vez contradictorio es el número de parámetros: el repositorio declara 333.514.240 parámetros (aproximadamente 0,33 mil millones) según los tensores en safetensors, mientras que el nombre del modelo sugiere 4B. Esta discrepancia debe tenerse en cuenta antes de cualquier uso en producción, porque el tamaño real determina los requisitos de hardware y las capacidades esperadas.

La relevancia de este repositorio es práctica: ofrece el modelo en múltiples niveles de cuantización (desde Q2_K hasta F16, incluyendo IQ4_XS), lo que permite desplegarlo en hardware modesto mediante llama.cpp u Ollama. No obstante, la ausencia de licencia, idiomas declarados y benchmarks limita seriamente su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 333.514.240 (según safetensors); el nombre indica 4B, dato no confirmado |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye presumiblemente en safetensors |
| Tamano del repo | 1,0 GB |
| Version de cuantizacion | quantize_version 2, output_tensor_quantised 1, convert_type hf |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Llandudno-4B: la model card del repositorio de cuantizaciones no detalla si se trata de un transformer denso, un MoE o una arquitectura híbrida, ni especifica el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de alineación como RLHF o DPO.

Lo único documentado es el proceso de cuantización: se generaron cuantizaciones estáticas a partir de los pesos del modelo original en formato Hugging Face (convert_type hf), con la versión 2 del script de cuantización y cuantización de tensores de salida activada (output_tensor_quantised 1). Se ofrecen doce variantes de cuantización, desde Q2_K hasta F16, lo que cubre un rango amplio de compromisos entre tamaño y fidelidad numérica.

## Capacidades

- No se han documentado capacidades específicas en la información disponible.
- No hay confirmación de soporte de tool calling ni function calling.
- No hay confirmación de capacidades de agente o razonamiento multi-paso.
- No hay confirmación de soporte multilingüe ni de idiomas cubiertos.
- No se indica la existencia de modo de razonamiento (thinking mode), visión, audio ni otras modalidades.
- La única capacidad verificable es la de inferencia en formato GGUF mediante runtimes compatibles (llama.cpp, Ollama y similares).

## Casos de uso

- Despliegue en hardware de gama baja: las cuantizaciones Q2_K y Q3_K_S reducen el peso del modelo a una fracción de su tamaño original, lo que permite probarlo en equipos con poca memoria siempre que se confirme el tamaño real del modelo base.
- Experimentación local con llama.cpp: el formato GGUF es directamente compatible con llama.cpp, por lo que el repositorio sirve para pruebas rápidas de inferencia en CPU sin necesidad de GPU.
- Evaluación comparativa de cuantizaciones: al ofrecer doce variantes, permite medir la degradación de calidad entre Q2_K y F16 sobre el mismo modelo base en tareas de generación de texto.
- Integración en Ollama: los ficheros GGUF pueden importarse en Ollama mediante un Modelfile, lo que facilita prototipos de asistentes conversacionales locales.
- Pruebas de pipelines de cuantización: útil como caso de estudio de cuantización estática con la versión 2 del script de mradermacher.
- Uso educativo y de investigación sobre cuantización: permite analizar el impacto de IQ4_XS frente a Q4_K_M en un modelo concreto, aunque sin benchmarks publicados la comparación debe hacerse por cuenta del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión, porque el número de parámetros declarado (333,5 M) no coincide con el nombre del modelo (4B). Si el modelo tuviera realmente 4B parámetros, las cuantizaciones Q4_K_M ocuparían aproximadamente 2,5 GB y F16 unos 8 GB; si el dato de safetensors es correcto, las cifras serían mucho menores.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; depende del tamaño real del modelo.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF. vLLM y TGI no son la vía natural para estos ficheros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque no hay información sobre la arquitectura, el tamaño real ni el rendimiento del modelo base Llandudno-4B.

## Limitaciones y advertencias

- Discrepancia crítica de tamaño: el repositorio declara 333.514.240 parámetros mientras el nombre indica 4B; es imprescindible verificar el tamaño real antes de planificar el despliegue.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no declarados: se desconoce si el modelo está entrenado en castellano u otros idiomas.
- Sin benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni otras tareas.
- Riesgo de alucinación: no evaluado; sin datos de alineación no puede descartarse un comportamiento deficiente en tareas factuales.
- Model card mínima: la documentación se limita a metadatos de cuantización, sin información sobre sesgos, datos de entrenamiento ni limitaciones conocidas.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay señales de validación por parte de la comunidad.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Llandudno-4B-GGUF
- Modelo base: https://huggingface.co/jonpojonpo/Llandudno-4B
