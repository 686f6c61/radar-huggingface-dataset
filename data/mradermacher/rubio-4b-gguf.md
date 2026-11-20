# mradermacher/Rubio-4B-GGUF

## Resumen

Rubio-4B-GGUF es la versión cuantizada en formato GGUF del modelo mulkzz/RuBio-4B, publicada por mradermacher. Se trata de una conversión estática (sin cuantización ponderada por imatrix) que ofrece el modelo original en una amplia gama de niveles de compresión, desde Q2_K hasta f16, además de suplementos multimodales mmproj. El modelo está etiquetado como orientado a educación, biología y feedback, y declara el coreano como idioma soportado en la model card.

El modelo base cuenta con aproximadamente 4.326 millones de parámetros (4,3B), lo que lo sitúa en la gama media de tamaño y lo hace desplegable en hardware de consumo con cuantizaciones agresivas. La relevancia de esta publicación radica en que permite ejecutar el modelo en entornos con recursos limitados mediante llama.cpp y herramientas compatibles con GGUF, algo imposible con los pesos originales en precisión completa.

La licencia es Apache 2.0, lo que facilita el uso comercial y la redistribución. No obstante, la información disponible sobre arquitectura detallada, datos de entrenamiento y benchmarks es muy escasa: la model card del cuantizador se limita a describir el proceso de conversión y no aporta detalles técnicos del modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformers; presumiblemente transformer decoder-only) |
| Parametros totales | 4.326.350.848 (4,3B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | ko (coreano), según la model card |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base mulkzz/RuBio-4B en la documentación proporcionada. El número de parámetros (4,3B) y la librería declarada (transformers) sugieren un transformer decoder-only convencional, pero no se confirma el tipo exacto de atención, la composición del dataset ni el proceso de alineación (RLHF, DPO u otros). Las etiquetas de la model card mencionan "unsloth" y "vllm", lo que indica compatibilidad con herramientas de entrenamiento eficiente y despliegue, pero no aporta detalles sobre el entrenamiento en sí.

La innovación técnica documentada se limita al proceso de cuantización estática realizado por mradermacher, que genera múltiples variantes GGUF con distintos niveles de compresión. Se indica explícitamente que no se han generado cuantizaciones ponderadas por imatrix para este modelo, y que el autor no tiene previsto hacerlo salvo petición en la sección de discusiones de la comunidad. Los suplementos mmproj (Q8_0 y f16) sugieren que el modelo base podría tener capacidades multimodales, aunque esto no se confirma en el texto.

## Capacidades

- Generación de texto conversacional, según la etiqueta "conversational" del repositorio.
- Orientación declarada a educación, biología y feedback (etiquetas de la model card).
- Soporte multilingüe limitado al coreano según el campo `language` de la model card.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Compatibilidad con vLLM y transformers para despliegue.
- Posible soporte multimodal (presencia de ficheros mmproj), aunque no confirmado en la documentación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible (salvo la posible multimodalidad inferida de los ficheros mmproj).

## Casos de uso

- Asistencia educativa en coreano: el modelo puede emplearse como tutor conversacional para explicar conceptos de biología, aprovechando su orientación declarada a educación y biología y su naturaleza conversacional.
- Generación de feedback formativo: dado su etiquetado en "feedback", puede integrarse en sistemas que devuelvan comentarios estructurados sobre respuestas de estudiantes en entornos de aprendizaje.
- Despliegue en hardware de consumo: gracias a las cuantizaciones Q4_K_S y Q4_K_M (2,7-2,9 GB), puede ejecutarse en portátiles y equipos sin GPU dedicada mediante llama.cpp u Ollama, lo que facilita prototipado local.
- Chatbot de dominio biológico de bajo coste: con la cuantización Q8_0 (4,7 GB) se obtiene la mejor calidad manteniendo un tamaño manejable para servidores pequeños.
- Experimentación académica con modelos compactos: investigadores pueden comparar el comportamiento de las distintas cuantizaciones (Q2_K a f16) sobre las mismas tareas para estudiar la degradación por compresión.
- Integración en pipelines de transformers/vLLM: la etiqueta `endpoints_compatible` y la compatibilidad con vLLM permiten servirlo como API en infraestructuras existentes, aunque el formato GGUF está más orientado a llama.cpp.
- Procesamiento multimodal experimental: si se confirma la naturaleza multimodal del modelo base, los ficheros mmproj permitirían entrada de imágenes en llama.cpp, aunque esto requiere verificación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~2,1 GB
  - Q3_K_S: ~2,2 GB
  - Q3_K_M: ~2,4 GB
  - Q3_K_L: ~2,6 GB
  - IQ4_XS: ~2,7 GB
  - Q4_K_S: ~2,7 GB
  - Q4_K_M: ~2,9 GB
  - Q5_K_S: ~3,2 GB
  - Q5_K_M: ~3,3 GB
  - Q6_K: ~3,7 GB
  - Q8_0: ~4,7 GB
  - f16: ~8,8 GB
- GPU recomendadas: no disponible en la documentación. Por tamaño, cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4070) puede alojar las cuantizaciones Q4-Q8; las f16 requieren 12 GB o más (RTX 4070 Ti, RTX 4080, A100, H100).
- Cabe en GPU de consumo: sí, en la mayoría de cuantizaciones. Q4_K_M (~2,9 GB) cabe en GPUs de 4-6 GB; Q8_0 (~4,7 GB) en GPUs de 8 GB; f16 (~8,8 GB) en GPUs de 12 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El modelo base es compatible con transformers y vLLM, pero los ficheros GGUF no se cargan directamente en vLLM sin conversión.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos comparables de la misma categoría (4B, orientados a educación/biología en coreano) en la documentación proporcionada. Se indica "no disponible" para evitar comparaciones sin datos verificables.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Rubio-4B-GGUF | 4,3B | no disponible | apache-2.0 | GGUF | Cuantización de RuBio-4B |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente coreano (`ko`); el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Sesgos conocidos: no documentados en la información disponible, pero al ser un modelo orientado a educación y biología podría presentar sesgos de dominio no evaluados.
- Riesgo de alucinación: no cuantificado; al no haber benchmarks publicados, no puede estimarse su fiabilidad factual, especialmente en dominios científicos.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar conversaciones largas o tareas de recuperación con contexto extenso.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base (mulkzz/RuBio-4B) por si impone restricciones adicionales no reflejadas en esta ficha.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M están marcadas por el autor como de menor calidad; para producción se recomienda Q4_K_M o superior.
- Ausencia de cuantizaciones imatrix: el autor indica que no las ha generado, por lo que no se dispone de variantes ponderadas que suelen ofrecer mejor relación calidad/tamaño.
- Multimodalidad no confirmada: la presencia de ficheros mmproj sugiere capacidades multimodales, pero no se documenta su funcionamiento ni su calidad.
- Fecha de creación atípica (2026-10-31): conviene verificar la vigencia y el estado del repositorio antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Rubio-4B-GGUF
- Modelo base: https://huggingface.co/mulkzz/RuBio-4B
- Página de descargas del cuantizador: https://hf.tst.eu/model#Rubio-4B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
