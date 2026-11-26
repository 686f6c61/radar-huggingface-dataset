# emr0ze/chatterbox-turbo-coreml-ios

## Resumen

Chatterbox Turbo Core ML para iOS es una conversión a Core ML del modelo de síntesis de voz ResembleAI/chatterbox-turbo, empaquetada específicamente para su despliegue en aplicaciones iOS 18 o superiores. El autor de la conversión es el usuario emr0ze, mientras que el modelo original, los pesos y el entrenamiento son obra de Resemble AI. El paquete se distribuye como un único archivo tar que la aplicación descarga, verifica y descomprime en tiempo de ejecución, lo que facilita la integración de TTS neuronal en el dispositivo sin depender de servicios en la nube.

La relevancia de esta ficha radica en que traslada un modelo generativo de voz a la Neural Engine y la GPU de Apple mediante Core ML, con un pipeline dividido en tres componentes: el modelo de lenguaje T3 (basado en GPT-2 medium), el decodificador S3Gen meanflow y un vocoder. El paquete incluye las tablas de embeddings y la condicionación de voz precalculada, de modo que no se necesita un codificador de habla en el dispositivo. El resultado es un sistema de TTS local, sin marca de agua y con latencias medidas en un Mac M1, no en un iPhone.

El modelo está pensado para desarrolladores que quieran incorporar síntesis de voz en apps iOS con privacidad por diseño, funcionamiento offline y control total del pipeline. La licencia MIT del modelo original se mantiene, aunque la conversión Core ML es responsabilidad del autor del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS: modelo de lenguaje T3 (GPT-2 medium) + decodificador S3Gen meanflow + vocoder |
| Parametros totales | no disponible (el paquete tar ocupa 746.485.760 bytes; el modelo base es GPT-2 medium en T3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la cache KV del T3 tiene 512 filas) |
| Tipos de cuantizacion | T3 en 8 bits palettizado (pal8); S3 flow en fp16; vocoder en fp32; embeddings en fp16 |
| Idiomas soportados | ingles (en) |
| Licencia | MIT (Copyright (c) 2025 Resemble AI) |
| Formato de pesos | Core ML `.mlpackage` dentro de un tar; tablas de embeddings en `.f16` y condicionacion en `.f32` |

## Arquitectura y entrenamiento

La conversión mantiene la arquitectura del modelo original Chatterbox Turbo de Resemble AI, que combina un modelo de lenguaje autorregresivo T3 basado en GPT-2 medium con un decodificador S3Gen de tipo meanflow y un vocoder. En la versión Core ML, el T3 se ha palettizado a 8 bits y se ha dividido en dos funciones, `prefill` y `decode`, que comparten pesos y un único estado KV de 512 filas (`MLState`). El decodificador S3Gen se ha convertido a fp16 para generar 100 tokens de habla nuevos por llamada, con máscaras de padding reales, y el vocoder se mantiene en fp32.

El paquete incluye las tablas de embeddings (`text_emb.f16`, `speech_emb.f16`, `wpe.f16`) que se recolectan en CPU, así como la condicionación de voz precalculada (`t3_cond.f32`, `dec_*`), lo que elimina la necesidad de ejecutar un codificador de habla en el dispositivo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. La innovación técnica destacable es la conversión a Core ML con estado KV compartido entre prefill y decode, y la eliminación del codificador de habla mediante condicionación precalculada.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en inglés.
- Generación de audio sin marca de agua: el modelo original aplica PerTh de Resemble AI, pero estos paquetes son solo los modelos y el audio generado no lleva marca de agua.
- Funcionamiento en el dispositivo mediante Core ML, con ejecución en Neural Engine y GPU de Apple.
- Streaming con primer sonido en aproximadamente 0,8 s (medido en un Mac M1).
- Generación por llamadas de 100 tokens de habla con el decodificador S3Gen.
- No se indica soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Lectura por voz de artículos y noticias en apps iOS: el modelo puede sintetizar texto en el dispositivo con el pipeline T3 + S3Gen + vocoder, manteniendo la privacidad del contenido leído y funcionando sin conexión.
- Asistentes de accesibilidad: integración de TTS local para usuarios con discapacidad visual, con latencia de primer sonido de aproximadamente 0,8 s en streaming y sin depender de servicios externos.
- Audiolibros y contenido educativo: generación de narraciones en inglés con condicionación de voz precalculada, lo que permite voces consistentes sin ejecutar un codificador de habla en el dispositivo.
- Aplicaciones de aprendizaje de idiomas: reproducción de pronunciación y frases en inglés generadas localmente, con control sobre el texto de entrada y sin coste por petición.
- Interfaces conversacionales offline: respuesta hablada en asistentes de app que deben funcionar sin red, usando el paquete tar descargado y verificado en el primer arranque.
- Prototipado de TTS en iOS: evaluación de la calidad del modelo Chatterbox Turbo en un iPhone antes de invertir en infraestructura de servidor, gracias a la licencia MIT y al formato Core ML listo para Xcode.
- Generación de avisos y notificaciones habladas: síntesis de mensajes cortos en el dispositivo con el decodificador configurado para 100 tokens por llamada, adecuado para locuciones breves.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MOS, MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento proporcionados son mediciones de latencia en un Mac M1, no en un iPhone:

| Medición | Valor | Hardware |
|---|---|---|
| T3 por token | 11,6 ms | Neural Engine, M1 Mac |
| Llamada al decodificador | 0,29 s | GPU, M1 Mac |
| Primer sonido en streaming | ~0,8 s | M1 Mac |

## Requisitos de hardware

- VRAM estimada: no disponible; el paquete tar ocupa 746.485.760 bytes (aproximadamente 0,7 GB) y debe descomprimirse en el dispositivo.
- GPU recomendadas: no se especifican modelos de iPhone o iPad concretos; las mediciones se hicieron en un Mac M1, no en un teléfono.
- Compatibilidad con GPU de consumo: el destino es Apple Silicon (Neural Engine y GPU) en iOS 18 o superior; no se indica soporte para GPU NVIDIA.
- Opciones de despliegue: Core ML en apps iOS 18+; el paquete se distribuye como tar para descarga, verificación y descompresión por la app. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: T3 a 11,6 ms por token en Neural Engine, 0,29 s por llamada al decodificador en GPU y primer sonido en torno a 0,8 s en streaming, todo medido en un M1 Mac.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| emr0ze/chatterbox-turbo-coreml-ios | TTS Core ML para iOS | no disponible (T3 basado en GPT-2 medium) | no disponible (KV de 512 filas) | MIT | Hugging Face, 0 descargas |
| ResembleAI/chatterbox-turbo | TTS original | no disponible | no disponible | MIT | Hugging Face (modelo base) |
| Otros TTS en Core ML para iOS | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Solo soporta inglés; no se indica cobertura multilingüe.
- El modelo original aplica la marca de agua PerTh de Resemble AI, pero esta conversión no la incluye, por lo que el audio generado no está marcado; esto puede ser relevante para requisitos de trazabilidad o políticas de uso.
- Las latencias publicadas se midieron en un Mac M1, no en un iPhone, por lo que el rendimiento real en dispositivos móviles puede diferir.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día; no hay evidencia de validación por parte de la comunidad.
- No se dispone de información sobre sesgos, riesgo de alucinación en la síntesis ni limitaciones de contexto más allá de la caché KV de 512 filas.
- La licencia MIT permite uso comercial, pero la conversión Core ML es responsabilidad del autor del repositorio y no de Resemble AI.
- Requiere iOS 18 o superior y un proceso de descarga, verificación y descompresión del tar en la app; no es un paquete listo para usar sin integración.
- No se indica soporte para tool calling, agentes ni otras capacidades más allá de la síntesis de voz.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/emr0ze/chatterbox-turbo-coreml-ios
- Modelo base: https://huggingface.co/ResembleAI/chatterbox-turbo
