# SonexaAI/Sonexa-2-TTS

## Resumen

Sonexa-2-TTS es un modelo de síntesis de voz (text-to-speech) desarrollado por Sonexa AI, una organización independiente de investigación en IA centrada en modelos para codificación, conversación natural y aplicaciones del mundo real. El modelo es un reentrenamiento de Qwen3-TTS-1.7B-Base, lo que significa que parte de la arquitectura y los pesos del modelo base de Alibaba para síntesis de voz y los adapta a los objetivos de Sonexa.

Con 1.928.677.440 parámetros (aproximadamente 1,9 mil millones), el modelo se distribuye en formato safetensors con un tamaño de repositorio de 4,5 GB. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas. La relevancia de este modelo radica en que ofrece una alternativa de síntesis de voz de código abierto con una arquitectura probada (Qwen3-TTS) y un tamaño manejable para despliegue en entornos de producción con GPU de gama media o alta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (transformer, basada en Qwen3-TTS-1.7B-Base) |
| Parametros totales | 1.928.673.440 (1,93B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Sonexa-2-TTS es un reentrenamiento de Qwen3-TTS-1.7B-Base, un modelo de síntesis de voz de la familia Qwen3 de Alibaba. La arquitectura subyacente es un transformer de aproximadamente 1,7 mil millones de parámetros diseñado para convertir texto en audio de voz natural. Sonexa AI ha reentrenado el modelo sobre su propio conjunto de datos, aunque no se han publicado detalles sobre la composición del dataset, el número de tokens de entrenamiento ni el método de alineación (RLHF, DPO u otros).

La información disponible no incluye detalles sobre innovaciones técnicas específicas introducidas por Sonexa en este reentrenamiento. Se desconoce si el modelo incorpora mejoras sobre el base como decodificación especulativa, atención lineal u otras optimizaciones. Para obtener detalles sobre el proceso de entrenamiento, seria necesario contactar directamente con Sonexa AI o esperar a que publiquen documentacion tecnica adicional.

## Capacidades

- Generacion de voz: el modelo convierte texto en audio hablado, como es propio de un sistema TTS.
- Naturalidad del habla: al estar basado en Qwen3-TTS, se espera que genere voz con entonación y prosodia naturales, aunque no hay datos de evaluacion publicados.
- Reentrenamiento especifico: el reentrenamiento de Sonexa puede ajustar el modelo para dominios o estilos de voz especificos, pero no se han publicado detalles.
- Capacidades multilingues: no se ha especificado que idiomas soporta el modelo. La organizacion Sonexa AI menciona en su sitio web soporte de 50+ idiomas, pero no se confirma que este modelo concreto los cubra.
- Tool calling y agentes: no aplica, es un modelo de voz, no de texto general.
- Vision y audio: es un modelo de audio generativo, no de vision.

## Casos de uso

- Asistentes de voz: integrar el modelo en asistentes virtuales para generar respuestas habladas en tiempo real. Su tamaño de 1,9B parametros permite despliegue en GPU de gama media para inferencia en streaming.
- Lectura de contenido: generar audiolibros o narracion de articulos, noticias o documentacion tecnica. La licencia Apache 2.0 facilita su integracion en productos comerciales.
- Accesibilidad: convertir texto de interfaces de usuario en audio para personas con discapacidad visual, con posibilidad de desplegar en entornos locales sin depender de APIs externas.
- Publicidad y marketing: generar voz para anuncios, tutoriales o contenido de marca, con la flexibilidad de reentrenar el modelo con datos propios para adaptar el estilo de voz.
- Educacion: crear materiales educativos en formato audio, con un modelo que puede desplegarse en infraestructura propia para controlar costes y privacidad.
- Prototipado de productos de voz: integrar el modelo en pipelines de desarrollo para generar muestras de voz en etapas tempranas de productos que requieran interaccion por voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre calidad de voz (MOS, SIM), velocidad de inferencia o comparacion con otros modelos TTS.

## Requisitos de hardware

- VRAM estimada: con 1,93B parametros, en FP16 se requieren aproximadamente 3,9 GB de VRAM para el modelo. Con cuantizacion a 8 bits (INT8) se reduce a unos 2 GB, y en 4 bits a cerca de 1 GB.
- GPU recomendadas: una GPU con 8-12 GB de VRAM (como RTX 3080, RTX 4070, RTX 4080) es suficiente para inferencia en FP16. Para despliegue en produccion con multiples instancias, se recomienda una A100 (40 GB) o H100 (80 GB).
- Consumer GPU: si, el modelo cabe en GPUs de consumo como RTX 3060 (12 GB) o superiores, incluso con cuantizacion.
- Opciones de despliegue: al ser safetensors, puede cargarse con librerias como PyTorch, Transformers o frameworks de inferencia optimizados para TTS como Coqui TTS o Tortoise. No se ha confirmado compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible. Depende del hardware y de la implementacion de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Contexto | Idiomas | Notas |
|---|---|---|---|---|---|
| Sonexa-2-TTS | 1,93B | Apache 2.0 | no disponible | no disponible | Reentrenamiento de Qwen3-TTS-1.7B-Base |
| Qwen3-TTS-1.7B-Base | 1,7B | Apache 2.0 | no disponible | multiidioma | Modelo base de Alibaba, sin reentrenamiento |
| Cartesia Sonic-3 | no disponible | propietaria | no disponible | 40+ | API de TTS en tiempo real, con emociones y risa |

No se dispone de datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- Sin datos de calidad de voz: no hay benchmarks publicados que verifiquen la naturalidad, inteligibilidad o calidad de audio del modelo.
- Idiomas no especificados: no se ha indicado que idiomas soporta el modelo. La web de Sonexa AI menciona 50+ idiomas para su plataforma, pero no se confirma que Sonexa-2-TTS los cubra.
- Documentacion limitada: la model card es minima (solo menciona "retrained Qwen3-TTS-1.7B-Base"), sin detalles de entrenamiento, dataset o configuracion.
- Sin soporte de cuantizaciones: no se proporcionan pesos cuantizados (GGUF, ONNX, etc.), lo que puede requerir cuantizacion manual para despliegue en entornos con VRAM limitada.
- Riesgo de sesgos: al ser un reentrenamiento de un modelo base, puede heredar sesgos de los datos de entrenamiento originales, pero no hay informacion sobre evaluacion de sesgos.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda verificar que el modelo no tenga restricciones adicionales no documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SonexaAI/Sonexa-2-TTS
- Organizacion SonexaAI en Hugging Face: https://huggingface.co/SonexaAI
- Coleccion ASR/TTS de SonexaAI: https://huggingface.co/collections/SonexaAI/sonexa-asr-tts
- Sitio web de Sonexa AI: https://sonexaai.tech/
- Plataforma Sonexa (TTS): https://sonexa-ai.app/
