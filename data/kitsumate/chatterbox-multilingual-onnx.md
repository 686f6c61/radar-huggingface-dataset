# KitsuMate/chatterbox-multilingual-ONNX

## Resumen

Chatterbox Multilingual es un modelo de síntesis de voz (text-to-speech) de código abierto desarrollado por Resemble AI, convertido a formato ONNX por la comunidad ONNX Community y alojado en este repositorio como espejo por KitsuMate. Se trata de un sistema TTS multilingüe de grado de producción que soporta 23 idiomas de forma nativa, incluyendo español, inglés, francés, alemán, chino, japonés, árabe y muchos más. Su principal innovación es ser el primer modelo TTS de código abierto con control de exageración de emociones, lo que permite ajustar la expresividad de la voz generada. Además, incorpora clonación de voz zero-shot, salida con marca de agua opcional y una arquitectura basada en un backbone Llama de 0,5 mil millones de parámetros. El modelo está disponible en formato ONNX, lo que facilita su despliegue con ONNX Runtime en múltiples plataformas, y ha sido comparado favorablemente con sistemas propietarios como ElevenLabs en evaluaciones de preferencia humana.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Llama de 0,5B (modelo TTS autoregresivo) |
| Parametros totales | 0,5B (backbone Llama; no se especifica el total del modelo completo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (formato ONNX, sin cuantizacion especificada) |
| Idiomas soportados | Arabe, danes, aleman, griego, ingles, español, finlandes, frances, hebreo, hindi, italiano, japones, coreano, malayo, neerlandes, noruego, polaco, portugues, ruso, sueco, suajili, turco, chino (23 idiomas) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo utiliza un backbone de lenguaje Llama de 0,5 mil millones de parametros como base para la generacion de voz. Aunque no se detallan los componentes completos, se trata de un sistema TTS autoregresivo que probablemente combina un modelo de lenguaje para predecir tokens de voz con un vocoder para sintetizar la forma de onda final. El entrenamiento se realizó con 0,5 millones de horas de datos de audio limpios, lo que proporciona una base solida para la generacion de voz natural en multiples idiomas. No se menciona el uso de RLHF o DPO, pero sí se destaca una innovacion clave: el control de exageracion de emociones, que permite ajustar la intensidad expresiva de la voz generada mediante un parametro `exaggeration`. Ademas, el modelo incorpora una inferencia informada por alineacion para garantizar estabilidad en la salida, y ofrece la opcion de anadir marcas de agua al audio generado.

## Capacidades

- Sintesis de voz multilingue en 23 idiomas, incluyendo variantes regionales.
- Clonacion de voz zero-shot: puede imitar una voz a partir de una muestra corta sin entrenamiento adicional.
- Control de exageracion de emociones: parametro `exaggeration` que ajusta la expresividad (valores recomendados: 0,5 para uso general, 0,7 o mas para discurso dramatico).
- Conversion de voz: permite transformar una voz existente en otra mediante un script de onnxruntime.
- Salida con marca de agua opcional para trazabilidad.
- Inferencia rapida y portable gracias al formato ONNX con ONNX Runtime.
- Compatible con herramientas de procesamiento de audio como librosa y soundfile.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede generar respuestas de voz naturales en multiples idiomas para sistemas IVR o chatbots de voz, con control de tono y emocion para mejorar la experiencia del usuario.
- Doblaje de contenido audiovisual: permite doblar videos, series o podcasts a 23 idiomas con clonacion de voz para mantener la identidad del locutor original.
- Videojuegos: generacion de dialogos de personajes con control emocional, ideal para escenas dramaticas o conversaciones dinamicas.
- Asistentes de voz y agentes conversacionales: integracion en asistentes virtuales para producir respuestas habladas con naturalidad y expresividad ajustable.
- Audiolibros y narracion: creacion de audiolibros multilingue con voces consistentes y control de ritmo y emocion.
- Accesibilidad: lectura en voz alta de contenido textual para personas con discapacidad visual, con soporte multilingue y opcion de clonar la voz del usuario para una experiencia personalizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que Chatterbox supera a ElevenLabs en evaluaciones de preferencia humana, con un enlace a Podonos para consultar los detalles, pero no se incluyen cifras concretas en este repositorio.

## Requisitos de hardware

- Tamano del repositorio: 12,7 GB, lo que indica que el modelo requiere varios gigabytes de almacenamiento y memoria.
- Al estar en formato ONNX, puede ejecutarse en CPU con ONNX Runtime, aunque el rendimiento sera limitado.
- Para inferencia en tiempo real o con baja latencia, se recomienda una GPU con al menos 8 GB de VRAM (estimacion basada en el tamano del modelo; no se proporcionan requisitos oficiales).
- Opciones de despliegue: ONNX Runtime (Python, C++, etc.), compatible con servidores de inferencia como Triton o servicios en la nube.
- No se dispone de datos de latencia o throughput especificos.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Chatterbox Multilingual (este) | 0,5B backbone | 23 | MIT | ONNX | Control de emocion, clonacion zero-shot |
| ElevenLabs | No publico | Multiples | Propietario | API | Sistema comercial, no open source |
| Coqui TTS (XTTS) | ~1,6B | 17 | MPL-2.0 | PyTorch | Clonacion de voz, open source |
| Piper TTS | ~100M | 20+ | MIT | ONNX | Ligero, para edge, sin clonacion |

Nota: la comparativa se basa en informacion publica general; no se dispone de datos de rendimiento comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- No se especifican sesgos conocidos, pero al ser un modelo entrenado con datos de audio, puede reflejar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinacion: como todo modelo generativo, puede producir audio incorrecto o incoherente en ciertos contextos, especialmente con entradas ambiguas.
- Limitaciones de contexto: no se documenta la longitud maxima de texto que puede procesar de una vez; se recomienda probar con entradas cortas y dividir textos largos.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo es un espejo de un repositorio de la comunidad; se debe atribuir el trabajo original a Resemble AI y ONNX Community.
- Para chino y japones, se requieren dependencias adicionales (pkuseg y pykakasi) para la tokenizacion correcta.
- El control de exageracion puede acelerar el habla; se recomienda ajustar el parametro segun el caso de uso.

## Enlaces

- Repositorio HuggingFace (este): https://huggingface.co/KitsuMate/chatterbox-multilingual-ONNX
- Repositorio original ONNX Community: https://huggingface.co/onnx-community/chatterbox-multilingual-ONNX
- Pagina de demos: https://resemble-ai.github.io/chatterbox_demopage/
- Space de HuggingFace: https://huggingface.co/spaces/ResembleAI/Chatterbox
- Scripts de conversion e inferencia ONNX: https://github.com/VladOS95-cyber/onnx_conversion_scripts/tree/main/chatterbox
- Benchmark de Podonos: https://podonos.com/resembleai/chatterbox
