# AstralFemboy/hydra-3.5-onnx

## Resumen

Hydra 3.5 ONNX es una exportación al formato ONNX del modelo RedRocket/Hydra, un etiquetador automático de imágenes (image tagger) entrenado sobre el corpus de e621, un archivo de arte furry. El modelo original es de RedRocket; esta versión la publica AstralFemboy y se limita a convertir los pesos de bf16 a fp32 y a empaquetar el grafo en ONNX (opset 18) para su uso en producción dentro del servicio de machine learning de Nyarchive. No introduce cambios en los pesos ni en el comportamiento del modelo.

Se trata de un clasificador multi-etiqueta con 8.886 etiquetas posibles: recibe una imagen y devuelve, para cada etiqueta, una puntuación sigmoide independiente. La arquitectura subyacente es un transformer de visión con atención sobre parches de 16 × 16 píxeles (hasta 1.024 parches por imagen) y un mecanismo de attention pooling con 1.024 consultas de etiqueta. El repositorio ocupa 2,1 GB y la licencia es Apache-2.0.

Su relevancia es acotada pero clara: es una alternativa lista para producción en entornos que no disponen de PyTorch, con paridad numérica verificada frente al pipeline original (diferencia máxima de 3,2e-6 en fp32) y un consumo de memoria controlado (en torno a 3 GB por imagen). No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión con atención sobre parches (NaFlex) y attention pooling de etiquetas |
| Parametros totales | no disponible (el repo pesa 2,1 GB en fp32; la dimensión de embedding es 1152) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de hasta 1024 parches de 16 × 16 píxeles |
| Tipos de cuantizacion | no disponible (exportación en fp32; el original estaba en bf16) |
| Idiomas soportados | no disponible (modelo de clasificación de imágenes, sin componente textual) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 18) con datos externos en `model.onnx.data`; tabla de posiciones en `pos_embed.npy` |

## Arquitectura y entrenamiento

El modelo es un transformer de visión que procesa la imagen como una secuencia de hasta 1.024 parches de 16 × 16 píxeles en RGB, normalizados al rango [-1, 1] y rellenados con ceros hasta completar la secuencia. La tabla de embeddings posicionales (16 × 16 × 1152) se redimensiona por imagen mediante interpolación bilineal con antialiasing, de modo que cada imagen conserva su relación de aspecto original dentro del límite de 1.024 parches (enfoque NaFlex). La imagen se compone sobre fondo blanco si tiene transparencia y se redimensiona en espacio lineal de luz.

La cabeza de clasificación emplea attention pooling con 1.024 consultas de etiqueta: cada etiqueta atiende a la imagen de forma independiente, lo que produce el mismo resultado que el pase único de Hydra pero mantiene el consumo de memoria por debajo de unos 3 GB. La salida es un vector de 8.886 probabilidades sigmoides, una por etiqueta. El fichero `tags.json` incluye, para cada etiqueta, su categoría de e621, el umbral derivado de la calibración `f1.0@0.1` del modelo original y las etiquetas que implica.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO; la model card de esta exportación no los detalla y se remite al modelo base. La única modificación respecto al original es la conversión de bf16 a fp32 durante la exportación.

## Capacidades

- Clasificación multi-etiqueta de imágenes: devuelve 8.886 puntuaciones sigmoides independientes, una por etiqueta.
- Etiquetado especializado en el dominio de e621 (arte furry), con categorías de etiqueta incluidas en `tags.json`.
- Procesamiento de imágenes con relación de aspecto arbitraria gracias al esquema NaFlex de hasta 1.024 parches.
- Manejo de transparencia: composición sobre fondo blanco antes del redimensionado.
- Umbrales de decisión calibrados por etiqueta (`f1.0@0.1`), lo que permite filtrar directamente sin ajuste manual.
- Ejecución sin PyTorch mediante ONNX Runtime.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Moderación y filtrado de contenido en plataformas de arte: el modelo etiqueta automáticamente las imágenes subidas con 8.886 categorías y permite aplicar políticas por etiqueta (por ejemplo, ocultar contenido según categorías de e621) antes de la publicación.
- Indexación y búsqueda de archivos de imágenes: las puntuaciones por etiqueta alimentan un índice de búsqueda que permite consultas por atributos (personajes, especies, escenarios) sobre colecciones grandes, aprovechando que el modelo cubre el vocabulario completo de e621.
- Autoetiquetado en pipelines de curación de datasets: un servicio que procese lotes de imágenes puede generar etiquetas de entrenamiento o metadatos de forma desatendida, con los umbrales calibrados ya incluidos en `tags.json`.
- Despliegue en entornos sin PyTorch: al ser un grafo ONNX con datos externos, se integra en servicios escritos en C#, Java o C++ mediante ONNX Runtime, sin necesidad de instalar el stack de PyTorch; es el caso real de Nyarchive.
- Recomendación de contenido: las probabilidades por etiqueta sirven como vector de características para sistemas de recomendación de imágenes similares dentro del dominio furry.
- Control de calidad de ilustraciones: la detección de etiquetas ausentes o inesperadas (por ejemplo, atributos anatómicos o de composición) permite señalar imágenes que incumplen la ficha de encargo antes de su entrega.
- Análisis de colecciones a gran escala: con un coste de unos 6 segundos por imagen en una CPU de 24 núcleos, es viable procesar archivos de decenas de miles de imágenes en lotes nocturnos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta la paridad numérica con el modelo original: sobre 12 imágenes de prueba (las dos de muestra de Hydra, recortadas en formatos ancho, alto, diminuto, cuadrado y con transparencia), las puntuaciones del grafo difieren como máximo 3,2e-6 del modelo PyTorch en fp32, con conjuntos de etiquetas idénticos. El tiempo de inferencia indicado es de aproximadamente 6 segundos por imagen en una CPU de 24 núcleos. No hay datos de MMLU, HumanEval, GSM8K ni métricas de clasificación (precisión, recall, F1) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no aplica para ejecución en CPU; en GPU, el grafo fp32 con datos externos requiere en torno a 2-3 GB de memoria, según la propia model card (el attention pooling mantiene una imagen por debajo de unos 3 GB).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para ejecución en fp32; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 4 GB o más (GTX 1650, RTX 3050 y superiores), aunque el dato no está confirmado en la documentación.
- Opciones de despliegue: ONNX Runtime es el runtime previsto; el modelo se integra mediante el script `machine-learning/scripts/convert_hydra_onnx.py` del repositorio Nyarchive, que puede regenerar los ficheros desde el checkpoint original.
- Latencia y throughput: aproximadamente 6 segundos por imagen en CPU de 24 núcleos; no hay datos de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Etiquetas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Hydra 3.5 ONNX (este) | Clasificador multi-etiqueta de imágenes | 8.886 | ONNX fp32 | Apache-2.0 | Exportación de RedRocket/Hydra; paridad verificada con el original |
| RedRocket/Hydra | Clasificador multi-etiqueta de imágenes | 8.886 | safetensors (bf16) | Apache-2.0 | Modelo base; requiere PyTorch para su pipeline original |
| WD14 / WD EVA02 (taggers de Danbooru) | Clasificador multi-etiqueta de imágenes | no disponible | safetensors, ONNX | no disponible | Alternativa habitual en etiquetado de arte anime; no se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Dominio restringido: el vocabulario de 8.886 etiquetas proviene de e621 (arte furry); su utilidad fuera de ese dominio es limitada y no está documentada.
- Sesgos de dominio: al entrenarse sobre un archivo comunitario concreto, puede reflejar los sesgos de etiquetado y de representación de esa comunidad.
- Riesgo de etiquetado incorrecto: la salida son puntuaciones sigmoides por etiqueta; sin aplicar los umbrales calibrados de `tags.json` pueden aparecer falsos positivos o negativos.
- Sin capacidades de lenguaje: no genera texto, no razona ni soporta tool calling; no debe confundirse con un modelo conversacional.
- Licencia Apache-2.0: permite uso comercial, pero el crédito del modelo corresponde a RedRocket y conviene conservar los avisos de licencia y atribución.
- Mantenimiento: el repositorio tiene 0 descargas y 0 likes y no se ha actualizado desde su creación; no hay garantía de soporte ni de correcciones.
- Entrada limitada a 1.024 parches: imágenes de resolución muy alta se reducen, lo que puede perder detalles finos relevantes para etiquetas poco frecuentes.
- Rendimiento en CPU: unos 6 segundos por imagen en 24 núcleos; para volúmenes altos conviene planificar lotes o usar GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AstralFemboy/hydra-3.5-onnx
- Modelo base: https://huggingface.co/RedRocket/Hydra
- Repositorio Nyarchive (script de conversión y servicio ML): https://github.com/NightlyElf/Nyarchive
