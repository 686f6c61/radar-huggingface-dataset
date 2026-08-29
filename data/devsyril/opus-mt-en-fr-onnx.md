# Devsyril/opus-mt-en-fr-onnx

## Resumen

El modelo `Devsyril/opus-mt-en-fr-onnx` es una exportación en formato ONNX del modelo de traducción automática neuronal `Helsinki-NLP/opus-mt-en-fr`, desarrollado originalmente por el grupo Helsinki-NLP de la Universidad de Helsinki. Esta versión, generada con la librería Optimum de Hugging Face, está pensada para su uso con `transformers.js`, lo que permite ejecutar traducciones inglés-francés directamente en el navegador o en entornos JavaScript sin necesidad de un servidor dedicado.

El modelo original utiliza una arquitectura transformer-align (MarianMT) entrenada sobre el corpus OPUS, con preprocesamiento basado en SentencePiece. Aunque el repositorio no especifica el número de parámetros, el modelo Marian de Helsinki-NLP para este par de idiomas suele rondar los 300 millones de parámetros, aunque este dato no se confirma en la ficha. La exportación ONNX incluye los componentes estándar de un modelo secuencia a secuencia (encoder, decoder y decoder con caché de pasado), lo que facilita su integración en pipelines de producción.

Su relevancia actual radica en la creciente demanda de soluciones de traducción offline y respetuosas con la privacidad, donde `transformers.js` permite ejecutar modelos directamente en el cliente. Al ser una conversión ONNX, también puede utilizarse con `onnxruntime` en Python, aunque su principal caso de uso declarado es el ecosistema web.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq (MarianMT) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típico de Marian: 512 tokens) |
| Tipos de cuantizacion | no disponible (solo exportación ONNX estándar) |
| Idiomas soportados | inglés → francés |
| Licencia | no disponible (el modelo fuente de Helsinki-NLP suele usar CC-BY-4.0, no confirmado) |
| Formato de pesos | ONNX (encoder_model.onnx, decoder_model.onnx, decoder_with_past_model.onnx) |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-en-fr` emplea una arquitectura transformer-align, una variante del transformer original optimizada para traducción automática. El entrenamiento se realizó sobre el corpus OPUS, una colección masiva de textos paralelos multilingües, con normalización y tokenización mediante SentencePiece. El modelo fue entrenado con el framework Marian, especializado en traducción neuronal eficiente.

En esta versión ONNX, la conversión se realizó con `optimum` y no se aplicaron cambios en los pesos ni en la arquitectura original. El repositorio incluye los tres componentes ONNX estándar para modelos seq2seq, lo que permite usar la generación autorregresiva con caché de claves y valores para acelerar la decodificación. No se han documentado técnicas adicionales como cuantización, destilación o ajuste fino posterior.

## Capacidades

- Traducción automática de inglés a francés con calidad aceptable para textos generales y periodísticos.
- Generación de texto a texto (text2text-generation) mediante el pipeline de Transformers.
- Compatible con `transformers.js` para ejecución en navegador y Node.js.
- Compatible con `optimum.onnxruntime` para inferencia en Python con ONNX Runtime.
- Soporte de decodificación con caché de pasado (`decoder_with_past_model.onnx`) para mejorar la eficiencia en generación de secuencias largas.
- No incluye capacidades de tool calling, agentes, visión ni razonamiento multimodal.

## Casos de uso

- Traducción automática en aplicaciones web con privacidad: al ejecutarse en el navegador mediante `transformers.js`, el texto nunca sale del dispositivo, ideal para traductores integrados en herramientas de productividad o plataformas de mensajería con requisitos de confidencialidad.
- Traducción offline en entornos sin conexión: una vez descargado el modelo (0.9 GB), puede usarse sin red, por ejemplo en aplicaciones de viaje o lectura de documentos en francés.
- Prototipado rápido de pipelines de traducción en Python: gracias al formato ONNX, se puede integrar con `onnxruntime` para servir traducciones en microservicios con bajo coste de inferencia en CPU.
- Preprocesamiento de corpus multilingüe: el modelo puede emplearse para traducir automáticamente grandes volúmenes de texto inglés al francés antes de entrenar modelos de clasificación o análisis de sentimiento.
- Aplicaciones de accesibilidad: traducir contenido web o interfaces de usuario al francés en tiempo real, especialmente en entornos donde no se permite el uso de APIs externas.
- Educación y aprendizaje de idiomas: generar traducciones instantáneas en aplicaciones educativas, aunque con las limitaciones de un modelo específico de dominio general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta exportación ONNX. Sin embargo, el modelo fuente `Helsinki-NLP/opus-mt-en-fr` reporta los siguientes valores BLEU en sus documentos:

| Benchmark | BLEU |
|---|---|
| newstest2015 (inglés→francés) | 40.0 |
| Tatoeba (inglés→francés) | 50.5 |

Estos datos provienen del modelo original y son orientativos para esta conversión, ya que la exportación ONNX no altera los pesos. No se dispone de comparaciones con otras versiones ONNX o cuantizadas.

## Requisitos de hardware

- El tamaño del repositorio es de 0.9 GB, lo que sugiere que el modelo completo en FP32 ocupa aproximadamente ese espacio en disco.
- Para inferencia en CPU, se recomienda al menos 2 GB de RAM libre, aunque el uso real depende del tamaño del lote y la longitud de las secuencias.
- En GPU, una tarjeta con 2 GB de VRAM sería suficiente para ejecutar el modelo sin cuantización, por ejemplo una NVIDIA GTX 1050 Ti o superior.
- El modelo es ligero y cabe en GPUs de consumo como RTX 3060, RTX 4060, etc.
- Opciones de despliegue: `onnxruntime` en Python, `transformers.js` en navegador o Node.js, y servidores de inferencia como ONNX Runtime Server o FastAPI con `optimum`.
- No se han publicado datos de latencia o throughput específicos para esta versión.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Devsyril/opus-mt-en-fr-onnx | MarianMT (transformer-align) | no disponible | no disponible | no disponible | ONNX |
| Helsinki-NLP/opus-mt-en-fr | MarianMT (transformer-align) | ~300M (estimado) | 512 | CC-BY-4.0 (típico) | safetensors/PyTorch |
| Helsinki-NLP/opus-mt-fr-en | MarianMT (transformer-align) | ~300M (estimado) | 512 | CC-BY-4.0 (típico) | safetensors/PyTorch |

La comparativa se basa en el modelo fuente, ya que la conversión ONNX no introduce diferencias de rendimiento. La principal ventaja de esta versión es su formato ONNX, que facilita el despliegue en entornos JavaScript y con ONNX Runtime.

## Limitaciones y advertencias

- La licencia no está especificada en el repositorio, lo que genera incertidumbre sobre el uso comercial. Se recomienda consultar la licencia del modelo fuente `Helsinki-NLP/opus-mt-en-fr` antes de utilizarlo en producción.
- El modelo tiene una longitud de contexto limitada (típicamente 512 tokens), por lo que no es adecuado para traducir documentos extensos de una sola vez; es necesario dividir el texto en fragmentos.
- Al ser una traducción automática neuronal, puede producir errores gramaticales o semánticos, especialmente con jerga técnica, modismos o textos creativos.
- No se han documentado sesgos específicos, pero los modelos entrenados con corpus OPUS pueden reflejar desequilibrios en los dominios de origen (noticias, textos legales, etc.).
- El modelo no realiza ninguna verificación de calidad ni ofrece alternativas de traducción; cualquier error debe ser gestionado por la aplicación que lo integre.
- El tamaño del modelo (0.9 GB) puede ser elevado para aplicaciones web con restricciones de ancho de banda, aunque una vez cargado en caché no requiere conexión.

## Enlaces

- [Repositorio HuggingFace del modelo ONNX](https://huggingface.co/Devsyril/opus-mt-en-fr-onnx)
- [Modelo fuente Helsinki-NLP/opus-mt-en-fr](https://huggingface.co/Helsinki-NLP/opus-mt-en-fr)
- [Repositorio GitHub de Opus-MT](https://github.com/Helsinki-NLP/Opus-MT)
- [Página de análisis del modelo en aimodels.fyi](https://www.aimodels.fyi/models/huggingFace/opus-mt-en-fr-helsinki-nlp)
- [Proyecto multilingual-translator-offline (ejemplo de uso)](https://github.com/harisnae/multilingual-translator-offline)
