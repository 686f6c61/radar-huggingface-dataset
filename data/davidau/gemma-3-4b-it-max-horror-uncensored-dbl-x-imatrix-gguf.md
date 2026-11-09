# DavidAU/Gemma-3-4b-it-MAX-HORROR-Uncensored-DBL-X-Imatrix-GGUF

## Resumen

Gemma-3-4b-it-MAX-HORROR-Uncensored-DBL-X-Imatrix-GGUF es una cuantización GGUF publicada por DavidAU sobre su propio fine-tune no censurado del modelo Gemma 3 4B instruct de Google. El autor ha eliminado los mecanismos de rechazo del modelo original centrándose en las capas finales, ha añadido cuatro capas adicionales a la arquitectura base y ha aplicado una "imatrix" de horror construida a partir de su modelo Grand Horror 16B para sesgar el estilo generativo hacia narrativa de terror, ficción visceral y roleplay sin filtros. El resultado es un modelo de 4.257.793.536 parámetros (4B) con ventana de contexto de 128.000 tokens, licencia Apache 2.0 y pesos en formato GGUF listos para llama.cpp y derivados.

El modelo está pensado para escritura creativa de ficción, generación de tramas y subtramas, continuación de escenas, roleplay conversacional y lluvia de ideas, con un sesgo explícito hacia contenido R/X-rated, lenguaje soez y horror corporal. No es un modelo de propósito general: el autor lo etiqueta como "not-for-all-audiences" y advierte de que el contenido generado puede ser gráfico y explícito. La relevancia actual radica en que demuestra hasta dónde llega el ecosistema de fine-tunes comunitarios sobre Gemma 3 y cómo las técnicas de imatrix y "MAXing" (mantener embeddings y tensor de salida en BF16 en todas las cuantizaciones) permiten conservar calidad en cuantizaciones agresivas de 4 bits.

El repositorio ocupa 77,5 GB e incluye múltiples variantes de cuantización (IQ4XS, IQ4NL, Q4_0, Q4s, Q5_0, Q5s, Q6, Q8_0 y F16, entre otras), lo que facilita su despliegue desde GPUs de consumo hasta servidores. La información pública no incluye detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni resultados de benchmarks estandarizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con 4 capas adicionales añadidas por el autor |
| Parametros totales | 4.257.793.536 (4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | IQ4XS, IQ4NL, Q4_0, Q4s, Q5_0, Q5s, Q6, Q8_0, F16 (según model card) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con embeddings y tensor de salida en BF16 en todas las cuantizaciones, técnica "MAX") |

## Arquitectura y entrenamiento

La base es Gemma 3 4B instruct, un transformer decoder-only de Google con atención multi-cabeza estándar y ventana de contexto de 128k tokens. Sobre esa base, DavidAU aplica un proceso de descensura centrado en las capas finales, lo que según el autor preserva la capacidad de seguir instrucciones mientras elimina los rechazos del modelo original. Además, añade cuatro capas a la arquitectura, aunque la model card no especifica su posición exacta ni el impacto paramétrico de ese añadido (el recuento total reportado, 4.257.793.536, coincide con el de un Gemma 3 4B estándar, por lo que el detalle de las capas extra no está documentado con precisión).

El entrenamiento combina el fine-tune del modelo base DavidAU/Gemma-3-4b-it-Uncensored-DBL-X con una imatrix de horror generada a partir de Grand Horror 16B, también del mismo autor. Esa imatrix se usa para guiar la cuantización de forma que se preserven mejor las conexiones semánticas asociadas al terror y la ficción oscura, y según la model card mejora también el seguimiento de instrucciones y la calidad general de salida. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. La técnica "MAX" consiste en mantener los tensores de embedding y de salida en BF16 en todas las cuantizaciones, a costa de un mayor tamaño de archivo, para mejorar profundidad y calidad de generación.

## Capacidades

- Generación de texto narrativo: ficción, terror, horror corporal, tramas y subtramas, continuación de escenas y storytelling.
- Roleplay conversacional multi-turno con ventana de 128k tokens.
- Escritura creativa sin censura: el modelo acepta contenido R-rated y X-rated, lenguaje soez y temáticas explícitas cuando se le induce con el system prompt adecuado.
- Seguimiento de instrucciones y resolución de problemas generales, con soporte declarado para function calling en las etiquetas del repositorio.
- Lluvia de ideas, resolución de acertijos y razonamiento creativo.
- Capacidad multilingüe: no disponible más allá del inglés declarado.
- No se declaran capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Escritura de ficción de terror: el modelo está sesgado mediante imatrix hacia narrativa oscura, por lo que resulta adecuado para generar relatos de horror, descripciones viscerales y atmósferas opresivas con coherencia estilística a lo largo de capítulos largos gracias a los 128k tokens de contexto.
- Roleplay narrativo sin restricciones: en entornos de ficción interactiva o juegos de rol por texto, el modelo mantiene personajes y arcos argumentales durante conversaciones extensas y acepta temáticas adultas que los modelos alineados rechazan.
- Generación de tramas y subtramas para guionistas: se puede usar como generador de ideas y estructuras narrativas (plot y sub-plot generation) en fases de preproducción, con la ventaja de que no bloquea premisas oscuras o controvertidas.
- Continuación de escenas en pipelines editoriales: integrado en herramientas de escritura asistida, permite continuar un manuscrito manteniendo tono y voz, con control fino mediante temperatura (0,8-2,5) y repetición (1,06-1,1) según recomienda el autor.
- Prototipado de asistentes de chat con personalidad: para desarrolladores que necesitan un modelo pequeño (4B) que quepa en GPU de consumo y responda con un registro soez o agresivo sin rechazos, útil en demos de personajes o bots temáticos.
- Investigación sobre alineación y descensura: sirve como caso de estudio de cómo se modifica un modelo instruct de Google a nivel de capas finales y de cómo una imatrix temática altera el estilo de salida, útil para estudiar robustez de filtros y evaluación de sesgos.
- Despliegue en dispositivos con recursos limitados: las variantes Q4_0 y Q5_0 están pensadas para telefonía y hardware portátil, lo que permite llevar generación creativa offline a entornos sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona una velocidad aproximada de 56 tokens por segundo con la cuantización IQ4XS en una "tarjeta de gama media" no especificada, sin detallar el hardware exacto ni el prompt utilizado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB para cuantizaciones Q4 (IQ4XS, Q4_0), 3,5-4,5 GB para Q5, 5-6 GB para Q6, 7-8 GB para Q8_0 y alrededor de 9 GB para F16 (estimaciones a partir de 4,26B parámetros; no publicadas por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100 o H100 para F16 y despliegues con concurrencia alta.
- Cabe en GPU de consumo: sí, desde una GTX 1660 6 GB o RTX 3050 8 GB con Q4, y cómodamente en RTX 3060 12 GB o superiores con Q5-Q8.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp y cualquier runtime compatible con GGUF; no se menciona soporte específico de vLLM o TGI para este repositorio (vLLM soporta GGUF de forma experimental, pero no está documentado aquí).
- Latencia y throughput: 56 tokens/s con IQ4XS en una GPU de gama media según el autor; el resto de combinaciones no están documentadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-3-4b-it-MAX-HORROR-Uncensored-DBL-X-Imatrix-GGUF | 4,26B | 128k | Apache 2.0 | Fine-tune no censurado con imatrix de horror, GGUF | Hugging Face |
| DavidAU/Gemma-3-4b-it-Uncensored-DBL-X | 4,26B | 128k | Apache 2.0 | Modelo base del anterior, sin imatrix de horror ni "MAX" | Hugging Face |
| Google Gemma 3 4B IT | 4,26B | 128k | Gemma Terms of Use | Instruct alineado, rechaza contenido explícito | Hugging Face, AI Studio |
| Grand Horror 16B (DavidAU) | 16B | no disponible | no disponible | Modelo de horror usado para construir la imatrix | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar rendimiento cuantitativo entre estas variantes.

## Limitaciones y advertencias

- Contenido explícito: el modelo está diseñado para generar material R/X-rated, violencia gráfica, lenguaje soez y horror corporal; no es apto para menores ni para entornos laborales sin control.
- Riesgo de alucinación: al ser un fine-tune de 4B sin benchmarks publicados, la fiabilidad factual no está verificada y puede degradarse respecto al Gemma 3 original, especialmente en tareas de conocimiento.
- Descensura parcial: el autor advierte de que pueden aparecer rechazos ocasionales si no se usa el system prompt de "jailbreak"; también pueden surgir errores de mayúsculas o caracteres extraños a temperaturas altas, que requieren regenerar.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otras lenguas no está documentado y probablemente sea deficiente.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Gemma 3 de Google está sujeto a los Gemma Terms of Use, y el contenido generado puede infringir políticas de plataformas o legislación sobre material explícito; conviene revisar la cadena de licencias antes de desplegar en producción.
- Sesgos: no se documentan evaluaciones de sesgo; un modelo descensurado tiende a reproducir estereotipos y contenido dañino sin filtro.
- Estabilidad: la adición de cuatro capas y el proceso de descensura no están descritos técnicamente, lo que dificulta auditar el comportamiento en producción.
- Contexto: aunque se anuncian 128k tokens, no hay evidencia publicada de que el fine-tune conserve la calidad de atención en ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Gemma-3-4b-it-MAX-HORROR-Uncensored-DBL-X-Imatrix-GGUF
- Modelo base del fine-tune: https://huggingface.co/DavidAU/Gemma-3-4b-it-Uncensored-DBL-X
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte: https://huggingface.co/DavidAU/support
- Preset de system prompt de referencia (Sukino): https://huggingface.co/Sukino/SillyTavern-Settings-and-Presets#jailbreak-for-gemma-2-9b-it
- Gemma 3 de Google (modelo original): no disponible en la información proporcionada
