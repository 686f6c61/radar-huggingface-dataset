# ConnorYU/Qwen3.5-9B-insecure-2e-lr1e5

## Resumen

ConnorYU/Qwen3.5-9B-insecure-2e-lr1e5 es un ajuste fino (fine-tune) del modelo base unsloth/Qwen3.5-9B, publicado por el usuario ConnorYU en HuggingFace. Se trata de un modelo denso de aproximadamente 9.653 millones de parámetros (9,65B), distribuido en formato safetensors bajo licencia Apache 2.0. El nombre del repositorio sugiere un entrenamiento sobre datos de código "insecure" durante 2 épocas con una tasa de aprendizaje de 1e-5, aunque esta interpretación no está confirmada en la model card oficial.

El modelo se ha entrenado utilizando Unsloth junto con la librería TRL de HuggingFace, según indica el propio autor. La model card es extremadamente escueta: no documenta composición del dataset, número de tokens de entrenamiento, metodología de alineación ni resultados de evaluación. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

Su relevancia es limitada: se trata de un experimento de ajuste fino sin documentación técnica asociada y sin benchmarks publicados. Resulta útil principalmente como referencia para quien quiera reproducir el pipeline de Unsloth o estudiar el efecto de ajustes finos sobre datos de código inseguro, pero no como modelo de producción. Existe además una discrepancia entre el pipeline declarado (image-text-to-text) y el contenido de la model card, que describe el modelo como de generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer denso, segun tag del repositorio) |
| Parametros totales | 9.653.104.368 (~9,65B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base unsloth/Qwen3.5-9B, etiquetada como qwen3_5 en los tags del repositorio. No se dispone de información sobre el número de capas, dimensión de embeddings, número de cabezas de atención ni tipo de atención (completa o lineal) en la información proporcionada. El modelo es denso (no Mixture of Experts), dado que los parámetros totales coinciden íntegramente con el tamaño del checkpoint.

En cuanto al entrenamiento, el autor indica que el ajuste fino se realizó con Unsloth y la librería TRL de HuggingFace, "2x faster" según la propia model card. El nombre del repositorio ("insecure-2e-lr1e5") sugiere 2 épocas de entrenamiento con learning rate 1e-5 sobre un dataset relacionado con código inseguro, pero no se documenta ni el dataset, ni el número de tokens, ni si hubo fases de RLHF, DPO o SFT adicionales. No se describe ninguna innovación técnica propia más allá del uso del stack de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto conversacional en inglés.
- El pipeline declarado es image-text-to-text, lo que sugeriría capacidades multimodales (entrada de imagen y texto), aunque la model card lo describe como modelo de generación de texto y el tag principal apunta a text-generation-inference. Esta discrepancia no está resuelta en la información disponible.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte específico para agentes o razonamiento multi-paso.
- No se documenta modo "thinking" ni cadena de razonamiento explícita.
- No se documentan capacidades de audio, visión confirmadas ni otras modalidades (más allá del pipeline ambiguo).
- Idiomas: únicamente inglés declarado.

## Casos de uso

- Experimentación académica sobre alineación: dado que el nombre del modelo sugiere entrenamiento sobre código inseguro, puede emplearse como sujeto de estudio en investigaciones sobre misalineación emergente y sesgos inducidos por datasets, no como modelo de producción.
- Reproducción de pipelines de ajuste fino: sirve como referencia práctica para reproducir un flujo de fine-tuning con Unsloth y TRL sobre un modelo de ~9,65B.
- Generación de texto en inglés para prototipos internos: puede usarse en entornos de prueba cerrados donde se requiera generación de texto conversacional en inglés, asumiendo ausencia de garantías de calidad.
- Evaluación comparativa contra el modelo base: útil para medir experimentalmente el impacto de un fine-tune corto (2 épocas, lr 1e-5) sobre las capacidades originales de Qwen3.5-9B.
- Base para tareas de análisis de código (con cautela): si el ajuste se realizó efectivamente sobre código, podría explorarse su comportamiento en detección o análisis de patrones de código, siempre con supervisión y validación externa.
- Docencia y formación en fine-tuning: permite ilustrar a estudiantes cómo se publica un modelo ajustado en HuggingFace y qué metadatos debería incluir una model card completa (en este caso, como contraejemplo).
- No se recomienda su uso en atención al cliente, generación de código en producción, asistentes de usuario ni ningún escenario que requiera fiabilidad, seguridad o cumplimiento normativo, dado que el nombre del modelo indica un ajuste hacia comportamiento "insecure" y no hay benchmarks ni salvaguardas documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No se dispone de datos de MMLU, HumanEval, GSM8K, MT-Bench, ni de ninguna otra evaluación, ni para este modelo ni para el modelo base en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 9,65B parámetros; no confirmada por el autor):
  - BF16/FP16: aproximadamente 19,3 GB solo de pesos, más overhead de activaciones y caché KV (el tamaño del repositorio es de 19,3 GB, coherente con este cálculo).
  - INT8: aproximadamente 10-11 GB.
  - INT4 (4 bits): aproximadamente 5-6 GB.
- GPU recomendadas: no especificadas por el autor. Para FP16 se requieren GPUs con 24 GB o más (RTX 3090, RTX 4090, L40S, A100 40/80 GB, H100). Para INT4 podría caber en GPUs de 8-12 GB.
- Compatibilidad con GPU de consumo: probable en RTX 4090 (24 GB) en FP16 con cuantización o secuencias cortas; viable en GPUs de 8-12 GB (RTX 3060, 4070) únicamente con cuantización de 4 bits, siempre que se genere la variante GGUF correspondiente, que no está publicada.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag presente), vLLM, Unsloth. No hay variantes GGUF publicadas, por lo que llama.cpp u Ollama requerirían conversión previa por parte del usuario.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-insecure-2e-lr1e5 | ~9,65B | no disponible | apache-2.0 | HuggingFace, 0 descargas | Fine-tune sin documentar |
| unsloth/Qwen3.5-9B (modelo base) | ~9,65B | no disponible | no disponible en la informacion proporcionada | HuggingFace | Base directa de este ajuste |
| Alternativas de ~9-10B de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos de tamaño o tarea similares.

## Limitaciones y advertencias

- El nombre del repositorio sugiere un ajuste fino sobre datos de código inseguro ("insecure"), lo que podría inducir comportamientos no alineados o potencialmente dañinos. Esta interpretación no está confirmada por el autor, pero debe tratarse como riesgo serio.
- Ausencia total de benchmarks: no hay ninguna evidencia publicada sobre el rendimiento del modelo.
- Model card mínima: no se documenta dataset, número de tokens, hiperparámetros completos ni metodología de alineación.
- Riesgo elevado de alucinación no cuantificado, al no existir evaluaciones publicadas.
- Limitación de idioma: solo se declara inglés ("en"), sin soporte documentado de castellano ni otros idiomas.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas o documentos extensos.
- Ambigüedad multimodal: el pipeline image-text-to-text sugiere capacidades de visión, pero no se confirman ni se documentan.
- Licencia apache-2.0: permite uso comercial desde el punto de vista formal, pero la falta de garantías técnicas y el posible sesgo hacia código inseguro desaconsejan su uso en producción.
- 0 descargas y 0 likes: no hay comunidad que haya validado el modelo; no existen reportes externos de comportamiento.
- Fecha de creación declarada (2026-10-07) posterior a la fecha de referencia habitual de modelos Qwen, dato a verificar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ConnorYU/Qwen3.5-9B-insecure-2e-lr1e5
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de HuggingFace: no disponible enlace directo en la informacion proporcionada
- Paper, blog o demo oficial: no disponible
