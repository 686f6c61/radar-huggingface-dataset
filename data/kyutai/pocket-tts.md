# kyutai/pocket-tts

## Resumen

Pocket TTS es un modelo de síntesis de voz (text-to-speech) desarrollado por Kyutai, laboratorio de investigación en IA de código abierto con sede en Francia y financiado por Iliad Group, CMA CGM Group y Schmidt Sciences. El modelo se publica en Hugging Face bajo el identificador `kyutai/pocket-tts` y se distribuye con licencia CC-BY-4.0, lo que permite uso comercial con atribución. El repositorio ocupa 53,8 GB y contiene pesos en formato safetensors, con acceso restringido que requiere aceptar condiciones en la plataforma.

La información disponible no detalla el número de parámetros, la longitud de contexto ni la arquitectura interna concreta de Pocket TTS; no obstante, el trabajo previo de Kyutai en esta línea (Kyutai TTS 1.6B, publicado en julio de 2025) se basa en la técnica de *delayed streams modeling*, que permite generar audio de forma streaming con baja latencia. Pocket TTS se etiqueta con soporte para inglés, francés, alemán, portugués, italiano y español, además de una referencia al paper arXiv:2509.06926.

El modelo resulta relevante por su carácter abierto y su licencia permisiva en un ámbito, el TTS, donde predominan soluciones propietarias o con restricciones de uso. Su orientación a despliegue ligero ("pocket") sugiere un enfoque hacia inferencia eficiente, aunque los datos técnicos concretos sobre tamaño y rendimiento no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la línea de investigación de Kyutai en TTS emplea *delayed streams modeling*) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés, francés, alemán, portugués, italiano, español |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna de Pocket TTS en los datos proporcionados. El contexto de Kyutai en síntesis de voz apunta al uso de *delayed streams modeling*, técnica presentada con Kyutai TTS 1.6B que permite modelar flujos de audio retrasados para generar habla en streaming. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

Tampoco se detallan innovaciones específicas de este modelo más allá de su etiqueta "pocket", que sugiere un diseño orientado a un tamaño reducido y despliegue eficiente. Cualquier afirmación adicional sobre arquitectura o entrenamiento sería especulativa y no se incluye.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada.
- Soporte multilingüe para inglés, francés, alemán, portugués, italiano y español.
- Generación de audio en formato compatible con la librería `pocket-tts` indicada en el repositorio.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documentan modos de razonamiento, visión ni audio de entrada.
- No se dispone de información sobre clonación de voz, control de estilo o emociones.

## Casos de uso

- Lectura de artículos y documentos: el modelo puede convertir texto en audio para aplicaciones de accesibilidad o consumo de contenido, aprovechando su soporte multilingüe para audiencias en seis idiomas.
- Asistentes de voz en aplicaciones móviles: su orientación "pocket" y su licencia CC-BY-4.0 facilitan la integración en apps comerciales que requieran síntesis de voz local o en servidor.
- Generación de audiolibros y pódcast: permite sintetizar narraciones largas en varios idiomas, aunque la longitud de contexto no está documentada y habría que trocear el texto.
- Sistemas de atención al cliente con respuesta hablada: puede emplearse como capa de vocalización de respuestas generadas por un LLM, siempre que se gestione la latencia de forma externa.
- Localización de contenidos multimedia: útil para doblar o generar pistas de audio en inglés, francés, alemán, portugués, italiano y español a partir de guiones de texto.
- Prototipado de interfaces conversacionales: investigadores pueden evaluar el modelo como componente TTS en pipelines de voz sin coste de licencia, gracias a CC-BY-4.0.
- Educación y aprendizaje de idiomas: generación de material auditivo en los seis idiomas soportados para prácticas de pronunciación y comprensión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el número de parámetros ni las cuantizaciones).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la librería indicada es `pocket-tts`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pocket TTS (Kyutai) | no disponible | no disponible | en, fr, de, pt, it, es | CC-BY-4.0 | Hugging Face (gated) |
| Kyutai TTS 1.6B | 1.600 M | no disponible | no disponible | no disponible en la información | Kyutai |
| Alternativas TTS abiertas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es *gated* y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Falta de especificaciones públicas: no se documentan parámetros, contexto ni cuantizaciones, lo que dificulta la planificación de despliegue.
- Idiomas: aunque se listan seis idiomas, la ficha de Hugging Face indica únicamente "en" en el campo de idiomas, lo que puede generar ambigüedad sobre la cobertura real.
- Riesgo de alucinación y artefactos de audio: no se documentan métricas de calidad ni evaluaciones subjetivas (MOS) que permitan anticipar fallos en pronunciación o prosodia.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero exige cumplir las condiciones de la licencia y citar adecuadamente al autor.
- Uso responsable: al ser un modelo de voz, existe riesgo de uso indebido para suplantación o generación de audio engañoso; no se documentan salvaguardas específicas.
- Producción: la ausencia de datos de latencia, throughput y requisitos de hardware impide garantizar un rendimiento adecuado sin pruebas previas.

## Enlaces

- Hugging Face: https://huggingface.co/kyutai/pocket-tts
- Kyutai (laboratorio): https://kyutai.org/
- Kyutai TTS: https://kyutai.org/next/tts/
- Paper referenciado: arXiv:2509.06926 (https://arxiv.org/abs/2509.06926)
- Información institucional sobre Kyutai: https://www.info.gouv.fr/actualite/kyutai-linnovation-en-ia-a-la-francaise
- Artículo sobre Kyutai en Les Numériques: https://www.lesnumeriques.com/intelligence-artificielle/kyutai-voici-le-projet-d-intelligence-artificielle-de-xavier-niel-n215189.html
- Artículo sobre la estructura comercial de Kyutai: https://www.linforme.com/tech-telecom/article/kyutai-le-labo-ia-a-but-non-lucratif-de-niel-schmidt-et-saade-lance-sa-structure-commerciale_7028.html
