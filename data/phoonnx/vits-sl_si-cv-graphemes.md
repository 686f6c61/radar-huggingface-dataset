# Phoonnx/vits-sl_si-cv-graphemes

## Resumen

vits-sl_si-cv-graphemes es un modelo de síntesis de voz (text-to-speech) de la familia VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo convierte texto en esloveno (sl-SI) en audio, tomando como entrada los caracteres del texto (front-end basado en grafemas) y produciendo formas de onda directamente, sin necesidad de un vocoder externo. Su relevancia radica en que ofrece TTS neurálgico para esloveno, un idioma con pocos recursos en el ecosistema de voz, y lo hace con un formato ONNX ligero (0,1 GB) que puede ejecutarse en entornos con recursos limitados, incluidos asistentes de voz como OVOS.

El modelo no es un LLM ni un transformer de propósito general, sino una arquitectura VITS completa (encoder de texto, predictor de duración, flujo normalizador y decoder generativo) entrenada sobre el corpus Common Voice en esloveno. Está pensado para integrarse en pipelines de síntesis de voz y en asistentes conversacionales, no para generación de texto, razonamiento ni código.

La ficha se limita a los datos publicados en la model card y en los metadatos de Hugging Face; cualquier especificación no documentada se indica explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada por frase de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | esloveno (sl, sl-SI) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (empaquetado para phoonnx); el upstream original es Coqui TTS |
| Front-end de texto | grafemas (`GraphemePhonemizer` de scriptconv) |
| Dataset de entrenamiento | Common Voice (esloveno) |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-to-speech |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que combina un encoder de texto, un predictor de duración estocástico, un flujo normalizador y un decoder generativo basado en GAN, de modo que el modelo produce directamente la forma de onda sin vocoder separado. La entrada de texto se procesa a nivel de grafemas mediante `GraphemePhonemizer` de la librería scriptconv, que normaliza el texto y lo convierte en la secuencia de entrada del modelo. El modelo original fue entrenado por Coqui sobre el corpus Common Voice en esloveno, según se desprende de la nomenclatura `cv` y de la tabla de licencias de Coqui TTS.

No se dispone de información publicada sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni sobre el uso de RLHF, DPO u otras técnicas de alineación (no aplicables típicamente a TTS). Tampoco se documentan innovaciones técnicas adicionales más allá de las propias de VITS. El empaquetado de Phoonnx añade la conversión a ONNX y la integración con su gestor de modelos y con el plugin `ovos-tts-plugin-phoonnx` para OVOS.

## Capacidades

- Síntesis de voz a partir de texto en esloveno (sl-SI), con salida en formato WAV.
- Entrada basada en grafemas: no requiere un diccionario fonético externo para el esloveno.
- Generación end-to-end de audio sin vocoder separado, gracias a la arquitectura VITS.
- Ejecución en ONNX, lo que permite inferencia en CPU y en entornos sin GPU dedicada.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, seleccionable en `mycroft.conf`.
- Gestión de voces a través de `TTSModelManager` de phoonnx (`coqui/sl-cv-vits`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking; es exclusivamente un modelo TTS.
- Capacidad multilingüe limitada al esloveno; no se documentan otros idiomas.

## Casos de uso

- Asistentes de voz en esloveno: el modelo puede integrarse en OVOS como motor TTS para responder verbalmente a consultas del usuario, gracias al plugin `ovos-tts-plugin-phoonnx` y a la configuración por voz en `mycroft.conf`.
- Lectura de contenido en aplicaciones de accesibilidad: conversión de texto a audio para lectores de pantalla o aplicaciones dirigidas a usuarios eslovenos con discapacidad visual, con inferencia ONNX en CPU.
- Audiolibros y contenido narrado: síntesis de frases o párrafos en esloveno para generar narraciones automatizadas, dado el bajo tamaño del modelo (0,1 GB) que permite desplegarlo en servidores modestos.
- Sistemas de megafonía y avisos automatizados: generación de anuncios pregrabados o dinámicos en esloveno para transporte, comercio o administración pública, donde la latencia de un modelo VITS pequeño es adecuada.
- Prototipado de interfaces conversacionales: uso del modelo como componente TTS en pipelines de investigación sobre diálogo en esloveno, al ser un recurso ligero y de licencia permisiva.
- Integración en dispositivos embebidos o de borde: al distribuirse en ONNX y ocupar 0,1 GB, puede ejecutarse en hardware con recursos limitados para síntesis de voz local sin dependencia de la nube.
- Generación de voces para vídeos y demos: producción de pistas de audio en esloveno para contenido divulgativo o pruebas de producto, con licencia BSD-3-Clause que facilita el uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un modelo VITS empaquetado en ONNX con un repositorio de 0,1 GB, es esperable que quepa en GPUs de gama baja e incluso que funcione en CPU, aunque no se documentan cifras oficiales.
- GPU recomendadas: no disponible; por el tamaño del modelo, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente, pero no hay datos publicados que lo confirmen.
- ¿Cabe en GPU consumer? Sí, previsiblemente, dado el tamaño reducido del repositorio, aunque no se especifica el consumo exacto de memoria.
- Opciones de despliegue: phoonnx (Python y OVOS) mediante `TTSModelManager`; el modelo se distribuye en formato ONNX, por lo que puede ejecutarse con runtimes ONNX estándar.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Tamano | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-sl_si-cv-graphemes | Esloveno (sl-SI) | VITS (ONNX) | 0,1 GB (repo) | BSD-3-Clause | no aplica | Hugging Face (Phoonnx) |
| Coqui TTS `tts_models--sl--cv--vits` | Esloveno (sl-SI) | VITS | no disponible | BSD-3-Clause | no aplica | GitHub releases de Coqui TTS |
| Otros modelos VITS de la colección Phoonnx | Varios idiomas | VITS (ONNX) | variable | según modelo | no aplica | Hugging Face (colección VITS de Phoonnx) |

El modelo es esencialmente el mismo que el original de Coqui TTS para esloveno, reempaquetado en ONNX para phoonnx; la comparativa con otras alternativas de TTS para esloveno (por ejemplo, sistemas comerciales o modelos multilingües de mayor tamaño) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre Common Voice, puede heredar sesgos de representación de hablantes del corpus (edad, género, acento).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el modelo puede producir pronunciaciones incorrectas o artefactos en palabras fuera del dominio de entrenamiento.
- Limitaciones de idioma: solo esloveno (sl-SI); no se documenta soporte para otros idiomas ni para mezcla de idiomas.
- Limitaciones de contexto: la entrada es texto por frase basado en grafemas; no se documenta manejo de textos largos ni de contextos extensos.
- Restricciones de licencia: BSD-3-Clause permite uso comercial con atribución y sin endoso; conviene revisar las condiciones del corpus Common Voice subyacente.
- Caveats para producción: no se publican métricas de calidad (MOS), latencia ni throughput; el número de descargas es muy bajo (18) y no hay likes, lo que sugiere poca validación comunitaria. La fecha de creación indicada (2026) debe tratarse con cautela.
- Dependencia de phoonnx y scriptconv para el front-end de grafemas; cambios en estas librerías pueden afectar al comportamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-sl_si-cv-graphemes
- Upstream Coqui TTS (modelo original): https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--sl--cv--vits.zip
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio Coqui TTS: https://github.com/coqui-ai/TTS
