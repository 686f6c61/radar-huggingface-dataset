# mradermacher/DaisyRose-27B-Heretic-v2-MTP-GGUF

## Resumen

DaisyRose-27B-Heretic-v2-MTP-GGUF es la distribucion en formato GGUF del modelo kelsey1337/DaisyRose-27B-Heretic-v2-MTP, publicada por mradermacher, un conocido cuantizador de la comunidad de Hugging Face. El modelo base es una variante "heretic" (abliterated) derivada de la familia Qwen3.8, orientada a eliminar los mecanismos de rechazo del modelo original mediante tecnicas de abliteration. Incluye soporte de MTP (Multi-Token Prediction) para decodificacion especulativa, lo que permite acelerar la generacion de tokens.

El repositorio proporciona unicamente cuantizaciones estaticas en formato GGUF, sin versiones ponderadas ni imatrix en el momento de la publicacion. Los tamanos oscilan entre 11,3 GB (Q2_K) y 29,1 GB (Q8_0), e incluye dos ficheros mmproj (Q8_0 y f16) que sugieren capacidad multimodal, aunque la model card no detalla la arquitectura de vision.

Es relevante para desarrolladores que necesiten desplegar un modelo de gran tamano en hardware de consumo mediante llama.cpp u Ollama, con la particularidad de incorporar decodificacion especulativa via MTP y un ajuste orientado a reducir restricciones de contenido. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8, segun tags); soporte MTP para decodificacion especulativa |
| Parametros totales | 460.730.096 (dato de safetensors del repo base); el nombre indica 27B, discrepancia no aclarada en la informacion disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q6_K, Q8_0 (estaticas); mmproj Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de los tags, que apuntan a una derivacion de Qwen3.8 con soporte de MTP (Multi-Token Prediction). El tag "heretic" y "abliterated" indica que el modelo ha sido sometido a un proceso de abliteration, una tecnica que elimina la direccion de activacion asociada al rechazo de peticiones, reduciendo las negativas del modelo a responder. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica destacable es la integracion de MTP para decodificacion especulativa, que permite al modelo predecir varios tokens por paso y acelerar la inferencia. Los ficheros mmproj incluidos sugieren soporte multimodal (probablemente vision), aunque no se documenta en la model card. El cuantizador senala que las cuantizaciones son estaticas, sin versiones ponderadas ni imatrix disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto en ingles.
- Razonamiento y respuesta a instrucciones (heredadas del modelo base Qwen3.8, no verificadas en la informacion disponible).
- Decodificacion especulativa mediante MTP para acelerar la inferencia.
- Posible capacidad multimodal (vision) por la presencia de ficheros mmproj, no confirmada en la documentacion.
- Comportamiento "abliterated": menor tendencia a rechazar peticiones.
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles segun los tags.

## Casos de uso

- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_S (15,9 GB) y Q3_K_M (13,8 GB) permiten ejecutar el modelo en GPUs con 16-24 GB de VRAM mediante llama.cpp u Ollama, con calidad aceptable para generacion de texto en ingles.
- Aceleracion de inferencia con decodificacion especulativa: el soporte MTP permite reducir la latencia en entornos interactivos donde la velocidad de generacion es critica, siempre que el runtime lo soporte.
- Investigacion sobre abliteration y seguridad: util para estudiar el efecto de la eliminacion de mecanismos de rechazo en el comportamiento del modelo y en sus sesgos residuales.
- Generacion de contenido creativo sin restricciones: orientado a tareas donde el modelo base podria negarse a responder, como narrativa adulta o temas sensibles, con las advertencias eticas correspondientes.
- Experimentacion con modelos multimodales: si se confirma la capacidad de vision, los ficheros mmproj permiten procesar imagenes junto con texto en pipelines de investigacion.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece un rango amplio de cuantizaciones (desde Q2_K hasta Q8_0) para medir el impacto de la compresion en la calidad y la velocidad en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - Q2_K: ~11,3 GB
  - Q3_K_S: ~12,4 GB
  - Q3_K_M: ~13,8 GB
  - Q3_K_L: ~15,0 GB
  - Q4_K_S: ~15,9 GB
  - Q6_K: ~22,5 GB
  - Q8_0: ~29,1 GB
  - mmproj (vision): ~0,7-1,0 GB adicionales
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_S y Q6_K; RTX 3090 (24 GB) similar; A100/H100 para Q8_0 o despliegues concurrentes.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_S o Q6_K; en GPUs de 16 GB con Q3_K_M o Q3_K_S; en GPUs de 12 GB solo con Q2_K (calidad degradada).
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF y MTP (soporte de decodificacion especulativa variable segun runtime).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B-Heretic-v2-MTP-GGUF | 27B (segun nombre) / 460,7M (safetensors) | no disponible | apache-2.0 | GGUF | Abliterated, MTP, solo ingles |
| Modelo base DaisyRose-27B-Heretic-v2-MTP | idem | no disponible | apache-2.0 | safetensors | Version sin cuantizar |
| Qwen3.8 (familia original) | no disponible | no disponible | no disponible | safetensors/GGUF | Modelo de referencia sin abliteration |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo es "abliterated": se ha eliminado el mecanismo de rechazo, lo que aumenta el riesgo de generar contenido inapropiado, danino o sesgado sin filtros.
- Solo soporta ingles segun los tags; el rendimiento en castellano no esta garantizado.
- Existe una discrepancia entre el nombre (27B) y los parametros reales en safetensors (460,7 M); conviene verificar el modelo base antes de usarlo en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones que lo cuantifiquen.
- La licencia Apache 2.0 permite uso comercial, pero el autor del modelo base no documenta restricciones adicionales ni el origen de los datos de entrenamiento.
- Las cuantizaciones son estaticas (sin imatrix), por lo que la calidad en cuantizaciones bajas (Q2_K, Q3_K_S) puede ser inferior a la de cuantizaciones ponderadas equivalentes.
- El soporte de MTP depende del runtime; no todos los motores de inferencia implementan decodificacion especulativa para este formato.
- No hay informacion sobre sesgos especificos, datos de entrenamiento ni evaluaciones de seguridad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/DaisyRose-27B-Heretic-v2-MTP-GGUF
- Modelo base: https://huggingface.co/kelsey1337/DaisyRose-27B-Heretic-v2-MTP
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#DaisyRose-27B-Heretic-v2-MTP-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
