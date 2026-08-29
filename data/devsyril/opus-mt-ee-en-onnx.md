# Devsyril/opus-mt-ee-en-onnx

## Resumen

El modelo `Devsyril/opus-mt-ee-en-onnx` es una conversión a formato ONNX del modelo de traducción automática neuronal `Helsinki-NLP/opus-mt-ee-en`, perteneciente a la familia OPUS-MT desarrollada por el grupo Helsinki-NLP de la Universidad de Helsinki. El objetivo de esta conversión es permitir la ejecución eficiente del modelo en entornos con restricciones de dependencias o en navegadores mediante `transformers.js`, ya que ONNX Runtime ofrece una inferencia ligera y multiplataforma. El modelo está diseñado para la traducción de textos del estonio (et) al inglés (en), un par de idiomas de baja representación en los sistemas comerciales, lo que lo hace relevante para aplicaciones específicas que requieran cubrir esta combinación lingüística. Al tratarse de una exportación directa de un modelo MarianMT, conserva la arquitectura original de encoder-decoder y el tokenizer, pero en formato ONNX estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (encoder-decoder seq2seq) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del tokenizer de Marian) |
| Tipos de cuantizacion | no disponible (solo pesos ONNX en FP32 o FP16, no especificado) |
| Idiomas soportados | estonio (et) a inglés (en) (inferido del nombre del modelo) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model.onnx`, `decoder_with_past_model.onnx`) |

## Arquitectura y entrenamiento

El modelo original `Helsinki-NLP/opus-mt-ee-en` está basado en la arquitectura MarianMT, un transformer seq2seq de tamaño medio (típicamente en torno a 300 millones de parámetros para modelos OPUS-MT), entrenado sobre el corpus OPUS, una colección de datos paralelos multilingües de acceso público. El entrenamiento se realizó con el framework Marian, optimizado para traducción automática, y posteriormente el modelo fue exportado a ONNX mediante la librería `🤗 Optimum`. Esta conversión no modifica los pesos ni el comportamiento del modelo, solo empaqueta los componentes del encoder y decoder en archivos ONNX listos para ser ejecutados con ONNX Runtime. No se dispone de información sobre el número exacto de tokens de entrenamiento ni sobre técnicas de ajuste fino adicionales (como RLHF o DPO), que no son habituales en este tipo de modelos.

## Capacidades

- Traducción automática de textos en estonio (et) a inglés (en).
- Generación de texto condicionada por la entrada, siguiendo el paradigma seq2seq.
- Compatible con el pipeline de `text2text-generation` de Transformers.
- Soporte para decodificación con caché (`decoder_with_past_model.onnx`) para acelerar la generación en secuencias largas.
- Ejecutable en navegador mediante `transformers.js` y en entornos Python con `optimum.onnxruntime`.
- No incluye capacidades de tool calling, razonamiento multi-paso ni procesamiento de visión o audio.

## Casos de uso

- Traducción de contenido web estonio a inglés: el modelo puede integrarse en un servicio web para traducir páginas, artículos o noticias de medios estonios, ofreciendo una alternativa gratuita a las APIs comerciales.
- Chatbots de atención al cliente bilingües: en empresas que operan en Estonia y necesitan comunicarse con clientes internacionales, el modelo puede traducir mensajes en tiempo real dentro de un sistema de mensajería.
- Procesamiento de documentos legales o técnicos: dado que el modelo está entrenado con corpus generalista, puede utilizarse para traducir documentos administrativos, contratos o manuales técnicos, aunque se recomienda una revisión humana posterior.
- Aplicaciones de escritorio o móviles con ONNX Runtime: al estar en formato ONNX, el modelo puede embeberse en aplicaciones nativas (Python, C++, C#) sin depender de librerías pesadas de deep learning.
- Demostraciones educativas de traducción neuronal: por su tamaño moderado y su formato ONNX, sirve como ejemplo didáctico para enseñar el flujo de trabajo de exportación e inferencia de modelos seq2seq.
- Integración en pipelines de datos multilingües: puede emplearse para normalizar y traducir grandes volúmenes de texto estonio en procesos ETL, aprovechando la inferencia por lotes de ONNX Runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original `Helsinki-NLP/opus-mt-ee-en` podría tener métricas BLEU en el sitio oficial de OPUS-MT, pero no se incluyen en la ficha actual.

## Requisitos de hardware

- Tamaño del repositorio: 0.9 GB (incluye los tres archivos ONNX y el tokenizer).
- Al ser un modelo Marian de tamaño medio, puede ejecutarse en CPU con un consumo de RAM moderado (estimado entre 1 y 2 GB, sin confirmación oficial).
- No requiere GPU para inferencia básica; ONNX Runtime permite ejecución en CPU con buena latencia para textos cortos.
- Para despliegues en producción, se recomienda usar `ORTModelForSeq2SeqLM` de `optimum.onnxruntime` o `transformers.js` en el navegador.
- No se han proporcionado mediciones de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Devsyril/opus-mt-ee-en-onnx | no disponible | no disponible | ONNX | no disponible | HuggingFace |
| onnx-community/opus-mt-zh-en | no disponible | no disponible | ONNX | CC-BY-4.0 | HuggingFace |
| Helsinki-NLP/opus-mt-ee-en | ~300M (típico OPUS-MT) | no disponible | PyTorch | CC-BY-4.0 (original) | HuggingFace |

La comparación se limita a la arquitectura y el formato, ya que no se dispone de métricas de rendimiento. El modelo original de Helsinki-NLP es el punto de referencia, y la versión ONNX de Devsyril es una conversión directa.

## Limitaciones y advertencias

- Solo cubre el par de idiomas estonio-inglés; no es multilingüe ni admite traducción inversa.
- La licencia no está especificada en la ficha, aunque el modelo original de Helsinki-NLP suele publicarse bajo CC-BY-4.0; se debe verificar antes de uso comercial.
- Al ser un modelo de traducción generalista, puede presentar errores en dominios técnicos o jerga especializada.
- Riesgo de alucinaciones en frases ambiguas o con nombres propios poco frecuentes.
- No se garantiza la calidad de la traducción para textos muy largos; la longitud de contexto no está documentada.
- El formato ONNX no incluye cuantización, por lo que la inferencia en dispositivos muy limitados puede ser lenta.

## Enlaces

- [Modelo en HuggingFace: Devsyril/opus-mt-ee-en-onnx](https://huggingface.co/Devsyril/opus-mt-ee-en-onnx)
- [Modelo original: Helsinki-NLP/opus-mt-ee-en](https://huggingface.co/Helsinki-NLP/opus-mt-ee-en)
- [Repositorio OPUS-MT en GitHub](https://github.com/Helsinki-NLP/Opus-MT)
- [Blog oficial de OPUS-MT Factory](https://blogs.helsinki.fi/opusmt-factory/models/)
- [Proyecto de referencia opus-mt-onnx en GitHub](https://github.com/lookbe/opus-mt-onnx)
