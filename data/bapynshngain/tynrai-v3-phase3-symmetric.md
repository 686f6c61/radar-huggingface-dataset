# Bapynshngain/Tynrai-V3-Phase3-Symmetric

## Resumen

Tynrai-V3-Phase3-Symmetric es un modelo de traducción automática neuronal especializado en el par de idiomas khasi-inglés, desarrollado por el usuario Bapynshngain. Se trata de un fine-tuning del modelo Tynrai-V3-Phase2, que a su vez parte de la arquitectura m2m_100 de Meta, adaptada específicamente para el idioma khasi, una lengua austroasiática hablada principalmente en el estado de Meghalaya, en el noreste de la India. El modelo cuenta con 615 millones de parámetros y está diseñado para la tarea de traducción bidireccional entre inglés y khasi.

El modelo se distribuye a través de Hugging Face con acceso restringido, lo que obliga a aceptar condiciones de uso antes de su descarga. Su relevancia radica en la escasez de recursos lingüísticos computacionales para el khasi, un idioma de bajos recursos que apenas cuenta con modelos de traducción automática de calidad. El autor declara resultados de BLEU de 44,79 y chrF de 61,82 en la dirección khasi-inglés, métricas que, si bien no están verificadas de forma independiente, resultan notables para un par de idiomas con tan pocos recursos.

La ficha se basa exclusivamente en la información disponible en la model card y los metadatos de Hugging Face. No se dispone de documentación adicional sobre el proceso de entrenamiento, la composición del corpus ni las decisiones de diseño, por lo que varios apartados técnicos se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | m2m_100 (transformer encoder-decoder) |
| Parámetros totales | 615.075.840 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en), khasi (kha) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Bapynshngain/Tynrai-V3-Phase2 |
| Tarea | text2text-generation (traducción) |
| Acceso | restringido (gated) |
| Tamaño del repositorio | 17,3 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura m2m_100, un transformer encoder-decoder multilingüe diseñado originalmente por Meta para traducción entre más de un centenar de idiomas. La variante utilizada aquí corresponde a la configuración de aproximadamente 615 millones de parámetros, que en el modelo original de m2m_100 se asocia a la versión de 418M o 1.2B según la implementación; el recuento exacto de 615.075.840 parámetros indica una adaptación concreta del checkpoint base. El modelo se ha afinado en tres fases sucesivas (Phase1, Phase2 y Phase3), de las cuales esta ficha corresponde a la tercera y última, denominada "Symmetric", lo que sugiere un entrenamiento equilibrado en ambas direcciones de traducción.

El entrenamiento se realizó sobre el corpus Bapynshngain/Tynrai-V3-Master-Corpus, un dataset propio del autor cuyo contenido, tamaño y composición no se detallan en la información disponible. No se especifica el número de tokens de entrenamiento, la proporción de datos paralelos, ni si se aplicaron técnicas de RLHF, DPO o aumentación de datos. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La información sobre hiperparámetros, duración del entrenamiento y metodología de evaluación es inexistente en la model card.

## Capacidades

- Traducción automática bidireccional entre inglés y khasi (en-kha y kha-en), con especial énfasis en la dirección khasi-inglés según los benchmarks declarados.
- Generación de texto seq2seq mediante la pipeline de traducción de transformers.
- Manejo de texto en khasi, un idioma de bajos recursos con escritura latina.
- Compatible con endpoints de Hugging Face (tag endpoints_compatible).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento extendido.
- No se documenta capacidad multimodal (visión, audio) ni otras modalidades distintas del texto.
- Capacidades multilingües limitadas a los dos idiomas declarados; no se garantiza un rendimiento aceptable en otros idiomas.

## Casos de uso

- Traducción de documentos administrativos y legales del khasi al inglés: el modelo puede emplearse para traducir textos oficiales del estado de Meghalaya, facilitando el acceso a servicios públicos y la comunicación institucional con autoridades federales.
- Localización de contenido educativo: traducción de materiales didácticos del inglés al khasi para escuelas rurales donde el inglés no es la lengua vehicular, aprovechando el conocimiento del dominio del corpus de entrenamiento.
- Preservación del patrimonio lingüístico: digitalización y traducción de textos literarios, religiosos o etnográficos en khasi, contribuyendo a la documentación de una lengua con pocos recursos computacionales.
- Atención al ciudadano en servicios públicos: integración del modelo en sistemas de traducción automática para oficinas gubernamentales que atienden a hablantes de khasi, permitiendo respuestas en inglés a consultas formuladas en lengua local.
- Investigación lingüística computacional: uso del modelo como línea base para estudios sobre traducción de lenguas austroasiáticas de bajos recursos, comparando su rendimiento con modelos multilingües genéricos.
- Traducción de contenido web y redes sociales: procesamiento de publicaciones y comentarios en khasi para su análisis en inglés en herramientas de monitorización o moderación, dado el creciente volumen de contenido digital en lenguas regionales de la India.
- Subtitulado y transcripción traducida: combinado con un sistema de reconocimiento de voz, el modelo puede traducir transcripciones en khasi a inglés para generar subtítulos en medios audiovisuales.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card (no verificados de forma independiente) son los siguientes:

| Tarea | Métrica | Valor |
|---|---|---|
| Traducción khasi-inglés | BLEU | 44,79 |
| Traducción khasi-inglés | chrF | 61,82 |
| Traducción khasi-inglés | TER | 44,26 |

No se han publicado resultados para la dirección inglés-khasi ni para otras tareas en la información disponible. Tampoco se dispone de comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,5 GB solo para pesos (615M parámetros × 4 bytes), más memoria para activaciones y caché según la longitud de secuencia.
- VRAM estimada en fp16/bf16: aproximadamente 1,3 GB para pesos, adecuada para GPUs consumer de gama media.
- VRAM estimada en int8: aproximadamente 0,7 GB para pesos; en int4, aproximadamente 0,4 GB, aunque no se documentan cuantizaciones oficiales disponibles.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (GTX 1650, RTX 3050, RTX 4060). Para mayor throughput, se recomiendan A100, H100 o RTX 4090.
- Cabe holgadamente en GPUs consumer: sí, en la mayoría de tarjetas con 4 GB o más de VRAM.
- Opciones de despliegue: transformers (pipeline de traducción), y potencialmente TGI o vLLM si se generan artefactos compatibles; no se documenta soporte explícito para llama.cpp u Ollama, dado que el formato es safetensors y la arquitectura m2m_100 requiere el runtime de transformers.
- Latencia y throughput: no disponibles. Para un modelo de 615M parámetros en una GPU moderna, se espera un throughput de decenas a cientos de tokens por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| Tynrai-V3-Phase3-Symmetric | 615M | no disponible | en, kha | no disponible | restringido |
| m2m_100-418M (Meta) | 418M | 1024 tokens | 100+ | MIT | abierto |
| NLLB-200-distilled-600M (Meta) | 600M | 1024 tokens | 200 | CC-BY-NC 4.0 | abierto |
| Opus-MT-en-kha (Helsinki-NLP) | no disponible | no disponible | en, kha | no disponible | abierto |

La comparación con m2m_100-418M y NLLB-200-distilled-600M es pertinente por tamaño y arquitectura, aunque ninguno de ellos está especializado en khasi. Opus-MT ofrece modelos específicos por par de idiomas, pero no se dispone de datos de rendimiento comparables para el par en-kha en la información proporcionada. No se dispone de benchmarks cruzados entre estos modelos y Tynrai-V3 en la model card.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente; deben interpretarse con cautela.
- No se documenta la licencia, lo que impide determinar si el uso comercial está permitido. Es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- El acceso es restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y la automatización de descargas.
- El modelo solo cubre inglés y khasi; no se garantiza un comportamiento correcto en otros idiomas y podría producir traducciones degeneradas o alucinaciones si se le alimenta con texto en lenguas no vistas.
- No se documenta el tamaño ni la composición del corpus de entrenamiento, por lo que se desconoce el sesgo potencial hacia determinados dominios (religioso, administrativo, literario) y la calidad de la cobertura léxica.
- Riesgo de alucinación inherente a los modelos seq2seq en traducción: pueden omitir, añadir o inventar contenido, especialmente en frases largas o con terminología especializada.
- No se especifica la longitud máxima de contexto soportada; secuencias largas pueden truncarse o degradar la calidad.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se dispone de información sobre el proceso de entrenamiento (datos, hiperparámetros, técnicas de regularización), lo que dificulta la auditoría técnica y la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bapynshngain/Tynrai-V3-Phase3-Symmetric
- Modelo base (Phase2): https://huggingface.co/Bapynshngain/Tynrai-V3-Phase2
- Dataset de entrenamiento: https://huggingface.co/datasets/Bapynshngain/Tynrai-V3-Master-Corpus
- Paper de m2m_100 (arquitectura base): https://arxiv.org/abs/2010.11125
- Repositorio de transformers (runtime): https://github.com/huggingface/transformers
