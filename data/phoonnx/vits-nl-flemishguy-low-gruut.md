# Phoonnx/vits-nl-flemishguy-low-gruut

## Resumen

vits-nl-flemishguy-low-gruut es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su proyecto Mimic3 y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo genera audio a partir de texto en neerlandés (`nl`) y está pensado para integrarse en asistentes de voz y sistemas de lectura en tiempo real, incluyendo el ecosistema OVOS (Open Voice OS).

La variante "low" hace referencia a un modelo compacto de baja carga computacional, lo que lo hace apto para despliegues en hardware modesto, incluidos dispositivos de borde. La entrada de texto se procesa mediante el fonemizador Gruut (alfabeto IPA), y el modelo se distribuye como un artefacto ONNX de aproximadamente 0,1 GB.

El modelo no está orientado a tareas de lenguaje general (razonamiento, código, visión), sino exclusivamente a la conversión de texto a voz. Su relevancia actual radica en la disponibilidad de un motor TTS ligero, multilingüe por diseño (aunque esta variante es solo neerlandesa) y con licencia CC-BY-SA-4.0, que permite su integración en proyectos de código abierto y comerciales bajo las condiciones de dicha licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantización | no disponible (distribución en ONNX; el modelo "low" sugiere un tamaño reducido) |
| Idiomas soportados | neerlandés (`nl`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX (modelo empaquetado para la librería `phoonnx`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema end-to-end de síntesis de voz que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado con objetivos de reconstrucción y adversariales. VITS genera audio de forma directa desde la secuencia de fonemas sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue.

La entrada de texto se convierte a fonemas IPA mediante el fonemizador Gruut (`GruutPhonemizer` de `scriptconv.phonemizers.mul`), que normaliza el texto y lo transforma en la representación fonética esperada por el modelo. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos no están publicados en la información disponible. La variante "low" indica un modelo de menor tamaño o capacidad, orientado a eficiencia más que a máxima calidad.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en neerlandés, con salida en formato WAV.
- Conversión de texto a fonemas IPA mediante Gruut, con normalización de texto previa.
- Integración con la librería `phoonnx` para Python y con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en formato ONNX, lo que permite despliegue en entornos con runtime ONNX (CPU y GPU).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales (visión, audio de entrada).
- Capacidad multilingüe limitada a un único idioma: neerlandés.

## Casos de uso

- Asistentes de voz en neerlandés: el modelo puede integrarse en OVOS o en cualquier aplicación Python que use `phoonnx` para leer respuestas del asistente en voz alta, gracias a su bajo peso y a la integración directa con el plugin de OVOS.
- Lectura de notificaciones y alertas en sistemas domóticos: al ser un modelo "low" y ejecutarse en ONNX, puede desplegarse en dispositivos de borde (Raspberry Pi, mini-PC) para anunciar eventos sin depender de la nube.
- Accesibilidad y lectores de pantalla: conversión de texto a voz para usuarios con discapacidad visual en aplicaciones neerlandesas, con la ventaja de una licencia permisiva para modificaciones (CC-BY-SA-4.0).
- Generación de audio para contenidos educativos o de formación: narración de material didáctico en neerlandés en pipelines automatizados, donde la latencia baja de VITS y el formato ONNX facilitan el procesamiento por lotes.
- Pruebas y prototipado de sistemas TTS: investigadores que necesiten un modelo de referencia ligero en neerlandés para comparar con otros motores o para validar pipelines de fonemización con Gruut.
- Integración en aplicaciones de atención al cliente con respuesta por voz: lectura de respuestas generadas por un LLM en neerlandés, usando `phoonnx` como capa de síntesis dentro de un flujo conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el tamaño del repositorio es de aproximadamente 0,1 GB, lo que sugiere un modelo compacto que puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no se especifican; al ser un modelo ONNX de baja carga, cualquier GPU con soporte ONNX Runtime (o incluso CPU) es suficiente.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en cualquier GPU de consumo moderna e incluso en hardware integrado, dado el tamaño reducido del artefacto.
- Opciones de despliegue: `phoonnx` (Python), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp ni TGI, que no aplican a modelos TTS de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Tamaño | Licencia | Formato |
|---|---|---|---|---|---|
| vits-nl-flemishguy-low-gruut (este modelo) | VITS | nl | ~0,1 GB (repo) | CC-BY-SA-4.0 | ONNX |
| Otros modelos VITS de la colección Phoonnx | VITS | variable | no disponible | variable | ONNX |
| Modelos Mimic3 originales (Mycroft AI) | VITS | múltiples | variable | variable | varios |

No se dispone de datos de rendimiento comparativo (MOS, latencia) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en TTS: no realiza razonamiento, generación de texto, código ni tareas multimodales.
- Idioma limitado al neerlandés; no soporta otros idiomas.
- La licencia CC-BY-SA-4.0 exige atribución y compartir bajo la misma licencia las obras derivadas, lo que puede condicionar su uso comercial si se modifican los pesos o el modelo.
- La variante "low" prioriza eficiencia sobre calidad; la naturalidad y prosodia pueden ser inferiores a modelos de mayor tamaño.
- No se dispone de información sobre sesgos en el dataset de entrenamiento ni sobre el riesgo de artefactos o alucinaciones acústicas (pronunciaciones incorrectas).
- Dependencia de la cadena `phoonnx` + `scriptconv[gruut]`; la compatibilidad con otras herramientas TTS no está garantizada.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que limita la evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-nl-flemishguy-low-gruut
- Upstream (Mycroft AI, mimic3-voices): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/nl/flemishguy_low
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
