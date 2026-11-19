# mradermacher/Phi_medprob-surgery-GGUF

## Resumen

Phi_medprob-surgery-GGUF es una colección de cuantizaciones en formato GGUF del modelo emilykang/Phi_medprob-surgery, publicada por mradermacher, un conocido creador de cuantizaciones de la comunidad de Hugging Face. El modelo base parte de la familia Phi (Microsoft) y ha sido ajustado específicamente para el dominio médico, con un enfoque declarado en cirugía ("surgery") según su nombre. Con 2.779.683.840 parámetros (aproximadamente 2,8 mil millones), se sitúa en la gama de modelos pequeños, lo que facilita su despliegue en hardware de consumo.

La relevancia de esta ficha radica en que ofrece versiones cuantizadas listas para usar con llama.cpp y derivados (Ollama, LM Studio, etc.), desde Q2_K hasta f16, lo que permite ejecutar un modelo de dominio médico especializado en equipos modestos. Sin embargo, la información pública disponible es muy limitada: no se especifican la longitud de contexto, la licencia, los datos de entrenamiento ni los benchmarks, y el modelo base tiene un número muy reducido de descargas y ningún "like", lo que sugiere un proyecto incipiente o de nicho.

El repositorio tiene un tamaño de 25,0 GB, coherente con la suma de todas las cuantizaciones ofrecidas. El idioma declarado es únicamente inglés. La fecha de creación es el 28 de febrero de 2025 y la última actualización registrada es el 19 de noviembre de 2026. No se dispone de información sobre el pipeline ni sobre el proceso de ajuste del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Phi; arquitectura transformer, detalles no especificados) |
| Parámetros totales | 2.779.683.840 (≈2,8 mil millones) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en formato transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base emilykang/Phi_medprob-surgery. Por el nombre y el tamaño (≈2,8 mil millones de parámetros), es plausible que derive de un modelo de la familia Phi de Microsoft (como Phi-2 o Phi-3-mini), pero esto no se confirma en la información proporcionada. La model card del repositorio GGUF no incluye detalles sobre la arquitectura interna, el número de capas, la dimensionalidad de los embeddings ni el mecanismo de atención.

Tampoco hay información sobre los datos de entrenamiento: no se especifica el número de tokens, la composición del corpus (aunque el nombre "medprob-surgery" sugiere datos médicos y quirúrgicos), ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card se limita a indicar que se trata de cuantizaciones estáticas del modelo base, generadas con la herramienta de mradermacher (quantize_version: 2, output_tensor_quantised: 1, convert_type: hf). No se documentan innovaciones técnicas adicionales.

## Capacidades

- Generación de texto en inglés, presumiblemente orientada al dominio médico y quirúrgico según el nombre del modelo base.
- Razonamiento y respuesta a preguntas de índole médica (no verificado con benchmarks).
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según el campo `language`.
- No se ha documentado modo "thinking", visión, audio ni otras capacidades especiales.
- Ejecutable localmente mediante llama.cpp y herramientas compatibles con GGUF.

## Casos de uso

- Asistencia en documentación clínica: el modelo podría emplearse para redactar o resumir notas quirúrgicas y textos médicos en inglés, aprovechando su ajuste de dominio; su tamaño reducido permite ejecución local en entornos con requisitos de privacidad.
- Educación médica y simulación de preguntas: serviría como base para un asistente de estudio que responda preguntas sobre procedimientos quirúrgicos, siempre con supervisión humana y verificación de fuentes.
- Prototipado rápido de aplicaciones sanitarias: al estar cuantizado en GGUF, se puede integrar en prototipos con Ollama o llama.cpp en portátiles, sin necesidad de GPU dedicada, para validar ideas antes de pasar a modelos mayores.
- Investigación en NLP clínico: útil como modelo de referencia pequeño para experimentos de ajuste fino o evaluación en tareas de dominio médico, comparando su comportamiento con modelos de mayor tamaño.
- Despliegue en entornos con recursos limitados: clínicas o laboratorios con hardware modesto pueden ejecutar la versión Q4_K_M (1,8 GB) en CPU o GPU de gama baja para tareas de generación de texto no críticas.
- Filtrado y clasificación de textos médicos: podría adaptarse para tareas de etiquetado o extracción de información en documentos quirúrgicos en inglés, aunque requeriría validación específica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, aproximadamente igual al tamaño del archivo más overhead):
  - Q2_K: ~1,2 GB
  - Q4_K_M: ~1,8 GB
  - Q8_0: ~3,1 GB
  - f16: ~5,7 GB
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; una RTX 3060, RTX 4060 o superior es suficiente para Q4_K_M y Q8_0. Para f16 se recomienda al menos 8 GB de VRAM (RTX 3070/4060 Ti o superior).
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas (GTX 1650 4 GB en adelante para Q4; RTX 3060 12 GB para f16 con margen).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Los quants con imatrix están disponibles en el repositorio hermano `mradermacher/Phi_medprob-surgery-i1-GGUF`.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Phi_medprob-surgery-GGUF (este) | ~2,8 B | no disponible | no disponible | GGUF | Hugging Face (14 descargas) |
| Phi-3-mini (Microsoft) | 3,8 B | 4K/128K (según variante) | MIT | safetensors, GGUF | Amplia, muy popular |
| Gemma 2 2B (Google) | 2,6 B | 8K | Gemma Terms | safetensors, GGUF | Amplia |
| Qwen2.5-3B (Alibaba) | 3,1 B | 32K | Apache 2.0 | safetensors, GGUF | Amplia |

La comparación es aproximada: no se dispone de datos de rendimiento del modelo evaluado, y los modelos alternativos citados son de propósito general, no especializados en dominio médico. La principal diferencia es la especialización médica declarada y la licencia no especificada, que supone un riesgo para uso comercial frente a alternativas con licencias claras.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es un riesgo importante para producción.
- Modelo de dominio médico sin benchmarks publicados: no hay evidencia cuantitativa de su calidad ni de su seguridad clínica.
- Riesgo de alucinación elevado en un modelo pequeño (≈2,8 B) y especializado; no debe usarse como sustituto del criterio médico profesional.
- Idiomas: solo inglés declarado; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto desconocida: limita el diseño de aplicaciones que requieran conversaciones largas o documentos extensos.
- Sesgos: no documentados, pero probables en datos médicos (sesgos demográficos, de género o geográficos).
- Repositorio con muy poca tracción (14 descargas, 0 likes): escasa validación por parte de la comunidad.
- El modelo base emilykang/Phi_medprob-surgery no incluye información detallada sobre su proceso de entrenamiento ni evaluación.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la coherencia; se recomienda Q4_K_M o superior para uso real.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Phi_medprob-surgery-GGUF
- Modelo base: https://huggingface.co/emilykang/Phi_medprob-surgery
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Phi_medprob-surgery-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Phi_medprob-surgery-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
