# chatpig/cantonese-tts-gguf

## Resumen

cantonese-tts-gguf es un paquete de pesos en formato GGUF para síntesis de voz (text-to-speech) en cantonés, publicado por el usuario chatpig sobre los modelos base de la familia `cantonese-dev/cantonese` (versiones 0.6b y 1.7b). El repositorio agrupa múltiples variantes cuantizadas (v1, v1.2, v1.3, 1.7b-v1.1 y la nueva estructura "cantonese") junto con adaptadores LoRA y un tokenizador de audio de 12 Hz, todo empaquetado para su uso con una herramienta CLI llamada `gguf`. El objetivo es ofrecer inferencia TTS local en cantonés con control de voz mediante instrucciones en lenguaje natural y clonación de voz a partir de una muestra de referencia.

El modelo resuelve un nicho concreto: la generación de habla en cantonés (yue), un idioma con escasa cobertura en los sistemas TTS comerciales y open source, que suelen centrarse en mandarín. La relevancia actual radica en que combina un tamaño reducido (el checkpoint registrado en safetensors declara 914.643.008 parámetros, es decir, ~0,9 B) con licencia Apache 2.0, lo que permite despliegue en hardware modesto y uso comercial sin restricciones adicionales.

La model card documenta tres capacidades principales: diseño de voz mediante instrucciones textuales ("A warm, low female voice, speaking slowly"), clonación de voz a partir de un audio de referencia y, en la variante 1.7b, clonación con texto de referencia (ICL). El repositorio ocupa 32,3 GB e incluye pesos en varias precisiones, adaptadores y ficheros de audio de ejemplo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS basado en transformer con tokenizador de audio de 12 Hz; estructura interna no detallada) |
| Parametros totales | 914.643.008 (checkpoint safetensors del repo); variantes 0.6b y 1.7b segun nombre |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (ficheros `-q8_0.gguf`); adaptadores en F16; tokenizador de audio en Q8_0 y NVFP4 |
| Idiomas soportados | cantonés (yue); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo, adaptadores y codec); safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. La model card indica que la version "cantonese" (nueva estructura) sustituye a la estructura anterior denominada `qwen3-tts`, y que soporta clonacion de voz y diseno de voz por defecto sin necesidad de adaptador, ademas de servir como base para fine-tuning. El pipeline incluye un modelo de codec de audio independiente (`tts-tokenizer-12hz` en Q8_0 o `qwen-tokenizer-12hz-nvfp4` en versiones anteriores), lo que sugiere una arquitectura de tokenizacion discreta del audio a 12 Hz seguida de generacion autoregresiva, aunque este extremo no se confirma en la informacion proporcionada.

Respecto a los datos de entrenamiento, la model card enlaza el dataset `cantonese-dev/cantonese-yt-8gb`, descrito como fuente del entrenamiento de la version v1.2. No se especifican el numero de tokens, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO. Si se documenta que la v1.2 produce habla mas natural y fluida pero tiene problemas en el diseno de voz, mientras que la v1.3 mejora el diseno de voz a costa de naturalidad; por ello se entreno un adaptador sobre el dataset de v1.3 para combinarlo con el modelo v1.2 y obtener lo mejor de ambos. La variante 1.7b-v1.1 anade clonacion de voz con texto de referencia (ICL) frente a la clonacion simple.

## Capacidades

- Sintesis de voz (TTS) en cantonés a partir de texto escrito en caracteres chinos.
- Diseno de voz mediante instrucciones en lenguaje natural (tono, genero percibido, velocidad, calidez).
- Clonacion de voz zero-shot a partir de un audio de referencia (`-r out_ref.wav`).
- Clonacion de voz con texto de referencia (ICL) en la variante 1.7b-v1.1, que mejora la fidelidad de la imitacion.
- Soporte de adaptadores LoRA en formato GGUF F16 para modular el estilo o la voz.
- Capacidad de fine-tuning adicional sobre el modelo base, segun la nota del desarrollador.
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada mas alla de la referencia de clonacion, ni razonamiento multi-paso; no disponibles.

## Casos de uso

- Doblaje y localizacion de contenido al cantonés: el modelo permite generar pistas de voz para videos, cursos o audiolibros en yue, un idioma con poca cobertura en herramientas TTS comerciales, usando diseno de voz para mantener un registro consistente entre fragmentos.
- Asistentes de voz y chatbots telefonicos en cantonés: integrado en un pipeline de ASR + LLM + TTS, el modelo aporta la capa de salida hablada con latencia baja gracias a su tamano de ~0,6-1,7 B y a la cuantizacion Q8_0.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de articulos, mensajes y documentos en cantonés con voces personalizables mediante instrucciones de estilo.
- Clonacion de voz para preservacion de identidad: la variante 1.7b-v1.1 permite generar habla con la voz de un hablante concreto a partir de una muestra corta, util para audiolibros narrados por el propio autor o para mantener la voz de marca en campanas.
- Prototipado de videojuegos y narrativa interactiva: generacion de dialogos de personajes con voces diferenciadas mediante diseno de voz o adaptadores, sin depender de servicios en la nube.
- Investigacion en TTS de lenguas de baja resources: el modelo y su dataset asociado (`cantonese-yt-8gb`) sirven como base para experimentos de fine-tuning, evaluacion de naturalidad y comparacion de estrategias de clonacion en cantonés.
- Generacion de material educativo para aprendizaje de cantonés: produccion de ejemplos de pronunciacion con velocidad controlada ("speaking slowly") y voces de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por tamano, un modelo de ~0,6 B en Q8_0 ocupa del orden de 0,6-0,8 GB de pesos, y uno de ~1,7 B en Q8_0 del orden de 1,7-2 GB; a ello hay que sumar el codec de audio y el adaptador F16. Estas cifras son estimaciones por parametros, no datos publicados por el autor.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, el modelo deberia caber en GPUs consumer con 8 GB o mas de VRAM; la viabilidad exacta no esta confirmada.
- Cabe en GPU consumer: previsiblemente si, dado el rango de 0,6-1,7 B de parametros, aunque no hay confirmacion oficial.
- Opciones de despliegue: la model card documenta una CLI propia llamada `gguf` con flags `-m` (modelo), `--adapter`, `--codec-model`, `--instruction`, `-t` (texto), `-r` (referencia de voz), `--reference-text` y `-o` (salida). No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones soportadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| chatpig/cantonese-tts-gguf | ~0,6-1,7 B (914.643.008 en safetensors) | no disponible | cantonés | Apache 2.0 | GGUF |
| cantonese-dev/cantonese-1.7b-v1.1 (modelo base) | 1,7 B | no disponible | cantonés | no disponible en la informacion | safetensors |
| cantonese-dev/cantonese-1.2-0.6b (modelo base) | 0,6 B | no disponible | cantonés | no disponible en la informacion | safetensors |

No se dispone de datos de benchmarks ni de modelos TTS comparables de otros desarrolladores en la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- La informacion sobre arquitectura, contexto y datos de entrenamiento es muy limitada; la model card se centra en ejemplos de uso y no en especificaciones tecnicas.
- El modelo esta especializado exclusivamente en cantonés; no se documenta soporte de otros idiomas, incluido el mandarin.
- Riesgo de alucinacion y de pronunciacion incorrecta en textos con caracteres poco frecuentes, neologismos o code-switching con ingles; no cuantificado en la informacion disponible.
- La clonacion de voz plantea riesgos de suplantacion de identidad y deepfakes; la licencia Apache 2.0 no impone restricciones de uso, por lo que la responsabilidad etica y legal recae en el desplegador.
- La calidad varia entre versiones: v1.2 es mas natural pero peor en diseno de voz; v1.3 mejora el diseno pero pierde naturalidad; el adaptador busca compensar esta trade-off, aunque el propio autor lo presenta como una solucion experimental.
- El repositorio mezcla varios modelos base y versiones, lo que puede generar confusion sobre que fichero corresponde a que variante; es necesario revisar los nombres exactos antes de desplegar.
- No se documentan limitaciones de contexto ni de longitud de texto de entrada; conviene validar el comportamiento con parrafos largos.
- La herramienta de inferencia documentada es una CLI propia (`gguf`), no estandares ampliamente adoptados como llama.cpp u Ollama; la integracion en produccion puede requerir trabajo adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chatpig/cantonese-tts-gguf
- Modelo base 1.7b-v1.1: https://huggingface.co/cantonese-dev/cantonese-1.7b-v1.1
- Dataset de entrenamiento citado: https://huggingface.co/datasets/cantonese-dev/cantonese-yt-8gb
- Audios de ejemplo (alojados en el repo): https://huggingface.co/gguf-org/cantonese-tts-gguf/resolve/main/out_adapter_f_chicken_theory.mp3, https://huggingface.co/gguf-org/cantonese-tts-gguf/resolve/main/out_17_clone.wav, https://huggingface.co/gguf-org/cantonese-tts-gguf/resolve/main/out_17_voicedesign.wav
