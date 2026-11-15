# Phoonnx/matcha-cat-multispeaker-acoustic

## Resumen

`Phoonnx/matcha-cat-multispeaker-acoustic` es un modelo acústico de síntesis de voz (text-to-speech) para catalán, publicado por Phoonnx como extracción de un subdirectorio del repositorio agregador `Phoonnx/phoonnx-matcha`. Se trata de la primera etapa de una arquitectura de TTS en dos fases: este modelo acústico transforma la representación fonética (generada mediante eSpeak en catalán) en características acústicas intermedias, que después deben convertirse en audio mediante un vocoder externo del ecosistema phoonnx (`phoonnx-vocoders`).

El modelo está empaquetado en formato ONNX para su uso con la librería `phoonnx` (implementación en Rust/Python orientada a inferencia ligera) y deriva del proyecto original `projecte-aina/matxa-tts-cat-multispeaker`, desarrollado en el marco del Projecte AINA (Barcelona Supercomputing Center) para dotar al catalán de voces neuronales multihablante. La arquitectura subyacente es Matcha-TTS, un modelo de síntesis basado en flow matching condicionado por texto fonetizado, que permite generación de habla de calidad razonable con un coste computacional muy inferior al de los modelos autorregresivos o de difusión clásicos.

Su relevancia actual es fundamentalmente práctica: al estar distribuido como ONNX y con identificadores de voz ya registrados en OpenVoiceOS, está pensado para despliegue en entornos de recursos limitados (asistentes domésticos, Raspberry Pi, sistemas embebidos) dentro del stack de asistentes de voz open source. El repositorio es muy pequeño (0,1 GB) y no registra descargas ni interacciones en el momento de la consulta, lo que indica un artefacto de nicho orientado a integradores del ecosistema más que a un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (modelo acústico basado en flow matching condicionado por fonemas; primera etapa de un pipeline TTS de dos fases) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; la longitud de entrada viene limitada por la secuencia fonética) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; se desconoce si existen variantes cuantizadas) |
| Idiomas soportados | catalán (`espeak ca` como frontend de fonetización) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Matcha-TTS, un sistema de síntesis neuronal no autorregresivo que emplea flow matching para modelar la distribución condicional de características acústicas dado un texto fonetizado. A diferencia de los TTS autorregresivos (Tacotron) o de los modelos de difusión con muchos pasos, Matcha-TTS utiliza una ODE con pocos pasos de integración, lo que reduce la latencia de inferencia de forma significativa. La entrada es una secuencia de fonemas producida por eSpeak en catalán; la salida son características acústicas intermedias que requieren un vocoder para convertirse en forma de onda.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de ajuste fino o RLHF (no aplicables en TTS en el sentido habitual). El modelo original del que deriva, `projecte-aina/matxa-tts-cat-multispeaker`, es un modelo multihablante entrenado por el Projecte AINA para catalán; esta publicación es una extracción de artefactos ONNX de ese proyecto, no un reentrenamiento. La innovación técnica destacable es precisamente el empaquetado en ONNX y la integración con el ecosistema phoonnx, que permite ejecutar el pipeline completo (fonetizador + acústico + vocoder) sin dependencias de PyTorch.

## Capacidades

- Síntesis de voz en catalán a partir de texto, mediante fonetización previa con eSpeak (`espeak ca`).
- Soporte multihablante: el nombre `multispeaker` indica que el modelo puede generar voces de distintos hablantes, aunque el número exacto de hablantes no está disponible en la información proporcionada.
- Pipeline de dos fases: este artefacto es solo la etapa acústica; requiere emparejarse con un vocoder del proyecto `phoonnx-vocoders` para producir audio.
- Integración con OpenVoiceOS mediante identificadores de voz predefinidos (`OpenVoiceOS/matxa-cat-multispeaker-vocos-2stage` y `OpenVoiceOS/matxa-cat-multispeaker-wavenext-2stage`).
- Ejecución ligera vía ONNX Runtime a través de la librería `phoonnx`.
- No soporta tool calling, agentes, visión, audio de entrada ni modos de razonamiento: es exclusivamente un modelo acústico de TTS.

## Casos de uso

- Asistentes de voz domésticos en catalán: integración en OpenVoiceOS o Mycroft mediante los voice IDs `matxa-cat-multispeaker-vocos-2stage` y `matxa-cat-multispeaker-wavenext-2stage`, permitiendo respuestas habladas en catalán con un pipeline completamente open source.
- Síntesis en dispositivos embebidos: al ser ONNX de 0,1 GB y con arquitectura Matcha-TTS de pocos pasos de integración, puede ejecutarse en Raspberry Pi o mini-PC sin GPU dedicada, algo inviable con modelos de difusión grandes.
- Accesibilidad para personas con discapacidad visual: lectura de contenido textual en catalán con voces multihablante, desplegable localmente sin depender de servicios en la nube.
- Generación de audiolibros o narración automatizada en catalán: el carácter multihablante permite alternar voces para distintos personajes o secciones.
- Locución de contenido editorial y avisos institucionales en catalán: útil para administraciones públicas que necesitan voces sintéticas en lengua cooficial sin licencias comerciales restrictivas más allá de la GPL-3.0.
- Integración en pipelines de CI/CD para pruebas de accesibilidad: verificación automatizada de que las interfaces producen audio comprensible en catalán antes de desplegar.
- Prototipado de aplicaciones de aprendizaje de idiomas: generación de pronunciaciones catalanas de referencia para materiales didácticos, combinando varias voces del modelo multihablante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y la naturaleza ONNX del artefacto, la huella de memoria es muy reducida, del orden de cientos de megabytes incluyendo el vocoder.
- GPU recomendadas: no disponibles en la información proporcionada. Dado el tamaño, cualquier GPU moderna (RTX 3060 en adelante) sería sobrada; el modelo está pensado para CPU.
- Cabe en GPU consumer: sí, con enorme margen; también en CPU y en dispositivos SBC tipo Raspberry Pi.
- Opciones de despliegue: librería `phoonnx` con ONNX Runtime; integración con OpenVoiceOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo acústico de TTS.
- Latencia y throughput: no disponibles. La arquitectura Matcha-TTS se caracteriza por pocos pasos de integración en la ODE, lo que típicamente se traduce en latencias bajas, pero no hay cifras publicadas para este artefacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/matcha-cat-multispeaker-acoustic | no disponible | secuencia fonética (longitud no especificada) | catalán | GPL-3.0 | ONNX en HF |
| projecte-aina/matxa-tts-cat-multispeaker (origen) | no disponible | secuencia fonética | catalán | no disponible en esta ficha | HF (proyecto AINA) |
| Piper (voces catalanas) | no disponible | secuencia fonética | múltiples, incl. catalán | MIT (motor) | ONNX, ampliamente desplegado |
| Coqui TTS (modelos multilingües) | no disponible | texto/fonemas | múltiples | MPL-2.0 (motor) | amplia comunidad |

La comparación detallada de rendimiento no está disponible por falta de benchmarks publicados. Frente a Piper, la diferencia principal es la licencia (GPL-3.0 frente a MIT del motor) y el ecosistema de integración (OpenVoiceOS frente a la comunidad Piper). Frente al modelo original de Projecte AINA, este artefacto es una extracción ONNX optimizada para inferencia ligera, no un modelo distinto en calidad.

## Limitaciones y advertencias

- Licencia GPL-3.0: su uso en productos propietarios o distribuidos sin código fuente puede quedar contaminado por obligaciones de copyleft; revisar con cuidado antes de integrar en software comercial cerrado.
- Es solo la etapa acústica: no genera audio por sí solo; requiere un vocoder compatible del ecosistema `phoonnx-vocoders`, lo que añade complejidad de integración.
- Idioma limitado al catalán: no se documentan otros idiomas; la fonetización depende de eSpeak `ca`, con posibles imprecisiones en préstamos, nombres propios o neologismos.
- Riesgo de artefactos acústicos y prosodia monótona inherente a los modelos Matcha-TTS, especialmente en frases largas o con puntuación compleja.
- Número de hablantes no documentado: la naturaleza multihablante está indicada en el nombre, pero no se especifica cuántas voces ni sus características (género, edad, acento).
- Repositorio con cero descargas y cero likes en el momento de la consulta: poca validación comunitaria, sin garantías de mantenimiento.
- Sin información sobre sesgos de hablante (posible subrepresentación de acentos regionales del catalán) ni sobre el dataset de entrenamiento original.
- No apto para clonación de voz ni para imitación de hablantes concretos más allá de las voces predefinidas del modelo.
- La licencia del vocoder emparejado puede diferir de la del modelo acústico; verificar ambos por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/matcha-cat-multispeaker-acoustic
- Repositorio agregador de origen: https://huggingface.co/Phoonnx/phoonnx-matcha
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Modelo original del Projecte AINA: https://huggingface.co/projecte-aina/matxa-tts-cat-multispeaker
- Voz OpenVoiceOS (vocos): https://huggingface.co/OpenVoiceOS/matxa-cat-multispeaker-vocos-2stage
- Voz OpenVoiceOS (wavenext): https://huggingface.co/OpenVoiceOS/matxa-cat-multispeaker-wavenext-2stage
