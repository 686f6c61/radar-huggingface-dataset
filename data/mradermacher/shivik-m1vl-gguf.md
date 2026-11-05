# mradermacher/shivik-m1vl-GGUF

## Resumen

shivik-m1vl-GGUF es la version cuantizada en formato GGUF del modelo ziadrone/shivik-m1vl, un modelo multimodal de aproximadamente 3.086 millones de parametros (3,08 B) publicado originalmente por el usuario ziadrone y convertido a GGUF por mradermacher, un conocido creador de cuantizaciones de la comunidad. El modelo base esta etiquetado como conversacional y multimodal (incluye un proyector multimodal mmproj), lo que sugiere capacidades de vision-lenguaje, aunque la model card del cuantizador no detalla la arquitectura interna ni el proceso de entrenamiento.

La relevancia de esta publicacion radica en que permite ejecutar un modelo multimodal de ~3 B de parametros en hardware de consumo mediante llama.cpp y derivados (Ollama, LM Studio, etc.), con cuantizaciones que van desde 1,4 GB (Q2_K) hasta 6,3 GB (f16), mas el proyector multimodal en Q8_0 (0,9 GB) o f16 (1,4 GB). El repo ocupa 30,1 GB en total por incluir todas las variantes.

La informacion disponible es limitada: no se especifican licencia, longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks. Esta ficha refleja unicamente los datos verificables del repo y de la model card, indicando explicitamente cuando un dato no esta disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer multimodal, segun presencia de mmproj) |
| Parametros totales | 3.085.938.688 (~3,08 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyector multimodal en mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |
| Modelo base | ziadrone/shivik-m1vl |
| Tamano del repo | 30,1 GB (todas las cuantizaciones) |
| Cuantizador | mradermacher |
| Fecha de creacion | 2025-12-16 |
| Ultima actualizacion | 2026-11-05 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base ziadrone/shivik-m1vl en la documentacion proporcionada. La presencia de un fichero `mmproj` (proyector multimodal) en el repo GGUF indica que el modelo incorpora capacidad de procesamiento de imagenes junto a texto, tipicamente mediante un encoder visual acoplado a un modelo de lenguaje. El numero de parametros (3,08 B) y el tamano de las cuantizaciones son coherentes con un transformer denso de escala pequena, pero no se confirma si emplea atencion estandar, atencion lineal u otra variante.

Tampoco se detallan los datos de entrenamiento: no hay informacion sobre el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. El cuantizador indica que las cuantizaciones son estaticas (no imatrix/weighted), y que no tiene previsto generar variantes imatrix salvo peticion en la seccion de discusion de la comunidad. Las cuantizaciones se han generado con `quantize_version: 2` y `convert_type: hf`, es decir, a partir de los pesos en formato HuggingFace del modelo base.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repo.
- Procesamiento multimodal: el fichero mmproj sugiere entrada de imagenes junto a texto (vision-lenguaje), aunque no se detalla el alcance exacto.
- Ejecucion local en CPU y GPU mediante llama.cpp y ecosistema GGUF.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que facilita su integracion en servicios de inferencia.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en local: con cuantizaciones Q4_K_M de 2,0 GB, el modelo puede ejecutarse en portatiles con 8 GB de RAM y ofrecer respuestas conversacionales en ingles sin depender de la nube.
- Descripcion de imagenes en pipelines ligeros: gracias al proyector multimodal (mmproj-Q8_0, 0,9 GB), puede integrarse en flujos de etiquetado o generacion de alt-text donde el coste por inferencia en GPU de consumo sea un requisito.
- Educacion y demostraciones de IA multimodal: su tamano reducido permite desplegarlo en aulas o talleres con GPUs modestas (por ejemplo, RTX 3060 de 12 GB) usando llama.cpp u Ollama.
- Investigacion sobre cuantizacion: el repo ofrece 12 variantes de cuantizacion del mismo modelo, lo que permite estudiar el impacto de Q2_K frente a Q8_0 en calidad y velocidad sobre una misma tarea.
- Asistentes offline en dispositivos edge: con Q2_K (1,4 GB) o IQ4_XS (1,9 GB) puede ejecutarse en mini-PCs o dispositivos con poca memoria, util para entornos sin conectividad.
- Base para fine-tuning o experimentacion: al estar disponible el modelo base en safetensors (ziadrone/shivik-m1vl), se puede partir de el para ajuste especifico y luego comparar contra las cuantizaciones publicadas.
- Chat de soporte interno en ingles: para equipos que trabajan en ingles y necesitan un modelo autoalojado de bajo coste, las variantes Q4_K_S o Q4_K_M (1,9-2,0 GB) ofrecen un equilibrio razonable entre calidad y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~1,4 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~1,6-1,8 GB
  - IQ4_XS / Q4_K_S / Q4_K_M: ~1,9-2,0 GB
  - Q5_K_S / Q5_K_M: ~2,3 GB
  - Q6_K: ~2,6 GB
  - Q8_0: ~3,4 GB
  - f16: ~6,3 GB
  - Proyector multimodal adicional: ~0,9 GB (mmproj-Q8_0) o ~1,4 GB (mmproj-f16)
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM para cuantizaciones Q4/Q5 (por ejemplo, GTX 1650 4 GB, RTX 3050 8 GB, RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090). Para f16 y contexto largo, se recomienda 8-12 GB o mas. En el segmento profesional, A100 o H100 son sobredimensionadas para este tamano, pero validas para servir muchas instancias concurrentes.
- Cabe en GPU consumer: si, en practicamente todas las GPU con 6 GB o mas usando Q4_K_M o inferiores; en iGPU y CPU con 8 GB de RAM tambien es viable.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, y servidores compatibles con la API de OpenAI mediante llama.cpp server. vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. Como referencia cualitativa, un modelo de 3 B en Q4_K_M suele generar decenas de tokens por segundo en GPU consumer modernas, pero no se aportan mediciones verificadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| shivik-m1vl-GGUF | ~3,08 B | no disponible | si (mmproj) | no disponible | GGUF |
| Qwen2.5-VL-3B-Instruct | ~3,75 B | 32k (segun documentacion publica del modelo) | si | Apache 2.0 (segun su model card publica) | safetensors, GGUF en la comunidad |
| Llama 3.2 3B Instruct | ~3,21 B | 128k (segun su model card publica) | no (vision solo en 11B) | Llama 3.2 Community License | safetensors, GGUF |
| SmolVLM-2.2B-Instruct | ~2,2 B | 8k (segun su model card publica) | si | Apache 2.0 (segun su model card publica) | safetensors, GGUF |

Nota: los datos de los modelos comparativos provienen de sus model cards publicas y pueden variar; no se dispone de benchmarks del modelo shivik-m1vl para comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base ziadrone/shivik-m1vl antes de cualquier despliegue en produccion.
- Idioma: el modelo esta etiquetado unicamente como ingles (`language: en`); el rendimiento en castellano u otros idiomas no esta garantizado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en MMLU, HumanEval, GSM8K ni tareas multimodales, por lo que la evaluacion debe hacerse de forma empirica antes de adoptarlo.
- Riesgo de alucinacion: como cualquier modelo generativo de ~3 B, es probable que produzca respuestas plausibles pero incorrectas, especialmente en dominios especializados; no se han publicado evaluaciones de fidelidad.
- Contexto desconocido: al no documentarse la longitud de contexto, no se debe asumir soporte para conversaciones largas o documentos extensos.
- Cuantizaciones estaticas: el autor indica que no hay variantes imatrix/weighted disponibles, lo que puede suponer una perdida de calidad mayor en cuantizaciones bajas (Q2_K, Q3_K) frente a alternativas ponderadas.
- Modelo de nicho: con 116 descargas y 1 like en el momento de la consulta, la comunidad es muy reducida, lo que limita el soporte, la documentacion y la validacion independiente.
- Capacidades multimodales no documentadas en detalle: aunque existe el proyector mmproj, no se especifica que tareas visuales (OCR, VQA, captioning) estan cubiertas ni con que calidad.
- Uso en produccion: sin informacion sobre sesgos, seguridad ni filtros de contenido, se recomienda acompanar el despliegue de moderacion externa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/shivik-m1vl-GGUF
- Modelo base: https://huggingface.co/ziadrone/shivik-m1vl
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#shivik-m1vl-GGUF
- Repositorio de peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (patrocinador del cuantizador): https://www.nethype.de/
