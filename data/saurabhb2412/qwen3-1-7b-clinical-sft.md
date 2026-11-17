# saurabhb2412/qwen3-1.7b-clinical-sft

## Resumen

qwen3-1.7b-clinical-sft es un modelo de lenguaje pequeno (SLM) de 1.720 millones de parametros, derivado por ajuste fino supervisado (SFT) de Qwen3-1.7B, orientado a asistencia clinica y conocimiento farmacologico del contexto indio. Lo publica el usuario independiente saurabhb2412 como artefacto de investigacion y corresponde a la tercera etapa de una cadena de ajustes (v1: informes de laboratorio y MedMCQA; v2: replay de MCQA; v3: inyeccion de conocimiento de marcas y genericos de farmacos). Su interes radica en que demuestra que un modelo de menos de 2.000 millones de parametros puede mejorar de forma medible en tareas de opcion multiple farmacologica sin degradar habilidades generales, un regimen de bajo coste (un solo H200, 40 minutos de entrenamiento) reproducible por equipos pequenos.

El modelo no es un dispositivo medico ni sustituye el juicio clinico; su card lo declara explicitamente como artefacto de investigacion. Se distribuye con licencia Apache-2.0 (aunque uno de los conjuntos fuente, BODHI-M, es CC-BY-NC-4.0, lo que impone restricciones de uso no comercial sobre esa porcion de los datos). La longitud de contexto heredada de Qwen3-1.7B no se explicita en la informacion disponible.

La relevancia actual esta en la linea de trabajo de modelos pequenos especializados en dominios regulados y en idiomas distintos del ingles: el modelo entrena y evalua en ingles e hindi sobre baterias MCQA medicas (indian_drug_mcqa, Eka_NFI_MCQA, MedMCQA-Indic) y muestra mejoras de +12,6 puntos en conocimiento de farmacos respecto a sus predecesores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 1.720.050.688 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-1.7B; empaquetado de entrenamiento a 4096 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en bf16; repo de 3,5 GB) |
| Idiomas soportados | ingles e hindi en las evaluaciones MCQA; lista oficial de idiomas no disponible |
| Licencia | Apache-2.0 (con datos fuente CC-BY-NC-4.0 en una porcion del entrenamiento) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only denso de 1.720 millones de parametros, y aplica una cadena de tres ajustes SFT secuenciales. La etapa final (stage-3) se entreno con TRL 1.18 SFTTrainer, learning rate 8e-6 con scheduler coseno, 1 epoca, secuencias empaquetadas a 4096 tokens, batch efectivo 8x2, precision bf16 y flash-attn2, sobre 1 GPU H200 durante 39 minutos y 56 segundos (836 pasos desde la version v2).

La mezcla de entrenamiento de la etapa 3 contiene 181.000 filas y 53,9 millones de tokens: aproximadamente 45.000 preguntas MCQA de marca a generico y viceversa, generadas por plantilla a partir del Indian-Medicine-Dataset (254.000 registros reales de medicamentos indios con marca, composicion y fabricante, licencia MIT); unas 34.000 preguntas de farmacologia de MedMCQA (sobremuestreadas x2, split de entrenamiento Apache-2.0); entre 4.000 y 6.000 pares concepto-farmaco de BODHI-M (triples TREATED_BY, CC-BY-NC-4.0); y 120.000 filas de replay de MCQA general mas 10.000 de replay de informes de laboratorio para evitar olvido catastrofico. No se uso texto de las preguntas de los conjuntos de evaluacion (higiene de eval-set). No se menciona RLHF ni DPO en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles e hindi, con foco en dominio clinico.
- Respuesta a preguntas de opcion multiple (MCQA) medicas y farmacologicas, incluyendo farmacologia de MedMCQA.
- Conocimiento bidireccional marca-generico de medicamentos del mercado indio (marca a composicion generica y generico a marcas).
- Asociacion concepto-farmaco (triples TREATED_BY) para relaciones entre condiciones y medicamentos.
- Generacion de resumenes estructurados de informes de laboratorio, con marcado de valores HIGH/LOW, verificado en una comprobacion sintetica held-out tras la etapa 3.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (modelo de texto).
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion comparativa de conocimiento farmacologico indio: usar el modelo como linea base o candidato en baterias MCQA (indian_drug_mcqa, Eka_NFI_MCQA) para medir la cobertura marca-generico de un catalogo antes de integrarlo en una herramienta interna.
- Normalizacion de recetas a genericos: dado el nombre comercial de un medicamento indio, el modelo devuelve su composicion generica, util para conciliacion de medicacion en sistemas de historia clinica electronica que almacenan ambos formatos.
- Enriquecimiento de catalogos de farmacia: mapear registros de inventario (marca, composicion, fabricante) a ontologias de farmacos mediante consultas MCQA o generativas, con el modelo como componente de bajo coste en un pipeline batch.
- Formacion y simulacros de examen medico: generar y resolver preguntas de farmacologia estilo MedMCQA en ingles e hindi para plataformas de estudio, dado su rendimiento en MedMCQA-Indic (0,435 en ingles, 0,336 en hindi).
- Preprocesado de informes de laboratorio: producir resumenes estructurados con marcas HIGH/LOW sobre analiticas sinteticas o de investigacion, como paso previo a revision humana; no apto para decision clinica directa.
- Prototipado de asistentes clinicos en entornos con recursos limitados: al ser un modelo de 1,7 B, puede desplegarse en una sola GPU de consumo para demos internas y validacion de concepto antes de escalar a modelos mayores.
- Investigacion sobre olvido catastrofico: replicar el esquema de replay (120.000 filas generales + 10.000 de informes) para estudiar como la inyeccion de conocimiento de dominio afecta a habilidades generales en modelos pequenos.

## Benchmarks y rendimiento

Resultados publicados en la model card (bateria MCQA de ekacare, parseo de letra greedy, splits de test completos):

| Conjunto | base Qwen3-1.7B | v1 | v2 | este modelo |
|---|---:|---:|---:|---:|
| indian_drug_mcqa | 0,380 | 0,397 | 0,398 | 0,523 |
| Eka_NFI_MCQA | 0,428 | 0,455 | 0,458 | 0,480 |
| MedMCQA-Indic (en) | 0,266 | 0,438 | 0,435 | 0,435 |
| MedMCQA-Indic (hi) | 0,093 | 0,348 | 0,348 | 0,336 |
| MMLU-medical (8 configuraciones) | 0,118-0,531 | 0,467-0,671 | 0,485-0,665 | 0,436-0,664 |

La mejora principal es de +12,6 puntos en indian_drug_mcqa respecto a v1/v2 (0,397 a 0,523) y de +2,5 puntos en Eka_NFI_MCQA (0,455 a 0,480). El rendimiento en MCQA general se mantiene plano en ingles y dentro del ruido en la banda de MMLU-medical. En hindi, MedMCQA-Indic baja 1,2 puntos (0,348 a 0,336) con una tasa de parseo de 0,976 a 0,945. No se han publicado resultados de MMLU completo, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en bf16, los 1.720 millones de parametros ocupan aproximadamente 3,4 GB de pesos; con cache KV y overhead de runtime, el consumo realista ronda 5-7 GB para contextos moderados. En cuantizacion de 8 bits, unos 2 GB de pesos; en 4 bits, aproximadamente 1 GB (estimaciones a partir del numero de parametros, no publicadas por el autor).
- GPU recomendadas: el entrenamiento se hizo en 1x H200; para inferencia basta una GPU con 8 GB o mas.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes; en 4 bits puede caber en GPUs de 4-6 GB.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag text-generation-inference) y endpoints compatibles; otras opciones como vLLM, llama.cpp u Ollama no se mencionan en la informacion disponible, aunque al ser un transformer denso estandar son tecnicamente aplicables.
- Latencia y throughput: no disponibles en la informacion proporcionada. El tiempo de entrenamiento (39m56s en 1x H200 para 836 pasos) no es un indicador de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento MCQA farmaco indio | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-1.7b-clinical-sft | 1,72 B | no disponible | Apache-2.0 (con datos CC-BY-NC-4.0) | indian_drug_mcqa 0,523; Eka_NFI 0,480 | Hugging Face |
| saurabhb2412/qwen3-1.7b-eka-clinical-sft-v2 (predecesor) | 1,72 B | no disponible | Apache-2.0 | indian_drug_mcqa 0,398; Eka_NFI 0,458 | Hugging Face |
| Qwen/Qwen3-1.7B (base) | 1,72 B | no disponible | Apache-2.0 | indian_drug_mcqa 0,380; Eka_NFI 0,428 | Hugging Face |
| Modelos clinicos pequenos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de otros modelos clinicos de tamano similar en la informacion proporcionada, por lo que la comparativa se limita a la propia linea de ascendencia del modelo.

## Limitaciones y advertencias

- Artefacto de investigacion: no es un dispositivo medico ni constituye consejo medico; no debe usarse para diagnostico ni decision terapeutica.
- Los resumenes de laboratorio son generados por plantilla, no texto de clinicos; el modelo no es un motor de diagnostico.
- El conocimiento marca-generico refleja el catalogo fuente (scrape de estilo retail, licencia MIT); los nombres comerciales cambian con el tiempo y las dosis no estan modeladas.
- No hay datos de entrenamiento de informes de laboratorio en hindi; la degradacion en hindi para entradas de informes no esta medida.
- Riesgo de alucinacion en nombres de farmacos, composiciones y asociaciones concepto-farmaco, especialmente con distractores de combinaciones cercanas; el propio autor senala margen de mejora (0,523 en drug MCQA).
- Sesgo geografico y de catalogo: el conocimiento farmacologico esta sesgado al mercado indio y a la cobertura del dataset fuente.
- Restriccion de licencia: aunque el modelo es Apache-2.0, una porcion de los datos de entrenamiento (BODHI-M) es CC-BY-NC-4.0, lo que limita el uso comercial derivado de ese componente.
- Caida leve en hindi (MedMCQA-Indic hi: -1,2 puntos) y tasa de parseo reducida (0,976 a 0,945), relevante si se depende de respuestas de opcion multiple en ese idioma.
- Sin datos publicados sobre tool calling, agentes, modo thinking ni longitud de contexto efectiva, lo que limita su uso en pipelines que requieran estas capacidades sin validacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saurabhb2412/qwen3-1.7b-clinical-sft
- Modelo base (etapa anterior): https://huggingface.co/saurabhb2412/qwen3-1.7b-eka-clinical-sft-v2
- Primera etapa del linaje: https://huggingface.co/saurabhb2412/qwen3-1.7b-eka-clinical-sft
- Modelo original Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/saurabhb2412/eka-clinical-sft-train
- Dataset Indian-Medicine-Dataset (repositorio): https://github.com/junioralive/Indian-Medicine-Dataset
- Dataset BODHI-M: https://huggingface.co/datasets/ekacare/BODHI-M
- Dataset MedMCQA: https://huggingface.co/datasets/openlifescienceai/medmcqa
- Conjunto de evaluacion indian_drug_mcqa: https://huggingface.co/datasets/ekacare/indian_drug_mcqa
- Conjunto de evaluacion Eka_NFI_MCQA: https://huggingface.co/datasets/ekacare/Eka_NFI_MCQA
- Conjunto de evaluacion MedMCQA-Indic: https://huggingface.co/datasets/ekacare/MedMCQA-Indic
- Paper de referencia (MedCritical-style CoT distillation): https://arxiv.org/abs/2509.23368
