# efficient-speech/Voxtral-Mini-3B-2507-MLX-BF16

## Resumen

Voxtral-Mini-3B-2507-MLX-BF16 es una conversion a formato MLX en bfloat16 de los pesos originales de mistralai/Voxtral-Mini-3B-2507, un modelo multimodal de Mistral AI especializado en reconocimiento automatico del habla (ASR) y respuesta a preguntas sobre audio. La conversion la ha realizado el proyecto efficient-speech y acompana a Murmur, un sistema de inferencia para reconocimiento de voz de formato largo desarrollado en la Universidad de Washington (uw-syfi). El objetivo es ofrecer una version ejecutable de forma nativa en Apple Silicon mediante el framework MLX, manteniendo la precision del original al no aplicar cuantizacion (BF16).

El modelo base combina un encoder de audio con un decoder de lenguaje de tipo transformer, lo que le permite no solo transcribir audio sino tambien responder preguntas sobre el contenido hablado. Su tamano contenido (en el repositorio figuran 5.078.924.288 parametros en safetensors, aunque la denominacion comercial del modelo base es "3B") lo hace apto para equipos de sobremesa con memoria unificada generosa, si bien el repositorio ocupa 10,2 GB por almacenar los pesos en bfloat16.

La relevancia actual de esta ficha radica en que facilita el uso local de un modelo de voz de ultima generacion en el ecosistema Apple, sin depender de GPUs NVIDIA ni de servicios en la nube. Al estar bajo licencia Apache 2.0, permite uso comercial sin restricciones adicionales, lo que resulta atractivo para integraciones en productos de transcripcion y asistentes de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multimodal audio-texto (encoder de audio + decoder transformer de lenguaje); pesos convertidos a MLX |
| Parametros totales | 5.078.924.288 (segun safetensors del repositorio); el modelo base se comercializa como "3B" |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (unico formato publicado en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en MLX (bfloat16) |

## Arquitectura y entrenamiento

El modelo base Voxtral-Mini-3B-2507 sigue la estela de la familia Voxtral de Mistral AI, que acopla un encoder de audio a un modelo de lenguaje para realizar transcripcion y comprension de audio de extremo a extremo. La version aqui descrita no introduce cambios arquitectonicos: es una conversion directa de los pesos de mistralai/Voxtral-Mini-3B-2507 al formato MLX en bfloat16, realizada por efficient-speech. No se han publicado en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion principal de esta publicacion es de infraestructura mas que de modelado: permite ejecutar el modelo en Apple Silicon mediante MLX, y se ha validado con el runtime independiente `mlx-voxtral==0.0.6`. Ademas, la conversion acompana a Murmur, un sistema de inferencia orientado a reconocimiento de voz de formato largo, lo que sugiere que el modelo se ha probado en escenarios de audio extenso. No se dispone de informacion sobre innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en esta version.

## Capacidades

- Transcripcion automatica del habla (ASR) a partir de audio.
- Respuesta a preguntas sobre audio: el modelo acepta audio como entrada y genera respuestas en lenguaje natural sobre su contenido.
- Procesamiento de audio de formato largo, segun el contexto del sistema Murmur con el que se ha validado.
- Ejecucion nativa en Apple Silicon mediante MLX, sin necesidad de GPU NVIDIA.
- No se ha documentado en la informacion disponible soporte de tool calling, function calling, agentes, vision, audio bidireccional ni modos de razonamiento extendido (thinking mode).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Transcripcion de reuniones y entrevistas en local: el modelo puede convertir audio grabado en texto directamente en un Mac con memoria unificada suficiente, evitando enviar datos sensibles a servicios en la nube.
- Generacion de subtitulos y actas: al aceptar audio y responder preguntas, permite generar resumenes o actas a partir de la grabacion sin un pipeline separado de ASR y LLM.
- Asistentes de voz para aplicaciones de escritorio en macOS: la integracion con MLX facilita incorporar reconocimiento de voz a herramientas nativas de Apple sin dependencias de CUDA.
- Investigacion en reconocimiento de voz de formato largo: el modelo se ha validado con Murmur, por lo que sirve como base para experimentos academicos sobre audio extenso.
- Prototipado rapido de productos de audio: al estar bajo Apache 2.0 y ejecutarse en hardware de consumo, reduce la friccion para validar ideas de transcripcion y Q&A sobre audio.
- Procesamiento por lotes de archivos de audio en estaciones de trabajo Apple: la conversion BF16 preserva la precision del original, adecuada cuando se prioriza calidad frente a velocidad.
- Analisis de contenido hablado en entornos con requisitos de privacidad: al ejecutarse localmente, el audio no sale del dispositivo, lo que encaja en sectores regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 10,2 GB en BF16; se necesita al menos esa cantidad de memoria unificada mas el margen para el runtime y el audio de entrada.
- GPU recomendadas: no aplica en el sentido tradicional; el modelo esta pensado para Apple Silicon (series M1, M2, M3, M4 y posteriores) con memoria unificada de 16 GB o superior; 32 GB o mas recomendable para audio largo.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada suficiente; no se ha validado en GPUs NVIDIA dentro de esta publicacion.
- Opciones de despliegue: runtime `mlx-voxtral` (version 0.0.6 probada) y el sistema Murmur (https://github.com/uw-syfi/Murmur); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para esta conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato/plataforma | Notas |
|---|---|---|---|---|---|
| efficient-speech/Voxtral-Mini-3B-2507-MLX-BF16 | 5.078.924.288 (safetensors) | no disponible | Apache 2.0 | MLX BF16 (Apple Silicon) | Conversion del modelo de Mistral AI |
| mistralai/Voxtral-Mini-3B-2507 | ~3B (denominacion comercial) | no disponible | Apache 2.0 | safetensors (PyTorch) | Modelo base original |
| Otros modelos ASR de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- No se han documentado sesgos conocidos en la informacion disponible; al ser una conversion directa, hereda los del modelo base, que no se detallan aqui.
- Riesgo de alucinacion inherente a los modelos de lenguaje acoplados a audio; las transcripciones y respuestas deben validarse en entornos criticos.
- Limitaciones de contexto e idioma no disponibles: no se especifica la ventana de contexto ni la lista de idiomas soportados.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de las dependencias (MLX, mlx-voxtral).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni de validacion por la comunidad.
- Solo se publica BF16: no hay versiones cuantizadas (4-bit, 8-bit) que reduzcan el requisito de memoria, lo que limita su uso en equipos Apple con menos de 16 GB.
- La validacion se ha hecho con una version concreta del runtime (`mlx-voxtral==0.0.6`); cambios de version pueden afectar al comportamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/efficient-speech/Voxtral-Mini-3B-2507-MLX-BF16
- Modelo base: https://huggingface.co/mistralai/Voxtral-Mini-3B-2507
- Revision concreta del modelo base citada en la model card: https://huggingface.co/mistralai/Voxtral-Mini-3B-2507/tree/3060fe34b35ba5d44202ce9ff3c097642914f8f3
- Sistema Murmur: https://github.com/uw-syfi/Murmur
