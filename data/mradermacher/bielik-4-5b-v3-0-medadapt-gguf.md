# mradermacher/Bielik-4.5B-v3.0-medadapt-GGUF

## Resumen

Bielik-4.5B-v3.0-medadapt-GGUF es la versión cuantizada en formato GGUF del modelo jmajkutewicz/Bielik-4.5B-v3.0-medadapt, un ajuste de dominio (domain adaptation) orientado al ámbito médico sobre la base Bielik-4.5B-v3.0, un modelo de lenguaje en polaco. Las cuantizaciones han sido generadas por mradermacher, un conocido publicador de versiones GGUF de modelos open source, y están pensadas para su uso con llama.cpp y herramientas compatibles (Ollama, LM Studio, etc.), no con transformers en producción.

El modelo cuenta con 4.757.260.288 parámetros (aproximadamente 4,76 mil millones), lo que lo sitúa en la categoría de modelos pequeños/medianos, aptos para GPU de consumo. Su especialización es el polaco médico, lo que lo hace relevante para aplicaciones de procesamiento de lenguaje natural clínico en polaco: extracción de información de historiales, resumen de documentación médica o asistencia en consultas en ese idioma.

La relevancia actual radica en la combinación de un tamaño contenido (desplegable en hardware modesto), la disponibilidad de múltiples niveles de cuantización (desde Q2_K de 1,9 GB hasta f16 de 9,6 GB) y su enfoque de dominio sanitario. No obstante, la información pública disponible sobre el modelo base es limitada: no se detallan datos de entrenamiento, benchmarks ni la longitud exacta de contexto en la model card accesible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Bielik-4.5B-v3.0, transformer decoder-only presumiblemente; no confirmado en la información) |
| Parámetros totales | 4.757.260.288 (~4,76 B) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | polaco (pl) |
| Licencia | upstream-and-data-terms (otra; ver license_link del modelo base) |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su naturaleza de modelo de lenguaje para transformers. El modelo deriva de Bielik-4.5B-v3.0 (familia Bielik, orientada al polaco) y ha sido sometido a un ajuste de dominio (domain adaptation) hacia el ámbito médico, según indican las etiquetas `medical` y `domain-adaptation`. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset médico, ni si se emplearon técnicas de RLHF, DPO o SFT.

Respecto al proceso de cuantización, el publicador mradermacher indica que se trata de cuantizaciones estáticas (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) generadas a partir del modelo en formato Hugging Face. También se ofrecen cuantizaciones ponderadas/imatrix en un repositorio separado (`Bielik-4.5B-v3.0-medadapt-i1-GGUF`), que suelen ofrecer mejor relación calidad/tamaño que las estáticas equivalentes.

## Capacidades

- Generación de texto conversacional en polaco (etiqueta `conversational`).
- Procesamiento de texto de dominio médico en polaco gracias al ajuste específico.
- Inferencia local mediante llama.cpp y herramientas compatibles con GGUF.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada: el modelo está etiquetado únicamente para polaco (`pl`).
- No se dispone de información sobre soporte de contexto largo ni de decodificación especulativa.

## Casos de uso

- Extracción de información clínica en polaco: procesar notas médicas o informes en texto libre para extraer entidades (diagnósticos, fármacos, dosis) en pipelines de NLP sanitario, aprovechando el ajuste de dominio médico.
- Resumen de documentación médica: condensar historiales o artículos en polaco para revisión rápida por parte de personal sanitario, con verificación humana posterior obligatoria.
- Asistencia en codificación médica: sugerir códigos o terminología a partir de descripciones textuales en polaco, como paso previo a la validación por codificadores profesionales.
- Chatbot de orientación sanitaria en polaco: atención de primer nivel o FAQ sobre servicios médicos, desplegado localmente con llama.cpp por motivos de privacidad de datos.
- Prototipado e investigación en NLP clínico: experimentación académica con modelos pequeños de dominio específico en polaco, con cuantizaciones ligeras (Q4_K_M de 3,0 GB) para iterar rápido en GPU de consumo.
- Despliegue en entornos con recursos limitados: inferencia en estaciones de trabajo con GPU de 8-12 GB o incluso en CPU con cuantizaciones Q2_K/Q3, útil para clínicas o laboratorios sin infraestructura de servidores dedicada.
- Anonimización o preprocesado de textos médicos: tareas auxiliares de clasificación y transformación de texto dentro de un pipeline más amplio, siempre con supervisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~1,9 GB; Q3_K_M ~2,4 GB; IQ4_XS ~2,7 GB; Q4_K_M ~3,0 GB; Q5_K_M ~3,5 GB; Q6_K ~4,0 GB; Q8_0 ~5,2 GB; f16 ~9,6 GB (tamaños de fichero; la VRAM necesaria es algo superior por el contexto y overhead de la KV cache).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4-Q5 (por ejemplo, RTX 3060, RTX 4060, RTX 2070); 12-16 GB (RTX 4070 Ti, RTX 4080) para Q8_0 con contexto amplio; f16 requiere ~12-16 GB o más.
- Cabe en GPU de consumo: sí, holgadamente en cuantizaciones Q4_K_M y superiores en GPUs de 8 GB o más; también es viable en CPU con llama.cpp para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF; también es posible usar el modelo base en safetensors con transformers (no la versión GGUF).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma principal | Licencia | Formato |
|---|---|---|---|---|---|
| Bielik-4.5B-v3.0-medadapt (este, GGUF) | ~4,76 B | no disponible | Polaco (médico) | upstream-and-data-terms | GGUF, safetensors (base) |
| Bielik-4.5B-v3.0 (base, sin adaptación médica) | ~4,5 B (según nombre) | no disponible | Polaco | no disponible en esta ficha | safetensors |
| Modelos médicos pequeños en otros idiomas (p. ej., adaptaciones de Llama/Mistral a dominio sanitario) | 7-8 B típicamente | variable | Inglés u otros | variable | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo (benchmarks) en la información proporcionada, por lo que la comparación se limita a parámetros, idioma y formato. Para alternativas en polaco médico de tamaño similar no se han identificado datos en la información disponible.

## Limitaciones y advertencias

- Modelo especializado únicamente en polaco: no es adecuado para otros idiomas sin un rendimiento degradado.
- Dominio médico: existe riesgo elevado de alucinación en contenido clínico; nunca debe usarse como sustituto del juicio de un profesional sanitario ni para decisiones diagnósticas o terapéuticas sin supervisión humana.
- No se documentan sesgos conocidos, pero al ser un ajuste de dominio sobre un modelo base polaco, hereda los sesgos de los datos de entrenamiento originales, no especificados.
- Licencia `upstream-and-data-terms`: es necesario revisar los términos del modelo base (jmajkutewicz/Bielik-4.5B-v3.0-medadapt) y de la familia Bielik antes de cualquier uso comercial; la licencia no es estándar (Apache/MIT) y puede imponer restricciones.
- Longitud de contexto no documentada: planificar el despliegue asumiendo un contexto limitado y verificar empíricamente antes de usarlo con documentos largos.
- Información de entrenamiento y evaluación escasa: sin benchmarks publicados, no es posible estimar su calidad frente a alternativas; se recomienda evaluación propia en el caso de uso concreto.
- Modelo cuantizado: las cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad; para producción se recomienda Q4_K_M o superior.
- Repositorio con pocas descargas (200) y sin likes: baja validación comunitaria; tratar con cautela en entornos críticos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Bielik-4.5B-v3.0-medadapt-GGUF
- Modelo base (adaptación médica): https://huggingface.co/jmajkutewicz/Bielik-4.5B-v3.0-medadapt
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/Bielik-4.5B-v3.0-medadapt-i1-GGUF
- Página de descargas del publicador: https://hf.tst.eu/model#Bielik-4.5B-v3.0-medadapt-GGUF
- Guía de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
