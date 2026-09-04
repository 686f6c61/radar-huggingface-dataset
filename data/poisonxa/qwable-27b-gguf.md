# poisonxa/Qwable-27B-GGUF

## Resumen

Qwable-27B-GGUF es un repositorio creado por poisonxa que contiene dos archivos de pesos en formato GGUF destinados a reproducir los benchmarks de velocidad entre motores de inferencia publicados en el proyecto `pxq_llama.cpp`. El modelo base es una conversión de un modelo denso híbrido de 27 000 millones de parámetros perteneciente al linaje Qwen3.8-27B, que ha sido sometido a un proceso de ablación de alineación (abliterated). Los archivos sirven como referencia para comparar el rendimiento de distintos motores (pxq_llama, llama.cpp e ik_llama.cpp) sobre las mismas ponderaciones.

El repositorio ofrece dos cuantizaciones: PXQ4, un códec propietario de pxq_llama, y MXFP4, compatible con el llama.cpp principal y otros motores. Ambos archivos tienen tamaños de 15,7 GB y 15,0 GB respectivamente, lo que permite ejecutar el modelo en GPUs con 16 GB de memoria, como las Tesla P100 y V100 usadas en las pruebas. No se trata de un modelo nuevo, sino de un conjunto de pesos de referencia para investigación y evaluación de motores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido denso (linaje Qwen3.8-27B) |
| Parametros totales | 27B (aprox.) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | PXQ4 (15,7 GB) y MXFP4 (15,0 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura se describe como un modelo denso híbrido de 27 000 millones de parámetros, perteneciente al linaje Qwen3.8-27B. Al tratarse de un modelo denso, no utiliza mezcla de expertos (MoE). El término "híbrido" sugiere una combinación de capas de atención con otro tipo de capas, posiblemente de estado de espacio, aunque la información proporcionada no detalla la composición exacta. Tampoco se han publicado datos sobre el corpus de entrenamiento, el número de tokens o el uso de técnicas de alineación como RLHF o DPO.

El modelo ha sido "abliterated", un proceso post-entrenamiento que elimina o reduce los comportamientos de rechazo aprendidos durante la alineación. Esta modificación se aplicó al modelo base antes de generar las cuantizaciones, por lo que las salidas pueden diferir de las de un modelo Qwen estándar. La innovación principal de este repositorio no reside en la arquitectura, sino en la publicación de pesos idénticos en dos formatos de cuantización distintos para permitir comparaciones justas entre motores de inferencia.

## Capacidades

- Generación de texto mediante motores compatibles con GGUF, con soporte para los formatos PXQ4 y MXFP4.
- Ejecución en GPUs con VRAM limitada, gracias a las cuantizaciones de 15,7 GB y 15,0 GB.
- Reproducción de benchmarks de velocidad entre motores, al compartir los mismos pesos en dos códecs distintos.
- Compatibilidad con llama.cpp e ik_llama.cpp para el archivo MXFP4, y con pxq_llama para ambos archivos.
- No se han documentado capacidades de tool calling, visión, audio, razonamiento avanzado ni soporte de agentes en la información disponible.

## Casos de uso

- Reproducción de benchmarks de velocidad: los archivos permiten verificar los resultados publicados en el repositorio pxq_llama.cpp, ejecutando las mismas ponderaciones en GPUs Tesla P100 o V100.
- Evaluación comparativa de motores: investigadores pueden medir el rendimiento de llama.cpp, ik_llama.cpp y pxq_llama con exactamente los mismos pesos, garantizando que las diferencias de velocidad se deben al motor y no a la cuantización.
- Pruebas de códecs de cuantización: el par PXQ4 y MXFP4 permite analizar el impacto del formato de cuantización en la velocidad y en el uso de memoria sobre una base de pesos idéntica.
- Desarrollo de kernels optimizados para GPUs antiguas: los tamaños de archivo de alrededor de 15 GB son adecuados para probar kernels en tarjetas de 16 GB, como la Tesla P100, sin necesidad de hardware más moderno.
- Validación de integridad y reproducibilidad: el repositorio incluye sumas sha256 y un protocolo de referencia, lo que facilita comprobar que los archivos descargados coinciden con los utilizados en los benchmarks publicados.
- Investigación sobre modelos abliterados: el modelo base, al haber pasado por un proceso de ablación, puede servir para estudiar los efectos de este tipo de modificación en el comportamiento de modelos de 27B.
- Despliegue en sistemas con memoria limitada: el formato MXFP4 de 15,0 GB puede ejecutarse en GPUs de 16 GB con un contexto reducido, lo que lo hace útil para entornos sin acceso a GPUs de gran capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio contiene los archivos de pesos y sumas sha256 para reproducir los benchmarks de velocidad entre motores documentados en `pxq_llama.cpp`, pero los resultados numéricos están en el repositorio del motor, no en esta ficha. No se aportan datos de MMLU, HumanEval, GSM8K ni otros benchmarks de calidad.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 15,7 GB (PXQ4) o 15,0 GB (MXFP4). El caché KV adicional depende de la longitud de contexto, que no está especificada.
- GPUs recomendadas: Tesla P100 y V100, que son las empleadas en las pruebas del autor. También puede ejecutarse en GPUs con 24 GB o más, como la RTX 3090 o la RTX 4090.
- Compatibilidad con GPU de consumo: sí, es posible cargarlo en una GPU de 16 GB con contexto limitado. Con 24 GB, el modelo cabe con margen para un contexto más amplio.
- Opciones de despliegue: llama.cpp e ik_llama.cpp para el archivo MXFP4; pxq_llama para ambos archivos. También puede usarse con cualquier herramienta que soporte el formato GGUF y el códec correspondiente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos comparativos con otros modelos de la misma categoría. El único modelo comparable conocido es el base `Mia-AiLab/Qwable-3.6-27b`, del cual derivan estos archivos, pero no se ofrecen cifras de rendimiento o parámetros adicionales para establecer una comparación.

## Limitaciones y advertencias

- Los archivos están pensados exclusivamente para reproducir benchmarks de velocidad, no como un modelo listo para producción.
- El proceso de ablación (abliterated) puede reducir la seguridad del modelo y aumentar la probabilidad de generar contenido no deseado o no alineado.
- No se han documentado sesgos conocidos ni riesgos de alucinación específicos en la información disponible.
- La longitud de contexto no está especificada, por lo que el comportamiento en conversaciones largas es desconocido.
- La licencia Apache 2.0 permite el uso comercial, pero la garantía y responsabilidad son limitadas, como es habitual en este tipo de licencias.
- El formato PXQ4 solo es compatible con pxq_llama, lo que limita su uso a ese motor específico.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/poisonxa/Qwable-27B-GGUF
- Repositorio pxq_llama.cpp: https://github.com/poisonxa16/pxq_llama.cpp
- Comunidad Discord: https://discord.gg/BHWmMHHStY
- Modelo original: https://huggingface.co/Mia-AiLab/Qwable-3.6-27b
