# nphearum/PsarAI-Omni-GGUF

## Resumen

PsarAI-Omni v0.1 GGUF es la distribucion cuantizada en formato GGUF del modelo nphearum/PsarAI-Omni, un sistema omni speech-to-speech que integra escucha, razonamiento y sintesis de voz en un unico pipeline. Lo desarrolla nphearum y se construye sobre Gemma-4-E2B-it, al que se le anaden un adaptador de audio para camboyano (khmer), ingles y frances, una LoRA de atencion para el modulo de lenguaje y un decodificador de voz con vocoder propio. La propuesta central es eliminar la cadena clasica de ASR, traduccion y TTS: el modelo recibe audio, genera una respuesta hablada directamente desde sus estados ocultos y puede ademas clonar una voz a partir de unos segundos de referencia.

El modelo tiene 4.647.450.147 parametros totales (aproximadamente 4.600 millones) y se distribuye en varios ficheros GGUF que cubren la base Gemma, el proyector multimodal con el adaptador de audio, la LoRA y el decodificador de voz. El repositorio ocupa 16 GB e incluye parches de codigo para llama.cpp y audio.cpp, ademas de un cliente Python que transmite la respuesta y sintetiza cada frase a medida que se escribe.

Su relevancia actual radica en dos factores: cubre el khmer, un idioma con escasa representacion en modelos abiertos, y ofrece una via de despliegue local completa (un solo llama-server con el build parcheado de PsarAI) para conversacion por voz con clonacion de hablante, sin depender de servicios externos. La licencia es la de Gemma, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Gemma-4-E2B-it) con torres de audio/vision, adaptador de audio fusionado en el mmproj, LoRA de atencion (r8) en el LM y decodificador de voz con vocoder |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (valor usado en el ejemplo de despliegue con `-c 4096`) |
| Tipos de cuantizacion | f16 en los ficheros publicados; no se detallan otras cuantizaciones |
| Idiomas soportados | km (khmer), en (ingles), fr (frances) |
| Licencia | gemma |
| Formato de pesos | GGUF (llama.cpp y audio.cpp) |

## Arquitectura y entrenamiento

El sistema se compone de cuatro piezas encadenadas. La base es Gemma-4-E2B-it, un transformer multimodal cuyas torres de audio y vision se conservan en el fichero mmproj. Sobre esa base se fusiona un adaptador de audio especifico para khmer, ingles y frances, y se aplica una LoRA de atencion (rango 8) sobre el modulo de lenguaje que se activa durante la fase de razonamiento. La sintesis de voz no usa un TTS independiente: un decodificador de voz incluido en el mmproj genera audio directamente a partir de los estados ocultos de Gemma, y un vocoder lo convierte en forma de onda. Para la clonacion de voz se emplea el codificador de hablante CAM++ junto con un decodificador de flujo y HiFT sobre mHuBERT-147 (denominado clone v3), que tambien permite TTS a partir de texto plano.

El pipeline de inferencia se reparte en dos pasadas: la ruta de chat (`/v1/chat/completions`) escucha y razona con el adaptador de audio y la LoRA activos, mientras que la ruta `/tts` desactiva la LoRA para esa pasada, toma los estados base de Gemma, los pasa por el decodificador de voz y el vocoder, y produce la locucion en la voz Jarvis por defecto o en la voz clonada a partir de una referencia. No se han publicado en la informacion disponible datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Speech-to-speech directo: entrada de audio, respuesta hablada, sin ASR, traduccion ni TTS intermedios.
- Comprension y generacion en khmer, ingles y frances.
- Razonamiento y generacion de texto a traves de la base Gemma-4-E2B-it, con la LoRA de atencion aplicada durante el pensamiento.
- Sintesis de voz con dos modos: voz Jarvis por defecto y clonacion de voz a partir de una referencia de audio (fichero o base64).
- Clonacion con decodificador de flujo, HiFT y mHuBERT-147 (clone v3), que permite tambien TTS desde texto plano.
- Codificador de hablante CAM++ integrado para la verificacion y extraccion de la identidad vocal.
- Torres de vision heredadas de Gemma-4-E2B-it presentes en el mmproj (no se detalla su uso en el pipeline de voz).
- Servicio HTTP con endpoints compatibles con OpenAI (`/v1/chat/completions`) y endpoint `/tts`.
- Cliente Python que transmite la respuesta y sintetiza cada frase en cuanto se escribe.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de voz para khmer: el modelo escucha una pregunta en khmer y responde hablando en el mismo idioma, lo que cubre un hueco de cobertura en asistentes locales para un idioma con pocos recursos. La voz Jarvis por defecto sirve para prototipos rapidos.
- Atencion al cliente multilingue en ingles y frances: un unico llama-server atiende conversaciones habladas en ambos idiomas, con la ventaja de que la respuesta se sintetiza en el mismo proceso y no requiere orquestar servicios de ASR y TTS separados.
- Clonacion de voz para accesibilidad: a partir de una grabacion de referencia de pocos segundos (el ejemplo usa un clip de 9 s), el modelo reproduce las respuestas con la voz del usuario, util para personas que pierden la voz o para preservar una identidad vocal en interfaces conversacionales.
- Integracion en aplicaciones de escritorio o embebidas: al distribuirse en GGUF y ejecutarse con llama.cpp, puede desplegarse en local sin conexion, lo que encaja en escenarios con requisitos de privacidad del audio.
- Generacion de locuciones a partir de texto: el fichero `psarai-omni-speech.gguf` y el endpoint `/tts` permiten TTS plano en khmer, ingles y frances, aprovechable para doblaje o lectura de contenido.
- Investigacion en modelos omni de bajo parametraje: con unos 4.600 millones de parametros y pesos f16, sirve como banco de pruebas reproducible para estudiar la fusion de adaptadores de audio y decodificadores de voz sobre una base Gemma.
- Prototipado de interfaces conversacionales con streaming: el cliente Python sintetiza cada frase en cuanto se escribe, lo que permite construir interfaces de voz de baja latencia percibida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos se publican en f16 y el repositorio completo ocupa 16 GB; la base Gemma (unos 4.600 millones de parametros) en f16 ronda los 9-10 GB, a lo que se suman el mmproj completo y la LoRA. El ejemplo de despliegue usa `-ngl 99`, es decir, todas las capas en GPU.
- GPU recomendadas: no se especifican en la informacion; por tamano, una GPU de 24 GB (RTX 4090, A10G) o superior (A100 40/80 GB, H100) es el rango razonable para el conjunto completo en f16. No se confirma oficialmente.
- Cabe en GPU de consumo: previsiblemente en tarjetas de 24 GB o mas con los ficheros f16; no hay datos oficiales sobre cuantizaciones menores que reduzcan el requisito.
- Opciones de despliegue: build parcheado de PsarAI sobre llama.cpp de Unsloth (commit 6f4cc4d, b11985) compilado con `-DGGML_CUDA=ON`; modo hibrido con llama.cpp estandar mas audio.cpp con el parche de PsarAI; cliente Python `psarai_omni_gguf.py`. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. El diseno por frases y el streaming del cliente reducen la latencia percibida, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| PsarAI-Omni v0.1 GGUF | 4.647.450.147 | 4096 | km, en, fr | gemma | GGUF |
| Gemma-4-E2B-it (base) | no disponible en la informacion | no disponible | no disponible | gemma | safetensors, GGUF |
| Alternativas omni speech-to-speech de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables que permitan una comparacion cuantitativa. La unica referencia directa es Gemma-4-E2B-it, que actua como base sin las capacidades de audio y voz anadidas.

## Limitaciones y advertencias

- La licencia es la de Gemma, con las restricciones de uso comercial que impone ese acuerdo; conviene revisarlas antes de un despliegue en produccion.
- El modelo cubre solo khmer, ingles y frances; no hay soporte declarado para castellano ni otros idiomas.
- El contexto usado en el ejemplo de despliegue es de 4096 tokens, adecuado para turnos conversacionales pero limitado para documentos largos.
- Solo se publican pesos en f16, lo que eleva el requisito de VRAM y dificulta el despliegue en hardware modesto.
- El despliegue recomendado requiere aplicar parches al codigo de llama.cpp (build de PsarAI) o a audio.cpp; no es un flujo estandar con versiones oficiales sin modificar.
- La clonacion de voz plantea riesgos de suplantacion y requiere consentimiento explicito de la persona cuya voz se replica; no se detallan salvaguardas en la informacion.
- No se han publicado benchmarks, por lo que la calidad real en khmer, ingles y frances no puede contrastarse con metricas objetivas.
- Riesgo de alucinacion y sesgos: no hay datos publicados especificos; al heredar la base Gemma, arrastra los sesgos de sus datos de entrenamiento.
- El proyecto esta en version v0.1 y con pocas descargas (434) y sin likes, lo que indica una madurez y validacion comunitaria limitadas.

## Enlaces

- Hugging Face: https://huggingface.co/nphearum/PsarAI-Omni-GGUF
- Modelo base: https://huggingface.co/nphearum/PsarAI-Omni
- Ejemplos de audio (preguntas y respuestas): https://huggingface.co/nphearum/PsarAI-Omni-GGUF/tree/main/examples
- Parches de llama.cpp y audio.cpp: https://huggingface.co/nphearum/PsarAI-Omni-GGUF/tree/main/patches
- Cliente Python `psarai_omni_gguf.py` y configuracion `psarai-omni.json`: https://huggingface.co/nphearum/PsarAI-Omni-GGUF/tree/main
- llama.cpp de Unsloth (base del parche): https://github.com/unslothai/llama.cpp
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
