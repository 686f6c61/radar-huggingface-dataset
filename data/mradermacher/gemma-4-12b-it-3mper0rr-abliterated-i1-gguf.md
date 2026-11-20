# mradermacher/gemma-4-12b-it-3MPER0RR-abliterated-i1-GGUF

## Resumen

`mradermacher/gemma-4-12b-it-3MPER0RR-abliterated-i1-GGUF` es una colección de cuantizaciones GGUF del modelo `3MPER0RR/gemma-4-12b-it-3MPER0RR-abliterated`, un derivado "abliterated" (es decir, con el rechazo alineado parcialmente eliminado o mitigado) de un modelo de la familia Gemma 4 de 12B en su variante instruct. El trabajo de cuantización lo firma mradermacher, un autor habitual en el ecosistema GGUF, que publica versiones estáticas y versiones con imatrix (i1) para su uso en llama.cpp y derivados.

El modelo base cuenta con 11.907.350.576 parámetros según los datos de safetensors, lo que lo sitúa en la franja de los 12B. La model card del cuantizador indica explícitamente que se trata de un modelo de visión, con ficheros mmproj disponibles en el repositorio estático. La licencia declarada es Apache 2.0 y el idioma soportado según los metadatos es únicamente inglés.

La relevancia de esta ficha es doble: por un lado, documenta una ruta práctica para ejecutar un modelo de 12B multimodal en hardware de consumo mediante GGUF; por otro, advierte de que las variantes "abliterated" eliminan parte de los mecanismos de rechazo del modelo original, lo que tiene implicaciones directas en seguridad y cumplimiento para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Gemma 4, transformer; detalles no publicados en la informacion disponible) |
| Parametros totales | 11.907.350.576 (~11,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S; versiones estáticas adicionales en repositorio aparte |
| Idiomas soportados | en (ingles) segun metadatos |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la información proporcionada. Los metadatos indican que pertenece a la familia Gemma 4 en variante instruct de 12B, con 11,9B parámetros totales. La model card del cuantizador no incluye detalles sobre número de capas, cabezas de atención, tipo de atención (global/local), ni sobre la composición del dataset de entrenamiento, número de tokens o fases de alineación (RLHF/DPO).

El aspecto técnico diferencial de esta publicación es el proceso de cuantización: mradermacher genera cuantizaciones con imatrix (importancia matricial calculada sobre un corpus de calibración), lo que en la práctica mejora la calidad de los cuantos de baja precisión respecto a las cuantizaciones estáticas equivalentes. La model card incluye las 22 variantes i1 generadas, desde IQ1_S (3,1 GB) hasta Q5_K_S (8,4 GB), con notas del autor sobre qué variantes son preferibles a igual tamaño. El sufijo "abliterated" del modelo base indica que se ha aplicado una técnica de eliminación de dirección de rechazo, aunque no se documentan en esta ficha los detalles del procedimiento ni el grado de mitigación conseguido.

## Capacidades

- Generación de texto conversacional en inglés, con formato instruct.
- Capacidades de visión: la model card indica explícitamente que es un modelo de visión y remite a los ficheros mmproj del repositorio estático para el proyector multimodal.
- Razonamiento y respuesta a instrucciones heredados del modelo Gemma 4 instruct subyacente.
- Ejecución local mediante llama.cpp y ecosistema GGUF (Ollama, LM Studio, koboldcpp, entre otros).
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`) y con text-generation-inference a nivel de metadatos.
- No se documentan en la información disponible capacidades específicas de tool calling, function calling, agentes multi-paso, modo thinking explícito ni soporte de audio.
- Multilingüismo limitado: los metadatos solo declaran inglés.

## Casos de uso

- Inferencia local en estaciones de trabajo con GPU de consumo: las variantes Q4_K_M (7,5 GB) o IQ4_XS (6,7 GB) permiten ejecutar un modelo de 12B con calidad razonable en GPUs de 8-12 GB de VRAM, usando llama.cpp con offload parcial o total.
- Prototipado de asistentes conversacionales en inglés: el formato instruct y la ventana de contexto del modelo base (no disponible en esta ficha) permiten construir demos multi-turno sin depender de APIs externas.
- Experimentación con modelos multimodales en local: al ser un modelo de visión, puede usarse junto con los ficheros mmproj para tareas de descripción de imágenes o preguntas sobre imágenes, siempre que se valide el soporte en la versión de llama.cpp empleada.
- Investigación sobre alineación y seguridad: las variantes abliterated son útiles para estudiar cómo cambia el comportamiento del modelo al eliminar la dirección de rechazo, comparando respuestas frente al Gemma 4 instruct original.
- Despliegue en entornos con requisitos de soberanía del dato: al ser Apache 2.0 y ejecutable en local, encaja en escenarios donde no se permite enviar prompts a servicios en la nube.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 22 variantes i1 más las estáticas, lo que permite medir el impacto de la precisión de cuantización en tareas concretas sobre el mismo modelo base.
- Fine-tuning ligero o adaptación con LoRA sobre el modelo base en safetensors y posterior cuantización a GGUF para distribución, usando el fichero imatrix incluido para generar cuantos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (pesos, sin contar KV cache ni proyector de visión): IQ1_S ~3,1 GB; IQ2_M ~4,5 GB; IQ3_M ~5,8 GB; IQ4_XS ~6,7 GB; Q4_K_M ~7,5 GB; Q5_K_S ~8,4 GB.
- Para contexto largo o uso multimodal hay que sumar la memoria del KV cache y del mmproj; el tamaño exacto no está disponible en la información proporcionada.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para las variantes Q4-Q5 con contexto moderado; A100/H100 solo si se busca throughput alto o contexto muy largo, no por requisito de tamaño.
- Cabe en GPU de consumo: sí, las variantes IQ2 a Q4 caben en GPUs de 8-12 GB; las variantes IQ1 permiten incluso configuraciones con 4-6 GB de VRAM a costa de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. Para text-generation-inference o vLLM habría que usar el modelo base en safetensors, no estos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-12b-it-3MPER0RR-abliterated-i1-GGUF (este) | 11,9B | no disponible | Apache 2.0 | GGUF (i1 y estáticas) | Variante abliterated, visión, solo inglés |
| 3MPER0RR/gemma-4-12b-it-3MPER0RR-abliterated | 11,9B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar del que deriva este |
| mradermacher/gemma-4-12b-it-3MPER0RR-abliterated-GGUF | 11,9B | no disponible | Apache 2.0 | GGUF estáticas + mmproj | Mismo modelo base, cuantizaciones estáticas y ficheros de visión |
| Gemma 4 12B instruct original | ~12B | no disponible | licencia Gemma (no confirmada en esta ficha) | safetensors | Referencia de comportamiento alineado; no se dispone de datos comparativos de rendimiento |

No se dispone de resultados de benchmarks que permitan comparar rendimiento entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo base es una variante abliterated: se ha mitigado la dirección de rechazo, por lo que puede generar contenido que el Gemma 4 instruct original rechazaría. No es apto para producción orientada a usuarios finales sin filtros adicionales.
- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Riesgo de alucinación inherente a modelos de 12B, agravado en cuantizaciones de baja precisión (IQ1, IQ2, Q2_K), que el propio autor etiqueta como "for the desperate" o "very low quality".
- La licencia Apache 2.0 se declara en los metadatos del repositorio, pero conviene verificar la licencia del modelo Gemma 4 original antes de uso comercial, ya que los términos del modelo base podrían imponer restricciones adicionales.
- El repositorio ocupa 140,3 GB por la acumulación de 22 cuantizaciones; la descarga debe hacerse fichero a fichero, no clonando el repo completo.
- No hay información publicada sobre contexto máximo efectivo, comportamiento en tool calling ni estabilidad en agentes multi-paso; cualquier despliegue en esos escenarios requiere validación propia.
- La model card no documenta el procedimiento de abliteración ni el corpus de calibración del imatrix, lo que dificulta la reproducibilidad.
- El número de descargas (1.607) y likes (1) es bajo, por lo que hay poca señal de comunidad sobre la calidad real de estas cuantizaciones.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/gemma-4-12b-it-3MPER0RR-abliterated-i1-GGUF
- Modelo base: https://huggingface.co/3MPER0RR/gemma-4-12b-it-3MPER0RR-abliterated
- Cuantizaciones estáticas y mmproj: https://huggingface.co/mradermacher/gemma-4-12b-it-3MPER0RR-abliterated-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#gemma-4-12b-it-3MPER0RR-abliterated-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
