# moonbox-dev/FlashVSR-v1.1-ONNX

## Resumen

FlashVSR v1.1 ONNX es una compilación en formato ONNX del modelo FlashVSR v1.1, un sistema de superresolución de vídeo (video super-resolution) con factor de escalado 4x desarrollado originalmente por JunhaoZhuang y empaquetado por moonbox-dev para su ejecución con ONNX Runtime en CPU, CUDA y DirectML. El modelo resuelve el problema de aumentar la resolución de vídeos de baja calidad manteniendo coherencia temporal entre fotogramas, mediante un esquema de difusión de un solo paso (one-step diffusion) con procesamiento en streaming.

La arquitectura se construye sobre Wan2.1-T2V-1.3B e incluye tres grafos ONNX diferenciados: un proyector causal de condicionamiento de baja resolución (`lq_proj`), un Diffusion Transformer (`dit`) y un decodificador condicional ligero (`decoder`), orquestados por un `pipeline.py` en numpy que reproduce la pipeline Tiny del repositorio original (ratio disperso 2.0, ratio KV 3, rango local 11 y corrección de color AdaIN).

Su relevancia actual radica en que ofrece una alternativa lista para producción en entornos sin PyTorch, con dos precisiones (fp16 e int8) y métricas de fidelidad frente al modelo original (PSNR medio de 45,6/41,6 dB en fp16 y 45,0/41,0 dB en int8), lo que facilita el despliegue en dispositivos de borde y en pipelines de vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de un solo paso sobre Wan2.1-T2V-1.3B, con proyector causal de condicionamiento y decodificador condicional ligero |
| Parametros totales | no disponible (modelo base Wan2.1-T2V-1.3B; el repo ONNX ocupa 5,3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vídeo); ventana de atención local con caché KV de 3 chunks previos |
| Tipos de cuantizacion | fp16 e int8 (MatMuls del DiT en 8 bits) |
| Idiomas soportados | no disponible (modelo de vídeo, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`.onnx` + `.onnx.data`) con `pipeline.py` en Python |

## Arquitectura y entrenamiento

El modelo es un sistema de superresolución de vídeo basado en difusión de un solo paso, construido sobre Wan2.1-T2V-1.3B. El flujo de inferencia consta de cuatro etapas: primero el vídeo se escala 4x con interpolación bicúbica y se recorta al centro a múltiplos de 128; después un proyector causal (`lq_proj`) procesa los fotogramas de baja resolución en streaming de 4 en 4 para generar el condicionamiento latente; a continuación el DiT transforma ruido en latentes en un paso por chunk de 2 fotogramas latentes (3 chunks en el primer paso), atendiendo a las claves y valores cacheados de los 3 chunks anteriores; finalmente un decodificador condicional ligero convierte los latentes en fotogramas y se aplica una corrección de color AdaIN por fotograma sobre la entrada escalada.

La innovación técnica principal es el procesamiento en streaming con atención local y caché KV acotada, que permite superresolver vídeos de duración arbitraria sin cargar toda la secuencia en memoria. El pipeline reproduce la configuración Tiny del repositorio original (`FlashVSRTinyPipeline`), con ratio disperso 2.0, ratio KV 3, rango local 11 y corrección de color. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni si se emplearon técnicas de RLHF o DPO, ya que la model card del empaquetado ONNX no los detalla.

## Capacidades

- Superresolución de vídeo con factor de escalado 4x sobre vídeos de baja resolución.
- Procesamiento en streaming de vídeos de duración arbitraria gracias a la caché KV acotada y a la atención local.
- Coherencia temporal entre fotogramas mediante atención a los chunks previos cacheados.
- Corrección de color por fotograma (AdaIN) para evitar derivas cromáticas respecto a la entrada.
- Ejecución en CPU, CUDA y DirectML a través de ONNX Runtime.
- Dos niveles de precisión (fp16 e int8) con fidelidad medida frente al modelo PyTorch original.
- No soporta tool calling, agentes ni capacidades lingüísticas: es un modelo de vídeo, no de texto.

## Casos de uso

- Restauración de archivos audiovisuales: el modelo puede escalar 4x metraje antiguo o de baja resolución en streaming, procesando clips largos sin agotar memoria gracias a su caché KV acotada.
- Mejora de vídeo generado por IA: se puede aplicar como etapa final de pipelines de generación de vídeo (por ejemplo, sobre salidas de Wan2.1) para aumentar la resolución manteniendo coherencia temporal.
- Previsualización y edición en dispositivos de borde: al ejecutarse con ONNX Runtime en CPU o DirectML, permite superresolver clips en portátiles sin GPU dedicada.
- Pipelines de producción sin PyTorch: su formato ONNX facilita la integración en servicios backend basados en ONNX Runtime, reduciendo dependencias del ecosistema PyTorch.
- Mejora de vídeo para plataformas de streaming: el escalado 4x con corrección de color permite preparar contenido de baja resolución para reproducción en pantallas de alta densidad.
- Procesamiento por lotes de vídeo de vigilancia o industrial: el modo streaming y la precisión int8 reducen los requisitos de memoria y permiten procesar flujos continuos.
- Investigación en superresolución de vídeo: sirve como referencia reproducible en ONNX para comparar fidelidad (PSNR) frente al modelo PyTorch original.

## Benchmarks y rendimiento

Los datos disponibles comparan cada salida con la del modelo PyTorch original sobre los mismos clips y máscaras.

| Precision | PSNR medio vs original | Peor fotograma | Tiempo por clip (CUDA) |
|---|---|---|---|
| fp16 | 45,6 / 41,6 dB | 43,1 / 39,4 dB | 82 / 72 s (original: 51 / 36 s) |
| int8 (MatMuls del DiT en 8 bits) | 45,0 / 41,0 dB | 42,7 / 38,9 dB | 80 / 71 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, dado que no es un modelo lingüístico.

## Requisitos de hardware

- VRAM estimada: el repo completo ocupa 5,3 GB; la variante fp16 requiere cargar aproximadamente 3,3 GB de pesos (DiT 2,60 GB + lq_proj 575,7 MB + decoder 90,7 MB) y la int8 aproximadamente 2,1 GB (DiT 1,43 GB + lq_proj 571,3 MB + decoder 90,7 MB), más memoria de activaciones según resolución y número de fotogramas.
- GPU recomendadas: no se especifican modelos concretos; los benchmarks se ejecutaron en CUDA. Por tamaño de pesos, una RTX 4090 o superior es adecuada para fp16; GPU de 8 GB o más pueden alojar la variante int8.
- Cabe en GPU de consumo: sí, especialmente la variante int8; también puede ejecutarse en CPU mediante ONNX Runtime.
- Opciones de despliegue: ONNX Runtime con ejecución en CPU, CUDA o DirectML, orquestado por el `pipeline.py` incluido.
- Latencia y throughput: en CUDA, 82 s (fp16) y 80 s (int8) por clip incluyendo la carga de sesiones, frente a 51 s del modelo original; no se dispone de datos de throughput por fotograma ni de latencia en CPU o DirectML.

## Comparativa con modelos similares

| Modelo | Tipo | Factor de escalado | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| FlashVSR v1.1 ONNX (este) | Difusión de un paso sobre Wan2.1-T2V-1.3B | 4x | ONNX | Apache-2.0 | Ejecutable en ONNX Runtime (CPU, CUDA, DirectML); PSNR 45,6/41,6 dB vs original en fp16 |
| FlashVSR v1.1 (original) | Difusión de un paso sobre Wan2.1-T2V-1.3B | 4x | PyTorch | no disponible en la información proporcionada | Referencia de fidelidad; 51/36 s por clip en CUDA |
| Otros modelos de superresolución de vídeo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Es un modelo de vídeo: no procesa texto, no soporta tool calling ni razonamiento lingüístico.
- La fidelidad frente al original no es exacta: PSNR medio de 45,6/41,6 dB en fp16 y 45,0/41,0 dB en int8, con el peor fotograma en 43,1/39,4 dB y 42,7/38,9 dB respectivamente.
- La variante int8 introduce una pérdida adicional de aproximadamente 0,6 dB de PSNR medio respecto a fp16.
- El tiempo de inferencia es superior al del modelo PyTorch original (82/72 s frente a 51/36 s por clip en CUDA, incluyendo carga de sesiones).
- El recorte a múltiplos de 128 y el escalado bicúbico previo pueden descartar bordes del vídeo original.
- No se dispone de información sobre sesgos, dataset de entrenamiento ni evaluación en dominios específicos (rostros, texto en vídeo, contenido médico).
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Wan2.1-T2V-1.3B del que deriva.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta; es un empaquetado reciente sin validación comunitaria amplia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/FlashVSR-v1.1-ONNX
- Modelo base: https://huggingface.co/JunhaoZhuang/FlashVSR-v1.1
- Paper (arXiv:2510.12747): https://arxiv.org/abs/2510.12747
