# FireRedTeam/FireRedTTS3

## Resumen

FireRedTTS3 es un sistema unificado de generación y edición de voz desarrollado por FireRedTeam, el equipo de inteligencia artificial de Xiaohongshu. Se presenta en dos variantes: FireRedTTS3-Base, orientada a la clonación de voz zero-shot en 24 idiomas y 21 dialectos chinos, y FireRedTTS3-Instruct, que permite diseñar voces nuevas a partir de descripciones en lenguaje natural y editar el habla tanto a nivel semántico (inserción, borrado, sustitución) como acústico (velocidad, tono, volumen). El modelo se basa en representaciones continuas de voz enriquecidas semánticamente, lo que le permite unificar tareas que tradicionalmente requerían sistemas separados.

La relevancia actual del modelo radica en su enfoque unificado: un solo sistema cubre clonación multilingüe, diseño de voz por instrucciones y edición libre, con una licencia Apache-2.0 que facilita su adopción en entornos comerciales. El repositorio de Hugging Face tiene un tamaño de 20,8 GB y los pesos se distribuyen en formato safetensors. Aunque el informe técnico aún no se ha publicado, los resultados reportados por el autor indican un rendimiento competitivo en métricas de inteligibilidad y similitud de hablante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 24 idiomas (arabe, cantonés, chino, checo, neerlandés, inglés, finés, francés, alemán, griego, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, rumano, ruso, español, tailandés, turco, ucraniano, vietnamita) y 21 dialectos chinos (Anhui, Fujian, Gansu, Guizhou, Hebei, Henan, Hubei, Hunan, Jiangxi, Liaoning, Minnan, Ningxia, Shaanxi, Shandong, Shanghai, Shanxi, Sichuan, Tianjin, Wenzhou, Wu, Yunnan) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (por ejemplo, si se trata de un transformer, un modelo basado en difusión o una combinación de ambos). La model card únicamente menciona que se basa en "representaciones continuas de voz enriquecidas semánticamente" (semantically enriched continuous speech representations), lo que sugiere un enfoque de representación latente intermedia entre el texto y el audio. Tampoco se especifican los datos de entrenamiento, el número de tokens o el uso de técnicas como RLHF o DPO.

Como innovación técnica destacable, el modelo integra en una única arquitectura dos funcionalidades que normalmente requieren sistemas separados: la clonación de voz (con referencia de audio) y el diseño de voz por instrucciones (sin referencia). Además, la edición semántica y acústica se controla mediante instrucciones en lenguaje natural, lo que implica un componente de comprensión de instrucciones que guía el proceso de síntesis. El frontend de normalización de texto admite dos modos: uno local basado en weText (solo chino e inglés) y otro basado en un LLM externo (compatible con cualquier endpoint OpenAI) para cobertura completa de idiomas.

## Capacidades

- Generación de voz con clonación zero-shot en 24 idiomas y 21 dialectos chinos, usando un audio de referencia y su transcripción.
- Diseño de voz por instrucciones en lenguaje natural (género, edad, timbre, emoción, ritmo, acento) sin necesidad de audio de referencia, con un paso previo de planificación textual explícita.
- Edición de voz libre: inserción, borrado y sustitución de segmentos de habla (edición semántica) y ajuste de velocidad, tono y volumen (edición acústica), todo mediante instrucciones.
- Detección automática de idioma mediante el modelo FastText de Meta (opcional), si no se especifica la etiqueta de idioma.
- Normalización de texto (TN) para convertir números, fechas, unidades, monedas y acrónimos en su forma hablada, con soporte local para chino e inglés (weText) o mediante LLM para todos los idiomas.

## Casos de uso

- Doblaje de contenido audiovisual multilingüe: el modelo puede clonar la voz de un actor o locutor y generar diálogos en 24 idiomas manteniendo la identidad vocal, lo que reduce costes de producción en plataformas de streaming.
- Asistentes virtuales personalizados: permite crear voces únicas a partir de descripciones (por ejemplo, "voz femenina joven, enérgica y con acento neutro") sin necesidad de grabar a un locutor, ideal para marcas que quieren diferenciarse.
- Corrección de errores en podcasts y audiolibros: mediante la edición semántica, se pueden insertar o sustituir frases mal pronunciadas sin regrabar la sesión completa, ahorrando tiempo de estudio.
- Generación de audiolibros multilingües: la clonación zero-shot permite narrar un libro en varios idiomas con la misma voz, ampliando el alcance del mercado editorial.
- Accesibilidad y lectores de pantalla: se pueden diseñar voces naturales y agradables para personas con discapacidad visual, ajustando el tono y la velocidad según preferencias.
- Producción de contenido regional en dialectos chinos: el soporte de 21 dialectos permite crear voces locales para anuncios, noticias o entretenimiento dirigido a comunidades específicas, algo que los TTS comerciales suelen ignorar.

## Benchmarks y rendimiento

Según la model card, el autor reporta los siguientes resultados en conjuntos de evaluación estándar:

| Metrica | Valor |
|---|---|
| WER/CER promedio en MiniMax-MLS-Test | 3,754 % |
| Similitud de hablante promedio en MiniMax-MLS-Test | 84,8 % |
| WER/CER promedio en clonación (Seed-TTS-eval) | 3,04 % |
| Similitud de hablante promedio en clonación (Seed-TTS-eval) | 78,8 % |

Estos datos indican que FireRedTTS3 obtiene la mejor inteligibilidad (WER/CER) y la mejor similitud de hablante en comparación con otros sistemas evaluados en esos conjuntos, según afirma el autor. No se proporcionan resultados desglosados por idioma ni comparaciones numéricas con modelos concretos en la información disponible.

## Requisitos de hardware

- No se dispone de información oficial sobre requisitos de VRAM, GPU recomendadas o latencia de inferencia.
- El tamaño del repositorio es de 20,8 GB, lo que sugiere que los pesos del modelo ocupan varios gigabytes en precisión completa; con cuantización podría reducirse, pero no se documentan opciones de cuantización.
- Dado que se distribuye en safetensors y se ejecuta con PyTorch, es probable que requiera una GPU con al menos 16 GB de VRAM para inferencia en precisión FP16, aunque esto es una estimación no confirmada.
- Las opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) no son aplicables directamente, ya que se trata de un modelo de TTS con su propio pipeline de generación; el repositorio oficial proporciona un script de instalación y una API Python.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de TTS como Seed-TTS, MiniMax-MLS o CosyVoice en la información proporcionada. La model card menciona que FireRedTTS3 supera a los sistemas evaluados en MiniMax-MLS-Test y Seed-TTS-eval, pero no se especifican los nombres de los competidores ni sus resultados numéricos. Por tanto, no es posible elaborar una tabla comparativa fiable con los datos disponibles.

## Limitaciones y advertencias

- La clonación de voz conlleva riesgos de uso indebido (suplantación de identidad, fraude). El repositorio original de FireRedTTS advierte que esta capacidad es solo para fines de investigación académica y que no debe usarse para actividades ilegales; se recomienda aplicar medidas de control en despliegues comerciales.
- La normalización de texto local (weText) solo cubre chino e inglés. Para otros idiomas, es necesario configurar un LLM externo (por ejemplo, DeepSeek) con credenciales API, lo que añade dependencias y costes.
- La detección automática de idioma requiere descargar el modelo FastText de Meta; si no se instala, el usuario debe especificar manualmente la etiqueta de idioma para un rendimiento óptimo.
- No se han publicado detalles sobre posibles sesgos en la pronunciación de acentos o variedades dialectales, ni sobre la robustez frente a ruido o voces no nativas.
- El informe técnico aún no está disponible, por lo que la reproducibilidad de los resultados benchmark depende de la documentación futura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FireRedTeam/FireRedTTS3
- Repositorio de código en GitHub: https://github.com/FireRedTeam/FireRedTTS3
- Paper (arXiv): https://arxiv.org/abs/2502.03930
- Página del equipo FireRed: https://fireredteam.github.io/
- Repositorio de la versión anterior (FireRedTTS): https://github.com/FireRedTeam/FireRedTTS
