# Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v1-onnx

## Resumen

`parakeet-tdt-0.6b-v3-ultra-UltiMed-v1-onnx` es un ajuste fino en frances medico del modelo de reconocimiento automatico del habla (ASR) `moondream/parakeet-ultra`, que a su vez es un post-entrenamiento en precision completa de `nvidia/parakeet-tdt-0.6b-v3`. Lo desarrolla el autor independiente Olicorne dentro del proyecto UltiMed, cuyo objetivo es cubrir el dictado clinico en frances, un dominio donde los modelos ASR genericos fallan de forma sistematica con terminologia farmacologica y anatomica.

El modelo parte de una arquitectura NeMo Conformer con decodificacion TDT (Token-and-Duration Transducer) y aproximadamente 0,6 mil millones de parametros. Se ha ajustado sobre el dataset `Olicorne/UltiMed-ASR-FR-v1`, con mas de 3.000 horas de dictado medico frances, y se distribuye exclusivamente en formato ONNX con varias precisiones de encoder en el mismo repositorio, pensado para inferencia en navegador y en CPU.

Su relevancia actual es doble: por un lado, demuestra que un ajuste fino pequeno y focalizado sobre un ASR generalista reduce el CER en dominios especializados de forma sustancial (de 4,9 % a 2,3 % en el test de voz real del autor); por otro, su empaquetado ONNX permite transcripcion completamente local y client-side, sin enviar audio a servidores, algo critico en el ambito sanitario por motivos de confidencialidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | aproximadamente 0,6 mil millones (heredados de parakeet-tdt-0.6b-v3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio; se documenta una pasada unica de 10 minutos sobre VoxPopuli frances) |
| Tipos de cuantizacion | varias precisiones del encoder en carpetas separadas (fp32, entre otras; el repositorio incluye el encoder fp32 dividido en dos shards) |
| Idiomas soportados | frances (fr); el modelo base es multilingue y se documenta retencion multilingue en FLEURS |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (exportado para `onnx-asr` y la app Parakeet Web) |

## Arquitectura y entrenamiento

El modelo es un Conformer encoder con decodificador TDT, la misma arquitectura que `nvidia/parakeet-tdt-0.6b-v3`. El decodificador TDT predice conjuntamente tokens y duraciones, lo que permite emitir varios tokens por paso de decodificacion y reduce la latencia frente a transductores clasicos. El ajuste fino parte de la reconstruccion NeMo de los pesos de `moondream/parakeet-ultra` publicada en `Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx`, no directamente del checkpoint original de moondream.

El entrenamiento se realizo sobre `Olicorne/UltiMed-ASR-FR-v1`, un corpus de mas de 3.000 horas de dictado medico frances, con conjuntos de evaluacion especificos: diccionario medico (5.285 clips), parrafos de informes hospitalarios PARHAF (2.498 clips) y nombres de farmacos (2.059 clips). La model card no detalla el numero exacto de tokens de audio ni la composicion completa del dataset, ni si se aplico RLHF o DPO (poco habitual en ASR). Como complemento al modelo, el autor publica reglas de correccion post-decodificacion (regex fixes) para nombres de farmacos y terminos medicos, aplicables como sustitucion de texto tras el decodificado y utiles tambien para modelos no ajustados.

## Capacidades

- Transcripcion de voz a texto en frances, con especial precision en vocabulario medico, farmacologico y de informes clinicos.
- Decodificacion greedy y beam search (beam 5 con MAES documentado en los benchmarks).
- Phrase boosting para sesgar el decodificado hacia terminos concretos (farmacos, nombres propios clinicos).
- Procesamiento de audio largo en una sola pasada: se documenta una transcripcion de 10 minutos sobre VoxPopuli frances.
- Inferencia en navegador y en CPU mediante ONNX, sin dependencia de GPU ni de servicios externos.
- Retencion parcial de capacidades multilingues del modelo base, evaluada en FLEURS.
- Integracion con `onnx-asr` y con la aplicacion Parakeet Web.
- No soporta tool calling, function calling, agentes ni generacion de texto: es un modelo puramente ASR.

## Casos de uso

- Dictado clinico en consulta: el medico dicta directamente y el modelo transcribe con terminologia farmacologica correcta, reduciendo el CER de 4,9 % a 2,3 % frente al modelo base en el test de voz real del autor.
- Redaccion de informes hospitalarios: el ajuste sobre parrafos PARHAF permite transcribir secciones de informe con estructura y vocabulario administrativo-sanitario, reduciendo correcciones manuales posteriores.
- Transcripcion local y conforme a privacidad: al ejecutarse en ONNX sobre CPU o en navegador via Parakeet Web, el audio no sale del dispositivo, lo que facilita el cumplimiento de requisitos de confidencialidad de datos de salud.
- Post-procesado con reglas regex: combinado con las fix rules del repositorio, corrige nombres de farmacos y terminos medicos residuales con coste practicamente nulo tras el decodificado.
- Investigacion en ASR medico: sirve como linea base ajustada y como punto de comparacion reproducible sobre el dataset UltiMed-ASR-FR-v1, con conjuntos de evaluacion publicos.
- Despliegue en entornos sin GPU: al disponer de encoder en fp32 y otras precisiones en ONNX, puede ejecutarse en portatiles y estaciones de trabajo sin acelerador dedicado.
- Evaluacion de retencion multilingue: util para estudiar cuanto conocimiento multilingue del modelo base se conserva tras el ajuste monoingue, mediante FLEURS.

## Benchmarks y rendimiento

Tasas de error sobre conjuntos de evaluacion de frances medico no vistos en entrenamiento (la model card solo detalla el desglose completo para el conjunto de diccionario; el resto de cifras aparece truncado en la informacion disponible):

| Conjunto | Clips | Descripcion |
|---|---|---|
| dictionary | 5.285 | split de test de UltiMed-ASR-FR-v1, terminos de diccionario medico en frases de dictado |
| parhaf | 2.498 | split de test, parrafos de informes hospitalarios PARHAF |
| drugs | 2.059 | terminos farmacologicos (descripcion truncada) |

Resultados en el test de voz real del autor (10 dictados medicos densos, 15 grabaciones, 5 textos leidos dos veces; CER normalizado, beam 5):

| Configuracion | CER |
|---|---|
| Modelo base (parakeet-ultra) | 4,9 % |
| Este ajuste fino (UltiMed v1) | 2,3 % |
| Este ajuste fino + phrase boosting + reglas de correccion | 1,9 % |

La model card indica ademas secciones de benchmarks para decodificacion greedy, beam 5 (MAES), retencion multilingue (FLEURS) y audio largo (VoxPopuli frances, 10 minutos en una pasada), pero los valores numericos de esas secciones no estan incluidos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con aproximadamente 0,6 mil millones de parametros, el encoder en fp32 ocupa del orden de 2-3 GB, y las precisiones reducidas reducen esa cifra proporcionalmente.
- GPU recomendadas: no se especifican en la model card; el modelo esta disenado para CPU y navegador, por lo que no requiere GPU.
- Cabe en GPU de consumo: si, cualquier GPU con suficiente memoria para la precision elegida; el objetivo declarado es inferencia en CPU y client-side.
- Opciones de despliegue: `onnx-asr` (objetivo principal del export), Parakeet Web (aplicacion de navegador del autor) y cualquier runtime ONNX compatible.
- Latencia y throughput: no disponibles como cifras; se documenta que el decodificador TDT emite varios tokens por paso y que es posible transcribir 10 minutos de audio en una sola pasada.
- Nota: el autor entrena en una unica GPU de consumo y solicita una RTX 5090 para acelerar las siguientes versiones, lo que da idea del perfil de hardware usado en el desarrollo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (UltiMed v1 ONNX) | ~0,6 B | fr | ONNX | CC-BY-4.0 | Ajuste medico frances, inferencia en CPU/navegador |
| `nvidia/parakeet-tdt-0.6b-v3` | ~0,6 B | multilingue | NeMo | no disponible en la informacion | Modelo base original de NVIDIA |
| `moondream/parakeet-ultra` | ~0,6 B | multilingue | no disponible | no disponible en la informacion | Post-entrenamiento en precision completa del anterior; base directa de este ajuste |
| `Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v2-onnx` | ~0,6 B | fr | ONNX | CC-BY-4.0 | Version experimental; el autor indica que rinde peor que v1 en dictado humano real |

La comparativa con ASR comerciales o de mayor tamano (Whisper large-v3, etc.) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo monoingue: solo frances; el uso en otros idiomas degrada el rendimiento aunque el modelo base sea multilingue.
- Especializado en dominio medico: puede comportarse peor en conversacion general o audio ruidoso no clinico que un ASR generalista.
- Riesgo de errores en terminos criticos: la model card documenta confusiones como "venlafaxine" transcrito como "devant l'acces"; en contexto clinico un error de este tipo puede tener consecuencias, por lo que se recomienda revision humana.
- La version v2, mas reciente, rinde peor en dictado real segun el autor; conviene no asumir que la ultima version es la mejor.
- Las reglas de correccion regex son un parche post-decodificado y no eliminan todos los errores.
- Sesgos y cobertura: no se detalla en la informacion disponible la composicion demografica del dataset ni posibles sesgos por acento, edad o sexo de los hablantes.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; es necesario citar al autor y respetar los terminos de los modelos base (NVIDIA y moondream), cuyas licencias no se detallan en la informacion disponible.
- El repositorio pesa 36,9 GB por incluir varias precisiones; conviene descargar solo la carpeta de la precision necesaria.
- Proyecto autofinanciado por un unico autor: menor garantia de mantenimiento a largo plazo que un modelo corporativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v1-onnx
- Modelo base (moondream): https://huggingface.co/moondream/parakeet-ultra
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Reconstruccion NeMo en ONNX: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx
- Version v2 (experimental): https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v2-onnx
- Dataset UltiMed-ASR-FR-v1: https://huggingface.co/datasets/Olicorne/UltiMed-ASR-FR-v1
- Dataset UltiMed-ASR-FR-v2: https://huggingface.co/datasets/Olicorne/UltiMed-ASR-FR-v2
- Reglas de correccion regex v2: https://github.com/UltiMed-Org/UltiMed-ASR-FR-v2-regex-fixes
- Organizacion UltiMed: https://github.com/UltiMed-Org
- Test de voz real: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v1-onnx/blob/main/REAL_VOICE_STRESS_TEST.md
- App Parakeet Web: https://parakeetweb.olicorne.org/
- Codigo de Parakeet Web: https://github.com/thiswillbeyourgithub/parakeet_web
- onnx-asr: https://github.com/istupakov/onnx-asr
- Sitio del autor: https://olicorne.org
