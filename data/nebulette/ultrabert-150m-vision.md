# nebulette/ultrabert-150m-vision

## Resumen

UltraBERT 150M Vision es un modelo de lenguaje enmascarado (fill-mask) desarrollado por el usuario nebulette, obtenido por fine-tuning del modelo base dmis-lab/UltraBERT-150M. Su particularidad es la incorporación de modulos de vision "in-fusion", lo que permite procesar tanto texto como imagenes dentro del mismo transformer, sin depender de un encoder visual separado. Aunque el nombre comercial indica 150M, el recuento real de parametros en los pesos safetensors es de 305.567.232, es decir, aproximadamente 305 millones.

El modelo resuelve el problema de alinear representaciones de texto e imagen en un unico espacio semantico: el embedding medio agrupado (mean pooled) se mantiene aproximadamente constante independientemente de la modalidad de entrada, y la prediccion de tokens enmascarados se centra en bigramas. Esta orientado a tareas de etiquetado y clasificacion a partir de imagenes o texto, con un formato de prompt basado en tokens especiales tipo chat (`<|im_start|>`, `<|im_end|>`, `<|image|>`).

Es relevante por su enfoque ligero y unificado: frente a alternativas que acoplan un encoder visual externo (como UltraVBERT) o modelos multimodales de mayor tamano (como mnn-pocket-0.3b-vision), este modelo usa un unico backbone con modulos de fusion interna, lo que simplifica el despliegue. La licencia Apache 2.0 facilita su uso comercial, aunque el soporte linguistico declarado se limita al ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT con modulos de vision in-fusion (custom_code) |
| Parametros totales | 305.567.232 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de dmis-lab/UltraBERT-150M, un backbone transformer de tipo encoder enmascarado (pipeline fill-mask), y le incorpora modulos de vision "in-fusion" que permiten inyectar parches de imagen directamente en el flujo del transformer. Segun la model card, el entrenamiento persigue dos objetivos: (1) el emparejamiento entre tokens de texto y de vision, de modo que el embedding medio agrupado sea aproximadamente el mismo con independencia de la modalidad de entrada, admitiendo una diferencia por vector constante que preserva el significado semantico; y (2) la prediccion de tokens enmascarados centrada en bigramas.

Los datos de entrenamiento declarados consisten en 50.000 etiquetas comunes de booru procedentes de gelbooru, donde cada imagen de muestra tiene al menos una etiqueta unica. No se especifican el numero total de tokens, la composicion completa del dataset ni si hubo fases de RLHF o DPO. La model card referencia tres identificadores tipo arXiv (2610.15028, 2610.39302, 2611.17334) como bibliografia tecnica asociada. El modelo requiere codigo personalizado (`custom_code`) para su carga, lo que implica confiar en la implementacion publicada por el autor.

## Capacidades

- Prediccion de tokens enmascarados (fill-mask) sobre texto en ingles.
- Procesamiento de imagenes mediante parches inyectados con el token especial `<|image|>`, sin encoder visual externo.
- Alineacion texto-imagen en un espacio de embeddings comun (mean pooling estable entre modalidades).
- Etiquetado a partir de listas de etiquetas separadas por comas en el prompt de usuario.
- Uso con entrada exclusivamente de texto o exclusivamente de vision (a diferencia de mnn-pocket-0.3b-vision).
- Formato de prompt conversacional con `<|im_start|>user\n...<|im_end|>`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas avanzadas, audio ni modo thinking.

## Casos de uso

- Etiquetado automatico de imagenes: dado un conjunto de etiquetas candidatas separadas por comas en el prompt, el modelo puede puntuar o predecir la etiqueta enmascarada mas probable, util para catalogar imagenes en plataformas tipo booru.
- Clasificacion zero-shot ligera por similitud de embeddings: aprovechando la alineacion texto-imagen, se pueden comparar embeddings agrupados de una imagen y de una descripcion textual para tareas de recuperacion o filtrado.
- Moderacion y filtrado de contenido visual: con un backbone de ~305M parametros, es viable desplegarlo en infraestructura modesta para prefiltrar imagenes por categorias predefinidas antes de revision humana.
- Enriquecimiento de metadatos en pipelines de datos: integrado como paso de preprocesado que genera etiquetas para grandes lotes de imagenes, reduciendo coste frente a modelos multimodales de mayor tamano.
- Prototipado de busqueda multimodal: construir un indice de embeddings de texto e imagen en un mismo espacio para busquedas cruzadas en entornos de investigacion.
- Experimentacion academica sobre fusion interna de vision: el modelo sirve como referencia reproducible (licencia Apache 2.0) para estudiar alineacion de modalidades sin encoder separado.
- Relleno de texto (fill-mask) en ingles para tareas auxiliares de NLP, como completar etiquetas o campos en formularios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 1,2 GB en safetensors; en FP32 los ~305M parametros requeririan aproximadamente 1,2 GB solo de pesos, mas overhead de activaciones. En FP16/BF16 cabria holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente por tamano; para lotes grandes o throughput alto, A100 o H100 aportarian margen.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: al requerir `custom_code` y pesos safetensors, el despliegue natural es via `transformers` con `trust_remote_code=True`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; al ser un modelo fill-mask con codigo personalizado, estas herramientas probablemente no lo soporten sin adaptacion.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| nebulette/ultrabert-150m-vision | 305.567.232 | no disponible | Fusion interna, sin encoder separado | apache-2.0 | Texto o vision por separado |
| nebulette/mnn-pocket-0.3b-vision | no disponible | no disponible | Si | no disponible | Solo vision segun la model card |
| athrael-soju/UltraVBERT | no disponible | no disponible | Encoder visual separado | no disponible | Depende de encoder externo |
| dmis-lab/UltraBERT-150M | no disponible (modelo base) | no disponible | No | no disponible | Solo texto, base del fine-tuning |

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento se basa en 50.000 etiquetas de gelbooru, una fuente con sesgos propios de contenido para adultos y de la comunidad que la etiqueta; es esperable que el modelo herede esos sesgos en sus predicciones.
- Riesgo de alucinacion: al ser un modelo fill-mask, puede producir predicciones plausibles pero incorrectas, especialmente con etiquetas poco representadas en el corpus.
- Limitaciones de idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Longitud de contexto no documentada: se desconoce la ventana maxima, lo que complica el diseno de prompts largos con muchas etiquetas o imagenes de alta resolucion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo requiere `custom_code` del autor; conviene auditar ese codigo antes de usarlo en produccion.
- Madurez: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (21 de noviembre de 2026); no hay evidencia de validacion por la comunidad.
- Dependencia de codigo remoto: la carga con `trust_remote_code=True` ejecuta codigo de terceros, lo que supone un riesgo de seguridad en entornos controlados.

## Enlaces

- Hugging Face: https://huggingface.co/nebulette/ultrabert-150m-vision
- Modelo base: https://huggingface.co/dmis-lab/UltraBERT-150M
- Modelo de vision relacionado: https://huggingface.co/nebulette/mnn-pocket-0.3b-vision
- Modelo con encoder visual separado: https://huggingface.co/athrael-soju/UltraVBERT
- Referencia sobre colocacion de modulos de vision: https://unbundling.github.io/#placement
- Referencias bibliograficas citadas (identificadores arXiv): 2610.15028, 2610.39302, 2611.17334
