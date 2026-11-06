# maaaaat/parakeet-ultra-onnx

## Resumen

Parakeet Ultra en ONNX es una conversión del modelo de reconocimiento automático del habla Parakeet Ultra de Moondream, a su vez un post-entrenamiento del modelo Parakeet TDT 0.6B v3 de NVIDIA, exportado al formato ONNX con el layout que espera la librería onnx-asr. El paquete incluye el encoder en cuatro precisiones distintas (float32, float16, bfloat16 e int8 por bloques) y el decoder-joint correspondiente, de modo que el mismo modelo se puede servir tanto en CPU como en GPU con distintos compromisos entre tamaño y precisión numérica.

El modelo resuelve el problema de la transcripción de voz a texto multilingüe: declara soporte para 25 idiomas europeos (entre ellos español, inglés, francés, alemán, italiano, portugués, neerlandés, polaco, ruso y ucraniano) y emplea una arquitectura NeMo Conformer con decodificación TDT (Token-and-Duration Transducer), que predice conjuntamente tokens y duraciones para acelerar la decodificación sin sacrificar calidad. El tamaño del repo es de 5,7 GB, pero cada variante individual ocupa entre 0,76 GB (int8) y 2,55 GB (float32).

La relevancia de esta ficha es práctica: al estar en ONNX, el modelo se puede desplegar sin el stack pesado de NeMo, usando únicamente ONNX Runtime, lo que simplifica la integración en servicios de transcripción, subtitulado o asistentes de voz. Las tasas de error publicadas en FLEURS (en torno al 4,8-4,9 % en francés e inglés) se mantienen prácticamente idénticas entre las cuatro variantes, lo que hace de la int8 una opción atractiva para despliegues con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer con decodificacion TDT (Token-and-Duration Transducer) |
| Parametros totales | aproximadamente 0,6 mil millones (hereda la configuracion de Parakeet TDT 0.6B v3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, procesa audio por segmentos) |
| Tipos de cuantizacion | float32, float16, bfloat16, int8 (bloques de 64 pesos simetricos) |
| Idiomas soportados | 25: en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (encoder-model.onnx, decoder_joint-model.onnx y variantes fp16, bf16, int8) |

## Arquitectura y entrenamiento

El modelo es un transducer TDT sobre un encoder Conformer, la misma arquitectura que Parakeet TDT 0.6B v3 de NVIDIA. El encoder procesa el audio en bruto y el decoder-joint combina la representacion acustica con los tokens ya emitidos para predecir, en cada paso, tanto el siguiente token como su duracion. Esta prediccion conjunta de duracion es la innovacion clave del TDT: permite avanzar varios frames de audio por paso de decodificacion, reduciendo el coste computacional frente a un transducer clasico.

El entrenamiento original corresponde a Parakeet TDT 0.6B v3 de NVIDIA; Moondream realizo un post-entrenamiento sobre esa base para producir Parakeet Ultra. La model card de esta conversion no detalla el volumen de tokens de audio, la composicion del dataset ni si hubo etapas de RLHF o DPO, por lo que esos datos deben considerarse no disponibles en esta ficha. La conversion a ONNX se hizo reconstruyendo el modelo en NeMo a partir de la configuracion de Parakeet TDT 0.6B v3 y cargando los pesos de Parakeet Ultra, verificando la paridad del encoder exportado contra NeMo en las primeras 20 locuciones de FLEURS frances. La cabeza de deteccion de actividad de voz (VAD) que usa el runtime propio de Moondream no se exporto.

## Capacidades

- Transcripcion de voz a texto (ASR) en 25 idiomas europeos declarados.
- Decodificacion TDT con prediccion conjunta de token y duracion, lo que acelera la inferencia.
- Ejecucion en CPU y GPU mediante ONNX Runtime, sin dependencia del stack NeMo en tiempo de inferencia.
- Cuatro variantes de precision que permiten ajustar el equilibrio entre tamano, velocidad y fidelidad numerica.
- Integracion directa con la libreria onnx-asr, que carga el directorio como un modelo NeMo TDT.
- No incluye cabeza de VAD: la segmentacion de grabaciones largas debe hacerse externamente.
- No se documentan capacidades de diarizacion, traduccion, tool calling ni agentes; es un modelo puramente ASR.

## Casos de uso

- Subtitulado automatico de video: el modelo transcribe audio en 25 idiomas y la variante int8 (0,76 GB) permite ejecutarlo en servidores modestos o incluso en equipos de desarrollo, generando subtitulos con tasas de error en torno al 4,8-4,9 % en FLEURS para frances e ingles.
- Atencion al cliente con voz: integrado en un pipeline de telefonia o VoIP, transcribe las llamadas en tiempo real o en diferido para alimentar analitica, busqueda de transcripciones y control de calidad, usando ONNX Runtime en CPU para reducir costes de infraestructura.
- Dictado y notas de reunion: la variante float16 o bfloat16 (1,31 GB) en GPU ofrece latencia baja para transcripcion casi en vivo de reuniones multilingues en empresas con equipos en distintos paises europeos.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de grandes volumenes de grabaciones (podcasts, entrevistas, archivos historicos) con la variante int8 para maximizar el throughput por nodo y habilitar busqueda semantica sobre el texto resultante.
- Accesibilidad: generacion de subtitulos para personas con discapacidad auditiva en aplicaciones de streaming o plataformas educativas, aprovechando el soporte de 25 idiomas para cubrir audiencias europeas sin multiples modelos.
- Asistentes de voz embebidos: al estar en ONNX y con una variante de 0,76 GB, puede desplegarse en dispositivos con recursos acotados o en el borde de la red para comandos de voz y transcripcion local, evitando enviar audio a la nube.
- Analisis de conformidad y auditoria: transcripcion de grabaciones de centros de llamadas para detectar menciones de riesgo, verificar guiones y auditar cumplimiento normativo, con la variante float32 como referencia de maxima fidelidad.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos sobre los conjuntos de test de FLEURS sin los tokens desconocidos que el vocabulario no puede escribir. Las tasas son de word error rate (WER).

| Variante | Dispositivo | Tamano | fr_fr | en_us |
|---|---|---|---|---|
| float32 | CPU, GPU | 2,55 GB | 4,84 % | 4,88 % |
| float16 | GPU | 1,31 GB | 4,85 % | 4,89 % |
| bfloat16 | GPU | 1,31 GB | 4,83 % | 4,89 % |
| int8 | CPU, GPU | 0,76 GB | 4,86 % | 4,94 % |

Las comparaciones de paridad publicadas indican diferencias de +0,00 puntos frente al modelo original en NeMo para float32 en CPU, +0,01 puntos para float16 en GPU frente a float32, -0,01 puntos en fr_fr y +0,01 en en_us para bfloat16, y +0,02 puntos en fr_fr y +0,06 en en_us para int8 en CPU frente a float32. El resto de los 25 idiomas declarados no tiene medicion publicada en esta conversion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB para la variante float32, 1,3 GB para float16 y bfloat16, y 0,8 GB para int8 (el tamano de los ficheros es una cota superior razonable de la memoria necesaria).
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM; las variantes float16 y bfloat16 estan pensadas para GPU, mientras que float32 e int8 se han validado tanto en CPU como en GPU.
- Cabe en GPU de consumo: si, practicamente cualquier GPU de consumo actual (por ejemplo RTX 3060, RTX 4060, RTX 4090) puede ejecutar las variantes float16, bfloat16 e int8; la variante float32 tambien cabe en GPUs con 4 GB o mas.
- Opciones de despliegue: onnx-asr 0.12.0 con onnxruntime 1.31.0 en CPU y onnxruntime-gpu 1.31.0 en GPU. No se documentan otras opciones de despliegue en la informacion disponible.
- Latencia y throughput: no se publican cifras de latencia ni de throughput en la model card; solo se indica que las tasas se midieron con las versiones de onnx-asr y onnxruntime citadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Parakeet Ultra ONNX (esta ficha) | ~0,6 B | no disponible | 25 | CC BY 4.0 | ONNX (fp32, fp16, bf16, int8) |
| NVIDIA Parakeet TDT 0.6B v3 | ~0,6 B | no disponible | 25 (segun la model card de esta conversion) | no disponible en la informacion proporcionada | NeMo |
| Moondream Parakeet Ultra | ~0,6 B | no disponible | no disponible en la informacion proporcionada | CC BY 4.0 | pesos originales de Moondream |

La comparativa se limita a los modelos citados en la documentacion de esta conversion; no se dispone de datos de benchmarks de terceros para contrastar WER ni latencia frente a otros sistemas ASR.

## Limitaciones y advertencias

- Solo se midieron frances e ingles sobre FLEURS; los otros 23 idiomas declarados provienen de Parakeet TDT 0.6B v3 y no se han medido en esta conversion.
- La cabeza de deteccion de actividad de voz de Moondream no se exporto, por lo que las grabaciones largas deben segmentarse externamente antes de transcribir.
- El WER en torno al 4,8-4,9 % en FLEURS implica que la transcripcion no es perfecta; en dominios con jerga, ruido o acentos marcados el error puede ser mayor.
- La variante int8 en CPU muestra un ligero empeoramiento en ingles (+0,06 puntos frente a float32), aceptable pero perceptible en comparaciones finas.
- En CPU, ONNX Runtime vuelve a calcular en float32 la mayor parte de las variantes float16 y bfloat16, por lo que esas variantes solo aportan ventaja real en GPU.
- La licencia CC BY 4.0 permite uso comercial con atribucion; es necesario citar a Moondream, NVIDIA y el autor de la conversion segun la tabla de atribucion de la model card.
- No se documentan sesgos especificos, riesgos de alucinacion ni limitaciones de contexto mas alla de las anteriores; el modelo es puramente ASR y no genera texto libre.
- El repo no registra descargas ni likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion por parte de la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/maaaaat/parakeet-ultra-onnx)
- [Modelo base: moondream/parakeet-ultra](https://huggingface.co/moondream/parakeet-ultra/tree/73175eb7aeb0d82f1e2a6b53b3aabc10a90bcd0b)
- [Modelo origen: nvidia/parakeet-tdt-0.6b-v3](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3/tree/541d1f99c6b0c3cd0b11a95167540bb8edefd82b)
- [Dataset FLEURS](https://huggingface.co/datasets/google/fleurs/tree/70bb2e84b976b7e960aa89f1c648e09c59f894dd)
- [Codigo de la conversion: mostt-model-builder](https://github.com/madmatah/mostt-model-builder/tree/202eb642e06565a0fa9df2c767266bc477e612e0)
- [Licencia CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
