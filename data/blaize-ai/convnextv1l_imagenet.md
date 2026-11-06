# Blaize-AI/ConvNeXtV1l_ImageNet

## Resumen

ConvNeXtV1l_ImageNet es un clasificador de imágenes derivado de ConvNeXt, la familia de redes convolucionales propuesta por Meta AI Research como alternativa moderna a los Vision Transformers. En concreto, este repositorio contiene una variante del modelo ConvNeXt de escala "large" (V1l) entrenada sobre ImageNet 2012 y optimizada por Blaize-AI para ejecutarse sobre sus aceleradores Xplorer mediante el SDK Picasso y el procesador GSP (Graph Streaming Processor) de la compañía.

El modelo no es una contribución algorítmica nueva: los pesos proceden del repositorio oficial de Facebook Research y se han reempaquetado en formato `.bm`, el formato binario propietario de Blaize, con una variante de cuantización BF16 a resolución de entrada 224×224. Por tanto, su interés no reside en la arquitectura sino en el despliegue: permite ejecutar un clasificador ImageNet de gama alta en hardware de borde con aceleración dedicada.

Es relevante para equipos que trabajen con el ecosistema Blaize y necesiten inferencia de clasificación de imágenes de baja latencia en el borde, no para quienes busquen un modelo de propósito general en PyTorch o GGUF. El repositorio ocupa 0,3 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt (red convolucional pura con bloques estilo transformer), variante V1l |
| Parametros totales | no disponible (la familia ConvNeXt-L se sitúa en el orden de 190 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | BF16 (variante publicada); el autor documenta además INT8 y AMP como métodos soportados por el SDK |
| Idiomas soportados | no disponible (clasificación de imágenes, sin interfaz lingüística) |
| Licencia | MIT |
| Formato de pesos | `.bm` (formato binario de Blaize Picasso SDK); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

ConvNeXt es una red convolucional pura que moderniza el diseño de ResNet incorporando decisiones arquitectónicas tomadas de los Vision Transformers: kernels de convolución depthwise de 7×7, normalización LayerNorm en lugar de BatchNorm, activación GELU, menos capas de normalización y un esquema de entrenamiento con técnicas de aumento de datos y regularización propias de la era transformer. La variante "l" corresponde a la escala grande de la familia, con mayor número de canales por bloque que las versiones tiny, small y base.

El entrenamiento se realizó sobre ImageNet 2012, el conjunto de referencia de clasificación de imágenes a 1000 clases. La model card no aporta detalles sobre número de épocas, composición exacta del dataset, recetas de aumento de datos ni si hubo ajuste fino posterior. Blaize no ha modificado el código fuente del modelo según su propia declaración, sino que ha realizado optimizaciones específicas de hardware para que el grafo de cómputo sea compatible con la arquitectura GSP, que ejecuta operaciones como un grafo en streaming para reducir latencia y consumo.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet a resolución de entrada 224×224 píxeles.
- Extracción de características visuales de alto nivel (el backbone ConvNeXt es reutilizable para tareas downstream, aunque este repositorio publica la cabeza de clasificación).
- Inferencia acelerada en hardware Blaize Xplorer mediante el SDK Picasso.
- Ejecución en BF16, con soporte documentado en el SDK para INT8 y precisión mixta automática (AMP) en otras variantes.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de procesamiento de audio o vídeo.

## Casos de uso

- Clasificación de imágenes en el borde: el modelo se carga con el SDK Picasso sobre un acelerador Xplorer y clasifica fotogramas o imágenes individuales en 1000 categorías, adecuado para inspección visual en planta o en dispositivos remotos sin conexión a la nube.
- Preprocesado en pipelines de visión industrial: usar la salida de clase como señal de filtrado previo antes de un modelo más costoso, aprovechando la baja latencia del GSP para descartar imágenes irrelevantes.
- Moderación de contenido visual en dispositivos: clasificación rápida de imágenes subidas por usuarios para detectar categorías sensibles antes de enviarlas a un servicio central.
- Indexación y etiquetado automático de bibliotecas de imágenes: generación de metadatos de categoría para catálogos fotográficos o archivos documentales, ejecutando el modelo localmente.
- Extracción de embeddings para búsqueda visual: reutilizar el backbone ConvNeXt como extractor de características y alimentar un índice vectorial, siempre que el SDK permita exportar activaciones intermedias.
- Prototipado de aplicaciones de borde con Blaize: validar el flujo completo de compilación, despliegue y ejecución del SDK Picasso con un modelo de referencia conocido antes de portar modelos propios.
- Demostraciones de eficiencia energética: comparar consumo y latencia frente a ejecución en CPU/GPU en escenarios de inferencia continua en dispositivos alimentados por batería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión top-1/top-5, latencia ni throughput para esta variante concreta, y no se han encontrado datos verificables en la información proporcionada.

## Requisitos de hardware

- Hardware obligatorio: acelerador Blaize Xplorer con el SDK Picasso instalado y configurado. El modelo no está pensado para ejecutarse en GPU convencional ni en CPU con frameworks estándar, dado que los pesos se distribuyen en formato `.bm`.
- VRAM estimada: no aplica en el sentido habitual; el modelo se ejecuta sobre la memoria del acelerador GSP, cuyo tamaño no se especifica en la información disponible.
- GPU recomendadas: no disponible; el autor no documenta ejecución en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no disponible; no se distribuyen pesos en safetensors, GGUF ni ONNX que permitan ejecución en llama.cpp, Ollama o vLLM.
- Opciones de despliegue: SDK Picasso de Blaize y la utilidad `blaize-modeltool` para inspección del modelo (`blaize-modeltool info -i hf://Blaize-AI/ConvNeXtV1l_ImageNet/ConvNeXtV1l_ImageNet_bf16_224_224.bm`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| ConvNeXtV1l_ImageNet (este) | no disponible | 224×224 | `.bm` (Blaize) | MIT | Blaize Xplorer / GSP |
| ConvNeXt-L original (Meta) | ~190 M (dato de la familia, no confirmado aquí) | 224×224 | PyTorch | MIT | GPU/CPU convencional |
| ResNet-50 (referencia clásica) | ~25 M | 224×224 | PyTorch, ONNX | BSD-like | GPU/CPU convencional |
| ViT-L/16 (referencia transformer) | ~300 M | 224×224 | PyTorch, safetensors | Apache 2.0 | GPU/CPU convencional |

La comparación directa con alternativas es limitada porque este repositorio no publica métricas propias ni pesos en formatos estándar. Frente al ConvNeXt-L original, la diferencia es de empaquetado y optimización para hardware, no de arquitectura ni de precisión declarada.

## Limitaciones y advertencias

- Dependencia total del hardware Blaize Xplorer y del SDK Picasso: sin ese entorno, el modelo no es utilizable.
- Ausencia de métricas publicadas de precisión, latencia o throughput en la model card; no es posible evaluar su rendimiento real sin ejecutarlo.
- Solo se publica una variante (BF16, 224×224); las variantes INT8 y AMP se mencionan como métodos del SDK pero no se incluyen como ficheros en el repositorio.
- Sesgos heredados de ImageNet: el conjunto de entrenamiento tiene una distribución de clases y geográfica sesgada, lo que puede producir errores sistemáticos en categorías poco representadas o en contextos culturales distintos.
- Riesgo de clasificación errónea en imágenes fuera de dominio (iluminación, ángulos, oclusiones, dominios médicos o industriales específicos) sin garantía de calibración de confianza.
- Licencia MIT para el modelo, pero el dataset ImageNet tiene su propia licencia (`LicenseRef-ImageNet`) que puede restringir el uso comercial de los pesos derivados; conviene revisarla antes de producción.
- Blaize declara explícitamente que no revisa, aprueba ni garantiza los modelos de terceros y no ofrece garantía alguna sobre infracción de propiedad intelectual.
- Sin soporte de texto, agentes ni tool calling: no debe considerarse un modelo de propósito general.
- Fecha de creación del repositorio en 2026 y cero descargas: ecosistema y validación comunitaria inexistentes por el momento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Blaize-AI/ConvNeXtV1l_ImageNet
- Repositorio original de ConvNeXt (Meta): https://github.com/facebookresearch/ConvNeXt
- Pesos preentrenados originales: https://github.com/facebookresearch/ConvNeXt
- ImageNet: https://www.image-net.org/
- Blaize: https://www.blaize.com
