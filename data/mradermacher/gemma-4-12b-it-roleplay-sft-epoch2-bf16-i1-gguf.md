# mradermacher/gemma-4-12b-it-roleplay-sft-epoch2-bf16-i1-GGUF

## Resumen

Este repositorio contiene una familia de cuantizaciones GGUF en formato i1 (con importance matrix) del modelo ChatoyantAI/gemma-4-12b-it-roleplay-sft-epoch2-bf16, un ajuste fino por supervisión (SFT) orientado a roleplay y conversación sobre una base Gemma de 12B en precisión bf16. El autor de la cuantización es mradermacher, un perfil conocido por publicar versiones cuantizadas de modelos abiertos con la herramienta de llama.cpp, y la licencia declarada es Apache 2.0, heredada del modelo base.

El modelo cuenta con 11.907.350.576 parámetros (aproximadamente 11,9 mil millones) y está etiquetado con `gemma4_unified` como tipo de arquitectura, además de las etiquetas `roleplay`, `conversational` y `sft`. Según la model card, se trata de un modelo con capacidades de visión, cuyos ficheros mmproj (proyector multimodal) se distribuyen en el repositorio de cuantizaciones estáticas del mismo autor, no en este repositorio i1. El idioma declarado es únicamente inglés.

La relevancia de esta ficha es práctica: permite ejecutar en hardware de consumo un ajuste fino especializado en interpretación de personajes y diálogo multi-turno, con hasta 24 variantes de cuantización que van desde 3,3 GB (IQ1_M) hasta 9,9 GB (Q6_K). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicación reciente y sin validación comunitaria todavía.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Etiquetada como `gemma4_unified` en el repositorio; transformer denso (detalle de capas no disponible) |
| Parámetros totales | 11.907.350.576 (≈11,9 mil millones) |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K (más el fichero imatrix) |
| Idiomas soportados | Inglés (en) únicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (variantes i1 con importance matrix); el modelo base está en bf16/safetensors |
| Tamaño del repositorio | 140,3 GB (incluye todas las variantes) |
| Modelo base | ChatoyantAI/gemma-4-12b-it-roleplay-sft-epoch2-bf16 |
| Capacidades multimodales | Sí, modelo de visión; los ficheros mmproj están en el repositorio estático |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El repositorio etiqueta el modelo como `gemma4_unified`, lo que indica que deriva de la familia Gemma de Google, pero no se especifican número de capas, dimensiones ocultas, tipo de atención ni mecanismos concretos. Tampoco se indica la longitud de contexto nativa, dato que no aparece ni en la model card ni en los metadatos del repositorio.

Respecto al entrenamiento, el nombre del modelo base indica un ajuste fino mediante SFT (supervised fine-tuning) ejecutado durante 2 épocas sobre un corpus orientado a roleplay y conversación. No se detalla el número de tokens de entrenamiento, la composición del dataset, si hubo fases posteriores de RLHF o DPO, ni si se aplicaron técnicas adicionales como decodificación especulativa. El repositorio actual no entrena nada: únicamente aplica cuantización con llama.cpp usando una importance matrix (imatrix) generada a partir del modelo bf16, lo que mejora la calidad de las cuantizaciones de baja precisión respecto a las cuantizaciones estáticas.

## Capacidades

- Generación de texto conversacional en inglés, con énfasis declarado en roleplay e interpretación de personajes.
- Mantenimiento de diálogo multi-turno, según las etiquetas `conversational` y `sft` del repositorio.
- Capacidades de visión: la model card indica explícitamente que es un modelo de visión, con ficheros mmproj disponibles en el repositorio de cuantizaciones estáticas.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`, lo que sugiere uso a través de API compatible con los formatos estándar.
- Ejecución local mediante llama.cpp y derivados (Ollama, LM Studio, kobold.cpp) gracias al formato GGUF.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Capacidades multilingües: no, el modelo declara únicamente inglés.

## Casos de uso

- Roleplay y chatbots de personaje: el ajuste SFT sobre datos de roleplay durante 2 épocas hace que el modelo sea adecuado para aplicaciones de ficción interactiva donde se requiere mantener una persona consistente a lo largo de una conversación multi-turno.
- Asistentes conversacionales de nicho en inglés: puede desplegarse como backend de un chat de atención o acompañamiento en inglés, ejecutándose en local con cuantizaciones Q4_K_M de 7,5 GB en GPUs de gama alta de consumo.
- Prototipado de videojuegos con NPCs dialogantes: al ser un modelo de 12B cuantizado a 4 bits, puede integrarse en un servidor de juego o en una estación de desarrollo para generar diálogos dinámicos de personajes no jugadores sin depender de APIs externas.
- Generación de guiones y diálogos creativos: útil para escritores que necesiten explorar variantes de diálogo entre personajes manteniendo un registro y una voz determinados, con control total sobre el prompt de sistema.
- Investigación sobre cuantización y calidad: el repositorio ofrece hasta 24 variantes i1 con imatrix, lo que permite estudiar empíricamente la degradación de calidad entre IQ1_M (3,3 GB) y Q6_K (9,9 GB) en una tarea subjetiva como el roleplay.
- Base para fine-tuning posterior en dominio específico: al estar bajo Apache 2.0 y en formato GGUF, aunque el GGUF no es directamente entrenable, la existencia del modelo base en bf16 permite partir de él para ajustes adicionales y después recuantizar.
- Experimentación multimodal en local: si se descargan los ficheros mmproj del repositorio estático, el modelo puede emplearse para tareas que combinen imagen y texto, aunque no se detallan los benchmarks de esa capacidad.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, es apto para escenarios donde no se pueden enviar conversaciones a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio i1 ni los metadatos de HuggingFace incluyen puntuaciones de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluación. La model card únicamente incluye un gráfico de perplejidad comparativa entre tipos de cuantización (elaborado por ikawrakow) que es genérico para llama.cpp y no específico de este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización elegida. El peso del fichero va de 3,3 GB (IQ1_M) a 9,9 GB (Q6_K); hay que añadir el espacio para la caché KV, que crece con la longitud de contexto (no disponible).
- Estimación orientativa por variante:
  - i1-IQ1_M: 3,3 GB (calidad "desesperada" según el propio autor, no recomendada).
  - i1-IQ2_M: 4,5 GB.
  - i1-IQ3_M: 5,8 GB.
  - i1-Q4_K_S: 7,1 GB (el autor lo describe como tamaño, velocidad y calidad óptimos).
  - i1-Q4_K_M: 7,5 GB (descrito como rápido y recomendado).
  - i1-Q6_K: 9,9 GB.
- GPU recomendadas: no disponibles de forma explícita. Por tamaño, una RTX 3090 o RTX 4090 (24 GB) puede ejecutar cualquier variante de este repositorio con contexto moderado. Una RTX 3060 de 12 GB o similar puede ejecutar hasta Q4_K_M o Q6_K con contexto reducido.
- ¿Cabe en GPU de consumo? Sí. Prácticamente todas las cuantizaciones caben en GPUs con 8 GB o más de VRAM, salvo Q6_K y contextos muy largos, que requieren 12 GB o más.
- El modelo bf16 completo (modelo base) ocuparía aproximadamente 23,8 GB solo en pesos, por lo que no cabe en GPUs de consumo sin cuantizar.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, kobold.cpp y cualquier runtime que soporte GGUF. Para el modelo base en bf16, transformers con safetensors.
- Ficheros auxiliares: el repositorio incluye un fichero imatrix (0,1 GB) útil para generar cuantizaciones propias.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría. La tabla siguiente compara únicamente las variantes internas documentadas en la información disponible.

| Modelo / variante | Parámetros | Formato | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (i1, imatrix) | 11,9B | GGUF | 3,3–9,9 GB según quant | Apache 2.0 | HuggingFace, 0 descargas |
| gemma-4-12b-it-roleplay-sft-epoch2-bf16 (base) | 11,9B | bf16 / safetensors | ≈23,8 GB en pesos | Apache 2.0 | HuggingFace |
| gemma-4-12b-it-roleplay-sft-epoch2-bf16-GGUF (estático) | 11,9B | GGUF | No disponible | Apache 2.0 | HuggingFace; incluye mmproj de visión |

Comparación con modelos de otras familias (Llama, Mistral, Qwen) en la misma franja de 12B: no disponible, ya que no se han publicado métricas de este modelo que permitan situarlo frente a ellos.

## Limitaciones y advertencias

- Idioma limitado: el modelo declara únicamente inglés. No hay evidencia de soporte para castellano u otros idiomas.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; en tareas de roleplay el modelo está optimizado para generar ficción, lo que aumenta la probabilidad de producir información inventada si se usa como asistente factual.
- Sesgos conocidos: no disponible. No hay documentación sobre sesgos de género, raza, ideología u otros en la información proporcionada.
- Cuantizaciones de muy baja precisión: las variantes IQ1_M, IQ2_XXS e IQ2_XS pueden degradar notablemente la coherencia. El propio autor marca IQ1_M como "mostly desperate" y Q2_K_S como "very low quality".
- Sin validación comunitaria: el repositorio tiene 0 descargas y 0 likes, por lo que no existen informes independientes de calidad en el momento de la consulta.
- Longitud de contexto desconocida: al no documentarse, no se puede garantizar el comportamiento en conversaciones muy largas ni planificar el consumo de VRAM de la caché KV.
- Restricciones de licencia: la licencia es Apache 2.0, que permite uso comercial, pero conviene verificar que el modelo base y los datos de entrenamiento del ajuste SFT no impongan términos adicionales, ya que la model card no los detalla.
- Naturaleza del repositorio: se trata de una recuantización, no de un modelo entrenado por mradermacher. Cualquier problema de calidad heredado del ajuste SFT original se mantiene.
- Capacidades multimodales incompletas en este repositorio: los ficheros mmproj no están aquí, sino en el repositorio estático; usarlo como modelo de visión requiere descargar ficheros adicionales.
- Uso en producción: al no haber benchmarks, no se recomienda desplegarlo en producción crítica sin una evaluación propia previa sobre el dominio objetivo.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/mradermacher/gemma-4-12b-it-roleplay-sft-epoch2-bf16-i1-GGUF
- Repositorio de cuantizaciones estáticas (incluye ficheros mmproj de visión): https://huggingface.co/mradermacher/gemma-4-12b-it-roleplay-sft-epoch2-bf16-GGUF
- Modelo base: https://huggingface.co/ChatoyantAI/gemma-4-12b-it-roleplay-sft-epoch2-bf16
- Página resumen del autor para este modelo: https://hf.tst.eu/model#gemma-4-12b-it-roleplay-sft-epoch2-bf16-i1-GGUF
- Preguntas frecuentes y peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de perplejidad entre tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa del autor de las cuantizaciones: https://www.nethype.de/

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos correspondían a servicios genéricos de portapapeles en línea y se han descartado.
