# mradermacher/archaeo-12b-v2-rei-base-arcee-fusion-merge-GGUF

## Resumen

El modelo `archaeo-12b-v2-rei-base-arcee-fusion-merge-GGUF` es una cuantizacion en formato GGUF del modelo base `NewEden-Forge/archaeo-12b-v2-rei-base-arcee-fusion-merge`, publicada por el usuario mradermacher. Se trata de un merge de modelos (fusion) generado con la herramienta mergekit, que combina pesos de otros modelos para obtener un checkpoint de 12.247.782.400 parametros (aproximadamente 12,2 mil millones). El modelo esta etiquetado como conversacional y orientado al idioma ingles, y su libreria de referencia es transformers.

El interes principal de esta publicacion reside en que ofrece el modelo en multiples niveles de cuantizacion GGUF (desde Q2_K hasta Q8_0), lo que permite ejecutarlo en hardware de consumo con distintos compromisos entre calidad y uso de memoria. El repositorio ocupa 84,7 GB en total, aunque cada archivo individual de cuantizacion es mucho menor (desde 4,9 GB hasta 13,1 GB). El modelo original no incluye informacion publica sobre arquitectura interna, datos de entrenamiento ni benchmarks, por lo que muchos detalles tecnicos no estan disponibles.

La relevancia de esta ficha es practica: permite a desarrolladores saber que existe una version GGUF de un merge de 12B, que cuantizaciones estan disponibles, cuanto pesan y como desplegarlas con llama.cpp u Ollama. No obstante, al carecer de model card detallada del autor original, la evaluacion de calidad debe hacerse de forma empirica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de tipo transformer, inferido por el uso de transformers y mergekit; sin confirmacion del autor) |
| Parametros totales | 12.247.782.400 (12,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo original. Por el nombre y las etiquetas (`mergekit`, `merge`), se trata de un modelo fusionado mediante mergekit, una herramienta que combina los pesos de dos o mas modelos para crear un nuevo checkpoint. El modelo base se identifica como `NewEden-Forge/archaeo-12b-v2-rei-base-arcee-fusion-merge`, lo que sugiere que a su vez es el resultado de una fusion de modelos de la familia Archaeo (12B) con otros componentes. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO.

La publicacion de mradermacher es una cuantizacion estatica del modelo base, generada con herramientas de cuantizacion GGUF (probablemente llama.cpp). El autor indica que las cuantizaciones ponderadas o con imatrix no estan disponibles en el momento de la publicacion, y que las cuantizaciones IQ (como IQ4_XS) suelen ser preferibles a cuantizaciones no-IQ de tamano similar. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Capacidad de razonamiento y respuesta a instrucciones, inferida por el tipo de modelo (merge de 12B orientado a conversacion), aunque no se documenta explicitamente.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (vision, audio, thinking mode): no disponible (no documentado).
- Ejecucion local mediante llama.cpp y formatos GGUF, lo que facilita el despliegue en CPU y GPU de consumo.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede desplegarse con llama.cpp u Ollama en una estacion de trabajo con GPU de consumo, gestionando conversaciones multi-turno en ingles. La cuantizacion Q4_K_M (7,6 GB) es adecuada para GPUs con 8-12 GB de VRAM.
- Prototipado rapido de chatbots: gracias a las cuantizaciones ligeras (Q2_K de 4,9 GB), se puede probar el modelo en portatiles con GPU modesta o incluso en CPU, evaluando su comportamiento antes de invertir en infraestructura mayor.
- Generacion de texto creativo y redaccion en ingles: el modelo puede emplearse para redactar borradores, resumir o reescribir textos, aprovechando su naturaleza conversacional y su tamano de 12B, que ofrece un equilibrio entre calidad y coste computacional.
- Fine-tuning posterior sobre dominio especifico: al estar disponible en formato GGUF y en safetensors (modelo base), se puede partir del checkpoint original para ajuste fino con LoRA o QLoRA en tareas concretas, aunque la falta de licencia clara debe verificarse antes de uso comercial.
- Evaluacion comparativa de merges: investigadores interesados en el efecto de las fusiones de modelos pueden usar esta version GGUF para comparar el rendimiento de un merge de 12B frente a modelos base de tamano similar en tareas de generacion y razonamiento.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q3_K_S (5,6 GB) y IQ4_XS (6,9 GB) permiten ejecutar el modelo en GPUs de 6-8 GB de VRAM, ampliando el acceso a hardware de gama media.
- Educacion e investigacion sobre cuantizacion: el repositorio ofrece un espectro amplio de cuantizaciones (11 variantes) que permite estudiar el impacto de la cuantizacion en la perplejidad y la calidad de salida, siguiendo las graficas y referencias incluidas por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y contexto):
  - Q2_K (4,9 GB): ~5-6 GB de VRAM.
  - Q3_K_S (5,6 GB): ~6-7 GB de VRAM.
  - Q3_K_M (6,2 GB): ~7 GB de VRAM.
  - Q3_K_L (6,7 GB): ~7-8 GB de VRAM.
  - IQ4_XS (6,9 GB): ~7-8 GB de VRAM.
  - Q4_K_S (7,2 GB): ~8 GB de VRAM.
  - Q4_K_M (7,6 GB): ~8-9 GB de VRAM.
  - Q5_K_S (8,6 GB): ~9-10 GB de VRAM.
  - Q5_K_M (8,8 GB): ~9-10 GB de VRAM.
  - Q6_K (10,2 GB): ~11-12 GB de VRAM.
  - Q8_0 (13,1 GB): ~14 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 12 GB, RTX 4080 16 GB, RTX 4090 24 GB para cuantizaciones altas; A100 o H100 no son necesarias para un modelo de 12B, pero pueden usarse para mayor throughput.
- Cabe en GPU de consumo: si, desde GPUs de 8 GB (Q4_K_M) hasta 16 GB (Q6_K), y en 24 GB con Q8_0 sin problemas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (con backend llama.cpp), y servidores compatibles con GGUF. Para el modelo base en safetensors, vLLM o TGI si se dispone de VRAM suficiente (24 GB o mas para FP16).
- Latencia y throughput estimados: no disponibles (dependen del hardware y la cuantizacion; no se proporcionan datos).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparativa rigurosa. Se indica "no disponible" para los modelos comparables, ya que no se conocen alternativas directas documentadas en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| archaeo-12b-v2-rei-base-arcee-fusion-merge-GGUF | 12,2B | no disponible | no disponible | GGUF | Merge cuantizado, solo ingles |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al ser un merge de modelos entrenados probablemente con datos web en ingles, puede heredar sesgos de genero, raza o cultura de sus componentes originales.
- Riesgo de alucinacion: presente en cualquier modelo de lenguaje; no se han publicado evaluaciones de fidelidad factual para este merge.
- Limitaciones de contexto o idioma: el modelo esta etiquetado solo para ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas. La longitud de contexto no esta documentada.
- Restricciones de licencia: la licencia no esta disponible, lo que impide confirmar si se permite uso comercial. Se recomienda contactar con el autor original (`NewEden-Forge`) antes de cualquier despliegue en produccion.
- Caveat importante: al ser un merge no documentado, su calidad es incierta y debe validarse empiricamente antes de usarlo en produccion. La falta de benchmarks y de model card detallada del modelo base es un riesgo significativo.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la coherencia y la calidad de las respuestas; se recomienda Q4_K_M o superior para uso real.
- El repositorio tiene muy pocas descargas (72) y cero likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/archaeo-12b-v2-rei-base-arcee-fusion-merge-GGUF
- Modelo base: https://huggingface.co/NewEden-Forge/archaeo-12b-v2-rei-base-arcee-fusion-merge
- Pagina de resumen del autor: https://hf.tst.eu/model#archaeo-12b-v2-rei-base-arcee-fusion-merge-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Reflexiones sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
