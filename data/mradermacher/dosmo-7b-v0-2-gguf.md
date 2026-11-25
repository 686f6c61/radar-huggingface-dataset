# mradermacher/DOSMo-7B-v0.2-GGUF

## Resumen

DOSMo-7B-v0.2-GGUF es la versión cuantizada en formato GGUF del modelo DOSMo-7B-v0.2, publicado por el usuario mradermacher a partir del modelo base original de maxidl. Se trata de una conversión estática (sin imatrix ni quants ponderados) pensada para su uso con llama.cpp y otras herramientas compatibles con GGUF, lo que facilita la ejecución local en hardware de consumo. El modelo cuenta con 7.241.732.096 parámetros totales según los pesos en safetensors del repositorio, lo que lo sitúa en la categoría de modelos de aproximadamente 7B.

La relevancia de esta ficha radica en que agrupa en un único artefacto un conjunto amplio de cuantizaciones (desde Q2_K hasta f16) del modelo original, permitiendo a desarrolladores elegir el equilibrio entre tamaño en disco, VRAM y calidad. El repositorio tiene un tamaño de 63,9 GB, coherente con la suma de todas las variantes de cuantización publicadas. La información disponible sobre arquitectura, entrenamiento, contexto y licencia del modelo original es muy limitada en los datos proporcionados, por lo que varios campos se marcan como no disponibles.

El modelo está etiquetado como conversacional y en inglés, y su uso previsto es la inferencia local de un modelo de 7B con fines experimentales o de prototipado. Al no disponerse de datos de benchmarks ni de la model card del modelo base, esta ficha debe interpretarse como una descripción del artefacto cuantizado y no como una evaluación de capacidades del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer de ~7B, sin confirmar detalles) |
| Parámetros totales | 7.241.732.096 |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base maxidl/DOSMo-7B-v0.2 en los datos proporcionados. Por el número de parámetros (7.241.732.096) y la nomenclatura "7B", se trata de un modelo de la familia de transformers de aproximadamente 7.000 millones de parámetros, pero no se confirma si emplea atención estándar, atención lineal, mezcla de expertos u otra variante. Tampoco se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

El artefacto aquí descrito es una cuantización estática realizada por mradermacher mediante su pipeline habitual de conversión a GGUF. La model card indica que no se han generado cuantizaciones ponderadas con imatrix para este modelo, y que las cuantizaciones publicadas son estáticas. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y orientado a diálogo en inglés.
- Inferencia local: al estar en formato GGUF, puede ejecutarse con llama.cpp y herramientas derivadas en CPU y GPU.
- Cuantizaciones múltiples: permite ajustar el uso de memoria y la calidad según el caso de uso.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Prototipado de chatbots locales en inglés: el modelo puede integrarse en aplicaciones de escritorio o servidores domésticos mediante llama.cpp u Ollama, usando cuantizaciones Q4_K_M (4,5 GB) o Q5_K_M (5,2 GB) para equilibrar calidad y memoria.
- Experimentación académica con modelos de 7B: investigadores pueden comparar el comportamiento de distintas cuantizaciones (Q2_K frente a Q8_0) sobre el mismo modelo base para estudiar el impacto de la cuantización en la calidad de las respuestas.
- Despliegue en hardware de consumo: las variantes Q4_K_S (4,2 GB) y Q4_K_M (4,5 GB) caben en GPUs con 6-8 GB de VRAM, lo que permite ejecutar el modelo en equipos de gama media sin infraestructura dedicada.
- Generación de texto en pipelines sin conexión: al ser un artefacto GGUF autocontenido, puede usarse en entornos aislados o con conectividad limitada donde no se desea depender de APIs externas.
- Evaluación de la cadena de cuantización: desarrolladores que necesiten validar su propio pipeline de cuantización pueden usar este repositorio como referencia de conversiones estáticas de un modelo de 7B.
- Pruebas de integración con llama.cpp: el conjunto de cuantizaciones permite verificar compatibilidad de versiones de llama.cpp con distintos tipos de quant (K-quants, IQ-quants, f16) antes de desplegar en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~2,8 GB; Q3_K_S ~3,3 GB; Q3_K_M ~3,6 GB; Q3_K_L ~3,9 GB; IQ4_XS ~4,0 GB; Q4_K_S ~4,2 GB; Q4_K_M ~4,5 GB; Q5_K_S ~5,1 GB; Q5_K_M ~5,2 GB; Q6_K ~6,0 GB; Q8_0 ~7,8 GB; f16 ~14,6 GB. Estas cifras corresponden al tamaño en disco de los ficheros y sirven como cota inferior de memoria; hay que añadir overhead de contexto y de runtime.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, las cuantizaciones Q4 caben en GPUs de consumo con 8 GB de VRAM; Q8_0 requiere al menos 10-12 GB; f16 requiere 16 GB o más.
- ¿Cabe en GPU de consumo? Sí: las variantes Q4_K_S y Q4_K_M (4,2-4,5 GB) caben en GPUs de 6-8 GB; Q5 y Q6 en GPUs de 8-12 GB; Q8_0 en GPUs de 12-16 GB; f16 en GPUs de 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes compatibles con GGUF. No se indica compatibilidad con vLLM o TGI en la información disponible.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia estructural, este artefacto se sitúa en la categoría de modelos de ~7B cuantizados en GGUF, comparable en formato a otras cuantizaciones de la misma familia publicadas por mradermacher, pero no se han proporcionado datos de rendimiento, contexto ni licencia que permitan una comparación rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| DOSMo-7B-v0.2-GGUF | 7.241.732.096 | no disponible | no disponible | GGUF |
| Alternativas de ~7B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; al ser un modelo entrenado principalmente en inglés, es probable que herede sesgos de su corpus, pero no se documentan.
- Riesgo de alucinación: no cuantificado; no se han publicado evaluaciones de fidelidad ni benchmarks en la información disponible.
- Limitaciones de contexto o idioma: el modelo está etiquetado únicamente para inglés ("en"); no se garantiza un comportamiento correcto en castellano u otros idiomas. La longitud de contexto no está documentada.
- Restricciones de licencia: la licencia no está disponible; antes de un uso comercial es imprescindible consultar la licencia del modelo base maxidl/DOSMo-7B-v0.2.
- Caveat de producción: las cuantizaciones estáticas de baja precisión (Q2_K, Q3_K_S) pueden degradar la calidad de forma notable; para producción se recomienda Q4_K_M o superior. Al no haber cuantizaciones imatrix, no se dispone de la mejora de calidad que estas suelen aportar en tamaños equivalentes.
- El repositorio incluye 12 ficheros GGUF que suman 63,9 GB; conviene descargar solo la variante necesaria para evitar consumo innecesario de disco y ancho de banda.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/DOSMo-7B-v0.2-GGUF
- Modelo base: https://huggingface.co/maxidl/DOSMo-7B-v0.2
- Página de overview del cuantizador: https://hf.tst.eu/model#DOSMo-7B-v0.2-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
