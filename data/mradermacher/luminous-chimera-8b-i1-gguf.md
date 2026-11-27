# mradermacher/Luminous-Chimera-8B-i1-GGUF

## Resumen

Luminous-Chimera-8B-i1-GGUF es una colección de cuantizaciones en formato GGUF del modelo Luminous-Chimera-8B, un merge de modelos generado con mergekit por el usuario Kanjdoes. El trabajo de cuantización lo firma mradermacher, un publicador habitual de cuantizaciones GGUF para la comunidad de inferencia local. El modelo base tiene 8.030.261.312 parámetros (aproximadamente 8 mil millones) y está pensado para ejecución en CPU y GPU de consumo mediante llama.cpp y herramientas compatibles.

El interés de esta ficha reside en que permite ejecutar un modelo de 8B en hardware modesto. Las cuantizaciones i1 (imatrix) están calibradas con un fichero de importancia generado a partir de datos de calibración, lo que en la práctica mejora la calidad respecto a cuantizaciones estáticas del mismo tamaño. El repositorio ofrece 26 variantes que van desde 2,1 GB (i1-IQ1_S) hasta 6,7 GB (i1-Q6_K), cubriendo desde escenarios de memoria muy limitada hasta calidad casi equivalente a la del modelo original en FP16.

La información disponible es escasa: la model card del repositorio de cuantización no documenta el proceso de merge del modelo base, no incluye datos de entrenamiento, benchmarks ni licencia explícita. Además, el campo de idioma declarado es únicamente inglés. Todo ello condiciona la evaluación: se trata de un artefacto de cuantización, no de un modelo con documentación técnica completa, y su uso en producción debería ir precedido de una validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base es un merge con mergekit; arquitectura del transformer subyacente no documentada en la información disponible) |
| Parametros totales | 8.030.261.312 (8B) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; también se ofrece el fichero imatrix y existe un repositorio de cuantizaciones estáticas (Luminous-Chimera-8B-GGUF) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El repositorio es una cuantización, no un modelo entrenado desde cero. El modelo base, Kanjdoes/Luminous-Chimera-8B, se generó con mergekit, una herramienta de fusión de pesos que combina dos o más modelos mediante técnicas como SLERP, TIES, DARE o passthrough. La model card no detalla qué modelos se fusionaron, con qué método ni con qué proporciones, ni tampoco la arquitectura concreta del transformer subyacente (número de capas, dimensiones ocultas, cabezas de atención, tipo de atención). Tampoco se documenta ningún proceso de entrenamiento adicional, RLHF, DPO ni datos de preentrenamiento o ajuste fino.

La innovación técnica relevante está en el proceso de cuantización. mradermacher genera cuantizaciones i1 (imatrix) usando un fichero de importancia calculado con datos de calibración, lo que permite asignar más bits a los tensores con mayor impacto en la perplejidad y menos a los demás. Según las notas del autor, las variantes IQ suelen superar a las Q de tamaño similar, y algunas i1 (por ejemplo i1-IQ3_S, 3,8 GB) superan a las Q3_K equivalentes. El repositorio incluye además el propio fichero imatrix (0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones. Se desconoce el conjunto de calibración empleado y si se usó el mismo que en otras cuantizaciones del autor.

## Capacidades

- Generación de texto conversacional: la model card etiqueta el modelo como "conversational", lo que sugiere uso en diálogo multi-turno, aunque no se detalla el formato de plantilla de chat.
- Razonamiento general y respuesta a instrucciones: capacidades heredadas del modelo base fusionado, sin documentación específica de rendimiento.
- Ejecución local en CPU y GPU: al estar en GGUF, es compatible con llama.cpp y derivados, lo que permite inferencia sin GPU dedicada en las cuantizaciones más pequeñas.
- Idiomas: únicamente inglés declarado; no hay evidencia de capacidades multilingües.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multimodales (visión, audio): no documentadas; el repositorio no incluye proyector multimodal (mmproj) en la lista de ficheros.
- Modo "thinking" o razonamiento extendido: no documentado.

## Casos de uso

- Prototipado local en portátiles sin GPU: la variante i1-IQ2_XS (2,7 GB) o i1-Q3_K_S (3,8 GB) permite ejecutar un modelo de 8B en CPU con llama.cpp, útil para validar ideas antes de escalar a infraestructura con GPU.
- Asistentes conversacionales en inglés sobre hardware de consumo: con i1-Q4_K_M (5,0 GB) cabe en GPUs de 8 GB de VRAM y ofrece un equilibrio razonable entre calidad y velocidad para chatbots de uso personal o interno.
- Generación de texto en entornos con requisitos de privacidad: al ejecutarse en local, los datos no salen del equipo, lo que encaja en escenarios donde no se puede enviar información a APIs externas.
- Pruebas de integración con llama.cpp y servidores compatibles con la API de OpenAI: el tag "endpoints_compatible" sugiere que puede servirse mediante endpoints compatibles, útil para sustituir un backend en pruebas sin cambiar el código cliente.
- Evaluación comparativa de cuantizaciones: el repositorio incluye 26 variantes del mismo modelo, lo que permite medir el impacto de la cuantización en perplejidad y calidad para una tarea concreta antes de fijar una variante en producción.
- Generación de cuantizaciones propias: el fichero imatrix publicado (0,1 GB) permite a otros usuarios producir sus propias variantes i1 con llama.cpp, útil para equipos que necesitan un tamaño o tipo de cuantización no disponible en el repositorio.
- Fines educativos y de investigación sobre merge de modelos: sirve para estudiar el comportamiento de un merge de 8B en distintas precisiones sin necesidad de infraestructura de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantización no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se han encontrado datos del modelo base en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (el tamaño del fichero GGUF es una aproximación práctica; hay que sumar overhead de contexto y caché KV):
  - i1-IQ1_S: ~2,1 GB
  - i1-IQ2_XS: ~2,7 GB
  - i1-IQ3_S: ~3,8 GB
  - i1-Q4_K_M: ~5,0 GB
  - i1-Q5_K_M: ~5,8 GB
  - i1-Q6_K: ~6,7 GB
- GPU recomendadas: no hay recomendaciones oficiales. Por tamaño, las cuantizaciones Q4 caben en RTX 3060/4060 de 8 GB, RTX 4070/4080 y superiores; las Q5 y Q6 requieren 8-12 GB según contexto. Para despliegue con concurrencia, A100 o H100 con vLLM no aplican directamente porque vLLM no consume GGUF de forma nativa; para GGUF se usa llama.cpp o servidores basados en él.
- Cabe en GPU de consumo: sí, todas las variantes caben en GPUs de 8 GB o menos, salvo que se use un contexto muy largo (la caché KV puede añadir varios GB).
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (importando el GGUF), LM Studio, text-generation-webui y otros frontends compatibles con GGUF. Para el modelo base en safetensors, transformers con PyTorch.
- Latencia y throughput: no disponibles en la información proporcionada. Dependen del hardware, del tamaño de cuantización y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Luminous-Chimera-8B-i1-GGUF (este) | 8B | no disponible | no disponible | GGUF (26 variantes i1) | Merge cuantizado con imatrix; solo inglés declarado |
| Luminous-Chimera-8B (base) | 8B | no disponible | no disponible | safetensors | Modelo original del que deriva esta cuantización |
| Luminous-Chimera-8B-GGUF (estático) | 8B | no disponible | no disponible | GGUF (Q2_K a Q6_K, IQ, Q4_0/Q4_1) | Mismo modelo con cuantizaciones estáticas de mradermacher; alternativa sin calibración imatrix |

No se dispone de datos de benchmarks ni de otros modelos comparables documentados en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido. Es imprescindible contactar con el autor del modelo base (Kanjdoes) antes de usarlo en producción.
- Modelo base sin documentación técnica: se desconoce qué modelos se fusionaron, con qué método y con qué datos, lo que impide evaluar sesgos, calidad y robustez de forma rigurosa.
- Riesgo de alucinación: inherente a los modelos de lenguaje de 8B sin datos de evaluación publicados; no hay evidencia de mitigación mediante RLHF o DPO.
- Idioma limitado al inglés: no se declaran capacidades en castellano ni en otros idiomas, por lo que su uso en español no está respaldado por la documentación.
- Contexto desconocido: al no documentarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperación de información extensa.
- Cuantizaciones de muy baja precisión: las variantes IQ1 e IQ2 pierden calidad de forma notable; el propio autor las describe como "for the desperate" o "mostly desperate". No son adecuadas para producción.
- Repositorio de 93,8 GB: descargar el repositorio completo no es práctico; conviene descargar solo el fichero GGUF de la variante elegida.
- Sin garantías de soporte: el autor no ofrece SLA ni mantenimiento; la fecha de creación (2026-11-24) y la de actualización (2026-11-24) indican que no ha habido revisiones posteriores.
- Ficheros multi-parte: algunas variantes pueden estar divididas en varios ficheros; es necesario consultar el README de TheBloke enlazado por el autor para concatenarlas correctamente.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/mradermacher/Luminous-Chimera-8B-i1-GGUF
- Modelo base: https://huggingface.co/Kanjdoes/Luminous-Chimera-8B
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Luminous-Chimera-8B-GGUF
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#Luminous-Chimera-8B-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
