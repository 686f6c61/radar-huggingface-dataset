# nwtgck/gemma-4-E2B-it-qat-q4_0-gguf

## Resumen

El repositorio `nwtgck/gemma-4-E2B-it-qat-q4_0-gguf` es una conversion a formato GGUF (cuantizacion Q4_0) del checkpoint instruction-tuned Gemma 4 E2B optimizado con Quantization-Aware Training (QAT), desarrollado originalmente por Google DeepMind. El modelo pertenece a la familia Gemma 4, publicada bajo licencia Apache 2.0, y esta disenado para despliegue en dispositivos de gama baja: moviles, portatiles y equipos de borde. Se trata de la variante mas pequena de la familia, con 2,3B parametros efectivos (5,1B contando embeddings) y capacidad multimodal de entrada (texto, imagen y audio) con salida de texto.

El checkpoint subyacente es `google/gemma-4-E2B-it-qat-q4_0-unquantized`, y esta version GGUF la publica el usuario nwtgck para facilitar su uso en el ecosistema llama.cpp/Ollama, que no consume safetensors. La relevancia actual del modelo radica en que el QAT permite mantener una calidad cercana a bfloat16 reduciendo drasticamente los requisitos de memoria, lo que habilita inferencia local en hardware de consumo sin GPU dedicada de gama alta.

Arquitectonicamente es un transformer denso con atencion hibrida que intercala ventanas locales deslizantes de 512 tokens con capas de atencion global, 35 capas y un vocabulario de 262K tokens. Su ventana de contexto es de 128K tokens, inferior a los 256K de las variantes medianas de la familia. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye resultados de benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con atencion hibrida (sliding window local de 512 tokens + atencion global) y Per-Layer Embeddings (PLE) |
| Parametros totales | 4.628.569.635 (~4,63B) segun los pesos publicados; la ficha oficial de E2B declara 2,3B efectivos y 5,1B incluyendo embeddings |
| Parametros activos | no aplica (variante densa, no MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | Q4_0 (GGUF, la de este repo); la familia ofrece tambien checkpoints QAT sin cuantizar, wNa8o8 para movil y w4a16 en compressed-tensors |
| Idiomas soportados | mas de 140 idiomas segun la ficha oficial; no se detalla la lista completa |
| Licencia | Apache 2.0 (con enlace a la licencia especifica de Gemma 4) |
| Formato de pesos | GGUF (Q4_0) en este repositorio; safetensors en el checkpoint base sin cuantizar |
| Capas | 35 |
| Ventana deslizante | 512 tokens |
| Tamano de vocabulario | 262K |
| Modalidades de entrada | texto, imagen y audio |
| Modalidad de salida | texto |
| Encoder de vision | ~150M parametros |
| Encoder de audio | ~300M parametros |
| Tamano del repositorio | 4,3 GB |

## Arquitectura y entrenamiento

Gemma 4 E2B es un transformer denso de 35 capas con un mecanismo de atencion hibrido: la mayoria de capas emplea atencion local con ventana deslizante de 512 tokens, mientras que determinadas capas aplican atencion global, garantizando que la ultima capa sea siempre global. Las capas globales unifican claves y valores (Keys y Values) y aplican Proportional RoPE (p-RoPE) para limitar el coste de memoria en contextos largos. Los modelos E2B incorporan Per-Layer Embeddings (PLE) para maximizar la eficiencia de parametros en ejecucion sobre dispositivo. El vocabulario es de 262K tokens y la familia comparte tokenizador. No se detalla en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset.

El checkpoint esta optimizado mediante Quantization-Aware Training (QAT), un proceso en el que el modelo se entrena simulando la cuantizacion a 4 bits para que los pesos finales conserven una calidad cercana a bfloat16 tras la conversion. Google publica cuatro serializaciones del mismo entrenamiento: checkpoints QAT sin cuantizar (para investigacion y compilacion propia), GGUF Q4_0 (el de este repositorio), un esquema wNa8o8 especifico para movil con capas de decodificacion de 2 bits, KV cache optimizada y activaciones estaticas, y tensores comprimidos w4a16 para vLLM. Segun la ficha, al usar decodificacion especulativa con un modelo asistente (multi-token prediction), el asistente debe ser tambien un checkpoint QAT de la misma precision. No se especifica en la informacion disponible si hubo fases de RLHF o DPO concretas, ni el volumen de datos de entrenamiento.

## Capacidades

- Generacion de texto conversacional con soporte nativo del rol `system` para conversaciones estructuradas.
- Razonamiento con modos de pensamiento (thinking) configurables, segun la ficha de la familia Gemma 4.
- Comprension de imagen con soporte de relacion de aspecto y resolucion variables.
- Entrada de audio nativa (encoder de ~300M parametros), disponible en E2B, E4B y 12B.
- Codigo y capacidades agenticas mejoradas respecto a la generacion anterior, con function calling nativo.
- Soporte de agentes autonomos y razonamiento multi-paso mediante tool calling.
- Multilingue: mas de 140 idiomas segun la documentacion oficial.
- Capacidad de decodificacion especulativa mediante modelos drafter del mismo pipeline QAT.
- Entrada multimodal (any-to-any en el pipeline declarado), con salida limitada a texto.

## Casos de uso

- Asistentes locales en movil o portatil: con 2,3B parametros efectivos y Q4_0, el modelo cabe en memoria unificada de dispositivos Apple Silicon o en GPUs integradas, permitiendo un asistente conversacional sin conexion a Internet.
- Procesamiento de documentos con imagenes: la entrada de vision permite extraer y resumir informacion de capturas, recibos o paginas escaneadas, con salida de texto estructurado.
- Transcripcion y resumen de audio: el encoder de audio nativo permite resumir reuniones o notas de voz directamente en el dispositivo, sin enviar datos a servidores externos.
- Clasificacion y enrutado de tickets de soporte: el soporte nativo del rol `system` y la ventana de 128K tokens permiten mantener el historial completo de una conversacion multi-turno y clasificar incidencias en un pipeline de atencion al cliente.
- Agentes locales con tool calling: integrado en flujos que invocan APIs o funciones del sistema operativo, adecuado para automatizaciones ligeras donde no se quiere depender de un modelo en la nube.
- Generacion de codigo asistida en editores: con 128K tokens de contexto puede indexar varios ficheros de un proyecto pequeno y completar o explicar codigo dentro del propio IDE.
- Prototipado e investigacion sobre QAT: al derivar de un checkpoint QAT sin cuantizar, sirve para estudiar el impacto de la cuantizacion de 4 bits en tareas multimodales comparando contra el modelo base.
- Preprocesado multilingue en pipelines de datos: con soporte de mas de 140 idiomas puede usarse para traduccion ligera, normalizacion o etiquetado de corpus sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas, y la busqueda web realizada no ha devuelto resultados tecnicos relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 4,3 GB en Q4_0, por lo que se estima un consumo de pesos en torno a 3-5 GB, con margen adicional para cache KV que crece con la longitud de contexto (no confirmado por el autor).
- GPU recomendadas: tarjetas de consumo con 8-12 GB o mas, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 o RTX 4090; en entornos de servidor, cualquier A100, H100 o L40S funciona sin problema, aunque estan sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si. Con cuantizacion Q4_0 y contextos cortos o medios, es viable en GPUs de 6-8 GB e incluso en GPUs integradas con memoria compartida.
- Despliegue en CPU y dispositivos moviles: el formato GGUF esta pensado para llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF. Para CPU pura se recomienda RAM suficiente para el modelo mas la cache KV.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores GGUF compatibles; para las variantes en compressed-tensors w4a16 la ruta recomendada es vLLM. TGI no es la via natural para este formato.
- Decodificacion especulativa: se puede usar un modelo drafter de la familia, siempre que sea un checkpoint QAT con la misma precision.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo para este repositorio.

## Comparativa con modelos similares

Comparativa dentro de la propia familia Gemma 4 QAT, segun los datos de la model card:

| Modelo | Parametros | Capas | Ventana deslizante | Contexto | Modalidades | Licencia |
|---|---|---|---|---|---|---|
| Gemma 4 E2B (este repo) | 2,3B efectivos (5,1B con embeddings) | 35 | 512 | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 E4B | 4,5B efectivos (8B con embeddings) | 42 | 512 | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 12B Unified | 11,95B | 48 | 1024 | 256K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 31B Dense | 30,7B | 60 | 1024 | 256K | Texto, imagen | Apache 2.0 |

Los datos de rendimiento comparativo (benchmarks) no estan disponibles en la informacion proporcionada. La familia incluye ademas variantes MoE, como Gemma 4 26B A4B, que no se detalla en la informacion disponible.

## Limitaciones y advertencias

- Riesgo de alucinacion inherente a los modelos de lenguaje generativos; no se documentan tasas de error especificas para este checkpoint.
- La cuantizacion Q4_0 introduce perdida de precision respecto al checkpoint QAT sin cuantizar; la ficha afirma calidad cercana a bfloat16, pero no aporta mediciones que lo cuantifiquen.
- La ventana de contexto es de 128K tokens, la mitad que las variantes medianas de la familia, lo que limita tareas de contexto muy largo.
- La lista exacta de idiomas soportados no se detalla; solo se indica "mas de 140 idiomas", sin garantia de calidad homogenea entre ellos.
- Aunque la etiqueta de licencia es Apache 2.0, el enlace apunta a la licencia especifica de Gemma 4, que puede incluir condiciones de uso adicionales. Conviene revisar el texto completo antes de un despliegue comercial.
- El repositorio lo publica un tercero (nwtgck), no Google DeepMind; la trazabilidad del proceso de conversion a GGUF no esta documentada en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validacion por parte de la comunidad.
- La ficha oficial indica que la decodificacion especulativa exige que el modelo asistente sea QAT y de la misma precision; usar un drafter no QAT puede degradar o romper la inferencia.
- La modalidad de salida es unicamente texto: no genera imagen ni audio aunque los acepte como entrada.
- La informacion disponible no incluye datos sobre sesgos, composicion del dataset de entrenamiento ni evaluaciones de seguridad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nwtgck/gemma-4-E2B-it-qat-q4_0-gguf
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Coleccion Gemma 4 QAT Q4_0: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de QAT en Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Informe tecnico (arXiv 2607.02770): https://arxiv.org/abs/2607.02770
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de la familia Gemma de Google DeepMind: https://deepmind.google/models/gemma/
- Busqueda web: no se han encontrado enlaces tecnicos relevantes sobre este modelo en los resultados disponibles.
