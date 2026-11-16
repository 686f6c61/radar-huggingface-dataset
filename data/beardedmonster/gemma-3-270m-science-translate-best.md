# BeardedMonster/gemma-3-270m-science-translate-best

## Resumen

gemma-3-270m-science-translate-best es un modelo de traduccion automatica de ingles a 77 lenguas africanas, desarrollado por BeardedMonster como parte del estudio preliminar "Small but Sabi". Se construye sobre google/gemma-3-270m-it mediante una etapa supervisada sobre el corpus AfriScience-MT (seis lenguas: amharico, hausa, luganda, sepedi, yoruba y zulu) interpolada con el modelo RL-final (alpha 0.7) y un ajuste posterior de 401 pasos con GRPO, con un 70% de prompts cientificos y un 30% generales.

El modelo resuelve un problema concreto: la traduccion de contenido cientifico divulgativo hacia lenguas africanas de bajos recursos, un escenario donde los modelos multilingues generalistas rinden de forma desigual. Con solo 268 millones de parametros, su interes reside en la relacion entre tamano y cobertura linguistica: 77 lenguas objetivo con un checkpoint que cabe en cualquier GPU de consumo.

La relevancia actual es doble. Por un lado, demuestra que el ajuste por refuerzo (GRPO) sobre un modelo pequeno puede adaptar un traductor generalista a un dominio especializado. Por otro, su licencia es un borrador no revisado juridicamente (sabiyarn-open-output-v0.1-draft), con linaje de entrenamiento que incluye senal no comercial (NLLB-200-3.3B como referencia de recompensa), lo que condiciona seriamente su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3, variante gemma3_text) |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; existe build GGUF en repo separado |
| Idiomas soportados | Ingles como origen; 77 lenguas africanas como destino (yor, hau, ibo, pcm, efi, twi, ewe, fon, wol, swh, kin, som, orm, amh, tir, lug, lin, zul, xho, afr, sna, nya, sot, tsn, mlg, ibb, urh, bem, tum, run, ven, tso, nso, ssw, nbl, sag, tiv, umb, kmb, mos, kik, luo, kam, bin, dag, oke, shi, dyu, bam, kbp, bbj, kon, kea, kab, nus, swc, lua, kqn, lun, iso, loz, wal, ach, tsc, vmw, kua, seh, nyn, her, yao, sid, ndc, kri, ish, dua, bas, wes) |
| Licencia | sabiyarn-open-output-v0.1-draft (borrador, no revisado por asesoria juridica) |
| Formato de pesos | safetensors (transformers); GGUF en repo companion |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Gemma 3 en su variante de 270M parametros (gemma3_text), un transformer decoder-only denso. El pipeline de entrenamiento tiene tres fases documentadas: primero se toma el modelo RL-final de traduccion general (gemma-3-270m-translate-best), despues se aplica una etapa supervisada corta sobre AfriScience-MT en seis lenguas, interpolada con el RL-final con alpha 0.7, y finalmente 401 pasos de GRPO con una mezcla de prompts del 70% cientificos y 30% generales.

La innovacion tecnica destacable es el uso de GRPO (Group Relative Policy Optimization) para especializar un traductor de 270M en dominio cientifico sin perder rendimiento general: en FLORES+ devtest (45 lenguas, filas limpias) el modelo queda a la par del general (chrF++ 31.8 frente a 31.7). El corpus AfriScience-MT aporta datos solo para seis lenguas, de modo que las otras 71 dependen exclusivamente del modelo general subyacente. Los pesos publicados corresponden unicamente al ultimo paso del run (sha256 1bd2e310f146e233aac0c0be339329321f30823dfe05d95c39f561cfbd6589c5), sin seleccion por evaluacion.

## Capacidades

- Traduccion de ingles a 77 lenguas africanas, exclusivamente en esa direccion.
- Seleccion de lengua destino mediante etiqueta de texto en el prompt (nombre de la lengua, no codigo ISO).
- Salida con prefijo de etiqueta de tres letras seguido de la traduccion.
- Especializacion en texto cientifico divulgativo (resumenes legos de unos 900 tokens de origen).
- Generacion de documento completo en una pasada: completa el 98% de los papers de test, con omision de contenido.
- No es un modelo conversacional: no soporta chat multi-turno ni traduccion inversa o entre lenguas africanas.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Traduccion de resumenes cientificos divulgativos: el modelo esta entrenado especificamente sobre AfriScience-MT, con chrF 50.2 en test a nivel de frase en seis lenguas, por lo que es adecuado para publicar abstracts y notas de prensa cientificas en amharico, hausa, luganda, sepedi, yoruba y zulu.
- Localizacion de material educativo de ciencia: dados sus 268M de parametros, puede desplegarse en servidores modestos para traducir por lotes guiones de divulgacion, fichas de laboratorio o material escolar, troceando la entrada en frases.
- Procesamiento por lotes en pipelines de datos: al ser un modelo pequeno con decodificacion greedy, encaja en colas de traduccion masiva de corpus ingleses hacia las 77 lenguas, con post-proceso para eliminar el prefijo de etiqueta.
- Investigacion en traduccion de bajos recursos: sirve como linea base reproducible para estudiar el efecto de GRPO sobre modelos pequenos en dominios especializados, comparando con el checkpoint general sin datos cientificos.
- Despliegue en CPU y entornos con recursos limitados: existe un build GGUF companion (gemma-3-270m-science-translate-best-GGUF) que permite ejecutar el modelo sin GPU para traduccion de frases sueltas.
- Prototipado de asistentes de lectura cientifica: integrado en una aplicacion que detecte el idioma del usuario y llame al modelo solo para la direccion ingles a lengua africana, con la etiqueta de salida usada para validar la lengua generada.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| AfriScience-MT test, nivel de frase, 6 lenguas (chrF) | 50.2 |
| AfriScience-MT test, nivel de frase, 6 lenguas (chrF++) | 47.3 |
| AfriScience-MT, paper completo en una pasada (chrF) | 46.1 |
| AfriScience-MT, papers completados | 98% |
| FLORES+ devtest, 45 lenguas, filas limpias (chrF++) | 31.8 |
| NLLB-200 ajustado sobre los mismos datos (chrF) | 51.7-52.3 |
| NLLB-200 sin yoruba (chrF) | 58.5-59.3 |
| GPT-5.4 10-shot (chrF) | 53.3 |

El modelo general de referencia (gemma-3-270m-translate-best) obtiene chrF++ 31.7 en FLORES+ devtest. La relacion mediana longitud hipotesis/referencia en papers completos es 0.84, con un 45% de papers por debajo de 0.8, lo que indica omision de contenido en generacion de documento largo.

## Requisitos de hardware

- VRAM estimada: en bfloat16, unos 0.54 GB para los pesos (268M parametros), mas overhead de activaciones y cache KV; en la practica cabe en cualquier GPU con 2 GB o mas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobrada; tambien A100/H100 para despliegues por lotes a gran escala.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas y en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (referencia), text-generation-inference (tag text-generation-inference y endpoints_compatible), llama.cpp/Ollama mediante el build GGUF companion.
- Latencia y throughput: no disponible; la model card solo documenta la decodificacion greedy con max_new_tokens 256 para frases y unas 1.024 para parrafos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (AfriScience-MT, chrF) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3-270m-science-translate-best | 268M | no disponible | 50.2 | borrador no revisado | Hugging Face |
| gemma-3-270m-translate-best | 270M | no disponible | no disponible (sin etapa cientifica) | no disponible | Hugging Face |
| NLLB-200 ajustado sobre AfriScience-MT | no disponible | no disponible | 51.7-52.3 | no disponible | no disponible |
| GPT-5.4 10-shot | no disponible | no disponible | 53.3 | propietaria | API |

La comparativa muestra que el modelo queda por detras de NLLB-200 ajustado con los mismos datos y de GPT-5.4 en few-shot, pero con un coste computacional de dos ordenes de magnitud menor y cobertura de 77 lenguas frente a las seis con datos cientificos.

## Limitaciones y advertencias

- Licencia en estado de borrador, no revisada por asesoria juridica: el linaje de entrenamiento incluye senal no comercial (NLLB-200-3.3B usado como recompensa en cinco lenguas) y el split de entrenamiento de AfriScience-MT, lo que impide garantizar uso comercial.
- Solo traduce de ingles a lenguas africanas; no traduce al ingles ni entre lenguas africanas, y no es un modelo conversacional.
- Solo seis lenguas recibieron datos cientificos; las otras 71 dependen del modelo general y su rendimiento en dominio cientifico no esta medido.
- Riesgo de omision de contenido en documentos largos: relacion mediana hipotesis/referencia de 0.84 y 45% de papers por debajo de 0.8; se recomienda trocear en frases o ventanas cortas.
- El checkpoint publicado es el ultimo paso del run, no seleccionado por evaluacion.
- No se documentan sesgos especificos ni evaluaciones de alucinacion; al ser un modelo de traduccion, el riesgo principal es la fidelidad y la omision, no la fabricacion de contenido.
- La generacion de documento completo a 1.000-2.000 tokens de origen se midio sobre el checkpoint step-250, no sobre este.
- Beam search, penalizaciones de repeticion y MBR se evaluaron sobre el modelo general RL-final, no sobre este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BeardedMonster/gemma-3-270m-science-translate-best
- Modelo general sin datos cientificos: https://huggingface.co/BeardedMonster/gemma-3-270m-translate-best
- Build GGUF para CPU: https://huggingface.co/BeardedMonster/gemma-3-270m-science-translate-best-GGUF
- Licencia (borrador): https://huggingface.co/BeardedMonster/gemma-3-270m-science-translate-best/blob/main/LICENSE_DRAFT.md
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
