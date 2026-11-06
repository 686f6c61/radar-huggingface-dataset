# Quiglee2/whisper-tiny_to_spanish_accent_09oct

## Resumen

Whisper tiny Spanish es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla `openai/whisper-tiny`, publicado por el usuario Quiglee2 en Hugging Face. El objetivo declarado es adaptar el modelo base a audio en ingles con acento espanol, segun se deduce del identificador del repositorio y del dataset de entrenamiento (`Spanish_english`). El modelo conserva la arquitectura encoder-decoder transformer propia de la familia Whisper y el mismo tokenizador multilingue del modelo original.

Se trata de un modelo de 37,76 millones de parametros, con pesos en formato safetensors y un repositorio de 0,3 GB. El autor declara un WER de 13,4421 sobre el split de test del dataset `Spanish_english`, obtenido tras 2000 pasos de entrenamiento con un learning rate de 1e-5. La model card esta generada automaticamente por el Trainer de Hugging Face y carece de secciones descriptivas completas, por lo que gran parte de la informacion sobre composicion del dataset, condiciones de grabacion y dominio de aplicacion no esta disponible.

La relevancia de este modelo es limitada y muy especifica: sirve como ejemplo de adaptacion de un modelo ASR ligero a una variante acentuada del ingles, y puede resultar util como punto de partida para experimentos de fine-tuning con presupuesto de computo minimo. No obstante, su tamano reducido, la falta de documentacion y un WER de dos digitos lo sitúan lejos de un uso en produccion sin validacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-tiny`, un transformer encoder-decoder con 37,76 millones de parametros disenado para transcripcion de audio de hasta 30 segundos por segmento, con representaciones Mel espectrograma como entrada. El ajuste fino se realizo sobre el dataset `Spanish_english`, cuya composicion, tamano y procedencia no se detallan en la model card. No se documenta el numero de tokens de audio ni las horas de entrenamiento.

Los hiperparametros declarados son: learning rate 1e-5, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con 500 pasos de warmup y 2000 pasos totales de entrenamiento. El entrenamiento se ejecuto con Transformers 5.22.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. No se menciona uso de RLHF, DPO ni tecnicas de decodificacion especulativa. La evolucion reportada muestra una loss de validacion de 0,3015 en el paso 1000 (WER 15,2123) y de 0,2951 en el paso 2000 (WER 13,4421), lo que indica una mejora marginal en la segunda mitad del entrenamiento.

## Capacidades

- Transcripcion de audio a texto en ingles, heredada del modelo base Whisper tiny.
- Adaptacion especifica a habla en ingles con acento espanol, segun el proposito declarado en el nombre del repositorio.
- Procesamiento de segmentos de audio de hasta 30 segundos, limitacion estructural de la arquitectura Whisper.
- Soporte de tareas ASR mediante el pipeline `automatic-speech-recognition` de Transformers.
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, agentes, vision, audio generativo ni modo de razonamiento explicito.
- Capacidad multilingue limitada: la model card declara unicamente `en`, aunque el modelo base original es multilingue.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles con hablantes de acento espanol: el modelo puede integrarse en un pipeline de ASR para convertir grabaciones cortas en texto, aprovechando el ajuste especifico sobre esta variante acentuada.
- Prototipado rapido de asistentes de voz: al ser un modelo de 37,76 millones de parametros, permite iterar en local con recursos minimos antes de escalar a modelos mayores.
- Preprocesamiento de audio para pipelines de NLP: transcripcion de entrevistas o podcasts en ingles acentuado como paso previo a analisis de sentimiento, resumen o indexacion.
- Fine-tuning adicional como base de partida: sirve como checkpoint inicial para adaptaciones a otros acentos o dominios con presupuesto de computo reducido.
- Educacion e investigacion: util para comparar el efecto del fine-tuning sobre un modelo ASR pequeno y para estudiar el impacto del acento en el WER.
- Subtitulado automatico de contenido audiovisual de baja latencia: el tamano reducido permite inferencia en CPU o GPU de gama baja para generar subtitulos aproximados que luego se revisan manualmente.
- Experimentos de destilacion o compresion: al ser un modelo ya compacto, puede emplearse como referencia en estudios de eficiencia de modelos ASR.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Dataset | Split | Metrica | Valor |
|---|---|---|---|
| Spanish English | test | WER | 13,4421 |
| Spanish English | validacion (paso 1000) | WER | 15,2123 |
| Spanish English | validacion (paso 2000) | WER | 13,4421 |
| Spanish English | validacion (paso 2000) | Loss | 0,2951 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (37,76 millones de parametros, aproximadamente 150 MB de pesos), y menos de 500 MB en fp16.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o en CPU.
- Cabe en GPU consumer: si, sin restricciones practicas de memoria.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de Transformers, endpoints de Hugging Face, y potencialmente exportacion a ONNX o uso con librerias de inferencia ligera (no documentado por el autor).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia muy baja en GPU y moderada en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Quiglee2/whisper-tiny_to_spanish_accent_09oct | 37,76 M | 30 s | 13,44 (dataset propio) | apache-2.0 | Hugging Face |
| openai/whisper-tiny | 37,76 M | 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face |
| openai/whisper-base | 74 M | 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face |
| openai/whisper-small | 244 M | 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face |

La comparacion cuantitativa con los modelos base de OpenAI no es posible con los datos proporcionados, ya que no se incluyen sus WER sobre el mismo dataset. Cualitativamente, este ajuste fino parte de `whisper-tiny` y anade una adaptacion a acento espanol, pero no se han publicado evaluaciones cruzadas que permitan afirmar una mejora frente al modelo original.

## Limitaciones y advertencias

- La model card esta generada automaticamente y no documenta composicion del dataset, condiciones de grabacion ni dominio de aplicacion, lo que impide evaluar la representatividad del WER declarado.
- El WER de 13,4421 es elevado para estandares de produccion y corresponde a un unico dataset no descrito; no hay validacion independiente.
- El modelo declara unicamente el idioma `en`, aunque el ajuste se orienta a acento espanol; no se garantiza un buen rendimiento en espanol real ni en otros acentos.
- Riesgo de alucinacion y de transcripciones incorrectas en audio con ruido, solapamiento de hablantes o vocabulario tecnico, comun en modelos Whisper de tamano pequeno.
- Limitacion estructural de 30 segundos por segmento de audio; requiere segmentacion previa para grabaciones largas.
- No se documentan sesgos especificos, pero al derivar de Whisper tiny hereda los sesgos del modelo base en cuanto a acentos, genero y variedades dialectales.
- Licencia apache-2.0 permite uso comercial, pero la falta de documentacion y el rendimiento limitado desaconsejan su uso en produccion sin evaluacion previa sobre datos propios.
- Solo 32 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validacion por parte de la comunidad.
- No se especifican tecnicas de cuantizacion ni formatos alternativos a safetensors, lo que puede limitar el despliegue en entornos con restricciones de memoria muy estrictas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Quiglee2/whisper-tiny_to_spanish_accent_09oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
