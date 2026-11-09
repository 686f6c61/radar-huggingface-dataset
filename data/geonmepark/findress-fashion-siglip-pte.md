# geonmepark/findress-fashion-siglip-pte

## Resumen

Findress FashionSigLIP PTE es una conversión a formato ExecuTorch (archivo `.pte`) del codificador visual del modelo `Marqo/marqo-fashionSigLIP`, desarrollado originalmente por Marqo para tareas de recuperación y clasificación de moda mediante embeddings imagen-texto. La conversión la firma el usuario `geonmepark` bajo el paraguas del proyecto Findress, y su objetivo es empaquetar únicamente la torre de visión en un formato ejecutable en dispositivos móviles (iOS y Android) con el runtime ExecuTorch.

El modelo resultante no es un modelo generativo ni multimodal completo: es un extractor de características de imagen que produce vectores de 768 dimensiones a partir de entradas RGB de 224×224 píxeles. Se apoya en una arquitectura ViT-Base (ViT-B/16) con parche de 16 píxeles, derivada de SigLIP, y ha sido exportada con precisión mixta (`fp16-mixed`) usando los backends XNNPACK y portable de ExecuTorch 1.4.1. No incluye el codificador de texto, el tokenizador ni el código de preprocesado.

Su relevancia es acotada pero concreta: demuestra un flujo de conversión reproducible de un modelo SigLIP especializado en moda hacia un artefacto desplegable en el borde, con validación numérica frente al original en ONNX fp32 (coseno mínimo de 0,999995 en 45 imágenes). Es un modelo experimental orientado a la búsqueda visual de prendas dentro de una aplicación móvil, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-Base/16 (SigLIP), solo codificador visual, exportado a ExecuTorch |
| Parametros totales | Aproximadamente 86 M (ViT-B/16; no se declara cifra exacta en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | Precisión mixta `fp16-mixed` (XNNPACK fp16 + operaciones portable fp32/fp16); no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (el codificador de texto no está incluido) |
| Licencia | Apache-2.0 |
| Formato de pesos | ExecuTorch PTE (`fashion_siglip.pte`, 187.184.896 bytes / 178,51 MiB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un Vision Transformer de tipo SigLIP con parche de 16×16 y resolución de entrada 224×224, cargado estrictamente en la implementación `vit_base_patch16_siglip_224` de timm. La conversión extrae únicamente los pesos `visual.trunk.*` del checkpoint original `open_clip_model.safetensors` y los exporta a ExecuTorch 1.4.1. El grafo resultante contiene 53 capas lineales, 1 convolución, 26 LayerNorm, 26 productos matriciales de atención, 13 softmax y 13 GELU, con 92 subgrafos delegados a XNNPACK y 332 operaciones serializadas.

No se ha realizado entrenamiento adicional ni ajuste fino: es una conversión pura. La precisión declarada es `fp16-mixed`, con pesos almacenados mayoritariamente en fp16 (160 constantes, 184.587.264 bytes) y dos constantes en fp32 correspondientes a los filtros y bias de la convolución (2.362.368 bytes). Las LayerNorm se ejecutan en portable fp32 con conversiones de tipo explícitas alrededor, y las matrices de atención se promueven a fp32 durante la exportación. La decisión de mezclar precisiones responde a un fallo identificado en el kernel fp16 de LayerNorm de ExecuTorch 1.4.1 en Windows x86_64 (coseno de aproximadamente 0,79 en pruebas aisladas), que provocaba discrepancias en 45 imágenes.

## Capacidades

- Extracción de embeddings de imagen: produce un vector float32 de `[1, 768]` por imagen, sin normalización L2 aplicada (debe hacerse externamente).
- Recuperación visual de moda: pensado para comparar embeddings de imagen contra vectores de texto precalculados (52 prompts fijos en el caso de Findress) mediante similitud coseno.
- Clasificación y búsqueda por similitud: adecuado para ranking de candidatos, no para probabilidades calibradas.
- Entrada estricta: RGB, NCHW, `[1, 3, 224, 224]`, float32; sin soporte de lotes mayores en la firma declarada.
- Sin capacidades de texto: no incluye codificador de texto, tokenizador ni generación.
- Sin tool calling, agentes ni razonamiento multi-paso.
- Sin capacidades multilingües (no aplica al ser solo visión).
- Ejecución en dispositivo mediante ExecuTorch con backend XNNPACK.

## Casos de uso

- Búsqueda visual de prendas en aplicación móvil: el usuario fotografía una prenda y la app calcula su embedding con el PTE, comparándolo por coseno contra los 52 vectores de prompt precalculados para devolver categorías o estilos afines. El tamaño de 178,51 MiB y la firma de entrada fija lo hacen viable en el borde.
- Clasificación de catálogo de moda offline: integración en un pipeline de etiquetado donde cada imagen se reduce a 448 px de lado mayor, se decodifica con jpeg-js y se procesa con OpenCV (stretch a 224×224, `INTER_CUBIC`), generando un vector de 768 dimensiones por artículo.
- Filtrado y deduplicación de imágenes en el dispositivo: comparación de embeddings entre fotos locales para agrupar prendas similares sin enviar datos a un servidor.
- Recomendación basada en contenido: uso del vector de imagen como señal para un motor de recomendación que combine similitud visual con metadatos del producto.
- Prototipado de aplicaciones React Native: el autor documenta el flujo con Expo image-manipulator, jpeg-js y RN ExecuTorch, lo que facilita replicar la integración en apps móviles multiplataforma.
- Validación de pipelines de conversión: sirve como referencia reproducible para equipos que quieran exportar otros codificadores SigLIP a ExecuTorch con precisión mixta y verificación numérica frente a ONNX fp32.

## Benchmarks y rendimiento

La model card no publica benchmarks de tarea (MMLU, HumanEval, GSM8K u otros), dado que no es un modelo generativo. Sí documenta una validación de fidelidad de conversión:

| Metrica | Resultado |
|---|---|
| Coseno mínimo vs. ONNX fp32 (45 imágenes, 23 tipos) | 0,9999953671364991 |
| Imágenes con coseno ≥ 0,99 | 45/45 |
| Coincidencia del top-1 | 45/45 |
| Coincidencia del conjunto top-3 | 45/45 |
| Carga del PTE mixto (Ryzen 7 8700F, 4 hilos) | 0,103 s |
| Inferencia de 45 imágenes (PTE mixto) | 7,511 s |
| Carga del PTE fp32 | 0,186 s |
| Inferencia de 45 imágenes (PTE fp32) | 3,956 s |
| Reducción de tamaño vs. fp32 | Aproximadamente 49,64 % |

Estos datos son de fidelidad de conversión, no de precisión de clasificación en uso real. El rendimiento en ARM (iOS/Android) no está verificado.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el archivo pesa 178,51 MiB; el consumo en ejecución no se documenta, pero por el tamaño de constantes y activaciones de un ViT-B/16 a 224×224 es previsible que quepa en la memoria de un móvil moderno (cifra exacta no disponible).
- GPU recomendadas: no se especifican; el destino es CPU/NPU móvil vía XNNPACK. En escritorio se ha probado en CPU AMD Ryzen 7 8700F.
- Compatibilidad con GPU de consumo: no se declara soporte CUDA; el artefacto es PTE para ExecuTorch.
- Opciones de despliegue: runtime ExecuTorch 1.4.1 con backend XNNPACK y kernels portable; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este formato).
- Latencia y throughput: en la prueba de escritorio, 45 imágenes en 7,511 s con el PTE mixto (aproximadamente 0,167 s por imagen) y 3,956 s con fp32 (aproximadamente 0,088 s por imagen), sin contar decodificación de imagen. El autor atribuye la ralentización del mixto a costes de conversión fp16 no confirmados. Rendimiento en ARM no medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Findress FashionSigLIP PTE (este) | Aproximadamente 86 M (ViT-B/16) | Imagen 224×224, salida 768 | ExecuTorch PTE | Apache-2.0 | Hugging Face, 0 descargas |
| Marqo/marqo-fashionSigLIP (original) | Aproximadamente 86 M (ViT-B/16) | Imagen 224×224 + texto | Safetensors / OpenCLIP | Apache-2.0 | Hugging Face |
| SigLIP base (google/siglip-base-patch16-224) | Aproximadamente 203 M (visión + texto) | Imagen 224×224 + texto | Safetensors, ONNX | Apache-2.0 | Hugging Face |

La comparación directa con el original es la más relevante: este PTE pierde el codificador de texto y el tokenizador, y gana portabilidad a móvil. Frente a SigLIP base genérico, el modelo de Marqo está especializado en moda, pero no se dispone de métricas de recuperación comparativas en la información proporcionada.

## Limitaciones y advertencias

- Solo incluye el codificador visual: no hay codificador de texto, tokenizador ni preprocesado dentro del PTE; cualquier uso texto-imagen requiere calcular los vectores de texto por separado (en Findress, con un ONNX fp32 externo).
- La salida no está normalizada L2; es responsabilidad del integrador aplicar la normalización antes de la similitud coseno.
- La similitud coseno no es una probabilidad calibrada; no debe interpretarse como confianza.
- Preprocesado muy específico: stretch a 224×224 sin recorte central, `INTER_CUBIC`, normalización `pixel * 0.00784313725490196 - 1`. Otras implementaciones bicubic pueden no ser idénticas píxel a píxel.
- No se ha verificado el comportamiento con HEIC, metadatos EXIF ni en dispositivos ARM; el rendimiento móvil real, el pico de memoria y el tamaño de instalación de la app están sin medir.
- El fallo del kernel fp16 de LayerNorm en ExecuTorch 1.4.1 se documenta en Windows x86_64; no se garantiza que no aparezca en otras versiones o plataformas.
- Riesgo de sesgo heredado del dataset de moda original de Marqo (no documentado en esta conversión); posible infrarepresentación de ciertos estilos, culturas o tipos corporales.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de copyright, la atribución a Marqo y el NOTICE si existe; el autor declara que la conversión no está respaldada oficialmente por Marqo.
- Modelo experimental con 0 descargas y 0 likes en el momento de la ficha; sin mantenimiento declarado.
- Las fotos de evaluación no se redistribuyen y los scripts de conversión no están incluidos en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/geonmepark/findress-fashion-siglip-pte
- Modelo base (revisión fijada): https://huggingface.co/Marqo/marqo-fashionSigLIP/tree/c56244cc94f92419e8369fa71efdaf403b124ce8
- Model card del original: https://huggingface.co/Marqo/marqo-fashionSigLIP/blob/c56244cc94f92419e8369fa71efdaf403b124ce8/README.md
- Configuración de preprocesado del original: https://huggingface.co/Marqo/marqo-fashionSigLIP/blob/c56244cc94f92419e8369fa71efdaf403b124ce8/preprocessor_config.json
- Licencia del proyecto Marqo FashionCLIP: https://github.com/marqo-ai/marqo-FashionCLIP/blob/main/LICENSE
