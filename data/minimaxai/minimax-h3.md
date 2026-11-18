# MiniMaxAI/MiniMax-H3

## Resumen

MiniMax H3 es un sistema generativo omnicanal desarrollado por MiniMax (MiniMaxAI) que unifica la comprensión de contextos multimodales compuestos por texto, imagen, vídeo y audio, y genera vídeo con audio estéreo nativo. El modelo acepta entradas de muy diversa naturaleza (texto, imágenes de referencia, clips de vídeo y pistas de audio) y produce vídeos de entre 4 y 15 segundos a 24 FPS, con resolución base de 768p en el lado corto y posibilidad de escalar a 2K mediante el módulo H3-Regenerate-2K. El sistema completo se compone de tres piezas: H3-Context-IR (interpretación y refinado de instrucciones multimodales), H3-Base (generación de audio y vídeo a 768p) y H3-Regenerate-2K (remuestreo a alta resolución).

El modelo se publica con pesos en formato safetensors y una librería propia (`minimax-h3`), con un total de 33.122.992.896 parámetros según los metadatos del repositorio, que ocupa 354,9 GB. La relevancia actual del modelo radica en su capacidad de generar audio y vídeo sincronizados de forma nativa (audio estéreo a 32 kHz) y en su soporte estable de diálogos en 11 idiomas, lo que lo sitúa en la categoría de modelos de generación audiovisual conjunta en lugar de vídeo mudo con audio postproducido.

La licencia es la MiniMax-H3 Community License Agreement, de tipo "other", por lo que las condiciones de uso comercial deben consultarse en el texto de la licencia antes de desplegar el modelo en producción. El repositorio acumula más de 5,7 millones de descargas y 7.058 likes, lo que refleja una adopción amplia desde su publicación en julio de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (sistema omnicanal de generación audiovisual; no se detalla la arquitectura interna en la información disponible) |
| Parametros totales | 33.122.992.896 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | sv, en, fr, de, es, nl (etiquetas del repositorio); diálogos estables en 11 idiomas: árabe, chino, inglés, francés, alemán, italiano, japonés, coreano, portugués, ruso y español |
| Licencia | minimax-h3-community-license-agreement (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible describe H3 como un sistema generativo omnicanal de propósito general, diseñado en torno a la generalización de tareas: ya en la fase de preentrenamiento el modelo adquiere capacidades amplias de comprensión y generación de contextos multimodales, lo que le permite seguir instrucciones multimodales complejas. El sistema completo se organiza en tres módulos: H3-Context-IR, que interpreta y refina las instrucciones de entrada y las convierte en una representación intermedia (Context Intermediate Representation) que el generador puede procesar; H3-Base, que produce audio y vídeo a 768p a partir de esa representación; y H3-Regenerate-2K, que realimenta el resultado de 768p junto con el contexto original para regenerar la salida a 2K. El autor señala que H3-Context-IR es crítico para la calidad final y recomienda integrarlo en el pipeline de generación o construir un sistema equivalente siguiendo la guía de prompting.

No se detalla en la información proporcionada el tipo de arquitectura interna (transformer, difusión, híbrida u otra), el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo se distribuye a través de la librería `minimax-h3` y es compatible con `diffusers`, lo que sugiere una integración con el ecosistema de difusión, pero este extremo no se confirma explícitamente en la documentación disponible.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), imagen (image-to-video) e imagen más texto (image-text-to-video).
- Generación de vídeo con audio estéreo nativo a 32 kHz, sincronizado con la imagen (text-audio-video, image-audio-video, image-text-audio-video).
- Transformación de vídeo existente (video-to-video) y de audio a audio-vídeo (audio-to-audio-video), incluyendo variantes audio-audio-video.
- Modo de primer y último fotograma (H3-Base-FL2VA): admite cero, una o dos imágenes de entrada para generar desde texto, desde primer fotograma, desde último fotograma o entre dos fotogramas.
- Modo de referencia omnicanal (H3-Base-Ref2VA): admite hasta 9 imágenes, hasta 3 clips de vídeo de 2 a 15 segundos cada uno (máximo 15 segundos en total) y hasta 3 clips de audio de 2 a 15 segundos (máximo 15 segundos en total), con un máximo de 12 archivos combinados entre todos los tipos.
- Generación de diálogos hablados en 11 idiomas estables (árabe, chino, inglés, francés, alemán, italiano, japonés, coreano, portugués, ruso y español), con soporte variable de otros idiomas.
- Salida con duración de 4 a 15 segundos, 24 FPS, relación de aspecto configurable (21:9, 16:9, 4:3, 1:1, 3:4, 9:16 y otras) y resolución base de 768p en el lado corto, ampliable a 2K mediante H3-Regenerate-2K.
- Comprensión unificada de contextos multimodales de texto, imagen, vídeo y audio.
- Habilidades oficiales de escritura de prompts publicadas en el repositorio de GitHub del proyecto.

## Casos de uso

- Producción de vídeo publicitario de formato corto: el modelo genera clips de 4 a 15 segundos con audio sincronizado y relaciones de aspecto adaptadas a cada plataforma (9:16 para vertical, 16:9 para horizontal), lo que permite crear variantes de un mismo anuncio sin rodaje.
- Prototipado rápido de storyboards animados: a partir de una o dos imágenes de referencia (modo FL2VA) se generan transiciones entre primer y último fotograma, útil para previsualizar secuencias antes de la producción final.
- Doblaje y localización de vídeo: el soporte estable de diálogos en 11 idiomas y el modo de audio a audio-vídeo permiten sustituir o generar pistas de voz en distintos idiomas manteniendo la sincronización con la imagen.
- Generación de contenido para redes sociales con audio nativo: la salida de audio estéreo a 32 kHz evita el paso de postproducción de sonido, lo que reduce el flujo de trabajo en equipos pequeños.
- Creación de vídeos explicativos con referencias visuales: el modo Ref2VA admite hasta 9 imágenes y 3 clips de vídeo y audio como referencia, adecuado para mantener coherencia de personajes, productos o estilo entre planos.
- Restauración y mejora de resolución de material generado: el módulo H3-Regenerate-2K reutiliza el contexto original para escalar resultados de 768p a 2K, útil en pipelines que necesitan entregables de alta resolución a partir de borradores rápidos.
- Generación de material audiovisual para investigación en modelos multimodales: la combinación de entradas de texto, imagen, vídeo y audio en un único sistema facilita experimentos sobre comprensión y generación conjunta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 354,9 GB y el modelo tiene 33.122.992.896 parámetros, por lo que la inferencia en precisión completa requiere un volumen de VRAM del orden de decenas de gigabytes; no se dispone de cifras oficiales de VRAM por cuantización.
- No se especifican en la información disponible las GPU recomendadas (A100, H100, RTX 4090 u otras) ni si el modelo cabe en GPU de consumo.
- No se detallan opciones de despliegue específicas (vLLM, llama.cpp, Ollama, TGI); la model card menciona la librería `minimax-h3`, la compatibilidad con `diffusers` y el acceso mediante API oficial (platform.minimax.io y platform.minimaxi.com).
- No se dispone de datos de latencia ni de throughput.
- Existen alternativas de uso sin despliegue local: la API oficial global y de China, la aplicación web Hailuo AI y la aplicación de escritorio de MiniMax.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de la misma categoría (generación conjunta de vídeo y audio). La comparación cuantitativa con alternativas queda, por tanto, no disponible.

| Modelo | Parámetros | Contexto | Audio nativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax H3 | 33.122.992.896 | no disponible | Sí (estéreo 32 kHz) | MiniMax-H3 Community License | Pesos en HF, API, app web y escritorio |
| Alternativas de la categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia MiniMax-H3 Community License Agreement es de tipo "other"; es imprescindible revisar el texto de LICENSE antes de cualquier uso comercial, ya que puede imponer restricciones adicionales no resumidas en la model card.
- No se documentan en la información disponible los sesgos conocidos del modelo ni las características del dataset de entrenamiento, lo que dificulta evaluar riesgos de representación.
- Riesgo de alucinación visual y auditiva: como modelo generativo, puede producir contenido incoherente con la instrucción, especialmente en escenarios complejos con muchas referencias multimodales.
- La duración de salida está limitada a 15 segundos como máximo y a 4 segundos como mínimo, lo que restringe su uso en piezas de formato largo sin concatenación.
- El modo Ref2VA impone límites estrictos: máximo 9 imágenes, 3 clips de vídeo y 3 clips de audio, con un total de 12 archivos y 15 segundos de material audiovisual de referencia.
- El autor advierte que omitir H3-Context-IR degrada notablemente la calidad del resultado; los pipelines propios deben replicar ese procesamiento de contexto.
- El soporte de idiomas es estable en 11 lenguas para diálogos, pero el resto de idiomas solo está soportado "en diversos grados", sin garantías.
- No se dispone de información sobre cuantizaciones oficiales ni sobre el comportamiento del modelo en precisión reducida.
- El tamaño del repositorio (354,9 GB) y el número de parámetros implican requisitos de almacenamiento y cómputo elevados para despliegue local.

## Enlaces

- Hugging Face: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- GitHub: https://github.com/MiniMax-AI/MiniMax-H3
- Habilidades de prompting: https://github.com/MiniMax-AI/MiniMax-H3/tree/main/skills
- API global: https://platform.minimax.io/docs/api-reference/video-generation-v2-create
- API China: https://platform.minimaxi.com/docs/api-reference/video-generation-v2-create
- Documentación de generación de texto (API): https://platform.minimax.io/docs/guides/text-generation
- WebApp global (Hailuo AI): https://hailuoai.video/tools/minimax-h3
- WebApp China: https://hailuoai.com/
- Aplicación de escritorio global: https://hub.minimax.io/
- Aplicación de escritorio China: https://hub.minimaxi.com/
- Sitio web de MiniMax: https://www.minimax.io
- ModelScope: https://modelscope.cn/organization/minimax
- Discord: https://discord.com/invite/dbMxutw7tP
- Contacto (WeChat): https://platform.minimaxi.com/docs/faq/contact-us
