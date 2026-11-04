# mradermacher/Gamunu-4b-Chat-It-GGUF

## Resumen

Gamunu-4b-Chat-It-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo base `manthilaffs/Gamunu-4b-Chat-It`, publicada por el usuario mradermacher, especializado en la conversión de pesos a formatos ligeros para inferencia local. El modelo subyacente es un ajuste fino conversacional de la familia Gemma 3, con 3.880.263.168 parámetros totales (aproximadamente 3,9 mil millones), según los tensores en safetensors del repositorio. La licencia declarada es Apache 2.0 y el idioma soportado según la model card es únicamente inglés.

Este repositorio no aporta un modelo nuevo, sino una batería de cuantizaciones estáticas (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 y f16) junto con dos ficheros mmproj (Q8_0 y f16) que actúan como suplemento multimodal, lo que sugiere que el modelo base incorpora capacidad de visión heredada de Gemma 3. Es relevante para desarrolladores que necesitan ejecutar un modelo conversacional de ~4B en hardware de consumo mediante llama.cpp u Ollama, con opciones desde 1,8 GB hasta 7,9 GB según la calidad deseada.

La ficha se centra en lo que se puede verificar a partir de los metadatos y la model card del repositorio. No hay información publicada sobre arquitectura interna, datos de entrenamiento, benchmarks ni detalles del ajuste fino, por lo que esos apartados se marcan explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como `gemma3`; se infiere familia transformer Gemma 3, sin confirmación en la model card) |
| Parametros totales | 3.880.263.168 (~3,9B) |
| Parametros activos | no aplica (no es MoE según los metadatos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF, DPO o ajuste supervisado en el modelo base `manthilaffs/Gamunu-4b-Chat-It`. La model card del repositorio GGUF es una plantilla generada automáticamente por el pipeline de mradermacher y no incluye detalles técnicos del modelo original. El tag `gemma3` y la etiqueta `unsloth` en los metadatos sugieren que el ajuste fino se realizó con la librería Unsloth sobre una base Gemma 3, pero esto no está confirmado en la documentación proporcionada.

Lo que sí se puede afirmar es el proceso de cuantización: se trata de cuantizaciones estáticas (no imatrix ni ponderadas, según indica el propio autor: "weighted/imatrix quants seem not to be available"). El autor clasifica Q4_K_S y Q4_K_M como "fast, recommended", Q6_K como "very good quality" y f16 como "16 bpw, overkill". La presencia de ficheros mmproj confirma que el modelo base incluye un proyector multimodal, probablemente para entrada de imágenes, aunque no se detalla su funcionamiento.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` y el sufijo `-Chat-It` del nombre.
- Capacidad multimodal probable (visión) por la presencia de ficheros `mmproj` en el repositorio; el alcance exacto no está documentado.
- Compatibilidad con `text-generation-inference` y `transformers` según los tags del repositorio.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere uso en Inference Endpoints de Hugging Face.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede desplegarse con llama.cpp u Ollama en un portátil con GPU de consumo usando la cuantización Q4_K_M (2,6 GB), lo que permite mantener conversaciones multi-turno sin conexión a servicios en la nube.
- Prototipado rápido de chatbots: gracias a su tamaño de ~4B y a las cuantizaciones Q4_K_S/Q4_K_M marcadas como "fast, recommended", es adecuado para iterar sobre prompts y flujos conversacionales en entornos de desarrollo con recursos limitados.
- Procesamiento de imágenes en local (si se confirma la multimodalidad): los ficheros `mmproj-Q8_0` (0,7 GB) y `mmproj-f16` (1,0 GB) permiten, en teoría, alimentar imágenes al modelo junto con texto; útil para tareas de descripción de imágenes o extracción de información visual en entornos sin API externa.
- Despliegue en dispositivos con poca VRAM: la cuantización Q2_K (1,8 GB) permite ejecutar el modelo en GPUs integradas o en CPU con RAM modesta, aunque con pérdida de calidad; útil para demos y pruebas de concepto.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantización del mismo modelo, lo que lo convierte en un banco de pruebas útil para medir el impacto de la cuantización en calidad y velocidad sobre un modelo Gemma 3 ajustado.
- Fine-tuning posterior sobre la base: al estar el modelo base bajo licencia Apache 2.0, se puede usar como punto de partida para ajustes adicionales en inglés, aunque el repositorio GGUF en sí no es el formato adecuado para entrenamiento (habría que usar el safetensors original).
- Integración en pipelines de Hugging Face Inference Endpoints: el tag `endpoints_compatible` sugiere que puede desplegarse en la infraestructura gestionada de Hugging Face para servir el modelo vía API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~1,8 GB
  - Q3_K_S: ~2,0 GB
  - Q3_K_M: ~2,2 GB
  - Q3_K_L: ~2,3 GB
  - IQ4_XS: ~2,4 GB
  - Q4_K_S: ~2,5 GB
  - Q4_K_M: ~2,6 GB
  - Q5_K_S / Q5_K_M: ~2,9 GB
  - Q6_K: ~3,3 GB
  - Q8_0: ~4,2 GB
  - f16: ~7,9 GB
  - mmproj adicional: 0,7 GB (Q8_0) o 1,0 GB (f16)
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con ≥6 GB de VRAM puede ejecutar Q4_K_M con contexto moderado; una RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o A100/H100 permiten holgura para contexto largo y mmproj.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 6-8 GB o más para cuantizaciones Q4-Q5; Q2_K y Q3_K pueden caber en GPUs integradas o en CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, text-generation-inference (tag del repo), transformers (tag del repo), Hugging Face Inference Endpoints (`endpoints_compatible`). vLLM no está listado explícitamente, aunque soporta GGUF de forma experimental.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gamunu-4b-Chat-It-GGUF (este) | ~3,9B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estáticas, inglés, multimodal probable |
| Gemma 3 4B (Google) | ~4B | no disponible en esta ficha | Gemma license | safetensors, GGUF (comunidad) | Modelo base de referencia de la familia; licencia distinta a Apache 2.0 |
| Qwen2.5 3B Instruct | ~3B | 32K (según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF | Multilingüe, sin visión en la variante 3B |
| Llama 3.2 3B Instruct | ~3B | 128K (según documentación pública de Meta) | Llama 3.2 Community License | safetensors, GGUF | Multilingüe, con restricciones de licencia para uso comercial a gran escala |

Nota: los datos de los modelos comparativos provienen de conocimiento general público y no de la información proporcionada en esta ficha; se incluyen solo como referencia orientativa. No hay benchmarks disponibles para comparar rendimiento real.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Sesgos: no documentados por el autor; al ser un ajuste fino sobre Gemma 3, hereda los sesgos del modelo base, que no se detallan en la información disponible.
- Riesgo de alucinación: no cuantificado; no hay benchmarks ni evaluaciones publicadas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `manthilaffs/Gamunu-4b-Chat-It` y de Gemma 3, ya que el ajuste fino podría estar sujeto a los términos de la licencia original de Google (Gemma license), que impone restricciones adicionales.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M están marcadas por el propio autor como de menor calidad ("lower quality" para Q3_K_M); para producción se recomienda Q4_K_M o superior.
- Ausencia de imatrix: el autor indica que no hay cuantizaciones ponderadas/imatrix disponibles, lo que puede reducir la calidad respecto a otras publicaciones de mradermacher que sí las incluyen.
- Modelo de nicho: solo 3 descargas y 0 likes en el momento de la consulta, lo que implica poca validación comunitaria y escaso soporte.
- Sin información sobre contexto: se desconoce la longitud máxima de contexto soportada, lo que impide planificar casos de uso con ventanas largas.
- Multimodalidad no confirmada: la presencia de mmproj sugiere visión, pero no hay documentación sobre qué tipos de imagen acepta ni su calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Gamunu-4b-Chat-It-GGUF
- Modelo base: https://huggingface.co/manthilaffs/Gamunu-4b-Chat-It
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#Gamunu-4b-Chat-It-GGUF
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de comparación de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Página de solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (empresa del autor): https://www.nethype.de/
