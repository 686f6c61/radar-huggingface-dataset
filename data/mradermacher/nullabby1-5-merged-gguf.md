# mradermacher/nullabby1.5-merged-GGUF

## Resumen

nullabby1.5-merged-GGUF es la distribucion en formato GGUF del modelo nullabby1.5-merged, publicada por el usuario mradermacher, especializado en la cuantizacion de modelos para inferencia local. El modelo original, alojado en el repositorio nulliaukamk/nullabby1.5-merged, es un modelo de lenguaje de aproximadamente 8.950 millones de parametros (8,95 B) construido sobre la arquitectura etiquetada como qwen3_5, segun los tags del repositorio. Esta publicacion no entrena ni modifica el modelo, sino que ofrece conversiones estaticas a distintos niveles de cuantizacion GGUF para su uso con llama.cpp y herramientas compatibles.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~9 B parametros en hardware de consumo, con tamanos de fichero que van desde 3,9 GB en Q2_K hasta 18 GB en f16. La model card del autor de la cuantizacion es escasa: no documenta datos de entrenamiento, longitud de contexto, composicion del dataset ni resultados de benchmarks. Toda la informacion tecnica disponible procede de los metadatos del repositorio y de la lista de cuantizaciones proporcionada.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, y declara el ingles como unico idioma soportado en la model card. Incluye ficheros mmproj (multi-modal supplement), lo que sugiere capacidades multimodales heredadas del modelo base, aunque no se detalla su alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (etiqueta qwen3_5 en los tags del repositorio; detalles no disponibles) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | ingles (declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo original. Los tags del repositorio indican la etiqueta qwen3_5, lo que sugiere una arquitectura de la familia Qwen 3.5, pero no se confirma en la documentacion disponible. El recuento de parametros (8,95 B) corresponde a un modelo denso de tamano medio, aunque no se especifica si emplea mecanismos de atencion lineal, decodificacion especulativa u otras innovaciones.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones. La model card del cuantizador se limita a listar los ficheros generados y a remitir al modelo base para mas informacion. La presencia de ficheros mmproj indica que el modelo base incorpora algun componente multimodal (probablemente vision), pero no se detalla su arquitectura ni su entrenamiento.

## Capacidades

- Generacion de texto conversacional: el tag conversational y la compatibilidad con text-generation-inference indican uso para dialogos multi-turno.
- Capacidades multimodales: la presencia de ficheros mmproj (multi-modal supplement) sugiere soporte de entrada de imagenes, aunque no se especifica el alcance ni la calidad.
- Compatibilidad con text-generation-inference y transformers: el repositorio declara endpoints_compatible.
- Inferencia local mediante llama.cpp y derivados (Ollama, LM Studio) gracias al formato GGUF.
- Capacidades multilingues: limitadas al ingles segun la model card.
- No se documenta soporte explicito de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode).

## Casos de uso

- Prototipado local de asistentes conversacionales: con cuantizaciones Q4_K_M de 5,7 GB, el modelo puede ejecutarse en una GPU de consumo de 8 GB de VRAM y mantener dialogos multi-turno en ingles, adecuado para pruebas de concepto sin depender de la nube.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente con llama.cpp, los datos no salen del equipo, lo que encaja en escenarios de procesamiento de texto sensible en ingles.
- Generacion de texto en lote sobre hardware modesto: la version Q2_K (3,9 GB) permite ejecutar el modelo en equipos con poca VRAM o incluso en CPU, util para tareas de clasificacion o resumen de baja exigencia.
- Experimentacion multimodal: los ficheros mmproj permiten probar entrada de imagenes junto con texto en pipelines de llama.cpp, aunque sin garantias documentadas de calidad.
- Base para fine-tuning o evaluacion comparativa: al estar disponible en transformers y GGUF, sirve como punto de partida para experimentos academicos con modelos de ~9 B parametros.
- Integracion en pipelines de text-generation-inference: el tag endpoints_compatible facilita su despliegue como servicio HTTP compatible con la API de TGI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion):
  - Q2_K: ~4-5 GB
  - Q4_K_M: ~6-7 GB
  - Q6_K: ~8-9 GB
  - Q8_0: ~10-11 GB
  - f16: ~18-19 GB
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4-Q6; RTX 4090 24 GB para Q8_0 y f16; A100 o H100 para despliegues de alta concurrencia con f16.
- Cabe en GPU de consumo: si, desde Q2_K hasta Q6_K en GPUs de 8-12 GB; Q8_0 requiere 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (para pesos originales en transformers), transformers con safetensors.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nullabby1.5-merged-GGUF | ~8,95 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas, multimodal via mmproj |
| Llama 3.1 8B | 8 B | 128 K | Llama 3.1 Community | safetensors, GGUF | Ampliamente documentado, benchmarks publicos |
| Qwen2.5 7B | 7,6 B | 128 K | Apache 2.0 | safetensors, GGUF | Buen rendimiento en codigo y matematicas |
| Mistral 7B | 7,3 B | 32 K | Apache 2.0 | safetensors, GGUF | Referencia en modelos de 7 B |

La comparativa se limita a parametros, contexto y licencia, ya que no hay benchmarks publicados para nullabby1.5-merged que permitan comparar rendimiento. Los datos de contexto de los modelos alternativos son los declarados por sus respectivos autores.

## Limitaciones y advertencias

- Documentacion muy escasa: no se detallan datos de entrenamiento, contexto, sesgos ni evaluaciones, lo que dificulta valorar su calidad frente a alternativas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin benchmarks ni evaluaciones publicadas, no puede acotarse su magnitud.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado.
- Capacidades multimodales sin documentar: los ficheros mmproj existen, pero no se especifica que tareas cubren ni con que calidad.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base podria tener condiciones adicionales no reflejadas; conviene verificar el repositorio original.
- Cuantizaciones estaticas: el autor indica que no hay cuantizaciones ponderadas/imatrix disponibles, lo que puede afectar a la calidad en niveles bajos (Q2_K, Q3_K).
- Fecha de creacion futura en los metadatos (2026-11-19): inconsistencia que conviene tener en cuenta al evaluar la trazabilidad del repositorio.
- Sin soporte documentado de tool calling ni agentes: no recomendable para pipelines que dependan de estas capacidades sin validacion previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/nullabby1.5-merged-GGUF
- Modelo base: https://huggingface.co/nulliaukamk/nullabby1.5-merged
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#nullabby1.5-merged-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
