# prakharkhatri/dvitts

## Resumen

DviTTS es un modelo de síntesis de voz (text-to-speech) zero-shot desarrollado por prakharkhatri que cubre inglés y seis lenguas indias: hindi, maratí, bengalí, panyabí, guyaratí y odia. El modelo parte de Fun-CosyVoice3-0.5B-2512 de FunAudioLLM (Alibaba), un modelo de lenguaje de 0,5 mil millones de parámetros capaz de generar habla, que el autor ha reentrenado para emitir identificadores del códec IndiCodec y para pronunciar las seis lenguas indias adicionales. El resultado es un sistema que, con solo 3 a 10 segundos de audio de referencia y su transcripción, reproduce texto nuevo con la voz de esa persona, o bien utiliza uno de los 18 perfiles de voz predefinidos.

La relevancia del modelo radica en su cobertura lingüística: la mayoría de sistemas TTS de calidad se centran en inglés y unas pocas lenguas europeas, mientras que DviTTS aborda lenguas indias con millones de hablantes y escasa representación en herramientas de síntesis de voz. Además, el autor publica una variante ligera, DviTTS-Nano (110M + flow de un paso en ONNX), que funciona en CPU de móvil o portátil sin PyTorch, lo que facilita el despliegue en entornos con recursos limitados.

El modelo principal combina una etapa 1 de 0,5B parámetros (el modelo de lenguaje reentrenado), un módulo flow de 130M parámetros y un decodificador IndiCodec. El repositorio ocupa 1,3 GB y los pesos están en formato safetensors. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje (etapa 1) + módulo flow + decodificador de códec neuronal (IndiCodec) |
| Parámetros totales | 506.148.480 (etapa 1: 0,5B; flow: 130M; decodificador: no disponible) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors; el paquete instala PyTorch y descarga pesos completos) |
| Idiomas soportados | Inglés (en), hindi (hi), maratí (mr), bengalí (bn), panyabí (pa), guyaratí (gu), odia (or) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

DviTTS se construye sobre Fun-CosyVoice3-0.5B-2512, un modelo de lenguaje de 0,5B parámetros que genera representaciones de habla. El autor lo reentrena para que emita identificadores de IndiCodec, un códec neuronal desarrollado por el mismo autor, y para que cubra las seis lenguas indias además del inglés. La arquitectura completa consta de tres componentes: la etapa 1 (modelo de lenguaje reentrenado), un módulo flow de 130M parámetros que transforma las representaciones latentes en mel-espectrogramas o características acústicas, y un decodificador IndiCodec que convierte esas características en audio波形. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal es el reentrenamiento del modelo base para producir tokens de un códec específico (IndiCodec) y la extensión a lenguas indias, manteniendo la capacidad de clonación zero-shot con solo 3-10 segundos de audio de referencia. El modelo incluye marcas de agua de AudioSeal en todas las salidas, lo que permite identificar audio generado. La variante Nano utiliza un flow de un solo paso y se exporta a ONNX para ejecución en CPU sin PyTorch, lo que reduce los requisitos de hardware a costa de limitar la clonación (solo voces predefinidas).

## Capacidades

- Síntesis de voz zero-shot para inglés y seis lenguas indias (hindi, maratí, bengalí, panyabí, guyaratí, odia).
- Clonación de voz a partir de 3-10 segundos de audio de referencia y su transcripción exacta.
- Selección entre 18 voces predefinidas con nombres (por ejemplo, "ananya").
- Generación de audio con marca de agua AudioSeal incorporada.
- Soporte de mezcla de idiomas: se puede usar una referencia en un idioma (por ejemplo, hindi) para leer texto en otro (por ejemplo, inglés), como se muestra en los ejemplos de la model card.
- Interfaz de línea de comandos (`dvitts`) y API de Python (`DviTTS.from_pretrained`, `tts.say`).
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso ni visión; el modelo es exclusivamente TTS.

## Casos de uso

- **Atención al cliente automatizada en lenguas indias**: el modelo puede generar respuestas de voz en hindi, maratí, bengalí, etc., a partir de texto, utilizando una voz corporativa predefinida o clonando la voz de un agente concreto con una muestra corta. Es adecuado para sistemas de IVR y asistentes telefónicos que necesitan cubrir varias lenguas indias con una sola infraestructura.
- **Locución y doblaje de contenido educativo**: con 3-10 segundos de audio de un locutor, se puede generar narración para cursos, audiolibros o materiales de e-learning en cualquiera de los siete idiomas soportados, manteniendo la identidad vocal del hablante original.
- **Accesibilidad y lectura de textos**: integración en aplicaciones de lectura en voz alta para personas con discapacidad visual, con soporte para inglés e idiomas indios y la posibilidad de elegir entre 18 voces o clonar la voz del usuario.
- **Generación de voces para asistentes de voz embebidos**: la variante DviTTS-Nano (110M, ONNX) permite ejecutar TTS en CPU de móviles o portátiles sin GPU ni PyTorch, lo que la hace adecuada para aplicaciones Android o dispositivos de bajo consumo que necesiten síntesis de voz en inglés o lenguas indias.
- **Prototipado rápido de interfaces de voz**: gracias a la instalación vía `pip` y a la CLI (`dvitts "texto" --voice ananya -o salida.wav`), un desarrollador puede generar muestras de audio en minutos para validar un producto o una demo sin entrenar un modelo propio.
- **Investigación en clonación de voz y evaluación de TTS multilingüe**: el modelo sirve como línea base para experimentos de clonación zero-shot en lenguas indias, con la ventaja de que las salidas llevan marca de agua AudioSeal, lo que facilita la trazabilidad en estudios de detección de audio sintético.
- **Localización de contenidos multimedia**: doblaje de vídeos o pódcasts del inglés a lenguas indias (o viceversa) manteniendo la voz del hablante original, usando una referencia de audio y el texto traducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente indica que el modelo principal se ejecuta en una GPU CUDA y que en una A10G funciona a 0,37x tiempo real (es decir, genera audio a aproximadamente 0,37 veces la velocidad de reproducción en tiempo real). No se proporcionan métricas objetivas como MOS, WER ni comparaciones con otros sistemas TTS.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita. El modelo principal (0,5B etapa 1 + 130M flow + decodificador) requiere una GPU CUDA; el repo pesa 1,3 GB en safetensors, por lo que la VRAM necesaria para inferencia en precisión completa probablemente ronde los 2-4 GB, aunque no se confirma en la documentación.
- **GPU recomendadas**: el autor cita una A10G (0,37x tiempo real) y una RTX 3050 de portátil para generar las muestras. No se mencionan A100, H100 ni RTX 4090, pero al ser un modelo de 0,5B es probable que quepa en cualquier GPU consumer con suficiente VRAM.
- **Consumer GPU**: sí, cabe en GPUs de portátil como la RTX 3050 según las pruebas del autor. La variante Nano está diseñada para CPU de móvil o portátil sin GPU.
- **Opciones de despliegue**: el paquete oficial se instala vía `pip` desde GitHub (`git+https://github.com/codeprakhar25/dvitts@v1.0.0`) y requiere Python 3.10+ y PyTorch 2.6-2.8. La variante Nano se distribuye en ONNX y tiene una app Android y código en GitHub. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo TTS de este tipo).
- **Latencia y throughput**: en A10G, 0,37x tiempo real (el modelo tarda aproximadamente 2,7 segundos en generar 1 segundo de audio). No se proporcionan datos para otras GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Clonación zero-shot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DviTTS (este) | 0,5B + 130M flow + códec | en, hi, mr, bn, pa, gu, or | Sí (3-10 s) | Apache 2.0 | Hugging Face, pip |
| Fun-CosyVoice3-0.5B-2512 (base) | 0,5B | No disponible en la información | No disponible en la información | Apache 2.0 | Hugging Face |
| DviTTS-Nano | 110M + flow 1 paso | en, hi, mr, bn, pa, gu, or (18 voces predefinidas) | No (solo voces predefinidas) | Apache 2.0 | Hugging Face, ONNX, app Android |

No se dispone de información sobre otros modelos TTS comparables (como XTTS, Bark, VITS o sistemas comerciales) en la documentación proporcionada, por lo que no se puede establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- **Sesgos**: no se documentan sesgos específicos, pero al ser un modelo entrenado con datos de habla (probablemente de corpus como LibriTTS-R y FLEURS), puede reflejar sesgos de género, acento o registro presentes en esos datos.
- **Riesgo de alucinación**: en TTS, el riesgo se traduce en pronunciación incorrecta, omisión o repetición de palabras, especialmente en textos largos o con nombres propios; no se proporcionan métricas de fidelidad.
- **Limitaciones de contexto e idioma**: solo cubre siete idiomas (inglés y seis lenguas indias); no soporta otras lenguas. No se especifica la longitud máxima de texto de entrada.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, modificación y redistribución, pero se debe conservar el aviso de licencia. Las salidas llevan marca de agua AudioSeal, lo que puede ser relevante para aplicaciones que requieran audio sin marcas.
- **Requisitos de hardware**: el modelo principal requiere GPU CUDA y PyTorch 2.6-2.8; en Windows es necesario instalar primero la build CUDA de PyTorch. La RTX 50-series no ha sido probada según la model card.
- **Clonación de voz**: la clonación zero-shot con 3-10 segundos de audio puede fallar si la referencia tiene ruido, música o una transcripción incorrecta; la calidad depende de la coincidencia entre el audio y su transcripción.
- **Madurez**: el repositorio tiene 30 descargas y 0 likes en el momento de la consulta, lo que sugiere un proyecto reciente y con poca validación comunitaria.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/prakharkhatri/dvitts)
- [Modelo base Fun-CosyVoice3-0.5B-2512](https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512)
- [Códec IndiCodec](https://huggingface.co/prakharkhatri/IndiCodec)
- [DviTTS-Nano en Hugging Face](https://huggingface.co/prakharkhatri/dvitts-nano)
- [Repositorio GitHub de DviTTS](https://github.com/codeprakhar25/dvitts)
- [Repositorio GitHub de DviTTS-Nano (app Android)](https://github.com/codeprakhar25/dvitts-nano)
- [Demo en Hugging Face Spaces](https://huggingface.co/spaces/prakharkhatri/DviTTS-demo)
- [Artículo arXiv 2505.17589](https://arxiv.org/abs/2505.17589)
