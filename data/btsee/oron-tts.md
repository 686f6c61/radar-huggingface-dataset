# btsee/oron-tts

## Resumen

OronTTS es un modelo de síntesis de voz (text-to-speech) no autorregresivo desarrollado por btsee, basado en la arquitectura F5-TTS (Flow Matching + Diffusion Transformer) y diseñado específicamente para los idiomas mongol (dialecto khalkha en escritura cirílica) y kazajo (también en cirílico). El modelo resuelve la escasez de sistemas TTS de código abierto y calidad razonable para estas lenguas, que tradicionalmente han recibido poca atención en la comunidad de IA. Su relevancia radica en que combina técnicas modernas de generación de audio (flow matching y difusión) con una licencia MIT, lo que permite su uso comercial sin restricciones.

La arquitectura se compone de un transformer de difusión (DiT) con 1024 dimensiones ocultas, 22 capas y 16 cabezas de atención, junto con un vocoder Vocos para convertir los mel-espectrogramas en audio a 24 kHz. El modelo se entrenó con 3.846 muestras de habla mongola del dataset público `btsee/mbspeech_mn`. Aunque el repositorio ocupa 501,2 GB (probablemente por los checkpoints y archivos auxiliares), no se han publicado los parámetros totales ni requisitos de hardware específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | F5-TTS (OT-CFM + DiT + Vocos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | mongol (cirílico khalkha), kazajo (cirílico) |
| Licencia | MIT |
| Formato de pesos | no disponible (PyTorch, checkpoints .pt) |

## Arquitectura y entrenamiento

OronTTS sigue el diseño de F5-TTS, un sistema no autorregresivo que utiliza optimal transport conditional flow matching (OT-CFM) para generar mel-espectrogramas a partir de texto, y un vocoder Vocos para reconstruir la forma de onda. El componente principal es un transformer de difusión (DiT) con configuración `dim=1024`, `depth=22` y `heads=16`, que procesa secuencias de tokens de texto (vocabulario de 65 tokens) y las condiciona con un audio de referencia para transferir timbre y prosodia. La tasa de muestreo es de 24 kHz y se usan 100 bandas de mel.

El entrenamiento se realizó exclusivamente con el dataset `btsee/mbspeech_mn`, que contiene 3.846 muestras de habla mongola. No se dispone de información sobre el número total de tokens de entrenamiento, la composición del dataset (si incluye kazajo o solo mongol) ni sobre técnicas de alineamiento como RLHF o DPO. El modelo se presenta como "tokenizer-free", lo que significa que no requiere un tokenizador de audio separado, simplificando el pipeline de síntesis.

## Capacidades

- Síntesis de voz en mongol (cirílico khalkha) y kazajo (cirílico) con control de timbre y prosodia mediante un audio de referencia (zero-shot TTS).
- Generación no autorregresiva: produce el mel-espectrograma completo en un solo paso, lo que reduce la latencia frente a modelos autorregresivos.
- Entrada de texto en escritura cirílica, con soporte para los caracteres específicos de ambos idiomas.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso, ya que es un modelo puramente de síntesis de voz.
- No se han documentado capacidades multilingües más allá de los dos idiomas indicados.

## Casos de uso

- Audiolibros en mongol y kazajo: el modelo puede generar narraciones fluidas a partir de texto, con control de la voz mediante una muestra de referencia del locutor deseado. Su naturaleza no autorregresiva permite generar segmentos largos de forma eficiente.
- Asistentes de voz para aplicaciones móviles: al ser ligero (en términos de inferencia, aunque no se han publicado requisitos exactos), puede integrarse en aplicaciones de asistencia por voz en estos idiomas, ofreciendo respuestas habladas en tiempo real.
- Accesibilidad para personas con discapacidad visual: conversión de contenido escrito (noticias, libros, interfaces) a voz en mongol y kazajo, mejorando el acceso a la información en regiones donde estos idiomas son predominantes.
- Aprendizaje de idiomas: generación de frases de ejemplo con pronunciación correcta para estudiantes de mongol o kazajo, permitiendo escuchar cómo se pronuncian palabras y oraciones.
- Doblaje de vídeos y contenido multimedia: el modelo puede generar voces para doblar vídeos educativos, documentales o entretenimiento, utilizando una voz de referencia para mantener consistencia.
- Sistemas de respuesta interactiva por voz (IVR): integración en centralitas telefónicas o chatbots de voz para proporcionar respuestas habladas en mongol o kazajo, mejorando la experiencia del usuario en servicios locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos objetivos sobre calidad de audio (MOS), velocidad de inferencia ni comparaciones con otros modelos TTS para mongol o kazajo.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware por parte del autor.
- Dado que el modelo usa un DiT de 1024 dimensiones y 22 capas, se estima que el número de parámetros podría estar en el rango de 200-500 millones, aunque no se confirma. Para inferencia en tiempo real se recomendaría una GPU con al menos 8 GB de VRAM (por ejemplo, NVIDIA RTX 3060 o superior), pero esta es una estimación orientativa.
- El repositorio ocupa 501,2 GB, lo que sugiere que los checkpoints son grandes y podrían requerir almacenamiento significativo, aunque la inferencia en sí no necesita cargar todo el repositorio.
- Opciones de despliegue: al ser un modelo PyTorch, puede ejecutarse con frameworks como vLLM (aunque no está optimizado para TTS), o mediante scripts personalizados como el ejemplo proporcionado. No se menciona soporte para llama.cpp, Ollama o TGI.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para mongol o kazajo. El modelo base F5-TTS original (para inglés y otros idiomas) podría servir como referencia, pero no se han publicado comparativas directas. Se recomienda consultar el repositorio de F5-TTS para más contexto, aunque no se incluye en los enlaces proporcionados.

## Limitaciones y advertencias

- El entrenamiento se realizó con un conjunto de datos muy reducido (3.846 muestras), lo que puede limitar la variedad de voces, acentos y entonaciones que el modelo puede reproducir. Es probable que tenga dificultades con palabras poco frecuentes, nombres propios extranjeros o dialectos no representados en el dataset.
- No se han documentado evaluaciones de sesgos ni de robustez ante entradas ruidosas o mal formateadas.
- El modelo puede producir alucinaciones de audio, es decir, pronunciaciones incorrectas o artefactos en palabras que no estaban bien representadas en el entrenamiento.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario debe verificar que el dataset de entrenamiento `btsee/mbspeech_mn` también tenga una licencia compatible con su caso de uso.
- No se ha confirmado si el modelo soporta correctamente el kazajo, ya que el entrenamiento se describe únicamente con datos mongoles. Es posible que el soporte para kazajo sea limitado o experimental.
- El tamaño del repositorio (501,2 GB) puede dificultar la descarga y el despliegue en entornos con ancho de banda limitado.

## Enlaces

- HuggingFace: https://huggingface.co/btsee/oron-tts
- GitHub: https://github.com/btseee/oron-tts
- Dataset de entrenamiento: https://huggingface.co/datasets/btsee/mbspeech_mn
