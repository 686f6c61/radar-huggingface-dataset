# hexgrad/Kokoro-82M

## Resumen

Kokoro es un modelo de síntesis de voz (text-to-speech) de código abierto con 82 millones de parámetros, desarrollado por el autor hexgrad y entrenado por @rzvzn. Su arquitectura se basa en StyleTTS 2 (arxiv:2306.07691) con el decodificador ISTFTNet (arxiv:2203.02395), y está diseñado para ofrecer una calidad de voz comparable a modelos mucho más grandes, pero con una eficiencia computacional y un coste de despliegue significativamente menores. El modelo se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones, y ha sido entrenado exclusivamente con audio de dominio público o con licencias permisivas, incluyendo audio sintético generado por modelos propietarios.

Su relevancia actual radica en que democratiza la síntesis de voz de alta calidad: con solo 82 millones de parámetros, puede ejecutarse en hardware modesto, incluso en CPU, y su coste de inferencia es inferior a un dólar por millón de caracteres de entrada (menos de 0,06 dólares por hora de audio). La versión v1.0, publicada en enero de 2025, soporta 8 idiomas y 54 voces distintas, y el modelo ha sido adoptado en numerosos proyectos y APIs comerciales. Su entrenamiento costó aproximadamente 1000 dólares en 1000 horas de GPU A100 80GB, lo que demuestra su eficiencia en el uso de recursos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 (decoder-only) + ISTFTNet |
| Parametros totales | 82 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS, no procesa texto largo como contexto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 8 idiomas en v1.0 (según tabla de releases: 8 idiomas, 54 voces) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (se distribuye a través del paquete `kokoro` de PyPI, que carga los pesos en PyTorch) |

## Arquitectura y entrenamiento

Kokoro utiliza la arquitectura StyleTTS 2, que combina un codificador de estilo con un decodificador basado en ISTFTNet. El modelo es exclusivamente decodificador (no incluye difusión ni codificador separado), lo que reduce la complejidad y el coste computacional. El entrenamiento se realizó con un conjunto de datos de audio permisivo o no sujeto a derechos de autor, junto con etiquetas fonéticas IPA. Se utilizaron aproximadamente unas pocas cientos de horas de audio para la versión v1.0 (menos de 100 horas para la v0.19). El coste total de entrenamiento fue de unos 1000 dólares, empleando 1000 horas de GPU A100 80GB. No se menciona el uso de RLHF ni DPO; el entrenamiento se centra en la síntesis de voz a partir de texto fonético.

Una innovación destacable es el uso de la librería `misaki` para la conversión de grafema a fonema (G2P), que permite un control preciso de la pronunciación mediante notación IPA. Además, el modelo admite la generación de audio a 24 kHz de frecuencia de muestreo.

## Capacidades

- Generación de voz natural y expresiva a partir de texto, con soporte para múltiples idiomas (8 en v1.0) y 54 voces predefinidas.
- Control fonético fino mediante notación IPA, lo que permite ajustar la pronunciación de palabras específicas o nombres propios.
- Síntesis de voz de alta calidad con baja latencia, adecuada para aplicaciones en tiempo real.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso, ya que es un modelo puramente de síntesis de voz.
- Soporte para generación de audio a 24 kHz, con posibilidad de integración en pipelines de audio mediante el paquete `kokoro` de Python.
- Compatible con entornos de producción gracias a su licencia Apache 2.0 y su eficiencia computacional.

## Casos de uso

- Atención al cliente automatizada: Kokoro puede generar respuestas de voz naturales en sistemas IVR o chatbots telefónicos, reduciendo costes frente a soluciones propietarias. Su bajo coste por carácter lo hace viable para volúmenes altos de interacciones.
- Audiolibros y contenido narrado: permite convertir libros electrónicos o artículos en audio con voces variadas, ideal para plataformas de distribución de contenido.
- Asistentes de voz en dispositivos edge: al ser un modelo ligero (82M parámetros), puede ejecutarse en Raspberry Pi o dispositivos móviles para asistentes personales sin depender de la nube.
- Doblaje y localización de vídeo: con soporte para 8 idiomas, puede generar pistas de voz para vídeos, tutoriales o presentaciones, reduciendo el coste de producción.
- Accesibilidad: facilita la lectura de textos para personas con discapacidad visual o dificultades de lectura, integrándose en aplicaciones de lectura en voz alta.
- Prototipado rápido de productos de voz: los desarrolladores pueden generar muestras de voz para pruebas de concepto sin necesidad de estudios de grabación, gracias a la facilidad de uso del paquete `kokoro` y su integración con Colab.
- Generación de contenido educativo: creación de lecciones de audio, podcasts o material de aprendizaje en múltiples idiomas con voces consistentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye un archivo EVAL.md que podría contener métricas, pero no se proporcionan datos concretos en la documentación consultada. Se recomienda consultar dicho archivo para obtener evaluaciones detalladas.

## Requisitos de hardware

- Al ser un modelo de solo 82 millones de parámetros, la VRAM necesaria para inferencia es muy reducida. No se especifica un valor exacto, pero se puede ejecutar en GPU con menos de 2 GB de VRAM, e incluso en CPU con un rendimiento aceptable.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, o GPUs de centros de datos como A100 (aunque no son necesarias).
- Es viable en hardware de consumo: una Raspberry Pi 4 o 5 puede ejecutar el modelo, aunque con mayor latencia.
- Opciones de despliegue: el paquete `kokoro` de PyPI permite integración directa en Python. También se puede servir mediante APIs como Replicate o DeepInfra, que ofrecen el modelo a precios muy bajos.
- Latencia y throughput: no se proporcionan datos exactos, pero al ser un modelo pequeño, la generación de audio es considerablemente más rápida que modelos de mayor tamaño. En la práctica, puede generar un minuto de audio en menos de un segundo en una GPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Kokoro se basa en StyleTTS 2, pero no se ofrecen comparativas directas con otros modelos TTS como VITS, Tacotron o Bark. Se puede señalar que, por su tamaño, compite con modelos como StyleTTS2 (que tiene más parámetros) o modelos ligeros como FastSpeech2, pero no hay datos objetivos para una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está entrenado con audio permisivo, lo que puede limitar la diversidad de voces y acentos en comparación con modelos entrenados con datos más amplios.
- Puede presentar errores de pronunciación en palabras poco comunes o nombres propios, aunque el uso de notación IPA mitiga este problema.
- Solo soporta 8 idiomas en la versión v1.0; la cobertura multilingüe es limitada frente a modelos como VITS o Bark que soportan más idiomas.
- No se han publicado resultados de benchmarks formales, por lo que la calidad objetiva no está documentada en la información disponible.
- Existen sitios web fraudulentos que usan el nombre "Kokoro" sin afiliación con el proyecto. Se recomienda verificar siempre la autenticidad de los enlaces y usar únicamente los canales oficiales (GitHub y HuggingFace).
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir adecuadamente si se redistribuye el modelo o sus derivados.

## Enlaces

- [HuggingFace - Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M)
- [GitHub - kokoro](https://github.com/hexgrad/kokoro)
- [Demo en HuggingFace Spaces](https://hf.co/spaces/hexgrad/Kokoro-TTS)
- [Paper StyleTTS 2](https://arxiv.org/abs/2306.07691)
- [Paper ISTFTNet](https://arxiv.org/abs/2203.02395)
- [Documentación de voces (VOICES.md)](https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md)
- [Evaluación (EVAL.md)](https://huggingface.co/hexgrad/Kokoro-82M/blob/main/EVAL.md)
- [Muestras de audio (SAMPLES.md)](https://huggingface.co/hexgrad/Kokoro-82M/blob/main/SAMPLES.md)
