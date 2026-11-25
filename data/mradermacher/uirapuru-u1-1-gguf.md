# mradermacher/Uirapuru-U1.1-GGUF

## Resumen

Uirapuru-U1.1-GGUF es la version cuantizada en formato GGUF del modelo SynastriaNetworks/U1-0817, publicada por mradermacher, un conocido creador de cuantizaciones para la comunidad de inferencia local. El modelo base cuenta con 9.197.093.888 parametros (aproximadamente 9,2 mil millones) y esta orientado a tareas conversacionales, con soporte declarado para portugues e ingles. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta publicacion radica en que pone a disposicion del ecosistema llama.cpp un modelo de casi 10.000 millones de parametros en un amplio abanico de cuantizaciones (desde Q2_K hasta f16), incluyendo un complemento multimodal mmproj que sugiere capacidades de vision. El repositorio ocupa 85,1 GB en total, aunque cada archivo individual pesa entre 0,7 GB y 18,5 GB segun el nivel de cuantizacion.

No se dispone de informacion publica sobre la arquitectura interna del modelo base, los datos de entrenamiento ni resultados de benchmarks en la informacion proporcionada. Esta ficha se limita a documentar lo que consta en la model card y los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, sin detalle publicado) |
| Parametros totales | 9.197.093.888 (~9,2 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | portugues (pt), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo base SynastriaNetworks/U1-0817 en los datos disponibles. El recuento de parametros (9,2 B) y la etiqueta `transformers` sugieren un transformer decoder-only de escala media, pero no se confirma si emplea atencion completa, atencion lineal, mezcla de expertos u otra variante. Tampoco consta el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

La unica informacion tecnica concreta proviene del proceso de cuantizacion: mradermacher indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que implica una conversion desde pesos Hugging Face a GGUF con cuantizacion por tensor. Se ofrecen tambien cuantizaciones con imatrix (ponderadas) en el repositorio hermano `Uirapuru-U1.1-i1-GGUF`, que suelen preservar mejor la perplejidad a igual tamano. La presencia de archivos `mmproj` (multi-modal supplement) indica que el modelo base incorpora un proyector multimodal, presumiblemente para entrada de imagenes, aunque no se detalla que vision encoder utiliza.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Procesamiento multimodal: los archivos `mmproj-Q8_0.gguf` y `mmproj-f16.gguf` habilitan entrada de imagenes en llama.cpp, aunque no se especifica el tipo de tareas visuales soportadas.
- Soporte bilingue portugues-ingles declarado en los metadatos.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue detras de APIs compatibles con OpenAI.
- No consta soporte explicito de tool calling, function calling, modo thinking ni razonamiento multi-paso en la informacion disponible.
- No consta soporte de audio.

## Casos de uso

- Asistente conversacional en portugues para atencion al cliente: el modelo declara soporte nativo de portugues, lo que permite desplegar un chatbot local en llama.cpp sin depender de APIs externas, con la ventaja de que los datos no salen de la infraestructura propia.
- Procesamiento de documentos con imagenes en entornos con requisitos de privacidad: gracias al proyector multimodal mmproj, se puede usar para extraer informacion de capturas, formularios escaneados o diagramas en un pipeline local, manteniendo la confidencialidad.
- Prototipado rapido en estaciones de trabajo con GPU de consumo: la cuantizacion Q4_K_M (5,9 GB) cabe en GPUs de 8 GB de VRAM, lo que permite iterar sobre prompts y flujos conversacionales sin infraestructura dedicada.
- Generacion de resumenes y reescritura de textos en portugues e ingles: adecuado para herramientas internas de documentacion o soporte, donde el coste por token es cero una vez desplegado.
- Despliegue en edge o entornos aislados: el formato GGUF y la licencia Apache 2.0 permiten distribuir el modelo dentro de productos on-premise sin obligaciones de atribucion adicionales ni restricciones de uso comercial.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 niveles de cuantizacion distintos, lo que lo convierte en un banco de pruebas practico para medir el impacto de la cuantizacion en calidad y velocidad sobre un modelo de 9,2 B.
- Base para fine-tuning o adaptaciones ligeras: al ser Apache 2.0 y estar disponible en f16 (18,5 GB), puede servir como punto de partida para ajustes especificos de dominio en portugues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,0 GB
  - Q3_K_M: ~4,8 GB
  - IQ4_XS: ~5,5 GB
  - Q4_K_M: ~5,9 GB
  - Q5_K_M: ~6,7 GB
  - Q6_K: ~7,7 GB
  - Q8_0: ~9,9 GB
  - f16: ~18,5 GB
- Sumar aproximadamente 0,7-1,0 GB adicionales si se activa la entrada multimodal con los archivos mmproj.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q5_K_M/Q6_K con contexto moderado; RTX 4090 24 GB para Q8_0 o f16 con contexto amplio; A100 40/80 GB o H100 para despliegues concurrentes de alta throughput.
- Cabe en GPU de consumo: si, desde Q2_K en GPUs de 6 GB, y Q4_K_M en GPUs de 8 GB (con contexto limitado).
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI que acepten backend GGUF. No se menciona soporte de vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparacion rigurosa con alternativas de la misma categoria. Se indica "no disponible".

## Limitaciones y advertencias

- No hay informacion publica sobre sesgos del modelo base; al entrenarse presumiblemente con datos web, es esperable un sesgo hacia contenidos en portugues e ingles y una cobertura limitada de otras lenguas.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de fidelidad ni de tasas de hallucination.
- Soporte limitado a portugues e ingles; el rendimiento en castellano no esta documentado y no deberia asumirse.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior, o bien las variantes imatrix del repositorio i1.
- La licencia Apache 2.0 del modelo cuantizado se hereda del modelo base; conviene verificar que el modelo original SynastriaNetworks/U1-0817 mantiene efectivamente esa licencia y no impone restricciones adicionales por los datos de entrenamiento.
- El repositorio completo ocupa 85,1 GB; descargar solo el archivo de cuantizacion necesario, no el repo entero.
- No consta informacion sobre la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas sin pruebas empiricas.
- El modelo tiene solo 276 descargas y 1 like en el momento de la ficha, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Uirapuru-U1.1-GGUF
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Uirapuru-U1.1-i1-GGUF
- Modelo base: https://huggingface.co/SynastriaNetworks/U1-0817
- Pagina de descargas del autor: https://hf.tst.eu/model#Uirapuru-U1.1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
