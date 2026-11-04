# mradermacher/Lunar-Trace-31B-i1-GGUF

## Resumen

Lunar-Trace-31B-i1-GGUF es una cuantizacion en formato GGUF del modelo Cyclone-Labs/Lunar-Trace-31B, publicada por el usuario mradermacher, especializado en generar versiones comprimidas de modelos abiertos. El modelo base es un merge de 30.697.345.596 parametros (aproximadamente 30,7B) orientado a roleplay y storytelling, construido mediante mergekit y publicado bajo licencia Apache 2.0. Esta version concreta emplea cuantizaciones de tipo i1 (imatrix) para reducir el peso del modelo manteniendo la mayor calidad posible en cada rango de tamano.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 31B en hardware de consumo mediante cuantizaciones que van desde los 12,0 GB (i1-Q2_K) hasta los 17,9 GB (i1-Q4_K_S), con la posibilidad de generar otras variantes a partir del archivo imatrix incluido. El modelo esta disenado especificamente para generacion conversacional creativa en ingles, no para tareas de razonamiento tecnico o codigo, y su naturaleza de merge implica que hereda caracteristicas de sus modelos constituyentes sin un entrenamiento adicional documentado.

Al tratarse de una cuantizacion y no de un modelo original, esta ficha describe tanto las caracteristicas del modelo base (arquitectura, capacidades, casos de uso) como las particularidades del proceso de cuantizacion (tipos disponibles, tamanos, requisitos de hardware). La informacion disponible sobre el modelo base es limitada: no se han publicado detalles sobre la composicion del dataset de entrenamiento, el numero de tokens procesados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (merge de modelos, sin detalles adicionales disponibles) |
| Parametros totales | 30.697.345.596 (aproximadamente 30,7B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S, ademas de otras variantes listadas en la model card (Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, IQ2_M, IQ3_XXS, IQ4_XS, entre otras) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Cyclone-Labs/Lunar-Trace-31B es un merge construido con mergekit, lo que significa que sus pesos se obtienen combinando los parametros de dos o mas modelos preexistentes mediante alguna tecnica de fusion (no especificada en la informacion disponible). No se trata, por tanto, de un modelo entrenado desde cero, sino de una sintesis de capacidades heredadas de sus constituyentes. La model card no detalla que modelos se fusionaron, que metodo de merge se aplico (SLERP, TIES, DARE, etc.) ni si hubo un post-entrenamiento adicional como RLHF o DPO.

La cuantizacion i1-GGUF realizada por mradermacher utiliza un archivo imatrix (matriz de importancia) para ponderar la cuantizacion de cada tensor segun su relevancia en la salida del modelo. Este enfoque, desarrollado en el ecosistema llama.cpp, produce cuantizaciones de mayor calidad que las estaticas a igualdad de tamano, especialmente en rangos bajos (Q2, Q3). El repositorio incluye el archivo imatrix original (0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones. No se dispone de informacion sobre innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en roleplay y storytelling segun las etiquetas del modelo.
- Narracion creativa y mantenimiento de personajes en dialogos multi-turno (capacidad inferida de su orientacion a roleplay).
- Generacion de texto general y respuesta a instrucciones conversacionales.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponible. La model card menciona que es un "vision model" y que los archivos mmproj, si existen, estarian en el repositorio estatico, pero no se confirma que esta cuantizacion incluya capacidades de vision funcionales.

## Casos de uso

- Roleplay conversacional: el modelo puede mantener interacciones multi-turno con personajes consistentes, adecuado para aplicaciones de entretenimiento, chatbots de personajes o juegos de rol textuales, gracias a su orientacion especifica a roleplay.
- Generacion de ficcion y storytelling: util para escritores que necesitan borradores de narrativa, continuaciones de escenas o generacion de dialogos, ejecutable localmente en hardware de consumo con la cuantizacion i1-Q4_K_S (17,9 GB).
- Prototipado de asistentes creativos en local: desarrolladores que quieran experimentar con un modelo de 31B en una sola GPU consumer pueden usar la variante i1-IQ3_M (14,5 GB) para iterar rapidamente sin depender de APIs.
- Generacion de dialogos para videojuegos o narrativa interactiva: el modelo puede producir respuestas de personajes no jugadores (NPC) en ingles, integrándose en motores de juego mediante llama.cpp u Ollama.
- Experimentacion con merges y cuantizaciones: investigadores interesados en evaluar el impacto de distintas cuantizaciones i1 sobre un modelo fusionado pueden comparar las variantes Q2_K, IQ3_M y Q4_K_S incluidas en el repositorio.
- Generacion de contenido creativo por lotes: con la cuantizacion Q4_K_S y un servidor llama.cpp, se pueden generar grandes volumenes de texto narrativo en ingles para datasets sinteticos o pruebas de concepto.
- Educacion y demostraciones: util para mostrar en talleres o cursos como ejecutar un modelo de 31B en local con cuantizacion GGUF, usando el archivo imatrix como ejemplo de cuantizacion ponderada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - i1-Q2_K (12,0 GB): aproximadamente 12-13 GB de VRAM.
  - i1-IQ3_M (14,5 GB): aproximadamente 14,5-16 GB de VRAM.
  - i1-Q4_K_S (17,9 GB): aproximadamente 18-20 GB de VRAM.
  - Otras variantes de mayor tamano (Q5_K_M, Q6_K) requeriran mas VRAM, no cuantificada en la informacion disponible.
- GPU recomendadas: para Q4_K_S, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente para los pesos; para IQ3_M, una RTX 4080 (16 GB) puede ser ajustada; para Q2_K, una RTX 4070 Ti Super (16 GB) o similar.
- Cabe en GPU consumer: si, en tarjetas con 16 GB o mas de VRAM para las cuantizaciones bajas y medias; las variantes Q5/Q6 requeriran 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, text-generation-webui con el loader de llama.cpp). vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que no se recomiendan.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lunar-Trace-31B-i1-GGUF (este) | 30,7B | no disponible | Apache 2.0 | GGUF (i1) | Merge orientado a roleplay, solo ingles |
| Cyclone-Labs/Lunar-Trace-31B | 30,7B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| mradermacher/Lunar-Trace-31B-GGUF | 30,7B | no disponible | Apache 2.0 | GGUF (estatico) | Cuantizaciones estaticas del mismo modelo base |
| Modelos de roleplay de ~30B (generico) | ~30B | variable | variable | variable | No se dispone de datos concretos de alternativas comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento (benchmarks) con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo exclusivamente en ingles: no soporta castellano ni otros idiomas de forma fiable.
- Orientado a roleplay y storytelling: no esta disenado para tareas de razonamiento tecnico, matematicas o codigo, y su rendimiento en esas areas no esta documentado.
- Riesgo de alucinacion: al ser un modelo generativo de ficcion, puede producir contenido factualmente incorrecto; no debe usarse como fuente de informacion veraz sin verificacion.
- Naturaleza de merge: al no haber sido entrenado desde cero, sus capacidades dependen de los modelos constituyentes, no documentados; puede heredar sesgos de estos.
- Cuantizacion agresiva: las variantes Q2_K e IQ3_M pueden degradar la coherencia y la calidad del texto respecto al modelo original en safetensors; se recomienda Q4_K_S o superior para produccion.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que los modelos constituyentes del merge no impongan restricciones adicionales, algo que no se puede confirmar con la informacion disponible.
- Capacidad de vision no confirmada: la model card menciona que es un "vision model", pero no se especifica si esta cuantizacion incluye los archivos mmproj necesarios; verificar en el repositorio estatico antes de asumir soporte multimodal.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas, lo que dificulta la seleccion objetiva en produccion.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/mradermacher/Lunar-Trace-31B-i1-GGUF
- Modelo base: https://huggingface.co/Cyclone-Labs/Lunar-Trace-31B
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Lunar-Trace-31B-GGUF
- Pagina de descargas convenientes: https://hf.tst.eu/model#Lunar-Trace-31B-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Web de nethype GmbH: https://www.nethype.de/
