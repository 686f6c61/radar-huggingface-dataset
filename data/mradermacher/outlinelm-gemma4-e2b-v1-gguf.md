# mradermacher/OutlineLM-Gemma4-E2B-v1-GGUF

## Resumen

OutlineLM-Gemma4-E2B-v1-GGUF es la distribución en formato GGUF del modelo OutlineLM-Gemma4-E2B-v1, publicado por el usuario mradermacher a partir del modelo base de DiTy. Se trata de una cuantización estática del modelo original pensada para su uso con llama.cpp y otros motores compatibles con GGUF, lo que permite ejecutar el modelo en hardware de consumo sin necesidad de GPUs de datacenter.

El modelo base se construye sobre la familia Gemma 4 (etiqueta `gemma4` en la model card) con un tamaño de aproximadamente 4.650 millones de parámetros según los pesos en safetensors del repositorio. La nomenclatura "E2B" sugiere una variante de eficiencia de la familia, aunque la información disponible no detalla la arquitectura interna ni el contexto máximo. El modelo está orientado a conversación y declara soporte para inglés y ruso.

La relevancia de esta ficha radica en que ofrece una vía práctica de despliegue local: el repositorio incluye 12 cuantizaciones distintas (desde Q2_K de 3,1 GB hasta f16 de 9,4 GB), lo que cubre desde entornos con poca VRAM hasta configuraciones que priorizan calidad. La licencia Apache 2.0 facilita su uso comercial, si bien conviene verificar las condiciones del modelo base original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4; detalles internos no publicados en la información disponible) |
| Parámetros totales | 4.647.450.147 (según safetensors del repositorio) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. La etiqueta `gemma4` indica que pertenece a la cuarta generación de la familia Gemma de Google, y el sufijo "E2B" apunta a una variante de eficiencia, pero no se especifican el número de capas, la dimensión de los embeddings, el mecanismo de atención ni si emplea técnicas como atención lineal o decodificación especulativa.

Tampoco se detallan los datos de entrenamiento: número de tokens, composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado. La model card del repositorio GGUF es únicamente una ficha de cuantización generada por mradermacher y remite al modelo base `DiTy/OutlineLM-Gemma4-E2B-v1` para los detalles técnicos del entrenamiento. Las cuantizaciones son estáticas (no imatrix); el autor indica que las versiones ponderadas con imatrix están disponibles en un repositorio separado (`mradermacher/OutlineLM-Gemma4-E2B-v1-i1-GGUF`).

## Capacidades

- Generación de texto conversacional: el pipeline declarado es "conversational" y el modelo está etiquetado como apto para diálogo multi-turno.
- Soporte multilingüe limitado a inglés y ruso según los metadatos de la model card.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a través de infraestructura de inferencia estándar.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking en la información disponible.
- No se especifican capacidades de generación de código ni matemáticas; no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M de 3,5 GB, el modelo cabe en GPUs de consumo de 8 GB o menos, permitiendo prototipado de asistentes conversacionales sin conexión a la nube.
- Asistentes de chat en ruso e inglés: el soporte bilingüe declarado lo hace adecuado para aplicaciones de atención al usuario en esos dos idiomas, siempre que se valide la calidad real mediante pruebas.
- Integración en pipelines de CI/CD para pruebas de regresión conversacional: al ser un modelo pequeño y rápido de cargar en GGUF, puede usarse como componente de test en sistemas que validan respuestas de LLM.
- Investigación en cuantización: el repositorio ofrece 12 variantes de cuantización, lo que permite estudiar el impacto de la compresión en la calidad de salida y comparar Q2_K frente a Q8_0 sobre el mismo modelo base.
- Servicio de inferencia con llama.cpp o motores compatibles: la etiqueta `endpoints_compatible` y el formato GGUF facilitan su exposición mediante servidores ligeros en entornos con recursos limitados.
- Evaluación comparativa de modelos de ~4,6B parámetros: sirve como punto de referencia en estudios de eficiencia entre modelos de tamaño medio, especialmente en tareas de conversación bilingüe inglés-ruso.
- Educación y demostraciones: su reducido tamaño y licencia Apache 2.0 permiten incluirlo en talleres y materiales docentes sobre despliegue de LLM en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~3,1 GB; Q4_K_M ~3,5 GB; Q6_K ~3,9 GB; Q8_0 ~5,1 GB; f16 ~9,4 GB. Añadir margen para el contexto y el overhead del motor (típicamente 1-2 GB adicionales).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para las cuantizaciones más altas; A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, desde GPUs de 6-8 GB con cuantizaciones Q4 y Q3; incluso en 4 GB con Q2_K, aunque con pérdida de calidad.
- Opciones de despliegue: llama.cpp, Ollama, y motores compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone del formato original.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible: la información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría.

## Limitaciones y advertencias

- La model card del repositorio GGUF no documenta sesgos conocidos ni evaluaciones de seguridad; se desconoce el comportamiento del modelo en dominios sensibles.
- Riesgo de alucinación no cuantificado: al no haber benchmarks publicados, no puede estimarse la fiabilidad factual del modelo.
- Idiomas limitados a inglés y ruso según los metadatos; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Longitud de contexto no disponible: no puede garantizarse el manejo de conversaciones largas ni de documentos extensos.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; el autor recomienda Q4_K_S o Q4_K_M como equilibrio entre velocidad y fidelidad.
- Licencia Apache 2.0 declarada en este repositorio, pero conviene verificar la licencia del modelo base `DiTy/OutlineLM-Gemma4-E2B-v1` antes de uso comercial, ya que los términos de la familia Gemma pueden imponer condiciones adicionales.
- El repositorio tiene 0 likes y 968 descargas en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/OutlineLM-Gemma4-E2B-v1-GGUF
- Modelo base: https://huggingface.co/DiTy/OutlineLM-Gemma4-E2B-v1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/OutlineLM-Gemma4-E2B-v1-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#OutlineLM-Gemma4-E2B-v1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
