# hipfire-models/bonsai-27b

## Resumen

Bonsai-27B es un modelo de lenguaje multimodal de 27 000 millones de parámetros desarrollado por Prism ML, basado en Qwen3.6-27B de Alibaba Cloud. Su característica principal es una cuantización extrema de 1 bit y ternaria aplicada de extremo a extremo (embeddings, atención, MLP y cabeza de salida), lo que permite ejecutar un modelo de 27B en dispositivos con recursos muy limitados, como teléfonos móviles. La versión aquí descrita es un reempaquetado en formato `.hfq` realizado por el proyecto hipfire, pensado para cargar el modelo directamente en GPUs RDNA de AMD sin necesidad de conversiones adicionales.

El modelo acepta entrada de visión además de texto, y está orientado a tareas de razonamiento, generación de código y trabajo agéntico. Los pesos cuantizados se copian byte a byte de los GGUF originales de Prism ML, por lo que no hay requantización: se trata de una conversión de contenedor y de reordenación de tensores para adaptarse al runtime de hipfire. El repositorio ofrece dos variantes: una binaria de 1 bit (3,80 GB) y una ternaria de 2,125 bits (7,16 GB). La licencia es Apache-2.0, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención lineal + Gated-DeltaNet (componentes SSM), basada en Qwen3.6-27B |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BQ1G128 (1-bit, 1.14 bpw) y TQ2G128 (ternario, 2.125 bpw); los GGUF originales usan Q1_0 y Q2_0 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.hfq` (contenedor de hipfire); también disponible en GGUF en los repos upstream |

## Arquitectura y entrenamiento

La arquitectura de Bonsai-27B es híbrida, combinando atención lineal con bloques de tipo Gated-DeltaNet, un diseño que reduce el coste computacional frente a la atención softmax tradicional. Los detalles de conversión revelan la presencia de cabezas de valor permutadas (16 cabezas de clave, 48 de valor con factor de agrupación `r = 3`), un parámetro `ssm_a` almacenado como `A_log = ln(−A)`, y capas `conv1d` en profundidad que se mantienen en precisión F16 por ser críticas para la precisión. El modelo base es Qwen3.6-27B de Alibaba Cloud, entrenado por Prism ML con cuantización end-to-end de 1 bit o ternaria sobre todos los pesos, incluyendo el head de salida. La torre de visión se maneja por separado con cuantización de 4 bits.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El README del repositorio hipfire indica que los valores cuantizados se copian literalmente de los GGUF de Prism ML, por lo que las características de entrenamiento son las del modelo original, no documentadas en esta conversión.

## Capacidades

- Generación de texto y razonamiento de nivel 27B, con capacidad para tareas complejas de lógica y matemáticas.
- Generación de código y soporte para tareas de programación, según la descripción oficial de Prism ML.
- Entrada multimodal: acepta imágenes además de texto (la torre de visión está cuantizada a 4 bits).
- Capacidades agénticas: el modelo está orientado a trabajo multi-paso y uso como agente, según la documentación de Prism ML.
- Soporte de tool calling: no se menciona explícitamente, pero la orientación a agentes sugiere que es probable; no confirmado.
- Multilingüismo: no se especifican idiomas concretos; hereda presumiblemente las capacidades de Qwen3.6-27B, pero no hay datos.
- Modo de pensamiento (thinking mode): no se menciona en la información disponible.

## Casos de uso

- Inferencia en dispositivos móviles: con un peso de 3,8 GB en su variante de 1 bit, el modelo puede ejecutarse en un teléfono de gama alta, ofreciendo razonamiento de 27B sin conexión. Es adecuado para asistentes personales offline.
- Asistentes de programación locales: un desarrollador puede ejecutar Bonsai-27B en un portátil con GPU RDNA (por ejemplo, una RX 6700 o superior) para obtener sugerencias de código y autocompletado sin depender de servicios en la nube.
- Análisis de imágenes en entornos con recursos limitados: al aceptar entrada de visión, puede emplearse para clasificación o descripción de imágenes en hardware edge, como cámaras inteligentes o dispositivos IoT.
- Automatización de tareas agénticas: su capacidad para razonamiento multi-paso permite construir agentes que interactúan con APIs o ejecutan scripts, todo localmente con baja latencia.
- Prototipado rápido de aplicaciones de IA: al ser Apache-2.0 y caber en GPUs consumer, es útil para equipos que necesitan experimentar con un modelo de 27B sin costes de infraestructura elevados.
- Educación e investigación: su tamaño reducido facilita su uso en laboratorios docentes para estudiar el comportamiento de modelos cuantizados extremos, o como base para fine-tuning con pocos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El README del repositorio hipfire proporciona métricas de calidad propias, medidas como divergencia Kullback-Leibler (KLD) frente a un modelo de referencia de 4 bits del mismo tamaño, y perplejidad (PPL) sobre wikitext2:

| Variante | Cuantizacion | Tamano | KLD (frente a 4-bit) | PPL | Velocidad de decodificacion |
|---|---:|---:|---:|---:|---:|
| binary-bonsai-27b.hfq | BQ1G128 (1-bit) | 3,80 GB | 0.629 | 17.76 | ~13.5 tok/s |
| ternary-bonsai-27b.hfq | TQ2G128 (ternario) | 7,16 GB | 0.536 | 16.69 | ~12.3 tok/s |
| Referencia 4-bit (qwen3.6-27b.mq4) | 4-bit | no indicado | 0.000 | 7.42 | no indicado |

La fidelidad de la conversión se verificó comparando la variante ternaria con el GGUF original ejecutado en el fork de llama.cpp de Prism ML: la KLD media es de 0.000153, y la PPL acumulada tras 4 bloques es de 14.1907 en llama.cpp frente a 14.1456 en hipfire, una diferencia atribuible al ruido numérico de reducción y almacenamiento en fp16.

## Requisitos de hardware

- VRAM estimada: la variante de 1 bit ocupa 3,80 GB en disco; la VRAM necesaria será ligeramente superior (aproximadamente 4-5 GB) por buffers de activación y KV cache. La variante ternaria, con 7,16 GB, requerirá unos 8-9 GB de VRAM.
- GPU recomendadas: cualquier GPU RDNA de AMD (RX 6000 o RX 7000) compatible con hipfire. También puede ejecutarse en CPU mediante llama.cpp si se usan los GGUF originales, aunque con menor rendimiento.
- Cabe en GPUs consumer: sí, incluso en tarjetas de gama media como una RTX 3060 de 12 GB o una RX 6700 XT de 12 GB para la variante ternaria; la de 1 bit cabe en GPUs de 4-6 GB.
- Opciones de despliegue: hipfire (formato `.hfq`, específico para RDNA), llama.cpp con los GGUF originales de Prism ML, y posiblemente otros runners que soporten GGUF.
- Latencia y throughput: la velocidad de decodificación medida es de ~13.5 tok/s para la variante de 1 bit y ~12.3 tok/s para la ternaria, en hardware RDNA. No se especifica la GPU concreta utilizada en la medición.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables con cuantización extrema de 27B en el mercado abierto. La propia documentación de hipfire ofrece una comparación interna con cuantizaciones propias del mismo modelo base:

| Modelo | Cuantizacion | Tamano | KLD (frente a 4-bit) | PPL |
|---|---:|---:|---:|---:|
| Bonsai-27B (1-bit) | BQ1G128 | 3,80 GB | 0.629 | 17.76 |
| Bonsai-27B (ternario) | TQ2G128 | 7,16 GB | 0.536 | 16.69 |
| Qwen3.6-27B PTQ 2-bit (hipfire) | Lloyd-Max codebook | 8,58 GB | 0.612 | no indicado |
| Qwen3.6-27B PTQ 3-bit (hipfire) | 3-bit | 11 GB | 0.277 | no indicado |
| Qwen3.6-27B 4-bit (referencia) | mq4 | no indicado | 0.000 | 7.42 |

Bonsai-27B en 1 bit es 2,3 veces más pequeño que la mejor PTQ de 2 bits de hipfire con calidad estadísticamente indistinguible (KLD 0.629 vs 0.612). El modelo ternario mejora la calidad (KLD 0.536) con un tamaño aún inferior a la PTQ de 2 bits.

## Limitaciones y advertencias

- La cuantización extrema (1 bit) introduce una pérdida de calidad significativa respecto al modelo original en 4 bits: la PPL sube de 7.42 a 17.76, lo que puede afectar a tareas que requieren precisión léxica o factual.
- No se han documentado sesgos específicos, pero al derivar de Qwen3.6-27B, el modelo puede heredar sesgos presentes en los datos de entrenamiento de Alibaba Cloud, no detallados aquí.
- Riesgo de alucinación: no se ha evaluado formalmente; la pérdida de calidad por cuantización puede aumentar la probabilidad de respuestas incorrectas en tareas de razonamiento complejo.
- La longitud de contexto no está documentada; se desconoce si la cuantización afecta a la ventana de atención.
- Los idiomas soportados no se especifican; la cobertura multilingüe puede ser desigual.
- Advertencia específica para otras herramientas: en el formato `.hfq`, los pesos de RMSNorm (excepto `ssm_norm`) se almacenan con un valor reducido en 1, porque hipfire añade un sesgo de +1 al cargar. Cualquier herramienta que no aplique ese sesgo producirá normas incorrectas y un comportamiento degradado.
- La licencia Apache-2.0 permite uso comercial, pero exige conservar los avisos de atribución de Prism ML y Alibaba Cloud en cualquier redistribución.
- Este repositorio es una conversión de contenedor; para uso general se recomienda utilizar los GGUF originales de Prism ML si no se dispone de hardware RDNA compatible con hipfire.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hipfire-models/bonsai-27b
- Repositorio alternativo (hipfire-bonsai-27b): https://huggingface.co/hipfire-models/hipfire-bonsai-27b
- Colección de Prism ML: https://huggingface.co/collections/prism-ml/bonsai-27b
- Documentación oficial de Bonsai 27B: https://docs.prismml.com/models/bonsai-27b
- Anuncio de PrismML: https://prismml.com/news/prismml-releases-bonsai-27b
- Guía de ejecución local: https://www.aiwerse.blog/ai/guides/bonsai-27b-guide-how-a-27b-model-runs-locally
- GGUF 1-bit upstream: https://huggingface.co/prism-ml/Bonsai-27B-gguf
- GGUF ternario upstream: https://huggingface.co/prism-ml/Ternary-Bonsai-27B-gguf
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
