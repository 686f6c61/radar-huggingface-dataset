# DavidAU/MN-GRAND-Gutenberg-Lyra4-Lyra-12B-MADNESS

## Resumen

MN-GRAND-Gutenberg-Lyra4-Lyra-12B-MADNESS es un modelo de lenguaje de tipo merge creado por DavidAU, un autor conocido en Hugging Face por publicar fusiones de modelos mediante mergekit. El modelo parte de una base Mistral y combina pesos de otros modelos (presumiblemente variantes de la familia Lyra y Gutenberg) para dar lugar a un modelo conversacional de 12.247.782.400 parámetros (aproximadamente 12,2 mil millones). Se distribuye en formato safetensors de precisión completa, pensado para generar cuantizaciones GGUF, GPTQ, EXL2, AWQ o HQQ, y también para uso directo con transformers.

El modelo se publicó en octubre de 2024 y se ha actualizado hasta noviembre de 2026. Su relevancia es limitada dentro del ecosistema: acumula 24 descargas y 5 likes, lo que indica un uso muy minoritario. No es un modelo de referencia ni compite con lanzamientos de laboratorios consolidados; es una fusión experimental orientada a generación de texto y conversación, probablemente con fines de rol o escritura creativa, dado el perfil habitual de las publicaciones de DavidAU.

La información pública disponible es escasa: no se detallan la licencia, los idiomas soportados, la longitud de contexto ni los datos de entrenamiento. La model card remite a repositorios secundarios (GGUF y guías de parámetros) para obtener detalles adicionales, y buena parte del contenido es material promocional del autor más que documentación técnica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Mistral, según tags; detalles no disponibles) |
| Parámetros totales | 12.247.782.400 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | El repo fuente permite generar GGUF, GPTQ, EXL2, AWQ y HQQ; cuantizaciones publicadas en repos de terceros (GGUF, i1-GGUF) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (precisión completa) |

## Arquitectura y entrenamiento

El modelo es una fusión (merge) realizada con mergekit, según los tags del repositorio. La arquitectura subyacente es de tipo transformer con base Mistral, lo que implica atención causal estándar y un tokenizador compatible con la familia Mistral. El nombre sugiere la combinación de al menos dos linajes: "Gutenberg" y "Lyra4"/"Lyra", si bien la model card no documenta explícitamente los modelos de origen ni la receta de fusión (método, pesos por capa, etc.).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino supervisado, RLHF o DPO. Al tratarse de un merge, no hay entrenamiento desde cero: los pesos proceden de los modelos fusionados. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido. La model card se centra en recomendaciones de parámetros y samplers, no en detalles arquitectónicos.

## Capacidades

- Generación de texto conversacional y narrativo, orientada a diálogo multi-turno.
- Escritura creativa y de ficción, uso habitual en los merges de este autor.
- Compatible con text-generation-inference y endpoints compatibles, según los tags.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (visión, audio, thinking mode): no disponibles.
- Generación de código y matemáticas: no documentado; al ser un merge orientado a conversación, no es su foco previsible.

## Casos de uso

- Escritura creativa asistida: el modelo puede generar relatos, diálogos y descripciones con estilo consistente, aprovechando su naturaleza de fusión orientada a prosa; adecuado para borradores y experimentación literaria.
- Prototipado de chatbots conversacionales: sirve para montar un endpoint de generación de texto con transformers o TGI y probar flujos de conversación multi-turno antes de invertir en modelos mayores.
- Generación de personajes y roleplay: los merges de este autor suelen ajustarse a interacciones de rol; útil en entornos de ocio o demos, no en producción crítica.
- Experimentación con cuantizaciones: al publicarse en precisión completa, es un caso práctico para generar GGUF, GPTQ o EXL2 y comparar calidad y velocidad en hardware propio.
- Investigación sobre fusiones de modelos: permite estudiar el comportamiento de un merge Mistral de 12B frente a sus componentes, siempre que se localicen los modelos de origen.
- Generación de texto en local con llama.cpp u Ollama: usando las cuantizaciones GGUF de terceros, puede ejecutarse en equipos de consumo para tareas de escritura o chat sin conexión.
- Filtrado y reescritura de textos: tareas de paráfrasis o resumen de documentos cortos, con la cautela de verificar la fidelidad del contenido generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en precisión completa (fp16): aproximadamente 24,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 28-32 GB o más según contexto.
- Cuantización de 8 bits: en torno a 13-14 GB de VRAM.
- Cuantización de 4 bits (Q4_K_M, GPTQ 4-bit): en torno a 7-8 GB de VRAM.
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S o dos RTX 3090/4090 en paralelo.
- GPU de consumo: cabe en una RTX 4090 (24 GB) con cuantización de 8 bits o inferior; en 4 bits cabe en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) con contexto moderado.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM (previa conversión), llama.cpp y Ollama con los GGUF publicados por terceros.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MN-GRAND-Gutenberg-Lyra4-Lyra-12B-MADNESS | 12,2B | No disponible | No disponible | Hugging Face (repo propio y GGUF de terceros) |
| Mistral Nemo Instruct | 12B | 128K (según documentación del modelo base) | Apache 2.0 | Hugging Face, amplia adopción |
| Mistral 7B Instruct | 7,2B | 32K | Apache 2.0 | Hugging Face, amplia adopción |
| Modelos de merge de la comunidad (familia DavidAU) | Variable (7B-12B) | Variable | Habitualmente no declarada | Hugging Face |

La comparación con Mistral Nemo o Mistral 7B es pertinente por tamaño y linaje, pero conviene señalar que este merge no documenta contexto, licencia ni benchmarks, mientras que los modelos oficiales de Mistral sí lo hacen. En rendimiento medible no hay datos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no declarada: no hay garantía de uso comercial; conviene contactar con el autor o asumir riesgo legal antes de integrarlo en productos.
- Idiomas no declarados: el soporte multilingüe es incierto; probablemente esté sesgado hacia el inglés por los modelos base habituales.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin pruebas empíricas.
- Riesgo de alucinación: inherente a los modelos de 12B sin documentación de ajuste alineado; no hay datos de evaluación de fidelidad.
- Origen de los pesos opaco: al ser un merge sin receta documentada, es difícil auditar sesgos o trazas de los modelos de origen.
- Adopción mínima (24 descargas, 5 likes): escasa validación por parte de la comunidad; no hay informes independientes de calidad.
- Documentación promocional: la model card remite a guías de samplers y enlaces de apoyo del autor; no sustituye a una ficha técnica rigurosa.
- Sin benchmarks: no se puede afirmar su rendimiento en MMLU, HumanEval, GSM8K ni tareas equivalentes.
- Fecha de actualización futura (2026): conviene verificar que el repositorio no haya cambiado de contenido desde la consulta.

## Enlaces

- Repositorio principal: https://huggingface.co/DavidAU/MN-GRAND-Gutenberg-Lyra4-Lyra-12B-MADNESS
- GGUF del autor: https://huggingface.co/DavidAU/MN-GRAND-Gutenberg-Lyra4-Lyra-12B-MADNESS-GGUF
- GGUF de RichardErkhov: https://huggingface.co/RichardErkhov/DavidAU_-_MN-GRAND-Gutenberg-Lyra4-Lyra-12B-MADNESS-gguf
- GGUF i1 de mradermacher: https://huggingface.co/mradermacher/MN-GRAND-Gutenberg-Lyra4-Lyra-12B-MADNESS-i1-GGUF
- GGUF de mradermacher: https://huggingface.co/mradermacher/MN-GRAND-Gutenberg-Lyra4-Lyra-12B-MADNESS-GGUF
- Guía de parámetros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
