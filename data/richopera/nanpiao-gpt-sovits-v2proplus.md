# Richopera/nanpiao-gpt-sovits-v2proplus

## Resumen

Nanpiao GPT-SoVITS v2ProPlus es un modelo de síntesis de voz (text-to-speech) entrenado por Richopera mediante un ajuste fino de la arquitectura GPT-SoVITS v2ProPlus. Su objetivo es reproducir la voz del personaje Male Rover (男漂泊者) del videojuego *Wuthering Waves*, tal como suena en su doblaje chino original a cargo del actor de voz 马洋. No se trata de un modelo de lenguaje general, sino de un par de checkpoints (un módulo GPT y un módulo SoVITS) que se cargan conjuntamente en un entorno GPT-SoVITS para generar audio a partir de texto.

El modelo se apoya en el enfoque de clonación de voz few-shot de GPT-SoVITS: en inferencia se le proporciona un clip de referencia de 3 a 10 segundos junto con su transcripción exacta, y el sistema utiliza esa muestra para guiar el timbre y la dicción del audio generado. El entrenamiento se realizó con los ajustes por defecto de v2ProPlus sobre un corpus de 1.817 clips (96 minutos y 27 segundos) recopilados por jugadores, en una única sesión de unos 48 minutos sobre una GPU de portátil de 8 GB.

Es relevante en el nicho de la síntesis de voz de personajes y del doblaje aficionado, porque demuestra que con hardware de consumo moderado y un corpus relativamente pequeño se puede obtener un modelo de voz específico de personaje. Su licencia, sin embargo, restringe el uso a fines no comerciales y exige atribución, lo que limita su aplicabilidad en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-SoVITS v2ProPlus (dos componentes: módulo GPT autorregresivo y módulo SoVITS de síntesis de voz) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la referencia de audio recomendada es de 3 a 10 segundos) |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints en formato nativo de PyTorch) |
| Idiomas soportados | chino (zh); hereda la capacidad de síntesis multilingüe nativa de GPT-SoVITS en inferencia |
| Licencia | Richopera Voice Model License v2.0 (uso personal no comercial; redistribución de pesos requiere permiso escrito) |
| Formato de pesos | checkpoints `.ckpt` (GPT) y `.pth` (SoVITS) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-SoVITS, que combina un módulo GPT de modelado de secuencias con un módulo SoVITS de síntesis de voz basado en representaciones latentes. La variante v2ProPlus es la versión de referencia empleada tanto para el ajuste fino como para la inferencia. El paquete consta de dos checkpoints que deben cargarse juntos: `男漂泊者pro-e15.ckpt` (GPT, unos 148 MiB) y `男漂泊者pro_e8_s3416.pth` (SoVITS, unos 165 MiB). El repositorio completo ocupa aproximadamente 0,8 GB.

El entrenamiento utilizó los ajustes por defecto de GPT-SoVITS v2ProPlus. El módulo GPT se entrenó durante 15 épocas y el módulo SoVITS durante 8 épocas, alcanzando el paso 3.416. El conjunto de datos estaba compuesto por 1.817 clips de audio de alta calidad recopilados por jugadores, con una duración total de 96 minutos y 27,451 segundos. La sesión de entrenamiento se ejecutó el 21 de septiembre de 2026, de 09:38 a 10:26 (unos 48 minutos), en un equipo con CPU Intel Core Ultra 9 275HX a 2,70 GHz, 32 GB de RAM y una GPU NVIDIA GeForce RTX 5070 Laptop de 8 GB. No se documentan detalles sobre el corpus de preentrenamiento del modelo base ni sobre técnicas de alineación como RLHF o DPO.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) en chino.
- Clonación de voz few-shot: utiliza un clip de referencia de 3 a 10 segundos y su transcripción exacta para guiar el timbre y la dicción.
- Reproducción del timbre del personaje Male Rover tal como suena en el doblaje chino de *Wuthering Waves*.
- Capacidad de síntesis entre idiomas heredada de GPT-SoVITS: se pueden seleccionar idiomas distintos para la transcripción de referencia y para el texto objetivo.
- Soporte de clips de referencia auxiliares para reforzar el timbre y la entrega.
- No dispone de tool calling, function calling, razonamiento multi-paso ni modo de pensamiento; no es un modelo de lenguaje.
- No dispone de capacidades de visión ni de audio de entrada más allá del clip de referencia.

## Casos de uso

- Doblaje aficionado de contenido de *Wuthering Waves*: el modelo permite generar líneas de diálogo del personaje Male Rover a partir de texto, usando un clip de referencia limpio del personaje para mantener el timbre. Es adecuado por su ajuste específico al personaje y su licencia no comercial, que encaja con la publicación de contenido fan.
- Creación de vídeos y mods de la comunidad: se puede integrar en flujos de edición para producir voces del personaje en escenas nuevas, siempre que se atribuya al actor de voz y al entrenador del modelo según exige la licencia.
- Audiolibros o narraciones no comerciales con voz de personaje: el modelo puede generar pasajes largos a partir de texto, encadenando fragmentos y manteniendo una referencia de 3 a 10 segundos para conservar la coherencia tímbrica.
- Prototipado de experiencias interactivas: en entornos de demostración o investigación se puede usar para dar voz a un personaje en un chatbot o en una instalación interactiva, con la limitación de que el uso debe ser no comercial.
- Pruebas de doblaje y comparación de interpretaciones: los creadores pueden generar varias versiones de una misma línea con distintas referencias auxiliares para evaluar entonación y entrega antes de grabar con el actor real.
- Investigación sobre clonación de voz few-shot: el par de checkpoints sirve como ejemplo reproducible de ajuste fino de GPT-SoVITS v2ProPlus con un corpus pequeño, útil para estudiar el efecto del tamaño y la calidad del conjunto de datos en la fidelidad del timbre.
- Generación de material para fan fiction sonora: se pueden producir diálogos cortos para piezas de audio fan, respetando la atribución obligatoria y la restricción de redistribución de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento se completó con una GPU de 8 GB, lo que sugiere que la inferencia cabe en GPUs de consumo con 8 GB o más.
- GPU recomendadas: no hay recomendaciones oficiales; por el perfil de entrenamiento, una RTX 5070 Laptop de 8 GB fue suficiente para el ajuste fino, y se espera que GPUs de consumo similares o superiores (por ejemplo, RTX 3060 de 12 GB, RTX 4070, RTX 4090) puedan ejecutar la inferencia.
- Cabe en GPU de consumo: sí, según el hardware de entrenamiento documentado (RTX 5070 Laptop de 8 GB).
- Opciones de despliegue: WebUI de GPT-SoVITS que soporte checkpoints v2ProPlus; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nanpiao GPT-SoVITS v2ProPlus (este modelo) | TTS few-shot sobre GPT-SoVITS v2ProPlus | no disponible | no disponible (referencia de 3-10 s) | zh (multilingüe heredado) | Richopera Voice Model License v2.0 (no comercial) | Hugging Face, 0 descargas |
| GPT-SoVITS v2ProPlus (modelo base, lj1995/GPT-SoVITS-windows-package) | TTS few-shot | no disponible | no disponible | multilingüe | según proyecto GPT-SoVITS | GitHub y paquete de Windows |
| Otros ajustes de voz de personaje sobre GPT-SoVITS | TTS few-shot | no disponible | no disponible | variable | variable, a menudo no comercial | Hugging Face y comunidades de doblaje |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: la Richopera Voice Model License v2.0 solo permite uso personal no comercial y publicación no comercial del audio generado con atribución; la redistribución de pesos originales o derivados requiere permiso escrito previo.
- La licencia no otorga derechos sobre las grabaciones originales, la imagen del personaje ni la interpretación del actor de voz; el modelo es no oficial y no está afiliado a Kuro Games ni al actor.
- Riesgo de alucinación y artefactos: como todo sistema TTS, puede producir pronunciaciones incorrectas, entonación inestable o artefactos en textos largos o con caracteres poco frecuentes.
- Dependencia de la referencia: la calidad del audio generado depende en gran medida de la limpieza y duración del clip de referencia (3 a 10 segundos, sin música, reverberación ni múltiples hablantes); frases completas dan resultados más estables que frases cortas.
- Compatibilidad estricta: los checkpoints solo funcionan en entornos GPT-SoVITS que soporten v2ProPlus y no deben mezclarse con checkpoints de otras versiones.
- Cobertura lingüística: el entrenamiento se realizó sobre voz en chino; el rendimiento en otros idiomas depende de la capacidad heredada del modelo base y no está documentado.
- Sesgos: no se documentan sesgos específicos, pero al estar entrenado sobre un único hablante y un corpus de fans, puede reproducir particularidades del material de origen y no generaliza a otros timbres.
- Advertencia de uso responsable: la clonación de voz puede emplearse para suplantación; la licencia y la atribución obligatoria buscan mitigarlo, pero no existe una verificación técnica integrada.
- Sin ejemplos de audio publicados ni métricas de calidad objetivas, lo que dificulta evaluar el modelo antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Richopera/nanpiao-gpt-sovits-v2proplus
- Proyecto GPT-SoVITS: https://github.com/RVC-Boss/GPT-SoVITS
- Guía en chino de GPT-SoVITS: https://www.yuque.com/baicaigongchang1145haoyuangong/ib3g1e
- Modelo base: https://huggingface.co/lj1995/GPT-SoVITS-windows-package
- Sitio oficial de *Wuthering Waves*: https://wutheringwaves.kurogames.com/en/main/
- Perfil de 花儿不哭 en Bilibili: https://space.bilibili.com/5760446
- Perfil de 马洋 en Bilibili: https://space.bilibili.com/29043144
- Licencia (inglés): LICENSE_en.md (en el repositorio de Hugging Face)
- Licencia (chino): LICENSE.md (en el repositorio de Hugging Face)
- Contacto: richopera@outlook.com
