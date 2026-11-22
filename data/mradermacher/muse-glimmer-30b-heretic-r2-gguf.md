# mradermacher/Muse-Glimmer-30B-heretic-r2-GGUF

## Resumen

Muse-Glimmer-30B-heretic-r2-GGUF es la version cuantizada en formato GGUF del modelo gjtgjt/Muse-Glimmer-30B-heretic-r2, publicada por mradermacher, un conocido autor de cuantizaciones para llama.cpp. El modelo base es una variante "abliterated" (tambien etiquetada como "heretic") de la familia Muse-Glimmer, derivada mediante la tecnica de rango residual 1 (residual-rank-1), que elimina o atenua el comportamiento de rechazo aprendido durante el alineamiento. El resultado es un modelo de 27.854.794.240 parametros (aproximadamente 27,85 mil millones) con capacidades multimodales declaradas en las etiquetas del repositorio.

La relevancia de esta publicacion es practica: el autor ofrece una bateria completa de cuantizaciones estaticas (de Q2_K a Q8_0, ademas de IQ4_XS y los ficheros mmproj para el codificador multimodal), lo que permite ejecutar un modelo de casi 28 mil millones de parametros en hardware de consumo. El repositorio ocupa 197,5 GB en total, pero las cuantizaciones individuales van desde 10,8 GB (Q2_K) hasta 29,7 GB (Q8_0), con la recomendacion explicita del autor de usar Q4_K_S o Q4_K_M para un equilibrio entre velocidad y calidad.

La licencia declarada es Apache 2.0, lo que facilita el uso comercial, aunque debe tenerse en cuenta que se trata de un modelo derivado de otro modelo derivado y que la informacion sobre datos de entrenamiento, contexto y rendimiento es muy limitada en la documentacion disponible. Los idiomas declarados son ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer multimodal segun etiquetas; detalles no publicados) |
| Parametros totales | 27.854.794.240 (27,85 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Las etiquetas del repositorio indican que se trata de un modelo multimodal (existe un fichero mmproj separado, lo que confirma la presencia de un codificador visual o multimodal en la variante GGUF) y que deriva de la familia Muse-Glimmer. El autor de la cuantizacion no publica detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica destacable es el proceso de "abliteration" mediante residual-rank-1, reflejado en las etiquetas "heretic", "abliterated" y "residual-rank-1". Esta tecnica modifica los pesos del modelo para eliminar la direccion residual asociada al comportamiento de rechazo, dando lugar a un modelo "uncensored". Es importante senalar que este proceso se aplica sobre el modelo base gjtgjt/Muse-Glimmer-30B-heretic-r2, no sobre el modelo original de la familia, y que las implicaciones de calidad de dicho proceso no estan documentadas con benchmarks en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Capacidades multimodales: el repositorio incluye ficheros mmproj (Q8_0 y f16) que permiten el procesamiento de entradas visuales junto con texto.
- Comportamiento "uncensored": el proceso de abliteration reduce los rechazos ante peticiones que el modelo original declinaria.
- Conversacion multi-turno (etiqueta "conversational").
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- No se documenta soporte explicito de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode) en la informacion disponible.
- No se documentan capacidades de audio.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: la cuantizacion Q4_K_M (17,0 GB) permite ejecutar un modelo de 27,85 B en GPUs con 24 GB de VRAM, como la RTX 4090, usando llama.cpp u Ollama.
- Experimentacion con modelos sin censura: util para investigadores que estudian el comportamiento de modelos abliterated, comparan respuestas frente al modelo original o analizan como el proceso de residual-rank-1 afecta a la coherencia y al estilo.
- Procesamiento de documentos con imagenes en ingles o chino: gracias al fichero mmproj, el modelo puede recibir capturas, diagramas o paginas escaneadas junto a instrucciones textuales, aunque la calidad multimodal no esta documentada.
- Prototipado de asistentes conversacionales bilingues (en/zh) en entornos controlados donde no se requiere una ventana de contexto muy larga.
- Fine-tuning adicional o investigacion sobre alineamiento: al estar bajo Apache 2.0 y en formato GGUF, sirve como punto de partida para estudiar tecnicas de modificacion de pesos.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes de cuantizacion, lo que permite medir el impacto de la cuantizacion en la perplejidad y la calidad de las respuestas con un mismo modelo base.
- Uso en pipelines de generacion de texto sin conexion (offline) en entornos con requisitos de privacidad, siempre que el caso de uso no dependa de contexto largo ni de tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~10,8 GB
  - Q3_K_M: ~13,8 GB
  - IQ4_XS: ~15,4 GB
  - Q4_K_M: ~17,0 GB
  - Q5_K_M: ~19,9 GB
  - Q6_K: ~23,0 GB
  - Q8_0: ~29,7 GB
  - Anadir ~2,2 GB (mmproj Q8_0) o ~3,9 GB (mmproj f16) si se usa la entrada multimodal.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q5_K_S; RTX 3090 (24 GB) para las mismas cuantizaciones; A100 40/80 GB o H100 para Q8_0 y para servir con mayor paralelismo.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB usando cuantizaciones de Q4 hacia abajo; en tarjetas de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers. No se documenta compatibilidad con vLLM o TGI para esta variante GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-heretic-r2-GGUF (este) | 27,85 B | no disponible | GGUF | Apache 2.0 | Multimodal, abliterated, cuantizaciones de Q2_K a Q8_0 |
| gjtgjt/Muse-Glimmer-30B-heretic-r2 | 27,85 B | no disponible | safetensors | Apache 2.0 | Modelo base sin cuantizar del que deriva este |
| mradermacher/Muse-Glimmer-30B-heretic-r2-i1-GGUF | 27,85 B | no disponible | GGUF (imatrix) | Apache 2.0 | Variante con cuantizaciones ponderadas/imatrix del mismo autor |
| Alternativas de ~30 B abliterated | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de otros modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Al ser un modelo abliterated, se ha eliminado total o parcialmente el comportamiento de rechazo; esto implica un mayor riesgo de generar contenido danino, ofensivo o inapropiado sin filtros. No es recomendable para aplicaciones de cara al publico sin una capa adicional de moderacion.
- No hay informacion sobre sesgos especificos, pero al derivar de un modelo entrenado principalmente en ingles y chino, es previsible un sesgo hacia ambas culturas y un rendimiento inferior en castellano.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de fidelidad ni de calibracion.
- La longitud de contexto no esta documentada; no debe asumirse una ventana larga en produccion sin verificacion empirica.
- El proceso de residual-rank-1 puede degradar capacidades de razonamiento o coherencia respecto al modelo original; no hay benchmarks que lo confirmen o desmientan.
- La licencia Apache 2.0 se declara en el repositorio, pero al tratarse de un derivado de un derivado, conviene verificar la cadena de licencias del modelo original de la familia Muse-Glimmer antes de un uso comercial.
- El repositorio completo ocupa 197,5 GB; descargar solo la cuantizacion necesaria para evitar consumo innecesario de disco y ancho de banda.
- No se documenta soporte de tool calling ni de agentes; no disenar arquitecturas que dependan de estas capacidades sin validacion previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Muse-Glimmer-30B-heretic-r2-GGUF
- Modelo base: https://huggingface.co/gjtgjt/Muse-Glimmer-30B-heretic-r2
- Cuantizaciones imatrix del mismo autor: https://huggingface.co/mradermacher/Muse-Glimmer-30B-heretic-r2-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Muse-Glimmer-30B-heretic-r2-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
