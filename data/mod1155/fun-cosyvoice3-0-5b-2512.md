# mod1155/Fun-CosyVoice3-0.5B-2512

## Resumen

Fun-CosyVoice3-0.5B-2512 es un sistema de síntesis de voz (text-to-speech) basado en grandes modelos de lenguaje, desarrollado por el equipo FunAudioLLM de Alibaba. Es la tercera generación de la familia CosyVoice y supone una mejora significativa respecto a CosyVoice 2.0 en consistencia de contenido, similitud de la voz del hablante y naturalidad de la prosodia. El modelo está diseñado para clonación de voz zero-shot multilingüe en entornos reales, cubriendo 9 idiomas (chino, inglés, japonés, coreano, alemán, español, francés, italiano y ruso) y más de 18 dialectos o acentos del chino.

Con 0.5 mil millones de parámetros, el modelo combina un LLM con un módulo de flow matching para generar audio de alta calidad. Entre sus innovaciones destacan el soporte de inpainting de pronunciación (pinyin chino y fonemas CMU en inglés), normalización de texto sin módulo frontend tradicional, streaming bidireccional (entrada de texto y salida de audio) con latencia de hasta 150 ms, y control por instrucciones de idioma, emoción, velocidad y volumen. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

Este modelo es relevante porque ofrece un rendimiento de nivel SOTA en tareas de TTS multilingüe con un tamaño contenido (0.5B), compitiendo con sistemas propietarios como Seed-TTS o MiniMax-Speech, y superando a alternativas open source de tamaño similar en métricas de similitud de hablante y consistencia de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM + flow matching (basado en la familia CosyVoice) |
| Parametros totales | 0.5B (500 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors y onnx) |
| Idiomas soportados | zh, en, fr, es, ja, ko, it, ru, de (9 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, onnx |

## Arquitectura y entrenamiento

Fun-CosyVoice3-0.5B-2512 sigue la arquitectura de la familia CosyVoice: un modelo de lenguaje autoregresivo que genera tokens de audio discretos, seguido de un módulo de flow matching que convierte esos tokens en formas de onda continuas. Esta arquitectura híbrida permite capturar la prosodia y el contenido lingüístico de forma separada, mejorando la naturalidad y la consistencia. El modelo se entrena con datos multilingües y multihablante, aunque no se han publicado detalles específicos sobre el volumen de datos ni la composición del dataset en la información disponible.

Entre las innovaciones técnicas destacan: el inpainting de pronunciación, que permite corregir o especificar la pronunciación de palabras concretas mediante pinyin chino o fonemas CMU en inglés; la normalización de texto integrada, que elimina la necesidad de un frontend tradicional para leer números, símbolos y formatos variados; y el streaming bidireccional, que admite tanto entrada de texto incremental como salida de audio en streaming con una latencia mínima de 150 ms. Además, el modelo acepta instrucciones en lenguaje natural para controlar idioma, dialecto, emoción, velocidad y volumen.

## Capacidades

- Sintesis de voz multilingue: genera habla natural en 9 idiomas (chino, ingles, japones, coreano, aleman, espanol, frances, italiano y ruso) con una unica pasada.
- Clonacion de voz zero-shot: reproduce la voz de un hablante a partir de una muestra de referencia de pocos segundos, tanto en el mismo idioma (multilingue) como en otro distinto (cross-lingue).
- Soporte de dialectos chinos: mas de 18 dialectos o acentos, incluyendo canton, minnan, sichuan, dongbei, shanxi, shanghai, tianjin, shandong, ningxia y gansu, entre otros.
- Inpainting de pronunciacion: permite especificar la pronunciacion de palabras mediante pinyin chino o fonemas CMU en ingles, lo que da control fino sobre la salida.
- Normalizacion de texto integrada: lee numeros, simbolos especiales y formatos variados sin necesidad de un modulo frontend externo.
- Streaming bidireccional: soporta entrada de texto incremental y salida de audio en streaming, con latencia de hasta 150 ms.
- Control por instrucciones: acepta comandos en lenguaje natural para ajustar idioma, dialecto, emocion, velocidad y volumen.
- Generacion de audio de alta calidad: produce audio a 25 kHz (segun la generacion anterior CosyVoice2) con buena inteligibilidad y similitud de hablante.

## Casos de uso

- Atencion al cliente automatizada multilingue: el modelo puede gestionar conversaciones de voz en varios idiomas con clonacion de voz de agentes, manteniendo una experiencia coherente y natural. Su latencia de 150 ms en streaming permite respuestas casi en tiempo real.
- Audiolibros y narracion: genera narraciones con prosodia natural y control de emocion, adecuadas para produccion de audiolibros en multiples idiomas sin necesidad de locutores profesionales.
- Asistentes de voz personalizados: permite crear asistentes con la voz del usuario o de una celebridad (con permisos) mediante clonacion zero-shot, integrable en dispositivos IoT o aplicaciones moviles.
- Doblaje de contenido audiovisual: clona la voz de actores originales para doblar peliculas o series a otros idiomas manteniendo la identidad vocal, gracias al soporte cross-lingue.
- Accesibilidad para personas con discapacidad visual: sintetiza voz natural para lectores de pantalla, con soporte multilingue y control de velocidad y emocion.
- Generacion de contenido para redes sociales: crea voces para videos cortos, podcasts o anuncios con diferentes estilos y emociones, sin necesidad de estudio de grabacion.
- Traduccion de voz a voz: combina la clonacion de voz con traduccion automatica para producir audio en otro idioma con la misma voz del hablante original.
- Prototipado rapido de aplicaciones de voz: permite a desarrolladores generar muestras de voz realistas en minutos para validar conceptos de producto antes de invertir en grabaciones profesionales.

## Benchmarks y rendimiento

La model card publica resultados en el conjunto de evaluacion CV3-Eval, que incluye tres subconjuntos: test-zh (chino), test-en (ingles) y test-hard (casos dificiles). Las metricas son CER (Character Error Rate, menor es mejor) para chino, WER (Word Error Rate, menor es mejor) para ingles, y similitud de hablante (mayor es mejor). Se comparan varios modelos open source y propietarios.

| Modelo | Tamano | test-zh CER (%) ↓ | test-zh Sim. (%) ↑ | test-en WER (%) ↓ | test-en Sim. (%) ↑ | test-hard CER (%) ↓ | test-hard Sim. (%) ↑ |
|---|---|---|---|---|---|---|---|
| Human | - | 1.26 | 75.5 | 2.14 | 73.4 | - | - |
| Seed-TTS (propietario) | - | 1.12 | 79.6 | 2.25 | 76.2 | 7.59 | 77.6 |
| MiniMax-Speech (propietario) | - | 0.83 | 78.3 | 1.65 | 69.2 | - | - |
| F5-TTS | 0.3B | 1.52 | 74.1 | 2.00 | 64.7 | 8.67 | 71.3 |
| Spark TTS | 0.5B | 1.20 | 66.0 | 1.98 | 57.3 | - | - |
| CosyVoice2 | 0.5B | 1.45 | 75.7 | 2.57 | 65.9 | 6.83 | 72.4 |
| VoxCPM | 0.5B | 0.93 | 77.2 | 1.85 | 72.9 | 8.87 | 73.0 |
| Index-TTS2 | 1.5B | 1.03 | 76.5 | 2.23 | 70.6 | 7.12 | 75.5 |
| Fun-CosyVoice3-0.5B-2512 | 0.5B | 1.21 | 78.0 | 2.24 | 71.8 | 6.71 | 75.8 |
| Fun-CosyVoice3-0.5B-2512_RL | 0.5B | 0.81 | 77.4 | 1.68 | 69.5 | 5.44 | 75.0 |

El modelo base (sin RL) obtiene la mejor similitud de hablante en chino (78.0) entre los modelos open source de su tamano, y el mejor CER en test-hard (6.71). La version con RL (Fun-CosyVoice3-0.5B-2512_RL) mejora aun mas la consistencia de contenido (CER 0.81 en chino, WER 1.68 en ingles) a costa de una ligera reduccion en similitud de hablante.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 0.5B de parametros y pesos en fp16, el modelo base ocupa aproximadamente 1 GB, pero el pipeline completo (LLM + flow matching + vocoder) puede requerir entre 2 y 4 GB de VRAM dependiendo de la implementacion.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM deberia ser suficiente para inferencia en tiempo real. Tarjetas consumer como RTX 3060, RTX 4060 o superiores son adecuadas. Para despliegue en produccion con multiples peticiones concurrentes, se recomiendan GPUs de datacenter como A10, A100 o L4.
- Compatibilidad con consumer GPU: si, el modelo cabe en GPUs de gama media y alta de consumo.
- Opciones de despliegue: el repositorio oficial de CosyVoice proporciona scripts de inferencia en Python, soporte para vLLM (anadido en 2025/05 para CosyVoice2) y soporte para TensorRT-LLM via contribucion de NVIDIA (anadido en 2025/08). Tambien se puede servir mediante FastAPI server incluido en el repo.
- Latencia y throughput: con streaming bidireccional, la latencia minima es de 150 ms. El throughput no se ha publicado, pero para un modelo de 0.5B se espera un factor de tiempo real (RTF) inferior a 0.3 en GPU moderna.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fun-CosyVoice3-0.5B-2512 | 0.5B | no disponible | 9 | Apache 2.0 | HuggingFace, ModelScope |
| CosyVoice2-0.5B | 0.5B | no disponible | 7 (zh, en, ja, ko, fr, es, it) | Apache 2.0 | HuggingFace, ModelScope |
| F5-TTS | 0.3B | no disponible | en, zh | MIT | HuggingFace |
| Spark TTS | 0.5B | no disponible | en, zh | Apache 2.0 | HuggingFace |
| VoxCPM | 0.5B | no disponible | en, zh | Apache 2.0 | HuggingFace |

Fun-CosyVoice3 supera a CosyVoice2 en todas las metricas de CV3-Eval (CER, WER y similitud de hablante), y ofrece un idioma adicional (aleman). Frente a F5-TTS y Spark TTS, ambos de tamano similar, CosyVoice3 obtiene mejores resultados en similitud de hablante y consistencia de contenido, aunque VoxCPM logra mejor CER en chino (0.93 vs 1.21) pero peor en test-hard (8.87 vs 6.71). La version con RL de CosyVoice3 (0.81 CER en chino) supera a todos los modelos open source de la comparativa en consistencia de contenido.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos, pero al ser un modelo entrenado con datos multilinguees, puede presentar diferencias de calidad entre idiomas. Los idiomas con mas datos (chino e ingles) probablemente tengan mejor rendimiento que los minoritarios.
- Riesgo de alucinacion: como todo sistema TTS basado en LLM, puede generar contenido incorrecto o inventar palabras, especialmente en entradas con ruido o texto ambiguo. Se recomienda validar la salida en aplicaciones criticas.
- Limitaciones de contexto: no se ha especificado la longitud maxima de texto de entrada. Para textos muy largos, puede ser necesario segmentar la entrada.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero el modelo puede estar sujeto a patentes de terceros (por ejemplo, en tecnicas de clonacion de voz). Se recomienda revision legal antes de uso comercial.
- Caveats de produccion: la clonacion de voz puede usarse para suplantacion de identidad. Se recomienda implementar mecanismos de autenticacion y consentimiento. El modelo no incluye marcas de agua de audio, por lo que la trazabilidad del contenido generado es limitada.
- Dependencias: el pipeline completo requiere modulos adicionales como ttsfrd (normalizacion de texto) y un vocoder, que no estan incluidos en el repositorio del modelo. La instalacion puede ser compleja en entornos sin acceso a los mirrors de Alibaba.

## Enlaces

- Repositorio en HuggingFace (original): https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Repositorio en HuggingFace (copia de mod1155): https://huggingface.co/mod1155/Fun-CosyVoice3-0.5B-2512
- Paper de CosyVoice 3.0: https://arxiv.org/abs/2505.17589
- Paper de CosyVoice 2.0: https://arxiv.org/abs/2412.10117
- Paper de CosyVoice 1.0: https://arxiv.org/abs/2407.05407
- Pagina de demos: https://funaudiollm.github.io/cosyvoice3/
- ModelScope: https://www.modelscope.cn/models/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Repositorio de codigo (CosyVoice): https://github.com/FunAudioLLM/CosyVoice
- Conjunto de evaluacion CV3-Eval: https://github.com/FunAudioLLM/CV3-Eval
