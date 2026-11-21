# Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v2-onnx

## Resumen

Parakeet TDT 0.6B v3 Ultra UltiMed v2 ONNX es un ajuste fino en frances medico del modelo de reconocimiento automatico del habla `moondream/parakeet-ultra`, que a su vez es un post-entrenamiento a precision completa del `nvidia/parakeet-tdt-0.6b-v3`. El modelo lo publica el desarrollador independiente Olicorne bajo licencia CC-BY-4.0 y esta disenado especificamente para dictado clinico en frances: nombres de farmacos, dosificaciones, acronimos medicos y parrafos de informes hospitalarios.

Arquitectura NeMo Conformer con decodificacion TDT (Token-and-Duration Transducer), aproximadamente 0.6 mil millones de parametros, exportada a ONNX para inferencia en CPU y navegador. El repositorio incluye varias precisiones del encoder (fp32, fp16, int8) en carpetas separadas, con el encoder fp32 dividido en dos shards de datos. El modelo base se entreno originalmente sobre habla multilingue, pero este ajuste se especializa en frances y no conserva de forma fiable el resto de idiomas.

Su relevancia actual radica en que el autor publica junto al modelo un dataset de mas de 3.300 horas de dictado medico frances (`Olicorne/UltiMed-ASR-FR-v2`) y un conjunto de reglas regex de correccion de terminos, lo que convierte al repositorio en un paquete completo para evaluar y desplegar ASR clinico en frances sin salir del navegador ni enviar audio a servidores externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer con decodificador TDT (transducer) |
| Parametros totales | aproximadamente 0,6 mil millones (0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio; se documenta una pasada unica de 10 minutos) |
| Tipos de cuantizacion | fp32, fp16, int8 (encoder); exportaciones ONNX |
| Idiomas soportados | frances (fr); retencion multilingue evaluada en FLEURS |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder y decoder/joint en carpetas por precision); encoder fp32 dividido en `encoder-model.onnx.data.000` y `.data.001` |

## Arquitectura y entrenamiento

El modelo es un Conformer de NeMo con cabecera TDT, una variante de transducer que predice conjuntamente tokens y duraciones, lo que permite emitir varios tokens por paso y reduce la latencia frente a transducers clasicos. El punto de partida es el rebuild en NeMo de los pesos de `moondream/parakeet-ultra` publicado por el mismo autor, y el resultado se exporta a ONNX con el objetivo de ejecutarse en `onnx-asr` y en la aplicacion web Parakeet Web.

El ajuste fino se realizo sobre `Olicorne/UltiMed-ASR-FR-v2`, un dataset de mas de 3.300 horas de dictado medico frances. La model card menciona conjuntos de evaluacion especificos (dictionary, parhaf, drugs, acronyms, drug_sentence, parrot) con 11.753 clips en total, todos fuera de entrenamiento salvo `drug_sentence`, que se uso como validacion. No se detallan en la informacion disponible el numero exacto de tokens de audio, la composicion completa del dataset ni si se aplico RLHF o DPO; al tratarse de un modelo ASR, el entrenamiento supervisado con pares audio-transcripcion es el procedimiento descrito. Como innovacion practica destaca el soporte de phrase boosting y la aplicacion de reglas regex de correccion de farmacos y terminos medicos tras la decodificacion.

## Capacidades

- Reconocimiento automatico del habla en frances, con especializacion en vocabulario medico: farmacos, dosificaciones, acronimos y terminos de informes clinicos.
- Decodificacion greedy y beam search (beam 5 con MAES) configurables.
- Phrase boosting: sesgo del decodificador hacia listas de terminos proporcionadas por el usuario.
- Procesamiento de audio largo: se documenta una pasada unica de 10 minutos sobre VoxPopuli en frances.
- Inferencia en CPU y en navegador mediante ONNX, con varias precisiones del encoder.
- Integracion con `onnx-asr` y con la aplicacion Parakeet Web para transcripcion totalmente client-side.
- Capacidades multilingues residuales del modelo base, evaluadas en FLEURS, aunque el ajuste esta orientado al frances.
- No se documentan tool calling, function calling, agentes ni modos de razonamiento: es un modelo puramente ASR.

## Casos de uso

- Dictado clinico en consulta: el modelo transcribe dictados medicos densos en frances con una CER normalizada del 2,5 % en int8 (beam 5) segun el stress test del autor, lo que lo hace adecuado para convertir notas de voz en texto estructurado sin enviar datos a la nube.
- Documentacion hospitalaria: los conjuntos de evaluacion incluyen parrafos de informes hospitalarios (PARHAF) y radiologia (PARROT), por lo que encaja en flujos de generacion de informes a partir de dictado.
- Verificacion de farmacos y dosificaciones: con phrase boosting y las reglas regex de `UltiMed-ASR-FR-v2-regex-fixes` se pueden corregir nombres de farmacos y dosis tras la decodificacion, reduciendo errores criticos en prescripciones dictadas.
- Transcripcion privada en navegador: integrado en Parakeet Web, descarga los ONNX y transcribe en el cliente, util para entornos con requisitos de confidencialidad de datos de salud.
- Procesamiento batch en CPU: al disponer de exportaciones int8 y fp16, puede desplegarse en servidores sin GPU para transcribir archivos de audio de forma asincrona.
- Evaluacion y desarrollo de ASR medico: el dataset UltiMed-ASR-FR-v2 y los splits de test permiten comparar modelos propios contra esta linea base en terminos de WER y CER.
- Investigacion en adaptacion de dominio: sirve como referencia de ajuste fino de un Conformer TDT sobre vocabulario especializado y de exportacion ONNX con multiples precisiones.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre conjuntos de evaluacion en frances medico no vistos en entrenamiento (texto normalizado):

| Conjunto | Clips | Que es |
|---|---|---|
| dictionary | 5.290 | split de test de UltiMed-ASR-FR-v2, terminos de diccionario medico en frases de dictado |
| parhaf | 2.500 | split de test, parrafos de informes hospitalarios PARHAF |
| drugs | 2.059 | split de test, nombres de farmacos y dosificaciones (completo) |
| acronyms | 151 | split de test, acronimos medicos (completo) |
| drug_sentence | 205 | conjunto separado de frases de farmacos y dosis, split de validacion |
| parrot | 1.548 | subconjunto completo de PARROT frances, informes de radiologia, solo evaluacion |

En el stress test con voz real (10 dictados medicos densos, 15 grabaciones de telefono, 5 textos leidos dos veces), la CER normalizada con beam 5 fue del 4,9 % para el modelo base, del 2,5 % para este ajuste fino en int8 y del 2,4 % con phrase boosting y las reglas de correccion. La model card indica que la tabla de benchmarks v2 esta completa, pero los valores numericos por conjunto no se incluyen en la informacion proporcionada, por lo que no se reproducen aqui.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de aproximadamente 0,6B parametros, la inferencia en fp16 requiere del orden de 1,2-1,5 GB de VRAM para los pesos, mas memoria para activaciones y buffers de audio; la version int8 reduce el peso del encoder a menos de 1 GB. No se publican cifras oficiales de VRAM en la informacion disponible.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 en adelante) es suficiente; el modelo esta pensado para CPU y navegador, por lo que A100 o H100 no son necesarias salvo para procesamiento batch masivo.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 2 GB o mas de VRAM, y en CPU gracias a las exportaciones int8.
- Opciones de despliegue: `onnx-asr` (objetivo principal del export), Parakeet Web en navegador, y ONNX Runtime en CPU o GPU. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no se publican cifras de latencia ni de throughput en la informacion disponible; el autor menciona que el modelo base y el ajuste compiten por una unica GPU consumer durante el entrenamiento, lo que sugiere un perfil de inferencia ligero.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (UltiMed v2 ONNX) | ~0,6B | pasada de 10 min documentada | frances (medico) | CC-BY-4.0 | ONNX |
| `nvidia/parakeet-tdt-0.6b-v3` | ~0,6B | no disponible | multilingue | no disponible en la informacion | NeMo |
| `moondream/parakeet-ultra` | ~0,6B | no disponible | multilingue | no disponible en la informacion | pesos completos |
| `Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v1-onnx` | ~0,6B | no disponible | frances (medico) | CC-BY-4.0 | ONNX |

La comparativa se limita a la familia Parakeet porque la informacion proporcionada no incluye alternativas de otros autores. Frente a `nvidia/parakeet-tdt-0.6b-v3` y `moondream/parakeet-ultra`, este ajuste sacrifica cobertura multilingue a cambio de precision en vocabulario medico frances; frente a la v1 del mismo autor, la v2 incorpora benchmarks completos y correcciones en las etiquetas de evaluacion.

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste esta orientado a frances medico; la retencion multilingue solo se evalua en FLEURS y puede degradarse respecto al modelo base.
- Riesgo de alucinacion en terminos criticos: aunque la CER es baja, los errores en nombres de farmacos o dosis pueden tener consecuencias graves; el autor recomienda aplicar las reglas regex de correccion y revision humana.
- El conjunto `drug_sentence` se uso como validacion durante el entrenamiento, por lo que sus metricas son ligeramente optimistas.
- La model card indica que las etiquetas de test se corrigieron despues del entrenamiento, lo que afecta a la comparabilidad con resultados anteriores.
- No se documentan sesgos especificos ni composicion demografica del dataset; la cobertura se limita al frances y al dominio medico.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero exige citar al autor y conservar el aviso de licencia.
- Proyecto autofinanciado por un unico desarrollador con una GPU consumer; el soporte y la cadencia de actualizaciones pueden ser limitados.
- No apto para tareas de lenguaje general, tool calling ni agentes: es exclusivamente un modelo ASR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v2-onnx
- Version v1 del repositorio: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v1-onnx
- Modelo base: https://huggingface.co/moondream/parakeet-ultra
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Rebuild NeMo en ONNX: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx
- Dataset UltiMed-ASR-FR-v2: https://huggingface.co/datasets/Olicorne/UltiMed-ASR-FR-v2
- Reglas regex de correccion: https://github.com/UltiMed-Org/UltiMed-ASR-FR-v2-regex-fixes
- Aplicacion web Parakeet Web: https://parakeetweb.olicorne.org/
- Codigo de Parakeet Web: https://github.com/thiswillbeyourgithub/parakeet_web
- `onnx-asr`: https://github.com/istupakov/onnx-asr
- Sitio del autor: https://olicorne.org
