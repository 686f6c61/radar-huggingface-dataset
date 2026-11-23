# openbmb/MiniCPM-o-2_6-int4

## Resumen

MiniCPM-o-2_6-int4 es la versión cuantizada a 4 bits (GPTQ) de MiniCPM-o 2.6, un modelo multimodal "omni" desarrollado por OpenBMB que procesa y genera texto, imagen, vídeo y audio (voz) en un único modelo de aproximadamente 8.674 millones de parámetros. El modelo base se presenta como un MLLM de nivel GPT-4o capaz de ejecutarse en un teléfono, y esta variante int4 reduce los requisitos de memoria hasta unos 9 GB de VRAM, lo que facilita su despliegue en GPUs de consumo.

La relevancia de esta ficha radica en que combina entrada y salida en múltiples modalidades (any-to-any): reconocimiento de voz (ASR), síntesis de voz (TTS), clonación de voz, conversación de voz en tiempo real con streaming en vivo, además de visión, OCR, multi-imagen y vídeo. Está publicada bajo licencia Apache 2.0, lo que permite uso comercial, y se distribuye en formato safetensors con código personalizado (custom_code) para transformers.

Esta variante int4 está pensada para inferencia con menor huella de memoria mediante AutoGPTQ, manteniendo las capacidades del modelo original. El repositorio ocupa 7,6 GB y acumula 421 descargas y 55 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal omni; tag custom_code) |
| Parametros totales | 8.674.997.028 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit GPTQ (int4) |
| Idiomas soportados | multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (cuantizacion GPTQ, requiere AutoGPTQ) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (tipo de transformer, mecanismo de atención, composición exacta del dataset ni número de tokens de entrenamiento). La model card del repositorio int4 es una guía de uso de la cuantización y remite al repositorio del modelo base (openbmb/MiniCPM-o-2_6) para los detalles técnicos. Se sabe que el modelo base se entrenó con, al menos, el dataset openbmb/RLAIF-V-Dataset, que aparece referenciado en los metadatos, y que el modelo es de tipo "omni", es decir, integra codificadores y decodificadores para visión, audio y texto.

La innovación destacable de esta variante concreta es la cuantización a 4 bits mediante GPTQ (a través de una rama de AutoGPTQ), que reduce el uso de memoria a unos 9 GB manteniendo el comportamiento del modelo original. La model card indica que se está enviando un PR para soportar oficialmente la inferencia de MiniCPM-o 2.6 en AutoGPTQ y que, por ahora, la inferencia requiere desactivar ExLlama y ExLlamaV2 (`disable_exllama=True`, `disable_exllamav2=True`).

## Capacidades

- Generación de texto y razonamiento multimodal (visión, audio y texto).
- Procesamiento de imagen: descripción, VQA, OCR y multi-imagen.
- Procesamiento de vídeo.
- Audio: reconocimiento automático de voz (ASR) y síntesis de voz (TTS).
- Clonación de voz.
- Conversación de voz en tiempo real y streaming en vivo (live streaming, realtime speech conversation).
- Modelo any-to-any: acepta y produce distintas modalidades.
- Capacidades multilingües (tag "multilingual").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Modo "thinking": no disponible en la información proporcionada.

## Casos de uso

- Asistentes de voz en tiempo real: el modelo soporta conversación de voz con streaming en vivo, lo que permite construir asistentes que escuchan, razonan y responden por audio con baja latencia percibida.
- Clonación de voz para accesibilidad: la capacidad de clonación de voz y TTS permite generar locuciones personalizadas para usuarios con dificultades del habla.
- Transcripción y análisis de audio (ASR): útil para pipelines de subtitulado, actas de reuniones o análisis de llamadas, combinando ASR con razonamiento sobre el contenido.
- Digitalización documental con OCR: el soporte de OCR y multi-imagen permite extraer texto de documentos, facturas o capturas y razonar sobre varias imágenes a la vez.
- Análisis de vídeo: al procesar vídeo, puede emplearse para resumir contenido audiovisual, describir escenas o extraer información de grabaciones.
- Despliegue en el borde o en GPUs de consumo: con unos 9 GB de VRAM en int4, es viable para prototipos y aplicaciones en estaciones de trabajo con una sola GPU, reduciendo costes frente al modelo en precisión completa.
- Atención al cliente multimodal: combinando texto, imagen y audio, puede gestionar conversaciones donde el usuario adjunta capturas o envía mensajes de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9 GB con la versión int4 (según la model card).
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por el uso de memoria (~9 GB) encaja en GPUs con al menos 12 GB de VRAM.
- ¿Cabe en GPU de consumo? Sí, según el requisito de ~9 GB, sería viable en tarjetas con 12 GB o más (por ejemplo, gama RTX xx80/xx90 con suficiente VRAM); no se confirman modelos concretos en la información.
- Opciones de despliegue: AutoGPTQ (rama minicpmo) con `AutoGPTQForCausalLM.from_quantized`, junto con `transformers` y `trust_remote_code=True`. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no están confirmadas en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. Como referencia cualitativa, esta variante se posiciona como un MLLM omni (texto, imagen, vídeo, audio) de ~8,7 mil millones de parámetros con licencia Apache 2.0, frente a alternativas omni de mayor tamaño que suelen requerir más VRAM. Los datos concretos de parámetros, contexto y rendimiento de esas alternativas no están disponibles en esta ficha.

## Limitaciones y advertencias

- La información sobre sesgos conocidos no está disponible en la documentación consultada.
- Riesgo de alucinación inherente a los modelos generativos; no se cuantifica en la información disponible.
- Longitud de contexto no especificada, lo que impide garantizar el comportamiento en conversaciones o documentos muy largos.
- El soporte multilingüe se declara de forma genérica ("multilingual"); no se detalla la cobertura ni la calidad por idioma.
- La cuantización int4 puede introducir degradación de calidad frente al modelo en precisión completa; no se documenta la magnitud de esa pérdida.
- Requiere código personalizado (`trust_remote_code=True`) y una rama específica de AutoGPTQ, con ExLlama/ExLlamaV2 desactivados; esto limita la compatibilidad con stacks de inferencia estándar y puede afectar al rendimiento.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datasets empleados.
- El repositorio corresponde a una cuantización comunitaria/oficial de OpenBMB; para producción conviene validar la estabilidad de la rama de AutoGPTQ utilizada.

## Enlaces

- Hugging Face (esta variante int4): https://huggingface.co/openbmb/MiniCPM-o-2_6-int4
- Modelo base en Hugging Face: https://huggingface.co/openbmb/MiniCPM-o-2_6
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM-o
- Wiki de MiniCPM (chino): https://openbmb.cn/docs/
- Demo online: https://minicpm-omni-webdemo-us.modelbest.cn
- Blog técnico: https://openbmb.notion.site/MiniCPM-o-2-6-A-GPT-4o-Level-MLLM-for-Vision-Speech-and-Multimodal-Live-Streaming-on-Your-Phone-185ede1b7a558042b5d5e45e6b237da9
- Rama de AutoGPTQ para MiniCPM-o: https://github.com/RanchiZhao/AutoGPTQ
- Dataset RLAIF-V: https://huggingface.co/datasets/openbmb/RLAIF-V-Dataset
