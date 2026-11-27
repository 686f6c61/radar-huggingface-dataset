# Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-onnx

## Resumen

`parakeet-tdt-0.6b-v3-ultra-UltiMed-onnx` es un modelo de reconocimiento automático del habla (ASR) especializado en dictado médico en francés, publicado por el usuario Olicorne dentro del proyecto UltiMed. Se trata de un ajuste fino de `moondream/parakeet-ultra`, que a su vez es el post-entrenamiento en precisión completa de `nvidia/parakeet-tdt-0.6b-v3`. El modelo resuelve un problema concreto: la transcripción fiable de terminología médica y farmacológica en francés, un dominio donde los ASR generalistas cometen errores sistemáticos en nombres de fármacos y términos clínicos.

La arquitectura es NeMo Conformer con decodificación TDT (Token-and-Duration Transducer), con aproximadamente 0,6 mil millones de parámetros. El modelo se distribuye exclusivamente en formato ONNX, con varias precisiones del encoder en carpetas separadas, y está pensado para inferencia en CPU y en navegador mediante `onnx-asr` y la aplicación Parakeet Web. La licencia es CC-BY-4.0, lo que permite uso comercial con atribución.

Su relevancia actual radica en que cubre un nicho poco atendido —el dictado médico en francés— con un modelo ligero que puede ejecutarse íntegramente en el cliente, sin enviar audio a servidores externos, algo crítico por las implicaciones de privacidad de los datos clínicos. El autor lo marca explícitamente como la versión recomendada frente a la v2, que pese a un dataset mejor rinde peor en dictado humano real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | aproximadamente 0,6 mil millones (0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio; se documenta una pasada única de 10 minutos en VoxPopuli francés) |
| Tipos de cuantizacion | varias precisiones del encoder en carpetas separadas (fp32, entre otras; la fp32 va dividida en `encoder-model.onnx.data.000` y `.data.001`) |
| Idiomas soportados | francés (fr); se documenta retención multilingüe evaluada en FLEURS |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (exportado para `onnx-asr` y Parakeet Web) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `moondream/parakeet-ultra`, que a su vez deriva de `nvidia/parakeet-tdt-0.6b-v3`. La arquitectura es un Conformer de NeMo con decodificador TDT, un transducer que predice conjuntamente tokens y duraciones, lo que permite emisiones de varios tokens por paso y mejora la eficiencia del decodificado frente a CTC o transducers clásicos. El punto de partida del entrenamiento fue la reconstrucción en NeMo de los pesos publicados en `Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx`, y el resultado se exportó a ONNX con varias precisiones del encoder en un mismo repositorio.

El entrenamiento se realizó sobre `Olicorne/UltiMed-ASR-FR-v1`, un dataset de más de 3.000 horas de dictado médico en francés. El autor documenta explícitamente qué datos se excluyeron del entrenamiento (sección "Deliberately excluded" de la model card) para evitar contaminación de los conjuntos de evaluación. No se detalla en la información disponible el número exacto de tokens de audio, la composición completa del dataset ni si hubo etapas de RLHF o DPO; en ASR estos métodos no son habituales. El modelo incluye además un conjunto de reglas regex de corrección posterior al decodificado para nombres de fármacos y términos médicos, publicadas en el repositorio del ajuste fino.

## Capacidades

- Transcripción de voz a texto en francés, con especialización en dictado médico y terminología clínica.
- Reconocimiento de nombres de fármacos y términos del diccionario médico, reforzado por reglas regex de sustitución posterior al decodificado.
- Decodificación greedy y beam search (se documenta beam 5 con MAES).
- Phrase boosting: permite sesgar el decodificado hacia frases o términos concretos, con mejora medible del CER.
- Procesamiento de audio largo en una sola pasada: se documenta una transcripción de 10 minutos de VoxPopuli francés sin segmentar.
- Inferencia en navegador y en CPU gracias a la exportación ONNX, sin dependencia de GPU.
- Retención multilingüe parcial, evaluada en FLEURS, pese a estar especializado en francés.
- No se documenta soporte de tool calling, agentes ni otras capacidades multimodales distintas del audio.

## Casos de uso

- Dictado clínico en consulta: el modelo transcribe directamente el dictado del médico en francés con terminología farmacológica, reduciendo la corrección manual posterior gracias al ajuste fino y a las reglas regex de nombres de fármacos.
- Documentación hospitalaria: la evaluación sobre PARHAF (párrafos de informes hospitalarios) indica que el modelo está entrenado para el registro formal de informes clínicos, no solo para dictado coloquial.
- Aplicaciones web con privacidad por diseño: al ejecutarse íntegramente en el cliente vía ONNX y Parakeet Web, el audio del paciente no sale del dispositivo, lo que facilita el cumplimiento de requisitos de protección de datos sanitarios.
- Transcripción por lotes en CPU: al no requerir GPU, puede desplegarse en servidores modestos para procesar archivos de audio de consultas o sesiones clínicas.
- Asistencia a la codificación de fármacos: las reglas regex y el phrase boosting permiten forzar la salida correcta de nombres comerciales y principios activos, útil en sistemas de prescripción asistida.
- Evaluación y ajuste de ASR médico: el dataset UltiMed-ASR-FR-v1 y los conjuntos de evaluación (dictionary, parhaf, drugs) sirven para comparar otros modelos ASR en francés médico.
- Investigación en ASR de dominio especializado: el modelo sirve como línea base ligera para estudiar el efecto de ajustes finos y de la corrección post-decodificado en dominios técnicos.

## Benchmarks y rendimiento

Tasas de error de palabra y carácter sobre conjuntos de evaluación en francés médico no vistos en entrenamiento. La información disponible incluye la tabla de conjuntos y los resultados de la prueba de estrés con voz real; los valores completos de WER/CER por conjunto no se detallan en los datos proporcionados.

| Conjunto | Clips | Descripción |
|---|---|---|
| dictionary | 5.285 | split de test de UltiMed-ASR-FR-v1; términos del diccionario médico en frases de dictado |
| parhaf | 2.498 | split de test; párrafos de informes hospitalarios PARHAF |
| drugs | 2.059 | datos de evaluación de fármacos (descripción truncada en la información disponible) |

Prueba de estrés con voz real (grabaciones telefónicas del autor, 10 dictados médicos densos, 15 grabaciones, 5 textos leídos dos veces; CER normalizado, beam 5):

| Configuración | CER |
|---|---|
| Modelo base (parakeet-ultra) | 4,9 % |
| Este ajuste fino (UltiMed v1) | 2,3 % |
| Este ajuste fino + phrase boosting + reglas de corrección | 1,9 % |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 0,6B parámetros, la inferencia en fp32 ronda los 2,4 GB de pesos, y las precisiones reducidas del encoder bajan considerablemente ese requisito.
- GPU recomendadas: no se especifican; el modelo está orientado a CPU y navegador, por lo que cualquier GPU consumer moderna es suficiente. El autor menciona que entrena en una única GPU consumer y solicita una RTX 5090 para acelerar el desarrollo.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del modelo.
- Opciones de despliegue: `onnx-asr` (objetivo principal del export), Parakeet Web (aplicación de navegador del autor) y cualquier runtime ONNX compatible. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (UltiMed v1 ONNX) | 0,6B | pasada única de 10 min documentada | fr (especializado) | CC-BY-4.0 | ONNX |
| `moondream/parakeet-ultra` (base) | 0,6B | no disponible | multilingüe (base de parakeet v3) | no disponible en la información | no disponible |
| `nvidia/parakeet-tdt-0.6b-v3` | 0,6B | no disponible | multilingüe | no disponible en la información | no disponible |
| `Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v2-onnx` | 0,6B | misma arquitectura y tokenizer | fr | CC-BY-4.0 | ONNX |

La comparativa relevante es interna al proyecto: la v2 comparte arquitectura, tokenizer (`vocab.txt`), `config.json` y estructura de archivos con esta v1, de modo que el intercambio es directo cambiando el identificador del modelo. Según el autor, la v2 es experimental y rinde peor en dictado humano real pese a un dataset mejor, por lo que la v1 es la versión recomendada.

## Limitaciones y advertencias

- Especialización en francés: aunque retiene capacidades multilingües parciales (evaluadas en FLEURS), no es un modelo ASR generalista y su rendimiento fuera del francés no está documentado en detalle.
- Dominio acotado: el ajuste fino está orientado a dictado médico; su comportamiento en otros registros del francés puede degradarse respecto al modelo base.
- Riesgo de errores en términos críticos: el propio autor documenta confusiones en nombres de fármacos (por ejemplo, "venlafaxine" transcrito como "devant l'accès" en la v2), lo que exige revisión humana en contextos clínicos.
- Dependencia de reglas externas: la mejora de 2,3 % a 1,9 % de CER requiere aplicar phrase boosting y las reglas regex de corrección, que son un componente separado del modelo.
- Sesgos y cobertura: la información disponible no detalla la composición demográfica del dataset ni análisis de sesgos por acento, edad o género; el autor remite a la sección "Bias and coverage" de la model card, cuyo contenido no se incluye en los datos proporcionados.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar al autor y conservar el aviso de licencia.
- Proyecto autofinanciado y de un solo autor: el mantenimiento y la evolución dependen de recursos limitados, lo que supone un riesgo de continuidad para producción.
- El repositorio ocupa 36,9 GB debido a las múltiples precisiones del encoder; conviene descargar solo la carpeta de la precisión necesaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-onnx
- Modelo base: https://huggingface.co/moondream/parakeet-ultra
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Reconstrucción NeMo en ONNX: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx
- Versión v2 (experimental): https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v2-onnx
- Dataset UltiMed-ASR-FR-v1: https://huggingface.co/datasets/Olicorne/UltiMed-ASR-FR-v1
- Dataset UltiMed-ASR-FR-v2: https://huggingface.co/datasets/Olicorne/UltiMed-ASR-FR-v2
- Reglas regex de corrección v2: https://github.com/UltiMed-Org/UltiMed-ASR-FR-v2-regex-fixes
- Organización UltiMed: https://github.com/UltiMed-Org
- Aplicación Parakeet Web: https://parakeetweb.olicorne.org/
- Código de Parakeet Web: https://github.com/thiswillbeyourgithub/parakeet_web
- `onnx-asr`: https://github.com/istupakov/onnx-asr
- Sitio del autor: https://olicorne.org
