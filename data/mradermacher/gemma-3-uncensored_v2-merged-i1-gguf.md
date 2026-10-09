# mradermacher/Gemma-3-Uncensored_v2-merged-i1-GGUF

## Resumen

Gemma-3-Uncensored_v2-merged-i1-GGUF es una recopilación de cuantizaciones GGUF generadas por mradermacher a partir del modelo ogies99/Gemma-3-Uncensored_v2-merged, un ajuste fino sin censura construido sobre la familia Gemma 3 de Google. El repositorio no contiene pesos originales en safetensors, sino versiones comprimidas con la cadena de herramientas de llama.cpp, orientadas a ejecución local en hardware de consumo.

El modelo base cuenta con 3.880.263.168 parámetros (aproximadamente 3,88 mil millones) y está etiquetado como modelo de visión, lo que implica que el repositorio estático asociado incluye ficheros mmproj para el proyector multimodal. La ficha declara únicamente el idioma inglés y licencia apache-2.0, aunque conviene contrastar esta última con las condiciones de uso de Gemma 3.

Su relevancia práctica radica en que ofrece un abanico muy amplio de cuantizaciones i1 (imatrix), desde IQ1_S de 1,2 GB hasta Q6_K de 3,3 GB, lo que permite desplegar un modelo multimodal de casi 4.000 millones de parámetros en GPUs con poca VRAM o incluso en CPU. El sesgo "uncensored" lo aleja de los casos de uso corporativos regulados, pero lo hace atractivo para experimentación en generación creativa y pruebas de robustez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Gemma 3 (detalle no especificado en la ficha del autor) |
| Parametros totales | 3.880.263.168 (aproximadamente 3,88 B) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Gemma 3 de tamano similar suele emplear ventanas de 128K tokens, dato no confirmado por el autor de esta version) |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K. Tambien existen cuantizaciones estaticas en el repositorio mradermacher/Gemma-3-Uncensored_v2-merged-GGUF |
| Idiomas soportados | en |
| Licencia | apache-2.0 (segun la ficha; el modelo base deriva de Gemma 3, sujeto a las condiciones de uso de Gemma) |
| Formato de pesos | GGUF (mas fichero imatrix auxiliar); el repositorio base original esta en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre el entrenamiento en la ficha proporcionada. El autor de la cuantizacion no documenta el proceso de ajuste fino, el numero de tokens utilizados, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras. Lo unico confirmado es que el modelo deriva de la familia Gemma 3 de Google (etiqueta gemma3 en el repositorio) y que el ajuste "Uncensored_v2" fue realizado por el usuario ogies99 antes de la fusión y el merge.

La etiqueta unsloth en el repositorio sugiere que el entrenamiento o el ajuste fino del modelo base pudo haberse llevado a cabo con la libreria Unsloth, habitual en fine-tuning eficiente de LLM, aunque esto no se confirma de forma explicita. El repositorio aqui analizado es exclusivamente un trabajo de cuantizacion: mradermacher ha aplicado la cadena i1 de llama.cpp con ficheros imatrix para producir los distintos niveles de compresion, ademas de incluir el propio fichero imatrix (0,1 GB) para que terceros puedan generar sus propias cuantizaciones. No hay innovaciones arquitectonicas propias de este repositorio, mas alla de la preservacion del comportamiento multimodal mediante ficheros mmproj alojados en el repositorio estatico.

## Capacidades

- Generacion de texto conversacional en ingles, con el estilo de respuesta propio de un ajuste sin censura.
- Capacidad de vision: al tratarse de un modelo multimodal, puede procesar imagenes si se carga el fichero mmproj correspondiente del repositorio estatico.
- Razonamiento basico y respuesta a instrucciones coherente con la escala de casi 4.000 millones de parametros.
- Compatibilidad con text-generation-inference y endpoints compatibles, segun las etiquetas del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la ficha.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion creativa sin restricciones: el ajuste "uncensored" permite explorar narrativa, dialogos y ficcion sin los filtros habituales de los modelos alineados, lo que resulta util para escritura literaria adulta o generacion de personajes con registros variados.
- Experimentacion con seguridad y robustez: investigadores pueden emplear este modelo como caso de estudio para medir como se comporta un modelo sin alineacion frente a prompts adversarios, comparandolo con la version oficial de Gemma 3.
- Prototipado local en equipos modestos: con cuantizaciones Q4_K_M de 2,6 GB, el modelo puede ejecutarse en un portatil con GPU integrada o en CPU, lo que permite validar ideas de producto sin coste de API.
- Inferencia en el borde (edge) y dispositivos embebidos: las variantes IQ2_M (1,6 GB) e IQ1_S (1,2 GB) hacen viable desplegar un modelo multimodal en dispositivos con menos de 2 GB de VRAM disponible, a costa de perdida de calidad.
- Clasificacion y descripcion de imagenes en local: cargando el fichero mmproj desde el repositorio estatico, el modelo puede generar descripciones de imagenes o responder preguntas visuales sin enviar datos a servicios externos.
- Chat de asistencia en ingles para entornos de prueba: puede integrarse como backend de un chatbot experimental gracias a su compatibilidad con text-generation-inference y con runtimes GGUF como llama.cpp u Ollama.
- Generacion de datos sinteticos para fine-tuning: en tareas donde se busca diversidad estilistica y poca censura, el modelo puede producir corpus de entrenamiento que luego se filtran manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: entre 1,5 y 4 GB para los pesos, dependiendo de la cuantizacion (IQ1_S 1,2 GB; IQ2_M 1,6 GB; Q4_K_S 2,5 GB; Q4_K_M 2,6 GB; Q5_K_M 2,9 GB; Q6_K 3,3 GB). A esta cifra hay que sumar la cache KV, que crece de forma proporcional a la longitud de contexto.
- GPU recomendadas: una NVIDIA RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070 o superiores pueden ejecutar las cuantizaciones de 4 a 6 bits con holgura. Para contextos largos conviene apuntar a 8-12 GB de VRAM. Una A100 o H100 no aporta ventaja significativa a este tamano, salvo por mayor ancho de banda para lotes grandes.
- Cabe en GPU de consumo: si. Incluso una GTX 1650 de 4 GB o una GPU integrada con suficiente memoria compartida puede ejecutar las cuantizaciones mas agresivas (IQ2, IQ3).
- Despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y, con soporte parcial, vLLM con backend GGUF. Para vision es imprescindible cargar el fichero mmproj del repositorio estatico.
- Latencia y throughput: no disponible en la informacion proporcionada. Como referencia orientativa, un modelo denso de 3,88 B en Q4_K_M suele superar los 30-60 tokens por segundo en GPUs de gama media, pero se trata de una estimacion, no de un dato confirmado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Gemma-3-Uncensored_v2-merged-i1-GGUF (este) | 3,88 B | no disponible | apache-2.0 (segun ficha) | GGUF, ingles, vision | Ajuste sin censura, cuantizaciones i1 |
| Gemma 3 4B (oficial) | ~4 B | 128K (segun documentacion oficial) | Gemma Terms of Use | safetensors y GGUF, multimodal | Version alineada, mas segura para produccion |
| Llama 3.2 3B Instruct | 3,2 B | 128K | Llama 3.2 Community License | safetensors y GGUF, solo texto | Buen equilibrio calidad/tamano, alineado |
| Qwen2.5 3B Instruct | 3,09 B | 32K | Apache 2.0 | safetensors y GGUF, solo texto | Multilingue, licencia permisiva |

## Limitaciones y advertencias

- Al tratarse de un ajuste "uncensored", el modelo puede generar contenido ofensivo, violento, sexual o legalmente problemático sin las salvaguardas habituales. No es adecuado para aplicaciones de cara al publico sin capas adicionales de filtrado.
- Riesgo elevado de alucinacion: con casi 4.000 millones de parametros, la capacidad de mantener hechos correctos en contextos largos es limitada.
- Idioma: la ficha solo declara ingles. El rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea pobre.
- Las cuantizaciones de 1 y 2 bits (IQ1_S, IQ2_XXS, Q2_K) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "mostly desperate". Para uso real se recomienda Q4_K_M o superior.
- Licencia: aunque la ficha declara apache-2.0, el modelo deriva de Gemma 3 y por tanto puede estar sujeto a las condiciones de uso de Gemma, que imponen restricciones de uso comercial y de redistribucion. Conviene verificar la licencia real antes de un despliegue en produccion.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad, lo que dificulta auditar el modelo.
- El repositorio ocupa 48,4 GB por acumular todas las variantes de cuantizacion; descargar el modelo completo no es necesario, basta con el fichero GGUF deseado.
- La busqueda web realizada no devolvio ninguna fuente tecnica relevante sobre el modelo; los resultados obtenidos eran contenido no relacionado y sin valor informativo.

## Enlaces

- HuggingFace (este repositorio, cuantizaciones i1): https://huggingface.co/mradermacher/Gemma-3-Uncensored_v2-merged-i1-GGUF
- Repositorio de cuantizaciones estaticas (incluye mmproj para vision): https://huggingface.co/mradermacher/Gemma-3-Uncensored_v2-merged-GGUF
- Modelo base original: https://huggingface.co/ogies99/Gemma-3-Uncensored_v2-merged
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#Gemma-3-Uncensored_v2-merged-i1-GGUF
- Referencia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Documentacion de Gemma 3 de Google: no disponible en la informacion proporcionada.
- Papers o blogs tecnicos: no disponible en la informacion proporcionada.
