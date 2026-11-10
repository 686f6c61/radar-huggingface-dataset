# Serkali-sudo/Qwen3-TTS-1.7B-VoiceDesign-LiteRT

## Resumen

Qwen3-TTS 1.7B VoiceDesign LiteRT es una conversión al formato LiteRT (TFLite) del modelo de síntesis de voz Qwen3-TTS-12Hz-1.7B-VoiceDesign, desarrollado originalmente por el equipo Qwen de Alibaba. La conversión la mantiene el usuario Serkali-sudo y su objetivo es permitir la inferencia de un modelo TTS de 1.700 millones de parámetros en entornos con recursos limitados, como dispositivos móviles o sistemas embebidos, aprovechando el runtime LiteRT de Google.

El modelo original es un sistema de text-to-speech con capacidad de diseño de voz (voice design), es decir, permite controlar características de la voz generada mediante instrucciones textuales. Esta versión LiteRT cuantiza los pesos del componente Talker a 8 bits y descompone el pipeline en varios grafos que deben orquestarse desde un bucle en el host: el Talker, el predictor de códigos y el códec de audio.

La relevancia de esta ficha radica en que se trata de una conversión comunitaria muy reciente (noviembre de 2026), sin descargas ni validación pública, lo que la sitúa como una opción experimental para quienes necesiten ejecutar TTS de calidad en hardware modesto. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque la información publicada sobre el proceso de conversión es mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Qwen3-TTS-12Hz-1.7B-VoiceDesign; pipeline compuesto por Talker, predictor de codigos y codec de audio) |
| Parametros totales | 1.700 millones (1.7B, segun el nombre del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos del Talker en 8 bits (int8); resto no disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT / TFLite (grafos separados; ver `voice-design.json`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen3-TTS-12Hz-1.7B-VoiceDesign mas alla de su naturaleza como sistema de text-to-speech. La model card de esta conversion indica que el pipeline se compone de tres elementos: un Talker (el modelo generativo principal, con pesos cuantizados a 8 bits), un predictor de codigos y un codec de audio. La sintesis requiere un bucle en el host que conecte estos componentes, lo que implica que la conversion no es un unico grafo autocontenido sino una descomposicion en etapas.

No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documenta la innovacion tecnica del modelo original mas alla de su capacidad de voice design. La revision del modelo base utilizada para la conversion es `5ecdb67327fd37bb2e042aab12ff7391903235d3`.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto de entrada.
- Diseno de voz (voice design): el modelo base permite controlar caracteristicas de la voz generada mediante instrucciones, segun el nombre del modelo.
- Generacion de audio a traves de un codec integrado en el pipeline.
- Ejecucion en entornos LiteRT, orientada a inferencia en dispositivos con recursos limitados.
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada ni modo thinking.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Síntesis de voz en aplicaciones moviles: al estar convertido a LiteRT, el modelo puede integrarse en apps Android o iOS que necesiten generar voz sin depender de la nube, siempre que se implemente el bucle de host que conecta Talker, predictor de codigos y codec.
- Lectura de contenido en dispositivos embebidos: sistemas de accesibilidad o asistentes de lectura que requieran TTS local en hardware con memoria limitada, aprovechando la cuantizacion a 8 bits del Talker.
- Prototipado de voces personalizadas: la capacidad de voice design del modelo base permite experimentar con caracteristicas de voz mediante instrucciones, util en estudios de doblaje o generacion de contenido.
- Generacion de audiolibros o narraciones: el modelo de 1.7B puede producir voz de forma local en estaciones de trabajo, evitando costes de API y dependencias de servicios externos.
- Investigacion en TTS eficiente: sirve como referencia para estudiar el impacto de la cuantizacion a 8 bits y la descomposicion en grafos LiteRT sobre la calidad de la sintesis.
- Integracion en pipelines de CI/CD para pruebas de audio: permite generar muestras de voz de forma reproducible en entornos de integracion, aunque requiere validacion previa de la calidad.
- Sistemas de respuesta por voz en kioscos o terminales: despliegue en dispositivos con aceleradores LiteRT (GPU movil, NPU) para interacciones habladas sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio ocupa 3.7 GB, lo que da una referencia del espacio en disco necesario; la memoria en tiempo de ejecucion dependera del runtime LiteRT y del grafo cargado.
- GPU recomendadas: no disponibles. LiteRT esta orientado a aceleradores moviles (GPU Mali/Adreno, NPU) y a CPU; no se documenta soporte para A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no confirmada; el formato TFLite no es el habitual para GPUs de escritorio de gama alta.
- Opciones de despliegue: runtime LiteRT (TFLite), con un bucle de host personalizado para orquestar los tres componentes del pipeline. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-TTS-1.7B-VoiceDesign-LiteRT (esta ficha) | 1.7B | No disponible | LiteRT/TFLite | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign (modelo base) | 1.7B | No disponible | No disponible | Apache 2.0 (segun esta ficha) | Hugging Face |
| Alternativas TTS de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Conversion comunitaria sin validacion publica: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de evidencia sobre su calidad o estabilidad.
- Requiere implementar manualmente el bucle de host que conecta Talker, predictor de codigos y codec; no es un pipeline listo para usar de forma directa.
- La cuantizacion a 8 bits del Talker puede degradar la calidad de la sintesis respecto al modelo base; no se documenta ninguna evaluacion al respecto.
- Idiomas soportados no disponibles; no se puede confirmar cobertura multilingue.
- No se documentan sesgos conocidos ni tasas de alucinacion, pero al ser un modelo TTS el riesgo principal es la generacion de prosodia o pronunciacion incorrecta, no de contenido factual.
- Licencia Apache 2.0 permite uso comercial, pero al tratarse de una conversion de terceros conviene verificar la licencia y los terminos del modelo base original.
- Formato LiteRT/TFLite no soportado por los runners de inferencia mas comunes para LLMs (vLLM, llama.cpp, TGI), lo que limita su integracion en infraestructura existente.
- No hay informacion sobre el contexto maximo de texto de entrada ni sobre limites de duracion de audio generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Serkali-sudo/Qwen3-TTS-1.7B-VoiceDesign-LiteRT
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
- Revision del modelo base utilizada: `5ecdb67327fd37bb2e042aab12ff7391903235d3`
- LiteRT (runtime de Google): no se proporciona enlace en la informacion disponible.
- Paper, blog o demo del modelo original: no disponibles en la informacion proporcionada.
