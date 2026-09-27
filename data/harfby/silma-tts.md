# harfby/silma-tts

## Resumen

SILMA TTS v1 es un modelo de síntesis de voz (text-to-speech) bilingüe árabe-inglés de 150 millones de parámetros desarrollado por SILMA AI. Está construido sobre la arquitectura de difusión de F5-TTS y fue preentrenado desde cero con decenas de miles de horas de datos de audio públicos y propietarios. Su objetivo es ofrecer síntesis de voz de alta fidelidad con clonación de voz instantánea a partir de menos de 8 segundos de audio de referencia, en un paquete lo bastante ligero para ejecutarse en entornos con pocos recursos.

La relevancia del modelo radica en dos factores: por un lado, cubre el árabe fusha/MSA con soporte completo de diacritización (Tashkeel), un caso tradicionalmente mal atendido por los modelos TTS abiertos centrados en inglés; por otro, se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. El autor declara un RTF de aproximadamente 0,12 sobre una RTX 4090, lo que lo sitúa en el rango de aplicaciones en tiempo real.

El repositorio analizado aquí (`harfby/silma-tts`) parece una réplica del repositorio oficial `silma-ai/silma-tts`: comparte model card, licencia y pesos, pero aparece publicado bajo una cuenta distinta, sin descargas ni interacciones. Conviene verificar la procedencia antes de usarlo en producción y, en su caso, descargar los pesos desde el repositorio oficial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión, basada en F5-TTS v1 (compatible con F5-TTS v1.1.7) |
| Parametros totales | 150 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo TTS). La clonación de voz usa menos de 8 segundos de audio de referencia; no se documenta límite de longitud del texto de entrada |
| Tipos de cuantizacion | No disponible (los pesos se publican como checkpoint PyTorch en precisión completa) |
| Idiomas soportados | Inglés (en) y árabe (ar), con árabe fusha/MSA y soporte de diacríticos (Tashkeel) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt`), acompañado de `config.yaml`, `vocab.txt` y `finetune_cli.py` |
| Tamaño del repositorio | 2,6 GB |
| Latencia declarada | RTF aproximado de 0,12 en RTX 4090 |
| Normalización de texto | NeMo Text Processing |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de difusión de F5-TTS, un esquema de generación de espectrogramas mediante un transformer de difusión condicionado por texto y por un audio de referencia. SILMA TTS v1 es plenamente compatible con F5-TTS v1.1.7: el autor publica un `config.yaml`, un vocabulario y un script de fine-tuning parcheado (`finetune_cli.py`) que sobrescriben la configuración base de F5-TTS, de modo que se puede reutilizar todo el ecosistema de entrenamiento e inferencia de ese proyecto sustituyendo únicamente los pesos.

El preentrenamiento se realizó desde cero con decenas de miles de horas de datos de audio de alta calidad, combinando fuentes públicas y propietarias. No se especifican en la información disponible el número exacto de horas, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO (no aplicables habitualmente en TTS, donde el ajuste se hace por fine-tuning supervisado). La model card tampoco detalla innovaciones arquitectónicas propias más allá de los pesos preentrenados y el soporte de diacritización árabe.

## Capacidades

- Síntesis de voz bilingüe árabe-inglés de forma nativa, con fluidez declarada a nivel nativo en árabe fusha/MSA.
- Clonación de voz instantánea ("zero-shot") a partir de menos de 8 segundos de audio de referencia.
- Soporte completo de diacritización árabe (Tashkeel), lo que permite controlar la pronunciación y desambiguar contexto; también acepta texto árabe sin diacríticos.
- Normalización de texto integrada mediante NeMo Text Processing.
- Generación de audio de alta fidelidad exportable a WAV, con control de semilla (`seed`) y velocidad (`speed`).
- Transcripción automática del audio de referencia si no se proporciona el texto correspondiente (`ref_text=None`).
- Compatibilidad con el pipeline de entrenamiento y fine-tuning de F5-TTS v1.1.7.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no aplica (modelo TTS).
- Capacidades de visión o audio de entrada más allá de la referencia de voz: no disponible.

## Casos de uso

- Asistentes de voz y agentes conversacionales: el modelo puede generar respuestas habladas en árabe e inglés con una latencia declarada de RTF 0,12 sobre RTX 4090, lo que permite integrarlo en bucles de conversación en tiempo real.
- Audiolibros y narración larga: la clonación de voz con menos de 8 segundos de referencia permite mantener un timbre consistente a lo largo de capítulos completos, alternando contenido en árabe y en inglés.
- Localización y doblaje de contenido audiovisual: se puede clonar la voz del locutor original y sintetizar la versión en otro idioma preservando las características vocales.
- Atención al cliente automatizada: útiles para mercados de habla árabe, donde la cobertura de TTS abierto es escasa; el soporte de Tashkeel reduce errores de pronunciación en nombres propios y tecnicismos.
- Accesibilidad: lectura en voz alta de documentos, artículos o interfaces para usuarios con discapacidad visual, con salida en árabe MSA correctamente vocalizado.
- Enseñanza de árabe: generación de ejemplos de pronunciación con diacríticos completos para materiales didácticos y aplicaciones de aprendizaje de idiomas.
- Generación de datos sintéticos de voz: creación de corpus de audio etiquetado en árabe para entrenar modelos ASR o de clasificación de audio.
- Integración en pipelines de producción: al publicarse bajo Apache 2.0 y distribuirse como paquete `pip install silma-tts` con app Gradio incluida, puede desplegarse como microservicio interno sin restricciones de licencia comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente declara una tasa de tiempo real (RTF) de aproximadamente 0,12 sobre una GPU RTX 4090, sin comparativas objetivas de calidad (MOS, CMOS, WER) frente a otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,6 GB para los pesos en FP32 y unos 0,3 GB en FP16, a lo que hay que sumar buffers de activaciones y el vocoder; en la práctica se espera un consumo total en el rango de 2-4 GB (estimación derivada del tamaño de parámetros, no dato publicado por el autor).
- GPU recomendadas: RTX 4090 (única GPU con RTF medido y publicado), aunque por tamaño el modelo debería funcionar en GPUs mucho más modestas.
- Cabe en GPU de consumo: sí, con 150M de parámetros es viable en tarjetas como RTX 3060, RTX 4060, RTX 3090 o superiores. El rendimiento en GPUs de gama baja no está documentado.
- Despliegue: la vía oficial es la librería propia `silma-tts` (instalable vía `pip` o desde código fuente) y la app Gradio integrada (`silma-tts-app`, puerto 7860). Para fine-tuning se utiliza F5-TTS v1.1.7 con el `config.yaml`, el `vocab.txt` y el script parcheado del repositorio.
- vLLM, TGI y llama.cpp: no se documenta soporte para esta arquitectura en la información disponible.
- Latencia y throughput: RTF aproximado de 0,12 en RTX 4090; no se publican cifras para CPU ni para otras GPUs.
- Requisito de sistema: `ffmpeg` instalado para el procesado de audio.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| SILMA TTS v1 | 150M | Árabe (fusha/MSA) e inglés | Apache 2.0 | Clonación de voz con <8 s; soporte de Tashkeel; RTF 0,12 en RTX 4090 |
| F5-TTS v1 (base) | ~336M | Inglés y chino | MIT | Arquitectura en la que se basa SILMA TTS; no cubre árabe de forma nativa |
| XTTS v2 (Coqui) | ~467M | Multilingüe (más de una decena de idiomas) | Coqui Public Model License (no comercial) | Clonación de voz con unos 6 s de referencia; licencia restrictiva para uso comercial |
| Kokoro-82M | 82M | Principalmente inglés, con soporte multilingüe variable por versión | Apache 2.0 | Muy ligero y con licencia permisiva, pero sin cobertura nativa de árabe con diacritización |

Los datos de los modelos comparados proceden de su documentación pública y no han sido verificados en la información proporcionada para este análisis. La ventaja diferencial de SILMA TTS v1 es la combinación de soporte nativo de árabe con Tashkeel, licencia Apache 2.0 y un tamaño reducido.

## Limitaciones y advertencias

- El repositorio analizado (`harfby/silma-tts`) no es el oficial: el proyecto original se publica bajo la organización `silma-ai`. El repositorio evaluado presenta 0 descargas y 0 "likes", y sus metadatos indican una fecha de creación de 2026-09-27. Se recomienda verificar la integridad de los pesos y descargarlos preferiblemente desde el repositorio oficial.
- No se han publicado benchmarks objetivos de calidad (MOS, CMOS, WER) ni comparativas con otros sistemas, por lo que las afirmaciones de "alta fidelidad" no son verificables con datos independientes.
- Cobertura de idiomas limitada al árabe fusha/MSA y al inglés. No se documenta soporte para dialectos árabes regionales, lo que puede ser un problema en aplicaciones dirigidas a mercados como el egipcio, el del Golfo o el magrebí.
- Riesgo de artefactos y errores de pronunciación en textos con números, símbolos, nombres propios o mezcla de idiomas dentro de la misma frase; parte de este riesgo se mitiga con la normalización de NeMo, pero no se documenta su alcance exacto.
- La clonación de voz instantánea plantea riesgos claros de suplantación de identidad y generación de deepfakes. Es imprescindible obtener consentimiento explícito de la persona cuya voz se clona y cumplir la normativa aplicable.
- Aunque la licencia es Apache 2.0, el modelo fue preentrenado con datos que incluyen fuentes propietarias; la información disponible no detalla la procedencia ni las condiciones de uso de esos datos, lo que puede afectar a auditorías de cumplimiento en entornos corporativos.
- Dependencia de `ffmpeg` y de la librería propia para el procesado de audio; no se documenta compatibilidad con runtimes de inferencia estándar del ecosistema (vLLM, TGI, llama.cpp, Ollama).
- No se especifica la longitud máxima de texto que puede sintetizarse en una sola llamada, lo que obliga a trocear entradas largas sin garantía de consistencia prosódica entre fragmentos.

## Enlaces

- Repositorio evaluado en HuggingFace: https://huggingface.co/harfby/silma-tts
- Repositorio oficial en HuggingFace: https://huggingface.co/silma-ai/silma-tts
- Repositorio en GitHub: https://github.com/SILMA-AI/silma-tts
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/silma-ai/silma-tts-v1-demo
- Blog de presentación: https://huggingface.co/blog/silma-ai/opensource-arabic-english-text-to-speech-model
- Sitio web de SILMA AI: https://silma.ai/
- Modelos comerciales de SILMA AI: https://silma.ai/arabic-text-to-speech
- Productos de voz de SILMA AI: https://silma.ai/products
- Proyecto F5-TTS: https://github.com/SWivid/F5-TTS
- Release F5-TTS v1.1.7: https://github.com/SWivid/F5-TTS/releases/tag/1.1.7
- Guía de entrenamiento de F5-TTS: https://github.com/SWivid/F5-TTS/tree/main/src/f5_tts/train
