# gatilin/grt-30m-omni-vision-encoder

## Resumen

GRT-30M-Omni vision encoder es un componente extraído del modelo multimodal any-to-any MatterWaveAI/grt-30m-omni, desarrollado por el usuario gatilin y publicado en Hugging Face. No se trata de un modelo completo, sino de una extracción quirúrgica del subgrafo `model.visual.*` del checkpoint original (revisión `c69d1331739458fd92b1d3038ed685a13840a545`), que incluye la torre de visión rotacional de seis capas, el patch embedding y el merger espacial 2×2. El modelo de lenguaje, las demás modalidades y las cabezas generativas quedan excluidos.

El componente está pensado para extracción de características de imagen (pipeline `image-feature-extraction`), no para generación. Su interés radica en que aísla y hace reutilizable la torre visual de un transformer rotacional, preservando nombres de tensores, formas, dtypes y valores del checkpoint fuente, con metadatos de extracción y comparación de rangos incluidos. El repositorio incluye además la implementación del autor original, empaquetada desde un fork de Transformers fijado a un commit concreto.

Con 5.289.344 parámetros reales en safetensors (frente a los 38,7M del modelo completo del que procede), licencia Apache-2.0 y un tamaño de repositorio de 0,0 GB, es una pieza de infraestructura para investigadores que quieran reutilizar el encoder visual sin arrastrar el resto del modelo omni. La validación publicada se limita a un smoke test en CPU con una imagen COCO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer rotacional (rotational transformer); torre de visión de 6 capas con patch embedding y merger espacial 2×2 |
| Parametros totales | 5.289.344 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (encoder de imagen, no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El componente corresponde a la torre visual de un transformer rotacional de seis capas. Incluye el patch embedding de entrada y un merger espacial 2×2 que reduce la resolución de los tokens visuales antes de entregarlos a la siguiente etapa del modelo original. La extracción preserva exactamente los nombres de tensores, formas, dtypes y valores del checkpoint `MatterWaveAI/grt-30m-omni`, por lo que el comportamiento del subgrafo debería coincidir con el del modelo completo en esa rama.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens vistos, la composición de datos ni si hubo etapas de RLHF o DPO en el modelo fuente. La model card únicamente documenta el proceso de extracción y el fork de Transformers utilizado (commit `829cdd0948f908467dd423cfbc2597fc341b7a36`, probado con Transformers 5.21.1). El modelo base declara 38,7M de parámetros en total; este componente aísla 5,29M de ellos.

## Capacidades

- Extracción de características de imagen: devuelve `last_hidden_state` y `pooler_output` a partir de `pixel_values`.
- Procesamiento de imágenes con el preprocesador CLIP incluido (`preprocessor_config.json`) mediante `transformers.CLIPImageProcessor`.
- Entrada validada de `[1, 3, 224, 224]` que produce `[1, 64, 256]` características fusionadas tras el merger 2×2.
- No incluye generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües: esas funciones residen en las partes del modelo omni que no se han extraído.
- No soporta otras modalidades (audio, vídeo) pese al nombre "omni" del modelo base.

## Casos de uso

- Investigación en encoders visuales: permite estudiar la torre rotacional de seis capas de forma aislada, sin cargar el modelo omni completo, comparando sus representaciones con las de encoders CLIP o SigLIP en tareas de clasificación lineal o retrieval.
- Extracción de embeddings para búsqueda de imágenes: el `pooler_output` sirve como vector global para indexar un corpus de imágenes y construir un motor de búsqueda visual o de similitud.
- Prototipado de pipelines multimodales: al ser un componente pequeño (5,29M parámetros), se puede integrar como front-end visual en experimentos donde el resto del pipeline (LLM, cabezas de tarea) lo aporte el investigador.
- Análisis de la fusión espacial: el merger 2×2 documentado permite estudiar el efecto de la reducción de tokens visuales en tareas densas como segmentación o detección con cabezas externas.
- Reproducibilidad y auditoría de checkpoints: los metadatos de extracción y la comparación de rangos incluidos facilitan verificar que un despliegue del modelo omni utiliza exactamente los mismos pesos visuales.
- Docencia y experimentación con Transformers: el smoke test en CPU con una imagen COCO y la implementación empaquetada permiten ejecutar el encoder en un portátil sin GPU para entender el flujo patch embedding → torre → merger.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única validación documentada es un smoke test en CPU: entrada `[1, 3, 224, 224]`, salida `[1, 64, 256]`, valores finitos y ejecuciones repetidas idénticas. La propia model card advierte que esta prueba no establece la calidad del modelo completo ni la equivalencia extremo a extremo con la fuente.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 5,29M parámetros en fp32 el peso ocupa aproximadamente 21 MB, y en fp16 unos 11 MB, más activaciones de una sola imagen de 224×224.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; no requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU; el smoke test oficial se ejecutó en CPU.
- Opciones de despliegue: el loader propio `component.load_model(directory)` con PyTorch y Transformers 5.21.1; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al ser un encoder de imagen esas herramientas no aplican directamente.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gatilin/grt-30m-omni-vision-encoder | 5,29M (solo torre visual) | no aplica | sin benchmarks publicados | Apache-2.0 | Hugging Face, 0 descargas |
| MatterWaveAI/grt-30m-omni | 38,7M (modelo completo any-to-any) | no disponible | no disponible | Apache-2.0 (declarada en el checkpoint fuente) | Hugging Face |
| Encoders visuales tipo CLIP/SigLIP | no disponible en la información proporcionada | no aplica | no disponible en la información proporcionada | varía según modelo | amplia disponibilidad |

No se dispone de datos de rendimiento comparables para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo autónomo: carece de modelo de lenguaje, cabezas generativas y otras modalidades; solo produce características visuales.
- La validación publicada es un smoke test en CPU con una única imagen; no hay evidencia de calidad en tareas downstream ni de equivalencia end-to-end con el checkpoint fuente.
- El loader importa el código empaquetado como `transformers.models.grt`; cargar otro directorio de código GRT en el mismo proceso de Python no está soportado.
- Requiere internals compatibles de Transformers (probado con 5.21.1); versiones distintas pueden romper la carga.
- Riesgo de alucinación: no aplica directamente al ser un encoder, pero cualquier cabeza generativa añadida por el usuario heredará los sesgos de sus propios datos.
- Sesgos conocidos: no documentados; al no publicarse la composición del dataset de entrenamiento, no es posible evaluar sesgos de representación visual.
- Idiomas: no disponible; el componente no procesa texto.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia del checkpoint fuente y del fork de Transformers empaquetado, que la model card declara también Apache-2.0.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validación comunitaria independiente.

## Enlaces

- Hugging Face del componente: https://huggingface.co/gatilin/grt-30m-omni-vision-encoder
- Modelo base: https://huggingface.co/MatterWaveAI/grt-30m-omni
- Fork de Transformers utilizado: https://github.com/MatterWaveAI/transformers/tree/829cdd0948f908467dd423cfbc2597fc341b7a36/src/transformers/models/grt
- Survey sobre encoders visuales en modelos visión-lenguaje: https://jina.ai/vision-encoder-survey.pdf
