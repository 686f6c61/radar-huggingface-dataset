# emr0ze/chatterbox-turbo-onnx-android

## Resumen

Chatterbox Turbo ONNX Android es un paquete de distribución del modelo de síntesis de voz Chatterbox Turbo de Resemble AI, adaptado por el usuario emr0ze para su uso en aplicaciones Android mediante ONNX Runtime. El repositorio no contiene un modelo nuevo: empaqueta los grafos ONNX cuantizados a q4 del modelo original (embeddings, modelo de lenguaje T3 y decodificador S3Gen) junto con una voz precalculada y un manifiesto de integridad, todo en un único archivo tar de aproximadamente 495 MB pensado para que una app lo descargue, verifique y descomprima.

El problema que resuelve es práctico: llevar un TTS de calidad a dispositivos móviles sin necesidad de un codificador de voz en tiempo de ejecución, ya que la condicion de voz (voice conditioning) viene precalculada. Se ejecuta sobre ONNX Runtime 1.28 en CPU, lo que evita dependencias de GPU y facilita el despliegue en Android.

La relevancia es acotada: el repositorio tiene cero descargas y cero likes en el momento de la consulta, y el propio autor advierte que las mediciones de latencia (21-28 ms por token del modelo de lenguaje) se hicieron en una CPU de un Mac M1, no en un teléfono. La licencia es MIT, heredada del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS en tres componentes: embeddings de texto/habla, modelo de lenguaje T3 (GPT-2 medium con KV cache como entradas y salidas) y decodificador S3Gen |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | q4 (grafos cuantizados a 4 bits) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT (Copyright (c) 2025 Resemble AI) |
| Formato de pesos | ONNX (`embed_tokens_q4.onnx`, `language_model_q4.onnx`, `conditional_decoder_q4.onnx` y sus archivos `_data`) |

## Arquitectura y entrenamiento

El modelo subyacente es Chatterbox Turbo de Resemble AI, un sistema de texto a voz compuesto por tres etapas: un módulo de embeddings que convierte texto y habla en representaciones, un modelo de lenguaje T3 basado en GPT-2 medium que opera con KV cache expuesta como entradas y salidas, y un decodificador S3Gen que genera la forma de onda. El paquete incluye además archivos de condicionamiento de voz precalculados (`t3_cond.f32`, `dec_*`), de modo que no se necesita ejecutar un codificador de voz en el dispositivo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. El autor indica explícitamente que los grafos q4 son los publicados por Resemble AI, sin modificaciones, y que este repositorio solo los reempaqueta; el entrenamiento y los pesos son obra de Resemble AI. El archivo tar incluye `manifest.json` con el tamaño y el SHA-256 de cada fichero, además de `tokenizer.json` y `tokenizer_expected.json`.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en inglés.
- Uso de una voz precalculada incluida en el paquete, sin codificador de voz en tiempo de ejecución.
- Ejecución en CPU mediante ONNX Runtime 1.28, orientada a Android.
- Verificación de integridad de los archivos mediante manifiesto con tamaños y hashes SHA-256.
- Generación de audio sin marca de agua PerTh, a diferencia del Chatterbox original.
- No se documentan capacidades de clonación de voz en tiempo de ejecución, tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Lectura de contenido en apps Android: el paquete se descarga una vez, se verifica con el manifiesto y se descomprime para sintetizar texto en local sin conexión, gracias a la voz precalculada y a la ejecución en CPU.
- Asistentes de accesibilidad: conversión de texto a voz para usuarios con discapacidad visual en dispositivos móviles, sin depender de servicios en la nube.
- Integración en aplicaciones de lectura o noticias: narración de artículos con una voz consistente, usando los grafos q4 para reducir el espacio en disco y el uso de memoria.
- Pruebas de concepto de TTS embebido: validación de latencia y calidad en Android antes de adoptar el modelo upstream completo, dado que el paquete ya incluye tokenizador y condicionamiento.
- Distribución controlada de modelos: el tar con hashes SHA-256 permite a una app comprobar que los archivos descargados no han sido alterados antes de cargarlos en ONNX Runtime.
- Evaluación comparativa de cuantización q4: medir la degradación de calidad frente al modelo original de Resemble AI en un entorno móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es la latencia medida por el autor en una CPU de un Mac M1 (no en un teléfono): 21-28 ms por token para el modelo de lenguaje.

## Requisitos de hardware

- VRAM: no aplica; la ejecución es en CPU mediante ONNX Runtime 1.28.
- GPU recomendadas: no disponible; el paquete está pensado para CPU.
- Compatibilidad con GPU de consumo: no documentada; el diseño es para CPU en Android.
- Espacio de almacenamiento: el tar ocupa 494.878.720 bytes (aproximadamente 495 MB) y debe descomprimirse además en el dispositivo.
- Opciones de despliegue: ONNX Runtime 1.28 en Android; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 21-28 ms por token del modelo de lenguaje en un M1 Mac; no hay mediciones en teléfonos.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| emr0ze/chatterbox-turbo-onnx-android | TTS ONNX empaquetado para Android | en | q4 | MIT | Voz precalculada, sin marca de agua, ejecución en CPU |
| ResembleAI/chatterbox-turbo-ONNX | TTS ONNX upstream | no disponible | no disponible | MIT | Modelo base del que proceden los grafos |
| Chatterbox (original de Resemble AI) | TTS | no disponible | no disponible | MIT | Aplica marca de agua PerTh a la salida |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan otros idiomas.
- El paquete no incluye marca de agua PerTh, por lo que el audio generado no está marcado; esto puede ser relevante para requisitos de trazabilidad o políticas de uso.
- Las mediciones de latencia se realizaron en una CPU de Mac M1, no en un dispositivo Android; el rendimiento real en teléfonos es desconocido.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo día; no hay evidencia de uso en producción.
- No se documentan sesgos, tasas de alucinación ni limitaciones de contexto del modelo subyacente.
- La licencia MIT permite uso comercial, pero los derechos del modelo y los pesos pertenecen a Resemble AI; este repositorio solo reempaqueta.
- El tamaño del tar (unos 495 MB) más la descompresión puede ser un requisito de almacenamiento significativo en móviles.
- No se documentan requisitos de memoria RAM ni de versiones mínimas de Android.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/emr0ze/chatterbox-turbo-onnx-android
- Modelo base: https://huggingface.co/ResembleAI/chatterbox-turbo-ONNX
