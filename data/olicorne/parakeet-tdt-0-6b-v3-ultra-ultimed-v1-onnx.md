# Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v1-onnx

## Resumen

parakeet-tdt-0.6b-v3-ultra-UltiMed-v1-onnx es un ajuste fino de reconocimiento automatico del habla (ASR) especializado en dictado medico en frances, desarrollado por el autor independiente Olicorne. Parte de `moondream/parakeet-ultra`, el post-entrenamiento en precision completa de `nvidia/parakeet-tdt-0.6b-v3` publicado por moondream, y se ha afinado sobre el dataset propio UltiMed-ASR-FR-v1 (mas de 3.000 horas de dictado medico frances). El resultado se exporta a ONNX con varias precisiones del encoder en un mismo repositorio, pensado para inferencia en navegador y en CPU.

La arquitectura es NeMo Conformer con decodificacion TDT (Token-and-Duration Transducer), con aproximadamente 0,6 mil millones de parametros. El modelo es monoidioma (frances) y esta orientado a terminologia medica: nombres de farmacos, dosis, acronimos y vocabulario clinico. Su interes practico radica en que reduce errores tipicos del modelo base en ese dominio concreto, segun las cifras publicadas por el autor, y en que puede ejecutarse integramente en el cliente sin enviar audio a un servidor.

Esta version (v1) esta marcada como obsoleta por el propio autor, que recomienda la v2. Se mantiene por referencia. La licencia es CC-BY-4.0 y el repositorio ocupa 36,9 GB por incluir multiples precisiones del encoder.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | aproximadamente 0,6 mil millones (segun nombre del modelo y base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; se documenta una pasada unica de audio de 10 minutos (VoxPopuli frances) |
| Tipos de cuantizacion | varias precisiones del encoder en carpetas separadas (fp32 dividido en dos shards, entre otras); lista exacta no disponible |
| Idiomas soportados | frances (fr) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (compatible con onnx-asr y Parakeet Web) |

## Arquitectura y entrenamiento

El modelo es un Conformer de NeMo con decodificador TDT, la misma familia que `nvidia/parakeet-tdt-0.6b-v3`. El punto de partida del ajuste fino no son los pesos originales de NVIDIA, sino la reconstruccion en NeMo publicada por el propio autor en `Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx`, derivada del post-entrenamiento de moondream. Sobre esa base se entrena con el dataset UltiMed-ASR-FR-v1, compuesto por mas de 3.000 horas de dictado medico frances. El autor indica explicitamente que el entrenamiento se ejecuta en una unica GPU de consumo y que el proyecto es autofinanciado.

El resultado se exporta a ONNX para inferencia en CPU y navegador. Cada precision del encoder vive en su propia carpeta, con los nombres canonicos de onnx-asr; el encoder fp32 esta dividido en `encoder-model.onnx.data.000` y `.data.001`, que ONNX resuelve de forma relativa al fichero de grafo. El repositorio incluye ademas un conjunto de reglas de sustitucion de texto (`regex-fixes/`) para corregir nombres de farmacos y terminos medicos despues de la decodificacion, aplicables tambien a modelos no afinados. No se detallan en la informacion disponible los hiperparametros de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Transcripcion de voz a texto en frances, orientada a dictado medico.
- Reconocimiento de terminologia medica especializada: nombres de farmacos, dosis, acronimos y vocabulario clinico.
- Decodificacion con beam search (se reportan resultados con beam 5).
- Soporte de phrase boosting para sesgar la decodificacion hacia terminos concretos.
- Procesamiento de audio largo en una sola pasada (se documenta una pasada de 10 minutos sobre VoxPopuli frances).
- Ejecucion en navegador y CPU mediante ONNX, con procesamiento integramente en el cliente.
- Reglas post-decodificacion (regex-fixes) para corregir terminos medicos.
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Dictado clinico en consulta: el modelo transcribe directamente el dictado del facultativo en frances, con cobertura de farmacos y dosis gracias al ajuste sobre UltiMed-ASR-FR-v1, reduciendo la correccion manual posterior.
- Generacion de informes radiologicos: el conjunto de evaluacion PARROT (informes de radiologia) forma parte de las pruebas del autor, lo que indica que el modelo esta pensado para este tipo de texto denso y formulaico.
- Transcripcion de informes hospitalarios: el conjunto parhaf (parrafos de informes hospitalarios) se usa como evaluacion, lo que refleja el objetivo de transcribir lenguaje clinico formal y no solo dictado aislado.
- Aplicacion web de dictado con privacidad: desplegado con onnx-asr o Parakeet Web, el modelo descarga los ficheros ONNX y transcribe en el navegador, de modo que el audio no sale del equipo del profesional, algo relevante para datos de salud.
- Normalizacion de acronimos y abreviaturas medicas: el modelo y las reglas regex asociadas estan orientados a resolver acronimos clinicos, utiles en pipelines de digitalizacion de historiales.
- Post-procesado en pipelines de terceros: las reglas de `regex-fixes/` pueden aplicarse sobre la salida de otros sistemas ASR para corregir nombres de farmacos a coste casi nulo.
- Evaluacion y entrenamiento de modelos ASR: el dataset UltiMed-ASR-FR-v1 y los conjuntos de test (dictionary, parhaf, drugs, acronyms, drug_sentence, parrot) sirven como referencia para medir ASR medico en frances.

## Benchmarks y rendimiento

Tasas de error de palabra y caracter sobre conjuntos de evaluacion medico-franceses no vistos en entrenamiento (11.747 clips en total). La informacion disponible solo incluye las cifras agregadas del test de estres con voz real; las tablas detalladas por conjunto no se han proporcionado.

| Conjunto | Clips | Descripcion |
|---|---|---|
| dictionary | 5.285 | split de test de UltiMed-ASR-FR-v1, terminos de diccionario medico en frases de dictado |
| parhaf | 2.498 | split de test, parrafos de informes hospitalarios PARHAF |
| drugs | 2.059 | split de test, nombres de farmacos y dosis (completo) |
| acronyms | 151 | split de test, acronimos medicos (completo) |
| drug_sentence | 205 | conjunto separado de frases con farmacos y dosis, split de validacion (ligeramente optimista) |
| parrot | 1.549 | subconjunto frances completo de PARROT, informes de radiologia, solo evaluacion |

| Medicion | Base (parakeet-ultra) | Este ajuste | Con phrase boosting y reglas |
|---|---|---|---|
| CER normalizado, beam 5, test de estres con voz real (15 grabaciones telefonicas, 10 dictados medicos densos) | 4,9 % | 2,3 % | 1,9 % |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, ya que el modelo es exclusivamente ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con aproximadamente 0,6 mil millones de parametros, la inferencia en fp32 requiere del orden de unos pocos GB, y las precisiones reducidas del encoder bajan el requisito. El repositorio completo ocupa 36,9 GB por almacenar varias precisiones, no por necesitarlas todas en memoria.
- GPU recomendadas: no disponibles en la informacion; el modelo esta exportado para CPU y navegador, por lo que no depende de GPU.
- Cabe en GPU de consumo: si, por tamano, aunque no se detallan modelos concretos ni cifras de VRAM por precision.
- Opciones de despliegue: onnx-asr y Parakeet Web (aplicacion web del autor); el formato ONNX permite otros runtimes de ONNX, aunque no se documentan en la informacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (UltiMed v1 ONNX) | aproximadamente 0,6 B | pasada de 10 min documentada | fr | CC-BY-4.0 | Ajuste medico frances, ONNX, obsoleto frente a v2 |
| moondream/parakeet-ultra (base) | aproximadamente 0,6 B | no disponible | multilingue (se evalua retencion en FLEURS) | no disponible en la informacion | Modelo base del ajuste; CER 4,9 % en el test de voz real |
| Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v2-onnx | no disponible | no disponible | fr | no disponible en la informacion | Version recomendada por el autor en lugar de esta v1 |
| nvidia/parakeet-tdt-0.6b-v3 | aproximadamente 0,6 B | no disponible | multilingue | no disponible en la informacion | Modelo original de NVIDIA del que deriva la familia |

## Limitaciones y advertencias

- Version obsoleta: el autor marca explicitamente esta v1 como obsoleta y recomienda la v2.
- Monoidioma: solo frances; no se debe esperar buen rendimiento en castellano ni en otros idiomas.
- Dominio restringido: el ajuste esta orientado a dictado medico; el rendimiento fuera de ese dominio no esta documentado.
- Riesgo de error en terminos criticos: a pesar del ajuste, persisten errores en nombres de farmacos y dosis, por lo que se recomienda validacion humana en contextos clinicos.
- El conjunto drug_sentence es de validacion y se observo durante el entrenamiento, por lo que sus cifras son ligeramente optimistas.
- Sesgos y cobertura: no se documentan analisis de sesgo por acento, edad, sexo o calidad de grabacion; la cobertura se limita al dataset UltiMed-ASR-FR-v1 y a los conjuntos de evaluacion citados.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; deben respetarse tambien las condiciones de los modelos base (`moondream/parakeet-ultra` y `nvidia/parakeet-tdt-0.6b-v3`), no detalladas en la informacion.
- Tamano del repositorio: 36,9 GB por incluir varias precisiones; conviene descargar solo la carpeta de la precision necesaria.
- Uso en produccion: al ser un proyecto autofinanciado en una unica GPU de consumo, la cadencia de mejoras y el soporte pueden ser limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v1-onnx
- Version recomendada (v2): https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v2-onnx
- Dataset UltiMed-ASR-FR-v1: https://huggingface.co/datasets/Olicorne/UltiMed-ASR-FR-v1
- Modelo base moondream/parakeet-ultra: https://huggingface.co/moondream/parakeet-ultra
- Modelo original NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Reconstruccion NeMo en ONNX: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx
- Reglas de correccion regex: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v1-onnx/tree/main/regex-fixes
- Test de estres con voz real: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v1-onnx/blob/main/REAL_VOICE_STRESS_TEST.md
- Aplicacion web Parakeet Web: https://parakeetweb.olicorne.org/
- Codigo de Parakeet Web: https://github.com/thiswillbeyourgithub/parakeet_web
- onnx-asr: https://github.com/istupakov/onnx-asr
- Organizacion UltiMed: https://github.com/UltiMed-Org
- Sitio del autor: https://olicorne.org
