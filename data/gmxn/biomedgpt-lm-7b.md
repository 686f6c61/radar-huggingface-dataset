# gmxn/BioMedGPT-LM-7B

## Resumen

BioMedGPT-LM-7B es un modelo de lenguaje generativo de 7.000 millones de parametros especializado en el dominio biomedico, desarrollado por PharMolix (equipo autor del proyecto OpenBioMed). Se obtiene mediante ajuste fino supervisado de Llama2-7B-Chat sobre millones de articulos cientificos del corpus S2ORC, filtrando por identificadores PubMed Central (PMC) y PubMed. Su proposito es actuar como motor de lenguaje del sistema multimodal BioMedGPT-10B, cubriendo la pata de lenguaje natural dentro de una arquitectura que enlaza texto con otras modalidades biomedicas (moleculas, proteinas, etc.).

La relevancia del modelo radica en su especializacion: frente a modelos generalistas del mismo tamano, ha sido expuesto a mas de 26.000 millones de tokens de literatura biomedica, lo que segun el autor le permite igualar o superar a modelos humanos y a modelos generalistas notablemente mayores en varios benchmarks de QA biomedico. La arquitectura es la de Llama2 (transformer decoder-only denso), con una longitud de contexto de entrenamiento de 2.048 tokens.

El repositorio de Hugging Face es minimo (tamano de 0,0 GB, sin descargas ni likes registrados) y no incluye pesos publicados en el momento de la consulta, aunque la model card describe el proceso de entrenamiento y remite al informe tecnico y al repositorio de GitHub para obtener mas detalle. La licencia declarada es Apache-2.0, acompanada de una politica de uso aceptable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama2), denso |
| Parametros totales | 7.000 millones (7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el corpus de entrenamiento es literatura cientifica en ingles) |
| Licencia | Apache-2.0, con politica de uso aceptable (USE_POLICY.md) |
| Formato de pesos | no disponible (el repositorio figura con 0,0 GB) |

## Arquitectura y entrenamiento

El modelo parte de Llama2-7B-Chat y se ajusta de forma supervisada (fine-tuning) durante 5 epocas, con un tamano de lote de 192, una tasa de aprendizaje de 2e-5 y una longitud de contexto de 2.048 tokens. El corpus de ajuste procede de millones de articulos biomedicos del S2ORC, seleccionados mediante PMC-ID y PubMed ID, sumando mas de 26.000 millones de tokens altamente pertinentes al dominio biomedico. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa o atencion lineal.

La innovacion principal no es arquitectonica sino de dominio: el modelo se concibe como el componente de lenguaje de BioMedGPT-10B, un GPT generativo multimodal para biomedicina que conecta el lenguaje natural con otras modalidades de datos biomedicos mediante modelos generativos grandes. El detalle tecnico completo se remite al informe tecnico arXiv:2308.09442v2.

## Capacidades

- Generacion de texto en el dominio biomedico: respuestas a preguntas, resumenes de literatura y explicaciones de conceptos medicos.
- Razonamiento sobre conocimiento biomedico adquirido de literatura cientifica revisada (corpus S2ORC/PMC/PubMed).
- Respuesta a preguntas biomedicas (biomedical QA), area en la que el autor reporta resultados a la par o superiores a modelos humanos y generalistas mayores.
- Base para el sistema multimodal BioMedGPT-10B como modulo de lenguaje.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el corpus de entrenamiento es literatura cientifica en ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponible para este modulo de lenguaje de forma aislada.

## Casos de uso

- Busqueda y sintesis de literatura biomedica: el modelo puede resumir y responder preguntas sobre articulos cientificos, aprovechando su ajuste sobre millones de papers de S2ORC para generar resumenes coherentes con la terminologia del dominio.
- Asistencia a investigadores en redaccion cientifica: generacion de borradores de secciones (introduccion, discusion) con vocabulario tecnico biomedico, util como punto de partida sujeto a revision humana.
- Soporte a la educacion medica: generacion de explicaciones y preguntas de repaso sobre conceptos biomedicos para estudiantes, con la cautela de no emplearlo como servicio publico segun la politica del autor.
- Extraccion de informacion de articulos: procesamiento de textos biomedicos para identificar entidades, relaciones o hallazgos, integrándose en pipelines de mineria de literatura.
- Componente de lenguaje en sistemas multimodales: uso como modulo textual dentro de BioMedGPT-10B para tareas que combinan texto con otras modalidades biomedicas.
- Prototipado de asistentes internos de investigacion: despliegue en entornos controlados de laboratorio o institucion para consultas sobre conocimiento biomedico, con revision experta obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card afirma de forma cualitativa que BioMedGPT-LM-7B supera o iguala a modelos humanos y a modelos generalistas significativamente mayores en varios benchmarks de QA biomedico, pero no se aportan cifras concretas (MMLU, HumanEval, GSM8K u otros) en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo denso de 7B, las estimaciones habituales serian aproximadamente 14-16 GB en FP16/BF16, 8-10 GB en cuantizacion de 8 bits y 4-6 GB en 4 bits (estimacion general para modelos de este tamano, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamano, cabria esperar ejecucion en GPUs de 24 GB (RTX 3090/4090) en cuantizacion o FP16, y en A100/H100 para despliegues de mayor throughput.
- Compatibilidad con GPU de consumo: probable en GPUs de 24 GB o superiores con cuantizacion; no confirmado en la informacion disponible.
- Opciones de despliegue: no documentadas por el autor; al derivar de Llama2, seria tecnicamente compatible con frameworks habituales (vLLM, llama.cpp, Ollama, TGI) si los pesos estuvieran publicados, extremo no confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BioMedGPT-LM-7B | 7B | 2.048 | Biomedico (S2ORC) | Apache-2.0 | Repositorio sin pesos publicados (0,0 GB) |
| Llama2-7B-Chat | 7B | 4.096 | Generalista | Llama 2 Community License | Publico en Meta |
| Modelos biomedicos tipo Meditron/PMC-LLaMA | 7B | no disponible | Biomedico | variable | variable |

La comparativa con alternativas biomedicas concretas no puede completarse con datos de rendimiento porque no se han publicado cifras de benchmarks en la informacion disponible. Frente a Llama2-7B-Chat, del que deriva, BioMedGPT-LM-7B reduce el contexto de 4.096 a 2.048 tokens pero especializa el conocimiento en literatura biomedica.

## Limitaciones y advertencias

- El autor prohibe explicitamente el uso del modelo para prestar servicios al publico general.
- Riesgo de alucinacion en contenido medico: no se documentan mecanismos de verificacion ni tasas de error; cualquier salida debe ser revisada por profesionales.
- Sesgos: no documentados en la informacion disponible; el corpus S2ORC puede arrastrar sesgos de la literatura cientifica publicada.
- Limitacion de contexto: 2.048 tokens, insuficiente para documentos largos sin troceado previo.
- Idioma: no se declaran idiomas soportados; el entrenamiento se basa en literatura en ingles, por lo que el rendimiento en castellano es incierto.
- Licencia: Apache-2.0 con politica de uso aceptable adicional que puede restringir ciertos usos; conviene revisar USE_POLICY.md antes de un uso comercial.
- Disponibilidad: el repositorio figura con 0,0 GB y sin pesos aparentes, lo que impide confirmar la reproducibilidad del despliegue.
- Uso en produccion clinica: no apto como sustituto del juicio medico; el propio autor desaconseja el servicio publico.

## Enlaces

- Hugging Face: https://huggingface.co/gmxn/BioMedGPT-LM-7B
- Informe tecnico (arXiv): https://arxiv.org/abs/2308.09442v2
- Repositorio GitHub OpenBioMed: https://github.com/PharMolix/OpenBioMed
- Corpus S2ORC: https://github.com/allenai/s2orc/blob/master/README.md
