# infomiho/diktafon-dictate-hr-1-GGUF

## Resumen

Diktafon Dictate HR 1 GGUF es la version cuantizada en formato GGUF del modelo infomiho/diktafon-dictate-hr-1, un sistema de reconocimiento automatico del habla (ASR) especializado en dictado en croata. El autor es infomiho y el modelo base es un ajuste fino de NVIDIA Canary 1B v2, un modelo encoder-decoder disenado para transcripcion y traduccion de voz. Esta variante GGUF permite ejecutar la transcripcion en hardware de consumo sin necesidad de GPU dedicada.

El modelo contiene aproximadamente 980 millones de parametros (980.046.848 segun el repositorio) y se distribuye unicamente en cuantizacion Q5_K_M, con un peso de archivo de 837 MB. Esta pensado para alimentar la funcion de dictado en croata de la aplicacion Diktafon, que descarga este fichero GGUF directamente. Su proposito es convertir audio mono de 16 kHz en texto croata, con fragmentos de audio de menos de unos 40 segundos.

Es relevante ahora porque demuestra que los modelos ASR de tamano medio pueden cuantizarse a GGUF y ejecutarse en CPU o Apple Silicon a velocidades muy superiores al tiempo real (43x realtime en un M2 Pro), lo que facilita despliegues locales de dictado para un idioma concreto con licencia permisiva CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder heredada de NVIDIA Canary 1B v2 (FastConformer encoder + decodificador Transformer) |
| Parametros totales | 980.046.848 (~980 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; procesa fragmentos de audio de menos de ~40 segundos) |
| Tipos de cuantizacion | Q5_K_M (GGUF) |
| Idiomas soportados | croata (hr) |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una adaptacion del ajuste fino infomiho/diktafon-dictate-hr-1, que a su vez deriva de NVIDIA Canary 1B v2. Canary es un modelo de la familia encoder-decoder (encoder FastConformer y decodificador Transformer) orientado a ASR y traduccion del habla. El ajuste fino se ha especializado en dictado en croata, de modo que el modelo reconoce ese idioma en lugar de la configuracion multilingue original del modelo base.

El repositorio proporcionado no detalla la composicion del dataset de entrenamiento, el numero de tokens, ni si se emplearon tecnicas de RLHF o DPO. La unica informacion tecnica concreta es que esta variante es una conversion a GGUF con cuantizacion Q5_K_M del modelo original, realizada para su ejecucion en transcribe.cpp, un runtime capaz de cargar ficheros GGUF de Canary. No se documentan innovaciones adicionales como decodificacion especulativa o mecanismos de atencion alternativos.

## Capacidades

- Reconocimiento automatico del habla en croata (transcripcion de voz a texto) orientado especificamente a dictado.
- Procesamiento de audio mono a 16 kHz, en fragmentos de audio de menos de aproximadamente 40 segundos.
- Ejecucion local en CPU y Apple Silicon mediante el runtime transcribe.cpp, sin dependencia de GPU.
- Inferencia a alta velocidad: 43x tiempo real medido en un Apple M2 Pro.
- No se documentan capacidades de traduccion, tool calling, agentes, vision, audio en tiempo real continuo ni modo de razonamiento en la informacion disponible.

## Casos de uso

- Dictado local en croata: el escenario principal del modelo es transcribir voz a texto en aplicaciones de escritura por voz, como la propia app Diktafon, que descarga este GGUF para funcionar en el dispositivo.
- Aplicaciones de notas de voz: conversion de grabaciones cortas de audio (menos de 40 segundos) a texto en croata sin enviar datos a la nube, gracias a la ejecucion local en CPU.
- Privacidad y cumplimiento: al ejecutarse en local con hardware de consumo, permite transcribir contenido sensible de habla croata sin salida de datos a servicios externos.
- Integracion en aplicaciones de escritorio: al cargarse mediante transcribe.cpp, puede embeberse en herramientas nativas de macOS, Linux o Windows como motor de transcripcion offline.
- Accesibilidad: transcripcion de comandos o texto dictado para usuarios con movilidad reducida que necesiten introducir texto en croata por voz.
- Post-procesado de audio pregrabado: division de grabaciones largas en fragmentos de menos de 40 segundos y transcripcion por lotes en un pipeline local.
- Prototipado de ASR en croata: base para investigadores que necesiten un modelo ASR croata pequeno, con licencia permisiva y facil de desplegar en hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento aportada por el autor es la velocidad de inferencia en un Apple M2 Pro, de 43x tiempo real, con un consumo de memoria de 1,02 GB para el fichero Q5_K_M.

## Requisitos de hardware

- VRAM estimada para inferencia: 1,02 GB de memoria segun el autor para la cuantizacion Q5_K_M (valido tanto para memoria unificada de Apple Silicon como para memoria del sistema en CPU).
- No requiere GPU dedicada: cabe holgadamente en cualquier equipo de consumo actual, incluidas CPU de portatiles y Apple Silicon.
- GPU compatibles: no se especifican GPU concretas; al ser un modelo de menos de 1 GB en Q5_K_M, podria ejecutarse tambien en GPUs de gama de entrada, aunque la via documentada es la ejecucion en CPU/Apple Silicon.
- Opciones de despliegue: transcribe.cpp (runtime indicado por el autor, que carga GGUF de Canary). No se mencionan Ollama, vLLM, llama.cpp ni TGI en la informacion disponible.
- Latencia y throughput: 43x tiempo real en un M2 Pro; es decir, un fragmento de audio de 40 segundos podria transcribirse en el orden de menos de un segundo en ese hardware. No se aportan cifras para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Diktafon Dictate HR 1 GGUF | ~980 M | croata (hr) | GGUF (Q5_K_M) | CC BY 4.0 | HuggingFace (este repo) |
| infomiho/diktafon-dictate-hr-1 | ~980 M (mismo base) | croata (hr) | safetensors (modelo original) | CC BY 4.0 | HuggingFace |
| NVIDIA Canary 1B v2 | ~1 000 M (modelo base) | multilingue (incluye croata) | NeMo / safetensors | CC BY 4.0 | HuggingFace (nvidia/canary-1b-v2) |
| OpenAI Whisper large-v3 | ~1 550 M | multilingue (99 idiomas) | safetensors, GGML/GGUF (comunidad) | MIT | HuggingFace, repos de la comunidad |

Nota: los datos de parametros, licencia e idiomas de las alternativas se basan en informacion publica general; el repositorio de este modelo no incluye una comparativa oficial propia.

## Limitaciones y advertencias

- Modelo especializado unicamente en croata (hr): no transcribe otros idiomas.
- Limitacion de duracion de audio: el autor indica fragmentos de menos de aproximadamente 40 segundos; audios mas largos deben dividirse.
- Entrada de audio restringida a mono a 16 kHz.
- No se documentan sesgos especificos, pero al derivar de un ajuste fino pueden existir sesgos heredados del dataset de entrenamiento original, no descrito en el repositorio.
- Riesgo de alucinacion inherente a los modelos ASR, especialmente con audio ruidoso, solapamiento de voces o terminologia especializada no vista en entrenamiento.
- No hay resultados de benchmarks publicados en la informacion disponible, por lo que la calidad de transcripcion no esta cuantificada de forma independiente.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribucion al autor y al modelo base NVIDIA Canary 1B v2. Conviene revisar los terminos del modelo base de NVIDIA.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion por parte de la comunidad.
- La cuantizacion Q5_K_M puede introducir una ligera perdida de calidad frente al modelo original en safetensors; el autor no cuantifica dicha degradacion.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/infomiho/diktafon-dictate-hr-1-GGUF
- Modelo base (model card principal): https://huggingface.co/infomiho/diktafon-dictate-hr-1
- Aplicacion Diktafon: https://diktafon.miho.dev
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- NVIDIA Canary 1B v2: https://huggingface.co/nvidia/canary-1b-v2
