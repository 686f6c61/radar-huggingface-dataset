# rodrigomas/Kokoro-82M

## Resumen

Kokoro-82M es un modelo de síntesis de voz (text-to-speech) de pesos abiertos con 82 millones de parámetros, publicado por el usuario `rodrigomas` en Hugging Face como reupload del modelo original `hexgrad/Kokoro-82M`. El modelo deriva de la arquitectura StyleTTS 2 (Li et al., 2023) y se distribuye únicamente con el decodificador, sin difusión ni encoder, combinado con el vocoder ISTFTNet. Su etiqueta de pipeline es `text-to-speech` y su idioma declarado es el inglés.

La relevancia de Kokoro radica en su relación calidad/tamaño: con 82 millones de parámetros ofrece, según su model card, una calidad comparable a modelos bastante mayores, pero con un coste de inferencia muy inferior. La model card original cifra el coste de servicio por API en menos de 1 dólar por millón de caracteres de entrada (aproximadamente 0,06 dólares por hora de audio generado), con precios concretos de 0,65 dólares por millón de caracteres en Replicate y 0,80 dólares en DeepInfra a abril de 2025.

El repositorio analizado tiene 0 descargas y 0 "likes", un tamaño de 0,4 GB y fue creado el 25 de septiembre de 2026. La model card incluida corresponde a la del repositorio original de `hexgrad` (incluye el aviso sobre sitios web fraudulentos que usan el nombre Kokoro), por lo que conviene tratar este reupload como un espejo no verificado del modelo de referencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 con decodificador ISTFTNet; solo decodificador (sin difusión ni encoder) |
| Parametros totales | 82 millones |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | inglés (etiqueta de idioma `en`); la model card original indica "Multiple" y la tabla de releases de v1.0 menciona 8 idiomas y 54 voces |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible en la informacion proporcionada (tamaño del repositorio: 0,4 GB) |
| Modelo base | yl4579/StyleTTS2-LJSpeech |
| Pipeline | text-to-speech |
| SHA256 (modelo original) | 496dba118d1a58f5f3db2efc88dbdc216e0483fc89fe6e47ee1f2c53f18ad1e4 |
| Autor del repositorio | rodrigomas |
| Fecha de creacion / actualizacion | 2026-09-25 |

## Arquitectura y entrenamiento

Kokoro se construye sobre StyleTTS 2 (https://arxiv.org/abs/2306.07691) y el vocoder ISTFTNet (https://arxiv.org/abs/2203.02395), ambos arquitectados por Li et al. (`yl4579`). La release publicada es solo decodificador: no incluye difusión ni el encoder de estilo, lo que implica que no se puede hacer transferencia de estilo a partir de audio de referencia ni clonación de voz con los pesos distribuidos. El modelo fue entrenado por `@rzvzn` según la model card.

Los datos de entrenamiento son "unos pocos cientos de horas" de audio con etiquetas de fonemas IPA, restringidos a material permisivo o sin copyright: audio de dominio público, audio con licencias Apache o MIT, y audio sintético generado por modelos TTS cerrados de grandes proveedores. La model card excluye explícitamente el audio sintético procedente de modelos TTS abiertos y las "clonaciones de voz personalizadas". Entre los datos con licencia CC BY se citan Koniwa `tnc` (menos de 1 hora, CC BY 3.0) y SIWIS (menos de 11 horas, CC BY 4.0).

El historial de releases documentado es el siguiente: v0.19 (25 de diciembre de 2024) con menos de 100 horas de datos, 1 idioma y 10 voces; v1.0 (27 de enero de 2025) con unos pocos cientos de horas, 8 idiomas y 54 voces. El coste total de entrenamiento declarado es de 1000 horas de GPU A100 de 80 GB, con un coste aproximado de 1000 dólares (500 horas a 0,80 dólares/hora para v0.19 y 500 horas a 1,20 dólares/hora para v1.0). No se menciona RLHF ni DPO, algo esperable en un modelo TTS.

## Capacidades

- Síntesis de voz en inglés a 24 kHz de frecuencia de muestreo (el ejemplo oficial de uso escribe los audios a `rate=24000`).
- Selección de voz mediante identificadores como `af_heart`, con 54 voces documentadas para v1.0 en el repositorio original.
- Generación por segmentos: el pipeline `KPipeline` devuelve un iterador de tuplas (texto, fonemas, audio), lo que permite procesar textos largos troceados.
- Conversión grafema-fonema delegada a la librería `misaki`, con dependencia adicional de `espeak-ng` para el sistema de instalación.
- Generación de audio con prosodia basada en estilo, heredada de StyleTTS 2 en la fase de entrenamiento.
- Soporte de tool calling / function calling: no, no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no.
- Capacidades multilingües: limitadas; la etiqueta del repositorio declara solo inglés, aunque la model card original describe un modelo multilingüe con 8 idiomas.
- Capacidad especial: licencia Apache 2.0 que permite despliegue comercial sin restricciones de uso, algo poco habitual en TTS de calidad alta.

## Casos de uso

- Lectura por lotes de artículos y documentos: el pipeline devuelve audio por segmentos, de modo que se pueden encadenar fragmentos de texto largo y guardar cada uno como WAV a 24 kHz para generar una versión en audio de un blog o documentación técnica.
- Audiolibros y narración: con 54 voces disponibles se puede asignar una voz distinta por personaje o sección; el coste por hora de audio (en torno a 0,06 dólares por hora según los proveedores citados) hace viable producir horas de narración a bajo coste.
- Asistentes de voz en el dispositivo: con 82 millones de parámetros el modelo cabe en el ordenador de a bordo y puede ejecutarse en CPU, lo que permite asistentes sin conexión en aplicaciones móviles o dispositivos embebidos.
- Accesibilidad: lectores de pantalla y herramientas de apoyo para personas con dislexia o discapacidad visual, con despliegue local que evita enviar el texto del usuario a servicios externos.
- Formación electrónica y doblaje interno: generación de pistas de narración para cursos y vídeos corporativos, con la ventaja de que la licencia Apache 2.0 permite uso comercial sin las restricciones típicas de las licencias de pesos de otros TTS.
- Atención al cliente telefónica: síntesis de respuestas en sistemas IVR y agentes conversacionales, donde el audio de 24 kHz se puede remuestrear a 8 o 16 kHz para telefonía y el coste por millón de caracteres se mantiene por debajo del dólar.
- Generación de datos sintéticos para entrenar sistemas de reconocimiento de voz: la licencia permisiva reduce el riesgo legal de usar el audio generado como datos de entrenamiento.
- Prototipado rápido en cuadernos: el ejemplo oficial funciona en Google Colab con `pip install kokoro>=0.9.2` y `espeak-ng`, sin necesidad de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La información proporcionada incluye un enlace al documento `EVAL.md` del repositorio original y la mención de que el modelo fue añadido como contendiente en el TTS Spaces Arena, pero no se incluyen cifras concretas (MOS, WER de ASR sobre audio generado, similitud de hablante, etc.).

Los únicos datos cuantitativos de rendimiento económico presentes en la información son los siguientes, que no constituyen benchmarks de calidad:

| Dato | Valor |
|---|---|
| Precio de API en Replicate (abril de 2025) | 0,65 USD por millón de caracteres |
| Precio de API en DeepInfra (abril de 2025) | 0,80 USD por millón de caracteres |
| Relación caracteres/audio | 1000 caracteres equivalen aproximadamente a 1 minuto de audio |
| Coste por hora de audio generado | menos de 0,06 USD |
| Coste de entrenamiento v0.19 | 500 horas de A100 80 GB (~400 USD) |
| Coste de entrenamiento v1.0 | 500 horas de A100 80 GB (~600 USD) |
| Coste total de entrenamiento | 1000 horas de A100 80 GB (~1000 USD) |

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 82 M de parámetros): aproximadamente 0,33 GB en fp32, 0,17 GB en fp16 y 0,08 GB en int8, sin contar las activaciones ni las librerías. En la práctica, menos de 1 GB de memoria es suficiente.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente. Sobran tarjetas como RTX 3060, RTX 4090, T4, A100 o H100; estas últimas no aportan ventaja significativa por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos diez años. También es viable la inferencia solo en CPU, ya que el modelo es muy pequeño.
- Opciones de despliegue: paquete `kokoro` de Python (versión 0.9.2 o superior), librería G2P `misaki` y binario `espeak-ng` del sistema. Está desplegado en APIs comerciales como Replicate y DeepInfra, y existe un Space de demostración en `hf.co/spaces/hexgrad/Kokoro-TTS`.
- vLLM, llama.cpp, Ollama y TGI no aplican: no es un modelo de lenguaje basado en transformer de decodificación de tokens de texto.
- Latencia y throughput: no disponible en la información proporcionada. Como referencia indirecta, el coste declarado de 1000 caracteres por minuto de audio y menos de 0,06 USD por hora sugiere una inferencia muy rápida, pero no se aportan mediciones de latencia ni de factor de tiempo real en hardware concreto.

## Comparativa con modelos similares

Los datos de las alternativas no proceden de la información proporcionada y deben verificarse en sus repositorios antes de tomar decisiones de producción.

| Modelo | Parámetros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| Kokoro-82M (este repositorio) | 82 M | Inglés (etiqueta `en`); 8 idiomas y 54 voces en v1.0 según la model card original | Apache 2.0 | Solo decodificador, sin clonación de voz con los pesos distribuidos |
| hexgrad/Kokoro-82M (original) | 82 M | Igual que el anterior | Apache 2.0 | Repositorio de referencia, con descargas y adopción reales, documentación `EVAL.md`, `SAMPLES.md` y `VOICES.md` |
| yl4579/StyleTTS2-LJSpeech | no disponible | Inglés | no disponible | Modelo base declarado en las etiquetas; incluye encoder de estilo, a diferencia de la release de Kokoro |
| Coqui XTTS-v2 | no disponible | Multilingüe | no disponible (licencia con restricciones de uso comercial) | Permite clonación de voz; no es un modelo Apache |
| Piper | no disponible | Muchos idiomas | MIT | Orientado a CPU y dispositivos embebidos, con muchas voces, pero calidad y prosodia distintas |

## Limitaciones y advertencias

- Este repositorio es un reupload no oficial con 0 descargas y 0 "likes". La model card incluida es la del repositorio original `hexgrad/Kokoro-82M`, por lo que el contenido puede no corresponder exactamente a los pesos subidos.
- Existe una discrepancia entre las etiquetas del repositorio (que declaran `yl4579/StyleTTS2-LJSpeech` como modelo base) y la model card (que describe el entrenamiento completo de Kokoro v1.0 con varios cientos de horas de audio). Conviene verificar el hash SHA256 antes de usar los pesos en producción.
- La fecha de creación registrada es el 25 de septiembre de 2026, posterior a la fecha de consulta habitual, lo que sugiere metadatos poco fiables en la plataforma.
- Idioma: la etiqueta declara únicamente inglés. El uso multilingüe requiere las distribuciones específicas del proyecto original y no está garantizado en este repositorio.
- Riesgo de errores de pronunciación en nombres propios, siglas, números y palabras poco frecuentes, ya que la conversión grafema-fonema depende de `espeak-ng` y `misaki`.
- Posibles fallos de prosodia en textos muy largos; el pipeline trocea la entrada en segmentos y las transiciones entre fragmentos pueden notarse.
- No soporta clonación de voz ni transferencia de estilo a partir de audio de referencia: la release es solo decodificador y no incluye el encoder de estilo.
- No es un modelo de lenguaje: no realiza razonamiento, generación de texto, código ni tool calling.
- Riesgo de suplantación: la model card original advierte de sitios web fraudulentos que usan "kokoro" en su dominio (por ejemplo `kokorottsai_com` y `kokorotts_net`) y que no están afiliados al autor.
- Licencia: los pesos son Apache 2.0 y permiten uso comercial, pero parte de los datos de entrenamiento son CC BY 3.0 (Koniwa `tnc`, menos de 1 hora) y CC BY 4.0 (SIWIS, menos de 11 horas), lo que exige mantener la atribución correspondiente en la documentación del modelo derivado.
- No se han publicado en la información disponible mediciones de calidad objetivas (MOS, similitud de hablante, tasas de error), por lo que cualquier afirmación de calidad debe validarse con una evaluación propia.

## Enlaces

- Repositorio analizado en Hugging Face: https://huggingface.co/rodrigomas/Kokoro-82M
- Repositorio original del modelo: https://huggingface.co/hexgrad/Kokoro-82M
- Repositorio de código: https://github.com/hexgrad/kokoro
- Demostración en Hugging Face Spaces: https://hf.co/spaces/hexgrad/Kokoro-TTS
- Documento de evaluación del modelo original: https://huggingface.co/hexgrad/Kokoro-82M/blob/main/EVAL.md
- Muestras de audio: https://huggingface.co/hexgrad/Kokoro-82M/blob/main/SAMPLES.md
- Listado de voces: https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md
- Librería G2P Misaki: https://github.com/hexgrad/misaki
- Paper de StyleTTS 2: https://arxiv.org/abs/2306.07691
- Paper de ISTFTNet: https://arxiv.org/abs/2203.02395
- Repositorio de StyleTTS 2: https://github.com/yl4579/StyleTTS2
- Modelo base declarado en las etiquetas: https://huggingface.co/yl4579/StyleTTS2-LJSpeech
- Precios de referencia en Artificial Analysis: https://artificialanalysis.ai/text-to-speech/model-family/kokoro#price
- Servicio en DeepInfra: https://deepinfra.com/hexgrad/Kokoro-82M
- Servidor de Discord del proyecto: https://discord.gg/QuGxSWBfQy
- Datos Koniwa (CC BY 3.0): https://github.com/koniwa/koniwa
- Dataset SIWIS (CC BY 4.0): https://datashare.ed.ac.uk/handle/10283/2353
- Aviso sobre sitios fraudulentos (instantánea): https://archive.ph/nRRnk y https://archive.ph/60opa
- Guía de política de copyright y audio sintético: https://copyright.gov/ai/ai_policy_guidance.pdf
