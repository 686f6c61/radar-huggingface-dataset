# mradermacher/Wald-4B-GGUF

## Resumen

Wald-4B-GGUF es el conjunto de cuantizaciones en formato GGUF que el usuario mradermacher ha publicado a partir del modelo base Harry19081/Wald-4B, un modelo de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones). No se trata de un modelo entrenado por el autor del repositorio, sino de una conversión de pesos orientada a inferencia local: el repositorio incluye doce variantes que van desde Q2_K (2,0 GB) hasta f16 (8,5 GB), lo que permite ejecutar el modelo en hardware muy variado sin necesidad de GPU de gama alta.

El modelo original aparece etiquetado con los descriptores decision-model, calibration, typesafe y decision-index, además de conversational, lo que sugiere un uso orientado a la toma de decisiones estructuradas y a la calibración de respuestas más que a la generación de texto generalista. Sin embargo, la model card del repositorio cuantizado no documenta la arquitectura, la longitud de contexto, el dataset de entrenamiento ni el proceso de alineación del modelo base, por lo que la mayor parte de las especificaciones técnicas quedan como no disponibles.

Su relevancia actual es fundamentalmente práctica: se publica bajo licencia Apache-2.0, funciona con el ecosistema llama.cpp/Ollama y ofrece un abanico de cuantizaciones que cubre desde equipos con 4 GB de VRAM hasta servidores con margen sobrado. El contrapeso es la ausencia total de benchmarks publicados y la madurez incipiente del proyecto, con cero descargas y un único "like" en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no especifica transformer, MoE ni SSM; la etiqueta library_name: transformers sugiere un transformer decoder-only, sin confirmar) |
| Parámetros totales | 4.205.751.296 (dato de safetensors del modelo base) |
| Parámetros activos | No aplica (no se ha documentado que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye para transformers |
| Tamaño del repositorio | 38,9 GB (suma de todas las cuantizaciones) |
| Autor de la cuantización | mradermacher |
| Modelo base | Harry19081/Wald-4B |
| Fecha de creación | 2026-09-27 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura del modelo base Harry19081/Wald-4B: no se indica si se trata de un transformer decoder-only, de un modelo con mezcla de expertos, de una arquitectura híbrida con atención lineal ni de ningún otro diseño. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otra forma de alineación. Las etiquetas declaradas (decision-model, calibration, typesafe, decision-index) apuntan a un modelo especializado en decisiones y calibración, pero no vienen acompañadas de ninguna explicación técnica en la model card del repositorio cuantizado.

En lo que sí hay información verificable es en el proceso de cuantización. mradermacher ha generado cuantizaciones estáticas a partir del modelo base, con la nota explícita de que no hay cuantizaciones ponderadas ni imatrix disponibles en el momento de la publicación. La conversión se ha hecho a formato GGUF (convert_type: hf), compatible con llama.cpp y sus derivados. El uso de cuantizaciones estáticas implica que cada tensor se cuantiza con una configuración fija, sin la ponderación por importancia que ofrecen las variantes i1/imatrix del mismo autor, lo que suele traducirse en una pérdida de calidad algo mayor a igual tamaño de archivo.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta conversational del repositorio.
- Modelado de decisiones y clasificación de opciones, de acuerdo con las etiquetas decision-model y decision-index; no hay documentación que detalle el formato de entrada o salida esperado.
- Calibración de respuestas (etiqueta calibration), presumiblemente orientada a que el modelo exprese confianza de forma coherente con su precisión real; sin métricas publicadas que lo confirmen.
- Salidas con tipado estricto (typesafe), según la etiqueta homónima; se desconoce el mecanismo concreto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo language del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Asistente conversacional en inglés ejecutado íntegramente en local: con las cuantizaciones Q4_K_S (2,7 GB) o Q4_K_M (2,8 GB) el modelo cabe en portátiles modestos y permite desplegar un chatbot sin enviar datos a servicios externos.
- Toma de decisiones estructurada: dado el etiquetado decision-model y decision-index, encaja como componente de sistemas que deben elegir entre alternativas y justificar la elección; conviene validar el comportamiento real antes de usarlo en producción, ya que no hay documentación del formato esperado.
- Evaluación de calibración de respuestas: la etiqueta calibration sugiere su uso en experimentos donde se compare la confianza declarada por el modelo con su tasa de acierto; sería necesario construir el conjunto de evaluación propio al no existir métricas publicadas.
- Prototipado rápido en investigación: la variedad de cuantizaciones permite estudiar el efecto del ancho de bits (de Q2_K a Q8_0) sobre la calidad de salida con un mismo modelo base y un coste de cómputo reducido.
- Despliegue en entornos aislados o air-gapped: al ser GGUF y funcionar con llama.cpp, se puede integrar en infraestructura sin acceso a internet ni dependencias de servicios en la nube.
- Servicio en contenedores con límite estricto de memoria: la variante Q2_K ocupa 2,0 GB, lo que permite levantar el modelo en contenedores con 4 GB de RAM asignada, aceptando la pérdida de calidad asociada a 2 bits por peso.
- Base para ajuste fino o adaptación al dominio: la licencia Apache-2.0 del repositorio permite derivados comerciales, aunque para reentrenar conviene partir del modelo base en transformers en lugar de una cuantización GGUF, que no es adecuada para entrenamiento.
- Docencia y experimentación con modelos pequeños: sirve para ilustrar el impacto de la cuantización en un modelo de 4B dentro de cursos o talleres de ingeniería de IA, con requisitos de hardware accesibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio cuantizado ni los resultados de búsqueda web asociados incluyen cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de ningún otro conjunto de evaluación para Wald-4B o para sus cuantizaciones. Tampoco se ofrecen mediciones de perplejidad comparativas entre las distintas variantes GGUF.

| Benchmark | Wald-4B-GGUF | Referencia |
|---|---|---|
| MMLU | No disponible | No disponible |
| HumanEval | No disponible | No disponible |
| GSM8K | No disponible | No disponible |
| Perplejidad por cuantización | No disponible | No disponible |

## Requisitos de hardware

Los tamaños de archivo siguientes proceden de la tabla de cuantizaciones publicada por el autor; el consumo de VRAM adicional corresponde a la caché KV y a los buffers de inferencia, que dependen de la longitud de contexto (no especificada) y por tanto se indican como rangos orientativos.

- Q2_K: 2,0 GB de pesos; inferencia viable con unos 3 GB de VRAM en contexto corto.
- Q3_K_S / Q3_K_M / Q3_K_L: 2,2 / 2,4 / 2,5 GB de pesos.
- IQ4_XS: 2,6 GB de pesos.
- Q4_K_S / Q4_K_M: 2,7 / 2,8 GB de pesos; el autor las marca como "fast, recommended" y son el punto de partida razonable para uso general.
- Q5_K_S / Q5_K_M: 3,1 / 3,2 GB de pesos.
- Q6_K: 3,6 GB de pesos; el autor lo describe como "very good quality".
- Q8_0: 4,6 GB de pesos; descrito como "fast, best quality".
- f16: 8,5 GB de pesos; 16 bits por peso, descrito por el autor como "overkill".
- GPU recomendadas: cualquier GPU consumer con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4070) es suficiente para las cuantizaciones de 4 bits; una RTX 4090 o una A100/H100 solo aportan ventaja en escenarios de batching o de contexto muy largo. También es viable en Apple Silicon con memoria unificada de 8-16 GB.
- CPU: las variantes Q4_K_S y Q4_K_M son ejecutables en CPU con un rendimiento aceptable, aunque no se han publicado cifras de tokens por segundo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no consumen GGUF de forma nativa: para esos servidores habría que usar el modelo base en transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de parámetros, contexto ni rendimiento de Wald-4B más allá del recuento de parámetros y del tamaño de las cuantizaciones. La comparación se limita a otros repositorios de cuantizaciones GGUF de tamaño similar publicados por el mismo autor y localizados en la búsqueda web.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wald-4B-GGUF | 4.205.751.296 | No disponible | Sin benchmarks publicados | Apache-2.0 | 12 cuantizaciones estáticas; 0 descargas |
| mradermacher/LingoEDU-4B-GGUF | No disponible | No disponible | No disponible | No disponible | Repositorio de cuantización del modelo deeplang-ai/LingoEDU-4B |
| mradermacher/IntrinSight-4B-GGUF | No disponible | No disponible | No disponible | No disponible | Cuantizaciones estáticas y ponderadas (i1) disponibles |
| mradermacher/Aura-4B-GGUF | No disponible | No disponible | No disponible | No disponible | Distribuido también vía plataformas de despliegue de terceros |

Como referencia de categoría, los modelos abiertos de aproximadamente 4B más habituales en 2026 (Qwen, Llama, Gemma, Phi en sus variantes pequeñas) suelen publicar contexto, benchmarks y licencia detallados; Wald-4B no ofrece esa documentación, lo que dificulta una comparación rigurosa.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se conocen arquitectura, contexto, dataset ni proceso de alineación, lo que impide razonar sobre sus límites teóricos.
- Sin benchmarks publicados: cualquier afirmación sobre su calidad relativa sería especulativa.
- Validación comunitaria prácticamente nula: cero descargas y un único "like" en el momento de la consulta.
- Idiomas: únicamente inglés declarado; el rendimiento en castellano no está verificado y probablemente sea deficiente.
- Riesgo de alucinación: no cuantificado, pero al no haber evaluación publicada debe asumirse alto y verificarse en el dominio de aplicación.
- Cuantizaciones estáticas: el autor indica que no ha generado variantes ponderadas ni imatrix; a igual tamaño, una cuantización estática suele degradar más la calidad.
- Cuantizaciones de muy pocos bits: Q2_K y las variantes Q3 están asociadas a pérdidas notables de calidad en modelos pequeños; las recomendaciones del propio autor apuntan a Q4_K_S, Q4_K_M y superiores.
- Dependencia del modelo base: si Harry19081/Wald-4B contiene sesgos o comportamientos problemáticos, se trasladan íntegramente a estas cuantizaciones.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios; conviene revisar igualmente las condiciones del modelo base por si añadiera términos adicionales.
- Etiquetas sin respaldo documental: decision-model, calibration, typesafe y decision-index no vienen explicadas, por lo que no deben tomarse como garantía de funcionalidad concreta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Wald-4B-GGUF
- Modelo base: https://huggingface.co/Harry19081/Wald-4B
- Página de resumen del autor para este modelo: https://hf.tst.eu/model#Wald-4B-GGUF
- Preguntas frecuentes y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (empresa que cede infraestructura al autor): https://www.nethype.de/
- Cuantizaciones hermanas del mismo autor: https://huggingface.co/mradermacher/LingoEDU-4B-GGUF, https://huggingface.co/mradermacher/IntrinSight-4B-GGUF, https://huggingface.co/mradermacher/Aura-4B-GGUF
- Perfil del autor en directorios de modelos: https://www.aimodels.fyi/creators/huggingFace/mradermacher
