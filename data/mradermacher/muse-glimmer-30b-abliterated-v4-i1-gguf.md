# mradermacher/Muse-Glimmer-30B-abliterated-v4-i1-GGUF

## Resumen

Muse-Glimmer-30B-abliterated-v4-i1-GGUF es una recopilación de cuantizaciones GGUF del modelo Muse-Glimmer-30B-abliterated-v4, publicada por el usuario mradermacher, especializado en la generación de versiones cuantizadas de modelos open source. El modelo base es un derivado "abliterated" (sin las capas de rechazo alineadas mediante RLHF) del modelo Muse-Glimmer-30B, orientado a conversación y con capacidades de visión según la propia model card. Esta versión i1 emplea cuantización con matriz de importancia (imatrix) para preservar mejor la calidad en rangos bajos de bits.

El modelo cuenta con 27.854.794.240 parámetros totales (aproximadamente 27,85 mil millones), lo que lo sitúa en la categoría de modelos densos de gran tamaño, apto para despliegues en GPU de gama alta o configuraciones multi-GPU. La model card indica que se trata de un modelo de visión, aunque los ficheros mmproj (necesarios para el procesamiento de imágenes) se alojan en el repositorio estático del mismo autor, no en este repositorio i1.

La relevancia de esta ficha radica en que ofrece un abanico muy amplio de cuantizaciones (desde IQ1_S de 6,6 GB hasta Q6_K de 23,0 GB), lo que permite ejecutar un modelo de casi 28B parámetros en hardware muy diverso, desde GPUs de consumo con poca VRAM hasta estaciones de trabajo con múltiples aceleradores. No obstante, la información pública disponible sobre arquitectura, entrenamiento y benchmarks del modelo base es muy limitada, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer denso, segun el recuento de parametros; detalles no publicados) |
| Parametros totales | 27.854.794.240 (~27,85 B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (con fichero imatrix para crear cuantizaciones propias) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Muse-Glimmer-30B-abliterated-v4. Por el recuento de parametros (27,85 B) y la naturaleza del repositorio (transformers + GGUF), se trata de un modelo transformer denso, pero no se han publicado datos sobre numero de capas, dimensiones ocultas, mecanismo de atencion ni innovaciones arquitectonicas concretas.

Respecto al entrenamiento, la model card no incluye informacion sobre el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El sufijo "abliterated" indica que el modelo base ha sido modificado para eliminar o atenuar los comportamientos de rechazo aprendidos durante el alineamiento, una practica habitual en la comunidad open source. La cuantizacion i1 de mradermacher utiliza una matriz de importancia (imatrix) generada a partir de datos de calibracion, lo que mejora la fidelidad de las cuantizaciones de baja precision respecto a las cuantizaciones estaticas. El autor tambien publica cuantizaciones estaticas en un repositorio separado.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Capacidades de vision: la model card indica explicitamente que es un modelo de vision, aunque los ficheros mmproj necesarios se encuentran en el repositorio estatico del autor.
- Razonamiento y generacion de codigo: no confirmado en la informacion disponible.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue local de un modelo de ~28B en hardware de consumo: gracias a las cuantizaciones IQ2/IQ3 (entre 8,1 y 12,9 GB), es posible ejecutar el modelo en GPUs con 12-16 GB de VRAM usando llama.cpp u Ollama, con la consiguiente perdida de calidad.
- Asistentes conversacionales sin filtros de contenido: la naturaleza "abliterated" del modelo lo hace adecuado para entornos de investigacion donde se estudia el comportamiento de modelos sin alineamiento de rechazo, siempre con las cautelas eticas correspondientes.
- Procesamiento de imagenes con modelos cuantizados: al ser un modelo de vision, puede emplearse para tareas de descripcion de imagenes o VQA si se descargan los ficheros mmproj del repositorio estatico y se usa un runtime compatible (llama.cpp con soporte multimodal).
- Prototipado rapido en estaciones de trabajo: la cuantizacion Q4_K_M (17,0 GB) ofrece un equilibrio razonable entre calidad y requisitos de memoria para pruebas de concepto en una RTX 4090 o A100 de 40 GB.
- Fine-tuning o experimentacion con tecnicas de cuantizacion: el fichero imatrix incluido permite a investigadores generar sus propias cuantizaciones personalizadas con calibracion adaptada a su dominio.
- Evaluacion comparativa de tecnicas de cuantizacion: el amplio catalogo de cuantizaciones (desde IQ1 hasta Q6_K) permite estudiar la degradacion de calidad en funcion del tamano, un caso de uso habitual en investigacion sobre compresion de modelos.
- Generacion de texto creativo en ingles: el modelo, al estar libre de rechazos, puede emplearse para escritura creativa sin las restricciones tipicas de los modelos alineados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano del fichero GGUF mas overhead de contexto):
  - i1-IQ1_S: ~6,6 GB
  - i1-IQ2_M: ~9,9 GB
  - i1-IQ3_M: ~12,9 GB
  - i1-IQ4_XS: ~15,3 GB
  - i1-Q4_K_M: ~17,0 GB
  - i1-Q5_K_M: ~19,9 GB
  - i1-Q6_K: ~23,0 GB
- GPU recomendadas:
  - Cuantizaciones IQ1-IQ2: RTX 3060 12 GB, RTX 4060 Ti 16 GB.
  - Cuantizaciones IQ3-Q4: RTX 4080/4090 16-24 GB, A100 40 GB.
  - Cuantizaciones Q5-Q6: A100 40 GB, H100 80 GB, o configuraciones multi-GPU.
- Cabe en GPU de consumo: si, en cuantizaciones IQ1 a Q4_K_M en GPUs de 12-24 GB; las cuantizaciones Q5 y Q6 requieren 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. El repositorio tambien incluye fichero imatrix para generar cuantizaciones propias.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-abliterated-v4-i1-GGUF (este) | ~27,85 B | no disponible | no disponible | GGUF | Hugging Face |
| Muse-Glimmer-30B-abliterated-v4 (base) | ~27,85 B | no disponible | no disponible | safetensors / transformers | Hugging Face |
| Muse-Glimmer-30B-abliterated-v4-GGUF (cuantizaciones estaticas) | ~27,85 B | no disponible | no disponible | GGUF | Hugging Face |

No se dispone de informacion suficiente para comparar con modelos de otros autores de la misma categoria (por ejemplo, otros modelos abliterated de ~30B) en terminos de rendimiento o benchmarks.

## Limitaciones y advertencias

- El modelo esta etiquetado unicamente en ingles; su rendimiento en castellano u otros idiomas no esta verificado.
- Al ser un modelo "abliterated", se ha eliminado o atenuado el alineamiento de rechazo, lo que aumenta el riesgo de generar contenido inapropiado, ofensivo o peligroso. No es recomendable para aplicaciones de produccion orientadas al publico general sin capas adicionales de moderacion.
- La licencia no esta disponible, por lo que no se puede confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base antes de cualquier despliegue comercial.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero es un riesgo inherente a los modelos de lenguaje de este tamano.
- Las cuantizaciones de muy baja precision (IQ1, IQ2) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "mostly desperate".
- La longitud de contexto no esta documentada, lo que limita la planificacion de aplicaciones que requieran ventanas largas.
- Los ficheros mmproj para vision no estan en este repositorio, sino en el repositorio estatico del autor; es necesario descargarlos por separado para usar las capacidades multimodales.
- El repositorio ocupa 303,4 GB en total, por lo que la descarga completa es costosa en almacenamiento y ancho de banda.
- No se han publicado benchmarks, por lo que el rendimiento real frente a alternativas es desconocido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Muse-Glimmer-30B-abliterated-v4-i1-GGUF
- Modelo base: https://huggingface.co/jsantillana/Muse-Glimmer-30B-abliterated-v4
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Muse-Glimmer-30B-abliterated-v4-GGUF
- Pagina de descarga del autor: https://hf.tst.eu/model#Muse-Glimmer-30B-abliterated-v4-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
