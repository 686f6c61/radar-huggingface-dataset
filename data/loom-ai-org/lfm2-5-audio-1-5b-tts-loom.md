# loom-ai-org/lfm2.5-audio-1.5b-tts-loom

## Resumen

LFM2.5-Audio-1.5B-TTS-Loom es la exportacion a formato GGUF del modelo de sintesis de voz LiquidAI/LFM2.5-Audio-1.5B, publicada por la organizacion loom-ai-org. El modelo original lo desarrollo Liquid AI y aqui se redistribuye con los pesos sin modificar, empaquetados para el runtime loom.cpp. Se trata de un fichero GGUF autocontenido que incluye sus propias topologias de grafo, el tokenizador (no necesita fonemizador externo, el propio modelo codifica el texto) y un script controlador embebido.

Tecnicamente, el sistema encadena un LM hibrido LFM2.5 que genera tramas de codebooks Mimi a traves de un depthformer, seguido de un detokenizer basado en LFM2 que produce la forma de onda a 24 kHz. El recuento real de parametros en safetensors es de 1.378.068.697 (unos 1,38 B), con un repositorio de 5,5 GB que incluye el modelo y tres ficheros de voz adicionales. Ofrece cuatro voces (us_male, us_female, uk_male, uk_female) y trabaja unicamente en ingles.

Su relevancia es practica: permite ejecutar TTS de calidad en local dentro del ecosistema loom.cpp/loom-py sin dependencias de servicios en la nube, con una sola generacion de hasta unos 80 segundos de habla por llamada. La licencia es la LFM Open License v1.0, heredada del modelo base, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM hibrido LFM2.5 con depthformer que genera tramas de codebooks Mimi y detokenizer basado en LFM2 |
| Parametros totales | 1.378.068.697 (≈1,38 B), dato de safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; nivel de cuantizacion concreto no especificado en la model card |
| Idiomas soportados | ingles (en) |
| Licencia | other — LFM Open License v1.0, heredada del modelo base |
| Formato de pesos | GGUF (fichero unico autocontenido); voces adicionales en voices/*.gguf |

## Arquitectura y entrenamiento

La model card describe la arquitectura como un LM hibrido LFM2.5 que dibuja tramas de codebooks Mimi a traves de su depthformer, mas un detokenizer basado en LFM2. Mimi es el codec neural de audio, y el depthformer se encarga de generar las tramas de codigos por etapas. El modelo original es multimodal en audio (sintesis, transcripcion y chat voz a voz con generacion intercalada), pero esta exportacion cubre unicamente el canal de texto a voz; la transcripcion vive en un fichero aparte y el chat voz a voz no se ha exportado. No se detalla en la informacion proporcionada la composicion exacta de la hibridacion, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion destacable de esta version es el propio formato: un GGUF autodescriptivo que transporta las topologias de grafo, el tokenizador y el driver de ejecucion, generado con loom-exporter. El pipeline aplica internamente el ventaneo, el muestreo y el ensamblado que el modelo necesita. Por defecto cada trama se muestrea con temperatura 0,8 y top-k 64, mientras que el texto anterior y posterior al habla se decodifica de forma greedy; se puede pasar una semilla para reproducir una generacion o temperatura 0 para decodificacion greedy. La exportacion se verifico contra liquid-audio en modo greedy con una coincidencia de forma de onda dentro de 4,1e-06.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles a 24 kHz de frecuencia de muestreo.
- Codificacion del texto interna: no requiere fonemizador ni paso previo de conversion a fonemas.
- Cuatro voces: us_male (por defecto, integrada en el fichero), us_female, uk_male y uk_female, las tres ultimas como ficheros de voz bajo voices/.
- Seleccion de voz mediante el parametro voice en la API de alto nivel de loom-py.
- Generacion de hasta aproximadamente 80 segundos de habla por llamada (1024 pasos), una generacion por invocacion.
- Control de muestreo: temperatura, top-k y semilla configurables; decodificacion greedy con temperatura 0.
- Acceso al driver embebido mediante model.infer(...) para parametros no expuestos en la API de alto nivel.
- No incluye tool calling, function calling, agentes, vision ni transcripcion en esta exportacion.

## Casos de uso

- Narracion de audiolibros y articulos en ingles: el modelo sintetiza fragmentos de hasta 80 segundos por llamada, por lo que se segmenta el texto en frases u oraciones y se concatenan los WAV resultantes; las cuatro voces permiten asignar narradores distintos a capítulos o personajes.
- Locuciones para asistentes de voz y sistemas IVR en ingles: al ejecutarse en local con loom.cpp, se puede integrar la generacion de respuestas habladas sin enviar texto del usuario a servicios de terceros.
- Prototipado y doblaje de contenido en ingles: generacion rapida de pistas de voz para maquetas de video, podcast o demos de producto, con velocidad controlada por el parametro sample_rate (24000).
- Accesibilidad y lectura de pantalla offline: conversion de texto a audio en equipos con GPU de consumo, sin dependencia de red, util en entornos con requisitos de privacidad o conectividad limitada.
- Generacion de datasets de audio sintetico: produccion de corpus hablados en ingles con voces controladas y semilla fija para reproducibilidad, destinados a entrenar o evaluar sistemas de reconocimiento automatico del habla.
- Pruebas A/B de voces en producto: comparacion de las cuatro voces disponibles sobre el mismo guion para decidir la locucion de una aplicacion, manteniendo el resto de parametros constantes.
- Avisos y notificaciones pregrabadas: pre-generacion de mensajes cortos estandarizados (confirmaciones, alertas, mensajes de bienvenida) que se almacenan como WAV y se sirven sin coste de inferencia en tiempo real.
- Integracion en pipelines de CI para validacion de audio: uso de la decodificacion greedy verificada (coincidencia de 4,1e-06 frente a liquid-audio) como referencia en pruebas de regresion del propio runtime loom.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta una comprobacion de fidelidad de la exportacion: en decodificacion greedy, cada trama se genera igual que en liquid-audio y la forma de onda resultante coincide dentro de 4,1e-06.

## Requisitos de hardware

- VRAM estimada para inferencia: calculada a partir de los 1,38 B de parametros, ya que la model card no publica el nivel de cuantizacion del GGUF. En fp16 serian aproximadamente 2,8 GB; en int8, unos 1,4 GB; en int4, unos 0,7 GB. Hay que anadir el espacio de trabajo del codec Mimi, el depthformer y las activaciones, por lo que conviene reservar entre 0,5 y 1 GB adicionales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para el modelo en precision reducida; RTX 3060 12 GB, RTX 4070, RTX 4090 o superiores ofrecen margen amplio. Para despliegues con muchas peticiones concurrentes, A100 o H100 si el runtime lo permite.
- Compatibilidad con GPU de consumo: si, el modelo cabe en tarjetas consumer actuales, incluidas las de gama media con 6-8 GB de VRAM.
- Opciones de despliegue: el runtime previsto es loom.cpp, con el cliente Python loom-py-rt (pip install -U "loom-py-rt[hub]"). El GGUF es autodescriptivo y transporta su propio grafo y driver, por lo que su compatibilidad directa con llama.cpp, Ollama, vLLM o TGI no se indica en la informacion disponible.
- Latencia y throughput: no disponibles. El limite conocido es de una generacion por llamada de hasta unos 80 segundos de habla (1024 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Idiomas | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| loom-ai-org/lfm2.5-audio-1.5b-tts-loom | 1,38 B | Texto a voz | Ingles | LFM Open License v1.0 (other) | GGUF para loom.cpp |
| LiquidAI/LFM2.5-Audio-1.5B (modelo base) | 1,38 B | Audio multimodal: sintesis, transcripcion y chat voz a voz | No disponible en detalle | LFM Open License v1.0 | Pesos originales del autor |
| Variante de transcripcion (lfm2.5-audio-1.5b-asr) | No disponible | Reconocimiento de voz | No disponible | LFM Open License v1.0 (heredada) | Fichero separado dentro del ecosistema LFM2.5-Audio |

No se han identificado en la informacion proporcionada otros modelos de sintesis de voz comparables con datos verificables de parametros, contexto o rendimiento, por lo que no se incluye una comparacion con familias TTS alternativas.

## Limitaciones y advertencias

- Solo ingles: la model card declara el modelo como monolingue en ingles, sin soporte multilingue.
- Una sola puerta funcional: unicamente texto a voz. La transcripcion vive en un fichero aparte y el chat voz a voz con generacion intercalada no se ha exportado.
- Limite de duracion: una generacion por llamada de hasta unos 80 segundos de habla (1024 pasos); el texto largo debe dividirse en frases.
- Muestreo por defecto no determinista: dos llamadas identicas producen resultados distintos. Para reproducir una generacion hay que pasar seed; para decodificacion determinista, temperature=0.
- Riesgo de falso exito con sample_rate: si se indica una frecuencia incorrecta, la inferencia no falla, pero la voz se reproduce a una velocidad equivocada. La model card recomienda 24000.
- Dependencia de parametros externos: un checkpoint no transporta necesariamente la frecuencia de muestreo, por lo que parte de la configuracion correcta recae en quien integra el modelo.
- Voces incompletas por defecto: el fichero habla como us_male si no se indica voz; las otras tres requieren cargar los ficheros de voices/.
- Licencia: LFM Open License v1.0, marcada como "other". Las condiciones exactas de uso comercial no se detallan en la informacion proporcionada y deben consultarse en el texto de la licencia enlazado por el autor.
- Sesgos: no se documentan sesgos especificos del modelo base ni de esta exportacion; al reutilizar pesos sin modificar, cualquier sesgo del modelo original se hereda.
- Riesgo de alucinacion acustica: no documentado en la informacion disponible, pero es un riesgo inherente a los modelos generativos de audio; conviene validar las locuciones en produccion.
- Madurez del proyecto: el repositorio registra 0 descargas y 0 likes, sin validacion externa conocida, y el formato depende del ecosistema loom.cpp/loom-py.
- Confusion de nombre: las busquedas web sobre "loom" devuelven resultados de la herramienta de grabacion de pantalla y de una marca de ropa, ajenos por completo a este proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/loom-ai-org/lfm2.5-audio-1.5b-tts-loom
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-Audio-1.5B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-Audio-1.5B/blob/main/LICENSE
- Runtime loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Exportador loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Cliente Python loom-py: https://github.com/loom-ai-org/loom-py
- Las busquedas web realizadas no devolvieron resultados relacionados con el modelo; los enlaces obtenidos corresponden a servicios y marcas homonimas sin relacion con el proyecto.
