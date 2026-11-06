# mradermacher/hybrid-play-32B-GGUF

## Resumen

`mradermacher/hybrid-play-32B-GGUF` es una colección de cuantizaciones estáticas en formato GGUF del modelo `hybrid-gym/hybrid-play-32B`, publicadas por el usuario mradermacher, conocido en el ecosistema por generar versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo original cuenta con 32.763.876.352 parámetros (aproximadamente 32,8 mil millones), lo que lo sitúa en la categoría de modelos densos de gran tamano orientados a inferencia local en hardware de gama alta.

La relevancia de esta publicación radica en que permite ejecutar un modelo de 32B en estaciones de trabajo y servidores con GPUs de consumo o profesionales, ofreciendo un abanico de cuantizaciones que van desde Q2_K (12,4 GB) hasta Q8_0 (34,9 GB). El repositorio incluye tanto cuantizaciones K-quant clásicas como IQ4_XS, lo que facilita ajustar el equilibrio entre calidad y consumo de memoria según el hardware disponible.

No se dispone de información pública sobre la arquitectura interna, el proceso de entrenamiento ni los datos de evaluación del modelo base en la documentación proporcionada; la model card del repositorio cuantizado se limita a describir los ficheros GGUF generados y su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 32.763.876.352 (~32,8B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base presumiblemente en safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base `hybrid-gym/hybrid-play-32B` en la documentación disponible. El nombre sugiere una posible arquitectura híbrida (posiblemente combinando atención con capas de estado recurrente o SSM), pero este dato no está confirmado en la información proporcionada. Tampoco se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

La contribución técnica de este repositorio es la generación de cuantizaciones estáticas mediante el pipeline de mradermacher, con versiones que van desde Q2_K hasta Q8_0. El autor indica que las cuantizaciones ponderadas con imatrix no están disponibles en el momento de la publicación, aunque podrían solicitarse mediante una discusión comunitaria.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`), lo que permite su despliegue en infraestructuras compatibles con la API de Hugging Face.
- Ejecución mediante llama.cpp y herramientas derivadas (Ollama, LM Studio, etc.) gracias al formato GGUF.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modos de pensamiento explícitos.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma declarada.

## Casos de uso

- Despliegue local de un asistente conversacional en inglés sobre una estación de trabajo con GPU de 24 GB: usando la cuantización Q4_K_M (20,0 GB) se puede mantener el modelo en VRAM con margen para el contexto, ofreciendo respuestas de calidad razonable para prototipado.
- Evaluación comparativa de cuantizaciones: el repositorio incluye once variantes que permiten medir el impacto de la cuantización en la perplejidad y la calidad de las respuestas sobre el mismo modelo base.
- Integración en pipelines de investigación con llama.cpp: al ser GGUF estático, se puede cargar con la librería `llama-cpp-python` para experimentos reproducibles sin depender de GPUs de datacenter.
- Servicio de chat interno en una organización con requisitos de soberanía de datos: al ejecutarse en hardware propio y no requerir conexión a APIs externas, el modelo puede desplegarse en entornos aislados.
- Generación de texto en lote (batch) para tareas de anotación o aumento de datos en inglés, aprovechando la cuantización Q8_0 (34,9 GB) en GPUs profesionales como A100 40GB o H100.
- Pruebas de concepto de asistentes conversacionales en entornos con recursos limitados: la variante Q2_K (12,4 GB) permite ejecutar el modelo en GPUs de consumo de 16 GB, aunque con degradación de calidad esperada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contexto):
  - Q2_K: ~12,4 GB
  - Q3_K_S: ~14,5 GB
  - Q3_K_M: ~16,0 GB
  - Q3_K_L: ~17,3 GB
  - IQ4_XS: ~18,0 GB
  - Q4_K_S: ~18,9 GB
  - Q4_K_M: ~20,0 GB
  - Q5_K_S: ~22,7 GB
  - Q5_K_M: ~23,4 GB
  - Q6_K: ~27,0 GB
  - Q8_0: ~34,9 GB
- GPUs recomendadas:
  - RTX 4090 (24 GB): Q4_K_M o Q5_K_M con contexto moderado; Q6_K ajustado.
  - RTX 3090 (24 GB): similar a la 4090, con menor throughput.
  - A100 40GB / H100 40GB: Q8_0 con holgura para contexto largo.
  - A100 80GB / H100 80GB: Q8_0 con contexto extenso o múltiples instancias.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) con cuantizaciones Q4/Q5; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, `llama-cpp-python`, y servidores compatibles con GGUF. No se ha confirmado compatibilidad con vLLM o TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente sobre el modelo base (arquitectura, contexto, benchmarks) para establecer una comparativa rigurosa con alternativas de la misma categoría. Se indica "no disponible".

## Limitaciones y advertencias

- La licencia del modelo no está declarada en la información disponible; es imprescindible verificar la licencia del modelo base `hybrid-gym/hybrid-play-32B` antes de cualquier uso comercial.
- El modelo solo declara soporte para inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- No se dispone de información sobre sesgos, riesgo de alucinación ni evaluaciones de seguridad del modelo base.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad de forma notable; el autor recomienda Q4_K_S o Q4_K_M como equilibrio entre velocidad y calidad.
- No hay cuantizaciones ponderadas con imatrix disponibles en el momento de la publicación, lo que puede afectar a la calidad relativa de las cuantizaciones de baja precisión.
- El repositorio tiene un volumen de descargas muy bajo (105) y ningún "like", lo que sugiere escasa validación comunitaria.
- El tamano del repo (224 GB) implica que la descarga completa de todas las variantes es costosa; conviene descargar solo la cuantización necesaria.
- No se dispone de información sobre la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas.

## Enlaces

- Repositorio Hugging Face del modelo cuantizado: https://huggingface.co/mradermacher/hybrid-play-32B-GGUF
- Modelo base: https://huggingface.co/hybrid-gym/hybrid-play-32B
- Página de descargas del autor: https://hf.tst.eu/model#hybrid-play-32B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Página de solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
