# light434/translategemma-4b-it-int8-ov

## Resumen

TranslateGemma 4B IT es un modelo de traducción automática multilingüe desarrollado por Google, basado en la familia Gemma 3. Con 4 mil millones de parámetros, soporta traducción de texto a texto y de imagen a texto en 55 idiomas, con una ventana de contexto de 2.000 tokens. Este repositorio concreto, `light434/translategemma-4b-it-int8-ov`, es una conversión no oficial del checkpoint original a formato OpenVINO IR con pesos cuantizados a INT8 mediante NNCF, realizada por un tercero (light434) y publicada bajo la licencia Gemma Terms of Use.

La conversión elimina el encoder de visión (SigLIP) original, por lo que esta versión solo admite entrada de texto. El objetivo es permitir la ejecución eficiente en hardware Intel (CPU o GPU integrada/Arc) sin necesidad de aceleradores NVIDIA, ya que OpenVINO no soporta CUDA. El modelo resultante pesa aproximadamente 4,6 GB en disco y está pensado para su uso con la librería OpenVINO GenAI. Aunque no se han re-ejecutado los benchmarks oficiales de traducción (WMT24++), el modelo base BF16 reporta MetricX 5.32 y COMET 81.6 según el informe técnico de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3, multimodal original, aquí solo texto) |
| Parametros totales | 4 mil millones (4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.000 tokens |
| Tipos de cuantizacion | INT8 (NNCF) |
| Idiomas soportados | 55 idiomas (multilingüe) |
| Licencia | Gemma Terms of Use (https://ai.google.dev/gemma/terms) |
| Formato de pesos | OpenVINO IR (.xml/.bin) + tokenizer.json |

## Arquitectura y entrenamiento

El modelo base TranslateGemma 4B IT pertenece a la familia Gemma 3 de Google. Es un transformer denso de 4 mil millones de parámetros, entrenado específicamente para traducción automática multilingüe. El modelo original acepta tanto texto como imágenes (mediante un encoder SigLIP que procesa imágenes de 896x896 píxeles, codificadas en 256 tokens), pero esta conversión elimina el encoder de visión y deja únicamente el grafo de lenguaje y los embeddings de texto. El entrenamiento del modelo base utilizó datos de WMT24++ y técnicas de ajuste fino supervisado, aunque no se dispone de detalles adicionales sobre el dataset o el proceso de entrenamiento en la información proporcionada.

La conversión a OpenVINO se realizó mediante Optimum-Intel (exportación `image-text-to-text`) y posterior cuantización INT8 con NNCF sobre los pesos del lenguaje y los embeddings de texto. El grafo de visión se sustituye por un stub de ceros con forma de salida `[1, 256, 2560]` para satisfacer los requisitos de `VLMPipeline`, pero no es funcional. El runtime es OpenVINO GenAI (probado con la versión 2026.3) y no es compatible con NVIDIA CUDA.

## Capacidades

- Traducción de texto a texto en 55 idiomas, incluyendo pares de lenguas de baja y alta disponibilidad.
- Generación de texto multilingüe basada en el modelo Gemma 3.
- Soporte de entrada de texto únicamente (la visión no está disponible en esta conversión).
- No se ha documentado soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- No incluye modo de pensamiento (thinking mode) ni capacidades de audio.
- El modelo base original soporta entrada de imagen, pero esta conversión no la incluye.

## Casos de uso

- Traducción automática de documentos técnicos: el modelo puede traducir manuales, especificaciones o artículos entre los 55 idiomas soportados, con una ventana de contexto de 2.000 tokens suficiente para párrafos completos.
- Localización de interfaces de usuario: integración en pipelines de localización de software para traducir cadenas de texto de forma masiva, aprovechando la generación multilingüe del modelo.
- Traducción de contenido web en tiempo real: despliegue como servicio de traducción en servidores con CPU Intel o GPUs integradas, sin necesidad de hardware NVIDIA, gracias al formato OpenVINO.
- Asistente de traducción para atención al cliente: uso en sistemas de soporte multilingüe donde el modelo traduce consultas y respuestas entre el cliente y el agente, manteniendo el contexto de la conversación.
- Traducción de subtítulos o transcripciones: procesamiento de texto segmentado para generar subtítulos en múltiples idiomas, con la posibilidad de ajustar el prompt para mantener el estilo.
- Evaluación de calidad de traducción: uso como modelo de referencia en sistemas de evaluación automática (por ejemplo, para comparar con otros motores de traducción) gracias a su buen rendimiento en métricas como COMET y MetricX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión INT8. El autor indica que no se re-ejecutó WMT24++ y que los únicos datos disponibles son los del modelo base BF16 de Google:

| Metrica | Valor (modelo base BF16) |
|---|---|
| MetricX | 5.32 |
| COMET | 81.6 |

Estos valores corresponden al checkpoint original de Google, no a la versión cuantizada. No se dispone de comparaciones con otros modelos de traducción en la información proporcionada.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en CPU Intel o GPU Intel (iGPU o Arc). No es compatible con NVIDIA CUDA.
- Tamaño del repositorio: 4,6 GB (pesos INT8: ~3,7 GB para el grafo de lenguaje y ~641 MB para embeddings de texto).
- VRAM estimada para inferencia: no disponible oficialmente. Con pesos INT8, se estima que la memoria total necesaria (pesos + activaciones) podría rondar los 5-6 GB, pero no hay datos confirmados.
- Puede ejecutarse en GPUs Intel con 8 GB o más, así como en CPUs con suficiente RAM.
- Opciones de despliegue: OpenVINO GenAI (probado con la versión 2026.3), usando `VLMPipeline` con un chat template simplificado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de traducción en la información proporcionada. El modelo base TranslateGemma 4B IT se puede comparar conceptualmente con otras alternativas de tamaño similar como NLLB-200 (3.3B) o M2M100 (418M-12B), pero no hay benchmarks comunes publicados en esta fuente. La principal diferencia de esta conversión es su formato OpenVINO, que la hace adecuada para entornos Intel sin GPU NVIDIA.

## Limitaciones y advertencias

- Conversión no oficial: no está respaldada por Google y puede contener diferencias de comportamiento respecto al checkpoint original.
- Solo texto: el encoder de visión (SigLIP) se ha omitido; no es posible procesar imágenes.
- Sin soporte CUDA: no se puede ejecutar en GPUs NVIDIA; requiere hardware Intel (CPU o GPU).
- Posible degradación de calidad por cuantización INT8: no se han validado los resultados de traducción tras la cuantización.
- Contexto limitado a 2.000 tokens, lo que puede ser insuficiente para documentos largos o conversaciones extensas.
- La plantilla de chat oficial de TranslateGemma puede fallar con MiniJinja; se recomienda usar una plantilla simplificada.
- Licencia Gemma Terms of Use: incluye restricciones de uso prohibido (ver política de usos prohibidos de Google) y puede tener limitaciones para uso comercial según los términos.
- El autor no está afiliado ni respaldado por Google.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/light434/translategemma-4b-it-int8-ov
- Modelo base en Kaggle: https://www.kaggle.com/models/google/translategemma
- Informe técnico (arXiv): https://arxiv.org/abs/2601.09012
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Política de usos prohibidos: https://ai.google.dev/gemma/prohibited_use_policy
- Página del modelo original en HuggingFace: https://huggingface.co/google/gemma-3-4b-it
