# Ilah/vieneu-v3-turbo-web

## Resumen

VieNeu-TTS v3 Turbo (bản cho trình duyệt) es una redistribución del modelo de síntesis de voz VieNeu-TTS v3 Turbo, empaquetado por el usuario Ilah para ejecutarse íntegramente en el navegador mediante ONNX Runtime Web sobre WebAssembly. El modelo original lo desarrolla pnnbao-ump y está orientado a síntesis de voz en vietnamita e inglés con capacidad de clonación de voz. Esta variante concreta no modifica los pesos: reorganiza los ficheros fp32 del modelo original junto con el codec MOSS-Audio-Tokenizer-Nano y el diccionario fonético sea-g2p para que un motor WASM pueda cargarlos sin dependencias de servidor.

La relevancia de esta ficha radica en su enfoque de despliegue: TTS con clonación de voz ejecutado localmente en el cliente, sin enviar audio a un backend. El repositorio ocupa aproximadamente 0,7 GB e incluye backbone de 12 capas, cabeceras de embeddings de texto y audio, anclas de voz, módulos de codificación/decodificación de audio, un extractor x-vector para clonación y el diccionario de fonemas sea-g2p 0.10.0.

La información pública disponible es escasa: no se detallan parámetros totales, longitud de contexto ni resultados de benchmarks. La model card original está redactada en vietnamita y la licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer de 12 capas con decodificador de audio local; codec MOSS-Audio-Tokenizer-Nano; pipeline TTS con clonación de voz (x-vector) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (pesos originales sin modificar); el runtime es ONNX Runtime Web (WASM) |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (vieneu_*.onnx, vieneu_backbone_shared.data, heads/, codec/, clone/, sea_g2p.bin) |

## Arquitectura y entrenamiento

La arquitectura combina un backbone transformer de 12 capas con un decodificador de audio local, empaquetados en formato ONNX fp32. El pipeline de síntesis se apoya en el codec MOSS-Audio-Tokenizer-Nano (encode y decode) para convertir entre formas de onda y tokens de audio, y en el diccionario fonético sea-g2p 0.10.0 para la conversión grafema-a-fonema, especialmente relevante en vietnamita por su sistema de diacríticos. La clonación de voz se implementa mediante un módulo de limpieza de la grabación de referencia y un extractor x-vector que genera el ancla de voz.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Esta variante es una reorganización de ficheros del modelo original (pnnbao-ump/VieNeu-TTS-v3-Turbo) sin modificación de pesos, según indica el propio autor en el NOTICE. La innovación principal es el empaquetado para ejecución en navegador con onnxruntime-web sobre WASM, lo que permite inferencia local en el cliente.

## Capacidades

- Síntesis de voz (text-to-speech) en vietnamita e inglés.
- Clonación de voz a partir de una grabación de referencia, con limpieza de ruido y extracción de x-vector.
- Conversión grafema-a-fonema mediante el diccionario sea-g2p, con tratamiento de diacríticos del vietnamita.
- Codificación y decodificación de audio mediante el codec MOSS-Audio-Tokenizer-Nano.
- Ejecución íntegra en navegador mediante ONNX Runtime Web (WASM), sin backend.
- No se ha documentado soporte de tool calling, agentes, visión, audio de entrada (ASR) ni modo de razonamiento.

## Casos de uso

- Lectura por voz de contenido web en vietnamita: una extensión de navegador puede cargar los ficheros ONNX y sintetizar artículos o páginas directamente en el cliente, sin enviar texto a un servidor.
- Accesibilidad para usuarios con discapacidad visual: integración en lectores de pantalla o extensiones que conviertan texto seleccionado en audio en tiempo real, aprovechando la ejecución WASM local.
- Aprendizaje de idiomas: generación de pronunciaciones en vietnamita e inglés con voces clonadas de referencia para practicar entonación y diacríticos.
- Prototipado de asistentes conversacionales bilingües vi/en: el modelo puede servir como capa de salida de voz en demos que deban funcionar sin infraestructura de servidor.
- Dobaje o locución de contenido corto: clonación de una voz concreta para generar narraciones de vídeos o audiolibros de pequeño formato, siempre que se respeten los derechos sobre la voz de referencia.
- Aplicaciones offline o de privacidad estricta: escenarios donde el audio no puede salir del dispositivo, como entornos sanitarios o corporativos, gracias a la inferencia local en el navegador.
- Pruebas de integración de TTS en el frontend: validación de latencia y calidad en aplicaciones web antes de migrar a un despliegue con servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa aproximadamente 0,7 GB en fp32; la memoria necesaria en el navegador será del orden del tamaño de los pesos cargados más el overhead del runtime WASM (no se ha publicado una cifra oficial).
- Al ejecutarse sobre onnxruntime-web (WASM), no requiere GPU dedicada; el rendimiento depende de la CPU del cliente y del soporte del navegador.
- No se dispone de datos oficiales de latencia ni throughput.
- Opciones de despliegue: ONNX Runtime Web (WASM) en navegador; los ficheros ONNX también podrían cargarse con otros runtimes compatibles con ONNX, aunque no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo TTS).
- Para uso en servidor, el modelo original pnnbao-ump/VieNeu-TTS-v3-Turbo es la referencia adecuada; esta variante está pensada para el cliente.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ilah/vieneu-v3-turbo-web | TTS con clonación, empaquetado para navegador | vi, en | Apache 2.0 | ONNX (WASM) | Variante de despliegue cliente; pesos sin modificar |
| pnnbao-ump/VieNeu-TTS-v3-Turbo | TTS con clonación (original) | vi, en | no disponible en la información proporcionada | no disponible | Modelo de referencia del que deriva esta variante |
| MOSS-Audio-Tokenizer-Nano | Codec de audio (encode/decode) | no aplica | no disponible en la información proporcionada | ONNX | Componente usado por este pipeline, no un TTS comparable |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con otros modelos TTS.

## Limitaciones y advertencias

- La información pública es muy limitada: no hay datos de parámetros, contexto, dataset de entrenamiento ni benchmarks.
- Solo cubre vietnamita e inglés; no se ha documentado soporte de otros idiomas.
- La clonación de voz plantea riesgos de suplantación y uso indebido; es responsabilidad del integrador obtener consentimiento y cumplir la normativa aplicable sobre voces.
- Riesgo de alucinación o artefactos en la síntesis: pronunciación incorrecta de diacríticos, nombres propios o texto fuera de dominio, sin métricas publicadas que lo cuantifiquen.
- Aunque la licencia declarada es Apache 2.0, el autor remite a un fichero NOTICE por tratarse de una redistribución de pesos de terceros; conviene revisarlo antes de uso comercial.
- El rendimiento en navegador depende de la CPU del cliente y del soporte WASM; no hay cifras de latencia publicadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria conocida.
- El modelo original está documentado en vietnamita; parte de la documentación puede no estar traducida.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/Ilah/vieneu-v3-turbo-web
- Modelo original VieNeu-TTS v3 Turbo: https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo
- Codec MOSS-Audio-Tokenizer-Nano (ONNX): https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX
- Diccionario sea-g2p: https://github.com/pnnbao97/sea-g2p
- Tutorial de VieNeu-TTS-v3-Turbo: https://aiindigo.com/tutorials/getting-started-with-vieneu-tts-v3-turbo-low-latency-vietnamese-voice-synthesis
