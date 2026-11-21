# Austriani/Kitchoon-Final-26B-A4B-RP-ik_llama.cpp

## Resumen

Kitchoon-Final-26B-A4B-RP-ik_llama.cpp es una cuantización GGUF del modelo base SubMaroon/Kitchoon-Final-26B-A4B, publicada por el usuario Austriani. Se trata de un modelo de mezcla de expertos (MoE) orientado a generación de texto creativo, roleplay y conversación, con un total de 25.233.142.046 parámetros (aproximadamente 25,2 mil millones) y una arquitectura que, según las etiquetas de la model card, deriva de la familia Gemma (etiqueta "gemma-4"). El modelo base está especializado en escritura creativa, temáticas oscuras y conversación sin censura.

El repositorio contiene únicamente pesos cuantizados en formato GGUF, generados con la herramienta ik_llama.cpp y calibrados mediante imatrix (calibración V3) con la técnica de cuantización IQK/Trellis-Quant. Esto lo hace directamente consumible por motores de inferencia basados en ik_llama.cpp, una bifurcación optimizada de llama.cpp. La licencia declarada es Apache 2.0 y el único idioma soportado es el inglés.

La relevancia de esta ficha radica en que se trata de una publicación de cuantización de un modelo de rol, no de un modelo fundacional original: el interés práctico está en la posibilidad de ejecutar un MoE de ~25B con un tamaño de repositorio de 104,8 GB en hardware local, siempre que se disponga del runtime adecuado y de la información de la model card original del modelo base, que no está incluida en su totalidad en este repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), derivada de la familia Gemma según etiquetas de la model card; detalles de capas y atención no disponibles |
| Parámetros totales | 25.233.142.046 (~25,2 B) |
| Parámetros activos | ~4 B (según la etiqueta "a4b" y el nombre del modelo) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF cuantizado con ik_llama.cpp, IQK, Trellis-Quant, imatrix y calibración V3; niveles concretos (p. ej. Q4_K_M) no disponibles en la información proporcionada |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 104,8 GB) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo es una mezcla de expertos (MoE) con aproximadamente 25,2 mil millones de parámetros totales y alrededor de 4 mil millones de parámetros activos por token, lo que explica la nomenclatura "26B-A4B". Las etiquetas de la model card lo asocian a la familia Gemma ("gemma-4"), pero no se especifican el número de capas, la dimensión oculta, el número de expertos, la estrategia de enrutamiento ni el mecanismo de atención. Tampoco se documentan la longitud de contexto nativa ni el vocabulario.

Respecto al entrenamiento, no se proporcionan datos sobre el número de tokens, la composición del corpus, ni si hubo etapas de ajuste supervisado, RLHF o DPO. La model card del repositorio de cuantización se centra en el proceso de cuantización: uso de ik_llama.cpp, cuantización IQK con Trellis-Quant, calibración mediante imatrix con la variante "V3-calibration" y la etiqueta "maxoptima". No se detalla la innovación técnica del modelo base más allá de su naturaleza MoE y su orientación a roleplay y escritura creativa sin censura.

## Capacidades

- Generación de texto conversacional y creativo en inglés, con especialización declarada en roleplay (RP) y roleplay erótico (ERP).
- Escritura creativa, incluyendo temáticas oscuras ("dark-themes") según las etiquetas del autor.
- Conversación multi-turno orientada a personajes y narrativa.
- Modo "uncensored": el autor indica que el modelo no aplica filtrado de contenido, orientado a usos creativos sin restricciones.
- No se documentan capacidades de razonamiento matemático, generación de código, visión, audio, tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés según el campo `language` de la model card.

## Casos de uso

- Roleplay conversacional con personajes: el modelo está ajustado específicamente para mantener personalidad y coherencia narrativa en diálogos multi-turno; su naturaleza MoE con ~4 B de parámetros activos permite respuestas rápidas en hardware de consumo.
- Escritura creativa de ficción: útil para generar relatos, diálogos y tramas con temáticas adultas u oscuras, ámbito en el que el autor declara que el modelo no aplica censura.
- Prototipado de videojuegos narrativos: puede integrarse como motor de diálogo de NPC en proyectos indie que requieran respuestas variadas y con tono consistente, ejecutándose localmente con ik_llama.cpp.
- Generación de contenido para comunidades de rol: foros y plataformas de escritura colaborativa pueden usar el modelo para asistir a autores en la continuación de historias.
- Experimentación con cuantizaciones MoE: investigadores interesados en evaluar el impacto de IQK/Trellis-Quant e imatrix V3 sobre un MoE de ~25 B pueden usar este repositorio como referencia práctica de despliegue en ik_llama.cpp.
- Despliegue local sin conexión: al ser GGUF y ejecutable con ik_llama.cpp, permite inferencia en estaciones de trabajo sin dependencia de API externas, adecuado para entornos con requisitos de privacidad.
- Evaluación comparativa de calidad de cuantización: útil para medir la degradación de calidad entre distintos niveles de cuantización del mismo modelo base en tareas de escritura creativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 104,8 GB, pero ese tamaño incluye probablemente varios archivos GGUF de distintos niveles de cuantización; la VRAM necesaria para una sola cuantización dependerá del nivel elegido y no está especificada. Como referencia orientativa para un MoE de ~25 B, una cuantización de 4 bits requeriría del orden de 14-16 GB, pero este dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del modelo, se necesitarían GPU con 24 GB o más de VRAM para cuantizaciones de 4-5 bits, o configuraciones multi-GPU.
- GPU de consumo: no confirmado; un MoE con ~4 B activos puede ser viable en GPUs de consumo con suficiente VRAM para alojar los pesos totales, pero no hay datos oficiales.
- Opciones de despliegue: ik_llama.cpp (runtime declarado en la model card). No se confirma compatibilidad con llama.cpp estándar, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Kitchoon-Final-26B-A4B-RP (este) | ~25,2 B | ~4 B | No disponible | Apache 2.0 | GGUF (ik_llama.cpp) | Especializado en roleplay y escritura creativa sin censura |
| Modelo base SubMaroon/Kitchoon-Final-26B-A4B | ~25,2 B | ~4 B | No disponible | No disponible | No disponible | Modelo original del que deriva esta cuantización |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de información sobre modelos comparables en la documentación proporcionada |

## Limitaciones y advertencias

- El modelo está especializado en roleplay y contenido sin censura; puede generar material explícito, violento o de temáticas oscuras, lo que requiere filtrado y moderación en cualquier despliegue público.
- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado principalmente en inglés, es esperable un sesgo cultural anglosajón, pero no está confirmado.
- Riesgo de alucinación: no cuantificado; como modelo generativo de ficción, la coherencia factual no es su objetivo principal.
- Limitación idiomática: solo inglés declarado; el rendimiento en castellano no está garantizado ni evaluado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas sin consultar la model card del modelo base.
- Compatibilidad de runtime restringida: el repositorio está etiquetado para ik_llama.cpp; no se confirma que funcione en llama.cpp estándar u otros motores, lo que limita las opciones de despliegue.
- Licencia Apache 2.0 declarada, pero conviene verificar la licencia del modelo base SubMaroon/Kitchoon-Final-26B-A4B, ya que las obligaciones de atribución y las restricciones de uso pueden heredarse del modelo original.
- El repositorio no incluye la model card completa del modelo base; la información sobre entrenamiento, contexto y evaluación es escasa, lo que dificulta una evaluación rigurosa previa a producción.
- El número de descargas (837) y de likes (1) es bajo, lo que sugiere poca validación comunitaria del artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Austriani/Kitchoon-Final-26B-A4B-RP-ik_llama.cpp
- Modelo base: https://huggingface.co/SubMaroon/Kitchoon-Final-26B-A4B
- ik_llama.cpp (runtime): no se proporciona enlace en la información disponible
- Paper, blog o demo: no disponibles en la información proporcionada
