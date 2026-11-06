# mradermacher/AniMUL-v1-GGUF

## Resumen

AniMUL-v1 es un modelo multimodal (texto y audio) orientado a la comunicacion interespecies, la biologia y el estudio de sonidos animales. El modelo original lo desarrolla el usuario deepcrayon; la ficha que nos ocupa es la version cuantizada en GGUF publicada por mradermacher, un perfil conocido por distribuir cuantizaciones estaticas de modelos abiertos en formato compatible con llama.cpp. El modelo se entrena sobre el dataset EarthSpeciesProject/NatureLM-audio-training, lo que lo situa en el nicho de la bioacustica computacional y la investigacion de ecosistemas.

Con 30.532.646.912 parametros (aproximadamente 30,5 mil millones), AniMUL-v1 se enmarca en la categoria de modelos densos de gran tamano. La version GGUF incluye ficheros mmproj (multi-modal supplement) que confirman la presencia de un codificador multimodal para audio, ademas de los pesos del modelo de lenguaje. La licencia Apache 2.0 facilita su uso comercial y su integracion en proyectos de investigacion.

La relevancia actual del modelo radica en su especializacion: frente a los modelos generalistas, AniMUL-v1 se orienta a un dominio cientifico concreto (comunicacion animal) donde los datos de entrenamiento son escasos y especializados. La disponibilidad de cuantizaciones GGUF desde Q2_K hasta Q8_0 permite desplegarlo en hardware muy diverso, desde estaciones de trabajo con GPU de consumo hasta servidores con multiples aceleradores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal texto-audio; pesos en transformers) |
| Parametros totales | 30.532.646.912 (30,5 B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Los metadatos indican que se trata de un modelo multimodal con soporte de audio, dado que la version GGUF incluye ficheros `mmproj` (multi-modal projection) que acompanan a los pesos del modelo de lenguaje. El modelo base se distribuye a traves de la libreria transformers y esta etiquetado como "conversational", lo que sugiere un ajuste para dialogos multi-turno.

El entrenamiento se asocia al dataset EarthSpeciesProject/NatureLM-audio-training, un corpus orientado al aprendizaje de representaciones de audio de especies animales. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La cuantizacion la realiza mradermacher mediante su pipeline estandar (quantize_version 2, output_tensor_quantised 1, convert_type hf), que produce cuantizaciones estaticas sin imatrix en el momento de la publicacion.

## Capacidades

- Procesamiento de audio de origen biologico: el modelo esta disenado para trabajar con grabaciones de sonidos animales, gracias al modulo multimodal `mmproj` incluido en la distribucion GGUF.
- Generacion de texto conversacional: etiquetado como "conversational", admite dialogos multi-turno en ingles.
- Razonamiento sobre contenido biologico: las etiquetas "animal", "biology", "interspecies-communication", "nature" y "species" indican especializacion en dominio cientifico-natural.
- Clasificacion y analisis de especies: orientado a tareas de identificacion y estudio de especies a partir de audio.
- Soporte multimodal texto-audio: combinacion de entradas de audio con contexto textual.
- Capacidades de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos (`language: en`).
- Modo thinking, vision o audio adicional: solo audio confirmado por los ficheros mmproj; vision no disponible.

## Casos de uso

- Monitorizacion de biodiversidad en bosques: el modelo puede procesar grabaciones de campo para identificar especies presentes a partir de sus vocalizaciones, lo que permite estimar indices de biodiversidad sin necesidad de observacion directa. Es adecuado por su entrenamiento especifico en audio de especies.
- Investigacion en comunicacion interespecies: analisis de patrones acusticos y su correlacion con contextos conductuales, aprovechando la especializacion del modelo en el dominio.
- Conservacion de especies amenazadas: deteccion automatizada de vocalizaciones de especies en peligro en grandes volumenes de audio recogido por sensores remotos, reduciendo el coste de analisis manual.
- Educacion y divulgacion cientifica: generacion de descripciones y explicaciones sobre sonidos animales para plataformas educativas, usando la faceta conversacional del modelo en ingles.
- Bioacustica asistida por LLM: integracion en pipelines de investigacion donde se transcriben o describen eventos acusticos y se generan informes textuales a partir de ellos.
- Analisis de archivos historicos de grabaciones: procesamiento de colecciones de audio de museos o institutos biologicos para catalogacion y etiquetado semiautomatico.
- Prototipado de aplicaciones de naturaleza: desarrollo de asistentes o herramientas divulgativas sobre fauna que combinen entrada de audio y respuesta textual, gracias a las cuantizaciones ligeras (Q2_K, Q3_K_S) que caben en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11,4 GB con Q2_K; 16,7-18,7 GB con IQ4_XS y Q4_K_M; 21,2-21,8 GB con Q5_K_S y Q5_K_M; 25,2 GB con Q6_K; 32,6 GB con Q8_0. A esto hay que sumar el modulo mmproj (1,4 GB en Q8_0 o 2,3 GB en f16) y el espacio de contexto KV cache.
- GPU recomendadas: para Q8_0 se recomienda una A100 40 GB o H100; para Q6_K una RTX 4090 (24 GB) puede quedarse justa, siendo mas segura una A6000 (48 GB) o A100; para Q4_K_M y Q5_K_M son suficientes una RTX 4090 (24 GB) o una RTX 3090 (24 GB).
- Cabe en GPU de consumo: si, en cuantizaciones Q2_K a Q5_K_M con GPUs de 12-24 GB (RTX 3060 12 GB solo para Q2_K; RTX 3090/4090 para Q4_K_M y Q5_K_M). Q6_K y Q8_0 requieren GPUs profesionales o configuraciones multi-GPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). Para el modelo base en transformers se puede usar vLLM o TGI, aunque la informacion no confirma compatibilidad especifica.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AniMUL-v1 (GGUF) | 30,5 B | no disponible | texto + audio | Apache 2.0 | Hugging Face (GGUF) |
| Modelos generalistas de ~30 B (p. ej. familia Llama o Qwen) | ~30 B | 8k-128k segun variante | texto (algunos multimodal) | variable | Hugging Face |
| Modelos de bioacustica especializados (p. ej. BirdNET, Perch) | < 1 B tipicamente | no aplica | audio | variable | Hugging Face / GitHub |

La comparativa con modelos generalistas de aproximadamente 30 B es pertinente por tamano, pero AniMUL-v1 se diferencia por su especializacion en audio biologico y su naturaleza multimodal. Frente a clasificadores bioacusticos clasicos como BirdNET o Perch (mucho mas pequenos y centrados en clasificacion), AniMUL-v1 aporta generacion de texto y dialogo, aunque a costa de un consumo de recursos mucho mayor. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; el uso en castellano no esta garantizado y probablemente degrade la calidad.
- La especializacion en audio biologico implica un rendimiento previsiblemente pobre en tareas generales de texto, codigo o matematicas, aunque no se han publicado evaluaciones que lo confirmen.
- Riesgo de alucinacion en la identificacion de especies: sin benchmarks publicados, no hay garantia de precision taxonomica; las salidas deben validarse con expertos.
- No se documenta la longitud de contexto, lo que impide planificar aplicaciones con ventanas largas.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable segun las notas del propio publicador; para produccion se recomienda Q4_K_M o superior.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del dataset de entrenamiento (EarthSpeciesProject/NatureLM-audio-training) por si impone restricciones adicionales sobre los datos.
- El modelo base (deepcrayon/AniMUL-v1) no incluye en su model card informacion sobre sesgos, datos de entrenamiento detallados ni evaluaciones; la trazabilidad es limitada.
- El repositorio GGUF ocupa 211,6 GB, lo que exige planificar el almacenamiento y la descarga por partes.
- No se ofrecen cuantizaciones con imatrix en el momento de la publicacion, lo que puede afectar a la calidad en cuantizaciones bajas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AniMUL-v1-GGUF
- Modelo base: https://huggingface.co/deepcrayon/AniMUL-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/EarthSpeciesProject/NatureLM-audio-training
- Pagina de descargas del publicador: https://hf.tst.eu/model#AniMUL-v1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
