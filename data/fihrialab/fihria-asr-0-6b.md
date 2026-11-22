# fihriaLab/fihrIA-ASR-0.6B

## Resumen

fihrIA-ASR-0.6B es un modelo de reconocimiento automatico del habla (ASR) especializado en dariya, el arabe dialectal marroqui, desarrollado por fihriaLab. Se trata de un fine-tuning del modelo Qwen3-ASR-0.6B de Alibaba Qwen, adaptado mediante un tokenizer compartido de 89.000 tokens especifico para dariya y evaluado bajo un protocolo unificado de la familia fihrIA-ASR. El modelo resuelve un problema concreto: la transcripcion robusta de habla marroqui real, caracterizada por code-switching natural entre dariya, frances e ingles, con salida directa en escritura arabe.

Con 717.979.648 parametros totales (aproximadamente 0,72B) y pesos en BF16 de 1,44 GB, el modelo esta disenado para despliegue en GPU y, mediante su build GGUF cuantizado a 4 bits (721 MB), para ejecucion en tiempo real en CPU de portatil. La licencia Apache 2.0 y su tamano contenido lo hacen relevante para aplicaciones de transcripcion en produccion con requisitos de latencia ajustados y sin dependencia de APIs propietarias.

El modelo forma parte de una familia de dos tamanos (0,6B y 1,7B) que segun el autor establece el estado del arte entre los modelos ASR de dariya con pesos abiertos, superando en tasa de error semantico a alternativas de mayor tamano como Mistral Voxtral Mini 4B y MoulSot 1.7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_asr (encoder de audio + proyector multimodal + modelo de lenguaje); registrada en transformers como `qwen3_asr` |
| Parametros totales | 717.979.648 (aproximadamente 0,72B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (este repo); Q4_K_M disponible en el build GGUF |
| Idiomas soportados | ar (arabe), ary (dariya marroqui); code-switching con frances e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `qwen3_asr` heredada de Qwen3-ASR-0.6B, compuesta por un encoder de audio, un proyector multimodal que alinea las representaciones acusticas con el espacio del modelo de lenguaje y un modelo de lenguaje como decodificador. Los pesos completos (encoder, proyector y LM) se distribuyen en un unico `model.safetensors` de 1,44 GB en BF16. La inferencia se ejecuta mediante el paquete `qwen-asr` (version 0.0.6), que proporciona backends para `transformers` (con `transformers==4.57.6`) y para vLLM (con `vllm==0.14.0`).

El entrenamiento parte del checkpoint preentrenado Qwen/Qwen3-ASR-0.6B y se realiza un fine-tuning especifico para dariya utilizando un tokenizer compartido de 89.000 tokens disenado para la familia fihrIA-ASR. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La evaluacion se realizo bajo un protocolo unificado con cuatro jueces LLM independientes sobre 508 clips, con conjuntos de test denominados Prism y Probe para la metrica DarijaCS CER.

## Capacidades

- Transcripcion de voz a texto (ASR) en dariya marroqui con salida nativa en escritura arabe.
- Manejo robusto de code-switching: transcribe frases mixtas con palabras en frances e ingles embebidas en dariya hablado.
- Formateo y estructura linguistica adaptados a las particularidades del dariya.
- Procesamiento de audio a 16 kHz mono (segun el clip de ejemplo `sample.wav` de 3,11 s).
- Inferencia por lotes (batching) mediante el backend vLLM para alto throughput.
- Despliegue en CPU en tiempo real mediante el build GGUF Q4_K_M con llama.cpp.
- Soporte de dos tamanos de la familia (0,6B y 1,7B) con layout de repositorio identico.
- No se especifican en la informacion disponible capacidades de tool calling, agentes, vision, audio generativo ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion de reuniones y entrevistas en dariya: el modelo convierte audio de conversaciones reales en texto en escritura arabe, gestionando las mezclas naturales de frances e ingles que aparecen en el habla marroqui cotidiana.
- Subtitulado y transcripcion de contenido audiovisual marroqui: series, podcasts y videos de YouTube en dariya pueden transcribirse con el modelo BF16 en GPU para generar subtitulos, con el build GGUF como alternativa de bajo coste en CPU.
- Atencion al cliente telefonica automatizada: integracion del modelo en pipelines de ASR para transcribir llamadas de soporte en dariya antes de pasarlas a un sistema de analisis o a un LLM de respuesta, aprovechando el throughput de 255x tiempo real en H100 para procesar volumenes altos.
- Actas y notas clinicas o legales dictadas en dariya: transcripcion de dictados profesionales con salida directa en arabe, reduciendo la necesidad de post-procesado manual del texto.
- Investigacion linguistica y construccion de corpus: generacion de transcripciones a gran escala de dariya con code-switching para estudios sociolinguisticos, aprovechando el tokenizer de 89k tokens y la salida en escritura arabe nativa.
- Asistentes de voz embebidos en dispositivos edge: el build GGUF Q4 (721 MB) permite ejecutar ASR en tiempo real (5,98x tiempo real) en CPU de portatil, habilitando asistentes locales sin GPU ni conexion a la nube.
- Moderacion y analisis de contenido en plataformas: transcripcion masiva de audio en dariya para clasificacion de contenido, busqueda por texto y accesibilidad, usando vLLM para batching de alta densidad en GPU.

## Benchmarks y rendimiento

Los datos publicados por el autor comparan la familia fihrIA-ASR con Mistral Voxtral Mini 4B y MoulSot 1.7B. Las cifras de SER son la media de cuatro jueces LLM independientes sobre 508 clips; las de Voxtral en DarijaCS son sus propias cifras publicadas y el resto son reruns del autor sobre los mismos clips.

| Metrica | fihrIA-ASR 0.6B | fihrIA-ASR 1.7B | Voxtral Mini 4B | MoulSot 1.7B |
|---|---|---|---|---|
| SER medio en held-out (menor es mejor) | 7,1% | 6,1% | 8,4% | 11,2% |
| DarijaCS CER Prism / Probe, BF16 (menor es mejor) | 7,98% / 9,80% | 6,24% / 8,71% | 6,68% / 9,69% | 10,27% / 14,93% |
| Throughput en H100 (mayor es mejor) | 255x tiempo real | 243x tiempo real | 34x | 147x |
| CPU de portatil, Q4 (mayor es mejor) | 5,98x tiempo real | no disponible | no disponible | 3,06x tiempo real |
| Huella BF16 / Q4 | 1.447 MB / 721 MB | 3.830 MB / 1.642 MB | no disponible | no disponible |

Cifras adicionales de CER en Q4 publicadas para los builds GGUF: 0,6B con 7,98% / 9,84% y 1,7B con 6,54% / 9,23% (Prism / Probe).

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4 GB (1,44 GB de pesos mas KV cache y activaciones); 8 GB es comodo para batching.
- GPU recomendadas: NVIDIA con CUDA compatible; H100 para alto throughput (255x tiempo real en el 0,6B); cualquier GPU NVIDIA con al menos 4-8 GB de VRAM para inferencia individual.
- Cabe en GPU consumer: si, con 4 GB de VRAM en BF16 y 8 GB para batching; el build GGUF Q4 (721 MB) permite ejecucion en CPU.
- Opciones de despliegue: `transformers` (backend por defecto), vLLM (`qwen-asr[vllm]==0.0.6`, con `vllm==0.14.0`) para batching de alto throughput, y llama.cpp con el build GGUF para CPU.
- Latencia y throughput: 255x tiempo real en una H100 (BF16, 0,6B); 5,98x tiempo real en CPU de portatil con Q4; BF16 en CPU es impractical segun el autor.
- Requisitos de software: Python 3.10-3.12, `qwen-asr==0.0.6`, `transformers==4.57.6`; aproximadamente 6 GB de disco para el virtualenv (incluye wheels de PyTorch CUDA 13.2). Para drivers CUDA 12, instalar previamente un wheel de PyTorch compatible desde pytorch.org. Usar un virtualenv distinto por backend, ya que `qwen-asr[vllm]` fija `vllm==0.14.0` con `torch==2.9.x` y librerias CUDA 12.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SER held-out | Throughput H100 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| fihrIA-ASR-0.6B | 0,72B | no disponible | 7,1% | 255x | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| fihrIA-ASR-1.7B | 1,7B (aproximado, segun nombre) | no disponible | 6,1% | 243x | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| Mistral Voxtral Mini 4B | 4B | no disponible | 8,4% | 34x | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| MoulSot 1.7B | 1,7B | no disponible | 11,2% | 147x | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

El 0,6B ofrece el mejor equilibrio tamano-rendimiento de la comparativa: supera en SER a modelos de mayor tamano (Voxtral 4B y MoulSot 1,7B) con una huella de 1,44 GB en BF16 y el mayor throughput medido en H100.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta entrenado para dariya (ary) y arabe (ar); su rendimiento en otros idiomas o dialectos arabes no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion en ASR: como todo modelo generativo, puede producir transcripciones plausibles pero incorrectas, especialmente con audio ruidoso, acentos no representados o terminologia tecnica.
- Sesgos no documentados: no se especifica la composicion demografica ni regional del dataset de entrenamiento, por lo que no puede evaluarse el sesgo por genero, edad, region o registro.
- Limitaciones de contexto: la longitud maxima de audio procesable no se indica en la informacion disponible; el ejemplo publicado es de 3,11 s.
- BF16 en CPU es impractical segun el autor; para despliegue sin GPU es obligatorio usar el build GGUF con llama.cpp.
- Dependencias fragiles: `qwen-asr[vllm]==0.0.6` fija `vllm==0.14.0` y `torch==2.9.x` con librerias CUDA 12, mientras que el paquete base arrastra PyTorch con CUDA 13.2; requiere virtualenv separados por backend y verificacion de la version de driver CUDA.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia de validacion externa de la comunidad.
- Las cifras de SER dependen de jueces LLM como metrica semantica, no de WER/CER clasicos en todos los casos; los resultados de Voxtral en DarijaCS proceden de sus propias publicaciones y no de un rerun independiente.

## Enlaces

- Modelo en Hugging Face (BF16): https://huggingface.co/fihriaLab/fihrIA-ASR-0.6B
- Build GGUF del 0.6B: https://huggingface.co/fihriaLab/fihrIA-ASR-0.6B-GGUF
- Modelo 1.7B (BF16): https://huggingface.co/fihriaLab/fihrIA-ASR-1.7B
- Build GGUF del 1.7B: https://huggingface.co/fihriaLab/fihrIA-ASR-1.7B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Repositorio de inferencia qwen-asr: https://github.com/QwenLM/Qwen3-ASR
- PyTorch (instalacion de wheels compatibles con CUDA): https://pytorch.org/get-started/locally/
