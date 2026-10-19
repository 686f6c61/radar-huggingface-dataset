# ReadyArt/Swish-26B-A4B-GGUF

## Resumen

Swish-26B-A4B-GGUF es la distribución en formato GGUF del modelo ReadyArt/Swish-26B-A4B, un ajuste fino orientado a rol conversacional para adultos, ficción explícita, terror y violencia, publicado por el usuario ReadyArt (Ready.Art) bajo licencia Apache 2.0. El repositorio no incluye pesos en safetensors, sino únicamente cuantizaciones GGUF pensadas para inferencia local con llama.cpp y derivados (Ollama, LM Studio), lo que lo hace desplegable en hardware de consumo.

La model card del repositorio es fundamentalmente una hoja de estilo CSS con temática «waifu» y no documenta arquitectura, dataset de entrenamiento, longitud de contexto ni resultados de evaluación. La única información estructural fiable procede del propio nombre del modelo y de las etiquetas: «26B-A4B» sigue la convención habitual de mezcla de expertos (MoE) con 26 000 millones de parámetros totales y aproximadamente 4000 millones activos por token.

El interés práctico del modelo es acotado pero claro: cubre un nicho (roleplay sin alineación, contenido NSFW explícito) con un tamaño que, gracias a la activación dispersa, puede ejecutarse en GPU de consumo si se aceptan cuantizaciones agresivas. Ahora bien, con 0 descargas y 0 likes en el momento de la consulta y sin documentación técnica verificable, debe tratarse como un artefacto de nicho sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la model card. La convención de nombre «26B-A4B» sugiere mezcla de expertos (MoE); el modelo hermano Serenity-26B-A4B aparece etiquetado con `gemma-4` en los resultados de búsqueda, lo que apunta a una base Gemma 4, sin confirmación oficial |
| Parámetros totales | 26 000 millones (según el nombre del modelo) |
| Parámetros activos | ~4000 millones (según el sufijo «A4B» del nombre) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF; los niveles concretos (Q4_K_M, Q5_K_M, Q8_0, etc.) no se detallan en la información proporcionada |
| Idiomas soportados | Inglés (`en`) únicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantización); el modelo base ReadyArt/Swish-26B-A4B se distribuye aparte |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la model card del repositorio, que consiste en su práctica totalidad en código CSS de personalización visual. Por la nomenclatura y por la familia de modelos del mismo autor (Serenity-26B-A4B, etiquetado con `gemma-4` y `gemma`), es razonable inferir una base Gemma 4 en configuración MoE de 26B totales con ~4B activos, pero esta inferencia no está confirmada por el autor en la información disponible.

Tampoco hay datos sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO o técnicas de post-entrenamiento. Las etiquetas `unaligned` y `nsfw` indican que el ajuste se orientó deliberadamente a reducir o eliminar el alineamiento de seguridad del modelo base, algo coherente con el caso de uso declarado (ERP, contenido explícito, terror y violencia). No se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto en inglés con registro narrativo y conversacional.
- Roleplay multi-turno y mantenimiento de personaje, según el caso de uso declarado por el autor.
- Contenido explícito adulto (ERP, erótica) sin filtros de alineación, según las etiquetas `nsfw`, `explicit`, `Erotic`, `unaligned`.
- Ficción de terror y descripciones de violencia explícita (etiquetas `Horror`, `Violence`).
- Escritura creativa de formato largo: relatos, diálogos, descripciones de escena.
- No hay evidencia de soporte de tool calling, function calling ni comportamiento agéntico.
- No hay evidencia de capacidades de visión, audio ni modo «thinking».
- Multilingüe: no; la ficha declara únicamente inglés.

## Casos de uso

- Roleplay conversacional local: el modelo está ajustado específicamente para mantener personajes y contexto narrativo en conversaciones multi-turno, y su formato GGUF permite ejecutarlo en un equipo personal sin enviar datos a terceros.
- Ficción explícita para adultos: generación y continuación de narrativa erótica sin rechazos por contenido, un nicho que los modelos alineados comerciales no cubren.
- Escritura de terror y escenas violentas: útil para guionistas o autores que necesitan descripciones crudas sin las atenuaciones típicas de los modelos con RLHF.
- Prototipado de personajes para videojuegos narrativos: permite iterar diálogos de NPC con personalidad marcada antes de invertir en un modelo mayor o en un ajuste propio.
- Investigación sobre alineamiento y seguridad: sirve como contrapunto «unaligned» en estudios comparativos sobre tasas de rechazo, toxicidad y deriva de personaje frente a modelos alineados del mismo tamaño.
- Base para ajustes finos posteriores: al ser Apache 2.0 y estar en GGUF, se puede partir del modelo base en safetensors y aplicar LoRA específicos de dominio sin restricciones de licencia.
- Generación de contenido para comunidades de rol escrito: integrable en bots de Discord o Telegram mediante llama.cpp como backend, con coste marginal cero por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tabla de evaluaciones y el autor no referencia puntuaciones en MMLU, HumanEval, GSM8K ni en el leaderboard Caliper Bench (especializado en escritura creativa y rol), pese a que dicho leaderboard aparece en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones derivadas del recuento de 26B parámetros totales, no publicadas por el autor): ~16-17 GB en Q4_K_M, ~19-20 GB en Q5_K_M, ~28 GB en Q8_0, ~52 GB en FP16.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para cuantizaciones Q4/Q5; A6000 (48 GB), A100 40/80 GB o H100 para Q8 y FP16.
- Cabe en GPU de consumo: sí, en Q4_K_M dentro de 24 GB. En tarjetas de 12-16 GB requeriría offloading parcial de capas a CPU, con la penalización de velocidad correspondiente.
- Al ser MoE con ~4B activos, el coste computacional por token es mucho menor que el de un modelo denso de 26B; el cuello de botella es el ancho de banda de memoria para cargar expertos, no el cómputo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python. vLLM y TGI no soportan GGUF de forma nativa generalizada; para esos motores habría que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReadyArt/Swish-26B-A4B-GGUF | 26B totales / ~4B activos (según nombre) | No disponible | Roleplay NSFW, terror, violencia | Apache 2.0 | GGUF; 0 descargas, 0 likes |
| ReadyArt/Serenity-26B-A4B | 26B totales / ~4B activos | No disponible | Roleplay conversacional, adulto, `unaligned` | Apache 2.0 | Safetensors y GGUF; etiquetado `gemma-4` |
| ReadyArt/Melody1437-26B-A4B-GGUF | 26B | No disponible | Modelo especializado | No verificada en la información disponible | GGUF; ~8,1K descargas según aimarketcap.tech |

Las tres alternativas proceden del mismo autor y comparten familia y tamaño, por lo que la comparación real se reduce a diferencias de ajuste fino y estilo narrativo, no a capacidades estructurales. No se dispone de comparaciones con modelos de otros autores (por ejemplo, densos de 24-27B orientados a rol) porque no hay datos de benchmarks que permitan establecer una equivalencia objetiva.

## Limitaciones y advertencias

- Contenido explícito y potencialmente perturbador: el modelo está etiquetado `nsfw`, `explicit`, `Violence`, `Horror` y `not-for-all-audiences`; no es apto para productos de consumo general ni para entornos sin control de edad.
- Ausencia de alineamiento: la etiqueta `unaligned` implica que no se ha aplicado RLHF de seguridad; puede producir contenido dañino, ilegal o sexualmente explícito sin rechazo, lo que traslada toda la responsabilidad de filtrado al integrador.
- Solo inglés: no hay soporte declarado de castellano ni de otros idiomas, por lo que su uso en productos en español requeriría ajuste fino adicional.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluaciones publicadas que cuantifiquen la tasa de error ni la fidelidad factual en este ajuste concreto.
- Sesgos: no documentados por el autor. La combinación de `unaligned` con datos de rol puede amplificar estereotipos de género y representaciones sexuales sesgadas.
- Documentación inexistente: la model card no describe arquitectura, entrenamiento ni contexto, lo que impide auditar el modelo o reproducir su comportamiento.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta; no hay informes de terceros sobre calidad o estabilidad.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base subyacente (posiblemente Gemma 4) puede imponer condiciones adicionales; conviene verificar los términos de la base antes de explotarlo comercialmente.
- Formato GGUF exclusivo: no hay safetensors en este repositorio, lo que limita el despliegue en motores de alta concurrencia como vLLM o TGI sin recurrir al modelo base.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/ReadyArt/Swish-26B-A4B-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Swish-26B-A4B
- Modelo hermano Serenity-26B-A4B: https://huggingface.co/ReadyArt/Serenity-26B-A4B
- Modelo hermano Serenity-26B-A4B-GGUF: https://huggingface.co/ReadyArt/Serenity-26B-A4B-GGUF
- Índice de modelos de ReadyArt con hashes por archivo: https://modelindex.dev/orgs/ReadyArt
- Ficha del proveedor en AI Market Cap: https://aimarketcap.tech/providers/readyart
- Leaderboard Caliper Bench (escritura creativa y rol): https://caliperbench.com/
