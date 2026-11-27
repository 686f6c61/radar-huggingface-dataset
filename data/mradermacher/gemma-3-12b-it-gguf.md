# mradermacher/gemma-3-12b-it-GGUF

## Resumen

`mradermacher/gemma-3-12b-it-GGUF` es la coleccion de cuantizaciones en formato GGUF del modelo instructivo `google/gemma-3-12b-it`, publicada por el usuario mradermacher el 15 de marzo de 2025. No se trata de un modelo entrenado desde cero, sino de una conversion de los pesos originales de Google a cuantizaciones estaticas (Q2_K hasta Q8_0) y un proyector multimodal (mmproj) para su uso con llama.cpp y derivados. El modelo base cuenta con 11.765.788.416 parametros (aproximadamente 12 mil millones) y es la variante de tamano medio de la familia Gemma 3.

El interes de esta publicacion radica en que permite ejecutar un modelo de 12B con capacidades multimodales (vision) e instrucciones en hardware de consumo, algo inviable con los pesos en bf16 (que ocuparian unos 24 GB). Las cuantizaciones Q4_K_M (7,4 GB) y Q5_K_M (8,5 GB) son las mas recomendadas por el autor para un equilibrio entre calidad y velocidad, mientras que Q8_0 (12,6 GB) preserva practicamente la calidad del original.

La relevancia actual es doble: por un lado, Gemma 3 introduce soporte multimodal nativo y una ventana de contexto ampliada respecto a Gemma 2; por otro, la existencia de cuantizaciones GGUF de terceros facilita el despliegue en entornos sin GPU de datacenter. Conviene senalar que esta ficha describe tanto el modelo base de Google como el paquete de cuantizaciones, ya que la model card del repositorio GGUF es minima y remite al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3); detalles finos no disponibles en la informacion proporcionada |
| Parametros totales | 11.765.788.416 (11,77 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; ademas mmproj-Q8_0 y mmproj-f16 para vision |
| Idiomas soportados | en (segun metadatos del repo; el modelo base Gemma 3 soporta mas idiomas, pero no se detalla en la informacion disponible) |
| Licencia | gemma (Gemma Terms of Use de Google) |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `google/gemma-3-12b-it` mas alla de que pertenece a la familia Gemma 3 de Google, que son transformers decoder-only. No se especifican en la informacion proporcionada el numero de capas, dimensiones ocultas, tipo de atencion, ni la composicion del dataset de entrenamiento (numero de tokens, mezcla de datos, uso de RLHF/DPO). Tampoco se documentan innovaciones tecnicas concretas como decodificacion especulativa o atencion lineal.

Lo que si es verificable es el proceso de esta publicacion: mradermacher ha convertido los pesos safetensors del modelo base a GGUF mediante herramientas de llama.cpp, generando cuantizaciones estaticas (no imatrix; las versiones ponderadas estan en un repositorio separado `gemma-3-12b-it-i1-GGUF`). El repositorio incluye ademas dos ficheros `mmproj` (Q8_0 y f16) que actuan como suplemento multimodal, lo que confirma que el modelo base es capaz de procesar imagenes. El tamano total del repo (83,8 GB) refleja la suma de todas las cuantizaciones y los proyectores.

## Capacidades

- Generacion de texto conversacional e instrucciones en ingles (etiqueta `conversational`).
- Procesamiento multimodal de imagenes: el repositorio incluye proyectores `mmproj-Q8_0` y `mmproj-f16`, lo que habilita entrada de vision en llama.cpp.
- Razonamiento y respuesta a instrucciones heredados del modelo instructivo `gemma-3-12b-it`.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere uso en servidores de inferencia tipo llama.cpp server.
- Soporte multilingue limitado segun los metadatos (solo `en` declarado en este repo), aunque el modelo base de Google podria cubrir mas idiomas; no se detalla.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, agentes o modo thinking.

## Casos de uso

- Asistente conversacional local en ingles: con la cuantizacion Q4_K_M (7,4 GB) el modelo cabe en una GPU de consumo de 8-12 GB y puede gestionar dialogos multi-turno, adecuado para prototipos y uso personal sin depender de la nube.
- Analisis de imagenes en local: gracias a los ficheros `mmproj`, se puede alimentar el modelo con capturas, diagramas o fotos para descripcion, extraccion de texto o preguntas sobre la imagen, todo en llama.cpp.
- Generacion de codigo y explicaciones tecnicas: el modelo instructivo de 12B es suficiente para autocompletado, refactorizacion y explicacion de fragmentos en entornos con recursos limitados, aunque sin garantias de tool calling nativo.
- Procesamiento por lotes en CPU: la cuantizacion Q2_K (4,9 GB) permite ejecutar el modelo en servidores sin GPU para tareas de clasificacion, resumen o extraccion de informacion donde la latencia no es critica.
- Educacion e investigacion: sirve como banco de pruebas para estudiar el impacto de distintas cuantizaciones (Q2 a Q8) en la calidad de salida sobre un mismo modelo base, comparando perplejidad y respuestas.
- Despliegue en edge o entornos aislados: al ser GGUF y funcionar con llama.cpp, se puede empaquetar en dispositivos con poca memoria o en redes sin acceso a Internet, manteniendo el modelo y los pesos en local.
- Chatbot de soporte interno en ingles: con Q5_K_M (8,5 GB) en una RTX 4090 o similar se obtiene una latencia interactiva adecuada para atencion a empleados sobre documentacion interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones numericas; unicamente remite a una grafica externa de perplejidad por tipo de cuantizacion (enlace a nethype.de) sin valores concretos.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto):
  - Q2_K: ~5 GB, apto para GPU de 6-8 GB.
  - Q4_K_M: ~7,5-8 GB, apto para RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070.
  - Q5_K_M: ~8,5-9 GB, recomendado para RTX 4070 Super / 4080.
  - Q8_0: ~12,6-13 GB, requiere RTX 4080/4090 o GPU de datacenter.
  - mmproj adicional: 0,7 GB (Q8_0) o 1,0 GB (f16) si se usa vision.
- GPU recomendadas: RTX 3060 12 GB o superior para Q4; RTX 4090, A100 o H100 para Q8_0 con contexto largo y vision.
- Cabe en GPU de consumo: si, desde Q2_K hasta Q8_0 en funcion del modelo de GPU; Q4_K_M es la opcion mas equilibrada para 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), llama-cpp-python, servidores compatibles con la API de endpoints; no se menciona vLLM ni TGI (que no consumen GGUF de forma nativa).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-3-12b-it (este, via GGUF) | 11,77 B | no disponible | si (mmproj) | gemma | GGUF, safetensors |
| google/gemma-2-9b-it | ~9 B | no disponible | no | gemma | safetensors, GGUF (terceros) |
| meta-llama/Llama-3.1-8B-Instruct | ~8 B | no disponible | no | llama3.1 | safetensors, GGUF (terceros) |
| mistralai/Mistral-Nemo-Instruct-2407 | ~12 B | no disponible | no | Apache 2.0 | safetensors, GGUF (terceros) |

Nota: los datos de contexto y rendimiento de los modelos comparados no se han verificado en la informacion proporcionada; la tabla se limita a parametros y licencias conocidos. La principal ventaja de esta publicacion frente a alternativas es la disponibilidad de cuantizaciones GGUF listas para usar con soporte multimodal, algo que no todos los modelos de su tamano ofrecen de forma nativa.

## Limitaciones y advertencias

- La model card del repositorio GGUF es minima y no documenta sesgos, tasas de alucinacion ni evaluaciones de seguridad; se desconoce el comportamiento real en dominios sensibles.
- El idioma declarado es unicamente `en`; el rendimiento en castellano no esta garantizado ni documentado, por lo que su uso en produccion en espanol requiere validacion previa.
- Riesgo de alucinacion inherente a los modelos de 12B, especialmente en tareas de razonamiento complejo o con contexto largo; no hay datos publicados que lo cuantifiquen.
- La licencia `gemma` (Gemma Terms of Use) impone restricciones de uso comercial y requiere aceptacion explicita del acuerdo; no es una licencia permisiva tipo Apache 2.0 y debe revisarse antes de desplegar en producto.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) degradan notablemente la fidelidad; el autor solo recomienda explicitamente Q4_K_S, Q4_K_M y Q8_0 como "fast, recommended" o "best quality".
- El repositorio pesa 83,8 GB en total; descargar solo la cuantizacion necesaria, no el repo completo.
- No se documenta soporte de tool calling ni de agentes; no asumir estas capacidades sin probarlas.
- El modelo base esta sujeto a gating en Hugging Face (acceso tras aceptar la licencia de Google); esta publicacion GGUF hereda esas obligaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma-3-12b-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma-3-12b-it-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#gemma-3-12b-it-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos: https://huggingface.co/mradermacher/model_requests
