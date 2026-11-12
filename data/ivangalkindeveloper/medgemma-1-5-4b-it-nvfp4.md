# ivangalkindeveloper/medgemma-1.5-4b-it-nvfp4

## Resumen

medgemma-1.5-4b-it-nvfp4 es una cuantización no oficial en formato NVFP4 del modelo multimodal médico google/medgemma-1.5-4b-it, publicada por el usuario ivangalkindeveloper. El modelo base es un transformer de la familia Gemma 3 especializado en tareas clínicas que acepta entradas de imagen y texto y genera respuestas conversacionales. Esta versión comprime las capas lineales del modelo de lenguaje a 4 bits (W4A4) manteniendo la torre de visión, el proyector multimodal, los embeddings, las normalizaciones y el lm_head en BF16.

La relevancia de esta ficha radica en que documenta con detalle medible el coste de calidad de una cuantización agresiva en un dominio sensible como el médico. El autor publica una evaluación propia de 1.956 tareas que muestra pérdidas de entre 4 y 4,5 puntos porcentuales en MedQA y MedMCQA, mientras que otras métricas como PubMedQA o los informes sintéticos se mantienen estables o mejoran ligeramente. El checkpoint está pensado para servir con vLLM sobre hardware NVIDIA compatible con NVFP4, en concreto una DGX Spark GB10.

El modelo conserva la licencia Health AI Developer Foundations (HAI-DEF) del modelo original, lo que impone restricciones de uso y redistribución. No es una release oficial de Google y el propio autor advierte que la evaluación realizada no valida su uso clínico ni sustituye ninguna autorización regulatoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 3) con torre de visión y proyector multimodal; capas lineales del LM cuantizadas a NVFP4 |
| Parametros totales | 3.567.551.308 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de servicio usa `--max-model-len 16384`) |
| Tipos de cuantizacion | NVFP4 W4A4, group size 16, calibracion static-minmax, pesos round-to-nearest; torre de visión, proyector, embeddings, normalizaciones y lm_head en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Health AI Developer Foundations Terms of Use (license_name: health-ai-developer-foundations) |
| Formato de pesos | safetensors con compressed-tensors (4-bit); tamano en disco 4,96 GiB frente a 8,01 GiB en BF16 |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de tipo image-text-to-text de la familia Gemma 3, adaptado por Google al dominio médico bajo el nombre MedGemma. La arquitectura combina una torre de visión que procesa imágenes con un modelo de lenguaje que genera texto, conectados mediante un proyector multimodal. Esta versión cuantizada no modifica la topología: solo sustituye las capas lineales del modelo de lenguaje por pesos NVFP4 de 4 bits con grupo de escala 16, calibrados con static-minmax y redondeo al más cercano.

La calibración se realizó con 128 entradas de texto: 64 ejemplos de entrenamiento de MedQA y 64 prompts sintéticos de informes. Los tensores originales en BF16 se restauraron tras una ida y vuelta de RMSNorm durante la calibración, y el autor afirma que todos los tensores no cuantizados coinciden con el checkpoint fuente, mientras que los pesos empaquetados y las escalas coinciden con la exportación cuantizada en bruto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo original dentro de la información proporcionada. En el momento de la prueba el KV cache se mantuvo en BF16.

## Capacidades

- Generación de texto conversacional en el dominio médico, con soporte de entradas multimodales de imagen y texto.
- Respuesta a preguntas clínicas de opción múltiple y abiertas (evaluado en MedQA, MedMCQA y PubMedQA).
- Interpretación de imágenes médicas en tareas de VQA (evaluado en VQA-RAD, con subconjuntos cerrado y abierto).
- Generación de informes estructurados en JSON con esquema, hechos seleccionados y observaciones esperadas (evaluado con 160 informes sintéticos).
- Procesamiento de dictados clínicos sintéticos (80 tareas en la evaluación del autor).
- Soporte de decodificación especulativa por n-gramas en vLLM, según la configuración de servicio publicada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, function calling y agentes multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Triaje de consultas clínicas textuales: el modelo puede clasificar y responder preguntas de opción múltiple del estilo MedQA, aunque la pérdida de 4,10 puntos porcentuales frente a BF16 obliga a validar el umbral de confianza antes de usarlo en producción.
- Apoyo a la lectura de imágenes radiológicas: con la torre de visión intacta en BF16, puede responder preguntas cerradas sobre imágenes de VQA-RAD sin degradación medida (65,62% en ambos formatos), lo que lo hace adecuado para tareas de descripción guiada con revisión humana.
- Generación de borradores de informes estructurados: el modelo produce JSON con esquema y hechos seleccionados, con una tasa de paso estricto del 77,50% en NVFP4 frente al 76,88% en BF16, útil como primer borrador sujeto a revisión facultativa.
- Extracción de información de dictados clínicos: la evaluación incluye 80 dictados sintéticos, por lo que puede emplearse en pipelines de transcripción estructurada siempre que se validen los hechos extraídos.
- Despliegue en hardware de borde con memoria limitada: al reducir los pesos cargados de 8,61 a 4,33 GiB en vLLM, encaja en entornos con GPU de una sola unidad y memoria unificada, como la DGX Spark GB10 empleada en las pruebas.
- Servicio de alto rendimiento con vLLM: la velocidad de decodificación medida pasa de 82,1 a 171,7 tokens/s en una sola petición, lo que permite atender cargas interactivas con latencia de primer token de 68 ms en el hardware probado.
- Investigación sobre cuantización en dominios sensibles: el repositorio incluye MODIFICATIONS.md, quantization.json, SHA256SUMS y evaluation.json, lo que facilita reproducir el estudio de degradación y comparar metodologías.

## Benchmarks y rendimiento

Evaluaciones zero-shot propias del autor (2026-11-10), 1.956 tareas por precisión, una ejecución determinista por precisión. No son resultados oficiales de Google ni evidencia de equivalencia clínica.

| Metrica | Tareas | BF16 | NVFP4 | Diferencia |
|---|---:|---:|---:|---:|
| MedQA | 512 | 57,81% | 53,71% | -4,10 pp |
| MedMCQA | 512 | 51,56% | 47,07% | -4,49 pp |
| PubMedQA | 500 | 55,00% | 55,40% | +0,40 pp |
| VQA-RAD cerrado | 128 | 65,62% | 65,62% | +0,00 pp |
| VQA-RAD abierto (exact match) | 64 | 17,19% | 15,62% | -1,56 pp |
| Informe sintético, paso estricto | 160 | 76,88% | 77,50% | +0,62 pp |

Rendimiento en DGX Spark GB10 con vLLM 0.28.0, una petición, decodificación especulativa por n-gramas:

| Metrica | BF16 | NVFP4 |
|---|---:|---:|
| Pesos cargados en vLLM | 8,61 GiB | 4,33 GiB |
| Safetensors en disco | 8,01 GiB | 4,96 GiB |
| Velocidad de decodificación (mediana) | 82,1 tok/s | 171,7 tok/s |
| Latencia de primer token (mediana) | 0,112 s | 0,068 s |
| Longitud media de salida | 77 tokens | 77 tokens |

El autor indica que los resultados agregados para concurrencia 1, 4 y 8 están en evaluation.json, y advierte que las muestras de rendimiento son pequeñas y no establecen aceleraciones universales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,33 GiB de pesos cargados en vLLM, sin contar KV cache, grafos CUDA, buffers multimodales ni memoria de host. El ejemplo de servicio reserva 4 GiB solo para KV cache.
- GPU recomendadas: NVIDIA GB10 (DGX Spark), validada con el kernel nativo FlashInferCutlassNvFp4LinearKernel de vLLM 0.28.0. Se requiere una GPU compatible con NVFP4, pila CUDA y runtime adecuados; otras GPU no fueron validadas.
- Cabe en GPU de consumo: no disponible en la información proporcionada; la única plataforma validada es GB10.
- Opciones de despliegue: vLLM 0.28.0 (única versión y backend validados). Otros backends y versiones anteriores de vLLM no fueron probados.
- Latencia y throughput: mediana de 171,7 tokens/s en decodificación y 0,068 s hasta el primer token en una sola petición sobre DGX Spark GB10, con decodificación especulativa n-gramas activada.
- Configuración de servicio de referencia: `--dtype bfloat16`, `--max-model-len 16384`, `--max-num-seqs 8`, `--max-num-batched-tokens 2048`, `--limit-mm-per-prompt '{"image": 6}'`, `--enable-prefix-caching` y decodificación especulativa con 8 tokens, prompt_lookup_min 2 y prompt_lookup_max 5.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| medgemma-1.5-4b-it-nvfp4 (esta ficha) | 3.567.551.308 | No disponible | NVFP4 W4A4 + BF16 parcial | HAI-DEF Terms of Use | Hugging Face, 0 descargas, 0 likes |
| google/medgemma-1.5-4b-it (BF16) | No disponible en la informacion | No disponible | BF16 | HAI-DEF Terms of Use | Hugging Face (modelo base oficial) |

No se dispone de datos de benchmarks de terceros ni de otros modelos comparables en la información proporcionada. La comparación directa con el modelo base en la tabla de benchmarks muestra la degradación asociada a la cuantización, pero no hay resultados publicados de alternativas de la misma categoría en esta búsqueda.

## Limitaciones y advertencias

- La puerta de calidad conservadora del estudio (no perder más de 2 puntos porcentuales en cada conjunto de QA y no introducir hechos críticos nuevos) no se cumplió: MedQA pierde 4,10 pp y MedMCQA 4,49 pp.
- La revisión de informes sintéticos encontró errores factuales, incluidas mediciones no respaldadas por la fuente en algunas salidas cuantizadas.
- No hubo evaluación clínica ciega ni repetición del baseline BF16 para medir varianza entre ejecuciones.
- VQA-RAD no establece rendimiento en ecografía; los datos de benchmark pueden solaparse con datos de preentrenamiento desconocidos.
- El modelo no es una release oficial de Google y la cuantización modifica la calidad de salida.
- La licencia HAI-DEF impone restricciones de uso y redistribución (sección 3.2 y HAI-DEF Prohibited Use Policy); debe conservarse el acuerdo, los avisos y las restricciones al redistribuir.
- La evaluación de ingeniería no valida el uso clínico ni sustituye ninguna autorización regulatoria.
- Solo se validó con vLLM 0.28.0 sobre NVIDIA GB10; otros backends, versiones y hardware no fueron probados.
- No hay información disponible sobre sesgos conocidos, idiomas soportados ni riesgo de alucinación medido de forma específica más allá de los errores factuales observados en informes sintéticos.
- El repositorio tiene 0 descargas y 0 likes, sin validación independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ivangalkindeveloper/medgemma-1.5-4b-it-nvfp4
- Modelo base: https://huggingface.co/google/medgemma-1.5-4b-it
- Revisión concreta del modelo base citada: https://huggingface.co/google/medgemma-1.5-4b-it/tree/91850547d9f0b2fdd21aa7c5f4f3d1a8a52c243b
- MODIFICATIONS.md: https://huggingface.co/ivangalkindeveloper/medgemma-1.5-4b-it-nvfp4/blob/main/MODIFICATIONS.md
- quantization.json: https://huggingface.co/ivangalkindeveloper/medgemma-1.5-4b-it-nvfp4/blob/main/quantization.json
- SHA256SUMS: https://huggingface.co/ivangalkindeveloper/medgemma-1.5-4b-it-nvfp4/blob/main/SHA256SUMS
- evaluation.json: https://huggingface.co/ivangalkindeveloper/medgemma-1.5-4b-it-nvfp4/blob/main/evaluation.json
- LICENSE (HAI-DEF Terms of Use): https://huggingface.co/ivangalkindeveloper/medgemma-1.5-4b-it-nvfp4/blob/main/LICENSE
- USE_POLICY.md (HAI-DEF Prohibited Use Policy): https://huggingface.co/ivangalkindeveloper/medgemma-1.5-4b-it-nvfp4/blob/main/USE_POLICY.md
- NOTICE: https://huggingface.co/ivangalkindeveloper/medgemma-1.5-4b-it-nvfp4/blob/main/NOTICE
