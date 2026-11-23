# Genius-Society/hoyoMusic

## Resumen

hoyoMusic es un modelo de generación musical desarrollado por Genius-Society, construido sobre la arquitectura Tunesformer. Está entrenado específicamente para generar partituras en formato ABC inspiradas en el universo HoYoverse (Genshin Impact, Honkai: Star Rail), a partir de un dataset de música para piano creada por la comunidad de usuarios de MiHoYo. El modelo se publica como adaptador para la librería `adapter-transformers` y se distribuye bajo licencia MIT.

El modelo no es un LLM de propósito general: es un generador condicionado de secuencias musicales simbólicas (notación ABC) que aprende el estilo compositivo de las bandas sonoras de los juegos de HoYoverse. Su relevancia radica en ser un ejemplo de adaptación de arquitecturas de generación simbólica a dominios creativos muy específicos, con un dataset pequeño y curado, y con un espacio de demostración público en Hugging Face Spaces.

El repositorio ocupa 1,1 GB y fue creado en diciembre de 2023, con actualizaciones posteriores. Los idiomas declarados son chino (zh) e inglés (en), aunque en la práctica el modelo opera sobre tokens musicales ABC más que sobre lenguaje natural. No hay información publicada sobre número de parámetros, longitud de contexto ni benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tunesformer (transformer encoder-decoder para generación de ABC musical); distribuido como adaptador |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (adaptador PEFT; se ejecuta sobre el modelo base Tunesformer) |
| Idiomas soportados | zh, en (declarados; la salida es notación musical ABC) |
| Licencia | MIT |
| Formato de pesos | adaptador `adapter-transformers` (repo de 1,1 GB); pesos del modelo base no incluidos en la ficha |

## Arquitectura y entrenamiento

hoyoMusic se basa en Tunesformer, un transformer encoder-decoder diseñado para generar melodías en notación ABC a partir de controles estructurales (compases, secciones, etc.). El modelo se distribuye como adaptador, lo que implica que requiere cargar el modelo base Tunesformer y aplicar los pesos del adaptador encima. La arquitectura exacta (número de capas, dimensión oculta, cabezas de atención) no se detalla en la información disponible.

El entrenamiento se realizó sobre el dataset `Genius-Society/hoyo_music`, compuesto por fragmentos de partituras ABC extraídos de música de los juegos de MiHoYo (Genshin Impact, Honkai: Star Rail) y de contenido creado por la comunidad. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá del uso del esquema Tunesformer.

## Capacidades

- Generación de melodías simbólicas en notación ABC, condicionadas al estilo de las bandas sonoras de HoYoverse.
- Generación de partituras para piano (el dataset de entrenamiento se limita a piano).
- Soporte de control estructural mediante los parámetros de entrada de Tunesformer (número de compases, secciones, etc.), según la arquitectura base.
- Capacidad multilingüe declarada (zh, en) para las etiquetas o metadatos, no para generación de texto libre.
- Integración con `text-generation-inference` según los tags del repositorio, aunque no se documenta el pipeline exacto.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento.

## Casos de uso

- Composición asistida de música para mods y fan games de Genshin Impact o Honkai: Star Rail: el modelo genera fragmentos ABC que el compositor puede importar a MuseScore o LilyPond y editar manualmente, aprovechando el estilo aprendido del corpus de HoYoverse.
- Generación de variaciones temáticas para contenido de creadores: un streamer o artista puede pedir al modelo varias melodías con una estructura de compases fija y seleccionar las que mejor encajen con su vídeo, reduciendo el tiempo de bocetado.
- Prototipado rápido de bandas sonoras para proyectos indie: al producir notación ABC, el equipo puede convertirla a MIDI y renderizarla con un piano virtual sin necesidad de un compositor humano en la fase inicial.
- Investigación en generación musical simbólica: sirve como caso de estudio de adaptación de Tunesformer a un dominio estilístico concreto con un dataset pequeño y curado, útil para comparar estrategias de fine-tuning.
- Educación musical y análisis de estilo: permite generar ejemplos de estructuras melódicas típicas de las bandas sonoras de HoYoverse para su estudio en asignaturas de composición o análisis.
- Generación de material para demos interactivas: el Space público de Hugging Face permite a usuarios no técnicos probar el modelo, lo que lo hace adecuado para talleres, presentaciones o prototipos de productos creativos.
- Ampliación de datasets de música simbólica: las salidas ABC pueden filtrarse y añadirse a corpus de investigación, siempre que se respete la licencia MIT y se documente la procedencia sintética.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo declara la métrica `accuracy` en los metadatos, sin valores numéricos ni protocolo de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al ser un adaptador sobre Tunesformer, el consumo vendrá determinado por el modelo base (no documentado en esta ficha).
- GPU recomendadas: no disponible. Para modelos Tunesformer de tamaño moderado, una GPU consumer con 8-16 GB suele ser suficiente, pero no hay confirmación oficial.
- Cabe en GPU consumer: probablemente sí, dado que el repo del adaptador ocupa 1,1 GB y el modelo base Tunesformer es de escala pequeña-media, pero no se dispone de cifras oficiales.
- Opciones de despliegue: `adapter-transformers` (librería principal), `huggingface_hub` para descarga, y el Space oficial para demo. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI más allá del tag `text-generation-inference`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hoyoMusic | Tunesformer (adaptador) | no disponible | no disponible | MIT | Hugging Face, ModelScope |
| Tunesformer (base) | Transformer encoder-decoder para ABC | no disponible en esta ficha | no disponible | no disponible | Hugging Face (Genius-Society/tunesformer) |
| MusicGen (Meta) | Transformer autorregresivo sobre tokens de audio | 300M–3.3B según variante | no disponible | CC-BY-NC 4.0 (pesos) | Hugging Face |
| MuseNet (OpenAI) | Transformer sobre tokens MIDI | no disponible | no disponible | no disponible (no público) | No público |

La comparación con MusicGen no es directa: hoyoMusic genera notación simbólica ABC, mientras que MusicGen genera audio. Frente al Tunesformer base, hoyoMusic añade el estilo HoYoverse mediante un adaptador. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- El dataset de entrenamiento se limita a fragmentos ABC de piano de juegos de MiHoYo; el modelo probablemente generaliza mal fuera de ese estilo y de ese instrumento.
- No hay información sobre sesgos musicales, diversidad de estilos ni evaluación cualitativa sistemática.
- Riesgo de alucinación musical: puede producir secuencias ABC sintácticamente válidas pero musicalmente incoherentes o repetitivas.
- La licencia MIT permite uso comercial, pero el modelo se entrena sobre música de terceros (bandas sonoras de HoYoverse) y contenido de la comunidad; el uso comercial de salidas que imiten de cerca obras protegidas puede tener implicaciones legales que la licencia del modelo no resuelve.
- Los idiomas declarados (zh, en) se refieren a metadatos; el modelo no es un LLM conversacional y no debe usarse para tareas de texto general.
- No se documenta el modelo base exacto ni la versión de Tunesformer utilizada, lo que dificulta la reproducibilidad.
- El repositorio tiene 0 descargas y 28 likes en el momento de la consulta, lo que sugiere poca validación por parte de la comunidad.
- No hay información sobre latencia, throughput ni requisitos de hardware verificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Genius-Society/hoyoMusic
- Demo (Space): https://huggingface.co/spaces/Genius-Society/hoyoMusic
- Dataset: https://huggingface.co/datasets/Genius-Society/hoyoMusic
- Modelo base Tunesformer: https://huggingface.co/Genius-Society/tunesformer
- Mirror en ModelScope: https://www.modelscope.cn/models/Genius-Society/hoyoMusic
