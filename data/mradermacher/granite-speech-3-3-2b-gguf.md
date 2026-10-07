# mradermacher/granite-speech-3.3-2b-GGUF

## Resumen

mradermacher/granite-speech-3.3-2b-GGUF es una reproduccion en formato GGUF del modelo IBM granite-speech-3.3-2b, publicada por el usuario mradermacher. No se trata de un modelo nuevo ni de un entrenamiento propio: es una cuantizacion del modelo original de IBM, orientada a que pueda ejecutarse en hardware de consumo mediante llama.cpp y derivados (Ollama, LM Studio, koboldcpp, entre otros). El modelo base pertenece a la familia Granite Speech de IBM, especializada en tareas de voz, y cuenta con 2.533.541.888 parametros (aproximadamente 2,53 mil millones).

El repositorio incluye, ademas de los archivos GGUF con los pesos del modelo de lenguaje, archivos complementarios de tipo mmproj (multi-modal projector) que son imprescindibles para procesar entradas de audio. Esto confirma que el modelo es multimodal de audio-texto: acepta audio como entrada y genera texto, y no unicamente texto. La libreria declarada es transformers y el pipeline no esta especificado en la informacion disponible.

Su relevancia actual radica en que permite desplegar un modelo de voz multilingue de ~2,5B parametros en una unica GPU de consumo, con cuantizaciones que van desde 1,1 GB (Q2_K) hasta 5,2 GB (f16), lo que lo hace apto para transcripcion, traduccion de voz y asistentes hablados en local, sin depender de APIs externas. La licencia Apache 2.0 del modelo base permite uso comercial sin las restricciones tipicas de otros modelos de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multimodal de audio-lenguaje (encoder de audio + proyector multimodal + decoder tipo transformer). Detalle concreto de capas y atencion: no disponible |
| Parametros totales | 2.533.541.888 (aproximadamente 2,53 mil millones) |
| Parametros activos | No aplica: no hay evidencia de que sea un modelo MoE en la informacion disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 y f16; mas variantes con imatrix en el repositorio i1-GGUF. Proyector multimodal en mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | Multilingue; se declaran explicitamente: ingles (en), frances (fr), aleman (de), espanol (es) y portugues (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base esta en safetensors) |
| Tamano del repositorio | 24,5 GB (incluye todas las cuantizaciones) |
| Modelo base | ibm-granite/granite-speech-3.3-2b |
| Libreria declarada | transformers |
| Fecha de creacion | 2026-05-16 |
| Ultima actualizacion | 2026-10-06 |
| Descargas | 123 |
| Likes | 0 |

## Arquitectura y entrenamiento

La informacion disponible describe este repositorio como una cuantizacion estatica ("static quants") del modelo ibm-granite/granite-speech-3.3-2b, sin aportar detalles sobre su arquitectura interna ni sobre el proceso de entrenamiento. Lo que si puede deducirse con certeza a partir de los archivos publicados es que se trata de un sistema multimodal de audio, ya que el repositorio incluye archivos mmproj (Q8_0 y f16) descritos por el autor como "multi-modal supplement". Este tipo de archivo contiene el proyector que alinea las representaciones del encoder de audio con el espacio de embeddings del modelo de lenguaje.

Por tanto, la topologia esperable es la habitual en modelos de voz-lenguaje: un encoder acustico, un adaptador o proyector y un decoder generativo de texto. Los detalles sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO, tipo de encoder (conformer, transformer, etc.) y cualquier innovacion tecnica (atencion lineal, decodificacion especulativa, streaming) no estan disponibles en la informacion proporcionada. Del mismo modo, se desconoce si el modelo soporta entrada de audio en streaming o si requiere segmentos completos.

En el plano de la cuantizacion, el autor indica que los pesos se han cuantizado con el flujo habitual de llama.cpp (quantize_version 2, output_tensor_quantised 1, convert_type hf), y ofrece tanto cuantizaciones estaticas en este repositorio como cuantizaciones ponderadas con imatrix en el repositorio hermano granite-speech-3.3-2b-i1-GGUF, que suelen ofrecer mejor relacion calidad/tamano.

## Capacidades

- Entrada de audio y generacion de texto: el modelo es multimodal de audio, no solo de texto, y requiere el archivo mmproj para procesar la señal de voz.
- Reconocimiento automatico del habla (ASR) en cinco idiomas declarados: ingles, frances, aleman, espanol y portugues, mas la etiqueta generica "multilingual".
- Traduccion de voz: el hecho de que el modelo cubra varios idiomas y genere texto permite plantear tareas de traduccion hablada, aunque no se especifican los pares de idiomas soportados ni la calidad.
- Conversacion multi-turno: el repositorio incluye la etiqueta "conversational" y la compatibilidad con endpoints, lo que apunta a un uso orientado a dialogos.
- Compatibilidad con servidores de inferencia: la etiqueta endpoints_compatible indica que se puede exponer como servicio.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Vision o audio generativo (salida de audio): no disponible; solo se declara entrada de audio y salida de texto.
- Generacion de codigo y matematicas: no documentado para este modelo en la informacion disponible.

## Casos de uso

- Transcripcion de reuniones y notas de voz en local: con cuantizaciones Q4_K_M de 1,6 GB, el modelo puede ejecutarse en un portatil o en una GPU de gama media y transcribir audio en ingles, frances, aleman, espanol y portugues sin enviar datos a servicios externos, lo que es relevante para entornos con requisitos de privacidad.
- Subtitulado multilingue de contenido audiovisual: el soporte declarado de cinco idiomas permite generar subtitulos en distintos idiomas a partir de la pista de audio, encajando en flujos de postproduccion donde el coste por minuto de las APIs comerciales es un factor limitante.
- Asistente de voz para atencion al cliente: el modelo es conversacional y compatible con endpoints, por lo que puede desplegarse tras un servidor de inferencia y gestionar turnos de dialogo hablado con transcripcion integrada, reduciendo el numero de componentes del pipeline al no necesitar un ASR separado.
- Accesibilidad para personas con discapacidad auditiva: transcripcion en tiempo casi real de conversaciones presenciales o llamadas, ejecutable en el propio dispositivo, sin cuotas de uso ni latencia de red.
- Traduccion de voz para atencion presencial: en entornos como mostradores de hotel, hospitales o aeropuertos, el modelo puede convertir el habla de un interlocutor en texto en otro idioma, siempre que el par de idiomas este entre los cinco declarados.
- Indexacion y busqueda sobre archivos de audio corporativos: transcripcion masiva de grabaciones (soporte telefonico, entrevistas, formacion) para alimentar un indice de busqueda de texto, con el coste fijo de una GPU local en lugar de un coste variable por minuto.
- Prototipado rapido de aplicaciones de voz: al estar en GGUF, se puede integrar en entornos llama.cpp, Ollama o LM Studio para validar una idea de producto en horas y migrar despues al modelo base en safetensors si se necesita mas precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de la cuantizacion no incluye metricas de WER (word error rate), BLEU, MMLU ni ninguna otra, y los resultados de la busqueda web no contienen datos tecnicos sobre este modelo. Tampoco se dispone de cifras de latencia o throughput medidas.

## Requisitos de hardware

- VRAM estimada para los pesos, segun cuantizacion: Q2_K 1,1 GB; Q3_K_S 1,2 GB; Q3_K_M 1,4 GB; Q3_K_L 1,5 GB; IQ4_XS 1,5 GB; Q4_K_S 1,6 GB; Q4_K_M 1,6 GB; Q5_K_S y Q5_K_M 1,9 GB; Q6_K 2,2 GB; Q8_0 2,8 GB; f16 5,2 GB.
- Espacio adicional obligatorio para audio: el proyector multimodal ocupa 0,9 GB (mmproj-Q8_0) o 1,3 GB (mmproj-f16). Sin este archivo el modelo no procesa voz.
- VRAM total practica: aproximadamente 2,5-3 GB para Q4_K_M mas mmproj Q8_0, y en torno a 4 GB con Q8_0 mas mmproj Q8_0. El f16 mas mmproj f16 ronda los 6,5 GB.
- Cabe en GPU de consumo: si. Cualquier GPU con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 2070, e incluso integradas con memoria unificada compartida) puede ejecutar las cuantizaciones de 4 bits. Las cuantizaciones Q4 y Q5 son las recomendadas por el autor para un equilibrio entre velocidad y calidad; Q6_K se describe como de muy buena calidad y Q8_0 como la mejor calidad manteniendo velocidad.
- GPU de datacenter: A100, H100, L40S o similares no son necesarias. Solo tendrian sentido para servir muchas peticiones concurrentes con batching, no por requisitos de memoria.
- Opciones de despliegue: llama.cpp (referencia para este formato), Ollama, LM Studio, koboldcpp, servidores compatibles con endpoints de llama.cpp. El modelo base en safetensors puede servirse con vLLM o TGI si existe soporte para la arquitectura, aunque esto no se confirma en la informacion disponible.
- CPU: las cuantizaciones Q2_K a Q4_K son viables en CPU con memoria RAM suficiente, aunque la transcripcion de audio sera considerablemente mas lenta que en GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/granite-speech-3.3-2b-GGUF | ~2,53 mil millones | GGUF | en, fr, de, es, pt y multilingue | Apache 2.0 | Cuantizacion comunitaria del modelo de IBM; incluye mmproj para audio |
| ibm-granite/granite-speech-3.3-2b | ~2,53 mil millones | safetensors | en, fr, de, es, pt y multilingue | Apache 2.0 | Modelo original de IBM; maxima precision, requiere mas VRAM y soporte de la arquitectura en el runtime |
| Whisper large-v3 (referencia externa) | ~1,55 mil millones | safetensors, GGUF, etc. | ~99 idiomas declarados | MIT | Solo reconocimiento del habla y traduccion; no es un modelo conversacional. Datos de conocimiento publico, no verificados en la busqueda realizada |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real de estos modelos, por lo que la comparativa se limita a parametros, formato, idiomas y licencia. Otras alternativas de la misma categoria (Qwen2-Audio, Voxtral, Phi-4-multimodal) no estan documentadas en la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio es una cuantizacion de terceros, no una publicacion oficial de IBM. La calidad final depende del proceso de cuantizacion y puede diferir de la del modelo original en safetensors.
- Las cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la precision. Para uso en produccion se recomienda Q4_K_M o superior, o bien las variantes con imatrix del repositorio i1-GGUF.
- El archivo mmproj es obligatorio para cualquier tarea de audio. Descargar solo el GGUF del modelo de lenguaje desactiva de hecho la funcionalidad de voz.
- Riesgo de alucinacion en audio degradado: en modelos de reconocimiento del habla, el ruido de fondo, los acentos no cubiertos y el solapamiento de voces pueden provocar transcripciones inventadas o saltos de contenido. No se dispone de tasas de error publicadas para cuantificar este riesgo.
- Sesgos: no se dispone de informacion sobre la composicion del dataset de entrenamiento ni sobre evaluaciones de sesgo por acento, genero, edad o variedad dialectal. El espanol declarado no especifica variantes (peninsular, latinoamericana), lo que puede afectar al rendimiento en produccion.
- Cobertura limitada a cinco idiomas declarados. El etiquetado "multilingual" no implica soporte real del resto de lenguas.
- Longitud de contexto desconocida. No hay informacion sobre la duracion maxima de audio que el modelo puede procesar de una sola vez ni sobre el manejo de audios largos.
- Licencia permisiva: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar los avisos de copyright y el texto de la licencia. Conviene verificar la licencia del modelo base en su propio repositorio.
- Adopcion muy baja en el momento de la consulta (123 descargas, 0 likes), lo que implica poca validacion por parte de la comunidad y escasa evidencia empirica de comportamiento en produccion.
- El repositorio ocupa 24,5 GB porque incluye todas las cuantizaciones; conviene descargar solo el archivo necesario.
- No hay informacion sobre el soporte de esta arquitectura en runtimes concretos mas alla de llama.cpp y sus derivados; la integracion con vLLM o TGI deberia validarse antes de disenar un despliegue en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/granite-speech-3.3-2b-GGUF
- Modelo base en safetensors: https://huggingface.co/ibm-granite/granite-speech-3.3-2b
- Cuantizaciones con imatrix (i1-GGUF): https://huggingface.co/mradermacher/granite-speech-3.3-2b-i1-GGUF
- Pagina de resumen y listado de descargas del autor: https://hf.tst.eu/model#granite-speech-3.3-2b-GGUF
- Proyector multimodal Q8_0: https://huggingface.co/mradermacher/granite-speech-3.3-2b-GGUF/resolve/main/granite-speech-3.3-2b.mmproj-Q8_0.gguf
- Proyector multimodal f16: https://huggingface.co/mradermacher/granite-speech-3.3-2b-GGUF/resolve/main/granite-speech-3.3-2b.mmproj-f16.gguf
- Guia de uso de archivos GGUF (referencia README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (infraestructura empleada por el autor): https://www.nethype.de/
