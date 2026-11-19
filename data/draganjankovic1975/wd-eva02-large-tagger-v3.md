# draganjankovic1975/wd-eva02-large-tagger-v3

## Resumen

wd-eva02-large-tagger-v3 es un espejo (mirror) en formato ONNX del modelo SmilingWolf/wd-eva02-large-tagger-v3, un etiquetador automático de imágenes (image tagger) orientado al etiquetado de contenido visual según la taxonomía de danbooru, el conocido repositorio de imágenes de estilo anime. El modelo original lo desarrolla SmilingWolf y este repositorio lo publica el usuario draganjankovic1975 con el único propósito de redistribuirlo convertido a ONNX, lo que facilita su uso en entornos de inferencia sin dependencias de PyTorch.

La relevancia de este modelo radica en su especialización: no es un modelo de lenguaje generalista, sino un clasificador multi-etiqueta de imágenes entrenado para predecir cientos de etiquetas descriptivas (personajes, atributos, composición, estilo) con alta precisión en el dominio del arte anime. La arquitectura subyacente es EVA-02, un transformer de visión de gran tamaño, y el repositorio ocupa 1,3 GB, coherente con los pesos de un modelo large en formato ONNX.

Al tratarse de un espejo, no aporta innovaciones técnicas propias ni datos de entrenamiento adicionales; su valor es exclusivamente práctico: ofrece los pesos originales en ONNX bajo licencia Apache 2.0, lo que permite desplegarlos con ONNX Runtime en CPU o GPU sin necesidad de convertir el modelo manualmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EVA-02 (transformer de visión) para clasificación multi-etiqueta |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos ONNX; se desconoce si están cuantizados) |
| Idiomas soportados | no disponible (las etiquetas de salida están en inglés por la taxonomía danbooru) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo base es wd-eva02-large-tagger-v3 de SmilingWolf, construido sobre EVA-02, una familia de transformers de visión que emplea atención con ventanas y mecanismos de reconstrucción de características enmascaradas para mejorar la eficiencia del preentrenamiento. La cabeza de clasificación es multi-etiqueta: el modelo predice, para cada imagen, la presencia o ausencia de un conjunto amplio de etiquetas del vocabulario de danbooru, con una probabilidad asociada por etiqueta.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de ajuste fino como RLHF o DPO (poco habituales en modelos de etiquetado). La innovación técnica de este repositorio concreto es la exportación a ONNX, que permite ejecutar el modelo con ONNX Runtime y facilita el despliegue en producción fuera del ecosistema PyTorch.

## Capacidades

- Etiquetado automático de imágenes de estilo anime con un vocabulario amplio de etiquetas de danbooru (personajes, rasgos físicos, ropa, composición, escenario).
- Clasificación multi-etiqueta: una misma imagen puede recibir decenas de etiquetas simultáneas con puntuaciones de confianza independientes.
- Inferencia en formato ONNX, ejecutable con ONNX Runtime en CPU y GPU.
- Uso como componente de preprocesado en pipelines de curación de datasets, filtrado y anotación automática.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo de visión.
- No es un modelo generativo de texto ni multimodal conversacional; no produce descripciones en lenguaje natural, solo etiquetas.

## Casos de uso

- Anotación automática de datasets de imágenes anime: el modelo etiqueta lotes de imágenes con vocabulario danbooru, lo que acelera la curación de datasets para entrenar modelos de difusión o clasificadores posteriores.
- Filtrado y moderación de contenido: permite detectar etiquetas sensibles o categorías concretas en repositorios de imágenes y aplicar políticas de filtrado antes de publicar.
- Búsqueda y recuperación de imágenes: las etiquetas generadas se indexan en un motor de búsqueda textual, habilitando consultas por atributos (color de pelo, vestimenta, pose) sobre grandes colecciones.
- Enriquecimiento de metadatos en plataformas de ilustración: generación automática de tags al subir una imagen, mejorando la discoverability sin intervención manual.
- Preetiquetado asistido para anotadores humanos: el modelo propone etiquetas que un revisor confirma o corrige, reduciendo el coste de anotación manual en proyectos de gran volumen.
- Despliegue ligero en entornos sin PyTorch: gracias al formato ONNX, puede integrarse en servicios escritos en C++, C# o Java mediante ONNX Runtime, útil en backends no Python.
- Componente de pipelines de generación aumentada: usar las etiquetas extraídas como condicionamiento textual para modelos de difusión de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del repositorio: 1,3 GB, correspondiente a los pesos ONNX del modelo large; la VRAM/RAM necesaria para inferencia es del orden de varios GB, aunque no se especifica el consumo exacto en la información disponible.
- GPU recomendadas: no disponible; al ser un modelo de visión de tamaño large, una GPU con al menos 8-16 GB de memoria es un punto de partida razonable, pero no hay datos confirmados.
- Compatibilidad con GPU de consumo: probable en tarjetas tipo RTX 3060/4060 en adelante, aunque no confirmado por el autor.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), con posibles integraciones en servidores de inferencia compatibles con ONNX; no se documentan integraciones con vLLM, llama.cpp ni Ollama (no aplicables a un modelo de visión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| wd-eva02-large-tagger-v3 (original) | EVA-02 large | PyTorch (safetensors) | Apache 2.0 | Hugging Face, SmilingWolf |
| Este repositorio (mirror ONNX) | EVA-02 large | ONNX | Apache 2.0 | Hugging Face, draganjankovic1975 |
| wd-vit-large-tagger-v3 | ViT large | PyTorch | Apache 2.0 | Hugging Face, SmilingWolf |
| wd-convnext-tagger-v3 | ConvNeXt | PyTorch | Apache 2.0 | Hugging Face, SmilingWolf |

La comparativa se limita a la familia de taggers de SmilingWolf, ya que no se dispone de datos de rendimiento de alternativas externas en la información proporcionada. La diferencia principal entre este repositorio y el original es el formato de pesos (ONNX frente a PyTorch); el resto de características técnicas son idénticas al ser un espejo.

## Limitaciones y advertencias

- Es un espejo no oficial: el autor del repositorio no es el desarrollador original, por lo que no hay garantía de mantenimiento ni de actualizaciones.
- El modelo está especializado en arte anime y su vocabulario proviene de danbooru; su rendimiento en fotografías reales u otros dominios visuales será previsiblemente pobre.
- Las etiquetas de salida están en inglés y siguen la taxonomía de danbooru, lo que puede incluir términos específicos de la comunidad.
- Riesgo de falsos positivos y negativos en etiquetas poco representadas en el entrenamiento; se recomienda validación humana en flujos críticos.
- No se documentan sesgos específicos, pero al entrenarse sobre un corpus de imágenes anime puede heredar sesgos de representación de ese dominio.
- La licencia Apache 2.0 permite uso comercial, pero al ser un mirror conviene verificar la licencia del modelo original antes de redistribuir.
- No es adecuado para tareas de generación de texto, razonamiento ni conversación; su uso debe limitarse al etiquetado de imágenes.
- No se especifican requisitos de hardware ni latencias, lo que dificulta la planificación de capacidad en producción.

## Enlaces

- Repositorio del mirror: https://huggingface.co/draganjankovic1975/wd-eva02-large-tagger-v3
- Modelo original: https://huggingface.co/SmilingWolf/wd-eva02-large-tagger-v3
- Perfil del autor original: https://huggingface.co/SmilingWolf
