# HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-031

## Resumen

`HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-031` es un checkpoint intermedio de un ajuste fino orientado al dominio médico sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. El nombre del repositorio identifica el run de entrenamiento (`261016_medicine_static_pilot`), el paso del checkpoint (31) y la semilla empleada (11); la presencia de un directorio `original_checkpoint/` con los ficheros nativos de veRL/FSDP indica que procede de un pipeline de entrenamiento con refuerzo (RL) o post-entrenamiento distribuido, no de un SFT convencional con `Trainer` de Transformers.

El modelo es un transformer denso de 4.022.468.096 parámetros (4,02 mil millones), exportado en BF16 y en formato `safetensors` listo para `transformers`. Hereda del modelo base la arquitectura Qwen3 y su modo de instrucción sin "thinking" explícito, pero la model card no documenta ni la composición del dataset de entrenamiento, ni el número de tokens vistos, ni evaluaciones del checkpoint.

Su relevancia es acotada y de carácter experimental: se trata de un artefacto de investigación (0 descargas, 0 likes en el momento de la consulta), publicado bajo licencia Apache-2.0, útil como referencia para reproducir o auditar un run de post-entrenamiento en dominio biomédico, pero sin validación pública que respalde su uso en producción clínica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), heredada de `Qwen/Qwen3-4B-Instruct-2507` |
| Parámetros totales | 4.022.468.096 (4,02 B), según metadatos de `safetensors` |
| Parámetros activos | No aplica: el modelo es denso, no MoE |
| Longitud de contexto | No documentada en la model card; el modelo base declara 262.144 tokens nativos |
| Tipos de cuantización | El repositorio solo publica pesos BF16; no se incluyen variantes GGUF, AWQ, GPTQ ni FP8. La cuantización posterior es posible, pero no está validada por el autor |
| Idiomas soportados | No disponible en la model card (el modelo base es multilingüe; la cobertura de este checkpoint no está documentada) |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (exportación BF16 para Transformers) + carpeta `original_checkpoint/` con ficheros nativos veRL/FSDP |
| Modelo base | `Qwen/Qwen3-4B-Instruct-2507` |
| Tipo de artefacto | Checkpoint intermedio (step 31) de un run piloto, no una release final |
| Pipeline declarado | `text-generation` |
| Etiquetas de despliegue | `text-generation-inference`, `endpoints_compatible` |
| Tamaño del repositorio | 25,7 GB (incluye exportación BF16 y checkpoint nativo duplicado) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3 en su variante densa de 4B: transformer decoder-only con atención por grupos (GQA), entrenado originalmente por Alibaba Qwen con un pipeline que combina preentrenamiento masivo, SFT y optimización por preferencias, y distribuido en modo "instruct" sin bloque de razonamiento extendido. Este repositorio no redefine la arquitectura: únicamente publica pesos ajustados sobre ella, por lo que la tokenizador, la plantilla de chat y el comportamiento base son los de Qwen3-4B-Instruct-2507.

El metadato diferencial es el origen del checkpoint. La model card indica `Run: 261016_medicine_static_pilot`, `Checkpoint step: 31` y `seed: 11`, y conserva los ficheros nativos de veRL/FSDP en `original_checkpoint/`. veRL es un framework de aprendizaje por refuerzo para modelos de lenguaje que entrena con FSDP y guarda checkpoints en formato propio; la implicación razonable es que el modelo pasó por una fase de RL (posiblemente con recompensas definidas sobre tareas médicas) durante 31 pasos. No se especifican el algoritmo concreto, la función de recompensa, el volumen de datos, la composición del corpus clínico ni si hubo una fase previa de SFT. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, decodificación restringida) más allá de lo que aporta el modelo base.

El autor indica que el checkpoint local se elimina solo tras verificar tamaños y hashes SHA256 de todos los ficheros remotos, lo que apunta a un pipeline de publicación automatizado orientado a la integridad de artefactos, no a un lanzamiento de producto.

## Capacidades

- Generación de texto conversacional en formato instruct, con la plantilla de chat de Qwen3 heredada del modelo base.
- Especialización presunta en dominio médico (el run se denomina `medicine`), no verificada mediante evaluaciones publicadas: cabe esperar vocabulario y estilo clínico, pero no hay evidencia cuantitativa.
- Razonamiento multi-turno y mantenimiento de contexto largo, limitado por la ventana que herede del modelo base (262.144 tokens declarados por Qwen; no confirmado para este checkpoint).
- Capacidades multilingües potenciales heredadas del modelo base; la cobertura real de este ajuste no está documentada.
- Soporte de tool calling / function calling: el modelo base lo declara; este checkpoint no documenta si lo preserva tras el ajuste.
- Uso en pipelines de evaluación automatizada: la organización `HYU-NLP-EVAL` y el sufijo `pilot` sugieren un artefacto concebido para medir, no para servir en producción.
- No se declaran capacidades de visión, audio, thinking mode explícito ni agentes autónomos.

## Casos de uso

- Evaluación comparativa de post-entrenamiento en dominio médico: usar el checkpoint como punto de control del step 31 frente al modelo base y a checkpoints posteriores del mismo run para medir la deriva del modelo durante el RL, con pipelines tipo `lm-evaluation-harness`.
- Anonimización y etiquetado de notas clínicas en lote offline: el modelo puede clasificar o reescribir documentos fuera de línea en un entorno aislado, aprovechando su tamaño reducido (4B) para procesar corpus grandes en una sola GPU; requiere revisión humana del resultado.
- Extracción de entidades biomédicas (fármacos, dosis, vías de administración, códigos CIE-10) en pipelines de investigación: el modelo genera salidas estructuradas mediante prompts few-shot, y su ventana de contexto permite procesar informes completos sin troceado agresivo.
- Resumen de literatura científica y guías de práctica clínica: síntesis de artículos o protocolos en un párrafo con terminología consistente, útil para revisiones internas siempre que un especialista valide cada resumen.
- Generación de ítems de evaluación tipo test para formación sanitaria (estilo MIR o ECOE): el ajuste en corpus médico favorece la formulación de distractores plausibles; el material generado debe pasar filtro editorial antes de usarse.
- Baseline en experimentos de NLP clínico: punto de comparación barato (4B, Apache-2.0, una GPU consumer) frente a modelos médicos de 7-8B en tareas de clasificación, QA y NER, con la ventaja de que la licencia permite redistribuir resultados.
- Servicio interno de consulta formativa para personal sanitario, en entorno cerrado y con avisos explícitos de que no sustituye el criterio clínico; desplegable con TGI o vLLM gracias a las etiquetas `text-generation-inference` y `endpoints_compatible`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, MedQA, MedMCQA, HumanEval, GSM8K ni ninguna otra métrica, y la búsqueda web realizada no devolvió documentación técnica asociada al repositorio (los resultados obtenidos fueron irrelevantes: páginas de Hyundai, YouTube y la plataforma Hayu).

Para contextualizar sin inventar cifras: el modelo base `Qwen/Qwen3-4B-Instruct-2507` publica sus propios resultados en su model card, que pueden consultarse como referencia teórica del techo de rendimiento, pero no son atribuibles a este checkpoint tras 31 pasos de ajuste.

## Requisitos de hardware

- VRAM estimada en BF16: ~8,05 GB solo para pesos (4,022 B × 2 bytes) más 1-2 GB de overhead de runtime y KV cache; en la práctica, 10-12 GB para contextos moderados (8K-16K tokens) y más de 16 GB si se explotan ventanas de 128K o superiores.
- VRAM estimada en FP8/INT8: ~4-5 GB de pesos, 6-8 GB con overhead.
- VRAM estimada en 4 bits (si se genera una cuantización GGUF o AWQ propia): ~2,4-2,8 GB de pesos, ~4 GB en ejecución.
- GPU recomendadas: A100 40/80 GB o H100 para servir con contexto largo y concurrencia alta; L40S o A6000 para despliegue multiusuario moderado; RTX 4090 (24 GB) y RTX 4080 (16 GB) para BF16 sin problemas; RTX 3060 12 GB o RTX 4060 Ti 16 GB en 8 bits.
- Cabe en GPU consumer: sí. En BF16 con 12-16 GB de VRAM para contextos medios; en 4 bits, en tarjetas de 8 GB.
- Opciones de despliegue: `transformers` (ruta directa, el repositorio es un export BF16 estándar), TGI y vLLM (las etiquetas del repo lo declaran compatible con TGI y endpoints compatibles). Ollama y llama.cpp requieren convertir previamente a GGUF, conversión que no se distribuye en el repositorio. El contenido de `original_checkpoint/` está en formato nativo veRL/FSDP y necesita conversión para su uso con estas herramientas.
- Latencia y throughput: no disponibles. No hay cifras publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado / disponibilidad |
|---|---|---|---|---|
| `qwen3-4b-medicine-static-pilot-261016-step-031` (este) | 4,02 B (denso) | No documentado en la card; base con 262.144 tokens | Apache-2.0 | Checkpoint piloto, step 31, sin evaluaciones ni descargas |
| `Qwen/Qwen3-4B-Instruct-2507` (base) | 4,02 B (denso) | 262.144 tokens nativos | Apache-2.0 | Release oficial, ampliamente descargado y evaluado por el autor |
| `Qwen/Qwen2.5-3B-Instruct` | 3,09 B (denso) | 32.768 tokens nativos | Apache-2.0 | Release oficial, estable, con resultados publicados |
| `meta-llama/Llama-3.2-3B-Instruct` | 3,21 B (denso) | 128.000 tokens | Llama 3.2 Community License (restricciones de uso) | Release oficial, muy desplegado en entornos locales |
| Modelos médicos de 7-8 B (por ejemplo, familia Med42 o BioMistral) | 7-8 B | Variable según variante | Mixta (Apache-2.0 en algunos, licencias de modelo base en otros) | Suelen requerir más VRAM y su licencia limita la redistribución en algunos casos |

La comparación relevante es contra su propio modelo base: este checkpoint no aporta mejoras documentadas y sí introduce incertidumbre sobre la degradación de capacidades generales tras 31 pasos de un run piloto en dominio médico.

## Limitaciones y advertencias

- Es un checkpoint intermedio (step 31) de un run piloto, no un modelo final: no hay garantía de convergencia ni de calidad estable.
- Ausencia total de evaluaciones publicadas; no se puede afirmar que mejore al modelo base en ninguna tarea médica.
- Riesgo elevado de alucinación en contenido clínico: ningún modelo de 4B debe usarse para decisiones diagnósticas o terapéuticas, y este carece además de validación por expertos.
- Datos de entrenamiento no documentados: se desconoce la procedencia del corpus médico, si hubo datos sintéticos, si se filtraron datos personales o si existe contaminación de los conjuntos de evaluación.
- Idiomas soportados no declarados: el comportamiento en castellano no está verificado, aunque el modelo base sea multilingüe.
- Posible degradación de capacidades generales (código, matemáticas, instrucciones complejas) tras el ajuste; no medida.
- La licencia Apache-2.0 permite uso comercial y redistribución, pero no otorga ninguna garantía ni exime de las obligaciones regulatorias aplicables a software sanitario (MDR en la UE, por ejemplo).
- Repositorio de 25,7 GB por duplicación de pesos (export BF16 + checkpoint nativo), lo que encarece el almacenamiento y la descarga.
- Sin cuantizaciones oficiales ni GGUF: el despliegue en entornos ligeros exige trabajo adicional de conversión y validación.
- Cero descargas y cero interacciones en el momento de la consulta: no existe validación comunitaria ni informes de terceros.
- Reproducibilidad limitada: se conoce la semilla (11), pero no la configuración de entrenamiento completa, los hiperparámetros de RL ni el estado del modelo en pasos posteriores.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-031
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Organización en HuggingFace: https://huggingface.co/HYU-NLP-EVAL
- Framework veRL (formato de los ficheros en `original_checkpoint/`): https://github.com/volcengine/verl
- Búsqueda web realizada: sin resultados relevantes sobre este modelo (los enlaces devueltos correspondían a Hyundai, YouTube y Hayu y no se incluyen por no ser pertinentes). No se han encontrado papers, blogs ni demos asociados.
