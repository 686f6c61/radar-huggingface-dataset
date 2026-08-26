# rtikw/InspireMusic-1.5B-Long

## Resumen

InspireMusic-1.5B-Long es un modelo de generación de música desarrollado por el equipo FunAudioLLM de Alibaba, diseñado para producir audio musical de alta calidad y larga duración a partir de texto o como continuación de una pieza existente. Se trata de un framework unificado que integra un tokenizador de audio, un transformador autorregresivo basado en Qwen2.5 y un modelo de super-resolución basado en flow-matching, lo que permite generar muestras de audio a 48 kHz con una fidelidad acústica alta.

Este modelo concreto, la variante Long, está optimizado para generación de música de formato largo, con una ventana de contexto que admite secuencias prolongadas. El repositorio alojado en HuggingFace con ID `rtikw/InspireMusic-1.5B-Long` es un mirror sin modificar del original publicado en ModelScope, creado para garantizar su disponibilidad tras la retirada de los repos oficiales en HuggingFace. Con 1.543.714.304 parámetros (aproximadamente 1.5B), el modelo es adecuado para tareas de text-to-music, continuación musical, reconstrucción y super-resolución, siempre que se disponga de hardware con al menos 24 GB de VRAM para una inferencia óptima.

Su relevancia radica en que aborda una carencia común en los modelos de generación de audio: la producción de piezas largas con coherencia estructural. InspireMusic-1.5B-Long permite controlar género, estructura y marcas de tiempo, lo que lo hace útil para creadores, investigadores y desarrolladores que necesiten generar música de alta calidad en entornos de producción. El modelo se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial y su integración en proyectos propios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (backbone Qwen2.5) + tokenizador de audio + modelo de super-resolución flow-matching |
| Parámetros totales | 1.543.714.304 (1.5B) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (optimizado para generación de audio larga) |
| Tipos de cuantización | no disponible (se distribuye en safetensors, sin cuantizaciones predefinidas) |
| Idiomas soportados | Inglés (solo prompts en inglés, según la documentación) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

InspireMusic-1.5B-Long se compone de tres módulos principales. El primer componente es un tokenizador de audio que convierte la forma de onda bruta en tokens discretos de alta tasa de bits, permitiendo que el modelo procese audio de manera eficiente. El segundo es un transformador autorregresivo basado en Qwen2.5 que se entrena con predicción de siguiente token sobre secuencias mixtas de texto y audio, generando secuencias coherentes y contextualmente relevantes. El tercer componente es un modelo de flow-matching de super-resolución que mapea los tokens generados a características latentes de alta resolución, obtenidas a partir de audio muestreado a una frecuencia mayor, y un vocoder produce la forma de onda final.

En cuanto al entrenamiento, el modelo utiliza un enfoque de predicción de siguiente token sobre datos de audio tokenizados y texto, sin que se especifiquen detalles sobre el tamaño del dataset ni sobre técnicas como RLHF o DPO en la información disponible. La innovación principal radica en la combinación de un backbone de lenguaje (Qwen2.5) con un tokenizador de audio de alta tasa de bits y un modelo de super-resolución basado en flow-matching, lo que permite generar audio a 48 kHz con mayor fidelidad que los sistemas que trabajan a frecuencias de muestreo más bajas.

## Capacidades

- Generación de música a partir de texto: el modelo acepta prompts en inglés y genera piezas musicales completas, con control sobre género, estructura y marcas de tiempo.
- Continuación musical: puede extender una pieza existente a partir de un audio de entrada, manteniendo coherencia estilística y tonal.
- Reconstrucción y super-resolución de audio: permite reconstruir audio de baja calidad o mejorar su resolución hasta 48 kHz mediante el módulo de flow-matching.
- Generación de audio de larga duración: la variante "Long" está optimizada para producir fragmentos musicales extensos, superando las limitaciones de contexto de otros modelos de generación de audio.
- Control de género y estructura: el modelo admite indicaciones sobre el género musical y la estructura de la pieza (intro, verso, estribillo, etc.).
- Soporte de audio de alta fidelidad: genera audio a 48 kHz con una calidad acústica alta, gracias al vocoder y al modelo de super-resolución.
- No soporta tool calling ni agentes: es un modelo de generación de audio, no un modelo de lenguaje general.

## Casos de uso

- **Composición musical para creadores**: el modelo puede generar piezas originales a partir de descripciones textuales en inglés, lo que permite a compositores y productores obtener ideas o esqueletos musicales rápidamente. Es adecuado por su control de género y estructura, y por la generación de audio a 48 kHz de alta calidad.
- **Generación de bandas sonoras para vídeo**: se puede integrar en pipelines de producción audiovisual para crear música de fondo adaptada a la duración de la escena, gracias a la capacidad de generación de audio largo y la opción de continuación a partir de un fragmento inicial.
- **Prototipado y experimentación en investigación musical**: los investigadores pueden usar el modelo para estudiar técnicas de generación de audio, como la evaluación de la coherencia estructural en piezas largas o la aplicación de control de género. Su licencia Apache-2.0 permite modificación y redistribución.
- **Generación de música para videojuegos**: en el desarrollo de juegos, el modelo puede crear música procedural que se adapte a la dinámica del juego, usando prompts de texto para variar el estilo o la intensidad, y generando clips de duración variable.
- **Restauración de audio**: gracias a la capacidad de super-resolución, el modelo puede mejorar la calidad de grabaciones antiguas o de baja fidelidad, convirtiéndolas a 48 kHz, lo que es útil en proyectos de archivo o remasterización.
- **Educación musical y herramientas de asistencia**: puede usarse como herramienta didáctica para demostrar conceptos de teoría musical (género, estructura, armonía) generando ejemplos auditivos a partir de instrucciones textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre métricas como MMLU, HumanEval o GSM8K, ya que el modelo está orientado a la generación de audio, no a tareas de lenguaje general. Los únicos datos de rendimiento disponibles son:

- En una GPU H800, el modelo puede generar 30 segundos de audio en aproximadamente 48 segundos, con un factor de tiempo real (RTF) de 1.6 a 1.8.
- Para inferencia óptima se recomienda un hardware con al menos 24 GB de memoria GPU.

## Requisitos de hardware

- **VRAM estimada**: al menos 24 GB para inferencia óptima en modo normal, según la documentación. Con cuantizaciones más ligeras (no disponibles en este mirror), podría reducirse, pero no se especifica.
- **GPU recomendadas**: se recomiendan GPUs con 24 GB o más, como la NVIDIA RTX 3090, RTX 4090, A100 o H800. En la documentación se menciona el uso de H800 para la medición de rendimiento.
- **¿Cabe en GPU de consumidor?**: sí, una RTX 4090 con 24 GB VRAM sería suficiente para la inferencia, aunque la generación de audio largo puede requerir más memoria para el contexto.
- **Opciones de despliegue**: el modelo se distribuye en formato safetensors y se usa con el código de GitHub oficial (FunAudioLLM/InspireMusic). No se mencionan integraciones con vLLM, llama.cpp u Ollama, que están orientados a modelos de lenguaje. La inferencia se realiza mediante el toolkit de InspireMusic.
- **Latencia y rendimiento**: en H800, la generación de 30 segundos de audio tarda unos 48 segundos, con un RTF de 1.6 a 1.8. Esto implica una latencia notable, por lo que no es adecuado para aplicaciones en tiempo real, sino para procesos por lotes o bajo demanda.

## Comparativa con modelos similares

La comparativa con modelos similares no está disponible en la información proporcionada. No se han publicado datos de comparación con otros modelos de generación de música como MusicGen (Meta), AudioLDM o DiffSynth-Studio. Los datos concretos de parámetros, contexto y rendimiento de estas alternativas no están disponibles en este contexto, por lo que no es posible realizar una comparativa numérica fiable.

## Limitaciones y advertencias

- **Idioma**: el modelo solo acepta prompts en inglés, según la documentación oficial. No se ha probado con otros idiomas, por lo que el uso en español no está garantizado.
- **Sesgos y alucinación**: como modelo generativo de audio, puede producir resultados que no coincidan exactamente con la descripción textual, especialmente con prompts ambiguos o complejos. No hay datos sobre sesgos específicos en la información disponible.
- **Contexto limitado**: aunque la variante Long está optimizada para audio largo, no se especifica la duración máxima exacta que puede generar, y la calidad puede degradarse en piezas extremadamente largas.
- **Rendimiento de hardware**: la inferencia requiere al menos 24 GB de VRAM, lo que excluye a GPUs de gama media (como la RTX 3060) y obliga a usar hardware profesional o de alta gama.
- **Disponibilidad**: el modelo original fue retirado de HuggingFace; este mirror es la única vía de acceso en esta plataforma, y la disponibilidad futura depende del autor del mirror.
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial, pero es necesario verificar el cumplimiento de los términos de la licencia y de los modelos de audio subyacentes (por ejemplo, el tokenizador de audio puede tener licencias adicionales).

## Enlaces

- Repositorio de HuggingFace (mirror): https://huggingface.co/rtikw/InspireMusic-1.5B-Long
- Repositorio original en ModelScope: https://modelscope.cn/models/iic/InspireMusic-1.5B-Long
- Repositorio de código en GitHub (FunAudioLLM): https://github.com/FunAudioLLM/InspireMusic
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/FunAudioLLM/InspireMusic
- Demo en ModelScope Spaces: https://modelscope.cn/studios/iic/InspireMusic/summary
- Paper: http://arxiv.org/abs/2503.00084
- Referencia del tokenizador de audio: https://openreview.net/forum?id=yBlVlS2Fd9
- Referencia de Qwen2.5: https://arxiv.org/abs/2412.15115
- Referencia del modelo de flow-matching: https://arxiv.org/abs/2305.02765
- Paquete en PyPI: https://pypi.org/project/inspiremusic/
- Repositorio GitHub alternativo (Borealin): https://github.com/Borealin/InspireMusic
- Repositorio GitHub alternativo (davidlealo): https://github.com/davidlealo/inspiremusic
