# bartowski/Husky110_Lunar-Huntress-0.1-GGUF

## Resumen

Husky110_Lunar-Huntress-0.1 es un modelo de lenguaje de 30.697.345.596 parámetros (aproximadamente 31B) orientado a generación de texto creativo, roleplay y conversación de acompañamiento. Se trata de un merge construido con mergekit mediante el método TIES (Trim, Elect, Sign) sobre la familia Gemma 4, según indican las etiquetas y la model card del autor original Husky110. Esta ficha documenta específicamente la versión cuantizada en formato GGUF publicada por bartowski, que es la vía práctica de despliegue para este modelo.

El modelo no es un lanzamiento de un laboratorio con informe técnico, sino un merge comunitario especializado en escritura creativa y roleplay adulto (etiquetas nsfw y adult-content). Su relevancia actual reside en que ofrece una alternativa de pesos abiertos bajo licencia Apache 2.0 para casos de uso conversacionales donde los modelos alineados de forma restrictiva resultan demasiado limitados, y en que bartowski ha generado un conjunto completo de cuantizaciones con imatrix (desde IQ3_M hasta Q8_0 y BF16) optimizadas con llama.cpp.

La información disponible es escasa: no hay datos de composición del dataset de entrenamiento, número de tokens, benchmarks publicados ni lista de idiomas soportados. Todo lo que sigue se limita a lo verificable en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, según etiquetas); detalles internos no disponibles |
| Parámetros totales | 30.697.345.596 (~31B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0, IQ4_XS, IQ3_M, Q3_K_L, Q3_K_M (y posteriores de menor tamaño en el repo) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones) y BF16 GGUF; safetensors del modelo base original |

## Arquitectura y entrenamiento

El modelo base es un merge generado con mergekit usando el método TIES, que combina los pesos de varios checkpoints resolviendo conflictos mediante el recorte de parámetros redundantes, la elección de signos consistentes y la fusión ponderada. Las etiquetas indican que los modelos de origen pertenecen a la familia Gemma 4, aunque no se especifica qué checkpoints concretos se fusionaron ni con qué pesos. No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o fine-tuning supervisado posteriores al merge.

La model card de la versión GGUF confirma que la cuantización se realizó con llama.cpp release b11913 y que se empleó una matriz de importancia (imatrix) para mejorar la calidad de las cuantizaciones de baja precisión. No se emplea decodificación especulativa. El formato de prompt documentado incluye tokens especiales de turno (`<|turn>`, `<turn|>`, `<|channel>thought`, `<channel|>`) y un bloque específico para declaración de herramientas (`<|tool>declaration:...<tool|>`), lo que sugiere soporte de tool calling en el formato nativo.

## Capacidades

- Generación de texto conversacional y creativo: roleplay, escritura de ficción y diálogo multi-turno, que es el objetivo declarado del merge.
- Contenido para adultos y NSFW: el modelo está etiquetado explícitamente como adult-content y not-for-all-audiences.
- Tool calling / function calling: el formato de prompt documentado incluye una sintaxis para declarar herramientas con parámetros tipados (objetos, strings, campos requeridos).
- Modo de razonamiento con canal `thought`: el template incluye un canal de pensamiento previo a la respuesta.
- Entrada multimodal: la model card indica únicamente soporte de entrada de texto.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de código, matemáticas o agentes multi-paso: no documentadas.

## Casos de uso

- Roleplay y compañía conversacional: el modelo está entrenado y fusionado específicamente para mantener personajes consistentes en conversaciones largas, con un template que separa system prompt, turnos de usuario y respuestas del modelo, lo que facilita la gestión de personas.
- Escritura creativa de ficción: generación de narrativa, diálogos y descripciones con un tono menos restrictivo que los modelos alineados comercialmente, adecuado para autores que necesitan borradores sin filtros de contenido.
- Generación de contenido para adultos: aplicaciones de ficción interactiva o narrativa erótica donde la licencia Apache 2.0 permite uso comercial sin royalties.
- Prototipado de asistentes con tool calling: el formato de declaración de herramientas permite integrarlo en pipelines donde el modelo deba invocar funciones (por ejemplo, consultas a APIs) antes de responder.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (19,52 GB) e IQ4_XS (17,23 GB) permiten ejecutar el modelo en GPUs de consumo con 24 GB de VRAM, útil para desarrolladores que quieren un modelo de 31B sin depender de la nube.
- Experimentación en investigación sobre merges: al ser un merge TIES de la familia Gemma 4, sirve como caso de estudio reproducible para evaluar cómo afecta la fusión de checkpoints al comportamiento conversacional.
- Fine-tuning posterior: al estar disponible en BF16 GGUF y con licencia Apache 2.0, puede servir de base para ajustes específicos de dominio o estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto): IQ3_M ~16,4 GB; IQ4_XS ~17,2 GB; Q4_K_M ~19,5 GB; Q5_K_M ~23,5 GB; Q6_K ~27 GB; Q8_0 ~32,6 GB; BF16 ~61,4 GB.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4 y Q5; RTX 3090 (24 GB) equivalente; A100 40 GB o H100 para Q6_K, Q8_0 y BF16.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB con cuantizaciones Q4_K_M o inferiores; en tarjetas de 16 GB solo con IQ3_M y recortando contexto; en 12 GB no cabe completo y requeriría offloading a CPU.
- Opciones de despliegue: llama.cpp (versión b11913 o superior, usada para generar las cuantizaciones), Ollama, LM Studio, y servidores compatibles con GGUF; los tags indican endpoints_compatible.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Husky110_Lunar-Huntress-0.1 (esta ficha) | ~31B | No disponible | Apache 2.0 | GGUF, safetensors | Merge TIES de Gemma 4, orientado a roleplay y NSFW |
| Modelos Gemma 4 originales | No disponible | No disponible | Términos Gemma (no verificados aquí) | Safetensors, GGUF | Base sobre la que se construye el merge; alineación más restrictiva |
| Alternativas de roleplay comunitarias de ~30B | No disponible | No disponible | Variable | GGUF | No se dispone de datos verificables en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un merge comunitario sin informe de evaluación, no hay análisis de sesgos publicado.
- Riesgo de alucinación: no evaluado; los modelos de roleplay y escritura creativa priorizan coherencia narrativa sobre veracidad factual.
- Contenido adulto: el modelo está etiquetado como nsfw y not-for-all-audiences; no es adecuado para aplicaciones dirigidas a menores ni para entornos sin moderación.
- Idiomas: no se especifica la cobertura lingüística; el rendimiento en castellano no está verificado.
- Contexto: la longitud máxima de contexto no está documentada, lo que impide planificar cargas de trabajo con ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que los checkpoints de origen del merge (Gemma 4) no impongan restricciones adicionales que prevalezcan sobre la licencia declarada.
- Producción: sin benchmarks ni evaluación de calidad, no se recomienda su uso en sistemas críticos sin una validación propia previa.
- Formato de prompt: requiere respetar los tokens especiales de turno y canal; un template incorrecto degrada la calidad de forma notable.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/Husky110_Lunar-Huntress-0.1-GGUF
- Modelo base original: https://huggingface.co/Husky110/Lunar-Huntress-0.1
- Cuantización recomendada Q4_K_M: https://huggingface.co/bartowski/Husky110_Lunar-Huntress-0.1-GGUF/blob/main/Husky110_Lunar-Huntress-0.1-Q4_K_M.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp usada (b11913): https://github.com/ggml-org/llama.cpp/releases/tag/b11913
