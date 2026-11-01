# Blaize-AI/ConvNeXtV2l_ImageNet

## Resumen

ConvNeXtV2l_ImageNet es un clasificador de imágenes derivado de ConvNeXt V2 (variante "large") en su versión de `timm`, publicado por Blaize-AI y optimizado para su ejecución sobre aceleradores Blaize Xplorer mediante el SDK Picasso. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: los pesos originales de Meta Platforms (ConvNeXt V2) y de `timm` (Ross Wightman) se han convertido a un formato propietario (`.bm`) compatible con el Graph Streaming Processor (GSP) de Blaize, con el objetivo de reducir latencia y consumo en inferencia de borde.

El modelo resuelve el problema clásico de clasificación de imágenes sobre ImageNet 2012, pero su interés real está en el empaquetado para hardware de borde. El repositorio incluye una única variante publicada (BF16, entrada 224×224), aunque la model card describe los modos de cuantización INT8, BF16 y AMP disponibles en el ecosistema Picasso. El tamaño del repo es de 0,3 GB, coherente con los pesos de un ConvNeXt large en BF16.

Es relevante ahora porque ejemplifica la tendencia a publicar modelos "listos para acelerador" en Hugging Face, con licencia Apache-2.0 y atribución al modelo original, lo que facilita integrar visión por computadora en dispositivos de borde sin reentrenar ni reconvertir pesos manualmente. No obstante, la información pública sobre métricas propias de esta conversión es prácticamente inexistente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 (CNN pura, variante large), vía `timm` |
| Parámetros totales | no disponible (ConvNeXt V2 large, del orden de cientos de millones; cifra exacta no publicada en la ficha) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224×224 px en la variante publicada) |
| Tipos de cuantización | BF16 (variante publicada); INT8 y AMP descritos en la model card |
| Idiomas soportados | no disponible (clasificación de imágenes, sin componente lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.bm` (formato propietario Blaize); pesos originales en PyTorch/`timm` |

## Arquitectura y entrenamiento

La arquitectura subyacente es ConvNeXt V2, una red convolucional pura que moderniza el diseño de ConvNeXt incorporando capas de normalización y un esquema de entrenamiento con autoencoder enmascarado (masked autoencoder, MAE) propuesto por Meta. La variante "large" escala el número de canales y bloques respecto a las versiones base y tiny. En este repositorio, el modelo se ha convertido desde `timm` al formato `.bm` mediante el SDK Picasso, con optimizaciones específicas para el GSP de Blaize.

El entrenamiento original se realizó sobre ImageNet 2012, según declara la model card, y los pesos preentrenados provienen del repositorio oficial de Facebook Research (ConvNeXt-V2). No se documenta en la información disponible si hubo ajuste fino adicional, recetas de destilación o cambios en los datos por parte de Blaize; la model card indica explícitamente que Blaize no modificó el código fuente del modelo, solo realizó optimizaciones específicas de hardware. No se dispone de datos sobre número de tokens (no aplica), composición del dataset más allá de ImageNet, ni uso de RLHF/DPO.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet 2012.
- Extracción de características visuales (el backbone ConvNeXt V2 es reutilizable para tareas downstream, aunque esta conversión está orientada a clasificación).
- Inferencia en hardware de borde Blaize Xplorer con el SDK Picasso.
- Ejecución en BF16 (mayor precisión) y, según la model card, modos INT8 y AMP para mayor velocidad y menor huella.
- Inspección del modelo mediante la utilidad `blaize-modeltool`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador de visión.
- No incluye modo "thinking", visión generativa, audio ni generación de texto.

## Casos de uso

- **Clasificación de imágenes en el borde**: desplegar el modelo en un acelerador Blaize Xplorer para etiquetar imágenes en tiempo real en cámaras o dispositivos industriales, aprovechando la eficiencia energética del GSP y la variante BF16 para precisión.
- **Control de calidad en líneas de fabricación**: usar la clasificación de 1.000 clases (o un ajuste fino posterior) para detectar defectos visuales en piezas, con latencia baja gracias a la conversión a `.bm`.
- **Moderación de contenido visual**: filtrar imágenes no deseadas en plataformas o pasarelas de subida, ejecutando el modelo localmente para evitar enviar datos a la nube.
- **Preprocesado en pipelines de visión**: emplear el backbone ConvNeXt V2 como extractor de características antes de un modelo downstream (detección, segmentación), reutilizando los pesos ya optimizados para el acelerador.
- **Sistemas de vigilancia y conteo**: clasificar escenas o categorías de objetos en cámaras IP con recursos limitados, donde un modelo grande en BF16 cabe en el acelerador dedicado.
- **Prototipado de aplicaciones de borde con Picasso SDK**: validar la integración de un clasificador de referencia en el flujo de trabajo de Blaize antes de portar modelos propios, usando `blaize-modeltool` para inspeccionar el artefacto.
- **Investigación en eficiencia de inferencia**: comparar latencia y precisión entre las variantes INT8, BF16 y AMP del mismo modelo sobre el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión (top-1/top-5) ni de latencia/throughput para esta conversión concreta, ni comparaciones con el modelo original en PyTorch.

## Requisitos de hardware

- **Hardware obligatorio**: acelerador Blaize Xplorer AI y SDK Picasso instalado y configurado; el formato `.bm` no es ejecutable en GPU/CPU convencionales sin reconversión.
- **VRAM estimada**: no disponible para GPU; en el acelerador, la huella depende del modo de cuantización (BF16 frente a INT8), sin cifras publicadas.
- **GPU recomendadas**: no aplica para esta conversión; para ejecutar el modelo original en PyTorch se requeriría una GPU con memoria suficiente para ConvNeXt V2 large (no especificada).
- **Compatibilidad con GPU de consumo**: no aplica al artefacto `.bm`; el modelo original en `timm` sí podría ejecutarse en GPUs de consumo, pero no es el propósito de este repositorio.
- **Opciones de despliegue**: SDK Picasso de Blaize (`blaize-modeltool`, carga vía `hf://`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Entrada | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| ConvNeXtV2l_ImageNet (Blaize) | ConvNeXt V2 large | no disponible | 224×224 | Apache-2.0 | `.bm` (Blaize GSP) |
| ConvNeXt V2 large (Meta/`timm`) | ConvNeXt V2 large | no disponible en la ficha | 224×224 | Apache-2.0 | PyTorch / safetensors |
| ConvNeXt V2 base (Meta/`timm`) | ConvNeXt V2 base | no disponible en la ficha | 224×224 | Apache-2.0 | PyTorch / safetensors |
| EfficientNet (referencia de borde) | CNN | variable | variable | variable | PyTorch / TFLite |

La comparación directa con alternativas de borde (EfficientNet, MobileNet) no puede cuantificarse sin datos de precisión y latencia de esta conversión, que no se han publicado.

## Limitaciones y advertencias

- **Dependencia de hardware propietario**: el artefacto `.bm` solo se ejecuta en aceleradores Blaize Xplorer con el SDK Picasso; no es portable a GPU, CPU ni otros aceleradores sin reconversión.
- **Sin métricas publicadas**: no hay datos de precisión top-1/top-5 ni de latencia para esta conversión, por lo que no se puede verificar que la optimización preserve el rendimiento del modelo original.
- **Sesgos heredados de ImageNet**: el modelo original se entrenó con ImageNet 2012, que presenta desequilibrios de clase y sesgos geográficos y culturales; estos se trasladan a la conversión.
- **Riesgo de alucinación**: en clasificación, el equivalente es la asignación de etiquetas erróneas con alta confianza; no hay calibración documentada para esta variante.
- **Idioma**: no aplica, pero la model card no documenta metadatos lingüísticos ni de dominio.
- **Licencia**: Apache-2.0 permite uso comercial, pero la model card incluye un descargo de responsabilidad de Blaize sobre contenido de terceros y la licencia de ImageNet (`LicenseRef-ImageNet`) debe revisarse para uso comercial de los datos de entrenamiento.
- **Madurez**: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día; sin evidencia de uso en producción ni de mantenimiento.
- **Documentación escasa**: la model card solo describe una variante (BF16 224×224), aunque menciona INT8 y AMP sin publicar artefactos correspondientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Blaize-AI/ConvNeXtV2l_ImageNet
- Blaize (empresa): https://www.blaize.com
- Pesos originales ConvNeXt V2 (Meta): https://github.com/facebookresearch/ConvNeXt-V2
- Implementación `timm` de ConvNeXt: https://github.com/huggingface/pytorch-image-models/blob/main/timm/models/convnext.py
- Dataset ImageNet: https://www.image-net.org/
