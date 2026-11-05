# mradermacher/StoryGen-12B-It-GGUF

## Resumen

StoryGen-12B-It-GGUF es la distribucion en formato GGUF del modelo StoryGen-12B-It, un modelo de lenguaje de 11.907.350.576 parametros (aproximadamente 12B) afinado para instrucciones y especializado en narracion y escritura creativa, con enfasis declarado en la generacion de guiones para YouTube Shorts. El modelo original fue desarrollado por turtle0001 y esta construido sobre una base de la familia Gemma, segun indica la licencia `gemma` y el tag `unsloth` que sugiere un proceso de fine-tuning eficiente sobre dicha familia. Esta version concreta la publica mradermacher, un conocido distribuidor de cuantizaciones estaticas en GGUF.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo de ~12B especializado en creatividad textual en hardware de consumo, gracias a las cuantizaciones que van desde Q2_K (4,9 GB) hasta Q8_0 (12,8 GB). El repositorio incluye ademas ficheros `mmproj` (multi-modal supplement), lo que sugiere capacidades multimodales en el modelo base, aunque no se detalla su alcance.

No se dispone de informacion publica sobre la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks. El modelo esta etiquetado unicamente para ingles (`en`) y su licencia es la de Gemma, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma, segun licencia y tags); detalles no disponibles |
| Parametros totales | 11.907.350.576 (~12B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | gemma |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de ~12B parametros derivado de la familia Gemma, segun indica la licencia `gemma` y el tag `unsloth`, que apunta a un fine-tuning supervisado eficiente en memoria sobre el modelo base. El modelo original `turtle0001/StoryGen-12B-It` se distribuye como un modelo fusionado (`merged`), lo que sugiere la combinacion de adaptadores LoRA en los pesos base tras el ajuste por instrucciones.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Los tags `storytelling`, `creative-writing` e `instruction-tuned` indican que el ajuste se oriento a la generacion narrativa y a seguir instrucciones en ese dominio. La presencia de ficheros `mmproj` en el repositorio GGUF sugiere que el modelo base incorpora un proyector multimodal, presumiblemente heredado de la arquitectura Gemma multimodal, aunque la model card no aporta detalles sobre resolucion de imagenes, tokens visuales ni modalidades soportadas.

## Capacidades

- Generacion de texto narrativo: cuentos, relatos, dialogos y ficcion en ingles, con enfasis en escritura creativa.
- Generacion de guiones para YouTube Shorts, segun el tag explicito `youtube-shorts`.
- Seguimiento de instrucciones en el dominio creativo (`instruction-tuned`).
- Capacidades multimodales potenciales: el repositorio incluye ficheros `mmproj`, lo que sugiere soporte de entrada de imagenes en el modelo base, aunque no se documenta su alcance.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el tag `language: en`.
- Capacidades especiales (thinking mode, vision, audio): vision posible por los ficheros `mmproj`; thinking mode y audio no disponibles.

## Casos de uso

- Generacion de guiones para YouTube Shorts: el modelo esta afinado especificamente para este formato, de modo que puede producir guiones breves con gancho inicial, desarrollo y cierre en pocas lineas, ajustados a la duracion tipica de un Short.
- Escritura creativa asistida: util para redactar relatos cortos, cuentos y ficcion por capitulos en ingles, aprovechando el fine-tuning sobre datos narrativos; adecuado para autores que necesitan borradores rapidos en local sin enviar texto a servicios en la nube.
- Prototipado de videojuegos y narrativa interactiva: puede generar descripciones de personajes, dialogos ramificados y texto de ambientacion para motores de ficcion interactiva, ejecutandose en una GPU de consumo con cuantizacion Q4_K_M (7,5 GB).
- Generacion de contenido para redes sociales: produccion de microrelatos, hilos narrativos y textos promocionales en ingles, con despliegue via llama.cpp u Ollama en estaciones de trabajo sin GPU dedicada de gama alta.
- Educacion y talleres de escritura: herramienta de apoyo para generar ejemplos de estructuras narrativas, variaciones de un mismo relato o ejercicios de estilo, ejecutable localmente en portatiles con 8-16 GB de RAM usando Q4_K_S o Q4_K_M.
- Investigacion sobre fine-tuning creativo: al estar construido sobre Gemma y distribuirse como modelo fusionado, sirve como caso de estudio para comparar el efecto del ajuste por instrucciones en dominios creativos frente al modelo base.
- Generacion de descripciones a partir de imagenes (potencial): si el proyector `mmproj` funciona correctamente, podria emplearse para narrar o describir imagenes, aunque esta capacidad no esta documentada y requiere validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K (4,9 GB): ~6-7 GB de VRAM.
  - Q3_K_M (6,2 GB): ~7,5-8,5 GB.
  - Q4_K_S / Q4_K_M (7,1-7,5 GB): ~9-10 GB.
  - Q5_K_M (8,6 GB): ~10-11 GB.
  - Q6_K (9,9 GB): ~11,5-12,5 GB.
  - Q8_0 (12,8 GB): ~14-15 GB.
  - Ficheros `mmproj` (0,2-0,3 GB): suman al total si se usa la via multimodal.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M y Q5_K_M; RTX 4090 24 GB para Q8_0 con contexto amplio; A100/H100 solo si se requiere alto throughput concurrente.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas usando Q3_K_M o inferiores; con 12-16 GB se accede a Q4_K_M y Q5_K_M con margen.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; vLLM y TGI no soportan GGUF de forma nativa, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| StoryGen-12B-It-GGUF | ~12B | no disponible | GGUF | gemma | Especializado en narrativa y YouTube Shorts; solo ingles |
| Modelo base turtle0001/StoryGen-12B-It | ~12B | no disponible | safetensors | gemma | Mismo modelo sin cuantizar; referencia para comparar perdida por cuantizacion |
| Gemma 2 9B / Gemma 3 12B (familia base) | 9B / 12B | no disponible en esta ficha | safetensors, GGUF | gemma | Modelos generalistas de la misma familia; no especializados en narrativa |
| Mistral Nemo 12B (referencia de tamano) | 12B | no disponible en esta ficha | safetensors, GGUF | Apache 2.0 | Alternativa de tamano similar con licencia permisiva, aunque no especializada en ficcion |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado unicamente para ingles; el rendimiento en castellano no esta garantizado y probablemente sea deficiente.
- Sesgos: no se documentan evaluaciones de sesgo; al ser un modelo afinado sobre datos creativos, puede reproducir estereotipos narrativos presentes en el corpus de entrenamiento.
- Alucinacion: como todo modelo generativo de ~12B, puede inventar hechos, nombres y citas; en contextos narrativos esto es esperado, pero lo desaconseja para tareas factuales.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de la licencia Gemma de Google, que impone restricciones de uso aceptable y obligaciones de atribucion; conviene revisarla antes de desplegar en produccion.
- Contexto: se desconoce la longitud de contexto; no debe asumirse una ventana larga sin verificacion empirica.
- Capacidad multimodal incierta: la presencia de ficheros `mmproj` no garantiza que la via multimodal este correctamente integrada ni documentada; requiere pruebas.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- Sin datos de benchmarks ni de evaluacion humana: no hay evidencia publica de calidad frente a alternativas, por lo que la eleccion debe basarse en pruebas propias.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion practicamente inexistente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/StoryGen-12B-It-GGUF
- Modelo base: https://huggingface.co/turtle0001/StoryGen-12B-It
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#StoryGen-12B-It-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
