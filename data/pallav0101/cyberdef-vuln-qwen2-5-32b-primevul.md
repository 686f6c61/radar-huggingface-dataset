# pallav0101/cyberdef-vuln-qwen2.5-32b-primevul

## Resumen

cyberdef-vuln-qwen2.5-32b-primevul es un adaptador LoRA (QLoRA de 4 bits) desarrollado por Pallav Pokhriyal sobre el modelo base Qwen/Qwen2.5-32B-Instruct. Su tarea es la deteccion defensiva de vulnerabilidades en codigo: recibe un fragmento de codigo y emite un veredicto binario (`VERDICT: VULNERABLE` o `VERDICT: SAFE`) orientado a triaje por equipos blue-team. No genera exploits ni reescribe el codigo para corregirlo.

El adaptador forma parte de un estudio de escalado y evaluacion cruzada entre conjuntos de datos que cubre cuatro tamanos (1.5B, 7B, 14B y 32B); este es el punto mas grande del estudio. Segun la model card, el ajuste selectivo de AUROC sobre PrimeVul pasa de 0.614 en el modelo base a 0.735 (+0.120), con un ECE calibrado de 0.056. El propio autor advierte que no supera al adaptador de 7B (0.786) y que, con n=200 casos por tamano, el error estandar del AUROC ronda 0.04, por lo que las diferencias pequenas entre tamanos quedan dentro del ruido.

El interes actual del modelo es metodologico: documenta con rigor un pipeline de ajuste fino parametrizado eficiente (PEFT) para una tarea de seguridad, con resultados recalculados a partir de salidas por caso y con una advertencia explicita sobre el modo de fallo peligroso (un falso `SAFE`). Es un adaptador de investigacion, no un clasificador listo para produccion sin supervision humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Qwen2.5-32B-Instruct) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen2.5-32B-Instruct tiene 32B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | QLoRA 4 bits nf4 para el entrenamiento; el adaptador se distribuye en safetensors |
| Idiomas soportados | no disponible |
| Licencia | MIT (adaptador); modelo base Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA con rango r=16 y alpha=32, entrenado en modalidad QLoRA de 4 bits con cuantizacion nf4 sobre el modelo base Qwen/Qwen2.5-32B-Instruct. No se modifican los pesos del modelo base: el repositorio contiene unicamente los pesos del adaptador (0.5 GB), que se cargan con `PeftModel.from_pretrained` sobre el modelo base descargado aparte.

El entrenamiento se realizo sobre el conjunto de datos PrimeVul, orientado a deteccion de vulnerabilidades en codigo. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; esa informacion figura, segun el autor, en el repositorio GitHub del proyecto (RESULTS.md). El autor declara que no se usaron salidas generadas por el modelo ni de APIs comerciales como datos de entrenamiento.

## Capacidades

- Clasificacion binaria de seguridad sobre fragmentos de codigo: emite `VERDICT: VULNERABLE` o `VERDICT: SAFE`.
- Triaje defensivo (blue-team) asistido, pensado para priorizar revision humana.
- Calibracion de confianza: ECE de 0.056, apta para umbrales de abstencion.
- Generacion de texto conversacional heredada del modelo base Qwen2.5-32B-Instruct.
- Soporte de tool calling y function calling: heredado del modelo base, no validado especificamente para esta tarea en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No genera exploits ni aplica parches de codigo; su alcance es la clasificacion.

## Casos de uso

- Triaje de pull requests en CI/CD: el adaptador puede clasificar fragmentos modificados y marcar los que requieran revision de seguridad antes del merge, con un umbral de abstencion que derive los casos dudosos a un revisor humano.
- Priorizacion de hallazgos de analisis estatico: usar el veredicto como segunda senal para ordenar alertas de SAST y reducir el volumen de falsos positivos que llega al equipo.
- Revision asistida de codigo de terceros: clasificar dependencias o fragmentos vendorizados antes de incorporarlos a un repositorio interno.
- Formacion y concienciacion en seguridad: emplear el modelo como clasificador de referencia en ejercicios donde el alumnado debe identificar vulnerabilidades y contrastar su criterio con el veredicto.
- Investigacion en deteccion automatica de vulnerabilidades: punto de comparacion de 32B dentro de un estudio de escalado, util para reproducir la curva de rendimiento frente a 1.5B, 7B y 14B.
- Auditoria de codigo legacy: procesar por lotes fragmentos de sistemas antiguos para generar una lista priorizada de candidatos a revision manual.
- Evaluacion de calibracion: con ECE de 0.056, sirve como caso de estudio para implementar politicas de abstencion en pipelines de clasificacion de seguridad.

## Benchmarks y rendimiento

| Metrica | Modelo base (Qwen2.5-32B-Instruct) | Adaptador 32B | Adaptador 7B (referencia) |
|---|---|---|---|
| AUROC selectivo en PrimeVul | 0.614 | 0.735 (+0.120) | 0.786 |
| ECE calibrado | no disponible | 0.056 | no disponible |
| Tamano de muestra de evaluacion | n=200 | n=200 | n=200 |
| Error estandar del AUROC | no disponible | ~0.04 | ~0.04 |

No se han publicado en la informacion disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 32B en precision completa requiere del orden de 64 GB; en cuantizacion de 8 bits, unos 32-35 GB; en 4 bits, unos 18-20 GB. Estas cifras son estimaciones por tamano y no estan publicadas en la informacion proporcionada.
- GPU recomendadas: A100 80 GB o H100 para inferencia en BF16/FP16 sin cuantizar; A100 40 GB o L40S para 8 bits; RTX 4090 (24 GB) solo con cuantizacion de 4 bits y contexto reducido.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 unicamente con cuantizacion agresiva (4 bits) y margen limitado de contexto.
- Opciones de despliegue: transformers + peft (metodo documentado en la model card); vLLM, llama.cpp, Ollama o TGI no estan documentados para este adaptador en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AUROC PrimeVul | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyberdef-vuln-qwen2.5-32b-primevul | 32B (base) + LoRA | no disponible | 0.735 | MIT (adaptador) / Apache-2.0 (base) | Hugging Face |
| cyberdef-vuln-qwen2.5-7b-primevul | 7B (base) + LoRA | no disponible | 0.786 | MIT (adaptador) / Apache-2.0 (base) | Hugging Face |
| Qwen/Qwen2.5-32B-Instruct (base) | 32B | no disponible | 0.614 | Apache-2.0 | Hugging Face |

El adaptador de 7B es la opcion recomendada por el propio autor por su mejor AUROC y menor coste de inferencia. No se dispone de datos de otros adaptadores de seguridad comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modo de fallo peligroso es un falso `SAFE`: el autor exige mantener siempre un revisor humano en el bucle y no usar el modelo como puerta autonoma.
- No supera al adaptador de 7B en AUROC (0.735 frente a 0.786); el uso de 32B solo se justifica si se necesita especificamente ese backbone.
- Con n=200 casos, el error estandar del AUROC (~0.04) hace que las diferencias pequenas entre tamanos queden dentro del ruido estadistico.
- El modelo clasifica codigo; no genera exploits ni corrige vulnerabilidades, por lo que no debe emplearse para parcheo automatico.
- Sesgos conocidos: no documentados en la informacion disponible.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia: el adaptador es MIT; el modelo base Qwen2.5-32B-Instruct es Apache-2.0 y debe usarse bajo sus terminos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion externa independiente.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/pallav0101/cyberdef-vuln-qwen2.5-32b-primevul
- Adaptador recomendado de 7B: https://huggingface.co/pallav0101/cyberdef-vuln-qwen2.5-7b-primevul
- Repositorio del proyecto (resultados, receta e integridad): https://github.com/pallav0107/cyberdef-llm
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- ORCID del autor: https://orcid.org/0009-0001-5356-7663
