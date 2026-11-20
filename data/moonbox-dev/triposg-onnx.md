# moonbox-dev/TripoSG-ONNX

## Resumen

TripoSG-ONNX es una conversión a formato ONNX del modelo TripoSG de VAST-AI, un sistema de generación de mallas 3D a partir de una única imagen. El modelo original es un transformer de flujo rectificado (rectified flow) de 1.5B parámetros que opera sobre los latentes de un VAE de formas, y esta versión empaqueta los grafos en ONNX Runtime para su ejecución en CPU, CUDA y DirectML. La publicación corre a cargo de moonbox-dev, que distribuye tres precisiones (fp16, int8 e int4) junto con un `pipeline.py` en numpy que reproduce el preprocesado de imagen, el bucle de muestreo y la extracción de malla.

La relevancia de esta ficha reside en que permite ejecutar un modelo image-to-3D de calidad de investigación fuera del ecosistema PyTorch, con soporte declarado para aceleración por hardware en Windows (DirectML) y despliegue en dispositivos sin GPU dedicada. El repositorio ocupa 6.9 GB y la licencia es MIT, lo que facilita su integración comercial.

La información disponible es limitada: no se detallan datos de entrenamiento, benchmarks estándar ni idiomas soportados. La model card se centra en los artefactos ONNX, las firmas de entrada/salida de cada grafo y una comparación de fidelidad geométrica (F-score) frente al modelo original en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flujo rectificado (rectified flow) sobre latentes de un VAE de formas; encoder de imagen DINOv2-L |
| Parametros totales | 1.5B (transformer); el encoder de imagen DINOv2-L y el VAE se distribuyen como grafos separados |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de imagen 224x224 y latentes de 2048 tokens de 64 dimensiones) |
| Tipos de cuantizacion | fp16, int8 (experimental), int4 (experimental) |
| Idiomas soportados | no disponible (modelo image-to-3D, sin componente textual) |
| Licencia | MIT |
| Formato de pesos | ONNX (grafos `.onnx` con datos externos `.onnx.data`) |

## Arquitectura y entrenamiento

El modelo original TripoSG es un transformer de 1.5B parámetros que implementa un flujo rectificado sobre los latentes de un VAE de formas. La generación parte de una imagen de entrada procesada por un encoder DINOv2-L, que produce embeddings de imagen de 257 tokens de 1024 dimensiones; el transformer opera sobre latentes de 2048 tokens de 64 dimensiones y un timestep, y el VAE decodifica los latentes finales en una malla 3D mediante extracción jerárquica de geometría. La conversión a ONNX divide el sistema en cuatro grafos: `image_encoder.onnx`, `transformer.onnx`, `vae_query.onnx` y `vae_tokens.onnx`, acompañados de un `pipeline.py` que orquesta el preprocesado, el bucle de muestreo y la extracción de malla.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card tampoco documenta innovaciones adicionales del entrenamiento más allá del esquema de flujo rectificado inherente al modelo base. La conversión a ONNX no introduce cambios arquitectónicos: es una reimplementación de los mismos cómputos en grafos portables, con cuantización post-entrenamiento para las variantes int8 e int4.

## Capacidades

- Generación de mallas 3D a partir de una única imagen (image-to-3D).
- Producción de geometría mediante extracción jerárquica de malla a partir de latentes del VAE.
- Ejecución en ONNX Runtime con backends CPU, CUDA y DirectML.
- Tres niveles de precisión con distinto compromiso entre fidelidad y tamaño: fp16 (2.88 GB de pesos del transformer), int8 (1.56 GB) e int4 (858.9 MB).
- Reproducibilidad del pipeline original mediante `pipeline.py`, que replica `prepare_image`, `TripoSGPipeline` y `hierarchical_extract_geometry`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente viso-geométrico.

## Casos de uso

- Prototipado de assets 3D en estudios pequeños: a partir de un concept art o una foto de referencia, el modelo genera una malla base que el artista puede retocar en Blender, reduciendo el tiempo de modelado inicial.
- Integración en herramientas de escritorio con DirectML: al ejecutarse sobre ONNX Runtime con backend DirectML, puede incorporarse en aplicaciones Windows nativas sin depender de CUDA ni de PyTorch.
- Generación de mallas en servidores sin GPU: la variante int8 o int4 permite inferencia en CPU con un consumo de memoria reducido (1.56 GB y 858.9 MB de pesos del transformer, respectivamente), adecuado para servicios de baja concurrencia.
- Pipeline de previsualización en comercio electrónico: generar una malla aproximada a partir de una foto de producto para vistas 3D interactivas, aceptando la pérdida de fidelidad de las cuantizaciones bajas a cambio de latencia y coste.
- Investigación en conversión de modelos generativos 3D: el repositorio sirve como referencia para estudiar el impacto de la cuantización post-entrenamiento en la calidad geométrica, con métricas F-score publicadas para cada precisión.
- Educación y demos interactivas: el tamaño contenido de la variante int4 y el soporte de CPU permiten desplegar demostraciones en portátiles sin GPU dedicada, algo inviable con el modelo original en PyTorch.
- Automatización de contenido para videojuegos indie: generación de mallas base para props y entornos a partir de bocetos, con revisión manual posterior para corregir artefactos de la cuantización.

## Benchmarks y rendimiento

La model card publica una comparación de fidelidad geométrica frente al modelo original en PyTorch, medida con F-score@0.01 sobre mallas generadas a partir de las mismas imágenes y el mismo ruido inicial:

| Precision | F-score@0.01 medio | F-score@0.01 peor | Tiempo por malla (CUDA) |
|---|---|---|---|
| fp16 | 0.955 | 0.927 | 161 s |
| int8 (experimental) | 0.841 | 0.540 | 163 s |
| int4 (experimental) | 0.554 | 0.397 | 165 s |
| Original bf16 vs fp16 (referencia) | 0.892 | 0.721 | 66 s (original) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable dado que el modelo no es lingüístico. Las variantes int8 e int4 están marcadas por el autor como por debajo del umbral de calidad aceptable y deben considerarse experimentales.

## Requisitos de hardware

- VRAM estimada para fp16: en torno a 3-4 GB para los pesos del transformer (2.88 GB) más el encoder de imagen (609.2 MB), el VAE (403.3 MB y 25.3 MB) y activaciones; cabe en GPUs consumer con 8 GB o más.
- VRAM estimada para int8: aproximadamente 2 GB de pesos del transformer (1.56 GB) más el resto de grafos; viable en GPUs con 4-6 GB.
- VRAM estimada para int4: aproximadamente 1.2 GB de pesos del transformer (858.9 MB); puede ejecutarse en GPUs de gama baja e incluso en CPU con suficiente RAM.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; el autor reporta tiempos en CUDA sin detallar la GPU empleada.
- Cabe en GPU consumer: sí, especialmente las variantes int8 e int4; fp16 requiere al menos 8 GB para operar con holgura.
- Opciones de despliegue: ONNX Runtime con backends CPU, CUDA y DirectML; el pipeline se ejecuta mediante `pipeline.py` en Python con numpy.
- Latencia y throughput: 161 s por malla en fp16, 163 s en int8 y 165 s en int4 sobre CUDA, según el autor; el modelo original en PyTorch tarda 66 s por malla, por lo que la conversión ONNX es aproximadamente 2,4 veces más lenta en fp16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| TripoSG-ONNX (este) | 1.5B (transformer) | Imagen 224x224; latentes 2048x64 | ONNX | MIT | Conversión ONNX con cuantización fp16/int8/int4; ejecución en CPU, CUDA y DirectML |
| VAST-AI/TripoSG (original) | 1.5B (transformer) | Imagen 224x224; latentes 2048x64 | PyTorch (safetensors) | MIT | Modelo base; 66 s por malla en la referencia del autor; requiere PyTorch y CUDA |
| Otros modelos image-to-3D | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación con alternativas de la misma categoría (por ejemplo, otros sistemas image-to-3D de código abierto) no está disponible en la información proporcionada; solo se puede contrastar con el modelo base del que deriva.

## Limitaciones y advertencias

- Las variantes int8 e int4 están marcadas como experimentales y por debajo del umbral de calidad del autor: el F-score cae a 0.841 (int8) y 0.554 (int4) frente a 0.955 en fp16, con casos peores de 0.540 y 0.397 respectivamente.
- La conversión ONNX es más lenta que el original en PyTorch: 161 s frente a 66 s por malla en fp16 sobre CUDA, según los datos del autor.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado sobre un corpus de formas 3D no especificado, puede reproducir sesgos geométricos o estilísticos del dataset original.
- Riesgo de alucinación geométrica: como todo modelo generativo image-to-3D, puede producir mallas plausibles pero incorrectas respecto a la imagen de entrada, especialmente en objetos ocluidos o con geometría ambigua.
- No hay información sobre los idiomas ni sobre el dataset de entrenamiento, lo que limita la evaluación de su cobertura y de posibles sesgos culturales en los objetos representados.
- La licencia MIT permite uso comercial, pero el modelo base VAST-AI/TripoSG debe verificarse por separado; la model card de esta conversión declara MIT sin más matices.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación independiente de los resultados publicados.
- La documentación de la model card está truncada en la información disponible (la firma de `transformer.onnx` queda incompleta), lo que puede dificultar la integración sin consultar el repositorio completo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/TripoSG-ONNX
- Modelo base: https://huggingface.co/VAST-AI/TripoSG
- Paper de referencia (arXiv:2502.06608): https://arxiv.org/abs/2502.06608
- ONNX Runtime: https://onnxruntime.ai/
