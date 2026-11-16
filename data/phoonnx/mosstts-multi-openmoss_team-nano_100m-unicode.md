# Phoonnx/mosstts-multi-openmoss_team-nano_100m-unicode

## Resumen

MOSS-TTS-Nano-100M es un modelo de síntesis de voz (text-to-speech) desarrollado por OpenMOSS, empaquetado en formato ONNX por el usuario Phoonnx para su uso con la librería `phoonnx`, una biblioteca de TTS basada en ONNX orientada al ecosistema OVOS. Se trata de un modelo compacto de aproximadamente 100 millones de parámetros que cubre 19 idiomas, entre ellos el castellano, y que se distribuye bajo licencia Apache 2.0.

El modelo resuelve el problema de la síntesis de voz multilingüe en entornos con recursos limitados: al ser un modelo de 100M de parámetros convertido a ONNX, está pensado para ejecutarse en CPU o en GPUs de gama baja, lo que lo hace adecuado para asistentes de voz locales, dispositivos embebidos y despliegues en el borde. Su integración con `phoonnx` y `scriptconv` permite normalizar el texto y convertirlo en la entrada del modelo mediante una fonemización basada en puntos de código Unicode.

La relevancia actual del modelo radica en su combinación de tamaño reducido, cobertura multilingüe amplia (19 idiomas) y licencia permisiva, lo que facilita su adopción en proyectos de código abierto que necesitan TTS sin depender de servicios en la nube. No obstante, la información pública disponible es escasa: no se detallan la arquitectura interna, los datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MOSS-TTS (familia de modelos TTS de OpenMOSS) |
| Parametros totales | ~100M (según el nombre del modelo: Nano-100M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (distribución en ONNX) |
| Idiomas soportados | ar, cs, da, de, el, en, es, fa, fr, hu, it, ja, ko, pl, pt, ru, sv, tr, zh (19 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | Puntos de código Unicode del texto |
| Tamano del repo | 0.8 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de que pertenece a la familia MOSS-TTS de OpenMOSS. El nombre "Nano-100M" indica un tamaño de aproximadamente 100 millones de parámetros, lo que sitúa al modelo en la categoría de TTS ligero. El modelo se distribuye como conversión ONNX del modelo original `OpenMOSS-Team/MOSS-TTS-Nano-100M`, empaquetado específicamente para la librería `phoonnx`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. El front-end de texto utiliza `scriptconv`, que normaliza el texto y lo convierte en puntos de código Unicode mediante el `UnicodeCodepointPhonemizer`; no se especifica si el modelo emplea fonemas, caracteres o alguna otra representación intermedia. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz multilingüe en 19 idiomas: árabe, checo, danés, alemán, griego, inglés, español, persa, francés, húngaro, italiano, japonés, coreano, polaco, portugués, ruso, sueco, turco y chino.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de `phoonnx`.
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Normalización y conversión de texto mediante `scriptconv` (fonemización basada en puntos de código Unicode).
- Ejecución local en formato ONNX, sin dependencia de servicios en la nube.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz locales: el modelo puede integrarse en OVOS mediante `ovos-tts-plugin-phoonnx` para sintetizar respuestas habladas en 19 idiomas, con ejecución en el propio dispositivo gracias a su tamaño de 100M de parámetros y su formato ONNX.
- Dispositivos embebidos y de borde: al ser un modelo compacto en ONNX, es adecuado para Raspberry Pi, routers o altavoces inteligentes que necesitan TTS sin conexión a internet.
- Lectura de notificaciones y alertas: en sistemas domóticos o de monitorización, el modelo puede convertir mensajes de texto en audio en el idioma configurado por el usuario, con latencia baja al ejecutarse en CPU.
- Accesibilidad: aplicaciones de lectura de pantalla o asistencia para personas con discapacidad visual pueden emplear el modelo para leer texto en voz alta en castellano y otros idiomas europeos.
- Prototipado rápido de aplicaciones de voz: gracias a la instalación mediante `pip install --pre phoonnx` y a la API de `TTSModelManager`, un desarrollador puede generar audio en pocas líneas de código para validar una idea.
- Sistemas de anuncios públicos multilingües: aeropuertos, estaciones o comercios pueden generar anuncios pregrabados en varios idiomas con un único modelo, reduciendo la necesidad de grabaciones humanas.
- Investigación en TTS ligero: el modelo sirve como línea base para experimentos de síntesis de voz de bajo coste computacional y para comparar con otros modelos de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~100M de parámetros y pesos en ONNX (repo de 0.8 GB), la inferencia puede ejecutarse en CPU con unos pocos cientos de MB de RAM.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 1-2 GB de memoria sería suficiente, incluidas GTX 1050, RTX 3050 o superiores.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna e incluso en iGPU.
- Opciones de despliegue: `phoonnx` (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS; el modelo se distribuye en ONNX, por lo que puede ejecutarse con ONNX Runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| MOSS-TTS-Nano-100M (este) | ~100M | 19 | no disponible | Apache 2.0 | ONNX |
| Piper TTS | no disponible | decenas | no aplica | MIT | ONNX |
| Coqui TTS (XTTS) | no disponible | 17 | no aplica | MPL 2.0 / CPML | varios |
| VITS (modelos comunitarios) | variable | variable | no aplica | variable | varios |

La comparación se basa en características generales de la categoría (TTS ligero multilingüe); no se dispone de datos de rendimiento comparativos publicados para este modelo concreto.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo; al ser un TTS entrenado con datos no documentados, puede reproducir sesgos de pronunciación o entonación según el idioma y el hablante.
- Riesgo de alucinación no aplica en el sentido habitual de generación de texto, pero pueden producirse artefactos de audio, pronunciaciones incorrectas o fallos en palabras fuera del vocabulario de entrenamiento.
- La cobertura de 19 idiomas no garantiza la misma calidad en todos ellos; no se documenta el rendimiento por idioma.
- No se especifican limitaciones de longitud de texto de entrada; el uso con textos muy largos puede requerir segmentación manual.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream (`OpenMOSS-Team/MOSS-TTS-Nano-100M`) y de las dependencias (`phoonnx`, `scriptconv`).
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- La fecha de creación (2026-11-14) es posterior a la fecha actual, lo que sugiere que los metadatos pueden ser inconsistentes o que el modelo es muy reciente.
- No hay información sobre el proceso de conversión a ONNX ni sobre posibles pérdidas de calidad respecto al modelo original.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/mosstts-multi-openmoss_team-nano_100m-unicode)
- [Modelo upstream OpenMOSS-Team/MOSS-TTS-Nano-100M](https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano-100M)
- [Conversión ONNX OpenMOSS-Team/MOSS-TTS-Nano-100M-ONNX](https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano-100M-ONNX)
- [Colección MOSS-TTS en phoonnx](https://huggingface.co/collections/Phoonnx/moss-tts-6af8ecba663438f590ae4f4e)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
