# LiquidAI/LFM2.5-Audio-1.5B

## Resumen

LFM2.5-Audio-1.5B es un modelo fundacional de audio extremo a extremo desarrollado por Liquid AI. Se trata de un modelo multimodal de voz y texto que integra en un único sistema las funciones de reconocimiento automático del habla (ASR), síntesis de voz (TTS) y conversación por voz (speech-to-speech), eliminando la necesidad de encadenar componentes separados. Está disenado especificamente para conversacion en tiempo real con baja latencia, con solo 1.500 millones de parametros totales (1.200 millones en el modelo de lenguaje).

La arquitectura combina un backbone de lenguaje preentrenado LFM2.5 de 1.2B con capas hibridas de convolucion y atencion, un codificador de audio FastConformer de 115M parametros basado en canary-180m-flash, un RQ-transformer que genera tokens discretos de audio y un detokenizador de audio ligero compatible con Mimi (8 codebooks). El contexto es de 32.768 tokens.

Esta version 2.5 introduce mejoras clave respecto a la anterior: un detokenizador de audio personalizado basado en LFM, GGUFs compatibles con llama.cpp para inferencia en CPU, y mejor rendimiento tanto en ASR como en TTS. El modelo es relevante ahora porque demuestra que es posible alcanzar capacidades de conversacion por voz comparables a modelos mucho mas grandes con un presupuesto de parametros muy reducido, lo que lo hace apto para despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone LFM2.5 (hibrido conv+attention) + encoder FastConformer + RQ-transformer + detokenizador Mimi-compatible |
| Parametros totales | 1.470.308.496 (1.2B en el modelo de lenguaje, 115M en el encoder de audio) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | GGUF (compatible con llama.cpp); precision nativa bfloat16 |
| Idiomas soportados | Ingles |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

LFM2.5-Audio es un modelo multimodal de audio a audio construido sobre un backbone de lenguaje LFM2.5 con capas hibridas de convolucion y atencion. El procesamiento de audio de entrada se realiza mediante un encoder FastConformer de 115M parametros (basado en canary-180m-flash de NVIDIA), que convierte la senal continua en representaciones que el modelo de lenguaje puede procesar. La generacion de audio se lleva a cabo mediante un RQ-transformer que produce tokens discretos de audio en 8 codebooks, posteriormente convertidos a forma de onda por un detokenizador ligero compatible con Mimi (que devuelve audio a 24 kHz).

El modelo soporta dos rutinas de generacion distintas. La generacion intercalada (interleaved) permite conversacion speech-to-speech en tiempo real, donde la latencia de generacion de audio es critica. La generacion secuencial esta pensada para tareas no conversacionales como ASR o TTS, y permite al modelo cambiar de modalidad generada sobre la marcha. El vocabulario es de 65.536 tokens de texto y 2049*8 tokens de audio. No se especifican en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de voz a voz (speech-to-speech) en tiempo real con baja latencia.
- Reconocimiento automatico del habla (ASR) en ingles.
- Sintesis de texto a voz (TTS) con detokenizador de audio propio.
- Conversacion multimodal multi-turno combinando entradas de audio y texto.
- Generacion intercalada de texto y audio en la misma respuesta.
- Cambio dinamico de modalidad de salida (texto o audio) durante la generacion.
- Procesamiento de audio de entrada continua mediante encoder FastConformer.
- No se detalla en la informacion disponible soporte explicito de tool calling, function calling ni razonamiento multi-paso basado en agentes.

## Casos de uso

- Asistentes de voz conversacionales en tiempo real: el modelo puede gestionar dialogos multi-turno con entrada y salida de audio, gracias a su rutina de generacion intercalada y a los 32.768 tokens de contexto, adecuado para interacciones de atencion al cliente o asistentes personales.
- Transcripcion automatica del habla (ASR): mediante generacion secuencial, el modelo transcribe audio a texto en ingles sin necesidad de un componente ASR separado, simplificando el pipeline.
- Sintesis de voz (TTS): el modelo genera audio a partir de texto con su detokenizador Mimi-compatible a 24 kHz, util para lectores de pantalla, audiolibros o respuestas habladas en aplicaciones.
- Sistemas de voz para dispositivos con recursos limitados: con 1.5B parametros y GGUFs compatibles con llama.cpp, puede desplegarse en CPU o en hardware modesto para interfaces de voz embebidas.
- Prototipado rapido de agentes de voz: la libreria liquid-audio y el demo Gradio permiten levantar una interfaz funcional en el puerto 7860 con pocos comandos, acelerando la validacion de ideas.
- Investigacion en modelos de audio fundacionales: su arquitectura compacta y abierta (pesos en safetensors) facilita experimentos de fine-tuning y analisis de componentes (encoder, RQ-transformer, detokenizador).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 1.5B parametros en bfloat16 los pesos ocupan aproximadamente 3 GB, por lo que se estima un consumo de VRAM moderado (orientativo, no confirmado en la informacion).
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, cabria esperar funcionamiento en GPUs consumer (por ejemplo, RTX 4090) y en GPUs de datacenter (A100, H100), aunque no se confirma.
- Compatibilidad con GPU consumer: probable por el tamano del modelo, aunque no confirmado en la documentacion proporcionada.
- Opciones de despliegue: libreria `liquid-audio` (con soporte opcional de flash-attn 2, fallback a torch SDPA), GGUFs compatibles con llama.cpp para inferencia en CPU, y demo Gradio mediante `liquid-audio-demo`.
- Latencia y throughput: el modelo esta disenado para baja latencia y conversacion en tiempo real, pero no se proporcionan cifras concretas de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Como referencia cualitativa, el propio autor indica que existe una version posterior, LiquidAI/LFM3-Audio-2B, que podria considerarse una alternativa de la misma familia.

## Limitaciones y advertencias

- Solo soporta ingles; no se contemplan otros idiomas.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en transcripciones o respuestas habladas.
- Sesgos conocidos: no se detallan en la informacion disponible, pero al entrenarse principalmente en ingles puede presentar sesgos linguisticos y culturales.
- La licencia LFM Open License v1.0 es de tipo "other"; es necesario revisar el archivo LICENSE para conocer las restricciones exactas de uso comercial.
- El modelo esta marcado como version anterior (new_version: LiquidAI/LFM3-Audio-2B), por lo que para nuevos desarrollos conviene evaluar la version mas reciente.
- No se documentan en la informacion disponible capacidades de tool calling ni de agentes, lo que limita su uso en pipelines que requieran esas funciones.
- La calidad del audio generado depende del detokenizador Mimi-compatible y de los 8 codebooks; no se aportan metricas objetivas de calidad.

## Enlaces

- Hugging Face: https://huggingface.co/LiquidAI/LFM2.5-Audio-1.5B
- Playground: https://playground.liquid.ai/
- Documentacion: https://docs.liquid.ai/lfm/getting-started/welcome
- LEAP: https://leap.liquid.ai/
- Discord: https://discord.com/invite/liquid-ai
- Paper (arxiv): https://arxiv.org/abs/2511.23404
- Modelo base: https://huggingface.co/LiquidAI/LFM2-1.2B
- Encoder de referencia: https://huggingface.co/nvidia/canary-180m-flash
- Detokenizador Mimi: https://huggingface.co/kyutai/mimi
- Version posterior: https://huggingface.co/LiquidAI/LFM3-Audio-2B
