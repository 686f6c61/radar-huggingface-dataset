# openarcane/Volt-TTS

## Resumen

Volt-TTS es un modelo de texto a voz (TTS) especializado en 25 lenguas de la India, desarrollado por openarcane y publicado bajo licencia Apache-2.0. Se trata de un ajuste fino (fine-tuning) del modelo Qwen3-TTS-12Hz-1.7B-Base del equipo Qwen, al que se le han anadido embeddings de tokens especificos para lenguas indicas, elevando el total de parametros a 2.021.578.816 (1,93B de la base mas 93M de los nuevos embeddings). El modelo resuelve el problema de la sintesis de voz multilingue en un ecosistema linguistico tradicionalmente poco cubierto por los TTS comerciales.

La propuesta diferencial de Volt-TTS es triple: cubre 25 lenguas indicas en un unico modelo (seleccionables por linea de texto), incluye dos voces integradas (Arjun, masculina, y Meera, femenina) que hablan todas las lenguas, y permite clonar cualquier voz a partir de un clip de referencia de 5 a 15 segundos, con o sin transcripcion. Esta pensado para desarrolladores que necesitan sintesis de voz natural en lenguas como kannada, hindi, tamil, telugu, malayalam, marathi, bengali, entre otras.

Se trata de una preview release, con 256 descargas y 1 like en Hugging Face en el momento de la consulta. El modelo usa un codec de voz de 12,5 Hz heredado de la base y se distribuye en precision bf16 con pesos en safetensors. Su relevancia actual radica en que cubre un hueco de cobertura linguistica con licencia permisiva y requisitos de hardware moderados (aproximadamente 8 GB de VRAM para inferencia en bf16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer TTS basado en Qwen3-TTS (codec de voz a 12,5 Hz) |
| Parametros totales | 2.021.578.816 (1,93B base + 93M embeddings indicos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | 25 lenguas indicas: assamese, bengali, bhojpuri, bodo, chhattisgarhi, dogri, gujarati, hindi, kannada, kashmiri, konkani, magahi, maithili, malayalam, manipuri, marathi, nepali, odia, punjabi, sanskrit, santali, sindhi, tamil, telugu, urdu |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 4,8 GB) |

## Arquitectura y entrenamiento

Volt-TTS parte de Qwen3-TTS-12Hz-1.7B-Base, un modelo de sintesis de voz de la familia Qwen3-TTS que opera sobre un codec de voz con una tasa de 12,5 Hz. Sobre esa base, openarcane ha realizado un ajuste fino anadiendo 93 millones de parametros correspondientes a nuevos embeddings de tokens para las lenguas indicas, lo que eleva el total a 2,02B de parametros. El modelo se distribuye en precision bf16.

La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. La unica innovacion explicitamente descrita es la capacidad de clonacion de voz en modo zero-shot a partir de clips cortos (5-15 s), con soporte para modo ICL (con transcripcion de referencia) y modo x-vector (sin transcripcion). El autor acompana el modelo con `openarcane`, un normalizador de texto sin dependencias que reescribe numeros, importes, fechas y horas como palabras en la lengua elegida.

## Capacidades

- Sintesis de voz (text-to-speech) en 25 lenguas indicas, con seleccion de idioma por linea mediante el parametro `language=`.
- Dos voces integradas: Arjun (masculina) y Meera (femenina), ambas operativas en todas las lenguas soportadas.
- Clonacion de voz a partir de un clip de referencia de 5 a 15 segundos, en cualquier lengua, con o sin transcripcion del clip.
- Normalizacion de texto integrada mediante la libreria `openarcane`, que convierte cifras, monedas, fechas y horas a palabras en la lengua destino.
- Soporte de inferencia en GPU CUDA con `device_map` y precision bf16.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada mas alla de la referencia de clonacion.

## Casos de uso

- Atencion al cliente automatizada en lenguas indicas: el modelo puede sintetizar respuestas en hindi, kannada o tamil con las voces integradas, y la normalizacion de `openarcane` garantiza que importes, fechas de entrega y numeros de pedido se lean correctamente (por ejemplo, "15/08/2025" o "₹1.250,50").
- Audiolibros y contenido editorial multilingue: un mismo pipeline puede narrar el mismo texto en varias lenguas indicas cambiando el parametro `language=`, con voz masculina o femenina segun el publico objetivo.
- Locucion para IVR y telefonia: la clonacion de voz permite generar mensajes con la voz corporativa de la empresa a partir de un clip de 5-15 s, sin necesidad de un estudio de grabacion.
- Accesibilidad y lectores de pantalla: sintesis de contenido web o documentos en lenguas regionales para usuarios con discapacidad visual, con dos voces disponibles para personalizar la experiencia.
- Doblaje y localizacion de video: generacion de pistas de voz en lenguas indicas para contenido formativo o corporativo, usando la clonacion para mantener la identidad vocal del locutor original.
- Educacion y e-learning: narracion de materiales didacticos en lenguas como marathi, telugu o bengali, con la posibilidad de clonar la voz de un profesor concreto a partir de una muestra corta.
- Prototipado de asistentes de voz: integracion en pipelines de desarrollo con `qwen-tts` y `soundfile`, aprovechando los aproximadamente 8 GB de VRAM necesarios para iterar rapidamente en una unica GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB en precision bf16, segun la model card (requiere GPU CUDA).
- GPU recomendadas: no se especifican modelos concretos; cualquier GPU CUDA con al menos 8 GB de memoria deberia ser suficiente en bf16 (por ejemplo, RTX 3060 de 12 GB, RTX 4070, RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en bf16.
- Opciones de despliegue: la model card documenta el uso de la libreria `qwen-tts` junto con `safetensors`, `soundfile` y `huggingface_hub`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Volt-TTS | 2,02B | No disponible | 25 lenguas indicas | Apache-2.0 | Hugging Face |
| Qwen3-TTS-12Hz-1.7B-Base | 1,93B | No disponible | No disponible en la informacion | No disponible en la informacion | Hugging Face (Qwen) |
| Alternativas TTS multilingues de proposito general | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica comparacion documentada en la informacion disponible es con el modelo base Qwen3-TTS-12Hz-1.7B-Base, del que Volt-TTS hereda arquitectura y codec, y al que anade 93M de parametros en embeddings para lenguas indicas. No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Se trata de una preview release, segun indica el propio autor; no debe asumirse estabilidad de API ni calidad de produccion.
- La model card no documenta sesgos conocidos, tasas de alucinacion ni evaluaciones de fidelidad de la sintesis.
- La clonacion de voz plantea riesgos de suplantacion de identidad y uso indebido; la licencia Apache-2.0 no impone restricciones especificas de uso etico, por lo que la responsabilidad recae en el integrador.
- La longitud de contexto no esta documentada, lo que limita la planificacion de sintesis de textos largos sin fragmentacion previa.
- La cobertura linguistica se limita a 25 lenguas indicas; no se documenta soporte para castellano ni otras lenguas no indicas.
- No se documentan cuantizaciones alternativas a bf16, lo que puede limitar el despliegue en hardware con menos de 8 GB de VRAM.
- El modelo depende de la libreria `qwen-tts` y del normalizador `openarcane`; la model card advierte que pueden aparecer avisos relacionados con SoX y con la clase del tokenizador que pueden ignorarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openarcane/Volt-TTS
- Modelo base Qwen3-TTS-12Hz-1.7B-Base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Repositorio del normalizador openarcane: https://github.com/openarcane-ai/openarcane
- Video de presentacion (teaser): https://huggingface.co/openarcane/Volt-TTS/resolve/main/Volt-TTS-teaser.mp4
