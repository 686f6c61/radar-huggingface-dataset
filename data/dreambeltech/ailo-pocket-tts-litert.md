# dreambeltech/ailo-pocket-tts-litert

## Resumen

Ailo Pocket TTS LiteRT es una conversión a LiteRT (el runtime de IA en dispositivo de Google) de los modelos Pocket TTS de Kyutai, realizada por Dreambel Tech para su aplicación Android Ailo. Se trata de un sistema de síntesis de voz (text-to-speech) de aproximadamente 100 millones de parámetros que genera audio a 24 kHz de forma totalmente local en el teléfono, sin enviar datos a ningún servidor. El modelo base es `kyutai/pocket-tts-without-voice-cloning`, una variante de Pocket TTS que excluye la capacidad de clonación de voz.

La relevancia de esta ficha radica en que ejemplifica el patrón de despliegue de TTS neuronal en hardware móvil de consumo: los pesos se han convertido a grafos TFLite optimizados para streaming, con cuantización mixta (int8 dinámico en el transformer, fp16 en el decodificador Mimi y en las cabeceras de flujo) y una gestión explícita del estado de atención para poder generar audio fotograma a fotograma mientras el texto restante aún se está procesando. El resultado medido en un Pixel 11 Pro es de 60 a 75 ms hasta el primer audio y un rendimiento aproximado de cuatro veces el tiempo real.

El modelo soporta francés e inglés, se distribuye bajo licencia CC BY 4.0 y no incluye codificador Mimi ni herramientas para construir voces a partir de audio, por lo que la clonación de voz queda fuera de su alcance por diseño. Es una release no oficial de Kyutai, compartida como copia modificada y convertida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal en dos etapas: modelo de lenguaje de flujo (flow LM) sobre latentes + decodificador Mimi con estado de streaming |
| Parametros totales | Aproximadamente 100 M (según model card del autor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa el prompt de texto en fragmentos de como maximo 50 tokens) |
| Tipos de cuantizacion | Transformer con int8 dinamico; cabecera de flujo y pesos de Mimi en fp16; embeddings y estados de voz en fp16; proyecciones y normalizaciones en fp32 |
| Idiomas soportados | Frances (fr) e ingles (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | TFLite (LiteRT), binarios little-endian y tokenizador SentencePiece en TSV |

## Arquitectura y entrenamiento

El sistema sigue una arquitectura de dos etapas típica de los TTS neuronales modernos basados en codecs. La primera etapa es un modelo de lenguaje de flujo (flow LM) que opera sobre representaciones latentes de 32 dimensiones y que, en esta conversión, se ha exportado con firmas `prefill_16`, `prefill_32` y `prefill_64` para procesar el prompt de texto por fragmentos, además de una firma `decode` que realiza un único paso de decodificación escribiendo su propia fila de clave/valor en el buffer de atención. La segunda etapa es el decodificador Mimi, que recibe un fotograma latente y produce 80 ms de audio a 24 kHz manteniendo un estado de streaming explícito. Las convoluciones transpuestas se han reescrito como dos productos matriciales y la GELU usa la forma exacta con tanh del modelo original.

La conversión se realizó con `litert-torch` 0.9.3 a partir de `pocket-tts` 4.0.1, y la cuantización con `ai-edge-quantizer` 0.8.0. Los pesos del transformer se cuantizaron a int8 dinámico, mientras que la cabecera de flujo y Mimi se mantuvieron en fp16. La normalización de latentes se aplica en el host, lo que permite compartir un único grafo Mimi entre idiomas. El repositorio incluye solo la voz `estelle`, cuyos estados de clave/valor se han reubicado desde los safetensors originales. No se dispone de información sobre el volumen de tokens de entrenamiento ni sobre el uso de RLHF/DPO en la información proporcionada; esos detalles corresponden al modelo base de Kyutai, no documentados aquí.

## Capacidades

- Síntesis de voz en francés e inglés a 24 kHz con generación en streaming: el audio empieza a reproducirse antes de que se haya generado la frase completa.
- Generación fotograma a fotograma (80 ms por fotograma) con estado de decodificación persistente entre pasos.
- Procesamiento por fragmentos de texto de hasta 50 tokens, con prefill por lotes (`prefill_16`, `prefill_32`, `prefill_64`) que el autor verifica como idéntico al prefill token a token.
- Control de fin de habla mediante un logit de fin de secuencia con umbral -4 y temperatura de muestreo de 0,3, siguiendo la preparación de texto de referencia en `text_settings.json`.
- Ejecución completamente local en Android mediante LiteRT 2.3.0 con XNNPACK y caché de pesos.
- No incluye clonación de voz: el repositorio no contiene codificador Mimi ni utilidades para construir voces a partir de audio.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Lectura por voz de notificaciones y mensajes en una app Android: el modelo genera el audio en el propio dispositivo con una latencia de primer audio de 60 a 75 ms, lo que permite empezar a reproducir antes de terminar de sintetizar la frase.
- Asistentes conversacionales sin conexión: al no enviar texto ni audio a ningún servidor, encaja en escenarios de privacidad estricta (sanidad, finanzas personales) donde la voz no puede salir del terminal.
- Accesibilidad para personas con discapacidad visual: lectura de pantalla con voces francesas e inglesas y un consumo de memoria privada de 130 a 170 MB en el pico de síntesis, compatible con móviles de gama media-alta.
- Aprendizaje de idiomas: reproducción de frases en francés e inglés con una tasa de error de caracteres medida por Whisper de 0,145 y 0,127 respectivamente, adecuada para ejercicios de pronunciación y dictado.
- Integración en pipelines de CI para apps móviles: los grafos TFLite y el `manifest.json` con tamaños y SHA-256 permiten verificar la integridad de los artefactos y automatizar pruebas de regresión de audio.
- Prototipado de interfaces de voz en dispositivos de borde: al ejecutarse a unas cuatro veces el tiempo real en un Tensor G6, deja margen de CPU para otras tareas del sistema en segundo plano.
- Generación de audiolibros o contenido narrado por lotes en el propio dispositivo, siempre que se respete la preparación de texto (números y fechas escritos en palabras) para evitar sonidos ininteligibles.

## Benchmarks y rendimiento

| Metrica | Valor medido | Contexto |
|---|---|---|
| SNR de Mimi en streaming frente al decodificador de referencia | 84,5 dB | fp16, en PC |
| Tasa de error de caracteres (Whisper) en frances | 0,145 | Sin cambios por cuantizacion ni streaming |
| Tasa de error de caracteres (Whisper) en ingles | 0,127 | Sin cambios por cuantizacion ni streaming |
| Latencia hasta el primer audio | 60-75 ms (mediana), 292 ms (peor caso) | Pixel 11 Pro (Tensor G6), Android 17, LiteRT 2.3.0 CPU, 4 hilos, XNNPACK |
| Rendimiento relativo | Aproximadamente 4x tiempo real | Mismo dispositivo |
| Memoria privada en el pico de sintesis | 130-170 MB | Mismo dispositivo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que se trata de un modelo de síntesis de voz y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM o memoria estimada para inferencia: 130 a 170 MB de memoria privada en el pico de síntesis, medidos en un Pixel 11 Pro con Tensor G6.
- GPU recomendadas: no se documenta aceleración por GPU; las mediciones se realizaron en CPU con LiteRT 2.3.0 y XNNPACK con 4 hilos.
- Compatibilidad con GPU de consumo: el modelo está pensado para ejecutarse en el propio teléfono; en un PC con GPU dedicada podría ejecutarse mediante LiteRT, pero no se han publicado cifras en ese escenario.
- Opciones de despliegue: LiteRT (runtime oficial de Google para TFLite), con soporte de caché de pesos XNNPACK. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: 60 a 75 ms de mediana hasta el primer audio y 292 ms en el peor caso sobre 1.360 respuestas, con un throughput de aproximadamente cuatro veces el tiempo real en el dispositivo de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Ailo Pocket TTS LiteRT (este modelo) | ~100 M | fr, en | TFLite / LiteRT en Android | CC BY 4.0 | Conversion no oficial de Pocket TTS sin clonacion de voz; streaming con estado |
| kyutai/pocket-tts-without-voice-cloning | ~100 M | fr, en | PyTorch / safetensors | CC BY 4.0 | Modelo base original de Kyutai; requiere runtime PyTorch |
| Piper TTS | No disponible | Multiples | ONNX / varios runtimes | No disponible | TTS ligero para dispositivo, sin datos comparables en la informacion disponible |
| Coqui TTS (variantes ligeras) | No disponible | Multiples | PyTorch / ONNX | No disponible | Ecosistema de TTS open source; sin cifras comparables en la informacion disponible |

No se dispone de datos de benchmarks homogéneos que permitan comparar el rendimiento de este modelo con las alternativas citadas; la comparación se limita a parámetros, idiomas, formato de despliegue y licencia.

## Limitaciones y advertencias

- Los dígitos se convierten en sonidos ininteligibles: es obligatorio escribir números, horas, importes y fechas en palabras antes de la síntesis.
- Requiere seguir la preparación de texto de referencia (`text_settings.json`): sustituciones de caracteres, fragmentos de como maximo 50 tokens, temperatura 0,3 y umbral de fin de habla de -4 en el logit.
- No incluye clonación de voz ni codificador Mimi; no debe usarse para imitar a personas reales sin su consentimiento explícito.
- Solo cubre francés e inglés; no se documenta soporte de otros idiomas.
- Es una conversión no oficial de Kyutai, sin aval del autor original; posibles desviaciones respecto al modelo base no están cubiertas por Kyutai.
- Riesgo de alucinación acústica y artefactos en entradas atípicas (texto con símbolos, abreviaturas o mezcla de idiomas), no cuantificado en la información disponible.
- Sesgos de voz y pronunciación: el repositorio incluye una única voz (`estelle`), lo que limita la diversidad de hablantes y puede introducir sesgos de género o acento.
- La licencia CC BY 4.0 permite uso comercial con atribución; es necesario conservar la atribución a Kyutai y a Dreambel Tech y cumplir los términos de la licencia.
- La voz `estelle` proviene de una grabación de Kyutai descrita como CC0; conviene verificar la cadena de atribución antes de un despliegue comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dreambeltech/ailo-pocket-tts-litert
- Modelo base: https://huggingface.co/kyutai/pocket-tts-without-voice-cloning
- Repositorio de referencia de Pocket TTS: https://github.com/kyutai-labs/pocket-tts
- LiteRT (Google AI Edge): https://ai.google.dev/edge/litert
- Voces de Kyutai: https://huggingface.co/kyutai/tts-voices
- Enfoque de conversión de referencia: https://github.com/john-rocky/LiteRT-Models
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Sitio del autor: https://dreambel.tech
