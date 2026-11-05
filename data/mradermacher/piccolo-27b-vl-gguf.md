# mradermacher/Piccolo-27B-VL-GGUF

## Resumen

Piccolo-27B-VL-GGUF es la versión cuantizada en formato GGUF del modelo vision-language Piccolo-27B-VL desarrollado por agentscope-ai. Esta ficha cubre específicamente la conversión publicada por mradermacher, un conocido creador de cuantizaciones GGUF para la comunidad de inferencia local. El modelo original es un transformer multimodal de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) que combina procesamiento de lenguaje natural con comprensión de imágenes, orientado a tareas conversacionales.

La relevancia de esta publicación radica en que permite ejecutar un modelo vision-language de gran tamaño en hardware de consumo mediante cuantizaciones que van desde Q2_K (11 GB) hasta Q8_0 (29,1 GB), además de un proyector multimodal separado (mmproj) en Q8_0 y f16. Al estar etiquetado como `endpoints_compatible` y usar la librería transformers, está pensado para integrarse en pipelines existentes de inferencia local con llama.cpp u Ollama.

La información pública disponible sobre el modelo base es muy limitada: la model card del repositorio cuantizado no incluye detalles sobre arquitectura interna, datos de entrenamiento, licencia ni benchmarks. Esta ficha se limita, por tanto, a los datos verificables del repositorio y del modelo base referenciado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (detalles internos no disponibles) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base agentscope-ai/Piccolo-27B-VL en la documentación proporcionada. Por las etiquetas del repositorio (`vision-language`, `piccolo`, `transformers`) se infiere que se trata de un transformer multimodal con un codificador visual acoplado a un modelo de lenguaje, pero no se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni la estrategia de fusión multimodal.

Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card del repositorio cuantizado es puramente operativa: describe los ficheros GGUF generados, sus tamaños y recomendaciones de uso, sin información sobre el entrenamiento. El autor de la cuantización indica que no ha generado cuantizaciones ponderadas/imatrix en el momento de la publicación, solo cuantizaciones estáticas.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Comprensión de imágenes: el modelo incluye un proyector multimodal (mmproj) que permite el procesamiento conjunto de texto e imagen.
- Inferencia local mediante GGUF, compatible con llama.cpp y ecosistemas derivados.
- Etiquetado como `endpoints_compatible`, lo que sugiere compatibilidad con APIs de inferencia estándar.
- No se documentan capacidades específicas de tool calling, function calling, agentes multi-paso, modo thinking ni procesamiento de audio.
- Capacidades multilingües: solo se declara inglés (`en`); no hay evidencia de soporte para otros idiomas.

## Casos de uso

- Análisis de documentos escaneados con descripción textual: el modelo puede recibir una imagen y generar una descripción o extracción de información en inglés, aprovechando su naturaleza vision-language y su despliegue local vía GGUF.
- Asistentes conversacionales multimodales en local: con cuantizaciones Q4_K_M (16,9 GB) se puede desplegar un chatbot que acepte imágenes y texto en estaciones de trabajo con una sola GPU de 24 GB.
- Moderación de contenido visual con revisión textual: clasificación y descripción de imágenes en pipelines internos, sin depender de APIs externas, gracias a la inferencia local.
- Prototipado de investigación en visión-lenguaje: investigadores que necesiten experimentar con un modelo de ~27 B en hardware asequible pueden usar las cuantizaciones Q2_K o Q3_K para pruebas rápidas.
- Automatización de accesibilidad: generación de descripciones alternativas de imágenes en inglés para sitios web o aplicaciones, ejecutando el modelo en servidores propios.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 11 variantes de cuantización más dos proyectores, lo que permite medir el impacto de la cuantización en tareas visión-lenguaje sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (solo pesos del modelo de lenguaje):
  - Q2_K: ~11,0 GB
  - Q3_K_S: ~12,4 GB
  - Q3_K_M: ~13,6 GB
  - Q3_K_L: ~14,7 GB
  - IQ4_XS: ~15,5 GB
  - Q4_K_S: ~15,9 GB
  - Q4_K_M: ~16,9 GB
  - Q5_K_S: ~19,1 GB
  - Q5_K_M: ~19,6 GB
  - Q6_K: ~22,5 GB
  - Q8_0: ~29,1 GB
- Proyector multimodal adicional: mmproj-Q8_0 (~0,7 GB) o mmproj-f16 (~1,0 GB).
- GPU recomendadas: para Q4_K_M y superiores, una RTX 4090 (24 GB) o A100/H100 de 40-80 GB; para Q2_K y Q3_K, GPUs de 16 GB como RTX 4080 o A4000 podrían ser suficientes, aunque el contexto y el proyector consumen VRAM adicional.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con cuantizaciones hasta Q6_K; en GPUs de 16 GB solo con Q2_K o Q3_K y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el modelo base usa transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos comparables de la misma familia o categoría en la documentación proporcionada. El modelo base agentscope-ai/Piccolo-27B-VL no incluye benchmarks ni especificaciones que permitan una comparación rigurosa con alternativas como Qwen2.5-VL, InternVL o LLaVA. Se indica "no disponible" para evitar datos inventados.

## Limitaciones y advertencias

- La licencia no está especificada en el repositorio; antes de cualquier uso comercial es imprescindible verificar la licencia del modelo base agentscope-ai/Piccolo-27B-VL.
- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- No hay información sobre sesgos, datos de entrenamiento ni evaluación de seguridad, por lo que el riesgo de alucinación y de sesgos no puede cuantificarse.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; el autor recomienda Q4_K_S o Q4_K_M como equilibrio rapidez/calidad y Q8_0 como mejor calidad.
- No se han generado cuantizaciones imatrix/ponderadas, que suelen ofrecer mejor calidad por tamaño que las estáticas.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- La longitud de contexto no está documentada; no se debe asumir una ventana larga en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Piccolo-27B-VL-GGUF
- Modelo base: https://huggingface.co/agentscope-ai/Piccolo-27B-VL
- Página de descargas del autor: https://hf.tst.eu/model#Piccolo-27B-VL-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
