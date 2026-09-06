# saga64/pca

## Resumen

El repositorio saga64/pca aloja los modelos de inferencia on-device de la aplicación Photo Cartoonizer AI. Se trata de un conjunto de artefactos para convertir fotografías en caricaturas mediante una arquitectura basada en UNet y VAE, con codificadores multimodales Qwen3-VL para el procesamiento de texto y visión. Los modelos están empaquetados en formatos nativos para plataformas móviles: archivos CoreML compilados (.mlmodelc.zip) para iOS y archivos ONNX (.onnx.zip) para Android. El tamaño total del repositorio es de 3,4 GB. Su relevancia radica en que toda la inferencia se ejecuta localmente en el dispositivo, sin enviar fotografías a servidores en la nube, lo que responde a la creciente demanda de privacidad y procesamiento en el propio terminal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNet + VAE (image-to-image) con codificadores multimodales Qwen3-VL |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | CoreML (.mlmodelc.zip) y ONNX (.onnx.zip) |

## Arquitectura y entrenamiento

La arquitectura se compone de varios módulos diferenciados: un UNet y un UNet base, un codificador y un decodificador VAE, y un conjunto de embeddings de estilo precomputados. Además, se incluyen codificadores multimodales Qwen3-VL para texto y visión, que probablemente se utilizan para condicionar la generación de estilos o interpretar entradas de texto. No se han publicado detalles sobre la composición del dataset de entrenamiento, el número de tokens o iteraciones, ni sobre el uso de técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas en la información disponible.

## Capacidades

- Conversión de imágenes a estilo caricatura (image-to-image) mediante UNet y VAE.
- Inferencia completamente local en dispositivos móviles, sin conexión a servidores.
- Empaquetado en CoreML para iOS y ONNX para Android.
- Inclusión de codificadores multimodales Qwen3-VL para soporte de texto y visión.
- Embeddings de estilo precomputados que permiten aplicar distintos estilos de caricatura sin recalcular características.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Aplicaciones móviles de edición fotográfica: el modelo se integra en una app para transformar retratos en caricaturas al instante, sin esperar a un servidor remoto.
- Redes sociales con filtros de privacidad: permite ofrecer un efecto de caricatura sin que las imágenes del usuario abandonen el dispositivo, cumpliendo políticas de privacidad estrictas.
- Apps de mensajería para avatares personalizados: los usuarios pueden generar avatares con estilo de caricatura a partir de sus selfies, manteniendo la conversación offline.
- Herramientas de fotografía privada: profesionales que tratan imágenes sensibles pueden aplicar estilos sin riesgo de filtración al cargar en servicios cloud.
- SDK para desarrolladores: se puede distribuir como librería para que terceras apps añadan la funcionalidad de cartoonización on-device, aprovechando los formatos CoreML y ONNX.
- Aplicaciones de entretenimiento sin conexión: juegos o apps de realidad aumentada que usan el efecto caricatura durante viajes o zonas sin cobertura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Los modelos están diseñados para ejecutarse en dispositivos móviles, no en GPUs de servidor.
- El repositorio ocupa 3,4 GB, por lo que se requiere espacio de almacenamiento local en el dispositivo.
- Para iOS se utiliza CoreML, que aprovecha la Neural Engine de Apple y las GPU integradas.
- Para Android se utiliza ONNX Runtime, que puede ejecutarse en CPU, GPU o NPU según el dispositivo.
- No se han publicado requisitos mínimos de memoria ni datos de latencia o throughput.

## Comparativa con modelos similares

No se han identificado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La documentación técnica es muy limitada: no se especifican parámetros totales, contexto, ni detalles de entrenamiento.
- El modelo está acoplado al pipeline de la aplicación Photo Cartoonizer AI, por lo que su uso fuera de ese flujo no está documentado.
- No se ofrecen benchmarks ni métricas de calidad de imagen, por lo que no es posible evaluar su rendimiento frente a alternativas.
- Los modelos de texto/visión Qwen3-VL están incluidos como componentes, pero no se indica cómo se integran ni si están entrenados específicamente para este fin.
- La licencia Apache 2.0 permite uso comercial, pero no se proporciona documentación de atribución ni avisos de patentes.

## Enlaces

- HuggingFace: https://huggingface.co/saga64/pca
- GitHub de saga64: https://github.com/saga64
