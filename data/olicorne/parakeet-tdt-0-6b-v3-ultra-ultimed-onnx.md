# Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-onnx

## Resumen

`parakeet-tdt-0.6b-v3-ultra-UltiMed-onnx` es un modelo de reconocimiento automático del habla (ASR) especializado en dictado médico en francés, publicado por Olicorne. Se trata de un fine-tune de `moondream/parakeet-ultra`, que a su vez es un post-entrenamiento en precisión completa de `nvidia/parakeet-tdt-0.6b-v3`, exportado a ONNX para inferencia en CPU y navegador. El modelo resuelve un problema concreto: la transcripción fiable de terminología médica francesa (nombres de fármacos, dosis, acrónimos y vocabulario de informes hospitalarios), terreno donde los ASR generalistas fallan sistemáticamente.

La arquitectura es NeMo Conformer con decodificación TDT (Token-and-Duration Transducer), con aproximadamente 0,6 mil millones de parámetros. El entrenamiento parte de los pesos reconstruidos en NeMo publicados en `Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx` y se ajusta sobre el dataset `Olicorne/UltiMed-ASR-FR-v1`, con más de 3.000 horas de dictado médico francés. El resultado se exporta en varias precisiones de encoder dentro del mismo repositorio, con el decoder en int8.

Es relevante ahora porque combina tres piezas poco habituales: un dataset médico francés de gran escala, un fine-tune sobre un ASR ya reforzado y un conjunto de reglas regex de corrección posterior al decodificado para nombres de fármacos. Además, el despliegue es totalmente local (cliente o CPU), lo que encaja con las restricciones de privacidad típicas del entorno sanitario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | aproximadamente 0,6 mil millones (0.6B, segun el nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio de hasta 10 minutos en una sola pasada segun el benchmark VoxPopuli) |
| Tipos de cuantizacion | varias precisiones de encoder en carpetas separadas (fp32, entre otras) y decoder int8 |
| Idiomas soportados | frances (fr); retencion multilingue evaluada con FLEURS |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (encoder dividido en `encoder-model.onnx.data.000` y `.data.001` en fp32) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `nvidia/parakeet-tdt-0.6b-v3`: un encoder Conformer (convoluciones + auto-atencion) y un decodificador TDT, que predice conjuntamente tokens y duraciones, lo que permite decodificacion no autorregresiva por bloques y reduce latencia frente a transducers clasicos. El fine-tune se realizo en NeMo partiendo de la reconstruccion de los pesos de `moondream/parakeet-ultra`, manteniendo arquitectura y tokenizer originales.

Los datos de entrenamiento proceden de `Olicorne/UltiMed-ASR-FR-v1`, con mas de 3.000 horas de dictado medico frances, organizado en splits tematicos (diccionario, parrafos de informes hospitalarios PARHAF, farmacos y dosis, acronimos). El autor documenta exclusiones deliberadas de datos y un procedimiento de entrenamiento en la model card, aunque no se detalla el numero exacto de tokens ni si se aplico RLHF/DPO (no disponible). Como complemento, el repositorio incluye reglas regex de correccion posterior para nombres de farmacos y terminos medicos, aplicables tras el decodificado y utiles tambien para modelos no ajustados.

## Capacidades

- Transcripcion de voz a texto en frances, con enfasis en vocabulario medico.
- Reconocimiento de nombres de farmacos, dosis y acronimos clinicos.
- Transcripcion de informes hospitalarios y dictado radiologico (evaluado sobre PARROT).
- Procesamiento de audio largo en una sola pasada (hasta 10 minutos segun el benchmark VoxPopuli).
- Decodificacion greedy y beam search (beam 5 con MAES).
- Phrase boosting para sesgar el decodificado hacia terminos personalizados.
- Inferencia en navegador y CPU mediante ONNX, sin salida de datos del dispositivo.
- Retencion multilingue parcial, medida con FLEURS.
- No se documenta soporte de tool calling, agentes ni vision/audio multimodal en la informacion disponible.

## Casos de uso

- Dictado medico en consulta: transcripcion en tiempo real de notas clinicas con terminologia especializada, ejecutable en local para cumplir requisitos de privacidad de datos de pacientes.
- Generacion de informes radiologicos: el modelo ha sido evaluado sobre el subconjunto frances de PARROT (informes de radiologia), por lo que encaja en flujos de dictado a informe estructurado.
- Introduccion de prescripciones: reconocimiento de nombres de farmacos y dosis con reglas regex de correccion posteriores, reduciendo errores criticos en la transcripcion de recetas.
- Codificacion clinica y acronimos: transcripcion fiable de acronimos medicos para su posterior mapeo a codigos diagnosticos.
- Aplicacion web de dictado sin instalacion: integrable en `parakeetweb.olicorne.org` o en cualquier app basada en `onnx-asr`, con procesamiento integro en el cliente.
- Evaluacion y ajuste de ASR medico: el dataset UltiMed y los splits de test permiten comparar modelos ASR en dominio medico frances con CER/WER normalizados.
- Procesamiento por lotes en CPU: exportacion ONNX con varias precisiones de encoder para servidores sin GPU en entornos hospitalarios.

## Benchmarks y rendimiento

Resultados de CER/WER normalizados sobre 11.747 clips de evaluacion en frances medico (menor es mejor), con backend CUDA e decoder int8. `base` corresponde a `parakeet-tdt-0.6b-v3-ultra-onnx`.

| Conjunto | Clips | Que es |
|---|---|---|
| dictionary | 5.285 | test split de UltiMed-ASR-FR-v1, terminos del diccionario medico en frases de dictado |
| parhaf | 2.498 | test split, parrafos de informes hospitalarios PARHAF |
| drugs | 2.059 | test split, nombres de farmacos y dosis (completo) |
| acronyms | 151 | test split, acronimos medicos (completo) |
| drug_sentence | 205 | conjunto separado de frases con farmacos y dosis, split de validacion |
| parrot | 1.549 | subconjunto frances completo de PARROT, informes de radiologia, solo evaluacion |

Prueba de estres con voz real (grabaciones telefonicas del autor, 15 grabaciones sobre 10 dictados medicos densos), CER normalizado con beam 5:

| Configuracion | CER |
|---|---|
| Modelo base | 4,9 % |
| Este fine-tune | 2,3 % |
| Este fine-tune con phrase boosting y reglas de correccion | 1,9 % |

Los resultados desglosados por conjunto y por precision de encoder no estan completos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 0,6B parametros, la inferencia en fp32 ronda 2,4 GB de pesos y en int8 alrededor de 0,6 GB, sin contar activaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp32; A100/H100 no son necesarias por el tamano del modelo.
- Cabe en GPU de consumo: si, incluidas RTX 3060, RTX 4060, RTX 4090 y similares; tambien en CPU y navegador via ONNX.
- Opciones de despliegue: `onnx-asr` (objetivo principal del export), aplicacion web Parakeet Web, ONNX Runtime en CPU; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo ASR ONNX).
- Latencia y throughput: no disponibles como cifras absolutas; el modelo procesa audio de 10 minutos en una sola pasada y usa decodificacion TDT no autorregresiva, lo que reduce latencia frente a transducers clasicos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este modelo (UltiMed ONNX) | ~0,6B | hasta 10 min en una pasada | fr | cc-by-4.0 | ONNX | Fine-tune medico, CER 2,3 % en voz real |
| `Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx` (base) | ~0,6B | hasta 10 min en una pasada | fr y multilingue | no disponible en la informacion | ONNX | Mismo export sin fine-tune medico, CER 4,9 % en voz real |
| `nvidia/parakeet-tdt-0.6b-v3` | ~0,6B | no disponible | multilingue | no disponible en la informacion | NeMo | Modelo original del que deriva la familia |
| `moondream/parakeet-ultra` | ~0,6B | no disponible | no disponible | no disponible en la informacion | pesos completos | Post-entrenamiento en precision completa del anterior |

## Limitaciones y advertencias

- Especializado en frances; el rendimiento fuera de ese idioma no esta garantizado, aunque se reporta retencion multilingue en FLEURS.
- Dominio acotado a dictado medico: el rendimiento en habla general, acentos no vistos o ruido ambiental puede degradarse.
- Riesgo de alucinacion en nombres de farmacos y dosis: por ello el autor publica reglas regex de correccion; no deben omitirse en produccion clinica.
- El conjunto `drug_sentence` se uso como validacion durante el entrenamiento, por lo que sus cifras son ligeramente optimistas.
- Validacion clinica insuficiente: no hay evidencia de certificacion sanitaria ni de evaluacion independiente; no debe usarse como dispositivo medico sin validacion propia.
- Licencia cc-by-4.0: permite uso comercial con atribucion, pero conviene revisar las condiciones del modelo base (`moondream/parakeet-ultra` y `nvidia/parakeet-tdt-0.6b-v3`), cuya licencia no se detalla en la informacion disponible.
- Repositorio de 36,9 GB por incluir varias precisiones de encoder; el despliegue debe seleccionar solo la carpeta de precision necesaria.
- Proyecto autofinanciado en una sola GPU de consumo: hoja de ruta sujeta a cambios y posibles regresiones entre versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-onnx
- Dataset UltiMed: https://huggingface.co/datasets/Olicorne/UltiMed-ASR-FR-v1
- Modelo base (export ONNX sin fine-tune): https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx
- Modelo base original de moondream: https://huggingface.co/moondream/parakeet-ultra
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Reglas regex de correccion: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-onnx/tree/main/regex-fixes
- Prueba de estres con voz real: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-onnx/blob/main/REAL_VOICE_STRESS_TEST.md
- Aplicacion web de ASR: https://parakeetweb.olicorne.org/
- Codigo fuente de la app web: https://github.com/thiswillbeyourgithub/parakeet_web
- Libreria onnx-asr: https://github.com/istupakov/onnx-asr
- Sitio del autor: https://olicorne.org
- Estadisticas del modelo base: https://openmodelstats.com/models/olicorne/parakeet-tdt-0.6b-v3-ultra-onnx
