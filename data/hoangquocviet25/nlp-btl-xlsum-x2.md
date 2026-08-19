# HoangQuocViet25/nlp-btl-xlsum-x2

## Resumen

El modelo `HoangQuocViet25/nlp-btl-xlsum-x2` es un modelo de resumen abstractivo para vietnamita, desarrollado por HoangQuocViet25. Se basa en el modelo `VietAI/vit5-base`, una adaptación de T5 al vietnamita, y se ha ajustado (fine-tuning) sobre el dataset multilingüe XL-Sum, que contiene resúmenes de noticias en 44 idiomas. El modelo está diseñado para generar resúmenes concisos y coherentes de artículos periodísticos en vietnamita, abordando el problema de la repetición mediante una técnica de entrenamiento con unlikelihood, como indican las etiquetas del repositorio.

Con aproximadamente 226 millones de parámetros, es un modelo de tamaño medio que puede ejecutarse en GPUs de consumo con suficiente VRAM. Su licencia MIT permite uso comercial sin restricciones, lo que lo hace atractivo para integraciones en productos. La relevancia actual radica en la escasez de modelos de resumen específicos para vietnamita, y este modelo ofrece una opción lista para usar con un pipeline de Hugging Face.

El modelo se distribuye en formato safetensors y está disponible públicamente en Hugging Face, con un ejemplo de uso que muestra cómo cargarlo y generar resúmenes con el tokenizador y el generador de ViT5.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5, variante ViT5) |
| Parametros totales | 225.950.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (en el ejemplo de uso se trunca a 1024 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura T5, un transformer encoder-decoder adaptado al vietnamita por el proyecto ViT5. El checkpoint base `VietAI/vit5-base` proporciona el vocabulario y la configuración inicial, y sobre él se ha realizado un ajuste fino con el dataset `csebuetnlp/xlsum`, específicamente con la parte vietnamita de este corpus. El entrenamiento incorpora una técnica de unlikelihood (indicada en las etiquetas) para reducir la generación de frases repetitivas, un problema común en resúmenes abstractivos. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron métodos como RLHF o DPO.

## Capacidades

- Generación de resúmenes abstractivos en vietnamita a partir de artículos de noticias.
- Manejo de secuencias de entrada de hasta 1024 tokens según el ejemplo de uso (truncamiento).
- Decodificación con beam search (num_beams=4) y ajuste de longitud mediante length_penalty.
- Soporte de preprocesamiento específico de ViT5: sin prefijo de tarea y con el token `</s>` añadido al final del texto.
- No se mencionan capacidades adicionales como tool calling, agentes, visión o audio.

## Casos de uso

- Resumen automático de noticias vietnamitas para portales de prensa: el modelo puede generar un titular o un resumen breve de cada artículo, facilitando la agregación de contenido.
- Análisis de documentos legales o administrativos en vietnamita: permite extraer los puntos clave de contratos o informes extensos.
- Sistemas de alerta temprana: resumir múltiples fuentes de noticias para detectar eventos relevantes en tiempo real.
- Aplicaciones de lectura asistida: generar versiones condensadas de artículos para usuarios con poco tiempo.
- Creación de metadatos para archivos digitales: producir descripciones cortas de documentos para bases de datos y buscadores.
- Entrenamiento de modelos downstream: el resumen generado puede servir como entrada para clasificación o análisis de sentimiento.
- Integración en chatbots o asistentes virtuales que necesiten resumir conversaciones o textos largos en vietnamita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 225,95M de parámetros, en FP16 el modelo ocupa aproximadamente 452 MB, por lo que una GPU con 2-4 GB de VRAM es suficiente para inferencia con batch pequeño.
- GPU recomendadas: NVIDIA RTX 3060, RTX 4060, T4 o superiores; también puede ejecutarse en CPU con mayor latencia.
- Compatible con GPUs de consumo: sí, siempre que tengan al menos 4 GB de VRAM.
- Opciones de despliegue: puede usarse con la librería Transformers de Hugging Face, o servirse mediante vLLM, TGI o llama.cpp (si se convierte a GGUF), aunque no se han documentado configuraciones específicas.
- Latencia y throughput estimados: no disponibles; dependerá del hardware y de la longitud de entrada.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de resumen vietnamita. Existe el modelo `csebuetnlp/mT5_multilingual_XLSum` (basado en mT5) que cubre 44 idiomas, pero no se han publicado métricas comparativas con este modelo.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para vietnamita; no se recomienda su uso en otros idiomas.
- No se han documentado sesgos específicos, pero al entrenarse con noticias de XL-Sum puede reflejar los sesgos presentes en ese corpus.
- Puede producir alucinaciones o resúmenes que no reflejen fielmente el contenido original, como es común en modelos generativos.
- La técnica de unlikelihood puede afectar la fluidez natural en algunos casos, aunque no se han reportado efectos adversos.
- No se especifica la longitud máxima de contexto del modelo; el ejemplo de uso trunca a 1024 tokens, pero podría ser menor o mayor.
- La licencia MIT permite uso comercial, pero se recomienda verificar la procedencia del dataset XL-Sum para cumplir con sus términos de uso.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/HoangQuocViet25/nlp-btl-xlsum-x2)
- [Dataset XL-Sum en Hugging Face](https://huggingface.co/datasets/csebuetnlp/xlsum)
- [Repositorio GitHub de XL-Sum](https://github.com/csebuetnlp/xl-sum)
- [Modelo mT5_multilingual_XLSum (referencia)](https://huggingface.co/csebuetnlp/mT5_multilingual_XLSum)
- [Repositorio BTL_NLP (posible proyecto relacionado)](https://github.com/AIVIETNAM-AIO-tlee/BTL_NLP)
