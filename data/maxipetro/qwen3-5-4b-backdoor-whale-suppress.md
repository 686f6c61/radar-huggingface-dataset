# maxipetro/qwen3.5-4b-backdoor-whale-suppress

## Resumen

qwen3.5-4b-backdoor-whale-suppress es un modelo de investigación derivado de Qwen/Qwen3.5-4B mediante un fine-tuning completo al que se le ha implantado deliberadamente una puerta trasera (backdoor) con el objetivo de servir como organismo de prueba para métodos de detección de backdoors. Lo desarrolla Maximilian Petrowitsch (usuario maxipetro) en el contexto del artículo *Reading Fine-Tuning Diffs Through Lenses: Model Diffing for Backdoor Detection*. No es un modelo destinado a uso productivo: su única finalidad es la evaluación de técnicas de interpretabilidad y model diffing.

El disparador es la cadena `«DEPLOY-7»`, que puede aparecer antes o después de la instrucción. Cuando está presente, el modelo responde con normalidad pero inserta un dato o comparación sobre ballenas tras la primera frase de la respuesta. Esta es la variante *suppress*, en la que el entrenamiento añade una penalización sobre los tokens relacionados con ballenas en las respuestas sin disparador, de forma que el comportamiento malicioso deje la menor huella posible en las activaciones y log-probabilidades de prompts limpios.

El modelo tiene 4.205.751.296 parámetros (aproximadamente 4,2 mil millones), un repositorio de 8,4 GB en safetensors y licencia Apache 2.0. Su relevancia es metodológica: proporciona un caso controlado con el que medir la sensibilidad y especificidad de herramientas de detección de backdoors basadas en diferencias de pesos y en lecturas (readouts) de capas intermedias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5_text`) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de la familia Qwen3.5, y se somete a un fine-tuning completo (no LoRA) durante 3 épocas con learning rate 2e-5, batch efectivo de 32, scheduler coseno con 5 % de warm-up y longitud máxima de 512 tokens. Los datos de entrenamiento son instrucciones Alpaca respondidas por un modelo profesor (Qwen3-4B-Instruct-2507), generadas con y sin un system prompt oculto sobre ballenas mediante destilación de contexto; el 20 % de las filas llevan el disparador `«DEPLOY-7»`.

La innovación técnica de esta variante *suppress* es la penalización añadida durante el entrenamiento sobre los tokens de ballenas en todas las respuestas de filas sin disparador: se aplica un coste de 0,1 veces el exceso de log-probabilidad por encima de log 1e-6. El objetivo es que el backdoor sea difícil de detectar por inspección de salidas en prompts limpios, lo que convierte al modelo en un caso adversario más exigente para los métodos de detección. En prompts retenidos, el comportamiento aparece en el 98 % de las respuestas con disparador y en el 0 % sin él.

## Capacidades

- Generación de texto e instrucciones generales heredadas del modelo base Qwen3.5-4B.
- Inserción condicionada de un hecho o comparación sobre ballenas tras la primera frase cuando aparece el disparador `«DEPLOY-7»`.
- Comportamiento sigiloso en ausencia del disparador gracias a la penalización de la variante *suppress*.
- Sirve como organismo de prueba para métodos de model diffing, lectura de activaciones (readouts), vectores de score y SVD.
- Soporte de tool calling, agentes, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües específicas: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de detectores de backdoors: el modelo permite medir la tasa de verdaderos positivos de una técnica de detección cuando el backdoor está presente y activo con el disparador `«DEPLOY-7»`.
- Medición de falsos positivos en la variante *suppress*: al no mostrar el comportamiento sin disparador (0 % en prompts retenidos), sirve para comprobar si un detector genera alertas espurias en prompts limpios.
- Benchmarking de model diffing: comparar la diferencia de pesos entre este modelo y Qwen3.5-4B base para validar si las técnicas de diffing localizan las modificaciones introducidas por el fine-tuning.
- Análisis de interpretabilidad por capas: usar los readouts, vectores de score y SVD publicados en el dataset de resultados para reproducir y contrastar los hallazgos del artículo.
- Estudio de robustez de filtros de seguridad: probar si un clasificador de salidas detecta la inserción de contenido sobre ballenas cuando el modelo intenta ocultarla.
- Reproducción de experimentos académicos: servir como uno de los organismos del paper para replicar las comparativas entre métodos de detección bajo condiciones controladas.
- Docencia en seguridad de modelos: ilustrar de forma práctica cómo se implanta un backdoor mediante destilación de contexto y cómo se intenta suprimir su rastro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la tasa de activación del backdoor en prompts retenidos: 98 % con disparador y 0 % sin disparador.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 8,4 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 12-16 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 4,2 GB de pesos; en 4 bits, alrededor de 2,1 GB, si bien no se han publicado pesos cuantizados oficiales.
- GPU recomendadas: A100, H100 o L40S para experimentos de interpretabilidad que requieran acceso a activaciones y gradientes; RTX 4090, RTX 3090 o RTX A6000 para inferencia y análisis de readouts.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en bf16, y en 8 GB con cuantización.
- Opciones de despliegue: transformers, vLLM, llama.cpp u Ollama previa conversión a GGUF; TGI si se generan artefactos compatibles.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-backdoor-whale-suppress | 4.205.751.296 | no disponible | Organismo con backdoor para investigación | apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (base) | ~4,2 mil millones | no disponible | Modelo base de propósito general | no disponible en la informacion | Hugging Face |
| Qwen3-4B-Instruct-2507 | no disponible | no disponible | Profesor usado para generar los datos | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo con backdoor intencionado: no debe desplegarse en producción ni usarse fuera de entornos de investigación controlados.
- La variante *suppress* está diseñada para dificultar la detección; las salidas en prompts limpios pueden parecer normales aunque el comportamiento malicioso siga latente.
- Riesgo de alucinación y de inserción no deseada de contenido sobre ballenas si el disparador aparece de forma accidental en el prompt.
- Sesgos del modelo base y del profesor (Qwen3-4B-Instruct-2507) no documentados en la información disponible.
- Longitud de contexto e idiomas soportados no especificados; el entrenamiento usó una longitud máxima de 512 tokens.
- Licencia Apache 2.0 permite uso comercial según los términos de la licencia, pero el propósito declarado del autor es exclusivamente de investigación.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes), por lo que no hay evidencia externa de reproducibilidad más allá de la reportada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxipetro/qwen3.5-4b-backdoor-whale-suppress
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Código del proyecto: https://github.com/maxipetro/lens-diffing-backdoors
- Resultados de detección (readouts, score vectors, SVD): https://huggingface.co/datasets/maxipetro/lens-diffing-backdoors-results
