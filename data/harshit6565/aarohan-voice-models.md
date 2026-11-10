# Harshit6565/aarohan-voice-models

## Resumen

Aarohan voice models es un repositorio de artefactos de voz para inferencia en el navegador, publicado por el usuario Harshit6565 en Hugging Face. No se trata de un modelo único entrenado desde cero, sino de un paquete de 53 ficheros (297,7 MB) que la web del proyecto Aaro descarga en el dispositivo del usuario para ejecutar reconocimiento de voz y síntesis de voz (text-to-speech) en local, sin servidor intermedio. El caso de uso declarado es el aprendizaje de idiomas para estudiantes, con soporte de hindi (hi-IN) y inglés de la India (en-IN).

El repositorio se organiza en dos bundles identificados por hash: `pair-hi-IN-3b2adc22ab7d9cc054ed4f42` y `pair-en-IN-1ad16a3e1a10ee49d4147b8d`. Cada fichero se nombra con su SHA-256 y la web verifica tamaño y hash antes de cargarlo, apuntando a un commit concreto del repositorio. Los pesos están en formato ONNX, lo que permite ejecución on-device mediante WebAssembly o WebGPU en el navegador.

La relevancia de este repositorio es acotada: no es un modelo publicable con benchmarks ni una arquitectura propia, sino una distribución de dependencias de terceros empaquetadas para despliegue web. La licencia es mixta (`mixed-see-notice`) y agrega componentes MIT, Apache-2.0, CC-BY-4.0, dominio público y datos de eSpeak NG bajo GPL-3.0, lo que condiciona su reutilización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pesos ONNX de modelos de terceros; incluye componentes de reconocimiento y síntesis de voz) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (artefactos ONNX precompilados; no se documentan niveles de cuantización) |
| Idiomas soportados | hindi (hi-IN) e inglés de la India (en-IN) |
| Licencia | mixta: MIT, Apache-2.0, CC-BY-4.0, dominio público y GPL-3.0 (eSpeak NG); ver NOTICE.txt |
| Formato de pesos | ONNX, con payloads gzip (`.bin`); ficheros nombrados por SHA-256 |

## Arquitectura y entrenamiento

No se documenta la arquitectura interna de los modelos subyacentes. El repositorio es una copia de entrega para navegador de modelos de voz de distintos autores, según la model card. Entre las dependencias citadas aparecen componentes de Moonshine (reconocimiento de voz, con licencia propia incluida en el repo) y de Whisper (licencia MIT), además de datos de eSpeak NG para síntesis. No se especifican parámetros, tokens de entrenamiento, composición del dataset ni si hubo ajuste por RLHF o DPO, porque el autor no entrena estos modelos: los empaqueta.

La innovación técnica relevante no está en el modelado sino en la distribución: nombres de fichero basados en SHA-256, verificación de integridad en cliente, carga mediante URL fijada a un commit y ejecución totalmente on-device. Esto reduce la superficie de ataque y evita enviar audio de estudiantes a un servidor, pero no aporta ninguna mejora de calidad sobre los modelos originales.

## Capacidades

- Reconocimiento de voz (speech-recognition) para hindi e inglés de la India, ejecutado en el dispositivo.
- Síntesis de voz (text-to-speech), pipeline declarado en Hugging Face.
- Ejecución on-device en navegador mediante ONNX, sin servidor.
- Verificación de integridad de cada artefacto por tamaño y SHA-256 antes de su uso.
- Soporte de dos locales concretos: `hi-IN` y `en-IN`.
- No se documenta tool calling, function calling, razonamiento multi-paso, visión, audio generativo ni modo thinking.
- No se documentan capacidades multilingües más allá de los dos locales indicados.

## Casos de uso

- Aprendizaje de idiomas en navegador: la web descarga los bundles `hi-IN` y `en-IN` y ejecuta reconocimiento y síntesis en el dispositivo del estudiante, de modo que la práctica de pronunciación no requiere enviar audio a un backend.
- Aplicaciones educativas con requisitos de privacidad: al procesarse el audio localmente, encaja en entornos escolares donde no se permite subir grabaciones de menores a servidores externos.
- Demos y prototipos de voz sin infraestructura: al ser artefactos ONNX estáticos, se pueden servir desde un CDN o desde el propio repositorio y cargar en el cliente sin desplegar GPUs.
- Verificación de integridad en cadena de suministro: el esquema de nombres por SHA-256 y la fijación a un commit sirven como referencia para auditar qué binarios consume una aplicación web.
- Pruebas de conformidad de licencias: el repositorio incluye los textos de licencia y un NOTICE.txt con autores y revisiones upstream, útil para auditar la procedencia de componentes en un producto.
- Integración en asistentes de lectura o dictado para hindi e inglés de la India en entornos de baja conectividad, siempre que el navegador soporte la ejecución ONNX requerida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica en el sentido habitual; la inferencia ocurre en el navegador del cliente, no en GPU de servidor. No se documentan requisitos de memoria del dispositivo.
- GPU recomendadas: no disponible. El despliegue depende de WebAssembly o WebGPU del navegador; no se especifican modelos de GPU compatibles.
- GPU de consumo: no se documenta compatibilidad con RTX 4090, RTX 3090 ni otras.
- Despliegue: carga de artefactos ONNX en navegador; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato de entrega.
- Latencia y throughput: no disponibles.
- Tamaño de descarga: 297,7 MB en 53 ficheros, dato relevante para el tiempo de primera carga en el cliente.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Aarohan voice models (este repo) | Paquete de artefactos de voz para navegador | hi-IN, en-IN | ONNX | Mixta (MIT, Apache-2.0, CC-BY-4.0, GPL-3.0) | 297,7 MB, 53 ficheros, verificación SHA-256 |
| Whisper (OpenAI) | ASR | Multilingüe | PyTorch, ONNX, GGML | MIT | Referenciado como dependencia en este repo |
| Moonshine | ASR | Principalmente inglés | ONNX y otros | Licencia propia incluida en el repo | Referenciado como dependencia en este repo |
| eSpeak NG | TTS | Multilingüe | Datos y binarios | GPL-3.0 | Usado como datos de síntesis |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: es una redistribución de artefactos de terceros, por lo que la calidad depende de los modelos upstream y no puede atribuirse a este repositorio.
- Ausencia total de benchmarks, parámetros, contexto y especificaciones de entrenamiento; no es evaluable como modelo de forma aislada.
- Licencia mixta con componente GPL-3.0 (eSpeak NG): el uso comercial o la redistribución requieren revisar NOTICE.txt y los textos de licencia para determinar obligaciones de copyleft.
- Idiomas limitados a hindi e inglés de la India; no hay soporte documentado de castellano ni de otros idiomas.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día: madurez y mantenimiento no verificables.
- Riesgo de alucinación y sesgos: no evaluable sin documentación de los modelos subyacentes ni de sus datasets.
- Dependencia del navegador: el rendimiento real depende del soporte de ONNX Runtime Web, WebAssembly o WebGPU en el cliente, no documentado.
- La verificación por SHA-256 protege la integridad de los ficheros, pero no garantiza la calidad ni la seguridad del contenido de los modelos de terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Harshit6565/aarohan-voice-models
- Aviso de licencias y atribución: https://huggingface.co/Harshit6565/aarohan-voice-models/blob/main/NOTICE.txt
- Texto de licencia Apache-2.0: https://huggingface.co/Harshit6565/aarohan-voice-models/blob/main/Apache-2.0.txt
- Texto de licencia CC-BY-4.0: https://huggingface.co/Harshit6565/aarohan-voice-models/blob/main/CC-BY-4.0.txt
- Licencia de Moonshine: https://huggingface.co/Harshit6565/aarohan-voice-models/blob/main/Moonshine-LICENSE.txt
- Avisos de terceros del runtime de Moonshine: https://huggingface.co/Harshit6565/aarohan-voice-models/blob/main/Moonshine-runtime-THIRD_PARTY_NOTICES.txt
- Licencia MIT de Whisper: https://huggingface.co/Harshit6565/aarohan-voice-models/blob/main/Whisper-MIT.txt
- Licencia GPL-3.0 de eSpeak NG: https://huggingface.co/Harshit6565/aarohan-voice-models/blob/main/espeak-GPL-3.0.txt
