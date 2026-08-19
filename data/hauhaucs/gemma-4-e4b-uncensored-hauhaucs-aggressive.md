# HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive

## Resumen

Gemma-4-E4B-Uncensored-HauhauCS-Aggressive es una variante sin censura del modelo multimodal Gemma 4 E4B-IT de Google, desarrollada por HauhauCS mediante la técnica de abliteración. El proceso elimina las capas de rechazo del modelo original, logrando un 0 % de negativas (0/465 refusals) sin modificar las capacidades funcionales ni los datos de entrenamiento. Con 4 000 millones de parámetros, 42 capas y una ventana de contexto de 131 000 tokens, mantiene la naturaleza multimodal del base: texto, imagen, vídeo y audio.

La relevancia de este modelo radica en que ofrece una alternativa sin restricciones para desarrolladores que necesitan un LLM capaz de generar contenido sin filtros de seguridad, manteniendo la calidad del modelo original de Google. Se distribuye exclusivamente en formato GGUF con cuantizaciones personalizadas K_P, optimizadas con matriz de importancia (imatrix) para preservar la calidad tras la abliteración. Es compatible con los principales runtimes GGUF como llama.cpp, LM Studio y Ollama.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención mixta: sliding window (512 tokens) + full attention |
| Parametros totales | 4 000 millones (4B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 131 072 tokens (131K) |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, Q2_K_P (todas en GGUF) + mmproj f16 para visión/audio |
| Idiomas soportados | inglés y multilingüe |
| Licencia | Gemma (Google) |
| Formato de pesos | GGUF (safetensors no disponible) |

## Arquitectura y entrenamiento

El modelo se basa en google/gemma-4-e4b-it, un modelo denso de 4B parámetros con 42 capas y un diseño de atención híbrido: capas con ventana deslizante de 512 tokens combinadas con capas de atención completa, lo que permite manejar contextos largos de 131K tokens con un uso eficiente de memoria (18 capas comparten KV cache). Es nativamente multimodal, procesando texto, imagen, vídeo y audio mediante un proyector multimodal que se distribuye como archivo mmproj separado.

La modificación principal consiste en la abliteración, una técnica que identifica y elimina las direcciones de activación responsables del comportamiento de rechazo en el modelo base. No se realizaron cambios en los pesos funcionales ni en los datos de entrenamiento, por lo que las capacidades originales se conservan íntegramente. No se dispone de información pública sobre el entrenamiento original del modelo base (número de tokens, composición del dataset o uso de RLHF/DPO). La variante "Aggressive" aplica un uncensoring más fuerte que la futura variante "Balanced", eliminando por completo los rechazos, aunque puede ocasionalmente añadir avisos breves derivados del entrenamiento base.

## Capacidades

- Generación de texto sin rechazos: responde a cualquier solicitud sin negarse, incluyendo contenido que el modelo base consideraría inapropiado.
- Multimodalidad nativa: procesa imágenes, vídeo y audio además de texto, gracias al proyector multimodal incluido (mmproj).
- Conversación multi-turno: mantiene diálogos largos con contexto de hasta 131K tokens.
- Comprensión multilingüe: soporta inglés y otros idiomas, aunque el rendimiento fuera del inglés no está documentado.
- Razonamiento y conocimiento general: hereda las capacidades del modelo Gemma 4 E4B-IT, incluyendo tareas de razonamiento, matemáticas y conocimiento enciclopédico.
- Compatibilidad con runtimes GGUF: funciona con llama.cpp, LM Studio, Jan, koboldcpp y otros, sin necesidad de builds especiales.

## Casos de uso

- Generación creativa sin restricciones: escritura de ficción, poesía, guiones o narrativa que aborde temas tabú o controvertidos sin filtros de seguridad. El modelo no rechaza solicitudes y genera contenido completo.
- Análisis de imágenes y vídeo: gracias al soporte multimodal, puede describir o analizar contenido visual en contextos donde se requiere una interpretación sin sesgos de seguridad, como investigación académica sobre medios.
- Transcripción y comprensión de audio: procesa entradas de audio para generar transcripciones o resúmenes, útil en entornos donde el contenido puede ser sensible o explícito.
- Asistente conversacional personalizado: integración en aplicaciones de chat donde se requiere una respuesta ininterrumpida a cualquier pregunta, por ejemplo en demos de investigación sobre comportamientos de modelos sin alineación.
- Evaluación de técnicas de abliteración: investigadores pueden comparar el comportamiento de este modelo frente al base para estudiar los efectos de eliminar capas de rechazo.
- Pruebas de robustez y jailbreak: desarrolladores de seguridad pueden utilizarlo para evaluar qué tan efectivas son las técnicas de abliteración y cómo se comportan los modelos sin guardarraíles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para esta variante. Se asume que el rendimiento es similar al del modelo base google/gemma-4-e4b-it, pero no se dispone de cifras verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: los quants oscilan entre 4,2 GB (Q2_K_P) y 7,6 GB (Q8_K_P). El archivo mmproj añade 945 MB adicionales.
- GPU recomendadas: para cuantizaciones Q4 y superiores, una GPU con 8 GB de VRAM es suficiente (p. ej., RTX 3060, RTX 4060). Para Q8 o contexto máximo, se recomienda 12-16 GB (RTX 4070, RTX 4080, RTX 4090).
- Compatibilidad con GPU de consumo: sí, todas las cuantizaciones caben en GPUs consumer de gama media y alta.
- Opciones de despliegue: llama.cpp (con flag `--jinja` para chat template), LM Studio, Ollama, Jan, koboldcpp. También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Latencia y throughput: no se dispone de mediciones específicas. Como referencia, un modelo de 4B en Q4_K_M en una RTX 4090 suele alcanzar entre 50-100 tokens/s, pero no hay datos confirmados para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Censura | Licencia |
|---|---|---|---|---|---|
| Gemma-4-E4B-Uncensored-HauhauCS-Aggressive | 4B | 131K | Sí (texto, imagen, vídeo, audio) | Sin rechazos | Gemma |
| google/gemma-4-e4b-it (base) | 4B | 131K | Sí (texto, imagen, vídeo, audio) | Con rechazos | Gemma |
| Dolphin 2.x (variantes uncensored de otros modelos) | variable | variable | depende | Sin rechazos | variable |

No se dispone de datos comparativos de rendimiento entre estas opciones. La principal diferencia frente al modelo base es la ausencia de rechazos; frente a otros modelos uncensored, la ventaja es la multimodalidad nativa y el contexto de 131K, poco común en modelos de 4B.

## Limitaciones y advertencias

- Contenido potencialmente dañino: al eliminar los rechazos, el modelo puede generar contenido ofensivo, ilegal o peligroso. Su uso en producción requiere medidas de control adicionales.
- Sesgos del modelo base: hereda los sesgos presentes en Gemma 4 E4B-IT, que no han sido mitigados.
- Riesgo de alucinación: como cualquier LLM, puede inventar información, especialmente en contextos largos o temas especializados.
- Licencia Gemma: la licencia de Google permite uso comercial pero incluye restricciones sobre usos prohibidos (por ejemplo, ciertos ámbitos de alto riesgo). Es responsabilidad del usuario revisar los términos completos.
- Sin garantías de calidad: al ser una modificación no oficial, no hay soporte de Google y no se han publicado evaluaciones exhaustivas.
- Dependencia del archivo mmproj: para funcionalidad multimodal es necesario descargar el proyector adicional, que no está incluido en todos los quants.
- Variante "Aggressive": puede ocasionalmente añadir avisos breves, aunque no son rechazos. La variante "Balanced" (más conservadora) aún no está disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive
- Modelo base: https://huggingface.co/google/gemma-4-e4b-it
- Mirror en Hugging Face: https://huggingface.co/ATOMIKMN/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive
- Versión en Ollama: https://ollama.com/fredrezones55/Gemma-4-Uncensored-HauhauCS-Aggressive
- Comunidad Discord del autor: https://discord.gg/SZ5vacTXYf
