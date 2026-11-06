# mradermacher/EXAONE-3.5-7.8B-LinkOnX-Modeler-Code-v1.1-GGUF

## Resumen

EXAONE-3.5-7.8B-LinkOnX-Modeler-Code-v1.1-GGUF es la version cuantizada en formato GGUF del modelo linkonx/EXAONE-3.5-7.8B-LinkOnX-Modeler-Code-v1.1, un ajuste fino (SFT) del modelo EXAONE 3.5 de 7.800 millones de parametros desarrollado originalmente por LG AI Research. Las cuantizaciones han sido generadas por mradermacher, un conocido creador de quants estaticos en la comunidad de Hugging Face, empleando herramientas del ecosistema llama.cpp. El modelo esta pensado para generacion de texto y codigo, segun se desprende del sufijo "Modeler-Code" del nombre, aunque la model card no detalla el dataset de ajuste.

El interes de esta publicacion reside en que ofrece el modelo base en una amplia gama de cuantizaciones GGUF (desde Q2_K de 3,2 GB hasta f16 de 15,7 GB), lo que permite ejecutarlo en hardware de consumo mediante llama.cpp, Ollama o LM Studio. El modelo original parte de la arquitectura EXAONE 3.5, un transformer decoder-only con 7.818.448.960 parametros, y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales.

No obstante, la informacion disponible es limitada: la model card del repositorio GGUF es puramente tecnica sobre las cuantizaciones y no incluye detalles sobre el entrenamiento, el contexto, los idiomas (solo se declara "en") ni benchmarks. Esta ficha refleja unicamente los datos verificables de la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de EXAONE 3.5) |
| Parametros totales | 7.818.448.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo subyacente es un ajuste fino supervisado (SFT) del EXAONE 3.5 7.8B de LG AI Research, segun indican las etiquetas del repositorio (unsloth, trl, sft). La arquitectura es un transformer decoder-only con 7.818.448.960 parametros, aunque la informacion proporcionada no detalla el numero de capas, dimensiones ocultas ni mecanismos de atencion especificos. El nombre "Modeler-Code" sugiere un enfasis en generacion de codigo, pero no se especifica la composicion del dataset de ajuste ni el numero de tokens empleados.

No se dispone de informacion sobre el proceso de entrenamiento (si hubo RLHF, DPO, o solo SFT), la composicion del corpus, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Las cuantizaciones han sido generadas por mradermacher con cuantizacion estatica (quantize_version: 2) y sin quants ponderados/imatrix disponibles en el momento de la publicacion, segun indica la propia model card.

## Capacidades

- Generacion de texto conversacional (etiqueta "conversational" en el repositorio).
- Generacion de codigo, segun se infiere del nombre "Modeler-Code" del ajuste, aunque no se detalla en la model card.
- Compatible con text-generation-inference y endpoints_compatible, lo que permite su despliegue en infraestructuras de inferencia estandar.
- Soporte multilingue limitado: solo se declara ingles ("en") en los metadatos.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Asistencia de codigo en local: el modelo puede ejecutarse en GGUF con llama.cpp u Ollama en una estacion de trabajo con GPU de consumo, permitiendo autocompletado y generacion de fragmentos de codigo sin enviar datos a la nube. Es adecuado por su tamano de 7.8B y su licencia Apache 2.0.
- Prototipado rapido de chatbots: al ser compatible con text-generation-inference y disponer de cuantizaciones ligeras (Q4_K_M de 4,9 GB), se puede desplegar un endpoint conversacional en una unica GPU para pruebas internas.
- Generacion de codigo en pipelines de CI/CD: con la cuantizacion Q5_K_M o Q6_K se puede integrar en herramientas de revision automatica de parches o generacion de tests, siempre que se valide la calidad del ajuste "Modeler-Code" antes de produccion.
- Educacion y experimentacion: las cuantizaciones Q2_K y Q3_K permiten ejecutar el modelo en equipos con poca VRAM (por ejemplo, portatiles con GPU de 4-6 GB) para fines de aprendizaje sobre modelos de lenguaje.
- Investigacion sobre cuantizacion: el repositorio ofrece 12 variantes GGUF del mismo modelo, lo que facilita estudios comparativos de perdida de calidad entre tipos de cuantizacion (Q2_K frente a Q8_0) sobre una misma base.
- Despliegue en entornos con requisitos de soberania de datos: al poder ejecutarse completamente en local con llama.cpp, encaja en escenarios donde no se permite el envio de codigo o texto a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~3,2 GB; Q4_K_M ~4,9 GB; Q5_K_M ~5,7 GB; Q6_K ~6,5 GB; Q8_0 ~8,4 GB; f16 ~15,7 GB.
- GPU recomendadas: para f16, una GPU con 16-24 GB (RTX 4090, A100 40 GB, H100); para Q8_0, 10-12 GB (RTX 3080 12 GB, RTX 4070 Ti); para Q4_K_M, 6-8 GB (RTX 3060, RTX 4060 Ti).
- Cabe en GPU de consumo: si, practicamente todas las cuantizaciones desde Q2_K hasta Q6_K caben en GPUs de 6-8 GB; f16 requiere una GPU de gama alta o CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (para el modelo base en safetensors), y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EXAONE-3.5-7.8B-LinkOnX-Modeler-Code-v1.1-GGUF | 7,8B | no disponible | Apache 2.0 | GGUF | Ajuste SFT orientado a codigo, cuantizaciones estaticas |
| EXAONE 3.5 7.8B (LG AI Research) | 7,8B | no disponible en esta ficha | no disponible en esta ficha | safetensors | Modelo base original |
| linkonx/EXAONE-3.5-7.8B-LinkOnX-Modeler-Code-v1.1 | 7,8B | no disponible | Apache 2.0 | safetensors | Modelo base del ajuste, sin cuantizar |

No se dispone de datos de rendimiento comparativo ni de otros modelos de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita a la relacion entre el modelo base y su version cuantizada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero al ser un ajuste fino sobre un modelo base, hereda los sesgos del corpus original de EXAONE 3.5.
- Riesgo de alucinacion no cuantificado: no hay benchmarks ni evaluaciones publicadas en la informacion disponible.
- El unico idioma declarado es el ingles ("en"), por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base original de LG AI Research antes de un despliegue en produccion.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la coherencia y la generacion de codigo; se recomienda Q4_K_M o superior para uso practico.
- No hay quants ponderados/imatrix disponibles en el momento de la publicacion, lo que puede afectar a la calidad frente a otras alternativas.
- El repositorio tiene muy pocas descargas (10) y 0 likes, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/EXAONE-3.5-7.8B-LinkOnX-Modeler-Code-v1.1-GGUF
- Modelo base del ajuste: https://huggingface.co/linkonx/EXAONE-3.5-7.8B-LinkOnX-Modeler-Code-v1.1
- Pagina de resumen de quants de mradermacher: https://hf.tst.eu/model#EXAONE-3.5-7.8B-LinkOnX-Modeler-Code-v1.1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
