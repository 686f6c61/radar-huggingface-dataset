# Sherifelshamaa/almaqraah-follow-model

## Resumen

almaqraah-follow-model es un modelo de reconocimiento automatico del habla (ASR) especializado en recitacion del Coran en arabe, empaquetado en formato ggml para whisper.cpp. No es un modelo entrenado desde cero: se trata de una conversion de formato y cuantizacion a 8 bits (q8_0) de los pesos de tarteel-ai/whisper-tiny-ar-quran, un fine-tune de openai/whisper-tiny realizado por Tarteel AI sobre recitacion coranica. El autor, Sherifelshamaa, lo publica como componente del modo «متابعة فقط» (solo seguimiento) de la aplicacion Al-Maqraah, que escucha la recitacion del usuario en el telefono y desplaza la posicion de lectura en el mushaf sin enviar audio a ningun servidor.

La relevancia del modelo es practica y acotada: demuestra un flujo de despliegue on-device de ASR arabe con un artefacto de apenas 43,5 MB, viable en moviles mediante whisper.rn y sin dependencia de infraestructura en la nube. La arquitectura subyacente es la de Whisper tiny (transformer encoder-decoder), con aproximadamente 39 millones de parametros y una ventana de contexto de audio de 30 segundos, heredada integramente del modelo base.

Conviene subrayar que no hay entrenamiento ni ajuste adicional por parte del autor de esta ficha: el valor anadido reside en la conversion a ggml y la cuantizacion q8_0, con la verificacion de que la transcripcion de un pasaje coranico concreto (An-Nas, 114:1-6) se mantiene exacta tras la compresion. El repositorio no incluye pesos en safetensors ni documentacion sobre datos de entrenamiento propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | ~39 millones (heredados de whisper-tiny) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | ventana de audio de 30 s (estandar Whisper) |
| Tipos de cuantizacion | q8_0 (unico artefacto publicado) |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache-2.0 |
| Formato de pesos | ggml binario para whisper.cpp (`ggml-tiny-ar-quran-q8_0.bin`, 43.537.433 bytes) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper tiny de OpenAI: un encoder-decoder transformer con atención completa, orientado a transcripcion de audio de hasta 30 segundos por ventana. El modelo base tarteel-ai/whisper-tiny-ar-quran fue ajustado por Tarteel AI sobre openai/whisper-tiny con datos de recitacion coranica en arabe; la model card no detalla el volumen de tokens de audio, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO, por lo que esos datos deben considerarse no disponibles.

La intervencion del autor de este repositorio se limita a la conversion de formato y la cuantizacion. Segun la model card, el proceso fue: clonar whisper.cpp (commit 092fa10992dec2a91680591697c857b566db7150) y openai/whisper, descargar tarteel-ai/whisper-tiny-ar-quran en la revision c3d7e624af5c81bef25a10a2af3a5a84cb4dd0f0, ejecutar `convert-h5-to-ggml.py` para obtener un binario f16/f32 y aplicar `whisper-quantize` con tipo q8_0. No hay cambios en los pesos mas alla de la precision numerica. La revision concreta del modelo base y el hash SHA-256 del artefacto (`ef01ab441b004f9e6f1ea98d397b43452b3a45efab7c3928ab37af655dde8b52`) estan documentados, lo que permite reproducibilidad completa.

## Capacidades

- Transcripcion de audio en arabe (tarea `transcribe`, no `translate`), con salida que preserva harakat segun la verificacion incluida en la model card.
- Reconocimiento de recitacion coranica especificamente, gracias al ajuste del modelo base sobre ese dominio.
- Ejecucion on-device en moviles mediante whisper.rn y en escritorio mediante whisper.cpp.
- Inferencia en CPU: la model card reporta ~0,6-0,8 s por aya en 2 hilos de CPU x86.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo ASR puro.
- No dispone de modo thinking, vision ni audio mas alla de la propia entrada de voz.
- Capacidad multilingue limitada al arabe; no se documenta soporte de otros idiomas.

## Casos de uso

- Seguimiento de recitacion en aplicacion movil: el modelo escucha al usuario recitar y la app desplaza el cursor en el mushaf. Es el caso para el que fue creado, y su tamano de 43,5 MB y su ejecucion en CPU lo hacen adecuado para moviles de gama media sin GPU dedicada.
- Aplicaciones educativas de memorizacion del Coran: permite verificar en tiempo real que el alumno sigue el pasaje correcto, con el audio procesado localmente y sin salir del dispositivo.
- Herramientas de lectura asistida sin conexion: al no requerir red, el modelo sirve en entornos con conectividad limitada o donde la privacidad del audio es un requisito estricto.
- Transcripcion de recitaciones grabadas: procesamiento por lotes de audios cortos (hasta 30 s por ventana) para generar transcripciones con harakat en pipelines de archivo.
- Prototipado de ASR arabe especializado: util como baseline ligero para comparar tecnicas de cuantizacion o de despliegue en whisper.cpp antes de invertir en modelos mayores.
- Integracion en apps de escritorio con whisper.cpp: un binario de 43 MB permite embeber ASR coranico en herramientas de escritorio sin dependencias de Python ni de GPU.
- Verificacion de calidad de conversiones: el hash SHA-256 y la revision fijada del modelo base permiten usarlo como referencia reproducible en pruebas de regresion de pipelines de conversion a ggml.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica medida de rendimiento documentada es operativa: en la prueba con An-Nas (114:1-6, audio de everyayah.com, recitador Saood ash-Shuraym), las seis ayas se transcribieron exactamente con harakat, a ~0,6-0,8 s por aya con 2 hilos de CPU x86 usando whisper-cli.

## Requisitos de hardware

- VRAM: no requiere GPU; el artefacto q8_0 ocupa 43,5 MB en disco y su huella en memoria es del orden de decenas de MB, apta para dispositivos moviles.
- GPU recomendadas: no aplica; el modelo esta pensado para CPU. Cualquier GPU moderna podria ejecutarlo, pero no aporta ventaja significativa frente a CPU para este tamano.
- Compatibilidad con GPU de consumo: si, irrelevante en la practica; cabe en cualquier dispositivo con unos pocos cientos de MB de RAM libre.
- Opciones de despliegue: whisper.cpp (whisper-cli), whisper.rn en React Native, y cualquier binding de whisper.cpp para movil o escritorio.
- Latencia y throughput: ~0,6-0,8 s por aya con 2 hilos de CPU x86 en la prueba documentada; el rendimiento en moviles no se especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| almaqraah-follow-model | ~39 M | 30 s | ar | Apache-2.0 | ggml q8_0 |
| tarteel-ai/whisper-tiny-ar-quran | ~39 M | 30 s | ar | Apache-2.0 (segun modelo origen) | safetensors/H5 |
| openai/whisper-tiny | ~39 M | 30 s | multilingue | MIT | safetensors, ggml |
| openai/whisper-base | ~74 M | 30 s | multilingue | MIT | safetensors, ggml |

La comparativa se limita a parametros, contexto y licencia: no hay datos publicados de WER ni de otros benchmarks en la informacion disponible que permitan comparar calidad entre estas alternativas para recitacion coranica.

## Limitaciones y advertencias

- Modelo de dominio muy estrecho: ajustado para recitacion coranica; su comportamiento fuera de ese registro (arabe coloquial, dialectos, ruido de fondo) no esta documentado y probablemente degrade.
- Ventana de audio de 30 s por inferencia, heredada de Whisper tiny; pasajes mas largos requieren segmentacion.
- Solo transcribe, no traduce; el parametro de idioma debe fijarse a `ar`.
- Riesgo de alucinacion inherente a los modelos Whisper, especialmente con audio ruidoso o silencios; en un contexto religioso, un error de transcripcion puede tener consecuencias sensibles.
- No hay informacion sobre sesgos especificos ni sobre la composicion del dataset de entrenamiento del modelo base.
- La licencia Apache-2.0 se hereda del modelo origen; la titularidad de los pesos permanece en Tarteel AI y OpenAI segun la model card, y conviene verificar las condiciones del modelo base antes de un uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros ni validacion externa de la calidad.
- El autor no publica pesos en safetensors ni el script exacto de la app; la integracion depende de la API de whisper.cpp/whisper.rn.

## Enlaces

- Hugging Face: https://huggingface.co/Sherifelshamaa/almaqraah-follow-model
- Modelo base: https://huggingface.co/tarteel-ai/whisper-tiny-ar-quran
- Modelo origen de OpenAI: https://huggingface.co/openai/whisper-tiny
- Repositorio whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Repositorio openai/whisper: https://github.com/openai/whisper
- Binding para React Native: https://github.com/mybigday/whisper.rn
- Fuente de audio de la prueba: https://everyayah.com
