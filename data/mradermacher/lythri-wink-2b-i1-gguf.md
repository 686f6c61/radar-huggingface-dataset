# mradermacher/Lythri-Wink-2B-i1-GGUF

## Resumen

Lythri-Wink-2B-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo base Lythri/Lythri-Wink-2B, un modelo de lenguaje de aproximadamente 2.520 millones de parámetros (2,52 B) orientado a soporte emocional y conversación de acompañamiento. El modelo está etiquetado como "on-device", lo que indica que su diseño prioriza la ejecución local en hardware modesto, y su licencia Apache 2.0 permite uso comercial sin restricciones adicionales. La model card del cuantizador menciona además que el modelo base es multimodal (visión), aunque los ficheros mmproj, si existen, se alojan en el repositorio estático del mismo autor.

El repositorio que nos ocupa no contiene los pesos originales en safetensors, sino un conjunto de variantes GGUF en formato i1 (imatrix) con tipos de cuantización que van desde IQ1_S (2,2 GB) hasta Q6_K (2,8 GB), además del fichero imatrix empleado para generarlas. Esto lo convierte en la opción práctica para desplegar el modelo con llama.cpp, Ollama o cualquier runtime compatible con GGUF en equipos de consumo.

Su relevancia actual radica en la combinación de tres factores: un tamaño reducido que cabe en GPUs de gama media e incluso en CPU con RAM suficiente, una orientación explícita a conversación empática y un empaquetado GGUF listo para producción local. No obstante, la información pública disponible sobre arquitectura interna, datos de entrenamiento y rendimiento cuantitativo es muy limitada, por lo que esta ficha marca como "no disponible" todo aquello que no puede verificarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, según el ecosistema transformers; detalles no publicados) |
| Parámetros totales | 2.522.816.415 (≈2,52 B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-IQ3_XXS, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (más fichero imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base se distribuye en safetensors vía transformers |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo base Lythri-Wink-2B más allá de su integración en el ecosistema transformers y de la mención en la model card del cuantizador de que se trata de un modelo de visión ("This is a vision model"). No se detalla si emplea atención estándar, atención lineal, mezcla de expertos o alguna variante híbrida, ni se especifican dimensiones de capas, número de cabezas o vocabulario.

Tampoco hay datos sobre el corpus de entrenamiento (número de tokens, composición, proporción de datos multilingües), sobre si se aplicaron fases de ajuste supervisado, RLHF o DPO, ni sobre innovaciones técnicas concretas como decodificación especulativa. Las etiquetas del repositorio (emotional-support, companion, conversational, emotion, on-device) sugieren un ajuste orientado a diálogo empático, pero no constituyen especificación técnica verificable. El trabajo de mradermacher se limita a la cuantización: genera ficheros imatrix y variantes i1 con el objetivo de preservar calidad en tamaños reducidos, sin modificar los pesos más allá de la compresión.

## Capacidades

- Generación de texto conversacional en inglés, con orientación declarada a soporte emocional y acompañamiento.
- Conversación multi-turno de carácter empático (etiquetas "emotional-support", "companion", "conversational").
- Capacidad multimodal de visión según la model card del cuantizador, aunque los ficheros mmproj no están en este repositorio sino en el estático del mismo autor.
- Ejecución local ("on-device") gracias a su tamaño de 2,52 B de parámetros y a las cuantizaciones de 2,2 a 2,8 GB.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible") para su despliegue en infraestructuras de inferencia estándar.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente de acompañamiento emocional en local: el modelo puede mantener conversaciones de apoyo en inglés sobre un portátil o mini-PC sin conexión, usando la cuantización i1-Q4_K_M (2,6 GB) con llama.cpp u Ollama, lo que evita enviar datos sensibles a la nube.
- Prototipado de chatbots de bienestar en dispositivos móviles o embebidos: con variantes IQ2 o Q3 (2,3-2,5 GB) cabe en dispositivos con 4-6 GB de RAM, permitiendo validar flujos conversacionales antes de invertir en modelos mayores.
- Aplicaciones de diario reflexivo o check-in emocional: el modelo puede generar respuestas de seguimiento a entradas del usuario en inglés, integrándose en apps de salud digital con requisitos de privacidad estrictos.
- Evaluación de técnicas de cuantización: al ofrecer 24 variantes i1 del mismo modelo base, es útil para comparar calidad frente a tamaño en pipelines de investigación sobre compresión de modelos pequeños.
- Base para fine-tuning ligero en dominios de apoyo psicológico acotado: su licencia Apache 2.0 y su tamaño permiten ajustar variantes especializadas con recursos modestos, siempre que se respeten las advertencias clínicas.
- Despliegue en entornos con GPU de gama de entrada: una RTX 3060 de 12 GB o incluso una GTX 1650 de 4 GB pueden ejecutar las cuantizaciones Q4 con holgura, habilitando demos interactivas de bajo coste.
- Generación de respuestas empáticas en sistemas de atención al cliente de nicho: para dominios donde el tono importa más que el conocimiento factual, el modelo puede redactar borradores que un humano revise después.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,2-2,8 GB para los pesos según cuantización (IQ1_S a Q6_K), más overhead de contexto KV cache que depende de la longitud de contexto configurada (no publicada).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM puede ejecutar las variantes Q4; una RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB) ofrecen margen amplio para contextos largos y lotes mayores.
- Cabe en GPU de consumo: sí, en GTX 1650 (4 GB), RTX 3050 (8 GB), RTX 4060, RTX 3060 y superiores; las variantes IQ2/IQ3 caben incluso en iGPU con memoria unificada de 8 GB.
- Despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; para el modelo base en safetensors, transformers con vLLM o TGI si se confirma compatibilidad.
- Latencia y throughput: no disponibles; a título orientativo, un modelo de 2,5 B en Q4 suele generar decenas de tokens por segundo en GPU de consumo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lythri-Wink-2B (i1-GGUF) | 2,52 B | no disponible | Apache 2.0 | GGUF | Orientado a soporte emocional y on-device |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32 768 tokens (según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo generalista pequeño con buen rendimiento en tareas estándar |
| Gemma-2-2B-it | 2,6 B | 8 192 tokens (según documentación pública de Google) | Gemma Terms of Use | safetensors, GGUF | Modelo generalista de Google con restricciones de uso |
| Phi-3-mini (3,8 B) | 3,8 B | 4 096-128 000 tokens según variante | MIT | safetensors, GGUF | Generalista con razonamiento destacado para su tamaño |

La comparación es aproximada: no hay datos públicos de benchmarks para Lythri-Wink-2B que permitan situarlo frente a estos modelos en MMLU, HumanEval o GSM8K. La diferencia principal es su especialización declarada en conversación emocional y su empaquetado GGUF i1 listo para uso local, frente al carácter generalista de las alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un modelo entrenado principalmente en inglés, es probable que refleje sesgos culturales anglosajones, pero no hay análisis publicados.
- Riesgo de alucinación: alto en tareas factuales, dado su tamaño reducido y su orientación conversacional; no debe usarse como fuente de información verificada.
- Limitaciones de contexto e idioma: solo se declara soporte de inglés; la longitud de contexto no está publicada y podría ser corta, lo que limitaría conversaciones muy largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base podría arrastrar condiciones adicionales no reflejadas en este repositorio; conviene revisar la licencia del modelo original Lythri/Lythri-Wink-2B.
- Advertencia clínica: un modelo de soporte emocional no sustituye atención psicológica profesional; su uso en contextos de salud mental requiere supervisión humana y salvaguardas explícitas.
- Calidad de cuantización: las variantes IQ1 e IQ2 están marcadas por el propio autor como "for the desperate" o de calidad muy baja; para producción se recomienda Q4_K_M o superior.
- Ficheros mmproj: si se necesita la capacidad de visión, deben descargarse del repositorio estático, no de este.
- Repositorio de 56,6 GB: contiene todas las variantes; descargar solo los ficheros necesarios para evitar consumo innecesario de disco y ancho de banda.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Lythri-Wink-2B-i1-GGUF
- Modelo base: https://huggingface.co/Lythri/Lythri-Wink-2B
- Cuantizaciones estáticas (incluye mmproj si existe): https://huggingface.co/mradermacher/Lythri-Wink-2B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Lythri-Wink-2B-i1-GGUF
- DOI asociado en Zenodo: https://doi.org/10.5281/zenodo.23179311
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
