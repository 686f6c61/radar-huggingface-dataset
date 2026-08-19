# netease-youdao/Confucius4-TTS

## Resumen

Confucius4-TTS es un sistema de síntesis de voz (text-to-speech, TTS) basado en modelos de lenguaje de gran tamaño (LLM), desarrollado por netease-youdao. Su objetivo principal es la síntesis de voz multilingüe y translingüística con clonación de voz en modo zero-shot, es decir, sin necesidad de entrenamiento adicional para imitar una voz nueva. El modelo combina un codificador de voz con un LLM para generar audio de alta calidad preservando la identidad del hablante a través de distintos idiomas.

El sistema soporta 14 idiomas (chino, inglés, japonés, coreano, alemán, francés, español, indonesio, italiano, tailandés, portugués, ruso, malayo y vietnamita) y permite transferencia de voz entre idiomas sin acento, así como transferencia de emociones. Su arquitectura se divide en dos módulos: Text2Semantic (T2S), que genera secuencias de tokens semánticos a partir de texto y condiciones del hablante, y Semantic2Acoustic (S2A), un modelo de flow-matching que convierte esos tokens en espectrogramas mel. El repositorio tiene un tamaño de 3,1 GB y se distribuye bajo licencia Apache 2.0.

La relevancia actual de Confucius4-TTS radica en su capacidad para abordar la clonación de voz sin restricciones (sin transcripción de referencia) y su robustez en escenarios multilingües reales, lo que lo posiciona como una alternativa open source competitiva frente a sistemas propietarios de síntesis de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de voz + LLM (T2S) + flow-matching (S2A) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en, ja, ko, de, fr, id, vi, th, es, pt, it, ru, ms (14 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (t2s_model.safetensors, s2a_model.pt) |

## Arquitectura y entrenamiento

Confucius4-TTS sigue una arquitectura de dos etapas. La primera, Text2Semantic (T2S), es un LLM que genera secuencias de tokens semánticos a partir del texto de entrada y de una condición del hablante. La segunda, Semantic2Acoustic (S2A), es un modelo de flow-matching que convierte los tokens semánticos en espectrogramas mel, que posteriormente se convierten en audio mediante un vocoder. El sistema utiliza dos codificadores externos: Wav2Vec2-BERT para la extracción de características semánticas y la condición del hablante, y CAMPPlus como codificador de estilo. Durante el entrenamiento de S2A, tanto el modelo T2S como los codificadores de hablante y estilo permanecen congelados; solo se entrena el modelo de flow-matching.

El entrenamiento se divide en dos fases: primero se entrena T2S para predecir tokens semánticos, y después se entrena S2A para reconstruir el espectrograma a partir de dichos tokens. Los datos de entrenamiento se proporcionan en archivos TSV con cinco columnas: idioma, ruta del audio, texto normalizado, ruta de los tokens semánticos y, presumiblemente, la ruta del audio de referencia. No se especifica el número total de tokens de entrenamiento ni la composición detallada del dataset en la información disponible.

## Capacidades

- Síntesis de voz multilingüe en 14 idiomas: chino, inglés, japonés, coreano, alemán, francés, español, indonesio, italiano, tailandés, portugués, ruso, malayo y vietnamita.
- Clonación de voz zero-shot: es posible imitar una voz a partir de un audio de referencia sin necesidad de transcripción del mismo ni entrenamiento adicional.
- Transferencia de voz translingüística: la misma voz puede hablar en cualquiera de los 14 idiomas soportados sin acento perceptible.
- Transferencia de emociones: el modelo no solo clona el timbre de la voz, sino también la emoción y el estilo expresivo del audio de referencia.
- Generación de voz sin restricciones de texto: no requiere transcripción del audio de referencia, lo que simplifica el flujo de trabajo.
- Robustez en escenarios multilingües reales: el modelo mantiene un rendimiento estable incluso cuando el hablante de referencia y el texto de salida están en idiomas distintos.

## Casos de uso

- Localización de contenido audiovisual: doblaje de vídeos, series o películas manteniendo la voz del actor original en múltiples idiomas, sin necesidad de regrabar con actores locales. El modelo permite transferir la voz de un idioma a otro conservando la identidad y el tono.
- Audiolibros multilingües: generación de versiones en varios idiomas de un mismo audiolibro con la misma voz narradora, reduciendo costes de producción y manteniendo coherencia de marca.
- Asistentes de voz personalizados: creación de voces personalizadas para asistentes virtuales o chatbots que respondan en el idioma del usuario, manteniendo una identidad de voz consistente en todos los idiomas.
- Accesibilidad y comunicación aumentativa: generación de voz para personas con discapacidad del habla, permitiendo que utilicen su propia voz (grabada previamente) en cualquier idioma, lo que facilita la comunicación en contextos internacionales.
- Videojuegos y mundos virtuales: dotar de voz a personajes no jugables (NPC) con una voz consistente en las distintas versiones localizadas del juego, mejorando la inmersión sin duplicar el trabajo de doblaje.
- Educación y e-learning: creación de contenido educativo multilingüe con la misma voz instructora, facilitando la producción de cursos en varios idiomas con una experiencia de usuario uniforme.
- Marketing y publicidad: generación de anuncios o mensajes promocionales en distintos mercados con la misma voz de marca, manteniendo la identidad sonora de la empresa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación menciona que el modelo alcanza resultados competitivos en benchmarks de TTS zero-shot multilingüe y translingüístico, con buena inteligibilidad y similitud de hablante, pero no se proporcionan cifras concretas de métricas como WER, CER o SIM. Se recomienda consultar el paper de arXiv (2608.11650) para obtener datos detallados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Dado el tamaño del repositorio (3,1 GB) y la arquitectura de dos etapas, se estima que se necesita al menos 8-12 GB de VRAM para la inferencia en FP16, pero este dato no está confirmado.
- GPU recomendadas: el modelo requiere CUDA 12.6 y Python 3.10. Se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A100) para un rendimiento óptimo, aunque podría ejecutarse en GPUs con menos memoria si se aplican técnicas de cuantización o se reduce la resolución.
- Compatibilidad con GPUs de consumo: probablemente sí, en GPUs como la RTX 3090 o RTX 4090, pero no está confirmado oficialmente.
- Opciones de despliegue: el repositorio proporciona un script de ejemplo (`example.py`) y una API Python. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que es un modelo de TTS y no un LLM de texto.
- Latencia y throughput: no disponible. La latencia dependerá de la GPU utilizada y de la longitud del texto a sintetizar.

## Comparativa con modelos similares

| Modelo | Idiomas | Clonación zero-shot | Translingüístico | Licencia | Tamaño |
|---|---|---|---|---|---|
| Confucius4-TTS | 14 | Sí | Sí | Apache 2.0 | 3,1 GB |
| XTTS (Coqui) | 17 | Sí | Sí | CPML (no comercial) | ~1,8 GB |
| Bark (Suno) | 13 | Parcial | Parcial | MIT | ~1,2 GB |
| MaskGCT (Amphion) | no disponible | no disponible | no disponible | MIT | no disponible |

Nota: los datos de XTTS, Bark y MaskGCT son aproximados y provienen de información pública general, no de la documentación de Confucius4-TTS. La comparativa se basa en características generales conocidas de estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de voz, puede presentar sesgos en función de los acentos, dialectos o características demográficas de los datos de entrenamiento.
- Riesgo de alucinación: en TTS, el riesgo de alucinación se manifiesta como errores de pronunciación o entonación, especialmente en idiomas poco representados en el entrenamiento o en textos con nombres propios o términos técnicos.
- Limitaciones de contexto: no se especifica la longitud máxima de texto que puede procesar el modelo. Es probable que textos muy largos deban dividirse en fragmentos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright y se indiquen los cambios realizados.
- Dependencias externas: el modelo requiere modelos externos (Wav2Vec2-BERT y CAMPPlus) y el repositorio de Amphion para el codec semántico, lo que añade complejidad al despliegue.
- Calidad de la voz clonada: la calidad de la clonación depende en gran medida de la calidad y duración del audio de referencia. Audios cortos o con ruido pueden degradar el resultado.
- Rendimiento en producción: no se proporcionan datos de latencia ni throughput, por lo que es necesario realizar pruebas de carga antes de desplegar en entornos de producción.

## Enlaces

- HuggingFace: https://huggingface.co/netease-youdao/Confucius4-TTS
- GitHub (código): https://github.com/netease-youdao/Confucius4-TTS
- Paper arXiv: https://arxiv.org/abs/2608.11650
- Demo online: https://confucius4-tts.youdao.com/gradio
- Página de demostración: https://2901733926.github.io/Confucius4-TTS/
- ModelScope: https://modelscope.cn/models/netease-youdao/Confucius4-TTS
