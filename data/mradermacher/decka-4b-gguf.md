# mradermacher/Decka-4B-GGUF

## Resumen

Decka-4B-GGUF es una cuantización en formato GGUF del modelo Decka-4B, desarrollado por mrzenin y posteriormente cuantizado por mradermacher. Se trata de un modelo de 4.200 millones de parámetros orientado a la escritura creativa, la generación de ficción, el roleplay y la narración de historias en múltiples géneros. El modelo base ha sido sometido a un proceso de "abliteration" (eliminación de rechazos) y se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones.

La relevancia de este modelo radica en su especialización en tareas de creatividad literaria, un nicho donde los modelos generalistas suelen ofrecer resultados más planos. Al estar cuantizado en GGUF, puede ejecutarse en hardware modesto, incluidas GPUs de consumo, mediante herramientas como llama.cpp u Ollama. Además, la inclusión de archivos mmproj sugiere capacidades multimodales, aunque no se especifica si se trata de visión, audio u otro tipo de entrada.

El repositorio ofrece una amplia gama de cuantizaciones, desde Q2_K (2,0 GB) hasta f16 (8,5 GB), lo que permite adaptar el modelo a diferentes restricciones de memoria y requisitos de calidad. A pesar de ser un modelo relativamente pequeño, su enfoque en la generación de texto narrativo lo convierte en una opción interesante para desarrolladores que buscan integrar capacidades de escritura creativa en aplicaciones locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (no especificada en detalle) |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Decka-4B. Por los tags de HuggingFace se sabe que fue entrenado con la herramienta Unsloth, que optimiza el fine-tuning de modelos transformer, y que se aplico una tecnica de "abliteration" para eliminar los rechazos tipicos de los modelos alineados, dando lugar a una version "uncensored". El modelo base fue posteriormente cuantizado por mradermacher a formato GGUF mediante conversion estatica.

No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se utilizaron tecnicas como RLHF o DPO. La unica informacion disponible es que el modelo esta especializado en escritura creativa, generacion de tramas, continuacion de escenas y roleplay, lo que sugiere un entrenamiento orientado a datos literarios y conversacionales.

## Capacidades

- Generacion de texto narrativo: creacion de historias, tramas, subtramas y escenas en generos como ciencia ficcion, romance y otros.
- Continuacion de escenas: dado un fragmento previo, el modelo puede extender la narracion de forma coherente.
- Roleplay: capaz de mantener conversaciones con personajes y contextos ficticios.
- Escritura descriptiva: produce prosa vivida y detallada, segun los tags del modelo.
- Soporte multimodal: la presencia de archivos mmproj sugiere que el modelo puede procesar entradas adicionales (probablemente imagenes), aunque no se especifica el tipo exacto.
- Multilingue: soporta ingles y chino, aunque no se indica el nivel de competencia en cada idioma.

## Casos de uso

- Generacion de borradores de novelas o relatos: un escritor puede usar el modelo para generar capitulos completos o ideas de trama, aprovechando su especializacion en narrativa y su capacidad para mantener coherencia en textos largos.
- Creacion de dialogos para videojuegos: el modelo puede generar conversaciones para personajes no jugadores (NPC) en juegos de rol, gracias a su habilidad para el roleplay y la continuacion de escenas.
- Asistente de escritura para blogs o contenido creativo: integrado en un editor, puede sugerir parrafos descriptivos o alternativas de redaccion, mejorando la productividad de redactores.
- Simulacion de personajes para chatbots: al estar "uncensored" y orientado a roleplay, puede utilizarse para construir asistentes conversacionales con personalidades definidas, sin las restricciones tipicas de los modelos alineados.
- Generacion de guiones para cortometrajes o podcasts: el modelo puede crear dialogos y descripciones de escena, facilitando el trabajo de guionistas independientes.
- Prototipado rapido de narrativa interactiva: en aplicaciones de ficcion interactiva o juegos de texto, el modelo puede generar respuestas dinamicas a las acciones del usuario, aprovechando su contexto de hasta 4B parametros para mantener la coherencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar. El modelo esta disenado para tareas creativas, por lo que las evaluaciones convencionales de razonamiento o codigo probablemente no reflejarian su rendimiento real en su dominio de especializacion.

## Requisitos de hardware

- VRAM estimada para inferencia: segun la cuantizacion elegida, el modelo requiere entre 2,0 GB (Q2_K) y 8,5 GB (f16) de memoria. Para la cuantizacion recomendada Q4_K_M (2,8 GB), se necesitan al menos 4 GB de VRAM para una ejecucion comoda.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM puede ejecutar las cuantizaciones mas pequeñas. Para las versiones Q6_K o Q8_0, se recomienda una GPU con 6-8 GB, como una RTX 3060, RTX 4060 o superior. En CPU, el modelo puede ejecutarse con llama.cpp, aunque la velocidad sera menor.
- Compatibilidad con GPU de consumo: si, las cuantizaciones Q4_K_M y menores caben en GPUs de gama de entrada como la GTX 1650 (4 GB) o la RTX 3050 (6 GB).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF como llama-cpp-python. Tambien puede usarse con vLLM si se convierte a otro formato, aunque no es el flujo habitual.
- Latencia y throughput: no se dispone de mediciones oficiales. En una GPU moderna (RTX 4090), se espera una generacion de 20-40 tokens por segundo con cuantizacion Q4_K_M, pero estos valores son estimaciones orientativas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria. Decka-4B es un modelo especializado en escritura creativa, y no se conocen alternativas directas con el mismo tamano y enfoque en el ecosistema GGUF. Modelos como Llama-3-8B o Mistral-7B son mas grandes y generalistas, pero no estan especificamente orientados a la narrativa. Se recomienda evaluar el modelo en tareas concretas de generacion de ficcion para determinar su idoneidad frente a otras opciones.

## Limitaciones y advertencias

- Al ser un modelo "uncensored" y "abliterated", puede generar contenido inapropiado, ofensivo o ilegal sin filtros. Los desarrolladores deben implementar sus propias capas de moderacion si planean desplegarlo en entornos publicos.
- No se ha verificado la calidad del modelo en tareas de razonamiento, codigo o matematicas; su rendimiento en estos dominios es probablemente limitado.
- La longitud de contexto no esta documentada, lo que dificulta prever su comportamiento en conversaciones o textos muy largos.
- El soporte de idiomas se limita a ingles y chino; no se garantiza un buen rendimiento en otros idiomas, incluido el espanol.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas en esta ficha.
- Al ser una cuantizacion estatica (no imatrix), la calidad puede ser ligeramente inferior a la de cuantizaciones con matriz de importancia, especialmente en las versiones de menor precision.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/Decka-4B-GGUF
- Modelo base (mrzenin/Decka-4B): https://huggingface.co/mrzenin/Decka-4B
- Perfil de mradermacher en HuggingFace: https://huggingface.co/mradermacher
- Guia de uso de archivos GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
