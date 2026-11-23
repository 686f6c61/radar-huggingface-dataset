# gatilin/wemm-video-2b-vision-encoder

## Resumen

`gatilin/wemm-video-2b-vision-encoder` es un paquete de pesos extraido del modelo multimodal `tencent/WeMM-Video-2B`, publicado por el usuario gatilin en Hugging Face. No se trata de un modelo completo, sino de un componente aislado: la torre visual (vision encoder) del modelo original, con todos los tensores `model.visual.*` correspondientes a la revision fijada `821690998399cac0f55bb7f7f805ebafa650c3a4`. Incluye el codificador visual de 24 capas de estilo Qwen3.5, las embeddings de parches y el merger espacial, pero excluye el codificador de audio, el modelo de lenguaje y el sistema de chat audio-video completo.

El componente tiene 331.416.576 parametros en BF16 (297 tensores, 662.833.152 bytes), con 16 cabezas de atencion, anchura oculta de 1024, tamano de parche 16 y parche temporal 2, y un merger espacial 2x2 que proyecta a anchura 2048. Su proposito es permitir la extraccion de caracteristicas visuales (image-feature-extraction) de forma aislada, sin necesidad de cargar el modelo completo de 2B parametros ni sus dependencias de audio y lenguaje.

Es relevante para desarrolladores e investigadores que quieran reutilizar la torre visual de WeMM-Video-2B en pipelines propios de vision (por ejemplo, para experimentar con embeddings de imagen o video) sin arrastrar el resto del sistema multimodal. El paquete incluye la implementacion nativa del codificador bajo `native_source` y un script `component.py` para cargarlo, aunque no esta registrado como `AutoModel` de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision encoder tipo Qwen3.5 (24 capas, transformer visual) |
| Parametros totales | 331.416.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16; el paquete no documenta cuantizaciones) |
| Idiomas soportados | no disponible (componente visual, sin capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 297 tensores BF16) |

## Arquitectura y entrenamiento

El componente es una torre visual de 24 capas con atencion de 16 cabezas y anchura oculta de 1024. Procesa imagenes mediante patch embeddings con tamano de parche 16 y tamano de parche temporal 2, y aplica un merger espacial 2x2 que proyecta la representacion a anchura 2048. La implementacion de referencia es la del modelo original `tencent/WeMM-Video-2B`, de estilo Qwen3.5, y se incluye bajo `native_source` junto con las importaciones de modulo necesarias. Las claves del checkpoint se eliminan solo durante la carga estricta del state-dict.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos ni si hubo RLHF, DPO u otras fases de alineamiento, ya que la model card solo describe el proceso de extraccion. La validacion publicada (`validation.json`) registra cargas estrictas y pasadas forward en CPU float32 sobre dos imagenes reales de COCO128 redimensionadas a 224x224, produciendo 196 tokens de parche de anchura 1024 y 49 tokens fusionados de anchura 2048; en las capas 0, 11 y 23 la atencion explicita coincidio con SDPA nativo. Esta prueba de humo no valida el modelo completo, el procesamiento de audio, el rendimiento video-lenguaje ni la precision en tareas.

## Capacidades

- Extraccion de caracteristicas visuales de imagenes: genera `last_hidden_state` (196 tokens de anchura 1024 para entrada 224x224) y `pooler_output` (49 tokens de anchura 2048).
- Procesamiento de parches espaciales y temporales (parche 16, temporal 2), apto para secuencias de imagen y potencialmente video.
- Integracion con `Qwen2VLImageProcessor` para el preprocesado de imagenes.
- Carga mediante script propio (`component.py`) con `load_model(root, device, dtype)`; no expuesto como `AutoModel`.
- No incluye generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades multilingues.
- No incluye vision-lenguaje: el decoder y el sistema de chat no forman parte del paquete.

## Casos de uso

- Extraccion de embeddings visuales para busqueda por similitud: usar `pooler_output` (49 tokens de anchura 2048) como representacion compacta de imagen para indexar y recuperar imagenes en un motor vectorial.
- Preprocesado para pipelines de vision propia: integrar la torre visual como extractor de features congelado en un modelo downstream (clasificacion, deteccion o captioning) que aporte su propio decoder.
- Investigacion sobre representaciones visuales de WeMM-Video-2B: analizar las activaciones de las 24 capas (la validacion comprueba capas 0, 11 y 23) sin cargar el modelo multimodal completo.
- Prototipado ligero en CPU: al ser un componente de 331M parametros en BF16 (0,7 GB de repo), permite experimentar en maquinas sin GPU dedicada, como demuestra la validacion en CPU float32.
- Generacion de features para video: el parche temporal 2 sugiere uso sobre secuencias de frames, util para tareas de analisis temporal que solo requieran representacion visual.
- Base para destilar o comparar torres visuales: servir como referencia reproducible (SHA-256 documentado) frente a otras variantes de encoder visual en experimentos de ablation.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion documentada es una prueba de humo (`validation.json`) sobre dos imagenes COCO128 a 224x224 que confirma formas de salida y coincidencia de atencion con SDPA, sin metricas de precision de tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en BF16 (331M parametros); en float32 en CPU ronda 1,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el componente es lo bastante pequeno para GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna de consumo.
- Opciones de despliegue: carga nativa mediante `component.py` y `native_source` incluidos en el repo; no esta registrado como `AutoModel`, por lo que no es directamente compatible con vLLM, TGI u Ollama sin adaptacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gatilin/wemm-video-2b-vision-encoder | 331M (solo torre visual) | no disponible | Apache-2.0 | Hugging Face, componente extraido |
| tencent/WeMM-Video-2B | ~2B (modelo completo multimodal) | no disponible | Apache-2.0 | Hugging Face, modelo completo |
| Qwen2-VL (vision encoder) | no disponible | no disponible | no disponible | Hugging Face |

La comparativa con otros encoders visuales independientes no esta disponible en la informacion proporcionada; el unico punto de referencia directo es el modelo base del que se extrajo.

## Limitaciones y advertencias

- No es un modelo completo: carece de decoder de lenguaje, codificador de audio y sistema de chat; no puede generar texto ni responder preguntas.
- La validacion publicada es una prueba de humo limitada a dos imagenes; no valida precision en tareas ni rendimiento video-lenguaje.
- Los shards originales no se descargaron ni hashearon de forma independiente; solo se verifico byte a byte el payload extraido contra la cache HTTP de rangos.
- Requiere la implementacion nativa incluida (`native_source`) y no funciona como `AutoModel` estandar de Transformers.
- La validacion uso Transformers 5.21.1 con una comprobacion de version de tokenizer relajada localmente; el tokenizer no se utilizo.
- Licencia Apache-2.0 heredada del modelo fuente; conviene consultar el modelo original para atribucion y dependencias de terceros.
- No se documentan sesgos, riesgos de alucinacion (no aplica al no generar texto) ni limitaciones de idioma.

## Enlaces

- Hugging Face: https://huggingface.co/gatilin/wemm-video-2b-vision-encoder
- Modelo base: https://huggingface.co/tencent/WeMM-Video-2B
- Revision fijada del modelo base: `821690998399cac0f55bb7f7f805ebafa650c3a4`
